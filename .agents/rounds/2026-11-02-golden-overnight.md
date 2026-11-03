# Golden QA overnight run — 2026-11-02

## Scope and authorization

The owner requested a long golden QA run through `hc`, with Codex and Grok agents.
The run measures, checks, improves, and documents performance.
The owner excluded all Anthropic agents, including answering and judging agents.
The owner described an overnight work window.
The coordinator asked for a preferred total model cost limit.
The preference remains pending; the coordinator prepared a conservative `$50` evaluation limit.
The owner's run request authorizes the work; the cost question does not request new permission.
Helper subscription costs remain separate when their tools report no dollar amount.
The coordinator will never report those unknown costs as zero.

The starting revision is `ce21317ff46d7491d82caf058baca7328c4177a9`.
The starting worktree was clean.
No existing Wrangler process appeared in the process inventory.

## Agent ownership and routes

The user selected `hc`; this overrides the repository's older Herdr launch commands.
The coordinator read `hc --skill` before launch.
All helpers use persistent interactive terminals with `--outlive-parent`.
Helpers cannot create agents unless the coordinator assigns that authority.

| Terminal | Lane | Model | Effort | Write scope |
|---|---|---|---|---|
| `t55` / `qa-codex-method` | Non-Anthropic measurement feasibility | `gpt-6.1-sol` | high | `tmp/2026-11-02-golden-overnight/` |
| `t56` / `qa-grok-plan` | Independent method and plan challenge | `grok-4.7` | high | `tmp/2026-11-02-golden-overnight/` |
| `t57` / `qa-free-preflight` | Free corpus and routing checks | Shell | — | Generated files and local log |
| `t58` / `qa-baseline-server` | Clean baseline server on port `8790` | Shell | — | Local Worker state |
| `t59` / `qa-remote-pin` | Three-capture remote identity probe | Shell | — | Local probe evidence |
| `t5g` / `qa-provider-access` | Initial free binding-access check | Shell | — | Local probe evidence |
| `t5h` / `qa-provider-access-v2` | Corrected free binding-access check | Shell | — | Local probe evidence |
| `t5q` / `qa-grok-canary-review` | Independent transport-canary review | `grok-4.7` | high | Method-worktree `tmp/` report |
| `t5r` / `qa-transport-canary` | Method 1, one paid transport probe | Node | — | Method-worktree canary artifact |
| `t5v` / `qa-remote-pin-v2` | Fresh stable remote probe | Shell | — | Local probe evidence |
| `t64` / `qa-method-checks` | Unit tests, build, and eval self-tests | Shell | — | Method-worktree check log |
| `t6h` / `qa-transport-v2` | Method 2, corrected transport check | Node | — | Direct-Grok transport result |

The installed CLIs are Codex `0.166.0` and Grok `1.0.70`.
Their local catalogs include the selected models and high effort.
Both model agents started and received their first tasks.
No Anthropic helper was launched.

## Pre-spend brief — draft, not cleared

### Question

Can Codex and Grok answer the golden questions accurately through the exposed Raven tools?
Which failures belong to the agent, judge, golden, repository, or upstream service?
Which general repairs produce a measured improvement?

### Method boundary

The existing canonical QA runner launches Claude for answers and judgments.
A model name override cannot change that executable contract.
The method lane must establish a genuine non-Anthropic adapter before collection.
Codex implements and checks that adapter in the isolated `codex/golden-2026-11-02-method` branch.
Its worktree is `/Users/kalepail/Desktop/stellar-raven-codemode-worktrees/golden-2026-11-02-method`.
The candidate diagnostic uses direct model `xai/grok-4.7` at high effort for answers and judgments.
The official model page confirms function calling and high effort.
Runtime availability and cost reporting still require the reviewed canary.
Codex owns implementation, verification, and result analysis.
Grok owns independent challenge and judgment review.
The coordinator owns the morning handoff and every terminal listed in this file.
No new evaluation call may start after `2026-11-03T10:00:00Z`.
No binary wrapper can impersonate Claude.
No new model result can claim comparability with the existing Anthropic baseline.
Any different measurement contract must receive an explicit diagnostic label.
The canonical corpus, rubric, evidence pack, and lifecycle partition remain authoritative inputs.

### Required pins before paid calls

- Exact selected IDs, their order, content hashes, and lifecycle states.
- Answering model, judge model, effort, tool restrictions, and model fallback policy.
- Immutable executable paths, versions, hashes, and environment identity.
- Runner implementation, server revision, complete MCP surface, and stable remote identity.
- One enforceable method budget and a separate reserve for reviewed validation.
- Bounded answer, judge, retry, panel, and self-test call counts.
- A pre-spend review from Grok, with every finding reconciled.

The method must stop before another paid call after missing cost data or an identity failure.
Incomplete runs retain all selected IDs and suppress aggregate quality claims.
The coordinator must read reported costs, not infer zero from a subscription or missing data.
No matching non-Anthropic cost baseline is established yet.
The coordinator inspected 347 saved JSON artifacts and found no matching Codex or Grok model tuple.

### Method amendment: direct provider path

The CLI audit found two obstacles: MCP dispatch file arguments and potentially missing OAuth costs.
The coordinator did not weaken the tool boundary or treat missing costs as zero.
The coordinator checked the documented Cloudflare REST and Node binding paths without model calls.

The normal Wrangler OAuth token can identify the project account.
The host REST Gateway read returned `403`, with error code `10000`.
The host model search returned no Grok entry.
Neither result establishes direct REST inference availability.
That path remains unused.

The documented `getPlatformProxy` path exposes the remote AI binding in Node.
The coordinator used a minimal ignored config containing only that binding.
The proxy used `envFiles: []` and `persist: false`.
Its environment contained only `AI`.
A Gateway read for a nonexistent log returned `Log not found`, rather than an authentication failure.
No model call occurred.
Evidence: `tmp/2026-11-02-golden-overnight/provider-access-v2.log` and `provider-access.mjs`.

The first probe used `node --input-type=module` and failed inside Wrangler's worker startup.
The corrected probe used a real `.mjs` file and exited `0`.
Both probes disposed of their temporary binding proxies.
Neither probe created a second `wrangler dev` process or changed a production route.

Codex now implements a separate direct-provider diagnostic through that binding.
The host owns the model loop and exposes only the pinned MCP `search` and `execute` schemas.
Judging exposes no tools.
Every provider step must settle its Gateway-reported cost before the next provider step.
The model receives no filesystem, shell, memory, plugin, or other MCP capability.
The model receives no golden content during answering.
The method has no provider fallback or automatic model retry.

The diagnostic pins Node, Wrangler, provider dependencies, adapter sources, model settings, selected inputs, and live server identities.
It does not measure the Grok CLI or Codex CLI answering harness.
The CLI model agents remain the implementation and independent-review workers.
The direct-provider contract requires a fresh exact-command review before any paid canary.

Primary references:

- <https://developers.cloudflare.com/ai-gateway/usage/rest-api/>
- <https://developers.cloudflare.com/workers/wrangler/api/>
- <https://developers.cloudflare.com/api/resources/ai_gateway/subresources/logs/methods/get/>
- <https://developers.cloudflare.com/ai/models/xai/grok-4.7/>

### Candidate allocation and selection

These allocations are draft limits, not cleared launch commands.

| Method | Maximum calls | Method limit |
|---|---|---|
| New judge adapter self-test | Seven judge calls | `$3.50` |
| Cost and tool-isolation canary | One answer call | `$1.00` |
| Frozen baseline | 100 answers and 100 single judgments | `$30.00` |
| Matched validation after reviewed repairs | Selection and calls require a later amendment | `$10.00` |
| Unallocated reserve | No calls authorized | `$5.50` |

The baseline has no automatic answer retry, judge retry, or panel escalation.
The direct-provider amendment must also bound provider steps within each answer turn.
Each call receives the remaining method authorization.
Reported costs stop the next call; the last call can exceed its remaining authorization.
A last-call excess invalidates the method and prevents further spending.

The frozen candidate sample contains 100 of 501 active battery cases.
The canonical `stratifiedSample` function selected the sample before any new score existed.
The selection has 48 Docs, 28 Scout, 13 Lumenloop, seven skill, and four none-service cases.
Exact IDs and hashes are in `tmp/2026-11-02-golden-overnight/selection100.json`.
The ordered ID hash is `2aff18e4569a80e971cd089d6deb3a0ed2c7ed2189e2870f27248c1f3705d873`.
The selected content hash is `d449d980f4a9251f9847586970fe4c627d5f3856a35d948aeecac5983913f4e7`.
The compiled `eval/qa/cases.json` byte hash is `1ec9f413f07de80aa8d3c6c4ed62ddf1adaaa5bc8ab85f465c8833d029e96ba0`.
Grok independently reproduced the selection and its hashes.
The sample covers all 10 categories and eight traps.
Its freshness groups contain 32 live, 38 scheduled, and 30 stable cases.

### Planned sequence

1. Run the free preflight and inspect existing instructions and results.
2. Establish and verify the non-Anthropic measurement method.
3. Freeze the sample, costs, identities, call counts, and stop conditions.
4. Complete the independent pre-spend review and reconcile each finding.
5. Run one bounded baseline method, then inspect every completed result.
6. Check wrong and partial answers against live evidence.
7. File repository work in `.agents/TODO.md` and upstream findings in `improvements/`.
8. Apply only general repairs supported by repeated failures or a reproducible contract defect.
9. Review each repair before a separately bounded matched-case validation.
10. Finish an independent closeout review and record all remaining limits.

No rerun receives automatic authorization from unused funds.
Each method needs a written bounded authorization in this ledger before launch.
Golden edits require `golden-truth` evidence and independent review.
The run does not authorize deployment, upstream messages, or unrelated inventory changes.

### Interpretation rules

Keep the battery, live-data, digest, routing, and model lanes separate.
Report coverage before conditional accuracy.
Read wrong counts before correct counts.
Inspect every answer and judgment before closeout.
Treat single-case wording failures as monitor-only unless a contract defect reproduces.
Never tune descriptions or goldens to a failed question.
Predeclare affected IDs before any repair comparison.
Claim diagnostic evidence when attribution or comparison identity cannot be established.

## Free preflight

Log: `tmp/2026-11-02-golden-overnight/free-preflight.log`.
The check sequence runs self-tests, routing compilation, QA compilation, corpus lint, register checks, and routing gates.
The complete sequence exited `0`.
Self-tests, both compilations, stale/floor corpus lint, register checks, and the three routing gates passed.
Corpus lint retained existing sourcing-guard warnings.
The local gospel diff lane was skipped because this round changed no golden input.
The legacy protocol-history diagnostic failed; it is separate from the three passing routing gates.
The routing artifact is `eval/results/routing-2026-11-02T22-29-35-676Z.json`.

The baseline server runs from an isolated clean worktree at the starting revision.
The worktree is `/Users/kalepail/Desktop/stellar-raven-codemode-worktrees/golden-2026-11-02-baseline`.
The complete surface has only `search` and `execute`.
Its hash is `bb19653bd0d153964df25042a92d42dde49d8c5b48f7face2fc1d17614786762`.
The initial report is `tmp/2026-11-02-golden-overnight/baseline-surface.json`.
The later checked report is `tmp/2026-11-02-golden-overnight/baseline-surface-checked.json`.
It confirms both the expected surface hash and server revision.
A real MCP search call succeeded without an error.
Its evidence is `tmp/2026-11-02-golden-overnight/search-preflight.json`.

The three-capture stable remote probe exited `0`.
Its vector hash is `0857e9a11f51b085afe6128227e45379fb8d041199ed2de24c034974a0e70430`.
Its output is `tmp/2026-11-02-golden-overnight/remote-sha256.txt`.

The saved migration check flags two selected cases with old failing source paths.
The coordinator checked those paths against current source fields before treating them as defects.
`q-mpp-discovery-and-modes` already cites the working `/docs/build/agentic-payments/mpp` page.
Its old path appears only in historical verification evidence, which remains unchanged.
`q-edge-noinfo-stellar-pos-staking-rewards` still has the old lumens path in `truth.sources`.
The working lumens path is `/docs/learn/fundamentals/lumens`.
These checks do not change either case or the fixed denominator.
Evidence: `tmp/2026-11-02-golden-overnight/preexisting-corpus-health.json`.

