---
id: sd-037
service: stellar-docs
status: reported-upstream
discovered: 2026-07-11
upstreamTitle: Add SLPs to the canonical proposal index and repository overview
evidence:
  - P4 N2 candidate identifies SLP-0004 and SLP-0006 as high-value 2026 protocol facts whose limits/ proposal family is substantially less discoverable than CAPs and SEPs; solo://proj/49/scratchpad/super-corpus-rebuild--585
  - the P4 N2 YieldBlox reconciliation relies on SLP-0006 for the affected-account/quarantine context, showing practical retrieval impact
  - live recheck 2026-07-14: stellar-protocol root README describes only CAPs and SEPs and has badges only for those families; limits/ contains SLP-0001 through SLP-0006 but limits/README.md has no proposal index
  - live Algolia recheck 2026-07-14: SLP-0004 and SLP-0006 queries route to the SEP overview rather than a canonical SLP family page
  - upstream issue filed 2026-07-14: https://github.com/stellar/stellar-protocol/issues/1981
  - 2026-09-04 issue state: #1981 remains open; its only comment is the 2026-08-14 github-actions stale notice, not maintainer activity
  - 2026-09-21 source check at stellar-protocol 265d64edc87627707941a31bd12798b7fdeb47d1 still reproduced the defect; both README SHA-256 values equal the 2026-09-04 values. Issue #1981 closed as not_planned on 2026-09-14 by the stale bot, with no maintainer decision. The owner decided not to reopen it
  - author-owned fix opened and read back 2026-09-21: https://github.com/stellar/stellar-protocol/pull/2021 adds a List of Proposals table to limits/README.md and an SLP mention to the root README (17 added lines, 0 removed; all four checks pass)
  - "2026-10-06 PR state: https://github.com/stellar/stellar-protocol/pull/2021 is open at head 53557ae2 (our merge of master on 2026-10-01). leighmcculloch (MEMBER) approved at 2026-09-29T21:44:44Z, and the approval is not dismissed. leighmcculloch enabled squash auto-merge at 2026-09-29T21:45:54Z. All four checks pass, and mergeable_state is blocked."
  - "2026-10-06 merge blocker: the master branch ruleset sets required_review_thread_resolution true. One outdated Copilot review thread (discussion_r4064649027) is unresolved. Our reply (discussion_r4137499419) states that commit 65d35aeb fixed it. Resolution of that thread is author-owned work."
recurrences:
  - date: 2026-08-11
    evidence: live stellar-protocol recheck — README still names only CAPs and SEPs, limits/README.md still has no SLP index, and limits still contains slp-0001.md through slp-0006.md. Docs search still returns SEP material for SLP-0004/SLP-0006. Issue #1981 remains open without comments or maintainer activity.
  - date: 2026-08-04
    evidence: eval/qa/results/2026-08-04T20-23-20-variantA.json q-pc-slp-0004-0006-status searched the available proposal/docs surfaces and concluded the SLP family did not exist, while canonical limits/slp-0004.md and limits/slp-0006.md directly establish both proposals
  - date: 2026-09-04
    evidence: current stellar-protocol commit 65e2b6262c0825494caf2a94116eb512c8335f22 reproduced the remaining exact defect. Root README prose SHA-256 ecb809f47f17a42046265c3df7de0f05c2357bc0e909167b0e73697b0da33a0d names CAPs and SEPs only. limits/README.md SHA-256 4bfd8ffeff53ec0697d77fbee8234152af869574e50c73c0832a7eeeba39d2a3 names SLPs but has no identifier, title, or status index. limits/slp-0004.md SHA-256 657c2d3344611d10f366a9c19a9d7b3b2428761d25810d8d49312f934e55ffe0 remains a canonical proposal. Issue #1981 is open; its only comment is the 2026-08-14 stale bot notice.
  - date: 2026-10-06
    evidence: "stellar-protocol master 974df5f0ae3e544e2479c50f844924e5e8f94d2e (2026-09-30) still reproduces the defect. The root README names limits only in the directory tree (line 50) and does not mention SLPs. limits/README.md has no List of Proposals and no SLP-000x entry. PR 2021 is not merged."
---

## Finding

The canonical `stellar-protocol` repository contains six Stellar Limits
Proposals under `limits/`, but its root README describes the repository as home
to CAPs and SEPs and exposes badges only for those two families. The
`limits/README.md` process document does not index the individual SLPs, titles,
or statuses. Downstream discovery consequently has no canonical SLP family index
to link or crawl.

## Evidence

On 2026-07-14 the canonical tree contained `slp-0001.md` through
`slp-0006.md`, while the root overview still named only CAPs and SEPs and the
limits overview had no proposal list. Read-only Docs Algolia queries for
`SLP-0004` and `SLP-0006` returned the SEP overview rather than an SLP family
page, demonstrating the practical ambiguity without treating search absence
alone as the source defect.

## Recommendation

Recognize SLPs alongside CAPs and SEPs in the root repository overview, link the
`limits/` family directly, and add a maintained index of SLP identifiers, titles,
and statuses to `limits/README.md`. That canonical index can then be linked from
Docs and surfaced by search without inventing SEP/CAP labels for SLP material.
