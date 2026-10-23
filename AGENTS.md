# AGENTS.md - The Split Plate

## Standing Food Principles

Read [The Split Plate ideologies](docs/splitplate-ideologies.md) for confirmed brand beliefs. Anything cooked at home counts as a home-cooked meal, including frozen/convenience ingredients. Put effort into the star of the plate and use practical shortcuts for straightforward sides. Apply this without inventing per-recipe or family claims.

## Content Strategy Standing Rule

The canonical strategy is [The Split Plate 90-Day Content Growth Plan](docs/content-growth-plan.md). Apply it to content planning, production briefs, calendar work, social packages, website destinations, analytics, and commercial content.

1. Protect the core promise: help busy parents make food, family life, and fitness work together through meals and shortcuts they will actually repeat.
2. Serve parents with limited time and different preferences around the table. "One cook, two plates" is the signature food method; Tushar's real routines, opinions, experiments, and tradeoffs provide the broader reason to follow.
3. Give every post exactly one primary job: Reach, Growth, Community, or Monetization. Match its opening, evidence, CTA, and success metric to that job.
4. Keep work connected to one of six pillars: meals that fit real life, useful food knowledge, experiments and discovery, desserts and enjoyable routines, the person behind the system, or products that earn their place.
5. Lead with viewer value before a series name or episode number. Use only claims supported by the footage or reliable source material, keep important text clear of interface controls, and choose one CTA.
6. Product reviews must answer a purchase question with actual use, strengths, drawbacks, fit, and relationship disclosure. A product merely appearing in a recipe does not make the post Monetization.
7. Family-dinner content must show the decision that keeps the cook shared, including the adult/kid split where relevant. Attach adult macros only to the adult serving.
8. Treat 28 weekly posts and four daily slots as capacity ceilings, not quotas. Protect strong ready work, record missed slots, and never treat an unfinished asset as publishable.
9. Capture multiple distinct stories during one real activity, but reserve non-overlapping footage for teasers, mains, rankings, and follow-ups. Do not reuse footage when the brief requires a fresh clip set.
10. Measure posts within the same platform, format, purpose, and age window. Prefer medians, keep missing data blank, track production time, and run one focused experiment at a time.
11. Connect attention to a useful destination: the matching recipe, weekly plan, collection, detailed review, or starting guide. Do not use a generic website CTA when a more relevant destination exists.
12. When a proposed asset conflicts with this rule, surface the conflict before building it and recommend the smallest change that restores alignment. Explicit instructions from Tushar for the current task remain authoritative.

## Path A Image-Prompt Standing Rule

Path A prompts must **transform** an amateur still into appetizing, editorial food photography — not merely polish/color-correct it. The transformation lives in **directional grade moves**: a tone verb (deepen/warm/brighten/cool) pointed at a **named target color** with a guardrail ("— not neon"). Detail verbs alone (sharpen/define) do nothing. **Never write a saturation lock** ("do not push saturation/vibrance") — give a target color + bound instead.

**Hard gate:** before delivering any Path A `.md`, run `node scripts/lint-path-a.mjs <slug>`. It must print `N/N PASS · 0 saturation-locks · deliver` (exit 0); rewrite any FAIL and re-run before delivering. Full rules, per-prompt rhythm, and the canonical reference live in [docs/path-a-prompt-template.md](docs/path-a-prompt-template.md). If the gate was skipped and the set already shipped, disclose the retrospective result rather than quietly backfilling.

## Video & Cover Standing Rule

For future Marcus narration, follow [food-name pronunciation](docs/video/marcus-pronunciation.md): match Tushar’s intended pronunciation, check uncertain terms before bulk paid generation, and preserve already approved takes unless a new correction is requested.

For short-form edits, start with the [editing instruction snapshot, with October 14 current-rule and style-system updates](docs/video/hyperframes-editing/README.md) and its [CURRENT_RULES](docs/video/hyperframes-editing/flat/CURRENT_RULES.md). Those explicit current preferences supersede older examples below and in mirrored playbooks on grading, compact-cut duration, episode numbering and cover tails. Read the snapshot's complete cover playbook before cover work. The [short-form editing agent](.agents/skills/splitplate-short-form-editor/SKILL.md) applies these rules and the full production/QA gates.

