import { Before, Then, When } from "@badeball/cypress-cucumber-preprocessor";
import AdminEventsPage from "../../../support/pages/AdminEventsPage";
import BookingsPage from "../../../support/pages/BookingsPage";
import EventsPage from "../../../support/pages/EventsPage";
import { isKnownAccessibilityViolation } from "../../../support/accessibility/knownViolations";

const eventsPage = new EventsPage();
const bookingsPage = new BookingsPage();
const adminEventsPage = new AdminEventsPage();
let accessibilityViolations = [];

Before({ tags: "@accessibility" }, () => {
  accessibilityViolations = [];
});

function checkCurrentPageA11y(pageName) {
  cy.injectAxe();
  cy.checkA11y(
    null,
    {
      includedImpacts: ["serious", "critical"],
    },
    (violations) => {
      accessibilityViolations.push(
        ...violations.map((violation) => ({
          pageName,
          id: violation.id,
          impact: violation.impact,
          description: violation.description,
          nodes: violation.nodes.length,
        })),
      );
    },
    true,
  );
}

When("I check the accessibility of the Events page", () => {
  eventsPage.visit();
  checkCurrentPageA11y("Events");
});

When("I check the accessibility of the My Bookings page", () => {
  bookingsPage.visit();
  checkCurrentPageA11y("My Bookings");
});

When("I check the accessibility of the Admin Events page", () => {
  adminEventsPage.visit();
  checkCurrentPageA11y("Admin Events");
});

Then("no serious accessibility violations should be reported", () => {
  const unexpectedViolations = accessibilityViolations.filter(
    (violation) => !isKnownAccessibilityViolation(violation),
  );

  expect(unexpectedViolations).to.deep.eq([]);
});
