import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
    <section className="border-b border-neutral-800">
      <div className="max-w-5xl mx-auto px-4 py-12 sm:py-20">
        <div className="flex flex-col sm:flex-row items-center gap-8 sm:gap-12">
          {/* Food visual */}
          <div className="flex-shrink-0 w-full sm:w-[45%]">
            <img
              src="/images/smash-tacos/hero.png"
              alt="Split plate — adult and kid tacos from the same cook"
              className="w-full rounded-2xl border border-neutral-800"
            />
            <p className="text-neutral-600 text-[10px] mt-2 text-center">Same cook. Different plates.</p>
          </div>

          {/* Copy */}
          <div className="flex-1 text-center sm:text-left">
            <p className="text-amber-500 font-black text-xs tracking-[0.2em] uppercase mb-3">
              The Split Plate
            </p>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-[1.1]">
              One meal.
              <br />
              <span className="text-amber-400">Two plates.</span>
            </h1>
            <p className="text-neutral-400 mt-4 text-base max-w-lg leading-relaxed">
              High-protein dinners for adults. Kid-friendly plates from the same cook.
              No second meal. No fighting over food.
            </p>
            <p className="text-neutral-500 mt-2 text-sm">
              3 dinners a week. 1 grocery run. Done.
            </p>
            <div className="flex gap-3 mt-6 flex-wrap justify-center sm:justify-start">
              <a
                href="#timeline"
                className="px-6 py-3 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-colors cursor-pointer text-sm"
              >
                See This Week
              </a>
              <Link
                to="/dinners"
                className="px-6 py-3 bg-neutral-800 text-white font-bold rounded-xl border border-neutral-700 hover:bg-neutral-700 transition-colors text-sm"
              >
                Browse Dinners
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
