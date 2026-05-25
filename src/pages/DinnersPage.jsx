import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { liveRecipes } from "../data/recipes";
import useMeta from "../hooks/useMeta";

const PROTEIN_OPTIONS = [...new Set(liveRecipes.flatMap((r) => r.meta?.proteinTags || []))].sort();
const TIME_OPTIONS = [
  { label: "15 min", max: 15 },
  { label: "25 min", max: 25 },
  { label: "30+ min", max: Infinity },
];
const NET_CARB_OPTIONS = [
  { label: "≤15g net carbs", max: 15 },
  { label: "≤30g net carbs", max: 30 },
  { label: "≤45g net carbs", max: 45 },
];
const EFFORT_OPTIONS = [...new Set(liveRecipes.flatMap((r) => r.meta?.effortTags || []))].sort();
const SPLIT_OPTIONS = [...new Set(liveRecipes.flatMap((r) => r.meta?.splitAxes || []))].sort();
const COST_OPTIONS = ["budget", "moderate", "premium"];
const DIET_OPTIONS = [...new Set(liveRecipes.flatMap((r) => r.meta?.dietTags || []))].sort();
const ALLERGEN_OPTIONS = [...new Set(liveRecipes.flatMap((r) => r.meta?.allergens || []))].sort();

// Build searchable text per recipe once
function buildSearchText(r) {
  return [
    r.title,
    (r.tags || []).join(" "),
    (r.meta?.substitutionNotes || []).join(" "),
    (r.meta?.proteinTags || []).join(" "),
    (r.meta?.splitAxes || []).join(" "),
    (r.meta?.dietTags || []).join(" "),
    r.makeThisWhen,
    r.description,
    // Search ingredient names
    ...(r.ingredients || []).map((i) => typeof i === "object" ? i.text : i),
  ].filter(Boolean).join(" ").toLowerCase();
}

function parseTime(timeStr) {
  if (!timeStr) return 999;
  const match = timeStr.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 999;
}

// Protein per 100 calories — higher = leaner. >= 8 is excellent, 5-8 is solid, < 5 is fat-heavy.
function proteinPer100Cal(r) {
  if (!r.calories || !r.protein) return null;
  return Math.round((r.protein / r.calories) * 100 * 10) / 10;
}

function netCarbColor(nc) {
  if (nc == null) return "bg-neutral-800 text-neutral-500";
  if (nc < 10) return "bg-emerald-500/15 text-emerald-300";
  if (nc <= 20) return "bg-amber-500/15 text-amber-300";
  return "bg-rose-500/15 text-rose-300";
}

