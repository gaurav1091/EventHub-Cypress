import { Then, When } from "@badeball/cypress-cucumber-preprocessor";
import EventsPage from "../../../support/pages/EventsPage";
import EventDetailPage from "../../../support/pages/EventDetailPage";
import BookingsPage from "../../../support/pages/BookingsPage";
import EventHubClient from "../../../support/api/EventHubClient";
import {
  apiBookingPayload,
  bookingCustomer,
  eventPayload,
} from "../../../support/data/TestDataFactory";

const eventsPage = new EventsPage();
const eventDetailPage = new EventDetailPage();
const bookingsPage = new BookingsPage();
const eventHubClient = new EventHubClient();

let currentCustomer;
let currentEvent;

When("I book {int} ticket for event {string}", (quantity, eventName) => {
  currentCustomer = bookingCustomer();

  eventsPage.visit();
  eventsPage.bookEvent(eventName);
  eventDetailPage.assertLoaded(eventName);

  if (quantity > 1) {
    eventDetailPage.increaseTickets(quantity - 1);
  }

  eventDetailPage.fillBookingForm(currentCustomer);
  eventDetailPage.confirmBooking();
});

When("I book {int} tickets for event {string}", (quantity, eventName) => {
  currentCustomer = bookingCustomer();

  eventsPage.visit();
  eventsPage.bookEvent(eventName);
  eventDetailPage.assertLoaded(eventName);
  eventDetailPage.increaseTickets(quantity - 1);
  eventDetailPage.fillBookingForm(currentCustomer);
  eventDetailPage.confirmBooking();
});

Then("I should see the booking confirmation", () => {
  eventDetailPage.assertBookingConfirmed(currentCustomer);
});

Then("I should see a booking confirmation with total {string}", (totalAmount) => {
  eventDetailPage.assertBookingConfirmationDetails(currentCustomer, totalAmount);
});

When("I open My Bookings from the confirmation", () => {
  eventDetailPage.viewMyBookings();
});

Then("I should see booking for event {string}", (eventName) => {
  bookingsPage.assertLoaded();
  bookingsPage.assertBookingVisible(eventName);
});

Then("I should not see booking for event {string}", (eventName) => {
  bookingsPage.assertLoaded();
  bookingsPage.assertNoBookingsForCustomer(currentCustomer);
});

When("I open the booking details", () => {
  bookingsPage.openFirstBookingDetails();
});

Then("I should see the booking details for event {string}", (eventName) => {
  bookingsPage.assertBookingDetails(eventName, currentCustomer);
});

When("I cancel the booking", () => {
  bookingsPage.cancelFirstBooking();
});

When("I clear all bookings", () => {
  bookingsPage.clearAllBookingsIfPresent();
});

Then("no bookings for the current Cypress customer should remain", () => {
  bookingsPage.assertNoBookingsForCustomer(currentCustomer);
});

Then("the ticket quantity should be {int}", (quantity) => {
  eventDetailPage.assertTicketQuantity(quantity);
});

Then("the ticket decrement control should be disabled", () => {
  eventDetailPage.assertDecrementDisabled();
});

When("I increase tickets by {int}", (times) => {
  eventDetailPage.increaseTickets(times);
});

When("I decrease tickets by {int}", (times) => {
  eventDetailPage.decreaseTickets(times);
});

Then("the booking total should include {string}", (amount) => {
  eventDetailPage.assertTotalContains(amount);
});

When("I submit the booking form without customer details", () => {
  eventDetailPage.submitEmptyBookingForm();
});

Then("the booking form should show required field validation", () => {
  eventDetailPage.assertBookingFormValidation();
});

When("I enter booking customer email {string} and phone {string}", (email, phone) => {
  eventDetailPage.fillBookingForm({
    fullName: "Cypress Validation User",
    email,
    phone,
  });
  eventDetailPage.confirmBooking();
});

Then("the booking email field should be invalid", () => {
  eventDetailPage.assertCustomerEmailInvalid();
});

Then("the booking phone field should be invalid", () => {
  eventDetailPage.assertCustomerPhoneInvalid();
});

When("I create a booking through the API for cleanup", () => {
  eventHubClient.login().then(() => {
    eventHubClient.createBooking(apiBookingPayload()).its("status").should("eq", 201);
  });
});

When("I clean Cypress-created bookings through the API", () => {
  eventHubClient.cleanupBookingsByCustomerPrefix();
});

Then("no Cypress-created bookings should remain in My Bookings", () => {
  bookingsPage.visit();
  bookingsPage.assertEmptyOrNoCypressBookings();
});

When("I create a one-seat admin event through the API", () => {
  currentEvent = eventPayload({
    title: `Cypress Sold Out Event ${Date.now()}`,
    totalSeats: "1",
    price: "199",
  });

  eventHubClient.login().then(() => {
    eventHubClient.createEvent(currentEvent).then((response) => {
      expect(response.status).to.be.oneOf([200, 201]);
      currentEvent = {
        ...currentEvent,
        ...response.body.data,
      };
    });
  });
});

When("I book {int} ticket for the created admin event", (quantity) => {
  currentCustomer = bookingCustomer();

  eventsPage.visit();
  eventsPage.bookEvent(currentEvent.title);
  eventDetailPage.assertLoaded(currentEvent.title);

  if (quantity > 1) {
    eventDetailPage.increaseTickets(quantity - 1);
  }

  eventDetailPage.fillBookingForm(currentCustomer);
  eventDetailPage.confirmBooking();
  eventDetailPage.assertBookingConfirmed(currentCustomer);
});

Then("the created admin event should show no remaining seats or be unavailable for booking", () => {
  eventsPage.search(currentEvent.title);
  eventsPage.assertEventSoldOutOrUnavailable(currentEvent.title);
});
