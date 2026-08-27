# Connector description A/B — 2026-08-27

## Objective

Measure the held response-guidance candidate against the merged control.
Do not trim startup tool descriptions or server instructions.
Reject the candidate after any verified treatment regression.

## Current status — first raw pair blocked

The historical replacement qualification remains spent and non-comparable.
Do not run the historical qualification command below.
The user authorized one new treatment qualification on 2026-08-27.
It permitted one answering call, no judge call, and a `$1.75` per-call cap.
The user's broader spend tolerance does not remove the method-specific cap.
The user authorized A1 and B1 on 2026-08-27 after the qualification passed.
That authorization permitted `16` answering calls and no judge calls.
Each answering call has a `$1.75` cap, and the stage has a `$28.00` cap.
No retry, judging, replication, or method rerun is authorized.

Both v5 arms now include the postflight fix from PR `#72`.
The control stays at `7389e24880125ccf8fe0657a1435ca753dae52e6`.
The treatment reapplies the held change as `3966a59e77f2034726088e16be902270753211ae`.
Each arm uses its matching worktree and commit for both the server and runner.
The v5 method never pairs a runner from one commit with another server commit.
The independent pre-spend review returned `LAUNCH-OK`.
The replacement qualification then passed every machine and manual gate.
The first pair ran treatment A1 and then control B1.
Manual review found verified treatment regressions, so the candidate is rejected.
No replication, judging, retry, or other paid method is authorized.

## Authorized v5 qualification

- Control branch: `eval/connectors-v5-control-20260827`.
- Control worktree: `sr-wt-connectors-v5-control`.
- Control commit: `7389e24880125ccf8fe0657a1435ca753dae52e6`.
- Treatment branch: `feat/connectors-v5-product-20260827`.
- Treatment worktree: `sr-wt-connectors-v5-product`.
- Treatment commit: `3966a59e77f2034726088e16be902270753211ae`.
- Treatment patch SHA-256: `59d0197bcec10d117e5e60e7ea8abcd09215d9ed1f5f465449d58acd79057874`.
- The patch matches the historical ten-file treatment patch exactly.
- Control surface SHA-256: `594578b995351e1abee1ec297e03662b51c1bfc4014daac4e39b4d8fa26611f3`.
- Treatment surface SHA-256: `1327f7cd332b5c205b9aa236af2c50522fdc3c11f14c7eec200ae8a15f1ee31e`.
- Control surface report SHA-256: `991fe0d7df55803be1339d3b32e121e0985e971e775c1369a78c7e5802a703bb`.
- Treatment surface report SHA-256: `8b50c2fc88a29d1a19a5ae36f23fc77e431b153ca54fbec2a9fd16cd47c728a4`.
- The treatment server runs alone on port `8792` during treatment collection.
- The historical server on port `8791` remains outside this method.

The wrapper, real Claude binary, model, environment rules, qualification case,
and qualification case hashes remain pinned as recorded below.
The call uses the treatment server and runner from `3966a59e77f2034726088e16be902270753211ae`.
It must produce exactly one row and one reported answering cost.
The maximum task spend after this call is `$1.9886646`.

### V5 free preflight

- Both arms passed `npm run typecheck`.
- Both arms passed `npm run eval:selftest`.
- Both arms compiled the `499`-case QA corpus with SHA-256
  `c29ae61708dc564c0cceb19fe4ae34c444961c297449ebed3bcad5ef41dfa846`.
- Both arms passed the stale corpus lint with `0` errors and `1,390` warnings.
- Both arms passed the routing gate with identical numbers.
- Control passed `88` test files and `1,335` tests.
- Treatment passed `89` test files and `1,343` tests.
- Both arms passed `82` smoke tests.
- Both arms passed the build and secret scan.
- Treatment passed the eight-test connector contract lane.
- Both worktrees remained clean after every free gate.

### V5 pre-spend result

