# Scout 1.9.23 leakage and exposure analysis

Date: 2026-09-03

## Decision

Keep the Scout 1.9.23 routing text as production input for now.
Do not alter production text to rescue a frozen evaluation.

Expire the affected measurement contracts when their pinned routing source changes.
Do not regenerate the spent clause artifact from the 1.9.23 source.

The smallest general fix is a source-epoch gate for evaluation artifacts.
The gate must run before scoring or artifact writing.

This rule catches exact copies and paraphrases without a fragile similarity threshold.
It also avoids case-specific source filtering.

Both excluded read operations are now valid exposure candidates.
Neither candidate is ready to land in the current generated tree.

## Scope and evidence

I read the required instructions, source files, tests, inventory, results, and review.
I made no paid call and no deployment.

The generated tree changes Scout OpenAPI from `1.9.1` to `1.9.23`.
The Scout operation set remains 37 operations.

The present candidate also changes `inventory/stellar-docs-titles.json`.
Therefore, the routing result is a composite drift result.

| role | result | SHA-256 |
| --- | --- | --- |
| main routing | `eval/results/routing-2026-09-03T15-22-22-048Z.json` | `c950ad72e7a0293e4a7eb95a91d53f15ed3b7770afc2d73e2decbeedb4bb7596` |
| candidate routing | `eval/results/routing-2026-09-03T15-25-17-326Z.json` | `ef21aff2bf09470031fd1ce2a436016988171d2be07bfa59dfa51d8bec171856` |
| main protocol history | `eval/results/protocol-history-2026-09-03T15-22-26-521Z.json` | `c062d76169d948ae8f11d57289211b300407db7883fc1b30165727385a7d0028` |
| candidate protocol history | `eval/results/protocol-history-2026-09-03T15-25-22-707Z.json` | `46cb1d8e399c9d1f49274f796eb9180756717c6b031b1f31244446980d4d008f` |

The main manifest hash is `4cd28f4b...4fe8b`.
The candidate manifest hash is `ad9491b2...b69ff1`.

The candidate changes routing as follows.

| lane | main | candidate | delta |
| --- | ---: | ---: | ---: |
| legacy top 1 / 3 / 5 | 213 / 279 / 312 | 211 / 277 / 312 | -2 / -2 / 0 |
| extended top 1 / 3 / 5 | 90 / 110 / 116 | 90 / 109 / 114 | 0 / -1 / -2 |
| skills top 1 / 3 / 5 | 16 / 23 / 23 | 16 / 22 / 23 | 0 / -1 / 0 |
| holdout passes | 21 | 22 | +1 |
| holdout forbidden captures | 11 | 10 | -1 |

The candidate changes 75 legacy top-five orders.
It changes 22 extended orders, seven skills orders, and six holdout orders.

The protocol-history movements are mixed.

| contract | main required | candidate required | main forbidden | candidate forbidden |
| --- | ---: | ---: | ---: | ---: |
| `protocol-history-routing-v2` | 4 / 8 | 7 / 8 | 1 / 2 | 1 / 2 |
| `protocol-history-blind-v2` | 3 / 11 | 7 / 11 | 4 / 7 | 5 / 7 |

Both contracts fail before and after the drift.
The blind contract adds one forbidden capture.

The new `searchResearch` routing block contains one frozen question verbatim.
It also contains a close paraphrase of two frozen chronology questions.

The new `useWhen` and `keywords` fields repeat the same protocol-history concepts.
Therefore, removing only `exampleQuestions` does not remove the full taint.

The exact case moves from a miss to rank one.
The primary chronology case also moves from a miss to rank one.
The broad corrective-history case moves from a miss to rank one.

These movements show current production behavior.
They do not show independent routing generalization.

## Production behavior and measurement validity

Production may use current upstream routing guidance.
Users can benefit from current protocol-history routing.

The production surface must still pass the normal routing and size gates.
The current candidate does not pass those gates.

Measurement has a stricter temporal rule.
A frozen question can measure only a routing source frozen before that question.

Any later target-routing change expires that comparison contract.
The rule applies even when the new text is only a paraphrase.

Do not locally remove one leaked question from `routingKeywords`.
That action would tune production against the evaluation case.

Do not filter matching clauses after reading the evaluation questions.
That action would make the measurement projection case-dependent.

Do not treat a fuzzy-text threshold as the primary guard.
Such a threshold can miss paraphrases and reject legitimate intent overlap.

