export default class LoginPage {
  visit() {
    cy.visit("/login");
    this.assertLoaded();
  }

  assertLoaded() {
    cy.contains("h1", "Sign in to EventHub").should("be.visible");
    cy.findByLabelOrPlaceholder("Email", "you@email.com").should("be.visible");
    cy.findByLabelOrPlaceholder("Password", "••••••").should("be.visible");
  }

  login(email, password) {
    cy.findByLabelOrPlaceholder("Email", "you@email.com").clear().type(email);
    cy.findByLabelOrPlaceholder("Password", "••••••").clear().type(password, { log: false });
    cy.contains("button", "Sign In").click();
  }

  submitEmptyForm() {
    cy.contains("button", "Sign In").click();
  }

  assertNativeValidation() {
    cy.contains("Enter a valid email").should("be.visible");
    cy.contains("Password must be at least 6 characters").should("be.visible");
  }

  assertError(message) {
    cy.contains(message).should("be.visible");
  }
}
