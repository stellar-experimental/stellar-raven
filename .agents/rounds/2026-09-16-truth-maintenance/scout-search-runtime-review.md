# Scout search runtime review

Date: 2026-09-16

Reviewer: Sol high

Mode: bounded, read-only, local

## Verdict

The combined candidate does not show a broad local p95 regression.

Its pooled median is 3% to 4% slower across the equal-weight query set.

Its pooled p95 is 18% to 19% faster across the same set.

However, one full-page vocabulary query has a repeatable 51% median regression.

That regression adds 3.65 ms locally and raises p95 by 3.77 ms.

Five other queries have smaller median regressions from 3% through 26%.

The candidate must not claim that search performance is unchanged.

The practical end-to-end latency risk is low on this catalog size.

The Worker CPU risk is moderate for frequent full-page searches.

The unconditional ungated pass is the main scaling concern.

## Scope and controls

The accepted control is commit `bb37bc502080c94c3f3b5223ffcdf584d4b0e29d`.

The primary branch contains metadata-only commits after that control.

Its measured runtime files are byte-identical to `bb37bc50`.

The candidate is `/tmp/raven-execution-2026-09-16/drift-combined-accepted`.

Its Git head remains `bb37bc502080c94c3f3b5223ffcdf584d4b0e29d` with dirty source changes.

Both measured catalogs contain 282 entries.

The benchmark measured `searchCatalogPage` only.

Manifest loading and validation stayed outside every timed region.

No request used a network, production service, credential, or paid operation.

I did not edit the candidate worktree.

## Exact identities

| Surface | Accepted SHA-256 | Candidate SHA-256 |
| --- | --- | --- |
| `catalog/manifest.json` | `0cff03fd280a25b53cce9cb3ce579f5ec72b5a7f7a7dff4ca977ba4681831869` | `bc91f286b8c750a7c551253a84840d2c8e2634fb9e86db939f93b1eb13a5d361` |
| `src/catalog/search.ts` | `d2b172626a6252ac01b2adda1a6dd75a16bdcce94639cc4d2c080fdce9473b44` | `bc9e38781ad447cb922291adc247dd312ba2fdf667fa66dd214a2144cf6c0a2c` |
| `src/catalog/scoring.ts` | `b8c84cb0c73b89e1ae624bb449bc305fac313e03ee844026763c8735fe8ef548` | `8e28959b6be4c173a73dbb171e8a89937d8c58d04c6621639ad9b15b89287201` |
| `src/catalog/extract-routing-phrases.ts` | `6f1dcd1994596f71a77c2a625a6ceeb9e2f630342712c0cd4afdfc152df0c9f5` | `943251c31eb5ce37ea27ee960ad7aa707a80793df0dfdda8c77df7d16b247812` |
| `src/catalog/types.ts` | `6c8aeb551fa3ea0ccf4762366abb5f92e8ecc7974994eccf5709b6e243d4385c` | `50568a81bc822b07f618338c72d831d4cc7cc586abb66c16e76e5f258d9f180b` |
| Vendored scorer | `718924d10533ea49d472602f600ece0e4d7a0aae3e9e0ca5a95d9a8c6e611b14` | same |

Benchmark harness SHA-256: `9cd315a28be5959b294fa69c83546d6a1407d104e0b0195fdadd71747ee6be1a`

## Method

The runtime was Node `v24.13.0` on arm64 macOS `26.6.2`.

The harness measured four variants in one process.

| Variant | Search code | Catalog |
| --- | --- | --- |
| accepted | accepted | accepted |
| source-only | accepted | candidate |
| code-only | candidate | accepted |
| combined | candidate | candidate |

Each query used fixed text, filters, and limits.

The harness rotated variant order for each query and measurement round.

The primary run used 15 warm-up rounds.

It then collected 120 paired samples per query and variant.

Each sample averaged two calls.

The primary run contains 1,560 samples per variant.

A second process used 10 warm-up rounds and 60 samples per query.

The second process reproduced the same aggregate direction and query ordering.

The benchmark used `--expose-gc` once after warm-up and between repeat groups.

The checksum consumed page totals, hit counts, and first IDs.

## Aggregate results

These pooled values weight each query equally.

They do not predict an unknown production traffic mix.

### Primary run

| Variant | Median ms | Change | p95 ms | Change |
| --- | ---: | ---: | ---: | ---: |
| accepted | 3.769 | control | 13.059 | control |
| source-only | 3.887 | +3.1% | 13.591 | +4.1% |
| code-only | 4.943 | +31.2% | 11.196 | -14.3% |
| combined | 3.896 | +3.4% | 10.766 | -17.6% |

### Independent process repeat

| Variant | Median ms | Change | p95 ms | Change |
| --- | ---: | ---: | ---: | ---: |
| accepted | 3.734 | control | 13.188 | control |
| source-only | 3.871 | +3.7% | 13.731 | +4.1% |
| code-only | 4.954 | +32.7% | 11.346 | -14.0% |
| combined | 3.879 | +3.9% | 10.700 | -18.9% |

The candidate catalog alone adds a small, consistent cost.

The candidate code alone increases the pooled median by about one third.

The combined catalog rejects more candidates early and offsets much of that cost.

## Per-query primary results

The table reports milliseconds per `searchCatalogPage` call.

