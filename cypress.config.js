const { defineConfig } = require("cypress");
const createBundler = require("@bahmutov/cypress-esbuild-preprocessor");
const { addCucumberPreprocessorPlugin } = require("@badeball/cypress-cucumber-preprocessor");
const { createEsbuildPlugin } = require("@badeball/cypress-cucumber-preprocessor/esbuild");
const dotenv = require("dotenv");

dotenv.config();

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
  });

  config.env = {
    ...config.env,
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
    runMode: 1,
    openMode: 0,
  },
  video: true,
  screenshotOnRunFailure: true,
  reporter: "spec",
  e2e: {
    baseUrl: process.env.EVENTHUB_BASE_URL || "https://eventhub.rahulshettyacademy.com",
    specPattern: "cypress/e2e/features/**/*.feature",
    supportFile: "cypress/support/e2e.js",
    setupNodeEvents,
    env: {
      apiBaseUrl:
        process.env.EVENTHUB_API_BASE_URL || "https://api.eventhub.rahulshettyacademy.com",
    },
  },
});
