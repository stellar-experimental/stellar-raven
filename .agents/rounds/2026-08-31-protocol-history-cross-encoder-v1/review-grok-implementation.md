# Independent pre-fetch implementation review — cross-encoder harness

Date: 2026-08-31
Reviewer: Grok 4.6 high
Author: Codex GPT-5.6 Sol high (section 12 files)
Orchestrator: the root Codex agent
Brief: `.agents/rounds/2026-08-31-protocol-history-cross-encoder-v1/brief-fable.md`
Pre-implementation reviews: `review-grok-brief.md` (BLOCK) and `review-grok-brief-delta.md` (PASS)
Status: complete. Started from the repaired brief, then the implementation files. The model
was not fetched. The model was not loaded. The referee was not run. This reviewer wrote
only this file.

This review does not authorize a referee. It does not authorize a product commit.

## Verdict

**PASS**

The harness matches the frozen brief. The scorer uses a direct `text_pair` tokenizer call
and one sigmoid of `logits[i][0]`. The loader is lazy and local-only on the parent snapshot
layout. The fetch script has a static five-file URL list. The three small phase-two hashes
are still `null`. Clause texts are reconstructed and hash-checked. The candidate projection,
remainder sort, pair order, cache schema, identity bars, and one-referee path match the
brief. No forbidden file changed.

The focused offline tests passed 25 of 25. No hidden transformers `pipeline()` call exists
in the scorer.

## Evidence this review checked

All checks were free. `loadReranker()` did not run. `fetchSnapshot()` did not run.

| Check | Result |
| --- | --- |
| `HEAD` | `957b143893842d875050f42581faf514a945c41f` |
| Tracked forbidden paths | no diff (`src/`, manifest, frozen contracts, overlay, attempt-one files, `eval/qa/`) |
| Tracked implementation edit | `package.json` adds the three brief scripts only |
| New files | the seven section-12 paths |
| Focused tests | `test/eval-vectorize-rerank-fit.test.mjs` — 25 passed in 12.71s |
| Clause reconstruction | 683 live texts; artifact rows have no `text` field |
| Lazy import | `__lazyStateForTest.initialized` is false; `RAVEN_RERANK_MODEL_DIR` unset |
| Phase-two small hashes | `config.json`, `tokenizer_config.json`, `special_tokens_map.json` are `null` |
| Phase-two large hashes | the two LFS SHA-256 values, already byte SHA-256 |
| `assertPhaseTwoPinsComplete()` | throws listing the three unset files |
| Fetch URL list | exactly five `.../resolve/280bcc27…/<path>` URLs; no Hub resolver |
| Snapshot parent | `~/.cache/stellar-raven/bge-reranker-base-q8-280bcc2` |
| File join | `$parent/Xenova/bge-reranker-base/<path>` |
| Transformers `pipeline()` in scorer | none |
| Node stream `pipeline()` in fetch | download write only; not the model API |

Fetch URLs, computed without a download:

```
https://huggingface.co/Xenova/bge-reranker-base/resolve/280bcc27a84e0b898c251e06fddb25171bd9b101/config.json
https://huggingface.co/Xenova/bge-reranker-base/resolve/280bcc27a84e0b898c251e06fddb25171bd9b101/tokenizer_config.json
https://huggingface.co/Xenova/bge-reranker-base/resolve/280bcc27a84e0b898c251e06fddb25171bd9b101/special_tokens_map.json
https://huggingface.co/Xenova/bge-reranker-base/resolve/280bcc27a84e0b898c251e06fddb25171bd9b101/tokenizer.json
https://huggingface.co/Xenova/bge-reranker-base/resolve/280bcc27a84e0b898c251e06fddb25171bd9b101/onnx/model_quantized.onnx
```

## Frozen-contract checklist

