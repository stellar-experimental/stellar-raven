# Finish plan — completing the blocked clause-fit measurement

Date: 2026-08-31 (revised after the Grok finish-plan review)
Lane: Product and measurement plan (Claude, Fable 5, high)
Round ledger: `.agents/rounds/2026-08-31-eval-routing-next.md`
Inputs: `implementation-sol.md`, `verification-terra.md`, `review-grok-clause-fit.md`,
`implementation-brief-fable.md` (reviewed), and the current `eval/vectorize/` harness.
Review reconciled: `.agents/rounds/2026-08-31-eval-routing-next/review-grok-finish-plan.md`
Reconciliation record: `.agents/rounds/2026-08-31-eval-routing-next/finish-plan-reconciliation-fable.md`
Status: plan only. No model fetch ran. No model load ran. No referee ran. No paid call ran. No
implementation file, shared ledger, or production file changed.

## 1. Decision

Finish the blocked `clause-fit-hysteresis-v1` measurement with one new, separately authorized
attempt. The old attempt is closed and stays closed: its two-fetch budget and its single referee
invocation are spent, and its outcome label is `BLOCKED`.

The new attempt has three parts, in order:

1. A durable local model snapshot, created now by a fail-closed copy of the already-fetched
   files. No network.
2. A local-only loader repair and a local-only preflight. No network.
3. One referee invocation that reuses the existing clause artifact.

There is no asset-repair fetch. This attempt has zero fetches of every kind. If the snapshot
cannot be completed from the files already on disk, the attempt stops as `BLOCKED-ASSETS`.

Everything is free. The clause artifact is not rebuilt. Production does not change.

## 2. Verified state

| Fact | Value |
| --- | --- |
| `HEAD` | `1bfb9838491fa571166a2a631789a3b0e814980c` |
| Old attempt outcome | `BLOCKED`; no reading, no query cache, no result stamp |
| Clause artifact | `eval/vectorize/artifacts/qwen3-embedding-0.6b-q8-c25a394-clauses.json`, 3,917,367 bytes |
| Artifact SHA-256 | `e5f86644af89158c3ac4d61ee7f651e2a062c9d292f194cb94872c7eee4e71f4` |
| Clause-set SHA-256 | `cc5df2e4d89522c580626cfc21727b927494f5f528f42acfa035187a211d89e5` |
| Vector payload SHA-256 | `1dd9eb2ebcaede223fc39e4f07b943375b5025a7922a1578545a09229c09856d` |
| Offline tests | 31 pass in 2 files (21 + 10) |
| `eval/vectorize/results/` | absent |
| Runtime identity | Node `v24.13.0`; `onnxruntime-node` `1.24.3`; `process.platform` `darwin` |
| Model cache from fetch 1 | present; 624,964,219 bytes (596.0 MiB) in this worktree's `node_modules/@huggingface/transformers/.cache/` |

Both vitest files import the embedder module transitively:
`test/eval-vectorize-clause-fit.test.mjs` through `run-clause-fit.mjs`, and
`test/eval-discovery-vectorize.test.mjs` through `run-frontier.mjs` and `retrieval.mjs`. Neither
test calls `extractor()`, so no test loads the model. Test runs keep
`RAVEN_VECTORIZE_MODEL_DIR` unset.

The build's fetch left the full pinned file set on disk, keyed by the pinned revision. The
review confirmed these four files are the complete set for `dtype: "q8"` feature-extraction:
`q8` maps to `onnx/model_quantized.onnx`, the config demands external data only for `model.onnx`
and `model_fp16.onnx`, and no `generation_config.json` is needed.

