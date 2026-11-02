---
id: sls-096
service: stellar-light-scout
status: verified
discovered: 2026-11-02
upstreamTitle: "GET /api/rfps?status=open still lists the Q3 2026 briefs after the SCF RFP Track page withdrew them"
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
  - "Dedupe 2026-11-02: resolved sls-014, sls-045, sls-067, and sls-072 cover round metadata, synthetic rows, fundability, and the scfRound source schema. None covers brief status lagging the official page. GitHub search repo:Stellar-Light/stellarlight layerzero-dvn returned 0 results."
  - "Golden consumers: eval/qa/corpus/battery cases q-scf-open-rfps, q-scf-rfp-tooling, q-scf-open-rfps-live, q-scf-passkey-rfps-live, q-scf-rfps-hackathons-live, and q-scf-hummingbot-kelp-closed-rfp record the conflict and pin no Scout open set."
---

## Finding

`GET /api/rfps?status=open` still returns two Q3 2026 briefs as open.
The rows are `layerzero-dvn` and `x402-facilitator-bazaar`, with `activeQuarter: "q3-2026"`.
The official SCF RFP Track page removed both briefs on 2026-10-16.
That page now says "October 2026: New Q4 RFPs are coming soon." and lists no open brief.
An agent that trusts the API tells a builder to apply to briefs the program has withdrawn.

## Evidence

Read-only reproduction:

```sh
curl -sS 'https://stellarlight.xyz/api/rfps?status=open'
gh api repos/stellar/scf-handbook/commits/e07b4bfce158639f81908f74cfd74ec8d87f051a --jq '.files[0].patch'
```

On 2026-11-02 the API reported `counts.open: 2` and both rows had `status: "open"`.
The handbook commit `e07b4bfce158639f81908f74cfd74ec8d87f051a` deleted both brief sections.
It replaced the Q3 announcement line with the October 2026 line.
The current handbook file shows two empty "Coming Soon" sections.

The `meta.scfRound` object in the same response is current: round 46, Submission, deadline 2026-11-09.
The defect is in the brief roster only.

## Recommendation

Mark `layerzero-dvn` and `x402-facilitator-bazaar` closed, or move them out of the open set.
Set `activeQuarter` to the quarter the official page names.
When the official page lists no open brief, return zero open briefs with a short note.
Add a sync check that compares open briefs with the RFP Track page on each change of that page.
