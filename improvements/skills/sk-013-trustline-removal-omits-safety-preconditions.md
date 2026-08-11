---
id: sk-013
service: skills
status: reported-upstream
discovered: 2026-08-04
upstreamTitle: Add trustline-removal preconditions to the ChangeTrust example
evidence:
  - current skills.stellar-dev.assets removal example says only `limit: "10000", // 0 to remove trustline`
  - current skill best practices omit balance, buying-liability, open-offer, and liquidity-pool-use preconditions
  - official operation result documentation defines CHANGE_TRUST_INVALID_LIMIT and CHANGE_TRUST_CANNOT_DELETE
  - CAP-0038 defines liquidityPoolUseCount as a deletion constraint for asset trustlines
  - full QA round Todo 1346 c3593 and solo://proj/49/scratchpad/truth-maintenance-20--761
  - 2026-08-05 live primary-source recheck: stellar/stellar-dev-skill main (381ca32a) assets SKILL.md still presents limit 0 as removal without balance, liability, offer, or pool-reference preconditions
  - 2026-08-05 primary-source check: Stellar XDR and CAP-0038 define CHANGE_TRUST_INVALID_LIMIT for an uncleared balance/liability and CHANGE_TRUST_CANNOT_DELETE for a pool reference
  - upstream issue filed 2026-08-05: https://github.com/stellar/stellar-dev-skill/issues/81
recurrences:
  - date: 2026-08-11
    evidence: current upstream assets SKILL.md still gives only `limit: "10000", // 0 to remove trustline` in its ChangeTrust example. The surrounding trustline section still omits balance, buying-liability, open-offer, and liquidity-pool-reference removal preconditions.
---

## Finding

The assets skill teaches `ChangeTrust(limit: 0)` as trustline removal without
the preconditions that make the operation safe and valid. A zero limit can fail
when balance or buying liabilities remain, and an asset trustline referenced by
a liquidity pool cannot be deleted. Open offers commonly create the liabilities
that must be cleared first.

The omission is safety-relevant because a wallet-display entry, claimable
balance, classic asset trustline, and pool-share position require different
actions.

## Evidence

Observed 2026-08-04 in the exposed `skills.stellar-dev.assets` playbook and
checked against:

- https://developers.stellar.org/docs/learn/fundamentals/transactions/list-of-operations
- https://github.com/stellar/stellar-protocol/blob/master/core/cap-0038.md
- https://github.com/stellar/stellar-dev-skill/blob/main/skills/assets/SKILL.md

## Recommendation

Expand the one removal example just enough to require: identify the asset by
code and issuer; distinguish an actual trustline from display or claimable-
balance state; clear balance and relevant offers/liabilities; exit pool-share
positions or references; then submit `ChangeTrust(limit: 0)` and surface the
specific result code.
