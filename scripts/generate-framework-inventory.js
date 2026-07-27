const fs = require("fs");
const path = require("path");
const testSuites = require("../config/test-suites.json");

const rootDir = path.join(__dirname, "..");
const outputDir = path.join(rootDir, "reports");
const jsonPath = path.join(outputDir, "framework-inventory.json");
const markdownPath = path.join(outputDir, "framework-inventory.md");

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

function relative(filePath) {
  return path.relative(rootDir, filePath).replaceAll(path.sep, "/");
}

function parseFeature(filePath) {
  const contents = fs.readFileSync(filePath, "utf8");
  const tags = contents
    .split("\n")
    .filter((line) => line.trim().startsWith("@"))
    .flatMap((line) => line.trim().split(/\s+/));
  const feature = contents.match(/^\s*Feature:\s+(.+)$/m)?.[1]?.trim() || path.basename(filePath);
  const scenarios = [...contents.matchAll(/^\s*Scenario(?: Outline)?:\s+(.+)$/gm)].map((match) =>
    match[1].trim(),
  );

  return {
    file: relative(filePath),
    feature,
    tags: [...new Set(tags)],
    scenarioCount: scenarios.length,
    scenarios,
  };
}

const features = walk(path.join(rootDir, "cypress", "e2e", "features"), (file) =>
  file.endsWith(".feature"),
).map(parseFeature);
const stepDefinitions = walk(path.join(rootDir, "cypress", "e2e", "step_definitions"), (file) =>
  file.endsWith(".js"),
).map(relative);
const pageObjects = walk(path.join(rootDir, "cypress", "support", "pages"), (file) =>
  file.endsWith(".js"),
).map(relative);
const apiClients = walk(path.join(rootDir, "cypress", "support", "api"), (file) =>
  file.endsWith(".js"),
).map(relative);
const docs = walk(path.join(rootDir, "docs"), (file) => file.endsWith(".md")).map(relative);

const inventory = {
  generatedAt: new Date().toISOString(),
  totals: {
    suites: testSuites.suites.length,
    features: features.length,
    scenarios: features.reduce((total, feature) => total + feature.scenarioCount, 0),
    stepDefinitions: stepDefinitions.length,
    pageObjects: pageObjects.length,
    apiClients: apiClients.length,
    docs: docs.length,
  },
  suites: testSuites.suites,
  features,
  stepDefinitions,
  pageObjects,
  apiClients,
  docs,
};

const markdown = [
  "# EventHub Cypress Framework Inventory",
  "",
  `Generated: ${inventory.generatedAt}`,
  "",
  "| Area | Count |",
  "| --- | ---: |",
  `| Suites | ${inventory.totals.suites} |`,
  `| Features | ${inventory.totals.features} |`,
  `| Scenarios | ${inventory.totals.scenarios} |`,
  `| Step definitions | ${inventory.totals.stepDefinitions} |`,
  `| Page objects | ${inventory.totals.pageObjects} |`,
  `| API support files | ${inventory.totals.apiClients} |`,
  `| Docs | ${inventory.totals.docs} |`,
  "",
  "## Suites",
  "",
  "| Suite | Risk | CI Behavior |",
  "| --- | --- | --- |",
  ...inventory.suites.map((suite) => `| ${suite.name} | ${suite.risk} | ${suite.ciBehavior} |`),
  "",
  "## Features",
  "",
  "| Feature | Scenarios | Tags |",
  "| --- | ---: | --- |",
  ...features.map(
    (feature) => `| ${feature.feature} | ${feature.scenarioCount} | ${feature.tags.join(", ")} |`,
  ),
  "",
].join("\n");

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(jsonPath, `${JSON.stringify(inventory, null, 2)}\n`);
fs.writeFileSync(markdownPath, `${markdown}\n`);

console.log(`Framework inventory generated at ${jsonPath} and ${markdownPath}.`);
