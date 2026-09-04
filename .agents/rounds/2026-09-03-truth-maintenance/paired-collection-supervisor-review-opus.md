# Paired collection supervisor — independent review

Date: 2026-09-04

Reviewer: Claude Code, Opus 5, high effort.

Reviewed commit: `79080bd70f0a603daf422432cf4708bef522e389` ("eval: supervise paired QA collection").

Worktree: `/private/tmp/stellar-raven-tm-paired-supervisor`, branch `codex/tm-paired-supervisor`.

Author lane: Codex GPT-5.6 Sol. This reviewer differs from the author and from the design author.

I made no paid call, no network call, no deployment, and no product-code change.

## Verdict

CHANGES-REQUIRED.

All nine required behaviors are implemented, and I verified each one against running code.
None of my findings contradicts a required behavior.

One defect blocks a paid launch. A soft cancellation clears the four-hour timer and never
terminates the peer child. The supervisor can then wait forever on a wedged arm, with no watchdog
left and no operator signal (finding F1). A guard stop and a budget stop both take this path, and
those are the two stops the specification asked the supervisor to own.

One further repair is strongly recommended before authorization. The manifest freezes the command
arrays but never cross-checks the flags that separate the two arms or that must match across them.
A plan that passes validation can still spend the full two-arm collection budget and produce an
uncomparable pair (finding F2).

The other findings are hardening and test-coverage items.

## Method

I read the specification, the diff, and the tests before reading the implementation report.

The specification file named in the task is not on this branch. It exists as
`.agents/rounds/2026-09-03-truth-maintenance/revised-impact-measurement-review-sol.md` on
`codex/truth-maintenance-2026-09-03`. I read it from commit `3ac5bac` without changing the branch.

Order of work:

1. `AGENTS.md`, `.agents/skills/run-evals/SKILL.md`, and the specification from `3ac5bac`.
2. The complete `79080bd` diff.
3. The three changed or added test files.
4. The current source of `paired-collection-supervisor.mjs`, `paired-collection-control.mjs`,
   `paired-verdict.mjs`, `run-qa.mjs`, `spend-budget.mjs`, `executable-identity.mjs`,
   `harness-guards.mjs`, `lib.mjs`, and `exact-old-runtime-adapter.mjs`.
5. Eighteen adversarial probe cases, written in the scratchpad, run inside the repository root as
   five temporary files, then deleted. The tree is clean; no probe file was committed. Probe labels
   below are mine. Where a claim rests on a committed test instead, I say so.
6. `.agents/rounds/2026-09-03-truth-maintenance/paired-collection-supervisor-sol.md` last.

## Required behavior — verdict per item

| # | Required behavior | Result | Evidence |
|---|---|---|---|
| 1 | Different cross-arm ports valid; each arm keeps internally attested ports | MET | Committed tests plus probe B-3 |
| 2 | Supervisor: four worktrees, ordered IDs, per-row lockstep, shared cancellation, child exit, four-hour deadline, no receipt or aggregate on failure | MET, with F1 | Probes A-1, A-2, A-4, A-5, A-6; committed tests |
| 3 | Stored judging requires `meta.comparable === true` | MET | Committed test, source read |
| 4 | Judge binary and environment stamps: valid expected and match stamps, equality within and across arms | MET | Probes B-4, B-5 |
| 5 | `$80` per arm collection; the same ledger raised to `$120` for stored judging | MET | Source read of `resumeSpendLedger`, committed cap test |
| 6 | Launch manifest freezes commands, IDs, content, binary inputs, worktrees, capacity evidence | MET as a mechanism, with F2 and F6 | Probes C-3 … C-8, committed test |
| 7 | Guard, budget, child-exit, deadline, port, comparable, judge-hash tests are fail-closed | MET, with F4 | Test read plus full run |
| 8 | Remote identity guard and invalid coverage retirement preserved | MET | Diff scope check |
| 9 | No paid call | MET | See "No paid call" |

### 1. Cross-arm ports

`adapterPairingProblems` (`eval/qa/paired-verdict.mjs:386`) now compares only `adapterRevision` and
`implementationSha256` across all four artifacts. It compares the port pair inside each arm at
`eval/qa/paired-verdict.mjs:405`.

