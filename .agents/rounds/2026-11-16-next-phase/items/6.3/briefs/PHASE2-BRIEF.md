# Executor brief, phase 2: item 6.3, step 6b (exclude) and step 7

The lead accepts the mechanical rule outcome in RESULTS.md: **exclude**. Do PLAN.md step 6b (the
"Exclude" form, not inconclusive) and step 7. Same binding rules as EXEC-BRIEF.md, including the full
search rule at the head of PLAN.md (file names only for any pattern that can hit case sets; never open
`eval/holdout-cases.json`, `eval/routing-qa-overlap.json`, `eval/discovery/`, `eval/agentic/` or
`test/fixtures/evidence-pack.mjs`).

1. `git revert --no-edit 92f71b8d` (commit I), then amend nothing; let the revert commit stand with a
   message body that says why (rule outcome exclude, RESULTS.md) and ends with the Sonnet co-author line.
   Check afterwards that `src/`, `scripts/`, `specs/`, `catalog/` and `eval/plan/` equal `cd4520bd`
   (`git diff --stat cd4520bd -- src scripts specs catalog eval/plan` is empty).
2. `.agents/TODO.md`, the routing-repair item ("Preserve structured routing intent…"):
   - The "Held by this item" RWA bullet keeps RWA excluded and adds, in plain words: a pre-registered
     answer A/B (round item 6.3, Sonnet 5.5, 10 pairs, blind Opus judge, 2026-11-17) returned exclude on one
     clause: one attributable drop on a mixed-intent control (INCLUDED partial against EXCLUDED correct with a
     registry call); no wrong registry call, no bad answer, no loss on the displacement or registry questions,
     and no registry call on the three off-target questions. Link `rounds/2026-11-16-next-phase/items/6.3/RESULTS.md`.
     Say the A/B is not re-run on routine drift; a re-test needs an owner or orchestrator decision (for
     example more samples per control pair).
   - Check 8 keeps its rank wording. Add one sentence after it: the proposed answer-level form ("the target
     stays rank 1 and answers do not degrade") was tested in round item 6.3 and not adopted, because the
     pre-registered rule returned exclude.
   - The `it.fails` bullet stays.
   Do not touch other TODO items. Keep the TODO's style (short sentences, no dates in skill text; dates are
   fine in TODO).
3. Step 7: commit EXEC.md (complete it: phase 2 actions and each gate's short output summary),
   RESULTS.md, verdicts.json, PHASE2-BRIEF.md, plus the TODO edit, in one records commit.
4. Gates on the final tree, each run bare, stdout of the routing gate to `tmp/6.3/`:
   `npm run typecheck`, `npm test`, `npm run build`, `npm run eval:routing -- --gate`,
   `npm run eval:selftest`, `npm run secrets:scan -- --tree`. All must pass; report any failure with its
   output summary rather than hiding it.
5. Do not push. Report with `hc send t1w3 '/home/tyler/code/raven-wt/np-6.3/.agents/rounds/2026-11-16-next-phase/items/6.3/EXEC.md'`
   and wait.
