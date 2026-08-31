# Implementation brief — clause-level semantic route-fit experiment (measurement only)

Date: 2026-08-31 (revised after the Grok pre-implementation review)
Lane: Product and measurement plan (Claude, Fable 5, high)
Round ledger: `.agents/rounds/2026-08-31-eval-routing-next.md`
Companion plan: `.agents/rounds/2026-08-31-eval-routing-next/plan-fable.md`
Review reconciled: `.agents/rounds/2026-08-31-eval-routing-next/review-grok-clause-brief.md`
Reconciliation record: `.agents/rounds/2026-08-31-eval-routing-next/clause-brief-reconciliation-fable.md`
Status: brief only. No paid call ran. No model build ran. No code, shared ledger, or frozen
contract changed.

## 1. Decision

Run one measurement-only experiment: `clause-fit-hysteresis-v1`.

The mechanism is clause-level use of the pinned Qwen embedding infrastructure. It embeds each
routing clause of each searchable catalog entry as its own vector. It scores a query against each
entry by the best single positive clause, minus excess exclusion evidence. It then applies one
hysteresis swap pass over a complete bounded candidate union that includes every searchable entry
with a non-null ungated lexical score.

Production search does not change. No production model call is proposed. The experiment lives
under `eval/vectorize/` and reuses the pinned model, runtime, embedder, and integrity pattern.

Inside this experiment, the semantic hysteresis pass replaces the lexical 1.6×
`TIER_INTERLEAVE_MARGIN` rule. Production keeps its rule untouched. The 2026-08-30 evidence shows
why the replacement is necessary for measurement: the Protocol 24 question scores the research
entry at ungated `186` against a gated `207`, and `186 < 1.6 × 207`, so the lexical margin can
never recover the named defect. This brief does not claim that the inherited product condition
"preserve `TIER_INTERLEAVE_MARGIN` across tiers" is met. A later product-wiring brief must define
the production margin policy before any `src/` change.

### 1.1 Why this mechanism and not the other two

| Option | Feasible now | Deterministic | Reason for the decision |
| --- | --- | --- | --- |
| Clause-level Qwen embeddings | yes; model, runtime, embedder, artifact format, and integrity tests exist | yes, given one pinned artifact and one recorded query-vector cache | selected |
| Pinned local cross-encoder | no cached model; new model pin, new loader, new artifact type, unverified reproducibility | unknown until measured | deferred to a later brief only after this result |
| Another existing repository mechanism | lexical levers, tiering, and profile edges | yes | rejected; the 2026-08-30 round measured four such candidates and all failed precision |

The Sol analysis prefers a cross-encoder. This brief agrees that a cross-encoder is the stronger
model class. It does not select it now for three reasons. First, no cross-encoder is present in
any local cache on this host. Second, the repository holds no loader, pin, artifact, or test for
one. Third, the Sol analysis rejected the *earlier* Qwen experiment for two specific defects: it
reranked only the lexical top 20, and it embedded one whole card per entry. This brief removes
both defects. The candidate union is complete over searchable entries. Each clause gets its own
vector, so the score is the highest coherent clause match, as the Sol design requires. If this
attempt fails, the negative result narrows the next brief to the cross-encoder.

## 2. Verified facts at the brief revision

