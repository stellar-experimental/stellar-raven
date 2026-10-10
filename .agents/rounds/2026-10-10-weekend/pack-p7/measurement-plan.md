# Pre-spend measurement brief: pack p7 versus p6

Date: 2026-10-10. Status: not run. This brief authorizes nothing by itself.
The owner approves the spend. A bounded delta re-review of the fix-round diff must pass before the
first paid call.

## Question

Does pack `p7` repair claim support on the saved omission rows without a grade regression on
stored-correct rows, and without a false upgrade on stored-wrong rows?

The offline evidence is in this folder:

- [replay-p7-omissions.json](replay-p7-omissions.json): 11 saved omission rows, 15 disputed claims.
  The transcript supports answer probes for 12 claims. The p6 pack holds that support for 2 claims.
  The p7 pack holds it for all 12. Omitted probes fall from 16 to 0.
- [control-selection.json](control-selection.json): 90 eligible stored-correct rows (32 case IDs).
  Answer-probe omissions fall from 266 (p6) to 56 (p7). Two rows of one case
  (`q-asset-rwa-tokenized-freshness`) lose probes under budget pressure. Their
  `claimSupportOmitted` lines count the anchors that did not fit. All 131 stable rows keep
  byte-identical judge prompts.

Offline support does not prove a better grade. Only a judge run can show the grade effect.

## Design

Use a paired re-judge. Both arms use the same judge model, rubric, panel, and saved answers.
Only the pack differs. Stored grades used rubric `v2.10`, so they are not the baseline.

| Arm | Code | Pack | Rubric | Model | Panel |
|---|---|---|---|---|---|
| A (baseline) | detached worktree at `d15a4ce5` | `p6` | `v2.11` | `claude-sonnet-5` | 3 |
| B (candidate) | detached worktree at `7e00ede2` (reviewed `w1010/r` code) | `p7` | `v2.11` | `claude-sonnet-5` | 3 |

Arm B runs before any merge, at `7e00ede2`. The delta re-review approved that code. Later commits
on `w1010/r` change only round documents. Record both arm commits in the ledger before spend.
Arm A reproduces p6 from the pre-change commit; the repository keeps no dual pack code.

The ledger for this measurement is `.agents/rounds/2026-10-10-weekend/pack-p7/ledger.md`.
It records the pins, the commands, every artifact path and SHA-256, and every stop decision.

The judge prompt text is identical at both revisions. The 15 `PROMPT_SHA256_FIXTURES` in
`runJudgeSelfTestStatic` pin the template with a fixed evidence string; they do not exercise p7.

Both arms read the source files from the main checkout. Pass each source as an absolute path
under `/Users/kalepail/Desktop/stellar-raven-codemode/eval/qa/results/`, because the arm
worktrees hold no results.

Case content depends on the source file:

- Five files are complete runs. Both arms use the default `--cases-ref`. `re-judge.mjs` then pins
  case content to the file's recorded `meta.sourceIdentity.runnerRevision`, and the
  revision-pinned case guard must match.
- Two files are incomplete runs: `2026-10-07-tool-surface-qa/2026-10-07T19-43-18-variantA.json`
  (94 of 100 rows) and `2026-10-07-tool-surface-qa/2026-10-07T16-51-53-variantA.json`
  (20 of 100 rows). Their `inputSnapshot.casesSha256` covers all 100 selected cases, but the
  revision-pinned guard hashes only the recorded rows. So no revision can match, and the default
  dry run exits 1. Both arms run these two files with `--cases-ref worktree`.
  The case content is then the tracked `eval/qa/cases.json`, which is identical at `d15a4ce5`
  and `7e00ede2`. Both arms read the same content, but it is the current corpus, not the
  snapshot of the saved run. Record `casesMode` and the observed cases SHA-256 in the ledger.
  These files affect 6 rows: Stage 1 `q-defi-etherfuse-stablebonds`; Stage 2
  `q-agent-identity-erc8004-stellar`, `q-protocol-27-cap-0071`, `q-soroban-token-transfer-pattern`;
  Stage 3 `q-ti-freighter-localhost-not-detected`, `q-defi-bridge-evm-to-stellar-axelar`.

