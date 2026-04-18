import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import track from "../hooks/useTrack";
import { liveRecipes } from "../data/recipes";

const pillarColors = {
  "Protein Meals": "text-amber-500 bg-amber-500/10 border-amber-500/30",
  "Sauce Systems": "text-red-500 bg-red-500/10 border-red-500/30",
  "Cooking Techniques": "text-blue-400 bg-blue-400/10 border-blue-400/30",
};

export default function RecipeDetail({ recipe }) {
  const [mode, setMode] = useState("adult");
  const [adults, setAdults] = useState(2);
  const [kids, setKids] = useState(2);
  const [leftovers, setLeftovers] = useState(false);
  const hasSplit = !!recipe.splitCook;
  const isSplit = hasSplit && mode === "split";
  const baseServings = recipe.servings || 4;
  const totalServings = adults + kids;
  const scale = (totalServings / baseServings) * (leftovers ? 2 : 1);
  const ppc = ((recipe.protein * 4 / recipe.calories) * 100).toFixed(0);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Back nav */}
      <div className="border-b border-neutral-800 sticky top-0 z-10 bg-neutral-950/90 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-neutral-500 hover:text-amber-400 transition-colors text-sm font-semibold"
          >
            <img src="/images/favicon.png" alt="" className="w-5 h-5" />
            The Split Plate
          </Link>
          <span
            className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
              pillarColors[recipe.pillar] || ""
            }`}
          >
            {recipe.pillar}
          </span>
        </div>
      </div>

      <article className="max-w-3xl mx-auto px-4 py-8">
        {/* Hero image */}
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-64 sm:h-80 object-cover rounded-2xl"
        />

        {/* Title block */}
        <div className="mt-6">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
              {recipe.category}
            </span>
            {hasSplit && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gradient-to-r from-red-900/50 to-green-900/50 border border-neutral-700 text-neutral-300">
                Split Cook Method&trade;
              </span>
            )}
          </div>
          {recipe.role && (
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              {recipe.role}
            </span>
          )}
          <h1 className="text-3xl font-black text-white mt-1">
            {recipe.title}
          </h1>
          {recipe.makeThisWhen && (
            <div className="mt-3 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3">
              <span className="text-amber-500 text-xs font-bold uppercase tracking-wider">Make This When</span>
              <p className="text-amber-100/90 text-sm mt-1 leading-relaxed">{recipe.makeThisWhen}</p>
            </div>
          )}
          {recipe.hook && (
            <p className="text-neutral-300 mt-3 text-sm leading-relaxed">
              {recipe.hook}
            </p>
          )}
          <p className="text-neutral-500 mt-2 leading-relaxed text-xs">
            {recipe.description}
          </p>

          {/* Family size picker */}
          <div className="flex items-center gap-4 mt-5 bg-neutral-900/50 border border-neutral-800 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-neutral-500 text-[10px]">Adults</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((n) => (
                  <button key={n} onClick={() => setAdults(n)}
                    className={`w-7 h-7 rounded text-xs font-bold cursor-pointer transition-all ${adults === n ? "bg-red-500 text-white" : "bg-neutral-800 text-neutral-500 hover:bg-neutral-700"}`}
                  >{n}</button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-500 text-[10px]">Kids</span>
              <div className="flex gap-1">
                {[0, 1, 2, 3].map((n) => (
                  <button key={n} onClick={() => setKids(n)}
                    className={`w-7 h-7 rounded text-xs font-bold cursor-pointer transition-all ${kids === n ? "bg-green-500 text-white" : "bg-neutral-800 text-neutral-500 hover:bg-neutral-700"}`}
                  >{n}</button>
                ))}
              </div>
            </div>
            <button
              onClick={() => setLeftovers(!leftovers)}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-all ${leftovers ? "bg-amber-500 text-black" : "bg-neutral-800 text-neutral-500 hover:bg-neutral-700"}`}
            >
              <span className={`w-2.5 h-2.5 rounded-sm border ${leftovers ? "bg-black border-black" : "border-neutral-600"} flex items-center justify-center text-[7px]`}>{leftovers ? "\u2713" : ""}</span>
              Leftovers
            </button>
            {scale !== 1 && (
              <span className="text-amber-400 text-[10px] font-bold ml-auto">Ingredients scaled {leftovers ? "(2x for leftovers)" : ""}</span>
            )}
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-3 mt-4">
            <Stat label="Time" value={recipe.time} />
            <Stat label="Servings" value={totalServings} />
            <Stat label="Cal/serving" value={recipe.calories} />
            <Stat label="Protein/serving" value={`${recipe.protein}g`} highlight />
            <Stat label="PPC" value={`${ppc}%`} highlight />
          </div>
        </div>

        {/* Mode Toggle */}
        {hasSplit && (
          <div className="mt-8 bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Mode
              </h2>
              {recipe.splitCook.splitRatio && (
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider">
                  Split: {recipe.splitCook.splitRatio}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setMode("adult")}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                  mode === "adult"
                    ? "bg-amber-500 text-black"
                    : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
                }`}
              >
                Adult Mode
              </button>
              <button
                onClick={() => setMode("split")}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                  mode === "split"
                    ? "bg-gradient-to-r from-red-600 to-green-600 text-white"
                    : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
                }`}
              >
                Kids + Adult Mode
              </button>
            </div>
          </div>
        )}

        {/* Why Most Versions Fail + Why This Works */}
        {(recipe.whyMostFail || recipe.whyThisWorks || recipe.whyItWorks) && (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recipe.whyMostFail && (
              <section className="bg-red-950/20 border border-red-900/40 rounded-xl p-5">
                <h2 className="text-sm font-bold uppercase tracking-wider text-red-400 mb-3">
                  Why Most Versions Fail
                </h2>
                <ul className="space-y-2">
                  {recipe.whyMostFail.map((r, i) => (
                    <li key={i} className="text-sm text-neutral-300 flex gap-2">
                      <span className="text-red-400 flex-shrink-0">&#10005;</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {recipe.whyThisWorks ? (
              <section className="bg-green-950/20 border border-green-900/40 rounded-xl p-5">
                <h2 className="text-sm font-bold uppercase tracking-wider text-green-400 mb-3">
                  Why This Version Works
                </h2>
                <ul className="space-y-2">
                  {recipe.whyThisWorks.map((r, i) => (
                    <li key={i} className="text-sm text-neutral-300 flex gap-2">
                      <span className="text-green-400 flex-shrink-0">&#10003;</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </section>
            ) : recipe.whyItWorks ? (
              <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
                <h2 className="text-sm font-bold uppercase tracking-wider text-amber-500 mb-2">
                  Why It Works
                </h2>
                <p className="text-neutral-300 text-sm leading-relaxed">{recipe.whyItWorks}</p>
              </section>
            ) : null}
          </div>
        )}

        {/* ═══ SPLIT COOK VIEW ═══ */}
        {isSplit ? (
          <SplitCookView recipe={recipe} scale={scale} />
        ) : (
          /* ═══ STANDARD VIEW ═══ */
          <>
            <section className="mt-8">
              <h2 className="text-xl font-bold text-white mb-3">Ingredients</h2>
              <IngredientList items={recipe.ingredients} scale={scale} />
            </section>
            <section className="mt-8">
              <h2 className="text-xl font-bold text-white mb-3">Method</h2>
              <StepList steps={recipe.steps.map((s) => (typeof s === "string" ? { text: s } : s))} startAt={1} />
            </section>
          </>
        )}

        {/* Execution Rules */}
        {recipe.executionRules && recipe.executionRules.length > 0 && (
          <section className="mt-8 bg-red-950/30 border border-red-900/50 rounded-xl p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-red-400 mb-3">
              Execution Rules (Non-Negotiable)
            </h2>
            <ul className="space-y-2">
              {recipe.executionRules.map((r, i) => (
                <li key={i} className="text-sm text-neutral-300 flex gap-2">
                  <span className="text-red-400 flex-shrink-0">&#10005;</span>
                  {r}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Legacy mistakes (for recipes without executionRules) */}
        {!recipe.executionRules && recipe.mistakes && recipe.mistakes.length > 0 && (
          <section className="mt-8 bg-red-950/30 border border-red-900/50 rounded-xl p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-red-400 mb-3">
              Mistakes to Avoid
            </h2>
            <ul className="space-y-2">
              {recipe.mistakes.map((m, i) => (
                <li key={i} className="text-sm text-neutral-300 flex gap-2">
                  <span className="text-red-400 flex-shrink-0">&#10005;</span>
                  {m}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Troubleshooting — If This Goes Wrong */}
        {recipe.troubleshooting && recipe.troubleshooting.length > 0 && (
          <section className="mt-8 bg-amber-950/20 border border-amber-900/40 rounded-xl p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400 mb-3">
              If This Goes Wrong
            </h2>
            <div className="space-y-3">
              {recipe.troubleshooting.map((t, i) => (
                <div key={i} className="text-sm">
                  <p className="text-white font-semibold">{t.problem}</p>
                  <p className="text-neutral-400 mt-0.5">{t.fix}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Variations (only in adult mode) */}
        {recipe.variations && recipe.variations.length > 0 && !isSplit && (
          <section className="mt-8 bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-blue-400 mb-3">
              Variations
            </h2>
            <ul className="space-y-2">
              {recipe.variations.map((v, i) => (
                <li key={i} className="text-sm text-neutral-300 flex gap-2">
                  <span className="text-blue-400 flex-shrink-0">&#10148;</span>
                  {v}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Brands */}
        {recipe.brands && recipe.brands.length > 0 && (
          <section className="mt-8">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-3">
              Brands I Use
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {recipe.brands.map((b, i) => {
                const inner = (
                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-amber-500/30 transition-colors">
                    {b.image && (
                      <div className="bg-white p-3 flex items-center justify-center h-32">
                        <img src={b.image} alt={b.name} className="max-h-full max-w-full object-contain" loading="lazy" />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="text-amber-400 font-black text-sm">{b.name}</div>
                      <div className="text-white text-xs font-semibold mt-0.5">{b.item}</div>
                      <div className="text-neutral-500 text-xs mt-1.5 leading-relaxed">{b.why}</div>
                    </div>
                  </div>
                );
                return b.url ? (
                  <a key={i} href={b.url} target="_blank" rel="noopener noreferrer" onClick={() => track("brand_click", { brand: b.name, item: b.item, url: b.url })} className="block">
                    {inner}
                  </a>
                ) : (
                  <div key={i}>{inner}</div>
                );
              })}
            </div>
          </section>
        )}

        {/* Related Recipes */}
        <RelatedRecipes current={recipe} />

        {/* Meal Prep */}
        {recipe.mealPrep && (
          <section className="mt-8 bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-amber-500 mb-3">
              Meal Prep
            </h2>
            <div className="space-y-2 text-sm text-neutral-300">
              <p><span className="text-neutral-500 font-semibold">Storage:</span> {recipe.mealPrep.storage}</p>
              <p><span className="text-neutral-500 font-semibold">Reheat:</span> {recipe.mealPrep.reheat}</p>
              <p><span className="text-neutral-500 font-semibold">Lasts:</span> {recipe.mealPrep.lasts}</p>
            </div>
          </section>
        )}

        {/* Tags */}
        <div className="flex gap-2 flex-wrap mt-8 mb-8">
          {recipe.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-neutral-800 text-neutral-500 px-2.5 py-1 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      </article>
    </div>
  );
}

/* ════════════════════════════════════════════
   SPLIT COOK VIEW
   ════════════════════════════════════════════ */

function SplitCookView({ recipe, scale = 1 }) {
  const sc = recipe.splitCook;
  const [kidOption, setKidOption] = useState(0);
  const hasKidOptions = sc.kid.options && sc.kid.options.length > 0;

  return (
    <>
      {/* Shared Ingredients */}
      <section className="mt-8">
        <h2 className="text-xl font-bold text-white mb-3">
          Shared Ingredients
        </h2>
        <IngredientList items={sc.sharedIngredients} scale={scale} />
      </section>

      {/* Adult + Kid ingredients side by side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        <section>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-red-400">
              {sc.adult.label}
            </h3>
          </div>
          <IngredientList items={sc.adult.extraIngredients} accent="red" scale={scale} />
          <div className="flex gap-3 mt-2">
            <MiniStat label="Protein" value={`${sc.adult.protein}g`} />
            <MiniStat label="Cal" value={sc.adult.calories} />
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-green-400">
              {sc.kid.label}
            </h3>
          </div>
          {hasKidOptions ? (
            <>
              {/* Kid option tabs */}
              <div className="flex gap-1 mb-2">
                {sc.kid.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => setKidOption(i)}
                    className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      kidOption === i
                        ? "bg-green-600 text-white"
                        : "bg-neutral-800 text-neutral-500 hover:bg-neutral-700"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <IngredientList
                items={sc.kid.options[kidOption].extraIngredients}
                accent="green"
                scale={scale}
              />
            </>
          ) : (
            <IngredientList items={sc.kid.extraIngredients || []} accent="green" scale={scale} />
          )}
          {sc.kid.protein && (
            <div className="flex gap-3 mt-2">
              <MiniStat label="Protein" value={`${sc.kid.protein}g`} />
              <MiniStat label="Cal" value={sc.kid.calories} />
            </div>
          )}
        </section>
      </div>

      {/* Protein Swap callout */}
      {sc.kid.proteinSwap && (
        <div className="mt-4 bg-green-950/30 border border-green-900/50 rounded-lg p-3">
          <span className="text-xs font-bold uppercase tracking-wider text-green-400">
            Protein Swap
          </span>
          <p className="text-sm text-neutral-300 mt-1">{sc.kid.proteinSwap}</p>
        </div>
      )}

      {/* ── PHASE 1: Shared Base ── */}
      <section className="mt-10">
        <PhaseHeader
          label="Phase 1 — Shared Base"
          color="amber"
          subtitle="Cook once — works for everyone. No spice here, no complexity."
        />
        <StepList steps={sc.sharedSteps} startAt={1} />
      </section>

      {/* ── SPLIT POINT ── */}
      <div className="my-10 relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t-2 border-dashed border-neutral-600" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-neutral-950 px-5 py-2.5 rounded-full border-2 border-amber-500/50 text-sm font-black text-white uppercase tracking-wider">
            Split Point
          </span>
        </div>
      </div>
      <p className="text-center text-neutral-400 text-sm mb-2 -mt-6">
        {sc.splitPoint}
      </p>
      {sc.splitRatio && (
        <p className="text-center text-amber-500/70 text-xs font-bold mb-2">
          {sc.splitRatio}
        </p>
      )}
      <p className="text-center text-neutral-600 text-xs font-semibold italic mb-8">
        Cook once. Split smart. Done.
      </p>

      {/* ── PHASE 2: Adult + Kid side by side ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Adult path */}
        <section>
          <PhaseHeader label={sc.adult.label} color="red" />
          <StepList
            steps={sc.adult.steps}
            startAt={sc.sharedSteps.length + 1}
            accent="red"
          />
        </section>

        {/* Kid path */}
        <section>
          <PhaseHeader label={sc.kid.label} color="green" />

          {hasKidOptions ? (
            <>
              <div className="flex gap-1 mb-4">
                {sc.kid.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => setKidOption(i)}
                    className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      kidOption === i
                        ? "bg-green-600 text-white"
                        : "bg-neutral-800 text-neutral-500 hover:bg-neutral-700"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <StepList
                steps={sc.kid.options[kidOption].steps}
                startAt={sc.sharedSteps.length + 1}
                accent="green"
              />
            </>
          ) : (
            <StepList
              steps={(sc.kid.steps || []).map((s) =>
                typeof s === "string" ? { text: s } : s
              )}
              startAt={sc.sharedSteps.length + 1}
              accent="green"
            />
          )}
        </section>
      </div>
    </>
  );
}

/* ════════════════════════════════════════════
   SUB-COMPONENTS
   ════════════════════════════════════════════ */

function StepImages({ images }) {
  const [expanded, setExpanded] = useState(null);
  if (!images || images.length === 0) return null;
  return (
    <>
      <div className="flex gap-2 mt-3 overflow-x-auto pb-2 -mx-1 px-1">
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt=""
            className="w-28 h-28 sm:w-32 sm:h-32 object-cover rounded-lg flex-shrink-0 border border-neutral-800 cursor-pointer hover:border-amber-500/50 transition-colors"
            loading="lazy"
            onClick={() => setExpanded(src)}
          />
        ))}
      </div>
      {expanded && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setExpanded(null)}
        >
          <img src={expanded} alt="" className="max-w-full max-h-[90vh] object-contain rounded-xl" />
          <button className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl font-bold">&times;</button>
        </div>
      )}
    </>
  );
}

function StepList({ steps, startAt = 1, accent }) {
  const bgColor =
    accent === "red"
      ? "bg-red-600"
      : accent === "green"
        ? "bg-green-600"
        : "bg-amber-500";
  const textColor =
    accent === "red" || accent === "green" ? "text-white" : "text-black";
  const labelColor =
    accent === "red"
      ? "text-red-400"
      : accent === "green"
        ? "text-green-400"
        : "text-amber-400";

  return (
    <ol className="space-y-5">
      {steps.map((step, i) => {
        const stepObj = typeof step === "string" ? { text: step } : step;
        const colonIdx = stepObj.text.indexOf(":");
        const hasLabel =
          colonIdx > 0 &&
          colonIdx < 30 &&
          stepObj.text[0] === stepObj.text[0].toUpperCase();
        const label = hasLabel ? stepObj.text.slice(0, colonIdx) : null;
        const body = hasLabel
          ? stepObj.text.slice(colonIdx + 1).trim()
          : stepObj.text;

        return (
          <li key={i} className="flex gap-3">
            <span
              className={`flex-shrink-0 w-7 h-7 rounded-full ${bgColor} ${textColor} flex items-center justify-center text-xs font-black mt-0.5`}
            >
              {startAt + i}
            </span>
            <div className="flex-1 min-w-0">
              {label && (
                <span
                  className={`${labelColor} font-bold text-xs uppercase tracking-wider block mb-1`}
                >
                  {label}
                </span>
              )}
              <p className="text-neutral-300 text-sm leading-relaxed">{body}</p>
              <StepImages images={stepObj.images} />
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function parseFrac(s) {
  s = s.trim();
  // "1/2" → 0.5, "3/4" → 0.75
  if (s.includes("/")) {
    const [num, den] = s.split("/").map(Number);
    return den ? num / den : parseFloat(s);
  }
  return parseFloat(s);
}

function formatNum(n) {
  // Try to express as a clean fraction if close
  const fracs = [[0.25, "1/4"], [0.33, "1/3"], [0.5, "1/2"], [0.67, "2/3"], [0.75, "3/4"]];
  const whole = Math.floor(n);
  const remainder = n - whole;
  if (remainder < 0.05) return whole.toString();
  for (const [val, str] of fracs) {
    if (Math.abs(remainder - val) < 0.05) {
      return whole > 0 ? `${whole} ${str}` : str;
    }
  }
  const rounded = Math.round(n * 10) / 10;
  return rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(1);
}

function scaleIngredientText(text, scale) {
  if (scale === 1) return text;
  // Match leading quantities: "24", "1.25", "2-2.5", "1/2", "3/4"
  return text.replace(/^(\d+\/\d+|\d+(?:\.\d+)?(?:\s*[-–]\s*(?:\d+\/\d+|\d+(?:\.\d+)?))?)/g, (match) => {
    // Handle ranges like "2-2.5" or "1/2-3/4"
    if (/[-–]/.test(match) && !match.startsWith("-")) {
      const parts = match.split(/\s*[-–]\s*/).map((p) => formatNum(parseFrac(p) * scale));
      return parts.join("–");
    }
    return formatNum(parseFrac(match) * scale);
  });
}

function IngredientList({ items, accent, scale = 1 }) {
  const headerColor =
    accent === "red"
      ? "text-red-400"
      : accent === "green"
        ? "text-green-400"
        : "text-amber-500";

  return (
    <ul className="bg-neutral-900 rounded-xl border border-neutral-800 divide-y divide-neutral-800">
      {items.map((item, i) => {
        const isHeader = item.startsWith("---");
        const isNote = item.startsWith("  ");
        if (isHeader) {
          return (
            <li
              key={i}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider bg-neutral-900/50 ${headerColor}`}
            >
              {item.replace(/---/g, "").trim()}
            </li>
          );
        }
        return (
          <li
            key={i}
            className={`px-4 py-2.5 text-sm ${
              isNote ? "text-neutral-500 pl-8 italic" : "text-neutral-300"
            }`}
          >
            {isHeader || isNote ? item : scaleIngredientText(item, scale)}
            {scale !== 1 && !isHeader && !isNote && <span className="text-amber-500/40 text-[10px] ml-1">scaled</span>}
          </li>
        );
      })}
    </ul>
  );
}

function PhaseHeader({ label, color, subtitle }) {
  const colors = {
    amber: "border-amber-500/50 text-amber-400",
    red: "border-red-500/50 text-red-400",
    green: "border-green-500/50 text-green-400",
  };
  const c = colors[color] || colors.amber;
  return (
    <div className={`border-l-4 ${c.split(" ")[0]} pl-4 mb-4`}>
      <h3
        className={`font-bold text-sm uppercase tracking-wider ${c.split(" ")[1]}`}
      >
        {label}
      </h3>
      {subtitle && (
        <p className="text-neutral-500 text-xs mt-0.5">{subtitle}</p>
      )}
    </div>
  );
}

function Stat({ label, value, highlight }) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2 text-center min-w-[70px]">
      <div
        className={`font-black text-lg ${
          highlight ? "text-amber-400" : "text-white"
        }`}
      >
        {value}
      </div>
      <div className="text-neutral-500 text-xs uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
}

function RelatedRecipes({ current }) {
  const related = useMemo(() => {
    const dinners = liveRecipes.filter(
      (r) => r.pillar === "Protein Meals" && r.id !== current.id
    );
    // Prefer different proteinAnchor for variety
    const different = dinners.filter(
      (r) => r.proteinAnchor !== current.proteinAnchor
    );
    const pool = different.length >= 2 ? different : dinners;
    // Shuffle deterministically based on current id
    const sorted = [...pool].sort(
      (a, b) => ((a.id * 7 + current.id) % 13) - ((b.id * 7 + current.id) % 13)
    );
    return sorted.slice(0, 2);
  }, [current.id, current.proteinAnchor]);

  return (
    <section className="mt-10">
      <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-4">
        Related Recipes
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {related.map((r) => (
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

        {/* Power-up: Money Mustard */}
        <Link
          to="/cookbook/money-mustard"
          className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-amber-500/30 transition-colors block"
        >
          <div className="h-36 bg-amber-500/10 flex items-center justify-center">
            <span className="text-amber-500 text-3xl font-black">+</span>
          </div>
          <div className="p-3">
            <h3 className="text-white font-bold text-sm leading-tight">
              Money Mustard
            </h3>
            <div className="flex gap-2 mt-2 text-[10px] text-neutral-500">
              <span className="text-amber-400 font-bold">Power-Up</span>
              <span>Pairs with everything</span>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="bg-neutral-800 rounded px-2.5 py-1 text-center">
      <span className="text-white font-bold text-xs">{value}</span>
      <span className="text-neutral-500 text-[10px] ml-1">{label}</span>
    </div>
  );
}
