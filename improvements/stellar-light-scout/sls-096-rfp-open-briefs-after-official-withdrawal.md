---
id: sls-096
service: stellar-light-scout
status: verified
discovered: 2026-11-02
upstreamTitle: "GET /api/rfps?status=open lists Q3 briefs that the official SCF page removed"
probe:
  type: http-text
  url: https://stellarlight.xyz/api/rfps?status=open
  expect:
    status: 200
    contains:
      - "\"id\":\"layerzero-dvn\""
evidence:
  - "2026-11-02T17:17Z live GET https://stellarlight.xyz/api/rfps?status=open returned HTTP 200, meta.generatedAt 2026-11-02T16:39:01.863Z, activeQuarter 'q3-2026', counts {total 16, open 2, closed 14, matched 3, returned 3, syntheticRounds 1}. Rows: synthetic scf-round-46, then rowType rfp 'layerzero-dvn' (Stellar-compatible LayerZero DVN) and 'x402-facilitator-bazaar' (x402 Facilitator with Bazaar Discovery), both status open and quarter q3-2026. Response sha256 0535465754228e9472e13427e2248d910cf672f342ba58792b132895d50f82a3."
  - "Official source: https://github.com/stellar/scf-handbook/commit/e07b4bfce158639f81908f74cfd74ec8d87f051a (GITBOOK-246, 2026-10-16T18:20:46Z) edits scf-awards/build-award/rfp-track.md. It replaces '_**July 23, 2026: New Q3 RFPs are open for submissions for SCF #**_**45! More coming soon.**' with '_**October 2026: New Q4 RFPs are coming soon.**_' and deletes the Stellar-compatible LayerZero DVN and x402 Facilitator brief sections."
  - "2026-11-02 read of the current handbook file (gh api repos/stellar/scf-handbook/contents/scf-awards/build-award/rfp-track.md, latest path commit e07b4bfce1): under 'Current Open RFPs' it shows the October 2026 line and two empty 'Coming Soon' sections. It names no open brief."
  - "The same Scout response reports meta.scfRound currentRound 46, currentPhase Submission, submission deadline 2026-11-09, source live. The round state is current; only the brief roster lags."
  - "Lag at observation: 17 days after the handbook commit."
  - "Golden consumers: eval/qa/corpus/battery cases q-scf-open-rfps, q-scf-rfp-tooling, q-scf-open-rfps-live, q-scf-passkey-rfps-live, q-scf-rfps-hackathons-live, and q-scf-hummingbot-kelp-closed-rfp record the conflict and pin no Scout open set."
  - "2026-11-02T22:37Z recheck: curl -sS 'https://stellarlight.xyz/api/rfps?status=open' returned HTTP 200. counts: total 16, open 2, closed 14, returned 3, syntheticRounds 1. layerzero-dvn and x402-facilitator-bazaar remain open in q3-2026. meta.activeQuarter is q3-2026; meta.scfRound reports round 46, Submission, deadline 2026-11-09."
  - "2026-11-02T22:37Z calibration: curl -sS https://raw.githubusercontent.com/stellar/scf-handbook/main/scf-awards/build-award/rfp-track.md returned HTTP 200. It names Q4 as coming soon and no open brief. gh api repos/stellar/scf-handbook/commits/e07b4bfce158639f81908f74cfd74ec8d87f051a confirms removal at 2026-10-16T18:20:46Z against parent 55d21e477542341f9cebd1a345239f8c579bd3d5."
  - "2026-11-02 adjacent check: rg -n 'ACTIVE_QUARTER|layerzero-dvn|x402-facilitator-bazaar' over upstream src/data/ideas.ts at 1388bdd79b3151208d2be3ce0117316c0bc9694b confirms q3-2026 and both brief definitions. rfpStatus derives open status from ACTIVE_QUARTER. /ideas and both brief pages returned HTTP 200. No dependency-bound broken snippet is alleged."
  - "2026-11-02 dedupe: gh search issues RFP and gh search prs RFP, each with --repo Stellar-Light/stellarlight and --state open/closed, found no report for the October removal. Merged #751 introduced Q3 briefs; #910 corrected Q3 tabs. Other matches concern round metadata or API guards. rg -n -i 'layerzero-dvn|x402-facilitator-bazaar|RFP.*(withdraw|Q4|open)' improvements/ found no duplicate. Resolved sls-014, sls-045, sls-067, and sls-072 concern other RFP behavior."
  - "2026-11-02 owner check: improvements/intake.json resolves this API finding to Stellar-Light/stellarlight. gh api repos/Stellar-Light/stellarlight confirms archived false and has_issues true. No override is needed."
---

## Finding

`GET /api/rfps?status=open` returns two Q3 2026 briefs that the official SCF page removed.
The rows are `layerzero-dvn` and `x402-facilitator-bazaar`.
The API reports `counts.open: 2` and `activeQuarter: "q3-2026"`.
The official page now announces Q4 briefs as coming soon and names no open brief.
Clients can present the old briefs as current opportunities.

## Evidence

Read-only reproduction:

```sh
curl -sS 'https://stellarlight.xyz/api/rfps?status=open'
curl -sS https://raw.githubusercontent.com/stellar/scf-handbook/main/scf-awards/build-award/rfp-track.md
gh api repos/stellar/scf-handbook/commits/e07b4bfce158639f81908f74cfd74ec8d87f051a --jq '.files[] | select(.filename == "scf-awards/build-award/rfp-track.md") | .patch'
```

The live check at 2026-11-02T22:37Z returned HTTP 200.
Both brief rows retained `status: "open"` and `quarter: "q3-2026"`.
The response also contained the separate synthetic row `scf-round-46`.
That row does not explain the two open briefs.

Handbook commit `e07b4bfce158639f81908f74cfd74ec8d87f051a` removed both brief sections at 2026-10-16T18:20:46Z.
Its parent is `55d21e477542341f9cebd1a345239f8c579bd3d5`.
The patch replaces the Q3 opening announcement with the October 2026 Q4 announcement.
The current file retains that announcement and two empty "Coming Soon" sections.
This establishes the source change date, rather than the API observation date.

The same API response reports round 46, Submission, with a 2026-11-09 deadline.
The round data is current.
The brief status and quarter need correction.
The `/ideas` page and both brief pages also remain available.

## Recommendation

Remove `layerzero-dvn` and `x402-facilitator-bazaar` from the open brief set.
Update `ACTIVE_QUARTER` in `src/data/ideas.ts` to the quarter that the official page names.
Check the `/ideas` listing and both brief pages after that change.
Return zero open briefs while the official page names none.
Keep the independent SCF submission window available.
Optionally, add a check for changes to the official open brief list.
