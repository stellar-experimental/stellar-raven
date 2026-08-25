---
id: sd-001
service: stellar-docs
status: verified
discovered: 2026-07-03
upstreamTitle: A bare "Protocol N" query reaches no protocol-release content, and no canonical page holds it
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
    evidence: live sweep across Protocol 20-26. Only `Protocol 24` shows any SEP collision; only `Protocol 23` returns pages naming that version, and only because the URL anchors contain `protocol-23`. Five of seven return unrelated pages. No canonical protocol-version page exists in the docs, and the meetings lane does not resolve a bare version number either.
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

### 2026-08-25 widening — the SEP collision is not the defect

The original diagnosis holds for Protocol 24 and for no other version. A sweep of
`search_docs` across seven protocol versions, five hits each, found this:

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
anchor standard. `Protocol 23` is the only query that reaches pages naming its version, and only
because two URL anchors literally contain `protocol-23`
(`/docs/data/indexers/build-your-own/processors/token-transfer-processor#protocol-23-ordering`).
Five of the seven return unrelated pages: `Protocol 22` returns a zk privacy page, a guestbook
tutorial, and a Horizon migration guide, with no SEP-22 involved at all.

So a "Protocol N" vs "SEP-N" synonym rule would repair one query out of seven. The other six do
not fail because of tokenization. They fail because there is nothing to retrieve.

### There is no canonical protocol-version page

Searching for the page that should answer these queries does not find one. A query for
"protocol version history releases list network upgrades" returns validator operations material
— `/docs/validators/admin-guide/network-upgrades`, `/docs/validators/admin-guide/installation`,
`/docs/learn/fundamentals/stellar-data-structures/ledgers#upgrades`. Those describe **how an
operator runs an upgrade**. None states what any protocol version contains. A query for
"CAP protocol upgrade activation ledger version" returns the same operations class.

### The meetings lane does not rescue a bare version number

The 2026-07-03 record noted that the correct content is hit #1 for a meetings-scoped query, and
that is still true — but only for a query carrying distinctive terms. `Protocol 24 Whisk state
archival` still returns `/meetings/2025/10/16#protocol-discussion` at rank #1.

A bare version number does not work in that lane either, and it fails in a new way:

- `Protocol 23 release` returns `/meetings/2026/07/23#the-privacy-stack`. The `23` matched the
  **date** in the URL path, not the protocol version.
- `Protocol 22 release` returns the same 2026-07-23 privacy-stack page.
- `Protocol 24 release` returns a discussion of **Protocol 27**.

Version numbers collide with dates in meeting URLs. That is a second retrieval failure, distinct
from the SEP collision, and it affects the lane the original record proposed boosting.

## Recommendation

Publish a canonical protocol-version reference in the docs: one page per protocol version, or one
page listing every version, stating what each contains, which CAPs it carries, and when it
activated. Today that information exists only in dated meeting notes and in the
`stellar-protocol` repository, neither of which a reader reaches by asking for a protocol version
by name.

Then make `Protocol N` resolve to it. Two retrieval rules are needed, not one:

- Disambiguate `Protocol N` from `SEP-N`. This is the original recommendation and it remains
  correct — it is simply not sufficient on its own.
- Stop a bare version number from matching a date fragment in a `/meetings/YYYY/MM/DD` path.

### Note on remediation path

This is a **content** gap, not a ranking gap, so the operator Algolia credentials cannot fix it.
Ranking rules re-order what an index holds; they cannot return a page that was never written. The
original recommendation looked like an index-side fix because Protocol 24 — the one version with
a competing document — looked like a ranking loss. Across the other six versions there is no
competing document and no correct document either.

The date-collision half is index-side and could be tested read-only. It is worth nothing on its
own: fixing it changes which wrong page is returned.
