# The Split Plate HyperFrames Style System

Use this as the default visual system for new vertical The Split Plate videos unless Tushar approves a different direction.

## Canvas And Safe Area

- Master canvas: `1080x1920`, `30fps`, SDR Rec.709.
- Reserve the top 8% and bottom 16% for TikTok interface coverage.
- Keep critical copy approximately between `y=160` and `y=1610`.
- Portrait footage fills the frame without unnecessary zooming. Preserve faces, hands, and food action.

## Core Visual Language

- Warm food-first palette:
  - near-black: `#15120F`
  - warm white: `#FFFAF0`
  - lime accent: `#D8F36A`
  - coral accent: `#EF593F`
- Primary typography: Inter, heavy and compact for hooks and payoff copy.
- Utility typography: monospace for eyebrows, macros, labels, and small context lines.
- Information cards use translucent near-black fills, one accent edge or pill, restrained shadow, and enough transparency to preserve the footage.
- Avoid glossy app-store chrome, white sticker canvases, cartoon assets, oversized floating product art, and gimmicky hand/finger graphics.

## Hook Treatment

- The first three seconds must combine moving footage with one clear promise.
- When using the approved typed hook, use loud typewriter clicks, a fast stepped reveal, and show macros or the primary result in the same opening window.
- Do not let a title card or poster hold long enough to make the opening feel static.

## Default Thumbnail And Cover System

- Every publishable video gets a separate `1080x1920` JPG cover in this house style unless Tushar explicitly requests a different direction.
- Use the approved `What I Eat: Yoga + Soccer Day` cover as the visual reference:
  `/Users/tusharsharma/Documents/New project/video-edits/what-i-eat-sep16-yoga-soccer/cover-draft/what-i-eat-yoga-soccer-cover-draft-v1.jpg`
- Start from real footage and use ImageGen to create a polished photorealistic editorial thumbnail. Build one clear hero composition rather than a grid: an expressive creator or food focal point, a strong finished-food foreground, and one or two restrained contextual cues that communicate the story.
- Keep the treatment energetic, warm, high-contrast, and appetizing while preserving recognizable identity, believable skin, real-day context, and truthful food. AI polish must not invent ingredients, macros, results, family members, endorsements, or brand claims.
- Default copy structure: one short bold uppercase headline, one context line, and—when verified—one compact macro/value line. Use warm-white condensed type, lime emphasis on one key word, and lime text inside a translucent near-black rounded pill for macros or the primary value.
- Keep all critical text, faces, and food inside both the vertical-video safe region and the central profile-grid crop. Begin headline copy below the top-interface danger zone and avoid the bottom caption region.
- Generate the photographic composition first, then add or refine the exact approved wording. Inspect every letter, numeral, unit, punctuation mark, hand, face, plate, and package before delivery; if generated typography is not exact, replace it with deterministic typography.
- Deliver the cover as a postable JPG in Downloads and retain a lossless PNG or equivalent project master. Do not overwrite a prior approved cover without an explicit revision request.

## Motion

- Motion is quick and intentional: normally `200-420ms` using `power2.out`, `power3.out`, or a restrained `back.out` only for small icons.
- Prefer one entrance plus a stable hold. Avoid constant bouncing, repeated pulsing, or simultaneous decorative movement.
- Animate wrappers inside `.clip` elements; HyperFrames owns clip visibility.
- Use native HTML/SVG whenever possible so overlays remain sharp and deterministic.

## Approved Final Save Treatment

- Reusable component: `video-edits/hyperframes-components/split-plate-save-glass.html`.
- Show for the final three seconds over moving food, serving, tasting, or creator payoff.
- Center a roughly `620px` wide glass capsule near the middle of the safe frame.
- Use a dark translucent fill around 45-58% opacity, `18px` background blur, a thin light border, restrained shadow, a lime vector bookmark, and minimal copy.
- Default copy structure: `SAVE THIS` plus one short contextual line such as `FOR YOUR NEXT COSTCO RUN`.
- No raster sticker GIF, white sticker background, cartoon pointing arm, or competing CTA ornament.
- Treat the saved dumpling video as the visual reference:
  `/Users/tusharsharma/Documents/New project/video-edits/costco-dumpling-day-staple/composition/index.html`

## Footage Grade

- Default starting adjustments: Saturation `+10`, Exposure `-5`, Brilliance `+6`, Sharpen `+6`.
- Reduce any adjustment that clips highlights, crushes shadows, exaggerates noise, or makes skin or food look artificial.
- Do not stack this grade on footage that is already corrected.
- Inspect source color metadata before authoring. HyperFrames supports HDR: preserve native iPhone HLG/BT.2020 footage through composition and render when the delivery is intended to remain HDR. Never create an SDR proxy solely because the source is HDR.
- Decide the delivery color space from the destination. If an SDR master is required for compatibility or a defined cross-platform workflow, use a deliberate HLG/BT.2020-to-Rec.709 tone map and explicitly tag the working master and final output; never accept an implicit conversion that produces a pale, low-separation result.
- Inspect representative source, working, and final encoded frames. Protect believable skin and food color, visible separation in wood/greens/package colors, and the existing warm black/lime/coral overlay palette.

## Marcus Voice Performance And Pronunciation

