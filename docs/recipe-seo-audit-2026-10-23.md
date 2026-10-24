# Recipe SEO Audit & Implementation Report — The Split Plate

- **Date:** 2026-10-23 (`2026-10-23T20:15:00Z`)
- **Target:** `https://thesplitplate.com` (`tusharksharma/tusharksharma`, baseline commit `b809be8`)
- **Mode:** `implement` (`status: partial` — repository/build verification complete; Google Search Console export unavailable)
- **Overall Problem Score:** **8 / 10** (provisional; driven by `media_discovery` before this pass)
- **Machine-Readable Report:** `docs/recipe-seo-audit-2026-10-23.json` (validated via `python docs/recipe-seo/validate.py`)

---

## 1. Executive Summary

Following the initial October 2026 SEO pass (`cb85952` / `b809be8`), a full-catalog audit across all **60 live dinners**, **139 cookbook entries**, **213 indexable routes**, and **334 video paths** uncovered four repository-wide gaps that were limiting rich-result completeness, media playback, and search snippet quality:

1. **Media Delivery & Step Image Discovery (`SEO-1`, Score 8/10 — Implemented):** `vercel.json` only routed 4 of 103 `tusharma88/tsp-videos` directories to the `videos-v1` release while sending the `/videos/:recipe/:filename` catch-all to `site-videos-2026-09`, leaving **238 of 334 video URLs returning 404**. Additionally, `toHowToStep` in `src/utils/recipeSchema.js` dropped `step.images[0]` / `step.image`, omitting **1,006 pictured step images** from `Recipe` JSON-LD. Both are now fixed and verified across all 334 videos and 1,006 pictured steps.
2. **Recipe Structured Data Completeness (`SEO-2`, Score 6/10 — Implemented):** `recipeTimings` previously skipped 48 recipes whose `time` string used parenthetical breakdowns (`"20 min (10 min tzatziki + ...)"`) or additive `prep + cook` segments (`"25 min prep + 45 min cook"`). Upgrading `recipeTimings` lifts truthful ISO-8601 `totalTime` coverage from **106/199 → 158/199 recipes** (plus `prepTime` and `cookTime` on 32 explicit prep+cook recipes) while keeping overnight/range/unquantified strings truthfully omitted. Added conservative `recipeCuisine` inference (76 recipes), `keywords` fallback (`r.bestFor` on 128 cookbook items), and `author.url` (`https://thesplitplate.com/about`).
3. **Series-Prefix Cleanup & Non-Truncated Meta Descriptions (`SEO-3`, Score 5/10 — Implemented):** 41 Cookbook items began descriptions and visible hooks with internal episode labels (`"CrumblCreamiCut Week X, Flavor Y — "`, `"Proffee Episode X — "`, `"Snack Box Series Ep. X — "`), and **96 of 199 recipe meta descriptions** were cut off mid-sentence with `…` at 155 characters. Series labels are now extracted into badge chips in `buildCookbookModel`, stripped from meta/schema descriptions via `cleanSeoDescription`, and summarized cleanly at sentence/clause boundaries (`<= 155` chars, **0 mid-sentence ellipses across all 213 indexable routes**).
4. **Internal Linking, Hub Crawlability, Author Bylines & Taxonomy (`SEO-4`, Score 4/10 — Implemented):** Added a categorized `"Browse all family dinners by protein"` directory to `/dinners` (matching `/cookbook`), updated `RelatedRecipes` on dinner pages to surface context-matched Cookbook sauces/bases (retaining Money Mustard for `spicy-chicken-sandwich` and default), added a visible `"By Tushar Sharma"` link to `/about` on every recipe page, and resolved all 4 taxonomy warnings in `src/data/taxonomy.js`.
5. **Search Console Baseline Validation (`SEO-5`, Validation Task — Proposed):** Because no Google Search Console export was supplied in this session, actual Google indexation, Recipe rich-result enhancement counts, and 28-day query CTR baselines remain `unknown` until `https://thesplitplate.com/sitemap.xml` is inspected in Search Console.

---

## 2. Diagnostic Scorecard

| Area | Status | Pre-Fix Problem Score | Post-Fix Repo Status | Summary |
| :--- | :--- | :---: | :--- | :--- |
| `crawl_index` | `assessed` | 2 / 10 | Resolved in build | 213 indexable URLs in `dist/sitemap.xml`, self-referencing canonicals, `noindex, nofollow` on `/social/*` and `/studio`. |
| `rendering_delivery` | `assessed` | 3 / 10 | Resolved in build | `scripts/prerender-content.js` renders full HTML into `#root` across all 213 indexable routes. |
| `recipe_schema` | `assessed` | 6 / 10 | Resolved in build | 158/199 recipes with truthful `totalTime`, 32 with `prepTime`+`cookTime`, 76 with `recipeCuisine`, 199/199 with `keywords` & `author.url`. |
| `query_intent` | `assessed` | 4 / 10 | Resolved in build | 41 series-prefixed Cookbook descriptions now lead with the dish, protein, and method. |
| `onpage_content` | `assessed` | 5 / 10 | Resolved in build | 0 of 213 indexable routes truncate mid-sentence with `…`; `seoTitle`/`seoDescription` wired into `prerender.js` and `RecipePage.jsx`. |
| `internal_links` | `assessed` | 4 / 10 | Resolved in build | Protein-grouped dinner directory on `/dinners`, context-aware Cookbook links in `RelatedRecipes`, 0 taxonomy warnings. |
| `media_discovery` | `assessed` | 8 / 10 | Resolved in build | All 334 catalog videos mapped in `vercel.json` and verified; 1,006 `HowToStep.image` URLs added to Recipe JSON-LD. |
| `mobile_performance` | `partial` | 2 / 10 | Verified in build | Responsive WebP `srcset`, explicit dimensions, `fetchPriority="high"` on heroes, `preload="none"` on videos. |
| `authority_trust` | `assessed` | 3 / 10 | Resolved in build | Visible `"By Tushar Sharma"` byline linking to `/about`, `author.url` in schema, explicit allergen and macro honesty disclosures. |
| `search_measurement` | `not_tested` | `null` | Needs GSC export | No Search Console export provided; indexation and query metrics remain `unknown`. |

