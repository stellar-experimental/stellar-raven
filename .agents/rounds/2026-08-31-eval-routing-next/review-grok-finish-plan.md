# Pre-implementation review — clause-fit finish plan

Date: 2026-08-31
Reviewer: Grok 4.6 high
Author: Claude Fable 5 high (`finish-plan-fable.md`)
Orchestrator: Claude Fable 5 high
Reviewed file: `.agents/rounds/2026-08-31-eval-routing-next/finish-plan-fable.md`
Status: complete. No model fetch ran. No model load ran. No preflight ran. No referee ran. This reviewer wrote only this file.

This review does not authorize the finish attempt. It does not authorize a fetch.

## Verdict

**BLOCK**

The plan may authorize a durable snapshot copy. It may authorize a local-only loader edit on `eval/vectorize/embedder.mjs` for a new attempt.

It may not authorize section 5 as written. The repair fetch uses the broken loader. It cannot keep the pinned revision on the tokenizer probe. It cannot keep the four-file budget.

Do not implement until section 5 is removed or rewritten. The primary path (copy, then local-only load, then one referee) is otherwise sound.

## Authorization answer

| Action | Authorized by this plan after repair? | Why |
| --- | --- | --- |
| Snapshot copy of fetch-1 files | yes | The files are already on disk. The copy uses no network. The snapshot stays outside every checkout. |
| Loader edit when `RAVEN_VECTORIZE_MODEL_DIR` is set | yes | The clause-fit review (H1) allows a local-only loader on a new attempt. It is not a score change. Unset env keeps the current `pipeline()` call. |
| New `preflight-clause-model.mjs` and `eval:vectorize:clauses:preflight` | yes | The hash check is the real offline gate. It must run before `embedQueries`. |
| Section 5 `embedQueries` repair fetch | no | `get_tokenizer_files` still probes `main`. `get_model_files` still loads `config.json` at `main`. The call can miss the revision cache, fetch the wrong revision, or fetch more than four files. |

The old attempt stays `BLOCKED`. Its two-fetch budget stays spent. A new attempt is the right shape.

Do not copy, edit, or fetch until section 5 is removed or rewritten as a stop.

## Evidence this review checked

All checks were free and local. The embedder did not run. Vitest did not run. `loadClauseArtifact` did not run.

| Check | Result |
| --- | --- |
| `HEAD` | `1bfb9838491fa571166a2a631789a3b0e814980c` |
| Artifact bytes | 3,917,367 |
| Artifact SHA-256 | `e5f86644af89158c3ac4d61ee7f651e2a062c9d292f194cb94872c7eee4e71f4` |
| Artifact `clauseSetSha256` | `cc5df2e4d89522c580626cfc21727b927494f5f528f42acfa035187a211d89e5` |
| Artifact `vectorsSha256` | `1dd9eb2ebcaede223fc39e4f07b943375b5025a7922a1578545a09229c09856d` |
| Clause count in JSON | 683 |
| Worktree cache | present; 624,964,219 bytes (596.0 MiB) |
| Node | `v24.13.0` |
| `onnxruntime-node` | `1.24.3` |
| Platform | `darwin` |
| `@huggingface/transformers` | `4.2.0` |
| `eval/vectorize/results/` | absent |
| Cached files | five files: four under `c25a394…` plus a `main`-key `config.json` |

Pinned file hashes all match section 2:

| File | Bytes | SHA-256 |
| --- | ---: | --- |
| `…/c25a394…/config.json` | 1,576 | `66a10929782f3c9a3cd5dec90e2a95c60e05736134a63cd54479eeae80bed175` |
| `…/c25a394…/tokenizer_config.json` | 9,731 | `977648852447cb6587327ff3205b0a84cf2fc9f05621d6c8e88a497caafab2e1` |
| `…/c25a394…/tokenizer.json` | 11,423,705 | `def76fb086971c7867b829c23a26261e38d9d74e02139253b38aeb9df8b4b50a` |
| `…/c25a394…/onnx/model_quantized.onnx` | 613,527,631 | `87cd124e0ef1fd1f223ebc283efccbaeac386d0b08344701c46975d0657b591f` |
| `…/config.json` (`main` key) | 1,576 | same as the revision `config.json` |

No tokenizer file exists under the `main` cache key.

## Cache facts

The cache facts in section 2 are true. Copy the snapshot before any `npm ci`. `npm ci` deletes `node_modules` and this cache.

The four revision files are the full set needed for `dtype: "q8"` feature-extraction.

- `q8` maps to suffix `_quantized`, so the session file is `onnx/model_quantized.onnx`.
- The cached `config.json` sets `use_external_data_format` only for `model.onnx` and `model_fp16.onnx`.
- `resolveExternalDataFormat` therefore returns 0 for `model_quantized.onnx`.
- Encoder-only / default session config does not require `generation_config.json`.
- `get_tokenizer_files` returns only `tokenizer.json` and `tokenizer_config.json`.

