# Unmeasured final-synthesis candidate

This runner measures a custom host loop through the remote Workers AI binding.
It does not measure the Grok CLI or the canonical QA answering agent.
Its results have no historical QA comparability or canonical five-track claim.
No inference is authorized by these instructions.

The fixed model is `xai/grok-4.7`, with reasoning effort `high`.
The runner has no fallback, panel, inference retry, or resume path.
The root owns plan files, review, allocations, and paid launch.
The deadline is `2026-11-03T10:00:00Z` and has expired.
This candidate does not extend it or authorize a new collection.

The candidate uses result schema `direct-grok-final-synthesis-candidate-v1`.
Plans require schema `direct-grok-final-synthesis-plan-v1` and `answerPolicy: "reserve-last-answer-request-v1"`.
The runner rejects older reviewed plans.
Its last existing answer request uses provider `tool_choice: "none"` and a short synthesis reminder.
The 16-request ceiling remains unchanged; earlier completion remains valid.
Returned tools on that final request never execute.
Empty, refused, and violating responses remain failures.
Artifacts retain the actual request messages, tool choice, policy identity, response choice, and reported costs.
The judge model, effort, prompt, and evidence pack remain unchanged.

Local contract checks support the `none` setting; no live provider capability check ran.
Future collection needs an independently reviewed paired experiment, explicit spend authorization, and a separately approved deadline.
It also needs fresh source, selection, corpus, remote, and provider identity pins.
Measure completion, factual quality, refusal, tool-policy violations, latency, and reported cost under both policies.
Keep original results frozen and report the new experiment separately.

## Entry points

`run.mjs` supports these modes:

| Mode | Inference | Required evidence |
| --- | --- | --- |
| `prepare-pins` | None | A hashed draft plan; safe binding setup; QA plans also check MCP and remote identities |
| `validate-plan` | None | A hashed final plan and its prepared source pins |
| `transport-canary` | One request | A separately reviewed transport plan and `$1` allocation |
| `selftest` | At most seven requests | The seven original candidates and a `$3.50` allocation |
| `baseline` | At most 1700 requests | The frozen 100-case selection and an allocation of at most `$30` |

The transport canary sends only `Reply with exactly READY.`
It advertises no tools and permits 256 output tokens.
It requires no golden input, MCP server, remote vector, or prior judge selftest.
It makes no QA quality claim.

Selftests reuse `runJudgeSelfTestCandidate(0..6, { judge: injectedAdapter })`.
Every selftest request receives at most `$0.50` from the shared ledger.
No canonical Claude adapter or paid selftest wrapper runs.

The baseline permits 16 provider requests per answer and one judge request per answered case.
It permits 8192 output tokens per request.
Answer limits remain explicit failed rows.
The selected denominator never shrinks.

Baseline cases can continue after HTTP 500, 502, 503, or 504 without retrying the failed request.
Continuation requires one raw call, complete reported cost, unique matching log IDs, and successful after-call identity checks.
Failed rows retain the role, HTTP status, answer, transcript, and every cost observation.

Answer and judge phases have separate HTTP failure counts.
Three consecutive qualifying failures in either phase stop the method.
A successful provider completion resets only its phase's count.
All other provider failures stop the method.
Selftests and transport canaries remain fail-fast.

Missing grades suppress quality aggregates, even when every selected case was attempted.
The artifact records attempted and graded completeness separately.
Attempt coverage requires an observed raw start for every selected ID.
Grade coverage records literal grades and does not assert run validity.

## Transport and evidence

The provider child creates a fresh configuration containing only the remote `AI` binding.
It passes `envFiles: []`, `persist: false`, and `remoteBindings: true` to `getPlatformProxy`.
It loads no repository Worker configuration or `.dev.vars`.
Normal official Cloudflare credential discovery remains host-side.
No credential values enter model requests or artifacts.

`proxy-response.mjs` accepts only Node Responses and genuine exported Miniflare Responses.
It preserves the real body, headers, and status when it normalizes the Miniflare class.
It rejects arbitrary response-like objects.
The existing `createEvalCostBinding` settles each request before the next request starts.
The runner records native reported ticks separately, using `/ 1e10`.
It never estimates missing USD from tokens or prices.

