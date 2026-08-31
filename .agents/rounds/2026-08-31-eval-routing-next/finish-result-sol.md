# Clause-fit finish result

Date: 2026-08-31

Outcome: `FAIL`.

## Decision

The local-only preflight passed.
Both calibration commands passed.
The one authorized referee completed all five readings.
It wrote a result and exited `1` with `outcome: FAIL`.

No grid reading passed the acceptance table.
No grid reading qualified for `PARTIAL`.
m=0.10 had the fewest routing-gate failures and fewest changed rankings among grids.
It failed legacy top-1 and the holdout forbidden-capture ceiling.

I did not run a second referee.
I did not fetch or rebuild any model artifact.
I did not edit implementation, tests, contracts, `src/`, README files, or the shared ledger.

## Preflight identity

Exact command:

```sh
RAVEN_VECTORIZE_MODEL_DIR=/Users/kalepail/.cache/stellar-raven/qwen3-embedding-0.6b-q8-c25a394 npm run eval:vectorize:clauses:preflight
```

The command exited `0` after `1.59` seconds.

| Identity field | Value |
| --- | --- |
| Preflight | `PASS` |
| Probe vector SHA-256 | `d32aabf37d5aaeda98bd2c817cc7d38c6b746f82c89d874f982d8016fbaf4b4b` |
| Node | `v24.13.0` |
| `onnxruntime-node` | `1.24.3` |
| Platform | `darwin` |
| Model directory | `/Users/kalepail/.cache/stellar-raven/qwen3-embedding-0.6b-q8-c25a394` |

The preflight observed no remote fetch attempt.

## Calibration commands

Exact commands:

```sh
npm run eval:selftest
npm run eval:compile
```

`npm run eval:selftest` exited `0` after `0.22` seconds.
All self-tests passed.

`npm run eval:compile` exited `0` after `0.18` seconds.
It compiled 338 legacy cases and 122 extended cases.
It produced no tracked diff in `eval/routing-cases.json`.

## Referee command

Exact command:

```sh
RAVEN_VECTORIZE_MODEL_DIR=/Users/kalepail/.cache/stellar-raven/qwen3-embedding-0.6b-q8-c25a394 npm run eval:vectorize:clauses:run -- --dump-dir /tmp/stellar-raven-clause-fit-finish
```

The referee exited `1` after `28.71` seconds.
It embedded 563 unique questions once.
It completed all five readings and wrote the result.
The exit code is a measured `FAIL`, not a harness block.

## Output files and hashes

| Output | Bytes | SHA-256 |
| --- | ---: | --- |
| `eval/vectorize/results/2026-08-31T16-58-30-203Z-clause-fit-query-vectors.json` | 3,208,233 | `65ca5052c5258aeb1f5a30e93a1b9c1fde61aace80c8b3fdd4d044346385b8c2` |
| Query-vector payload | — | `55f11af02a90940b784719b819e52ac9da84a7fe028af8c258d9218f18e281b9` |
| `eval/vectorize/results/2026-08-31T16-58-42-389Z-clause-fit-hysteresis-v1.json` | 1,754,024 | `17e75f0d1b13848aa2e0841624e8496c558624493d156c3cb2115301a6a9cda0` |
| Clause artifact | 3,917,367 | `e5f86644af89158c3ac4d61ee7f651e2a062c9d292f194cb94872c7eee4e71f4` |
| `/tmp/stellar-raven-clause-fit-finish/identity.json` | 111,997 | `c9689d268af832919ee9c4cde4c87e1f48f05b38f8fbf8d04906054df375941a` |
| `/tmp/stellar-raven-clause-fit-finish/pure-fit.json` | 113,757 | `72dbe3f7666fdd8f367e3ccdf881db81386662873f8beab58b3ffa0b77b58fae` |
| `/tmp/stellar-raven-clause-fit-finish/grid-0.03.json` | 115,184 | `68b91c71b097a30805de8c78d00a8eeb482be0c50e8ec4eb387053fb944af8e2` |
| `/tmp/stellar-raven-clause-fit-finish/grid-0.06.json` | 113,475 | `6a7d7db9c8ff005a08f4b7842ec1a0c019a52ef46ce09aef79a19a09773e5efe` |
| `/tmp/stellar-raven-clause-fit-finish/grid-0.10.json` | 112,759 | `ae690db24693643ca600f947aefc850d7de22dbf635f4559c59033013d66f124` |

