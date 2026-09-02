# Residual optional equals-form guards — independent review

Date: 2026-09-02
Reviewer CLI: Claude Code
Model: Opus 5
Effort: high
Branch: `codex/optional-ids-guards`
Baseline: HEAD commit `9ba1f1b` (`eval: guard optional ids selectors`)
Specification: `.agents/TODO.md:176-193`, item `Harden residual optional equals-form flags in paid runners`
Ledger: `.agents/rounds/2026-09-02-residual-optional-flag-guards.md`
Reviewer edits: none to implementation files. This report is the only file the reviewer wrote.

## Verdict

**NOT PASS.** One MEDIUM specification finding and one MEDIUM record finding remain actionable,
with four LOW items and one NIT.

All nine listed equals forms fail before a paid call. Every spaced form still works. The tests
discriminate. The ledger numbers are exact. The defect is the mechanism: the block ships a
hand-maintained deny-list where the specification requires exact parsing or unknown-flag
rejection, and ten further equals forms stay silently ignored without a record.

## What the reviewer inspected

`git diff` against `9ba1f1b` covers eight files and 120 insertions with no deletion.

- `eval/lib/harness-guards.mjs` — the new shared guard
- `eval/qa/run-qa.mjs`, `eval/discovery/run-agent-discovery.mjs` — the two call sites
- `test/qa-harness-preconditions.test.mjs`, `test/discovery-paid-run-guards.test.mjs`
- `eval/qa/README.md`, `eval/discovery/README.md`, `.agents/skills/run-evals/SKILL.md`
- `.agents/rounds/2026-09-02-residual-optional-flag-guards.md` (untracked)

## Direct behavior verification

The reviewer called `assertNoEqualsFormFlags` directly with each runner's flag list. No provider
call and no network call occurred.

All nine listed equals forms are rejected:

| Runner | Flag | Result |
| --- | --- | --- |
| `run-qa.mjs` | `--sample=x` | throws `--sample=<value> is not supported; use --sample <value>` |
| `run-qa.mjs` | `--model=x` | throws the matching message |
| `run-qa.mjs` | `--judge-model=x` | throws the matching message |
| `run-qa.mjs` | `--cases=x` | throws the matching message |
| `run-qa.mjs` | `--variant=x` | throws the matching message |
| `run-agent-discovery.mjs` | `--repeat=x` | throws the matching message |
| `run-agent-discovery.mjs` | `--model=x` | throws the matching message |
| `run-agent-discovery.mjs` | `--effort=x` | throws the matching message |
| `run-agent-discovery.mjs` | `--cases=x` | throws the matching message |

An empty value also fails: `--sample=` throws. That is correct.

No false positive exists. The reviewer probed `--cases-ref=abc`, `--model-x=1`, `--modelfoo=1`,
`--judge-models=1`, `--variantB`, and `cases=1`. The guard accepted every one, because
`startsWith` includes the `=` in the prefix. `eval/qa/re-judge.mjs:147` owns `--cases-ref`, so the
`--cases` entry could have collided. It does not.

Ordering is correct in both runners:

- `eval/qa/run-qa.mjs:1424` calls the guard on the second statement of `main()`, before the
  executable pin, the environment pin, the budget parse, and every agent spawn.
- `eval/discovery/run-agent-discovery.mjs:136` calls the guard as the first statement of
  `parsePaidRunPreconditions`, so `withPaidRunPreconditions` cannot start the paid continuation.

No regression risk exists. A grep over `*.md`, `*.mjs`, `*.js`, `*.json`, `*.yml`, and `*.sh` for
`--model=`, `--sample=`, `--cases=`, `--variant=`, `--repeat=`, `--effort=`, and `--judge-model=`
finds only the new code, the new tests, the TODO item, and the round ledgers. No committed runbook
command and no script uses an equals form for these nine flags.

## Test discrimination

Both negative suites discriminate. The reviewer traced each control.

**QA** — `test/qa-harness-preconditions.test.mjs:612` reuses the invocation from the existing
positive control at `test/qa-harness-preconditions.test.mjs:704`. That control runs
`fixture.run(resultsPath, ["--expect-agent-environment-sha256", <valid>])`, exits 0, and asserts
`paidCalls()` equals `["paid"]`. The new negative cases add one equals-form argument to that exact
command. Without the guard the flag would be ignored, the run would reach the fake judge, and the
log would hold `["paid"]`. The zero-call assertion therefore carries real information. Each case
also asserts the stored row's `verdict` stays `null`.

