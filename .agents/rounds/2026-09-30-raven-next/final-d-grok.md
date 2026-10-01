# Final verification — PR D commit ebf6683d

Verdict: confirmed

Reviewer: Grok.
Commit: `ebf6683d7158a0c0600f54445b93995d240f1f62`.
This commit is the branch head.
The range is `origin/main` `157c26b42038055b87f904e1c0b92479afad35a7` through `ebf6683d`.
Findings 1 to 3 are in this tree.
This commit corrects the two matrix rows.
Both gates exit 0.

## Finding 1 — builders class

File: `eval/qa/corpus/battery/scf-grants-builders/q-gap-builders-person-empty.json`.

The direct stellarlight.xyz read is class C.
The note says "one witness for the 226 count".
The answer dates 114 profiles on 2026-07-11.
The answer dates 226 on 2026-09-30.
The two key facts stay the same.
The avoid line stays the same.
`eval/qa/cases.json` contains "the 226 count therefore has one witness".
This case file matches the parent bytes.

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
This case file matches the parent bytes.
`cases.json` matches the parent bytes.

## Finding 3 — base reserve invariant

The numeric invariant `base reserve` has verdict `consistent`.
`lastChecked` is 2026-09-30.
`reSwept.date` is 2026-09-30.
`reSwept.verdict` is `consistent`.
The key `reopened` is absent.
The reason says the dated 0.5 XLM wording matches the invariant.
The reason cites Horizon ledger 64703557 and ledger 64703824.
The round ledger records this re-sweep at lines 337-339.
`eval/qa/consistency-register.json` matches the parent bytes.

## Residual — matrix rows

Ledger line 305 names class C.
The cell says the Raven read and the direct Stellar Light read are the same witness.
Ledger line 306 names classes A and D.
The evidence cell calls the tftc.io page undated.
The evidence cell calls the SDF post the same witness as stellar.org.
This commit changes those two rows.

## Clusters 012 and 125

`register-review-d2.json` is in this tree.
Cluster 012 has verdict `consistent`.
Cluster 125 has verdict `consistent`.
The key `reopened` is absent on both clusters.
Both clusters store hash `0516eedef2611b2a8e696633499722857d31d5dd4fe7507eaf48d54af90336a5` for `q-defi-x402-on-stellar-what`.
Both cluster objects match the parent.

## Gates

The commands ran in a detached worktree at commit `ebf6683d`.
The detached copy used the checkout `node_modules`.
The raven-next-d checkout stayed at `ebf6683d7158a0c0600f54445b93995d240f1f62`.
The checkout status was empty after the commands.

`npm run eval:qa:lint -- --since origin/main --stale` exits 0.
The result line is `[lint-corpus] 0 error(s), 62 warning(s)`.

`npm run eval:qa:register -- --check` exits 0.
The result line is `[register-helper] up to date`.
