/**
 * Validates cookbook entries — fails the build if any item is missing:
 *   - id              (needed for /cookbook/{id} + /social/cookbook/{id} routes)
 *   - proteinPerServing (without it, display sites show batch-total protein
 *                        next to per-serving calories — misleading)
 *
 * This prevents the "30g protein next to 40 cal/serving" mismatch where
 * protein is actually the whole-batch number.
 */
import { readFileSync } from "fs";

const src = readFileSync("src/data/cookbook.js", "utf-8");

// Match each cookbook entry { ... } at top level — pulls id, title, protein,
// proteinPerServing, servings fields whether present or not.
const entryRegex = /\{\s*\n([\s\S]*?)\n  \}/g;

let errors = 0;
let count = 0;

let m;
while ((m = entryRegex.exec(src)) !== null) {
  const body = m[1];
  // Only consider entries that look like cookbook items (have title + servings)
  if (!/title:\s*"/.test(body) || !/servings:/.test(body)) continue;
  count++;

  const title = body.match(/title:\s*"([^"]+)"/)?.[1] || "(unknown)";
  const id = body.match(/id:\s*"([^"]+)"/)?.[1];
  const hasProteinPerServing = /proteinPerServing:/.test(body);
  const hasProtein = /\n\s*protein:/.test(body);

  if (!id) {
    console.error(`ERROR: "${title}" — missing \`id\` field. Cookbook detail + social routes will 404.`);
    errors++;
  }

  if (hasProtein && !hasProteinPerServing) {
    console.error(`ERROR: "${title}" (${id}) — has \`protein\` (batch total) but no \`proteinPerServing\`. Display sites would show batch protein next to per-serving calories (misleading).`);
    errors++;
  }
}

if (errors > 0) {
  throw new Error(`Cookbook validation failed: ${errors} error(s) across ${count} entries.`);
}

console.log(`Cookbook validation OK. ${count} entries checked.`);