Do not copy the `main`-key `config.json` into the snapshot as a fifth file. The flattened layout already has one `config.json`.

## Copy layout

`env.localModelPath` resolution does not use a revision directory. `buildResourcePaths` sets `localPath` to `pathJoin(env.localModelPath, modelId, filename)`.

The flattened snapshot path is therefore correct:

`/Users/kalepail/.cache/stellar-raven/qwen3-embedding-0.6b-q8-c25a394/onnx-community/Qwen3-Embedding-0.6B-ONNX/{config.json,tokenizer_config.json,tokenizer.json,onnx/model_quantized.onnx}`

Keep the snapshot outside every repository checkout. Do not commit it.

The copy snippet prints `shasum` but does not fail on a mismatch. The first glob includes the `onnx` directory. `shasum` then errors. `2>/dev/null` hides that error. The preflight hash check is the fail-closed gate.

## Transformers 4.2.0 local-only behavior

Section 2.1 is correct on the root cause.

`pipeline()` calls `get_pipeline_files(task, model, { device, dtype })`. That call does not receive `revision`, `cache_dir`, or `local_files_only`.

`get_tokenizer_files(modelId)` calls `get_file_metadata(modelId, "tokenizer_config.json", {})`. That probe uses revision `main`.

`get_model_files` calls `get_config(modelId, { config })` with no revision. `get_config` then defaults revision to `main`.

`get_processor_files` also probes `preprocessor_config.json` at `main`.

Section 2.1 overstates the fail-loud path. `get_file_metadata` does not throw when `allowRemoteModels` is false. It returns `{ exists: false }`. `get_tokenizer_files` then returns `[]`. The pipeline omits the tokenizer. The later error is again `TypeError: this.tokenizer is not a function`. That matches the spent referee.

`getModelFile` / `loadResourceFile` do throw `file was not found locally at "<path>"` when `allowRemoteModels` is false. That protects the ONNX file and `config.json`. It does not protect the tokenizer probe.

With a correct flattened snapshot and `env.localModelPath` set, the `main` probe still succeeds. `localPath` does not include the revision. `get_file_metadata` then finds `localModelPath/<modelId>/tokenizer_config.json` and returns `exists: true` with no network.

Also set `env.allowLocalModels = true` as the plan says. Node already defaults it to true.

Do not leave `env.cacheDir` on the Transformers default during the referee. `get_file_metadata` and `loadResourceFile` both call `checkCachedResource` before `getFile(localPath)`. A later `main`-key tokenizer in the default cache would win. Today only `config.json` sits on that key.

## Allowed edit set

The allowed set matches the clause-fit review (H1):

- `eval/vectorize/embedder.mjs` — env-gated local-only path
- new `eval/vectorize/preflight-clause-model.mjs`
- `package.json` — `eval:vectorize:clauses:preflight`

The forbidden set is correct. Do not edit clause files, the artifact, `run-clause-fit.mjs`, tests, frozen contracts, or `src/`.

When the env var is unset, keep the current `pipeline({ revision, dtype })` call. That preserves frontier and build behavior. The source file will change. The default runtime path stays the same.

Put the `env` mutation inside `extractor()`, before `pipeline()`. Do not set it at module load. Tests import this module.

`test/eval-vectorize-clause-fit.test.mjs` imports `shouldFail` from `run-clause-fit.mjs`, which imports `embedder.mjs`. `test/eval-discovery-vectorize.test.mjs` imports `run-frontier.mjs`, which imports `retrieval.mjs`, which imports `embedder.mjs`. Both files import the embedder module. They still do not call `extractor()`. Keep `RAVEN_VECTORIZE_MODEL_DIR` unset in test runs.

The plan's "31 pass in 2 files" count is right (21 + 10). The claim that those tests do not import the embedder is wrong.

## Conditional fetch

Section 5 is the blocking defect.

The repair command unsets `RAVEN_VECTORIZE_MODEL_DIR` and calls `embedQueries`. That is the same loader that probed `main` and failed.

On a restricted network it fails the same way. The tokenizer probe never reaches `from_pretrained`. The revision cache is not filled. The later copy then fails.

On an open network the probe still hits `huggingface.co/.../resolve/main/tokenizer_config.json`. Actual `from_pretrained` uses `pretrainedOptions.revision`. That can fill the revision cache. It can also fetch extra files. `get_processor_files` and `get_config(..., revision default main)` are not capped at four files.

Warming `main` does not fill the revision cache key the copy uses. The copy source is still `$SRC/.../c25a394…/`. A `main`-key tokenizer does not land there.

