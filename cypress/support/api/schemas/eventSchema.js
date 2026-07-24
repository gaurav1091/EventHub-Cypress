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
};
