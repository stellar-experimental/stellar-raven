> Archive note (orchestrator, 2026-10-09): the linked files sit beside this report.
> `measurement-summary.json` is a compact copy of `tmp/routing2/summary.json`: lane totals, gate failures, and every
> graded row for all eight runs. Per-row order and score detail, the six full candidate runs, and
> `candidate1.patch` are in the owner's local archive `eval/results/2026-10-09-routing-design-evidence.tar.gz`.
> Other `tmp/` paths below lived in the removed lane worktree. The acceptance helper wrote checks 1–9 and 11 only.
> Checks 10 and 12 were added by hand and verified against the routing JSON (`independent-audit.md`, finding 1).

# Routing design lane — 2026-10-09

## Result

**No candidate passes all 12 acceptance checks.**
I tested three general candidates, then stopped at the requested limit.
Candidate 1 remains uncommitted in `/Users/kalepail/Desktop/raven-routing2`.
It fails checks **7, 8, 10, and 12**.
Do not merge or deploy this candidate.

The initial tree was clean at `38256e61d80461fed85b609c6f64a063755b1470`.
I restored every inventory file to that revision's accepted source.
The final catalog contains the candidate's generated fields on those accepted sources.
I kept all gate values, gate fingerprints, case labels, skill pins, and exposure policy unchanged.
I made no commit, push, GitHub write, deployment, or paid model call.

The design precedes implementation in [routing-design.md](routing-design.md).
It records the six root mechanisms and all three revisions.
The candidates use field provenance, token structure, and general selection rules.
They add no operation-specific rule, question exception, query exception, or tuned token-length threshold.

| Candidate | General model | Disposition |
| --- | --- | --- |
| 1 | Whole content anchors; separate phrase alternatives; separate title evidence; schema ranking only; complete candidate competition | Retained as the best incomplete candidate |
| 2 | Corroborated partial coverage; procedural action evidence; distinct-vocabulary phrase budget | Rejected; additional acceptance failures and a skills-floor failure |
| 3 | Shared grammatical forms; strict coverage; procedural evidence; score-based replacement across complete pools | Rejected; loses more legacy and extended coverage |

Candidate 1 retains the strong Docs controls and all eight fixture-presence checks.
It also preserves the leaderboard and RFP improvements.
Candidates 2 and 3 lose additional required controls.
Candidate 1 still causes extensive regressions, so this selection supplies an implementation artifact, not acceptance.

### Sources and complete measurements

Each candidate ran against both source snapshots on all 544 rows.
The denominator contains 338 legacy, 122 extended, 23 skills, 49 holdout, and 12 protocol-history rows.
Each lane retains its own totals.

The fresh refresh returned Scout `1.9.72`, 41 upstream operations, and 674 Docs titles.
Lumenloop and Docs settings remained unchanged.
The fresh builds excluded `GET /api/hackathons/review` and exposed 32 Scout operations.
The final tree restores Scout `1.9.61`, 666 Docs titles, and 30 Scout operations.
The final tree contains no fresh-source exposure change.

`L` and `E` contain top1/top3/top5/cardHit5 counts.
`H` contains top1/top3/top5/forbidden-capture counts.
Grade and order changes compare each run with unchanged current main.
The grade count follows the supplied `rdiff.mjs` flags.
Protocol-history target-rank changes remain a separate diagnostic.

| Run | L | E | Skills top1 | H | Grade / order changes |
| --- | --- | --- | ---: | --- | --- |
| Main baseline | 219/298/326/112 | 93/111/117/16 | 17 | 12/26/29/10 | 0 / 0 |
| Fresh baseline | 220/295/325/111 | 93/112/117/16 | 17 | 12/26/29/10 | 7 / 80 |
| Candidate 1, main | 224/271/316/81 | 84/100/116/10 | 17 | 18/37/41/16 | 220 / 543 |
| Candidate 1, fresh | 226/272/316/81 | 84/101/116/10 | 17 | 18/37/41/16 | 218 / 543 |
| Candidate 2, main | 236/290/313/106 | 85/102/114/8 | 16 | 19/34/40/14 | 202 / 542 |
| Candidate 2, fresh | 236/290/313/106 | 85/103/114/8 | 16 | 19/34/40/14 | 202 / 543 |
| Candidate 3, main | 230/281/289/92 | 74/96/102/6 | 18 | 18/39/41/20 | 223 / 544 |
| Candidate 3, fresh | 230/281/289/92 | 74/96/102/6 | 18 | 18/39/41/20 | 224 / 544 |

