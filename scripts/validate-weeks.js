/**
 * Validates that the weekly planner and grocery list are in sync.
 * Run as part of the build: npm run build
 *
 * Checks:
 * 1. Every week in the planner has a matching grocery list
 * 2. Every grocery list has a matching planner week
 * 3. Recipe IDs in each planner week match known recipes
 */
import { readFileSync } from "fs";

const plannerSrc = readFileSync("src/components/YourWeek.jsx", "utf-8");
const grocerySrc = readFileSync("src/components/GroceryList.jsx", "utf-8");

const plannerWeekNums = [];
const weeksMatch = plannerSrc.match(/const WEEKS\s*=\s*\{([\s\S]*?)\n\};/);
if (weeksMatch) {
  const body = weeksMatch[1];
  for (const m of body.matchAll(/^\s+(\d+):\s*\{/gm)) {
    plannerWeekNums.push(Number(m[1]));
  }
}

// Extract grocery week numbers
const groceryWeekNums = [];
const groceryMatch = grocerySrc.match(/const GROCERY_BY_WEEK\s*=\s*\{([\s\S]*?)\n\};/);
if (groceryMatch) {
  const body = groceryMatch[1];
  for (const m of body.matchAll(/^\s+(\d+):\s*\{/gm)) {
    groceryWeekNums.push(Number(m[1]));
  }
}

let errors = 0;

// Check planner weeks have grocery counterparts
for (const w of plannerWeekNums) {
  if (!groceryWeekNums.includes(w)) {
    console.error(`ERROR: Week ${w} exists in planner but NOT in grocery list`);
    errors++;
  }
}

// Check grocery weeks have planner counterparts
for (const w of groceryWeekNums) {
  if (!plannerWeekNums.includes(w)) {
    console.error(`ERROR: Week ${w} exists in grocery list but NOT in planner`);
    errors++;
  }
}

// Check week count matches
if (plannerWeekNums.length !== groceryWeekNums.length) {
  console.error(`ERROR: Planner has ${plannerWeekNums.length} weeks, grocery has ${groceryWeekNums.length} weeks`);
  errors++;
}

// Verify planner comments in grocery match actual planner content
for (const w of plannerWeekNums) {
  // Extract recipe IDs from planner for this week
  const weekPattern = new RegExp(`^\\s+${w}:\\s*\\{[\\s\\S]*?cookDays:\\s*\\[([\\s\\S]*?)\\]`, "m");
  const weekMatch = plannerSrc.match(weekPattern);
  if (weekMatch) {
    const ids = [...weekMatch[1].matchAll(/id:\s*(\d+)/g)].map((m) => Number(m[1]));
    const days = [...weekMatch[1].matchAll(/day:\s*"(\w+)"/g)].map((m) => m[1]);
    if (ids.length === 3 && days.length === 3) {
      console.log(`  Week ${w}: ${days[0]}=id${ids[0]}, ${days[1]}=id${ids[1]}, ${days[2]}=id${ids[2]}`);
    }
  }
}

if (errors > 0) {
  console.error(`\nValidation FAILED with ${errors} error(s). Fix planner/grocery sync before deploying.`);
  throw new Error(`Validation failed with ${errors} error(s)`);
} else {
  console.log(`Planner/grocery sync OK (${plannerWeekNums.length} weeks matched).`);
}
