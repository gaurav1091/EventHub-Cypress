import BaseApi from "./BaseApi";

export default class EventsApi extends BaseApi {
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
}
