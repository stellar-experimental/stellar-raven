# Lane A report — 2026-10-02-routing-adapter-repairs

## 1. Change

The live snapshot now contains 666 titles, compared with 651 before this work.
All four title-related target ranks return to their previous positions.
The final routing gate passes.
The comparison has no graded losses across 544 cases.
One legacy case improves at top-1.

| File | Change |
|---|---|
| `scripts/build-catalog.mjs` | Filters title vocabulary against searchable catalog entries before the existing service frequency filter. |
| `scripts/build-catalog.d.mts` | Declares the exported title helper for TypeScript tests. |
| `test/title-keywords.test.ts` | Adds five synthetic tests for namespace words, shared prose, named topics, hidden sections, and URL scope. |
| `src/catalog/README.md` | Documents the title keyword rule. |
| `inventory/stellar-docs-titles.json` | Absorbs the current 666-title snapshot. |
| `catalog/manifest.json` | Regenerated keywords for five Docs operations, plus the generated timestamp. |
| `specs/super-spec.json` | Regenerated timestamps only. |
| `eval/gates.json` | Updates the fingerprint, evidence time, trace, and note; records one justified top-1 improvement. |

The refresh changed no other inventory file.
The catalog retains all 282 entry IDs and 60 operations.
All non-Docs entries remain byte-equivalent as parsed objects.
Only `keywords` changed inside the five affected Docs entries.
The runtime scorer and `src/catalog/vendor/search-scoring.ts` remain unchanged.
The generated micro-map, operation classes, and routing cases remain unchanged.

The changes remain unstaged.
No commit, push, pull request, deployment, paid evaluation, or Algolia write occurred.
The build command ran its required deployment dry run only.

## 2. Rationale

**Rule: Exclude service names and unnamed title vocabulary shared across every other searchable service.**

Unnamed vocabulary does not occur in a searchable operation or skill name.
The comparison uses IDs, descriptions, schema keywords, and curated routing keywords.
It uses the existing token normalization and plural handling.
Hidden sections do not compete in search.
The existing service frequency filter and keyword cap still apply afterward.

A namespace word identifies a service, not the topic of one documentation operation.
A word present in every other service gives no evidence for selecting Docs.
A named topic remains useful even when several services discuss it.
The rule uses catalog structure without a question list, title exception, or adjustable frequency threshold.

The first attempt separated title keywords and blocked title-only admission.
It did not remove the skills ranking losses because existing lexical matches still allowed title score increases.
It also introduced two graded losses.
Broader catalog exclusion rules removed useful topic vocabulary and changed existing routes.
A universal-vocabulary rule without named-topic preservation also caused one holdout loss.
The final rule preserves named topics and has no graded losses.

A manual generic-word list would require repeated maintenance and subjective word choices.
No such list entered production.
The rejected patches and complete per-case comparisons remain under `tmp/` for review.

## 3. Measurements

Base commit: `76c7f02be5fba31c4377f067f37412bb6e5b9d4b`.

The baseline used the untouched tree.
The before measurement absorbed live titles without changing code.
The after measurement used the final rule and live titles.

Baseline trace: `eval/results/routing-2026-10-02T15-55-06-861Z.json`.

Before trace: `eval/results/routing-2026-10-02T15-56-21-749Z.json`.

Final trace: `eval/results/routing-2026-10-02T16-16-10-704Z.json`.

| Lane / metric | Baseline | Before: titles only | After: final rule |
|---|---:|---:|---:|
| Legacy top-1 / 338 | 219 | 219 | 220 |
| Legacy top-3 / 338 | 298 | 297 | 298 |
| Legacy top-5 / 338 | 326 | 326 | 326 |
| Legacy card@5 / 182 | 112 | 112 | 112 |
| Extended top1 / 122 | 93 | 93 | 93 |
| Extended top3 / 122 | 111 | 111 | 111 |
| Extended top5 / 122 | 117 | 117 | 117 |
| Skills top1 / 23 | 17 | 17 | 17 |
| Skills top3 / 23 | 23 | 23 | 23 |
| Skills top5 / 23 | 23 | 23 | 23 |
| Holdout top1 / 49 | 12 | 12 | 12 |
| Holdout top3 / 49 | 26 | 26 | 26 |
| Holdout top5 / 49 | 29 | 29 | 29 |
| Holdout forbiddenCaptures / 49 | 10 | 10 | 10 |
| Holdout passed / 49 | 24 | 24 | 24 |

