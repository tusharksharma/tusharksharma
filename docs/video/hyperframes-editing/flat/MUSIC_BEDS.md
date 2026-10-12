# Split Plate original music beds — generation briefs

Status: bed 01 is prepared as a 15-second loop; seven additional user-supplied candidate tracks are extracted below. The original generation prompts remain for reference. The current ElevenLabs API key lacks `music_generation`, and the in-app browser is not signed in.

## Additional user-supplied tracks (2026-10-05)

The following are audio-only extractions of the supplied MP4s. Originals remain in Downloads. These retain the complete arrangements; they have **not** been shortened or certified as seamless loops. The MP4s each contain 4.4 seconds of silent video after their audio ends, so use these audio-only copies in edits.

| Audio-only file | Music duration | Integrated loudness | Dynamic range (LRA) |
| --- | ---: | ---: | ---: |
| `Kitchen_Crunch_2026-10-05T034225-audio.m4a` | 15 s | -12.8 LUFS | 3.2 LU |
| `Kitchen_Crunch_2026-10-05T034225 (1)-audio.m4a` | 15 s | -14.7 LUFS | 8.9 LU |
| `Sizzling_Skillet_Groove_2026-10-05T034035-audio.m4a` | 30 s | -13.2 LUFS | 0.3 LU |
| `Kitchen_Swing_Loop_2026-10-05T033817-audio.m4a` | 32 s | -20.8 LUFS | 1.0 LU |
| `Kitchen_Table_Swing_2026-10-05T033817-audio.m4a` | 32 s | -12.7 LUFS | 1.5 LU |
| `Kitchen_Grooves_2026-10-05T033638-audio.m4a` | 30 s | -11.9 LUFS | 0.6 LU |
| `Kitchen_Grooves_Loop_2026-10-05T033638-audio.m4a` | 30 s | -13.0 LUFS | 1.6 LU |

All seven contain distinct decoded audio; the second Kitchen Crunch file is **not** an exact duplicate. The `(1)` Crunch variant has the largest measured level changes, which may better fit a reveal or text-only edit. This is a level measurement, not a listening verdict. The Swing Loop is substantially quieter than the others, so a fixed 10% gain will not sound equally loud across this library. Audition and set gain per edit, especially under Marcus.

### Standing selection rule

Rotate these tracks across future Split Plate videos, choosing for the individual edit's mood, story arc, pace, and action. Do not assign a universal default or mechanically alternate when a different track fits better. First audition the real hook sound; keep a strong crunch, sizzle, chop, pour, or voice moment clear. A music bed may fill otherwise empty space, but do not cover a useful intentional silence or force a 15-second repeat when the full arrangement develops better. Start near 10% linear gain under Marcus, then adjust and duck as needed; text-only cuts may need a different setting. Check the encoded final mix on a phone and record the track and gain in the project's QA notes.

## Ready asset — 01 Guitar spark

- Original user-supplied file: `Kitchen_Prep_Grooves_2026-10-05T033406.mp4` in Downloads. Preserved unchanged.
- Extracted source audio: `01-guitar-spark-source.m4a` (30 seconds of audio; the MP4 has 4.4 seconds of silent video tail).
- Reusable edit: `01-guitar-spark-15s-loop.mp3` (15 seconds, stereo, 48 kHz). A 0.4-second overlap smooths the repeat seam.
- Start around 10% linear gain under Marcus; check by ear against each voiceover. Text-only videos can use the same file and adjust gain after a phone-speaker check.

Generate each as an original, instrumental 15,000 ms MP3 with ElevenLabs Music v2.5. Do not put artist names, song titles, or requests to imitate existing recordings in the prompts. Preserve the full-volume masters, then make separate low-volume video mixes. These are intended as reusable backgrounds for Marcus narration and text-only edits.

## 01 — Guitar spark

Original instrumental 15-second background music loop for quick cooking and fitness social videos. Guitar-led retro pop-rock energy: an immediate catchy clean electric-guitar riff, warm electric bass, restrained punchy kick and snare, and a light handclap texture. 128 BPM, 4/4, eight-bar phrase, bright major-key feel. Catchy but not loud or distorted. Leave generous space for spoken narration. No vocals, lyrics, solo, dramatic crash, intro silence, or fade-out. Finish on a groove that connects to beat one when repeated. Do not quote or imitate an existing melody or recording.

## 02 — Warm swing

Original instrumental 15-second background music loop for warm food and family videos. Polished swing-pop groove with a playful piano hook, soft brushed/snapped drums, walking bass, and subtle muted-brass punctuation. 128 BPM, 4/4, eight-bar phrase, bright and easygoing. Bring the hook in on the first beat; keep the arrangement light, intimate, and voiceover-friendly. No vocals, lyrics, big brass blasts, intro silence, or fade-out. Finish so the phrase repeats naturally. Do not quote or imitate an existing melody or recording.

## 03 — Feel-good funk

Original instrumental 15-second background music loop for energetic recipe and text-only social videos. A syncopated bass hook, clipped rhythm guitar, tasteful organ, short brass responses, and dry drums with restrained handclaps. 128 BPM, 4/4, eight-bar phrase, joyful and confidently punchy without being loud or busy. Make the rhythm engaging from the first beat while leaving space for voiceover. No vocals, lyrics, dramatic break, intro silence, or fade-out. Finish on a phrase that connects to beat one when repeated. Do not quote or imitate an existing melody or recording.

## Delivery and QA

- Export three full-volume MP3 masters. Do not label a failed API response as audio.
- Listen across the repeat boundary and repair any click or obvious rhythmic gap before using as a loop.
- For Marcus videos, start the bed at approximately 10% linear gain (about -20 dB) and adjust/duck if it masks speech. For text-only videos, start at 10% and raise only if needed after listening on a phone.
- Keep the original compositions distinct from commercial songs and verify the ElevenLabs plan/license before commercial publishing.
