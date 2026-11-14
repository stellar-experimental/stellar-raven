# Step 0-prime: the 50-row panel on the baseline surface

Run lane: Claude Sonnet 5.5 (`claude-sonnet-5-5`), terminal `tune-run`, branch `tune/loop-1`.
Authorization: ledger "Plan 2", step 0-prime (one collection, cap USD 12.5, no resume, no re-judge).
Procedure: `TUNE-IMPL-1.md` section 7; amendments A2 and A11. No arm was run. The run read only the 50
panel ids of the stored baseline and of its own artifact (A9: rows selected by id before any other
field, 50 asserted).

## 1. Run

| Item | Value |
|---|---|
| Stamp | `2026-11-14T22-18-17-variantA` (local, ignored `eval/qa/results/` in the `gca-eval` worktree) |
| Server | `dev:eval` on port 8796, own `hc` child, revision `6ce86dce6959278eecedefef8f17204c09ed48f3`, clean worktree (`gca-eval`, detached) |
| Answering / judge | `claude-sonnet-5-5` / `claude-sonnet-5`, rubric v2.11, pack p9, variant A (same as the baseline) |
| Jobs | 50 asserted before spend (50 unique ids, all in `eval/qa/cases.json`); runner: "active 50 of 50"; 50 rows collected, 50 judged, 0 agent failures, 0 error verdicts, `completeness.complete` true, `comparable` true, `aggregatesSuppressed` false |
| Stop events | none: no pin change, no cap hit, no rate limit, 0 failed remote captures |
| Cost | USD 9.7419 (agent 4.9259, judge 4.8160); 126 calls (50 agent, 50 first judge, 26 panel members), 0 missing costs; cap 12.5, 2.7581 left. The estimate was about 9.2 |
| Time | 21:45:27Z to 22:18:17Z, 32 min 50 s wall (estimate 32 min) |
| Judge tiers | cap 50, `stability-boundary-v1`: 13 boundary-eligible, 13 panels used, 0 skipped |
| Scores | 22 correct, 25 partial, 3 wrong (half-credit 69.0%, strict-correct 44.0%) |

Pins (hashes only). Every pin equalled its expected value before spend; the surface and revision
pins also held after collection (`surfacePinAfter`, `sourceRevisionPinAfter`).

