# Independent review — CI EPIPE repair

Date: 2026-09-02
Reviewer CLI: Claude Code
Model: Opus 5
Effort: high
Author: Codex Sol (high)
Worktree: `/private/tmp/stellar-raven-agent-queue-integration`
Branch: `codex/agent-queue-2026-09-02` at `8088467`
Prior diagnosis: `.agents/rounds/2026-09-02-agent-queue-closeout/ci-test-diagnosis-opus.md`
Reviewer edits: none. This report is the only file written.
Network, provider, and paid eval calls: none.

## Verdict

**FAIL.** The repair is correct and the classification boundaries all hold, but one actionable
finding remains, plus one reviewability finding.

The mechanism is right, it is narrowly scoped, and every failure class the review was asked to
check behaves correctly. What is missing is evidence: an accepted status-zero EPIPE verdict is
byte-identical to a clean one, so no artifact can ever show that the harness knowingly ignored a
spawn error on a paid call.

## The repair under review

`eval/qa/judge.mjs:587-588`:

```js
const successfulEpipe = res.status === 0 && res.error?.code === "EPIPE";
if ((res.error && !successfulEpipe) || res.status !== 0) {
```

`test/qa-harness-preconditions.test.mjs:509` adds `cat >/dev/null` to the fake `claude` so the
fixture drains the judge prompt, which is the fix this reviewer's diagnosis recommended.
`test/helpers/fake-judge-cli.mjs:77-97` adds two helpers that force a real EPIPE, and
`test/qa-judge-evidence.test.mjs:25-71` adds three cases.

## Verified behavior

The reviewer reproduced each precondition against the real `spawnSync` call that `judgeCase` makes,
using the helper's exact script shape and argument list.

```text
prompt bytes (default helper input): 5285
prompt bytes (4 MB candidateAnswer): 4199564

valid envelope, exit 0, 4 MB prompt : status=0 signal=null error=EPIPE  stdoutLen=166
invalid output,  exit 0, 4 MB prompt : status=0 signal=null error=EPIPE  stdoutLen=20
valid envelope, exit 1, 4 MB prompt : status=1 signal=null error=EPIPE  stdoutLen=166
valid envelope, exit 0, small prompt : status=0 signal=null error=null   stdoutLen=166
```

A 4.2 MB prompt against a 64 KiB pipe guarantees the parent write blocks and the child exits first,
so the EPIPE is forced, not raced. The three new tests are deterministic on both platforms.

| Case | Required behavior | Result |
| --- | --- | --- |
| Status-zero EPIPE, complete valid envelope | accepted, no retry, no duplicate paid call | pass — `score: "correct"`, `costUsd: 0.125`, no `failureClass` |
| Status-zero EPIPE, invalid output | still a failure | pass — `failureClass: "parse"`, rationale names the unparseable verdict |
| Nonzero exit with EPIPE | still a CLI failure | pass — `failureClass: "cli"`, `cliFailure: { kind: "spawn-error", exitStatus: 1 }` |
| Timeout | unchanged | pass — `res.status` is null, so the guard cannot apply; `test/qa-judge-evidence.test.mjs:218` still passes |
| Signal termination | unchanged | pass — status null; `:204` still passes |
| Missing CLI, ENOENT and other spawn errors | unchanged | pass — status null, and the code is not `EPIPE` |
| Provider safeguard | unchanged | pass — `:134` still passes |
| Cost extraction, invalid and stderr-only costs | unchanged | pass — `:341`, `:357`, `:367`, `:377`, `:388` still pass |
| Bounded CLI failure evidence | unchanged | pass — `:73`, `:1661`, `:1753` still pass |

The guard is keyed tightly and correctly. Every other `spawnSync` error arrives with
`status === null`, so `res.status === 0` alone already separates a stdin-write failure from every
other error; adding `code === "EPIPE"` narrows it further. Broadening the guard to
`res.error && res.status === 0` would have been worse, and the author did not do that.

The fixture repair is also correct. `cat` is reachable from the fixture `PATH`
(`${root}:/usr/bin:/bin`, `test/qa-harness-preconditions.test.mjs:515`), `binarySha256` is derived
from the file bytes after the write, and `environmentSha256` is computed from the environment map,
so neither pin needed a manual update.

### Gates

| Gate | Command | Ledger claim | Reviewer result |
| --- | --- | --- | --- |
| Focused | `npx vitest run test/qa-judge-evidence.test.mjs test/qa-harness-preconditions.test.mjs` | 2 files, 201 tests | pass — 2 files, 201 tests |
| Full suite | `npm test` | — | pass — 100 files, 1695 tests |
| Provider or paid calls | none | 0 | 0 |

## Findings

### F1 — MEDIUM — An accepted status-zero EPIPE leaves no trace in the verdict or the artifact

File: `eval/qa/judge.mjs:587-588`

The repair converts a condition the harness previously always surfaced into one it silently
discards. The reviewer compared the accepted-EPIPE verdict against a clean verdict from the same
fake CLI:

```text
ACCEPTED-EPIPE verdict keys: avoidMatches, coreAnswer, costUsd, missingFacts, packVersion,
                             promptSha256, rationale, rubric, score, wrongClaims
CLEAN          verdict keys: (identical)
identical apart from promptSha256: true
any EPIPE marker anywhere      : false
```

Nothing distinguishes the two. That matters for three reasons, in ascending order:

1. `AGENTS.md` sets "failures are reported, not hidden" as a condition of done, and this harness is
   built around surfacing degraded conditions rather than smoothing them.