All six candidate runs fail the unchanged routing gate.
Every candidate changes the generated manifest fingerprint.
Each also fails numeric requirements, so a fingerprint change cannot repair the failure.
The legacy gate enforces an absolute ±3 band, including upward changes.

Fresh-versus-main comparisons hold each candidate fixed.
Candidate 1 changes four grade rows and 23 orders.
Candidate 2 changes one grade row and 21 orders.
Candidate 3 changes one grade row and 14 orders.
[measurement-summary.json](measurement-summary.json) retains the lane totals, gate failures, and every graded row. The local archive keeps the full per-row orders and scores.

### All 12 checks for the retained candidate

Both source snapshots produce the following verdicts.
The evidence uses [selected-main-acceptance.json](selected-main-acceptance.json) and [selected-fresh-acceptance.json](selected-fresh-acceptance.json).

| Check | Result | Evidence and limit |
| --- | --- | --- |
| 1. Retain YieldBlox and Reflector intent | PASS, controlled checks | The fair-allocation probe retains both terms. The incident query reaches `scout.searchResearch`. |
| 2. Generic words cannot route alone | PASS | `through`, `network`, `each`, and `walk through` exclude `scout.searchResearch`. |
| 3. Repository anchor for `explainRepo` | PASS | `contract` excludes it. The repository-and-code query includes it. |
| 4. Added `use` cannot promote briefing | PASS | Account-merge Docs remain present. `hackathonBrief` remains absent. Stopword evidence cannot supply coverage. |
| 5. No `has` inside schema `phase` | PASS | Adding `phase` leaves both combined probes at 45. Generic schema-only evidence returns null. |
| 6. Strong Docs compete with five weak gated rows | PASS | The synthetic five-row control passes. Staking Docs and wallet Docs remain present. |
| 7. Eight regression rows retain clean grades | **FAIL** | The presence fixture passes, but three original rows lose accepted rank or card grades. |
| 8. RWA discovery excludes implementation | **FAIL** | Four negative queries capture RWA. Three are the existing mixed-intent controls. |
| 9. Leaderboard and RFP improvements remain | PASS | Both original corpus rows retain their exact cards and rank their target operation first. |
| 10. Routing gates and extended non-regression | **FAIL** | Legacy top3/top5 fall. Holdout captures rise to 16. Every extended strict count falls. |
| 11. Controlled directory vocabulary | PASS | All three category controls and the region control retain the vocabulary operation. |
| 12. Fresh-source acceptance | **FAIL** | Blend, RWA overview, and payroll fail current-main grades. Numeric failures prevent fingerprint-only acceptance. |

Check 1 does not certify the expired protocol-history epoch.
The accepted and fresh sources already omit literal `yieldblox` and `reflector` routing tokens.
The fair-allocation probe supplies the controlled retention evidence.
Protocol-history v2 reports `source-expired` and scores no questions.

Check 7 requires more than the existing test's top-five presence assertion.
The original eight-row IDs come from the September 3 routing review.
The checker compares their complete current-main rank and card flags.

| Original row | Lost current-main grade, main and fresh |
| --- | --- |
| `q-defi-rwa-scf-similar` | top3 |
| `q-protocol-parallel-execution` | cardHit5 |
| `q-soroban-reentrancy` | top3 and cardHit5 |

The strict content gate and new competition model change almost every result order.
They do not preserve accepted service and card selection.
These losses belong to the complete candidate.
I did not isolate one component as their sole cause.

