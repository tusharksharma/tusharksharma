import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import useMeta from "../hooks/useMeta";
import { sauces, quickLunches, desserts, breakfasts, bases, powerups, snackBoxes } from "../data/cookbook";
import cardImage from "../utils/cardImage";

const TABS = [
  ...(bases.length > 0 ? ["Bases"] : []),
  ...(sauces.length > 0 ? ["Sauces"] : []),
  ...(breakfasts.length > 0 ? ["Breakfast"] : []),
  ...(desserts.length > 0 ? ["Desserts"] : []),
  ...(quickLunches.length > 0 ? ["Quick Lunches"] : []),
  ...(powerups.length > 0 ? ["Powerups"] : []),
  ...(snackBoxes.length > 0 ? ["Snack Boxes"] : []),
];

const TAB_SLUG = {
  "Bases": "bases",
  "Sauces": "sauces",
  "Breakfast": "breakfast",
  "Desserts": "desserts",
  "Quick Lunches": "quick-lunches",
  "Powerups": "powerups",
  "Snack Boxes": "snack-boxes",
};
const SLUG_TAB = Object.fromEntries(Object.entries(TAB_SLUG).map(([k, v]) => [v, k]));

function netCarbColor(nc) {
  if (nc == null) return "bg-surface2 text-muted";
  if (nc < 10) return "bg-emerald-500/15 text-emerald-300";
  if (nc <= 20) return "bg-brand/15 text-brand";
  return "bg-rose-500/15 text-rose-300";
}

function RecipeCard({ item }) {
  // Per-serving protein: use explicit proteinPerServing, fall back to batch/servings,
  // then to single-serving items where protein IS the per-serving value.
  const pps = item.proteinPerServing != null
    ? item.proteinPerServing
    : (item.protein != null && item.servings ? Math.round((item.protein / item.servings) * 10) / 10 : item.protein);
  const ppc = pps && item.caloriesPerServing
    ? Math.round((pps / item.caloriesPerServing) * 100 * 10) / 10
    : null;
  const netCarbs = item.netCarbs ?? item.macros?.netCarbs;
  return (
    <Link to={`/cookbook/${item.id}`} className="text-left bg-surface border border-line rounded-xl overflow-hidden hover:border-brand/40 transition-all group w-full block">
      {item.heroImage && (
        <img {...cardImage(item.heroImage)} alt={item.title} width="640" height="360" className="w-full h-36 object-cover" loading="lazy" />
      )}
      <div className={item.heroImage ? "p-5 pt-3" : "p-5"}>
        <h3 className="text-ink font-bold text-sm group-hover:text-brand transition-colors">{item.title}</h3>
        <p className="text-muted text-xs mt-0.5">{item.flavorProfile}</p>
        <div className="flex items-center gap-2 mt-2 text-[10px] text-faint">
          <span className="text-brand font-bold">~{item.caloriesPerServing} cal/serving</span>
          <span>&middot;</span>
          <span>{pps}g protein/serving</span>
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
            <span key={b} className="text-[9px] bg-surface2 text-muted px-1.5 py-0.5 rounded">{b}</span>
          ))}
        </div>
      </div>
    </Link>
  );
}

export default function CookbookPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const paramTab = tabParam ? SLUG_TAB[tabParam] : null;
  const tab = paramTab && TABS.includes(paramTab) ? paramTab : (TABS[0] || "Sauces");
  const setTab = (t) => {
    const slug = TAB_SLUG[t];
    if (!slug) return;
    const next = new URLSearchParams(searchParams);
    next.set("tab", slug);
    setSearchParams(next, { replace: false });
  };
  const [cookbookSearch, setCookbookSearch] = useState("");

  useMeta({
    title: tab === (TABS[0] || "Sauces") ? "Power-Ups" : `${tab} — Power-Ups`,
    description: `${tab} — high-protein upgrades from The Split Plate. Sauces, breakfasts, desserts, and quick meals in 10 minutes or less.`,
  });

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
    <div className="min-h-screen bg-page text-ink">
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-ink">Power-Ups</h1>
          <p className="text-muted text-sm mt-1">
            Sauces, breakfasts, desserts, and quick meals — high-protein upgrades that take 10 minutes or less.
          </p>
          <p className="text-faint text-[10px] mt-1">
            Everything here is designed to complement your weekly dinners or stand alone when you need something fast.
          </p>
        </div>

        {/* Quick Fix Today */}
        {quickFix && (
        <div className="mb-8 bg-brand/5 border border-brand/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-brand text-xs font-black uppercase tracking-wider">Quick Fix Today</span>
            <span className="text-faint text-[10px]">Need food now?</span>
          </div>
          <div className="space-y-2">
              <Link to={`/cookbook/${quickFix.id}`} className="w-full text-left flex items-center justify-between bg-surface2/50 rounded-lg p-3 hover:bg-surface2 transition-colors group">
                <div>
                  <span className="text-ink text-xs font-bold group-hover:text-brand transition-colors">{quickFix.title}</span>
                  <span className="text-muted text-[10px] ml-2">{quickFix.proteinPerServing ?? (quickFix.servings ? Math.round((quickFix.protein / quickFix.servings) * 10) / 10 : quickFix.protein)}g protein/serving in {quickFix.time}</span>
                </div>
                <span className="text-brand text-[10px] font-bold">Try this &rarr;</span>
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
            className="w-full bg-surface border border-line rounded-lg px-4 py-2 text-sm text-ink placeholder-faint focus:outline-none focus:border-brand/60 transition-colors"
          />
        </div>

        {TABS.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  tab === t ? "bg-brand text-brandink" : "bg-surface2 text-muted hover:bg-line"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        {tab === "Bases" && bases.length > 0 && (
          <div>
            <p className="text-muted text-xs mb-4">
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
            <p className="text-muted text-xs mb-4">
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
            <p className="text-muted text-xs mb-4">
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
            <p className="text-muted text-xs mb-4">
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
            <p className="text-muted text-xs mb-4">
              10 min, high protein, zero prep. Freezer to plate — your "I need something NOW" fallback.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filterItems(quickLunches).map((q) => (
                <RecipeCard key={q.id} item={q} />
              ))}
            </div>
          </div>
        )}

        {tab === "Powerups" && powerups.length > 0 && (
          <div>
            <p className="text-muted text-xs mb-4">
              Hydration drinks + electrolyte fuel. Hot day, pre-workout, during a long sweat — fresh produce + LMNT math, no sugar bombs.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filterItems(powerups).map((p) => (
                <RecipeCard key={p.id} item={p} />
              ))}
            </div>
          </div>
        )}

        {tab === "Snack Boxes" && snackBoxes.length > 0 && (
          <div>
            <p className="text-muted text-xs mb-4">
              Kid-first snack boxes with familiar flavors + higher-protein swaps. Divided compartments, no sauce in the box, meal-prep-friendly for weekday snacks.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filterItems(snackBoxes).map((s) => (
                <RecipeCard key={s.id} item={s} />
              ))}
            </div>
          </div>
        )}

        {/* Cross-link to Weekly */}
        <div className="mt-12 text-center bg-surface/30 border border-line rounded-xl py-5 px-4">
          <p className="text-muted text-xs">Want the full system?</p>
          <Link to="/" className="text-brand text-sm font-bold hover:underline mt-1 inline-block">
            Go to Weekly Dinner Plan &rarr;
          </Link>
          <p className="text-faint text-[10px] mt-1">3 dinners. 1 shop. 0 decisions.</p>
        </div>
      </div>
    </div>
  );
}
