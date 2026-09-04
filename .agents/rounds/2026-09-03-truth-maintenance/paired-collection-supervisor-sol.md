# Paired QA collection supervisor and launch-gate repairs

Date: 2026-09-04

Lane: implementation. Model: Codex GPT-5.6 Sol.

Worktree: `/private/tmp/stellar-raven-tm-paired-supervisor`

## Outcome

Implemented the no-spend paired QA launch repairs and repaired findings F1 through F8. No QA answering call, judge call, paid self-test,
server process, deployment, issue, push, or merge occurred.

The new `qa-paired-collection-plan-v1` interface freezes the paired launch. The supervisor enforces
four distinct worktrees, exact ordered IDs, selected content identity, exact commands, binary and
environment pins, `.dev.vars` identity, cumulative caps, shared cancellation, row barriers, and a four-hour deadline.
It emits a receipt only after both collection artifacts finish and both child processes exit zero.

## Inputs read

- `AGENTS.md`
- `.agents/skills/run-evals/SKILL.md`
- `.agents/skills/audit-reviewability/SKILL.md` and its audit rubric
- `eval/EVALS.md`
- `eval/qa/README.md`
- `eval/qa/run-qa.mjs`
- `eval/qa/paired-verdict.mjs`
- Related QA, budget, guard, postflight, and paired-verdict tests
- `.agents/rounds/2026-09-03-truth-maintenance/remote-identity-guard-review-opus.md`
- `revised-impact-measurement-fable.md` from commit `f101cee`
- `revised-impact-measurement-review-sol.md` from commit `4cf622b`

The two revised-impact reports were absent from this branch. I read their committed Git objects
without changing the branch or worktree.

## Implemented contracts

### Cross-arm ports

`paired-verdict.mjs` now compares the adapter revision and implementation hash across arms. It no
longer requires the baseline and candidate to use the same ports. Each artifact still validates
its own public port, upstream port, preflight listener pair, postflight listener pair, listener
guard, adapter attestation, and postflight adapter attestation. Repeats within one arm must keep
that arm's port pair.

### Paired collection supervisor

Added `eval/qa/paired-collection-supervisor.mjs` and
`eval/qa/paired-collection-control.mjs`. Added the command:

```sh
npm run eval:qa:paired:collect -- --plan /absolute/path/to/paired-collection-plan.json
```

The manifest validator requires:

- four distinct Git worktrees from one repository;
- one exact ordered ID array and its SHA-256;
- one cases-file SHA-256 and selected-content SHA-256;
- exact collection, stored-judge, and paired-comparison commands;
- exact answering, judge, adapter, probe, vector, register, runner, printer, supervisor, and control hashes;
- different exact server revisions and surface hashes;
- one shared adapter revision and shared measurement flags;
- baseline `add-missing` and candidate `verify-native` adapter modes;
- four pairwise-distinct public and upstream ports;
- sorted `.dev.vars` names and one canonical name-value SHA-256, without values;
- identical load-bearing hashes across the two arms;
- one accepted two-agent capacity record with free evidence;
- `$80` answer-only collection and cumulative `$120` stored judging per arm;
- a `$240` two-arm cumulative total; and
- the fixed 14,400,000 ms collection deadline.

Both children finish free preflight before the supervisor releases the first row. The supervisor
releases row N+1 only after both children report row N complete. The first release alternates
between baseline and candidate by row index. Separate runner worktrees isolate result paths.

A cancellation marker sits outside all four worktrees. `run-qa.mjs` checks it before every agent
spend authorization. This check also covers a same-row transport retry. IPC cancellation wakes a
child at a row or final barrier. An IPC disconnect fails closed before later authorization.

A guard failure or budget failure cancels both arms. Every cancellation starts a bounded drain.
The supervisor then sends `SIGTERM`, waits 5,000 ms, sends `SIGKILL`, and settles without exit events.
The no-new-spend marker remains after forced settlement. The final postflight barrier ensures that an arm suppresses
its aggregates when its peer fails before finalization. The supervisor writes no receipt or paired
aggregate on any failure.

The supervisor waits for IPC closure after child exit. This wait lets a buffered completion message
arrive before the exit decision. The receipt records the validated plan SHA-256 and all required
collection timestamps. Each reported artifact must exist below its arm runner results directory.

### Stored judging

`judgeStoredResults` now requires `meta.comparable === true`. Missing, null, string, numeric, and
false stamps stop before a judge call.

Stored judging resumes the collection ledger. The approved shape raises the artifact cap from
`$80` to `$120`. It does not reset the ledger to `$40`. The manifest rejects a judge command that
does not carry the cumulative arm cap.

### Paired judge identity

