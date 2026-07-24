import { eventSchema } from "../schemas/eventSchema";
import { assertRequiredFields } from "./schemaAssertions";

export function assertEventsResponse(response) {
  expect(response.status).to.eq(200);
  expect(response.body.success).to.eq(true);
  expect(response.body.data).to.be.an("array").and.not.be.empty;
  response.body.data.forEach((event) => {
    assertRequiredFields(event, eventSchema.requiredFields, `event ${event.title || event.id}`);
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
  assertRequiredFields(response.body.data, eventSchema.requiredFields, "event detail");
  expect(response.body.data.title).to.eq(expectedTitle);
}
