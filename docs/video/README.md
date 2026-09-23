# Video production rules — committed copy

These are the standing rules for short-form video: production, editing, the
HyperFrames visual system, and cover art. They were authored in the working
directory `~/Documents/New project/video-edits/`, which is **not a real git repo**
(zero commits, everything untracked). This folder is the durable home.

| File | Read it before |
|---|---|
| `WORKSPACE_RULES.md` | anything — it's the entry point that orders the rest |
| `SPLITPLATE_THUMBNAIL_PLAYBOOK.md` | generating, choosing, revising, or delivering **any** cover. Authoritative when an older cover or a duplicated rule conflicts |
| `SPLITPLATE_PRODUCTION_RULES.md` | producing or revising a short-form video |
| `SPLITPLATE_TIKTOK_EDIT_RULES.md` | cutting a TikTok/Reels/Shorts edit |
| `HYPERFRAMES_STYLE_SYSTEM.md` | building a HyperFrames composition, covers, or a Marcus voice take |
| `SPLITPLATE_YOUTUBE_VIDEO_RULES.md` | making a landscape video from portrait footage |
| `REELRISE_LEARNING_MODEL.md` | choosing a hook, pacing, on-screen text, CTA, or trend-informed structure |

## Working copy vs. committed copy

The working copies in `video-edits/` are what an agent launched from that
directory actually reads. When a rule changes, update **both** — edit in place
where you're working, then mirror into this folder in the same commit. If the two
ever disagree, the one with the later change wins; check `git log` here against
the file mtime there.

Relative paths inside these docs (`crumbl-creami-cut-week12-pov/cover/…`,
`hyperframes-components/…`) resolve against `~/Documents/New project/video-edits/`,
not against this repo. The referenced covers and assets are not mirrored here —
only the rules are.

Related, and living in `docs/` proper because they're site-side:
`../video-package-to-site.md` (taking a finished edit live) and
`../path-a-prompt-template.md` (the Path A image gate).