| Cached file | Bytes | SHA-256 |
| --- | ---: | --- |
| `.../Qwen3-Embedding-0.6B-ONNX/c25a394…/config.json` | 1,576 | `66a10929782f3c9a3cd5dec90e2a95c60e05736134a63cd54479eeae80bed175` |
| `.../Qwen3-Embedding-0.6B-ONNX/c25a394…/tokenizer_config.json` | 9,731 | `977648852447cb6587327ff3205b0a84cf2fc9f05621d6c8e88a497caafab2e1` |
| `.../Qwen3-Embedding-0.6B-ONNX/c25a394…/tokenizer.json` | 11,423,705 | `def76fb086971c7867b829c23a26261e38d9d74e02139253b38aeb9df8b4b50a` |
| `.../Qwen3-Embedding-0.6B-ONNX/c25a394…/onnx/model_quantized.onnx` | 613,527,631 | `87cd124e0ef1fd1f223ebc283efccbaeac386d0b08344701c46975d0657b591f` |

A fifth cached file, the `main`-key `config.json`, is byte-identical to the revision copy. It
does not enter the snapshot. The flattened layout has exactly one `config.json`.

This cache is volatile: `npm ci` deletes `node_modules` and the cache with it. Section 3 runs
before any `npm ci` in this worktree.

### 2.1 Root cause, confirmed in the runtime source

`@huggingface/transformers@4.2.0` `pipeline()` calls `get_pipeline_files(task, model,
{ device, dtype })`. That call does not receive `revision`, `cache_dir`, or `local_files_only`.
Three discovery paths run at the default revision `main`: `get_tokenizer_files` probes
`tokenizer_config.json`, `get_model_files` loads `config.json` through `get_config`, and
`get_processor_files` probes `preprocessor_config.json`.

The build cached tokenizer files under the revision cache key, so the `main`-keyed probe misses
the cache, tries the local model path (absent), then goes remote. On a restricted network that
fetch fails, the probe returns `exists: false`, the pipeline omits the tokenizer, and the run
dies later with `TypeError: this.tokenizer is not a function`.

The failure modes split, and the split matters:

- `get_file_metadata` never throws when `env.allowRemoteModels` is `false`. It returns
  `{ exists: false }`. A missing tokenizer file therefore still produces the silent
  `this.tokenizer is not a function` death, even in local-only mode.
- `getModelFile` and `loadResourceFile` do throw
  `file was not found locally at "<path>"` in local-only mode. That protects `config.json` and
  the ONNX session file only.

The tokenizer probe is therefore protected only by making the file present and by checking it
before `pipeline()` runs. Section 4 does both: the loader verifies all four snapshot files
before pipeline construction, and the preflight verifies their hashes first.

With a correct flattened snapshot and `env.localModelPath` set, every `main` probe and every
revision-keyed load resolves through `pathJoin(env.localModelPath, modelId, filename)` with no
network. The local path does not include a revision, which is why the flattened layout works and
why provenance comes from the SHA-256 pins above.

## 3. Step 1 — durable model snapshot (no network; run first; fail-closed)

Create the snapshot by copying the existing cache into a flattened, machine-local directory
outside every repository checkout, and verify every file against its pin before declaring the
snapshot complete:

```sh
SNAP=/Users/kalepail/.cache/stellar-raven/qwen3-embedding-0.6b-q8-c25a394
SRC=node_modules/@huggingface/transformers/.cache/onnx-community/Qwen3-Embedding-0.6B-ONNX/c25a394dd583836952667c12f008335071b3f43d
DST="$SNAP/onnx-community/Qwen3-Embedding-0.6B-ONNX"
mkdir -p "$DST/onnx"
cp "$SRC/config.json" "$SRC/tokenizer_config.json" "$SRC/tokenizer.json" "$DST/"
cp "$SRC/onnx/model_quantized.onnx" "$DST/onnx/"
shasum -a 256 -c <<'PINS'
66a10929782f3c9a3cd5dec90e2a95c60e05736134a63cd54479eeae80bed175  /Users/kalepail/.cache/stellar-raven/qwen3-embedding-0.6b-q8-c25a394/onnx-community/Qwen3-Embedding-0.6B-ONNX/config.json
977648852447cb6587327ff3205b0a84cf2fc9f05621d6c8e88a497caafab2e1  /Users/kalepail/.cache/stellar-raven/qwen3-embedding-0.6b-q8-c25a394/onnx-community/Qwen3-Embedding-0.6B-ONNX/tokenizer_config.json
def76fb086971c7867b829c23a26261e38d9d74e02139253b38aeb9df8b4b50a  /Users/kalepail/.cache/stellar-raven/qwen3-embedding-0.6b-q8-c25a394/onnx-community/Qwen3-Embedding-0.6B-ONNX/tokenizer.json
87cd124e0ef1fd1f223ebc283efccbaeac386d0b08344701c46975d0657b591f  /Users/kalepail/.cache/stellar-raven/qwen3-embedding-0.6b-q8-c25a394/onnx-community/Qwen3-Embedding-0.6B-ONNX/onnx/model_quantized.onnx
PINS
```

