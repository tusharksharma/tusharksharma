/**
 * Validates that dietTags don't conflict with proteinTags / allergens.
 * Fails the build if any live recipe has impossible combinations.
 *
 * Rules:
 *  - pork in proteinTags  → bans "halal", "kosher-meat", "kosher-dairy", "pareve"
 *  - shellfish            → bans "halal", "kosher-meat", "kosher-dairy", "pareve"
 *  - any meat (incl fish) → bans "vegetarian", "vegan", "pareve"
 *  - dairy in allergens   → bans "vegan", "dairy-free", "pareve"
 *  - eggs in allergens    → bans "vegan", "egg-free"
 *  - fish in allergens    → bans "vegetarian", "vegan", "pareve"
 *  - any meat + dairy     → bans "kosher-meat" (kosher law forbids meat+dairy)
 *  - gluten in allergens  → bans "gluten-free" (but "gluten-free-option" is OK)
 *  - soy in allergens     → bans "soy-free"
 *  - nuts in allergens    → bans "nut-free"
 */
import { readFileSync } from "fs";

const src = readFileSync("src/data/recipes.js", "utf-8");

// Match each live recipe's meta block — capture id, title, allergens, dietTags, proteinTags
const recipeRegex = /id:\s*(\d+),\s*status:\s*"live"[\s\S]*?allergens:\s*\[([^\]]*)\][\s\S]*?dietTags:\s*\[([^\]]*)\][\s\S]*?proteinTags:\s*\[([^\]]*)\][\s\S]*?title:\s*"([^"]+)"/g;

const MEAT_PROTEINS = new Set(["pork", "beef", "steak", "chicken", "lamb", "turkey", "duck"]);
const FISH_PROTEINS = new Set(["fish", "salmon", "tuna", "shrimp", "shellfish"]);
const NUT_ALLERGENS = new Set(["nuts", "peanut", "peanuts", "tree-nuts", "tree-nut", "almond", "cashew"]);

function parseArr(s) {
  return [...s.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
}

let errors = 0;
let match;

while ((match = recipeRegex.exec(src)) !== null) {
  const [, id, allergensRaw, dietRaw, proteinRaw, title] = match;
  const allergens = parseArr(allergensRaw);
  const dietTags = parseArr(dietRaw);
  const proteinTags = parseArr(proteinRaw);

  const conflicts = [];

  // PORK → bans halal/kosher
  if (proteinTags.includes("pork")) {
    ["halal", "kosher-meat", "kosher-dairy", "pareve"].forEach((tag) => {
      if (dietTags.includes(tag)) conflicts.push(`pork + ${tag}`);
    });
  }

  // SHELLFISH → bans halal/kosher
  if (proteinTags.some((p) => FISH_PROTEINS.has(p) && (p === "shellfish" || p === "shrimp"))) {
    ["halal", "kosher-meat", "kosher-dairy", "pareve"].forEach((tag) => {
      if (dietTags.includes(tag)) conflicts.push(`shellfish + ${tag}`);
    });
  }

  // ANY MEAT/FISH → bans vegetarian/vegan/pareve
  const hasMeat = proteinTags.some((p) => MEAT_PROTEINS.has(p) || FISH_PROTEINS.has(p) || p === "pork");
  if (hasMeat) {
    ["vegetarian", "vegan", "pareve"].forEach((tag) => {
      if (dietTags.includes(tag)) conflicts.push(`${proteinTags.join("/")} + ${tag}`);
    });
  }

  // DAIRY allergen → bans vegan/dairy-free/pareve
  if (allergens.includes("dairy")) {
    ["vegan", "dairy-free", "pareve"].forEach((tag) => {
      if (dietTags.includes(tag)) conflicts.push(`dairy allergen + ${tag}`);
    });
  }

  // EGGS allergen → bans vegan/egg-free
  if (allergens.includes("eggs")) {
    ["vegan", "egg-free"].forEach((tag) => {
      if (dietTags.includes(tag)) conflicts.push(`eggs allergen + ${tag}`);
    });
  }

  // FISH allergen → bans vegetarian/vegan/pareve
  if (allergens.includes("fish")) {
    ["vegetarian", "vegan", "pareve"].forEach((tag) => {
      if (dietTags.includes(tag)) conflicts.push(`fish allergen + ${tag}`);
    });
  }

  // MEAT + DAIRY → bans kosher-meat (Jewish dietary law)
  if (hasMeat && allergens.includes("dairy") && dietTags.includes("kosher-meat")) {
    conflicts.push(`meat + dairy + kosher-meat (Jewish law forbids meat+dairy combo)`);
  }

  // GLUTEN allergen → bans gluten-free (but gluten-free-option is fine)
  if (allergens.includes("gluten") && dietTags.includes("gluten-free")) {
    conflicts.push(`gluten allergen + gluten-free (use "gluten-free-option" instead)`);
  }

  // SOY allergen → bans soy-free
  if (allergens.includes("soy") && dietTags.includes("soy-free")) {
    conflicts.push(`soy allergen + soy-free`);
  }

  // NUTS allergen → bans nut-free
  if (allergens.some((a) => NUT_ALLERGENS.has(a)) && dietTags.includes("nut-free")) {
    conflicts.push(`nut allergen + nut-free`);
  }

  if (conflicts.length > 0) {
    console.error(`ERROR: id=${id} "${title}" — diet/protein/allergen conflicts:`);
    conflicts.forEach((c) => console.error(`         • ${c}`));
    errors++;
  }
}

if (errors > 0) {
  throw new Error(`Diet-tag validation failed: ${errors} recipe(s) with impossible diet/protein/allergen combos. Fix dietTags arrays in src/data/recipes.js.`);
}

console.log("Diet-tag validation OK. No impossible diet/protein/allergen combos.");