- Marcus should sound emotionally engaged by default. Build a restrained performance arc through hook, explanation, reveal, and CTA; do not approve a flat take solely because it is intelligible and correctly timed.
- Prefer an expressive voice model when available and use a few purposeful cues such as `[bright]`, `[confident]`, `[playful]`, and `[upbeat]`; avoid tagging every sentence.
- Preflight brand names and uncommon terms for pronunciation. Use narration-only phonetic spellings where required while keeping the official spelling everywhere the audience reads it. Example: narrate `Danoh's`, display `Dan-O's`.
- Save pronunciation aliases and performance direction with the voiceover script so rerenders do not regress.
- "Still flat" is usually a dynamic-range problem, not an energy problem: a take that is loud and bright from the first word has nowhere left to rise, so it reads as uniform. Open a step below the peak — `[bright, curious]` rather than `[excited]`, no exclamation mark on the opening line — and let the clues and CTA climb. Fixing a flat take by raising the floor everywhere makes it worse.
- Keep the alternate's script on disk next to the original (`voiceover-script-marcus.json` / `-marcus-expressive.json`) so the two takes can be compared as text, and state which factual corrections rode along with the rewrite — an alternate that also fixes wording (for example `butter and vanilla extracts` matching the cover) is not a pure voice change.
- The review gate needs a human listen. An agent can compare scripts, cues, and timing, but it cannot hear the render and must not supply the audible-feeling approval on its own.

## CrumblCreamiCut Series Identity

- Reuse the original Split Plate series logo at `video-edits/hyperframes-components/crumblcreamicut-logo.svg` for future CrumblCreamiCut teasers, flavor builds, and rankings. It is our own pint-and-cookie mark, not Crumbl's corporate logo; do not replace it with a generic cookie logo or redraw it each week.
- Make the correct week number prominent in the opening and keep a smaller logo or series identifier visible through the ingredient/clue sequence. Export a copy of the frozen SVG into each composition's assets so the edit remains self-contained.
- For prep-only teasers, start from the unchanged series protein base, then focus the edit and on-screen clues on the actual additions to each pint. Keep specific flavor names, spins, mix-ins, finished texture, tasting, macros, and ranking for the later builds when the footage does not show them.
- For POV source with room clutter above the work surface, reframe toward the hands, pints, and named ingredients. Use the dark series header for readable branding and safe-zone copy; do not let an upper-room view dominate the hook.
- Give Marcus a genuine performance arc: excited series/week identification, curious or playful ingredient clues, then a warm guess-and-follow CTA. Review a voiced preview for audible feeling, not just correct words and timing. Preserve a more expressive alternate when the first take feels flat.

## Fast-Path Render Contract

- For iPhone HLG/BT.2020 footage with HyperFrames overlays, default to a separated render architecture: build and grade one clean HLG visual master, render the HyperFrames graphics once as a ProRes 4444 alpha layer, composite that layer over the clean master once, then create Marcus, text/original-sound, and other audio variants by stream-copying the approved video and muxing the appropriate audio. Do not rerender the visual timeline for an audio-only change.
- Treat the clean graded master, graphics-alpha render, narration stem, original-sound stem, and final composited video as reusable cached assets. A package with several audio versions should still require only one expensive visual render.
- Before any full-length HDR render, run the same-path encoded proof gate. Test the `0-3s` hook, one representative transition, the CTA entrance, and the final frame using the same codec, color-space handling, layer architecture, and timing logic planned for the final. Extract and inspect frames from those encoded proofs; Studio and browser snapshots alone do not pass this gate.
- For graphics with mutually exclusive cards or nested subcompositions, do not rely only on parent `data-start`/`data-duration` visibility. Give each card an explicit timeline visibility state and confirm that stale cards are absent in the encoded proof.
- Allow at most one unproven full-length HDR pass. If the encoded master disagrees with Studio, do not immediately launch another full render. Isolate the failure in a `3-8s` proof, change the architecture or timing implementation, and prove the correction through the encoded path first.
- Use a compute stop condition: if preflight predicts more than roughly `10 GB` of temporary frames, more than about `8 minutes` for a full pass, or a second full HDR pass, pause the long render and use the separated alpha-composite path unless the requested visual effect truly requires footage and graphics to be rendered together.
- Never create separate full visual renders for cover changes, caption-copy changes that can be made in the graphics layer, or Marcus versus original-sound delivery. Covers remain independent JPG assets; audio variants reuse the exact approved visual stream.
- Clean temporary frame sequences and superseded test renders after the canonical outputs and reusable layers have been verified. Preserve raw footage, approved masters, alpha graphics, audio stems, and inventory evidence.

## Delivery Gate

- Run the HyperFrames check gate, inspect relevant snapshots, and pass the same-path encoded proof gate before a full render.
- Render explicitly in the approved delivery mode: preserve HDR when HDR delivery is intended, or force SDR only after a deliberate tone-mapped Rec.709 workflow has been selected.
- Extract frames from the encoded MP4 at each critical overlay's entrance, midpoint, and final hold.
- The encoded frames—not only Studio/browser preview—must confirm scale, position, safe-zone compliance, legibility, and unobstructed food/face coverage.
- Update the existing inventory row with the final hash after the approved render is copied to its postable location.
- Verify that the matching house-style `1080x1920` JPG cover exists, is readable at phone size, survives the central profile-grid crop, and is copied to the postable location.
