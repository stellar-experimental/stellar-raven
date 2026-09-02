# CI test diagnosis — duplicate fake judge call on Linux (PR 117)

Date: 2026-09-02
Diagnostician CLI: Claude Code
Model: Opus 5
Effort: high
Worktree: `/private/tmp/stellar-raven-agent-queue-integration`
Branch: `codex/agent-queue-2026-09-02` at `8088467`
Edits: none to code. This report is the only file written.
Paid, provider, and network calls: none.

## Symptom

`npm test` on Linux CI fails in `test/qa-harness-preconditions.test.mjs` because
`fixture.paidCalls()` returns `["paid", "paid"]` where the test asserts `["paid"]`.

- Attempt 1 failed three cases.
- Attempt 2 failed one different case, at `test/qa-harness-preconditions.test.mjs:801`.
- The narrow file passes on macOS.

The two assertion sites are `:736` (the spaced-optional-flag control) and `:801` (`accepts a
matching pin and stamps the judge environment identity`). Both use the same fixture and the same
`--judge-stored` command.

**The attempts disagree about which cases fail. That is the single most diagnostic fact in the
report.** A platform-deterministic parsing or shell difference would fail the same cases every
time. A race would not. Everything below follows from treating this as a race.

## What the fixture actually does

`createEnvironmentPinCliFixture` (`test/qa-harness-preconditions.test.mjs:500-555`) writes a fake
`claude` shell script that appends one `paid` line per invocation, except when `$1` is
`--version`:

```sh
#!/bin/sh
if [ "$1" = "--version" ]; then
  printf '%s\n' 'fixture-claude 1.0.0'
  exit 0
fi
printf '%s\n' paid >> "$QA_FAKE_CALL_LOG"
printf '%s\n' '{"result":"{\"score\":\"correct\", … }","total_cost_usd":0.01}'
```

The script never reads standard input. It prints one JSON envelope and exits.

## Reproduction and instrumentation performed here

The diagnostician rebuilt the fixture standalone in a scratch directory, byte-for-byte, with one
addition: the fake logs its own `argv` to a second file. It then ran the real
`eval/qa/run-qa.mjs --judge-stored` command against the same stored-row fixture.

macOS result:

```text
status: 0
paidCalls: ["paid"]
argv log: ARGV: -p --model claude-sonnet-5 --output-format json --strict-mcp-config --max-budget-usd 1 --safe-mode
```

Two facts are established by this run:

1. Exactly one judge invocation happens per stored row on a healthy path.
2. `executableIdentity` really does call the binary with `--version`
   (`eval/lib/executable-identity.mjs:37`), and the fake's guard exits before the log append. The
   identity probes are therefore **not** a source of extra `paid` lines. They can be excluded.

## Only two code paths can add a second judge call

| Path | Trigger | Applies here? |
| --- | --- | --- |
| `judgeRowWithRetry` (`eval/qa/run-qa.mjs:934`) | `attempts.length === 1 && isRetryableJudgeError(attempts[0].verdict)` | **Yes — the only candidate** |
| `judgeCaseTiered` panel escalation (`eval/qa/judge.mjs:349-395`) | a boundary reason, or an unstable stability register | No |

`isRetryableJudgeError` (`eval/qa/judge.mjs:98-100`) is
`verdict?.score === "error" && ["cli", "parse"].includes(verdict.failureClass)`.

Panel escalation is excluded by inspection. `boundaryEscalationReason` (`eval/qa/judge.mjs:275-284`)
fires only on a `partial` score with at most one missing fact, on exactly one wrong claim, or on a
trap tag with a non-`correct` score. The fake verdict is `score: "correct"` with
`missingFacts: []` and `wrongClaims: []`, and the stored case
(`writeEnvironmentPinFixture`) carries `tags: { category, service, freshness }` with no `trap`.
`selectJudgeTier` therefore returns `judgeTierUsed: "single"`, and the register is `absent` in this
fixture.

**Conclusion: the second `paid` line is a `judgeRowWithRetry` retry. The first judge attempt was
classified as a `cli` or `parse` error on Linux.**

## Root cause

`judgeCase` (`eval/qa/judge.mjs:582-587`):

```js
const res = spawnSync(
  command,
  buildJudgeArgs({ model, safeMode, maxBudgetUsd }),
  { input: prompt, timeout: timeoutMs, maxBuffer }
);
if (res.error || res.status !== 0) { … failureClass: "cli" … }
```

`res.error` alone is enough to produce a `cli` failure. It is checked **before** and independently
of the exit status and of whether stdout is complete and parseable.