The protocol-history diagnostic remains unchanged and failing.
It retains 7/8 positive top-five hits and 3/4 control captures.
It is separate from the three routing gates.

The following cells show rank, score, and tier within the first five results.
`>5` means the result is absent from that page.

| Probe | Target | Baseline | Before | After |
|---|---|---|---|---|
| How do x402, MPP, AP2, and ACP compare for agent payments, and which are Stellar-specific vs general? | `stellarDocs.search_docs` | 3 / 326 / backfill | >5 | 3 / 326 / backfill |
| Stellar skills for signing messages | `scout.listSkills` | 3 / 166 / gated | 4 / 166 / gated | 3 / 166 / gated |
| Stellar skills for security auditing | `scout.listSkills` | 3 / 166 / gated | 4 / 166 / gated | 3 / 166 / gated |
| Stellar authority skills | `scout.listSkills` | 3 / 135 / gated | 5 / 135 / gated | 3 / 135 / gated |
| Are there any model context protocol skills for Stellar? | `scout.listSkills` | >5 | >5 | >5 |
| What Stellar AI skills can I install? | `scout.listSkills` | 3 / 277 / gated | 3 / 277 / gated | 3 / 277 / gated |
| List Stellar skills | `scout.listSkills` | 1 / 269 / gated | 1 / 269 / gated | 1 / 269 / gated |
| Search Stellar research across CAP and SEP sources | `scout.searchResearch` | 1 / 327 / gated | 1 / 327 / gated | 1 / 327 / gated |
| What community skills are listed on skills.stellar.org? | `scout.listSkills` | 1 / 401 / gated | 1 / 401 / gated | 1 / 401 / gated |

The first four rows restore the ranks recorded in the previous drift review.
The fifth row remains an inherited Scout description issue.
That question already lacked `scout.listSkills` in the untouched `origin/main` baseline.
This lane does not claim to repair that separate issue.

The SDK/CLI result retains some new title vocabulary.
For the signing probe, it ranks fourth with score 153, below `scout.listSkills` at score 166.
For the authority probe, both Docs results follow `scout.listSkills` with score 129.

`tmp/lane-a-probes.json` stores every result ID, rank order, score, and tier for all nine probes.
It also stores independent removals of the newly added title words.
`tmp/lane-a-measure.mjs` adapts the supplied reviewer attribution script.
The untouched supplied probe ran before and after the change.

| Final comparison | Cases | Ordered result changes | Graded hit-to-miss flips |
|---|---:|---:|---:|
| Legacy | 338 | 10 | 0 |
| Extended | 122 | 8 | 0 |
| Skills | 23 | 0 | 0 |
| Holdout | 49 | 6 | 0 |
| Protocol history diagnostic | 12 | 0 | 0 |

| Final graded flip | Before | After |
|---|---|---|
| `q-infra-hubble-vs-rpc-layer`, strict top-1 | Miss | Hit |
| `q-infra-hubble-vs-rpc-layer`, accept-either top-1 | Miss | Hit |

This case asks when to use Stellar RPC or Hubble/BigQuery for balances and history.
`stellarDocs.search_rpc_horizon_data_docs` moves from rank 5, score 184, to rank 1, score 437.
Removing weak keyword evidence changes the scorer's existing retry path.
This is a routing improvement, not evidence of better final answers.

The measured improvement justifies raising the accepted legacy top-1 count and baseline from 219 to 220.
All other accepted totals, floors, the band percentage, and the capture ceiling remain unchanged.
This is the brief's measured-improvement exception to a fingerprint-only update.

Final manifest file SHA-256: `d76640e00d7d8617d4627682ccac33b54e9f610c43c73a952b910d475dfeefe2`.

Rejected trials remain visible below.
Counts show losing metric flips; strict and accept-either losses can count separately.
No rejected trial changed the accepted gate values.

