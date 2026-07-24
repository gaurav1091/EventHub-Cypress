export const bookingSchema = {
  requiredFields: [
    "id",
    "eventId",
    "customerName",
    "customerEmail",
    "customerPhone",
    "quantity",
    "bookingRef",
  ],
  fieldTypes: {
    id: "number",
    eventId: "number",
    customerName: "string",
    customerEmail: "string",
    customerPhone: "string",
    quantity: "number",
    bookingRef: "string",
    totalAmount: ["number", "string"],
  },
  fieldPatterns: {
    bookingRef: /^[A-Z]-[A-Z0-9]{6}$/,
    customerEmail: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  jsonSchema: {
    type: "object",
    required: [
      "id",
      "eventId",
      "customerName",
      "customerEmail",
      "customerPhone",
      "quantity",
      "bookingRef",
    ],
    additionalProperties: true,
    properties: {
      id: { type: "number" },
      eventId: { type: "number" },
      customerName: { type: "string", minLength: 1 },
      customerEmail: { type: "string", pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$" },
      customerPhone: { type: "string", minLength: 1 },
      quantity: { type: "number", minimum: 1 },
      bookingRef: { type: "string", pattern: "^[A-Z]-[A-Z0-9]{6}$" },
      totalAmount: {
        anyOf: [
          { type: "number", minimum: 0 },
          { type: "string", pattern: "^\\d+(\\.\\d+)?$" },
        ],
      },
    },
  },
};
