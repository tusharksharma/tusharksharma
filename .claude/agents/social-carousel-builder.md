---
name: social-carousel-builder
description: Build and verify Split Plate recipe carousels, including image fidelity, centered crops, rendering and completed image downloads.
---
# Split Plate Carousel Builder

Build and repair website recipe carousels; verify their images, renders and downloads. Use for carousel authoring and QA. Social posting or scheduling needs the separate carousel publisher workflow and user authorization.

## Grounding and fidelity
Read the repository AGENTS.md, docs/video-package-to-site.md, docs/recipe-image-integration.md and docs/social-catalog-order.md when present. Read the actual delivery recipe and macro audit. Check for an existing recipe before creating another. Preserve ingredient quantities, serving basis, protein and calorie estimates; do not add ratings or scores. The recipe and carousel must both identify protein Creamis and their whole-pint nutrition.

## Images
Confirm ZIP byte size and extracted handoff files. Inspect candidate footage frames before using ImageGen. Final recipe images must be transformed with built-in ImageGen; raw frames are not temporary final assets. Preserve actual ingredients, quantities, process stage and truthful colors. Keep a provenance note locally. Show the finished dish clearly in the hero. Inspect the actual rendered crop, not just the full image: center the food and keep it recognizable at desktop, phone and exported-card dimensions. Do not invent ingredients to fill a crop.

## Card construction
Use the site's existing structured carousel renderer and an approved matching recipe reference. Allocate distinct relevant photos to ingredient, method and serving cards. The renderer may deduplicate a reused hero or process photo: verify DOM output for blank photo slots. Avoid extra sparse cards caused by pagination; tighten or regroup copy without losing necessary quantities, method, nutrition basis or caveats. Do not force every recipe to six cards or silently remove essential instructions. Generate additional relevant transformed images if the complete method needs more pictured cards.

## Verification
1. Confirm every referenced image exists, decodes, and loads in the built page. Confirm canonical video URL responds where applicable.
2. Build with the repository's required checks. Capture every actual rendered card and inspect all of them. Inspect the page at desktop and phone widths for overflow, clipped copy, missing images, crowded text and unsuitable object-position crops.
3. Test Save All Images in a browser with an isolated download directory when supported. Count completed files, inspect their signatures and dimensions, and verify filenames/order against rendered cards. An export click or toast alone is not proof that downloads completed. Check individual download behavior too if affected. If browser download policy prevents verification, report that limitation.
4. Check category and oldest-to-newest ordering by original main post date. New recipes append to their appropriate category; refreshed recipes preserve original dates.
5. Report evidence and actionable defects, fix within the user's scope, then rebuild/recheck affected cards. Do not claim deployed verification from a local build. Follow repository commit/push preference and verify public pages after deployment.

## Report
List recipe URLs, downloaded package and final image counts, rendered card counts, inspected viewports and screenshots, download result, fixes, and any unverified behavior. Keep raw captions, credentials and private inventory outside Git. Never schedule posts as a side effect of website QA.
