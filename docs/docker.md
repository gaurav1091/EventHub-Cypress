# Docker Execution

The Docker setup mirrors the Python project pattern: build one test image, load credentials from
`.env`, run headless tests, and write reports back to the local workspace.

## Build

```bash
npm run docker:build
```

or:

```bash
docker compose build
```

## Run Smoke

```bash
npm run docker:smoke
```

This runs `npm run test:smoke` inside the container.

GitHub Actions also runs this path in the `Docker Smoke` job to prove containerized execution.

## Run Targeted Suites

```bash
npm run docker:regression
npm run docker:api
npm run docker:a11y
npm run docker:visual
```

You can also run any project command directly:

```bash
docker compose run --rm eventhub-cypress npm run test:bookings
docker compose run --rm eventhub-cypress npm run test:admin
docker compose run --rm eventhub-cypress npm run cleanup:test-data
```

## Environment

Docker Compose loads `.env` and passes the same framework environment variables used locally and in CI:

```text
EVENTHUB_ENV
EVENTHUB_BASE_URL
EVENTHUB_API_BASE_URL
EVENTHUB_USER_EMAIL
EVENTHUB_USER_PASSWORD
EVENTHUB_TEST_DATA_NAMESPACE
```

Override values at runtime when needed:

```bash
EVENTHUB_ENV=prod-smoke docker compose run --rm eventhub-cypress npm run test:prod-smoke
EVENTHUB_TEST_DATA_NAMESPACE=docker-bookings docker compose run --rm eventhub-cypress npm run test:bookings
```

## Reports And Artifacts

The container writes these paths back to the host:

```text
reports/
cypress/screenshots/
cypress/videos/
cypress/downloads/
```

Generate local report outputs after a Docker run:

```bash
docker compose run --rm eventhub-cypress npm run report:html
docker compose run --rm eventhub-cypress npm run report:history
```

## Image

The image is based on:

```text
cypress/included:14.5.4
```

That keeps the container Cypress version aligned with `package.json`.
