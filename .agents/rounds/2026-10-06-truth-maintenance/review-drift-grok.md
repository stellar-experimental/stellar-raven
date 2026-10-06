# Independent drift review — issue #223

Reviewer: Grok. Candidate: `drift/2026-10-06-scout` at `c76b517c`. Base: `origin/main` `c06dadbd`. This review did not edit a tracked file.

## Verdict

**approve-with-changes**

The exposure choice is sound. The catalog rebuild matches the committed manifest. The test suite is red. Three updates are required before merge.

1. Update the twelve stale test pins. Keep every assertion that is not about this surface.
2. Update the catalog SHA-256 in `eval/gates.json`. Do not lower a numerical floor.
3. Change `eval/README.md:7` from `1.9.61` to `1.9.71`.

## gates.json

Do not lower the floors. The measured legacy totals are top1 220, top3 295, and top5 325. cardHit5 is 111.

The band is `Math.round(338 * 1 / 100)`, which is 3. `eval/run-routing.mjs:411-413` fails only when the absolute delta is greater than the band. The top3 delta is 3. That value is inside the gate. cardHit5 is not a gated metric.

Update `eval/gates.json:9` to `a942736a019e48ab5d36b8f7c674f3e74add07188500cc90273f15393666ae11`. Record the measured totals in the note. The top3 drop is not an intended improvement.

The current file fails `--gate` only because the fingerprint is still `efea602c3ea4f0e66e3f58273e0827e79cbaaa566430d267204fbaaf9e93afe6`. Skills stay at 17. Holdout stays at 12, 26, 29, with 10 forbidden captures.

## Claims

1. **Partly false.** Live OpenAPI and the inventory are Scout `1.9.71`. The inventory adds three GET operations and removes none. The text diff changes twelve existing operations, not thirteen. Lumenloop and Stellar Docs are unchanged on surface, text, and deep.

2. **True.** The only runner declares three Lumenloop operations. `src/skills/runners/stellar-ecosystem-digest.ts:127-131`.

3. **True for this commit.** The two new reads are exposed. `reviewSubmission` stays excluded. That exclusion is the right call here. A later exposure needs a general routing repair first.

4. **True.** `scout.analyzeHackathonSubmissions` is `broad` by override. `scout.getHackathonSubmission` is `detail` by the `get` prefix.

5. **True on the numbers.** A fresh routing run shows the same seven graded flips. Legacy totals are 220, 295, 325, and cardHit5 111. Skills, holdout, and protocol-history totals match main. Five flips are real regressions. Two flips are improvements. The author left `eval/gates.json` unchanged. That fingerprint update is still required. A floor change is not.

6. **True.** `stellar-dev` moved to `d9ca04bf07d16ef414816ae1a7666f2f366c8704`. One skill file changed. The catalog snapshot grew from 62 entries to 63. `ecosystem-skills/PIN-REVIEW.md:392-404` records the review. `node scripts/check-pin-review.mjs --base origin/main` exited 0.

## Findings

### 1. High — `npm test` exits 1

Evidence: `/tmp/drift-test.log`. Result: 12 failed, 2403 passed, 3 expected fail. Exit code 1.

The failures are stale pins for 32 Scout operations and for the new hackathon fields. Update the expected values. Do not drop the zero-counts for hidden operations.

- `test/catalog.test.ts:316` expects 30 Scout operations and receives 32. The comment at lines 306–316 still says 37 upstream operations.
- `test/catalog.test.ts:439` expects `searchHackathonBuilds` input keys `limit`, `q`, `track`, `winnersOnly`. The catalog also has `category`, `hackathon`, `mode`, and `package`.
- `test/catalog.test.ts:589` and `:611` omit `scout.analyzeHackathonSubmissions` and `scout.getHackathonSubmission`. Those lists must still omit `reviewSubmission`.
- `test/live-cases.test.mjs:40` expects 64 callable tools and receives 66.
- `eval/qa/plain-operation-harness.mjs:26` and `:84` expect 60 operations and Scout count 30. The run receives 62 and 32. `test/plain-operation-harness.test.mjs:15` calls that check.
- `test/super-spec.test.ts:154` expects Scout 30. `:204` expects 60 catalog operations. `:537` has the same input-key list as `test/catalog.test.ts:439`.
- `test/search.test.ts:1489` omits three compacted ids: `scout.analyzeHackathonSubmissions`, `scout.compareHackathons`, and `scout.getHackathonSubmission`. `compareHackathons` is an existing operation. Its output grew with the new profile fields in `inventory/stellar-light.json:5-6`. The threshold rule still holds. The pin list is stale.
- `test/search.test.ts:1040` and `test/drift-141-routing.test.ts:270` expect `page.total` 6 and receive 8.

