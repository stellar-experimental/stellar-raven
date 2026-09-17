> Correction, 2026-09-17: the Soroswap page lists Aqua as "currently on Testnet". It does not omit Aqua.
> The original observation below is retained as review history. `cs-002` records the verified source defect.

# Source-truth check: four frozen goldens (verification only)

- **Date:** 2026-09-17 (probes 01:19–01:22 UTC).
- **Method:** golden-truth skill, verification only. No corpus or candidate edits. No paid calls,
  servers, Git writes, agents, external messages, or current-answer inspection.
- **Probes:** all free and read-only:
  - Class A: operator docs as GitBook `.md` pages, the official SCF project page, and the SDF blog.
  - Class B: GitHub API reads.
  - Class C: the public Scout API (not counted as corroboration for Scout's own claims).
  - Class F: one pubnet `simulateTransaction` against a public RPC (no signing or submission).
  - DeFiLlama public API for volatile grader-note context.
- **Raw evidence:** this directory.

## Summary

| Case | Verdict |
|---|---|
| `q-defi-aquarius-what-is` | Answer and key facts **confirmed**. One grading ambiguity. Volatile grader-note context is **stale**. |
| `q-defi-blend-what-is` | **Confirmed.** |
| `q-defi-soroswap-what-is` | Answer and key facts **confirmed**, including the dated adapter set. The grader-note caution is **misattributed / stale**. |
| `q-eco-lobstr-wallet` | Identity, custody, networks, and scale attributions **confirmed**. SCF-total "disputed" framing is **contradicted by the current official SCF project page**. An avoid item may now punish a true, officially sourced claim. |

## q-defi-aquarius-what-is

Confirmed against current primary docs (A), `docs.aqua.network/*.md`:

- **Welcome:** "Aquarius is the liquidity layer of the Stellar network — an AMM protocol governed
  by AQUA holders", on its own Soroban AMM.
- **ICE tokens:** ICE is "non-transferable … cannot be sent, traded, or deposited anywhere".
  - The lock multiplier caps at 10x at 1,095 days.
  - ICE melts linearly toward 1x at unlock.
  - The lock creates a claimable balance.
  - Roles: ICE tracks the lock and has "no direct operational use"; upvoteICE votes for markets;
    governICE votes on proposals.
  - "downvoteICE … was deprecated in June 2026."
- **Governance:** "Governance voting does not offer rewards — it's purely for protocol
  decision-making."
- **ICE boosts:** the boost of up to x2.5 applies to liquidity-provider AQUA rewards (AMM and SDEX
  inputs).
- **AQUA token:** used for locking, rewards, voting incentives, and governance, and swappable.
- **Code organization:** the docs link `github.com/AquariusDeFi`, whose footprint was not re-listed
  this pass.

Grading ambiguity (not wrong, report only):

- Liquidity voters on incentivized markets receive daily voting-incentive payouts, often in AQUA.
  Protocol voting incentives are funded from AMM fees ("Guaranteed payouts").
- Whitelisted delegates share a 10M AQUA monthly reward pool.
- The avoid item "merely holding ICE or voting guarantees AQUA emissions" is still true for
  emissions and governance votes. A judge could misapply it to a true statement about AQUA
  voting-incentive or delegate rewards.

Stale volatile grader-note context:

- The notes cite "DeFiLlama ~$48M mid-2026" and "~20% of DeFiLlama-listed Stellar TVL".
- DeFiLlama at 2026-09-17: Aquarius $36.9M, still the top Stellar DEX. That is 10.3% of the summed
  Stellar chain TVL, which double-counts some allocators.
- The notes are non-gating, but "~20%" no longer holds.

Upstream gap candidate (Scout description precision): the live Scout short description says "AQUA
locks into ICE for on-chain DAO governance votes directing rewards". That merges unrewarded
governICE governance with upvoteICE liquidity voting, which directs rewards. Monitor-only; not
filed.

## q-defi-blend-what-is

Confirmed:

- **A, `docs.blend.capital/users/general-faq.md`:** Blend lets any entity "create or utilize an
  immutable lending market"; "immutable smart contracts running on Stellar's Soroban"; "No central
  organization controls Blend"; isolated pools; permissionless pool deployment; cannot be
  upgraded (only an emissions fork).
- **A, `pool-creators/general.md`:** creators select assets and parameters, pool-management
  strategy, oracle, and backstop take rate; "Blend has no DAO"; owned pools and a governance
  contract as pool owner are possible.
- **A, `pool-management.md`:** owned pools (admin) versus standard pools (dead admin); admin
  risk/interest changes queue for 7 days.
- **A, `users/lending-borrowing/borrowing.md`:** borrowing requires sufficient collateral.
- **Script3 attribution:**
  - the SDF blog "composability-on-stellar-from-concept-to-reality" says "Blend, a decentralized
    lending protocol created by Script3"
  - Script3's site (`script3.io`) spotlights Blend
  - the `blend-capital` GitHub org (name "Blend") holds `blend-contracts-v2` (AGPL-3.0; "permissionless
    creation of lending pools")
- **C (context only):** Scout builtBy Script3.

Nuance (non-blocking): pool-creator docs describe possible RWA credit-line markets where
whitelisted entities borrow without posting collateral. The key fact "supports over-collateralized
borrowing" stays true; it is not an "only" claim.

## q-defi-soroswap-what-is

Confirmed:

- **B, `soroswap/.github` profile:** "Soroswap.Finance is developed by the PaltaLabs 🥑 Team." The
  org description reads "Open-source AMM protocol … With SDK and easy to use frontend."
- **F, pubnet `get_adapters` on aggregator `CAYP3UWLJM7ZPTUKL6R6BFGTRWLZ46LRKOXTERI2K6BIJAWGYY62TXTO`**
  (ledger 64464442, 2026-09-17T01:19:50Z):
  - three unpaused adapters, protocol_id 0/1/2
  - per the aggregator enum these are Soroswap=0, Phoenix=1, Aqua=2 (Comet=3 absent)
  - this matches the golden's dated 2026-07-10 snapshot
  - the aggregator ID matches `soroswap/aggregator/public/mainnet.contracts.json`
- **A/B, `soroswap/docs`:**
  - `concepts/aggregator.mdx`: "Stellar SDEX is not included … the Soroswap Aggregator only works
    with Soroban-based protocols."
  - `api/index.mdx`: quotes across "Soroswap, Phoenix, Aqua and SDEX"
  - `index.mdx`: "the first DEX and AMM aggregator on Stellar" (operator marketing; the golden's
    attribution rule holds)

Stale or misattributed golden note: the caution says a "cached or older copy" shows
"pre-2026-07-14 editorial text fixed by sls-015". Two facts undercut it:

- sls-015 fixed Scout OpenAPI `searchProjects` operation prose, not project-record text.
- The **live** Scout Soroswap record still says "Soroswap is the first decentralized exchange (DEX)
  and DEX aggregator on Stellar Soroban…"

So the caution's trigger condition does not describe the live source. Truth is unaffected, and
attributing "first" to the source remains acceptable under the golden. A future golden-truth pass
should rewrite the caution's source reference.

Upstream gap (third party, no improvements collection): Soroswap docs `concepts/aggregator.mdx` is
stale. It lists Phoenix as "currently on Testnet" and omits Aqua. The live mainnet aggregator has
active Phoenix and Aqua adapters.

## q-eco-lobstr-wallet

Confirmed:

- **A, `lobstr.co`:** "Simple & Secure Stellar & XRPL Wallet"; "You control your keys";
  "1,000,000+ Total users"; "10,000,000+ Monthly transactions"; iOS and Android apps, Vault, and
  Signer Extension.
- **A, `ultrastellar.com`:** lists LOBSTR, LOBSTR Vault, StellarX, and StellarTerm as Ultra Stellar
  products. It still describes LOBSTR as a "Stellar Wallet" only, which is stale on XRPL but not
  contradictory.
- **Google Play `com.lobstr.client`:** "simple and secure wallet for Stellar and XRP Ledger
  (XRPL)"; 1M+ downloads; updated 2026-09-11; developer "Ultra Stellar OU", Tallinn, Estonia. This
  is independent of SDF and consistent with the golden's avoid on SDF operation.
- **D, XRPL Commons, 2026-04-14:** "more than 1.5 million LOBSTR users".
- **C (context only):** Scout record: Ultra Stellar, networks `["stellar","xrpl"]`.

**Contradicted truth premise (SCF totals).** The official SCF project page (A),
`https://communityfund.stellar.org/project/lobstr-gcn`, fetched 2026-09-17, carries:

- project `totalAwarded: 232000` and `totalPaid: 267462.64`
- SCF #17 "Ultra Stellar / Soroban Integration", Awarded, `budget: 144000`, "Legacy v4.0 Award"
- SCF #22 "LOBSTR: new Soroban features", Awarded, `budget: 88000`, "Legacy v5.0 Community Award"
- round 2 (Legacy v1.0) with no USD amount

Scout now reports `scfBasis: official-record`, `scfAmountStatus: disclosed`, $232,000, and the same
per-round amounts, sourced to that page (scfAsOf 2026-08-12).

Consequences:

- The truth row "only the SCF #22 $88,000 amount was ever officially published … both aggregator
  totals are their own reconstructions" is contradicted by the current official page.
- The "$232,000 vs $267,463" disagreement is explained by an official **awarded versus paid**
  distinction, not by two reconstructions.
- Round-level incompleteness remains: SCF #2 has no USD value. So "official amounts are incomplete"
  is true for the round list but not for the official project totals.
- **Grading risk:** the avoid item "pin either disputed cumulative SCF total" and the answer text
  "aggregators disagree" can punish a true, officially sourced claim. An example is "$232,000
  awarded ($267,463 paid) per the SCF project page". That breaks the hard rule that traps punish
  only false claims.

Unresolved: whether the official page carried these totals on 2026-07-11. The distinction between
freshness drift and original verification error needs an archived snapshot or the page history.

Upstream context: Lumenloop's awarded-versus-paid ambiguity is already covered by
`improvements/lumenloop/ll-013-scf-submission-award-fields.md` (reported-upstream). No new filing
is needed from this pass.

## Recommended follow-up (no edits made)

1. **LOBSTR:** run a golden-truth change for the SCF-total framing and avoid item. Re-verify with a
   second independent class and page history. Root cause: freshness drift or a verification error,
   to be determined. Also check the sibling cases `q-builder-by-scf-tier`,
   `q-raph-lobstr-legitimacy`, and `q-eco-stellar-wallets-list`.
2. **Soroswap:** correct the caution's source reference (sls-015 does not cover project-record
   text). No truth change.
3. **Aquarius:** refresh or remove the stale "~20%" and "~$48M" grader context. Consider clarifying
   that the avoid item concerns emissions, not voting-incentive or delegate payouts.
4. **Blend:** no action.

For paid-artifact review: treat any LOBSTR row whose grade turns on an SCF dollar total as a
suspect judge artifact until item 1 is resolved.
