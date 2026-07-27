# EventHub Cypress BDD Automation Framework

UI-first Cypress JavaScript framework for `https://eventhub.rahulshettyacademy.com`, built with BDD and an enterprise-ready folder structure.

## Quick Start

```bash
npm install
cp .env.example .env
npm run cy:open
```

Set your registered EventHub credentials in `.env`:

```bash
EVENTHUB_USER_EMAIL=your_registered_email@example.com
EVENTHUB_USER_PASSWORD=your_password
```

## Run Tests

| Command                     | Scope                      | Typical use                                        |
| --------------------------- | -------------------------- | -------------------------------------------------- |
| `npm run cy:open`           | Interactive Cypress runner | Local debugging and authoring                      |
| `npm run cy:run`            | All feature specs          | Full local execution                               |
| `npm run doctor`            | Framework health checks    | Validates Node, Cypress, profile, credentials, API |
| `npm run wait:app`          | UI reachability preflight  | Waits for configured `baseUrl` before Cypress      |
| `npm run impact:list`       | Test impact analysis       | Maps changed files to impacted regression domains  |
| `npm run test:smoke`        | `@smoke` scenarios         | Pull request and quick confidence run              |
| `npm run test:regression`   | `@regression` scenarios    | Broader functional regression                      |
| `npm run test:auth`         | Auth feature specs         | Login and route-guard checks                       |
| `npm run test:events`       | Events feature specs       | Discovery, search, and filtering checks            |
| `npm run test:bookings`     | Booking feature specs      | Booking lifecycle and validation checks            |
| `npm run test:admin`        | Admin feature specs        | Event management checks                            |
| `npm run test:api`          | API feature specs          | API contract and support-client checks             |
| `npm run test:hybrid`       | Hybrid feature specs       | API-created data verified through the UI           |
| `npm run test:a11y`         | Accessibility specs        | Axe serious/critical accessibility smoke           |
| `npm run test:visual`       | Visual smoke specs         | Captures baseline screenshots for core pages       |
| `npm run docker:build`      | Docker image build         | Builds the Cypress execution image                 |
| `npm run docker:smoke`      | Docker smoke run           | Runs smoke tests in the container                  |
| `npm run docker:regression` | Docker regression run      | Runs regression tests in the container             |
| `npm run test:qa:smoke`     | QA `@smoke` scenarios      | Explicit QA profile smoke run                      |
| `npm run test:stage:smoke`  | Stage `@smoke` scenarios   | Future stage profile smoke run                     |
| `npm run test:prod-smoke`   | `@smoke and not @stateful` | Future production-safe smoke run                   |
| `npm run report:html`       | Cucumber messages to HTML  | Generates `reports/cucumber/cucumber-report.html`  |
| `npm run report:history`    | Report history summary     | Generates status, duration, and slowest-test data  |
| `npm run report:combined`   | Combined CI report summary | Aggregates downloaded matrix report artifacts      |
| `npm run report:dashboard`  | Combined HTML dashboard    | Generates `reports/combined/index.html`            |
| `npm run security:audit`    | Dependency audit           | Fails on critical npm advisories                   |
| `npm run visual:compare`    | Visual comparison          | Compares screenshots to approved baselines         |
| `npm run visual:approve`    | Visual baseline approval   | Promotes latest visual screenshots to baselines    |

Manual GitHub Actions runs expose dropdowns for suite, smoke browser, environment, and report
publishing. The published dashboard URL is unique per workflow run attempt, for example
`runs/<run_id>-<run_attempt>/`, so a manually selected suite does not show stale numbers from a
different run.

Current verified suites:

- Smoke: 8 passing scenarios across Auth, Events, Bookings, Admin, and API.
- Regression: 37 passing scenarios across Auth, Events, Bookings, Admin, API, Hybrid, and Accessibility.
- Visual: 3 passing scenarios covering Login, Events, Event Detail, My Bookings, Admin, and Booking Confirmation baselines.

The npm scripts intentionally unset `ELECTRON_RUN_AS_NODE` because that variable makes Cypress's
Electron runner launch incorrectly on this machine.

## Environment Profiles

Profiles live in `config/environments.json` and are selected with `EVENTHUB_ENV`.

| Profile      | Purpose                              | Notes                                         |
| ------------ | ------------------------------------ | --------------------------------------------- |
| `qa`         | Current active execution profile     | Default profile                               |
| `stage`      | Future staging execution profile     | Update URLs when a real stage endpoint exists |
| `prod-smoke` | Future production-safe smoke profile | Intended for non-stateful smoke checks only   |

Direct environment variables still take precedence over profile values:

```bash
EVENTHUB_ENV=qa npm run test:smoke
EVENTHUB_BASE_URL=https://eventhub.rahulshettyacademy.com npm run test:smoke
```

GitHub Actions should provide these values through repository secrets:

```text
EVENTHUB_BASE_URL
EVENTHUB_API_BASE_URL
EVENTHUB_USER_EMAIL
EVENTHUB_USER_PASSWORD
```

