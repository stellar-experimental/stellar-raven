# Paired collection supervisor — independent review

Date: 2026-09-04

Reviewer lane: Claude Opus 5 at xhigh effort.

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

## Author repair reconciliation

This section records the later repair. It does not change the independent verdict for commit
`79080bd70f0a603daf422432cf4708bef522e389`.

- F1: Every cancellation now has a bounded drain, `SIGTERM`, `SIGKILL`, and forced settlement.
  The failure path keeps the exclusive no-new-spend marker.
- F2 and F8: The manifest validates revisions, surface hashes, adapter modes, shared flags, and
  four distinct ports. The printer rejects equal baseline and candidate revisions.
- F3: The supervisor waits for IPC closure before it decides whether a child exit succeeded.
- F4: The committed tests cover each requested fail-closed branch and control-module behavior.
- F5: Row releases alternate baseline-first and candidate-first. The receipt records all required
  timestamps.
- F6: The manifest records sorted `.dev.vars` names and a canonical name-value SHA-256 only.
- F7: Stored judging handles absent metadata and rejects paired collection control.

The repair also pins both paired control files. It records the validated plan hash in the receipt.
It validates artifact locations. Malformed IPC and path failures now cause shared hard cancellation.
Closed channels, missing processes, and missing exit events cannot keep the supervisor pending.

No repair path made a network call or a paid call. A later independent review can assess the repair
commit. This author reconciliation does not grant launch authorization.

---

# Independent repair re-review — commit `9cf49a4`

Date: 2026-09-04

Reviewer: Claude Code, Opus 5, `xhigh` effort. Reviewer differs from the author and the design author.