The page-total change is a larger gated pool. On that category query, the new gated ids are `scout.searchHackathonBuilds` and `scout.analyzeHackathonSubmissions`. Main has six gated hits. The candidate has eight. In `test/search.test.ts`, the assertions before line 1040 still pass. The page backfill is still only `lumenloop.get_categories`. The Lumenloop count on the page stays at most 2. `page.total` is the gated-pool size when the page is full. Update the pin from 6 to 8. This is not a broken page.

### 2. Low — the routing-text count is twelve

Evidence: `node scripts/diff-inventory.mjs text HEAD~1:inventory/stellar-light.json inventory/stellar-light.json`. Output: `/tmp/drift-text-stellar-light.txt`. Exit code 1.

Twelve existing operations change routing text: `getClusters`, `listContracts`, `hackathonBrief`, `getHackathons`, `searchHackathonBuilds`, `compareHackathons`, `getHackathon`, `getRepoTrust`, `getRfps`, `scfPitch`, `listSkills`, and `vetIdea`.

Three operations are new: `analyzeHackathonSubmissions`, `getHackathonSubmission`, and `reviewSubmission`.

`GET /api/research` is absent from that text diff. Its `sources` parameter description grows from 830 characters to 1062. The parameter names stay the same. Deep mode also reports component drift. `Meta` gains `failedReads` and `partial`, and its `warnings` description changes. `HackathonDetailResponse.properties.hackathon.properties` changes. No component is added or removed.

### 3. Low — current docs still name Scout 1.9.61

`eval/README.md:7` says the committed Scout inventory version is `1.9.61`. The candidate inventory is `1.9.71` at `inventory/stellar-light.json:16565`. Update that current sentence.

Dated notes can stay. `src/adapters/scout.ts` still describes the 2026-10-01 `Meta.warnings` measurement. `warnings` is still an array of strings. `src/policy/argument-aliases.ts` still describes the comma alias on `source`. That parameter description did not change. `improvements/skills/sk-027-scout-skill-stale-skills-catalog.md` is a dated recheck at 62 entries. The new snapshot has 63. `improvements/stellar-light-scout/sls-089-project-search-failed-read-zero-count.md` still matches a search response of `200` only.

Active QA goldens that name `getHackathon` still ask for winners and placement. They do not deny `rules` or `profile`. No golden edit is required for the stored DoraHacks copy.

### 4. Medium — the leak guard misses two spellings

This snapshot does not leak. `catalog/manifest.json` does not contain `reviewSubmission` or `/api/hackathons/review`. The off-tree rebuild is byte-identical. SHA-256 `a942736a019e48ab5d36b8f7c674f3e74add07188500cc90273f15393666ae11`. `node scripts/build-catalog.mjs --out /tmp/manifest-rebuild.json` exited 0. Exposed Scout operations: 32. The build excludes `GET /api/hackathons/review`.

`scripts/build-catalog.mjs:1149-1180` catches `scout.reviewSubmission`. `scripts/emitted-text-guard.mjs:47-57` catches the raw path. A local probe confirms both throws.

The same probe shows three misses:

- A bare `reviewSubmission` in a description, a keyword, or a routing phrase does not throw.
- `routingExclusions` is outside the scanned fields at `scripts/build-catalog.mjs:1157-1168`.
- `scripts/description-notes.mjs:156-157` rewrites paths with `split` and `join`. The excluded path extends the exposed path `/api/hackathons`. The probe input `See GET /api/hackathons/review before you apply.` becomes `See scout.getHackathons/review before you apply.` Both guards then pass.

This is residual risk. It does not block this snapshot. Fix the path rewrite before a later description names that excluded path.

`Meta.warnings` still names `getQualityReport`, `verifyClaim`, and `getRwaAssets`. Those bare names are already in the `origin/main` catalog. This commit does not add that class. `reviewSubmission` is not in that sentence.

### 5. Exposure — no change required

All three new operations are GET. Live OpenAPI `1.9.71` and the inventory agree. `x-side-effecting` is absent. Security is absent.

- `analyzeHackathonSubmissions` at `inventory/stellar-light.json:6722`. Responses: 200, 400, 503. It counts stored submissions. The `broad` override at `eval/plan/build-op-classes.mjs:79` matches `analyzeEcosystem`. The `analyze` prefix is not in the prefix map.
- `getHackathonSubmission` at `inventory/stellar-light.json:7756`. Responses: 200, 400, 404, 503. One submission by id. `eval/plan/op-classes.json` classifies it as `detail`.
- `reviewSubmission` at `inventory/stellar-light.json:8603`. Responses: 200, 400, 404, 503. One required `link`. The exclusion is `src/policy/scout-exposure.ts:24-26`.

