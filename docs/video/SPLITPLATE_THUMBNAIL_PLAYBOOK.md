# The Split Plate Thumbnail Playbook

Read this **before generating or revising any short-form video cover**. This is the source of truth for cover art; the video-edit and production rules link here. A cover is a truthful preview of its specific video, not a separate imagined recipe or scene. Apply new rules going forward; do not silently remake approved older covers.

## Non-negotiable delivery

- Every publishable video has its own clean/editorial and heightened creator-style ("gimmicky") cover options. Keep both; never overwrite an approved version. For a multi-video dinner, make the adult-food and two-plate subjects distinct as required by the dinner package.
- Export each final as a high-quality **sRGB JPG, exactly 1080 x 1920 (9:16)**. Keep the lossless/editable source, source-frame references, and prompt in the video project. Put posting copies in Downloads when surfacing or delivering a video.
- Name files predictably: `<video-slug>-cover.jpg` and `<video-slug>-cover-gimmicky.jpg` (add `-v2`, `-v3`, etc. only for revisions). Record final cover paths in that video's `VIDEO_INVENTORY` production note; a JPG does not get its own video row.
- A cover can be baked into frame 0 only when that video's approved package calls for it. Keep the first *moving* hook immediate; no prolonged still. The dinner rule for standalone manual-upload covers remains an exception: do not bake those into the MP4 by default.

## Visual system

| Role | Default | Use |
| --- | --- | --- |
| Warm black | `#15120F` | Scrim, pill, outline, shadow; avoid flat pure-black slabs |
| Warm cream | `#FFFAF0` | Main headline and supporting type |
| Lime | `#D8F36A` | One emphasized word, score/value, thin accent, or small pill |
| Coral | `#EF593F` | Occasional contrast/series accent, not a second competing headline color |

- Preserve appetizing natural food color and believable skin tones. The palette is for typography and UI treatment, not a lime/coral color cast on the footage. A food-specific pink, orange, or yellow can remain in the photo but must not replace the brand system. Avoid the generic bright-yellow/black clickbait look as the default.
- Use a premium, photoreal editorial hero. One clear subject dominates: finished food, meaningful action, real product, or a recognizable creator reaction. Prefer a strong composition over a collage, floating ingredients, fake packaging, clip-art, or excessive stickers.
- Use bold compact sans-serif uppercase type (Inter heavy/black or close equivalent), warm-cream main words, and at most one lime emphasis. A dark translucent value pill is optional. High contrast comes from placement/scrim/outline, not covering the hero with a giant opaque card.
- Clean cover: composed, food/action-forward, restrained copy. Creator-style alternate: bigger scale, stronger expression or real motion cue, shorter oversized hook, more separation. "Gimmicky" means energetic and instantly legible, not deceptive or cartoonish.

## Face decision: earn the portrait

1. **Show Tushar's face** when the video is driven by his personal take, reaction, tasting, workout effort, family moment, or recognizable creator presence **and** there is a sharp, usable image of him from that shoot or an explicitly approved same-person reference. Give the face a clear emotion or action; do not paste in a neutral headshot just to satisfy a template.
2. **Keep the food/action primary** for recipe, technique, product, and hands-only videos when the payoff is more recognizable than a face. A faceless cover is fully on-brand. Use the real hand action, finished plate, scoop, pan, product-in-use, or family interaction that makes the video specific.
3. **Do not synthesize a lookalike.** If the source face is blurry, obstructed, or absent, use a faceless cover or ask for a real portrait. ImageGen may clean light/background around a real person, but must preserve facial identity, expression, hair, body, clothing, and age. Reject a cover if Tushar says it does not look like him.
4. **Do not invent family participants or expressions.** Show children/other people only when their real appearance and role are part of the actual footage and the moment benefits from their inclusion. Do not manufacture family conflict, endorsements, or reactions.

## Copy and proof

- Lead with **one specific 2-5-word idea**: dish/flavor, transformation, practical result, question, or personal tension. A short series/episode pill is optional. The cover should still make sense at phone-grid size.
- Use a macro/value badge only when the exact numbers, serving basis, and units are checked against the recipe/package. Use `≈` for estimates. Do not attach an adult serving's macros ambiguously to a child's plate or the whole pot. Never invent scores, time savings, or product claims.
- Preserve the video's reveal contract. A teaser can hint at the premise, but must not show a final result or ranking that the actual teaser intentionally withholds. A ranking cover can show scores only when the ranking post itself reveals them.
- Keep essential text, face, and food away from the top search/header and bottom caption zones: on 1080 x 1920, roughly **y=160-1610** and **x=100-980** for critical copy. Also preview the central profile-grid crop; do not place a key word or face at an edge.
- Render type deterministically after image generation if spelling, numbers, or alignment are wrong. Do not publish an otherwise beautiful cover with a wrong brand, macro, episode number, or anatomy.

## Build sequence (use for every video)

1. Read the exact video title, series, CTA/reveal, recipe facts, and canonical MP4/inventory row. Select 2-4 real candidate frames, including the action and payoff; inspect them at full size before choosing.
2. Decide the cover's *job* and face/no-face using the rules above. Write a one-line cover brief: `Subject | promise | verified badge (if any) | face decision`.
3. Build clean and creator-style options from the chosen real footage/photo. Use ImageGen only for restrained crop, light, clarity, background cleanup, and editorial compositing of things genuinely shown. Preserve the actual dish, ingredients, people, products, proportions, and setting. Do not fake a cheese pull, texture, result, or branded item.
4. Add exact typography, export both JPGs, and inspect each at full size **and** small mobile size. Check safe area, profile crop, person identity, food truth, spelling, numbers, anatomy, color, and 1080 x 1920 dimensions. Compare against the video so the cover does not promise a shot or result the post cannot deliver.
5. Deliver both options with the video; record the approved choice and both paths in `VIDEO_INVENTORY`. If the user chooses a new default, preserve the alternate and update only that video's posting pointer.

## Reference covers

- Default editorial warmth and food/creator balance: `what-i-eat-sep16-yoga-soccer/cover-draft/what-i-eat-yoga-soccer-cover-draft-v1.jpg`.
- Heightened but truthful series packaging: `crumbl-creami-cut-week12-pov/cover/crumbl-creami-cut-week12-teaser-cover.jpg`.
- Creator-action alternate: `body-beast-lucky-7-workout-rotation/covers/body-beast-lucky-7-cover-gimmicky-v1.jpg` (reference its energy, **not** its generated facial identity).
- For a hands-only technique, a face is unnecessary: `fastest-way-to-cut-grapes/stills/fastest-way-to-cut-grapes-cover.jpg`.

These are layout/energy references, not permission to copy text, fabricate a person, or override the warm-black/cream/lime/coral system. If an older example conflicts with this playbook, follow this playbook for future covers.

## Reusable generation brief

`9:16 premium photoreal editorial video cover for [exact video]. Reference [actual frame(s)] as the factual source. Hero: [real person/food/action]. Face decision: [why shown or absent]. Preserve [specific identity, dish, ingredients, product, proportions]. Warm natural lighting; warm-black #15120F, cream #FFFAF0, lime #D8F36A, optional coral #EF593F for type/accent only. Exact headline: [2-5 words]. Optional verified badge: [number + serving basis]. Keep critical content inside the safe area and central crop. No invented people, ingredients, packaging, results, text, logos, or watermarks.`
