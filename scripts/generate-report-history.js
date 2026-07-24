const fs = require("fs");
const path = require("path");

const cucumberJsonPath = path.join("reports", "cucumber", "cucumber-report.json");
const historyDir = path.join("reports", "history");
const latestPath = path.join(historyDir, "latest-summary.json");
const historyPath = path.join(historyDir, "history.json");
const maxHistoryRuns = Number(process.env.EVENTHUB_HISTORY_LIMIT || 100);

function emptySummary() {
  return {
    generatedAt: new Date().toISOString(),
    run: {
      id: process.env.GITHUB_RUN_ID || null,
      attempt: process.env.GITHUB_RUN_ATTEMPT || null,
      job: process.env.GITHUB_JOB || null,
      ref: process.env.GITHUB_REF_NAME || null,
      sha: process.env.GITHUB_SHA || null,
      environment: process.env.EVENTHUB_ENV || "qa",
    },
    totals: {
      features: 0,
      scenarios: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      pending: 0,
      undefined: 0,
      flakyCandidates: 0,
    },
    analytics: {
      slowestScenarios: [],
      failedPreviously: [],
    },
    scenarios: [],
  };
}

function scenarioKey(featureName, scenarioName) {
  return `${featureName} :: ${scenarioName}`;
}

function scenarioStatus(scenario) {
  const statuses = scenario.steps?.map((step) => step.result?.status || "undefined") || [];

  if (statuses.includes("failed")) {
    return "failed";
  }

  if (statuses.includes("undefined")) {
    return "undefined";
  }

  if (statuses.includes("pending")) {
    return "pending";
  }

  if (statuses.includes("skipped")) {
    return "skipped";
  }

  return "passed";
}

function readPreviousSummary() {
  const history = readHistory();
  const previousRun = history.runs.at(-1);

  if (previousRun) {
    return previousRun.summary;
  }

  if (!fs.existsSync(latestPath)) {
    return emptySummary();
  }

  return JSON.parse(fs.readFileSync(latestPath, "utf8"));
}

function readHistory() {
  if (!fs.existsSync(historyPath)) {
    return {
      generatedAt: new Date().toISOString(),
      runs: [],
    };
  }

  return JSON.parse(fs.readFileSync(historyPath, "utf8"));
}

function writeHistory(summary) {
  const history = readHistory();

  history.generatedAt = new Date().toISOString();
  history.runs.push({
    generatedAt: summary.generatedAt,
    run: summary.run,
    summary,
  });
  history.runs = history.runs.slice(-maxHistoryRuns);

  fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
}

function summarize(features, previousSummary = emptySummary()) {
  const summary = emptySummary();
  const previousScenariosByKey = new Map(
    (previousSummary.scenarios || []).map((scenario) => [
      scenario.key || scenarioKey(scenario.feature, scenario.scenario),
      scenario,
    ]),
  );

  summary.totals.features = features.length;

  features.forEach((feature) => {
    feature.elements
      ?.filter((element) => element.type === "scenario")
      .forEach((scenario) => {
        const status = scenarioStatus(scenario);
        const failedStepCount =
          scenario.steps?.filter((step) => step.result?.status === "failed").length || 0;
        const durationNanoseconds =
          scenario.steps?.reduce((total, step) => total + (step.result?.duration || 0), 0) || 0;
        const key = scenarioKey(feature.name, scenario.name);
        const previousScenario = previousScenariosByKey.get(key);
        const durationMs = Math.round(durationNanoseconds / 1_000_000);

        summary.totals.scenarios += 1;
        summary.totals[status] += 1;

        if (
          failedStepCount > 0 &&
          scenario.steps?.some((step) => step.result?.status === "passed")
        ) {
          summary.totals.flakyCandidates += 1;
        }

        summary.scenarios.push({
          key,
          feature: feature.name,
          scenario: scenario.name,
          status,
          previousStatus: previousScenario?.status || null,
          failedPreviously: previousScenario?.status === "failed",
          tags: scenario.tags?.map((tag) => tag.name) || [],
          durationMs,
          previousDurationMs: previousScenario?.durationMs || null,
          durationDeltaMs: previousScenario ? durationMs - previousScenario.durationMs : null,
          attempt: scenario.retry || scenario.attempt || 1,
          failedStepCount,
        });
      });
  });

  summary.analytics.slowestScenarios = [...summary.scenarios]
    .sort((left, right) => right.durationMs - left.durationMs)
    .slice(0, 10)
    .map(({ key, feature, scenario, status, durationMs, tags }) => ({
      key,
      feature,
      scenario,
      status,
      durationMs,
      tags,
    }));
  summary.analytics.failedPreviously = summary.scenarios.filter(
    (scenario) => scenario.failedPreviously,
  );

  return summary;
}

if (!fs.existsSync(cucumberJsonPath) || fs.statSync(cucumberJsonPath).size === 0) {
  fs.mkdirSync(historyDir, { recursive: true });
  fs.writeFileSync(latestPath, JSON.stringify(emptySummary(), null, 2));
  console.warn(
    `Report history generated without Cucumber data. Missing or empty: ${cucumberJsonPath}`,
  );
  process.exit(0);
}

const previousSummary = readPreviousSummary();
const features = JSON.parse(fs.readFileSync(cucumberJsonPath, "utf8"));
const summary = summarize(features, previousSummary);

fs.mkdirSync(historyDir, { recursive: true });
fs.writeFileSync(latestPath, JSON.stringify(summary, null, 2));
writeHistory(summary);

console.log(
  `Report history generated at ${latestPath}: ${summary.totals.passed}/${summary.totals.scenarios} scenarios passed. Persistent runs: ${readHistory().runs.length}.`,
);
