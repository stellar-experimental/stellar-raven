# Catalog search and recovery

The generated [manifest](../../catalog/manifest.json) defines the exposed operations, skills, and section addresses.
[load.ts](load.ts) validates it once per Worker isolate.
[types.ts](types.ts) defines its schema and file-pin constraints.
Entry IDs are globally unique; operation terminal names are unique within each service.
These terminal names become sandbox function names.

[ADR-0003](../../research/decisions/0003-build-time-exposure-filtering.md) defines build-time exposure.
Excluded operations have no catalog entry or callable function.
Section entries use `searchable: false` under [ADR-0005](../../research/decisions/0005-skills-form-sections-out-of-search.md).
They remain available through exact-ID reads and section navigation.

## Search interfaces

[search.ts](search.ts) supplies `searchCatalogPage` and the hits-only `searchCatalog` interface.
`searchCatalog` remains the frozen test and eval contract.
[search-resolution.ts](search-resolution.ts) supplies the neutral interface used by MCP and sandbox adapters.
Its stages validate the service, validate exact recovery IDs, then resolve the page and requested recovery candidates.
Adapters own their input schemas, error shapes, response prose, and telemetry.

The default page limit is 10; the maximum is 50.
A non-finite limit uses the default before clamping.
Kind and service filters use exact values.
Unknown services produce structured issues at the adapter boundary.
The hits-only interface keeps silent filter behavior for its frozen callers.

## Scoring and admission

The vendored [lexical scorer](vendor/search-scoring.ts) defines field matching and coverage.
Its copied-source header records its upstream version independently of the installed executor package.

| Field | Weight |
| --- | ---: |
| ID | 12 |
| Terminal name | 10 |
| Service | 8 |
| Description | 5 |
| Kind | 2 |

Exact, prefix, and phrase matches use multipliers of 14, 9, and 6.
Token matches use 4 for exact matches, 2 for prefix overlap, and 1 for substrings.
The coverage gate requires all query tokens for queries with at most two tokens.
Longer queries require 60% coverage unless an exact phrase matches.
The scorer also adds coverage, first-token, and exact-identity bonuses.

[scoring.ts](scoring.ts) adds structural adjustments:

- Stopword rescue retries a failed gated score with English stopwords removed.
  An entry that already passes keeps its original score.
- Section weighting uses 0.75 when an experiment enables section search.
- Section-body keywords use a 0.4 blend when those keywords exist.
- Routing keywords use a 1.0 blend with routing-coherence and schema-witness checks.
- Query aliases provide general forms such as `tx`, `txn`, `txs`, `acct`, and `addr`.
- The ungated scorer removes the coverage gate while retaining the common scoring scale.

Service diversity acts during selection, not field scoring.
The vendor scorer remains separate from these adjustments.
[known-aliases.ts](known-aliases.ts) handles catalog-published aliases through exact token sequences.
[skill-search-admission.ts](skill-search-admission.ts) requires independent evidence before a whole skill enters search.
That evidence can use an exact identity, known alias, slug, capability term, or published domain code.
Generic fragments in a skill name alone do not establish admission.

`rejectsRoutingIntent` in search.ts checks source-authored negative routing clauses before scoring.
Positive phrases, input enums, specific vocabulary, and operation identity can supply admission evidence.
A matching negative clause can still reject an entry when its coverage meets the negative-margin rule.
These rules use catalog data; they do not assign services from individual eval questions.

## Page membership

The selector sorts candidates by descending score, then ascending ID.
Service diversity uses `max(2, ceil(0.4 * limit))` as its quota.
Overflow candidates fill open slots when other services cannot fill them.

A short gated page scores the complete ungated pool and fills remaining slots with novel candidates.
A full gated page scores only gate-failed candidates that can participate in its replacement rules.
A full page can therefore change through backfill.

`preserveStrongBackfill` can replace one weak result when a service exceeds its quota.
The candidate must meet the 1.6× score margin and improve intent coverage.
It must fit a service slot, and it cannot replace the first selected result.

`preserveIntentWithinServiceQuota` accepts candidates from either tier.
Same-service replacement preserves the first result for that service and requires stronger intent evidence.
Evidence can use complete description-plus-phrase coverage or targeted vocabulary with input-enum witnesses.
The directory witness uses source-repeated, discriminative vocabulary and a separate matching input enum.
A targeted candidate can also replace another service's later result when its own service has quota space.
This cross-service replacement can change service counts.
[search.ts](search.ts) owns the precise witness and victim rules.

## Ordering and counts

Membership is fixed before final ordering.
Tier interleaving lets a backfill hit pass an adjacent gated hit at the 1.6× margin.
A freshness exception applies when at least two distinct content tokens express freshness.
It moves a selected semantic operation with `date_start` and `date_end` before adjacent exact-lane operations.
It changes order, not membership or counts.
Returned order defines ranking; a caller must not reconstruct it from scores alone.

Every hit has `tier: "gated" | "backfill"`.
For a full gated page, `total` remains the gated candidate count after filters and admission.
Targeted replacements do not increase it.
For a short page, `total` also counts novel candidates from the complete ungated pool.
`truncated` equals `total > hits.length`.
Catalog pagination does not measure completeness of a service response.

[output-compaction.ts](output-compaction.ts) defines the shared 2,000-character rendered output threshold.
Larger search signatures retain a field stub and an exact `codemode.describe` pointer.
Detail helpers and the manifest keep full schemas.

## Advisory recovery

`widerCandidates` and `recovery` remain separate from ranked hits.
They do not change scores, membership, or totals.
Zero-hit and all-backfill pages can receive up to three broad recommendations.
An unresolved one-content-token operation query can receive one directory anchor even with gated hits.
The operation-name test includes ordinary plural identity forms.
Graph links select directory anchors; service filters constrain them, and skill-only queries suppress them.

All-backfill pages normally prefer page-resident broad operations before fixed catalog anchors.
For an unfiltered proper-name `Who is/was ...?` question, canonical broad anchors come first.
This exception changes advisory order only.
Caller-supplied exact operation IDs in `recoverFrom` produce separate bounded recovery candidates.
Omitted or empty `recoverFrom` requests no explicit recovery.
`reason` selects the supported recovery context; it does not authorize a guessed ID.

`confidence` describes the page's navigation evidence.
`recoveryMetadata` identifies skill matches outside the selected service scope and other structural recovery facts.
A search hit supplies navigation metadata, not answer evidence.
[ADR-0007](../../research/decisions/0007-structural-recovery-guidance.md) records the recovery principle.
