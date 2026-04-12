import recipes from "../data/recipes";

const SYSTEMS = {
  "Protein Anchor": {
    Chicken: { field: "proteinAnchor", value: "chicken" },
    Beef: { field: "proteinAnchor", value: "beef" },
    Steak: { field: "proteinAnchor", value: "steak" },
  },
  "Meal Type": {
    Pasta: { field: "mealType", value: "pasta" },
    "Rice Bowls": { field: "mealType", value: "rice-bowl" },
    Wraps: { field: "mealType", value: "wrap" },
    Sauces: { field: "mealType", value: "sauce" },
  },
  "Flavor Direction": {
    "Smoky Southwest": { field: "flavorDirection", value: "smoky-southwest" },
    "Creamy Comfort": { field: "flavorDirection", value: "creamy-comfort" },
    "Spicy Asian": { field: "flavorDirection", value: "spicy-asian" },
  },
};

export default function BrowseSystems({ onFilter }) {
  const count = (field, value) =>
    recipes.filter((r) => r[field] === value).length;

  return (
    <section className="border-b border-neutral-800 bg-neutral-900/30">
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="mb-6">
          <h2 className="text-2xl font-black text-white">Browse by System</h2>
          <p className="text-neutral-500 text-sm mt-1">Not categories. Systems.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {Object.entries(SYSTEMS).map(([group, filters]) => (
            <div key={group}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
                {group}
              </h3>
              <div className="space-y-2">
                {Object.entries(filters).map(([label, { field, value }]) => (
                  <button
                    key={label}
                    onClick={() => onFilter(field, value)}
                    className="w-full text-left px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg
                               hover:border-amber-500/50 hover:bg-neutral-800 transition-all cursor-pointer group"
                  >
                    <span className="text-white font-semibold text-sm group-hover:text-amber-400 transition-colors">
                      {label}
                    </span>
                    <span className="text-neutral-600 text-xs ml-2">
                      {count(field, value)} recipes
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
