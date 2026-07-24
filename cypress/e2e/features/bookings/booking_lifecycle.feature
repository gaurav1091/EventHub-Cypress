@bookings @ui
Feature: Event booking lifecycle

  Background:
    Given I am signed in to EventHub

  @smoke @stateful
  Scenario: User can book a ticket and view it under My Bookings
    When I book 1 ticket for event "Dilli Diwali Mela"
    Then I should see the booking confirmation
    When I open My Bookings from the confirmation
    Then I should see booking for event "Dilli Diwali Mela"

  @regression @stateful
  Scenario: User can book multiple tickets and see the correct confirmation total
    When I book 2 tickets for event "Dilli Diwali Mela"
    Then I should see a booking confirmation with total "$600"
    When I open My Bookings from the confirmation
    Then I should see booking for event "Dilli Diwali Mela"

  @regression @stateful
  Scenario: User can view booking details
    When I book 1 ticket for event "Dilli Diwali Mela"
    And I open My Bookings from the confirmation
    And I open the booking details
    Then I should see the booking details for event "Dilli Diwali Mela"

  @regression @stateful
  Scenario: User can cancel a booking
    When I book 1 ticket for event "Dilli Diwali Mela"
    And I open My Bookings from the confirmation
    And I cancel the booking
    Then I should not see booking for event "Dilli Diwali Mela"

  @regression @stateful
  Scenario: User can clear all bookings
    When I book 1 ticket for event "Dilli Diwali Mela"
    And I open My Bookings from the confirmation
    And I clear all bookings
    Then no bookings for the current Cypress customer should remain

  @regression
  Scenario: Event detail page shows booking form and event content
    When I open details for event "World Tech Summit"
    Then I should see the event detail booking panel for "World Tech Summit"

  @regression
  Scenario: Ticket quantity controls update the booking total
    When I open details for event "Dilli Diwali Mela"
    Then the ticket quantity should be 1
    And the ticket decrement control should be disabled
    When I increase tickets by 1
    Then the ticket quantity should be 2
    And the booking total should include "$600"
    When I decrease tickets by 1
    Then the ticket quantity should be 1
    And the booking total should include "$300"

  @regression
  Scenario: Booking form validates required customer details
    When I open details for event "Dilli Diwali Mela"
    And I submit the booking form without customer details
    Then the booking form should show required field validation

  @regression
  Scenario: Booking form validates invalid customer email
    When I open details for event "Dilli Diwali Mela"
    And I enter booking customer email "invalid-email" and phone "+91 98765 43210"
    Then the booking email field should be invalid

  @regression
  Scenario: Booking form validates invalid customer phone
    When I open details for event "Dilli Diwali Mela"
    And I enter booking customer email "gauravarora1091@gmail.com" and phone "123"
    Then the booking phone field should be invalid

  @regression @stateful
  Scenario: Cypress-created bookings can be cleaned through API
    When I create a booking through the API for cleanup
    And I clean Cypress-created bookings through the API
    Then no Cypress-created bookings should remain in My Bookings
