import { bookingSchema } from "../schemas/bookingSchema";
import { assertRequiredFields } from "./schemaAssertions";

export function assertBookingCreated(response) {
  expect(response.status).to.eq(201);
  expect(response.body.success).to.eq(true);
  assertRequiredFields(response.body.data, bookingSchema.requiredFields, "booking");
  expect(response.body.data.bookingRef).to.match(/^[A-Z]-[A-Z0-9]{6}$/);
}

export function assertBookingCancelled(response) {
  expect(response.status).to.eq(200);
  expect(response.body.success).to.eq(true);
}