Validated HTTP 200 responses can supply `native-reported` costs when Gateway settlement is missing.
Native acceptance requires the exact model, one raw start, a real Response brand, and unique matching request/log IDs.
Native ticks must be non-negative safe integers; completeness flags must be absent or exactly false.
Different complete native and Gateway amounts stop the method with `provider-cost-conflict`.
An unresolved amount stops the method with `provider-cost-missing`.
Invalid native reports stop the method with `provider-native-cost-invalid`.

Gateway receipts and their errors remain separate and unchanged.
`completeCostAccounting` describes resolved reported amounts; `completeGatewayCostAccounting` describes Gateway observations only.
Equal reports count the request once and retain both observations.
Returned final text enters `unacceptedEvidence` before settlement and after-call checks.
`row.answer` receives accepted text only after local and remote guards pass.
Cost acceptance does not establish answer or run validity.

The parent saves response class, log identity, cost observations, result, and failure incrementally.
It writes artifacts atomically with owner-only permissions.
It preserves reported costs when parsing or later identity checks fail.
Unknown complete costs remain `null`, including after timeout.
The original failed v1 canary remains separate evidence with reserved unknown spend.

The request timeout uses the documented `cf-aig-request-timeout` header.
A parent timer provides a separate child-process backstop.
The parent terminates only its owned provider process group.
Termination does not prove that upstream inference stopped.
The USD ledger stops the next request and detects excess spend.
It does not reserve dollars or guarantee an in-call provider ceiling.

## QA tool and judge contracts

The official MCP client connects only to `http://localhost:8790/mcp`.
It advertises no sampling or elicitation capability.
The answering model receives only server instructions, the selected question, exact function schemas, and tool results.
The host dispatches only `search` and `execute`.
It rejects other targets, file arguments, repeated tool IDs, malformed responses, and model substitutions.
The judge receives the exact existing prompt and no tools.
The existing `p9` pack and verdict consistency checker remain unchanged.

Transcripts keep the actual tool names `search` and `execute`.
The `p9` recognizer accepts `execute` through its suffix check.
A mocked test verifies that execute evidence reaches the live-tagged judge prompt.
The same test verifies that search-only evidence does not enter that pack.

The MCP client's parsed implementation metadata omits custom `sourceRevision` fields.
The transport therefore preserves the raw initialize response before the client projects it.
It also preserves raw tool schemas for the surface hash and model tool definitions.
It never inserts an expected revision into the response.

## Plans and pins

All value flags use spaced values and appear exactly once.
Unknown flags, duplicates, equals forms, missing values, and budget mismatches fail closed.
Both free and paid modes require `--expect-plan-sha256`.
Free modes reject budget flags.
Paid modes require exactly one `--max-budget-usd`.

The plan schema is `direct-grok-host-loop-plan-v1`.
Prepare pins from the draft before adding `sourcePins`.
The final plan adds only the source-pin path and file hash.
Any other settings change requires fresh preparation.
Prepared pins include the actual loaded parent and child modules, lockfile, Node, workerd, and config digest.
They also include the effective environment identity without values.
`runner-support.mjs` lists the excluded terminal and IPC bookkeeping names.
Node preload flags and nonempty `NODE_OPTIONS` are rejected.

Before each provider request, the runner checks source files, environment, plan, selection, listener, and tool surface.
Transport canaries omit QA-specific checks explicitly.
Remote checks surround each complete answering turn, including its tool loop.
Final checks repeat local and remote identities.
Incomplete collection, unknown costs, or identity failures suppress quality aggregates.

### Transport draft skeleton

The root can save this skeleton as its new transport draft.
It is separate from the preserved v1 canary plan and authorization.

```json
{
  "schema": "direct-grok-host-loop-plan-v1",
  "method": "transport-canary",
  "model": "xai/grok-4.7",
  "effort": "high",
  "gatewayId": "stellar-raven-demo",
  "accountId": "ba55b7ae9acfb3ed152103e3497c0752",
  "deadline": "2026-11-03T10:00:00Z",
  "maxBudgetUsd": 1,
  "maxProviderCalls": 1,
  "maxAnswerSteps": 0,
  "maxOutputTokens": 256,
  "requestTimeoutMs": 120000,
  "hostBackstopMs": 127000,
  "settlementGraceMs": 7000,
  "selection": {
    "ids": ["provider-ready"],
    "idsSha256": "1d2385427504edf201e398f3e5e3b445670f1d02d772c304bffbf712cc1644d4",
    "contentSha256": "e2afe8e3563f9306232700c744f2695c4ad40f2fb28eb56b0c444204fd2ca303",
    "lifecycleSha256": "74234e98afe7498fb5daf1f36ac2d78acc339464f950703b8c019892f982b90b"
  }
}
```

