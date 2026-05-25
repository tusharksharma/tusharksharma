import { useState } from "react";
import { Link } from "react-router-dom";
import useMeta from "../hooks/useMeta";
import { sauces, quickLunches, desserts, breakfasts, bases } from "../data/cookbook";

const TABS = [
  ...(bases.length > 0 ? ["Bases"] : []),
  ...(sauces.length > 0 ? ["Sauces"] : []),
  ...(breakfasts.length > 0 ? ["Breakfast"] : []),
  ...(desserts.length > 0 ? ["Desserts"] : []),
  ...(quickLunches.length > 0 ? ["Quick Lunches"] : []),
];

function netCarbColor(nc) {
  if (nc == null) return "bg-neutral-800 text-neutral-500";
  if (nc < 10) return "bg-emerald-500/15 text-emerald-300";
  if (nc <= 20) return "bg-amber-500/15 text-amber-300";
  return "bg-rose-500/15 text-rose-300";
}

function RecipeCard({ item }) {
  const ppc = item.protein && item.caloriesPerServing
    ? Math.round((item.protein / item.caloriesPerServing) * 100 * 10) / 10
    : null;
  const netCarbs = item.netCarbs ?? item.macros?.netCarbs;
  return (
    <Link to={`/cookbook/${item.id}`} className="text-left bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-amber-500/40 transition-all group w-full block">
      {item.heroImage && (
        <img src={item.heroImage} alt={item.title} className="w-full h-36 object-cover" loading="lazy" />
      )}
      <div className={item.heroImage ? "p-5 pt-3" : "p-5"}>
        <h3 className="text-white font-bold text-sm group-hover:text-amber-400 transition-colors">{item.title}</h3>
        <p className="text-neutral-500 text-xs mt-0.5">{item.flavorProfile}</p>
        <div className="flex items-center gap-2 mt-2 text-[10px] text-neutral-600">
          <span className="text-amber-400 font-bold">~{item.caloriesPerServing} cal/serving</span>
          <span>&middot;</span>
          <span>{item.protein}g protein</span>
          <span>&middot;</span>
          <span>{item.time}</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 mt-2 text-[10px]">
          {ppc != null && (
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-semibold" title="Protein per 100 calories — higher is leaner">
              {ppc}g P/100cal
            </span>
          )}
          {netCarbs != null && (
            <span className={`px-1.5 py-0.5 rounded font-semibold ${netCarbColor(netCarbs)}`}>
              {netCarbs}g net carbs
            </span>
          )}
        </div>
        <div className="flex gap-1 mt-2 flex-wrap">
          {item.bestFor.map((b) => (
            <span key={b} className="text-[9px] bg-neutral-800 text-neutral-500 px-1.5 py-0.5 rounded">{b}</span>
          ))}
        </div>
      </div>
    </Link>
  );
}