**Discovery** — `test/discovery-paid-run-guards.test.mjs:147` asserts both that
`withPaidRunPreconditions` throws and that `continuations` stays empty. All five required pins are
valid in that argument list, so without the guard the continuation would run and both assertions
would fail. This is the structural control the 2026-09-01 round established.

**Positive spaced-form controls** — present for all nine flags.
`test/qa-harness-preconditions.test.mjs:637` asserts exit 0 and `paidCalls()` equals `["paid"]`.
`test/discovery-paid-run-guards.test.mjs:170` asserts the continuation runs exactly once and the
call returns `"continued"`. The ledger claim that the focused cases cover all nine rejected forms
and all nine supported spaced forms is correct.

## Gates the reviewer re-ran

| Gate | Command | Ledger claim | Reviewer result |
| --- | --- | --- | --- |
| Focused tests | `npx vitest run test/discovery-paid-run-guards.test.mjs test/qa-harness-preconditions.test.mjs` | 2 files, 123 tests | pass — 2 files, 123 tests |
| Typecheck | `npm run typecheck` | PASS | pass |
| Full test suite | `npm test` | 100 files, 1657 tests | pass — 100 files, 1657 tests |
| Build | `npm run build` | 7038.90 KiB, gzip 1408.86 KiB | pass — identical |
| Secret scan | `npm run secrets:scan -- --tree` | no leaks | pass — no leaks |
| Diff check | `git diff --check` | PASS | pass |
| Self-test | `npm run eval:selftest` | all checks passed | pass — all checks passed |
| Routing compile | `npm run eval:compile` | 338 legacy, 122 extended | pass — 338/395 legacy, 122/144 extended |
| QA compile | `npm run eval:qa:compile` | 500 cases, 30 sample | pass — 500 cases, 30 sample |
| QA lint | `npm run eval:qa:lint -- --stale` | 0 errors, 62 warnings | pass — 0 errors, 62 warnings |
| Provider calls | none | 0 | 0 |

Every ledger number matches. The ledger correctly ran the free `npm run eval:selftest`, not the
paid `npm run eval:qa:selftest`. The compile commands left the tree unchanged.

## Findings

### F1 — MEDIUM — The mechanism is a deny-list, not the specification's exact parsing or unknown-flag rejection

File: `eval/lib/harness-guards.mjs:23-30`, `eval/qa/run-qa.mjs:1424-1430`,
`eval/discovery/run-agent-discovery.mjs:136`

`.agents/TODO.md:191` states the required mechanism: "Each runner must use exact parsing or
unknown-flag rejection." `.agents/TODO.md:187-188` names the pattern to copy: "`eval/qa/re-judge.mjs`
rejects unknown flags. Use its fail-closed parser as the candidate pattern."

The delivered `assertNoEqualsFormFlags(args, flags)` is neither. It checks a hand-written list of
flag names. A flag absent from that list keeps the original silent fallback. `eval/qa/re-judge.mjs:175`
throws `unknown flag ${arg}` and is fail-closed by construction; this guard is fail-open by
construction.

The reviewer probed every remaining optional flag in both runners. Ten equals forms are still
accepted and silently ignored:

| Runner | Unguarded equals form | Silent effect | Class |
| --- | --- | --- | --- |
| `run-qa.mjs` | `--max-panel-cases=10` | falls back to the bounded scaled default | spend |
| `run-qa.mjs` | `--no-judge=true` | judging runs; `args.includes("--no-judge")` is false | spend |
| `run-qa.mjs` | `--judge-panel=3` | panel size 1 | comparability |
| `run-qa.mjs` | `--stability-register=<path>` | the pin is dropped and the register regenerates | data integrity |
| `run-qa.mjs` | `--surface=per-operation` | runs `search-execute` | comparability |
| `run-qa.mjs` | `--search-tool=<name>` | variant A uses the default; variant B fails closed | low |
| `run-qa.mjs` | `--port=8790` | uses 8788; the surface and revision pins usually catch this | low |
| `run-qa.mjs` | `--judge-stored=<path>` | enters collection, then fails on the missing pins | low |
| `run-agent-discovery.mjs` | `--run-label=arm-b` | labels the artifact `agent` | comparability |
| `run-agent-discovery.mjs` | `--url=<url>` | uses the default URL; the pins usually catch this | low |

