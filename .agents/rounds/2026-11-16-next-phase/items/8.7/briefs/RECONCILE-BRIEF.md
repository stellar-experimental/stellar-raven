# Item 8.7 reconcile brief (Claude Sonnet)

Apply every finding of the Codex review to branch `np/8.7-playground-billing` in
`/home/tyler/code/raven-wt/np-8.7`. No model call of any kind, no eval, no Gateway call, no push.

- Review: `.agents/rounds/2026-11-16-next-phase/items/8.7/CODEX-REVIEW.md` (read it in full; it cites
  the evidence). Plan: `PLAN.md`; your earlier record: `EXEC.md`, same folder.
- The lead's dispositions (binding):
  1. Adopt. In `eval/EVALS.md`, the routing row: a logged-ID question is answered first from a matching
     saved receipt or log (cite `research/gauntlets/2026-11-03-sweep-probe-summary.md`); live evidence
     needs E2 with `--models` and an authorized `--max-budget-usd`, comparing the observed IDs with the
     configured ID. Add the cost-settlement row (offline coverage; live settlement only inside an
     already authorized product run). In `eval/playground/README.md`, the gauntlet example carries
     `--max-budget-usd`, and the "other vendors are covered only by mocks" sentence is qualified with the
     dated live IDs from that summary.
  2. Adopt. The prompt row covers Playground-specific changes only (`DEMO_PREAMBLE`, caps, loop). Shared
     MCP text changes go to subscription QA first; add an E1 sample only when the changed shared text is
     about the constraint the Playground caps or overrides (call counts, step order, the search-evidence
     rule), or matched stored transcripts show the change moves actual top-level MCP `search`/`execute`
     calls per answer across a Playground cap (note that the plan report's `searchQueries` also counts
     searches nested inside `execute`). Point the run-evals skill row and bullet and the DECISIONS.md
     outcome at this rule (skill text stays timeless and never contains the chat route string).
  3. Adopt as wording. State that the E2 default verifies isolated per-model requests on the configured
     test Gateway (`stellar-raven-demo`), with slug-only overrides. For a tuple change, run the offline
     request-equivalence tests and pin `--openai-api-mode` and `--reasoning-effort` where the shipped
     tuple's mode or effort differs from the per-model default. A Gateway ID or Gateway-setting change
     cannot be verified by E2 as it stands: say so, drop it from the smoke trigger list, and point at the
     post-deploy Gateway log read (`cloudflare-observability-review`). Do not change harness code.
  4. Adopt. A plan-only Playground question uses stored matched traces where possible, else E1 with
     `--no-judge` plus `npm run eval:plan`; the judge runs only when the decision needs answer grades.
  5. Adopt. Gauntlet header: attribute the 2026-08-06 matrix correctly (check
     `git show face6a28:scripts/run-demo-model-gauntlet.mjs`), cite the November evidence for
     `gpt-6.1-terra` (2026-11-03 probe, 2026-11-10 8/8), and name both Haiku denominators with their
     criteria (16/16 on the five required promotion fields; 14/16 on the broader diagnostic with two
     missed expected search calls).
  6. Adopt the cheap form: rename and comment the test as a drift check (it catches the old list or a
     reversed pair; a literal copy of the current IDs passes until the next tuple change). No harness
     rewrite.
  7. Adopt. Fix the accounting sentence in `eval/playground/README.md` (around line 87) to name the two
     paths the shipped tuple uses (OpenAI Responses for the primary, the Anthropic run path for the
     fallback) and the shared ledger.
- Keep the docs short and in the surrounding style. If any change contradicts the code, stop and say so
  in your record instead of guessing.

Then: gates, each bare: `npm run typecheck`, `npm test`, `npm run build`, `npm run eval:selftest`,
`npm run secrets:scan -- --tree`; `git diff origin/main -- src/ package.json package-lock.json
wrangler.jsonc` empty. Commit with the normal hooks (never `--no-verify`), message ending
`Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>` (your exact model name). Write
`.agents/rounds/2026-11-16-next-phase/items/8.7/RECONCILE.md`: per finding what changed (file:line),
gate summaries, deviations. Commit it too.

Search rule: search with `rg --hidden -g '!.git' <pattern> [path]`. Never use `grep -r`, `git grep`,
`rg -u` or `--no-ignore`, an `rg -g` glob that matches a case file, or a shell glob over `eval/` or
`.agents/rounds/`. Never open a QA case file (`eval/qa/corpus/`, `cases.json`, `sample.json`,
`tool-cases.json`, eval/qa `results/` or `reviewed/`). Do not edit `AGENTS.md` or the round ledger.
