# Stellar Docs integration and operator guardrails

Raven reads Stellar developer documentation through a host-side Algolia REST adapter.
The [authored spec](../specs/stellar-docs.json) defines operation IDs, arguments, output schemas, and query mappings.
The generated [catalog](../catalog/manifest.json) defines the exposed operations.
[The architecture guide](../ARCHITECTURE.md) describes the MCP and sandbox boundaries.
[The operator guide](operations.md) describes credential setup and project operation.

## Sources of truth

| Concern | Source |
| --- | --- |
| Operation descriptions, schemas, and mappings | [specs/stellar-docs.json](../specs/stellar-docs.json) |
| Runtime request and response handling | [src/adapters/stellar-docs.ts](../src/adapters/stellar-docs.ts) |
| Catalog emission | [scripts/build-catalog.mjs](../scripts/build-catalog.mjs) |
| Live settings drift snapshot | [inventory/stellar-docs.json](../inventory/stellar-docs.json) |
| Title-derived routing vocabulary | [inventory/stellar-docs-titles.json](../inventory/stellar-docs-titles.json) |
| Read-only comparison instrument | [scripts/eval-algolia-raven.mjs](../scripts/eval-algolia-raven.mjs) |
| Rule behavior alarm | [scripts/check-algolia-rule-canary.mjs](../scripts/check-algolia-rule-canary.mjs) |

The adapter sends searches to the configured primary DocSearch index.
It does not route runtime searches through an external MCP server.
External service investigations do not define a callable fallback in Raven.
The model can call only manifest operations.
It cannot choose request hosts, credentials, index settings, or write operations.

## Runtime credentials and transport

The host uses `ALGOLIA_APPLICATION_ID_DOCS` and `ALGOLIA_API_KEY_DOCS`.
These values remain outside model code and catalog output.
The authored backend defines the index name and host templates.
The host substitutes its application ID when constructing request hosts.
Requests use `POST /1/indexes/<encoded-index>/query`.

The adapter tries configured hosts in order.
Attempt timeouts increase by 2s: 2s, 4s, 6s, and 8s for the four configured hosts.
Network failures, response-body read failures, and HTTP 5xx responses can advance to the next host.
HTTP 4xx responses, including `429`, return immediately.
Malformed JSON in a successful response returns an error instead of a host retry.
The adapter has no persistent host-health cache.
Its behavior does not depend on installing an Algolia SDK.

Runtime search parameters include `analytics: false`.
The query does not publish a separate analytics event with the user's prompt or intent.
Maintenance comparison and canary searches also disable analytics.
Operator analytics reads use separate maintenance credentials.

## Authored query mappings

Each operation's `transport.algolia` block supplies its mapping.
The adapter assembles query parameters in this order:

1. Backend `baseParams`.
2. Operation `fixedParams`.
3. Caller arguments named by `paramMap`.
4. Matching `conditionalParams` overrides.

A conditional override can delete a parameter or disable a client filter.
The operation schema validates model arguments before this mapping runs.
The adapter uses only the host-captured manifest entry.
The catalog builder emits `op.params` as the input schema and `op.outputSchema` when present.
Catalog entries do not contain runtime `auth` or `cost` policy fields.

Category operations use `clientFilter` over returned URLs because their category hierarchy is not a filterable facet.
These operations can request 100 candidates and filter them by URL prefix.
The adapter then applies the caller's `hitsPerPage` limit.
That caller limit also applies when a conditional override disables the client filter.
A client-filtered result can represent only a limited window of the index's matches.

The response reports shaped hits and Algolia pagination facts.
`clientFiltered: true` marks results that passed through the URL-prefix filter.
`nbHits` remains the index query count; it is not the number of category-filtered hits.
Callers must inspect hit URLs, breadcrumbs, and content before treating a match as evidence.

## Page-section retrieval

`get_doc_page_sections` derives an initial query from the path's final segment.
It can try a second derived query when the first finds no records for the exact page URL.
The adapter uses matching records to identify the page's hierarchy title.
It then sends an exact title query against the relevant hierarchy attribute.
That query disables typo matching, prefix matching, and optional-word expansion.

The adapter follows title-query pages within the index's 1,000-hit pagination ceiling.
It filters records to the exact target URL, sorts sections, and removes duplicates.
The result includes `sections`, `nbSections`, `complete`, and `truncated`.
A missing title, non-exhaustive count, pagination ceiling, or missing exact-title records makes the result incomplete.
`truncationReason` explains the observed limit.
`usedFallbackQuery` identifies a successful fallback seed query when applicable.

