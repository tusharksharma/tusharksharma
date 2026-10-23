# SEO fixes — October 23, 2026

Audit: https://drive.google.com/file/d/12XqR_cX1q6492G2NHDMJx4AwkHnqCAW6/view

Shared Recipe serialization covers initial HTML and client navigation, including default kid options/variants. Public routes restore index/follow; utility routes retain their exclusions. The previous beef-bacon nutrition disclosure remains. No replacement nutrition was invented.

Cookbook discovery now includes crawlable category and recipe links, category-aware recommendations and dish-led Money Mustard/tiramisu titles. Existing recipe URLs, ingredients and photos remain. The concurrent chicken ditalini dinner classification is preserved.

The four audited video directories resolve to the existing approved tsp-videos release. All 11 referenced files passed Range GET with an MP4 signature. This is delivery verification, not full physical-device playback.

Checks: `node scripts/test-seo-fixes.js`, `node scripts/test-review-fixes.js`, `npm run lint`, `npm run build`. Publish-time check: `node scripts/validate-seo-videos.js --live`. The normal build checks the dated release snapshot; refresh it when approved media changes.

Search Console/GA4 pre-change baseline: **null — access/export unavailable**. No indexing, impressions, clicks, CTR, rank or traffic improvement is claimed. Rich Results Test, Search Console URL Inspection and physical-device playback are not established by local tests.
