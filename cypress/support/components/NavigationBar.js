export default class NavigationBar {
  assertAuthenticatedAs(email) {
    cy.get("nav").within(() => {
      cy.contains("EventHub").should("be.visible");
      cy.contains("Home").should("be.visible");
      cy.contains("Events").should("be.visible");
      cy.contains("My Bookings").should("be.visible");
      cy.contains("API Docs").should("be.visible");
      cy.contains(email).should("be.visible");
      cy.contains("button", "Logout").should("be.visible");
    });
  }

  openEvents() {
    cy.get("nav").contains("Events").click();
  }

  openBookings() {
    cy.get("nav").contains("My Bookings").click();
  }

  openAdminEvents() {
    cy.get("nav").contains("button", "Admin").click();
    cy.get("nav").contains("Manage Events").click();
  }

  logout() {
    cy.get("nav").contains("button", "Logout").click();
  }
}
