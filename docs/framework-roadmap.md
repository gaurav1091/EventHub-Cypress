# Framework Roadmap

## Phase 1: UI BDD Foundation

- Cypress 14 JavaScript project with Badeball Cucumber.
- Page object model split into pages and reusable components.
- Login session reuse through `cy.session`.
- Tags for smoke, regression, stateful, auth, events, bookings, and admin.
- Cucumber JSON/message reports.
- `.env` driven configuration.

## Phase 2: Stability And Maintainability

- Expand API cleanup for bookings and admin-created events.
- Add test-id locator preference where the app exposes stable attributes.
- Add custom assertions for common EventHub UI patterns.
- Add lint and format checks in CI.
- Add retry-aware artifact retention for screenshots/videos.

## Phase 3: Hybrid UI + API Framework

- Expand API client wrappers under `cypress/support/api`.
- Add contract validation helpers for API responses.
- Use API setup for data-heavy UI tests.
- Add UI/API parity checks.

## Phase 4: Enterprise Enhancements

- GitHub Actions matrix for Chrome, Electron, and selected tags.
- Parallel execution strategy by feature area.
- Test impact tagging and release gates.
- Accessibility smoke checks.
- Visual smoke checks for login, events, booking, and admin pages.
- Flakiness dashboard from report history.
