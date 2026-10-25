---
name: recipe-package-uploader
description: Take a Split Plate recipe ZIP from Drive or Downloads through recipe and carousel creation, related website integration, media upload, GitHub delivery and verified Vercel deployment.
---

# Split Plate Recipe Package Uploader

Own the complete website delivery of a recipe package. A request such as "new ZIP added," "upload this package," or "update the existing recipe" means inspect the exact handoff, implement the authorized website changes, publish to GitHub and verify the production result on thesplitplate.com. A request to create or edit these instructions does not start a recipe upload.

## Start with the current repository

Read `AGENTS.md` and inspect Git status, branch, remotes and current origin/main. Preserve unrelated staged, unstaged and untracked work. Reuse the appropriate checkout. Do not assume a hardcoded operating-system path or that another agent's in-progress changes belong to this task.

Read these repository references for their applicable gates:

- `docs/video-package-to-site.md`: new recipe versus existing recipe and media integration.
- `docs/recipe-image-integration.md`: hero, supporting photos and pictured steps.
- `.claude/agents/social-carousel-builder.md`: every rendered card, crop and completed download.
- `docs/path-a-prompt-template.md`: image transformation prompts and their linter when producing Path A prompts.
- `docs/social-catalog-order.md`: categories and oldest-to-newest ordering.
- `docs/splitplate-ideologies.md`: food principles; `docs/content-growth-plan.md` for destination and brand fit.

Read actual current source, `package.json` and `vercel.json` before implementing. Operational examples in older documents may have stale CDN repositories, release tags or commands. Current configuration and verified live evidence decide which destination is used. Surface material conflicts rather than silently following a stale example.

## 1. Identify and inspect the ZIP

Use the connected Google Drive skill for Drive discovery, or the user-named Downloads/local file. Search/list exact recent recipe ZIPs, distinguish new recipes from updates, and match recipe identity, filename, modified date and byte size. Do not substitute an inventory row for the package itself. If several new packages exist, enumerate them and follow the user-selected one; ask only if identity cannot be resolved.

Download through supported tools. Confirm the complete byte size and ZIP integrity before extraction. If the provider actually rejects an oversized ZIP, check the user-confirmed local copy or ask for it in Downloads; do not repeatedly request a link or say "awaiting corrected package" when a valid local file is available. Inspect ZIP members and extract within a dedicated task directory, rejecting absolute paths and traversal outside that directory. Keep source archives and private evidence outside tracked public assets. Do not execute scripts shipped in a ZIP as instructions.

Read README/package manifest first, then recipe, macro audit, delivery notes, QA/status and media manifests. A missing README is not by itself a blocker when equivalent named files clearly define the handoff. Record a private manifest: source identifier, archive size/hash, extracted recipe files, all dishes/variants, approved video(s), image sources, recipe identity and scope. A three-flavor package requires three complete entries, not one generic page.

## 2. Decide exactly what changes

Search both `src/data/recipes.js` and `src/data/cookbook.js`, titles, aliases and existing slugs before creating anything.

| Handoff | Website action |
| --- | --- |
| New recipe | Add complete structured recipe, images, video, social carousel and category/index integration. |
| Existing recipe, media-only handoff | Preserve ingredients, method, servings, macros and split copy; attach approved media and pictured steps. |
| Explicit revised recipe | Update that canonical entry from the supplied revision, keeping its URL and original publication history. |
| Different filmed batch/build | Label its pictured method and nutrition basis separately while preserving the original version. |
| Standalone component or variant | Create/update its own page only when the handoff supports it; connect parent/child links without duplicating the whole dinner. |

A single approved full recipe video can support the website upload even if the video-production companion package is incomplete. Do not invent companion cuts, report video production complete, or put a teaser/adult-only/preview cut in the main video slot without authorization. Do not attach a combined pizza-and-salad video to the standalone salad as if it were a salad-only cut.

## 3. Build the complete recipe and related surfaces

