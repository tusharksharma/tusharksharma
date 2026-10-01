import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { liveRecipes } from "../data/recipes";
import cardImage from "../utils/cardImage";
import track from "../hooks/useTrack";

const DINNERS = liveRecipes.filter((recipe) => recipe.mealType !== "breakfast");
const COLORS = ["#a95a24", "#b96b3e", "#7b7760", "#5f7755", "#a47339", "#955646", "#686b4d", "#8a7547"];
const SEGMENT = 360 / COLORS.length;
const WHEEL_BACKGROUND = `conic-gradient(${COLORS.map((color, index) => `${color} ${index * SEGMENT}deg ${(index + 1) * SEGMENT}deg`).join(", ")})`;

function randomLineup() {
  const recipes = [...DINNERS];
  for (let i = recipes.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [recipes[i], recipes[j]] = [recipes[j], recipes[i]];
  }
  return recipes.slice(0, COLORS.length);
}

export default function FanSpinner() {
  const [lineup, setLineup] = useState(() => DINNERS.slice(-COLORS.length));
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [rotation, setRotation] = useState(0);
  const spinTimer = useRef(null);

  useEffect(() => () => clearTimeout(spinTimer.current), []);

  function spin() {
    if (spinning || !lineup.length) return;
    const winner = Math.floor(Math.random() * lineup.length);
    const currentAngle = ((rotation % 360) + 360) % 360;
    const targetAngle = (360 - (winner * SEGMENT + SEGMENT / 2)) % 360;
    const alignment = (targetAngle - currentAngle + 360) % 360;
    setResult(null);
    setSpinning(true);
    setRotation(rotation + 360 * 5 + alignment);
    spinTimer.current = setTimeout(() => {
      setResult(lineup[winner]);
      setSpinning(false);
      track("fan_spin", { result: lineup[winner].title });
    }, 4000);
  }

  function shuffle() {
    if (spinning) return;
    setLineup(randomLineup());
    setResult(null);
    setRotation(0);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 sm:py-16 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand mb-2">Feeling Lucky?</p>
      <h1 className="text-3xl font-black text-ink">In the Hands of the Fan</h1>
      <p className="text-muted text-sm mt-2 mb-8">Eight dinner ideas, one easy decision. Spin for tonight's pick.</p>

      <div className="relative w-64 h-64 sm:w-80 sm:h-80 mx-auto">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20 w-0 h-0 border-l-[12px] border-r-[12px] border-t-[22px] border-l-transparent border-r-transparent border-t-brand drop-shadow-lg" aria-hidden="true" />
        <div
          className="w-full h-full rounded-full border-8 border-surface shadow-xl relative"
          style={{ background: WHEEL_BACKGROUND, transform: `rotate(${rotation}deg)`, transition: spinning ? "transform 4s cubic-bezier(0.15, 0.6, 0.15, 1)" : "none" }}
          aria-hidden="true"
        >
          {lineup.map((recipe, index) => {
            const angle = (index + 0.5) * SEGMENT * Math.PI / 180;
            return <span key={recipe.id} className="absolute -translate-x-1/2 -translate-y-1/2 text-white font-black text-xl drop-shadow-md" style={{ left: `${50 + 34 * Math.sin(angle)}%`, top: `${50 - 34 * Math.cos(angle)}%` }}>{index + 1}</span>;
          })}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-surface border-4 border-brand flex items-center justify-center shadow-xl text-brand font-black text-sm">FAN</div>
        </div>
      </div>

      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <button onClick={spin} disabled={spinning} className="px-8 py-3 rounded-xl bg-brand text-brandink font-bold text-sm shadow-lg shadow-brand/20 disabled:opacity-60 cursor-pointer">{spinning ? "Spinning…" : result ? "Spin Again" : "Spin the Fan"}</button>
        <button onClick={shuffle} disabled={spinning} className="px-5 py-3 rounded-xl border border-line bg-surface text-ink font-bold text-sm disabled:opacity-60 cursor-pointer">New lineup</button>
      </div>

      {result && !spinning && (
        <div role="status" className="mt-8 bg-surface border border-brand/40 rounded-xl overflow-hidden max-w-md mx-auto text-left">
          {result.image && <img {...cardImage(result.image, { sizes: "(min-width: 480px) 448px, 100vw" })} alt={result.title} width="640" height="400" className="w-full h-40 object-cover" />}
          <div className="p-5">
            <p className="text-brand text-xs font-bold uppercase tracking-wider mb-2">Tonight you're making</p>
            <h2 className="text-ink font-black text-xl">{result.title}</h2>
            <p className="text-muted text-sm mt-2">{result.time} · {result.protein}g protein · {result.calories} cal</p>
            <Link to={`/recipes/${result.slug}`} className="mt-4 inline-block px-6 py-3 bg-brand text-brandink font-bold rounded-xl text-sm">Let's Cook →</Link>
          </div>
        </div>
      )}

      <div className="mt-10 text-left">
        <h2 className="text-ink text-lg font-black mb-3">On tonight's wheel</h2>
        <ol className="grid sm:grid-cols-2 gap-2">
          {lineup.map((recipe, index) => (
            <li key={recipe.id} className="rounded-lg border border-line bg-surface px-3 py-2 flex items-center gap-3">
              <span className="w-7 h-7 flex-shrink-0 rounded-full text-white text-sm font-black flex items-center justify-center" style={{ background: COLORS[index] }}>{index + 1}</span>
              <span className="text-ink text-sm font-semibold">{recipe.title}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
