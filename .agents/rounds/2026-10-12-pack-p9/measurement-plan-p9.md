# Pre-spend measurement plan: pack p9 against the p6 baseline

Date: 2026-10-12. Status: draft. **This plan authorizes no spend.** No paid call was made.
The design and the offline replay are in [design.md](design.md).
This plan reuses the p8 design ([measurement-plan-p8.md](../2026-10-10-weekend/pack-p8/measurement-plan-p8.md)).
It also reuses the amended Stage 2 rule of R6 ([amendment-p8b.md](../2026-10-10-weekend/pack-p8/amendment-p8b.md)).

Before any paid call, these must all be true:

1. An independent pre-spend review of the p9 code and this plan returns a launch approval.
2. The owner approves the spend.
3. The reviewed p9 commit is recorded in `REVIEWED` of [launcher/run-inv-p9.sh](launcher/run-inv-p9.sh)
   and in `armBNew.commit` of [rejudge-artifacts-p9.json](rejudge-artifacts-p9.json).
4. The free preflight below passes on the run day.

## Question

Does pack `p9` show the sibling records of every entity-list claim, and keep the p8 support repairs?
Does it do so without a grade regression on stored-correct rows and without a false upgrade on stored-wrong rows?

## Offline evidence (free, done)

[replay-p9.json](replay-p9.json), from [replay-p9.mjs](replay-p9.mjs) at `4b4fb9e2`:

| Check | p6 | p8 | p9 |
|---|---|---|---|
| Measured rows: entity-list records shown (of 63) | 19 | 12 | 62 |
| Measured rows: rows with every claim's evidence (of 32) | 21 | 26 | 30 |
| Measured rows: disputed claims held (of 37) | 15 | 36 | 36 |
| Omission rows: supported disputed claims held (of 12) | 2 | 12 | 12 |
| R8-1 row: records shown (of 11) | 6 | 5 | 11 |

Offline support does not prove a better grade. Only a judge run can show the grade effect.

## Design

The same 32 rows, source files, and stage assignment as the p7 and p8 runs.

| Arm | Code | Pack | Rubric | Model | Panel | Calls |
|---|---|---|---|---|---|---|
| A (baseline) | reused p6 verdicts of the p7 run (`d15a4ce5`) | `p6` | `v2.11` | `claude-sonnet-5` | 3 | 0 |
| B, 26 unchanged rows | reused p8 verdicts of the p8 run (`36e77d40`) | `p8` = `p9` text | `v2.11` | `claude-sonnet-5` | 3 | 0 |
| B, 6 changed rows | detached worktree at the reviewed p9 commit | `p9` | `v2.11` | `claude-sonnet-5` | 3 | 18 |

The p8 plan reran every row whose full judge prompt changed. This plan uses the same rule.
The replay shows that p9 changes the full prompt of exactly 6 rows. These are the rows with an entity-list unit:

| Invocation | Stage | Row | Source file | Cases |
|---|---|---|---|---|
| P9-S1a | 1 | `q-defi-etherfuse-stablebonds` | `2026-10-07-tool-surface-qa/2026-10-07T19-43-18-variantA.json` | worktree |
| P9-S1b | 1 | `q-edge-fresh-latest-blend-tvl` | `2026-10-07-tool-surface-qa/2026-10-07T23-25-14-variantA.json` | revision |
| P9-S2a | 2 | `q-asset-stablecoin-issuers-discovery`, `q-defi-arbitrage-pathpayment-bots` | `2026-10-07-tool-surface-qa/2026-10-08T02-40-37-variantA.json` | revision |
| P9-S2b | 2 | `q-agent-identity-erc8004-stellar` | `2026-10-07-tool-surface-qa/2026-10-07T19-43-18-variantA.json` | worktree |
| P9-S2d | 2 | `q-gap-leaderboard-project-not-builder` | `2026-10-08-flagged-rows/2026-10-08T19-04-23-variantA.json` | revision |

No Stage 3 row changes, so Stage 3 reuses its p8 panels and makes no call.

Reuse is valid only when all of these hold. The reading command checks the first one for every row.

- The rebuilt full p9 prompt equals the recorded prompt of the reused panel (p8 for arm B, p6 for arm A).
- The model, rubric, and panel are the same: `claude-sonnet-5`, `v2.11`, panel 3.
- The executable and environment pins are the same: binary
  `c9b5341637becbd423ddffc5b254afb645682a3868cb708bbc6cc0e7bb419937` (version `2.1.296`) and environment
  `ff926b437c1538395659ddf31b24d6268f61097ad4527eaf55738d0ccbe446ac`.
- A changed pin stops the method. It needs a reviewed amendment and matched reruns of both arms.
  That rerun is 64 row panels, 192 calls. The p7 run cost $18.19 for that size.

The p8 run as a whole is BLOCKED, but its verdicts are valid observations of identical inputs.
A reused p8 panel keeps its R6 classification. The p8 Stage 2 downgrades of
`q-scf-funding-by-category` and the `2026-10-07T23-25-14` quantum row stay "no identified pack cause".
The Stage 1 RPC downgrade stays "mixed cause". The p9 result must say that these rows are reused.