Result stamp: `2026-08-31T16-58-42-389Z-clause-fit-hysteresis-v1`.

The result has `selected: null`.
The local result files remain in place.

## Five-reading summary

The protocol columns show positive top-1, top-3, and top-5 counts.
The control columns show top-five control captures.

| Reading | Margin | Original | Original controls | Blind | Blind controls | Legacy | Skills | Holdout | Holdout forbidden | Extended strict | Extended accept top-5 | Version top-1 preserved | Changed rankings | New captures | Routing gate | Acceptance |
| --- | ---: | --- | ---: | --- | ---: | --- | --- | --- | ---: | --- | ---: | --- | ---: | ---: | --- | --- |
| identity | `Infinity` | 3/4/4 of 8 | 1/4 | 3/3/3 of 11 | 6/9 | 208/279/311 | 16/23/23 | 10/22/25 | 11 | 90/109/117 | 122 | yes | 0 | 0 | PASS | FAIL |
| pure fit | `0` | 0/0/0 of 8 | 2/4 | 0/1/2 of 11 | 1/9 | 86/187/231 | 18/23/23 | 18/33/40 | 28 | 20/59/81 | 103 | no | 495 | 42 | FAIL | FAIL |
| grid | `0.03` | 3/4/4 of 8 | 1/4 | 2/4/4 of 11 | 2/9 | 128/259/310 | 19/22/23 | 23/32/36 | 21 | 50/100/113 | 118 | no | 477 | 19 | FAIL | FAIL |
| grid | `0.06` | 2/4/4 of 8 | 1/4 | 2/4/4 of 11 | 6/9 | 166/282/311 | 19/23/23 | 20/30/34 | 12 | 82/109/114 | 121 | yes | 346 | 5 | FAIL | FAIL |
| grid | `0.10` | 2/4/4 of 8 | 1/4 | 3/3/3 of 11 | 6/9 | 196/281/311 | 17/23/23 | 15/29/30 | 12 | 91/109/117 | 122 | yes | 163 | 2 | FAIL | FAIL |

## Acceptance by reading

### Identity

The routing gate passed exactly.
The protocol contracts failed.
Identity is calibration only.

### Pure fit

Pure fit is diagnostic only.
It failed these routing checks:

- Legacy top-1, top-3, and top-5 were 86, 187, and 231.
- Holdout forbidden captures were 28.
- Extended strict was 20/59/81.
- Extended accept-either top-5 was 103.
- `q-protocol-version-history-list` ranked `stellarDocs.search_docs_in_category` first.

Both protocol contracts also failed.

### Grid `0.03`

This reading failed these routing checks:

- Legacy top-1 and top-3 were 128 and 259.
- Holdout forbidden captures were 21.
- Extended strict was 50/100/113.
- Extended accept-either top-5 was 118.
- `q-protocol-version-history-list` ranked `stellarDocs.search_soroban_contract_docs` first.

Both protocol contracts also failed.

### Grid `0.06`

This reading failed these routing checks:

- Legacy top-1 was 166.
- Holdout forbidden captures were 12.
- Extended strict top-1 and top-5 were 82 and 114.
- Extended accept-either top-5 was 121.

Both protocol contracts also failed.

### Grid `0.10`

This reading failed two routing checks:

- Legacy top-1 was 196.
- Holdout forbidden captures were 12.

Both protocol contracts also failed.
m=0.10 had the fewest routing-gate failures and fewest changed rankings among grids.

## Protocol misses and control captures

### Identity

Original positive misses:

- `ph-protocol-24-archival-root-cause`
- `ph-protocol-corrective-upgrade-history`
- `ph-protocol-upgrade-chronology`
- `ph-protocol-feature-origin`

Original control capture: `ph-control-current-protocol`.

