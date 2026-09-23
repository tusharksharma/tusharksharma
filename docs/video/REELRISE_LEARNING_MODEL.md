# Reelrise Learning Model For The Split Plate

Use this file before editing any new raw video after the user shares Reelrise feedback. This is a living rule-based model, not a trained ML model. The goal is to convert repeated Reelrise suggestions into reusable edit decisions so future videos start closer to the final TikTok-ready version.

Use the `Split Plate — Video Performance` Google Sheet when available for performance-informed decisions: `https://docs.google.com/spreadsheets/d/1MiaK6e_GhPSx4LWG0HhB0g3gDX2oVOG1O86LidvtEvQ/edit`.

## Non-Negotiables

- The primary positioning is **high-protein food that fits family life** for English-speaking parents ages 25-45, primarily in the United States and also Australia, the United Kingdom, Canada, and comparable developed English-speaking markets.
- Use a truthful parent or life-stage signal when the premise supports it, but do not force a parent hook onto every post. Creami and dessert videos may lead with flavor, texture, experimentation, or a useful discovery.
- Avoid `zero-guilt`, `guilt-free reward`, cheat-food morality, and similar language. Enjoyment without food guilt is the house voice.
- Do not bake in music by default. The user adds light/trending music inside TikTok.
- If voiceover is proposed, draft the script first and wait for user approval before generating audio or rendering a narrated version.
- If the user gives a recipe page URL, inspect it before writing overlays, voiceover, captions, or handoff copy.
- Latest user correction overrides recipe page text and previous assumptions.
- Every completed video delivery must present content in this order: `TikTok caption`, `TikTok hashtags`, then the recipe or website-agent handoff. Do not make the user ask for caption and hashtags separately.
- The caption and hashtag block must also be stored with the video inventory/package when one is created. The full recipe remains the next block sourced from the matching `thesplitplate.com/social` page or recipe handoff.
- Every publishable version needs purpose-built caption copy and hashtags. Never copy the main caption into a teaser or under-15 discovery post just because the recipe is the same:
  - `Main/full`: keep the complete approved story, recipe context, macros, attribution when relevant, and a natural discussion question or website CTA.
  - `7-second teaser`: use a short curiosity gap tied to the exact teaser visual. Withhold the full method, avoid `comment recipe`, and end with a guess, reveal, or anticipation question.
  - `Under-15 comment-recipe`: lead with the clearest result or macro promise, name only the defining build, and end with `Comment "recipe" and I'll send it.` Do not repeat the main post's long story.
  - `Clean editing master`: it may inherit the main caption metadata because it is not a separate publishing concept.
  - Change the hashtag set by intent as well: main tags describe the complete recipe and audience, teaser tags support curiosity/discovery, and comment-recipe tags emphasize searchable recipe and meal terms.
- After every completed canonical post-ready export, append the file to the `VIDEO_INVENTORY` Google Sheet whether it uses Marcus voiceover, original sound, ASMR, or no narration. Store its creation time, title, version, duration, canonical path, SHA-256 checksum, social caption, hashtags, audio style, series, series entry, and platform. Record materially revised exports or platform-specific edits as separate versions when their content differs. Exclude internal previews, superseded drafts, byte-identical package/download copies, and perceptually equivalent re-encodes after verifying audio/video similarity.
- Inventory is a completion gate, not a later cleanup task. A video, recipe package, carousel, or multi-version delivery is not complete until every canonical deliverable has been added to `VIDEO_INVENTORY` with its caption and hashtags, and the written rows have been read back and verified. For dinner builds, check for the Split Plate main, adult main, and 7-second teaser, plus an under-15 comment-recipe cut when the six-ingredient rule applies or Tushar requests it. Inventory any retained clean, text/original-sound, Marcus, or other canonical variant separately. Each existing canonical MP4 gets a separate row even when its recipe, caption family, or duration matches another version; explicitly note any intentionally omitted optional format.
- Track recurring series explicitly. `Protein Coffee` gets one planned post every week; the 100-Calorie Iced Protein Coffee ASMR edit is Episode 1.
- End recipe videos by saying `Visit thesplitplate.com` and showing `thesplitplate.com` on screen. Do not use `link in bio` unless the user explicitly requests it for a specific post.
- Preserve original portrait framing unless the user explicitly asks for crop/zoom.
- Every new dinner or complex family meal gets two distinct full-length edits from the same raw batch:
  - `Split Plate full`: the family-system story, shared cook, adult plate, and the portions/finishes Tushar served his kids based on their appetites.
  - `Adult full`: the adult build, technique, macros, taste, meal prep, and adult finish. Do not make the kid plate or kid portions part of this edit's story.
