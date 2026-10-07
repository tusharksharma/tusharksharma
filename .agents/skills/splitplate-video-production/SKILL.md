---
name: splitplate-video-production
description: Plan, produce, or review The Split Plate recipe videos; analyze reference videos, develop hooks and shot lists, and learn from supplied performance data and audience feedback. Use also for updating its reusable production rules. Rules, analysis, and planning requests do not initiate video production or publishing.
---

# The Split Plate video production

## Purpose and scope

Support the owner's recurring recipe videos with a consistent production process. The brand's public positioning is "One Meal. Two Plates." and high-protein family dinners using the Split Cook Method: one shared cooking workflow for adult and kid plates. Source: https://thesplitplate.com/ (checked 2026-10-06).

These are initial operating rules, not an approved visual identity. The user's recipe, supplied brand assets, and explicit instructions take precedence over proposed defaults. Do not treat suggestions from earlier assistant messages as user-approved preferences.

When asked for rules, templates, or workflow changes, produce those only. Begin a particular video only when requested. This skill supplies instructions, not installed rendering tools or provider credentials.

## Repository rules take precedence

Read the repository-root `AGENTS.md`, `docs/content-growth-plan.md`, and `docs/video/WORKSPACE_RULES.md` first, then the production and format-specific rules they require. Paths in this section are relative to the repository root. This skill adds production roles, handoffs, and resumable state; it does not replace the existing video playbooks.

The existing `docs/video/SPLITPLATE_PRODUCTION_RULES.md` governs explicit narrative approval before Marcus generation/final rendering, companion-cut completeness, source-range allocation, reserve clips, CTA/sticker treatment, inventory, and delivery. Those specific requirements override this skill's general defaults about approvals, single deliverables, timing, CTAs, and asset reuse. Read `docs/video/SPLITPLATE_THUMBNAIL_PLAYBOOK.md` in full before cover work, and the TikTok or YouTube rules for the requested format. Use the established HyperFrames visual system when applicable rather than inventing a provisional brand treatment.

Apply the adult/kid split to family-dinner content where relevant; do not impose it on Creami, sauce, snack, or other recipes without a documented split. Record the post's primary job, audience signal, and one relevant destination in the brief. Attach adult macros only to the adult serving. If existing rules conflict with one another, surface the specific conflict before dependent production rather than silently choosing a new policy. Explicit instructions for the current task remain authoritative.

This repository skill is maintained here. The existing documents in `docs/video/` retain their working-copy mirror policy; this addition does not edit those mirrored playbooks.

## Analysis and learning modes

Read only the reference needed for the task:

- For a reference-video breakdown, edit review, hook alternatives, or evidence-based storyboard, use [video-analysis.md](references/video-analysis.md).
- For supplied performance data, audience questions, hook experiments, or recurring lessons, use [performance-learning.md](references/performance-learning.md). Read the existing `docs/video/REELRISE_LEARNING_MODEL.md` as well; its active experiment and established practices are not replaced by this skill.
- Use [record-templates.md](references/record-templates.md) for the relevant analysis, build, audit, or learning record. Records are created only when there is actual work or evidence to record.
- Attribution, pinned source revisions, adaptations, and license notices are in [upstream-sources.md](references/upstream-sources.md).

For future production, retrieve relevant prior lessons if available, connect the chosen opening to actual recipe footage, and attach any resulting learning note to the existing production records. Do not require analytics or a reference video to produce a recipe video. Distinguish proposed, approved, rendered, and measured states. A script or storyboard is not a finished video.

This update adds rules and templates only. It does not grant permission to post, message viewers, alter calendars, install services, or start background jobs. It does not imply that media tools, analytics access, or Ootto integrations are configured.

## Recipe fidelity

- Use the supplied recipe or fetch the exact recipe URL as the source of truth. Capture its version or retrieval date. Never infer a recipe from its title or the homepage.
- Preserve ingredient quantities, yield, cooking order, temperatures, timings, and the actual adult/kid variations. Resolve material contradictions before finalizing affected instructions.
- Make the shared preparation and the point where servings diverge understandable. If the recipe has no documented split, propose a variation as a proposal; do not present it as part of the original recipe.
- Never invent nutrition numbers, preparation times, dietary suitability, or claims that children will like a dish. If nutrition is shown, retain the source, serving basis, and relevant plate; label calculations as estimates with assumptions. Brand positioning alone does not substantiate a per-recipe protein claim.
- Check that voiceover, on-screen text, ingredient cards, footage, and final plating agree. Editing must not imply that raw food becomes ready to eat without the required cooking step. Use a concise time transition where needed.
- Use welcoming, practical language. Avoid calling one plate virtuous and the other unhealthy, or framing kids' preferences as a failure.

## Adjustable creative defaults

Use these when the user has supplied no contrary direction; record them as assumptions in the brief rather than asking about each one.

