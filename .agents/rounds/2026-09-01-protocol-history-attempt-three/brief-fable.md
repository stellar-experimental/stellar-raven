# Measurement brief — clause-support-fit-v1 (attempt three, cache-only, measurement only)

Date: 2026-09-01 (revised after `review-grok-hold.md`, verdict `BLOCK`, and after
`review-grok-hold-delta.md`, verdict `BLOCK` on D1 with D2–D6)
Lane: Mechanism brief (Claude, Fable 5, high)
Round ledger: `.agents/rounds/2026-09-01-protocol-history-attempt-three.md`
Prior attempts: `.agents/rounds/2026-08-31-eval-routing-next.md` (attempt one) and
`.agents/rounds/2026-08-31-protocol-history-cross-encoder-v1.md` (attempt two)
Parallel evidence lane: `evidence-terra.md` in this directory
Reconciliation record: `brief-reconciliation-fable.md` in this directory
Status: brief only. No model was fetched. No model ran. No paid call ran. No network call ran.
The retained score cache was not read. No production code, corpus label, frozen contract, gate,
or generated artifact changed.

## 1. Decision

Register one measurement-only experiment: `clause-support-fit-v1`.

The mechanism is multi-clause evidence aggregation. It reads the frozen attempt-two pair scores
from the retained cache. It replaces the max-clause fit with an independent-evidence
(noisy-OR) fit over each entry's positive clauses. It reranks the same candidate union by that
fit with a stable sort. It uses no margin, no grid, and no hysteresis sweep.

The experiment loads no model. It scores no pair. It changes no production code.

The first version of this brief recorded a hold. The review found three false claims in that
hold (`review-grok-hold.md`, B1 to B3). This revision withdraws those claims. It selects the
cache-only measurement instead. Section 1.2 gives the reason.

### 1.1 Attempt accounting

This brief spends no attempt. The one authorized referee run spends attempt three. That run may
start only after the review sequence in section 18 passes. Until then the slot stays unused
and reserved.

### 1.2 Why the measurement and not a hold

The review asked for one of two outcomes. The first is a pre-registered cache-only measurement.
The second is a hold with a predicted-fail reason that does not use lexical overlap.

A predicted-fail reason exists. Section 3.5 states it. The target holds 25 positive clauses.
No other entry holds more. The median entry holds 6. An aggregate that grows with support
raises the target on every query. The max-clause readings already captured 6 of 13 controls.

That reason is a prediction. It is not a measurement. The measurement costs minutes, no money,
and no network. It reads a cache that already exists. A measured result closes the question. A
predicted result leaves it open. This brief therefore selects the measurement.

The corpus-derived vocabulary class remains outside this box. It needs network use and an owner
decision. Section 16 keeps it as a trigger.

## 2. Verified facts at authoring

| Fact | Value |
| --- | --- |
| `HEAD` | `7c2c2857df1ed3696ec863eef3d2da80332c609c` (equal to `main`) |
| Tree | clean except the untracked round ledger and round directory |
| Protected paths since attempt-two revision `1bfb983` | `git diff --stat` over `src/`, `catalog/manifest.json`, `scripts/build-catalog.mjs`, `eval/gates.json`, both frozen contracts, `eval/holdout-cases.json`, `eval/routing-cases.json`, `eval/skills-cases.json`, `eval/build-question-overlay.json`, `eval/run-routing.mjs`, `eval/run-protocol-history.mjs`, `eval/self-test.mjs`, `inventory/stellar-light.json`: empty |
| `catalog/manifest.json` SHA-256 | `4945c3117d464d7155fe6bc2bd2f2f42638ef83159435ae48a90bab046dc6789` (equals the `gates.json` pin) |
| `eval/routing-cases.json` SHA-256 | `9e863cedc1f1754f67b3955bfe744254da6ae0d069502aefc7964530493fafd3` (equals the `gates.json` pin) |
| `eval/skills-cases.json` SHA-256 | `3ec4d90444489550f9ac9745384a4371cdbd0077dfc77a84597652d02f61ba1f` (equals the `gates.json` pin) |
| `eval/holdout-cases.json` SHA-256 | `cb34d83be86f63a0a4ba06977659afa91d0fbaecbeab0e86b82bef9d73c4bbf5` (equals the `gates.json` pin) |
| `eval/gates.json` SHA-256 | `95a4f7c1afb9ee3d7de517549994da1986d50411719cecfbb03226ab1bbbb371` |
| `eval/build-question-overlay.json` | frozen; read by the referee for accept-either labels |
| `eval/protocol-history-cases.json` SHA-256 | `df8218e1b3a5a1526859c4c33d9b565cfd23f38b9c835d22fd93322c8e5c8857`; content digest `5b8ee40f89c846c4e69fa91f5a483f9d224dd79628afa7f9ac45b522f9aaa8a8` |
| `eval/protocol-history-blind-cases.json` SHA-256 | `843aaa70c20eebe29d222a9f7e585a8ab6e722b88396b01c75079008d56446b3`; content digest `b63cfb605bd98aeba6981535be7bd5ee968e1e8b48ee92a1d55e4d5b07521f53` |
| `inventory/stellar-light.json` SHA-256 | `1a261c4a2e2172683e91a52ddc33b02ff41e74760c861dfacb29c60a8d8671b0`; `fetchedAt` `2026-08-28T12:50:57.417Z`; Scout `1.9.1` |
| `scripts/catalog-data/workflow-archetypes.mjs` SHA-256 | `beeea9b5ff48680e2f13a030dfd68f21f2d5c50ed4220733d8f1e6095a1b5c14` |
| Upstream `x-routing` for `GET /api/research` | `sha256(JSON.stringify(object))` = `468a9d9834e8cb50cb905f80ccc42f9d3daa7a3d0ff2d8c5194d566812ba716b`; 9 `useWhen`, 6 `exampleQuestions`, 91 `keywords`, 2 `notFor` |
| `scout.searchResearch` description SHA-256 | `80157277b8d9c834b1b3cc5a6aeab8ec89dea5ed2d449b434d8064cd4c798e43` |
| `scout.searchResearch` `routingKeywords` | 176 tokens |
| Searchable entries | 79 (60 operations and 19 whole skills) |
| Clause artifact SHA-256 | `e5f86644af89158c3ac4d61ee7f651e2a062c9d292f194cb94872c7eee4e71f4` |
| `clauseSetSha256` | `cc5df2e4d89522c580626cfc21727b927494f5f528f42acfa035187a211d89e5`; 683 clauses; 608 positive; 75 negative; 79 entries |
| Live clause reconstruction | `loadClauseSource()` rebuilt 683 clauses at `HEAD` with the same three input hashes and the same `clauseSetSha256` |
| Target clause counts | 25 positive (1 purpose, 9 useWhen, 6 exampleQuestion, 7 description, 2 workflow); 2 negative |
| Positive clause count over 79 entries | min 2; median 6; mean 7.70; max 25; the target ranks first |
| Entries with a negative clause | 25 |
| `src/catalog/scoring.ts` SHA-256 | `b8c84cb0c73b89e1ae624bb449bc305fac313e03ee844026763c8735fe8ef548` |
| `src/catalog/search.ts` SHA-256 | `04a9aa3d87451fc263aa4ee3df9b31ab8f05c0fcbe8371af5f31c7ed6458f846` |
| `src/catalog/vendor/search-scoring.ts` SHA-256 | `718924d10533ea49d472602f600ece0e4d7a0aae3e9e0ca5a95d9a8c6e611b14` |
| Attempt-two harness files (frozen, reused read-only) | `eval/vectorize/rerank-config.mjs` `2cb45a972ee6fc89f7bed13c795124a3a9e19485731b9e28c5538a5b12d4fe4d`; `eval/vectorize/rerank-retrieval.mjs` `26aa40f9d98f52684cc96c6f4bf28295c9d22a48a82d4e8ea285801522160116`; `eval/vectorize/run-rerank-fit.mjs` `788a6df923c1ac844fc83b428bfe52a531cf1e134274a0d9e894adc34066487f`; `eval/vectorize/clause-config.mjs` `39e0b2c42d845913541231dce90b8ecd0e949adc11c50eefea015b7cb291932e`; `eval/vectorize/clause-retrieval.mjs` `a99e32319d27fe66c92887299971da257a1938073dececc095e7201c29c27cd9` |
| Retained attempt-two cache directory | `~/.cache/stellar-raven/eval-results/cross-encoder-fit-v1-2026-08-31/`; two files; not read by this brief |
| Retained score cache file | `2026-08-31T23-36-38-565Z-cross-encoder-pair-scores.json`; 6,263,125 bytes on disk |
| Retained cache pins (from the attempt-two ledger) | file SHA-256 `fa1252fc8bfbf62b6f69bb8ca431cf603d2b512e4d0299b2ca0de0d7c2cec0bc`; `scoresSha256` `44c274680cd324d00aa16d240e21d3260005766d507a430e93c423e9c16fcd55`; record SHA-256 `ecea4c6981eb22a59d59b4b9434cad57732309e28504574e7ed483a01512fca1`; 563 queries; 383,273 scores |
| Attempt-two result | `FAIL`; stamp `2026-08-31T23-36-38-660Z-cross-encoder-fit-v1`; result SHA-256 `529351b1562b14f68d18ef94b584ca37ae61290f68cfff7a5a1489e8b601ae0d` |
| Attempt-one result | `FAIL`; stamp `2026-08-31T16-58-42-389Z-clause-fit-hysteresis-v1` |
| Frozen contract baselines | original 4/8 positives, 1/4 captures; blind 3/11 positives, 6/9 captures |
| Routing gate baselines | legacy 208/279/311 in the 1% band; skills top-1 floor 16; holdout 10/22/25 with at most 11 forbidden captures |
| QA regression inventory | 76 files under `eval/qa/corpus/battery/**` whose top-level `surface` array contains `scout.searchResearch`; sorted-id list SHA-256 `c88940063e3306f6afa279e9f004a0824fd9de5c674895aa98c09a657008e17a`; one more file (`q-hist-yieldblox-v2-2026-exploit`) mentions the id outside `surface`; the battery holds 500 JSON files |
| Node | `v24.13.0` |

