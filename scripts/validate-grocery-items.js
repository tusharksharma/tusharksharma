/**
 * Validates that every grocery item in GROCERY_BY_WEEK[N] can be plausibly sourced
 * from the recipes scheduled in WEEKS[N]. Catches the failure modes that
 * validate-weeks.js explicitly disclaims:
 *   - Recipe swapped but grocery still has the old ingredients
 *   - New grocery item with no matching recipe ingredient
 *   - Cross-linked sauce ingredients (e.g. Umami Lemon Heat) — followed via
 *     the recipe's {text, link: "/cookbook/X"} ingredients
 *
 * Strategy:
 *   For each (week, cookDay, recipe):
 *     1. Build a corpus of every ingredient string in the recipe AND in any
 *        cookbook item it cross-links to.
 *     2. For each grocery item tagged to that day, tokenize its name (strip
 *        common stopwords) and check that at least one meaningful token
 *        appears in the corpus.
 *   Fail build if any grocery item has zero matches (excluding generic
 *   pantry items on the always-OK list).
 *
 * Token matching is intentionally loose — the goal is high recall (catch
 * obvious orphans / swap-mismatches), low precision concerns are handled
 * by ALWAYS_OK_ITEMS for known pantry generics.
 */
import { readFileSync } from "fs";
import recipes from "../src/data/recipes.js";
import { sauces, breakfasts, desserts, quickLunches, bases } from "../src/data/cookbook.js";

const allCookbook = [...sauces, ...breakfasts, ...desserts, ...quickLunches, ...bases];
const cookbookById = new Map(allCookbook.map((c) => [c.id, c]));
const recipesById = new Map(recipes.map((r) => [r.id, r]));

const plannerSrc = readFileSync("src/components/YourWeek.jsx", "utf-8");
const grocerySrc = readFileSync("src/components/GroceryList.jsx", "utf-8");

// Tokens too generic to match meaningfully — skip them when checking grocery names
const STOPWORDS = new Set([
  "the", "and", "for", "with", "into", "from", "your",
  "fresh", "frozen", "organic", "low", "fat", "free", "fat-free", "all", "natural",
  "each", "any", "small", "medium", "large", "extra", "pure",
  "oz", "lb", "lbs", "cup", "cups", "tbsp", "tsp", "ml", "ct", "count", "pack", "pieces", "piece", "pcs",
  "fl", "ounce", "ounces", "pound", "pounds",
  "kid", "adult", "kids", "adults", "swap", "topping", "side", "base",
]);

// Grocery items that are generic enough that they may not appear verbatim in any
// recipe ingredient list (pantry staples). These pass without a corpus match.
const ALWAYS_OK_ITEMS = new Set([
  "garlic",
  "olive oil",
  "salt",
  "pepper",
  "lime",
  "lemon",
  "ketchup",
  "shredded mild cheese",
  "regular caesar dressing",
  "earth's best mini meatballs",
  "raw mini peppers",
  "chili flakes",
  "chili oil or sriracha",
  "fresh cilantro",
  "naan bread",
  "kashmiri chili",
  "kala namak (black salt)",
  "lawry's seasoning",
  "spg seasoning",
  "fat-free greek yogurt",
  "all-purpose flour",
]);

