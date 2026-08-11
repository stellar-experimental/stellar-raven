---
id: sd-008
service: stellar-docs
status: reported-upstream
discovered: 2026-07-09
evidence:
  - live Horizon first-activation boundary rechecked 2026-07-09: ledger 63386818 closed at 2026-07-08T17:00:05Z under Protocol 26; ledger 63386819 closed at 17:00:10Z under Protocol 27
  - developers.stellar.org Software Versions fetched 2026-07-09 still heads Protocol 27 as "Testnet, June 18, 2026" and Protocol 26 as "Mainnet, May 6, 2026"
  - stellar/rs-soroban-sdk latest release API rechecked 2026-07-09: v27.0.0, prerelease false, published 2026-07-08T19:48:45Z; the P27 table still lists Smart Contract Rust SDK and Stellar CLI as TBD
  - Solo project 49, todo 831 and truth-maintenance scratchpad 567 independent corroboration matrices
  - eval/qa/reviewed/2026-07-09-improvements-evidence.md (durable redacted review of the 8-case post-vote P27 smoke: 0 correct / 3 partial / 5 wrong; every verdict manually reviewed)
  - upstream issue filed 2026-07-09: https://github.com/stellar/stellar-docs/issues/2574
  - independent Docs-team audit 2026-07-14 reproduced the activation and release facts and found the P27 JavaScript SDK row still pinned to prerelease v16.0.0-rc.2 after stable v16.0.0/v16.0.1 releases: https://gist.githubusercontent.com/ElliotFriend/3b3641b929b4408a834b85bcb4e75449/raw/a90e6b453ee3505ef2525b4428eaa75752e3ae08/raven-audit-rebuttal.md
recurrences:
  - date: 2026-08-11
    evidence: live source recheck — software-versions.mdx still heads Protocol 27 as Testnet and Protocol 26 as Mainnet. Issue #2574 remains open; its latest substantive maintainer comment is ElliotFriend's 2026-07-21 verification, and the other recorded comments are Claude/Codex error messages.
  - date: 2026-07-13
    evidence: structured HTTP probe returned 200 and still rendered Protocol 27 as Testnet while retaining Protocol 26 as the Mainnet heading
  - date: 2026-07-14
    evidence: live table still labels P27 Testnet and P26 Mainnet; retained locally because the issue contained only bot activity and did not warrant a follow-up comment
probe:
  type: http-text
  url: https://developers.stellar.org/docs/networks/software-versions
  expect:
    status: 200
    contains:
      - Protocol 27 (Testnet, June 18, 2026)
      - Protocol 26 (Mainnet, May 6, 2026)
---

## Finding

The Software Versions page still presents Protocol 27 as Testnet-only after Mainnet activation.

It retains Protocol 26 as the latest Mainnet section after Stellar Mainnet activated Protocol 27.
It also leaves the P27 Smart
Contract Rust SDK and Stellar CLI rows as `TBD` after stable v27.0.0 releases became available.

This is not a network ambiguity. The adjacent live Horizon ledgers show the exact transition:
ledger 63386818 closed under Protocol 26 at 2026-07-08 17:00:05 UTC, and ledger 63386819 closed
under Protocol 27 at 17:00:10 UTC. Independent RPC/protocol-history checks agree.

## Evidence

On 2026-07-09, `https://horizon.stellar.org/` reported `current_protocol_version: 27`, and
`https://horizon.stellar.org/ledgers/63386819` reported `protocol_version: 27`. The official SDF
Zipper upgrade guide had scheduled the Mainnet vote for July 8, matching the observed boundary.

The live Software Versions page still rendered headings for `Protocol 27 (Testnet, June 18,
2026)` and `Protocol 26 (Mainnet, May 6, 2026)`, with no P27 Mainnet section. Its P27 table listed
the Smart Contract Rust SDK and Stellar CLI as `TBD`, while the GitHub release APIs returned stable
`rs-soroban-sdk v27.0.0` and `stellar-cli v27.0.0` releases.

The lag created expired golden traps across the QA corpus: a current, network-grounded answer that
correctly said P27 was live would have been punished by several stale `avoid` clauses. Those local
goldens were corrected through the `golden-truth` workflow; the upstream page remains the source of
future agent confusion.

The durable reviewed record at
`eval/qa/reviewed/2026-07-09-improvements-evidence.md` captures a focused eight-case QA smoke after
the local correction. Five answers were wrong and three partial. Docs-backed answers repeatedly
called Protocol 26 current, treated the July 8 vote as unconfirmed, omitted the P27 history tail, or
denied that CAP-0071 delegation was a protocol feature; the two partial release answers found v27
facts but missed either activation or the live release tag. The one SDK/CLI answer that recovered
both stable v27.0.0 versions still lacked the durable release-feed freshness caveat. Manual review
found no judge artifacts in the eight verdicts: this is upstream truth/discoverability drift plus
downstream synthesis, not a score-only regression.

## Recommendation

Add a `Protocol 27 (Mainnet, July 8, 2026)` section (or update the existing P27 heading so both
Testnet and Mainnet activation dates are explicit), populate the stable Rust SDK and CLI versions,
and keep Testnet-vs-Mainnet support rows unambiguous. If the page intentionally tracks a curated
support matrix rather than the newest patch release, say so and link the live GitHub release feeds.
Sweep non-`TBD` rows for stale prerelease pins rather than copying the P27 Testnet table unchanged.
