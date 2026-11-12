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
