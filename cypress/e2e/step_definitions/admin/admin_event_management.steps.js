import { Then, When } from "@badeball/cypress-cucumber-preprocessor";
import AdminEventsPage from "../../../support/pages/AdminEventsPage";
import EventsPage from "../../../support/pages/EventsPage";
import { eventPayload } from "../../../support/data/TestDataFactory";

const adminEventsPage = new AdminEventsPage();
const eventsPage = new EventsPage();
let currentEvent;

When("I open the Admin Events page", () => {
  adminEventsPage.visit();
});

When("I create a new admin event", () => {
  currentEvent = eventPayload();

  adminEventsPage.visit();
  adminEventsPage.createEvent(currentEvent);
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

Then("I should see the new admin event in discovery", () => {
  eventsPage.assertEventVisible(currentEvent.title);
});
