# Playground model re-check — 2026-11-03

Question: are there better or cheaper Playground models than the shipped primary
`openai/gpt-5.6-terra` and fallback `openai/gpt-5.6-luna`?

Decision: **keep the shipped configuration.** `openai/gpt-6-luna` costs about 1/20 as much per
answer. The switch rule allowed it only with no new wrong answers and no tool-loop regressions
against the current primary. On 30 paired golden cases Luna had three new wrong answers (two
hand-confirmed) and two tool-loop failures; Terra had none of those failures. Correctness
outranks cost. The overall totals (6 wrong against 5) differ by one row and are not evidence of a
quality gap on their own: Terra also had two hand-confirmed new wrong answers that Luna avoided. `src/demo/model-config.ts` is
unchanged. The open follow-up is in [the work queue](../../.agents/TODO.md) ("Re-check the
Playground primary when a new OpenAI model ships").

## Candidates and list prices

Per 1M tokens, input / output, from the OpenAI pricing page and the AI Gateway catalog on
2026-11-03.

| Model | Price | Role tested |
|---|---|---|
| `openai/gpt-5.6-terra` | $2.00 / $12.00 | shipped primary (baseline) |
| `openai/gpt-5.6-luna` | $0.20 / $1.20 | shipped fallback |
| `openai/gpt-6.1-terra` | $1.00 / $5.00 | primary or fallback candidate |
| `openai/gpt-6-luna` | $0.10 / $0.50 | primary candidate |

`gpt-6.1-sol` ($2 / $10) and `gpt-6-astra` ($10 / $50) were not tested: neither supports
reasoning effort `none`, and neither is cheaper than the baseline. The Workers AI `@cf/*` catalog
has no tool-capable model cheaper than `gpt-6-luna`.

## Gauntlet (transport and tool loop, 8 prompts each)

`scripts/run-demo-model-gauntlet.mjs`, reasoning effort `none`, one repeat.

On the installed `@ai-sdk/openai@4.0.91`:

| Model | Pass | p50 ms | p95 ms | Tool failures |
|---|---:|---:|---:|---:|
| `openai/gpt-5.6-terra` | 7/8 | 11013 | 15058 | 1 |
| `openai/gpt-6.1-terra` | 0/8 | 2853 | 3429 | 0 |
| `openai/gpt-5.6-luna` | 8/8 | 9830 | 17584 | 0 |
| `openai/gpt-6-luna` | 8/8 | 11747 | 21635 | 0 |

Every `gpt-6.1-terra` turn failed on step 2 with HTTP 404: `Item with id 'rs_…' not found. Items
are not persisted for Zero Data Retention organizations.` Cause: the installed SDK's capability
table does not list effort `none` for `gpt-6.1-terra`, so it drops the setting with only a
warning. The model then returns reasoning items, the next step replays them as
`item_reference`, and the zero-data-retention account never stored them.

On a trial upgrade to `ai@7.0.162`, `@ai-sdk/openai@4.0.108`, `@ai-sdk/anthropic@4.0.96`, and
`@ai-sdk/google@4.0.111` (the provider packages must move together to share one
`@ai-sdk/provider`):

| Model | Pass | p50 ms | p95 ms | Tool failures |
|---|---:|---:|---:|---:|
| `openai/gpt-5.6-terra` | 7/8 | 11492 | 16720 | 1 |
| `openai/gpt-6.1-terra` | 8/8 | 13478 | 15932 | 0 |
| `openai/gpt-5.6-luna` | 8/8 | 10928 | 17311 | 0 |
| `openai/gpt-6-luna` | 8/8 | 11018 | 27855 | 0 |

The `gpt-5.6-terra` failure is the same `activity-leaderboard` tool failure on both SDKs. The
upgrade was not kept: it was gauntleted only on the four OpenAI models, not on every demo model,
and the kept configuration does not need it.

## Semantic lane, 10-case diagnostic

`npm run eval:playground`, seed `2026-11-03-gpt6`, judge `claude-sonnet-5`, upgraded SDK.

| Model | Correct | Partial | Wrong | Error | Answer USD |
|---|---:|---:|---:|---:|---:|
| `openai/gpt-5.6-terra` | 1 | 8 | 0 | 1 | 0.670 |
| `openai/gpt-6.1-terra` | 1 | 8 | 0 | 1 | 0.534 |
| `openai/gpt-6-luna` | 1 | 9 | 0 | 0 | 0.036 |

Both Terra errors are the same case, `q-n3-cross-thread-memory-exfiltration`. OpenAI's
cyber-safety filter refused the request ("This content was flagged for possible cybersecurity
risk"), so the Playground returned an error instead of an answer. `gpt-6-luna` answered the same
prompt with a correct refusal. The 30-case sample below does not contain this case.

These three result files record the default model tuple, not the model that ran: the harness read
`DEMO_MODEL_OVERRIDE` from its own environment, while the server received it through
`wrangler dev --var`. The dev-server logs confirm the real model of each run. This defect is fixed
in the same change as this record (see "Harness provenance" below).

## Semantic lane, 30 paired cases

Same 30 cases (seed `2026-11-03-gpt6-paired`), same judge, installed SDK, one Wrangler process at
a time. Both runs used one uncommitted working tree on `a44aaa4c` that also contained the harness
change. In that tree `src/demo/model-config.ts` set `openai/gpt-6-luna` as the default primary, so
the Luna run used the file default (`modelSource: "default"`) and the Terra run set
`DEMO_MODEL_OVERRIDE=openai/gpt-5.6-terra,openai/gpt-5.6-luna` for both the server and the harness
(`modelSource: "process-env"`). The committed `model-config.ts` is unchanged. Round-cap context: `not-applicable` (owner-requested diagnostic). Both result files carry
`runtimeIntrospection: "gateway-log"` and record the AI Gateway-logged models:
`["openai/gpt-5.6-terra"]` and `["openai/gpt-6-luna"]`. The fallback never ran.

| Model | Correct | Partial | Wrong | Tool failures | Answer USD | Median s | p90 s |
|---|---:|---:|---:|---:|---:|---:|---:|
| `openai/gpt-5.6-terra` | 8 | 17 | 5 | 0 | 1.883 | 14.1 | 24.0 |
| `openai/gpt-6-luna` | 6 | 18 | 6 | 2 | 0.094 | 15.5 | 20.4 |

Latency is the client turn time; p90 uses linear interpolation.

Every verdict was reviewed by hand against its answer. The rows that differ:

| Case | Terra | Luna | Review |
|---|---|---|---|
| `q-aas-burn-clawback-redemption-mechanics` | correct | wrong | Confirmed. Luna says a payment back to the issuer is "not automatically destroyed"; on Stellar it burns the asset. |
| `q-sor-contract-trustlines-c-address` | partial | wrong | Confirmed. Luna says USDC reaches a `C…` address "using a normal Stellar payment"; only a SAC transfer invocation can. |
| `q-gap-scout-get-skill-detail` | partial | wrong | Borderline. Neither names `getSkill`; Luna answers a different question. |
| `q-eco-nft-marketplace-whitespace` | correct | partial | Luna adds unverified support caveats and misses part of the golden. |
| `q-org-sdf-enterprise-fund` | wrong | partial | Confirmed in Luna's favor. Terra sums non-reconciling yearly figures into "well over $38 million". |
| `q-pay-anchor-msb-licensing` | wrong | partial | Confirmed in Luna's favor. Terra decides licensing from the word "anchor". |

Both models are wrong on `q-defi-soroswap-what-is`, `q-jutsu-cash-crypto-ramps`, and
`q-soroban-token-transfer-pattern`. The other 21 rows have the same score for both models.

The Luna tool failures: on `q-defi-reflector-oracle` its own script threw `Cannot access 'scout'
before initialization`, and on `q-sor-confidential-tokens` it reached the per-turn search limit.

## Harness provenance

The route's `eval-cost` frame now carries `models`: the distinct AI Gateway-logged model of every
provider call, read from the same `getLog` call that reports the cost. The harness stops with
`observed-model-mismatch` before any judge call when a turn reports a model outside the configured
tuple, or reports none. The result contract is `playground-semantic-result/v3`. See
[`eval/playground/README.md`](../../eval/playground/README.md).

## Spend

| Run | USD |
|---|---:|
| 10-case diagnostic, three models | 3.60 |
| 30-case paired, two models | 5.99 |
| Two gauntlets, 64 turns | not measured; the gauntlet has no cost accounting |
