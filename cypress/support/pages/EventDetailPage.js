export default class EventDetailPage {
  assertLoaded(eventName) {
    cy.contains("h1", eventName).should("be.visible");
    cy.contains("h2", "Book Tickets").should("exist");
    cy.contains("button", "Confirm Booking").should("be.visible");
  }

  increaseTickets(times = 1) {
    for (let count = 0; count < times; count += 1) {
      cy.contains("button", "+").click();
    }
  }

  decreaseTickets(times = 1) {
    for (let count = 0; count < times; count += 1) {
      cy.contains("button", "−").click();
    }
  }

  assertTicketQuantity(quantity) {
    cy.contains("button", "+").parent().contains(String(quantity)).should("be.visible");
  }

  assertDecrementDisabled() {
    cy.contains("button", "−").should("be.disabled");
  }

  assertTotalContains(amount) {
    cy.contains("Total").parent().contains(amount).should("be.visible");
  }

  fillBookingForm(customer) {
    cy.findByLabelOrPlaceholder("Full Name", "Your full name").clear().type(customer.fullName);
    cy.findByLabelOrPlaceholder("Email", "you@email.com").clear().type(customer.email);
    cy.findByLabelOrPlaceholder("Phone Number", "+91 98765 43210").clear().type(customer.phone);
  }

  confirmBooking() {
    cy.contains("button", "Confirm Booking").click();
  }

  submitEmptyBookingForm() {
    cy.contains("button", "Confirm Booking").click();
  }

  assertBookingFormValidation() {
    cy.findByLabelOrPlaceholder("Full Name", "Your full name").should("match", ":invalid");
    cy.findByLabelOrPlaceholder("Email", "you@email.com").should("match", ":invalid");
    cy.findByLabelOrPlaceholder("Phone Number", "+91 98765 43210").should("match", ":invalid");
  }

  assertCustomerEmailInvalid() {
    cy.findByLabelOrPlaceholder("Email", "you@email.com").should("match", ":invalid");
  }

  assertCustomerPhoneInvalid() {
    cy.contains("Enter a valid 10-digit phone").should("be.visible");
  }

  assertBookingConfirmed(customer) {
    cy.contains("h3", "Booking Confirmed!").should("be.visible");
    cy.contains("Customer").parent().contains(customer.fullName).should("be.visible");
    cy.contains("Booking Ref")
      .parent()
      .invoke("text")
      .should("match", /[A-Z]-[A-Z0-9]{6}/);
  }

  viewMyBookings() {
    cy.contains("button", "View My Bookings").click();
  }
}
