Cypress.Commands.add("findByLabelOrPlaceholder", (label, placeholder) => {
  const labelMatcher = label ? new RegExp(label, "i") : null;

  return cy.get("body").then(($body) => {
    if (placeholder && $body.find(`[placeholder="${placeholder}"]`).length) {
      return cy.get(`[placeholder="${placeholder}"]`);
    }

    if (labelMatcher) {
      return cy
        .contains("label, div, span", labelMatcher)
        .parent()
        .find("input, textarea, select")
        .first();
    }

    throw new Error(
      `Could not find a form control for label "${label}" or placeholder "${placeholder}".`,
    );
  });
});