Exposing the two reads matches ADR-0003. They are read-only GETs with no side-effect marker.

Excluding `reviewSubmission` is justified. In `tmp/2026-10-06-maintenance/routing-diff-full.txt:188-191`, full exposure ranks `scout.reviewSubmission` first on `q-pc-sequence-numbers-ordering-replace`. That question is about Stellar sequence numbers. The collision is the word "submissions". In the same file at lines 111–114, that operation also removes the payroll card and the payroll top5 hit. The candidate exclusion removes both of those extra graded flips.

A scoring repair is the better later option. It is not a better option inside this refresh. The exclusion comment already requires that repair before exposure. A host catalog note is a known bad local fix. The `eval/gates.json` note records a trial note that moved 12 graded rows.

The four author ablation diffs list the same seven graded flips as the candidate. This review did not rebuild those exposure variants.

## Routing judgments

Fresh dumps: `eval/results/routing-2026-10-06T14-21-06-721Z.json` and `eval/results/routing-2026-10-06T14-21-12-832Z.json`. Graded flips: 7. Holdout graded flips: 0. Protocol-history graded flips: 0. The protocol diagnostic fails on main and on the candidate. Both report target 7 of 8 and control captures 3 of 4.

Strict grading ignores `expected_any`. Ranks below are from `tmp/2026-10-06-maintenance/routing-diff-candidate.txt`.

1. `q-defi-agentic-payment-standards-compare`. top3 true to false. `stellarDocs.search_docs` falls from rank 3 to rank 4. `scout.searchHackathonBuilds` takes rank 3. Real regression. The label is still correct.
2. `q-defi-blend-alternatives`. top5 true to false. `lumenloop.search_content_semantic` leaves the top 5. `scout.getClusters` takes rank 5. Real regression. The label is still correct.
3. `q-defi-rwa-overview`. top3 true to false. `scout.getHackathon` takes rank 3. Its new example names "Stellar Hacks: Real-World ZK". That matches "real-world". Real regression. The label is still correct.
4. `q-defi-stellarx-what-is`. top1 false to true. `lumenloop.search_content_semantic` becomes rank 1. Improvement. The label is correct.
5. `q-defi-streaming-payments-prior-art`. cardHit5 true to false. `scout.searchRepos` leaves the top 5. `scout.vetIdea` takes rank 3. The service top5 is still Scout. Real card regression. The label is still correct.
6. `q-scf-funded-similar-payroll`. top3 true to false. `scout.vetIdea` takes rank 3. Its example is a payroll app that pays contractors in USDC. `lumenloop.find_similar_scf_submissions` falls to rank 5. Real regression. The label is still correct. This residual remains after the `reviewSubmission` exclusion.
7. `q-edge-scf-v7-centralization-myths`. top3 false to true. `scout.scfPitch` rises to rank 2. Service improvement. The label is still correct. The card stays a miss.

Extended strict top3 moves from 111 to 112 because of flip 7. The author did not claim that extended totals stay flat.

## Commands

| Command | Exit |
| --- | --- |
| `npm run typecheck` | 0 |
| `npm test` | 1 |
| `npm run secrets:scan -- --tree` | 0 |
| `npm run eval:compile` | 0 |
| `npm run eval:routing` on the candidate | 0 |
| `npm run eval:routing` on the main manifest | 0 |
| `node scripts/build-catalog.mjs --out /tmp/manifest-rebuild.json` | 0 |
| `node scripts/check-pin-review.mjs --base origin/main` | 0 |
| `node scripts/diff-pins.mjs` old manifest to new manifest | 0 |
| Lumenloop surface, text, and deep versus `HEAD~1` | 0, 0, 0 |
| Stellar Docs surface, text, and deep versus `HEAD~1` | 0, 0, 0 |
| Scout surface, text, and deep versus `HEAD~1` | 1, 1, 1 |

Both routing runs print one advisory gate failure. The failure is the catalog fingerprint only. The candidate manifest SHA-256 is `a942736a019e48ab5d36b8f7c674f3e74add07188500cc90273f15393666ae11`.

The skill diff is only `stellar-dev/standards/ecosystem.md`. It adds a Stellar Registry reference. It renames Aha Labs to The Aha Company. The diff has no prompt injection, no gateway capability claim, and no non-exposed Raven operation.

This review did not run `node scripts/check-mirrors.mjs --fetch`.
