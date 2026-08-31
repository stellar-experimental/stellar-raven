# Bounded delta review — repaired `brief-fable.md`

Date: 2026-08-31
Reviewer: Grok 4.6 high
Source review: `.agents/rounds/2026-08-31-protocol-history-cross-encoder-v1/review-grok-brief.md` (BLOCK)
Reconciliation: `.agents/rounds/2026-08-31-protocol-history-cross-encoder-v1/brief-reconciliation-fable.md`
Repaired file: `.agents/rounds/2026-08-31-protocol-history-cross-encoder-v1/brief-fable.md`
Scope: H1–H6 and M1–M4 only. Accepted model pins, clauses, gates, grid, and boundaries were
not reopened except where a repair named them.
Status: complete. No model fetch ran. No model ran. No paid call ran. This reviewer wrote
only this file.

This delta does not authorize a fetch, a preflight, or a referee.

## Verdict

**PASS**

H1 through H6 and M1 through M4 are repaired in substance. The scorer is a direct
`text_pair` call on `AutoTokenizer` plus `AutoModelForSequenceClassification`. The score is
one sigmoid of `logits[i][0]`. The snapshot uses the Qwen parent layout with lazy
initialization. The candidate projection, remainder sort, and pair-batch order are frozen.
The added tests lock those contracts. The post-fetch pin review is now in the right place.

The author and orchestrator record is corrected. Grok differs from both.

## Evidence this review checked

All checks were free and read-only. No weight file was fetched.

| Check | Result |
| --- | --- |
| `HEAD` | `957b143893842d875050f42581faf514a945c41f` (equal to `main`) |
| Dirty paths | `.agents/NEXT.md`, `.agents/TODO.md`, this round's ledger, brief, reconciliation, and reviews |
| Frozen contracts and `src/` | unchanged |
| Model pin | `Xenova/bge-reranker-base` at `280bcc27a84e0b898c251e06fddb25171bd9b101` |
| Five file identities | unchanged from the source review |
| Clause set / artifact | `cc5df2e4…` / `e5f86644…` unchanged |
| Grid | `Infinity`, `0`, `0.05`, `0.10`, `0.20` unchanged |
| Acceptance table | unchanged |
| Query concatenation in `run-clause-fit.mjs` | 495 comparison rows, then holdout, then 20 blind rows |
| `AutoTokenizer.from_pretrained` | still loads through `get_tokenizer_files` (revision `main` probe) |
| `buildResourcePaths` | still `pathJoin(env.localModelPath, modelId, filename)` |
| Role record | Fable authored; root Codex orchestrates; Grok reviews |

## Original issue status

| Issue | Status | Evidence |
| --- | --- | --- |
| H1 | repaired | Sections 3, 5, and 6 pin `tokenizer(queries, { text_pair: clauses, padding: true, truncation: true, max_length: 512 })` then `const { logits } = await model(inputs)`. No `pipeline()`. String concatenation is forbidden. Test 4 locks the `text_pair` call. |
| H2 | repaired | The score is exactly `1 / (1 + exp(-logits[i][0]))`. Pipeline `score` is forbidden. Logit `0` must yield `0.5`. Constant scores across distinct pairs abort. Tests 5 and 6 lock the transform and reject the one-label softmax path. |
| H3 | repaired | `RAVEN_RERANK_MODEL_DIR` is the parent `~/.cache/stellar-raven/bge-reranker-base-q8-280bcc2`. Files live at `$DIR/Xenova/bge-reranker-base/<path>`. `env.localModelPath` is the parent. The loader verifies `path.join(modelDir, RERANK_MODEL.id, relativePath)` before construction. Initialization is lazy. The 4.2.0 `main`-probe fact is stated. Tests 7 and 8 lock the layout and the lazy rule. |
| H4 | repaired | Section 7 restates `R` as ungated score descending, then `id` ascending. The projection is `{ id, name: entry.id, service, kind, description, keywords, routingKeywords }`. `name` is never the production alias. Test 19 locks both. Tests 17 and 18 keep union membership. |
| H5 | repaired | Section 8 pins first-seen unique order from the `run-clause-fit.mjs` concatenation (495, then 49, then 20 → 563), `pairIndex` as `B(query)` clause indexes in artifact order, contiguous batches of 16 with one unpadded remainder, and cache-only readings. Tests 22–24 lock the composition. A different `pairIndex` order is a different record. |
| H6 | repaired | Section 14 adds the six required tests (4, 5–6, 7, 8, 19, 14) and requires them before the fetch. |
| M1 | repaired | Section 17 sequences pre-fetch implementation review, then fetch, then ledger hashes into the preflight, then a bounded pin review, then the referee. Section 3.3 matches. |
| M2 | repaired | Sections 1.2 and 6 treat the artifact as the clause-identity source. Texts come from `loadClauseArtifact({ requireCatalogMatch: true })`. No `text` field is read from the JSON. Test 1 asserts `textSha256`. |
| M3 | repaired | Section 12 forbids `eval/build-question-overlay.json` and states why. |
| M4 | dispositioned | Section 3.2 keeps `special_tokens_map.json` in the five-file pin. `get_tokenizer_files` still ignores it. That is not a loader defect. |

