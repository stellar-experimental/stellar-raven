# Pre-spend measurement brief: pack p8 versus the p6 baseline

Date: 2026-10-10. Status: not run. This brief authorizes nothing by itself.
The owner approves the spend. This brief follows the "Minimal re-measurement" section of the
[post-run review](../pack-p7/post-run-review/rr3-review.md).

The pre-spend review (R4, Claude Fable 5.1) approved the code and the plan with fixes. This
revision applies them. The reviewed p8 code is now commit
`36e77d4067e1a0d0c5156c0eaf1ee2904200b21b`. A bounded delta re-review of this revision and of
commit `36e77d40` must pass before the first paid call. Pins, commits, the launcher, and the run
log are in [ledger.md](ledger.md).

## Question

Does pack `p8` keep real source-span support for the disputed claims, without a grade regression
on stored-correct rows and without a false upgrade on stored-wrong rows?

## Offline evidence (free, done)

[replay-p8.mjs](replay-p8.mjs) wrote [replay-p8.json](replay-p8.json) at commit `36e77d40`.
Support counts only source text (`packSourceEvidenceText`). Labels, notices, entry and `alsoIn`
numbers, paths and array indexes, and the truncation footer never count. The replay applies that
one filter to p6, p7, and p8, so all three columns changed from the first version of this table.

| Check | p6 | p7 | p8 |
|---|---|---|---|
| Omission rows: supported disputed claims held (of 12) | 2 | 11 | 12 |
| Control inventory (207 rows): answer probes missing | 407 | 220 | 208 |
| Control inventory: rows with 2 or fewer source items | 131 | 136 | 122 |
| Stable rows: judge prompt identical to p6 (of 131) | — | 131 | 131 |

- p8 shows the three required sentences as real spans with their source records:
  the Stablebonds maturity sentence ("mature in 90 days or less", record "Etherfuse Aims to Bring
  100 Sovereign Currencies Onchain"); the dormant-account INRIA paragraph ("1,193 logical qubits",
  entry 4, record "Introducing the Quantum Preparedness Plan"); and quantum support for the
  answer's "immediately" next to the differing "expected to be able to move ... in 2026" wording.
- The quantum support span is the primary QPP sentence "Enterprise wallets can shift to
  quantum-safe contract accounts immediately." It is not the Decrypt sentence that p6 showed.
- 20 of 207 control rows miss more answer probes under p8 than under p6.
- The 32 measured rows: all 32 arm-A prompts and all 32 arm-B prompts reproduce their recorded
  SHA-256. All 32 p8 prompts differ from the p7 prompts, and only in the evidence block.

Offline support does not prove a better grade. Only a judge run can show the grade effect.

## Design

| Arm | Code | Pack | Rubric | Model | Panel | Calls |
|---|---|---|---|---|---|---|
| A (baseline) | reused verdicts from `d15a4ce5` | `p6` | `v2.11` | `claude-sonnet-5` | 3 | 0 (reused) |
| B (candidate) | detached worktree at `36e77d40` | `p8` | `v2.11` | `claude-sonnet-5` | 3 | 96 |

Arm A reuses the 32 arm-A verdicts from the p7 run, listed in
[../pack-p7/rejudge-artifacts.json](../pack-p7/rejudge-artifacts.json). Reuse is valid only when
all of these hold, and the operator records each check in the ledger before spend:

- The full p6 judge prompt of each row is byte-identical. The replay reproduces all 32.
- The model, rubric, and panel contract are the same: `claude-sonnet-5`, `v2.11`, panel 3.
- The executable and environment pins are the same: binary
  `c9b5341637becbd423ddffc5b254afb645682a3868cb708bbc6cc0e7bb419937` (version `2.1.296`) and
  environment `ff926b437c1538395659ddf31b24d6268f61097ad4527eaf55738d0ccbe446ac`.
- A changed executable or environment stops the method. It needs a reviewed amendment and a
  matched arm-A rerun.
- The old stored `v2.10` verdicts are never the baseline.

Arm B reruns panel 3 for every row whose full judge prompt changed from the p7 arm-B prompt.
All 32 changed, so arm B reruns all 32 rows (96 calls). No arm-B verdict is reused.
The result keeps all 32 rows and states that arm A is reused and arm B is new.

The run-evals skill requires the seven-call paid judge self-test when the evidence pack changes.
It runs first, from the arm-B worktree.

## Row selection

The same 32 rows as the p7 run, with the same source files, IDs, and case modes.
See [../pack-p7/measurement-plan.md](../pack-p7/measurement-plan.md) and
[../pack-p7/ledger.md](../pack-p7/ledger.md) for the tables.

