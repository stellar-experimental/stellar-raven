# Review RA2

I reviewed `830a35b4..8818b885` at `8818b8857fdb6fc9d1aec15298a8c17dfc78ef16`.
I read the RA findings and the author's reconciliation.
I made no paid call or upstream call.
I started no server and ran no launcher, capacity check, or remote identity probe.
I edited only this report.

## Findings by severity

### P2: The listener record can omit or substitute the servers that P6 must check

Evidence: `eval/qa/run-p6-judge-self-test.mjs:307` accepts any nonempty set of listener pairs.
It does not require exactly `baseline` and `candidate`.
It does not compare their ports, revisions, or worktrees with the signed collection plan.
`eval/lib/bound-server-identity.mjs:147` uses the record itself to select the ports and expected revisions.

The launcher also lost an independent target check.
`.agents/rounds/2026-10-01-backlog-closeout/paired-launch.mjs:78` now uses only the arm names from `listenerTargets(env)`.
Previously, it passed that function's expected ports and revisions to the identity reader.
It now uses the file's ports and revisions through the shared helper.

I reproduced two cases with an injected file reader and identity reader.
Neither reproduction used a file write, process lookup, server, or network.

| Record | Result | Checked ports |
| --- | --- | --- |
| Only `candidate`, with its valid pair | Accepted | `8788`, `8790` |
| Both arms contain the candidate pair | Accepted | `8788`, `8790`, twice |

Thus an incomplete or substituted record can leave the baseline ports unchecked throughout P6.
The duplicated-pair case also passes the launcher's new target selection.
The baseline can disappear, and the P6 checks still pass against the candidate processes.

`eval/qa/paired-collection-supervisor.mjs:322` requires an absolute record path.
Line 339 requires the same path in the exact P6 command.
Neither check validates the record contents against the plan.
The signed plan includes the path, but no listener-record digest or identities.
The supervisor's later collection checks cannot prevent earlier P6 calls.

The normal launcher creates a fresh record exclusively at `paired-launch.mjs:159`.
That protects the normal creation sequence, but does not make the later record checks reject substituted targets.
A missing file stops execution, and an old PID on a recorded port fails comparison.
I confirmed both failures with offline checks.
The remaining gap concerns missing arms and substituted targets, rather than ordinary PID changes.

Require both arms and validate all targets against independent launch or signed-plan values.
Bind the recorded identities or their digest to the signed plan before P6.
Add offline tests for missing arms, duplicated pairs, substituted ports, and changed record contents.
Keep the assembler, P6 parser, and supervisor contract consistent with that binding.

## Reconciliation of RA

| RA finding | Result |
| --- | --- |
| P1: A lost listener permits a paid retry | Fixed for the validated paired collection path. |
| P1: P6 has no check between calls | The checks exist and stop calls after a detected loss. Record validation remains incomplete, as described above. |
| P1: Documentation overstates the stop guarantee | The amendment now states socket, sequential-read, call-start, concurrent-call, restart, and timeout limits. |
| P2: An esbuild binary override bypasses identity recording | Fixed. The code rejects `ESBUILD_` and `MINIFLARE_` environment names before package resolution. |

`run-qa.mjs:1904` now checks the arm's listeners when it authorizes each attempt.
The remote identity guard repeats the check before the answering call and before subsequent probes.
The new tests prohibit a retry after listener loss and prohibit a call after loss during the preceding probe.
The error retains `paired-server-lost`; the existing child failure path reports it to the supervisor.
The supervisor cancels both arms.
I found no added server restart path.

The P6 loop calls `beforeCall` before each of its seven paid invocations.
Its new test stops after one paid invocation when the baseline listener disappears.
The override tests cover esbuild, workerd, and a miniflare runtime setting.

## Unpaired QA behavior

I found no new listener check, required flag, or reachable failure path for unpaired QA.
`createPairedRunCheck` reads the local closure, then skips identity checks when `pairedControl` is null.
The production closure only returns `listenerPair`; it performs no operation that can fail.
Stored judging returns before the new setup.
The extracted attempt loop preserves the existing retry condition, attempt limit, and error result.
The unpaired regression test confirms that the identity reader receives no call.

Paired collection does not read `listeners.json`.
It captures its listener pair directly before collection.
The supervisor requires adapter flags, so validated collection cannot reach paid calls with an absent pair.

## P6 plan consistency

The assembler and supervisor agree on the new flag, its ordering, and `p6.listenersPath`.
The tests reject a missing flag, a mismatched command path, and a relative plan path.
This syntax agreement passes; the record-content binding described above remains missing.

## Offline verification

I ran every command below directly, without a pipe.

| Command | Result |
| --- | --- |
| `node_modules/.bin/vitest run test/qa-paired-launch.test.mjs test/qa-paired-collection-supervisor.test.mjs test/p6-judge-self-test.test.mjs test/qa-paired-server-check.test.mjs` | Exit 1; 168 passed, 29 failed. |
| `node_modules/.bin/vitest run test/qa-paired-launch.test.mjs -t 'paired server toolchain\|paired server listener stop\|paired plan assembly'` | Exit 0; 15 passed, 46 skipped. |
| `node_modules/.bin/vitest run test/qa-paired-collection-supervisor.test.mjs test/p6-judge-self-test.test.mjs test/qa-paired-server-check.test.mjs test/qa-remote-identity-guard.test.mjs test/qa-harness-preconditions.test.mjs` | Exit 0; 307 passed. |

The full launch file encountered `spawnSync ps EPERM` in process-management tests.
Related child fixtures timed out before creating their expected files.
These match the earlier sandbox restriction; I cannot confirm that the full launch file passes here.
The focused run covers every changed launch test.

CODE: CHANGES: Validate and bind listener records to the signed targets; reject missing arms and substituted server pairs.