| Trial | Trace time on 2026-10-02 | Losing metric flips | Result |
|---|---|---:|---|
| Titles only | `15-56-21-749Z` | 1 | Rejected |
| Block title-only admission | `15-57-55-457Z` | 2 | Rejected |
| Exclude all existing catalog vocabulary | `15-59-08-232Z` | 7 | Rejected |
| Exclude vocabulary shared by two services | `16-00-42-621Z` | 6 | Rejected |
| Exclude IDs and curated routing vocabulary | `16-02-28-840Z` | 4 | Rejected |
| Require repeated titles for shared vocabulary | `16-04-18-663Z` | 6 | Rejected |
| Exclude vocabulary in two other services | `16-05-55-221Z` | 4 | Rejected |
| Exclude universal vocabulary without topic preservation | `16-07-23-867Z` | 1 | Rejected |
| Final named-topic rule | `16-09-33-834Z` | 0 | Accepted |
| Final gated verification | `16-16-10-704Z` | 0 | Accepted |

`tmp/lane-a-comparison.json` contains all trial flips and ordered result changes by case ID.
The rejected patches use `tmp/lane-a-rejected-*.patch`.
The baseline and titles-only manifests remain in `tmp/lane-a-baseline-manifest.json` and `tmp/lane-a-before-manifest.json`.

## 4. Gates

All final required gates passed.
The unit suite passed 2370 tests, with 3 expected failures, across 136 files.
The focused keyword, catalog, and scorer run passed 49 tests.
The secret scan passed, including Gitleaks.

The first TypeScript run failed because the new exported helper lacked an ambient declaration.
Adding that declaration fixed the failure.
All intermediate routing runs correctly rejected their changed manifest fingerprint.
The rejected candidates also had the numerical losses recorded above.
The final candidate failed only its fingerprint check before the authorized baseline update.

The table records every build, measurement, and validation invocation in order.
The full command results remain in `tmp/lane-a-commands.json`.
Read-only file inspection commands are not gates.
One inline diagnostic import failed because it used a nonexistent scorer export.
That diagnostic changed no files and did not affect any measurement.

| # | Command | Exit code |
|---:|---|---:|
| 1 | `npm run eval:compile` | 0 |
| 2 | `npm run eval:routing -- --gate --dump-ranked tmp/lane-a-baseline-ranked.json` | 0 |
| 3 | `node .agents/rounds/2026-10-02-routing-adapter-repairs/probe-discovery.mjs` | 0 |
| 4 | `node scripts/refresh-inventory.mjs` | 0 |
| 5 | `node scripts/build-catalog.mjs` | 0 |
| 6 | `npm run micro-map:build` | 0 |
| 7 | `npm run spec:build` | 0 |
| 8 | `node eval/plan/build-op-classes.mjs` | 0 |
| 9 | `node .agents/rounds/2026-10-02-routing-adapter-repairs/probe-discovery.mjs` | 0 |
| 10 | `npm run eval:routing -- --gate --dump-ranked tmp/lane-a-before-ranked.json` | 1 |
| 11 | `node scripts/build-catalog.mjs` | 0 |
| 12 | `node .agents/rounds/2026-10-02-routing-adapter-repairs/probe-discovery.mjs` | 0 |
| 13 | `npm run eval:routing -- --gate --dump-ranked tmp/lane-a-after-ranked.json` | 1 |
| 14 | `node scripts/build-catalog.mjs` | 0 |
| 15 | `node .agents/rounds/2026-10-02-routing-adapter-repairs/probe-discovery.mjs` | 0 |
| 16 | `npm run eval:routing -- --gate --dump-ranked tmp/lane-a-distinctive-ranked.json` | 1 |
| 17 | `node scripts/build-catalog.mjs` | 0 |
| 18 | `node .agents/rounds/2026-10-02-routing-adapter-repairs/probe-discovery.mjs` | 0 |
| 19 | `npm run eval:routing -- --gate --dump-ranked tmp/lane-a-shared-ranked.json` | 1 |
| 20 | `node scripts/build-catalog.mjs` | 0 |
| 21 | `node .agents/rounds/2026-10-02-routing-adapter-repairs/probe-discovery.mjs` | 0 |
| 22 | `npm run eval:routing -- --gate --dump-ranked tmp/lane-a-owned-ranked.json` | 1 |
| 23 | `node scripts/build-catalog.mjs` | 0 |
| 24 | `node .agents/rounds/2026-10-02-routing-adapter-repairs/probe-discovery.mjs` | 0 |
| 25 | `npm run eval:routing -- --gate --dump-ranked tmp/lane-a-corroborated-ranked.json` | 1 |
| 26 | `node scripts/build-catalog.mjs` | 0 |
| 27 | `node .agents/rounds/2026-10-02-routing-adapter-repairs/probe-discovery.mjs` | 0 |
| 28 | `npm run eval:routing -- --gate --dump-ranked tmp/lane-a-external-ranked.json` | 1 |
| 29 | `node scripts/build-catalog.mjs` | 0 |
| 30 | `node .agents/rounds/2026-10-02-routing-adapter-repairs/probe-discovery.mjs` | 0 |
| 31 | `npm run eval:routing -- --gate --dump-ranked tmp/lane-a-universal-ranked.json` | 1 |
| 32 | `node scripts/build-catalog.mjs` | 0 |
| 33 | `npm run eval:routing -- --gate --dump-ranked tmp/lane-a-named-ranked.json` | 1 |
| 34 | `npx vitest run test/title-keywords.test.ts test/catalog.test.ts test/scoring.test.ts` | 0 |
| 35 | `npm run typecheck` | 1 |
| 36 | `node scripts/build-catalog.mjs` | 0 |
| 37 | `npm run micro-map:build` | 0 |
| 38 | `npm run spec:build` | 0 |
| 39 | `node eval/plan/build-op-classes.mjs` | 0 |
| 40 | `npm run eval:compile` | 0 |
| 41 | `node tmp/lane-a-measure.mjs` | 0 |
| 42 | `npm run typecheck` | 0 |
| 43 | `npm test` | 0 |
| 44 | `npm run build` | 0 |
| 45 | `npm run eval:selftest` | 0 |
| 46 | `npm run eval:routing -- --gate --dump-ranked tmp/lane-a-final-ranked.json` | 0 |
| 47 | `node .agents/rounds/2026-10-02-routing-adapter-repairs/probe-discovery.mjs` | 0 |
| 48 | `node tmp/lane-a-measure.mjs` | 0 |
| 49 | `git diff --check` | 0 |
| 50 | `npm run secrets:scan -- --tree` | 0 |

