import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
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
          <a
            href="#recipes"
            className="px-6 py-3 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-colors cursor-pointer text-sm"
          >
            Browse Recipes
          </a>
          <Link
            to="/recipes/spicy-fajita-chicken-gnocchi"
            className="px-6 py-3 bg-neutral-800 text-white font-bold rounded-xl border border-neutral-700 hover:bg-neutral-700 transition-colors text-sm"
          >
            Try the Flagship Recipe
          </Link>
        </div>
      </div>
    </section>
  );
}
