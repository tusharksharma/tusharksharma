# Taking a built video package live

A "package" is a finished edit handed over from `~/Documents/New project/video-edits/<package>/`:
an approved MP4, covers, caption, voiceover script, raw clips, and a README. Going
live means three deliverables, in one push, plus a gated fourth:

1. **Recipe entry** live in `src/data/recipes.js`
2. **Video variants** on the GitHub Release CDN
3. **Footage-derived images** — a rich process/step set built from the raw clips
4. **Path A prompt set** (gated — the user regenerates locally, then a second push deploys them)

> Read the package README first. It decides which of the two shapes below you're in.

## Two shapes — check before authoring anything

**New recipe.** The package introduces a dish the site doesn't have. Author the
full entry.

**Existing recipe** (e.g. bavette-steak-fries-chimichurri). The package is a video
for a recipe already on the site. The deliverable is *not* a new entry — it is:

- attach `video:`
- replace the placeholder/stock step images with footage-derived ones
- add `socialImages` + `socialCarousel`
- point `prepImage` / `prepImageCaption` at a real mid-build frame
- record any filmed-vs-site divergence in `meta.macroHonesty`

**Leave the recipe body alone** — ingredients, steps text, macros, splitCook copy.
The README will say so explicitly ("recipe unchanged"); honor it.

### meta.macroHonesty is where filmed shortcuts go

When the episode films a shortcut the written recipe doesn't use — a jarred sauce
instead of the from-scratch one — the macros stop matching what's on screen. Say
that in `meta.macroHonesty` (dinners: **must** be under `meta`, top-level is dead):
which build the numbers describe, what the camera used instead, and that it's the
same dinner either way. Don't silently rewrite the macros to match the shortcut.

## Images

- `ffmpeg -y -loglevel error -ss <t> -i <clip> -frames:v 1 -q:v 2 <out.png>`
- Contact sheets: `magick a.png b.png … -resize 300x533 +append sheet.png`.
  **Never `magick montage`** — it defaults to filename labels and dies with
  `unable to read font ''`.
- Dense sampling when the obvious pick is weak: `-vf "fps=2,scale=400:-1"`.
- Final: `magick <in> -resize x2048 -quality 90 <out.webp>` → 1152×2048 sRGB WebP.
- Check clip rotation first (`ffprobe -show_entries side_data=rotation`). Some
  episodes ship 1920×1080 clips carrying `rotation=-90`; others are natively
  1080×1920 with `rot=0` and need no handling.
- **Look at every frame you name.** Write captions from the pixels, not the
  filename — a kid-plate frame captioned "patties, fries and carrots" turned out
  to be patties only. See `path-a-prompt-template.md` for the same rule and the
  camera-vs-appetite fixes.
- Drop near-duplicates rather than padding the set, and close the numbering gap
  when you do. Delete unreferenced files instead of leaving orphans.

## Video CDN

Uploaded to the GitHub Release `tusharma88/tsp-videos`, tag `videos`:

```
gh release upload videos <files> --repo tusharma88/tsp-videos --clobber
```

The `vercel.json` rewrite maps **by filename only**, so every filename must be
**globally unique** across all recipes. Verify with a range request afterwards:
`curl -r 0-1000 -sI <url>` → expect `206`.

## Before committing

- Assert every image path referenced in `recipes.js` exists on disk — a tiny
  grep-and-test loop over `/images/<slug>/*.webp` catches rename drift.
- `socialCarousel.heroPhoto` must be a **string** (it renders raw, with no
  `resolveImage`); an object renders a black card. Pre-crop the source instead.
- Carousel cards are **client-rendered** — only the hero prerenders into
  `dist/social/<slug>/index.html`. Missing carousel images in `dist/` is not a bug.
- `npm run build` and commit `dist/`; Vercel serves the checked-in build and does
  not rebuild.
- `YourWeek.jsx` is persistent WIP: `git stash push -- src/components/YourWeek.jsx`
  before the build, `git stash pop` after the push.
