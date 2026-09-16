# Scout unit-test contract diagnosis

Date: 2026-09-16

Reviewer: Sol high

Status: **DIAGNOSIS ONLY. NOT FINAL ACCEPTANCE.**

Grok remains the final independent reviewer.

## Scope

This review compares the dirty candidate with accepted commit `bb37bc502080c94c3f3b5223ffcdf584d4b0e29d`.

It uses `/tmp/raven-execution-2026-09-16/scout-unit-results.json` as the original failure record.

It also checks the later restoration evidence and current narrow behavior.

I made no source, gate, count, schema, snapshot, or test edit.

## Result summary

The original result contains 22 failures across 21 suites.

The restored result contains 20 failures across 17 suites.

Two dropped PR157 contracts are now fixed with direct proof.

The current regional-partner repair also passes its narrow existing test.

No full suite proves a new 19-failure total. Do not record that count as final.

One unresolved failure is a clear behavior bug: low-evidence person questions lose canonical anchor order and membership.

Most other failures assert contracts that the candidate intentionally changed.

Several rendered and schema snapshots remain valid release alarms. Do not rewrite them before behavior acceptance.

## Exact evidence identity

| Evidence | SHA-256 |
|---|---|
| `scout-unit-results.json` | `7dae9409c93730d8d1a8a240ba7d9778050923f3d3eabf30f81abbdc5afefa02` |
| `scout-unit-results-restored.json` | `84e09ad0be9a80775c88c9da5eebe7384176dba6fe827d7ad02f66d841e2d071` |
| `scout-combined-freeze-report.md` | `b2136d13fb030649d096d52efb3a5488b027a3a92403e4ccf091f704c9391232` |
| `scout-combined-independent-review.md` | `c2ba5749291c592483ff7414a472bbaf9f02713e5d4a9e4bfcd4e45ac9cf7803` |

Current observed candidate identity:

| Item | Value |
|---|---|
| Base and `HEAD` | `bb37bc502080c94c3f3b5223ffcdf584d4b0e29d` |
| Dirty binary diff SHA-256 | `444dc190ba46be36c24bd233a4424375dd76ba9d158e46922e6b072ea22e768f` |
| `src/catalog/search.ts` | `54ec16bfe2a9d831031d5e33a12ea00ff2c962ba6e87a28cb7c1a0dcf0325e2f` |
| `src/catalog/scoring.ts` | `8e28959b6be4c173a73dbb171e8a89937d8c58d04c6621639ad9b15b89287201` |
| `src/catalog/extract-routing-phrases.ts` | `943251c31eb5ce37ea27ee960ad7aa707a80793df0dfdda8c77df7d16b247812` |
| `scripts/build-catalog.mjs` | `85918fc2347adca30461288dcabe2d225624ac5873e41bc32d55dafb2e8ce124` |
| `catalog/manifest.json` | `bc91f286b8c750a7c551253a84840d2c8e2634fb9e86db939f93b1eb13a5d361` |

The current `search.ts` differs from the frozen report. It includes the new enum-witness repair.

## Proof for the two restored PR157 contracts

Command:

```text
./node_modules/.bin/vitest run test/skill-markdown.test.mjs test/skill-search-admission.test.ts --reporter=verbose
```

Result: two files passed and all nine tests passed.

This proves both original failures are fixed:

1. The host-curated Trustless Work description reaches each generated surface.
2. The whole-skill admission guard rejects identity-fragment captures without escrow evidence.

This proof does not accept the Scout candidate.

## Failure classification

| Recorded failure group | Count | Classification | Required action |
|---|---:|---|---|
| PR157 description and admission guard | 2 | **Fixed with proof** | Keep the restored generator seam and guard. |
| Regional partner directory | 1 | **True admission bug; narrow repair now passes** | Add direct enum-witness tests before acceptance. |
| Low-evidence person anchors | 1 | **True advisory bug; unresolved** | Repair canonical anchor selection without scorer tuning. |
| Phrase-cap extraction | 1 | **Intentional contract change** | Replace the old prefix-only expectation with the reviewed fair allocator contract. |
| Routing score fixtures | 2 | **Intentional contract change** | Add coherent `routingPhrases` to positive fixtures. Keep an incoherent negative fixture. |
| Bare `freighter` ranking and host response | 3 | **Intentional contract change** | Review the two-hit result, then update all linked assertions together. |
| Leaderboard pages and one-slot movement | 3 | **Intentional source-routing change** | Assert leaderboard intent, not the accepted exact page snapshot. |
| Scout-only and source-control equality | 2 | **Obsolete equality contract** | Split exact-ID safety from source-driven routing movement. |
| Full tier-one page | 1 | **Intentional full-page backfill change** | Test the one-replacement and over-quota conditions directly. |
| SEP-6 page membership and total | 1 | **Mixed: intended membership repair, unaccepted total movement** | Keep the total alarm until admission review finishes. |
| `x-routing` field counts | 2 | **Source-surface drift** | Verify exact exposed sets after source acceptance. Do not change only `26` to `30`. |
| Output-compaction set | 1 | **Schema drift** | Review the five new oversized outputs before changing the snapshot. |
| Playground sample total | 1 | **Downstream truth snapshot** | Refresh only after routing behavior is accepted. |
| Docs search-to-execute trace | 1 | **Downstream truth defect** | Select a truthful stable example after routing behavior is accepted. |

