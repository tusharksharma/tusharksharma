import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { liveRecipes } from "../data/recipes";
import {
  buildUnifiedIndex,
  findRecipesMatching,
  groupByCategory,
} from "../lib/leftoverIndex";
import RecipeCard from "../components/RecipeCard";
import cardImage from "../utils/cardImage";
import useMeta from "../hooks/useMeta";

// Reads ?have=slug1,slug2 from the URL on first load — lets you share or bookmark
// a specific leftover combo. Selections are reflected back into the URL on change.
function readSelectedFromURL(search) {
  const params = new URLSearchParams(search);
  const have = params.get("have");
  if (!have) return [];
  return have.split(",").filter(Boolean);
}

function writeSelectedToURL(selected) {
  const params = new URLSearchParams(window.location.search);
  if (selected.length === 0) {
    params.delete("have");
  } else {
    params.set("have", selected.join(","));
  }
  const qs = params.toString();
  const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
  window.history.replaceState({}, "", url);
}

export default function LeftoversPage() {
  useMeta({
    title: "Use Up Leftover Ingredients",
    description: "Pick what's in your fridge — we'll find recipes that use it. Search by ingredient or brand across every Split Plate dinner.",
  });

  const { search } = useLocation();
  const [selected, setSelected] = useState(() => readSelectedFromURL(search));
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("AND");

  // Build indexes once
  const { brand, generic } = useMemo(() => buildUnifiedIndex(liveRecipes), []);
  const grouped = useMemo(() => groupByCategory(brand, generic), [brand, generic]);

  // Filtered chips based on search query
  const filteredGroups = useMemo(() => {
    if (!query.trim()) return grouped;
    const q = query.toLowerCase();
    return grouped
      .map((g) => ({
        ...g,
        items: g.items.filter(
          (it) =>
            it.label.toLowerCase().includes(q) ||
            (it.sublabel && it.sublabel.toLowerCase().includes(q))
        ),
      }))
      .filter((g) => g.items.length > 0);
  }, [grouped, query]);

  // Recipe results
  const results = useMemo(
    () => findRecipesMatching(selected, brand, generic, liveRecipes, mode),
    [selected, brand, generic, mode]
  );

  // Persist selection to URL
  useEffect(() => {
    writeSelectedToURL(selected);
  }, [selected]);

  function toggle(slug) {
    setSelected((curr) => (curr.includes(slug) ? curr.filter((s) => s !== slug) : [...curr, slug]));
  }

  function clearAll() {
    setSelected([]);
    setQuery("");
  }

  const selectedItems = selected
    .map((slug) => {
      const entry = brand[slug] || generic[slug];
      if (!entry) return null;
      // Brand entries: combine brand name + product name so a row of selected
      // chips like "Kirkland · Sipping Bone Broth" + "Kirkland · Half-and-Half"
      // doesn't collapse to ambiguous duplicates of just "Kirkland".
      const isBrand = !!brand[slug];
      const display = isBrand && entry.sublabel && entry.sublabel !== entry.label
        ? `${entry.label} · ${entry.sublabel}`
        : (entry.label || entry.sublabel || slug);
      return { slug, label: display };
    })
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-page">
      {/* Header */}
      <section className="border-b border-line">
        <div className="max-w-5xl mx-auto px-4 py-10 sm:py-14">
          <p className="text-brand font-black text-xs tracking-[0.2em] uppercase mb-3">
            Use Up Leftover Ingredients
          </p>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-ink leading-[1.1]">
            What's in your fridge?
          </h1>
          <p className="text-muted mt-4 text-base max-w-2xl leading-relaxed">
            Pick what you have leftover — we'll find Split Plate dinners that use it.
            Tap as many as you want. The more you pick, the tighter the match.
          </p>
        </div>
      </section>

      {/* Search + selected chips */}
      <section className="border-b border-line sticky top-[57px] z-10 bg-page/95 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter ingredients (e.g. 'cheddar', 'broth', 'iceberg')…"
              className="flex-1 bg-surface border border-line rounded-xl px-4 py-2.5 text-sm text-ink placeholder-faint focus:outline-none focus:border-brand"
            />
            {selected.length > 1 && (
              <div className="flex gap-1 bg-surface border border-line rounded-xl p-1">
                <button
                  onClick={() => setMode("AND")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    mode === "AND" ? "bg-brand text-brandink" : "text-muted hover:text-ink"
                  }`}
                >
                  ALL of these
                </button>
                <button
                  onClick={() => setMode("OR")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    mode === "OR" ? "bg-brand text-brandink" : "text-muted hover:text-ink"
                  }`}
                >
                  ANY of these
                </button>
              </div>
            )}
          </div>
          {selectedItems.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-muted text-xs font-bold uppercase tracking-wider">In fridge:</span>
              {selectedItems.map((item) => (
                <button
                  key={item.slug}
                  onClick={() => toggle(item.slug)}
                  className="bg-brand/10 border border-brand/40 text-brand px-2.5 py-1 rounded-full text-xs font-bold hover:bg-brand/20 transition-colors flex items-center gap-1.5"
                >
                  {item.label}
                  <span className="text-brand/70">×</span>
                </button>
              ))}
              <button
                onClick={clearAll}
                className="text-muted hover:text-muted text-xs underline ml-2 cursor-pointer"
              >
                clear all
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Ingredient chips (collapsed when results are showing) */}
      <section className="border-b border-line">
        <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-6">
          {filteredGroups.length === 0 ? (
            <div className="text-muted text-sm text-center py-8">
              No ingredients match "{query}". Try a different search.
            </div>
          ) : (
            filteredGroups.map((group) => (
              <div key={group.category}>
                <h2 className="text-brand text-xs font-black uppercase tracking-[0.2em] mb-3">
                  {group.category}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((item) => {
                    const isSelected = selected.includes(item.slug);
                    return (
                      <button
                        key={item.slug}
                        onClick={() => toggle(item.slug)}
                        className={`group flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer border ${
                          isSelected
                            ? "bg-brand text-brandink border-brand"
                            : "bg-surface text-muted border-line hover:border-brand/40 hover:bg-surface2"
                        }`}
                      >
                        {item.image && (
                          <img {...cardImage(item.image, { sizes: "24px" })} alt="" width="24" height="24" className="w-6 h-6 rounded object-cover bg-surface2" loading="lazy" />
                        )}
                        <span className="text-left">
                          <span className="block">{item.label}</span>
                          {item.kind === "brand" && item.sublabel && item.sublabel !== item.label && (
                            <span
                              className={`block text-[10px] font-normal leading-tight ${
                                isSelected ? "text-brandink/60" : "text-muted"
                              }`}
                            >
                              {item.sublabel}
                            </span>
                          )}
                        </span>
                        <span
                          className={`text-[10px] font-normal ${
                            isSelected ? "text-brandink/60" : "text-muted"
                          }`}
                        >
                          {item.recipeCount}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Recipe results */}
      <section>
        <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
          {selected.length === 0 ? (
            <div className="text-center py-16 px-6 bg-surface/40 border border-line rounded-2xl">
              <p className="text-brand text-xs font-black uppercase tracking-[0.2em] mb-2">
                Get Started
              </p>
              <p className="text-ink text-xl font-bold mb-2">
                Pick at least one ingredient above
              </p>
              <p className="text-muted text-sm max-w-md mx-auto leading-relaxed">
                Tap any chip — protein, veggie, sauce, brand. We'll show every Split
                Plate dinner that uses it. Pick more to tighten the match.
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-16 px-6 bg-surface/40 border border-line rounded-2xl">
              <p className="text-red-400 text-xs font-black uppercase tracking-[0.2em] mb-2">
                No matches
              </p>
              <p className="text-ink text-xl font-bold mb-2">
                Nothing uses ALL of those
              </p>
              <p className="text-muted text-sm max-w-md mx-auto leading-relaxed">
                Try removing a chip — or switch to{" "}
                <button onClick={() => setMode("OR")} className="text-brand underline cursor-pointer">
                  ANY of these
                </button>{" "}
                to see recipes that match any one of your ingredients.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-ink text-xl font-black">
                  {results.length} {results.length === 1 ? "recipe" : "recipes"} match
                </h2>
                {mode === "AND" && selected.length > 1 && (
                  <p className="text-muted text-xs">All {selected.length} ingredients used</p>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {results.map(({ recipe, matchCount }) => (
                  <div key={recipe.id} className="relative">
                    <RecipeCard recipe={recipe} />
                    {selected.length > 1 && (
                      <div className="absolute top-3 right-3 z-10 bg-brand text-brandink text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-lg shadow-lg pointer-events-none">
                        {matchCount}/{selected.length} match
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
