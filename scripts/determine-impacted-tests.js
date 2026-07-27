const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const outputPath =
  process.env.EVENTHUB_IMPACT_OUTPUT || path.join("reports", "impact", "impact-summary.json");
const githubOutputPath = process.env.GITHUB_OUTPUT;
const githubStepSummaryPath = process.env.GITHUB_STEP_SUMMARY;

const domainRules = [
  {
    name: "auth-events",
    specs: ["cypress/e2e/features/auth/*.feature", "cypress/e2e/features/events/*.feature"],
    patterns: [
      /^cypress\/e2e\/features\/auth\//,
      /^cypress\/e2e\/features\/events\//,
      /^cypress\/e2e\/step_definitions\/auth\//,
      /^cypress\/e2e\/step_definitions\/events\//,
      /^cypress\/support\/pages\/(LoginPage|EventsPage|EventDetailPage|HomePage)\.js$/,
      /^cypress\/support\/components\/NavigationBar\.js$/,
    ],
  },
  {
    name: "bookings",
    specs: ["cypress/e2e/features/bookings/*.feature"],
    patterns: [
      /^cypress\/e2e\/features\/bookings\//,
      /^cypress\/e2e\/step_definitions\/bookings\//,
      /^cypress\/support\/pages\/(BookingsPage|EventDetailPage)\.js$/,
    ],
  },
  {
    name: "admin",
    specs: ["cypress/e2e/features/admin/*.feature"],
    patterns: [
      /^cypress\/e2e\/features\/admin\//,
      /^cypress\/e2e\/step_definitions\/admin\//,
      /^cypress\/support\/pages\/AdminEventsPage\.js$/,
    ],
  },
  {
    name: "api-hybrid",
    specs: ["cypress/e2e/features/api/*.feature", "cypress/e2e/features/hybrid/*.feature"],
    patterns: [
      /^cypress\/e2e\/features\/api\//,
      /^cypress\/e2e\/features\/hybrid\//,
      /^cypress\/e2e\/step_definitions\/api\//,
      /^cypress\/e2e\/step_definitions\/hybrid\//,
      /^cypress\/support\/api\//,
    ],
  },
  {
    name: "accessibility",
    specs: ["cypress/e2e/features/accessibility/*.feature"],
    patterns: [
      /^cypress\/e2e\/features\/accessibility\//,
      /^cypress\/e2e\/step_definitions\/accessibility\//,
      /^cypress\/support\/accessibility\//,
    ],
  },
  {
    name: "visual",
    specs: ["cypress/e2e/features/visual/*.feature"],
    patterns: [
      /^cypress\/e2e\/features\/visual\//,
      /^cypress\/e2e\/step_definitions\/visual\//,
      /^cypress\/visual-baselines\//,
      /^scripts\/(compare|approve)-visual-baselines\.js$/,
    ],
  },
];

const fullRegressionPatterns = [
  /^\.github\/workflows\//,
  /^cypress\.config\.js$/,
  /^package(-lock)?\.json$/,
  /^\.npmrc$/,
  /^config\/environments\.json$/,
  /^cypress\/support\/(commands|e2e)\.js$/,
  /^cypress\/support\/constants\//,
  /^cypress\/support\/data\//,
  /^cypress\/support\/utils\//,
  /^cypress\/e2e\/step_definitions\/common\//,
  /^scripts\/(doctor|wait-for-url|cleanup-test-data)\.js$/,
];

function runGit(args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

function changedFilesFromEnvironment() {
  const changedFiles = process.env.EVENTHUB_CHANGED_FILES;

  if (!changedFiles) {
    return null;
  }

  return changedFiles
    .split(/\r?\n|,/)
    .map((file) => file.trim())
    .filter(Boolean);
}

function changedFilesFromGit() {
  const baseSha = process.env.EVENTHUB_BASE_SHA || process.env.GITHUB_BASE_SHA;
  const headSha = process.env.EVENTHUB_HEAD_SHA || process.env.GITHUB_SHA || "HEAD";

  if (baseSha) {
    return runGit(["diff", "--name-only", `${baseSha}...${headSha}`])
      .split("\n")
      .filter(Boolean);
  }

  return runGit(["diff", "--name-only", "HEAD"]).split("\n").filter(Boolean);
}

function unique(values) {
  return [...new Set(values)];
}

function determineImpact(changedFiles) {
  const normalizedFiles = changedFiles.map((file) => file.replaceAll(path.sep, "/"));
  const fullRegression = normalizedFiles.some((file) =>
    fullRegressionPatterns.some((pattern) => pattern.test(file)),
  );
  const impactedDomains = fullRegression
    ? domainRules.map((rule) => rule.name)
    : domainRules
        .filter((rule) =>
          normalizedFiles.some((file) => rule.patterns.some((pattern) => pattern.test(file))),
        )
        .map((rule) => rule.name);
  const impactedRules = domainRules.filter((rule) => impactedDomains.includes(rule.name));
  const impactedSpecs = unique(impactedRules.flatMap((rule) => rule.specs));

  return {
    generatedAt: new Date().toISOString(),
    changedFiles: normalizedFiles,
    fullRegression,
    impactedDomains,
    impactedSpecs,
    cypressSpecArgument: impactedSpecs.join(","),
    recommendation:
      impactedSpecs.length > 0
        ? "Run smoke plus impacted regression domains before full scheduled regression."
        : "Run smoke only unless product risk or review context suggests broader regression.",
  };
}

function writeGithubOutput(impact) {
  if (!githubOutputPath) {
    return;
  }

  fs.appendFileSync(
    githubOutputPath,
    [
      `full_regression=${impact.fullRegression}`,
      `domains=${impact.impactedDomains.join(",")}`,
      `specs=${impact.cypressSpecArgument}`,
      "",
    ].join("\n"),
  );
}

function writeGithubStepSummary(impact) {
  if (!githubStepSummaryPath) {
    return;
  }

  const lines = [
    "## EventHub Test Impact",
    "",
    `Full regression recommended: **${impact.fullRegression ? "yes" : "no"}**`,
    "",
    `Impacted domains: ${impact.impactedDomains.length ? impact.impactedDomains.join(", ") : "none"}`,
    "",
    "### Changed Files",
    "",
    ...impact.changedFiles.map((file) => `- \`${file}\``),
    "",
    "### Impacted Specs",
    "",
    ...(impact.impactedSpecs.length
      ? impact.impactedSpecs.map((spec) => `- \`${spec}\``)
      : ["- No domain-specific regression specs detected."]),
    "",
  ];

  fs.appendFileSync(githubStepSummaryPath, `${lines.join("\n")}\n`);
}

const changedFiles = changedFilesFromEnvironment() || changedFilesFromGit();
const impact = determineImpact(changedFiles);

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(impact, null, 2)}\n`);
writeGithubOutput(impact);
writeGithubStepSummary(impact);

console.log(
  `Impact summary generated at ${outputPath}: ${impact.impactedDomains.length || 0} domain(s), fullRegression=${impact.fullRegression}.`,
);
