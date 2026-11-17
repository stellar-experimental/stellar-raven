# Follow-up 1 for the item 3.2 executor

The lead's decision on your stop at E7: **this pull request ships A to D and F only.** Step E waits
on the orchestrator (QUESTION.md beside the plan). Do not re-baseline anything.

1. Preserve step E on a side branch, without losing anything:
   `git switch -c np/3.2-e-matchpartners`, `git add -A` (check first that `git status` shows only
   the step E files you listed, plus nothing ignored or under `tmp/`), commit as
   "WIP step E: remove scout.matchPartners (held: holdout forbidden-capture ceiling)" with your
   Co-Authored-By line, then `git switch np/3.2-per-source-status`. Confirm the item branch tree
   equals `8f6236db` plus nothing. Do not push the side branch.
2. Step F on the item branch, adjusted:
   - `ARCHITECTURE.md` and the observability skill field list as planned.
   - `.agents/TODO.md`: as planned, except "Triage the runtime and client gaps" keeps its
     `scout.matchPartners` bullet, rewritten to state: removing it from the exposed surface was
     built and measured on 2026-11-17; every legacy, extended and skills grade and total held, but
     the frozen holdout lane went from 10 to 11 forbidden captures (ceiling 10), so the removal is
     held for an orchestrator or owner decision on the holdout ceiling; the adapter's 503 hint
     already routes to `scout.getPartners`. Counts only for the holdout lane, no case ids. Keep the
     "Audit source coverage" pointer to it. Drop the narrower-skill-scrub TODO line (it belongs to
     step E). Keep the non-Error throw line.
   - Round ledger 3.1 row edit as planned. Do not add a 3.2 row; the lead does.
3. EXEC.md: keep the E7 table and its cause, add the split as a deviation, and update "State".
4. Run every gate in the plan bare on the item branch, except that the routing gate must pass
   unchanged (the manifest is untouched there). Commit F and EXEC.md. Report again.
