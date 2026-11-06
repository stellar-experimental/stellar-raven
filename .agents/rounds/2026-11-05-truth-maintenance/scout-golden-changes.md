# Scout golden changes — 2026-11-05

Author: Scout lane, Astra/high. Independent final reviewer: t2dv; root also re-fetches primary sources. Read golden-truth. No paid calls/evals. UTC receipts fall on November6; local round/observation date is November5 America/New_York. Eight cases have scoped gospel corrections; four have provenance-only fresh confirmations. No deadline extension, register generation, sentinel edit or shared artifact generation.

## Claim matrix and exact edits

| Cases | Before → after | Evidence / assertion | Scope and dates |
|---|---|---|---|
| q-scf-open-rfps; q-scf-rfp-tooling | Current Scout lag → Scout now agrees with official source-relative empty RFP roster | A `https://stellar.gitbook.io/scf-handbook/scf-awards/build-award/rfp-track.md`: “October 2026: New Q4 RFPs are coming soon.” B latest path commit e07b4bfce158639f81908f74cfd74ec8d87f051a withdrew Q3. C `https://stellarlight.xyz/api/rfps?status=open`: open0/closed16/q4-2026, one synthetic46; `?quarter=q3-2026` two closed. D free web sweep in scout.md found no newer official brief; cached Q3 snippets directly contradicted by current source. | asOf11-05; due11-10 and11-11 unchanged. Synthetic window ≠ brief; current-quarter eligibility/interest-to-invitation preserved. No eternal absence rule. |
| q-scf-open-rfps-live; q-scf-passkey-rfps-live | Obsolete conflict note → current agreement; no open brief is a valid scoped listing/comparison result | Same A/B/C/D. Historical Q3 custom __check_auth mentions do not create a currently open passkey brief. | Behavior/keyFacts preserved; notes/asOf11-05. |
| q-scf-rfps-hackathons-live | Both hackathon filters empty + stale Q3 rows → active Waterloo, upcoming empty, no open brief | Same RFP evidence. A `https://uwaterloo.ca/events/events/blockchain-innovation-challenge-powered-stellar`: “Monday, November 2, 2026 - Wednesday, November 18, 2026”, “Host: Velocity”. A organizer `https://www.velocityincubator.com/programs-events/the-blockchain-innovation-challenge-powered-by-stellar`: “Who: All University of Waterloo students”, “$15,000 in prizes to be awarded”. C `/api/hackathons?status=active` one Waterloo; `?status=upcoming` ok/partialfalse/zero. | Behavioral separation and scoped absence unchanged; no global roster claim. |
| q-scf-contract-verification-rfp-live | Idea-only row allowed as brief substitute → distinct publishedBrief and original idea | C `https://stellarlight.xyz/api/rfps?q=source%20verification` and `?q=SEP-58`: one closed Q2 row, separate publishedBrief. B `https://github.com/stellar/scf-handbook/blob/1e04b79973358e3dea58d821ed6419b50c93370c/scf-awards/build-award/rfp-track.md`: SEP-58 six keys, source modes, trusted image, per-verifier disagreement, Mainnet/Testnet; fully deterministic Rust research out of scope. | Answer/notes now choose publishedBrief for official requirements. Historical status not reopened by46 Submission. No new requirement count or score target. |
| q-scf-hackathons-active |27/all completed/active0 →29/Waterloo active/upcoming0 | Same Waterloo A+C sources; `/api/hackathons?limit=100`29; q=istanbul returns completed event, source `https://www.risein.com/programs/stellar-pro-hackathon`. | asOf11-05; historic Real-World ZK and HackMeridian facts untouched. |
| q-scf-total-distributed | Empty previous snapshot described as current → repaired nonempty baseline | C `https://stellarlight.xyz/api/analyze?dimension=funding`:582/hash b44bd87c48cd5ef9 vs581/hash67022e31bd3e0ec7; added scopuly/+217100; snapshotAsOf10-03T08:00:19.683Z vs prior10-03T07:36:46.465Z. B `https://github.com/Stellar-Light/stellarlight/pull/1928` merged validates stored set/hash. | Only dated notes/provenance correction; existing asOf11-02 and historical official amount comparisons retained. Reconstructed delta is never newly paid awards. |
| q-scf-current-round; q-edge-fresh-latest-scf-round | Fresh verification, no gospel change | A `https://communityfund.stellar.org/awards`:46 Submission/deadline11-09,45/44 Ended. Detail `/awards/recxrSMYwAl8vcglg`: “Build Submission TBD - November 9, 2026”, panel11-11–18, notificationTBD. C RFP metadata agrees but cites same source. D stale Nov8 circulation checked in scout.md. | truth.asOf11-02 retained; verified11-05; due11-12 retained. Thus existing source-sentinel caseAsOf remains correct. |
| q-gap-leaderboard-project-not-builder | Source note300 → latest total401 confirmation | C `https://stellarlight.xyz/api/builders?limit=2`:2 rows/401 total. Full0/200/400 pagination200/200/1, unique401; LATAM59 all in union. | Provenance only, no gospel/asOf change. |
| q-edge-closed-world-builder-directory-miss | Historical source note399 → latest advisory401 | C `https://stellarlight.xyz/api/builders?q=Strupey`:ok empty,partialfalse,filter miss; advisory401. | Provenance only, no gospel/asOf change; never infer person absence. |

