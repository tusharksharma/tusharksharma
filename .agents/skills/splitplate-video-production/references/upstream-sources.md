# Ootto source provenance

Reviewed and adapted on 2026-10-06. The additions are instructions and record templates, not an installation of Ootto's runtime, hosted product, or integrations.

## Adapted MIT sources

- [Ootto-AI/claude-content-skills](https://github.com/Ootto-AI/claude-content-skills/tree/07b5294801d294e951fb39e06bafa9ce7fe09148), revision `07b5294801d294e951fb39e06bafa9ce7fe09148`: `reel-analyzer`, `hook-mining`, `ab-hook-tester`, `analytics-readout`, `ai-brain`, `comment-mining`, `reel-builder`, `b-roll-shot-list`, and `cross-platform-reformatter` under `skills/`. Used for reference analysis, evidence-backed hook alternatives, comparable analytics, relevant-note retrieval, audience questions, and shot-to-script mapping. License: [ootto-content-MIT.txt](ootto-content-MIT.txt).
- [Ootto-AI/ootto-watch](https://github.com/Ootto-AI/ootto-watch/tree/275e3a7d133b42a573a7f6ea9814f95456cc9ca4), revision `275e3a7d133b42a573a7f6ea9814f95456cc9ca4`: `SKILL.md` and inspection of `scripts/watch.py`. Used for combining visual evidence and speech on a timeline. License: [ootto-watch-MIT.txt](ootto-watch-MIT.txt).

Retain these notices with the adapted material. These notices cover the referenced upstream material; they do not relicense the rest of The Split Plate repository.

## Changes for The Split Plate

- Replaced Claude-only dependencies and sales workflows with provider-independent instructions that use available tools and existing production records.
- Preserved recipe evidence, the family-dinner split, existing approval gates, footage allocation, covers, inventory, and current strategy/experiments.
- Replaced blanket viral/algorithm claims and rigid hook wording with hypotheses, real evidence, and original recipe-specific language.
- Preserved caption timing as a requirement. The inspected watch helper flattens captions/transcription into untimed text, so it cannot alone provide its advertised timestamped speech alignment.
- Required a real bounded sampling strategy when tools are chosen. The inspected helper's frame-rate floor and explicit interval can exceed `max_frames`; no upstream executable is bundled or claimed to be tested here.
- Kept platform metadata and rendering choices flexible. No Ootto posting cadence, paid provider tier, auto-posting, automated public replies, or DM workflow is enabled.
- Kept personal learning records private by default because the target repository is public.

## Reviewed but not copied

[Ootto-AI/claude-story-audit](https://github.com/Ootto-AI/claude-story-audit/tree/027435b5f682f233d658f6ffa09138124c8df677), revision `027435b5f682f233d658f6ffa09138124c8df677`, was reviewed for context. No license file was present in the inspected repository and no instruction text or code from it is included. The learning guide independently follows The Split Plate's existing preference for comparable cohorts, medians, missing-data honesty, and cautious experiments.
