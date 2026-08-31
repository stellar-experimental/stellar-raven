# Measurement brief — pinned cross-encoder route fit (attempt two, measurement only)

Date: 2026-08-31 (revised after the Grok pre-implementation review)
Lane: Measurement brief (Claude, Fable 5, high)
Round ledger: `.agents/rounds/2026-08-31-protocol-history-cross-encoder-v1.md`
Prior attempt: `.agents/rounds/2026-08-31-eval-routing-next/implementation-brief-fable.md`
Review reconciled: `.agents/rounds/2026-08-31-protocol-history-cross-encoder-v1/review-grok-brief.md`
Reconciliation record: `.agents/rounds/2026-08-31-protocol-history-cross-encoder-v1/brief-reconciliation-fable.md`
Status: brief only. No model was downloaded. No model ran. No paid call ran. No code, frozen
contract, or shared artifact changed.

## 1. Decision

Run one measurement-only experiment: `cross-encoder-fit-v1`.

The mechanism is pairwise cross-encoder scoring over the frozen clause set from attempt one.
The model reads one query and one clause together and returns one relevance score.
The experiment scores a query against each candidate entry by the best single positive clause,
minus excess exclusion evidence. It then applies the same one-pass hysteresis swap over the same
complete candidate union that attempt one used.

Production search does not change. No production model call is proposed. The experiment lives
under `eval/vectorize/` and reuses the frozen clause texts, the base-order builder pattern, the
result-writing pattern, and the integrity pattern from attempt one.

### 1.1 Why this mechanism

The Sol analysis (`routing-analysis-sol.md`, Stage C) names a pairwise cross-encoder as the
preferred comparator. Attempt one deferred it for three recorded reasons: no cached model, no
loader, and no pin. Attempt one then measured the clause-level bi-encoder and it failed both
frozen contracts. That negative result narrows this brief to the cross-encoder, exactly as
attempt one pre-registered.

A cross-encoder reads the query and the clause in one forward pass. Attention joins the two
texts, so the score can bind entity words to intent words. A bi-encoder cannot do this; it meets
the two texts only at a dot product. This is the one model-class change this brief makes.
Everything else — clause set, candidate union, fit formula, swap pass, acceptance table — stays
structurally identical to attempt one, so a different outcome isolates the model class.

### 1.2 What this brief reuses unchanged from attempt one

| Reused item | Pin |
| --- | --- |
| Clause set: 683 clauses (608 positive, 75 negative) over 79 searchable entries | `clauseSetSha256` `cc5df2e4d89522c580626cfc21727b927494f5f528f42acfa035187a211d89e5` |
| Clause artifact file (read-only clause identity source) | SHA-256 `e5f86644af89158c3ac4d61ee7f651e2a062c9d292f194cb94872c7eee4e71f4` |
| Candidate union `B = P5 ++ R` and tier marking | attempt-one brief section 5, verbatim |
| Fit formula shape and swap predicate | attempt-one brief section 6, restated in sections 6 and 7 below |
| Frozen contracts and routing acceptance table | attempt-one brief section 11, restated in section 10 below |
| Query set | the 563 unique referee query texts attempt one cached |

The clause artifact's stored vectors are not used. The committed `clauses[]` rows carry
`textSha256` plus metadata; they do not store the text. The loader reconstructs each clause
text deterministically from the live catalog, inventory, and archetypes through
`loadClauseArtifact({ requireCatalogMatch: true })`, and every reconstructed text must match
its recorded `textSha256`. No `text` field is read from the JSON. The clause set is final.
No clause is added, removed, or reworded.

## 2. Verified facts at authoring

| Fact | Value |
| --- | --- |
| `HEAD` | `957b143893842d875050f42581faf514a945c41f` (equal to `main`) |
| Attempt-one outcome | reviewed `FAIL`; result stamp `2026-08-31T16-58-42-389Z-clause-fit-hysteresis-v1` |
| Clause artifact inputs | `manifestSha256` `4945c311…`, `inventorySha256` `1a261c4a…`, `archetypesSha256` `beeea9b5…` |
| Live manifest match | `loadClauseArtifact({ requireCatalogMatch: true })` still passes at `HEAD` |
| Frozen contract baselines | original 4/8 positives, 1/4 captures; blind 3/11 positives, 6/9 captures |
| Routing gate baselines | legacy 208/279/311 with the 1% band; skills top-1 floor 16; holdout 10/22/25 with at most 11 forbidden captures |
| Pinned runtime | `@huggingface/transformers@4.2.0` in `package.json` devDependencies |
| Local cross-encoder cache | none exists on this host; one bounded fetch is required |