- Reviewer: Grok 4.6, high effort, in owned pane `w3:p1R`.
- Reviewed ledger commit: `3e8a757dd7f39917d783011237e51bd5f4c446c7`.
- Report: `/tmp/connectors-v5-launch-review.md`.
- Report SHA-256: `6a42a24adbb40ade3143f6619301a2ca86c9a62141710845b16d97059a4b63bd`.
- Verdict: `LAUNCH-OK`.
- The reviewer found no blocker and independently recomputed every material pin.
- Its ten operator findings bind the launch and post-call inspection.

### V5 replacement qualification result

- Artifact: `eval/qa/results/2026-08-27T18-20-57-variantA.json` in
  `sr-wt-connectors-v5-product`.
- Artifact SHA-256: `1a93d19ed6dddeb0c1cda6f4e5e8175bcdaac9b1d38dc494a843d186b9230f6e`.
- Result schema: `qa-agent-result-v4`.
- Case: `q-edge-closed-world-builder-directory-miss`.
- Qualification `casesSha256`:
  `11c46002d8152a55fe558f298158792676e45b1dbe900abcfc131f9567c92680`.
- Qualification `caseIdsSha256`:
  `21e6b68f463f5164c94d7ec272dbbb8868cd9e5a86a8bae15cf249353e463a29`.
- Rows: `1` expected and `1` collected.
- Agent failures: `0`.
- Reported answering costs: `1` expected and `1` collected.
- Answering cost: `$0.1098888`.
- Judge calls and judge cost: `0`.
- Total counted task spend: `$0.3485534`.
- Remaining authorized paid methods at that checkpoint: `0`.
- `raven` MCP status: `connected`.
- Wrapper path and SHA-256 matched their pins.
- Runner and server revisions both matched
  `3966a59e77f2034726088e16be902270753211ae`.
- Preflight and postflight source revisions matched.
- Preflight and postflight treatment surfaces matched
  `1327f7cd332b5c205b9aa236af2c50522fdc3c11f14c7eec200ae8a15f1ee31e`.
- The source identity and server process guards matched.
- The runner was clean.
- The row was complete, comparable, and free of suppressed aggregates.
- `comparabilityReasons` was empty, and `postflightError` was null.
- The call used three tool calls: one catalog search and two Scout executes.
- The first execute hit a serialization error before source projection.
- The second execute repeated only `scout.getBuilders(q=Strupey)` with JSON serialization.
- The successful result reported zero matches across both Scout builder indexes.
- The answer stopped at Scout's builder-directory scope.
- The answer did not call Lumenloop, research, A/V, docs, or another Scout operation.
- The answer did not claim that `Strupey` has no broader ecosystem history.
- Manual qualification verdict: `PASS`.
- No command rerun or paid retry occurred.

### V5 post-collection review

- Reviewer: Grok 4.6, high effort, in owned pane `w3:p1R`.
- Reviewed ledger commit: `ed3aef520553b6064b2d442f26094dda9243edec`.
- Report: `/tmp/connectors-v5-qualification-review.md`.
- Report SHA-256: `e868acf2f6466aed08d2f603a7930d33e4fedacb3c25eb21a169f56a2b6dba1b`.
- Verdict: `QUALIFICATION-PASS`.
- The reviewer independently recomputed the artifact and one-case hashes.
- The reviewer joined the raw row to every golden key fact and avoid clause.
- The reviewer confirmed the serialization repair stayed on `scout.getBuilders`.
- The reviewer found no blocking issue.
- The review made no paid call and does not authorize the next stage.

### V5 first-pair authorization — spent

- Authorization date: `2026-08-27`.
- Order: treatment A1, then control B1.
- Fixed membership: the eight case IDs under `Fixed cases`.
- Answer model: `claude-sonnet-5`.
- Judge calls: `0`.
- Answer calls: `8` per arm and `16` total.
- Per-call cap: `$1.75`.
- Stage cap: `$28.00`.
- Maximum counted task spend after this stage: `$28.3485534`.
- Both arms use the pinned wrapper and an unset `QA_AGENT_PROMPT_APPEND`.
- Each arm uses one clean worktree for both its server and runner.
- Port `8792` serves only one arm at a time.
- Stop and record after A1 before starting B1.
- Stop after any incomplete row, missing cost, MCP failure, or comparability failure.
- Do not retry a failed arm under this authorization.
- Do not run a judge, replication pair, or method rerun under this authorization.

