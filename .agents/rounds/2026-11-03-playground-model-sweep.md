# Playground model sweep — 2026-11-03

## Scope

Choose the Playground primary and fallback models from a broad cross-vendor candidate set.
Accuracy and reliability decide. Cost and speed are recorded and break ties only between models
that are equivalent on accuracy and reliability. The brief is `tmp/sweep/BRIEF.md` in the author
worktree (gitignored); the coordinator is Herdr terminal t16 (Claude Opus 5.5). The pre-spend plan
review required by `run-evals` is the brief itself: the coordinator authored the rules below, and
the author lane (Claude Fable 5.1, t1cy) did not change them.

Out of scope: the MCP QA battery contract, the judge rubric, and any upstream finding filing
beyond what the hand review surfaces.

## Lanes

| lane | agent (model, effort) | pane | write set | status |
|---|---|---|---|---|
| author | Claude Fable 5.1, high | t1cy (`/private/tmp/rv-models`, branch `eval/playground-model-sweep-1103`) | `src/demo`, `test`, `package*.json`, `research/audits`, `research/gauntlets`, `.agents` | running |
| coordinator | Claude Opus 5.5 | t16 | review, merge, deploy | waiting |

## Pre-registered rules (written before stage 1 spend; not changed after results)

Candidates. Effort `none` where the model supports it; otherwise the lowest supported effort.
Record the effort used per model. Anthropic 5.x uses adaptive thinking with the mapped effort.

| Family | Candidates |
|---|---|
| OpenAI | `openai/gpt-5.6-terra` (shipped primary, baseline), `openai/gpt-5.6-luna` (shipped fallback), `openai/gpt-5.6-sol`, `openai/gpt-6-luna`, `openai/gpt-6-sol`, `openai/gpt-6.1-terra`, `openai/gpt-6.1-sol`, `openai/gpt-6-astra` |
| Anthropic | `anthropic/claude-haiku-5.5`, `anthropic/claude-sonnet-5.5`, `anthropic/claude-sonnet-5`, `anthropic/claude-opus-5.5` (accuracy ceiling) |
| Meta Muse | `meta/muse-spark-1.3`, `meta/muse-spark-open` |
| Particle | `particle/particle-1` |
| Kimi | `moonshotai/kimi-k3`, `@cf/moonshotai/kimi-k2.7-code` |
| GLM | `@cf/zai-org/glm-5.3`, `@cf/zai-org/glm-5.3-flash` |
| Other | `google/gemini-3.8-flash`, `xai/grok-4.7`, `deepseek/deepseek-v4-pro` |

A model that cannot be reached after one honest transport fix is recorded as "not reachable"
with the exact error. No more than 30 minutes on one vendor's transport.

**Stage 1 — gauntlet (reliability screen).** `scripts/run-demo-model-gauntlet.mjs`, all
candidates, 2 repeats. Advance a model only with no transport or tool-loop failure other than a
failure the baseline also has on the same prompt.

**Stage 2 — screen.** `npm run eval:playground`, the same 30 cases for every advancing model
(seed `2026-11-03-gpt6-paired`), one run each. Rerun the baseline on the upgraded SDK in this
stage. Advance the baseline, the shipped fallback, and the top 5 other models by
(correct + 0.5 × partial), excluding any model with more wrong answers than baseline + 2 or more
than 1 tool failure. Hand-review every verdict that differs from the baseline.

**Stage 3 — finals.** 100 stratified cases disjoint from the stage-2 cases, 2 repeats per
finalist. The noise band is the baseline's own repeat-to-repeat disagreement. Hand-review every
row where a finalist and the baseline differ by more than one grade step, and every wrong verdict
of the top 2.

**Judge.** The default judge is `claude-sonnet-5`. If `eval/qa/judge.mjs` supports a
non-Anthropic judge, re-judge the stage-3 rows of the top 3 with it and report agreement. If it
does not, record the limitation and rely on the hand review. Any judge change is an explicit,
recorded override per `run-evals`.

**Decision rule.**
- Rank by wrong rate (lower first), then correct rate, then reliability (tool failures, transport
  errors, provider refusals, timeouts per 100 turns). A difference inside the noise band is a tie.
- Switch the primary only if the candidate is better than the baseline by more than the noise
  band on wrong rate or correct rate, and not worse on reliability. Among tied models, prefer
  lower p90 latency, then lower observed cost.
- Fallback: the most reliable finalist from a different vendor than the primary. Test
  `q-n3-cross-thread-memory-exfiltration` explicitly for each finalist (one extra turn each).

**Spend.** Hard caps per invocation through `--max-budget-usd`. Stage caps: stage 1 USD 20,
stage 2 USD 70, stage 3 USD 160. Round cap USD 250. Stop and report to t16 before any spend
that would pass a stage cap. Measure spend independently from the AI Gateway logs through the
Cloudflare API per stage and reconcile it with the harness ledger. The gauntlet has no cost
accounting; use the gateway logs for it.

## Ledger

Append-only while the round runs.

- 2026-11-03 — Read `AGENTS.md`, `run-evals`, `eval/playground/README.md`, the previous
  re-check record, `src/demo/model-config.ts`, `src/demo/chat.ts`, and the gauntlet script.
- 2026-11-03 — `GET /accounts/{id}/ai-gateway/gateways/stellar-raven-demo` (Cloudflare API MCP):
  `spend_limits.rules[0] = { id: "70415088", limitType: "cost", limit: 100, window: 86400,
  technique: "sliding" }`; `rate_limiting_limit: 50` per `60` s fixed; `zdr: true`;
  `collect_logs: false`. The round cap (USD 250) cannot fit in one 24 h window. Reported to t16
  with `hc send` before stage 1.
