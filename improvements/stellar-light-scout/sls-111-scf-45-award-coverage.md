---
id: sls-111
service: stellar-light-scout
status: reported-upstream
discovered: 2026-11-02
upstreamTitle: "Directory marks 24 SCF #45 awards; the SCF site lists at least 40, and Liqvid omits awarded round 45"
evidence:
  - "2026-11-09T20:32Z full scfAwarded=true pagination returned623 distinct awarded rows;28 have round45 (was24). Liqvid now [37,45], Enable[45], Rumble Fish[41,42,45]. Official listing still has40 distinct SCF #45 project cards; Pollar/Pods/Principal exact resolve false. PR1922 merged2026-11-07, so the old next-wake-up waiting for merge is stale. Partial: retain 12-card coverage/intake residual (10 missing pages explicitly Awarded for45; Canary/Pods project awarded:true/lastAwardedRound45 but submission Information Collection) and preserve explicit awarded-vs-submitted rule (Liqvid30/44 Not Awarded). The correction comment on #1903 is by Raven author kalepail, not maintainer acceptance. Receipts: research/audits/2026-11-09-improvements-sweep/lane-scout.md."
  - "2026-11-06 Raven author kalepail corrected the original award/submission premise (not maintainer acceptance): https://github.com/Stellar-Light/stellarlight/issues/1903#issuecomment-6674314385"
  - "2026-11-06 factual correction: fresh official Liqvid page explicitly labels rounds 30 and 44 Not Awarded, 37 and 45 Awarded. PR1922 correctly identifies this distinction; the original recommendation to copy buildAwardRounds would invent awards. Review: .agents/rounds/2026-11-05-truth-maintenance/scout.md."
  - "2026-11-02T21:35:00Z live GET https://stellarlight.xyz/api/projects/search?scfAwarded=true (paged, 613 rows): 24 projects carry 45 in scfAwardedRounds (Bridge, Tilt Pay, Rail402, PigFi, LendWise, Lendoor, Agama, Crebit, Sendana, Sorted, Kutana, Janus, Neko, Lend, BIM Exchange, SwiftEx, BWB, Minisend, Haven, Lunar Finance, UrbanFlip, Catlog, Micro Be, Balance)."
  - "2026-11-02T21:35:20Z GET https://communityfund.stellar.org/projects?tab=all-rounds (2,402,635 bytes) lists 40 distinct /project/ links labelled 'SCF #45'. Not in the Scout set: open-rwa-vault-infrastructure-nis, canary-protocol-y4l, agentsmith-x402-stellar-facilitator-and-bazaar-discovery-kdw, pods-dxl, pollar-nqe, cara7-yyx, astrolabe-bzg, onboard-kvj, nila-fwc, enable-duq, rumble-fish-software-development-rfp-6z9, fermah-pay-w3c, principal-vzt, zkella-protocol-...-sib, the-merchant-settlement-rail-for-africa-bzf, liqvid-hrr. The page may paginate, so 40 is a floor."
  - "2026-11-02 GET https://stellarlight.xyz/api/projects/resolve: Pollar, Pods, AgentSmith, Cara7, Astrolabe, Onboard, Nila, Principal, ZKELLA, Canary Protocol, Fermah Pay, Open RWA Vault, and The Merchant Settlement Rail for Africa return found false. Liqvid, Enable, and Rumble Fish resolve but do not carry round 45."
  - "Liqvid: 2026-11-02T22:03:35Z GET https://stellarlight.xyz/api/projects/search?q=Liqvid returns slug liqvidxyz with scfAwardedRounds [37], scfAsOf 2026-10-03, scfSourceUrl https://communityfund.stellar.org/project/liqvid-hrr. That page's data has 'lastAwardedRound':45 and 'buildAwardRounds':['SCF #30','SCF #37','SCF #44','SCF #45']."
  - "Enable: https://communityfund.stellar.org/project/enable-duq has 'buildAwardRounds':['SCF #43','SCF #45']; Scout does not list Enable as scfAwarded. Pollar: pollar-nqe has 'buildAwardRounds':['SCF #42','SCF #45']; Scout has no Pollar row."
  - "Predecessor: resolved sls-058 (receipt in improvements/resolved.json) fixed structured SCF funding fields against the official submission records. This is a later coverage gap for round 45, so it gets a new id and does not reopen sls-058."
  - "Dedupe 2026-11-02: no open Stellar-Light/stellarlight issue names SCF #45 or round-45 coverage."
  - ".agents/TODO.md 'File the HackMeridian upstream findings' item R28."
  - upstream issue filed 2026-11-02: https://github.com/Stellar-Light/stellarlight/issues/1903
recurrences:
  - date: 2026-11-06
    evidence: "Full paginated `/api/projects/search?scfAwarded=true&limit=100&offset=N`; official projects and Liqvid page; Pollar/Pods/Principal resolve — Still-repro, record correction required. 613 unique awarded-directory rows;24 with round45 vs40 official listing cards. Liqvid remains `[37]`; Enable/Rumble Fish unawarded; Pollar/Pods/Principal misses. Official Liqvid submission verdicts say30/44 Not Awarded,37/45 Awarded, despite buildAwardRounds listing all four. Existing title/recommendation wrongly treats all four as awards. Next: Correct original false premise; retain actual missing45/coverage defect. Next after #1922 rebase/merge+execute: verify Liqvid `[37,45]`, never30/44; verify real awarded submissions and missing-project intake.28 expected by PR would still not satisfy40 coverage. Ledger: .agents/rounds/2026-11-05-truth-maintenance/scout.md."
---

## Finding

The directory marks 24 projects with an SCF #45 award.
The SCF funded-projects page lists at least 40 SCF #45 awards.
Thirteen awarded projects have no directory record, for example Pollar, Pods, and Principal.
Three projects have a record but no round-45 award: Liqvid, Enable, and Rumble Fish.

Liqvid's record (`liqvidxyz`) shows rounds `[37]`, with `scfAsOf` 2026-10-03 and its own SCF page as the source.
Its buildAwardRounds field lists submissions in SCF #30, #37, #44, and #45, but the submission verdicts mark 30 and 44 Not Awarded. Only 37 and 45 are awarded. The missing award is 45.

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
For existing records, rebuild `scfAwardedRounds` from explicit awarded submission verdicts. Do not copy `buildAwardRounds` without checking those verdicts: Liqvid must be `[37,45]`, not `[30,37,44,45]`.
Add a round-level count check: compare awards per round with the SCF site after each sync.
