---
id: ll-010
service: lumenloop
status: reported-upstream
discovered: 2026-07-06
evidence:
  - eval/qa/results/2026-07-06T18-48-22-variantA.json (q-asset-rwa-tokenized-freshness, partial — overturned to pass in review)
  - verdict-review workflow wf_01b3347d-1b8 (triage: judge-artifact; the upstream signal survives the overturn)
  - live verification 2026-07-06: lumenloop search_content_semantic returned the Jun-19 and May-29 roundup quotes verbatim
  - Solo project 49, todo 846
  - https://github.com/lumenloop/lumenloop-backend/issues/27
recurrences:
  - date: 2026-08-11
    evidence: "Live semantic search returned the Jun 19 and May 29 roundups with unscoped RWA milestones; issue #27 remains open."
---

## Finding

Lumenloop weekly-roundup research items state headline Stellar RWA totals with
**no data source and no measurement scope**. The Jun 19, 2026 roundup says
"the network's on-chain RWA market cap crossed $3 billion, confirmed at the
June 25 developer meeting" — no source named, no statement of what counts as
RWA — while rwa.xyz's stablecoin-excluded distributed-value read for the same
window is ~$2.4B (down from ~$2.84B). The May 29, 2026 roundup says "Stellar's
RWA stack crossed $2.8 billion (3.5x growth since late 2025)", same pattern.
The figures are plausibly honest under a broader market-cap methodology, but
nothing in the text lets a reader tell which methodology — so the corpus emits
mutually contradictory milestones ($2.8B, then $3B, vs ~$2.4B on the standard
public tracker) that a consumer cannot reconcile.

Distinct from ll-009: that finding is about *misattributing* figures to the
wrong source; this one is about milestone figures carrying *no source or scope
at all*. Cross-reference ll-009 — together they mean no RWA number in the
roundup lane is currently verifiable as stated.

Consumer impact is demonstrated: in the 2026-07-06 QA round a judge graded a
verbatim, correctly-attributed quote of the Jun-19 roundup as fabrication,
because the unscoped $3B is irreconcilable with the rwa.xyz-anchored golden.
The verdict was overturned in review (the agent quoted its source faithfully),
but any rwa.xyz-anchored grader — human or automated — will make the same call.

## Evidence

Live lumenloop `search_content_semantic` (production, 2026-07-06) returns all
three figures verbatim, reproducible by querying for the weekly roundups:

- "Stellar Weekly Roundup — week of Jun 19, 2026": "the network's on-chain RWA
  market cap crossed $3 billion, confirmed at the June 25 developer meeting"
- "week of May 29, 2026" roundup: "Stellar's RWA stack crossed $2.8 billion
  (3.5x growth since late 2025)"
- Article "Q1 2026: Execution at network scale" (stellar.org, 2026-05-07):
  "Real-world assets on Stellar crossed $2 billion, up from $785 million at
  year-end 2025" — the SDF's own piece, included to show the trajectory the
  roundup milestones sit on.

Comparison point: rwa.xyz (stablecoins excluded) read ~$2.4B in the same
late-June window. QA case q-asset-rwa-tokenized-freshness in the 2026-07-06
stamp; review triage in workflow wf_01b3347d-1b8.

## Recommendation

Name the source and the measurement scope on every RWA milestone figure —
one parenthetical per number is enough: "per rwa.xyz, excluding stablecoins"
vs "including stablecoins/market-cap basis, per <source>". That single edit
makes the $3B-vs-$2.4B divergence self-explaining instead of contradictory,
and costs nothing editorially. Consumer-side workaround: treat roundup RWA
milestones as sourced-to-the-roundup-only claims with unknown scope; this
repo's eval goldens already credit any dated, sourced trajectory point rather
than gating on one number, which is the posture every downstream consumer
will need until the figures are scoped.