| Fact | Value |
| --- | --- |
| `HEAD` | `1bfb9838491fa571166a2a631789a3b0e814980c` |
| Searchable manifest entries | 79: 18 Lumenloop operations, 30 Scout operations, 12 Stellar Docs operations, 19 whole skills |
| Existing vector artifact cards | 72; stale against the live 79-entry catalog (the live set adds 8 ids and the artifact still holds `scout.partnerOnboard`), so `loadFrontierArtifact()` refuses it for a run |
| Scout `x-routing` join | 26 searchable Scout operations match an inventory `x-routing` block; 4 searchable Scout operations have none: `scout.getChangelog`, `scout.getChanges`, `scout.getPartner`, `scout.matchPartners` |
| Matched Scout `x-routing` clause counts | 103 `useWhen`, 73 `exampleQuestions`, 75 `notFor`, plus one `purpose` each |
| Description sentences across the 79 entries | 373 raw splits by the section 4 rule; 343 after the `Returns:` drop |
| `searchCatalog` union completeness | incomplete at `MAX_SEARCH_LIMIT` 50: the limit-50 page misses `scout.searchResearch` for `phb-archival-defect-network-upgrade` and `phb-network-upgrades-reasons`; `total` is 79 and `truncated` is true |
| Pinned model | `onnx-community/Qwen3-Embedding-0.6B-ONNX` at `c25a394dd583836952667c12f008335071b3f43d`, `q8`, last-token pooling, normalized 1,024 dimensions |
| Pinned runtime | `@huggingface/transformers@4.2.0` in `package.json` |
| Model cache on this host | `~/.cache/huggingface` exists, but the pinned Qwen revision is absent from it and from both checkouts' `node_modules/@huggingface/transformers/.cache` |
| Frozen contract baselines | original 4/8 positives and 1/4 captures; blind 3/11 positives and 6/9 captures |
| Routing gate baselines | legacy 208/279/311 with a ±3-hit band; skills top-1 floor 16; holdout 10/22/25 with at most 11 forbidden captures |

The first artifact build therefore needs one network fetch of the pinned model revision. That
fetch is free. It is not a paid model call. Record the fetch in the ledger.

## 3. Exact input fields

The clause builder reads only these fields.

From `catalog/manifest.json`, for each entry with `searchable !== false`:

- `id`
- `service`
- `kind`
- `description`
- `keywords` and `routingKeywords` are read only by the lexical union scorer in section 5, never
  by the clause builder.

From `inventory/stellar-light.json`, for each `openapi.paths[<path>][<method>]` whose
`scout.<operationId>` exists in the searchable manifest entry set:

- `operationId`
- `x-routing.purpose`
- `x-routing.useWhen[]`
- `x-routing.exampleQuestions[]`
- `x-routing.notFor[]`

The four searchable Scout operations without `x-routing` get description clauses only.

From `scripts/catalog-data/workflow-archetypes.mjs`:

- `SERVICE_FAMILY_PURPOSES[].family`, `.label`, `.line`, `.authority`
- `WORKFLOW_ARCHETYPES[].title`, `.questionShape`, `.steps[]`

From each evaluation case: the `question` string only. The builder and the referee never read
case IDs, classes, `sourceCase`, `expected_service`, `expected_cards`, or any golden field for
scoring.

Excluded from the vector set on purpose: `x-routing.keywords[]`, the manifest `keywords[]`, and
the manifest `routingKeywords[]`. The Sol analysis diagnosed flat keyword aggregation as the
failure. Bare phrases carry no clause coherence, so they do not enter the vector set. Record this
exclusion in the artifact metadata. Do not reverse it after the first build.

## 4. Clause construction rules

Every rule is mechanical and applies to every entry the same way. No hand-written text enters.

Header for every clause of an entry:

```text
Catalog entry: <id>. Kind: <kind>. Source family: <label>. <line> <authority>
```

Positive clauses, in this order:

1. `Purpose: <x-routing.purpose>` — matched Scout operations only.
2. `Use when: <one useWhen item>` — one clause per item, matched Scout operations only.
3. `Example question: <one exampleQuestions item>` — one clause per item, matched Scout
   operations only.
4. `Description: <one sentence>` — one clause per description sentence, all entries.
5. `Workflow: <title>: <questionShape>` — one clause per archetype whose `steps[]` names the entry.

Negative clauses:

6. `Not for: <one notFor item>` — one clause per item, matched Scout operations only. Entries
   without `notFor` have no negative clause.

Sentence split rule for `description`: split on blank lines, then on
`/(?<=[.!?])\s+(?=[A-Z"(])/`. Trim each piece. Drop a piece shorter than 12 characters. Drop a
piece that starts with `Returns:`. That prefix marks output-shape text, not routing intent.

Clause text = header + `\n\n` + the role line. Each clause records `entryId`, `service`, `kind`,
`role` (`positive` or `negative`), `source` (`purpose`, `useWhen`, `exampleQuestion`,
`description`, `workflow`, or `notFor`), `index`, and `textSha256`.

