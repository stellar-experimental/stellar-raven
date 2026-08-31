
Date: 2026-08-30

## Verdict

PASS. The repair closes M3-M4, L8-L13, M-A, and L-A through L-C.
No paid evaluation, deployment, push, merge, or queue edit ran.

## Dispositions

| Finding | Disposition |
| --- | --- |
| M3 | Added fixed case and ordered-ID digest literals in `contract.mjs`. Lint checks both literals and computed values. |
| M4 | Documented the exact paid collection command, required pins, the 1–40 call cap, and fixed `$30.00` cap. |
| L8 | The readiness test now returns a serialization error and asserts the `tool-error` failure reason. |
| L9 | The join and integrity checks require the first collected authority operation. |
| L10 | The README states that a same-execute recovery is a premature detour. |
| L11 | The test name now describes the missing reviewed schema and same-execute condition. |
| L12 | Contract schemas, digest hashing, review sets, and reviewer overlap logic now have one owner in `contract.mjs`. CLI argument helpers now have one owner in `cli-args.mjs`. |
| L13 | `collectRepositoryRecovery` now requires the reviewed `$30.00` cap before it creates an artifact. |
| M-A | The ledger now states that paid collections appear below. |
| L-A | The ledger names revision `ca88ab9`. |
| L-B | The observability skill lists `outcome`, `source`, `target`, `reason`, and `errorName`. |
| L-C | The build-catalog comment now describes exposed entries and the ADR-0009 receipt. |

The pass-2 Fable report is preserved at
`.agents/rounds/2026-08-30-repository-tooling-recovery/review-pass2-fable.md`.
It matches `/tmp/repo-recovery-fable-pass2.md` byte for byte.

## Commands and results

| Command | Result |
| --- | --- |
| `npx vitest run test/repo-recovery.test.mjs test/repo-recovery-artifact.test.mjs test/repo-recovery-collector.test.mjs test/repo-recovery-cost.test.mjs test/catalog.test.ts test/executor-providers.test.ts test/recovery-receipt.test.ts test/mcp-instructions.test.ts` | PASS — 8 files, 176 tests |
| `npm run typecheck` | PASS |
| `npm test` | PASS — 101 files, 1,571 tests |
| `npm run test:smoke` | PASS — 4 files, 85 tests |
| `npm run build` | PASS |
| `node scripts/build-micro-map.mjs` | PASS |
| `node scripts/build-super-spec.mjs` | PASS |
| `npm run eval:repo-recovery:lint` | PASS — 12 positive, 8 negative |
| `npm run eval:repo-recovery -- --gate` | PASS — 12 of 12 eligible and zero discovery leaks |
| `npm run eval:routing -- --gate` | PASS |
| `npm run secrets:scan -- --tree` | PASS — no leaks |
| `git diff --check` | PASS |
| Frozen-case and golden diff checks | PASS |

## Residual risks

The live ship gate remains unmet.
The receipt design has no third live collection measurement.
The frozen suite does not measure post-authority recovery detours.
Production telemetry must monitor the pre-registered 0–5% operation-share band.
Any third collection needs separate authorization and current live pins.