### V5 first-pair delta review

- Reviewer: Grok 4.6, high effort, in owned pane `w3:p1R`.
- Reviewed ledger commit: `8d9cfb3cd7b14f68a3eea12af127707b129a86f2`.
- Report: `/tmp/connectors-v5-first-pair-launch-review.md`.
- Report SHA-256: `81b7650bd64f87086bad501c27b8228eca943591c60ed39f2533b7d218d5fb1c`.
- Verdict: `FIRST-PAIR-LAUNCH-OK`.
- Reconciliation commit: `5a5824fcd2078a84fd43f9124bb9622d51413c8f`.
- The stale ledger wording and missing wrapper checks are corrected below.
- No paid call occurred during this review.

Treatment A1 runs from `sr-wt-connectors-v5-product`:

```sh
export PATH="/tmp/connectors-contract-eval-bin:$PATH"
unset QA_AGENT_PROMPT_APPEND
unset RAVEN_CLAUDE_ANSWER_MAX_BUDGET_USD
unset RAVEN_CLAUDE_JUDGE_MAX_BUDGET_USD
hash -r
test "$(command -v claude)" = /tmp/connectors-contract-eval-bin/claude
test "$(shasum -a 256 /tmp/connectors-contract-eval-bin/claude | awk '{print $1}')" = a8b9ec4b7c77b2538a5e299e8d900c3793f69d7101c0661cfd1146b76406c297
node eval/qa/run-qa.mjs --variant A \
  --ids q-comp-cross-moneygram-partnership-sep24,q-edge-closed-world-builder-directory-miss,q-edge-partner-detail-soft-empty,q-edge-strupey-ambiguous-stellar-history,q-infra-simulate-transaction-howto,q-sor-build-target-wasm32v1,q-soroban-greenfield-escrow-prior-art-preflight,q-tool-greenfield-indexer-prior-art-preflight \
  --no-judge --port 8792 --model claude-sonnet-5 \
  --server-revision 3966a59e77f2034726088e16be902270753211ae \
  --expect-sha256 1327f7cd332b5c205b9aa236af2c50522fdc3c11f14c7eec200ae8a15f1ee31e \
  --expect-agent-binary-sha256 a8b9ec4b7c77b2538a5e299e8d900c3793f69d7101c0661cfd1146b76406c297
```

Control B1 runs from `sr-wt-connectors-v5-control`:

```sh
export PATH="/tmp/connectors-contract-eval-bin:$PATH"
unset QA_AGENT_PROMPT_APPEND
unset RAVEN_CLAUDE_ANSWER_MAX_BUDGET_USD
unset RAVEN_CLAUDE_JUDGE_MAX_BUDGET_USD
hash -r
test "$(command -v claude)" = /tmp/connectors-contract-eval-bin/claude
test "$(shasum -a 256 /tmp/connectors-contract-eval-bin/claude | awk '{print $1}')" = a8b9ec4b7c77b2538a5e299e8d900c3793f69d7101c0661cfd1146b76406c297
node eval/qa/run-qa.mjs --variant A \
  --ids q-comp-cross-moneygram-partnership-sep24,q-edge-closed-world-builder-directory-miss,q-edge-partner-detail-soft-empty,q-edge-strupey-ambiguous-stellar-history,q-infra-simulate-transaction-howto,q-sor-build-target-wasm32v1,q-soroban-greenfield-escrow-prior-art-preflight,q-tool-greenfield-indexer-prior-art-preflight \
  --no-judge --port 8792 --model claude-sonnet-5 \
  --server-revision 7389e24880125ccf8fe0657a1435ca753dae52e6 \
  --expect-sha256 594578b995351e1abee1ec297e03662b51c1bfc4014daac4e39b4d8fa26611f3 \
  --expect-agent-binary-sha256 a8b9ec4b7c77b2538a5e299e8d900c3793f69d7101c0661cfd1146b76406c297
```

