# Paired QA collection supervisor and launch-gate repairs

Date: 2026-09-04

Lane: implementation. Model: Codex GPT-5.6 Sol.

Worktree: `/private/tmp/stellar-raven-tm-paired-supervisor`

## Outcome

Implemented the no-spend paired QA launch repairs. No QA answering call, judge call, paid self-test,
server process, deployment, issue, push, or merge occurred.

The new `qa-paired-collection-plan-v1` interface freezes the paired launch. The supervisor enforces
four distinct worktrees, exact ordered IDs, selected content identity, exact commands, binary and
environment pins, cumulative caps, shared cancellation, row barriers, and a four-hour deadline.
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
- exact answering, judge, adapter, probe, vector, register, runner, and printer hashes;
- identical load-bearing hashes across the two arms;
- one accepted two-agent capacity record with free evidence;
- `$80` answer-only collection and cumulative `$120` stored judging per arm;
- a `$240` two-arm cumulative total; and
- the fixed 14,400,000 ms collection deadline.

Both children finish free preflight before the supervisor releases the first row. The supervisor
releases row N+1 only after both children report row N complete. It alternates no shared mutable
repository state. Separate runner worktrees isolate result paths and same-second stamps.

A cancellation marker sits outside all four worktrees. `run-qa.mjs` checks it before every agent
spend authorization. This check also covers a same-row transport retry. IPC cancellation wakes a
child at a row or final barrier. An IPC disconnect fails closed before later authorization.

A guard failure or budget failure cancels both arms. An unexpected child exit or deadline also
terminates both child process groups. The final postflight barrier ensures that an arm suppresses
its aggregates when its peer fails before finalization. The supervisor writes no receipt or paired
aggregate on any failure.

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
- The ordered per-row barrier waits for both arms.
- The final postflight barrier waits for both arms.
- Four distinct worktrees and cumulative cap semantics are manifest-tested.

## Validation

| Command | Result |
|---|---|
| `./node_modules/.bin/vitest run test/qa-paired-collection-supervisor.test.mjs test/qa-paired-verdict.test.mjs test/qa-judge-stored.test.mjs test/qa-budget.test.mjs` | PASS, 4 files and 117 tests |
| Wider QA guard, probe, precondition, postflight, and measure tests | PASS, 5 files and 168 tests; the two listener tests needed the approved non-sandbox run |
| `npm test` | PASS, 106 files and 1,853 tests |
| `npm run eval:qa:paired:validate` | PASS, all deterministic gates true |
| `npm run eval:selftest` | PASS |
| `npm run eval:qa:lint -- --stale` | PASS, 0 errors and 62 existing warnings |
| `npm run typecheck` | PASS after the required local `.dev.vars` and `npm run typegen` setup |
| `npm run build` | PASS |
| `npm run secrets:scan -- --tree` | PASS before this report; rerun after the report before commit |
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

The second pass found an IPC lifecycle defect. The message listener could keep a successful child
alive. The child now closes IPC only after its result path reaches the supervisor.

The third pass found that the manifest's recorded collection command omitted the injected control
flag. The manifest now records the exact executed command, including `--paired-control-arm`.

No reviewability finding remains open.

## Risks

- No real paired collection exercised provider processes. Tests use deterministic fake children
  and existing no-spend guard fixtures.
- A hard deadline terminates process groups. It guarantees no later spend or aggregate, but an
  in-flight child may not flush a partial artifact.
- Concurrent external rate limits remain an experimental condition. The manifest requires an
  accepted two-agent capacity record, but it cannot prove external capacity mechanically.
- Scout release cadence can still stop a valid arm. The supervisor makes that stop shared and
  fail-closed; it does not reduce the cadence.
- The Stellar Docs identity probe still has the reviewed 1,000-record enumeration ceiling.

## Blockers

No implementation blocker remains.

A paid launch remains blocked until an owner supplies a valid final manifest. The manifest needs
the final worktree paths, selected IDs, content hashes, exact commands, input hashes, capacity
evidence, stable remote vector, and authorization. This implementation grants no authorization.
