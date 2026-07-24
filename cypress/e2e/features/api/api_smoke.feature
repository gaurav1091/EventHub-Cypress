@api
Feature: EventHub API smoke

  @smoke
  Scenario: API health endpoint is available
    When I request the API health endpoint
    Then the API health response should be successful

  @smoke
  Scenario: Registered user can authenticate through API
    When I authenticate through the API
    Then the API should return the registered user identity

  @smoke
  Scenario: Authenticated user can list events through API
    When I request events through the API
    Then the API events response should include seeded EventHub events

  @regression
  Scenario: Authenticated user can retrieve an event detail through API
    When I request event "World Tech Summit" through the API
    Then the API event detail response should describe "World Tech Summit"

  @smoke
  Scenario: Authenticated user can create and cancel a booking through API
    When I create a booking through the API
    Then the API booking response should include a booking reference
    When I cancel the API-created booking
    Then the API booking cancellation should be successful

  @regression @negative
  Scenario: Invalid credentials are rejected by the API
    When I authenticate through the API with invalid credentials
    Then the API should reject the request with status 400

  @regression @negative
  Scenario: Anonymous user cannot access protected bookings API
    When I request bookings through the API without authentication
    Then the API should reject the request with status 401

  @regression @negative
  Scenario: Unknown event detail request returns not found
    When I request unknown event detail through the API
    Then the API should reject the request with status 404

  @regression @negative
  Scenario: Invalid booking payload is rejected by the API
    When I create a booking through the API with invalid payload
    Then the API should reject the request with status 400
