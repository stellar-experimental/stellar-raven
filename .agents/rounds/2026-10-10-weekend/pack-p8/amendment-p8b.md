# Amendment p8b: prospective Stage 2 rule and a fixed three-call continuation

Date: 2026-10-10. Status: approved 2026-10-10 by the orchestrator under the owner's delegation.
Run 2026-10-10 (one invocation, $0.38): NOT ACCEPTED after review R8; see the run log and [results-p8b.md](results-p8b.md).
The R7 delta re-review returned `PRE-SPEND: LAUNCH-OK`. The approval covers only the single P8B invocation.
Before any paid call, this amendment needs a favorable independent pre-spend review and the owner's
approval, both recorded in the run log. The first pre-spend review (R7,
[pre-spend-review-p8b/rr7-review.md](pre-spend-review-p8b/rr7-review.md)) returned
`PRE-SPEND: BLOCK` on R7-1 (no continuation reading command) and R7-2 (no error-vote rule). This
revision applies both and the minor items. A bounded delta re-review of this revision is required.

The p8 run stays BLOCKED under its predeclared rule ([results.md](results.md)). This amendment does
not change that result. It applies only to the separately declared continuation below. It follows
the "Disposition and prospective amendment" section of the post-run review
[post-run-review/rr6-review.md](post-run-review/rr6-review.md) (R6).

## Why

In `q-defi-arbitrage-pathpayment-bots`, all three arm-B votes cite a p8 source item: StellarTerm
with `status="Live"`. The answer says StellarTerm is "marked Inactive". The predeclared Stage 2 rule
counts any lower score that cites a p8 span as a contradiction as a regression. It has no exception
for an accurate contradiction. R6 confirms that the evidence is accurate and that the block is
correct under that rule. A future measurement needs a rule that assesses evidence fidelity, not one
that requires every older grade to survive.

## Amended Stage 2 rule (exact text, from R6)

> Review every lower arm-B panel score against the complete saved transcript and both packs.
> A lower score blocks acceptance when p8 loses relevant support, changes meaning, removes a necessary qualifier, or misattributes a source.
> A newly visible contradiction counts as an evidence correction only when the complete saved source directly contradicts the candidate claim.
> Confirm the entity, field, date, scope, and source identity.
> Check the complete transcript for relevant qualifications and competing support.
> Record the candidate claim, exact source text, both pack locations, and each relevant vote.
> An independently confirmed evidence correction does not block acceptance because its grade is lower.
> An unresolved cause blocks acceptance.
> Changes with no identified pack cause retain the predeclared variance classification, without a statistical variance claim.
> Keep every selected row and all individual votes in the result.
> Apply the unchanged Stage 1 support rule and Stage 3 false-upgrade rule.
> This amendment applies only to its separately declared future measurement.

## Fixed continuation

