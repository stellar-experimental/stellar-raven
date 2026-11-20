# Partner-doc retrieval diagnostic

Compares literal required facts in Raven results against allowlisted public partner docs (source coverage only—not answer quality or adapter approval).

## Run

Reuse the running local Raven server and substitute its bound URL (omitting `--raven-url` scores candidate docs only and marks the gate `inconclusive`):

```sh
npm run eval:partner-docs -- --raven-url http://localhost:8787/mcp
```

[cases.json](cases.json) (validated by [cases.schema.json](cases.schema.json)) defines questions, baseline sources (Stellar Docs ops, `scout.searchResearch`, two pinned OpenZeppelin skills composed in one `execute` call), candidate URLs, and literal fact groups.

## Fetch boundaries

Read-only GETs to allowlisted candidate URLs only: Alchemy `https://www.alchemy.com/docs/**/*.md` or admitted `llms.txt`; OpenZeppelin pinned-commit MDX under `OpenZeppelin/docs` Stellar/Relayer roots (recording resolved commit and body SHA-256). Validates redirects, content types, UTF-8, and a 256 KiB cap; never connects to partner MCPs or APIs. Missing/failed baselines make the gate `inconclusive` without shrinking the denominator.

## Case cohorts and scoring

- `page-derived` questions come from the candidate page; `paraphrase`, `negative`, and `conflict` require provenance of an independent need (counted, not verified by the gate).
- Because all cohorts match literal phrases from candidate pages, high candidate recall does not prove generalization or answer quality (`distinctFactGroups` separates shared evidence from `totalFacts`).
- In `alchemy-stellar-balances`, `data envelope` / `results under a data envelope` came from a sibling page ([dated review](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/eval/partner-docs/README.md#the-one-miss-is-a-case-authoring-defect-not-a-source-gap))—treat a miss as an authoring limit, not a source gap.
- Absence claims require naming checked sources and method; conflict cases test retrievability only.

## Gate and interpretation

Retrieval gate requires all of: every baseline scored with zero baseline errors, candidate recall ≥ baseline + 20 pp, ≥ 3 cases improved with 0 regressions, zero candidate fetch errors, and ≥ 4 independent cases.

The harness always emits `headlineQaGate: not-run` and `shipDecision: do-not-ship-runtime-adapter`; [partner-doc-source-onboarding.md](../../research/partner-doc-source-onboarding.md) defines the remaining QA, resilience, drift, and security gates.