The source epoch gives a deterministic boundary.
It preserves production behavior and blocks retrospective contamination.

## Smallest general fix

### 1. Bank the spent clause artifact

Treat the current clause, reranker, and support artifacts as historical evidence.
Do not rebuild them for normal catalog drift.

The current artifact predates Scout 1.9.23.
Its input mismatch is correct and protective.

Follow the existing frontier-artifact precedent in `eval/vectorize/README.md`.
Artifact integrity tests must not require the current catalog to match.

Use artifact-only validation for the banked experiment.
Keep model, payload, metadata, and declared source hashes strict.

Keep current-source matching only in an intentional referee rerun.
That rerun must stop with `surface-expired` on a hash mismatch.

Move algorithm tests to synthetic fixtures where needed.
Do not silently reconstruct historical clause text from the current inventory.

### 2. Add a source epoch to each frozen routing contract

Each new contract must pin these values before case authoring:

- the actual manifest SHA-256;
- the target operation routing-block SHA-256;
- the contract case-content digest;
- the source freeze time;
- the independent case-authoring receipt.

The routing-block hash must cover all scored `x-routing` fields.
It must cover `purpose`, `useWhen`, `exampleQuestions`, and `keywords`.

The measurement source hash must also cover the catalog description and schema keywords.
Those fields can change production scores.

### 3. Fail before a contaminated result is written

`eval/run-protocol-history.mjs` must compare actual source hashes with contract hashes.
It must stop before ranking when a hash differs.

The result must not report a normal pass or fail for an expired contract.
An optional audit record can report `measurementStatus: "source-expired"`.

`eval/run-routing.mjs` must stamp the actual manifest hash in every result.
The current gate evidence only records the expected committed hash.

The clause artifact builder must enforce the same source epoch.
It must not overwrite a banked artifact after a source mismatch.

### 4. Create a new blind contract after the surface freezes

Freeze the accepted production surface first.
Then ask an independent reviewer to author new questions.

Do not give the reviewer the target routing strings.
Pin the new case digest before any later source change.

Keep the current v1 and v2 results as contaminated historical diagnostics.
Do not convert them into a gain, gate, or baseline.

An exact normalized-text check remains useful as a secondary guard.
Near-copy review remains a required independent review step.

The source-epoch rule remains the primary protection.
It catches every later exact or near-exact source change.

## Why the alternatives are weaker

Removing all `exampleQuestions` would change production behavior.
It would also leave the new `useWhen` and `keywords` wording.

Removing only the two matching examples is case-specific tuning.
It violates the repository anti-overfitting rule.

Refreshing the vector artifacts would embed the frozen question.
It would erase the evidence that the source changed.

Rebaselining would accept strict losses without valid gain evidence.
The current evidence cannot support that decision.

## Exposure decisions

### `scout.verifyClaim`

This operation is now a valid exposure candidate.
It is a read-only `GET /api/verify` operation.

The request enum includes `issued`.
The `200` response `claim.type` enum now includes `issued`.

The live evidence in `drift-terra.md` also returned `claim.type: "issued"`.
This change satisfies the exclusion comment's recorded contract condition.

The operation is not yet a complete routing candidate.
Its `x-routing` still describes audit claims more strongly than issued claims.

Schema keywords may route `issued` questions.
That behavior needs a focused routing test before exposure.

### `scout.getQualityReport`

This operation is now a valid exposure candidate.
It is a read-only `GET /api/quality` operation.

Its purpose names Scout and Stellar Light.
Its keywords are source-specific.

Its `notFor` list excludes generic technical and operational questions.
The production builder does not score `notFor` as negative text.

Therefore, actual negative routing cases remain necessary.
The new wording satisfies the recorded candidate condition, not the ship gate.

The response includes Raven consumer-finding summaries.
Tests must keep this operation away from unrelated evaluation questions.

### Added surface estimate

Removing both exclusions adds two callable operations.
Scout exposure grows from 30 to 32 of 37 operations.

The manifest grows from 252 to about 254 entries.
The super spec grows from 64 to about 66 callable paths.

The searchable routed-operation count grows from 30 to about 32.
Both output schemas will probably enter the signature-compaction list.

The exact byte growth needs a generated candidate.
Do not estimate it by hand in a landing decision.

The current compact super spec already has 308,091 bytes.
It exceeds the 307,200-byte limit by 891 bytes.

The two exposure additions can occur only after general compaction passes.
Do not raise the 300 KiB limit.

## Acceptance tests

