const { defineConfig } = require("cypress");
const createBundler = require("@bahmutov/cypress-esbuild-preprocessor");
const { addCucumberPreprocessorPlugin } = require("@badeball/cypress-cucumber-preprocessor");
const { createEsbuildPlugin } = require("@badeball/cypress-cucumber-preprocessor/esbuild");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const environments = require("./config/environments.json");

dotenv.config({ quiet: true });

const environmentName = process.env.EVENTHUB_ENV || "qa";
const environment = environments[environmentName];
const isCi = process.env.CI === "true";
const testDataNamespace =
  process.env.EVENTHUB_TEST_DATA_NAMESPACE ||
  [process.env.GITHUB_RUN_ID, process.env.GITHUB_JOB].filter(Boolean).join("-") ||
  "local";

if (!environment) {
  throw new Error(
    `Unknown EVENTHUB_ENV "${environmentName}". Add it to config/environments.json before running Cypress.`,
  );
}

const testDataRegistryPath = path.join(__dirname, "reports", "test-data-registry.json");

function createEmptyTestDataRegistry() {
  return {
    bookings: [],
    events: [],
  };
}

function readTestDataRegistry() {
  if (!fs.existsSync(testDataRegistryPath)) {
    return createEmptyTestDataRegistry();
  }

  return {
    ...createEmptyTestDataRegistry(),
    ...JSON.parse(fs.readFileSync(testDataRegistryPath, "utf8")),
  };
}

function writeTestDataRegistry(registry) {
  fs.mkdirSync(path.dirname(testDataRegistryPath), { recursive: true });
  fs.writeFileSync(testDataRegistryPath, `${JSON.stringify(registry, null, 2)}\n`);
}

async function setupNodeEvents(on, config) {
  await addCucumberPreprocessorPlugin(on, config);

  on(
    "file:preprocessor",
    createBundler({
      plugins: [createEsbuildPlugin(config)],
    }),
  );

  on("task", {
    log(message) {
      console.log(message);
      return null;
    },
    registerTestData({ type, id, label = null }) {
      const registry = readTestDataRegistry();
      const bucket = registry[type];

      if (!bucket || !id) {
        return null;
      }

      if (!bucket.some((entry) => String(entry.id) === String(id))) {
        bucket.push({
          id,
          label,
          createdAt: new Date().toISOString(),
        });
        writeTestDataRegistry(registry);
      }

      return null;
    },
    getTestDataRegistry() {
      return readTestDataRegistry();
    },
    clearTestDataRegistry() {
      writeTestDataRegistry(createEmptyTestDataRegistry());
      return null;
    },
  });

  config.env = {
    ...config.env,
    environmentName,
    testDataNamespace,
    bookingCleanupPrefix:
      process.env.EVENTHUB_BOOKING_CLEANUP_PREFIX || `Cypress User ${testDataNamespace}`,
    eventCleanupPrefix: process.env.EVENTHUB_EVENT_CLEANUP_PREFIX || `Cypress ${testDataNamespace}`,
    userEmail: process.env.EVENTHUB_USER_EMAIL || config.env.userEmail,
    userPassword: process.env.EVENTHUB_USER_PASSWORD || config.env.userPassword,
  };

  return config;
}

module.exports = defineConfig({
  defaultCommandTimeout: 12000,
  pageLoadTimeout: 60000,
  requestTimeout: 30000,
  responseTimeout: 30000,
  retries: {
    runMode: isCi ? 1 : 0,
    openMode: 0,
  },
  video: true,
  screenshotOnRunFailure: true,
  reporter: "spec",
  e2e: {
    baseUrl: process.env.EVENTHUB_BASE_URL || environment.baseUrl,
    specPattern: "cypress/e2e/features/**/*.feature",
    supportFile: "cypress/support/e2e.js",
    setupNodeEvents,
    env: {
      apiBaseUrl: process.env.EVENTHUB_API_BASE_URL || environment.apiBaseUrl,
    },
  },
});
