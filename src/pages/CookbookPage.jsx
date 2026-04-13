import { useState } from "react";
import { sauces, quickLunches } from "../data/cookbook";

const TABS = ["Sauces", "Quick Lunches"];

function SauceCard({ sauce, onSelect }) {
  return (
    <button onClick={() => onSelect(sauce)} className="text-left bg-neutral-900 border border-neutral-800 rounded-xl p-4 hover:border-amber-500/40 transition-all cursor-pointer group w-full">
      <h3 className="text-white font-bold text-sm group-hover:text-amber-400 transition-colors">{sauce.title}</h3>
      <p className="text-neutral-500 text-xs mt-0.5">{sauce.tagline}</p>
      <div className="flex items-center gap-2 mt-2 text-[10px] text-neutral-600">
        <span className="text-amber-400 font-bold">~{sauce.calories} cal</span>
        <span>&middot;</span>
        <span>{sauce.protein}g protein</span>
        <span>&middot;</span>
        <span>{sauce.time}</span>
      </div>
      <div className="flex gap-1 mt-2 flex-wrap">
        {sauce.bestFor.map((b) => (
          <span key={b} className="text-[9px] bg-neutral-800 text-neutral-500 px-1.5 py-0.5 rounded">{b}</span>
        ))}
      </div>
    </button>
  );
}

function LunchCard({ lunch, onSelect }) {
  return (
    <button onClick={() => onSelect(lunch)} className="text-left bg-neutral-900 border border-neutral-800 rounded-xl p-4 hover:border-amber-500/40 transition-all cursor-pointer group w-full">
      <h3 className="text-white font-bold text-sm group-hover:text-amber-400 transition-colors">{lunch.title}</h3>
      <p className="text-neutral-500 text-xs mt-0.5">{lunch.tagline}</p>
      <div className="flex items-center gap-2 mt-2 text-[10px]">
        <span className="text-amber-400 font-bold">{lunch.protein}g protein</span>
        <span className="text-neutral-700">&middot;</span>
        <span className="text-neutral-500">{lunch.calories} cal</span>
        <span className="text-neutral-700">&middot;</span>
        <span className="text-neutral-500">{lunch.time}</span>
      </div>
    </button>
  );
}

