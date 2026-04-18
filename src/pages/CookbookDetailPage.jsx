import { useParams, Link } from "react-router-dom";
import { sauces, desserts, breakfasts, quickLunches } from "../data/cookbook";
import { liveRecipes } from "../data/recipes";
import useMeta from "../hooks/useMeta";

const allItems = [...sauces, ...breakfasts, ...desserts, ...quickLunches];

export default function CookbookDetailPage() {
  const { id } = useParams();
  const sauce = allItems.find((item) => item.id === id);
  useMeta(sauce ? { title: sauce.title, description: sauce.useThisWhen, image: sauce.heroImage } : {});

  if (!sauce) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-white">Recipe not found</h1>
          <Link to="/cookbook" className="text-amber-400 text-sm mt-2 inline-block">&larr; Back to Recipes</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Link to="/cookbook" className="text-neutral-500 hover:text-amber-400 text-xs font-semibold mb-6 inline-block">&larr; Back to Recipes</Link>

        {sauce.heroImage && (
          <div className="rounded-2xl overflow-hidden mb-6">
            <img src={sauce.heroImage} alt={sauce.title} className="w-full h-64 sm:h-80 object-cover" loading="lazy" />
          </div>
        )}

        <h1 className="text-2xl font-black text-white">{sauce.title}</h1>
        <p className="text-amber-400/80 text-sm mt-1 font-medium">{sauce.tagline}</p>
        <p className="text-neutral-500 text-xs mt-1">{sauce.flavorProfile}</p>

        {/* Stats */}
        <div className="flex gap-3 mt-4 flex-wrap">
          <span className="bg-neutral-800 text-amber-400 text-xs font-bold px-3 py-1.5 rounded-lg">{sauce.protein}g protein</span>
          <span className="bg-neutral-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg">~{sauce.caloriesPerServing} cal/serving</span>
          <span className="bg-neutral-800 text-neutral-400 text-xs px-3 py-1.5 rounded-lg">{sauce.servings} servings</span>
          <span className="bg-neutral-800 text-neutral-400 text-xs px-3 py-1.5 rounded-lg">{sauce.time}</span>
        </div>

        {/* Use This When */}
        <div className="mt-6 bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
          <span className="text-amber-500 text-[10px] font-bold uppercase tracking-wider">Use This When</span>
          <p className="text-neutral-300 text-sm mt-1">{sauce.useThisWhen}</p>
        </div>

        {/* Core Ratio */}
        {sauce.coreRatio && (
          <div className="mt-4 bg-red-950/20 border border-red-900/40 rounded-xl p-4">
            <span className="text-red-400 text-[10px] font-bold uppercase tracking-wider">Core Ratio (Locked)</span>
            <p className="text-neutral-300 text-sm mt-1 font-semibold">{sauce.coreRatio}</p>
          </div>
        )}

        {/* Flavor Target */}
        <div className="mt-4 bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <span className="text-xs font-bold text-white uppercase tracking-wider">Flavor Target</span>
          <p className="text-neutral-400 text-sm mt-1">{sauce.flavorTarget}</p>
        </div>

        {/* Split Note */}
        {sauce.splitNote && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-red-950/20 border border-red-900/40 rounded-lg p-3">
              <span className="text-red-400 text-[10px] font-bold uppercase tracking-wider">Adult</span>
              <p className="text-neutral-300 text-xs mt-1">{sauce.splitNote.adult}</p>
            </div>
            <div className="bg-green-950/20 border border-green-900/40 rounded-lg p-3">
              <span className="text-green-400 text-[10px] font-bold uppercase tracking-wider">Kid</span>
              <p className="text-neutral-300 text-xs mt-1">{sauce.splitNote.kid}</p>
            </div>
          </div>
        )}

        {/* Ingredients */}
        <div className="mt-6">
          <h2 className="text-sm font-bold text-white mb-2">Ingredients</h2>
          <ul className="bg-neutral-900 border border-neutral-800 rounded-xl divide-y divide-neutral-800">
            {sauce.ingredients.map((item, i) => {
              const isLinked = typeof item === "object" && item.link;
              return (
                <li key={i} className="px-4 py-2.5 text-sm text-neutral-300">
                  {isLinked ? (
                    <Link to={item.link} className="text-amber-400 hover:underline font-semibold">{item.text}</Link>
                  ) : (
                    typeof item === "object" ? item.text : item
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Prep Image */}
        {sauce.prepImage && (
          <div className="mt-6 rounded-xl overflow-hidden">
            <img src={sauce.prepImage} alt={`${sauce.title} prep`} className="w-full h-48 sm:h-56 object-cover" loading="lazy" />
            <p className="text-neutral-600 text-[10px] mt-1 text-center">Mise en place</p>
          </div>
        )}

        {/* Method */}
        <div className="mt-6">
          <h2 className="text-sm font-bold text-white mb-2">Method</h2>
          <ol className="space-y-3">
            {sauce.steps.map((step, i) => {
              const colonIdx = step.indexOf(":");
              const hasLabel = colonIdx > 0 && colonIdx < 20;
              const label = hasLabel ? step.slice(0, colonIdx) : null;
              const body = hasLabel ? step.slice(colonIdx + 1).trim() : step;
              return (
                <li key={i} className="flex gap-3">
                  <span className="w-7 h-7 rounded-full bg-amber-500 text-black flex items-center justify-center text-xs font-black flex-shrink-0">{i + 1}</span>
                  <div className="pt-0.5">
                    {label && <span className="text-amber-400 font-bold text-xs uppercase tracking-wider block mb-0.5">{label}</span>}
                    <p className="text-neutral-300 text-sm">{body}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Best For */}
        <div className="mt-6">
          <h2 className="text-sm font-bold text-white mb-2">Best For</h2>
          <div className="flex gap-2 flex-wrap">
            {sauce.bestFor.map((p) => (
              <span key={p} className="text-xs bg-neutral-800 text-neutral-400 px-3 py-1 rounded-full">{p}</span>
            ))}
          </div>
        </div>

        {/* Troubleshooting */}
        {sauce.troubleshooting && sauce.troubleshooting.length > 0 && (
          <div className="mt-6 bg-amber-950/20 border border-amber-900/40 rounded-xl p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400 mb-3">If This Goes Wrong</h2>
            <div className="space-y-3">
              {sauce.troubleshooting.map((t, i) => (
                <div key={i} className="text-sm">
                  <p className="text-white font-semibold">{t.problem}</p>
                  <p className="text-neutral-400 mt-0.5">{t.fix}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Brands */}
        {sauce.brands && sauce.brands.length > 0 && (
          <div className="mt-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-3">Brands I Use</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sauce.brands.map((b, i) => {
                const inner = (
                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-amber-500/30 transition-colors">
                    {b.image && (
                      <div className="bg-white p-3 flex items-center justify-center h-24">
                        <img src={b.image} alt={b.name} className="max-h-full max-w-full object-contain" loading="lazy" />
                      </div>
                    )}
                    <div className="p-3">
                      <div className="text-amber-400 font-black text-xs">{b.name}</div>
                      <div className="text-white text-[10px] font-semibold mt-0.5">{b.item}</div>
                      <div className="text-neutral-500 text-[10px] mt-1 leading-relaxed">{b.why}</div>
                    </div>
                  </div>
                );
                return b.url ? (
                  <a key={i} href={b.url} target="_blank" rel="noopener noreferrer" className="block">{inner}</a>
                ) : (
                  <div key={i}>{inner}</div>
                );
              })}
            </div>
          </div>
        )}

        {/* Meal Prep */}
        {sauce.mealPrep && (
          <div className="mt-6 bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-amber-500 mb-2">Storage</h2>
            <div className="space-y-1.5 text-sm text-neutral-300">
              <p><span className="text-neutral-500 font-semibold">How:</span> {sauce.mealPrep.storage}</p>
              <p><span className="text-neutral-500 font-semibold">Lasts:</span> {sauce.mealPrep.lasts}</p>
              <p><span className="text-neutral-500 font-semibold">Serving:</span> {sauce.mealPrep.reheat}</p>
            </div>
          </div>
        )}

        {/* Nutrition */}
        <div className="mt-6 bg-neutral-900/50 border border-neutral-800 rounded-xl p-4">
          <h2 className="text-sm font-bold text-white mb-2">Nutrition (whole batch)</h2>
          <div className="flex gap-4 text-xs text-neutral-400">
            <span><span className="text-amber-400 font-bold">{sauce.protein}g</span> protein</span>
            <span><span className="text-white font-bold">{sauce.calories}</span> cal total</span>
            <span><span className="text-white font-bold">~{sauce.caloriesPerServing}</span> cal/serving</span>
            <span><span className="text-white font-bold">{sauce.servings}</span> servings</span>
          </div>
        </div>

        {/* Related — Dinner Recipes + Back to Cookbook */}
        <div className="mt-10">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-4">
            Try It With
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {liveRecipes
              .filter((r) => r.pillar === "Protein Meals")
              .slice(0, 2)
              .map((r) => (
                <Link
                  key={r.id}
                  to={`/recipes/${r.slug}`}
                  className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-amber-500/30 transition-colors block"
                >
                  <img
                    src={r.image}
                    alt={r.title}
                    className="w-full h-36 object-cover"
                    loading="lazy"
                  />
                  <div className="p-3">
                    <h3 className="text-white font-bold text-sm leading-tight">
                      {r.title}
                    </h3>
                    <div className="flex gap-2 mt-2 text-[10px] text-neutral-500">
                      <span className="text-amber-400 font-bold">{r.protein}g protein</span>
                      <span>{r.calories} cal</span>
                      <span>{r.time}</span>
                    </div>
                  </div>
                </Link>
              ))}

            {/* Back to all cookbook items */}
            <Link
              to="/cookbook"
              className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-amber-500/30 transition-colors flex items-center justify-center"
            >
              <div className="p-6 text-center">
                <span className="text-amber-500 text-2xl font-black block mb-2">&larr;</span>
                <h3 className="text-white font-bold text-sm">All Cookbook Recipes</h3>
                <p className="text-neutral-500 text-[10px] mt-1">Sauces, breakfasts, and more</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
