import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Focused cooking mode (full-screen, one step at a time).
 *
 * The article view is for deciding what to cook. This is for standing at the
 * stove with wet hands: one step, large type, the quantities you need for
 * *that* step repeated inline so you're not scrolling back up, a timer when
 * the step names a duration, and a screen that doesn't sleep mid-sear.
 */

/* Words that never identify an ingredient, so they can't be used to match a
   step to a line on the list. Without this, "the" matches everything. */
const STOPWORDS = new Set([
  "the", "and", "for", "with", "into", "from", "your", "about", "each", "plus",
  "cup", "cups", "tbsp", "tsp", "teaspoon", "tablespoon", "ounce", "ounces",
  "oz", "lb", "lbs", "pound", "pounds", "gram", "grams", "ml", "large", "small",
  "medium", "fresh", "freshly", "finely", "roughly", "chopped", "sliced",
  "diced", "minced", "grated", "shredded", "optional", "taste", "room",
  "temperature", "packed", "drained", "rinsed", "divided", "plain", "thick",
  "warm", "cold", "hot", "extra", "whole", "half", "quarter", "about",
]);

/** Ingredient text minus its leading quantity, e.g. "1/2 cup (120 g) milk" → "milk". */
function ingredientKeywords(text) {
  return text
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^a-z\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOPWORDS.has(w));
}

/**
 * Which ingredients does this step actually use? A keyword hit is a heuristic,
 * not a promise — the panel is labelled "likely needed here" and the full list
 * stays one tap away, so a miss costs a scroll rather than a ruined dish.
 */
function matchIngredients(stepText, ingredients) {
  const haystack = stepText.toLowerCase();
  return ingredients.filter((ing) => {
    const words = ingredientKeywords(ing);
    return words.length > 0 && words.some((w) => haystack.includes(w));
  });
}

/** Longest duration named in the step, in seconds. "10 to 13 minutes" → 780. */
function parseTimer(text) {
  let best = 0;
  const minutes = /(\d+)(?:\s*(?:to|through|–|—|-)\s*(\d+))?\s*(?:min\b|minute)/gi;
  let m;
  while ((m = minutes.exec(text)) !== null) {
    best = Math.max(best, Number(m[2] || m[1]) * 60);
  }
  if (best === 0) {
    const seconds = /(\d+)(?:\s*(?:to|–|—|-)\s*(\d+))?\s*(?:sec\b|second)/gi;
    while ((m = seconds.exec(text)) !== null) {
      best = Math.max(best, Number(m[2] || m[1]));
    }
  }
  return best;
}

function mmss(total) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

// Mounted with `key={index}` so moving to another step gives a fresh timer
// rather than carrying the previous step's countdown over.
function StepTimer({ seconds }) {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id);
          setRunning(false);
          try {
            navigator.vibrate?.([200, 100, 200]);
          } catch {
            /* vibration is a nicety, not a requirement */
          }
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  const done = remaining === 0;

  return (
    <div
      className={`mt-6 flex items-center gap-3 rounded-2xl border px-4 py-3 ${
        done ? "border-brand bg-brand/15" : "border-line bg-surface2"
      }`}
    >
      <span
        className={`font-black tabular-nums text-2xl ${done ? "text-brand" : "text-ink"}`}
        role="timer"
        aria-live={done ? "assertive" : "off"}
      >
        {done ? "Time's up" : mmss(remaining)}
      </span>
      <button
        type="button"
        onClick={() => (done ? (setRemaining(seconds), setRunning(true)) : setRunning((r) => !r))}
        className="ml-auto rounded-full bg-brand px-4 py-1.5 text-sm font-bold text-brandink cursor-pointer"
      >
        {done ? "Restart" : running ? "Pause" : "Start timer"}
      </button>
      {!done && running === false && remaining !== seconds && (
        <button
          type="button"
          onClick={() => setRemaining(seconds)}
          className="rounded-full border border-line px-3 py-1.5 text-sm font-semibold text-muted cursor-pointer"
        >
          Reset
        </button>
      )}
    </div>
  );
}

