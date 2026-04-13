import { Link } from "react-router-dom";
import recipes, { liveRecipes, comingSoonRecipes } from "../data/recipes";
import HeroSection from "../components/HeroSection";
import HowItWorks from "../components/HowItWorks";
import RecipeCard from "../components/RecipeCard";

const START_HERE = [
  { id: 1, label: "Best First Recipe", reason: "Crispy + creamy + easy split" },
  { id: 4, label: "Fastest Weekday Meal", reason: "25 min, meal preps all week" },
  { id: 2, label: "Best Meal Prep", reason: "Steak pasta that reheats well" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <HeroSection />
      <HowItWorks />

      {/* Start Here */}
      <section className="border-b border-neutral-800 bg-neutral-900/50" id="recipes">
        <div className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-black text-white mb-2">Start Here</h2>
          <p className="text-neutral-500 text-sm mb-6">
            Three recipes. Three different formats. Pick the one that fits your week.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {START_HERE.map(({ id, label, reason }) => {
              const r = recipes.find((x) => x.id === id);
              if (!r) return null;
              return (
                <Link to={`/recipes/${r.slug}`} key={id} className="block group">
                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-amber-500/50 transition-all">
                    <img src={r.image} alt={r.title} className="w-full h-40 object-cover group-hover:brightness-110 transition-all" loading="lazy" />
                    <div className="p-4">
                      <span className="text-amber-500 text-xs font-bold uppercase tracking-wider">{label}</span>
                      <h3 className="text-white font-bold text-sm mt-1 group-hover:text-amber-400 transition-colors">{r.title}</h3>
                      <p className="text-neutral-500 text-xs mt-1">{reason}</p>
                      <p className="text-amber-400/80 text-xs font-semibold mt-2">{r.protein}g protein &middot; {r.calories} cal &middot; {r.time}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* All Live Recipes */}
      <section className="border-b border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-black text-white mb-2">All Recipes</h2>
          <p className="text-neutral-500 text-sm mb-6">
            Full split-cook recipes with real photos, step-by-step method, and nutrition.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveRecipes.map((r) => (
              <RecipeCard key={r.id} recipe={r} />
            ))}
          </div>
        </div>
      </section>

      {/* Coming Soon */}
      {comingSoonRecipes.length > 0 && (
        <section className="border-b border-neutral-800 bg-neutral-900/30">
          <div className="max-w-6xl mx-auto px-4 py-16">
            <h2 className="text-2xl font-black text-white mb-2">Coming Next</h2>
            <p className="text-neutral-500 text-sm mb-6">
              These are being built to the same standard. Real recipes, real photos, real split-cook method.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {comingSoonRecipes.map((r) => (
                <RecipeCard key={r.id} recipe={r} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Real Life — Trust */}
      <section className="border-b border-neutral-800">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-black text-white mb-8">Built for Real Life</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <TrustCard
              title="No separate meals"
              desc="One cook, two outcomes. Adults and kids eat from the same workflow."
            />
            <TrustCard
              title="No exotic ingredients"
              desc="Grocery store staples. Pre-cooked protein welcome. No judgment."
            />
            <TrustCard
              title="No 90-min recipes"
              desc="Most meals done in 30 minutes. Repeatable systems, not one-off projects."
            />
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="border-b border-neutral-800">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-black text-white">Why This Works</h2>
          <p className="text-neutral-500 mt-4 text-sm">
            Most high-protein food fails because it's bland, repetitive, and
            unrealistic.
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

      {/* Footer */}
      <footer className="border-t border-neutral-800 py-8 text-center text-neutral-600 text-sm">
        <img src="/images/favicon.png" alt="The Split Plate" className="w-8 h-8 rounded-full mx-auto mb-2" />
        <p className="text-amber-500/80 font-black text-xs tracking-[0.2em] uppercase">
          The Split Plate
        </p>
        <p className="text-neutral-500 font-semibold mt-2">
          Protein Meals &middot; Sauce Systems &middot; Cooking Techniques
        </p>
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