If the live catalog drifts before implementation, the loader refuses the clause artifact and the
attempt stops as `BLOCKED-ASSETS` (section 13). Rebuilding the clause artifact is forbidden.

## 3. Model selection and pin

Selected model: `Xenova/bge-reranker-base`.

| Field | Value |
| --- | --- |
| `provider` | `huggingface-local-onnx` |
| `id` | `Xenova/bge-reranker-base` |
| `revision` | `280bcc27a84e0b898c251e06fddb25171bd9b101` |
| `baseModel` | `BAAI/bge-reranker-base` |
| `baseRevisionObserved` | `2cfc18c9415c912f9d8155881c133215df768a70` |
| `architecture` | `XLMRobertaForSequenceClassification` |
| `runtime` | `@huggingface/transformers@4.2.0` |
| `dtype` | `q8` (`onnx/model_quantized.onnx`) |
| `loaderApi` | `AutoTokenizer` plus `AutoModelForSequenceClassification`, called directly; no `pipeline()` |
| `pairEncoding` | tokenizer `text_pair` call with `padding: true`, `truncation: true`, `max_length: 512` |
| `scoreTransform` | one sigmoid over the raw logit `logits[i][0]`; the pipeline softmax path is forbidden |
| `metric` | one relevance score per (query, clause) pair; higher is more relevant |

### 3.1 Why this model and not the alternatives

1. It is a true pairwise cross-encoder with a single-logit classification head. This is the
   exact Stage C comparator shape.
2. It mirrors a Cloudflare Workers AI model, `@cf/baai/bge-reranker-base`. The existing Qwen
   embedding pin used the same mirror rule for `@cf/qwen/qwen3-embedding-0.6b`. A later product
   brief could therefore reach the same model class in production without a new vendor.
3. Its single-logit classification head loads directly through
   `AutoModelForSequenceClassification` in the pinned runtime. It needs no chat template and no
   generation-side token-logit extraction. The `text-classification` pipeline is not used: that
   pipeline cannot encode a (query, clause) pair, and its softmax on this one-label config
   returns `1` for every finite logit (review findings H1 and H2).
4. The repository provides a q8 ONNX file under the same `onnx/model_quantized.onnx` name the
   existing loader convention expects.

Considered and rejected: `onnx-community/Qwen3-Reranker-0.6B-ONNX` (revision
`9995c50e2310679108a55f5ccd16ba8be9f17c20`, observed 2026-08-31). It is a causal-LM reranker.
Scoring requires chat-template assembly and yes/no token-logit comparison. That is more code,
more drift surface, and it has no Cloudflare Workers AI counterpart.

### 3.2 Required files at the pinned revision

Exactly five files. The author read these identities from the public Hugging Face API on
2026-08-31 without downloading any file.

| Path | Size (bytes) | Upstream identity |
| --- | --- | --- |
| `config.json` | 782 | git blob SHA-1 `ef36f7221740ddc57b6cfae14977840d1fc0fc95` |
| `tokenizer_config.json` | 443 | git blob SHA-1 `059214673d9d6d2ee319411e2ffec8c024b816d5` |
| `special_tokens_map.json` | 279 | git blob SHA-1 `68171d1ff68b731a33d119708476692c094a466b` |
| `tokenizer.json` | 17,098,079 | LFS SHA-256 `48564c5c7d3fa64d85d95e65414a542385f88b0f128fd8d4163fd7a57f2be05c` |
| `onnx/model_quantized.onnx` | 279,301,077 | LFS SHA-256 `dd98f3e67837d23210a6b7550c08cced4f61845b940ac45be3565840a10f3244` |

`sentencepiece.bpe.model` is not required. `tokenizer.json` is the complete fast tokenizer.
No other file may be fetched. The runtime's `get_tokenizer_files` loads only `tokenizer.json`
and `tokenizer_config.json`; it ignores `special_tokens_map.json`. That file stays in the pin
for provenance, and a runtime that ignores it is not a loader defect.

