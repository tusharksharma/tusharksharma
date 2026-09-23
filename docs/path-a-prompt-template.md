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

## Camera-vs-appetite fixes (things the phone gets wrong every time)

Recurring failures of the *camera*, not of the cooking. Each one is a food that
photographs unappetizingly and needs a named directional fix. Check the raw
frames against this list before writing — these are usually the single biggest
win in a set.

| What's in frame | How it records | The move |
|---|---|---|
| Green herb sauce (chimichurri, pesto, salsa verde, chermoula) | murky near-black olive — reads as sludge | lift to a **herbaceous mid-green** with visible chopped-herb flecks, chili specks, and a clean olive-oil sheen — not neon |
| Pooled juice from rested steak | bright raw red — reads as **blood** | convert to a rich **mahogany-brown resting jus** with a glossy sheen — concentrated juice, not blood |
| Pan fond / drippings | flat grey | richen to **mahogany-brown** with warm highlights on the rendered fat |
| Par-cooked / pale food mid-progression | looks raw and unfinished | keep it honestly pale and grade only the *done* item — do not "finish" food the footage hasn't cooked |
| Frozen bases, unspun pints | flat and matte | frost/crystal texture + condensation on the vessel |

### Busy-background rule — defocus, never delete

Home-kitchen frames come with an open dishwasher, a dish rack, counter clutter,
and sometimes a **digital photo frame cycling family photos**. The instruction is
always **"let it fall into soft warm bokeh and lose a stop"** — *defocus and
darken, never remove or redraw objects.* Removal invents a kitchen that wasn't
filmed; a stop of falloff plus defocus makes the food the unambiguous subject and
renders faces unreadable at the same time.

If a frame has a face-bearing prop that stays legible after the pass, say so at
review time rather than shipping it silently. A whole clip can share the problem:
when the obvious pick is weak, sample the clip densely (`-vf "fps=2"`) before
concluding a better frame exists.

---

## The gate — run it before delivering (MANDATORY)

```
node scripts/lint-path-a.mjs <slug>
```

It resolves `<slug>-path-a-prompts.md` in the video-edits dir — either at the
top level or inside a per-episode package subfolder (override the root with
`--dir` or `PATH_A_DIR`) — and checks every prompt for: `Polish the…` opener,
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
- **Output:** sRGB WebP in `public/images/<slug>/`. Two conventions, pick by
  content type — put the spec once in the file header, never per prompt:
  - **Dinner / footage-derived sets:** **1152×2048** portrait (9:16, matching the
    filmed frame), regenerated **in place over the original filename**. This is
    what the site actually renders and what recent ships use.
  - **Cookbook items:** 2048×2048, saved over the matching `-polished.webp`.
- **Tool:** ChatGPT / built-in imagegen, image-to-image via file upload. No Path B.
- **Delivery:** write the .md next to the rest of the package —
  `~/Documents/New project/video-edits/<package>/<slug>-path-a-prompts.md` (or at
  the video-edits root for standalone sets) — run the linter, and reply with the
  PASS report + the file path.

### If the gate was skipped

It has happened: a set shipped, images were generated, and the linter was run
only afterwards (bavette-steak-fries, 0/7 FAIL — no `Polish the…` opener, no
`No text.` closer, no separation move, missing label locks). **Disclose it rather
than quietly backfilling.** The images can still be good — a FAIL is a statement
about the prompt's reliability, not proof the output is bad — but the user needs
to know the quality claim behind a delivery was never actually checked. Run the
linter *before* the first message that hands prompts over, every time.
