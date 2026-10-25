---
name: splitplate-recipe-uploader
description: Upload The Split Plate recipe ZIPs from Drive or Downloads to the website, including recipe updates, transformed images, social carousels, related pages, GitHub publishing and Vercel verification. Instruction-only requests do not upload recipes.
---

# Split Plate Recipe Uploader

Read and follow the complete [recipe package uploader agent](../../../.claude/agents/recipe-package-uploader.md) before uploading a package. It owns intake, new-versus-update decisions, recipe fidelity, media/CDN routing, carousel and category integration, build checks, GitHub delivery and exact-commit Vercel verification.

Read the current repository `AGENTS.md` and its applicable linked rules. Use the connected Google Drive skill for remote packages, imagegen for photo transformations, and the existing carousel builder agent for all rendered-card and download gates. Keep existing recipe URLs and publication history when updating.

Complete the user's authorized website upload through verified production delivery. A request to create or refine agent instructions changes the instructions only. Social scheduling and video production/publishing remain separate workflows.
