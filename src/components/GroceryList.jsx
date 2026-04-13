import { useState, useCallback } from "react";

// Base quantities at 4 servings. Scalable items have baseQty (number) + unit.
// Non-scalable items (pantry staples) have qty as string.
const GROCERY = {
  "Protein": [
    { name: "Ground beef or sirloin", baseQty: 1.25, unit: "lb", meal: "Mon" },
    { name: "Chicken thighs or Del Real shredded", baseQty: 1.25, unit: "lb", meal: "Wed" },
    { name: "Tri-tip steak", baseQty: 1.25, unit: "lb", meal: "Fri" },
    { name: "Earth's Best mini meatballs", qty: "1 bag", meal: "Kid swap" },
  ],
  "Carbs": [
    { name: "Rice", baseQty: 14, unit: "oz dry", meal: "Mon" },
    { name: "Shelf-stable gnocchi", baseQty: 16, unit: "oz", meal: "Wed" },
    { name: "Penne pasta", baseQty: 8, unit: "oz", meal: "Fri" },
  ],
  "Vegetables": [
    { name: "Broccoli", baseQty: 12, unit: "oz", meal: "Mon" },
    { name: "Bell peppers", baseQty: 2.5, unit: "", meal: "Wed" },
    { name: "Onion", baseQty: 1, unit: "large", meal: "All" },
    { name: "Spinach", baseQty: 3, unit: "oz", meal: "Fri" },
    { name: "Garlic", qty: "1 head", meal: "All" },
  ],
  "Sauce & Flavor": [
    { name: "Soy sauce or tamari", qty: "", meal: "Mon" },
    { name: "Roli Roti bone broth", qty: "1 carton", meal: "Mon + Fri" },
    { name: "Dan-O's Outlaw seasoning", qty: "", meal: "Wed + Fri" },
    { name: "Chili oil or sriracha", qty: "", meal: "All" },
    { name: "Sesame oil", qty: "", meal: "Mon" },
    { name: "Lime", qty: "1", meal: "Wed + Fri" },
  ],
  "Creamy Base": [
    { name: "Cottage cheese", baseQty: 12, unit: "oz", meal: "Wed + Fri" },
    { name: "Fairlife fat-free milk", qty: "", meal: "Sauce base" },
  ],
  "Kid Mode": [
    { name: "Rao's Alfredo sauce", qty: "1 jar", meal: "Wed kid" },
    { name: "Shredded mild cheese", qty: "", meal: "Kid topping" },
  ],
};

const allItems = Object.values(GROCERY).flat();

function scaleQty(entry, scale) {
  if (entry.baseQty != null) {
    const scaled = entry.baseQty * scale;
    const rounded = Math.round(scaled * 10) / 10;
    const display = rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(1);
    return `~${display} ${entry.unit}`.trim();
  }
  return entry.qty || "";
}

export default function GroceryList({ servings = 4, excludedTags = [] }) {
  const [checked, setChecked] = useState(new Set());
  const [isOpen, setIsOpen] = useState(false);
  const scale = servings / 4;

  // Filter out items whose meal tag matches an excluded day
  const isExcluded = (entry) => {
    if (excludedTags.length === 0) return false;
    // Items tagged "All" or multi-day tags that still have included days stay
    const tag = entry.meal;
    if (tag === "All" || tag === "Sauce base" || tag === "Kid swap" || tag === "Kid topping") return false;
    // Check if ALL days in this tag are excluded
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
      .map(([cat, items]) =>
        `${cat}:\n${items.map((i) => `  - ${i.name}${scaleQty(i, scale) ? ` (${scaleQty(i, scale)})` : ""}`).join("\n")}`
      )
      .join("\n\n");
    navigator.clipboard.writeText(text);
  };

  const visibleCount = allItems.filter((e) => !isExcluded(e)).length;
  const checkedCount = checked.size;
  const totalCount = visibleCount;
  const allDone = checkedCount >= totalCount && totalCount > 0;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bg-amber-500 text-black font-bold rounded-xl py-3.5 text-sm hover:bg-amber-400 transition-colors cursor-pointer"
      >
        Shop This Week ({servings} servings)
      </button>
    );
  }

  let globalIdx = 0;

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-neutral-800">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-bold text-white">Week 1 Grocery List</h3>
          <button onClick={() => setIsOpen(false)} className="text-neutral-500 hover:text-neutral-300 text-xs cursor-pointer">Close</button>
        </div>
        <p className="text-neutral-500 text-xs">
          Feeds {servings} people &middot; 3 dinners &middot; leftovers included &middot; minimal waste
        </p>
        <div className="flex items-center gap-3 mt-3">
          <button onClick={copyList} className="px-3 py-1.5 bg-neutral-800 text-neutral-300 text-xs font-semibold rounded-lg hover:bg-neutral-700 transition-colors cursor-pointer">
            Copy List
          </button>
          {checkedCount > 0 && (
            <button onClick={clearChecked} className="px-3 py-1.5 bg-neutral-800 text-neutral-400 text-xs font-semibold rounded-lg hover:bg-neutral-700 transition-colors cursor-pointer">
              Clear ({checkedCount})
            </button>
          )}
          <span className="text-neutral-600 text-xs ml-auto">{checkedCount}/{totalCount}</span>
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
                const qty = scaleQty(entry, scale);
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