The fake never reads its standard input. `spawnSync` still writes the whole prompt into the child's
stdin pipe. When the child exits before that write lands, the parent's write fails with `EPIPE`,
and Node reports it on `res.error` — **while leaving `status` at 0 and `stdout` complete**.

The diagnostician demonstrated exactly that shape locally against a script that never reads stdin:

```text
   4KB  status=0  signal=null  error=none   stdoutLen=59
  64KB  status=0  signal=null  error=none   stdoutLen=59
  96KB  status=0  signal=null  error=EPIPE  stdoutLen=59
 128KB  status=0  signal=null  error=EPIPE  stdoutLen=59
```

A perfectly good judge envelope plus `error: EPIPE` is exactly the input that makes `judgeCase`
return `score: "error"`, `failureClass: "cli"`, which `isRetryableJudgeError` then accepts, which
`judgeRowWithRetry` then retries — one extra `paid` line, and a final run that still exits 0
because the retry succeeds. That matches the failure signature precisely: the tests fail **only**
on the call count, never on `status` or on the stamped `meta.judgeEnvironment`.

### Why this is a race and not a size threshold

The judge prompt for this fixture is small. Measured here through `buildJudgePrompt` with the exact
stored row:

```text
judge prompt bytes: 5277
```

5,277 bytes fit inside the pipe buffer on both platforms (Linux 64 KiB; macOS 16 KiB growing to
64 KiB). So the write does not block on capacity. What remains is a timing window: the parent
issues the write to the stdin pipe while the child is already running. If the child reaches `exit`
and the kernel tears down the read end **before** the parent's write syscall completes, the parent
gets `EPIPE` even for 5 KB.

That window is far more likely on Linux CI than on a macOS laptop for three compounding reasons:

1. `/bin/sh` on Ubuntu runners is `dash`. It starts and exits in a fraction of the time `bash` — the
   macOS `/bin/sh` — takes. The child's whole lifetime is two `printf` builtins.
2. CI runners are CPU-contended, and Vitest runs test files concurrently. The parent thread can be
   descheduled between spawning the child and completing the stdin write.
3. The fixture root sits under `TMPDIR`, and the child's first action is an append to a file on
   that filesystem; runner I/O jitter widens the window further.

This also explains the attempt-to-attempt variation: on attempt 1 the window opened for three
cases, on attempt 2 for a different single case.

## Falsifiable predictions

Each of these can be checked on a Linux runner without a paid or provider call. If any fails, the
diagnosis above is wrong.