### 3.3 Two-phase hash pin

Phase one is this brief: the sizes, the two LFS SHA-256 values, and the three git blob SHA-1
values above are frozen now.

Phase two happens at the single authorized fetch, which runs after the pre-fetch
implementation review (section 17). The two LFS SHA-256 values already are the byte SHA-256 of
the two large files, so phase two adds only the three small files. The fetch script computes
and prints the byte SHA-256 of all five files. The ledger records those five values, the
implementation writes them into the preflight, and a bounded pin review verifies that the
preflight pins equal the ledger values before the referee. After phase two, every later load
is checked by byte SHA-256.

## 4. Fetch and snapshot

Attempt one failed its first referee on a lazy runtime fetch, and its finish review blocked an
unenforceable repair fetch. This design removes both failure classes: the runtime never has a
network path, and the fetch script has a static URL list.

New script `eval/vectorize/fetch-rerank-model.mjs`:

1. It builds exactly five URLs of the form
   `https://huggingface.co/Xenova/bge-reranker-base/resolve/280bcc27a84e0b898c251e06fddb25171bd9b101/<path>`,
   one per section 3.2 row. The revision is a constant. No resolver library runs.
2. It downloads each file to a temporary path and verifies the exact size, then the identity:
   LFS SHA-256 for the two LFS files; git blob SHA-1 (`sha1("blob <size>\0" + bytes)`) for the
   three small files.
3. On success it moves the files into the machine-local snapshot
   `~/.cache/stellar-raven/bge-reranker-base-q8-280bcc2/Xenova/bge-reranker-base/` and prints
   the byte SHA-256 of all five files for the ledger.
4. On any size or identity mismatch it deletes the temporary file and fails.

Fetch budget: at most two invocations of this script, ever, for this attempt. A second failure
is `BLOCKED-FETCH`. The script writes nothing inside the repository and nothing into any shared
Hugging Face cache directory.

## 5. Loader, cache isolation, and preflight

New file `eval/vectorize/rerank-config.mjs` holds the frozen `RERANK_MODEL` object (section 3
table), the policy object, the margins, and the pair-text helpers.

New file `eval/vectorize/rerank-scorer.mjs` is the only model loader. It copies the working
Qwen snapshot layout exactly, because the 4.2.0 resolver has two hard constraints the
attempt-one finish review recorded: file discovery probes `tokenizer_config.json` at revision
`main` and receives no `revision` for local paths, and `buildResourcePaths` resolves
`pathJoin(env.localModelPath, modelId, filename)` with no revision component. A snapshot that
nests the files anywhere else makes the runtime silently omit the tokenizer.

- `RAVEN_RERANK_MODEL_DIR` names the snapshot parent
  `~/.cache/stellar-raven/bge-reranker-base-q8-280bcc2`. There is no default and no fallback
  path. The five files live at
  `$RAVEN_RERANK_MODEL_DIR/Xenova/bge-reranker-base/<section 3.2 path>`.
- Before any model construction, the loader verifies that
  `path.join(modelDir, RERANK_MODEL.id, relativePath)` exists for all five files, exactly as
  `embedder.mjs` does for the Qwen snapshot.
- Before any model construction, it sets `env.allowRemoteModels = false`,
  `env.allowLocalModels = true`, `env.localModelPath = process.env.RAVEN_RERANK_MODEL_DIR`
  (the parent of the model-id directory), and `env.useFSCache = false`. The runtime therefore
  has no fetch mechanism and touches no shared cache.
- It loads `AutoTokenizer.from_pretrained(RERANK_MODEL.id)` and
  `AutoModelForSequenceClassification.from_pretrained(RERANK_MODEL.id, { dtype: "q8" })`
  directly. It never constructs a `pipeline()`: the `text-classification` pipeline cannot
  encode a text pair, and its one-label softmax returns `1` for every finite logit.
- Initialization is lazy. Importing the module, the referee, or the tests constructs neither
  the tokenizer nor the model. Construction happens on the first scoring call only.
