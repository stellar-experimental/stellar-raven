# Lane C report — 2026-10-02-routing-adapter-repairs

## 1. Change

The expanded protocol probe now returns `scout.listSkills` at rank 3 with score 207.
The final candidate has zero graded routing regressions against `origin/main`.

| File | Change |
|---|---|
| `src/catalog/scoring.ts` | Prepare acronym alternatives and use them when ordinary lexical coverage fails. |
| `test/scoring.test.ts` | Test general acronyms, source evidence, rejection boundaries, score preservation, aliases, and the original discovery probe. |

The rule uses initials from three to six consecutive content words.
Stopwords, numbers, and single-letter tokens end a candidate span.
The entry description must contain the complete uppercase acronym.
Derived keywords cannot supply this evidence.
Both scoring paths use the same gated admission decision.
An entry with sufficient lexical coverage keeps its previous score.

The vendor scorer, Scout inventory, generated catalog, and gate baseline remain unchanged.
The diff does not change lane A's keyword logic.
All changes remain unstaged. No commit, deployment, paid evaluation, or external write occurred.
The pre-existing untracked round directory remains untouched.

## 2. Rationale

General rule: Use a source acronym to recover missing lexical coverage for the corresponding consecutive word initials.

This rule needs no protocol dictionary, query-specific alias, service mapping, or upstream description edit.
It applies to DNS, URL, RPC, MCP, and other source acronyms through the same mechanism.
The existing query preparation owns this adjustment.
The vendor header preserves upstream scoring math; the local replica also documents that policy.
The final candidate preserves both files' existing scoring math.

I measured two alternatives before selecting the final rule:

1. Require a minimum shorter-prefix length of three in the vendor scorer and its local replica.
   This removed the `any`/`an` prefix match, but it did not recover the probe.
   It also failed the routing gate and introduced graded regressions.
   The original files replaced this rejected experiment.
2. Maximize scores over source-backed acronym alternatives for every entry.
   This recovered the probe and passed the aggregate gate.
   However, one existing case lost both its strict and accept-either top-1 grades.
   Score inflation on already admitted entries caused that regression.
   The final rule follows the existing fallback design and only repairs missing coverage.

Rejected source snapshots and measurements remain under `tmp/lane-c-evidence/`.

## 3. Measurements

Baseline HEAD and `origin/main`: `76c7f02be5fba31c4377f067f37412bb6e5b9d4b`.
The baseline ran before any tracked source edit.
All candidate runs used the same manifest hash:
`15a4fe9fe4c5f741a26a39e7d4037575a05f753e70865ca01dd08abdf2e6ccba`.

### Original probe, first five results

Query: `Are there any model context protocol skills for Stellar?`

| Rank | Baseline entry | Score | Final entry | Score |
|---|---|---:|---|---:|
| 1 | `skills.stellar-light.stellar-scout` | 275 | `skills.stellar-light.stellar-scout` | 275 |
| 2 | `skills.stellar-dev.agentic-payments` | 241 | `skills.stellar-dev.agentic-payments` | 241 |
| 3 | `stellarDocs.search_doc_titles` | 187 | `scout.listSkills` | 207 |
| 4 | `stellarDocs.search_docs` | 187 | `stellarDocs.search_doc_titles` | 187 |
| 5 | `scout.getSkill` | 141 | `stellarDocs.search_docs` | 187 |

All entries in this table use the gated path.
The baseline target had no gated score; its ungated score was 184.
With `limit: 50`, the target moved from rank 25 to rank 6.
Different page limits apply different service quotas, so these ranks do not describe one universal result order.

### Probe and controls

| Query | Baseline target rank, limit 5 | Final target rank, limit 5 | Baseline score | Final score |
|---|---:|---:|---:|---:|
| Are there any model context protocol skills for Stellar? | absent | 3 | null gated; 184 ungated | 207 |
| Are there any MCP skills for Stellar? | 3 | 3 | 207 | 207 |
| What Stellar AI skills can I install? | 3 | 3 | 277 | 277 |
| List Stellar skills | 1 | 1 | 269 | 269 |

The three controls preserve every top-five entry, score, and tier.
The supplied nine-query discovery script also ran before and after the change.
Its two columns compare manifests through the current scorer; they do not compare scorer versions.
The saved baseline run and separate probe artifacts provide the actual before/after comparison.