For check 12, the standards comparison retains Docs inside the top three.
Blend alternatives lose Lumenloop from the top five.
RWA overview loses Lumenloop from the top five.
Payroll retains similar-submission search at rank four, below its required top-three position.
`reviewSubmission` cannot rank because the fresh manifest excludes it.
That exclusion does not establish a safe scoring contract for later exposure.

### RWA controls and the dApp override

The retained candidate passes all four positive RWA discovery controls.
It excludes the basic Friendbot, RPC, WASM, simulation, and balance questions.
It still admits shared topic evidence without recognizing the requested implementation action.
Its plural-only matcher also misses the issuing/issue exclusion relationship.

| Negative control | RWA rank, main and fresh |
| --- | ---: |
| Custom-token walkthrough | 5 |
| Simulate a tokenized-bond transfer through RPC | 5 |
| Read a wallet balance for tokenized treasury assets | 2 |
| Asset-issuer transfer-fee, supply-cap, and freeze question | 3 |

Candidates 2 and 3 make all three existing `it.fails` assertions pass.
Those suites therefore report unexpected passes for the three markers.
Candidate 2 still captures the custom-token walkthrough.
Candidate 3 clears all listed RWA controls but fails other required checks.
The final candidate retains all three expected failures and leaves their markers unchanged.

I removed the dApp override temporarily through its source file, then rebuilt both snapshots.
Each ablation covers all 544 rows.
Each has zero grade changes and one order change.
The changed row is `q-ti-bindings-to-nextjs-integration`.
The dApp score rises from 153 to 173, and its rank changes from four to three.
The query contains `also`, which matches the added sentence's complete `also` token.

Thus, the original short-token failures disappear, but the appended sentence still affects ranking.
The candidate does not justify removing the override now.
I restored `scripts/description-notes.mjs` byte-for-byte.
The [main](dapp-main-diff.txt) and [fresh](dapp-fresh-diff.txt) differences retain the full evidence.

## Files changed

- `src/catalog/search-tokens.ts`: shared tokenization, stopwords, and plural canonicalization.
- `src/catalog/vendor/search-scoring.ts`: shared gated and ungated field matcher.
- `src/catalog/scoring.ts`: separate phrase alternatives, title evidence, and schema rank contributions.
- `src/catalog/search.ts`: complete candidate competition and complete identity fallback.
- `src/catalog/extract-routing-phrases.ts`: retain singleton keyword atoms within the fair phrase budget.
- `src/catalog/types.ts`: add `titleKeywords` and document evidence fields.
- `scripts/build-catalog.mjs`: preserve title provenance and derive vocabulary from retained phrases.
- `catalog/manifest.json`: rebuild candidate fields on accepted current-main sources.
- `test/search-evidence-model.test.ts`: seven meaningful short-token, schema-isolation, and admission controls.
- `src/catalog/README.md` and `ARCHITECTURE.md`: describe the experimental working-tree behavior and failed acceptance.

The final tree restores inventory, exposure policy, the dApp override, skill pins, cases, and gates.
The generated manifest SHA-256 is `1f662023712d19cf57eb20130b32f4d8e8f4cf6deb517bcd3b76ac511e812d42`.
All 80 searchable exact identities remain first in search.
The final routing rerun exactly reproduces candidate 1 across all 544 rows.

## Checks run

All gate commands ran without pipes.
The comparison commands redirected only their complete diagnostic output into evidence files.

