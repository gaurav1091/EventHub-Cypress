import { Then, When } from "@badeball/cypress-cucumber-preprocessor";
import AdminEventsPage from "../../../support/pages/AdminEventsPage";
import EventsPage from "../../../support/pages/EventsPage";
import { eventPayload } from "../../../support/data/TestDataFactory";
import EventHubClient from "../../../support/api/EventHubClient";

const adminEventsPage = new AdminEventsPage();
const eventsPage = new EventsPage();
const eventHubClient = new EventHubClient();
let currentEvent;

When("I open the Admin Events page", () => {
  adminEventsPage.visit();
});

Then("the Admin Events page should be ready for event management", () => {
  adminEventsPage.assertLoaded();
});

When("I create a new admin event", () => {
  currentEvent = eventPayload();

  adminEventsPage.visit();
  adminEventsPage.createEvent(currentEvent);
});

When("I submit the admin event form without required fields", () => {
  adminEventsPage.submitEmptyEventForm();
});

Then("the admin event form should show required field validation", () => {
  adminEventsPage.assertRequiredFieldValidation();
});

Then("the new event should appear in the admin events table", () => {
  adminEventsPage.assertEventInTable(currentEvent.title);
});

Then("I should see read-only seeded events", () => {
  adminEventsPage.assertReadOnlySeededEvents();
});

When("I search for the new admin event in discovery", () => {
  eventsPage.visit();
  eventsPage.search(currentEvent.title);
});

When("I search and filter for the new admin event in discovery", () => {
  eventsPage.visit();
  eventsPage.filterByCategory(currentEvent.category);
  eventsPage.filterByCity(currentEvent.city);
  eventsPage.search(currentEvent.title);
});

Then("I should see the new admin event in discovery", () => {
  eventsPage.assertEventVisible(currentEvent.title);
});

When("I create the maximum allowed admin events through the API", () => {
  const events = Array.from({ length: 6 }, (_value, index) =>
    eventPayload({
      title: `Cypress Limit Event ${Date.now()} ${index + 1}`,
    }),
  );

  eventHubClient.login().then(() => {
    cy.wrap(events, { log: false }).each((event) => {
      eventHubClient.createEvent(event).its("status").should("be.oneOf", [200, 201]);
    });
  });
});

Then("the admin event limit should be enforced", () => {
  adminEventsPage.assertUserEventLimitEnforced();
});
