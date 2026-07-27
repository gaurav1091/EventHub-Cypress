const fs = require("fs");
const path = require("path");

const combinedSummaryPath =
  process.env.EVENTHUB_COMBINED_SUMMARY_PATH ||
  path.join("reports", "combined", "combined-summary.json");
const stepSummaryPath = process.env.GITHUB_STEP_SUMMARY;

if (!stepSummaryPath) {
  console.log("GITHUB_STEP_SUMMARY is not set. Skipping GitHub step summary.");
  process.exit(0);
}

if (!fs.existsSync(combinedSummaryPath)) {
  console.log(`Combined summary not found at ${combinedSummaryPath}. Skipping step summary.`);
  process.exit(0);
}

const summary = JSON.parse(fs.readFileSync(combinedSummaryPath, "utf8"));
const failedJobs = summary.jobs.filter((job) => (job.totals?.failed || 0) > 0);
const slowestScenarios = summary.analytics.slowestScenarios.slice(0, 10);

const lines = [
  "## EventHub Cypress Report",
  "",
  `Run: ${summary.run?.id || "local"} attempt ${summary.run?.attempt || "n/a"}`,
  "",
  "| Metric | Count |",
  "| --- | ---: |",
  `| Scenarios | ${summary.totals.scenarios} |`,
  `| Passed | ${summary.totals.passed} |`,
  `| Failed | ${summary.totals.failed} |`,
  `| Skipped | ${summary.totals.skipped} |`,
  `| Pending | ${summary.totals.pending} |`,
  "",
  "### Jobs",
  "",
  "| Job | Passed | Failed | Skipped | Scenarios |",
  "| --- | ---: | ---: | ---: | ---: |",
  ...summary.jobs.map(
    (job) =>
      `| ${job.name} | ${job.totals?.passed || 0} | ${job.totals?.failed || 0} | ${
        job.totals?.skipped || 0
      } | ${job.totals?.scenarios || 0} |`,
  ),
  "",
  "### Slowest Scenarios",
  "",
  "| Scenario | Job | Duration ms | Status |",
  "| --- | --- | ---: | --- |",
  ...slowestScenarios.map(
    (scenario) =>
      `| ${scenario.scenario} | ${scenario.job} | ${scenario.durationMs} | ${scenario.status} |`,
  ),
  "",
];

if (failedJobs.length > 0) {
  lines.push(
    "### Failed Jobs",
    "",
    ...failedJobs.map((job) => `- ${job.name}: ${job.totals.failed} failed scenario(s)`),
    "",
  );
}

fs.appendFileSync(stepSummaryPath, `${lines.join("\n")}\n`);
console.log(`GitHub step summary updated from ${combinedSummaryPath}.`);
