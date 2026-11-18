# Item 8.3 diff review (Codex workhorse, high)

Worktree `/home/tyler/code/raven-wt/np-8.3`, branch `np/8.3-model-families`. Review the code diff
`git diff origin/main...HEAD -- eval scripts src test` for correctness. Context:
`.agents/rounds/2026-11-16-next-phase/items/8.3/PLAN.md` (step 5 and the Reconciliation table are
the contract) and `EXEC.md` (what the executor did and its deviations).

Focus:
1. Model identity in `eval/qa/model-identity.mjs`, `agent-result.mjs`, `judge.mjs`, `run-qa.mjs`,
   `re-judge.mjs`, `judge-stability.mjs`, `scripts/run-playground-semantic-eval.mjs`,
   `eval/playground/artifact-contract.mjs` and `eval/discovery/run-agent-discovery.mjs`. Can an
   artifact end up with an alias or `null` in an identity field (`meta.model`, `meta.judgeModel`,
   `row.agent.model`, Playground `judge.resolvedModel`) while it still passes an equality guard?
   Can two different resolved models pass as one measurement? Is the pin race-safe under the
   runner's concurrency? Does `judgeStoredResults` stamp the tuple before the first paid call, and
   what does a fresh file stamp (`judgeModel: null`): could any reader treat null as a match?
2. Stored artifacts: do stored v4 QA files and stored Playground v3 files (no new fields) still
   load, resume, re-judge and compare exactly as before? Check `judgeTupleForSnapshot` and the
   hash.
3. The resolver `scripts/lib/model-family.mjs` and `scripts/latest-model.mjs`: version ordering,
   fail-closed paths, and that no error echoes cache content.
4. `src/demo/model-config.ts` and the gauntlet: confirm primary and fallback are byte-for-byte the
   same IDs as before and that no `src/` path reads the Grok control constant.
5. Tests: do they test the claims, or only the mocks?

Rules:
- Search only with `rg --hidden -g '!.git' <pattern> [path]`. Never use `grep -r`, `git grep`,
  `rg -u` or `--no-ignore`, an `rg -g` glob that matches a case file, or a shell glob over `eval/`
  or `.agents/rounds/`. Never open a QA case file (`eval/qa/corpus/`, `cases.json`, `sample.json`,
  `tool-cases.json`, `eval/qa/results/`, `eval/qa/reviewed/`). If `rg` is missing, use the
  `git grep` exclusion pathspec that `eval/qa/README.md` ("Held-out split") prints.
- No model call, no eval, no paid call, no network writes. Do not edit any tracked file. Never
  print a secret, and do not print `~/.codex` or `~/.grok` cache contents.
- You may run `npx vitest run <file>` for single test files.

Write findings to `/home/tyler/code/raven-wt/np-8.3/tmp/8.3-CODEX-REVIEW.md`: numbered, each with
severity (blocker, should-fix, nit), file:line evidence, a concrete failure scenario, and the fix.
End with a verdict line and your model ID and effort.
