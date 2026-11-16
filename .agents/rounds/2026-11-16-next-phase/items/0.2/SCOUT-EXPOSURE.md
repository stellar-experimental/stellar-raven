# Item 0.2: Scout `GET /api/quality` exposure candidate (record only)

Run once by the Sonnet executor on 2026-11-16, free and local, on the final phase A tree (Scout
1.9.150, titles held, skill re-pins). The Scout 1.9.150 `GET /api/quality` schema change fires the
TODO trigger "Re-evaluate Scout exposure after a routing-contract change". Nothing ships from this
step: `src/policy/scout-exposure.ts` was restored and the stamped manifest hash was re-asserted.

## Method

1. Removed the `GET /api/quality` entry from `EXCLUDED_SCOUT_OPERATIONS` in place.
2. `node scripts/build-catalog.mjs` exit 0 (no build guard failed): `scout/operation` 30 to 31,
   `scout.getQualityReport` exposed. Rebuilt micro-map, spec and op classes (all exit 0).
   Candidate manifest SHA-256:
   `19dc845ce6f211a5e578e3ef9f2744dec39168f7e793358adc091f8a665309ab`.
3. `npx vitest run test/skill-exposure-classification.test.ts test/drift-141-routing.test.ts
   test/catalog.test.ts`: exit 1, 89 passed, 3 failed. `test/skill-exposure-classification.test.ts`
   and `test/drift-141-routing.test.ts` passed. The three failures, all in `test/catalog.test.ts`
   and all by construction:
   - `:397` the Scout operation count pin (31, expected 30). This `expect` aborts its test, so the
     `getQualityReport` count pin at `:403` was never reached; it would fail next.
   - `:656` and `:678` the `expectedExposedRoutingIds` lists (31 entries, expected 30), because
     `getQualityReport` publishes `x-routing`. The plan expected only the two count pins; these
     two list pins are one more by-construction failure than it named.
4. `node eval/run-routing.mjs --gate` without changing `eval/gates.json`: exit 1 with exactly the
   allowed line ("`catalog/manifest.json` SHA-256 does not match the committed gate evidence").
5. Restored with `git checkout -- src/policy/scout-exposure.ts`, rebuilt catalog, micro-map,
   spec and op classes (all exit 0). `sha256sum catalog/manifest.json` equals the stamped
   `8bbfb864eb37988d968d56a18b7a10291e31fda4f5eb25f3d25d82cc0642fc38`, and `git status` shows no
   change under `src/policy`, `src/mcp` or `eval/plan`.

## Lane totals, candidate against the held tree (the tree being committed)

Holdout lane by count only.

| Lane | Held tree | Candidate |
|---|---|---|
| Legacy (338) t1/t3/t5/card@5 | 220/293/327/113 | 221/294/328/113 |
| Extended (122) t1/t3/t5 | 93/112/117 | 93/111/117 |
| Skills (23) t1/t3/t5 | 17/23/23 | 17/23/23 |
| Holdout (49) t1/t3/t5, captures, passed | 12/27/30, 10, 25 | 12/27/30, 10, 25 |
| Protocol history (12) t1/t3/t5, control captures | 6/7/7, 3 | 5/7/7, 3 |

Legacy accept-either totals are equal (257/320/337, card@5 113). The holdout lane has 0 graded
changes and 0 top-five list changes.

## Graded changes against the held tree

| Lane | Row | Change |
|---|---|---|
| Legacy | `q-edge-deep-no-budget-limit` | gain: top1, top3, top5 false to true (`scout.getQualityReport` enters at rank 1) |
| Extended | `q-crp-anchors-by-corridor` | loss: top3 true to false (`scout.getQualityReport` enters at rank 3) |
| Protocol history | `ph-soroban-auth-audit-history` | loss: target rank 1 to 2 (top1 6 to 5) |

`scout.getQualityReport` also enters the top five of 9 further rows without a grade change (6
legacy, 3 extended).

## Verdict

**Not "equal or better with zero graded losses".** One gain, two losses (one extended, one frozen
protocol-history row). `GET /api/quality` stays excluded in this change. The result also agrees
with the standing reason it is held, that quality waits for the general scoring repair
(`.agents/TODO.md` "Preserve structured routing intent"). Item 0.4 should record this result
against the "Re-evaluate Scout exposure after a routing-contract change" trigger. Not a candidate
for a separate exposure change as it stands.

Raw runs and compare output are in `tmp/` (`0.2-expo-run.json`, `0.2-compare-expo-vs-held.json`,
`0.2-gate-expo.log`, `0.2-expo-tests.log`); they are ignored.
