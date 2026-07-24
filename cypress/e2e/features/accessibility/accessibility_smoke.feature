@accessibility @ui
Feature: EventHub accessibility smoke

  Background:
    Given I am signed in to EventHub

  @regression @accessibility
  Scenario: Core authenticated pages have no serious accessibility violations
    When I check the accessibility of the Events page
    And I check the accessibility of the My Bookings page
    And I check the accessibility of the Admin Events page
    Then no serious accessibility violations should be reported
