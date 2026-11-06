# Playground model sweep — 2026-11-03

Round ledger: `.agents/rounds/2026-11-03-playground-model-sweep.md` (pre-registered stages,
spend windows, judge contract override). This record holds the evidence and the decision.

## Scope

Choose the Playground primary and fallback models. Accuracy and reliability decide. Cost and
speed only break ties. Shipped tuple before the sweep: primary `openai/gpt-5.6-terra`,
fallback `openai/gpt-5.6-luna` (`src/demo/model-config.ts`).

## Code changes during the sweep

| Defect | Change | Evidence |
| --- | --- | --- |
| Anthropic 5.x provider options skipped dotted ids | `DEMO_ANTHROPIC_5X_MODEL` matches `claude-{fable,opus,sonnet,haiku}-5` with `.`, `-`, or end of id; Haiku 5.5 supports all five effort levels and adaptive thinking (Anthropic effort doc, 2026-11-03) | `test/demo-model-config.test.ts` |
| AI SDK behind | `ai@7.0.162`, `@ai-sdk/openai@4.0.108`, `@ai-sdk/anthropic@4.0.96`, `@ai-sdk/google@4.0.111` upgraded together; every candidate gauntleted after the upgrade | `package.json`, probe below |
| `meta/*`, `particle/*` unreachable | Offline dispatch probe showed `Unknown gateway provider` from the plugin registry; both prefixes added to `DEMO_UNIFIED_RUN_PREFIXES`; Kimi temperature quirk narrowed to `moonshotai/` | ledger entry 2026-11-03 |
| Gemini tool replay | Run path rejects the tool-result replay (`7003 User Input Error`); `google/*` now takes the passthrough branch of `demoGatewayTransportSettings` | probe `2026-11-03-sweep-probe-gemini-passthrough` |
| Gateway-logged model id | Gauntlet gained `--max-budget-usd` loopback accounting; each turn records the Gateway-logged model next to the configured id | `research/gauntlets/2026-11-03-sweep-probe.json` |

The gauntlet accounting turns run with SDK retries off and one Gateway attempt per call, so
every screen below is stricter than production.

## Candidates, effort, transport

| Model | Effort used | Transport | Reachable |
| --- | --- | --- | --- |
| `openai/gpt-5.6-terra` (baseline) | `none` | passthrough (mode not recorded in this table) | yes |
| `openai/gpt-5.6-luna` (shipped fallback) | `none` | passthrough (mode not recorded in this table) | yes |
| `openai/gpt-5.6-sol` | `none` | passthrough (mode not recorded in this table) | yes |
| `openai/gpt-6-luna` | `none` | passthrough (mode not recorded in this table) | yes |
| `openai/gpt-6-sol` | `none` | passthrough (mode not recorded in this table) | yes |
| `openai/gpt-6.1-terra` | `none` | passthrough (mode not recorded in this table) | yes |
| `openai/gpt-6.1-sol` | `low` (API rejects `none`) | passthrough (mode not recorded in this table) | yes |
| `openai/gpt-6-astra` | `low` (API rejects `none`) | passthrough (mode not recorded in this table) | yes |
| `anthropic/claude-haiku-5.5` | `none` (effort `low`, adaptive thinking) | run path | yes |
| `anthropic/claude-sonnet-5.5` | `none` | run path | yes |
| `anthropic/claude-sonnet-5` | `none` | run path | yes |
| `anthropic/claude-opus-5.5` | `none` | run path | yes |
| `meta/muse-spark-1.3` | provider default | run path | **no** — HTTP 400 `[7003] Model execution failed (User Input Error): Invalid value at input: Invalid input`, also with the catalog's own example body |
| `meta/muse-spark-open` | provider default | run path | yes |
| `particle/particle-1` | provider default | run path | yes |
| `moonshotai/kimi-k3` | provider default | run path | yes |
| `@cf/moonshotai/kimi-k2.7-code` | provider default | run path | yes |
| `@cf/zai-org/glm-5.3` | provider default | run path | yes |
| `@cf/zai-org/glm-5.3-flash` | provider default | run path | yes (slow) |
| `google/gemini-3.8-flash` | `none` | passthrough, Gemini wire | yes after the transport fix |
| `xai/grok-4.7` | `none` | passthrough, chat | yes |
| `deepseek/deepseek-v4-pro` | — | — | **no** — passthrough HTTP 401 `Authentication Fails (governor)` (not a Unified Billing provider); run path HTTP 500 `[2002] Model execution failed (Error)` on three attempts with the catalog example body |
| `xai/grok-4.6` (shipped Grok control) | `none` | passthrough, chat | yes |

