---
name: splitplate-short-form-editor
description: Edit or review The Split Plate short-form recipe videos using its HyperFrames house rules; handle recuts, speech captions, covers, audio and export QA. Also maintain these editing instructions. Rules-only requests do not start a video; long-form videos use their own playbook.
---

# Split Plate short-form editor

## Locate the rules

For creator-face covers, follow [Tushar's reaction library and October 21 variation rule](../../../docs/video/creator-reactions.md). Use real references to generate fresh story-appropriate ImageGen expressions/poses, avoiding repetitive faces while preserving identity and realistic mouth/teeth. Compare likeness/anatomy to originals; do not routinely ask for another upload. The long-form subscribe intro/outro rule is not a requirement to lengthen Shorts.

Use the current `tusharksharma/tusharksharma` checkout. All paths below are repository-relative. If invoked outside that checkout, locate it or retrieve these documents from the repository before editing; do not invent missing rules. Read `AGENTS.md`, `docs/content-growth-plan.md`, and `docs/video/hyperframes-editing/README.md`.

Set the instruction root to `docs/video/hyperframes-editing/flat/`. Read in this order:

1. `CURRENT_RULES.md` and `WORKSPACE_AGENTS.md`.
2. `SPLITPLATE_PRODUCTION_RULES.md`, `SPLITPLATE_TIKTOK_EDIT_RULES.md`, and `HYPERFRAMES_STYLE_SYSTEM.md` before producing or revising a short.
3. `SPLITPLATE_THUMBNAIL_PLAYBOOK.md` in full before any cover work; `SPLITPLATE_VIDEO_QA_CHECKLIST.md` for each publishable cut.
4. `REAL_RISE_REVIEWER.md`, `REELRISE_LEARNING_MODEL.md`, and applicable Creami or snack-box series rules when choosing or reviewing story and pacing. Use the repository's current strategy over historical scheduling examples.
5. `FRAMEWORK__hyperframes__SKILL.md` for an actual HyperFrames task, then only the selected workflow and domains. Resolve document paths through flat filenames: `skill/references/topic.md` becomes `FRAMEWORK__skill__references__topic.md`. Scripts and media referenced there are not bundled.

The October 14 CURRENT_RULES refresh also governs footage-led runtime, supported personal context, useful brand naming and closing actions, food/family proof, and disclosed AI illustrations of missing footage. Consult its external working-hub references when their additional guidance is required.

The October 24, 2026 section at the top of CURRENT_RULES is the newer user override for cover placement and mix level. Every new short opens on the gimmicky/bold cover for 0.2 seconds (six frames at 30fps). Original/natural clip sound stays about -22 dB, well under Marcus, and music stays very light under the voiceover. That section supersedes older end-tail and louder-bed examples, including the October 10 nine-frame cover tail. Cover truthfulness and the thumbnail playbook's other rules still apply. Do not rebuild an approved export to apply it.

Current user instructions and repository instructions remain authoritative. CURRENT_RULES overrides obsolete snapshot examples; it does not waive footage, package, narrative or QA gates. Do not transplant framework marketing, unrelated workflow defaults or historic cadence into the user's brief. Consult the broader `splitplate-video-production` skill for recipe fidelity, planning handoffs and supplied performance analysis.

## Choose the task boundary

- Rules or agent maintenance: update instructions only. No footage processing, voice generation, renders or publishing.
- Review: inspect the specified version and report timestamped findings; do not silently recut an approved export.
- Edit or recut: preserve originals and resume existing project state. A specific edit does not restart a full creative interview.
- New recipe short: record recipe source, exact build/serving, requested cuts, platform, footage and approved narrative. Use the house format; do not impose an adult/kid split on recipes without one.

Check actual footage, installed renderer/version, ffmpeg/ffprobe, fonts, source color, provider access and costs before promising execution. Treat Marcus `eleven_v4` as the supplied preference: verify availability at use time, report unavailable configuration and do not silently substitute a voice/model. Importing instructions does not install those tools or authorize publishing.

## Editing sequence

Before future paid Marcus narration, read the checkout’s `docs/video/marcus-pronunciation.md`. Check food-name pronunciation against Tushar’s speech, including basmati; do not silently default to Americanized Indian food names. Keep verified model-specific pronunciation controls in the private generation record. This future-recording rule does not regenerate approved takes.

1. **Allocate evidence.** Before assigning raw ranges, read the canonical UNUSED_CLIP_INVENTORY linked in WORKSPACE_AGENTS. Save a source-file/in/out map spanning all required companion cuts and reserves. Apply dinner-package and six-or-more-ingredient comment-cut rules where relevant. Missing ledger access can leave independent planning possible, but cannot justify claiming verified allocation or a complete package.
2. **Audition the opening.** Record at least two available raw events and inspect motion at phone size with and without audio. After the 0.2-second opening cover in step 5, open on genuine moving food proof so the motion is underway within the first second. Keep recipes, brands, family statements and calorie/protein estimates grounded in the actual build and serving basis.
3. **Prepare approval-ready narrative.** Present hook, arc, exact Marcus script, tone and one useful primary closing action (question, save or share) before voice generation or final rendering. Honor explicit prior approval of this exact narrative. A recipe, outline or approval of a different package does not substitute. Compact Creami/comparable recipe-review cuts target about 20 seconds maximum including the cover; this is not a universal duration. Keep concrete Base/Mix-in/Topping stages readable when used; remove public week/episode numbering.
4. **Build picture and text.** Preserve original food/skin color and clarity. Avoid persistent full-frame scrims, routine grades or saturation boosts. Make a deliberate HDR/SDR choice; technical tone mapping must be verified. Use the current Butter Chicken 506-v2 typography hierarchy: Barlow Condensed ExtraBold headlines, selected DM Serif Display italic lime emphasis, and Inter Bold speech captions. Preserve the warm-white/lime/warm-black house palette when adapting external briefs; flag conflicting treatments before adopting a user-approved exception. Use local text backing and safe placement. Sync captions to the final paced narration. Keep exact quantities and the full method in the posting recipe. Follow core timing contracts and animate inner wrappers, not framework-owned clip visibility.
5. **Mix and cover.** Make a per-cut music decision using the user's actual tracks. Keep the clips' original/natural sound very low, about -22 dB and well under Marcus, because the footage often includes kids' noise. Keep music beds very light under Marcus so the voiceover dominates. Briefly lift a genuine sensory sound only when it is not kids' noise, and only at its action time. Judge decoded sound, not fader values. Do not fabricate texture/reaction evidence with sound effects. Produce the required cover options with truthful ImageGen-polished photography; select the gimmicky/bold cover by default and preserve a standalone image. Every short starts with that cover for 0.2 seconds (six frames at 30fps) at the very beginning. This replaces appending approximately 0.3 seconds (nine frames at 30fps) at the end. The October 10 nine-frame end tail had superseded the one-frame tail because that frame was too short to select; keep it as provenance. Cover truthfulness and the thumbnail playbook's other rules still apply. The moving food hook follows immediately. Reuse approved assets when appropriate; expression changes require the specified likeness review. Do not retrofit an approved export unless requested. Provenance: Tushar, October 24, 2026.
6. **Prove the export path.** Follow the house fast-path guidance before expensive full renders. Inspect a short encoded proof through the same intended pipeline, especially native HDR and nested text. Check composition timelines, timed inner panels, graphics rows and source keyframe spacing when relevant. Do not dismiss preview/export differences as harmless warnings. Preserve project-specific fixes and approved originals.
7. **Review and deliver.** Copy the complete source QA checklist into the project as QA.md for every publishable cut; record evidence and failures. Obtain the required finished-preview approval before final rendering. Handle Spanish language QA separately from Tushar's visual/pacing review. Inspect the actual encoded file: motion, caption overlap/timing, opening cover and CTA, food color against raw/prepared frames, audio audibility/headroom against the October 24 mix levels, full decode, freezes, dimensions, and the exact opening cover (0.2 seconds, six frames at 30fps). Confirm the older approximately 0.3-second (nine-frame) cover tail is not appended at the end. Technical validation alone is insufficient.

Before calling a package Ready, satisfy all applicable cover, caption, manifest, inventory, posting-ledger and reserve-clip gates with readbacks. Export real reserves and record verified paths; never fabricate rows to close a gate. If a gate cannot be met, preserve completed work and report the specific missing evidence or requested exception. Creating an edit does not authorize social publishing or scheduling.

## Handoff and revisions

Use the user's production project, outside the public source repo for private material. Preserve the brief, approved script, source allocation, selected tool versions, editable timeline, QA evidence and export paths. Record status as planned, awaiting approval, preview, encoded, verified or Ready according to the evidence.

Tie reviewer timestamps to the exact export. Record accept/adapt/reject/defer decisions for material feedback; predictions are not measured retention or guaranteed outcomes. Revise only affected stages. Report what was actually inspected and any remaining limitations.

For instruction refreshes, preserve the flat snapshot's source notices and provenance, compare substantive changes, and update routing when precedence changes. Do not silently modify approved videos to apply new standing rules.
