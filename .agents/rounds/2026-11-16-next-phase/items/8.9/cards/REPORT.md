# Report: item 8.9, lane `cards` (`<noun>_detail` card binding)

- **Branch / PR:** `np/8.9-cards` — https://github.com/stellar-experimental/stellar-raven/pull/503
- **TODO item closed:** "Bind the `scout_hackathon_detail` card to its operation" (`.agents/TODO.md`; not edited by this lane per `8.9-COMMON.md`)
- **Worker bytes changed:** **No** (`git diff origin/main -- src/ package.json package-lock.json wrangler.jsonc` is empty).

## What changed

- [`eval/lib/grade.mjs`](../../../../../../eval/lib/grade.mjs):
  - Added rule 4 to `cardMatches`: a same-service `<noun>_detail` card (with alphanumeric/underscore stem) matches a `get_<noun>` or `get<noun>` operation by name (`hitOp === "get_" + noun || hitOp === "get" + noun.replace(/_/g, "")`). This generally binds both previously unbound catalog-service cards in the compiled routing corpus (`scout_hackathon_detail` -> `scout.getHackathon` and `scout_skill_detail` -> `scout.getSkill`) without matching plural list or comparison endpoints (`scout.getHackathons`, `scout.compareHackathons`, `scout.listSkills`). `cardMatchesExact` (used by holdout) is unchanged.
  - Added `isExternalServiceCard` (`perplexity_`, `parallel_`), `classifyCardBinding`, and `findUnboundRoutingCards` helpers. Failure records report only `{ lane, caseIndex, cardIndex, reason }` (`"unbound"`, `"no-catalog-card"`, or `"no-cards"`) — never a case ID, question, or card label.
- [`eval/self-test.mjs`](../../../../../../eval/self-test.mjs):
  - Added unit checks for rule 4 covering `scout_hackathon_detail`, `stellar_light_hackathon_detail`, `scout_skill_detail`, `scout_repo_trust_detail`, `lumenloop_project_detail`, plural/collection rejection, cross-service rejection, malformed stem rejection (`scout_detail`, `scout__detail`, `scout_foo__detail`), and `cardMatchesExact` staying strict.
