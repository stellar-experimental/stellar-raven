# Independent pre-implementation review — cross-encoder brief

Date: 2026-08-31
Reviewer: Grok 4.6 high
Author: Claude Fable 5 high (`brief-fable.md`)
Orchestrator: Claude Fable 5 high
Reviewed file: `.agents/rounds/2026-08-31-protocol-history-cross-encoder-v1/brief-fable.md`
Status: complete. Started from the brief, the frozen contracts, the attempt-one brief, and the
pinned runtime. Did not read an author transcript. No model was downloaded. No model ran. No
paid call ran. This reviewer wrote only this file.

This review does not authorize implementation, fetch, preflight, or a referee.

## Verdict

**BLOCK**

Do not implement this brief as written. Do not fetch the model.

The named `text-classification` pipeline cannot score a (query, clause) pair. The stated
sigmoid transform contradicts that pipeline's softmax path on this one-label config. The
snapshot layout does not match the runtime's `localModelPath` resolution. The remainder sort
and pair-batch order are not pinned, so two faithful implementations can change the measured
outcome.

Repair the blocking findings. Then run one bounded delta review.

## Evidence this review checked

All checks were free and read-only. No weight file was fetched.

| Check | Result |
| --- | --- |
| `HEAD` | `957b143893842d875050f42581faf514a945c41f` (equal to `main`) |
| Dirty paths | `.agents/NEXT.md`, `.agents/TODO.md`, this round's ledger and brief only |
| Frozen contracts and `src/` | unchanged |
| Pinned runtime | `@huggingface/transformers@4.2.0` in `package.json` |
| Clause artifact bytes | 3,917,367 |
| Clause artifact SHA-256 | `e5f86644af89158c3ac4d61ee7f651e2a062c9d292f194cb94872c7eee4e71f4` |
| `clauseSetSha256` | `cc5df2e4d89522c580626cfc21727b927494f5f528f42acfa035187a211d89e5` |
| Clause counts | 683 total; 608 positive; 75 negative; 79 entries |
| Artifact `clauses[]` stores `text` | no; only `textSha256` plus metadata |
| Live input hashes | manifest `4945c311…`, inventory `1a261c4a…`, archetypes `beeea9b5…` match the artifact |
| Searchable entries | 79 |
| Unique referee questions | 563 from 564 rows (same concatenation as `run-clause-fit.mjs`) |
| Comparison rows | 495 = 338 + 122 + 23 + 8 + 4 |
| `gates.json` accepted totals | legacy 208/279/311; skills top-1 16; holdout 10/22/25 with 11 forbidden |
| Extended floors | 90/109/117 strict; accept-either top-5 122/122 in the attempt-one referee |
| Xenova `main` | `280bcc27a84e0b898c251e06fddb25171bd9b101` |
| BAAI `main` | `2cfc18c9415c912f9d8155881c133215df768a70` |
| Architecture | `XLMRobertaForSequenceClassification`; `id2label` only `LABEL_0`; no `problem_type` |
| Cloudflare mirror | `@cf/baai/bge-reranker-base` exists; docs map the logit with sigmoid |
| Local cross-encoder snapshot | none required for this review |

Pinned file identities at revision `280bcc27…` match section 3.2:

| Path | Size | Upstream identity |
| --- | ---: | --- |
| `config.json` | 782 | git blob SHA-1 `ef36f7221740ddc57b6cfae14977840d1fc0fc95` |
| `tokenizer_config.json` | 443 | git blob SHA-1 `059214673d9d6d2ee319411e2ffec8c024b816d5` |
| `special_tokens_map.json` | 279 | git blob SHA-1 `68171d1ff68b731a33d119708476692c094a466b` |
| `tokenizer.json` | 17,098,079 | LFS SHA-256 `48564c5c7d3fa64d85d95e65414a542385f88b0f128fd8d4163fd7a57f2be05c` |
| `onnx/model_quantized.onnx` | 279,301,077 | LFS SHA-256 `dd98f3e67837d23210a6b7550c08cced4f61845b940ac45be3565840a10f3244` |

`dtype: "q8"` maps to suffix `_quantized` in `DEFAULT_DTYPE_SUFFIX_MAPPING`. That file name is
correct. `get_tokenizer_files` in 4.2.0 returns only `tokenizer.json` and
`tokenizer_config.json`. `sentencepiece.bpe.model` is present upstream and is correctly not
required.