export default function CookbookPage() {
  useMeta({ title: "Power-Ups", description: "Sauces, breakfasts, desserts, and quick meals — high-protein upgrades that take 10 minutes or less." });
  const [tab, setTab] = useState(TABS[0] || "Sauces");
  const [cookbookSearch, setCookbookSearch] = useState("");

  const filterItems = (items) => {
    if (!cookbookSearch) return items;
    const q = cookbookSearch.toLowerCase();
    return items.filter((item) => {
      const text = [item.title, item.tagline, item.flavorProfile, ...(item.bestFor || []), ...(item.ingredients || []).map((i) => typeof i === "object" ? i.text : i)].filter(Boolean).join(" ").toLowerCase();
      return text.includes(q);
    });
  };

  // Pick the best "quick fix" — prefer breakfasts/quick lunches over sauces
  const quickFix = (breakfasts.length > 0 ? breakfasts : quickLunches.length > 0 ? quickLunches : sauces)[0];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white">Power-Ups</h1>
          <p className="text-neutral-400 text-sm mt-1">
            Sauces, breakfasts, desserts, and quick meals — high-protein upgrades that take 10 minutes or less.
          </p>
          <p className="text-neutral-600 text-[10px] mt-1">
            Everything here is designed to complement your weekly dinners or stand alone when you need something fast.
          </p>
        </div>

        {/* Quick Fix Today */}
        {quickFix && (
        <div className="mb-8 bg-amber-500/5 border border-amber-500/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-amber-500 text-xs font-black uppercase tracking-wider">Quick Fix Today</span>
            <span className="text-neutral-600 text-[10px]">Need food now?</span>
          </div>
          <div className="space-y-2">
              <Link to={`/cookbook/${quickFix.id}`} className="w-full text-left flex items-center justify-between bg-neutral-800/50 rounded-lg p-3 hover:bg-neutral-800 transition-colors group">
                <div>
                  <span className="text-white text-xs font-bold group-hover:text-amber-400 transition-colors">{quickFix.title}</span>
                  <span className="text-neutral-500 text-[10px] ml-2">{quickFix.protein}g protein in {quickFix.time}</span>
                </div>
                <span className="text-amber-500 text-[10px] font-bold">Try this &rarr;</span>
              </Link>
          </div>
        </div>
        )}

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            value={cookbookSearch}
            onChange={(e) => setCookbookSearch(e.target.value)}
            placeholder="Search power-ups..."
            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500/60 transition-colors"
          />
        </div>

        {TABS.length > 1 && (
          <div className="flex gap-2 mb-8">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  tab === t ? "bg-amber-500 text-black" : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        {tab === "Bases" && bases.length > 0 && (
          <div>
            <p className="text-neutral-500 text-xs mb-4">
              The modular building blocks. Make once, stack into multiple meals — rice that becomes fried rice, fried rice that becomes a dinner with protein on top.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filterItems(bases).map((b) => (
                <RecipeCard key={b.id} item={b} />
              ))}
            </div>
          </div>
        )}

        {tab === "Sauces" && sauces.length > 0 && (
          <div>
            <p className="text-neutral-500 text-xs mb-4">
              Flavor multipliers. ~30 cal per serving. Turn boring protein into something you want to eat.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filterItems(sauces).map((s) => (
                <RecipeCard key={s.id} item={s} />
              ))}
            </div>
          </div>
        )}

        {tab === "Breakfast" && breakfasts.length > 0 && (
          <div>
            <p className="text-neutral-500 text-xs mb-4">
              ~40g protein, 10 minutes, one pan. Breakfast that earns its calories.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filterItems(breakfasts).map((b) => (
                <RecipeCard key={b.id} item={b} />
              ))}
            </div>
          </div>
        )}

        {tab === "Desserts" && desserts.length > 0 && (
          <div>
            <p className="text-neutral-500 text-xs mb-4">
              High-protein desserts that don't wreck your macros. Dessert that earns its spot.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filterItems(desserts).map((d) => (
                <RecipeCard key={d.id} item={d} />
              ))}
            </div>
          </div>
        )}

        {tab === "Quick Lunches" && quickLunches.length > 0 && (
          <div>
            <p className="text-neutral-500 text-xs mb-4">
              10 min, high protein, zero prep. Freezer to plate — your "I need something NOW" fallback.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filterItems(quickLunches).map((q) => (
                <RecipeCard key={q.id} item={q} />
              ))}
            </div>
          </div>
        )}

        {/* Cross-link to Weekly */}
        <div className="mt-12 text-center bg-neutral-900/30 border border-neutral-800 rounded-xl py-5 px-4">
          <p className="text-neutral-500 text-xs">Want the full system?</p>
          <Link to="/" className="text-amber-400 text-sm font-bold hover:underline mt-1 inline-block">
            Go to Weekly Dinner Plan &rarr;
          </Link>
          <p className="text-neutral-600 text-[10px] mt-1">3 dinners. 1 shop. 0 decisions.</p>
        </div>
      </div>
    </div>
  );
}