The paired tuple now includes full stored-judge binary and environment stamps. Every collection
and judge identity must contain a valid lowercase SHA-256, the same expected SHA-256, and
`matches: true`. The judge identity must equal the collection identity within each artifact.
The complete identity tuple must then match across both arms.

### Preserved behavior

The change is forward-only. It adds no legacy artifact acceptance or alternate format. Old
artifacts without strict identity stamps fail closed.

The invalid key-fact coverage share stays retired. Its old keys remain outside the paired tuple.
The existing retirement tests still pass.

The remote identity guard contract is unchanged. The paired printer still requires its complete
probe, vector, capture chain, postflight, and no-resume record. Guard and probe tests still pass.

## Tests added or changed

- Valid different baseline and candidate port pairs now pass.
- Artifact public-port drift and listener upstream-port drift fail.
- Missing and malformed `meta.comparable` stamps stop stored judging before any stub call.
- A stored-judge binary mismatch makes the pair `INDETERMINATE`.
- A guard stop cancels both arms and returns no receipt.
- A budget stop cancels both arms and returns no receipt.
- An unexpected child exit cancels and terminates both arms.
- The four-hour deadline cancels and terminates both arms.
- A missing exit event cannot keep the supervisor pending.
- Closed IPC and missing processes do not break cancellation.
- Malformed IPC data and failed realpath checks cause shared hard cancellation.
- Buffered completion after exit succeeds when IPC then closes cleanly.
- The ordered per-row barrier waits for both arms.
- The first released arm alternates by row.
- The final postflight barrier waits for both arms.
- Four distinct worktrees and cumulative cap semantics are manifest-tested.
- Command, revision, mode, port, `.dev.vars`, and control-byte mismatches fail before collection.
- Missing, malformed, and mismatched judge identity stamps fail comparison.

## Validation

| Command | Result |
|---|---|
| `./node_modules/.bin/vitest run test/qa-paired-collection-control.test.mjs test/qa-paired-collection-supervisor.test.mjs test/qa-paired-verdict.test.mjs test/qa-judge-stored.test.mjs test/qa-harness-preconditions.test.mjs` | PASS, 5 files and 229 tests |
| `npm test` | PASS, 107 files and 1,886 tests |
| `npm run eval:qa:paired:validate` | PASS, all deterministic gates true |
| `npm run typecheck` | PASS |
| `npm run build` | PASS |
| `npm run secrets:scan -- --tree` | PASS, no leaks |
| `git diff --check` | PASS |

The first direct `npx vitest` attempt did not start. This worktree had no `node_modules`, and the
sandbox blocked registry access. I reused the existing installation from the runner worktree.

The first typecheck used an incomplete generated `env.d.ts` and failed on missing Worker bindings.
I followed `AGENTS.md`: created the ignored CI-name `.dev.vars`, ran `npm run typegen`, and reran
typecheck successfully. Wrangler could not write its user-home debug log, but it wrote `env.d.ts`
and exited successfully.

## Reviewability audit

I audited the complete diff from `HEAD` in repair mode. The first pass found a finalization race.
One arm could retain aggregates if its peer failed during postflight. The added final postflight
barrier closes that race.

The second pass found an IPC lifecycle defect. The child now closes IPC only after completion
delivery. The supervisor waits for IPC closure before it decides whether an exit succeeded.

The third pass found that the manifest's recorded collection command omitted the injected control
flag. The manifest now records the exact executed command, including `--paired-control-arm`.

The repair audit used commit `79080bd` as its fixed point. It found one additional cleanup risk.
A forced settlement could remove the no-new-spend marker before a missing child confirmed exit.
The failure path now keeps that marker. No reviewability finding remains open.

## Risks

- No real paired collection exercised provider processes. Tests use deterministic fake children
  and existing no-spend guard fixtures.
- A failed run keeps its temporary cancellation directory. This can leave a small stale directory.
  The retained marker protects against later spend by a missing child.
- A hard stop can prevent an in-flight child from flushing a partial artifact.
- Concurrent external rate limits remain an experimental condition. The manifest requires an
  accepted two-agent capacity record, but it cannot prove external capacity mechanically.
- Scout release cadence can still stop a valid arm. The supervisor makes that stop shared and
  fail-closed; it does not reduce the cadence.
- The Stellar Docs identity probe still has the reviewed 1,000-record enumeration ceiling.

## Blockers

No implementation blocker remains after the F1 through F8 repairs.

A paid launch remains blocked until an owner supplies a valid final manifest. The manifest needs
the final worktree paths, selected IDs, content hashes, exact commands, input hashes, capacity
evidence, stable remote vector, and authorization. This implementation grants no authorization.