Estimated vector count: about 680 = 343 description clauses + 202 matched positive `x-routing`
clauses + 75 `notFor` clauses + the workflow lines. Estimated artifact size: about 4 MB of base64
float32.

Query text = `queryText(question)` from `eval/vectorize/frontier-config.mjs`. The pinned
`QUERY_TASK` string does not change. Its wording says "routing card"; clause scoring reuses that
card-level instruction unchanged, and the artifact records this reuse. The raw question is used;
no stopword removal.

## 5. Candidate union and base order

For each query, with `limit = 5`:

1. `P5 = searchCatalog(catalog, { query, limit: 5 })` — the exact production page, with its
   production `score` and `tier` values.
2. `R` = every remaining searchable entry not in `P5` whose
   `scoreEntryWeightedUngated(projection, query)` is non-null, ordered by that ungated score
   descending, then by `id` ascending. Both scorers are already exported from
   `src/catalog/scoring.ts`; nothing in `src/` changes.
3. Base order `B = P5 ++ R`. `B` holds `P5` plus every remaining searchable entry with a
   non-null ungated score. An entry with a null ungated score stays out of `B`. Every frozen
   positive reaches `B` under this rule; the delta review measured 19 of 19.
4. Tier marking: a `P5` hit keeps its production tier. An entry in `R` whose
   `scoreEntryWeighted(projection, query)` is null — a coverage-gate failure — is marked
   `tier: "backfill"`. Every other entry in `R` is marked `tier: "gated"`.

The scoring projection for `R` is documented and fixed:
`{ id, name: entry.id, service, kind, description, keywords, routingKeywords }`. Production
`scoreCandidates` uses the internal alias-aware `entryScoringName`, so an `R` score can differ
slightly from the production score for alias-named entries. That difference cannot change the
identity reading, because identity returns the `P5` prefix unchanged.

Tier labels are data. Inside this experiment, movement is governed only by the semantic hysteresis
pass in section 6, which replaces the lexical 1.6× rule for the measurement. `kind` and `service`
filters are not used by the diagnostics. Exact-id searches are out of scope for the referee.

## 6. Scoring formula and policy

Vectors are normalized, so cosine equals the dot product.

For query vector `q` and entry `e`:

- `pos(e) = max over positive clauses c of e: dot(q, c)`
- `neg(e) = max over negative clauses n of e: dot(q, n)`; `neg(e) = -1` when `e` has none
- `fit(e) = pos(e) - max(0, neg(e) - pos(e))`

Exclusion evidence counts only when it exceeds the best inclusion evidence. It then subtracts the
excess once. There are no weights.

Policy `clause-fit-hysteresis-v1(m)`:

1. Start from base order `B`.
2. Make one left-to-right pass. The candidate at index `i` swaps left across each preceding
   candidate while `fit(candidate) >= fit(preceding) + m` **and**
   `fit(candidate) !== fit(preceding)`. It stops at the first preceding candidate it does not
   dominate. Equal `fit` values therefore never swap, at every `m` including `m = 0`.
3. Ties keep base order. Base order breaks ties by production page order, then ungated score,
   then `id`.
4. Return the first five hits. `tier` and lexical `score` values travel with the hits unchanged.

This pass is not `interleaveSelectedPage`, and it does not preserve the production
`TIER_INTERLEAVE_MARGIN` contract. It replaces that lexical rule inside this experiment only.

Pre-registered readings, all run in one referee invocation:

| Reading | `m` | Role |
| --- | --- | --- |
| identity | `Infinity` | calibration; must reproduce the lexical baseline exactly |
| pure fit | `0` | upper-bound diagnostic; not a ship candidate |
| grid 1 | `0.03` | candidate |
| grid 2 | `0.06` | candidate |
| grid 3 | `0.10` | candidate |

No other `m` is run. No per-case, per-class, per-service, or per-entry value exists. If more than
one grid value passes acceptance, choose the one with the fewest changed rankings in the 495-case
comparison; on a tie choose the larger `m`.

