# Item 6.1 fix brief: reconcile the Codex review and two lead notes

Same rules as `briefs/EXEC-BRIEF.md` (git grep exclusions, no backups or exposure note, hooks on, Sonnet trailer,
no push, gates bare). Review: `/home/tyler/code/raven-wt/np-6.1/.agents/rounds/2026-11-16-next-phase/items/6.1/CODEX-REVIEW.md` (Codex frontier `gpt-6-astra`, high, verdict FAIL on finding 1).

Do these, as one new commit (no history rewrite), then add a "Codex reconciliation" section to EXEC.md with one
line per finding (adopted / how):

1. Codex 1 (should-fix): in `amend-split-v10.mjs`, map every imported `AmendError` to a fixed local, path-free
   message (for example a `LINES.amend` entry "check failed: the amendment library refused the move (message
   withheld)"), so no path can print. Do not run the script again (v10 exists; it refuses to overwrite).
   Check with `node --check`.
2. Codex 2 (low): keep the 0.5.5 smoke case as a compatibility check. Rename it so it does not claim to test
   the gate's release behavior (e.g. "execute runner: an unawaited provider call does not break the run
   (codemode 0.5.5 compatibility)"). Assert the value as tightly as the execute result shape allows: if the
   result can carry a footer, keep `startsWith` but also assert the first line is exactly `1`.
3. Codex 3 (low): fix EXEC.md's search-region line ranges (0.5.1 lines 1282–1394, 0.5.6 lines 1291–1403,
   extracted by region markers, SHA-256 `a7daa25f312b2e6be4179c508b47fef7e1dc1c4915e97752304632933d410255`),
   at both places it is cited.
4. Codex 4 to 8 (info): no change. Record them as such.
5. Lead note A: `.agents/TODO.md` codemode item: replace "`cs-012` (...) is a live bullet: through 0.5.6," with
   "`cs-012` (...): through 0.5.6,". Wording only.
6. Lead note B: `src/catalog/vendor/search-scoring.ts` header: add one comment line stating the undocumented
   adaptation you found: `normalizeSearchText` also splits on `#` (upstream `/[_./:-]+/`, Raven `/[_./:#-]+/`),
   present since the initial snapshot. Comment only, no code change.

Gates after the commit: `npm run typecheck`, `npm test`, `npm run test:smoke`, `npm run build`,
`npm run secrets:scan -- --tree`, and `npm run -s mcp:surface -- --json` (hashes must be unchanged).
Then `hc send t1v5 '/home/tyler/code/raven-wt/np-6.1/.agents/rounds/2026-11-16-next-phase/items/6.1/EXEC.md'`.