| Query case | Accepted median / p95 | Combined median / p95 | Median change |
| --- | ---: | ---: | ---: |
| broad gated: `stellar soroban contract` | 2.37 / 2.55 | 2.98 / 3.23 | +25.5% |
| Docs topical TTL | 4.51 / 4.77 | 4.64 / 4.93 | +2.9% |
| account merge | 12.10 / 12.61 | 7.87 / 8.30 | -35.0% |
| regional enum witnesses | 2.98 / 3.11 | 3.34 / 3.57 | +11.9% |
| controlled vocabulary | 7.10 / 7.41 | 10.75 / 11.19 | +51.5% |
| mixed RWA and RPC | 5.21 / 5.55 | 5.92 / 6.28 | +13.6% |
| proper-name advisory | 7.91 / 8.34 | 3.93 / 4.21 | -50.3% |
| long all-backfill query | 13.17 / 13.68 | 10.44 / 10.97 | -20.7% |
| short `zk` | 3.67 / 3.87 | 1.60 / 1.75 | -56.4% |
| short `RPC` | 3.43 / 3.68 | 2.33 / 2.49 | -32.1% |
| skill `passkeys` | 0.315 / 0.340 | 0.300 / 0.347 | -4.8% |
| Trustless Work escrow skill | 0.801 / 0.867 | 0.764 / 0.858 | -4.6% |
| exact `scout.explainRepo` | 3.72 / 3.87 | 3.96 / 4.14 | +6.4% |

The second process reproduced every material direction.

Its controlled-vocabulary median was 10.72 ms against 7.13 ms.

Its broad-gated median was 2.99 ms against 2.36 ms.

## Implementation findings

### P1. Full pages always pay for an ungated catalog pass

Location: candidate `src/catalog/search.ts:930-953`.

The accepted code runs the ungated pass only when the gated page is short.

The candidate always scores the full catalog twice.

It needs the second pool for `preserveStrongBackfill` and later intent preservation.

Therefore, a direct return to the old conditional would remove intended behavior.

The new pass is still the clearest cause of full-page cost growth.

The broad query returns five gated hits in both variants.

Its median increases 26%, or 0.61 ms.

The regional query also returns five gated hits in both variants.

Its median increases 12%, or 0.36 ms.

The vocabulary query uses one targeted backfill in the candidate.

Its median increases 51%, or 3.65 ms.

Smallest safe optimization direction:

- Preserve the reviewed strong-backfill behavior.
- Add a proven cheap eligibility test before a full ungated pass.
- Or compute a bounded ungated top candidate without sorting the full pool.
- Keep the full-page membership and total tests as behavior guards.
- Repeat this paired benchmark after any change.

### P2. Query preparation repeats inside both catalog passes

Locations:

- candidate `src/catalog/search.ts:417-442`
- candidate `src/catalog/search.ts:581-610`
- candidate `src/catalog/scoring.ts:184-202`

The candidate catalog has 29 operations with routing exclusions.

It has 30 operations with routing phrases and routing keywords.

It has 48 entries with schema keywords.

`rejectsRoutingIntent` tokenizes and deduplicates the same query for each applicable operation.

The unconditional second pass repeats that work.

`matchingTokens` also tokenizes the query for each keyword-bearing entry.

`hasCoherentRoutingWitness` can tokenize it again for routing-bearing entries.

The module already caches alias canonicalization by raw query.

A prepared per-search query context would remove this repeated work.

That context can hold content tokens, canonical tokens, compact bigrams, and alias tokens.

This optimization should preserve exact ranking and admission results.

### P3. Candidate pools receive another complete sort

Location: candidate `src/catalog/search.ts:949-953`.

The gated and ungated candidate arrays are already sorted.

The candidate concatenates and sorts the combined array again.

A stable linear merge can preserve the same score and ID order.

This cost is small at 282 entries.

It becomes more relevant as the catalog grows.

## Practical risk

The measured worst candidate p95 is 11.19 ms in this query set.

The accepted set already reaches a 13.68 ms p95 on a long query.

Thus, the combined candidate does not raise the worst local search latency here.

The full-page regression is still meaningful because it consumes Worker CPU on every matching request.

The source-only result shows that catalog text is not the main risk.

The code-only result isolates the larger cost to the new search path.

The combined source data hides much of that cost by rejecting entries early.

That offset can change when the catalog grows or routing exclusions change.

I recommend one of two release decisions.

1. Optimize the unconditional pass and repeated query preparation before source acceptance.
2. Accept the current cost with a written local budget and a later benchmark trigger.

The current evidence supports neither a zero-regression claim nor a severe latency alarm.

## Commands

Primary benchmark:

```text
BENCH_WARMUP=15 BENCH_ROUNDS=40 BENCH_INNER=2 BENCH_REPEAT=3 \
node --no-warnings --experimental-strip-types --expose-gc \
/tmp/raven-execution-2026-09-16/search-runtime-benchmark.mjs
```

Independent process repeat:

```text
BENCH_WARMUP=10 BENCH_ROUNDS=30 BENCH_INNER=2 BENCH_REPEAT=2 \
node --no-warnings --experimental-strip-types --expose-gc \
/tmp/raven-execution-2026-09-16/search-runtime-benchmark.mjs
```

I also verified candidate and primary file hashes after both runs.

The hashes stayed unchanged during measurement.

`git diff --check` passed in the candidate.

Both worktrees retained their pre-existing state.