function Chip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${
        active
          ? "bg-amber-500 text-neutral-950 border-amber-500"
          : "bg-neutral-900 text-neutral-400 border-neutral-700 hover:border-amber-500/40 hover:text-neutral-200"
      }`}
    >
      {label}
    </button>
  );
}

function FilterSection({ title, children }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-neutral-500 text-xs font-medium min-w-[70px]">{title}</span>
      {children}
    </div>
  );
}

export default function DinnersPage() {
  useMeta({ title: "Dinners", description: "High-protein family dinners with the Split Cook Method. Same cook, different plates for adults and kids." });

  const [search, setSearch] = useState("");
  const [selectedProteins, setSelectedProteins] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedNetCarbs, setSelectedNetCarbs] = useState(null);
  const [selectedEffort, setSelectedEffort] = useState([]);
  const [selectedSplit, setSelectedSplit] = useState([]);
  const [selectedCost, setSelectedCost] = useState([]);
  const [selectedDiet, setSelectedDiet] = useState([]);
  const [excludeAllergens, setExcludeAllergens] = useState([]);

  const hasActiveFilters = search || selectedProteins.length || selectedTime || selectedNetCarbs || selectedEffort.length || selectedSplit.length || selectedCost.length || selectedDiet.length || excludeAllergens.length;

  function toggleInArray(arr, setArr, value) {
    setArr(arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);
  }

  function clearAll() {
    setSearch("");
    setSelectedProteins([]);
    setSelectedTime(null);
    setSelectedNetCarbs(null);
    setSelectedEffort([]);
    setSelectedSplit([]);
    setSelectedCost([]);
    setSelectedDiet([]);
    setExcludeAllergens([]);
  }

  const filtered = useMemo(() => {
    let results = liveRecipes;

    if (search) {
      const q = search.toLowerCase();
      results = results.filter((r) => buildSearchText(r).includes(q));
    }

    if (selectedProteins.length) {
      results = results.filter((r) =>
        selectedProteins.some((p) => (r.meta?.proteinTags || []).includes(p))
      );
    }

    if (selectedTime) {
      if (selectedTime.max === Infinity) {
        results = results.filter((r) => parseTime(r.time) >= 30);
      } else {
        results = results.filter((r) => parseTime(r.time) <= selectedTime.max);
      }
    }

    if (selectedNetCarbs) {
      results = results.filter((r) => {
        const nc = r.meta?.macros?.netCarbs;
        return nc != null && nc <= selectedNetCarbs.max;
      });
    }

    if (selectedEffort.length) {
      results = results.filter((r) =>
        selectedEffort.some((e) => (r.meta?.effortTags || []).includes(e))
      );
    }

    if (selectedSplit.length) {
      results = results.filter((r) =>
        selectedSplit.some((s) => (r.meta?.splitAxes || []).includes(s))
      );
    }

    if (selectedCost.length) {
      results = results.filter((r) => selectedCost.includes(r.meta?.costTier));
    }

    if (selectedDiet.length) {
      results = results.filter((r) =>
        selectedDiet.every((d) => (r.meta?.dietTags || []).includes(d))
      );
    }

    if (excludeAllergens.length) {
      results = results.filter((r) =>
        !excludeAllergens.some((a) => (r.meta?.allergens || []).includes(a))
      );
    }

    return results;
  }, [search, selectedProteins, selectedTime, selectedNetCarbs, selectedEffort, selectedSplit, selectedCost, selectedDiet, excludeAllergens]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white">Dinners</h1>
          <p className="text-neutral-400 text-sm mt-1">
            One cook, two plates — adults and kids from the same workflow. Filter by time, protein, cost, or dietary needs.
          </p>
        </div>

        {/* Search bar */}
        <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search recipes, proteins, tags..."
            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500/60 transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="mb-4 space-y-2 bg-neutral-900/40 border border-neutral-800 rounded-xl p-4">
          <FilterSection title="Protein">
            {PROTEIN_OPTIONS.map((p) => (
              <Chip key={p} label={p} active={selectedProteins.includes(p)} onClick={() => toggleInArray(selectedProteins, setSelectedProteins, p)} />
            ))}
          </FilterSection>

          <FilterSection title="Max time">
            {TIME_OPTIONS.map((t) => (
              <Chip key={t.label} label={t.label} active={selectedTime?.label === t.label} onClick={() => setSelectedTime(selectedTime?.label === t.label ? null : t)} />
            ))}
          </FilterSection>

          <FilterSection title="Net carbs">
            {NET_CARB_OPTIONS.map((n) => (
              <Chip key={n.label} label={n.label} active={selectedNetCarbs?.label === n.label} onClick={() => setSelectedNetCarbs(selectedNetCarbs?.label === n.label ? null : n)} />
            ))}
          </FilterSection>

          <FilterSection title="Effort">
            {EFFORT_OPTIONS.map((e) => (
              <Chip key={e} label={e} active={selectedEffort.includes(e)} onClick={() => toggleInArray(selectedEffort, setSelectedEffort, e)} />
            ))}
          </FilterSection>

          <FilterSection title="Split type">
            {SPLIT_OPTIONS.map((s) => (
              <Chip key={s} label={s} active={selectedSplit.includes(s)} onClick={() => toggleInArray(selectedSplit, setSelectedSplit, s)} />
            ))}
          </FilterSection>

          <FilterSection title="Cost">
            {COST_OPTIONS.map((c) => (
              <Chip key={c} label={c} active={selectedCost.includes(c)} onClick={() => toggleInArray(selectedCost, setSelectedCost, c)} />
            ))}
          </FilterSection>

          <FilterSection title="Diet">
            {DIET_OPTIONS.map((d) => (
              <Chip key={d} label={d} active={selectedDiet.includes(d)} onClick={() => toggleInArray(selectedDiet, setSelectedDiet, d)} />
            ))}
          </FilterSection>

          <FilterSection title="Exclude">
            {ALLERGEN_OPTIONS.map((a) => (
              <Chip key={a} label={`no ${a}`} active={excludeAllergens.includes(a)} onClick={() => toggleInArray(excludeAllergens, setExcludeAllergens, a)} />
            ))}
          </FilterSection>
        </div>

        {/* Active filters + result count */}
        <div className="mb-6 flex items-center justify-between">
          <span className="text-neutral-500 text-xs">
            {filtered.length} {filtered.length === 1 ? "recipe" : "recipes"}
            {hasActiveFilters ? " matching filters" : ""}
          </span>
          {hasActiveFilters && (
            <button onClick={clearAll} className="text-amber-400 text-xs font-medium hover:underline cursor-pointer">
              Clear all filters
            </button>
          )}
        </div>

        {/* Recipe grid or empty state */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((r) => (
              <Link key={r.id} to={`/recipes/${r.slug}`} className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-amber-500/40 transition-all group block">
                {r.image && (
                  <img src={r.image} alt={r.title} className="w-full h-40 object-cover" loading="lazy" />
                )}
                <div className="p-5">
                  <h3 className="text-white font-bold text-sm group-hover:text-amber-400 transition-colors">{r.title}</h3>
                  <p className="text-neutral-500 text-xs mt-1 line-clamp-2">{r.makeThisWhen || r.role}</p>
                  <div className="flex items-center gap-2 mt-2 text-[10px] text-neutral-600">
                    <span className="text-amber-400 font-bold">{r.meta?.macros?.estimated ? "~" : ""}{r.protein}g protein</span>
                    <span>&middot;</span>
                    <span>{r.meta?.macros?.estimated ? "~" : ""}{r.calories} cal</span>
                    <span>&middot;</span>
                    <span>{r.time}</span>
                    {r.meta?.macros && (
                      r.meta.macros.estimated ? (
                        <span className="ml-auto px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold uppercase tracking-wider" title="Macros are an estimate — calculated, not measured per-ingredient">~ EST</span>
                      ) : (
                        <span className="ml-auto px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold uppercase tracking-wider" title="Macros are verified per-ingredient">✓ VERIFIED</span>
                      )
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 mt-2 text-[10px]">
                    {proteinPer100Cal(r) != null && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-semibold" title="Protein per 100 calories — higher is leaner">
                        {proteinPer100Cal(r)}g P/100cal
                      </span>
                    )}
                    {r.meta?.macros?.netCarbs != null && (
                      <span className={`px-1.5 py-0.5 rounded font-semibold ${netCarbColor(r.meta.macros.netCarbs)}`}>
                        {r.meta.macros.netCarbs}g net carbs
                      </span>
                    )}
                    {r.meta?.costPerServing && (
                      <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 font-semibold">{r.meta.costPerServing}/serving</span>
                    )}
                  </div>
                  {(r.splitCook?.adult?.label || r.splitCook?.kid?.label) && (
                    <div className="grid grid-cols-2 gap-1.5 mt-2">
                      {r.splitCook?.adult?.label && (
                        <div className="bg-red-950/30 border border-red-900/40 rounded px-2 py-1.5">
                          <span className="text-red-400 text-[9px] font-bold uppercase tracking-wider">Adult</span>
                          <p className="text-neutral-300 text-[10px] mt-0.5 line-clamp-2 leading-tight">{r.splitCook.adult.label.replace(/^Adult\s*[—-]\s*/i, "")}</p>
                        </div>
                      )}
                      {r.splitCook?.kid?.label && (
                        <div className="bg-green-950/30 border border-green-900/40 rounded px-2 py-1.5">
                          <span className="text-green-400 text-[9px] font-bold uppercase tracking-wider">Kid</span>
                          <p className="text-neutral-300 text-[10px] mt-0.5 line-clamp-2 leading-tight">{r.splitCook.kid.label.replace(/^Kid(\s*Path)?\s*[—-]\s*/i, "")}</p>
                        </div>
                      )}
                    </div>
                  )}
                  {r.meta && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(r.meta.splitAxes || []).slice(0, 2).map((s) => (
                        <span key={s} className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400/80">{s} split</span>
                      ))}
                      {(r.meta.effortTags || []).slice(0, 1).map((t) => (
                        <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400">{t}</span>
                      ))}
                      {(r.meta.warnings || []).filter((w) => w.includes("spicy")).length > 0 && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400/70">spicy (adult)</span>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-neutral-900/30 border border-neutral-800 rounded-xl">
            <p className="text-neutral-400 text-sm font-medium">No recipes match your filters.</p>
            <p className="text-neutral-500 text-xs mt-1">Try adjusting your search or clearing some filters.</p>
            <button onClick={clearAll} className="mt-4 text-amber-400 text-sm font-bold hover:underline cursor-pointer">
              Clear all filters
            </button>
          </div>
        )}

        <div className="mt-12 text-center bg-neutral-900/30 border border-neutral-800 rounded-xl py-5 px-4">
          <p className="text-neutral-500 text-xs">Want the full weekly system?</p>
          <Link to="/" className="text-amber-400 text-sm font-bold hover:underline mt-1 inline-block">
            Go to This Week &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
