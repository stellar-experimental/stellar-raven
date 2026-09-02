# Final closure review — CI EPIPE repair

Date: 2026-09-02
Reviewer CLI: Claude Code
Model: Opus 5
Effort: high
Author: Codex Sol (high)
Worktree: `/private/tmp/stellar-raven-agent-queue-integration`
Fixed point: `8088467` (`docs: close the agent queue integration`)
Prior reports: `ci-test-diagnosis-opus.md`, `ci-epipe-review-opus.md`, `ci-epipe-review-opus-closure.md`
Reviewer edits: none to any product or test file. This report is the only file written.
Network, provider, and paid eval calls: none.

## Verdict

**PASS.** F1, F2, N1 and N2 are all closed. No new actionable finding remains.

The whole uncommitted change against `8088467` is ten files: two product files, six test files,
one document, and the round ledger. Everything in it serves the CI failure or a finding raised
against its repair.

## Findings reconciliation

| Finding | Report | State | Closure evidence |
| --- | --- | --- | --- |
| F1 — an accepted status-zero EPIPE left no trace | `ci-epipe-review-opus.md` | closed | The design no longer accepts. `eval/qa/judge.mjs:587-601` makes it a terminal `prompt-write` failure and discards the returned verdict. |
| F2 — the tests did not pin the real EPIPE precondition | `ci-epipe-review-opus.md` | closed | `test/helpers/fake-judge-cli.mjs:84-87` documents the 4 MiB / 64 KiB rationale; both status-zero tests assert `kind: "prompt-write"`, an EPIPE message, and `isRetryableJudgeError === false`. |
| N1 — `prompt-write` was invisible to five-track accounting | `ci-epipe-review-opus-closure.md` | closed | `eval/qa/five-track.mjs:235-237` adds `judgePromptWriteIds`; `:321` publishes `t4.judgePromptWriteFailures`; `:411` prints it. |
| N2 — the README terminal enumeration omitted the class | `ci-epipe-review-opus-closure.md` | closed | `eval/qa/README.md:239-245` lists `prompt-write` as terminal and defines the condition. |

## N1 — verified independently

The repair is the minimal one this reviewer specified, plus one improvement that was not asked for
and is correct: the human-readable formatter also gained the bucket, so a printed summary cannot
omit what the JSON records.

The reviewer A/B'd the current `five-track.mjs` against the `8088467` version over a row set that
covers every other failure class — three graded rows plus `cli`, `parse`, `timeout`,
`provider-safeguard`, agent `spawn`, and agent `transport`:

```text
old vs new, ignoring the new key: true
new key value                   : {"count":0,"denominator":7,"ids":[]}
schema unchanged                : true qa-five-track-v1
formatter lines added           : [ '  judge prompt-write failures 0/7 IDs: none' ]
formatter lines removed         : []
```

Attribution for one `prompt-write` row, through the real `buildFiveTrackSummary`:

```text
t4.judgePromptWriteFailures : ["pw"]
t4.cliOrParseFailures       : []      t4.judgeTimeouts     : []
t4.judgeProviderSafeguards  : []      t4.consistencyContradictions : []
t4.spawnFailures            : []      t4.protocolFailures  : []
t4.judging.attempted        : ["pw"]  t4.judging.unattempted : []
t5.providerSafeguards       : []      t5.transport : []   t5.timeouts : []
t1.validGradesOverAnswered  : []
formatter line: "  judge prompt-write failures 1/1 IDs: pw"
```

The row is attributed exactly once, in the one bucket that fits, and it correctly stays inside
`t4.judging.attempted` — the call really was made and paid for — while contributing no valid grade.
The unattributable-row condition the closure review found is gone.

## The additive `qa-five-track-v1` schema decision

The ledger records the decision at `.agents/rounds/2026-09-02-agent-queue-closeout.md:127-129`:
`QA_TRACK_SCHEMA` stays `qa-five-track-v1` because the bucket is additive and fulfils the existing
v1 T4 harness-health contract without changing any key semantics or comparability rule.

The reviewer treated that as a claim to test rather than accept, and it holds:

- **No existing value moves.** The A/B above is byte-identical apart from the added key, over a
  row set spanning every other failure class.
- **The added key is inert on historical data.** No artifact collected before this change can
  contain a `prompt-write` attempt, so a replay of an old artifact yields `count: 0` and the same
  numbers everywhere else.
- **No consumer validates a closed key set.** `eval/qa/run-qa.mjs:960`, `:1247`, `:1306`, `:1412`,
  `:1817` and `:1916` build, stamp, and print the summary; none enumerates T4 keys. Every
  formatter assertion in `test/qa-five-track.test.mjs` and `test/qa-lifecycle.test.mjs` uses
  `toContain`, so an added line breaks nothing.
- **The README's own v1 contract still reads true.** `eval/qa/README.md:231-234` describes what a
  v1 result stamps and what each row and attempt keeps; nothing in that contract is narrowed.

