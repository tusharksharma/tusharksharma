#!/usr/bin/env node
// lint-path-a.mjs — mechanical quality gate for Path A image-polish prompts.
//
// Path A prompts must TRANSFORM the amateur still, not just polish it. Across
// multiple ships, weak grade-only prompts kept slipping through because the
// standard lived as prose guidance. This linter makes the bar mechanical:
// it fails a weak prompt before it ever reaches Tushar.
//
// Usage:
//   node scripts/lint-path-a.mjs <slug>            # resolves the .md by slug
//   node scripts/lint-path-a.mjs <path-to-.md>     # explicit file
//   node scripts/lint-path-a.mjs <slug> --dir <video-edits-dir>
//
// The prompt .md files live OUTSIDE this repo (default: the video-edits dir
// below). Override with --dir or the PATH_A_DIR env var.
//
// Exit code 0 = every prompt PASS and zero saturation-locks (safe to deliver).
// Exit code 1 = at least one FAIL (rewrite before delivering).

import fs from "node:fs";
import path from "node:path";

const DEFAULT_DIR =
  process.env.PATH_A_DIR ||
  "/Users/tusharsharma/Documents/New project/video-edits";

// --- the bar ---------------------------------------------------------------
// A "grade move" = a tone/color verb pointed at a named target. These are what
// actually transform an image in a ChatGPT image-to-image pass; detail-only
// verbs (sharpen/define/clarify) barely register on their own.
const GRADE_VERBS = /\b(deepen|deepens|deepening|warm|warms|warming|brighten|brightens|brightening|cool|cools|cooling|darken|darkens|richen|richens|lift|lifts|lifting|saturate)\b/gi;
// Named color / tone targets — a grade move needs one to count as directional.
const COLOR_WORDS = /\b(red|green|blue|purple|grape|gold|golden|honeyed|amber|white|brown|browned|berry|berry-black|tomato|sage|coral|caramel|pink|blush|char|crimson|scarlet|teal|cold white|blue cast)\b/gi;
// Texture / dimensionality — the "make the food read real" move.
const TEXTURE_WORDS = /\b(sharpen|sharpens|texture|gloss|glossy|glisten|glistening|sheen|crisp|three-dimensional|3d|sparkle|frost|crystal|carameliz|melt|condensation|refraction)\b/gi;
// Separation — the canonical "cool the <X> shadow a half-stop" depth move.
const SEPARATION = /\b(half-stop|separation|separate|separates|pops? off|read three-dimensional)\b/i;
// Guardrail — a target color paired with a bound ("... — not neon"). Warning-only.
const GUARDRAIL = /\bnot\s+(neon|muddy|gray|grey|slushy|candy|candy-apple|avocado|vivid|flat|plastic|washed|burnt|burned|dull|orange|dark|pale|gummy)\b/i;
// SATURATION LOCK — a prohibition that tells the model to leave color alone.
// This is the cardinal sin: it turns the whole prompt into "don't change this".
const SATURATION_LOCK = /\b(?:don'?t|do not|never|no|avoid|without)\s+(?:push(?:ing)?\s+|adding\s+|boost(?:ing)?\s+|increas(?:e|ing)\s+)?(?:the\s+)?(?:saturation|vibrance|vibrancy)\b|\bsaturation\s+lock\b|\bkeep\s+(?:the\s+)?(?:colors?|saturation|vibrance)\s+(?:unchanged|as[-\s]is|flat)\b/i;
// Packaging present → a label-lock phrase is required.
const PACKAGING = /\b(label|package|packaging|bottle|jar|carton|pouch|wrapper|printed|brand|logo)\b/i;
const LABEL_LOCK = /\b(do not invent|do not rewrite|do not alter|don'?t invent|don'?t rewrite|unchanged|real-camera legibility|preserve every|every printed|keep every|as filmed)\b/i;

function resolveFile(arg, dir) {
  if (arg.endsWith(".md") || arg.includes("/")) {
    return path.resolve(arg);
  }
  const candidates = [
    path.join(dir, `${arg}-path-a-prompts.md`),
    path.join(dir, `${arg}-path-a-image-prompts.md`),
    path.join(dir, arg, "path-a-image-prompts.md"),
    path.join(dir, arg, "path-a-prompts.md"),
  ];
  for (const c of candidates) if (fs.existsSync(c)) return c;
  return candidates[0]; // report the primary miss
}

function parsePrompts(text) {
  // Sections start at "## " headers; everything before the first ## is the
  // file header/callout and is not a prompt.
  const parts = text.split(/^## /m).slice(1);
  return parts.map((p) => {
    const nl = p.indexOf("\n");
    const slug = (nl === -1 ? p : p.slice(0, nl)).trim();
    let body = (nl === -1 ? "" : p.slice(nl + 1));
    body = body.split(/^---\s*$/m)[0].trim(); // drop trailing separator
    return { slug, body };
  });
}

function countMatches(re, s) {
  const m = s.match(new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g"));
  return m ? m.length : 0;
}

function lintPrompt({ slug, body }) {
  const fails = [];
  const warns = [];

  if (!/^polish the/i.test(body)) fails.push('missing "Polish the…" opener');
  if (!/no text\.\s*$/i.test(body)) fails.push('missing "No text." closer');

  const gradeMoves = countMatches(GRADE_VERBS, body);
  const colorHits = countMatches(COLOR_WORDS, body);
  const textureHits = countMatches(TEXTURE_WORDS, body);
  const sep = SEPARATION.test(body);

  if (gradeMoves < 3) fails.push(`only ${gradeMoves} grade verbs (need ≥3)`);
  if (colorHits < 2) fails.push(`only ${colorHits} named color targets (need ≥2)`);
  if (textureHits < 1) fails.push("no texture/gloss move (need ≥1)");
  if (!sep) fails.push("no separation move (need a half-stop / depth move)");

  if (SATURATION_LOCK.test(body)) fails.push("SATURATION LOCK — remove the prohibition; give a target color + bound instead");

  if (PACKAGING.test(body) && !LABEL_LOCK.test(body))
    fails.push("packaging in frame but no label-lock phrase");

  if (!GUARDRAIL.test(body)) warns.push("no color guardrail (e.g. “— not neon”)");

  return {
    slug,
    fails,
    warns,
    stats: { gradeMoves, colorHits, textureHits, sep, satLock: SATURATION_LOCK.test(body) },
  };
}

function pad(s, n) {
  if (s.length > n) return s.slice(0, n - 1) + "…";
  return s + " ".repeat(n - s.length);
}

function main() {
  const argv = process.argv.slice(2);
  if (!argv.length) {
    console.error("usage: node scripts/lint-path-a.mjs <slug|path.md> [--dir <video-edits-dir>]");
    process.exit(2);
  }
  let dir = DEFAULT_DIR;
  const di = argv.indexOf("--dir");
  if (di !== -1) { dir = argv[di + 1]; argv.splice(di, 2); }
  const arg = argv[0];

  const file = resolveFile(arg, dir);
  if (!fs.existsSync(file)) {
    console.error(`✗ file not found: ${file}`);
    process.exit(2);
  }

  const text = fs.readFileSync(file, "utf8");
  const prompts = parsePrompts(text);

  console.log(`$ node scripts/lint-path-a.mjs ${arg}`);
  if (!prompts.length) {
    console.error("✗ no `## <slug>` prompt sections found");
    process.exit(2);
  }

  // header spec check (2048 / sRGB / save destination) — file-level, warning.
  // Cookbook items save over `-polished.webp`; dinner recipes overwrite the raw
  // filename in place, so accept a `public/images` save instruction too.
  const headerOk =
    /2048/.test(text) &&
    /srgb/i.test(text) &&
    (/-polished\.webp/i.test(text) || /public\/images/i.test(text) || /save over/i.test(text));

  let passCount = 0;
  let satLocks = 0;
  const width = Math.min(28, Math.max(...prompts.map((p) => p.slug.length)));

  for (const p of prompts) {
    const r = lintPrompt(p);
    if (r.stats.satLock) satLocks++;
    const ok = r.fails.length === 0;
    if (ok) passCount++;
    const s = r.stats;
    const summary = ok
      ? `${s.gradeMoves} grade, ${s.colorHits} color, ${s.textureHits} texture, ${s.sep ? "1" : "0"} sep`
      : r.fails.join("; ");
    const warnTail = ok && r.warns.length ? `  (warn: ${r.warns.join("; ")})` : "";
    console.log(`${pad(r.slug, width)}  ${ok ? "PASS" : "FAIL"}  ${summary}${warnTail}`);
  }

  console.log("----");
  const allPass = passCount === prompts.length && satLocks === 0;
  const headerNote = headerOk ? "" : " · ⚠ header missing 2048/sRGB/-polished.webp spec";
  console.log(
    `${passCount}/${prompts.length} PASS · ${satLocks} saturation-lock${satLocks === 1 ? "" : "s"}${headerNote} · ${allPass ? "deliver" : "REWRITE before delivering"}`
  );
  process.exit(allPass ? 0 : 1);
}

main();
