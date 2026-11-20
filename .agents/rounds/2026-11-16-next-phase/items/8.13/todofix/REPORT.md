# Item 8.13 lane `todofix` — Report

- **PR:** https://github.com/stellar-experimental/stellar-raven/pull/522
- **Branch:** `np/8.13-todofix`
- **Merge window:** Must merge before `2026-11-23 18:00 UTC` (dated run 2.1 reads `.agents/TODO.md` from `origin/main`).
- **Worker bytes changed:** No (`git diff origin/main -- src/ package.json package-lock.json wrangler.jsonc` is empty).
- **Model-facing:** No (records-only edits to `.agents/TODO.md` and `ideas/README.md`, plus lane records in `.agents/rounds/2026-11-16-next-phase/items/8.13/todofix/`). No deploy needed.
- **TODO item closed:** Folded standalone `"Audit the two corpus guides no lane has read"` into `"Close the register entries the dated runs leave open"` (as a separate post-2.2c session/PR) and removed it from Priorities point 4. The lane assignment itself (item 8.13 `todofix`) had no separate TODO queue entry.

## What changed

Edited `.agents/TODO.md` and `ideas/README.md` (plus `SOL-REVIEW.md`, `CHALLENGE.md`, and `REPORT.md` in this item folder):

1. **`ideas/README.md` observability index (`ideas/README.md:7`):** Changed `Work queue item` for `observability-r2-retention.md` from `None` to `"Keep 30 days of observability data, including queries and responses"`.
2. **Renamed `sd-059` heading (`.agents/TODO.md`):** Renamed `"Point agents at the page when a docs hit has no body"` to `"Recheck \`sd-059\` after upstream action on Mintlify Discovery search"` (the page-read pointer shipped in `#446`; only the upstream `sd-059` recheck remains). Confirmed via `rg` that zero living documents outside retained dated `.agents/rounds/` ledgers reference the old heading.
3. **Unstranded nine TODO items lacking both a trigger and a Priorities line (`.agents/TODO.md`):** Added evidence-backed `Held:` reasons and concrete release `Trigger:` conditions to all nine items (none deleted because each preserves an unmeasured caveat, known design risk, or standing hold):
   - `"Carry the guard to absence-of-standard statements"`
   - `"Test the \`stellarOrg\` result rule for the corroboration guard"`
   - `"Resolve held source ownership and bounty policy"`
   - `"Stop identity substitution on spelling-corrected matches"`
   - `"Revisit general directory admission after the rejected D3 experiment"`
   - `"Clarify the model-facing \`codemode.describe\` response shape"`
   - `"Fix the \`getChangelog\` ranking trap for release questions"`
   - `"Decide whether a sourced summary error matches must-avoid \"unsupported memory\""`
   - `"Reconcile the QA answering prompt with out-of-scope goldens"`
