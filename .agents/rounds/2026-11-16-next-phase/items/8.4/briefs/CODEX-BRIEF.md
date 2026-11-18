# Item 8.4: Codex workhorse diff review

Repository `/home/tyler/code/raven-wt/np-8.4`, branch `np/8.4-families-everywhere`. Review
`git diff origin/main..HEAD` (two commits). Context: `.agents/rounds/2026-11-16-next-phase/items/8.4/PLAN.md`
(its "Reconciliation" section wins), `REVIEW.md` and `EXEC.md` next to it, `AGENTS.md`,
`.agents/model-roster.md`, `scripts/latest-model.mjs`, `scripts/lib/model-family.mjs`.

Goal: no live file selects a model by version; launch lines take a family's newest model via
`scripts/latest-model.mjs` and record the resolved ID. Records keep their versions.

Check, with file:line evidence:
1. Shell correctness of every edited launch line in `briefs/ITEM-LEAD.md`, `.agents/model-roster.md`
   and `items/1.4/dated/{2.1,2.2a,2.2b,2.2c,rehearsal}-LEAD.md`: the `M=$(...) && echo ... && hc run`
   form, quoting, the `systemd-run --scope` wrapper, failure behavior (resolver non-zero must stop the
   launch). The dated briefs run unattended on 2026-11-23 from `items/1.4/dated/launch-dated-lead.sh`.
2. In the dated briefs, did any hunk change anything other than model names, launch lines, the
   commit trailer sentence and the fail-closed sentence? Any meaning lost (fallback chain, reviewer
   tier, recording rule)?
3. `scripts/run-demo-model-gauntlet.mjs` and `test/demo-model-config.test.ts`: correctness, import
   of a `.ts` module from plain Node (the script already imported one), and whether the test guards
   something real.
4. `eval/qa/gateway-judge.md`: is the placeholder example and the stated reason for keeping the
   config explicit consistent with `eval/qa/gateway-rejudge.mjs` and `eval/qa/gateway-judge.mjs`?
5. Any live version pin the diff missed (skills, docs, scripts, src defaults).

Rules: search with `rg --hidden -g '!.git' <pattern> [path]` only. Never use `grep -r`, `git grep`,
`rg -u` or `--no-ignore`, an `rg -g` glob that matches a case file, or a shell glob over `eval/` or
`.agents/rounds/`. Never open eval/qa/corpus/, eval/qa/cases.json, sample.json, tool-cases.json,
eval/qa/results/, eval/qa/reviewed/, eval/corpus/, eval/holdout-cases.json, and never run the QA
lint. Read-only except your findings file. No model-calling eval, no paid call, no network writes.

Write findings to `/home/tyler/code/raven-wt/np-8.4/tmp/8.4-CODEX-REVIEW.md`: your model ID at the
top, a verdict (approve / approve with changes / block), then a numbered list with severity
(blocker / should / nit), file:line and a concrete fix. Keep it short.
