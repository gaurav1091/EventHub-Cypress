# Test Impact Strategy

Test impact analysis maps changed files to the smallest useful regression domain set.

```bash
npm run impact:list
```

The command writes:

```text
reports/impact/impact-summary.json
```

## Domains

| Domain          | Specs                                                                          |
| --------------- | ------------------------------------------------------------------------------ |
| `auth-events`   | `cypress/e2e/features/auth/*.feature`, `cypress/e2e/features/events/*.feature` |
| `bookings`      | `cypress/e2e/features/bookings/*.feature`                                      |
| `admin`         | `cypress/e2e/features/admin/*.feature`                                         |
| `api-hybrid`    | `cypress/e2e/features/api/*.feature`, `cypress/e2e/features/hybrid/*.feature`  |
| `accessibility` | `cypress/e2e/features/accessibility/*.feature`                                 |
| `visual`        | `cypress/e2e/features/visual/*.feature`                                        |

## Full Regression Triggers

Shared framework changes trigger a full regression recommendation:

- GitHub workflow changes.
- Cypress config changes.
- Package or lockfile changes.
- Environment profile changes.
- Shared commands, constants, utilities, and test-data factories.
- Common hooks and cleanup scripts.

## CI Behavior

The `Impact Analysis` job publishes impacted domains and specs to the GitHub step summary and uploads
`reports/impact/impact-summary.json`.

Smoke always runs as the fast confidence gate.

On `pull_request` workflows, CI uses the impact output to run only impacted regression domains. Shared
framework changes set `full_regression=true`, which runs every regression domain. When no regression
domain is impacted, the regression matrix is skipped after smoke.

On `push` to `main` and `workflow_dispatch`, CI keeps the full regression, accessibility, and visual
suite enabled so the mainline signal remains complete.
