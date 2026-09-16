# Scout search runtime optimization report

Date: 2026-09-16

## Verdict

The narrow optimization is ready for integration review.

It preserves all 544 measured search pages exactly. It also preserves the 495-row routing dump exactly.

The change prepares each query once per search. It does not keep a global prepared-query cache.

It also avoids a complete ungated scoring pass when the gated page is full. It scores only possible replacement candidates.

## Immutable inputs

- Accepted control: `/tmp/raven-execution-2026-09-16/scout-runtime-accepted`
- Accepted commit: `bb37bc502080c94c3f3b5223ffcdf584d4b0e29d`
- Frozen candidate: `/tmp/raven-execution-2026-09-16/scout-runtime-frozen`
- Optimized candidate: `/tmp/raven-execution-2026-09-16/scout-runtime-opt`
- Frozen candidate binary diff SHA-256: `c6e8d6fc7a6186f811dcc4082487c4be0baf7b5b23768082ac3cfa631961aa14`

| Input | manifest | search.ts | scoring.ts | skill-search-admission.ts |
| --- | --- | --- | --- | --- |
| Accepted | `0cff03fd280a25b53cce9cb3ce579f5ec72b5a7f7a7dff4ca977ba4681831869` | `d2b172626a6252ac01b2adda1a6dd75a16bdcce94639cc4d2c080fdce9473b44` | `b8c84cb0c73b89e1ae624bb449bc305fac313e03ee844026763c8735fe8ef548` | `12985cda6f70fd4a8ec827174f51770a56d0865fda708cf89f5e84c29a781fae` |
| Frozen | `bc91f286b8c750a7c551253a84840d2c8e2634fb9e86db939f93b1eb13a5d361` | `bc9e38781ad447cb922291adc247dd312ba2fdf667fa66dd214a2144cf6c0a2c` | `8e28959b6be4c173a73dbb171e8a89937d8c58d04c6621639ad9b15b89287201` | `12985cda6f70fd4a8ec827174f51770a56d0865fda708cf89f5e84c29a781fae` |
| Optimized | `bc91f286b8c750a7c551253a84840d2c8e2634fb9e86db939f93b1eb13a5d361` | `d2c7ff3d730b316fb8e9855b7b7c17be7067715e4536ef7570b824c84773a00f` | `1a861e604c71f20e093f2e955a767f29c8c9c5678517fa02c5db114966b736f7` | `6c26fb77db5663db6b5774f494e428db338213faca197eec5935b65a5d1744d3` |

## Exact behavior evidence

- Frozen 544-page snapshot: `/tmp/raven-execution-2026-09-16/scout-runtime-frozen-544.json`
- Optimized 544-page snapshot: `/tmp/raven-execution-2026-09-16/scout-runtime-optimized-544.json`
- Both snapshot SHA-256 values: `4c87d391c8c7e69c3f5bcadf6e76302df9ef496ceb4bf34473ede5e45ebbc900`
- Frozen 495-row dump: `/tmp/raven-execution-2026-09-16/scout-runtime-frozen-ranked.json`
- Optimized 495-row dump: `/tmp/raven-execution-2026-09-16/scout-runtime-optimized-ranked.json`
- Both dump SHA-256 values: `5872b554c0ed0efbf2e756d44ad655914db732fbac0986d4316756d844fb33ed`

The 544-page snapshot includes hits, scores, tiers, totals, truncation, `widerCandidates`, confidence, and recovery metadata.

## Paired benchmark

The harness rotated accepted, frozen, and optimized variants for each query. Each final run used 12 warm-up rounds.

Each final run used 20 measured rounds, two inner calls, and two repeats. Each variant received 520 samples.

- Run 1: `/tmp/raven-execution-2026-09-16/scout-runtime-benchmark-final-1.json`
- Run 1 SHA-256: `d154675e96c603f9161975e5beb97477fe1e897a835a98a6a7463688049e6a02`
- Run 2: `/tmp/raven-execution-2026-09-16/scout-runtime-benchmark-final-2.json`
- Run 2 SHA-256: `9cd9ff9209e8ccdfae250f0e3a5f1d6ff078e5f91794be2b50c51d874b023541`

| Run | Accepted median/p95 | Frozen median/p95 | Optimized median/p95 |
| --- | --- | --- | --- |
| 1 | 3.794/13.306 ms | 3.975/10.950 ms | 3.798/10.123 ms |
| 2 | 3.729/13.072 ms | 3.913/10.709 ms | 3.764/10.004 ms |

The optimized median was 4.5% and 3.8% faster than the frozen candidate. Its p95 was 7.6% and 6.6% faster.

The optimized median was neutral against the accepted control. The differences were +0.004 ms and +0.035 ms.

The `mixed-rwa-rpc` median remained approximately 0.53 ms slower than accepted. The `exact-operation` median remained 0.08-0.11 ms slower.

The `short-rpc` median regressed against frozen by approximately 0.89 ms. It remained 0.19-0.23 ms faster than accepted.

The benchmark ran while another quality test lane could use CPU. Both bounded repeats gave stable relative results.

An earlier oversized run produced an empty file after manual interruption. No result depends on that file.

## Verification

- `npm run typegen`: passed. Wrangler could not write its optional home log, but it generated `env.d.ts`.
- `npm run typecheck`: passed.
- `npm test`: 119 files passed; 2,137 tests passed; three skipped.
- `npm run test:smoke`: five files passed; 94 tests passed.
- `npm run build`: passed.
- `npm run secrets:scan -- --tree`: passed.
- Targeted routing tests: four files passed; 162 tests passed; three skipped.
- `npm run eval:routing -- --dump-ranked ...`: completed with unchanged measured output.

The routing command reports the existing candidate gate mismatch. This optimization does not change that metadata.

## Patch

- Patch: `/tmp/raven-execution-2026-09-16/scout-runtime-optimization.patch`
- Patch SHA-256: `fddeeb9dae9e10e9699eb5044be4c95fa09e6443cf15c79578bdb140259b0228`
- `git apply --check` passes against the immutable frozen candidate.

The patch changes only these files:

- `src/catalog/scoring.ts`
- `src/catalog/search.ts`
- `src/catalog/skill-search-admission.ts`

The root must remeasure the final integrated quality candidate. This benchmark does not cover later quality edits.
