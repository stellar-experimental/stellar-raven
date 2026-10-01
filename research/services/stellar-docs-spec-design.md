# stellar-docs spec design — `specs/stellar-docs.json`

_Lane D (todo 796), authored 2026-07-02. All measurements live against Algolia app
`VNSJF5AWIZ`, index `crawler_Stellar Docs - Docusaurus` on 2026-07-02. Companion to
`research/services/stellar-docs-algolia.md` (index mechanics); this doc covers **why the spec
looks the way it does** and how Wave 2 should consume it._

## 1. The problem being fixed

Baseline routing (eval/README.md): stellarDocs top-5 = **1.1%** despite 183 of 338 golden
cases being docs questions. Structural cause: the catalog has 359 entries but stellarDocs is
**one** entry (`stellarDocs.search_docs`), so on lexical scoring a docs question has exactly one
chance to land in the top 5 against ~100 skill sections and ~40 service ops whose descriptions
happen to share tokens like "stellar", "contract", "asset".

The scorer (`src/catalog/vendor/search-scoring.ts`, vendored codemode `searchConnectors`) ranks
on **id (w=12), name (w=10), service (w=8), description (w=5), kind (w=2)** with a coverage gate
(≥60% of query tokens must match somewhere for >2-token queries). Two levers follow directly:

1. **More docs entries** — each intent-named operation is an independent chance to rank.
2. **Vocabulary placement** — golden-question terms in the **op name/id** earn 10–12× weight
   vs 5× in the description; descriptions must still carry broad vocabulary to pass the
   coverage gate on long natural-language questions (including function words — "how do I",
   "what is", "which" — because the gate counts every query token).

This mirrors the codemode `OpenApiConnector` philosophy ([research/codemode.md](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/research/codemode.md) §5): a service is
not one generic tool but **one typed operation per intent**, with the spec itself as greppable
data. Lumenloop/stellar-light get this for free from their OpenAPI specs; the docs corpus has no
spec, so we author one.

## 2. Measured taxonomy (what the index actually contains)

Method: empty-query facet counts + a full dump of all **631** `type:lvl1` (page-title) records
(they fit in one `hitsPerPage:1000` request), aggregated client-side by URL path. Key numbers:

- 12,867 raw section records → 3,808 distinct URL groups → 631 page-title records.
- Facets that exist: `type` (content 6415, lvl2 2953, lvl3 1520, lvl5 925, lvl1 631, lvl4 423),
  `docusaurus_tag` (docs-default-current 11,784; default/blog_* ≈ 1,083 = the /meetings slice),
  `lang`/`language` (en only), `version` (current only).
- **`hierarchy.lvl0` is the sidebar section title, not the site category** ("Documentation" 111,
  "Admin Guide" 58 — repeats across unrelated areas). It is searchable but **not facetable**.
  The stable category taxonomy is the **URL path prefix**:

| category | pages | contents |
|---|---|---|
| /docs/build | 189 | guides 97 (transactions 17, testing 13, conventions 9, freighter 8, dapps 7, archival 6, storage 6, …), apps 42 (wallet 10, tutorials 15, guestbook/passkeys 7), smart-contracts 34 (example-contracts 25), security 7, agentic-payments 7 |
| /docs/data | 131 | apis 65 (horizon 49, rpc 14, migrate 1), indexers 32, analytics/Hubble 31, oracles 2 |
| /docs/tools | 88 | cli 24, lab 20, quickstart 19, developer-tools 13, sdks 4, … |
| /docs/learn | 58 | fundamentals 45 (contract-development 23, data structures 6, transactions 5, SCP/lumens/SEPs/fees/liquidity 1 each), migrate-from-EVM 8, interactive 4, glossary 1 |
| /docs/platforms | 51 | anchor-platform 28 (SEP-6/24/31 guides), stellar-disbursement-platform 22 |
| /docs/validators | 16 | admin-guide 14, tier-1-orgs 1 |
| /docs/tokens | 9 | one page each: issue-an-asset, anatomy, access-control/clawback, SAC, token-interface, toml, cross-chain, quickstart |
| /docs/networks | 2 | resource-limits-fees |
| /meetings | 85 | protocol & developers meeting notes 2024–2026 + tag/author listing pages |

**Critical honesty finding:** the auto-generated per-method RPC reference pages
(`/docs/data/apis/rpc/api-reference/methods/getLedgerEntries` …) and per-endpoint Horizon
reference pages are **not crawled**. Only hand-written structure/errors/admin pages are indexed;
method how-tos live under `/docs/build/guides/rpc` and `/docs/build/guides/transactions`
(e.g. `simulateTransaction-Deep-Dive`). The rpc/horizon op's description says so.

## 3. Golden-question vocabulary (what descriptions must speak)

