@visual @ui
Feature: Visual smoke baselines

  Background:
    Given I am signed in to EventHub

  @visual
  Scenario: Core EventHub pages render stable visual baselines
    When I capture the Events page visual baseline
    And I capture the Event Details page visual baseline for "Dilli Diwali Mela"
    And I capture the My Bookings page visual baseline
    And I capture the Admin Events page visual baseline
    Then the visual baselines should be captured