Keeping v1 is therefore the right call, and it is recorded with its reasoning rather than assumed.

## Behavior checks

Verified first-hand through the public helper against the current tree:

```text
failureClass: prompt-write | kind: prompt-write | exitStatus: 0 | costUsd: 0.125
message has EPIPE: true
stdout excerpt bytes: 166 | retryable: false
score: error | coreAnswer: null
```

| Area | Result |
| --- | --- |
| Fail-closed `prompt-write` | the returned verdict is discarded; `score: "error"`, `coreAnswer: null` |
| Retry semantics | `isRetryableJudgeError` (`eval/qa/judge.mjs:98-100`) admits only `cli` and `parse`; `test/qa-budget.test.mjs:148` asserts one call and one attempt; `test/qa-verdict-consistency.test.mjs:291` asserts non-retryable |
| Budget behavior | one authorization only; the budget table asserts `budgets` equals `[1]`, so no second authorization is issued |
| Cost preservation | the reported `total_cost_usd` survives as `costUsd: 0.125` on the failure verdict |
| Evidence bounds | `cliFailure.message` names EPIPE; `stdout.excerpt` and `parsedEnvelope.excerpt` are asserted at 8,192 bytes or fewer with `truncated: true` against a 20,000-byte diagnostic |
| Nonzero EPIPE | still `cli` with `cliFailure.kind: "spawn-error"`, `exitStatus: 1`, and still retryable |
| Timeout, signal, missing CLI, other spawn errors | unchanged; each arrives with `status === null`, so `promptWriteFailed` cannot apply |
| Provider safeguard and consistency | unchanged and still terminal |
| Harness stdin drain | `test/qa-harness-preconditions.test.mjs:509` adds `cat >/dev/null`; the exact `toEqual(["paid"])` contracts survive at `:739` and `:807` with added messages plus the two diagnostic assertions at `:810-812` |
| Deterministic tests | the 4.2 MB prompt against a 64 KiB pipe forces the EPIPE rather than racing it; the five-track cases are pure function calls |
| Documentation | `eval/qa/README.md:239-245` names the class, states that status is zero while the write reports EPIPE, and says the verdict is rejected because the prompt was incomplete |

### Gates

| Gate | Command | Ledger claim | Reviewer result |
| --- | --- | --- | --- |
| Five-track focused | `npx vitest run test/qa-five-track.test.mjs` | 1 file, 9 tests | pass — 1 file, 9 tests |
| Judge, budget, consistency, preconditions | four-file run | 4 files, 278 tests | pass — 4 files, 278 tests |
| Full suite | `npm test` | — | pass — 100 files, 1699 tests |
| Typecheck | `npm run typecheck` | — | pass |
| Build | `npm run build` | — | pass |
| Eval self-test | `npm run eval:selftest` | — | pass |
| Secret scan | `npm run secrets:scan -- --tree` | — | pass, no leaks |
| Diff check | `git diff --check` | — | pass |
| Provider or paid calls | none | 0 | 0 |

Every ledger figure reproduces.

## Regression review

- `eval/qa/judge.mjs` is byte-identical to the version cleared in the previous closure review; the
  N1 and N2 repair touched only `five-track.mjs`, the README, and one test file.
- The five-track change adds code and adds one formatter line. It deletes nothing and rewrites no
  existing computation.
- The two new five-track tests are hermetic: they build rows in memory and assert one bucket plus
  the emptiness of every sibling, so a future mis-bucketing fails loudly instead of silently
  moving a count.
- Scope is clean. Ten files, all within this repair, and no unrelated change entered the tree.

## Observations, not findings

- The class string `prompt-write` appears in the summary through the key name
  `judgePromptWriteFailures` and through the printed line, not as a value. That is consistent with
  how `judgeTimeouts` and `judgeProviderSafeguards` already work, so no change is wanted.
- A provider safeguard emitted with status 0 **and** an EPIPE would be labelled `prompt-write`
  rather than `provider-safeguard`. Both are terminal and the safeguard text still reaches
  `cliFailure`, and the row is now attributable either way. Noted in the previous report; still
  not worth a rule.
- The ledger status line reads "Opus N1 and N2 reconciled; closure re-review pending"
  (`:3`), and the Ledger and Outcome sections record the pending re-review. Recording this report
  and flipping that line is the integrator's merge step, as it has been after every earlier round.

## Summary

| Severity | Count | Findings |
| --- | --- | --- |
| HIGH | 0 | — |
| MEDIUM | 0 | — |
| LOW | 0 | — |
| NIT | 0 | — |

The CI duplicate is fixed at its source, a status-zero EPIPE is now a terminal, fail-closed,
non-retryable `prompt-write` failure that keeps its bounded evidence and its reported cost, the
five-track report attributes that class to exactly one bucket in both JSON and printed form, the
`qa-five-track-v1` decision is additive and proven so, and the README states the rule. Every gate
passes and every ledger figure reproduces. The repair is complete.
