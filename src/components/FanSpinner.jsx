import { useState } from "react";
import { Link } from "react-router-dom";
import { liveRecipes } from "../data/recipes";
import track from "../hooks/useTrack";

const RECIPES = liveRecipes.filter((r) => r.splitFriendly);
const COUNT = RECIPES.length;
const SLICE_DEG = 360 / COUNT;

const BLADE_COLORS = [
  "#f59e0b", "#ef4444", "#22c55e", "#3b82f6", "#a855f7", "#ec4899", "#14b8a6", "#f97316",
];

export default function FanSpinner() {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [rotation, setRotation] = useState(0);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);

    const extraRotations = (4 + Math.random() * 3) * 360;
    const landingAngle = Math.random() * 360;
    const totalRotation = rotation + extraRotations + landingAngle;

    setRotation(totalRotation);

    setTimeout(() => {
      // Pointer is at top (270° in unit-circle terms).
      // Blade i sits at (i * SLICE_DEG). After rotation R, blade i is at (i * SLICE_DEG + R) % 360.
      // Find which blade is closest to 270° (top).
      const finalRotation = totalRotation % 360;
      let bestIdx = 0;
      let bestDist = Infinity;
      for (let i = 0; i < COUNT; i++) {
        const bladeAngle = (i * SLICE_DEG + finalRotation) % 360;
        // Distance to 270° (top), wrapping around
        const dist = Math.min(Math.abs(bladeAngle - 270), 360 - Math.abs(bladeAngle - 270));
        if (dist < bestDist) { bestDist = dist; bestIdx = i; }
      }
      setResult(RECIPES[bestIdx]);
      setSpinning(false);
      track("fan_spin", { result: RECIPES[bestIdx].title });
    }, 4000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-500 mb-2">Feeling Lucky?</p>
      <h2 className="text-3xl font-black text-white">In the Hands of the Fan</h2>
      <p className="text-neutral-400 text-sm mt-2 mb-10">
        Can't decide? Spin the fan. Cook whatever it lands on.
      </p>

      {/* Fan */}
      <div className="relative w-72 h-72 sm:w-96 sm:h-96 mx-auto">
        {/* Pointer at top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-20">
          <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[18px] border-l-transparent border-r-transparent border-t-amber-500 drop-shadow-lg" />
        </div>

        {/* Spinning fan body */}
        <div
          className="w-full h-full relative"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? "transform 4s cubic-bezier(0.15, 0.6, 0.15, 1)" : "none",
          }}
        >
          {RECIPES.map((recipe, i) => {
            const angle = i * SLICE_DEG;
            const color = BLADE_COLORS[i % BLADE_COLORS.length];
            const dimmed = result && result.id !== recipe.id;

            return (
              <div
                key={recipe.id}
                className="absolute top-1/2 left-1/2 origin-bottom-left"
                style={{
                  transform: `rotate(${angle}deg)`,
                  width: "50%",
                  height: 0,
                }}
              >
                {/* Blade */}
                <div
                  className="absolute bottom-0 left-0 transition-opacity duration-500"
                  style={{
                    width: "92%",
                    height: "48px",
                    marginLeft: "16px",
                    marginBottom: "-24px",
                    background: `linear-gradient(90deg, ${color}dd, ${color}88)`,
                    borderRadius: "4px 24px 24px 4px",
                    opacity: dimmed ? 0.25 : 1,
                    boxShadow: `0 2px 8px ${color}44`,
                  }}
                >
                  {/* Recipe name on blade */}
                  <div
                    className="absolute inset-0 flex items-center justify-center px-4"
                  >
                    <span className="text-white font-bold text-[9px] sm:text-[11px] truncate drop-shadow-md text-center leading-tight">
                      {recipe.title}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Center hub */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-neutral-900 border-4 border-amber-500 z-10 flex items-center justify-center shadow-2xl">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-neutral-800 border-2 border-amber-500/50 flex items-center justify-center">
              <span className="text-amber-500 text-[8px] sm:text-[10px] font-black">FAN</span>
            </div>
          </div>
        </div>
      </div>

      {/* Spin button */}
      <button
        onClick={spin}
        disabled={spinning}
        className={`mt-8 px-10 py-4 rounded-xl font-bold text-base transition-all cursor-pointer ${
          spinning
            ? "bg-neutral-800 text-neutral-500 cursor-wait"
            : "bg-amber-500 text-black hover:bg-amber-400 hover:scale-105 shadow-lg shadow-amber-500/20"
        }`}
      >
        {spinning ? "Spinning..." : result ? "Spin Again" : "Spin the Fan"}
      </button>

      {/* Result */}
      {result && !spinning && (
        <div className="mt-10 bg-neutral-900 border border-amber-500/40 rounded-xl overflow-hidden max-w-md mx-auto text-left">
          {result.image && (
            <img src={result.image} alt={result.title} className="w-full h-40 object-cover" />
          )}
          <div className="p-6">
            <p className="text-amber-500 text-[10px] font-bold uppercase tracking-wider mb-2">Tonight you're making</p>
            <h3 className="text-white font-black text-xl">{result.title}</h3>
            <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500">
              <span className="text-amber-400 font-bold">{result.protein}g protein</span>
              <span>&middot;</span>
              <span>{result.calories} cal</span>
              <span>&middot;</span>
              <span>{result.time}</span>
            </div>
            <p className="text-neutral-400 text-sm mt-3 leading-relaxed">{result.makeThisWhen}</p>
            <Link
              to={`/recipes/${result.slug}`}
              className="mt-4 inline-block px-6 py-3 bg-amber-500 text-black font-bold rounded-xl text-sm hover:bg-amber-400 transition-colors"
            >
              Let's Cook &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