This initial candidate table predates later transport repairs. Muse Spark 1.3 subsequently
completed the JSON-reply transport probe and was excluded for reliability, not reachability.
The OpenAI implementation defaults to Responses; this table did not retain effective mode per
run, so do not infer cross-mode comparisons from its old chat labels. Changes were made both
before and during paid probes; the ledger preserves their sequence.

`none` is the demo default. For run-path vendors without an effort mapping the key is omitted,
so the provider default applies. Every Gateway-logged model id equalled the configured id for
every vendor that answered.

## Stage 0 — transport probe (one turn per model)

Run id `2026-11-03-sweep-probe`, prompt `rpc-simulate`, USD 1.39 reported. Full table in
`research/gauntlets/2026-11-03-sweep-probe-summary.md`. Behavior notes, not gate failures:
`claude-sonnet-5.5` and `claude-opus-5.5` answered with `execute` only (no `search`);
`meta/muse-spark-open` had one model-authored script error inside `execute`.

## Stage 1 — gauntlet, all reachable candidates, 2 repeats

Run ids `2026-11-03-sweep-stage1` (demo default effort `none`, 19 models) and
`2026-11-03-sweep-stage1-low` (`gpt-6.1-sol`, `gpt-6-astra` at `low`). Eight prompts, two repeats,
one turn per cell. Spend: harness-reported USD 18.41 (10 aborted turns of unknown cost);
gateway-logged USD 19.23 for the interval; USD 20.67 for the stage with the probes. The USD 20
stage cap stopped `grok-4.7` after 6 turns and `gpt-6-astra` after 7; t16 raised the cap to USD 28
for the completion runs and the transport rerun (tables below).

Gate, as pre-registered: a turn fails when `http`, `terminal`, `finalAnswer`, `latency`, or
`noToolFailures` fails. A model advances only when every failure is on a prompt the baseline also
failed. `expectedTools` and `noMarketNumber` are notes.

| Model | Effort | Turns | Gate failures | Not covered by baseline | Notes | USD | Unknown-cost | Advance |
| --- | --- | ---: | ---: | ---: | --- | ---: | ---: | --- |
| `openai/gpt-5.6-terra` | default | 16 | 3 | 0 | 0 | 0.9656 | 0 | yes |
| `@cf/zai-org/glm-5.3-flash` | default | 16 | 7 | 5 | 0 | 0.0559 | 1 | no |
| `@cf/zai-org/glm-5.3` | default | 16 | 9 | 6 | 0 | 0.8062 | 0 | no |
| `@cf/moonshotai/kimi-k2.7-code` | default | 16 | 2 | 2 | 0 | 0.3623 | 0 | no |
| `moonshotai/kimi-k3` | default | 16 | 7 | 3 | 0 | 0.4509 | 4 | no |
| `particle/particle-1` | default | 16 | 4 | 2 | 1 | 0.1509 | 0 | no |
| `meta/muse-spark-open` | default | 16 | 5 | 3 | 0 | 0.5332 | 4 | no |
| `google/gemini-3.8-flash` | default | 16 | 1 | 1 | 0 | 0.6024 | 0 | no |
| `openai/gpt-5.6-luna` | default | 16 | 0 | 0 | 0 | 0.0790 | 0 | yes |
| `openai/gpt-6-luna` | default | 16 | 2 | 1 | 0 | 0.0516 | 0 | no |
| `openai/gpt-5.6-sol` | default | 16 | 0 | 0 | 0 | 1.9396 | 0 | yes |
| `openai/gpt-6-sol` | default | 16 | 6 | 4 | 0 | 1.0086 | 0 | no |
| `openai/gpt-6.1-terra` | default | 16 | 0 | 0 | 0 | 0.5710 | 0 | yes |
| `anthropic/claude-haiku-5.5` | default | 16 | 0 | 0 | 0 | 0.0997 | 0 | yes |
| `anthropic/claude-sonnet-5` | default | 16 | 1 | 0 | 0 | 1.6496 | 0 | yes |
| `anthropic/claude-sonnet-5.5` | default | 16 | 0 | 0 | 6 | 1.2001 | 0 | yes |
| `anthropic/claude-opus-5.5` | default | 16 | 0 | 0 | 4 | 2.8741 | 0 | yes |
| `xai/grok-4.6` | default | 16 | 2 | 0 | 0 | 1.4757 | 1 | yes |
| `xai/grok-4.7` | default | 6 | 2 | 2 | 0 | 0.4499 | 0 | incomplete |
| `openai/gpt-6.1-sol` | low | 16 | 0 | 0 | 0 | 0.8901 | 0 | yes |
| `openai/gpt-6-astra` | low | 7 | 1 | 0 | 0 | 2.1917 | 0 | incomplete |