Blind positive misses:

- `phb-whisk-forced-follow-up`
- `phb-archival-defect-network-upgrade`
- `phb-core-upgrades-dates-features`
- `phb-network-upgrades-reasons`
- `phb-second-cut-after-whisk`
- `phb-cap-archival-fee-repair`
- `phb-auditor-auth-recursion-follow-up`
- `phb-clawback-origin-emergency-changes`

Blind control captures:

- `phb-control-protocol-xdr-bug`
- `phb-control-incident-runbook`
- `phb-control-contract-exploit-review`
- `phb-control-sdk-version-history`
- `phb-control-cap-history-sep-support`
- `phb-control-kyc-breach-report`

### Pure fit

Original positive misses:

- `ph-protocol-24-archival-root-cause`
- `ph-protocol-corrective-upgrade-history`
- `ph-protocol-upgrade-chronology`
- `ph-protocol-regression-remediation`
- `ph-yieldblox-oracle-incident`
- `ph-security-incident-postmortems`
- `ph-soroban-auth-audit-history`
- `ph-protocol-feature-origin`

Original control captures:

- `ph-control-validator-vote`
- `ph-control-soroban-deploy`

Blind positive misses:

- `phb-whisk-forced-follow-up`
- `phb-archival-defect-network-upgrade`
- `phb-core-upgrades-dates-features`
- `phb-yieldblox-reflector-manipulation`
- `phb-network-upgrades-reasons`
- `phb-second-cut-after-whisk`
- `phb-cap-archival-fee-repair`
- `phb-clawback-origin-emergency-changes`
- `phb-whisk-post-mortem`

Blind control capture: `phb-control-contract-exploit-review`.

### Grid `0.03`

Original positive misses:

- `ph-protocol-24-archival-root-cause`
- `ph-protocol-corrective-upgrade-history`
- `ph-protocol-upgrade-chronology`
- `ph-protocol-feature-origin`

Original control capture: `ph-control-current-protocol`.

Blind positive misses:

- `phb-whisk-forced-follow-up`
- `phb-archival-defect-network-upgrade`
- `phb-core-upgrades-dates-features`
- `phb-network-upgrades-reasons`
- `phb-second-cut-after-whisk`
- `phb-cap-archival-fee-repair`
- `phb-clawback-origin-emergency-changes`

Blind control captures:

- `phb-control-contract-exploit-review`
- `phb-control-kyc-breach-report`

### Grid `0.06`

Original positive misses:

- `ph-protocol-24-archival-root-cause`
- `ph-protocol-corrective-upgrade-history`
- `ph-protocol-upgrade-chronology`
- `ph-protocol-feature-origin`

Original control capture: `ph-control-current-protocol`.

Blind positive misses:

- `phb-whisk-forced-follow-up`
- `phb-archival-defect-network-upgrade`
- `phb-core-upgrades-dates-features`
- `phb-network-upgrades-reasons`
- `phb-second-cut-after-whisk`
- `phb-cap-archival-fee-repair`
- `phb-clawback-origin-emergency-changes`

Blind control captures:

- `phb-control-protocol-xdr-bug`
- `phb-control-incident-runbook`
- `phb-control-contract-exploit-review`
- `phb-control-sdk-version-history`
- `phb-control-cap-history-sep-support`
- `phb-control-kyc-breach-report`

### Grid `0.10`

Original positive misses:

- `ph-protocol-24-archival-root-cause`
- `ph-protocol-corrective-upgrade-history`
- `ph-protocol-upgrade-chronology`
- `ph-protocol-feature-origin`

Original control capture: `ph-control-current-protocol`.

Blind positive misses:

- `phb-whisk-forced-follow-up`
- `phb-archival-defect-network-upgrade`
- `phb-core-upgrades-dates-features`
- `phb-network-upgrades-reasons`
- `phb-second-cut-after-whisk`
- `phb-cap-archival-fee-repair`
- `phb-auditor-auth-recursion-follow-up`
- `phb-clawback-origin-emergency-changes`

Blind control captures:

- `phb-control-protocol-xdr-bug`
- `phb-control-incident-runbook`
- `phb-control-contract-exploit-review`
- `phb-control-sdk-version-history`
- `phb-control-cap-history-sep-support`
- `phb-control-kyc-breach-report`

## New `scout.searchResearch` captures

Identity added no captures.

Pure fit added 42 captures:

- `q-anchor-platform-repo-discovery`
- `q-asset-amm-fee-reserve`
- `q-defi-comet-content`
- `q-defi-liquid-staking-whitespace`
- `q-defi-soroswap-resolve`
- `q-edge-deep-comprehensive-sep-audit`
- `q-edge-deep-multi-hour-soroban-survey`
- `q-edge-fresh-latest-scf-round`
- `q-hist-scp-rewrite-2015`
- `q-infra-testnet-vs-futurenet`
- `q-protocol-amm-cap-0038`
- `q-protocol-fee-model-base-fee`
- `q-protocol-ledger-close-time`
- `q-protocol-validator-node-roles`
- `q-scf-audit-bank`
- `q-scf-build-award-cap`
- `q-scf-history-aquarius`
- `q-scf-history-blend`
- `q-scf-how-to-apply`
- `q-scf-instawards`
- `q-scf-open-rfps`
- `q-scf-rfp-tooling`
- `q-scf-v7-changes`
- `q-scf-verified-members`
- `q-soroban-audit-bank`
- `q-soroban-event-indexing-design`
- `q-soroban-fee-structure`
- `q-soroban-oracle-defensive-consumption`
- `q-soroban-publish-events`
- `q-soroban-resource-limits`
- `q-soroban-sdk-cve`
- `q-soroban-simulate-resource-fee`
- `q-soroban-storage-types`
- `q-soroban-zk-bn254-poseidon`
- `q-edge-asset-site-scam-detection`
- `q-edge-validators-reverse-tx-fork-detection`
- `q-pc-bucketlist-vs-merkle-inclusion-proof`
- `q-pc-tx-finality-failure-semantics`
- `q-sor-index-sac-vs-sep41-events`
- `q-skill-oz-upgradeable-migrate`
- `ph-control-validator-vote`
- `ph-control-soroban-deploy`

Grid `0.03` added 19 captures:

- `q-edge-deep-multi-hour-soroban-survey`
- `q-hist-scp-rewrite-2015`
- `q-protocol-fee-model-base-fee`
- `q-protocol-quorum-slice-vs-quorum`
- `q-scf-build-award-cap`
- `q-scf-history-blend`
- `q-scf-how-to-apply`
- `q-scf-instawards`
- `q-scf-open-rfps`
- `q-scf-v7-changes`
- `q-scf-verified-members`
- `q-soroban-audit-bank`
- `q-soroban-oracle-defensive-consumption`
- `q-soroban-sdk-cve`
- `q-soroban-simulate-resource-fee`
- `q-soroban-storage-types`
- `q-sor-index-sac-vs-sep41-events`
- `q-skill-soroban-security-checklist`
- `q-skill-oz-upgradeable-migrate`

Grid `0.06` added five captures:

- `q-scf-build-award-cap`
- `q-scf-history-blend`
- `q-scf-how-to-apply`
- `q-scf-verified-members`
- `q-soroban-oracle-defensive-consumption`

Grid `0.10` added two captures:

- `q-scf-how-to-apply`
- `q-soroban-oracle-defensive-consumption`

## Changed rankings

| Reading | Changed rankings over 495 |
| --- | ---: |
| identity | 0 |
| pure fit | 495 |
| grid `0.03` | 477 |
| grid `0.06` | 346 |
| grid `0.10` | 163 |

The result JSON contains every before-and-after ranking.
The five dump files preserve every final ranking.

## Final interpretation

Clause fit did not solve the protocol-history routing defect.
m=0.03 and m=0.06 increased blind top-five from 3 to 4.
Original top-five stayed 4.
All controls and routing gates still failed.
The broad readings reduced precision and broke established routing gates.

The completed experiment therefore banks a measured `FAIL`.
The clause artifact and all local result files remain preserved.
