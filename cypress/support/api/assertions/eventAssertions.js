import { eventSchema } from "../schemas/eventSchema";
import { assertSchema } from "./schemaAssertions";

export function assertEventsResponse(response) {
  expect(response.status).to.eq(200);
  expect(response.body.success).to.eq(true);
  expect(response.body.data).to.be.an("array").and.not.be.empty;
  response.body.data.forEach((event) => {
    assertEventContract(event, `event ${event.title || event.id}`);
  });
}

export function assertSeededEventsPresent(events) {
  const titles = events.map((event) => event.title);

  expect(titles).to.include("Dilli Diwali Mela");
  expect(titles).to.include("World Tech Summit");
}

export function assertEventDetail(response, expectedTitle) {
  expect(response.status).to.eq(200);
  expect(response.body.success).to.eq(true);
  assertEventContract(response.body.data, "event detail");
  expect(response.body.data.title).to.eq(expectedTitle);
}

function assertEventContract(event, label) {
  assertSchema(event, eventSchema, label);
  expect(event.title, `${label}.title`).to.not.be.empty;
  expect(event.category, `${label}.category`).to.not.be.empty;
  expect(event.city, `${label}.city`).to.not.be.empty;
  expect(Number(event.price), `${label}.price`).to.be.at.least(0);
  expect(new Date(event.eventDate).toString(), `${label}.eventDate`).to.not.eq("Invalid Date");
}