## Baseline and result review

Pending the method review and budget answer.

## Repairs and findings

Pending evidence.

## Independent review

The Grok helper owns the pre-spend challenge.
An independent reviewer must finish the closeout review before completion.
Grok supplies that independent review because Codex owns implementation and coordination.

Initial reports:

- `tmp/2026-11-02-golden-overnight/grok-initial.md`
- `tmp/2026-11-02-golden-overnight/grok-prespend-review.md`
- `tmp/2026-11-02-golden-overnight/grok-amendment-review.md`

Those reports correctly withheld paid launch while implementation and pins were absent.
The direct-provider amendment replaces their earlier CLI assumptions.
The following reconciliation does not clear any paid command.

| Finding | Reconciliation |
|---|---|
| Missing method and pins | The new canary has a separate source and pin manifest; independent review remains open. |
| Missing sample | Grok reproduced the fixed 100-case selection and all recorded hashes. |
| Missing numeric budget | The ledger now names the `$50` instrument envelope and separate method limits. |
| Unknown helper costs | They remain separate and unknown; no all-session cost guarantee is claimed. |
| Missing call limits | The canary, self-test, and baseline have separate counts; provider-step limits remain pending. |
| Wider helper sandbox | Capability does not authorize extra writes; the narrow assigned write scope remains binding. |
| Missing morning owner | The coordinator owns the handoff; the ledger sets a hard new-call deadline. |
| Premature improvement claim | The baseline establishes a diagnostic; every repair comparison requires a later reviewed amendment. |
| Missing variance estimate | No matching Grok estimate exists; the baseline supports no significance or regression claim. |
| Pack mapping | The adapter must prove canonical execute evidence reaches the existing pack without changing its semantics. |
| Surface report unchecked | The later report explicitly checks the expected surface hash and server revision. |

The canary author supplied eight passing mocked tests.
The independent canary reviewer must inspect the exact command before launch.
No original Claude self-test wrapper is authorized.

### Transport canary authorization — method 1

Grok `grok-4.7` at high effort cleared the exact canary command.
Review: method-worktree `tmp/2026-11-02-golden-overnight/grok-canary-review.md`.
The reviewer checked all 160 pinned files and found no blocking issue.
The method permits one provider request, with a `$1` method limit.
The model is `xai/grok-4.7`, at high effort, with 256 output tokens and no tools.
There is no fallback, retry, golden question, or accuracy claim.
The method pin-file hash is `834ec59c15acd89deb12e6739fb16c0f48e3cadbc8c80e7a911766ff322a43cc`.

The coordinator identified two limits outside that review's blocking findings.
The canary does not hash its inherited environment.
Its deadline prevents a new dispatch but does not cancel a request already in progress.
The coordinator accepts those stated limits for this single provider-transport probe.
Neither limit is accepted for the later QA collection.
The later runner must pin its environment and bound inference time before launch.
No source change or rerun is authorized by this canary authorization.

Exact command, from the method worktree:

```sh
node eval/qa/non-anthropic/canary.mjs \
  --pins tmp/2026-11-02-golden-overnight/canary-pins-v1.json \
  --expect-pins-sha256 834ec59c15acd89deb12e6739fb16c0f48e3cadbc8c80e7a911766ff322a43cc \
  --out tmp/2026-11-02-golden-overnight/canary-result-v1.json \
  --max-budget-usd 1
```

The `$1` allocation belongs to this method only.
Unknown or excessive cost stops all later evaluation spending until reconciliation.
The provider-only artifact always suppresses quality aggregates.

The initial plan reviewer reported `$1.9070362` through four helper turns.
That snapshot excludes its current turn and all other helpers.
It remains outside the evaluation limit and does not establish total helper cost.

### Method 1 result

The exact reviewed canary exited `1`.
It attempted one provider request from `2026-11-02T23:05:09.367Z` to `2026-11-02T23:05:13.058Z`.
The latency was approximately `3691.4 ms`.
The artifact is method-worktree `tmp/2026-11-02-golden-overnight/canary-result-v1.json`.
Its status is `invalid`, with failure `provider-cost-incomplete`.
Its receipt error is `missing-or-duplicate-answer-log-id`.
The artifact has no response status, log ID, parsed completion, or reported cost.

The reported subtotal `0` is not the call's cost.
The call's cost remains unknown.
The full `$1` method allocation remains reserved during reconciliation.
No retry, judge self-test, or baseline call is authorized.
The coordinator stopped all further evaluation spending and requested free failure analysis.
The source, pins, and invalid artifact remain unchanged as evidence.

The independent failure review confirmed a Node response-class defect.
Miniflare rebuilds the binding response with its own `Response` constructor.
That constructor differs from Node's global `Response` constructor.
The accounting wrapper therefore skipped the log header and did not request its cost.
A free reproduction used the installed Miniflare class and made zero inference requests.
The reproduction retained a valid fixture header but made zero cost reads.

Failure review: method-worktree `tmp/2026-11-02-golden-overnight/grok-canary-failure.md`.
The artifact cannot establish whether the provider response succeeded or returned an HTTP error.
The source defect explains the missing local evidence, without establishing the upstream outcome.
The original response and its log ID cannot be recovered from the saved artifact.
The host REST credential cannot search Gateway logs.
Browser access also failed, so no dashboard cost record was retrieved.

The fix normalizes only the installed Miniflare response class at the Node boundary.
It preserves the real status, headers, and body.
The coordinator rejected broad duck typing and a production accounting change for this Node-only defect.
The existing Worker runtime keeps its current response handling.

V1 source snapshots remain in method-worktree `tmp/2026-11-02-golden-overnight/canary-v1-source/`.
The next transport method requires new pins, an independent review, and its own bounded authorization.
The original `$1` stays fully reserved as unknown spend.

### Reconciliation and candidate method 2

Method 1 is closed as invalid and will not resume.
Its missing cost remains unresolved; the ledger reserves its full `$1` allocation.
The coordinator will not claim a complete all-method spend total.
The failed method supplied no QA result and cannot enter a score comparison.

The coordinator accepts the failure review's response-class evidence.
Its instruction against another call applies while the defect and method authorization remain unresolved.
A corrected method requires a distinct plan, output, pin manifest, independent review, and bounded authorization.
No retry uses method 1's unused-looking ledger balance.

The candidate method 2 allocation is `$1`, taken from the unallocated reserve.
The remaining unallocated reserve becomes `$4.50` if that method receives launch clearance.
The self-test, baseline, and conditional validation allocations remain `$3.50`, `$30`, and `$10`.
Including the original reserved `$1`, these allocations still total `$50`.
These are allocation ceilings, not reported costs or a provider-side dollar guarantee.

Method 2 will exercise the corrected response boundary and the full environment and timeout controls.
It will make one tool-free `READY` request with 256 output tokens.
It will not answer a golden question or claim QA quality.
The coordinator has not cleared its paid launch yet.

### Corrected runner verification and final plan packet

The author froze the corrected runner on `codex/golden-2026-11-02-method`.
The handoff is method-worktree `tmp/2026-11-02-golden-overnight/full-runner-handoff.md`.
It lists the source files, controls, commands, and evidence limits.
The original canary source, pins, and result remain unchanged.

The new runner uses a persistent owned provider child with a parent timeout backstop.
The parent records response class, status, log identity, cost observations, and outcomes incrementally.
The child normalizes genuine Miniflare Responses before the existing accounting wrapper reads them.
The runner rejects other response-like objects.

Thirteen targeted tests and type checking passed.
The full test run passed 148 files: 3112 tests passed and three tests had expected failures.
The build and eval self-test passed.
Log: method-worktree `tmp/2026-11-02-golden-overnight/method-checks.log`.

Free preparation found that `HC_SCOPE` changes with each `hc` terminal.
Two free environment probes found only `HC_SCOPE` and `HC_TERMINAL_ID` differed.
The runner already excluded `HC_TERMINAL_ID`.
The author added `HC_SCOPE` to the explicit terminal-bookkeeping exclusions.
The targeted tests and type check passed again.
Provider, authentication, routing, and Node settings remain part of the environment identity.

The fresh three-capture remote probe exited `0` with the same vector hash.
Evidence: `tmp/2026-11-02-golden-overnight/remote-sha256-v2.txt`.

The final packet lives under method-worktree `eval/local-lanes/direct-grok/2026-11-02/`.
This ignored directory keeps the new contract outside historical QA and judge-stability inputs.
The packet index is `launch-commands-r2.json`.
All three final plans passed free validation, with zero inference calls.
The self-test and baseline also matched the real server, tool surface, corpus, selection, and remote identities.

| Method | Final plan | Plan SHA-256 | Limit |
|---|---|---|---|
| Corrected transport | `transport-v2-plan-r2.json` | `56a819c8abfde933ae400e25f298630cb537b15fc66d56ee71761f73218e6b06` | One provider call, `$1` |
| Original judge self-tests | `selftest-v1-plan-r2.json` | `c79fa1e3fc9bf9ea8ccbc49f069f7629b1cfd226b3cb3ef93e0d1f60f05aa2e7` | Seven calls, `$3.50` |
| Frozen baseline | `baseline-v1-plan-r2.json` | `169e0c8444abd7d85826d6e9c7638d948dd347fae6aebf598179959a8a95fc62` | 100 questions, at most 1700 provider calls, `$30` |

All final parent and provider-worker environment digests match:
`6c147a657076b6a39c3f64e0169008b48b921fdee3a75e81e05989f7a17e7b96`.
Each plan retains its own loaded-source manifest and file hash.
The plan packet does not itself authorize a paid launch.
The corrected transport must pass before the self-test.
All seven original self-tests must pass before the baseline.
The independent exact-command reviews remain open.

### Corrected transport authorization — method 2

Grok `grok-4.7` at high effort cleared the exact corrected transport command.
Review: method-worktree `tmp/2026-11-02-golden-overnight/grok-transport-v2-final-review.md`.
The reviewer checked 133 parent file records and 161 provider-worker file records.
Both environment digests and the free validation receipt match the reviewed plan.
The result path and temporary path were absent.

The coordinator authorizes one new provider call under the separate `$1` allocation.
The unallocated reserve is now `$4.50`.
Method 1's full `$1` remains reserved with unknown actual cost.
Method 2 does not resume or repair that old artifact.

A second review raised a missing `cf-aig-max-attempts` header as a blocker.
The coordinator checked the selected native API before changing code.
`AI.run` accepts structured `GatewayOptions.retries.maxAttempts` and receives the explicit value `1`.
Pinned workerd serializes that gateway option into its native request body.
The universal `gateway().run` path uses a different transport.
The coordinator rejects the header-only claim without evidence that the native retry option is ignored.
This reconciliation does not clear the future QA methods or an unbounded retry.
Source: <https://raw.githubusercontent.com/cloudflare/workerd/v1.20261023.1/src/cloudflare/internal/ai-api.ts>.

Exact command, from the method worktree:

```sh
node eval/qa/non-anthropic/run.mjs \
  --mode transport-canary \
  --plan eval/local-lanes/direct-grok/2026-11-02/transport-v2-plan-r2.json \
  --expect-plan-sha256 56a819c8abfde933ae400e25f298630cb537b15fc66d56ee71761f73218e6b06 \
  --out eval/local-lanes/direct-grok/2026-11-02/transport-v2-result.json \
  --max-budget-usd 1
```

The method permits 256 output tokens, no tools, no fallback, and no retry.
Its request timeout is `120000 ms`; its host backstop is `127000 ms`.
The hard new-call deadline remains `2026-11-03T10:00:00Z`.
Missing cost, excessive cost, or changed identity stops the method without a repeat.
The self-test and baseline remain separately gated.

### Method 2 result

