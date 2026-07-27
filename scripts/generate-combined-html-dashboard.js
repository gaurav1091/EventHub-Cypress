const fs = require("fs");
const path = require("path");

const reportDir = process.env.EVENTHUB_COMBINED_REPORT_DIR || path.join("reports", "combined");
const summaryPath =
  process.env.EVENTHUB_COMBINED_SUMMARY_PATH || path.join(reportDir, "combined-summary.json");
const historyPath =
  process.env.EVENTHUB_COMBINED_HISTORY_PATH || path.join(reportDir, "history.json");
const outputPath =
  process.env.EVENTHUB_COMBINED_DASHBOARD_PATH || path.join(reportDir, "index.html");

function readJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) {
    return fallback;
  }

  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function statusClass(status) {
  return status === "failed" ? "status-failed" : "status-passed";
}

function tableRows(rows, emptyMessage) {
  if (rows.length === 0) {
    return `<tr><td colspan="5" class="empty">${escapeHtml(emptyMessage)}</td></tr>`;
  }

  return rows.join("\n");
}

function metricCard(label, value, tone = "") {
  return `
    <section class="metric ${tone}">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </section>`;
}

function buildDashboard(summary, history) {
  const totals = summary.totals || {};
  const jobs = summary.jobs || [];
  const failedScenarios = summary.analytics?.failedScenarios || [];
  const slowestScenarios = summary.analytics?.slowestScenarios || [];
  const historyRuns = [...(history.runs || [])].slice(-10).reverse();
  const passRate =
    totals.scenarios > 0 ? `${Math.round(((totals.passed || 0) / totals.scenarios) * 100)}%` : "0%";

  const jobRows = tableRows(
    jobs.map(
      (job) => `
        <tr>
          <td>${escapeHtml(job.name)}</td>
          <td>${escapeHtml(job.totals?.scenarios || 0)}</td>
          <td>${escapeHtml(job.totals?.passed || 0)}</td>
          <td>${escapeHtml(job.totals?.failed || 0)}</td>
          <td>${escapeHtml(job.totals?.skipped || 0)}</td>
        </tr>`,
    ),
    "No job summaries were found.",
  );

  const failedRows = tableRows(
    failedScenarios.slice(0, 20).map(
      (scenario) => `
        <tr>
          <td>${escapeHtml(scenario.scenario)}</td>
          <td>${escapeHtml(scenario.feature)}</td>
          <td>${escapeHtml(scenario.job)}</td>
          <td>${escapeHtml(scenario.durationMs || 0)}</td>
          <td><span class="pill ${statusClass(scenario.status)}">${escapeHtml(scenario.status)}</span></td>
        </tr>`,
    ),
    "No failed scenarios in this combined run.",
  );

  const slowestRows = tableRows(
    slowestScenarios.slice(0, 15).map(
      (scenario) => `
        <tr>
          <td>${escapeHtml(scenario.scenario)}</td>
          <td>${escapeHtml(scenario.feature)}</td>
          <td>${escapeHtml(scenario.job)}</td>
          <td>${escapeHtml(scenario.durationMs || 0)}</td>
          <td><span class="pill ${statusClass(scenario.status)}">${escapeHtml(scenario.status)}</span></td>
        </tr>`,
    ),
    "No scenario duration data was found.",
  );

  const historyRows = tableRows(
    historyRuns.map((run) => {
      const runTotals = run.totals || {};
      const runPassRate =
        runTotals.scenarios > 0
          ? `${Math.round(((runTotals.passed || 0) / runTotals.scenarios) * 100)}%`
          : "0%";

      return `
        <tr>
          <td>${escapeHtml(run.generatedAt)}</td>
          <td>${escapeHtml(run.run?.id || "local")}</td>
          <td>${escapeHtml(runPassRate)}</td>
          <td>${escapeHtml(runTotals.scenarios || 0)}</td>
          <td>${escapeHtml(runTotals.failed || 0)}</td>
        </tr>`;
    }),
    "No persistent run history was found.",
  );

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>EventHub Cypress Report</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #f7f8fa;
        --panel: #ffffff;
        --text: #17202a;
        --muted: #687385;
        --line: #dce2ea;
        --pass: #0f7b45;
        --fail: #bf2e24;
        --warn: #b56800;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        background: var(--bg);
        color: var(--text);
        font-family:
          Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      main {
        max-width: 1180px;
        margin: 0 auto;
        padding: 32px 20px 48px;
      }

      header {
        margin-bottom: 24px;
      }

      h1 {
        margin: 0 0 8px;
        font-size: 32px;
        line-height: 1.15;
      }

      h2 {
        margin: 0 0 12px;
        font-size: 20px;
      }

      p {
        margin: 0;
        color: var(--muted);
      }

      .metrics {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 12px;
        margin: 24px 0;
      }

      .metric,
      .panel {
        border: 1px solid var(--line);
        border-radius: 8px;
        background: var(--panel);
      }

      .metric {
        padding: 16px;
      }

      .metric span {
        display: block;
        color: var(--muted);
        font-size: 13px;
      }

      .metric strong {
        display: block;
        margin-top: 6px;
        font-size: 28px;
      }

      .metric.pass strong {
        color: var(--pass);
      }

      .metric.fail strong {
        color: var(--fail);
      }

      .panel {
        margin-top: 16px;
        overflow: hidden;
      }

      .panel-heading {
        padding: 18px 18px 0;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 10px;
      }

      th,
      td {
        border-top: 1px solid var(--line);
        padding: 11px 14px;
        text-align: left;
        vertical-align: top;
      }

      th {
        color: var(--muted);
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
      }

      td {
        font-size: 14px;
      }

      .empty {
        color: var(--muted);
      }

      .pill {
        display: inline-block;
        border-radius: 999px;
        padding: 3px 9px;
        font-size: 12px;
        font-weight: 700;
      }

      .status-passed {
        background: #e7f6ee;
        color: var(--pass);
      }

      .status-failed {
        background: #fdebea;
        color: var(--fail);
      }

      @media (max-width: 720px) {
        main {
          padding: 24px 12px 36px;
        }

        table {
          display: block;
          overflow-x: auto;
          white-space: nowrap;
        }
      }
    </style>
  </head>
  <body>
    <main>
      <header>
        <h1>EventHub Cypress Report</h1>
        <p>
          Generated ${escapeHtml(summary.generatedAt)} for run
          ${escapeHtml(summary.run?.id || "local")} attempt ${escapeHtml(summary.run?.attempt || "n/a")}.
        </p>
      </header>

      <section class="metrics" aria-label="Run metrics">
        ${metricCard("Pass Rate", passRate, totals.failed > 0 ? "fail" : "pass")}
        ${metricCard("Scenarios", totals.scenarios || 0)}
        ${metricCard("Passed", totals.passed || 0, "pass")}
        ${metricCard("Failed", totals.failed || 0, totals.failed > 0 ? "fail" : "")}
        ${metricCard("Skipped", totals.skipped || 0)}
        ${metricCard("Flaky Candidates", totals.flakyCandidates || 0, totals.flakyCandidates > 0 ? "fail" : "")}
      </section>

      <section class="panel">
        <div class="panel-heading">
          <h2>Job Summary</h2>
          <p>Matrix-level totals from all downloaded Cypress artifacts.</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Job</th>
              <th>Scenarios</th>
              <th>Passed</th>
              <th>Failed</th>
              <th>Skipped</th>
            </tr>
          </thead>
          <tbody>${jobRows}</tbody>
        </table>
      </section>

      <section class="panel">
        <div class="panel-heading">
          <h2>Failures</h2>
          <p>Scenario failures across the combined run.</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Scenario</th>
              <th>Feature</th>
              <th>Job</th>
              <th>Duration ms</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>${failedRows}</tbody>
        </table>
      </section>

      <section class="panel">
        <div class="panel-heading">
          <h2>Slowest Scenarios</h2>
          <p>Useful first stops when a suite starts getting heavy.</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Scenario</th>
              <th>Feature</th>
              <th>Job</th>
              <th>Duration ms</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>${slowestRows}</tbody>
        </table>
      </section>

      <section class="panel">
        <div class="panel-heading">
          <h2>Recent Runs</h2>
          <p>Persistent branch-level trend data restored by the CI cache.</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Generated At</th>
              <th>Run</th>
              <th>Pass Rate</th>
              <th>Scenarios</th>
              <th>Failed</th>
            </tr>
          </thead>
          <tbody>${historyRows}</tbody>
        </table>
      </section>
    </main>
  </body>
</html>
`;
}

const fallbackSummary = {
  generatedAt: new Date().toISOString(),
  run: {},
  totals: {},
  jobs: [],
  analytics: {},
};
const summary = readJson(summaryPath, fallbackSummary);
const history = readJson(historyPath, { runs: [] });

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, buildDashboard(summary, history));

console.log(`Combined HTML dashboard generated at ${outputPath}.`);