The frozen baselines are not re-run in this brief. They hold by input-hash equality. Every
gated input matches its `gates.json` pin. No protected path changed after the verified
attempt-two identity reading.

## 3. Evidence status

This section states what the record shows. It states nothing more.

### 3.1 Measured readings of the two spent models

Both attempts used the same fit rule. The fit is the maximum positive clause score, minus excess
negative evidence. This brief calls that rule max-clause. The pure readings below rerank the
full candidate union by max-clause fit with no margin.

| Reading | Original positives / captures | Blind positives / captures | Routing gate |
| --- | --- | --- | --- |
| Lexical identity | 4/8; 1/4 | 3/11; 6/9 | pass |
| Attempt one, pure max-clause (Qwen bi-encoder) | 0/8; 2/4 | 2/11; 1/9 | fail |
| Attempt one, grid `m = 0.03` | 4/8; 1/4 | 4/11; 2/9 | fail |
| Attempt one, grid `m = 0.06` | 4/8; 1/4 | 4/11; 6/9 | fail |
| Attempt two, pure max-clause (`bge-reranker-base`) | 5/8; 2/4 | 3/11; 4/9 | fail (495 changed rankings) |
| Attempt two, grids `m = 0.05`, `0.10`, `0.20` | 4/8; 1/4 | 3/11; 6/9 | fail |

These readings bound two models under one fit rule. They do not bound other aggregation rules
over the same pair scores. The best measured blind top-five in the box is 4/11. Attempt one
reached it at `m = 0.03` and `m = 0.06`.

Attempt-two identity and every attempt-two grid missed eight blind positives. The pure
max-clause reading rescued `phb-auditor-auth-recursion-follow-up`. It missed
`phb-auth-recursion-auditors` instead. The intersection of all attempt-two readings is therefore
seven ids: `phb-whisk-forced-follow-up`, `phb-archival-defect-network-upgrade`,
`phb-core-upgrades-dates-features`, `phb-network-upgrades-reasons`,
`phb-second-cut-after-whisk`, `phb-cap-archival-fee-repair`, and
`phb-clawback-origin-emergency-changes`. The rescued case shows that a different scoring path
can move a prior miss.

### 3.2 Token reachability audit

The audit measures token reachability only. It counts which content tokens of a question exist
in the target's catalog text. It does not measure pair scores. It does not measure embeddings.
It does not measure rank order. It makes no claim about what a learned comparator can rank.

Method. The audit is free, offline, deterministic, and model-free. Its script is Appendix A. It
reads `catalog/manifest.json`, the two frozen contract files, `STOPWORDS` from
`src/catalog/scoring.ts`, and `tokenize` plus `normalizeSearchText` from
`src/catalog/vendor/search-scoring.ts`. Definitions:

- Content tokens `C(q)`: the vendor tokenizer output for the question, minus `STOPWORDS`,
  deduplicated.
- Scored view `S(e)`: the text the production scorer reads for a searchable entry `e`. It holds
  the id, the last id segment, the service, the kind, the description, `keywords`, and
  `routingKeywords`.
- Full view `F(e)`: `S(e)` plus every `description`, `enum` value, and property name in the
  entry's input and output schemas.
- Strict match: exact token, or a prefix overlap where the shorter token has at least four
  characters. The audit does not use the vendor raw-substring rule or the vendor short-token
  prefix rule. Section 3.4 explains why.
- Document frequency `DF(t)`: the number of the 79 searchable entries whose full view matches
  `t`. A token is rare when `DF(t) <= 8`.
- Catalog-absent: a token with `DF(t) = 0`.

Target: `scout.searchResearch`. Its scored view has 338 tokens. Its full view has 1,300 tokens.

Results, positives (19). `matched` counts strict matches against the target's full view.

| Case | `C(q)` | matched | rare target tokens (`DF`) | catalog-absent tokens |
| --- | ---: | ---: | --- | --- |
| `ph-protocol-24-archival-root-cause` | 10 | 5 | bug(1) | soon |
| `ph-protocol-corrective-upgrade-history` | 11 | 7 | upgrades(4), incident(3) | corrective, regression, caused |
| `ph-protocol-upgrade-chronology` | 13 | 7 | upgrades(4), upgrade(5) | trace, 19 |
| `ph-protocol-regression-remediation` | 12 | 7 | incident(3) | regression, root, cause, affected, remediation |
| `ph-yieldblox-oracle-incident` | 10 | 7 | yield(5), reflector(2), manipulation(1), incident(3), mortems(1) | blox, conclude |
| `ph-security-incident-postmortems` | 12 | 8 | mortems(1), incidents(3), recovery(3) | causes |
| `ph-soroban-auth-audit-history` | 8 | 7 | recursion(1), vulnerability(2) | remediated |
| `ph-protocol-feature-origin` | 12 | 4 | incident(3) | driven |
| `phb-whisk-forced-follow-up` | 8 | **0** | none | rushed, whisk, eviction, matter |
| `phb-archival-defect-network-upgrade` | 11 | 5 | explain(3), upgrade(5) | defect, cut |
| `phb-auth-recursion-auditors` | 8 | 6 | recursion(1) | none |
| `phb-core-upgrades-dates-features` | 11 | 8 | upgrades(4) | p19, onward |
| `phb-yieldblox-reflector-manipulation` | 6 | 3 | yield(5), reflector(2) | blox, manipulated |
| `phb-network-upgrades-reasons` | 12 | 7 | upgrade(5) | nineteen, onward |
| `phb-second-cut-after-whisk` | 8 | 2 | none | cut, whisk |
| `phb-cap-archival-fee-repair` | 9 | 2 | none | cleaned, eviction, stroop, repair |
| `phb-auditor-auth-recursion-follow-up` | 9 | 6 | otter(2), sec(2), certora(2), recursion(1) | none |
| `phb-clawback-origin-emergency-changes` | 7 | **0** | none | emergency |
| `phb-whisk-post-mortem` | 6 | 2 | mortem(1) | whisk |