- For an unspecified social short, propose a vertical 9:16 cut of roughly 30-60 seconds. Longer tutorials, horizontal videos, silent cuts, and other durations are equally valid when requested or needed by the recipe.
- A useful story shape is: finished-meal hook, shared cooking, the split, both finished plates, then a concise recipe call to action. Vary the hook and pacing across recipes. Do not force every recipe into identical shot counts or timestamps.
- Prioritize clear food textures, meaningful cooking changes, and an understandable plating difference over decorative effects. Hold instructional shots long enough to read the action.
- Use real recipe footage and photos when available. If the user chooses generated visuals, identify them in the production record and avoid presenting synthetic cooking outcomes as photographed evidence of the tested recipe. Generated diagrams and ingredient labels can support explanation.
- Match supplied logos, colors, typography, and previous approved videos. Without those, use a restrained, readable provisional treatment and identify it as provisional. Do not invent an official palette, mascot, slogan, or voice persona.
- Make captions readable on a phone, keep text away from platform overlays, and verify the current target platform requirements at export time. Keep narration intelligible above music. Voiceover and music are optional.
- Use thesplitplate.com or the verified recipe URL for the call to action. Do not claim "link in bio" or another placement unless it is known to exist.

## Production roles and handoffs

Treat these as responsibilities that one agent can perform sequentially. Do not assume that separate autonomous agents or additional services are installed.

| Role | Responsibility | Saved output |
| --- | --- | --- |
| Producer | Establish recipe, audience, format, available assets, scope, and budget | brief |
| Recipe/script editor | Reconcile the source and write the narrative and captions | script with source notes |
| Visual director | Map recipe actions to shots and specify the plating split | shot list or storyboard |
| Asset coordinator | Match footage, photos, narration, graphics, and audio to scenes | asset manifest |
| Editor | Assemble timing, text, audio, and transitions | edit timeline |
| Quality reviewer | Compare the result with recipe, brief, and actual media | review and render report |

For a script-only or shot-list-only request, stop at the requested deliverable. For a complete video request, continue through a verified export within authorized scope.

## Reusable workflow

1. Intake: record recipe title and source, yield, shared method, split instructions, requested deliverables, target platform, available assets, and any supplied brand references. Ask only for missing information that blocks accurate work; continue independent work where possible.
2. Plan: prepare the script and shot list together. Include shot/scene IDs, recipe step, approximate duration, visual action, adult/kid treatment, narration or captions, and required assets. For filming plans, flag missing coverage so it can be captured efficiently.
3. Check feasibility: inspect the actual available tools and assets before promising generated video, voice, editing, or export. Select the smallest workable toolchain. Reuse an established provider or renderer unless there is a concrete reason to change.
4. Produce only the requested assets. Map every asset to a scene and record origin, relevant rights/usage notes, and actual generation cost where applicable. Keep alternate takes distinct and retain approved selections.
5. Edit from the saved scene plan and asset manifest. Use stable IDs so a single shot, caption, or narration segment can be revised without regenerating the whole video.
6. Review against the checks below. Correct issues within scope, then export the requested versions. Report limitations or missing assets plainly instead of describing an incomplete result as finished.

## Checkpoints, costs, and revisions

- Save enough state after meaningful stages to resume: current stage, chosen creative settings, completed files, open issues, and next action. Use the user's existing project layout; otherwise create one folder per recipe production with sources, plans, assets, edits, and exports.
- Reuse existing approvals and instructions. Do not require a fresh approval at every stage. Seek input when a material creative choice cannot be inferred, a recipe change needs confirmation, or new spending exceeds the authorized budget.
- When paid generation is requested, establish a spending cap if none exists; track estimated and actual cost, including failed takes. Do not repeatedly regenerate against an unknown or exhausted budget.
- A small preview is useful for establishing a new visual style or expensive generation route. Reuse a previously accepted style for subsequent recipes unless the user changes it.
- On a failed tool call, diagnose before retrying. Stop repeated attempts when the cause is unchanged; report the blocker and preserve completed work.
- A revision to the recipe or shared preparation may invalidate scripts, footage choices, labels, nutrition, and captions. Review those dependencies. A styling revision should not trigger unrelated recipe or asset changes.
- Creating/exporting a video does not imply publishing it. Publish or schedule only when the user requests that action.

## Final review

Check only what applies to the requested deliverable:

- Recipe: ingredients, quantities shown, cooking sequence, time/temperature labels, yield, and serving variations match the source.
- Brand story: viewers can understand the shared meal and any documented plate differences; no invented recipe adaptation is passed off as established.
- Claims: nutrition and time claims have a traceable basis and correct serving context.
- Media: shots and finished plates match the dish; substitutions, missing footage, or illustrative visuals are recorded honestly.
- Text/audio: captions match speech, ingredient names are correct, text remains legible, and narration is not masked or clipped.
- Export: inspect the rendered video when one exists, including opening, split, final plates, and transitions; check playback, dimensions, duration, sound, and unintended blank frames. Do not claim audiovisual review based solely on metadata.
- Delivery: return only requested formats, with the production files needed for future edits and a concise note of unresolved issues. Never claim a render or upload occurred without evidence.

## Maintaining these rules

Apply one-off feedback to the current video. Promote it to a lasting brand rule when the user indicates it should apply across future recipes. Update this skill rather than creating competing copies of the production rules.

This is independently written guidance informed by general staged-production ideas reviewed in OpenMontage: https://github.com/calesthio/OpenMontage. No OpenMontage code or instruction files are bundled. If later adopting its implementation, inspect the license at the selected revision and retain required notices; this skill does not install or relicense that project.
