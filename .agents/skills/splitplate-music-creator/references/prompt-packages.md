# Deliverable format and examples

Examples below are original teaching examples, not approved brand songs or generated audio. Adapt to the brief. Do not substitute these timings or words for the user's decisions.

## Standard prompt package

1. Brief: use, target duration, mood, reference traits, speech windows, fixed requirements and any assumptions.
2. Recommendation: instrumental/vocal/hybrid with one short reason.
3. Paste-ready prompt: only provider-facing music instructions; no reference names, links, account notes or commentary.
4. Settings: duration, variants if authorized, model when known, instrumental control where supported; distinguish settings from prose.
5. Arrangement table: contiguous in/out times, musical action and vocal/speech status. Total must equal requested duration.
6. Original lyrics when relevant, with exact words and section assignment. Keep delivery notes separate.
7. Exclusions and audition priorities. Include one targeted revision prompt if a predictable issue warrants it.

For a simple cue, compress the package. For a full song, expand arrangement and lyrics. API payloads are optional and must follow the selected model's verified schema. Do not label plain prose as executable JSON.

## Example: 30-second instrumental cooking bed

Assumed brief: energetic cooking montage with host speech throughout; fresh music, no specific reference. Recommendation: instrumental with a restrained lead so the host stays intelligible.

Paste-ready prompt:

> Original 30-second playful groove-rock cooking bed, 120 BPM, warm modern production. Instrumental only: no singing, speech, humming, choir, vocal chops or ad-libs. Tight live drums, rounded electric bass and clipped low-tuned rhythm guitar; a small synth pulse adds movement. Start immediately with the groove. From 0–8 seconds establish a short rhythmic motif; 8–24 seconds maintain a sparse steady bed for host narration, without lead solos or busy fills; 24–28 seconds add a small rhythmic lift; 28–30 seconds resolve with a short clean chord and decay inside the duration. Keep the tone cheeky and welcoming, with restrained cymbals and no fabricated kitchen sounds.

Settings: 30 seconds; one variant if generation is requested and funded; prompt-mode API `force_instrumental: true`. Narration remains a separate existing track and must not be synthesized by Music. The four arrangement spans sum to 30 seconds. A later mix still needs speech-context review.

Equivalent example API request body (validate current endpoint before execution):

```json
{
  "model_id": "music_v2_5",
  "music_length_ms": 30000,
  "force_instrumental": true,
  "prompt": "Original 30-second playful groove-rock cooking bed at 120 BPM. Instrumental only, with tight live drums, rounded bass, clipped low-tuned rhythm guitar and a subtle synth pulse. Immediate groove; 0-8s establish motif, 8-24s sparse steady support for separately recorded narration, 24-28s small lift, 28-30s resolved chord with short decay. No vocals of any kind, busy leads, excessive cymbals or kitchen sound effects."
}
```

## Example: 12-second original sung identity cue

Assumed brief: brand identity with no speech over it. Recommendation: a short vocal hook and instrumental punctuation. This is not a replacement for the approved channel intro.

Paste-ready prompt:

> Original 12-second family-friendly rock identity cue at 120 BPM. Playful confident original lead vocal, clear diction, low-tuned rhythm guitar, punchy live drums and a restrained rave-synth accent. 0–4 seconds: instrumental two-bar hook; 4–10 seconds: sing the supplied hook over three bars with room between phrases; 10–12 seconds: instrumental one-bar cadence with a short resolved decay. No extra lyrics, spoken announcements, profanity or long reverb tail. Keep the melody fresh and the delivery warm rather than aggressive.

Original hook (only these words are sung):

```text
Big flavor, easy mode
The Split Plate
```

Direction: first line occupies the opening two vocal bars; the brand name lands in the final vocal bar, leaving the last two seconds free of words. This is a draft timing plan; audition sung diction and phrase length. In a UI with one input field, append the exact lyric block beneath a clear "Lyrics" label; with separate fields, put the words in the lyric field.

## Example: 24-second hybrid plan

Assumed brief: a 4-second sung hook, separately recorded narration from 4–20 seconds and a 4-second musical ending. This example does not impose an outro duration on a whole film. Put the global identity in the first chunk, then preserve it while changing density. Do not add `prompt`, `music_length_ms` or `force_instrumental` alongside this composition plan.

```json
{
  "model_id": "music_v2_5",
  "composition_plan": {
    "chunks": [
      {
        "text": "[Hook]\nBig flavor, easy mode",
        "duration_ms": 4000,
        "positive_styles": ["playful groove rock", "120 BPM", "low-tuned rhythm guitar", "live drums", "rounded electric bass", "warm modern production", "clear friendly original lead vocal"],
        "negative_styles": ["extra lyrics", "harsh screaming"],
        "context_adherence": "high"
      },
      {
        "text": "[Instrumental narration bed]\n{instrumental only}",
        "duration_ms": 16000,
        "positive_styles": ["same groove and instrument palette", "sparse rhythm guitar", "restrained percussion", "space for separately recorded narration"],
        "negative_styles": ["vocals", "singing", "spoken words", "humming", "choir", "vocal chops", "lead solo", "busy fills"],
        "context_adherence": "high"
      },
      {
        "text": "[Instrumental ending]\n{short resolved cadence}",
        "duration_ms": 4000,
        "positive_styles": ["return of guitar motif", "resolved final chord", "short decay inside section"],
        "negative_styles": ["vocals", "speech", "humming", "vocal chops", "long tail", "abrupt cutoff"],
        "context_adherence": "high"
      }
    ]
  }
}
```

Duration check: 4,000 + 16,000 + 4,000 = 24,000 ms. No narration text is included, so the music request does not ask the model to replace the host. Listen for unintended vocal carryover into the bed before using it.

## Targeted revision examples

- Unwanted voices: "Keep the groove and instruments. Make this passage strictly instrumental; remove all singing, humming, choir, ad-libs and vocal chops." Use supported instrumental controls as well as prose.
- Speech masking: "In the narration interval, remove the lead riff and cymbal accents, reduce arrangement density, keep only bass, restrained drums and light rhythm guitar. Retain the hook outside that interval."
- Rushed lyrics: shorten the line or give it more section time; do not just add "clear diction" to an overcrowded phrase.
- Weak ending: request a short cadence with the final word completed before the decay; preserve a meaningful closing phrase rather than abruptly trimming a master.
- Wrong reference feel: change the specific groove, instrument role or production texture that missed, keeping the fresh melody. Do not reinsert a restricted artist or song name.

## Lightweight behavior checks for maintainers

Manually walk through these when changing the skill. Do not spend credits to test instructions.

| Request | Expected observable behavior |
| --- | --- |
| "Make me music" | Asks grouped reference/length/use/mood questions, no paid call. |
| "20s bed under my voice, warm guitar, choose the rest" | Drafts directly; recommends instrumental and records assumptions. |
| "Like this famous song, 30s" | Uses attributes, asks what is liked if inaccessible, strips title/name from provider input. |
| "No vocals" | Excludes hums/chops/choir and uses prompt-only instrumental switch if API mode. |
| "I want lyrics even with narration" | Respects choice, proposes vocal windows or sparse arrangement rather than silently removing lyrics. |
| "5s closing card" | Fits a resolved phrase within five seconds, no long verse. |
| "Change just the chorus words" | Preserves other decisions and uses section revision where available. |
| "Publish this song" | Checks actual music terms/plan/destination and explicit publishing scope; makes no blanket rights promise. |
