# Eleven Music: verified operating notes

Researched October 19, 2026 from official ElevenLabs sources. This is a dated snapshot, not an assertion about the user's account. Refresh model/schema before API execution and current terms before distribution. Creative advice elsewhere in this skill is our workflow design.

## Prompting

[Current Music prompting guide](https://elevenlabs.io/docs/overview/capabilities/music/best-practices): choose genre, mood, instrument palette, tempo and production character. Studio descriptions such as dry drums or close vocal help steer texture. State arrangement events in order and explicitly request instrumental-only if wanted. Lyrics can be supplied; otherwise the model may write them. Timing cues and multilingual lyrics are supported. A concise prompt can leave creative room; longer is not automatically better. Repeated loops need explicit constraints on what should remain absent. Treat BPM, key and event placement as requested targets pending listening/measurement.

The old `/docs/best-practices/prompting/eleven-music` URL redirected to Text to Speech during this research. Follow the Music product's current links rather than adopting speech-model controls.

## Website route

[Music product guide](https://elevenlabs.io/docs/eleven-creative/products/music): natural-language generation supports duration and variants, editable lyrics/sections, local include/exclude styles and follow-up edits. Editing text does not update audio until generation runs. Audio Reference supports approximately 30-second uploads for v2/v2.5, with copyright screening; it steers sound rather than remixing the recording. Optional curated or custom Finetunes affect style. Cost depends on duration/variants; check the interface estimate before generation. Availability and export options must be checked in the actual account. Never treat a text instruction as proof that isolated stems were exported.

## Prompt-based API

[Compose API](https://elevenlabs.io/docs/api-reference/music/compose): `POST /v1/music` accepts either `prompt` or `composition_plan`, never both. Prompt maximum is 4,100 characters. Prompt mode accepts `music_length_ms` from 3,000 to 600,000. Listed model IDs are `music_v1`, `music_v2`, `music_v2_5`; the default is v1, so select deliberately. `force_instrumental: true` is documented only for prompt mode. A seed is supported with plans, not prompt mode, and is not an exact-reproduction promise. `store_for_inpainting` preserves the generated song for later editing. Verify SDK version, output format and response handling before code execution.

Keep API keys in the environment, never in prompts or Git. UI labels and Python SDK arguments need not use the same spelling.

## Structured arrangement

[Composition plans](https://elevenlabs.io/docs/eleven-api/guides/how-to/music/composition-plans): v2/v2.5 use `chunks`; v1 has a different schema. A chunk has `text`, `duration_ms`, `positive_styles`, `negative_styles` and `context_adherence` (`low`, `medium`, `high`). Up to 30 chunks; each is 3–120 seconds and the total is 3–600 seconds. Style arrays allow up to 50 entries each. The opening chunk establishes identity. Use English style descriptions; lyrics may use other languages. In `text`, square brackets label sections, plain lines contain lyrics, curly braces hold short directions, and parentheses can represent vocal sounds. Do not use parenthesized stage instructions as if they were guaranteed silent metadata.

For strict instrumental plans, use instrumental cues and voice exclusions throughout; the prompt-only `force_instrumental` switch cannot be added to a plan request. Check resulting audio for voices.

## Plan creation and revision

[Plan endpoint](https://elevenlabs.io/docs/api-reference/music/create-composition-plan): `POST /v1/music/plan` can generate a plan from text, length and model, optionally using a source plan. The documentation lists no credit charge for this endpoint, but rate limits apply. That does not make audio generation free. Validate the returned schema for the selected model before composing.

[Music inpainting](https://elevenlabs.io/docs/eleven-api/guides/how-to/music/inpainting) describes referencing stored song audio to preserve or condition sections while modifying/extending others. Read its current request structure before execution; this skill intentionally does not freeze an untested editing payload. Preserve song IDs and source versions privately. Do not promise existing audio is preserved simply by asking a fresh text generation to keep it.

## Reference and provider rejection

[Music quickstart](https://elevenlabs.io/docs/eleven-api/guides/cookbooks/music) documents `bad_prompt` and `bad_composition_plan` errors, which can include suggested replacements. Inspect suggestions against the actual brief instead of blindly accepting or repeatedly resubmitting rejected content. Do not obfuscate names or lyrics to evade a rejection. Use an original musical description.

## Rights and distribution

[Music Terms](https://elevenlabs.io/music-terms), updated October 9, 2026, prohibit input containing artist/songwriter names, song/album titles, publisher/label names, or distinctive lyric quotations. They require rights to inputs and review of outputs, and restrict misleading artist impersonation. Translate references privately into generic musical traits before submission.

The plan table distinguishes media use, downloading, streaming distribution, library distribution and attribution. At research time Free allowed specified media use with attribution but prohibited downloads; Starter prohibited music streaming distribution, while Creator and above permitted it. Film/TV/radio/studio-game permissions and organization eligibility vary. Internal storage is distinguished from third-party music libraries. Check the actual agreement, plan, model and intended use; never promise universal commercial clearance, exclusivity, Content ID eligibility or absence of claims. Generic help FAQs can conflict with music-specific terms; resolve the applicable terms before publishing rather than claiming all free output is noncommercial or all paid uses are allowed.

For prompt-only work, flag distribution checks as later execution work without blocking drafting. Preserve a private generation-date/plan/terms record when producing music for use. Do not commit account records or licensed reference recordings to the public repo.
