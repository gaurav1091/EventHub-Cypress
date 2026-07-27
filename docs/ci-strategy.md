# CI Strategy

GitHub Actions uses a gate-first, domain-split pipeline.

## Doctor Gate

`npm run doctor` runs before Cypress jobs. It validates:

- Supported Node version.
- Known `EVENTHUB_ENV` profile.
- Required credentials.
- Cypress binary availability.
- Report folder availability.
- EventHub API health.
- EventHub API login.

If this job fails, Cypress jobs do not start. That keeps noisy browser failures from hiding environment
or credential problems.

## Pipeline Jobs

The workflow uses separate jobs:

- `doctor`
- `lint`
- `security`
- `smoke`
- `regression`
- `accessibility`
- `visual`
- `report-summary`

## Cypress Matrix Legs

Every Cypress job runs `npm run wait:app` first. This checks the configured EventHub UI `baseUrl`
before Cypress starts, so temporary site reachability issues appear as a named preflight gate instead
of only as Cypress's internal base URL verification retry message.

Smoke runs in both Chrome and Electron. Regression is split by domain:

- `auth-events`
- `bookings`
- `admin`
- `api-hybrid`

Each leg uploads its own reports, screenshots, and videos. Domain-splitting makes failures easier to
triage and gives the project a path toward true parallelization if Cypress Cloud or another orchestrator
is added later.

Visual smoke runs after regression and accessibility instead of alongside them. This keeps the optional
visual signal lower-noise and avoids adding extra load to the shared EventHub environment while the
functional gates are still running. The visual command gets one delayed retry for transient base URL
reachability issues.

`report-summary` downloads all `cypress-reports-*` artifacts and republishes a combined bundle for
easier run-level review. It also generates `reports/combined/combined-summary.json`, which aggregates
scenario totals and slowest scenarios across all downloaded matrix artifacts.

The report-summary job restores `reports/combined/history.json` from the branch-level GitHub Actions
cache before generating the combined summary. `scripts/generate-combined-report-summary.js` appends the
current run to that history and the cache post-job save makes the updated trend history available to
the next workflow run on the same branch.

The `security` job runs `npm run security:audit` after dependency installation. The current gate blocks
critical advisories so CI catches severe supply-chain risk without destabilizing the suite on existing
moderate/high transitive advisories that need separate upgrade planning.
