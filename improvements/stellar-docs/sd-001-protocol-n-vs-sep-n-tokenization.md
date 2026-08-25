---
id: sd-001
service: stellar-docs
status: verified
discovered: 2026-07-03
upstreamTitle: /docs/networks/software-versions is missing from the DocSearch index, so no protocol-version query reaches it
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
    evidence: root cause found. `/docs/networks/software-versions` covers every protocol from 20 to 28 with activation dates and CAP lists, and is absent from the DocSearch index. Confirmed against the docs site's own production index `crawler_Stellar Docs - Docusaurus`, not only the agent replica. The page is in the sitemap, is not noindexed, and robots.txt allows it; sibling pages under `/docs/networks/` are indexed.
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

## Recommendation

Get `/docs/networks/software-versions` into the DocSearch crawl. The content is already written,
already canonical, and already answers these queries; only the record is missing. Check the
crawler configuration for a path exclusion, a record-extraction rule that yields nothing on a
table-heavy page, or a per-page record cap.

This is worth fixing for the docs site on its own terms, independent of any agent: a reader who
types "software versions" into the search box on developers.stellar.org does not find the software
versions page.

Two smaller retrieval rules remain useful once the page is indexed:

- Disambiguate `Protocol N` from `SEP-N`. This is the original 2026-07-03 recommendation. It is
  still correct and still insufficient on its own.
- Stop a bare version number from matching a date fragment in a `/meetings/YYYY/MM/DD` path.
  `Protocol 23 release` currently returns `/meetings/2026/07/23`, where the `23` matched the date.
  `Protocol 24 release` returns a Protocol 27 discussion.

### Note on remediation path

The operator Algolia credentials are the wrong tool here. The defect is in the upstream crawl, and
the same gap breaks the docs site's own search. Writing the missing record into the agent replica
would hide an upstream defect behind a local patch, leave every non-Raven reader broken, and fail
the "general mechanism rather than per-query hacks" bar in `AGENTS.md`.
