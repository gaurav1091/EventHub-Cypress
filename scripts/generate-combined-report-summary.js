const fs = require("fs");
const path = require("path");

const artifactRoot = process.env.EVENTHUB_ARTIFACT_ROOT || "combined-artifacts";
const outputDir = process.env.EVENTHUB_COMBINED_REPORT_DIR || path.join("reports", "combined");
const outputPath = path.join(outputDir, "combined-summary.json");

function findFiles(root, fileName) {
  if (!fs.existsSync(root)) {
    return [];
  }

  const entries = fs.readdirSync(root, { withFileTypes: true });

  return entries.flatMap((entry) => {
    const entryPath = path.join(root, entry.name);

    if (entry.isDirectory()) {
      return findFiles(entryPath, fileName);
    }

    return entry.name === fileName ? [entryPath] : [];
  });
}

function emptyTotals() {
  return {
    features: 0,
    scenarios: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    pending: 0,
    undefined: 0,
    flakyCandidates: 0,
  };
}

function addTotals(target, source) {
  Object.keys(target).forEach((key) => {
    target[key] += source[key] || 0;
  });
}

function artifactName(summaryPath) {
  return path.relative(artifactRoot, summaryPath).split(path.sep)[0];
}

const summaryPaths = findFiles(artifactRoot, "latest-summary.json");
const combined = {
  generatedAt: new Date().toISOString(),
  artifactRoot,
  totals: emptyTotals(),
  jobs: [],
  analytics: {
    slowestScenarios: [],
    failedScenarios: [],
  },
};

summaryPaths.forEach((summaryPath) => {
  const summary = JSON.parse(fs.readFileSync(summaryPath, "utf8"));
  const name = artifactName(summaryPath);

  addTotals(combined.totals, summary.totals || emptyTotals());
  combined.jobs.push({
    name,
    summaryPath,
    totals: summary.totals,
    scenarios: summary.scenarios || [],
  });
});

combined.analytics.slowestScenarios = combined.jobs
  .flatMap((job) =>
    job.scenarios.map((scenario) => ({
      job: job.name,
      ...scenario,
    })),
  )
  .sort((left, right) => right.durationMs - left.durationMs)
  .slice(0, 15);

combined.analytics.failedScenarios = combined.jobs.flatMap((job) =>
  job.scenarios
    .filter((scenario) => scenario.status === "failed")
    .map((scenario) => ({
      job: job.name,
      ...scenario,
    })),
);

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(combined, null, 2)}\n`);

console.log(
  `Combined report generated at ${outputPath}: ${combined.totals.passed}/${combined.totals.scenarios} scenarios passed across ${combined.jobs.length} artifacts.`,
);
