# The Split Plate Source Index

## Canonical Strategy And Rules

- **Video & cover rules, committed:** `/Users/tusharsharma/recipes-site/docs/video/` — the durable copies of everything below. The `video-edits/` paths are the working copies an agent launched from that directory reads; a rule change updates both.
- Cover/thumbnail playbook: `/Users/tusharsharma/recipes-site/docs/video/SPLITPLATE_THUMBNAIL_PLAYBOOK.md` (working copy: `/Users/tusharsharma/Documents/New project/video-edits/SPLITPLATE_THUMBNAIL_PLAYBOOK.md`) — read in full before generating, choosing, revising, or delivering any cover
- Production rules: `/Users/tusharsharma/recipes-site/docs/video/SPLITPLATE_PRODUCTION_RULES.md`
- TikTok/Reels/Shorts editing rules: `/Users/tusharsharma/recipes-site/docs/video/SPLITPLATE_TIKTOK_EDIT_RULES.md`
- HyperFrames visual system: `/Users/tusharsharma/recipes-site/docs/video/HYPERFRAMES_STYLE_SYSTEM.md`
- Reusable HyperFrames save CTA: `/Users/tusharsharma/Documents/New project/video-edits/hyperframes-components/split-plate-save-glass.html` (asset, not mirrored)
- YouTube landscape rules: `/Users/tusharsharma/recipes-site/docs/video/SPLITPLATE_YOUTUBE_VIDEO_RULES.md`
- Reelrise learning model: `/Users/tusharsharma/recipes-site/docs/video/REELRISE_LEARNING_MODEL.md`
- Canonical 90-day strategy: `/Users/tusharsharma/recipes-site/docs/content-growth-plan.md`
- Website standing rules: `/Users/tusharsharma/recipes-site/AGENTS.md`
- This transfer manual: `/Users/tusharsharma/Documents/New project/split-plate-chat-transfer-2026-09-13/START_HERE.md`

Read the TikTok rules and HyperFrames visual system before every social-video build, and the thumbnail playbook before every cover. Reuse the saved CTA component when a final save prompt is appropriate. Read the Reelrise model when selecting a hook, pacing, text, CTA, or trend-informed structure. Read the YouTube file before making a landscape video from portrait footage.

## Planning And Inventory Workbook

Workbook:

`https://docs.google.com/spreadsheets/d/1xI4g9JQ47YdpDQFTHweuY7s53PHuK3cTPvNEz-FK0LM/edit`

Critical tabs:

- `VIDEO_INVENTORY`: exact asset/version records and canonical files.
- `RECIPE VIDEO COVERAGE`: recipe-level coverage and posted status. It does not prove that every specific edit was posted.
- `UNUSED_CLIP_INVENTORY`: durable reserve clips with `UC-####` IDs and lifecycle status.
- `PLAN ...` tabs: actual posting agenda. Read the ending, current, and buffer weeks before scheduling.
- TikTok `Latest` / `History` or equivalent posting data: the publication check. Refresh analytics before a serious weekly audit.
- New-version/repost tracking, if present: use it to distinguish the original posted recipe from a materially new edit.

Never infer current status from this transfer package alone. The workbook is mutable and must be read live.

## Local Inventory Helpers

- Marcus index: `/Users/tusharsharma/Documents/New project/video-edits/MARCUS_VIDEO_INVENTORY.md`
- Marcus CSV: `/Users/tusharsharma/Documents/New project/video-edits/MARCUS_VIDEO_INVENTORY.csv`
- Inventory builder: `/Users/tusharsharma/Documents/New project/video-edits/build_marcus_video_inventory.py`
- Unused-clip explanation: `/Users/tusharsharma/Documents/New project/video-edits/UNUSED_CLIP_INVENTORY.md`

The local Marcus index is a discovery aid, not proof of posting or final approval.

## Website

- Live site: `https://thesplitplate.com`
- Repository: `/Users/tusharsharma/recipes-site`
- Recipe data: `/Users/tusharsharma/recipes-site/src/data/recipes.js`
- Cookbook data: `/Users/tusharsharma/recipes-site/src/data/cookbook.js`
- Social carousel route: `/social/<recipe-slug>` or `/social/cookbook/<cookbook-id>`
- Carousel renderer: `/Users/tusharsharma/recipes-site/src/social/`
- Carousel review command: `npm run build && npm run social:contact-sheets -- --slug=<slug>`

Before a website edit, run `git status --short` and preserve unrelated changes. Do not assume a local build is live. A carousel becomes inventory-ready only after its source change is deployed and the live route is checked.

## Video And Package Storage

- Active edit projects: `/Users/tusharsharma/Documents/New project/video-edits/<slug>/`
- Website-agent recipe packages: `/Users/tusharsharma/Documents/New project/recipe-packages/<slug>/`
- User-facing postable copies: `/Users/tusharsharma/Downloads/`
- Website media commonly lives under either the active site repository's `public/` tree or the package's explicit handoff paths.

Canonical MP4s should remain in their project output folders even when a user-facing copy is placed in Downloads. Zips are delivery snapshots, not the canonical editable source.

## Performance Data

- Performance workbook: `https://docs.google.com/spreadsheets/d/1MiaK6e_GhPSx4LWG0HhB0g3gDX2oVOG1O86LidvtEvQ/edit`
- Analytics project: `/Users/tusharsharma/social-video-analytics`
- Refresh command referenced by the saved rules: `.venv/bin/python collect.py tiktok`

Use comparable platform, format, purpose, and age windows. Prefer medians, preserve blanks, and do not let one breakout dictate the entire strategy.
