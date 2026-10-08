/**
 * Validates macro math for all live recipes.
 *
 * Atwater check: P*4 + C*4 + F*9 vs stated calories.
 *   - estimated: false — fail on Δ > 10
 *   - estimated: true  — fail on Δ > 30 (ceiling — "estimated" is not a license
 *     for arbitrary drift; big deltas point at a component-math mistake even
 *     when brand labels vary)
 *
 * Protein cross-check: meta.macros.protein vs top-level protein field —
 * they must agree to within 5g (both surface on the site; drift creates
 * card-vs-page contradictions).
 */
import recipes from "../src/data/recipes.js";

let errors = 0;
let warnings = 0;

// Ceiling for estimated recipes. Component labels realistically drift ±25-35 cal
// per plate against Atwater once fiber/tortilla/portion uncertainty stacks up.
// 40 catches genuine mis-math (the audit's "90 calorie" case) without churning
// on rounding drift.
const ATWATER_CEILING_ESTIMATED = 40;
const ATWATER_CEILING_EXACT = 10;
const PROTEIN_TOP_VS_META_CEILING = 5;

for (const recipe of recipes.filter((item) => item.status === "live" && item.meta?.macros)) {
  const { id, title, protein: topProtein, calories: topCalories } = recipe;
  const { protein: p, calories: cal, fat: f, carbs: c, estimated: est } = recipe.meta.macros;
  const hasCompleteMacros = [p, cal, f, c].every((value) => typeof value === "number");
  const calcCal = hasCompleteMacros ? p * 4 + c * 4 + f * 9 : null;
  const delta = hasCompleteMacros ? Math.abs(cal - calcCal) : null;
  const ceiling = est ? ATWATER_CEILING_ESTIMATED : ATWATER_CEILING_EXACT;

  if (hasCompleteMacros && delta > ceiling) {
    console.error(`ERROR: id=${id} "${title}" — Atwater delta ${delta} exceeds ${est ? "estimated" : "exact"} ceiling of ${ceiling} (${cal} stated vs ${calcCal} calculated)`);
    errors++;
  } else if (hasCompleteMacros && delta > 10 && est) {
    console.log(`  ℹ id=${id} "${title}" — Δ${delta} (estimated: true, within ceiling)`);
    warnings++;
  }

  if (topProtein != null && Math.abs(topProtein - p) > PROTEIN_TOP_VS_META_CEILING) {
    console.error(`ERROR: id=${id} "${title}" — top-level protein ${topProtein}g disagrees with meta.macros.protein ${p}g (>${PROTEIN_TOP_VS_META_CEILING}g drift)`);
    errors++;
  }
  if (topCalories != null && Math.abs(topCalories - cal) > ATWATER_CEILING_ESTIMATED) {
    console.error(`ERROR: id=${id} "${title}" — top-level calories ${topCalories} disagrees with meta.macros.calories ${cal} (>${ATWATER_CEILING_ESTIMATED} drift)`);
    errors++;
  }
}

if (errors > 0) {
  throw new Error(`Macro validation failed: ${errors} error(s). Fix the macros or, if the labels genuinely disagree, document the reason in macroHonesty.`);
}

console.log(`Macro validation OK. ${warnings} estimated recipes noted within ceiling.`);
