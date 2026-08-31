# Protocol-history routing — cross-encoder attempt two — 2026-08-31

## Scope

This round authors and reviews the attempt-two measurement brief for block 3.
The subject is the held protocol-history routing defect in `.agents/TODO.md`.
Attempt one, `clause-fit-hysteresis-v1`, ended as a reviewed measured `FAIL` on 2026-08-31.
Its record is `.agents/rounds/2026-08-31-eval-routing-next.md`.

The brief defines one measurement-only experiment: `cross-encoder-fit-v1`.
The experiment uses a pinned local cross-encoder and the frozen clause set from attempt one.
Production search does not change. No paid call is authorized. No model download is authorized.
Implementation, the bounded model fetch, and the single referee all wait for a passing
independent review of the brief.

## Lanes

| lane | agent (model, effort) | write set | status |
| --- | --- | --- | --- |
| Measurement brief | Claude, Fable 5, high | `brief-fable.md` | revised after review |
| Independent brief review | Grok, Grok 4.6, high | `review-grok-brief.md` | complete; verdict `BLOCK` |
| Brief reconciliation | Claude, Fable 5, high | `brief-reconciliation-fable.md` | complete |
| Bounded delta review | Grok, Grok 4.6, high | `review-grok-brief-delta.md` | complete; verdict `PASS` |
| Implementation | Codex, GPT-5.6 Sol, high | per brief section 12 | complete; review verdict `PASS` |
| Pre-fetch implementation review | Grok, Grok 4.6, high | `review-grok-implementation.md` | complete; verdict `PASS` |
| Bounded pin review | Grok, Grok 4.6, high | `review-grok-pins.md` | complete; verdict `PASS` |
| Result verification | Codex, GPT-5.6 Terra, high | `result-verification-terra.md` | complete; verdict `PASS` |
| Final adversarial review | Grok, Grok 4.6, high | `review-grok-final.md` | `BLOCK` reconciled; delta `PASS` |

Role record: Claude Fable 5 high authored the brief and the reconciliation. The root Codex
agent orchestrates this round. Grok 4.6 high reviews and differs from both.

## Route cards

### Measurement brief

- Worker CLI: Claude
- Model: Fable 5
- Effort: high
- Reason: the lane needs product and measurement synthesis over prior reviewed evidence.
- Reviewer: Grok 4.6 high. The reviewer differs from the author (Fable) and the orchestrator
  (the root Codex agent).
- Report contract: one complete brief with pins, schema, gates, stop states, and closeout rules.

### Independent brief review

- Worker CLI: Grok
- Model: Grok 4.6
- Effort: high
- Reason: vendor-diverse assumption attack, matching the attempt-one review chain.
- Report contract: verdict `PASS` or `BLOCK` with numbered findings in `review-grok-brief.md`.
- Escalate to xhigh only after a high pass misses a real finding.

## Ledger

### 2026-08-31 — round opened

The worktree is `next/playground-maintenance` at
`957b143893842d875050f42581faf514a945c41f`, equal to `main` HEAD. The tree was clean.
This entry authorizes brief authoring only.
It authorizes no model download, no model run, no paid call, and no code change.

### 2026-08-31 — model pin captured from public metadata

The author read public Hugging Face API metadata only. No weights were downloaded.
No model ran. The observed values are recorded in brief section 3.

- `Xenova/bge-reranker-base` `main` resolved to commit
  `280bcc27a84e0b898c251e06fddb25171bd9b101` on 2026-08-31.
- `BAAI/bge-reranker-base` `main` resolved to commit
  `2cfc18c9415c912f9d8155881c133215df768a70` on 2026-08-31 (base-model provenance only).
- The two large files carry upstream LFS SHA-256 values; the three small files carry git blob
  SHA-1 values. Brief section 3 lists all five.

### 2026-08-31 — brief authored