### Candidate selection

Counts below show strict top-1/top-3/top-5 results.

| Candidate | Probe rank | Legacy /338 | Extended /122 | Skills /23 | Holdout /49 | Forbidden captures | Gate |
|---|---:|---|---|---|---|---:|---|
| Baseline | absent | 219/298/326 | 93/111/117 | 17/23/23 | 12/26/29 | 10 | PASS |
| Prefix minimum three | absent | 229/303/319 | 92/104/109 | 17/23/23 | 13/26/32 | 12 | FAIL |
| Acronym maximum | 3 | 218/298/326 | 93/111/117 | 17/23/23 | 12/26/29 | 10 | PASS |
| Acronym coverage fallback, final | 3 | 219/298/326 | 93/111/117 | 17/23/23 | 12/26/29 | 10 | PASS |

The prefix experiment exceeded all three legacy bands and the holdout forbidden-capture ceiling.
The final totals do not improve the graded battery.
The requested discovery probe improves outside that battery.
Legacy accept-either remains 254/321/337; extended accept-either remains 102/118/121.
Card hits remain 112/182 legacy, 16/28 extended, 23/23 skills, and 29/49 holdout.
Holdout complete passes remain 24/49.

### Per-case grade changes

The comparison checks case identities and manifest hashes before comparing every stored boolean grade.
Counts represent metric changes, so one case can contribute more than one change.

| Candidate | Legacy losses/gains | Extended losses/gains | Skills losses/gains | Holdout losses/gains |
|---|---|---|---|---|
| Prefix minimum three | 67/90 | 51/23 | 0/0 | 9/17 |
| Acronym maximum | 2/0 | 0/0 | 0/0 | 0/0 |
| Final | 0/0 | 0/0 | 0/0 | 0/0 |

The rejected acronym maximum changed `q-scf-vs-sdf-enterprise-fund`: `top1` and `any1` changed from true to false.
The final candidate restores both grades.
It has no per-case hit-to-miss changes across all 532 graded cases.

These final rows change their results or scores without changing a grade:

| Lane | Case IDs |
|---|---|
| Legacy | `q-comp-sep6-vs-sep12-roles`, `q-protocol-amm-cap-0038`, `q-sep-catalog-list`, `q-soroban-sac-vs-custom-token` |
| Extended | `q-crp-tokenize-personal-rwa`, `q-defi-market-making-kelp` |
| Holdout | `q-holdout-a-02-oz-atomic-migration`, `q-holdout-c-10-scf-positioning` |
| Protocol diagnostic | `ph-security-incident-postmortems` |

All 12 protocol diagnostic target ranks remain unchanged.
The existing diagnostic still reports FAIL: 7/8 positive top-five hits and 3/4 control captures.
This diagnostic failure predates the change and does not fail the routing gate.

### Evidence files

- `tmp/lane-c-evidence/baseline.json`: routing result `routing-2026-10-02T15-54-18-949Z.json`.
- `tmp/lane-c-evidence/prefix.json`: rejected result `routing-2026-10-02T15-55-27-088Z.json`.
- `tmp/lane-c-evidence/acronym-max.json`: rejected result `routing-2026-10-02T15-56-27-505Z.json`.
- `tmp/lane-c-evidence/acronym-rescue.json`: result `routing-2026-10-02T15-58-07-848Z.json`.
- `tmp/lane-c-evidence/final.json`: final result `routing-2026-10-02T16-01-14-953Z.json`.
- `tmp/lane-c-evidence/*-probes.json`: full probe IDs, ranks, scores, and tiers for each candidate.
- `tmp/lane-c-evidence/comparison.json`: every changed row and every grade change for all candidates.
- `tmp/lane-c-probe.mjs` and `tmp/lane-c-compare.mjs`: reproducible measurement scripts.
- `tmp/{baseline,prefix,acronym,acronym-rescue}-ranked.json`: ordered routing dumps; these omit holdout rows by runner design.

## 4. Gates

All verification commands ran without a pipe.