Every per-artifact port attestation survives in `adapterArtifactProblems`
(`eval/qa/paired-verdict.mjs:308`). The artifact must still satisfy all of the following:

- `publicPort !== upstreamPort`;
- `adapter.publicPort === meta.port`;
- `listenerPair` equals `listenerPairAfter`;
- `listenerPair.adapter.port === adapter.publicPort` and
  `listenerPair.upstream.port === adapter.upstreamPort`;
- `attestation` equals `attestationAfter`, with `attestation.upstream.port === adapter.upstreamPort`;
- `listenerPairGuard.matches === true` for both listeners.

Results:

- The committed test "accepts different internally attested port pairs across arms" shows baseline
  `8789/8791` with candidate `8788/8790` yields `PASS` with no `runtime-adapter-pairing` reason.
- The committed "artifact public port drift" and "listener private port drift" cases show that
  drifting `meta.port` alone, or drifting `listenerPair.upstream.port` alone, still fails.
- **B-3** (my probe) A two-look comparison whose baseline repeat changes its port pair produces
  `baseline runs do not keep one internally attested port pair`. The same pair with a stable port
  pair produces only `confidence-bounds-overlap`.

B-3 needed a constructed look-1 `confidence-bounds-overlap` (100 cases, four `correct`→`partial`
flips). `comparePairedArtifacts` (`eval/qa/paired-verdict.mjs:802`) analyzes look 1 alone first and
returns early under the repeat rule, so a naive two-run probe never reaches the intra-arm check.
The check is correct; it is only reachable on the legitimate repeat path.

### 2. Supervisor contracts

Verified by reading `supervisePairedChildren` (`eval/qa/paired-collection-supervisor.mjs:263`) and by
six probes against the exported function.

- **Four distinct worktrees.** `validatePairedCollectionPlan` requires four distinct
  `--show-toplevel` roots and one shared `--git-common-dir`. The committed test covers a duplicated
  server worktree; my probe fixtures confirm the accepting direction.
- **Exact ordered IDs.** The plan pins `selected.ids`, its SHA-256, the selected-content SHA-256,
  and the `cases.json` file SHA-256. Both runner worktrees must reproduce the ordered array and both
  hashes before either child starts. `run-qa.mjs:1721` filters `cases.json` in file order, and the
  validator requires the frozen order to equal file order, so the two orders cannot diverge.
- **Per-row lockstep.** The child sends `row-complete` and blocks
  (`eval/qa/paired-collection-control.mjs:74`). The supervisor releases `continue` to both children
  only when both reported the same index (`:352`). Probe A-1 confirms a wrong index cancels, and
  probe A-2 confirms a wrong ID at the right index cancels.
- **Shared cancellation.** `assertActive()` runs inside the spend authorizer at `run-qa.mjs:1846`.
  `runRemoteIdentityGuardedCall` calls `authorize()` before `guard.beforeCall` and before the paid
  call (`eval/qa/remote-identity-guard.mjs:443`), so no new authorization survives a cancellation.
  It also covers the same-row transport retry. Cancellation reaches the child by IPC, by the
  `wx`-created marker file, and by `process.on("disconnect")`
  (`eval/qa/paired-collection-control.mjs:41`), which is a correct dead-man switch if the supervisor
  dies. The children are `detached`, so a terminal interrupt does not reach them directly; the
  disconnect path is what stops them.
- **Child exit.** The committed test confirms an exit before a successful `complete` cancels and
  terminates both arms, for a non-zero status and for a signal.
- **Four-hour deadline.** `PAIRED_COLLECTION_DEADLINE_MS` is frozen and the plan must carry it.
  The timer hard-cancels. See F1 for the gap.
- **No receipt or aggregate on failure.** `complete()` is sent only when `comparable` is true
  (`run-qa.mjs:2200`), and `maybeResolve` additionally requires a clean exit from both children
  (`:298`). Probe A-4 confirms a `complete` that arrives before the postflight barrier cancels
  instead of resolving. Probe A-5 confirms a readiness record whose `selectedIdsSha256` does not
  match the plan cancels. I did not probe the duplicate-readiness branch; I read it only.
  On the failure path `main()` prints only `paired collection failed:` and sets exit code 1.

