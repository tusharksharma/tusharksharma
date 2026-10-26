# Image provenance — Oct 25, 2026

All images below: model=grok (Grok image model, image-to-image), reference = the real repo frame listed. Food, ingredients, cook stage, plating and colors kept; each output inspected before use.

| Output | Source frame | Model |
|---|---|---|
| creamy-sausage-spinach-pasta/hero-polished.webp (+ -sm) | creamy-sausage-spinach-pasta/hero.webp | grok |
| creamy-sausage-spinach-pasta/brown-sausage-polished.webp | creamy-sausage-spinach-pasta/brown-sausage.webp | grok |
| creamy-sausage-spinach-pasta/drain-fat-polished.webp | creamy-sausage-spinach-pasta/drain-fat.webp | grok |
| creamy-sausage-spinach-pasta/spinach-sausage-polished.webp | creamy-sausage-spinach-pasta/spinach-sausage.webp | grok |
| creamy-sausage-spinach-pasta/two-pans-polished.webp | creamy-sausage-spinach-pasta/two-pans.webp | grok |
| pork-lettuce-wraps/hero-polished.webp (+ -sm) | pork-lettuce-wraps/hero.webp | grok |
| pork-lettuce-wraps/step2-raw-pork-polished.webp | pork-lettuce-wraps/step2-raw-pork.webp | grok |
| pork-lettuce-wraps/step3-split-polished.webp | pork-lettuce-wraps/step3-split.webp | grok |
| pork-lettuce-wraps/step4-sauce-mise-polished.webp (+ -sm) | pork-lettuce-wraps/step4-sauce-mise.webp | grok |

Rejected (kept raw): creamy mise-en-place, pork step1-mise, pork step5-lettuce-pork — the model garbled or added package/label text.

| air-fryer-chicken-thighs-cheesy-broccoli/step-10-final-split-plates-polished.webp (1080×1920) | air-fryer-chicken-thighs-cheesy-broccoli/step-10-final-split-plates.webp | grok |

## Oct 26, 2026 — Nov 1–8 carousel workstream

No new images were accepted this run. Retries (model=grok, image-to-image from the real frame) were rejected:

| Attempt | Source frame | Model | Result |
|---|---|---|---|
| creamy-sausage-spinach-pasta mise (try 1) | creamy-sausage-spinach-pasta/mise-en-place.webp | grok | Rejected — returned an unrelated salad scene |
| creamy-sausage-spinach-pasta mise (try 2) | creamy-sausage-spinach-pasta/mise-en-place.webp | grok | Rejected — changed labels (Marinara for Alfredo, fusilli), invented sausage links |
| pork-lettuce-wraps step1-mise | pork-lettuce-wraps/step1-mise.webp | grok | Rejected — unrelated bread/tomato scene |
| pork-lettuce-wraps step5-lettuce-pork | pork-lettuce-wraps/step5-lettuce-pork.webp | grok | Rejected — different dish (pork on cabbage) |

Grok was available, so ImageGen was not used. The carousels for Nov 1, 3, 5, 7 and 8 use existing `-polished` frames that were already in the repo.

## 2026-10-26 — high-protein-taco-bowls (Nov 2 substitute attempt) — REJECTED
- model=grok (GenerateImage image-to-image)
- Source: public/images/high-protein-taco-bowls/hero-split-plate-taco-bowls.webp (real split-plate frame, 1400×2488)
- Output: /home/box/agent-data/agents/deb0caed-…/assets/53a2b55e….jpg (not committed)
- Verdict: REJECTED — altered scene: green tray, granite counter, TV remotes, added chicken. Not used.
- Existing hero-split-plate-taco-bowls-polished.webp / hero-split-plate-polished.webp also fail fidelity (removed sauce bottle, added tomatoes/cheese, different tray/layout). Recipe BLOCKED for Nov 2.

## 2026-10-26 — high-protein-chipotle-cheddar-sauce (Oct 26) Grok retry pass — ALL REJECTED
model=grok (GenerateImage image-to-image from real frames in public/images/high-protein-chipotle-cheddar-sauce/<name>.webp). Outputs in bot attachments store; side-by-sides in /workspace/audit/grok-retry/high-protein-chipotle-cheddar-sauce/. Nothing committed.
| Image | Attempt 1 (strict "restore, same objects/colors") | Attempt 2 ("pixel-aligned enhance only") |
|---|---|---|
| hero | ALTERED – hands repositioned, different counter/background, sauce re-rendered | ALTERED – unrelated portrait of a woman in a café |
| step-01-add-cottage-cheese | ALTERED – labeled cottage-cheese tub, measuring cup, oil bowl added; lid in hand | ALTERED – unrelated café portrait |
| step-02-add-ultra-filtered-milk | ALTERED – "LOCAL FARM MILK" carton, nuts in bowl instead of cottage cheese | ALTERED – unrelated portrait |
| step-03-add-cheddar-powder-and-yeast | ALTERED – "Italian Seasoning" jar, herb-filled chopper | ALTERED – unrelated portrait |
| step-04-blend-sauce | ALTERED – green-flecked mixture, plant, different backdrop | ALTERED – unrelated portrait |
| step-05-smooth-sauce-reveal | ALTERED – different cup, background shelf | ALTERED – unrelated portrait |
| step-06-transfer-sauce | ALTERED – white ramekin, different person/background | ALTERED – unrelated portrait |
Result: Oct 26 carousel BLOCKED (no faithful Grok polish for any card).

## Oct 27 chili-cream-tri-tip-penne — Grok retry pass (2026-10-26)

Source frames: public/images/split-protein-creamy-spinach-pasta/<name>.webp. Strict-restore prompt, model=grok, image-to-image. Side-by-sides: /workspace/audit/grok-retry/chili-cream-tri-tip-penne/<name>-a{1,2}.jpg

| Image | Attempt | Model | Output | Grade | Reason |
|---|---|---|---|---|---|
| step-01-blanch-spinach | a1 | grok | d65a8fcb….jpg | ALTERED | zoomed out to full stove + grates, backsplash changed to square tiles, spinach darker |
| step-01-blanch-spinach | a2 | grok | 71cedb24….jpg | ALTERED | spinach recoloured dark green (real: pale raw), leaf arrangement re-imagined |
| step-05-blend-green-sauce | a1 | grok | 6f56f53c….jpg | ALTERED | background swapped to plain window, new blender base with dial, contents greener |
| step-05-blend-green-sauce | a2 | grok | 65198ca5….jpg | ALTERED | lid removed, base changed to white, background re-imagined |
| step-06-portion-bulk-sauce | a1 | grok | 318ffed9….jpg | ALTERED | invented a person with a visible face, sauce recoloured green, scene replaced |
| step-06-portion-bulk-sauce | a2 | grok | 86e48faf….jpg | ALTERED | round deli tubs became square containers, layout changed |

Result: first 3 ALTERED images all failed after 2 attempts each → **BLOCKED**. step-08 and step-12 not attempted (per rule). No recipes.js/dist changes, no commit, no patch.