### V5 treatment A1 checkpoint

- Artifact: `eval/qa/results/2026-08-27T18-50-04-variantA.json` in
  `sr-wt-connectors-v5-product`.
- Artifact SHA-256: `fc2cc5424a45a35c43f96ee7a76349970eb068876f18fe6904e82654cd233665`.
- Preflight surface report: `/tmp/raven-connectors-v5-a1-preflight-surface.json`.
- Preflight report SHA-256: `ba0477d8f5b42b2c3efa3bcb89e1bc07dc7baa65814171840bb8d3ca7eac9418`.
- Rows: `8` expected and `8` collected.
- Agent failures: `0`.
- Reported answering costs: `8` expected and `8` collected.
- A1 answering cost: `$2.2461662`.
- Judge calls and judge cost: `0`.
- Counted task spend after A1: `$2.5947196`.
- Remaining authorized calls: the eight B1 answering calls only.
- Remaining first-pair cap: `$25.7538338`.
- All eight rows reported the `raven` MCP server as `connected`.
- The wrapper, eight-case hashes, runner, server, and treatment surface matched their pins.
- Preflight and postflight source revisions and surfaces matched.
- The source identity and server process guards matched.
- The runner remained clean.
- The artifact is complete and comparable.
- `comparabilityReasons` is empty, and `postflightError` is null.
- No A1 retry or judge call occurred.
- Machine checkpoint verdict: `PASS`.
- Manual paired review remains pending until B1 exists.

### V5 control B1 checkpoint

- Artifact: `eval/qa/results/2026-08-27T18-59-44-variantA.json` in
  `sr-wt-connectors-v5-control`.
- Artifact SHA-256: `78170de4d3879d3a54d248309337500be58b40bb79b4e2bf58238a0c5cf2a295`.
- Preflight surface report: `/tmp/raven-connectors-v5-b1-preflight-surface.json`.
- Preflight report SHA-256: `99506b9bebdeb74a6e2a3cd9318b51f8824495dc934b38ebbbfee1c79d93f3b6`.
- Rows: `8` expected and `8` collected.
- Agent failures: `0`.
- Reported answering costs: `8` expected and `8` collected.
- B1 answering cost: `$2.3726368`.
- Judge calls and judge cost: `0`.
- First-pair answering cost: `$4.6188030`.
- Counted task spend after B1: `$4.9673564`.
- Remaining authorized paid methods: `0`.
- All eight rows reported the `raven` MCP server as `connected`.
- Both arms have identical eight-case and environment hashes.
- The wrapper, runner, server, and control surface matched their pins.
- Preflight and postflight source revisions and surfaces matched.
- The source identity and server process guards matched.
- The runner remained clean.
- The artifact is complete and comparable.
- `comparabilityReasons` is empty, and `postflightError` is null.
- No B1 retry or judge call occurred.
- Machine checkpoint verdict: `PASS`.
- Manual paired review is now required before any next paid method.
- The owned control server stopped, and port `8792` is free.

### V5 first-pair manual review

- Independent reviewer: Grok 4.6, high effort, in owned pane `w3:p1R`.
- Reviewed ledger commit: `177c6042397409754f1bf9c98ab196bbabe98dcd`.
- Report: `/tmp/connectors-v5-first-pair-review.md`.
- Report SHA-256: `244f545c64b18e26a1c8f6e3dc8b964e77f42b61bc68a38be2bcf5488a5c50de`.
- Verdict: `FIRST-PAIR-BLOCK`.
- The reviewer joined all `16` rows to their goldens.
- The reviewer inspected every search projection, execute call, result, error, plan, and answer.
- Treatment lost the required Stellar Docs source on the MoneyGram case.
- Treatment skipped Scout prior-art discovery on the indexer greenfield case.
- Treatment escrow code leaves global state `Disputed` after a partial dispute resolution.
- That state blocks every remaining milestone from delivery, approval, automatic release, or dispute.
- Treatment also called the undefined `service.scout` namespace before repairing the call.
- The closed-world Strupey, partner soft-empty, simulation, and Wasm cases passed in both arms.
- Both arms incorrectly promoted `Stroopy.AI` into the open-world `Strupey` answer.
- Both arms saw Scout label `Stroopy.AI` as a strict match for `q=Strupey`.
- New verified upstream finding: `sls-076`.
- First-pair decision: reject the treatment candidate.
- Do not run B2, A2, judging, retry, replication, or a method rerun.
- Remaining authorized paid methods: `0`.

