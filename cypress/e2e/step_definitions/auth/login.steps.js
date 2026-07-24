import { Given, Then, When } from "@badeball/cypress-cucumber-preprocessor";
import LoginPage from "../../../support/pages/LoginPage";
import NavigationBar from "../../../support/components/NavigationBar";
import routes from "../../../support/constants/routes";

const loginPage = new LoginPage();
const navigationBar = new NavigationBar();

Given("I am on the EventHub login page", () => {
  loginPage.visit();
});

When("I sign in with valid registered credentials", () => {
  loginPage.login(Cypress.env("userEmail"), Cypress.env("userPassword"));
});

When("I sign in with password {string}", (password) => {
  loginPage.login(Cypress.env("userEmail"), password);
});

Then("I should see the authenticated navigation", () => {
  navigationBar.assertAuthenticatedAs(Cypress.env("userEmail"));
});

When("I sign out", () => {
  navigationBar.logout();
});

Then("I should be returned to the login page", () => {
  loginPage.assertLoaded();
});

When("I submit the login form without credentials", () => {
  loginPage.submitEmptyForm();
});

Then("I should remain on the login page", () => {
  cy.location("pathname").should("eq", routes.login);
  loginPage.assertLoaded();
});

Then("the login form should show required field validation", () => {
  cy.location("pathname").should("eq", routes.login);
  loginPage.assertNativeValidation();
});

Then("I should see a login error", () => {
  cy.location("pathname").should("eq", routes.login);
  cy.get("body").should("contain.text", "Invalid");
});

When("I open the registration page from login", () => {
  cy.contains("a", "Register").click();
});

Then("I should be on the registration page", () => {
  cy.location("pathname").should("eq", routes.register);
  cy.contains(/register|create/i).should("be.visible");
});

Given("I am an anonymous visitor", () => {
  cy.clearAllCookies();
  cy.clearAllLocalStorage();
  cy.window().then((window) => window.sessionStorage.clear());
});

When("I directly open protected route {string}", (route) => {
  cy.visit(route);
});
