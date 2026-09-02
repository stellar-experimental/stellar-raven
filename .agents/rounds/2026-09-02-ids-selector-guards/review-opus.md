# Optional IDs selector guards — independent review

Date: 2026-09-02
Reviewer CLI: Claude Code
Model: Opus 5
Effort: high
Branch: `codex/optional-ids-guards`
Baseline: `main`
Reviewer edits: none to implementation files. This report is the only file the reviewer wrote.

## Verdict

**NOT PASS.** Two MEDIUM code findings and four MEDIUM record findings remain actionable.

The two guards work. Both runners reject the equals form and the duplicate form before a paid
call. One spaced `--ids a,b,c` form still works in both runners. The defects are in test strength,
residual scope, and ledger accuracy, not in the guard logic.

## What the reviewer inspected

`git diff main...HEAD` is empty. All work is uncommitted in this worktree.
The reviewer read the whole uncommitted diff across seven files plus the new ledger.

- `eval/qa/run-qa.mjs`
- `eval/discovery/run-agent-discovery.mjs`
- `test/qa-harness-preconditions.test.mjs`
- `test/discovery-paid-run-guards.test.mjs`
- `eval/qa/README.md`
- `eval/discovery/README.md`
- `.agents/skills/run-evals/SKILL.md`
- `.agents/rounds/2026-09-02-ids-selector-guards.md` (untracked)

The specification is the `.agents/NEXT.md` block `Harden optional selector flags in both paid
runners`, plus the matching `.agents/TODO.md` item under `## Eval instruments`.

## Direct behavior verification

The reviewer called the exported parsers directly. No provider call and no network call occurred.

`eval/discovery/run-agent-discovery.mjs`:

| Input after the five required pins | Result |
| --- | --- |
| `--ids discovery-001,discovery-002` | preconditions carry `ids: "discovery-001,discovery-002"` |
| no `--ids` | preconditions carry no `ids` key |
| `--ids=x` | throws `--ids=<value> is not supported; use --ids <value>` |
| `--ids a --ids b` | throws `run-agent-discovery accepts --ids at most once` |
| `--ids` with no value | throws `--ids requires a value` |
| `--ids ""` | throws `--ids requires a value` |
| `--ids --model` | throws `--ids requires a value` |

`eval/qa/run-qa.mjs`:

| Input | Result |
| --- | --- |
| `--ids q-a,q-b` | returns `"q-a,q-b"` |
| no `--ids` | returns `undefined` |
| `--ids=q-a` | throws `--ids=<value> is not supported; use --ids <value>` |
| `--ids q-a --ids q-b` | throws `run-qa accepts --ids at most once` |
| `--ids` with no value | throws `--ids requires a value` |
| `--ids ""` | throws `--ids requires a value` |

Ordering is correct in both runners.
`eval/qa/run-qa.mjs:1422` calls `parseOptionalIdsFlag` on the second statement of `main()`.
That call runs before the executable pin, the environment pin, the budget, and every agent spawn.
`eval/discovery/run-agent-discovery.mjs:134` calls `parseOptionalIdsFlag` inside
`parsePaidRunPreconditions`, so `withPaidRunPreconditions` cannot start the paid continuation.

## Gates the reviewer ran

| Gate | Command | Result |
| --- | --- | --- |
| Focused tests | `npx vitest run test/discovery-paid-run-guards.test.mjs test/qa-harness-preconditions.test.mjs` | pass — 2 files, 102 tests |
| Typecheck | `npm run typecheck` | pass |
| Full test suite | `npm test` | pass — 100 files, 1636 tests |
| Build | `npm run build` | pass |
| Secret scan | `npm run secrets:scan -- --tree` | pass — no leaks |
| Provider calls | none | 0 |
| Tree state after the gates | `git status --porcelain` | unchanged, 7 modified files and 1 untracked file |

The ledger claim of 102 focused tests is correct.

## Findings

### F1 — MEDIUM — The new `ids` precondition field has no test

File: `eval/discovery/run-agent-discovery.mjs:141`, `eval/discovery/run-agent-discovery.mjs:371`,
`test/discovery-paid-run-guards.test.mjs:233`

The change adds `...(ids === undefined ? {} : { ids })` to the `parsePaidRunPreconditions` return
value. `runPaidDiscovery` then reads `paidRun.ids` for case selection. No test asserts this field.

`test/discovery-paid-run-guards.test.mjs:233` is the one test that asserts the exact precondition
object. Its argument list contains no `--ids`. `runPaidDiscovery` is module private and no test
calls it. A grep over `test/` finds no assertion on a preconditions `ids` value.

Failure scenario: an editor deletes the conditional spread at line 141. All 1636 tests still pass.
`paidRun.ids` becomes `undefined`. `run-agent-discovery` then runs the full discovery case list at
the full authorized budget, which is the exact defect this block exists to remove.

Required action: extend `test/discovery-paid-run-guards.test.mjs:233` with a second argument list
that includes `--ids discovery-001,discovery-002`, and assert the `ids` value in the returned
object and in the forwarded continuation.

### F2 — MEDIUM — The zero-call assertion in the new tests is non-discriminating