The table accounts for all 22 original failures.

## Regional partner diagnosis

The original candidate drops `scout.getPartners` for `LatAm asset issuers services`.

Accepted `bb37bc50` ranks it second with score `119`.

The frozen candidate rejects it before scoring.

Its positive source phrase matches only `service`. Its operation identity does not match the query.

The query also supplies two complete input-enum values across distinct properties:

- `LatAm` identifies the region.
- `asset issuers` identifies the partner type.

The current `hasCompleteInputEnumWitnesses` repair admits this evidence before the fallback rejection.

The existing four-query regional-partner test now passes.

Current `LatAm asset issuers services` result:

```text
1 stellarDocs.search_asset_token_docs 129 gated
2 scout.getPartners                 119 gated
3 scout.getBuilders                  68 gated
4 scout.getStablecoins               63 gated
5 lumenloop.get_related_projects     60 gated
6 stellarDocs.search_doc_titles      53 gated
total=18, truncated=true
```

This is a general schema-evidence repair. It does not add a query-specific score rule.

It still needs these direct tests:

1. Zero enum-property witnesses do not admit an otherwise rejected operation.
2. One enum-property witness does not admit it.
3. Two complete values from distinct enum properties admit it.
4. A multi-token value and a compact alias such as `LatAm` both match.
5. A two-token `notFor` match still rejects before enum admission.
6. Repeated evidence from one property does not count twice.

## Lost person-query anchors

Accepted `bb37bc50` returns these wider candidates for both person questions:

```text
scout.searchResearch
lumenloop.search_content_semantic
stellarDocs.search_docs
```

The current Tyler query returns the same IDs in the wrong order:

```text
lumenloop.search_content_semantic
scout.searchResearch
stellarDocs.search_docs
```

The current Danel query loses the Docs anchor entirely:

```text
lumenloop.find_av_passages
scout.searchResearch
lumenloop.search_content_semantic
```

All ranked hits remain backfill hits. The failure is in advisory selection, not the score order.

`deriveWiderCandidates` consumes page-broad hits before canonical anchors.

The changed admission filter alters the backfill page. It now lets those hits claim advisory lanes first.

### Minimal general repair

Add a structural person-lookup advisory rule inside `deriveWiderCandidates`.

Use it only for an unfiltered all-backfill person-identity question.

For that state, emit canonical research, semantic, and Docs anchors before page-broad hits.

Do not change scores, candidate membership, quotas, or source metadata.

Required tests:

1. Both unknown-person questions keep the three canonical anchors and their order.
2. `justin rice history` still routes to gated `scout.getPeople` with no advisory.
3. The service-filtered `Tomer Weller` query keeps its Lumenloop page-broad result.
4. The long technical all-backfill query keeps its relevant Docs page-broad result.
5. A zero-hit operation query keeps the existing three canonical anchors.

## Exact-ID and source-only equality

Exact-ID resolution remains correct.

Current top hits are:

| Query | Top hit | Score |
|---|---|---:|
| `scout.getLeaderboard` | `scout.getLeaderboard` | 497 |
| `scout.explainRepo` | `scout.explainRepo` | 507 |
| `scout.searchResearch` | `scout.searchResearch` | 537 |

The old equality test combines exact-ID safety with source-metadata neutrality.

That neutrality is no longer the candidate contract.

Positive phrases and negative clauses intentionally change Scout-only pages.

For `top projects by GitHub activity`, `searchProjects` has four negative-clause matches.

Its best positive phrase has one match. The source now directs that ranking intent to `getLeaderboard`.

Split the contract into these tests:

1. Every exact operation ID remains the first result.
2. Negative metadata cannot reject its own exact ID.
3. A coherent positive phrase can change Scout-only membership.
4. An explicit two-token negative phrase can remove an operation.
5. Source ablations must record attributed movements. They must not require byte equality.