- Draft separate Marcus scripts and frame plans for both dinner full edits and get user approval before generating either narration or rendering. The two edits need materially different hooks, visual spines, captions, hashtags, inventory rows, and package references when the footage allows it; a narration-only variation does not count as the second full edit.
- For dinner raw batches, allocate and build `7-second teaser` + `Split Plate full` + `Adult full` together, with an `under-15 comment-recipe` cut when the complete served recipe has six or more ingredients or Tushar explicitly requests it, plus useful future reserve clips. Teaser and comment-recipe cuts remain purpose-specific and must not simply shorten either full edit. Audit all raw source-time ranges before delivery.

## Evidence Boundary And Four-Week Experiment

- Treat Reelrise creative suggestions as hypotheses and prompts. Do not repeat unsupported explanations about how the algorithm works.
- Do not claim that four-plus posts confuse TikTok, that a post needs a precise number of hours to breathe, or that a posting time is proven optimal from the available data.
- Beginning 2026-09-28, use `tiktok-performance-2026-09-19/FOUR_WEEK_EXPERIMENT.md`: 12 videos plus two native carousels per week, no more than two total posts per day, through 2026-10-25.
- Weekly target: five Creami installments, three dinner or quick-meal videos, two practical kitchen shortcuts, two personal family-food stories or opinions, and two native carousels.
- Temporarily reduce routine workout logs and repetitive numbered Snack Box episodes without deleting or renumbering their backlog.
- Measure attributable follows per 1,000 views, total weekly follower growth, aligned-age retention, and relevant audience comments. Views measure reach, not follower fit.
- Mark unavailable retention, saves, profile visits, or follower attribution as unavailable. Never fill missing evidence with an algorithm theory.

## Feedback Ingestion

When the user pastes Reelrise feedback:

1. Separate advice into these buckets:
   - `Hook`: what should happen in the first 1-3 seconds.
   - `Story`: what value proposition the video should communicate.
   - `Pacing`: what to cut, speed up, slow down, or remove.
   - `Text`: what overlays are needed and where.
   - `Voiceover`: what should be said and why.
   - `Engagement`: comment prompt or save/share prompt.
   - `Caption/Hashtags`: caption hook, debate angle, SEO/search terms, and relevant hashtags.
   - `Platform Risk`: anything that may trigger TikTok low-quality/static/unoriginal flags.
2. Ignore music recommendations unless the user explicitly asks to add a track.
3. Convert the advice into edit rules, not one-off edits.
4. If a rule repeats across multiple videos, promote it into `SPLITPLATE_TIKTOK_EDIT_RULES.md`.

## Current Learned Rules

### Hook

- The first frame must show motion or tactile food action: pour, sprinkle, crunch, pull, chop, sizzle, hand rotation, sauce spread, bite, or food entering frame.
- Tushar reports that the 7-second PB2-versus-regular-peanut-butter comparison performed well despite—or possibly helped by—an unplanned spoon fall near the opening. Treat this as a creative learning, not proof of causation: audition genuine small surprises as pattern interrupts instead of automatically cleaning them away. For future cuts, make a real event the first-second visual hook and let macro text supply the reason to care; do not fake an accident or rely on a static macro card alone.
- Avoid static plated food, website/tablet pages, macro cards, or anything that looks like a slideshow at `0:00`.
- For dinner recipes, flash the split-plate payoff within the first 3 seconds when footage exists.
- Strong dinner hook pattern:
  - `0.0-1.5s`: sensory action.
  - `1.5-3.0s`: adult + kid plate flash.
  - Overlay: `1 PAN = 2 DINNERS`, `1 COOK = 2 PLATES`, or equivalent.

### Story

