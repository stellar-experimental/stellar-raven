---
id: sls-071
service: stellar-light-scout
status: fixed-upstream
discovered: 2026-08-19
upstreamTitle: Return an explicit miss for absent exact audit finding identifiers
evidence:
  - 2026-08-19 scout.searchResearch for V-SOR-VUL-002 returned the matching audit finding chunk
  - 2026-08-19 the same call shape for V-SOR-APP-VUL-003 returned section-classification boilerplate and the identifier was incorrectly classified as absent
  - this is the exact-identifier residual successor to resolved finding sls-064
  - upstream issue filed 2026-08-19: https://github.com/Stellar-Light/stellarlight/issues/975
  - 2026-08-25 corrected control: V-SOR-APP-VUL-003 is real, so it cannot prove absent-identifier behavior; successor sls-074 tracks that appendix-index false negative
  - 2026-08-25 live GET https://stellarlight.xyz/api/research?q=V-SOR-APP-VUL-999&limit=2 returned meta.exactMiss.identifiers with the truly absent identifier and the semantic-neighbour warning; the real V-SOR-VUL-002 control returned meta.exactMiss null
---

## Finding

An absent exact identifier previously fell through to section-classification
or other semantic neighbours without an explicit exact-miss signal.

The caller could not distinguish an exact miss from a weak semantic match. The
shipped `meta.exactMiss` contract now makes that distinction for identifiers
that are absent from the complete index.

## Evidence

The original evidence incorrectly treated `V-SOR-APP-VUL-003` as absent.
Veridise V2.1 proves that identifier is real. Successor `sls-074` records the
resulting appendix-index defect.

For this finding's actual absent-identifier contract, the 2026-08-25 live
recheck used `V-SOR-APP-VUL-999`. Scout returned that identifier in
`meta.exactMiss.identifiers` and labeled the result rows as semantic neighbours.
The real `V-SOR-VUL-002` control returned `meta.exactMiss: null`.

## Recommendation

Detect audit finding identifier syntax before semantic fallback. Return an
explicit exact miss when the complete indexed corpus does not contain the
identifier.