| Command | Exit | Result |
| --- | ---: | --- |
| `npm ci` | 0 | Installed 279 packages. The hook setup could not write the linked Git configuration. |
| `npm run typegen` | 0 | Generated types from placeholder `.dev.vars`. Wrangler could not write its external log file. |
| `npm run eval:compile` | 0 | Regenerated unchanged routing cases. |
| `npm run eval:selftest`, initial | 0 | Baseline checks passed. |
| `npm run eval:routing -- --gate`, initial main | 0 | Accepted baseline passed. |
| `node scripts/refresh-inventory.mjs` | 1 | The worktree lacked `LUMENLOOP_API_KEY`. |
| `node --env-file=/Users/kalepail/Desktop/stellar-raven-codemode/.env scripts/refresh-inventory.mjs` | 0 | Refreshed all sources without copying or printing credentials. |
| `node scripts/build-catalog.mjs` | 0 | All final candidate/source builds passed. |
| `npm run eval:routing -- --gate`, fresh baseline | 1 | Fingerprint mismatch. |
| `npm run eval:routing -- --gate`, six candidate runs | 1 each | Fingerprint and numeric failures. |
| `npm run eval:routing -- --gate`, two dApp ablations | 1 each | The candidate's failures remain. |
| `npm run eval:routing -- --gate`, final main | 1 | Reproduced candidate 1 exactly. |
| `node /private/tmp/claude-501/rdiff.mjs <before> <after>` | 0 each | Compared every row for each candidate and source pair. |
| `node tmp/routing2/acceptance.mjs selected-main` | 0 | Wrote evidence; acceptance failures remain in the JSON. |
| `node tmp/routing2/acceptance.mjs selected-fresh` | 0 | Wrote evidence; acceptance failures remain in the JSON. |
| `npx vitest run test/search-evidence-model.test.ts` | 0 | Seven tests passed. |
| `npx vitest run test/drift-141-routing.test.ts test/routing-evidence.test.ts test/extract-routing-phrases.test.ts` | 1 each | Candidate 1: nine failures. Candidate 2: 17. Candidate 3: 13. |
| `npx vitest run test/drift-141-routing.test.ts test/routing-evidence.test.ts test/extract-routing-phrases.test.ts test/search-evidence-model.test.ts` | 1 | Selected fresh: 59 passed, nine failed, three expected failures. |
| `npm run typecheck`, final | 0 | Passed. |
| `npm test`, final | 1 | 2,403 passed, 34 failed, three expected failures across 137 files. |
| `npm run build`, final | 0 | Worker dry-run build passed. |
| `npm run eval:selftest`, final | 1 | Candidate manifest fingerprint differs from the unchanged gate evidence. |
| `npm run eval:qa:lint -- --stale --enforce-floors` | 0 | Zero errors and 62 warnings. No paid evaluation ran. |
| `npm run eval:protocol-history` | 1 | Both v2 contracts are `source-expired`; no question was scored. |
| `npm run secrets:scan -- --tree` | 0 | Tracked-file scan and Gitleaks passed. |
| `node tmp/routing2/summarize.mjs` | 0 | Verified complete 544-row comparisons and wrote the summary. |
| `git diff --check` | 0 | Passed. |
| `git diff --exit-code -- inventory eval/gates.json eval/routing-cases.json eval/holdout-cases.json eval/skills-cases.json ecosystem-skills scripts/description-notes.mjs src/policy/scout-exposure.ts` | 0 | Confirmed the final restoration. |

The full test failures include actual ranking, alias, skill-capability, recovery, and rendered-example regressions.
Other failures reflect changed phrase and count contracts.
I left the existing assertions intact instead of accepting these changes through test updates.
No executor or demo source changed, so I did not run the additional smoke lane.

Three setup mistakes also failed before correction.
The first backup attempted to copy an absent `env.d.ts`.
A main-source build temporarily retained the fresh-only review exclusion and correctly failed its exposure guard.
The first new test fixture lacked required catalog fields, so typecheck failed once before correction.
These failures did not produce accepted results.

## Evidence paths

All paths below are relative to `/Users/kalepail/Desktop/raven-routing2`.

