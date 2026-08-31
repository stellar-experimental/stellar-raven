# Cross-encoder measurement harness implementation

Date: 2026-08-31
Author: Codex GPT-5.6 Sol high
Status: implementation complete; the pre-fetch review is next

## Result

The frozen `cross-encoder-fit-v1` measurement harness is implemented.
The implementation does not fetch or run the model.
The implementation keeps model initialization lazy.
The three small phase-two byte hashes remain unset.

The scorer calls the tokenizer with `text_pair`.
It calls `AutoModelForSequenceClassification` directly.
It applies one sigmoid to each raw `logits[i][0]` value.
It rejects constant scores across distinct pairs.

The loader requires the parent snapshot layout.
It disables remote models and the shared filesystem cache before construction.
The candidate union uses the frozen projection and sort.
The cache uses the frozen query, pair, and batch order.
The cache validator checks every frozen identity and payload hash.

## Files

New implementation files:

- `eval/vectorize/rerank-config.mjs`
- `eval/vectorize/fetch-rerank-model.mjs`
- `eval/vectorize/rerank-scorer.mjs`
- `eval/vectorize/preflight-rerank-model.mjs`
- `eval/vectorize/rerank-retrieval.mjs`
- `eval/vectorize/run-rerank-fit.mjs`
- `test/eval-vectorize-rerank-fit.test.mjs`

`package.json` registers these three scripts:

- `eval:vectorize:rerank:fetch`
- `eval:vectorize:rerank:preflight`
- `eval:vectorize:rerank:run`

No forbidden file changed in this implementation lane.
The existing dirty `NEXT`, `TODO`, ledger, brief, and review files remain untouched.

## Checks

All required offline checks pass:

- `./node_modules/.bin/vitest run test/eval-vectorize-rerank-fit.test.mjs`: 25 tests passed.
- `npm run typecheck`: passed.
- `npm test`: 98 files and 1,561 tests passed.
- `npm run build`: passed.
- `npm run secrets:scan -- --tree`: passed with no leaks.
- `npm run eval:selftest`: passed.
- `npm run eval:compile`: passed with 338 legacy and 122 extended cases.
- `git diff --check`: passed.

## Risks and blockers

No implementation blocker remains.

The model runtime remains untested because this phase forbids a fetch and model execution.
The three small phase-two SHA-256 values remain `null` in the preflight.
The preflight fails closed until the reviewed fetch supplies those values.

The next gate is the independent pre-fetch implementation review.
No fetch is authorized before that review passes.
