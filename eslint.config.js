const cypress = require("eslint-plugin-cypress");

module.exports = [
  {
    ignores: ["node_modules/**", "reports/**", "cypress/screenshots/**", "cypress/videos/**"],
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
      globals: {
        cy: "readonly",
        Cypress: "readonly",
        expect: "readonly",
      },
    },
    plugins: {
      cypress,
    },
    rules: {
      "cypress/no-unnecessary-waiting": "warn",
      "no-console": "off",
    },
  },
];
