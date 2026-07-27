const fs = require("fs");
const path = require("path");
const packageJson = require("../package.json");
const testSuites = require("../config/test-suites.json");

const rootDir = path.join(__dirname, "..");
const checks = [];

function record(name, passed, details = "") {
  checks.push({ name, passed, details });
}

function walk(dir, predicate = () => true) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      return walk(entryPath, predicate);
    }

    return predicate(entryPath) ? [entryPath] : [];
  });
}

function toRelative(filePath) {
  return path.relative(rootDir, filePath).replaceAll(path.sep, "/");
}

function read(filePath) {
  return fs.readFileSync(path.join(rootDir, filePath), "utf8");
}

function assertRequiredFiles() {
  [
    "README.md",
    "cypress.config.js",
    "config/environments.json",
    "config/test-suites.json",
    "cypress/fixtures/contracts/eventhub-api-contract.json",
    "docs/contributing.md",
    "docs/test-authoring-guide.md",
    "docs/tagging-strategy.md",
    "docs/ci-strategy.md",
    "docs/docker.md",
  ].forEach((file) => {
    record("Required file", fs.existsSync(path.join(rootDir, file)), file);
  });
}

function assertPackageScripts() {
  [
    "doctor",
    "doctor:framework",
    "framework:inventory",
    "test:smoke",
    "test:regression",
    "test:api",
    "test:visual",
    "docker:smoke",
    "report:dashboard",
    "report:pr-comment",
  ].forEach((scriptName) => {
    record("Package script", Boolean(packageJson.scripts[scriptName]), scriptName);
  });
}

function assertSuiteManifest() {
  const suiteNames = testSuites.suites.map((suite) => suite.name);

  record("Suite manifest version", /^\d+\.\d+\.\d+$/.test(testSuites.version), testSuites.version);
  record("Suite names unique", suiteNames.length === new Set(suiteNames).size);

  testSuites.suites.forEach((suite) => {
    record("Suite has risk", Boolean(suite.risk), suite.name);
    record("Suite has CI behavior", Boolean(suite.ciBehavior), suite.name);
    record(
      "Suite has tags or specs",
      Boolean(suite.tags?.length || suite.specs?.length),
      suite.name,
    );
  });
}

function featureFiles() {
  return walk(path.join(rootDir, "cypress", "e2e", "features"), (file) =>
    file.endsWith(".feature"),
  );
}

function assertFeatureHealth() {
  const files = featureFiles();
  const scenarioNames = new Map();

  record("Feature files present", files.length > 0, `${files.length} feature file(s)`);

  files.forEach((file) => {
    const relative = toRelative(file);
    const contents = fs.readFileSync(file, "utf8");
    const tags = contents
      .split("\n")
      .filter((line) => line.trim().startsWith("@"))
      .flatMap((line) => line.trim().split(/\s+/));
    const scenarios = [...contents.matchAll(/^\s*Scenario(?: Outline)?:\s+(.+)$/gm)].map((match) =>
      match[1].trim(),
    );

    record("Feature has tags", tags.length > 0, relative);
    record("Feature has scenarios", scenarios.length > 0, relative);

    scenarios.forEach((scenario) => {
      const locations = scenarioNames.get(scenario) || [];
      locations.push(relative);
      scenarioNames.set(scenario, locations);
    });
  });

  const duplicates = [...scenarioNames.entries()].filter(([, locations]) => locations.length > 1);

  record(
    "Scenario names unique",
    duplicates.length === 0,
    duplicates.map(([scenario]) => scenario).join(", "),
  );
}

function assertStatefulCleanup() {
  const hooks = read("cypress/e2e/step_definitions/common/hooks.js");
  const commands = read("cypress/support/commands.js");

  record("Stateful before cleanup hook", hooks.includes('Before({ tags: "@stateful" }'));
  record("Stateful after cleanup hook", hooks.includes('After({ tags: "@stateful" }'));
  record("Cleanup command registered", commands.includes("cleanupTestData"));
}

function assertApiContract() {
  const contract = JSON.parse(read("cypress/fixtures/contracts/eventhub-api-contract.json"));
  const operationIds = contract.operations.map((operation) => operation.operationId);

  record(
    "API contract has operations",
    contract.operations.length >= 8,
    `${contract.operations.length}`,
  );
  record("API operation ids unique", operationIds.length === new Set(operationIds).size);
  record(
    "API contract covers core flows",
    ["login", "listEvents", "getEvent", "createBooking", "deleteBooking"].every((operationId) =>
      operationIds.includes(operationId),
    ),
  );
}

function assertSelectorAndRouteStrategy() {
  record(
    "Route constants present",
    fs.existsSync(path.join(rootDir, "cypress/support/constants/routes.js")),
  );
  record(
    "Selector helpers present",
    fs.existsSync(path.join(rootDir, "cypress/support/utils/selectors.js")),
  );
}

assertRequiredFiles();
assertPackageScripts();
assertSuiteManifest();
assertFeatureHealth();
assertStatefulCleanup();
assertApiContract();
assertSelectorAndRouteStrategy();

checks.forEach((check) => {
  const marker = check.passed ? "PASS" : "FAIL";
  console.log(`[${marker}] ${check.name}${check.details ? ` - ${check.details}` : ""}`);
});

const failures = checks.filter((check) => !check.passed);

if (failures.length > 0) {
  process.exitCode = 1;
}
