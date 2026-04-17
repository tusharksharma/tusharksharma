import { Link } from "react-router-dom";
import { liveRecipes } from "../data/recipes";
import useMeta from "../hooks/useMeta";

export default function DinnersPage() {
  useMeta({ title: "Dinners", description: "High-protein family dinners with the Split Cook Method. Same cook, different plates for adults and kids." });
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white">Dinners</h1>
          <p className="text-neutral-400 text-sm mt-1">
            High-protein family dinners with the Split Cook Method. Same cook, different plates.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {liveRecipes.map((r) => (
            <Link key={r.id} to={`/recipes/${r.slug}`} className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-amber-500/40 transition-all group block">
              {r.image && (
                <img src={r.image} alt={r.title} className="w-full h-40 object-cover" loading="lazy" />
              )}
              <div className="p-5">
                <h3 className="text-white font-bold text-sm group-hover:text-amber-400 transition-colors">{r.title}</h3>
                <p className="text-neutral-500 text-xs mt-1">{r.role}</p>
                <div className="flex items-center gap-2 mt-2 text-[10px] text-neutral-600">
                  <span className="text-amber-400 font-bold">{r.protein}g protein</span>
                  <span>&middot;</span>
                  <span>{r.calories} cal</span>
                  <span>&middot;</span>
                  <span>{r.time}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

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