The short-form video rules — production, TikTok editing, the HyperFrames visual system, and the cover/thumbnail playbook — are committed in [docs/video/](docs/video/README.md). **Read [docs/video/SPLITPLATE_THUMBNAIL_PLAYBOOK.md](docs/video/SPLITPLATE_THUMBNAIL_PLAYBOOK.md) in full before generating, choosing, revising, or delivering any cover**; it is authoritative when an older cover or a duplicated rule conflicts. Apply new cover rules going forward — never silently rebuild an approved video or cover. These are mirrors of the working copies in `~/Documents/New project/video-edits/`; a rule change updates both in the same commit.

## Video Package Standing Rule

Taking a finished edit from `~/Documents/New project/video-edits/` live means recipe entry + CDN video + footage-derived, ImageGen-transformed images in one push. Transform every image rendered on the recipe page or social carousel with built-in ImageGen before publishing; raw extracted frames are source material, not final site assets. Preserve the actual food, portions, cooking stage, and real setting, and inspect each transformed result. Read the package README first — it decides whether you're authoring a **new recipe** or attaching video/images/carousel to an **existing** one (in which case the recipe body stays untouched). Runbook: [docs/video-package-to-site.md](docs/video-package-to-site.md).

**Recipe-page image gate:** after a Path A or video update, integrate the approved images into the recipe page itself: a polished split hero, purposeful supporting photos, and action-matched images beside the relevant method steps. If the film is a distinct version, give it its own pictured steps while preserving the original method. Visually check the full recipe and social pages at desktop and phone widths before pushing. Full rule: [docs/recipe-image-integration.md](docs/recipe-image-integration.md).

**Carousel image gate:** each ingredient and method card needs its own relevant photo, distinct from the hero and the other cards. The generator removes duplicate photo paths, leaving blank cards if a source is reused. Keep text concise, use only substantiated nutrition claims, and inspect every exported card at its actual square size in a contact sheet before pushing.

**Carousel hero crop gate:** inspect the first card at its rendered crop and confirm the food named in the title is clearly visible. A source photo may contain the dish but still crop it out of the hero strip; choose a different frame or crop when that happens.

**Carousel content gate:** compare a new carousel with a strong prior page from the same series. Replace generic "STEP" headings, copied recipe paragraphs, and storage-only serving cards with concise, recipe-specific instructions and a finished-food payoff. Recalculate displayed macros from the exact ingredient portions before publishing; do not carry an estimate that contradicts its own ingredient list.

**Protein Creami macro rule:** show a supported protein figure on the recipe page and social carousel. When only the common base is documented, label its estimate explicitly as "protein in base" on both surfaces and disclose that finished-pint protein varies with the whey and additions. Publish a finished-pint total only after checking the specific ingredient labels and amounts; never silently replace a missing total with zero or omit protein entirely.

**Creami carousel reference rule:** inspect an existing Creami social carousel before building or revising another one. Use the Week 1 Creami carousels as the layout reference: flavor and supported calories/protein on the hero, concise base and flavor cards, cooking steps, then a whole-pint serving card. Do not put scores, ratings, or rankings on Creami carousels or in their captions; lead with the recipe and its useful details.

## Long-Form YouTube Editing

Follow [Estimated nutrition ending](docs/video/estimated-nutrition-ending.md): after future recipe stories, show estimated calories, macros and supported micronutrients as single rounded values rather than ranges, with an explicit serving basis. Keep the separate final watch-next card within five seconds.

For local media space management, follow [Local video storage](docs/video/local-storage-cleanup.md). Tushar authorizes scratch cleanup when useful and local raw-footage deletion after the exact finished film is verified Public and companion finals are complete. The October 22 post-publication rule supersedes the cloud-copy prerequisite for that film’s local raw sources; preserve shared active sources, finished exports, project records and paid narration. Scheduled is not Public.