The run-evals skill requires the seven-call paid judge self-test when the evidence pack changes.
It runs first, from the p9 worktree.

## Cost

The basis is the stored spend of the same 6 rows. Their 18 calls cost:

| Run | Pack | Spend for the 6 rows | Run mean per call | Run maximum call |
|---|---|---|---|---|
| p7 run, arm A | p6 | $1.8617 | $0.0939 | $0.1810 |
| p7 run, arm B | p7 | $1.8635 | $0.0956 | $0.1608 |
| p8 run, arm B | p8 | $1.7754 | $0.0917 | $0.1967 |
| p8b continuation | p8 | $0.3774 (1 row) | $0.1258 | $0.1380 |

The p8 self-test cost $0.2822 for 7 calls.

| Item | Calls | Expected | Cap |
|---|---|---|---|
| Paid judge self-test | 7 | $0.28 | $3.50 ($0.50 per call, enforced by the wrapper) |
| P9-S1a | 3 | $0.28 | $0.85 |
| P9-S1b | 3 | $0.36 | $0.85 |
| P9-S2a | 6 | $0.69 | $1.65 |
| P9-S2b | 3 | $0.27 | $0.85 |
| P9-S2d | 3 | $0.18 | $0.85 |
| **Total** | **25** | **about $2.06 to $2.15** | **$8.55** |

The expected figures are the p8 spend of each row. The range uses the p6, p7, and p8 spend of the same rows, plus the self-test.
Each file cap is `rows × 3 × $0.27`, rounded up to the next $0.05, as in the p8 plan.
`re-judge.mjs` enforces only the total it receives. A budget-stopped file is a defined outcome.
A continuation needs its own bounded authorization. Do not raise a cap during the run.

## Pins and launcher

[launcher/invocations.tsv](launcher/invocations.tsv) lists the 5 invocations with their row subsets and caps.
[launcher/run-inv-p9.sh](launcher/run-inv-p9.sh) points at `/Users/kalepail/Desktop/raven-p9-arm`.
It reuses the frozen p8 environment ([run-node.sh](../2026-10-10-weekend/pack-p8/launcher/run-node.sh)).
It refuses to run while `REVIEWED` is empty, and it refuses any other HEAD.
The pinned link `/private/tmp/claude-501/w1010/r-pin/bin/claude` still resolves to version `2.1.296`.
Its SHA-256 was `c9b53416…` on 2026-10-12. A reboot can clear `/private/tmp`; then the pins must be rebuilt and checked.

## Commands

Preflight, free, on the run day:

```sh
git worktree add --detach ../raven-p9-arm <reviewed p9 commit>
# In this worktree:
node .agents/rounds/2026-10-12-pack-p9/replay-p9.mjs > /tmp/replay-p9-check.json   # equal to replay-p9.json apart from revisions.p9
node .agents/rounds/2026-10-12-pack-p9/analyze-rejudge-p9.mjs                       # status "not-run"; 26 reused rows, none inconclusive
node .agents/rounds/2026-10-12-pack-p9/analyze-rejudge-p9.mjs --stand-in p8         # every changed row INCONCLUSIVE
.agents/rounds/2026-10-12-pack-p9/launcher/run-inv-p9.sh <invocation> dry           # each of the 5; exit 0, goldenTime.violations empty
# In ../raven-p9-arm:
node eval/qa/judge.mjs --self-test-static
```

Recompute the binary and environment hashes through `run-node.sh` before the first paid call.
They must equal the pins above. Record the result in a ledger in this folder.
For the worktree-mode rows (P9-S1a, P9-S2b), the dry run must show the cases SHA-256
`55831c3cd80f93316a5ca1dff2c8e5dc9e717ede1b70d4050d9742ebe162196f`. This tree gives that value today.

Paid, only after the four conditions at the top:

```sh
# 1. The seven-call judge self-test, from ../raven-p9-arm.
/Users/kalepail/Desktop/raven-w1012-j/.agents/rounds/2026-10-10-weekend/pack-p8/launcher/run-node.sh \
  eval/qa/run-p6-judge-self-test.mjs --runner-revision <reviewed p9 commit> \
  --claude-path /private/tmp/claude-501/w1010/r-pin/bin/claude \
  --expect-claude-binary-sha256 c9b5341637becbd423ddffc5b254afb645682a3868cb708bbc6cc0e7bb419937 \
  --expect-claude-environment-sha256 ff926b437c1538395659ddf31b24d6268f61097ad4527eaf55738d0ccbe446ac \
  --out eval/qa/results/<stamp>-p9-selftest.json
# 2. The arm-B re-judge, one invocation at a time, in stage order (P9-S1a ... P9-S2d).
.agents/rounds/2026-10-12-pack-p9/launcher/run-inv-p9.sh <invocation> paid
# 3. After each invocation: add {invocation, path, sha256} to rejudge-artifacts-p9.json "artifacts", then read.
node .agents/rounds/2026-10-12-pack-p9/analyze-rejudge-p9.mjs > .agents/rounds/2026-10-12-pack-p9/rejudge-summary-p9.json
```