Baseline failures: `activity-leaderboard` (both repeats) and `zk-repos` (repeat 2), all
model-authored execute script errors (`Cannot read properties of undefined`). Every tool failure in
the stage is a model-authored script error or a malformed tool-call argument
(`AI_InvalidToolInputError`). `gpt-6-sol` returned a Promise from its script on six turns
(`#<Promise> could not be cloned`). `particle-1` hit one run-path HTTP 500 `2002: Credential
loading failed` (2026-11-03T21:5xZ). The "aborted before finishing" rows are the route's 120 s turn
limit: `glm-5.3-flash`, `glm-5.3`, `kimi-k3`, `muse-spark-open`, and `grok-4.6` (`zk-repos`, both
repeats; covered by the baseline exception).

Behavior notes: `claude-sonnet-5.5` skipped `search` on 6 of 16 turns and `claude-opus-5.5` on 4
(they called `execute` directly and finished clean). `particle-1` named a market number once.

Latency and cost per turn (p50 / p95 ms, USD per turn) from the gauntlet summary:
`gpt-5.6-luna` 10692 / 17706, 0.005; `haiku-5.5` 10241 / 17130, 0.006; `gpt-6.1-terra`
14605 / 21111, 0.036; `gpt-6.1-sol` (low) 16580 / 34370, 0.056; `gpt-5.6-terra` 13194 / 22718,
0.060; `sonnet-5.5` 9495 / 14269, 0.075; `sonnet-5` 14994 / 28892, 0.103; `gpt-5.6-sol`
13527 / 28593, 0.121; `opus-5.5` 16849 / 26327, 0.180; `grok-4.6` 39966 / 120701, 0.092.

### Stage-1 completion and transport reruns (cap raised to USD 28, then 30)

Run ids `2026-11-03-sweep-stage1b-{six,deepseek,astra2,astra1,grok2,grok1}` and
`2026-11-03-sweep-stage1c-{muse,astra}`. Gateway-logged USD 7.20 + 1.23; stage-1 gateway total
USD 29.10. Rows that supersede or void earlier rows: the `openaiEndpoint` rerun rows for
`kimi-k3`, `particle-1`, and `muse-spark-open` replace their first rows; the `muse-spark-1.3`
rows of `stage1b-six` are void (the gateway streamed native Responses events for a `stream: true`
chat request, so every turn was three `[object Object]` tokens and no tool call; ledger
2026-11-04); astra's HTTP 404 `Items are not persisted for Zero Data Retention organizations` cell
is void (reasoning-item replay under the ZDR gateway with the SDK default `store: true`, fixed
by `store: false`); harness budget-stop rows are excluded. Final gate table:

| Model | Effort | Turns | Gate failures | Not covered by baseline | Notes | USD | Unknown-cost | Advance |
| --- | --- | ---: | ---: | ---: | --- | ---: | ---: | --- |
| `openai/gpt-5.6-terra` | default | 16 | 3 | 0 | 0 | 0.9656 | 0 | yes |
| `@cf/zai-org/glm-5.3-flash` | default | 16 | 7 | 5 | 0 | 0.0559 | 1 | no |
| `@cf/zai-org/glm-5.3` | default | 16 | 9 | 6 | 0 | 0.8062 | 0 | no |
| `@cf/moonshotai/kimi-k2.7-code` | default | 16 | 2 | 2 | 0 | 0.3623 | 0 | no |
| `google/gemini-3.8-flash` | default | 16 | 1 | 1 | 0 | 0.6024 | 0 | no |
| `openai/gpt-5.6-luna` | default | 16 | 0 | 0 | 0 | 0.0790 | 0 | yes |
| `openai/gpt-6-luna` | default | 16 | 2 | 1 | 0 | 0.0516 | 0 | no |
| `openai/gpt-5.6-sol` | default | 16 | 0 | 0 | 0 | 1.9396 | 0 | yes |
| `openai/gpt-6-sol` | default | 16 | 6 | 4 | 0 | 1.0086 | 0 | no |
| `openai/gpt-6.1-terra` | default | 16 | 0 | 0 | 0 | 0.5710 | 0 | yes |
| `anthropic/claude-haiku-5.5` | default | 16 | 0 | 0 | 0 | 0.0997 | 0 | yes |
| `anthropic/claude-sonnet-5` | default | 16 | 1 | 0 | 0 | 1.6496 | 0 | yes |
| `anthropic/claude-sonnet-5.5` | default | 16 | 0 | 0 | 6 | 1.2001 | 0 | yes |
| `anthropic/claude-opus-5.5` | default | 16 | 0 | 0 | 4 | 2.8741 | 0 | yes |
| `xai/grok-4.6` | default | 16 | 2 | 0 | 0 | 1.4757 | 1 | yes |
| `xai/grok-4.7` | default | 16 | 6 | 4 | 0 | 1.5738 | 0 | no |
| `openai/gpt-6.1-sol` | low | 16 | 0 | 0 | 0 | 0.8901 | 0 | yes |
| `openai/gpt-6-astra` | low | 16 | 0 | 0 | 0 | 5.5468 | 0 | yes |
| `meta/muse-spark-open` | default | 16 | 3 | 3 | 0 | 0.7217 | 1 | no |
| `particle/particle-1` | default | 16 | 3 | 1 | 0 | 0.1582 | 0 | no |
| `moonshotai/kimi-k3` | default | 16 | 5 | 2 | 0 | 0.5338 | 3 | no |
| `@cf/deepseek-ai/deepseek-v4-pro-0813` | low | 16 | 5 | 4 | 0 | 0.4881 | 0 | no |
| `@cf/deepseek-ai/deepseek-v4.1-flash-1017` | low | 16 | 4 | 4 | 0 | 0.1543 | 0 | no |
| `meta/muse-spark-1.3` | default | 15 | 1 | 1 | 0 | 1.0032 | 0 | incomplete |

Excluded in this phase: `muse-spark-open` (3 new script errors), `particle-1` (1), `kimi-k3`
(2 plus aborts), both Cloudflare-hosted DeepSeek models (4 new script errors each, at `low`),
`grok-4.7` (script errors on `soroswap-builder` and `wallet-recovery`), and `muse-spark-1.3`
(`execute call limit reached` on `rpc-simulate`, 15 of 16 turns run before its cap). `gpt-6-astra`
advances on 16 clean cells. Eleven models advance to stage 2.

## Stage 2 — 30 semantic cases, one run per advancing model

Run id `2026-11-03-playground-model-sweep-stage2`, 2026-11-04T01:30Z–06:58Z, generation commit
`6b451221`, seed `2026-11-03-gpt6-paired` (the same 30 cases as the paired GPT-6 round), one run
per model, three concurrent 10-case shards, Judge A (`claude-sonnet-5`, rubric v2.11) inline.
Harness answer spend USD 32.42; gateway logs reconcile per model (ledger 2026-11-04T06:58Z). Two
window waits (before `claude-opus-5.5` and `gpt-6-astra`); the sliding 24 h gateway window never
passed USD 85.

Raw Judge A table (score = correct + 0.5 x partial; p50 / p90 turn latency; USD per turn):

| Model | Effort | Rows | Correct | Partial | Wrong | Error | Score | Tool failures | No done | Aborted 120 s | p50 ms | p90 ms | USD/turn |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `openai/gpt-6.1-terra` | none | 30 | 8 | 21 | 1 | 0 | 18.5 | 0 | 0 | 0 | 17455 | 24638 | 0.0442 |
| `openai/gpt-6.1-sol` | low | 30 | 7 | 22 | 1 | 0 | 18 | 0 | 0 | 0 | 20300 | 28575 | 0.0594 |
| `xai/grok-4.6` | none | 30 | 11 | 17 | 2 | 0 | 19.5 | 3 | 3 | 3 | 65373 | 118639 | 0.138 |
| `anthropic/claude-haiku-5.5` | none | 30 | 6 | 22 | 2 | 0 | 17 | 1 | 0 | 0 | 13995 | 17406 | 0.0068 |
| `openai/gpt-6-astra` | low | 30 | 7 | 20 | 3 | 0 | 17 | 0 | 0 | 0 | 27820 | 35924 | 0.2857 |
| `openai/gpt-5.6-terra` | none | 30 | 9 | 16 | 4 | 1 | 17 | 3 | 0 | 0 | 12900 | 18943 | 0.0649 |
| `anthropic/claude-opus-5.5` | none | 30 | 7 | 19 | 4 | 0 | 16.5 | 0 | 0 | 0 | 16210 | 21078 | 0.1543 |
| `openai/gpt-5.6-sol` | none | 30 | 12 | 13 | 5 | 0 | 18.5 | 0 | 0 | 0 | 12016 | 20247 | 0.1347 |
| `anthropic/claude-sonnet-5.5` | none | 30 | 8 | 17 | 5 | 0 | 16.5 | 1 | 0 | 0 | 11372 | 14910 | 0.068 |
| `openai/gpt-5.6-luna` | none | 30 | 7 | 18 | 5 | 0 | 16 | 1 | 0 | 0 | 13744 | 17599 | 0.0053 |
| `anthropic/claude-sonnet-5` | none | 30 | 8 | 15 | 7 | 0 | 15.5 | 7 | 0 | 0 | 19008 | 28578 | 0.1194 |