## Full-page membership and total

The new design permits one strong backfill on an over-quota full page.

Therefore, the old “full tier-1 page is untouched” assertion is intentionally obsolete.

For `soroban storage`, one backfill skill replaces one gated result.

The replacement follows the new product contract. Do not remove it to satisfy the old test.

For the SEP-6 question, the relevant asset-token Docs result replaces irrelevant `scout.explainRepo`.

That membership change is directionally correct.

The reported total also falls from `66` to `37`.

Do not declare `37` correct only because the source changed.

The total drop comes from pre-score admission rejection, not the targeted replacement.

Keep this alarm until the regional and person admission work receives review.

Add synthetic tests for these exact contracts:

1. A full page permits at most one strong backfill replacement.
2. The replacement must reduce an over-quota service count.
3. The replacement must improve measured intent coverage.
4. The replacement must not change `total` or `truncated`.
5. A negative clause changes `total` only when that clause matches.
6. A non-matching negative clause does not change `total`.

## Intentional scorer and extraction changes

The fair phrase allocator now skips an oversized phrase and continues across fields.

At cap `4`, it returns `purpose: alpha beta` and `exampleQuestions: zeta eta`.

This preserves complete phrases and fair field access. The old prefix-only test is stale.

The two routing-score fixtures omit `routingPhrases`.

The candidate now requires two query tokens from one coherent source phrase for routing-only admission.

Update those fixtures with coherent phrase evidence. Keep a split-phrase negative control.

The bare `freighter` result loses one single-keyword Soroban Docs rescue.

The page now has two gated results and `total=2`. The directory advisory remains present.

This follows the coherent-evidence rule. Review it as an intentional contract change.

## Leaderboard changes

The candidate keeps `scout.getLeaderboard` in both leaderboard pages.

It removes `scout.searchProjects` because the new source marks GitHub rankings as `getLeaderboard` intent.

It also raises the leaderboard score from source phrase evidence.

The old exact page and one-slot assertions encode the prior source contract.

Replace them with intent assertions after source acceptance:

- `scout.getLeaderboard` must remain inside the Scout quota.
- `scout.searchProjects` must not claim an explicit GitHub-ranking question.
- Exact operation IDs must remain first.
- Repeated runs must remain deterministic.

## Source and rendered snapshots

The current source attaches positive routing fields to 30 exposed Scout operations.

Accepted `bb37bc50` attached them to 26 operations.

The four additions are:

- `scout.getChangelog`
- `scout.getChanges`
- `scout.getPartner`
- `scout.matchPartners`

Do not replace only the number `26` with `30`.

The tests should compare the exact exposed source set with the generated catalog set.

The schema drift also moves five more output types above the compaction threshold:

- `scout.getRepoTrust`
- `scout.listContracts`
- `scout.scfPitch`
- `scout.searchHackathonBuilds`
- `scout.vetIdea`

Their rendered output lengths are `2844`, `3496`, `3061`, `2084`, and `2200` characters.

That failure is a valid schema-review gate. It is not a scoring defect.

The Playground example keeps the same four hit IDs and scores.

Its displayed total remains `18`, while the candidate reports `13`.

Do not refresh that number before the admission contract is accepted.

The Docs trace is a stronger truth defect.

Its static script calls Scout operations that the current query no longer returns.

Choose a new stable query and matching execution example after the scorer contract is final.

Do not weaken the test or retain an untruthful example.

## Commands and narrow results

The following read-only checks ran against the current candidate:

```text
./node_modules/.bin/vitest run test/skill-markdown.test.mjs test/skill-search-admission.test.ts --reporter=verbose
```

Result: `2` files passed and `9` tests passed.

```text
./node_modules/.bin/vitest run test/search.test.ts --reporter=verbose -t '<focused failure titles>'
```

Result: the regional-partner test passed. Ten selected legacy-contract tests still failed.

Node probes compared the current catalog with the accepted `bb37bc50` checkout.

The probes covered the requested queries, exact IDs, page totals, membership, and source ablations.

## Remaining review needs

1. The author must freeze the enum-witness repair and add direct boundary tests.
2. The author must repair low-evidence person advisories without changing scoring.
3. The team must adjudicate the intentional contract changes before snapshot updates.
4. The team must keep the SEP-6 total alarm until admission behavior is stable.
5. A full unit run must establish the final failure count.
6. Grok must perform the final independent review.

No result in this report accepts Scout 1.9.52, source counts, schemas, routing totals, or release metadata.
