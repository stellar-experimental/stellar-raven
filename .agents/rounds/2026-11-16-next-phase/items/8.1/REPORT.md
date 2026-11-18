# Item 8.1 report: audit `.agents/TODO.md`

Lead: Claude Opus 5.5, agentpc `t1yg`, 2026-11-18. Branch `np/8.1-todo-audit`, from `origin/main` `bb171055`.

## Pull request and result

- PR: https://github.com/stellar-experimental/stellar-raven/pull/487. Records only. It says `Refs #481`, `Refs #427` and `Refs #223`, with no closing keyword.
- **Merge before 2026-11-23 18:00 UTC.** If that is missed, hold the merge until 2.1 and its follow-ups have merged, then rebase and re-run `tmp/check-anchors.py` (an untracked scratch file in the worktree; it diffs the frozen sections against `origin/main`).
- The TODO was audited item by item. [AUDIT.md](AUDIT.md) gives each item's disposition (keep, rewrite, merge, delete or new) with a reason. Deleted facts name where they now live.
- **All four of the note's required changes landed:**
  - the general sign-in watch;
  - the MCP Skills owner decision;
  - the WorkOS recovery item (no person, email or ID);
  - the timing-flake facts.
- DECISIONS.md has "Follow-up answers (2026-11-18)".
- **Process:**
  - Fable plan review (`t1yh`): 1 blocking and 21 more findings, all adopted ([REVIEW.md](REVIEW.md); reconciliation in [PLAN.md](PLAN.md)).
  - The Sonnet executor (`t1yj`) wrote the change ([EXEC.md](EXEC.md)).
  - I read the full diff and made three fixes in `f0a3a9b5`. The release item's done condition could not be met if the owner leaves release data upstream. One section label was wrong. The flush wording was unclear.
  - No further review is required: no code, no exposure change, no security boundary, no retirement.
- **Gates, run bare by me, all exit 0:**
  - typecheck;
  - `npm test` (174 files; 4190 passed, 3 expected fail, 8 skipped);
  - build;
  - `secrets:scan -- --tree`;
  - the frozen-anchor diff (all five anchors identical);
  - the link check (82 TODO links resolve).
- USD 0. No model-calling eval, no production read or write, no case file opened.

## Deploy

Not needed: no Worker bytes change.

## For the orchestrator on the Mac

1. **The 2026-11-25 Mac session is now Priority 2 in the TODO.** In one Workers Logs session:
   - the sign-in watch, with a denominator (the reject events plus `/authorize`, `/token` and `/register` by status if the platform rows can be read; otherwise a fresh `claude:` sign-in as a positive control);
   - the `execute` timeout read, with its `recoveryHint`, `skipped`, `errorName` and user-agent questions;
   - one read-only `wrangler kv key list --binding OAUTH_KV --remote --prefix raven:api-key:v1:` for `mcp-key`. Record the output shape only.

   Workers Logs keep at most 7 days, so a later read loses deploy days.
2. **WorkOS record.** Per the safe default, keep a second copy of the untracked
   `research/audits/2026-11-17-workos-github-email-collision.md` outside the checkout until the owner decides.
3. **Case-file move.** It needs the dated timers gone. The trigger is in the TODO: every dated run and follow-up has merged, and `systemctl --user list-timers` on agentpc shows no `raven-dated` or `raven-watchdog` unit.

## Open questions for the owner

These are listed in the TODO under "Owner decisions", each with a safe default. None blocks this PR.

1. Which source, if any, to test for the facts no reached source holds. Safe default: none.
2. Release and package-version data, and the Dashboard lumens API. Safe defaults: leave release data upstream and file the request; do not add the Dashboard API.
3. The MCP Skills extension. Safe default: not started.
4. Whether to commit the WorkOS recovery record, and with what redaction, or discard it.
5. Installing ripgrep on agentpc (needs sudo).
6. A production bearer credential for post-deploy checks. Safe default: none.

Owner veto: the Playground output-cap bullet was closed as "no change". The 3.1 read found cap stops rare, and the decision is recorded in DECISIONS.md.

## Noted, not changed

`test/helpers/mcp-tool-metadata.ts:29` still says to re-verify "whenever a Claude Code version changes (.agents/TODO.md)". The TODO trigger is now "before a change to model-facing text, or when release notes name an MCP limit". It is a one-line code-comment drift, left alone because this PR is records only.
