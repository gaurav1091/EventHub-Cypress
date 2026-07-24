# Accessibility Smoke

Accessibility smoke tests use `cypress-axe` and `axe-core`.

The current gate checks authenticated core pages for serious and critical violations:

- Events
- My Bookings
- Admin Events

Run locally:

```bash
npm run test:a11y -- --browser chrome
```

Known product issues are listed in `cypress/support/accessibility/knownViolations.js`. The smoke test
fails on new serious or critical violations that are not in that known-issue list.

Current known issues:

- `Events` page: `select-name`
- `My Bookings` page: `color-contrast`

When the application markup is fixed, remove the matching known-issue entry and rerun the
accessibility suite.
