# Visual Smoke Baselines

Visual smoke is intentionally lightweight at this stage. It captures viewport screenshots for the most
important screens so CI artifacts can expose obvious layout regressions.

Run:

```bash
npm run test:visual
npm run visual:compare
```

To intentionally approve the latest captured screenshots as baselines:

```bash
npm run visual:approve
```

Current baseline pages:

- Login.
- Events discovery.
- Event details.
- My Bookings.
- Admin Events.
- Booking confirmation.

## Comparison

`npm run visual:compare` compares captured screenshots under `cypress/screenshots/**/visual/` to
approved baselines in `cypress/visual-baselines`.

Missing baselines are reported but do not fail by default. This keeps visual smoke optional and
low-noise while the UI is still evolving.

Useful environment variables:

- `EVENTHUB_VISUAL_BASELINE_DIR`
- `EVENTHUB_VISUAL_SCREENSHOTS_DIR`
- `EVENTHUB_VISUAL_DIFF_DIR`
- `EVENTHUB_VISUAL_THRESHOLD`
- `EVENTHUB_VISUAL_REQUIRE_BASELINES=true`

When a baseline is intentionally approved, place the matching `.png` in `cypress/visual-baselines`.
The approval script copies the latest `cypress/screenshots/**/visual/*.png` files into that folder
using the stable screenshot file names.
