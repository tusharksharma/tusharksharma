import { Link } from "react-router-dom";
import useMeta from "../hooks/useMeta";

export default function AboutPage() {
  useMeta({ title: "About", description: "The Split Plate is a dinner system for families who want high-protein meals without cooking twice." });

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-black text-white">About The Split Plate</h1>

        <div className="mt-8 space-y-6 text-neutral-300 text-sm leading-relaxed">
          <p>
            Most family dinner advice boils down to two bad options: cook one bland meal everyone tolerates, or cook two separate meals and lose your evening.
          </p>
          <p>
            The Split Plate is a third option. <span className="text-white font-semibold">One cook. Two plates.</span> Adults get bold flavor and high protein. Kids get something mild and familiar. Same workflow, same ingredients, same 30 minutes.
          </p>
          <p>
            Every recipe uses the <span className="text-amber-400 font-semibold">Split Cook Method</span> — you cook a shared base, then split it at the right moment into adult and kid versions. No second meal. No separate grocery list.
          </p>

          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 mt-8">
            <h2 className="text-white font-bold text-sm mb-3">What you'll find here</h2>
            <ul className="space-y-2 text-neutral-400 text-sm">
              <li><span className="text-amber-400 font-bold">Weekly dinner plans</span> — 3 dinners, 1 grocery run, leftovers built in</li>
              <li><span className="text-amber-400 font-bold">Full recipes</span> — with real photos, step-by-step method, macros, and troubleshooting</li>
              <li><span className="text-amber-400 font-bold">Power-ups</span> — sauces, breakfast hacks, and desserts that boost protein without effort</li>
            </ul>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <h2 className="text-white font-bold text-sm mb-3">Who this is for</h2>
            <p className="text-neutral-400 text-sm">
              Parents who want to eat well without making dinner a production. People who care about protein but don't want to eat chicken and rice every night. Families where adults and kids have different tastes but the same schedule.
            </p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <h2 className="text-white font-bold text-sm mb-3">The rules</h2>
            <ul className="space-y-1.5 text-neutral-400 text-sm">
              <li>Every recipe works in 30 minutes or less</li>
              <li>No exotic ingredients — grocery store staples only</li>
              <li>Pre-cooked protein is welcome, not judged</li>
              <li>Macros are real, not aspirational</li>
              <li>If it doesn't reheat well, it's marked</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex gap-3 flex-wrap">
          <Link to="/" className="px-5 py-2.5 bg-amber-500 text-black font-bold rounded-xl text-sm hover:bg-amber-400 transition-colors">
            See This Week
          </Link>
          <Link to="/dinners" className="px-5 py-2.5 bg-neutral-800 text-white font-bold rounded-xl border border-neutral-700 text-sm hover:bg-neutral-700 transition-colors">
            Browse Dinners
          </Link>
        </div>
      </div>
    </div>
  );
}
