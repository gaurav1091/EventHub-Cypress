import { Then, When } from "@badeball/cypress-cucumber-preprocessor";
import AdminEventsPage from "../../../support/pages/AdminEventsPage";
import BookingsPage from "../../../support/pages/BookingsPage";
import EventDetailPage from "../../../support/pages/EventDetailPage";
import EventsPage from "../../../support/pages/EventsPage";

const eventsPage = new EventsPage();
const eventDetailPage = new EventDetailPage();
const bookingsPage = new BookingsPage();
const adminEventsPage = new AdminEventsPage();
const capturedBaselines = [];

function captureBaseline(name) {
  capturedBaselines.push(name);
  cy.screenshot(`visual/${name}`, { capture: "viewport" });
}

When("I capture the Events page visual baseline", () => {
  eventsPage.visit();
  eventsPage.assertEventVisible("Dilli Diwali Mela");
  captureBaseline("events-page");
});

When("I capture the Event Details page visual baseline for {string}", (eventName) => {
  eventsPage.visit();
  eventsPage.openEventFromTitle(eventName);
  eventDetailPage.assertLoaded(eventName);
  captureBaseline("event-detail-page");
});

When("I capture the My Bookings page visual baseline", () => {
  bookingsPage.visit();
  captureBaseline("bookings-page");
});

When("I capture the Admin Events page visual baseline", () => {
  adminEventsPage.visit();
  captureBaseline("admin-events-page");
});

Then("the visual baselines should be captured", () => {
  expect(capturedBaselines).to.deep.eq([
    "events-page",
    "event-detail-page",
    "bookings-page",
    "admin-events-page",
  ]);
});