No smoke run was required because this lane changed no executor or demo source.
No QA or plan evaluation ran.
The operation-class command only regenerated its offline metadata.

## 5. Risks and open questions

- The lead must complete the independent review before acceptance.
- The lead must rerun the routing gates after merging the other lanes.
- Catalog vocabulary changes can change title exclusions; future refreshes need the same routing checks.
- The filter retains named topics even when their words are broad.
- This lane proves measured routing behavior, not final-answer quality.
- The inherited MCP skills discovery issue remains outside this title repair.
- The unchanged protocol-history diagnostic still fails.
- No upstream defect surfaced from these offline measurements; this work repairs Raven's own keyword mechanism.

## 6. Notes for the independent reviewer

Review the universal-service criterion and named-topic preservation together.
The rejected trials show why removing every shared word is too broad.
Check the synthetic tests without using the probe questions as production vocabulary.
Review all 24 changed ordered result lists in `tmp/lane-a-comparison.json`.
The 24 lists contain 10 legacy, 8 extended, and 6 holdout cases.
The grades have only the two improvements on the same legacy case.

Check the source inventory diff: 15 added titles and the snapshot timestamp.
Check that no title is removed or renamed to avoid a query.
The five changed Docs entries retain their descriptions, schemas, and transport.
The generated specification changes only its timestamps.
The forbidden vendor scorer file has no diff.

The lead owns the independent review and commit.
This report leaves all changes unstaged in the assigned worktree.

## 7. Review fixes

This section supersedes the pre-review candidate in sections 1–6.
The three requested repairs and the test improvement are complete.
All final required checks pass.
No commit was created.

**Gate correction.** Both legacy top-1 fields in `eval/gates.json` are back to 219.
Every accepted total and threshold now matches `76c7f02b`.
The fingerprint and trace identify the repaired catalog.
The earlier score 437 in section 3 was incorrect.
The reviewed candidate promoted RPC/Horizon from rank 5, score 184, gated, to rank 1, score 445, backfill.
The title filter removed `history` and `queries` from its title vocabulary.
`history` remained in the operation description; it was not a separate baseline manifest keyword.
The repair restores eligible title vocabulary, including the emitted `queries` keyword.
RPC/Horizon returns to rank 5, score 184, gated, for `q-infra-hubble-vs-rpc-layer`.
The gate note records this correction without claiming a graded improvement.

