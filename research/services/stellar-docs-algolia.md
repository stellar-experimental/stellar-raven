# Stellar Docs — direct Algolia REST Search API (primary integration)

_Measured live on **2026-07-01** with raw curl probes using the dedicated search key in
`.env`. This doc supersedes the MCP path in `stellar-docs-mcp.md` (retained as fallback). For
the authored spec built on top of this index — why it looks the way it does — see
[`stellar-docs-spec-design.md`](./stellar-docs-spec-design.md) (design record; the 12 ops shipped)._

> **2026-07-09 update — crawler v15, the CLI rule, and the rejected markdown index.**
> The production DocSearch crawler config was fixed (v15) to index **code-block text**, which
> had been silently stripped (resolved finding `sd-006`; durable receipt in
> `improvements/resolved.json`, live-verified:
> `brew install stellar-cli` / `curl install.sh` / winget / cargo command text is searchable
> and `/docs/tools/cli/install-cli` ranks #1 for exact-command queries). This was a *general*
> fix with measured collateral improvement (`sd-003` partially mitigated: the RPC admin-guide
> page now surfaces getTransactions limits, though generated API-reference method pages remain
> unindexed). One narrow Algolia **rule stays live and load-bearing**:
> `raven-promote-stellar-cli-install` — measured with `enableRules:false`, broad install-intent
> phrasings ("stellar cli install command") lose the install page from top-5 without it; exact
> package-manager commands rank #1 from the crawler fix alone. Policy: no further single-page
> rules/synonyms — general mechanisms only (run-evals Step 5).
> A second **`crawler_markdown-index`** and a `search_markdown_docs` op were prototyped,
> measured with the live A/B harness `scripts/eval-algolia-raven.mjs` (`npm run
> eval:algolia-raven`, merged via PR #15), and **rejected**: zero wins against the post-v15
> primary index across the harness cases, so the op was removed pre-merge and the second index
> is not consumed (a second crawler = standing drift/maintenance surface with no measured win).
> The harness is retained as the instrument for any future Algolia-strategy comparison.
> Known residual gaps (live-probed 2026-07-09): bare "Protocol 24" still returns SEP-24 pages
> (`sd-001`); AP2/ACP agentic-payments positioning remains a corpus/content gap (`sd-005`).
> Evidence trail: improvements/stellar-docs/* dated 2026-07-09, PRs #15/#16.

## Overview

The Stellar developer docs (`developers.stellar.org` — docs + blog + meeting notes) are indexed by
the Algolia **DocSearch crawler** into app `VNSJF5AWIZ`, primary index
**`crawler_Stellar Docs - Docusaurus`** (12,867 records, ~12.9 MB, updated daily — `updatedAt`
observed `2026-07-01T12:17:18Z`). One record = one page **section/anchor**, not a whole page;
`distinct: true` on `url` groups results back to ~3,808 distinct URLs. A replica
`docs_replica_agent` exists (serves the Algolia MCP endpoint) with **byte-identical settings**.

We talk to the Algolia Search REST API directly from a Cloudflare Workers adapter. This is
strictly more expressive than the MCP tool (full search params, no fake-required analytics args,
no SSE/double-JSON parsing, `processingTimeMS` present) and equally fast.

## Auth + env vars

Two tiers now live in `.env`. The **read/search key** (`ALGOLIA_API_KEY_DOCS`) powers the runtime
gateway and is mirrored to Worker secrets. The **operator credentials** (write / crawler /
analytics / usage / monitoring) are new as of 2026-07-09 and are for the maintenance and
improvements loop — scripts and agents acting on the shared docs corpus — **not** the `execute`
sandbox (see "Operator write/crawler/analytics surface" below). **Every one of these is a secret:
never print, echo, or commit any Algolia key** (`npm run secrets:scan` covers them).

| Env var | Value | Tier | Notes |
| --- | --- | --- | --- |
| `ALGOLIA_APPLICATION_ID_DOCS` | `VNSJF5AWIZ` | public | appears in hostnames; safe to log |
| `ALGOLIA_API_KEY_DOCS` | (secret) | read | dedicated search key; runtime + Worker secret |
| `ALGOLIA_DOCS_INDEX` | `crawler_Stellar Docs - Docusaurus` | — | suggested env var; note the literal spaces |
| `ALGOLIA_WRITE_API_KEY` | (secret) | operator write | index records + settings + rules + synonyms |
| `ALGOLIA_CRAWLER_USER_ID` / `ALGOLIA_CRAWLER_API_KEY` | (secret) | operator crawler | Crawler Admin API (config, reindex, task status) |
| `ALGOLIA_ANALYTICS_API_KEY` | (secret) | operator read | Search Analytics API (top/no-result queries) |
| `ALGOLIA_USAGE_API_KEY` | (secret) | operator read | account usage/operations metering |
| `ALGOLIA_MONITORING_API_KEY` | (secret) | operator read | infra/latency/incident monitoring |

Read-key introspection (`GET /1/keys/$ALGOLIA_API_KEY_DOCS`, verified live): `acl: ["search",
"listIndexes", "settings"]`, `validity: 0` (never expires), created 2022-10, **no index
restriction, no rate cap, no referer/IP restriction, no forced query params**. It can query both
the primary and the replica, list every index on the app, and read index settings. (The app is
down to **2 indexes** as of 2026-07-09 — the primary `crawler_Stellar Docs - Docusaurus` plus its
`docs_replica_agent`, both ~13,064 raw records after that day's crawl — following the
`crawler_markdown-index` retirement recorded below; earlier snapshots listed 6.)

**Operator-key ACLs — introspected live 2026-07-09** (`GET /1/keys/{self}` for the app keys;
Monitoring/Crawler probed against their own APIs). Values redacted; `validity: 0` (never expire)
on every app key:

| Key | Verified scope |
| --- | --- |
| `ALGOLIA_WRITE_API_KEY` | `acl: [search, browse, seeUnretrievableAttributes, listIndexes, analytics, logs, addObject, deleteObject, deleteIndex, settings, editSettings]` — full index CRUD: **add/delete records** (`addObject`/`deleteObject`), **edit settings + rules + synonyms** (`editSettings`), **delete whole indexes** (`deleteIndex`), `browse`, read analytics/logs. **No `admin` ACL** — it cannot create or manage API keys (good: the highest-blast-radius capability is absent). |
| `ALGOLIA_ANALYTICS_API_KEY` | `acl: [listIndexes, analytics]` — read-only Search Analytics. |
| `ALGOLIA_USAGE_API_KEY` | `acl: [usage, logs]` — account usage metering + logs. |
| `ALGOLIA_MONITORING_API_KEY` | **Not an app key** — 403 on `/1/keys` (app `VNSJF5AWIZ`). It authenticates against the Monitoring API (`status.algolia.com`): verified `200` on `GET /1/inventory/servers` → cluster `c15-usw`, 3 servers. Account/cluster-scoped monitoring read. |
| `ALGOLIA_CRAWLER_USER_ID` + `ALGOLIA_CRAWLER_API_KEY` | Crawler Admin API Basic auth (`crawler.algolia.com/api/1`). Verified list + detail + `?withConfig=true` read on the **single** crawler visible to it: **"Stellar Docs"** (`id 79c5d36e-ce6e-4ec3-bed3-04a30818122d`), `indexPrefix: "crawler_"`, `startUrls: [developers.stellar.org]`, `rateLimit: 8`, `schedule: "every 1 day at 12:00 am"`. Config read includes `apiKey` (the write key, embedded) — **never dump the raw config**. |

For comparison, the read key stays `acl: [search, listIndexes, settings]`.

**`crawler_markdown-index` fully retired — first exercise of the write/crawler lever (2026-07-09).**
Introspection caught the tail of the earlier rejection: the index `crawler_markdown-index` had been
deleted, but the crawler config still declared **two actions** (`Stellar Docs - Docusaurus` **and
`markdown-index`**), so the next daily 12:00am crawl would have silently recreated it — index
deletion and crawler-action removal are two separate steps. We closed the loop by `PATCH
/api/1/crawlers/{id}/config` with an `actions`-only body keeping just the Docusaurus action
(`taskId` returned, `200`); re-read confirmed `actionIndexNames: ["Stellar Docs - Docusaurus"]` with
all other config keys intact. The index list is now the primary + `docs_replica_agent` only. This is
the canonical low-risk pattern for the lever: it *removed* an already-rejected surface rather than
adding a mechanism, was reversible (full config retained), and every step was verified. The local
A/B harness (`scripts/eval-algolia-raven.mjs`) was cleaned of its now-dead `markdown-default`
strategy in the same pass.

### 2026-08-25 — crawler extractor: degrade an over-cap page instead of dropping it (`sd-001`)

Second exercise of the crawler lever, after the `crawler_markdown-index` removal. This one *added*
a mechanism, so it carried a higher bar than that precedent.

**Defect.** `POST /api/1/crawlers/{id}/test` on
`https://developers.stellar.org/docs/networks/software-versions` returned
`extracted_too_many_records` — "Extractors returned 1319 records, the maximum is 750". A page over
that cap yields **zero** records and is dropped whole, silently. The count came from
`lvl5: "article td:first-child"` and `content: "article td:last-child"`, which make one record per
table row; the page carries nine protocol sections each with a software-version table. The config
exposes no per-page record limit, so 750 is a platform cap and cannot be raised.

**Change.** The extractor now builds with the table selectors, and if that exceeds 750, rebuilds at
heading granularity (no `td` selectors) and truncates only if still over. Pages under the cap are
untouched, so the change is zero-regression by construction and general — it repairs any over-cap
page, present or future, rather than naming one.

**Evidence before the write** (crawler `test` endpoint with a `config` override — production
untouched): software-versions 0 → 242 records; `/docs/networks/audits` 3 → 3;
`/docs/tools/cli/install-cli` 10 → 10.

**Applied.** `PATCH /config` actions-only body, `taskId db13b3bf-65de-4656-bcd2-b6b30446bd5d`;
`POST /urls/crawl` for the page, `taskId a7f8bafe-9876-4016-b6e6-54aacf6774d2`. Re-read confirmed
every other config key byte-identical, one action, `indexName` and `pathsToMatch` preserved.

**Live result.** `Protocol 22`, `Protocol 23`, `Protocol 24`, `Protocol 24 release`, and
`software versions` all return the correct anchor at rank 1, in the primary index and in
`docs_replica_agent`. Canaries held: `stellar cli install command` and `brew install stellar-cli`
still rank `/docs/tools/cli/install-cli` #1, so `raven-promote-stellar-cli-install` is intact.

**Known displacement.** `Protocol 24 Whisk state archival` no longer returns `/meetings/2025/10/16`
in the top 20 of the general lane; `search_meeting_notes` still returns it at rank 1. The QA case
`q-protocol-24-whisk-incident` needs a `golden-truth` re-check.

**Rollback.** Restore the previous extractor by `PATCH /config` with an actions-only body carrying
`indexName: "Stellar Docs - Docusaurus"`, `pathsToMatch: ["https://developers.stellar.org/**"]`,
and this exact prior source:

```js
({ $, helpers }) => {
        $(".admonition").remove();
        $(".tabs-container").remove();

        const lvl0 =
          $(
            ".menu__link.menu__link--sublist.menu__link--active, .navbar__item.navbar__link--active",
          )
            .last()
            .text() || "Documentation";
        return helpers.docsearch({
          recordProps: {
            lvl0: {
              selectors: "",
              defaultValue: lvl0,
            },
            lvl1: ["header h1", "article h1"],
            lvl2: "article h2",
            lvl3: "article h3",
            lvl4: "article h4",
            lvl5: "article h5, article td:first-child",
            lvl6: "article h6",
            content: "article p, article li, article td:last-child, article pre code",
          },
          aggregateContent: true,
          recordVersion: "v3",
        });
      }
```

Never paste a full config read into a commit or a terminal transcript: it embeds the write key.

## Operator write/crawler/analytics surface (new 2026-07-09 — handle with caution)

We can now *modify* the Stellar Docs Algolia app, not just read it. This is a **shared production
corpus** that also serves the real DocSearch frontend — it is not our worker's private data — so
the bar is higher than for anything we own, and the caution the rest of this project applies to
side-effecting operations applies here in full.

Risk ladder — pick the lowest rung that closes the gap:

1. **Analytics / usage / monitoring reads (low risk, pure evidence).** Real user query streams,
   no-result queries, and traffic/latency are direct evidence for `improvements/` findings and
   the discovery-redesign work — they quantify prevalence (which the eval corpus can only
   approximate) and surface content gaps we would otherwise never see. Prefer these first. Still
   send `analytics: false` on *our own* automated search traffic so we never pollute the very
   dashboards we read.
2. **Rules / synonyms / index settings writes (medium risk).** Possible now via
   `ALGOLIA_WRITE_API_KEY`, but the anti-overfitting policy is unchanged and binds harder because
   it is now easy to violate: **general mechanisms only, no per-page/per-query rules or synonyms**,
   and every change must show a measured win on the read-only A/B harness
   (`scripts/eval-algolia-raven.mjs`, `npm run eval:algolia-raven`) before it lands. The single
   load-bearing rule `raven-promote-stellar-cli-install` is the *ceiling* of what a single-target
   mechanism should look like, not a template to copy. A change that only helps its own test case
   stays unshipped.
3. **Index record writes / crawler config / reindex (highest risk).** These alter what the docs
   team's own crawler produces and what every DocSearch user sees. Forward-only does not mean
   careless: needs conviction or a golden/A/B win, and content-shaped fixes (a page is wrong,
   stale, or missing) still belong upstream in `stellar/stellar-docs` — coordinate rather than
   silently rewrite someone else's corpus. The rejected `crawler_markdown-index` (a second crawler
   with zero measured win = standing drift surface) is the cautionary precedent.

Guardrails that do **not** relax because we now have write access:
- The A/B harness (`scripts/eval-algolia-raven.mjs`) stays **read-only** — it never creates
  indexes, rules, synonyms, events, or crawler tasks. It is the measurement instrument for any
  write, kept separate from the write itself.
- Operator keys are host/script-side only. **Do not wire them into the `execute` sandbox** — a
  model-invokable Algolia write is a side-effecting op and would require the request-context
  approval/budget plumbing described in
  [`AGENTS.md` “Hard rules”](../../AGENTS.md#hard-rules) before it could ship, on top of the
  measured-win bar above.
- Secrets host-side only; never printed or committed.

### Load-bearing rule canary (2026-07-10)

The daily/maintenance guard is `npm run algolia:rule-canary`. It uses the dedicated
**search-only key** to run the shared CLI-install cases both with rules enabled and with
`enableRules:false`; every query sends `analytics:false` and `clickAnalytics:false`. The named
assertions require the canonical install page to rank first with rules and require that rules
materially improve its rank over the rules-disabled control. Assertion drift exits 1; request or
configuration errors exit 2. With no credentials, the default local invocation is explicitly
inconclusive and exits 0 without making a request; daily CI passes `--require-env` so missing
credentials fail closed.

This behavioral delta was chosen over a rule-metadata snapshot. Metadata inspection would put the
maintenance write key (the only current app key with `editSettings`) into daily CI and would prove
only that a named rule exists, not that it still changes retrieval. The search-only delta uses the
same low-privilege credential already required by inventory refresh and proves the load-bearing
effect directly. The canary engine is generic over case data; adding a future approved rule guard
adds cases and named invariants rather than query-specific control flow. This does not relax the
policy above: it is a read-only alarm, never an automated Algolia repair.

Headers on every request:

```
X-Algolia-Application-Id: $ALGOLIA_APPLICATION_ID_DOCS
X-Algolia-API-Key: $ALGOLIA_API_KEY_DOCS
Content-Type: application/json
```

(Query-string auth `?x-algolia-application-id=…&x-algolia-api-key=…` also works if headers are
awkward, but headers are preferred.)

## Endpoints + hosts + retry

### Endpoints (all verified live)

| Endpoint | Purpose |
| --- | --- |
| `POST /1/indexes/{index}/query` | single search; body = JSON search params |
| `POST /1/indexes/*/queries` | multi-query batch; body `{"requests":[{"indexName":"…","query":"…",…},…]}` — index names go **unencoded in the JSON body** |
| `GET  /1/indexes/{index}/settings` | index settings (key has `settings` ACL) |
| `GET  /1/indexes` | list indexes + entry counts (drift/corpus tracking) |
| `GET  /1/indexes/{index}?query=…&…` | GET-style search via URL params (works; POST preferred) |

**URL-encoding the index name**: spaces in the path must be `%20` →
`/1/indexes/crawler_Stellar%20Docs%20-%20Docusaurus/query`. In JS:
`encodeURIComponent(indexName)`. Do NOT use `+` in the path.

### Host architecture

- **Read host (use first)**: `https://VNSJF5AWIZ-dsn.algolia.net` — DSN read endpoint.
- **Fallback hosts**: `https://VNSJF5AWIZ-1.algolianet.com`, `…-2.algolianet.com`,
  `…-3.algolianet.com`. Fallback `-1` verified live: same results, ~0.5 s cold.
- (`https://VNSJF5AWIZ.algolia.net` is the write host — irrelevant for a search-only key.)

### Retry strategy (what the official clients do; replicate this)

1. Try `{app}-dsn.algolia.net` with a short timeout (official JS v5 defaults: ~1 s connect,
   2 s read for search).
2. On **network error, DNS failure, timeout, or HTTP 5xx** → retry the same request against the
   fallback hosts in randomized order (`-1`/`-2`/`-3`), bumping the timeout per attempt
   (timeout × attempt number). Official clients mark a failed host "down" for ~2 minutes.
3. **Never retry HTTP 4xx** — those are request errors (see error envelope) and will fail
   identically on every host.

### Client choice: hand-roll, don't depend

**Recommendation: hand-rolled fetch wrapper (~50 lines) for the Workers adapter.** Rationale:

- The official `algoliasearch` v5 client does run on Cloudflare Workers (fetch-based requester;
  CF Workers support landed in v4.14 via `@algolia/requester-fetch` and carried into v5), so it is
  a viable option — but it drags in a multi-API bundle (search + analytics + personalization +
  A/B), its own transporter/host-state machinery, and a dependency to track, all to make one POST.
- We need exactly: 4 hosts, `AbortSignal.timeout()`, one retry loop, JSON in/out. That is ~50
  lines with zero deps, full observability, and no version churn.

Sketch of the core loop:

```ts
const HOSTS = [
  `${appId}-dsn.algolia.net`,
  `${appId}-1.algolianet.com`,
  `${appId}-2.algolianet.com`,
  `${appId}-3.algolianet.com`,
];
async function search(params: object, attempt = 0): Promise<SearchResponse> {
  const host = HOSTS[attempt];
  try {
    const res = await fetch(`https://${host}/1/indexes/${encodeURIComponent(INDEX)}/query`, {
      method: "POST", headers: HEADERS, body: JSON.stringify(params),
      signal: AbortSignal.timeout(2000 * (attempt + 1)),
    });
    if (res.status >= 500) throw new Error(`algolia ${res.status}`);
    const body = await res.json();
    if (!res.ok) throw new AlgoliaError(body.message, body.status); // 4xx: no retry
    return body;
  } catch (e) {
    if (e instanceof AlgoliaError || attempt >= HOSTS.length - 1) throw e;
    return search(params, attempt + 1);
  }
}
```

## Index settings (verbatim, fetched live 2026-07-01)

`GET /1/indexes/crawler_Stellar%20Docs%20-%20Docusaurus/settings` — relevant fields:

```json
{
  "searchableAttributes": [
    "unordered(hierarchy.lvl0)", "unordered(hierarchy.lvl1)", "unordered(hierarchy.lvl2)",
    "unordered(hierarchy.lvl3)", "unordered(hierarchy.lvl4)", "unordered(hierarchy.lvl5)",
    "unordered(hierarchy.lvl6)", "content"
  ],
  "attributesForFaceting": ["type", "lang", "language", "version", "docusaurus_tag"],
  "customRanking": ["desc(weight.pageRank)", "desc(weight.level)", "asc(weight.position)"],
  "ranking": ["proximity", "exact", "words", "filters", "typo", "attribute", "custom"],
  "distinct": true,
  "attributeForDistinct": "url",
  "attributesToSnippet": ["content:10"],
  "attributesToHighlight": ["hierarchy", "content"],
  "attributesToRetrieve": ["hierarchy", "content", "anchor", "url", "url_without_anchor", "type"],
  "highlightPreTag": "<span class=\"algolia-docsearch-suggestion--highlight\">",
  "highlightPostTag": "</span>",
  "advancedSyntax": true,
  "queryType": "prefixLast",
  "removeWordsIfNoResults": "allOptional",
  "ignorePlurals": true,
  "minWordSizefor1Typo": 3,
  "minWordSizefor2Typos": 7,
  "exactOnSingleWordQuery": "attribute",
  "alternativesAsExact": ["ignorePlurals", "singleWordSynonym"],
  "camelCaseAttributes": ["hierarchy", "content"],
  "paginationLimitedTo": 1000,
  "maxValuesPerFacet": 100,
  "replicas": ["docs_replica_agent"]
}
```

Consequences (all verified by live queries):

- **Facetable attrs are exactly** `type`, `lang`, `language`, `version`, `docusaurus_tag` —
  plain (not `filterOnly(…)`, not `searchable(…)`). So `filters` **and** `facetFilters` **and**
  facet counts work on them, but `searchForFacetValues` fails on every facet (needs
  `searchable()`), which is exactly why the MCP facet-values tool is broken.
- Observed facet values: `type`: `content`, `lvl1`…`lvl5` (records are typed by their heading
  depth); `lang`/`language`: `en`; `version`: `current`; `docusaurus_tag`:
  `docs-default-current` (the docs proper), `default`, `blog_tags_posts`, `blog_posts_list`,
  `blog_authors_posts`, `blog_tags_list`.
- **`hierarchy.lvl0` is NOT facetable.** `facetFilters:[["hierarchy.lvl0:Documentation"]]`
  does not error — it silently returns `nbHits: 0`. Likewise an undeclared attribute in the
  `facets` request list is silently dropped from the response. Guard the adapter's facet surface
  to the five real facets.
- `distinct: true` + `attributeForDistinct: "url"` is on **by default**: results are deduped per
  URL-with-anchor and `nbHits` counts distinct groups. `distinct: 0` at query time reveals raw
  record counts (empty query: 3,808 distinct vs 12,867 raw; "soroban storage": 88 vs 92).
- `advancedSyntax: true` is on by default → quoted phrases just work: `"\"state archival\""` →
  80 hits vs 94 unquoted.
- `removeWordsIfNoResults: "allOptional"` → a query with any nonsense word won't zero out if
  other words match (`"qwzxvbnmasdfgh soroban"` → 581 hits). Only all-garbage queries return
  `nbHits: 0`. So **zero hits = definitely not in corpus, but nonzero hits ≠ good match** —
  judge the top hit's snippet/hierarchy.
- Settings-level defaults (snippeting `content:10`, highlighting, retrieve list, DocSearch
  highlight tags) apply when you omit the corresponding query param; every one of them is
  overridable per query. What you **cannot** change at query time: `searchableAttributes`,
  `attributesForFaceting`, `customRanking`, `attributeForDistinct`.
- `paginationLimitedTo: 1000` → `page * hitsPerPage` beyond 1000 records is unreachable.

## Search parameters that matter for LLM-driven docs search

| Param | Effect on this index |
| --- | --- |
| `query` | keyword query. `queryType: prefixLast` → last word matched as prefix (autocomplete-ish); typo tolerance from 3 chars (1 typo) / 7 chars (2 typos); plurals ignored. |
| `hitsPerPage` / `page` | default 20 / 0. For LLM use 3–8; each hit can carry multi-KB `content`. Max page depth: 1000 records. |
| `attributesToRetrieve` | default (from settings) already excludes `content_camel` bloat. Recommended: `["url","url_without_anchor","anchor","hierarchy","type"]` (+ `"content"` only on request). `objectID` is always returned. `[]` = objectID only. |
| `attributesToSnippet` | e.g. `["content:12"]` (N = words). Populates `_snippetResult`. Settings default `content:10`. |
| `attributesToHighlight` / `highlightPreTag`/`highlightPostTag` | override the DocSearch `<span class="algolia-docsearch-suggestion--highlight">` tags — set to `**`/`**` or empty for LLM-friendly output instead of stripping HTML. Applies to snippets too. |
| `restrictSearchableAttributes` | e.g. `["hierarchy.lvl1","hierarchy.lvl2","hierarchy.lvl3"]` = title-only search — verified to surface page-level results ("state archival" → the State Archival pages first). Good "search titles" mode. |
| `filters` | SQL-ish string: `type:content AND docusaurus_tag:"docs-default-current"` (quote values with spaces/dashes). Verified. Only the 5 facetable attrs. |
| `facetFilters` | array form: `[["docusaurus_tag:docs-default-current"],["type:content"]]` — inner array = OR, outer = AND; `-value` negates. Verified. Same attrs; silent 0-hit on undeclared attrs. |
| `facets` | e.g. `["type","docusaurus_tag"]` or `["*"]` → per-facet value counts on the response — the correct replacement for the broken facet-values search. Counts are computed **pre-distinct** (record counts, may exceed `nbHits`). |
| `distinct` | default true (url grouping). `distinct: 0` for raw per-section records; `distinct: N>1` = N records per URL. |
| `typoTolerance` | `false` for exact-token search (verified: typo'd query drops 82 → 0 hits); `"min"` keeps only the best typo class. |
| `queryType` | override `prefixLast` → `prefixNone` to stop prefix-matching the final word (useful when the LLM sends complete words). |
| `removeWordsIfNoResults` | index default `allOptional` already maximizes recall; set `"none"` for strict AND semantics. |
| `optionalWords` | mark low-confidence expansion terms optional without losing them entirely. |
| `advancedSyntax` | already on: `"exact phrase"` and `-exclude` work in `query` directly. |
| `analytics: false` | **send on every adapter query.** Keeps automated agent traffic out of the DocSearch/Stellar search-analytics dashboards (no skewed "popular searches", no polluted click-analytics). No effect on results or latency. Also skip `clickAnalytics`. |
| `getRankingInfo: true` | adds `_rankingInfo` (nbTypos, proximityDistance, nbExactWords, words, userScore…) + top-level `serverUsed`. Debug-only; verified working. |

## Record + response shape

Response envelope (verified):

```json
{
  "hits": [ … ],
  "nbHits": 88, "page": 0, "nbPages": 30, "hitsPerPage": 3,
  "exhaustive": { "nbHits": true, "typo": true },
  "exhaustiveNbHits": true, "exhaustiveTypo": true,
  "query": "soroban storage", "params": "…",
  "processingTimeMS": 2,
  "facets": { "type": {"content": 89, …}, … }
}
```

- `exhaustive.nbHits: false` means `nbHits` is an approximation (seen on the empty-corpus-scan
  query; real queries on this index came back exhaustive).
- `processingTimeMS` is server-side engine time (2–3 ms typical here); wall time is network-bound.
- `facets` present only when requested (single-query endpoint); multi-query results each carry
  their own full envelope in `results[]` (plus `index`, `processingTimingsMS`).

Hit example (trimmed, real):

```json
{
  "url": "https://developers.stellar.org/docs/build/smart-contracts/getting-started/storing-data#summary",
  "url_without_anchor": "https://developers.stellar.org/docs/build/smart-contracts/getting-started/storing-data",
  "anchor": "summary",
  "type": "content",
  "hierarchy": { "lvl0": "Documentation", "lvl1": "3. Storing Data", "lvl2": null, "lvl3": null,
                 "lvl4": null, "lvl5": null, "lvl6": null },
  "content": "…full section text, can be multi-KB…",
  "objectID": "34-https://developers.stellar.org/docs/build/smart-contracts/getting-started/storing-data",
  "_snippetResult": { "content": { "value": "made use of <span class=…>Soroban</span>'s <span class=…>storage</span> capabilities…", "matchLevel": "full" } },
  "_highlightResult": { "hierarchy": { "lvl1": { "value": "…", "matchLevel": "none", "matchedWords": [] } },
                         "content": { "value": "…", "matchLevel": "full", "fullyHighlighted": false, "matchedWords": ["soroban","storage"] } }
}
```

`matchLevel` semantics: `none` (attribute didn't match), `partial` (some query words matched),
`full` (all query words matched in that attribute). `_highlightResult` additionally carries
`matchedWords` and `fullyHighlighted`. Full-record fields beyond the settings-default retrieve
list: `content_camel` (duplicate of `content` — never retrieve), `lang`, `language`, `version[]`,
`tags[]`, `docusaurus_tag`, `weight{pageRank,level,position}`, `url_without_variables`,
`recordVersion`.

## Recommended adapter design (codemode surface)

- **Client**: hand-rolled fetch (above). Hosts `-dsn` + `-1/2/3`, 2 s escalating timeout, retry
  on network/5xx only.
- **Default params** baked into every search:
  `analytics: false`, `hitsPerPage: 5`,
  `attributesToRetrieve: ["url","url_without_anchor","anchor","hierarchy","type"]`,
  `attributesToSnippet: ["content:20"]`, `highlightPreTag: "**"`, `highlightPostTag: "**"`.
- **Knobs to expose** to the LLM: `query` (required), `page`, `hitsPerPage` (cap ≤ 20),
  `facetFilters` restricted to `type` / `docusaurus_tag` (`lang`/`language`/`version` are
  single-valued — useless), optional `titlesOnly` boolean (→ `restrictSearchableAttributes` on
  hierarchy levels), optional `includeContent` boolean (adds `"content"` to retrieve list).
- Offer a `docsOnly` default of `facetFilters: [["docusaurus_tag:docs-default-current"]]` to
  drop blog/meeting-notes noise, overridable.
- Post-process: flatten `hierarchy` to a breadcrumb string, surface `_snippetResult.content.value`
  as `snippet`, return `nbHits`/`nbPages` for the LLM's pagination reasoning.
- Dedup note: `distinct` already dedupes per anchor-URL; for page-level dedup group client-side
  by `url_without_anchor`.

## Error envelope

Uniform JSON `{"message": "...", "status": <code>}` with matching HTTP status (all verified):

| Status | Trigger (verified) | Body |
| --- | --- | --- |
| 400 | bad param value/type | `{"message":"Value \"three\" outside of the range for \"hitsPerPage\" parameter, expected integer between 0 and 9223372036854775807","status":400}` |
| 403 | bad/foreign API key | `{"message":"Invalid Application-ID or API key","status":403}` |
| 404 | unknown index | `{"message":"Index no_such_index_xyz does not exist","status":404}` |

Beware the **silent non-errors**: undeclared facet in `facetFilters` → HTTP 200, `nbHits: 0`;
undeclared facet in `facets` → HTTP 200, facet omitted. Validate facet names in the adapter.

## Rate limits / quota

- The key itself carries **no rate limit** (`validity: 0`, no `maxQueriesPerIPPerHour`, no
  `maxHitsPerQuery`) — confirmed via key introspection.
- This is a DocSearch/crawler app: search traffic on DocSearch apps is Algolia-subsidized;
  there is no per-key operation quota we can exhaust from an adapter doing interactive LLM
  searches. Plan-level abuse protection can still surface as HTTP 429 — treat 429 like 5xx
  minus the host-retry (back off instead).
- Each search = 1 "search operation" on the app's account; multi-query with N requests = N
  operations. Be a polite tenant: no empty-query corpus scans in hot paths, always
  `analytics: false`.

## Replica verdict

`docs_replica_agent` is queryable with this key and its settings are **byte-identical** to the
primary (live diff of both settings objects: only `primary`/`replicas` fields differ — same
ranking, customRanking, distinct, facets). Same data (nbHits and top hits matched exactly).
**Use the primary `crawler_Stellar Docs - Docusaurus`**: it is the canonical index the crawler
writes to and the name the DocSearch frontend uses; the replica exists to serve the Algolia MCP
endpoint. The replica is a valid emergency fallback if the primary is ever renamed.

## Latency (measured 2026-07-01, local machine, cold TLS per request)

- Single query via `-dsn`: **0.32–0.33 s** total (connect ~0.08 s, TTFB ~0.32 s,
  `processingTimeMS` 2–3 ms — wall time is ~all network RTT; a colocated Worker will be similar
  or better and TLS reuse cuts repeat calls further).
- Fallback host `-1.algolianet.com`: ~0.5 s cold, works identically.
- Multi-query batch (2 requests): ~0.4 s — cheaper than 2 round trips when batching.

## Refresh probes (for the inventory-refresh script)

```sh
set -a; source .env; set +a
APP=$ALGOLIA_APPLICATION_ID_DOCS
IDX='crawler_Stellar%20Docs%20-%20Docusaurus'
AH1="X-Algolia-Application-Id: $APP"
AH2="X-Algolia-API-Key: $ALGOLIA_API_KEY_DOCS"