2. `judgeCase` stamps `promptSha256` from the **full** prompt at `eval/qa/judge.mjs:581`. Under a
   status-zero EPIPE the harness knows the child did not consume the whole prompt, yet the stored
   row asserts that the judge graded exactly those bytes. The assertion is no longer verified.
3. The envelope's `total_cost_usd` is accepted and charged to the spend ledger. A verdict of
   unverified provenance is therefore both recorded and paid for, and a later artifact review has
   no way to find it.

This is not hypothetical for production. The judge prompt carries an evidence pack of up to 12,000
characters plus the rubric, so real prompts run to tens of kilobytes; a CLI that exits before
draining one produces exactly this shape.

**Minimal repair.** Keep the acceptance. Add one non-scoring marker so the artifact can show it,
for example immediately after the guard:

```js
const successfulEpipe = res.status === 0 && res.error?.code === "EPIPE";
```

and then, on the success return path only, carry it through:

```js
...(successfulEpipe ? { spawnWarning: { code: "EPIPE", note: "child exited before the prompt was fully written" } } : {}),
```

`spawnWarning` must not be `failureClass` and must not be read by `isRetryableJudgeError`
(`eval/qa/judge.mjs:98-100`), so scoring, retry policy, panels and cost totals are unchanged. One
assertion in the accept test then pins it, which also closes F2.

### F2 — LOW — The two tests that exercise the repair do not pin the EPIPE precondition

File: `test/qa-judge-evidence.test.mjs:25-48`, `test/helpers/fake-judge-cli.mjs:86`

`accepts a complete judge envelope when an unread prompt causes EPIPE` asserts the outcome
(`score: "correct"`, `costUsd: 0.125`, `not.toHaveProperty("failureClass")`). Every one of those
assertions also holds when no EPIPE occurs at all — it is the ordinary success path. The same is
true of the parse case, whose assertions hold for any unparseable output.

Only `classifies nonzero EPIPE as a CLI spawn failure` (`:50`) pins the precondition, and it does so
indirectly through `cliFailure: { kind: "spawn-error" }`.

The precondition rests on one undocumented constant: `candidateAnswer: "x".repeat(4 * 1024 * 1024)`
at `test/helpers/fake-judge-cli.mjs:86`. The helper's doc comment says "a child that exits without
reading a large prompt" but never says the size must exceed the operating-system pipe buffer, nor
what that buffer is. A future editor who trims that constant to speed the suite up would leave all
three tests green while two of them stopped testing the repair.

**Minimal repair.** Two changes, both small:

- Comment the constant where it is defined, naming the reason: `// Must exceed the OS pipe buffer
  (64 KiB on Linux) so the unread-stdin write is guaranteed to fail with EPIPE.`
- Once F1 lands, add one line to the accept test so it fails if no EPIPE happened:

```js
expect(verdict.spawnWarning, "the accept path must be reached through a real EPIPE")
  .toMatchObject({ code: "EPIPE" });
```

If F1 is declined, pin the precondition instead by having
`judgeWithUnreadStdinFakeOutput` assert the raw `spawnSync` outcome before delegating to
`judgeCase`, or by adding a fourth control that runs the same fake with the small default input and
asserts the clean path.

## Items checked and cleared

- **No duplicate retry.** The stored-judge path now records one call. `judgeRowWithRetry`
  (`eval/qa/run-qa.mjs:934`) retries only on `failureClass` `cli` or `parse`, and the accepted path
  produces neither.
- **Test determinism.** The forced 4.2 MB prompt makes the EPIPE unconditional rather than raced,
  which is the right shape for a CI test. The `cat >/dev/null` fixture change removes the original
  race at its source rather than relaxing an assertion.
- **Assertions were not weakened.** `test/qa-harness-preconditions.test.mjs:739` and `:807` keep
  the exact `toEqual(["paid"])` contract and only add failure messages. `:810-812` adds the two
  diagnostic assertions the diagnosis recommended.
- **Scope.** Five files, all within the repair. No unrelated change, no secret, and
  `git diff --check` is clean.
- **Ledger accuracy.** `.agents/rounds/2026-09-02-agent-queue-closeout.md:83-107` describes the
  mechanism, the fixture change, the guard, and the retained classifications correctly, and its
  201-test focused figure reproduces. Its status line at `:3` is honest: "CI repair verified; CI
  re-run pending".
- **No provider dependency.** The judge tests use a local fake executable on `PATH`; nothing
  reaches a network or a provider.

## Observations, not findings

- Keying on `code === "EPIPE"` is deliberately narrow. If a platform ever reported a partial stdin
  write with a different code the duplicate retry would return, but broadening the guard would
  swallow unrelated spawn errors. The narrow form is the right trade; no change is wanted.
- The three new tests add roughly 12 MB of prompt writes. The focused pair runs in 11.7 s and the
  full suite in about 15 s wall, so the cost is acceptable.
- The real product risk this repair sits next to — a judge grading a truncated prompt — is bounded
  by F1's marker, not removed by it. If the owner wants it removed, the follow-up is to compare the
  written byte count against the prompt length and fail closed when they differ. That is a larger
  behavior change and belongs in its own `.agents/TODO.md` item.

## Summary

| Severity | Count | Findings |
| --- | --- | --- |
| HIGH | 0 | — |
| MEDIUM | 1 | F1 |
| LOW | 1 | F2 |

The guard is correct, narrowly scoped, and fully covered for every failure class the review was
asked to check; the fixture fix removes the original race properly and the exact call-count
contracts survive intact. Add the non-scoring `spawnWarning` marker so an ignored spawn error on a
paid call is visible in the artifact, pin the EPIPE precondition in the accept test, and this
repair passes.
