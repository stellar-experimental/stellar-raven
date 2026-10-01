# Verification — PR D commit dedd55b3

Verdict: confirmed

Reviewer: Grok.
Commit: `dedd55b37842945b3dbec2ae9606797743abf834`.
The range is `origin/main` `157c26b42038055b87f904e1c0b92479afad35a7` through `dedd55b3`.
Commit `11a26ac4` is inside that range.
The four requested edits are in the tree at `dedd55b3`.
Both gates on that commit exit 0.

## Finding 1 — builders class

File: `eval/qa/corpus/battery/scf-grants-builders/q-gap-builders-person-empty.json`.

The direct stellarlight.xyz read is class C.
The note says "one witness for the 226 count".
The answer dates 114 profiles on 2026-07-11.
The answer dates 226 on 2026-09-30.
The two key facts stay the same.
The avoid line stays the same.
`eval/qa/cases.json` contains "the 226 count therefore has one witness".

## Finding 2 — x402 classes

File: `eval/qa/corpus/battery/defi-ecosystem/q-defi-x402-on-stellar-what.json`.

The tftc.io row is class D.
The note says "page text undated".
A search of the file finds zero copies of `2026-07-16`.
The SDF post is class A.
The note says "Same witness as stellar.org/x402".
The answer says "as of 2026-09-30 SDF states it holds a Governing Board seat".
`eval/qa/cases.json` contains "page text undated".
`eval/qa/cases.json` contains "Same witness as stellar.org/x402".
`cases.json` sha256 is `ae221407fad556081391ff0ff01a49a4391c4734fb39f1c9dd4474201369190e`.
That sha256 matches the parent commit `11a26ac4`.

## Finding 3 — base reserve invariant

The numeric invariant `base reserve` has verdict `consistent`.
`lastChecked` is 2026-09-30.
`reSwept.date` is 2026-09-30.
`reSwept.verdict` is `consistent`.
The key `reopened` is absent.
The reason says the dated 0.5 XLM wording matches the invariant.
The reason cites Horizon ledger 64703557 and ledger 64703824.
This object matches the object at `11a26ac4`.
The round ledger records this re-sweep at lines 337-339.

## Finding 4 — clusters 012 and 125

`register-review-d2.json` is in this commit.
Both reviews set `clearReopened` to true.
Cluster 012 has verdict `consistent`.
Cluster 125 has verdict `consistent`.
The key `reopened` is absent on both clusters.
Both clusters store hash `0516eedef2611b2a8e696633499722857d31d5dd4fe7507eaf48d54af90336a5` for `q-defi-x402-on-stellar-what`.
The parent hash is `472b7e0b42a4bd7b90448d64ed46d273fcc107314ff22d07ec03e3c76531fcdc`.
The cluster 012 reason names the tftc.io class D correction and the SDF post class A correction.
The cluster 125 reason says the change is judge-blind truth metadata.
Lines 349-350 record this second re-sweep.

## Gates

The commands ran in a detached worktree at commit `dedd55b3`.
The detached copy used the checkout `node_modules`.
The raven-next-d checkout stayed at `ebf6683d7158a0c0600f54445b93995d240f1f62`.
The checkout status was empty after the commands.

`npm run eval:qa:lint -- --since origin/main --stale` exits 0.
The result line is `[lint-corpus] 0 error(s), 62 warning(s)`.

`npm run eval:qa:register -- --check` exits 0.
The result line is `[register-helper] up to date`.

## Residual

Ledger line 305 lists classes `C, D` for the builders case.
Ledger line 306 lists classes `A, D, E` and `tftc.io 2026-07-16`.
The case files use the corrected classes.
The reconciliation rows at lines 345-347 state the three fixes.
This check uses commit `dedd55b3` only.
Later commits on the branch are `d17ba914` and `ebf6683d`.
