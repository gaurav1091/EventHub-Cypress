import { Given } from "@badeball/cypress-cucumber-preprocessor";

Given("I am signed in to EventHub", () => {
  cy.login();
});
