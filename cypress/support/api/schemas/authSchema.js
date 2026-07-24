export const authLoginSchema = {
  requiredFields: ["success", "token", "user"],
  userFields: ["email"],
  fieldTypes: {
    success: "boolean",
    token: "string",
    user: "object",
  },
  userFieldTypes: {
    email: "string",
  },
  userFieldPatterns: {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  jsonSchema: {
    type: "object",
    required: ["success", "token", "user"],
    additionalProperties: true,
    properties: {
      success: { type: "boolean", const: true },
      token: { type: "string", minLength: 1 },
      user: {
        type: "object",
        required: ["email"],
        additionalProperties: true,
        properties: {
          email: { type: "string", pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$" },
        },
      },
    },
  },
};