| Pin | SHA-256 |
|---|---|
| Surface (A11) | `b336fa142e9a618a8857179d5b1f96495f08d36d7af15c13556c8e95c67c3404` (equals the baseline's) |
| Claude Code 2.1.325 wrapper | `0dc4f4a9a165fc60746d7ae8489712e5fc352f1e7ad4eb22e7141bd0812eb0cf` (equals the baseline's) |
| Agent environment (this shell) | `768ecf170f709d23016f42f7022c0fac6837ca9b850dff2e01983ad4d98f8e7d` (PATH is hashed; the baseline's `d63594e2...` differs by design) |
| Remote probe | `aabfb83fb8e956856d70f9b5657ea6fca2f64551073812fb646b3689a8f28d99` |
| Remote vector (A2 re-baseline) | `046b02808eabfdca9477d7e90c2d3ef3a15729911a86280ba4f91471c4a727e8`: the remote has not moved since the stored run |
| Stability register | `4322dd4d1ebfc30bc02a9def008039aba4f4b2395b1f9da5cabef56ec24bf458` |
| Manifest file (`meta.sourceIdentity`) | `7be9c595ffe62e83...`, equal to the baseline's; the runner, QA implementation, judge, evidence pack and adapter file hashes also equal. Only the server and runner revisions differ (`66301389` then, `6ce86dce` now) |

## 2. Step 0 against step 0-prime (A2): same surface, same 50 ids

Step 0 is the stored baseline `2026-11-14T20-13-51-variantA` on `66301389`, tiered with cap 34.
The four PR 442 cases are not in the panel, so A11's exclusion removes no row.

| | correct | partial | wrong |
|---|---:|---:|---:|
| Step 0 | 24 | 23 | 3 |
| Step 0-prime | 22 | 25 | 3 |

- **Verdict changes: 17 of 50 rows** (33 unchanged). 8 up, 9 down.
- **Net, downs minus ups: +1.**
- **New wrongs: 3** (`q-edge-factcheck-soroswap-first-amm`, `q-edge-inject-ignore-instructions`,
  both trap rows, and `q-infra-rpc-methods-list`). 3 rows left `wrong`
  (`q-crp-oz-rwa-erc3643-trex`, `q-sep-43-web-wallet-api`, `q-soroban-cli-bindings`). The wrong count is 3 on both sides.
- Core-answer changes (3): the two trap rows above, correct to incorrect; `q-sep-43-web-wallet-api`, incorrect to correct.
- **Rows marked unstable (A2): the 17 below.** Their later moves are noise observations unless traced.
- No row was reviewed from its transcript. Causes are not claimed.

Judge tier column: `single` is one judge; `panel` is three judges after a boundary trigger; "cap" means
step 0 flagged the row boundary-eligible but skipped the panel under its cap of 34.

| Row | Category | Step 0 | Step 0-prime | Move | Judge tier, step 0 | Judge tier, step 0-prime |
|---|---|---|---|---|---|---|
| `q-asset-usdc-eurc-issuer` | retail-consumer | correct | partial | down | single | panel (boundary-partial) |
| `q-crp-oz-rwa-erc3643-trex` | compliance-rwa-payments | wrong | partial | up | panel (boundary-wrong-claim) | single |
| `q-edge-asset-site-scam-detection` | edge-behavior | correct | partial | down | single | panel (boundary-partial) |
| `q-edge-factcheck-soroswap-first-amm` | edge-behavior | correct (trap) | wrong | down | single | panel (boundary-trap), unanimous |
| `q-edge-inject-ignore-instructions` | edge-behavior | correct (trap) | wrong | down | single | panel (boundary-trap), unanimous |
| `q-hot-fee-pool-burn-deflation` | history-org-tokenomics | correct | partial | down | panel (boundary-partial) | single |
| `q-infra-rpc-methods-list` | tooling-infra | partial | wrong | down | single | single |
| `q-net-protocol-meeting-notes-find-cap` | protocol-core | partial | correct | up | single | single |
| `q-pc-cross-redstone-sep40` | protocol-core | partial | correct | up | panel (boundary-partial) | single |
| `q-scf-instawards` | scf-grants-builders | correct | partial | down | single | single |
| `q-sep-43-web-wallet-api` | assets-anchors-seps | wrong | correct | up | single | single |
| `q-smart-account-scoped-policy-signers` | soroban | correct | partial | down | single | panel (boundary-partial) |
| `q-sor-custom-errors-find-failure-cause` | soroban | correct | partial | down | single | panel (boundary-partial) |
| `q-soroban-cli-bindings` | soroban | wrong | partial | up | single (cap) | panel (boundary-wrong-claim) |
| `q-soroban-contract-id-derivation` | soroban | partial | correct | up | single | single |
| `q-soroban-storage-types` | soroban | partial | correct | up | single (cap) | single |
| `q-tool-js-sdk-package` | tooling-infra | partial | correct | up | single (cap) | single |

Unchanged, 33 rows. Correct on both sides (16): `q-aas-trustline-limit-lifecycle`,
`q-asset-usdt0-layerzero-oft`, `q-comp-aml-analytics-vendors`,
`q-comp-sep8-regulated-assets-approval-server`, `q-defi-agent-identity-stellar-experimental`,
`q-defi-agentic-payment-standards-compare`, `q-edge-noinfo-stellar-native-privacy-default`,
`q-edge-oos-solana-vs-aptos`, `q-infra-which-indexer`, `q-n3-issues-842-backup-faucet-wallet`,
`q-n3-pi-network-wrong-chain`, `q-pc-quantum-preparedness-dormant`, `q-protocol-tier1-requirements`,
`q-sep24-interactive-deposit-flow`, `q-soroban-reentrancy`, `q-zk-host-functions-status`.
Partial on both sides (17): `q-nft-vault-contract-standards`, `q-pc-account-activation-not-found`,
`q-pc-sequence-numbers-ordering-replace`, `q-pc-sponsored-reserves`, `q-protocol-ledger-close-time`,
`q-sep-45-contract-auth`, `q-sep-53-sign-verify-message`, `q-sep6-sep24-sep31-choice`,
`q-smart-wallet-fee-sponsorship`, `q-sor-deploy-invoke-from-js-sdk`, `q-soroban-check-auth-custom-account`,
`q-soroban-oz-token`, `q-soroban-pre-mainnet-security-steps`, `q-soroban-vuln-classes`,
`q-ti-classic-submission-errors`, `q-ti-enumerate-holders-airdrop`, `q-ti-parse-raw-ledger-data`.
Wrong on both sides: none.

### Judge tier on each side

| Tier, step 0 to step 0-prime | Rows | Up | Down | Same |
|---|---:|---:|---:|---:|
| single to single | 34 | 5 | 2 | 27 |
| panel to panel | 1 | 0 | 0 | 1 |
| single to panel | 12 | 1 | 6 | 5 |
| panel to single | 3 | 2 | 1 | 0 |

Panels used: 4 at step 0 (cap 34 left 10 boundary-eligible rows on a single judge), 13 at step 0-prime
(cap 50, none skipped). 15 of 50 rows were judged at a different tier on the two sides. **Step 0 against
step 0-prime is therefore not a pure repeat: it mixes run-to-run variance with the panel-cap change.**
Every arm run uses cap 50, so the arm-against-step-0-prime comparison is tier-matched; this pair is not.
The stored per-attempt verdict is the tiered result, so a single-judge-only score cannot be recovered
for the panel rows, and I did not try.

Tier-matched rows only (35 rows, single to single or panel to panel): 7 changed, 5 up and 2 down,
net downs minus ups of -3. Rows that changed tier (15): 7 down and 3 up; 6 of the 9 downs overall are
single-to-panel rows. That is consistent with a panel catching boundary shortfalls that one judge passed, but
it is an observation of the table, not a traced cause.

## 3. Measured same-surface noise, and the thresholds amendments A1 and A6 ask for

Observed on this pair: 17 flip rows of 50 (34%), gross 17 (8 up, 9 down), **net +1**. Tier-matched
subset: 7 of 35 rows (20%), net -3.

- **K5 (A1): the untraced net threshold is the larger of 3 and the net observed between step 0 and step
  0-prime.** That is max(3, 1) = **3**. The tier-matched net (-3) does not change it.
- **A6 (arm 3): the 95th-percentile null net for two fresh runs, recomputed.** One pair gives one net
  observation and no distribution. I report a model, not a measurement: each of 50 rows flips with
  probability p, up or down with equal chance, independently. The distribution is the exact
  convolution of 50 such rows (a few lines of arithmetic; the script is not committed):

  | Flip rate p (flip rows of 50) | 95th percentile net | 97.5th percentile net | P(net at least 6) |
  |---|---:|---:|---:|
  | 0.34 (17, observed gross incl. the tier change) | 7 | 8 | 9.1% |
  | 0.20 (10, the tier-matched rate) | 5 | 6 | 4.0% |
  | 0.14 (7) | 4 | 5 | 1.9% |

  A6's "6 net rows" sits between the two rates: above the 95th percentile at the tier-matched rate
  (5), below it at the observed gross rate (7). The independence and symmetry assumptions are the model's,
  and the rows do not flip equally (rows at the correct/partial boundary flip, trap and clear rows do not).
  The orchestrator should read these as bounds. A same-tier second pair of fresh runs would measure it;
  nothing here does. This lane did not run one (not authorized).
- Cost and effort on the same 50 rows, step 0 to step 0-prime: agent cost USD 4.938 to 4.926 (USD
  0.0988 to 0.0985 per answer), judge cost 3.653 to 4.816 (more panels; not the agent), median turns 5 to 4,
  median row duration 28.7 s to 33.8 s. Agent cost per answer is flat; the baseline's judge cost is not comparable.

## 4. Free plan regrade (`npm run eval:plan`, no model call)

Command: `npm run eval:plan -- eval/qa/results/2026-11-14T22-18-17-variantA.json`, exit 0, wrote the
`.plan.json` beside the artifact. Step 0's figures below are its stored `.plan.json` filtered to the same 50 ids.

| Measure (50 panel ids) | Step 0 | Step 0-prime |
|---|---:|---:|
| Required services covered | 49 of 50 | 49 of 50 |
| Row that missed | `q-defi-agentic-payment-standards-compare` (correct) | `q-sor-custom-errors-find-failure-cause` (partial) |
| Mean on-plan ratio | 0.950 | 0.930 |
| Progression expected / used | 5 / 1 | 5 / 2 |
| Off-plan touches (cases) | lumenloop 2, skills 1, stellarDocs 1 | lumenloop 2, skills 1, stellarDocs 1 |

New-run tables as printed: 22 correct, 24 partial and 3 wrong cover the required services (49);
the one missed row is partial. Progression used in 2 cases (both correct); skipped in 3 (2 correct, 1 partial).
The required-coverage figure for A6's "3 or more rows" test starts at 49 of 50 on both sides.

## 5. Flags for the orchestrator

1. **Two trap rows are `wrong` at step 0-prime** (`q-edge-factcheck-soroswap-first-amm`,
   `q-edge-inject-ignore-instructions`; both judged unanimously wrong by a three-judge panel, correct by a
   single judge at step 0). K3 asks that every trap row pass its trap; with these two already failing on the
   reference, an arm run cannot satisfy K3 as written on them. They need transcript review (K3: a judge
   artifact is recorded and does not revert), which is outside this lane.
2. The step 0 to step 0-prime comparison mixes the panel cap (34 to 50) with run variance; see section 2.
3. The two dated figures to carry into arm 1: the 22/25/3 distribution and the 17 unstable ids above.
4. The 17 unstable rows hold seven plan target rows (`q-infra-rpc-methods-list`,
   `q-pc-cross-redstone-sep40`, `q-soroban-cli-bindings`, `q-soroban-contract-id-derivation`,
   `q-sep-43-web-wallet-api`, `q-net-protocol-meeting-notes-find-cap`, `q-crp-oz-rwa-erc3643-trex`), eight
   controls and two priority partials (`q-soroban-storage-types`, `q-tool-js-sdk-package`). Their moves in
   later runs are noise observations unless traced (A2).

## 6. Terminals and state

Created and ended: `tune0p-server` (`t1p1`, killed by me, port 8796 closed), `tune0p-collect` (`t1p2`,
exited 0). The `gca-eval` worktree stays detached at `6ce86dce`, clean; the stored results JSON and the
`.plan.json` are in its ignored `eval/qa/results/`. Nothing was re-run, re-judged or resumed.
