import { useState, useCallback } from "react";

const GROCERY = {
  "Protein": [
    { name: "Ground beef or sirloin", qty: "1.25 lb", meal: "Mon" },
    { name: "Chicken thighs or Del Real shredded", qty: "1.25 lb", meal: "Wed" },
    { name: "Tri-tip steak", qty: "1.25 lb", meal: "Fri" },
    { name: "Earth's Best mini meatballs", qty: "1 bag", meal: "Kid swap" },
  ],
  "Carbs": [
    { name: "Rice", qty: "2 cups dry", meal: "Mon" },
    { name: "Shelf-stable gnocchi", qty: "16 oz", meal: "Wed" },
    { name: "Penne pasta", qty: "8 oz", meal: "Fri" },
  ],
  "Vegetables": [
    { name: "Broccoli", qty: "3-4 cups", meal: "Mon" },
    { name: "Bell peppers", qty: "2-3", meal: "Wed" },
    { name: "Onion", qty: "1 large", meal: "All" },
    { name: "Spinach", qty: "2 cups", meal: "Fri" },
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
    { name: "Cottage cheese", qty: "1.5 cups", meal: "Wed + Fri" },
    { name: "Fairlife fat-free milk", qty: "", meal: "Sauce base" },
  ],
  "Kid Mode": [
    { name: "Rao's Alfredo sauce", qty: "1 jar", meal: "Wed kid" },
    { name: "Shredded mild cheese", qty: "", meal: "Kid topping" },
  ],
};

const allItems = Object.values(GROCERY).flat();

export default function GroceryList() {
  const [checked, setChecked] = useState(new Set());
  const [isOpen, setIsOpen] = useState(false);

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
        `${cat}:\n${items.map((i) => `  - ${i.name}${i.qty ? ` (${i.qty})` : ""}`).join("\n")}`
      )
      .join("\n\n");
    navigator.clipboard.writeText(text);
  };

  const checkedCount = checked.size;
  const totalCount = allItems.length;
  const allDone = checkedCount === totalCount && totalCount > 0;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bg-amber-500 text-black font-bold rounded-xl py-3.5 text-sm hover:bg-amber-400 transition-colors cursor-pointer"
      >
        Shop This Week
      </button>
    );
  }

  let globalIdx = 0;

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
      {/* Header bar */}
      <div className="px-5 py-4 border-b border-neutral-800">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-bold text-white">Week 1 Grocery List</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-neutral-500 hover:text-neutral-300 text-xs cursor-pointer"
          >
            Close
          </button>
        </div>
        <p className="text-neutral-500 text-xs">
          Feeds 4 people &middot; 3 meals &middot; leftovers included &middot; minimal waste
        </p>
        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={copyList}
            className="px-3 py-1.5 bg-neutral-800 text-neutral-300 text-xs font-semibold rounded-lg hover:bg-neutral-700 transition-colors cursor-pointer"
          >
            Copy List
          </button>
          {checkedCount > 0 && (
            <button
              onClick={clearChecked}
              className="px-3 py-1.5 bg-neutral-800 text-neutral-400 text-xs font-semibold rounded-lg hover:bg-neutral-700 transition-colors cursor-pointer"
            >
              Clear Checked ({checkedCount})
            </button>
          )}
          <span className="text-neutral-600 text-xs ml-auto">
            {checkedCount}/{totalCount} items
          </span>
        </div>
      </div>

      {/* Checklist */}
      <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
        {Object.entries(GROCERY).map(([category, items]) => (
          <div key={category}>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500 mb-2.5">
              {category}
            </h4>
            <ul className="space-y-0.5">
              {items.map((entry) => {
                const idx = globalIdx++;
                const isChecked = checked.has(idx);
                return (
                  <li
                    key={idx}
                    onClick={() => toggle(idx)}
                    className="flex items-start gap-3 py-2 px-2 -mx-2 rounded-lg hover:bg-neutral-800/50 cursor-pointer select-none transition-colors"
                  >
                    <span
                      className={`w-4 h-4 mt-0.5 rounded border flex-shrink-0 flex items-center justify-center text-[10px] transition-colors ${
                        isChecked
                          ? "bg-amber-500 border-amber-500 text-black"
                          : "border-neutral-600"
                      }`}
                    >
                      {isChecked && "\u2713"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span
                        className={`text-xs font-semibold block transition-colors ${
                          isChecked
                            ? "text-neutral-600 line-through"
                            : "text-neutral-100"
                        }`}
                      >
                        {entry.name}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        {entry.qty && (
                          <span className={`text-[10px] ${isChecked ? "text-neutral-700" : "text-neutral-500"}`}>
                            {entry.qty}
                          </span>
                        )}
                        <span className="text-[10px] bg-neutral-800 text-neutral-600 px-1.5 py-0 rounded">
                          {entry.meal}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Completion state */}
      {allDone ? (
        <div className="px-5 py-6 border-t border-amber-500/30 bg-amber-500/5 text-center">
          <p className="text-amber-400 font-black text-sm">Done. You just solved your week.</p>
          <p className="text-neutral-500 text-xs mt-1">3 meals, 7 days, zero decisions left.</p>
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
