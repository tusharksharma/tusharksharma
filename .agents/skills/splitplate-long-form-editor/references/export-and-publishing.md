# Export and publishing lessons

Use these lessons when evaluating long-form brightness, rendering on limited hardware, preparing a YouTube package or publishing an authorized film. Current user direction overrides a pilot's settings.

## Color and brightness

- Preserve native SDR as SDR unless HDR delivery is requested or the actual source warrants it. 4K describes resolution; it does not add contrast, brightness or captured dynamic range.
- When converting SDR into HDR-compatible PQ, make the luminance mapping deliberate. A conservative 100-nit SDR reference preserves an SDR-like picture; it is not a brighter creative HDR grade. Do not treat that pilot value as a universal mastering target.
- Compare matching original-source, intentionally displayed SDR and HDR-derived frames. Also check the actual private YouTube upload on the intended device before public release when brightness is in question. Separate resolution availability, HDR recognition and the perceived picture.
- YouTube supplies an SDR downconversion on non-HDR devices. Its automatic tone mapping can change the look. Correct PQ/BT.2020 tags are necessary, but do not establish visual equivalence. Inspect mastering/content-light metadata too; do not invent a physical mastering display or luminance measurements.
- If the picture looks dim, investigate the luminance mapping, platform conversion and display before adding saturation or sharpening. Offer a short matched brightness/contrast proof; a creative grade requires direction because the house rule preserves original picture color. Keep diagnosis hypotheses separate from confirmed causes.
- Preserve published versions. A request to diagnose or save learning does not authorize deleting or re-uploading the live video.

Reference: [YouTube HDR upload guidance](https://support.google.com/youtube/answer/7126552?hl=en).

## Rendering and verification

On the pilot's 8 GB Windows machine, constrained filter threading reduced resource pressure; D3D11VA full decode was much faster than software decode. Detect available hardware, test a short representative segment and measure speed rather than applying these settings to every machine. Resume only validated complete cached files. Interrupted files are not usable merely because their paths exist.

Use full decode plus meaningful picture/audio sampling. Compare the selected review and assembled master durations, caption endpoints and chapter transitions; concatenation/container rounding can introduce small timing differences. Reuse the approved audio when the script is unchanged and record provider credits independently from local export work.

## Complete YouTube package

Prepare a short viewer-led title, matching landscape thumbnail, ready-to-paste description, camera/POV context, version-specific chapters starting at 00:00, English captions, a single primary comment question, tags and an end-screen plan. Add real external timestamp URLs after the platform assigns a video ID. Do not invent recipe-page URLs, affiliate relationships, quantities or nutrition claims.

Keep the food dominant in the bold thumbnail. Use short text and a supplied same-person reaction that fits the story; retain likeness approval. An Atto cue belongs to films actually recorded with that camera, not every future thumbnail.

Before transfer, verify the intended account and channel rather than using whichever account is already signed in. Editing or packaging does not authorize publication. After authorized publication, verify the public status, thumbnail, clickable chapters, captions and available resolution, then save a screenshot and the live link. Pin the prepared comment when included in the authorized package. Describe pending checks accurately; a Publish click is not proof of success.

## Pilot feedback: October 12, 2026

Confirmed: Tushar approved the food-led STEAK vs CHICKEN thumbnail with his reaction and Atto cue, selected the mixed cut for publication, and then reported that the live picture looked dim.

Observed: the main cooking footage used was native 3840×2160 (4K) BT.709 SDR, and the final canvas remained 3840×2160. Resolution and dynamic range are separate; the master was transformed into 10-bit BT.2020/PQ using a conservative 100-nit reference. A matching source/export inverse-conversion comparison looked close; this sample does not prove equivalence across the whole film or on YouTube. No creative brightness grade had been applied.

Inference still to verify: conservative HDR luminance mapping and/or platform/display tone mapping may contribute to the reported dimness. The exact cause is not confirmed without the viewing-device comparison. A 4K SDR master and a carefully brighter HDR proof are candidate comparisons, not approved replacements or a new universal grade.


## October 19 Atto / AMD AMF export check

Observed on the Golden Garlic Steak Bowls POV pipeline: an AMD AMF Main10 test produced PQ/BT.2020 tags despite BT.709 output flags. The source was verified 10-bit BT.709 SDR and the encoded pixels had no HDR transform. Remuxing with corrected HEVC VUI metadata restored the intended BT.709 tags; verify the actual encoded stream after this repair. Never apply this label-only correction to genuinely HDR pixels or use it as a substitute for tone mapping.

A layered intermediate also retained a 180-degree display matrix after the camera orientation had already been applied physically, causing a second flip in ordinary playback. Clear the duplicate display rotation only after proving the encoded pixels are upright; compare food and text in the encoded result. Preserve original camera metadata and media. In this pipeline, output rotate=0 metadata alone did not remove the inherited matrix; the stream-copy remux needed the FFmpeg input display_rotation override set to zero. Probe the result and inspect the actual encoded picture. A metadata flag alone is not proof that orientation was handled once.

The native 4K subscribe animation exceeded the laptop's memory budget when decoded as a full transparent canvas. Cropping only the transparent margins to an alpha-safe native-resolution strip reduced memory without resizing the visible graphic; restore its exact canvas offset while compositing. These are observed fixes for this pipeline, not universal requirements for other encoders.
