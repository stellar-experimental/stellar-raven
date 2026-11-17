# Item 1.4: Sonnet executor brief

You are the Claude Sonnet 5.5 executor of round item 1.4, high effort, in the worktree
`/home/tyler/code/raven-wt/np-1.4` (branch `np/1.4-prestage-dated-goldens`, `npm ci` done). No
subagents and no `hc` children. No model-calling eval, no paid call, no AI Gateway or Workers AI.
Keyless public reads (Horizon, status.stellar.org, GitHub API unauthenticated or `gh api`, the Docs
`.md` pages, communityfund.stellar.org) are allowed.

## Read first

- `AGENTS.md`; the skill `.agents/skills/golden-truth/SKILL.md`.
- In `.agents/rounds/2026-11-16-next-phase/items/1.4/`: `PLAN.md` (the reconciled plan; its
  "Reconciliation" section overrides anything earlier in it), `REVIEW.md`, `QUESTION.md`,
  `TIMER-TEST.md`, `amend-split.mjs`, `dated/launch-dated-lead.sh`, `dated/units/`.
- Round context: `../../PLAN.md` items 2.1 and 2.2, `../../DECISIONS.md`, `../../briefs/ITEM-LEAD.md`.

## Do

Carry out PLAN.md steps 1 to 6 exactly. Write the source files only, under `items/1.4/dated/`; the
lead installs them. Do not touch `~/backups`, `~/.local/share/raven-dated/`, `~/.config/systemd/`,
or any running timer or terminal. PLAN.md is reconciled with REVIEW.md and with both of the
orchestrator's answers in QUESTION.md, and it is the spec. Where REVIEW.md and PLAN.md differ,
PLAN.md wins. In short:

1. Bookkeeping: `TUNING_ROW_COUNT` 86; the `.agents/TODO.md` held-out status and the owner-decision
   bullet; every other tracked place that names v4 as the current split.
2. `dated/probe.mjs` and its committed baseline `dated/baseline-2026-11-17.json`.
3. `dated/sibling-check.mjs`; run it for each run (`--run 2.1|2.2a|2.2c`) and put only its last,
   commit-safe line into PRESTAGE.md. Never commit the stdout id list.
4. `dated/items.json`.
5. `dated/launch-dated-lead.sh` (rework the existing file), `dated/watchdog-dated.sh`,
   `dated/schedule-followup.sh`, and `dated/units/` (the four lead units and four watchdog units).
   Add the `RAVEN_DATED_DRY=1` mode and run the dry check that the Gates section of PLAN.md names.
6. `dated/PRESTAGE.md` and the briefs `dated/2.1-LEAD.md`, `dated/2.2a-LEAD.md`,
   `dated/2.2b-LEAD.md`, `dated/2.2c-LEAD.md`, `dated/rehearsal-LEAD.md`. Each
   brief is self-contained for a lead that wakes with no orchestrator: it states the item, the
   cases, the deadline, the outcome test, the overrides of ITEM-LEAD.md listed in PLAN.md, the
   child launch lines (copy the shapes from ITEM-LEAD.md, models from `.agents/model-roster.md`),
   and points at PRESTAGE.md for the evidence slots and the edits. Keep each brief short; put
   shared material in PRESTAGE.md once.

## QA-case rule

You may open only the six dated case files, `q-pc-quantum-preparedness-dormant`, and the further
ids that your own `sibling-check.mjs` prints to stdout as openable. Follow PLAN.md's "Held-out
rule for every committed file". Never open another file under `eval/qa/corpus/`, never read another
case's fields from `cases.json` or `sample.json` except inside `sibling-check.mjs` (which prints
counts only for non-tuning cases), and never read a split file except inside `sibling-check.mjs`
(`sets.tuning` only). Never write which set a case is in. Edit no case file in this item.

## Gates (run each bare, record a one-line summary of each in EXEC.md)

Every gate in PLAN.md "Gates (this item)".

## Finish

- Write `items/1.4/EXEC.md`: what you did per step, each gate's result, every deviation.
- Commit on the branch with the normal hooks (never `--no-verify`), message ending with
  `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. Do not push.
- Report with `hc send t1rs '/home/tyler/code/raven-wt/np-1.4/.agents/rounds/2026-11-16-next-phase/items/1.4/EXEC.md'`,
  then wait in this terminal: the lead may send review findings for you to reconcile.

## Notes

- `gh issue create --label dated-golden` fails if the label does not exist. Do not create labels
  from a script: `alert()` retries without `--label` when the labelled call fails.
- `dated/launch-dated-lead.sh`, its test results and TIMER-TEST.md came from the lead. Keep the
  launch line and the start-up dialog handling that TIMER-TEST.md proved.
- Keep it small: reviewers read every line. No shared library between the shell scripts beyond a
  few lines of `alert()` copied into two of them.
