# CLAUDE.md — The Split Plate

Rules and conventions for working on this recipe site. Follow these exactly.

## Adding a New Dinner Recipe

When a new dinner recipe is added to `src/data/recipes.js`:

1. **Assign the next sequential ID** (check the highest existing `id` and increment)
2. **Add `carbLevel`** — tag as `"high"` (rice/pasta/gnocchi), `"low"` (keto tortilla/bun), or `"none"` (no starch)
3. **Add `status: "live"`** and all required fields (slug, proteinAnchor, title, protein, calories, time, servings, image, etc.)
4. **Update the weekly rotation** in `src/components/YourWeek.jsx`:
   - If the new recipe creates an unused recipe, add a new week (Week 3, etc.)
   - Every live dinner recipe must appear in at least one week
   - **Balance rule**: each week must mix carbLevels — no week should be all-high or all-low
   - **No-repeat rule**: minimize recipe repeats across weeks. With N recipes and 3 slots per week, target ceil(N/3) weeks with zero or minimal repeats
   - **Protein variety**: avoid same proteinAnchor on consecutive days within a week
5. **Update the grocery list** in `src/components/GroceryList.jsx`:
   - Add a `GROCERY_BY_WEEK[N]` entry for any new week
   - Use `baseQty` (numeric) for items that scale with family size
   - Use `qty: "pantry"` for seasonings/oils that don't need scaling
   - Whole-unit items (head, bunch, bag, buns, fillets, etc.) always round up via `WHOLE_UNITS`
   - Tag each item with the correct day (`Mon`, `Wed`, `Fri`) and `kid` suffix for kid-only items
6. **Run `npm run build`** — this builds the site AND prerenders all routes + generates the sitemap
7. **Commit dist/** — Vercel serves committed dist directly (free tier can't run npm install)

## Adding a Cookbook Recipe (Power-Ups)

When adding to `src/data/cookbook.js` (sauces, breakfasts, desserts, quickLunches):

1. Add to the correct export array (`sauces`, `breakfasts`, `desserts`, `quickLunches`)
2. Include `heroImage` and `prepImage` if available
3. Ingredients can be strings or `{ text, link }` objects for cross-linking (e.g., linking to Money Mustard)
4. The prerender script auto-discovers cookbook items by matching `id:` + `title:` + `tagline:` patterns

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

## Image Enhancement Prompts (Gemini)

When a new recipe is added, generate and share these prompts for the user to run through Gemini image enhancement. Replace `{dish}`, `{protein}`, and `{sauce}` with the actual recipe details.

**IMPORTANT**: Always use "Transform this into..." to get Gemini to restyle the scene, not just color-correct.

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

## Code Style

- `npm run lint` must pass (eslint)
- No unused variables
- No render-time setState — use useEffect
- Prefer `Link` from react-router-dom over `<a>` for internal navigation
- Route paths: `/recipes/:slug` for dinners, `/cookbook/:id` for power-ups
