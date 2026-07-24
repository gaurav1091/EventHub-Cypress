# Test Data Management

Stateful tests use two cleanup layers.

## Exact-ID Registry

Data created through `EventHubClient` is registered in `reports/test-data-registry.json`.

Registered types:

- `bookings`
- `events`

The framework deletes registered IDs before and after `@stateful` scenarios. This is the primary cleanup
path because it targets only records created by the test run.

## Prefix Fallback

Prefix cleanup remains as a recovery mechanism:

- Booking customers start with `Cypress User`.
- Admin event titles start with `Cypress`.

This removes data from interrupted or older runs where exact IDs were unavailable. Keep generated test
data under these prefixes unless a scenario has a stronger cleanup mechanism.

## Manual Cleanup

Run:

```bash
npm run cleanup:test-data
```

The script deletes registered IDs first, then applies prefix cleanup, then clears the registry.