- Stage 1: 6 stored-p6 omission rows (S1a, S1b, S1c).
- Stage 2: 20 stored-correct controls (S2a to S2e).
- Stage 3: 6 stored-wrong no-false-upgrade controls (S3a to S3d).
- S1a, S2b, S3a, and S3b use `--cases-ref worktree`. The cases SHA-256 is
  `55831c3cd80f93316a5ca1dff2c8e5dc9e717ede1b70d4050d9742ebe162196f` for S1a, S2b, and S3b, and
  `7a3401a19f524e0a4f0d8f619c85aecf469cc5404da1d5b2fb7532fc33490017` for S3a.

## Calls and caps

The p7 run's 192 calls cost a mean of $0.0947 and a maximum of $0.1810.
The stored p6 calls cost a mean of $0.1315 and a p90 of $0.2698. Caps use the stored p90.

| Item | Calls | Expected at $0.0947 | Cap |
|---|---|---|---|
| Paid judge self-test | 7 | $0.66 | $3.50 ($0.50 per call, enforced by the wrapper) |
| Stage 1 re-judge (arm B) | 18 | $1.70 | $0.85 + $2.45 + $1.65 = $4.95 |
| Stage 2 re-judge (arm B) | 60 | $5.68 | $10.55 + $2.45 + $1.65 + $0.85 + $0.85 = $16.35 |
| Stage 3 re-judge (arm B) | 18 | $1.70 | $0.85 + $0.85 + $0.85 + $2.45 = $5.00 |
| Total | 103 | $9.75 | **$29.80** |

Each file cap is `rows × 3 × $0.27`, rounded up to the next $0.05. `re-judge.mjs` enforces only
the total it receives. A budget-stopped file is a defined outcome; a continuation needs its own
bounded authorization. Do not raise a cap during the run.

## Pins before spend

Use the committed launcher in [launcher/](launcher/). [ledger.md](ledger.md) records the exact
frozen values: `PATH` is `/private/tmp/claude-501/w1010/r-pin/bin:/usr/bin:/bin:/usr/sbin:/sbin`,
`TMPDIR` is `/var/folders/j9/g5kf8n6j6js86_zvj2lcr8kh0000gn/T/`, and `HOME`, `USER`, `LOGNAME`,
`SHELL`, and `DISABLE_AUTOUPDATER=1` are fixed under `env -i`. `node` is called directly.
`launcher/run-inv-p8.sh` points arm B at `/Users/kalepail/Desktop/raven-p8-arm` and refuses any HEAD
other than `36e77d4067e1a0d0c5156c0eaf1ee2904200b21b`. Do not use the p7 launcher under
`/private/tmp/claude-501/w1010/r-pin/`; it points arm B at `raven-p7-arm`.
Recompute both hashes through `launcher/run-node.sh` before the first paid call. They must equal
the arm-A pins above. Record the result in the ledger.

## Commands

Preflight, free. Run the launcher from this worktree (`raven-w1010-r`):

```sh
git worktree add --detach ../raven-p8-arm 36e77d4067e1a0d0c5156c0eaf1ee2904200b21b
# For each invocation in launcher/invocations.tsv (the launcher adds --cases-ref worktree where needed):
.agents/rounds/2026-10-10-weekend/pack-p8/launcher/run-inv-p8.sh <invocation> dry
# In ../raven-p8-arm:
node eval/qa/judge.mjs --self-test-static
# In raven-w1010-r, where pack-p7/post-run-review/saved-data/ exists:
node .agents/rounds/2026-10-10-weekend/pack-p8/replay-p8.mjs /Users/kalepail/Desktop/stellar-raven-codemode/eval/qa/results
node .agents/rounds/2026-10-10-weekend/pack-p8/analyze-rejudge-p8.mjs
```

Every dry run must exit 0 with `goldenTime.violations` empty, and the revision-mode case guard must
match. A dry run does not check the pins; the paid run checks them before its first call.

The replay runs in `raven-w1010-r`, not in the arm-B worktree. Its parts B and E read
`pack-p7/post-run-review/saved-data/`, an ignored folder that exists only here; a fresh worktree has
none of it. `git diff 36e77d40 HEAD -- eval/qa/evidence-pack.mjs` must be empty in this tree. The
output must equal the committed `replay-p8.json` apart from `revisions.p8`, and
`revisions.p8PackModuleClean` must be `true`. The reading script must report 32 arm-A rows, every
arm-A pack rebuilt to its recorded hash, and no arm-B rows.

Paid, only after owner approval and the bounded delta re-review:

```sh
# 1. The seven-call judge self-test. Run it with ../raven-p8-arm as the current directory.
/Users/kalepail/Desktop/raven-w1010-r/.agents/rounds/2026-10-10-weekend/pack-p8/launcher/run-node.sh \
  eval/qa/run-p6-judge-self-test.mjs \
  --runner-revision 36e77d4067e1a0d0c5156c0eaf1ee2904200b21b \
  --claude-path /private/tmp/claude-501/w1010/r-pin/bin/claude \
  --expect-claude-binary-sha256 c9b5341637becbd423ddffc5b254afb645682a3868cb708bbc6cc0e7bb419937 \
  --expect-claude-environment-sha256 ff926b437c1538395659ddf31b24d6268f61097ad4527eaf55738d0ccbe446ac \
  --out eval/qa/results/<stamp>-p8-selftest.json
# 2. The arm-B re-judge from raven-w1010-r, one invocation per source file, in stage order (S1a ... S3d).
.agents/rounds/2026-10-10-weekend/pack-p8/launcher/run-inv-p8.sh <invocation> paid
# 3. After each invocation: add its path and SHA-256 to rejudge-artifacts.json, then read it.
node .agents/rounds/2026-10-10-weekend/pack-p8/analyze-rejudge-p8.mjs > .agents/rounds/2026-10-10-weekend/pack-p8/rejudge-summary-p8.json
```

## Predeclared reading

[rejudge-artifacts.json](rejudge-artifacts.json) is predeclared. It holds the 12 reused arm-A
invocations with their SHA-256 values, copied from the p7 manifest. The operator adds the 12 arm-B
entries as they finish. [analyze-rejudge-p8.mjs](analyze-rejudge-p8.mjs) is the predeclared reading
command; it is fixed before any grade is known. For each row it reports both panels, votes, costs,
reuse, pack hashes, each vote's recorded `evidenceSupportCheck`, and a support check recomputed
with the current span-only diagnostic on rebuilt packs. The recorded arm-A checks used the older
diagnostic, which counted labels and counters; read the recomputed check for both arms. The script
flags every row that the stage rules below require a reader to check.

## Stop rules

- Stop before spend if a dry run, the static self-test, a pin check, or the replay check fails.
- Stop before the re-judge if the paid self-test reports a grade mismatch, a missing cost, or a
  call over its $0.50 cap.
- Stop if an arm-B artifact records a pack version other than `p8`.
- `re-judge.mjs` has no per-call cap. After each invocation, the operator reads every call cost.
  Stop if any single call costs more than $0.60.
- Stop a file when its cap is reached. Stop if a stage records more than two `error` verdicts.
- Run all three stages even if Stage 1 or the quantum row improves. Do not stop after one row.
- Do not rerun a row to get a different grade. If a decision depends on a variance claim,
  predeclare a small repeated comparison for that row in a reviewed amendment first.

## How the result reads

Compare the arm-B panel score with the reused arm-A panel score for each row
(order: correct > partial > wrong). Read every individual rationale in both arms.
No identical-input noise floor exists for panel 3 under `v2.11`, so the rationale rules below are
the predeclared attribution. A change without a pack cause is judge variance, not a pack effect.

- Stage 1 (support and behavior): for each disputed claim in the replay, the p8 pack must show the
  support as a real span (the replay shows 12 of 12). Arm B must not call that text fabricated or
  absent from evidence. Review the Stablebonds and dormant-account rows explicitly: the
  maturity sentence and the INRIA paragraph must appear as spans with their source records.
  A row can stay `wrong` for another reason; report it as a held grade with real support.
- Stage 2 (no regression): no row scores lower in arm B. A lower score is a pack regression when
  its rationale cites p8 pack content, such as a span read as a contradiction or a lost source
  item. Any pack regression blocks the p8 result. The quantum row
  (`q-hist-quantum-preparedness-plan`, `2026-10-07T23-25-14`) is one row; its improvement alone
  does not pass the stage.
- Stage 3 (no false upgrade): no row scores higher in arm B. An upgrade whose rationale relies on
  a pack notice, a label, or an entry number instead of a span is a pack regression.
- Entry numbers: any rationale that reads a transcript entry number as a source identity is
  reported, with the row and the claim.

Report per row: both panel scores and votes, which verdicts are reused, costs, pack SHA-256 values,
`evidenceSupportCheck`, and the rationale for every changed score. Report the self-test result,
the stage spend, and the total.

## Independent review after the run

The post-run review is mandatory. Reviewer: Codex frontier (`gpt-6-astra`) at high effort; it
reviewed p7, so it can check that the p7 findings are closed. Fallback: Grok (`grok-4.7`) at high,
then Claude Opus at high in a fresh session. The orchestrator reconciles every finding before the
result is recorded or p8 is merged.