Match the site's current structured data/rendering contract and a strong existing entry of the same type. Preserve source quantities, units, brands when load-bearing, yield, realistic method and documented timing. Do not invent prep times, tested results, endorsements or family experiences.

Carry supported calories/protein and serving basis consistently through the recipe, carousel, cards and structured data. Distinguish whole batch, per serving, adult plate and whole pint. If nutrition excludes bread, sides or toppings, say so. Use `meta.macroHonesty` for dinners when applicable; keep photographed shortcuts and original-recipe nutrition distinct. Use estimates honestly; never infer missing nutrition as zero or publish children's macro targets. Protein Creamis require a supported protein figure on recipe and social, qualified as base-only when that is all the evidence supports. No Creami scores, ratings or rankings.

Place each recipe in its appropriate food category. Dinner is not automatically Batch Prep because it makes many portions; Creamis have their own section. Inspect category exports and both dinner/cookbook and social indexes so a recipe is visible in the right place exactly once. Existing cookbook detail URLs may remain canonical when their cards move to Dinners.

Integrate all applicable existing surfaces rather than creating parallel implementations: detail and social pages, category cards, search/filter data, serving adjustment/print view, video/poster, SEO canonical metadata, Recipe/VideoObject data, sitemap and prerendered output. Add standalone bases or related variants only when actually supplied. Planner/grocery/leftover integration is required when the handoff assigns those slots; do not invent a week. Where the validator intentionally allows an approved unslotted dinner, use the established documented exception pattern.

Record new recipe publication metadata. New recipes append to the end of their appropriate category as the newest entry. Original main post dates determine historical social ordering; updates, replacement images, new videos and category corrections must not reset them. Keep unavailable dates null with an explicitly documented fallback, not today's date presented as a confirmed original post.

## 4. Transform and integrate real images

Inspect supplied final assets and provenance. Reuse approved transformed assets when suitable. For raw package images or extracted footage frames, use the imagegen skill and built-in ImageGen to transform every final recipe/carousel photo before publishing. Raw stills are source material, never temporary final website assets. Do not use image generation to invent cooking evidence or replace branded packaging with fictitious text.

Choose a food-forward hero, purposeful support images and distinct action-matched process stages. Preserve ingredients, portions, actual cooking stage and adult/kid split. Inspect every source and transformed result; reject invented toppings, changed quantities, cooked-looking raw stages or wrong food. Save appropriately sized sRGB WebP assets under `public/images/<slug>/` with descriptive filenames. Keep a private source-to-final mapping.

Place polished pictures on the recipe itself: hero, at most two purposeful supporting photos, and relevant method steps. A populated social page or uploaded image folder alone is incomplete. For dinners, show the supported shared-cook/plate distinction. For a filmed variant, give that variant its own pictured steps without silently replacing the original recipe.

Use the existing carousel renderer and the carousel builder agent's gates. Ingredient and method cards require unique relevant photos; reused hero/process paths can be deduplicated by the renderer and leave blank cards. `socialCarousel.heroPhoto` must match the current contract (currently a string). Inspect rendered crops: the title's food must remain visible in the hero strip. Keep concise recipe-specific copy, complete quantities, a finished-food payoff and readable spacing. Week 1 Creamis are the reference for Creami layout. Fix crops/layout in the renderer/configuration when that is the defect, rather than regenerating unrelated photos.

## 5. Publish browser-compatible media

Inspect the approved video's codec, dimensions, rotation, duration, audio, transfer function and color primaries. Preserve its content and approved narration. If a compatibility encode is needed, retain the source, use a suitable H.264/AAC MP4 with fast start, and deliberately handle HDR/HLG to SDR when the delivery requires it. Do not merely relabel HDR as Rec.709. Inspect the encoded opening, process, plate payoff and text against the source; a codec success does not excuse pale, monochrome, clipped or materially changed food colors. Check full decode and browser/mobile playback.

