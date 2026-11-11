# Playground primary re-check: `gpt-6.1-terra` — 2026-11-10

Decision: **promote `openai/gpt-6.1-terra` to Playground primary**, keeping the
`anthropic/claude-haiku-5.5` fallback and effort `none`. It meets the work-queue rule from the
[November 3 re-check](2026-11-03-playground-model-recheck.md): it passes the gauntlet on the
installed SDK and is not worse than the primary on the paired 30-case semantic check (no new wrong
answers, no tool-loop regressions).

## Scope

The owner asked for a proportionate re-check of both `gpt-6.1` models. Effort `none` is not a
requirement, so `gpt-6.1-sol`, which does not support it, ran at `low` (see "`gpt-6.1-sol` at
effort `low`" below). The [November 9 decision](2026-11-09-playground-product-decision.md) could not run either
`gpt-6.1` model because its OpenAI evaluation account answered "account inactive". The gauntlet
below showed that route working again.

The comparator is the saved November 3 `openai/gpt-5.6-terra` run on the same 30 case IDs (seed
`2026-11-03-gpt6-paired`), so the primary was not re-run. Both runs used judge `claude-sonnet-5`,
rubric `v2.11`, pack `p9`. The runs otherwise differ: the baseline ran on a dirty tree at
`a44aaa4c` with `@ai-sdk/openai@4.0.91`, the candidate on clean `721e4f85` with `4.0.108`, and the
catalog and live data moved between them. So the table is evidence for the switch rule, not a
like-for-like quality comparison. Two of the 30 goldens changed between the runs
(`q-defi-soroswap-what-is`, `q-scf-open-rfps-live`). Both were checked by hand, and neither is a
regression. This is a new owner-requested diagnostic, not a resumption of the November 3–4 sweep,
so that sweep's reviewed-plan requirement does not apply. Round-cap context: `not-applicable`.

## Gauntlet (8 prompts, effort `none`, installed `@ai-sdk/openai@4.0.108`)

8/8 passed and no tool failed. Every turn's AI Gateway log shows `openai/gpt-6.1-terra`.
Reported cost was $0.355. On November 3 this model failed 0/8 on the older SDK and passed 8/8 on
this one.

## Semantic lane (30 paired cases)

| Model | Correct | Partial | Wrong | Tool failures | Answer USD | p50 s | p90 s |
|---|---:|---:|---:|---:|---:|---:|---:|
| `gpt-5.6-terra` (saved 2026-11-03) | 8 | 17 | 5 | 0 | 1.883 | 14.1 | 24.0 |
| `gpt-6.1-terra` | 11 | 19 | 0 | 0 | 1.383 | 17.8 | 25.1 |

Rows that differ:

| Case | 5.6 | 6.1 | Note |
|---|---|---|---|
| `q-pay-anchor-msb-licensing` | wrong | correct | |
| `q-org-sdf-enterprise-fund` | wrong | partial | |
| `q-jutsu-cash-crypto-ramps` | wrong | partial | |
| `q-soroban-token-transfer-pattern` | wrong | partial | |
| `q-defi-soroswap-what-is` | wrong | partial | golden changed since November 3 |
| `q-scf-open-rfps-live` | partial | correct | golden and live data changed |
| `q-soroban-storage-migration` | partial | correct | |
| `q-ti-bindings-to-nextjs-integration` | partial | correct | |
| `q-eco-nft-marketplace-whitespace` | correct | partial | omission only: never mentions Rarible; no wrong claim |

Latency is the client turn time; p90 uses linear interpolation. The median rose by about 3.7 s
and p90 by about 1 s, and 13 turns took 20 s or longer against 6. Latency is not part of the
switch rule. The November 3 diagnostic recorded the
same OpenAI cyber-safety refusal on `q-n3-cross-thread-memory-exfiltration` for both Terra
models. It is not in this sample and is not a difference between them.

## `gpt-6.1-sol` at effort `low`

The owner confirmed that effort `none` is not a requirement, so `gpt-6.1-sol` ran at its lowest
supported effort, `low`. It used the same 30 IDs and judge, on clean `9e6dd201`. That makes the
Terra 6.1 run above a like-for-like comparator: same SDK, catalog, and goldens, and live data only
minutes apart.

The gauntlet passed 8/8 (reported $0.496), and every turn was logged as `openai/gpt-6.1-sol`.

| Model | Correct | Partial | Wrong | Tool failures | Answer USD | p50 s | p90 s |
|---|---:|---:|---:|---:|---:|---:|---:|
| `gpt-6.1-terra`, effort `none` | 11 | 19 | 0 | 0 | 1.383 | 17.8 | 25.1 |
| `gpt-6.1-sol`, effort `low` | 9 | 21 | 0 | 0 | 1.743 | 20.6 | 31.2 |

Sol scored lower on two cases (`q-gap-lumen-exact-document-empty` and
`q-ti-bindings-to-nextjs-integration`, both correct → partial) and higher on none. It also cost
26% more and was slower. Terra 6.1 stays primary. Effort `low` was not tried for Terra 6.1: it
would add latency and cost, and Terra already has no wrong answers on this sample.

`gpt-6-astra` was not re-run. The interrupted
[November 3–4 sweep](../../.agents/rounds/2026-11-03-playground-model-sweep.md) already measured
it at `low` on 30 stage-2 cases: 3 wrong answers after hand review against 1 for `gpt-6.1-terra`, at $8.57 of
answer spend against $1.33. That rules it out without new spend.

Spend: Terra $0.355 gauntlet + $1.383 answers + $2.016 judge = $3.75; Sol $0.496 + $1.743 +
$1.978 = $4.22; total $7.97.

Raw results are local-only under `eval/local-lanes/playground-recheck-2026-11-10/`.

## Production check

After the deploy (Worker version `0545c76e`), Playground traffic on 2026-11-11 from 05:28Z was
logged by the `stellar-raven-demo` AI Gateway as `openai/gpt-6.1-terra`. Every call succeeded,
and none reached the fallback.
