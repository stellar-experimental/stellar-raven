---
id: sls-116
service: stellar-light-scout
status: reported-upstream
discovered: 2026-11-12
upstreamTitle: "SCF award records miss source-backed earlier-round awards and keep an unsourced StellarPay round-30 award"
evidence:
  - "2026-11-12T14:50:51Z GET https://communityfund.stellar.org/project/passkey-ui-sj6 returned HTTP 200 (SHA-256 46eb7ebde6390fa4ea3e9f3e093a2844c675af29faf88c6142f6f790f948ec5e) with awarded true, lastAwardedRound 44 and buildAwardRounds ['SCF #44']. The official pages for OZ Accounts Policy Builder by Gateway.fm (oz-accounts-policy-builder-by-gatewayfm-mqp) and Soroban Contract Source Verification Service (soroban-contract-source-verification-service-bax) also mark round 44 Awarded. No served Scout row carries any of the three pages as scfSourceUrl; the Gateway.fm row carries only round 16."
  - "2026-11-12 re-read: GET https://communityfund.stellar.org/project/passkey-ui-sj6 again shows awarded true, lastAwardedRound 44. GET https://stellarlight.xyz/api/projects/search?q=Passkey%20UI&limit=5 returns no row with that source page."
  - "2026-11-12 re-read: GET https://communityfund.stellar.org/project/stellarpay-dy1 shows awarded true, lastAwardedRound 2, buildAwardRounds that list only SCF #2 and SCF #30, round 2 Awarded and round 30 Not Awarded. GET https://stellarlight.xyz/api/projects/search?q=StellarPay&limit=5 returns slug stellarpay with scfAwardedRounds [30], an SCF funding total of 148400, and null scfSourceUrl and scfAsOf."
  - "Context: Scout 1.9.135. Stellar-Light/stellarlight PR 1946 fixed SCF #45 coverage (40 of 40 source pages) and adds a per-round count check. Its reviewed baseline discloses remaining shortfalls in earlier rounds but does not resolve them. Predecessor sls-111 (round 45) is retired; its receipt is in improvements/resolved.json."
  - "Dedupe 2026-11-12: no active Scout finding or resolved receipt covers earlier-round award gaps or the StellarPay join. Review: research/audits/2026-11-12-truth-maintenance/review-retire-astra.md (sls-111 section)."
  - upstream issue filed 2026-11-12: https://github.com/Stellar-Light/stellarlight/issues/1952
recurrences:
  - date: 2026-11-23
    evidence: "Partial after https://github.com/Stellar-Light/stellarlight/pull/1992 (Scout 1.9.157, inbound handoff #549), verified live 2026-11-23T20:51Z–20:58Z by author and distinct reviewer (Codex frontier gpt-6.2-astra, high). Fixed: peer now carries scfAwardedRounds [22, 26], scfSourceUrl https://communityfund.stellar.org/project/peer-by-honeycoin-inz, and scfAsOf 2026-11-23; across all 711 scfAwarded=true rows (offsets 0..700), 0 rows have null scfSourceUrl or scfAsOf. Remaining: (1) 0 of 711 rows carry soroban-contract-source-verification-service-bax (official page still answers 200 with lastAwardedRound 44); (2) 27 earlier-round awards (of 893 across rounds 1–44) await operator decisions and no public endpoint exposes the per-round baseline; (3) both peer and honey-coin serve the same peer-by-honeycoin-inz award ($145,000 each) until the operator decides which row carries it. Verification reply posted on #1952: https://github.com/Stellar-Light/stellarlight/issues/1952#issuecomment-7113969064. Status unchanged; next check in .agents/TODO.md."
  - date: 2026-11-14
    evidence: "Partial after https://github.com/Stellar-Light/stellarlight/pull/1962 (Scout OpenAPI 1.9.150), live 2026-11-14T02:32:08Z to 02:33:59Z. Fixed: stellarpay now has scfAwardedRounds [2], a null total and scfSourceUrl stellarpay-dy1; gatewayfm has [16, 44]; soropass carries the passkey-ui-sj6 page with round 44; scfAwarded=true returns 711 rows (635 on 2026-11-12). Remaining: no row of the 711 carries soroban-contract-source-verification-service-bax as scfSourceUrl, and the official page still shows lastAwardedRound 44, so one of the three named round-44 awards is still absent. The owner's own count check reports 20 rounds short by 27 awards (https://github.com/Stellar-Light/stellarlight/issues/1952#issuecomment-6842154037). One awarded row, peer (rounds 22 and 26), has null scfSourceUrl and scfAsOf. Inbound handoff: stellar-raven issue 427. Next: reply with this result; retire only when the named page and the 27-award baseline are sourced or explicitly out of scope."
  - date: 2026-11-17
    evidence: "Live 2026-11-17T00:17Z to 00:18Z, Scout OpenAPI 1.9.150 (GET https://stellarlight.xyz/api/status). All three open items from the 2026-11-14 result still reproduce, and https://github.com/Stellar-Light/stellarlight/issues/1952 has no maintainer reply since the owner's 2026-11-13 comment. (1) GET https://stellarlight.xyz/api/projects/search?scfAwarded=true&limit=100 at offsets 0 to 700 returns 711 distinct rows of total 711, and none names soroban-contract-source-verification-service-bax; https://communityfund.stellar.org/project/soroban-contract-source-verification-service-bax answers 200 and still shows lastAwardedRound 44. (2) The 27-award baseline has no public path: the 1.9.150 OpenAPI lists no round-count operation, and the search response meta carries no per-round check. GET /api/status and the first 90 KB of GET /api/quality hold no round counts (the /api/quality read timed out at 60 s, so that check is partial). (3) peer still has scfAwardedRounds [22, 26], 145000 USD and null scfSourceUrl and scfAsOf; it is the only one of the 711 rows with a null source or date. Status unchanged. Next: the .agents/TODO.md entry names the re-check."
---

## Finding

Scout SCF award records miss awards that official SCF project pages publish for rounds before 45.
For example, three official pages mark round 44 Awarded: Passkey UI, OZ Accounts Policy Builder by
Gateway.fm, and Soroban Contract Source Verification Service. No Scout row uses these pages as its
SCF source. The Gateway.fm row carries only round 16.

Scout also keeps an award that its source does not support. The `stellarpay` row shows round 30 and
148,400 USD, with no `scfSourceUrl` or `scfAsOf`. The official StellarPay page marks round 2
Awarded and round 30 Not Awarded.

An agent that counts or lists awards for an earlier round from Scout can omit real awards. It can
also report an award that the SCF site does not show.

## Evidence

Read-only reproduction:

```sh
curl -sS https://communityfund.stellar.org/project/passkey-ui-sj6
curl -sS 'https://stellarlight.xyz/api/projects/search?q=Passkey%20UI&limit=5'
curl -sS https://communityfund.stellar.org/project/stellarpay-dy1
curl -sS 'https://stellarlight.xyz/api/projects/search?q=StellarPay&limit=5'
```

The SCF #45 repair in PR 1946 is complete for round 45. This finding concerns the earlier rounds.

## Recommendation

Run the round-45 reconciliation for each earlier round. Match each official project page to one
Scout record, and add the awards that are missing. Remove or correct each award that has no
source page, starting with StellarPay round 30. Keep a source page and date on every award.
Check page identities as well as per-round totals.