The finalization race the author describes is genuinely closed. If arm A reaches the postflight
barrier while arm B fails, A's `postflightComplete()` throws, `collectionError` is set,
`collectionComparabilityReasons` (`run-qa.mjs:1564`) records `collection failed: …`, and A writes a
non-comparable artifact with suppressed aggregates.

### 3. Stored judging comparability

`judgeStoredResults` now tests `results.meta?.comparable !== true` (`run-qa.mjs:1186`). The
committed test covers missing, `null`, `"true"`, and `1`, and asserts zero judge calls. The check
sits above every row loop and above the ledger resume, so no judge authorization can precede it.

### 4. Judge binary and environment stamps

`collectionTuple` carries both judge objects with `sha256`, `expectedSha256`, and `matches`
(`eval/qa/paired-verdict.mjs:166`). `artifactProblems` requires each of the four identities to have
a lowercase SHA-256, `expectedSha256 === sha256`, and `matches === true`, then requires the judge
stamps to equal the collection stamps inside the same artifact
(`eval/qa/paired-verdict.mjs:235`). Cross-arm equality follows from the tuple comparison at
`eval/qa/paired-verdict.mjs:460`, and `comparisonProblems` also rejects a null judge hash at `:476`.

The stamps are real and distinct. `meta.agentBinary` and `meta.agentEnvironment.inherited` are
written by the collection run (`run-qa.mjs:2176`, `:2182`). `meta.judgeBinary` and
`meta.judgeEnvironment` are written only by the stored-judge run (`run-qa.mjs:1339`) from that
run's own `assertExpectedExecutable` and `assertExpectedAgentEnvironment` results
(`run-qa.mjs:1657`). Both helpers return `{ …identity, expectedSha256, matches: true }` only after
an exact match (`eval/lib/executable-identity.mjs:56`). The comparison therefore genuinely binds
the judging host to the collection host.

Probe results:

- **B-4** Deleting `meta.judgeBinary` and `meta.judgeEnvironment` yields `binary-environment-pairing`.
  The `||` chain short-circuits before dereferencing, so there is no crash.
- **B-5** Each of `judgeBinary.matches = false`, a deleted `judgeBinary.expectedSha256`,
  `judgeEnvironment.matches = "true"`, `agentBinary.matches = false`, and a mismatched
  `agentEnvironment.inherited.expectedSha256` yields `binary-environment-pairing`.

### 5. Cumulative caps

The mechanism is correct. `judgeStoredResults` calls
`resumeSpendLedger(maxBudgetUsd, meta.budget)` (`run-qa.mjs:1210`). `resumeSpendLedger`
(`eval/qa/spend-budget.mjs:75`) rebuilds the prior calls, re-derives `reportedSpendUsd`, rejects a
ledger whose recorded total disagrees with its calls, and then sets `authorizedUsd` to the new cap.
`remainingBudgetUsd` is `max(0, 120 - collectionSpend)`, which is the cumulative behavior the
specification required.

A cap lower than the spend already recorded fails closed: `remainingBudgetUsd` returns 0 and the
first `authorizeSpend` throws `BudgetExhaustedError` before any judge call. The `$40` reset the
specification warned about therefore cannot silently overspend.

The validator requires `cumulativeUsd > collectionUsd`, requires each command to carry its own cap,
and requires `twoArmCumulativeUsd` to equal the sum. The committed test confirms a judge command
rewritten to `40` is rejected. The literal `80`/`120`/`240` values live in the manifest instance and in
`eval/qa/README.md` and `eval/EVALS.md`; the validator enforces the relation, not the constants.
That split is reasonable, because the manifest is the authorized artifact.

`--max-budget-usd` is required on every invocation (`run-qa.mjs:1650`), including `--judge-stored`,
so an unbudgeted judge run is impossible.

### 6. Launch manifest

The freeze itself is thorough. The plan pins the schema, the deadline, the ordered IDs and three
content hashes, four worktrees, ten input hashes, both per-arm commands, the comparison command, the
caps, and the capacity record. It re-reads and re-hashes `run-qa.mjs`, `paired-verdict.mjs`, the
adapter, the probe, and the stability register from each runner worktree. It requires every listed
hash to be equal across arms and requires the collection and judge binary and environment pins to
be one pin.

