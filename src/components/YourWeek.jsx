import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import recipes from "../data/recipes";
import GroceryList from "./GroceryList";

const ADULT_OPTIONS = [1, 2, 3, 4];
const KID_OPTIONS = [0, 1, 2, 3];

const WEEKS = {
  // ──────────────────────────────────────────────────────────
  // BALANCE RULE: each week should mix carb levels.
  //   carbLevel on each recipe: "high" (rice/pasta/gnocchi),
  //   "low" (keto tortilla/bun), "none" (no starch).
  //   Target: no week should be all-high or all-low.
  //   Current: 1 high + 1 low + 1 moderate per week.
  // ──────────────────────────────────────────────────────────
  1: {
    label: "Plan A",
    subtitle: "Stir-fry, Chicken Sandwiches, Gnocchi",
    cookDays: [
      { day: "Monday", label: "Fast Win", vibe: "Start easy — lowest friction dinner of the week", id: 4, time: "25 min", reheats: true, adult: "Spicy soy-sesame, charred broccoli, chili oil", kid: "Mild soy, broccoli on side, meatballs", needs: ["Beef", "Broccoli", "Rice", "Soy sauce", "Bone broth"], carbLevel: "high" },
      { day: "Wednesday", label: "Fast Food Night", vibe: "Midweek reset — crispy chicken sandwiches, better than drive-through", id: 23, time: "15 min", reheats: true, adult: "Keto bun, chipotle or Money Mustard, pickles", kid: "Slider buns, plain or ketchup", needs: ["Kirkland chicken fillets", "Keto buns", "Slider buns", "Sauce"], carbLevel: "low" },
      { day: "Friday", label: "Comfort + Protein", vibe: "Finish strong — comfort food that earns its calories", id: 1, time: "30 min", reheats: false, adult: "Spicy fajita cream, peppers, chili oil", kid: "Rao's Alfredo or mild creamy", needs: ["Chicken", "Gnocchi", "Bell peppers", "Cottage cheese", "Dan-O's"], carbLevel: "high" },
    ],
  },
  2: {
    label: "Plan B",
    subtitle: "Smash Tacos, Tri-tip Penne, Air Fryer Chicken",
    cookDays: [
      { day: "Monday", label: "Smash Night", vibe: "Start easy — crispy smash tacos, Caesar finish, 15 min", id: 22, time: "15 min", reheats: true, adult: "Keto tortilla, Caesar, crushed Quest chips", kid: "Street taco tortilla, simple taco, chips on side", needs: ["Ground chicken", "Cheddar", "Keto tortillas", "Romaine", "Caesar dressing"], carbLevel: "low" },
      { day: "Wednesday", label: "Cook Once, Win Twice", vibe: "Midweek reset — creamy pasta, weekend is handled", id: 2, time: "35 min", reheats: true, adult: "Chili cream sauce, Dan-O's, sliced tri-tip", kid: "Mild creamy penne, meatballs, cheese", needs: ["Tri-tip", "Penne", "Spinach", "Cottage cheese", "Beef broth"], carbLevel: "high" },
      { day: "Friday", label: "Hands-Off Win", vibe: "Finish strong — air fryer does the work, you don't", id: 21, time: "25 min", reheats: true, adult: "Outlaw Blackened chicken, cheesy broccoli, Money Mustard", kid: "Original seasoned chicken, broccoli, dinner roll", needs: ["Chicken thighs", "Broccoli", "Dan-O's", "Dinner rolls"], carbLevel: "none" },
    ],
  },
  3: {
    label: "Plan C",
    subtitle: "Golden Rice Bowl, Chicken Sandwiches, Smash Tacos",
    cookDays: [
      { day: "Monday", label: "System Meal", vibe: "Start easy — golden rice reheats all week, steak is fresh in 10 min", id: 24, time: "25 min", reheats: true, adult: "Golden turmeric rice, seared steak, chipotle drizzle", kid: "Rice + steak, no sauce — rice already has flavor", needs: ["Rice", "Bone broth", "Gary's QuickSteak", "Ghee", "Turmeric"], carbLevel: "high" },
      { day: "Wednesday", label: "Fast Food Night", vibe: "Midweek reset — crispy chicken sandwiches, better than drive-through", id: 23, time: "15 min", reheats: true, adult: "Keto bun, chipotle or Money Mustard, pickles", kid: "Slider buns, plain or ketchup", needs: ["Kirkland chicken fillets", "Keto buns", "Slider buns", "Sauce"], carbLevel: "low" },
      { day: "Friday", label: "Smash Night", vibe: "Finish strong — crispy smash tacos, Caesar finish", id: 22, time: "15 min", reheats: true, adult: "Keto tortilla, Caesar, crushed Quest chips", kid: "Street taco tortilla, simple taco, chips on side", needs: ["Ground chicken", "Cheddar", "Keto tortillas", "Romaine", "Caesar dressing"], carbLevel: "low" },
    ],
  },
};

