---
name: splitplate-thumbnail-creator
description: Create or revise The Split Plate thumbnails and social covers with Tushar's bundled real face and reaction references, story-specific ImageGen portraits, truthful food imagery and likeness review. Use for thumbnail artwork; video editing and publishing are separate workflows.
---

# Split Plate thumbnail creator

This skill is self-contained: real face references travel with the skill. Resolve every path relative to this folder, not the working directory or an old episode. Read [the asset guide](references/face-library.md) and inspect the selected real images before use. Do not routinely ask Tushar to upload the same photos again.

## Brief and identity

Read the actual video's title, premise, real food/action frames and confirmed verdict. Identify the deliverable: landscape YouTube main thumbnail or portrait Shorts/Reels/TikTok cover. A thumbnail request does not authorize video edits, paid narration, uploads or schedule changes.

Give the image one specific promise and usually 2–5 headline words. Default to energetic reaction-face artwork when Tushar asks for reaction faces, keeping food recognizable. Prepare a restrained food-forward alternate when making a new full package. Do not force a face into a hands-only technique when food/action tells the story better.

- Use bundled **real supplied photos or real video frames** as identity authority. Generated approved examples are style references only. Never anchor a new face solely to another generated face.
- Tushar authorizes fresh, story-appropriate ImageGen expressions, angles, poses and outfits for staged thumbnail illustrations. Open mouths and smiles are allowed. Preserve recognizable facial proportions, age, skin tone, eyes and hair. Reject a lookalike, beautification that changes identity, or oversized, uniform, over-white or malformed teeth.
- Vary expression, angle, framing and clothing across a package. Do not repeat the brown hat/dark jacket/hand-on-chin pose with different headlines and call it variety. Use existing hat-free references when appropriate.
- Make the face prominent with little torso, integrated into one food scene. Avoid rectangular portrait panels, side dividers or detached-head stickers. Prefer no hands when they add no meaning. When hands are useful, inspect fingers, arms, connections and believable object support.
- Generated reactions are staged illustrations, not evidence of a live tasting response. Do not invent family participants, reactions, endorsements or verdicts.

## ImageGen workflow

Use the available **imagegen** skill and built-in ImageGen tool. Label each input: real identity anchor, actual food/action reference, or generated style example. View local input images first. Supply actual selected images through the tool's supported reference-image mechanism; mentioning filenames in a prompt without supplying their images is insufficient. If another environment cannot attach local files, hand over those bundled images rather than inventing a text-only identity.

Use [the prompt template](references/imagegen-prompts.md). Keep dish, portions, ingredients and packaging truthful. Improve lighting, cleanup and composition without inventing a cheese pull, scoop texture, result, score, macros or product. Use verified recipe facts for badges. Include **POV • XTRA ATTO** only when the film is verified hands-free Atto POV; do not retrofit approved older art automatically.

## Layout and export

- Portrait covers: **1080×1920, 9:16, sRGB JPG**, retaining lossless/editable source. Keep critical copy roughly x=100–980/y=160–1610 and inspect the central profile crop; platform UI can cover edges.
- YouTube main: separate **16:9** composition, normally 1920×1080 working export; follow the uploader's current accepted file constraints. Do not stretch a portrait into landscape.
- Warm-black `#15120F`, cream `#FFFAF0`, lime `#D8F36A`, optional coral `#EF593F` for type/accent. Preserve natural skin and food color. Bold compact sans-serif uppercase headline is appropriate; this does not affect lowercase Marcus narration rules.
- Prefer one clear hero over collages, floating ingredients, fake packaging or excessive stickers. Correct generated spelling/alignment with deterministic typography when needed.
- Save versioned images in the active project, preserving approved originals and standalone JPGs. Baking cover frames into MP4 belongs to the editor and approved package, not this skill.

## Review and handoff

Compare the candidate side-by-side with selected real sources at full size and phone/grid size. Check likeness, eyes, hair, mouth/teeth, hands, food truth, text, crop, color and dimensions. Generation success is not a likeness pass. If Tushar says it does not look like him, reject that version and return to a real source; do not make the rejected face the next identity anchor.

Show new finished cover candidates for normal artwork/likeness review. Honor approval already given for that exact version. Record selected real asset IDs, dish frame, prompt, generated status, final path/hash and owner approval in the production receipt. Approval of one cover does not approve a later changed face or caption.

Deliver standalone images and paths. Publishing uses the uploader workflow: a prepared JPG or baked frame does not prove the platform saved it. Verify actual saved/reloaded covers where supported; otherwise record the limitation and inspect actual released covers.

## Portability

`assets/manifest.json` records hashes, dimensions and provenance. Carry this **entire folder**, including assets and references, to a different agent. It needs no old chat, Downloads/Photos archive or machine-specific workspace. These personal source references do not belong in unrelated public deliverables. Retain reusable references during episode raw cleanup.
