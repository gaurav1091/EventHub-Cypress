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
};
