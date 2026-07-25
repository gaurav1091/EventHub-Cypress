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

- Booking customers start with `Cypress User <namespace>`.
- Admin event titles start with `Cypress <namespace>`.

This removes data from interrupted or older runs where exact IDs were unavailable. Keep generated test
data under these prefixes unless a scenario has a stronger cleanup mechanism.

In GitHub Actions, each Cypress matrix leg receives a unique `EVENTHUB_TEST_DATA_NAMESPACE`. This keeps
parallel jobs from deleting each other's generated bookings or admin events while still allowing prefix
fallback cleanup inside the same job.

## Manual Cleanup

Run:

```bash
npm run cleanup:test-data
```

The script deletes registered IDs first, then applies prefix cleanup, then clears the registry.
