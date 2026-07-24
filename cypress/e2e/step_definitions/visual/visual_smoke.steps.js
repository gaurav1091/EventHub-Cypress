import { Then, When } from "@badeball/cypress-cucumber-preprocessor";
import AdminEventsPage from "../../../support/pages/AdminEventsPage";
import BookingsPage from "../../../support/pages/BookingsPage";
import EventDetailPage from "../../../support/pages/EventDetailPage";
import EventsPage from "../../../support/pages/EventsPage";
import LoginPage from "../../../support/pages/LoginPage";
import { bookingCustomer } from "../../../support/data/TestDataFactory";

const eventsPage = new EventsPage();
const eventDetailPage = new EventDetailPage();
const bookingsPage = new BookingsPage();
const adminEventsPage = new AdminEventsPage();
const loginPage = new LoginPage();
const capturedBaselines = [];

function captureBaseline(name) {
  capturedBaselines.push(name);
  cy.screenshot(`visual/${name}`, { capture: "viewport" });
}

When("I capture the Login page visual baseline", () => {
  loginPage.visit();
  captureBaseline("login-page");
});

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

When("I capture the Booking Confirmation visual baseline for {string}", (eventName) => {
  const customer = bookingCustomer();

  eventsPage.visit();
  eventsPage.openEventFromBookNow(eventName);
  eventDetailPage.assertLoaded(eventName);
  eventDetailPage.fillBookingForm(customer);
  eventDetailPage.confirmBooking();
  eventDetailPage.assertBookingConfirmed(customer);
  captureBaseline("booking-confirmation-page");
});

Then("the login visual baseline should be captured", () => {
  expect(capturedBaselines).to.include("login-page");
});

Then("the visual baselines should be captured", () => {
  expect(capturedBaselines).to.include.members([
    "events-page",
    "event-detail-page",
    "bookings-page",
    "admin-events-page",
  ]);
});

Then("the booking confirmation visual baseline should be captured", () => {
  expect(capturedBaselines).to.include("booking-confirmation-page");
});
