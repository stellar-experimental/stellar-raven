# 2026-11-02 — grading-policy decisions from the golden audit

## Scope

The 2026-11-02 golden audit (`2026-11-02-golden-audit.md`, PR #319) left three owner decisions.
The owner answered them on 2026-11-02:

1. Partial caps: "I'm fine to mark as partial but we also need to be actively pushing upstream fixes
   where the 'official' sources are wrong."
2. Freshness tags: "whatever you think is best for the service itself is fine with me".
3. Re-judge of saved rows: approved.

## D1 — partial caps follow open upstream findings

ADR-0008 now has a 2026-11-02 amendment. A cap is accepted while it names an active
`improvements/` finding, and it ends when that finding is fixed upstream. A cap without an active
finding is a plain rule. Each finding that backs a cap is filed upstream once its live re-check
passes. The `golden-truth` and `improvements-pipeline` skills carry the same rule.

Upstream filing for this round is recorded under "Upstream filing" below.

## D2 — freshness tags

The audit named 11 `live` and 5 `stable` cases with dated values. A full scan found 83 `live` and
16 `stable` cases whose golden text carries "as of <date>" or a similar dated value.

- `live` (83): no change. Most use the standard `live` template. It grades the behavior and marks
  the dated value as an example ("The dated example is illustrative: a later grounded answer should
  report what the same source basis supports at its own observation time"). This is the intended
  design for `live` cases.
- `stable`, historical (6): no change. The dates name past events, not current values:
  `q-defi-ondo-usdy`, `q-hist-yieldblox-v2-2026-exploit`, `q-token-circle-usdc-on-stellar`,
  `q-token-initial-supply-distribution`, `q-pc-protocol-27-zipper`, `q-protocol-24-whisk-incident`.
- `stable` to `scheduled` (7): the golden pins a value that can change. Each case gets
  `truth.asOf` 2026-11-02 and a `reverifyBy` date on a day that had no other case.
  `q-defi-lumenloop-categories-vocab` (2027-01-04; re-checked live: `lumenloop.get_categories`
  returned the same five values at 2026-11-02T20:08:19Z), `q-defi-reflector-oracle` (2027-01-07),
  `q-defi-wisdomtree-crdt` (2027-01-10), `q-eco-dex-saturation` (2027-01-16),
  `q-eco-lobstr-wallet` (2027-01-19), `q-eco-nft-marketplace-whitespace` (2027-01-25), and
  `q-pc-practical-fee-setting` (2027-06-18; dated fee-floor and Horizon-lifecycle statements).
  The other six had live 2026-11-02 evidence for their values from the audit.
- `stable`, durable wording (3): the golden pinned the base reserve "as of <date>". The base
  reserve is a network parameter that changes only by validator vote. The golden now says
  "currently 0.5 XLM" with that caveat, and the register `numericInvariants` "base reserve" entry
  keeps the siblings consistent: `q-asset-trustline-basics`, `q-edge-1xlm-activation-fee`,
  `q-pc-account-activation-not-found`.

The corpus lint caps the `scheduled` share at 35%. Seven moves bring it to 175 of 501 (34.9%). Ten
moves would have broken the cap, which is why the base-reserve cases use durable wording instead.

New lint rule (`lintGoldenAuthoring`, lane `freshness`): a `stable` golden whose answer or key facts
contain "as of <date>" fails. It prevents the same drift from returning.

Register: the edits reopened 20 clusters and the "base reserve" and "Stellar base fee floor"
invariants. Every member keeps the same values (0.5 XLM, 1 XLM, 100 stroops), so all entries were
re-swept as consistent.

## D3 — re-judge of saved rows

Pending; results are recorded below when the run completes.

## Upstream filing

Pending; results are recorded below when filing completes.
