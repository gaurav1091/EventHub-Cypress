const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const messagesPath = path.join("reports", "cucumber", "messages.ndjson");
const htmlPath = path.join("reports", "cucumber", "cucumber-report.html");
const formatterPath = path.join(
  "node_modules",
  "@badeball",
  "cypress-cucumber-preprocessor",
  "dist",
  "bin",
  "cucumber-html-formatter.js",
);

if (!fs.existsSync(messagesPath) || fs.statSync(messagesPath).size === 0) {
  console.warn(`Skipping HTML report generation. Missing or empty: ${messagesPath}`);
  process.exit(0);
}

fs.mkdirSync(path.dirname(htmlPath), { recursive: true });

const result = spawnSync(process.execPath, [formatterPath], {
  input: fs.readFileSync(messagesPath),
  encoding: "utf8",
  maxBuffer: 50 * 1024 * 1024,
});

if (result.error) {
  throw result.error;
}

if (result.status !== 0) {
  process.stderr.write(result.stderr);
  process.exit(result.status);
}

fs.writeFileSync(htmlPath, result.stdout);
console.log(`Cucumber HTML report generated at ${htmlPath}`);