- 2026-11-03 — `lsof -nP -iTCP:8787 -sTCP:LISTEN`: nothing listening. No Wrangler process was
  running when the lane started.
- 2026-11-03 — SDK upgrade applied: `ai@7.0.162`, `@ai-sdk/openai@4.0.108`,
  `@ai-sdk/anthropic@4.0.96`, `@ai-sdk/google@4.0.111` (shared `@ai-sdk/provider@4.0.35`).
  `npm install` changed only `package.json` and `package-lock.json`.
- 2026-11-03 — `@ai-sdk/openai@4.0.108` capability table: `gpt-6.1-terra`, `gpt-6-luna`, and
  `gpt-6-sol` are `configurableNonReasoning` (efforts `none`..`max`); `gpt-6-astra`,
  `gpt-6.1-sol`, and every `gpt-5.6-*` entry are `{}` (default capabilities).
- 2026-11-03 — Anthropic effort reference (platform.claude.com, fetched 2026-11-03): Haiku 5.5
  supports all five effort levels (`medium` default) and adaptive thinking; `thinking: disabled`
  is allowed only at `high` or below. The Cloudflare catalog page for
  `anthropic/claude-haiku-5.5` shows `output_config: { effort }` with `thinking: { type: "adaptive" }`.
  Defect 1 fix: `DEMO_ANTHROPIC_5X_MODEL = /^anthropic\/claude-(?:fable|opus|sonnet|haiku)-5(?:$|[.-])/`.
- 2026-11-03 — `workers-ai-provider@4.0.0` slug registry (from `dist/gateway-provider-*.mjs`):
  anthropic, aws-bedrock, azure-openai, cartesia, cerebras, cohere, deepseek, elevenlabs,
  fireworks, google, google-ai-studio, google-vertex-ai, grok, groq, huggingface, mistral, openai,
  openrouter, perplexity, replicate, workers-ai, xai. Absent: `meta`, `particle`, `moonshotai`.

- 2026-11-03 — Coordinator override received (`tmp/sweep/JUDGE.md`): Cloudflare runs only the
  candidate answer turns. Judging runs locally on the owner's subscriptions: Judge A
  `claude -p --model claude-sonnet-5` (contract), Judge B Codex `gpt-6.1-sol` at high
  (out-of-family, recorded override). Judge B runs on every stage-3 row of all finalists and on
  stage-2 rows of models within one rank of the cutoff. Judge cost is notional and does not count
  toward the gateway window. Gateway window rule: keep every sliding 24 h total <= USD 85; read the
  window before each paid invocation; split stage 3 across windows by finalist and repeat, with each
  model's two repeats in one server generation.
- 2026-11-03 — Window read (`tmp/sweep` script over `cf ai-gateway logs list`, 24 h to
  2026-11-03T20:36Z): 1684 rows, USD 44.48. `xai/grok-4.7` USD 38.76 (1065 calls, an earlier
  offline lane, 2026-11-02T23:05Z to 2026-11-03T08:17Z, leaves the window at
  2026-11-04T08:17Z); `gpt-5.6-terra` 4.59; `gpt-6.1-terra` 0.86; `gpt-6-luna` 0.19 (t1cp's
  paired run); `gpt-5.6-luna` 0.08. Headroom under 85: about USD 40 until the Grok rows age out.
- 2026-11-03 — Gauntlet gained `--max-budget-usd`: each turn carries
  `x-raven-eval-max-budget-usd`, so the route settles every provider call against the Gateway
  log, reports the turn cost and the Gateway-logged model, and the artifact carries both. Side
  effect, recorded: accounting turns run with SDK retries off and one Gateway attempt per call,
  so the screen is stricter than production. Unit tests added in `test/demo-gauntlet-cli.test.ts`.
- 2026-11-03 — Defect 3 offline probe (`tmp/sweep/dispatch-probe.mjs`, fake binding, no
  network): `meta/*` and `particle/*` throw `Unknown gateway provider` on the plugin path;
  `deepseek/` resolves to passthrough `gateway.run` (provider `deepseek`, endpoint `responses`);
  `google/` takes the run path with the Gemini wire. Fix: `DEMO_UNIFIED_RUN_PREFIXES` adds
  `meta/` and `particle/`; the Kimi temperature quirk is narrowed to `moonshotai/`; registry-unknown
  vendors take the `@cf/*` catalog settings shape (headers plus mapped `reasoning_effort`).
- 2026-11-03 — Stage-1 transport probe, run id `2026-11-03-sweep-probe` (`rpc-simulate`, one
  repeat, 23 models, `--max-budget-usd 4`). Gateway-logged model equals the configured id for
  every vendor that answered (defect 4: exact comparison verified for openai, anthropic, meta,
  particle, moonshotai, @cf). Findings:
  - `openai/gpt-6.1-sol` and `openai/gpt-6-astra`: HTTP 400 `Unsupported value: 'none' is not
    supported with the '<model>' model. Supported values are: 'low', 'medium', 'high', 'xhigh',
    and 'max'.` The SDK passes `none` through for these ids. Lowest supported effort is `low`;
    both run at `low` from here on.
  - `meta/muse-spark-1.3`: HTTP 400 `7003: User Input Error` on the run path. Direct probes with
    `cf ai run meta/muse-spark-1.3 --body …` return the same error for the chat body and for the
    catalog page's own example body (`messages` + `max_completion_tokens`), while the same chat
    body answers for `particle/particle-1` and `meta/muse-spark-open`. Recorded as **not
    reachable** after one honest transport fix (run-path routing); exact error: `[7003] Model
    execution failed (User Input Error): Invalid value at input: Invalid input`.
  - `anthropic/claude-sonnet-5.5` and `anthropic/claude-opus-5.5` answered with `execute` only
    (no `search`), so the gauntlet's `expectedTools` check fails while transport, terminal, and
    every tool result are clean.
  - `meta/muse-spark-open`: one `execute` failed on a model-authored script error
    (`catalog.map is not a function`); terminal clean.
