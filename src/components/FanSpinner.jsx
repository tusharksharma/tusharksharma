import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { liveRecipes } from "../data/recipes";

const RECIPES = liveRecipes.filter((r) => r.splitFriendly);
const COUNT = RECIPES.length;
const SLICE_DEG = 360 / COUNT;

const COLORS = [
  "rgb(245, 158, 11)", // amber
  "rgb(239, 68, 68)",  // red
  "rgb(34, 197, 94)",  // green
  "rgb(59, 130, 246)", // blue
  "rgb(168, 85, 247)", // purple
  "rgb(236, 72, 153)", // pink
  "rgb(20, 184, 166)", // teal
  "rgb(249, 115, 22)", // orange
];

export default function FanSpinner() {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [rotation, setRotation] = useState(0);
  const fanRef = useRef(null);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);

    // 3-5 full rotations + random landing
    const extraRotations = (3 + Math.random() * 2) * 360;
    const landingAngle = Math.random() * 360;
    const totalRotation = rotation + extraRotations + landingAngle;

    setRotation(totalRotation);

    setTimeout(() => {
      // Figure out which recipe we landed on
      const normalizedAngle = (360 - (totalRotation % 360)) % 360;
      const index = Math.floor(normalizedAngle / SLICE_DEG) % COUNT;
      setResult(RECIPES[index]);
      setSpinning(false);
    }, 3500);
  };

  return (
    <section className="border-b border-neutral-800">
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-500 mb-2">Feeling Lucky?</p>
        <h2 className="text-3xl font-black text-white">In the Hands of the Fan</h2>
        <p className="text-neutral-400 text-sm mt-2">
          Can't decide what to cook? Let the fan decide for you.
        </p>

        {/* Fan wheel */}
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 mx-auto mt-8">
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
            <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-amber-500" />
          </div>

          {/* Spinning fan */}
          <svg
            ref={fanRef}
            viewBox="0 0 200 200"
            className="w-full h-full drop-shadow-2xl"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: spinning ? "transform 3.5s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none",
            }}
          >
            {RECIPES.map((recipe, i) => {
              const startAngle = i * SLICE_DEG;
              const endAngle = (i + 1) * SLICE_DEG;
              const startRad = (startAngle - 90) * (Math.PI / 180);
              const endRad = (endAngle - 90) * (Math.PI / 180);
              const x1 = 100 + 95 * Math.cos(startRad);
              const y1 = 100 + 95 * Math.sin(startRad);
              const x2 = 100 + 95 * Math.cos(endRad);
              const y2 = 100 + 95 * Math.sin(endRad);
              const largeArc = SLICE_DEG > 180 ? 1 : 0;

              // Text position (midpoint of arc)
              const midRad = ((startAngle + endAngle) / 2 - 90) * (Math.PI / 180);
              const textX = 100 + 60 * Math.cos(midRad);
              const textY = 100 + 60 * Math.sin(midRad);
              const textAngle = (startAngle + endAngle) / 2;

              // Fan blade shape — each slice is a "blade" with a pointed center
              return (
                <g key={recipe.id}>
                  <path
                    d={`M 100 100 L ${x1} ${y1} A 95 95 0 ${largeArc} 1 ${x2} ${y2} Z`}
                    fill={COLORS[i % COLORS.length]}
                    stroke="rgb(10,10,10)"
                    strokeWidth="1.5"
                    opacity={result && result.id !== recipe.id ? 0.3 : 1}
                  />
                  <text
                    x={textX}
                    y={textY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize="6"
                    fontWeight="900"
                    transform={`rotate(${textAngle}, ${textX}, ${textY})`}
                  >
                    {recipe.title.length > 18 ? recipe.title.slice(0, 16) + "…" : recipe.title}
                  </text>
                </g>
              );
            })}
            {/* Center hub */}
            <circle cx="100" cy="100" r="18" fill="rgb(23,23,23)" stroke="rgb(245,158,11)" strokeWidth="2" />
            <text x="100" y="100" textAnchor="middle" dominantBaseline="middle" fill="rgb(245,158,11)" fontSize="6" fontWeight="900">FAN</text>
          </svg>
        </div>

        {/* Spin button */}
        <button
          onClick={spin}
          disabled={spinning}
          className={`mt-6 px-8 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            spinning
              ? "bg-neutral-800 text-neutral-500 cursor-wait"
              : "bg-amber-500 text-black hover:bg-amber-400 hover:scale-105"
          }`}
        >
          {spinning ? "Spinning..." : result ? "Spin Again" : "Spin the Fan"}
        </button>

        {/* Result */}
        {result && !spinning && (
          <div className="mt-8 bg-neutral-900 border border-amber-500/40 rounded-xl p-6 max-w-md mx-auto text-left animate-fade-in">
            <p className="text-amber-500 text-[10px] font-bold uppercase tracking-wider mb-2">Tonight you're making</p>
            <h3 className="text-white font-black text-lg">{result.title}</h3>
            <p className="text-neutral-400 text-xs mt-1">{result.role} &middot; {result.time} &middot; {result.protein}g protein</p>
            <p className="text-neutral-500 text-xs mt-2 leading-relaxed">{result.makeThisWhen}</p>
            <Link
              to={`/recipes/${result.slug}`}
              className="mt-4 inline-block px-5 py-2.5 bg-amber-500 text-black font-bold rounded-xl text-sm hover:bg-amber-400 transition-colors"
            >
              Let's Cook &rarr;
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