Results, controls (13).

| Case | `C(q)` | matched | rare target tokens (`DF`) | catalog-absent tokens |
| --- | ---: | ---: | --- | --- |
| `ph-control-current-protocol` | 5 | **5** | none | none |
| `ph-control-validator-vote` | 6 | 4 | vote(5), upgrade(5) | none |
| `ph-control-soroban-deploy` | 5 | 3 | none | none |
| `ph-control-clawback-cap` | 5 | 3 | none | none |
| `phb-control-protocol-xdr-bug` | 7 | 3 | bug(1) | encoding |
| `phb-control-contract-fail-after-upgrade` | 5 | 3 | upgrade(5) | none |
| `phb-control-incident-runbook` | 5 | 2 | incident(3) | runbook |
| `phb-control-contract-exploit-review` | 6 | 4 | exploit(1), reviewing(3) | none |
| `phb-control-sdk-version-history` | 5 | 3 | none | none |
| `phb-control-cap-history-sep-support` | 5 | **5** | none | none |
| `phb-control-kyc-breach-report` | 5 | 2 | kyc(5) | breach |
| `phb-control-client-protocol-version-failure` | 8 | 3 | none | none |
| `phb-control-failed-deploy-post-mortem` | 6 | 3 | mortem(1) | none |

Summary:

| Measure | Positives (19) | Controls (13) |
| --- | ---: | ---: |
| Cases with at least one catalog-absent token | 17 | 3 |
| Cases with zero matched tokens on the target's full view | 2 | 0 |
| Cases with no rare target token | 4 | 6 |
| Mean rare target tokens per case | 1.53 | 0.69 |
| Mean common target tokens per case | 3.37 | 2.62 |

Reading. Two blind positives share no content token with the target's full catalog text. They
are `phb-whisk-forced-follow-up` and `phb-clawback-origin-emergency-changes`. The two spent
models missed both under every recorded reading. That is a measured fact about those two models
and the max-clause rule. It is not a statement about other comparators or other aggregates.
The token `archival` sits on four Docs operations and not on the target. The token `clawback`
sits on three non-target entries. Those tokens give competitors distinctive lexical evidence on
five positives. That is a ranking conflict in the lexical scorer. It is not a bound on a learned
score.

The independent review reproduced the two zero-overlap results and the 32-question summary on
the pinned inputs (`review-grok-hold.md`).

### 3.3 Control-side coupling

Two controls match the target's own upstream text on every content token. They are
`ph-control-current-protocol` and `phb-control-cap-history-sep-support`. Seven controls carry a
rare target token. The target's `source` enum advertises `release`, `cap`, `sep`, and
`incident`. Its description advertises incident reports and audits.

The pure max-clause readings captured controls on both contracts (2/4 and 4/9 under the
cross-encoder). This shows that the learned score also reads those controls as research-shaped.
Any mechanism that raises the target's rank on generic history and incident phrasing can raise
it on these controls. The acceptance table requires 19/19 and 0/13 together. The measurement in
section 5 tests whether multi-clause aggregation separates the two sets.

### 3.4 An observation about the vendor match rules (monitor-only)

The first audit run used the vendor match rules. Those rules are exact token, prefix overlap
with no minimum length, and raw substring. Under those rules the target matched `archival` with
`DF` 68 and `after` with `DF` 66. It also matched `auth` with `DF` 72, `am` with `DF` 73, and
`anchor` with `DF` 74. The vendor tokenizer keeps one-character tokens. A description that contains `a` therefore
prefix-matches every query token that starts with `a`. The strict rule removes this effect.

This is a property of the untouched vendored upstream math. It is a single-source observation.
It is recorded for the closeout owner. It is not a finding, a fix, or a reason to edit the
vendor file.

### 3.5 Clause-count asymmetry

The frozen clause set gives the target 25 positive clauses. No other entry has more. The next
entries are `scout.searchProjects` (21), `scout.analyzeEcosystem` (19), `scout.getBuilders`
(19), `lumenloop.search_content_semantic` (18), and `scout.searchRepos` (18). The median entry
has 6. The mean is 7.70.

An aggregate that grows with the number of supporting clauses favors the target on every query.
This is the pre-registered flood risk for the mechanism in section 5. It is also the reason the
mechanism can move positives that max-clause missed. The measurement decides which effect
dominates. This brief does not predict the result as a fact.

## 4. Mechanism classes considered

Each row states three properties of a class. Is it distinct from the two spent attempts? Is it
general under the anti-overfitting rules? Does it fit a free measurement-only box? The four
families in `evidence-terra.md` are included by number.

| Class | Distinct | General | Free, offline, no model, no network | Disposition |
| --- | --- | --- | --- | --- |
| Multi-clause evidence aggregation over the retained cross-encoder scores (Terra family 3) | **yes** | yes | yes (cache-only) | **Selected.** Neither spent attempt tested an aggregate other than max-clause. The queue excludes the two spent models at a registered hysteresis grid. It does not exclude a different aggregation over frozen scores with no grid. Section 5 registers one aggregate. |
| Per-clause lexical route fit (BM25 or IDF-weighted coherent max over the frozen clauses) | yes | yes | yes | Not selected. It is a third max-clause comparator. The two spent max-clause readings are the closest measured evidence. A lexical per-clause comparator adds no new evidence class. |
| Source-need classification with calibrated abstention (Terra family 1) | yes | only if it reads no case text | yes | Not selected. Its signals are score gap, family count, tier, and coverage. No result shows those signals separate the 13 controls from the 19 positives. The lexical page already captures six blind controls on generic phrasing. |
| Set-level marginal evidence diversification (Terra family 2) | yes | yes | yes | Not selected. Source variety is not relevance. The 2026-08-30 full-page result is the measured example of one insertion that worsened controls. |
| Recovery-graph route expansion (Terra family 4) | yes | yes | yes | Not a contract candidate. `deriveWiderCandidates` returns advisory guidance outside the ranked page. The contract counts top-five hits only. |
| Full-page or scope-based backfill without a reranker | yes | yes | yes | Measured negative on 2026-08-30 (three variants). |
| Query-side alias canonicalization for entities (`whisk` → `protocol 23`) | yes | **no** | yes | Forbidden. `QUERY_TOKEN_ALIASES` is curated from domain abbreviations, never from eval questions. An entity alias table built from the frozen positives is per-question vocabulary. |
| Corpus-derived route vocabulary (document expansion of the target card from a sample of the corpus it searches) | yes | yes, if the sample rule is query-independent | **no** (needs a keyless Scout fetch at artifact-build time) | Not in this box. It is the only class that can place `whisk` and `eviction` on the card. It also strengthens the target on `release`, `cap`, and `sep` vocabulary. It needs a pinned sample-selection rule, drift handling, a flood measurement, and a network pre-registration. Section 16 keeps it as trigger T3 under an owner decision. |
| Route-by-evidence (probe candidate services at search time and rank by what returns) | yes | yes | **no** (network per search) | Out of scope. It changes the `search` architecture, cost, and latency. |
| Upstream `x-routing` change for `GET /api/research` | not ours | not ours | n/a | Not spent here. `.agents/TODO.md` records on 2026-08-31 that no `improvements/` finding applies. Trigger T1 covers an upstream change. |
| Re-examination of the frozen control set or the 19/19 bar | n/a | n/a | n/a | An owner decision under trigger T2. This brief changes neither contract. |

## 5. Mechanism: `clause-support-fit-v1`

### 5.1 Causal claim

