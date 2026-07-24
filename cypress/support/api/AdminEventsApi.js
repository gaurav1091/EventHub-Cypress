import BaseApi from "./BaseApi";

export default class AdminEventsApi extends BaseApi {
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
}
