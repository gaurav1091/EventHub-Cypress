import { Then, When } from "@badeball/cypress-cucumber-preprocessor";
import EventsPage from "../../../support/pages/EventsPage";
import EventDetailPage from "../../../support/pages/EventDetailPage";

const eventsPage = new EventsPage();
const eventDetailPage = new EventDetailPage();

When("I open the Events page", () => {
  eventsPage.visit();
});

When("I search events for {string}", (searchTerm) => {
  eventsPage.search(searchTerm);
});

When("I filter events by category {string}", (category) => {
  eventsPage.filterByCategory(category);
});

When("I filter events by city {string}", (city) => {
  eventsPage.filterByCity(city);
});

When("I clear event filters", () => {
  eventsPage.clearFilters();
});

When("I open details for event {string}", (eventName) => {
  eventsPage.visit();
  eventsPage.openEvent(eventName);
});

Then("I should see seeded upcoming events", () => {
  eventsPage.assertEventVisible("Dilli Diwali Mela");
  eventsPage.assertEventVisible("Hollywood Monsoon Night");
  eventsPage.assertEventVisible("World Tech Summit");
  eventsPage.assertEventCountAtLeast(3);
});

Then("I should see event {string}", (eventName) => {
  eventsPage.assertEventVisible(eventName);
});

Then("I should not see event {string}", (eventName) => {
  eventsPage.assertEventNotVisible(eventName);
});

Then("I should see the no events found message", () => {
  eventsPage.assertNoEventsFound();
});

Then(
  "event {string} card should show category {string}, city {string}, and price {string}",
  (eventName, category, city, price) => {
    eventsPage.assertEventCardDetails(eventName, { category, city, price });
  },
);

Then("I should see the event detail booking panel for {string}", (eventName) => {
  eventDetailPage.assertLoaded(eventName);
});
