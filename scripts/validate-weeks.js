/**
 * Validates planner/grocery sync. Fails the build on mismatch.
 *
 * Checks:
 * 1. Same week numbers exist in both files
 * 2. Planner recipe IDs for each week are logged for manual review
 * 3. Grocery day tags match planner day assignments
 */
import { readFileSync } from "fs";

const plannerSrc = readFileSync("src/components/YourWeek.jsx", "utf-8");
const grocerySrc = readFileSync("src/components/GroceryList.jsx", "utf-8");

// Extract week numbers from planner
const plannerWeekNums = [];
const weeksMatch = plannerSrc.match(/const WEEKS\s*=\s*\{([\s\S]*?)\n\};/);
if (weeksMatch) {
  for (const m of weeksMatch[1].matchAll(/^ {2}(\d+):\s*\{/gm)) {
    plannerWeekNums.push(Number(m[1]));
  }
}

// Extract week numbers from grocery
const groceryWeekNums = [];
const groceryMatch = grocerySrc.match(/const GROCERY_BY_WEEK\s*=\s*\{([\s\S]*?)\n\};/);
if (groceryMatch) {
  for (const m of groceryMatch[1].matchAll(/^ {2}(\d+):\s*\{/gm)) {
    groceryWeekNums.push(Number(m[1]));
  }
}

let errors = 0;

// Check week numbers match
for (const w of plannerWeekNums) {
  if (!groceryWeekNums.includes(w)) {
    console.error(`ERROR: Week ${w} in planner but NOT in grocery`);
    errors++;
  }
}
for (const w of groceryWeekNums) {
  if (!plannerWeekNums.includes(w)) {
    console.error(`ERROR: Week ${w} in grocery but NOT in planner`);
    errors++;
  }
}

// For each planner week, extract recipe IDs + days and verify grocery has
// items tagged to those days
for (const w of plannerWeekNums) {
  const weekPattern = new RegExp(`^ {2}${w}:\\s*\\{[\\s\\S]*?cookDays:\\s*\\[([\\s\\S]*?)\\]`, "m");
  const weekMatch = plannerSrc.match(weekPattern);
  if (!weekMatch) continue;

  const ids = [...weekMatch[1].matchAll(/id:\s*(\d+)/g)].map((m) => Number(m[1]));
  const days = [...weekMatch[1].matchAll(/day:\s*"(\w+)"/g)].map((m) => m[1].substring(0, 3));

  // Verify grocery has items for each day in this week
  const groceryWeekPattern = new RegExp(`^ {2}${w}:\\s*\\{([\\s\\S]*?)(?=^ {2}\\d+:|^\\};)`, "m");
  const groceryWeekMatch = grocerySrc.match(groceryWeekPattern);

  if (!groceryWeekMatch) {
    console.error(`ERROR: Week ${w} grocery data not found`);
    errors++;
    continue;
  }

  const groceryBody = groceryWeekMatch[1];
  const groceryDays = new Set();
  for (const m of groceryBody.matchAll(/meal:\s*"([^"]+)"/g)) {
    for (const d of m[1].split(/\s*\+\s*/)) {
      const day = d.trim().replace(/\s+kid$/, "").substring(0, 3);
      if (["Mon", "Wed", "Fri"].includes(day)) groceryDays.add(day);
    }
  }

  for (let i = 0; i < days.length; i++) {
    if (!groceryDays.has(days[i])) {
      console.error(`ERROR: Week ${w} planner has ${days[i]}=id${ids[i]} but grocery has NO items tagged "${days[i]}"`);
      errors++;
    }
  }

  console.log(`  Week ${w}: ${days.map((d, i) => `${d}=id${ids[i]}`).join(", ")} | Grocery days: ${[...groceryDays].join(", ")}`);
}

if (errors > 0) {
  throw new Error(`Validation failed with ${errors} error(s). Fix planner/grocery sync.`);
} else {
  console.log(`Planner/grocery sync OK (${plannerWeekNums.length} weeks, day tags verified).`);
}
