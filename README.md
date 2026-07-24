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

```bash
npm test
npm run test:smoke
npm run test:auth
npm run test:events
npm run test:bookings
npm run test:admin
npm run test:api
```

Current verified suites:

- Smoke: 8 passing scenarios across Auth, Events, Bookings, Admin, and API.
- Regression: 18 passing UI scenarios across Auth, Events, Bookings, and Admin.

The npm scripts intentionally unset `ELECTRON_RUN_AS_NODE` because that variable makes Cypress's
Electron runner launch incorrectly on this machine.

## Framework Principles

- Features describe business behavior in Gherkin.
- Step definitions orchestrate flows; they do not hold locators.
- Page objects own page-level locators and interactions.
- Support commands own cross-cutting Cypress behavior such as login sessions.
- Test data factories generate unique data for state-changing tests.
- Credentials and environment URLs come from `.env`, never committed files.
- Reports, screenshots, videos, and Cucumber messages are written under `reports/`.
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
