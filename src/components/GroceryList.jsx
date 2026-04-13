import { useState, useCallback } from "react";

const GROCERY = {
  "Protein": [
    { item: "Ground beef or sirloin (1.25 lb)", meal: "Beef & Broccoli" },
    { item: "Chicken thighs or Del Real shredded chicken (1.25 lb)", meal: "Gnocchi" },
    { item: "Tri-tip steak (1.25 lb)", meal: "Penne" },
    { item: "Earth's Best mini meatballs", meal: "Kid protein swap" },
  ],
  "Carbs": [
    { item: "Rice, 2 cups dry", meal: "Beef & Broccoli" },
    { item: "Shelf-stable gnocchi (16 oz)", meal: "Gnocchi" },
    { item: "Penne pasta (8 oz)", meal: "Penne" },
  ],
  "Vegetables": [
    { item: "Broccoli, 3-4 cups fresh or frozen", meal: "Beef & Broccoli" },
    { item: "Bell peppers (2-3)", meal: "Gnocchi" },
    { item: "Onion, 1 large", meal: "All meals" },
    { item: "Spinach, 2 cups", meal: "Penne" },
    { item: "Garlic, 1 head", meal: "All meals" },
  ],
  "Sauce & Flavor": [
    { item: "Soy sauce or tamari", meal: "Beef & Broccoli" },
    { item: "Roli Roti bone broth", meal: "Rice + Penne sauce" },
    { item: "Dan-O's Outlaw seasoning", meal: "Gnocchi + Penne" },
    { item: "Chili oil or sriracha", meal: "All meals" },
    { item: "Sesame oil", meal: "Beef & Broccoli" },
    { item: "Lime (1)", meal: "Gnocchi + Penne" },
  ],
  "Creamy / Protein Base": [
    { item: "Cottage cheese (1.5 cups)", meal: "Gnocchi + Penne sauce" },
    { item: "Fairlife fat-free milk", meal: "Sauce base" },
  ],
  "Kid Mode": [
    { item: "Rao's Alfredo sauce", meal: "Gnocchi kid option" },
    { item: "Shredded mild cheese", meal: "Kid topping" },
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
        `${cat}:\n${items.map((i) => `  - ${i.item}`).join("\n")}`
      )
      .join("\n\n");
    navigator.clipboard.writeText(text);
  };

  const checkedCount = checked.size;
  const totalCount = allItems.length;

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
                        className={`text-xs block transition-colors ${
                          isChecked
                            ? "text-neutral-600 line-through"
                            : "text-neutral-200"
                        }`}
                      >
                        {entry.item}
                      </span>
                      <span className="text-[10px] text-neutral-600">
                        {entry.meal}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Efficiency block */}
      <div className="px-5 py-4 border-t border-neutral-800 bg-neutral-900/50">
        <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
          Why this list is efficient
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            "3 proteins \u2192 3 meals",
            "Shared veg across meals",
            "Same sauce base reused",
            "Minimal waste",
          ].map((t) => (
            <div
              key={t}
              className="bg-neutral-800/50 rounded-lg px-3 py-2 text-center"
            >
              <span className="text-[10px] text-neutral-400">{t}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Next week hook */}
      <div className="px-5 py-3 border-t border-neutral-800 text-center">
        <p className="text-neutral-600 text-xs">
          Next week drops Sunday &middot; Reuse pantry staples &middot; Swap 1 protein &middot; Repeat the system
        </p>
      </div>
    </div>
  );
}
