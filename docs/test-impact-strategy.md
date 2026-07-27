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

The current CI still runs the reliable smoke and regression gates. Impact analysis is advisory until
the project has enough trend history to safely skip non-impacted domains on pull requests.