One clause can be ambiguous. Several independent clauses can jointly identify an entry's
evidence role. A max-clause fit lets one strong clause win. An entry with one lucky clause can
beat an entry with many moderate clauses. Independent-evidence aggregation counts every
supporting clause. If the claim holds, the target rises on history and incident questions. The
controls then stay below the page.

### 5.2 Inputs

- Pair scores `s(q, c)`: the cached sigmoid scores from attempt two. Each is a float in
  `[0, 1]`. `validateScoreCache` already enforces that range. No score is recomputed.
- Clauses: the 683 frozen clauses, reconstructed by `loadRerankClauseArtifact()` with
  `requireCatalogMatch: true`. Each clause carries `entryId` and `role` (`positive` or
  `negative`).
- Candidate union `B(q)`: section 5.5.

### 5.3 Score function

For query `q` and entry `e` with positive clauses `P(e)` and negative clauses `N(e)`:

- `pos(e) = 1 - Π_{c ∈ P(e)} (1 - s(q, c))`
- `neg(e) = 1 - Π_{n ∈ N(e)} (1 - s(q, n))`; `neg(e) = 0` when `N(e)` is empty
- `fit(e) = pos(e) - max(0, neg(e) - pos(e))`

`pos` is the noisy-OR of the positive clause scores. It is a support-growing transform under an
independence assumption. It is not a calibrated probability, because the cached values are
sigmoid outputs of raw logits. It equals the single score when an entry has one positive
clause. It is order-independent. It is monotone in every clause score. It is bounded in
`[0, 1]`.

The negative rule is the attempt-one and attempt-two rule, unchanged. Only the positive and
negative aggregates change from maximum to noisy-OR. This isolates the aggregation change.

Numerics. The implementation computes `pos` and `neg` in log space:
`1 - exp(Σ log1p(-s))`. When any `s` equals `1` exactly, the aggregate is `1`. Every entry in
`B(q)` has at least one positive clause by construction of the clause set. The implementation
still returns `Number.NEGATIVE_INFINITY` for an entry with no positive clause. `clauseFit` does
the same.

### 5.4 Normalization

None. The cached scores are already sigmoid outputs in `[0, 1]`. The noisy-OR output stays in
`[0, 1]`. No clause-count normalization is applied. That choice is deliberate: normalization by
clause count would remove the support effect the causal claim tests. Section 3.5 records the
resulting flood risk before the run.

### 5.5 Candidate union, base order, and tier marking

The union restates attempt two, section 7, exactly:

1. `P5 = searchCatalog(catalog, { query, limit: 5 })`, the production page with its production
   `score` and `tier`.
2. `R` = every remaining searchable entry not in `P5` whose
   `scoreEntryWeightedUngated(projection, query)` is non-null. `R` is ordered by that ungated
   score descending, then by `id` ascending.
3. Projection for `R`: `{ id, name: entry.id, service, kind, description, keywords, routingKeywords }`.
4. Base order `B = P5 ++ R`.
5. Tier marking: a `P5` hit keeps its production tier. An `R` entry whose
   `scoreEntryWeighted(projection, query)` is null is `tier: "backfill"`. Every other `R` entry is
   `tier: "gated"`.

The implementation calls `buildCandidateUnion` from `eval/vectorize/rerank-retrieval.mjs`. The
cached `pairIndex` for each query must equal `pairIndexForBase(B(q), clauses)`. That equality is
enforced by `validateScoreCache(cache, { questions, pairIndex })`. A mismatch stops the run.

### 5.6 Ordering and tie rule

The candidate reading is a stable descending sort of `B(q)` by `fit`. Ties keep base order. The
first five hits return with their `tier` and lexical `score` unchanged.

This ordering equals `applyRerankHysteresis(B, fits, 0)` from attempt two. With `m = 0`, that
one-pass insertion moves each candidate left across every strictly smaller predecessor. The
result is a stable descending sort. The implementation may call that function with `0`, or may
implement the stable sort directly. A test asserts that both produce the same order on
synthetic inputs (section 12, test 8). There is no margin, no grid, and no other reading of the
candidate policy.

### 5.7 Readings

The referee derives three readings from one cache read:

| Reading | Fit rule | Ordering | Role |
| --- | --- | --- | --- |
| identity | none | base order `B` | calibration; must reproduce the lexical baseline exactly |
| max-clause | attempt-two `clauseFit` (maximum) | stable sort, `m = 0` | calibration; must reproduce the attempt-two pure max-clause reading exactly |
| support-fit | section 5.3 noisy-OR | stable sort | the one candidate reading |

The max-clause reading is a calibration, not a candidate. It proves that the cache read path,
the union, the pair index, and the grading code equal attempt two's. It is not a second grid
point.

## 6. Frozen inputs and cache identity

The referee reads the cache path from `RAVEN_SUPPORT_CACHE_PATH`. It performs these checks
before it parses the file:

1. The file's byte SHA-256 equals
   `fa1252fc8bfbf62b6f69bb8ca431cf603d2b512e4d0299b2ca0de0d7c2cec0bc`.

After parsing, it checks:

2. `validateScoreCache(cache, { questions, pairIndex })` passes. This pins `experiment`
   `cross-encoder-fit-v1`, the frozen `RERANK_MODEL` object, and `batchSize` 16. It pins
   `clauseArtifactSha256` `e5f86644…` and `clauseSetSha256` `cc5df2e4…`. It pins the 563-query
   order, the per-query `pairIndex`, the score range, and the environment fields.
3. `cache.scoresSha256` equals `44c274680cd324d00aa16d240e21d3260005766d507a430e93c423e9c16fcd55`.
4. `scoreCacheRecordSha256(cache)` equals
   `ecea4c6981eb22a59d59b4b9434cad57732309e28504574e7ed483a01512fca1`.
5. The decoded score count equals 383,273.

The referee also checks, before the cache read:

6. `git rev-parse HEAD` equals `RAVEN_SUPPORT_IMPLEMENTATION_COMMIT`, the reviewed
   implementation commit recorded in the ledger.
7. `loadRerankClauseArtifact()` passes. This pins the clause artifact file hash, the clause set
   hash, the manifest, the inventory, and the archetypes.
8. `npm run eval:selftest` and `npm run eval:compile` passed in the same session. The ledger
   records both.

The referee opens the cache read-only. It writes nothing under `~/.cache/stellar-raven/`. It
writes its result under `eval/vectorize/results/`, which is gitignored. After the run, the
result file is copied to a new directory
`~/.cache/stellar-raven/eval-results/clause-support-fit-v1-<date>/`. The attempt-two directory
is never written.

Referee dataset. `buildRefereeDataset` from `run-rerank-fit.mjs` builds the rows:

- Comparison rows, 495: legacy 338, extended 122, skills 23, original 8 positives, original 4
  controls.
- Holdout rows, 49.
- Blind rows, 20: 11 positives, 9 controls.
- Total rows 564; unique questions 563 (first-seen order, comparison then holdout then blind).

## 7. Identity calibration

The run aborts before the candidate reading unless both calibrations hold exactly.

Identity reading:

- `gates.json` accepted totals: legacy 208/279/311 with `cardHit5` 95 of 182; skills 16/23/23
  with `cardHit5` 23 of 23; holdout 10/22/25, `cardHit5` 25, 11 forbidden captures, 21 passed.
- Original contract 4/8 top-five positives and 1/4 captures. Blind contract 3/11 and 6/9.
- Zero changed rankings against itself.

Max-clause reading, from the attempt-two ledger (referee closeout, 2026-08-31):

- Original: top-1/3/5 of `3/4/5`; 2/4 control captures. Misses
  `ph-protocol-24-archival-root-cause`, `ph-protocol-corrective-upgrade-history`,
  `ph-protocol-upgrade-chronology`. Captures `ph-control-current-protocol`,
  `ph-control-validator-vote`.
