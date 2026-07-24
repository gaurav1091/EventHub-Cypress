export default class AdminEventsPage {
  visit() {
    cy.visit("/admin/events");
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

  assertEventInTable(eventTitle) {
    cy.contains("tr", eventTitle).should("be.visible");
  }

  assertReadOnlySeededEvents() {
    ["Dilli Diwali Mela", "Hollywood Monsoon Night", "World Tech Summit"].forEach((eventTitle) => {
      cy.contains("tr", eventTitle).contains("Read-only").should("be.visible");
    });
  }
}
