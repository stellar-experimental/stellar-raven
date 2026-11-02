---
id: sls-109
service: stellar-light-scout
status: reported-upstream
discovered: 2026-11-02
upstreamTitle: "Repo search ranks low-score forks above canonical repos for 'scaffold stellar' and 'stellar lab'"
evidence:
  - "2026-11-02T21:29:49Z live GET https://stellarlight.xyz/api/repos/search?q=scaffold%20stellar&limit=5 returned Gbangbolaoluwagbemiga/SecureFlow-scaffold (repoScore 27), danielgorgonha/hackthon-scaffold-stellar (16), masch/stellar-scaffold-front-hackaton (15), dropsland-app/dropsland-scaffold (24), stevmolina/token-scaffold (16). 2026-11-02T22:03:07Z with limit=50 (25 returned, matchMode strict) stellar-scaffold/cli is rank 16 of 25, repoScore 77, 53 stars, canonical false. Review rv-hm 2026-11-02T21:51:09Z got the same rank and score."
  - "2026-11-02T21:31:44Z GET /api/repos/trust?repo=stellar-scaffold/cli returned a report, so the repository is indexed. q=stellar%20scaffold%20cli ranks it first (repoScore 77, 53 stars). The q=scaffold top 10 does not include it; 9 of those 10 have repoScore 6 to 27. GET /api/repos/trust?repo=theahaco/scaffold-stellar returned 'not in the index'; gh api repos/theahaco/scaffold-stellar redirects to stellar-scaffold/cli, and the Stellar docs Scaffold page links github.com/theahaco/scaffold-stellar."
  - "2026-11-02 q=stellar%20lab returned StellarDevHub/Web3-Student-Lab (55), CaBsCrypto/stellar-agent-merchant-lab (22), Nectar-Network/nectar (58), ThaisFReis/karn-protocol (41), Alouzious/StellarIDE (33). stellar/laboratory (repoScore 88, homepage https://lab.stellar.org) is indexed and ranks first only for q=laboratory."
  - "2026-11-02T22:03:09Z q=smart%20contract%20examples&limit=5: kunaldrall29/policywright (repoScore 51, 1 star), TrustLine-id/stellar-sdk (49, 0), stellar/passkey-kit (92, 3), stellar/smart-account-kit (85, 4), stellar/soroban-examples (63, 149). Review rv-hm 2026-11-02T21:51:11Z got the same order."
  - "Controls 2026-11-02: soroban-sdk, stellar-cli, stellar-core, js-stellar-sdk, freighter, anchor platform, stellar rpc, and horizon queries each rank the canonical repository first."
  - "OpenAPI 1.9.116 Repo.canonical: 'True when surfaced as a curated canonical SDF answer for an infra/protocol query... Floated to the top'. canonical true appears only on stellar/stellar-core, stellar/anchor-platform, stellar/stellar-rpc, stellar/stellar-horizon, and stellar/go-stellar-sdk in these probes; stellar/rs-soroban-sdk, stellar/stellar-cli, and stellar/js-stellar-sdk rank first without it."
  - "Dedupe 2026-11-02: gh issue search 'canonical repo' and 'scaffold' on Stellar-Light/stellarlight found only #843 (rename-twin read-back) and #436 (weekly retrieval tracker); neither names this ranking case. No active or resolved Raven finding covers repo ranking."
  - ".agents/TODO.md 'File the HackMeridian upstream findings' items R16 and R18."
  - upstream issue filed 2026-11-02: https://github.com/Stellar-Light/stellarlight/issues/1901
---

## Finding

`GET /api/repos/search` ranks name-matching hackathon forks above the canonical repository for common product names.

- "scaffold stellar": the top 5 are forks with `repoScore` 15 to 27. `stellar-scaffold/cli` (score 77) is rank 16 of 25.
- "stellar lab": `stellar/laboratory` (score 88, the Stellar Lab source) is not in the top 5.
- "smart contract examples": `stellar/soroban-examples` is fifth. Two repositories with 0 or 1 star rank first and second, and `stellar/passkey-kit` and `stellar/smart-account-kit` rank third and fourth.

The curated `canonical` boost covers infrastructure queries such as RPC and Horizon only.
An agent that asks for "the Scaffold Stellar repo" gets a fork.

## Evidence

Read-only reproduction:

```sh
curl -sS 'https://stellarlight.xyz/api/repos/search?q=scaffold%20stellar&limit=50'
curl -sS 'https://stellarlight.xyz/api/repos/search?q=stellar%20lab&limit=5'
curl -sS 'https://stellarlight.xyz/api/repos/search?q=smart%20contract%20examples&limit=5'
curl -sS 'https://stellarlight.xyz/api/repos/trust?repo=stellar-scaffold/cli'
```

Eight infrastructure queries are controls and rank correctly.

## Recommendation

Extend the curated canonical map to developer products: Scaffold Stellar, Stellar Lab, and the Soroban examples.
Map the old `theahaco/scaffold-stellar` name to `stellar-scaffold/cli`.
In the default ranking, weight `repoScore` and first-party ownership above a name match on a fork.