- Blind: top-1/3/5 of `2/2/3`; 4/9 control captures. Misses `phb-whisk-forced-follow-up`,
  `phb-archival-defect-network-upgrade`, `phb-auth-recursion-auditors`,
  `phb-core-upgrades-dates-features`, `phb-network-upgrades-reasons`,
  `phb-second-cut-after-whisk`, `phb-cap-archival-fee-repair`,
  `phb-clawback-origin-emergency-changes`. Captures `phb-control-incident-runbook`,
  `phb-control-sdk-version-history`, `phb-control-kyc-breach-report`,
  `phb-control-failed-deploy-post-mortem`.
- Changed rankings: 495 of 495. Routing gate: `FAIL`.

The max-clause legacy, skills, holdout, and extended totals are stored in the retained result
file. The ledger did not print them. The referee records the recomputed totals. The result
verifier (section 18) compares them with the retained result file. This brief does not read that
file.

## 8. Acceptance table and outcome labels

The support-fit reading passes only when all of these hold. The table is attempt two, section
10, unchanged.

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

The six inspection cases are reported for every reading: `q-protocol-24-whisk-incident`,
`q-protocol-version-history-list`, `q-pc-protocol-upgrade-timing`,
`q-sor-p23-auto-restore-extendto`, `q-sor-x-ray-bn254-sdk-gap`, `q-ti-run-tune-own-horizon`.

Outcome labels:

- `PASS`: the support-fit reading passes the full table. Bank the result. The next step is a
  separate product design brief. This experiment ships no production code.
- `PARTIAL`: the support-fit reading reaches zero control captures on both contracts. Every
  routing gate stays intact. Some positives are missed. The referee exits `1` and prints the
  missed ids. A change to the positive bar is an owner decision under trigger T2.
- `FAIL`: the support-fit reading does not qualify. The referee exits `1`. Bank the negative
  result in `eval/vectorize/README.md`. Attempt three is then spent.

There is no selection rule among readings, because there is one candidate reading.

## 9. Result schema

The referee writes one JSON file under `eval/vectorize/results/` with `resultStamp` and
`writeResult`:

| Field | Content |
| --- | --- |
| `schemaVersion` | `1` |
| `experiment` | the literal string `clause-support-fit-v1`. The referee never writes the imported `EXPERIMENT` constant from `rerank-config.mjs` here; that constant is `cross-encoder-fit-v1` and belongs to the cache. |
| `stamp` | the result stamp |
| `outcome` | `PASS`, `PARTIAL`, or `FAIL` |
| `aggregate` | `{ positive: "noisy-or", negative: "noisy-or", fit: "pos - max(0, neg - pos)", ordering: "stable-sort-desc", ties: "base-order" }` |
| `source` | `{ experiment: "cross-encoder-fit-v1", cachePath, cacheSha256, scoresSha256, recordSha256, queries: 563, scores: 383273 }` |
| `artifact` | `{ path, sha256 }` of the clause artifact |
| `implementationCommit` | the 40-character commit |
| `readings[]` | three rows: `identity`, `max-clause`, `support-fit` |
| `readings[].original`, `readings[].blind` | per contract: `top1`, `top3`, `top5`, `controlTop5Captures`, `positiveMisses[]`, `controlCaptures[]`, `rows[]` with `targetRank` and `topHits` |
| `readings[].legacy`, `readings[].skills`, `readings[].holdout`, `readings[].extended` | the same lane totals attempt two recorded, including `forbiddenCaptures`, `passed`, `strict`, and `acceptEither` |
| `readings[].protocolVersionTop1` | the strict top-1 id for `q-protocol-version-history-list` |
| `readings[].changedRankings[]` | `{ id, before, after }` against identity, over the 495 comparison rows |
| `readings[].newTargetCaptures[]` | comparison ids newly showing `scout.searchResearch` in the top five |
| `readings[].inspectionCases[]` | the six inspection ids with their top-five ids |
| `readings[].rankings` | the full 495-row top-five id lists |
| `readings[].routingGate`, `readings[].acceptance` | the gate verdict with failures, and the acceptance verdict |
| `calibration` | `{ identity: "PASS", maxClause: "PASS" }`; the run does not reach the result file otherwise |
| `environment` | `node`, `platform`; the cache's recorded `onnxruntimeNode` and `probeScoreSha256` are copied as `sourceEnvironment` |

Result JSON files stay local. The ledger records the result SHA-256 and the stamp.

## 10. Cache-only proof

Five independent facts show that the run scores no pair and loads no model:

1. Import graph. The referee's top-level static `import` declarations name only
   `rerank-config.mjs`, `rerank-retrieval.mjs`, `run-rerank-fit.mjs` (for `validateScoreCache`,
   `scoreCacheRecordSha256`, `decodeFloat32Scores`, `loadRefereeInputs`,
   `buildRefereeDataset`), `../lib/grade.mjs`, `../lib/labels.mjs`, `../discovery/lib.mjs`, and
   Node built-ins. The referee does not import `shouldFail` from `run-rerank-fit.mjs`; it
   defines its own (section 11). None of those modules names `rerank-scorer.mjs`,
   `embedder.mjs`, `@huggingface/transformers`, or `onnxruntime-node` in a top-level static
   import. `run-rerank-fit.mjs` calls `import("./rerank-scorer.mjs")` and
   `require("onnxruntime-node/package.json")` only inside its `main()`. That `main()` runs only
   when `process.argv[1]` is that module, so it does not run on import. The referee also makes
   one dynamic import of `src/catalog/search.ts`, for `loadManifest` and `searchCatalog`, as
   attempt two did. That file is the lexical scorer and loads no model. Test 12 asserts the
   static import graph; it does not follow `import()` or `require()` calls.
2. No model directory. The referee never reads `RAVEN_RERANK_MODEL_DIR` or
   `RAVEN_VECTORIZE_MODEL_DIR`. Test 13 runs the referee's module import with both unset.
3. Byte identity. The cache file hash, `scoresSha256`, and record hash must equal the
   attempt-two ledger values before any reading.
4. Max-clause calibration. The recomputed max-clause reading must equal the attempt-two pure
   reading exactly (section 7). A rescored or reordered cache cannot reproduce it.
5. Time. The attempt-two referee ran for hours over 383,273 pairs. A cache-only run over the
   same pairs completes in minutes. The ledger records wall-clock start and end.

## 11. Files

New files, implementation phase only, after the delta review passes:

- `eval/vectorize/run-support-fit.mjs` — the referee and the aggregation functions
  (`noisyOr`, `supportFit`, `entrySupportFits`, `stableSortByFit`, the reading builder, the
  calibration checks, a local `shouldFail`, and `main`). The local `shouldFail` inspects the
  support-fit reading only. It returns `true` unless that reading passes the full section 8
  table. `PARTIAL` therefore returns `true`. It is not the attempt-two export, which looks for
  grid readings that this experiment does not have.
- `test/eval-vectorize-support-fit.test.mjs` — offline tests (section 12).

Edited files:

- `package.json` — one script: `eval:vectorize:support:run`.
- `eval/vectorize/README.md` — one dated section after the run, with the result tables.
- `eval/README.md` — one pointer line in the protocol-history section, after the run.
- This round's ledger and lane files under
  `.agents/rounds/2026-09-01-protocol-history-attempt-three/`.

Forbidden, byte-for-byte:

- Everything under `src/`, `catalog/manifest.json`, `scripts/build-catalog.mjs`,
  `scripts/catalog-data/workflow-archetypes.mjs`, and `inventory/`.
- `eval/gates.json`, `eval/protocol-history-cases.json`, `eval/protocol-history-blind-cases.json`,
  `eval/holdout-cases.json`, `eval/routing-cases.json`, `eval/skills-cases.json`,
  `eval/build-question-overlay.json`, `eval/run-routing.mjs`, `eval/run-protocol-history.mjs`,
  `eval/self-test.mjs`.
- Every attempt-one file: `clause-config.mjs`, `clause-retrieval.mjs`, `build-clause-artifact.mjs`,
  `run-clause-fit.mjs`, `preflight-clause-model.mjs`, `embedder.mjs`, `frontier-config.mjs`, and
  both artifacts under `eval/vectorize/artifacts/`.
