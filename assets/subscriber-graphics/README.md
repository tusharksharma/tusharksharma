# Reusable subscriber graphics v1

Original Split Plate graphics built October 13, 2026. Cream, lime, warm black and coral; real creator faces are not involved. Editable source: [render.py](render.py). This is a standalone code renderer, not a claim that HyperFrames produced these exports. The same timing/geometry can be ported into an episode's actual HyperFrames composition.

**Current October 28 contract:** follow [longform-brand-pack.json](../brand-media/longform-brand-pack.json) and [the placement rules](../../docs/video/intro-music-and-cta.md#shared-artifact-contract--october-28-2026). Reuse the four-second alpha overlay at start, midpoint and spoken closing, with `save-badge-v1.png` (transparent 2×) or its editable SVG alongside it. The ten-second outro below is historical source material; the assembled final card and native elements must last **five seconds maximum**. This correction supersedes the older ten-second placement instructions below.

## Files and placement

- **subscribe-overlay-4s-alpha.mov**: 3840×2160, 60 fps, four seconds, QuickTime Animation (qtrle/ARGB) with alpha. Put on a track **over** the first real cooking/host shot immediately after the channel intro. It is an overlay, not a standalone black card to append. Enter 0–0.45s; like at 0.95s; Subscribe → Subscribed at 1.65s; bell at 2.4s; exit 3.55–4s. The surrounding canvas is transparent. The original ProRes 4444 master is retained locally; the Drive copy uses lossless qtrle compression of those decoded RGBA frames because the 112.9 MB ProRes file exceeded the connector's 100 MB limit. New renders write qtrle directly.
- **watch-next-outro-10s.mp4**: 3840×2160, 60 fps, ten seconds, SDR Rec.709 H.264. Append after the film's payoff/readable factual recap. Music is not baked in: use the chosen channel outro arrangement and balance against speech, without importing a song wrapper's silent tail or cutting a sung word.
- **optional-click-bell-4s.wav**: original synthetic button/bell punctuation, stereo PCM 48 kHz. Align to the overlay's start. Keep optional and adjust per mix. No paid voice generation or copied sound effects were used.
- **overlay-preview.mp4**: 1080p composited demo with the optional SFX. Its plain background is only for viewing; use the alpha MOV for editing.
- Static PNG previews and QA manifest accompany the exports in the canonical Drive folder.

For a 59.94 fps episode, rebuild with `--fps 60000/1001` or conform deliberately in the editor; durations round to the nearest output frame. Do not silently retime the whole film. These supplied exports are 60 fps SDR graphics, not native HDR footage. Color-manage them when composing into a true HDR master; don't merely retag the export.

## Native end-screen layout

Coordinates on a 1920×1080 logical canvas (double for 4K): Subscribe center (575,660), radius 99; video tile 1 (1098,163)–(1738,523); video tile 2 (1098,579)–(1738,939). These are intended placements, subject to Studio's current element bounds. The video tiles are deliberately empty backgrounds for real YouTube thumbnails.

The uploader must add a native Subscribe circle and real video/playlist elements over these positions for the final ten seconds, then verify destinations and overlap in the actual Studio preview. Never call empty rendered tiles clickable or publish the end-card layout without the corresponding native links when supported. Do not cover nutrition, captions or the last bite with the layout.

## Rebuild

Install Pillow and imageio-ffmpeg from the normal Python package registry, then run:

```powershell
python assets/subscriber-graphics/render.py --out path/to/exports --scale 2 --fps 60
```

Arial Bold is used on Windows; DejaVu Sans Bold is the supported alternative. A font change requires visual inspection before shipping. Keep source code in GitHub, render assets in the authorized Drive library, and save exact versions/hashes with each film.

The supplied official-logo PNG is cropped at its right edge. This version uses a clean text wordmark instead of fabricating missing logo artwork. It does not redraw or distort the actual logo.
