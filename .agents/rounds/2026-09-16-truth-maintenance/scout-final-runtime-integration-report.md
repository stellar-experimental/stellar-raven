# Final runtime integration evidence

Date: 2026-09-16. Status: verified locally; independent release review remains pending.

The parent combined the reviewed source snapshot, quality repair, and runtime optimization.
The final optimization computes each routing rejection once per search.
A request-local map shares that result between the two scoring passes.
The map does not persist across requests. No global prepared-query cache remains.

## Exact behavior

The pre-runtime and optimized snapshots contain all 544 search responses.
Both files have SHA-256 `898df99147cae59ed2a6f08f3454070d6adee94f8d2636b1d834698251e429d6`.
The comparison includes hits, scores, tiers, totals, truncation, fallback candidates, and recovery metadata.
Every byte matches in that optimization comparison. A later correctness repair is recorded below.

## Paired timing

Each run rotates the accepted production source, the combined candidate, and the optimized candidate.
Each uses 13 queries, 12 warm-up rounds, and 40 paired samples per query.
Each sample averages two calls. The parent ran the two final timing commands sequentially.
The accepted source is `bb37bc502080c94c3f3b5223ffcdf584d4b0e29d`.

| Run | Accepted median / p95 | Before optimization | Final median / p95 |
| --- | --- | --- | --- |
| 1 | 3.689 / 12.919 ms | 3.924 / 10.688 ms | 3.332 / 7.998 ms |
| 2 | 3.711 / 12.907 ms | 3.951 / 10.778 ms | 3.345 / 8.046 ms |

Every query has a lower median in both final runs than in the accepted control.
The aggregate median improves about 10%. The aggregate p95 improves about 38%.
The former mixed technical-query slowdown is gone.
These are local search measurements. They do not measure network or model response time.

## File identities before the final clause repair

| File | SHA-256 |
| --- | --- |
| `catalog/manifest.json` | `da21ab9ab7859bb36ef0c2f5443c48cafef69c6c545c6397f7f741cc9fb47210` |
| `src/catalog/search.ts` | `6aca9f7c84cdd96a68738a6439011a0518cf847ded9df0abcadfb383f08c2f89` |
| `src/catalog/scoring.ts` | `1120e3c0a510ebffd624f834387ae9077becccc1b7a15add31d0f5551507d8cb` |
| `src/catalog/skill-search-admission.ts` | `6c26fb77db5663db6b5774f494e428db338213faca197eec5935b65a5d1744d3` |

The catalog builder also prints a canonical JSON hash.
The table above records the file hash used by the routing gate.

## Validation after the final edit

- Typecheck passed.
- Unit tests: 2,152 passed, zero failed, three skipped.
- Smoke tests: 94 passed, zero failed.
- Worker dry-run build passed.
- QA compilation: 501 active cases and 501 reserved IDs.
- QA lint: zero errors and 62 existing warnings.
- Pin review and improvements lint passed.
- The eval self-test still rejects the old catalog fingerprint.
- Routing gate metadata remains unchanged pending the independent semantic decision.

No paid chat, paid evaluation, deployment, or upstream source mutation occurred in this integration.
RWA remains excluded.

## Final clause repair

The independent code review found a positive stablecoin query rejected by a negated source clause.
The repair now requires the matching query modifier before that whole source clause supplies negative evidence.
The source condition recognizes adjacent `non X` and `not X` query words only.
Other negative clauses retain their previous behavior.
The code reviewer accepted the repair and the added positive and negative controls.

All non-holdout result orders remain unchanged.
One holdout order changes and its top-three count moves from 27 to 26.
The semantic reviewer assesses that movement separately, without exposing its identity to the implementer.
The final search file hash is `46fa7be7cad1f50bdfb8d48ab5af85d14fcb8cdd98997d2647f30c78ca9e5111`.

Typecheck, build, 2,152 unit tests, and 94 smoke tests pass after the repair.
Both new timing runs again improve all 13 query medians against the accepted source.

| Run | Accepted median / p95 | Final median / p95 |
| --- | --- | --- |
| 1 | 3.732 / 13.037 ms | 3.367 / 8.096 ms |
| 2 | 3.738 / 13.118 ms | 3.373 / 8.138 ms |

The protocol-history v2 contracts remain `source-expired`. No protocol-history question was scored.
The parent did not repin either contract or claim a diagnostic pass.
