# Truth maintenance 2026-09-09

## Scope

Review open issues #141, #140, #138, #136, #132, #130, #124, and #40.
Merge changes that pass their required checks. Deployment requires separate owner approval.
No paid QA calls, transactions, scoring changes, or routing threshold changes are authorized in this round.
The base is `1ef0cdd2bd839c156ec175e04b61df9db51926b9`.

## Lane plan

| Lane | Route | Scope | Report |
|---|---|---|---|
| Drift author | Codex `gpt-6-astra`, medium, `w3G:p7` | Regenerate, review pins, classify drift, run gates | `2026-09-09-drift-141-astra.md` |
| Source verification | Grok `grok-4.6`, high, `w3G:p8` | Independently verify #136, #138, #140 and dependent references | `2026-09-09-upstream-handoffs-grok.md` |
| Docs verification, then drift review | Codex `gpt-5.6-sol`, high, `w3G:p9` | Check crawler ingestion, then independently review drift | `2026-09-09-docs-ingestion-sol.md` |

The owner explicitly selected Astra at medium. Herdr confirmed each launched route and its effort arguments.
The parent owns integration, findings, the queue, commits, and GitHub writes.
Workers share one branch with disjoint write sets. Workers cannot change git references.
Only panes `w3G:p7`, `w3G:p8`, and `w3G:p9` belong to this round.

## Drift verdict

The regenerated Scout source remains OpenAPI 1.9.48.
Its request and response state enums omit `issued-single-holder`.
The root independently requested `GET /api/rwa?state=issued-single-holder&limit=1`.
The response returned that state and reported 34 matching assets.
The root rejects the combined candidate. The unchanged `sls-082` finding owns this contract defect.
The root preserved the rejected candidate at `/tmp/raven-141-rejected.NaBrki/candidate.tar`.
Its SHA-256 is `c333ff6a11d872c4009f9df5805466d7b171d67ada2d77f2fb494e3f5b51390c`.
The separate patch SHA-256 is `a0dbac356f9c765cecfd089b2bb3fd71bf52b266ca644619d84d59eca66e076e`.
These local files are diagnostic evidence, not committed release artifacts.
The isolated candidate retains the accepted Scout inventory and Stellar Light skill pin.
It accepts only the generated stellar-dev selection `sel:7b68c8b72b2f` from commit `0472452a05731de5e0a1e886d8aae6df24873fe2`.
The root rebuilt the catalog, micro-map, spec, and operation classes with their scripts.
All operation records remain identical to the base. No runner operation changed.

## Eval verdict

Run the unchanged routing gate. Stop any failing candidate; do not change thresholds to accept it.

`npm run eval:qa:lint -- --stale` passed with 0 errors and 62 existing warnings.
The combined candidate gate reports a catalog fingerprint mismatch.
That result does not itself prove a numerical band breach.
Astra's unrestricted suite rerun reports 9 failed and 1986 passed tests.
The first run also had environment failures; the unrestricted rerun separates those failures.

The isolated candidate passed all 1995 tests across 108 files and all 85 smoke tests across four files.
Typecheck, build, routing, eval self-tests, and all 44 upstream file hashes passed.
The catalog SHA-256 is `83d9998f984cae38c363524e0592c6d035e80ba09cc27003f7a65e11bb0350f9`.
Only the catalog evidence fingerprint, date, trace, and explanatory note change in `eval/gates.json`.
No threshold, accepted total, other input fingerprint, or scoring implementation changes.
The final root trace is `routing-2026-09-09T16-46-02-887Z.json`.

| Instrument | Base and isolated candidate |
|---|---|
| Legacy top-1/top-3/top-5 | 213 / 279 / 312 |
| Legacy card hits | 95 |
| Skills top-1/top-3/top-5 | 16 / 23 / 23 |
| Holdout top-1/top-3/top-5 | 10 / 22 / 26 |
| Holdout forbidden absence / passed | 11 / 21 |

The root compared all 544 compiled search pages against the base.
Nineteen pages change: 17 legacy pages and two holdout pages.
Seven change ordered identifiers; six of those change membership.
Two additional pages change scores only. Ten additional pages change totals only.
No expected-service hit or forbidden-absence assertion regresses.
The broader MPP description causes incidental lexical changes; this is not a ranking-identical update.
The independent reviewer must assess those changes before acceptance.

## Golden verdict

Inspect changed source facts and due dates. Golden edits require the golden-truth workflow.
Sol verified all three Docs fixes after the September 9 crawl.
The report is `2026-09-09-docs-ingestion-sol.md`.
The crawl ended at `12:03:55.702Z`; both serving indexes updated at `12:03:49.402Z`.
The root independently verified corrected production EVM and Validators records.
Four golden cases still need source-conflict cleanup before the Docs findings can retire.
The follow-up matrix and distinct retirement review remain separate from this pin acceptance.

## Improvements/issues/PR verdict

Verify live triggers before changing statuses. Keep untouched upstream issues quiet.
Retirement requires independent verification, reference cleanup, and a resolved receipt.

The root and Grok independently verified the upstream corrections for `sk-021`, `sk-023`, and `sk-024`.
Their live body hashes match the candidate pins.
Production skill reads at 16:46–16:47 UTC still returned the old `03b2f8e8` pin and all three original defects.
All three findings remain `reported-upstream` until production acceptance and retirement gates finish.
The root corrected the `sk-023` probe to test the missing protocol-agnostic statement.
The previous phrase also appeared inside corrected scoped guidance and caused a false recurrence.
The corrected probe run reports seven recurring findings, two fixed candidates, zero inconclusive results, and zero errors.
No paid QA, model-answering evaluation, payment, or transaction ran.

## Own-repo todos

Check #40 authentication, #124 rejected candidate, and the Docs crawler evidence without broadening their authority.

The root opened production `/playground` in isolated browser session `raven-141-0890b55cdb68`.
The page offered sign-in, not an authenticated answer. The root closed that browser session.
No chat request ran. Issue #40 retains its authenticated acceptance requirement.
Issue #124 has no new maintainer activity. Its rejected candidate remains outside this branch.

## Decisions

Service drift and skill source acceptance are separate changes when their acceptance checks differ.
Grok 4.6 high independently accepts the isolated pin bytes with zero grade losses.
The reviewer required an isolated acceptance entry in `PIN-REVIEW.md`; the root replaced the candidate-only entry.
The rejected combined candidate remains in the Astra report and local archive.
The root and reviewer distinguish nine top-hit changes from ten additional total-only page changes.

## Final checklist

Pending checks, reconciliation, merge, and any approved production verification.
