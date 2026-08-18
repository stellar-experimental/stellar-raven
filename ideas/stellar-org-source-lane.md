# Revisit direct Stellar.org source coverage

Status: held product idea. Re-evaluate on or after **2026-10-16**, or earlier only if the trigger
below fires.

## Current decision

Do not expose `stellarOrg` as a root service alongside `stellarDocs`.

The underlying Algolia source is real and useful: its English `pages` index covers official SDF
organization, mandate, funding, reports, announcements, use cases, and case studies. A four-operation
`stellarOrg` contract was authored and a complete implementation was measured. The source-retrieval
gate passed 10/10, but the service did not improve the targeted answer-quality slice and introduced
material routing capture outside its intended domain.

The current conviction is therefore not “Stellar.org has no value.” It is:

> Direct first-party provenance is valuable, but a broad new root namespace has not shown enough
> answer-quality benefit to justify its measured routing cost.

Keep using `stellarDocs` for `developers.stellar.org`. Prefer improving the existing Scout research
source family for canonical non-blog SDF pages over adding a second Raven-owned Algolia endpoint.

## Why the HOLD currently stands

- The candidate retrieved the intended official pages, so source availability was not the problem.
- The first paired seven-case QA run scored 3 correct / 3 partial / 1 wrong versus the baseline's
  3 correct / 4 partial / 0 wrong.
- Adding bounded body/snippet retrieval removed the wrong answer but produced the same headline
  result as baseline: 3 correct / 4 partial / 0 wrong, with no measured correct gain.
- Legacy routing moved from 209/285/316 to 203/277/306 at top 1/3/5. Of six top-1 captures, two
  were plausible official-source wins and four were real routing losses.
- A pre-registered symmetric capture test produced the blocking regression:
  `q-edge-deep-full-history-report` moved from correct to wrong after official-site calls crowded
  the research fan-out and the answer lost its scope-honesty qualification. The stablecoin issuer
  case also moved partial to wrong, while the Mazières case moved partial to correct.
- This demonstrated the actual tradeoff: the lane wins questions it should own, but broad
  first-party vocabulary also captures unrelated research questions and can reduce answer quality.
- The experimental branch was later deleted after review found no unique validated implementation
  work worth preserving. The authored dormant contract and evidence remain.

The alternative source-coverage path is tracked in
[`sls-055`](../improvements/stellar-light-scout/sls-055-canonical-sdf-organizational-pages-research-coverage.md).
Scout now covers several canonical SDF pages, but the finding remains open because coverage is not
yet complete and consistently quotable.

## Trigger to revisit

Reopen before the dated review only after **two unrelated, live-reproduced production or owned-QA
failures** where all of the following hold:

1. The missing or incorrect fact is present on a current `stellar.org` page.
2. No currently exposed source returns quotable support for it.
3. The failure is a source-coverage problem, not answer craft, stale truth metadata, or a routing
   label error.

At the dated review, first re-run representative SDF organization, funding, leadership, report,
announcement, and adoption probes against the exposed services. Close the idea again without an
implementation round if the trigger still has not fired.

## Re-evaluation requirements

If the trigger fires:

1. Review routing labels before the A/B so the candidate is measured against honest ownership.
2. Pre-register only cases whose missing facts are verified present in the proposed source.
3. Measure fact coverage and first-party citation rate, not only whole-answer grades.
4. Include a symmetric QA slice for every material routing capture.
5. Require no correct-to-partial/wrong regression and a demonstrated net answer-quality or uniquely
   reachable provenance gain.
6. Start from current main; do not resurrect the deleted experimental branch or add per-query
   synonyms and routing hacks.

## Durable references

- Authored dormant contract: [`specs/stellar-org.json`](../specs/stellar-org.json)
- Current upstream coverage finding:
  [`improvements/stellar-light-scout/sls-055-canonical-sdf-organizational-pages-research-coverage.md`](../improvements/stellar-light-scout/sls-055-canonical-sdf-organizational-pages-research-coverage.md)
- Local result artifacts, which are intentionally not committed:
  `routing-2026-07-13T08-54-21-839Z.json`, `routing-2026-07-13T15-28-14-998Z.json`,
  `2026-07-13T15-40-28-variantA.json`, `2026-07-13T15-54-24-variantA.json`,
  `2026-07-13T16-14-05-variantA.json`, `2026-07-13T17-14-46-variantA.json`, and
  `2026-07-13T17-24-39-variantA.json`.
- Solo decision record: `solo://proj/49/todo/pull-in-stellar-org--899`
- Solo evidence ledger: `solo://proj/49/scratchpad/stellarorg-algolia-l--609`
- Initial authored-contract commit: `3ef9131`
- Explicit dormant-status commit: `33ff0b0`
