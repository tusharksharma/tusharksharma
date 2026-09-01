/**
 * The recipe information model.
 *
 * Recipes in src/data/recipes.js arrived over a year and don't share a shape:
 * some carry `splitCook` with `sharedSteps`/`adult`/`kid`, some only carry
 * top-level `ingredients`/`steps`, kid paths appear as `steps`, `variants`, or
 * `options`, and expertise copy is spread across `whyMostFail`,
 * `whyThisWorks`, `whyItWorks`, `executionRules`, `mistakes`, and
 * `variations`. The old detail page branched on all of that inline, which is
 * why a split recipe and a standard recipe rendered as visibly different
 * products.
 *
 * `buildRecipeModel` collapses every shape into one ordered structure, so the
 * page can render the same sections in the same order for all 47 recipes and
 * simply skip the ones a given recipe has no data for. Adding a recipe shape
 * means teaching this file, not the component.
 *
 * The model is scale-independent — household scaling is applied at render.
 */

const SAFETY_RE =
  /allerg|halal|food-safety|\b\d{3}\s*f\b|heating|\b(dairy|gluten|egg|eggs|soy|sesame|fish|shellfish|peanut|peanuts|nut|nuts|milk|wheat|mustard|pork|alcohol)\b/i;
const NUTRITION_CAVEAT_RE = /macro|label|packag|vary|recalc|estimat/i;