| Command | Run | Exit code | Result |
|---|---|---:|---|
| `npm run eval:compile` | Baseline and final | 0, 0 | Generated cases unchanged. |
| `npm run eval:routing -- --gate --dump-ranked tmp/baseline-ranked.json` | Baseline | 0 | PASS |
| `node .agents/rounds/2026-10-02-routing-adapter-repairs/probe-discovery.mjs` | Baseline and final | 0, 0 | Probe recovered. |
| `npm run eval:routing -- --gate --dump-ranked tmp/prefix-ranked.json` | Rejected prefix experiment | 1 | Gate failures recorded above. |
| `npm run eval:routing -- --gate --dump-ranked tmp/acronym-ranked.json` | Rejected acronym maximum | 0 | Aggregate PASS; one case regressed. |
| `npm run eval:routing -- --gate --dump-ranked tmp/acronym-rescue-ranked.json` | Coverage fallback | 0 | PASS |
| `npm run eval:routing -- --gate` | Final | 0 | PASS |
| `npx vitest run test/scoring.test.ts test/search.test.ts` | Focused tests | 0 | 134 passed. |
| `npm run typecheck` | First check | 1 | Array access required an undefined guard. |
| `npm run typecheck` | After guard correction | 0 | PASS |
| `npm test` | First and final checks | 0, 0 | Each: 135 files; 2379 passed; 3 expected failures. |
| `npm run build` | First and final checks | 0, 0 | Dry-run build passed; generated micro-map unchanged. |
| `npm run eval:selftest` | Final candidate | 0 | All checks passed. |
| `node tmp/lane-c-probe.mjs tmp/lane-c-evidence/<candidate>-probes.json` | baseline, prefix, acronym, acronym-rescue, final | 0 each | Saved all four probe measurements. |
| `node tmp/lane-c-compare.mjs` | Final comparison | 0 | Zero final grade regressions. |
| `git diff --check` | Final diff | 0 | PASS |
| `npm run secrets:scan -- --tree` | Final | 0 | All tracked files passed; Gitleaks found no leaks. |

Read-only source inspections, result inspections, and evidence-copy commands returned exit code 0.
The required build command invokes Wrangler's dry-run build script; no standalone Wrangler command or server ran.
Smoke tests do not apply because no executor or demo file changed.

## 5. Risks and open questions

- Initials do not prove semantic equivalence. Different phrases can share an acronym.
  The source witness and missing-coverage requirement limit this risk but do not remove it.
- Only uppercase acronyms with three to six letters qualify.
  Expansions with internal stopwords or numbers do not qualify.
- Query preparation creates additional alternatives; an entry with missing coverage can require additional scoring.
  No production latency claim follows from these offline checks.
- The article-prefix behavior remains upstream-compatible. The rejected restriction needs separate work before adoption.
- The routing battery proves no graded regression for this catalog and these frozen cases.
  It does not prove answer quality or every possible query.
- Lane A changes the same module. The lead must run the combined gates after integration.

## 6. Notes for the independent reviewer

Review remains outstanding; the lead owns that gate under the common brief.
Inspect acronym ambiguity and the decision to preserve scores with sufficient lexical coverage.
Check the two rejected candidate snapshots against their measurements.
Confirm that the vendor scorer and Scout description remain unchanged.
Compare the final row details in `tmp/lane-c-evidence/comparison.json`, including holdout rows.
The supplied discovery script's `base` column uses the current scorer, so use the saved baseline for scorer comparisons.
Re-run the gates after lane A integration; do not change `eval/gates.json` to absorb a regression.

## 7. Review fixes

This section supersedes the earlier candidate description and final measurements.
I read all of `tmp/review-lane-c-grok.md` and repaired its five findings.
The earlier measurements remain above as the rejected candidate's record.

### Edits and finding resolution

| Finding | Repair | Verification |
|---|---|---|
| 1: unrelated acronym hits | Require a content token outside the acronym span that matches the entry ID, name, or description. Reject pure collapses. | All twelve review queries retain their lexical scores across the complete catalog. |
| 1: uppercase ordinary words | Exclude English stopwords, common quantifiers, number words, and instruction emphasis from acronym candidates. | Context-bearing tests reject `NOT`, `ONE`, and `ALL`. |
| 2: score replacement | Leave the ungated path unchanged. Admit an acronym score only when it reaches the existing ungated score. | SAC remains ungated 812, gated null, and rank 1. |
| 3: missing tests | Replace pure-collapse acceptance tests with rejection tests and context requirements. Add SAC and default-page assertions. | Focused suite: 140 passed. Full suite: 2385 passed, 3 expected failures. |
| 4: missing documentation | Add the acronym rescue rule and its constraints to `src/catalog/README.md`. | The README states the coverage, context, score, and preparation limits. |
| 5: unbounded forms | Stop preparation after 32 acronym forms. | A long letter-only query produces exactly 32 forms. |

