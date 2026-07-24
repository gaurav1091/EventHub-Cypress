# Visual Smoke Baselines

Visual smoke is intentionally lightweight at this stage. It captures viewport screenshots for the most
important screens so CI artifacts can expose obvious layout regressions.

Run:

```bash
npm run test:visual
```

Current baseline pages:

- Events discovery.
- Event details.
- My Bookings.
- Admin Events.

The current implementation captures screenshots only. A later upgrade can add pixel comparison,
thresholds, and approved baseline storage once the functional suite is stable.
