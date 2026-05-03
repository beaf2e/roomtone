// Bumps the CACHE version in public/sw.js to a fresh build id on every build.
// Why: ensures previously installed clients (PWA / browser) detect the SW as
// changed and pull the latest chunks immediately instead of serving stale cache.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const swPath = join(here, "..", "public", "sw.js");

const buildId = new Date()
  .toISOString()
  .replace(/[-:T]/g, "")
  .slice(0, 14);

const src = readFileSync(swPath, "utf8");
const next = src.replace(
  /const CACHE = "roomtone-[^"]+";/,
  `const CACHE = "roomtone-${buildId}";`,
);
if (next === src) {
  throw new Error("bump-sw-cache: could not find CACHE constant in public/sw.js");
}
writeFileSync(swPath, next);
console.log(`[bump-sw-cache] roomtone-${buildId}`);