- The Split Plate is not just recipe content; it is a parent system: one cook, adult plate, kid plate.
- Parent-led posts must reveal the relevant life-stage situation early: family dinner, school lunch, bedtime, work schedule, feeding different appetites, grocery pressure, or fitting training around children. Dessert and recipe-first posts can remain food-led when forcing a parent reference would weaken the hook.
- For yapping, hot-take, like/dislike, and community posts, never invent Tushar's opinion. Use a topic supplied by Tushar or propose specific candidate topics, then ask for his actual experience, position, nuance/exception, and concrete example before drafting.
- Tushar may answer in fragmented or unpolished notes. Patch those notes into a strong hook, coherent story spine, honest tradeoff, and specific comment question while preserving his meaning and speaking style.
- Do not sanitize a real opinion into generic creator advice, and do not make the claim more absolute, medical, moral, or controversial than Tushar intended.
- Community footage may come from cooking, grocery shopping, tennis, family-meal prep, mistakes, or existing recipe B-roll. Keep the visuals relevant to the thought, but do not force the narration to become a recipe summary.
- The approved Protein Checkpoint System video is the reference pattern: personal context, explicit `this works for me` framing, practical examples, a meaningful limitation, and an answerable closing question.
- Do not force `high-protein` into every recipe title. For naturally protein-rich foods such as steak or chicken, use a title that communicates the real hook or use case; keep the protein number in the macro overlay and recipe data. Reserve `high-protein` title language for meaningful transformations such as higher-protein mac and cheese, desserts, cereal, dips, or baked goods.
- For dinners, explain the split logic early: adult version plus kid-friendly version from the same cook.
- For non-dinner powerups, lead with the use case: post-workout, in a pinch, quick breakfast, dessert that fits macros, meal prep, hydration.
- Do not project adult calorie, protein, keto, or bodybuilding goals onto kids. The Split Plate position is that kids can eat normal pasta, rice, bread, fruit, cheese, nuggets, sugar, and dessert within varied, balanced meals. Easy upgrades are optional tools when enjoyment is unchanged, not rules or moral improvements. Use `everyday foods`, `fun foods`, `balance`, and `moderation`; avoid making children afraid of normal food or labeling foods as good, bad, clean, or cheat foods.
- Mention the practical “why” behind key ingredients when it builds credibility:
  - Creami: `2% ultra-filtered milk` because a little fat helps texture.
  - Guar gum: tiny amount for creamy texture, not icy.
  - No-judge sauces: weeknight shortcuts for busy parents.
- For `CrumblCreamiCut`, the recurring story is a cut-friendly Creami recreation of the actual current Crumbl cookie/dessert flavor. Keep the official flavor identity recognizable, then explain the one or two changes that translate it into ice cream.

### Pacing

- Cut repetitive mechanical actions hard: long stirring, scraping, seasoning shakes, machine locking, button pressing, packaging handling, empty-pan time.
- Keep only tactile confirmation beats for appliances: lock, button, result.
- Speed up mechanical prep usually `1.5x-3x`; heavier repetitive sections can go higher if still readable.
- Slow or hold sensory moments: pour, crunch, sauce drizzle, cheese pull, first scoop, final plated reveal.
- Dinners can breathe. Do not force every dinner into 30 seconds.
- Interpret Reelrise `Magic Cut` recommendations as one decisive visual beat per required step. Remove duplicate angles and repeated mechanics first; do not achieve brevity by rushing every surviving shot.
- ASMR and original-sound-only edits need real-time ingredient actions. Favor narrow source windows and hard cuts over high-speed compression; if the audio sounds fast-forwarded, the edit is no longer functioning as ASMR. Give ingredient overlays roughly 2.5-4 seconds when there is no narration carrying the recipe information.
- A shorter dinner edit still needs one concise connection beat in the narration. Aim for efficient storytelling, not a breathless ingredient roll call.
- Typical targets:
  - Micro snack/drink: `10-25s`
  - Simple powerup: `20-45s`
  - Simple dinner: `45-60s`
  - Involved split-plate dinner: `60-90s`
- `CrumblCreamiCut` episodes may reuse a short standard-base montage or skip directly to the flavor build. Do not spend half the episode re-teaching the unchanged base; prioritize the weekly flavor addition, spin texture, mix-in/garnish, and final scoop.

### Text Overlays

- Use short, top-middle or lower-third text that helps scanning without hiding the food.
- For simple hack videos, use bold white text with a thick black stroke in the first 2 seconds so the context is instantly clear even without audio.
- Text should carry:
  - hook/macro promise
  - key ingredient or brand
  - split-plate logic
  - unusual technique
  - comment prompt
