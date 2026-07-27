const fs = require("fs");
const path = require("path");

const combinedSummaryPath =
  process.env.EVENTHUB_COMBINED_SUMMARY_PATH ||
  path.join("reports", "combined", "combined-summary.json");
const outputPath =
  process.env.EVENTHUB_PR_COMMENT_PATH || path.join("reports", "combined", "pr-comment.md");
const marker = "<!-- eventhub-cypress-report -->";

function readSummary() {
  if (!fs.existsSync(combinedSummaryPath)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(combinedSummaryPath, "utf8"));
}

function percent(part, total) {
  if (!total) {
    return "0%";
  }

  return `${Math.round((part / total) * 100)}%`;
}

function escapeMarkdown(value) {
  return String(value ?? "")
    .replaceAll("|", "\\|")
    .replaceAll("\n", " ")
    .trim();
}

function buildComment(summary) {
  const totals = summary?.totals || {};
  const run = summary?.run || {};
  const workflowUrl = [
    process.env.GITHUB_SERVER_URL || "https://github.com",
    process.env.GITHUB_REPOSITORY,
    "actions/runs",
    process.env.GITHUB_RUN_ID,
  ]
    .filter(Boolean)
    .join("/");
  const slowestScenarios = summary?.analytics?.slowestScenarios?.slice(0, 5) || [];
  const failedScenarios = summary?.analytics?.failedScenarios?.slice(0, 10) || [];

  const lines = [
    marker,
    "## EventHub Cypress Report",
    "",
    `Run: [${process.env.GITHUB_RUN_ID || run.id || "local"}](${workflowUrl})`,
    "",
    "| Selection | Value |",
    "| --- | --- |",
    `| Suite | ${escapeMarkdown(run.suite || "auto")} |`,
    `| Browser | ${escapeMarkdown(run.browser || "matrix")} |`,
    `| Environment | ${escapeMarkdown(run.environment || "qa")} |`,
    `| Report artifact | \`cypress-reports-combined\` |`,
    "",
    "| Metric | Count |",
    "| --- | ---: |",
    `| Pass rate | ${percent(totals.passed || 0, totals.scenarios || 0)} |`,
    `| Scenarios | ${totals.scenarios || 0} |`,
    `| Passed | ${totals.passed || 0} |`,
    `| Failed | ${totals.failed || 0} |`,
    `| Skipped | ${totals.skipped || 0} |`,
    "",
  ];

  if (failedScenarios.length > 0) {
    lines.push(
      "### Failed Scenarios",
      "",
      "| Scenario | Job |",
      "| --- | --- |",
      ...failedScenarios.map(
        (scenario) => `| ${escapeMarkdown(scenario.scenario)} | ${escapeMarkdown(scenario.job)} |`,
      ),
      "",
    );
  }

  if (slowestScenarios.length > 0) {
    lines.push(
      "### Slowest Scenarios",
      "",
      "| Scenario | Job | Duration ms |",
      "| --- | --- | ---: |",
      ...slowestScenarios.map(
        (scenario) =>
          `| ${escapeMarkdown(scenario.scenario)} | ${escapeMarkdown(scenario.job)} | ${
            scenario.durationMs || 0
          } |`,
      ),
      "",
    );
  }

  lines.push(
    "Open the workflow run above and download `cypress-reports-combined` for the full HTML dashboard, Cucumber report, screenshots, and videos.",
    "",
  );

  return `${lines.join("\n")}\n`;
}

const summary = readSummary();

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, buildComment(summary));

console.log(`PR report comment generated at ${outputPath}.`);
