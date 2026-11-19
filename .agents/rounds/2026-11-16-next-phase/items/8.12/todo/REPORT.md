# Item 8.12 lane `todo` — Report

- **PR:** https://github.com/stellar-experimental/stellar-raven/pull/513
- **Branch:** `np/8.12-todo`
- **Merge window:** Must merge before `2026-11-23 18:00 UTC` (dated run 2.1 reads `.agents/TODO.md` from `origin/main`).
- **Worker bytes changed:** No (`git diff origin/main -- src/ package.json package-lock.json wrangler.jsonc` is empty).
- **Model-facing:** No (records-only change to `.agents/TODO.md` plus lane records in `.agents/rounds/2026-11-16-next-phase/items/8.12/todo/`). No deploy needed.
- **TODO item closed:** Deleted `"Wait for a picomatch release that fixes GHSA-fc5q-39xc-vjpf"` in `.agents/TODO.md` (`GHSA-fc5q-39xc-vjpf` withdrawn `2026-11-18T15:38:56Z`; `npm audit` reports 0 vulnerabilities; dependency-audit workflow closed #481 on `2026-11-19T06:45:02Z`). The lane assignment itself (item 8.12 `todo`, correcting `.agents/TODO.md`) had no separate TODO queue entry.

## What changed

Edited `.agents/TODO.md` only (plus `SOL-REVIEW.md`, `CHALLENGE.md`, and `REPORT.md` in this item folder):

1. **Priorities point 2 (`2026-11-25` Mac Workers Logs session):** Added `"Read the \`skill_read\` shape distribution"`, matching its item text (`Next: take it in the next Workers Logs session (priority 2 above)`).
2. **Owner decision 6 (30-day observability retention):** Added numbered decision 6 in `## Owner decisions` (restoring the blank line before `Owner-blocked actions`), linked it from `"Keep 30 days of observability data, including queries and responses"`, cited `"Your choices"` alongside `"Operational and quality logs"` in `src/site.ts`, quoted the published `/terms` duration accurately (`"which may include the queries submitted and the responses returned"` / `"for 30 days, after which it is deleted"`, treated by the owner as a 30-day allowance; production keeps at most 7 days in Workers Logs and AI Gateway request metadata on its row-count policy, with no query text logged), scoped the item's `Done when` to the Raven-controlled archive so it does not contradict Cloudflare's `<=7`-day platform limit, and aligned the wording in `"Obtain a written exception for the accepted two-tool endpoint"`.
3. **Holdout gate bounds (`eval/gates.json`):** Updated the `#223` bullet in `"Preserve structured routing intent across extraction caps and gate tiers"` to state all three holdout limits currently sitting at their bounds (`top1` at floor `12`, `top3` at floor `26` since round item 6.2, `forbiddenCaptures` at ceiling `11` since round item 5.1; `top5` is `30` against floor `29`).
4. **Unstranded the seven free-next-step items:**
   - Added to **Priorities point 4** (free and startable): `"Run the overdue partner-documentation review"` (body left byte-identical per brief), `"Probe the malformed-input gap in the pinned smart-contracts skill"`, `"Fix Docs search misses on canonical pages"`, and `"Audit the two corpus guides no lane has read"`.
   - Marked **Held** with evidence-backed reasons and triggers:
     - `"Check what the judge saw before changing how it weighs cited text"` — 2% dispute rate occurred only on `fp-2026-11-12` prototype `retrieve`/`read` variants and in none of arm A (the measured `search` + `execute` baseline; arm B-fixed-2 shipped); no `retrieve`/`read` build is planned; pack/rubric changes belong to `p9`. Trigger: before revising `p9`/rubric, reviving a non-`execute` prototype, or if a cited-fact dispute appears on the committed QA judge.
     - `"Review the codegen-adjacent goldens by case id"` — reviewing existing cases for coverage gaps or stale pointers is not a maintenance-exception trigger (`eval/qa/README.md`, "Held-out split"), so opening any held-out/reserve case moves it to tuning and amends the split, and authoring new topics changes the battery. Trigger: next deliberate corpus-coverage revision.
     - `"Tag confirmation-only rows in the agent discovery runner and the agentic workflow"` — neither paid diagnostic (`run-agent-discovery.mjs`, `workflow-agentic-routing.js`) is scheduled, `classify-misses.mjs` limits stdout to `{ outPath, counts }` (while writing untagged `rows` to JSON), and both guides prescribe counts-only reporting. Trigger: before the next paid run of `run-agent-discovery.mjs` or the agentic workflow, or before inspecting per-row `classify-misses.mjs` output (unless the owner accepts the guide rule).
5. **External client limit trigger:** Removed the contradiction in `"Re-verify each external client limit before changing model-facing text"` (replaced `"and the re-check is due"` with `"but the re-check waits on the trigger below"`, matching `"A client version bump alone does not fire it"` and `test/helpers/mcp-tool-metadata.ts`).
6. **Confirmation-only imports:** Corrected `"Tag confirmation-only rows..."` to match `rg`: `eval/run-routing.mjs`, `eval/run-protocol-history.mjs` (and `eval/lib/protocol-history-report.mjs`), `eval/discovery/run-discovery.mjs`, and `eval/discovery/run-replay.mjs` already import `eval/lib/confirmation-only.mjs`; `eval/discovery/run-agent-discovery.mjs`, `eval/discovery/classify-misses.mjs`, and `eval/agentic/{workflow-agentic-routing.js,capture-proxy.mjs,reconcile-capture.mjs}` do not.
7. **Additional proven stale/resolved fixes:**
   - Deleted `"Wait for a picomatch release that fixes GHSA-fc5q-39xc-vjpf"` (advisory withdrawn `2026-11-18`, `npm audit` clean, `#481` closed `2026-11-19`); kept the `## Dependencies` frozen heading.
   - Rewrote the stale `Next:` steps in `"Point agents at the page when a docs hit has no body"` (`improvements/stellar-docs/sd-059-responsefield-text-unsearchable.md` shows the 2026-11-03 raw Discovery comparison already ruled out Raven's filter, site MCP fusion/replacement was tested and rejected on 2026-11-03, and tuning arm 1 shipped the page-read pointer in `#446`; the item waits on upstream `sd-059` / `stellar/stellar-docs#2995`).
   - Listed all three demo test files importing `workers-ai-provider` (`test/demo-model-config.test.ts`, `test/demo-chat.test.ts`, `test/demo-eval-cost.test.ts`) in `"Move the demo off the deprecated workers-ai-provider"`.

All frozen dated-run anchors (`## Held-out status`, `"Re-verify the event-tied goldens..."`, `"Close the register entries the dated runs leave open"` + `none recorded yet`, the `Software Versions (not filed)` bullet, `## Dependencies`, `"Re-verify each external client limit..."` heading) and the Freighter and partner-docs item bodies remain byte-identical to `origin/main`.

## Gates (post-reconciliation, all run bare)

| Gate | Exit code | Result |
|---|---:|---|
| Frozen anchors, relative links, heading cross-refs, `git diff --check` | 0 | 5 frozen sections + Software Versions bullet byte-identical to `origin/main`; all literals present; 94/94 relative links & anchors valid; 12/12 checked heading cross-references match |
| `npm run typecheck` | 0 | Clean |
| `npm test` | 0 | 173 test files passed, 5 skipped (178); 4,153 tests passed, 3 expected fail, 5 skipped (4,161) |
| `npm run build` | 0 | Clean (`wrangler deploy --dry-run --outdir dist`) |
| `npm run secrets:scan -- --tree` | 0 | Clean |

## Independent review and challenge

- **Review:** [SOL-REVIEW.md](SOL-REVIEW.md) — Codex CLI (`codex-cli 0.169.0`), resolved model `gpt-6.2-sol`, effort `high`, sandbox `read-only`, reviewing commit `57323598`. Reported 5 findings (M1–M3, L1–L2).
- **Challenge:** [CHALLENGE.md](CHALLENGE.md) — every finding independently verified against `src/site.ts`, `docs/operations.md`, `eval/discovery/classify-misses.mjs`, `eval/discovery/run-agent-discovery.mjs`, `eval/run-protocol-history.mjs`, `eval/lib/protocol-history-report.mjs`, and `research/audits/2026-11-12-first-principles-round.md`.
- **Verdict counts by class:**
  - **Valid:** 5 (M1, M2, M3, L1, L2) — all 5 fixed in `.agents/TODO.md`
  - **Invalid:** 0
  - **Valid but not worth fixing:** 0

## Model calls made

| CLI | Resolved model ID | Purpose |
|---|---|---|
| Antigravity | Gemini 4 Neon (High) | Lane `todo` execution, verification, Sol challenge, reconciliation, and reporting |
| Codex CLI (`0.169.0`, subscription) | `gpt-6.2-sol` (`high` effort, `read-only`) | Independent review of `git diff origin/main...HEAD` (`SOL-REVIEW.md`) |

No AI Gateway, Workers AI, or provider-API calls were made.

## Open questions

- `THIRD-PARTY-NOTICES.md:31-32` still reads `"Whether the forwarded metadata and source URLs satisfy each upstream license has not had counsel review. [The work queue](./.agents/TODO.md) tracks it."` That counsel-review decision was closed by the owner in PR #493 (`74d3aebf`), so the pointer to `.agents/TODO.md` is stale. Left untouched because lane `todo` is scoped to `.agents/TODO.md` and its item folder.
