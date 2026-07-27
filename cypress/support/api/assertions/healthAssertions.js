import { healthSchema } from "../schemas/healthSchema";
import { assertSchema } from "./schemaAssertions";

export function assertHealthResponse(response) {
  expect(response.status).to.eq(200);
  assertSchema(response.body, healthSchema, "health response");
}
