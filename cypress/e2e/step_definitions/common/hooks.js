import { After, Before } from "@badeball/cypress-cucumber-preprocessor";

Before({ tags: "@stateful" }, () => {
  cy.cleanupTestData();
});

After({ tags: "@stateful" }, () => {
  cy.cleanupTestData();
});