- The scoring call is pinned:

  ```js
  const inputs = tokenizer(queries, {
    text_pair: clauses,
    padding: true,
    truncation: true,
    max_length: 512,
  });
  const { logits } = await model(inputs);
  ```

  The score for row `i` is `1 / (1 + exp(-logits[i][0]))` — the raw logit through one
  sigmoid. String concatenation of query and clause is forbidden. Reading any pipeline
  `score` field is forbidden. Batches are contiguous slices of 16 pairs; the last batch is
  the remainder, with no dummy padding rows.

New file `eval/vectorize/preflight-rerank-model.mjs`, mirroring
`preflight-clause-model.mjs`:

1. It streams the byte SHA-256 of all five snapshot files and compares them to the phase-two
   pins. Any mismatch fails the preflight.
2. It loads the clause artifact with `requireCatalogMatch: true`.
3. It scores one fixed probe pair — query `cross-encoder preflight probe query`, document
   `cross-encoder preflight probe document` — through the section 5 scoring call, and prints
   `probeScoreSha256`, the SHA-256 of the little-endian float32 encoding of the sigmoid of the
   raw logit.
4. It prints `node`, the `onnxruntime-node` version, and `process.platform`.

The first preflight run records `probeScoreSha256` in the ledger. A later preflight on the same
host must reproduce it exactly. A different value is environment drift; stop and record.

## 6. Pair construction and score direction

Query text: the raw case `question` string, unchanged. The Qwen `Instruct:` wrapper from
`frontier-config.mjs` is embedding-specific and is not used. The base model was trained on
plain (query, passage) pairs.

Document text: the reconstructed clause text, header included. The loader rebuilds each text
deterministically from the live catalog, inventory, and archetypes, and every text must match
the artifact's per-clause `textSha256` before any scoring.

Encoding: the tokenizer encodes each (query, clause) row as a true pair through the section 5
`text_pair` call, which yields the XLM-RoBERTa pair form `<s> query </s></s> clause </s>` with
`max_length` 512. The two strings are never concatenated into one sequence. This matches the
FlagEmbedding and Cloudflare `@cf/baai/bge-reranker-base` two-field contract, so a later
product mirror can reproduce this measurement.

Score: the model returns one raw logit per pair at `logits[i][0]`. The scorer applies exactly
one sigmoid, `1 / (1 + exp(-logit))`, and returns a value in (0, 1). Higher means more
relevant. A logit of `0` must score `0.5`. The pipeline softmax path is a broken scorer on
this one-label config — it returns `1` for every finite logit — and any implementation whose
scores are constant across distinct pairs must abort. The sigmoid is monotonic, so it never
changes an order; it only gives the margin grid a bounded scale.

The model never receives a case id, a case class, an expected operation, a control label, or
any golden-answer field. It receives exactly one question string and one clause string per pair.

## 7. Candidate union, fit formula, and swap policy

The candidate union restates attempt one's section 5 completely, so no implementation choice
remains:

1. `P5 = searchCatalog(catalog, { query, limit: 5 })` — the exact production page, with its
   production `score` and `tier` values.
2. `R` = every remaining searchable entry not in `P5` whose
   `scoreEntryWeightedUngated(projection, query)` is non-null, ordered by that ungated score
   **descending**, then by `id` **ascending**. Both scorers are already exported from
   `src/catalog/scoring.ts`; nothing in `src/` changes.
3. The scoring projection for `R` is frozen:
   `{ id, name: entry.id, service, kind, description, keywords, routingKeywords }`. `name` is
   the full `entry.id`, never the production alias-aware `entryScoringName`. An `R` built with
   production names could change membership and order while identity calibration still passes.
4. Base order `B = P5 ++ R`. The remainder order matters: the swap pass is one left-to-right
   pass, not a full sort, so reversing `R` could change the top five.
5. Tier marking: a `P5` hit keeps its production tier. An entry in `R` whose
   `scoreEntryWeighted(projection, query)` is null — a coverage-gate failure — is marked
   `tier: "backfill"`. Every other entry in `R` is marked `tier: "gated"`.

For query `q` and entry `e`, with `score(q, c)` the sigmoid pair score:

- `pos(e) = max over positive clauses c of e: score(q, c)`
- `neg(e) = max over negative clauses n of e: score(q, n)`; `neg(e) = 0` when `e` has no
  negative clause. Sigmoid scores are positive, so `fit(e) = pos(e)` in that case.
