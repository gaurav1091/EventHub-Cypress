import { authLoginSchema } from "../schemas/authSchema";
import { assertRequiredFields } from "./schemaAssertions";

export function assertSuccessfulLogin(body, expectedEmail = Cypress.env("userEmail")) {
  assertRequiredFields(body, authLoginSchema.requiredFields, "auth login response");
  assertRequiredFields(body.user, authLoginSchema.userFields, "auth user");
  expect(body.success).to.eq(true);
  expect(body.token).to.be.a("string").and.not.be.empty;
  expect(body.user.email).to.eq(expectedEmail);
}
