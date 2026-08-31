/**
 * Shared filter taxonomy for effortTags and splitAxes.
 *
 * The problem this solves: recipe authoring drifted into synonyms. 15 recipes
 * carried splitAxis "spice" while the filter chip is "heat", so none of them
 * surfaced when a shopper clicked Heat. 10 carried effortTag "one-pan" while
 * the chip is "one-pot". The taxonomy validator reported 150 warnings, which
 * is enough noise that real drift stopped being visible.
 *
 * Three buckets, and every authored value must land in exactly one:
 *
 *   CANONICAL_*   — surfaces as a filter chip.
 *   *_ALIASES     — a synonym of a canonical value. Normalized at read time so
 *                   the recipe surfaces under the canonical chip. The raw value
 *                   still renders on the card body.
 *   DESCRIPTIVE_* — deliberately not a filter. Equipment nouns with a single
 *                   recipe behind them, marketing words, and anything a better
 *                   control already owns (duration is owned by the Time filter,
 *                   which reads meta.totalMinutes and is accurate; "fast" is
 *                   not). These are silent — no chip, no warning.
 *
 * A value in none of the three warns. That warning is the point: it means
 * someone invented vocabulary and the taxonomy needs a decision.
 *
 * Consumed by src/pages/DinnersPage.jsx (chips + filtering) and
 * scripts/validate-taxonomy.js (build warning). Keep them reading from here —
 * the previous duplicated-Set arrangement is how they drifted apart.
 */

export const CANONICAL_EFFORT_TAGS = new Set([
  "15-min", "one-pot", "sheet-pan", "oven", "grill", "air-fryer", "stovetop",
  "no-cook", "meal-prep", "batch-cook", "reheats", "chain-from",
  "freezer-shortcut", "fridge-shortcut", "assembly",
  // Handheld — eat it standing up, one hand free. 10 recipes carry this and
  // it maps to a real weeknight need, so it earns a chip.
  "one-hand",
  "kid-approved", "weeknight", "emergency-dinner",
]);

export const EFFORT_TAG_ALIASES = {
  // One vessel, however the author phrased it.
  "one-pan": "one-pot",
  "one-pan-protein": "one-pot",
  "one-pan-finish": "one-pot",
  "one-pot-base": "one-pot",
  "one-oven": "one-pot",

  // Bake-in-a-vessel. muffin-pan and layered-bake are both "the oven does it".
  "layered-bake": "oven",
  "muffin-pan": "oven",

  // Direct-heat cooking surface.
  "pan-seared": "stovetop",
  "griddle": "stovetop",
  "wok": "stovetop",
  "cast-iron": "stovetop",

  // Cook once, eat across nights.
  "one-cook": "batch-cook",
  "make-once-eat-twice": "batch-cook",
  "family-batch": "batch-cook",
  "two-night-plan": "batch-cook",
  "batch-prep": "meal-prep",
  "leftover-friendly": "reheats",
  "leftover-play": "chain-from",

  // Straight from the freezer.
  "freezer-to-plate": "freezer-shortcut",
  "freezer-staple": "freezer-shortcut",

  // Nothing gets cooked.
  "no-cook-protein": "no-cook",
  "no-cook-assembly": "no-cook",
  "build-your-own": "assembly",
  "modular": "assembly",

  // 6 PM, nobody planned.
  "survival-mode": "emergency-dinner",
};

export const DESCRIPTIVE_EFFORT_TAGS = new Set([
  // Duration claims. The Time filter reads meta.totalMinutes and is exact;
  // these are vague and would mis-surface a 25-min recipe under a 15-min chip.
  "fast", "fastest", "low-effort", "hands-off", "shortcut", "convenience",
  "under-30", "20-min", "10-minute",

  // Marketing / true-of-everything. Every dinner here is a family dinner and
  // a split plate; a chip that matches the whole library filters nothing.
  "family-dinner", "split-plate", "viral", "comfort",

  // Owned by a better control: Sort by protein.
  "highest-protein",

  // Single-recipe equipment or dish shape. A chip with one result is noise.
  "waffle-iron", "split-bowl-tray", "split-pasta", "burger-night", "shawarma",
  "thighs",

  // Misfiled dietary concepts — these belong in meta.dietTags, which already
  // carries them on the recipes in question. Listed here so the validator
  // stays quiet without inventing a diet chip out of an effort tag.
  "low-carb", "halal-style",
]);

export const CANONICAL_SPLIT_AXES = new Set([
  "carb", "portion", "heat", "presentation", "protein", "prep-time",
  "sauce", "toppings", "vehicle",
]);

export const SPLIT_AXIS_ALIASES = {
  // The single biggest miss: 15 recipes split on spice level and none of them
  // surfaced under the Heat chip.
  "spice": "heat",

  "dipping-sauce": "sauce",

  // What goes on top, by any name.
  "chips": "toppings",
  "chip": "toppings",
  "cheese": "toppings",

  // How it looks on the plate.
  "plating": "presentation",
  "texture": "presentation",

  // What carries it — bun, tortilla, wrap, lettuce cup.
  "bun": "vehicle",

  // The starch itself.
  "pasta": "carb",
  "pizza-type": "carb",
};

export const DESCRIPTIVE_SPLIT_AXES = new Set([]);

function normalize(values, aliases, canonical) {
  const out = new Set();
  for (const v of values || []) {
    const mapped = aliases[v] || v;
    if (canonical.has(mapped)) out.add(mapped);
  }
  return [...out];
}

/** Authored effortTags -> the canonical chips this recipe should match. */
export function normalizeEffortTags(tags) {
  return normalize(tags, EFFORT_TAG_ALIASES, CANONICAL_EFFORT_TAGS);
}

/** Authored splitAxes -> the canonical chips this recipe should match. */
export function normalizeSplitAxes(axes) {
  return normalize(axes, SPLIT_AXIS_ALIASES, CANONICAL_SPLIT_AXES);
}

/**
 * Classify a single authored value. Returns "canonical" | "alias" |
 * "descriptive" | "unknown". Only "unknown" warrants a build warning.
 */
export function classifyEffortTag(v) {
  if (CANONICAL_EFFORT_TAGS.has(v)) return "canonical";
  if (EFFORT_TAG_ALIASES[v]) return "alias";
  if (DESCRIPTIVE_EFFORT_TAGS.has(v)) return "descriptive";
  return "unknown";
}

export function classifySplitAxis(v) {
  if (CANONICAL_SPLIT_AXES.has(v)) return "canonical";
  if (SPLIT_AXIS_ALIASES[v]) return "alias";
  if (DESCRIPTIVE_SPLIT_AXES.has(v)) return "descriptive";
  return "unknown";
}