# 1. Settings drift (diff against the committed snapshot; facets/searchable/distinct are the contract)
curl -sS "https://$APP-dsn.algolia.net/1/indexes/$IDX/settings" -H "$AH1" -H "$AH2" \
  | jq -S '{searchableAttributes, attributesForFaceting, customRanking, distinct,
            attributeForDistinct, advancedSyntax, queryType, removeWordsIfNoResults, replicas}'

# 2. Corpus size + freshness (raw records via /1/indexes entries; updatedAt should be < 48h old)
curl -sS "https://$APP-dsn.algolia.net/1/indexes" -H "$AH1" -H "$AH2" \
  | jq '.items[] | select(.name | startswith("crawler_Stellar") or . == "docs_replica_agent")
        | {name, entries, updatedAt, replicas, primary}'

# 3. Smoke query (expect nbHits > 50, top hit under developers.stellar.org, processingTimeMS present)
curl -sS -X POST "https://$APP-dsn.algolia.net/1/indexes/$IDX/query" \
  -H "$AH1" -H "$AH2" -H 'Content-Type: application/json' \
  -d '{"query":"soroban storage","hitsPerPage":3,"analytics":false,
       "attributesToRetrieve":["url","hierarchy.lvl1","type"]}' \
  | jq '{nbHits, processingTimeMS, top:.hits[0].url}'

