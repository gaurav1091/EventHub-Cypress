import { Then, When } from "@badeball/cypress-cucumber-preprocessor";
import EventHubClient from "../../../support/api/EventHubClient";
import { apiBookingPayload } from "../../../support/data/TestDataFactory";

const eventHubClient = new EventHubClient();

let apiResponse;
let apiBooking;
let cancellationResponse;

When("I request the API health endpoint", () => {
  cy.request(`${Cypress.env("apiBaseUrl")}/api/health`).then((response) => {
    apiResponse = response;
  });
});

Then("the API health response should be successful", () => {
  expect(apiResponse.status).to.eq(200);
  expect(apiResponse.body.status).to.eq("ok");
  expect(apiResponse.body.dbStatus).to.eq("connected");
});

When("I authenticate through the API", () => {
  eventHubClient.login().then((body) => {
    apiResponse = { body };
  });
});

Then("the API should return the registered user identity", () => {
  expect(apiResponse.body.success).to.eq(true);
  expect(apiResponse.body.user.email).to.eq(Cypress.env("userEmail"));
  expect(apiResponse.body.token).to.be.a("string").and.not.be.empty;
});

When("I request events through the API", () => {
  eventHubClient.login().then(() => {
    eventHubClient.getEvents().then((response) => {
      apiResponse = response;
    });
  });
});

Then("the API events response should include seeded EventHub events", () => {
  expect(apiResponse.status).to.eq(200);
  expect(apiResponse.body.success).to.eq(true);

  const eventTitles = apiResponse.body.data.map((event) => event.title);

  expect(eventTitles).to.include("Dilli Diwali Mela");
  expect(eventTitles).to.include("World Tech Summit");
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
  expect(apiResponse.status).to.eq(201);
  expect(apiResponse.body.success).to.eq(true);
  expect(apiBooking.bookingRef).to.match(/^[A-Z]-[A-Z0-9]{6}$/);
});

When("I cancel the API-created booking", () => {
  eventHubClient.deleteBooking(apiBooking.id).then((response) => {
    cancellationResponse = response;
  });
});

Then("the API booking cancellation should be successful", () => {
  expect(cancellationResponse.status).to.eq(200);
  expect(cancellationResponse.body.success).to.eq(true);
});