Two of these are the same hazard class the block exists to remove, and both are quantified:

- `--max-panel-cases=10` falls back to `defaultMaxPanelCases`, documented at
  `eval/qa/run-qa.mjs:45-48` as one third of the selected denominator with a floor of 10 and a
  ceiling of 34. On a 100-case run an operator asking for 10 panels gets 34. Each panel case
  escalates to a three-call judge, so the silent fallback adds roughly 48 unrequested paid judge
  calls inside the same budget.
- `--stability-register=<path>` is dropped because `args.includes("--stability-register")` is
  false. `eval/qa/run-qa.mjs:50-53` states "Paired runs must share this pin." A silently dropped
  pin makes the run ineligible for pairing, and no error says so.

The helper name reinforces the gap. `assertNoEqualsFormFlags` reads as a complete rule. It only
covers the names its caller remembers to pass.

Failure scenario: a later change adds `--judge-panel` handling or a new selector to `run-qa.mjs`.
Nobody edits the list at `eval/qa/run-qa.mjs:1424`. The new flag ships with the original silent
fallback, and the block that was supposed to close this class did not close it.

Required action: adopt unknown-flag rejection in both runners, using the
`eval/qa/re-judge.mjs:175` pattern the TODO names. If the wider parser change is deliberately
deferred, record the deviation with evidence under the `AGENTS.md` forward-only rule, record the
full residual set (see F2), and amend `.agents/TODO.md:191` so the Done-when clause matches what
shipped.

### F2 — MEDIUM — The ledger does not record the residual set, dropping the standard the previous round set

File: `.agents/rounds/2026-09-02-residual-optional-flag-guards.md:17`

The ledger says only "This block does not change other optional flags." It names none of them and
gives no hazard class.

The immediately previous round set a higher standard for exactly this. Its ledger,
`.agents/rounds/2026-09-02-ids-selector-guards.md:68-83`, carries a nine-row residual table with a
`Current effect` column. That table is the reason this block exists, and its closure review
required it before passing. The current block ends with ten residuals and no equivalent record.

`.agents/TODO.md` also carries no follow-up item for the remaining ten flags. The item at
`.agents/TODO.md:176` is the one this block closes.

A reader of the ledger and the TODO after this block merges would conclude the class is closed. It
is not.

Required action: add a residual table to the ledger in the shape used at
`.agents/rounds/2026-09-02-ids-selector-guards.md:68-83`, and add one `.agents/TODO.md` item under
`## Eval instruments` naming the ten flags and the fail-closed parser as the fix.

### F3 — LOW — The documentation states the rule for nine flags and never says the rule is partial

File: `eval/qa/README.md:207-208`, `eval/discovery/README.md:51-52`,
`.agents/skills/run-evals/SKILL.md:136-138`

Each file now states that the listed flags accept only spaced values and that the runner rejects
their equals forms before any paid call. Every one of those statements is true.

No file says the rule stops there. An operator reading `eval/qa/README.md:204-208` reasonably
concludes `run-qa.mjs` validates its flag forms. `--max-panel-cases=10` is the counterexample, and
it costs money. `.agents/TODO.md:193` asks documentation to state the accepted and rejected forms;
the delivered text does that for the nine and leaves the boundary invisible.

`eval/qa/README.md:209-210` compounds this. The pre-existing sentence "Other flags include
`--no-judge`, `--model`, `--judge-model`, `--cases <path>`" now repeats three flags the two new
lines just covered, so the reader cannot tell which list is the guarded one.

Required action: add one clause naming the flags that still accept equals forms, and drop the
three now-duplicated names from the `Other flags` sentence.

### F4 — LOW — The shared module header still claims two failure modes

File: `eval/lib/harness-guards.mjs:5`

The file docblock opens "Two failure modes these guards exist for, both observed:" and then lists
the AGENTS.md instruction leak and the silently shrinking denominator. Each item cites its dated
evidence.