/** Human-readable form of a kebab-case warning token. */
function prettyWarning(w) {
  return w.replace(/-/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Warnings serve three different readers, so they can't all sit in one gray
 * strip. Allergen and food-safety lines are the ones someone can get hurt by
 * and stay visible; label/macro caveats belong with the nutrition disclosure;
 * everything else is a planning heads-up ("needs an overnight marinade").
 */
export function classifyWarning(w) {
  if (SAFETY_RE.test(w)) return "safety";
  if (NUTRITION_CAVEAT_RE.test(w)) return "nutrition";
  return "headsUp";
}

/** Text of an ingredient, which may be a bare string or `{ text, link }`. */
export function ingredientText(item) {
  return typeof item === "object" ? item?.text ?? "" : item ?? "";
}

/* Group headers were written two ways. Most recipes use `--- PROTEIN ---`;
   the two standard (non-split) recipes use a shouted `PUFF BATTER:` line
   instead. Both are headers, and treating the second kind as an ingredient is
   why those recipes rendered as one undifferentiated list with a checkbox next
   to "ADULT PLATE (per person):". The all-caps first word is what keeps this
   from swallowing real prose lines like "Your flavor direction (see below):". */
const COLON_HEADER_RE = /^[A-Z][A-Z0-9&+'./-]+(?=[\s:])/;

/** True for either header convention. */
export function isGroupHeader(item) {
  const text = ingredientText(item).trim();
  if (!text) return false;
  if (text.startsWith("---")) return true;
  return text.endsWith(":") && COLON_HEADER_RE.test(text);
}

export function headerTitle(item) {
  return ingredientText(item)
    .replace(/-{2,}/g, "")
    .replace(/:\s*$/, "")
    .trim();
}

/**
 * Split a flat ingredient array on its `--- HEADER ---` rows.
 * Items before the first header land in a group titled `fallbackTitle`.
 * Returns [] for an empty/absent list so callers can just spread the result.
 */
export function parseGroups(items, { fallbackTitle, tone, idPrefix }) {
  if (!Array.isArray(items) || items.length === 0) return [];
  const groups = [];
  let current = null;

  for (const item of items) {
    if (isGroupHeader(item)) {
      current = { id: `${idPrefix}-${groups.length}`, title: headerTitle(item), tone, items: [] };
      groups.push(current);
      continue;
    }
    if (!current) {
      current = { id: `${idPrefix}-${groups.length}`, title: fallbackTitle, tone, items: [] };
      groups.push(current);
    }
    current.items.push(item);
  }

  return groups.filter((g) => g.items.length > 0);
}

/** Normalize a step to `{ text, images }` — recipes store both strings and objects. */
function normalizeStep(step) {
  if (typeof step === "string") return { text: step, images: [] };
  return { text: step?.text ?? "", images: step?.images ?? [] };
}

function normalizeSteps(steps) {
  return Array.isArray(steps) ? steps.map(normalizeStep).filter((s) => s.text) : [];
}

/**
 * The kid lane is stored three different ways. `options` (tabbed alternatives
 * with their own ingredients) and `variants` (tabbed alternatives with only
 * steps) both mean "pick one of these"; a bare `steps`/`extraIngredients` pair
 * means there's only one way to do it. Normalize all three to a list of
 * choices so the UI only has to handle tabs.
 */
function kidChoices(kid) {
  if (!kid) return [];
  if (Array.isArray(kid.options) && kid.options.length > 0) {
    return kid.options.map((o, i) => ({
      id: `kid-option-${i}`,
      label: o.label || `Option ${i + 1}`,
      extraIngredients: o.extraIngredients || [],
      steps: normalizeSteps(o.steps),
    }));
  }
  if (Array.isArray(kid.variants) && kid.variants.length > 0) {
    return kid.variants.map((v, i) => ({
      id: `kid-variant-${i}`,
      label: v.label || `Option ${i + 1}`,
      extraIngredients: v.extraIngredients || kid.extraIngredients || [],
      steps: normalizeSteps(v.steps),
    }));
  }
  return [
    {
      id: "kid-only",
      label: kid.label || "Kid plate",
      extraIngredients: kid.extraIngredients || [],
      steps: normalizeSteps(kid.steps),
    },
  ];
}

/**
 * "Three keys to success" — the short, always-visible version of the
 * expertise material. Execution rules are the strongest signal when present
 * (they're written as imperatives); otherwise fall back to why-this-works.
 * Whatever doesn't make the cut still ships, in the deep-dive accordions.
 */
function pickKeys(recipe) {
  const source =
    (recipe.executionRules?.length && recipe.executionRules) ||
    (recipe.whyThisWorks?.length && recipe.whyThisWorks) ||
    [];
  return source.slice(0, 3);
}

/**
 * Cook-method chips, derived from effortTags. Deliberately labelled "Cook
 * method" and not "Equipment": effortTags tell us the recipe uses an oven or a
 * grill, they do not enumerate every tool, and claiming otherwise would put a
 * shopping list in front of someone that the data can't back.
 */
const METHOD_TAGS = {
  oven: "Oven",
  grill: "Grill",
  "air-fryer": "Air fryer",
  stovetop: "Stovetop",
  "sheet-pan": "Sheet pan",
  "one-pot": "One pot",
  "no-cook": "No cook",
  assembly: "Assembly",
};

function cookMethods(recipe) {
  const tags = recipe.meta?.effortTags || [];
  return tags.map((t) => METHOD_TAGS[t]).filter(Boolean);
}

export function buildRecipeModel(recipe) {
  const sc = recipe.splitCook || null;
  const macros = recipe.meta?.macros || null;
  const estimated = !!macros?.estimated;

  /* ── Badges. Series/episode copy is a chip, never the introduction. ── */
  const badges = [];
  const series = recipe.series || recipe.meta?.series;
  if (recipe.heroBadge) badges.push({ label: recipe.heroBadge, tone: "brand" });
  else if (series) badges.push({ label: series, tone: "brand" });
  if (sc) badges.push({ label: "Split Cook Method™", tone: "split" });
  if (recipe.category) badges.push({ label: recipe.category, tone: "muted" });

  /* `role` is sometimes a three-word nickname ("The Texture Hero") and
     sometimes three sentences of episode summary. Short ones read as a badge;
     long ones are prose and belong in the overview, not above the title. */
  const role = recipe.role || "";
  const roleIsLabel = role.length > 0 && role.length <= 64;
  if (roleIsLabel) badges.push({ label: role, tone: "muted" });

  /* ── At-a-glance facts. ── */
  const facts = [];
  if (recipe.time) facts.push({ key: "time", label: "Total time", value: recipe.time });
  if (recipe.servings) {
    facts.push({
      key: "yield",
      label: "Yield",
      value: `${recipe.servings} serving${recipe.servings === 1 ? "" : "s"}`,
    });
  }
  const protein = macros?.protein ?? recipe.protein;
  if (protein != null) {
    facts.push({ key: "protein", label: "Protein", value: `${protein}g`, estimated, highlight: true });
  }
  const calories = macros?.calories ?? recipe.calories;
  if (calories != null) {
    facts.push({ key: "calories", label: "Calories", value: calories, estimated });
  }
  if (recipe.meta?.costPerServing) {
    facts.push({ key: "cost", label: "Cost / serving", value: recipe.meta.costPerServing });
  }
  const methods = cookMethods(recipe);
  if (methods.length > 0) {
    facts.push({ key: "method", label: "Cook method", value: methods.join(" · ") });
  }

  /* ── Safety, split out of the metadata wall. ── */
  const warnings = recipe.meta?.warnings || [];
  const safety = {
    allergens: recipe.meta?.allergens || [],
    critical: warnings.filter((w) => classifyWarning(w) === "safety").map(prettyWarning),
    headsUp: warnings.filter((w) => classifyWarning(w) === "headsUp").map(prettyWarning),
    nutritionCaveats: warnings.filter((w) => classifyWarning(w) === "nutrition").map(prettyWarning),
    correction: recipe.testedCorrection || null,
  };

  /* ── Ingredients, grouped like the printed cookbook page. ── */
  const ingredientGroups = sc
    ? [
        ...parseGroups(sc.sharedIngredients, {
          fallbackTitle: "Shared",
          tone: "shared",
          idPrefix: "shared",
        }),
        ...parseGroups(sc.adult?.extraIngredients, {
          fallbackTitle: sc.adult?.label || "Adult plate",
          tone: "adult",
          idPrefix: "adult",
        }),
      ]
    : parseGroups(recipe.ingredients, {
        fallbackTitle: "Ingredients",
        tone: "shared",
        idPrefix: "main",
      });

  const kid = kidChoices(sc?.kid);

  /* ── Method phases. Non-split recipes get exactly one phase, so the page
       renders the identical component either way. ── */
  const phases = [];
  if (sc) {
    const shared = normalizeSteps(sc.sharedSteps);
    if (shared.length > 0) {
      phases.push({
        id: "shared",
        label: "Shared base",
        tone: "shared",
        subtitle: "Cook once — this part works for everyone.",
        steps: shared,
        startAt: 1,
      });
    }
    const adultSteps = normalizeSteps(sc.adult?.steps);
    if (adultSteps.length > 0) {
      phases.push({
        id: "adult",
        label: sc.adult?.label || "Adult plate",
        tone: "adult",
        steps: adultSteps,
        startAt: shared.length + 1,
      });
    }
    // Kid choices share a step number range with the adult lane — they happen
    // in parallel, not after.
    if (kid.some((c) => c.steps.length > 0)) {
      phases.push({
        id: "kid",
        label: sc.kid?.label || "Kid plate",
        tone: "kid",
        choices: kid.filter((c) => c.steps.length > 0),
        steps: kid.find((c) => c.steps.length > 0)?.steps || [],
        startAt: shared.length + 1,
      });
    }
  } else {
    phases.push({
      id: "main",
      label: "Method",
      tone: "shared",
      steps: normalizeSteps(recipe.steps),
      startAt: 1,
    });
  }

  const method = {
    phases,
    splitPoint: sc?.splitPoint || null,
    splitRatio: sc?.splitRatio || null,
  };

  /* ── The signature Adult | Kid split cards. ── */
  const split = sc
    ? {
        ratio: sc.splitRatio || null,
        point: sc.splitPoint || null,
        adult: {
          label: sc.adult?.label || "Adult plate",
          protein: sc.adult?.protein ?? null,
          calories: sc.adult?.calories ?? null,
          extras: sc.adult?.extraIngredients || [],
          note: sc.adult?.note || null,
        },
        kid: {
          label: sc.kid?.label || "Kid plate",
          protein: sc.kid?.protein ?? null,
          calories: sc.kid?.calories ?? null,
          choices: kid,
          proteinSwap: sc.kid?.proteinSwap || null,
          note: sc.kid?.note || null,
        },
      }
    : null;

  /* ── Expertise material: a short visible list, the rest behind disclosure. ── */
  const keys = pickKeys(recipe);
  const usedKeys = new Set(keys);
  const deepDive = [];
  const rules = (recipe.executionRules || []).filter((r) => !usedKeys.has(r));
  if (rules.length > 0) {
    deepDive.push({ id: "rules", title: "The rest of the execution rules", tone: "danger", items: rules });
  }
  if (recipe.whyMostFail?.length) {
    deepDive.push({ id: "fail", title: "Why most versions fail", tone: "danger", items: recipe.whyMostFail });
  }
  const works = (recipe.whyThisWorks || []).filter((r) => !usedKeys.has(r));
  if (works.length > 0) {
    deepDive.push({ id: "works", title: "Why this version works", tone: "ok", items: works });
  } else if (recipe.whyItWorks && keys.length === 0) {
    deepDive.push({ id: "works", title: "Why it works", tone: "ok", items: [recipe.whyItWorks] });
  }
  if (!recipe.executionRules && recipe.mistakes?.length) {
    deepDive.push({ id: "mistakes", title: "Mistakes to avoid", tone: "danger", items: recipe.mistakes });
  }
  if (recipe.variations?.length) {
    deepDive.push({ id: "variations", title: "Variations", tone: "brand", items: recipe.variations });
  }

  return {
    slug: recipe.slug,
    title: recipe.title,
    hook: recipe.hook || "",
    description: recipe.description || "",
    makeThisWhen: recipe.makeThisWhen || "",
    overview: roleIsLabel ? "" : role,
    badges,
    hero: { src: recipe.image, alt: recipe.title },
    facts,
    safety,
    ingredientGroups,
    kidIngredientChoices: kid.filter((c) => (c.extraIngredients || []).length > 0),
    method,
    split,
    keys,
    deepDive,
    troubleshooting: recipe.troubleshooting || [],
    storage: recipe.mealPrep || null,
    nutrition: {
      macros,
      estimated,
      honesty: recipe.meta?.macroHonesty || "",
      costPerServing: recipe.meta?.costPerServing || null,
      dietTags: recipe.meta?.dietTags || [],
      splitAxes: recipe.meta?.splitAxes || [],
      effortTags: recipe.meta?.effortTags || [],
      caveats: safety.nutritionCaveats,
      substitutions: recipe.meta?.substitutionNotes || [],
    },
    video: recipe.video || recipe.videoSrc || null,
    brands: recipe.brands || [],
    tags: recipe.tags || [],
  };
}

/**
 * Split ingredient groups into balanced columns for the printed-page layout.
 *
 * CSS multi-column looked like the obvious tool here, but Chrome balances
 * `inline-block` children unpredictably — a two-group recipe stranded both
 * groups in the left column and left the right one empty. Doing the split in
 * JS is deterministic and keeps column-major reading order (top of column one
 * continues at the top of column two), which is how the printed page reads.
 */
export function balanceColumns(groups, count = 2) {
  const cols = Array.from({ length: count }, () => []);
  if (!groups.length) return cols;

  // Rough render height: the header bar plus a row per item, counting long
  // lines twice since they wrap.
  const weight = (g) =>
    1.6 + g.items.reduce((n, item) => n + (ingredientText(item).length > 46 ? 2 : 1), 0);

  const target = groups.reduce((n, g) => n + weight(g), 0) / count;
  let col = 0;
  let filled = 0;

  for (let i = 0; i < groups.length; i++) {
    const w = weight(groups[i]);
    const groupsLeft = groups.length - i;
    const colsAfter = count - col - 1;
    // Break before the group that would overshoot the target by more than
    // stopping short of it would undershoot — a plain `filled >= target` test
    // always overfills the left column. Break early regardless if every
    // remaining group is needed to keep a later column from rendering empty.
    if (col < count - 1 && (groupsLeft <= colsAfter || filled + w / 2 >= target)) {
      col++;
      filled = 0;
    }
    cols[col].push(groups[i]);
    filled += w;
  }
  return cols.filter((c) => c.length > 0);
}

/**
 * Flatten the method into one linear list for focused cooking mode.
 * Split recipes keep their lane label on each step so the cook always knows
 * which plate they're building.
 */
export function flattenSteps(model) {
  const out = [];
  for (const phase of model.method.phases) {
    const steps = phase.choices ? phase.choices[0].steps : phase.steps;
    steps.forEach((s, i) => {
      out.push({ ...s, lane: phase.label, tone: phase.tone, number: phase.startAt + i });
    });
  }
  return out;
}

export default buildRecipeModel;
