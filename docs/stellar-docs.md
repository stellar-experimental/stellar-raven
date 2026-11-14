# Stellar Docs integration and operator guardrails

Raven reads the Stellar developer documentation (`developers.stellar.org`, hosted on Mintlify)
through a host-side adapter for the Mintlify discovery API. This file is the adapter's contract
and its maintenance rules. Dated API measurements are in
[the migration research](../research/services/stellar-docs-mintlify.md).

## Sources of truth

| Concern | Source |
| --- | --- |
| Operation IDs, descriptions, schemas, path scopes, transport | [specs/stellar-docs.json](../specs/stellar-docs.json) |
| Exposed operations | [catalog/manifest.json](../catalog/manifest.json), emitted by [scripts/build-catalog.mjs](../scripts/build-catalog.mjs) |
| Request and response handling | [src/adapters/stellar-docs.ts](../src/adapters/stellar-docs.ts) |
| Title-derived routing vocabulary | [inventory/stellar-docs-titles.json](../inventory/stellar-docs-titles.json) |
| Inventory refresh | [scripts/refresh-inventory.mjs](../scripts/refresh-inventory.mjs) |

The model can call only manifest operations. It cannot choose a host, a credential, a request
body, or a write. The adapter does not use the public docs MCP server at
`developers.stellar.org/mcp`, and an external service investigation never defines a callable
fallback.

## Credentials and boundaries

| Key | Scope | Permitted use | Forbidden use |
| --- | --- | --- | --- |
| `MINTLIFY_ASSISTANT_API_KEY` (prefix `mint_dsc_`) | Mintlify project | Search and page reads: the Worker at runtime, local development, the refresh workflow | Assistant messages. Printing or committing. |
| `MINTLIFY_ADMIN_API_KEY` (prefix `mint_`) | Mintlify organization | Local maintenance reads from an operator `.env`: search analytics exports | Worker secret. Sandbox binding. Deploy triggers or agent jobs without an owner decision. |

- The host reads the assistant key from the Worker environment. It never appears in model code,
  catalog output, logs, or sandbox bindings. A missing key returns `error` before any request.
