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

## Code Style

- `npm run lint` must pass (eslint)
- No unused variables
- No render-time setState — use useEffect
- Prefer `Link` from react-router-dom over `<a>` for internal navigation
- Route paths: `/recipes/:slug` for dinners, `/cookbook/:id` for power-ups
