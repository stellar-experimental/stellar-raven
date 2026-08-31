# Clause-fit finish implementation

Date: 2026-08-31

Status: complete for the approved loader and preflight scope.

## Outcome

The four cached source files matched every approved pin.
The machine-local snapshot copy then passed the same four hash checks.
The result did not enter `BLOCKED-ASSETS`.

I added the local-only loader mode and the preflight command.
All six free gates passed with `RAVEN_VECTORIZE_MODEL_DIR` unset.
I did not run the preflight or the referee.
I did not fetch or load the model.

## Snapshot

Snapshot root:

`/Users/kalepail/.cache/stellar-raven/qwen3-embedding-0.6b-q8-c25a394`

| File | Bytes | SHA-256 |
| --- | ---: | --- |
| `onnx-community/Qwen3-Embedding-0.6B-ONNX/config.json` | 1,576 | `66a10929782f3c9a3cd5dec90e2a95c60e05736134a63cd54479eeae80bed175` |
| `onnx-community/Qwen3-Embedding-0.6B-ONNX/tokenizer_config.json` | 9,731 | `977648852447cb6587327ff3205b0a84cf2fc9f05621d6c8e88a497caafab2e1` |
| `onnx-community/Qwen3-Embedding-0.6B-ONNX/tokenizer.json` | 11,423,705 | `def76fb086971c7867b829c23a26261e38d9d74e02139253b38aeb9df8b4b50a` |
| `onnx-community/Qwen3-Embedding-0.6B-ONNX/onnx/model_quantized.onnx` | 613,527,631 | `87cd124e0ef1fd1f223ebc283efccbaeac386d0b08344701c46975d0657b591f` |

The source files used the pinned revision directory.
The source and destination hashes are identical.
The snapshot contains no copied `main`-key file.

## Implementation files

This finish step changed exactly these implementation files:

| File | Finish change | SHA-256 after change |
| --- | --- | --- |
| `eval/vectorize/embedder.mjs` | Added the environment-gated local-only loader. | `0976e8bbf5c7083dc954be4d9a21d4606fcfff53087b7dfeb9ee146fbb675e5f` |
| `eval/vectorize/preflight-clause-model.mjs` | Added the fail-closed local preflight. | `c2c6b7f8f450755c8a592c895581b50c637f87994803ba5431793030c92f0c5a` |
| `package.json` | Added only `eval:vectorize:clauses:preflight`. | `2ac7f8402d0fcb24c812c71d487f37b0fc8aef60cf4c70302ed3fa1cd134844a` |

This report is the only other file added by this finish step.

## Loader contract

The loader changes only inside `extractor()`.
The module import does not mutate the Transformers environment.

When `RAVEN_VECTORIZE_MODEL_DIR` is set, the loader checks the root directory first.
It then checks the four exact model files before `pipeline()`.
Each missing-asset error names the exact missing path.

After the checks, the loader sets these values:

- `env.allowRemoteModels = false`
- `env.allowLocalModels = true`
- `env.localModelPath = modelDir`
- `env.useFSCache = false`

The unset path keeps the existing `pipeline()` arguments unchanged.

## Preflight contract

The preflight imports only Node modules before its environment and hash gates.
It refuses an unset, empty, or invalid `RAVEN_VECTORIZE_MODEL_DIR`.
It hashes the four files before importing clause or model code.

The preflight then validates the live-matched clause artifact.
It dynamically imports the embedder only after the artifact check.
It embeds only the fixed `clause-fit preflight probe` string.

On success, it prints these identity fields:

- The probe-vector SHA-256.
- `process.version`.
- The `onnxruntime-node` version.
- `process.platform`.

The preflight script is:

```json
"eval:vectorize:clauses:preflight": "node eval/vectorize/preflight-clause-model.mjs"
```

## Protected files

I did not edit any clause file, artifact, referee, test, frozen contract, production file, README, or ledger.

| Protected file | SHA-256 |
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

## Exact snapshot commands

The source-presence checks were:

```sh
test -f node_modules/@huggingface/transformers/.cache/onnx-community/Qwen3-Embedding-0.6B-ONNX/c25a394dd583836952667c12f008335071b3f43d/config.json
test -f node_modules/@huggingface/transformers/.cache/onnx-community/Qwen3-Embedding-0.6B-ONNX/c25a394dd583836952667c12f008335071b3f43d/tokenizer_config.json
test -f node_modules/@huggingface/transformers/.cache/onnx-community/Qwen3-Embedding-0.6B-ONNX/c25a394dd583836952667c12f008335071b3f43d/tokenizer.json
test -f node_modules/@huggingface/transformers/.cache/onnx-community/Qwen3-Embedding-0.6B-ONNX/c25a394dd583836952667c12f008335071b3f43d/onnx/model_quantized.onnx
```

All four commands exited `0`.
The source hash command was:

```sh
shasum -a 256 node_modules/@huggingface/transformers/.cache/onnx-community/Qwen3-Embedding-0.6B-ONNX/c25a394dd583836952667c12f008335071b3f43d/config.json node_modules/@huggingface/transformers/.cache/onnx-community/Qwen3-Embedding-0.6B-ONNX/c25a394dd583836952667c12f008335071b3f43d/tokenizer_config.json node_modules/@huggingface/transformers/.cache/onnx-community/Qwen3-Embedding-0.6B-ONNX/c25a394dd583836952667c12f008335071b3f43d/tokenizer.json node_modules/@huggingface/transformers/.cache/onnx-community/Qwen3-Embedding-0.6B-ONNX/c25a394dd583836952667c12f008335071b3f43d/onnx/model_quantized.onnx
```

It exited `0` and returned the four approved hashes.

The copy commands were:

```sh
set -e
mkdir -p /Users/kalepail/.cache/stellar-raven/qwen3-embedding-0.6b-q8-c25a394/onnx-community/Qwen3-Embedding-0.6B-ONNX/onnx
cp node_modules/@huggingface/transformers/.cache/onnx-community/Qwen3-Embedding-0.6B-ONNX/c25a394dd583836952667c12f008335071b3f43d/config.json node_modules/@huggingface/transformers/.cache/onnx-community/Qwen3-Embedding-0.6B-ONNX/c25a394dd583836952667c12f008335071b3f43d/tokenizer_config.json node_modules/@huggingface/transformers/.cache/onnx-community/Qwen3-Embedding-0.6B-ONNX/c25a394dd583836952667c12f008335071b3f43d/tokenizer.json /Users/kalepail/.cache/stellar-raven/qwen3-embedding-0.6b-q8-c25a394/onnx-community/Qwen3-Embedding-0.6B-ONNX/
cp node_modules/@huggingface/transformers/.cache/onnx-community/Qwen3-Embedding-0.6B-ONNX/c25a394dd583836952667c12f008335071b3f43d/onnx/model_quantized.onnx /Users/kalepail/.cache/stellar-raven/qwen3-embedding-0.6b-q8-c25a394/onnx-community/Qwen3-Embedding-0.6B-ONNX/onnx/
```

The destination hash command was:

```sh
shasum -a 256 -c <<'PINS'
66a10929782f3c9a3cd5dec90e2a95c60e05736134a63cd54479eeae80bed175  /Users/kalepail/.cache/stellar-raven/qwen3-embedding-0.6b-q8-c25a394/onnx-community/Qwen3-Embedding-0.6B-ONNX/config.json
977648852447cb6587327ff3205b0a84cf2fc9f05621d6c8e88a497caafab2e1  /Users/kalepail/.cache/stellar-raven/qwen3-embedding-0.6b-q8-c25a394/onnx-community/Qwen3-Embedding-0.6B-ONNX/tokenizer_config.json
def76fb086971c7867b829c23a26261e38d9d74e02139253b38aeb9df8b4b50a  /Users/kalepail/.cache/stellar-raven/qwen3-embedding-0.6b-q8-c25a394/onnx-community/Qwen3-Embedding-0.6B-ONNX/tokenizer.json
87cd124e0ef1fd1f223ebc283efccbaeac386d0b08344701c46975d0657b591f  /Users/kalepail/.cache/stellar-raven/qwen3-embedding-0.6b-q8-c25a394/onnx-community/Qwen3-Embedding-0.6B-ONNX/onnx/model_quantized.onnx
PINS
```

It exited `0` and printed `OK` for every file.

## Command results

`RAVEN_VECTORIZE_MODEL_DIR` was unset before every free gate.

| Command | Exit | Result |
| --- | ---: | --- |
| `test -z "${RAVEN_VECTORIZE_MODEL_DIR:-}"` | `0` | Confirmed the variable was unset or empty. |
| `node --check eval/vectorize/embedder.mjs` | `0` | Passed. |
| `node --check eval/vectorize/preflight-clause-model.mjs` | `0` | Passed. |
| `./node_modules/.bin/vitest run test/eval-vectorize-clause-fit.test.mjs test/eval-discovery-vectorize.test.mjs` | `0` | Passed 31 tests in two files. |
| `npm run typecheck` | `0` | Passed. |
| `npm test` | `0` | Passed 1,536 tests in 97 files. |
| `npm run build` | `0` | Passed the micro-map build and Wrangler dry run. |
| `npm run secrets:scan -- --tree` | `0` | Found no leaks. |
| `git diff --check` | `0` | Found no whitespace errors. |

## Explicit non-actions

- I did not run `npm run eval:vectorize:clauses:preflight`.
- I did not run `npm run eval:vectorize:clauses:run`.
- I did not run `npm run eval:vectorize:clauses:build`.
- I did not run `embedQueries` or `pipeline()`.
- I made no network request and no paid call.
- I did not commit any file.
