---
id: sd-042
service: stellar-docs
status: reported-upstream
discovered: 2026-08-14
upstreamTitle: The EVM migration guide calls Horizon deprecated while canonical pages say deprecation is future
evidence:
  - 2026-09-09 Raven-authored partial verification reply by kalepail: https://github.com/stellar-experimental/stellar-raven/issues/130#issuecomment-5595182633; content passes but the original search still returns the stale phrase. The handoff and finding stay open. Read back after posting.
  - 2026-08-14 live read of https://developers.stellar.org/docs/learn/migrate/evm/smart-contract-deployment returned "the deprecated Horizon API" in the Soroban Client section
  - 2026-08-14 live stellarDocs.search_docs for "Horizon nearing end-of-life deprecated" returned four canonical pages carrying "Horizon is nearing end-of-life and will eventually be deprecated in favor of Stellar RPC and Portfolio APIs"
  - the four pages are /docs/tools/lab/api-explorer/horizon-endpoint, /docs/tools/lab/api-explorer, /docs/learn/fundamentals/stellar-stack#horizon, and /docs/data/apis#horizon
  - resolved ledger entry sd-017 in improvements/resolved.json recorded this defect class as cleared on 2026-07-27; this is a new occurrence on a page that recheck did not cover
  - Solo scratchpad 809, todo 1541 finding F4
  - upstream issue filed 2026-08-19: https://github.com/stellar/stellar-docs/issues/2770
recurrences:
  - date: 2026-09-09
    evidence: Live EVM HTML and four canonical pages pass at 02:46:11Z, but both original Raven search checks still return the deprecated phrase at 02:48:09Z. Crawler lastReindexEndedAt is 2026-09-08T12:03:10.118Z, before deployment. Its stored midnight schedule conflicts with its observed noon start. No completed post-deployment crawl proves ingestion. See .agents/rounds/2026-09-08-docs-index-execution-astra.md.
  - date: 2026-09-08
    evidence: PR https://github.com/stellar/stellar-docs/pull/2806 merged as ad0accbd0da545ccba12b5a01fd5dc9e387977f8 and the rendered EVM guide now says "Horizon API (nearing end-of-life)"; however, production `stellarDocs.search_docs` still returned the pre-deploy "deprecated Horizon API" snippet at 15:43Z, so the original two-surface trigger still reproduces until the daily crawler refreshes
---

## Finding

The serving search index retains the EVM guide's old Horizon lifecycle label as of 2026-09-09.
The live guide contains the correction from PR #2806. Full verification awaits search ingestion.

## Original content finding — 2026-08-14

Four canonical pages used one hedged, future-tense sentence: "Horizon is nearing
end-of-life and will eventually be deprecated in favor of Stellar RPC and
Portfolio APIs."

The EVM migration guide used the present tense. Its Soroban Client section said:
"This library supplies a comprehensive networking layer API for Stellar RPC
methods as well as the deprecated Horizon API, simplifying the process of
building and signing transactions."

A reader who landed on the migration guide could conclude that Horizon was already
deprecated. That conclusion contradicted the four canonical pages. The two
labels could drive different decisions about starting new Horizon work.

This defect class was recorded before as `sd-017` and retired on 2026-07-27
after the last present-tense residual was cleared. The 2026-07-27 recheck
covered `/docs/data/apis`, `/docs/data/apis/horizon`, the Lab Horizon endpoint
page, and the Horizon-to-RPC migration guide. It did not cover the EVM
migration guide. This record is a successor, not a reopened `sd-017`.

## Evidence

The live page read and the live docs search both ran on 2026-08-14.

The search returned the identical hedged sentence on four separate canonical
pages. The migration-guide read returned the present-tense phrase verbatim.

## Recommendation

The occurrence correction is deployed. Verify a completed post-deployment crawl and corrected positive search records.
Keep the finding open while the original search trigger reproduces.
The shared lifecycle-text refactor remains separate from this occurrence correction.

## Original content recommendation

Change "the deprecated Horizon API" on
`/docs/learn/migrate/evm/smart-contract-deployment` to the canonical wording.
Use the same sentence the four other pages already use.

Add the Horizon lifecycle sentence to a shared partial or snippet. A single
source keeps every page consistent when the status changes.
