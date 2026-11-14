# Brief: light QA test of the rebuilt battery

Read `briefs/common.md` first. Your lane is `qa-run`. Follow `.agents/skills/run-evals/SKILL.md`
sections 5 and 6 and `eval/qa/README.md` ("Commands", "Identity and budget requirements") exactly.

## Plan (already recorded in the round ledger)

- **Decision.** Which new or rewritten cases are unanswerable, ambiguous, or mis-goldened (fix
  the case), and which topics Raven's sources cannot answer (file a finding). This is a test of
  the battery, not a score for Raven: report no headline number.
- **Smallest run.** 70 cases, one client (the runner's default answering and judge models),
  variant A: the 36 cases activated in this round plus 34 rewritten cases, drawn as below.
- **Stop rule and cap.** One collection, `--max-budget-usd 40`. Stored runs cost USD 0.32 to 0.41
  per case, so expect USD 22 to 29 and one to two hours. No re-run, no re-judge. If a pin changes
  or the cap stops the run, report what completed and stop.
- **Review coverage.** Every `wrong` and `partial` row against its transcript and golden, plus
  every fifth `correct` row.
- **Billing.** The runner spawns headless Claude Code on this machine's subscription login. The
  owner approved subscription spend on 2026-11-14. No API-billed path.

## Steps

1. The orchestrator gives you the commit in your launch line. Create a clean worktree for it:
   `git -C /home/tyler/code/stellar-raven-codemode worktree add --detach /home/tyler/code/raven-wt/gca-eval <commit>`.
   Run `npm ci` there, copy `/home/tyler/code/stellar-raven-codemode/.dev.vars` into it (it is
   git-ignored; never print it), and run `npm run typegen`. Confirm `git status --porcelain` is
   empty.
2. Start the server as your own child: `hc run --bg --name gca-eval-server --cwd
   /home/tyler/code/raven-wt/gca-eval npm run dev:eval -- --port 8795`, then
   `hc wait gca-eval-server --output Ready`. Prove readiness with the initialize request from the
   skill. Do not touch any other server or terminal.
3. Draw the 34 rewritten cases: from `eval/qa/cases.json`, take cases that are not among the 36
   new ones, key each by `sha256("gca-qa-test:" + id)`, group by the domain of `truth.leaf`
   (read the case files for the leaf), and take the lowest keys per domain in proportion to the
   domain's size, at least two per domain. Write the 70 ids to
   `.agents/rounds/2026-11-14-golden-coverage-audit/qa/ids.txt` in the main round worktree
   (`/home/tyler/code/raven-wt/gca`).
4. Compute every identity pin in the collection shell as the README describes, including the
   remote identity probe. Set `DISABLE_AUTOUPDATER=1` and pin the versioned Claude executable.
5. Run one collection with `--variant A --ids <the 70 ids> --port 8795 --max-budget-usd 40` and
   the pin flags. Assert that 70 jobs were planned and count what completed.
6. Review the declared rows. Classify each reviewed failure with the table in section 7 of the
   skill: judge artifact, agent failure, own-repo gap, eval-side gap (a problem with the case),
   upstream data or content gap, upstream semantics gap, or corpus-coverage diagnostic. For an
   eval-side gap, say exactly what is wrong with the question or golden and propose the fix. For
   an upstream gap, name the source, what it lacks, and what content would close it.
7. Stop your server (`hc kill gca-eval-server`). Leave the worktree.

## Output

In `/home/tyler/code/raven-wt/gca/.agents/rounds/2026-11-14-golden-coverage-audit/qa/`:

- `RESULT.md`: the pins (hashes only), the results stamp, models, rubric and pack, cost, jobs
  planned and completed, verdict counts split into new and rewritten cases, and the review table
  (id, verdict, classification, one-line reason, proposed action). Then three lists: cases to
  fix, upstream gaps by leaf, and judge artifacts. No case text from the transcripts beyond short
  quotes.
- `review.json`: the same review rows as data.

Results JSON stays in the ignored `eval/qa/results/` of the eval worktree; give its path. Send the
path of `RESULT.md`.