- Do not write full recipe instructions on screen unless the format is explicitly a tutorial.
- Use quantity overlays only when confirmed by the recipe page, user, or visible footage.
- Good patterns:
  - `300 CAL | 38G PROTEIN`
  - `FAIRLIFE 2% MILK`
  - `1 PAN = 2 DINNERS`
  - `NO-JUDGE CHIMICHURRI`
  - `WHAT'S YOUR GO-TO CREAMI MIX-IN?`

### Voiceover

- Voiceover should build brand connection and authority, not merely read the steps.
- Draft speech before rendering and get user approval.
- Treat spoken transition lines as edit boundaries. Keep the entire phrase over its reaction, impact, or sensory setup shot, extending that footage when needed, and begin the next visual chapter only after the phrase finishes.
- Align voiceover with visuals. If the video shows the ingredient, say the ingredient. If the video shows payoff, say the value proposition.
- Do not put edit-planning language into the spoken script. `Start with the payoff`, `flash forward`, `hook`, and similar terms belong in the frame plan only.
- Avoid wording that accidentally insults or weakens the dish. If a sauce, shortcut, or hack matters, frame it as a useful detail or twist, not as the only reason the recipe works.
- The voiceover should cover the full edit unless there is an intentional sensory pause. If narration ends halfway through, fix it before delivery by slowing the read, adding frame-relevant lines, or both.
- For videos over 25 seconds, draft the voiceover in timed chunks that map to the actual frames. Do not write one short paragraph and hope ElevenLabs stretches naturally.
- If a generated voiceover finishes far before the final payoff, do not deliver it as final. Rework the script so the final third still has narration or a clear intentional audio moment.
- Story is a tool, not a default. Use a personal/context beat only if it makes the edit more watchable or explains the brand logic beyond the recipe steps.
- When a story beat seems useful, propose the exact story topic to the user and ask for their version before adding it to the script.
- Silence can be intentional. A sensory/action beat can breathe for up to about 5 seconds before narration resumes, especially for crunch, pour, scoop, sizzling, or final payoff shots.
- Recipe voiceovers should usually end with the standard CTA: exact ingredient quantities are in the description/caption, then `Visit thesplitplate.com` while `thesplitplate.com` appears on the last visible frame. Keep it conversational and fit it to the footage.
- Do not narrate every exact measurement by default. Measurements belong in the description and on `thesplitplate.com`; use spoken quantities only when they are the hook or materially explain the technique.
- When cutting toward a Reelrise duration target, preserve a short frame-aligned connection beat about the family split, the reusable component, or the real-life reason for the meal.
- Voiceover scripts should include performance direction for emotion, especially at the hook and final comment prompt. Use concise tags where supported, such as `[warm]`, `[playful]`, `[excited]`, `[chuckles]`, `[laughs softly]`, or `[pause]`.
- Final questions should not read like a flat tutorial line. If the goal is engagement, make the read feel amused, curious, or parent-relatable, e.g. `[playful] Would your kids eat the filling, [chuckles] or just steal the puff pastry?`
- Use emotional tags sparingly; too many tags make the read feel artificial and can distract from the food.
- Good voiceover structure:
  - Hook: macro/value promise.
  - Why: one insight that makes the recipe feel intentional.
  - Steps: compressed, only the decision-critical parts.
  - Payoff: texture/flavor/family split.
  - CTA/comment prompt: exact quantities in description, `Visit thesplitplate.com`, plus a low-friction question when there is room.
- Keep empty voice gaps short unless a sensory moment needs room.

### Engagement

- Add a final low-friction question when it fits naturally.
- The ending must contain a complete conversational question plus an explicit invitation to comment. A bare option list is not enough.
- Rotate the prompt across posts: `Help me settle this`, `Comment your pick`, `Vote below`, `Tell me which one you would choose`, or `What would you choose and why?` Do not repeat the same engagement sentence on consecutive videos.
- The on-screen CTA should reinforce the requested action, such as `COMMENT YOUR PICK` or `HELP SETTLE THE DEBATE`, while the voice asks the full question.
- Do not compress the website CTA and comment question into rushed speech. Shorten the copy or extend the final payoff shot when needed.
- The question can address parents or the general food audience. Choose the broadest question that still feels specific to the footage.
- For parent/dinner content:
  - `What's your go-to protein for picky eaters?`
  - `Would your kids eat the deconstructed version?`