Each changed case has fresh truth.verified with nonempty evidence/rootCause freshness-drift. Existing older source/corroboration observations retain their explicit historical dates; latest sources supersede current-lag interpretations without rewriting history. Parent owns durable reference replacement when retiring finding paths.

Sibling sweep: inspected all q-scf files and builder consumers for lag/zero/empty/300/399/SEP-58 wording. The twelve files below are the precise authored set. q-scf-how-to-apply, q-scf-submission-lifecycle-deadlines, q-scf-hummingbot-kelp-closed-rfp, both hackathon compare cases, q-gap-builders-person-empty, and q-scf-regional-india have no conflicting current-fact assertion requiring this correction. Root must reconcile consistency clusters081/085 and SCF dateContingentTraps that still describe lag; dates are not extended. No source sentinel edits are needed because the two sentinel-backed round cases retain asOf.

## Changed files

```text
eval/qa/corpus/battery/scf-grants-builders/q-scf-open-rfps.json
eval/qa/corpus/battery/scf-grants-builders/q-scf-rfp-tooling.json
eval/qa/corpus/battery/scf-grants-builders/q-scf-open-rfps-live.json
eval/qa/corpus/battery/scf-grants-builders/q-scf-passkey-rfps-live.json
eval/qa/corpus/battery/scf-grants-builders/q-scf-rfps-hackathons-live.json
eval/qa/corpus/battery/scf-grants-builders/q-scf-contract-verification-rfp-live.json
eval/qa/corpus/battery/scf-grants-builders/q-scf-hackathons-active.json
eval/qa/corpus/battery/scf-grants-builders/q-scf-total-distributed.json
eval/qa/corpus/battery/scf-grants-builders/q-scf-current-round.json
eval/qa/corpus/battery/edge-behavior/q-edge-fresh-latest-scf-round.json
eval/qa/corpus/battery/defi-ecosystem/q-gap-leaderboard-project-not-builder.json
eval/qa/corpus/battery/edge-behavior/q-edge-closed-world-builder-directory-miss.json
```

Reproduce public GETs with `curl --fail --location --user-agent 'Raven truth maintenance' 'URL'`. RFP handbook latest commit: `gh api 'repos/stellar/scf-handbook/commits?path=scf-awards/build-award/rfp-track.md&per_page=1'`. Broad replay script: `python3 research/audits/2026-11-05-improvements/scout-readonly-probes.py --out tmp/scout-new-recheck` (use a new output path). Original full Scout audit and web sweep: `scout.md` in this directory.

## Independent review complete

Docs lane t2dv (Astra/high) independently reviewed all12 case diffs against fec1c79f, fetched primary/API controls and approved without author revisions. See [scout-golden-review.md](scout-golden-review.md) for exact reviewed SHA256 fingerprints and source checks. The corpus remains frozen by this author. Root still owns register reconciliation, reference substitutions, generated artifacts and deterministic final gates; case approval does not assert those separate steps are complete.
