import { defaultKidLane } from "./recipeModel.js";
const DOMAIN = "https://thesplitplate.com";

const SERIES_PREFIX_RE =
  /^(CrumblCreamiCut\s+Week\s+\d+[^—–-]*|Proffee\s+Episode\s+\d+|Snack\s+Box\s+Series\s+Ep\.?\s*\d+)\s*[—–-]\s*(?:Week\s+\d+\s+(?:finale|opener)\.?\s*)?/i;

export function extractSeriesPrefix(raw) {
  if (!raw || typeof raw !== "string") return null;
  const m = raw.trim().match(SERIES_PREFIX_RE);
  return m ? m[1].trim() : null;
}

/**
 * Strip opaque series/episode prefixes ("CrumblCreamiCut Week 4, Flavor 1 — ",
 * "Proffee Episode 3 — ", "Snack Box Series Ep. 14 — ") and internal episode
 * cross-references so meta descriptions and Recipe schema descriptions lead
 * with the actual dish and cooking method.
 */
export function cleanSeoDescription(raw) {
  if (!raw || typeof raw !== "string") return "";
  let s = raw.trim();
  s = s.replace(SERIES_PREFIX_RE, "");
  s = s.replace(/\bEp\.?\s*1's\s+concentrate(?:-first)?\s+technique\b/gi, "a concentrate-first protein coffee technique");
  s = s.replace(/\bEp\.?\s*1's\s+concentrate-first\s+protein-coffee\s+base\b/gi, "a concentrate-first protein-coffee base");
  if (s.length > 0) {
    s = s[0].toUpperCase() + s.slice(1);
  }
  return s;
}

/**
 * Produce a complete, non-truncated SERP meta description (<= 155 chars)
 * that never ends mid-sentence with "…" when a clean sentence or clause boundary exists.
 */
export function summarizeSeoDescription(raw, max = 155) {
  const s = cleanSeoDescription(raw || "");
  if (!s || s.length <= max) return s;

  const compact = s
    .replace(/\s*\([^)]{15,}\)/g, "")
    .replace(/\s+—\s+(?:creator|highest-protein|original|honest verdict|first cross-recipe|compare|per-container|all numbers)[^.]*\./gi, ".")
    .replace(/\s+/g, " ")
    .trim();
  if (compact.length <= max) return compact;

  const sentences = compact.split(/(?<!\d)(?<=[.!?])\s+/);
  let acc = "";
  for (const sent of sentences) {
    const trimmed = sent.trim();
    if (!trimmed) continue;
    const next = acc ? `${acc} ${trimmed}` : trimmed;
    if (next.length <= max) acc = next;
    else break;
  }
  if (acc.length >= 65) {
    return /[.!?]$/.test(acc) ? acc : `${acc}.`;
  }

  const slice = compact.slice(0, max - 1);
  const lastClause = Math.max(slice.lastIndexOf("; "), slice.lastIndexOf(" — "), slice.lastIndexOf(", "));
  if (lastClause >= 65) {
    return slice.slice(0, lastClause).replace(/[,;—–-\s]+$/, "") + ".";
  }
  const lastSpace = slice.lastIndexOf(" ");
  return (lastSpace > 0 ? slice.slice(0, lastSpace) : slice).replace(/[,;—–-\s]+$/, "") + ".";
}

// Convert "PREHEAT + RACK: Oven to 425°F." → {name: "Preheat + Rack", text: "Oven to 425°F."}
// Step text without a colon-prefix label just gets `text`, no `name`.
// Preserves step-level image URL when present.
function toHowToStep(stepItem) {
  const text = typeof stepItem === "string" ? stepItem : stepItem?.text || "";
  const rawImg = typeof stepItem === "object" ? (stepItem?.images?.[0] || stepItem?.image || null) : null;
  const image = rawImg ? (rawImg.startsWith("http") ? rawImg : `${DOMAIN}${rawImg}`) : undefined;
  const colonIdx = text.indexOf(":");
  if (colonIdx > 0 && colonIdx < 40) {
    const label = text.slice(0, colonIdx).trim();
    const body = text.slice(colonIdx + 1).trim();
    if (body) {
      return {
        "@type": "HowToStep",
        name: titleCase(label),
        text: body,
        ...(image ? { image } : {}),
      };
    }
  }
  return {
    "@type": "HowToStep",
    text,
    ...(image ? { image } : {}),
  };
}

function titleCase(s) {
  return s.split(/\s+/).map((w) => w.length > 2 ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w.toLowerCase()).join(" ");
}

function toIsoDuration(minutes) {
  if (!minutes || minutes <= 0) return undefined;
  return `PT${minutes}M`;
}

function parseSingleDuration(str) {
  const m = str.match(/^\s*(?:about\s+|~)?(\d+)\s*(hr|hour|min|minute)s?\b/i);
  if (!m) return null;
  const hours = /^h/i.test(m[2]);
  const rest = str.slice(m[0].length);
  const extraMin = hours ? Number(rest.match(/^\s*(\d+)\s*(?:min|minute)s?\b/i)?.[1] || 0) : 0;
  return Number(m[1]) * (hours ? 60 : 1) + extraMin;
}

export function recipeTimings(r) {
  if (typeof r?.meta?.totalMinutes === "number") {
    return { totalTime: toIsoDuration(r.meta.totalMinutes) };
  }
  const raw = (r?.time || "").trim();
  if (!raw || /overnight|varies|tender|machine|ahead\b(?!.*cold rice)|optional|glass|per\s+(?:serving|layer)|\bsec\b|\d+\s*[-–]\s*\d+/i.test(raw)) {
    return {};
  }
  // Explicit total before parenthetical breakdown: "20 min (10 min tzatziki + 8 min air fry + 2 min assemble)"
  const leadParen = raw.match(/^\s*(?:about\s+|~)?(\d+)\s*(hr|hour|min|minute)s?\s*\(([^)]+)\)\s*$/i);
  if (leadParen) {
    const total = Number(leadParen[1]) * (/^h/i.test(leadParen[2]) ? 60 : 1);
    return { totalTime: toIsoDuration(total) };
  }
  // Explicit prep + cook before "(rice from scratch) — ..."
  const scratchMatch = raw.match(/^\s*(\d+)\s*min\s*prep\s*\+\s*(\d+)\s*min\s*cook\s*\(rice from scratch\)/i);
  if (scratchMatch) {
    const prep = Number(scratchMatch[1]);
    const cook = Number(scratchMatch[2]);
    return {
      prepTime: toIsoDuration(prep),
      cookTime: toIsoDuration(cook),
      totalTime: toIsoDuration(prep + cook),
    };
  }
  if (!raw.includes("+")) {
    const total = parseSingleDuration(raw);
    return total ? { totalTime: toIsoDuration(total) } : {};
  }
  const cleaned = raw.replace(/\(\s*\d+\s*×\s*\d+\s*hr\s*layers\s*\)/i, "");
  if (/[()]/.test(cleaned)) return {};
  const parts = cleaned.split("+").map((p) => p.trim());
  const parsed = parts.map((p) => {
    const mins = parseSingleDuration(p);
    if (!mins) return null;
    const isPrep = /\b(?:prep|active|mix)\b/i.test(p);
    const isCook = /\b(?:cook|bake|roast|air\s*fry|reheat|grill|simmer)\b/i.test(p);
    return { mins, isPrep, isCook };
  });
  if (parsed.some((p) => !p)) return {};
  const total = parsed.reduce((sum, p) => sum + p.mins, 0);
  const prep = parsed.filter((p) => p.isPrep).reduce((sum, p) => sum + p.mins, 0);
  const cook = parsed.filter((p) => p.isCook).reduce((sum, p) => sum + p.mins, 0);
  return {
    ...(prep > 0 && cook > 0 ? { prepTime: toIsoDuration(prep), cookTime: toIsoDuration(cook) } : {}),
    totalTime: toIsoDuration(total),
  };
}

