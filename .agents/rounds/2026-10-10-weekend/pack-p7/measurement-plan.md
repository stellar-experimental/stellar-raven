# Pre-spend measurement brief: pack p7 versus p6

Date: 2026-10-10. Status: not run. This brief authorizes nothing by itself.
The owner must approve the spend before any paid call.

## Question

Does pack `p7` repair claim support on the saved omission rows without a grade regression on
stable, correct control rows?

The offline evidence is in this folder:

- [replay-p7-omissions.json](replay-p7-omissions.json): 11 saved omission rows, 15 disputed claims.
  The transcript supports answer probes for 12 claims. The p6 pack holds that support for 2 claims.
  The p7 pack holds it for all 12. Omitted probes fall from 16 to 0.
- [control-selection.json](control-selection.json): 90 eligible stored-correct rows (32 case IDs).
  Answer-probe omissions fall from 266 (p6) to 45 (p7). One row loses two probes under p7
  (`q-asset-rwa-tokenized-freshness`, `$4M`); its `claimSupportOmitted` line counts 29 anchors that
  did not fit. All 131 stable rows keep byte-identical judge prompts.

Offline support does not prove a better grade. Only a judge run can show the grade effect.

## Design

Use a paired re-judge. Both arms use the same judge model, rubric, panel, and saved answers.
Only the pack differs. Stored grades used rubric `v2.10`, so they are not the baseline.

| Arm | Code | Pack | Rubric | Model | Panel |
|---|---|---|---|---|---|
| A (baseline) | detached worktree at `d15a4ce5` | `p6` | `v2.11` | `claude-sonnet-5` | 3 |
| B (candidate) | `main` after this branch merges | `p7` | `v2.11` | `claude-sonnet-5` | 3 |

Arm A reproduces p6 from the pre-change commit. The repository keeps no dual pack code.
The judge prompt text is identical at both revisions; `runJudgeSelfTestStatic` pins it with the
15 `PROMPT_SHA256_FIXTURES`, which this change did not alter.

Every run writes a separate `qa-rejudge-v1` artifact. It never replaces a stored verdict, a
frozen adapter-measurement verdict, or a comparison denominator.

## Row selection

Stage 1, omission rows (6). These rows have a stored p6 pack, a saved `caseInput`, and an exact
p6 rebuild (`p6.matchesStoredPack: true` in the replay).

| Source file (under `eval/qa/results/2026-10-07-tool-surface-qa/`) | IDs |
|---|---|
| `2026-10-07T19-43-18-variantA.json` | `q-defi-etherfuse-stablebonds` |
| `2026-10-07T23-25-14-variantA.json` | `q-edge-fresh-latest-blend-tvl`, `q-sor-deploy-invoke-from-js-sdk`, `q-ti-rpc-gettransactions-pagination-xdr` |
| `2026-10-08T02-40-37-variantA.json` | `q-hist-quantum-preparedness-plan`, `q-soroban-oz-upgradeable-macro` |

The five August omission rows stay offline. They have p5 packs and no saved `caseInput`.
Their case snapshots come from external worktree paths, so a re-judge cannot pin them exactly.

Stage 2, controls (20). [select-controls.mjs](select-controls.mjs) selects them deterministically:
non-stable, stored `correct`, stored p6 pack with an exact p6 rebuild, saved `caseInput`, and not an
omission row. It keeps one row for each case ID and takes evenly spaced IDs. The set has 11
scheduled and 9 live rows: 8 Stellar Docs, 5 Scout, 4 Lumenloop, and 3 skills rows.