File: `test/discovery-paid-run-guards.test.mjs:115-128`,
`test/qa-harness-preconditions.test.mjs:556-575`

Both new CLI tests assert `expect(fixture.paidCalls()).toEqual([])`. That assertion carries no
information in these fixtures, because both runs die before any agent spawn even without a guard.

For the QA case, `fixture.runCollection` passes only `--max-budget-usd` and
`--expect-agent-binary-sha256`. Without the guard the run reaches
`parseRequiredAgentEnvironmentFlag` at `eval/qa/run-qa.mjs:1434` and throws there.
For the discovery case, `requiredArgs` uses a fake surface digest and a fake revision. Without the
guard the run throws at `preflightSearch` or at the surface pin. Neither path reaches a paid call.

Only the `stderr` match separates a guarded runner from an unguarded one. The adjacent
required-pin table at `test/discovery-paid-run-guards.test.mjs:74-113` does not rely on that. It
also asserts that `withPaidRunPreconditions` never runs its continuation. The new cases dropped
that control.

This repeats finding F3 of the prior round, recorded as closed in
`.agents/rounds/2026-09-01-agent-discovery-paid-guards/review-opus-closure.md:25`
("zero-call assertion was structurally vacuous").

Required action: add the continuation control to the discovery `--ids` cases, in the same shape as
line 103 to line 105. For the QA case, either state in the ledger that `stderr` is the load-bearing
assertion, or add an equivalent in-process control.

### F3 — MEDIUM — The same defect class remains on higher-spend flags in the same parsers

File: `eval/qa/run-qa.mjs:1423-1511`, `eval/discovery/run-agent-discovery.mjs:85-88`,
`eval/discovery/run-agent-discovery.mjs:361-366`

The block hardens one flag. The root cause is that both runners read optional flags with a loose
first-match helper and accept unknown flags in silence. That helper still serves every other flag.

Measured residual set:

| Runner | Flag | Effect of the silently ignored equals form |
| --- | --- | --- |
| `run-qa.mjs` | `--sample=30` | runs the full battery instead of 30 cases |
| `run-qa.mjs` | `--model=<name>` | measures the default model and records it as if pinned |
| `run-qa.mjs` | `--judge-model=<name>` | judges with the default judge model |
| `run-qa.mjs` | `--cases=<path>` | runs the default battery |
| `run-qa.mjs` | `--variant=B` | runs variant A |
| `run-agent-discovery.mjs` | `--repeat=3` | runs one repeat |
| `run-agent-discovery.mjs` | `--model=<name>`, `--effort=<value>`, `--cases=<path>` | uses the default |

The `--sample` case is the largest spend hazard. `.agents/skills/run-evals/SKILL.md:118-121` records a
stored sample-30 cost range of $17.98 to $23.08. The full battery holds 500 cases.

The `--model` case is a comparability hazard. The `.agents/TODO.md:170` rationale states that the
total budget "does not preserve the selected scope or comparability". That sentence applies to
`--sample` and `--model` without change.

Two sibling paid runners already solve this class generally. `eval/qa/re-judge.mjs:175` throws
`unknown flag ${arg}`. `scripts/run-playground-semantic-eval.mjs:111` throws
`Unknown argument: ${arg}`. Both therefore reject `--ids=a,b` today.

The specification body names `--ids` only, so the delivered scope matches the body. The
specification title says "selector flags" in the plural. Neither the ledger nor `.agents/TODO.md`
records the residual set.

Required action: record the residual set in the ledger and in `.agents/TODO.md` as a named
follow-up, or adopt the `re-judge.mjs` unknown-flag rejection in both runners in this change.

### F4 — MEDIUM — The ledger declares a required gate unsatisfiable, and that is wrong

File: `.agents/rounds/2026-09-02-ids-selector-guards.md:50-55`

The ledger states that an independent review requires a provider call, and that the user prohibited
provider calls for this task. It then leaves the gate pending.

The specification prohibits a different thing. `.agents/NEXT.md:80` says "Do not make a provider
call while implementing or testing this block." That sentence bounds the paid eval runners during
implementation and testing. `.agents/NEXT.md:82` lists an independent review pass in the same exit
gate, so the two cannot contradict each other.

`AGENTS.md` makes independent adversarial review a completion gate when requested. This review ran
and made zero runner provider calls. The ledger statement is factually wrong now.

Required action: replace the `## Review status` section with the real review record. Name the
reviewer lane, the model, and the effort, as the `AGENTS.md` model-routing section requires.

### F5 — MEDIUM — The ledger omits the release-baseline evidence its exit gate requires

File: `.agents/rounds/2026-09-02-ids-selector-guards.md:22-48`

`.agents/NEXT.md:82` sets the exit gate as "focused tests, the release baseline, and an independent
review pass". The ledger records the focused command and its 102 tests only. It records no
typecheck, no full test suite, no build, and no secret scan.

Required action: add the baseline results to the ledger. The reviewer measured them above.

### F6 — MEDIUM — `--ids` stays silent under `--judge-stored`, and the new documentation hides that

File: `eval/qa/run-qa.mjs:1459-1477`, `eval/qa/README.md:204`

