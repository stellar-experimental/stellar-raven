# Review brief: item 7.2 plan (RWA card caveat)

You are the Claude Fable plan reviewer for round item 7.2. Lead: Claude Opus 5.5, agentpc `t1wz`.
Worktree: `/home/tyler/code/raven-wt/np-7.2` (branch `np/7.2-rwa-caveat`, from `origin/main` `fdddbe26`).
You review; you do not edit the plan, commit, push, or run any model-calling command. No subagents.

## Read

- `AGENTS.md`.
- The plan under review: `.agents/rounds/2026-11-16-next-phase/items/7.2/PLAN.md`.
- Binding notes: `/home/tyler/code/raven-wt/orch/7-COMMON.md` and `/home/tyler/code/raven-wt/orch/7.2-NOTE.md`.
- Item 6.3's records in `.agents/rounds/2026-11-16-next-phase/items/6.3/`: PLAN.md (above all "Re-test:
  second measurement" and step 6a), RESULTS-2.md, REPORT.md, and the scripts `ab-run.mjs`, `blind.mjs`,
  `attribute.mjs` that this plan reuses unchanged.
- The code the plan cites: `scripts/catalog-data/card-caveats.mjs`, `src/mcp/tools.ts` (`compactCard`),
  `src/catalog/scoring.ts`, `src/catalog/vendor/search-scoring.ts`, `src/catalog/search.ts`,
  `scripts/build-catalog.mjs` (card caveats, `assertNoNonExposedRefs`), `src/policy/scout-exposure.ts`,
  `eval/gates.json`, `.agents/TODO.md` (routing-repair item, check 8), and commit `92f71b8d` (`git show`).
- Issue #167 (`gh issue view 167 --comments`).
- The `run-evals` skill.

## Check, against the repository

1. Is the caveat placement right: does any scorer, admission, rerank, or skill-search path read
   `cardCaveat` or the rendered card, so that "launch", "news" or "timeline" could move routing? Can you
   reproduce the routing table (free: `node scripts/build-catalog.mjs --out tmp/7.2-review/variant.json`
   after the same temporary source edits, then `node eval/run-routing.mjs --gate --manifest ...` with stdout
   to a file; restore the tree with `git checkout -- .` afterwards and confirm `git status` is clean)?
2. Is the caveat a general card fact and not a query or operation exception (#167's rule)? Is its wording
   likely to fix the D3 failure mode without pushing the client off the registry where it is the right
   source? Is the `card-caveats.mjs` header-rule amendment sound, or is there a better place?
3. Is reusing 6.3's scripts in place, unchanged, with every output path moved by flag, workable? Find any
   default path or hardcoded `tmp/6.3` or `items/6.3` value that a flag cannot move, and any check that
   would refuse the new run.
4. Is the decision rule truly 6.3 result 2's, unchanged, including the carried D1, D2 and D4 clauses?
   Is carrying those clauses (measured without the caveat) acceptable, or should the plan say otherwise
   within the 45-answer cap?
5. Pre-registration and arm integrity: linear P then C in one worktree; identity checks; dirty-tree
   refusal by `dev:eval`; where records live during the arms.
6. The include branch: does it cover the policy record, the data-source caveats, the Codex review, the
   routing re-baseline, the exposure config, tests and text? Does closing #167 under the TODO's updated
   check 8 match the 7.2 note? The exclude branch: is the recommendation and re-open trigger right?
7. Caps, stop rule, spend rules, search rule and anything else that breaks AGENTS.md or 7-COMMON.md.

Search rule (binding): search with `rg --hidden -g '!.git' <pattern> [path]`; the `.ignore` files keep it
out of the case-bearing paths. Never use `grep -r`, `git grep`, `rg -u` or `--no-ignore`, an `rg -g` glob
that matches a case file, or a shell glob over `eval/` or `.agents/rounds/`. Never open a QA case, QA
results or reviewed files; never run the QA lint; never pass `--rows` to `eval/run-routing.mjs`; never
open or print rows of `eval/routing-qa-overlap.json` or `eval/holdout-cases.json`.

## Output

Write `.agents/rounds/2026-11-16-next-phase/items/7.2/REVIEW.md`: numbered findings, each with a severity
(blocking, should-fix, nit), the evidence (file and line, or command and result), and a concrete fix. Say
plainly what you checked and found sound. Then report as the task line says.
