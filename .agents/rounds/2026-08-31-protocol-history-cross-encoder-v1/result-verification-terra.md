# Cross-encoder result verification — Terra

Date: 2026-08-31
Verifier: Codex GPT-5.6 Terra, high
Verdict: `PASS`

The verification passed.
The measured referee outcome remains `FAIL`.
The verifier did not load or import the model.
The verifier did not run the referee.

## Inputs

- Result: `2026-08-31T23-36-38-660Z-cross-encoder-fit-v1.json`
- Cache: `2026-08-31T23-36-38-565Z-cross-encoder-pair-scores.json`
- Preserved directory: `/Users/kalepail/.cache/stellar-raven/eval-results/cross-encoder-fit-v1-2026-08-31/`
- Implementation commit: `2763fb0afd4e6811f449cb6b1f56f2baf85e3734`
- Clause artifact SHA-256: `e5f86644af89158c3ac4d61ee7f651e2a062c9d292f194cb94872c7eee4e71f4`
- Preflight probe SHA-256: `e2bc86efb15f5232993b0bf5f63b5ce55cc7241abaec6a7e54364a13b664331b`

`git rev-parse HEAD` matched the frozen implementation commit.

## Independent hashes

`shasum -a 256` produced these raw-file hashes:

| Artifact | SHA-256 | Result |
| --- | --- | --- |
| Result | `529351b1562b14f68d18ef94b584ca37ae61290f68cfff7a5a1489e8b601ae0d` | matched ledger |
| Cache | `fa1252fc8bfbf62b6f69bb8ca431cf603d2b512e4d0299b2ca0de0d7c2cec0bc` | matched result and ledger |
| Decoded float32 payload | `44c274680cd324d00aa16d240e21d3260005766d507a430e93c423e9c16fcd55` | matched cache, result, and ledger |
| Cache record | `ecea4c6981eb22a59d59b4b9434cad57732309e28504574e7ed483a01512fca1` | matched result and ledger |

The cache record hash used compact UTF-8 JSON.
It contained `queries`, `pairIndex`, and `scoresSha256`, in that order.

## Cache integrity

The cache has schema version `1` and experiment `cross-encoder-fit-v1`.
The complete model object matched the frozen `RERANK_MODEL` object.
The clause artifact and clause-set hashes matched the frozen pins.
The batch size was `16`.

The cache has 563 queries and 563 pair-index rows.
It has 383,273 float32 scores.
Every score was finite and within zero through one.
Every query hash matched the rebuilt first-seen question order.
Every pair-index row matched the rebuilt candidate union and clause artifact order.

The environment matched the result and the ledger.
It recorded Node.js `v24.13.0`, `onnxruntime-node` `1.24.3`, and `darwin`.
The recorded probe hash matched the frozen preflight value.

## Cache-only reading recomputation

The temporary verifier ran from `/tmp` with `RAVEN_RERANK_MODEL_DIR` unset.
It imported no scorer, preflight, fetch, or Transformers module.
It rebuilt all readings from the stored float32 cache only.

The verifier compared each complete serialized reading by JSON value.
It compared contract rows, rankings, captures, misses, gate failures, and acceptance fields.
All five readings matched exactly.

| Reading | Margin | Routing gate | Acceptance | Changed rankings |
| --- | ---: | --- | --- | ---: |
| `identity` | `Infinity` | `PASS` | `FAIL` | 0 |
| `pure-fit` | 0 | `FAIL` | `FAIL` | 495 |
| `grid-0.05` | 0.05 | `FAIL` | `FAIL` | 338 |
| `grid-0.10` | 0.10 | `FAIL` | `FAIL` | 276 |
| `grid-0.20` | 0.20 | `FAIL` | `FAIL` | 215 |

The recomputed outcome was `FAIL`.
The recomputed selected margin was `null`.
Both values matched the result file.

## One-referee accounting

The preserved directory contains exactly two JSON files.
They are the one cache file and the one result file.
The result references that cache by the expected relative path and SHA-256 value.
The result contains exactly five readings from that cache.
The ledger records one completed referee and no second referee.

The one-referee rule passed.
