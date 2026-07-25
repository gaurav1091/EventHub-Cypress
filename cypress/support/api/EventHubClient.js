import AuthApi from "./AuthApi";
import EventsApi from "./EventsApi";
import AdminEventsApi from "./AdminEventsApi";
import BookingsApi from "./BookingsApi";

export default class EventHubClient {
  constructor(apiBaseUrl = Cypress.env("apiBaseUrl")) {
    this.apiBaseUrl = apiBaseUrl;
    this.token = null;
    this.auth = new AuthApi(this);
    this.events = new EventsApi(this);
    this.adminEvents = new AdminEventsApi(this);
    this.bookings = new BookingsApi(this);
  }

  login(email, password) {
    return this.auth.login(email, password);
  }

  getCurrentUser() {
    return this.auth.getCurrentUser();
  }

  getEvents() {
    return this.events.getEvents();
  }

  getEvent(eventId) {
    return this.events.getEvent(eventId);
  }

  createEvent(event) {
    return this.adminEvents.createEvent(event).then((response) => {
      const createdEvent = response.body.data;

      if (!createdEvent?.id) {
        return response;
      }

      return cy
        .task(
          "registerTestData",
          {
            type: "events",
            id: createdEvent.id,
            label: createdEvent.title,
          },
          { log: false },
        )
        .then(() => response);
    });
  }

  deleteEvent(eventId) {
    return this.adminEvents.deleteEvent(eventId);
  }

  getBookings(query = {}) {
    return this.bookings.getBookings(query);
  }

  createBooking(booking) {
    return this.bookings.createBooking(booking).then((response) => {
      const createdBooking = response.body.data;

      if (!createdBooking?.id) {
        return response;
      }

      return cy
        .task(
          "registerTestData",
          {
            type: "bookings",
            id: createdBooking.id,
            label: createdBooking.bookingRef || createdBooking.customerName,
          },
          { log: false },
        )
        .then(() => response);
    });
  }

  deleteBooking(bookingId) {
    return this.bookings.deleteBooking(bookingId);
  }

  cleanupBookingsByCustomerPrefix(prefix = Cypress.env("bookingCleanupPrefix") || "Cypress User") {
    return this.getBookings({ limit: 100 }).then((response) => {
      const bookings = response.body.data || [];
      const matchingBookings = bookings.filter((booking) =>
        booking.customerName?.startsWith(prefix),
      );

      return cy.wrap(matchingBookings, { log: false }).each((booking) => {
        this.deleteBooking(booking.id).its("status").should("be.oneOf", [200, 404]);
      });
    });
  }

  cleanupEventsByTitlePrefix(prefix = Cypress.env("eventCleanupPrefix") || "Cypress") {
    return this.getEvents().then((response) => {
      const events = response.body.data || [];
      const matchingEvents = events.filter(
        (event) => event.title?.startsWith(prefix) && event.featured !== true,
      );

      return cy.wrap(matchingEvents, { log: false }).each((event) => {
        this.deleteEvent(event.id).its("status").should("be.oneOf", [200, 404]);
      });
    });
  }

  cleanupRegisteredTestData() {
    return cy.task("getTestDataRegistry", null, { log: false }).then((registry) => {
      const bookings = registry.bookings || [];
      const events = registry.events || [];

      return cy
        .wrap(bookings, { log: false })
        .each((booking) => {
          this.deleteBooking(booking.id).its("status").should("be.oneOf", [200, 404]);
        })
        .then(() =>
          cy.wrap(events, { log: false }).each((event) => {
            this.deleteEvent(event.id).its("status").should("be.oneOf", [200, 404]);
          }),
        )
        .then(() => cy.task("clearTestDataRegistry", null, { log: false }));
    });
  }

  authenticatedRequest(options) {
    const requestWithToken = () =>
      cy.request({
        failOnStatusCode: true,
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${this.token}`,
        },
      });

    if (this.token) {
      return requestWithToken();
    }

    return this.login().then(requestWithToken);
  }
}
