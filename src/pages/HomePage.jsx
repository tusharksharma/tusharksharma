import { Link } from "react-router-dom";
import { liveRecipes, comingSoonRecipes } from "../data/recipes";
import { desserts } from "../data/cookbook";
import useMeta from "../hooks/useMeta";
import HeroSection from "../components/HeroSection";
import HowItWorks from "../components/HowItWorks";
import YourWeek from "../components/YourWeek";
import RecipeCard from "../components/RecipeCard";
import EmailCapture from "../components/EmailCapture";
import cardImage from "../utils/cardImage";

function TrustCard({ title, desc }) {
  return (
    <div className="bg-surface border border-line rounded-xl p-6">
      <h3 className="text-ink font-bold text-sm">{title}</h3>
      <p className="text-muted text-xs mt-2 leading-relaxed">{desc}</p>
    </div>
  );
}

function MakeAheadDessertCallout() {
  const featured = desserts.find((d) => d.bestFor?.includes("Make-ahead"));
  if (!featured) return null;
  return (
    <section className="border-b border-line bg-gradient-to-br from-brand/20 via-page to-page">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-brand text-xs font-black uppercase tracking-wider">This Week's Make-Ahead Dessert</span>
          <span className="text-faint text-[10px]">Build Sunday, eat through Thursday</span>
        </div>
        <Link to={`/cookbook/${featured.id}`} className="grid grid-cols-1 sm:grid-cols-2 gap-5 bg-surface/60 border border-brand/20 rounded-xl overflow-hidden hover:border-brand/40 transition-all group">
          {featured.heroImage && (
            <img {...cardImage(featured.heroImage, { sizes: "(min-width: 640px) 50vw, 100vw" })} alt={featured.title} className="w-full h-full object-cover sm:max-h-64" loading="lazy" />
          )}
          <div className="p-5 sm:p-6 flex flex-col justify-center">
            <h3 className="text-ink font-black text-lg group-hover:text-brand transition-colors">{featured.title}</h3>
            <p className="text-muted text-xs mt-1">{featured.tagline}</p>
            <div className="flex items-center gap-2 mt-3 text-[10px] text-muted">
              <span className="text-brand font-bold">{featured.proteinPerServing || featured.protein}g protein</span>
              <span>&middot;</span>
              <span>~{featured.caloriesPerServing} cal</span>
              <span>&middot;</span>
              <span>{featured.servings} serving{featured.servings === 1 ? "" : "s"}</span>
              <span>&middot;</span>
              <span>{featured.time}</span>
            </div>
            <p className="text-muted text-xs mt-3 leading-relaxed line-clamp-3">{featured.useThisWhen}</p>
            <span className="text-brand text-xs font-bold mt-3 group-hover:underline">See the build &rarr;</span>
          </div>
        </Link>
      </div>
    </section>
  );
}

export default function HomePage() {
  useMeta({ description: "High-protein family dinners with the Split Cook Method. One cook, two plates — adults and kids from the same workflow." });
  return (
    <div className="min-h-screen bg-page text-ink">
      <HeroSection />
      <HowItWorks />
      <YourWeek />

      <MakeAheadDessertCallout />

      {/* All Live Recipes */}
      <section className="border-b border-line">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-black text-ink mb-2">All Recipes</h2>
          <p className="text-muted text-sm mb-6">
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
        <section className="border-b border-line bg-surface/30">
          <div className="max-w-6xl mx-auto px-4 py-16">
            <h2 className="text-2xl font-black text-ink mb-2">Coming Next</h2>
            <p className="text-muted text-sm mb-6">
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

      {/* Email capture — after seeing the food */}
      <section className="border-b border-line">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <EmailCapture />
        </div>
      </section>

      {/* Real Life — Trust */}
      <section className="border-b border-line">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-black text-ink mb-8">Built for Real Life</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <TrustCard title="No separate dinners" desc="One cook, two outcomes. Adults and kids eat from the same workflow." />
            <TrustCard title="No exotic ingredients" desc="Grocery store staples. Pre-cooked protein welcome. No judgment." />
            <TrustCard title="No 90-min recipes" desc="Most dinners done in 30 minutes. Repeatable systems, not one-off projects." />
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="border-b border-line">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-black text-ink">Why This Works</h2>
          <p className="text-muted mt-4 text-sm">
            Most family dinner systems fail because they assume everyone eats the same thing. This one doesn't.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            {["Real Flavor", "Honest Macros", "Actual Split", "Repeatable"].map((l) => (
              <div key={l} className="bg-surface border border-brand/20 rounded-lg px-3 py-3">
                <span className="text-brand text-xs font-bold uppercase tracking-wider">{l}</span>
              </div>
            ))}
          </div>
          <p className="text-muted mt-8 text-sm italic max-w-lg mx-auto">
            "I build dinners that work for my family — adults eat what they want, kids eat what they'll finish, and nobody cooks twice."
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-line py-8 text-center text-faint text-sm">
        <img src="/images/favicon.png" alt="The Split Plate" className="w-10 h-10 mx-auto mb-2" />
        <p className="text-brand/80 font-black text-xs tracking-[0.2em] uppercase">The Split Plate</p>
        <p className="text-muted font-semibold mt-2">Dinners &middot; Power-Ups &middot; Weekly Plans</p>
        <Link to="/about" className="text-faint text-xs hover:text-brand mt-2 inline-block">About</Link>
        <p className="mt-2 text-faint">One cook. Two plates. Done.</p>
      </footer>
    </div>
  );
}
