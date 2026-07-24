@events @ui
Feature: Event discovery

  Background:
    Given I am signed in to EventHub

  @smoke
  Scenario: User can view upcoming events
    When I open the Events page
    Then I should see seeded upcoming events

  @regression
  Scenario: User can search for an event by title
    When I open the Events page
    And I search events for "Dilli Diwali Mela"
    Then I should see event "Dilli Diwali Mela"
    And I should not see event "World Tech Summit"

  @regression
  Scenario: User can search for an event by venue
    When I open the Events page
    And I search events for "Pragati Maidan"
    Then I should see event "Dilli Diwali Mela"

  @regression
  Scenario: User can filter events by city and category
    When I open the Events page
    And I filter events by category "Festival"
    And I filter events by city "Delhi"
    Then I should see event "Dilli Diwali Mela"

  @regression
  Scenario: User can clear filters and restore the event list
    When I open the Events page
    And I filter events by category "Festival"
    And I filter events by city "Delhi"
    And I clear event filters
    Then I should see seeded upcoming events

  @regression
  Scenario: User sees an empty state for unmatched search
    When I open the Events page
    And I search events for "No Cypress Event Should Match This"
    Then I should see the no events found message

  @regression
  Scenario: Event cards expose business-critical details
    When I open the Events page
    Then event "Dilli Diwali Mela" card should show category "Festival", city "Delhi", price "$300", seats, and Book Now

  @regression
  Scenario: User can open event details from the event title
    When I open details from the title for event "World Tech Summit"
    Then I should see metadata for event "World Tech Summit"

  @regression
  Scenario: User can open event details from Book Now
    When I open details from Book Now for event "Dilli Diwali Mela"
    Then I should see metadata for event "Dilli Diwali Mela"
