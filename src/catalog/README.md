# Catalog search and recovery

The generated [manifest](../../catalog/manifest.json) defines exposed operations, skills, and section addresses ([ADR-0003](../../research/decisions/0003-build-time-exposure-filtering.md); sections use `searchable: false` per [ADR-0005](../../research/decisions/0005-skills-form-sections-out-of-search.md)). [load.ts](load.ts) caches the manifest per isolate; [search.ts](search.ts) validates globally unique IDs and per-service unique operation terminal names (which become sandbox function names); [types.ts](types.ts) defines schemas and pin constraints.

## Search interfaces

- [search.ts](search.ts): `searchCatalogPage` and the frozen hits-only `searchCatalog` (keeps silent filter behavior for eval/test callers).
- [search-resolution.ts](search-resolution.ts): neutral interface for MCP and sandbox adapters (validates service and exact recovery IDs, then resolves hits and recovery candidates; adapters own schemas, errors, prose, and telemetry).

Default page limits: 10 for catalog and sandbox `codemode.search`, 7 for public MCP `search`; maximum 50 (non-finite values fall back to default before clamping). `kind` and `service` filters are exact; unknown services fail at the adapter boundary.

## Scoring and admission

The vendored [lexical scorer](vendor/search-scoring.ts) sets field weights (ID 12, terminal name 10, service 8, description 5, kind 2), exact/prefix/phrase multipliers (14/9/6), token match scores (4 exact, 2 prefix, 1 substring), and the coverage gate (100% for ≤2 tokens, 60% for longer queries unless an exact phrase matches), plus coverage, first-token, and exact-identity bonuses.

[scoring.ts](scoring.ts) adds structural adjustments without modifying the vendored scorer:

- **Stopword rescue:** retries failed gated scores with English stopwords removed; passing entries keep their original score.
- **Weights & blends:** section weight 0.75 (if enabled), section-body keywords 0.4, routing keywords 1.0 (with routing-coherence and schema-witness checks). Docs page titles bind to the longest matching URL prefix, excluding service names and cross-service repeated prose.
- **Aliases & acronyms:** query aliases (`tx`, `txn`, `txs`, `acct`, `addr`); acronym rescue (up to 32 forms) after lexical coverage fails, requiring a description acronym plus exact canonical context match outside the expanded span and excluding ordinary catalog lowercase words (compound tokens like `mcp-server` stay whole). Gated rescue cannot fall below the ungated score.
- **Ungated pool:** drops the coverage gate on the same scoring scale.

[known-aliases.ts](known-aliases.ts) matches catalog-published aliases by exact token sequence. [skill-search-admission.ts](skill-search-admission.ts) requires independent evidence (exact ID, alias, slug, capability term, or domain code—not generic name fragments) for whole skills. `rejectsRoutingIntent` (`search.ts`) evaluates source-authored negative routing clauses before scoring using catalog data only.

## Page membership

Candidates sort by descending score, then ascending ID, with per-service diversity quota `max(2, ceil(0.4 * limit))` (overflow fills unused slots). Short gated pages fill remaining slots from the full ungated pool; full gated pages score only gate-failed candidates eligible for replacement:

- `preserveStrongBackfill`: replaces one weak non-first hit when a service exceeds quota if a candidate has ≥1.6× score margin, better intent coverage, and quota space.
- `preserveIntentWithinServiceQuota`: accepts gated or backfill candidates for same-service (non-first) or cross-service (lowest-scored non-first hit of a multi-hit service lacking targeted intent) replacement when stronger intent witnesses match. See [search.ts](search.ts) for exact witness and victim rules.

## Ordering and counts

Membership is fixed before final ordering; callers must use returned order, not sort by score. Tier interleaving lets a backfill hit pass an adjacent gated hit at ≥1.6× margin. A freshness exception (≥2 freshness tokens) promotes a selected semantic op with `date_start`/`date_end` ahead of adjacent exact-lane ops without changing membership or counts.

Each hit has `tier: "gated" | "backfill"`. For full gated pages, `total` is the filtered gated count (replacements do not increase it); for short pages, `total` adds novel ungated candidates. `truncated` equals `total > hits.length` and reflects catalog pagination, not upstream completeness.

[output-compaction.ts](output-compaction.ts) compacts rendered outputs over 2,000 characters in catalog entries and sandbox `codemode.search` to a stub plus exact `codemode.describe` pointer; public MCP search cards omit output types; detail helpers and the manifest keep full schemas.

## Advisory recovery

`widerCandidates` and `recovery` never alter ranked scores, membership, or totals ([ADR-0007](../../research/decisions/0007-structural-recovery-guidance.md)):

- Zero-hit and all-backfill pages receive up to 3 broad recommendations; an unresolved one-content-token op query (including plurals) gets one directory anchor (constrained by service filters, suppressed for skill-only queries).
- All-backfill pages prefer page-resident broad ops before catalog anchors, except unfiltered proper-name `Who is/was ...?` queries, which put canonical broad anchors first.
- Explicit `recoverFrom` exact op IDs return bounded recovery candidates (`reason` selects context; never authorizes guessed IDs).
- `detail` profile edges (e.g., Docs search hit → `stellarDocs.get_doc_page`) require target lane `detail` and all required target inputs present on source rows. `recovery`, `widerCandidates`, and execute's three alternatives skip them; the execute checkpoint renders each uncalled target once for successful row-returning calls (`on` is cosmetic).

`confidence` and `recoveryMetadata` describe navigation evidence (including out-of-scope skill matches); search hits are navigation metadata, not answer evidence.