This operation retrieves indexed sections, not arbitrary page bytes.
A path argument does not create a general URL-fetch capability.
An incomplete section set must not be described as the whole page.

## Result and absence semantics

Successful searches return `{ ok: true, data }`.
Adapter failures return `{ ok: false, error }`.
`error.kind` distinguishes `error` from `soft-empty`.
No usable search or page-section matches produce `soft-empty`.

A soft-empty response describes this query, index, and operation scope.
A URL-filtered miss can arise when the returned candidate window contains no matching category record.
It does not prove that the whole index lacks that category or topic.
A failed transport or credential check provides no corpus-absence evidence.
A nonzero index count also does not establish that the returned matches answer the question.

For an index-scoped question, report the observed result and its filters.
For an open-world identity or history question, corroborate through broad exposed sources before making a negative claim.
Use actual returned URLs and snippets to select follow-up evidence.
Do not fabricate an operation for an unindexed API-reference page.

## Operator risk ladder

The index also serves the public DocSearch frontend.
An operator change affects a shared corpus, not a private Raven dataset.
Select the lowest-risk mechanism that resolves the measured problem.

1. Prefer read-only analytics, usage, and monitoring evidence.
   Measure prevalence, missing results, and latency before selecting a correction.
   Keep automated searches from polluting those measurements.
2. Consider rules, synonyms, or index settings only after a read-only A/B demonstrates a general improvement.
   Reject a change that helps only its own test question or page.
3. Treat record writes, crawler configuration, and reindexing as the highest-risk actions.
   Require source evidence, measured benefit, review, and an explicit recovery procedure before an authorized write.
   Send wrong or missing page content to the upstream documentation project.

Content corrections belong in `stellar/stellar-docs` when the source page is wrong, stale, or missing.
Do not silently replace upstream content with a Raven-owned version.
Do not create a second index or crawler without a measured benefit that justifies its maintenance burden.

## Binding write guardrails

These rules apply to operator changes as well as future model-callable designs.
[AGENTS.md](../AGENTS.md) supplies the repository's host-side authority rules.

- Require a measured read-only A/B win before an Algolia write.
  The improvement must use a general mechanism, not a per-query or per-page exception.
- Keep `scripts/eval-algolia-raven.mjs` read-only.
  It must not create indexes, rules, synonyms, analytics events, or crawler tasks.
  Keep measurement separate from the write that follows an accepted result.
- Keep operator credentials maintenance-only, outside runtime adapters and the execute sandbox.
  Never print or commit credentials.
  Do not add operator-key bindings to a model-facing service interface.
- A model-callable write requires host-side request-context approval, elicitation, and budget enforcement before release.
  The read-only A/B requirement still applies.
- Keep automated runtime and comparison searches analytics-free.
  Rule canary queries set both `analytics: false` and `clickAnalytics: false`.
- Treat `raven-promote-stellar-cli-install` as the ceiling for an accepted single-target mechanism.
  It is not a template for more page-specific rules or synonyms.
- Record the exact approved mutation and the prior state needed for rollback.
  After an authorized change, verify the expected behavior and check unrelated representative queries.
  Restore the recorded prior configuration if the approved acceptance checks fail.
- Keep rule checks as alarms.
  A failed canary does not authorize an automated repair, reindex, or setting change.

## Rule canary

`npm run algolia:rule-canary` uses the dedicated search-only key.
It runs shared CLI-install cases with rules enabled and disabled.
The named assertions require the canonical install page at rank 1 with rules.
They also require a material rank improvement over the rules-disabled control.
The check tests behavior rather than only the existence of rule metadata.
It does not need an operator write key.

Assertion drift exits with code 1.
Request or configuration errors exit with code 2.
A local invocation without credentials reports an inconclusive result and makes no request.
CI uses `--require-env` so missing credentials fail the check.
The daily refresh records the failure class instead of merging check errors with assertion failures.

The canary engine takes case data and named invariants.
Any approved new guard must use that general mechanism.
Its read-only comparison does not authorize the underlying write.

## Maintenance and verification

Refresh scripts own generated inventory files.
The authored spec owns operation mappings; the runtime adapter consumes those mappings.
Changes to schemas or mappings require the relevant adapter tests and normal repository gates.
The catalog and spec builders must regenerate their outputs through the owning scripts.
Do not hand-edit generated artifacts.

Use [the improvements workflow](../.agents/skills/improvements-pipeline/SKILL.md) for evidence-backed upstream findings.
Use [the observability workflow](../.agents/skills/cloudflare-observability-review/SKILL.md) for runtime request investigation.
Do not treat old probe counts, keys, or endpoint surveys as current operating instructions.
