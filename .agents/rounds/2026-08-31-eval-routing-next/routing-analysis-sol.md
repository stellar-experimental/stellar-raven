# Protocol-history routing analysis — Sol

Date: 2026-08-31
Revision: `1bfb9838491fa571166a2a631789a3b0e814980c`
Scope: free diagnosis and implementation design only

## Decision

The defect is a lexical intent-boundary failure in this repository.

`scout.searchResearch` has the correct data and an adequate description.
The catalog builder destroys useful routing structure before scoring.
The scorer then treats one large keyword set as one synthetic description.

This design causes two opposite failures.

- Long historical paraphrases fail the 60% token-coverage gate.
- Short technical controls match the broad keyword set and enter the top five.

A larger lexical bonus cannot solve both failures.
The rejected 2026-08-30 classifier already proved that limitation.

The next general mechanism should be a pairwise semantic route-fit reranker.
It must compare each query with each operation-owned routing card.
It must not classify queries with hand-written historical terms.
It must not contain case IDs, case phrases, or golden facts.

The current frozen contracts must remain the acceptance test.
Do not ship unless both contracts pass completely.

## Baseline diagnostics

I installed the locked dependencies with `npm ci`.
The prepare script could not change the parent Git configuration.
The dependency installation still completed successfully.

I ran these free commands:

```sh
npm run eval:selftest
npm run eval:compile
npm run eval:routing -- --gate --dump-ranked /tmp/2026-08-31-routing-analysis-sol.json
npm run eval:protocol-history
./node_modules/.bin/vitest run test/search.test.ts test/scoring.test.ts test/catalog.test.ts test/extract-keywords.test.ts
```

Results:

- `eval:selftest`: pass.
- `eval:compile`: 338 legacy cases and 122 extended cases.
- Routing gate: pass.
- Ranked dump: 495 cases.
- Focused unit tests: 4 files and 121 tests passed.
- `eval:protocol-history`: expected failure.
- No paid command ran.

Current routing totals:

| Lane | Top 1 | Top 3 | Top 5 | Other |
| --- | ---: | ---: | ---: | ---: |
| Legacy, 338 | 208 | 279 | 311 | card@5 95/182 |
| Extended, 122 | 90 | 109 | 117 | accept-either top 5 122/122 |
| Skills, 23 | 16 | 23 | 23 | card@5 23/23 |
| Holdout, 49 | 10 | 22 | 25 | 11 forbidden captures |

Current protocol-history totals:

| Contract | Positive top-five captures | Control top-five captures | Result |
| --- | ---: | ---: | --- |
| `protocol-history-routing-v1` | 4/8 | 1/4 | fail |
| `protocol-history-blind-v1` | 3/11 | 6/9 | fail |

The results match the 2026-08-30 record exactly.
No baseline drift explains this defect.

## Root cause

### 1. The source routing data is useful

Scout publishes structured `x-routing` data for `searchResearch`.
It contains a purpose, 9 `useWhen` clauses, 6 examples, 91 keyword phrases, and 2 exclusions.

The source explicitly names these intents:

- Protocol history.
- Security incidents.
- Post-mortems.
- Audit findings.
- Cited research.

Therefore, this is not a description gap.

### 2. The builder flattens the structure

`scripts/build-catalog.mjs:629` joins the purpose, clauses, examples, and keywords.
`attachRoutingKeywords` then extracts one flat token array.
It applies no document-frequency filter.

The generated `scout.searchResearch` entry has 176 `routingKeywords` tokens.
The original clause boundaries no longer exist.
The generated manifest also drops `notFor` data.

This flattening removes intent coherence.
Unrelated terms can combine across unrelated clauses.

For example, a control can match `protocol`, `version`, `current`, and `mainnet`.
Those terms came from different routing statements.
The scorer treats them as one strong statement.

### 3. The scorer converts the flat set into synthetic prose

`src/catalog/scoring.ts:178` runs a second scoring pass for each keyword field.
`src/catalog/scoring.ts:195` appends the whole field to the description.

This design causes keyword aggregation.
A query can satisfy coverage with terms from several unrelated source clauses.

The current blend is `1.0` for routing keywords.
This gives the synthetic field the full description weight.

### 4. The coverage gate blocks valid paraphrases

The vendored scorer requires 60% token coverage for queries longer than two tokens.
The gate uses exact, prefix, phrase, and substring matches.
It does not represent intent or semantic similarity.