## 7. Artifact pins

New artifact: `eval/vectorize/artifacts/qwen3-embedding-0.6b-q8-c25a394-clauses.json`.

| Field | Content |
| --- | --- |
| `schemaVersion` | `1` |
| `experiment` | `clause-fit-hysteresis-v1` |
| `model` | the frozen `MODEL` object from `frontier-config.mjs`, byte-identical |
| `queryTask` | the pinned `QUERY_TASK` string, reused verbatim; the artifact notes the card-level wording |
| `policy` | `{ id: "clause-fit-hysteresis-v1", margins: [0, 0.03, 0.06, 0.10], baseOrder: "P5+ungated-remainder", swap: ">=m and not-equal" }` |
| `inputs` | `manifestSha256`, `inventorySha256` (`inventory/stellar-light.json`), `archetypesSha256`, `inventoryFetchedAt` |
| `exclusions` | `["x-routing.keywords", "keywords", "routingKeywords"]` |
| `unmatchedScoutOps` | `["scout.getChangelog", "scout.getChanges", "scout.getPartner", "scout.matchPartners"]` |
| `clauses[]` | `entryId`, `service`, `kind`, `role`, `source`, `index`, `textSha256` |
| `clauseSetSha256` | SHA-256 over the ordered clause tuples including text |
| `encoding` | `float32-base64`, little-endian, 1,024 dimensions |
| `vectors`, `vectorsSha256` | payload and its hash |

The loader refuses model drift, policy drift, payload-hash mismatch, and clause-set drift against
the live manifest and inventory. Tests use `requireCatalogMatch: false` and assert
self-consistency only, as the existing artifact does. Record the artifact SHA-256 in the ledger.

The referee also writes a local query-vector cache under `eval/vectorize/results/` with its own
SHA-256, the `node -v` value, the `onnxruntime-node` version, and `process.platform`. A later
reproduction that yields a different query-vector hash is environment drift, not a new result.
The 2026-07 record of a divergent rebuild (mean cosine about 0.90, zero identical vectors) is the
reason these pins exist.

## 8. Files

New files:

- `eval/vectorize/clause-config.mjs` — clause extraction, `fit`, the swap pass, margins, policy id.
- `eval/vectorize/build-clause-artifact.mjs` — builds the artifact through `embedDocuments`.
- `eval/vectorize/clause-retrieval.mjs` — loads the artifact, embeds queries, builds `B`, scores it.
- `eval/vectorize/run-clause-fit.mjs` — the referee.
- `eval/vectorize/artifacts/qwen3-embedding-0.6b-q8-c25a394-clauses.json` — the pinned artifact.
- `test/eval-vectorize-clause-fit.test.mjs` — offline tests.

Edited files:

- `package.json` — two scripts: `eval:vectorize:clauses:build` and `eval:vectorize:clauses:run`.
- `eval/vectorize/README.md` — one dated section after the run, with the result tables.
- `eval/README.md` — one pointer line in the protocol-history section.

Reused unchanged: `eval/vectorize/frontier-config.mjs` (`MODEL`, `QUERY_TASK`, `queryText`,
`sha256`), `eval/vectorize/embedder.mjs`, `src/catalog/scoring.ts` exports (`scoreEntryWeighted`,
`scoreEntryWeightedUngated`), `eval/lib/grade.mjs`, `eval/lib/labels.mjs`,
`eval/discovery/lib.mjs` (`writeResult`, `resultStamp`).

Not touched: anything under `src/`, `catalog/manifest.json`, `scripts/build-catalog.mjs`,
`eval/gates.json`, `eval/protocol-history-cases.json`, `eval/protocol-history-blind-cases.json`,
`eval/holdout-cases.json`, `eval/run-routing.mjs`, `eval/run-protocol-history.mjs`.

## 9. Tests

All tests run offline without the model. Vector-dependent tests use small synthetic vectors. The
union membership tests use the real catalog and the frozen questions with lexical scoring only.

Clause extraction:

1. A fixture manifest and inventory produce the expected ordered clause list.
2. A Scout path whose `scout.<operationId>` is absent from the searchable manifest set produces no
   clause.