| Case | Treatment A1 | Control B1 | Pair result |
| --- | --- | --- | --- |
| MoneyGram partnership and SEP-24 | Missing Docs execute | All three source families | Treatment regression |
| Closed-world Strupey directory | Scout-only scoped miss | Scout-only scoped miss | Shared pass |
| Partner detail soft-empty | Correct 404 soft-empty | Correct 404 soft-empty | Shared pass |
| Open-world Strupey history | Promoted `Stroopy.AI` | Promoted `Stroopy.AI` | Shared failure; `sls-076` |
| Simulate transaction | Official RPC evidence | Official RPC evidence | Shared pass |
| `wasm32v1-none` build target | Current Docs, no detour | Current Docs, no detour | Shared pass |
| Escrow greenfield design | Prior art, but frozen dispute lifecycle | Prior art, no global freeze | Treatment regression |
| Indexer greenfield design | No Scout prior-art execute | Scout prior-art execute | Treatment regression |

### V5 replacement qualification command — spent once

```sh
export PATH="/tmp/connectors-contract-eval-bin:$PATH"
unset QA_AGENT_PROMPT_APPEND
unset RAVEN_CLAUDE_ANSWER_MAX_BUDGET_USD
unset RAVEN_CLAUDE_JUDGE_MAX_BUDGET_USD
hash -r
test "$(command -v claude)" = /tmp/connectors-contract-eval-bin/claude
test "$(shasum -a 256 /tmp/connectors-contract-eval-bin/claude | awk '{print $1}')" = a8b9ec4b7c77b2538a5e299e8d900c3793f69d7101c0661cfd1146b76406c297
node eval/qa/run-qa.mjs --variant A \
  --ids q-edge-closed-world-builder-directory-miss \
  --no-judge --port 8792 --model claude-sonnet-5 \
  --server-revision 3966a59e77f2034726088e16be902270753211ae \
  --expect-sha256 1327f7cd332b5c205b9aa236af2c50522fdc3c11f14c7eec200ae8a15f1ee31e \
  --expect-agent-binary-sha256 a8b9ec4b7c77b2538a5e299e8d900c3793f69d7101c0661cfd1146b76406c297
```

Stop after any missing row, agent failure, missing cost, wrapper mismatch,
MCP connection failure, revision mismatch, surface mismatch, or comparability failure.
Do not retry this command under the same authorization.

## Prior evidence

- PR `#69` merged the first harness hardening as `a0bdabe21465c68d466378a1a7a5a47c24e8ec71`.
- PR `#71` merged the MCP isolation correction as
  `94a18c27c6401e54081f5245d29f13b5279cb395`.
- The failed qualification artifact is
  `eval/qa/results/2026-08-27T14-33-04-variantA.json` in the local
  `sr-wt-connectors-product-20260827` worktree.
- That call cost `$0.0479258`.
- The failed row had no connected MCP server, so it supplied no product evidence.
- An earlier seven-call judge self-test cost `$0.0953632`.
- That self-test did not write a results file.
- Its captured command output reported:

```text
paid judge calls: expected=7 actual=7 reportedCosts=7 missingCosts=0 totalCostUsd=0.0953632
self-test GREEN
```

- The self-test did not evaluate the product candidate.
- Total paid spend before the `2026-08-27T15-43-06-variantA.json` call was `$0.1432890`.

## Historical v4 arms