- `fit(e) = pos(e) - max(0, neg(e) - pos(e))`

Policy `cross-encoder-fit-v1(m)` is attempt one's swap pass, verbatim: one left-to-right pass;
the candidate at index `i` swaps left across each preceding candidate while
`fit(candidate) >= fit(preceding) + m` and `fit(candidate) !== fit(preceding)`; it stops at the
first preceding candidate it does not dominate; equal `fit` values never swap at any `m`; ties
keep base order; the first five hits return with their `tier` and lexical `score` unchanged.

Pre-registered readings, all derived in one referee invocation:

| Reading | `m` | Role |
| --- | --- | --- |
| identity | `Infinity` | calibration; must reproduce the lexical baseline exactly |
| pure fit | `0` | upper-bound diagnostic; not a ship candidate |
| grid 1 | `0.05` | candidate |
| grid 2 | `0.10` | candidate |
| grid 3 | `0.20` | candidate |

The grid is on the sigmoid scale, not the cosine scale, so the attempt-one values do not carry
over. The three values test weak, moderate, and strong domination across the (0, 1) range. No
other `m` runs. No per-case, per-class, per-service, or per-entry value exists. If more than one
grid value passes acceptance, choose the one with the fewest changed rankings in the 495-case
comparison; on a tie choose the larger `m`.

## 8. Score cache and result artifacts

Cross-encoder scores cannot be precomputed per document, so the referee computes and caches
every needed pair score once, before any reading. The composition of that cache is fully
pinned, because `padding: true` pads to the longest sequence in each batch and q8 logits can
shift with batch composition. Two faithful implementations must produce the same batches.

1. Query order: the first-seen unique question texts from the same concatenation
   `run-clause-fit.mjs` uses — the 495 comparison rows, then the 49 holdout rows, then the 20
   blind rows. That yields the 563 texts in a fixed order.
2. For each query, `pairIndex` is the artifact clause indexes whose `entryId` is in
   `B(query)`, in artifact order.
3. The scorer scores pairs in `queries[]` order, then `pairIndex` order, in contiguous
   batches of 16. The last batch is the remainder. No dummy pairs pad it.
4. Readings read scores only through `pairIndex`. They never rescore.

Pair budget: the worst case is 563 × 683 = 384,529 pairs. At batch 16 on this host's CPU, the
estimate is one to four hours. The referee reports progress but never changes the pair set.

Local score cache, written under `eval/vectorize/results/` with `resultStamp` and
`writeResult`:

| Field | Content |
| --- | --- |
| `schemaVersion` | `1` |
| `experiment` | `cross-encoder-fit-v1` |
| `model` | the frozen `RERANK_MODEL` object, byte-identical |
| `clauseArtifactSha256` | `e5f86644…` (full value) |
| `clauseSetSha256` | `cc5df2e4…` (full value) |
| `batchSize` | `16` |
| `queries[]` | ordered `{ textSha256 }` rows, in the pinned first-seen order above |
| `pairIndex[]` | per query, the ordered clause indexes scored, in artifact order |
| `scores` | little-endian float32 base64, flat, in `queries[]` then `pairIndex` order |
| `scoresSha256` | SHA-256 of the decoded score payload |
| `environment` | `node`, `onnxruntime-node` version, `platform`, `probeScoreSha256` |

Batch padding note: q8 inference with `batchSize` 16 may not be bit-identical across batch
compositions. The composition above is therefore pinned before any fetch, and the cache is the
frozen scoring record. Every reading derives from the cache, not from a re-scoring. A later
reproduction on the same pinned composition with a different `scoresSha256` is environment
drift, not a new result — the same rule the attempt-one query-vector cache uses. A cache whose
`pairIndex` order differs is a different record, never the same record with reordered scores.

The referee result JSON mirrors attempt one: the stamp, the five readings with acceptance and
routing-gate verdicts, the exact positive misses and control captures by id, the 495-case
changed-ranking counts, the new `scout.searchResearch` top-five captures, and the environment
block. Result JSON files stay local. The ledger records the cache SHA-256, the result SHA-256,
and the stamp.

## 9. Identity checks before the referee

The referee aborts before scoring unless all of these hold:

1. `git rev-parse HEAD` equals the implementation commit recorded in the ledger.
2. `loadClauseArtifact({ requireCatalogMatch: true })` passes, which pins the manifest,
   inventory, and archetype inputs.
3. The clause artifact file SHA-256 equals `e5f86644…`.
4. `npm run eval:selftest` and `npm run eval:compile` pass, which byte-pin the frozen contract
   files and rebuild the compiled routing set.
5. The preflight passes with the phase-two hashes and the recorded `probeScoreSha256`.

At run time, the identity reading (`m = Infinity`) must reproduce the `gates.json` accepted
totals and both frozen-contract baselines exactly: 4/8, 1/4, 3/11, 6/9. A calibration failure
aborts the run before any candidate reading is reported.

## 10. Routing acceptance table

A grid reading passes only when all of these hold. The table is attempt one's section 11,
unchanged.

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

The six inspection cases from attempt one are reported for every reading, unchanged:
`q-protocol-24-whisk-incident`, `q-protocol-version-history-list`,
`q-pc-protocol-upgrade-timing`, `q-sor-p23-auto-restore-extendto`,
`q-sor-x-ray-bn254-sdk-gap`, `q-ti-run-tune-own-horizon`.

The pure-fit reading never decides acceptance. A fix that helps only
`q-protocol-24-whisk-incident` is unshipped by definition.

## 11. One-referee rule and outcome labels

One referee invocation runs the cache build and all five readings. No second referee runs for a
score reason. The outcome labels are:

- `PASS`: at least one grid value passes the full section 10 table. Bank the result. The next
  step is a separate product design brief for production wiring, including the production
  `TIER_INTERLEAVE_MARGIN` policy. This experiment ships no production code.
- `PARTIAL`: a grid value reaches zero control captures on both contracts with every routing
  gate intact, but misses positives. The referee still exits `1` and prints the exact missed
  ids. A change to the positive bar is a ledger-level decision for the user.
- `FAIL`: no grid value qualifies. The referee exits `1`. Bank the negative result in
  `eval/vectorize/README.md`. Attempt two is then spent, and only attempt three remains in the
  three-attempt box.

## 12. Files

New files, implementation phase only, after the brief review passes:

- `eval/vectorize/rerank-config.mjs` — model pin, policy, margins, pair-text helpers.
- `eval/vectorize/fetch-rerank-model.mjs` — the bounded five-file fetch (section 4).
- `eval/vectorize/rerank-scorer.mjs` — the local-only loader and pair scorer (section 5).
- `eval/vectorize/preflight-rerank-model.mjs` — hash preflight and probe pair (section 5).
- `eval/vectorize/rerank-retrieval.mjs` — clause-set load, union build, fit, swap pass.
- `eval/vectorize/run-rerank-fit.mjs` — the referee (sections 8–11).
- `test/eval-vectorize-rerank-fit.test.mjs` — offline tests (section 14).

Edited files:

- `package.json` — three scripts: `eval:vectorize:rerank:fetch`,
  `eval:vectorize:rerank:preflight`, `eval:vectorize:rerank:run`.
- `eval/vectorize/README.md` — one dated section after the run, with the result tables.
- `eval/README.md` — one pointer line in the protocol-history section.
- This round's ledger and lane files under
  `.agents/rounds/2026-08-31-protocol-history-cross-encoder-v1/`.

Forbidden, byte-for-byte:

- Everything under `src/`, `catalog/manifest.json`, and `scripts/build-catalog.mjs`.
- `eval/gates.json`, `eval/protocol-history-cases.json`,
  `eval/protocol-history-blind-cases.json`, `eval/holdout-cases.json`, `eval/routing-cases.json`,
  `eval/skills-cases.json`, `eval/build-question-overlay.json`, `eval/run-routing.mjs`,
  `eval/run-protocol-history.mjs`. The overlay file carries the accept-either labels, so an
  edit there would move extended and legacy totals.
- Every attempt-one file: `clause-config.mjs`, `clause-retrieval.mjs`, `build-clause-artifact.mjs`,
  `run-clause-fit.mjs`, `preflight-clause-model.mjs`, `embedder.mjs`, `frontier-config.mjs`, and
  the clause artifact `artifacts/qwen3-embedding-0.6b-q8-c25a394-clauses.json`.
- Golden corpus files and everything under `eval/qa/`.

