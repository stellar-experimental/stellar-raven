---
id: sd-003
service: stellar-docs
status: reported-upstream
discovered: 2026-07-03
evidence:
  - eval/qa/results/2026-07-03T16-06-45-variantA.json (q-ti-rpc-gettransactions-pagination-xdr)
  - live soft-empty on get_doc_page_sections for the getTransactions method page + WebFetch of the live page (2026-07-03 evening)
  - Solo project 49, todo 807, scratchpad 521
  - 2026-07-03 corrected-golden re-judge (todo 827): the saved agent answer flips partial → wrong under the fixed golden — the agent explicitly denied a getTransactions 200 cap ("did not find RPC-doc confirmation"), a real wrong answer this gap causes that the old golden masked by encoding the same false belief
  - live re-verified 2026-07-06 (eval round todo 846): get_doc_page_sections on the getTransactions method page still returns the identical soft-empty ("auto-generated API-reference pages are not indexed")
  - upstream issue filed 2026-07-07: https://github.com/stellar/stellar-docs/issues/2566
  - live re-check 2026-07-09 (Solo scratchpad 565): `getTransactions limit 200 default 50 pagination` now ranks `/docs/data/apis/rpc/admin-guide/configuring` at #1 with the getTransactions transaction cap snippet, but `getTransactions API reference limit` still drifts to Horizon/API Explorer/structure pages and the generated method page remains unindexed; partial mitigation only
  - upstream PR https://github.com/stellar/stellar-docs/pull/2572 merged 2026-07-10 at final head fb4e8ecbb50218b52313c434a9d0d4e8571fdb3a; it added a per-method limits/defaults table to the indexed Pagination page after reverting the intermediate configurable-per-instance wording
  - independent Docs-team audit 2026-07-14 confirmed generated method pages remain unindexed and #2566 is the only crawler-inclusion tracker; close only after the Algolia-dashboard owner has a durable replacement task: https://gist.githubusercontent.com/ElliotFriend/3b3641b929b4408a834b85bcb4e75449/raw/0183ead04f484e7b870499d9f12129d1673f1a3f/raven-issues-audit.md
  - scope/disposition correction posted and read back 2026-07-15: https://github.com/stellar/stellar-docs/issues/2566#issuecomment-4981955612
recurrences:
  - date: 2026-08-11
    evidence: live recheck — get_doc_page_sections for the generated getTransactions path remains soft-empty; `getTransactions API reference limit 200 default 50` ranks the configuring page first, but the generated method page remains unindexed. Issue #2566 remains open; its latest maintainer comment is ElliotFriend's 2026-07-21 partial-fix note, while the latest comment is Raven's 2026-07-27 reply. PR #2572 remains merged with all recorded checks successful and ElliotFriend approval.
  - date: 2026-07-10
    evidence: architecture A/B todo 903 — both QA arms answered q-ti-rpc-gettransactions-pagination-xdr only partially; a fresh live execute re-check still returned soft-empty for the generated getTransactions method page, while the targeted admin query surfaced 200/default-50 and API-reference phrasing did not
  - date: 2026-07-10
    evidence: GT-30 blind process 3279 — indexed discovery did not reliably expose the exact getTransaction versus sendTransaction status contracts; direct method/source retrieval was required to correct PENDING attribution
  - date: 2026-07-13
    evidence: post-merge raw Algolia re-check — the Pagination page is crawled and `getTransactions`/default `50` appear, but the table's `1 to 200` range is absent from the method record; `getTransactions API reference limit` still ranks Horizon/noise ahead of the RPC structure page, and the generated method page remains outside the index
  - date: 2026-07-14
    evidence: fresh DocSearch recurrence; retained locally because the open issue showed no maintainer action and did not warrant a follow-up comment
  - crawler-coordination reply posted and read back 2026-07-27 offering operator crawler evidence to the Algolia dashboard owner: https://github.com/stellar/stellar-docs/issues/2566#issuecomment-5091974189
---

## Finding