CI runs `npm run wait:app` before Cypress jobs. This makes EventHub UI reachability an explicit
preflight gate before Cypress performs its own `baseUrl` availability check.

## Cleanup Strategy

State-changing scenarios are tagged with `@stateful`. The framework runs API cleanup before and after
each `@stateful` scenario. Data created through the API client is registered in
`reports/test-data-registry.json` and removed by exact ID first. Prefix cleanup then runs as a fallback
for any state that was created before registration or left behind by an interrupted run.

Current generated data prefixes:

- Booking customers: `Cypress User`
- Admin events: `Cypress`

For manual cleanup during local maintenance, run:

```bash
npm run cleanup:test-data
```

## Reporting

The framework keeps Badeball/Cucumber JSON and message outputs enabled:

```text
reports/cucumber/cucumber-report.json
reports/cucumber/messages.ndjson
reports/cucumber/cucumber-report.html
reports/history/latest-summary.json
reports/history/history.json
reports/combined/combined-summary.json
reports/combined/history.json
reports/combined/index.html
reports/combined/pr-comment.md
reports/test-data-registry.json
```

Run `npm run report:html` after a Cypress run to generate the HTML report locally. GitHub Actions
also runs this step with `if: always()` so failed test runs still upload the available report assets.
Run `npm run report:history` to generate machine-readable latest and persistent trend summaries with
scenario duration, previous-status metadata, and slowest-scenario details.
In CI, the report-summary job also restores and updates `reports/combined/history.json` so combined
run-level trends can persist across workflow runs on the same branch. The same job generates
`reports/combined/index.html`, a static dashboard for reviewing job totals, failures, slowest
scenarios, and recent run history from the uploaded combined artifact. On trusted `main` runs, CI also
publishes that dashboard through GitHub Pages when Pages is configured for GitHub Actions. Published
dashboards are stored under unique run-attempt paths and copied to `latest/`.
Pull request runs do not publish Pages, but CI updates a sticky PR comment with the combined totals and
the `cypress-reports-combined` artifact reference.

## Enterprise Conventions

- Route paths are centralized in `cypress/support/constants/routes.js`.
- Selector helper commands are centralized in `cypress/support/utils/selectors.js`.
- Selector policy is documented in `docs/selector-strategy.md`.
- Accessibility policy is documented in `docs/accessibility.md`.
- CI matrix strategy is documented in `docs/ci-strategy.md`.
- Dependency governance is documented in `docs/dependency-governance.md`.
- Docker execution is documented in `docs/docker.md`.
- Framework architecture is documented in `docs/framework-architecture.md`.
- Published report dashboards are documented in `docs/report-dashboard.md`.
- Contribution standards are documented in `docs/contributing.md`.
- BDD authoring standards are documented in `docs/test-authoring-guide.md`.
- Tagging standards are documented in `docs/tagging-strategy.md`.
- Test impact strategy is documented in `docs/test-impact-strategy.md`.
- Test data lifecycle is documented in `docs/test-data-management.md`.
- Visual smoke baselines are documented in `docs/visual-smoke.md`.
- Cypress retries run only in CI; local run mode stays retry-free for faster failure feedback.
- GitHub Actions runs separate doctor, lint, impact, security, smoke, regression, accessibility, visual, and report-summary jobs.
- Accessibility smoke uses axe and fails on serious or critical violations.
- Report history writes scenario status, duration, previous-result metadata, and slowest scenarios to `reports/history/latest-summary.json`.
- API contracts are validated with JSON Schema through AJV.
- Visual comparison is optional and compares captured screenshots to `cypress/visual-baselines`.

## Framework Principles

- Features describe business behavior in Gherkin.
- Step definitions orchestrate flows; they do not hold locators.
- Page objects own page-level locators and interactions.
- Support commands own cross-cutting Cypress behavior such as login sessions.
- Test data factories generate unique data for state-changing tests.
- Credentials and environment URLs come from `.env`, never committed files.
- Reports, screenshots, videos, and Cucumber messages are written under `reports/`.
- HTML report output is generated from Badeball/Cucumber messages without adding a competing Cypress reporter.
- Screenshots and videos are retained as Cypress run artifacts for failed-run analysis.
- API support has a dedicated namespace so the framework can grow into hybrid UI + API testing.
- Stateful tests use recognizable Cypress data prefixes so API cleanup can remove generated data.

## Current Structure

```text
EventHubAutomation-Cypress/
  cypress/
    e2e/
      features/
        api/
        auth/
        accessibility/
        events/
        bookings/
        admin/
        hybrid/
        visual/
      step_definitions/
    fixtures/
      test-data/
    support/
      api/
      components/
      data/
      flows/
      pages/
      utils/
  config/
  docs/
  reports/
```

See [Test Scenarios](docs/test-scenarios.md) and [Framework Roadmap](docs/framework-roadmap.md).