3. `x-routing.keywords`, `keywords`, and `routingKeywords` never appear in any clause text.
4. The sentence split drops pieces shorter than 12 characters and pieces starting with `Returns:`.
5. Clause order and `index` values are deterministic across two builds of the same input.
6. The four unmatched Scout operations get description clauses only, and the artifact records
   their ids.

No case leak:

7. No clause text contains any `id` or `question` from `eval/protocol-history-cases.json` or
   `eval/protocol-history-blind-cases.json`.

Union membership (must pass before the first artifact build):

8. For every one of the 19 frozen positive questions, `B` contains `scout.searchResearch`.
9. For every one of the 32 frozen questions, `B` has no duplicate ids, and every `R` entry failing
   `scoreEntryWeighted` carries `tier: "backfill"`.

Fit formula:

10. `fit` equals `pos` when the entry has no negative clause.
11. `fit` equals `pos` when `neg <= pos`.
12. `fit` equals `2*pos - neg` when `neg > pos`.

Swap pass:

13. `m = Infinity` returns the base order unchanged.
14. For `m > 0`, a candidate swaps at exactly `fit(prev) + m` and does not swap at
    `fit(prev) + m - 1e-9`.
15. At `m = 0`, equal `fit` values do not swap.
16. A candidate stops at the first preceding candidate it does not dominate.
17. `tier` and lexical `score` values are unchanged after the pass, including for a `backfill`
    entry that swapped into the top five.
18. Equal `fit` values keep base order at every `m`.

Artifact integrity:

19. The committed artifact is self-consistent: `vectorsSha256`, vector count equals clause count,
    1,024 dimensions, model revision `c25a394dd583836952667c12f008335071b3f43d`, runtime
    `@huggingface/transformers@4.2.0`.
20. A corrupt `textSha256` is accepted with `requireCatalogMatch: false` and refused with
    `requireCatalogMatch: true`.

Referee:

21. `shouldFail` returns `true` when no grid value passes acceptance.

The referee itself asserts at run time that the identity reading reproduces the `gates.json`
accepted totals and both frozen-contract baselines exactly: 4/8, 1/4, 3/11, 6/9. A calibration
failure aborts the run before any candidate reading is reported.

## 10. Commands

Setup, once:

```sh
npm ci
cp <placeholder> .dev.vars            # names only, as AGENTS.md describes
npm run typegen
```

Membership gate, then build and pin:

```sh
./node_modules/.bin/vitest run test/eval-vectorize-clause-fit.test.mjs   # tests 8–9 must pass first
npm run eval:vectorize:clauses:build  # first run fetches the pinned model revision
shasum -a 256 eval/vectorize/artifacts/qwen3-embedding-0.6b-q8-c25a394-clauses.json
```

Referee:

```sh
npm run eval:selftest
npm run eval:compile
npm run eval:vectorize:clauses:run -- --dump-dir <scratchpad>/clause-fit
```

The referee prints, per reading: both frozen-contract tables with the exact positive misses and
control captures by id, the four routing lanes with the `gates.json` verdict, the 495-case
changed-ranking count, the six named inspection cases, and the list of new `scout.searchResearch`
top-five captures. It writes one JSON result under `eval/vectorize/results/` and exits `1` unless
one grid value passes the full section 11 table.

Gates before the measurement commit:

```sh
./node_modules/.bin/vitest run test/eval-vectorize-clause-fit.test.mjs test/eval-discovery-vectorize.test.mjs
npm run typecheck
npm test
npm run build
npm run secrets:scan -- --tree
git diff --check
```

## 11. Acceptance

A grid reading passes only when all of these hold:

| Check | Required |
| --- | --- |
| `protocol-history-routing-v1` | 8/8 positives in the top five; 0/4 control captures |
| `protocol-history-blind-v1` | 11/11 positives in the top five; 0/9 control captures |
| Legacy 338 | top-1, top-3, top-5 each within ±3 hits of 208/279/311 (the `gates.json` 1% band) |
| Skills 23 | top-1 at or above the `gates.json` floor of 16 |
| Holdout 49 | top-1 at least 10; top-3 at least 22; top-5 at least 25; forbidden captures at most 11 |
| Extended 122 | strict at least 90/109/117; accept-either top-5 122/122 |
| `q-protocol-version-history-list` | strict top-1 stays `stellarDocs.search_protocol_concepts_docs` |
| 495-case comparison | every changed ranking listed; every new `scout.searchResearch` capture listed |

The six inspection cases, reported for every reading:

- `q-protocol-24-whisk-incident`
- `q-protocol-version-history-list`
- `q-pc-protocol-upgrade-timing`
- `q-sor-p23-auto-restore-extendto`
- `q-sor-x-ray-bn254-sdk-gap`
- `q-ti-run-tune-own-horizon`

Outcomes:

- `PASS`: at least one grid value passes the full table. Bank the result. The next step is a
  separate product design brief for production wiring, including the production margin policy.
  This experiment ships no production code.
- `PARTIAL`: a grid value reaches zero control captures and all gates but misses positives.
  `PARTIAL` is a ledger label only. The referee still exits `1`, and it prints the exact missed
  positive ids. Record the named candidate with its exact misses. A change to the positive bar is
  a ledger-level decision for the user.
- `FAIL`: no grid value reaches zero captures with the gates intact. The referee exits `1`. Bank
  the negative result in `eval/vectorize/README.md`. The next brief may select the cross-encoder.

The pure-fit reading never decides acceptance. It only bounds what clause fit can reach.

## 12. Strict attempt stop

- One clause-set definition. Section 4 is final before the first build. No clause source is
  added, removed, or reworded after the first referee run. The keyword exclusion is not reversed
  after the first build.
- The union membership tests (9.8 and 9.9) must pass before the artifact build starts.
- One artifact build. A second build is allowed only for a mechanical failure: a model load
  error, a payload-hash mismatch, or a clause-set drift error. A second build for a score reason
  is forbidden.
- One referee run over the five fixed readings. No `m` outside the grid. No reordering of the
  base-order rule. No change to the `fit` formula or the swap predicate.
- Do not inspect a miss and then change clause sources. The frozen contracts are acceptance data,
  not training data.
- Two model fetch attempts at most. If the pinned revision does not download twice, stop and
  record the failure.
- The attempt ends when the referee result and its ledger entry exist, whatever the outcome.
- After a `FAIL`, no follow-up experiment starts inside this round.

## 13. Review and closeout

Author: Codex GPT-5.6 Sol high. Orchestrator: Claude Fable 5 high. Reviewer: Grok 4.6 high. The
reviewer differs from both. Effort stays high.

Two review records exist for this experiment:

- Pre-implementation: `review-grok-clause-brief.md` (complete; verdict BLOCK; reconciled by this
  revision). A bounded delta review of sections 5, 6, 9, and 11 must PASS before the model fetch.
- Post-implementation: `review-grok-clause-fit.md`. The reviewer writes findings there and
  replies with the path.

The post-implementation review checks: the clause rules match section 4; no case text or golden
fact enters any clause; the union matches section 5, including the complete `R` and the tier
marking; the swap predicate matches section 6; the identity reading reproduces the baselines; the
grid and formula match this brief; and no `src/` file changed.

Closeout records: the artifact SHA-256, the query-vector cache SHA-256, the referee result stamp,
the per-reading tables with exact misses, the selected `m` if any, the changed-ranking list, and
the outcome label. The round ledger and `eval/vectorize/README.md` carry the record. Result JSON
files stay local.

## 14. Out of scope

- Any production model call, Vectorize binding, or Workers AI binding.
- Any change to `src/catalog/`, the manifest builder, or the frozen contracts.
- Production margin policy for `TIER_INTERLEAVE_MARGIN`; that belongs to the later product brief.
- The nine hostile `searchCatalog` unit tests; they belong to the later product-wiring brief.
- A cross-encoder pin, loader, or artifact.
- A paid QA arm. The companion plan defines that arm separately after a product commit exists.
- Any per-case, per-class, or per-entry tuning.