1. **The retry is visible in the run.** Add a temporary trace of `attempts.length` (or dump the
   stored row's `verdict.attempts`) from the failing run. The prediction is exactly two attempts,
   the first with `score: "error"` and `failureClass: "cli"`, the second `correct`.
2. **The failure cause is `EPIPE`, not a non-zero exit.** The first attempt's
   `verdict.cliFailure` should name an `EPIPE` spawn error, and the recorded `exitStatus` should be
   `0`, not a signal or a non-zero code.
3. **The fake's stdout is complete in both attempts.** Both invocations write the identical
   envelope; the retry succeeds on the same bytes the first attempt "failed" on.
4. **Draining stdin removes the failure.** With `cat >/dev/null` added to the fake before its
   envelope `printf`, the duplicate never appears across repeated Linux runs.
5. **Contrary prediction that must NOT hold.** If instead the fake's exit status were non-zero on
   Linux, or its stdout differed under `dash`, then running the script by hand under `dash` would
   show it. The diagnostician ran the script's exact text locally and observed an identical
   envelope and status 0; a `dash` run on the runner should agree.
6. **Panel escalation is not involved.** The stored row's `verdict.meta.panelSize` should be
   absent or 1, and `judgeTierUsed` should be `single`.

If prediction 1 shows one attempt and two calls, the retry hypothesis is dead and the next suspect
is a second `judgeStoredResults` pass over the same row.

## Smallest robust test fix

**Make the fake `claude` drain standard input before it exits.** One line, in
`createEnvironmentPinCliFixture` at `test/qa-harness-preconditions.test.mjs:504-511`:

```sh
#!/bin/sh
if [ "$1" = "--version" ]; then
  printf '%s\n' 'fixture-claude 1.0.0'
  exit 0
fi
cat >/dev/null                       # <-- added: consume the judge prompt
printf '%s\n' paid >> "$QA_FAKE_CALL_LOG"
printf '%s\n' '{"result":"…","total_cost_usd":0.01}'
```

Why this is the right fix and not a workaround:

- It removes the race at its source. A real `claude -p` reads its prompt from stdin; the fake
  should model that, and today it does not.
- It keeps every existing assertion meaningful. The call-count assertions stay exact, so they still
  catch a genuine duplicate paid call.
- It needs no change to the assertions, to `judgeCase`, or to the retry policy.
- `binarySha256` is computed from the file bytes at `:521`, so it tracks the edit automatically.
  `environmentSha256` is computed from the environment map at `:522` and is unaffected.
- `cat` is on `PATH` for the child: the fixture sets `PATH` to `${root}:/usr/bin:/bin` at `:515`,
  and `/bin/cat` exists on both platforms. Use `cat >/dev/null` rather than a `while read` loop,
  because `read` mangles backslashes and is slower.

The same one-line addition applies to `createCliFixture` in
`test/discovery-paid-run-guards.test.mjs` if that fixture's fake is ever given input; it is not
today, so leave it alone unless the same symptom appears there.

## Exact recommended assertions

Keep the existing exact-count assertions. They are the contract. Add the two below so a future
failure names its own cause instead of printing a bare array mismatch.

At `test/qa-harness-preconditions.test.mjs:801`, inside `accepts a matching pin and stamps the
judge environment identity`:

```js
expect(matching.status, matching.stderr).toBe(0);

const stored = JSON.parse(readFileSync(matchingPath, "utf8"));
// A retry would append a second paid line; name the cause when it happens.
expect(stored.rows[0].verdict, "judge attempt must not be a retryable CLI error")
  .toMatchObject({ score: "correct" });
expect(stored.rows[0].verdict.failureClass ?? null).toBeNull();
expect(fixture.paidCalls()).toEqual(["paid"]);
```

At `test/qa-harness-preconditions.test.mjs:736`, inside the spaced-optional-flag control, add only
the message so the diagnosis is not lost:

```js
expect(fixture.paidCalls(), "one judge call per stored row; a second means a judge retry")
  .toEqual(["paid"]);
```

Do **not** relax either assertion to `toContain("paid")`, to a length range, or to a de-duplicated
set. The count is the spend contract these tests exist to hold, and the prior rounds established
that a non-discriminating zero-call or one-call assertion is the defect, not the fix.

## Risks

| Risk | Assessment |
| --- | --- |
| `cat >/dev/null` masks a real duplicate call | No. It changes what the fake does with stdin, not how many times it is invoked. The log still records every invocation. |
| The added `cat` changes the fake's sha256 and breaks a pinned hash | No. `binarySha256` is derived from the file at `:521` on every fixture construction; no hash is committed. |
| `cat` is missing in a minimal CI container | Low. `/bin` and `/usr/bin` are both on the fixture `PATH`. If it ever matters, `while IFS= read -r _; do :; done` is a builtin-only fallback, at the cost of speed. |
| The diagnosis is wrong and the duplicate has another cause | Prediction 1 settles it in one run. If two attempts are not present, the retry path is excluded and the next suspect is a second stored-judging pass. |
| The fix hides a genuine product defect | It does not fix the product defect described below. That should be recorded separately. |

## Product finding this diagnosis exposes (record separately)

`eval/qa/judge.mjs:587` treats any `res.error` as a `cli` failure, including an `EPIPE` that
arrives with `status === 0` and a complete, parseable stdout. In production that means a real judge
process which exits before draining a large prompt is scored as a failure and **retried at full
price**, and the spend ledger authorizes both calls. The prompt carries an evidence pack of up to
12,000 characters plus the rubric, so large prompts are ordinary.

The narrow repair is to fall through to the normal parse when `status === 0` and the stdout
envelope parses, and to keep the `cli` failure only when the output is unusable. This is a
behavior change to a paid path, so it belongs in its own `.agents/TODO.md` item with its own
focused tests, not in this CI fix.

## Summary

The Linux failure is not a shell, locale, or parsing difference. It is a stdin race: the fake
`claude` exits without reading the judge prompt, `spawnSync` reports `EPIPE` on the parent's write
while returning `status 0` and a complete envelope, `judgeCase` converts that into a retryable
`cli` failure, and `judgeRowWithRetry` spends a second call. `dash` plus a contended runner opens
the window on Linux and almost never on macOS, which is why the same file passes locally and why
the two CI attempts failed different cases.

The smallest robust fix is one line in the fixture: drain stdin in the fake before it prints.
Keep the exact call-count assertions and add the two diagnostic messages above.
