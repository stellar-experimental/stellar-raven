---
id: sd-001
service: stellar-docs
status: verified
discovered: 2026-07-03
upstreamTitle: /docs/networks/software-versions exceeds the crawler's 750-record page cap, so the whole page is dropped from the index
evidence:
  - eval/qa/results/2026-07-03T03-49-35-variantA.json
  - eval/qa/results/2026-07-03T04-13-42-variantA.json
  - QA case q-protocol-24-whisk-incident (the round's one real QA failure)
  - live re-execution: correct content is hit #1 for the meetings-category query
  - Solo project 49, todo 822, comments 2204-2210
  - live re-verified 2026-07-06 (eval round todo 846): bare "Protocol 24" still returns 8/8 SEP-24 anchor pages; the Whisk/state-archival meetings content only surfaces (as hit #1) on the detail-rich meetings-scoped query
  - live re-verified 2026-07-09 (Solo scratchpad 565): bare "Protocol 24" still returns SEP-24/anchor pages as all top hits; "Protocol 24 Whisk state archival" with meetings filtering returns the Whisk/state-archival meeting content at rank #1
recurrences:
  - date: 2026-08-25
    evidence: live sweep across Protocol 20-26. Only `Protocol 24` shows any SEP collision; only `Protocol 23` returns pages naming that version, and only because the URL anchors contain `protocol-23`. Five of seven return unrelated pages, with no SEP involved.
  - date: 2026-08-25
    evidence: exact root cause. Crawler `POST /test` on the page returns `extracted_too_many_records` — "Extractors returned 1319 records, the maximum is 750" — so the page yields zero records. The `td:first-child` / `td:last-child` selectors make one record per table row, and the page holds nine protocol sections each with a software-version table.
  - date: 2026-08-25
    evidence: candidate fix validated read-only via the crawler test endpoint with a config override. Page goes 0 records to 242; `/docs/networks/audits` stays 3 and `/docs/tools/cli/install-cli` stays 10.
  - date: 2026-08-25
    evidence: earlier note. `/docs/networks/software-versions` covers every protocol from 20 to 28 with activation dates and CAP lists, and is absent from the DocSearch index. Confirmed against the docs site's own production index `crawler_Stellar Docs - Docusaurus`, not only the agent replica. The page is in the sitemap, is not noindexed, and robots.txt allows it; sibling pages under `/docs/networks/` are indexed.
  - date: 2026-08-11
    evidence: live Stellar Docs recheck — bare `Protocol 24` returned eight SEP-24 docs hits, while `Protocol 24 Whisk state archival` with meetings included returned the 2025-10-16 Whisk/state-archival meeting at rank #1.
  - date: 2026-07-09
    evidence: the controlled Algolia harness now requires the exact `/meetings/2025/10/16` record plus `state`, `archival`, and `Whisk`; bare `Protocol 24` misses that semantic target across the tested strategies. The former any-`/meetings/` target could falsely pass an unrelated meeting hit and has been retired.
---

## Finding

Protocol-version queries against the main docs index surface SEP-24 pages:
"Protocol 24" tokenizes into SEP-24 matches. The actual Protocol 24 / Whisk
state-archival content lives in the meetings category and IS indexed — it is
hit #1 for the right category-scoped query — but the default query loses to
SEP-24 pages. This contributed to the round's one real QA failure
(`q-protocol-24-whisk-incident`).

## Evidence

2026-07-03 eval round results files above. Live re-execution confirmed both
halves: "Protocol 24" on the main index returns SEP-24 pages; the
meetings-category query returns the Whisk state-archival content as hit #1.
The 2026-07-09 re-check still reproduces the same split: bare protocol-version
intent is SEP-24-biased, while a detailed Whisk/state-archival query reaches
the correct meetings content. A controlled-harness audit found that the old
`/meetings/`-prefix expectation was too broad: an unrelated meeting result
could count as a recovery. The harness now requires the actual 2025-10-16
meeting URL and the Whisk/state/archival terms, preserving this as a real
recurrence instead of a URL-class false positive.

### 2026-08-25 — the SEP collision is not the defect

The original diagnosis holds for Protocol 24 and for no other version. A sweep of `search_docs`
across seven protocol versions, five hits each:

| query | hits colliding with SEP-N | hits naming that protocol version |
|---|---|---|
| Protocol 20 | 0 | 0 |
| Protocol 21 | 0 | 0 |
| Protocol 22 | 0 | 0 |
| Protocol 23 | 0 | 2 |
| Protocol 24 | 2 | 0 |
| Protocol 25 | 0 | 0 |
| Protocol 26 | 0 | 0 |

`Protocol 24` is the only query with a SEP collision, because SEP-24 is a heavily documented
anchor standard. `Protocol 23` is the only query reaching pages that name its version, and only
because two URL anchors contain `protocol-23`. `Protocol 22` returns a zk privacy page, a
guestbook tutorial, and a Horizon migration guide, with no SEP-22 involved at all.

A "Protocol N" versus "SEP-N" synonym rule would repair one query in seven.

### 2026-08-25 — root cause: the canonical page is not indexed

`https://developers.stellar.org/docs/networks/software-versions` is the page every one of these
queries should return. It exists and it is comprehensive. It carries a section for every protocol
from 20 through 28, each with an activation date (`Protocol 24 (Mainnet, October 22, 2025)`), a
software-version table, and release notes naming the CAPs that version carries. It also contains
the strings `Whisk` and `state archival`, which is the subject of the QA case that opened this
finding.

The page is absent from the search index. Seven probes returned it zero times, including strings
that appear only on that page:

- `software versions` — its own title.
- `Poseidon Rust SDK` — returns `/docs/build/apps/zk` and `/docs/networks/audits/soroban-poseidon`,
  never `software-versions`.
- `Smart Contract Host Environment version`, `Stellar Galexie version Quickstart docker pull`,
  `Protocol 27 mainnet release notes CAP`, `network passphrase futurenet testnet mainnet software
  version`, `Stellar Core software version protocol release notes`.

This is absence, not low ranking. A direct query against the raw index for those unique strings
returns 45 records and none is that page.

The absence is upstream, not a replica artifact. The same probe against the docs site's own
production index, `crawler_Stellar Docs - Docusaurus`, returns 855 records and no
`software-versions` row. **The docs site's own search box cannot find its own software-versions
page.**

Nothing on the page asks to be excluded. It is listed in `sitemap.xml`, carries no `noindex`
meta, is allowed by `robots.txt`, and serves the standard `docsearch:` Docusaurus tags. Sibling
pages in the same directory are indexed: `/docs/networks`, `/docs/networks/audits`,
`/docs/networks/audits/soroban-poseidon`, `/docs/networks/resource-limits-fees`. One of them,
`/docs/networks/audits`, is indexed with the text "for the latest compatible versions for each
network, see Software Versions" — a page that links to the target is indexed while the target is
not.

## Root cause

The Algolia Crawler test endpoint answers this exactly. `POST
/api/1/crawlers/{id}/test` with that URL returns:

```json
{"code": "extracted_too_many_records",
 "message": "Extractors returned 1319 records, the maximum is 750"}
```

A page over the cap yields **zero** records. It is not partially indexed; it is dropped whole,
and the crawl reports no failure that a reader would ever see.

The count comes from the record extractor's table handling:

```js
lvl5:    "article h5, article td:first-child",
content: "article p, article li, article td:last-child, article pre code",
```

Every table row becomes a heading plus content pair. That is sensible for a short parameter
table. This page carries nine protocol sections, each with a full software-version table, so the
same rule produces 1319 records.

Nothing else is wrong. `pathsToMatch` is `https://developers.stellar.org/**` and matches the URL.
No `exclusionPatterns` entry covers it. The page is in `sitemap.xml`, carries no `noindex`, and
`robots.txt` allows it. The crawler config exposes no per-page record limit, so 750 is a platform
cap and cannot be raised from configuration.

## Recommendation

Make an over-cap page degrade instead of disappear. When the extractor exceeds the cap, re-extract
at heading granularity — dropping only the table-row selectors — and keep the page reachable:

```js
const build = (withTables) => helpers.docsearch({ /* td selectors only when withTables */ });
const records = build(true);
if (records.length <= 750) return records;
const coarse = build(false);
return coarse.length > 750 ? coarse.slice(0, 750) : coarse;
```

Measured read-only through the crawler test endpoint with a config override, changing nothing in
production:

| page | current | with the change |
|---|---|---|
| `/docs/networks/software-versions` | dropped, 0 records | indexed, 242 records |
| `/docs/networks/audits` | 3 records | 3 records |
| `/docs/tools/cli/install-cli` | 10 records | 10 records |

The fallback only runs above the cap, so every page that indexes today is byte-identical
afterwards. The change is general: it repairs any page that exceeds the cap, now or later, rather
than naming this one.

Two smaller retrieval rules stay useful once the page is indexed:

- Disambiguate `Protocol N` from `SEP-N`. This is the original 2026-07-03 recommendation. Still
  correct, still insufficient alone.
- Stop a bare version number matching a date fragment in a `/meetings/YYYY/MM/DD` path.
  `Protocol 23 release` returns `/meetings/2026/07/23`, where the `23` matched the date.

### Remediation path

This is a crawler-extractor defect, not a content defect, so it sits on the highest rung of the
write ladder in `research/services/stellar-docs-algolia.md`: it changes what the docs team's own
crawler produces and what every DocSearch user sees. The `sd-006` crawler-config fix is the
precedent for a general change at that rung.

The read-only measurement above is the evidence the ladder asks for. The repository's A/B harness
cannot pre-measure it, because the harness queries the live index and this change only takes
effect on the next crawl.

Whoever applies it should confirm with the docs owners first: the same gap breaks their own search
box, so the fix is theirs to want.