## 13. Stop states

- `BLOCKED-FETCH`: the fetch script fails twice. Record both failures. No third invocation.
- `BLOCKED-ASSETS`: the snapshot fails the preflight hashes, or the clause artifact fails
  `requireCatalogMatch` because the live catalog drifted. No repair fetch exists. Stop and
  record; a reviewed finish plan may repair the mechanical state without touching scoring.
- `BLOCKED-RUNTIME`: `@huggingface/transformers@4.2.0` cannot load the pinned
  `XLMRobertaForSequenceClassification` q8 file locally, or the referee crashes before writing
  a result. Stop and record; the same reviewed-finish rule applies.
- `PASS`, `PARTIAL`, `FAIL`: section 11. Each is terminal and spends attempt two.

A reviewed finish plan after a `BLOCKED-*` state may repair only the mechanical failure. It may
not change the clause set, the pair texts, the fit formula, the swap predicate, the grid, the
batch size, or the acceptance table. It needs its own independent review before any work, as
the attempt-one finish did.

## 14. Tests

All tests run offline without the model. Score-dependent tests use small synthetic logits and
score tables. Union tests use the real catalog with lexical scoring only. All of these tests
must pass before the fetch.

Pair construction and encoding:

1. Reconstructed pair documents match the artifact's per-clause `textSha256` values.
2. The query side is the raw question; no `Instruct:` wrapper appears in any pair.
3. No pair text contains any id or question from `eval/protocol-history-cases.json` or
   `eval/protocol-history-blind-cases.json` on the document side.
4. The pair helper passes the clauses through the tokenizer `text_pair` option with
   `max_length` 512. It never concatenates the query and clause strings into one sequence.

Score transform:

5. The scorer maps a raw synthetic logit through exactly one sigmoid: logit `0` yields `0.5`,
   and a positive logit yields a larger score than a negative logit.
6. The scorer reads `logits[i][0]` and never a pipeline `score` field. A one-label softmax
   path — constant scores across distinct synthetic logits — is rejected.

Loader:

7. The loader verifies `path.join(modelDir, RERANK_MODEL.id, relativePath)` for all five
   files, and sets `localModelPath` to `modelDir`, `allowRemoteModels` to `false`, and
   `useFSCache` to `false`, before any model construction.
8. Importing the scorer or the referee with `RAVEN_RERANK_MODEL_DIR` unset constructs no
   tokenizer and no model.

Fit formula:

9. `fit` equals `pos` when the entry has no negative clause.
10. `fit` equals `pos` when `neg <= pos`.
11. `fit` equals `2*pos - neg` when `neg > pos`.

Swap pass (attempt-one tests, re-asserted against the new implementation):

12. `m = Infinity` returns the base order unchanged.
13. For `m > 0`, a candidate swaps at exactly `fit(prev) + m` and does not swap at
    `fit(prev) + m - 1e-9`.
14. Equal `fit` values keep base order at every registered `m` — `0`, `0.05`, `0.10`, `0.20`,
    and `Infinity` — not only at `m = 0`.
15. A candidate stops at the first preceding candidate it does not dominate.
16. `tier` and lexical `score` values are unchanged after the pass.

Union membership and order:

17. For every one of the 19 frozen positive questions, `B` contains `scout.searchResearch`.
18. For every one of the 32 frozen questions, `B` has no duplicate ids, and every `R` entry
    failing `scoreEntryWeighted` carries `tier: "backfill"`.
19. `R` is sorted by ungated score descending, then `id` ascending, and the scoring
    projection uses `name: entry.id`.

Cache and referee:

20. The score-cache encoder and decoder round-trip a synthetic score table and reproduce
    `scoresSha256`.
21. A cache whose `clauseSetSha256` or model object differs from the frozen pins is refused.
22. The cache query order is the pinned first-seen order, and each `pairIndex` lists the
    `B(query)` clause indexes in artifact order.
23. Readings derive from the cache: a synthetic cache with a planted score produces the
    planted swap, with no model call. A planted cache with one changed pair index produces
    the planted swap through that index.
24. A cache with the same flat `scores` but a different `pairIndex` order is treated as a
    different record, not the same record.
25. `shouldFail` returns `true` when no grid reading passes acceptance.

## 15. Validation commands

