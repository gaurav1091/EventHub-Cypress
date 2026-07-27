# Report Dashboard

The framework produces both machine-readable report data and a human-readable combined dashboard.

## Local Generation

After a Cypress run, generate the normal Cucumber report and history files:

```bash
npm run report:html
npm run report:history
```

For combined CI artifacts, the report-summary job downloads all `cypress-reports-*` artifacts and then
runs:

```bash
npm run report:combined
npm run report:dashboard
```

The dashboard is written to:

```text
reports/combined/index.html
```

## Published Dashboard

On trusted `main` workflow runs, GitHub Actions publishes `reports/combined` through GitHub Pages.
Pull request runs do not publish pages because they may come from untrusted branches; they still upload
the combined report bundle as a workflow artifact and update a sticky PR comment with the combined
result summary.

Repository setup required:

1. Open repository Settings.
2. Open Pages.
3. Set Build and deployment source to GitHub Actions.

After that, the `Deploy Report Dashboard` job publishes a run-specific dashboard URL in the job
environment and the workflow summary.

Published paths:

```text
runs/<run_id>-<run_attempt>/
latest/
```

The run-specific path is the canonical link for a workflow result. It preserves the numbers generated
for the suite, browser, and environment choices used in that workflow dispatch instead of showing a
later run's dashboard.

## Dashboard Contents

The static dashboard shows:

- Total scenario count, pass rate, passed, failed, skipped, and flaky candidate counts.
- Per-job scenario totals from the CI matrix.
- Failed scenarios across all downloaded artifacts.
- Slowest scenarios for performance triage.
- Recent run history restored from the branch-level CI cache.

The dashboard is generated from JSON files only. It does not require a server, database, or external
reporting service.

## Pull Request Comments

Pull request runs generate:

```text
reports/combined/pr-comment.md
```

The `report-summary` job uses `actions/github-script` to create or update one sticky PR comment marked
with `<!-- eventhub-cypress-report -->`. The comment includes run selection metadata, scenario totals,
failed scenarios, slowest scenarios, and a pointer to the `cypress-reports-combined` artifact.