- For Creami/dessert:
  - `What's your go-to Creami mix-in?`
- For sauces/snacks:
  - `What would you dip in this?`

### Captions And Hashtags

- Final delivery should always include a TikTok-ready caption and hashtags, whether or not fresh Reelrise feedback was supplied for that edit.
- Output order is mandatory: caption first, hashtags second, recipe/handoff third.
- Keep the posting caption separate from the recipe dump. The full recipe is appended after the caption and hashtag block from the matching `thesplitplate.com/social` content.
- Caption formula:
  - first sentence: hook, hot take, transformation, or macro promise.
  - second sentence: practical parent value, texture payoff, time-saving reason, or split-plate logic.
  - final sentence: a specific low-friction question that invites comments.
- Use Reelrise debate prompts when they fit the content because they can drive comments.
- Default to 4-5 hashtags. Use more only when a platform-specific reason is clear.
- Hashtags should be specific before broad. The preferred mix is: dish or series, recipe format, audience/use case, nutrition or practical benefit, then brand/category when useful.
- Prefer `#ChickenQuesadilla #SplitPlate #FamilyDinner #HighProteinMeals #EasyDinner` over generic-only tags.
- Do not use unrelated viral tags just for reach.
- Do not default to `#fyp`, `#viral`, or other generic reach tags unless they are genuinely part of the content angle.
- Rotate question language across videos. Do not end consecutive captions with the same engagement sentence.
- Latest observed TikTok caption learning from the performance sheet:
  - Best current simple-hack format is concise and benefit-led: `The easiest way to cut a watermelon... No messy slices... Have you tried this...` plus 5 hashtags.
  - Recipe/powerup format can be hook-first, then 4-5 hashtags, then a compact recipe dump if the user wants the caption to carry the recipe.
  - Use macro/time hooks for recipe posts: `200 cal, 22g protein per sandwich. 5 minutes. No cooking.`
  - Use debate or behavior-change hooks when relevant: `Stop using regular milk! Upgrade your cereal...`
  - Default next-video suggestion should include both:
    - a short TikTok-first caption for posting.
    - an optional extended recipe caption when the user wants the full recipe in the description.

#### Last-30 TikTok Learning - 2026-07-22

Source: the 30 most recent TikTok rows in `Split Plate - Video Performance`, covering 2026-07-01 through 2026-07-21.

- Stronger recent caption angles were specific rather than generic: a contrarian sauce claim, a named transformation, a clear macro/time promise, or an immediately understandable series concept.
- The best-performing recent examples opened with one of these shapes:
  - behavior change: `Stop buying...` or `Stop using...`
  - transformation: `Turn last night's leftovers into...`
  - system: `One pan, two plates...`
  - macro comparison: `760-calorie cookie -> 340-calorie Creami`
  - series identity: `Turning Crumbl flavors into high-protein Creamis`
- A concise story or opinion can outperform a recipe-summary opening. Use the recipe details after the posting caption, not as the caption's first line.
- The useful caption length is usually 2-3 short sentences before the recipe block.
- Macro numbers help when they are the transformation. For naturally protein-rich foods, lead with the practical dinner story and keep macros as supporting proof.
- Questions work best when they create an easy choice or debate tied to the actual food: sauce choice, dip choice, adult versus kid build, original dessert versus Creami, or a familiar parent behavior.
- The observed hashtag pattern is usually 4-5 terms: one recipe/dish tag, one format/series tag, one audience/use-case tag, and one or two nutrition or discovery tags.
- Keep brand tags only when the brand is central to the trend or searchable flavor identity, such as CrumblCreamiCut. Do not force brands into routine dinner captions.

### Platform Risk