## What holds

These parts match the frozen measurement box and do not need repair:

- Measurement-only boundary. No `src/` change. No production model call. No paid QA arm.
- Frozen clause set, artifact hash, and `requireCatalogMatch`. Rebuilding the artifact is
  forbidden.
- Query text is the raw question. The Qwen `Instruct:` wrapper is not used.
- Fit formula `pos - max(0, neg - pos)` with `neg = 0` when there is no negative clause. On
  sigmoid scores in (0, 1) this still yields `fit = pos` when `neg <= pos`.
- Swap predicate: `fit >= fit(prev) + m` and `fit !== fit(prev)`. Equal `fit` keeps base order.
  `m = Infinity` cannot move a finite fit.
- Identity baselines 4/8, 1/4, 3/11, 6/9 plus `gates.json` accepted totals.
- Acceptance table matches attempt-one section 11 and `eval/gates.json`.
- One referee builds the cache and all five readings. `shouldFail` stays true unless a grid
  reading passes the full table. `PARTIAL` still exits `1`.
- Fetch budget of two script invocations. Static revision URLs. `allowRemoteModels = false`
  and `useFSCache = false` are the right flags.
- Reviewer differs from the author and the orchestrator.
- Stop states `BLOCKED-FETCH`, `BLOCKED-ASSETS`, and `BLOCKED-RUNTIME` are the right classes.

## Blocking findings

### H1 — Pair encoding is unspecified; the named pipeline cannot score a pair

Section 1 says the model reads one query and one clause together. Section 5 says the scorer
constructs a `text-classification` pipeline and "scores pairs" at `batchSize` 16. Section 5
also names "pair-text helpers". Section 6 never pins the tokenizer call.

`@huggingface/transformers@4.2.0` `TextClassificationPipeline._call` tokenizes only `texts`:

```js
const model_inputs = this.tokenizer(texts, { padding: true, truncation: true });
```

It does not pass `text_pair`. A string array is a batch of single sequences, not (query,
document) pairs. The tokenizer pair API is `tokenizer(text, { text_pair })` in
`tokenization_utils.js`. Question-answering and zero-shot pipelines use that option. Text
classification does not.

XLM-RoBERTa pair encoding inserts `<s> query </s></s> clause </s>`. Concatenation of the two
strings, or a single-string `classifier(query + " " + clause)`, is a different input. The
Xenova README example also calls `classifier('I love transformers!')` on one string. That
example is not a rerank call.

FlagEmbedding and the Cloudflare `@cf/baai/bge-reranker-base` docs take a query and a passage
as two fields. A later product mirror cannot match this measurement unless this attempt uses
the same pair encoding.

Repair: pin the scoring call to tokenizer pair encoding, then the sequence-classification
model, not `pipeline()._call`:

```js
tokenizer(queries, {
  text_pair: clauses,
  padding: true,
  truncation: true,
  max_length: 512,
});
const { logits } = await model(inputs);
```

`tokenizer_config.json` at the pin sets `model_max_length` to 512. Record that each score is
the sigmoid of `logits[i][0]`. Forbid string concatenation and forbid reading
`pipeline()._call(...).score`. Add an offline test that the pair helper calls `text_pair` and
does not join the two strings.

### H2 — Sigmoid versus the pipeline softmax; one-label softmax is always 1

Section 3 freezes `scoreTransform: sigmoid`. Section 6 says the model returns one logit and
the scorer applies sigmoid to (0, 1). Cloudflare docs for `@cf/baai/bge-reranker-base` say the
same: map the relevance logit with the sigmoid.

The pinned `config.json` has one label (`id2label: {"0": "LABEL_0"}`) and no `problem_type`.
`TextClassificationPipeline` then takes the default branch:

```js
problem_type === 'multi_label_classification'
  ? (batch) => batch.sigmoid()
  : (batch) => new Tensor('float32', softmax(batch.data), batch.dims);
```

`softmax` of a one-element logit is `[1]` for every finite logit (`maths.js` `softmax`). Every
pair would then have score `1`. Every `fit` would then be equal. The swap predicate would
move nothing at any grid `m`. Every grid reading would copy identity. That is a measured
`FAIL` of a broken scorer, not a cross-encoder measurement.

