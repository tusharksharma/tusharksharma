import { defaultKidLane } from "./recipeModel.js";
const DOMAIN = "https://thesplitplate.com";
// Convert "PREHEAT + RACK: Oven to 425°F." → {name: "Preheat + Rack", text: "Oven to 425°F."}
// Step text without a colon-prefix label just gets `text`, no `name`.
function toHowToStep(text) {
  const colonIdx = text.indexOf(":");
  if (colonIdx > 0 && colonIdx < 40) {
    const label = text.slice(0, colonIdx).trim();
    const body = text.slice(colonIdx + 1).trim();
    if (body) return { "@type": "HowToStep", name: titleCase(label), text: body };
  }
  return { "@type": "HowToStep", text };
}
function titleCase(s) {
  return s.split(/\s+/).map((w) => w.length > 2 ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w.toLowerCase()).join(" ");
}

function recipeTotalMinutes(r) {
  if (typeof r?.meta?.totalMinutes === "number") return r.meta.totalMinutes;
  const raw = r?.time || "";
  if (/\+|overnight|\d+\s*[-–]\s*\d+/i.test(raw)) return null;
  const first = raw.match(/^\s*(?:about\s+|~)?(\d+)\s*(hr|hour|min|minute)/i);
  if (!first) return null;
  const hours = /^h/i.test(first[2]);
  const extraMinutes = hours ? Number(raw.slice(first[0].length).match(/^\s*(\d+)\s*min/i)?.[1] || 0) : 0;
  return Number(first[1]) * (hours ? 60 : 1) + extraMinutes;
}

function recipeIngredients(r) {
  const lists = r.splitCook
    ? [r.splitCook.sharedIngredients, r.splitCook.adult?.extraIngredients, defaultKidLane(r.splitCook.kid)?.extraIngredients]
    : [r.ingredients];
  return lists.flatMap((list) => Array.isArray(list) ? list : [])
    .map((entry) => typeof entry === "string" ? entry : entry?.text)
    .filter((entry) => entry && !entry.startsWith("---") && !/^[A-Z][^:]{0,45}:$/.test(entry));
}

function recipeSteps(r) {
  const lists = r.splitCook
    ? [r.splitCook.sharedSteps, r.splitCook.adult?.steps, defaultKidLane(r.splitCook.kid)?.steps]
    : [r.steps];
  return lists.flatMap((list) => Array.isArray(list) ? list : [])
    .map((step) => typeof step === "string" ? step : step?.text)
    .filter(Boolean);
}

export function buildRecipeSchema(r, category) {
  const ingredients = recipeIngredients(r);
  const steps = recipeSteps(r);
  if (!ingredients.length || !steps.length) return null;
  const minutes = recipeTotalMinutes(r);
  const schema = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: r.title,
    description: r.seoDescription || r.tagline || r.description || "",
    image: r.image ? `${DOMAIN}${r.image}` : undefined,
    ...(minutes ? { totalTime: `PT${minutes}M` } : {}),
    recipeYield: String(r.servings || 1),
    author: { "@type": "Person", name: "Tushar Sharma" },
    recipeCategory: category === "Cookbook" ? r.recipeCategory : category,
    recipeIngredient: ingredients,
    recipeInstructions: steps.map(toHowToStep),
  };
  if (!r.splitCook && r.caloriesPerServing != null && r.proteinPerServing != null) {
    schema.nutrition = { "@type": "NutritionInformation", calories: `${r.caloriesPerServing} calories`, proteinContent: `${r.proteinPerServing}g` };
  }
  if (r.tags?.length) schema.keywords = r.tags.join(", ");
  return JSON.stringify(schema).replace(/</g, "\\u003c");
}

