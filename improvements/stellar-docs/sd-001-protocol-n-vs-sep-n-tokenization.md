---
id: sd-001
service: stellar-docs
status: verified
discovered: 2026-07-03
evidence:
  - eval/qa/results/2026-07-03T03-49-35-variantA.json
  - eval/qa/results/2026-07-03T04-13-42-variantA.json
  - QA case q-protocol-24-whisk-incident (the round's one real QA failure)
  - live re-execution: correct content is hit #1 for the meetings-category query
  - Solo project 49, todo 822, comments 2204-2210
  - live re-verified 2026-07-06 (eval round todo 846): bare "Protocol 24" still returns 8/8 SEP-24 anchor pages; the Whisk/state-archival meetings content only surfaces (as hit #1) on the detail-rich meetings-scoped query
  - live re-verified 2026-07-09 (Solo scratchpad 565): bare "Protocol 24" still returns SEP-24/anchor pages as all top hits; "Protocol 24 Whisk state archival" with meetings filtering returns the Whisk/state-archival meeting content at rank #1
recurrences:
  - date: 2026-08-11
    evidence: live Stellar Docs recheck — bare `Protocol 24` returned eight SEP-24 docs hits, while `Protocol 24 Whisk state archival` with meetings included returned the 2025-10-16 Whisk/state-archival meeting at rank #1.
  - date: 2026-07-09
    evidence: the controlled Algolia harness now requires the exact `/meetings/2025/10/16` record plus `state`, `archival`, and `Whisk`; bare `Protocol 24` misses that semantic target across the tested strategies. The former any-`/meetings/` target could falsely pass an unrelated meeting hit and has been retired.
---

## Finding

Protocol-version queries against the main docs index surface SEP-24 pages:
"Protocol 24" tokenizes into SEP-24 matches. The actual Protocol 24 / Whisk
state-archival content lives in the meetings category and IS indexed — it is
hit #1 for the right category-scoped query — but the default query loses to
SEP-24 pages. This contributed to the round's one real QA failure
(`q-protocol-24-whisk-incident`).

## Evidence

2026-07-03 eval round results files above. Live re-execution confirmed both
halves: "Protocol 24" on the main index returns SEP-24 pages; the
meetings-category query returns the Whisk state-archival content as hit #1.
The 2026-07-09 re-check still reproduces the same split: bare protocol-version
intent is SEP-24-biased, while a detailed Whisk/state-archival query reaches
the correct meetings content. A controlled-harness audit found that the old
`/meetings/`-prefix expectation was too broad: an unrelated meeting result
could count as a recovery. The harness now requires the actual 2025-10-16
meeting URL and the Whisk/state/archival terms, preserving this as a real
recurrence instead of a URL-class false positive.

## Recommendation

Index-side disambiguation/synonym handling for "Protocol N" vs "SEP-N", or boost
meetings content for protocol-version-shaped queries.
