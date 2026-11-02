# Stellar Docs on Mintlify — migration research

_Measured 2026-11-02. Evidence comes from the public Mintlify API reference, live probes of
`developers.stellar.org`, its keyless public MCP server, and keyed REST probes with the assistant
key. Items still marked **open** need a later probe._

_Status, 2026-11-02 19:04 UTC: production reads Mintlify (PR #309, Worker version `358fd0f5`). The
`ALGOLIA_*_DOCS` Worker and GitHub secrets are deleted. Record:
[the migration ledger](../../.agents/rounds/2026-11-02-mintlify-migration.md#production-switch-over)._

## Trigger

On 2026-10-22 the Stellar docs team moved `developers.stellar.org` to Mintlify. They also stopped
the scheduled Algolia crawler runs. The DocSearch index `crawler_Stellar Docs - Docusaurus` still
serves queries, but it no longer updates. Every Raven `stellarDocs.*` operation reads that index,
so docs answers become stale as the Mintlify site changes. The owner has Admin access to the
Mintlify organization.

## What the live site shows (2026-11-02)

- Responses carry `x-mintlify-client-version` and Vercel headers. The site is Mintlify.
- URL paths are preserved. `/docs/build/smart-contracts/getting-started/storing-data` still
  resolves, and a `.md` suffix returns the page as `text/markdown`.
- `/llms.txt` and `/llms-full.txt` exist. `llms.txt` lists pages with titles and descriptions.
- A public, unauthenticated MCP server runs at `https://developers.stellar.org/mcp`
  (`/.well-known/mcp.json`). It has two tools: `search_stellar_developer_docs` (query only) and
  `query_docs_filesystem_stellar_developer_docs` (read-only `rg`/`cat`/`tree` over a virtual
  filesystem of `.mdx` pages and OpenAPI specs).
- The virtual filesystem holds 973 `.mdx` pages: 881 under `/docs` and 92 under `/meetings`
  (2024-01 to 2026-10). OpenAPI specs for Horizon, Anchor Platform, and SDP are mounted under
  `/openapi`.
- Every URL prefix in the authored category operations exists on Mintlify, including
  `/docs/build/guides/{tokens,rpc,dapps,freighter}`, `/docs/tools/cli/agent-cli`, and the
  `/docs/learn/fundamentals/{anchors,stellar-ecosystem-proposals}` pages.
- The RPC method reference pages are now pages (`/docs/data/apis/rpc/api-reference/methods/getEvents`
  and others). The Algolia index never held them (`sd-003`). Re-probe `sd-003` after the cutover.

## Mintlify API surface

Two key types exist. Keys are created on `https://app.mintlify.com/settings/organization/api-keys`.

| Key | Prefix | Scope | Raven use |
| --- | --- | --- | --- |
| Assistant | `mint_dsc_` | Project-scoped. Search, page content, assistant messages. | Runtime host secret. |
| Admin | `mint_` | Org-scoped. Deploy triggers, agent jobs, analytics exports. Optional `read`/`write` scope. | Maintenance only (search analytics). Never a runtime or sandbox binding. |

Runtime endpoints (base `https://api.mintlify.com/discovery`, `Authorization: Bearer <assistant key>`):

- `POST /v1/search/{domain}` — body `{ query, pageSize (1–50, default 10), scoreThreshold (0–1),
  filter: { version, language, tag, groups } }`. Returns an array of `{ content, path, metadata }`.
  Semantic plus keyword search. No credit cost.
- `POST /v1/page/{domain}` — body `{ path }`. Returns `{ path, content }`, the full page text.
  No credit cost.
- `POST /v1/assistant/{domain}/message` — consumes credits. Out of scope: it is a paid model
  operation and needs the host-side approval and budget gate first.

`{domain}` is `stellardevelopmentfoundation` (from
`app.mintlify.com/stellardevelopmentfoundation/stellardevelopmentfoundation`). The dashboard's
"Project ID" (a 24-character hex value) returns `404` on the discovery endpoints; the admin
analytics endpoints take that project ID instead.

Rate limit: 10,000 requests per organization per hour for search and page content. **Open:**
whether the public site search and the public MCP server count against that organization limit.

Status semantics that differ from Algolia:

- The reference says `404` on search can mean "the search returned no results". In practice the
  search never returned an empty set: a nonsense query (`zzqxjvw flurbnog quixotic`) returned 5
  confident-looking hits. See "Relevance and absence" below.
- `404` on page content returns `{"message":"Page not found"}` for a missing page. The `path` must
  have no leading slash: `/docs/...` returns `404`, `docs/...` returns `200`.
- An invalid key returns `401` with `{"error":"Unauthorized"}`.
- The `404` bodies differ by cause (probed 2026-11-02). An empty `query` returns
  `{"message":"No results found"}`. An unknown subdomain returns
  `{"error":"No deployment related to <domain> exists"}` on both endpoints. The adapter treats
  only the two `message` forms as absence; any other `404` is an error.
- `403` covers wrong project, plan without assistant API access, and IP allowlist rejection.
- `500` is the only documented retryable status. There is one host, so the Algolia four-host
  ladder does not carry over.

## Result shape (keyed REST probes)

- Search returns a bare array of `{ path, content, metadata: { title } }`. `metadata` held only
  `title` in every probe. There is no score, anchor, breadcrumb, hit count, or page count.
- `path` has no leading slash and no anchor (`docs/build/smart-contracts/getting-started/storing-data`,
  `meetings/2026/09/17/protocol`). The public MCP's links do carry anchors, so the REST shape is
  thinner than the MCP shape.
- `content` is a Markdown chunk, including code blocks. Chunk sizes vary widely: most were
  0.3–2.5 KB, but one `getTransactions` chunk was 20 KB. The adapter needs a size bound or a
  snippet projection.
- The same page can appear several times in one result set (one hit per chunk).
- `pageSize: 50` returned 50 hits. `pageSize: 51` returned `200`, not the documented `400`.
- Page content returns `{ path, content }`. `content` is the page Markdown with its H1 title and
  description, for example 8,578 characters for `storing-data`.

## Relevance and absence

- `scoreThreshold` from 0.3 to 0.99 did not change any result set, including the nonsense query.
- `filter.tag`, `filter.version`, and `filter.language` with arbitrary values did not change the
  result set. The site defines no versions, languages, or tags, so these filters give no meetings
  isolation. Meetings must be selected or excluded by `path` prefix.
- Consequence: the current `soft-empty` contract ("no usable matches") cannot fire from the
  service alone. A semantic engine always returns its nearest chunks. The adapter needs a general
  relevance guard (for example, query-term evidence in title, path, or content) before a result
  set can count as a match, or the operation contract must say that results are nearest
  neighbours, not matches. Decide this with the A/B, not by assumption.

## Latency

Nine typical queries took 0.45–0.65 s end to end from a laptop. One meetings query took 16.0 s;
an immediate repeat of similar queries took about 0.6 s. The single host means no host ladder, so
the adapter needs one timeout with a bounded retry on `5xx`, network failure, and timeout.

## Early quality signals (single probes, not an A/B)

- `stellar cli install command` ranks `docs/tools/cli/install-cli` first with no rule. The Algolia
  rule `raven-promote-stellar-cli-install` existed only because Algolia lost that page from the top
  5. The rule canary has no Mintlify counterpart to guard.
- `getTransactions limit parameter maximum` ranks the RPC method page
  `docs/data/apis/rpc/api-reference/methods/getTransactions` first. This is the `sd-003` gap.
- `Protocol 24` still returns software versions, audits, and SEP-24 pages first (`sd-001`
  persists in a different form).

## Mapping the 12 operations

| Algolia operation | Mintlify mechanism | Notes |
| --- | --- | --- |
| `search_docs` | `/v1/search` | Exclude `/meetings` by path unless `includeMeetings`. `hitsPerPage` → `pageSize`. Algolia `page` has no Mintlify equivalent. |
| `search_doc_titles` | No attribute restriction in the API. | Candidates: drop it, or serve titles from an `llms.txt`-derived inventory. Decide by measurement. |
| `search_docs_in_category` and the 7 intent category operations | `/v1/search` with `pageSize: 50`, then the existing URL-prefix client filter on `path`. | Same window caveat as today. The window is 50, not 100. |
| `search_meeting_notes` | `/v1/search`, keep `meetings/` paths. | No filter isolates meetings (measured). Over-fetch and filter by path. |
| `get_doc_page_sections` | `/v1/page` | Returns the whole page, so the derived-query and title-pagination logic goes away. This should also close the table-row-loss TODO. The operation may want a new name and output shape (forward-only). |

Fields that disappear: `nbHits`, `nbPages`, `page`, `type`, `hierarchy`/`breadcrumb`, Algolia
snippet highlighting, and the `clientFiltered` count caveat in its current form.

## Repository surfaces that change

- Runtime: `src/adapters/stellar-docs.ts`, `specs/stellar-docs.json` (backend and per-operation
  mappings), `scripts/build-catalog.mjs` (`transport.type`), `env.d.ts`, `wrangler.jsonc` comment.
- Secrets: `MINTLIFY_ASSISTANT_API_KEY` is the runtime host secret. It was created on 2026-11-02
  with no expiry and no IP allowlist (Workers have no fixed egress address). It was uploaded to the
  production Worker on 2026-11-02 (version `ce0c55ac`, same code as `ea5c6e90`). No code reads it
  yet. `MINTLIFY_ADMIN_API_KEY` (read and write, expires 2027-01-31) is local maintenance only, for
  analytics exports; it must never become a Worker or sandbox binding. The `ALGOLIA_*_DOCS` pair
  retires after cutover. The
  `_SITE` pair belongs to the dormant `stellarOrg` spec (stellar.org, not on Mintlify) and is
  unaffected.
- Inventory and drift: `scripts/refresh-inventory.mjs` (settings snapshot and the title inventory
  that feeds routing vocabulary — `llms.txt` is a keyless candidate source),
  `scripts/summarize-live-drift.mjs`, `.github/workflows/refresh.yml`.
- Retire with the index: `scripts/check-algolia-rule-canary.mjs` (the
  `raven-promote-stellar-cli-install` rule has no Mintlify equivalent; measure whether install
  intent still ranks the install page), `scripts/eval-algolia-raven.mjs` (keep its pattern for the
  Algolia-versus-Mintlify A/B, then retire).
- Tests: `test/adapters.test.ts`, `test/algolia-rule-canary.test.mjs`,
  `test/eval-algolia-raven.test.ts`, `test/policy.test.ts`, `test/catalog.test.ts`, and CI's
  placeholder `.dev.vars` line.
- Docs: `docs/stellar-docs.md` (rewrite), `ARCHITECTURE.md`, `README.md`, `PLAN.md`,
  `inventory/README.md`.
- Routing: the catalog descriptions and title vocabulary change, so `npm run eval:routing -- --gate`
  must pass, and the QA docs goldens need a measurement before the cutover ships.

## Rejected path: the public MCP server as the runtime backend

The public MCP server needs no key and exposes a richer filesystem tool. Raven still uses the REST
API: `docs/stellar-docs.md` forbids runtime routing through an external MCP server, the REST API
has a documented contract and rate limit, and the host keeps a credentialed, attributable
transport. The public MCP server stays a research and comparison instrument.

## Retrieval A/B and Mintlify-side asks (2026-11-02)

The adapter-level A/B over 255 golden cases and 1,498 queries favors Mintlify. Mean golden-page
recall rose from 0.614 to 0.787, and soft-empty results fell from 80 to 6. The numbers, method,
and per-case rows are in
[the round ledger](../../.agents/rounds/2026-11-02-mintlify-migration.md).

These Mintlify API limits cost Raven quality. They are requests for the Mintlify project owner,
not docs-content defects, so they are not `improvements/` findings:

- **`<ResponseField>` text.** Search rarely returns text inside `<ResponseField>` components. On the
  93 files that use them, a sentence from inside a ResponseField finds its own page in the top 5 for
  8 of 90 pages; a prose sentence does so for 50 of 84. Horizon string codes such as
  `op_bad_signer` never reach the 50 candidates. This caused the one backend-attributable answer
  regression in the 2026-11-02 QA diagnostic. Finding: `improvements/stellar-docs/sd-059-*`.
- **Section anchors.** A search chunk has a page path but no heading anchor. Agents cannot cite the
  matched section.
- **A relevance signal.** The search returns no score, and `scoreThreshold` changes nothing. The
  adapter must infer "no match" from query terms.
- **Tail latency.** Over the A/B, p50 was 493 ms, p95 1,735 ms, and p99 3,717 ms. Four of 1,498
  requests exceeded 8,000 ms on the first attempt. Algolia's p99 was 320 ms.
- **Server-side scoping.** `filter.version`, `filter.language`, and `filter.tag` have no effect.
  Path filtering happens after a 50-section window, so narrow operations can lose matches that
  rank below the window.
- **Redirects.** The page endpoint returns 404 for a moved page. The site serves a 308. The
  adapter now follows one same-origin redirect itself.
