# Executor brief: item 7.2, phase 2 (step 6b, exclude)

Lead: Claude Opus 5.5, agentpc `t1wz`. The lead accepts the mechanical outcome, **exclude** (D3 attributable drop,
2 of 3). Same worktree, branch and binding rules as `briefs/EXEC-BRIEF.md` (search rule, spend, secrets, hooks,
`Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`, no push). No model-calling run in this phase.

No commit message carries "close", "fix" or "resolve" followed by `#N`; write `Refs #167`.

Do, in order:

1. `git revert --no-edit 815feb75`, then amend only that revert's message to a plain summary ending with
   `Refs #167` and the Co-Authored-By line. Record in EXEC.md that `sha256sum catalog/manifest.json` gives
   `7a4fab7687507691d1ac7b219761fe9f9a7600b29ffb96d17f8815503c5caa29` and that
   `git diff --stat fdddbe26 HEAD -- . ':!.agents'` is empty.
2. `.agents/TODO.md`, routing-repair item:
   - "Held by this item", RWA bullet: after the 6.3 result-2 sentences and before "The A/B is not re-run on
     routine drift", add: "A card-caveat variant (round item 7.2, 2026-11-18: the same 42-answer design, with
     the card saying the registry is not a launch or news timeline and `launchedAt` is Soroban contract
     creation only) also returned exclude: the 2025-launches loss fell from three of three samples to two,
     which still fires the clause. See [RESULTS.md](rounds/2026-11-16-next-phase/items/7.2/RESULTS.md). Re-open
     only on a Scout `/api/rwa` schema change, a general mixed-intent routing mechanism, or an owner product
     need." Keep the existing sentences.
   - Acceptance check 8: "was tested in round item 6.3 and not adopted" becomes "was tested in round items
     6.3 and 7.2 and not adopted".
   Keep the file's style; change nothing else.
3. Finish `EXEC.md` with a phase-2 section (the revert, its hash check, the TODO edits, gates) and keep
   RESULTS.md as written. Then run each gate bare on the final tree, stdout to `tmp/7.2/gate-*.txt`, and
   summarise each in EXEC.md: `npm run typecheck`, `npm test`, `npm run build`,
   `npm run eval:routing -- --gate` (read only the GATE line), `npm run eval:selftest`,
   `npm run secrets:scan -- --tree`. No `test:smoke` (no `src/executor` or `src/demo` change), no QA lint.
4. One records commit: EXEC.md, RESULTS.md, verdicts.json, this brief and the TODO edit. Run `git status`
   and confirm the tree is clean.
5. Clean up your own children (`hc kill`, `hc rm`) and confirm no `workerd` or `dev:eval` you started is
   still listening (`lsof -nP -iTCP -sTCP:LISTEN -a -c workerd`).

Report with `hc send t1wz '/home/tyler/code/raven-wt/np-7.2/.agents/rounds/2026-11-16-next-phase/items/7.2/EXEC.md'`
and wait in your terminal.
