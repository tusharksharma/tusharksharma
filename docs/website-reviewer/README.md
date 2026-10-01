# Website Reviewer

An on-demand reviewer that inspects a website from 12 perspectives and returns **exactly five prioritized improvements**, a **1-10 overall problem score**, dimension scores, and a problem score for every confirmed defect. Higher scores mean more serious problems. It works for the Split Plate and adapts to other websites.

This package is a reusable agent definition and machine-readable review contract. A host assistant supplies browsing, reasoning, and any diagnostic tools; the JSON file alone does not execute an audit or schedule future runs.

## Use the agent beside the existing personas

The native agent lives at [`../../.claude/agents/website-reviewer.md`](../../.claude/agents/website-reviewer.md). After the repository is updated locally, ask your assistant:

> Use the website-reviewer agent to review https://thesplitplate.com. Assess all perspectives, return exactly five prioritized improvements, and show the overall and per-improvement problem scores. Include the machine-readable report.

For a different website:

> Use website-reviewer on https://your-site.example. Our audience is independent designers and our primary goal is completed project enquiries. Compare relevant alternatives and return exactly five improvements.

For repeat reviews:

> Re-run website-reviewer on the same site using the attached previous report. Re-test old findings, identify regressions, and choose the five highest-priority improvements now. Explain any limits on comparing scores.

