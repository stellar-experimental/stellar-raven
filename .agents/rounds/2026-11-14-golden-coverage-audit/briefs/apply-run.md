# Brief: run the apply and make every gate pass

Lane `instrument`, second task. Read `coverage/POLISH.md` (sections Result, 7, and Method notes)
and `coverage/verify-coverage.json` first. Do not commit; the orchestrator commits.

1. `apply.mjs` now refuses the 36 new proposal files under `eval/qa/corpus/proposed/` (no audit
   record). Proposals whose `truth.origin` is "golden-coverage-audit 2026-11-14" are out of scope
   for the apply: skip them. Their leaves stay in `openSlots` until they activate. The six older
   proposals keep their audit verdicts.
2. Dry-run with `--todo-heading "Finish the 2026-11-14 golden coverage audit"` (the entry now
   exists in `.agents/TODO.md`). With `refusals=0`, run the apply for real in this worktree, then
   `npm run eval:qa:compile` and `npm run eval:qa:register`.
3. Tests that pin case content: keep `test/qa-judge-qpp-dormant.test.mjs`; remove
   `test/qa-golden-max-tx.test.mjs` and the archive-roster test in `test/qa-corpus-lint.test.mjs`
   (reasons in POLISH section 7). Give `test/qa-verdict-consistency.test.mjs` minimal fixtures
   under `test/fixtures/`. Re-pin `PROMPT_SHA256_FIXTURES` in `eval/qa/judge.mjs` to surviving
   cases (no paid call). Make `test/playground-final-orchestrator.test.mjs` read its frozen
   corpus snapshot.
4. Add `eval/qa/tool-cases.json` to the compile byte-compare list in `.github/workflows/ci.yml`.
   Fix case counts in prose (`README.md`, `eval/qa/README.md`, the register `$comment`, any other
   doc that states 501 or 499). Add one line to `.agents/skills/golden-truth/SKILL.md` section
   "Lifecycle": a new case names its taxonomy leaf in `truth.leaf`. Add the held-out split rule
   (DESIGN section 7) to `eval/qa/README.md`; do not draw the split.
5. If verify-coverage left the tool lane at six cases, keep the lane.
6. Run every gate bare and record command and exit code: `npm run typecheck`, `npm test`,
   `npm run build`, `npm run eval:qa:lint -- --stale --enforce-floors`,
   `npm run eval:qa:lint -- --since origin/main --stale`, `npm run eval:qa:register -- --check`,
   `npm run eval:selftest`, `npm run eval:compile`, `npm run eval:routing -- --gate`,
   `npm run eval:qa:sentinels -- --check`, `npm run secrets:scan -- --tree`. Fix what fails
   inside your write set (now also `.github/workflows/ci.yml`, `README.md`, and the skill line).
   Do not weaken a gate to pass it; report a failure you cannot fix honestly.
7. Do not close reopened register entries; list how many reopened.

Write `apply/RUN.md`: the final counts (headline, tool, retired, merged, open slots, words of
judge-facing text before and after across the headline), the gate table, files changed outside
the corpus, register entries reopened, and anything the orchestrator must decide. Send its path.
