---
id: sk-013
service: skills
status: proposed
discovered: 2026-08-04
evidence:
  - current skills.stellar-dev.assets removal example says only `limit: "10000", // 0 to remove trustline`
  - current skill best practices omit balance, buying-liability, open-offer, and liquidity-pool-use preconditions
  - official operation result documentation defines CHANGE_TRUST_INVALID_LIMIT and CHANGE_TRUST_CANNOT_DELETE
  - CAP-0038 defines liquidityPoolUseCount as a deletion constraint for asset trustlines
  - full QA round Todo 1346 c3593 and solo://proj/49/scratchpad/truth-maintenance-20--761
---

## Finding

The assets skill teaches `ChangeTrust(limit: 0)` as trustline removal without
the preconditions that make the operation safe and valid. A zero limit can fail
when balance or buying liabilities remain, and an asset trustline referenced by
a liquidity pool cannot be deleted. Open offers commonly create the liabilities
that must be cleared first.

The omission is safety-relevant because a wallet-display entry, claimable
balance, classic asset trustline, and pool-share position require different
actions. A generic burn address is not a safe substitute for identifying the
asset and resolving its actual state.

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
specific result code. Do not recommend a generic burn address.