The scorer retains every content token outside the replaced span.
The existing token-overlap function checks that independent context against source fields.
Derived keyword fields do not provide the context or acronym witness.
The gated scorer preserves existing gated scores and rejects a new score below the original ungated score.
The ungated scorer never evaluates acronym alternatives or takes their maximum.
The revised comment states those behaviors directly.

Tracked changes now comprise `src/catalog/scoring.ts`, `test/scoring.test.ts`, and `src/catalog/README.md`.
The vendor scorer, manifest, gate file, inventory, and Scout description remain unchanged against the pinned base.
No commit occurred. Changes remain unstaged.

### New measurements

The comparison uses pinned base `76c7f02be5fba31c4377f067f37412bb6e5b9d4b`.
The local `origin/main` reference now points to `af740db50158a1e394a7174aed682611749802a3`.
That reference movement does not change this lane's baseline.

Routing result: `eval/results/routing-2026-10-02T16-36-14-818Z.json`.
Saved copy: `tmp/lane-c-evidence/review-fixed.json`.
The manifest hash remains `15a4fe9fe4c5f741a26a39e7d4037575a05f753e70865ca01dd08abdf2e6ccba`.

| Measure | Pinned baseline | Repaired candidate |
|---|---|---|
| Legacy top-1/3/5, /338 | 219/298/326 | 219/298/326 |
| Extended top-1/3/5, /122 | 93/111/117 | 93/111/117 |
| Skills top-1/3/5, /23 | 17/23/23 | 17/23/23 |
| Holdout top-1/3/5, /49 | 12/26/29 | 12/26/29 |
| Holdout forbidden captures | 10 | 10 |
| Holdout complete passes | 24 | 24 |
| Graded hit-to-miss changes | — | 0 |
| Graded miss-to-hit changes | — | 0 |

All 532 graded rows match the baseline, including their ordered result IDs and scores.
One protocol diagnostic row changes its other results: `ph-security-incident-postmortems`.
Its target remains rank 1. All twelve diagnostic target ranks remain unchanged.
The pre-existing protocol diagnostic still reports FAIL with 7/8 positive hits and 3/4 control captures.

Query: `Are there any model context protocol skills for Stellar?`

| Page | Repaired `scout.listSkills` rank | Gated score | Original ungated score |
|---|---:|---:|---:|
| Explicit limit 5 | 3 | 207 | 184 |
| Default limit 10 | 5 | 207 | 184 |

All three control queries retain their limit-5 IDs, scores, and tiers from the baseline.
The probe script now records the default page as well as limits 5 and 50.

SAC query: `Should I launch a token as a Stellar Asset Contract or write a custom SEP-41 contract token? What are the tradeoffs?`

| Entry | Rejected gated score | Repaired gated score | Repaired ungated score | Repaired page rank |
|---|---:|---|---:|---:|
| `stellarDocs.search_asset_token_docs` | 322 | null | 812 | 1 |

### Twelve false-positive queries

The table uses `searchCatalog` with limit 5.
The script also checks every catalog entry for each query.
No gated or ungated score differs from the same prepared query with acronym forms disabled.

| Query | Repaired rank-1 entry | Score | Tier |
|---|---|---:|---|
| `send every payment` | `skills.stellar-dev.agentic-payments` | 67 | backfill |
| `show exchange prices` | `lumenloop.list_research` | 13 | backfill |
| `smart escrow patterns` | `skills.openzeppelin-stellar.setup-stellar-contracts` | 47 | gated |
| `create ledger items` | `stellarDocs.search_docs` | 75 | gated |
| `simple demo kit` | `lumenloop.list_research` | 13 | backfill |
| `recent protocol changes` | `scout.getChanges` | 135 | gated |
| `read public contracts` | `scout.listContracts` | 125 | gated |
| `smart contract framework` | `skills.stellar-dev.smart-contracts` | 187 | gated |
| `network operations team` | `stellarDocs.search_protocol_concepts_docs` | 51 | gated |
| `never open trades` | `lumenloop.search_content_semantic` | 47 | gated |
| `offer new endpoints` | `scout.getChangelog` | 75 | gated |
| `model context protocol` | `stellarDocs.search_protocol_concepts_docs` | 111 | backfill |

