# Remote identity guard review

Date: 2026-09-04

Reviewer lane: Claude Opus 5, high effort

Author lane: Codex GPT-5.6 Sol, high effort

Commit under review: `2ca588080c4ae9097aff66f79ff1a2dcc20126b5`

Branch: `codex/tm-remote-identity-guard`

Worktree: `/private/tmp/stellar-raven-tm-remote-guard`

## Verdict

`CHANGES-REQUIRED`

The guard logic is correct. I verified every rejection path myself.
The commit does not yet deliver a usable paid-measurement control.
Three blockers remain. Seven further findings need repair before a paid arm.

## Method

I read the diff before the author report.
I read `AGENTS.md`, the run-evals skill, and the stop audit.
I read the full collection loop, the spend ledger, and the judge path.
I then wrote adversarial probes and a temporary test file.
I deleted every temporary file. The tree is clean.

The stop audit lives only in the root checkout.
This branch does not carry `post-candidate-stop-audit-sol.md`.
I read the root copy and edited nothing there.

## Commands

| Command | Result |
|---|---|
| `npx vitest run test/qa-remote-identity-guard.test.mjs test/qa-paired-verdict.test.mjs test/qa-harness-preconditions.test.mjs` | PASS, 149 tests |
| `npm run typecheck` | PASS |
| `npm test` | PASS, 104 files, 1,786 tests |
| `npm run build` | PASS |
| `npm run eval:qa:paired:validate` | PASS, all gates true |
| `npm run secrets:scan -- --tree` | PASS, no leaks |

I ran no paid command. I started no QA collection.
I made no answering-agent call and no judge call.

## What the commit gets right

I confirmed each item below by reading code or by running a probe.

The vector carries the exact six fields the stop audit demands.
`exactKeys` rejects any extra field. It therefore rejects timestamps.
`parseRemoteIdentityVector` normalizes field order before hashing.
The comparison is byte-exact per service.

The runner captures one vector before each answering call.
It captures a second vector after that call.
Each before-vector must equal the baseline vector.
Each after-vector must equal its paired before-vector.
The chain makes all captures equal across the whole arm.

Every paid call has a comparison immediately before it.
The judge for row N runs after the after-comparison for row N.
`run-qa.mjs:1807` skips the judge when `stopError` is set.
The attempt loop breaks, so no retry starts.

The spend-ledger order is correct.
`authorizeSpend` reserves nothing and writes no ledger entry.
An early guard stop therefore leaves no dangling authorization.
The runner records the spend before the after-probe runs.
A paid call that completes always reaches the ledger.

The stop preserves partial work.
Completed rows stay in `rows`. Later IDs land in `meta.unattemptedIds`.
`applyCollectionComparability` sets `comparable: false`.
It clears `summary` and `metrics`.
`meta.aggregatesSuppressed` becomes `true`.

Resume is blocked. `assertActive` closes the guard instance.
`judgeStoredResults` refuses a non-comparable artifact at `run-qa.mjs:1179`.

The probe pin is re-checked before every capture.
I replaced the probe bytes after pinning. The next capture failed closed.

The paired printer is strict. I mutated eight guard fields on a candidate.
Every mutation produced `remote-identity-guard` and `INDETERMINATE`.
The mutations covered a missing record, `matches: false`, a present failure,
a probe hash mismatch, an allowed resume, a short capture count, a low call
count, and a drifted final vector.
A pre-guard artifact therefore cannot enter a pair.

`collectionTuple` compares `probeSha256` and `baselineVector` across arms.
Both arms must share one probe and one remote identity.

## Blockers

### B1. The repository commits no production-ready probe executable

`eval/qa/run-qa.mjs:1629` requires `--remote-identity-probe`.
No probe exists in the tree. `git ls-files` finds none.
The guard therefore cannot run today.

