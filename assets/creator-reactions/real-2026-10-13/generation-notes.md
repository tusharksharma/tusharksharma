# Cutout generation

Built-in ImageGen, October 13, 2026. Six independent background-extraction requests.

## Exact prompt used for all six files

Use case: background-extraction. Asset type: reusable real creator reaction cutout for The Split Plate thumbnails. Input image is the EDIT TARGET, an extracted real video frame. Remove only the kitchen and counter background, producing genuine transparent alpha. Keep the exact real person, existing expression, gaze, mouth opening, actual teeth shape/spacing/color, lips, facial contours, skin texture, hair, cap if present, clothing, jewelry and every visible finger/hand/arm in exactly the photographed pose. Do not repaint, beautify, whiten or reconstruct teeth, change the smile, synthesize any expression, or add parts beyond the original crop. No facial relighting; no face regeneration. Keep the original photographic texture and proportions. Clean hair/garment edge matte, no halo, no added outline, no shadow, no text. Subject remains portrait-oriented at a similar scale.

Each call referenced its matching *-source.png and requested transparent_background=true.

Background extraction only on each real video still; transparent alpha. Preserve actual expression, teeth, lips, eyes, hair, clothes, cap and hands. No face regeneration, whitening, changed grin or invented anatomy. See creator-reactions.md for source-first QA and reuse.

The transformed outputs were compared with their original stills and checked for real alpha. They are visual derivatives, not pixel-identical faces. Keep original extracted face pixels as the default for precise likeness. Do not use these staged reactions as evidence of a live meal reaction.
