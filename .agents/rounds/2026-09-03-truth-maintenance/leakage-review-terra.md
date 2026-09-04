# Leakage implementation review

Date: 2026-09-03

## Scope

I reviewed `leakage-implementation-sol.md` and its related contracts, code, tests, and documentation.
I treated the exposure decision as pending its separate review.
I did not assess the concurrent exposure implementation.
I made no implementation changes.

## Verified behavior

`eval/lib/protocol-history-source-epoch.mjs` validates contracts before it accepts a rank function.
It compares the full manifest digest before scoring.
It also compares every target field passed to the production scorer.

The target projection covers ID, service, kind, searchable state, description, keywords, routing keywords, aliases, and alias triggers.
The routing projection hashes the complete `x-routing` object.
This covers `purpose`, `useWhen`, `exampleQuestions`, `keywords`, and `notFor` when present.

The focused source-epoch tests prove exact and paraphrased routing additions expire before ranking.
They also prove a changed scored field expires before ranking.
An expired result omits `sets`.

The current protocol-history referee returned `source-expired` for both v2 contracts.
It listed manifest, target-scoring, and target-routing expiry reasons.
Its audit record has no `sets` property.

`loadBankedRerankClauseArtifact()` validates the pinned file digest, metadata, clause identities, and vector payload.
It does not load current catalog text.
`loadRerankClauseArtifact()` then requires current-source agreement before a referee can score.
The current source correctly stops this referee with `surface-expired`.

`eval/run-routing.mjs` now stamps the actual manifest path and SHA-256.
The new routing result records `catalog/manifest.json` and SHA-256 `39fcb76a4dfaaaa1c39b8e8a16071688d242af6da1600e2e76c1afb38735e63e`.
The routing gate remains failed and unrebaselined.

The leakage implementation only changes evaluation code and records.
It adds no import from runtime production code.
The production search path remains unchanged by this implementation.

## Checks run

The focused test command passed.

```text
./node_modules/.bin/vitest run test/eval-protocol-history-source-epoch.test.mjs test/eval-vectorize-clause-fit.test.mjs test/eval-vectorize-rerank-fit.test.mjs test/eval-vectorize-support-fit.test.mjs
```

It reported four passing files and 70 passing tests.

`npm run eval:selftest` reported one failure.
The current manifest fingerprint differs from the committed routing gate fingerprint.
This is the expected unrebaselined drift failure.
All protocol-history self-tests passed.

`node eval/run-protocol-history.mjs` wrote an expired audit record without scored sets.
`npm run eval:routing -- --gate` wrote a correctly stamped result and failed its unchanged gate.
`git diff --check` passed.

## Required changes

### 1. Protect the banked artifact builder

`eval/vectorize/build-clause-artifact.mjs:20-46` reads current source and writes the banked artifact directly.
It has no source-epoch check before embedding or writing.
Running `npm run eval:vectorize:clauses:build` during this drift can overwrite the banked artifact.

This violates `leakage-exposure-sol.md:154-155`.
The builder must reject a source mismatch before it embeds or writes.
Add a test that proves this rejection leaves the banked artifact unchanged.

### 2. Restore the frozen-source leakage assertion

`test/eval-vectorize-clause-fit.test.mjs:122-130` checks only synthetic clause text.
It does not inspect a frozen source projection.
It does not test punctuation or case variants.

This does not meet `leakage-exposure-sol.md:258-259`.
Preserve a pinned frozen source projection for this test.
Test normalized exact matching against every frozen case question.
Do not use current production text for this assertion.

## Result

The pre-score expiry, digest coverage, expired audit shape, banked-loader integrity, referee stop, result stamp, and production-path separation are correct.
The builder can still overwrite banked evidence after source drift.
The required frozen-source leakage assertion is also absent.

CHANGES-REQUIRED

## Final source-epoch delta review

I reviewed the repaired clause-fit test and the current manifest delta.
I made no implementation edit.

The frozen leakage projection and banked clause artifact share the accepted epoch.
Their manifest SHA-256 is `4cd28f4bdfe8c73950e0a6d4dfa1a09dd2f82674859e93990fdd62daef24fe8b`.
Their inventory SHA-256 is `1a261c4a2e2172683e91a52ddc33b02ff41e74760c861dfacb29c60a8d8671b0`.
Their archetypes SHA-256 is `beeea9b5ff48680e2f13a030dfd68f21f2d5c50ed4220733d8f1e6095a1b5c14`.