The exact corrected transport command exited `0`.
Result: method-worktree `eval/local-lanes/direct-grok/2026-11-02/transport-v2-result.json`.
The result is `complete`, with no invalid reason and exactly one raw provider request.
The provider returned HTTP `200` and the text `READY`.
The recorded response class is `miniflare-response`.
This live result confirms the boundary normalization works for the selected binding path.

The Gateway reported `$0.00145`.
The provider reported `14500000` native cost ticks, which also equal `$0.00145`.
The method has one reported cost and zero missing costs.
The provider-call latency was approximately `5193.2 ms`.
Final source and environment identities matched their pins.

Method 2 proves provider transport and cost reporting only.
It supplies no golden answer score or judge-quality result.
Method 1 still has unknown cost and keeps its full `$1` reserved.
No complete cross-method spend total is claimed.
The self-test and baseline remain unlaunched.

### Original judge self-test authorization — method 3

The independent r2 review conditionally cleared the exact self-test command after transport passed.
Review: `tmp/2026-11-02-golden-overnight/grok-runner-r2-review.md`.
Method 2 passed with one complete reported cost, so that launch condition is satisfied.
The native retry control, current environment pins, and source hashes are reconciled in that review.

The coordinator authorizes one self-test method with the seven original candidates.
The method limit is `$3.50`, with at most `$0.50` for each candidate.
The method has no automatic retry, panel, fallback, or golden-answer collection.
The injected direct-Grok adapter handles every judge call.
The canonical Claude wrapper remains unused.

Exact command, from the method worktree:

```sh
node eval/qa/non-anthropic/run.mjs \
  --mode selftest \
  --plan eval/local-lanes/direct-grok/2026-11-02/selftest-v1-plan-r2.json \
  --expect-plan-sha256 c79fa1e3fc9bf9ea8ccbc49f069f7629b1cfd226b3cb3ef93e0d1f60f05aa2e7 \
  --out eval/local-lanes/direct-grok/2026-11-02/selftest-v1-result.json \
  --max-budget-usd 3.50
```

A pass requires exit `0`, `selftestPassed: true`, seven original candidates, and seven complete cost records.
The coordinator will check every candidate grade before baseline launch.
A `complete` status alone does not establish a pass.
The stricter JSON parser remains an adapter robustness check, without any rubric or golden change.
Its behavior remains visible in this bounded self-test; parser failures cannot become answer failures.
No baseline call is authorized by this self-test authorization.

### Method 3 result

The exact self-test command exited `0`.
Result: method-worktree `eval/local-lanes/direct-grok/2026-11-02/selftest-v1-result.json`.
It contains all seven original candidates, with `selftestPassed: true`.
Every expected grade matched.
The observed grades were `correct`, `partial`, `wrong`, `correct`, `correct`, `wrong`, and `wrong`.
The last two candidates require a grade other than `correct`.
Each call reported a complete cost below `$0.50`.
The method reported `$0.078992`, with zero missing costs and no invalid reason.
Final local and remote identity checks passed.
The strict parser accepted all seven native judge responses.

### Frozen baseline authorization — method 4

The independent r2 review conditionally cleared the exact baseline command after both earlier methods passed.
Those conditions are now satisfied by method 2 and method 3.
The coordinator checked every self-test row and its cost before this authorization.

The coordinator authorizes one diagnostic collection on the frozen 100 active cases.
The allocation is `$30` for this method only.
It permits at most 16 provider requests per answering turn and one judge request per answered case.
The raw-provider ceiling is 1700 requests across the method.
Every request permits at most 8192 output tokens.
There is no retry, panel, fallback, resume, or silent case replacement.
The original seven-case self-test stays separate from this 100-case denominator.

Exact command, from the method worktree:

```sh
node eval/qa/non-anthropic/run.mjs \
  --mode baseline \
  --plan eval/local-lanes/direct-grok/2026-11-02/baseline-v1-plan-r2.json \
  --expect-plan-sha256 169e0c8444abd7d85826d6e9c7638d948dd347fae6aebf598179959a8a95fc62 \
  --out eval/local-lanes/direct-grok/2026-11-02/baseline-v1-result.json \
  --max-budget-usd 30
```

The frozen source, environment, corpus, selection, listener, surface, and remote vector remain required.
The fresh stable probe for this baseline authorization is the completed `t5v` capture.
The runner repeats live remote checks around answering turns and during final verification.
The hard new-call deadline remains `2026-11-03T10:00:00Z`.
Any parser failure remains a harness failure, never a wrong answer by assumption.
Missing cost, identity failure, or incomplete collection suppresses aggregate quality claims.
The coordinator will review wrong and partial rows first, then every completed row.
This authorization permits no runtime repair, golden edit, comparison claim, deployment, or upstream message.

### Method 4 result and free repair

The baseline exited `1` at `2026-11-02T23:49:30.385Z`.
Its artifact is `baseline-v1-result.json` in the method directory above.
Its status is `invalid-or-incomplete`; its aggregate remains suppressed.
The selected denominator remains `100`.
Three completed rows have original `correct` verdicts.
The fourth row stopped with `worker-request-identity-mismatch`.
The artifact records 28 provider attempts, 27 observed raw starts, and 27 complete costs.
Reported spend is `$0.9093`; one complete cost remains unknown.
Final remote identity matched, while the stopped worker prevented final local verification.
This artifact will never resume or supply an overall accuracy claim.

The coordinator preserved all original source files under method-worktree `tmp/2026-11-02-golden-overnight/baseline-v1-source/`.
Codex workhorse `gpt-6.1-sol`, at `xhigh`, investigated the asynchronous failure in terminal `t6n`.
The earlier `high` review missed this subtle failure, which supports the effort increase.
Its free reproduction confirmed that a delayed Gateway log read can emit evidence after its request ends.
The client correctly rejects that stale request identity during a later identity check.
The repair closes the evidence producer before its terminal result.
It preserves strict client identity validation and valid pre-result costs.
The exact incident message remains unrecorded; this source defect strongly explains the incident.
The focused 60 tests and typecheck passed without inference.
The report is method-worktree `tmp/2026-11-02-golden-overnight/ipc-fix-report.md`.
Grok independently reviews this repair before any new paid authorization.

The next adapter delta aligns verdict extraction with the existing canonical judge.
The earlier strict parser could reject valid fenced verdict JSON.
This alignment permits no rubric, prompt, evidence-pack, provider, or golden change.
A fresh seven-candidate self-test remains mandatory before another baseline.
New source pins and new bounded method authorizations remain mandatory.

### Read-only Gateway cost recovery

The installed `cf` CLI has an existing OAuth grant with Gateway read access.
Wrangler's existing OAuth grant lacked that access.
The coordinator used `cf ai-gateway logs list` and `get` without credential changes.
Saved evidence contains only request metadata and costs, without bodies, credentials, or production aggregates.

A unique Gateway record matches method 1's model, Gateway, time, and one-token output.
Its ID is `01a19e82-6ac7-7759-8c96-6674a61fb35e`.
It reports `$0.000952`, status `200`, and no cache hit.
Payload logging was disabled, so the association cannot prove the prompt bytes.
The original artifact remains invalid and unchanged.
The coordinator retains its `$1` reserve pending independent reconciliation.

A later Gateway search found no request after the baseline's last observed response.
Attempt 28 still has no observed raw start or complete cost.
Log absence alone does not establish zero spend.
Saved main-worktree evidence is under `tmp/2026-11-02-golden-overnight/`:
`method1-gateway-candidates.json`, `method1-gateway-detail.json`, and `baseline-failure-gateway-candidates.json`.

### Completed-row review

Codex reviewed every completed baseline row against its frozen golden and primary sources.
The three packet hashes match the final invalid artifact.
The two asset answers repeat incomplete issuer-lock guidance concerning additional signers.
The SEP-30 answer matches its primary sources.
Original scores remain unchanged, and no percentage claim follows from these three rows.
The source gap enters the local improvements workflow, with no external issue creation.
The review index is method-worktree `eval/local-lanes/direct-grok/2026-11-02/reviews/shard1.md`.

### Second collection packet — review pending

The IPC repair and canonical parser alignment are frozen.
The freeze receipt is method-worktree `tmp/2026-11-02-golden-overnight/full-runner-source-freeze-v3.json`.
Its SHA-256 is `825407be750e39d5cebe34559ec91a09def6dda35824d9177daeb72045a8ddf4`.
The parser report is beside the IPC report.
It compares the adapter against the actual canonical judge with a mocked process boundary.
All 52 focused parser and runner tests passed.
Typecheck passed.
The full test command added `--exclude "tmp/**"` to exclude preserved source snapshots.
It passed 148 test files, with 3143 passes and three expected failures.
Build, free eval self-test, and improvements lint also passed.

All three new loaded-source preparations and free plan validations exited `0`.
The exact packet is main-worktree `tmp/2026-11-02-golden-overnight/second-run-packet.json`.
It contains these independent method plans:

| Method | Plan | SHA-256 | Proposed allocation |
| --- | --- | --- | ---: |
| 5: transport | `transport-v3-plan.json` | `40f835dab24eb9284dfaa12dd558f587f48100a338f4dfd6ecf95ba081c86daa` | `$1` |
| 6: seven original self-tests | `selftest-v2-plan.json` | `a29895db5211a4ce384ff0e09de1fbcf0ea5fd00358d9c542fd8326518bcdcab` | `$3.50` |
| 7: fixed 100 cases | `baseline-v2-plan.json` | `25ca3f413e9ef7aaa784347710e1f1e0d2c3b10c067de1559916e9229e5ab9c8` | `$30` |

These files live under method-worktree `eval/local-lanes/direct-grok/2026-11-02/`.
This packet alone authorizes no inference.
Each paid method still needs independent clearance and its own bounded authorization below.
The transport must pass before self-tests.
All seven self-tests must pass before baseline collection.
Self-tests use fresh stable probe `t6x`; baseline uses separate fresh stable probe `t75`.
Each probe requires three matching vectors, five minutes apart.
The expected remote vector remains `0857e9a11f51b085afe6128227e45379fb8d041199ed2de24c034974a0e70430`.

The new allocation retains the original `$1` unknown-cost reserve.
It adds a `$5` policy reserve for the baseline's unknown attempt 28.
That reserve is a policy buffer, rather than a proven provider charge bound.
Known reported evaluation spend is `$0.989742` before this packet.
The three proposed methods and reserves leave `$8.510258` within the assumed `$50` evaluation envelope.
This table does not include helper subscriptions or claim a whole-session USD guarantee.
The original unknown methods remain invalid.
The independent allocation review accepted this arithmetic without treating unknown charges as zero.
Its report is `tmp/2026-11-02-golden-overnight/grok-round-allocation-review.md` in the main worktree.

The complete Gateway join matches all 27 baseline log IDs and exact costs.
No unmatched or missing request appears in that query.
The saved corrected join is `tmp/2026-11-02-golden-overnight/baseline-gateway-joined.json` in the main worktree.
The earlier derived join used the wrong field; this corrected join uses `response.logId`.
Neither join changes the original result artifact or resolves attempt 28's unknown cost.

Offline plan review joins frozen case tags in memory.
It maps plain `search` to the existing grader's MCP name only in its temporary input view.
The original transcripts retain their actual names.
The corrected diagnostic artifact is method-worktree `eval/local-lanes/direct-grok/2026-11-02/baseline-v1.offline-plan-v2.json`.
It suppresses aggregates and records all four observed rows against the selected denominator `100`.
Observed performance telemetry is beside it in `baseline-v1.performance.json`.
Latency includes cost settlement, and case duration includes tool calls and identity checks.
Neither observed telemetry nor plan review restores the failed method's validity.

### Readability audit and disposition

Grok audited all 14 diagnostic source, documentation, and test files against freeze v3.
The report is main-worktree `tmp/2026-11-02-golden-overnight/grok-reviewability-audit.md`.
It found an unused plan validator and the superseded canary launcher.
It also found duplicated experiment constants and an oversized README.
These repairs remain deferred while collection freezes the source.
The diagnostic stays on its experiment branch and will not merge into the production branch as a reusable QA tool.
Any future supported non-Anthropic lane needs its own scoped design and review.

