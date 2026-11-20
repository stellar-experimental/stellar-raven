# Stellar Docs integration and operator guardrails

Contract and maintenance rules for Raven's host-side Mintlify discovery API adapter for
`developers.stellar.org`. Dated API measurements live in
[research/services/stellar-docs-mintlify.md](../research/services/stellar-docs-mintlify.md).

## Sources of truth

| Concern | Source |
| --- | --- |
| Operation IDs, descriptions, schemas, path scopes, transport | [specs/stellar-docs.json](../specs/stellar-docs.json) |
| Exposed operations | [catalog/manifest.json](../catalog/manifest.json) (via [scripts/build-catalog.mjs](../scripts/build-catalog.mjs)) |
| Request and response handling | [src/adapters/stellar-docs.ts](../src/adapters/stellar-docs.ts) |
| Title-derived routing vocabulary | [inventory/stellar-docs-titles.json](../inventory/stellar-docs-titles.json) |
| Inventory refresh | [scripts/refresh-inventory.mjs](../scripts/refresh-inventory.mjs) |

Models call only manifest operations and cannot choose a host, credential, request body, or write.
Raven never calls the public docs MCP at `developers.stellar.org/mcp`, and external service probes
never create callable fallbacks.

## Credentials and boundaries

| Key | Scope | Permitted use | Forbidden use |
| --- | --- | --- | --- |
| `MINTLIFY_ASSISTANT_API_KEY` (`mint_dsc_`) | Mintlify project | Search and page reads (Worker runtime, local dev, refresh workflow) | Assistant messages; printing or committing |
| `MINTLIFY_ADMIN_API_KEY` (`mint_`) | Mintlify org | Local operator `.env` reads (search analytics exports) | Worker secret; sandbox binding; deploy/agent triggers without owner decision |

- The host reads `MINTLIFY_ASSISTANT_API_KEY` from the Worker env; a missing key returns `error`
  before any request. It never enters model code, catalog output, logs, or sandbox bindings.