From the 183 stellarDocs cases in `eval/routing-cases.json` (all mapped to card
`stellar_docs_mcp`): top content terms after stopwording — stellar 136, contract 51, soroban 47,
protocol 28, asset 25, anchor 20, wallet 18, rpc 16, sep 14, version 13, ledger 11, cap 10,
testnet 10, sdk 9, classic 9, network 9, platform 8, account 8, token 8, smart 8, regulated 8,
transaction 8, horizon 7, clawback 7, wallets 7, issuer 6, deployed 6, authorization 5,
deposit 5, futurenet 5, cli 5, storage 5, disbursement 4, trustline 4, fee 4, sac 4, kyc 4,
payments 4, deploy 4, issuing 4.

Question style is natural prose ("How do I…", "What is…", "Which SEP…", "Should I…",
"When did…"), so descriptions are written as prose that names the real page/topic nouns above —
not keyword lists — and op **names** carry the heaviest terms
(`search_soroban_contract_docs`, `search_rpc_horizon_data_docs`, `search_anchor_sep_docs`,
`search_asset_token_docs`, `search_protocol_concepts_docs`, `search_sdk_cli_tools_docs`,
`search_wallet_dapp_docs`) because name/id fields score 2–2.4× description weight.

## 4. The 12 operations

Every op: `id` (`stellarDocs.<name>`), prose `description` in golden vocabulary naming its real
URL subtrees, `params` as a **complete JSON Schema object** (drop-in for
`CatalogEntry.inputSchema`), an `algolia` block (exact param mapping + fixed params +
`clientFilter` where the restriction is adapter-side), and a `verified` block with a live
query + hit counts + top hit (checked 2026-07-02).

| op | intent | server-side mechanics |
|---|---|---|
| `search_docs` | general search, whole corpus | facetFilter `docusaurus_tag:docs-default-current` (overridable via `includeMeetings`) |
| `search_doc_titles` | find the canonical page by its title | `restrictSearchableAttributes: hierarchy.lvl1–3` |
| `search_docs_in_category` | one category, enum of 9 REAL areas | docs facet + client URL-prefix filter (meetings → facet negation) |
| `get_doc_page_sections` | read a whole page by path | derived query from path slug, `distinct:0`, client filter `url_without_anchor ==` |
| `search_soroban_contract_docs` | Soroban/Rust contract dev | client prefixes: build/smart-contracts, build/guides, learn/…/contract-development, tools/cli |
| `search_asset_token_docs` | assets, trustlines, clawback, SAC, SEP-41 | prefixes: /docs/tokens, build/guides/tokens |
| `search_protocol_concepts_docs` | ledgers, accounts, fees, SCP, SEPs, lumens | prefixes: /docs/learn, /docs/networks |
| `search_rpc_horizon_data_docs` | RPC, Horizon, Hubble, indexers | prefixes: /docs/data, build/guides/rpc |
| `search_anchor_sep_docs` | anchors, SEP-6/10/12/24/31/38, SDP | prefixes: /docs/platforms, learn/…/anchors, learn/…/stellar-ecosystem-proposals |
| `search_sdk_cli_tools_docs` | SDKs, Stellar CLI, Lab, Quickstart | prefix: /docs/tools |
| `search_wallet_dapp_docs` | wallets, dapps, passkeys, Freighter | prefixes: build/apps, build/guides/dapps, build/guides/freighter |
| `search_meeting_notes` | protocol/dev meeting notes, CAP votes | facet **negation** `docusaurus_tag:-docs-default-current` (verified: all hits under /meetings) |

Themed ops deliberately **overlap** in URL coverage (e.g. build/guides appears in both the
soroban and wallet ops) — overlap costs nothing at search time and each op is an independent
routing surface.

### The clientFilter mechanism (and why it is honest)

`hierarchy.lvl0` facetFilters silently return 0 hits and URL is not a facet, so category/URL
scoping **cannot** be done server-side. The `algolia.clientFilter` block records exactly what the
execute adapter must do: over-fetch (`hitsPerPage: 100` — verified necessary: "clawback" in
category `tokens` finds 0 of its 7 target hits in the first 30 but 7 in the first 100), keep hits
whose `url_without_anchor` starts with a listed prefix, truncate to the caller's `hitsPerPage`.
Every clientFilter op was verified live with this exact procedure (counts in each op's
`verified`).

## 5. Verification results (all live, 2026-07-02)

