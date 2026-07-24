import routes from "../constants/routes";

export default class HomePage {
  visit() {
    cy.visit(routes.home);
  }

  assertLoaded() {
    cy.contains("h1", "Discover & Book Amazing Events").should("be.visible");
    cy.contains("Featured").should("be.visible");
    cy.contains("Browse Events").should("be.visible");
    cy.contains("My Bookings").should("be.visible");
  }
}
