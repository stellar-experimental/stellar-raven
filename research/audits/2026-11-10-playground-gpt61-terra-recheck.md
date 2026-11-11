# Playground primary re-check: `gpt-6.1-terra` — 2026-11-10

Decision: **promote `openai/gpt-6.1-terra` to Playground primary**, keeping the
`anthropic/claude-haiku-5.5` fallback and effort `none`. It meets the work-queue rule from the
[November 3 re-check](2026-11-03-playground-model-recheck.md): it passes the gauntlet on the
installed SDK and is not worse than the primary on the paired 30-case semantic check (no new wrong
answers, no tool-loop regressions).

## Scope

The owner asked for a proportionate re-check. `gpt-6.1-terra` was the only candidate:
`gpt-6.1-sol` still lacks effort `none` and is not cheaper than the primary (see the November 3
record). The [November 9 decision](2026-11-09-playground-product-decision.md) could not run either
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

Spend: $0.355 gauntlet + $1.383 answers + $2.016 judge = $3.75.

Raw results are local-only under `eval/local-lanes/playground-recheck-2026-11-10/`.
