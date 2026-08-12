/**
 * Schema validator that mirrors the RecipeDetail.jsx rendering contract.
 * Fails the build if any live recipe would crash on hydration.
 *
 * Catches the crash classes from the 2026-08-11 QA report:
 *   - substitutionNotes items must be strings (an object here crashes {s} render)
 *   - splitCook.adult must expose {label, extraIngredients, steps} (or
 *     variants[0].steps as fallback for steps)
 *   - splitCook.kid must expose {label, extraIngredients} plus steps
 *     (either kid.steps OR kid.options[].steps OR kid.variants[0].steps)
 *   - splitCook.sharedIngredients and sharedSteps must be arrays
 *
 * This is a schema check, not a JSX renderer. It runs after `vite build`
 * and imports recipes.js as pure data via ESM dynamic import.
 */
import { pathToFileURL } from "url";
import { resolve } from "path";

const modUrl = pathToFileURL(resolve("src/data/recipes.js")).href;
const { default: recipes } = await import(modUrl);

const errors = [];

function checkString(val, path, id, title) {
  if (typeof val !== "string") {
    errors.push(`id=${id} "${title}" — ${path} must be a string, got ${typeof val === "object" ? "object" : typeof val}. Renderer would crash on {s} interpolation.`);
    return false;
  }
  return true;
}

function checkArrayOfStrings(arr, path, id, title) {
  if (!Array.isArray(arr)) return;
  arr.forEach((item, i) => checkString(item, `${path}[${i}]`, id, title));
}

// Ingredients may be strings OR { text, link } objects — the IngredientList
// component handles both. This is looser than checkArrayOfStrings, and is the
// correct shape for the ingredient renderer contract.
function checkIngredientArray(arr, path, id, title) {
  if (!Array.isArray(arr)) return;
  arr.forEach((item, i) => {
    if (typeof item === "string") return;
    if (item && typeof item === "object" && typeof item.text === "string") return;
    errors.push(`id=${id} "${title}" — ${path}[${i}] must be a string or { text, link } object.`);
  });
}

// Steps may be strings OR objects; the StepList component normalizes.
function checkStepArray(arr, path, id, title) {
  if (!Array.isArray(arr)) return;
  arr.forEach((item, i) => {
    if (typeof item === "string") return;
    if (item && typeof item === "object") return;
    errors.push(`id=${id} "${title}" — ${path}[${i}] must be a string or object.`);
  });
}

function checkKidSteps(kid, id, title) {
  const hasKidSteps = Array.isArray(kid.steps) && kid.steps.length > 0;
  const hasOptions = Array.isArray(kid.options) && kid.options.length > 0
    && Array.isArray(kid.options[0].steps) && kid.options[0].steps.length > 0;
  const hasVariants = Array.isArray(kid.variants) && kid.variants.length > 0
    && Array.isArray(kid.variants[0].steps) && kid.variants[0].steps.length > 0;
  if (!hasKidSteps && !hasOptions && !hasVariants) {
    errors.push(`id=${id} "${title}" — splitCook.kid has no renderable steps. Provide kid.steps OR kid.options[0].steps OR kid.variants[0].steps.`);
  }
}

for (const r of recipes) {
  if (r.status !== "live") continue;
  const id = r.id;
  const title = r.title || "(untitled)";

  // substitutionNotes must be string[] — Caesar Crunch crashed on an object here.
  if (r.meta?.substitutionNotes) {
    checkArrayOfStrings(r.meta.substitutionNotes, "meta.substitutionNotes", id, title);
  }

  // splitCook shape — the renderer at RecipeDetail.jsx:508+ expects these fields.
  if (r.splitCook) {
    const sc = r.splitCook;

    if (!Array.isArray(sc.sharedIngredients)) {
      errors.push(`id=${id} "${title}" — splitCook.sharedIngredients must be an array.`);
    } else {
      checkIngredientArray(sc.sharedIngredients, "splitCook.sharedIngredients", id, title);
    }
    if (!Array.isArray(sc.sharedSteps)) {
      errors.push(`id=${id} "${title}" — splitCook.sharedSteps must be an array.`);
    } else {
      checkStepArray(sc.sharedSteps, "splitCook.sharedSteps", id, title);
    }

    if (!sc.adult) {
      errors.push(`id=${id} "${title}" — splitCook.adult is missing.`);
    } else {
      if (!sc.adult.label) errors.push(`id=${id} "${title}" — splitCook.adult.label is missing.`);
      if (!Array.isArray(sc.adult.extraIngredients)) {
        errors.push(`id=${id} "${title}" — splitCook.adult.extraIngredients must be an array (renderer expects this exact field, not "finishIngredients").`);
      } else {
        checkIngredientArray(sc.adult.extraIngredients, "splitCook.adult.extraIngredients", id, title);
      }
      if (!Array.isArray(sc.adult.steps)) {
        errors.push(`id=${id} "${title}" — splitCook.adult.steps must be an array (renderer expects this exact field, not "finishSteps").`);
      } else {
        checkStepArray(sc.adult.steps, "splitCook.adult.steps", id, title);
      }
    }

    if (!sc.kid) {
      errors.push(`id=${id} "${title}" — splitCook.kid is missing.`);
    } else {
      if (!sc.kid.label) errors.push(`id=${id} "${title}" — splitCook.kid.label is missing.`);
      // Renderer supports three shapes for kid extras/steps:
      // 1. kid.extraIngredients + kid.steps
      // 2. kid.options[].extraIngredients + kid.options[].steps
      // 3. kid.variants[0].steps (steps-only fallback introduced 2026-08-11)
      const hasExtras = Array.isArray(sc.kid.extraIngredients);
      const hasOptions = Array.isArray(sc.kid.options) && sc.kid.options.length > 0;
      if (!hasExtras && !hasOptions) {
        errors.push(`id=${id} "${title}" — splitCook.kid.extraIngredients (or kid.options[0].extraIngredients) must be an array.`);
      }
      if (Array.isArray(sc.kid.extraIngredients)) {
        checkIngredientArray(sc.kid.extraIngredients, "splitCook.kid.extraIngredients", id, title);
      }
      checkKidSteps(sc.kid, id, title);
    }
  }
}

if (errors.length > 0) {
  for (const e of errors) console.error(`ERROR: ${e}`);
  throw new Error(`Render-schema validation failed: ${errors.length} issue(s). Would crash on hydration.`);
}

console.log(`Render-schema validation OK. ${recipes.filter((r) => r.status === "live").length} live recipes checked.`);
