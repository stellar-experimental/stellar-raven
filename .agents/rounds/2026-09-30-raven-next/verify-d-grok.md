# Verification — PR D commit 11a26ac4

Verdict: register check fails

Reviewer: Grok.
Commit: `11a26ac4761c9c959f664e840faa09eaa3932368`.
The range is `origin/main` `157c26b42038055b87f904e1c0b92479afad35a7` through `11a26ac4`.
The three requested edits are in that commit.
The register check on that commit exits 1.

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

The class edit changes `q-defi-x402-on-stellar-what`.
Cluster 012 and cluster 125 keep hash `472b7e0b42a4bd7b90448d64ed46d273fcc107314ff22d07ec03e3c76531fcdc`.
That hash matches the parent commit.
Both cluster objects match the parent commit.
Both verdicts are `consistent`.
The key `reopened` is absent on both clusters.
`register-review-d2.json` is absent from this commit.

## Finding 3 — base reserve invariant

The numeric invariant `base reserve` has verdict `consistent`.
`lastChecked` is 2026-09-30.
`reSwept.date` is 2026-09-30.
`reSwept.verdict` is `consistent`.
The key `reopened` is absent.
The parent commit has verdict `reopen`.
The parent `reopened.reason` is `member-content-changed`.
The new reason says the dated 0.5 XLM wording matches the invariant.
The reason cites Horizon ledger 64703557 and ledger 64703824.
The round ledger records this re-sweep at lines 337-339.

## Gates

The commands ran in a detached worktree at commit `11a26ac4`.
The detached copy used the checkout `node_modules`.
The raven-next-d checkout stayed at `d17ba9146dcd659ede0eb680c108b879664bbf33`.
The checkout status was empty after the commands.

`npm run eval:qa:lint -- --since origin/main --stale` exits 0.
The result line is `[lint-corpus] 0 error(s), 62 warning(s)`.

`npm run eval:qa:register -- --check` exits 1.
The helper prints `[register-helper] REOPEN cluster-012: member content changed`.
The helper prints `[register-helper] REOPEN cluster-125: member content changed`.
The helper prints `[register-helper] changes required`.

## Residual

Ledger line 305 lists classes `C, D` for the builders case.
Ledger line 306 lists classes `A, D, E` and `tftc.io 2026-07-16`.
The reconciliation rows at lines 345-347 state the three fixes.
This check uses commit `11a26ac4` only.
Later commits on the branch are `dedd55b3` and `d17ba914`.
