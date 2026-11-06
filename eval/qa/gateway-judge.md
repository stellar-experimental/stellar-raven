# Gateway second judge

`gateway-rejudge.mjs` is an opt-in, non-promotable judge diagnostic. It does not change the
Claude default, rubric, pack, or existing dollar ledger. It uses `buildJudgePrompt` and the
same verdict extraction/consistency checks as Claude. A different API transport is always
labeled `nonIdentical: true`; it cannot establish identical-input Claude variance.

The archived Codex CLI transport is unsupported. Codex 0.167.0 documents forced ChatGPT
login but no global tool-denial control. Read-only sandboxing and an empty working directory
do not establish blindness. PreToolUse hooks can fail open. This runner never uses Codex
authentication, subscription tokens, or undocumented ChatGPT endpoints.

## Request and accounting boundary

One call sends a single non-streaming OpenAI Responses POST to the fixed Cloudflare Gateway
origin. The request has `tools: []`, `tool_choice: "none"`, `parallel_tool_calls: false`,
`store: false`, `background: false`, standard service tier, explicit effort and output cap,
and no conversation/session continuation. There is no tool executor, MCP connection,
provider fallback, or inference retry. The model receives only the canonical judge prompt.
The host uses network access for inference and cost settlement; the model has no network tool.

Each request disables Gateway caching and payload logging and limits Gateway attempts to one.
`cf-aig-metadata` binds `role: "judge-b"`, the authorized run ID, and the prompt hash; the
settled log must reproduce those values. This separates judge charges from answer calls to
the same model on the same gateway.
Redirects are errors. Responses must be complete, contain one completed assistant text message,
have valid token usage, and match the exact requested model and effort. Unexpected tool items,
refusals, partial output, and unsupported streams are errors even if they contain a valid verdict.
The explicit `gatewayLogModel` must be `openai/` followed by the requested bare model ID;
it is checked literally against the log. No model aliases or fuzzy matching are used.

The runner requires a unique `cf-aig-log-id` and reads its cost from the Cloudflare API.
Only log reads may retry, at most five times. A usable log must match the ID, provider, model
and HTTP status, have `cached: false`, `custom_cost: false`, and `collect_log_payload: false`.
Missing cost is `null`, never zero. A mismatched log ID or custom cost cannot establish actual
cost. Other invalid responses retain attributable reported cost but close authorization.
Logs, response bodies and credentials are not copied into results; only bounded selected
identity, usage, cost and verdict fields are retained.

The authorization bounds model POST count and total reported dollars for one method invocation.
Before each POST, a checkpoint records its reservation, and the remaining dollars must cover
`callReserveUsd`. The API accepts no dollar cap: the hard per-call limits are prompt bytes and
`max_output_tokens`. A call exceeding its reserve or the method cap is retained as a failure
and stops the next call. This is not an absolute provider-invoice ceiling. Size the reserve
conservatively and retain a cash reserve outside the method. Missing cost, unexpected tool output,
checkpoint failure, transport failure, or identity drift stops the method. Settled row errors
(incomplete output, refusal, invalid verdict JSON, consistency failure) remain error observations;
re-judging may continue up to `floor(maxCalls * maxJudgeErrorRate)` such rows. The first excess
stops the method. Calibration requires a zero rate and stops on any error or expected-grade
mismatch. There is no automatic resume or retry.

## Configure and review without calls

Create a local config with every field explicit:

```json
{
  "accountId": "<32 lowercase hexadecimal characters>",
  "gatewayId": "default",
  "model": "gpt-6.1-sol",
  "gatewayLogModel": "openai/gpt-6.1-sol",
  "effort": "high",
  "maxOutputTokens": 4096,
  "maxPromptBytes": 100000,
  "timeoutMs": 120000,
  "callReserveUsd": 0.25
}
```

```sh
node eval/qa/gateway-rejudge.mjs --identity /absolute/config.json
```

Identity hashes the native Node executable, relevant environment, adapter and shared judge
sources, request template, endpoint/account/gateway, exact model IDs, effort, and bounds.
It stores no credentials or credential hashes. Inherited code injection and proxy environment
settings are rejected. Compute the identity in the same final shell environment as the run.