Fable wrote `brief-fable.md`.
The brief is ready for the independent Grok review.
No fetch, implementation, preflight, or referee work may start before that review passes.
The frozen contracts, the clause artifact, `eval/gates.json`, and all of `src/` are unchanged.

### 2026-08-31 — brief review returned BLOCK

Grok wrote `review-grok-brief.md` with verdict `BLOCK` and six blocking findings.
The `text-classification` pipeline cannot encode a text pair, and its one-label softmax
returns `1` for every finite logit. The snapshot layout did not match the 4.2.0 local
resolver. The remainder sort, the scoring projection, and the pair-batch composition were
unpinned. The test list did not lock the measurement-critical contracts.
Four residual findings covered the phase-two review sequence, the reconstructed clause texts,
the missing overlay file in the forbidden set, and the ignored `special_tokens_map.json`.
The review confirmed the model pin, the five file identities, the frozen clause set, the
acceptance table, the one-referee rule, and the no-`src/` boundary.

### 2026-08-31 — brief repaired and reconciled

Fable repaired `brief-fable.md` and wrote `brief-reconciliation-fable.md` with the H1–H6 and
M1–M4 mapping. The scorer now uses `AutoTokenizer` plus `AutoModelForSequenceClassification`
directly, with pinned `text_pair` encoding, one sigmoid over the raw logit, `max_length` 512,
the parent snapshot layout, and lazy initialization. The union restates the attempt-one
projection and sort. The pair order and contiguous batch composition are pinned. The overlay
file joined the forbidden set. The review sequence now places the pin review after the fetch.
The role record was corrected: Fable authored; the root Codex agent orchestrates.

No pin, clause, gate, grid value, or boundary changed in the repair.
Grok's bounded delta review of the repaired sections is the next gate.
No fetch, implementation, preflight, or referee work is authorized before it passes.

### 2026-08-31 — bounded delta review returned PASS

Grok wrote `review-grok-brief-delta.md` with verdict `PASS`.
The repaired pair encoding, score transform, snapshot layout, candidate order, pair order,
and offline tests matched the frozen measurement brief.
This gate authorized the section 12 implementation only.

### 2026-08-31 — implementation completed

Codex GPT-5.6 Sol high implemented the seven section 12 files and three package scripts.
The focused offline suite passed 25 of 25 tests.
Typecheck, the full test suite, build, secret scan, eval self-test, eval compile, and
`git diff --check` passed.
No model was fetched or loaded during implementation.

### 2026-08-31 — pre-fetch implementation review returned PASS

Grok wrote `review-grok-implementation.md` with verdict `PASS`.
The review confirmed the direct `text_pair` call, raw-logit sigmoid, lazy local-only loader,
parent snapshot layout, frozen union and pair order, cache integrity, and untouched forbidden files.
This gate authorized the bounded model fetch.

### 2026-08-31 — first and only fetch succeeded

The first fetch invocation succeeded. No second fetch is authorized or needed.
The snapshot parent is
`/Users/kalepail/.cache/stellar-raven/bge-reranker-base-q8-280bcc2`.
The model files are under `Xenova/bge-reranker-base/` inside that parent.

The fetch printed these five byte SHA-256 values:

- `config.json`: `b6575b9d5be20d6747417c8e20c5a0db1636356e0b6d422d7244c628423c4d4c`
- `tokenizer_config.json`: `a1d6bc8734a6f635dc158508bef000f8e2e5a759c7d92f984b2c86e5ff53425b`
- `special_tokens_map.json`: `d5469a60db23249c7f8945013d78df30b44b6bf686c6bb4740f4223f77b1b535`
- `tokenizer.json`: `48564c5c7d3fa64d85d95e65414a542385f88b0f128fd8d4163fd7a57f2be05c`
- `onnx/model_quantized.onnx`: `dd98f3e67837d23210a6b7550c08cced4f61845b940ac45be3565840a10f3244`

The three small-file hashes now appear in `preflight-rerank-model.mjs`.
No preflight ran. No model loaded. No referee ran.
The bounded pin review is the next gate.