### QA skeleton changes

Both QA methods add these identity blocks:

```json
{
  "server": {
    "port": 8790,
    "revision": "ce21317ff46d7491d82caf058baca7328c4177a9",
    "surfaceSha256": "bb19653bd0d153964df25042a92d42dde49d8c5b48f7face2fc1d17614786762"
  },
  "remote": {
    "probePath": "<absolute pinned probe path>",
    "probeSha256": "<probe file SHA-256>",
    "vectorSha256": "<fresh stable remote vector SHA-256>"
  },
  "corpus": {
    "path": "<absolute frozen canonical cases.json path>",
    "sha256": "1ec9f413f07de80aa8d3c6c4ed62ddf1adaaa5bc8ab85f465c8833d029e96ba0"
  }
}
```

For `selftest`, set `maxBudgetUsd: 3.5`, `maxProviderCalls: 7`, `maxAnswerSteps: 0`, and `maxOutputTokens: 8192`.
Use IDs `judge-selftest-0` through `judge-selftest-6` in that order.
`selftestInputs()` returns the original inputs without inference.
Hash `inputs.map((input, index) => ({ ...input, id: "judge-selftest-" + index }))` for `selection.contentSha256`.
Use `jsonSha(null)` for the selftest lifecycle hash.
Use `jsonSha(ids)` for its ordered ID hash.

For `baseline`, set `maxBudgetUsd: 30`, `maxProviderCalls: 1700`, `maxAnswerSteps: 16`, and `maxOutputTokens: 8192`.
Use the 100 explicit frozen IDs from the root's `selection100.json`.
Add its absolute `selection.path` and raw-file `selection.sha256`.
Set `idsSha256` from `orderedIdsSha256`, and `contentSha256` from `selectedContentSha256`.
Set `lifecycleSha256` from the frozen selection's lifecycle hash.
Do not select cases from score results.

For QA methods, proposed timeout values are `240000`, `247000`, and `7000` milliseconds respectively.
The root must review the actual values in each plan.

### Command templates

Run these commands from the method worktree.
Replace placeholders with the root's reviewed paths and exact hashes.
These templates do not authorize paid execution.

```sh
# Free preparation of a method-specific draft.
node eval/qa/non-anthropic/run.mjs \
  --mode prepare-pins \
  --plan <draft-plan.json> \
  --expect-plan-sha256 <draft-plan-sha256> \
  --out <new-source-pins.json>

# Add sourcePins: { path, sha256 } to the final plan, then hash that file.
node eval/qa/non-anthropic/run.mjs \
  --mode validate-plan \
  --plan <final-plan.json> \
  --expect-plan-sha256 <final-plan-sha256> \
  --out <new-validation.json>

# Separate corrected provider-transport method, after its independent review.
node eval/qa/non-anthropic/run.mjs \
  --mode transport-canary \
  --plan <reviewed-transport-plan.json> \
  --expect-plan-sha256 <reviewed-transport-plan-sha256> \
  --out <new-transport-result.json> \
  --max-budget-usd 1

# Seven original judge candidates, under another bounded authorization.
node eval/qa/non-anthropic/run.mjs \
  --mode selftest \
  --plan <reviewed-selftest-plan.json> \
  --expect-plan-sha256 <reviewed-selftest-plan-sha256> \
  --out <new-selftest-result.json> \
  --max-budget-usd 3.50

# Frozen 100-case diagnostic, after all prior gates and its own review.
node eval/qa/non-anthropic/run.mjs \
  --mode baseline \
  --plan <reviewed-baseline-plan.json> \
  --expect-plan-sha256 <reviewed-baseline-plan-sha256> \
  --out <new-baseline-result.json> \
  --max-budget-usd 30
```

Output paths and their `.tmp` files must not exist before a method starts.
Keep plan files, source pins, validation receipts, and results as separate artifacts.
Never overwrite the failed v1 evidence or reuse its authorization.

## Free verification

```sh
node node_modules/vitest/vitest.mjs run test/direct-grok-runner.test.ts
npm run typecheck
node eval/qa/non-anthropic/run.mjs --help
```

The mocked tests cover two complete cases, unchanged judge rules, seven original candidates, costs, environment, and deadlines.
They also cover Response normalization, canonical evidence selection, changed pins, incomplete collection, answer limits, and the host backstop.
These tests establish no live inference or live cost-reporting claim.
