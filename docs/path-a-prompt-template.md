# Path A Prompt Template & Quality Gate

Path A prompts must **TRANSFORM** an amateur phone still into an appetizing,
editorial-quality food image — not merely polish/color-correct it. This file is
the canonical reference every Path A ship copies from, and it documents the
mechanical gate (`scripts/lint-path-a.mjs`) that fails weak prompts before they
reach Tushar.

> **Why this exists:** grade-only prompts kept slipping through across multiple
> ships ("the images are not transformed"). Prose guidance didn't fix a
> prose-judgment problem. The linter makes the bar mechanical.

---

## The mechanism — what actually transforms an image

A ChatGPT image-to-image pass responds to **directional color/tone moves**, not
to detail verbs. `sharpen` / `define` / `clarify` alone barely register and come
back looking unchanged. Every prompt must lead with:

1. **Grade moves** — a tone verb (`deepen` / `warm` / `brighten` / `cool` /
   `darken` / `lift`) pointed at a **named target color**, each with a
   **guardrail**: `deepen the marinara into rich tomato red — not neon`. Need **≥3**
   per prompt, with **≥2 named colors**.
2. **A texture/dimensionality move** — `sharpen the ice-crystal texture`,
   `gloss the sauce`, `melt-glisten`, `three-dimensional`. Need **≥1**.
3. **A separation move** — the canonical `cool the <X> shadow a half-stop` so the
   subject pops off the counter. Need **≥1**.
4. **A label lock** whenever packaging is in frame — `preserve every printed
   label word at real-camera legibility; do not invent or rewrite any label text`.

### NEVER write a saturation lock

Do **not** write `do not push saturation`, `no vibrance`, `keep colors
unchanged`, etc. Combined with detail verbs it reads as "leave this image alone"
— and that is exactly what comes back. To protect a pale/subtle color, give a
**target + bound** instead: `deepen it into satin sage-green with a soft yellow
cast — but not vivid herb-green, avocado, or neon`. A direction with a guardrail
transforms; a prohibition suppresses. **The linter fails any saturation lock.**

---

## Per-prompt rhythm (mirror the meatball reference)

```
## <slug-matching-the-raw-file-basename>

Polish the <subject> — <inventory of what is ACTUALLY in frame, props included>.
Keep <elements that must not move> exactly as filmed. <≥3 grade moves: deepen/
warm/brighten into named target colors, each with a "— not X" guardrail>. <≥1
texture/gloss move>. <label lock if packaging visible>. Cool the <X> shadow a
half-stop for separation. <Lighting one-liner>. No text.
```

- Opener is always `Polish the…` (the transformation lives in the grade moves,
  not the opener verb).
- Closer is always `No text.`
- **Read every raw frame before writing its prompt.** Filenames and handoff
  captions lie — name the real props you can see (the "MAX FILL" line, the
  MiO "0 CALORIES" badge, the foam ring). If a frame's filename misrepresents its
  contents, exclude it and flag it; never write a prompt for food that isn't there.

Reference files:
- `../Documents/New project/video-edits/meatball-triple-launch-path-a-prompts.md` — the grade-forward reference rhythm.
- `../Documents/New project/video-edits/zero-calorie-shaved-ice-path-a-prompts.md` — a passing 5-prompt set.

---

## The gate — run it before delivering (MANDATORY)

```
node scripts/lint-path-a.mjs <slug>
```

It resolves `<slug>-path-a-prompts.md` in the video-edits dir (override with
`--dir` or `PATH_A_DIR`) and checks every prompt for: `Polish the…` opener,
`No text.` closer, ≥3 grade verbs, ≥2 named colors, ≥1 texture move, ≥1
separation move, label-lock when packaging is present, and **zero saturation
locks**. It prints a per-prompt PASS/FAIL line and a summary.

**Do not deliver a Path A .md until the linter prints
`N/N PASS · 0 saturation-locks · deliver` (exit 0).** If any prompt FAILs,
rewrite it and re-run. When delivering, paste the PASS report alongside the file
path so the quality is verifiable, not vibes.

---

## Scope, output, delivery

- **Scope:** one prompt per image the recipe page actually renders — hero,
  prepImage/servingPhoto, socialImages, ingredientCardPhotos, methodCardPhotos,
  and step images. Typically 5–12 prompts.
- **Output:** 2048×2048, sRGB, WebP, saved over the matching `-polished.webp` in
  `public/images/<slug>/`. Put the spec once in the file header, never per prompt.
- **Tool:** ChatGPT only, image-to-image via file upload. No Path B.
- **Delivery:** write the .md to `~/Documents/New project/video-edits/<slug>-path-a-prompts.md`,
  run the linter, and reply with the PASS report + the file path.
