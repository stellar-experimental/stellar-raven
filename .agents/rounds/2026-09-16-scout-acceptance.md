# Scout 1.9.52 source and routing acceptance

Status: accepted, merged in PR #168, deployed, and verified in production.

## Scope

This candidate combines Scout 1.9.52, 651 Docs titles, and the reviewed Light skill revision.
The catalog retains 282 entries, including 30 Scout operations and 20 searchable skills.
`GET /api/rwa` stays excluded. Its three mixed-intent failures remain deferred Raven work.
No paid or write operation becomes available. No paid evaluation ran.
The QA corpus stays at 501 active cases. The separate paid collection plan stays at 500 cases.

## Routing change

The parser preserves complete source phrases and negative intent.
The scorer requires coherent evidence and keeps strong Docs results available.
The quality repair restores stablecoin and named-project discovery.
Dated semantic retrieval can lead title search for explicit freshness questions.
It does not claim that a research corpus provides live TVL measurements.

The quality repair changes four result lists relative to its reviewed predecessor.
The Docs title and Light pin integration changes no result order or grade across 544 cases.
Two existing Docs scores increase by 8.
The runtime optimization preserves all 544 full search responses byte-for-byte.
The later modifier-scope repair changes one holdout order and moves top-three coverage from 27 to 26.
The reviewer accepted that movement without revealing its query to the implementer.

## Measurements

| Lane | Accepted production source | Candidate |
| --- | --- | --- |
| Legacy top 1 / 3 / 5 | 213 / 280 / 314 | 219 / 298 / 326 |
| Extended strict top 1 / 3 / 5 | 90 / 111 / 116 | 93 / 111 / 117 |
| Skills top 1 / 3 / 5 | 16 / 23 / 23 | 17 / 23 / 23 |
| Holdout top 1 / 3 / 5 | 10 / 22 / 27 | 12 / 26 / 29 |
| Holdout forbidden captures | 11 | 10 |

Independent semantic review accepted the individual movements, including the final modifier-scope correction.
The gate records the measured catalog file hash and final accepted totals.
Legacy baselines rise to 219/298/326 with the existing 1% band.
The skills floor rises to 17. Holdout floors rise to 12/26/29, with at most 10 forbidden captures.
No label or other input fingerprint changes.

Both final timing runs improve the median for all 13 queries against the accepted source.
The pooled median improves about 10%; the pooled p95 improves about 38%.
These measurements cover local search work, not network or model time.

## Verification

- Typecheck and Worker dry-run build passed.
- Unit tests: 2,152 passed, zero failed, three skipped.
- Smoke tests: 94 passed, zero failed.
- QA lint: zero errors and 62 existing warnings.
- All 66 pinned skill files passed upstream hash verification.
- Pin review, improvements lint, and secret scanning passed.
- The original RWA check is experimental only; it is not a released capability.
- Three additional RWA controls still fail and block later exposure.

## Independent reviews

Grok high reviewed the source schema, skill bodies, source integration, and routing changes.
Grok accepted the final semantic decision and its subsequent modifier-scope repair.
Terra high accepted code integrity after the positive stablecoin repair and UTF-8 cleanup.
Terra differs from the Sol authors and the Astra parent.
Sol authored the implementation and reached temporary model capacity.
The parent completed the final request-local admission cache and repeat measurements.

## Evidence

- [Source integration](2026-09-16-truth-maintenance/source-integration.md)
- [Source review](2026-09-16-truth-maintenance/source-integration-review.md)
- [Light pin review](2026-09-16-truth-maintenance/light-pin-excluded-rwa-review.md)
- [Quality repair](2026-09-16-truth-maintenance/scout-quality-repair-report.md)
- [Runtime integration](2026-09-16-truth-maintenance/scout-final-runtime-integration-report.md)
- [Deferred routing work](2026-09-16-truth-maintenance/scout-routing-deferrals.md)

## Release gates

Final semantic and code reviews passed.
Gate evidence records the final reviewed file identities and measured totals.
All four CI checks passed. The clean deployment and production checks passed.
Issue #141 closed after verification.
[Issue #167](https://github.com/stellar-experimental/stellar-raven/issues/167) owns the deferred RWA failures.
The drift closure does not claim RWA acceptance.

## Final review evidence

- [Semantic acceptance](2026-09-16-truth-maintenance/scout-final-release-review.md)
- [Modifier-scope acceptance](2026-09-16-truth-maintenance/scout-clause-repair-independent-review.md)
- [Code repair acceptance](2026-09-16-truth-maintenance/scout-final-code-repair-review.md)

Both protocol-history v2 contracts remain `source-expired`; neither contract scored a question.
A new contract epoch remains separate work. No contract was repinned.

The final routing gate, evaluation self-test, and secret scan passed.
The independent metadata review found no weaker threshold or hash mismatch.
The final timing review accepted both measurements after the modifier-scope repair.

- [Metadata review](2026-09-16-truth-maintenance/scout-final-metadata-review.md)
- [Final timing review](2026-09-16-truth-maintenance/scout-final-timing-review.md)

The [release record](2026-09-16-scout-release.md) contains production and cleanup evidence.