These checks remove the added acronym false positives; they do not establish the quality of each original lexical result.

### Commands and exit codes

Every listed command ran without a pipe.

| Command | Exit code | Result |
|---|---:|---|
| `npm run eval:compile` | 0 | Generated cases unchanged. |
| `npm run eval:routing -- --gate` | 0 | GATE PASS. |
| `npm run eval:selftest` | 0 | All checks passed. |
| `node tmp/lane-c-probe.mjs` | 0 | Probe passes at limits 5 and 10. |
| `node tmp/lane-c-compare.mjs` | 0 | Zero graded regressions against the pinned baseline. |
| `npm run typecheck` | 0 | Passed. |
| `npm test` | 0 | 135 files; 2385 passed; 3 expected failures. |
| `npm run build` | 0 | Dry-run build passed. |
| `npm run secrets:scan -- --tree` | 0 | All tracked files passed; Gitleaks found no leaks. |
| `npx vitest run test/scoring.test.ts test/search.test.ts` | 0 | 140 passed. |
| `node tmp/lane-c-review-probes.mjs` | 0 | All twelve score-invariance checks and the SAC check passed. |
| `git diff --check` | 0 | Passed. |

The pinned-file comparison and inventory diff also passed with exit code 0.
Source inspections, evidence copies, and status checks returned exit code 0.

### Evidence and remaining limits

- `tmp/lane-c-evidence/review-fixed-probes.json` records both requested page limits and all controls.
- `tmp/lane-c-evidence/review-false-positives.json` records the twelve rank-1 entries and the SAC page.
- `tmp/lane-c-evidence/review-fixed-comparison.json` records every case comparison against the pinned baseline.
- `tmp/lane-c-review-probes.mjs` reproduces the false-positive and SAC checks.

The earlier candidate evidence remains intact.
The 32-form cap intentionally withholds later alternatives from unusually long queries.
The English exclusion set covers general stopwords and common emphasis terms; it is not a complete language dictionary.
Matching initials and independent context still do not prove semantic equivalence for every possible query.
The lead still owns independent re-review and the combined lane gates.

## 8. Second review fixes

I read the complete `## Verification` section in `tmp/review-lane-c-grok.md`.
This section supersedes the earlier context-matching and ordinary-word rules.

### Repairs

1. Acronym context now requires equality after `canonicalRoutingToken`.
   The context check no longer calls `tokensOverlap` or accepts its prefix branch.
   Tests cover `stella`, `searc`, and `toke`, plus a valid singular/plural context match.
2. Search now derives an ordinary-word exclusion set from every catalog entry's description and terminal name.
   It rejects an uppercase acronym witness when the same word occurs as lowercase prose elsewhere in that catalog.
   The set includes all ten reported words: `SAME`, `LIST`, `PEOPLE`, `BUILD`, `FULL`, `SKILL`, `ANSWER`, `NAMED`, `BUILT`, `SUPPLY`.
   The existing static list did not grow.

The extraction preserves hyphenated compounds, underscore identifiers, and mixed-case names as whole tokens.
Thus, `mcp-server` does not supply the ordinary word `mcp`.
This general token rule preserves the MCP probe without a protocol-specific exception.
The exclusion set uses the whole catalog before service filters.
A weak cache stores the set by catalog identity.
Tests verify evidence from another service, both description and name evidence, and separation between catalog caches.

Changed tracked files:

- `src/catalog/scoring.ts`: exact canonical context and supplied ordinary-word exclusions.
- `src/catalog/search.ts`: catalog-derived exclusions during query preparation.
- `src/catalog/README.md`: the exact-context and lowercase-prose rules.
- `test/scoring.test.ts`: prefix, SAME, canonical-context, and catalog-evidence tests.

The vendor scorer, manifest, gate file, inventory, and Scout description still match pinned base `76c7f02be5fba31c4377f067f37412bb6e5b9d4b`.
No commit occurred. All changes remain unstaged.

### Measurements

