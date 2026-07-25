const { spawnSync } = require("child_process");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const environments = require("../config/environments.json");
const packageJson = require("../package.json");

dotenv.config({ quiet: true });

const checks = [];

function record(name, passed, details = "") {
  checks.push({ name, passed, details });
}

function assertNodeVersion() {
  const requiredMajor = Number(packageJson.engines.node.match(/\d+/)?.[0] || 0);
  const currentMajor = Number(process.versions.node.split(".")[0]);

  record(
    "Node version",
    currentMajor >= requiredMajor,
    `current=${process.versions.node}, required=${packageJson.engines.node}`,
  );
}

function assertEnvironmentProfile() {
  const environmentName = process.env.EVENTHUB_ENV || "qa";
  const environment = environments[environmentName];

  record(
    "Environment profile",
    Boolean(environment),
    environment ? `EVENTHUB_ENV=${environmentName}` : `Unknown EVENTHUB_ENV=${environmentName}`,
  );

  return { environmentName, environment };
}

function assertCredentials() {
  record("User email", Boolean(process.env.EVENTHUB_USER_EMAIL), "EVENTHUB_USER_EMAIL");
  record("User password", Boolean(process.env.EVENTHUB_USER_PASSWORD), "EVENTHUB_USER_PASSWORD");
}

function assertCypressBinary() {
  const result = spawnSync("npx", ["cypress", "version"], {
    encoding: "utf8",
    maxBuffer: 1024 * 1024,
  });

  record(
    "Cypress binary",
    result.status === 0,
    result.status === 0 ? result.stdout.trim().split("\n")[0] : result.stderr.trim(),
  );
}

function assertReportFolders() {
  ["reports", path.join("reports", "cucumber"), path.join("reports", "history")].forEach(
    (folder) => {
      fs.mkdirSync(folder, { recursive: true });
      record("Report folder", fs.existsSync(folder), folder);
    },
  );
}

async function assertApiHealth(apiBaseUrl) {
  try {
    const response = await fetch(`${apiBaseUrl}/api/health`);
    const body = await response.json();

    record(
      "API health",
      response.ok && body.status === "ok",
      `status=${response.status}, apiStatus=${body.status}`,
    );
  } catch (error) {
    record("API health", false, error.message);
  }
}

async function assertApiLogin(apiBaseUrl) {
  if (!process.env.EVENTHUB_USER_EMAIL || !process.env.EVENTHUB_USER_PASSWORD) {
    record("API login", false, "Missing credentials");
    return;
  }

  try {
    const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: process.env.EVENTHUB_USER_EMAIL,
        password: process.env.EVENTHUB_USER_PASSWORD,
      }),
    });
    const body = await response.json();

    record(
      "API login",
      response.ok && body.success === true && Boolean(body.token),
      `status=${response.status}, user=${body.user?.email || "unknown"}`,
    );
  } catch (error) {
    record("API login", false, error.message);
  }
}

async function main() {
  assertNodeVersion();
  const { environment } = assertEnvironmentProfile();
  assertCredentials();
  assertCypressBinary();
  assertReportFolders();

  if (environment) {
    const apiBaseUrl = process.env.EVENTHUB_API_BASE_URL || environment.apiBaseUrl;
    await assertApiHealth(apiBaseUrl);
    await assertApiLogin(apiBaseUrl);
  }

  const failedChecks = checks.filter((check) => !check.passed);

  checks.forEach((check) => {
    const marker = check.passed ? "PASS" : "FAIL";
    console.log(`[${marker}] ${check.name}${check.details ? ` - ${check.details}` : ""}`);
  });

  if (failedChecks.length > 0) {
    process.exitCode = 1;
  }
}

main();