## Predeclared reading

[rejudge-artifacts-p9.json](rejudge-artifacts-p9.json) and [analyze-rejudge-p9.mjs](analyze-rejudge-p9.mjs)
are fixed before any grade is known. For each row the command reports:

- both panels, every vote, the source of the arm-B panel (`p9-new`, `p8-reused`, or `not-run`), and costs;
- the rebuilt p9 pack and prompt hashes, and the p9 entity-list coverage;
- for each arm-B vote: the span-only support check on the rebuilt pack, the avoid matches, the entity-list
  records that the rationale names, any notice citation, and any entry-number mention.

The mechanical gate for each new p9 panel: pack `p9` with its rebuilt SHA-256; the rebuilt prompt hash on every call;
exactly 3 graded votes; 3 reported costs; no call over $0.60; a `successful` outcome; and a passed postflight.
A failed gate makes the row INCONCLUSIVE. An error vote has no grade, so it fails the gate (R7-2).
The `--stand-in p8` output proves the gate offline: [rejudge-summary-p9-standin.json](rejudge-summary-p9-standin.json).

## Stop rules

- Stop before spend if a dry run, the static self-test, a pin check, the replay check, or the reading command fails.
- Stop before the re-judge if the paid self-test reports a grade mismatch, a missing cost, or a call over its $0.50 cap.
- Stop if an arm-B artifact records a pack version other than `p9`.
- After each invocation, read every call cost. Stop if any single call costs more than $0.60.
- Stop a file when its cap is reached. Stop if a stage records more than two `error` verdicts.
- Run all 5 invocations even if one row improves.
- Do not rerun a row to get a different grade. A variance claim needs a reviewed amendment first.

## How the result reads

Compare the arm-B panel score with the arm-A panel score for each row (order: correct > partial > wrong).
Read every individual rationale of every new p9 vote. No identical-input noise floor exists for panel 3 under `v2.11`.

- **Stage 1 (support and behavior):** each changed Stage 1 row must show its entity-list records (the replay shows 8 of 8 and 3 of 3).
  No new vote may call a shown record or span fabricated or absent. A held `wrong` grade for another reason is reported as held.
- **Stage 2 (no regression), the R6 rule, unchanged:**

  > Review every lower arm-B panel score against the complete saved transcript and both packs.
  > A lower score blocks acceptance when p9 loses relevant support, changes meaning, removes a necessary qualifier, or misattributes a source.
  > A newly visible contradiction counts as an evidence correction only when the complete saved source directly contradicts the candidate claim.
  > Confirm the entity, field, date, scope, and source identity.
  > Check the complete transcript for relevant qualifications and competing support.
  > Record the candidate claim, exact source text, both pack locations, and each relevant vote.
  > An independently confirmed evidence correction does not block acceptance because its grade is lower.
  > An unresolved cause blocks acceptance.
  > Changes with no identified pack cause retain the predeclared variance classification, without a statistical variance claim.
  > Keep every selected row and all individual votes in the result.
  > Apply the unchanged Stage 1 support rule and Stage 3 false-upgrade rule.

  "p8" in the R6 text reads as "p9" here. The R6 scope sentence is left out, because this plan declares its own measurement.
  No other word changes.
- **The R8-1 row (`q-defi-arbitrage-pathpayment-bots`), predeclared:** p9 shows all nine listed records.
  That evidence supports the narrow reading ("only Comet is inactive") and contradicts the broad reading.
  p9 does not decide which reading the candidate meant. So:
  - A lower score that rests on the broad reading is an evidence correction only if the reader also resolves the sentence scope.
    R8 found that scope unresolved. If the votes do not resolve it, the cause stays unresolved, and the row blocks.
  - A vote that names Comet's `Inactive` record and takes the narrow reading reads the evidence correctly.
  - A `wrong` grade that rests on must-avoid item 4 ("unsupported memory") is a rubric question (R8-2), not a pack effect.
    Report it with the row. It does not count as evidence that p9 changed meaning.
  - Record, for each vote, which listed records it names. The reading command lists them.
- **Stage 3 (no false upgrade):** no p9 row is in Stage 3, so the p8 Stage 3 reading stands (0 up).
- **Notices and entry numbers:** report any rationale that cites `claimSupportNotice` or reads an entry number as a source identity.

Report per row: both panels and votes, which verdicts are reused, costs, pack and prompt SHA-256 values,
the support checks, the entity-list records named, and the rationale for every changed score.
Report the self-test result, the spend for each invocation, and the total.

An honest prior: the R8-1 row can still block under this rule. The new evidence makes the narrow reading visible.
It cannot make the judges resolve a sentence that R8 found ambiguous.

## Independent reviews

Both reviews are mandatory. The author and the orchestrator are Claude Opus, so neither may review.

- Pre-spend review of the p9 code, the replay, this plan, and the reading command: Codex frontier at high effort.
  Fallback: Grok at high, then Claude Fable at high in a fresh session.
- Post-run review: the same tier order. The orchestrator reconciles every finding before the result is recorded or p9 is merged.
