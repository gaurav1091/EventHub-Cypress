import { Then, When } from "@badeball/cypress-cucumber-preprocessor";
import EventHubClient from "../../../support/api/EventHubClient";
import { apiBookingPayload } from "../../../support/data/TestDataFactory";
import { assertSuccessfulLogin } from "../../../support/api/assertions/authAssertions";
import {
  assertEventDetail,
  assertEventsResponse,
  assertSeededEventsPresent,
} from "../../../support/api/assertions/eventAssertions";
import {
  assertBookingCancelled,
  assertBookingCreated,
} from "../../../support/api/assertions/bookingAssertions";
import { assertApiError } from "../../../support/api/assertions/errorAssertions";
import { assertHealthResponse } from "../../../support/api/assertions/healthAssertions";
import {
  assertContractIsDocumented,
  assertResponseMatchesContract,
} from "../../../support/api/assertions/contractAssertions";

const eventHubClient = new EventHubClient();

let apiResponse;
let apiBooking;
let cancellationResponse;
let selectedEvent;

When("I request the API health endpoint", () => {
  cy.request(`${Cypress.env("apiBaseUrl")}/api/health`).then((response) => {
    apiResponse = response;
  });
});

Then("the API health response should be successful", () => {
  assertResponseMatchesContract(apiResponse, "getHealth");
  assertHealthResponse(apiResponse);
});

Then("the internal API contract should document the automated endpoints", () => {
  assertContractIsDocumented();
});

When("I authenticate through the API", () => {
  eventHubClient.login().then((body) => {
    apiResponse = { body };
  });
});

Then("the API should return the registered user identity", () => {
  assertResponseMatchesContract({ status: 200 }, "login");
  assertSuccessfulLogin(apiResponse.body);
});

When("I request the current user profile through the API", () => {
  eventHubClient.login().then(() => {
    eventHubClient.getCurrentUser().then((response) => {
      apiResponse = response;
    });
  });
});

Then("the API current user response should include the registered identity", () => {
  assertResponseMatchesContract(apiResponse, "getCurrentUser");
  expect(JSON.stringify(apiResponse.body)).to.include(Cypress.env("userEmail"));
});

When("I request events through the API", () => {
  eventHubClient.login().then(() => {
    eventHubClient.getEvents().then((response) => {
      apiResponse = response;
    });
  });
});

Then("the API events response should include seeded EventHub events", () => {
  assertResponseMatchesContract(apiResponse, "listEvents");
  assertEventsResponse(apiResponse);
  assertSeededEventsPresent(apiResponse.body.data);
});

When("I request event {string} through the API", (eventName) => {
  eventHubClient.login().then(() => {
    eventHubClient.getEvents().then((response) => {
      selectedEvent = response.body.data.find((event) => event.title === eventName);
      expect(selectedEvent, `Expected API event named ${eventName}`).to.exist;
      eventHubClient.getEvent(selectedEvent.id).then((eventResponse) => {
        apiResponse = eventResponse;
      });
    });
  });
});

Then("the API event detail response should describe {string}", (eventName) => {
  assertResponseMatchesContract(apiResponse, "getEvent");
  assertEventDetail(apiResponse, eventName);
});

When("I create a booking through the API", () => {
  eventHubClient.login().then(() => {
    eventHubClient.createBooking(apiBookingPayload()).then((response) => {
      apiResponse = response;
      apiBooking = response.body.data;
    });
  });
});

Then("the API booking response should include a booking reference", () => {
  assertResponseMatchesContract(apiResponse, "createBooking");
  assertBookingCreated(apiResponse);
});

When("I cancel the API-created booking", () => {
  eventHubClient.deleteBooking(apiBooking.id).then((response) => {
    cancellationResponse = response;
  });
});

Then("the API booking cancellation should be successful", () => {
  assertResponseMatchesContract(cancellationResponse, "deleteBooking");
  assertBookingCancelled(cancellationResponse);
});

When("I authenticate through the API with invalid credentials", () => {
  cy.request({
    method: "POST",
    url: `${Cypress.env("apiBaseUrl")}/api/auth/login`,
    failOnStatusCode: false,
    body: {
      email: Cypress.env("userEmail"),
      password: "DefinitelyWrong@123",
    },
  }).then((response) => {
    apiResponse = response;
  });
});

When("I request bookings through the API without authentication", () => {
  cy.request({
    method: "GET",
    url: `${Cypress.env("apiBaseUrl")}/api/bookings`,
    failOnStatusCode: false,
  }).then((response) => {
    apiResponse = response;
  });
});

When("I create a booking through the API without authentication", () => {
  cy.request({
    method: "POST",
    url: `${Cypress.env("apiBaseUrl")}/api/bookings`,
    failOnStatusCode: false,
    body: apiBookingPayload(),
  }).then((response) => {
    apiResponse = response;
  });
});

When("I request unknown event detail through the API", () => {
  eventHubClient.login().then(() => {
    cy.request({
      method: "GET",
      url: `${Cypress.env("apiBaseUrl")}/api/events/999999999`,
      headers: {
        Authorization: `Bearer ${eventHubClient.token}`,
      },
      failOnStatusCode: false,
    }).then((response) => {
      apiResponse = response;
    });
  });
});

When("I cancel an unknown booking through the API", () => {
  eventHubClient.login().then(() => {
    cy.request({
      method: "DELETE",
      url: `${Cypress.env("apiBaseUrl")}/api/bookings/999999999`,
      headers: {
        Authorization: `Bearer ${eventHubClient.token}`,
      },
      failOnStatusCode: false,
    }).then((response) => {
      apiResponse = response;
    });
  });
});

When("I create a booking through the API with invalid payload", () => {
  eventHubClient.login().then(() => {
    cy.request({
      method: "POST",
      url: `${Cypress.env("apiBaseUrl")}/api/bookings`,
      headers: {
        Authorization: `Bearer ${eventHubClient.token}`,
      },
      failOnStatusCode: false,
      body: apiBookingPayload({
        customerEmail: "not-an-email",
        quantity: 0,
      }),
    }).then((response) => {
      apiResponse = response;
    });
  });
});

Then("the API should reject the request with status {int}", (statusCode) => {
  assertApiError(apiResponse, statusCode);
});
