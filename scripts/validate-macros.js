/**
 * Validates macro math for all live recipes with estimated: false.
 * Fails the build if P*4 + C*4 + F*9 differs from calories by more than 10.
 * Uses total carbs (not net carbs) for the check.
 *
 * Recipes marked estimated: true are logged as warnings but don't fail.
 */
import { readFileSync } from "fs";

const src = readFileSync("src/data/recipes.js", "utf-8");
// Recipe field order is id → meta(macros) → title, so match macros before title.
const regex = /id:\s*(\d+),[\s\S]*?macros:\s*\{\s*protein:\s*(\d+),\s*calories:\s*(\d+),\s*fat:\s*(\d+),\s*carbs:\s*(\d+),\s*netCarbs:\s*\d+,\s*estimated:\s*(true|false)[\s\S]*?title:\s*"([^"]+)"/g;

let errors = 0;
let warnings = 0;
let match;

while ((match = regex.exec(src)) !== null) {
  const [, id, p, cal, f, c, est, title] = match;
  const calcCal = Number(p) * 4 + Number(c) * 4 + Number(f) * 9;
  const delta = Math.abs(Number(cal) - calcCal);

  if (delta > 10) {
    if (est === "false") {
      console.error(`ERROR: id=${id} "${title}" — macros don't add up (${cal} stated vs ${calcCal} calculated, Δ${delta}) but marked estimated: false`);
      errors++;
    } else {
      console.log(`  ℹ id=${id} "${title}" — Δ${delta} (estimated: true, OK)`);
      warnings++;
    }
  }
}

if (errors > 0) {
  throw new Error(`Macro validation failed: ${errors} recipe(s) marked estimated: false with bad math. Fix the macros or flip to estimated: true.`);
}

console.log(`Macro validation OK. ${warnings} estimated recipes noted.`);
