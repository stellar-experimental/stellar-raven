# Brief reconciliation — cross-encoder review findings

Date: 2026-08-31
Author: Claude Fable 5 high (brief author)
Orchestrator: the root Codex agent
Review reconciled: `review-grok-brief.md` (verdict `BLOCK`)
Repaired file: `brief-fable.md`
Status: every finding is repaired or dispositioned below. No model was downloaded. No model
ran. No pin, clause, gate, grid value, or boundary changed.

## Blocking findings

| # | Finding | Repair | Brief sections |
| --- | --- | --- | --- |
| H1 | The `text-classification` pipeline cannot score a (query, clause) pair; the pair encoding was unspecified. | Repaired. The scorer now loads `AutoTokenizer` and `AutoModelForSequenceClassification` directly and never constructs a `pipeline()`. The scoring call is pinned verbatim: `tokenizer(queries, { text_pair: clauses, padding: true, truncation: true, max_length: 512 })`, then `const { logits } = await model(inputs)`. String concatenation is forbidden. Test 4 locks the `text_pair` call. | 3, 3.1, 5, 6, 14 |
| H2 | The one-label softmax path returns `1` for every finite logit, so the stated sigmoid contradicted the pipeline. | Repaired. The score is exactly `1 / (1 + exp(-logits[i][0]))` — one sigmoid over the raw logit. Reading any pipeline `score` field is forbidden. A logit of `0` must score `0.5`; constant scores across distinct pairs abort. The probe hashes the sigmoid of the raw logit. Tests 5 and 6 lock the transform and reject the softmax path. | 3, 5, 6, 14 |
| H3 | The snapshot layout did not match the 4.2.0 `localModelPath` resolver, and initialization order was unstated. | Repaired. The brief now copies the Qwen layout exactly: `RAVEN_RERANK_MODEL_DIR` is the parent `~/.cache/stellar-raven/bge-reranker-base-q8-280bcc2`, the files live at `$RAVEN_RERANK_MODEL_DIR/Xenova/bge-reranker-base/<path>`, `env.localModelPath` is the parent, and the loader verifies `path.join(modelDir, RERANK_MODEL.id, relativePath)` for all five files before construction. Initialization is lazy: importing the scorer, referee, or tests constructs nothing. The 4.2.0 `main`-probe and no-revision-local-path facts are stated in the brief. Tests 7 and 8 lock the layout and the lazy rule. | 5, 14 |
| H4 | The remainder sort direction and the frozen scoring projection were omitted. | Repaired. Section 7 restates attempt-one section 5 completely: `R` is ordered by ungated score descending, then `id` ascending; the projection is `{ id, name: entry.id, service, kind, description, keywords, routingKeywords }` with `name` never the alias-aware production name; `B = P5 ++ R` with the attempt-one tier marking. Test 19 locks the sort and the projection name. | 7, 14 |
| H5 | The pair order and batch composition were unpinned, so two faithful implementations could store different caches. | Repaired. Section 8 pins all four rules before any fetch: the first-seen unique query order from the `run-clause-fit.mjs` concatenation (495, then 49, then 20 rows → 563 texts); `pairIndex` as the `B(query)` clause indexes in artifact order; scoring in `queries[]` then `pairIndex` order in contiguous batches of 16 with an unpadded remainder; readings read only through `pairIndex` and never rescore. A cache with a different `pairIndex` order is a different record. Tests 22–24 lock the composition. | 8, 14 |
| H6 | The test list did not lock the measurement-critical contracts. | Repaired. Section 14 adds the six required tests: the `text_pair` call (test 4), sigmoid of the raw logit with softmax rejection (tests 5–6), loader path and env verification before construction (test 7), lazy import (test 8), remainder sort and `name: entry.id` (test 19), and equal-`fit` base order at every registered `m` (test 14). All section 14 tests must pass before the fetch. | 14 |

## Residual findings

| # | Finding | Repair or disposition | Brief sections |
| --- | --- | --- | --- |
| M1 | The phase-two hash check was sequenced before the hashes exist. | Repaired. The sequence is now: pre-fetch implementation review (loader, pair call, union, swap, pair order, forbidden files); then the single fetch; then the ledger records the five byte SHA-256 values and the implementation writes them into the preflight; then a bounded pin review verifies the hash edit before the referee. The two LFS values already are byte SHA-256, so phase two adds only the three small files. | 3.3, 17 |
| M2 | The artifact stores `textSha256` only; the brief called it a clause-text source. | Repaired. The artifact is now the clause identity source. The loader returns live reconstructed texts through `loadClauseArtifact({ requireCatalogMatch: true })`, every text must match its recorded `textSha256`, and no `text` field is read from the JSON. Test 1 asserts the hash match. | 1.2, 6, 14 |
| M3 | `eval/build-question-overlay.json` was outside the forbidden set. | Repaired. The overlay file is in the byte-for-byte forbidden set, with the reason: it carries the accept-either labels, so an edit would move extended and legacy totals. | 12 |
| M4 | `special_tokens_map.json` is ignored by `get_tokenizer_files`. | Dispositioned, no pin change. The file stays in the five-file pin for provenance. The brief states that the runtime ignores it and that this is not a loader defect. | 3.2 |

## Role correction

The review header listed Claude Fable 5 as both author and orchestrator. The correct record:
Claude Fable 5 high authored the brief and this reconciliation. The root Codex agent
orchestrates the round. Grok 4.6 high reviews and differs from both. The brief section 17 and
the round ledger now carry this record.

## What did not change

- The model pin: `Xenova/bge-reranker-base` at `280bcc27a84e0b898c251e06fddb25171bd9b101`.
- The five file identities, sizes, and the two LFS SHA-256 values.
- The frozen clause set (`cc5df2e4…`) and the clause artifact hash (`e5f86644…`).
- The acceptance table, the `gates.json` baselines, and the identity calibration bars.
- The grid (`Infinity`, `0`, `0.05`, `0.10`, `0.20`), the fit formula, and the swap predicate.
- The one-referee rule, the two-invocation fetch budget, and all stop states.
- The no-`src/` boundary and the measurement-only scope.

## Next gate

Grok 4.6 high runs one bounded delta review of the repaired sections: the pair call, the
score transform, the loader layout, the union sort, the pair order, and the tests. No fetch,
implementation, preflight, or referee work starts before that review passes.