| Source file | IDs |
|---|---|
| `2026-10-07-tool-surface-qa/2026-10-08T02-40-37-variantA.json` | `q-aas-list-token-on-exchanges-aggregators`, `q-asset-stablecoin-issuers-discovery`, `q-comp-cross-moneygram-partnership-sep24`, `q-defi-arbitrage-pathpayment-bots`, `q-eco-pyusd-stellar-freshness`, `q-edge-fresh-latest-scf-round`, `q-mpp-discovery-and-modes`, `q-raph-remove-scam-token`, `q-scf-funding-by-category`, `q-sep-43-web-wallet-api`, `q-sor-cross-warmancer-zk-stack`, `q-soroban-contract-build-verification`, `q-ti-vocab-content-tags-live` |
| `2026-10-07-tool-surface-qa/2026-10-07T19-43-18-variantA.json` | `q-agent-identity-erc8004-stellar`, `q-protocol-27-cap-0071`, `q-soroban-token-transfer-pattern` |
| `2026-10-07-tool-surface-qa/2026-10-07T23-25-14-variantA.json` | `q-hist-quantum-preparedness-plan`, `q-raph-withdraw-exchange-self-custody` |
| `2026-10-08-flagged-rows/2026-10-08T19-04-23-variantA.json` | `q-gap-leaderboard-project-not-builder` |
| `2026-10-08-flagged-rows/2026-10-08T19-21-27-variantA.json` | `q-pc-quantum-preparedness-dormant` |

Stable rows need no paid call. Their packs stay empty, and their prompts are identical.

## Calls and caps

Stored p6 judge calls (357 calls in the eligible files) cost a mean of $0.1315.
The p50 is $0.0873, the p90 is $0.2698, and the maximum is $0.4443.
Pack p7 stays within the same 12,000-character limit, so this brief uses the same distribution.

| Stage | Rows | Calls (2 arms × panel 3) | Expected at mean | Stage cap |
|---|---|---|---|---|
| 1 | 6 | 36 | $4.73 | $11.00 |
| 2 | 20 | 120 | $15.78 | $34.00 |
| Total | 26 | 156 | $20.51 | $45.00 |

The stage caps equal the call count times the p90 cost, rounded up.
`re-judge.mjs` enforces a total cap only: it passes the remaining budget to each CLI call.
So run one invocation for each source file and arm, with `--max-budget-usd` set to
`rows × 3 × $0.45` for that file. That bounds each invocation near the stored maximum.

## Commands

Preflight, free:

```sh
git worktree add --detach ../raven-p6-arm d15a4ce5
# For each source file and arm, from that arm's worktree:
node eval/qa/re-judge.mjs <source.json> --ids <ids> --judge-panel 3 --allow-non-identical --dry-run
```

Both arms report a non-identical tuple (source `v2.10`/`p6`), so both need `--allow-non-identical`.
Confirm that the case guard matches and that `goldenTime.violations` is empty for every file.
Run `node eval/qa/judge.mjs --self-test-static` in both worktrees; both must print GREEN.

Paid, per file and arm, only after approval:

```sh
node eval/qa/re-judge.mjs <source.json> --ids <ids> --judge-panel 3 --allow-non-identical \
  --max-budget-usd <rows × 1.35> \
  --claude-path <absolute-path> \
  --expect-agent-binary-sha256 <sha256> \
  --expect-agent-environment-sha256 <sha256>
```

Use the same Claude binary and environment hashes in both arms. Each arm writes its artifact to
its own worktree's `eval/qa/results/`. Record every artifact path and SHA-256 in the round ledger.

## Stop rules

- Stop before spend if a dry run fails a case, golden-time, or identity guard.
- Stop if an arm A artifact records a pack SHA-256 that differs from the stored p6 pack.
- Stop if any single call costs more than $0.60.
- Stop a stage when its cap is reached; do not raise a cap during the run.
- Stop if a stage records more than two `error` verdicts; diagnose before a retry.
- Run Stage 2 even if Stage 1 shows no grade change. Stage 2 is the regression check.

## How the result reads

Compare the panel score of arm B with arm A for each row (order: correct > partial > wrong).

Controls pass when no control row scores lower in arm B than in arm A.
For any lower score, read both rationales. It is a pack regression when the rationale cites p7
pack content, such as a span read as a contradiction or a lost source item.
Any pack regression blocks the p7 measurement result and returns the change for repair.
A lower score with no pack cause is judge variance; report it with both rationales.

Omission rows pass on support, not on grade. For each disputed claim in the replay, arm B must
not call the transcript-supported text fabricated or absent from evidence.
Check `evidenceSupportCheck`: arm B should report `no-pack-omission` where arm A reports
`pack-omission`. A row can stay `wrong` for another reason. For example, the quantum row still
has a Draft-versus-shipped question. Report that as a held grade with repaired support.

Report per row: both panel scores and votes, costs, pack SHA-256 values, `evidenceSupportCheck`,
and the rationale for every changed score. Report totals and the stage spend.