`main()` now parses `--ids` for every mode. The `--judge-stored` branch never forwards the value to
`judgeStoredResults`. An operator who passes `--ids` with `--judge-stored` judges every stored row
and pays for all of them.

The new README sentence says "`--ids` accepts only one spaced `--ids a,b,c` form." It does not say
that the flag has no effect under `--judge-stored`. `eval/qa/README.md:1503` points to
`re-judge.mjs --ids` for that job, but the two statements are far apart.

The silent behavior is pre-existing. The new sentence makes it harder to see.

Required action: reject `--ids` together with `--judge-stored`, in the same shape as the existing
`--judge-stored` and `--no-judge` contradiction check at `eval/qa/run-qa.mjs:1461`. A one-clause
README note is the smaller alternative.

### F7 — LOW — The guard is duplicated across two runners

File: `eval/qa/run-qa.mjs:247-261`, `eval/discovery/run-agent-discovery.mjs:114-131`

`parseOptionalIdsFlag` appears twice. The two bodies differ only in the error prefix and in one
brace style. Both runners already import shared code from `eval/lib/harness-guards.mjs` and from
`eval/qa/spend-budget.mjs`, so a shared home exists.

The change also adds a third and a fourth copy of one parse shape, because `requiredPaidFlag` and
`parseRequiredFlagValue` already duplicate it.

Required action: move the parser to `eval/lib/harness-guards.mjs` with a runner-name parameter, or
record the accepted duplication in the ledger.

### F8 — LOW — The new QA tests sit under an unrelated describe block

File: `test/qa-harness-preconditions.test.mjs:555`

The two `--ids` cases and the parser case sit inside
`describe("P3 — run-qa CLI pins the inherited agent environment")`. They test the selector guard,
not the environment pin. The test names read as "P3 ... rejects the equals form --ids selector",
which is misleading. A later edit that removes the P3 block would remove the selector coverage.

Required action: move the three cases into their own describe block.

### F9 — LOW — The new guard carries no rationale comment

File: `eval/qa/run-qa.mjs:247`, `eval/discovery/run-agent-discovery.mjs:114`

`requiredPaidFlag` at `eval/discovery/run-agent-discovery.mjs:90` carries a comment that states why
the space-separated form is the only accepted form. The new spend-safety function directly below it
carries none. The QA copy carries none either.

Required action: add one sentence that states why the equals form and the duplicate form must fail
before spend.

### F10 — LOW — The discovery README dropped `--ids` from the A/B flag list

File: `eval/discovery/README.md:49-51`

The previous sentence listed `--repeat N`, `--cases`, `--ids`, `--model`, and `--effort` as the
flags that support isolated A/Bs. The new text removes `--ids` from that list. `--ids` is the main
A/B selector, and the surrounding sentences still describe it, so no fact is lost. The grouping is
now wrong.

Required action: keep `--ids` in the A/B list, or state that the list holds the remaining flags.

### F11 — NIT — One flag contract now appears in three files

File: `.agents/skills/run-evals/SKILL.md:134-135`, `eval/qa/README.md:204-205`,
`eval/discovery/README.md:49-50`

The same two sentences appear in three places. A later change to the flag contract must edit all
three. The skill copy is defensible, because an operator reads the skill before spending.

Required action: none required. Accept the duplication or point the two READMEs at the skill.

## Items the reviewer checked and cleared

- Scope is clean. All seven modified files serve the block. No unrelated file changed.
- The dirty tree holds no unrelated work. `git status` before and after the gates is identical.
- Error messages match the repository style. Required flags say "exactly once". The optional flag
  says "at most once". That distinction is correct.
- `eval/qa/run-qa.mjs` now rejects `--ids ""`, which the old `argVal` helper accepted and ignored.
  This is a correct tightening.
- Both runners exit non-zero and print the message to `stderr`. The discovery runner uses its
  `main().catch` path at `eval/discovery/run-agent-discovery.mjs:616`. The QA runner uses the
  top-level await rejection path.
- The equals-form detector uses `startsWith("--ids=")`. No other flag in either runner begins with
  that prefix, so no false rejection exists.
- The `.agents/skills/run-evals/SKILL.md` addition is timeless. It carries no run stamp and no
  identifier.
- The ledger path matches the `AGENTS.md` pattern `.agents/rounds/<YYYY-MM-DD>-<slug>.md`.
- No secret, credential, or partner detail entered the diff.
- `re-judge.mjs` and `scripts/run-playground-semantic-eval.mjs` already reject `--ids=a,b`. The
  documentation correctly limits its claim to the two named runners.

## Summary

| Severity | Count | Findings |
| --- | --- | --- |
| HIGH | 0 | — |
| MEDIUM | 6 | F1, F2, F3, F4, F5, F6 |
| LOW | 4 | F7, F8, F9, F10 |
| NIT | 1 | F11 |

The guard logic is correct and the exit-gate commands pass. F1 and F2 leave the guard weakly
tested. F3 leaves a larger spend hazard of the same class unrecorded. F4, F5, and F6 are record and
documentation defects. Resolve each finding, then request a closure review.
