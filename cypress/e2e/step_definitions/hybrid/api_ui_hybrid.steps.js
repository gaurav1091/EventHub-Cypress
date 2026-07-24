import { Then, When } from "@badeball/cypress-cucumber-preprocessor";
import EventHubClient from "../../../support/api/EventHubClient";
import { apiBookingPayload, eventPayload } from "../../../support/data/TestDataFactory";
import EventsPage from "../../../support/pages/EventsPage";
import BookingsPage from "../../../support/pages/BookingsPage";

const eventHubClient = new EventHubClient();
const eventsPage = new EventsPage();
const bookingsPage = new BookingsPage();

let apiBooking;
let apiBookingEventName;
let apiEvent;
let seededEvents;

When("I create a booking through the API for event {string}", (eventName) => {
  apiBookingEventName = eventName;

  eventHubClient.login().then(() => {
    eventHubClient.getEvents().then((response) => {
      const event = response.body.data.find((candidate) => candidate.title === eventName);
      expect(event, `Expected API event named ${eventName}`).to.exist;

      eventHubClient
        .createBooking(
          apiBookingPayload({
            eventId: event.id,
          }),
        )
        .then((bookingResponse) => {
          apiBooking = bookingResponse.body.data;
        });
    });
  });
});

When("I open My Bookings", () => {
  bookingsPage.visit();
});

Then("I should see the API-created booking in My Bookings", () => {
  bookingsPage.assertBookingVisible(apiBookingEventName);
  cy.contains(apiBooking.bookingRef).should("be.visible");
});

When("I create an admin event through the API", () => {
  apiEvent = eventPayload();

  eventHubClient.login().then(() => {
    eventHubClient.createEvent(apiEvent).then((response) => {
      expect(response.status).to.be.oneOf([200, 201]);
      apiEvent = response.body.data;
    });
  });
});

Then("I should see the API-created admin event in discovery", () => {
  eventsPage.search(apiEvent.title);
  eventsPage.assertEventVisible(apiEvent.title);
});

When("I capture seeded events through the API", () => {
  eventHubClient.login().then(() => {
    eventHubClient.getEvents().then((response) => {
      seededEvents = response.body.data.filter((event) =>
        ["Dilli Diwali Mela", "World Tech Summit"].includes(event.title),
      );
    });
  });
});

Then("the UI event cards should match the seeded API events", () => {
  seededEvents.forEach((event) => {
    eventsPage.assertEventCardDetails(event.title, {
      category: event.category,
      city: event.city,
      price: `$${Number(event.price).toLocaleString("en-US")}`,
    });
  });
});
