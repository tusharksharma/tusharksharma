import { Link } from "react-router-dom";
import useMeta from "../hooks/useMeta";

export default function AboutPage() {
  useMeta({ title: "About", description: "Cook once. Split smart. The Split Plate is a dinner system for families who want high-protein meals without cooking twice." });

  return (
    <div className="min-h-screen bg-page text-ink">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-black text-ink">About The Split Plate</h1>
        <p className="text-brand text-sm font-semibold mt-2">Cook once. Split smart.</p>

        <div className="mt-8 space-y-5 text-muted text-sm leading-relaxed">
          <p>Most healthy eating advice falls apart in real life.</p>
          <p>
            You're told to eat high-protein, whole foods —
            but your kids won't touch half of it.
            So you either cook two meals... or give up.
          </p>
          <p className="text-ink font-semibold">That's the gap The Split Plate is built to fix.</p>

          {/* The System */}
          <div className="bg-surface border border-line rounded-xl p-5">
            <h2 className="text-ink font-bold text-sm mb-3">The System</h2>
            <p className="text-muted text-sm mb-3">Every recipe follows one rule: <span className="text-brand font-semibold">Cook once. Split smart.</span></p>
            <ul className="space-y-1.5 text-muted text-sm">
              <li>Start with a single base meal</li>
              <li>Adjust portions, toppings, and finishes</li>
              <li>Turn it into two plates:</li>
            </ul>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="bg-red-950/20 border border-red-900/40 rounded-lg p-3">
                <span className="text-red-400 text-[10px] font-bold uppercase tracking-wider">Adult</span>
                <p className="text-muted text-xs mt-1">High-protein, performance-focused</p>
              </div>
              <div className="bg-green-950/20 border border-green-900/40 rounded-lg p-3">
                <span className="text-green-400 text-[10px] font-bold uppercase tracking-wider">Kid</span>
                <p className="text-muted text-xs mt-1">Something they'll actually eat</p>
              </div>
            </div>
            <p className="text-muted text-xs mt-3">No extra cooking. No separate meals.</p>
          </div>

          {/* What This Isn't */}
          <div className="bg-surface border border-line rounded-xl p-5">
            <h2 className="text-ink font-bold text-sm mb-3">What This Isn't</h2>
            <ul className="space-y-1.5 text-muted text-sm">
              <li>Not gourmet, ingredient-heavy cooking</li>
              <li>Not "just eat what we eat" parenting advice</li>
              <li>Not low-protein diet food</li>
              <li>And definitely not cooking two dinners every night</li>
            </ul>
          </div>

          {/* The Stance */}
          <div className="bg-surface border border-line rounded-xl p-5">
            <h2 className="text-ink font-bold text-sm mb-3">The Stance — High-Protein, Not Clean-Eating</h2>
            <p className="text-muted text-sm">
              This is convenience cooking, not clean eating.
              Packet sauces, jarred Alfredo, frozen wings, breaded chicken, Buldak ramen, Rao's, Dan-O's — they're all in here on purpose.
            </p>
            <p className="text-muted text-sm mt-2">
              The bar isn't "everything from scratch." The bar is: <span className="text-ink font-semibold">does this hit ~35g+ protein, fit in 30 minutes, and get eaten by both adults and kids?</span>
              Shortcuts that buy back time without taxing macros stay. Shortcuts that wreck the protein-to-calorie ratio get cut.
            </p>
            <p className="text-muted text-sm mt-2">
              No apologies for using a jar. The goal is a system that survives a Tuesday — not a kitchen that looks good on Instagram.
            </p>
          </div>

          {/* What You'll Find */}
          <div className="bg-surface border border-line rounded-xl p-5">
            <h2 className="text-ink font-bold text-sm mb-3">What You'll Find</h2>
            <ul className="space-y-2 text-muted text-sm">
              <li><span className="text-brand font-bold">Split Recipes</span> — One base, two outcomes. Same effort.</li>
              <li><span className="text-brand font-bold">High-Protein Meals</span> — Protein is non-negotiable. Taste still matters.</li>
              <li><span className="text-brand font-bold">Quick Meals & Sauces</span> — Built for real schedules, not weekends with free time.</li>
              <li><span className="text-brand font-bold">Real Tradeoffs</span> — 93/7 might beat 99/1. Kids might need simpler plates.</li>
            </ul>
            <p className="text-muted text-xs mt-3">The goal is consistency — not perfection.</p>
          </div>

          {/* Why This Works */}
          <div className="bg-brand/5 border border-brand/20 rounded-xl p-5">
            <h2 className="text-ink font-bold text-sm mb-3">Why This Works</h2>
            <p className="text-muted text-sm mb-3">
              Most people don't fail because they lack discipline.
              They fail because their system doesn't fit their life.
            </p>
            <p className="text-muted text-sm">This does:</p>
            <div className="flex gap-3 mt-3 flex-wrap">
              {["One cook", "One kitchen", "One meal", "Zero friction"].map((t) => (
                <span key={t} className="text-brand text-xs font-bold bg-surface px-3 py-1.5 rounded-lg">{t}</span>
              ))}
            </div>
            <p className="text-muted text-xs mt-3">Built around meals I cook weekly for my family.</p>
          </div>

          {/* About Me */}
          <div className="bg-surface border border-line rounded-xl p-5">
            <h2 className="text-ink font-bold text-sm mb-3">About Me</h2>
            <p className="text-muted text-sm">
              I'm Tushar.
            </p>
            <p className="text-muted text-sm mt-2">
              I work in data and analytics, so I think in systems — and most diets fail because they don't have one.
            </p>
            <p className="text-muted text-sm mt-2">This is mine:</p>
            <ul className="space-y-1 text-muted text-sm mt-2">
              <li>Hit protein targets</li>
              <li>Cook once</li>
              <li>Make it work for the whole family</li>
            </ul>
            <p className="text-muted text-xs mt-3">
              I'm not a chef. I'm building something that works on a Tuesday night when everyone's tired and still needs to eat.
            </p>
          </div>

          {/* The Goal */}
          <p className="text-muted text-sm mt-4 text-center italic">
            Make high-protein eating something you can actually stick to —
            without turning dinner into a daily negotiation.
          </p>
        </div>

        <div className="mt-10 flex gap-3 flex-wrap">
          <Link to="/#your-week" className="px-5 py-2.5 bg-brand text-brandink font-bold rounded-xl text-sm hover:bg-brand transition-colors">
            See This Week
          </Link>
          <Link to="/dinners" className="px-5 py-2.5 bg-surface2 text-ink font-bold rounded-xl border border-line text-sm hover:bg-line transition-colors">
            Browse Dinners
          </Link>
        </div>
      </div>
    </div>
  );
}
