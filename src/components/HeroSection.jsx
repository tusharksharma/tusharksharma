import { Link } from "react-router-dom";
import track from "../hooks/useTrack";

export default function HeroSection() {
  return (
    <section className="border-b border-line">
      <div className="max-w-5xl mx-auto px-4 py-12 sm:py-14">
        <div className="flex flex-col sm:flex-row-reverse items-center gap-8 sm:gap-12">
          {/* Food visual */}
          <div className="flex-shrink-0 w-full sm:w-[42%]">
            <img
              src="/images/pizza-leftover-meatballs/hero-split-pizza-leftover-meatballs-polished.webp"
              width="2048"
              height="2048"
              alt="Split plate — adult half-pizza plus five lean-beef meatballs next to a kid's single-serve pizza and two meatballs"
              fetchPriority="high"
              className="w-full rounded-2xl border border-line sm:max-h-[420px] sm:object-cover"
            />
            <p className="text-muted text-xs mt-2 text-center">Same cook. Different plates.</p>
          </div>

          {/* Copy */}
          <div className="flex-1 text-center sm:text-left">
            <p className="text-brand font-black text-xs tracking-[0.2em] uppercase mb-3">
              The Split Plate
            </p>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-ink leading-[1.1]">
              One meal.
              <br />
              <span className="text-brand">Two plates.</span>
            </h1>
            <p className="text-muted mt-4 text-base max-w-lg leading-relaxed">
              Family dinners where adults eat what they actually want and kids eat what they'll actually finish.
              One cook. No separate meals. No negotiating.
            </p>
            <p className="text-muted mt-2 text-sm">
              Pick a weekly plan. Shop once. Cook 2–3 nights. Leftovers handle the rest.
            </p>
            <div className="flex gap-3 mt-6 flex-wrap justify-center sm:justify-start">
              <a
                href="#your-week"
                onClick={() => track("hero_cta_click", { cta: "see_this_week" })}
                className="px-6 py-3 bg-brand text-brandink font-bold rounded-xl hover:bg-brand transition-colors cursor-pointer text-sm"
              >
                See This Week
              </a>
              <Link
                to="/dinners"
                onClick={() => track("hero_cta_click", { cta: "browse_dinners" })}
                className="px-6 py-3 bg-surface2 text-ink font-bold rounded-xl border border-line hover:bg-line transition-colors text-sm"
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
