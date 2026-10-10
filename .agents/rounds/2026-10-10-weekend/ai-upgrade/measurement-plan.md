# `ai` upgrade with explicit tool strictness: measurement plan

Date: 2026-10-10. Status: pre-spend. No paid call ran, and no server started.
The plan needs an independent plan review before any spend.
The owner approved paid tests for this update on 2026-10-02.
That approval does not replace the launch checkpoints below.

## Question

Does the CANDIDATE keep Playground routing and answers at the BASE level?
The CANDIDATE changes two things that the model can see:

- the `ai` and `@ai-sdk/*` versions;
- an explicit `strict: false` on both Playground tools.

The result must show no routing regression and no verified answer regression.
The question includes answers, because strictness can change tool arguments and evidence.

## Arms

| Arm | Commit | Worktree |
| --- | --- | --- |
| BASE | `0dc353b992b8c0688c051909b5b07b8e14956134` (`main`; amendment 1) | a detached worktree that the coordinator makes |
| CANDIDATE | the frozen head of branch `w1010/s` | `raven-w1010-s` or a clean copy at that commit |

The coordinator records the full CANDIDATE commit before launch.
If `main` moves before launch, rebase the branch and set BASE to the new merge base.
A changed BASE needs a plan amendment.

**Amendment 1 (2026-10-10, operator).** `main` moved from `d15a4ce5` to `0dc353b9` before launch.
The two new commits (#262, #263) change only `.agents/`, `improvements/`, and paired-launch tests.
They change no file under `src/`, `eval/qa/`, `eval/playground/`, `catalog/`, `specs/`, or `scripts/`.
The operator rebased `w1010/s` onto `0dc353b9` without conflicts.
The `src/` and `package.json` diff and the `package-lock.json` and `test/` diff are byte-identical to the reviewed diff.
BASE is now `0dc353b9`. BASE still locks `ai` 7.0.79 and `@ai-sdk/openai` 4.0.47.
No other part of the plan changes.

`git diff --stat "$BASE" "$CANDIDATE"` must list only these paths:

- `package.json` and `package-lock.json`;
- `src/demo/tools.ts`;
- `test/smoke/demo-openai-tool-request.test.ts`;
- `.agents/TODO.md` and files under `.agents/rounds/2026-10-10-weekend/ai-upgrade/`.

`git diff "$BASE" "$CANDIDATE" -- src/` must show only the `DEMO_TOOL_STRICT` constant, its comment, and two `strict` lines.

Package versions:

| Package | BASE | CANDIDATE |
| --- | --- | --- |
| `ai` | 7.0.79 | 7.0.137 |
| `@ai-sdk/openai` | 4.0.47 | 4.0.91 |
| `@ai-sdk/anthropic` | 4.0.42 | 4.0.78 |
| `@ai-sdk/google` | 4.0.51 | 4.0.93 |
| `@ai-sdk/gateway` | 4.0.64 | 4.0.110 |
| `@ai-sdk/provider` | 4.0.8 | 4.0.26 |
| `@ai-sdk/provider-utils` | 5.0.30 | 5.0.58 |

`workers-ai-provider` stays at 4.0.0.
`npm audit` reports 0 findings on CANDIDATE.

## What the free checks settle

An offline request capture ran in the smoke runtime on both lockfiles.
It used the production tool builder, the production Responses factory, and production settings.
A stub `fetch` returned one valid and one invalid `search` call, then an answer.
The second request used the production final-step policy.

The two captures differ in two places only:

1. Each tool carries `strict: false`. BASE omits the field.
2. An invalid-input tool error reaches the model as `{"error":"AI_InvalidToolInputError: …"}`.
   BASE sends the bare error text.

These parts stay the same on both lockfiles:

- `temperature: 0.1`, `max_output_tokens: 4096`, and `reasoning: {"effort":"none"}`;
- `tool_choice: "auto"` on tool steps;
- no `tools` and no `tool_choice` on the tools-disabled final step;
- the `function_call` history items;
- the valid tool output, byte for byte;
- the parameter schemas (smoke-test hashes unchanged).

The explicit `strict: false` also goes out on the BASE lockfile.
The old provider sends `strict` whenever the tool sets it.
So the strictness change comes from the decision, not only from the lockfile.

`test/smoke/demo-openai-tool-request.test.ts` pins this reviewed shape.
It fails on the BASE lockfile (error wrapping) and on `strict: true` in `src/demo/tools.ts`.

## Strictness decision

`src/demo/tools.ts` sets `strict: false` on `search` and `execute` on purpose.

The [OpenAI function-calling guide](https://developers.openai.com/api/docs/guides/function-calling#strict-mode) defines three cases.
With `strict` omitted, Responses tries to normalize the schema to strict mode.
It falls back to non-strict mode when it cannot.
`strict: false` selects non-strict, best-effort function calling.
`strict: true` rejects a schema that does not meet the strict requirements.

`@ai-sdk/openai` 4.0.77 and later sends `strict: tool.strict ?? false` on Responses.
The omitted case is no longer possible with this provider.
So the choice is `false` or `true`.

The schemas against the [strict requirements](https://developers.openai.com/api/docs/guides/structured-outputs#supported-schemas):

| Requirement | `search` | `execute` |
| --- | --- | --- |
| `additionalProperties: false` | yes | yes |
| All properties required | no: 6 properties, 1 required | yes |
| Unsupported keywords | `minLength` on `query` and `recoverFrom` items | `minLength` on `code` |

OpenAI lists `pattern` and `format` as the supported string keywords.
It does not list `minLength`.
`minimum`, `maximum`, `minItems`, and `maxItems` are on the supported list.

Reasons for `strict: false`:

1. The Playground sends the production MCP input schemas.
   MCP clients call these tools best-effort.
   Strict decoding would measure a different contract from the MCP surface.
2. `strict: true` for `search` needs a Playground-only schema.
   Every optional field becomes required and nullable, and the handler maps `null` to "not set".
   The model then must emit six keys on each call. That is a model-visible change.
3. `strict: true` with `minLength` can make OpenAI reject the request.
   A rejection stops every Playground turn. No free check can prove acceptance.
4. `strict: false` does not depend on server-side normalization.
   A server change cannot silently change the mode.

The cost of the decision: no live run shows the mode that the server selects today.
If the server normalizes a BASE schema to strict mode, the CANDIDATE changes that tool's decoding.
This measurement reads that risk through the strictness diagnostics below.

## Change inventory

The inventory covers `ai` 7.0.80–7.0.137 and `@ai-sdk/openai` 4.0.48–4.0.91.
The [2026-10-02 review](../../2026-10-02-raven-next-followup/review-ai-plan-astra.md) covers the earlier part.

Exercised by every normal turn:

| Change | Effect on this path |
| --- | --- |
| `openai` 4.0.77 `2abd503` | Omitted `strict` becomes `false`. The CANDIDATE sets `false` explicitly. |
| `ai` 7.0.101 `6aa7c54`, 7.0.106 `1aef01e` | Tool-output JSON serialization. The capture shows identical valid outputs. |
| `openai` 4.0.70 `1f5bb62` | Assistant text in Responses history. Exercised after any step with text. |
| `openai` 4.0.54 `f6fac50`, 4.0.57 `7243530`; `ai` 7.0.129 `73d8343` | Responses usage handling. The receipt gate checks it. |
| `openai` 4.0.66 `d5e3024`, 4.0.72 `411b3f2`, 4.0.81 `4e94782` | Schema normalization. The schema hashes stay the same. |
| `ai` 7.0.119 `34d869e`; 7.0.116 `af9597b`; 7.0.123 `ede5b89` | Stream completion in non-Node runtimes, ES2022 output, and tsdown builds. |
| `openai` 4.0.79 `e3605f6` | Streamed tool calls with missing or repeated IDs. |

Exercised only by some turns:

| Change | When it applies |
| --- | --- |
| `openai` 4.0.88 `32ff7ad` | A tool error, for example invalid tool input, reaches the model as an `error` object. |
| `ai` 7.0.80 `35841f5`; `openai` 4.0.48 `eee6200`, 4.0.74 `4cf5a99` | A mid-stream provider error or a malformed stream event. |
| `ai` 7.0.92 `d1904d3` | An empty HTTP error body. |
| `ai` 7.0.83 `ce6849a`, 7.0.93 `ee8391e`, 7.0.130 `6f6b9c0` | Client disconnect or the whole-turn timeout aborts the stream. |

Excluded, with the reason:

- `ai` 7.0.91 stream retries: the default stays zero. The Playground sets no `streamRetries`.
- `ai` 7.0.94 `36b3364` and 7.0.108 `ccf98e7` tool-choice checks: the Playground sets no `toolChoice`.
- `ai` 7.0.106 `prepareStep` model fixes: the Playground `prepareStep` does not change the model.
- `ai` 7.0.129 `f810ea3`: it changes `convertToModelMessages`. The Playground does not use UI messages.
- `ai` 7.0.135 `7c40a09`: it warns for the default step limit. The Playground sets `stopWhen`.
- `ai` 7.0.136 `7b5497c`: it changes `chunkMs` and `firstChunkMs`. The Playground sets neither.
- `openai` 4.0.90 `6c59fb1`: it applies to GPT-6 Sol and Luna. The Playground uses `gpt-5.6-terra`.
- `openai` 4.0.85 `268225c` and `ai` 7.0.129 add a `max` reasoning level. The Playground sends `none`.
- Anthropic and Google provider changes: no model of either vendor is in the production chain.
  With `strict: false`, `@ai-sdk/anthropic` sends `strict: false` where it supports strict tools.
  That is the Anthropic default. `@ai-sdk/google` acts only on `strict: true`.
- OpenAI-compatible chat transports for control models. `workers-ai-provider/openai` uses the Chat Completions path.
  That path sends `strict` whenever the tool sets it, so the Grok control model `xai/grok-4.6` now receives `strict: false`.
  xAI acceptance of that field is unverified. It is a control-lane model, not production.
  Verify it in the model gauntlet before the next control-model lane. This plan does not cover it.
- UI streams, tool approvals, tool search, batches, speech, images, embeddings, and realtime APIs.

The MCP `search` and `execute` path does not import `ai` (2026-10-02 review).
The shared Worker bundle still carries the Playground.
The CANDIDATE build is 7409.43 KiB, gzip 1468.45 KiB.

## Models and spend surfaces

| Role | Model | Spend surface |
| --- | --- | --- |
| Answer | `openai/gpt-5.6-terra`, Responses, reasoning `none`, temperature 0.1 | Cloudflare AI Gateway `stellar-raven-demo` through the Workers AI binding (`AI.gateway(id).run`) |
| Judge | `claude-sonnet-5` | The pinned Claude CLI judge executable |

No Workers AI catalog model runs.
No call goes to the OpenAI API outside the Gateway.
`DEMO_MODEL_OVERRIDE` sets a single model, so no fallback model runs.
This plan measures the primary model only.
The production fallback `openai/gpt-5.6-luna` uses the same provider code; this plan does not exercise it.

Rubric and evidence pack come from the frozen commits: today `v2.11` and `p6`.
Record both from each result's `meta`.

## Cases

Use the six frozen cases of the [authority plan](../../2026-10-01-backlog-closeout/authority-plan.md):

| Group | Case ID | Expected first evidence family |
| --- | --- | --- |
| Ecosystem | `q-anchor-list-builders-discovery` | Scout or Lumenloop |
| Ecosystem | `q-asset-stablecoin-issuers-discovery` | Scout or Lumenloop |
| Ecosystem | `q-scf-build-award-cap` | Scout or Lumenloop |
| Protocol control | `q-protocol-base-reserve-min-balance` | Stellar Docs |
| Protocol control | `q-sep-45-contract-auth` | Stellar Docs |
| Protocol control | `q-soroban-storage-types` | Stellar Docs |

The runner uses corpus order.
Record the selected-case JSON SHA-256 from each result's `meta`.
Do not change the corpus between runs.

## Order and server slots

The order is:

1. BASE server start `base-a`: receipt probe BASE, then baseline 1.
2. CANDIDATE server start `candidate`: receipt probe CANDIDATE, then candidate 1 and candidate 2.
3. BASE server start `base-b`: baseline 2.

This order needs three server starts.
A CANDIDATE replacement after baseline 2 needs one more start.
A BASE replacement can reuse `base-b`.

Only one Wrangler process may run on the machine.
Start only after the coordinator gives the release signal for the server slot.
Do not run while another lane's paid measurement is active.
Stop each server before the next one starts.
Do not change a running server's checkout. Do not rely on hot reload.
Nobody sends a manual, browser, or `--preflight` turn to the eval server during collection.
Such a turn shifts the log-to-row mapping in "Saving `demo-step` events".

## Launch checkpoints

Do these checks before the first paid command. Record each result and its time in the round ledger.
Record private figures privately. Never commit Gateway spend or production usage counts.

1. **Paired window.** `/private/tmp/stellar-raven-paired-launch` must not exist.
   The owner confirms that no paired capacity check, plan signature, or collection is in progress.
   The owner also confirms when the next paired run can start.
   Set the stop deadline at least one hour before that time.
   Do not launch a run or a replacement that cannot finish before the deadline.
   Do not merge or deploy between a paired plan signature and the end of paired collection.
2. **Server slot.** `pgrep -fl wrangler` and `pgrep -fl workerd` print nothing.
   The coordinator gives the release signal.
3. **Gateway headroom.** Read the daily spend limit of `stellar-raven-demo` and today's spend.
   The remaining amount must cover the $27 ceiling and leave room for public Playground traffic.
4. **Freeze.** Both worktrees are clean. Both diffs match the "Arms" section.
   Both generations are recorded. Both arms pass `npm run test:smoke`.
5. **Dry runs.** The two `--dry-run` commands below select the expected IDs.
6. **Judge executable pin.** The collection shell sets `DISABLE_AUTOUPDATER=1`.
   A private directory `$B/bin` is first on `PATH` and holds only a `claude` link to the versioned executable file.
   `judge-pin.mjs` records the identity, and the coordinator records `JUDGE_SHA256`.
   Re-check the pin with `judge-pin.mjs "$B/bin" "$JUDGE_SHA256"` before each judged command.
   A changed pin stops the method before the next paid call. A new pin needs a reviewed amendment.
   Run paid commands as `node scripts/run-playground-semantic-eval.mjs` in that shell.
   `npm run` changes `PATH`, so it is not used for paid commands.
7. **Installed SDK receipt.** The run generation does not hash `node_modules`.
   So, from each arm's worktree, read the installed `ai` and `@ai-sdk/openai` versions.
   Do this at checkpoint time and again just before each server start.
   BASE must print `7.0.79 4.0.47`. CANDIDATE must print `7.0.137 4.0.91`.
   A different value blocks that server start.

A missed checkpoint blocks launch.
A Gateway refusal during collection is a transport failure. It does not replace checkpoint 3.

## Receipt gate with usage correlation

Run one receipt probe at the start of each arm's first server start.
Each probe is one answer turn of `q-soroban-storage-types` with `--no-judge`.
Probes are transport checks. They are not analysis rows.

A probe passes only when all of these are true:

- exit 0, `budget.status === "complete"`, and no `nonPromotable` flag;
- one `eval-cost` frame with `error: null`, `reportedCalls === calls`, and finite `costUsd > 0`;
- `costUsd` at or below $0.30;
- `finishReason === "stop"` and a non-empty answer;
- the server log turn has `attemptedModels` equal to `["openai/gpt-5.6-terra"]`;
- that turn has `inputTokens`, `outputTokens`, and `totalTokens` above 0;
- the `demo-step` token sums equal the `demo-chat` totals (`demo-steps.mjs --strict-usage` exit 0).

The probe is the first turn in its server log, so the correlation is exact.
Record the cost, the three token counts, and the call counts side by side.
Record no user content and no credential.

A failed BASE probe means the instrument is broken. Stop the round without a verdict.
A failed CANDIDATE probe blocks the merge.
A probe above $0.30 stops the round for review. It does not raise any cap.
Do not use the replacement authorization to repeat a failed probe.

## Budget and caps

Stored costs from the [2026-10-01 authority result](../../2026-10-01-backlog-closeout/authority-result.md):

- 25 answer turns cost $1.3999487 over 73 provider calls: about $0.056 a turn and $0.019 a call.
- 24 judge calls cost $1.8318010: about $0.076 a call.
- One one-turn receipt probe cost $0.0028798.
- So one judged six-case run cost about $0.80.

| Item | Cap |
| --- | --- |
| Each receipt probe (2) | $1 |
| Each method run (4) | $5 |
| One replacement run | $5 |
| Round ceiling | $27 |

The caps are authorization limits, not forecasts.
The runner gives each answer turn and each judge call only the remainder of its invocation cap.
One provider call can pass that remainder. That invalidates the method and stops later calls.
After each invocation, check each row's answer cost and each judge cost.
An answer turn above $0.30 or a judge call above $0.30 stops collection before the next invocation.
Missing cost, zero cost for a started call, or excess cost invalidates the method.
Never treat an unknown cost as zero.

Call limits:

- The four planned runs permit 24 answer turns and 24 judge calls.
- The replacement reserve permits 6 more of each. Both absolute caps are 30.
- The two probes permit one answer turn each and no judge call.
- Normal collection is 26 answer turns. With a replacement, it is at most 32.
- Keep the round at or below 30 answer turns in any rolling hour.
  Delay a replacement when needed. Never rotate subjects to pass the hourly limit.

Write the cap files outside the repository.
`$B/caps/receipt-base.json` and `$B/caps/receipt-candidate.json`:

```json
{
  "contract": "playground-semantic-round-cap/v1",
  "experimentId": "2026-10-10-ai-upgrade-receipt-base",
  "kind": "reviewed-round",
  "runAllocation": "planned",
  "plannedAnswerCalls": 1,
  "absoluteAnswerCallCap": 1,
  "answerCallsConsumedBeforeRun": 0,
  "plannedJudgeCalls": 0,
  "absoluteJudgeCallCap": 0,
  "judgeCallsConsumedBeforeRun": 0,
  "infraRetryReserve": 0,
  "infraRetryConsumedBeforeRun": 0,
  "savedAnswerRejudgeReserve": 0,
  "savedAnswerRejudgesConsumedBeforeRun": 0
}
```

The CANDIDATE probe file uses `"experimentId": "2026-10-10-ai-upgrade-receipt-candidate"`.

`$B/caps/baseline-1.json`, `candidate-1.json`, `candidate-2.json`, and `baseline-2.json`:

```json
{
  "contract": "playground-semantic-round-cap/v1",
  "experimentId": "2026-10-10-ai-upgrade",
  "kind": "reviewed-round",
  "runAllocation": "planned",
  "plannedAnswerCalls": 24,
  "absoluteAnswerCallCap": 30,
  "answerCallsConsumedBeforeRun": 0,
  "plannedJudgeCalls": 24,
  "absoluteJudgeCallCap": 30,
  "judgeCallsConsumedBeforeRun": 0,
  "infraRetryReserve": 6,
  "infraRetryConsumedBeforeRun": 0,
  "savedAnswerRejudgeReserve": 0,
  "savedAnswerRejudgesConsumedBeforeRun": 0
}
```

The successful-run projections of both consumed counts are 0, 6, 12, and 18.
After each invocation, set the next file's consumed counts from the actual started calls.
Use the result's budget ledger, or the quarantine `spend` block after a quarantine.
A failed early run can start fewer than six calls. Do not use the planned count instead.

`$B/caps/replacement.json` uses `"runAllocation": "infra-retry"` and the same caps.
Set both consumed counts from all four earlier artifacts, including the failed one.
Its `infraRetryConsumedBeforeRun` is 0.
The harness checks every cap file before its first model call and refuses before spend on a bad file.

## One replacement authorization

Use the replacement only for an incomplete method run caused by an HTTP, SSE, or provider transport error.
The failed artifact must keep complete cost accounting.
These failures do not qualify: missing cost, excess cost, generation quarantine, source-pin change, a failed probe, or answer quality.
The coordinator records the transport evidence before using the reserve.

Run the replacement after the four planned runs, while the window stays open.
Repeat all six cases on the failed arm with unchanged pins and settings.
Keep the failed artifact and the replacement separate. Never combine their rows.
The replacement fills only the failed run's analysis slot.
A second failed run ends collection, even with reserve left.
No paid re-judge is authorized.

## Source-probe stop rule

Run `node eval/qa/probe-remote-identities.mjs --sha256` before each of the four method runs and after the last one.
Also run it before and after a replacement.
Record each printed value and its UTC time.
A failed probe blocks the next paid invocation. It does not authorize a paid retry.
A changed value marks each verdict difference across that boundary as possible source drift.
A matching value does not prove that every page stayed the same.
Readers still inspect conflicting returned evidence.

## Saving `demo-step` events

The Worker writes `demo-chat-start`, `demo-step`, and `demo-chat` events to the server output.
Start each server with `tee` to a log outside the repository: `$B/server/<slot>.log`.
The worktree stays clean, as `dev:eval` requires.

`.agents/rounds/2026-10-10-weekend/ai-upgrade/demo-steps.mjs` reads one log.
It groups events into turns in log order.
For each turn, it reports the attempted models, step count, finish reason, search and execute counts, and final-step facts.
It exits 1 on a tool call in step 7 or an unfinished turn.
It lists each step-usage sum that differs from the turn total under `usageMismatches`.
With `--strict-usage`, a usage mismatch also exits 1. Use that flag for the receipt probes only.
`DEMO_CAPS.maxSteps` is 7, so step 7 is the tools-disabled final step.

Map log turns to result rows by order.
In `base-a`, turn 1 is the BASE probe; turns 2–7 are baseline 1 in corpus order.
In `candidate`, turn 1 is the CANDIDATE probe; turns 2–7 are candidate 1; turns 8–13 are candidate 2.
In `base-b`, turns 1–6 are baseline 2.
Check each mapping: the turn's `searchCalls` and `executeCalls` must equal the row's transcript counts.
A mismatch stops the analysis of that run until the coordinator reconciles it.

Report `finalStepCoverage` for each arm.
If no turn reaches step 7, report the final-step rule as unexercised.
Do not infer final-step behavior from aggregate tool counts.

## Commands

Run these by hand, in this order. Do not run the block as one script.
The coordinator fills each `<…>` value from recorded receipts.

```sh
# 0. Variables. $B must be outside the repository and must not be the paired-launch directory.
B=/private/tmp/raven-ai-upgrade
BASE=0dc353b992b8c0688c051909b5b07b8e14956134
CANDIDATE=<frozen w1010/s head, full SHA>
BASE_WT=<detached BASE worktree path>
CAND_WT=<CANDIDATE worktree path>
HELPER="$CAND_WT/.agents/rounds/2026-10-10-weekend/ai-upgrade/demo-steps.mjs"
IDS=q-anchor-list-builders-discovery,q-asset-stablecoin-issuers-discovery,q-protocol-base-reserve-min-balance,q-scf-build-award-cap,q-sep-45-contract-auth,q-soroban-storage-types
export DEMO_MODEL_OVERRIDE=openai/gpt-5.6-terra DEMO_OPENAI_API_MODE=responses DEMO_REASONING_EFFORT_OVERRIDE=none
PIN="$CAND_WT/.agents/rounds/2026-10-10-weekend/ai-upgrade/judge-pin.mjs"
SDK='console.log(require("./node_modules/ai/package.json").version, require("./node_modules/@ai-sdk/openai/package.json").version)'
mkdir -p "$B/caps" "$B/results" "$B/server" "$B/bin"
# Write the seven cap files from the "Budget and caps" section.

# Judge executable pin, in the collection shell. Use this shell for every later step.
export DISABLE_AUTOUPDATER=1
ln -s "$(realpath "$(/usr/bin/which claude)")" "$B/bin/claude"   # link to the versioned file
export PATH="$B/bin:$PATH"
node "$PIN" "$B/bin" > "$B/judge-pin.json"     # record JUDGE_SHA256 from its sha256 field
JUDGE_SHA256=<sha256 from $B/judge-pin.json>

# 1. Freeze checks, from $CAND_WT.
git diff --stat "$BASE" "$CANDIDATE"
git diff "$BASE" "$CANDIDATE" -- src/

# 2. Prepare BASE. Copy .dev.vars without printing or reading it.
git worktree add --detach "$BASE_WT" "$BASE"
# in $BASE_WT: npm ci, copy .dev.vars, npm run typegen, then:
git -C "$BASE_WT" status --porcelain     # must print nothing
git -C "$CAND_WT" status --porcelain     # must print nothing

# 3. Free gates on each arm, from that arm's worktree.
npm run test:smoke
npm run eval:playground -- --print-generation   # record BASE_GENERATION or CANDIDATE_GENERATION
npm run eval:playground -- --dry-run --ids "$IDS"
npm run eval:playground -- --dry-run --ids q-soroban-storage-types --no-judge
node -e "$SDK"                                  # BASE: 7.0.79 4.0.47; CANDIDATE: 7.0.137 4.0.91

# 4. Launch checkpoints.
test ! -e /private/tmp/stellar-raven-paired-launch && echo "paired-launch directory absent"
pgrep -fl wrangler; pgrep -fl workerd           # both must print nothing
cf ai-gateway gateways get stellar-raven-demo   # read the spend limit privately; do not save it in the repo
# Read today's Gateway spend in the dashboard. Confirm headroom for $27 plus public traffic.

# 5. Server base-a, from $BASE_WT, in the assigned pane.
node -e "$SDK"                                  # must print 7.0.79 4.0.47
npm run dev:eval -- --var DEMO_MODEL_OVERRIDE:openai/gpt-5.6-terra \
  --var DEMO_OPENAI_API_MODE:responses --var DEMO_REASONING_EFFORT_OVERRIDE:none 2>&1 | tee "$B/server/base-a.log"
# Check "eval server revision $BASE". Set URL to the bound loopback origin.

# 6. BASE receipt probe, from $BASE_WT.
node scripts/run-playground-semantic-eval.mjs --confirm-paid --max-budget-usd 1 --url "$URL" --server-generation "$BASE_GENERATION" --round-cap-context "$B/caps/receipt-base.json" --ids q-soroban-storage-types --no-judge --out-dir "$B/results/receipt-base"
node "$HELPER" "$B/server/base-a.log" --strict-usage   # turn 1; apply the receipt gate

# 7. Baseline 1, from $BASE_WT.
node eval/qa/probe-remote-identities.mjs --sha256
node "$PIN" "$B/bin" "$JUDGE_SHA256"
node scripts/run-playground-semantic-eval.mjs --confirm-paid --max-budget-usd 5 --url "$URL" --server-generation "$BASE_GENERATION" --round-cap-context "$B/caps/baseline-1.json" --ids "$IDS" --judge-model claude-sonnet-5 --out-dir "$B/results/baseline-1"
node "$HELPER" "$B/server/base-a.log"           # turns 2-7
# Stop the base-a server. Update candidate-1.json from actual counts.

# 8. Server candidate, from $CAND_WT. First `node -e "$SDK"` must print 7.0.137 4.0.91.
# Then the same dev:eval command, with tee to "$B/server/candidate.log".
# Check "eval server revision $CANDIDATE". Set URL again.

# 9. CANDIDATE receipt probe, from $CAND_WT.
node scripts/run-playground-semantic-eval.mjs --confirm-paid --max-budget-usd 1 --url "$URL" --server-generation "$CANDIDATE_GENERATION" --round-cap-context "$B/caps/receipt-candidate.json" --ids q-soroban-storage-types --no-judge --out-dir "$B/results/receipt-candidate"
node "$HELPER" "$B/server/candidate.log" --strict-usage   # turn 1; apply the receipt gate

# 10. Candidate 1 and candidate 2, from $CAND_WT. Update candidate-2.json between them.
node eval/qa/probe-remote-identities.mjs --sha256
node "$PIN" "$B/bin" "$JUDGE_SHA256"
node scripts/run-playground-semantic-eval.mjs --confirm-paid --max-budget-usd 5 --url "$URL" --server-generation "$CANDIDATE_GENERATION" --round-cap-context "$B/caps/candidate-1.json" --ids "$IDS" --judge-model claude-sonnet-5 --out-dir "$B/results/candidate-1"
node "$HELPER" "$B/server/candidate.log"        # turns 2-7
node eval/qa/probe-remote-identities.mjs --sha256
node "$PIN" "$B/bin" "$JUDGE_SHA256"
node scripts/run-playground-semantic-eval.mjs --confirm-paid --max-budget-usd 5 --url "$URL" --server-generation "$CANDIDATE_GENERATION" --round-cap-context "$B/caps/candidate-2.json" --ids "$IDS" --judge-model claude-sonnet-5 --out-dir "$B/results/candidate-2"
node "$HELPER" "$B/server/candidate.log"        # turns 8-13
# Stop the candidate server. Update baseline-2.json from actual counts.

# 11. Server base-b, from $BASE_WT. First `node -e "$SDK"` must print 7.0.79 4.0.47.
# Then dev:eval with tee to "$B/server/base-b.log". Check the revision line. Set URL.
node eval/qa/probe-remote-identities.mjs --sha256
node "$PIN" "$B/bin" "$JUDGE_SHA256"
node scripts/run-playground-semantic-eval.mjs --confirm-paid --max-budget-usd 5 --url "$URL" --server-generation "$BASE_GENERATION" --round-cap-context "$B/caps/baseline-2.json" --ids "$IDS" --judge-model claude-sonnet-5 --out-dir "$B/results/baseline-2"
node "$HELPER" "$B/server/base-b.log"           # turns 1-6
node eval/qa/probe-remote-identities.mjs --sha256

# 12. Conditional replacement only. Load the failed arm after its SDK receipt.
# Probe sources before and after. Run the judge pin check first.
node "$PIN" "$B/bin" "$JUDGE_SHA256"
node scripts/run-playground-semantic-eval.mjs --confirm-paid --max-budget-usd 5 --url "$URL" --server-generation "$REPLACEMENT_GENERATION" --round-cap-context "$B/caps/replacement.json" --ids "$IDS" --judge-model claude-sonnet-5 --out-dir "$B/results/replacement"

# 13. Stop the last server. Then regrade each accepted result without model calls.
npm run eval:plan -- "$RESULT_FILE"
```

Record every command, cap, actual cost, missing-cost count, judge executable identity, and result stamp.
Keep failed artifacts, quarantines, and incomplete IDs. Never shrink the denominator.
Results, caps, and server logs stay outside tracked paths.
The round ledger records their hashes, costs, and readings.

## Method completeness

Apply these rules to all four method runs. A run that fails one is incomplete:

- exit 0, `budget.status === "complete"`, and no `nonPromotable` flag;
- exactly the six frozen IDs, with no incomplete or unattempted ID;
- `finishReason === "stop"` and a non-empty final answer in every row;
- no HTTP or SSE error, no `clientError`, and no unfinished tool call;
- exactly one valid `eval-cost` frame for each row;
- `demo-steps.mjs` exit 0 for the run's turns, without `--strict-usage`.

A step-usage mismatch in a method run does not make the run incomplete.
A reviewer reconciles each entry in `usageMismatches` before the merge.
The reviewer records the cause, for example an errored step without usage.

An incomplete CANDIDATE run caused by a tool-loop defect blocks the merge.
Tool-loop defects are a tool-choice error, a tool call on step 7, and a turn that ends without an answer after a tool error.
An invalid-input tool error that the model recovers from is not a defect by itself.
Count those errors as a strictness diagnostic.
An incomplete run caused by transport may use the replacement.

## Reading rules

Use the routing class of the authority plan.
For each row, take the first `mcp__playground__execute` transcript entry that is not an error.
Extract service families from its `code` with `/\b(lumenloop|scout|stellarDocs)\.(\w+)\s*\(/g`.

- Class E: every family is an expected family.
- Class T: an expected family and another family.
- Class O: no expected family.
- Class N: no successful execute entry with a service call.

E and T pass. O and N fail. Two readers classify each row on their own and then reconcile.

A **routing regression** has both CANDIDATE repetitions failing and both BASE repetitions passing.
The protocol controls must pass in both CANDIDATE repetitions.
Mixed outcomes stay unresolved until the readers reconcile their cause.

A **verified answer regression** has a worse verdict in both CANDIDATE repetitions than in both BASE repetitions.
The order is Correct, Partial, Wrong. An error is an incomplete method, not a grade.
A reviewer other than the author traces each difference to answer content, source drift, or judge variance.
That reviewer records the evidence.
Unresolved differences block the merge or need a reviewed plan amendment.

Review every answer against its golden and its executed evidence, including correct verdicts.
A judge verdict alone does not establish a regression.
Known findings: `sd-046` covers a missing sponsorship or pool-share reserve fact in `q-protocol-base-reserve-min-balance`.
It is not a regression when both arms show it.
The historical disputed `correct` verdict for `q-anchor-list-builders-discovery` needs careful evidence review.

Strictness diagnostics (report them; they do not decide the verdict alone):

- For each arm, count the `search` calls that set `kind`, `service`, `limit`, `recoverFrom`, or `reason`.
- Count `search` inputs with a `null` value and tool-error entries for invalid input.
  A `null` value or a "received null" error in BASE shows that the server normalized `search` to strict mode.
- Count tool-error entries of any kind and compare the loop shapes: `search` and `execute` counts and steps.
- Report the CANDIDATE `{"error": …}` tool outputs, if any, beside the BASE text errors.
- More invalid-input errors in both CANDIDATE repetitions than in both BASE repetitions need a reviewer's reconciliation before the merge.

A model-variance difference in one case is not an SDK regression without more evidence.
Two repetitions show instability. They do not establish statistical significance.

## Release conditions

The merge needs all of these:

- an accepted independent review of this plan and of the CANDIDATE diff;
- an unchanged judge pin and matching SDK receipts for every server start;
- two passing receipt probes;
- four complete analysis slots with intact pins and complete costs; one replacement can fill one slot;
- no routing regression in any case and no verified answer regression;
- protocol controls that pass in both CANDIDATE repetitions;
- no tool-loop defect in a CANDIDATE row;
- reconciled source drift, judge differences, and upstream findings;
- a merge outside the owner's paired collection window.

The claim stays narrow: a primary-model, six-case Playground screen on complete tool descriptions.
It does not cover the fallback model, clipped clients, failure paths, or the MCP headline.
It does not prove that SDK behavior is unchanged.