An authorized plan has this shape; the dollar amounts are examples, not authorization:

```json
{
  "schema": "gateway-judge-plan-v1",
  "mode": "calibration",
  "allowNonIdentical": true,
  "runId": "reviewed-calibration-unique-id",
  "out": "/absolute/new-result.json",
  "config": { "...": "the complete config above" },
  "identitySha256": "<identity.sha256>",
  "auth": { "kind": "env", "variable": "CF_AIG_TOKEN" },
  "maxCalls": 7,
  "maxJudgeErrorRate": 0,
  "maxBudgetUsd": 2
}
```

Environment authentication accepts `CF_AIG_TOKEN`, `CF_API_TOKEN`, or
`CLOUDFLARE_API_TOKEN`. A standard Wrangler authentication helper is also supported:
`{"kind":"wrangler","path":"<absolute executable>","sha256":"<executable hash>","profile":"<profile>"}`.
It invokes only `auth token --json --profile <profile>` and keeps the token in host memory.
Do not place token values in plans or command arguments.

Calibration uses exactly the same seven known-answer fixtures as the Claude self-test.
An optional `pilot: {"path":"<absolute bundle>","sha256":"<raw file hash>"}` adds exactly
20 frozen historical inputs under `historical-judge-pilot-inputs/v1`; set `maxCalls` to 27.
The bundle contains `source`, `sourceSha256`, `sourceRevision`, `seed`, and `inputs` entries
with `id`, `input`, `promptSha256`, and `historicalJudgeA`. The runner recomputes every prompt
hash, preserves explicit historical transcript evidence, and records A/B disagreements.
These are calibration inputs, not repaired or promotable source measurements.
Calibration stops on the first fixture mismatch or judge error. A partially completed
calibration does not authorize broad collection or a rerun.

For saved answers, use `mode: "rejudge"`, explicit ordered `ids`, and
`source: {"path":"<absolute result>","sha256":"<raw file hash>","casesRef":"<commit>","diagnostic":true}`.
The source must use the current Playground contract. Its case snapshot and golden dates must
verify. Diagnostic mode admits settled mixed shards and preserves failed cells as skipped
rows, without altering source flags. `maxCalls` must equal the exact eligible-row count.

```sh
node eval/qa/gateway-rejudge.mjs --plan /absolute/plan.json --dry-run
# Only after separate plan review and bounded spend authorization:
node eval/qa/gateway-rejudge.mjs --plan /absolute/plan.json \
  --authorized-plan-sha256 <raw-plan-file-sha256>
```

Dry-run validates inputs and pins without loading credentials or contacting a model. Execution
creates the output exclusively; an existing output or checkpoint prevents silent replay.
`meta.planSha256` is the exact authorized raw file hash. `canonicalPlanSha256` is separate.
Every checkpoint is a `gateway-rejudge-v1` artifact. Its source/pilot, ordered selection,
prompt hashes, exact judge identity, per-call usage/cash, skipped cells, and unattempted IDs
remain explicit. It always has `nonPromotable: true` and `summary: null`. A study-specific
reviewed analysis may consume these diagnostics while retaining its fixed denominator.

## Validation and live gate

`test/gateway-judge.test.mjs` and `test/diagnostic-rejudge-source.test.mjs` use fake responses
and local files only. They check tool/error/incomplete output, usage, cache and log identity,
missing costs, cap exhaustion, credential non-disclosure, shared prompts, calibration failure,
replay refusal and mixed-shard admission. Run them with the existing judge/rejudge tests.

Offline success does not establish live account access, service response shape, calibration
accuracy, latency or cost. Complete separately authorized calibration and inspect every log,
disagreement and cost before using the adapter for a study. Project remaining cash from measured
costs, including answer generation and reserves, before starting the final matrix.

Protocol references: [OpenAI Responses](https://developers.openai.com/api/reference/resources/responses/methods/create),
[GPT-6.1 Sol](https://developers.openai.com/api/docs/models/gpt-6.1-sol),
[Cloudflare OpenAI provider](https://developers.cloudflare.com/ai-gateway/usage/providers/openai/),
[Cloudflare log detail](https://developers.cloudflare.com/api/resources/ai_gateway/subresources/logs/methods/get/).
