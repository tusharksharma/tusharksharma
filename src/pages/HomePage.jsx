import { useState, useCallback } from "react";
import recipes from "../data/recipes";
import HeroSection from "../components/HeroSection";
import HowItWorks from "../components/HowItWorks";
import RecipeBrowser from "../components/RecipeBrowser";
import BrowseSystems from "../components/BrowseSystems";
import RecipeCard from "../components/RecipeCard";

const FEATURED_IDS = [1, 2, 3, 4];
const QUICK_WIN_IDS = [6, 7, 3];

export default function HomePage() {
  const [browserFilter, setBrowserFilter] = useState(null);
  const featured = recipes.filter((r) => FEATURED_IDS.includes(r.id));
  const quickWins = recipes.filter((r) => QUICK_WIN_IDS.includes(r.id));

  const handleSystemFilter = useCallback((field, value) => {
    setBrowserFilter({ field, value });
    setTimeout(() => {
      document.getElementById("recipes")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <HeroSection />
      <HowItWorks />
      <RecipeBrowser key={browserFilter ? `${browserFilter.field}-${browserFilter.value}` : "default"} initialFilter={browserFilter} />
      <BrowseSystems onFilter={handleSystemFilter} />

      {/* Real Life — Trust */}
      <section className="border-b border-neutral-800">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-black text-white mb-8">Built for Real Life</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <TrustCard title="No separate meals" desc="One cook, two outcomes. Adults and kids eat from the same workflow." />
            <TrustCard title="No exotic ingredients" desc="Grocery store staples. Pre-cooked protein welcome. No judgment." />
            <TrustCard title="No 90-min recipes" desc="Most meals done in 30 minutes. Repeatable systems, not one-off projects." />
          </div>
        </div>
      </section>

      {/* Quick Wins */}
      <section className="border-b border-neutral-800 bg-neutral-900/30">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-black text-white mb-2">Start Here</h2>
          <p className="text-neutral-500 text-sm mb-6">15-20 minute meals. Fast, high success rate. Zero friction.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {quickWins.map((r) => <RecipeCard key={r.id} recipe={r} />)}
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="border-b border-neutral-800">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-black text-white">Why This Works</h2>
          <p className="text-neutral-500 mt-4 text-sm">
            Most high-protein food fails because it's bland, repetitive, and unrealistic.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            {["Texture Contrast", "Controlled Calories", "Bold Flavor", "Simple Execution"].map((l) => (
              <div key={l} className="bg-neutral-900 border border-amber-500/20 rounded-lg px-3 py-3">
                <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">{l}</span>
              </div>
            ))}
          </div>
          <p className="text-neutral-400 mt-8 text-sm italic max-w-lg mx-auto">
            "I build high-protein meals that are efficient, flavorful, and
            repeatable — designed for real life, not perfection."
          </p>
        </div>
      </section>

      {/* All Recipes */}
      <section className="bg-neutral-900/30">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-black text-white mb-2">All Recipes</h2>
          <p className="text-neutral-500 text-sm mb-6">{recipes.length} recipes and counting</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((r) => <RecipeCard key={r.id} recipe={r} />)}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800 py-8 text-center text-neutral-600 text-sm">
        <p className="text-amber-500/80 font-black text-xs tracking-[0.2em] uppercase">The Split Plate</p>
        <p className="text-neutral-500 font-semibold mt-2">Protein Meals &middot; Sauce Systems &middot; Cooking Techniques</p>
        <p className="mt-2 text-neutral-700">Cook once. Split. Done.</p>
      </footer>
    </div>
  );
}

function TrustCard({ title, desc }) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
      <h3 className="text-white font-bold text-sm">{title}</h3>
      <p className="text-neutral-500 text-xs mt-2 leading-relaxed">{desc}</p>
    </div>
  );
}