function getLeftoverMsg(hasLeftovers) {
  if (!hasLeftovers) {
    return { tue: "No leftovers — eat out or cook something quick", thu: "No leftovers — eat out or cook something quick", sat: "No leftovers — eat out or cook something quick", sun: "Flexible — eat out or reset" };
  }
  return { tue: "Reheat Monday's dinner — already handled", thu: "Reheat Wednesday's dinner — already handled", sat: "Reheat Friday's dinner — already handled", sun: "Flexible — finish leftovers, eat out, or reset" };
}

function CookDay({ day, label, vibe, id, time, reheats, adult, kid, needs, servings, enabled, onToggle }) {
  const r = recipes.find((x) => x.id === id);
  if (!r) return null;
  return (
    <div className={`transition-all ${enabled ? "" : "opacity-40"}`}>
      <div className="flex items-center gap-2 mb-1 sm:pl-12">
        <button
          onClick={(e) => { e.preventDefault(); onToggle(); }}
          className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center text-[10px] cursor-pointer transition-colors ${
            enabled ? "bg-amber-500 border-amber-500 text-black" : "border-neutral-600 bg-neutral-800"
          }`}
        >
          {enabled && "\u2713"}
        </button>
        <span className="text-neutral-500 text-[10px]">{enabled ? "Included" : "Skipped — removed from grocery"}</span>
      </div>
      <Link to={enabled ? `/recipes/${r.slug}` : "#"} className={`block ${enabled ? "group" : "pointer-events-none"}`}>
        <div className={`bg-neutral-900 border rounded-xl overflow-hidden transition-all ${enabled ? "border-neutral-800 hover:border-amber-500/40" : "border-neutral-800/50"}`}>
          <div className="flex flex-col sm:flex-row">
            <div className="sm:w-40 flex-shrink-0 relative">
              <img src={r.image} alt={r.title} className={`w-full h-32 sm:h-full object-cover transition-all ${enabled ? "group-hover:brightness-110" : "grayscale brightness-50"}`} loading="lazy" />
              <div className="absolute top-2 left-2 flex gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500 text-black">{day}</span>
                {reheats && enabled && <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-green-600/80 text-white">Reheats</span>}
              </div>
            </div>
            <div className="flex-1 p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-amber-500 text-[10px] font-bold uppercase tracking-wider">{label}</span>
                <span className="text-neutral-600 text-[10px]">{time} &middot; {servings} servings</span>
              </div>
              <h3 className={`font-bold text-sm transition-colors ${enabled ? "text-white group-hover:text-amber-400" : "text-neutral-600 line-through"}`}>{r.title}</h3>
              {enabled && vibe && (
                <p className="text-neutral-500 text-[10px] italic mt-0.5">{vibe}</p>
              )}
              {enabled && (
                <>
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-2 items-start">
                      <span className="text-red-400 text-[10px] font-black mt-0.5 w-8 flex-shrink-0">ADULT</span>
                      <p className="text-neutral-400 text-xs">{adult}</p>
                    </div>
                    <div className="flex gap-2 items-start">
                      <span className="text-green-400 text-[10px] font-black mt-0.5 w-8 flex-shrink-0">KID</span>
                      <p className="text-neutral-400 text-xs">{kid}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex gap-1.5 flex-wrap">
                    {needs.map((n) => (
                      <span key={n} className="text-[10px] bg-neutral-800 text-neutral-500 px-2 py-0.5 rounded-full">{n}</span>
                    ))}
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-[10px]">
                    <span className="text-amber-400 font-bold">{r.protein}g protein</span>
                    <span className="text-neutral-700">&middot;</span>
                    <span className="text-neutral-500">{r.calories} cal/serving</span>
                    <span className="text-neutral-700">&middot;</span>
                    <span className="text-neutral-500">{Math.round((r.protein * 4 / r.calories) * 100)}% PPC</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

function LeftoverDay({ day, meal, visible }) {
  if (!visible) return null;
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-neutral-900/30 border border-neutral-800/50 rounded-lg">
      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 w-12 flex-shrink-0">{day}</span>
      <span className="text-xs text-neutral-500">{meal}</span>
      <span className="text-[10px] bg-green-900/30 text-green-600 px-2 py-0.5 rounded-full ml-auto">No cooking</span>
    </div>
  );
}

function FlexDay({ day, meal }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border border-dashed border-neutral-800 rounded-lg">
      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 w-12 flex-shrink-0">{day}</span>
      <span className="text-xs text-neutral-600 italic">{meal}</span>
    </div>
  );
}

export default function YourWeek() {
  const [week, setWeek] = useState(1);
  const [adults, setAdults] = useState(2);
  const [kids, setKids] = useState(2);
  const [leftovers, setLeftovers] = useState(true);
  const [enabledMeals, setEnabledMeals] = useState({ Mon: true, Wed: true, Fri: true });
  const [showFeedback, setShowFeedback] = useState(false);

  const servings = (adults + kids) * (leftovers ? 2 : 1);
  const currentWeek = WEEKS[week];
  const enabledCount = Object.values(enabledMeals).filter(Boolean).length;
  const leftoverMsgs = getLeftoverMsg(leftovers);

  const handleWeekChange = (w) => {
    setWeek(w);
    setEnabledMeals({ Mon: true, Wed: true, Fri: true });
  };

  const toggleMeal = (dayKey) => {
    const current = enabledMeals[dayKey];
    if (current && enabledCount <= 2) return; // guardrail: keep at least 2
    setEnabledMeals((prev) => ({ ...prev, [dayKey]: !prev[dayKey] }));
  };

  const resetMeals = () => setEnabledMeals({ Mon: true, Wed: true, Fri: true });

  const handleFamilyChange = (setter, val) => {
    setter(val);
    setShowFeedback(true);
  };

  useEffect(() => {
    if (showFeedback) {
      const t = setTimeout(() => setShowFeedback(false), 2000);
      return () => clearTimeout(t);
    }
  }, [showFeedback, servings]);

  // Build excluded grocery tags
  const excludedTags = useMemo(() => {
    const tags = [];
    if (!enabledMeals.Mon) tags.push("Mon");
    if (!enabledMeals.Wed) tags.push("Wed");
    if (!enabledMeals.Fri) tags.push("Fri");
    return tags;
  }, [enabledMeals]);

  return (
    <section className="border-b border-neutral-800 bg-gradient-to-b from-neutral-950 to-neutral-900/80">
      <div className="max-w-3xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-500 mb-2">Sample Weekly Plans</p>
          <h2 className="text-3xl font-black text-white">3 Dinners. 1 Grocery Run.</h2>
          <p className="text-neutral-400 text-sm mt-2">Pick a plan that fits your week. Each one is carb-balanced and grocery-ready.</p>
          <p className="text-neutral-600 text-[10px] mt-1">Every plan mixes high-carb, low-carb, and keto meals so no week feels one-note.</p>
        </div>

        {/* Plan selector */}
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="flex items-center gap-2">
            {Object.entries(WEEKS).map(([num, w]) => (
              <button
                key={num}
                onClick={() => handleWeekChange(Number(num))}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  week === Number(num)
                    ? "bg-amber-500 text-black"
                    : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
                }`}
              >
                {w.label}
              </button>
            ))}
          </div>
          <span className="text-neutral-600 text-[10px]">{currentWeek.subtitle}</span>
        </div>

        {/* Family size */}
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-white text-xs font-bold">Your family</span>
              <span className="text-neutral-600 text-[10px] ml-2">Adjusts grocery + portions</span>
            </div>
            {showFeedback && (
              <span className="text-amber-400 text-[10px] font-bold animate-pulse">Updated for {servings}</span>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-3">
              <span className="text-neutral-500 text-xs w-12">Adults:</span>
              <div className="flex gap-1">
                {ADULT_OPTIONS.map((n) => (
                  <button key={n} onClick={() => handleFamilyChange(setAdults, n)}
                    className={`w-9 h-9 rounded-lg text-sm font-bold transition-all cursor-pointer ${adults === n ? "bg-red-500 text-white scale-110" : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"}`}
                  >{n}</button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-neutral-500 text-xs w-12">Kids:</span>
              <div className="flex gap-1">
                {KID_OPTIONS.map((n) => (
                  <button key={n} onClick={() => handleFamilyChange(setKids, n)}
                    className={`w-9 h-9 rounded-lg text-sm font-bold transition-all cursor-pointer ${kids === n ? "bg-green-500 text-white scale-110" : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"}`}
                  >{n}</button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 self-center">
              <button
                onClick={() => { setLeftovers(!leftovers); setShowFeedback(true); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${leftovers ? "bg-amber-500 text-black" : "bg-neutral-800 text-neutral-500 hover:bg-neutral-700"}`}
              >
                <span className={`w-3 h-3 rounded-sm border ${leftovers ? "bg-black border-black" : "border-neutral-600"} flex items-center justify-center text-[8px]`}>{leftovers ? "\u2713" : ""}</span>
                Leftovers
              </button>
            </div>
            <span className="text-neutral-600 text-[10px] self-center">
              {servings} servings{leftovers ? " (doubled for next-day leftovers)" : ""}
            </span>
          </div>
        </div>

        {/* Meal inclusion */}
        {enabledCount < 3 ? (
          <div className="flex items-center justify-between mb-4 px-1">
            <span className="text-neutral-500 text-[10px]">
              {enabledCount} of 3 dinners active &middot; grocery adjusted
            </span>
            <button onClick={resetMeals} className="text-amber-500 text-[10px] font-bold cursor-pointer hover:underline">
              Reset to full week
            </button>
          </div>
        ) : (
          <p className="text-neutral-600 text-[10px] text-center mb-4">
            Can't do all 3? Uncheck a dinner below to skip it — grocery updates automatically.
          </p>
        )}

        {/* Start here */}
        <div className="mb-8 bg-amber-500/5 border border-amber-500/20 rounded-xl py-4 px-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-amber-500 text-xs font-black uppercase tracking-wider">Start here</span>
            <span className="text-neutral-600 text-[10px]">Zero decisions required</span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <a href="#grocery" className="text-white font-bold text-sm hover:text-amber-400 transition-colors">1. Shop</a>
              <p className="text-neutral-500 text-[10px] mt-0.5">One list, one trip</p>
            </div>
            <div>
              <span className="text-white font-bold text-sm">2. Cook</span>
              <p className="text-neutral-500 text-[10px] mt-0.5">Mon &rarr; Wed &rarr; Fri</p>
            </div>
            <div>
              <span className="text-white font-bold text-sm">3. Done</span>
              <p className="text-neutral-500 text-[10px] mt-0.5">7 days handled</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative" id="timeline">
          <div className="absolute left-6 top-4 bottom-4 w-px bg-neutral-800 hidden sm:block" />
          <div className="space-y-2 relative">
            {/* Monday */}
            <TimelineDot type="cook" enabled={enabledMeals.Mon} />
            <CookDay {...currentWeek.cookDays[0]} servings={servings} enabled={enabledMeals.Mon} onToggle={() => toggleMeal("Mon")} />
            <TimelineDot type="leftover" enabled={enabledMeals.Mon} />
            <LeftoverDay day="Tuesday" meal={leftoverMsgs.tue} visible={leftovers && enabledMeals.Mon} />

            {/* Wednesday */}
            <TimelineDot type="cook" enabled={enabledMeals.Wed} />
            <CookDay {...currentWeek.cookDays[1]} servings={servings} enabled={enabledMeals.Wed} onToggle={() => toggleMeal("Wed")} />
            <TimelineDot type="leftover" enabled={enabledMeals.Wed} />
            <LeftoverDay day="Thursday" meal={leftoverMsgs.thu} visible={leftovers && enabledMeals.Wed} />

            {/* Friday */}
            <TimelineDot type="cook" enabled={enabledMeals.Fri} />
            <CookDay {...currentWeek.cookDays[2]} servings={servings} enabled={enabledMeals.Fri} onToggle={() => toggleMeal("Fri")} />
            <TimelineDot type="leftover" enabled={enabledMeals.Fri} />
            <LeftoverDay day="Saturday" meal={leftoverMsgs.sat} visible={leftovers && enabledMeals.Fri} />

            {/* Sunday */}
            <TimelineDot type="flex" />
            <FlexDay day="Sunday" meal={leftoverMsgs.sun} />
          </div>
        </div>

        {/* Weekly stats */}
        <div className="mt-8 flex justify-center gap-4 text-xs text-neutral-500 flex-wrap">
          <span><span className="text-amber-400 font-bold">~{Math.round(375 * servings / 4 * enabledCount / 3)}g protein</span> this week</span>
          <span className="text-neutral-700">|</span>
          <span><span className="text-white font-semibold">{enabledCount} cooks</span>, {leftovers ? "7 days covered" : `${enabledCount} dinners`}</span>
          <span className="text-neutral-700">|</span>
          <span>~30 min avg</span>
        </div>

        {/* Grocery */}
        <div className="mt-10" id="grocery">
          <GroceryList adults={adults} kids={kids} leftovers={leftovers} excludedTags={excludedTags} week={week} />
        </div>

        {/* Sauce bridge */}
        <div className="mt-8 bg-neutral-900/50 border border-amber-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-amber-400">Add flavor to any dinner</h4>
            <Link to="/cookbook" className="text-amber-500 text-[10px] font-bold hover:underline">View all sauces &rarr;</Link>
          </div>
          <p className="text-neutral-400 text-xs">Sauces that turn any meal from good to great. ~30 cal, 5 min, works on everything.</p>
          <Link to="/cookbook" className="mt-3 flex items-center gap-3 bg-neutral-800/50 rounded-lg p-3 hover:bg-neutral-800 transition-colors">
            <div className="flex-1">
              <span className="text-white text-xs font-bold">Money Mustard</span>
              <span className="text-neutral-500 text-[10px] ml-2">Chick-fil-A style, high protein</span>
            </div>
            <span className="text-amber-500 text-[10px] font-bold">Use this &rarr;</span>
          </Link>
        </div>

        {/* Flexibility note */}
        <div className="mt-4 bg-neutral-900/50 border border-neutral-800 rounded-xl p-4">
          <h4 className="text-xs font-bold text-white mb-2">Make it yours</h4>
          <div className="space-y-1.5 text-xs text-neutral-400">
            <p>Swap any protein: chicken &harr; beef &harr; turkey. System still works.</p>
            <p>Uncheck a dinner above to remove it from your week and grocery list.</p>
            <p>Adjust spice levels, not the structure. That's how this stays repeatable.</p>
          </div>
        </div>

        {/* Completion */}
        <div className="mt-6 text-center py-6 bg-amber-500/5 border border-amber-500/20 rounded-xl">
          <p className="text-neutral-500 text-xs">Once you've shopped and checked everything off:</p>
          <p className="text-amber-400 font-black text-base mt-1">
            {leftovers ? "Zero food decisions left this week." : `${enabledCount} dinners sorted. Off-nights are on you.`}
          </p>
          <p className="text-neutral-600 text-[10px] mt-1">{leftovers ? "Cook days + leftover days. All handled." : "Turn on leftovers to cover the full week."}</p>
        </div>

        {/* Return hook */}
        <div className="mt-6 text-center bg-neutral-900/30 border border-neutral-800 rounded-xl py-5 px-4">
          <p className="text-white text-xs font-bold">Come back Sunday</p>
          <p className="text-amber-400 text-[10px] mt-1 font-semibold">New dinners every week.</p>
          <p className="text-neutral-500 text-[10px] mt-1">Same system, new flavors. Swap 1 protein, keep the structure, zero thinking.</p>
          <p className="text-neutral-600 text-[10px] mt-2">3 dinners. 1 shop. 0 decisions. Every week.</p>
        </div>
      </div>
    </section>
  );
}

function TimelineDot({ type, enabled = true }) {
  if (!enabled && type !== "flex") return <div className="h-0" />;
  return <div className="h-0 relative"><div className={`absolute left-[21px] top-2 w-2.5 h-2.5 rounded-full border-2 hidden sm:block z-10 ${
    type === "cook" ? "bg-amber-500 border-amber-500" : type === "leftover" ? "bg-neutral-700 border-neutral-600" : "bg-neutral-800 border-neutral-700"
  }`} /></div>;
}
