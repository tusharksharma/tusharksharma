import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { liveRecipes } from "../data/recipes";
import { normalizeEffortTags, normalizeSplitAxes } from "../data/taxonomy";
import cardImage from "../utils/cardImage";
import useMeta from "../hooks/useMeta";

// Chip order is by how many recipes carry the value across the whole library,
// computed once at module scope so the order never shuffles while a shopper is
// filtering. Sections collapse after COLLAPSE_AFTER, so this ordering decides
// which chips are visible before "+N more" — alphabetical put the three rarest
// effort tags (fridge-shortcut: 1, chain-from: 2, 15-min: 2) in the visible set
// and buried the four commonest.
function byFrequency(values) {
  const counts = {};
  for (const v of values) counts[v] = (counts[v] || 0) + 1;
  return Object.keys(counts).sort((a, b) => counts[b] - counts[a] || a.localeCompare(b));
}

const PROTEIN_OPTIONS = byFrequency(liveRecipes.flatMap((r) => r.meta?.proteinTags || []));
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

// Effort / split filters render only the tags a shopper actually filters by.
// meta.effortTags and meta.splitAxes are richer internal taxonomies that show
// up in the recipe card body — we intentionally do NOT surface every internal
// tag as a chip (mobile page height blew past 18k px with the ungated set).
// The canonical sets, synonym aliases, and deliberately-unfiltered values all
// live in src/data/taxonomy.js; edit there, not here.
//
// Normalizing at read time is what makes the chips honest: a recipe authored
// with splitAxis "spice" matches the Heat chip, and "one-pan" matches One-pot.
const EFFORT_OPTIONS = byFrequency(liveRecipes.flatMap((r) => normalizeEffortTags(r.meta?.effortTags)));
const SPLIT_OPTIONS = byFrequency(liveRecipes.flatMap((r) => normalizeSplitAxes(r.meta?.splitAxes)));

const COST_OPTIONS = ["budget", "moderate", "premium"];

// Diet filter is a dietary-constraint surface, not a marketing surface.
// Marketing / use-case tags (high-protein, family-dinner, kid-approved,
// busy-parent, split-plate, batch-cook, etc.) that historically leaked into
// meta.dietTags do NOT render as Diet chips. Add a value here to expose it.
const CANONICAL_DIET_TAGS = new Set([
  "halal", "kosher",
  "gluten-free", "gluten-free-option",
  "dairy-free", "dairy-free-option",
  "egg-free", "egg-free-option", "egg-free-kid-version",
  "soy-free", "soy-free-option",
  "nut-free",
  "pork-free",
  "low-carb", "keto", "keto-option",
  "paleo", "whole30", "mediterranean",
  "vegetarian", "vegan",
]);
const DIET_OPTIONS = byFrequency(
  liveRecipes.flatMap((r) => (r.meta?.dietTags || []).filter((t) => CANONICAL_DIET_TAGS.has(t)))
);

// Allergen filter — Big-8 + realistic dairy substrates. Non-allergen tags
// (packaged-labels-vary, verify-*) that leaked into meta.allergens are
// intentionally not surfaced. They belong in meta.warnings.
const CANONICAL_ALLERGENS = new Set([
  "dairy", "eggs", "fish", "shellfish", "tree-nuts", "peanuts", "wheat", "gluten",
  "soy", "sesame", "mustard",
]);
const ALLERGEN_OPTIONS = [...new Set(liveRecipes.flatMap((r) => r.meta?.allergens || []))]
  .filter((t) => CANONICAL_ALLERGENS.has(t))
  .sort();

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

function getTotalMinutes(r) {
  if (typeof r?.meta?.totalMinutes === "number") return r.meta.totalMinutes;
  const raw = r?.time || "";
  if (!raw) return 999;
  const stripped = raw.replace(/\([^)]*\)/g, " ");
  const withHours = stripped.replace(/(\d+)\s*(hr|hour)s?/gi, (_, n) => `${parseInt(n, 10) * 60}`);
  const nums = withHours.match(/\d+/g);
  if (!nums) return 999;
  return nums.reduce((sum, n) => sum + parseInt(n, 10), 0);
}

