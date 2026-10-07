# Recipe SEO Agent

A reusable agent for helping the Split Plate's recipes earn relevant Google Search visibility. It diagnoses technical barriers, improves recipe/search-intent alignment, prepares specific page changes, and defines how to measure results. **Every engagement returns exactly five prioritized actions with problem scores.**

## Start here

The native definition lives beside the existing personas at [recipe-seo.md](../../.claude/agents/recipe-seo.md). Update your local repository, then ask your assistant:

> Use the recipe-seo agent to audit https://thesplitplate.com. Review dinner and cookbook recipes, identify what could prevent discovery in Google, and return the five highest-priority actions with problem scores and the JSON report.

For a specific recipe before publishing:

> Use recipe-seo in prepublication mode for this recipe. Check search intent, title, description, factual content, internal links, images and Recipe JSON-LD. Draft improvements without inventing recipe facts or search-volume data.

For implementation:

> Use recipe-seo to implement the selected actions from this report in the repository. Preserve recipe facts, update the maintained generators where needed, run required checks, and report what was verified locally versus live.

Publishing follows the user's authorized scope. Merely invoking the agent for an audit or brief does not publish changes or send Google submissions. Existing user authorization should not be requested again.

For a follow-up with measurement:

> Re-run recipe-seo using the previous report and this Search Console export. Verify earlier findings, compare equivalent complete periods, and return five current priorities. Distinguish query hypotheses from measured opportunities.

## What it covers

| Area | What the agent evaluates |
|---|---|
| Crawling and indexing | robots/noindex, responses, redirects, canonical signals, sitemap and actual Google-reported status |
| Rendering and delivery | Recipe data versus generated HTML, browser rendering and deployed routes |
| Recipe structured data | Required/recommended fields, accurate facts, serving basis, validation and rich-result eligibility |
| Search intent | Dish, ingredient, method, equipment and occasion searches that the real content can satisfy |
| Titles and content | Proposed title/H1/description, useful instructions, honest claims and clear recipe access |
| Internal links | Discoverable recipe links, relevant components, orphaned content and useful collections |
| Images and video | Asset access, representative imagery, contextual alternatives, thumbnails and metadata |
| Mobile and performance | Usable recipe pages, disruptive layout/overlays and measured performance evidence |
| Credibility | Real experience/authorship, disclosures, supported claims and legitimate promotion |
| Search measurement | Search Console evidence, comparable periods, truthful baselines, change tracking and follow-up tests |

The profile understands the repository's dinner/cookbook distinction, prerender script, metadata hook, committed dist deployment, and intentional social/studio exclusions. Those are dated inspection pointers, not claims that every live page has already been audited. The agent must re-check the current implementation and deployed output.

## What you get in each report

The report shows the inspected scope and available access, a ten-area scorecard, the worst observed problem score, indexing/visibility evidence, and five actions. Each action includes:

- Evidence and the affected pages or source files.
- Diagnosis, score rationale and confidence.
- A concrete change, owner role, estimated effort and dependencies.
- Acceptance tests and a measurement plan with an actual baseline or an explicit unknown.
- Previous-review and implementation status.

Where relevant, an action includes a recipe brief: canonical destination, primary query, supporting phrases, demand evidence or hypothesis label, proposed title/H1/meta description, useful content changes, and exact internal links. These briefs support the five actions rather than creating an unranked extra backlog.

Problem scores range from **1 (minimal observed problem) to 10 (severe verified barrier)**. Overall SEO severity is the maximum scored area so a major indexing barrier is not averaged away. This intentionally differs from the website reviewer's weighted overall score. It is not a Google score or a forecast of rankings.

When fewer than five defects exist, the report uses supported opportunities or evidence-gathering tasks. An opportunity has score 1 with a clear hypothesis; an unmeasured validation task has a null score. Unknown indexing, missing analytics, and unavailable tools never become invented findings. If everything is inaccessible, the report contains five validation tasks and an unassessed overall score.

## Machine-readable use

[agent.json](agent.json) contains the full system prompt, checklist, inputs/defaults, scoring rules, repository profile and official references. [report.schema.json](report.schema.json) defines a strict JSON report with exactly five actions and all ten areas.

For a different assistant/runner, load `agent.json.system_prompt` as instructions and supply the rest of the specification plus report schema as context. The host must provide the actual tools. If its structured-output interface uses a subset of JSON Schema, adapt the transport while retaining final validation against this contract.

Natural-language inputs work; useful optional context includes target URLs, audience, market/language, competitor examples, a prior report, and Search Console/analytics exports. Do not pass secrets in the document.

The agent is on demand. It does not automatically connect Search Console, crawl every page, schedule monitoring, publish changes, or submit URLs to Google. Creating this definition alone does not change the website's search visibility.

## Evidence and realistic outcomes

Current guidance is linked in agent.json with its verification date. Key references include [Google's recipe documentation](https://developers.google.com/search/docs/appearance/structured-data/recipe), [JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics), [helpful content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content), and [Search Console](https://developers.google.com/search/docs/monitor-debug/search-console-start).

The agent separates a valid page, an indexed page, an eligible rich result, and an observed ranking. Google decides whether and how to show pages; neither valid schema nor a submission guarantees appearance. It uses authorized Search Console evidence when available and continues with clearly limited public/source inspection when it is not.

The workflow excludes fake ratings, fabricated recipe testing, invented search volumes, keyword stuffing, link schemes and mass-produced near-duplicate recipes. It preserves real recipe usefulness and the site's practical family-food promise.

## Validate output

With Python 3.9+:

```bash
python -m pip install -r docs/recipe-seo/requirements.txt
python docs/recipe-seo/validate.py --self-test
python docs/recipe-seo/validate.py docs/recipe-seo/example-report.json
python docs/recipe-seo/validate.py path/to/report.json
```

[example-report.json](example-report.json) is a **synthetic format example**, not a review of the Split Plate. Its example.invalid URLs and observations are fictional.

The validator checks schema, five distinct actions, ranks, evidence references, area/action/overall scores, unknown indexing states, sourced query demand, baseline references, report status and prior-report consistency. Its tests include both healthy and blocked scenarios. Validation checks internal consistency; it cannot establish that a claimed browser test happened or that evidence is truthful.

## Maintenance

Keep the native Markdown body identical to `agent.json.system_prompt`. Update the report schema and validator together when the contract changes. Recheck official guidance during later audits, discover renamed repository files, and preserve prior reports when historical comparison matters. The package does not provide persistent review memory.