### 2026-08-31 — bounded pin review returned PASS

Grok wrote `review-grok-pins.md` with verdict `PASS`.
The review independently verified every downloaded file size and byte SHA-256.
It confirmed that the snapshot contains exactly the five pinned files.
This gate authorized the local preflight.

### 2026-08-31 — local preflight returned PASS

The preflight loaded the pinned local model once and returned `PASS`.
It recorded this environment:

- `probeScoreSha256`: `e2bc86efb15f5232993b0bf5f63b5ce55cc7241abaec6a7e54364a13b664331b`
- Node.js: `v24.13.0`
- `onnxruntime-node`: `1.24.3`
- platform: `darwin`

The referee has not run.
The implementation commit and the free contract checks are the remaining referee preconditions.

### 2026-08-31 — implementation identity frozen

The reviewed implementation commit is
`2763fb0afd4e6811f449cb6b1f56f2baf85e3734`.
The referee must receive this full hash through `RAVEN_RERANK_IMPLEMENTATION_COMMIT`.
A second preflight returned `PASS` after this commit.
It reproduced `probeScoreSha256` `e2bc86efb15f5232993b0bf5f63b5ce55cc7241abaec6a7e54364a13b664331b`.

### 2026-08-31 — single referee completed with FAIL

The single authorized referee invocation scored all 383,273 frozen pairs.
It returned `FAIL` and exited with status `1`, as required for a failed grid.
No second referee ran.

- stamp: `2026-08-31T23-36-38-660Z-cross-encoder-fit-v1`
- result SHA-256: `529351b1562b14f68d18ef94b584ca37ae61290f68cfff7a5a1489e8b601ae0d`
- score-cache SHA-256: `fa1252fc8bfbf62b6f69bb8ca431cf603d2b512e4d0299b2ca0de0d7c2cec0bc`
- score-payload SHA-256: `44c274680cd324d00aa16d240e21d3260005766d507a430e93c423e9c16fcd55`
- cache-record SHA-256: `ecea4c6981eb22a59d59b4b9434cad57732309e28504574e7ed483a01512fca1`
- selected margin: `null`
- preserved local artifacts: `/Users/kalepail/.cache/stellar-raven/eval-results/cross-encoder-fit-v1-2026-08-31/`

| reading | original top1/top3/top5; controls | blind top1/top3/top5; controls | routing gate | changed rankings | acceptance |
| --- | --- | --- | --- | ---: | --- |
| identity | 3/4/4; 1/4 | 3/3/3; 6/9 | `PASS` | 0 | `FAIL` |
| pure fit | 3/4/5; 2/4 | 2/2/3; 4/9 | `FAIL` | 495 | `FAIL` |
| `m = 0.05` | 4/4/4; 1/4 | 3/3/3; 6/9 | `FAIL` | 338 | `FAIL` |
| `m = 0.10` | 4/4/4; 1/4 | 3/3/3; 6/9 | `FAIL` | 276 | `FAIL` |
| `m = 0.20` | 3/4/4; 1/4 | 3/3/3; 6/9 | `FAIL` | 215 | `FAIL` |

Identity and every registered grid had these original misses:
`ph-protocol-24-archival-root-cause`, `ph-protocol-corrective-upgrade-history`,
`ph-protocol-upgrade-chronology`, and `ph-protocol-feature-origin`.
They captured `ph-control-current-protocol`.

Identity and every registered grid had these blind misses:
`phb-whisk-forced-follow-up`, `phb-archival-defect-network-upgrade`,
`phb-core-upgrades-dates-features`, `phb-network-upgrades-reasons`,
`phb-second-cut-after-whisk`, `phb-cap-archival-fee-repair`,
`phb-auditor-auth-recursion-follow-up`, and `phb-clawback-origin-emergency-changes`.
They captured `phb-control-protocol-xdr-bug`, `phb-control-incident-runbook`,
`phb-control-contract-exploit-review`, `phb-control-sdk-version-history`,
`phb-control-cap-history-sep-support`, and `phb-control-kyc-breach-report`.

