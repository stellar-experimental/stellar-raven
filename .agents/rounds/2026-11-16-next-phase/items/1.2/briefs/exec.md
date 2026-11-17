# Brief: execute the item 1.2 fixes (Claude Sonnet 5.5)

You are the executor for round item 1.2 in the worktree `/home/tyler/code/raven-wt/np-1.2`,
branch `np/1.2-stellarorg-review`. Time box: 90 minutes.

## Read first

- `AGENTS.md`.
- `.agents/rounds/2026-11-16-next-phase/items/1.2/PLAN.md`: the triage table and the
  "Reconciliation of the Fable review" section. Where they differ, the reconciliation wins.
- `CODEX-REVIEW.md` and `REVIEW.md` in the same folder, for the fixtures and the reasoning.
- `src/adapters/stellar-org.ts`, `test/stellar-org-adapter.test.ts`.

## Do

1. Implement X1 to X5 exactly as the plan states, in `src/adapters/stellar-org.ts`. Keep the code
   small: one `clip` helper, one shared scanner for `mainHtml`, `htmlToText` and `documentTitle`.
   Keep each scan linear (R1's two-step end search; never a regex that can rescan to the end from
   each candidate).
2. Add every test the plan lists to `test/stellar-org-adapter.test.ts`. Existing tests stay and
   pass unchanged, except where a test asserts a now-capped value.
3. Update `research/services/stellar-org-site.md` "Design" as the plan's Docs paragraph says, and
   delete the "Adapter review residue" bullet in `.agents/TODO.md` plus the first clause of that
   entry's "Done when" (the vendor-diverse review is done). Touch nothing else in the TODO.
4. Gates, each run bare (no pipe), in the worktree: `npm run typecheck`, `npm test`,
   `npm run build`, `npm run secrets:scan -- --tree`. No `test:smoke`, no eval, no model call.
5. Live smoke (R6): `node --experimental-strip-types tmp/1.2-smoke/snapshot.mts tmp/1.2-smoke/after.json`,
   then compare with `tmp/1.2-smoke/before.json`: every `page` entry's `title` and `content`, and
   every `search` entry's `hits`, must be identical. If anything differs, copy `origin/main`'s
   adapter into `tmp/1.2-smoke/old/src/adapters/` (with `git show`, plus its imports) and run the
   snapshot against it at once, to tell site drift from a regression. Record the result in EXEC.md.
   Keyless stellar.org reads only, about 14 requests per run.
6. Write `.agents/rounds/2026-11-16-next-phase/items/1.2/EXEC.md`: what you did, per finding; a
   short summary of each gate's output (pass/fail, test counts); the live diff result; any
   deviation from the plan and why.
7. Commit on the branch with the normal hooks (never `--no-verify`): the code, tests, docs, and
   the whole `items/1.2/` folder (not `tmp/`). Message subject:
   `stellarOrg: cap titles and header echoes, raw-text scanner, case-insensitive /api (round item 1.2)`,
   ending with the line `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. Do not push.

## Rules

- No subagents; no other hc children. Do not touch any other terminal.
- Never print or read `.dev.vars`. No upstream post, no deploy, no push.
- If the plan is wrong or a gate fails and the fix is not obvious, write it in EXEC.md and stop.

When done, run: `hc send t1r9 '/home/tyler/code/raven-wt/np-1.2/.agents/rounds/2026-11-16-next-phase/items/1.2/EXEC.md'`
Then stay open: a fix review may send you findings to reconcile.
