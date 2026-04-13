import { useState } from "react";
import { Link } from "react-router-dom";
import recipes from "../data/recipes";

const WEEK = [
  {
    day: "Mon",
    label: "Fast Win",
    id: 4,
    time: "25 min",
    servings: 4,
    reheats: true,
    whyHere: "Start the week with momentum. No friction.",
    adult: "Spicy soy-sesame, charred broccoli, chili oil",
    kid: "Mild soy, broccoli on side, meatballs",
  },
  {
    day: "Wed",
    label: "Comfort + Protein",
    id: 1,
    time: "30 min",
    servings: 4,
    reheats: false,
    whyHere: "Midweek fatigue — this feels like a real meal, not diet food.",
    adult: "Spicy fajita cream, peppers mixed in, chili oil",
    kid: "Rao's Alfredo or mild creamy, peppers on side",
  },
  {
    day: "Fri",
    label: "Cook Once, Win Twice",
    id: 2,
    time: "35 min",
    servings: 4,
    reheats: true,
    whyHere: "Set yourself up for weekend leftovers.",
    adult: "Chili cream, Dan-O's heat, sliced tri-tip",
    kid: "Mild creamy penne, meatballs, cheese on top",
  },
];

const CALENDAR = [
  { day: "Mon", type: "cook", meal: "Beef & Broccoli Bowls" },
  { day: "Tue", type: "leftover", meal: "Beef & Broccoli (reheat)" },
  { day: "Wed", type: "cook", meal: "Fajita Chicken Gnocchi" },
  { day: "Thu", type: "leftover", meal: "Gnocchi or Beef & Broccoli" },
  { day: "Fri", type: "cook", meal: "Tri-Tip Penne" },
  { day: "Sat", type: "leftover", meal: "Tri-Tip Penne (reheat)" },
  { day: "Sun", type: "flex", meal: "Flexible / eat out / reset" },
];

const GROCERY = {
  "Protein": [
    "1.25 lb beef (tri-tip, flank, or sirloin)",
    "1-1.25 lb chicken thighs or Del Real shredded chicken",
    "1.25 lb tri-tip steak",
    "Earth's Best mini meatballs (kid protein swap)",
  ],
  "Carbs": [
    "2 cups rice (dry)",
    "1 pack gnocchi (~16 oz)",
    "8 oz penne pasta",
  ],
  "Vegetables": [
    "3-4 cups broccoli (fresh or frozen)",
    "2-3 bell peppers",
    "1 large onion",
    "2 cups spinach",
    "1 head garlic",
  ],
  "Sauce & Flavor": [
    "Soy sauce or tamari",
    "Roli Roti bone broth (for rice)",
    "Beef broth (for pasta sauce)",
    "Dan-O's Outlaw seasoning",
    "Chili oil or sriracha",
    "Sesame oil",
    "1 lime",
  ],
  "Creamy / Protein Base": [
    "Cottage cheese (1.5 cups total)",
    "Fairlife fat-free milk",
  ],
  "Kid Mode Add-ons": [
    "Rao's Alfredo sauce (for gnocchi kid option)",
    "Shredded mild cheese (mozz or cheddar)",
  ],
};