- Every attempt-two file: `rerank-config.mjs`, `rerank-retrieval.mjs`, `rerank-scorer.mjs`,
  `fetch-rerank-model.mjs`, `preflight-rerank-model.mjs`, `run-rerank-fit.mjs`,
  `test/eval-vectorize-rerank-fit.test.mjs`.
- Both retained files under `~/.cache/stellar-raven/eval-results/cross-encoder-fit-v1-2026-08-31/`
  and every model snapshot under `~/.cache/stellar-raven/`.
- Golden corpus files and everything under `eval/qa/`.

## 12. Tests

All tests run offline without the cache and without a model. Score-dependent tests use small
synthetic score tables. Union tests use the real catalog with lexical scoring only. All tests
must pass before the referee.

Aggregate:

1. `noisyOr([s])` equals `s` for one clause; `noisyOr([0.5, 0.5])` equals `0.75`;
   `noisyOr([])` equals `0`.
2. `noisyOr` is order-independent: a permutation of the inputs gives the same value.
3. `noisyOr` is monotone: raising one input never lowers the output.
4. `noisyOr` returns `1` when any input equals `1`, and stays finite for inputs near `1`.
5. `supportFit` equals `pos` when the entry has no negative clause; equals `pos` when
   `neg <= pos`; equals `2*pos - neg` when `neg > pos`.
6. `entrySupportFits` groups pair scores by `entryId` and `role` through `pairIndex`, and returns
   `Number.NEGATIVE_INFINITY` for an entry with no positive clause.

Ordering:

7. `stableSortByFit` sorts descending by fit and keeps base order on equal fits.
8. `stableSortByFit(B, fits)` equals `applyRerankHysteresis(B, fits, 0)` on random synthetic
   inputs, including ties.
9. `tier` and lexical `score` values are unchanged after the sort.

Union and pair index (re-asserted against the frozen helpers):

10. For every one of the 19 frozen positive questions, `B` contains `scout.searchResearch`.
11. For every one of the 32 frozen questions, `pairIndexForBase(B, clauses)` is strictly
    increasing and lists only clauses whose `entryId` is in `B`.

Cache-only guards:

12. The test walks top-level static `import` declarations only. It starts at
    `eval/vectorize/run-support-fit.mjs`. It follows each relative specifier that appears in a
    top-level static `import` declaration of a file under `eval/`. It does not follow
    `import()` calls. It does not follow `require()` calls. It does not enter `main()`. The
    walked set must contain none of `rerank-scorer.mjs`, `embedder.mjs`,
    `fetch-rerank-model.mjs`, `preflight-rerank-model.mjs`, and `preflight-clause-model.mjs`.
    No top-level static specifier in the walked set may start with `@huggingface` or
    `onnxruntime`.
13. Importing the referee with `RAVEN_RERANK_MODEL_DIR`, `RAVEN_VECTORIZE_MODEL_DIR`, and
    `RAVEN_SUPPORT_CACHE_PATH` unset constructs nothing and throws nothing.
14. A synthetic cache whose file hash, `scoresSha256`, or record hash differs from the pins is
    refused before any reading.
15. A synthetic cache with the pinned shape and planted scores produces the planted support-fit
    order, with no model call.

Calibration and outcome:

16. The identity check rejects a synthetic reading that differs in any field. The compared
    fields are the `gates.json` totals and the frozen contract baselines.
17. The max-clause check rejects a synthetic reading that differs from the section 7
    expectations in any field.
18. The local `shouldFail` returns `true` unless the support-fit reading passes the full
    acceptance table. `PARTIAL` still returns `true`. The test also asserts that the referee
    module does not re-export the attempt-two `shouldFail`.

## 13. Validation commands

Before the referee (implementation gates):

```sh
./node_modules/.bin/vitest run test/eval-vectorize-support-fit.test.mjs
npm run typecheck
npm test
npm run build
npm run secrets:scan -- --tree
git diff --check
```

Referee preconditions, then the one referee:

```sh
npm run eval:selftest
npm run eval:compile
RAVEN_SUPPORT_IMPLEMENTATION_COMMIT=<40-char commit> \
RAVEN_SUPPORT_CACHE_PATH="$HOME/.cache/stellar-raven/eval-results/cross-encoder-fit-v1-2026-08-31/2026-08-31T23-36-38-565Z-cross-encoder-pair-scores.json" \
npm run eval:vectorize:support:run -- --dump-dir <scratchpad>/support-fit
```

No fetch command exists for this experiment. No preflight exists, because no model loads.

## 14. Stop states and stop rules

- `BLOCKED-ASSETS`: the cache file is missing, or one of its pins does not match. The pins are
  the file hash, `scoresSha256`, the record hash, the query order, and `pairIndex`. The same
  state applies when `loadRerankClauseArtifact()` fails because the live catalog drifted. Stop
  and record. No repair path exists inside this attempt. The attempt is not spent.
- `BLOCKED-CALIBRATION`: the identity reading or the max-clause reading does not reproduce its
  expected values. Stop before the candidate reading. Record the exact field. The attempt is not
  spent. A reviewed finish plan may repair only the mechanical cause.
- `BLOCKED-RUNTIME`: the referee crashes before it writes a result. Stop and record. The same
  reviewed-finish rule applies.
- `PASS`, `PARTIAL`, `FAIL`: section 8. Each is terminal and spends attempt three.

One referee invocation runs all three readings. No second referee runs for a score reason.
Inspecting a miss authorizes nothing: no second aggregate, no margin, no clause edit, no
normalization, no rerun.

## 15. Pre-registered predictions and guards

Predictions, recorded before the run so the result cannot be read as a surprise either way:

- P1, gate risk. The max-clause reading changed 495 of 495 rankings and failed the routing gate.
  The support-fit reading also reranks by model evidence alone. It may fail the gate for the
  same reason.
- P2, flood risk. Section 3.5: the target has 25 positive clauses against a median of 6.
  Noisy-OR grows with support. Control captures may rise above the max-clause 2/4 and 4/9.
- P3, recall. The rescued case in section 3.1 shows that a different scoring path can move a
  prior miss. Blind top-five may exceed 4/11.

None of these predictions changes the acceptance table. The result decides.

Leakage guards, by construction:

- The clause set was built from the catalog, the inventory, and the archetypes before attempt
  one. Attempt one's test verified that no clause contains a frozen case id or question. The set
  is frozen by hash.
- The cache holds query hashes, pair indexes, and scores. It holds no case id, class, expected
  operation, or golden field. The aggregation reads scores through `pairIndex` only.

Tuning guards, by pre-registration:

- One aggregate (noisy-OR). One negative rule (unchanged). One ordering (stable sort). No
  margin. No grid. No normalization. No per-case, per-class, per-service, or per-entry value.
- One cache. One referee invocation. One result file.
- The frozen contracts are acceptance data, not training data.

## 16. After the result: triggers

These triggers apply after the referee, or if the run never starts.

- **T1 — Upstream card change.** Two hashes change together. `inventory/stellar-light.json`
  SHA-256 differs from `1a261c4a…8671b0`. The `x-routing` object hash,
  `sha256(JSON.stringify(openapi.paths["/api/research"].get["x-routing"]))`, differs from
  `468a9d98…ba716b`. Action: the drift lane runs `npm run eval:protocol-history` on the rebuilt
  catalog. It records both contract counts. The clause artifact then fails
  `requireCatalogMatch`. Every cache-based reading is closed until a new reviewed artifact
  exists.
- **T2 — Owner decision on the contract.** The user records a decision in `.agents/NEXT.md`.
  The decision re-examines the control set or the 19/19 positive bar. Action: a new brief
  states the changed acceptance table first. It cites the decision's ledger reference.