- TikTok has flagged videos where the violation thumbnails were static plate shots or card-like frames.
- Treat perceptual novelty as a distribution requirement, not just file uniqueness. A new export, new voiceover, different duration, or new overlays do not make a post visually new when most frames come from footage that has already been published.
- Distribution evidence from 2026-07-28: the Grillo's condensed recut, the original Week 3 Creami ranking built from previously published flavor footage, and the templated Week 4 teaser received no normal audience test, while the visually new slow website-page ranking did receive views. This rules out Marcus, brand naming, the account, and static motion as blanket blockers and makes duplicate/repetitive visual classification the primary working diagnosis.
- Do not upload original-sound and Marcus versions of the same visual edit to the same platform. Choose one canonical version.
- A compilation or ranking should use fresh lineup, scoop, reaction, transition, or bridge footage as its visual spine. Previously posted clips may support the story briefly, but should not constitute most of the finished video.
- A recut of an existing recipe needs materially new footage or a clearly different visual treatment, not only tighter pacing, reordered clips, fresh text, or new narration.
- Series teasers need dedicated teaser footage and distinct visual progression. Avoid ending on several seconds of an unchanged setup that closely resembles earlier series episodes.
- After a post receives no audience test, do not immediately upload another perceptually equivalent render. Use a genuinely different visual source for the next test.
- Reduce low-quality/static risk by:
  - avoiding still-looking starts
  - using real motion in the first seconds
  - cutting repeated identical payoff shots
  - avoiding long website/tablet/card footage
  - keeping the full portrait frame clean and sharp
  - avoiding slideshow-only output when a real video edit is available

### Unused Footage Reserve

- Treat repeated-footage suppression as a working hypothesis, not a confirmed TikTok policy. Low distribution can have multiple causes, but future edits must preserve enough visually new material to test this hypothesis properly.
- For every new raw-video batch, create a secondary-footage bank before the primary edit is finalized. Do not use every good shot in the first post.
- Reserve at least `3-6` distinct, useful source ranges when the footage allows it. Favor `1-3s` clips showing different actions or perspectives: ingredient handling, seasoning, appliance action, adult/kid split, serving, plate reveal, bite/reaction, or environmental context.
- Save the reserved ranges as actual trimmed clips under `video-edits/<slug>/broll-bank/`; timestamps alone are not enough because raw files may later move or be archived.
- Add every saved reserve clip to the `UNUSED_CLIP_INVENTORY` tab in the Video Inventory workbook. This sheet is the canonical cross-project discovery layer; the recipe-level `manifest.json` remains the detailed local source of truth. Before labeling it unused, compare its source range against every main, teaser, and comment-recipe manifest for that project and state the result in the inventory notes.
- Give each inventory item a permanent `UC-####` ID. Track `reserved`, `planned`, `used`, or `retired`; when a clip is consumed, retain the row and populate `used_in` instead of removing it.
- Store `video-edits/<slug>/broll-bank/manifest.json` with, at minimum:
  - source filename
  - source in/out timestamps
  - saved clip path
  - short visual description
  - shot type
  - orientation
  - audio usefulness (`clean`, `food sound`, `background noise`, or `mute`)
  - status (`reserved`, `used`, or `retired`)
  - post/version where it was eventually used
- Generate a simple contact sheet for the reserved bank so future community posts, compilations, rankings, teasers, and recuts can be planned visually without reopening every raw clip.
- Use reserved footage first when making a later post about the same recipe. Previously published shots may appear only as brief context unless the new post has a materially different visual spine.
- Once a reserved clip is published, mark it `used` in the manifest. Do not silently recycle it as supposedly new footage in another post.
- Preserve canonical raw footage and the reserved bank even when clearing duplicate exports from Downloads.
- If the source batch does not contain enough distinct footage to reserve, record that limitation in the manifest and identify the specific pickup shots needed before planning a reuse-heavy follow-up.
- Pinned channel introductions and `Family / Food / Fitness` montages are reserve-only builds. Their existing footage must come from clips still marked `reserved` or from raw ranges verified unused across published manifests; published recipe ranges are excluded. Fresh pickup footage should form the visual spine. If the audit cannot establish novelty, do not use the clip.

### Color And Polish

- Apply a default food-forward color pass unless the source already looks polished.
- Reelrise-style baseline: bump saturation and contrast modestly, usually `+5%` to `+15%`.
- Tune by food:
  - fruit, drinks, herbs, and vegetables can take a stronger saturation bump.
  - browned meats, cheese, creamy sauces, chocolate, and brand-package shots need restraint.
- Do not make whites blow out, wood turn orange, greens look neon, or branded packaging drift away from real colors.
- Judge the grade from the contact sheet, not only the first frame.

### Trend Report Intake - 2026-09-10

Treat the supplied Reelrise report as a creative prompt set, not evidence that a format is currently trending. Do not repeat claims such as `platforms heavily reward`, `mandatory for retention`, or `consistently outperform` without stronger current evidence.