Hand review covered every verdict that differs from the baseline on all 11 models. Four Judge A
verdicts were false positives corrected by transcript evidence (baseline and `claude-sonnet-5`
`q-ti-vocab-project-tags-live` wrong → partial, the requested slug is in the live tool output;
`gpt-6.1-sol` and `claude-sonnet-5.5` `q-edge-1xlm-activation-fee` wrong → partial, no wrong claim
and no avoid hit). The vocab case exposed a judge defect: the evidence pack truncates the 85-row
tag list to 82 rows, so the judge cannot see the slug it penalizes (candidate `eval/qa` finding).
The baseline's `q-jutsu-cash-crypto-ramps` Judge A error resolves to partial (hand review and
Judge B agree; a Judge A re-judge said wrong on an evidence-reading error).

Judge B (Codex `gpt-6.1-sol` high) re-graded the baseline, `claude-haiku-5.5`, `gpt-6-astra`, and `claude-sonnet-5.5` (30 rows each) plus the two disputed rows. Agreement with Judge A: 20, 24, 25, and 22 of 30; scores A 17 / B 17.5, 17 / 15, 17 / 17.5, and 16.5 / 15.5. Judge B confirmed the hand-review corrections on the vocab case and on the baseline's ramps case. Judge B graded `q-edge-1xlm-activation-fee` wrong for three models with an empty wrong-claims list and no fired avoid, which the rubric does not permit, so that case is judge-unstable under both judges and the hand-review partial stands. Judge A is the stage-2 grade of record; under Judge B alone `claude-sonnet-5.5` would edge `claude-haiku-5.5` for the last slot, so the cut is judge-sensitive (ledger 2026-11-04T06:58Z).

Exclusions by the pre-registered rule (more than one tool failure): `xai/grok-4.6` (3 turns hit
the route's 120 s deadline; p90 119 s) and `anthropic/claude-sonnet-5` (7 model-authored script
syntax errors). Adjusted scores: `gpt-6.1-terra` 18.5 (1 wrong), `gpt-6.1-sol` 18.5 (0),
`gpt-5.6-sol` 18.5 (5), `gpt-5.6-terra` 18 (3), `claude-haiku-5.5` 17 (2), `gpt-6-astra` 17 (3),
`claude-sonnet-5.5` 17 (4), `claude-opus-5.5` 16.5 (4), `gpt-5.6-luna` 16 (5).

Finalists (baseline, shipped fallback, top 5 by adjusted score, ties by fewer wrong):
`gpt-5.6-terra`, `gpt-5.6-luna`, `gpt-6.1-sol`, `gpt-6.1-terra`, `gpt-5.6-sol`,
`claude-haiku-5.5`, `gpt-6-astra`. `claude-sonnet-5.5` misses the cut on the 17-point tie.

## Stage 3 — 100 disjoint cases, 2 repeats per finalist, Judge A + Judge B

The later ledger records eight finalists (adding Sonnet 5.5 after the judge-sensitive cutoff),
partial initial runs, and an owner-approved gateway change. This summary's seven-model table
above is the earlier stage-2 selection, not the final stage-3 roster. Stage 3 was interrupted;
there is no complete comparable final matrix or promotion decision.

## Decision

2026-11-06 cleanup preserves these historical results and integrates the completed reusable
code after review and offline validation. Keep the existing primary and fallback. No paid
collection or model promotion occurred in cleanup; any resumed evaluation requires a fresh plan.
See `.agents/rounds/2026-11-06-main-only-cleanup.md`.
