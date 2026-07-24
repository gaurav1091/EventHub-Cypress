const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const environments = require("../config/environments.json");

dotenv.config();

const environmentName = process.env.EVENTHUB_ENV || "qa";
const environment = environments[environmentName];

if (!environment) {
  throw new Error(`Unknown EVENTHUB_ENV "${environmentName}".`);
}

const apiBaseUrl = process.env.EVENTHUB_API_BASE_URL || environment.apiBaseUrl;
const email = process.env.EVENTHUB_USER_EMAIL;
const password = process.env.EVENTHUB_USER_PASSWORD;
const bookingPrefix = process.env.EVENTHUB_BOOKING_CLEANUP_PREFIX || "Cypress User";
const eventPrefix = process.env.EVENTHUB_EVENT_CLEANUP_PREFIX || "Cypress";
const registryPath = path.join(__dirname, "..", "reports", "test-data-registry.json");

if (!email || !password) {
  throw new Error("Missing EVENTHUB_USER_EMAIL or EVENTHUB_USER_PASSWORD.");
}

async function request(path, options = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  const body = text ? JSON.parse(text) : {};

  if (!response.ok && options.failOnStatusCode !== false) {
    throw new Error(`${options.method || "GET"} ${path} failed with ${response.status}`);
  }

  return { status: response.status, body };
}

async function login() {
  const response = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (!response.body.token) {
    throw new Error("Login succeeded without an API token.");
  }

  return response.body.token;
}

async function authenticatedRequest(token, path, options = {}) {
  return request(path, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });
}

function createEmptyRegistry() {
  return {
    bookings: [],
    events: [],
  };
}

function readRegistry() {
  if (!fs.existsSync(registryPath)) {
    return createEmptyRegistry();
  }

  return {
    ...createEmptyRegistry(),
    ...JSON.parse(fs.readFileSync(registryPath, "utf8")),
  };
}

function clearRegistry() {
  fs.mkdirSync(path.dirname(registryPath), { recursive: true });
  fs.writeFileSync(registryPath, `${JSON.stringify(createEmptyRegistry(), null, 2)}\n`);
}

async function cleanupRegisteredBookings(token, bookings) {
  for (const booking of bookings) {
    await authenticatedRequest(token, `/api/bookings/${booking.id}`, {
      method: "DELETE",
      failOnStatusCode: false,
    });
  }

  return bookings.length;
}

async function cleanupRegisteredEvents(token, events) {
  for (const event of events) {
    await authenticatedRequest(token, `/api/events/${event.id}`, {
      method: "DELETE",
      failOnStatusCode: false,
    });
  }

  return events.length;
}

async function cleanupBookings(token) {
  const response = await authenticatedRequest(token, "/api/bookings?limit=100");
  const bookings = response.body.data || [];
  const matchingBookings = bookings.filter((booking) =>
    booking.customerName?.startsWith(bookingPrefix),
  );

  for (const booking of matchingBookings) {
    await authenticatedRequest(token, `/api/bookings/${booking.id}`, {
      method: "DELETE",
      failOnStatusCode: false,
    });
  }

  return matchingBookings.length;
}

async function cleanupEvents(token) {
  const response = await authenticatedRequest(token, "/api/events");
  const events = response.body.data || [];
  const matchingEvents = events.filter(
    (event) => event.title?.startsWith(eventPrefix) && event.featured !== true,
  );

  for (const event of matchingEvents) {
    await authenticatedRequest(token, `/api/events/${event.id}`, {
      method: "DELETE",
      failOnStatusCode: false,
    });
  }

  return matchingEvents.length;
}

async function main() {
  const token = await login();
  const registry = readRegistry();
  const registeredBookingCount = await cleanupRegisteredBookings(token, registry.bookings);
  const registeredEventCount = await cleanupRegisteredEvents(token, registry.events);
  const bookingCount = await cleanupBookings(token);
  const eventCount = await cleanupEvents(token);
  clearRegistry();

  console.log(
    [
      `Cleanup complete for ${environmentName}:`,
      `${registeredBookingCount} registered bookings`,
      `${registeredEventCount} registered events`,
      `${bookingCount} prefix bookings`,
      `${eventCount} prefix events removed.`,
    ].join(" "),
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