- **T3 — Non-card evidence source.** A brief for corpus-derived route vocabulary from the
  `scout.searchResearch` corpus. Another evidence source outside the catalog text qualifies only
  when the brief names it. T3 needs an owner decision to open a new box. Attempt three is
  reserved or spent by this brief. The T3 brief must pre-register each of these items:
  - the query-independent sample rule;
  - the exact endpoints, request count, and byte budget of every network call;
  - the artifact schema and hashes;
  - the drift rule;
  - the flood metrics: holdout forbidden captures; new `scout.searchResearch` top-five captures
    over the 495 comparison rows; and the 76-case QA regression inventory, pinned in section 2
    by its derivation rule and sorted-id hash;
  - the leakage test that no sample text contains a frozen id or question;
  - the same acceptance table.
  Its independent review must pass before any fetch.
- **T4 — New live routing evidence.** Two or more unrelated production or QA cases show the same
  protocol-history routing miss. Each case has a transcript. Action: an own-repo TODO note and a
  token reachability audit of the new cases. Then a decision under T2 or T3. One case does not
  open a box.

A trigger authorizes a brief. It does not authorize a fetch, a run, a production edit, or a paid
lane.

## 17. Pre-registration register

| Item | Value |
| --- | --- |
| Inputs | Section 2 table; the retained cache pinned by three hashes; the clause artifact; the frozen helpers. |
| Frozen contracts | `protocol-history-routing-v1` (8 positives, 4 controls) and `protocol-history-blind-v1` (11 positives, 9 controls). Unchanged. Target `scout.searchResearch`. Positives in the top five; controls never in the top five. |
| Exact metrics | Per contract: top-1, top-3, top-5 positives; control top-five captures; miss and capture id lists. Per lane: the `gates.json` totals, holdout forbidden captures, extended strict and accept-either. Per reading: changed rankings over 495 rows, new target captures, six inspection cases. |
| Gates | The section 8 table, unchanged from attempts one and two. No new gate. |
| Controls | The 13 frozen controls, graded in every reading. |
| Scoring policy | Section 5.3 noisy-OR fit; section 5.6 stable sort. One policy. |
| Parameter grid | None. No margin, no `k`, no threshold, no normalization constant. |
| Stop rules | Section 14. One referee. Terminal outcomes spend attempt three. |
| Result schema | Section 9. |
| Artifact hashes | Cache `fa1252fc…`, `scoresSha256` `44c27468…`, record `ecea4c69…`; clause artifact `e5f86644…`; clause set `cc5df2e4…`; audit script (strict, comment corrected) SHA-256 `7a30222b9f7ad215de8e06286d18865d4006803d0400419020018ae93edea0b7`; audit script (vendor rules) SHA-256 `220b27d1d372a380f5436efb33a6d7da31a49022541496305c6ad14be211faa4`. |
| Implementation write set | Section 11: two new files, one package script, two README sections after the run, round files. |
| Tests | Section 12: 18 offline tests. |
| Verification | Section 13 commands; section 7 calibrations; section 18 result verification from the same cache by a different lane. |
| Cost | `$0`. No paid call. No model call. |
| Network use | None. No fetch. The referee opens no socket. |
| Review gates | Section 18. |

The audit evidence lives in section 3.2, Appendix A (script), Appendix B (detail tables), and
the independent reproduction in `review-grok-hold.md`. The raw console outputs of the two audit
runs are session-local and are not committed.

## 18. Authors, reviewers, and sequence

Brief author: Claude Fable 5 high. Parallel evidence lane: `evidence-terra.md`, which named
family 3 as the cheapest next measurement. Orchestrator: the root agent that opened this
worktree; it is not this lane. First reviewer: Grok 4.6 high, verdict `BLOCK`, reconciled in
`brief-reconciliation-fable.md`.

The remaining sequence is fixed:

1. Bounded delta review: Grok 4.6 high reviews the repaired sections in
   `review-grok-hold-delta.md`. The sections are the decision, the evidence corrections, the
   mechanism, the cache-only proof, the tests, and the triggers. It must `PASS` before any
   implementation. Two unreconciled `BLOCK` verdicts end this brief. The slot then stays
   reserved, and the next author starts from the ledger.
2. Implementation: Codex GPT-5.6 Sol high writes the section 11 files. It runs the section 13
   implementation gates. It loads no model and opens no cache.
3. Pre-run implementation review: Grok 4.6 high, in `review-grok-implementation.md`. It verifies
   the import graph, the noisy-OR math, the negative rule, and the stable sort. It verifies the
   pinned union, the cache identity checks, the calibration checks, and the untouched forbidden
   files.
4. The implementation commit hash is recorded in the ledger. The one referee runs with that hash
   in `RAVEN_SUPPORT_IMPLEMENTATION_COMMIT`.
5. Result verification: Codex GPT-5.6 Terra high recomputes all three readings from the same
   cache in `result-verification-terra.md`. It compares the max-clause totals with the retained
   attempt-two result file.
6. Closeout: a separately authorized lane records the outcome in `eval/vectorize/README.md`,
   `eval/README.md`, `.agents/TODO.md`, and `.agents/NEXT.md`.

Effort stays high. Escalate to xhigh only after a high pass misses a real finding. If the
orchestrator is Grok, the review lanes take Codex GPT-5.6 Sol high. Opus high is the last
resort. The ledger records why a matched lane was skipped.

## Appendix A — audit script (strict rule), verbatim

SHA-256 `7a30222b9f7ad215de8e06286d18865d4006803d0400419020018ae93edea0b7`. Run as
`node reachability-audit-strict.mjs <repo-root>` from any directory. The header comment was
corrected after the review (R4); the code is unchanged, and the rerun reproduced the same
tables. The vendor-rule variant has SHA-256 `220b27d1…11faa4`. It differs on the header comment
and on the `matcher` return line. Its return line is
`toks.has(t) || arr.some((c) => c.startsWith(t) || t.startsWith(c)) || raw.includes(t)`.