`shasum -a 256 -c` exits `1` on any mismatch or missing file, so the copy step is fail-closed on
its own. No stderr is suppressed. No directory enters a hash command. The preflight in section 4
repeats the same four checks before every model load.

Rules:

- The snapshot is machine-local evidence. Never commit it. Never place it inside a repository
  checkout. Record the snapshot path and the four hashes in the round ledger.
- Do this copy before any `npm ci` in this worktree.
- **Stop rule.** If a source file is missing, or any hash check fails, or the worktree cache is
  already gone: stop. Record the state as `BLOCKED-ASSETS` in the round ledger and end the
  attempt. There is no asset-repair fetch in this plan. Re-acquiring the model needs a new
  reviewed authorization with its own fetch budget; `embedQueries` is never that mechanism,
  because `pipeline()` probes at revision `main` and cannot honor a four-file, pinned-revision
  budget.

## 4. Step 2 — loader repair and preflight (no network)

### 4.1 Allowed edit set

The Grok clause-fit review (H1) directs a local-only loader for a newly authorized attempt and
states that the loader change does not count as a score change. The allowed edits are exactly:

- `eval/vectorize/embedder.mjs` — the offline mode in 4.2.
- New file `eval/vectorize/preflight-clause-model.mjs` — the preflight in 4.3.
- `package.json` — one script: `eval:vectorize:clauses:preflight`.

Forbidden edits: `clause-config.mjs`, `clause-retrieval.mjs`, `build-clause-artifact.mjs`,
`run-clause-fit.mjs`, the clause artifact, every existing test assertion, every frozen contract,
`eval/gates.json`, and anything under `src/`. The clause set, `fit` formula, swap predicate,
margins, and base-order rule do not change.

### 4.2 Loader contract (`embedder.mjs`)

All changes live inside `extractor()`, before the `pipeline()` call. Nothing runs at module
load, because both vitest files import this module transitively and must stay model-free.

When `RAVEN_VECTORIZE_MODEL_DIR` is set, `extractor()` must, in order:

1. Verify that the directory exists and that all four snapshot files are present:
   `onnx-community/Qwen3-Embedding-0.6B-ONNX/config.json`, `tokenizer_config.json`,
   `tokenizer.json`, and `onnx/model_quantized.onnx`. On any miss, throw one direct
   missing-asset error naming the exact path, before pipeline construction. This closes the
   silent-tokenizer path: the `main` probe cannot return `exists: false` for a file the loader
   has just proven present.
2. Set `env.allowRemoteModels = false`, `env.allowLocalModels = true`, and
   `env.localModelPath = process.env.RAVEN_VECTORIZE_MODEL_DIR`.
3. Isolate the default cache with the reviewed mechanism: set `env.useFSCache = false` for the
   process. `checkCachedResource` runs before the local-path read, so a stale `main`-key file in
   the package's default `.cache` could otherwise shadow the snapshot. With the FS cache off,
   every resolution reads the snapshot and nothing writes a new cache entry.
4. Construct the pipeline exactly as today.

When the variable is unset, the current `pipeline({ revision, dtype })` call runs unchanged, so
the frontier and build paths keep their existing behavior.

### 4.3 Preflight contract (`preflight-clause-model.mjs`)

`eval:vectorize:clauses:preflight` must, in order:

1. Refuse to run when `RAVEN_VECTORIZE_MODEL_DIR` is unset, empty, or not an existing directory.
   Print one direct error and exit `1` before any import of model code. An unset run would
   repeat the spent referee's remote probe; the preflight must make that impossible.