If an implementer applies sigmoid to `pipeline().score` after that softmax, every score
becomes `sigmoid(1) ≈ 0.731`. The grid still cannot separate entries.

Repair: extract the raw logit. Apply `1 / (1 + exp(-logit))` once. Do not use pipeline
`score`. Pin that the probe SHA-256 hashes the little-endian float32 of that sigmoid value.
Add a synthetic-logit test: logit `0` yields `0.5`; a one-label softmax path is rejected.

### H3 — Snapshot path and `localModelPath` do not match the runtime resolver

Attempt one spent its referee on a `main` tokenizer probe and a missing flattened snapshot.
The finish-plan review recorded the 4.2.0 contract:

- `pipeline()` calls `get_pipeline_files(task, model, { device, dtype })`.
- That call does not receive `revision`.
- `get_tokenizer_files` probes `tokenizer_config.json` with empty options, so revision
  `main`.
- `buildResourcePaths` sets `localPath` to `pathJoin(env.localModelPath, modelId, filename)`.
- The local path has no revision component.
- `get_file_metadata` returns `{ exists: false }` when `allowRemoteModels` is false and the
  file is not at that path. The pipeline then omits the tokenizer.

The working Qwen snapshot is:

`RAVEN_VECTORIZE_MODEL_DIR/<modelId>/{config.json, tokenizer_config.json, tokenizer.json, onnx/model_quantized.onnx}`

with `env.localModelPath = RAVEN_VECTORIZE_MODEL_DIR` (the parent of `modelId`).
`embedder.mjs` verifies `path.join(modelDir, MODEL.id, filename)`.

This brief puts files at:

`~/.cache/stellar-raven/bge-reranker-base-q8-280bcc2/Xenova/bge-reranker-base/`

and sets `env.localModelPath = <snapshot>`. If `<snapshot>` is that inner directory, the
runtime looks for `<snapshot>/Xenova/bge-reranker-base/config.json`. That nested path does
not exist. The loader's "five files exist" check can still pass on the inner directory, then
`pipeline('text-classification', 'Xenova/bge-reranker-base')` misses the tokenizer.

Passing `revision` into `pipeline()` does not fix file discovery. `get_pipeline_files` still
omits it.

Repair: copy the Qwen layout exactly.

- `RAVEN_RERANK_MODEL_DIR` is `~/.cache/stellar-raven/bge-reranker-base-q8-280bcc2`.
- Files live at `$RAVEN_RERANK_MODEL_DIR/Xenova/bge-reranker-base/<section 3.2 path>`.
- `env.localModelPath = process.env.RAVEN_RERANK_MODEL_DIR`.
- The loader verifies `path.join(modelDir, MODEL.id, relativePath)` for all five files
  before `pipeline()`.
- The loader is lazy. Module import must not construct the pipeline. Offline tests import
  the referee and must not load the model.

State the 4.2.0 `main`-probe fact in the brief so the next implementer does not re-learn it.

### H4 — Remainder order and the scoring projection are not frozen

Section 7 says the union is attempt-one section 5 "verbatim", then restates `R` as "ordered
by that score then by id". It omits descending versus ascending. Attempt one pinned ungated
score descending, then `id` ascending.

The swap pass is one left-to-right bubble, not a full sort. Remainder order is the base
order after `P5`. Reversing `R` changes which later candidate is compared first. That can
change the top five.

Section 7 also omits the frozen projection
`{ id, name: entry.id, service, kind, description, keywords, routingKeywords }`.
The attempt-one delta review recorded that production uses the last id segment plus aliases.
An `R` built with production names can change membership and order. Identity still returns
`P5`, so calibration can pass while candidate readings change.

Repair: restate attempt-one section 5 in this brief, including the projection and the sort
keys. Keep tests 12 and 13. Add a test that `R` is sorted by ungated score descending, then
`id` ascending, and that `name` is `entry.id`.

### H5 — Pair order and batch composition are unpinned

Section 8 says q8 inference at `batchSize` 16 may not be bit-identical across batch
compositions, then treats the cache as the frozen record. It does not pin the composition
that creates that cache.

`padding: true` pads to the longest sequence in the current batch, not to 16. A different
pair order changes padding, q8 logits, sigmoid scores, `fit`, and swaps. Two implementers
who follow the brief can store different caches and get different PASS/FAIL labels. Terra
recomputing from one stored cache cannot detect that the cache itself was an unpinned
choice.

