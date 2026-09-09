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
The separate blind Grok fact review also confirms all three original triggers and corrected positive records.
The report is `2026-09-09-docs-retirement-review-grok.md`.
The root reconciled the two independent checks before editing four owned corpus cases.

| Claim cluster | Class A | Class B | Class E | Author decision |
|---|---|---|---|---|
| `sd-039` product identity | Both rendered Tools pages distinguish Relayer and managed Channels | Current Tools source contains the distinction | Both original-query Tools records contain the distinction | Remove the expired alias caution only |
| `sd-042` Horizon lifecycle | EVM and four canonical pages agree on nearing-end-of-life | EVM blob `c7b63187` contains corrected wording | Positive EVM record agrees after the crawl | Remove the expired index caution; retain the dated September 8 history |
| `sd-047` cadence wording | Validators and Stellar Stack both say every 5-7 seconds | Validators blob `f74c2629` contains corrected wording | Both positive records agree; original stale trigger is absent | Refresh provenance only; keep every judge-facing field unchanged |

Affected case IDs:

- `q-ti-openzeppelin-relayer`
- `q-infra-horizon-vs-rpc`
- `q-pc-practical-fee-setting`
- `q-protocol-ledger-close-time`

The Relayer version and provider-health observations remain dated September 2 and disputed.
The fee-setting case retains its independent `sd-003` caution.
The cadence case retains every historical empirical measurement and target-versus-observation distinction.
The root made no numeric, fee, cadence, API, architecture, or provider-health fact change.
The latest verification event explicitly limits its scope to the fixed source/index conflicts.
Compilation still produces 500 active cases. The register correctly reopened seven clusters and one numeric invariant.
Those entries require a scoped sibling review before finalization.
The root reviewed the changed-claim scope across all members of the seven affected clusters.
The source/index corrections do not change any sibling's fee, reserve, cadence, endpoint, or provider claim.
The market-data sibling already uses the corrected Horizon lifecycle wording.
The root also checked the Relayer/x402/smart-wallet and ledger-header/expiry siblings.
The register review clears exactly the seven reopened clusters and the unchanged base-fee invariant.
The cluster-018 note now separates current agreement from its dated historical conflict notes.
`eval:qa:register -- --check` passes after the scoped review.

The local plan regression input is the last available saved run, `2026-08-30T03-43-11-variantA.json`.
The root copied it into `/tmp/raven-docs-plan.OrquH3` before grading to preserve the existing artifact.
Before and after rows are identical; only report metadata changes.
The row SHA-256 is `71431f5ced6eacc68b05f9b141db6e901f2f08c5ce68f5ad43f4cc98033ea1de`.
Both runs report 93/100 required-covered and a 0.95 mean on-plan ratio.
These are unchanged historical regression results, not new QA performance evidence.
The first diff-aware lint passed with 0 errors and 64 warnings.
Two additional warnings reflect the required removal of expired canonical-source cautions, not new factual gaps.
The root does not restore an expired caution to suppress those heuristic warnings.
The completed Sol matrix is `2026-09-09-docs-golden-matrix-sol.md`.
Its exact proposal favors keeping the existing answers and historical rows unchanged.
The root adopted that narrower boundary before final review.
All four answers, key-fact arrays, avoid arrays, historical corroboration rows, asOf fields, and reverifyBy fields now match the base.
Only current notes, source/index corroboration additions, latest verification, and the resolved Horizon dispute status change.
The root restamped the generated outputs and reviewed the reopened register entries again.
Grok's independent pre-retirement diff review passed.
The reviewer identified stale standing notes in clusters 061 and 063 as non-blocking residuals.
The root corrected both notes to current source/index agreement without changing their numeric or endpoint rules.
Sol completed the matrix and confirmed that the final narrower diff preserves all answers and historical rows.

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

PR #142 carries commit `ea8bbbfc40ad223f0d399fe4477226b8586b644a`.
Its first CI run `34380004756` passed typecheck, build, 1995 tests, 85 smoke tests, and the routing gate.
The final generated-sync check failed because the root omitted `ecosystem-skills/INDEX.md` after isolation.
The root ran `node ecosystem-skills/build-index.mjs` and the complete CI regeneration sequence.
Only the skill index changed. The second index build produced the same bytes.
The index SHA-256 is `6f7491771b2514e0e23fa4701c54a5f415717ff89bdea13a9b9aab16826360b1`.
No generator, runtime code, threshold, or source pin changed in that repair.
Astra medium independently reproduced the generator output in memory and confirmed the exact index hash.
The bounded check is `2026-09-09-pin-index-check-astra.md`.
CI must pass before merge. Production deployment still requires owner approval.

