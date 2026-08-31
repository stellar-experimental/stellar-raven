# Implementation review — clause-fit loader and preflight

Date: 2026-08-31
Reviewer: Grok 4.6 high
Author: Codex GPT-5.6 Sol high (`finish-implementation-sol.md` and the loader diff)
Orchestrator: Claude Fable 5 high
Plan: `.agents/rounds/2026-08-31-eval-routing-next/finish-plan-fable.md` §8
Prior plan reviews: `review-grok-finish-plan.md` (BLOCK) and `review-grok-finish-plan-delta.md` (PASS)
Status: complete. No model fetch ran. No model load ran. No preflight ran. No referee ran. This reviewer wrote only this file.

This review does not authorize a fetch. It does not authorize an artifact rebuild.

## Verdict

**PASS**

The loader and preflight match contracts 4.2 and 4.3. The four snapshot files match the pinned hashes. Protected clause, artifact, referee, test, contract, gate, and `src/` files are unchanged. The diff adds no fetch path.

The referee may run after the remaining §5 preconditions: this-machine preflight PASS, recorded probe-vector hash, `npm run eval:selftest`, and `npm run eval:compile`.

## Authorization answer

| Action | Authorized now? | Why |
| --- | --- | --- |
| Keep the machine-local snapshot | yes | Four files, no extras, hashes match section 2 |
| Keep the loader and preflight edits | yes | Contracts 4.2 and 4.3 hold |
| Run `eval:vectorize:clauses:preflight` with the env var set | yes | Local-only; this review did not run it |
| Run the one referee with the env var set | yes, after preflight PASS | Section 8 gate is this PASS; §5 still requires the live preflight record |
| Any model fetch | no | Zero-fetch budget remains |
| Artifact rebuild or `src/` change | no | Out of scope |

## Evidence this review checked

All checks were free and local. `extractor()`, `embedQueries`, and `pipeline()` did not run.

| Check | Result |
| --- | --- |
| `HEAD` | `1bfb9838491fa571166a2a631789a3b0e814980c` |
| Snapshot root | `/Users/kalepail/.cache/stellar-raven/qwen3-embedding-0.6b-q8-c25a394` |
| Snapshot file count | 4; no `main`-key copy; no extra file |
| `eval/vectorize/results/` | absent |
| Allowed implementation hashes | match `finish-implementation-sol.md` |
| Protected file hashes | match the implementation record |
| `src/`, `catalog/`, `inventory/`, `eval/gates.json` | no diff vs `HEAD` |

Snapshot hashes against plan section 2:

| File | Bytes | SHA-256 | Match |
| --- | ---: | --- | --- |
| `…/config.json` | 1,576 | `66a10929782f3c9a3cd5dec90e2a95c60e05736134a63cd54479eeae80bed175` | yes |
| `…/tokenizer_config.json` | 9,731 | `977648852447cb6587327ff3205b0a84cf2fc9f05621d6c8e88a497caafab2e1` | yes |
| `…/tokenizer.json` | 11,423,705 | `def76fb086971c7867b829c23a26261e38d9d74e02139253b38aeb9df8b4b50a` | yes |
| `…/onnx/model_quantized.onnx` | 613,527,631 | `87cd124e0ef1fd1f223ebc283efccbaeac386d0b08344701c46975d0657b591f` | yes |

## Loader contract (`eval/vectorize/embedder.mjs`)

SHA-256 `0976e8bbf5c7083dc954be4d9a21d4606fcfff53087b7dfeb9ee146fbb675e5f`.

All new work lives inside `extractor()`. Module load only imports `MODEL` and `queryText`. Tests that import this module still do not call `extractor()`.

When `RAVEN_VECTORIZE_MODEL_DIR` is set, `extractor()` checks the directory and the four files, then sets `env.allowRemoteModels = false`, `env.allowLocalModels = true`, `env.localModelPath = modelDir`, and `env.useFSCache = false`, then constructs `pipeline()`. A miss throws `missing local vector model asset: <exact path>` before `pipeline()`.

When the variable is unset or empty, the `pipeline({ revision, dtype })` call is unchanged from `HEAD`. That keeps frontier and build behavior.

The four-file check runs after the dynamic `import("@huggingface/transformers")` and before `pipeline()`. That still meets "before pipeline construction." Importing the local package is not a model fetch.

## Preflight contract (`eval/vectorize/preflight-clause-model.mjs`)

SHA-256 `c2c6b7f8f450755c8a592c895581b50c637f87994803ba5431793030c92f0c5a`.

Static imports are Node built-ins only. Order in `main()`:

1. Refuse unset, empty, or non-directory `RAVEN_VECTORIZE_MODEL_DIR`. Exit `1` through the catch path.
2. Hash the four pinned files. Print path and expected hash on miss or mismatch. Exit `1`.
3. Dynamic-import `clause-retrieval.mjs` and call `loadClauseArtifact({ requireCatalogMatch: true })`.
4. Dynamic-import `embedder.mjs` and embed only `clause-fit preflight probe`.
5. Print `probeVectorSha256`, `process.version`, `onnxruntime-node` version, and `process.platform`. Exit `0` only on success.

The probe hash is SHA-256 of the little-endian float32 payload, the same method as the clause artifact. That is a valid identity fingerprint.

## `package.json`

SHA-256 `2ac7f8402d0fcb24c812c71d487f37b0fc8aef60cf4c70302ed3fa1cd134844a`.

This finish step adds `eval:vectorize:clauses:preflight`. The script is `node eval/vectorize/preflight-clause-model.mjs`.

`eval:vectorize:clauses:build` and `eval:vectorize:clauses:run` remain from the prior authorized harness. They are not new fetch paths.

## Fetch path

The local-only branch cannot reach the Hub: presence check, `allowRemoteModels = false`, and `useFSCache = false` all run before `pipeline()`.

The preflight cannot reach the Hub with an unset env var: it exits before any embedder import.

No Hugging Face URL, download helper, or repair-fetch command exists in the new files.

The unset loader path still uses `pipeline({ revision, dtype })`. That is the required unchanged frontier path, not a new fetch. The referee command must keep `RAVEN_VECTORIZE_MODEL_DIR` set.

## Protected files

Byte-unchanged relative to the kept harness. Implementation-record hashes match live files.

| File | SHA-256 |
| --- | --- |
| `eval/vectorize/clause-config.mjs` | `39e0b2c42d845913541231dce90b8ecd0e949adc11c50eefea015b7cb291932e` |
| `eval/vectorize/clause-retrieval.mjs` | `a99e32319d27fe66c92887299971da257a1938073dececc095e7201c29c27cd9` |
| `eval/vectorize/build-clause-artifact.mjs` | `4c776e0cfa1c42ef3b7f52e56f11569085dec96e0aa2ac1862eede1e5f9db5bd` |
| `eval/vectorize/run-clause-fit.mjs` | `dac5457d6f967cda8e50c8596347ab50afaebe3c6225f743bf731ca5c7fced61` |
| `eval/vectorize/artifacts/qwen3-embedding-0.6b-q8-c25a394-clauses.json` | `e5f86644af89158c3ac4d61ee7f651e2a062c9d292f194cb94872c7eee4e71f4` |
| `test/eval-vectorize-clause-fit.test.mjs` | `c11a7f6b47e12a05dea3615a57ac7c800ad60f11baca6cbd422a036877567143` |
| `eval/protocol-history-cases.json` | `df8218e1b3a5a1526859c4c33d9b565cfd23f38b9c835d22fd93322c8e5c8857` |
| `eval/protocol-history-blind-cases.json` | `843aaa70c20eebe29d222a9f7e585a8ab6e722b88396b01c75079008d56446b3` |
| `eval/holdout-cases.json` | `cb34d83be86f63a0a4ba06977659afa91d0fbaecbeab0e86b82bef9d73c4bbf5` |

`eval/gates.json` and every file under `src/` have no diff vs `HEAD`. `implementation-sol.md` is unchanged.

`eval/README.md` and `eval/vectorize/README.md` still hold only the prior blocked-attempt record. They do not describe this loader. That matches the closeout rule: README updates wait for a completed reading.

## Implementation record

`finish-implementation-sol.md` matches the live snapshot, the live file hashes, and the stated non-actions. It does not claim a preflight run or a referee run.

## Actionable findings

None. No H, M, or L issue blocks the next step.

Residual note, not a repair: `extractor()` imports `@huggingface/transformers` before the presence check. A missing snapshot still throws before `pipeline()`. Moving the `statSync` loop above that import would avoid loading the library on a miss. Do not delay the referee for this.

## What this PASS allows

- Run `RAVEN_VECTORIZE_MODEL_DIR=/Users/kalepail/.cache/stellar-raven/qwen3-embedding-0.6b-q8-c25a394 npm run eval:vectorize:clauses:preflight`.
- After that preflight prints identity and exits `0`, run the single referee from plan §5 with the same env var.
- Record the probe-vector hash, then the query-cache hashes and result stamp.

## What this PASS does not allow

- A model fetch of any kind.
- A second referee invocation.
- A clause-artifact rebuild.
- A `src/` change or a production margin change.
- Treating the still-unrun measurement as `PASS`, `PARTIAL`, or `FAIL`.
