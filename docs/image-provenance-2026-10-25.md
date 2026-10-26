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
