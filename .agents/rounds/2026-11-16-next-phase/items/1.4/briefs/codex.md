# Item 1.4: Codex frontier review brief (unattended dated runs)

You are the independent reviewer of round item 1.4 (Codex frontier, `gpt-6-astra`, high effort),
read-only, in `/home/tyler/code/raven-wt/np-1.4`, branch `np/1.4-prestage-dated-goldens` (its last
commit plus the uncommitted edits in the tree). One pass. Keyless public reads are allowed; no
model-calling eval, no paid call, no write except your findings file.

## What the change does

On 2026-11-23 18:00 UTC and on 11-30, 12-01 and 12-04, systemd user timers on this machine run
`launch-dated-lead.sh`, which creates a git worktree and starts an unattended Claude Opus lead
(`--dangerously-skip-permissions`, a `gh` token with repository admin, branch protection not
enforced for admins). That lead edits golden QA cases, runs its own reviews, and squash-merges its
own pull request within stated limits. Model-free watchdogs alert by `hc` and `gh issue create`.

## Read

- `.agents/rounds/2026-11-16-next-phase/items/1.4/`: `PLAN.md`, `REVIEW.md`, `QUESTION.md` (the
  orchestrator's answers bind), `EXEC.md`, `TIMER-TEST.md`, `amend-split.mjs`, and everything in
  `dated/` (scripts, units, `items.json`, `PRESTAGE.md`, the five briefs).
- `AGENTS.md`, `.agents/rounds/2026-11-16-next-phase/briefs/ITEM-LEAD.md`, the `golden-truth` skill,
  `eval/qa/README.md` ("Held-out split"), `eval/qa/register-helper.mjs`, `eval/qa/lint-corpus.mjs`,
  `test/source-sentinels.test.mjs`.
- `git diff origin/main` for the rest (`eval/qa/tuning-rows.mjs`, `.agents/TODO.md`).

## Attack

1. **Shell and systemd correctness** of `launch-dated-lead.sh`, `watchdog-dated.sh`,
   `schedule-followup.sh` and `dated/units/`: quoting, `set -e` traps, exit codes versus
   `Restart=on-failure`/`RestartPreventExitStatus=75`/start limits, the "already done" and watchdog
   `jq` logic, date arithmetic, the run-key collisions, behaviour when `hc` or the network is down,
   when PR 1.4 merges late, after a reboot (`Persistent=true`).
2. **Authority and safety of the unattended lead**: can the briefs and PRESTAGE.md lead it to merge
   something it should not, write outside the write set, use `--admin`, loop on issues, or act on a
   false outcome (the A/B/X test in PRESTAGE.md section 4)? Is anything missing that the
   orchestrator's answer 2 requires (cutoff, open PR, blocker at the top of REPORT.md)?
3. **Held-out hygiene**: does any committed or to-be-committed file in this diff, or any file a dated
   lead is told to commit, name a case as in or out of the tuning set, or let a reader identify one by
   subtraction (per-entry counts against the public register or a reproducible pattern)?
   `sibling-check.mjs` must print non-tuning information as counts only. Do not read
   `~/backups/*split*` yourself, and open no file under `eval/qa/corpus/` beyond the six dated cases
   and `q-pc-quantum-preparedness-dormant`.
4. **Golden correctness of the staged edits**: would the staged A/B/X edits, sentinel changes, the
   test edit and the register steps pass `eval:qa:compile`, `eval:qa:lint -- --stale
   --enforce-floors`, `eval:qa:register`, `eval:qa:sentinels`, and `npm test`? Are the staged facts
   true today (Horizon, status.stellar.org, the Bell guide, the Software Versions page, the SCF awards
   page)?

## Output

Write `/home/tyler/code/raven-wt/np-1.4/tmp/CODEX-REVIEW.md`: numbered findings, each with severity
(blocking / should-fix / low / info), evidence (file:line, or command and result) and the fix. End
with a one-line verdict. Then run `hc send t1rs '/home/tyler/code/raven-wt/np-1.4/tmp/CODEX-REVIEW.md'`.
