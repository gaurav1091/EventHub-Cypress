@hybrid @api @ui
Feature: EventHub API and UI hybrid coverage

  Background:
    Given I am signed in to EventHub

  @regression @stateful
  Scenario: API-created booking is visible in My Bookings
    When I create a booking through the API for event "Dilli Diwali Mela"
    And I open My Bookings
    Then I should see the API-created booking in My Bookings

  @regression @stateful
  Scenario: API-created admin event is visible in discovery
    When I create an admin event through the API
    And I open the Events page
    Then I should see the API-created admin event in discovery

  @regression
  Scenario: UI event cards align with the API event catalog
    When I capture seeded events through the API
    And I open the Events page
    Then the UI event cards should match the seeded API events