The report correctly distinguishes v3 from the sources that produced methods 1 through 4.
The earlier source snapshots and result pins remain unchanged.
The new packet uses v3 only for methods 5 through 7.
This explicit separation resolves the source-attribution concern without changing historical evidence.
The accepted parser alignment still throws on invalid scores, while the canonical adapter returns a parse-error verdict.
Both paths represent infrastructure errors, and neither assigns an answer failure from malformed judge output.

The verified local source finding is method-worktree `improvements/stellar-docs/sd-080-issuer-lock-omits-other-signers.md`.
Its generated index and improvements lint passed.
Grok independently reviews its primary evidence and claim scope before closeout.
No external filing is authorized.

### Method 5 authorization — corrected transport after the IPC repair

The independent second-run review completed in terminal `t5q` with status `done`.
It cleared the exact transport command and conditionally accepted the later command texts.
The report is main-worktree `tmp/2026-11-02-golden-overnight/grok-second-run-prespend-review.md`.
No unresolved finding blocks this transport.

The coordinator authorizes one provider transport call with the frozen v3 source and a `$1` allocation.
This call permits 256 output tokens and no tools.
It permits no retry, fallback, QA collection, resume, or automatic later launch.
The deadline remains `2026-11-03T10:00:00Z`.

Exact command, from the method worktree:

```sh
node eval/qa/non-anthropic/run.mjs \
  --mode transport-canary \
  --plan eval/local-lanes/direct-grok/2026-11-02/transport-v3-plan.json \
  --expect-plan-sha256 40f835dab24eb9284dfaa12dd558f587f48100a338f4dfd6ecf95ba081c86daa \
  --out eval/local-lanes/direct-grok/2026-11-02/transport-v3-result.json \
  --max-budget-usd 1
```

The coordinator will check exit status, `READY`, one raw call, complete cost, and final identities before method 6.

### Method 5 result — model response mismatch

Terminal `t79` exited `1`.
The artifact retains `invalid-or-incomplete` and `transport-response-mismatch`.
It records one raw call, HTTP `200`, and a recognized Miniflare response.
Gateway cost is complete at `$0.005392`.
The native reported ticks independently equal that amount.
Final identity checks passed.
The model returned a nonempty assistant answer that refused the harmless exact-phrase instruction.
It did not return `READY`.

The original gate therefore blocks methods 6 and 7.
No later method launches automatically, and method 5 will not resume.
Grok reviews the first failed boundary and the proposed prerequisite amendment before any more spend.
That amendment may use the observed transport evidence to test the seven actual original judge candidates.
It may not retroactively pass method 5, change its artifact, or claim QA quality.
No source, prompt, golden, or provider repair follows from this single response.

### Proposed prerequisite amendment — no additional canary

The coordinator proposes using method 5's observed transport receipt as the prerequisite for method 6 only.
Its HTTP, response class, model identity, single-call count, complete cost, and final identity evidence are present.
Its exact-phrase behavior still fails, and its original status stays invalid.
This amendment changes the next launch prerequisite, rather than the completed method's result.
The seven original judge candidates will test actual judge behavior under the frozen adapter.
Their labels, prompts, rubric, pack, model, source pins, limits, and exact command remain unchanged.
No extra canary, retry, fallback, or hidden pilot is proposed.
Method 6 still needs its own bounded authorization after independent amendment review.
Method 7 remains blocked until all seven original self-tests pass and its separate authorization exists.
The unused `$0.994608` transport allocation returns to unallocated evaluation funds.
Known reported evaluation spend is now `$0.995134`, with both unknown-cost reserves unchanged.

### Method 6 authorization — seven original judge candidates

Grok completed the bounded amendment review in terminal `t5q`.
Its report is main-worktree `tmp/2026-11-02-golden-overnight/grok-method5-gate-review.md`.
It confirms that the first failed boundary was the semantic `READY` check.
It found no transport defect and cleared the exact self-test command once.
The amendment withdraws that text prerequisite for method 6 only.
Method 5 stays invalid, unchanged, and separate from QA.

Fresh stable probe `t6x` exited `0` and printed the required remote vector.
The coordinator checked the prepared pins, free validation, absent output path, and future deadline.
The coordinator authorizes the seven original self-test candidates with a `$3.50` total allocation.
Each candidate keeps its `$0.50` allocation.
The adapter, rubric `v2.11`, pack `p9`, labels, and prompt inputs remain frozen.
No retry, panel, fallback, extra candidate, or resume is authorized.

Exact command, from the method worktree:

```sh
node eval/qa/non-anthropic/run.mjs \
  --mode selftest \
  --plan eval/local-lanes/direct-grok/2026-11-02/selftest-v2-plan.json \
  --expect-plan-sha256 a29895db5211a4ce384ff0e09de1fbcf0ea5fd00358d9c542fd8326518bcdcab \
  --out eval/local-lanes/direct-grok/2026-11-02/selftest-v2-result.json \
  --max-budget-usd 3.50
```

A pass requires exit `0`, all seven original expected labels, seven complete costs, and `selftestPassed: true`.
The coordinator will inspect every candidate before further authorization.
Method 7 remains blocked pending that result and its separate reviewed authorization.

### Method 6 result

Terminal `t7b` exited `0`.
The artifact records `complete` and `selftestPassed: true`.
All seven original candidates matched their expected grades.
The observed grades were `correct`, `partial`, `wrong`, `correct`, `correct`, `wrong`, and `wrong`.
The last two candidates require a grade other than `correct`.
The seven raw calls each have one complete cost below `$0.50`.
Their total is `$0.067868`, with no missing cost or invalid reason.
Every native reported cost matches its Gateway receipt.
Final local and remote identity checks passed.
Known reported evaluation spend is now `$1.063002`, with the `$6` policy reserve unchanged.

The coordinator inspected all seven rows before requesting the final baseline prerequisite review.
That review must explicitly reconcile the failed semantic canary gate.
The previous self-test-only waiver does not automatically clear baseline collection.
No additional model call is authorized by this result entry.

### Method 7 authorization — fixed 100-case diagnostic

Grok completed the separate baseline prerequisite review in terminal `t5q`, with status `done`.
Its report is main-worktree `tmp/2026-11-02-golden-overnight/grok-baseline-v2-gate-review.md`.
It independently checked all seven self-test rows and their complete costs.
It explicitly withdrew the failed semantic `READY` prerequisite for this exact baseline command.
Method 5 and baseline v1 remain invalid and unchanged.
No unresolved finding blocks this bounded collection.

The coordinator authorizes one collection of the frozen 100 active cases from the 501-case active corpus.
The allocation is `$30` for this method only.
It permits at most 16 answer requests and one judge request per answered case.
The total raw-provider ceiling is 1700 requests.
Each request permits at most 8192 output tokens.
The answering model and judge model are `xai/grok-4.7`, at `high` effort.
The judge retains rubric `v2.11` and evidence pack `p9`.
The answering model receives only the selected question, server instructions, `search`, `execute`, and their results.
The frozen golden remains judge-only.

The separate stable probe `t75` exited `0` and printed the expected vector.
The clean baseline server remains on revision `ce21317ff46d7491d82caf058baca7328c4177a9`, at port `8790`.
The prepared source pins, environment, selection, corpus, surface, and remote vector remain required.
The runner checks those identities before paid requests and again during final verification.
No retry, resume, fallback, panel, silent case replacement, or source change is authorized.
The hard new-call deadline remains `2026-11-03T10:00:00Z`.

Exact command, from the method worktree:

```sh
node eval/qa/non-anthropic/run.mjs \
  --mode baseline \
  --plan eval/local-lanes/direct-grok/2026-11-02/baseline-v2-plan.json \
  --expect-plan-sha256 25ca3f413e9ef7aaa784347710e1f1e0d2c3b10c067de1559916e9229e5ab9c8 \
  --out eval/local-lanes/direct-grok/2026-11-02/baseline-v2-result.json \
  --max-budget-usd 30
```

The coordinator will review wrong and partial rows first, then every completed row.
Incomplete collection, missing cost, or failed identity verification suppresses aggregate quality claims.
This result measures the custom direct-Grok diagnostic only.
It supplies no canonical five-track claim or historical Claude comparison.
The authorization permits no deployment, push, external issue creation, or golden change.

### Method 7 live collection and review queue

Root-owned terminal `t7c` started the exact command at `2026-11-03T00:31:14.329Z`.
Root-owned terminal `t7d` watches its completed rows without model calls.
The result is method-worktree `eval/local-lanes/direct-grok/2026-11-02/baseline-v2-result.json`.
New review packets live beside it under `review-packets-v2/`.
New reviews live under `reviews-v2/`, separate from the invalid earlier baseline's reviews.
Every packet retains its row hash and joins the frozen full case.
Reviewers preserve original scores and record disagreements separately.
They will verify every packet hash against the final artifact.

| Shard | Reviewer | Assigned completed IDs |
| --- | --- | --- |
| `shard01` | Codex `t55` | `q-aas-burn-clawback-redemption-mechanics`; `q-aas-list-token-on-exchanges-aggregators` |
| `shard02` | Grok `t56` | `q-aas-sep30-recoverable-wallets` |
| `shard03` | Grok `t5q` | `q-agent-identity-erc8004-stellar` |
| `shard04` | Grok `t56` | `q-anchor-sdp-vs-anchor-platform` |
| `shard05` | Codex `t55` | `q-asset-issue-asset-howto` |
| `shard06` | Grok `t56` | `q-asset-rwa-tokenized-freshness` |
| `shard07` | Codex `t55` | `q-asset-stablecoin-issuers-discovery` |
| `shard08` | Grok `t56` | `q-asset-two-account-issuer` |

The two partial rows receive priority live verification.
The reviewers use public primary reads or the existing local MCP server.
They cannot rerun answering or judging, change source or goldens, or send external messages.
All aggregate claims remain withheld while collection continues.

The verified `sd-080` finding and its request receipts now exist in the main worktree.
Its retained receipt is `research/audits/2026-11-02-golden-overnight/issuer-lock-receipts.json`.
The main generated improvements index and lint passed after that copy.
The only finding change replaces a temporary receipt path with the retained path.
Grok's independent evidence review cleared the claim scope and verified status.

The new burn answer avoids the old issuer-lock overstatement but makes an unsupported payment-only issuance claim.
The new listing answer repeats the signer omission and a false universal TOML ordering instruction.
Their original `correct` grades remain unchanged, with separate qualitative disagreements.
The new issuance tutorial answer permits offer and liquidity-pool issuance and does not repeat either claim.
The SEP-30 review finds a separate unsupported revision-date statement while preserving its required-answer pass.
The Anchor Platform comparison retains a verified partial classification for three omitted facts.
Its review separates canonical README facts from the model's fetched documentation slices.
These reviews support no aggregate quality claim while collection remains open.

The coordinator independently fetched the publishing guide and reproduced its TOML syntax counterexample.
The general false syntax claim now has local finding `sd-081-toml-array-order-is-not-universal.md`.
Its retained receipts, small fixture, and parser result live under the dated research directory.
The generated improvements index and lint passed with 124 findings.
The finding preserves SEP-1 ordering guidance and qualifies its syntax claim without promising arbitrary reordering safety.
It makes no SEP-1 validity or wallet acceptance claim from the placeholder fixture.
Independent review of this new finding remains pending.

### Method 7 final result — provider timeout

Terminal `t7c` exited `1` at `2026-11-03T01:15:26.506Z`.
The artifact retains `invalid-or-incomplete` and a null summary.
It contains 17 attempted rows, 16 original grades, and 83 unattempted selected IDs.
The seventeenth answer is retained, but its judge returned HTTP `504`.
The failed judge ran from `2026-11-03T01:11:23.725Z` through `01:15:25.355Z`.
Its Gateway log is `01a19ef5-febf-765b-ae8c-f940f55d2ec9`.
The Gateway receipt reports `$0`; this is an observed reported value, rather than an inferred free call.
All 123 raw calls have complete reported costs, totaling `$4.371304`.
Final identity checks passed, with no repeat of the earlier worker message failure.
The external judge timeout remains separate from answering quality and from the repository's MCP service.
The failed method will not resume, shrink its denominator, or supply an aggregate quality score.

