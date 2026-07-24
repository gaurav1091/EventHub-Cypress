export default class BookingsPage {
  visit() {
    cy.visit("/bookings");
    this.assertLoaded();
  }

  assertLoaded() {
    cy.contains("h1", "My Bookings").should("be.visible");
  }

  assertBookingVisible(eventName) {
    cy.contains("h3", eventName).should("be.visible");
  }

  openFirstBookingDetails() {
    cy.contains("button", "View Details").first().click();
  }

  cancelFirstBooking() {
    cy.contains("button", "Cancel Booking").first().click();
  }

  clearAllBookingsIfPresent() {
    cy.get("body").then(($body) => {
      if ($body.text().includes("Clear all bookings")) {
        cy.contains("button", "Clear all bookings").click();
      }
    });
  }

  assertEmptyOrNoCypressBookings() {
    cy.get("body").should("not.contain", "Cypress User");
  }
}
