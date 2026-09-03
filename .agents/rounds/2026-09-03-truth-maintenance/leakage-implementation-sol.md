# Deterministic protocol-history source-epoch repair

Date: 2026-09-03

## Outcome

The repair is complete.

The protocol-history runner now checks every source epoch before the first ranking call.
It writes a `source-expired` audit result when any source digest differs.
The audit result contains no scored sets.

The clause artifact builder now checks the banked source epoch before embedding or writing.
The frozen leakage projection now checks every v2 question after case and punctuation normalization.

The repair keeps production routing text unchanged.
It does not edit a routing baseline.
It does not rebuild or delete a banked vector artifact.

## Production and measurement separation

The Scout 1.9.23 routing text remains available to production search.
The measurement contract does not treat that later text as independent evidence.

The accepted source epoch remains the 2026-09-02 surface.
The exposure lane accepted `scout.verifyClaim` and kept `scout.getQualityReport` hidden.
That accepted production change remains later than the measurement epoch.
It does not make the frozen questions independent again.

The accepted manifest SHA-256 is
`4cd28f4bdfe8c73950e0a6d4dfa1a09dd2f82674859e93990fdd62daef24fe8b`.

The accepted target scoring SHA-256 is
`c3956d225eba75f0543a9aa0d7cf42dc3f6169189e1e3f995f028a6252a42752`.

The accepted target `x-routing` SHA-256 is
`468a9d9834e8cb50cb905f80ccc42f9d3daa7a3d0ff2d8c5194d566812ba716b`.

The target scoring digest covers every field used by production scoring.
It covers the ID, service, kind, visibility, description, keywords, routing keywords, and aliases.

The target routing digest covers the complete `x-routing` object.
It includes `purpose`, `useWhen`, `exampleQuestions`, `keywords`, and `notFor`.

## Implementation

`eval/lib/protocol-history-source-epoch.mjs` owns canonical source and contract digest logic.
It validates each contract before it compares source digests.
It rejects a changed case-content digest before scoring.

`eval/run-protocol-history.mjs` reads the manifest, Scout inventory, and both v2 contracts.
It validates both contracts before it creates the catalog lazily.
The first ranking call can occur only after every source check passes.

Each protocol-history result now records these values:

- the actual manifest SHA-256;
- the actual Scout inventory SHA-256;
- each raw contract file SHA-256;
- each case-content SHA-256;
- the expected and actual target source SHA-256 values;
- a deterministic expiry reason list.

`eval/run-routing.mjs` now stamps the actual manifest path and SHA-256.
It does not change any ranking or gate rule.

Both v2 contracts pin the accepted epoch and the independent authoring receipt.
`eval:selftest` pins the same contract metadata.

`eval/vectorize/build-clause-artifact.mjs` validates the banked artifact before it embeds or writes.
The builder rejects current source drift with `surface-expired`.

`eval/vectorize/frozen/protocol-history-leakage-source-v1.json` preserves the accepted target clauses.
Its pinned SHA-256 is
`61f1bf7c20ae6491bcc9a5cecb6d7ddb772e44e511624b7e1028063d310ab259`.
The projection links all 27 rendered clause hashes to the banked artifact.
The test does not read current production text for this assertion.

## Final candidate result

The final generated candidate has manifest SHA-256
`4273c2990a48eac1b749afe07d4971d99c7d32117e7b6ee4bc823265cf22c476`.

Its Scout inventory SHA-256 is
`1bfe9d6ada6518d834a3893bb9df039ed77e1a16499897af6bdcbed878c0fc4f`.

Its target scoring SHA-256 is
`db253cb0357538a64a9c250b52d06c090f863472293a380ec4be61403ecf8d63`.

Its target `x-routing` SHA-256 is
`65117331ce315963061415d8b31e4b5ca2be1225cd2379ea3ce0c56e1dcaf781`.

All three values differ from the accepted epoch.
Both contracts return `source-expired` before scoring.

The local audit result is
`eval/results/protocol-history-2026-09-03T16-37-03-121Z.json`.
It contains no `sets` property.

The original contract file SHA-256 is
`3227cb0d6c3c9d0e942143fd8ee947963eabd339fe91aa4d3d57d6f78a3bc59b`.

The blind contract file SHA-256 is
`323aefda9d1f2a502b4cdcc92b0a9c88b0c156f2f2fbcebdec0f743992360780`.

Their case-content digests remain
`66fa06ac2990c3591fb279955f7ce61fa8fffd616650f642877424f45b108077`
and `afd4ccb8ee777c9b81de824c5bc4878497ad383ffe8488c77ff32b6ae7820827`.

## Banked vector protection

`loadBankedRerankClauseArtifact()` validates the artifact without reading current source text.
It checks the pinned file SHA-256, model, policy, metadata, clause identities, and vector payload.

Intentional referee runs still require the current source.
They now report `surface-expired` before model scoring after a source mismatch.

The builder now enforces the same epoch before embedding or writing.
Its direct command stopped immediately during the current drift.

The banked clause artifact remains unchanged.
Its SHA-256 remains
`d9de70079a1b94507854949b93b99f90b4f03370021c9a2e313a59f8b759002b`.

The vector tests now use synthetic fixtures for algorithm behavior.
They do not reconstruct historical clause text from the current inventory.

## Focused acceptance tests

The focused test command passed 72 tests across four files.