The coordinator preserved all 14 source files under method-worktree `tmp/2026-11-02-golden-overnight/baseline-v2-source/`.
That snapshot matches freeze v3.
Codex `t6n` now tests bounded case isolation without inference.
Only baseline collection may continue after a known HTTP `500`, `502`, `503`, or `504` with complete evidence.
It must retain that failed row and start a different selected case, without retrying the failed request.
Missing cost, identity failure, invalid metadata, other status codes, deadline, budget, and call ceilings still stop collection.
Three consecutive qualifying provider failures will open a circuit breaker.
A missing grade will still suppress quality aggregates.
The original self-tests and transport canary keep their fail-fast behavior.
The diagnostic result schema will distinguish this policy from the earlier failed runs.
No new paid method is authorized by this repair scope.

### Owner budget decision — `$200` total

The owner answered the pending budget question with `$200 total`.
This limit includes answers, judging, checks, and helper agents.
It supersedes the provisional `$50` evaluation-only envelope.
The existing method allocations remain unchanged; the larger total authorizes no automatic rerun.

Known reported instrument spend is `$5.434306` through method 7.
Grok `t56` reports `$11.6682056` through its saved snapshot.
Grok `t5q` reports `$8.54265568` through its saved snapshot.
Their combined reported helper spend is `$20.21086128`, without double-counting earlier snapshots.
The combined reported amount is `$25.64516728`, before later helper turns and unreported Codex costs.
Incomplete helper turns remain unknown.

Codex uses ChatGPT sign-in on this host.
Its local session counters report tokens and account credit state, without exact billed USD.
The coordinator makes no token-to-USD or credit-to-USD conversion.
The root and helper snapshots remain local under `tmp/2026-11-02-golden-overnight/`.
They contain usage fields only, without prompts, answers, or credential values.

The proposed remaining allocation is conservative:

| Allocation | USD |
| --- | ---: |
| Known instrument spend through method 7 | `5.434306` |
| Prior unknown instrument policy reserve | `6` |
| Grok helper ceiling, including reported helper spend | `50` |
| Unreported Codex policy reserve | `100` |
| One proposed new 100-case method | `30` |
| Unallocated | `8.565694` |
| Total | `200` |

The reserves are policy buffers, rather than cost estimates or proven provider charge bounds.
The coordinator will check reported helper costs before assigning more work.
No new account purchase, billing change, or paid instrument follows from this table.
Grok independently reviews the new fault policy and budget before another paid packet.

### Remaining method 7 review assignments

| Shard | Reviewer | Assigned completed IDs |
| --- | --- | --- |
| `shard09` | Grok `t5q` | `q-comp-auth-flags-overview` |
| `shard10` | Codex `t55` | `q-comp-cross-moneygram-partnership-sep24` |
| `shard11` | Grok `t5q` | `q-comp-finclusive-caas` |
| `shard12` | Grok `t5q` | `q-comp-sep8-number-lookup-no-deepresearch`; `q-crp-partner-detail-after-discovery` |
| `shard13` | Codex `t55` | `q-defi-allbridge-what-is` |
| `shard14` | Codex `t55` | `q-defi-arbitrage-pathpayment-bots`; `q-defi-bridge-evm-to-stellar-axelar` |

The final shard reviews the retained ungraded answer without inventing a judge score.
All packet hashes must match the final invalid artifact before review closeout.

### Frozen HTTP policy and method 8 authorization

The independent review identified a weakness in the initial shared failure counter.
Successful answers could hide repeated judge outages by resetting that counter.
The final repair uses separate answer and judge counters.
Three consecutive qualifying failures in either phase stop the method.
A successful completion resets only its own phase.
The failed requests receive no retry.
All earlier hard stops and quality suppression rules remain intact.

The author froze the repair after 90 focused tests and typecheck passed.
The full test command passed 148 files, with 3181 passes and three expected failures.
Build, free eval self-test, and method-worktree improvements lint passed.
The main improvements lint passed separately with 126 findings.
The author report is method-worktree `tmp/2026-11-02-golden-overnight/http-case-isolation-report.md`.
Freeze v4 is `tmp/2026-11-02-golden-overnight/full-runner-source-freeze-v4.json` beside that report.
Its SHA-256 is `ad201b4a13706a3cf92fb86105c6acb3de33eada28197633cd8a592687c7a8d6`.

Loaded preparation `t7w` and free validation `t7x` exited `0`.
The validation records `inferenceCalls: 0`, the required vector, and the clean pinned server revision.
Parent and worker environment hashes both remain `6c147a657076b6a39c3f64e0169008b48b921fdee3a75e81e05989f7a17e7b96`.
The fresh three-capture probe `t7f` exited `0` and printed the same required vector.
The source, corpus, selection, surface, server, and deadline pins remain unchanged.

Grok completed the exact packet review in terminal `t5q`, with status `done`.
Its report is main-worktree `tmp/2026-11-02-golden-overnight/grok-third-run-prespend-review.md`.
It verified all 294 loaded-source hashes and all 14 freeze hashes.
It cleared this exact command after free validation passed.
That condition is satisfied by `t7x`.
It also accepted the existing seven-candidate native self-test, because judging semantics and adapter bytes remain unchanged.
No new paid self-test or semantic canary is required or authorized.

The coordinator authorizes one new collection of the same fixed 100 active cases.
This is method 8, with a `$30` allocation inside the owner's `$200` total limit.
The helper ceiling and policy reserves remain as recorded above.
The method permits at most 1700 raw calls, 16 answer requests per case, and one judge request per answered case.
Each request permits at most 8192 output tokens.
The model remains `xai/grok-4.7`, at `high` effort, for answers and judging.
The rubric remains `v2.11`, and the evidence pack remains `p9`.
The new result schema is `direct-grok-host-loop-diagnostic-v2`; the plan schema remains v1.

Exact command, from the method worktree:

```sh
node eval/qa/non-anthropic/run.mjs \
  --mode baseline \
  --plan eval/local-lanes/direct-grok/2026-11-02/baseline-v3-plan.json \
  --expect-plan-sha256 63cef02d548e98428cf96f22d934c002058f51c19dad5250dd6c554da2060c59 \
  --out eval/local-lanes/direct-grok/2026-11-02/baseline-v3-result.json \
  --max-budget-usd 30
```

This method starts a new artifact and does not resume either invalid earlier collection.
Known qualifying HTTP failures retain their exact row, role, status, answer, transcript, and costs.
The next request uses a different selected case.
Missing grades still suppress quality aggregates, even when every selected case has an observed raw attempt.
The selected denominator never shrinks, and failures never become wrong answers by assumption.
No retry, fallback, panel, silent replacement, source change, or later paid method is authorized.
The hard new-call deadline remains `2026-11-03T10:00:00Z`.

All new answers will receive separate row reviews under `reviews-v3/`.
Earlier primary evidence can support unchanged facts, but reviewers must check each new answer and row hash.
No historical Claude comparison, canonical five-track claim, deployment, push, or external message is authorized.

### Method 8 live state

Root-owned terminal `t7y` runs method 8; `t7z` watches completed rows.
The result is method-worktree `eval/local-lanes/direct-grok/2026-11-02/baseline-v3-result.json`.
New packets use `review-packets-v3/`; new reviews use `reviews-v3/`.
The initial three answers completed without a provider failure.
Grok `t56` reviews those three rows in `reviews-v3/shard01.md`.
Codex `t55` checks the separately verified strict-send documentation inconsistency for a possible `sd-084` finding.
The collection review pair uses at most two active helper lanes while the answering or judge model runs.
Other helpers remain available and idle.

The universal final verifier now checks packet rows, frozen goldens, original scores, and review presence.
It passed for all 17 retained method-7 rows against the final invalid artifact.
The proof is method-worktree `eval/local-lanes/direct-grok/2026-11-02/baseline-v2.review-final-integrity.json`.
All original scores remain unchanged, including the null Axelar verdict.
Offline telemetry and plan review also retain the selected denominator `100` and suppress quality aggregates.

The main worktree contains four new verified documentation findings, `sd-080` through `sd-083`.
Grok independently cleared all four claim scopes and source evidence.
The additional `sls-107` evidence updates its existing recurrence record.
The immutable-flag parenthesis remains monitor-only, without a new verified claim.
No external issue was posted in this round.

Root-owned `t7j` prevents idle system sleep until `2026-11-03T11:00:00Z` or earlier cleanup.
It changes no display setting and supports the authorized overnight work.
The coordinator will stop it after final cleanup.

## Interim state after method 8 launch

The round remains open.
The transport and seven-candidate self-test passed.
The first 100-case baseline remains invalid after an infrastructure failure.
The separately authorized second diagnostic stopped after an external judge timeout.
The coordinator preserves both failed collections and prepares a bounded fault-isolation repair.
The repaired method 8 is now collecting the same 100 selected cases.
No valid aggregate QA score exists yet.
No Anthropic agent, deployment, push, or external message ran in this round.

### Method 8 review progress and intake routing

The collection retains a separate review for each new answer.
Codex reviews cases 11–14 in `reviews-v3/shard05.md`, with the partial FinClusive answer first.
Grok reviews cases 7–10 in `reviews-v3/shard04.md`, with the partial issuer-discovery answer first.
The judge timeout for case 5 remains a null verdict.

Grok independently cleared `sd-084` against the canonical OpenAPI components and read-only Horizon responses.
The five new Docs findings now have explicit `stellar/stellar-docs` intake overrides.
These overrides resolve the mixed service owner without posting an external issue.
The latest observed Grok helper costs total `$24.73918052`.
Those observations exclude later turns and do not supply missing Codex dollar charges.

The main local improvements lint passes with 127 findings after the intake overrides.
The live check fails only on the existing `https://github.com/soroswap/docs/issues/47` evidence reference.
That inaccessible reference belongs to `cs-002`, outside this round.
The existing TODO already records this owner-access problem.
The new intake overrides introduce no additional live-check failure.

### Method 8 accounting stop

Method 8 finished invalid after 17 attempted cases and 15 grades.
Case 5 retains the only judge HTTP 504.
Case 17 received HTTP 200 and a returned final answer, but Gateway accounting did not settle in time.
Its native response reports `474160000` USD ticks, or `$0.047416`.
The collection receipt still records that attempt cost as null.
The method reports `$4.275954` for 118 complete costs across 119 raw starts.
Final source and remote identity checks pass.
The failure is a separate accounting stop, not a second judge timeout or an answer-grade failure.
The accepted row answer remains empty; the returned answer remains preserved in attempt 119.
All aggregates remain suppressed, and the selected denominator stays 100.

Freeze v4 bytes now have a checked snapshot at method `tmp/2026-11-02-golden-overnight/baseline-v3-source/`.
The root requests a free native-cost accounting proposal before authorizing any source repair or further paid method.
No failed artifact may resume or receive a retroactive grade or ledger edit.

A read-only Gateway reconciliation joins 118 of 119 method-8 requests by exact observed log ID.
Every known collection cost matches its Gateway cost.
Every joined native reported cost also matches its Gateway cost.
Attempt 119 has no Gateway record in the bounded window or exact lookup.
The original null ledger entry remains unchanged.
These observations support investigation of native billing evidence; they do not authorize silent recovery.

A proposed next-method allocation keeps `$9.71026` known instruments and `$7` unknown-charge policy reserves.
It reduces the Grok helper ceiling to `$45` and keeps the unreported Codex policy reserve at `$100`.
It proposes separate `$3.50` native self-test and `$30` new collection caps.
The total allocation is `$195.21026`, leaving `$4.78974`.
These reserves are not measured charges or proven charge bounds.
No new paid method is authorized until source, command, pins, and independent review pass.

Grok pre-review confirms 117 paired native/Gateway amounts match.
A separate HTTP 504 has Gateway cost zero and no native usage.
The earlier phrase about 118 native matches meant all available native pairs, not 118 pairs.
The native cost contract comes from xAI Cost Tracking and the public SamplingUsage proto.
Cloudflare describes Gateway cost as an estimate, so the two sources keep separate labels.