Command validation is genuinely fail-closed where it exists. `flagValue` requires a flag to occur
exactly once with a following value, which also rejects the `--flag=value` form. `--sample` is
forbidden. `command[0]` must resolve to `process.execPath`, and `command[1]` is hashed as the script,
so a Node pre-load flag cannot be smuggled into that slot. Probe C-3 confirms rejection of `--sample`,
a missing capacity record, cross-arm hash drift, a non-`execPath` argv[0], a wrong deadline, a
reordered `--ids` value, mismatched stability registers between the collection and judge commands,
and a mutated comparison command. Probe C-4 confirms a runner whose `cases.json` differs is rejected.

`QA_PAIRED_CANCELLATION_FILE` is injected into the child environment but does not match the
environment-identity name filter (`eval/lib/executable-identity.mjs:7`), so it does not perturb the
pinned environment hash. That exclusion is load-bearing and currently undocumented.

See F2 and F6 for what the manifest does not check.

### 7. Test discipline

Every committed test is fail-closed: each asserts a rejection, and the judge-stored tests assert an
empty call list. The suite passes. See F4 for coverage gaps.

### 8. Preserved behavior

`eval/qa/remote-identity-guard.mjs` and `eval/qa/exact-old-runtime-adapter.mjs` are untouched by
`79080bd`. The `run-qa.mjs` hunks are at lines 208, 238, 1181, 1680, 1765, 1819, 1958, 2009, 2152,
and 2169; the retirement logic at `run-qa.mjs:1335` and the constant at `:597` are outside every
hunk. The full remote-identity guard block in `artifactProblems`
(`eval/qa/paired-verdict.mjs:256`) is unchanged, and the new binary block was inserted above it. The
retirement assertions in `test/qa-judge-stored.test.mjs:238` still pass.

### 9. No paid call

I ran only the deterministic suites and simulators listed below. The supervisor tests use fake
children, the judge-stored tests use `stubJudge`, and `eval:qa:paired:validate` is a free simulator.
No `claude` process, no MCP server, and no upstream service was invoked.

## Findings

### F1 — BLOCKING. A soft cancellation removes the only watchdog and never stops the peer

`cancel()` calls `clearTimer(timer)` unconditionally
(`eval/qa/paired-collection-supervisor.mjs:285`) but only terminates the children when
`hard === true` (`:292`). `maybeReject` refuses to settle until every arm has exited (`:275`).

A `failed` message, an ordering violation, a readiness mismatch, and a duplicate readiness all take
the soft path. A guard stop and a budget stop are exactly the `failed` cases.

Consequence: after a soft cancellation the supervisor has no deadline, does not terminate the peer,
and never settles until the peer exits on its own. A wedged child leaves the supervisor pending
forever with no operator signal.

Probe **A-6** confirms all three parts. After a `failed` message, `clearTimer` had been called once,
the surviving child was never terminated, and the promise was still pending after the peer's exit.

Money risk is bounded, because the marker was written and the peer cannot authorize new spend. The
risk is an unbounded hang in the one component the specification added to own the stop rule (S3, P6:
"Stop both collections after any guard, budget, listener, process, or supervisor failure").

Repair: on any cancellation, start a bounded drain timer instead of clearing the watchdog outright.
When the drain timer fires, hard-terminate every arm that has not exited and reject. Keep the
existing hard path unchanged.

### F2 — STRONGLY RECOMMENDED. The manifest freezes the arm-distinguishing flags but never checks them

`validateCommand` (`eval/qa/paired-collection-supervisor.mjs:63`) checks `--ids`,
`--paired-control-arm`, `--no-judge`, `--judge-stored`, `--max-budget-usd`, and five `--expect-*`
hashes. It never inspects `--server-revision`, `--expect-sha256`, `--adapter-mode`,
`--adapter-revision`, `--upstream-port`, `--variant`, `--surface`, `--search-tool`, `--model`,
`--judge-model`, `--max-panel-cases`, or `--port`.

Probe results against a plan that otherwise validates:

- **C-5** Both arms pinned to the same `--server-revision`: accepted.
- **C-6** No `--server-revision` in either command: accepted.
- **C-7** `--variant A` for baseline and `--variant B` for candidate: accepted.
- **C-8** Identical `--port` for both arms: accepted.
- A plan with no runtime-adapter flag quartet at all: accepted (every probe fixture omitted them).