function SauceDetail({ sauce, onBack }) {
  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={onBack} className="text-neutral-500 hover:text-amber-400 text-xs font-semibold mb-4 cursor-pointer">&larr; Back to Recipes</button>

      <h1 className="text-2xl font-black text-white">{sauce.title}</h1>
      <p className="text-neutral-400 text-sm mt-1">{sauce.tagline}</p>

      <div className="flex gap-3 mt-3">
        <span className="bg-neutral-800 text-amber-400 text-xs font-bold px-3 py-1 rounded-lg">~{sauce.calories} cal</span>
        <span className="bg-neutral-800 text-white text-xs font-bold px-3 py-1 rounded-lg">{sauce.protein}g protein</span>
        <span className="bg-neutral-800 text-neutral-400 text-xs px-3 py-1 rounded-lg">{sauce.time}</span>
      </div>

      {/* Use This When */}
      <div className="mt-6 bg-amber-500/5 border border-amber-500/20 rounded-lg p-4">
        <span className="text-amber-500 text-[10px] font-bold uppercase tracking-wider">Use This When</span>
        <p className="text-neutral-300 text-xs mt-1">{sauce.useThisWhen}</p>
      </div>

      {/* Ingredients */}
      <div className="mt-6">
        <h2 className="text-sm font-bold text-white mb-2">Ingredients</h2>
        <ul className="bg-neutral-900 border border-neutral-800 rounded-xl divide-y divide-neutral-800">
          {sauce.ingredients.map((item, i) => (
            <li key={i} className="px-4 py-2 text-xs text-neutral-300">{item}</li>
          ))}
        </ul>
      </div>

      {/* Steps */}
      <div className="mt-6">
        <h2 className="text-sm font-bold text-white mb-2">Method</h2>
        <ol className="space-y-2">
          {sauce.steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-black flex items-center justify-center text-[10px] font-black flex-shrink-0">{i + 1}</span>
              <p className="text-neutral-300 text-xs pt-1">{step}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* Pair With */}
      <div className="mt-6">
        <h2 className="text-sm font-bold text-white mb-2">Pair With</h2>
        <div className="flex gap-2 flex-wrap">
          {sauce.pairWith.map((p) => (
            <span key={p} className="text-xs bg-neutral-800 text-neutral-400 px-3 py-1 rounded-full">{p}</span>
          ))}
        </div>
      </div>

      {/* Variations */}
      {sauce.variations && (
        <div className="mt-6 bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <h2 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">Variations</h2>
          <ul className="space-y-1">
            {sauce.variations.map((v, i) => (
              <li key={i} className="text-xs text-neutral-300 flex gap-2">
                <span className="text-blue-400 flex-shrink-0">&#10148;</span>{v}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Fails */}
      {sauce.fails && (
        <div className="mt-4 bg-amber-950/20 border border-amber-900/40 rounded-xl p-4">
          <h2 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">If This Goes Wrong</h2>
          <ul className="space-y-1">
            {sauce.fails.map((f, i) => (
              <li key={i} className="text-xs text-neutral-300">{f}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function LunchDetail({ lunch, onBack }) {
  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={onBack} className="text-neutral-500 hover:text-amber-400 text-xs font-semibold mb-4 cursor-pointer">&larr; Back to Recipes</button>

      <h1 className="text-2xl font-black text-white">{lunch.title}</h1>
      <p className="text-neutral-400 text-sm mt-1">{lunch.tagline}</p>

      <div className="flex gap-3 mt-3">
        <span className="bg-neutral-800 text-amber-400 text-xs font-bold px-3 py-1 rounded-lg">{lunch.protein}g protein</span>
        <span className="bg-neutral-800 text-neutral-400 text-xs px-3 py-1 rounded-lg">{lunch.calories} cal</span>
        <span className="bg-neutral-800 text-neutral-400 text-xs px-3 py-1 rounded-lg">{lunch.time}</span>
      </div>

      <div className="mt-6">
        <h2 className="text-sm font-bold text-white mb-2">Ingredients</h2>
        <ul className="bg-neutral-900 border border-neutral-800 rounded-xl divide-y divide-neutral-800">
          {lunch.ingredients.map((item, i) => (
            <li key={i} className="px-4 py-2 text-xs text-neutral-300">{item}</li>
          ))}
        </ul>
      </div>

      <div className="mt-6">
        <h2 className="text-sm font-bold text-white mb-2">Method</h2>
        <ol className="space-y-2">
          {lunch.steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-black flex items-center justify-center text-[10px] font-black flex-shrink-0">{i + 1}</span>
              <p className="text-neutral-300 text-xs pt-1">{step}</p>
            </li>
          ))}
        </ol>
      </div>

      {lunch.saucePairings && lunch.saucePairings.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-bold text-white mb-2">Goes with these sauces</h2>
          <div className="flex gap-2 flex-wrap">
            {lunch.saucePairings.map((id) => {
              const s = sauces.find((x) => x.id === id);
              return s ? (
                <span key={id} className="text-xs bg-neutral-800 text-amber-400 px-3 py-1 rounded-full font-semibold">{s.title}</span>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CookbookPage() {
  const [tab, setTab] = useState("Sauces");
  const [selectedSauce, setSelectedSauce] = useState(null);
  const [selectedLunch, setSelectedLunch] = useState(null);

  if (selectedSauce) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <SauceDetail sauce={selectedSauce} onBack={() => setSelectedSauce(null)} />
        </div>
      </div>
    );
  }

  if (selectedLunch) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <LunchDetail lunch={selectedLunch} onBack={() => setSelectedLunch(null)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="max-w-5xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white">Recipes</h1>
          <p className="text-neutral-400 text-sm mt-1">
            Fast sauces, quick lunches, and building blocks — no planning required.
          </p>
          <p className="text-neutral-600 text-[10px] mt-1">
            Use these when you don't follow the full week, or to level up your dinners.
          </p>
        </div>

        {/* Tabs */}
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

        {/* Content */}
        {tab === "Sauces" && (
          <div>
            <p className="text-neutral-500 text-xs mb-4">
              Flavor multipliers. ~30 cal each. Turn boring protein into something you want to eat.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sauces.map((s) => (
                <SauceCard key={s.id} sauce={s} onSelect={setSelectedSauce} />
              ))}
            </div>
          </div>
        )}

        {tab === "Quick Lunches" && (
          <div>
            <p className="text-neutral-500 text-xs mb-4">
              10-15 min, high protein, repeatable. Your "I need something NOW" fallback.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickLunches.map((l) => (
                <LunchCard key={l.id} lunch={l} onSelect={setSelectedLunch} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