The probe holds every load-bearing measurement rule.
`eval/qa/README.md` states those rules in prose only.
The prose asks the probe to sort object keys recursively.
It asks the probe to sort set-like arrays before hashing.
It asks the probe to omit volatile telemetry.
No code implements those rules. No test checks them.

Two operators will produce two different `canonicalOpenapiSha256` values.
The stop audit requires three pre-arm probes at least five minutes apart.
It requires all three vectors to match exactly.
No committed command performs that check.

**A committed production-ready probe executable is required.**
The stop audit gates a new authorization on a landed, tested guard.
A guard whose measurement definition lives outside the repository is not landed.
The probe must ship with its own tests and its own canonicalization code.

### B2. The probe inherits the full parent environment

`eval/qa/remote-identity-guard.mjs:126` calls `spawnSync` with no `env` option.
The child therefore receives every parent variable.
I verified this. A test probe printed a secret I set in the parent shell.

The QA shell holds Claude credentials and repository secrets.
An unreviewed operator script would receive all of them.
It would receive them about 1,000 times in a 500-case arm.
`AGENTS.md` requires secrets to stay host-side.

The probe also runs outside the spend ledger.
`meta.budget` has no line for probe cost.
A probe that called a paid endpoint would spend invisibly.
The documents forbid paid probe calls. Nothing enforces that rule.

Pass an explicit minimal `env` allowlist to `spawnSync`.
Commit the probe so a reviewer can confirm it makes free calls only.

### B3. The remote guard has no postflight capture

The local guard rechecks its identity after collection.
`run-qa.mjs:1909`, `:1919`, and `:1941` recompute the listener, adapter, and source.
`run-qa.mjs:1943` only reads the remote record. It captures nothing.

The last remote capture happens before the last row's judge calls.
The stop audit requires the vector to stay unchanged through both postflights.
An upstream change during final judging or postflight stays invisible.

Add a postflight capture. Compare it against the baseline vector.
Record it in `meta.remoteIdentityGuard`. Feed a mismatch into `comparabilityReasons`.

## Further findings

### F4. The runner cannot pin the pre-arm vector

The stop audit requires three matching pre-arm vectors.
The runner never compares its baseline against that result.
It accepts whatever the first capture returns.

Add `--expect-remote-identity-sha256` as a required collection pair.
Fail closed when the baseline vector hash differs.
This makes pre-arm criteria 5 through 7 machine-enforced.

### F5. The after-capture masks the primary error

`remote-identity-guard.mjs:300` calls `guard.afterCall` inside `finally`.
A throw there replaces the error from the paid call.
I verified this. A `BUDGET-EXHAUSTED-PRIMARY-CAUSE` error disappeared.
The surfaced error carried no `cause`.

This breaks the incomplete-ID accounting.
`run-qa.mjs:1874` adds a row to `incompleteIds` only for budget error types.
A budget stop that coincides with a guard stop loses that classification.
The artifact then reports a budget-stopped row as complete.

Attach the primary error as `cause`. Re-throw the primary error first.

### F6. `completedAnsweringCalls` counts calls that never completed

`remote-identity-guard.mjs:243` increments the counter before the after-capture.
`afterCall` runs from `finally`, so a thrown paid call also increments it.
I verified this. A call that threw still reported one completed call.
That call recorded no spend and produced no row.

The paired invariant still holds, because the count only grows.
The field name still overstates what it measures.
Increment the counter only after a paid call returns a result.

### F7. The paired guard gate has no committed test

`paired-verdict.mjs:252` emits the `remote-identity-guard` reason.
No committed test asserts that reason code.
The one new paired test mutates both vectors together.
It therefore trips `measurement-tuple` instead.

I proved the eight rejection paths by hand.
The logic is correct today. A regression would pass CI silently.
Add table-driven tests for the eight mutations I listed above.

### F8. The real probe path is almost untested

One committed test exercises `captureRemoteIdentity`. It covers invalid JSON only.
Every other path uses an injected `capture` function and a fake probe identity.