- [`test/routing-card-binding.test.mjs`](../../../../../../test/routing-card-binding.test.mjs):
  - New Vitest suite testing `classifyCardBinding` and `findUnboundRoutingCards` (including failure on unbound ops, typo'd prefixes, missing services, unsearchable entries, external-only cases, and missing/empty `expected_cards` lists, with a synthetic private marker asserting zero leakage).
  - Asserts against committed `catalog/manifest.json` that `scout_hackathon_detail` binds solely to `scout.getHackathon`, `scout_skill_detail` binds solely to `scout.getSkill`, and every card in `eval/routing-cases.json` (legacy 338 + extended 122) and `eval/skills-cases.json` (23) binds to a searchable catalog operation or service (holdout exact-card binding is already guarded on every `eval:routing -- --gate` run in `eval/run-routing.mjs`).
- [`eval/README.md`](../../../../../../eval/README.md):
  - Documented rule 4 under "Card-name normalizer".
- [`eval/gates.json`](../../../../../../eval/gates.json):
  - Recorded the legacy `cardHit5` movement (`113 -> 114` of `182`) through the accepted-evidence process: updated `baselinedAt`, `evidence.acceptedTotals.legacy.cardHit5`, `evidence.localTrace`, and prepended the decision and review note to `evidence.notes`. All four input SHA-256 fingerprints and all gate thresholds remain unchanged.
- [`.agents/rounds/2026-11-16-next-phase/items/8.9/cards/REVIEW.md`](REVIEW.md):
  - Committed independent review artifact.

## Routing gate: before vs. after (aggregates only)

No per-row output for any row listed in `eval/routing-qa-overlap.json` was printed or inspected.

| Lane / scope | Before (`origin/main`) | After (`np/8.9-cards`) | Delta |
|---|---|---|---|
| Legacy OVERALL (338) | top-1 64.8% (219), top-3 86.7% (293), top-5 96.4% (326), **card@5 62.1% (113/182)** | top-1 64.8% (219), top-3 86.7% (293), top-5 96.4% (326), **card@5 62.6% (114/182)** | **cardHit5 +1** (0 losses) |
| Legacy `scout` (95) | top-1 50.5%, top-3 81.1%, top-5 93.7%, **card@5 70.5% (67/95)** | top-1 50.5%, top-3 81.1%, top-5 93.7%, **card@5 71.6% (68/95)** | **cardHit5 +1** |
| Legacy `lumenloop` (60) | top-1 21.7%, top-3 66.7%, top-5 93.3%, card@5 46.7% (60) | unchanged | 0 |
| Legacy `stellarDocs` (183) | top-1 86.3%, top-3 96.2%, top-5 98.9%, card@5 66.7% (27) | unchanged | 0 |
| Legacy accept-either | top-1 75.7%, top-3 94.7%, top-5 99.7% | unchanged | 0 |
| Extended OVERALL (122) | top-1 76.2%, top-3 91.8%, top-5 95.9%, card@5 57.1% (16/28) | unchanged | 0 |
| Skills OVERALL (23) | top-1 73.9% (17), top-3 100.0% (23), top-5 100.0% (23), card@5 100.0% (23/23) | unchanged | 0 |
| Holdout OVERALL (49) | top-1 24.5% (12), top-3 53.1% (26), top-5 61.2% (30), card@5 61.2% (30/49), forbidden 11/49 | unchanged | 0 |
| Protocol-history v1 (8+4) | top-1 6/8, top-3 7/8, top-5 7/8, control captures 3/4 (diagnostic FAIL) | unchanged | 0 |
| Gate verdict | GATE PASS | GATE PASS | — |

Per-lane diff count between before and after: 1 row changed in legacy (`q-tool-skill-detail-install`, non-confirmation-only, `cardHit5: false -> true`), 0 confirmation-only rows changed, 0 losses, and 0 rows changed in extended, skills, holdout, or protocol-history.

## Gates (all run bare after final edits)

| Command | Exit | Result |
|---|---|---|
| `npm run typecheck` | 0 | Clean (`tsc --noEmit`) |
| `npm test` | 0 | 178 passed, 5 skipped (183 files); 4,300 passed, 3 expected fail, 5 skipped (4,308 tests); 37.43s |
| `npx vitest run test/routing-card-binding.test.mjs` | 0 | 4/4 passed (1 file, 152ms) |
| `npm run build` | 0 | Clean dry-run Worker bundle (6918.57 KiB / gzip 1375.14 KiB) |
| `npm run eval:selftest` | 0 | 38/38 checks passed |
| `npm run eval:routing -- --gate` | 0 | GATE PASS (aggregates match table above; committed evidence verified) |
| `npm run eval:qa:lint -- --stale --enforce-floors` | 0 | 0 errors, 98 warnings |
| `npm run eval:qa:register -- --check` | 0 | Up to date |
| `npm run secrets:scan -- --tree` | 0 | Clean across all tracked files |

(Note on initial pre-review run: `npm test` timed out once on unrelated `test/qa-paired-verdict.test.mjs:1293` under 8-lane CPU contention; solo `npx vitest run test/qa-paired-verdict.test.mjs` passed 138/138 in 5.86s, and the final full `npm test` run after review fixes passed 178/178 active files with exit 0.)

## Independent review and reconciliation

- **Reviewer:** Claude Opus 5.5 (`agy --model claude-opus-5-5 --effort high`), read-only review of `git diff origin/main...HEAD` (`ac2a043d`).
- **Artifact:** [`.agents/rounds/2026-11-16-next-phase/items/8.9/cards/REVIEW.md`](REVIEW.md).
- **Verdict:** **PASS WITH FINDINGS** (0 Critical, 0 High, 0 Medium, 3 Low, 5 Notes).

| Finding | Severity | Disposition | Action taken |
|---|---|---|---|
| L1: "single-resource" overstates name-based rule 4 | Low | **Accepted** | Reworded `eval/lib/grade.mjs`, `eval/README.md`, and `eval/gates.json` to describe rule 4 accurately as a name-based `<noun>_detail` -> `get_<noun>` / `get<noun>` match. |
| L2: Holdout block in `test/routing-card-binding.test.mjs` duplicates `eval/run-routing.mjs` | Low | **Accepted** | Removed the duplicated holdout block and unused `cardMatchesExact` import from `test/routing-card-binding.test.mjs`, leaving a comment naming `eval/run-routing.mjs` as the existing guard, and updated `eval/gates.json` note. |
| L3: `findUnboundRoutingCards` silently skips missing/empty `expected_cards` | Low | **Accepted** | Changed `findUnboundRoutingCards` to emit `{ lane, caseIndex, cardIndex: null, reason: "no-cards" }` for missing, non-array, or empty `expected_cards`, and added synthetic unit coverage in `test/routing-card-binding.test.mjs`. |
| N1: Substring tolerance from rule 3 / non-uniqueness outside holdout | Note | Acknowledged | Pre-existing `cardMatches` semantics; out of scope for this item. |
| N2: Report link in `gates.json` and round-ledger entry | Note | **Addressed** | `REPORT.md` and `REVIEW.md` are committed in this PR; round-ledger update is flagged for the orchestrator below. |
| N3: `acceptedTotals.cardHit5` not machine-checked | Note | Acknowledged | Pre-existing; out of scope. |
| N4: External prefix list in three places | Note | Acknowledged | Fails loud in the safe direction if a new external prefix appears. |
| N5: Duplicate filtering of searchable entries in `findUnboundRoutingCards` | Note | **Accepted** | Extracted `searchableEntriesOf` and `classifyCardBindingInSearchable` in `eval/lib/grade.mjs` so `entries` is filtered once per `findUnboundRoutingCards` call. |

## Model calls made

| CLI | Model ID | Effort | Purpose |
|---|---|---|---|
| `agy` (Antigravity CLI) | Gemini 4 Neon (lane session) | high | Implementation, gate execution, review reconciliation, report |
| `agy` (Antigravity CLI) | `claude-opus-5-5` | high | Independent read-only code review (`REVIEW.md`) |

No AI Gateway, Workers AI, or provider-API calls were made; all routing and test checks are offline and free.

## Open questions / orchestrator handoff

- None blocking merge. When merging PR #503, the orchestrator should:
  1. Remove the closed TODO item ("Bind the `scout_hackathon_detail` card to its operation") from `.agents/TODO.md`.
  2. Record the `eval/gates.json` accepted-evidence update (`legacy.cardHit5` 113 -> 114 of 182) in the round ledger (`.agents/rounds/2026-11-16-next-phase.md`), per `eval/gates.json` `$comment` (REVIEW.md N2).
- No deploy is required from this PR (zero Worker byte changes).