Every run writes a separate `qa-rejudge-v1` artifact into its own worktree's `eval/qa/results/`.
It never replaces a stored verdict, a frozen adapter-measurement verdict, or a denominator.

## Row selection

`q-hist-quantum-preparedness-plan` appears in Stage 1 and Stage 2 from different source files.
The Stage 1 row is stored wrong (`2026-10-08T02-40-37`); the Stage 2 row is stored correct
(`2026-10-07T23-25-14`). They are different saved answers.

### Stage 1: omission rows (6)

These rows have a stored p6 pack, a saved `caseInput`, and an exact p6 rebuild
(`p6.matchesStoredPack: true` in the replay).

| Source file (under `2026-10-07-tool-surface-qa/`) | IDs |
|---|---|
| `2026-10-07T19-43-18-variantA.json` | `q-defi-etherfuse-stablebonds` |
| `2026-10-07T23-25-14-variantA.json` | `q-edge-fresh-latest-blend-tvl`, `q-sor-deploy-invoke-from-js-sdk`, `q-ti-rpc-gettransactions-pagination-xdr` |
| `2026-10-08T02-40-37-variantA.json` | `q-hist-quantum-preparedness-plan`, `q-soroban-oz-upgradeable-macro` |

The five August omission rows stay offline. They have p5 packs and no saved `caseInput`.
Their case snapshots come from external worktree paths, so a re-judge cannot pin them exactly.

### Stage 2: stored-correct controls (20)

[select-controls.mjs](select-controls.mjs) selects them deterministically: non-stable, stored
`correct`, stored p6 pack with an exact p6 rebuild, saved `caseInput`, and not a Stage 1 row.
It keeps one row for each case ID and takes evenly spaced IDs. The set has 11 scheduled and 9 live
rows: 8 Stellar Docs, 5 Scout, 4 Lumenloop, and 3 skills rows.

| Source file | IDs |
|---|---|
| `2026-10-07-tool-surface-qa/2026-10-08T02-40-37-variantA.json` | `q-aas-list-token-on-exchanges-aggregators`, `q-asset-stablecoin-issuers-discovery`, `q-comp-cross-moneygram-partnership-sep24`, `q-defi-arbitrage-pathpayment-bots`, `q-eco-pyusd-stellar-freshness`, `q-edge-fresh-latest-scf-round`, `q-mpp-discovery-and-modes`, `q-raph-remove-scam-token`, `q-scf-funding-by-category`, `q-sep-43-web-wallet-api`, `q-sor-cross-warmancer-zk-stack`, `q-soroban-contract-build-verification`, `q-ti-vocab-content-tags-live` |
| `2026-10-07-tool-surface-qa/2026-10-07T19-43-18-variantA.json` | `q-agent-identity-erc8004-stellar`, `q-protocol-27-cap-0071`, `q-soroban-token-transfer-pattern` |
| `2026-10-07-tool-surface-qa/2026-10-07T23-25-14-variantA.json` | `q-hist-quantum-preparedness-plan`, `q-raph-withdraw-exchange-self-custody` |
| `2026-10-08-flagged-rows/2026-10-08T19-04-23-variantA.json` | `q-gap-leaderboard-project-not-builder` |
| `2026-10-08-flagged-rows/2026-10-08T19-21-27-variantA.json` | `q-pc-quantum-preparedness-dormant` |

### Stage 3: stored-wrong no-false-upgrade controls (6)

