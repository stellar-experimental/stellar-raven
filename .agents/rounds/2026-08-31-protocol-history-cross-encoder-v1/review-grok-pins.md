# Bounded phase-two pin review — cross-encoder snapshot hashes

Date: 2026-08-31
Reviewer: Grok 4.6 high
Author of hash edit: Codex GPT-5.6 Sol high (`preflight-rerank-model.mjs` `PHASE_TWO_SHA256`)
Orchestrator: the root Codex agent
Brief: `.agents/rounds/2026-08-31-protocol-history-cross-encoder-v1/brief-fable.md` section 3.3
Fetch record: `.agents/rounds/2026-08-31-protocol-history-cross-encoder-v1.md`
Snapshot: `/Users/kalepail/.cache/stellar-raven/bge-reranker-base-q8-280bcc2/Xenova/bge-reranker-base`
Status: complete. Independently hashed the five snapshot files. Did not load the model. Did
not run preflight. Did not run the referee. This reviewer wrote only this file.

## Verdict

**PASS**

The three new small-file byte SHA-256 values in `PHASE_TWO_SHA256` match the snapshot and the
fetch ledger. The two large-file hashes still equal the frozen LFS pins. File sizes match
brief section 3.2. The snapshot holds exactly those five files on the parent layout. No
unrelated measurement contract changed.

## Evidence this review checked

Hashes were computed with Python `hashlib` over the snapshot bytes. The preflight script did
not run. `loadReranker()` did not run.

| Check | Result |
| --- | --- |
| Snapshot parent | `/Users/kalepail/.cache/stellar-raven/bge-reranker-base-q8-280bcc2` |
| Model directory | `Xenova/bge-reranker-base` only; no extra sibling |
| Files present | exactly the five pinned paths |
| Extra files | none |
| `HEAD` | `957b143893842d875050f42581faf514a945c41f` |
| Grid / clause pins in `rerank-config.mjs` | unchanged (`0.05`/`0.10`/`0.20`; artifact `e5f86644…`; set `cc5df2e4…`) |
| Phase-one identities in `MODEL_FILES` | unchanged |
| Forbidden measurement files | no new diff |

Independent snapshot measurements:

| Path | Size (bytes) | Byte SHA-256 | Phase-one identity |
| --- | ---: | --- | --- |
| `config.json` | 782 | `b6575b9d5be20d6747417c8e20c5a0db1636356e0b6d422d7244c628423c4d4c` | git blob SHA-1 `ef36f7221740ddc57b6cfae14977840d1fc0fc95` |
| `tokenizer_config.json` | 443 | `a1d6bc8734a6f635dc158508bef000f8e2e5a759c7d92f984b2c86e5ff53425b` | git blob SHA-1 `059214673d9d6d2ee319411e2ffec8c024b816d5` |
| `special_tokens_map.json` | 279 | `d5469a60db23249c7f8945013d78df30b44b6bf686c6bb4740f4223f77b1b535` | git blob SHA-1 `68171d1ff68b731a33d119708476692c094a466b` |
| `tokenizer.json` | 17,098,079 | `48564c5c7d3fa64d85d95e65414a542385f88b0f128fd8d4163fd7a57f2be05c` | LFS SHA-256, same value |
| `onnx/model_quantized.onnx` | 279,301,077 | `dd98f3e67837d23210a6b7550c08cced4f61845b940ac45be3565840a10f3244` | LFS SHA-256, same value |

## Pin comparison

| File | Snapshot SHA-256 | Ledger fetch record | `PHASE_TWO_SHA256` | Brief LFS pin |
| --- | --- | --- | --- | --- |
| `config.json` | `b6575b9d…` | match | match | n/a (phase-two small file) |
| `tokenizer_config.json` | `a1d6bc87…` | match | match | n/a |
| `special_tokens_map.json` | `d5469a60…` | match | match | n/a |
| `tokenizer.json` | `48564c5c…` | match | match | match |
| `onnx/model_quantized.onnx` | `dd98f3e6…` | match | match | match |

Sizes match brief section 3.2 on all five files. The three small files also still match the
brief git blob SHA-1 pins.

`assertPhaseTwoPinsComplete` now sees five 64-hex strings. The hash edit is the three small
SHA-256 values plus gitleaks allow comments. The two large pins were not rewritten to a new
value.

## What did not change

- Model id and revision
- Five-file list and phase-one identities in `MODEL_FILES`
- Fit formula, swap predicate, and grid
- Clause artifact and clause-set hashes
- Candidate projection, pair order, and acceptance table
- `src/` and the frozen eval contracts

## What this PASS allows

- Run `npm run eval:vectorize:rerank:preflight` with
  `RAVEN_RERANK_MODEL_DIR=/Users/kalepail/.cache/stellar-raven/bge-reranker-base-q8-280bcc2`.
- Record `probeScoreSha256` in the ledger.
- Run the one referee after that preflight passes.

## What this PASS does not allow

- A second fetch.
- A change to any hash after this review.
- A second referee for a score reason.
- Any `src/` change or production wiring.