Test 22 loads that frozen epoch from `loadFrozenLeakageProjection()`.
It checks the artifact inputs against that epoch.
It accepts an identical cloned input object.
It then changes only the manifest digest to zeroes.
`assertClauseArtifactInputEpoch()` throws `surface-expired` before the score mock runs.
The test is self-contained and does not require a drifted working manifest.

The current manifest SHA-256 is `b613201846076e9fbaa70edfee4f506841c7cf690265e69c8d07afde567f6729`.
The current manifest delta changes only `stellarDocs.search_asset_token_docs`.
It adds `usdt0`, `layer`, and `zero` to that Docs operation's keywords.
The only other manifest change is `generatedAt`.
No Scout manifest entry changed.

The production loader still reads the current source before it reconstructs clauses.
Its current input digest differs from the banked accepted digest.
`loadClauseArtifact({ requireCatalogMatch: true })` therefore returns `surface-expired: clause artifact input drift`.
This is the required production behavior for the Docs-only manifest drift.

I ran the focused command:

```text
./node_modules/.bin/vitest run test/eval-protocol-history-source-epoch.test.mjs test/eval-vectorize-clause-fit.test.mjs test/eval-vectorize-rerank-fit.test.mjs test/eval-vectorize-support-fit.test.mjs
```

It passed 72 tests in four files.

PASS

## Final reconciliation after the two repairs

I reviewed the repaired code against the restored accepted Scout 1.9.1 surface.
`catalog/manifest.json` has SHA-256 `4cd28f4bdfe8c73950e0a6d4dfa1a09dd2f82674859e93990fdd62daef24fe8b`.
`inventory/stellar-light.json` has SHA-256 `1a261c4a2e2172683e91a52ddc33b02ff41e74760c861dfacb29c60a8d8671b0`.

`assertClauseBuildSourceEpoch()` loads the banked artifact before it calls embedding or writing.
It accepts the restored source epoch.
It rejects changed inputs, unmatched Scout operations, and clause text.
The rejection messages are `surface-expired` messages for each changed class.
The builder test proves an input mismatch calls neither `embed` nor `write`.
It also proves the copied banked bytes stay unchanged.

`loadFrozenLeakageProjection()` pins the frozen projection file hash to `61f1bf7c20ae6491bcc9a5cecb6d7ddb772e44e511624b7e1028063d310ab259`.
The projection pins the accepted manifest, inventory, clause-set, and artifact hashes.
It contains 27 `scout.searchResearch` clauses.
The leakage test compares each projected text hash with the banked artifact identity.
It checks every v2 required, forbidden, and neutral question.
It rejects exact, punctuation, case, and combined punctuation-case matches after normalization.
The direct detection test also passes.

The focused command ran 72 tests across four files.
It had 71 passes and one failure.
The source-epoch suite passed all five tests.
The rerank and support vector suites passed.
The frozen normalized leakage tests passed.

`npm run eval:selftest` passed.
`npm run eval:protocol-history` ran as `eligible` on the restored source.
It did not receive expiry credit.
The first v2 contract failed with 4/8 required captures and 1/2 forbidden captures.
The blind v2 contract failed with 3/11 required captures and 4/7 forbidden captures.
These are the two current protocol-history contract failures.
They are not clause-fit test failures.

`npm test` ran 1,727 tests in 103 files.
It had 1,726 passes and one failure.
The only clause-fit failure is `artifact integrity > 22. expires an intentional referee run after source drift`.
It calls `loadClauseArtifact({ requireCatalogMatch: true })` against the restored matching source.
The loader correctly returns instead of throwing `surface-expired`.
The test still assumes the prior drifted source.
This stale assertion causes both the focused and full-suite failures.
I found no second clause-fit failure.

The repairs meet their functional goals.
The suite cannot pass until the stale intentional-expiry assertion creates an isolated mismatch.
The test must then assert pre-score expiry without changing the accepted current-source assertion.
No implementation files changed during this review.

CHANGES-REQUIRED

## Final source-epoch delta conclusion

This conclusion supersedes the earlier reconciliation verdict.
The frozen epoch loads, the isolated mismatch stops before scoring, and the Docs-only live epoch expires.
The focused four-file command passed all 72 tests.

PASS
