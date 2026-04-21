import { useState, useCallback, useEffect } from "react";
import track from "../hooks/useTrack";

// Base quantities at 4 servings. Scalable items have baseQty (number) + unit.
// Non-scalable items (pantry staples) have qty as string.
// All baseQty values are calibrated for 4 servings (2 adults + 2 kids).
// Items with baseQty scale with family size. Items with only qty are pantry
// staples or "buy 1" items that don't need scaling (seasonings, oil, etc).
const GROCERY_BY_WEEK = {
  // Week 1: Mon=Sandwiches(23), Wed=Smash Tacos(22), Fri=Air Fryer Chicken(21)
  1: {
    "Protein": [
      { name: "Kirkland chicken breast fillets", baseQty: 4, unit: "fillets", meal: "Mon" },
      { name: "99/1 ground chicken", baseQty: 24, unit: "oz", meal: "Wed" },
      { name: "Chicken thighs (boneless skinless)", baseQty: 2, unit: "lb", meal: "Fri" },
    ],
    "Carbs": [
      { name: "Bettergoods Keto Hamburger Buns", baseQty: 4, unit: "buns", meal: "Mon" },
      { name: "Slider buns", baseQty: 4, unit: "buns", meal: "Mon kid" },
      { name: "Mission Zero Net Carbs tortillas", baseQty: 8, unit: "tortillas", meal: "Wed" },
      { name: "Mission Street Tacos flour tortillas", baseQty: 4, unit: "tortillas", meal: "Wed kid" },
      { name: "Dinner rolls", baseQty: 4, unit: "rolls", meal: "Fri kid" },
    ],
    "Vegetables": [
      { name: "Romaine lettuce", baseQty: 1, unit: "head", meal: "Mon + Wed" },
      { name: "Pickles", qty: "1 jar", meal: "Mon" },
      { name: "Broccoli", baseQty: 16, unit: "oz", meal: "Fri" },
      { name: "Onion", baseQty: 1, unit: "large", meal: "All" },
      { name: "Garlic", qty: "1 head", meal: "All" },
    ],
    "Sauce & Flavor": [
      { name: "Liquid Chipotle or Money Mustard", baseQty: 4, unit: "servings", meal: "Mon" },
      { name: "Spiceology Taco seasoning", qty: "pantry", meal: "Wed" },
      { name: "Bolthouse Farms Caesar dressing", baseQty: 8, unit: "tbsp", meal: "Wed" },
      { name: "Dan-O's Outlaw seasoning", qty: "pantry", meal: "Fri" },
      { name: "Dan-O's Original seasoning", qty: "pantry", meal: "Fri" },
      { name: "Dan-O's Cheesoning", qty: "pantry", meal: "Fri" },
      { name: "Chili oil or sriracha", qty: "pantry", meal: "All" },
      { name: "Lime", baseQty: 2, unit: "", meal: "Wed" },
      { name: "Fresh cilantro", baseQty: 1, unit: "bunch", meal: "Wed" },
    ],
    "Creamy Base": [
      { name: "Kraft Mild Cheddar shredded", baseQty: 4, unit: "oz", meal: "Wed" },
    ],
    "Kid Mode": [
      { name: "Ketchup", qty: "pantry", meal: "Mon kid" },
      { name: "Regular Caesar dressing", qty: "pantry", meal: "Wed kid" },
      { name: "Quest Tortilla Chips", baseQty: 1, unit: "bag", meal: "Wed" },
      { name: "Regular chips", baseQty: 1, unit: "bag", meal: "Wed kid" },
    ],
  },
  // Week 2: Mon=Stir-fry(4), Wed=Tri-tip Penne(2), Fri=Rice Bowl(24)
  2: {
    "Protein": [
      { name: "Ground beef or sirloin", baseQty: 1.25, unit: "lb", meal: "Mon" },
      { name: "Tri-tip steak", baseQty: 1.25, unit: "lb", meal: "Wed" },
      { name: "Gary's QuickSteak Sirloin", baseQty: 1, unit: "pack", meal: "Fri" },
      { name: "Earth's Best mini meatballs", baseQty: 1, unit: "bag", meal: "Kid swap" },
    ],
    "Carbs": [
      { name: "Rice", baseQty: 14, unit: "oz dry", meal: "Mon + Fri" },
      { name: "Penne pasta", baseQty: 8, unit: "oz", meal: "Wed" },
    ],
    "Vegetables": [
      { name: "Broccoli", baseQty: 12, unit: "oz", meal: "Mon" },
      { name: "Spinach", baseQty: 3, unit: "oz", meal: "Wed" },
      { name: "Onion", baseQty: 1, unit: "large", meal: "All" },
      { name: "Garlic", qty: "1 head", meal: "All" },
    ],
    "Sauce & Flavor": [
      { name: "Soy sauce or tamari", qty: "pantry", meal: "Mon" },
      { name: "Sesame oil", qty: "pantry", meal: "Mon" },
      { name: "Roli Roti bone broth", baseQty: 32, unit: "oz", meal: "Mon + Wed" },
      { name: "Chicken bone broth", baseQty: 3, unit: "cups", meal: "Fri" },
      { name: "Kirkland Organic Ghee", qty: "pantry", meal: "Fri" },
      { name: "Turmeric", qty: "pantry", meal: "Fri" },
      { name: "Liquid Chipotle Sauce", baseQty: 4, unit: "servings", meal: "Fri" },
      { name: "Chili oil or sriracha", qty: "pantry", meal: "All" },
    ],
    "Creamy Base": [
      { name: "Cottage cheese", baseQty: 12, unit: "oz", meal: "Wed" },
      { name: "Fairlife fat-free milk", qty: "pantry", meal: "Sauce base" },
    ],
    "Kid Mode": [
      { name: "Shredded mild cheese", qty: "pantry", meal: "Kid topping" },
    ],
  },
  // Week 3: Mon=Gnocchi(1), Wed=Sandwiches(23), Fri=Rice Bowl(24)
  3: {
    "Protein": [
      { name: "Chicken thighs or Del Real shredded", baseQty: 1.25, unit: "lb", meal: "Mon" },
      { name: "Kirkland chicken breast fillets", baseQty: 4, unit: "fillets", meal: "Wed" },
      { name: "Gary's QuickSteak Sirloin", baseQty: 1, unit: "pack", meal: "Fri" },
    ],
    "Carbs": [
      { name: "Shelf-stable gnocchi", baseQty: 16, unit: "oz", meal: "Mon" },
      { name: "Bettergoods Keto Hamburger Buns", baseQty: 4, unit: "buns", meal: "Wed" },
      { name: "Slider buns", baseQty: 4, unit: "buns", meal: "Wed kid" },
      { name: "Rice", baseQty: 14, unit: "oz dry", meal: "Fri" },
    ],
    "Vegetables": [
      { name: "Bell peppers", baseQty: 2.5, unit: "", meal: "Mon" },
      { name: "Romaine lettuce", baseQty: 1, unit: "head", meal: "Wed" },
      { name: "Pickles", qty: "1 jar", meal: "Wed" },
      { name: "Onion", baseQty: 1, unit: "large", meal: "All" },
      { name: "Garlic", qty: "1 head", meal: "All" },
    ],
    "Sauce & Flavor": [
      { name: "Dan-O's Outlaw seasoning", qty: "pantry", meal: "Mon" },
      { name: "Lime", baseQty: 1, unit: "", meal: "Mon" },
      { name: "Liquid Chipotle or Money Mustard", baseQty: 4, unit: "servings", meal: "Wed + Fri" },
      { name: "Chicken bone broth", baseQty: 3, unit: "cups", meal: "Fri" },
      { name: "Kirkland Organic Ghee", qty: "pantry", meal: "Fri" },
      { name: "Turmeric", qty: "pantry", meal: "Fri" },
      { name: "Chili oil or sriracha", qty: "pantry", meal: "All" },
    ],
    "Creamy Base": [
      { name: "Cottage cheese", baseQty: 12, unit: "oz", meal: "Mon" },
      { name: "Fairlife fat-free milk", qty: "pantry", meal: "Sauce base" },
    ],
    "Kid Mode": [
      { name: "Rao's Alfredo sauce", baseQty: 15, unit: "oz jar", meal: "Mon kid" },
      { name: "Ketchup", qty: "pantry", meal: "Wed kid" },
      { name: "Shredded mild cheese", qty: "pantry", meal: "Kid topping" },
    ],
  },
};

