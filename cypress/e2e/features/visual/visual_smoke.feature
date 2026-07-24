@visual @ui
Feature: Visual smoke baselines

  @visual
  Scenario: Login page renders a stable visual baseline
    When I capture the Login page visual baseline
    Then the login visual baseline should be captured

  @visual
  Scenario: Core EventHub pages render stable visual baselines
    Given I am signed in to EventHub
    When I capture the Events page visual baseline
    And I capture the Event Details page visual baseline for "Dilli Diwali Mela"
    And I capture the My Bookings page visual baseline
    And I capture the Admin Events page visual baseline
    Then the visual baselines should be captured

  @visual @stateful
  Scenario: Booking confirmation renders a stable visual baseline
    Given I am signed in to EventHub
    When I capture the Booking Confirmation visual baseline for "Dilli Diwali Mela"
    Then the booking confirmation visual baseline should be captured