| op | verified query | result |
|---|---|---|
| search_docs | "establish a trustline" | 23 hits, top = /docs/tokens/how-to-issue-an-asset |
| search_doc_titles | "state archival" | 47 hits, top = learn/…/storage/state-archival |
| search_docs_in_category | "clawback" @ tokens | 110 raw → 7 filtered, top = /docs/tokens/control-asset-access |
| get_doc_page_sections | storing-data page | 21 sections recovered of the exact page |
| search_soroban_contract_docs | "persistent storage ttl archived" | 20 raw → 20 filtered, top = state-archival |
| search_asset_token_docs | "issue an asset" | 93 raw → 24 filtered, top = how-to-issue-an-asset |
| search_protocol_concepts_docs | "stellar consensus protocol" | 26 raw → 20 filtered, top = …/stellar-consensus-protocol |
| search_rpc_horizon_data_docs | "getLedgerEntries" | 11 raw → 6 filtered (Hubble how-to; method ref pages not indexed — documented) |
| search_anchor_sep_docs | "SEP-24 hosted deposit withdrawal" | 96 raw → 17 filtered, top = learn/…/anchors |
| search_sdk_cli_tools_docs | "stellar cli contract deploy" | 68 raw → 14 filtered, top = tools/cli/cookbook/deploy-contract |
| search_wallet_dapp_docs | "build a wallet" | 123 raw → 30 filtered, top = build/apps/wallet/stellar |
| search_meeting_notes | "protocol upgrade vote" | 10 hits, 100% under /meetings (facet negation works) |

## 6. Rejected alternatives

- **One entry per docs page (631+ entries).** Rejected: floods the catalog (631 ≫ the 359
  current entries combined), makes docs *dominate* every query instead of competing fairly,
  puts page titles (often generic: "Running", "Overview", "Prerequisites") into the scored id
  space where they'd mis-rank, and turns every crawler re-run into a huge catalog diff. The
  taxonomy block gives Wave 2 the option of a *bounded* variant (one entry per category, 9
  entries) without committing to it.
- **OpenAPI document.** Rejected: there is no HTTP API of ours to describe — one Algolia
  endpoint with ~8 interesting params. Forcing 12 intents into `paths` objects buries the two
  things our pipeline actually consumes (description text and param schema) under OpenAPI
  ceremony. The chosen format IS the catalog-entry shape plus an execute-mapping block —
  spec-as-data in the codemode sense (the openapi example greps the spec; ours is directly
  `JSON.parse`-able into entries).
- **Server-side category filtering via `hierarchy.lvl0` facetFilters.** Impossible — lvl0 not
  facetable (silent 0 hits); measured, documented in `backend.constraints`.
- **Per-SEP / per-RPC-method operations.** Rejected for honesty: individual SEP specs live on
  GitHub (stellar-protocol), not in this index; per-method RPC reference pages are not crawled.
  Claiming `getRpcMethodReference` would fabricate a capability the index cannot serve.
- **A `tags`/`version` facet surface.** Useless — `lang`/`language`/`version` are single-valued
  (en / current) on this corpus.

## 7. Implemented Wave 2 mapping: ops → catalog entries

1. **One CatalogEntry per operation** (12 shipped `stellarDocs` entries): `id`, `description`
   verbatim; `inputSchema` = the op's `params` object as-is (already a valid JSON Schema);
   `outputSchema: null` (the `returns` string can be appended to the description if wanted);
   `kind: "operation"`, `service: "stellarDocs"`, `auth`/`cost` from `catalogHints`.
2. **Transport**: merge `backend` (hosts, endpoint, retry, index) with the op's `algolia` block
   (paramMap, fixedParams, conditionalParams, clientFilter, derivedQuery). The clientFilter is
   part of transport data, not a search-time concern.
3. **Provenance**: `source` from `catalogHints.provenanceSource`, `fetchedAt` from the spec's
   `authoredAt`; add `note: "authored spec specs/stellar-docs.json"` so drift is attributable.
4. **Optional enrichment**: `taxonomy.categories[*]` can seed 9 additional per-category entries
   (id like `stellarDocs.category.build`) if eval shows headroom — but measure first; the 12 ops
   already cover every category with heavier-weighted vocabulary.
5. **Do not** drop `search_docs` or rename existing ids blindly — the card normalizer
   (eval/lib/grade.mjs) matches `stellar_docs_mcp` per rule 2/3 (service-prefix match), and all
   12 ops keep service `stellarDocs`, so every op counts as a correct route for the 183 cases.
6. **Refresh**: re-run the taxonomy probes (spec §taxonomy.method; script fragments in
   stellar-docs-algolia.md §Refresh probes) when `scripts/refresh-inventory.mjs` runs; drift
   markers = facet value set change, category page-count swing > 20%, `type:lvl1` count leaving
   the 500–800 band (breaks the one-request dump assumption at 1000).

## 8. Open risks

- The `verified.nbHits` values will drift with the daily crawl — they document that the query
  *worked*, not a contract on counts.
- `get_doc_page_sections`' derived-query trick depends on the page slug appearing in its own
  content/headings; the spec documents a two-segment fallback and a "zero after fallback = not
  indexed" semantic.
- Meeting-notes negation (`docusaurus_tag:-docs-default-current`) also matches the 4
  `blog_tags_list` listing pages — harmless noise, ranked below real posts.
