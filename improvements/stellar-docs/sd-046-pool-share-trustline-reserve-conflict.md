---
id: sd-046
service: stellar-docs
status: proposed
discovered: 2026-08-30
upstreamTitle: Lumens and Accounts pages obscure the two-reserve cost of pool-share trustlines
evidence:
  - 2026-08-30 live read of https://developers.stellar.org/docs/learn/fundamentals/lumens grouped traditional-asset and pool-share trustlines as account subentries without naming the pool-share two-reserve exception
  - 2026-08-30 live read of https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/accounts grouped traditional-asset and pool-share trustlines as account subentries without naming the pool-share two-reserve exception
  - 2026-08-30 live read of https://developers.stellar.org/docs/learn/fundamentals/liquidity-on-stellar-sdex-liquidity-pools stated that a pool-share trustline requires two base reserves instead of one
  - 2026-08-30 live read of https://github.com/stellar/stellar-protocol/blob/master/core/cap-0038.md stated that a pool-share trustline counts as two subentries and requires two base reserves
---

## Finding

The Lumens and Accounts pages group traditional-asset and pool-share trustlines as account
subentries. Neither page states the important reserve exception. A pool-share trustline counts as
two subentries and requires two base reserves.

The Liquidity Pools page states the two-reserve rule. CAP-0038 defines the same rule. A reader who
uses only the general account pages can treat every trustline as one reserve unit.

This finding is distinct from `sd-043`. That finding removes selling liabilities from the
minimum-balance formula. This finding concerns the subentry multiplier for pool-share trustlines.

## Evidence

The four current sources were read on 2026-08-30. The Liquidity Pools page says that a pool-share
trustline requires two base reserves instead of one. CAP-0038 says the entry counts as two
subentries and therefore requires two base reserves.

The Lumens and Accounts pages use broader subentry lists. They do not state this exception beside
their trustline wording. The split makes the general pages incomplete for minimum-balance work.

## Recommendation

Add the pool-share exception beside the trustline item on both general pages. State that a normal
asset trustline adds one reserve unit. State that a pool-share trustline adds two reserve units.

Link the exception to the Liquidity Pools page. Keep the account formula consistent with CAP-0038
and the existing Liquidity Pools explanation.