```js
// Vocabulary reachability audit over the frozen protocol-history contracts.
// Read-only. No model. No network. Strict match: exact token, or a prefix overlap where the shorter token has at least four characters. No raw substring.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { pathToFileURL } from "node:url";

const REPO = process.argv[2];
const abs = (p) => path.join(REPO, p);
const sha = (b) => createHash("sha256").update(b).digest("hex");
const { STOPWORDS } = await import(pathToFileURL(abs("src/catalog/scoring.ts")).href);
const { tokenize, normalizeSearchText } = await import(pathToFileURL(abs("src/catalog/vendor/search-scoring.ts")).href);

const manifest = JSON.parse(readFileSync(abs("catalog/manifest.json"), "utf8"));
const original = JSON.parse(readFileSync(abs("eval/protocol-history-cases.json"), "utf8"));
const blind = JSON.parse(readFileSync(abs("eval/protocol-history-blind-cases.json"), "utf8"));
const TARGET = "scout.searchResearch";

const entries = manifest.entries.filter((e) => e.searchable !== false);
if (entries.length !== 79) throw new Error(`expected 79 searchable entries, got ${entries.length}`);

function schemaText(schema, out = []) {
  if (!schema || typeof schema !== "object") return out;
  if (Array.isArray(schema)) { for (const s of schema) schemaText(s, out); return out; }
  for (const [k, v] of Object.entries(schema)) {
    if (k === "description" && typeof v === "string") out.push(v);
    else if (k === "enum" && Array.isArray(v)) out.push(v.filter((x) => typeof x === "string").join(" "));
    else if (k === "properties" && v && typeof v === "object") { out.push(Object.keys(v).join(" ")); for (const p of Object.values(v)) schemaText(p, out); }
    else if (typeof v === "object") schemaText(v, out);
  }
  return out;
}
function scoredView(e) {
  return [e.id, e.id.split(".").pop(), e.service, e.kind, e.description, ...(e.keywords ?? []), ...(e.routingKeywords ?? [])].join(" ");
}
function fullView(e) {
  return [scoredView(e), ...schemaText(e.inputSchema), ...schemaText(e.outputSchema)].join(" ");
}
function matcher(text) {
  const raw = normalizeSearchText(text);
  const toks = new Set(tokenize(text));
  const arr = [...toks];
  return (t) => toks.has(t) || arr.some((c) => (c.startsWith(t) || t.startsWith(c)) && Math.min(c.length, t.length) >= 4);
}
const views = { scored: new Map(), full: new Map() };
for (const e of entries) { views.scored.set(e.id, matcher(scoredView(e))); views.full.set(e.id, matcher(fullView(e))); }

const content = (q) => [...new Set(tokenize(q).filter((t) => !STOPWORDS.has(t)))];
const df = (view, t) => entries.filter((e) => views[view].get(e.id)(t)).length;

function audit(row, role, contract) {
  const c = content(row.question);
  const tgt = { scored: views.scored.get(TARGET), full: views.full.get(TARGET) };
  const perTok = c.map((t) => ({ t, tScored: tgt.scored(t), tFull: tgt.full(t), dfScored: df("scored", t), dfFull: df("full", t) }));
  const absent = perTok.filter((x) => x.dfFull === 0).map((x) => x.t);
  const unreached = perTok.filter((x) => !x.tFull).map((x) => x.t);
  const reachedFull = perTok.filter((x) => x.tFull);
  const rare = reachedFull.filter((x) => x.dfFull <= 8).map((x) => `${x.t}(${x.dfFull})`);
  const common = reachedFull.filter((x) => x.dfFull > 8).map((x) => `${x.t}(${x.dfFull})`);
  const newFull = perTok.filter((x) => x.tFull && !x.tScored).map((x) => `${x.t}(${x.dfFull})`);
  return { contract, id: row.id, role, n: c.length, targetScored: perTok.filter((x) => x.tScored).length, targetFull: reachedFull.length, absent, unreached: unreached.filter((t) => !absent.includes(t)), rare, common, schemaOnly: newFull };
}
const rows = [
  ...original.positiveCases.map((r) => audit(r, "positive", original.contract)),
  ...original.controlCases.map((r) => audit(r, "control", original.contract)),
  ...blind.positiveCases.map((r) => audit(r, "positive", blind.contract)),
  ...blind.controlCases.map((r) => audit(r, "control", blind.contract)),
];
console.log("inputs:", { manifest: sha(readFileSync(abs("catalog/manifest.json"))), original: sha(readFileSync(abs("eval/protocol-history-cases.json"))), blind: sha(readFileSync(abs("eval/protocol-history-blind-cases.json"))) });
console.log("searchable entries:", entries.length, "target scored tokens:", tokenize(scoredView(entries.find(e=>e.id===TARGET))).length, "target full tokens:", tokenize(fullView(entries.find(e=>e.id===TARGET))).length);
for (const r of rows) {
  console.log(`\n[${r.role}] ${r.id} — content ${r.n}; target scored ${r.targetScored}/${r.n}; target full ${r.targetFull}/${r.n}`);
  console.log(`  catalog-absent: ${r.absent.join(", ") || "none"}`);
  console.log(`  in catalog, not on target: ${r.unreached.join(", ") || "none"}`);
  console.log(`  target rare (DF<=8): ${r.rare.join(", ") || "none"}`);
  console.log(`  target common (DF>8): ${r.common.join(", ") || "none"}`);
  console.log(`  schema-only gain: ${r.schemaOnly.join(", ") || "none"}`);
}
const pos = rows.filter((r) => r.role === "positive"), ctl = rows.filter((r) => r.role === "control");
const summ = (set) => ({ n: set.length, withAbsent: set.filter((r) => r.absent.length).length, noRare: set.filter((r) => r.rare.length === 0).length, meanRare: (set.reduce((a, r) => a + r.rare.length, 0) / set.length).toFixed(2), meanCommon: (set.reduce((a, r) => a + r.common.length, 0) / set.length).toFixed(2) });
console.log("\nSUMMARY positives:", summ(pos));
console.log("SUMMARY controls:", summ(ctl));
```

## Appendix B — strict-run per-case detail not in the section 3.2 tables

Tokens present in the catalog but not on the target ("in catalog, not on target"), strict rule:

| Case | Tokens |
| --- | --- |
| `ph-protocol-24-archival-root-cause` | 24, after, 23, archival |
| `ph-protocol-corrective-upgrade-history` | after |
| `ph-protocol-upgrade-chronology` | through, 24, next, followed |
| `ph-protocol-regression-remediation` | none |
| `ph-yieldblox-oracle-incident` | happened |
| `ph-security-incident-postmortems` | show, impact, actions |
| `ph-soroban-auth-audit-history` | none |
| `ph-protocol-feature-origin` | give, historical, reason, feature, introduced, later, changes |
| `ph-control-current-protocol` | none |
| `ph-control-validator-vote` | validators, activate |
| `ph-control-soroban-deploy` | deploy, testnet |
| `ph-control-clawback-cap` | introduced, clawback |
| `phb-whisk-forced-follow-up` | forced, follow, archival, numbers |
| `phb-archival-defect-network-upgrade` | archival, made, quick, follow |
| `phb-auth-recursion-auditors` | fixed, once |
| `phb-core-upgrades-dates-features` | feature |
| `phb-yieldblox-reflector-manipulation` | happened |
| `phb-network-upgrades-reasons` | walk, through, reason |
| `phb-second-cut-after-whisk` | second, fast, after, went |
| `phb-cap-archival-fee-repair` | show, archival, fee |
| `phb-auditor-auth-recursion-follow-up` | write, landed, afterward |
| `phb-clawback-origin-emergency-changes` | give, origin, story, clawback, later, changes |
| `phb-whisk-post-mortem` | show, archival, failure |
| `phb-control-protocol-xdr-bug` | xdr, muxed, accounts |
| `phb-control-contract-fail-after-upgrade` | fail, after |
| `phb-control-incident-runbook` | write, validators |
| `phb-control-contract-exploit-review` | show, am |
| `phb-control-sdk-version-history` | java, script |
| `phb-control-cap-history-sep-support` | none |
| `phb-control-kyc-breach-report` | anchor, flow |
| `phb-control-client-protocol-version-failure` | transaction, fail, after, test, client |
| `phb-control-failed-deploy-post-mortem` | write, failed, deploy |

The next table compares two views of the target under the strict rule. The scored view is the
production scorer text. The full view adds the schema text. The rows are the seven blind
positives in the attempt-two miss intersection, plus the rescued case:

| Case | scored view | full view | tokens added by schema text |
| --- | ---: | ---: | --- |
| `phb-whisk-forced-follow-up` | 0/8 | 0/8 | none |
| `phb-archival-defect-network-upgrade` | 3/11 | 5/11 | network(9), upgrade(5) |
| `phb-core-upgrades-dates-features` | 4/11 | 8/11 | core(10), upgrades(4), each(27), shipped(15) |
| `phb-network-upgrades-reasons` | 2/12 | 7/12 | every(25), network(9), upgrade(5), each(27), shipped(15) |
| `phb-second-cut-after-whisk` | 1/8 | 2/8 | live(25) |
| `phb-cap-archival-fee-repair` | 1/9 | 2/9 | pool(16) |
| `phb-clawback-origin-emergency-changes` | 0/7 | 0/7 | none |
| `phb-auditor-auth-recursion-follow-up` (rescued by attempt-two pure max-clause) | 3/9 | 6/9 | otter(2), sec(2), certora(2) |

The schema text adds token reach for six of these eight, mostly through the `source` and
`auditor` parameter descriptions. It adds nothing for the two zero-overlap cases. It also adds
`upgrade` to `ph-control-validator-vote` and `phb-control-contract-fail-after-upgrade`,
`response` to `phb-control-incident-runbook`, and `set` to
`phb-control-client-protocol-version-failure`. A schema-text lexical lever therefore sits inside
the section 3.3 coupling. It is not the mechanism this brief registers.
