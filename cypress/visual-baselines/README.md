# Visual Baselines

Approved visual baseline images live here.

Current naming convention matches screenshots captured by `npm run test:visual`:

- `login-page.png`
- `events-page.png`
- `event-detail-page.png`
- `bookings-page.png`
- `admin-events-page.png`
- `booking-confirmation-page.png`

`npm run visual:compare` compares current screenshots under `cypress/screenshots/**/visual/` to this
folder when baselines exist. Missing baselines are reported but do not fail by default.

Set `EVENTHUB_VISUAL_REQUIRE_BASELINES=true` to make missing baselines fail the comparison.