The named Protocol 24 question gives `scout.searchResearch` an ungated score of `186`.
The gated score is `null`.

Its returned top five are:

1. `scout.searchHackathonBuilds:207:gated`
2. `lumenloop.find_av_passages:156:gated`
3. `scout.compareHackathons:146:gated`
4. `scout.vetIdea:126:gated`
5. `scout.explainRepo:46:gated`

The correct operation has a stronger ungated score than four returned hits.
It cannot compete because the gate removes it.

The blind Whisk question has the same failure.
Its target ungated score is `101`, while its gated score is `null`.

Simple token cleanup does not fix the class.
I tested raw, unique-token, stopword-free, and unique stopword-free queries.
No transform passed either frozen contract.

### 5. Backfill only runs on a short gated page

`src/catalog/search.ts:617` scores gated candidates first.
`src/catalog/search.ts:621` runs ungated backfill only when the gated page is short.

The Protocol 24 page already has five gated candidates.
The backfill path never considers `scout.searchResearch`.

This is a candidate-generation defect.
It is separate from the target operation's raw score.

### 6. Broad terms also create false captures

The same flat field passes the gate for unrelated controls.

Examples:

| Control | Target score | Target rank |
| --- | ---: | ---: |
| Current Mainnet protocol version | 149 | 5 |
| Protocol XDR bug | 174 | 5 |
| Soroban contract exploit review | 189 | 4 |
| JavaScript SDK version history | 150 | 4 |
| Wallet SEP support CAP history | 185 | 1 |
| Anchor KYC breach report | 100 | 3 |

These controls prove that a broader rescue is unsafe.
They also prove that one score threshold cannot separate the classes.

Positive ungated scores range from `88` to `272`.
Control ungated scores range from `73` to `189`.
The ranges overlap substantially.

## Why prior mechanisms failed

The first rejected mechanism used hand-written incident and history term sets.
It copied the evaluation class into production scoring.
It also gave one corpus entry a fixed 150-point bonus.

That mechanism recovered the named cases but failed unseen paraphrases.
It also produced broad false captures.

The full-page backfill experiment kept the existing tier boundary.
It surfaced the named Protocol 24 case at rank five.
It changed 15 of 495 rankings.

However, it worsened original control captures from 1/4 to 2/4.
It worsened blind control captures from 6/9 to 8/9.
Blind positives stayed at 3/11.

Global stopword filtering also lacks the needed intent distinction.
The current code already records broader routing regressions from that approach.

Therefore, these mechanism classes remain rejected:

- A query-to-operation map.
- A case-derived vocabulary classifier.
- A fixed `scout.searchResearch` score bonus.
- A lower coverage threshold for research entries.
- An unconditional research slot.
- Full-page backfill without an intent-aware reranker.
- More catalog prose using the same flat scorer.

## General mechanism

Use a pairwise semantic route-fit reranker over structured routing cards.

The mechanism has four stages.

### Stage A: preserve structured source fields

Store these fields separately in the generated catalog:

- `purpose`.
- `useWhen[]`.
- `exampleQuestions[]`.
- `keywords[]`.
- `notFor[]`.
- Existing workflow question shapes.

Do not join them into one synthetic description.
Keep current `routingKeywords` during the experiment only if comparison requires it.
Remove the old field in the final forward-only design.

### Stage B: build a complete bounded candidate union

Use the current gated candidates and a bounded ungated candidate set.
Do this before the final page slice.

Keep every coverage-failed entry marked as `backfill`.
Do not place a coverage-failed entry in the gated tier.

Preserve `TIER_INTERLEAVE_MARGIN` for cross-tier movement.
Exact-ID searches must keep the current exact behavior.
Kind and service filters must still apply before reranking.

### Stage C: score query-card fit

Use one generic semantic query-card comparator.
The comparator receives only the query and one structured routing card.

It must not receive case IDs or expected operations.
It must not use the golden answer.
It must not use a hand-written protocol-history vocabulary.

A pairwise cross-encoder is the preferred experiment.
The earlier Qwen bi-encoder reranker is not an adequate substitute.
That experiment reranked only lexical top-20 candidates and failed broad routing gates.

The comparator should score positive clauses and exclusion clauses separately.
It should use the highest coherent clause match.
It must not sum unrelated token matches across all clauses.

### Stage D: combine scores without hiding tier policy

Use the semantic score to adjust route fit before page selection.
Keep the lexical score visible for diagnostics.
Keep the original tier visible in every hit.