The owner approved this stage under the orchestrator's acceptance of review finding B3.
`select-controls.mjs` writes these rows to `falseUpgradeControls`. The rule: non-stable, stored
`wrong`, saved `evidenceSupportCheck.status: "no-pack-omission"`, stored p6 pack with an exact
p6 rebuild, saved `caseInput`, one row per case ID, and no case ID from Stage 1 or Stage 2.
The rule yields exactly the six rows that the review named.

| Source file (under `2026-10-07-tool-surface-qa/`) | IDs |
|---|---|
| `2026-10-07T16-51-53-variantA.json` | `q-defi-bridge-evm-to-stellar-axelar` |
| `2026-10-07T19-43-18-variantA.json` | `q-ti-freighter-localhost-not-detected` |
| `2026-10-07T23-25-14-variantA.json` | `q-sor-force-fast-archival-localnet` |
| `2026-10-08T02-40-37-variantA.json` | `q-scf-verified-members`, `q-soroban-sdk-cve`, `q-tool-sdk-repos-discovery` |

Stable rows need no paid call. Their packs stay empty, and their prompts are identical.

## Calls and caps

Stored p6 judge calls (357 calls in the eligible files) cost a mean of $0.1315.
The p50 is $0.0873, the p90 is $0.2698, and the maximum is $0.4443.
Pack p7 stays within the same 12,000-character limit, so this brief uses the same distribution.

`re-judge.mjs` enforces only the total `--max-budget-usd` it receives, and it passes the remaining
amount to each call. So run one invocation per source file and arm. Set each file cap to
`rows × 3 × $0.27`, rounded up to the next $0.05: $0.85 for 1 row, $1.65 for 2 rows,
$2.45 for 3 rows, and $10.55 for 13 rows. The sum of the file caps is the enforceable envelope.

| Stage | Rows | Calls (2 arms × panel 3) | Expected at mean | File caps per arm | Enforced (2 arms) | Stage cap |
|---|---|---|---|---|---|---|
| 1 | 6 | 36 | $4.73 | $0.85 + $2.45 + $1.65 = $4.95 | $9.90 | $11.00 |
| 2 | 20 | 120 | $15.78 | $10.55 + $2.45 + $1.65 + $0.85 + $0.85 = $16.35 | $32.70 | $34.00 |
| 3 | 6 | 36 | $4.73 | $0.85 + $0.85 + $0.85 + $2.45 = $5.00 | $10.00 | $10.00 |
| Total | 32 | 192 | $25.25 | | $52.60 | $55.00 |

A budget-stopped file is a defined outcome. A continuation needs its own bounded authorization.
Do not raise a cap during the run.

## Pins before spend

Assert these in the shell that runs the paid commands, before the first paid call:

1. Put a private directory first on `PATH`. It holds only a link to the versioned Claude
   executable file, not the self-updating launcher.
2. Set `DISABLE_AUTOUPDATER=1` in that shell.
3. Set every Claude-related environment variable to its final value. Then compute the binary
   SHA-256 of the resolved executable, and the environment identity:
   `node --input-type=module -e 'import { agentEnvironmentIdentity } from "./eval/lib/executable-identity.mjs"; process.stdout.write(agentEnvironmentIdentity().sha256)'`.
4. Write the executable path, its version, both hashes, the arm-A commit (`d15a4ce5`), and the
   arm-B commit (`7e00ede2`) to the ledger.
5. Call `node` directly, not through `npm run`, so `PATH` does not change.

Use the same executable and environment hashes in every invocation of both arms. A changed pin
stops the method before the next paid call. A new pin needs a reviewed amendment.

## Commands

Preflight, free:

```sh
git worktree add --detach ../raven-p6-arm d15a4ce5
git worktree add --detach ../raven-p7-arm 7e00ede2
# In each arm worktree, for each source file (add --cases-ref worktree for the two incomplete files):
node eval/qa/re-judge.mjs <absolute source.json> --ids <ids> --judge-panel 3 --allow-non-identical --dry-run
node eval/qa/judge.mjs --self-test-static
```

