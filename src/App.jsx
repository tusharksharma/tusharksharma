import { useState, useMemo, useRef } from "react";
import recipes, { categories, pillars } from "./data/recipes";
import RecipeCard from "./components/RecipeCard";
import RecipeDetail from "./components/RecipeDetail";

const FEATURED_IDS = [1, 2, 3, 4];
const QUICK_WIN_IDS = [6, 7, 3]; // fast meals under 20 min

const BROWSE_SYSTEMS = {
  "Protein Anchor": {
    Chicken: ["chicken"],
    Beef: ["beef", "steak", "tri-tip", "flank"],
    Any: [],
  },
  "Meal Type": {
    Pasta: ["pasta", "penne", "rotini", "gnocchi", "noodles"],
    "Rice Bowls": ["rice", "bowl"],
    Wraps: ["wrap", "lavash", "slider"],
  },
  "Flavor Direction": {
    "Smoky Southwest": ["southwest", "smoky", "chipotle"],
    "Creamy Comfort": ["creamy", "comfort", "cream", "cottage"],
    "Spicy Asian": ["asian", "stir-fry", "general tso"],
  },
};

function App() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activePillar, setActivePillar] = useState("All");
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [browseTag, setBrowseTag] = useState(null);
  const recipesRef = useRef(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return recipes.filter((r) => {
      const matchesCategory =
        activeCategory === "All" || r.category === activeCategory;
      const matchesPillar =
        activePillar === "All" || r.pillar === activePillar;
      const matchesSearch =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.tags.some((t) => t.includes(q)) ||
        r.ingredients.some((i) => i.toLowerCase().includes(q));
      return matchesCategory && matchesPillar && matchesSearch;
    });
  }, [search, activeCategory, activePillar]);

  const browseFiltered = useMemo(() => {
    if (!browseTag) return [];
    return recipes.filter((r) => {
      const haystack = `${r.title} ${r.description} ${r.tags.join(" ")} ${r.category} ${r.ingredients.join(" ")}`.toLowerCase();
      return browseTag.some((kw) => haystack.includes(kw));
    });
  }, [browseTag]);

  const isFiltering =
    search || activeCategory !== "All" || activePillar !== "All";

  if (selectedRecipe) {
    return (
      <RecipeDetail
        recipe={selectedRecipe}
        onBack={() => setSelectedRecipe(null)}
      />
    );
  }

  const featured = recipes.filter((r) => FEATURED_IDS.includes(r.id));
  const quickWins = recipes.filter((r) => QUICK_WIN_IDS.includes(r.id));

  const scrollToRecipes = () => {
    recipesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleBrowseTag = (keywords) => {
    setBrowseTag(keywords.length > 0 ? keywords : null);
    setTimeout(() => {
      recipesRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* ═══════════════════════════════════════
          1. HERO — Above the fold
          ═══════════════════════════════════════ */}
      <section className="border-b border-neutral-800">
        <div className="max-w-5xl mx-auto px-4 py-16 sm:py-24 text-center">
          <p className="text-amber-500 font-black text-sm tracking-[0.3em] uppercase mb-4">
            The Split Plate
          </p>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.1]">
            One Meal. Two Outcomes.
            <br />
            <span className="text-amber-400">No Extra Work.</span>
          </h1>
          <p className="text-neutral-400 mt-6 text-lg max-w-2xl mx-auto leading-relaxed">
            Cook once. Split smart. High-protein meals that work for both adults
            and kids — without doubling effort.
          </p>
          <p className="text-neutral-500 mt-3 text-sm">
            Protein stays high. Flavor stays bold. Execution stays simple.
          </p>
          <div className="flex gap-3 justify-center mt-8 flex-wrap">
            <button
              onClick={scrollToRecipes}
              className="px-6 py-3 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-colors cursor-pointer text-sm"
            >
              Browse Recipes
            </button>
            <button
              onClick={() => setSelectedRecipe(recipes[0])}
              className="px-6 py-3 bg-neutral-800 text-white font-bold rounded-xl border border-neutral-700 hover:bg-neutral-700 transition-colors cursor-pointer text-sm"
            >
              Try the Flagship Recipe
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          2. HOW IT WORKS — Split Cook Method
          ═══════════════════════════════════════ */}
      <section className="border-b border-neutral-800 bg-neutral-900/50">
        <div className="max-w-5xl mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500 mb-2">
              Your Unfair Advantage
            </p>
            <h2 className="text-3xl font-black text-white">
              The Split Cook Method&trade;
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <StepCard
              num="1"
              color="amber"
              title="Cook the Base"
              desc="Protein + carbs + foundation. No spice. No complexity."
            />
            <StepCard
              num="2"
              color="white"
              title="Split"
              desc="Divide into two pans at the right moment."
              isSplit
            />
            <StepCard
              num="3"
              color="red"
              title="Adult Finish"
              desc="Bold flavor. Spice. Full experience."
            />
            <StepCard
              num="4"
              color="green"
              title="Kid Finish"
              desc="Mild. Simple. Familiar."
            />
          </div>

          <p className="text-center text-neutral-500 text-sm mt-8">
            One workflow. Two outcomes. Zero extra time.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          3. FEATURED RECIPES
          ═══════════════════════════════════════ */}
      <section className="border-b border-neutral-800" ref={recipesRef}>
        <div className="max-w-6xl mx-auto px-4 py-16">
          <SectionHeader title="Featured Recipes" />

          {/* Search bar */}
          <input
            type="text"
            placeholder="Search recipes, ingredients, tags..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setBrowseTag(null);
            }}
            className="w-full px-4 py-3 rounded-xl border border-neutral-700 bg-neutral-900 text-white
                       placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500
                       focus:border-transparent text-base mb-4"
          />

          {/* Filters */}
          <div className="flex gap-2 flex-wrap mb-2">
            {["All", ...categories].map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setBrowseTag(null);
                }}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors cursor-pointer
                  ${
                    activeCategory === cat && !browseTag
                      ? "bg-amber-500 text-black"
                      : "bg-neutral-800 text-neutral-400 border border-neutral-700 hover:bg-neutral-700 hover:text-white"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap mb-6">
            {["All", ...pillars].map((p) => (
              <button
                key={p}
                onClick={() => {
                  setActivePillar(p);
                  setBrowseTag(null);
                }}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer
                  ${
                    activePillar === p && !browseTag
                      ? "bg-red-600 text-white"
                      : "bg-neutral-900 text-neutral-500 border border-neutral-800 hover:bg-neutral-800 hover:text-neutral-300"
                  }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Results */}
          {browseTag ? (
            browseFiltered.length === 0 ? (
              <Empty />
            ) : (
              <RecipeGrid
                recipes={browseFiltered}
                onSelect={setSelectedRecipe}
              />
            )
          ) : isFiltering ? (
            filtered.length === 0 ? (
              <Empty />
            ) : (
              <RecipeGrid
                recipes={filtered}
                onSelect={setSelectedRecipe}
              />
            )
          ) : (
            <RecipeGrid recipes={featured} onSelect={setSelectedRecipe} />
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          4. BROWSE BY SYSTEM
          ═══════════════════════════════════════ */}
      <section className="border-b border-neutral-800 bg-neutral-900/30">
        <div className="max-w-5xl mx-auto px-4 py-16">
          <SectionHeader
            title="Browse by System"
            subtitle="Not categories. Systems."
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {Object.entries(BROWSE_SYSTEMS).map(([group, tags]) => (
              <div key={group}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
                  {group}
                </h3>
                <div className="space-y-2">
                  {Object.entries(tags).map(([label, keywords]) => (
                    <button
                      key={label}
                      onClick={() => handleBrowseTag(keywords)}
                      className="w-full text-left px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg
                                 hover:border-amber-500/50 hover:bg-neutral-800 transition-all cursor-pointer group"
                    >
                      <span className="text-white font-semibold text-sm group-hover:text-amber-400 transition-colors">
                        {label}
                      </span>
                      <span className="text-neutral-600 text-xs ml-2">
                        {
                          recipes.filter((r) => {
                            if (keywords.length === 0) return true;
                            const h = `${r.title} ${r.description} ${r.tags.join(" ")} ${r.category} ${r.ingredients.join(" ")}`.toLowerCase();
                            return keywords.some((kw) => h.includes(kw));
                          }).length
                        }{" "}
                        recipes
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          5. REAL LIFE — Trust builder
          ═══════════════════════════════════════ */}
      <section className="border-b border-neutral-800">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <SectionHeader title="Built for Real Life" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
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

      {/* ═══════════════════════════════════════
          6. QUICK WINS — Reduce friction
          ═══════════════════════════════════════ */}
      <section className="border-b border-neutral-800 bg-neutral-900/30">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <SectionHeader
            title="Start Here"
            subtitle="15-20 minute meals. Fast, high success rate. Zero friction."
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {quickWins.map((r) => (
              <RecipeCard
                key={r.id}
                recipe={r}
                onClick={() => setSelectedRecipe(r)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          7. PHILOSOPHY — Short
          ═══════════════════════════════════════ */}
      <section className="border-b border-neutral-800">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-black text-white">Why This Works</h2>
          <p className="text-neutral-500 mt-4 text-sm">
            Most high-protein food fails because it's bland, repetitive, and
            unrealistic.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            <PhilosophyPill label="Texture Contrast" />
            <PhilosophyPill label="Controlled Calories" />
            <PhilosophyPill label="Bold Flavor" />
            <PhilosophyPill label="Simple Execution" />
          </div>
          <p className="text-neutral-400 mt-8 text-sm italic max-w-lg mx-auto">
            "I build high-protein meals that are efficient, flavorful, and
            repeatable — designed for real life, not perfection."
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          8. ALL RECIPES — Full browse
          ═══════════════════════════════════════ */}
      <section className="bg-neutral-900/30">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <SectionHeader
            title="All Recipes"
            subtitle={`${recipes.length} recipes and counting`}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((r) => (
              <RecipeCard
                key={r.id}
                recipe={r}
                onClick={() => setSelectedRecipe(r)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════ */}
      <footer className="border-t border-neutral-800 py-8 text-center text-neutral-600 text-sm">
        <p className="text-amber-500/80 font-black text-xs tracking-[0.2em] uppercase">
          The Split Plate
        </p>
        <p className="text-neutral-500 font-semibold mt-2">
          Protein Meals &middot; Sauce Systems &middot; Cooking Techniques
        </p>
        <p className="mt-2 text-neutral-700">
          Cook once. Split. Done.
        </p>
      </footer>
    </div>
  );
}

/* ════════════════════════════════════════════
   SUB-COMPONENTS
   ════════════════════════════════════════════ */

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-black text-white">{title}</h2>
      {subtitle && (
        <p className="text-neutral-500 text-sm mt-1">{subtitle}</p>
      )}
    </div>
  );
}

function RecipeGrid({ recipes, onSelect }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {recipes.map((r) => (
        <RecipeCard key={r.id} recipe={r} onClick={() => onSelect(r)} />
      ))}
    </div>
  );
}

function Empty() {
  return (
    <div className="text-center py-16 text-neutral-500">
      <p className="text-lg">No recipes found</p>
      <p className="mt-1 text-sm">Try a different search or filter</p>
    </div>
  );
}

function StepCard({ num, color, title, desc, isSplit }) {
  const colors = {
    amber: "border-amber-500/50 text-amber-400",
    red: "border-red-500/50 text-red-400",
    green: "border-green-500/50 text-green-400",
    white: "border-neutral-500/50 text-white",
  };
  const c = colors[color];
  const numBg = isSplit
    ? "bg-gradient-to-r from-red-600 to-green-600 text-white"
    : color === "amber"
      ? "bg-amber-500 text-black"
      : color === "red"
        ? "bg-red-600 text-white"
        : color === "green"
          ? "bg-green-600 text-white"
          : "bg-neutral-600 text-white";

  return (
    <div
      className={`bg-neutral-900 border ${c.split(" ")[0]} rounded-xl p-5 text-center`}
    >
      <div
        className={`w-10 h-10 rounded-full ${numBg} flex items-center justify-center text-sm font-black mx-auto mb-3`}
      >
        {isSplit ? "\u2194" : num}
      </div>
      <h3 className={`font-bold text-sm ${c.split(" ")[1]}`}>{title}</h3>
      <p className="text-neutral-500 text-xs mt-1.5 leading-relaxed">{desc}</p>
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

function PhilosophyPill({ label }) {
  return (
    <div className="bg-neutral-900 border border-amber-500/20 rounded-lg px-3 py-3">
      <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

export default App;