Cross-tier movement must still satisfy `TIER_INTERLEAVE_MARGIN`.
The experiment must publish both component scores and the final score.

This mechanism is general because it compares arbitrary queries and route cards.
It does not name Protocol 24, Whisk, CAP-0076, or any case.

This mechanism is not yet validated.
The frozen contracts decide whether it is acceptable.

## Affected evaluation slice

### Primary diagnostic slice

The primary slice contains 32 frozen cases.

- `protocol-history-routing-v1`: 8 positives and 4 controls.
- `protocol-history-blind-v1`: 11 positives and 9 controls.

These cases are byte-pinned by `eval:selftest`.
Do not edit their questions, classes, IDs, or digests.

### Main routing slice

The 495-case ranked dump includes the original 12 protocol-history cases.
It excludes the blind 20-case contract.

Two legacy cases need direct inspection:

- `q-protocol-24-whisk-incident`.
- `q-protocol-version-history-list`.

The second case must keep `stellarDocs.search_protocol_concepts_docs` at strict rank one.

Four extended cases need direct inspection:

- `q-pc-protocol-upgrade-timing`.
- `q-sor-p23-auto-restore-extendto`.
- `q-sor-x-ray-bn254-sdk-gap`.
- `q-ti-run-tune-own-horizon`.

These cases protect direct technical routing from historical over-capture.

### QA regression inventory

Seventy-six owned QA cases declare `scout.searchResearch` in their `surface` list.
This is a regression inventory, not a gainable denominator.

The closest incident and history cases include:

- `q-protocol-24-whisk-incident`.
- `q-comp-yieldblox-oracle-incident`.
- `q-hist-yieldblox-v2-2026-exploit`.
- `q-soroban-auth-recursion-dos-audit`.
- `q-tool-soroban-auth-audit-live`.
- `q-hist-scp-rewrite-2015`.
- `q-hist-soroban-launch-protocol20`.

Any later paid QA arm needs a separately reviewed plan.
This analysis does not authorize that arm.

## Candidate files

### Measurement-first files

- New isolated experiment under `eval/`.
- `eval/run-protocol-history.mjs` only for optional score diagnostics.
- `eval/README.md` after a completed experiment.

Do not change the frozen JSON contracts.

### Catalog-generation files

- `scripts/build-catalog.mjs`.
- `scripts/catalog-data/workflow-archetypes.mjs`.
- `src/catalog/types.ts`.
- Generated `catalog/manifest.json`.

`scripts/build-catalog.mjs` must preserve structured `x-routing` fields.
The workflow file should add only general operation-owned question shapes.

### Runtime files

- `src/catalog/scoring.ts`.
- `src/catalog/search.ts`.
- A new focused reranker module under `src/catalog/`.

Keep the pairwise comparator outside the vendored scorer.
Do not edit `src/catalog/vendor/search-scoring.ts` for this experiment.

### Test files

- `test/catalog.test.ts`.
- `test/scoring.test.ts`.
- `test/search.test.ts`.
- Possibly a new focused reranker test file.

## Exact tests

Add these unit contracts before production wiring.

### Catalog tests

1. Preserve each `x-routing` field and its clause order.
2. Reject malformed structured routing data.
3. Reject non-exposed operation IDs in routing exclusions or workflows.
4. Prove generated cards contain no frozen case IDs or golden facts.

### Scoring tests

1. Score one clause coherently without joining unrelated clauses.
2. Apply `notFor` as negative route evidence.
3. Keep exact-ID scoring unchanged.
4. Keep kind and service filters unchanged.
5. Keep coverage-failed candidates in the `backfill` tier.
6. Enforce `TIER_INTERLEAVE_MARGIN` across tiers.
7. Preserve deterministic ordering on equal scores.
8. Expose lexical, semantic, and combined diagnostic scores in experiments.

### Search tests

Add table-driven `searchCatalog` assertions for all nine blind hostile controls:

- `phb-control-protocol-xdr-bug`.
- `phb-control-contract-fail-after-upgrade`.
- `phb-control-incident-runbook`.
- `phb-control-contract-exploit-review`.
- `phb-control-sdk-version-history`.
- `phb-control-cap-history-sep-support`.
- `phb-control-kyc-breach-report`.
- `phb-control-client-protocol-version-failure`.
- `phb-control-failed-deploy-post-mortem`.

Each assertion must exclude `scout.searchResearch` from the top five.