2. Verify the four snapshot files against the four pinned SHA-256 values from section 2. On any
   miss, print the exact path and expected hash, and exit `1`. This hash step always runs first
   among the checks; it is the fail-closed gate the loader's presence check does not replace.
3. Load the clause artifact with `requireCatalogMatch: true`. A refusal is a stop, not a repair.
4. Embed the single fixed probe string `clause-fit preflight probe` through `embedQueries` and
   print the probe vector's SHA-256 plus `process.version`, the `onnxruntime-node` version, and
   `process.platform`.
5. Exit `0` only when all parts pass.

Network claims, stated precisely: the preflight is local-only because steps 1 and 2 prove the
assets before any load, `env.allowRemoteModels` is `false`, and the FS cache is off. The
`allowRemoteModels` flag alone would not make step 4 safe — a missing tokenizer file would still
die silently — which is why steps 1 and 2 are mandatory and ordered first. Any observed network
attempt during a preflight or referee run with the variable set is a loader defect and a stop.

Preflight runs are unbounded, free, and local-only. A preflight run is never a referee run and
produces no reading.

Record the preflight output in the ledger. The probe-vector hash is the environment fingerprint;
a machine that prints a different hash is environment drift, and its readings are not comparable
to this attempt's readings.

### 4.4 Free gates on the edit

```sh
./node_modules/.bin/vitest run test/eval-vectorize-clause-fit.test.mjs test/eval-discovery-vectorize.test.mjs
npm run typecheck
npm test
npm run build
npm run secrets:scan -- --tree
git diff --check
```

All must pass with `RAVEN_VECTORIZE_MODEL_DIR` unset. The tests import the embedder module but
never call `extractor()`, so they stay model-free and network-free.

## 5. Step 3 — one referee invocation

Preconditions, asserted in the ledger before the run:

- The narrow review in section 8 is PASS on the loader-and-preflight diff.
- `HEAD` is `1bfb9838491fa571166a2a631789a3b0e814980c`, or the ledger records the loader
  commit's new revision and confirms `catalog/manifest.json`, `inventory/stellar-light.json`,
  and `scripts/catalog-data/workflow-archetypes.mjs` are byte-identical to the artifact's
  `inputs` pins. `loadClauseArtifact({ requireCatalogMatch: true })` enforces this and refuses
  drift.
- The preflight passed on this machine with the variable set, and its probe-vector hash is
  recorded.
- `npm run eval:selftest` and `npm run eval:compile` pass.

The single invocation:

```sh
RAVEN_VECTORIZE_MODEL_DIR=/Users/kalepail/.cache/stellar-raven/qwen3-embedding-0.6b-q8-c25a394 \
npm run eval:vectorize:clauses:run -- --dump-dir <scratchpad>/clause-fit-finish
```

The referee embeds the 563 unique questions once, writes the query-vector cache and the result
JSON under `eval/vectorize/results/` (gitignored), prints the five readings with exact positive
misses and control captures, and exits `1` unless one grid reading passes the full acceptance
table. Record from its output: the query-cache path and file SHA-256, the query-vector payload
SHA-256, the result stamp, the per-reading tables, the changed-ranking counts, and the outcome.

## 6. Budgets and stop conditions

| Budget | This attempt |
| --- | --- |
| Paid calls | `0`; none exist in this plan |
| Model fetches, of every kind | `0`; no repair fetch exists |
| Artifact builds | `0`; the existing artifact is reused; a rebuild is out of scope |
| Referee invocations | `1` |
| Preflight runs | unbounded; free and local-only; never a reading |

Stops. Each stop ends the attempt, sets the recorded label, and records the exact error in the
ledger:

- The section 3 copy or hash check fails, or the worktree cache is gone: `BLOCKED-ASSETS`.
- A snapshot hash or presence check fails later, in the loader or the preflight:
  `BLOCKED-ASSETS`.
- `loadClauseArtifact` refuses the artifact for input drift: `BLOCKED`. Do not rebuild; a rebuild
  needs a new reviewed authorization because the clause set would change with the moved inputs.