- 2026-11-03 — Stage-1 gate reading, fixed before the full run: a "transport or tool-loop
  failure" is a failing `http`, `terminal`, `finalAnswer`, `latency`, or `noToolFailures` check.
  `expectedTools` and `noMarketNumber` are behavior notes, reported per model, not gate
  failures. A model-authored script error that returns `ok: false` from `execute` is a tool-loop
  failure. The baseline exception applies per prompt id.
- 2026-11-03 — Stage-3 case set pre-selected before any stage-2 spend:
  `tmp/sweep/select-cases.mjs` reproduces the harness sampler (verified: `--sample 30 --seed
  2026-11-03-gpt6-paired` returns the harness's 30 ids exactly), then selects 100 cases with seed
  `2026-11-03-sweep-finals` from the battery minus those 30. Overlap 0. Strata: stellarDocs 48,
  scout 28, lumenloop 13, skills 7, none 4. The original note pointed to the audit record, but that file does not contain the ID list. The referenced selection was in ignored `tmp/sweep/stage3-selection.json`; its availability must be verified before resuming.
- 2026-11-03 — Generation rule for stage 2 and 3: the harness hashes HEAD, status, the tracked
  diff, and every untracked non-ignored file. Code is committed before a run, and nothing outside
  gitignored paths (`tmp/`, `eval/local-lanes/`, `research/gauntlets/*.json`) changes while a
  semantic run is in flight. Shards of one model run concurrently against one Wrangler process
  (one subject cookie per shard, each under the 30-chat cap); concurrency is recorded with the
  latency numbers.
- 2026-11-03 — Probe follow-up for the last three vendors (run id `2026-11-03-sweep-probe`,
  rows 20–23) and the one honest transport fix each was allowed:
  - `google/gemini-3.8-flash`: run path (`google-vertex-ai`, `/run`) answered the first call
    (HTTP 200) and rejected the tool-result replay with HTTP 400 `7003 Model execution failed
    (User Input Error)` (gateway log `01a1a32e-db96-72e6-9897-ef8bcd3d13d9`). Fix probed in
    `2026-11-03-sweep-probe-gemini-passthrough`: google/* on the default passthrough branch
    (`google-ai-studio`, `streamGenerateContent`) completes the whole tool loop under Unified
    Billing (pass, 3 tool calls, USD 0.0412, logged model equals configured id). Change kept in
    `demoGatewayTransportSettings` with the comment and test updated; the prior "Gemini is not
    on passthrough Unified Billing" note was stale.
  - `deepseek/deepseek-v4-pro`: passthrough (`deepseek`, `chat/completions`) HTTP 401, provider
    body `Authentication Fails (governor)` — DeepSeek is not a Unified Billing provider, so the
    keyless passthrough reaches api.deepseek.com with no credential. Fix attempted: the catalog
    run path. `cf ai run deepseek/deepseek-v4-pro` with the catalog page's own example body
    returned HTTP 500 `[2002] Model execution failed (Error)` on three attempts while the same
    body answered for `particle/particle-1`. Recorded as **not reachable**; exact errors above.
  - `@cf/zai-org/glm-5.3-flash`: transport clean (four HTTP 200 calls, one 81.8 s), but the turn
    hit the 120 s abort (`The turn was aborted before finishing.`, one tool failure from the
    abort). This is a latency and tool-loop failure under the stage-1 gate; the full two-repeat
    run decides.
- 2026-11-03T21:00Z — Window read before stage 1: USD 45.87 over the last 24 h (1762 rows).
  Headroom under 85: about USD 39. Probe spend so far USD 1.44 (gateway-logged). Stage 1 full
  run authorized at `--max-budget-usd 18.5` so stage-1 spend stays under the USD 20 stage cap.
  Model order puts the cheapest vendors first so a cap stop would drop the most expensive rows.
- 2026-11-03 — Coordinator asked whether the Muse Spark 1.3 failure is the known "AI Gateway
  Muse routes end streams without a finish signal" behavior. Checked against the probe rows:
  it is not. `meta/muse-spark-1.3` fails before any stream opens: the route returns the error
  frame at 1.0 s with zero token chars and no tool call (`Answer provider returned HTTP 400.
  7003: User Input Error`), and the non-streaming `cf ai run` with the catalog's own example body
  returns the same `7003` rejection. A missing finish signal would show tokens followed by an
  abort, not a request rejection. `meta/muse-spark-open` in the same probe streamed 3632 token
  chars and ended with a `done` frame, `reason: "stop"`, so its stream did carry a finish
  signal on this turn. The note stays attached to muse-spark-open for stages 2 and 3: every row
  of it is checked for a `done` frame, and a stream that ends without one is recorded as a
  transport failure with the exact frame tail.
- 2026-11-03T23:40Z — Stage 1 complete: run ids `2026-11-03-sweep-stage1` (19 models at the
  demo default `none`, cap USD 15.31) and `2026-11-03-sweep-stage1-low` (`gpt-6.1-sol`,
  `gpt-6-astra` at `low`, cap USD 3). Harness-reported USD 15.33 + 3.08 with 10 aborted turns of
  unknown cost; gateway-logged spend for the same interval USD 19.23. With the probes (1.39 +
  0.04) the stage-1 gateway total is USD 20.67, at the USD 20 stage cap. The cap stopped
  `xai/grok-4.7` after 6 turns and `gpt-6-astra` after 7 (their `answer-cost-exceeds-authorization`
  rows are harness stops, not model failures, and are excluded from the gate). Reported to t16
  before any further spend; the TRANSPORT-FINDINGS rerun waits for that answer.
- 2026-11-03 — Stage-1 gate applied as pre-registered (`tmp/sweep/gate1.mjs`; table in the audit
  record). Baseline `gpt-5.6-terra` fails `activity-leaderboard` (both repeats) and `zk-repos`
  (repeat 2), all model-authored execute script errors. Every tool failure in the stage is a
  model-authored script error or a malformed tool-call argument (`AI_InvalidToolInputError`), not
  an upstream service error, with one exception: `particle/particle-1` `soroswap-builder` repeat 2
  ended with HTTP 500 `2002: Credential loading failed` from the run path at about
  2026-11-03T21:5xZ (recorded for status-page matching). Advance: `gpt-5.6-terra`,
  `gpt-5.6-luna`, `gpt-5.6-sol`, `gpt-6.1-terra`, `gpt-6.1-sol` (low), `claude-haiku-5.5`,
  `claude-sonnet-5`, `claude-sonnet-5.5`, `claude-opus-5.5`, `xai/grok-4.6`. Excluded:
  `gemini-3.8-flash` (one new script error), `gpt-6-luna` (one), `kimi-k2.7-code` (two, same
  prompt), `gpt-6-sol` (six: returns a Promise from the script, `#<Promise> could not be cloned`),
  `kimi-k3`, `particle-1`, `muse-spark-open`, `glm-5.3`, `glm-5.3-flash` (timeouts and aborts).
  Incomplete: `grok-4.7`, `gpt-6-astra`. Behavior notes: `claude-sonnet-5.5` (6 turns) and
  `claude-opus-5.5` (4 turns) skipped `search`; `particle-1` once named a market number.
- 2026-11-03 — Window after stage 1: USD 64.91 over 24 h (hourly peaks 23Z 10.76, 05Z 6.83,
  04Z 6.71, 07Z 6.70, 06Z 6.60). Headroom under 85: about USD 20 until the earlier Grok lane
  ages out between 2026-11-03T23:05Z and 2026-11-04T08:17Z.
- 2026-11-03 — TRANSPORT-FINDINGS applied in code (no spend yet): `DEMO_UNIFIED_RUN_REQUEST_FORMAT`
  adds `openaiEndpoint: "/v1/chat/completions"` to the settings of every unified-run model
  (`moonshotai/`, `meta/`, `particle/`). It reaches `binding.run`'s options through
  workers-ai-provider's settings passthrough, so the accounting proxy sees the same call; chosen
  over wrapping the binding because it is one data constant with a unit test and no new
  indirection. Root cause recorded from the coordinator: the Muse Spark 1.3 catalog schema is
  Responses-only (`input` required) while the page's usage example shows `messages`; `/run`
  validates the plain-binding body against the native schema unless `openaiEndpoint` names the
  format (`agents@0.33.0` `createAI` sends it; `workers-ai-provider@4.0.0` never does). REST
  proof log ids `01a1a36f-6e7d-73a6-b9a8-c293d9296e5c`, `01a1a371-9546-75b7-a360-9503c06ed6b8`
  (chat body, HTTP 200, tool call; 129.6 s cold, 5.3 s warm). Provenance caveat: that response
  body names the model `muse-spark-1.3` without the `meta/` prefix; the gauntlet's logged-model
  column decides. DeepSeek: the Fireworks catalog route (`deepseek/deepseek-v4-pro`,
  `deepseek-v4-flash`) returns HTTP 500 `2002` on both gateways (log id
  `01a1a36f-6e6c-7779-a96b-0b1c37429da4`), a Cloudflare-side outage, so it stays not reachable;
  the Cloudflare-hosted `@cf/deepseek-ai/deepseek-v4-pro-0813` and
  `@cf/deepseek-ai/deepseek-v4.1-flash-1017` join the candidate list on the existing `@cf/*` path
  (status incident `alzmexlqangd`, 2026-10-15, resolved). Effort for the pair: the catalog
  accepts `none`, but the demo omits the key at `none` (catalog default `high`), so they run at
  `low`, the lowest effort the catalog path can send; recorded as a follow-up.
- 2026-11-03T23:5xZ — Coordinator (t16) raised the stage-1 cap from USD 20 to USD 28 (round cap
  stays 250). Reason: the original cap stopped `gpt-6-astra` and `grok-4.7` before their 16
  turns, and the TRANSPORT-FINDINGS rerun adds six models (four unified-run models whose
  transport changed, two Cloudflare-hosted DeepSeek models). Ordered sequence: the six models
  first, then `gpt-6-astra`, then `grok-4.7` last; read the window before each run and stop
  before USD 85. Rerun rows for `kimi-k3`, `particle-1`, `muse-spark-open` supersede their
  earlier rows; both sets stay in the ledger and the audit record.
- 2026-11-04T00:4xZ — Muse Spark 1.3 after the `openaiEndpoint` fix (run
  `2026-11-03-sweep-stage1b-six`): 16/16 turns answered in 4–9 s with zero tool calls and a final
  text of three `[object Object]` tokens. Coordinator asked whether tools reach the request.
  Offline capture (`tmp/sweep/tools-capture.mjs`, fake binding): `binding.run` inputs carry
  `tools` (search, execute with parameters), `tool_choice: "auto"`, `stream: true`, and the
  options carry `openaiEndpoint`, so the request is complete. Live reproduction on
  `/ai/v1/chat/completions` for `meta/muse-spark-1.3` with one function tool: `stream: false`
  returns a `chat.completion` with `finish_reason: tool_calls` and the `search` call;
  `stream: true` returns the serving provider's native Responses SSE (`event: response.created`,
  `response.output_item.added` with `type: reasoning`, `response.content_part.added` with
  `output_text`), which the chat-completions parser cannot read. Transport defect, not a model
  result. The other three unified-run models stream chat-format chunks and were unaffected (0
  object tokens, normal tool traffic). Fix: `demoUnifiedRunBinding` requests `stream: false` for
  third-party catalog slugs on the plain binding; workers-ai-provider's JSON-reply branch
  synthesizes the stream. Applied after the stage-1b chain finished so the running Wrangler did
  not reload mid-turn. Rerun: muse-spark-1.3 only, as instructed; the three other models'
  rows stay unless t16 asks for a rerun.
- 2026-11-04 — Coordinator narrowed the Muse fix: key it on the catalog property, not on every
  third-party slug. `DEMO_RESPONSES_FORMAT_CATALOG_MODELS` lists the catalog ids whose catalog
  page says `Request formats | Responses` (today only `meta/muse-spark-1.3`,
  https://developers.cloudflare.com/ai/models/meta/muse-spark-1.3/, row "Request formats"), and
  `demoUnifiedRunBinding` requests `stream: false` only for those. `muse-spark-open`,
  `particle-1`, and `kimi-k3` keep their live token stream and their stage-1 rows; only
  `muse-spark-1.3` is rerun. Two records for the audit:
  (a) **Cloudflare-side defect to report.** For a catalog model whose request format is
  Responses, a `stream: true` chat-completions request through `/run` with
  `openaiEndpoint: "/v1/chat/completions"` (and through the account's
  `/ai/v1/chat/completions` endpoint) returns the serving provider's native Responses SSE
  (`event: response.created`, `response.in_progress`, `response.output_item.added` with
  `type: reasoning`, `response.content_part.added` with `output_text`) instead of
  chat-completions chunks; `stream: false` converts the reply correctly (`chat.completion`,
  `finish_reason: tool_calls`, the `search` call present). Repro: the two REST calls above with
  one function tool and `max_tokens: 120`, 2026-11-04T00:4xZ. Gateway log ids of streamed
  `/run` calls that returned the unreadable stream: `01a1a3cf-4ad7-7418-bc61-d495dfd92820`,
  `01a1a3cf-6cd6-7263-bc77-7c6e1bc87552`, `01a1a3cf-7bd8-7779-b6e6-0e8678062983` (all HTTP 200,
  3–6 s, about USD 0.01 each).
  (b) **Muse Spark 1.3 latency is measured without streaming.** Its first-meaningful and total
  latency come from one JSON reply per model call, so its first-token numbers are not comparable
  with streamed models; total turn latency is.
- 2026-11-04T01:06Z — Stage-1b chain complete (run ids `2026-11-03-sweep-stage1b-six`,
  `-deepseek`, `-astra2`, `-astra1`, `-grok2`, `-grok1`): harness USD 6.95, gateway USD 7.20;
  stage-1 gateway total USD 27.87 of the raised 28. Window at 01:07Z: USD 67.40. Gate with the
  superseding rows and budget-stop rows excluded: `muse-spark-open` 3 uncovered failures,
  `particle-1` 1, `kimi-k3` 2, `@cf/deepseek-ai/deepseek-v4-pro-0813` 4,
  `@cf/deepseek-ai/deepseek-v4.1-flash-1017` 4 (all model-authored script errors),
  `grok-4.7` 4 (two script errors on `soroswap-builder`, two on `wallet-recovery`): excluded.
  `muse-spark-1.3` rows void (streaming defect), rerun pending authorization.
- 2026-11-04 — `gpt-6-astra` (low): 15 valid turns, one cell (`no-market-hallucination` repeat 1)
  missing, one uncovered failure that is transport: HTTP 404 `Item with id 'rs_…' not found.
  Items are not persisted for Zero Data Retention organizations. Remove this item from your
  input and try again.` The demo gateway is ZDR; the SDK default `store: true` lets a later step
  replay a reasoning item by id, which ZDR never stored. `@ai-sdk/openai` adds
  `include: ["reasoning.encrypted_content"]` only when `providerOptions.openai.store` is false
  (dist line `if (store === false && isReasoningModel) addInclude("reasoning.encrypted_content")`).
  Fix: `demoOpenAiProviderOptions` sends `store: false` for `openai/*` (not for the xAI chat wire).
  It changes the OpenAI wire for every OpenAI model by that flag and the encrypted reasoning
  items; models at effort `none` emit no reasoning items, so their stage-1 rows stand. Proposed
  to t16 with the spend request (muse-spark-1.3 rerun plus astra's missing cell, about USD 2).
- 2026-11-04 — Coordinator decisions (t16): (1) `store: false` for `openai/*` applied with a
  test as the ZDR-correct wire; (2) astra's 404 cell is void, not a gate failure, the same
  treatment as muse-spark-1.3; it is rerun with the missing cell on the new wire and astra is
  gated on 16 cells; (3) `muse-spark-1.3` rerun, 16 turns; (4) no stage-1 rerun for the other
  OpenAI models, stage 2 runs them (baseline included) on the new wire; (5) checked before
  gating: none of the excluded `gpt-6-luna` or `gpt-6-sol` failures is an `rs_` 404 (luna:
  one empty-hit search, one script error; sol: six Promise-clone script errors). Stage-1 cap
  raised to USD 30 for the reruns.
- 2026-11-04T01:24Z — Stage-1c complete (run ids `2026-11-03-sweep-stage1c-muse`, `-astra`):
  gates green (typecheck, 3139 tests, 127 smoke, build, selftest; the OpenAI wire smoke test now
  reviews `store: false` + `include: ["reasoning.encrypted_content"]`). Harness USD 1.23,
  gateway USD 1.23 (muse 1.003, astra 0.229). Stage-1 gateway total USD 29.10 of 30. Window at
  01:24Z: USD 68.10.
  - `meta/muse-spark-1.3` on the JSON-reply fix: 15 of 16 turns before the USD 1.00 cap
    (`wallet-recovery` repeat 2 missing), zero `[object Object]` tokens, normal tool traffic
    (1–3 searches, 1–4 executes per turn), logged model equals the configured id, 23–78 s per
    turn without streaming. One gate failure on `rpc-simulate` repeat 1: `execute call limit
    reached for this turn` (the model used up the per-turn execute allowance), a tool-loop
    failure on a prompt the baseline passed, so **excluded**; the missing cell cannot change that.
  - `openai/gpt-6-astra` (low) on the `store: false` wire: both cells pass (`no-market-hallucination`
    4.7 s, `wallet-recovery` 17.9 s). With the 404 cell and the budget stop void, astra has 16
    clean cells and **advances**. USD 5.56 over its 19 gauntlet turns, the most expensive
    candidate (about USD 0.33 per turn).
  - Stage-1 advancing set (11): `gpt-5.6-terra` (baseline), `gpt-5.6-luna` (shipped fallback),
    `gpt-5.6-sol`, `gpt-6.1-terra`, `gpt-6.1-sol` (low), `gpt-6-astra` (low),
    `claude-haiku-5.5`, `claude-sonnet-5`, `claude-sonnet-5.5`, `claude-opus-5.5`, `xai/grok-4.6`.
- 2026-11-04 — Stage-2 plan (pre-registered rules unchanged): the 11 models above, the 30
  cases of seed `2026-11-03-gpt6-paired`, one run each, three concurrent 10-case shards per
  model against one Wrangler process, Judge A inline. Per-model answer-spend estimates from the
  stage-1 per-turn costs (x30, judge notional): luna 0.15, haiku 0.2, 6.1-terra 1.1, 6.1-sol 1.7,
  terra 1.9, sonnet-5.5 2.3, grok-4.6 2.8, sonnet-5 3.1, 5.6-sol 3.6, opus 5.4, astra 10;
  about USD 32 in all, under the USD 70 stage cap. Order cheapest first; each model's cap is
  1.6x its estimate; the chain reads the window before each model and waits while
  window + cap > 85 (the earlier Grok lane ages out between 23:05Z and 08:17Z).
- 2026-11-04T01:3xZ — Pre-stage-2 checks asked by t16. (a) Item 5 result: none of the excluded
  `gpt-6-luna` or `gpt-6-sol` stage-1 failures is an `rs_` 404 (luna: one empty-hit `search`
  on `zk-repos`, one `Cannot access 'scout' before initialization` script error on
  `soroswap-builder`; sol: six `#<Promise> could not be cloned` script errors). No re-gate
  needed. (b) The `store: false` + JSON-reply code is committed as `59a8a26d` with the ledger,
  audit, and gauntlet summaries; the working tree was clean, and all five gates ran green on
  that commit (typecheck, `npm test` 3139 passed, smoke 127 passed, build, eval:selftest). The
  stage-2 server generation is the tree at the commit that records this entry; each run's
  artifact carries the generation and this ledger names the commit.

- 2026-11-04T06:58Z — Stage 2 complete (run id `2026-11-03-playground-model-sweep-stage2`,
  generation = commit `6b451221`, 33 result files, 11 models x 30 cases, Judge A inline).
  Harness answer spend USD 32.42 (luna 0.158, haiku 0.204, 6.1-terra 1.327, 6.1-sol 1.781,
  terra 1.948, sonnet-5.5 2.039, grok-4.6 4.140, sonnet-5 3.582, 5.6-sol 4.041, opus 4.631,
  astra 8.571) against the USD 70 stage cap. Gateway logs reconcile to the cent per model except
  `gpt-6-astra` (gateway 8.80 vs harness 8.57; the 0.23 difference is the stage-1c astra rerun
  before 01:28Z, so the stage-2 gateway total is USD 32.42). Round answer spend so far: stage 1
  29.10 + stage 2 32.42 = USD 61.52 of 250.
  - Window rule held. Two waits: before `claude-opus-5.5` from 02:45Z (window 83.04 + cap 8.64 >
    85) to 04:51Z (window 75.50), and before `gpt-6-astra` from 06:18Z to 06:49Z (window 67.60,
    cap 16.00). The window never passed 85 (peak 83.04 at 02:45Z, before the opus wait).
  - Reliability: `xai/grok-4.6` hit the route's 120 s turn deadline on 3 of 30 turns
    (`q-eco-nft-marketplace-whitespace`, `q-sor-confidential-tokens`,
    `q-ti-bindings-to-nextjs-integration`; p50 65 s, p90 119 s) — **excluded** (more than one
    tool failure). `anthropic/claude-sonnet-5` had 7 execute failures, all model-authored script
    syntax errors (a stray trailing `}` or an `async () => {}` wrapper) — **excluded**. Baseline
    `gpt-5.6-terra` had 2 execute errors (`q-gap-lumen-exact-document-empty`,
    `q-gap-scout-changelog-envelope`) and one Judge A error (`q-jutsu-cash-crypto-ramps`);
    `haiku-5.5`, `sonnet-5.5`, and `luna` one execute failure each; the other five models none.
  - Hand review (every verdict that differs from the baseline, all 11 models; notes in
    `tmp/sweep/stage2-hand-review.md`, gitignored). Judge A false positives corrected by transcript
    evidence: baseline `q-ti-vocab-project-tags-live` wrong → partial (the `ai` slug is in the live
    tool output; Judge B agrees: partial), `claude-sonnet-5` same case wrong → partial
    (`payments` slug present), `gpt-6.1-sol` and `claude-sonnet-5.5` `q-edge-1xlm-activation-fee`
    wrong → partial (no wrong claim, no avoid hit, one missing item). Root cause for the vocab
    case: the judge evidence pack truncated the 85-row tag list to 82 rows, so the judge could not
    see the slug — a candidate `eval/qa` finding (evidence-pack row cap). Judge rationale error that
    does not change a grade: grok `q-sor-contract-trustlines-c-address` ("Protocol 23 / Whisk" is
    real). Baseline `q-jutsu-cash-crypto-ramps`: Judge A errored; a Judge A re-judge
    (`eval/qa/results/2026-11-04T07-00-43-rejudge.json`) said wrong on an evidence-reading error
    (it read `matchingRampPartners=43` as the ramp count; the field is the partner-directory size,
    and six other models with the same "8 ramp partners, dated" content got partial or correct);
    hand review partial; Judge B partial (`…07-03-45-rejudge.json`). Recorded as partial.
  - Judge B (Codex `gpt-6.1-sol` high, `eval/qa/re-judge.mjs --judge-cli codex`) ran over the
    baseline, the three models within one rank of the cutoff (`haiku-5.5`, `gpt-6-astra`,
    `sonnet-5.5`), and the two disputed rows. The re-judge tool refuses a non-promotable source
    file, so the baseline's shard-2 file (one judge error made `budget.status` incomplete) was
    copied to `tmp/sweep/rejudge-input/terra-shard2-judge-input.json` with only `budget.status`,
    `incompleteCaseIds`, and `nonPromotable` patched and a `meta.rejudgeInputNote`; answers and
    transcripts untouched. Judge B results (rows, A/B agreement, A score vs B score; re-judge files `eval/qa/results/2026-11-04T07-0[1-3]*`, `…07-06-38`, `…07-09-27` to `…07-31-54`, `…07-36-00`, `…07-36-17`): baseline 30 rows, 20 agree, A 17 vs B 17.5; `haiku-5.5` 30, 24 agree, A 17 vs B 15; `gpt-6-astra` 30, 25 agree, A 17 vs B 17.5; `sonnet-5.5` 30, 22 agree, A 16.5 vs B 15.5. Two-step flips: baseline and astra `q-edge-1xlm-activation-fee` correct → wrong, and `gpt-6.1-sol` on the same case wrong → wrong, each with an empty `wrongClaims` and no fired avoid (the rubric reserves wrong for an incorrect core answer, fabrication, or a fired avoid; the golden's verification step is a key fact, not an avoid), and astra `q-soroban-storage-migration` wrong → correct. Judge B agrees with the hand review on `q-ti-vocab-project-tags-live` for the baseline and `claude-sonnet-5` (partial) and on baseline `q-jutsu-cash-crypto-ramps` (partial). The 1xlm case is judge-unstable under both judges; the hand-review partial stands for `gpt-6.1-sol` and `claude-sonnet-5.5`. Judge A remains the stage-2 grade of record (JUDGE.md); under Judge B alone `claude-sonnet-5.5` (15.5) would edge `claude-haiku-5.5` (15) for the last finalist slot, so the cut is judge-sensitive and is flagged to t16 with the option of an eighth finalist (about USD 14 more).
  - Adjusted stage-2 scores (correct + 0.5 x partial, after the hand-review corrections):
    `gpt-6.1-terra` 18.5 (1 wrong), `gpt-6.1-sol` 18.5 (0 wrong), `gpt-5.6-sol` 18.5 (5 wrong),
    `gpt-5.6-terra` 18 (3 wrong), `claude-haiku-5.5` 17 (2 wrong), `gpt-6-astra` 17 (3 wrong),
    `claude-sonnet-5.5` 17 (4 wrong), `claude-opus-5.5` 16.5 (4 wrong), `gpt-5.6-luna` 16
    (5 wrong), `claude-sonnet-5` 16 (6 wrong, excluded), `grok-4.6` 19.5 (excluded).
  - Finalists (baseline + shipped fallback + top 5 by adjusted score, ties broken by fewer wrong):
    `gpt-5.6-terra`, `gpt-5.6-luna`, `gpt-6.1-sol`, `gpt-6.1-terra`, `gpt-5.6-sol`,
    `claude-haiku-5.5`, `gpt-6-astra`. `claude-sonnet-5.5` misses on the tie (4 wrong vs 2 and 3).
  - Stage-3 plan: the 100 ids of `tmp/sweep/stage3-selection.json` (seed
    `2026-11-03-sweep-finals`, disjoint from stage 2) plus `q-n3-cross-thread-memory-exfiltration`
    as an explicit extra case, 2 repeats per finalist, both repeats of a model under one
    generation, four concurrent 25-case shards plus the one-case shard per repeat, Judge A inline,
    Judge B on every row afterwards. Answer-spend estimate from the stage-2 USD per turn x 202
    turns: luna 1.1, haiku 1.4, 6.1-terra 8.9, 6.1-sol 12.0, terra 13.1, 5.6-sol 27.2, astra
    57.7 — about USD 121 against the USD 160 stage cap; round total about USD 183 of 250. Order
    cheapest first; each repeat's cap is 1.6 x its estimate; the chain waits while window + cap >
    85, so astra's two repeats (cap 46 each) need a window at or below 39 and will fall into
    separate 24 h windows.

- 2026-11-04T07:4xZ — Coordinator decision (t16): stage 3 runs **8 finalists**, adding
  `anthropic/claude-sonnet-5.5` to the seven selected by the pre-registered top-5 rule. This is a
  stated deviation from that rule, for two reasons: (1) the cutoff between `claude-haiku-5.5` and
  `claude-sonnet-5.5` depends on the judge (Judge A adjusted 17 vs 17 with fewer wrong for haiku;
  Judge B 15 vs 15.5 for sonnet-5.5); (2) the fallback must come from a different vendor than the
  primary, so a second Anthropic finalist matters. Adding a finalist changes no baseline
  comparison. Stage-3 cap stays at USD 160 and the window rule stays (astra's repeats fall in
  separate 24 h windows); any spend that would pass a cap is reported first. Order cheapest first:
  luna (est 1.1), haiku (1.4), 6.1-terra (8.9), 6.1-sol (12.0), terra (13.1), sonnet-5.5 (13.7),
  5.6-sol (27.2), astra (57.7); about USD 135 in all. Stage-3 generation = the tree at the commit
  that records this entry.

- 2026-11-04T13:1xZ — Stage-3 deviation, owner-approved via t16 (`tmp/sweep/GATEWAY-SWITCH.md`):
  stage-3 answer traffic moves from the `stellar-raven-demo` gateway to the account's `default`
  AI Gateway, written here before the new spend.
  - Reason: the demo gateway carries production Playground traffic under a USD 100/24 h limit.
    Stage 3 waited about 4 h on the window rule (6.1-sol rep1 from 09:30Z, window 77.6–78.0) and
    needed about two more days to finish at that pace.
  - Progress before the switch (demo gateway, generation `cb4f1ca4`): luna, haiku-5.5, and
    6.1-terra, two repeats each, harness answer spend USD 10.9974 (luna 1.011, haiku 1.423,
    6.1-terra 8.563). One luna row (`q-edge-exhaustive-defi-deep-report`, rep 1) ended with
    finishReason `length` (19,669-character answer): an incomplete row by the pre-registered
    definition, judged correct by Judge A.
  - Change: only the gateway id (`--var DEMO_AI_GATEWAY_ID:default` in the gitignored
    `tmp/sweep/stage-run-caps.sh`; `src/demo/eval-cost.ts` reads the same env value, so cost
    accounting follows). Same code, request bodies (`store: false`, `cf-aig-skip-cache`), efforts,
    and cases. The window wait is removed from `tmp/sweep/stage3.sh`; the per-repeat caps, the
    USD 160 stage cap, and the exit-9 stop stay. `default` facts checked by t16: ZDR off,
    collect_logs on, no rate or spend limit, cache_ttl 300, same credit store; 75 probe calls
    (USD 0.85) in the prior 7 days and no production user.
  - Difference: `default` has ZDR off, so provider-side retention can differ. Model behavior is not
    expected to change because the requests are identical. Privacy: the prompts are public eval
    questions, public Stellar data, and the public system prompt; no secret reaches a model; the
    `default` gateway logs bodies.
  - Controls: (1) the stage-3 table uses only `default` rows — luna, haiku-5.5, and 6.1-terra are
    re-run on `default` after the five remaining finalists, so every stage-3 row comes from one
    gateway; (2) the six demo-gateway runs are kept as a ZDR-on reference and reported separately
    as a paired gateway comparison against the `default` re-runs, measured against the noise band;
    (3) before the decision is final, the stage-1 gauntlet runs on `stellar-raven-demo` (the
    production transport) for the chosen primary and fallback, two repeats, with the demo window
    read first and kept at or below USD 85; (4) after the first `default` repeat, the harness
    answer cost is reconciled with the `default` gateway logs and repeat latency and answer length
    are checked for cache replay.
  - Run order on `default`: `gpt-6.1-sol` (low), `claude-sonnet-5.5`, `gpt-5.6-sol`,
    `gpt-5.6-terra`, `gpt-6-astra` (low), then the `gpt-5.6-luna`, `claude-haiku-5.5`, and
    `gpt-6.1-terra` re-runs. Projection: 11.00 spent + about 124 + about 11 = about USD 146 of
    160. The chain restarts with `STAGE3_SPENT_BEFORE=10.9974`; the stage-3 generation for the
    `default` rows is the tree at the commit that records this entry.

## Outcome

2026-11-06 integration disposition: interrupted during stage 3, with no completed final model
selection. The historical observations above remain dated evidence, not a completed promotion gate.
The reusable transport/SDK/judge/accounting changes were recovered for review on current main;
the gauntlet now stops on missing or inconsistent cost and records incomplete matrices explicitly.
The primary remains `openai/gpt-5.6-terra` and fallback remains `openai/gpt-5.6-luna`.
No paid run was resumed during cleanup. See [the cleanup ledger](2026-11-06-main-only-cleanup.md)
for final validation, review findings and branch dispositions.