The cost of each differs. C-6 and C-8 fail free at preflight or at listener bind. C-5 is largely
mitigated: `adaptInitializeMessage` rejects `add-missing` against a server that reports a native
source revision (`eval/qa/exact-old-runtime-adapter.mjs:121`), so a same-revision pair fails free at
the first initialize.

C-7 is the expensive one. Two arms with different variants collect all rows successfully, and only
`paired-verdict` rejects them afterwards with `measurement-tuple`. The same holds for a divergent
`--model`, `--judge-model`, or `--max-panel-cases`, and for a plan that omits the adapter quartet
entirely, which produces artifacts the printer rejects with "does not contain the required runtime
adapter record". Each of those burns the full two-arm collection budget before anything objects.

The manifest is the pre-spend gate. Every one of these fields is already a post-hoc rejection
reason in the printer, so the check is a straight port of a known contract.

Repair, inside `validatePairedCollectionPlan`:

1. Require `--server-revision` in both collection commands, 40 lowercase hex, and different across
   arms.
2. Require `--expect-sha256` in both, and different across arms.
3. Require the adapter quartet in both, with `--adapter-mode add-missing` for baseline and
   `verify-native` for candidate, `--adapter-revision` equal across arms, and
   `--expect-adapter-sha256` equal to `inputHashes.adapterImplementationSha256` (already checked).
4. Require cross-arm equality for `--variant`, `--surface`, `--search-tool`, `--model`,
   `--judge-model`, and `--max-panel-cases`, present-or-absent alike.
5. Require the four ports (`--port` and `--upstream-port` for both arms) to be pairwise distinct.

### F3 — An `exit`-before-`message` race can discard a valid receipt

The supervisor treats `exit` as authoritative (`eval/qa/paired-collection-supervisor.mjs:314`) and
cancels when `state[arm].complete` is unset at `:321`. Node emits `exit` from the process handle
callback, which is independent of the IPC pipe drain, so a `complete` message that is still buffered
when the child exits arrives too late.

Probe **F** confirms the behavior: with candidate's `exit` emitted before its `complete`, the
supervisor rejects with `candidate child exited before successful completion` even though both
artifacts were written.

This is fail-closed and it never fabricates a receipt, so it is not a safety defect. Its cost is a
completed four-hour, roughly `$160` collection whose receipt is thrown away and must be
reconstructed by hand. In practice the window is small: the child calls `process.disconnect()` in
the `send` callback (`eval/qa/paired-collection-control.mjs:97`) and then does further work before
exiting.

Repair: settle the success path on `close` rather than `exit`, or record the exit status and defer
the `!complete` decision until the channel has emitted `disconnect`.

### F4 — Test coverage does not follow the new branches

Every committed test passes and is fail-closed, but the new code has substantially more branches
than the tests reach. I verified each item below with a probe, so these are coverage gaps, not
defects.

Untested in `test/qa-paired-collection-supervisor.test.mjs`:

- the ordered-row-barrier violation, by index and by ID (probes A-1, A-2);
- the readiness mismatch (probe A-5) and the duplicate readiness (unprobed, read only);
- `complete` before the postflight barrier (probe A-4);
- the real `writeCancellation` with `flag: "wx"`, which every cancellation test stubs out;
- the production `terminate`, which uses `process.kill(-pid)` rather than `child.kill`;
- roughly twenty `validatePairedCollectionPlan` throw sites, including `--sample`, the missing
  capacity record, cross-arm hash drift, the `process.execPath` pin, the deadline constant, the
  `--ids` order, the shared stability register, the comparison command, and both content-hash
  reproductions (probes C-3 and C-4 exercise these).

`eval/qa/paired-collection-control.mjs` has no test at all. Nothing exercises `assertActive`,
`waitFor`, `cancelLocal`, the `disconnect` handler, or the `complete`-then-disconnect sequence.

Untested in `test/qa-paired-verdict.test.mjs`:

- the intra-arm port branch at `eval/qa/paired-verdict.mjs:405`, the only new port check, which
  needs a two-look fixture to reach (probe B-3);
- an artifact with no judge stamps, `matches: false`, or a missing `expectedSha256`. The single
  committed judge-hash test mutates a present, well-formed stamp. The likeliest real regression is
  a stored-judge run that stops writing the stamps, and no test would catch it (probes B-4, B-5).