The "one fetch, pinned revision, at most four files, at most 650 MB" budget is not enforceable with this command.

Repair: delete section 5, or replace it with a stop. If the snapshot copy fails and the worktree cache is gone, record `BLOCKED-ASSETS` and end. Do not call `embedQueries` to repair assets.

## Preflight

The three-part preflight is the right gate: hash the four files, load the clause artifact with catalog match, then embed one probe string.

Run it only after the snapshot exists and after the loader edit. Record the probe-vector hash as the environment fingerprint.

The hash step must stay first. It is the only fail-closed check. `allowRemoteModels = false` does not make step 3 "no network by construction" if the tokenizer file is missing. In that case the probe returns `{ exists: false }` and the process dies later with `this.tokenizer is not a function`.

The preflight script must refuse to call `embedQueries` when `RAVEN_VECTORIZE_MODEL_DIR` is unset. An unset run would repeat the spent referee fetch.

Do not treat unbounded preflight runs as a second referee. They must stay local-only.

## Budgets, identity, acceptance, retention

Budgets except section 5 are correct: zero paid calls, zero artifact rebuilds, one referee.

Identity is correct for this measurement: Node, `onnxruntime-node`, platform, probe hash, clause-artifact SHA-256, query-cache hashes. No `claude` pin applies.

Acceptance matches the reviewed brief section 11: 8/8 with 0/4; 11/11 with 0/9; legacy within ±3 of 208/279/311; skills top-1 at least 16; holdout at least 10/22/25 with at most 11 forbidden captures; extended at least 90/109/117 with accept-either top-5 122/122; `q-protocol-version-history-list` strict top-1 preserved; every changed ranking and every new `scout.searchResearch` capture listed.

Outcome labels match the reviewed brief. `BLOCKED` does not consume a scored outcome. `FAIL` still requires completed readings.

Retention matches the clause-fit review and `eval/EVALS.md` rule 7: keep the harness and the clause artifact; keep the snapshot until block 3 closes; keep local results for 30 days after the investigation ends; do not rewrite `implementation-sol.md`.

If `HEAD` moves for the loader commit, record the new revision and confirm the artifact `inputs` hashes still match. `loadClauseArtifact({ requireCatalogMatch: true })` already refuses catalog drift.

## Actionable findings

### H1 — Severity: bug — section 5 cannot repair assets

The `embedQueries` repair unsets `RAVEN_VECTORIZE_MODEL_DIR`. `pipeline()` still probes `tokenizer_config.json` at `main`. `get_model_files` still loads `config.json` at `main`.

On the restricted network that blocked the referee, the probe fails and the revision cache is not filled. On an open network the probe can fetch `main` and can exceed four files.

The copy source is the revision cache key. A `main` warm-up does not fill that key.

Repair: remove section 5. If the snapshot copy fails, stop as `BLOCKED-ASSETS`. Do not call `embedQueries` with the env var unset.

### H2 — Severity: bug — tokenizer probe still fails silent if preflight is skipped

`allowRemoteModels = false` does not throw in `get_file_metadata`. A referee run without the env var, or with a missing tokenizer file, can still die as `this.tokenizer is not a function`.

Repair: keep the preflight hash check mandatory in section 6 preconditions. The preflight must refuse to start `embedQueries` if the env var is unset. In the loader, fail before `pipeline()` if the four snapshot files are absent.

### M1 — Severity: suggestion — default cache can shadow the snapshot

`checkCachedResource` runs before `getFile(localPath)`. A later `main`-key tokenizer file in the default Transformers cache would win over the snapshot.

Repair: while the env var is set, point `env.cacheDir` away from the package `.cache`, or set `env.useFSCache = false` for that process.

### L1 — Severity: nit — copy command is not fail-closed

The `cp` plus `shasum` line uses `2>/dev/null`. The first glob includes the `onnx` directory. A hash mismatch does not `exit 1`.

Repair: compare each of the four pins in the copy step, or rely only on preflight and say so.

### L2 — Severity: nit — tests do import the embedder module

The two vitest files import the embedder through `run-clause-fit.mjs` and `run-frontier.mjs`. They still do not call `extractor()`. The "31 pass" count is right.

Repair: say the tests do not call `extractor()`. Keep the env var unset in test runs.

## What a repaired plan may do

- Copy the four pinned files to the flattened snapshot now.
- Edit `embedder.mjs` behind `RAVEN_VECTORIZE_MODEL_DIR`.
- Add the preflight script and the package script.
- Run one referee with the env var set, reusing the existing clause artifact.

## What a repaired plan may not do

- Call `embedQueries` with the env var unset as an asset repair.
- Rebuild the clause artifact.
- Edit clause logic, tests, frozen contracts, or `src/`.
- Start the referee before a PASS on the loader-and-preflight diff.
