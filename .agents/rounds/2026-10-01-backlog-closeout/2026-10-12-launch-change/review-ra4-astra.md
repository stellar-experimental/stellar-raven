# Review RA4

I reviewed `566ced81..13517f7e` at `13517f7ead1d67727fd3ea970364f5201fbe3730`.
I read the RA3 finding and the author's reconciliation.
I made no paid call or upstream call.
I started no server and ran no launcher, capacity check, or remote identity probe.
I edited only this report.

## Findings by severity

I found no blocking defect in this delta.
The RA3 P1 finding is fixed and has relevant regression tests.
The full launch test file still fails under this sandbox's process restrictions.
The verification section records that limit.

## RA3 reconciliation

`boundServerIdentity` returns numeric PIDs at `eval/lib/bound-server-identity.mjs:85`.
The validator now requires positive safe integers at lines 168 and 195.
The strict identity comparison therefore accepts the production reader's serialized output.
It continues to reject a different PID.

`test/helpers/paired-plan-fixtures.mjs:116` now supplies numeric PIDs.
Its command-output helper at line 129 supplies fixed `lsof` and `git` output.
The new tests inject that output below the production identity parser.
They no longer reproduce the faulty string assumption in both producer and consumer.

| Requirement | Evidence and result |
| --- | --- |
| Accept production records | `test/qa-paired-server-check.test.mjs:135` exercises JSON serialization and all four consumers. The tests pass. |
| Stop after listener loss or replacement | The same group tests P6, the supervisor, and paired QA with missing listeners and changed PIDs. The tests pass. |
| Accept records in the launcher | `test/qa-paired-launch.test.mjs:680` accepts the production record, then rejects listener loss. The test passes. |
| Accept records during assembly | `test/qa-paired-launch.test.mjs:833` assembles the production record and checks its digest. The test passes. |
| Preserve the toolchain record | `test/qa-paired-launch.test.mjs:618` reads installed packages and verifies the JSON round trip. The test passes. |

## Unpaired QA behavior

`run-qa.mjs` has no changes in this delta.
I also compared its listener-check change against `830a35b4`.

`createPairedRunCheck` requires `pairedControl` before reading current listeners (`eval/qa/run-qa.mjs:1069`).
For unpaired runs, the production callback only returns the local `listenerPair` value.
That operation introduces no failure path.
Stored judging returns before this setup at line 1727.

The retry extraction retains the two-attempt limit, retry condition, and returned error.
The CLI parser and flag requirements remain unchanged.
The existing unpaired regression passes.
An additional offline check confirmed retry and error behavior with both null and populated listener references.

## Missing records, stale records, and P6

Assembly reads the record without a fallback at `assemble-paired-plan.mjs:97` in the round directory.
The launcher does the same at `paired-launch.mjs:77`.
Their validation uses independent collection targets.

P6 reads and verifies the record at `eval/qa/run-p6-judge-self-test.mjs:321`.
The supervisor verifies its digest and targets at `eval/qa/paired-collection-supervisor.mjs:787`.
A missing file throws before a paid call or row release.
A changed file fails its signed digest check.
A stale PID fails comparison with the current listener.
The record must contain both arms and four distinct ports and processes.

P6 and the supervisor retain their validated identities in memory.
Later file deletion cannot disable their checks or replace those references.
I confirmed this with injected reads and production identity parsing.
Both checks still rejected missing listeners and changed PIDs after simulated file deletion.

Paired QA captures its own listener pair at `eval/qa/run-qa.mjs:1821`.
It does not depend on `listeners.json`.
The supervisor requires the adapter flags before collection (`eval/qa/paired-collection-supervisor.mjs:498`).

Assembly includes both listener flags at `assemble-paired-plan.mjs:123` in the round directory.
The P6 parser requires the path and digest together (`eval/qa/run-p6-judge-self-test.mjs:293`).
The supervisor requires the absolute path, digest, matching record, and exact command (`eval/qa/paired-collection-supervisor.mjs:309`).
The parser and plan-validation tests pass.
I found no mismatch between these contracts.

## Retained protections and limits

The delta preserves the shared-toolchain implementation and its signed plan record.
The toolchain tests still reject environment overrides and mismatched identities.
The answering tests stop retries after listener loss.
The P6 test stops before its second simulated paid call.

The run sheet states the treatment change and requires a fresh signed plan.
Its amendment retains the socket-check, sequential-read, concurrent-call, restart, and timeout limits.
The TODO text remains consistent with that amendment.
This review provides no live-server evidence.

## Offline verification

I ran each command directly, without a pipe.

| Command | Result |
| --- | --- |
| `node_modules/.bin/vitest run test/qa-paired-launch.test.mjs test/qa-paired-collection-supervisor.test.mjs test/qa-paired-server-check.test.mjs test/p6-judge-self-test.test.mjs test/qa-remote-identity-guard.test.mjs test/qa-harness-preconditions.test.mjs` | Exit 1; 370 passed, 29 failed. |
| `node_modules/.bin/vitest run test/qa-paired-launch.test.mjs -t 'paired server toolchain\|paired server listener stop\|paired plan assembly'` | Exit 0; 22 passed, 46 skipped. |
| `node_modules/.bin/vitest run test/qa-paired-collection-supervisor.test.mjs test/qa-paired-server-check.test.mjs test/p6-judge-self-test.test.mjs test/qa-remote-identity-guard.test.mjs test/qa-harness-preconditions.test.mjs` | Exit 0; 331 passed. |
| `git diff --check 566ced81..13517f7e` | Exit 0. |
| Additional `node --input-type=module` assertions | Exit 0. Production serialization, missing files, invalid PIDs, retained references, listener loss, and unpaired behavior passed. |

All 29 failures came from the launch test file.
They include `spawnSync ps EPERM` and child fixtures that never created their expected files.
The failure pattern matches RA3's sandbox restriction.
I cannot confirm that the full launch file passes here.
The focused run covers every changed launch test.

CODE: APPROVE
