---
name: splitplate-youtube-uploader
description: Prepare, upload, publish or schedule approved Split Plate YouTube long-form videos and Shorts; verify the channel, metadata, captions, processing and live or scheduled result. Maintain reusable upload rules. Rules-only requests do not upload or publish.
---

# Split Plate YouTube uploader

## Scope and prerequisites

Own the complete authorized YouTube upload, rather than handing Tushar a checklist. Use available supported connectors or the actual YouTube Studio browser flow. This skill is reusable instructions, not an installed background uploader, account credential or separate running agent.

Locate the current tusharksharma/tusharksharma checkout and read AGENTS.md and docs/content-growth-plan.md. For long-form packages, read ../splitplate-long-form-editor/references/export-and-publishing.md and the editor's current delivery rules. For Shorts, use the short-form editor's approved final export and format rules. Do not replace approved media with a proxy or silently render a new version.

Previously verified identity: Split Plate account splitplates@gmail.com; channel ID UCG7iNluWmtF1Tph0RVnuidA. Recheck the actual current channel name and ID before transfer. Do not publish to an unrelated signed-in account. Keep credentials and private project records outside the public repo.

Editing approval is distinct from publishing authorization. Reuse the user's existing explicit upload/publish/schedule authorization for the selected film; do not request it again. Rules-only work creates no upload. If publication is not authorized, finish the concrete package and show it before asking for the missing final decision. Honor explicit deferrals and account/login limitations.

## Package and preflight

Read `docs/video/intro-music-and-cta.md` for the future long-form outro layout. Add and verify the intended native Subscribe and Watch next video/playlist elements in Studio; burned-in artwork alone is not a clickable end screen. Use `docs/video/creator-reactions.md` for the preferred real reaction assets and teeth-preservation check.

Confirmed October 18, 2026: for the two-box Watch next layout, configure actual native elements rather than leaving placeholders: one Best for viewer video, one relevant verified-public specific video or playlist, and the channel Subscribe circle. The appended outro is five seconds maximum. Align the native elements with the artwork, verify saved destinations and timing, and inspect YouTube playback before calling the end screen complete. Record when a player or device omits end screens; never claim the rendered boxes populate automatically. Current-film authorization and visibility still govern upload/publication.

Identify the approved exact master, version, duration and thumbnail. Record a file hash, resolution, measured frame rate, color space and QA evidence. For 4K Atto long form, preserve 3840×2160 landscape and measured approximately 59.94/60 fps; SDR/HDR follows the verified master. Do not transcode, brighten, retag HDR or downscale during upload merely to accelerate transfer.

Prepare a viewer-led title, description, version-specific chapters, English captions, tags, appropriate category, one primary question/comment and end-screen plan. Include actual camera/POV context and relevant recipe destination only when substantiated. Do not invent affiliate disclosures, macros, links or personal claims.

Use the exact export to validate caption timing and chapters. Start manual chapters at 00:00, with at least three ascending timestamps and chapters at least ten seconds long under current guidance. If the content does not support chapters, omit them rather than inventing sections. Add external timestamp links using the assigned video ID only after upload. Recheck current YouTube guidance at execution time when requirements or UI have changed.

Determine audience, paid-promotion, altered/synthetic-content and other required settings from the actual film, documented relationships and current platform guidance. Children appearing does not by itself determine intended audience. Assess Marcus narration, generated visuals and reference inserts specifically; never carry a disclosure answer forward blindly from the pilot.

Check existing project records and Studio content for a matching upload before creating another. Preserve a live video; replacement, deletion or duplicate publication requires the corresponding user request.

## Execute and verify

