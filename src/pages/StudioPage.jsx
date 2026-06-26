import { useState, useEffect, useRef } from "react";
import useMeta from "../hooks/useMeta";
import { expandCaption, BRAND_TOKENS } from "../data/brandHandles";

// SHA-256 hex of the gate password. Change it by running:
//   node -e 'console.log(require("crypto").createHash("sha256").update("YOURPW").digest("hex"))'
// and pasting the result here. (Light gate — obscurity, not hard security; nothing
// sensitive lives behind it, just a caption form.)
const PASSWORD_HASH = "3d0030715f16a0631516a2ed77471176c20d605b3ae8014d74f6f05a34fcdc70";
const SESSION_KEY = "studio_unlocked";

async function sha256Hex(str) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

const PLATFORMS = [
  { key: "youtube", label: "YouTube", note: "First line = title (≤100). Plain brand names — no YT handles.", accent: "text-red-400" },
  { key: "instagram", label: "Instagram", note: "IG @ handles. Caption limit ~2,200.", accent: "text-pink-400" },
  { key: "tiktok", label: "TikTok", note: "TikTok @ handles. Caption limit ~2,200.", accent: "text-sky-400" },
];

function Gate({ onUnlock }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setChecking(true);
    const ok = (await sha256Hex(pw)) === PASSWORD_HASH;
    setChecking(false);
    if (ok) {
      sessionStorage.setItem(SESSION_KEY, "1");
      onUnlock();
    } else {
      setError(true);
      setPw("");
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-xs text-center">
        <h1 className="text-2xl font-black text-white">Studio</h1>
        <p className="text-neutral-500 text-sm mt-2 mb-6">Private. Enter the password.</p>
        <input
          type="password"
          value={pw}
          onChange={(e) => { setPw(e.target.value); setError(false); }}
          autoFocus
          placeholder="Password"
          className="w-full px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-sm focus:outline-none focus:border-amber-500"
        />
        {error && <p className="text-red-400 text-xs mt-2">Wrong password.</p>}
        <button
          type="submit"
          disabled={checking || !pw}
          className="mt-4 w-full px-5 py-2.5 bg-amber-500 text-black font-bold rounded-xl text-sm hover:bg-amber-400 transition-colors disabled:opacity-50"
        >
          {checking ? "Checking…" : "Unlock"}
        </button>
      </form>
    </div>
  );
}

function Composer() {
  const [base, setBase] = useState("");
  // null override = derive live from base; a string = manually edited.
  const [overrides, setOverrides] = useState({ youtube: null, instagram: null, tiktok: null });
  const [copied, setCopied] = useState(null);
  const baseRef = useRef(null);

  const valueFor = (key) => (overrides[key] != null ? overrides[key] : expandCaption(base, key));

  function insertToken(slug) {
    const token = `{${slug}}`;
    const el = baseRef.current;
    if (!el) { setBase((b) => (b && !b.endsWith(" ") ? b + " " : b) + token); return; }
    const start = el.selectionStart ?? base.length;
    const end = el.selectionEnd ?? base.length;
    const next = base.slice(0, start) + token + base.slice(end);
    setBase(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + token.length;
      el.setSelectionRange(pos, pos);
    });
  }

  async function copy(key) {
    await navigator.clipboard.writeText(valueFor(key));
    setCopied(key);
    setTimeout(() => setCopied((c) => (c === key ? null : c)), 1500);
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="flex items-baseline justify-between">
          <h1 className="text-3xl font-black text-white">Studio</h1>
          <button
            onClick={() => { sessionStorage.removeItem(SESSION_KEY); window.location.reload(); }}
            className="text-neutral-500 text-xs hover:text-neutral-300"
          >
            Lock
          </button>
        </div>
        <p className="text-amber-400 text-sm font-semibold mt-1">Write once · tag brands per platform · copy.</p>

        {/* BASE CAPTION */}
        <label className="block mt-8">
          <span className="text-white font-bold text-sm">Base caption</span>
          <textarea
            ref={baseRef}
            value={base}
            onChange={(e) => setBase(e.target.value)}
            rows={6}
            placeholder="Write your caption. Tag brands with {raos}, {danos}, etc. — each platform gets the right @ handle below."
            className="mt-2 w-full px-3 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-100 text-sm leading-relaxed focus:outline-none focus:border-amber-500"
          />
        </label>

        {/* BRAND TOKEN CHIPS */}
        <details className="mt-3 text-sm text-neutral-400">
          <summary className="cursor-pointer">Brand tags — click to insert <code className="bg-neutral-900 px-1.5 py-0.5 rounded">{"{slug}"}</code></summary>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {BRAND_TOKENS.map((b) => (
              <button
                key={b.slug}
                onClick={() => insertToken(b.slug)}
                title={`${b.name} — ${b.platforms.length ? b.platforms.join(", ") : "name only"}`}
                className="font-mono text-xs bg-neutral-900 border border-neutral-700 rounded-full px-2.5 py-1 hover:bg-amber-500 hover:text-black hover:border-amber-500 transition-colors"
              >
                {"{" + b.slug + "}"}
              </button>
            ))}
          </div>
        </details>

        {/* PER-PLATFORM OUTPUTS */}
        <div className="mt-8 space-y-5">
          {PLATFORMS.map((p) => {
            const val = valueFor(p.key);
            const edited = overrides[p.key] != null;
            return (
              <div key={p.key} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className={`font-bold text-sm ${p.accent}`}>{p.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-neutral-600 text-xs">{val.length} chars</span>
                    {edited && (
                      <button
                        onClick={() => setOverrides((o) => ({ ...o, [p.key]: null }))}
                        className="text-neutral-500 text-xs hover:text-neutral-300"
                      >
                        ↻ reset from base
                      </button>
                    )}
                    <button
                      onClick={() => copy(p.key)}
                      className="px-3 py-1.5 bg-amber-500 text-black font-bold rounded-lg text-xs hover:bg-amber-400 transition-colors"
                    >
                      {copied === p.key ? "Copied ✓" : "Copy"}
                    </button>
                  </div>
                </div>
                <p className="text-neutral-600 text-[11px] mt-1">{p.note}</p>
                <textarea
                  value={val}
                  onChange={(e) => setOverrides((o) => ({ ...o, [p.key]: e.target.value }))}
                  rows={5}
                  className="mt-2 w-full px-3 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-200 text-sm leading-relaxed focus:outline-none focus:border-amber-500 whitespace-pre-wrap"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function StudioPage() {
  useMeta({ title: "Studio", description: "Private caption composer." });
  const [unlocked, setUnlocked] = useState(() =>
    typeof window !== "undefined" && sessionStorage.getItem(SESSION_KEY) === "1"
  );

  // noindex — never let this surface in search.
  useEffect(() => {
    const el = document.createElement("meta");
    el.setAttribute("name", "robots");
    el.setAttribute("content", "noindex, nofollow");
    document.head.appendChild(el);
    return () => { document.head.removeChild(el); };
  }, []);

  return unlocked ? <Composer /> : <Gate onUnlock={() => setUnlocked(true)} />;
}