| Evidence | Path |
| --- | --- |
| Design and revision history | `tmp/routing-design.md` |
| Complete counts and row comparisons | `tmp/routing2/summary.json` |
| Baselines | `tmp/routing2/baseline-main.json`, `tmp/routing2/baseline-fresh.json` |
| Six candidate measurements | `tmp/routing2/c{1,2,3}-{main,fresh}.json` |
| Full supplied-script differences | `tmp/routing2/c{1,2,3}-{main,fresh,source}-diff.txt` |
| Candidate source snapshots | `tmp/routing2/c1-source/`, `tmp/routing2/c2-source/`, `tmp/routing2/c3-source/` |
| Generated candidate manifests | `tmp/routing2/c{1,2,3}-{main,fresh}-manifest.json` |
| Final acceptance evidence | `tmp/routing2/selected-main-acceptance.json`, `tmp/routing2/selected-fresh-acceptance.json` |
| Exact identity check | `tmp/routing2/exact-identities.json` |
| Final routing reproduction | `tmp/routing2/selected-main.json`, `tmp/routing2/selected-reproduction-diff.txt` |
| Final source and inventory hashes | `tmp/routing2/final-receipt.json` |
| dApp source and result evidence | `tmp/routing2/dapp-source-delta.json`, `tmp/routing2/dapp-{main,fresh}-diff.txt` |
| Full test and build logs | `tmp/routing2/selected-main-full-test.log`, `tmp/routing2/selected-main-build.log` |
| Routing and focused-test logs | `tmp/routing2/*-routing.log`, `tmp/routing2/*-focused.log` |
| Fresh source snapshots | `tmp/routing2/fresh/inventory/` |
| Original files for comparison | `tmp/routing2/original/` |
| Prior evidence archive extraction | `tmp/routing2/prior/routing-repair/` |
| Measurement helpers | `tmp/routing2/acceptance.mjs`, `tmp/routing2/source-mode.mjs`, `tmp/routing2/summarize.mjs` |

The initial acceptance helper wrongly required named tokens in sources that already omitted them.
The final helper uses the controlled fair-allocation probe for check 1.
The initial check 7 used only fixture presence.
The final helper also compares all eight original corpus rows against current-main grades.
Use the `selected-*` acceptance files for the final verdicts.
Earlier candidate acceptance files retain the original, weaker probe output.

## Proposed TODO text

Add this under the existing structured-routing item:

> The 2026-10-09 design pass tested three general candidates on both source snapshots, covering all 544 rows per run.
> None passes all 12 checks.
> The retained candidate fails checks 7, 8, 10, and 12.
> Whole-content anchors eliminate the original unrelated short-token triggers.
> Field provenance prevents schema substrings from supplying coverage.
> Complete candidate competition restores the strong Docs controls.
> However, accepted rank and card grades regress substantially.
> The eight-row presence fixture does not prove check 7; compare complete grades for the original eight IDs.
> Two procedural variants clear the three mixed RWA controls but fail other acceptance checks.
> Keep the RWA and quality exclusions, fresh-source hold, and dApp override.
> No routing baseline change is justified.
> Evidence: `tmp/report-routing.md` and `tmp/routing2/` in the routing lane worktree.

Add this under the existing short-token repair item:

> The local anchored matcher passes the original weather/billing triggers and intended controls.
> Its complete Raven candidate fails the routing gates.
> Keep `cs-001` open; this result does not establish an accepted local or upstream repair.

No `.agents/**` file changed.
No new upstream finding was verified, and no existing finding changed status.

## Risks

The retained candidate is deliberately incomplete and unsafe to accept.
Its grade changes affect 220 current-main rows and 218 fresh-source rows.
Its new title field changes the generated catalog contract.
It also changes total-count semantics, recovery ordering, and some published example outputs.
The remaining partial-token ranking can still reward unrelated words after a valid field anchor.
The plural-only matcher misses valid word forms.
The source phrase cap can still discard complete phrases; the controlled retention probe is not a universal guarantee.
Offline routing does not establish answer quality.

## Blockers

Checks 7, 8, 10, and 12 block acceptance.
The full unit suite also has 34 failures.
The three-candidate allowance is exhausted.
Independent review remains outstanding; no candidate qualifies for final acceptance review.
The final worktree retains candidate 1 and accepted inventories for the orchestrator's inspection.
