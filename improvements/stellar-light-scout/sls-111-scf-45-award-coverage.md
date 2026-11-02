---
id: sls-111
service: stellar-light-scout
status: reported-upstream
discovered: 2026-11-02
upstreamTitle: "Directory marks 24 SCF #45 awards; the SCF site lists at least 40, and Liqvid's record omits rounds 30, 44, and 45"
evidence:
  - "2026-11-02T21:35:00Z live GET https://stellarlight.xyz/api/projects/search?scfAwarded=true (paged, 613 rows): 24 projects carry 45 in scfAwardedRounds (Bridge, Tilt Pay, Rail402, PigFi, LendWise, Lendoor, Agama, Crebit, Sendana, Sorted, Kutana, Janus, Neko, Lend, BIM Exchange, SwiftEx, BWB, Minisend, Haven, Lunar Finance, UrbanFlip, Catlog, Micro Be, Balance)."
  - "2026-11-02T21:35:20Z GET https://communityfund.stellar.org/projects?tab=all-rounds (2,402,635 bytes) lists 40 distinct /project/ links labelled 'SCF #45'. Not in the Scout set: open-rwa-vault-infrastructure-nis, canary-protocol-y4l, agentsmith-x402-stellar-facilitator-and-bazaar-discovery-kdw, pods-dxl, pollar-nqe, cara7-yyx, astrolabe-bzg, onboard-kvj, nila-fwc, enable-duq, rumble-fish-software-development-rfp-6z9, fermah-pay-w3c, principal-vzt, zkella-protocol-...-sib, the-merchant-settlement-rail-for-africa-bzf, liqvid-hrr. The page may paginate, so 40 is a floor."
  - "2026-11-02 GET https://stellarlight.xyz/api/projects/resolve: Pollar, Pods, AgentSmith, Cara7, Astrolabe, Onboard, Nila, Principal, ZKELLA, Canary Protocol, Fermah Pay, Open RWA Vault, and The Merchant Settlement Rail for Africa return found false. Liqvid, Enable, and Rumble Fish resolve but do not carry round 45."
  - "Liqvid: 2026-11-02T22:03:35Z GET https://stellarlight.xyz/api/projects/search?q=Liqvid returns slug liqvidxyz with scfAwardedRounds [37], scfAsOf 2026-10-03, scfSourceUrl https://communityfund.stellar.org/project/liqvid-hrr. That page's data has 'lastAwardedRound':45 and 'buildAwardRounds':['SCF #30','SCF #37','SCF #44','SCF #45']."
  - "Enable: https://communityfund.stellar.org/project/enable-duq has 'buildAwardRounds':['SCF #43','SCF #45']; Scout does not list Enable as scfAwarded. Pollar: pollar-nqe has 'buildAwardRounds':['SCF #42','SCF #45']; Scout has no Pollar row."
  - "Predecessor: resolved sls-058 (receipt in improvements/resolved.json) fixed structured SCF funding fields against the official submission records. This is a later coverage gap for round 45, so it gets a new id and does not reopen sls-058."
  - "Dedupe 2026-11-02: no open Stellar-Light/stellarlight issue names SCF #45 or round-45 coverage."
  - ".agents/TODO.md 'File the HackMeridian upstream findings' item R28."
  - upstream issue filed 2026-11-02: https://github.com/Stellar-Light/stellarlight/issues/1903
---

## Finding

The directory marks 24 projects with an SCF #45 award.
The SCF funded-projects page lists at least 40 SCF #45 awards.
Thirteen awarded projects have no directory record, for example Pollar, Pods, and Principal.
Three projects have a record but no round-45 award: Liqvid, Enable, and Rumble Fish.

Liqvid's record (`liqvidxyz`) shows rounds `[37]`, with `scfAsOf` 2026-10-03 and its own SCF page as the source.
That page lists build awards in SCF #30, #37, #44, and #45.

An agent that counts or lists SCF #45 awards from Scout reports about 60% of the round.

## Evidence

Read-only reproduction:

```sh
curl -sS 'https://stellarlight.xyz/api/projects/search?scfAwarded=true&limit=100&offset=0'
curl -sS 'https://communityfund.stellar.org/projects?tab=all-rounds'
curl -sS 'https://stellarlight.xyz/api/projects/resolve?q=Pollar'
curl -sS https://communityfund.stellar.org/project/liqvid-hrr
```

## Recommendation

Re-sync SCF #45 from the SCF project pages, and add records for the awarded projects that have none.
For existing records, rebuild `scfAwardedRounds` from each page's `buildAwardRounds`, as for Liqvid.
Add a round-level count check: compare awards per round with the SCF site after each sync.
