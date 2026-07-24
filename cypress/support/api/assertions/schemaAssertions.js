import Ajv from "ajv";

const ajv = new Ajv({
  allErrors: true,
  strict: false,
});

const compiledSchemas = new WeakMap();

export function assertRequiredFields(subject, requiredFields, label = "response body") {
  requiredFields.forEach((field) => {
    expect(subject, `${label} should include ${field}`).to.have.property(field);
  });
}

export function assertFieldTypes(subject, fieldTypes = {}, label = "response body") {
  Object.entries(fieldTypes).forEach(([field, expectedTypes]) => {
    if (!Object.prototype.hasOwnProperty.call(subject, field) || subject[field] === null) {
      return;
    }

    const allowedTypes = Array.isArray(expectedTypes) ? expectedTypes : [expectedTypes];
    const actualType = Array.isArray(subject[field]) ? "array" : typeof subject[field];

    expect(allowedTypes, `${label}.${field} should allow actual type ${actualType}`).to.include(
      actualType,
    );
  });
}

export function assertFieldPatterns(subject, fieldPatterns = {}, label = "response body") {
  Object.entries(fieldPatterns).forEach(([field, pattern]) => {
    if (!Object.prototype.hasOwnProperty.call(subject, field) || subject[field] === null) {
      return;
    }

    expect(String(subject[field]), `${label}.${field} should match ${pattern}`).to.match(pattern);
  });
}

export function assertJsonSchema(subject, jsonSchema, label = "response body") {
  if (!jsonSchema) {
    return;
  }

  let validate = compiledSchemas.get(jsonSchema);

  if (!validate) {
    validate = ajv.compile(jsonSchema);
    compiledSchemas.set(jsonSchema, validate);
  }

  const isValid = validate(subject);
  const errorText = ajv.errorsText(validate.errors, { dataVar: label });

  expect(isValid, `${label} should match JSON schema: ${errorText}`).to.eq(true);
}

export function assertSchema(subject, schema, label = "response body") {
  assertJsonSchema(subject, schema.jsonSchema, label);
  assertRequiredFields(subject, schema.requiredFields || [], label);
  assertFieldTypes(subject, schema.fieldTypes || {}, label);
  assertFieldPatterns(subject, schema.fieldPatterns || {}, label);
}
