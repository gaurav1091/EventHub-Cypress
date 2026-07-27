## Summary

-

## Validation

- [ ] `npm run doctor`
- [ ] `npm run lint`
- [ ] `npm run format:check`
- [ ] `npm run security:audit`
- [ ] `npm run test:smoke`
- [ ] Domain or impact-specific tests from `npm run impact:list`

## Test Data

- [ ] Stateful scenarios use generated data prefixes from the framework factories.
- [ ] Created bookings/events are registered for exact-ID cleanup where possible.
- [ ] New cleanup behavior is documented in `docs/test-data-management.md`.

## Visual Baselines

- [ ] No visual baselines changed.
- [ ] Visual baseline changes are intentional and reviewed against screenshots/diffs.
- [ ] `npm run test:visual` and `npm run visual:compare` were run for approved baseline changes.