function parseCost(costStr) {
  if (!costStr) return Infinity;
  const match = costStr.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : Infinity;
}

const SORT_OPTIONS = [
  { key: "newest", label: "Newest", compare: (a, b) => (b.id || 0) - (a.id || 0) },
  { key: "protein", label: "Highest protein", compare: (a, b) => (b.protein || 0) - (a.protein || 0) },
  { key: "fastest", label: "Fastest", compare: (a, b) => getTotalMinutes(a) - getTotalMinutes(b) },
  { key: "cost", label: "Lowest cost", compare: (a, b) => parseCost(a.meta?.costPerServing) - parseCost(b.meta?.costPerServing) },
];

// Protein per 100 calories — higher = leaner. >= 8 is excellent, 5-8 is solid, < 5 is fat-heavy.
function proteinPer100Cal(r) {
  if (!r.calories || !r.protein) return null;
  return Math.round((r.protein / r.calories) * 100 * 10) / 10;
}

function netCarbColor(nc) {
  if (nc == null) return "bg-surface2 text-muted";
  if (nc < 10) return "bg-emerald-500/15 text-emerald-300";
  if (nc <= 20) return "bg-brand/15 text-brand";
  return "bg-rose-500/15 text-rose-300";
}

// Chips carry their live match count. Without it every chip looks equally
// useful, when in practice "weeknight" matches 26 of 47 recipes and
// "fridge-shortcut" matches 1 — and some combinations match nothing at all.
// A zero-match chip is disabled rather than hidden so the row doesn't reflow
// under the shopper's thumb as they tap.
function Chip({ label, active, count, onClick }) {
  const dead = !active && count === 0;
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      disabled={dead}
      aria-label={count == null ? label : `${label}, ${count} ${count === 1 ? "recipe" : "recipes"}`}
      className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
        dead
          ? "bg-surface/40 text-faint border-line/60 cursor-not-allowed"
          : active
            ? "bg-brand text-brandink border-brand cursor-pointer"
            : "bg-surface text-muted border-line hover:border-brand/40 hover:text-ink cursor-pointer"
      }`}
    >
      {label}
      {count != null && (
        <span aria-hidden="true" className={`ml-1.5 tabular-nums ${active ? "text-brandink/60" : "text-faint"}`}>{count}</span>
      )}
    </button>
  );
}

// Effort carries 19 values. Showing all of them made the open drawer taller
// than a phone screen, so the tail collapses behind "+N more". Anything the
// shopper has already selected stays visible regardless of position — a hidden
// active filter is worse than a long row.
// 6, not 8: across all eight sections the drawer carries 61 chips. At 8 it
// still rendered 46 of them and stood 774px tall on a 390px-wide phone —
// essentially a full screen of chips before any recipe. 6 brings it to 38 and
// keeps every visible Effort chip at 10+ matches.
const COLLAPSE_AFTER = 6;

function FilterSection({ title, items }) {
  const [expanded, setExpanded] = useState(false);
  const collapsible = items.length > COLLAPSE_AFTER;
  const visible = !collapsible || expanded
    ? items
    : [...items.slice(0, COLLAPSE_AFTER), ...items.slice(COLLAPSE_AFTER).filter((i) => i.active)];
  const hiddenCount = items.length - visible.length;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-muted text-xs font-medium min-w-[70px]">{title}</span>
      {visible.map((item) => (
        <Chip key={item.key} label={item.label} active={item.active} count={item.count} onClick={item.onClick} />
      ))}
      {hiddenCount > 0 && (
        <button onClick={() => setExpanded(true)} className="text-brand text-xs font-medium hover:underline cursor-pointer">
          +{hiddenCount} more
        </button>
      )}
      {collapsible && expanded && (
        <button onClick={() => setExpanded(false)} className="text-muted text-xs font-medium hover:underline cursor-pointer">
          show less
        </button>
      )}
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
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortKey, setSortKey] = useState("newest");

  const activeCount =
    (selectedProteins.length) +
    (selectedTime ? 1 : 0) +
    (selectedNetCarbs ? 1 : 0) +
    (selectedEffort.length) +
    (selectedSplit.length) +
    (selectedCost.length) +
    (selectedDiet.length) +
    (excludeAllergens.length);
  const hasActiveFilters = !!search || activeCount > 0;

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

  // Each active filter becomes a named predicate so a facet's own selection can
  // be excluded when counting it. Without that, selecting "beef" would make
  // every other protein chip read 0 even though tapping one would widen the
  // (OR-semantics) result set rather than empty it.
  const predicates = useMemo(() => {
    const q = search.toLowerCase();
    return {
      search: search ? (r) => buildSearchText(r).includes(q) : null,
      protein: selectedProteins.length
        ? (r) => selectedProteins.some((p) => (r.meta?.proteinTags || []).includes(p))
        : null,
      time: selectedTime
        ? (selectedTime.max === Infinity
            ? (r) => getTotalMinutes(r) >= 30
            : (r) => getTotalMinutes(r) <= selectedTime.max)
        : null,
      netCarbs: selectedNetCarbs
        ? (r) => {
            const nc = r.meta?.macros?.netCarbs;
            return nc != null && nc <= selectedNetCarbs.max;
          }
        : null,
      effort: selectedEffort.length
        ? (r) => {
            const tags = normalizeEffortTags(r.meta?.effortTags);
            return selectedEffort.some((e) => tags.includes(e));
          }
        : null,
      split: selectedSplit.length
        ? (r) => {
            const axes = normalizeSplitAxes(r.meta?.splitAxes);
            return selectedSplit.some((s) => axes.includes(s));
          }
        : null,
      cost: selectedCost.length ? (r) => selectedCost.includes(r.meta?.costTier) : null,
      diet: selectedDiet.length
        ? (r) => selectedDiet.every((d) => (r.meta?.dietTags || []).includes(d))
        : null,
      allergens: excludeAllergens.length
        ? (r) => !excludeAllergens.some((a) => (r.meta?.allergens || []).includes(a))
        : null,
    };
  }, [search, selectedProteins, selectedTime, selectedNetCarbs, selectedEffort, selectedSplit, selectedCost, selectedDiet, excludeAllergens]);

  // Recipes passing every active filter except `exceptKey` (pass null for all).
  const narrow = useMemo(() => {
    const entries = Object.entries(predicates);
    return (exceptKey) =>
      liveRecipes.filter((r) => entries.every(([k, fn]) => k === exceptKey || !fn || fn(r)));
  }, [predicates]);

  const filtered = useMemo(() => {
    let results = narrow(null);

    const sorter = SORT_OPTIONS.find((s) => s.key === sortKey);
    if (sorter) {
      // Copy before sort — do not mutate liveRecipes.
      results = [...results].sort(sorter.compare);
    }

    return results;
  }, [narrow, sortKey]);

  // Match counts per chip.
  //
  // OR facets (protein, effort, split, cost) and single-select ranges (time,
  // net carbs) count against everything *except* their own selection, because
  // tapping another value there widens or replaces rather than narrows.
  //
  // Diet is AND semantics and Exclude only ever removes recipes, so both count
  // against the fully-filtered set — the honest question there is "how many of
  // my current results survive if I add this".
  const facetCounts = useMemo(() => {
    const tally = (pool, valuesOf) => {
      const out = {};
      for (const r of pool) for (const v of valuesOf(r)) out[v] = (out[v] || 0) + 1;
      return out;
    };
    const current = narrow(null);
    return {
      protein: tally(narrow("protein"), (r) => r.meta?.proteinTags || []),
      effort: tally(narrow("effort"), (r) => normalizeEffortTags(r.meta?.effortTags)),
      split: tally(narrow("split"), (r) => normalizeSplitAxes(r.meta?.splitAxes)),
      cost: tally(narrow("cost"), (r) => (r.meta?.costTier ? [r.meta.costTier] : [])),
      time: Object.fromEntries(
        TIME_OPTIONS.map((t) => [
          t.label,
          narrow("time").filter((r) => (t.max === Infinity ? getTotalMinutes(r) >= 30 : getTotalMinutes(r) <= t.max)).length,
        ])
      ),
      netCarbs: Object.fromEntries(
        NET_CARB_OPTIONS.map((n) => [
          n.label,
          narrow("netCarbs").filter((r) => {
            const nc = r.meta?.macros?.netCarbs;
            return nc != null && nc <= n.max;
          }).length,
        ])
      ),
      diet: tally(current, (r) => (r.meta?.dietTags || []).filter((t) => CANONICAL_DIET_TAGS.has(t))),
      allergens: Object.fromEntries(
        ALLERGEN_OPTIONS.map((a) => [a, current.filter((r) => !(r.meta?.allergens || []).includes(a)).length])
      ),
    };
  }, [narrow]);

  return (
    <div className="min-h-screen bg-page text-ink">
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-ink">Dinners</h1>
          <p className="text-muted text-sm mt-1">
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
            className="w-full bg-surface border border-line rounded-lg px-4 py-2.5 text-sm text-ink placeholder-faint focus:outline-none focus:border-brand/60 transition-colors"
          />
        </div>

        {/* Filter toggle — chips live behind a drawer so cards stay above the fold */}
        <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface border border-line text-ink text-sm font-medium hover:border-brand/40 transition-colors cursor-pointer"
            aria-expanded={filtersOpen}
            aria-controls="dinners-filter-drawer"
          >
            <span>Filters</span>
            {activeCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-brand text-brandink text-[10px] font-bold">{activeCount}</span>
            )}
            <span className={`text-muted transition-transform ${filtersOpen ? "rotate-180" : ""}`} aria-hidden="true">▾</span>
          </button>
          <label className="flex items-center gap-2 text-xs text-muted">
            <span>Sort</span>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              className="bg-surface border border-line rounded-lg px-3 py-1.5 text-ink text-xs font-medium hover:border-brand/40 focus:outline-none focus:border-brand/60 transition-colors cursor-pointer"
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          </label>
          {hasActiveFilters && (
            <button onClick={clearAll} className="text-brand text-xs font-medium hover:underline cursor-pointer">
              Clear all
            </button>
          )}
        </div>

        {/* Filters. Height is capped on phones so the drawer can never push
            results a full screen down. Eight sections of chips is ~700px even
            collapsed, and it grows every time a recipe introduces a new tag —
            a scroll cap holds the hierarchy no matter how the taxonomy grows.
            Desktop has the room, so the cap lifts at sm. */}
        {filtersOpen && (
        <div
          id="dinners-filter-drawer"
          className="mb-4 space-y-2 bg-surface/40 border border-line rounded-xl p-4 max-h-[55vh] overflow-y-auto overscroll-contain sm:max-h-none sm:overflow-visible"
        >
          <FilterSection
            title="Protein"
            items={PROTEIN_OPTIONS.map((p) => ({
              key: p, label: p, count: facetCounts.protein[p] || 0,
              active: selectedProteins.includes(p),
              onClick: () => toggleInArray(selectedProteins, setSelectedProteins, p),
            }))}
          />

          <FilterSection
            title="Max time"
            items={TIME_OPTIONS.map((t) => ({
              key: t.label, label: t.label, count: facetCounts.time[t.label] || 0,
              active: selectedTime?.label === t.label,
              onClick: () => setSelectedTime(selectedTime?.label === t.label ? null : t),
            }))}
          />

          <FilterSection
            title="Net carbs"
            items={NET_CARB_OPTIONS.map((n) => ({
              key: n.label, label: n.label, count: facetCounts.netCarbs[n.label] || 0,
              active: selectedNetCarbs?.label === n.label,
              onClick: () => setSelectedNetCarbs(selectedNetCarbs?.label === n.label ? null : n),
            }))}
          />

          <FilterSection
            title="Effort"
            items={EFFORT_OPTIONS.map((e) => ({
              key: e, label: e, count: facetCounts.effort[e] || 0,
              active: selectedEffort.includes(e),
              onClick: () => toggleInArray(selectedEffort, setSelectedEffort, e),
            }))}
          />

          <FilterSection
            title="Split type"
            items={SPLIT_OPTIONS.map((s) => ({
              key: s, label: s, count: facetCounts.split[s] || 0,
              active: selectedSplit.includes(s),
              onClick: () => toggleInArray(selectedSplit, setSelectedSplit, s),
            }))}
          />

          <FilterSection
            title="Cost"
            items={COST_OPTIONS.map((c) => ({
              key: c, label: c, count: facetCounts.cost[c] || 0,
              active: selectedCost.includes(c),
              onClick: () => toggleInArray(selectedCost, setSelectedCost, c),
            }))}
          />

          <FilterSection
            title="Diet"
            items={DIET_OPTIONS.map((d) => ({
              key: d, label: d, count: facetCounts.diet[d] || 0,
              active: selectedDiet.includes(d),
              onClick: () => toggleInArray(selectedDiet, setSelectedDiet, d),
            }))}
          />

          <FilterSection
            title="Exclude"
            items={ALLERGEN_OPTIONS.map((a) => ({
              key: a, label: `no ${a}`, count: facetCounts.allergens[a] || 0,
              active: excludeAllergens.includes(a),
              onClick: () => toggleInArray(excludeAllergens, setExcludeAllergens, a),
            }))}
          />
        </div>
        )}

        {/* Result count */}
        <div className="mb-6">
          <span className="text-muted text-xs">
            {filtered.length} {filtered.length === 1 ? "recipe" : "recipes"}
            {hasActiveFilters ? " matching filters" : ""}
          </span>
        </div>

        {/* Recipe grid or empty state */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((r) => (
              <Link key={r.id} to={`/recipes/${r.slug}`} className="bg-surface border border-line rounded-xl overflow-hidden hover:border-brand/40 transition-all group block">
                {r.image && (
                  <img {...cardImage(r.image)} alt={r.title} width="640" height="400" className="w-full h-40 object-cover" loading="lazy" />
                )}
                <div className="p-5">
                  <h3 className="text-ink font-bold text-sm group-hover:text-brand transition-colors">{r.title}</h3>
                  <p className="text-muted text-xs mt-1 line-clamp-1 sm:line-clamp-2">{r.makeThisWhen || r.role}</p>
                  {/* First row is the leanness read — protein, calories, and
                      whether the macros are estimated. Time gets its own row
                      below so five fragments don't compete in one strip. */}
                  <div className="flex items-center gap-2 mt-2 text-[11px] text-muted">
                    <span className="text-brand font-black text-xs">{r.meta?.macros?.estimated ? "~" : ""}{r.protein}g protein</span>
                    <span className="text-faint">&middot;</span>
                    <span>{r.meta?.macros?.estimated ? "~" : ""}{r.calories} cal</span>
                    {r.meta?.macros && (
                      r.meta.macros.estimated ? (
                        <span className="ml-auto px-1.5 py-0.5 rounded bg-brand/20 text-brand text-[9px] font-bold uppercase tracking-wider" title="Macros are an estimate — calculated, not measured per-ingredient">~ EST</span>
                      ) : (
                        <span className="ml-auto px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold uppercase tracking-wider" title="Macros are verified per-ingredient">✓ VERIFIED</span>
                      )
                    )}
                  </div>
                  <p className="mt-1 text-[11px] text-muted">{r.time}</p>
                  {/* Net carbs is colour-coded and dietary, so it stays on phones.
                      P/100cal and cost-per-serving are power-user metrics that made
                      the mobile card a flat wall of same-weight badges — they show
                      from sm up, and are one tap away on the recipe page regardless. */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2 text-[10px]">
                    {proteinPer100Cal(r) != null && (
                      <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-semibold" title="Protein per 100 calories — higher is leaner">
                        {proteinPer100Cal(r)}g P/100cal
                      </span>
                    )}
                    {r.meta?.macros?.netCarbs != null && (
                      <span className={`px-1.5 py-0.5 rounded font-semibold ${netCarbColor(r.meta.macros.netCarbs)}`}>
                        {r.meta.macros.netCarbs}g net carbs
                      </span>
                    )}
                    {r.meta?.costPerServing && (
                      <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-surface2 text-muted font-semibold">{r.meta.costPerServing}/serving</span>
                    )}
                  </div>
                  {(r.splitCook?.adult?.label || r.splitCook?.kid?.label) && (
                    <div className="grid grid-cols-2 gap-1.5 mt-2">
                      {r.splitCook?.adult?.label && (
                        <div className="bg-red-950/30 border border-red-900/40 rounded px-2 py-1.5">
                          <span className="text-red-400 text-[9px] font-bold uppercase tracking-wider">Adult</span>
                          <p className="text-muted text-[10px] mt-0.5 line-clamp-2 leading-tight">{r.splitCook.adult.label.replace(/^Adult\s*[—-]\s*/i, "")}</p>
                        </div>
                      )}
                      {r.splitCook?.kid?.label && (
                        <div className="bg-green-950/30 border border-green-900/40 rounded px-2 py-1.5">
                          <span className="text-green-400 text-[9px] font-bold uppercase tracking-wider">Kid</span>
                          <p className="text-muted text-[10px] mt-0.5 line-clamp-2 leading-tight">{r.splitCook.kid.label.replace(/^Kid(\s*Path)?\s*[—-]\s*/i, "")}</p>
                        </div>
                      )}
                    </div>
                  )}
                  {/* Normalized, so a card never advertises "spice split" while the
                      filter chip for the same recipe reads "heat". Hidden on phones:
                      the Adult/Kid boxes directly above already say what the split is,
                      and this row was the fourth near-identical band on the card. */}
                  {r.meta && (
                    <div className="hidden sm:flex flex-wrap gap-1 mt-2">
                      {normalizeSplitAxes(r.meta.splitAxes).slice(0, 2).map((s) => (
                        <span key={s} className="text-[9px] px-1.5 py-0.5 rounded bg-brand/10 text-brand/80">{s} split</span>
                      ))}
                      {normalizeEffortTags(r.meta.effortTags).slice(0, 1).map((t) => (
                        <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-surface2 text-muted">{t}</span>
                      ))}
                      {(r.meta.warnings || []).some((w) => (typeof w === "string" ? w : `${w?.label ?? ""} ${w?.detail ?? ""}`).toLowerCase().includes("spicy")) && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400/70">spicy (adult)</span>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-surface/30 border border-line rounded-xl">
            <p className="text-muted text-sm font-medium">No recipes match your filters.</p>
            <p className="text-muted text-xs mt-1">Try adjusting your search or clearing some filters.</p>
            <button onClick={clearAll} className="mt-4 text-brand text-sm font-bold hover:underline cursor-pointer">
              Clear all filters
            </button>
          </div>
        )}

        <div className="mt-12 text-center bg-surface/30 border border-line rounded-xl py-5 px-4">
          <p className="text-muted text-xs">Want the full weekly system?</p>
          <Link to="/" className="text-brand text-sm font-bold hover:underline mt-1 inline-block">
            Go to This Week &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
