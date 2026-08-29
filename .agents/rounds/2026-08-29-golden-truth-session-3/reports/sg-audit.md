# Sourcing-guard audit

Date: 2026-08-29  
Worker: gt3-sol-b

| id | shape | labels | disposition | reason | evidence URLs (for edits) |
|---|---|---|---|---|---|
| q-aas-trusted-asset-list-whitelist | targeted | without-evidence, not-verified | keep-advisory | The guard blocks unsupported safe/scam labels. A dated citation makes compliance visible in the answer. | n/a |
| q-asset-rwa-tokenized-freshness | targeted | not-verified | keep-advisory | The guard blocks an invented RWA number. A cited, dated report makes the measurement basis visible. | n/a |
| q-defi-oracle-landscape-live | targeted | without-evidence | keep-advisory | The guard blocks a permanent leader claim from a changing comparison. Current project and repository evidence can satisfy it. | n/a |
| q-eco-pyusd-stellar-freshness | targeted | without-evidence (two items) | keep-advisory | The guards block false issuer identity, false absence, and undated supply claims. Dated first-party evidence satisfies both items. | n/a |
| q-org-sdf-enterprise-fund | targeted | un-prefixed | keep-advisory | The guard blocks the false MoneyGram funding attribution and unsupported investee amounts. A dated announcement can satisfy it. | n/a |
| q-scf-history-soroswap | targeted | un-prefixed | keep-advisory | The guard blocks unsupported award figures. The named SCF records make the required evidence answer-visible. | n/a |
| q-scf-kale-winner-live | targeted | without-evidence | keep-advisory | The guard blocks an unsupported first-place claim from archived data. Current ordered event evidence can satisfy it. | n/a |
| q-tool-go-sdk-ingest | targeted | lacks-support | keep-advisory | The guard names concrete false Go ingestion claims. Current docs and package paths directly refute them. | n/a |
| q-builder-content-by-person | random | without-evidence | keep-advisory | The guard blocks unsupported person attribution from semantic matches. Exact-name and source validation are visible in an answer. | n/a |
| q-comp-yieldblox-oracle-incident | random | without-evidence | keep-advisory | The guard blocks an unconfirmed net-loss attribution. The truth block already marks that attribution unverifiable. | n/a |
| q-crp-custodial-vs-noncustodial-wallets | random | without-evidence | keep-advisory | The guard blocks unsupported custody labels. Current control-model evidence can satisfy it. | n/a |
| q-crp-oz-rwa-erc3643-trex | random | without-evidence | keep-advisory | The guard blocks stale function signatures. A pinned specification and source commit can satisfy it. | n/a |
| q-defi-allbridge-what-is | random | without-evidence | keep-advisory | The guard blocks stale route coverage and a false current XRPL Core route. Current provider evidence can satisfy it. | n/a |
| q-defi-liquid-staking-whitespace | random | without-evidence | keep-advisory | The guard blocks a permanent absence claim and false native-LST classification. A dated search and validator-reward source satisfy it. | n/a |
| q-defi-market-making-kelp | random | without-evidence | keep-advisory | The guard blocks unsupported maintenance status in either direction. Dated repository evidence can satisfy it. | n/a |
| q-edge-fresh-latest-protocol-version | random | without-evidence | keep-advisory | The guard blocks a stale current-version claim. A dated live-network lookup satisfies it. | n/a |
| q-hist-yieldblox-v2-2026-exploit | random | without-evidence | keep-advisory | The guard blocks one unsupported exact USD loss. A stated price basis and source can satisfy it. | n/a |
| q-jutsu-cash-crypto-ramps | random | without-evidence | keep-advisory | The guard blocks unsupported country coverage. Current provider evidence can satisfy it. | n/a |
| q-ti-scaffold-stellar | random | without-evidence | keep-advisory | The guard blocks stale versions, templates, paths, and scripts. A dated registry or source check satisfies it. | n/a |
| q-tool-cctp-stellar-integration | random | without-evidence | keep-advisory | The guard preserves two active Circle conflicts. It blocks unsupported Fast-mode conclusions from receive handlers. | n/a |

## Result

- `keep-advisory`: 20
- `reword`: 0
- `demote-to-notes`: 0
- Edited cases: 0
- The 12 random cases were clean: **yes**. All 12 are `keep-advisory`.
- I did not append a matrix row because no case required an edit.
- The required lint grep showed only the listed pre-existing warnings. It showed no `ERROR` and no `[gospel]` finding.
