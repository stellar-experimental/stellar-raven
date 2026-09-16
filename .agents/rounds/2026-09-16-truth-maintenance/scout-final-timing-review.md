# Final timing confirmation (clause-repair `search.ts` `46fa7be7…`)

Reviewer: Grok high (Grok 4.6). Distinct from parent, Terra, and runtime Sol.
Clock: `2026-09-16T23:31:36Z`.
Mode: read-only. **No tree edits. No hidden-case follow-up. No gate edits.**

Live `source-integration/src/catalog/search.ts` SHA-256 `46fa7be7cad1f50bdfb8d48ab5af85d14fcb8cdd98997d2647f30c78ca9e5111`.

## Decision

**Accept timings.** No residual query slowdown versus accepted. No blockers from these two files.

Clause semantic verdict stands. Root does not need another timing pass for this gate.

## Files

| File | SHA-256 | overall after median / p95 ms | accepted median / p95 ms |
|---|---|---:|---:|
| `scout-clause-runtime-final-1.json` | `9d0c5addb12fa67bc285547e20fe53d541dc3465fb4571eb632a87cc6510d1ad` | **3.367 / 8.096** | 3.732 / 13.037 |
| `scout-clause-runtime-final-2.json` | `e16d2f1eeeb755e5e1a6fb5347c533d7d86397c0308e08ec83d66ef283409be2` | **3.373 / 8.138** | 3.738 / 13.118 |

Parent’s rounded pairs match these reads.

Config in both: warmup 12, measure 20, inner 2, repeat 2, 13 queries, 520 overall samples. The JSON does **not** embed the search digest. File time is 19:23, after the 23:20 clause dump. Live search file is still `46fa7be7…`.

## 13/13 medians versus accepted

Both runs: every query median is strictly below accepted. None equal. None worse.

Largest gains: `account-merge` (~−5.7 ms), `long-all-backfill` (~−5.0 ms), `person-advisory` (~−4.5 ms). `controlled-vocabulary` is faster after (run1 7.129→5.785; run2 7.128→5.797). `skill-passkeys` / `skill-escrow` improve by a few hundredths of a millisecond and stay sub-millisecond.

Overall p95 ~8.1 ms versus accepted ~13.1 ms in both runs. Two tiny after-p95 ticks above accepted exist on `skill-passkeys` (run2 0.334 vs 0.329) and `skill-escrow` (run2 0.848 vs 0.842). Medians still improve. **Not a blocker.**

This is not Worker-CPU production proof.

## Tests / metadata (parent-reported; not re-run here)

Parent: 2152 unit + 94 smoke + typecheck + build passed after the clause file. This lane did not re-run those commands.

`source-integration/eval/gates.json` now records holdout acceptedTotals **12/26/29**, forbidden **10**, floors minTop1 **12**, minTop3 **26**, minTop5 **29**, maxForbidden **10**. Legacy **219/298/326** card 112. Skills **17/23/23**. Quality-freeze and main `gates.json` still hold the old 10/22/26 numbers. This review does not edit them.

## Tracking

- **RWA:** GitHub issue **167**. Exposure remains forbidden.
- **#141 close:** only after production proof.
- Hidden holdout clause movement: no follow-up. Do not send that case to authors.
