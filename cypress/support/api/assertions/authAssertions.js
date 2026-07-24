import { authLoginSchema } from "../schemas/authSchema";
import {
  assertFieldPatterns,
  assertFieldTypes,
  assertRequiredFields,
  assertSchema,
} from "./schemaAssertions";

export function assertSuccessfulLogin(body, expectedEmail = Cypress.env("userEmail")) {
  assertSchema(body, authLoginSchema, "auth login response");
  assertRequiredFields(body.user, authLoginSchema.userFields, "auth user");
  assertFieldTypes(body.user, authLoginSchema.userFieldTypes, "auth user");
  assertFieldPatterns(body.user, authLoginSchema.userFieldPatterns, "auth user");
  expect(body.success).to.eq(true);
  expect(body.token).to.be.a("string").and.not.be.empty;
  expect(body.user.email).to.eq(expectedEmail);
}
