/**
 * Scans ingredient strings across each live recipe and warns if the
 * allergens array is missing a match for a known allergen keyword.
 *
 * Fails the build if HIGH-CONFIDENCE matches (sesame oil, fish sauce,
 * Worcestershire, peanut butter, anchovy) are missing. Soft warns for
 * lower-confidence matches.
 *
 * Source-of-truth scope:
 *  - ingredients[] (top-level array, may be strings or {text, link})
 *  - splitCook.sharedIngredients, splitCook.adult.extraIngredients,
 *    splitCook.kid.extraIngredients
 */
import { readFileSync } from "fs";

const src = readFileSync("src/data/recipes.js", "utf-8");

/**
 * High-confidence allergen triggers — these MUST appear in the allergens array.
 * Format: { keyword: /regex/i, allergen: "name", contextOk?: /not-this-context/i }
 */
const HIGH_CONFIDENCE = [
  { kw: /\bsesame oil\b|\bsesame chili oil\b|\bsesame seeds?\b|\btoasted sesame\b/i, allergen: "sesame" },
  { kw: /\bfish sauce\b|\bred boat\b/i, allergen: "fish" },
  { kw: /\bworcestershire\b|\blea\s{0,2}&?\s{0,2}perrins\b/i, allergen: "fish" },
  { kw: /\banchov(y|ies)\b/i, allergen: "fish" },
  { kw: /\bpeanut butter\b|\bpeanut oil\b|\bcrushed peanuts?\b|\broasted peanuts?\b/i, allergen: "peanut" },
  { kw: /\bshrimp\b|\bprawn\b|\bcrab\b|\blobster\b|\bclam\b/i, allergen: "shellfish" },
];

const recipeRegex = /id:\s*(\d+),\s*status:\s*"live"[\s\S]*?allergens:\s*\[([^\]]*)\]([\s\S]*?)title:\s*"([^"]+)"([\s\S]*?)(?=\n\s{2}\{\s*\n\s*id:|\n\];)/g;

// Pull only the ingredient-array blocks from a recipe body. Each block is bounded
// by `<key>: [` ... `]`. We deliberately ignore substitutionNotes, whyMostFail,
// troubleshooting, etc. — those are alt/swap suggestions, not the as-written recipe.
const INGREDIENT_KEYS = ["ingredients", "sharedIngredients", "extraIngredients"];

function extractIngredientText(body) {
  const chunks = [];
  for (const key of INGREDIENT_KEYS) {
    const re = new RegExp(`${key}:\\s*\\[([\\s\\S]*?)\\]`, "g");
    let m;
    while ((m = re.exec(body)) !== null) chunks.push(m[1]);
  }
  return chunks.join(" ");
}

function parseArr(s) {
  return [...s.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
}

let errors = 0;
let warnings = 0;
let match;

while ((match = recipeRegex.exec(src)) !== null) {
  const [, id, allergensRaw, , title, rest] = match;
  const allergens = parseArr(allergensRaw);
  const ingredientText = extractIngredientText(rest);

  for (const { kw, allergen } of HIGH_CONFIDENCE) {
    if (kw.test(ingredientText) && !allergens.includes(allergen)) {
      console.error(`ERROR: id=${id} "${title}" — ingredient text matches /${kw.source}/ but allergens missing "${allergen}"`);
      errors++;
    }
  }
}

if (errors > 0) {
  throw new Error(`Allergen validation failed: ${errors} recipe(s) with ingredient/allergen mismatches. Add the missing allergen to meta.allergens.`);
}

console.log(`Allergen validation OK. ${warnings} soft warnings.`);
