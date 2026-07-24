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
};
