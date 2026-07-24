# Contributing

This framework favors small, readable changes that preserve the BDD structure.

## Local Quality Gate

Before opening a pull request, run:

```bash
npm run doctor
npm run lint
npm run format:check
npm run test:smoke
```

For domain changes, also run the matching suite:

```bash
npm run test:auth
npm run test:events
npm run test:bookings
npm run test:admin
npm run test:api
npm run test:hybrid
npm run test:a11y
npm run test:visual
```

## Pull Request Expectations

- Keep feature files business-readable.
- Keep selectors inside page objects or selector helpers.
- Use factories for generated data.
- Tag state-changing tests with `@stateful`.
- Prefer exact-ID cleanup through the API client.
- Update docs when adding a new convention, script, tag, or CI job.

## Review Checklist

- Scenarios are deterministic.
- Data cleanup runs before and after stateful tests.
- API assertions validate contract shape, not only status codes.
- New page interactions belong in page objects.
- CI impact is understood before adding new broad regression coverage.