The root authorizes a bounded source repair under the Grok pre-review conditions.
It may accept validated complete native ticks for HTTP 200, with exact call and response identities.
Conflicting, partial, invalid, or absent costs still stop the method.
Gateway lookup completeness and errors remain separate evidence.
Returned final text must survive rejection in a separate unaccepted field.
The accepted answer and original artifacts remain unchanged.
The author must run free focused checks and freeze the new source before exact paid-method review.
No new inference is authorized by this source repair.

Fresh root-owned three-capture remote probe `t86` exits 0.
It repeats the required vector `0857e9a11f51b085afe6128227e45379fb8d041199ed2de24c034974a0e70430`.
Main `tmp/2026-11-02-golden-overnight/remote-sha256-v6.txt` retains its result.
The probe changes no source and makes no model call.

Method-8 universal final integrity passes all 17 retained rows.
All packet row hashes and frozen goldens match; all reviews exist; every original grade remains unchanged.
The proof is method `eval/local-lanes/direct-grok/2026-11-02/baseline-v3.review-final-integrity.json`.
The separate telemetry and offline plan summaries retain 100 selected cases and suppress quality aggregates.

Root cleanup removes eleven owned finished terminals after saving their final output.
It leaves the existing server, helpers, sleep prevention, and unrelated terminals intact.
The cleanup receipt is main `tmp/2026-11-02-golden-overnight/root-terminal-cleanup-2.json`.

The main free eval gates pass again at `2026-11-03T02:57Z`, with zero inference calls.
They include eval self-test, stale/floor corpus lint, registration check, and the routing gate.
The routing output still reports the separate pre-existing protocol-history diagnostic failure.
Its target reaches top five on 7 of 8 cases, with 3 of 4 control captures.
This diagnostic does not become a passing gate or a new change claim.
Main `tmp/2026-11-02-golden-overnight/main-free-gates.json` records all four zero exit codes.
The routing trace is `eval/results/routing-2026-11-03T02-57-22-968Z.json`.

### Frozen native-cost repair checks

The author completes and freezes the bounded repair.
The author report is method `tmp/2026-11-02-golden-overnight/native-cost-repair-implementation-report.md`.
All 146 focused tests and typecheck pass.
The regressions also catch and repair accepted-answer assignment before the remote after-call guard.
The new result schema is `direct-grok-host-loop-diagnostic-v3`; the plan schema remains v1.
The freeze-v5 receipt hashes all 14 source/docs/test files.
Its SHA-256 is `2ee0211e3fcebcd146de319ca5fb6237bcbc7629a7f362bc1306e86303f13933`.
Root verifies every frozen live file before fresh pin preparation.

Root-owned `t8p` runs the full required free checks and exits 0.
The full test suite passes 148 files, with 3206 passes and three expected failures.
Build, free eval self-test, and method improvements lint also pass.
The method has 123 findings; MAIN has 127, because their finding work differs.
Main `tmp/2026-11-02-golden-overnight/native-full-checks.json` records all four zero exit codes and zero inference calls.
Grok independently reviews the frozen patch before any new paid command.
Root-owned `t8q` prepares native self-test pins without inference.

### Method 9 proposed native self-test

Root-owned `t8q` prepares self-test pins, and `t8r` validates the final plan; both exit 0 without inference.
The free validation records the clean pinned server and required remote vector.
Parent and worker environment identity remains `6c147a657076b6a39c3f64e0169008b48b921fdee3a75e81e05989f7a17e7b96`.
Final self-test plan SHA-256: `59e96bf447092548491f8d06bace5353843f768b3644aa850de9ed99e73938ca`.
Source pins SHA-256: `c0d9ca16c6be1dae0120d69ff820b83c58e652815b0c0657230320ceb0e884df`.
Main packet `tmp/2026-11-02-golden-overnight/native-selftest-packet.json` has SHA-256 `c5da63b86433e4ea442d532a0d4548157f174456709306cd844faeecf75cec5c`.
It proposes one request for each original seven self-test candidates, with a `$3.50` method cap and `$0.50` per candidate.
The reviewer receives the exact final command and frozen source.
This proposal does not authorize inference or the later baseline.

The latest reported Grok helper costs total `$27.89139308`, excluding unfinished later turns.
That amount remains inside the reduced `$45` helper ceiling.
Known instrument costs remain `$9.71026`; Codex dollar costs remain unreported.
The separate policy allocations still total `$195.21026`, including the proposed self-test and baseline.
The `$4.78974` remainder does not convert unknown charges into a measured bill.

### Prepared next baseline, without paid authorization

Root-owned `t8s` prepares baseline pins, and `t8t` validates the final plan; both exit 0 without inference.
The final baseline plan SHA-256 is `dfd8245c434ec75fbfcfaa9d0fa910a5be70190d70e7c9616319743f33b5b57f`.
Its source pins SHA-256 is `de52a9d66e1d0779f3e9f54eef3d900a8596fbdae1adc88189666ed7c5da1927`.
The clean server remains at `ce21317ff46d7491d82caf058baca7328c4177a9`, with the same required remote vector.
The plan retains the fixed 100 IDs, original content hashes, `$30` cap, and `10:00 UTC` new-call deadline.
The source freeze, model, effort, rubric, pack, token limit, request limit, and HTTP policy stay as reviewed above.
This preparation authorizes no inference.
The root will review the native seven-candidate result before any separate baseline authorization.

### Method 9 launch record

Grok completes the frozen source and exact-command reviews, with terminal `t5q` status `done`.
The reports are MAIN `tmp/2026-11-02-golden-overnight/grok-native-cost-source-review.md` and `grok-native-selftest-prespend-review.md`.
Every source finding is reconciled.
Root repeats the 14-file freeze check and confirms absent output and a future deadline.

The coordinator authorizes exactly one original seven-candidate self-test under the owner's `$200` total limit.
The method allocation is `$3.50`, with at most `$0.50` per candidate and seven raw provider requests.
Each request permits at most `8192` output tokens.
The model is `xai/grok-4.7` at `high` effort.
The rubric remains `v2.11`, and the evidence pack remains `p9`.
No Anthropic agent, retry, resume, fallback, panel, changed candidate, or later baseline is authorized.
The new-call deadline remains `2026-11-03T10:00:00Z`.

Exact command, from the method worktree:

```sh
node eval/qa/non-anthropic/run.mjs \
  --mode selftest \
  --plan eval/local-lanes/direct-grok/2026-11-02/selftest-v3-plan.json \
  --expect-plan-sha256 59e96bf447092548491f8d06bace5353843f768b3644aa850de9ed99e73938ca \
  --out eval/local-lanes/direct-grok/2026-11-02/selftest-v3-result.json \
  --max-budget-usd 3.5
```

Root announces authorization in commentary before launch.
The first attempt to append this ledger entry fails because of shell quoting.
The reviewed command then starts in owned terminal `t8v` before this durable entry saves.
This entry records that timing gap instead of claiming an earlier ledger write.
The owner authorization, bounded packet, independent exact clearance, and source checks precede the launch.
No additional inference or later baseline follows from the ledger correction.

Native and Gateway accounting sources remain separate.
Unknown, invalid, partial, or conflicting costs still stop the method.
This launch does not alter any prior failed artifact or charge record.
Root reviews the seven results before requesting separate baseline clearance.

### Method 9 result and proposed method 10

Method 9 completes with exit code `0` in `t8v`.
All seven original candidates satisfy their original conditions.
The observed grades are correct, partial, wrong, correct, correct, wrong, and wrong.
Seven raw calls report complete cost `$0.07853`.
All seven native/Gateway amounts agree exactly.
The selected cost source is `native-reported`, while all seven Gateway observations also remain complete.
Final identity checks pass, with no invalid reason.

The result schema is `direct-grok-host-loop-diagnostic-v3`.
Its SHA-256 is `f61a711c0e1f80a3a3abb316fcfcb1ae259a8aa4c9d138660820d06f87d29a5a`.
It starts at `2026-11-03T03:39:27.401Z` and finishes at `2026-11-03T03:41:05.434Z`.
The result is method `eval/local-lanes/direct-grok/2026-11-02/selftest-v3-result.json`.
Root reviews every candidate and receipt before requesting separate baseline clearance.

The new baseline packet is MAIN `tmp/2026-11-02-golden-overnight/native-baseline-packet.json`.
Its SHA-256 is `e54c37e91db273aa2aed8e061f74cf4a55c1784431ee04883289d6ee93214eb0`.
It proposes one new collection of the same fixed 100 cases, under the same frozen v5 source.
It does not resume any earlier artifact or reuse an earlier answer.
Grok receives the exact prepared command, source pins, free validation, native self-test result, and budget allocation.
The source, model, rubric, pack, and all frozen inputs remain unchanged.

Known instrument receipts now total `$9.78879`.
The self-test releases its unused `$3.42147` allocation.
The latest reported Grok helper total is `$29.74228916`, excluding later unfinished turns.
The proposed allocation totals `$191.78879`, with `$8.21121` unallocated under the owner's `$200` total.
It includes `$7` unknown-charge policy reserves, a `$45` Grok ceiling, a `$100` unreported Codex reserve, and a `$30` baseline cap.
These reserves remain policy buffers, rather than measured charges or proven bounds.
No baseline inference is authorized by this proposal.

### Method 10 authorization

Grok completes the exact baseline review, with terminal `t5q` status `done`.
Its report is MAIN `tmp/2026-11-02-golden-overnight/grok-native-baseline-prespend-review.md`.
It verifies the completed native seven-candidate self-test, frozen source, full suite, plans, pins, selection, and budget.
It also reviews the method-9 ledger timing gap without asserting an earlier ledger save.
No source finding remains open.

The coordinator authorizes exactly one new collection of the fixed 100 active cases.
This is method 10, with a `$30` allocation inside the owner's `$200` total limit.
Known instrument receipts remain `$9.78879` before this collection.
The complete policy allocation remains `$191.78879`, with `$8.21121` unallocated.
The `$7` unknown reserve, `$45` Grok ceiling, and `$100` unreported Codex reserve remain in place.
These amounts do not establish an exact total bill or a proven bound on unknown charges.

The model remains `xai/grok-4.7` at `high` effort for answers and judging.
The rubric remains `v2.11`, and the evidence pack remains `p9`.
The method permits at most `1700` raw requests, `16` answer requests per case, and one judge request per completed answer.
Each request permits at most `8192` output tokens.
The new-call deadline remains `2026-11-03T10:00:00Z`.

Exact command, from the method worktree:

```sh
node eval/qa/non-anthropic/run.mjs \
  --mode baseline \
  --plan eval/local-lanes/direct-grok/2026-11-02/baseline-v4-plan.json \
  --expect-plan-sha256 dfd8245c434ec75fbfcfaa9d0fa910a5be70190d70e7c9616319743f33b5b57f \
  --out eval/local-lanes/direct-grok/2026-11-02/baseline-v4-result.json \
  --max-budget-usd 30
```

The output is a new artifact under result schema `direct-grok-host-loop-diagnostic-v3`.
The collection does not resume any prior artifact or reuse any earlier answer.
Every failed prior collection and its original receipt remain unchanged.
Unknown costs, conflicting reports, invalid native costs, failed identities, and ceilings remain terminal.
Only qualifying HTTP `500`, `502`, `503`, or `504` failures can continue to a different selected case.
That path retains complete Gateway requirements and separate three-failure circuits for answers and judges.

Missing grades suppress quality aggregates, even after 100 observed trials.
The selected denominator never shrinks.
Every new returned answer and original verdict receives a review against its full frozen golden and source evidence.
New packets use `review-packets-v4/`, and new reviews use `reviews-v4/`.
At most two helper review lanes stay active while the measured model runs.
Other helpers remain idle, and no frozen source file changes during collection.

No Anthropic agent, inference retry, resume, fallback, panel, replacement, rejudge, or later paid method is authorized.
No push, deployment, external issue, or message is authorized.
This diagnostic has no historical QA comparability or canonical five-track claim.
Root verifies this saved authorization and all launch conditions before starting the command.