Do not duplicate the 19 positive questions in unit tests.
The frozen diagnostic already owns those exact strings.

### Required command gates

```sh
npm run eval:selftest
npm run eval:compile
npm run eval:protocol-history
npm run eval:routing -- --gate --dump-ranked /tmp/protocol-history-candidate.json
./node_modules/.bin/vitest run test/catalog.test.ts test/scoring.test.ts test/search.test.ts
npm run typecheck
npm test
npm run build
npm run secrets:scan -- --tree
git diff --check
```

Run `npm run test:smoke` only if the implementation touches executor or demo paths.

## Expected movement and acceptance

The target diagnostic movement is exact:

| Contract | Baseline | Required candidate |
| --- | --- | --- |
| Original positives | 4/8 | 8/8 |
| Original control captures | 1/4 | 0/4 |
| Blind positives | 3/11 | 11/11 |
| Blind control captures | 6/9 | 0/9 |

The accepted routing gates need no rebaseline.

Preferred stable totals are:

- Legacy: `208/279/311`.
- Skills: `16/23/23`.
- Holdout: `10/22/25` with at most 11 captures.
- Extended: at least `90/109/117`.
- Extended accept-either top five: `122/122`.

The committed gate bands remain authoritative.
Any gate breach rejects the candidate.

`q-protocol-version-history-list` must keep its current strict rank one.
The exact 495-case comparison must list every changed ranking.

Do not trade a control failure for a positive recovery.
The frozen protocol-history contract requires both precision and recall.

## Regression risks

### Direct technical over-capture

This is the largest known risk.
SDK history, CAP lookup, implementation debugging, and code review can resemble research questions.

The 13 controls define the minimum boundary.
The 49-case holdout adds broader skill and Docs protection.

### Tier-policy bypass

A semantic score can hide a coverage rescue inside the gated tier.
That would repeat the rejected first implementation.

Keep the original tier as explicit data.
Test the margin at equality and immediately below equality.

### Source flooding

`scout.searchResearch` is a broad corpus operation.
Over-promotion can displace primary Docs or skill operations.

Inspect every new target capture in the 495-case dump.
Use that capture set for any later paired QA arm.

### Manifest drift

Structured cards derive from live upstream `x-routing` data.
An upstream wording change can move semantic scores.

Pin card content hashes in the experiment artifact.
Fail closed on unexpected card drift.

### Runtime cost and latency

A hosted reranker can add cost, latency, and a new failure mode.
Any paid model operation needs host-side approval and budget enforcement.

Prefer a deterministic local prototype first.
Do not add a production model call during the measurement stage.

### Model reproducibility

The earlier vector artifact had reproducibility and stale-card problems.
Pin the model, revision, runtime, card hashes, and output digest.

### Exact and filtered searches

Natural-language reranking must not change exact IDs.
It must not ignore `kind` or `service` filters.

### Eval overfitting

The two frozen contracts are acceptance data.
They are not training data.

Use upstream routing cards and generic model behavior only.
Do not tune thresholds per case or per protocol-history class.

## Safe implementation sequence

1. Create a measurement-only reranker under `eval/`.
2. Keep production search unchanged.
3. Preserve structured source routing fields in an experiment manifest.
4. Pin the model, card text, and experiment policy.
5. Run both frozen contracts.
6. Stop unless the result is 19/19 positives and 0/13 controls.
7. Run the 495-case routing dump through both policies.
8. List every changed ranking and every new target capture.
9. Stop on any routing gate breach.
10. Add the exact catalog, scoring, and hostile-control tests.
11. Wire the proven mechanism into production search.
12. Regenerate the manifest through its builder.
13. Run typecheck, unit tests, build, secret scan, and diff checks.
14. Obtain independent review and reconcile every finding.
15. Plan any paid QA separately after the free product gate passes.

This sequence keeps failed experiments outside production.
It also preserves the frozen evidence and shared ledgers.

## Final assessment

The data source is not the problem.
The current router loses clause structure and cannot judge intent.

The coverage gate then hides valid historical paraphrases.
The flat keyword field simultaneously captures unrelated technical controls.

A lexical rescue, bonus, or query classifier will repeat known failures.
The next credible mechanism is a structured pairwise semantic route-fit reranker.

The mechanism remains experimental until both frozen contracts pass.
No production code should change before that result.

No paid calls ran during this analysis.
No production code changed.
No shared ledger changed.