The Algolia docs index excludes the auto-generated RPC-method and
Horizon-endpoint API-reference pages, so authoritative per-method limits
remain unreliable through search. The live
`/docs/data/apis/rpc/api-reference/methods/getTransactions` page states
the limit "can range from 1 to 200 — an upper limit that is hardcoded in
Stellar-RPC for performance reasons... defaults to 50". PR #2572 merged on
2026-07-10 and added all three method rows to the rendered RPC
Structure→Pagination page. The crawler does not preserve that table
faithfully: the current `getTransactions` record carries the method name and
default `50` but drops its `1 to 200` range. API-reference phrasing still
drifts, and the generated method page itself remains absent. The consequence is worse
than a zero-hit: consumers extrapolate from the getEvents numbers or
from Horizon's (1–200, default 10) and get getTransactions wrong. This
round it produced a two-sided failure — the QA agent claimed "default
100" (getEvents-only) and even the eval golden itself encoded the false
belief that a 200 limit "is Horizon's, not RPC's".

## Evidence

Live 2026-07-03: `get_doc_page_sections({path:
"/docs/data/apis/rpc/api-reference/methods/getTransactions"})` →
soft-empty ("auto-generated API-reference pages are not indexed" — the
op description admits the exclusion); `search_docs` /
`search_rpc_horizon_data_docs` for the limit facts → no relevant hits;
WebFetch of the live method page → the 1–200/default-50 text quoted
above. Round record: Solo scratchpad 521 (batch-3 review report).

Live 2026-07-09: direct Algolia query
`getTransactions limit 200 default 50 pagination` now returns
`/docs/data/apis/rpc/admin-guide/configuring` at rank #1 with a snippet naming
the getTransactions transaction cap. However, `getTransactions API reference
limit` still returns Horizon rate-limit/API Explorer/structure pages ahead of
RPC structure pages, and the generated
`/docs/data/apis/rpc/api-reference/methods/getTransactions` method page is
still not directly indexed. This is a partial mitigation, not a fix.

Impact quantified (2026-07-03 follow-up, todo 827): after correcting the
golden to the live method-page numbers, re-judging the saved agent answer
flips it partial → wrong — the agent's denial of an RPC-side 200 cap is a
genuine consumer-facing wrong answer produced by this indexing gap, not a
grading nuance. Both the QA agent and the original golden author
independently derived the same false belief from the indexed pages.

Live 2026-07-10 (todo 903 closeout): both the shipped search+execute arm and the
manifest-derived direct-operation arm answered
`q-ti-rpc-gettransactions-pagination-xdr` only partially. A fresh execute probe reproduced the
same split: `getTransactions limit 200 default 50 pagination` ranked the RPC admin configuring
page first and contained both numbers; `getTransactions API reference limit` ranked Horizon and
API Explorer pages and contained neither; direct page-section lookup for the generated
`getTransactions` method returned the documented `soft-empty`. This is a recurrence of the
existing mechanism, not a new finding.

Live 2026-07-13, after PR #2572 merged: the rendered Pagination page contains
the new method/range/default table, but raw Algolia records flatten it
incorrectly. The `getTransactions` hierarchy record exposes default `50` and
the following prose while omitting the row's `1 to 200` range. A query for
`getTransactions API reference limit` still ranks Horizon rate-limit and API
Explorer material ahead of the RPC Pagination record. The PR is a useful
partial mitigation, not live proof that the original trigger is fixed.

## Recommendation

The first recommended option—a per-method table on the indexed Pagination
page—merged in PR #2572, but the crawler loses a load-bearing table cell.
Cheapest next fix: make the general crawler/table extraction preserve headers
and every cell, or render the three ranges/defaults in crawl-stable prose or a
definition list. The broader alternative remains including the auto-generated
method/endpoint reference pages in the Algolia crawl; they are the authoritative
source for per-method numbers.
Keep #2566 open until that crawler-inclusion work has a durable tracker owned by
the Algolia-dashboard operator; PR #2572 alone does not resolve this residual.
Consumer-side, this gateway cannot work around the gap without shipping
hardcoded limits that would rot.
