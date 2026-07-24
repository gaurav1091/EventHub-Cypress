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
    return this.adminEvents.createEvent(event);
  }

  deleteEvent(eventId) {
    return this.adminEvents.deleteEvent(eventId);
  }

  getBookings(query = {}) {
    return this.bookings.getBookings(query);
  }

  createBooking(booking) {
    return this.bookings.createBooking(booking);
  }

  deleteBooking(bookingId) {
    return this.bookings.deleteBooking(bookingId);
  }

  cleanupBookingsByCustomerPrefix(prefix = "Cypress User") {
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

  cleanupEventsByTitlePrefix(prefix = "Cypress") {
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
