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

The QA lint lane `cap-finding` checks the rule. It warns when a cap sentence names no finding, or
names only findings that are not active. It is a warning until the backlog below is cleared.

Cap backlog (35 cases, 39 cap sentences on 2026-11-02): `q-asset-stablecoin-issuers-discovery`, `q-asset-wallet-sdk-seps`, `q-builder-by-region-latam`, `q-builder-by-scf-tier`, `q-builder-rust-soroban-devs`, `q-crp-regional-offramp-mobilemoney`, `q-defi-liquid-staking-whitespace`, `q-defi-streaming-payments-prior-art`, `q-eco-lobstr-wallet`, `q-edge-fresh-latest-scf-round`, `q-edge-noinfo-exact-tvl-figure`, `q-edge-noinfo-stellar-pos-staking-rewards`, `q-edge-scf-v7-centralization-myths`, `q-hot-sdf-transparency-wallets-reports`, `q-hot-sdf-xlm-holdings-sales`, `q-infra-horizon-vs-rpc`, `q-org-sdf-mandate-buckets`, `q-org-sdf-structure-mandate`, `q-scf-current-round`, `q-scf-hackathons-active`, `q-scf-sdf-bug-bounty`, `q-sor-force-fast-archival-localnet`, `q-sor-p23-auto-restore-extendto`, `q-sor-sac-introspection`, `q-sor-ttl-defaults-extend`, `q-soroban-auth-recursion-dos-audit`, `q-soroban-deploy-cli`, `q-soroban-resource-limits`, `q-soroban-sdk-cve`, `q-soroban-storage-types`, `q-ti-cli-rust-windows-troubleshooting`, `q-ti-rpc-gettransactions-pagination-xdr`, `q-tool-cli-testnet-identity-howto`, `q-tool-soroban-auth-audit-live`, `q-tool-zk-repo-live`.

The three `sd-003` caps named in the independent review were already removed by PR #321 (`sd-003`
retirement), which merged before this branch.

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
  `q-pc-practical-fee-setting` (2027-01-30; dated fee-floor and Horizon-lifecycle statements; the
  Horizon label changed twice in 2026, so it gets a short window).
  The other six had live 2026-11-02 evidence for their values from the audit.
- `stable`, durable wording (4): the golden pinned the base reserve "as of <date>". The base
  reserve is a network parameter that changes only by validator vote. The golden now says
  "currently 0.5 XLM" with that caveat, and the register `numericInvariants` "base reserve" entry
  keeps the siblings consistent: `q-asset-trustline-basics` (answer and notes),
  `q-edge-1xlm-activation-fee`, `q-pc-account-activation-not-found` (answer and the "dated" key
  fact), and `q-asset-amm-fee-reserve` (notes).

The corpus lint caps the `scheduled` share at 35%. Seven moves bring it to 175 of 501 (34.9%). Ten
moves would have broken the cap, which is why the base-reserve cases use durable wording instead.

New lint rule (`lintGoldenAuthoring`, lane `freshness`): a `stable` golden whose answer or key facts
contain "as of <date>" fails. The same text in `notes` or `avoid` is a warning, because a dated
observation there can be historical. Seven stable cases carry such warnings now; the riskiest is
`q-pc-protocol-26-yardstick` (CAP-0081 "Protocol version: TBD" as of 2026-11-02).

Register: the edits reopened 21 clusters and the "base reserve" and "Stellar base fee floor"
invariants. Each re-sweep reason names the changed members and the unchanged claim. No stated value
changed, so all entries are consistent.

## D3 — re-judge of saved rows

The owner approved the paid re-judge on 2026-11-02. The saved run with the most overlap is
`eval/qa/results/2026-10-07-tool-surface-qa/2026-10-08T02-40-37-variantA.json`. It has 41 rows
whose case is in `2026-11-02-golden-audit/rejudge-set.json` (`allGospelChanged`). The run was a
paired design: the same answers and the same judge (`claude-sonnet-5`), graded once against
`cases.json` at `12f182e2` (before PR #319) and once at `049fb747` (after it). Only the golden
differs between the arms. The record is `2026-11-02-golden-audit/rejudge-summary.json`. It holds
the per-row verdicts and the SHA-256 of both artifacts. The full artifacts stay outside Git, in the
local `eval/qa/results/2026-11-02-golden-audit-rejudge/` folder of the owner checkout.

| | correct | partial | wrong |
|---|---|---|---|
| Saved verdicts | 14 | 20 | 7 |
| Old golden | 14 | 22 | 5 |
| New golden | 12 | 23 | 6 |

Judge noise: on an unchanged golden, 6 of 41 saved verdicts differ from the old arm. The golden
edits moved 7 of 41 verdicts, 2 up and 5 down. Cost: $3.36 (old arm) and $3.52 (new arm), $6.88 in
all, against a $15 cap for each arm.

Flip reading:

- Caused by a truth change in the golden, down: `q-defi-bridge-evm-to-stellar-axelar` (the answer
  calls Allbridge a live route; the new golden records the discontinued pool route),
  `q-defi-comet-what-is` (the new golden adds the V1.1 backstop replacement and the Inactive
  status), `q-protocol-ledger-header-fields` (the key fact now names `ext`, which the answer omits).
- Caused by a truth change in the golden, up: `q-hist-quantum-preparedness-plan`. CAP-0087 is now
  in Protocol 30 "Bell" with dated upgrade votes, so "Stage 1 is shipping" is no longer a false claim.
- Inside the noise band, with no golden text that supports the change:
  `q-protocol-parallel-execution` (up; the judge moved the same single-cluster omission from a wrong
  claim to a missing fact), `q-scf-cross-reflector-rounds-current` (down; the golden changed only
  its observation date, and the new judge caught an unsupported contract address), and
  `q-ti-custodial-account-generation-c-address` (down; the golden changed only notes provenance,
  and the judge recorded no wrong claim).

Result: the audit did not launder scores. Truth-driven flips go down three times and up once, and
the one upward flip has a primary-source reason. No saved row needs a golden change from this run.
The other 173 gospel-change cases have no row in that saved run. The next QA round grades them
against the new golden.

## Upstream filing

PR #322 and `2026-11-02-upstream-filing.md` record it: 15 issues filed (stellar/stellar-docs
#2997 to #3008, stellar/stellar-protocol#2055, circlefin/stellar-cctp#36 and #37), three findings
linked to pre-existing upstream PRs, and `sd-075` fixed upstream during the round.
