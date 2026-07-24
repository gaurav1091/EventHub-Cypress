export default class EventHubClient {
  constructor(apiBaseUrl = Cypress.env("apiBaseUrl")) {
    this.apiBaseUrl = apiBaseUrl;
    this.token = null;
  }

  login(email = Cypress.env("userEmail"), password = Cypress.env("userPassword")) {
    return cy
      .request({
        method: "POST",
        url: `${this.apiBaseUrl}/api/auth/login`,
        body: {
          email,
          password,
        },
      })
      .then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.success).to.eq(true);
        expect(response.body.token).to.be.a("string").and.not.be.empty;
        this.token = response.body.token;
        return response.body;
      });
  }

  getCurrentUser() {
    return this.authenticatedRequest({
      method: "GET",
      url: `${this.apiBaseUrl}/api/auth/me`,
    });
  }

  getEvents() {
    return this.authenticatedRequest({
      method: "GET",
      url: `${this.apiBaseUrl}/api/events`,
    });
  }

  getEvent(eventId) {
    return this.authenticatedRequest({
      method: "GET",
      url: `${this.apiBaseUrl}/api/events/${eventId}`,
    });
  }

  createEvent(event) {
    return this.authenticatedRequest({
      method: "POST",
      url: `${this.apiBaseUrl}/api/events`,
      body: {
        title: event.title,
        description: event.description,
        category: event.category,
        venue: event.venue,
        city: event.city,
        eventDate: event.eventDate || `${event.dateTime}:00.000Z`,
        price: Number(event.price),
        totalSeats: Number(event.totalSeats),
        imageUrl: event.imageUrl,
      },
    });
  }

  deleteEvent(eventId) {
    return this.authenticatedRequest({
      method: "DELETE",
      url: `${this.apiBaseUrl}/api/events/${eventId}`,
      failOnStatusCode: false,
    });
  }

  getBookings(query = {}) {
    return this.authenticatedRequest({
      method: "GET",
      url: `${this.apiBaseUrl}/api/bookings`,
      qs: query,
    });
  }

  createBooking(booking) {
    return this.authenticatedRequest({
      method: "POST",
      url: `${this.apiBaseUrl}/api/bookings`,
      body: booking,
    });
  }

  deleteBooking(bookingId) {
    return this.authenticatedRequest({
      method: "DELETE",
      url: `${this.apiBaseUrl}/api/bookings/${bookingId}`,
      failOnStatusCode: false,
    });
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