Repair: add the probes above as committed tests. Probes A-1, A-2, A-4, A-5, B-3, B-4, B-5, and
C-1 … C-4 are each a few lines against the existing fixtures.

### F5 — Two specification P2 items are not implemented

The specification's P2 requires: "The supervisor must alternate the first arm deterministically by
ID. It must record start and finish times."

Neither exists. The row barrier releases `continue` to both children in the same loop
(`eval/qa/paired-collection-supervisor.mjs:359`), so no arm is a deterministic first mover, and the
`qa-paired-collection-receipt-v1` receipt (`:301`) carries no timestamps.

Alternation matters because P2's own concern is that shared rate limits may bind asymmetrically.
Simultaneous release does not remove that asymmetry; it leaves it to chance. The timestamps matter
because they are the evidence for the concurrent-load estimand the round must report.

This is not in the task's nine required behaviors, so I do not treat it as blocking. It should be
either implemented or explicitly retired in the round ledger before authorization, since the
specification lists it as a launch condition.

### F6 — The manifest does not record `.dev.vars` equality

The specification's P5 requires: "Record both worktree roots and all four ports. Record `.dev.vars`
equality without secret values."

The worktree roots and all four ports are covered, because the ports live inside the frozen command
arrays. `.dev.vars` equality has no field in `qa-paired-collection-plan-v1` and no check anywhere.
Divergent secrets in the two server worktrees would change upstream behavior asymmetrically and
would not be detected by the remote identity guard, which probes the services, not the server
configuration.

Repair: add a `devVars` block recording, per server worktree, the sorted variable-name list and a
SHA-256 over the name-and-value pairs, and require the two to match. This must never record a
value; `agentEnvironmentIdentity` (`eval/lib/executable-identity.mjs:98`) is the existing pattern to
copy.

### F7 — Two small correctness nits

1. `judgeStoredResults` builds its error message with `results.meta.comparabilityReasons`
   (`run-qa.mjs:1188`) after testing `results.meta?.comparable`. An artifact with no `meta` at all
   throws `TypeError: Cannot read properties of undefined` instead of the intended message. It is
   still fail-closed and still precedes any judge call, but the operator sees the wrong error. Use
   `results.meta?.comparabilityReasons ?? []`.
2. `--paired-control-arm` is parsed at `run-qa.mjs:1685`, after the `--judge-stored` branch returns
   at `:1670`. A stored-judge command carrying it is silently ignored rather than rejected. The
   manifest forbids the combination, so this only matters outside the supervisor. Move the
   validation above the branch.

### F8 — Nothing requires the two arms to use different service revisions

Neither the manifest (F2, C-5) nor the printer requires baseline and candidate to differ.
`adapterArtifactProblems` checks each artifact's own `adapter.sourceRevision` against its
`meta.sourceIdentity.serverRevision`, and `collectionTuple` does not carry the server revision, so
nothing compares the two arms.

Probe **B-6** confirms it: two artifacts forced onto one server revision, with every other stamp
kept coherent and the adapter modes left as `add-missing` and `verify-native`, produce `PASS` with
no `runtime-adapter-pairing` reason.

As noted in F2 this is mitigated in practice, because `add-missing` rejects a native upstream at
initialize and fails free. I record it as defense in depth: the invariant the whole measurement
rests on — that the two arms are two different service revisions — is asserted nowhere.

Repair: fold it into F2 item 1, and additionally have `comparisonProblems` require
`baseline.meta.sourceIdentity.serverRevision !== candidate.meta.sourceIdentity.serverRevision`.

## Attack surfaces I checked and found sound

- **Barrier bypass.** A child cannot skip a row. `rowComplete` blocks on `continue`, and the
  supervisor issues `continue` only when both arms report the same index and the ID matches the
  frozen array.
- **Quarantined-case skew.** The row loop iterates all selected cases
  (`run-qa.mjs:1833`) with no `continue` for quarantined cases, so barrier indices always align with
  `plan.selected.ids`.
- **Content-hash agreement.** `loadCases` (`eval/qa/lib.mjs:41`) returns the parsed object without
  normalization, so the child's `sha256(JSON.stringify(cases))` and the supervisor's
  `sha256(JSON.stringify(snapshot.selected))` are computed over the same key order from the same
  verified bytes.
