## Replay: how often the pointer fires

| Run | Rows | Executes with calls | Executes naming a series identifier | Executes that fire, certain | Executes that fire, possible only | Rows, certain | Rows, possible | Series that fired |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| baseline | 79 | 138 | 21 | 15 | 0 | 13 | 0 | sep 20, cap 3 |
| step0prime | 50 | 84 | 26 | 22 | 0 | 15 | 0 | sep 28, cap 4 |
| arm1 | 50 | 81 | 18 | 15 | 1 | 13 | 1 | sep 19, cap 3 |
| arm3 | 50 | 78 | 22 | 18 | 1 | 14 | 1 | sep 24, cap 2 |
| P0 | 58 | 113 | 23 | 17 | 0 | 14 | 0 | sep 20, cap 3 |
| P1 | 58 | 106 | 18 | 13 | 0 | 12 | 0 | sep 17, cap 3 |
| P1b | 10 | 16 | 1 | 1 | 0 | 1 | 0 | sep 1 |
| P1c | 10 | 19 | 0 | 0 | 0 | 0 | 0 | none |
| P2 | 58 | 107 | 19 | 15 | 1 | 12 | 1 | sep 19, cap 1 |

## Replay: against the agent's own research calls

| Run | Fires | Research for that identifier earlier in the row | Research for it in a later execute of the row | Fires on a row outside the 17 | Fires whose identifier the script's literals do not hold |
|---|---:|---:|---:|---:|---:|
| baseline | 23 | 0 | 1 | 3 | 0 |
| step0prime | 32 | 0 | 1 | 0 | 0 |
| arm1 | 21 | 0 | 1 | 0 | 0 |
| arm3 | 24 | 0 | 0 | 2 | 0 |
| P0 | 23 | 0 | 2 | 0 | 0 |
| P1 | 20 | 0 | 1 | 0 | 0 |
| P1b | 1 | 0 | 0 | 0 | 0 |
| P1c | 0 | 0 | 0 | 0 | 0 |
| P2 | 19 | 0 | 1 | 0 | 0 |

## The 17 identifier rows, per run

| Run | Of the 17 rows present | Row names a series identifier in a call | Pointer fires on the row | Research called with a series identifier in the row |
|---|---:|---:|---:|---:|
| baseline | 17 | 16 | 12 | 5 |
| step0prime | 17 | 16 | 15 | 2 |
| arm1 | 17 | 15 | 13 | 3 |
| arm3 | 17 | 15 | 13 | 2 |
| P0 | 17 | 16 | 14 | 4 |
| P1 | 17 | 14 | 12 | 3 |
| P1b | 2 | 1 | 1 | 0 |
| P1c | 2 | 0 | 0 | 0 |
| P2 | 17 | 13 | 12 | 2 |

## Rows where the pointer fires in at least one stored run (certain)

| Row | In the 17 | Runs where it fires | Identifiers |
|---|---|---:|---|
| `q-comp-aml-analytics-vendors` | yes | 1 | SEP-12 |
| `q-comp-sep8-regulated-assets-approval-server` | yes | 7 | SEP-0008, SEP-8 |
| `q-crp-oz-rwa-erc3643-trex` | yes | 5 | SEP-57 |
| `q-crp-remittance-founder-advisory` | no | 1 | SEP-24, SEP-31, SEP-6 |
| `q-edge-asset-site-scam-detection` | yes | 5 | SEP-1, SEP-8 |
| `q-edge-inject-ignore-instructions` | yes | 7 | SEP-10, SEP10 |
| `q-net-protocol-meeting-notes-find-cap` | yes | 7 | CAP-0046, CAP-67 |
| `q-nft-vault-contract-standards` | yes | 6 | SEP-0050, SEP-0056, SEP-41, SEP-50, SEP-56 |
| `q-pc-cross-redstone-sep40` | yes | 7 | SEP-40, SEP40 |
| `q-pc-quantum-preparedness-dormant` | yes | 2 | CAP-87 |
| `q-protocol-tier1-requirements` | no | 1 | SEP-1, SEP-20 |
| `q-sep-43-web-wallet-api` | yes | 7 | SEP-0043, SEP-43 |
| `q-sep-45-contract-auth` | yes | 7 | SEP-10, SEP-45 |
| `q-sep-53-sign-verify-message` | yes | 5 | SEP-0053, SEP-53 |
| `q-sep24-interactive-deposit-flow` | yes | 7 | SEP-10, SEP-24, SEP24 |
| `q-sep6-sep24-sep31-choice` | yes | 7 | SEP-24, SEP-31, SEP-6 |
| `q-soroban-oz-token` | yes | 7 | SEP-41 |
| `q-zk-host-functions-status` | yes | 5 | CAP-0075, CAP-0080, CAP-74, CAP-75 |

## Replay: measured lengths (characters)

| Run | Firing executes | Sentences per execute (max) | Executes with more than three identifiers (cap drops the rest) | One sentence, min to max | All sentences of an execute, median / max | Added to the result, median / max | Stored result of a firing execute, median / max | Firing executes with a stored result of 20,000 or more |
|---|---:|---:|---:|---|---|---|---|---:|
| baseline | 15 | 3 | 1 | 175 to 181 | 177 / 531 | 178 / 532 | 7893 / 19327 | 0 |
| step0prime | 22 | 3 | 0 | 175 to 181 | 177 / 533 | 178 / 534 | 6725 / 21290 | 2 |
| arm1 | 15 | 3 | 0 | 175 to 181 | 177 / 531 | 178 / 532 | 8160 / 21545 | 2 |
| arm3 | 18 | 3 | 0 | 175 to 181 | 177 / 541 | 178 / 542 | 7416 / 22237 | 1 |
| P0 | 17 | 3 | 0 | 175 to 181 | 177 / 531 | 178 / 532 | 7593 / 27467 | 3 |
| P1 | 13 | 3 | 0 | 175 to 181 | 181 / 531 | 182 / 532 | 10144 / 27044 | 1 |
| P1b | 1 | 1 | 0 | 177 to 177 | 177 / 177 | 178 / 178 | 16100 / 16100 | 0 |
| P1c | 0 | | | | | | | |
| P2 | 15 | 3 | 1 | 175 to 181 | 177 / 531 | 178 / 532 | 9697 / 25936 | 3 |

Pooled over the seven full runs (115 firing executes): one sentence 175 to 181; the checkpoint block without the pointer, median 1046, with it, median 1246; the stored result, median 8160, so the pointer is 2% of a median firing result.

## Replay: what the static reading could not see

| Run | Call sites | Sites with an argument it could not follow | Executes whose script shows a different operation set from the result's footer |
|---|---:|---:|---:|
| baseline | 254 | 5 | 1 |
| step0prime | 142 | 1 | 1 |
| arm1 | 143 | 2 | 1 |
| arm3 | 135 | 1 | 2 |
| P0 | 201 | 0 | 2 |
| P1 | 183 | 0 | 1 |
| P1b | 39 | 0 | 1 |
| P1c | 40 | 0 | 0 |
| P2 | 178 | 3 | 3 |
