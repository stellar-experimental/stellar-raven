# Item 8.1 execution

Executor: Claude Sonnet 5.5, 2026-11-18, worktree `np-8.1`, branch `np/8.1-todo-audit` from
`origin/main` `bb171055`. Records only: no change under `src/`, `test/`, `eval/`, `scripts/` or any
code file. No model call, no paid call, no production write, no GitHub post, no subagent.

## What I did

1. Rewrote `.agents/TODO.md` from the reconciled [PLAN.md](PLAN.md). Kept sections come from
   `origin/main` by script (heading blocks copied unchanged), so they are byte-identical. New and
   rewritten text is written by hand. The file went from 1,169 to about 1,290 lines, mostly new
   items (matchPartners, skill scrub, Docs search misses, WorkOS, flush, move, hooks, `mcp-key`),
   the sign-in watch and the Owner decisions list.
2. Added "Follow-up answers (2026-11-18)" to
   [DECISIONS.md](../../DECISIONS.md), after the last "Follow-up answers" section and before
   "## Timing". It holds the owner's instruction, the #167 closure, the oauth-provider 1.x D1 and D2
   choices with the accepted bare-origin loss, and the Playground output-cap "no change".
3. Added one row for 8.1 to the round ledger
   ([2026-11-16-next-phase.md](../../../2026-11-16-next-phase.md)): lead Claude Opus 5.5, agentpc
   `t1yg`, PR "pending", deployed "Not needed: no Worker bytes change", with the merge-timing
   sentence.
4. Wrote [AUDIT.md](AUDIT.md): a line for every R, M and N, the deletions, and the K list.
5. Re-measured on 2026-11-18: `npm run build` from `bb171055` gives a `dist/server.js` with 0
   matches for `picomatch` (`rg -c` exits 1), npm `latest` for picomatch is 4.0.7, #481's body lists
   `agents@0.8.3`, `vitest@3.1.4` and `@cloudflare/vitest-plugin@0.0.0`, and agentpc runs Claude Code
   2.1.327, Codex 0.169.0 and Grok 1.0.88. Open issues are #481, #427 and #223.

## Gates

- `npm run typecheck`: exit 0, after the README's "Run locally" steps 2 and 3 (an ignored
  placeholder `.dev.vars` with names only, then `npm run typegen`). Without them the first run
  failed with `Env` missing its secret members, as AGENTS.md says it does.
- `npm test`: exit 0. 174 files passed, 5 skipped. 4190 tests passed, 3 expected fail, 8 skipped,
  equal to the 7.3 PR 5 baseline.
- `npm run build`: exit 0 (`--dry-run`). I did not run `test:smoke` because nothing under
  `src/executor` or `src/demo` changed.
- `npm run secrets:scan -- --tree`: exit 0, clean.
- Frozen anchors (scratch `tmp/check-anchors.py`, not committed): both frozen sections, the
  `**Software Versions (not filed).**` bullet, and the `**SCF.**` and `**Bell/P30 Mainnet vote
  ...**` bullets are byte-identical to `origin/main`. `none recorded yet`, the `## Dependencies`
  heading and the client-limit item are present. "held-out status" appears next to the current split
  path.
- Links and titles (scratch `tmp/check-links.py`, not committed): every relative link in the new TODO
  (82), the DECISIONS.md section, the ledger row and AUDIT.md resolves. Every quoted item title in
  the TODO matches a heading. The other quoted strings are section names in other files or
  quotations, and I read each.

## Deviations and judgment calls

- **Priorities has four entries, not five.** Review findings 4 and 6 merged the two Workers Logs
  reads and moved the golden look into the free-fixes entry.
- **Client-limit item title changed** to "Re-verify each external client limit before changing
  model-facing text", because the old title ("when its version changes") contradicts the new
  trigger. `test/helpers/mcp-tool-metadata.ts:29` still says "whenever a Claude Code version
  changes (.agents/TODO.md)". I left that code comment alone (records only). It is a small stale
  pointer, not a defect worth an item.
- **Other renamed items.** "Ship the cap decisions from the production read" became "Decide the
  `execute` timeout from one more Workers Logs read". "Add a release and package-version source"
  became "Fix the `getChangelog` ranking trap for release questions". "Re-check Devin CLI sign-in
  after the oauth-provider 1.x deploy" became "Watch sign-in rejects after the oauth-provider 1.x
  deploy". Every quoted title in the TODO matches. Only dated records outside the TODO cite the old
  titles, and they stay unchanged.
- **The Caps audit intro keeps one line of standing values** (search limit 50, 24-second budget,
  artifact caps), not the deletion the plan table implies. A reader of the timeout item needs them.
  The decisions and figures stay in the 3.1 record.
- **Scout exposure "Last fired" line** drops the lane deltas (+1, -1, -1). They are in
  `items/0.2/SCOUT-EXPOSURE.md`, which the line links.
- **The ledger row names no executor terminal ID**, because I do not know it. The reviewer ID `t1yh`
  is from PLAN.md's header and REVIEW.md.
- **The WorkOS item's owner-decision wording** follows reconciliation 16: the orchestrator keeps a
  second copy outside the checkout.
- **I did not run the remote `kv key list`** for `mcp-key`. Production reads wait for the
  2026-11-25 Mac session, as the new item says.
- No code defect found, so no item was added for one.

## Not done

- No push and no PR. The lead pushes and opens the records-only pull request with `Refs #481`,
  `Refs #427` and `Refs #223`, and no closing keyword.
- Reconciliation 14 applies to the merge: before 2026-11-23 18:00 UTC, or hold it and re-run the
  frozen-anchor check after rebasing.
