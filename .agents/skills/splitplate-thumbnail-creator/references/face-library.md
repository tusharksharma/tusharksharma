# Face and reaction library

Paths below are relative to the skill root. Inspect the actual selected images; names are selection aids, not a requirement to reuse a pose.

## Real identity anchors

Start with `assets/real-video/source-contact-sheet.jpg`, then supply the **individual full-resolution source** to ImageGen. The contact sheet is a discovery aid, not a substitute for the original.

| Path | Expression / use |
| --- | --- |
| `assets/real-video/surprised-source.png` | Hat-free front surprise/open mouth; discovery |
| `assets/real-video/facepalm-source.png` | Head down, hands on head; obstacle/self-directed joke |
| `assets/real-video/excited-source.png` | Hat-free enthusiasm, real visible teeth |
| `assets/real-video/pointing-source.png` | Hat-free pointing and real smile; direct attention |
| `assets/real-video/skeptical-source.png` | Skeptical question, cap/arms crossed; cap is optional styling |
| `assets/real-video/thinking-source.png` | Thinking, cap and hand on chin; avoid overuse |
| `assets/real-video/animated-emphasis-source.png` | Animated explanation/open mouth |
| `assets/real-video/hands-on-cheeks-source.png` | Leaning forward, hands on cheeks; surprise/frustration |
| `assets/supplied-photos/01-surprised-front.jpg` | Close hat-free front surprise; facial proportions anchor |
| `assets/supplied-photos/02-pursed-surprise.jpg` | Close hat-free pursed surprise |
| `assets/supplied-photos/03-surprised-three-quarter.jpg` | Close hat-free three-quarter open-mouth surprise |
| `assets/supplied-photos/04-wink.jpg` | Hat-free wink/playful expression |

The eight video stills came from Tushar's own IMG_8996/8997/8998 reaction recordings: orientation/crop/resize only, no facial generation. Source moments and hashes are in `assets/real-video/source-provenance.json`. Four owner-supplied photos had personal JPEG metadata removed without changing decoded pixels; provenance is in `assets/supplied-photos/source-provenance.json`.

Additional photos2/3 were the likeness anchors after Tushar rejected generated meatball portraits. For difficult repairs, preserve the real source angle, proportions and expression more closely; vary layout/food rather than repeatedly inventing a face.

## Approved generated style examples

The owner approved these Halloween Creami variants with “Lgtm” on November2,2026. They demonstrate variety, prominent face plus food, natural mouths and compact headlines. They are **generated staged illustrations**, not real identity photographs or actual meal reactions. Do not copy their food, outfit or headline into an unrelated recipe.

- `assets/approved-examples/brownie-reaction.png`: navy clothing, skeptical/amused expression, red velvet food.
- `assets/approved-examples/fudge-reaction.png`: burgundy clothing, delighted open mouth, chocolate food.
- `assets/approved-examples/drizzle-reaction.png`: green clothing, playful/confident expression, peanut/chocolate food.

Use a relevant real anchor alongside any style example. Do not feed every image at once: choose the few that clarify identity, expression and actual food.
