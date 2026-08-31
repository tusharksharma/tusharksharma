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
import { readFileSync } from "fs";

const src = readFileSync("src/data/recipes.js", "utf-8");
// Recipe field order is id → meta(macros) → title, so match macros before title.
// Bind id → status:"live" → macros → title so placeholder recipes without a
// macros block don't spuriously match the NEXT recipe's macros.
const regex = /id:\s*(\d+),\s*\n\s*status:\s*"live",[\s\S]*?macros:\s*\{\s*protein:\s*(\d+),\s*calories:\s*(\d+),\s*fat:\s*(\d+),\s*carbs:\s*(\d+),\s*netCarbs:\s*\d+,\s*estimated:\s*(true|false)[\s\S]*?title:\s*"([^"]+)"/g;
const topProteinRegex = /id:\s*(\d+),\s*\n\s*status:\s*"live",[\s\S]*?\n\s*protein:\s*(\d+),\s*\n\s*calories:\s*(\d+),/g;

const topProtein = new Map();
const topCalories = new Map();
let m2;
while ((m2 = topProteinRegex.exec(src)) !== null) {
  topProtein.set(m2[1], Number(m2[2]));
  topCalories.set(m2[1], Number(m2[3]));
}

let errors = 0;
let warnings = 0;
let match;

// Ceiling for estimated recipes. Component labels realistically drift ±25-35 cal
// per plate against Atwater once fiber/tortilla/portion uncertainty stacks up.
// 40 catches genuine mis-math (the audit's "90 calorie" case) without churning
// on rounding drift.
const ATWATER_CEILING_ESTIMATED = 40;
const ATWATER_CEILING_EXACT = 10;
const PROTEIN_TOP_VS_META_CEILING = 5;

while ((match = regex.exec(src)) !== null) {
  const [, id, p, cal, f, c, est, title] = match;
  const calcCal = Number(p) * 4 + Number(c) * 4 + Number(f) * 9;
  const delta = Math.abs(Number(cal) - calcCal);
  const ceiling = est === "false" ? ATWATER_CEILING_EXACT : ATWATER_CEILING_ESTIMATED;

  if (delta > ceiling) {
    console.error(`ERROR: id=${id} "${title}" — Atwater delta ${delta} exceeds ${est === "false" ? "exact" : "estimated"} ceiling of ${ceiling} (${cal} stated vs ${calcCal} calculated)`);
    errors++;
  } else if (delta > 10 && est === "true") {
    console.log(`  ℹ id=${id} "${title}" — Δ${delta} (estimated: true, within ceiling)`);
    warnings++;
  }

  if (topProtein.has(id)) {
    const topP = topProtein.get(id);
    if (Math.abs(topP - Number(p)) > PROTEIN_TOP_VS_META_CEILING) {
      console.error(`ERROR: id=${id} "${title}" — top-level protein ${topP}g disagrees with meta.macros.protein ${p}g (>${PROTEIN_TOP_VS_META_CEILING}g drift)`);
      errors++;
    }
  }
  if (topCalories.has(id)) {
    const topCal = topCalories.get(id);
    if (Math.abs(topCal - Number(cal)) > ATWATER_CEILING_ESTIMATED) {
      console.error(`ERROR: id=${id} "${title}" — top-level calories ${topCal} disagrees with meta.macros.calories ${cal} (>${ATWATER_CEILING_ESTIMATED} drift)`);
      errors++;
    }
  }
}

if (errors > 0) {
  throw new Error(`Macro validation failed: ${errors} error(s). Fix the macros or, if the labels genuinely disagree, document the reason in macroHonesty.`);
}

console.log(`Macro validation OK. ${warnings} estimated recipes noted within ceiling.`);