1. Verify account/channel and use the approved master file in Create > Upload videos or an equivalent supported interface. Save the assigned video ID, Studio URL and watch URL as soon as available.
2. Populate metadata and required settings, upload the approved thumbnail and caption track, and apply the relevant playlist/end screen when supported and included in the package. For promotional Shorts, attach the matching full film as Related video; verify the actual selected video.
3. Inspect the thumbnail, saved text, links, captions and available checks. Diagnose copyright/restriction issues, including reference clips; do not dismiss a warning or dispute a claim without a basis and authorization. A checks pass is not proof of asset rights.
4. Verify processing progress and actual playback quality. For 4K publication, prefer waiting until 2160p is available and inspect motion, speech, brightness and framing. For HDR, verify recognition and intended playback separately from resolution. Report remaining processing honestly; do not call an SD-only processing state the finished 4K result.
5. Publish or schedule exactly as authorized. For scheduling, verify the calendar date, clock time and selected time zone in Studio; use America/Los_Angeles unless the brief specifies otherwise. Read the success receipt and actual content-row status. Scheduled is not public.
6. After publication, inspect the actual watch page: intended channel, title, thumbnail, public status, available resolution, chapters, captions and working links. Save a screenshot and live URL. Add and pin the prepared comment when included in the authorized package and supported; report an unavailable feature rather than claiming it succeeded.

If a transfer or browser operation fails, inspect whether an upload already exists before retrying. Resume the existing draft when possible. Keep the draft and completed package recoverable, and report the concrete limitation if current access cannot finish the job. Do not launch another chat or hand off by default.

## Record and continue

Save a project-local upload record with asset version/hash, video/channel IDs, final metadata, disclosure choices and basis, checks/processing state, visibility, scheduled date/time/zone or actual publication time, screenshots, URLs and unresolved items. Update the canonical VIDEO_INVENTORY and POSTING INVENTORY through the Google Sheets skill, inspect row occupancy before writing, preserve concurrent entries and verify readback.

After an authorized long-form film is actually published, automatically continue through ../splitplate-long-form-editor/references/post-publication-promotion.md in the same job: YouTube Shorts, Facebook link post, Instagram/TikTok Stories only. A scheduled film triggers that follow-up at actual publication, not merely schedule creation. If no persistent continuation exists, save the next action and report that limit; do not claim an unattended service is running. This rule does not create new paid narration authorization or override new-cut preview requirements.

For a completed upload return the live URL or verified scheduling details, quality/processing state and material unresolved items. Updating these rules does not begin a video or change an existing published film.

## Current primary guidance

Checked October 13, 2026; consult the actual current documentation when needed:
- [Upload videos and checks](https://support.google.com/youtube/answer/57407)
- [Schedule publication](https://support.google.com/youtube/answer/1270709)
- [Video chapters](https://support.google.com/youtube/answer/9884579)
- [Altered or synthetic content](https://support.google.com/youtube/answer/14328491)
- [HDR uploads](https://support.google.com/youtube/answer/7126552)

Confirmed October 18: use the weekly Monday/Wednesday release and film-relative promo cadence in ../splitplate-long-form-editor/references/post-publication-promotion.md. Long-form time is 5 p.m. Pacific; ordinary promo time is noon, with Wednesday-film Saturday promo at 5 p.m. Read the reference before calendar work.

Confirmed October 18: build and review the three-promo release package alongside the main film, before publication, using the promotion reference. A scheduled main with unbuilt promos is an incomplete release package. Post-publication follow-up distributes prepared assets and verifies outcomes.

For future verified XTRA Atto POV footage, follow the [Atto POV camera-labeling rule](../../../docs/video/SPLITPLATE_THUMBNAIL_PLAYBOOK.md#atto-pov-camera-labeling--october-22-2026): prominent **POV • XTRA ATTO** thumbnail badge and explicit camera/POV description context. Do not label non-POV films or retrofit approved assets without a request.

After a finished film is actually verified Public and its companion finals are exported, apply the October 22 [local raw-footage cleanup rule](../../../docs/video/local-storage-cleanup.md#delete-local-raw-footage-after-publication--october-22-2026). Delete only its checked local raw sources no active edit still needs; keep final media, project/source maps, paid narration and release records. No additional backup-location request is required for this authorized cleanup. Scheduled/private/unlisted is not Public.
