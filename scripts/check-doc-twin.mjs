import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { minimatch } from "minimatch";

const baseRef = process.env.BASE_REF || "origin/main";

const changed = execSync(`git diff --name-only ${baseRef}...HEAD`, { encoding: "utf8" })
  .split("\n")
  .filter(Boolean);

const map = JSON.parse(readFileSync("docs/doc-map.json", "utf8"));
const changedDocs = new Set(changed.filter(f => f.startsWith("docs/") || f === "docs/openapi.yaml"));

const missing = [];
for (const { globs, docs } of map.mappings) {
  const codeTouched = changed.some(f => globs.some(g => minimatch(f, g, { dot: true })));
  if (!codeTouched) continue;
  for (const d of docs) {
    if (!changedDocs.has(d)) missing.push(d);
  }
}

const skipLabels = (process.env.PR_LABELS || "").split(",").map(s => s.trim()).filter(Boolean);
const canSkip = skipLabels.some(l => (map.allow_skip_labels || []).includes(l));

if (missing.length && !canSkip) {
  console.error("❌ Doc-Twin 누락:\n" + [...new Set(missing)].map(d => `- ${d}`).join("\n"));
  console.error("\n해결: 해당 문서에 Changelog 1줄이라도 추가 후 다시 커밋하세요.");
  process.exit(1);
} else {
  console.log("✅ Doc-Twin 통과");
}