I verified these paths by hand. All fail closed:
a tampered probe, exit status 3, a 300 ms timeout, a 2 MB stdout overflow,
a missing file, and a directory path.
A valid end-to-end capture has no test at all.

Add tests for each path. Include one happy path through the real `spawnSync`.

### F9. Probe failures give the operator no diagnostic

Three distinct faults collapse into one message.
A timeout, a non-zero exit, and a buffer overflow all say
"remote identity probe did not complete successfully".
A missing file and a directory both say "probe executable is unavailable".

A stopped arm may have consumed $190 or more.
The operator gets no exit status, no signal, and no path.
Report `result.status`, `result.signal`, and a timeout flag.
Those values carry no secret.

### F10. A transient upstream fault ends a paid arm permanently

The timeout defaults to 60 seconds. No CLI flag changes it.
The guard performs no retry, which the stop audit demands.
One network blip in any of three services stops the arm.
No resume is possible under the same authorization.

The stop behavior is correct and required. The risk is still severe.
The probe must therefore own bounded internal retries.
It must emit one vector only after it reaches all three services.
This keeps the guard fail-closed and survives a blip.
This is a further reason to commit and review the probe.

### F11. The artifact stores an absolute local path

`remote-identity-guard.mjs:268` copies `probeIdentity` into the record.
That object holds `resolvedPath`.
Result files are gitignored, but reviewers attach them to round notes.
Store the probe hash only, or store a repository-relative path.

### F12. `eval/EVALS.md` is not updated

The stop audit lists `eval/EVALS.md` in its required updates.
It must define remote-service stability as part of comparability.
It must explain that listener stability alone is insufficient.
The commit updates `eval/qa/README.md` and the run-evals skill only.
`eval/EVALS.md` contains no remote identity text.

## Pre-existing observations

`judgeStoredResults` tests `meta?.comparable === false` at `run-qa.mjs:1179`.
An artifact with an absent `comparable` field would pass.
The runner always writes the field, so no live artifact is affected.
A `!== true` test would be safer.

`--judge-stored` does not require the probe pins.
The judge never uses MCP. `buildJudgeArgs` passes `--strict-mcp-config` with no servers.
A judge verdict therefore does not depend on remote identity.
I accept this narrowing. The comparability gate already blocks a stopped artifact.

## Risks

An operator can satisfy every committed gate with a wrong probe.
The runner checks the probe bytes, not the probe meaning.
A probe that hashed a volatile field would stop a healthy arm.
A probe that hashed too little would pass a mixed-upstream arm.
Only a committed, reviewed probe removes this risk.

The guard adds about 1,000 probe runs per 500-case arm.
Each run re-hashes the probe file and spawns a process.
The operator must budget that wall-clock cost.

The `captures` array grows to about 1,000 entries per arm.
Each entry holds a phase, an ID, an attempt, and a hash.
The artifact grows by roughly 120 KB. This is acceptable.

## Blockers for the next paid authorization

1. Commit a production-ready probe executable with tests (B1).
2. Restrict the probe environment and prove the probe makes free calls only (B2).
3. Add a postflight remote capture and feed it into comparability (B3).
4. Pin the pre-arm vector with a required flag (F4).
5. Repair the error masking and the call counter (F5, F6).
6. Add the missing paired and probe tests (F7, F8).
7. Improve probe diagnostics and probe-side retries (F9, F10).
8. Update `eval/EVALS.md` (F12).

The stop audit keeps the baseline arm stopped for other reasons too.
The Scout `1.9.30` drift decision is still open.
The full candidate row review is still incomplete.
This review does not lift either block.

## Definition-of-done check

| Item | Result |
|---|---|
| Diff scoped, unrelated work preserved | PASS |
| Proportionate tests pass | PASS, with the gaps in F7 and F8 |
| Required gates pass | PASS |
| Generated artifacts from scripts | PASS, none changed |
| Secrets scanning | PASS |
| Independent review completed | This document |
| Documentation matches behavior | FAIL, see F12 |