4. **Reconciled `"Fix the \`getChangelog\` ranking trap for release questions"` with Owner decision 2 (`.agents/TODO.md`):** Left Owner decision 2's text byte-identical; clarified in the item that `"proceeds either way"` means the trap is independent of decision 2's source choice, while holding the trap on no measured demand in round item 3.1 (few first-place `scout.getChangelog` searches overall, upper bound only because query text is not logged), the held general routing repair, and zero holdout headroom in `eval/gates.json` (`top1` 12, `top3` 26, `forbiddenCaptures` 11).
5. **Updated `"Method note: same-surface verdict noise, and the judge-tier cap"` (`.agents/TODO.md`):** Named what is already enforced (`eval/qa/paired-verdict.mjs` `comparisonProblems` refuses mismatched tiering tuples across cross-revision runs and requires 100+ eligible rows for a statistical verdict; `eval/qa/run-qa.mjs --judge-stored` refuses mixed `--max-panel-cases`), and scoped what remains to sub-100 comparison paths (`heldout-read.mjs`, `compare-architecture-ab.mjs`) enforcing the full `tieringTuple` (plus moving standing noise rules to `eval/EVALS.md`) or a same-surface repeat of a full panel (50+ rows, distinct from the 17-row identifier trial R in tuning loop 2) at one fixed tiering tuple on the current surface.
6. **Folded `"Audit the two corpus guides no lane has read"` into `"Close the register entries the dated runs leave open"` (`.agents/TODO.md`):** Removed the standalone item and its Priorities point 4 entry; folded it into `"Close the register entries the dated runs leave open"` as a separate post-2.2c session and PR (respecting the maintenance exception's `"its sessions do no other work"` rule in `eval/qa/README.md`, and running even if the dated runs leave zero open register entries). Neither guide (`eval/qa/corpus/README.md`, `eval/corpus/PROVENANCE.md`) was opened. No pre-committed post-2.2c brief file exists in the repository.
7. **Updated `sls-116` handoff status (`.agents/TODO.md`):** Changed `(stellarlight#1952, inbound handoff #427)` to `(stellarlight#1952; inbound handoff #427 closed 2026-11-19, round item 8.12b)`.

All frozen dated-run anchors (`## Held-out status`, `"Re-verify the event-tied goldens..."`, `"Close the register entries the dated runs leave open"` heading and first paragraph including `none recorded yet`, the `Software Versions (not filed)` bullet, `## Dependencies`, `"Re-verify each external client limit..."`), Owner decision 2, and the two Priority 4 items owned by lanes `skmalformed` and `docsprobe` remain byte-identical to `origin/main`.

## Gates (post-reconciliation, all run bare)

| Gate | Exit code | Result |
|---|---:|---|
| Frozen anchors, relative links, `ideas/README.md` heading cross-refs, `git diff --check` | 0 | 5 frozen sections + Software Versions + Register heading/first paragraph (`none recorded yet`) + `## Dependencies` + Owner decision 2 byte-identical; 92/92 `.agents/TODO.md` links & anchors valid; 11/11 `ideas/README.md` links valid; 3/3 `ideas/README.md` TODO headings match |
| `npm run typecheck` | 0 | Clean |
| `npm test` | 0 | 174 test files passed, 5 skipped (179); 4,165 tests passed, 3 expected fail, 5 skipped (4,173) |
| `npm run build` | 0 | Clean (`wrangler deploy --dry-run --outdir dist`) |
| `npm run secrets:scan -- --tree` | 0 | Clean |

## Independent review and challenge

- **Review:** [SOL-REVIEW.md](SOL-REVIEW.md) — Codex CLI (`codex-cli 0.169.0`), resolved model `gpt-6.2-sol`, effort `high`, sandbox `read-only`, reviewing commit `51697682`. Reported 5 findings (3 Medium, 2 Low).
- **Challenge:** [CHALLENGE.md](CHALLENGE.md) — every finding independently verified against `eval/qa/README.md`, `eval/qa/paired-verdict.mjs`, `eval/qa/heldout-read.mjs`, `.agents/rounds/2026-11-15-tuning-loop-2.md`, `.agents/rounds/2026-11-02-mintlify-migration.md`, `.agents/rounds/2026-11-16-next-phase/items/3.1/EXEC.md`, `.agents/README.md`, and `8.13-LANES.md`.
- **Verdict counts by class:**
  - **Valid:** 4 (Findings 1, 2, 3, 5) — all 4 fixed in `.agents/TODO.md`
  - **Invalid:** 1 (Finding 4 — `.agents/rounds/2026-11-02-mintlify-migration.md` is a retained dated ledger outside lane `todofix`'s write set and protected from historical rewriting by `.agents/README.md`)
  - **Valid but not worth fixing:** 0

## Model calls made

| CLI | Resolved model ID | Purpose |
|---|---|---|
| Antigravity | Gemini 4 Neon (High) | Lane `todofix` execution, verification, Sol challenge, reconciliation, and reporting |
| Codex CLI (`0.169.0`, subscription) | `gpt-6.2-sol` (`high` effort, `read-only`) | Independent review of `git diff origin/main...HEAD` (`SOL-REVIEW.md`) |

No AI Gateway, Workers AI, or provider-API calls were made.

## Open questions

None. (Note: no separate post-2.2c register-maintenance brief file is committed yet, so the folded corpus-guide audit instructions live in `"Close the register entries the dated runs leave open"` in `.agents/TODO.md` for when that brief is drafted.)
