# Clause-fit measurement implementation

Date: 2026-08-31

Status: blocked before the five readings.

## Result

I implemented the reviewed `clause-fit-hysteresis-v1` measurement harness.
The implementation changes no production code.
The offline membership gate passed before the first model fetch.
The first free fetch built the pinned artifact once.

The single referee invocation stopped before scoring.
The runtime attempted a second metadata fetch in the new process.
That fetch failed under restricted network access.
The two-attempt limit and the single-referee rule prevent another run.

This attempt has no measured `PASS`, `PARTIAL`, or `FAIL` outcome.
The correct state is `BLOCKED` because no reading completed.

## Scope

The implementation adds these files:

- `eval/vectorize/clause-config.mjs`
- `eval/vectorize/build-clause-artifact.mjs`
- `eval/vectorize/clause-retrieval.mjs`
- `eval/vectorize/run-clause-fit.mjs`
- `eval/vectorize/artifacts/qwen3-embedding-0.6b-q8-c25a394-clauses.json`
- `test/eval-vectorize-clause-fit.test.mjs`

The implementation edits these files:

- `package.json`
- `eval/vectorize/README.md`
- `eval/README.md`
- `.agents/rounds/2026-08-31-eval-routing-next/implementation-sol.md`

No file under `src/` changed.
No catalog, builder, gate, frozen contract, shared ledger, `NEXT`, or `TODO` file changed.

## Fixed mechanism

The builder produced 683 clauses.
The source counts are exact.

| Source | Clauses |
| --- | ---: |
| description | 343 |
| workflow | 63 |
| purpose | 26 |
| useWhen | 103 |
| exampleQuestion | 73 |
| notFor | 75 |

The candidate union uses `P5` plus every non-null ungated remainder.
The scorer uses the reviewed positive and negative clause formula.
The hysteresis pass uses only `Infinity`, `0`, `0.03`, `0.06`, and `0.10`.
No clause, margin, formula, or ordering rule changed after the result attempt.

## Artifact record

| Field | Value |
| --- | --- |
| Artifact path | `eval/vectorize/artifacts/qwen3-embedding-0.6b-q8-c25a394-clauses.json` |
| Artifact SHA-256 | `e5f86644af89158c3ac4d61ee7f651e2a062c9d292f194cb94872c7eee4e71f4` |
| Clause-set SHA-256 | `cc5df2e4d89522c580626cfc21727b927494f5f528f42acfa035187a211d89e5` |
| Vector payload SHA-256 | `1dd9eb2ebcaede223fc39e4f07b943375b5025a7922a1578545a09229c09856d` |
| Model revision | `c25a394dd583836952667c12f008335071b3f43d` |
| Runtime | `@huggingface/transformers@4.2.0` |
| Dimensions | `1024` |
| Clause count | `683` |
| Manifest SHA-256 | `4945c3117d464d7155fe6bc2bd2f2f42638ef83159435ae48a90bab046dc6789` |
| Inventory SHA-256 | `1a261c4a2e2172683e91a52ddc33b02ff41e74760c861dfacb29c60a8d8671b0` |
| Archetypes SHA-256 | `beeea9b5ff48680e2f13a030dfd68f21f2d5c50ed4220733d8f1e6095a1b5c14` |

## Fetch and build record

Fetch attempt 1 occurred during the artifact build.
It succeeded and produced the artifact.
The artifact build ran only once.

Fetch attempt 2 occurred during the referee invocation.
It requested `tokenizer_config.json` from the pinned model repository.
The request failed before query vectors existed.

No third fetch occurred.
No artifact rebuild occurred.

## Referee record

The exact command was:

```sh
npm run eval:vectorize:clauses:run -- --dump-dir /tmp/stellar-raven-clause-fit-sol/clause-fit
```

The command exited `1` after `0.67` seconds.
It found 563 unique referee questions.
It stopped while loading the tokenizer.

The first runtime error was:

```text
Unable to fetch file metadata for "https://huggingface.co/onnx-community/Qwen3-Embedding-0.6B-ONNX/resolve/main/tokenizer_config.json": TypeError: fetch failed
```

The terminal error was:

```text
TypeError: this.tokenizer is not a function
```

The referee did not create a query-vector cache.
Therefore, no query-cache SHA-256 exists.
The referee did not create a result file.
Therefore, no result stamp exists.

## Reading tables

No fixed reading completed.
These cells are unavailable, not zero.

| Reading | Margin | Contract tables | Routing tables | Changed rankings | Outcome |
| --- | ---: | --- | --- | --- | --- |
| identity | `Infinity` | not produced | not produced | not produced | unavailable |
| pure fit | `0` | not produced | not produced | not produced | unavailable |
| grid 1 | `0.03` | not produced | not produced | not produced | unavailable |
| grid 2 | `0.06` | not produced | not produced | not produced | unavailable |
| grid 3 | `0.10` | not produced | not produced | not produced | unavailable |

No new `scout.searchResearch` capture list exists.
No changed-ranking list exists.
The dump directory contains no reading dump.

## Exact command record

| Command | Exit | Result |
| --- | ---: | --- |
| `npm ci` | `0` | Added 310 packages. The hook could not lock the primary Git config. |
| `cp /tmp/stellar-raven-clause-fit-dev-vars .dev.vars` | `0` | Installed the required names-only placeholder. |
| `npm run typegen` | `0` | Wrote `env.d.ts`. Wrangler could not write its home log. |
| `./node_modules/.bin/vitest run test/eval-vectorize-clause-fit.test.mjs` | `0` | Passed 19 tests. Skipped two pre-artifact tests. |
| `npm run eval:vectorize:clauses:build` | `0` | Built 683 clause vectors in the only artifact build. |
| `shasum -a 256 eval/vectorize/artifacts/qwen3-embedding-0.6b-q8-c25a394-clauses.json` | `0` | Returned the recorded artifact SHA-256. |
| `npm run eval:selftest` | `0` | Passed all routing self-tests. |
| `npm run eval:compile` | `0` | Compiled 338 legacy and 122 extended cases without a tracked diff. |
| `npm run eval:vectorize:clauses:run -- --dump-dir /tmp/stellar-raven-clause-fit-sol/clause-fit` | `1` | Stopped before readings on the second fetch attempt. |
| `./node_modules/.bin/vitest run test/eval-vectorize-clause-fit.test.mjs test/eval-discovery-vectorize.test.mjs` | `0` | Passed 31 tests. |
| `npm run typecheck` | `0` | Passed. |
| `npm test` | `0` | Passed 1,536 tests in 97 files. |
| `npm run build` | `0` | Passed the micro-map build and Wrangler dry run. |
| `npm run secrets:scan -- --tree` | `0` | Found no leaks. |
| `git diff --check` | `0` | Found no whitespace errors. |

All required validation commands ran.

## Offline test coverage

The new file contains all 21 reviewed checks.
The pre-artifact run passed 19 checks and skipped the two artifact checks.
The post-artifact run passed all 21 checks.

The membership checks cover all 19 frozen positive questions.
They also cover all 32 frozen questions for duplicates and backfill tiers.
The no-leak check covers both frozen protocol contracts.

## Risks

- The harness cannot complete offline in a fresh process with the current cache behavior.
- The artifact does not prove any routing improvement without completed readings.
- A later run could produce environment drift without a recorded query-vector hash.
- The experiment replaces the production cross-tier margin only inside the harness.
- The remainder scores use the reviewed alias-neutral projection.

## Blocker

The pinned runtime did not reuse enough tokenizer metadata from the successful build process.
It attempted a network metadata request in the referee process.
Restricted network access caused that request to fail.

Resolving this blocker requires a new authorized attempt.
That attempt must reset the fetch and referee budgets explicitly.
This implementation does not infer that authority.