```text
./node_modules/.bin/vitest run test/eval-protocol-history-source-epoch.test.mjs test/eval-vectorize-clause-fit.test.mjs test/eval-vectorize-rerank-fit.test.mjs test/eval-vectorize-support-fit.test.mjs
```

The tests prove these contracts:

1. An eligible result stamps actual manifest and contract digests.
2. An exact later question injection returns `source-expired`.
3. A later paraphrase also returns `source-expired`.
4. Both changes stop before any ranking call.
5. An expired result has no scored sets.
6. A changed scored target field expires the contract.
7. A changed contract question fails its case-content digest.
8. Banked validation rejects any artifact-file mutation.
9. Banked validation does not require the current catalog.
10. An intentional vector referee reports `surface-expired` after source drift.
11. The builder rejects a source mismatch before embedding or writing.
12. The rejection leaves the banked artifact bytes unchanged.
13. The pinned frozen projection matches all 27 banked target clause hashes.
14. Every v2 case question remains absent after punctuation and case normalization.
15. The normalized check detects a matching punctuation and case variant.

## Review reconciliation

The first review finding required a source guard in the clause artifact builder.
The builder now loads and validates the banked artifact before any embedding call.
It then compares inputs, unmatched operations, and the complete clause-set hash.

The new test copies the banked bytes to a temporary file.
It changes the source manifest hash and calls the builder.
The builder returns `surface-expired`.
The embedding and write spies remain unused.
The copied bytes remain unchanged.

The second review finding required a pinned frozen-source leakage assertion.
The new projection contains the accepted 2026-09-02 target text.
Its file hash prevents silent projection edits.
Its clause hashes match the banked artifact in exact order.

The test covers all 32 frozen v2 questions.
It checks each question ID and exact question text.
It also checks punctuation variants, uppercase variants, and combined variants.
A positive sensitivity test proves that normalized matching detects these variants.

### Docs-only manifest reconciliation

The approved Docs-only refresh changes the full current manifest.
Its SHA-256 is `b613201846076e9fbaa70edfee4f506841c7cf690265e69c8d07afde567f6729`.
The frozen accepted manifest SHA-256 remains `4cd28f4b…4fe8b`.

Test case 22 no longer reads the current catalog.
It loads the hash-pinned frozen leakage projection.
It builds an accepted input tuple from the frozen manifest, inventory, and archetype digests.
The test matches that tuple against the banked artifact inputs.
The shared input-epoch guard accepts an exact copy of the banked inputs.

The test then changes only the manifest digest in a copied tuple.
The guard returns `surface-expired: clause artifact input drift`.
A scoring spy remains unused.
This proves that expiry occurs before scoring.

`loadClauseArtifact()` still reads the live full manifest by default.
It compares all live inputs with the banked artifact before clause validation.
The approved Docs change therefore expires an intentional current-tree referee run.
No caller can bypass that check through the production loading path.

The focused four-file command passed all 72 tests after the Docs rebuild.

## Required checks

`npm run typecheck` passed.

The focused test command passed four files and 72 tests.

The final `npm test` run passed 103 files and 1,771 tests.
An intermediate run saw a concurrent improvements-index mismatch.
That lane settled before the final run.
Its focused 14-test file also passed.
No vector test failed during this reconciliation.

`npm run build` passed.

`npm run eval:vectorize:clauses:build` returned `surface-expired` before embedding.
The banked artifact SHA-256 remained unchanged.

`npm run eval:protocol-history` returned `source-expired` for both contracts.
It scored no question and wrote the audit result listed above.

`npm run eval:selftest` ran and reported one failure.
The failure is the unchanged routing gate fingerprint.
The candidate manifest is `4273c299…c476`, but the accepted fingerprint is `4cd28f4b…4fe8b`.
All protocol-history self-tests passed.

`git diff --check` passed.

`npm run secrets:scan -- --tree` passed.
It reported no leaks.

## Exact recommendations

1. Keep the v2 epoch pinned to the accepted 2026-09-02 source.
2. Never repin v2 to the rejected Scout 1.9.23 candidate.
3. Treat every `source-expired` result as an audit record only.
4. Give no routing credit from contaminated v1 or expired v2 questions.
5. Keep the clause, reranker, and support artifacts banked.
6. Require an intentional referee run to match its historical source.
7. Accept a production surface before freezing the next source epoch.
8. Author the next blind contract independently after that freeze.
9. Stamp every routing result with its actual manifest SHA-256.
10. Keep production routing changes separate from measurement validity decisions.
11. Keep the frozen leakage projection independent from current production text.
12. Preserve the builder guard before any future artifact refresh.

## Blocked decisions

- `scout.getQualityReport` remains hidden after the exposure review.
- `scout.verifyClaim` is accepted production surface, but it does not refresh this measurement epoch.
- A routing baseline change remains blocked.
- The unchanged gate fingerprint must not move to make the candidate pass.
- Existing v2 results cannot support a production gain claim.
- A vector artifact rebuild remains blocked.
- A historical vector rerun needs the full frozen clause source.
- The target-only leakage projection cannot support that rerun.
- A new blind protocol-history contract awaits an accepted production source freeze.
- A projection repin requires a new independent measurement contract.
- Paid evaluation and deployment remain outside this implementation.

## Scope confirmation

This implementation does not edit production catalog text, exposure policy, inventory, or generated artifacts.
It does not edit golden or super-spec lane files.
It preserves concurrent changes in the shared worktree.

PASS-READY
