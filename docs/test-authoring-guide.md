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