Pure fit missed `ph-protocol-24-archival-root-cause`,
`ph-protocol-corrective-upgrade-history`, and `ph-protocol-upgrade-chronology`.
It captured `ph-control-current-protocol` and `ph-control-validator-vote`.
Its blind misses were `phb-whisk-forced-follow-up`,
`phb-archival-defect-network-upgrade`, `phb-auth-recursion-auditors`,
`phb-core-upgrades-dates-features`, `phb-network-upgrades-reasons`,
`phb-second-cut-after-whisk`, `phb-cap-archival-fee-repair`, and
`phb-clawback-origin-emergency-changes`.
It captured `phb-control-incident-runbook`, `phb-control-sdk-version-history`,
`phb-control-kyc-breach-report`, and `phb-control-failed-deploy-post-mortem`.

No upstream improvement follows from this result.
The result measures this repository's ranking mechanism.
Codex GPT-5.6 Terra high must now verify the stored cache without loading the model.

### 2026-08-31 — independent result verification returned PASS

Terra wrote `result-verification-terra.md` with verdict `PASS`.
The verifier ran from a temporary directory with `RAVEN_RERANK_MODEL_DIR` unset.
It imported no scorer, preflight, fetch, or Transformers module.

It independently reproduced all four hashes: the result, the cache, the decoded float32
payload, and the compact cache record. All matched the values in this ledger.
The cache held 563 queries, 563 pair-index rows, and 383,273 finite scores in zero through one.
Every query hash matched the rebuilt first-seen order, and every pair-index row matched the
rebuilt candidate union in clause-artifact order.
The verifier rebuilt all five readings from the stored cache only.
Every contract row, ranking, capture, miss, gate failure, and acceptance field matched exactly.
The recomputed outcome was `FAIL` with selected margin `null`, matching the result file.
The one-referee accounting passed: one cache file, one result file, no second referee.

### 2026-08-31 — FAIL closeout applied

The terminal outcome is a verified `FAIL`. Attempt two of the three-attempt box is spent.
Attempt three remains unused. It requires its own reviewed brief with a distinct mechanism.
The closeout applied the record to `eval/vectorize/README.md` (new dated section),
`eval/README.md` (attempt-two pointer), `.agents/TODO.md` (dated attempt accounting on the
open routing item), and `.agents/NEXT.md` (block state).
Result and cache JSON stay local and uncommitted, preserved under
`/Users/kalepail/.cache/stellar-raven/eval-results/cross-encoder-fit-v1-2026-08-31/`.

### 2026-08-31 — final adversarial review reconciled

Grok wrote `review-grok-final.md` with an initial `BLOCK` on two stale queue instructions.
`.agents/TODO.md` still ordered an attempt-two brief after recording that attempt as spent.
`.agents/NEXT.md` also told the next agent to start that completed brief.
Both instructions were repaired without changing the harness, hashes, tables, or frozen contracts.
Grok appended a bounded delta verdict of `PASS`.

## Outcome

Complete. The measured outcome is a verified `FAIL` with selected margin `null`.

The identity reading reproduced every lexical baseline exactly with zero changed rankings.
No registered grid passed the acceptance table. At `m = 0.05`, `0.10`, and `0.20`, both frozen
contracts stayed at the lexical baseline — original 4/8 with 1/4 captures, blind 3/11 with 6/9
captures — while every grid failed the routing gate. Among the grids, `m = 0.20` had the
fewest routing-gate failures (four) and the fewest changed rankings (215).

No production routing change ships from this experiment. No `improvements/` finding applies:
the result measures this repository's ranking, and the data remains reachable upstream.
The own-repo routing defect stays open in `.agents/TODO.md` and is held for a separately
reviewed attempt-three brief with a distinct mechanism.
Every review in this round completed with a reconciled or passing verdict.