For future long-form episodes, read [Intro, music and subscriber treatment](docs/video/intro-music-and-cta.md): use the supplied reusable music/intro library and include thanks/like/subscribe/bell immediately after the intro and at the outro, with a native watch-next end screen. For covers, prioritize [real creator reactions](docs/video/creator-reactions.md); preserve actual teeth and mouth, never synthesize a grin. These October 13 preferences override older generic CTA/cover examples within this scope.

For long-form YouTube edits and reusable long-form rules, use [.agents/skills/splitplate-long-form-editor/SKILL.md](.agents/skills/splitplate-long-form-editor/SKILL.md). Build the picture sequence before matching narration to visible actions and confirmed stories. Frame around food and cooking to reduce clutter; adapt the crop per shot. Record the requested duration, delivery format and credit cap per project rather than inheriting short-form settings.

## Reusable Recipe Video Agent Workflow

For recipe-video planning, production, review, or updates to the reusable workflow, read [.agents/skills/splitplate-video-production/SKILL.md](.agents/skills/splitplate-video-production/SKILL.md). It defines production roles, structured handoffs, recipe fidelity, checkpoints, and quality review across recipes. The existing content strategy and `docs/video/` playbooks remain authoritative over its general defaults, including narrative approval, companion cuts, footage allocation, covers, CTAs, and inventory. A request for rules or planning alone does not start video production.

The skill also routes reference-video analysis, evidence-backed hook options, supplied analytics, audience-question research, and persistent learning notes. Use its linked references for those modes; treat performance explanations as hypotheses and keep private source data out of this public repository. The existing Reelrise learning model and current experiments remain authoritative.

## Split Plate Music Creator

For original music briefs, songwriting, lyric revisions and ElevenLabs Music prompts, use [.agents/skills/splitplate-music-creator/SKILL.md](.agents/skills/splitplate-music-creator/SKILL.md). It asks for reference traits, duration, use and speech overlap, then recommends instrumental, vocal or hybrid arrangements and drafts provider-ready instructions. Read its current-provider research before API work. Prompt and rules requests do not start paid generation or replace approved channel music; existing intro/outro rules remain authoritative.

## Split Plate Recipe Builder

For recipe ideas, ingredient and brand choices, substitutions, recipe development, and saved cooking feedback, use [.agents/skills/splitplate-recipe-builder/SKILL.md](.agents/skills/splitplate-recipe-builder/SKILL.md). It uses the public recipe corpus and scoped learning notes, distinguishes published recipes from untested proposals, and recalculates nutrition for the final quantities. Refresh its corpus when needed and follow the standing food principles above. This route does not initiate video production or website publishing.

## Repository Delivery Preference

For changes Tushar requests in this repository, validate the affected work, then commit and push directly to `main`. Do not open a pull request unless he requests one or repository protections require it. Preserve unrelated work, never force-push to bypass a concurrent change or protection, and report a blocked push honestly. This preference does not authorize unrelated edits or social publishing.

## Split Plate Social Strategist

For YouTube, TikTok and Instagram strategy, watch time, follower growth, content calendars, hooks, captions, title/thumbnail briefs and analytics advice, use [.agents/skills/splitplate-social-strategist/SKILL.md](.agents/skills/splitplate-social-strategist/SKILL.md). Tushar confirmed watch time and followers as the next 90-day priorities on October 22, 2026, with strategy plus content preparation. The canonical content growth plan and food principles remain authoritative. Keep private analytics and the credential-bearing social-view-gains transfer outside this public repository. Strategy requests do not start production, posting or another analytics automation.

## Creator Biography and Personal Stories

Before writing personal first-person narration, creator introductions or community replies, read [About Tushar — biography and story source](docs/about-tushar.md). Reuse only relevant confirmed experiences, preserving historical context and the distinction between firsthand observations and untested expectations. Record new owner-confirmed biography details there with dates; do not invent family stories, credentials or tested recipe results. Follow community rules for AI-assisted replies, and keep medical claims separate from household anecdotes.