- `ASMR Macro-Pour And Texture Hook`: use a real pour, crack, crunch, sizzle, scoop, or Creami texture moment as sensory proof. Preserve useful original sound and reveal the macro promise when the payoff lands. A dedicated microphone is optional; credible source audio matters more than staged ASMR.
- `Split-Plate Recipe Remix`: begin with a recognizable family food and reveal how the same cook becomes a kid presentation and an adult higher-protein plate. Keep normal kid food morally neutral, do not force adult macro products onto children, and do not add shoppable tags unless the post is genuinely monetization content.
- `Three-Layer Sound-Off Hook`: combine moving visual proof, one concise overlay, and complementary voiceover when all three add value. The text and narration must not repeat each other verbatim, and two strong layers are sufficient for ASMR, teaser, or native-text formats.
- `Dinner Rescue Open Loop`: use a real household constraint, show the practical decision, and deliver the finished dish and macros in the same post. Never invent a meltdown, exaggerate family conflict, or cut before the payoff merely to force comments or a second part.
- `Relatable Lunchbox Reality Check`: use actual lunch packing, everyday food, and a specific personal observation. Avoid teacher-conflict bait, defensive nutrition claims, parent shaming, and good-versus-bad food framing.
- `Stacked Micro-Payoff Rhythm`: after dead air and duplicate mechanics are removed, check that longer edits contain a meaningful visual change about every 6-10 seconds. Use short action beats where readable, but preserve breathing room for sensory proof, family context, finished-food inspection, and complete explanations.

These are reusable packaging lenses for existing Dinner, Community, Quick Lunch, Creami, Snack Box, Product, and Carousel slots. They do not add six required weekly posts.

## Edit Decision Model

Apply this sequence before rendering:

1. Inspect footage and make contact sheets.
2. Classify the recipe:
   - `split dinner`
   - `simple dinner`
   - `powerup`
   - `dessert`
   - `drink/snack`
3. Pick the hook:
   - prioritize motion and sensory action.
   - for dinner, add early split-plate flash if available.
4. Build the story spine:
   - hook
   - key ingredients/technique
   - cooking/transformation
   - adult/kid or final payoff
   - engagement prompt
   - for a dinner, build and approve two story spines before rendering: one Split Plate/family spine and one adult-only spine.
5. Choose duration target from the recipe class and footage complexity.
6. Decide speed rules:
   - slow sensory beats
   - speed repetitive mechanics
   - remove dead appliance or scraping time
7. Decide whether the edit needs a story beat:
   - use one only when the footage has a pacing gap, the recipe needs a relatable parent/family reason, or the hook needs more emotional context.
   - ask the user for a specific story topic before adding it.
   - otherwise keep narration focused on frame-relevant steps and value.
8. Draft overlays:
   - no more text than needed
   - show `thesplitplate.com` with the final spoken website CTA
   - no unconfirmed exact amounts
9. Draft caption and hashtags from the Reelrise hook, story, and engagement angle.
10. If narration is useful, draft voiceover and pause for user approval.
11. Create the unused-footage reserve:
   - mark the selected source ranges for both dinner full edits, the teaser, and the comment-recipe cut before calling any range unused
   - save `3-6` distinct unused cuts when available
   - write the B-roll manifest and contact sheet
   - append each saved reserve clip to `UNUSED_CLIP_INVENTORY` and verify the written rows
12. Render:
   - final MP4 with overlays
   - clean MP4 when useful
   - first-frame JPG
   - contact sheet
   - manifest JSON
13. QA before delivery:
   - first frame is action-forward
   - early 3 seconds communicate the value
   - overlays are legible
   - no wrong facts
   - color pass improves food appeal without looking fake
   - 1080x1920
   - no render process left running
   - reserved footage exists or its absence is documented

## Scoring Rubric

Before final delivery, score the draft internally:

- Hook strength: `0-20`
- Story/value clarity: `0-20`
- Pacing/retention: `0-20`
- Text usefulness: `0-15`
- Brand connection: `0-10`
- Platform risk: `0-10`
- Technical quality: `0-5`

If the score is below `80`, revise before presenting unless blocked by source footage.

## Initial Reelrise Lessons Captured