PR #142 merged at `2026-09-09T17:04:43Z` as `9a3e1857b02870fc09d9469edf0a2917b807b8ed`.
The final CI run `34380495719` passed, including the complete generated-sync check.
The root read back the new issue #141 comment and confirmed its author as `kalepail`.
Comment: https://github.com/stellar-experimental/stellar-raven/issues/141#issuecomment-5605720923.
The unresolved Scout drift remains open. No deployment ran.

## Docs terminal cleanup — 2026-09-09

The independent Grok final-bytes gate passed before the golden evidence commit.
Evidence commit `25d8d8f` preserves all four answers, key facts, avoid arrays, and historical observations.
The source snapshot commit is `176513cc5e058fa12ad81f607ea4ca0d514a659a`.
The root verified every public source blob against its local finding before retirement.
The root posted the live result and immutable source on all seven distinct upstream references.
Every comment body and the `kalepail` author passed an exact GitHub API readback.

- sd-039: https://github.com/stellar/stellar-docs/issues/2707#issuecomment-5606026404
- sd-039: https://github.com/stellar/stellar-docs/pull/2723#issuecomment-5606026849
- sd-042: https://github.com/stellar-experimental/stellar-raven/issues/130#issuecomment-5606027493
- sd-042: https://github.com/stellar/stellar-docs/issues/2770#issuecomment-5606027983
- sd-042, sd-047: https://github.com/stellar/stellar-docs/pull/2806#issuecomment-5606028449
- sd-047: https://github.com/stellar-experimental/stellar-raven/issues/132#issuecomment-5606028913
- sd-047: https://github.com/stellar/stellar-docs/issues/2805#issuecomment-5606029417

The resolver removed the active sd-039, sd-042, and sd-047 files and both existing intake overrides.
It appended three complete receipts in `improvements/resolved.json`.
The active collection now contains 67 findings: 64 reported upstream and three declined upstream.
The root replaced four active-file root-cause pointers with resolved-ledger references and the source commit.
The sk-024 sibling reference now points to the sd-039 receipt; its production acceptance remains open.
The root removed the completed Docs TODO and retained unrelated TODO entries.
Historical research, round notes, archived corpus, and dated corroboration rows remain unchanged.
The compiler regenerated 500 cases, the 30-case sample, and the lifecycle registry.
Compiled content SHA-256: `631a03338681f8846866f5ee5e5830dacab4c8ed70611bfe0a08fa164c14aad7`.
Seven clusters and the Stellar base fee floor reopened after pointer-only changes.
The same sibling sweep confirms consistency; no judge-facing value changed during terminal cleanup.

The root also posted and read back the three skill handoff updates.
- #136: https://github.com/stellar-experimental/stellar-raven/issues/136#issuecomment-5605813696
- #140: https://github.com/stellar-experimental/stellar-raven/issues/140#issuecomment-5605813976
- #138: https://github.com/stellar-experimental/stellar-raven/issues/138#issuecomment-5605814294

Final cleanup review, CI, and merge remain pending at this checkpoint.
Raven #130 and #132 stay open until the terminal receipts merge.
No deployment or paid QA ran.

Final local validation passed: typecheck, 1995 tests in 108 files, build, and 85 smoke tests in four files.
Eval self-tests and the unchanged routing gate passed.
The historical plan regression remains 93/100 required-covered with a 0.95 mean on-plan ratio.
Corpus lint passed with zero errors and 64 warnings; the same expired-caution heuristic warnings remain.
The consistency register check and live improvements lint passed with 67 active findings.
Probes reported seven recurrences, two fixed candidates, zero inconclusive results, and zero errors.
The complete CI generation sequence produced no unrelated artifact changes and the same compiled corpus digest.
The root independently compared each final owned case against `25d8d8f`: only the root-cause receipt pointer changed.
Grok 4.6 high completed the independent final cleanup gate with PASS.
The reviewer independently verified the three public source blobs, seven comments, generated cases, register hashes, and retained TODO headings.
All review findings are reconciled. CI and merge remain the final repository gates.
