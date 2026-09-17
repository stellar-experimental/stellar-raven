---
id: sls-086
service: stellar-light-scout
status: reported-upstream
discovered: 2026-09-17
upstreamTitle: Aquarius project description credits reward direction to ICE governance votes
evidence:
  - "2026-09-17T03:35:02Z live GET https://stellarlight.xyz/api/projects/search?q=aquarius&limit=3 returned HTTP 200 (response sha256 ecd622fe782b91ba56739884f0fea6d40a8869078b300ec0a35326fd7d156eab). Row slug aquarius, shortDescription ends: \"AQUA locks into ICE for on-chain DAO governance votes directing rewards across DEX/AMM markets.\""
  - "Canonical source 2026-09-17: https://docs.aqua.network/aqua-and-ice/ice-tokens-locking-aqua-and-getting-benefits.md (sha256 1cf038f3092c934323c706b32a4a021d53c2e944bc004e59884225b107a5570c). Line 46: ICE \"Tracks how much AQUA you have locked and determines the distribution of upvoteICE and governICE. No direct operational use.\" Line 47: upvoteICE \"Votes for markets at aqua.network/vote\". Line 48: governICE \"Votes on governance proposals\"."
  - "Canonical source 2026-09-17: https://docs.aqua.network/governance/aquarius-governance-community-led-decision-making.md (sha256 28186c716d623bbc692f12eb4bc11e40585ffbb61e448825e687a6780aaa6bca). Line 11: users vote on proposals with governICE. Line 12: \"Governance voting does not offer rewards — it's purely for protocol decision-making.\""
  - "Canonical source 2026-09-17: https://docs.aqua.network/user-guides/how-to-use-aquarius-governance/how-to-make-a-governance-vote.md (sha256 e1c7c8cc98f42c0704eb5b432d1c52e15040f6ad586a68b7df26c61ea4a46ccb). Line 15: \"Voting uses governICE\"."
  - "Consumer context: in Raven's 2026-09-17 routing audit, paired answers for q-defi-aquarius-what-is collapsed ICE, upvoteICE, and governICE in both arms. This is consistent with the description; causality is not established. M1-B1 artifact sha256 ef988d64c2070f98196f2981d7028d66158492a85745be558c1c4e0bbf08afa0; M1-C1 artifact sha256 9f5fdab852d5c7e7ab872f238491df818fcd2b33dce411f6a8992d5f1c105308."
  - "Prevalence: one project row (aquarius). Other Scout descriptions were not surveyed."
  - "Dedupe 2026-09-17: no active or resolved Raven finding covers this description; resolved sls-026 concerns Aquarius SCF totals. GitHub search repo:Stellar-Light/stellarlight for \"aquarius ICE\", governICE, and upvoteICE returned 0 results."
  - "Raw evidence: research/audits/2026-09-17-routing-audit/aquarius-description-roles.md."
  - upstream issue filed 2026-09-17: https://github.com/Stellar-Light/stellarlight/issues/1674
---

## Finding

The Aquarius project description says: "AQUA locks into ICE for on-chain DAO governance votes directing rewards across DEX/AMM markets."
Aquarius documents two separate vote types.
upvoteICE votes on markets and directs AQUA rewards.
governICE votes on governance proposals, and those votes offer no rewards.
ICE itself only tracks the locked amount and determines the upvoteICE and governICE balances.
The description credits reward direction to governance votes and omits the token distinction.

## Evidence

Live `projects/search?q=aquarius` row `aquarius`, field `shortDescription`:

> AQUA locks into ICE for on-chain DAO governance votes directing rewards across DEX/AMM markets.

Aquarius documentation:

- [ICE tokens](https://docs.aqua.network/aqua-and-ice/ice-tokens-locking-aqua-and-getting-benefits.md):
  - ICE: "Tracks how much AQUA you have locked and determines the distribution of upvoteICE and governICE. No direct operational use."
  - upvoteICE: "Votes for markets at aqua.network/vote".
  - governICE: "Votes on governance proposals".
- [Aquarius governance](https://docs.aqua.network/governance/aquarius-governance-community-led-decision-making.md):
  "Governance voting does not offer rewards — it's purely for protocol decision-making."
- [How to make a governance vote](https://docs.aqua.network/user-guides/how-to-use-aquarius-governance/how-to-make-a-governance-vote.md):
  "Voting uses governICE".

Read-only reproduction:

```sh
curl -s "https://stellarlight.xyz/api/projects/search?q=aquarius&limit=3" \
  | jq -r '.projects[] | select(.slug == "aquarius") | .shortDescription'
```

This report confirms one project description. Other descriptions were not surveyed.

Aquarius also uses the phrase "ICE votes" for market voting in its [voting guide](https://docs.aqua.network/voting-and-rewards/aquarius-voting.md).
The defect is the attribution to governance votes, not the general term ICE.

## Recommendation

Separate the two vote types in the Aquarius description.
For example: "Locking AQUA mints ICE; upvoteICE votes direct AQUA rewards to markets, and governICE votes on governance proposals without rewards."
Keep the source link to the Aquarius ICE documentation.
