# Baseline pilot review

Artifact: `2026-09-17T01-33-03-variantA.json`.
Answering and judging: `claude-sonnet-5`; pack `p6`; rubric `v2.10`.
The run completed all 16 rows and accounted for 48 calls, costing $5.8820244.
The original grades are preliminary: 3 correct, 7 partial, 6 wrong.
Independent source checks triggered three golden corrections during collection.
The original artifact and its answers remain unchanged.

The coordinator read all 16 answers and verdicts.
The table records initial triage, not a new grading instrument.
Transcript-based defect attribution requires the separate evidence review.

| Case | Original grade | Review |
|---|---|---|
| q-aas-issuer-fees-supply-cap-freeze | partial | Clawback missing. Extra master-key claims need signer-scope qualification. |
| q-asset-rwa-tokenized-freshness | correct | Dated asset-value scope and sources present. Extra claims remain outside verified facts. |
| q-defi-aquarius-what-is | wrong | Answer merges ICE roles. Golden voting and TVL notes also need correction. |
| q-defi-blend-what-is | partial | Protocol governance and pool-owner governance need a clearer distinction. |
| q-defi-soroswap-what-is | wrong | Answer merges API SDEX quotes with the on-chain AMM aggregator. Golden source caution needs correction. |
| q-eco-lobstr-wallet | partial | Funding figures lack an awarded-versus-paid basis. Golden blanket prohibition also needs correction. |
| q-eco-stablecoins-on-stellar | correct | Dated count, issuer distinction, and scope present. |
| q-gap-rpc-horizon-unindexed-reference | partial | Judge requires the explicit distinction between an index miss and API absence. |
| q-org-sdf-board-directors | partial | Names match. Judge penalizes missing pagination and directory-scope caveats. |
| q-protocol-parallel-execution | wrong | Answer omits the initial one-cluster setting and later two-cluster setting. |
| q-rwa-projects-tokenizing-stellar | partial | Directory inclusion needs a clearer distinction from confirmed issuance. |
| q-scf-hackathon-compare-live | partial | Counts match. Judge penalizes missing null and comparison-operation caveats. |
| q-soroban-av-passkeys-talk | correct | Answer labels summaries and avoids invented transcript offsets. |
| q-soroban-oz-upgradeable-macro | wrong | Answer uses retired derive APIs from the pinned skill; existing sk-022. |
| q-tool-soroban-auth-audit-live | wrong | Answer treats an invalid historical Critical finding as an active risk. The model clipped the source before its invalid disposition; see pilot-trace-review.md. |
| q-tw-escrow-api-auth-custody | wrong | The answer makes an unscoped exclusivity claim. The Core skill defect remains sk-025. |

Several partial verdicts depend on explicit procedure or source-scope caveats.
That observation alone does not justify changing the rubric or goldens.
Keep the fixed denominator and inspect fact-level differences between arms.

All 36 recorded public search calls return identical ranked IDs under baseline and D3.
This excludes internal execute searches and does not predict future model choices.
The affected long Soroswap question is not one of the pilot's actual search queries.
The pilot used `Soroswap` and `Stellar DEX AMM Soroban` instead.
