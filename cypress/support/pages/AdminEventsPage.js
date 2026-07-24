import routes from "../constants/routes";

export default class AdminEventsPage {
  visit() {
    cy.visit(routes.adminEvents);
    this.assertLoaded();
  }

  assertLoaded() {
    cy.contains("h2", "+ New Event").should("be.visible");
    cy.contains("h2", "All Events").should("be.visible");
  }

  createEvent(event) {
    cy.findByLabelOrPlaceholder("Title", "Event title").clear().type(event.title);
    cy.get("textarea").clear().type(event.description);
    cy.get("select").select(event.category);
    cy.findByLabelOrPlaceholder("City", "e.g. Bangalore").clear().type(event.city);
    cy.findByLabelOrPlaceholder("Venue", "Venue name & address").clear().type(event.venue);
    cy.get('input[type="datetime-local"]').clear().type(event.dateTime);
    cy.findByLabelOrPlaceholder("Price", "").clear().type(event.price);
    cy.findByLabelOrPlaceholder("Total Seats", "").clear().type(event.totalSeats);
    cy.contains("button", "+ Add Event").click();
  }

  submitEmptyEventForm() {
    cy.contains("button", "+ Add Event").click();
  }

  assertRequiredFieldValidation() {
    cy.findByLabelOrPlaceholder("Title", "Event title").should("match", ":invalid");
    cy.get('input[type="datetime-local"]').should("match", ":invalid");
    cy.findByLabelOrPlaceholder("Price", "").should("match", ":invalid");
    cy.findByLabelOrPlaceholder("Total Seats", "").should("match", ":invalid");
  }

  assertEventInTable(eventTitle) {
    cy.contains("tr", eventTitle).should("be.visible");
  }

  assertReadOnlySeededEvents() {
    ["Dilli Diwali Mela", "Hollywood Monsoon Night", "World Tech Summit"].forEach((eventTitle) => {
      cy.contains("tr", eventTitle).contains("Read-only").should("be.visible");
    });
  }

  assertUserEventLimitEnforced(limit = 6) {
    cy.get("body").then(($body) => {
      const pageText = $body.text();
      const addButton = [...$body.find("button")].find((button) =>
        button.innerText.includes("+ Add Event"),
      );

      const hasLimitMessage = new RegExp(
        `(limit|max|maximum|only).*${limit}|${limit}.*events`,
        "i",
      ).test(pageText);
      const addButtonDisabled = addButton?.disabled === true;

      expect(
        hasLimitMessage || addButtonDisabled,
        `Expected the admin page to show a ${limit}-event limit message or disable event creation.`,
      ).to.eq(true);
    });
  }
}