- The assistant endpoint `POST /discovery/v1/assistant/{domain}/message` consumes Mintlify
  credits. Raven does not call it. Any use is a paid model operation under the hard rules in
  [AGENTS.md](../AGENTS.md#hard-rules), as is any model-callable write.
- Mintlify limits search and page reads to 10,000 requests per organization per hour. Keep
  automated sweeps inside that budget.

## Transport

The spec's backend block defines the transport.

| Field | Value |
| --- | --- |
| `apiBase` | `https://api.mintlify.com` (one host, no host ladder) |
| `searchPath` | `/discovery/v1/search/stellardevelopmentfoundation` |
| `pagePath` | `/discovery/v1/page/stellardevelopmentfoundation` |
| `siteOrigin` | `https://developers.stellar.org` |
| `candidateWindow` | `50` |
| `attemptTimeoutsMs` | `[8000, 12000]` |

Each request is a `POST` with `Authorization: Bearer <MINTLIFY_ASSISTANT_API_KEY>` and a JSON
body: `{ query, pageSize }` for a search, `{ path }` (no leading slash) for a page.

- **Attempts.** At most two per request. A network failure, a timeout, or an HTTP 5xx allows the
  second. An HTTP 4xx, including `429`, returns at once. Malformed JSON in a successful response
  is an error, not a retry.
- **Budget.** One operation has 24,000 ms of wall-clock time (`OPERATION_BUDGET_MS`) for every
  attempt, the `/index` retry, and the redirect probe. Each attempt timeout is clipped to the
  time left, and nothing starts with less than 500 ms left.
- **404.** The API uses `404` for absence and for configuration failures. Only
  `{"message":"No results found"}` (search) and `{"message":"Page not found"}` (page) mean
  absence. Any other `404` body, such as `{"error":"No deployment related to <domain> exists"}`,
  returns `error` with `status: 404`.

The adapter keeps no host-health cache and installs no Mintlify SDK.

## Operations

The spec authors 12 operations. Each one's `mintlify` block names its endpoint and path scope.

| Operation | Scope |
| --- | --- |
| `search_docs` | Exclude `/meetings/` unless `includeMeetings: true` |
| `search_doc_titles` | Same scope; hits grouped by page |
| `search_docs_in_category` | Include `/docs/{category}`; `category: meetings` includes `/meetings/` |
| `search_soroban_contract_docs` | `/docs/build/smart-contracts`, `/docs/build/guides/`, `/docs/learn/fundamentals/contract-development/`, `/docs/tools/cli/` |
| `search_asset_token_docs` | `/docs/tokens`, `/docs/build/guides/tokens/` |
| `search_protocol_concepts_docs` | `/docs/learn/`, `/docs/networks` |
| `search_rpc_horizon_data_docs` | `/docs/data`, `/docs/build/guides/rpc/` |
| `search_anchor_sep_docs` | `/docs/platforms`, `/docs/learn/fundamentals/anchors`, `/docs/learn/fundamentals/stellar-ecosystem-proposals` |
| `search_sdk_cli_tools_docs` | `/docs/tools`, `/docs/tools/cli/agent-cli` |
| `search_wallet_dapp_docs` | `/docs/build/apps`, `/docs/build/guides/dapps`, `/docs/build/guides/freighter` |
| `search_meeting_notes` | `/meetings/` |
| `get_doc_page` | One page by `path` (the page endpoint) |

A search operation accepts `query`, `hitsPerPage` (1 to 20, default 5), and `includeContent`.
`search_doc_titles` takes no `includeContent`, `search_docs_in_category` requires `category`,
and `get_doc_page` accepts only `path`. The operation schema validates model arguments before
the adapter runs. The adapter uses only the host-captured manifest entry, and catalog entries
carry no runtime `auth` or `cost` field.

## Search

Every search operation makes one search call with `pageSize` 50, the candidate window. The
service has no facets, scores, or counts, and its `filter` and `scoreThreshold` fields do not
change the result set for this site. Scoping therefore happens in the adapter:

1. Take the operation's `include` and `exclude` prefixes.
2. Apply each matching `conditional` override, keyed as `argument=value`; `null` clears a list.
3. Fill `{category}` placeholders from the arguments.

A prefix matches whole path segments: `/docs/tokens` keeps `/docs/tokens/x`, not
`/docs/tokens-legacy`. An excluded prefix wins over an included one. The adapter then applies
`hitsPerPage`. A scoped result shows only the part of the corpus inside the 50-candidate window.

`search_doc_titles` keeps the first section of each page and ranks pages by query words in the
title, then in the path, then by search rank. It returns no `content`. With
`includeContent: true`, each hit carries its whole section as `content`; the adapter makes no
second request.

### Search output

The payload is `{ hits, candidates, pathFiltered? }`. `candidates` counts the sections returned
before scoping, and `pathFiltered: true` marks a result that passed an `include` scope. A hit is
`{ url, path, title, section?, snippet, content? }`:

- `url` is the site URL. It carries a section anchor only when the section starts with an ATX
  heading that matches exactly one heading recorded for that page in
  `src/adapters/stellar-docs-anchors.json` (rendered text and IDs, including custom IDs; inline
  code delimiters are removed before matching). Repeated, unknown, or otherwise formatted
  headings and unknown pages keep the page URL. A search makes no extra request for this.
- `path` is site-relative, with a leading slash and no `/index` suffix.
- `title` is the page title from the search metadata, or the final path segment.
- `section` is the section's first heading, when it starts with one.
- `snippet` is at most 300 characters of the section text, centered on the first query term. It
  drops the first heading and code-fence lines and shrinks MDX component tags such as
  `<Tab title="x">` to their attribute values.
- `content` appears only with `includeContent: true` and keeps MDX component tags unchanged.

## Page retrieval

`get_doc_page` normalizes `path` (it removes an origin, a query or fragment, a trailing slash, a
`.md` or `.mdx` suffix, and leading slashes) and sends it to the page endpoint.

- **Index pages.** The page store holds an index page only as `<dir>/index`. A "Page not found"
  for a path without that suffix triggers one retry with `<path>/index`. Any other failure,
  including any other `404`, returns `error`.
- **Moved pages.** The live site redirects moved pages; the page store does not. When both
  lookups return "Page not found", the adapter makes one `GET` to
  `https://developers.stellar.org/<path>` with `redirect: "manual"` and no credentials. It reads
  only the status and the `Location` header. The probe has the first attempt timeout and no
  retry, and a probe failure counts as no redirect. The adapter follows the redirect only when
  the status is 3xx with a `Location`, the target origin is `https://developers.stellar.org`, the
  target path starts with `/docs/` or `/meetings/`, and the normalized target differs from the
  request. It then fetches the target once, with the same `/index` retry, and returns the new
  location as `url` and `path`.
- A page that is still missing returns `soft-empty` with `status: 404`.

The result is `{ url, path, title, content }`. `content` is the whole page as Markdown in
on-page order. `title` comes from the first H1 heading, or from the final path segment. The
operation reads one page of the configured project; a path argument does not create a general
URL fetch, and the site probe returns no page body to the model.

## Content cleanup

The adapter cleans every `content` value and page body. It removes `theme={...}` metadata from
code-fence opening lines. It makes relative Markdown links absolute against the page URL (a
root-relative link against `siteOrigin`, a link from an index page against the page directory)
and removes `.md` and `.mdx` suffixes and a trailing `/index` from them. Absolute links and
fragment links stay unchanged.

## Result and absence semantics

A successful call returns `{ ok: true, data }`, and the sandbox dispatcher adds `asOf` and
`asOfBasis`. Docs payloads state no data date, so `asOfBasis` is `"observed"`. Docs operations
use the `corpus`, `detail`, or `exact` retrieval lane, so a result with hits carries no `caveat`.
A failure returns `{ ok: false, error }`, where `error.kind` is `error` or `soft-empty`.

A search returns `soft-empty` in three cases. Each hint names a broader operation to try.

1. The search returned no section: an empty array, or the "No results found" `404`.
2. No candidate section is under the operation's paths. The message states the candidate count.
3. No in-scope section contains a query term; the message names the terms. This guard exists
   because the semantic search always returns its nearest sections, even for a nonsense query.
   Query terms are words of 3 or more characters, or words with a digit, minus a small stopword
   set. A hyphenated identifier such as `SEP-10` matches `sep 10` and its parts. The guard checks
   the section title, path, and content.

A page read returns `soft-empty` when the page does not exist.

What a result proves:

- A soft-empty describes this query, this scope, and this candidate window. It does not prove
  that the docs lack the topic.
- A failed transport or credential check is no evidence about the corpus.
- A nonzero candidate count does not show that the hits answer the question. Read hit paths and
  snippets before you treat a match as evidence, and read a whole page with `get_doc_page`.
- For a docs-scoped question, report the observed result and its scope. For an open-world
  identity or history question, corroborate through broad exposed sources before a negative
  claim.

## Limits

| Limit | Value | Source |
| --- | --- | --- |
| Candidate window per search | 50 sections | `candidateWindow` in the spec backend |
| Hits per search | 1 to 20, default 5 | `hitsPerPage` in each operation schema |
| Snippet length | 300 characters | `SNIPPET_CHARS` in the adapter |
| Attempts per request | 2, with 8,000 ms and 12,000 ms timeouts | `attemptTimeoutsMs` in the spec backend |
| Wall-clock budget per operation | 24,000 ms | `OPERATION_BUDGET_MS` in the adapter |
| Requests per search | 1 search request | The adapter |
| Page requests per read | At most 4: 2 for the requested path, 2 for a redirect target | The `/index` retry and the redirect follow |
| Site redirect probes per read | At most 1, 8,000 ms, no retry | `siteRedirectPath` in the adapter |
| Mintlify rate limit | 10,000 requests per organization per hour | Mintlify API reference |
| Error text from the API | 1,024 characters | `MAX_ERROR_BODY_CHARS` in the adapter |

## Maintenance

**Content and ranking.** The Mintlify project belongs to the Stellar docs team, and Raven has no
write path to its content or search configuration. A wrong, stale, or missing page is corrected
in `stellar/stellar-docs` through the
[improvements workflow](../.agents/skills/improvements-pipeline/SKILL.md). Do not replace
upstream content with a Raven-owned version, and do not build a second index without a measured
benefit that justifies its upkeep.

**Search-mechanism changes.** A change inside Raven, such as a new scope or a guard change, needs
a measured win on a free, read-only, retrieval-level A/B against the golden docs pages. The
mechanism must be general, not a per-query or per-page exception.

**Anchor index.** Run `npm run docs:anchors:build` after a docs site update. The keyless command
reads the public sitemap and the rendered docs and meeting pages, records rendered heading IDs
(duplicates included), and replaces the index only after every page succeeds. An unchanged
capture keeps the file and its capture time. The daily refresh workflow also runs it, and its
drift report includes anchor changes; a Worker build does not. A committed fixture pins rendered
heading pairs from eleven pages. The index is a snapshot: headings can change before the next
refresh, and uniqueness is judged against the headings in the server response.

**Generated files.** Refresh scripts own the inventory files; the authored spec owns operation
mappings. A schema or mapping change needs the adapter tests and the normal gates, and the
catalog and spec are regenerated through their scripts.

Investigate a runtime request with the
[observability workflow](../.agents/skills/cloudflare-observability-review/SKILL.md). Old probe
counts, keys, and endpoint surveys in `research/` are not operating instructions.