- Bavette steak/fries feedback:
  - lead with split-plate value, not only adult plate beauty.
  - insert adult+kid flash in first 3 seconds.
  - trim seasoning, sauce mixing, and slicing.
  - add comment prompt.
  - use voiceover to explain busy-parent reasoning.
- Creami feedback:
  - add voiceover to build authority.
  - explain ingredient logic, especially texture ingredients.
  - remove appliance dead air.
  - add quick quantity overlays.
  - ask a mix-in question at the end.
  - target around 40-45 seconds for simple assembly dessert.
- Nature's Popsicle watermelon feedback:
  - result-only hooks need context text immediately.
  - simple hack videos should usually stay under 15 seconds when the method is easy.
  - speed repetitive slicing/grid cuts aggressively, around 2x or more if still readable.
  - use a slight saturation/contrast bump so fruit color pops.
  - tie broad viral hacks back to the brand with a parent/family use case, e.g. young kids and less mess.
- Protein Corn Flakes feedback:
  - for simple assembly breakfast hacks, target under 20 seconds.
  - if the recipe has a controversial behavior, lean into the debate with final comment-bait text.
  - warm milk in cereal is a useful "hot take" hook; pair it with a clear protein promise.
  - use full recipe macros from the page for hook text, not only the macro from one ingredient.
  - remove empty bowl/scale setup and compress pouring/microwave steps hard.
- Chicken Quesadilla feedback:
  - this reinforced the dinner rule: show the one-cook/two-plates value in the first 3 seconds, even if the food hook is already strong.
  - do not blindly follow a Reelrise claim that a side-by-side plate exists; verify the frame and avoid saying "adult + kid plates" if the footage only shows one plate.
  - for basic griddle dinners, 40-45 seconds is usually enough; remove repeated tortilla loading and repeated fold/toast beats.
  - if there is no clean split-plate visual, use a concept overlay like `1 PAN = 2 DINNERS` rather than over-describing the frame.
  - the first Marcus VO draft finished around 23s on a 43s edit, which felt empty. Future VO must be timed to the full video and stay related to the visible frame.
- Product-category yapping:
  - lead with a real collection or use-in-motion shot, not a static package lineup.
  - state the creator's honest buying rule, including cost and brand preference, so the post does not read like an undisclosed ad.
  - support broad product claims with primary sources and keep brand-specific nutrition numbers attached to that brand.
  - when quoting website usage, count actual ingredient fields rather than troubleshooting mentions, optional substitutions, or brand references.
  - frame household choices as personal practice, not a universal rule.
  - show varied real uses from prior footage so the value argument is demonstrated instead of narrated over repeated packaging.
- Product-comparison and emergency-backup posts:
  - open on use or a taste-test action, then reveal the compared products; do not lead on a static lineup.
  - save the completed bite and reaction for the final rating or engagement question when a separate tease is available.
  - keep taste judgments explicitly first-person: `my favorite`, `I've tried`, or `I rate`; do not convert them into universal quality claims.
  - product-based macros must follow the physical label and may use a range when the viewer can swap brands or flavors.
  - state clearly when the viewer chooses one option so separate option macros are not mistaken for one combined serving.
  - for product-focused monetization content, do not imply sponsorship or an affiliate relationship unless one exists.
  - a direct comparison can name brands when the brand distinction is the point; otherwise avoid unnecessary brand narration.
  - if a current shoot is missing the package cover, reuse a clear real package frame from the creator's prior footage as a short picture-in-picture callout; do not generate replacement branded packaging.
  - when a featured sauce or product is optional, state that clearly and keep the recipe identity focused on the meal rather than the brand.
- Leftover transformation posts:
  - identify the original dinner and cross-link it so the leftover lunch demonstrates the broader cook-once/use-twice system.
  - lead on the finished transformation in motion, then show the original product or dinner context.
  - keep reheating directions consistent with the original recipe and defer to the current physical package when temperature guidance can change.
- Sub-15-second recipe magic cuts:
  - use hard cuts of roughly 0.9-1.0 seconds for each major ingredient or transformation; do not add decorative transitions.
  - keep the hook and final sensory action slightly longer than the process clips.
  - use single-phrase overlays that can be read within one second; reserve the macros and engagement question for the payoff.
  - when narration is only one closing line, let it begin over the final 4-6 seconds of process/payoff footage rather than compressing speech into the final two seconds.
  - preserve original kitchen sound at full volume before the line, then duck it only while Marcus speaks.
