---
id: sls-061
service: stellar-light-scout
status: verified
discovered: 2026-08-05
upstreamTitle: Populate scfRoundAwards for awarded projects outside the parser population
evidence:
  - 2026-08-05 https://stellarlight.xyz/api/openapi.json (OpenAPI 1.8.35) defines scfRoundAwards as the official submission record per awarded round and the reconciling basis for scfTotalAwardedUSD
  - 2026-08-05 bounded production probe across 6 discovery queries and 123 distinct projects found 84 with scfAwarded true and non-empty scfAwardedRounds; 7 of 84 (8.3%) had scfRoundAwards []: comet [13,18], bondhive [27,29], stellar-security-portal [35,36], coins-ph [22], honey-coin [26], airswift [16], and idos [31]
  - 2026-08-05 official submission rechecks via lumenloop.get_scf_submissions exactly reconstructed Scout totals for comet (141000 + 150000 = 291000), bondhive (100000 + 40000 + 50000 = 190000), and coins-ph (50000)
  - the predecessor sls-058 is fixed-upstream for its filed linkage and aggregate defects; this successor owns only the remaining scfRoundAwards population gap
---

## Finding

Some currently awarded Scout projects expose non-empty `scfAwardedRounds` and
an aggregate, but leave `scfRoundAwards` empty even though the OpenAPI defines
that field as the official per-round reconciling basis. This is a bounded
sample, not an exhaustive population count: six discovery queries produced 123
distinct projects, of which 7 of the 84 awarded rows with known rounds lacked
the per-round records.

The gap is not confined to unpublished budgets. Official submissions
reconstruct the reported totals for sampled projects including Comet, BondHive,
and Coins.ph; it also occurs for Stellar Security Portal in rounds 35 and 36.
The predecessor's filed defects are fixed and remain separate.

## Evidence

The current contract is at:

- https://stellarlight.xyz/api/openapi.json

The bounded probe found all-or-nothing coverage for the affected rows: no
sampled row had only some of its awarded rounds represented. The closed
predecessor report is Stellar-Light/stellarlight#744; its earlier backfill
does not cover this successor's distinct population gap.

Reproduction:

```js
await scout.searchProjects({ query: "Comet", limit: 5 });
await lumenloop.get_scf_submissions({ name: "Comet" });
```

Repeat for the named sampled projects above. Do not infer an award amount when
the official submission does not publish one.

## Recommendation

Populate `scfRoundAwards` for every awarded project with a published official
submission record, including rows outside the existing parser population.
Keep the current empty-array behavior only where no official per-round record
is available, and preserve the existing non-inference rule for unpublished
budgets.