- The identity calibration aborts inside the referee: `BLOCKED`. Per the clause-fit review (M1),
  that is a harness defect, never a routing `FAIL`.
- Any referee error before the result file exists: `BLOCKED`.
- Any network attempt while `RAVEN_VECTORIZE_MODEL_DIR` is set: `BLOCKED`; loader defect.

There is no second referee invocation under this plan, whatever the outcome. Re-acquiring lost
model assets needs a new reviewed authorization with its own explicit fetch budget.

## 7. Identity, acceptance, and outcome handling

- Identity: record the runtime identity with every artifact — `node -v`, the `onnxruntime-node`
  version, the platform, the preflight probe-vector hash, the clause-artifact SHA-256, and the
  query-cache hashes. The measurement contract has no answering or judge model; no `claude`
  binary pin applies.
- Acceptance is unchanged from the reviewed brief section 11: 8/8 with 0/4; 11/11 with 0/9;
  legacy within ±3 of 208/279/311; skills top-1 at least 16; holdout at least 10/22/25 with at
  most 11 forbidden captures; extended at least 90/109/117 with accept-either top-5 122/122;
  `q-protocol-version-history-list` strict top-1 preserved; every changed ranking and every new
  `scout.searchResearch` capture listed.
- Outcomes keep the reviewed meaning. `PASS` banks the measurement; production wiring still needs
  its own brief, including the production `TIER_INTERLEAVE_MARGIN` policy. `PARTIAL` is a ledger
  label with exit `1` and the exact missed positive ids. `FAIL` requires completed readings,
  banks the negative result, and closes attempt one of the block 3 attempt box; the next brief
  may select the cross-encoder. `BLOCKED` and `BLOCKED-ASSETS` mean no reading completed; they
  consume no scored outcome.
- Grid selection stays as implemented: fewest changed rankings among passing grids, then the
  larger `m`.

## 8. Narrow independent review

Reviewer: Grok 4.6 high. Author of the edits: Codex GPT-5.6 Sol high. Orchestrator: Claude
Fable 5 high. Report path:
`.agents/rounds/2026-08-31-eval-routing-next/review-grok-finish.md`; the reviewer replies with
the path.

Scope of the review, before the referee runs:

1. The exact loader and preflight diff against the contracts in 4.2 and 4.3, including the
   four-file check before `pipeline()`, the `extractor()`-scoped env mutation, the unset-refusal,
   and the FS-cache isolation.
2. The snapshot hash record against section 2.
3. Confirmation that the clause artifact, clause files, referee, tests, and frozen contracts are
   byte-unchanged.
4. Confirmation that no fetch path of any kind exists in the diff.

Reconcile every finding first. The referee run waits for a PASS.

## 9. Retain and remove rules

- Keep the clause artifact and the harness. The clause-fit review settled this; they are the
  frozen instrument.
- Keep the snapshot directory until block 3 closes. After the round records a completed outcome,
  the snapshot may be deleted: the four pinned hashes make it reproducible under a future
  authorized fetch. Record the deletion if it happens.
- Keep the query-vector cache and the result JSON in `eval/vectorize/results/` (local, gitignored)
  for at least 30 days after the investigation ends, per the eval results rule.
- The `node_modules` cache is disposable once the snapshot exists and its hashes verify.
- At closeout, update `eval/vectorize/README.md`: replace the blocked-attempt paragraph's end
  state with the completed outcome and stamps, or extend it with the new stop. Update the
  `eval/README.md` pointer only if the outcome changes what it says. Record everything in the
  round ledger. The `BLOCKED` label is replaced only by a completed reading outcome.
- The old attempt's record in `implementation-sol.md` stays as written. Do not rewrite it.

## 10. Out of scope

- Paid calls of any kind, including any QA arm.
- Model fetches of any kind, including an asset-repair fetch.
- A clause artifact rebuild or a second clause set.
- Any `m` outside the fixed grid; any formula, union, or ordering change.
- Any `src/` change, product commit, or production margin decision.
- The cross-encoder.
