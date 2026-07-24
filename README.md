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

| Command                    | Scope                      | Typical use                                       |
| -------------------------- | -------------------------- | ------------------------------------------------- |
| `npm run cy:open`          | Interactive Cypress runner | Local debugging and authoring                     |
| `npm run cy:run`           | All feature specs          | Full local execution                              |
| `npm run test:smoke`       | `@smoke` scenarios         | Pull request and quick confidence run             |
| `npm run test:regression`  | `@regression` scenarios    | Broader functional regression                     |
| `npm run test:auth`        | Auth feature specs         | Login and route-guard checks                      |
| `npm run test:events`      | Events feature specs       | Discovery, search, and filtering checks           |
| `npm run test:bookings`    | Booking feature specs      | Booking lifecycle and validation checks           |
| `npm run test:admin`       | Admin feature specs        | Event management checks                           |
| `npm run test:api`         | API feature specs          | API smoke and support-client checks               |
| `npm run test:hybrid`      | Hybrid feature specs       | API-created data verified through the UI          |
| `npm run test:qa:smoke`    | QA `@smoke` scenarios      | Explicit QA profile smoke run                     |
| `npm run test:stage:smoke` | Stage `@smoke` scenarios   | Future stage profile smoke run                    |
| `npm run test:prod-smoke`  | `@smoke and not @stateful` | Future production-safe smoke run                  |
| `npm run report:html`      | Cucumber messages to HTML  | Generates `reports/cucumber/cucumber-report.html` |

Current verified suites:

- Smoke: 8 passing scenarios across Auth, Events, Bookings, Admin, and API.
- Regression: 18 passing UI scenarios across Auth, Events, Bookings, and Admin.

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

## Cleanup Strategy

State-changing scenarios are tagged with `@stateful`. The framework runs API cleanup before and after
each `@stateful` scenario, removing generated bookings and user-created admin events by their Cypress
test-data prefixes.

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
```

Run `npm run report:html` after a Cypress run to generate the HTML report locally. GitHub Actions
also runs this step with `if: always()` so failed test runs still upload the available report assets.

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
        events/
        bookings/
        admin/
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
