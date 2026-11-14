# stellar.org — site search and page text

_Measured 2026-11-14 with keyless requests from a generic client (`User-Agent: RavenMCP/1.0`).
Decision record: [SORG](../../.agents/rounds/2026-11-14-golden-coverage-audit/decisions/SORG.md)._

## Trigger

Golden cases on three taxonomy leaves (`ecosystem.strategy-roadmap`, `security.audit-registry`,
`funding.service-providers`) missed because the fact lives only on a `stellar.org` page that no
Raven source held. The 2026-11-14 QA test showed all three
([result](../../.agents/rounds/2026-11-14-golden-coverage-audit/qa/RESULT.md)).

## Site search

`GET https://stellar.org/api/search?q=<query>&locale=en` is the site's own search. No key.

- Response: `{ query, locale, results: [{ id, kind, title, description, tags, url, isExternal }] }`,
  at most 10 rows. `kind` is `page` or `partner`. `description` can be `null` or `""`.
- A missing `q`, or one longer than 200 characters, returns 400 `{"error":"invalid_query"}`. A
  query with no match returns 200 with `results: []`.
- Page rows carry a site-relative `url` such as `/foundation/strategy`. Partner rows carry a query
  string, `?partner=moneygram&category=applications`, one row per directory category. The
  `/ecosystem` page renders the same HTML with or without that query string, so partner detail is
  client-side.
- External rows (`isExternal: true`) link off the site, for example to an auditor's portal.
- Ranking, measured: `/foundation/strategy` first for "SDF strategy" (second for the full golden
  question), `/foundation/roadmap` first for "roadmap", `/ecosystem/service-providers` first for
  "service providers directory", `/audit-bank/projects` first for "audited projects" and second
  for "audit bank projects". Full natural-language questions work.
- Latency 0.12–0.49 s; `cache-control: private, no-cache`.
- 707 of the 1,244 sitemap URLs are `/blog` and `/press`, and 350 are `/events` (orchestrator
  measurement). Search rows under those prefixes are a large share of most result sets.

## Pages

- Server-rendered HTML, 410–500 KB per page, behind Cloudflare. One `<main>` element holds the
  content; navigation, footer, and a large `__NEXT_DATA__`-style script sit outside it.
- `<main>` text after tag stripping: `/foundation/strategy` 4,455 characters, `/foundation/roadmap`
  5,804, `/ecosystem/service-providers` 4,972, `/audit-bank/projects` 1,121,
  `/grants-and-funding/soroban-audit-bank` 6,917.
- `/audit-bank/projects` server-renders the first page of its list ("77 Results", newest first);
  later pages load client-side.
- A trailing slash 308-redirects to the bare path. `/developers` 307-redirects to
  `https://developers.stellar.org/`. An unknown path returns 404 HTML.
- The site's Sanity dataset is private, and a Sanity token would expose drafts. SDF's Algolia
  index needs a secret. Neither is used.

## Design

Two authored operations in [`specs/stellar-org.json`](../../specs/stellar-org.json), served by
[`src/adapters/stellar-org.ts`](../../src/adapters/stellar-org.ts):

- `stellarOrg.search_site({ query, limit? })` drops partner rows (their page renders no partner
  detail; Scout and Lumenloop own partners), rows under `/blog`, `/press`, and `/events` (whole
  path segments, any case), and external or off-origin rows. It returns
  `{ hits: [{ title, description, path, kind, tags }], meta: { candidates } }` with `kind` always
  `page` and `description` clipped at 500 characters. The search body is read up to 256,000
  bytes. An all-filtered result is ok with no rows, so the host adds the `no-rows` caveat.
- `stellarOrg.get_page({ path })` fetches `https://stellar.org<path>`. The path must be
  site-relative with unreserved characters only (no `%`, since `fetch` decodes `%2e` dot segments
  and the server decodes encoded letters) and no `//`, dot segments, query, fragment, or `/api`
  prefix. Redirects are followed only to a same-origin path without a query (at most three hops),
  and one call, redirects included, is bounded to 24 s. A body over 2,000,000 bytes is refused. The adapter keeps the first `<main>` element's text,
  skips script, style, SVG, and similar elements, writes headings as `#` lines and list items as
  `- ` lines, drops responsive duplicate lines, and cuts content at 40,000 characters with
  `truncated: true`. A 404 or 410, or a page with no server-side `<main>` text, is soft-empty;
  every other failure is an error.

The origin is a constant in the adapter, not a manifest field. There is no key, binding, or cache.
`inventory/stellar-org.json` records the search row keys and a probe of `/` for the daily drift
check.

## Routing

The lexical scorer gives the id and service fields weights 12 and 8, and the new namespace carries
the token `stellar`, as `stellarDocs` does. The first draft description named many SDF programs and
products; it changed 66 legacy top-five lists and 12 top-1 hits and dropped legacy top-1 from 220
to 215. Two changes fixed it:

- The descriptions name only the page groups the source is primary for: strategy, roadmap, Audit
  Bank and audited projects, and the service providers directory.
- The scorer prefix-matches query tokens against description tokens in both directions, so a one-
  or two-letter token (`s` from `SDF's`, `a`, `of`, `or`) matches every query word that starts
  with it. The descriptions contain none.

Result on all 544 routing rows: no grade or top-1 change; six top-five lists gain a `stellarOrg`
operation at rank 3 to 5.