- Control branch: `eval/connectors-v4-control-20260827`.
- Control worktree: `sr-wt-connectors-v4-control`.
- Control commit: `94a18c27c6401e54081f5245d29f13b5279cb395`.
- Treatment branch: `feat/connectors-v4-product-20260827`.
- Treatment worktree: `sr-wt-connectors-v4-product`.
- Treatment commit: `3792571ec4c3ac8b93f8d92debd9e903cafcacb5`.
- The treatment changes only the ten planned product and test files.
- Both arms keep the startup tool descriptions and server instructions.
- Each server and runner use the same clean worktree.
- Only one arm server runs on port `8791` at one time.
- These arm commits lack PR `#72` and cannot serve as new runner commits.

- Control surface SHA-256: `594578b995351e1abee1ec297e03662b51c1bfc4014daac4e39b4d8fa26611f3`.
- Treatment surface SHA-256: `1327f7cd332b5c205b9aa236af2c50522fdc3c11f14c7eec200ae8a15f1ee31e`.
- Both live reports matched their source-revision pins.

| Lane | Commit | Role | Current status |
| --- | --- | --- | --- |
| Control | `94a18c27c6401e54081f5245d29f13b5279cb395` | Historical control | Clean, but lacks PR `#72` |
| Treatment | `3792571ec4c3ac8b93f8d92debd9e903cafcacb5` | Historical held candidate | Clean, but lacks PR `#72` |
| Harness fix | `7389e24880125ccf8fe0657a1435ca753dae52e6` | New rebuild base | Merged through PR `#72` |

## Fixed cases

1. `q-comp-cross-moneygram-partnership-sep24`
2. `q-edge-closed-world-builder-directory-miss`
3. `q-edge-partner-detail-soft-empty`
4. `q-edge-strupey-ambiguous-stellar-history`
5. `q-infra-simulate-transaction-howto`
6. `q-sor-build-target-wasm32v1`
7. `q-soroban-greenfield-escrow-prior-art-preflight`
8. `q-tool-greenfield-indexer-prior-art-preflight`

- Case count: `8`.
- `casesSha256`: `a14f5e2a8ec5d74567acf43ab26ba2cb089d4ef6830fbb6f4a766144f6de2f08`.
- `caseIdsSha256`: `024a68066f02ae2b0a0e3020682f30f2cdd41d66488b5a1b0412095ca0b77b2a`.
- Qualification `casesSha256`:
  `11c46002d8152a55fe558f298158792676e45b1dbe900abcfc131f9567c92680`.
- Qualification `caseIdsSha256`:
  `21e6b68f463f5164c94d7ec272dbbb8868cd9e5a86a8bae15cf249353e463a29`.

## Models and environment

- Answer model: `claude-sonnet-5`.
- Judge model: `claude-sonnet-5`.
- `QA_AGENT_PROMPT_APPEND` stays unset.
- Wrapper: `/tmp/connectors-contract-eval-bin/claude`.
- Wrapper SHA-256: `a8b9ec4b7c77b2538a5e299e8d900c3793f69d7101c0661cfd1146b76406c297`.
- Real Claude path: `$HOME/.local/bin/claude`.
- Claude version: `2.1.247`.
- Claude SHA-256: `5086b9b64d8bb842e1f599cdd3767ab08c6b2266e462fcc5686ae4b019cca8f7`.
- The answering harness must report the explicit `raven` MCP server as connected.
- The answering environment must match across arms.

## Method order

Steps 1 and 2 completed.
Steps 3 and 4 completed once.
Steps 5 and 6 completed and blocked the candidate.
Steps 7 through 10 remain unauthorized.

1. Run one replacement qualification against the treatment without judging.
2. Review its MCP connection, transcript, row count, costs, and comparison stamps.
3. Collect A1 without judging.
4. Collect B1 without judging.
5. Review every search projection, tool call, execute result, plan, and answer.
6. Stop after any treatment regression.
7. If the first pair passes, collect B2 and then A2.
8. Review all four raw artifacts.
9. Judge only after both raw pairs pass.
10. Run the offline plan grader and composition analyzer for all four artifacts.

No retry, repair, rejudge, replication, or method rerun is authorized.

## Mechanism gates

