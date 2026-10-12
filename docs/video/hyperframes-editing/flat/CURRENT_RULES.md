# Current Split Plate editing rules

Updated October 11, 2026. Apply these explicit user preferences when older reference sections disagree. System and developer requirements still apply; current task instructions and applicable project `AGENTS.md` remain in force.

## Original picture quality

- No always-on full-frame scrim, gradient, tint, opacity wash, routine saturation boost, creative LUT, or grade over original food footage. Use compact local translucent text backing or reposition copy.
- Preserve original food and skin color, clarity, and sharpness. Inspect source color metadata and make the output color decision deliberately. Preserve native HLG/BT.2020 when delivering HDR; an SDR deliverable requires a verified technical tone map, not a retag or implicit pale conversion.
- Older style-system default SDR and starting grade adjustments do not authorize automatic conversion or grading. Compare raw source, prepared picture, and encoded posting video at the hook and payoff.

## Format and narration

- For upcoming short Creami and comparable compact recipe/review cuts, target a maximum of about 20 seconds including the cover. This is not a blanket limit for informational videos or long-form YouTube.
- Lead with a real moving food payoff: cheese scoop/pull, spoon drag, pour, or another visible sensory event. Voice or a title alone is not the hero.
- When using three assembly stages, show concrete Base, Mix-in and Topping ingredients for about 1.5 seconds each. Keep the method readable and Marcus aligned to the action; do not introduce unexplained silence just to extend text reading time.
- Use expressive Marcus ElevenLabs `eleven_v4` with an appropriate emotional arc, speech-synced readable captions and one natural primary closing question. Keep exact amounts and complete instructions in the posting recipe.
- Remove week/episode numbering from current short-form audience-facing copy. Use natural wording such as “this week” when appropriate. Older numbered examples are references, not permission to restore numbering.
- Preserve factual recipe, serving, brand, macro and family corrections. Show calorie/protein estimates together with the serving basis; never borrow a different build's numbers or invent a reaction or verdict.

## Covers

- Select bold by default. Use a visibly polished, truthful ImageGen photographic hero. Already approved ImageGen-polished assets can be reused; a raw still plus text does not meet the polish requirement.
- A creator-style cover should be heightened and studio-like. Use a genuine same-person reference and an appropriate expressive face when it earns the cover; do not synthesize a lookalike. Obtain likeness approval when an expression is changed.
- Keep a standalone cover image and append the selected bold cover for approximately **0.3 seconds**, frame-aligned: nine frames at 30fps. This supersedes the one-frame/0.03-second rule because that tail was too short to select.
- Verify the exact encoded end frame and duration. Do not retrofit previously approved exports unless asked.

## Sound

- Evaluate music for each cut; rotate the user's original tracks by mood and fit instead of using one universal bed. Around 10% linear gain is a starting point, not a loudness guarantee.
- Preserve and elevate genuine kitchen sounds at their actual action time when useful. Listen to the final mix; timeline presence, a large fader number, or waveform height does not prove audibility.
- Stylized whooshes/chimes may support cuts and graphics. Artificial sounds must not fabricate a food crack, crunch, texture, child reaction or other evidence. Use real sensory sound when available.
- Keep Marcus intelligible and peak headroom intact. Measure final decoded audio and check phone audibility; asset-specific gains and a reviewer's LUFS claim are not universal mix settings.

## Versions and approvals

- Recut as a separate version when requested; preserve approved originals, covers, exports and records.
- Check feedback timestamps against the exact version. Accept, adapt, reject or defer each material suggestion based on footage and truth. Predicted virality and retention are not measured results or guaranteed outcomes.
- Obtain required script and finished-preview approval before final rendering. For Spanish versions, do not ask Tushar to validate Spanish wording; handle language QA and request visual/pacing review instead.
- Validate the encoded file, not just the Studio preview. A technical pass does not prove correct captions, motion, sound, color or story.
- Preserve applicable source-allocation, reserve-clip, package and inventory gates from the production rules. Do not declare a preview-only or incomplete package `Ready`.

## Export lesson from October 11

The Spanish muffin's static nested text clips looked correct in Studio but overlapped in the native-HDR layered export. The corrected project loads GSAP and registers matching composition timelines, with timed opacity on inner panels/spans rather than the framework-owned clip visibility. The revised encoded file was inspected and delivered.

Treat missing sub-composition timelines and preview/export discrepancies as a QA investigation, not harmless warnings by default. Inspect encoded text at the opening, each method stage, CTA and cover. Preserve this fix when rebuilding the muffin; do not run an older generator that restores the defective structure. This is an observed project-specific export lesson, not a claim that every static no-timeline composition is broken.