Supporting free checks:

- `run-clause-fit.mjs` builds `comparisonCases` as legacy + extended + skills + original
  positives + original controls (495), then holdout, then blind positives and controls.
  First-seen unique of that list is the 563-query order named in section 8.
- `embedder.mjs` already uses `path.join(modelDir, MODEL.id, filename)` and
  `env.localModelPath = modelDir`. Section 5 copies that parent layout.
- `AutoTokenizer.from_pretrained` still calls `get_tokenizer_files`, which probes
  `tokenizer_config.json` with empty options (revision `main`). The flattened parent
  layout remains the local-only fix.
- `eval/gates.json`, the clause artifact hashes, and the grid values were not edited.

## Author and orchestrator correction

The source review listed Claude Fable 5 as author and orchestrator. That record was wrong.

The repaired brief section 17, the reconciliation, and the round ledger now agree:

- Author: Claude Fable 5 high
- Orchestrator: the root Codex agent
- Reviewer: Grok 4.6 high

Grok differs from the author and the orchestrator. Independence holds.

## What did not change

The repair did not move the accepted measurement box:

- Model id, revision, five file identities, and the two LFS SHA-256 values
- Clause set `cc5df2e4…` and artifact `e5f86644…`
- Fit formula and swap predicate
- Grid `Infinity` / `0` / `0.05` / `0.10` / `0.20`
- Acceptance table and identity bars
- One-referee rule, two-invocation fetch budget, and stop states
- No-`src/` boundary and measurement-only scope

The overlay file joined the forbidden set. That tightens the boundary. It does not change
a gate.

## Residual notes

These do not reopen H1–H6. They do not need a further brief review.

### R1 — Section 4 names the inner directory; section 5 names the parent

Section 4 still writes files to
`~/.cache/stellar-raven/bge-reranker-base-q8-280bcc2/Xenova/bge-reranker-base/`.
Section 5 sets `RAVEN_RERANK_MODEL_DIR` to the parent of that path. Both are required.
Keep them both. Do not set `localModelPath` to the inner directory.

### R2 — `from_pretrained` omits `revision`

The pinned calls pass model id and `dtype: "q8"` only. Local resolution ignores
`revision`. Hash pins carry provenance. Do not add a revision argument that would re-open
a `main` remote path.

## What this PASS allows

- Close the original brief BLOCK.
- Implement the section 12 files after this delta.
- Run the pre-fetch implementation review
  (`.agents/rounds/2026-08-31-protocol-history-cross-encoder-v1/review-grok-implementation.md`).

## What this PASS does not allow

- A model fetch before the pre-fetch implementation review passes.
- A referee before the bounded pin review of the phase-two hashes.
- A second `m` grid, a clause edit, or a production wiring brief.
- Any `src/` change.
- A paid QA arm.
- A claim that `text-classification` pipeline `score` is the BGE relevance score.

The next authorized write is the Sol implementation of section 12, then the pre-fetch
implementation review.
