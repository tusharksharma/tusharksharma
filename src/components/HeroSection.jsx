import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
    <section className="border-b border-neutral-800">
      <div className="max-w-5xl mx-auto px-4 py-16 sm:py-24 text-center">
        <img
          src="/images/logo-sm.png"
          alt="The Split Plate"
          className="w-20 h-20 mx-auto mb-4"
        />
        <p className="text-amber-500 font-black text-sm tracking-[0.3em] uppercase mb-4">
          The Split Plate
        </p>
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.1]">
          One Dinner. Two Outcomes.
          <br />
          <span className="text-amber-400">No Extra Work.</span>
        </h1>
        <p className="text-neutral-400 mt-6 text-lg max-w-2xl mx-auto leading-relaxed">
          A dinner system for families who want high-protein dinners
          without cooking twice — adults and kids, same workflow.
        </p>
        <p className="text-amber-500/70 mt-3 text-sm font-bold">
          3 dinners. 1 shop. 0 decisions.
        </p>
        <p className="text-neutral-600 mt-1 text-xs">
          Dinner system. Not full-day meal planning.
        </p>
        <div className="flex gap-3 justify-center mt-8 flex-wrap">
          <a
            href="#timeline"
            className="px-6 py-3 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-colors cursor-pointer text-sm"
          >
            Start This Week
          </a>
          <Link
            to="/recipes/spicy-fajita-chicken-gnocchi"
            className="px-6 py-3 bg-neutral-800 text-white font-bold rounded-xl border border-neutral-700 hover:bg-neutral-700 transition-colors text-sm"
          >
            See a Recipe
          </Link>
        </div>
      </div>
    </section>
  );
}
