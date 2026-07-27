let sequence = 0;

const timestamp = () => Date.now();
const testDataNamespace = () => Cypress.env("testDataNamespace") || "local";

function sanitize(value) {
  return String(value || "scenario")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40)
    .toLowerCase();
}

function scenarioSlug() {
  const rawTitlePath = Cypress.currentTest?.titlePath;
  const titlePath = typeof rawTitlePath === "function" ? rawTitlePath() : rawTitlePath || [];
  return sanitize(titlePath.at(-1));
}

export function uniqueTestDataSuffix() {
  sequence += 1;
  return `${testDataNamespace()} ${scenarioSlug()} ${timestamp()} ${sequence}`;
}

export function registeredUser() {
  return {
    email: Cypress.env("userEmail"),
    password: Cypress.env("userPassword"),
  };
}

export function bookingCustomer() {
  return {
    fullName: `Cypress User ${uniqueTestDataSuffix()}`,
    email: Cypress.env("userEmail"),
    phone: "+91 98765 43210",
  };
}

export function eventPayload(overrides = {}) {
  const suffix = uniqueTestDataSuffix();

  return {
    title: `Cypress ${suffix} Summit`,
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
