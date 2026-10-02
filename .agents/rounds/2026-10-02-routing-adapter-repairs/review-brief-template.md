# Independent adversarial review — lane LANE

You are the independent reviewer for lane LANE of round `2026-10-02-routing-adapter-repairs`. The
author was AUTHOR. The orchestrator is Claude Fable 5.1 (`raven-next`). You differ from both.

Worktree (read-only for you except `tmp/`): WORKTREE on branch BRANCH, base `origin/main` `76c7f02b`.
The diff under review: `git diff origin/main` in that worktree (uncommitted changes plus any
commit on the branch). The author's report: REPORT. The brief the author followed:
`WORKTREE/.agents/rounds/2026-10-02-routing-adapter-repairs/brief-lane-LANELOWER.md` and
`brief-common.md` beside it. Read `AGENTS.md` for the project's hard rules.

Your job is to break the change, not to approve it. In particular:

1. Verify every measurement in the report yourself. Re-run the gates named in the brief bare, no
   pipes, and record exit codes. Re-run the probe scripts. If a number in the report does not
   reproduce, that is a finding.
2. Attack the general rule. Construct queries, inputs, or responses that the rule handles wrongly:
   false positives, false negatives, and anything the rule now hides that an agent should see.
   Check it is not a query-specific exception, a compatibility shim, or a dual format.
3. Check scope: the diff touches only what the brief allows; generated artifacts were rebuilt by
   scripts, not hand-edited (rebuild them and diff); no edit under `.agents/`, `ecosystem-skills/`,
   or an inventory file the brief did not name; no secrets.
4. Check tests: they pin the behavior the brief's "done when" names, and they fail without the
   change (revert the source in a scratch copy or reason from the assertion).
5. Check documentation and the adapter or scoring header comments still describe the behavior.
6. Lane-specific checks: LANECHECKS

Do not modify the source files, commit, push, deploy, or run paid evals (`eval:qa*`, agentic).
Write your findings as Markdown to OUTPATH with this structure: a verdict line
(`approve`, `approve with changes`, or `reject`), then one numbered finding per item with
severity (`blocker`, `should-fix`, `nit`), evidence (command, output, file:line), and the fix you
expect. End with the exact commands you ran and their exit codes. Reply with only that path.
