const fs = require("fs");
const path = require("path");

const cucumberJsonPath = path.join("reports", "cucumber", "cucumber-report.json");
const historyDir = path.join("reports", "history");
const latestPath = path.join(historyDir, "latest-summary.json");

function emptySummary() {
  return {
    generatedAt: new Date().toISOString(),
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
    scenarios: [],
  };
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

function summarize(features) {
  const summary = emptySummary();
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

        summary.totals.scenarios += 1;
        summary.totals[status] += 1;

        if (
          failedStepCount > 0 &&
          scenario.steps?.some((step) => step.result?.status === "passed")
        ) {
          summary.totals.flakyCandidates += 1;
        }

        summary.scenarios.push({
          feature: feature.name,
          scenario: scenario.name,
          status,
          tags: scenario.tags?.map((tag) => tag.name) || [],
          durationMs: Math.round(durationNanoseconds / 1_000_000),
          failedStepCount,
        });
      });
  });

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

const features = JSON.parse(fs.readFileSync(cucumberJsonPath, "utf8"));
const summary = summarize(features);

fs.mkdirSync(historyDir, { recursive: true });
fs.writeFileSync(latestPath, JSON.stringify(summary, null, 2));

console.log(
  `Report history generated at ${latestPath}: ${summary.totals.passed}/${summary.totals.scenarios} scenarios passed.`,
);