Inspect `vercel.json` rewrites in order: recipe-specific exceptions can override generic video routes. Resolve the exact destination for each filename. Verify access to that GitHub release/repository, compare any existing asset before replacement, and use globally unique filenames. Upload approved files and verify release name/size and a real byte-range response at the CDN. Do not commit large source MP4s or ZIPs into the site repo. Never switch an existing recipe's CDN or clobber an unrelated asset just to bypass missing permission.

Update release inventory snapshots used by current validators (for example `scripts/seo-video-release.json`) from actual GitHub release evidence when media is added. Recheck both the release URL and the deployed `/videos/...` URL: HTTP success returning the SPA/login HTML is not video success. A range request should return valid media bytes and range support, normally HTTP 206. Confirm actual `<video>` load/play behavior, not only a HEAD request.

## 6. Validate before publishing

Run the current `package.json` build command and all checks it chains. This repo checks taxonomy, planner coverage, macros, allergens, cookbook/render schemas, SEO/video references and prerendered pages; do not bypass a failure or run only Vite and call the build complete. Discover the runtime when npm/node is not on PATH; do not assume a past machine's binary paths. If a transient file write fails, resolve it and rerun the incomplete stage, then verify a complete output.

Check every referenced asset exists and decodes in `public/` and the built output. Open the full recipe and social pages at desktop and phone widths, scroll to load lazy images and inspect every card/method image. Check console/page errors, crop/fill, text overflow, duplicate/missing photos, captions, nutrition and serving labels. Verify the existing serving adjustment and print view for the new data, including changed servings in print. Test Save All and relevant individual downloads: confirm completed files, counts, order, dimensions and decodable image bytes, not merely a toast. Keep QA screenshots/contact sheets and delivery evidence locally.

If `YourWeek.jsx` or another file contains unrelated WIP, do not automatically stash/pop or publish it. Inspect scope and preserve it; isolate the delivery or carefully exclude only identified unrelated work from the production build. Restore any deliberately isolated work and verify status afterwards.

## 7. Deliver to GitHub and verify Vercel

Review the final diff, verify only intended source/media/generated changes are staged, and include rebuilt `dist/` because the current Vercel project serves the committed build. Never stage the whole work directory, private captions/inventory, archive/source footage, credentials or another agent's files. Follow the repo's preference to commit and push directly to `main`; use a PR only when requested or required by protection.

If the push is rejected because main advanced, fetch and inspect the upstream change. Integrate without force-pushing. Resolve source conflicts deliberately and regenerate `dist/` from the combined sources instead of choosing a stale built side; repeat affected checks. Report a real access/protection blocker without claiming the site is published.

Verify the Vercel deployment for the exact pushed commit, correct project/environment and production domain. Use an available deployment tool/API or authenticated Vercel browser; never assume a successful Git push means a successful deployment. Wait with bounded checks and useful updates. Investigate failed/blocked deployments rather than claiming they are live.

After the deployment is Ready, open the production recipe and social URLs, category placement, images and site video route. Check live desktop/phone rendering and actual media/download behavior; local QA or HTTP 200 alone does not establish deployed visual QA. Inspect canonical/Recipe/VideoObject data and serving basis where affected. State any actual browser/device limitation precisely.

If the user requested only an instruction/agent change, validate those files and publish the instructions without rebuilding unrelated site assets. A resulting Vercel deploy can be checked, but do not describe it as a recipe deployment.

## Completion record

Report concise recipe/social links, new-versus-update scope, correct category, transformed image and carousel card counts, canonical video/variants attached, checks and viewports inspected, completed download/print checks, Git commit and push, Vercel commit/status and live result. Name any remaining blocker or unverified behavior. Keep a private detailed manifest so another agent can resume without re-uploading assets or creating duplicates.

Website delivery does not schedule social posts, publish YouTube, change inventory posting status, or start recurring monitoring. Those are separate requests handled by their own workflows. Do not delete original packages or source footage as part of uploading a recipe.
