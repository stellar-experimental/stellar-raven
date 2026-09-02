# Closure review — terminal `prompt-write` EPIPE repair

Date: 2026-09-02
Reviewer CLI: Claude Code
Model: Opus 5
Effort: high
Author: Codex Sol (high)
Worktree: `/private/tmp/stellar-raven-agent-queue-integration`
Branch: `codex/agent-queue-2026-09-02` at `8088467`
Prior reports: `ci-test-diagnosis-opus.md`, `ci-epipe-review-opus.md`
Reviewer edits: none. This report is the only file written.
Network, provider, and paid eval calls: none.

## Verdict

**FAIL.** F1 and F2 are both closed. One new actionable finding exists, plus one documentation gap.

The revised design is better than the repair it replaces and better than the minimal fix this
reviewer proposed. Treating a status-zero EPIPE as a terminal `prompt-write` failure removes the
provenance problem at its root: no verdict from an incompletely written prompt is trusted, the
bounded CLI evidence and the reported cost are kept, and the class is non-retryable, so the CI
duplicate cannot return.

What the change does not do is teach the measurement instrument about the new class. A
`prompt-write` judge failure is counted as a completed judging attempt, yields no valid grade, and
lands in **no** five-track failure bucket. The row becomes unattributable.

## F1 — closed

Original finding: an accepted status-zero EPIPE left no trace, while `promptSha256` still asserted
the full prompt and the ledger still paid for the call.

The revised `eval/qa/judge.mjs:587-601` no longer accepts anything. It restores the original
`if (res.error || res.status !== 0)` guard and adds a class ahead of the existing ladder:

```js
const promptWriteFailed = res.status === 0 && res.error?.code === "EPIPE";
const cliFailure = { ...buildCliFailure(res, stdoutEnvelope), ...(promptWriteFailed ? { kind: "prompt-write" } : {}) };
const failureClass = promptWriteFailed ? "prompt-write" : cliFailure.kind === "timeout" ? "timeout" : …
```

Verified first-hand through the public helper:

```text
failureClass: prompt-write | kind: prompt-write | exitStatus: 0 | costUsd: 0.125
message has EPIPE: true
stdout excerpt bytes: 166 | retryable: false
score: error | coreAnswer: null
```

Every element F1 asked for is present, and the design goes further than the marker this reviewer
suggested: the verdict is not used at all, so no graded result of unknown provenance can reach an
artifact. `isRetryableJudgeError` (`eval/qa/judge.mjs:98-100`) still admits only `cli` and `parse`,
so the class is terminal by construction rather than by a new branch.

## F2 — closed

Original finding: the tests exercising the repair did not pin that a real EPIPE occurred, and the
4 MiB constant was undocumented.

Both halves are fixed.

- `test/helpers/fake-judge-cli.mjs:84-87` now carries the rationale: "This 4 MiB input exceeds the
  64 KiB Linux pipe buffer. The child exits first, so spawnSync must report EPIPE while writing the
  prompt."
- `test/qa-judge-evidence.test.mjs:25-63` and `:65-82` assert `kind: "prompt-write"`,
  `exitStatus: 0`, `message: expect.stringContaining("EPIPE")`, and
  `expect(isRetryableJudgeError(verdict)).toBe(false)`. None of those can hold unless a real
  status-zero EPIPE occurred, so the precondition is now load-bearing rather than incidental.

The reviewer re-measured the precondition against the real `spawnSync` call `judgeCase` makes:

```text
prompt bytes (4 MiB candidateAnswer): 4199564
valid envelope, exit 0 : status=0 error=EPIPE
invalid output, exit 0 : status=0 error=EPIPE
valid envelope, exit 1 : status=1 error=EPIPE
small default prompt   : status=0 error=null
```

A 4.2 MB write against a 64 KiB pipe forces the failure; it is not raced.

## Behavior checks requested

| Area | Result |
| --- | --- |
| Status-zero EPIPE, valid envelope | terminal `prompt-write`; verdict not used; `coreAnswer: null` |
| Status-zero EPIPE, invalid output | also terminal `prompt-write` (not `parse`), which is correct — the prompt, not the output, is the fault |
| Nonzero EPIPE | unchanged `cli` with `cliFailure.kind: "spawn-error"`, `exitStatus: 1` |
| Timeout | unchanged; `res.status` is null so `promptWriteFailed` cannot apply |
| Signal termination | unchanged; status null |
| Missing CLI and other spawn errors | unchanged; status null and the code is not `EPIPE` |
| Provider safeguard | unchanged for every reachable case; see the observation below |
| Consistency errors | unchanged and still terminal |
| Retry counts | `test/qa-budget.test.mjs:145-152` extends the one-retry table with `["prompt-write", 1]`; the suite asserts one call and one attempt |
| Budget behavior | the same table asserts `budgets` equals `[1]` for a single call, so no second authorization is issued; the reported `costUsd: 0.125` is preserved and recorded |
| Evidence bounds | `stdout.excerpt` and `parsedEnvelope.excerpt` are asserted at 8,192 bytes or fewer with `truncated: true` on a 20,000-byte diagnostic |
| Retryability contract | `test/qa-verdict-consistency.test.mjs:288-292` adds `["prompt-write", … , false]` to the retryability table |
| Harness stdin drain | `test/qa-harness-preconditions.test.mjs:509` adds `cat >/dev/null`; the exact `toEqual(["paid"])` contracts at `:739` and `:807` survive with added messages, plus the two diagnostic assertions at `:810-812` |

### Gates

| Gate | Command | Ledger claim | Reviewer result |
| --- | --- | --- | --- |
| Focused | four-file judge, budget, consistency, preconditions run | 4 files, 278 tests | pass — 4 files, 278 tests |
| Full suite | `npm test` | — | pass — 100 files, 1697 tests |
| Typecheck | `npm run typecheck` | — | pass |
| Diff check | `git diff --check` | — | pass |
| Provider or paid calls | none | 0 | 0 |

