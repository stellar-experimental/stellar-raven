---
id: sd-004
service: stellar-docs
status: declined-upstream
disposition: Accept the owner's operational-policy wording; preserve the consumer truth distinction between stock caps and implementation configurability without re-filing.
discovered: 2026-07-03
evidence:
  - "2026-11-09 sweep (declined): Pagination still calls upper limits hardcoded; current RPC source at its relocated rpcv1/config/options.go exposes all three max/default settings. ElliotFriend relayed Shaptic’s explicit operational-policy decision to retain the wording. Recheck: https://developers.stellar.org/docs/data/apis/rpc/api-reference/structure/pagination.md"
  - developers.stellar.org method pages (getTransactions, getEvents, getLedgers) fetched 2026-07-03
  - stellar/stellar-rpc cmd/stellar-rpc/internal/config/options.go (same day)
  - Solo project 49, todo 828, scratchpad 521 (golden-truth deep-verification round)
  - live re-verified 2026-07-06 (eval round todo 846): the indexed RPC Structure→Pagination page still says the getEvents limit is "hardcoded in Stellar-RPC for performance reasons"; the method pages remain unindexed (sd-003) so their wording could not be re-fetched via search, but the sibling indexed page shows the same unfixed pattern
  - upstream issue filed 2026-07-07: https://github.com/stellar/stellar-docs/issues/2567
  - upstream PR https://github.com/stellar/stellar-docs/pull/2572 merged 2026-07-10 at final head fb4e8ecbb50218b52313c434a9d0d4e8571fdb3a after reverting its intermediate configurable-per-instance wording; the live Pagination page still says the upper limits are hardcoded
  - upstream issue https://github.com/stellar/stellar-docs/issues/2567 closed completed 2026-07-13 with maintainer guidance from ElliotFriend after confirmation with Shaptic: the limits are technically configurable but are not configured in practice, should not be, and may tighten later; advertising the settings would be counter-productive
recurrences:
  - date: 2026-11-06
    evidence: "Pagination still says hardcoded; operator configuration source still exposes max/default settings. Existing explicit ElliotFriend/Shaptic operational-policy decline stands. Exact URLs and upstream state: .agents/rounds/2026-11-05-truth-maintenance/docs.md, row sd-004"
  - date: 2026-08-11
    evidence: live source and Docs recheck — the Pagination page still uses hardcoded-limit wording, while stellar-rpc retains the configuration options. Issue #2567 remains closed completed; its only and closing maintainer comment was ElliotFriend's 2026-07-13 operational-policy decision.
  - date: 2026-07-13
    evidence: closed-unfixed live re-check — the merged Pagination page and crawled record retain the hardcoded wording by explicit owner decision, while current stellar-rpc source continues to expose the max/default options
---

## Finding

The RPC method reference pages describe pagination limits as "hardcoded in
Stellar-RPC for performance reasons" (getTransactions and getLedgers 1–200,
getEvents 1–10000), but in the stellar-rpc source every one of these limits is
an operator-configurable option — `--max-transactions-limit` /
`--default-transactions-limit`, `--max-events-limit` / `--default-events-limit`,
`--max-ledgers-limit` / `--default-ledgers-limit`, settable via CLI/TOML/env —
whose SHIPPED DEFAULTS are the documented numbers (the only validation is
default ≤ max, with no absolute ceiling). By contrast Horizon's 200 IS a true
compile-time constant (`stellar/stellar-horizon`
`internal/db2/page_query.go: MaxPageSize = 200`), so the same word describes
two different things across adjacent doc pages.

## Evidence

Docs: "The limit for getTransactions can range from 1 to 200 - an upper limit that is hardcoded in Stellar-RPC for performance reasons."
Source (`options.go`): `max-transactions-limit` default 200 / `default-transactions-limit` default 50; same pattern for events (10000/100) and ledgers (200/50).

## Recommendation

Do not re-request advertising or recommending cap tuning: the Docs owner explicitly declined that direction on #2567 because operators should not raise stock caps and caps may tighten. If wording is revisited, prefer "supported/effective upper limits" or "stock upper limits" over "hardcoded". Consumer-side, treat the stock limits as the operational contract and keep source configurability as implementation context only.
