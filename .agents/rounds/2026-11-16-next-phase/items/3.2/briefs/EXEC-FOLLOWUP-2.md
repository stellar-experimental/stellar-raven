# Follow-up 2 for the item 3.2 executor

The orchestrator answered (QUESTION.md, "Orchestrator's answer"): keep `scout.matchPartners`
exposed. This refines follow-up 1, step 2. If you have already committed F, amend it in a new
commit; otherwise fold this in.

In `.agents/TODO.md`, "Triage the runtime and client gaps", the `scout.matchPartners` bullet
records, in plain prose:
- the decision: keep it exposed (orchestrator, 2026-11-17); the adapter's 503 hint routes to
  `scout.getPartners`;
- the measurement: removing it held every legacy, extended and skills grade and total, but moved
  the frozen holdout lane's forbidden captures from 10 to 11 (ceiling 10) through a lexical corpus
  shift, and dropped `scout.searchRepos` from a pinned top five in `test/search.test.ts`;
- the exact change to recreate it, as one line of code:
  `["POST /api/partners/match", "matchPartners"],` in `EXCLUDED_SCOUT_OPERATIONS`
  (`src/policy/scout-exposure.ts`), plus the normal rebuild and the test and eval edits listed in
  the item 3.2 EXEC.md;
- when to revisit: the upstream answers again, or a catalog change leaves holdout headroom.

Do not touch `eval/gates.json` or `test/search.test.ts`. Leave the side branch as it is; the lead
deletes it at cleanup. Report as before.
