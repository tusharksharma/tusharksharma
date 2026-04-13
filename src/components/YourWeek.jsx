import { Link } from "react-router-dom";
import recipes from "../data/recipes";
import GroceryList from "./GroceryList";

const TIMELINE = [
  { type: "cook", day: "Monday", label: "Fast Win", id: 4, time: "25 min", reheats: true, adult: "Spicy soy-sesame, charred broccoli, chili oil", kid: "Mild soy, broccoli on side, meatballs", needs: ["Beef (1.25 lb)", "Broccoli", "Rice", "Soy sauce", "Bone broth"] },
  { type: "leftover", day: "Tuesday", meal: "Beef & Broccoli (reheat with splash of broth)" },
  { type: "cook", day: "Wednesday", label: "Comfort + Protein", id: 1, time: "30 min", reheats: false, adult: "Spicy fajita cream, peppers, chili oil", kid: "Rao's Alfredo or mild creamy", needs: ["Chicken (1.25 lb)", "Gnocchi", "Bell peppers", "Cottage cheese", "Dan-O's"] },
  { type: "leftover", day: "Thursday", meal: "Gnocchi or leftover Beef & Broccoli" },
  { type: "cook", day: "Friday", label: "Cook Once, Win Twice", id: 2, time: "35 min", reheats: true, adult: "Chili cream sauce, Dan-O's, sliced tri-tip", kid: "Mild creamy penne, meatballs, cheese", needs: ["Tri-tip (1.25 lb)", "Penne", "Spinach", "Cottage cheese", "Beef broth"] },
  { type: "leftover", day: "Saturday", meal: "Tri-Tip Penne (reheat with splash of milk)" },
  { type: "flex", day: "Sunday", meal: "Flexible — eat out, reset, or finish leftovers" },
];

function CookDay({ day, label, id, time, reheats, adult, kid, needs }) {
  const r = recipes.find((x) => x.id === id);
  if (!r) return null;
  return (
    <Link to={`/recipes/${r.slug}`} className="block group">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-amber-500/40 transition-all">
        <div className="flex flex-col sm:flex-row">
          <div className="sm:w-40 flex-shrink-0 relative">
            <img src={r.image} alt={r.title} className="w-full h-32 sm:h-full object-cover group-hover:brightness-110 transition-all" loading="lazy" />
            <div className="absolute top-2 left-2 flex gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500 text-black">{day}</span>
              {reheats && <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-green-600/80 text-white">Reheats</span>}
            </div>
          </div>
          <div className="flex-1 p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-amber-500 text-[10px] font-bold uppercase tracking-wider">{label}</span>
              <span className="text-neutral-600 text-[10px]">{time}</span>
            </div>
            <h3 className="text-white font-bold text-sm group-hover:text-amber-400 transition-colors">{r.title}</h3>
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
            <div className="mt-2 text-[10px] text-neutral-600">
              {r.protein}g protein &middot; {r.calories} cal &middot; {r.servings} servings
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function LeftoverDay({ day, meal }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-neutral-900/30 border border-neutral-800/50 rounded-lg">
      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 w-12 flex-shrink-0">{day}</span>
      <span className="text-xs text-neutral-500">{meal}</span>
      <span className="text-[10px] bg-neutral-800 text-neutral-600 px-2 py-0.5 rounded-full ml-auto">No cooking</span>
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
  return (
    <section className="border-b border-neutral-800 bg-gradient-to-b from-neutral-950 to-neutral-900/80">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-500 mb-2">This Week</p>
          <h2 className="text-3xl font-black text-white">Done For You</h2>
          <p className="text-neutral-400 text-sm mt-2">
            3 meals &middot; 4 servings each &middot; leftovers built in &middot; follow top to bottom
          </p>
          <div className="flex gap-3 justify-center mt-5">
            <a href="#timeline" className="px-5 py-2.5 bg-amber-500 text-black font-bold rounded-xl text-xs hover:bg-amber-400 transition-colors cursor-pointer">Start This Week</a>
            <a href="#grocery" className="px-5 py-2.5 bg-neutral-800 text-white font-bold rounded-xl border border-neutral-700 text-xs hover:bg-neutral-700 transition-colors cursor-pointer">Shop First</a>
          </div>
        </div>

        <div className="space-y-3" id="timeline">
          {TIMELINE.map((entry, i) => {
            if (entry.type === "cook") return <CookDay key={i} {...entry} />;
            if (entry.type === "leftover") return <LeftoverDay key={i} day={entry.day} meal={entry.meal} />;
            return <FlexDay key={i} day={entry.day} meal={entry.meal} />;
          })}
        </div>

        <div className="mt-8 flex justify-center gap-4 text-xs text-neutral-500 flex-wrap">
          <span><span className="text-amber-400 font-bold">~375g protein</span> this week</span>
          <span className="text-neutral-700">|</span>
          <span><span className="text-white font-semibold">3 cooks</span>, 7 days covered</span>
          <span className="text-neutral-700">|</span>
          <span>~30 min avg cook time</span>
        </div>

        <div className="mt-10" id="grocery">
          <GroceryList />
        </div>

        <div className="mt-8 text-center py-6 bg-neutral-900/30 border border-neutral-800 rounded-xl">
          <p className="text-neutral-500 text-xs">Once you've shopped and checked everything off:</p>
          <p className="text-amber-400 font-bold text-sm mt-1">Your entire week is handled. Zero food decisions left.</p>
        </div>

        <div className="mt-6 text-center">
          <p className="text-neutral-600 text-xs">Next week drops Sunday &middot; Same system, new flavors &middot; Zero thinking</p>
        </div>
      </div>
    </section>
  );
}
