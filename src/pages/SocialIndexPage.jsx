import { useState } from "react";
import { Link } from "react-router-dom";
import { liveRecipes } from "../data/recipes";
import { sauces, bases, breakfasts, desserts, quickLunches, powerups, snackBoxes } from "../data/cookbook";
import cardImage from "../utils/cardImage";
import useMeta from "../hooks/useMeta";

const COOKBOOK_SECTIONS = [
  { label: "Sauces", items: sauces },
  { label: "Bases / Sides", items: bases },
  { label: "Breakfasts", items: breakfasts },
  { label: "Desserts", items: desserts },
  { label: "Quick Lunches", items: quickLunches },
  { label: "Powerups", items: powerups },
  { label: "Snack Boxes", items: snackBoxes },
];

// ⚠️ CLIENT-SIDE GATE — not cryptographically secure.
// The constant below sits in the JS bundle. Anyone who view-sources can read it.
// This is "keep out of casual navigation" protection, not real auth.
// To rotate: edit ACCESS_CODE below, redeploy. Existing unlocked sessions
// in localStorage stay unlocked until you also bump the STORAGE_KEY.
const ACCESS_CODE = "splitsmart";
const STORAGE_KEY = "tsp-social-access-v1";

export default function SocialIndexPage() {
  useMeta({ title: "Social Carousels — Index", description: "Private index of /social/{slug} carousel pages for Instagram posting." });
  const [unlocked, setUnlocked] = useState(() => (
    typeof window !== "undefined" && window.localStorage.getItem(STORAGE_KEY) === "1"
  ));
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [query, setQuery] = useState("");

  function submit(e) {
    e.preventDefault();
    if (input.trim().toLowerCase() === ACCESS_CODE.toLowerCase()) {
      window.localStorage.setItem(STORAGE_KEY, "1");
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
    }
  }

  function lock() {
    window.localStorage.removeItem(STORAGE_KEY);
    setUnlocked(false);
    setInput("");
  }

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center px-4">
        <form onSubmit={submit} className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
          <h1 className="text-white text-xl font-black">Private — access code required</h1>
          <p className="text-neutral-500 text-xs mt-2">This page lists social carousel pages for Instagram posting. Enter the access code to continue.</p>
          <input
            type="password"
            autoFocus
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(false); }}
            placeholder="Access code"
            className="w-full mt-5 bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500/60 transition-colors"
          />
          {error && <p className="text-red-400 text-xs mt-2">Wrong code. Try again.</p>}
          <button
            type="submit"
            className="w-full mt-4 px-4 py-2.5 bg-amber-500 text-black font-bold rounded-lg text-sm hover:bg-amber-400 transition-colors cursor-pointer"
          >
            Unlock
          </button>
          <p className="text-neutral-600 text-[10px] mt-4">Client-side gate only — not crypto secure. Don't share the code casually.</p>
        </form>
      </div>
    );
  }

  // Sorted: newest recipe IDs first (most recent carousels at top)
  const allDinners = [...liveRecipes].sort((a, b) => b.id - a.id);
  const totalCookbook = COOKBOOK_SECTIONS.reduce((n, s) => n + s.items.length, 0);

  // Search filters both dinners and cookbook sections by title. Empty query
  // shows everything; empty sections drop out so results stay tight.
  const q = query.trim().toLowerCase();
  const matches = (t) => !q || (t || "").toLowerCase().includes(q);
  const sortedDinners = allDinners.filter((r) => matches(r.title));
  const filteredSections = COOKBOOK_SECTIONS
    .map((s) => ({ ...s, items: s.items.filter((c) => matches(c.title)) }))
    .filter((s) => s.items.length > 0);
  const resultCount = sortedDinners.length + filteredSections.reduce((n, s) => n + s.items.length, 0);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <h1 className="text-white text-2xl font-black">Social Carousels</h1>
            <p className="text-neutral-500 text-sm mt-1">
              {q
                ? `${resultCount} match${resultCount === 1 ? "" : "es"} for "${query.trim()}"`
                : `${allDinners.length} dinners + ${totalCookbook} power-ups · click to open and screenshot`}
            </p>
          </div>
          <button onClick={lock} className="text-neutral-500 text-xs hover:text-amber-400 cursor-pointer">Lock</button>
        </div>

        <div className="relative mb-8">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search carousels by name…"
            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg pl-4 pr-16 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500/60 transition-colors [&::-webkit-search-cancel-button]:appearance-none"
          />
          {q && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 text-xs hover:text-amber-400 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {resultCount === 0 && (
          <p className="text-neutral-500 text-sm">No carousels match &ldquo;{query.trim()}&rdquo;. Try a shorter word.</p>
        )}

        {sortedDinners.length > 0 && (
          <>
            <h2 className="text-amber-400 text-xs font-black uppercase tracking-[0.2em] mb-3">Dinners ({sortedDinners.length})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
              {sortedDinners.map((r) => (
            <Link
              key={r.id}
              to={`/social/${r.slug}`}
              className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-amber-500/40 transition-all flex group"
            >
              {r.image && (
                <img {...cardImage(r.image, { sizes: "96px" })} alt={r.title} width="96" height="96" className="w-24 h-24 object-cover flex-shrink-0" loading="lazy" />
              )}
              <div className="p-3 flex flex-col justify-center min-w-0">
                <h3 className="text-white font-bold text-sm group-hover:text-amber-400 transition-colors truncate">{r.title}</h3>
                <p className="text-neutral-500 text-[10px] mt-0.5">id {r.id} · {r.protein}g protein</p>
                <p className="text-amber-400 text-[10px] mt-1 group-hover:underline">Open carousel →</p>
              </div>
            </Link>
              ))}
            </div>
          </>
        )}

        {filteredSections.map((section) => (
          <div key={section.label} className="mb-8">
            <h2 className="text-amber-400 text-xs font-black uppercase tracking-[0.2em] mb-3">{section.label} ({section.items.length})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {section.items.map((c) => (
                <Link
                  key={c.id}
                  to={`/social/cookbook/${c.id}`}
                  className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-amber-500/40 transition-all flex group"
                >
                  {c.heroImage && (
                    <img {...cardImage(c.heroImage, { sizes: "96px" })} alt={c.title} width="96" height="96" className="w-24 h-24 object-cover flex-shrink-0" loading="lazy" />
                  )}
                  <div className="p-3 flex flex-col justify-center min-w-0">
                    <h3 className="text-white font-bold text-sm group-hover:text-amber-400 transition-colors truncate">{c.title}</h3>
                    <p className="text-neutral-500 text-[10px] mt-0.5">{c.proteinPerServing ?? (c.servings ? Math.round((c.protein / c.servings) * 10) / 10 : c.protein) ?? 0}g protein/serving · {c.servings} serving{c.servings === 1 ? "" : "s"}</p>
                    <p className="text-amber-400 text-[10px] mt-1 group-hover:underline">Open carousel →</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
