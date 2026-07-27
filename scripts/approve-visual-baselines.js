const fs = require("fs");
const path = require("path");

const screenshotsRoot =
  process.env.EVENTHUB_VISUAL_SCREENSHOTS_DIR || path.join("cypress", "screenshots");
const baselineRoot =
  process.env.EVENTHUB_VISUAL_BASELINE_DIR || path.join("cypress", "visual-baselines");

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

const screenshots = findPngs(screenshotsRoot).filter((screenshot) =>
  screenshot.split(path.sep).includes("visual"),
);

fs.mkdirSync(baselineRoot, { recursive: true });

screenshots.forEach((screenshotPath) => {
  const baselinePath = path.join(baselineRoot, path.basename(screenshotPath));
  fs.copyFileSync(screenshotPath, baselinePath);
});

console.log(`Approved ${screenshots.length} visual baseline screenshot(s) into ${baselineRoot}.`);
