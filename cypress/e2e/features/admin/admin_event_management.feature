@admin @ui
Feature: Admin event management

  Background:
    Given I am signed in to EventHub

  @smoke @stateful
  Scenario: Admin can create a user-managed event
    When I create a new admin event
    Then the new event should appear in the admin events table

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
