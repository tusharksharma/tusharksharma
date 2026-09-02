import { Link } from "react-router-dom";
import { useMemo } from "react";
import { liveRecipes } from "../data/recipes";
import cardImage from "../utils/cardImage";
import { buildUnifiedIndex, findCrossRecipePairs } from "../lib/leftoverIndex";

// Surfaces the top-N other recipes that share the most ingredients/brands with
// the current recipe. Drives the "I just cooked X — what's next that reuses
// these leftovers?" loop.
export default function LeftoversPanel({ recipe }) {
  const { brand, generic } = useMemo(() => buildUnifiedIndex(liveRecipes), []);
  const pairs = useMemo(
    () => findCrossRecipePairs(recipe, liveRecipes, brand, generic, 3),
    [recipe, brand, generic]
  );

  if (pairs.length === 0) return null;

  return (
    <section className="border-t border-line mt-10 pt-8">
      <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
        <div>
          <p className="text-brand text-[10px] font-black uppercase tracking-[0.2em] mb-1">
            Pairs With Your Leftovers
          </p>
          <h2 className="text-ink text-xl font-black">Cook this next</h2>
        </div>
        <Link
          to="/leftovers"
          className="text-brand text-xs font-bold hover:underline"
        >
          Browse all by ingredient →
        </Link>
      </div>
      <p className="text-muted text-sm mb-5 leading-relaxed">
        Recipes that share the most ingredients with this one — same brands or proteins in your
        fridge are reusable here.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {pairs.map(({ recipe: other, sharedTags, score }) => (
          <Link
            key={other.id}
            to={`/recipes/${other.slug}`}
            className="bg-surface rounded-2xl overflow-hidden border border-line hover:border-brand/50 transition-all group"
          >
            <div className="relative">
              <img
                {...cardImage(other.image)}
                alt={other.title}
                width="640"
                height="320"
                className="w-full h-32 object-cover group-hover:brightness-110 transition-all"
                loading="lazy"
              />
              <div className="absolute top-2 right-2 bg-brand text-brandink text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg shadow-lg">
                {score} shared
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-ink text-sm font-black leading-tight group-hover:text-brand transition-colors line-clamp-2">
                {other.title}
              </h3>
              <p className="text-muted text-[10px] mt-2 font-bold uppercase tracking-wider">
                Shared:
              </p>
              <p className="text-muted text-xs mt-1 leading-snug line-clamp-2">
                {sharedTags.slice(0, 4).map((t) => t.label).join(" • ")}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