function getGrocery(week) { return GROCERY_BY_WEEK[week] || GROCERY_BY_WEEK[1]; }

// Units that must be purchased as whole items — always round up
const WHOLE_UNITS = new Set(["head", "bunch", "bag", "jar", "pack", "large", "bottle", "buns", "fillets", "rolls", "tortillas", "servings"]);

// All baseQty values are for 4 servings. Scale = totalServings / 4.
// Consistent with recipe pages and weekly planner — kids count as full servings.
function scaleQty(entry, adults, kids, leftovers) {
  if (entry.baseQty != null) {
    const scale = ((adults + kids) / 4) * (leftovers ? 2 : 1);
    const scaled = entry.baseQty * scale;
    // Whole-unit items round up (you can't buy half a head of lettuce)
    if (WHOLE_UNITS.has(entry.unit)) {
      const ceiled = Math.ceil(scaled);
      return `${ceiled} ${entry.unit}`.trim();
    }
    const rounded = Math.round(scaled * 10) / 10;
    const display = rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(1);
    return `~${display} ${entry.unit}`.trim();
  }
  if (entry.qty === "pantry") return "";
  return entry.qty || "";
}

export default function GroceryList({ adults = 2, kids = 2, leftovers = true, excludedTags = [], week = 1, planLabel = "" }) {
  const [checked, setChecked] = useState(new Set());
  const [isOpen, setIsOpen] = useState(false);
  const GROCERY = getGrocery(week);
  const allItems = Object.values(GROCERY).flat();

  // Reset checked items when anything changes the shopping list
  useEffect(() => {
    setChecked(new Set());
  }, [week, adults, kids, leftovers, excludedTags]);

  // Filter out items whose meal tag matches an excluded day
  const isExcluded = (entry) => {
    if (excludedTags.length === 0) return false;
    const tag = entry.meal;
    if (tag === "All" || tag === "Sauce base" || tag === "Kid swap" || tag === "Kid topping") return false;
    const tagDays = tag.split(/\s*\+\s*/).map((d) => d.trim().substring(0, 3));
    return tagDays.every((d) => excludedTags.includes(d));
  };

  const toggle = useCallback((idx) => {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  }, []);

  const clearChecked = () => setChecked(new Set());

  const copyList = () => {
    const text = Object.entries(GROCERY)
      .map(([cat, items]) => {
        const visible = items.filter((i) => !isExcluded(i));
        if (visible.length === 0) return null;
        return `${cat}:\n${visible.map((i) => `  - ${i.name}${scaleQty(i, adults, kids, leftovers) ? ` (${scaleQty(i, adults, kids, leftovers)})` : ""}`).join("\n")}`;
      })
      .filter(Boolean)
      .join("\n\n");
    navigator.clipboard.writeText(text);
  };

  // Build a set of visible item indices for accurate counting
  let countIdx = 0;
  const visibleIndices = new Set();
  allItems.forEach((entry) => {
    const idx = countIdx++;
    if (!isExcluded(entry)) visibleIndices.add(idx);
  });
  const visibleCount = visibleIndices.size;
  const checkedCount = [...checked].filter((idx) => visibleIndices.has(idx)).length;
  const allDone = checkedCount >= visibleCount && visibleCount > 0;

  if (!isOpen) {
    return (
      <button
        onClick={() => { setIsOpen(true); track("grocery_open", { week, adults, kids, leftovers }); }}
        className="w-full bg-amber-500 text-black font-bold rounded-xl py-3.5 text-sm hover:bg-amber-400 transition-colors cursor-pointer"
      >
        Shop This Week ({adults} adults{kids > 0 ? ` + ${kids} kids` : ""}{leftovers ? " + leftovers" : ""})
      </button>
    );
  }

  let globalIdx = 0;

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-neutral-800">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-bold text-white">{planLabel || `Plan ${week}`} — Grocery List</h3>
          <button onClick={() => setIsOpen(false)} className="text-neutral-500 hover:text-neutral-300 text-xs cursor-pointer">Close</button>
        </div>
        <p className="text-neutral-500 text-xs">
          {adults} adults{kids > 0 ? ` + ${kids} kids` : ""} &middot; {3 - excludedTags.length} dinners{leftovers ? " &middot; doubled for leftovers" : ""}
        </p>
        {excludedTags.length > 0 && (
          <p className="text-amber-400 text-[10px] font-semibold mt-1">
            Shopping list updated for {3 - excludedTags.length} dinners
          </p>
        )}
        <div className="flex items-center gap-3 mt-2 text-[10px]">
          <span className="text-neutral-600">Included:</span>
          {["Mon", "Wed", "Fri"].map((d) => (
            <span key={d} className={excludedTags.includes(d) ? "text-neutral-700 line-through" : "text-neutral-400 font-semibold"}>
              {d}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3 mt-3">
          <button onClick={() => { copyList(); track("grocery_copy", { week }); }} className="px-3 py-1.5 bg-neutral-800 text-neutral-300 text-xs font-semibold rounded-lg hover:bg-neutral-700 transition-colors cursor-pointer">
            Copy List
          </button>
          {checkedCount > 0 && (
            <button onClick={clearChecked} className="px-3 py-1.5 bg-neutral-800 text-neutral-400 text-xs font-semibold rounded-lg hover:bg-neutral-700 transition-colors cursor-pointer">
              Clear ({checkedCount})
            </button>
          )}
          <span className="text-neutral-600 text-xs ml-auto">{checkedCount}/{visibleCount}</span>
        </div>
      </div>

      {/* Checklist */}
      <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
        {Object.entries(GROCERY).map(([category, items]) => (
          <div key={category}>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500 mb-2.5">{category}</h4>
            <ul className="space-y-0.5">
              {items.map((entry) => {
                const idx = globalIdx++;
                if (isExcluded(entry)) return null;
                const isChecked = checked.has(idx);
                const qty = scaleQty(entry, adults, kids, leftovers);
                return (
                  <li key={idx} onClick={() => toggle(idx)} className="flex items-start gap-3 py-2 px-2 -mx-2 rounded-lg hover:bg-neutral-800/50 cursor-pointer select-none transition-colors">
                    <span className={`w-4 h-4 mt-0.5 rounded border flex-shrink-0 flex items-center justify-center text-[10px] transition-colors ${isChecked ? "bg-amber-500 border-amber-500 text-black" : "border-neutral-600"}`}>
                      {isChecked && "\u2713"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className={`text-xs font-semibold block transition-colors ${isChecked ? "text-neutral-600 line-through" : "text-neutral-100"}`}>
                        {entry.name}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        {qty && <span className={`text-[10px] ${isChecked ? "text-neutral-700" : "text-neutral-500"}`}>{qty}</span>}
                        <span className="text-[10px] bg-neutral-800 text-neutral-600 px-1.5 py-0 rounded">{entry.meal}</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Completion / efficiency */}
      {allDone ? (
        <div className="px-5 py-6 border-t border-amber-500/30 bg-amber-500/5 text-center">
          <p className="text-amber-400 font-black text-sm">Done. You just solved your week.</p>
          <p className="text-neutral-500 text-xs mt-1">3 dinners, 7 days, zero decisions left.</p>
        </div>
      ) : (
        <div className="px-5 py-4 border-t border-neutral-800 bg-neutral-900/50">
          <p className="text-neutral-500 text-xs text-center">
            You only buy <span className="text-white font-semibold">3 proteins</span>. That covers your entire week.
            Same veg reused. Same sauce base. Minimal waste.
          </p>
        </div>
      )}
    </div>
  );
}
