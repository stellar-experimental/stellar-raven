# Evaluation map

The QA evaluation measures whether an agent gives a correct, current answer through `search` and `execute`.
It is the headline measure. Other instruments test routing, discovery, tool use, or specific behavior.

## Instruments

| Instrument | Measure | Cost and use | Status |
|---|---|---|---|
| [Routing: legacy](README.md) | Service ranking on 338 cases | Offline; run after catalog or scoring changes | Gate: top-1/3/5 baseline band |
| [Routing: skills](README.md) | Skill ranking on 23 cases | Offline; same routing run | Gate: top-1 floor |
| [Routing: holdout](README.md) | Blind routing on 49 cases | Offline; same routing run | Gate: top-1/3/5 floors and forbidden-capture ceiling |
| [Routing: extended](README.md) | Service ranking on 122 additional questions | Offline; same routing run | Diagnostic |
| [Routing: accept-either](README.md) | Routing with declared alternate service labels | Offline; same routing run | Diagnostic; keep separate from strict scores |
| [Protocol-history v1](protocol-history-cases.json) | Eight positive cases and four controls | Offline; same routing run | Frozen diagnostic |
| [Protocol-history v2](run-protocol-history.mjs) | 19 required, nine forbidden, and four neutral cases | Offline; `npm run eval:protocol-history` | Frozen diagnostic; source mismatches produce `source-expired` |
| [Discovery](discovery/README.md) | Source-family and usable-operation discovery on 43 cases; 91-query replay | One-shot and replay call a live MCP server without model calls; the agent arm is paid | Diagnostic |
| [Agentic routing](agentic/README.md) | Agent query reformulation and service selection on 30 cases | Paid; requires the Claude Code Workflow tool and a live server | Diagnostic |
| [QA battery](qa/README.md) | Final-answer correctness | Paid; use matched cases before and after substantial changes | Headline; membership comes from the [registry](qa/lifecycle-registry.json) |
| [Canonical live QA](qa/corpus/live/live-cases.json) | Live-data behavior on 15 cases | Paid; test grounding after executor or adapter changes | Separate diagnostic: `live-data-canonical-v3` |
| [Digest QA](qa/corpus/live/live-digest-supplement-cases.json) | Recency-digest grounding on two cases | Paid; test digest or skill-run questions | Separate diagnostic: `live-digest-supplement-v2` |
| [Playground](playground/README.md) | The public `/playground/chat` model and tool loop | Paid; uses selected QA cases | Diagnostic; keep its denominator separate from MCP QA |
| [Plan](plan/README.md) | Service coverage and broad-to-detail call order | Offline; grades stored QA transcripts | Diagnostic; progression is informational |
| [Temporal](temporal/README.md) | Answer behavior for temporal questions | Offline; grades stored results | Diagnostic |
| [Partner docs](partner-docs/README.md) | Required facts in partner documentation | Live source checks; see the instrument guide | Diagnostic |
| [Composition](qa/analyze-composition.mjs) | Tool composition in stored transcripts | Offline; accepts a saved result file | Diagnostic |
| [Missing-fact clusters](qa/cluster-missing-facts.mjs) | Repeated omissions in stored verdicts | Offline; accepts a saved result file | Diagnostic |

The Vectorize experiments measured NO-SHIP outcomes. The repository does not retain their implementation or commands.
Git history preserves their measurement evidence.

## Contract ownership

- [gates.json](gates.json) owns routing thresholds, accepted totals, input fingerprints, and baseline decisions.
- [The routing guide](README.md) owns routing commands, label normalization, and gate semantics.
- [The QA guide](qa/README.md) owns QA flags, judge contracts, comparison rules, and paired collection requirements.
- [The lifecycle registry](qa/lifecycle-registry.json) owns battery membership and case identity.
- [The corpus guide](qa/corpus/README.md) owns case authoring and lifecycle inputs.
- [The corpus provenance guide](corpus/PROVENANCE.md) identifies routing inputs and retained source material.
- [The run-evals skill](../.agents/skills/run-evals/SKILL.md) owns round coordination and required approval steps.

## Evaluation rules

1. Keep one headline and three routing gates. Keep all other instruments diagnostic unless an explicit decision changes their status.
2. Keep each instrument's denominator separate. Compare matched case IDs, case content, judge contracts, and service identities.
3. Fix general mechanisms. Do not tune the implementation to individual questions or alter failed holdout labels.
4. Grade volatile facts through behavioral goldens. Use the golden-truth workflow for changes to expected answers.
5. Edit source case files, then regenerate outputs. Never edit generated cases, samples, or lifecycle registries by hand.
6. Treat results as local evidence under ignored `results/` directories. Prune results older than 30 days after investigations end.
7. Preserve dated evidence. A historical score does not establish current correctness or authorize another paid run.

Each round files or updates evidence-backed upstream findings in [improvements/](../improvements/README.md).
Record problems in this repository in [.agents/TODO.md](../.agents/TODO.md).
The [improvements workflow](../.agents/skills/improvements-pipeline/SKILL.md) defines evidence and status requirements.