Both arms report a non-identical tuple (source `v2.10`/`p6`), so both need `--allow-non-identical`.
Every dry run must exit 0 with `goldenTime.violations` empty. For the five complete files,
`guards.cases.matches` must be `true` in revision mode. For the two incomplete files, the dry run
reports `casesMode: "worktree"` and `cases.matches: false`; that is the expected state.
A dry run checks flag format only. It does not check the executable or environment pins.
The paid run checks the pins before its first call and stops on a mismatch.
The static self-test must print GREEN in both worktrees. The dry run and the self-test prove the
import path; `re-judge.mjs` needs no install.

Paid, per source file and arm, only after approval and the delta re-review:

```sh
node eval/qa/re-judge.mjs <absolute source.json> --ids <ids> --judge-panel 3 --allow-non-identical \
  [--cases-ref worktree, for the two incomplete files only] \
  --max-budget-usd <file cap from the table> \
  --claude-path <absolute path of the pinned executable> \
  --expect-agent-binary-sha256 <sha256> \
  --expect-agent-environment-sha256 <sha256>
```

Run Stage 1, then Stage 2, then Stage 3. Record every artifact path and SHA-256 in the ledger.
Within a stage, the two arms may run at the same time, because each invocation has its own cap.

## Stop rules

- Stop before spend if a dry run fails a case, golden-time, or identity guard.
- Stop if an arm-A artifact records a pack SHA-256 that differs from the stored p6 pack.
- `re-judge.mjs` has no per-call cap. After each invocation, the operator reads every call cost
  in the artifact. Stop if any single call costs more than $0.60.
- Stop a file when its cap is reached. Do not raise a cap during the run.
- Stop if a stage records more than two `error` verdicts; diagnose before a retry.
- Run Stage 2 and Stage 3 even if Stage 1 shows no grade change. They are the regression checks.

## How the result reads

Compare the panel score of arm B with arm A for each row (order: correct > partial > wrong).
No identical-input noise floor exists for panel 3 under `v2.11`. So the rationale rules below are
the predeclared attribution. A score change without a pack cause is reported as judge variance,
never as a pack effect.

Stage 2 passes when no row scores lower in arm B than in arm A. For any lower score, read both
rationales. It is a pack regression when the rationale cites p7 pack content, such as a span read
as a contradiction or a lost source item. Any pack regression blocks the p7 result and returns the
change for repair.

Stage 3 passes when no row scores higher in arm B than in arm A. An upgrade whose rationale cites
`claimSupportOmitted` is a pack regression. Any other upgrade needs both rationales; report it as
a possible false upgrade unless the arm-B pack shows real support that the arm-A pack lacked.

Stage 1 passes on support, not on grade. For each disputed claim in the replay, arm B must not
call the transcript-supported text fabricated or absent from evidence. Check
`evidenceSupportCheck`: arm B should report `no-pack-omission` where arm A reports
`pack-omission`. A row can stay `wrong` for another reason. For example, the quantum row still has
a Draft-versus-shipped question. Report that as a held grade with repaired support. A Stage 1
upgrade counts as a repair only if its rationale relies on shown spans, not on the omission line.

Report per row: both panel scores and votes, costs, pack SHA-256 values, `evidenceSupportCheck`,
and the rationale for every changed score. Report totals and the spend for each stage.

## Independent review after the run

The post-run review is mandatory. It reviews the artifacts, the per-row reading, and the
attribution before any claim about p7 reaches a ledger or a merge decision.

- Reviewer tier: Codex frontier (`gpt-6-astra`) at high effort, for dense analysis. It differs
  from the author (Claude Opus) and from the pre-spend reviewer (Claude Fable).
- Fallback: Grok (`grok-4.7`) at high, then Claude Opus at high in a fresh session.
- The reviewer writes findings to a Markdown file. The orchestrator reconciles every finding
  before the result is recorded.
