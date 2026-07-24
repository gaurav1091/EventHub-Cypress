@admin @ui
Feature: Admin event management

  Background:
    Given I am signed in to EventHub

  @regression
  Scenario: Admin page loads
    When I open the Admin Events page
    Then the Admin Events page should be ready for event management

  @smoke @stateful
  Scenario: Admin can create a user-managed event
    When I create a new admin event
    Then the new event should appear in the admin events table

  @regression
  Scenario: Admin event form validates required fields
    When I open the Admin Events page
    And I submit the admin event form without required fields
    Then the admin event form should show required field validation

  @regression
  Scenario: Admin can view seeded events as read-only records
    When I open the Admin Events page
    Then I should see read-only seeded events

  @regression @stateful
  Scenario: Admin-created event appears in discovery
    When I create a new admin event
    Then the new event should appear in the admin events table
    When I search for the new admin event in discovery
    Then I should see the new admin event in discovery

  @regression @stateful
  Scenario: Admin-created event is searchable and filterable in discovery
    When I create a new admin event
    Then the new event should appear in the admin events table
    When I search and filter for the new admin event in discovery
    Then I should see the new admin event in discovery

  @regression @stateful
  Scenario: Admin cannot exceed the user-created event limit
    When I create the maximum allowed admin events through the API
    And I open the Admin Events page
    Then the admin event limit should be enforced
