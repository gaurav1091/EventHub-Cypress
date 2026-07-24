# Selector Strategy

Use selectors in this order:

1. Stable `data-cy` attributes for application-owned controls and repeated components.
2. Accessible labels, placeholders, roles, and user-facing text for business-readable BDD flows.
3. Scoped CSS selectors only inside page objects when the UI does not expose a better contract.

Avoid selectors tied to styling classes, layout position, or generated DOM structure unless they are
wrapped in a page object and there is no practical alternative.

Preferred examples:

```js
cy.getByTestId("event-card");
cy.findByLabelOrPlaceholder("Email", "you@email.com");
cy.contains("button", "Confirm Booking");
```

The current EventHub app does not expose `data-cy` attributes consistently, so the framework uses
page objects and business-facing text selectors today. When the app can be changed, add `data-cy`
attributes first to:

- navigation links
- event cards
- booking cards
- admin event form fields
- action buttons

Keep raw selectors inside page objects or support utilities. Step definitions should describe user
intent and orchestrate page-object methods.