The repository's existing `.claude/agents` convention is the native integration. The agent inherits its host's model and available tools. A browser, search, or diagnostics integration must actually be present for the associated tests; the instructions never pretend to install those capabilities. See the [official custom-subagent documentation](https://code.claude.com/docs/en/sub-agents) for host discovery and invocation behavior.

## Portable machine-readable use

[`agent.json`](agent.json) contains the complete system prompt, checklist, weights, defaults, capability expectations, references, and optional Split Plate profile. To use another assistant or agent runner:

1. Load the object and supply `system_prompt` as the review instructions.
2. Supply the rest of the object as configuration/context and load [`report.schema.json`](report.schema.json).
3. Pass a request matching [`input.schema.json`](input.schema.json), or a natural-language equivalent.
4. Give the assistant authorized read access to the target and any tools it needs.
5. Validate the returned report. If the host's structured-output API supports only a subset of JSON Schema, adapt that transport schema without relaxing the final validator.

Example request:

```json
{
  "url": "https://thesplitplate.com",
  "audience": "Busy parents cooking for different household preferences",
  "primary_goal": "Help a visitor choose a useful dinner and build a weekly plan",
  "market_locale": "English-language family food websites",
  "output_mode": "markdown_and_json",
  "constraints": ["Passive security review", "Do not submit forms or modify the website"]
}
```

Only an inspectable target is essential. Optional context is inferred and labeled where possible. Do not place passwords, session cookies, or API keys in requests or reports. Missing capabilities produce explicit limitations and validation actions, not fabricated results.

## Review coverage

| Perspective | Weight | Main questions |
|---|---:|---|
| User interface | 8 | Clear controls, predictable interaction, state feedback, forms and recovery |
| Market competition | 8 | Audience fit, meaningful differentiation, comparable current alternatives |
| Navigation | 10 | Findability, hierarchy, search/filtering, direct links and return paths |
| Content quality | 10 | Usefulness, accuracy, clarity, completeness, evidence and audience fit |
| Mobile friendliness | 10 | Responsive layouts, touch, sticky content, forms, interruptions |
| Performance | 12 | Measured loading, responsiveness, stability and supported causes |
| Calls to action | 10 | Relevant next steps, clear outcomes, appropriate commitment and funnel |
| Security and privacy | 10 | Observable transport, headers, exposure, data handling and trust |
| Accessibility | 12 | Keyboard, semantics, focus, contrast, alternatives and inclusive interaction |
| Visual design | 6 | Hierarchy, typography, spacing, imagery, consistency and brand |
| Search and discovery | 2 | Metadata, direct routes, crawlability, structured data and sharing |
| Reliability and measurement | 2 | Error recovery, repeatable failures, meaningful success events |

The weights total 100. The review checks every perspective but does not force a recommendation in every category. The highest-impact five actions win. Each observed root cause is assigned one primary dimension to reduce double-counting. These weights and scores are explicit editorial prioritization choices, not an industry certification.

Default sampling: 6-10 representative pages, three primary journeys, desktop and two phone widths, and up to three relevant competitors. Small sites can be inspected in full. An assessor records actual coverage and capabilities; these are targets, not claims that tests were completed. Existing personas may inform audience lenses, but simulated reactions are never presented as user-study results.

Accessibility checks use [WCAG 2.2](https://www.w3.org/TR/WCAG22/) with criterion-specific exceptions. Performance checks use [Core Web Vitals](https://web.dev/articles/vitals), separating field measurements from lab results. Security uses the [OWASP testing guide](https://owasp.org/www-project-web-security-testing-guide/) as a reference for review areas, with passive inspection as the default scope. Source links and verification dates also live in agent.json.

## What each of the five actions contains

- A unique ID and rank, the affected page/component and audience, and supporting observations/evidence.
- Current behavior, desired behavior, and the user or business consequence.
- Problem score, confidence, and whether the action fixes an observed defect, explores an opportunity, or closes an evidence gap.
- A specific proposed change, expected benefit framed honestly, owner role, effort and dependencies.
- Pass/fail acceptance criteria and a success metric with baseline, proposed target, measurement method and guardrail.
- Previous-review status so unresolved issues, improvements and regressions can be tracked.

Effort is an estimate: XS is a localized copy/configuration adjustment; S is a small component/content change; M spans several components or requires coordination; L affects a journey/system; XL is a substantial initiative. State assumptions instead of pretending these labels guarantee delivery dates.

An observed defect receives a score of 1-10. A supported optimization opportunity receives 1 with `score_basis: no_observed_defect`. A validation task receives `null` with `score_basis: unmeasured`. If the whole site is inaccessible or no evidence is available, the overall score is also null and the report is blocked. This deliberate exception prevents a fabricated score from looking like a real audit; the report still contains five useful validation actions.

## Reproducible scoring

For a confirmed defect, rate impact, reach in the inspected scope, and persistence from 1 to 5 using the anchors in the agent prompt:

```text
score = round_half_up(1 + 9 * (
  0.50 * (impact - 1) +
  0.30 * (reach - 1) +
  0.20 * (persistence - 1)
) / 4)
```

Each dimension takes the highest score of its observations. An actually checked dimension with no observed defects scores 1. Untested or inapplicable dimensions are null. The overall score is the weighted mean of scored dimensions, rounded half up to one decimal. A directly evidenced critical override sets the overall score to 10 so a serious incident cannot be averaged away. The override requires a reason and inclusion in the action plan.

The report separately shows scored-weight coverage and fully-assessed-weight coverage over applicable weights. Partial checks can supply a score but do not count as full assessment. An overall score is provisional when sampling or testing is constrained. A lower score from fewer inspected areas is not evidence that the site improved.

Interpretation: 1-2 minimal observed problems; 3-4 minor; 5-6 material; 7-8 major; 9-10 severe or critical. Confidence remains separate. These scores do not imply CVSS, legal compliance, quantified lost revenue, or a full accessibility/security audit.

## Validate a report

Requires Python 3.9+ and jsonschema 4.x. Run from the repository root:

```bash
python -m pip install -r docs/website-reviewer/requirements.txt
python docs/website-reviewer/validate.py --self-test
python docs/website-reviewer/validate.py docs/website-reviewer/example-report.json
python docs/website-reviewer/validate.py path/to/your-report.json
```

[`example-report.json`](example-report.json) is a **synthetic format example**, not a real review of the Split Plate or any other website. Its example.invalid URLs and findings are deliberately fictional.

The JSON Schema enforces types, required sections, all 12 dimensions, and exactly five improvements. The Python validator additionally checks IDs/references, score formulas, dimension membership, overall aggregation, coverage, null handling, critical-issue inclusion, and prior-review consistency. Self-tests include healthy sites, blocked access, unsupported opportunities, critical overrides, malformed scores, and four/six-action reports. A validator cannot establish that evidence is true or that browser tests were actually performed; a reviewer must verify those claims.

## Maintenance

Keep the native Markdown body and `agent.json.system_prompt` identical. Update the checklist and tests together when behavior changes. Increment the scoring-method version before changing weights/formulas, and do not compare resulting scores without adjustment. Recheck referenced standards on later reviews and record the version used. Preserve prior reports externally when you want historical comparisons; this package does not create persistent review memory or an automation.