export default function CookingMode({ steps, ingredients, title, onClose }) {
  const [index, setIndex] = useState(0);
  const wakeLockRef = useRef(null);

  const step = steps[index];
  const total = steps.length;

  const next = useCallback(() => setIndex((i) => Math.min(i + 1, total - 1)), [total]);
  const prev = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), []);

  /* Keyboard: arrows to move, Escape to leave. */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [next, prev, onClose]);

  /* Lock the page behind the overlay so a stray scroll doesn't move the
     article underneath. */
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  /* Keep the screen awake while cooking. Unsupported on iOS Safari before
     16.4 and on Firefox — the mode works fine without it, so failures are
     swallowed rather than surfaced. */
  useEffect(() => {
    let cancelled = false;
    async function acquire() {
      try {
        const lock = await navigator.wakeLock?.request("screen");
        if (cancelled) lock?.release();
        else wakeLockRef.current = lock;
      } catch {
        /* denied or unsupported */
      }
    }
    acquire();
    const onVisible = () => {
      if (document.visibilityState === "visible" && !wakeLockRef.current) acquire();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      wakeLockRef.current?.release?.().catch(() => {});
      wakeLockRef.current = null;
    };
  }, []);

  const needed = useMemo(
    () => (step ? matchIngredients(step.text, ingredients) : []),
    [step, ingredients]
  );
  const timerSeconds = useMemo(() => (step ? parseTimer(step.text) : 0), [step]);

  if (!step) return null;

  const toneRing =
    step.tone === "adult" ? "bg-adult text-white" : step.tone === "kid" ? "bg-kid text-white" : "bg-brand text-brandink";

  return (
    <div
      className="theme-fade fixed inset-0 z-50 flex flex-col bg-page text-ink"
      role="dialog"
      aria-modal="true"
      aria-label={`Cooking ${title}`}
    >
      {/* Header: progress + exit */}
      <div className="flex items-center gap-3 border-b border-line px-4 py-3">
        <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-black ${toneRing}`}>
          {step.number}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-ink">{title}</p>
          <p className="text-xs text-muted">
            Step {index + 1} of {total}
            {step.lane && <span className="ml-2 text-faint">· {step.lane}</span>}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-line px-3 py-1.5 text-xs font-bold text-muted hover:text-ink cursor-pointer"
        >
          Exit
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full bg-surface2">
        <div
          className="h-full bg-brand transition-[width] duration-300"
          style={{ width: `${((index + 1) / total) * 100}%` }}
        />
      </div>

      {/* Step body */}
      <div className="flex-1 overflow-y-auto px-5 py-8">
        <div className="mx-auto max-w-xl">
          <p className="text-xl leading-relaxed text-ink sm:text-2xl">{step.text}</p>

          {timerSeconds > 0 && <StepTimer key={index} seconds={timerSeconds} />}

          {needed.length > 0 && (
            <div className="mt-6 rounded-2xl border border-line bg-surface p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-faint">
                Likely needed here
              </p>
              <ul className="mt-2 space-y-1">
                {needed.map((ing, i) => (
                  <li key={i} className="text-base text-muted">
                    {ing}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {step.images?.length > 0 && (
            <div className="mt-6 flex gap-3 overflow-x-auto pb-2">
              {step.images.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  loading="lazy"
                  className="h-40 w-40 flex-shrink-0 rounded-xl border border-line object-cover"
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3 border-t border-line px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={prev}
          disabled={index === 0}
          className="flex-1 rounded-xl border border-line py-3.5 text-base font-bold text-muted disabled:opacity-40 cursor-pointer disabled:cursor-default"
        >
          Previous
        </button>
        {index === total - 1 ? (
          <button
            type="button"
            onClick={onClose}
            className="flex-[2] rounded-xl bg-brand py-3.5 text-base font-black text-brandink cursor-pointer"
          >
            Done cooking
          </button>
        ) : (
          <button
            type="button"
            onClick={next}
            className="flex-[2] rounded-xl bg-brand py-3.5 text-base font-black text-brandink cursor-pointer"
          >
            Next step
          </button>
        )}
      </div>
    </div>
  );
}