# 4. nbHits tracking: distinct URLs vs raw records (history: 3781 → 3916 → 3808 distinct; 12867 raw)
curl -sS -X POST "https://$APP-dsn.algolia.net/1/indexes/$IDX/query" \
  -H "$AH1" -H "$AH2" -H 'Content-Type: application/json' \
  -d '{"query":"","hitsPerPage":0,"analytics":false}' | jq '{distinctUrls:.nbHits}'
curl -sS -X POST "https://$APP-dsn.algolia.net/1/indexes/$IDX/query" \
  -H "$AH1" -H "$AH2" -H 'Content-Type: application/json' \
  -d '{"query":"","hitsPerPage":0,"analytics":false,"distinct":0}' | jq '{rawRecords:.nbHits}'

# 5. Fallback-host health
curl -sS -o /dev/null -w 'fallback_status=%{http_code} time=%{time_total}s\n' \
  -X POST "https://$APP-1.algolianet.com/1/indexes/$IDX/query" \
  -H "$AH1" -H "$AH2" -H 'Content-Type: application/json' \
  -d '{"query":"ping","hitsPerPage":1,"analytics":false}'
```

Drift markers to alert on: `attributesForFaceting` change (breaks/extends the facet surface),
`distinct`/`attributeForDistinct` change (changes nbHits semantics), index rename or replica list
change, `updatedAt` staleness > 48 h, raw-record count swinging > 20%, or any named
`algolia:rule-canary` assertion failure.

## MCP fallback

The Algolia-hosted MCP endpoint (`https://VNSJF5AWIZ.algolia.net/mcp/1/…/mcp`, index
`docs_replica_agent`) remains available and fully documented in
`research/services/stellar-docs-mcp.md` — same corpus, one usable tool, SSE-framed responses,
analytics params required. Fall back to it only if this search key is revoked; note its
facet-values tool is permanently broken on this index (root cause confirmed here: no
`searchable()` facets).
