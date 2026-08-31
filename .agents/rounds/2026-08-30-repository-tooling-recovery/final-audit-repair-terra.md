# Repository recovery final audit repair

Date: 2026-08-30
Scope: Repair B1-B2, M1-M2, and L1-L7 from `/tmp/repo-recovery-receipt-fable-final.md`.

## Verdict

All requested findings are repaired in the working tree.
No frozen case or golden changed.
No paid evaluation, deployment, push, merge, TODO edit, or NEXT edit ran.

## Dispositions

| Finding | Disposition |
| --- | --- |
| B1 | Corrected all four callable-surface statements. Recovery-only entries are exposed and need a host receipt before dispatch. |
| B2 | Restored the exact stop rule. Recorded the dated deviation, user approval, 0/12 sequence result, 16/20 correct result, unmet live gate, and required third authorized collection. |
| M1 | Added a current verification table. Preserved the final Fable, final Grok, truth, and prior Terra repair reports in the round directory. |
| M2 | Recorded the post-authority detour risk without changing frozen material. Added `recovery_receipt` telemetry with `outcome: "consumed"`, source, and target. The event excludes receipt content. |
| L1 | Replaced the `/tmp` durable-report reference with the round copy. |
| L2 | Recorded holdout `cardHit5` 25 to 26 and `passed` 21 to 22 in both gate notes. |
| L3 | Documented receipt signing and secret-rotation invalidation. |
| L4 | Added both `attachDiscoveryModes` throw-path tests and the needed TypeScript declaration. |
| L5 | Renamed the receipt test to match HMAC-first version behavior. |
| L6 | Kept every MCP Rules bullet in one contiguous section. |
| L7 | Added the repository-recovery instrument row to `run-evals`. |

## Verification

| Command | Result |
| --- | --- |
| `npm test -- test/catalog.test.ts test/executor-providers.test.ts test/recovery-receipt.test.ts test/mcp-instructions.test.ts` | PASS: 4 files, 145 tests. |
| `npm run typecheck` | PASS. |
| `npm test` | PASS: 101 files, 1,570 tests. |
| `npm run test:smoke` | PASS: 4 files, 85 tests. Existing dependency source-map warnings occurred. |
| `npm run build` | PASS. |
| `npm run eval:repo-recovery:lint` | PASS: 12 positive and 8 negative frozen cases. |
| `npm run eval:repo-recovery -- --gate` | PASS: 12 eligible positives and zero ordinary discovery leaks. |
| `npm run eval:routing -- --gate` | PASS. |
| `node scripts/build-catalog.mjs` | PASS. |
| `npm run micro-map:build` | PASS. |
| `npm run spec:build` | PASS. |
| `npm run secrets:scan -- --tree` | PASS: no leaks. |
| `git diff --exit-code -- catalog/manifest.json src/mcp/micro-map.ts specs/super-spec.json` | PASS. |
| `git diff --check` | PASS. |

## Residual risks

- The live ship gate remains unmet at HEAD.
- The receipt design has zero live measurements at HEAD.
- A third authorized collection is required before promotion.
- The frozen contract does not measure post-authority detours after sufficient Docs evidence.
- Receipt-consume telemetry can measure the deployed rate without storing receipt content.