**Vocabulary repair.** A stem counts for a service through multiple searchable entries or an operation name.
Repeated occurrences within one entry count once.
The exclusion needs evidence from at least two other services.
It no longer depends on every service in the catalog.
An unrelated new service cannot cancel an established exclusion.
Named topics and terms in Docs descriptions remain eligible for the existing Docs frequency filter.
This protects established documentation topics while suppressing repeated generic prose.
`oracle` and `queries` remain emitted RPC/Horizon keywords.
The `history` title stem remains eligible and is already present in its description.

Requiring repeated evidence in every other service still failed the payment comparison probe.
That rejected trial restored `agents` because one skills entry carried the stem.
The final rule requires repeated evidence across multiple services and preserves terms supported by Docs descriptions.
It uses no question-specific terms or exceptions.

**Title ownership.** Each matching title path has one owner: its longest matching Docs prefix.
The match respects path segment boundaries.
Equal prefixes with different owners fail instead of selecting an arbitrary operation.
The SDK/CLI spec now explicitly includes `/docs/tools/cli/agent-cli`.
That prefix is longer than the contract operation's `/docs/tools/cli/` prefix.
It is contained within the SDK operation's existing `/docs/tools` prefix.
The added prefix changes title ownership without enlarging the runtime SDK filter's URL set.

All 14 agent CLI pages belong to SDK/CLI.
Removing those 14 pages leaves the contract operation's title vocabulary unchanged.
All 666 snapshot titles remain present.
The builder also assigns other overlapping paths to their most specific operation.

**Tests.** The synthetic suite now has 11 tests.
It covers repeated service evidence, isolated mentions, named topics, Docs descriptions, hidden entries, unrelated services, and exclusive prefix ownership.
The new normalized fixture uses `resources containers packages` and expects no title keywords.
Removing the exclusion predicate makes that fixture fail while token normalization remains active.
The deliberate mutation run exited 1; the restored implementation passes the complete test suite.

**Additional query measurements.** Before means the reviewed candidate, not the titles-only experiment.
Each cell gives rank / score / tier within the first five results.
`>5` means absent from that page.

| Query | Target | Baseline `76c7f02b` | Before review fixes | After review fixes |
|---|---|---|---|---|
| `q-holdout-c-05-oracle-pick`: what oracle should I use for prices on Stellar | `stellarDocs.search_rpc_horizon_data_docs` | 3 / 220 / gated | >5 | 3 / 220 / gated |
| What oracle options do I have on Stellar besides Reflector? | `stellarDocs.search_rpc_horizon_data_docs` | 4 / 114 / gated | >5 | 4 / 114 / gated |
| Sign messages | `stellarDocs.search_soroban_contract_docs` | >5 | 1 / 26 / gated | >5 |
| Sign messages | `stellarDocs.search_sdk_cli_tools_docs` | 2 / 25 / backfill | 2 / 41 / backfill | 1 / 41 / backfill |
| `q-infra-hubble-vs-rpc-layer` | `stellarDocs.search_rpc_horizon_data_docs` | 5 / 184 / gated | 1 / 445 / backfill | 5 / 184 / gated |

The expected skill remains first on the oracle holdout case before and after these fixes.
The repair restores relevant data documentation that the grade alone did not measure.
`tmp/lane-a-review-probes.json` contains complete pages for these queries, including the Hubble query.

The four original targets retain their baseline ranks:

| Probe | Target | Final rank / score |
|---|---|---|
| Agent payment protocol comparison | `stellarDocs.search_docs` | 3 / 326 |
| Stellar skills for signing messages | `scout.listSkills` | 3 / 166 |
| Stellar skills for security auditing | `scout.listSkills` | 3 / 166 |
| Stellar authority skills | `scout.listSkills` | 3 / 135 |

