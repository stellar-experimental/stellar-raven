# Scout exposure implementation — final

Date: 2026-09-03

## Decision

**SHIP ONE: expose `scout.verifyClaim` and keep `scout.getQualityReport` hidden.**

`GET /api/quality` is again in `EXCLUDED_SCOUT_OPS`.
`GET /api/verify` remains exposed.
The other five feedback and partner exclusions remain unchanged.
I changed no improvement finding, intake record, index, baseline, deployment state, or paid service.

## Evidence

`exposure-review-sol.md` used fixed Scout 1.9.23 inputs and four manifest variants.
`scout.verifyClaim` caused no aggregate routing movement.
`scout.getQualityReport` caused every measured aggregate movement.

The review found 90 unrelated quality-report captures in the complete 544-case routing corpus.
They include 60 strict, 24 extended, one skills, four holdout, and one protocol-history capture.
The quality operation also caused the structural search-test failure.

The natural executable query is `Is EURC issued by Circle?`.
Its current top five ranks `scout.verifyClaim` second.
The adapter test sends `type=issued`, `subject=EURC`, and `auditor=Circle`.
It preserves a mocked `supported` response.

## Generated surface

I rebuilt the catalog, micro-map, super spec, plan operation classes, and routing cases.
All generated artifacts came from repository scripts.

| Measure | Final value |
| --- | ---: |
| Scout exposed operations | 31 of 37 |
| Callable service operations | 61 |
| Manifest entries | 253 |
| Scout routing-keyword operations | 31 |
| Super-spec paths and operations | 65 / 65 |
| Super-spec pretty bytes | 289,753 |
| Super-spec compact bytes | 176,888 |

The compact super spec is 130,312 bytes below the 307,200-byte limit.
The response-compaction list includes `scout.verifyClaim` and excludes `scout.getQualityReport`.

## Routing and protocol results

The final manifest hash is `4273c2990a48eac1b749afe07d4971d99c7d32117e7b6ee4bc823265cf22c476`.
The routing gate failed only because this hash differs from committed gate evidence.
I did not rebaseline `eval/gates.json`.

| Lane | Final result |
| --- | --- |
| Legacy strict top 1 / 3 / 5 | 211 / 277 / 312 |
| Legacy card hits | 103 / 182 |
| Extended strict top 1 / 3 / 5 | 90 / 109 / 114 |
| Skills top 1 / 3 / 5 | 16 / 22 / 23 |
| Holdout top 1 / 3 / 5 | 10 / 22 / 26 |
| Holdout forbidden captures / passed | 10 / 22 |

`npm run eval:protocol-history` returned `source-expired` before scoring.
Both v2 contracts reject the manifest, target-scoring, and target-routing hashes.

## Documentation

The 2026-08-27 exposure record remains historical.
I added a separate dated 2026-09-03 decision in `eval/README.md`.
Current Scout research now states that quality remains hidden after 90 unrelated captures.

## Checks

| Check | Result |
| --- | --- |
| Focused tests | 260 passed |
| `npm test` | 1,712 passed |
| `npm run eval:routing -- --gate` | failed only on manifest fingerprint |
| `npm run eval:protocol-history` | source-expired before scoring |
| `npm run typecheck` | passed |
| `npm run build` | passed |
| `npm run secrets:scan -- --tree` | passed |
| `git diff --check` | passed |

## Rollback (2026-09-03): REJECT DRIFT

`final-routing-review-terra.md` rejected the Scout 1.9.23 and Docs-title candidate.
I restored `inventory/stellar-light.json` and `inventory/stellar-docs-titles.json` from HEAD.
Both inventory paths now have no diff from HEAD.

The committed Scout surface remains 1.9.1. `GET /api/quality` and `GET /api/verify` are both in
`EXCLUDED_SCOUT_OPS`. The accepted surface has 30 Scout operations, 60 callable service operations,
252 manifest entries, and 26 Scout routing-keyword operations.

| Artifact | SHA-256 |
| --- | --- |
| `inventory/stellar-light.json` | `1a261c4a2e2172683e91a52ddc33b02ff41e74760c861dfacb29c60a8d8671b0` |
| `inventory/stellar-docs-titles.json` | `08078133d00c7a4bde723eb666e6053d6e1bab2f97e86f1859cdf77adc307841` |
| `catalog/manifest.json` | `4cd28f4bdfe8c73950e0a6d4dfa1a09dd2f82674859e93990fdd62daef24fe8b` |
| `src/mcp/micro-map.ts` | `eda38f9d752dc28a300c4450dd6033349e7de21a17f620a7637f9e72d9f4a77f` |
| `specs/super-spec.json` | `59d40eddce48b44664eb3abdd32c02e42322e92496c8cbd53d8eed86be8daa24` |
| `eval/plan/op-classes.json` | `4cda9783f098c9e55cfb399ad3d1c77ced8acf3f81f37d6170b1d82048b196bb` |

The rebuilt super spec has 64 callable paths and 287,774 pretty bytes. Its compact form has
174,778 bytes.

| Check | Result |
| --- | --- |
| Focused exposure tests | PASS: 265 tests |
| `npm test` | FAIL: 1,725 passed and 2 failed in `test/eval-vectorize-clause-fit.test.mjs` |
| `npm run eval:routing -- --gate` | PASS: legacy 213/279/312; extended 90/110/116; skills 16/23/23; holdout 10/22/26; 11 forbidden captures |
| `npm run eval:protocol-history` | Diagnostic FAIL: v2 4/8 required and 1/2 forbidden; blind v2 3/11 required and 4/7 forbidden |
| `npm run typecheck` | PASS |
| `npm run build` | PASS |
| `npm run secrets:scan -- --tree` | PASS |
| `git diff --check` | PASS |

The full-suite failures are independent clause-fit artifact tests 22 and 23. I did not alter that
accepted measurement work. No routing baseline or improvements finding changed.
