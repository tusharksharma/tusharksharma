function parseFrac(value) {
  const mixed = /^(\d+)\s+(\d+)\/(\d+)$/.exec(value);
  if (mixed) return Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3]);
  if (value.includes("/")) {
    const [numerator, denominator] = value.split("/").map(Number);
    return denominator ? numerator / denominator : parseFloat(value);
  }
  return parseFloat(value);
}

function formatNum(value) {
  const fractions = [[0.25, "1/4"], [0.33, "1/3"], [0.5, "1/2"], [0.67, "2/3"], [0.75, "3/4"]];
  const whole = Math.floor(value);
  const remainder = value - whole;
  if (remainder < 0.05) return whole.toString();
  for (const [fraction, label] of fractions) {
    if (Math.abs(remainder - fraction) < 0.05) return whole > 0 ? `${whole} ${label}` : label;
  }
  const rounded = Math.round(value * 10) / 10;
  return rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(1);
}

export function scaleIngredientText(text, scale) {
  if (scale === 1) return text;
  // Allocations and package specifications are not batch quantities.
  if (/^~?\d+(?:\.\d+)?\s*%/.test(text)) return text;
  return text.replace(/^(~?)(\d+(?:\s+\d+\/\d+|\/\d+|\.\d+)?(?:\s*[-–]\s*\d+(?:\s+\d+\/\d+|\/\d+|\.\d+)?)?)/, (_match, tilde, quantity) => {
    if (/[-–]/.test(quantity)) {
      return tilde + quantity.split(/\s*[-–]\s*/).map((part) => formatNum(parseFrac(part) * scale)).join("–");
    }
    return tilde + formatNum(parseFrac(quantity) * scale);
  });
}

// Authored amount references for this fixed-batch recipe; never scale arbitrary
// method numbers (temperatures, timers, package sizes and ratios stay fixed).
export function scaleBatchMethod(recipe, scale) {
  if (recipe?.slug !== "high-protein-pepperoni-mac-meal-prep" || scale === 1) return recipe;
  const amount = (n) => formatNum(n * scale);
  return { ...recipe, steps: recipe.steps.map((step) => ({ ...step, text: step.text
    .replace("all 3 boxes", `all ${amount(3)} boxes`)
    .replace("all three cheese packets", `all ${amount(3)} cheese packets`)
    .replace("1 cup whole milk", `${amount(1)} cups whole milk`)
    .replace("Chop 4 servings", `Chop ${amount(4)} servings`)
    .replace("PORTION EIGHT SERVINGS", `PORTION ${amount(8)} SERVINGS`)
    .replace("4 full servings and 4 slightly smaller servings", `${amount(4)} full servings and ${amount(4)} slightly smaller servings`)
    .replace("enough for two family dinners across two days", "portion the selected batch for your household")
  })) };
}