- MoneyGram uses Lumenloop, Scout, and Stellar Docs.
- The closed-world Strupey case stops at the named Scout directory.
- The open-world Strupey case makes one bounded broad pass.
- The open-world case validates identity, source, and date before attribution.
- The partner case distinguishes `soft-empty` from a failed call.
- The simulation case uses official technical evidence.
- The Wasm case avoids an unrelated Scout prior-art pass.
- Both greenfield cases use bounded prior-art discovery.
- Both greenfield cases retain an implementation plan.
- Treatment adds no invalid JavaScript, unknown operation, or envelope error.
- Treatment loses no required source family, plan fact, or correct claim.
- Treatment adds no wrong verdict.
- Repeated disagreement on a required gate makes the result inconclusive.

Aggregate scores are diagnostic.
A verified fact or mechanism regression overrides an aggregate gain.

## Historical v4 cost limits — superseded

These limits governed the stopped attempt.

- The replacement qualification permits one answering call with a `$1.75` cap.
- The first pair permits `16` answering calls.
- Each answering call has a `$1.75` cap.
- The first-pair cap is `$28.00`.
- A passing replication permits `16` more answering calls.
- Judging permits at most `32` calls with a `$0.50` cap each.
- The product comparison permits at most `64` calls and `$72.00`.
- The approved stage allowed at most `72` calls and `$77.25`.
- That ceiling included the prior `$0.0479258` call when the brief was approved.
- The wrapper enforces each call limit.
- Every method rerun needs a new authorization.
- The seven-call self-test and the replacement qualification count toward task spend.
- Counted task spend at the stopped v4 checkpoint was `$0.2386646`.
- That historical authorization has no remaining paid method.

## Stop rules

- Stop without a reconciled independent `LAUNCH-OK` review.
- Stop if `raven` is not connected during replacement qualification.
- Stop if either worktree is dirty or lacks an immutable commit.
- Stop if the treatment diff includes an unplanned file.
- Stop if any case, revision, surface, model, wrapper, or environment pin differs.
- Stop if another Wrangler process conflicts with port `8792`.
- Stop after a missing row, agent failure, missing cost, or wrapper limit.
- Stop after any first-pair mechanism regression.
- Stop after a judge error or comparability failure.

## Historical replacement qualification command — spent

This command ran once and produced a non-comparable artifact.
Do not run it again under this brief.

```sh
export PATH="/tmp/connectors-contract-eval-bin:$PATH"
unset QA_AGENT_PROMPT_APPEND
unset RAVEN_CLAUDE_ANSWER_MAX_BUDGET_USD
unset RAVEN_CLAUDE_JUDGE_MAX_BUDGET_USD
hash -r
test "$(command -v claude)" = /tmp/connectors-contract-eval-bin/claude
test "$(shasum -a 256 /tmp/connectors-contract-eval-bin/claude | awk '{print $1}')" = a8b9ec4b7c77b2538a5e299e8d900c3793f69d7101c0661cfd1146b76406c297
node eval/qa/run-qa.mjs --variant A \
  --ids q-edge-closed-world-builder-directory-miss \
  --no-judge --port 8791 --model claude-sonnet-5 \
  --server-revision 3792571ec4c3ac8b93f8d92debd9e903cafcacb5 \
  --expect-sha256 1327f7cd332b5c205b9aa236af2c50522fdc3c11f14c7eec200ae8a15f1ee31e \
  --expect-agent-binary-sha256 a8b9ec4b7c77b2538a5e299e8d900c3793f69d7101c0661cfd1146b76406c297
```

## Historical v4 free preflight

- Both arms passed `npm run typecheck`.
- Both arms passed `npm run eval:selftest`.
- Both arms compiled the `499`-case QA corpus with SHA-256
  `c29ae61708dc564c0cceb19fe4ae34c444961c297449ebed3bcad5ef41dfa846`.
- Both arms passed the stale corpus lint with `0` errors and `1,390` warnings.
- Both arms passed the routing gate.
- Control passed `87` test files and `1,332` tests.
- Treatment passed `88` test files and `1,340` tests.
- Both arms passed `82` smoke tests.
- Both arms passed the build and secret scan.
- Treatment passed the eight-test connector contract lane.

## Independent review

