# Scout upstream retirement review — 2026-09-09

## Scope and authority

This is a bounded, read-only retirement review.
It covers only `sls-082`, `sls-083`, and `sls-084`.
It does not resolve a Raven handoff or edit a finding.
It does not change the separate Raven catalog decision in issue `#141`.

## Decision

**PASS — each finding can retire as an upstream defect.**

Each original upstream trigger no longer reproduces on the deployed public service.
The current OpenAPI version is `1.9.49`.
The deployed fix is stronger than the merged PR state alone.
The source issues, PR, and Raven handoffs agree with the fresh results.

Raven catalog issue `#141` remains rejected separately.
That rejection does not show an upstream recurrence.
It does not block retirement of these three upstream findings.
The catalog candidate must stay outside this retirement action.

An authorized resolver must still run the documented resolver dry run and write.
That later action must delete active records, regenerate the index, and add resolved receipts.
This review makes none of those edits.

## Direct upstream state

| Finding | Upstream issue | PR | Current state | Live deployment evidence |
| --- | --- | --- | --- | --- |
| `sls-082` | [#1529](https://github.com/Stellar-Light/stellarlight/issues/1529), closed completed at `2026-09-09T18:11:31Z` | [#1532](https://github.com/Stellar-Light/stellarlight/pull/1532), merged at `2026-09-09T18:04:48Z` | Fixed | API OpenAPI `1.9.49` |
| `sls-083` | [#1531](https://github.com/Stellar-Light/stellarlight/issues/1531), closed completed at `2026-09-09T18:11:35Z` | [#1532](https://github.com/Stellar-Light/stellarlight/pull/1532), merged at `2026-09-09T18:04:48Z` | Fixed | API OpenAPI `1.9.49` |
| `sls-084` | [#1530](https://github.com/Stellar-Light/stellarlight/issues/1530), closed completed at `2026-09-09T18:11:33Z` | [#1532](https://github.com/Stellar-Light/stellarlight/pull/1532), merged at `2026-09-09T18:04:48Z` | Fixed | API OpenAPI `1.9.49` |

The seven recorded PR checks succeeded.
The PR has no recorded reviews.
The independent live checks below, rather than these checks, support the decision.

## UTC collection times

The `sls-082` OpenAPI and valid-filter checks ran at `2026-09-09T18:41:21Z`.
The invalid-state request ran from `2026-09-09T18:40:59Z` to `2026-09-09T18:41:00Z`.
The Etherfuse TOML read ran at `2026-09-09T18:40:59Z`.
The Etherfuse registry read ran at `2026-09-09T18:41:00Z`.
The Etherfuse Horizon read ran from `2026-09-09T18:41:40Z` to `2026-09-09T18:41:41Z`.
The nine `package-release` name checks ran from `2026-09-09T18:42:27Z` to `2026-09-09T18:42:29Z`.
The Circle adjacent-coverage check ran at `2026-09-09T18:42:29Z`.

## Independent live checks

### `sls-082` — PASS

`GET /api/openapi.json` reports version `1.9.49`.
Both `GET /api/rwa` state enums contain these equal values:

```text
live, issued-single-holder, deployed-no-supply, not-found
```

`GET /api/rwa?state=issued-single-holder&limit=100` returned 34 rows.
Every returned row has state `issued-single-holder`.
`GET /api/rwa?state=bogus&limit=1` returned HTTP status `400`.
Its error lists the same four values.

The request schema, response schema, handler result, and validation error now agree.
The original schema-contract defect does not reproduce.

### `sls-083` — PASS

`GET /api/rwa?project=etherfuse&limit=100` returned all nine assets for issuer
`GCRYUGD5NVARGXT56XEZI5CIFCQETYHAPQQTHO2O3IQZTHDH4LATMYWC`.

```text
USTRY CETES TESOURO MEX CETESZ EUROB KTB GILTS MEXe
```

I independently fetched the current Etherfuse `stellar.toml` at `2026-09-09T18:40:59Z`.
It declares exactly these nine code-and-issuer pairs.
The sorted current registry result has the same nine exact pairs.
Every pair uses issuer `GCRYUGD5NVARGXT56XEZI5CIFCQETYHAPQQTHO2O3IQZTHDH4LATMYWC`.
There is no missing or extra pair in this comparison.

The registry reports `MEX`, `GILTS`, and `MEXe` as `live`.
It reports `CETESZ` as `deployed-no-supply`.
The Etherfuse project reports `productsCoverage` with `declared: 9`, `tracked: 9`,
`served: 8`, and `complete: true`.
Its eight served products correctly exclude zero-supply `CETESZ`.

The current Horizon asset response confirms all nine exact code-and-issuer pairs.
`CETESZ` has 16 authorized trustlines and an authorized balance of `0.0000000`.
The other eight have non-zero authorized balances.
This corrects the prior finding's imprecise word "issuance."
Horizon confirms trustlines and balances; it does not by itself prove issuance.

Adjacent behavior also passes.
The Circle project reports `productsCoverage.complete: false` and
`issuersUnreconciled: 1`.
The service therefore reports incomplete coverage instead of implying completion.
No residual successor is required.

### `sls-084` — PASS

`Project.statusBasis` now includes `package-release` in OpenAPI `1.9.49`.
Its description defines package publication as evidence, not deployment proof.

Direct searches returned `package-release` for all original named rows:

```text
ACTA, AXIS, Blockaid, Cypher, DeFarm, Drips, Fundable,
Smart Treasury, Unstoppable Wallet
```

Each returned row had a package-registry `statusSourceUrl`.
The served values are now members of the documented enum.
The original response-schema defect does not reproduce.

## Current Raven handoffs

I read the inbound handoffs after their `2026-09-09T18:25Z` arrival.
They agree with the live results above.

| Raven handoff | Finding | State | Match with independent check |
| --- | --- | --- | --- |
| [#144](https://github.com/stellar-experimental/stellar-raven/issues/144) | `sls-082` | Open | Exact state-enum and valid/invalid filter results match. |
| [#145](https://github.com/stellar-experimental/stellar-raven/issues/145) | `sls-084` | Open | Enum membership and `ACTA` result match. |
| [#146](https://github.com/stellar-experimental/stellar-raven/issues/146) | `sls-083` | Open | Nine registry rows and `productsCoverage` result match. |

The current source snapshot is `1de777ed60471ec134a13c8c4d66e332c7709940`.
It contains the three handoff references and the corrected trustline wording.
The filed upstream issues retain their earlier commit-pinned source snapshot at
`8af90c173d8f41a7d2fdc6cf32b7a0b1d83c9e7d`.
Each upstream issue has a maintainer live-recheck comment and a Raven handoff notification.
The source issues state that their closure followed deployment rechecks, not only the merge.

The three open Raven handoffs are resolution inputs.
The root resolves them separately from open drift issue `#141`.
Do not treat their open Raven state as an upstream defect recurrence.

## Persistent-reference review

`rg -n 'sls-08[234]' .` found active finding files and generated `improvements/INDEX.md` entries.
It found no references in `eval/qa/corpus`, `eval/corpus`, or `improvements/intake.json`.
`improvements/resolved.json` has no resolved receipt for these IDs.

The remaining matches are dated round records and historical provenance.
The resolver must preserve those records.
It must remove the three active files and their generated index rows.
It must append one complete resolved receipt for each ID.

## Resolver handoff

Use each active finding with `npm run improvements:resolve` first in dry-run mode.
Pass the matched `--resolving-ref`, dated live recheck, this independent review, and
`--references-reviewed --upstream-commented`.
The authorized resolver then performs the write only after the dry run passes.

Do not add a Raven catalog reference to any resolved receipt.
Catalog issue `#141` is a distinct rejected internal adoption decision.
