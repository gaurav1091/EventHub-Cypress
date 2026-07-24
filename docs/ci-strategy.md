# CI Strategy

GitHub Actions uses a gate-first, domain-split pipeline.

## Doctor Gate

`npm run doctor` runs before Cypress jobs. It validates:

- Supported Node version.
- Known `EVENTHUB_ENV` profile.
- Required credentials.
- Cypress binary availability.
- EventHub API health.
- EventHub API login.

If this job fails, Cypress jobs do not start. That keeps noisy browser failures from hiding environment
or credential problems.

## Cypress Matrix

The Cypress job runs independent matrix legs:

- `smoke-chrome`
- `smoke-electron`
- `regression-auth-events`
- `regression-bookings-admin`
- `regression-api-hybrid`
- `accessibility-chrome`
- `visual-chrome`

Each leg uploads its own reports, screenshots, and videos. Domain-splitting makes failures easier to
triage and gives the project a path toward true parallelization if Cypress Cloud or another orchestrator
is added later.