| Item | Value |
|---|---|
| Row | `q-defi-arbitrage-pathpayment-bots` only |
| Source file | `/Users/kalepail/Desktop/stellar-raven-codemode/eval/qa/results/2026-10-07-tool-surface-qa/2026-10-08T02-40-37-variantA.json` |
| Arm | B (pack `p8`), one invocation (`P8B` in [launcher/invocations.tsv](launcher/invocations.tsv)) |
| Calls | exactly 3 (panel 3), no retry |
| File cap | $0.85 (`--max-budget-usd 0.85`) |
| Self-test | none (see "No self-test" below) |
| Worktree and code | `/Users/kalepail/Desktop/raven-p8-arm`, detached at `36e77d4067e1a0d0c5156c0eaf1ee2904200b21b` (the p8 run's arm-B code) |
| Model, rubric, panel | `claude-sonnet-5`, `v2.11`, 3 |
| Cases | revision mode (default `--cases-ref`); the dry run shows `cases.matches: true` |
| Expected cost | about $0.36 (the p8 run spent $0.3564 on this row) |

The continuation is one newly measured row. The other 31 rows of the p8 run are reused evidence
under their unchanged rules. The result must say so. It must not describe all 32 rows as a new
experiment, and it is not a general accuracy estimate.

### Reused evidence

- Arm-A baseline for this row: the p6 panel (C/C/P) in
  `/Users/kalepail/Desktop/raven-p6-arm/eval/qa/results/2026-10-10T16-19-20-rejudge.json`.
  Pack `p6`, SHA-256 `76eec18f8cecd31e1fa7cdd3c68a6f3d85dfe1c42e0cce76a2a09903a3f6ebe8`; full prompt
  SHA-256 `ee8a879f38f60476aa96d7be0e0dc946a45cd448c43185c127c78a9d85955d9e`.
- Reuse is valid only after these checks pass and are recorded in the run log below: the full p6
  prompt reproduces that hash; the model, rubric, and panel are the same; the executable
  (`c9b5341637becbd423ddffc5b254afb645682a3868cb708bbc6cc0e7bb419937`) and environment
  (`ff926b437c1538395659ddf31b24d6268f61097ad4527eaf55738d0ccbe446ac`) pins reproduce. A changed pin
  stops the continuation; it needs a reviewed method amendment and a matched baseline.
- The other 31 rows: their arm-A and arm-B panels from the p8 run, listed in
  [rejudge-artifacts.json](rejudge-artifacts.json), unchanged.
- Historical panels for this row, retained and never replaced or hidden: p7 arm B (C/C/C, pack `p7`)
  and p8 arm B (W/P/P, pack `p8`,
  `/Users/kalepail/Desktop/raven-p8-arm/eval/qa/results/2026-10-10T18-33-13-rejudge.json`).

### No self-test

The run-evals skill requires the seven-call self-test when the evidence pack or judging semantics
change. Neither changes for this continuation:

- The pack is unchanged. The continuation runs the same arm-B code (`36e77d40`) as the p8 run. The
  only later code change (`e7ca3fb0`, R5-1) is in `packSourceEvidenceText`, a diagnostic that never
  builds judge input. [verify-r5-1.mjs](verify-r5-1.mjs) rebuilds all 32 p8 packs and all 64 full
  prompts of the p8 run with the current code; [r5-1-check.json](r5-1-check.json) shows 64 of 64
  packs and 64 of 64 prompts byte-identical to the recorded hashes.
- The prompt is unchanged: this row's p8 pack SHA-256
  `ac9c47b6be31afb685b94112c6c205fd7387580ea5ae935a72b5681e02caa1d0` and full prompt SHA-256
  `3cc7187326b5487ae31fb433efcbe87f5eea060e992852eca54c68d4c3b1887e` reproduce.
- The rubric is unchanged (`v2.11`), and so is the judge adapter: `git diff 36e77d40 HEAD` is
  empty for `eval/qa/judge.mjs`, `eval/qa/re-judge.mjs`, `eval/qa/run-p6-judge-self-test.mjs`,
  `eval/qa/evidence-sanitizer.mjs`, `eval/qa/verdict-consistency.mjs`, and `eval/lib/`.
- The p8 self-test on 2026-10-10 passed 7 of 7 with this code and these pins.

The recorded `evidenceSupportCheck` in the new artifact uses the pre-R5-1 diagnostic of `36e77d40`.
The continuation reading command below recomputes it with the current diagnostic.

## Continuation reading command (R7-1)

`analyze-rejudge-p8.mjs` reads only the 32 historical pairs, so it cannot read this continuation.
A dedicated command does:

- [p8b-artifacts.json](p8b-artifacts.json) is the continuation manifest. It names the row, the saved
  input, the expected pack and prompt hashes, the pins, the reused p6 baseline (arm A of S2a, with
  its SHA-256), and the historical p7 and p8 arm-B panels of S2a (with their SHA-256). Its
  `continuation` field is `null` until the run. After the single invocation, the operator sets it to
  the new artifact's path and SHA-256. Nobody edits the baseline or historical entries, and
  `rejudge-artifacts.json` (the 32-pair p8 manifest) stays unchanged.
- [analyze-p8b.mjs](analyze-p8b.mjs) is the reading command. It rebuilds the row's p8 pack and full
  prompt from the saved input and stops unless both hashes match. It reports the p6 baseline panel,
  both historical panels separately, and the new panel. It applies the acceptance gate (R7-2 below),
  recomputes the span-only support diagnostic for each new vote, and lists every new rationale, each
  StellarTerm citation, any `claimSupportNotice` citation, and any entry-number mention.

The exact command, from `raven-w1010-r` (where the saved input exists):

```sh
node .agents/rounds/2026-10-10-weekend/pack-p8/analyze-p8b.mjs > .agents/rounds/2026-10-10-weekend/pack-p8/p8b-reading.json
```

Proof before spend, with no paid call:

- Without a continuation, the command reports `status: "not-run"`, the baseline (C/C/P), and both
  historical panels (p7: C/C/C; p8: W/P/P). Both input hashes match.
- `--stand-in historical` reads the historical p8 S2a panel as if it were the continuation:
  [p8b-standin-historical.json](p8b-standin-historical.json) reports `ready-for-reading`, 3 graded
  votes, direction `down`, and a StellarTerm citation in all 3 votes.
- `--stand-in error-vote` turns vote 1 of that stand-in into an error vote in memory:
  [p8b-standin-error-vote.json](p8b-standin-error-vote.json) reports `INCONCLUSIVE` with
  "an error vote has no grade".

## Acceptance gate and error votes (R7-2)

The re-judge runner can complete with an error vote inside a panel (R7's probe:
`error/correct/correct` becomes `correct`, with three costs and no stop). So this amendment fixes
the rule before spend:

- Acceptance needs all of these: exactly 3 judge calls; all 3 graded (zero error votes); 3 reported
  costs; every call's input hash equal to the expected prompt (`3cc71873…`) and answer; pack `p8`
  with SHA-256 `ac9c47b6…`; model, rubric, and panel as declared; a `successful` outcome; a passed
  postflight; a passed identity guard with the declared pins; and no call over the $0.60
  after-invocation checkpoint.
- Any error vote, missing cost, or failed check makes the continuation **INCONCLUSIVE**. It is not
  accepted. There is no retry and no replacement call, and p8 stays BLOCKED.
- Only a continuation that passes this gate goes to the predeclared reading below.
- `analyze-p8b.mjs` applies this gate mechanically and reports each failure.

## Predeclared evidence check for this row (done before spend, from saved data)

- Candidate claim: "… StellarTerm (classic SDEX UI), and Comet marked Inactive."
- Source: execute entry 1 (transcript array index 5), the only StellarTerm record in the saved
  transcript: `{"name":"StellarTerm","slug":"stellarterm","status":"Live", …}`, URL
  `https://stellarlight.xyz/project/stellarterm`, from the Scout directory (`scout.searchProjects`,
  `generatedAt` `2026-10-08T00:04:52.749Z`).
- Entity, field, date, scope, and source identity: the same project (name and slug), the `status`
  field, the same directory snapshot that the answer cites ("generated 2026-10-08").
- Competing support: no other execute result gives StellarTerm a status. No qualification in the
  transcript says that the directory status is stale.
- Pack locations: the p6 pack omits the StellarTerm status record (it shows the URL under
  `canonicalUrls`). The p8 pack shows the record as source item 8:
  `title="StellarTerm" url="https://stellarlight.xyz/project/stellarterm" fields="status="Live", …"`.
- The p8 run's three arm-B votes all cite this item against the answer.

On this saved evidence, the StellarTerm contradiction meets the amended rule's test for an evidence
correction. The paid continuation tests whether a new p8 panel reads it the same way, without a new
fidelity failure.

## Preflight (free, before spend)

1. In `raven-w1010-r`: the tree is clean, and the amendment's pre-spend review and the owner's
   approval are recorded.
2. Through [launcher/run-node.sh](launcher/run-node.sh): the binary and environment hashes equal the
   pins above.
3. `git -C /Users/kalepail/Desktop/raven-p8-arm rev-parse HEAD` is `36e77d4067e1a0d0c5156c0eaf1ee2904200b21b`,
   and that tree is clean.
4. `launcher/run-inv-p8.sh P8B dry` exits 0, selects exactly `q-defi-arbitrage-pathpayment-bots`,
   reports revision mode with `cases.matches: true`, no golden-time violation, and tuple
   `claude-sonnet-5` / `v2.11` / `p8`. (Done on 2026-10-10: all true.)
5. `node eval/qa/judge.mjs --self-test-static` through the launcher in `raven-p8-arm` is GREEN.
6. `node .agents/rounds/2026-10-10-weekend/pack-p8/verify-r5-1.mjs` in `raven-w1010-r` reports 64 of
   64 packs and prompts identical, including this row's arm-A and arm-B hashes above.
7. `node .agents/rounds/2026-10-10-weekend/pack-p8/analyze-p8b.mjs` reports `status: "not-run"`, both
   input hashes matching, the baseline C/C/P, and the historical panels C/C/C (p7) and W/P/P (p8).
   `p8b-artifacts.json` has `continuation: null`.

## After the invocation

1. Set `continuation` in `p8b-artifacts.json` to the new artifact's path and SHA-256. Change nothing
   else in that file.
2. Run the reading command and save its output as `p8b-reading.json`.
3. If its status is `INCONCLUSIVE`, record that result; stop.
4. If its status is `ready-for-reading`, apply the predeclared reading below to every rationale.

## Launch command (one invocation, no retry)

From `/Users/kalepail/Desktop/raven-w1010-r`:

```sh
.agents/rounds/2026-10-10-weekend/pack-p8/launcher/run-inv-p8.sh P8B paid
```

The launcher refuses any arm-B HEAD other than `36e77d40…`, runs the frozen `env -i` shell, and passes
`--ids q-defi-arbitrage-pathpayment-bots --judge-panel 3 --allow-non-identical --max-budget-usd 0.85`
with the pinned `--claude-path` and both pin hashes.

## Stop rules

- Stop before spend if any preflight item fails.
- Run the invocation once. Do not retry it for any reason, including an error vote, a budget stop,
  or a CLI failure. A failed or partial invocation is reported as it is.
- Stop and report if the artifact records a pack other than `p8`, a pack SHA-256 other than
  `ac9c47b6…`, or a prompt SHA-256 other than `3cc71873…`.
- After the invocation, the operator checks every call cost. $0.60 is an after-invocation checkpoint,
  not a per-call cap: `re-judge.mjs` passes the remaining file budget to each call, so one call above
  $0.60 can occur before the checkpoint. A call above $0.60, a missing cost, or a failed identity
  check makes the result INCONCLUSIVE under the gate above.
- The file cap ($0.85) is the only cap that `re-judge.mjs` enforces. The judge adapter can still make
  up to two internal CLI transport retries inside one judge call; the method itself is never repeated.
- Make no other paid call.

## Predeclared reading

Apply this reading only after the acceptance gate passes. Apply the amended Stage 2 rule to the new
panel only. Read every new rationale for missing context, unsupported inference, and source identity.
Keep the p6 baseline's vote-1 rationale in view: it reads the candidate sentence more narrowly. That is
a sentence-interpretation difference, not competing source evidence.

- **Pass:** every vote that lowers the grade rests on the confirmed StellarTerm evidence correction
  (or on another confirmed evidence correction, or on an answer-visible golden contradiction), and no
  vote shows a new fidelity failure. An accurate repeated downgrade can pass. A higher grade is not
  the target.
- **Block:** any vote rests on lost support, a changed meaning, a removed qualifier, a misattributed
  source (including an entry number read as a source identity), or a notice; or any lower vote has
  an unresolved cause. A repeated panel alone cannot erase a demonstrated evidence defect.
- The other three p8 Stage 2 downgrades keep the predeclared variance classification, without a
  statistical variance claim. If acceptance instead depends on measured variance, this three-call
  minimum is insufficient: predeclare repeated matched panels with fixed counts and decision rules,
  in a reviewed amendment, before any spend.
- Stage 1 and Stage 3 keep their unchanged rules and their p8 readings (both passed).

Report: the new panel's votes, cost, pack and prompt hashes, each rationale's reading, the reused
rows, and both historical panels for this row.

## Independent review after the run

The post-run review is mandatory. Reviewer: Codex frontier (`gpt-6-astra`) at high effort.
The reviewer must differ from the author and from the orchestrator. Both are Claude Opus here, so
Claude Opus is not eligible, and a fresh session does not make it eligible. Fallback, in order: Grok
(`grok-4.7`) at high, then Claude Fable (`claude-fable-5-1`) at high. Record the reviewer's tier,
model, and effort, and why an earlier choice was skipped. The orchestrator reconciles every finding
before the result is recorded or p8 is used for judge input.

## Merge note (from R6)

`eval/qa/judge.mjs` builds its pack with `buildTranscriptEvidencePack`, and `PACK_VERSION` is `p8`.
So this branch is not diagnostic-only. Do not merge it unchanged as an offline diagnostic. Merge it as
the active pack only after an accepted prospective result, or first separate the offline diagnostic
from active judge construction.

## Run log

- 2026-10-10, 19:39Z: all 7 preflight items passed. The approval and the R7 delta review
  (`PRE-SPEND: LAUNCH-OK`) are recorded in `pre-spend-review-p8b/`.
- 2026-10-10, 19:39:59Z to 19:42:30Z: one paid invocation, `run-inv-p8.sh P8B paid`, exit 0. There
  was no retry and no other paid call. 3 calls cost $0.3773904 of the $0.85 file cap.
- Artifact: `/Users/kalepail/Desktop/raven-p8-arm/eval/qa/results/2026-10-10T19-39-59-rejudge.json`,
  SHA-256 `26fd63b54533e4f3f1686af88765a5a2ec1682fcc91c175e3f5ee25d2e9b9d30`.
- [p8b-reading.json](p8b-reading.json): `ready-for-reading`, 0 gate failures, votes W/W/P.
- [results-p8b.md](results-p8b.md): the operator reading passed provisionally, before the review.
- Post-run review R8 (Codex frontier `gpt-6-astra`, high;
  [post-run-review-p8b/rr8-review.md](post-run-review-p8b/rr8-review.md)): `POST-RUN: NOT ACCEPTED`.
  R8-1: the candidate sentence scope and the evidence-correction cause are unresolved. R8-2: the
  must-avoid mapping is disputed.
- Result: the continuation is **NOT ACCEPTED**. The original p8 run stays BLOCKED. Every panel and
  vote stays. The next repair is in [results-p8b.md](results-p8b.md).