Routing result: `eval/results/routing-2026-10-02T16-50-55-768Z.json`.
Saved copy: `tmp/lane-c-evidence/second-review-fixed.json`.
The routing gate passed without a baseline change.

| Lane | Baseline top-1/3/5 | Repaired top-1/3/5 | Graded changes |
|---|---|---|---:|
| Legacy /338 | 219/298/326 | 219/298/326 | 0 |
| Extended /122 | 93/111/117 | 93/111/117 | 0 |
| Skills /23 | 17/23/23 | 17/23/23 | 0 |
| Holdout /49 | 12/26/29 | 12/26/29 | 0 |

All 532 graded rows retain their baseline result IDs and scores.
Holdout forbidden captures remain 10; complete passes remain 24.
The protocol diagnostic retains all twelve target ranks and its pre-existing failure.
Only the other results in `ph-security-incident-postmortems` differ from the baseline, as in the previous repair.

| Discovery page | `scout.listSkills` rank | Gated score | Ungated score |
|---|---:|---:|---:|
| Limit 5 | 3 | 207 | 184 |
| Default limit 10 | 5 | 207 | 184 |

The three control queries keep their previous limit-5 results.
The SAC entry remains gated null, ungated 812, and rank 1.
All twelve original false-positive query results remain as recorded in section 7.

The four new review probes use limit 5:

| Query | Repaired rank-1 entry | Score | Tier |
|---|---|---:|---|
| `send every payment stella` | `stellarDocs.search_protocol_concepts_docs` | 88 | gated |
| `send every payment searc` | `stellarDocs.search_protocol_concepts_docs` | 92 | gated |
| `send every payment toke` | `skills.stellar-dev.agentic-payments` | 79 | backfill |
| `send alpha model every lumenloop` | `lumenloop.search_content_semantic` | 116 | gated |

None of the four reported target entries gains a gated result on these pages.
The first three target entries also have null gated scores in the direct scorer tests.

### Commands and exit codes

All verification commands ran without pipes.

| Command | Exit code | Result |
|---|---:|---|
| `npm run eval:compile` | 0 | Generated cases unchanged. |
| `npm run eval:routing -- --gate` | 0 | GATE PASS. |
| `npm run eval:selftest` | 0 | All checks passed. |
| `node tmp/lane-c-probe.mjs` | 0 | Discovery probe passes at limits 5 and 10. |
| `node tmp/lane-c-compare.mjs` | 0 | Zero graded changes against the pinned baseline. |
| `node tmp/lane-c-review-probes.mjs` | 0 | Twelve original probes and SAC checks passed. |
| `node tmp/lane-c-second-review-probes.mjs` | 0 | Three prefix queries and SAME query passed. |
| `npm run typecheck` | 1, then 0 | Corrected synthetic test services to valid typed services. |
| `npm test` | 0, 0 | Both runs: 135 files, 2392 passed, 3 expected failures. |
| `npm run build` | 0 | Dry-run build passed. |
| `npm run secrets:scan -- --tree` | 0 | All tracked files passed; Gitleaks found no leaks. |
| `npx vitest run test/scoring.test.ts test/search.test.ts` | 1, then 0 | Corrected the plural-context fixture; 147 tests then passed. |
| `git diff --check` | 0 | Passed. |

The first plural fixture assumed vendor matching between `registry` and `registries`.
The vendor does not match that pair; the fixture now uses `anchor` and `anchors`.
The product scoring rule did not change to accommodate that fixture.
Pinned-file comparisons, inventory checks, and protocol target-rank assertions also passed with exit code 0.

### Evidence

- `tmp/lane-c-evidence/second-review-fixed-comparison.json`: all case comparisons, including unchanged grades and changed diagnostic results.
- `tmp/lane-c-evidence/second-review-fixed-probes.json`: discovery pages and control query scores.
- `tmp/lane-c-evidence/second-review-false-positives.json`: the original twelve review queries and SAC results.
- `tmp/lane-c-evidence/second-review-prefix-same.json`: the three prefix queries and SAME query.
- `tmp/lane-c-second-review-probes.mjs`: the added probe script.

The data-driven rule passed both the discovery probe and the graded battery, so no larger static list was necessary.
Future catalog changes can change the lowercase vocabulary and must pass the same routing checks.
Independent re-review and combined-lane verification remain the lead's responsibility.
