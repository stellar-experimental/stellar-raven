---
id: sls-071
service: stellar-light-scout
status: reported-upstream
discovered: 2026-08-19
upstreamTitle: Return an explicit miss for absent exact audit finding identifiers
evidence:
  - 2026-08-19 scout.searchResearch for V-SOR-VUL-002 returned the matching audit finding chunk
  - 2026-08-19 the same call shape for absent identifier V-SOR-APP-VUL-003 returned section-classification boilerplate
  - this is the exact-identifier residual successor to resolved finding sls-064
  - upstream issue filed 2026-08-19: https://github.com/Stellar-Light/stellarlight/issues/975
---

## Finding

An exact identifier that exists can reach its audit finding. An absent exact
identifier still returns section-classification boilerplate.

The caller cannot distinguish an exact miss from a weak semantic match. This
can produce a false suggestion that the corpus contains the identifier.

## Evidence

The 2026-08-19 recheck used the same request shape for both identifiers.
`V-SOR-VUL-002` reached the matching finding. `V-SOR-APP-VUL-003` did not exist,
but the response did not report an exact miss.

## Recommendation

Detect audit finding identifier syntax before semantic fallback. Return an
explicit exact miss when the indexed corpus does not contain the identifier.
