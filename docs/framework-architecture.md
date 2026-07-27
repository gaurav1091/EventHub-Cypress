# Framework Architecture

The framework is organized as layered BDD automation.

```text
Gherkin Features
  -> Step Definitions
    -> Page Objects / API Facade
      -> Cypress Commands / Data Factories / Selectors
        -> EventHub UI + API

Reporting
  -> Badeball Cucumber JSON/messages
  -> HTML report
  -> Latest summary
  -> Persistent history
  -> Combined CI artifact summary

State Management
  -> Test data factories
  -> Exact-ID registry
  -> Prefix fallback cleanup

Quality Gates
  -> doctor
  -> lint
  -> smoke
  -> regression domain matrix
  -> accessibility
  -> visual smoke
  -> report summary
```

## BDD Layer

Feature files describe business behavior with tags that control execution scope. Step definitions
orchestrate flows and delegate page interactions to page objects or API actions to `EventHubClient`.

## UI Layer

Page objects own locators, navigation, and page-level assertions. Selector strategy is documented in
`docs/selector-strategy.md`.

## API Layer

`EventHubClient` is the facade over domain clients:

- `AuthApi`
- `EventsApi`
- `BookingsApi`
- `AdminEventsApi`

API assertions use JSON Schema validation through AJV, plus focused business assertions for values such
as seeded events, booking references, quantity, and valid event dates.

## Data Layer

Stateful tests create data through factories and API/client helpers. Created bookings and events are
registered by exact ID in `reports/test-data-registry.json`, then cleaned by exact ID before prefix
fallback cleanup.

## Reporting Layer

Each Cypress run writes:

- Cucumber JSON
- Cucumber messages
- HTML report
- `reports/history/latest-summary.json`
- `reports/history/history.json`

CI also generates `reports/combined/combined-summary.json` from downloaded matrix artifacts.
`reports/combined/index.html` is generated from the combined JSON as a static run dashboard for
reviewing totals, failures, slowest scenarios, and recent trend history.

## CI Layer

GitHub Actions separates environment validation, linting, smoke tests, domain regression, accessibility,
visual smoke, and report consolidation. Smoke is a fast gate; regression domains can scale horizontally
as coverage grows.