### Method 10 live state

Root saves and verifies the method-10 authorization before launch.
The repeated launch check also verifies all 14 frozen files, the exact plan hash, absent output, and a future deadline.
Owned terminal `t8x` starts the exact approved collection.
Owned terminal `t8w` watches its completed rows.
The source files stay frozen throughout the collection.
Completed packets use the v2 review-packet schema with original row and full-golden hashes.
They retain explicit cost sources and unaccepted completion evidence.
Full provider payloads remain in the original local artifact.

The first two new cases receive Codex reviews in `reviews-v4/shard01.md`.
Their original correct grades remain unchanged, with qualitative qualifications and repeated `sd-080`/`sd-081` source defects.
Grok receives the new SEP-30 and ERC-8004 cases in `reviews-v4/shard02.md`.
Root reviews the new platform comparison in `reviews-v4/shard03.md`.
That original partial verdict matches omitted architecture and Wallet SDK coverage.
Ten fresh primary responses match the earlier verified source bytes.
The transcript shows bounded projections that omit some SDK coverage, without establishing a new retrieval defect.
Codex receives the new issuance and RWA cases in `reviews-v4/shard04.md`.

Root completes the new authorization-flags review in `reviews-v4/shard06.md`.
Three fresh primary sources support the original correct verdict, with two extra-prose qualifications.
Per-trustline clawback control permits clearing the flag, rather than enabling it on an existing trustline.
Immutable also blocks changes to the account clawback flag.
The source parenthesis observation remains monitor-only, without another verified finding.

Inspection also finds unqualified issuer-lock shorthand in the canonical issuance reference answer.
The current recipe starts with new accounts, but the shorthand can lose its conditions when reused.
Hold the frozen measurement corpus unchanged.
After collection, evaluate an explicit other-signer qualification under `golden-truth` with independent review.
Do not change a current grade or claim that this candidate reference clarification already passed its gates.

The issuer-lock proposal is now read-only at MAIN `tmp/2026-11-02-golden-overnight/issuer-lock-golden-proposal.md`.
It preserves the valid new-default-account recipe and proposes an explicit remaining-authority condition.
It includes official multisig documentation, immutable Core code, and a full sibling sweep.
Only the owned issuance case needs the proposed reference change; independent review remains pending after collection.

The first originally wrong Phoenix and ecosystem-workflow rows receive priority Codex review in `reviews-v4/shard12.md`.
The Phoenix review identifies supported token-identity and dated-whitepaper omissions, with a qualified governance interpretation.
The ecosystem review finds a grader rationale error that confuses the Lumenloop-owned skill with the Scout service.
Functional omissions remain separate; both original wrong grades remain unchanged.

Root reviews the new PYUSD wrong row in `reviews-v4/shard13.md`.
Launch facts are supported, while a source `company` label is promoted into an issuer role.
The public registry field is `company`, not `issuerName`.
The combined PayPal/Paxos label repeats the existing `sls-107` concern; no duplicate is filed.

Grok also records an issuer-control comparison at MAIN `tmp/2026-11-02-golden-overnight/issuer-controls-triage.md`.
The public registry and project search carry false control values for the exact USTRY/CETES issuer.
Current public Horizon records show revocable and clawback permissions enabled.
Raven passes through the upstream project values; no adapter rewrite is established.
The product record has an older date, and the account modification date does not date a flag change.
Neither date proves the earlier values were historically false.
The current-data contract and timestamp meanings still need independent classification before any finding is filed.
No finding ID is reserved.

At the 38-case checkpoint, method 10 has 38 completed and graded cases.
Its recorded request costs total `$10.493052`; collection remains open and no quality aggregate is reported.
The two Grok helper sessions report `$35.16673892` combined at their latest completed turns.
The `$45` helper allocation retains the final-review margin; Codex charges remain unreported.

Root completes cases 30 and 31 in `reviews-v4/shard16.md`.
Fresh Horizon data corroborates Protocol 29, but the candidate explicitly omits a live-ledger lookup.
The original correct judgment remains unchanged; the behavioral requirement and older reference notes conflict.
The SCF answer matches the fresh official awards page, with a source-independence wording concern.
Two Scout operations share one provider.
The reviewer calls do not become answering-agent evidence.

Codex completes cases 23, 24, 26, and 27 in `reviews-v4/shard14.md`.
That review also corrects an earlier runtime-availability inference in shard 12.
The current schema and successful execution expose the Lumenloop project-tag vocabulary helper.
A local file miss does not establish runtime absence.
The separate skill-namespace judgment concern and all original grades remain unchanged.

Grok completes cases 28 and 29 in `reviews-v4/shard15.md` and receives cases 32 through 37.
Codex receives cases 38 through 70 as they finish, with bounded case reviews and owned watcher cleanup.
No source, corpus, or grading contract changes during collection.

Case 39, `q-hist-quantum-preparedness-plan`, reaches `answer-step-limit` without a completed answer or judge.
Its explicit `error` verdict remains separate from wrong answers and provider failures.
Codex reviews it in `reviews-v4/shard18.md`.
An earlier live status counted all non-null verdict objects as grades, including this error object.
Root corrects subsequent status counts to include only `correct`, `partial`, or `wrong` judgments.
The artifact already makes this distinction and suppresses aggregates correctly.
The status-display correction changes no original row or grade.
Even 100 observed cases will not support quality aggregates while this selected case lacks a valid grade.

Codex completes the bounded calibration check in MAIN `tmp/2026-11-02-golden-overnight/judge-calibration-review.md`.
The four actual judge prompts match canonical construction; raw JSON and parser replay match stored verdicts.
No extraction bug is demonstrated.
The explicit trap rule treats missing required behavior as an incorrect behavioral core.
Thus empty wrong-claim and avoid lists do not by themselves contradict the wrong judgments for cases 32 and 33.
Case 33 explicitly omits required funding contexts under its frozen reference.
Case 32 has an unconditional-versus-conditional negative-finding ambiguity that warrants future reference review.
Case 22 retains the skill/service conflation concern, with separate functional omissions.
Case 30 retains the omitted live-network measurement concern, despite its corroborated protocol value.
These assessments change no current score, prompt, corpus, or artifact.

At `2026-11-03T06:09:39Z`, method 10 has 58 ended cases and 57 valid judgments.
Recorded request costs total `$15.490032`; the only observed case failure remains `answer-step-limit` on case 39.
No quality aggregate is available.
The nine earlier methods now have safe hash-bearing metadata in `research/audits/2026-11-02-golden-overnight/method-history.json`.
Its explicit method-4 fields distinguish 28 attempt records from 27 recorded raw starts.
The unresolved final attempt does not establish another confirmed raw start.
The known pre-method-10 receipt subtotal remains `$9.78879`, with the separate `$7` policy reserve.

Codex reviews the six local post-processing scripts in MAIN `tmp/2026-11-02-golden-overnight/postprocessing-review.md`.
Its constructed counterexamples identify missing publication guards, rather than corruption in the current collection.
Root accepts all six findings and assigns bounded repairs to `t6n` in the ignored post-processing scripts only.
The repairs must validate exact packet projections, attempt evidence, nonempty digest-bearing review notes, and final artifact joins.
They must enforce the fixed selection, corpus, valid grade coverage, grading-input pins, and separate accounting observations.
They must distinguish missing Gateway amounts from conflicts and include a failed-case timing population.
No measured source, corpus, packet, note, original artifact, grade, or paid method changes.
The repair report remains pending at `tmp/2026-11-02-golden-overnight/postprocessing-repair.md`.
Root and Grok review those repairs before final publication.

The latest completed Grok helper turn brings combined CLI-reported helper cost to `$35.66688776`.
The helpers retain a `$45` allocation, with optional work stopping before the final-review margin is consumed.
Codex dollar charges remain unreported; its `$100` policy reserve remains separate from measured costs.

Codex completes the bounded reporting repair in `tmp/2026-11-02-golden-overnight/postprocessing-repair.md`.
Five existing ignored scripts change, and one 200-line pure guard module is added.
The history exporter and all measured sources remain unchanged.
Seven syntax checks, 24 constructed boundary cases, nine cost cases, and a synthetic final pipeline pass.
Those checks make no real collector, network, inference, or original-artifact write.
Root reads all repaired scripts and the guard module, including their cost and coverage predicates.
No current actionable issue is found in that reading.
Grok `t5q` receives a separate bounded source review at `grok-postprocessing-review.md` before final processing.
That review does not authorize another paid measurement or canonical golden change.
The measured model, Codex case-review lane, and Grok source-review lane remain the only active model lanes.

At `2026-11-03T06:38:09Z`, collection has 68 ended cases, 67 valid judgments, and `$18.262574` in recorded costs.
The source still records no infrastructure invalidation and one answer-step-limit case.

Grok completes the reporting-source review in `tmp/2026-11-02-golden-overnight/grok-postprocessing-review.md`.
All six reporting findings are reconciled, with no current actionable finding remaining.
The repaired scripts are cleared for one-off final processing, not final results or a golden change.
All 19 frozen files and eight offline grading-input files still match their pins.
The review checks constructed coverage, packet, cost, missing-receipt, one-tick conflict, zero, and duplicate-log cases.
No collector runs against the open artifact.

The completed Grok source-review turn updates its CLI-reported session cost to `$15.37103392`.
The other helper session remains `$21.32399956`, for `$36.69503348` combined.
These figures cover the latest completed turns, rather than an exact whole-session bill.
Codex `t6n` receives case-review ordinals 71 through 84, with digest-bearing notes and owned watcher cleanup.
Codex `t55` retains ordinals 38 through 70.
Grok source review is done, so only the two Codex case-review helpers remain active alongside the measured model.
Tail-case assignment and the final golden/report review remain pending within the existing helper allocation.

Codex completes and reviews every assigned row through ordinal 70 in `reviews-v4/assigned38-70-progress.md`.
Its batch summaries run from `shard18.md` through `shard41.md`.
The owned watcher `t8y` exits successfully and is removed by its owner.
Root reads the progress index and all new batch summaries.
Some summaries identify extra answer errors and judgment concerns despite originally correct outcomes.
Case 46's wrong judgment concerns a missing sandbox explanation; the answer safely refuses the metadata request.
Case 53's originally correct answer omits a retention check before treating `NOT_FOUND` as noninclusion.
The calibration report records these distinctions without changing grades.

Two further Docs candidates require dedupe and applicable-version evidence: simulation default auth mode and ledger-field nesting.
Root assigns proposals only to Codex `t55` under MAIN `tmp/2026-11-02-golden-overnight/late-docs-findings/`.
No finding IDs, source changes, external reports, or new golden proposals are authorized by that assignment.
The same task records bounded dispositions for Audit Bank copay and bug-bounty policy concerns.
Those facts remain unsettled pending controlling-source review.

The case-review handoff uses prefix `review71-84-` for new batch and evidence paths.
Root corrects its earlier `shard40` example because Codex already owns that number for case 69.
Existing shard files and directories must remain unchanged.

At `2026-11-03T07:02:50Z`, collection has 78 ended cases and 76 valid judgments.
Case 78, `q-sor-force-fast-archival-localnet`, also reaches `answer-step-limit` with no completed answer or judge.
Both answer-limit errors remain in the 100-case selection, separate from wrong answers and provider failures.
Quality aggregates remain suppressed.

### Method 10 final collection

Collection ends at `2026-11-03T08:17:08.302Z` after 100 observed selected cases and 97 literal valid judgments.
The original result status is `invalid-or-incomplete`; no quality aggregate is accepted.
All 775 observed raw provider calls have complete reported costs, totaling `$28.973832`.
All 775 also have complete Gateway observations; those are not added to native amounts.
Final local and remote identity checks pass, with no infrastructure invalidation.
The final artifact SHA-256 is `c8ec22427dd373492493b49b1f96c3e46d5476b8a928aa452b3dfd1654e6ea8f`.
Its byte length is `142459980`.
Owned collection terminal `t8x` exits `1` because three selected answers do not complete.
The watcher `t8w` exits `0`.

The three explicit `answer-step-limit` rows are:

