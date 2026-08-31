/**
 * gen-thumbs.mjs — generate small responsive thumbnails for card-grid images.
 *
 * Card-grid image sources (the only images this script touches):
 *   - recipes.js   -> recipe.image      (rendered by src/components/RecipeCard.jsx)
 *   - cookbook.js  -> item.heroImage    (rendered by the card in src/pages/CookbookPage.jsx)
 *
 * Note: cookbook card entries use `heroImage`, NOT `image` — confirmed against
 * CookbookPage.jsx's <img src={item.heroImage} .../>.
 *
 * Every non-live ("placeholder") recipe points at an external Unsplash URL, so the
 * `/images/` prefix filter naturally reduces the recipe set to the live ones.
 *
 * Output:
 *   - public/images/**\/<name>-sm.webp   (640px wide max, quality 72)
 *   - src/data/thumbs.json               ({ "<original path>": "<thumb path>" })
 *
 * Idempotent: a thumb is regenerated only when it is missing or older than its source.
 * Requires the `magick` (ImageMagick 7) CLI. No npm deps.
 */
import { pathToFileURL } from "url";
import { resolve, dirname, join } from "path";
import { existsSync, statSync, mkdirSync, writeFileSync } from "fs";
import { execFileSync } from "child_process";

const MAGICK = "/opt/homebrew/bin/magick";
const PUBLIC_DIR = resolve("public");
const MANIFEST_PATH = resolve("src/data/thumbs.json");
const WIDTH = 640;
const QUALITY = 72;

// ---------------------------------------------------------------- load data
const recipesUrl = pathToFileURL(resolve("src/data/recipes.js")).href;
const { default: recipes } = await import(recipesUrl);

const cookbookUrl = pathToFileURL(resolve("src/data/cookbook.js")).href;
const cookbookMod = await import(cookbookUrl);
const COOKBOOK_ARRAYS = [
  "sauces",
  "breakfasts",
  "quickLunches",
  "desserts",
  "bases",
  "powerups",
  "snackBoxes",
];

const cookbookEntries = [];
for (const key of COOKBOOK_ARRAYS) {
  const arr = cookbookMod[key];
  if (!Array.isArray(arr)) {
    console.warn(`WARN: cookbook.js export "${key}" is not an array — skipping.`);
    continue;
  }
  cookbookEntries.push(...arr);
}

// ------------------------------------------------------- collect card images
/** Public-path -> true. Ordered set of candidate card images. */
const candidates = new Set();

for (const r of recipes) {
  if (typeof r?.image === "string") candidates.add(r.image);
}
for (const c of cookbookEntries) {
  if (typeof c?.heroImage === "string") candidates.add(c.heroImage);
}

/** `/images/foo/hero.png` -> `/images/foo/hero-sm.webp` */
function thumbPathFor(publicPath) {
  const withoutExt = publicPath.replace(/\.[a-zA-Z0-9]+$/, "");
  return `${withoutExt}-sm.webp`;
}

const skipped = { external: [], alreadyThumb: [], missing: [] };
const work = []; // { src, srcAbs, dest, destAbs }

for (const p of candidates) {
  if (!p.startsWith("/images/")) {
    skipped.external.push(p);
    continue;
  }
  if (/-sm\.webp$/i.test(p)) {
    // Already a small variant — don't create `-sm-sm`.
    skipped.alreadyThumb.push(p);
    continue;
  }
  const srcAbs = join(PUBLIC_DIR, p.replace(/^\//, ""));
  if (!existsSync(srcAbs)) {
    skipped.missing.push(p);
    continue;
  }
  const dest = thumbPathFor(p);
  work.push({ src: p, srcAbs, dest, destAbs: join(PUBLIC_DIR, dest.replace(/^\//, "")) });
}

work.sort((a, b) => (a.src < b.src ? -1 : a.src > b.src ? 1 : 0));

// ------------------------------------------------------------------ generate
let generated = 0;
let fresh = 0;
let failed = 0;
let bytesBefore = 0;
let bytesAfter = 0;
const manifest = {};

for (const item of work) {
  const srcStat = statSync(item.srcAbs);

  if (existsSync(item.destAbs) && statSync(item.destAbs).mtimeMs >= srcStat.mtimeMs) {
    fresh++;
    manifest[item.src] = item.dest;
    continue;
  }

  mkdirSync(dirname(item.destAbs), { recursive: true });

  try {
    // `640x>` = shrink-only: never upscale a source narrower than 640px, but
    // still re-encode it to webp at native width.
    execFileSync(
      MAGICK,
      [item.srcAbs, "-resize", `${WIDTH}x>`, "-quality", String(QUALITY), item.destAbs],
      { stdio: ["ignore", "ignore", "pipe"] },
    );
  } catch (err) {
    failed++;
    const detail = err?.stderr?.toString().trim() || err.message;
    console.error(`ERROR: failed to generate ${item.dest} — ${detail}`);
    continue;
  }

  generated++;
  bytesBefore += srcStat.size;
  bytesAfter += statSync(item.destAbs).size;
  manifest[item.src] = item.dest;
}

// ------------------------------------------------------------------ manifest
const sortedManifest = {};
for (const key of Object.keys(manifest).sort()) sortedManifest[key] = manifest[key];
writeFileSync(MANIFEST_PATH, `${JSON.stringify(sortedManifest, null, 2)}\n`, "utf8");

// ------------------------------------------------------------------- summary
const mb = (n) => (n / 1024 / 1024).toFixed(2);
const pct = bytesBefore > 0 ? (100 - (bytesAfter / bytesBefore) * 100).toFixed(1) : "0.0";

console.log("");
console.log("gen-thumbs summary");
console.log("------------------");
console.log(`card images found      : ${candidates.size}`);
console.log(`thumbs generated       : ${generated}`);
console.log(`skipped (already fresh): ${fresh}`);
console.log(`skipped (external URL) : ${skipped.external.length}`);
console.log(`skipped (already -sm)  : ${skipped.alreadyThumb.length}`);
console.log(`sources missing on disk: ${skipped.missing.length}`);
if (failed > 0) console.log(`FAILED                 : ${failed}`);
console.log(`generated set bytes    : ${mb(bytesBefore)} MB -> ${mb(bytesAfter)} MB (-${pct}%)`);
console.log(`manifest entries       : ${Object.keys(sortedManifest).length} -> src/data/thumbs.json`);

if (skipped.missing.length > 0) {
  console.log("");
  console.log("Missing sources (referenced by data but absent under public/):");
  for (const p of skipped.missing.sort()) console.log(`  ${p}`);
}

if (failed > 0) process.exitCode = 1;
