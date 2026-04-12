import { Link } from "react-router-dom";

const pillarColors = {
  "Protein Meals": "text-amber-500",
  "Sauce Systems": "text-red-500",
  "Cooking Techniques": "text-blue-400",
};

const splitLabels = {
  full: { text: "Split Friendly", className: "font-bold bg-gradient-to-r from-red-500 to-green-500 bg-clip-text text-transparent" },
  "easy-swap": { text: "Easy Kid Swap", className: "text-green-400 font-semibold" },
  "adult-only": { text: "Adult Only", className: "text-red-400 font-semibold" },
};

export default function RecipeCard({ recipe }) {
  const ppc = ((recipe.protein / recipe.calories) * 100).toFixed(0);
  const split = splitLabels[recipe.splitFriendly];

  return (
    <Link to={`/recipes/${recipe.slug}`} className="block">
      <article className="bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-800
                   hover:border-amber-500/50 hover:-translate-y-0.5 transition-all cursor-pointer group h-full">
        <div className="relative">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-48 object-cover group-hover:brightness-110 transition-all"
            loading="lazy"
          />
          {/* Protein badge */}
          <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm rounded-lg px-2.5 py-1.5 text-center">
            <div className="text-amber-400 font-black text-lg leading-none">{recipe.protein}g</div>
            <div className="text-neutral-400 text-[10px] uppercase tracking-wider">protein</div>
          </div>
          {/* Pillar tag */}
          <div className="absolute bottom-3 left-3">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm ${pillarColors[recipe.pillar] || "text-neutral-400"}`}>
              {recipe.pillar}
            </span>
          </div>
          {/* Split badge */}
          {split && (
            <div className="absolute top-3 left-3">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm text-white">
                {split.text}
              </span>
            </div>
          )}
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500">{recipe.category}</span>
            <span className="text-xs text-neutral-500">{recipe.time}</span>
          </div>
          <h2 className="text-lg font-bold text-white mb-1 group-hover:text-amber-400 transition-colors">{recipe.title}</h2>
          <p className="text-sm text-neutral-400 leading-relaxed line-clamp-2">{recipe.description}</p>
          <div className="flex items-center gap-3 mt-4 pt-3 border-t border-neutral-800 text-xs text-neutral-500">
            <span>{recipe.calories} cal</span>
            <span className="text-neutral-700">|</span>
            <span>{recipe.protein}g protein</span>
            <span className="text-neutral-700">|</span>
            <span className="text-amber-500 font-bold">{ppc}% PPC</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
