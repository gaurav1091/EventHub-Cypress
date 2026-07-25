const timestamp = () => Date.now();
const testDataNamespace = () => Cypress.env("testDataNamespace") || "local";

export function registeredUser() {
  return {
    email: Cypress.env("userEmail"),
    password: Cypress.env("userPassword"),
  };
}

export function bookingCustomer() {
  return {
    fullName: `Cypress User ${testDataNamespace()} ${timestamp()}`,
    email: Cypress.env("userEmail"),
    phone: "+91 98765 43210",
  };
}

export function eventPayload(overrides = {}) {
  const id = timestamp();

  return {
    title: `Cypress ${testDataNamespace()} Summit ${id}`,
    description: "A framework generated event used for Cypress BDD automation practice.",
    category: "Conference",
    city: "Bangalore",
    venue: "Automation Convention Center",
    dateTime: "2026-12-15T10:30",
    eventDate: "2026-12-15T10:30:00.000Z",
    price: "499",
    totalSeats: "50",
    ...overrides,
  };
}

export function apiBookingPayload(overrides = {}) {
  const customer = bookingCustomer();

  return {
    eventId: 1,
    customerName: customer.fullName,
    customerEmail: customer.email,
    customerPhone: customer.phone,
    quantity: 1,
    ...overrides,
  };
}
