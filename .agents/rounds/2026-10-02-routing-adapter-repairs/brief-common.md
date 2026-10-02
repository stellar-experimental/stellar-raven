# Common rules for every lane in round 2026-10-02-routing-adapter-repairs

Lead: `raven-next` (Claude Fable 5.1, Herdr pane `w3W:p2`). Base: `origin/main` `76c7f02b`.

Read `AGENTS.md` in your worktree first and follow it. Its hard rules apply in full.

Work only inside your worktree. `npm ci`, `npm run typegen`, and `.dev.vars` are already in place.

Do not:
- commit, push, open a pull request, deploy, or run `wrangler` / `npm run dev` / `npm run dev:eval`;
- run paid evals (`eval:qa*`, `eval:plan`, agentic lanes) or any Algolia write;
- edit anything under `.agents/`, `ecosystem-skills/`, or an inventory file you were not told to touch;
- add a query-specific exception, a compatibility shim, or a dual format (forward-only);
- hand-edit generated artifacts; rebuild them with their `package.json` scripts.

Gates: run each command bare, never piped, and record the exit code in your report:
`npm run typecheck`, `npm test`, `npm run build`, plus the lane-specific gates in your brief.
`npm run secrets:scan -- --tree` at the end.

Output: write `tmp/<lane>-report.md` in your worktree (`tmp/` is gitignored) with these sections:
1. Change — files touched and what each change does.
2. Rationale — the general rule in one sentence, and why this rule and not the alternatives.
3. Measurements — before/after tables (probe ranks and scores, gate tables, per-case flips).
4. Gates — every command run with its exit code.
5. Risks and open questions.
6. Notes for the independent reviewer.

Leave your changes in the working tree, unstaged. The lead commits, opens the PR, and runs the
independent review. When finished, reply with only the absolute path of the report.
