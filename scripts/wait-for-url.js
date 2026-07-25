const dotenv = require("dotenv");
const environments = require("../config/environments.json");

dotenv.config({ quiet: true });

const environmentName = process.env.EVENTHUB_ENV || "qa";
const environment = environments[environmentName];
const targetUrl = process.env.EVENTHUB_BASE_URL || environment?.baseUrl;
const timeoutMs = Number(process.env.EVENTHUB_WAIT_TIMEOUT_MS || 120000);
const intervalMs = Number(process.env.EVENTHUB_WAIT_INTERVAL_MS || 5000);
const requestTimeoutMs = Number(process.env.EVENTHUB_WAIT_REQUEST_TIMEOUT_MS || 10000);

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function describeUrl(url) {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.host;
  } catch {
    return "configured baseUrl";
  }
}

async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);

  try {
    return await fetch(url, {
      method: "GET",
      redirect: "manual",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function isReachable(url) {
  const response = await fetchWithTimeout(url);
  return response.status < 500;
}

async function main() {
  if (!environment) {
    throw new Error(`Unknown EVENTHUB_ENV "${environmentName}".`);
  }

  if (!targetUrl) {
    throw new Error("Missing EVENTHUB_BASE_URL and no profile baseUrl is configured.");
  }

  const deadline = Date.now() + timeoutMs;
  const urlLabel = describeUrl(targetUrl);
  let attempt = 1;
  let lastError = null;

  console.log(`[wait:app] Waiting for EventHub UI at ${urlLabel}.`);

  while (Date.now() <= deadline) {
    try {
      if (await isReachable(targetUrl)) {
        console.log(`[wait:app] EventHub UI is reachable at ${urlLabel}.`);
        return;
      }

      lastError = new Error("Received repeated 5xx responses.");
    } catch (error) {
      lastError = error;
    }

    console.log(
      `[wait:app] Attempt ${attempt} failed: ${lastError.message}. Retrying in ${
        intervalMs / 1000
      }s.`,
    );
    attempt += 1;
    await sleep(intervalMs);
  }

  throw new Error(
    `EventHub UI was not reachable at ${urlLabel} within ${timeoutMs / 1000}s: ${
      lastError?.message || "timed out"
    }`,
  );
}

main().catch((error) => {
  console.error(`[wait:app] ${error.message}`);
  process.exitCode = 1;
});
