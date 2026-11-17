# Item 6.2: second opinion (Claude Opus 5.5, high)

Reader: Claude Opus 5.5, agentpc child of `t1v9`, 2026-11-17. Read-only: no model-calling run, no
tracked edit, no subagent. Inputs: `PLAN.md`, `RESULTS.md`, `blind.mjs`, `tmp/6.2/` (key,
verdicts, answers, arm stamps), the two judge directories, and `questions.json`. I did not read the
Fable second opinion.

## Verdict: absorb

The rule's outcome follows from the evidence, and the margin is wide. FRESH has 0 losses in 30 pairs
and 1 win (Fable L2). All three hold triggers are far from firing. A hold under rule 1 or 2(a) would
need two or three judge errors, all against FRESH. Rule 2(b) cannot fire from one regraded tie on any
Docs pair, because every FRESH Docs run reached a reference path. It also cannot fire on L2, because
every FRESH L2 run called `scout.*`. The one degenerate case is under caveat 3. The evidence says
the fresh titles do not hurt answers. The routing re-baseline (two legacy rows, one holdout top-3) is
a rank-proxy cost that did not appear at the answer level. Fable and Opus FRESH both still called
`stellarDocs.search_rpc_horizon_data_docs` on L1, the lost row.

## What I checked

- **Scoring.** I re-derived all 30 outcomes from `blind-key.json` and the two verdict files,
  independently of `blind.mjs`. They match RESULTS.md exactly: 29 ties and 1 win (Fable L2, HOLD
  `wrong`). No fabrication was marked on either arm. The scorer's un-blinding (`meta.X === "hold" ?
  v.X : v.Y`), its `isBad`, its outcome logic, its margin-of-two triggers and its inconclusive
  thresholds match PLAN.md. Verdict validation checks the judge assignment, duplicates and
  completeness. No judge graded answers from its own model.
- **Blinding.** Packet entries carry only `id`, `question`, `referenceUrls` and X/Y `{answer,
  toolCalls, resultUrls}`. A grep of both packets found no `claude-`, arm word, commit SHA,
  `sourceRevision`, cost or timestamp. The 23 `localhost` hits are documentation example URLs
  (`:3001/weather`, `:4021/weather`, `:8000/soroban/rpc`) and occur on both arms, so they are not
  the dev-server port. The key was packed once (19:57, before both verdicts), and the code refuses
  a second pack.
- **Arm identity.** `git show <rev>:catalog/manifest.json | sha256sum` for `4092901` and `8c9241c`
  reproduces both recorded hashes. Commit A changes only the titles file and the manifest. Every
  answer record carries the right `arm`, the requested model and the same `claude --version`
  (2.1.326). The runs are sequential per client, and the windows do not overlap (HOLD
  19:44:20–19:49:45, FRESH 19:50:15–19:57:30).
- **Question text.** L1, L2 and N1–N4 equal their routing rows by id. N4 lives in
  `extendedCases`.
- **Reach and cost.** The per-run operation sets differ only in incidental ways. No pair shows FRESH
  losing Docs access that HOLD had. Cost and turns are within a few percent between arms for every
  client (USD 9.97 HOLD against 9.96 FRESH). Every run took one attempt.

## Caveats for the orchestrator

1. **The test detects only large effects.** There is one sample per cell, 29 of 30 pairs tie, and
   the single win rests on a strict reading of the L2 "uncited figure" clause. HOLD Fable L2 dates
   its figures to a "weekly roundup" and an "article", but gives no URL for them. A lenient judge
   could call that pair a tie. The outcome would still be absorb (net 0). Read the A/B as "no
   detectable regression", not as "FRESH is better".
2. **The X/Y split is lopsided.** HOLD is X in 22 of 30 pairs. Under a fair coin, a split this
   uneven has two-sided p ≈ 0.016. The code path (`randomInt(2) === 1`) is correct, so I read it as
   chance. If judges favour X, this split biases toward HOLD, which is against absorb. It does not
   weaken the outcome.
3. **Rule 2(b) has a degenerate case.** When HOLD made no Docs call, `R` is empty, and any FRESH
   loss with no reference reach becomes "attributable". The scorer marks this case `(R empty)`. It
   would have applied to Sonnet F3, where neither arm called any service operation. That pair tied,
   so the case did not arise here. Fix it before the scorer is reused.
4. **The "Varial" probe did not separate the arms.** The search tool returned the same top five on
   both arms. Arm identity therefore rests on `sourceRevision`, the clean tree and the manifest hash,
   and those checks are sufficient. The run records do not keep search rankings, so the A/B cannot
   show directly how often the live first-search top five differed.
5. **The holdout top-3 now sits at its floor of 26.** The next change that costs one holdout top-3
   fails the gate. The plan already carries this into the gates note and TODO. Keep it there.
6. **This is model-facing catalog text.** It needs a deploy from the Mac after merge, which the plan
   notes.