| Brief rule | Implementation | Status |
| --- | --- | --- |
| Direct `text_pair` call | `tokenizePairs` calls `tokenizer(queries, { text_pair: clauses, padding: true, truncation: true, max_length: 512 })`. No concatenation. Test 4. | pass |
| Raw-logit sigmoid | `scoreRawLogits` reads `logits[i][0]` (Tensor `item()` or scalar) and applies `1 / (1 + exp(-x))`. Logit `0` → `0.5`. Pipeline `score` is ignored. Tests 5–6. | pass |
| Lazy local-only loader | `loadReranker` constructs on first score. Import constructs nothing. Before `from_pretrained`: verify `path.join(modelDir, id, path)`, set `allowRemoteModels=false`, `allowLocalModels=true`, `localModelPath=modelDir`, `useFSCache=false`. No `revision` argument. Tests 7–8. | pass |
| Parent snapshot layout | `RAVEN_RERANK_MODEL_DIR` is the parent. Files live at `$DIR/Xenova/bge-reranker-base/<path>`. Fetch writes there, then prints byte SHA-256. | pass |
| Static five-file fetch | `MODEL_FILES` has five pins. URLs are string constants plus the relative path. Size then git-blob SHA-1 or LFS SHA-256. Exclusive create (`wx`). Temp dir deleted on failure. Nothing written into the repo or the Hugging Face cache. | pass |
| Unset small phase-two hashes | Three small files are `null`. Preflight refuses them. Large-file LFS hashes are already set. | pass |
| Deterministic clause reconstruction | `loadRerankClauseArtifact` uses `loadClauseArtifact({ requireCatalogMatch: true })`, forbids a stored `text` field, and checks every `textSha256`. Vectors are not used for scoring. Test 1. | pass |
| Projection and remainder sort | `{ id, name: entry.id, ... }`. `R` sorts ungated descending, then `id` ascending. Tests 17–19. | pass |
| Query / pair / batch order | First-seen unique from the `run-clause-fit.mjs` concatenation (495, then 49, then 20 → 563). `pairIndex` is artifact indexes in artifact order for ids in `B`. Contiguous batches of 16; remainder unpadded. Test 22. | pass |
| Cache schema and integrity | Section 8 fields. `validateScoreCache` refuses model, clause-set, query-order, and pair-index drift. Readings use the cache only. Tests 20–24. | pass |
| Identity and acceptance | Identity checks `gates.json` accepted totals plus 4/8, 1/4, 3/11, 6/9, then reports readings. Gate table matches brief section 10. `shouldFail` is grid-only. Test 25. | pass |
| One-referee behavior | One `main()` scores once, writes the cache, then derives all five readings. `PARTIAL` still exits `1`. | pass |
| No forbidden-file edits | Held. | pass |
| No hidden network path | Scorer never calls transformers `pipeline()`. `from_pretrained` runs only after `allowRemoteModels=false`. Fetch is a separate script and was not run. | pass |

`@huggingface/transformers@4.2.0` Tensor indexing supports `logits[i][0]` through `_getitem` and `item()`. Encoder-only sessions resolve `dtype: "q8"` to `onnx/model_quantized.onnx` with no `generation_config.json`.

## Residual notes

These do not reopen the BLOCK. They do not need a delta brief. Keep them during the pin review.

### R1 — The referee does not re-check phase-two pins

`run-rerank-fit.mjs` requires `RAVEN_RERANK_IMPLEMENTATION_COMMIT` and
`RAVEN_RERANK_PROBE_SCORE_SHA256`. It does not import `assertPhaseTwoPinsComplete`. Section
17 still requires the bounded pin review before the referee. Preflight already refuses the
three `null` hashes. Do not run the referee until that pin review passes.

### R2 — Fetch-budget counting is process-only

The script does not count invocations. A second run fails if the snapshot parent already
exists. The ledger still owns the two-invocation stop.

### R3 — Fetch uses Node stream `pipeline`

`fetch-rerank-model.mjs` imports `pipeline` from `node:stream/promises` to write the
download. That is not `@huggingface/transformers` `pipeline()`. Do not treat it as a model
loader.

## What this PASS allows

- Close the pre-fetch implementation gate.
- Run `npm run eval:vectorize:rerank:fetch` at most twice, under the brief's fetch stop.
- Record the five printed byte SHA-256 values in the ledger.

## What this PASS does not allow

- Filling the three small phase-two hashes without a bounded pin review.
- A preflight or referee run before that pin review passes.
- A second `m` grid, a clause edit, or a production wiring brief.
- Any `src/` change.
- A paid QA arm.
- A claim that transformers `pipeline().score` is the BGE relevance score.

The next review record is the bounded pin review of the preflight hash edit, after the fetch.
