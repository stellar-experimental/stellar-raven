# Review RA3

I reviewed `8818b885..566ced81` at `566ced81961d2ecb06cf8c6786e4bbd28d32f1d2`.
I read the RA2 findings and the author's reconciliation.
I made no paid call or upstream call.
I started no server and ran no launcher, capacity check, or remote identity probe.
I changed only this report.

## Findings by severity

### P1: The new validator rejects every real listener record

`eval/lib/bound-server-identity.mjs:192` requires both listener PIDs to be strings.
However, `boundServerIdentity` returns `pid: Number(pid)` at line 85.
`dualBoundServerIdentity` preserves those numbers.
The launcher writes those identities directly into `listeners.json` at `.agents/rounds/2026-10-01-backlog-closeout/paired-launch.mjs:158`.
JSON serialization preserves the numeric type.

Thus, a normal launch fails during plan assembly at `.agents/rounds/2026-10-01-backlog-closeout/assemble-paired-plan.mjs:98`.
It reports `baseline listener record is not a recorded listener pair`.
The launcher check, P6 setup, and supervisor check also reject these valid records.
The launch cannot reach P6 or collection.

The new shared fixture hides this defect.
`test/helpers/paired-plan-fixtures.mjs:116` creates `pid: String(port)`.
The affected tests use that fixture for both recorded identities and simulated current identities.
They therefore pass with a type that the production reader never returns.

I reproduced the defect without a server, file write, process lookup, or network request.
I called the production `dualBoundServerIdentity` with an injected `spawnSyncImpl`.
The injected function returned fixed `lsof` and `git` output.
I serialized and parsed the resulting record, as the launcher does.

| Check | Result |
| --- | --- |
| Production reader PID types | Four numbers |
| `pairedListenerPairs(record, targets)` | Rejects the baseline pair |
| P6 `pairedListenerCheck` with the correct digest | Rejects the baseline pair |
| Supervisor `createServerListenerCheck` with the correct digest | Rejects the baseline pair |
| String-converted record against the production reader | Rejects the changed PID type |

Converting the file's PIDs to strings cannot fix the launch.
`assertStableBoundServerIdentity` uses strict comparison at `eval/lib/bound-server-identity.mjs:95`.
It rejects the string record when the production reader returns numbers.

Require positive integer PIDs in the validator and use numeric PIDs in the fixtures.
Add an offline regression that feeds serialized production-reader output into the new checks.
Inject command output at `spawnSyncImpl`, rather than replacing the identity producer with the same fixture.

## RA2 reconciliation

The change implements the requested record binding and target validation.
The PID defect prevents operational approval.

| RA2 requirement | Evidence and result |
| --- | --- |
| Require both arms | `pairedListenerPairs` requires exactly `baseline` and `candidate`. Missing-arm and extra-arm tests pass. |
| Reject repeated pairs | The validator requires four distinct ports and processes. The repeated-pair tests pass. |
| Restore independent launcher targets | `assertServersUnchanged` passes `listenerTargets(env)` into validation. The substituted-port tests pass. |
| Bind the record to the signed plan | The assembler records `p6.listenersSha256`. P6 and the supervisor verify that digest. Changed-content tests pass. |
| Compare the record with collection targets | The assembler shares one target table with its commands. The supervisor derives targets from those commands. |

The prior RA protections remain present.
The answering-attempt tests stop retries and calls after listener loss.
The P6 test stops after its first simulated paid call.
The toolchain tests reject the binary overrides.
The run sheet retains the socket, timing, concurrent-call, restart, and timeout limits.

## Unpaired QA behavior

`run-qa.mjs` has no changes in this delta.
I also checked its earlier listener-check change against `830a35b4`.

`createPairedRunCheck` requires `pairedControl` before it reads current listeners (`eval/qa/run-qa.mjs:1069`).
For an unpaired run, its production closure only returns the local `listenerPair` value.
That closure adds no operation that can fail.
Stored judging returns before this setup.
The retry extraction preserves the two-attempt limit, retry condition, and error result.

I found no new unpaired listener check, required flag, or reachable failure path.
The unpaired regression test passes.
Paired collection captures its listener pair directly; it does not depend on `listeners.json` inside `run-qa.mjs`.
The supervisor requires the adapter flags before collection.

## Missing records, stale records, and the P6 contract

A missing record fails during assembly, launcher checking, P6 setup, or supervisor record loading.
I separately confirmed missing-file rejection in P6 and the supervisor with injected read errors.
A changed file fails its signed digest check.
A stale recorded PID fails comparison with the current listener.
I confirmed that comparison with the existing string fixtures, subject to the production mismatch above.

P6 and the supervisor retain validated identities in memory.
Later file deletion or replacement cannot replace those references or disable their listener checks.

The assembler, P6 parser, and supervisor agree on both flags and their values.
P6 requires `--paired-listeners` and `--expect-paired-listeners-sha256` together.
The supervisor requires the absolute path, valid digest, matching record, and exact frozen command.
The plan contract is consistent, but all consumers share the faulty PID validator.

## Offline verification

I ran these commands directly, without a pipe.

| Command | Result |
| --- | --- |
| `node_modules/.bin/vitest run test/qa-paired-launch.test.mjs test/qa-paired-collection-supervisor.test.mjs test/p6-judge-self-test.test.mjs test/qa-paired-server-check.test.mjs test/qa-remote-identity-guard.test.mjs test/qa-harness-preconditions.test.mjs` | Exit 1; 355 passed, 29 failed. |
| `node_modules/.bin/vitest run test/qa-paired-launch.test.mjs -t 'paired server toolchain\|paired server listener stop\|paired plan assembly'` | Exit 0; 19 passed, 46 skipped. |
| `node_modules/.bin/vitest run test/qa-paired-collection-supervisor.test.mjs test/p6-judge-self-test.test.mjs test/qa-paired-server-check.test.mjs test/qa-remote-identity-guard.test.mjs test/qa-harness-preconditions.test.mjs` | Exit 0; 319 passed. |

The full launch file encountered `spawnSync ps EPERM` in process-management tests.
Related child fixtures timed out before creating their expected files.
These failures match the earlier sandbox restriction.
I cannot confirm that the full launch file passes here.
The focused run covers every changed launch test.
The independent production-reader reproduction confirms the PID defect despite those passing tests.

CODE: CHANGES: Accept production numeric PIDs and test serialized production listener identities through the new checks.
