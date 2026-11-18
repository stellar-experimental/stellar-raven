# Item 7.2 report: RWA card caveat (#167)

Lead: Claude Opus 5.5, agentpc `t1wz`, 2026-11-18. Branch `np/7.2-rwa-caveat` from `fdddbe26`.

## Pull request and result

- PR: https://github.com/stellar-experimental/stellar-raven/pull/479 (`Refs #167`, no closing keyword;
  the body says do not rebase, squash-merge).
- **Result: `GET /api/rwa` stays excluded.** The caveat reduced the loss but did not remove it: on "notable
  DeFi and RWA launches of 2025" (D3), the attributable drop fell from 3 of 3 samples (6.3 result 2) to
  2 of 3, which still fires the clause. Nothing else fired. Details:
  [RESULTS.md](RESULTS.md).
  - The caveat, on the search card only (`cardCaveat`, read by no scorer): "Not a launch or news timeline:
    launchedAt is Soroban contract creation only. Includes fiat stablecoins; state is not product status."
    The wording names the field 6.3's D3 answers misread; it came from the Fable review's blocking finding.
  - Free routing on the INCLUDED+CAVEAT manifest equals 6.3's INCLUDED arm: legacy top3 293 to 291, holdout
    top3 stays 26 (its floor), captures 11 to 10. The gate held before any answer.
  - 42 answers (Sonnet 5.5, subscription CLI), 42 of 45 attempts, USD 5.34 subscription-equivalent, flat
    cost per answer (0.127 against 0.128). Blind Opus grader, Fable attribution. 6.3's rule and scripts ran
    unchanged, pre-registered in `666f1784` after a Fable plan review (1 blocking, 11 should-fix, 6 nits, all
    adopted; [REVIEW.md](REVIEW.md)).
  - The RWA card was in a search result before every registry call. On C2, where the registry is the right
    source, the client still called it 3 of 3. No bad answer, no off-topic registry use.
- Diff: commit C (`815feb75`) reverted (`c03e1164`); product paths equal `main`, manifest SHA-256 `7a4fab76…`.
  `.agents/` only otherwise: item records, the TODO RWA bullet (this result and the re-open triggers), check 8
  names 6.3 and 7.2, the ledger row.
- Gates, run bare by the lead on the final tree, all exit 0: typecheck, `npm test` (173 files, 4042 tests, 3
  expected fail), build, `eval:routing --gate` GATE PASS, `eval:selftest`, `secrets:scan --tree`.
- #167 status comment posted:
  https://github.com/stellar-experimental/stellar-raven/issues/167#issuecomment-6965234595
- No required review after execution: the exclude branch changes no exposure (the plan's Codex review was
  for include only).

## Deploy

Not needed: no Worker bytes change.

## For the orchestrator on the Mac

Nothing. Merge when CI is green.

## Recommendation on #167

Close #167 as **"decided: excluded by measurement"**. Two pre-registered answer A/Bs (6.3 result 2 and this
one) lose on the same question, and the TODO routing-repair item holds the re-open triggers: a Scout
`/api/rwa` schema change, a general mixed-intent routing mechanism, or an owner product need. Suggested
closing text: "Closed as decided: excluded by measurement (round items 6.3 and 7.2). Re-open on a Scout
`/api/rwa` schema change, a general mixed-intent routing mechanism, or an owner product need; the TODO
routing-repair item tracks these." I did not close it.

## Open questions for the owner

1. **Was this a reasonable try?** The caveat moved D3 from 3 of 3 losses to 2 of 3, so card text helps but
   does not make the client look past the registry for launch news. Another card wording would be the third
   measurement of the same question. I recommend against it. A real fix needs a source-selection change, not
   a card fact: for example, routing launch and news questions to `scout.searchResearch` and Lumenloop first.
   That is #167's general mixed-intent mechanism.
2. **Deviations from the 7.2 note, for the record.**
   - The include branch planned "Refs #167" with a close by the orchestrator after deploy, not a closing
     keyword. This is Fable finding 9. It did not apply because the outcome was exclude.
   - The caveat's wording changed from the note's example to name `launchedAt`. This is Fable finding 1,
     and the wording was pre-registered before any answer.
