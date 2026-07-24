const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");

const screenshotsRoot =
  process.env.EVENTHUB_VISUAL_SCREENSHOTS_DIR || path.join("cypress", "screenshots");
const baselineRoot =
  process.env.EVENTHUB_VISUAL_BASELINE_DIR || path.join("cypress", "visual-baselines");
const diffRoot = process.env.EVENTHUB_VISUAL_DIFF_DIR || path.join("reports", "visual-diffs");
const threshold = Number(process.env.EVENTHUB_VISUAL_THRESHOLD || 0.02);
const requireBaselines = process.env.EVENTHUB_VISUAL_REQUIRE_BASELINES === "true";

function findPngs(root) {
  if (!fs.existsSync(root)) {
    return [];
  }

  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(root, entry.name);

    if (entry.isDirectory()) {
      return findPngs(entryPath);
    }

    return entry.name.endsWith(".png") ? [entryPath] : [];
  });
}

function baselineName(screenshotPath) {
  return path.basename(screenshotPath);
}

async function main() {
  const { default: pixelmatch } = await import("pixelmatch");
  const screenshots = findPngs(screenshotsRoot).filter((screenshot) =>
    screenshot.split(path.sep).includes("visual"),
  );
  const results = [];

  fs.mkdirSync(diffRoot, { recursive: true });

  for (const screenshotPath of screenshots) {
    const name = baselineName(screenshotPath);
    const baselinePath = path.join(baselineRoot, name);
    const diffPath = path.join(diffRoot, name);

    if (!fs.existsSync(baselinePath)) {
      results.push({
        name,
        status: requireBaselines ? "missing-baseline" : "baseline-not-found",
        screenshotPath,
        baselinePath,
      });
      continue;
    }

    const screenshot = PNG.sync.read(fs.readFileSync(screenshotPath));
    const baseline = PNG.sync.read(fs.readFileSync(baselinePath));

    if (screenshot.width !== baseline.width || screenshot.height !== baseline.height) {
      results.push({
        name,
        status: "dimension-mismatch",
        screenshotPath,
        baselinePath,
        screenshotSize: `${screenshot.width}x${screenshot.height}`,
        baselineSize: `${baseline.width}x${baseline.height}`,
      });
      continue;
    }

    const diff = new PNG({ width: screenshot.width, height: screenshot.height });
    const mismatchedPixels = pixelmatch(
      screenshot.data,
      baseline.data,
      diff.data,
      screenshot.width,
      screenshot.height,
      { threshold: 0.1 },
    );
    const totalPixels = screenshot.width * screenshot.height;
    const mismatchRatio = mismatchedPixels / totalPixels;

    if (mismatchRatio > threshold) {
      fs.writeFileSync(diffPath, PNG.sync.write(diff));
    }

    results.push({
      name,
      status: mismatchRatio <= threshold ? "passed" : "failed",
      screenshotPath,
      baselinePath,
      diffPath: mismatchRatio > threshold ? diffPath : null,
      mismatchedPixels,
      mismatchRatio,
      threshold,
    });
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    screenshotsRoot,
    baselineRoot,
    diffRoot,
    threshold,
    totals: {
      screenshots: results.length,
      passed: results.filter((result) => result.status === "passed").length,
      failed: results.filter((result) => result.status === "failed").length,
      missingBaselines: results.filter((result) =>
        ["missing-baseline", "baseline-not-found"].includes(result.status),
      ).length,
      dimensionMismatches: results.filter((result) => result.status === "dimension-mismatch")
        .length,
    },
    results,
  };

  fs.writeFileSync(
    path.join(diffRoot, "visual-comparison-summary.json"),
    `${JSON.stringify(summary, null, 2)}\n`,
  );

  const hardFailures = results.filter((result) =>
    ["failed", "dimension-mismatch", "missing-baseline"].includes(result.status),
  );

  console.log(
    `Visual comparison completed: ${summary.totals.passed}/${summary.totals.screenshots} passed, ${summary.totals.missingBaselines} without baselines.`,
  );

  if (hardFailures.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