- **Message replay and post-cancel stragglers.** Duplicate readiness cancels; a repeated
  `row-complete` fails the index check. A `row-complete` that arrives after a cancellation can still
  cause the supervisor to emit `continue`, but IPC ordering guarantees the child already received
  `cancel`, and its waiter is already resolved, so the message is dropped. No spend can follow.
- **Lost messages.** `waitFor` registers its waiter synchronously before yielding, so a reply cannot
  arrive with no waiter queued.
- **Argument smuggling.** `flagValue` requires exactly one occurrence; `--flag=value` is rejected in
  both the manifest and `parseOptionalIdsFlag`. `command[1]` is hashed as the script, so a Node
  pre-load flag in that slot fails the hash read.
- **Environment leakage into the pin.** `QA_PAIRED_CANCELLATION_FILE` is outside the
  environment-identity filter, so injecting it does not break the pinned environment hash.
- **Empty or unpaired run arrays.** `comparisonProblems` returns on unequal counts and on a count
  outside 1..2 before `adapterPairingProblems` can index an empty array.
- **Completeness versus comparability.** With `--no-judge`, `runCompleteness`
  (`eval/lib/harness-guards.mjs:161`) sets `aggregatesAllowed` from row count alone, and every case
  pushes a row unless the loop throws. A comparable collection artifact is therefore always
  complete, so the receipt cannot point at an artifact the printer will reject for incompleteness.
- **Judge spend during collection.** The judge block is gated on `!noJudge`
  (`run-qa.mjs:1896`), and `--paired-control-arm` requires `--no-judge`, so the one authorizer
  without an `assertActive` guard (`run-qa.mjs:942`) is unreachable during supervised collection.
- **Cancellation classification.** A `PairedCollectionCancelledError` is caught at
  `run-qa.mjs:1876`, rethrown immediately because no attempt was recorded, and becomes a
  `collection failed:` comparability reason. It is never graded as a row.

## Verification run

| Command | Result |
|---|---|
| `npx vitest run test/qa-paired-collection-supervisor.test.mjs test/qa-paired-verdict.test.mjs test/qa-judge-stored.test.mjs` | PASS, 3 files, 96 tests |
| `npm test` | PASS, 106 files, 1,853 tests |
| `npm run typecheck` | PASS |
| `npm run build` | PASS |
| `npm run eval:qa:paired:validate` | PASS, all six gates true |
| `git diff --check` | PASS |
| Eighteen scratchpad probe cases (A-1, A-2, A-4, A-5, A-6, F; B-3, B-4, B-5, B-6; C-3…C-8), five temporary files | As reported above; all files deleted, tree clean |

I did not run `npm run test:smoke`. The commit touches no path under `src/executor` or `src/demo`.

`npm run secrets:scan -- --tree` passed on the working tree carrying this report: clean, with
gitleaks reporting no leaks.

## Reconciliation with the implementation report

I read `paired-collection-supervisor-sol.md` after forming the findings above. It is accurate. Its
contract descriptions match the code, its validation table matches my reruns, and its risk list is
honest, including the admission that no real provider process was exercised.

Two corrections:

1. The report states "It alternates no shared mutable repository state." The specification's P2 word
   "alternate" refers to alternating the first arm per row, which is not implemented. See F5. The
   isolation claim the sentence appears to intend is separately correct.
2. The report's blocker section says "No implementation blocker remains." F1 is an implementation
   blocker for a paid launch.

The report's three reviewability-audit findings are real and their fixes are present in the code: the
final postflight barrier, the deferred IPC close, and `--paired-control-arm` inside the frozen
command.

## What must happen before a paid launch

1. Fix F1.
2. Fix F2, or record in the round ledger why the manifest review is accepted as the only check on
   those flags.
3. Decide F5 — implement the alternation and the timestamps, or retire that P2 clause explicitly.
4. Add the F4 tests, at minimum for the intra-arm port branch and the missing judge stamps.
5. Address F6 and F7, or record them as accepted.
6. Produce the manifest instance with hashes recomputed at the final merged runner revision, as the
   specification's P4 and P5 require. No instance exists yet, correctly.
7. Obtain the new owner authorization. This review grants none.

This review authorizes no spend, no deployment, and no merge.
