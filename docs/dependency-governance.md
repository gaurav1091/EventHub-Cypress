# Dependency Governance

Dependency changes should be deliberate because this framework controls browser automation, credentials,
reports, and cleanup flows.

## Policy

- Use `npm ci` in CI for lockfile-deterministic installs.
- Keep `package-lock.json` committed.
- Keep `engine-strict=true` so unsupported Node versions fail early.
- Run `npm run security:audit` before merging dependency changes.
- Treat critical advisories as blocking.
- Track moderate/high transitive advisories as planned upgrade work when the safe fix requires a
  breaking framework upgrade.

## Automation

Dependabot is configured for:

- npm dependencies.
- GitHub Actions.

Dependency PRs are grouped by tool family so Cypress, BDD, lint, accessibility, and visual tooling can
be reviewed coherently.

## Upgrade Checklist

1. Run `npm ci`.
2. Run `npm run doctor`.
3. Run `npm run lint`.
4. Run `npm run security:audit`.
5. Run `npm run test:smoke`.
6. Run the impacted domains from `npm run impact:list`.
7. Run full regression before major Cypress, Cucumber, or Node changes.

## Current Known Advisory Posture

The CI audit gate currently fails on critical advisories. Existing moderate/high transitive advisories
from Cypress/Badeball dependency chains require planned upgrade testing because automated force-fixes
can downgrade or break major framework packages.