`assertNoEqualsFormFlags` adds a third observed failure mode. Its evidence exists and is dated:
`.agents/TODO.md:183-185` and the 2026-09-02 residual table. The header was not updated, so the
module now under-describes itself at exactly the place a reader looks first.

The guard itself fits the module. It is pure, which satisfies the `PURITY` contract at
`eval/lib/harness-guards.mjs:15`.

Required action: add the third failure mode to the header with its dated evidence.

### F5 — LOW — The shared helper has no direct test

File: `eval/lib/harness-guards.mjs:23`, `test/qa-harness-preconditions.test.mjs:605`,
`test/discovery-paid-run-guards.test.mjs:141`

`assertNoEqualsFormFlags` is shared code. Eighteen tests exercise it, all through the two runners.
No test calls it directly, so its own contract is unpinned.

The load-bearing property is the prefix boundary. `--cases` must reject `--cases=x` and must not
reject `--cases-ref=x`, which `eval/qa/re-judge.mjs:147` already owns. The reviewer verified that
boundary by hand. Nothing in the suite holds it. A future edit to `${flag}=` — dropping the `=`,
for example — would break `re-judge.mjs` the moment it adopts this helper, and both runner suites
would stay green.

Required action: add a small direct test for the helper covering multiple flags, the empty value,
and the `--cases-ref` non-match.

### F6 — LOW — A positive test passes a fake object where a CLI fixture is expected

File: `test/discovery-paid-run-guards.test.mjs:171`

The spaced-form control calls `requiredArgs({ binarySha256: "a".repeat(64), environmentSha256:
"b".repeat(64) })`. `requiredArgs(fixture, overrides)` is written for a fixture from
`createCliFixture`. Every other call site passes a real fixture.

The call works only because `requiredArgs` reads exactly those two fields today. It reads as if a
fixture exists when none does, and it breaks silently if `requiredArgs` ever reads a third field.

Required action: build the values inline, or give `requiredArgs` an explicit two-argument form that
does not impersonate a fixture.

### F7 — NIT — The new import breaks the alphabetical import list in both runners

File: `eval/qa/run-qa.mjs:139`, `eval/discovery/run-agent-discovery.mjs:16`

Both `harness-guards.mjs` import lists are alphabetical after the leading constant.
`assertNoEqualsFormFlags` is inserted before `assertNeutralAgentCwd`, and `Ne` sorts before `No`.

Required action: swap the two lines in both files.

## Items the reviewer checked and cleared

- Scope is clean. All eight modified files serve the block. No unrelated file changed, and
  `.agents/TODO.md` correctly stays untouched while the item is open.
- The shared guard is the right home. `eval/lib/harness-guards.mjs` already holds the paid-run
  guards both runners import, and the new function honours its purity contract.
- The error message matches the repository style exactly. It is byte-identical in shape to the
  message from `requiredPaidFlag` and `parseOptionalIdsFlag`.
- The guard runs before the `--ids` parser in the discovery preconditions, so a command carrying
  both an equals form and a bad `--ids` fails on the equals form. Both paths fail before spend.
- The nine flags in the two call lists match `.agents/TODO.md:178-181` exactly, with no addition
  and no omission.
- Zero paid or side-effecting calls occurred during this review.
- The ledger names the free `npm run eval:selftest` and never the paid `npm run eval:qa:selftest`.
- No secret, credential, or partner detail entered the diff.
- The two `parseOptionalIdsFlag` copies from the previous block remain duplicated. The previous
  ledger accepted that, and this block did not widen its scope to change it. Not a finding here,
  though the shared home this block created now makes the move cheap.

## Summary

| Severity | Count | Findings |
| --- | --- | --- |
| HIGH | 0 | — |
| MEDIUM | 2 | F1, F2 |
| LOW | 4 | F3, F4, F5, F6 |
| NIT | 1 | F7 |

The nine listed guards are correct, well placed, and well tested, and every gate the ledger claims
reproduces exactly. The block does not yet meet `.agents/TODO.md:191`, and the ten remaining equals
forms are recorded nowhere. Resolve F1 and F2, clear the LOW items, then request a closure review.
