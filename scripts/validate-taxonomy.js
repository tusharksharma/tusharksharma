/**
 * Recipe-schema taxonomy validator. Fails the build if a recipe uses a value
 * outside the canonical set for cost/allergen surfaces, or references an image
 * file that doesn't exist on disk. Catches the class of bugs that shipped in
 * the Week 27 batch — `costTier: "low"` (not a filter option), `allergens:
 * ["egg"]` (should be "eggs"), `allergens: ["packaged-labels-vary"]` (not an
 * allergen), broken image paths.
 *
 * If you add a new taxonomy value that's genuinely canonical, add it to the
 * canonical Set here AND to the matching filter list in
 * `src/pages/DinnersPage.jsx` in the same commit. The two must stay aligned.
 *
 * Warns (does not block) on effortTag / splitAxis values outside the filter
 * whitelist — those values still render on the recipe card, they just don't
 * become filter chips.
 */
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");

const CANONICAL_COST_TIERS = new Set(["budget", "moderate", "premium"]);

// Big-8 US allergens + realistic add-ons the site actually plates. Non-allergen
// warnings (packaged-labels-vary, verify-*) belong in meta.warnings[], not here.
const CANONICAL_ALLERGENS = new Set([
  "dairy", "eggs", "fish", "shellfish", "tree-nuts", "peanuts",
  "wheat", "gluten", "soy", "sesame", "mustard",
]);

// Effort tags / split axes are classified by the shared taxonomy module —
// canonical (is a chip), alias (normalized onto a chip), or descriptive
// (deliberately not a chip). Only genuinely unrecognized vocabulary warns.
const { classifyEffortTag, classifySplitAxis } = await import(
  pathToFileURL(join(REPO_ROOT, "src/data/taxonomy.js")).href
);

const recipesRaw = readFileSync(join(REPO_ROOT, "src/data/recipes.js"), "utf-8");

let errors = 0;
let warnings = 0;

// Walk each recipe block (id/meta/slug are per-recipe). Match id + meta block
// + slug + image using non-greedy regex boundaries.
const recipeBlocks = recipesRaw.matchAll(/^ {4}id:\s*(\d+),[\s\S]*?^ {2}\},$/gm);
for (const m of recipeBlocks) {
  const block = m[0];
  const id = m[1];
  const titleM = block.match(/title:\s*"([^"]+)"/);
  const title = titleM ? titleM[1] : `id ${id}`;

  // costTier check
  const costM = block.match(/costTier:\s*"([^"]+)"/);
  if (costM && !CANONICAL_COST_TIERS.has(costM[1])) {
    console.error(`ERROR: recipe id=${id} "${title}" has costTier="${costM[1]}" — expected one of ${[...CANONICAL_COST_TIERS].join(", ")}`);
    errors++;
  }

  // allergen check
  const allergensM = block.match(/allergens:\s*\[([^\]]+)\]/);
  if (allergensM) {
    const values = [...allergensM[1].matchAll(/"([^"]+)"/g)].map((v) => v[1]);
    for (const v of values) {
      if (!CANONICAL_ALLERGENS.has(v)) {
        console.error(`ERROR: recipe id=${id} "${title}" has allergen="${v}" — not in canonical Big-8 + dairy/mustard set. Move to meta.warnings[] or normalize (e.g. "egg" -> "eggs").`);
        errors++;
      }
    }
  }

  // effortTag warning (not error — off-taxonomy still ships on the card body)
  const effortsM = block.match(/effortTags:\s*\[([^\]]+)\]/);
  if (effortsM) {
    const values = [...effortsM[1].matchAll(/"([^"]+)"/g)].map((v) => v[1]);
    for (const v of values) {
      if (classifyEffortTag(v) === "unknown") {
        console.warn(`WARN: recipe id=${id} "${title}" has effortTag="${v}" — unrecognized vocabulary. Add it to CANONICAL_EFFORT_TAGS (make it a chip), EFFORT_TAG_ALIASES (map it onto an existing chip), or DESCRIPTIVE_EFFORT_TAGS (never a chip) in src/data/taxonomy.js.`);
        warnings++;
      }
    }
  }

  // splitAxis warning
  const splitM = block.match(/splitAxes:\s*\[([^\]]+)\]/);
  if (splitM) {
    const values = [...splitM[1].matchAll(/"([^"]+)"/g)].map((v) => v[1]);
    for (const v of values) {
      if (classifySplitAxis(v) === "unknown") {
        console.warn(`WARN: recipe id=${id} "${title}" has splitAxis="${v}" — unrecognized vocabulary. Add it to CANONICAL_SPLIT_AXES, SPLIT_AXIS_ALIASES, or DESCRIPTIVE_SPLIT_AXES in src/data/taxonomy.js.`);
        warnings++;
      }
    }
  }

  // Image paths exist on disk (image, prepImage, socialImages[])
  const paths = [];
  const imageM = block.match(/^ {4}image:\s*"([^"]+)"/m);
  if (imageM) paths.push({ field: "image", path: imageM[1] });
  const prepM = block.match(/prepImage:\s*"([^"]+)"/);
  if (prepM) paths.push({ field: "prepImage", path: prepM[1] });
  const socialM = block.match(/socialImages:\s*\[([\s\S]*?)\]/);
  if (socialM) {
    for (const p of socialM[1].matchAll(/"([^"]+)"/g)) {
      paths.push({ field: "socialImages", path: p[1] });
    }
  }
  for (const { field, path } of paths) {
    if (!path.startsWith("/images/")) continue; // external URLs pass
    const abs = join(REPO_ROOT, "public", path);
    if (!existsSync(abs)) {
      console.error(`ERROR: recipe id=${id} "${title}" ${field} points to missing file: ${path}`);
      errors++;
    }
  }
}

console.log(`Taxonomy validation: ${errors} error(s), ${warnings} warning(s).`);

if (errors > 0) {
  throw new Error(`Taxonomy validation failed with ${errors} error(s). Fix recipe schema.`);
}