Before the fetch (implementation gates):

```sh
./node_modules/.bin/vitest run test/eval-vectorize-rerank-fit.test.mjs
npm run typecheck
npm test
npm run build
npm run secrets:scan -- --tree
git diff --check
```

Fetch and pin (once; at most two invocations ever):

```sh
npm run eval:vectorize:rerank:fetch    # prints the five byte SHA-256 values for the ledger
```

Referee preconditions, then the one referee:

```sh
npm run eval:vectorize:rerank:preflight
npm run eval:selftest
npm run eval:compile
npm run eval:vectorize:rerank:run -- --dump-dir <scratchpad>/rerank-fit
```

## 16. Leakage and tuning guards

Case-input leakage is prevented by construction:

- The clause texts were built from the catalog, the inventory, and the archetypes before this
  brief, and attempt one's no-leak test verified that no clause contains a frozen case id or
  question. The set is frozen by hash and cannot be rebuilt in this attempt.
- The model receives only (question, clause) strings. Ids, classes, expected operations,
  control labels, and golden fields never reach the scorer, the cache, or the swap pass.

Post-result tuning is prevented by pre-registration:

- The grid, the sigmoid transform, the batch size, the fit formula, the swap predicate, the
  base order, and the acceptance table are all frozen in this brief before any review.
- One fetch budget, one snapshot, one referee invocation, one score cache.
- Inspecting a miss authorizes nothing. No clause edit, no new margin, no formula change, no
  second referee. The frozen contracts are acceptance data, not training data.
- The multi-pass selection rule (fewest changed rankings, then larger `m`) is fixed here, so no
  post-hoc choice exists among passing grids.

## 17. Authors, reviewers, and closeout

Brief author: Claude Fable 5 high. Orchestrator: the root Codex agent. Brief reviewer:
Grok 4.6 high, who differs from both. The first review is complete with verdict `BLOCK`
(`review-grok-brief.md`); this revision reconciles it in
`brief-reconciliation-fable.md`. A bounded delta review of the repaired sections — the pair
call, the score transform, the loader layout, the union sort, the pair order, and the tests —
must `PASS` before any implementation. Two unreconciled `BLOCK` verdicts stop the attempt
before implementation.

The remaining sequence is fixed:

1. Implementation author: Codex GPT-5.6 Sol high, only after the delta review passes.
2. Pre-fetch implementation review: Grok 4.6 high, in `review-grok-implementation.md`. It
   verifies the loader's missing fetch path and lazy initialization, the `text_pair` call,
   the sigmoid-of-raw-logit transform, the reconstructed pair texts, the union projection and
   sort, the swap predicate, the pinned pair order, and the untouched forbidden files. It
   runs before the fetch.
3. The single authorized fetch runs. The ledger records the five byte SHA-256 values, and the
   implementation writes them into the preflight.
4. Bounded pin review: Grok 4.6 high verifies that the preflight pins equal the ledger
   values, and that the hash edit changed nothing else. It runs before the referee.
5. The one referee runs. Result verification: Codex GPT-5.6 Terra high recomputes the
   readings from the stored score cache in `result-verification-terra.md`.

Effort stays high; escalate to xhigh only after a high pass misses a real finding.

Closeout records, whatever the outcome: the five phase-two file hashes, the snapshot path, the
`probeScoreSha256`, the score-cache SHA-256, the result SHA-256 and stamp, the per-reading
tables with exact misses, the selected `m` if any, the changed-ranking list, and the outcome
label. The round ledger and `eval/vectorize/README.md` carry the record. `.agents/TODO.md` and
`.agents/NEXT.md` get one dated attempt-accounting paragraph each. Result JSON files stay
local.

## 18. Out of scope

- Any production model call, Vectorize binding, Workers AI binding, or deploy.
- Any change to `src/`, the manifest, the frozen contracts, or `eval/gates.json`.
- The production `TIER_INTERLEAVE_MARGIN` policy; that belongs to a later product-wiring brief.
- A paid QA arm. The dormant pre-registered `R0`/`R1` QA slice activates only for a candidate
  that passes both frozen contracts, and only under its own reviewed spend plan.
- Any per-case, per-class, or per-entry tuning.
- Attempt three. It stays in the box regardless of this attempt's outcome.