const CUISINE_PATTERNS = [
  [/\bindo[-\s]chinese\b/i, "Indo-Chinese"],
  [/\b(?:tandoori|tikka\s+masala|butter\s+chicken|keema\s+matar|phulka|rumali\s+roti|paneer|chana|dal|masala)\b/i, "Indian"],
  [/\b(?:peruvian|lomo\s+saltado)\b/i, "Peruvian"],
  [/\b(?:korean|buldak|gochujang)\b/i, "Korean"],
  [/\b(?:japanese)\b/i, "Japanese"],
  [/\b(?:halal\s+cart|shawarma|kebab\s+pitas)\b/i, "Middle Eastern"],
  [/\b(?:mediterranean|tzatziki|greek)\b/i, "Mediterranean"],
  [/\b(?:taco|quesadilla|fajita|burrito|enchilada|mexican|mole\s+tacos|carnitas)\b/i, "Mexican"],
  [/\b(?:gnocchi|orzo|ditalini|penne|alfredo|marinara|margherita|tiramisu|lasagna|bolognese|italian)\b/i, "Italian"],
];

function inferRecipeCuisine(r) {
  if (r.cuisine) return r.cuisine;
  const hay = `${r.title || ""} ${(r.tags || []).join(" ")} ${r.category || ""}`;
  for (const [re, cuisine] of CUISINE_PATTERNS) {
    if (re.test(hay)) return cuisine;
  }
  return undefined;
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
    .filter((step) => (typeof step === "string" ? Boolean(step.trim()) : Boolean(step?.text)));
}

export function buildRecipeSchema(r, category) {
  const ingredients = recipeIngredients(r);
  const steps = recipeSteps(r);
  if (!ingredients.length || !steps.length) return null;
  const timings = recipeTimings(r);
  const cuisine = inferRecipeCuisine(r);
  const keywordsList = r.tags?.length ? r.tags : (r.bestFor?.length ? r.bestFor : null);
  const schema = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: r.seoTitle || r.title,
    description: cleanSeoDescription(r.seoDescription || r.tagline || r.description || ""),
    image: r.image ? `${DOMAIN}${r.image}` : undefined,
    ...timings,
    recipeYield: String(r.servings || 1),
    author: { "@type": "Person", name: "Tushar Sharma", url: `${DOMAIN}/about` },
    recipeCategory: category === "Cookbook" ? r.recipeCategory : category,
    ...(cuisine ? { recipeCuisine: cuisine } : {}),
    recipeIngredient: ingredients,
    recipeInstructions: steps.map(toHowToStep),
  };
  if (!r.splitCook && r.caloriesPerServing != null && r.proteinPerServing != null) {
    schema.nutrition = { "@type": "NutritionInformation", calories: `${r.caloriesPerServing} calories`, proteinContent: `${r.proteinPerServing}g` };
  }
  if (keywordsList?.length) schema.keywords = keywordsList.join(", ");
  return JSON.stringify(schema).replace(/</g, "\\u003c");
}
