import { bookingSchema } from "../schemas/bookingSchema";
import { assertSchema } from "./schemaAssertions";

export function assertBookingCreated(response) {
  expect(response.status).to.eq(201);
  expect(response.body.success).to.eq(true);
  assertSchema(response.body.data, bookingSchema, "booking");
  expect(response.body.data.bookingRef).to.match(/^[A-Z]-[A-Z0-9]{6}$/);
  expect(response.body.data.quantity).to.be.greaterThan(0);
}

export function assertBookingCancelled(response) {
  expect(response.status).to.eq(200);
  expect(response.body.success).to.eq(true);
}