export default function YourWeek() {
  const [showGrocery, setShowGrocery] = useState(false);

  return (
    <section className="border-b border-neutral-800 bg-gradient-to-b from-neutral-950 to-neutral-900/80">
      <div className="max-w-5xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-500 mb-2">
            Your Week
          </p>
          <h2 className="text-3xl font-black text-white">
            3 Meals. No Overthinking.
          </h2>
          <p className="text-neutral-400 text-sm mt-2 font-medium">
            Follow this week. No decisions needed.
          </p>
        </div>

        {/* Day-by-day calendar strip */}
        <div className="grid grid-cols-7 gap-1 mb-8">
          {CALENDAR.map(({ day, type, meal }) => (
            <div
              key={day}
              className={`rounded-lg p-2.5 text-center ${
                type === "cook"
                  ? "bg-amber-500/15 border border-amber-500/30"
                  : type === "leftover"
                    ? "bg-neutral-800/50 border border-neutral-700/50"
                    : "bg-neutral-900/30 border border-neutral-800/30"
              }`}
            >
              <span className={`text-[10px] font-black uppercase tracking-wider block ${
                type === "cook" ? "text-amber-400" : "text-neutral-500"
              }`}>
                {day}
              </span>
              <span className={`text-[9px] mt-1 block leading-tight ${
                type === "cook"
                  ? "text-amber-300/80 font-semibold"
                  : type === "leftover"
                    ? "text-neutral-500"
                    : "text-neutral-600 italic"
              }`}>
                {type === "cook" ? "COOK" : type === "leftover" ? "reheat" : "flex"}
              </span>
            </div>
          ))}
        </div>

        {/* Meal cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {WEEK.map(({ day, label, id, time, servings, reheats, whyHere, adult, kid }) => {
            const r = recipes.find((x) => x.id === id);
            if (!r) return null;
            const ppc = ((r.protein * 4 / r.calories) * 100).toFixed(0);
            return (
              <Link to={`/recipes/${r.slug}`} key={id} className="block group">
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-amber-500/40 transition-all h-full">
                  <div className="relative">
                    <img
                      src={r.image}
                      alt={r.title}
                      className="w-full h-36 object-cover group-hover:brightness-110 transition-all"
                      loading="lazy"
                    />
                    <div className="absolute top-2 left-2 flex gap-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500 text-black">
                        {day}
                      </span>
                      {reheats && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-green-600/80 text-white">
                          Reheats
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    <span className="text-amber-500 text-[10px] font-bold uppercase tracking-wider">
                      {label}
                    </span>
                    <h3 className="text-white font-bold text-sm mt-1 group-hover:text-amber-400 transition-colors">
                      {r.title}
                    </h3>
                    <p className="text-neutral-500 text-xs mt-1 italic">
                      {whyHere}
                    </p>

                    {/* Split preview */}
                    <div className="mt-3 space-y-1.5">
                      <div className="flex gap-2 items-start">
                        <span className="text-red-400 text-[10px] font-black mt-0.5 w-8 flex-shrink-0">ADULT</span>
                        <p className="text-neutral-400 text-xs">{adult}</p>
                      </div>
                      <div className="flex gap-2 items-start">
                        <span className="text-green-400 text-[10px] font-black mt-0.5 w-8 flex-shrink-0">KID</span>
                        <p className="text-neutral-400 text-xs">{kid}</p>
                      </div>
                    </div>

                    {/* Macros bar */}
                    <div className="mt-3 pt-2 border-t border-neutral-800 flex items-center gap-2 text-[10px] text-neutral-500">
                      <span className="text-amber-400 font-bold">{r.protein}g protein</span>
                      <span className="text-neutral-700">&middot;</span>
                      <span>{r.calories} cal</span>
                      <span className="text-neutral-700">&middot;</span>
                      <span>{servings} servings</span>
                      <span className="text-neutral-700">&middot;</span>
                      <span>{time}</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Weekly totals */}
        <div className="mt-6 flex justify-center gap-6 text-xs text-neutral-500">
          <span>Week total: <span className="text-amber-400 font-bold">~375g protein</span></span>
          <span className="text-neutral-700">|</span>
          <span><span className="text-white font-semibold">3 cooks</span>, 12 meals covered</span>
        </div>

        {/* Grocery list toggle */}
        <div className="mt-8">
          <button
            onClick={() => setShowGrocery(!showGrocery)}
            className="w-full bg-amber-500 text-black font-bold rounded-xl py-3 text-sm hover:bg-amber-400 transition-colors cursor-pointer"
          >
            {showGrocery ? "Hide Grocery List" : "Shop This Week"}
          </button>

          {showGrocery && (
            <div className="mt-4 bg-neutral-900 border border-neutral-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white">Week 1 Grocery List</h3>
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider">
                  Buy once &middot; Cook 3x &middot; Everything overlaps
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(GROCERY).map(([category, items]) => (
                  <div key={category}>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500 mb-2">
                      {category}
                    </h4>
                    <ul className="space-y-1">
                      {items.map((item, i) => (
                        <li key={i} className="text-xs text-neutral-300 flex gap-2">
                          <span className="text-neutral-600 flex-shrink-0">&#9744;</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <p className="text-neutral-600 text-[10px] mt-4 italic text-center">
                Same veggies reused across meals. Protein rotates. Sauce base is consistent.
              </p>
            </div>
          )}
        </div>

        {/* How the week works */}
        <div className="mt-8 bg-neutral-900/50 border border-neutral-800 rounded-xl p-5 max-w-2xl mx-auto">
          <h3 className="text-sm font-bold text-white mb-3">How the Week Actually Works</h3>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {CALENDAR.map(({ day, type, meal }) => (
              <div key={day} className="text-center">
                <span className={`text-[10px] font-bold block ${
                  type === "cook" ? "text-amber-400" : type === "leftover" ? "text-neutral-500" : "text-neutral-600"
                }`}>{day}</span>
                <span className="text-[9px] text-neutral-400 block mt-0.5 leading-tight">{meal}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-neutral-800 pt-3 space-y-1.5 text-xs text-neutral-400">
            <p>Cook <span className="text-white font-semibold">3 times</span>. Eat <span className="text-white font-semibold">7 days</span>.</p>
            <p>Don't swap meals — follow the structure. Adjust spice, not the recipe.</p>
            <p>Next week: same loop, swap 1 protein max.</p>
          </div>
          <p className="text-neutral-600 text-xs mt-3 italic">
            This is not a meal plan. This is a repeatable loop.
          </p>
        </div>
      </div>
    </section>
  );
}
