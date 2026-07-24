export const eventSchema = {
  requiredFields: ["id", "title", "category", "venue", "city", "eventDate", "price"],
  fieldTypes: {
    id: "number",
    title: "string",
    description: "string",
    category: "string",
    venue: "string",
    city: "string",
    eventDate: "string",
    price: ["number", "string"],
    totalSeats: "number",
    availableSeats: "number",
  },
  jsonSchema: {
    type: "object",
    required: ["id", "title", "category", "venue", "city", "eventDate", "price"],
    additionalProperties: true,
    properties: {
      id: { type: "number" },
      title: { type: "string", minLength: 1 },
      description: { type: "string" },
      category: { type: "string", minLength: 1 },
      venue: { type: "string", minLength: 1 },
      city: { type: "string", minLength: 1 },
      eventDate: { type: "string", minLength: 1 },
      price: {
        anyOf: [
          { type: "number", minimum: 0 },
          { type: "string", pattern: "^\\d+(\\.\\d+)?$" },
        ],
      },
      totalSeats: { type: "number", minimum: 0 },
      availableSeats: { type: "number", minimum: 0 },
      featured: { type: "boolean" },
    },
  },
};