- `q-hist-quantum-preparedness-plan`
- `q-sor-force-fast-archival-localnet`
- `q-ti-custodial-account-generation-c-address`

They have no completed answer or judge; they are not wrong answers or provider outages.
Every original row, grade, error, and cost observation remains unchanged.
Final processing starts in owned terminals `t92` (integrity), `t93` (performance), `t94` (offline plan), and `t95` (Gateway reconciliation).
Its source was independently cleared before launch.

The local results branch is `codex/golden-2026-11-02-results`.
The experimental code stays on `codex/golden-2026-11-02-method`.

### Late documentation findings

The independently reviewed local findings add `sd-085` and `sd-086`.
The first corrects the conditional invocation `authMode` default in two OpenRPC source descriptions.
The second clarifies consensus-value nesting; it makes no claim of an explicit false wire declaration.
Both target `stellar/stellar-docs` at `85d2d1b8e7a4451b7a6af0931f587ce73109b816`.
Safe receipts are retained in `research/audits/2026-11-02-golden-overnight/late-docs-receipts.json`.
The regenerated index and local lint pass with 129 findings in `t91`.
No upstream issue or source write occurs.

Codex finishes all original case reviews through 70 and extends the second Codex lane through 100.
This replaces the prospective paid Grok tail lane and preserves the final-review budget.
The latest completed helper records total `$37.31790396`: `$21.32399956` plus `$15.9939044`.
Codex dollar charges remain unreported, and policy reserves remain separate from actual charges.

### Audit Bank reference quarantine

The frozen case has a verified authoring error, rather than a newly changed program policy.
The official Initial Audit stage has 5% copay with a conditional refund.
The official Growth Audit and Scale Audit stages have 0% copay.
The reference incorrectly attaches the exemptions to Initial Audit cohorts.
Grok independently reads both primary surfaces before the proposer disposition at `2026-11-03T07:12:21.762219Z`.
Its blind matrix SHA-256 is `5620d4e38c7c884a713db0e5665407ce091797494c778860dca62aae15eb8f71`.
The public source and immutable official handbook share one policy authority; that dependency is explicit.

Durable public evidence: `research/audits/2026-11-02-golden-overnight/audit-bank-stage-receipts.json`.
Source A body SHA-256: `096dd158244a230c07c854e9cfdee5a073f76d43f05f01c7403afda57ea3d185`.
Source B body SHA-256: `e03a41d00b4639e2022f41ca0ebb04bc364915fe36b80dd7290f031b3a4bce01`.
The immutable handbook commit is `e07b4bfce158639f81908f74cfd74ec8d87f051a`.

After collection, root authorizes quarantine of `q-scf-audit-bank`, with Grok `t5q` as independent source verifier.
The separate queue entry is `.agents/TODO.md`, “Correct the Audit Bank copay reference”.
Quarantine changes lifecycle metadata only; current gospel and original measurement artifacts remain unchanged.
The review starts `2026-11-03` and is due `2026-11-10`.
The case stays in the owned battery and selection pool, with its quality trust withheld.
An exact independent correction and reactivation review remains required before the next aggregate.
The issuer-lock proposal also remains pending exact review.

### Final artifact and review integrity

The final raw artifact remains byte-exact at SHA-256 `c8ec22427dd373492493b49b1f96c3e46d5476b8a928aa452b3dfd1654e6ea8f`.
Final integrity checks validate all 100 case payloads, raw-row projections, packets, original verdicts, and digest-bound review notes.
The first final check correctly rejects 37 notes that lack an explicit full case ID.
Codex adds only the already-verified identity labels, preserving every prior note byte and its bound raw-row hash.
The repair receipt is `tmp/2026-11-02-golden-overnight/review-identity-label-repair.json`.
The repeated strict check passes in `t98`; no guard or measurement changes.

The exact Gateway reconciliation joins all 775 attempts with complete costs.
It finds no missing receipt, unknown amount, duplicate, conflict, or unmatched window row.
Native and Gateway observations count each call once.
The public export `research/audits/2026-11-02-golden-overnight/reviewed-run.json` retains metadata only.
Its quality aggregate stays null.

The free offline-plan comparison has 100 identical rows before and after the reference edits.
Both output hashes are `65e37f91533cc74edf11d4d6f50b1af16f39b9dc3d080f377602b2f72b0aac98`.
The comparison receipt is `tmp/2026-11-02-golden-overnight/offline-plan-comparison.json`.
This comparison does not rejudge an answer or establish a quality win.

### Golden reference corrections

Grok rederives the issuer authorization rule before reading the proposer disposition.
Its independent matrix SHA-256 is `25e7604b54d272baccf7a1aad0454d2bc2baf761eb49c1fd7b21d702d0e0ad1d`.
Current Core still requires a matched signer when needed weight is zero.
Master weight zero disables the master key; another sufficient signer can authorize issuance or restore permission.
The default fresh-account recipe remains valid.
The correction changes its general step-six condition, not steps one through five, key facts, or avoid clauses.

Exact factual corrections and Audit Bank reactivation receive independent Grok approval.
The byte-identical durable approval is `research/audits/2026-11-02-golden-overnight/reference-correction-review.md`.
Its SHA-256 is `7e4de0d62497b7311a6952aefb3a4850d3b4b3c4122bf4061ef68aac2177032b`.
A second provenance check approves replacing six absent ledger anchors with that tracked approval path.
It approves Audit Bank bytes `47ec5d96abf52f9e55d6762b56cd94bab88a31ef1e5b6e34745c87d0321b598d` and issuer bytes `df354c6cf46446b62a4801250f159f3d01c69b037292509c8c8444e06c843e6b`.
The durable confirmation is `research/audits/2026-11-02-golden-overnight/reference-provenance-confirmation.md`.
Root applies those files only after both before-hash and approved-hash checks pass.

Compilation produces 501 cases and corpus SHA-256 `3d703990201a2ae4c59ff308ec5c73a3add152e5c3ebc7f22a15e507faed58f0`.
Register stamping reopens only cluster-011 for topical independent review.
An initial lint invocation uses a mistyped baseline SHA and fails without evaluating the corpus.
The corrected invocation finds one genuine coverage failure: scheduled count 176 exceeds the 35% ceiling.
The correction had changed Audit Bank from its original live behavioral contract to scheduled.
The reference explicitly preserves a dated illustration and accepts later grounded observations.
Root prepares a one-field restoration of the original live tag for independent contract review.
No coverage threshold or unrelated case changes.
All 25 sentinel schema checks pass with no stale entry.
The three new stage sentinels each match the live rules once.
The eval self-test passes.

### Tail source triage

Codex completes all reviews through case 100, then checks six bounded source candidates.
Exactly six additional primary GETs run; none calls a model, simulation, or transaction.
All improvements namespaces and resolved records are searched in both working trees.
The case-81 Low/informational concern remains held under its inferred chunk-label contract.
The case-85 fee-bump wording and case-93 SEP-10 shorthand remain narrow clarification candidates.
The case-99 metadata concern remains held; its unsupported score-drift attribution is withdrawn.
Only verified batching, preview-decoding, and enum examples proceed to scoped finding preparation and independent review.
The ignored triage evidence lives at `tmp/2026-11-02-golden-overnight/tail-source-triage/`.

At the completed provenance review, Grok helper receipts report `$21.32399956` and `$17.24205584`.
Their combined amount is `$38.56605540`; later register and final review costs remain within the existing `$45` allocation.
Codex dollars remain unreported; the `$100` reserve is neither a charge nor a proven upper bound.
No further paid measurement is authorized.

### Preserved source and focused checks

Codex commits the exact 14 frozen experimental files as `0aea991fd36ecd5653eef07c317568c7aa71f0e8`.
The method branch stays separate from production source and the results branch.
Working, snapshot, staged, and committed blobs match freeze-v5; five shared-source hashes also match.
Both the tree secret scan and normal staged commit scan pass.
The method working tree is clean.
Its stale owned sd-080 copy and 123-record index delta are removed after ownership and preservation checks.
MAIN retains the complete newer finding and index.

Root runs four focused corpus, lifecycle, register, and sentinel test files in `t9j`.
All 109 tests pass in four files.
The pin-review check in `t9g` passes with no skill-pin or file-selection change.
Three additional local proposals add `sd-087`, `sd-088`, and `sk-037`.
Public receipt `research/audits/2026-11-02-golden-overnight/tail-source-receipts.json` preserves currentness and verification limits.
Exactly four further primary GETs confirm the published examples and the latest dapp skill branch.
No simulation, conversion fixture, or transaction runs; all three records retain proposed status.
The generated findings index and local lint pass with 132 records in `t9h`.
Root adds explicit per-finding intake targets.
Independent final proposal review remains required before closeout.

### Final reference metadata and register application

Grok approves the one-field restoration of Audit Bank's original live behavioral tag.
Approved case SHA-256: `9806d54952eaf80c0b93a8fcdbb4da2f89b9978cf54a86966d496d7a3e104625`.
The golden retains its dated illustration and accepts later grounded observations.
The source rates, asOf, reverify date, and reviewed reactivation stay unchanged.
Root verifies the one-field diff and exact before/after hashes before applying it.
Coverage floors and unrelated cases stay unchanged.

Durable metadata review: `research/audits/2026-11-02-golden-overnight/reference-metadata-review.md`.
Durable helper review: `research/audits/2026-11-02-golden-overnight/reference-register-review.json`.
The independent topical review covers all 17 cluster-011 members.
It checks separate award bases, caps, dated totals, dates, stage rates, and priority categories.
Root identifies the earlier count of 18; Grok writes the corrected 17-member review before application.
The issuer case belongs to no reopened entry and agrees with adjacent authorization cases.
The valid default-account recipe needs no partial cap; the extra symmetric-caution warning remains documented.

Compilation and explicit register review run sequentially in `t9k`.
The corrected corpus SHA-256 is `103226f7025594b029fa78b75fb2f379509580733a72e77ce567a6fc043ca701`.
The corpus has 501 active cases, four proposals, and no quarantine.
The final lint, register check, sentinel schema check, and 132-record local findings lint pass.
Lint records zero errors and 93 warnings.
No original measured row, grade, cost, case payload, or artifact changes.
The completed quarantine and setup queue items become one bounded noncompletion/calibration follow-up.

### Independent closeout clearance

Grok completes the final independent review with CLEARED and no actionable hold.
The exact public copy is `research/audits/2026-11-02-golden-overnight/final-closeout-review.md`.
Review SHA-256: `e2ad75e439015000637ab5a762d212eceaa1893e7178a72bf7fa12fbaa828c79`.
It binds the current corpus, both case hashes, the 775-call accounting, all 100 reviewed rows, and three new proposed findings.
The three proposals retain their runtime-verification limits; uncertain source concerns stay held.
Original grades, artifacts, and denominators stay unchanged.
The reviewer explicitly permits receipt-only cost, scan, commit, and cleanup updates after clearance.

Completed Grok helper CLI records total `$40.55712260`: `$21.32399956` and `$19.23312304`.
The total remains inside the existing `$45` helper allocation.
Public receipt: `research/audits/2026-11-02-golden-overnight/cost-observations.json`.
Known instrument ledger amounts total `$38.762622`; the older separate native observation stays distinct.
Codex dollar charges remain unreported; an exact whole-session bill and total-limit verification remain unavailable.
Allocations remain `$190.762622`, with `$9.237378` unassigned from the owner's `$200`.
Reserves are neither charges, estimates, nor proven upper bounds.

The final staged tree secret scan in `t9m` passes with no exposed credential.
The private-usage boundary and gitleaks checks pass.
Root stops and removes the owned baseline server `t58` after all measurement and source checks finish.
Helpers remove their own descendants; root removes completed command terminals and the accepted idle helpers.
The source worktree remains clean at its experimental commit.
No upstream issue, human message, push, deployment, or production source change occurs.

After completed-turn cost capture, root stops and removes reviewer `t5q` and awake terminal `t7j`.
The ownership inventory leaves unrelated terminals unchanged.
Only the final local-commit command remains before its own bounded-tail cleanup.
