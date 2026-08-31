# Clause-fit independent verification

Date: 2026-08-31

## Verdict

The clause-fit artifact and the offline harness should remain.
They are valid, unmeasured experiment inputs.
They do not provide a measured routing result.

The referee failure has two causes.
The immediate cause is a network or cache failure.
The harness also has an initialization defect.

This is not a clause-scoring defect.
This is not an artifact-integrity defect.
No measured `PASS`, `PARTIAL`, or `FAIL` exists.

## Scope and limits

I read the implementation record, brief, review records, README record, scripts, clauses, and artifact metadata.
I inspected `eval/vectorize/embedder.mjs` and the local Transformers source.
I did not fetch, load, or download a model.
I did not run the referee.
I did not edit implementation files or a shared ledger.

## Implementation fit

The implementation record matches the approved clause-fit design.
The builder creates 683 clauses from 79 searchable entries.
The source counts are 343 description, 63 workflow, 26 purpose, 103 use-when, 73 example-question, and 75 not-for clauses.
The candidate set is production P5 plus all non-null, ungated remaining entries.
The clause configuration excludes `keywords`, `routingKeywords`, and `x-routing.keywords`.
The tested margins are `Infinity`, `0`, `0.03`, `0.06`, and `0.10`.

The implementation has no production `src/` change.
The package scripts call the builder and referee with separate Node processes.
`embedder.mjs` stores `extractorPromise` only in a process-local module variable.
Thus, the builder cannot warm the referee process by itself.

## Offline verification

I ran syntax checks on the embedder and all four clause files.
Each syntax check passed.

I ran this offline test command:

```sh
./node_modules/.bin/vitest run test/eval-vectorize-clause-fit.test.mjs test/eval-discovery-vectorize.test.mjs
```

It passed 31 tests in two files.
The run made no model call.

I loaded the clause artifact through `loadClauseArtifact({requireCatalogMatch:true})`.
The loader passed its artifact, catalog, source-input, clause-set, vector, and dimension checks.
The current clause count is 683.

The artifact file SHA-256 matches the recorded value:

```text
e5f86644af89158c3ac4d61ee7f651e2a062c9d292f194cb94872c7eee4e71f4
```

The verified metadata values are:

| Field | Value |
| --- | --- |
| Model revision | `c25a394dd583836952667c12f008335071b3f43d` |
| Runtime | `@huggingface/transformers@4.2.0` |
| Quantization | `q8` |
| Dimensions | `1024` |
| Clause-set SHA-256 | `cc5df2e4d89522c580626cfc21727b927494f5f528f42acfa035187a211d89e5` |
| Vector SHA-256 | `1dd9eb2ebcaede223fc39e4f07b943375b5025a7922a1578545a09229c09856d` |

`eval/vectorize/results` is absent.
No clause-fit query-vector cache or reading result exists.
This agrees with the saved README and implementation records.

## Failure diagnosis

The recorded referee called `embedQueries()` before it wrote a query cache.
The recorded failure therefore occurred before scoring, ranking, or acceptance checks.

`embedder.mjs` calls `pipeline()` with a model revision and dtype.
It does not set `local_files_only`, `cache_dir`, or a local model directory.
The defaults permit remote model access.

Transformers 4.2.0 calls `get_pipeline_files()` before it constructs the pipeline.
That code calls `get_tokenizer_files(modelId)` without the revision or local-only options.
`get_tokenizer_files()` checks `tokenizer_config.json` with an empty options object.

The metadata helper then uses the default revision, `main`.
It attempts a remote range request when no matching local cache entry exists.
The saved failure shows that exact request for `tokenizer_config.json` failed.

The metadata helper catches the network error and returns `exists: false`.
The pipeline then omits the tokenizer.
The feature-extraction pipeline later executes `this.tokenizer(texts, ...)`.
Its tokenizer field is null or another non-callable value.
JavaScript then throws `TypeError: this.tokenizer is not a function`.

The terminal error is a secondary symptom.
It does not identify a bad clause, vector, scorer, or query.
The useful primary error is the failed remote metadata request.

The artifact pin does not protect this path.
The artifact stores clause vectors only.
It does not store the tokenizer and model files needed for query embedding.
The revision pin also does not reach the tokenizer-file discovery call.

The conventional Hugging Face cache location has no matching `tokenizer_config.json` file.
This check does not exclude another configured cache location.
The recorded remote request is sufficient evidence that the referee lacked a usable local metadata path.

## Classification

The direct block is a network or cache condition.
The local implementation also has a reproducibility defect.
It relies on an implicit shared cache and an allowed network fetch in a later process.
It gives no local-only preflight failure before the generic tokenizer exception.

Therefore, the failure is both a network/cache failure and an implementation defect.
The defect concerns model initialization and error handling.
It does not concern the clause-fit calculation.

## Retention decision

Keep the harness.
Keep the artifact.

The artifact passed the full offline integrity and source-match checks.
The harness passed its offline tests and records the exact unmeasured state.
Removal would discard the one completed free build.
Removal would require another model fetch to rebuild the same evidence.

Keep the result label as `BLOCKED`.
Do not use the artifact as acceptance evidence.
Do not claim a routing outcome from it.

A future authorized repair should first make model availability an explicit prerequisite.
It should use a declared local snapshot or cache location.
It should enforce local-only loading for the referee.
It should fail before scoring with a direct missing-asset error.
Only then can a fresh referee measure the stored artifact.
