# Split Plate Media Storage Policy

Effective September 4, 2026.

## Recipe Packages

- Recipe package ZIPs are temporary website-agent handoffs, not project source files.
- Keep editable recipes, manifests, stills, audio, videos, and reserve clips in the recipe project directory.
- Create the website-agent ZIP in `/tmp` instead of copying it into Downloads and Documents.
- Delete the `/tmp` ZIP after the website agent confirms ingestion.
- Do not retain duplicate ZIP copies when the same package exists in the project.

## Downloads Cleanup

- A Downloads video can be removed only when both conditions are true:
  1. Its filename and path do not appear in `UNUSED_CLIP_INVENTORY`.
  2. It is older than 30 days.
- Preserve all logged reserve footage regardless of age.
- Preserve newer raw footage until it is packaged, consumed, or deliberately reserved.
- Write a dated candidate manifest and deletion report for every broad cleanup.

## Posting Files

- Finished videos may remain in Downloads while they are pending posting.
- The canonical editable copy remains under `video-edits/<project>/output/`.
- Once posted and older than 30 days, the Downloads copy can be removed if it is not protected by the unused-footage inventory.