- Raven does not call `POST /discovery/v1/assistant/{domain}/message` (consumes Mintlify credits).
  Any use or model-callable write is governed by [AGENTS.md "Hard rules"](../AGENTS.md#hard-rules).
- Automated sweeps must stay within Mintlify's 10,000 requests/org/hour limit, counting HTTP
  attempts (see Limits).

## Transport

Defined by the spec `backend` block: `POST https://api.mintlify.com` with
`Authorization: Bearer <MINTLIFY_ASSISTANT_API_KEY>` and JSON body `{ query, pageSize }` at
`/discovery/v1/search/stellardevelopmentfoundation` or `{ path }` (no leading slash) at
`/discovery/v1/page/stellardevelopmentfoundation` (`siteOrigin`: `https://developers.stellar.org`).
Single host, no host-health cache, no Mintlify SDK.

- **Retries.** Each lookup makes at most 2 HTTP attempts (`[8000, 12000]` ms). Retry once on
  network error, timeout, or 5xx; never retry 4xx (including `429`) or malformed JSON.
- **Budget.** Every lookup, `/index` retry, and redirect probe shares one `OPERATION_BUDGET_MS`
  (24,000 ms) deadline; each attempt clips to remaining time and skips if `< 500 ms` remains.
- **404.** Only `{"message":"No results found"}` (search) and `{"message":"Page not found"}` (page)
  mean absence. Any other `404` body (e.g., `No deployment related to <domain> exists`) returns
  `error` with `status: 404`.

## Operations

`specs/stellar-docs.json` defines 12 operations, each with a `mintlify` endpoint and path scope:

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
| `get_doc_page` | One page by `path` (page endpoint) |

Search operations accept `query`, `hitsPerPage` (1–20, default 5), and `includeContent`
(`search_doc_titles` omits `includeContent`; `search_docs` and `search_doc_titles` also accept
`includeMeetings`; `search_docs_in_category` requires `category`; `get_doc_page` accepts only
`path`). Schemas validate arguments before dispatch; catalog entries carry no runtime `auth` or
`cost`.

## Search

Every search sends `pageSize: 50`. Because the API has no facets, scores, or counts (and `filter` /
`scoreThreshold` have no effect here), the adapter scopes results locally:

1. Start from the operation's `include` and `exclude` prefixes.
2. Apply matching `conditional` (`arg=value`) overrides (`null` clears a list).
3. Substitute `{category}` placeholders.

Prefixes match whole path segments (`/docs/tokens` excludes `/docs/tokens-legacy`); excludes beat
includes. `hitsPerPage` applies after filtering, so scoped operations see only candidates inside the
50-section window.

`search_doc_titles` keeps the first section per page and ranks by query terms in title, then path,
then upstream rank, without `content`. `includeContent: true` returns each matched section's full
Markdown with no extra request.

### Search output

Payload: `{ hits, candidates, pathFiltered? }` (`candidates` = pre-scope count; `pathFiltered: true`
when an `include` scope ran). Each hit is `{ url, path, title, section?, snippet, content? }`:

- `url` — site URL, adding `#<anchor>` only when the section starts with an H2–H6 ATX heading
  matching a unique rendered heading ID for that page in `src/adapters/stellar-docs-anchors.json`
  (backticks and zero-width spaces stripped; no extra fetch). Repeated/unknown headings, H1s, and
  unknown pages keep the page URL.
- `path` — site-relative path with leading slash and no `/index`.
- `title` — search metadata title, else final path segment.
- `section` — first ATX heading of the section, if any.
- `snippet` — ~300-character window centered on the first query term (drops leading heading and code
  fences; shrinks MDX tags like `<Tab title="x">` to attribute values outside code fences).
- `content` — only when `includeContent: true`; keeps MDX tags intact.

## Page retrieval

`get_doc_page` normalizes `path` (strips origin, query/fragment, trailing slash, `.md`/`.mdx`,
leading slashes) and queries the page endpoint:

- **Index pages.** A "Page not found" without `/index` retries `<path>/index`; any other failure
  returns `error`.
- **Moved pages.** If both lookups return "Page not found", the adapter sends one unauthenticated
  `GET https://developers.stellar.org/<path>` with `redirect: "manual"` (first attempt timeout, no
  retry; probe failure = no redirect). If 3xx `Location` stays on `https://developers.stellar.org`,
  starts with `/docs/` or `/meetings/`, and differs from `path`, it fetches that target (with the
  same `/index` retry) and returns the new `url` and `path`.
- Still missing → `soft-empty` (`status: 404`).

Result: `{ url, path, title, content }` (Markdown in on-page order; `title` from first H1 or final
path segment). `get_doc_page` cannot fetch arbitrary URLs and never returns the redirect probe body.

## Content cleanup

Every `content` and page body strips `theme={...}` from code-fence openings, resolves relative
Markdown links to absolute URLs (root-relative against `siteOrigin`; index-page links against the
page directory), and drops `.md`/`.mdx` and trailing `/index` suffixes. Absolute and `#fragment`
links stay unchanged.

## Result and absence semantics

Ok calls return `{ ok: true, data }` (dispatcher adds `asOf` and `asOfBasis: "observed"`; docs
operations use the `corpus`, `detail`, or `exact` lane, so ok hits carry no `caveat`). Failures
return `{ ok: false, error }` with `kind: "error" | "soft-empty"`.

Search returns `soft-empty` (with a broader-operation hint) when:

1. Upstream returns no sections (empty array or "No results found" `404`).
2. Zero candidates match the path scope (message states candidate count).
3. Zero in-scope sections contain a query term (3+ char words or words with a digit, minus
   stopwords; hyphenated tokens like `SEP-10` match whole and split; checks title, path, content).
   This guards against semantic search returning unrelated nearest sections.

What a result proves:

- `soft-empty` describes only this query, scope, and 50-section window—never corpus absence.
- Transport or credential `error` proves nothing about the corpus.
- Nonzero candidates require reading hit paths/snippets and calling `get_doc_page` for full pages.
- Report docs-scoped results at their scope; corroborate open-world identity/history negatives with
  broad exposed sources.

## Limits

| Limit | Value | Source |
| --- | --- | --- |
| Candidate window | 50 sections | `backend.candidateWindow` (`specs/stellar-docs.json`) |
| Hits per search | 1–20, default 5 | `hitsPerPage` schema |
| Snippet window | 300 chars | `SNIPPET_CHARS` (`src/adapters/stellar-docs.ts`) |
| HTTP attempts per lookup | 2 (`8,000 ms`, `12,000 ms`) | `backend.attemptTimeoutsMs` |
| Wall-clock budget per op | 24,000 ms (attempts + `/index` + probe) | `OPERATION_BUDGET_MS` (`src/adapters/types.ts`) |
| Max API requests per search | 2 (1 lookup) | `mintlifyRequest` |
| Max API requests per page read | 8 (up to 4 lookups: path, `/index`, redirect, `/index`) | `/index` + redirect follow |
| Site redirect probes per read | 1 (`8,000 ms`, no retry) | `siteRedirectPath` |
| Mintlify org rate limit | 10,000 requests/hour | Mintlify API reference |
| API error text cap | 1,024 chars | `MAX_ERROR_BODY_CHARS` |

## Maintenance

- **Content and ranking.** The Stellar docs team owns the Mintlify project; Raven has no write path.
  File wrong, stale, or missing pages against `stellar/stellar-docs` via
  [improvements-pipeline](../.agents/skills/improvements-pipeline/SKILL.md). Never fork docs content
  locally or add a second index without measured benefit justifying upkeep.
- **Search-mechanism changes.** Scope or guard changes require a measured win on a free, read-only
  retrieval A/B over golden docs pages using a general mechanism (no per-query/per-page exceptions).
- **Anchor index.** Run `npm run docs:anchors:build` after docs site updates (keyless; reads sitemap
  and rendered pages; atomic replace only if every page succeeds; unchanged capture keeps timestamp).
  `refresh.yml` runs it daily and reports anchor drift; Worker builds do not. A committed fixture
  pins rendered heading pairs across 11 pages.
- **Generated files.** Refresh scripts own `inventory/`; `specs/stellar-docs.json` owns mappings.
  Run adapter tests, regenerate catalog/spec, and run baseline gates after any mapping/schema edit.

Investigate runtime traffic via
[cloudflare-observability-review](../.agents/skills/cloudflare-observability-review/SKILL.md).
Dated probe notes in `research/` are not operating instructions.
