export const errorSchema = {
  jsonSchema: {
    type: "object",
    additionalProperties: true,
    properties: {
      success: { type: "boolean", const: false },
      message: { type: "string", minLength: 1 },
      error: { type: "string", minLength: 1 },
      errors: {
        anyOf: [
          { type: "array", minItems: 1 },
          { type: "object" },
          { type: "string", minLength: 1 },
        ],
      },
    },
    anyOf: [{ required: ["success"] }, { required: ["message"] }, { required: ["error"] }],
  },
};
