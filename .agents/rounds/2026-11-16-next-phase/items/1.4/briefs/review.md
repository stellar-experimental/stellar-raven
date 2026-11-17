# Item 1.4: Fable plan review brief

You are a Claude Fable 5.2 reviewer, high effort, in the worktree `/home/tyler/code/raven-wt/np-1.4`
(branch `np/1.4-prestage-dated-goldens`). Read-only except your one output file. No subagents, no
`hc` children, no model-calling eval, no paid call.

## What to review

The plan `/home/tyler/code/raven-wt/np-1.4/.agents/rounds/2026-11-16-next-phase/items/1.4/PLAN.md`,
against the repository and these files next to it: `QUESTION.md` (the orchestrator's answer),
`amend-split.mjs` (already run; split v5 exists), `dated/launch-dated-lead.sh` (installed and
tested), `TIMER-TEST.md` if present. Context: `AGENTS.md`; `.agents/rounds/2026-11-16-next-phase/`
`PLAN.md` (items 1.4, 2.1, 2.2), `DECISIONS.md`, `briefs/ITEM-LEAD.md`; skills `golden-truth`,
`truth-maintenance`, `improvements-pipeline`; `eval/qa/README.md` ("Held-out split", "Source
sentinels"); `eval/qa/register-helper.mjs`; `eval/qa/lint-corpus.mjs` (`lintStale`, date-trap
checks); `eval/qa/source-sentinels.json`; `eval/qa/consistency-register.json`.

The goal: on 2026-11-23 18:00 UTC and on 11-30, 12-01 and 12-04, a timer starts an Opus lead with no
human or orchestrator present. That lead must re-verify the dated golden cases, run plan / Fable
review / Sonnet execute / independent re-derivation review, merge its own PR on green CI before the
stale deadline, and never guess. Judge the plan by whether those unattended runs succeed safely.

Questions to press:

- Are the outcome tests and the edit per outcome correct and complete for each case, register
  entry and sentinel? Anything that the stale lint, date-trap lint, cap-finding lint, register
  helper or sentinel runner would reject?
- Does the held-out handling hold: the dated leads open only tuning cases; the non-tuning sibling
  check prints counts only; nothing committed names a set for a case?
- Timer and launcher failure modes: reboot, `hc` core absent, PR 1.4 not merged in time, a lead
  that stalls, two dated PRs open together, a slipped vote and the follow-up timer, quota.
- Is the merge-on-green authority bounded tightly enough (what the dated lead may and may not do)?
- Fire times versus deadlines; anything simpler that does the same job.
- Spend: anything that calls a model-graded eval or a paid path.

## QA-case rule

You may open these six case files only: `q-edge-fresh-latest-protocol-version`,
`q-pc-protocol-upgrade-timing`, `q-protocol-version-history-list`,
`q-infra-software-versions-current-protocol`, `q-hist-quantum-preparedness-plan`,
`q-scf-current-round`, plus `q-pc-quantum-preparedness-dormant`, `q-protocol-ledger-close-time`,
`q-zk-host-functions-status`. Open no other file under `eval/qa/corpus/`, never read a split file
under `~/backups`, and never read another case's fields out of `eval/qa/cases.json` or
`sample.json` (search them only for ids already named here).

## Output

Write `/home/tyler/code/raven-wt/np-1.4/.agents/rounds/2026-11-16-next-phase/items/1.4/REVIEW.md`:
numbered findings, each with severity (blocking / should-fix / nit), the evidence (file:line or a
command and its result), and the change you propose. End with a one-line verdict. Then run
`hc send t1rs '/home/tyler/code/raven-wt/np-1.4/.agents/rounds/2026-11-16-next-phase/items/1.4/REVIEW.md'`.
