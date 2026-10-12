# Split Plate short-form video QA — stop-ship checklist

Run this for **each publishable cut**, including a teaser, full dinner, adult companion, and comment-recipe cut. Copy the checklist into the project as `QA.md`, fill in source-time evidence and pass/fail, and link it in the handoff. A green HyperFrames `check` is necessary but does not prove the edit has a strong hook or truthful action-to-reward story.

## 1. Before editing: hook audition

- [ ] Name the post's one audience promise and the action that proves it. Record at least two candidate raw events with file and in/out; choose the strongest event **available to this cut** after checking the source-allocation ledger. If no usable event exists, flag a pickup/exception instead of opening on a static shot by default.
- [ ] Watch each candidate at phone size with and without audio. Pick a genuine visible event—a sizzle, flip, crack, crunch, pour, scoop, cheese pull, or moving food/reaction—not a text-only promise, held plate, empty pan, or setup movement.
- [ ] Confirm the chosen event begins within the first second and remains legible through the first 1–1.5 seconds. Inspect frame 0, ~0.5s, ~1.5s, and 3s; a contact sheet alone cannot prove motion or sound.
- [ ] Preserve useful original sound. Listen to the opening with the final voice/sound mix; if the sensory sound is the hook, give it an audible moment before narration or mix it so the action can be heard without drowning Marcus.
- [ ] Make an explicit music-bed decision for this cut. Check the actual narration gaps, sensory hook, mood, and available original tracks; use a quiet, voice-safe bed only if it adds pace or fills unwanted dead air. Record the chosen track/gain or `no music` with the reason. Do not add music automatically merely because a track exists.

## 2. Story and claim QA

- [ ] Hook text and Marcus add complementary information; neither merely reads the other. The first three seconds make the food or practical promise understandable muted.
- [ ] The next shots pay off the opening, with no false action label (for example, an empty pan called a sear). The first distinct payoff and the final plate are visible, not hidden by copy or CTA.
- [ ] Every ingredient, macro, serving, brand, and family-split claim matches the current recipe, actual footage, and user corrections. Unconfirmed claims stay out of postable renders.
- [ ] Match cuts, narration, on-screen text, and real footage timing; a flash-forward is allowed, but the method must become clear afterward. Cut dead air and repeated mechanics while leaving room for the strongest sensory moment.
- [ ] Use one natural CTA, then inspect its entrance, midpoint, and last frame. For recipe cuts, retain the approved modern three-second save treatment where appropriate.

## 3. Production and tracking QA

- [ ] Verify no source-time overlap across publishable cuts or the five reserved clips; update and read back the source-allocation map and `UNUSED_CLIP_INVENTORY` entries.
- [ ] Confirm portrait framing, HDR/SDR decision, brand palette, TikTok safe area, legibility, contrast, and restrained food grade. Inspect contact sheet **and** moving preview.
- [ ] For both cover variants, inspect a real source frame and the ImageGen-polished photographic hero before adding text. Confirm the polish is visible, likeness and food are truthful, type is deterministic, and the selected bold cover matches the final encoded video frame. The tail must be 0.3 seconds (9 frames at 30 fps), with frame-aligned start and total duration; verify it survives export and can be selected. This replaces the one-frame rule, which was too short for the cover selector. A raw still with an overlay does not pass.
- [ ] **Stop-ship food-color gate:** inspect the opening money shot and final food payoff side by side in raw source, prepared clip, and encoded posting MP4. Confirm there is no persistent full-frame scrim, gradient, tint, or opacity layer darkening the food; text contrast must come from localized backing/shadow or placement. Reject and fix any materially pale, muddy, dark, or softened export instead of approving it on preview appearance alone.
- [ ] Before final render, audit keyframe spacing in every active extracted video clip. A one-keyframe/2–3-second clip may preview correctly but stall in layered rendering; re-encode an active proxy to constant 30 fps with a 1-second GOP (`-g 30 -keyint_min 30 -sc_threshold 0 -movflags +faststart`) when warned, preserving its SDR/HLG color tags. Keep the original extract recoverable and compare representative post-fix frames with the approved preview. Do not assume `hyperframes check` detects sparse-keyframe playback stutter.
- [ ] Author timed text, captions, score cards, and CTA overlays as explicit `class="clip"` elements with `data-start`/`data-duration` in the composition HTML. Do not rely on JavaScript-created timed elements: Studio snapshots can look right while the exported MP4 composites every caption at once or omits the cards. Confirm they appear as graphics rows in `hyperframes timeline` and spot-check the **encoded** MP4 at the opening, each chapter, and the CTA.
- [ ] Run `hyperframes check` and inspect opening, key transition, payoff, CTA, and end. Fix semantic defects even when the technical check passes.
- [ ] After preview approval, inspect encoded opening audio/video and encoded CTA/end frames; verify dimensions, duration, full-file decode, and no crash/black tail. Run a short freeze/duplicate-frame scan of the **encoded MP4**, and distinguish intentional still covers or genuinely low-motion food shots from an unintended playback stall. Do not treat browser snapshots as final-render evidence.
- [ ] Before `Ready`: provide both cover options, canonical MP4, caption/hashtags, manifest, inventory row, schedule row when applicable, and readbacks. A preview-only project is **not** `Ready`.

Record any failed item and its fix in the project's `QA.md`. An exception requires Tushar's explicit approval; do not silently waive a failed gate.