Reviewed commit: `9cf49a4b41e084a9d9fe30ebbda9330c0a197b1a` ("eval: repair paired collection launch
gate"), on top of the reviewed `79080bd` and this report's commit `2a9fdea`.

This section is additive. It does not change the first review's `CHANGES-REQUIRED` verdict for
`79080bd`, which stands as the historical record for that commit.

I made no paid call, no network call, no deployment, and no product-code change.

## Verdict

PASS.

The blocking finding F1 is fixed and I verified the fix against running code, not only by reading.
Every cancellation now settles within a bounded drain, and no path can hang without a timer.

F2 through F8 are all addressed, most of them more thoroughly than my repairs asked for. Every
item on the orchestrator's additional checklist is implemented and tested.

Nine residual findings remain (G1 through G9). All are low severity. None blocks a paid launch,
none can produce a wrong verdict, and none can cause unbounded spend. G1 and G2 are worth fixing
before the manifest is authorized; the rest are hardening, documentation, and test-realism items.

## Method

I read the repair diff and the current source of the supervisor, the control module, the printer,
and `run-qa.mjs` before reading the author's updated report. I then ran the full gate set and
wrote twenty-two adversarial probe cases across six temporary files inside the repository root,
plus one real out-of-process Node IPC experiment. Every temporary file was deleted; the tree is
clean.

The repair commit appended an "Author repair reconciliation" section to this report. It is clearly
labeled as the author's, it states that it does not change my verdict, and it does not. I left it
in place.

## Prior findings — disposition

| Finding | Disposition | Evidence |
|---|---|---|
| F1 bounded drain and forced settlement | FIXED | Probes D1, D2, D7 |
| F2 arm-distinguishing and shared command flags | FIXED | Source read, committed table, probes E5, E6 |
| F3 exit-before-complete IPC ordering | FIXED | Real IPC experiment, probes D3, D4 |
| F4 test coverage of new branches | FIXED, with G7 | Committed suite read, full run |
| F5 alternation and timestamps | FIXED, with G2 | Source read, probe G1 |
| F6 `.dev.vars` equality | FIXED, with G3, G4, G9 | Source read, probes E1–E4 |
| F7 strict `meta` access, mode rejection | FIXED | Diff read, committed tests |
| F8 distinct server revisions | FIXED | Probes F1–F4 |

### F1 — bounded drain, `SIGTERM`, `SIGKILL`, forced settlement

`cancel()` no longer clears the only watchdog. It clears the deadline, then either calls
`beginTermination()` immediately (hard) or arms `drainTimer` for
`PAIRED_COLLECTION_DRAIN_MS = 30_000` (soft). `beginTermination` sends `SIGTERM` to every arm that
has not exited, then arms `terminationTimer` for
`PAIRED_COLLECTION_TERMINATION_GRACE_MS = 5_000`, which sends `SIGKILL` and calls `settleFailure()`.
`settleFailure` rejects without waiting for any exit event
(`eval/qa/paired-collection-supervisor.mjs:483`).

- **D1** A soft cancellation where neither child ever exits settles on real short timers, with
  `["SIGTERM", "SIGKILL"]` delivered to both arms. The first review's hang is gone.
- **D2** The deadline with no exits settles the same way.
- **D7** The exclusive `wx` marker survives forced settlement, and `main()` now preserves the
  control directory on the failure path (`:733`), so a surviving child still cannot authorize spend.

Worst-case time from any cancellation to settlement is 35 s soft, 5 s hard. The only remaining
long wait is the four-hour deadline, which is the specified contract.

### F2 — exact shared and arm-specific flags before spend

`validateCommand` and `validatePairedCollectionPlan` now check, before any child is spawned:

- `--adapter-mode` is `add-missing` for baseline and `verify-native` for candidate;
- `--server-revision` is 40 hex, differs across arms, **and equals each server worktree's HEAD**;
- `--expect-sha256` is a valid SHA-256 and differs across arms;
- `--adapter-revision` is shared **and equals both runner worktrees' HEAD**;
- `--port` and `--upstream-port` are valid and the four are pairwise distinct;
- `--variant`, `--surface`, `--search-tool`, `--model`, `--judge-model`, `--max-panel-cases` are
  present and equal across arms;
- `--judge-model`, `--max-panel-cases`, `--judge-panel` agree between each arm's collection and
  judge commands;
- `flagValue` additionally rejects a value that begins with `--`.

Binding the frozen revisions to the actual worktree HEADs goes beyond what I asked for and is the
strongest part of the repair. Probe **E6** confirms a flag-shaped value is rejected; probe **E5**
confirms a `--judge-panel` present only in the collection commands is rejected. The committed
fifteen-case table covers the rest.

### F3 — exit, complete, and IPC-close ordering

`evaluateExit` now requires both `exited` and `disconnected` before deciding, and an exit without
IPC closure arms `ipcDrainTimer` for `PAIRED_COLLECTION_IPC_DRAIN_MS = 1_000`, after which the
supervisor hard-cancels.

I ran a real out-of-process experiment (six spawns, three child shutdown modes, two payload sizes)
to establish the actual Node ordering rather than assume it:

| child shutdown | payload | parent event order |
|---|---|---|
| `send` then `process.disconnect()` | 10 B / 200 KB | `message → disconnect → exit → close` |
| `send` then `process.exit()` in the send callback | 10 B / 200 KB | `message → disconnect → exit → close` |
| `send` then synchronous `process.exit()` | 10 B | `message → disconnect → exit → close` |
| `send` then synchronous `process.exit()` | 200 KB | `disconnect → exit → close` — **message lost** |

Three conclusions. Node does emit `disconnect` even when a child exits without disconnecting, so
the new `disconnected` requirement cannot deadlock the success path. `disconnect` normally precedes
`exit`, so the drain window is rarely needed. A child that calls `process.exit()` synchronously
after a large `send` loses the message entirely — `run-qa.mjs` avoids this by awaiting the send
callback before disconnecting (`eval/qa/paired-collection-control.mjs:106`), and if it ever did
lose the message the supervisor fails closed with no receipt.

- **D3** The real order (`complete → disconnect → exit`) resolves correctly. The committed test
  covers only the reverse order, so this probe closes the more likely production case.
- **D4** An exit whose IPC never closes hard-cancels with `baseline IPC did not close after child exit`.

### F4 — test coverage

The committed suite now covers malformed IPC, malformed readiness, readiness `realpath` failure,
malformed failure data, duplicate readiness, wrong row index, wrong row ID, a row before readiness,
an early `complete`, an absent artifact, an artifact outside the results directory, bounded hard
termination with no exits, closed IPC with failing termination, the exclusive marker, fifteen
command-mismatch cases, `.dev.vars` drift, changed control bytes, six judge-stamp shapes, a
cross-arm judge identity that is valid but different, intra-arm port drift across a repeat, and
equal server revisions both in-process and through the real CLI. A new
`test/qa-paired-collection-control.test.mjs` covers the child side with an injected process.

The suite grew from 1,853 to 1,886 tests, all passing. See G7 for what is still uncovered.

### F5 — alternation and timestamps

`releaseAfterBarrier` sends to `ARMS` for even next-indices and to the reversed order for odd ones,
and the receipt records `firstReleasedArm` per row plus `collectionStartedAt`, `releasedAt`,
`completedAt`, `postflightAt`, per-arm `finishedAt`, and a final `finishedAt`. See G2 for the
resolution limit.

### F6 — `.dev.vars` equality without values

`devVarsIdentity` parses each server worktree's `.dev.vars`, rejects malformed and duplicate lines,
sorts the pairs, and returns `{ names, sha256 }`. The plan stores names and one hash; no value is
stored. Probe **E2** confirms comments, blank lines, CRLF, and values containing `=` parse
correctly. Probe **E3** confirms duplicate and malformed lines are rejected.

### F7 and F8

`results.meta?.comparabilityReasons` fixes the `TypeError`, and the no-`meta` case has a committed
test asserting zero judge calls. `--paired-control-arm` validation moved above the `--judge-stored`
branch and now rejects both an invalid value and any use outside `--no-judge` collection, with a
committed CLI test asserting `paidCalls() === []`. The printer rejects equal cross-arm revisions and
intra-arm revision drift. Probes **F1** through **F4** confirm the printer behavior, including the
`calibrationFromPairedArtifacts` path, and confirm no crash when `sourceIdentity` is absent.

## Residual findings

### G1 — the receipt artifact is not bound to this collection

`artifactPathFromArm` checks that the reported path resolves to a real file below that arm's
`eval/qa/results` directory. It reads nothing from the file.

Probe **H1**: with both arms reporting a stale, pre-existing, `comparable: false` artifact from an
earlier run that still sits in the results directory, the supervisor issues a normal
`qa-paired-collection-receipt-v1` receipt naming those files.

Not reachable through the real child, which reports its own `outPath`. It matters because the
receipt is the operator's go/no-go for the paid stored-judge phase, and a wrong artifact there costs
that phase before the printer objects. The repair is cheap and uses values the supervisor already
holds: read the reported artifact and require `meta.comparable === true` and
`meta.inputSnapshot.caseIdsSha256 === plan.selected.idsSha256`.

### G2 — `releasedAt` cannot evidence the alternation, and the committed test hides that

Probe **G1** ran the barrier with the production `now()`. Every `releasedAt` value in the receipt is
the identical ISO millisecond string for both arms and both rows:
`2026-09-04T08:41:52.050Z` four times.

The committed test asserts `rowTimeline[0].releasedAt.baseline < rowTimeline[0].releasedAt.candidate`
and the reverse for row 1. That assertion holds only because the test injects a monotonic counter
clock. With the real clock the comparison is false in both directions, so the test does not
demonstrate what its name claims about the shipped receipt.

`firstReleasedArm` is deterministic and auditable, so P2's alternation requirement is met as a
record. Two options: record a monotonic `process.hrtime.bigint()` companion for each release, or
drop the ordering assertion from the test and state in `eval/qa/README.md` that `firstReleasedArm`
is the ordering record and `releasedAt` is wall-clock only.

Separately, note that alternation here orders two IPC writes in one event-loop turn. It does not
control when each child actually issues its provider call. That is the honest strength of the
mechanism and should be described that way in the round ledger, not as enforced first-mover
ordering under load.

### G3 — two different sort orders for the same `.dev.vars` name list

`devVarsIdentity` sorts with `localeCompare`. The plan check requires strictly ascending order by
code unit (`names[index - 1] < name`). These disagree on mixed-case names.

Probe **E1**: with `.dev.vars` containing `BETA` and `alpha`, `devVarsIdentity` produces
`["alpha", "BETA"]`, and a plan that faithfully records that exact order is rejected with
`devVars.names must be a sorted unique name list`.

Fail-closed, and unreachable with this repository's all-uppercase secret names. Use one comparator
in both places.

### G4 — a missing `.dev.vars` surfaces a raw `ENOENT`

Probe **E4**: deleting a server worktree's `.dev.vars` produces
`ENOENT: no such file or directory, open '…/baselineServer/.dev.vars'` rather than a launch-gate
message. Fail-closed, but the operator gets a bare filesystem error and an absolute path. Wrap the
read.

### G5 — the executing supervisor's own bytes are not pinned

`pairedCollectionSupervisorSha256` and `pairedCollectionControlSha256` are checked against the two
runner worktree copies. Probe **E7**: a plan validates even when the running
`paired-collection-supervisor.mjs` hashes to a different value than the pin
(`038febf8f824…` running against `0834c2d60725…` pinned).

Defense in depth only: both runner worktrees are bound to the adapter revision, and the operator
runs `npm run eval:qa:paired:collect` from one of them. One line closes it — compare
`sha256(readFileSync(fileURLToPath(import.meta.url)))` against the pin.

### G6 — `--cases` may resolve outside both runner worktrees

Probe **E8**: adding `--cases <path outside every worktree>` to both collection commands validates
successfully; the validator reads and hashes that external file for both arms.

Comparability is unaffected, because the content and file hashes must still match the frozen values.
What it defeats is P5's property that each runner worktree independently reproduces the corpus: one
shared external file would satisfy both arms. Require the resolved cases path to be inside its own
runner worktree.

### G7 — two correct branches remain untested

Both verified correct by probe, neither covered by the committed suite:

- intra-arm server-revision drift, `each arm must keep one exact server revision`
  (`eval/qa/paired-verdict.mjs:451`) — probe **F1**;
- the `ipcDrainTimer` cancellation, `IPC did not close after child exit`
  (`eval/qa/paired-collection-supervisor.mjs:600`) — probe **D4**.

Probes **D3** (the real `disconnect`-before-`exit` order) and **D5** (a closed peer channel at
release) are also worth committing.

### G8 — `eval/EVALS.md` and `run-evals/SKILL.md` were not updated

`eval/qa/README.md` carries the full repaired contract. Neither `eval/EVALS.md` item 12 nor the
`run-evals` skill mentions the bounded drain, the distinct revisions and surface hashes, the adapter
modes, the four distinct ports, the `.dev.vars` identity, or the receipt contents. Neither document
now contains a false statement, so this is completeness, not drift. They are the two files an
operator reads first.

### G9 — `devVars.sha256` is derived from secret values

The manifest stores no value, which is what P5 asked for. It does store a SHA-256 over the canonical
name-value pairs. With this repository's high-entropy secrets that hash is not invertible, but it is
still a secret-derived artifact. Keep the manifest out of the repository, or salt the digest with a
random per-run value recorded beside it. `eval/qa/README.md` should say which.

## Checks run

| Command | Result |
|---|---|
| `npm test` | PASS, 107 files, 1,886 tests |
| `npm run typecheck` | PASS |
| `npm run build` | PASS |
| `npm run eval:qa:paired:validate` | PASS, all gates true |
| `npm run secrets:scan -- --tree` | PASS |
| `git diff --check` | PASS |
| Real Node IPC ordering experiment, six spawns | Table above; local processes only |
| Probes D1–D7, E1–E8, F1–F4, G1, H1 (22 cases, six temporary files) | As reported; all files deleted, tree clean |

I did not run `npm run test:smoke`. The repair touches no path under `src/executor` or `src/demo`.

## Before a paid launch

1. Fix G1. It is the one residual finding with money attached, and the check is two field
   comparisons the supervisor already holds.
2. Fix G2, or restate the alternation claim honestly in the round ledger and drop the misleading
   test assertion.
3. Fix G3 through G6 and commit the G7 tests, or record each as accepted.
4. Update `eval/EVALS.md` and the `run-evals` skill (G8), and record the manifest handling rule (G9).
5. Produce the manifest instance with hashes recomputed at the final merged runner revision.
6. Obtain the new owner authorization. This re-review grants none.

This re-review authorizes no spend, no deployment, and no merge.

## Author residual reconciliation

This section records the later G1 through G9 repair. It does not change either historical verdict.

| Residual | Author disposition |
|---|---|
| G1 | Closed. The supervisor reads each artifact and binds comparability, IDs, and available content identity before receipt. |
| G2 | Closed. Monotonic `releaseSequence` values record IPC order. Wall-clock timestamps record duration evidence only. |
| G3 | Closed. Parsing and manifest validation use one code-unit comparator. |
| G4 | Closed. Missing or unreadable `.dev.vars` produces an arm-specific launch-gate error without values. |
| G5 | Closed. The executing supervisor and imported control bytes must match both manifest pins. |
| G6 | Closed. Each cases path must resolve inside its own runner worktree. |
| G7 | Closed. Tests cover revision drift, IPC drain, production event order, and a closed release peer. |
| G8 | Closed. `eval/EVALS.md` and `run-evals/SKILL.md` contain the repaired operator contract. |
| G9 | Closed. Each plan uses a random salt. The plan remains uncommitted and is deleted after the run. |

The changes preserve the prior F1 through F8 repairs and the additive review record. No repair made
a network call or a paid call. This author reconciliation grants no launch authorization.

---

# Final independent review — commit `1292b60`

Date: 2026-09-04

Reviewer lane: Claude Opus 5 at `xhigh` effort. Reviewer differs from the author and the design author.

Reviewed commit: `1292b60fcfeddbd1f020921cc35daca5186bf34b` ("eval: close paired collection review
residuals"), on top of `9cf49a4` and this report's `77a0f6b`.

This section is additive. It changes neither historical verdict.

I made no paid call, no network call, and no product-code change.

## Verdict

PASS.

Every G1 through G9 residual is closed. I verified each against running code with fourteen fresh
adversarial probes, and I re-ran the F1 and F3 repairs to confirm the new
`releaseAfterBarrier` pre-check did not regress them. No new launch blocker appeared.

Three low residuals remain (H1 through H3). None can cause unbounded spend, a wrong verdict, or a
hang. One provenance correction was needed (H4) and I applied it.

The launch gate is, in my assessment, ready for an owner authorization decision. This review still
grants none.

## G1 through G9 — disposition

| Residual | Disposition | Evidence |
|---|---|---|
| G1 artifact-content binding before receipt | CLOSED, with H1 | Probes J1, J2, J4 |
| G2 `releaseSequence` and honest timing claims | CLOSED | Probe N3, docs read |
| G3 one `.dev.vars` comparator | CLOSED | Committed test, source read |
| G4 `.dev.vars` operator error | CLOSED | Probe K2 |
| G5 executing supervisor and control pins | CLOSED | Source read, committed test |
| G6 `--cases` containment | CLOSED, with H2 | Probe M1 |
| G7 added tests | CLOSED | Suite read, full run |
| G8 `eval/EVALS.md` and `run-evals` guidance | CLOSED | Docs read |
| G9 salt, secrecy, operator guidance | CLOSED | Probe K1, docs read |

### G1 — artifact-content binding

`artifactPathFromArm` now parses the reported artifact and requires `meta.comparable === true`, the
ordered `rows[].id` list to deep-equal `plan.selected.ids`, and
`meta.inputSnapshot.caseIdsSha256 === plan.selected.idsSha256`, then checks `meta.selectedIds` and
`meta.inputSnapshot.casesSha256` when present.

I traced each field to the writer rather than trusting the names.
`run-qa.mjs:2135` writes `inputSnapshot.casesSha256 = sha256(JSON.stringify(cases))`, which is
byte-identical to how the supervisor derives `plan.selected.contentSha256`, and
`run-qa.mjs:2136` writes `caseIdsSha256`. `run-qa.mjs:2116` writes `meta.selectedIds`. So the
content binding is real, not nominal. The stale-artifact hole my probe H1 opened in the previous
round is closed: that same artifact is now rejected.

- **J1** A reordered row list is rejected — the comparison is order-sensitive.
- **J2** Non-JSON content is rejected with `artifact must contain readable JSON`.
- **J4** An arm reporting its peer's artifact is rejected by the results-directory containment
  check before any content is read.

The five committed cases (non-comparable, wrong ID digest, wrong row IDs, wrong `selectedIds`,
wrong content identity) all assert a hard cancellation with no receipt.

### G2 — `releaseSequence` and honest timing

The receipt now carries a monotonic `releaseSequence` counter per arm per row plus a flat ordered
`releaseSequence` array, and the committed test asserts the exact sequence instead of comparing
wall-clock strings. The `now()` stub was removed from that test, so it exercises the real clock.

Probe **N3** confirms the shipped ordering end to end with the production clock:
`0:baseline:1, 0:candidate:2, 1:candidate:3, 1:baseline:4`, with `firstReleasedArm` agreeing.

The prose is now accurate in all three documents. `eval/qa/README.md` states plainly: "Wall-clock
timestamps provide duration evidence only… This order does not prove which child starts its
provider call first." That is exactly the honest claim I asked for, and it removes the overstatement
risk I flagged.

### G3, G4 and G9 — `.dev.vars`

`compareText` is now used both when sorting entries and when validating `devVars.names`, so the
producer and the checker agree. The mixed-case case that failed my previous probe now validates,
and a committed test pins `["BETA", "alpha"]` as the expected code-unit order.

`devVarsIdentity` wraps the read and throws `.dev.vars is missing or unreadable`, which the
validator prefixes with the arm. Probe **K2** confirms the missing-file message contains no path
separator at all, and that a value mismatch reports only "does not match the frozen identity" —
the secret value `hunter2` never appears.

Probe **K1** confirms the salt is load-bearing: two salts over the same file produce different
digests and identical name lists, a short salt is rejected, and a plan whose salt is changed without
recomputing the digest fails.

One point worth stating precisely, because the documentation is careful and should stay that way:
the salt and the digest live in the same file, so the salt does **not** protect a manifest that
someone commits. What it does buy is real — no precomputation, and no correlation of the same
secret set across plans. The protection against disclosure remains the handling rule, and
`eval/qa/README.md` and the skill now both carry it: keep the plan uncommitted, delete it after
success or failure. That is the right division, stated the right way.

### G5 — executing byte pins

`executingControlHashes()` hashes `fileURLToPath(import.meta.url)` and the sibling control module,
and the validator requires both manifest pins to equal them, in addition to the two runner copies.
The test fixture now writes the real supervisor and control bytes into the fake worktrees, so the
test would fail if the check were removed. This closes the gap my previous probe E7 demonstrated.

### G6 — `--cases` containment

`pathInside` realpaths both sides and rejects an escape. Probe **M1** confirms the interesting case
the plain-prefix version would have missed: a symlink *inside* the runner worktree that resolves to
a file outside it is rejected.

### G7 and G8

The suite grew from 1,886 to 1,900 tests, all passing. It now covers intra-arm server-revision
drift, the IPC drain cancellation, the production `complete → disconnect → exit` order, a closed
peer channel at release, five artifact-binding shapes, mixed-case `.dev.vars`, the missing
`.dev.vars` message, executing-pin mismatch, `--cases` escape, and the required salt. Four of those
are direct commits of probes I ran last round.

`eval/EVALS.md` item 12 and the `run-evals` skill now carry the full repaired contract: containment,
executing pins, distinct revisions and surface hashes, adapter modes, distinct ports, the salted
`.dev.vars` identity with its handling rule, the bounded drain, the release-order semantics, and the
pre-receipt artifact checks.

## F1 through F8 — still holding

I re-ran the earlier repairs because `releaseAfterBarrier` gained a pre-send channel check that
could have changed the cancellation paths.

- **N1** A soft cancellation where neither child exits still settles through `SIGTERM` then
  `SIGKILL`, and the exclusive marker survives. F1 holds.
- **N2** The deadline with no exits still settles. No timer-free hang.
- **N3** The production `complete → disconnect → exit` order resolves. F3 holds.
- **N4** An exit whose IPC never closes still hard-cancels with the arm-specific message.
- **N5** A peer channel that closes mid-run now cancels at the next release with
  `closed before row release`, before either arm is released — an improvement on the previous
  behavior, which failed at send time.
- **N6** One arm completing while the other exits non-zero produces no receipt.

The full suite covers the rest of F2, F4 through F8 unchanged.

## Residual findings

### H1 — the receipt does not bind the artifact to the arm's frozen server revision

Probe **J3**: two artifacts that are comparable and carry the exact frozen ID set, but whose
`meta.sourceIdentity.serverRevision` is a revision the plan never names, are accepted and a normal
receipt is issued.

The binding added in G1 is by corpus, not by service revision. The plan already holds each arm's
exact `--server-revision`, so the check is one comparison. It would also catch an artifact collected
against the wrong worktree.

Not reachable through the real child, which reports its own `outPath` from a run whose revision the
runner already pinned, and the printer rejects an equal-revision pair afterwards. Recommended as the
last cheap tightening of the receipt gate, not as a blocker.

### H2 — a missing `--cases` file still surfaces a raw `ENOENT`

Probe **M2**: adding `--cases nope.json` produces
`ENOENT: no such file or directory, lstat '/private/var/folders/…/baselineRunner/nope.json'`.

This is the same class of message the G4 repair fixed for `.dev.vars`, left unfixed one function
away. `pathInside` calls `realpathSync` on a path that may not exist. Wrap it the same way, so every
launch-gate failure reads as a launch-gate failure and no absolute path leaks into an operator log.

### H3 — one dead check in the artifact binding

`artifactPathFromArm` guards `artifact.meta.selectedContentSha256`. No writer produces that field.
`selectedContentSha256` exists only in the readiness IPC message (`run-qa.mjs:1790`), never in
artifact metadata, so the loop's second element is always `undefined` and the comparison never runs.

Harmless, and the sibling `inputSnapshot.casesSha256` in the same loop does carry the content
binding. But it reads like a second content check when there is only one. Drop it, or add the field
to the artifact if a second independent stamp is wanted.

### H4 — a historical attribution was rewritten; I corrected it

Commit `1292b60` changed the first review's header from "Reviewer: Claude Code, Opus 5, high
effort." to "Reviewer lane: Claude Opus 5 at xhigh effort." The first review was conducted at high
effort; only the two re-reviews ran at `xhigh`. The edit made the record overstate the effort behind
the `79080bd` verdict.

I restored that line to "Reviewer lane: Claude Opus 5 at high effort." and record the change here so
it is not a silent revert. Both historical verdicts and every finding remain untouched. Normalizing
route labels across a review record is reasonable; changing the recorded effort of a completed
review is not, because the effort is part of what the verdict is worth.

## Checks run

| Command | Result |
|---|---|
| `npm test` | PASS, 107 files, 1,900 tests |
| `npm run typecheck` | PASS |
| `npm run build` | PASS |
| `npm run eval:qa:paired:validate` | PASS, all gates true |
| `npm run secrets:scan -- --tree` | PASS |
| `git diff --check` | PASS |
| Probes J1–J4, K1–K2, M1–M2, N1–N6 (14 cases, two temporary files) | As reported; files deleted, tree clean |

I did not run `npm run test:smoke`. The commit touches no path under `src/executor` or `src/demo`.

## Before a paid launch

1. Optionally close H1, H2, and H3. None blocks authorization; H1 is the only one with any money
   attached, and only under a child that misreports its own artifact.
2. Produce the manifest instance at the final merged runner revision, with a fresh random
   `devVars.salt`. Keep it uncommitted and delete it after the run, as `eval/qa/README.md` now
   requires.
3. Obtain the new owner authorization, naming every command, cumulative cap, final hash, stop rule,
   and the independent result reviewer.

This final review authorizes no spend, no deployment, and no merge.

## Author H1-H4 reconciliation

This section adds the author reconciliation. It does not change a historical verdict.

Herdr recorded one reviewer start before the first review. Its argv was
`["claude","--model","opus","--effort","xhigh","--permission-mode","bypassPermissions"]`.
The same live reviewer agent produced all three reviews. Therefore, all three reviews used Opus 5
at xhigh effort. The later H4 effort correction was mistaken.

| Finding | Author disposition |
|---|---|
| H1 artifact server revision | CLOSED. Each artifact revision must equal its arm's frozen `--server-revision`. Baseline and candidate tests cover the gate. |
| H2 missing or unreadable cases path | CLOSED. The launch gate returns one concise error without an absolute path. Tests cover both conditions. |
| H3 dead artifact field check | CLOSED. The dead `artifact.meta.selectedContentSha256` check is removed. `inputSnapshot.casesSha256` remains the content binding. |
| H4 effort attribution | CORRECTED. Objective Herdr argv records Opus 5 at xhigh for the one live reviewer agent. Historical verdicts remain unchanged. |

---

# Bounded closing review — commit `5da204a`

Date: 2026-09-04

Reviewer lane: Claude Opus 5 at `xhigh` effort. Reviewer differs from the author and the design author.

Reviewed commit: `5da204a65c804cc89c47cb283b0b0897283babfc` ("eval: close paired collection final
residuals"), on top of `1292b60` and this report's `361abbd`.

This section is additive. It changes no historical verdict.

I made no paid call, no network call, and no product-code change.

## Verdict

PASS.

All three code residuals are closed and verified against running code. No new defect appeared, and
the earlier F1 and F3 repairs still hold with the new revision check in place.

One correction is mine to make: my H4 finding in the previous section was wrong, and my restoration
of the "high effort" line re-introduced the error. Objective evidence, gathered independently below,
shows all three reviews ran at `xhigh`. The document now reads correctly and needs no further edit.

One optional tightening remains (I1). It is pre-existing, not a regression, and not a blocker.

## Verification

### Artifact bound to the correct arm server revision — CLOSED

`artifactPathFromArm` now reads the arm's frozen `--server-revision` out of
`plan.arms[arm].collectionCommand` and requires
`artifact.meta?.sourceIdentity?.serverRevision` to equal it
(`eval/qa/paired-collection-supervisor.mjs:507`). This is precisely the check H1 asked for, and it
also makes a cross-arm artifact mix-up impossible on two independent axes, since the results
directory containment check already blocks the peer's path.

- **P1** A swapped pair — each arm reporting the other's revision — is rejected with
  `baseline artifact does not match its frozen server revision`.
- **P2** An artifact with no `sourceIdentity` at all is rejected; the comparison is strict, not
  optional-guarded.
- **P3** The correct pair still produces a normal receipt, so the check adds no false positive.

The committed `it.each(["baseline", "candidate"])` case proves both arms, and both its variants
assert a hard cancellation with no receipt.

### Concise launch-gate error for a missing `--cases` file — CLOSED

`pathInside` wraps both `realpathSync` calls and `selectedCasesFromWorktree` wraps its
`readFileSync`, each throwing `--cases is missing or unreadable inside its runner worktree`. The
validator prefixes it with `${arm} runner launch gate: `. The two neighbouring messages also lost
their interpolated absolute paths (`--cases has no cases[]`,
`--cases does not reproduce the ordered selected IDs`), which is a bonus the finding did not ask for.

- **P7** A missing file, a directory, and a `..` escape each produce the intended message, and none
  of the three contains the temporary root or any absolute path.

The committed test asserts the exact message string and additionally asserts it does not contain the
fixture root — the right way to pin a no-leak guarantee. Its "unreadable" variant uses a directory
path, so it exercises the `readFileSync` wrapper rather than only the `realpathSync` one.

### Dead `selectedContentSha256` check removed without weakening `casesSha256` — CLOSED

The two-element loop became a single `if` on `artifact.meta.inputSnapshot.casesSha256`
(`eval/qa/paired-collection-supervisor.mjs:503`). The surviving comparison is byte-for-byte the same
condition it was inside the loop, so the real binding is unchanged.

- **P4** A wrong `casesSha256` is still rejected with `does not match the frozen selected content`.
  The binding is not weakened.
- **P6** A bogus `meta.selectedContentSha256` is now correctly ignored, confirming the removed branch
  was the dead one.

`run-qa.mjs:2135` writes `inputSnapshot.casesSha256` unconditionally and derives it exactly as the
supervisor derives `plan.selected.contentSha256`, so the retained check is the live one.

### New tests prove both arms and the failure paths — CONFIRMED

The suite grew from 1,900 to 1,904 tests, all passing. The four additions are the two revision-drift
arms and the two `--cases` conditions. The bare `fixture()` gained a minimal `arms` block carrying
each arm's `--server-revision`, so the receipt-path tests exercise the real
`artifactPathFromArm` rather than an injected stub. Every added case asserts a rejection.

### Opus effort history — CORRECTED, and my earlier finding was wrong

I verified this independently rather than accepting either account. Walking the process tree from
this shell reaches my own agent process, PID 55268:

```
claude --model opus --effort xhigh --permission-mode bypassPermissions
```

Its parent is the Herdr server, and `herdr pane current --current` and `herdr agent get w16:p29`
place it in pane `w16:p29`, agent `tm2_opus_supervisor_review`, session
`ad2dcf77-e181-45d1-aba0-8fbe7c0b0975` — the same session id as this review's scratchpad — under the
terminal title "Commit 79080bd launch-blocker review". One live agent, one launch, all three reviews.

So the first review ran at `xhigh`. My H4 finding treated my own prose as the authority over the
launch argv; the argv is the authority, and the author's original edit was a correction. My
restoration in `361abbd` re-introduced the error, and `5da204a` has already put the header back to
`xhigh`. The line is correct as it now stands and I am leaving it alone.

The H4 entry in the previous section stays in place as the historical record of the exchange. Read it
with this paragraph: its factual claim is withdrawn.

## Residual finding

### I1 — the content binding is still optional-guarded

`artifact.meta.inputSnapshot.casesSha256 !== undefined && … !== plan.selected.contentSha256`.

Probe **P5**: an artifact that omits `casesSha256` entirely, but keeps a valid `inputSnapshot`
with the right `caseIdsSha256`, is accepted and a receipt is issued.

This guard predates `5da204a` and the commit did not change it, so it is not a regression — the
finding it answered was about the dead second element, which is gone. But `run-qa` always writes the
field, so the guard protects nothing and leaves the one content check skippable. Dropping
`!== undefined` makes it strictly stronger and matches how `caseIdsSha256` is already treated.
`eval/qa/README.md` is honest about the current behaviour ("when present"), so this is a tightening,
not a documentation fix.

## Regression check

- **P8** A soft cancellation with no child exits still settles through `SIGTERM` then `SIGKILL` and
  preserves the exclusive marker. F1 holds with the new revision check in the receipt path.
- **P3** The production `complete → disconnect → exit` order still resolves. F3 holds.

## Checks run

| Command | Result |
|---|---|
| `npm test` | PASS, 107 files, 1,904 tests |
| `npm run typecheck` | PASS |
| `npm run build` | PASS |
| `npm run eval:qa:paired:validate` | PASS, all gates true |
| `npm run secrets:scan -- --tree` | PASS |
| `git diff --check` | PASS |
| Probes P1–P8 (8 cases, one temporary file) | As reported; file deleted, tree clean |
| Herdr read-only argv verification (`pane current`, `agent get`, process tree) | Recorded above; no control command issued |

I did not run `npm run test:smoke`. The commit touches no path under `src/executor` or `src/demo`.

## Standing

The launch gate is ready for an owner authorization decision. I1 is optional. The remaining work is
unchanged: produce the manifest instance at the final merged runner revision with a fresh random
`devVars.salt`, keep it uncommitted, delete it after the run, and obtain the owner authorization
naming every command, cumulative cap, final hash, stop rule, and the independent result reviewer.

This review authorizes no spend, no deployment, and no merge.