Before paid work, a Grok high reviewer must inspect this brief, both arm diffs, all pins,
the budget mechanism, and the replacement qualification command.
The reviewer must write `LAUNCH-OK` or list blocking findings.

After collection, reviewers must inspect every raw row and every judge verdict.
The author, orchestrator, and closeout reviewer must differ.

### Pre-spend result

- Reviewer: Grok 4.6, high effort.
- Report: `/tmp/connectors-v4-launch-review.md`.
- Report SHA-256: `322ad0cfbbf32b20643e99346722a2d1d8dce0c275f47775171f31278396f393`.
- Verdict: `LAUNCH-OK`.
- The reviewer confirmed both revisions, both surfaces, the wrapper, the case hashes,
  the ten-file treatment diff, the v4 isolation repair, and one server on port `8791`.
- Every paid command will repeat the wrapper preamble.
- Every product command will carry the exact eight-id list.
- Every arm swap will stop the old server and verify the new live surface.
- Qualification must report `qa-agent-result-v4`, `isolation.safeMode: false`,
  a matching wrapper, a connected `raven` server, no row failure, and a reported cost.
- At review time, the planned remaining scope was `65` calls with `$73.75` in per-call caps.
- That planned scope is now blocked and has no authorization.
- The unnamed slack in the wider ceiling is not authorized as a method.
- The whole treatment commit is the attribution unit.
- `/demo` behavior is outside this QA comparison.

## Historical v4 outcome

The replacement qualification ran once and then stopped on the comparability rule.

- Artifact:
  `eval/qa/results/2026-08-27T15-43-06-variantA.json` in the local
  `sr-wt-connectors-v4-product` worktree.
- Cost: `$0.0953756`.
- Total paid spend for this task is now `$0.2386646`.
- The row used `qa-agent-result-v4` and `isolation.safeMode: false`.
- The wrapper matched and reported its cost.
- The explicit `raven` MCP server was connected.
- The answer completed with three tool calls and no agent failure.
- The postflight failed with `fetch failed`, so comparability was suppressed.
- Wrangler stayed healthy and kept the same listener, revision, worktree, and surface.
- A fresh free postflight passed immediately.
- Free report: `/tmp/raven-connectors-v4-product-postfailure-surface.json`.
- Free report SHA-256: `b2b8f66972fd898a608b975baaffffdb9438a23a01ad0591288a380b88f138bd`.
- The report was captured at `2026-08-27T15:43:29.994Z`.
- It matched treatment revision `3792571ec4c3ac8b93f8d92debd9e903cafcacb5` and the treatment surface pin.

The root cause is a QA harness socket-lifetime defect.
`spawnSync` blocks Node's event loop while Wrangler closes the idle preflight keep-alive socket.
The immediate postflight reused the stale socket and received `ECONNRESET`.

PR `#72` merged the harness fix as
`7389e24880125ccf8fe0657a1435ca753dae52e6`.
The regression test reproduces the failure through `probeLiveSurface` and `fetchLiveSurface`.
The fix protects QA and paid discovery probes with fresh connections.
CI, CodeQL, and the secret scan passed on PR head
`01b0a3d72b3be7937de0c0e82f92f3a36db99b25`.
[Copilot's final review on PR #72](https://github.com/stellar-experimental/stellar-raven/pull/72)
covered all five files on that head and reported no new comments.
Its two earlier comments were fixed, verified, and resolved.

The standards reviewer used Claude Opus at high effort.
Its final report SHA-256 is
`2aae9787d8a1e48040e5f229f2b6c6f1434473ba987b0348c56ba17564f18629`.
It reported no blocking standards finding on `01b0a3d`.
The specification reviewer used Grok 4.6 at high effort.
Its final report SHA-256 is
`8d90592ac67d82fed257ecb6bb5b17791fe14e334a297344891187457a612417`.
It reported no missing requirement, scope issue, or incorrect behavior on `01b0a3d`.
These verdicts and hashes preserve the local review results in this ledger.

No product A/B call ran under the stopped v4 method.
The v5 first pair now has the separate bounded authorization recorded above.
