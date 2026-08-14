import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");

const files = [
  ["index.html", "index.html"],
  ["_headers", "_headers"],
  ["assets/logo.svg", "assets/logo.svg"],
  ["assets/community-hero.png", "assets/community-hero.png"],
  ["assets/community-family-panel.png", "assets/community-family-panel.png"],
  ["data/sensitivity_data.js", "data/sensitivity_data.js"],
  ["data/sensitivity_data.json", "data/sensitivity_data.json"]
];

fs.rmSync(dist, { recursive: true, force: true });

for (const [source, target] of files) {
  const sourcePath = path.join(root, source);
  const targetPath = path.join(dist, target);
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Missing required build input: ${source}`);
  }
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.copyFileSync(sourcePath, targetPath);
}

const unexpected = [
  "data/workbook_inspection.json",
  "tools/build_sensitivity_data.py",
  "tools/inspect_workbooks.py",
  "tools/validate_app_runtime.mjs"
].filter(file => fs.existsSync(path.join(dist, file)));

if (unexpected.length) {
  throw new Error(`Build output contains non-production files: ${unexpected.join(", ")}`);
}

console.log(`Cloudflare Pages build ready: ${path.relative(root, dist)}`);
