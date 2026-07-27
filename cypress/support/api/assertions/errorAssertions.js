import { errorSchema } from "../schemas/errorSchema";
import { assertJsonSchema } from "./schemaAssertions";

export function assertApiError(response, expectedStatus) {
  expect(response.status).to.eq(expectedStatus);
  expect(response.body.success).to.not.eq(true);
  assertJsonSchema(response.body, errorSchema.jsonSchema, "error response");
}
