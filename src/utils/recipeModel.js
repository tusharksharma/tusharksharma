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
/**
 * Several prose fields are a string on some records and an array of strings on
 * others (`whyThisWorks` is a string on protein-tiramisu, an array elsewhere).
 * Everything downstream renders lists, so coerce at the boundary.
 */
function asList(v) {
  if (v == null) return [];
  if (Array.isArray(v)) return v.filter((x) => typeof x === "string" && x.trim());
  return typeof v === "string" && v.trim() ? [v] : [];
}

function normalizeStep(step) {
  if (typeof step === "string") return { text: step, images: [] };
  // Dinners store `images: []`; cookbook entries store a single `image`.
  const images = step?.images ?? (step?.image ? [step.image] : []);
  return { text: step?.text ?? "", images };
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
  const rules = asList(recipe.executionRules).filter((r) => !usedKeys.has(r));
  if (rules.length > 0) {
    deepDive.push({ id: "rules", title: "The rest of the execution rules", tone: "danger", items: rules });
  }
  const mostFail = asList(recipe.whyMostFail);
  if (mostFail.length) {
    deepDive.push({ id: "fail", title: "Why most versions fail", tone: "danger", items: mostFail });
  }
  const works = asList(recipe.whyThisWorks).filter((r) => !usedKeys.has(r));
  if (works.length > 0) {
    deepDive.push({ id: "works", title: "Why this version works", tone: "ok", items: works });
  } else if (recipe.whyItWorks && keys.length === 0) {
    deepDive.push({ id: "works", title: "Why it works", tone: "ok", items: asList(recipe.whyItWorks) });
  }
  const mistakes = asList(recipe.mistakes);
  if (!recipe.executionRules && mistakes.length) {
    deepDive.push({ id: "mistakes", title: "Mistakes to avoid", tone: "danger", items: mistakes });
  }
  const variations = asList(recipe.variations);
  if (variations.length) {
    deepDive.push({ id: "variations", title: "Variations", tone: "brand", items: variations });
  }

  return {
    kind: "dinner",
    slug: recipe.slug,
    path: `/recipes/${recipe.slug}`,
    breadcrumb: { to: "/dinners", label: "Dinners" },
    callouts: [],
    title: recipe.title,
    hook: recipe.hook || "",
    description: recipe.description || "",
    makeThisWhen: recipe.makeThisWhen || "",
    overview: roleIsLabel ? "" : role,
    badges,
    hero: { src: recipe.image, alt: recipe.title, position: recipe.imagePosition || null },
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
      batch: null,
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

/* Which cookbook array an entry came from, for the category badge and the
   breadcrumb. CookbookDetailPage knows the array; the model just labels it. */
const COOKBOOK_GROUPS = {
  bases: "Base",
  sauces: "Sauce",
  breakfasts: "Breakfast",
  quickLunches: "Quick lunch",
  desserts: "Dessert",
  powerups: "Power-up",
  snackBoxes: "Snack box",
};

/**
 * Cookbook entries (sauces, breakfasts, desserts…) carry different field names
 * than dinners — `tagline` not `hook`, `useThisWhen` not `makeThisWhen`,
 * `bestFor` not `tags`, flat protein/calories instead of a macros object. This
 * maps them onto the identical model so both routes render the same ordered
 * sections, which is the whole point of having a model layer.
 */
export function buildCookbookModel(item, group) {
  /* ── Badges. ── */
  const badges = [];
  const series =
    typeof item.seriesInfo === "string" ? item.seriesInfo : item.seriesInfo?.series;
  if (series) badges.push({ label: series, tone: "brand" });
  if (item.splitNote) badges.push({ label: "Split Cook Method™", tone: "split" });
  if (COOKBOOK_GROUPS[group]) badges.push({ label: COOKBOOK_GROUPS[group], tone: "muted" });

  /* ── Facts. Cookbook macros are published per serving alongside a whole-batch
       total; the glance row shows per serving, the batch total goes in the
       nutrition disclosure so the two numbers can't be confused. ── */
  const facts = [];
  if (item.time) facts.push({ key: "time", label: "Total time", value: item.time });
  if (item.servings != null) {
    facts.push({
      key: "yield",
      label: "Yield",
      value: `${item.servings} serving${item.servings === 1 ? "" : "s"}`,
    });
  }
  const perProtein =
    item.proteinPerServing ??
    (item.servings ? Math.round((item.protein / item.servings) * 10) / 10 : item.protein);
  if (perProtein != null) {
    facts.push({
      key: "protein",
      label: "Protein / serving",
      value: `${perProtein}g`,
      estimated: true,
      highlight: true,
    });
  }
  if (item.caloriesPerServing != null) {
    facts.push({
      key: "calories",
      label: "Cal / serving",
      value: item.caloriesPerServing,
      estimated: true,
    });
  }
  if (item.servingSize) {
    facts.push({ key: "servingSize", label: "Serving size", value: item.servingSize });
  }

  /* ── Safety. Same three-way classifier as dinners. `contains` is an explicit
       allergen declaration and joins the allergen list. ── */
  const warnings = item.warnings || [];
  const safety = {
    allergens: [...(item.allergens || []), ...(item.contains || [])],
    critical: warnings.filter((w) => classifyWarning(w) === "safety").map(prettyWarning),
    headsUp: warnings.filter((w) => classifyWarning(w) === "headsUp").map(prettyWarning),
    nutritionCaveats: warnings.filter((w) => classifyWarning(w) === "nutrition").map(prettyWarning),
    correction: null,
  };

  /* ── Callouts that sit above the ingredients. The locked core ratio is the
       one thing a cook must not improvise, so it leads. ── */
  const callouts = [];
  if (item.coreRatio) {
    callouts.push({
      id: "ratio",
      label: "Core ratio — locked",
      body: item.coreRatio,
      tone: "danger",
    });
  }
  if (item.flavorTarget) {
    callouts.push({ id: "target", label: "Flavor target", body: item.flavorTarget, tone: "shared" });
  }

  /* ── Method: always one phase, matching a non-split dinner. ── */
  const method = {
    phases: [
      { id: "main", label: "Method", tone: "shared", steps: normalizeSteps(item.steps), startAt: 1 },
    ],
    splitPoint: null,
    splitRatio: null,
  };

  /* ── Split. Cookbook entries describe the adult/kid difference in prose and
       don't publish per-plate macros, so the cards carry the text as the body
       rather than showing an empty macro row. ── */
  const split = item.splitNote
    ? {
        ratio: null,
        point: null,
        adult: {
          label: "Adult",
          protein: null,
          calories: null,
          extras: [],
          body: item.splitNote.adult,
          note: null,
        },
        kid: {
          label: "Kid",
          protein: null,
          calories: null,
          choices: [],
          body: item.splitNote.kid,
          proteinSwap: null,
          note: null,
        },
      }
    : null;

  /* ── Expertise material. ── */
  const rules = asList(item.executionRules);
  const keys = rules.slice(0, 3);
  const deepDive = [];
  if (rules.length > 3) {
    deepDive.push({
      id: "rules",
      title: "The rest of the execution rules",
      tone: "danger",
      items: rules.slice(3),
    });
  }
  // A couple of entries name this field after their own subject
  // (`whyPumpkinWorks`), so match the pattern rather than one literal key —
  // otherwise that copy never reaches the page.
  const works = Object.keys(item)
    .filter((k) => /^why.+works$/i.test(k))
    .flatMap((k) => asList(item[k]));
  if (works.length) {
    deepDive.push({ id: "works", title: "Why this version works", tone: "ok", items: works });
  }
  const upgrades = asList(item.smartUpgrades);
  if (upgrades.length) {
    deepDive.push({ id: "upgrades", title: "Smart upgrades", tone: "brand", items: upgrades });
  }
  const notes = [...asList(item.notes), ...asList(item.editorialNotes), ...asList(item.alternativeSeasoning)];
  if (notes.length) {
    deepDive.push({ id: "notes", title: "Notes", tone: "muted", items: notes });
  }
  if (item.systemInsight) {
    const si = item.systemInsight;
    deepDive.push({
      id: "system",
      title: si.title || "The system",
      tone: "brand",
      items: [
        si.body,
        ...(si.framework || []).map((f) => `${f.lever} (${f.role}): ${f.swaps}`),
        si.payoff,
      ].filter(Boolean),
    });
  }

  return {
    kind: "cookbook",
    slug: item.id,
    path: `/cookbook/${item.id}`,
    breadcrumb: { to: "/cookbook", label: "Cookbook" },
    callouts,
    title: item.title,
    hook: item.tagline || "",
    description: item.flavorProfile || "",
    makeThisWhen: item.useThisWhen || "",
    overview: "",
    badges,
    hero: { src: item.heroImage, alt: item.title, position: item.imagePosition || null },
    facts,
    safety,
    // The 143 `--- HEADER ---` lines across these entries used to render as
    // ordinary ingredient rows; parseGroups turns them into real group headers.
    ingredientGroups: parseGroups(item.ingredients, {
      fallbackTitle: "Ingredients",
      tone: "shared",
      idPrefix: "main",
    }),
    kidIngredientChoices: [],
    method,
    split,
    keys,
    deepDive,
    troubleshooting: item.troubleshooting || [],
    storage: item.mealPrep || item.storage || null,
    nutrition: {
      macros: null,
      batch:
        item.protein != null || item.calories != null
          ? {
              protein: item.protein,
              calories: item.calories,
              servings: item.servings,
              servingSize: item.servingSize || null,
            }
          : null,
      estimated: true,
      honesty: item.macroHonesty || "",
      costPerServing: null,
      dietTags: item.dietTags || [],
      splitAxes: [],
      effortTags: [],
      caveats: safety.nutritionCaveats,
      // Dinners store swaps as plain strings; cookbook stores structured
      // {insteadOf, use, note}. Flatten so one renderer handles both.
      substitutions: (item.substitutions || []).map((s) =>
        typeof s === "string"
          ? s
          : `Instead of ${s.insteadOf}, use ${s.use}${s.note ? ` — ${s.note}` : ""}`
      ),
    },
    video: item.video || item.videoSrc || null,
    brands: item.brands || [],
    tags: item.bestFor || [],
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
