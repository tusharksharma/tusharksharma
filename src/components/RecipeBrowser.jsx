import { useState, useMemo } from "react";
import recipes, { categories, pillars } from "../data/recipes";
import RecipeCard from "./RecipeCard";

export default function RecipeBrowser({ initialFilter }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activePillar, setActivePillar] = useState("All");
  const [structuredFilter, setStructuredFilter] = useState(initialFilter || null);

  const filtered = useMemo(() => {
    if (structuredFilter) {
      return recipes.filter((r) => r[structuredFilter.field] === structuredFilter.value);
    }
    const q = search.toLowerCase();
    return recipes.filter((r) => {
      const matchCat = activeCategory === "All" || r.category === activeCategory;
      const matchPillar = activePillar === "All" || r.pillar === activePillar;
      const matchSearch =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.tags.some((t) => t.includes(q)) ||
        r.ingredients.some((i) => i.toLowerCase().includes(q));
      return matchCat && matchPillar && matchSearch;
    });
  }, [search, activeCategory, activePillar, structuredFilter]);

  const clearStructured = () => setStructuredFilter(null);

  // Expose setStructuredFilter for parent
  RecipeBrowser.setFilter = setStructuredFilter;

  return (
    <section className="border-b border-neutral-800" id="recipes">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="mb-6">
          <h2 className="text-2xl font-black text-white">
            {structuredFilter ? `Filtered: ${structuredFilter.value.replace(/-/g, " ")}` : "Featured Recipes"}
          </h2>
          {structuredFilter && (
            <button onClick={clearStructured} className="text-amber-500 text-xs mt-1 cursor-pointer hover:underline">
              Clear filter
            </button>
          )}
        </div>

        <input
          type="text"
          placeholder="Search recipes, ingredients, tags..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setStructuredFilter(null); }}
          className="w-full px-4 py-3 rounded-xl border border-neutral-700 bg-neutral-900 text-white
                     placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500
                     focus:border-transparent text-base mb-4"
        />

        {!structuredFilter && (
          <>
            <div className="flex gap-2 flex-wrap mb-2">
              {["All", ...categories].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors cursor-pointer
                    ${activeCategory === cat ? "bg-amber-500 text-black" : "bg-neutral-800 text-neutral-400 border border-neutral-700 hover:bg-neutral-700 hover:text-white"}`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap mb-6">
              {["All", ...pillars].map((p) => (
                <button
                  key={p}
                  onClick={() => setActivePillar(p)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer
                    ${activePillar === p ? "bg-red-600 text-white" : "bg-neutral-900 text-neutral-500 border border-neutral-800 hover:bg-neutral-800 hover:text-neutral-300"}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-neutral-500">
            <p className="text-lg">No recipes found</p>
            <p className="mt-1 text-sm">Try a different search or filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((r) => (
              <RecipeCard key={r.id} recipe={r} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
