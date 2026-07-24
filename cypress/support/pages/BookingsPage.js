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

  assertBookingNotVisible(eventName) {
    cy.contains("h3", eventName).should("not.exist");
  }

  openFirstBookingDetails() {
    cy.contains("button", "View Details").first().click();
  }

  assertBookingDetails(eventName, customer) {
    cy.contains(eventName).should("be.visible");
    cy.contains(customer.fullName).should("be.visible");
    cy.contains(customer.email).should("be.visible");
    cy.contains("Event Details").should("be.visible");
    cy.contains("Customer Details").should("be.visible");
    cy.contains("Payment Summary").should("be.visible");
  }

  cancelFirstBooking() {
    cy.contains("button", "Cancel Booking").first().click();
    cy.contains("button", "Yes, cancel it").click();
  }

  clearAllBookingsIfPresent() {
    cy.get("body").then(($body) => {
      if ($body.text().includes("Clear all bookings")) {
        cy.on("window:confirm", () => true);
        cy.contains("button", "Clear all bookings").click();
      }
    });
  }

  assertNoBookingsForCustomer(customer) {
    cy.get("body").should("not.contain", customer.fullName);
  }

  assertEmptyOrNoCypressBookings() {
    cy.get("body").should("not.contain", "Cypress User");
  }
}
