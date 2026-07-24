import { byTestId } from "../constants/selectors";

Cypress.Commands.add("getByTestId", (testId, options) => {
  return cy.get(byTestId(testId), options);
});

Cypress.Commands.add("findByTestId", { prevSubject: "element" }, (subject, testId, options) => {
  return cy.wrap(subject).find(byTestId(testId), options);
});