function tokenize(str) {
  return str
    .toLowerCase()
    .replace(/[(),.—–'"\-]/g, " ")
    .split(/\s+/)
    .map((t) => t.replace(/^\d+%?$/, "")) // drop pure numbers and "2%"
    .filter((t) => t.length >= 3 && !STOPWORDS.has(t));
}

function ingredientText(item) {
  if (typeof item === "string") return item;
  if (item && typeof item === "object") return item.text || "";
  return "";
}

function recipeCorpus(recipe) {
  if (!recipe) return "";
  const parts = [];
  const push = (arr) => (arr || []).forEach((i) => parts.push(ingredientText(i)));
  const pushStr = (s) => { if (typeof s === "string") parts.push(s); };

  push(recipe.ingredients);
  if (recipe.splitCook) {
    push(recipe.splitCook.sharedIngredients);
    push(recipe.splitCook.adult?.extraIngredients);
    push(recipe.splitCook.kid?.extraIngredients);
    // Kid variants can have their own extras
    (recipe.splitCook.kid?.variants || []).forEach((v) => push(v.extraIngredients));
    pushStr(recipe.splitCook.splitPoint);
  }
  push(recipe.brands?.map((b) => `${b.name} ${b.item} ${b.why || ""}`));

  // Prose fields that legitimately mention ingredients (e.g. "Dinner rolls for kids"
  // in the description). Including these prevents false positives without weakening
  // the orphan check — orphan grocery items still won't appear anywhere.
  pushStr(recipe.description);
  pushStr(recipe.hook);
  pushStr(recipe.role);
  pushStr(recipe.makeThisWhen);
  (recipe.executionRules || []).forEach(pushStr);
  (recipe.whyMostFail || []).forEach(pushStr);
  (recipe.whyThisWorks || []).forEach(pushStr);
  (recipe.troubleshooting || []).forEach((t) => { pushStr(t?.problem); pushStr(t?.fix); });
  (recipe.steps || []).forEach((s) => pushStr(s?.text || s));
  if (recipe.splitCook) {
    (recipe.splitCook.sharedSteps || []).forEach((s) => pushStr(s?.text || s));
    (recipe.splitCook.adult?.steps || []).forEach((s) => pushStr(s?.text || s));
    (recipe.splitCook.kid?.variants || []).forEach((v) => (v.steps || []).forEach((s) => pushStr(s?.text || s)));
  }

  // Follow cross-links: any ingredient with `link: "/cookbook/X"` pulls in that
  // cookbook entry's ingredients (so e.g. Umami Lemon Heat's mayo/lemon/soy
  // count as part of this recipe's corpus when referenced).
  const linkedSlugs = new Set();
  const collectLinks = (arr) => (arr || []).forEach((i) => {
    if (i && typeof i === "object" && typeof i.link === "string") {
      const m = i.link.match(/^\/cookbook\/([\w-]+)$/);
      if (m) linkedSlugs.add(m[1]);
    }
  });
  collectLinks(recipe.ingredients);
  if (recipe.splitCook) {
    collectLinks(recipe.splitCook.sharedIngredients);
    collectLinks(recipe.splitCook.adult?.extraIngredients);
    collectLinks(recipe.splitCook.kid?.extraIngredients);
    (recipe.splitCook.kid?.variants || []).forEach((v) => collectLinks(v.extraIngredients));
  }
  for (const slug of linkedSlugs) {
    const cb = cookbookById.get(slug);
    if (cb) push(cb.ingredients);
  }

  return parts.join("\n").toLowerCase();
}

// Parse WEEKS[N].cookDays into { weekNum: { Mon: id, Wed: id, Fri: id } }
function parseWeeks() {
  const out = {};
  const weeksMatch = plannerSrc.match(/const WEEKS\s*=\s*\{([\s\S]*?)\n\};/);
  if (!weeksMatch) return out;
  for (const wm of weeksMatch[1].matchAll(/^ {2}(\d+):\s*\{([\s\S]*?)\n {2}\},/gm)) {
    const w = Number(wm[1]);
    const body = wm[2];
    const cookDays = {};
    for (const dm of body.matchAll(/\{\s*day:\s*"(\w+)"[\s\S]*?id:\s*(\d+)/g)) {
      cookDays[dm[1].substring(0, 3)] = Number(dm[2]);
    }
    out[w] = cookDays;
  }
  return out;
}

// Parse GROCERY_BY_WEEK[N] into { weekNum: [ { name, meal, baseQty?, unit?, qty? }, ... ] }
function parseGrocery() {
  const out = {};
  const gMatch = grocerySrc.match(/const GROCERY_BY_WEEK\s*=\s*\{([\s\S]*?)\n\};/);
  if (!gMatch) return out;
  // For each top-level "N: {" within GROCERY_BY_WEEK
  for (const wm of gMatch[1].matchAll(/^ {2}(\d+):\s*\{([\s\S]*?)\n {2}\},/gm)) {
    const w = Number(wm[1]);
    const body = wm[2];
    const items = [];
    for (const im of body.matchAll(/\{\s*name:\s*"([^"]+)"[\s\S]*?meal:\s*"([^"]+)"[^}]*\}/g)) {
      items.push({ name: im[1], meal: im[2] });
    }
    out[w] = items;
  }
  return out;
}

function daysFromMeal(meal) {
  // "Mon + Wed" → ["Mon", "Wed"]; "Fri adult" → ["Fri"]; "Kid swap" → []
  if (/^Kid swap$/i.test(meal.trim())) return [];
  if (/^All$/i.test(meal.trim())) return ["Mon", "Wed", "Fri"];
  if (/^Kid topping$/i.test(meal.trim())) return [];
  if (/^Sauce base$/i.test(meal.trim())) return [];
  return meal.split(/\s*\+\s*/).map((d) => {
    const cleaned = d.trim().replace(/\s+(kid|adult|adult\s+\([^)]+\)|\([^)]+\))$/i, "").trim();
    const first3 = cleaned.substring(0, 3);
    return ["Mon", "Wed", "Fri"].includes(first3) ? first3 : null;
  }).filter(Boolean);
}