### Measurement acceptance

1. A current catalog change does not require rewriting a banked artifact.
2. Artifact-only validation still checks the file hash, model, metadata, and vector payload.
3. An intentional referee run rejects a source-hash mismatch before scoring.
4. The rejection writes no normal scored result artifact.
5. A contract pins the actual manifest and target-routing hashes.
6. Each result stamps its actual manifest and contract digests.
7. An exact later question injection produces `source-expired`.
8. A later paraphrase also changes the routing hash and produces `source-expired`.
9. The old v1 and v2 results never become baseline evidence.
10. A new blind contract is authored only after its production source freezes.
11. The existing exact-text leakage check remains on the frozen source projection.
12. A normalized exact-text check rejects punctuation and case variants.

Do not add an automatic fuzzy filter that removes matching clauses.
The guard must invalidate the source epoch instead.

### `verifyClaim` acceptance

1. The request and response claim-type enums contain the same four values.
2. The values include `audited`, `live`, `maintained`, and `issued`.
3. A structured issued-claim query routes `scout.verifyClaim` into the top five.
4. The exact operation serializes the issued query through the Scout adapter.
5. A mocked supported response preserves `claim.type: "issued"`.
6. The operation remains absent from every side-effecting set.
7. The full signature remains available through `codemode.describe`.
8. A compact search signature retains its top-level output fields.

### `getQualityReport` acceptance

1. A Scout data-quality question routes `scout.getQualityReport` into the top five.
2. A Stellar Light limitation question routes it into the top five.
3. Generic protocol quality questions do not route it into the top five.
4. Generic SDK health questions do not route it into the top five.
5. Generic source, confidence, coverage, and limitation questions remain negative controls.
6. The exact operation issues a read-only request with no parameters.
7. The response preserves guard states, denominators, and `knownLimitations` data.
8. The response does not become evidence for unrelated QA cases.

### Surface and regression acceptance

1. `EXCLUDED_SCOUT_OPS` keeps exactly the five feedback and partner exclusions.
2. The manifest contains exactly 32 Scout operation entries.
3. The super spec contains both new callable paths.
4. The manifest and super spec expose the same operation IDs.
5. The routed Scout count changes from 30 to 32.
6. Signature-compaction membership is regenerated and reviewed.
7. The compact super spec stays below 300 KiB.
8. `npm run eval:compile` passes.
9. `npm run eval:routing -- --gate` passes without an unjustified baseline change.
10. Every hit-to-miss routing change receives review.
11. `npm run eval:protocol-history` reports only an eligible contract.
12. `npm test`, `npm run typecheck`, and `npm run build` pass.
13. `npm run secrets:scan -- --tree` passes.

## Current test evidence

The independent full suite reported ten failures.
My six-file targeted run reproduced eight relevant failures.

The failures include the stale routed-operation count and zero unmatched Scout operations.
They also include the exact frozen-question leakage assertion.

Four dependent referee tests stop on `clause artifact input drift`.
That stop must remain until the banked-artifact separation exists.

Do not repair these failures by refreshing the artifact.
Update stale surface assertions only after the policy decision.

## Blocked decisions

- Block the Scout 1.9.23 generated candidate from landing or deployment.
- Block every paid candidate evaluation until a clean reviewed revision exists.
- Block a routing baseline change for the current candidate.
- Block product-credit claims from both protocol-history result pairs.
- Block any refresh of the banked clause, reranker, or support artifacts.
- Block exposure until the 300 KiB failure has a general fix.
- Block exposure until both operations pass focused routing tests.
- Block `sls-077` and `sls-078` lifecycle changes until independent trigger replays finish.
- Block a new upstream leakage finding until an independent live OpenAPI confirmation exists.

The owner must choose whether the spent vector instrument remains rerunnable.
The smallest fix banks it as historical evidence.

A rerunnable historical instrument needs a committed frozen clause-text snapshot.
That larger change is not required for current production readiness.

## Recommended order

1. Bank the spent evaluation artifacts and add the source-epoch gate.
2. Add a general super-spec compaction fix.
3. Build a two-operation exposure candidate.
4. Run focused positive and negative routing tests.
5. Rebuild all generated surfaces through their scripts.
6. Freeze the accepted production surface.
7. Author a new independent protocol-history contract.
8. Run the free routing instruments again.
9. Consider paid evaluation only after every free gate passes.

This order preserves production routing value.
It also prevents contaminated measurement from justifying the production change.
