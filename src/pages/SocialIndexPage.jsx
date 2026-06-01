import { useState } from "react";
import { Link } from "react-router-dom";
import { liveRecipes } from "../data/recipes";
import { sauces, bases, breakfasts, desserts, quickLunches } from "../data/cookbook";
import useMeta from "../hooks/useMeta";

const COOKBOOK_SECTIONS = [
  { label: "Sauces", items: sauces },
  { label: "Bases / Sides", items: bases },
  { label: "Breakfasts", items: breakfasts },
  { label: "Desserts", items: desserts },
  { label: "Quick Lunches", items: quickLunches },
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
  const sortedDinners = [...liveRecipes].sort((a, b) => b.id - a.id);
  const totalCookbook = COOKBOOK_SECTIONS.reduce((n, s) => n + s.items.length, 0);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <h1 className="text-white text-2xl font-black">Social Carousels</h1>
            <p className="text-neutral-500 text-sm mt-1">{sortedDinners.length} dinners + {totalCookbook} power-ups · click to open and screenshot</p>
          </div>
          <button onClick={lock} className="text-neutral-500 text-xs hover:text-amber-400 cursor-pointer">Lock</button>
        </div>

        <h2 className="text-amber-400 text-xs font-black uppercase tracking-[0.2em] mb-3">Dinners ({sortedDinners.length})</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
          {sortedDinners.map((r) => (
            <Link
              key={r.id}
              to={`/social/${r.slug}`}
              className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-amber-500/40 transition-all flex group"
            >
              {r.image && (
                <img src={r.image} alt={r.title} className="w-24 h-24 object-cover flex-shrink-0" loading="lazy" />
              )}
              <div className="p-3 flex flex-col justify-center min-w-0">
                <h3 className="text-white font-bold text-sm group-hover:text-amber-400 transition-colors truncate">{r.title}</h3>
                <p className="text-neutral-500 text-[10px] mt-0.5">id {r.id} · {r.protein}g protein</p>
                <p className="text-amber-400 text-[10px] mt-1 group-hover:underline">Open carousel →</p>
              </div>
            </Link>
          ))}
        </div>

        {COOKBOOK_SECTIONS.map((section) => section.items.length > 0 && (
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
                    <img src={c.heroImage} alt={c.title} className="w-24 h-24 object-cover flex-shrink-0" loading="lazy" />
                  )}
                  <div className="p-3 flex flex-col justify-center min-w-0">
                    <h3 className="text-white font-bold text-sm group-hover:text-amber-400 transition-colors truncate">{c.title}</h3>
                    <p className="text-neutral-500 text-[10px] mt-0.5">{(c.proteinPerServing != null ? c.proteinPerServing : c.protein) || 0}g protein · {c.servings} serving{c.servings === 1 ? "" : "s"}</p>
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