function nameMatchesCorpus(itemName, corpus) {
  const lowerName = itemName.toLowerCase().trim();
  if (ALWAYS_OK_ITEMS.has(lowerName)) return true;
  // Strip parenthetical qualifiers from the name for matching: "Daisy Cottage Cheese (Mon: 6oz)"
  const stripped = lowerName.replace(/\([^)]*\)/g, "").trim();
  if (ALWAYS_OK_ITEMS.has(stripped)) return true;

  const tokens = tokenize(itemName);
  if (tokens.length === 0) return true; // nothing meaningful to check — pass
  return tokens.some((t) => corpus.includes(t));
}

const weeks = parseWeeks();
const grocery = parseGrocery();

let errors = 0;
const warnings = [];

for (const [weekStr, items] of Object.entries(grocery)) {
  const week = Number(weekStr);
  const days = weeks[week];
  if (!days) continue;

  // Build a per-day corpus, plus a "any day this week" corpus for fallback
  const dayCorpus = {};
  for (const [day, id] of Object.entries(days)) {
    dayCorpus[day] = recipeCorpus(recipesById.get(id));
  }
  const weekCorpus = Object.values(dayCorpus).join("\n");

  for (const item of items) {
    const itemDays = daysFromMeal(item.meal);
    if (itemDays.length === 0) continue; // pantry/swap items not tagged to a day

    const dayHits = itemDays.map((d) => dayCorpus[d] || "").join("\n");
    const matchedDay = nameMatchesCorpus(item.name, dayHits);

    if (matchedDay) continue;

    // Fallback: did it match ANY day in the week? Then it's mis-tagged, not orphaned.
    const matchedWeek = nameMatchesCorpus(item.name, weekCorpus);
    if (matchedWeek) {
      warnings.push(`Week ${week}: "${item.name}" (meal: "${item.meal}") matches a different day's recipe in this week — check tagging`);
      continue;
    }

    console.error(`ERROR: Week ${week} grocery item "${item.name}" (meal: "${item.meal}") has NO matching ingredient in any recipe scheduled this week (recipes: ${itemDays.map((d) => `${d}=id${days[d]}`).join(", ")}). Either fix the grocery entry, update the recipe ingredients, or add "${item.name.toLowerCase()}" to ALWAYS_OK_ITEMS in scripts/validate-grocery-items.js if it's a pantry generic.`);
    errors++;
  }
}

if (warnings.length) {
  console.log(`\nGrocery-item warnings (${warnings.length}):`);
  for (const w of warnings) console.log(`  WARN: ${w}`);
}

if (errors > 0) {
  throw new Error(`Grocery-item validation failed with ${errors} error(s).`);
} else {
  console.log(`Grocery-item validation OK. ${warnings.length} warning(s).`);
}
