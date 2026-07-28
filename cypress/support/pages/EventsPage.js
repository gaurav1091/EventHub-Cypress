import routes from "../constants/routes";

export default class EventsPage {
  visit() {
    cy.visit(routes.events);
    this.assertLoaded();
  }

  assertLoaded() {
    cy.contains("h1", "Upcoming Events").should("be.visible");
    cy.get('input[placeholder="Search events, venues…"]').should("be.visible");
  }

  search(value) {
    cy.get('input[placeholder="Search events, venues…"]').clear().type(value);
  }

  filterByCategory(category) {
    cy.get("select").eq(0).select(category);
  }

  filterByCity(city) {
    cy.get("select").eq(1).select(city);
  }

  clearFilters() {
    cy.contains("button", "Clear filters").click();
  }

  openEvent(eventName) {
    cy.contains("article", eventName).within(() => {
      cy.contains(eventName).click();
    });
  }

  openEventFromTitle(eventName) {
    cy.contains("article", eventName).within(() => {
      cy.contains("h2, h3, a", eventName).click();
    });
  }

  bookEvent(eventName) {
    cy.contains("article", eventName).within(() => {
      cy.contains("Book Now").click();
    });
  }

  openEventFromBookNow(eventName) {
    this.bookEvent(eventName);
  }

  assertEventVisible(eventName) {
    cy.contains("article", eventName).should("be.visible");
  }

  assertEventCardDetails(eventName, details = {}) {
    cy.contains("article", eventName).within(() => {
      cy.contains(eventName).should("be.visible");
      cy.contains("Book Now").should("be.visible");

      if (details.category) {
        cy.contains(details.category).should("be.visible");
      }

      if (details.city) {
        cy.contains(details.city).should("be.visible");
      }

      if (details.price) {
        cy.contains(details.price).should("be.visible");
      }

      cy.contains(/\d+\s+seats left/i).should("be.visible");
    });
  }

  assertEventNotVisible(eventName) {
    cy.contains("article", eventName).should("not.exist");
  }

  assertEventSoldOutOrUnavailable(eventName) {
    cy.contains("article", eventName).then(($article) => {
      const text = $article.text();
      const bookButton = [...$article.find("button")].find((button) =>
        /book now/i.test(button.innerText),
      );

      const showsNoSeats = /(sold out|0\s+seats|no\s+seats|unavailable)/i.test(text);
      const cannotBook = !bookButton || bookButton.disabled === true;

      expect(
        showsNoSeats || cannotBook,
        `Expected ${eventName} to show a sold-out state or disable booking.`,
      ).to.eq(true);
    });
  }

  assertNoEventsFound() {
    cy.contains("No events found").should("be.visible");
  }

  assertEventCountAtLeast(count) {
    cy.get("article").should("have.length.at.least", count);
  }
}
