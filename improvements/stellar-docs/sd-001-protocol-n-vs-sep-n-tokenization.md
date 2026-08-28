---
id: sd-001
service: stellar-docs
status: fixed-upstream
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
    evidence: FIXED. Crawler config patched (taskId db13b3bf) and the URL recrawled (taskId a7f8bafe). `Protocol 22`, `Protocol 23`, `Protocol 24`, and `Protocol 24 release` now return the correct software-versions anchor at rank 1 in the production index and in the agent replica.
  - date: 2026-08-25
    evidence: candidate fix validated read-only via the crawler test endpoint with a config override. Page goes 0 records to 242; `/docs/networks/audits` stays 3 and `/docs/tools/cli/install-cli` stays 10.
  - date: 2026-08-25
    evidence: earlier note. `/docs/networks/software-versions` covers every protocol from 20 to 28 with activation dates and CAP lists, and is absent from the DocSearch index. Confirmed against the docs site's own production index `crawler_Stellar Docs - Docusaurus`, not only the agent replica. The page is in the sitemap, is not noindexed, and robots.txt allows it; sibling pages under `/docs/networks/` are indexed.
  - date: 2026-08-11
    evidence: live Stellar Docs recheck — bare `Protocol 24` returned eight SEP-24 docs hits, while `Protocol 24 Whisk state archival` with meetings included returned the 2025-10-16 Whisk/state-archival meeting at rank #1.
  - date: 2026-07-09
    evidence: the controlled Algolia harness now requires the exact `/meetings/2025/10/16` record plus `state`, `archival`, and `Whisk`; bare `Protocol 24` misses that semantic target across the tested strategies. The former any-`/meetings/` target could falsely pass an unrelated meeting hit and has been retired.
  - date: 2026-08-28
    evidence: settled primary and agent-replica indexes each contain 14,759 records, updated 2026-08-28T12:04:24.323Z. The original retrieval checks hold: Protocol 22, Protocol 23, Protocol 24, Protocol 24 release, and software versions rank the software-versions page or anchor first in both indexes. The primary index keeps all four collateral controls at rank 1. On docs_replica_agent, `stellar cli install command` ranks `/docs/build/smart-contracts/example-contracts/deployer#run-the-contract` first, and `/docs/tools/cli/install-cli#stellar-cli` is not in its top 10; the other three controls rank first. `Protocol 24 Whisk state archival` now returns the 2025-10-16 meeting at rank 1, while natural-language Protocol 23 and Protocol 27 ranking residuals remain.
---

## Finding

The Stellar Docs crawler dropped `/docs/networks/software-versions` because its 1,319 extracted
records exceeded the 750-record page cap.

> **Fixed 2026-08-25.** Everything from here to "Resolution" describes the defect as it stood
> before the fix, in the tense it was written. Read "Resolution — 2026-08-25" at the end for the
> applied change, the live verification, and what is left over.


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


## Resolution — 2026-08-25

Applied to the production crawler with operator credentials, the same lever and pattern as
`sd-006`. `PATCH /api/1/crawlers/{id}/config` with an `actions`-only body (`taskId`
`db13b3bf-65de-4656-bcd2-b6b30446bd5d`), then `POST /urls/crawl` for the affected page (`taskId`
`a7f8bafe-9876-4016-b6e6-54aacf6774d2`).

A re-read confirmed every other config key byte-identical, one action, `indexName` and
`pathsToMatch` preserved.

### Live result

The page now holds 20+ records including per-protocol anchors. The original defect is gone in the
production index and in `docs_replica_agent`:

| query | before | after |
|---|---|---|
| `Protocol 22` | zk privacy page, guestbook tutorial, Horizon migration | rank 1 — `#protocol-22-mainnet-december-5-2024` |
| `Protocol 23` | token-transfer-processor fragments | rank 1 — `#whisk-protocol-23-mainnet` |
| `Protocol 24` | six of eight hits were SEP-24 anchor pages | rank 1 — `#protocol-24-mainnet-october-22-2025` |
| `Protocol 24 release` | tier-1-orgs, network-status | rank 1 — `#release-notes-7` |
| `software versions` | absent | rank 1 |

### No regression on the controls

`stellar cli install command` and `brew install stellar-cli` both still return
`/docs/tools/cli/install-cli` at rank 1, so the load-bearing
`raven-promote-stellar-cli-install` rule is intact. `publish event contract events` and
`fee bump transaction inner outer envelope` also hold rank 1.

### One displacement, recorded honestly

For `Protocol 24 Whisk state archival` — the phrasing of the QA case that opened this finding —
`/meetings/2025/10/16` has dropped out of the top 20 of the general docs lane. The
software-versions release-notes anchors now occupy those positions.

The content is displaced, not lost: `search_meeting_notes` still returns
`/meetings/2025/10/16#protocol-discussion` at rank 1, which is the recovery path this finding
documented from the start.

Whether that is an improvement or a regression depends on what the question wants. The release
notes are the better answer for "what is in Protocol 24"; the meeting is the better answer for
"what happened in the state-archival incident". The QA case `q-protocol-24-whisk-incident` asks
the second, so it needs a re-check under `golden-truth`.

### Residual, unfixed

- Natural-language phrasing still misses: `what is in Protocol 23` does not return the page.
- `Protocol 27` returns the page at rank 4, behind a meetings discussion.
- The date collision is unchanged: a bare version number can still match a `/meetings/YYYY/MM/DD`
  path fragment.
- The coarse fallback indexes at heading granularity, so table-cell strings on an over-cap page
  are not searchable. `Poseidon Rust SDK` does not reach this page. That is the accepted
  trade-off: heading coverage beats no coverage.

### Independent recheck — 2026-08-25, verdict DO-NOT-RETIRE

A distinct reviewer (Sol, high effort; the author and orchestrator were both Opus) re-ran the
`improvements/README.md` retirement checks and confirmed the crawler fix while refusing
retirement.

Confirmed independently: 242 records with contiguous object ids 0-241 in both indexes; one crawler
action with all 13 config keys intact; the recorded rollback source reproduces the original
1319-over-750 failure and both control counts; eight unrelated queries unaffected; every listed
residual reproduces.

Refused for three reasons:

1. **The original trigger still fails.** `q-protocol-24-whisk-incident` needs the eviction-defect
   cause, the counts 478 / 84 / 77 / 394, `CAP-0076`, and the fee-pool remediation. No docs lane
   returns them. Follow-up investigation showed the facts ARE reachable, through
   `scout.searchResearch` with `source: "cap"` and a broad call. Our own `search` does not surface
   that lane for the question. That is a ranking defect in this repository, not an upstream gap,
   so it is tracked in `.agents/TODO.md` and not as a finding.
2. **The index is in a mixed state.** Only the target URL was recrawled. Every other page still
   carries records from the previous extractor until the next full crawl, so the no-regression
   evidence is a sample, not a proof.
3. Repo cleanup had not run.

### Retirement

The distinct-reviewer step ran on 2026-08-25 and returned DO-NOT-RETIRE. Before retiring this
record: let a full crawl complete, repeat the regression and collateral checks against the
settled index.
