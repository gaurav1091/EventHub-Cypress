import BaseApi from "./BaseApi";

export default class BookingsApi extends BaseApi {
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
}
