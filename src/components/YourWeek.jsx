import { Link } from "react-router-dom";
import recipes from "../data/recipes";

const WEEK = [
  {
    day: "Monday",
    label: "Fast Win",
    id: 4,
    time: "25 min",
    reheats: true,
    whyHere: "Start the week with momentum. No friction.",
    adult: "Spicy soy-sesame sauce, charred broccoli, chili oil",
    kid: "Mild soy, broccoli on side, meatballs or sausage",
  },
  {
    day: "Wednesday",
    label: "Comfort + Protein",
    id: 1,
    time: "30 min",
    reheats: false,
    whyHere: "Midweek fatigue — this feels like a real meal, not diet food.",
    adult: "Spicy fajita cream sauce, peppers mixed in, chili oil",
    kid: "Rao's Alfredo or mild creamy, peppers on side",
  },
  {
    day: "Friday",
    label: "Cook Once, Win Twice",
    id: 2,
    time: "35 min",
    reheats: true,
    whyHere: "Set yourself up for weekend leftovers.",
    adult: "Chili cream sauce, Dan-O's heat, sliced tri-tip on top",
    kid: "Mild creamy penne with meatballs, cheese on top",
  },
];

export default function YourWeek() {
  return (
    <section className="border-b border-neutral-800 bg-gradient-to-b from-neutral-950 to-neutral-900/80">
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-500 mb-2">
            Your Week
          </p>
          <h2 className="text-3xl font-black text-white">
            3 Meals. No Overthinking.
          </h2>
          <p className="text-neutral-500 text-sm mt-2">
            Cook once, eat smart. Follow this structure every week — swap proteins later.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {WEEK.map(({ day, label, id, time, reheats, whyHere, adult, kid }) => {
            const r = recipes.find((x) => x.id === id);
            if (!r) return null;
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
                        <span className="text-red-400 text-[10px] font-black mt-0.5">ADULT</span>
                        <p className="text-neutral-400 text-xs">{adult}</p>
                      </div>
                      <div className="flex gap-2 items-start">
                        <span className="text-green-400 text-[10px] font-black mt-0.5">KID</span>
                        <p className="text-neutral-400 text-xs">{kid}</p>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-neutral-800 flex items-center justify-between">
                      <span className="text-amber-400/80 text-xs font-semibold">
                        {r.protein}g protein &middot; {time}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* How to use */}
        <div className="mt-10 bg-neutral-900/50 border border-neutral-800 rounded-xl p-5 max-w-2xl mx-auto">
          <h3 className="text-sm font-bold text-white mb-3">How This Works</h3>
          <ul className="space-y-1.5 text-xs text-neutral-400">
            <li>Cook only <span className="text-white font-semibold">3 times this week</span> — eat leftovers on off days</li>
            <li>Don't swap meals — follow the structure</li>
            <li>Adjust spice level, not the recipe</li>
            <li>Next week: keep the same 3-day loop, swap 1 protein max</li>
          </ul>
          <p className="text-neutral-600 text-xs mt-3 italic">
            This is not a meal plan. This is a repeatable loop.
          </p>
        </div>
      </div>
    </section>
  );
}
