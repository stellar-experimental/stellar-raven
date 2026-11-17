# Executor brief: item 6.3 re-test records (exclude)

The lead accepts the mechanical re-test outcome in RESULTS-2.md: **exclude**. Same binding rules as
RETEST-BRIEF.md (search rule included). Do:

1. `.agents/TODO.md`, routing-repair item, "Held by this item" RWA bullet: after the result-1 sentences,
   add one or two plain sentences for result 2. Content: a pre-registered 3-sample re-test (round item 6.3,
   result 2, 42 answers, Sonnet 5.5, blind Opus grader, Fable attribution) also returned exclude, on one
   question: on "notable DeFi and RWA launches of 2025" the INCLUDED answer stopped at registry rows and
   missed the headline launches in all three samples (a completeness loss, not an accuracy one); result 1's
   control drop did not repeat, and the registry did not hurt the controls or off-target questions. Link
   `rounds/2026-11-16-next-phase/items/6.3/RESULTS-2.md`. Keep "a re-test needs an owner or orchestrator
   decision". Do not remove result 1's sentences.
2. `.agents/TODO.md`, item "Re-check the upstream codemode short-token repair": add one sentence that
   issue #167 does not depend on cloudflare/agents#2296 (Raven vendors its scorer), so #167 no longer tracks
   it and this item keeps the watch.
3. One records commit: EXEC.md (complete the re-test part, with each gate's short output summary),
   RESULTS-2.md, verdicts-2.json, this brief, and the TODO edits.
4. Gates on the final tree, each run bare, routing stdout to `tmp/6.3/`: `npm run typecheck`, `npm test`,
   `npm run build`, `npm run eval:routing -- --gate`, `npm run eval:selftest`,
   `npm run secrets:scan -- --tree`. Report any failure plainly.
5. Do not push. Report with `hc send t1w3 '/home/tyler/code/raven-wt/np-6.3/.agents/rounds/2026-11-16-next-phase/items/6.3/EXEC.md'` and wait.
