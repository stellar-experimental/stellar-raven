# Affected-case review stratum

Date: 2026-09-03

## Decision

This is a review stratum for the two-week paired QA measurement.
It does not change either paid 500-case arm.
Both arms retain every ordered active case in `eval/qa/cases.json`.

The exact baseline service revision is `90d0ba75eb529c6a1cf6fe276f16cf4f1da4f9f0`.
The candidate is the current working-tree service surface.
Its HEAD is `2ee801f80d626e68f010392a7d541aab7997349d`.
It has no immutable candidate revision.

## Inputs

| Input | SHA-256 or value |
| --- | --- |
| Baseline manifest | `f70880932b6262260260da028556f8027802b003cae79263417db4760d0a4e05` |
| Candidate manifest | `b613201846076e9fbaa70edfee4f506841c7cf690265e69c8d07afde567f6729` |
| Current case file | `1042c0e226ad44b5ffab8844e1c97a2752f94a3096b13e628ed630fd0f015c7f` |
| Ordered 500 case IDs | `b557bcb5cff8a434ad684b90a60343358360330ca1f91072089ceb57a38310d0` |

The baseline has 58 manifest operations.
The candidate has 60 manifest operations.
Forty-one operation records changed under canonical JSON comparison.
`scout.hackathonBrief` and `scout.resolveProject` are added operations.
No operation is removed.

## Deterministic selection rules

1. Load the exact baseline manifest and the candidate manifest.
2. Mark an operation changed when its canonical manifest entry differs.
3. Run the candidate `searchCatalog` implementation against each manifest.
4. Use each current case question and retain its ordered top five operation IDs.
5. Select a case when its ordered top five differs.
6. Select a case when a changed operation appears in either top five.
7. Preserve the `eval/qa/cases.json` case-array order.

The rules only define a review stratum.
They do not claim a causal quality effect.
The full paired arms measure wider routing, execution, and recovery changes.

## Result

| Measure | Count |
| --- | ---: |
| Ordered active cases | 500 |
| Selected review cases | 496 |
| Not selected | 4 |
| Ordered top-five differences | 215 |
| Changed-operation top-five captures | 496 |
| Both rules | 215 |
| Excluded from either paid arm | 0 |

The selected-ID sequence SHA-256 is `0aca348f479a095e9657fc225652ef2b77e48d52926da982a13044fe97c8ceec`.
The four unselected IDs are `q-defi-aquarius-what-is`, `q-defi-skill-project-dossier`,
`q-gap-lumen-content-tag-vocabulary`, and `q-infra-testnet-vs-futurenet`.

The durable artifact records every selected ID, each rule reason, changed operation IDs, and input hashes.
Its exact order is the current `cases[]` order.

- [affected-case-stratum.json](affected-case-stratum.json)

The artifact SHA-256 is `dd1e9e99f3341c57fd67462239a5f0675249b588ce46358d81e3c72e8e555449`.

## Reproducibility

I generated the artifact twice from the exact input hashes above.
The second byte stream matched the durable artifact with `cmp -s`.
The command exited with status 0.

No paid call ran.
No product code changed.
