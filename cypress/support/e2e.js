import "cypress-axe";
import "./utils/formControls";
import "./utils/selectors";
import "./commands";

beforeEach(() => {
  cy.viewport(1440, 900);
});
