# CLAUDE.md — The Split Plate

Rules and conventions for working on this recipe site. Follow these exactly.

## Recipe Voice & Content Rules

These rules govern how recipes are WRITTEN, not just how they're coded.

**Hook variety — DO NOT use the same intro pattern for every recipe:**
- BAD (templated): "You want [fast food] satisfaction at home — [protein] for adults, [mild thing] for kids. Same cook, different plates."
- GOOD: Vary the hook based on what makes THIS recipe unique — technique, occasion, cultural origin, a surprising macro number, or a specific problem it solves.
- Only lead with protein/calorie math when the number is genuinely impressive (61g protein ramen earns it, a 30g chicken sandwich does not). Put stats in the stat chips, not the headline.

**Split plate variety — DO NOT default to "adult spicy / kid plain" every time:**
- Vary the split mechanic across recipes. Options beyond spice level:
  - Crispy vs soft (quesadilla vs street taco)
  - Sauced vs dry (glazed chili chicken vs plain air-fried)
  - Herby vs cheesy (chimichurri finish vs butter/cheese finish)
  - Bowl vs handheld (same filling, different format)
  - Full portion vs smaller portion (same flavors, just scaled)
  - Different protein entirely (steak for adults, pork patties for kids)

**Recipe template tiers — not every recipe needs the full framework:**
- **Flagship dinners** (complex technique, strong story): full template — makeThisWhen, hook, description, whyMostFail, whyThisWorks, executionRules, troubleshooting, splitCook, brands, mealPrep
- **Fast dinners** (15 min, simple): skip whyMostFail, compress executionRules, shorter troubleshooting
- **Power-ups** (sauces, breakfasts, quick lunches): keep tight — the cookbook template is already right-sized

**Cultural specificity wins:**
- Recipes with a clear cultural identity (tandoori, Indo-Chinese chili chicken, buldak ramen) perform better than generic ones
- Name the cuisine, the technique, and the specific brands that make it authentic
- Don't water down cultural recipes to be "approachable" — the adult version should be real, the kid version is the mild adaptation

**makeThisWhen is the most important field:**
- This shows on Dinner cards and is the primary decision-making copy
- Write it as: when/why a parent would choose THIS recipe on THAT night
- Be specific: "Tuesday night, everyone's tired, need 15 min" not "you want a great meal"

## Adding a New Dinner Recipe

When a new dinner recipe is added to `src/data/recipes.js`:

1. **Assign the next sequential ID** (check the highest existing `id` and increment)
2. **Add `carbLevel`** — tag as `"high"` (rice/pasta/gnocchi), `"low"` (keto tortilla/bun), or `"none"` (no starch)
3. **Add `status: "live"`** and all required fields (slug, proteinAnchor, title, protein, calories, time, servings, image, etc.)
4. **Update the weekly rotation** in `src/components/YourWeek.jsx`:
   - **DO NOT add a new week for every recipe.** Only add a new week when the new recipe would otherwise be unused (i.e., it doesn't appear in any existing week).
   - If possible, swap the new recipe into an existing week where it replaces a repeat.
   - Target: ceil(N/3) weeks for N recipes. Only add Week N+1 when recipes > slots.
   - Every live dinner recipe must appear in at least one week
   - **Balance rule**: each week must mix carbLevels — no week should be all-high or all-low
   - **Protein variety**: avoid same proteinAnchor on consecutive days within a week
5. **Update the grocery list** in `src/components/GroceryList.jsx`:
   - Add a `GROCERY_BY_WEEK[N]` entry for any new week
   - Use `baseQty` (numeric) for items that scale with family size
   - Use `qty: "pantry"` for seasonings/oils that don't need scaling
   - Whole-unit items (head, bunch, bag, buns, fillets, etc.) always round up via `WHOLE_UNITS`
   - Tag each item with the correct day (`Mon`, `Wed`, `Fri`) and `kid` suffix for kid-only items
6. **Run `npm run build`** — this builds the site AND prerenders all routes + generates the sitemap. The build includes a planner/grocery sync validation that will fail if they don't match.
7. **Commit dist/** — Vercel serves committed dist directly (free tier can't run npm install)

## CRITICAL: Planner ↔ Grocery Sync Rule

**This is the #1 source of bugs in this codebase.** The weekly planner (`YourWeek.jsx` WEEKS object) and the grocery list (`GroceryList.jsx` GROCERY_BY_WEEK object) are defined separately. They MUST stay in sync.

**Every time you change WEEKS in YourWeek.jsx, you MUST also update GROCERY_BY_WEEK in GroceryList.jsx.** No exceptions.

Checklist when modifying any week:
1. Read the planner week — note the recipe ID and day for each slot (Mon/Wed/Fri)
2. Verify GROCERY_BY_WEEK[N] has the correct ingredients for those specific recipes on those specific days
3. Verify every item's `meal` tag matches the correct day (e.g., if Sandwiches moved from Wed to Mon, all sandwich ingredients must say `meal: "Mon"`)
4. Run `npm run build` — the validation script will catch mismatches
5. **Do NOT rely on memory.** Always re-read both files side by side before committing.

Common mistakes that have caused bugs:
- Shuffling planner meals but leaving grocery days unchanged
- Adding a new week to the planner but forgetting the grocery list
- Changing a recipe's day slot without updating ingredient day tags

## Adding a Cookbook Recipe (Power-Ups)

When adding to `src/data/cookbook.js` (sauces, breakfasts, desserts, quickLunches):

1. Add to the correct export array (`sauces`, `breakfasts`, `desserts`, `quickLunches`)
2. Include `heroImage` and `prepImage` if available
3. Ingredients can be strings or `{ text, link }` objects for cross-linking (e.g., linking to Money Mustard)
4. The prerender script auto-discovers cookbook items by matching `id:` + `title:` + `tagline:` patterns

## Brand URLs (mandatory)

**Every brand in the `brands` array MUST have a `url` field** pointing to a real product page. Brands without URLs render as dead cards — they can't be clicked, no GA4 `brand_click` event fires, and the user loses the affiliate/discovery loop.

**Workflow:**
1. After writing a recipe, scan `brands: [...]` for any entry missing `url`.
2. **WebSearch each missing brand** with the query format: `{Brand Name} {Product Name} {size} official product page`. Example: `Lee Kum Kee Chiu Chow Chili Oil 7.2 oz official product page`.
3. **Prefer in this order:** brand's own site (e.g., `kikkomanusa.com`, `smashkitchen.com`, `usa.lkk.com`) → Walmart/Target/Costco → H-E-B/Whole Foods → Amazon (last resort, links rot fastest).
4. Match the URL to the **exact product variant in the recipe** (12 oz Dijon, not 8 oz; All-Purpose Soy Sauce, not Less Sodium).
5. While there, double-check the **`item` name matches what's actually on the bottle** — e.g., update "Chili Oil" to "Chiu Chow Style Chili Crisp Oil" if that's the official product name.

This applies to every recipe, not just new ones. If you spot a missing URL while editing existing entries, fix it.

## Image Rules

- **Hero images**: 1200x800px, WebP, target <200KB
- **Step images**: 800x600px, WebP, target <120KB
- **Brand images**: keep originals (PNG/JPG), they're small enough
- Use `magick input.png -resize WxH^ -gravity center -extent WxH -quality 85 output.webp` to optimize
- Store in `public/images/{recipe-slug}/` for recipe images, `public/images/brands/` for products

## Build & Deploy

- `npm run build` — runs vite build + prerender script (generates route HTML + sitemap)
- `npm run deploy` — build + lint + stage dist/ (use this before committing)
- `npm run lint` — must pass before pushing
- Vercel config: `buildCommand: ""`, serves committed `dist/` directly
- **Always commit dist/** after building — stale dist = stale production

## Scaling & Family Size

- All `baseQty` values in grocery lists are calibrated for 4 servings (2 adults + 2 kids)
- Scale formula everywhere: `(adults + kids) / 4 * (leftovers ? 2 : 1)`
- Kids count as full servings — no fractional kid scaling
- Leftovers toggle doubles quantities (on by default in weekly plan, off in recipes)
- Per-serving macros (calories, protein) NEVER change with family size — only ingredient quantities scale

## Analytics & Tracking

- `src/hooks/useTrack.js` — lightweight tracker, logs to console in dev, sends to GA4 in prod
- GA4 Measurement ID: `G-10YP1BFG19`
- Tracked events: `hero_cta_click`, `recipe_view`, `grocery_open`, `grocery_copy`, `fan_spin`, `brand_click`, `email_capture`
- Email capture uses Kit (ConvertKit) API v4 — subscribers go to app.convertkit.com

## SEO

- `scripts/prerender.js` generates route-specific HTML with meta/OG/canonical/JSON-LD at build time
- Sitemap auto-generated from the same route list — no manual sitemap editing
- Google Search Console verified (meta tag in index.html)
- `useMeta` hook updates client-side meta during SPA navigation
- Recipe pages get JSON-LD `@type: Recipe` schema with nutrition data

## Image Generation Prompts (ChatGPT preferred, Gemini as backup)

When a new recipe is added, generate and share these prompts for the user. **ChatGPT produces better results than Gemini** — use ChatGPT first.

**CRITICAL PROMPT RULES:**
- **Always specify aspect ratio first:** Hero = "3:2 landscape (1200x800)", Steps/Prep = "4:3 landscape (800x600)"
- Name every brand explicitly (Sola, Kraft, French's, Kirkland, 365, etc.)
- Describe packaging details (red bag, yellow bottle, green box)
- Include "partially removed from packaging" for visual variety
- Always end with "High realism, sharp focus, no generic branding"
- For Gemini: prefix with "Transform this into..." to restyle (not just enhance)

### 1. Hero (plated dish)
```
Transform this into professional overhead food photography. A white bowl on a wooden cutting board, white marble countertop. The bowl has {dish description — e.g., "bright golden turmeric rice topped with thinly shaved seared beef strips, drizzled with chipotle sauce"}. Garnished with fresh cilantro and a lemon wedge. Small garnish bowls nearby. Warm natural side lighting from a window, soft shadows. Linen napkin to one side. Clean, editorial, appetizing food blog style.
```

### 2. Ingredient flat lay
```
Transform this into top-down flat lay food photography. All ingredients for {recipe name} neatly arranged on a wooden cutting board, white marble background. Include product packaging where visible. Warm daylight, minimal shadows. Clean, organized, editorial food blog style. Space between each ingredient for clarity.
```

### 3. Cooking action (searing/sauteing)
```
Transform this into professional food photography. {Protein} searing in a stainless steel pan on a clean white marble countertop next to the stovetop. Visible steam rising. Warm golden side lighting from a window. Shallow depth of field — pan sharp, background blurred. Small bowl of salt and fresh herb sprig beside the pan. Linen towel to one side. Editorial food blog style.
```

### 4. Process shot (two pans / mid-cook)
```
Transform this into overhead food photography. Two pans on a wooden cutting board on a white marble countertop — one with {component 1}, one with {component 2}. Small bowls of garnish nearby. Warm natural daylight from above. Clean, minimal styling. Professional food blog aesthetic.
```

### 5. Split plate (adult vs kid)
```
Overhead food photography of two white bowls side by side on a wooden cutting board, white marble countertop. Left bowl (larger): {adult plate description with sauce and garnish}. Right bowl (smaller): {kid plate description — plain, no sauce}. Small garnish bowls between them. Warm natural daylight. Clean editorial style. The contrast tells the story — same meal, different plates.
```

### 6. Sauce/condiment close-up
```
Transform this into close-up food photography. A small ceramic ramekin of {sauce name} on a wooden surface, white marble background. A spoon resting in the sauce. Warm side lighting, shallow depth of field. The sauce should look creamy and appetizing. Professional food blog style.
```

### Key rules for prompts:
- Always say **"thinly shaved/sliced"** for steak — prevents Gemini from generating thick cuts
- Always specify **"white marble countertop + wooden cutting board"** for consistency across the site
- Always include **"warm natural side lighting from a window"** — this is the signature look
- Use **"Transform this into..."** not **"Enhance this photo..."** — the former restyls, the latter barely changes anything

## Sauce / Power-Up 3-Shot Image Kit (strict format)

For every new sauce or power-up, generate THREE images that tell a story:
**Hero** (staged ingredients + finished sauce) → **Action** (sauce in use on a real dish) → **Detail** (texture / consistency proof).

These wire into the cookbook entry as:
- `heroImage` → top of detail page
- `prepImage` + `prepImageCaption` → between ingredients and method (override default "Mise en place")
- `actionImage` + `actionImageCaption` → after method, before "Best For"

### Strict prompt template (use verbatim, fill in the brackets)

Every prompt MUST follow this skeleton, in this order:
1. **Aspect ratio first** — always `3:2 landscape (1200x800)` for cookbook
2. **Camera angle** — side / 45-degree / overhead / close-up macro
3. **Foreground subject** — what's sharp and centered
4. **Real branded ingredients** — name each brand, packaging color, cap color, label text
5. **Surface** — warm beige marble OR white marble (pick one and stick with it across the 3 shots)
6. **Lighting** — "warm natural daylight from the {side|left|upper-left}, soft shadows"
7. **Style + DOF** — "editorial food blog style, shallow depth of field, background lightly out of focus"
8. **Suffix** — "High realism, sharp focus, no generic branding, no text overlays"

### Shot 1 — Hero (staged)
```
Aspect ratio: 3:2 landscape (1200x800). Editorial food blog style, side angle, slightly above. Small white ceramic ramekin in the foreground filled with {sauce description — color, visible flecks, consistency}, a spoon resting in it. Background staging on warm beige marble or stone tile counter: {Brand 1 with packaging details}, {Brand 2}, {Brand 3}, {Brand 4}, {fresh produce — e.g., one whole lemon and one halved lemon showing pulp}. Soft warm natural daylight from the left, gentle shadows, slight depth of field — bottles lightly out of focus, ramekin in sharp focus. High realism, sharp focus, no generic branding, no text overlays.
```

### Shot 2 — Action (canonical use case)
```
Aspect ratio: 3:2 landscape (1200x800). Top-down 45-degree angle. White ceramic plate with {dish — e.g., charred asparagus spears in a row, deep grill marks, blistered tips}, drizzled diagonally with {sauce description}. {Garnish details — e.g., cracked black pepper flakes scattered}. Plate on warm beige marble counter. Soft-blurred background corner: small white ramekin with more sauce, {one branded ingredient jar}, {fresh garnish}. Warm natural daylight from the side, soft shadows, editorial food magazine style. High realism, sharp focus on the dish and drizzle, shallow depth of field. No text, no generic branding.
```

### Shot 3 — Detail (texture proof)
```
Aspect ratio: 3:2 landscape (1200x800). Close-up macro shot, 45-degree side angle. A metal spoon being lifted out of a white ceramic ramekin filled with {sauce description}. The sauce visibly coats the back of the spoon — {consistency target, e.g., "thick enough to cling, thin enough to drip a single bead"}. Visible {flecks/details — e.g., red chili oil and cracked black pepper suspended}. Background: soft-blurred warm beige marble counter, partial silhouette of {one branded bottle} and {fresh garnish}. Warm natural daylight from upper left, single soft highlight on the sauce surface. Editorial food blog style, high realism, sharp focus on the spoon and drizzle, shallow depth of field. No text, no generic branding.
```

## End-to-End Image Workflow (when session is fresh)

When the user sends a new recipe + says "give me image prompts" or "all 3 images downloaded":

**Step 1 — Generate prompts.** Use the 3-shot kit above. Name every brand from the recipe's `brands` array. Match the surface across all 3 shots (don't mix marble types).

**Step 2 — User generates in ChatGPT/Gemini.**
- ChatGPT: paste prompt as-is
- Gemini: prefix with "Transform this image into:" + attach a real reference photo (image-to-image is much stronger than text-to-image for real packaging)

**Step 3 — User downloads, you optimize.**
```bash
cd /Users/tusharsharma/recipes-site/public/images
magick ~/Downloads/{file1}.png -resize 1200x800^ -gravity center -extent 1200x800 -quality 85 {slug}-hero.webp
magick ~/Downloads/{file2}.png -resize 1200x800^ -gravity center -extent 1200x800 -quality 85 {slug}-{action-name}.webp
magick ~/Downloads/{file3}.png -resize 1200x800^ -gravity center -extent 1200x800 -quality 85 {slug}-spoon.webp
```
Naming convention: `{recipe-slug}-{role}.webp` where role ∈ `{hero, action-noun (e.g., asparagus), spoon|detail}`.

**Step 4 — Wire into `src/data/cookbook.js`:**
```js
heroImage: "/images/{slug}-hero.webp",
prepImage: "/images/{slug}-spoon.webp",
prepImageCaption: "Texture target — {what good looks like}",
actionImage: "/images/{slug}-{action-noun}.webp",
actionImageCaption: "On {dish} — the canonical use case",
```

**Step 5 — Verify with `Read` tool on each `.webp`.** Confirm the optimized image looks correct before committing — Read returns the rendered image inline.

**Step 6 — Build, commit, push.**
```bash
cd /Users/tusharsharma/recipes-site && npm run build && git add public/images/{slug}-*.webp src/data/cookbook.js dist/ && git commit -m "..." && git push
```

## Code Style

- `npm run lint` must pass (eslint)
- No unused variables
- No render-time setState — use useEffect
- Prefer `Link` from react-router-dom over `<a>` for internal navigation
- Route paths: `/recipes/:slug` for dinners, `/cookbook/:id` for power-ups