**Routing comparison.** The comparison pins `76c7f02be5fba31c4377f067f37412bb6e5b9d4b`, even though `origin/main` moved during review.
The stored baseline manifest equals that commit's manifest.
`tmp/lane-a-measure.mjs` now checks that equality and fails on a graded regression.

| Lane | Cases | Top-1 / top-3 / top-5 | Graded flips | Ordered page changes |
|---|---:|---|---:|---:|
| Legacy | 338 | 219 / 298 / 326 | 0 | 11 |
| Extended | 122 | 93 / 111 / 117 | 0 | 16 |
| Skills | 23 | 17 / 23 / 23 | 0 | 2 |
| Holdout | 49 | 12 / 26 / 29 | 0 | 8 |

There are zero graded hit-to-miss flips and zero graded improvements across 544 cases.
Legacy card@5 remains 112/182.
Holdout forbidden captures remain 10; passed cases remain 24.
The 12 protocol-history diagnostic cases also have no graded changes.
That separate diagnostic remains failing at 7/8 positive hits and 3/4 control captures.

Final trace: `eval/results/routing-2026-10-02T16-50-47-817Z.json`.

Manifest file SHA-256: `efea602c3ea4f0e66e3f58273e0827e79cbaaa566430d267204fbaaf9e93afe6`.

The final build chain regenerated the manifest, micro-map, specification, and operation classes.
The micro-map, operation classes, and routing cases remain unchanged.
The generated specification now includes the explicit SDK agent CLI prefix and the snapshot timestamps.
The runtime scorer and vendor scorer remain unchanged.

**Checks and exit codes.** The full unit suite passes 2376 tests, with 3 expected failures, across 136 files.
The secret scan passes, including Gitleaks.
The following table includes rejected trials and the deliberate test mutation.
Commands ran without pipes.

| # | Command | Exit | Note |
|---:|---|---:|---|
| 1 | `node scripts/build-catalog.mjs` | 0 |  |
| 2 | `npm run eval:routing -- --gate --dump-ranked tmp/lane-a-review-first-ranked.json` | 1 | Rejected: payment probe loss; stale fingerprint |
| 3 | `node .agents/rounds/2026-10-02-routing-adapter-repairs/probe-discovery.mjs` | 0 |  |
| 4 | `node scripts/build-catalog.mjs` | 0 |  |
| 5 | `npm run eval:routing -- --gate --dump-ranked tmp/lane-a-review-second-ranked.json` | 1 | No graded flips; stale fingerprint before rebuild |
| 6 | `node .agents/rounds/2026-10-02-routing-adapter-repairs/probe-discovery.mjs` | 0 |  |
| 7 | `node tmp/lane-a-measure.mjs` | 0 |  |
| 8 | `npx vitest run test/title-keywords.test.ts` | 0 |  |
| 9 | `npx vitest run test/title-keywords.test.ts -t 'rejects repeated cross-service prose with normalized title tokens'` | 1 | Deliberate predicate-removal test; failure required |
| 10 | `node scripts/build-catalog.mjs` | 0 |  |
| 11 | `npm run micro-map:build` | 0 |  |
| 12 | `npm run spec:build` | 0 |  |
| 13 | `node eval/plan/build-op-classes.mjs` | 0 |  |
| 14 | `npm run eval:compile` | 0 |  |
| 15 | `npm run eval:routing -- --gate` | 0 |  |
| 16 | `npm run eval:selftest` | 0 |  |
| 17 | `node tmp/lane-a-measure.mjs` | 0 |  |
| 18 | `node .agents/rounds/2026-10-02-routing-adapter-repairs/probe-discovery.mjs` | 0 |  |
| 19 | `npm run typecheck` | 0 |  |
| 20 | `npm test` | 0 |  |
| 21 | `npm run build` | 0 |  |
| 22 | `npm run eval:selftest` | 0 |  |
| 23 | `git diff --check` | 0 |  |
| 24 | `npm run secrets:scan -- --tree` | 0 |  |

The command results are in `tmp/lane-a-review-commands.json`.
The original comparison is preserved as `tmp/lane-a-original-comparison.json`.
The original probes are preserved as `tmp/lane-a-original-probes.json`.
The reviewed manifest is preserved as `tmp/lane-a-review-before-manifest.json`.

The lead still owns final independent verification and the combined-lane gate run.
All changes remain unstaged in the assigned worktree.
