# Test Authoring Guide

BDD tests should describe EventHub behavior at the user or API-client level.

## Feature Files

Write scenarios in business language:

```gherkin
@events @ui @regression
Scenario: User can search for an event by title
  Given I am signed in to EventHub
  When I search events for "Dilli Diwali Mela"
  Then I should see event "Dilli Diwali Mela"
```

Avoid locators, CSS details, timing, or implementation wording in Gherkin.

## Step Definitions

Step definitions should orchestrate:

- Page object methods.
- API client calls.
- Test data factories.
- High-level assertions.

They should not become large locator-heavy scripts.

## Page Objects

Page objects own:

- Page navigation.
- Locators.
- User interactions.
- Page-level assertions.

Shared selectors should use `cypress/support/constants/selectors.js` or helper commands when the app
exposes stable `data-testid` attributes.

## Test Data

Use `cypress/support/data/TestDataFactory.js` for generated data. For stateful API-created records,
use `EventHubClient` so created IDs are registered for exact cleanup.

## API Tests

API tests should validate:

- Status code.
- Success/error shape.
- Required fields.
- Field types and formats.
- Business constraints.

Negative API cases should be safe and should not create persistent state.

When adding or changing API coverage:

- Add or update the operation in `cypress/fixtures/contracts/eventhub-api-contract.json`.
- Add or update the matching schema under `cypress/support/api/schemas/`.
- Assert the operation with `assertResponseMatchesContract`.
- Prefer unauthenticated requests, invalid payloads, and unknown IDs for negative testing.

## Governance Checks

Run these before opening a PR for framework-level changes:

```bash
npm run doctor:framework
npm run framework:inventory
```

The governance doctor catches missing docs, missing scripts, duplicate scenario names, missing tags,
contract drift, and cleanup hook drift.
