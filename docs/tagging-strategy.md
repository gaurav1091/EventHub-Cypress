# Tagging Strategy

Tags control execution, reporting, and cleanup behavior.

## Execution Tags

| Tag              | Purpose                                    |
| ---------------- | ------------------------------------------ |
| `@smoke`         | Fast confidence checks for critical paths. |
| `@regression`    | Broader behavioral coverage.               |
| `@accessibility` | Axe accessibility smoke checks.            |
| `@visual`        | Screenshot-based visual smoke baselines.   |

## Domain Tags

| Tag         | Purpose                                                |
| ----------- | ------------------------------------------------------ |
| `@auth`     | Login, logout, registration navigation, route guards.  |
| `@events`   | Event listing, search, filters, event cards.           |
| `@bookings` | Booking form, confirmation, My Bookings lifecycle.     |
| `@admin`    | Admin event management.                                |
| `@api`      | API-only coverage.                                     |
| `@hybrid`   | API setup or assertions combined with UI verification. |
| `@ui`       | Browser-driven UI coverage.                            |

## Risk Tags

| Tag         | Purpose                                                         |
| ----------- | --------------------------------------------------------------- |
| `@stateful` | Creates or deletes application data and triggers cleanup hooks. |
| `@negative` | Validates safe rejection/error behavior.                        |

## Rules

- Every scenario should have at least one execution tag and one domain tag.
- Add `@stateful` whenever a scenario creates bookings or admin events.
- Do not tag destructive or high-noise scenarios as `@smoke`.
- Keep production-safe runs limited to non-stateful smoke scenarios.
