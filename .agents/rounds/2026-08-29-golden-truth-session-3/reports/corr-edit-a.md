# Corroboration-row edit report — gt3-sol-a

Date: 2026-08-29

Result: DONE. I added 59 corroboration rows to the 34 assigned cases. No claim was unsupported.

| Case | Result | Rows | Evidence |
|---|---|---:|---|
| q-aas-burn-clawback-redemption-mechanics | DONE | 2 | E01, E02, E10 |
| q-aas-claim-received-claimable-balances | DONE | 2 | E03 |
| q-aas-claimable-predicates-expiry-reserves | DONE | 4 | E03, E10 |
| q-anchor-moneygram-ramps | DONE | 3 | E06, E07 |
| q-asset-claimable-balance | DONE | 1 | E03 |
| q-asset-deploy-sac-cli | DONE | 2 | E05 |
| q-asset-issue-asset-howto | DONE | 1 | E01 |
| q-asset-path-payment-ops | DONE | 1 | E08; only the supported no-bridge/router clause |
| q-asset-sdex-vs-amm | DONE | 1 | E08, E09, E18 |
| q-asset-trustline-vs-sac | DONE | 3 | E05 |
| q-asset-usdc-eurc-path-fx | DONE | 1 | E08 |
| q-comp-clawback-cap0035 | DONE | 2 | E10 |
| q-comp-clawback-holder-risk | DONE | 2 | E05, E10 |
| q-crp-regional-offramp-mobilemoney | DONE | 1 | E12 |
| q-crp-remittance-founder-advisory | DONE | 1 | E11, E12 |
| q-defi-build-staking-for-own-token | DONE | 2 | E21 |
| q-pc-address-types-strkey | DONE | 2 | E14 |
| q-pc-doc-category-validator-search | DONE | 1 | E13 |
| q-pc-surge-griefing-threat-model | DONE | 2 | E15, E16 |
| q-protocol-amm-cap-0038 | DONE | 1 | E18 |
| q-protocol-network-passphrases-list | DONE | 1 | E19 |
| q-protocol-operation-types-list | DONE | 1 | E20 |
| q-protocol-operations-vs-transactions | DONE | 1 | E22 |
| q-protocol-quorum-slice-vs-quorum | DONE | 1 | E21 |
| q-protocol-scp-consensus-algorithm | DONE | 1 | E21 |
| q-protocol-tier1-requirements | DONE | 1 | E21, E23 |
| q-protocol-validator-node-roles | DONE | 3 | E21, E24, E25 |
| q-protocol-validator-upgrade-vote | DONE | 1 | E26 |
| q-scf-ambassador-program | DONE | 3 | E27, E28 |
| q-scf-skill-submission-radar | DONE | 1 | E30 |
| q-sep-clawback-prereq-flag | DONE | 3 | E05, E10 |
| q-soroban-contract-id-derivation | DONE | 2 | E31 |
| q-soroban-factory-pattern | DONE | 4 | E31, E32 |
| q-tool-js-sdk-package | DONE | 1 | E33 |

## Verification

- I appended the matrix before I edited the corpus.
- I fetched the cited primary sources on 2026-08-29.
- I changed only the 34 assigned case files.
- I did not change `question`, `golden`, or `tags`.
- I refreshed `truth.verified` with the required date, author, evidence line, and root cause.
- I repaired one dead provenance path in `q-asset-sdex-vs-amm`.
- All 34 JSON files parse and match the planned output.
- The lint command reported no errors or corroboration warnings for the assigned cases.
- The lint command retained two independent `avoid` sourcing-guard warnings.
- Those warnings affect `q-crp-regional-offramp-mobilemoney` and `q-defi-build-staking-for-own-token`.