Repair: pin all of the following before any fetch:

1. Query order: first-seen unique questions from the same concatenation as
   `eval/vectorize/run-clause-fit.mjs` (comparison 495, then holdout 49, then the 20 blind
   rows). That yields the 563 texts.
2. For each query, `pairIndex` is the artifact clause indexes whose `entryId` is in
   `B(query)`, in artifact order.
3. Score those pairs in `queries[]` order, then `pairIndex` order, in contiguous batches of
   16. The last batch is the remainder. Do not pad the remainder with dummy pairs.
4. Readings read scores only through `pairIndex`. They never rescore.

Add a test that a planted cache with one changed pair index produces the planted swap, and
that a different `pairIndex` order with the same flat `scores` is not treated as the same
record.

### H6 — Tests do not lock the measurement-critical contracts

Section 14 re-asserts fit, swap, union membership, and cache round-trip. Those tests are
necessary. They are not sufficient.

Missing offline tests that must pass before the fetch:

1. Pair helper uses `text_pair`. It does not concatenate query and clause.
2. Scorer maps a raw logit through sigmoid. It does not read pipeline `score`.
3. Loader verifies `path.join(modelDir, MODEL.id, filename)` and sets
   `localModelPath` to `modelDir`, `allowRemoteModels` to false, `useFSCache` to false,
   before any `pipeline()` call.
4. Importing the referee or scorer with `RAVEN_RERANK_MODEL_DIR` unset does not construct
   a pipeline.
5. Remainder sort and `name: entry.id` as in H4.
6. Equal `fit` values keep base order at every registered `m`, not only at `m = 0`
   (attempt-one test 18).

Without these tests, H1–H5 can ship as an accidental concatenation-plus-softmax identity
copy.

## Residual findings

These do not independently block after H1–H6 are repaired. Fix them in the same delta.

### M1 — Phase-two hash freeze versus the pre-fetch review

Section 3.3 says the post-implementation review checks that preflight pins equal the ledger
byte SHA-256 values. Section 17 puts that review before the fetch. Phase-two hashes do not
exist until the fetch prints them.

Repair: the pre-fetch review checks the loader, the pair call, the union, the swap, and the
forbidden files. After the fetch, record the five byte SHA-256 values in the ledger, write
them into the preflight, and require a bounded pin review of that hash edit before the
referee. The LFS SHA-256 values already are the byte SHA-256 of the two large files. The
three small files still need phase-two byte SHA-256.

### M2 — Clause texts are not stored in the artifact JSON

Section 1.2 calls the artifact the clause-text source. The committed `clauses[]` rows have
`textSha256` and no `text`. `loadClauseArtifact({ requireCatalogMatch: true })` rebuilds
texts from the live catalog, inventory, and archetypes, then checks hashes.

Repair: say the loader returns live reconstructed texts whose `textSha256` must match the
artifact. Do not read a `text` field from the JSON.

### M3 — Overlay file is outside the forbidden list

`eval/vectorize/run-clause-fit.mjs` reads `eval/build-question-overlay.json` for accept-either
labels. Editing it would move extended and legacy totals. It is not in section 12's
forbidden list.

Repair: add `eval/build-question-overlay.json` to the byte-for-byte forbidden set. The
allowed write set stays exclusive.

### M4 — `special_tokens_map.json` is extra for the runtime

`get_tokenizer_files` does not load this file. Fetching and hashing it is harmless. Keep it
if the five-file pin is already written. Do not treat a runtime that ignores it as a loader
defect.

## What this BLOCK requires

- Close H1–H6 in `brief-fable.md`.
- Keep the model pin, the five-file identities, the frozen clause set, the acceptance table,
  the one-referee rule, and the no-`src/` boundary.
- Run one bounded delta review of the repaired sections (pair call, score transform, loader
  layout, union sort, pair order, tests).

## What this BLOCK does not allow

- A model fetch.
- Implementation of section 12 files.
- A preflight or referee run.
- A second `m` grid, a clause edit, or a production wiring brief.
- A claim that `text-classification` pipeline `score` is the BGE relevance score.

The next review record is a bounded delta of the repaired brief, not an implementation
review.