## New finding

### N1 — MEDIUM — `prompt-write` is invisible to the five-track failure accounting

File: `eval/qa/five-track.mjs:229-237`, published at `eval/qa/five-track.mjs:317-319`

`buildFiveTrackSummary` attributes judge failures through a **closed** enumeration:

```js
const cliOrParseFailureIds = … ["cli", "parse"].includes(judgeFailureClass(attempt)) …
const judgeTimeoutIds      = … judgeFailureClass(attempt) === "timeout" …
const judgeSafeguardIds    = … judgeFailureClass(attempt) === "provider-safeguard" …
```

Those three sets, plus `consistencyContradictions`, are the only judge-failure buckets T4 and T5
publish. There is no catch-all. Before this change the enumeration was complete: `judgeCase`
produced exactly `cli`, `parse`, `provider-safeguard`, `timeout`, and `consistency`. This change
adds a sixth class and leaves the enumeration at five.

Measured first-hand with one `prompt-write` row through the real `buildFiveTrackSummary`:

```text
t4.cliOrParseFailures      : {"count":0,"denominator":1,"ids":[]}
t4.judgeTimeouts           : {"count":0,"denominator":1,"ids":[]}
t4.judgeProviderSafeguards : {"count":0,"denominator":1,"ids":[]}
t4.judging.attempted       : {"count":1,"denominator":1,"ids":["q-pw"]}
t1.validGradesOverAnswered : {"count":0,"denominator":1,"ids":[]}
any bucket names prompt-write: false
```

The row reads as **judged** in T4, contributes **no** valid grade in T1, and no bucket anywhere
says why. The whole summary never contains the string `prompt-write`.

That is the exact failure mode `eval/lib/harness-guards.mjs` names in its header as the second
reason the guards exist: a lane that loses rows still prints a clean percentage while the
denominator shrinks silently. A production status-zero EPIPE on the judge is precisely the case
this repair was written for, so the gap is reachable, not theoretical.

**Minimal repair.** Mirror the existing timeout bucket. In `eval/qa/five-track.mjs`, beside
line 232:

```js
const judgePromptWriteIds = unique(allJudgeCalls
  .filter(({ attempt }) => judgeFailureClass(attempt) === "prompt-write")
  .map(({ id }) => id));
```

and one line in the `t4` object beside `judgeTimeouts`:

```js
judgePromptWriteFailures: coverage(judgePromptWriteIds, selectedAnsweredIds),
```

Add one assertion in `test/qa-five-track.test.mjs` in the style of `:148`. No test pins the exact
T4 key set — every assertion there is per key — so the addition is safe.

One decision belongs to the owner rather than to this repair: `QA_TRACK_SCHEMA` is
`"qa-five-track-v1"` (`eval/qa/five-track.mjs:3`). Adding a T4 key is additive, but if the repo
treats the track schema the way it treats the pack version, the addition may warrant a bump.
State the decision either way in the ledger.

### N2 — LOW — The README's terminal judge-class enumeration omits `prompt-write`

File: `eval/qa/README.md:240-243`

```text
Judge errors carry `failureClass`. Only `cli` and `parse` can receive one total retry. The limit
applies across inline judging and all `--judge-stored` resumes. `provider-safeguard`, `timeout`,
and `consistency` are terminal.
```

The retry rule is still correct, because `prompt-write` is neither `cli` nor `parse`. The
enumeration of terminal classes is now incomplete, and this is the canonical description of judge
retry policy. `eval/qa/README.md` is not in the diff. The code comment at
`eval/qa/judge.mjs:92-96` was updated; the README was not.

**Minimal repair.** Add `prompt-write` to the terminal list and one clause naming what it means:
a status-zero EPIPE means the child exited before the harness finished writing the prompt, so its
output is not a grade of that prompt.

## Observations, not findings

- `promptWriteFailed` is evaluated before the timeout and safeguard branches. A timeout cannot
  collide, because it arrives with `status === null`. A provider safeguard emitted with status 0
  **and** an EPIPE would be labelled `prompt-write` instead of `provider-safeguard`. Both are
  terminal, so retry and budget behavior are identical, and the safeguard evidence still reaches
  `cliFailure`. Only the T5 `providerSafeguards` bucket would miss it — which the N1 repair also
  makes visible, since the row would then appear under the new bucket instead of nowhere.
- Overriding `cliFailure.kind` replaces the `spawn-error` label, but the EPIPE evidence survives in
  `cliFailure.message`, which the tests pin. Nothing else in `eval/` reads `cliFailure.kind` except
  the timeout branch in the same expression.
- A nonzero EPIPE stays retryable as `cli`. A real CLI that exits nonzero because it could not read
  its prompt will therefore be retried once and will probably fail the same way. That behavior
  predates this round and is out of its scope.
- The ledger at `.agents/rounds/2026-09-02-agent-queue-closeout.md:83-118` describes the design,
  both Opus reports, the F1 and F2 reconciliation, and the 278-test focused figure accurately, and
  its status line is honest: "Opus F1 and F2 reconciled; closure review pending". Its Ledger and
  Outcome sections record the pending closure. Adding this report and N1/N2 is the integrator's
  merge step.

## Summary

| Severity | Count | Findings |
| --- | --- | --- |
| HIGH | 0 | — |
| MEDIUM | 1 | N1 |
| LOW | 1 | N2 |

F1 and F2 are closed, and the terminal `prompt-write` design is the right answer to both. The
repair is not finished until the new class is attributable: add the T4 bucket so a
`prompt-write` row states its own reason instead of vanishing from the failure accounting, name the
class in the README, and this passes.
