# Brief: first full baseline on the rebuilt battery

Your lane is `baseline`. Read the round ledger `.agents/rounds/2026-11-14-baseline-tuning.md`
("Plan 1") and follow `.agents/skills/run-evals/SKILL.md` sections 5 to 7 and `eval/qa/README.md`
("Commands", "Identity and budget requirements") exactly. The plan is authorized as written; do not
widen it.

## Steps

1. Use the clean worktree `/home/tyler/code/raven-wt/gca-eval`. Its old results JSON under
   `eval/qa/results/` must survive: check it is git-ignored, then `git checkout --detach 66301389`,
   `npm ci`, `npm run typegen`. `git status --porcelain` must be empty. Never print `.dev.vars`.
2. Start the server as your own child: `hc run --bg --name base-server --cwd
   /home/tyler/code/raven-wt/gca-eval npm run dev:eval -- --port 8796`, then
   `hc wait base-server --output Ready`, then the initialize probe from the skill. Touch no other
   server or terminal.
3. Compute every identity pin in the collection shell as the README describes, with
   `DISABLE_AUTOUPDATER=1` and the versioned Claude executable pinned.
4. One collection: all 247 headline cases, variant A, `--port 8796 --max-budget-usd 90`, the pin
   flags, default answering and judge models. Assert 247 jobs planned before spend; count what
   completed. If a rate limit, a changed pin or the cap stops it: report and stop. No resume, no
   re-run, no re-judge.
5. Run the free plan regrade on the stored run (`npm run eval:plan -- <results>`).
6. Review only the tuning set. The split is at `~/backups/gca-2026-11-14-split-v2.json`
   (`sets.tuning`). Read only `sets.tuning` from it. Never open, list, or quote a row whose id is
   not in the tuning set; for the other two sets compute verdict counts by script and nothing else.
   Review every tuning `wrong`, trap row and `partial` against its transcript and golden, and every
   fifth tuning `correct`. Classify each with the table in section 7 of the skill. Re-execute a
   read-only live call where a classification would otherwise be a guess, and say which rows rest
   on a probe.
7. Stop your server. Leave the worktree and the results JSON.

## Output

In `/home/tyler/code/raven-wt/gca/.agents/rounds/2026-11-14-baseline-tuning/` (branch
`evals/baseline-2026-11-14`, already checked out there; commit and push when done):

- `BASELINE.md`: pins (hashes only), stamp, models, rubric, pack, cost, time, jobs planned and
  completed; verdict counts for all 247 and per set (tuning, held-out, reserve: counts only), per
  domain, per freshness, core-answer-correct count, the five-track report, cost per answer, and the
  plan-regrade summary. Then the tuning review table (id, verdict, classification, evidence basis,
  one-line reason). Then, most important, **ranked tuning targets**: failure patterns seen in two
  or more unrelated tuning cases, each with the mechanism (what the agent was told or shown at the
  failure moment, per section 7 "Before a wording fix"), the nearest surface that could change it,
  and the cases it would affect. Separate lists: case defects, upstream gaps, judge artifacts.
- `review.json`: the tuning review rows as data.

Send the path of `BASELINE.md`.