---

## 3. Evidence Highlights

- **`E1` (`vercel.json` / `scripts/seo-video-release.json`):** Cross-checking all 334 `/videos/*` paths in `src/data/recipes.js` and `src/data/cookbook.js` against GitHub Releases showed 248 assets in `tusharma88/tsp-videos` (`videos-v1`) and 85 in `tusharksharma/tusharksharma` (`site-videos-2026-09`), plus `lean-beef-meatballs-marcus.mp4` in `tsp-videos`. Updating `vercel.json` to route the 66 `site-videos-2026-09` folders and 2 file overrides explicitly while defaulting `/videos/:recipe/:filename` to `tsp-videos` resolves all 334 paths (`node scripts/validate-seo-videos.js`).
- **`E2` (`src/utils/recipeSchema.js`):** Updating `toHowToStep` surfaces 1,006 step images (326 dinner + 680 cookbook) in `HowToStep.image`, and updating `recipeTimings` parses 48 additional explicit durations while keeping overnight/range/unquantified strings omitted.
- **`E3` (`scripts/prerender.js`, `src/hooks/useMeta.js`, `src/utils/recipeModel.js`):** `cleanSeoDescription` and `summarizeSeoDescription` eliminate all 41 leading series prefixes and all 96 mid-sentence `…` truncations across prerendered and client-hydrated routes.
- **`E4` (`src/pages/DinnersPage.jsx`, `src/components/RecipeDetail.jsx`, `src/data/taxonomy.js`):** Added the static protein-grouped dinner directory to `/dinners`, context-matched Cookbook power-up links on dinners, visible author attribution linking to `/about`, and classified `"quick"`, `"high-protein"`, and `"build"` in `taxonomy.js` (`0 error(s), 0 warning(s)`).
- **`E5` (`dist/` build verification):** Full build pipeline (`vite build`, `prerender.js`, `prerender-content.js`, `validate-seo.js`, `validate-seo-videos.js`, `test-seo-fixes.js`, `test-review-fixes.js`, `eslint .`) passed with 0 errors across all 213 indexable routes.
- **`E6` (`access_gap`):** No Google Search Console export or property access was provided.

---

## 4. The Five Prioritized Actions

1. **`SEO-1` (Rank 1, `media_discovery`, Score 8/10, `implemented_locally`):** Fix Vercel video rewrites for all 334 catalog videos and emit 1,006 `HowToStep` images in `Recipe` JSON-LD.
2. **`SEO-2` (Rank 2, `recipe_schema`, Score 6/10, `implemented_locally`):** Expand truthful `Recipe` JSON-LD duration parsing (`prepTime`, `cookTime`, `totalTime`), `recipeCuisine` inference, `keywords`, and `author.url`.
3. **`SEO-3` (Rank 3, `onpage_content`, Score 5/10, `implemented_locally`):** Strip internal series prefixes (`CrumblCreamiCut`, `Proffee Episode`, `Snack Box Series`) and eliminate mid-sentence meta description truncation across all 213 indexable routes.
4. **`SEO-4` (Rank 4, `internal_links`, Score 4/10, `implemented_locally`):** Add a protein-grouped dinner directory on `/dinners`, context-aware Cookbook links in `RelatedRecipes`, visible author bylines linking to `/about`, and clean taxonomy classification.
5. **`SEO-5` (Rank 5, `search_measurement`, Score `null`, `proposed`):** Submit `https://thesplitplate.com/sitemap.xml` in Google Search Console after deployment and record the 28-day indexing, Recipe rich-result enhancement, and query CTR baseline.

---

## 5. Recipe Optimization Brief (`SEO-3`)

- **Target URL:** `https://thesplitplate.com/cookbook/white-drop-cookies-n-creme-creami`
- **Primary Query Hypothesis:** `cookies and cream protein ice cream ninja creami`
- **Supporting Queries:** `high protein oreo ninja creami recipe`, `white chocolate cookies and cream creami`
- **Title Tag:** `Cookies and Cream Protein Ice Cream (Ninja Creami) — The Split Plate`
- **H1:** `White Drop Cookies & Creme Creami` (with `CrumblCreamiCut Week 3, Flavor 6` rendered as a badge chip)
- **Meta Description:** `White-chocolate cookies-and-cream protein ice cream for the Ninja Creami with Oreo thins, vanilla pudding mix, and 53g protein per pint.`

---

## 6. Verification & Next Steps

All repository changes and regenerated `dist/` artifacts have been verified via:
- `node scripts/validate-seo-videos.js` (334/334 catalog videos verified)
- `node scripts/validate-taxonomy.js` (0 errors, 0 warnings)
- `node scripts/test-seo-fixes.js` (5/5 tests pass)
- `node scripts/test-review-fixes.js` (4/4 tests pass)
- `node scripts/validate-seo.js` (7/7 sample routes + 2 hubs verified)
- `python docs/recipe-seo/validate.py --self-test docs/recipe-seo-audit-2026-10-23.json` (PASS)
