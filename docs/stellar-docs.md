# Stellar Docs integration and operator guardrails

Raven reads the Stellar developer documentation through a host-side Mintlify REST adapter.
The docs site at `developers.stellar.org` runs on Mintlify.
The [authored spec](../specs/stellar-docs.json) defines operation IDs, arguments, output shapes, and path scopes.
The generated [catalog](../catalog/manifest.json) defines the exposed operations.
[The architecture guide](../ARCHITECTURE.md) describes the MCP and sandbox boundaries.
[Run locally](../README.md#run-locally) describes development setup.
[The operator guide](operations.md) describes deployment, observability, and account-data deletion.
[The migration research](../research/services/stellar-docs-mintlify.md) records the dated API measurements.

## Sources of truth

| Concern | Source |
| --- | --- |
| Operation descriptions, schemas, and path scopes | [specs/stellar-docs.json](../specs/stellar-docs.json) |
| Runtime request and response handling | [src/adapters/stellar-docs.ts](../src/adapters/stellar-docs.ts) |
| Catalog emission | [scripts/build-catalog.mjs](../scripts/build-catalog.mjs) |
| Title-derived routing vocabulary | [inventory/stellar-docs-titles.json](../inventory/stellar-docs-titles.json) |
| Inventory refresh | [scripts/refresh-inventory.mjs](../scripts/refresh-inventory.mjs) |

The adapter sends every request to the Mintlify discovery API.
It does not route runtime searches through the public docs MCP server at `developers.stellar.org/mcp`.
External service investigations do not define a callable fallback in Raven.
The model can call only manifest operations.
It cannot choose request hosts, credentials, request bodies, or write operations.

## Endpoints and transport

The authored backend block defines the transport.

| Field | Value |
| --- | --- |
| `apiBase` | `https://api.mintlify.com` |
| `searchPath` | `/discovery/v1/search/stellardevelopmentfoundation` |
| `pagePath` | `/discovery/v1/page/stellardevelopmentfoundation` |
| `siteOrigin` | `https://developers.stellar.org` |
| `candidateWindow` | `50` |
| `attemptTimeoutsMs` | `[8000, 12000]` |

Each request is a `POST` with `Authorization: Bearer <MINTLIFY_ASSISTANT_API_KEY>` and a JSON body.
A search request sends `{ query, pageSize }`.
A page request sends `{ path }` without a leading slash.
The API has one host, so there is no host ladder.

The adapter makes at most two attempts for one request.
The first attempt times out after 8,000 ms and the second after 12,000 ms.
A network failure, a timeout, or an HTTP 5xx response allows the second attempt.
An HTTP 4xx response, including `429`, returns immediately.
Malformed JSON in a successful response returns an error, not a retry.

One operation has a wall-clock budget of 24,000 ms (`OPERATION_BUDGET_MS`).
The budget covers every attempt, the `/index` retry, and the site redirect probe.
Each attempt timeout is clipped to the time left.
The adapter does not start an attempt or a probe with less than 500 ms left.

The API uses `404` for both absence and configuration failures.
Only two `404` bodies mean absence:

- `{"message":"No results found"}` from the search endpoint.
- `{"message":"Page not found"}` from the page endpoint.

Any other `404` body returns `error` with `status: 404`.
An example is `{"error":"No deployment related to <domain> exists"}` for an unknown project subdomain.
The adapter has no persistent host-health cache and installs no Mintlify SDK.

## Credentials and boundaries

`MINTLIFY_ASSISTANT_API_KEY` is the only runtime docs secret.
It is a project-scoped Mintlify assistant key with the prefix `mint_dsc_`.
It permits search and page reads, and nothing else that Raven calls.
The host reads it from the Worker environment.
It never appears in model code, catalog output, logs, or sandbox bindings.
A missing key returns `error` before any request.

`MINTLIFY_ADMIN_API_KEY` is an org-scoped Mintlify admin key with the prefix `mint_`.
It covers analytics exports, deploy triggers, and agent jobs.
It is maintenance-only.
It must never become a Worker secret or a sandbox binding.
Store it only in a local operator `.env`.

The assistant endpoint `POST /discovery/v1/assistant/{domain}/message` consumes Mintlify credits.
Raven does not call it.
Any future use is a paid model operation under the hard rules in [AGENTS.md](../AGENTS.md).

Mintlify applies a rate limit of 10,000 requests per organization per hour to search and page reads.
Raven makes one search request per search operation and at most four page requests per page read.
Keep automated sweeps inside that budget.

## Operations

The spec authors 12 operations.
Each operation's `mintlify` block names the endpoint and the path scope.

| Operation | Endpoint | Scope |
| --- | --- | --- |
| `search_docs` | search | Exclude `/meetings/` unless `includeMeetings: true` |
| `search_doc_titles` | search, grouped by page | Exclude `/meetings/` unless `includeMeetings: true` |
| `search_docs_in_category` | search | Include `/docs/{category}`; `category: meetings` includes `/meetings/` |
| `search_soroban_contract_docs` | search | `/docs/build/smart-contracts`, `/docs/build/guides/`, `/docs/learn/fundamentals/contract-development/`, `/docs/tools/cli/` |
| `search_asset_token_docs` | search | `/docs/tokens`, `/docs/build/guides/tokens/` |
| `search_protocol_concepts_docs` | search | `/docs/learn/`, `/docs/networks` |
| `search_rpc_horizon_data_docs` | search | `/docs/data`, `/docs/build/guides/rpc/` |
| `search_anchor_sep_docs` | search | `/docs/platforms`, `/docs/learn/fundamentals/anchors`, `/docs/learn/fundamentals/stellar-ecosystem-proposals` |
| `search_sdk_cli_tools_docs` | search | `/docs/tools`, `/docs/tools/cli/agent-cli` |
| `search_wallet_dapp_docs` | search | `/docs/build/apps`, `/docs/build/guides/dapps`, `/docs/build/guides/freighter` |
| `search_meeting_notes` | search | `/meetings/` |
| `get_doc_page` | page | One page by `path` |

Search operations accept `query`, `hitsPerPage` (1 to 20, default 5), and `includeContent`.
`search_doc_titles` accepts no `includeContent`.
`search_docs_in_category` requires `category`.
`get_doc_page` accepts only `path`.
The operation schema validates model arguments before the adapter runs.
The adapter uses only the host-captured manifest entry.
Catalog entries do not contain runtime `auth` or `cost` policy fields.

## Search scoping

Every search operation makes one search call with `pageSize` equal to the candidate window of 50.
The search service has no facets, scores, or counts.
Its `filter` fields and `scoreThreshold` do not change the result set for this site.
Category and meetings scoping therefore happens in the adapter.

The adapter resolves the scope in this order:

1. Operation `include` and `exclude` prefixes.
2. Matching `conditional` overrides, keyed as `argument=value`; `null` clears a list.
3. `{category}` placeholders filled from the arguments.

A prefix matches on whole path segments.
`/docs/tokens` keeps `/docs/tokens` and `/docs/tokens/x`, not `/docs/tokens-legacy`.
An excluded prefix wins over an included prefix.
The adapter then applies the caller's `hitsPerPage` limit.
A scoped result can show only the part of the corpus inside the 50-candidate window.

`search_doc_titles` groups the kept sections by page.
It keeps the first section of each page.
It ranks pages by query words in the page title, then by query words in the path, then by search rank.
This operation returns no `content`.

With `includeContent: true`, each hit carries the whole section as `content`.
The adapter does not make a second request for content.

## Page retrieval

`get_doc_page` sends the normalized `path` to the page endpoint.
Normalization removes an origin, a query or fragment, a trailing slash, a `.md` or `.mdx` suffix, and leading slashes.
The page store holds an index page only as `<dir>/index`.
A "Page not found" `404` for a path without the `/index` suffix triggers one retry with `<path>/index`.
Any other failure, including any other `404`, returns `error`.

When both lookups return "Page not found", the adapter checks for a moved page.
The live site redirects moved pages; the page store does not.
The adapter makes one `GET` to `https://developers.stellar.org/<path>` with `redirect: "manual"` and no credentials.
It reads only the status and the `Location` header, and discards the body.
This probe uses the first attempt timeout of 8,000 ms, clipped to the operation budget, and has no retry.
A probe failure counts as no redirect.

The adapter follows the redirect only when all of these hold:

- The status is 3xx and a `Location` header exists.
- The target origin is `https://developers.stellar.org`.
- The target path starts with `/docs/` or `/meetings/`.
- The normalized target path differs from the requested path.

It then fetches the target page once, with the same `<path>/index` retry.
The result's `url` and `path` are the new location.
A cross-origin or non-docs redirect is not followed.
A page that is still missing returns `soft-empty` with `status: 404`.

The result is `{ url, path, title, content }`.
`content` is the whole page as Markdown in on-page order.
`title` comes from the first H1 heading, or from the final path segment.
This operation reads one page from the configured project.
A path argument does not create a general URL-fetch capability.
The site probe returns no page body to the model.

## Content cleanup

The adapter cleans every `content` value and every page body before it returns them.
It removes the `theme={...}` metadata from code-fence opening lines.
It makes relative Markdown links absolute against the page URL.
A root-relative link resolves against `siteOrigin`.
Links from an index page resolve against the page directory.
The cleanup removes `.md` and `.mdx` suffixes and trailing `/index` from resolved links.
Absolute links and fragment links stay unchanged.

## Output shape

A search hit has this shape:

```text
{ url, path, title, section?, snippet, content? }
```

`url` is the site URL of the page.
`path` is the site-relative page path with a leading slash and no `/index` suffix.
`title` is the page title from the search metadata, or the final path segment.
`section` is the first heading of the section when the section starts with one.
`snippet` is at most 300 characters of the section text, centered on the first query term.
The snippet drops the first heading and code-fence lines.
It shrinks MDX component tags such as `<Tab title="x">` to their attribute values.
`content` appears only with `includeContent: true` on an operation that returns sections.
`content` keeps the MDX component tags unchanged.

The search payload is `{ hits, candidates, pathFiltered? }`.
`candidates` is the number of sections the search returned before scoping.
`pathFiltered: true` marks a result that passed through an `include` scope.
Callers must read hit paths and snippets before treating a match as evidence.

## Result and absence semantics

Successful calls return `{ ok: true, data }`.
The sandbox dispatcher adds `asOf` and `asOfBasis` to each successful result.
Docs payloads state no data date, so `asOfBasis` is `"observed"`.
Docs operations use the `corpus`, `detail`, or `exact` retrieval lane, so a successful result with hits carries no `caveat`.
Adapter failures return `{ ok: false, error }`.
`error.kind` distinguishes `error` from `soft-empty`.

A search returns `soft-empty` in three cases:

1. The search returned no sections: an empty array, or the "No results found" `404`.
2. No candidate section is under the operation's paths.
   This is a candidate-window result.
   The message states the candidate count.
3. No in-scope section contains a query term.
   This is the query-term relevance guard.
   The message names the terms.

The relevance guard exists because the semantic search always returns its nearest sections.
A nonsense query still receives candidates.
Query terms are words of 3 or more characters, or words with a digit, minus a small stopword set.
A hyphenated identifier such as `SEP-10` matches both `sep 10` and its parts.
The guard checks the section title, path, and content.

A page read returns `soft-empty` when the page does not exist.
Each soft-empty hint names a broader operation to try.

A soft-empty response describes this query, operation scope, and candidate window.
It does not prove that the docs lack the topic.
A failed transport or credential check provides no corpus-absence evidence.
A nonzero candidate count does not establish that the returned matches answer the question.

For a docs-scoped question, report the observed result and its scope.
For an open-world identity or history question, corroborate through broad exposed sources before making a negative claim.
Use the returned paths and snippets to select follow-up evidence.
Use `get_doc_page` to read a whole page after a search hit.

## Limits

| Limit | Value | Source |
| --- | --- | --- |
| Candidate window per search | 50 sections | `candidateWindow` in the spec backend |
| Hits per search | 1 to 20, default 5 | `hitsPerPage` in each operation schema |
| Snippet length | 300 characters | `SNIPPET_CHARS` in the adapter |
| Attempts per request | 2, with 8,000 ms and 12,000 ms timeouts | `attemptTimeoutsMs` in the spec backend |
| Wall-clock budget per operation | 24,000 ms, across all requests and the redirect probe | `OPERATION_BUDGET_MS` in the adapter |
| Page requests per read | At most 4: 2 for the requested path, 2 for a redirect target | The `/index` retry and the redirect follow in the adapter |
| Site redirect probes per read | At most 1, with an 8,000 ms timeout and no retry | `siteRedirectPath` in the adapter |
| Mintlify rate limit | 10,000 requests per organization per hour | Mintlify API reference |
| Error text from the API | 1,024 characters | `MAX_ERROR_BODY_CHARS` in the adapter |

## Maintenance

### Keys and permitted use

| Key | Scope | Permitted use | Forbidden use |
| --- | --- | --- | --- |
| `MINTLIFY_ASSISTANT_API_KEY` | Mintlify project | Runtime search and page reads in the Worker. Local development and the refresh workflow. | Assistant messages. Printing or committing. |
| `MINTLIFY_ADMIN_API_KEY` | Mintlify organization | Local maintenance reads: search analytics exports. | Worker secret. Sandbox binding. Deploy triggers or agent jobs without an owner decision. |

Never print or commit a key.
Never add a maintenance key to a model-facing service interface.
A model-callable write requires host-side request-context approval, elicitation, and budget enforcement before release.

### Docs content and ranking

The Mintlify project belongs to the Stellar docs team.
Raven holds no write path to its content or search configuration.
Content corrections belong in `stellar/stellar-docs` when a page is wrong, stale, or missing.
Do not replace upstream content with a Raven-owned version.
Do not create a second index without a measured benefit that justifies its maintenance burden.

A docs search-mechanism change inside Raven, such as a new scope or a guard change, needs a measured win.
Measure it with a free, read-only, retrieval-level A/B against the golden docs pages.
The mechanism must be general, not a per-query or per-page exception.

### Verification

Refresh scripts own generated inventory files.
The authored spec owns operation mappings; the runtime adapter consumes those mappings.
Changes to schemas or mappings require the relevant adapter tests and normal repository gates.
The catalog and spec builders must regenerate their outputs through the owning scripts.
Do not hand-edit generated artifacts.

Use [the improvements workflow](../.agents/skills/improvements-pipeline/SKILL.md) for evidence-backed upstream findings.
Use [the observability workflow](../.agents/skills/cloudflare-observability-review/SKILL.md) for runtime request investigation.
Do not treat old probe counts, keys, or endpoint surveys as current operating instructions.
