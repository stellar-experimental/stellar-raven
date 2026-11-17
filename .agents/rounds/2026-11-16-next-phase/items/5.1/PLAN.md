# Item 5.1 plan: remove `scout.matchPartners`

Lead: Claude Opus 5.5, agentpc `t1tm`, 2026-11-17. Worktree `/home/tyler/code/raven-wt/np-5.1`,
branch `np/5.1-remove-matchpartners` from `origin/main` `9b1a483b`. The item is defined by the
orchestrator note `/home/tyler/code/raven-wt/orch/5.1-NOTE.md`, which binds over ITEM-LEAD.md.
Evidence: `/home/tyler/code/raven-wt/orch/EVAL-FABLE.md`, items B and G. This plan is reconciled
with the Fable review ([REVIEW.md](REVIEW.md)); see "Review reconciliation" at the end.

## Decision this changes

`scout.matchPartners` leaves the exposed surface. No observed call has succeeded since 2026-10-26:

| Date | What the endpoint returned |
|---|---|
| 2026-10-26 | "AI not configured" |
| 2026-11-02 | HTTP 502 (the resolved `sls-097`) |
| 2026-11-17 01:29Z | 503 `unavailable: true`, through Raven (item 1.3) |
| 2026-11-17 14:04:50Z | 503, direct, Scout 1.9.150 |

This one sentence is used everywhere the history is stated.

Removing the operation spends one holdout forbidden capture (ceiling 10 to 11). The owner
authorized this re-baseline for this removal only:

> "isolated rare events likely don't constitute making everything call and experience worse, more
> expensive, etc."

The Scout fix, verified live, is the trigger to re-expose the operation. Re-exposing it restores
the ceiling to 10.

## Facts re-checked on `9b1a483b`

- **Manifest.** 286 entries, 62 operations, 30 Scout. After the removal, expect 285, 61 and 29.
  Scout exclusions go from 12 to 13.
- **`eval/gates.json`.** Holdout `forbiddenCaptures` 10, `passed` 25, `maxForbiddenCaptures` 10.
  `holdoutNote` says "ceiling to 10".
- **Code pins.** `src/mcp/tools.ts:485` and `:488` hold the two "inspect or retry" strings; nothing
  else pins them. `test/search.test.ts:631` asserts two Scout hits.
- **`b4a74b8f`** (`np/5.1-base`, the 3.2 step-E WIP) is a checklist only. Since its parent, `main`
  has also changed:
  - family-text naming in `scripts/`;
  - `eval/lib/gate-evidence.mjs`;
  - `src/policy/identifier-token.ts`.

  So 3.2's routing numbers may not reproduce exactly. The stop rules cover that.
- **QA battery.** Exactly one case lists `scout.matchPartners` in `surface`. The lead saw part of it
  by accident (QUESTION.md). It is outside tuning in split v7. The orchestrator answered option (a):
  move it to tuning by script in split v8 in this PR. Its id appears in no prose (plan, EXEC,
  report, ledger, messages, amendment note). It is only in the untracked `tmp/5.1/EXPOSURE.md`.
  - After C2, the case file's path, its `cases.json` diff and the register necessarily name it.
    That is acceptable because v8 comes first.
  - The lead's count-only script on `eval/qa/cases.json` (2026-11-17) found:
    - 1 case with the id in `surface`, and it is the exposure-note case;
    - 0 cases whose other fields match `matchPartners`, `match_partners` or `/api/partners/match`;
    - after the edit, the case's `surface` keeps 3 ids.
  - The question the lead saw asks which projects are anchors. It does not need the operation to be
    callable.
- **The reviewer's incidental read.** The case named at `sls097-author.md:80` is not a current
  battery case (lead script, booleans only), so it is not a second case for the amendment.
- **Upstream dedupe.** No active `sls-` finding covers the failure. Stellar-Light/stellarlight
  #1908 (closed; the 502 documentation, resolved `sls-097`) is related. A search for "partners
  match", "matchmaking" and "AI not configured" finds no open issue. The next free id is `sls-123`.
- **Served-skill side effect** (3.2 REVIEW finding 10). `src/skills/scrub.ts` scrubs served skill
  bodies from the same exclusion list. The `stellar-scout` skill loses:
  - `SKILL.md` workflow step 4 whole: the partner-directory filters, the stablecoin peg guidance,
    and the "none listed at our source" rule;
  - one sentence of the `getPartner` paragraph;
  - the match section of the API reference.

  `test/skill-scrub.test.ts` proves that no reference survives. This item does not narrow the
  scrub. A TODO line records the narrower scrub unit, and REPORT.md tells the orchestrator before
  the merge.

## Steps and commits (in this order)

### C1. Split v8, a dated amendment

1. Add `items/5.1/amend-split-v8.mjs`, modelled on `items/3.5/amend-split-v7.mjs`. It:
   - verifies the v7 SHA-256 `d5e56748dfdf2ce9c0bcf8a48898f976db96578dd97516d07dd0b3cb13966c8a`
     and the counts 88/112/47 (`countsBefore`);
   - reads `tmp/5.1/EXPOSURE.md` and requires exactly one non-tuning v7 id;
   - moves it with `moveToTuning`;
   - writes `~/backups/gca-2026-11-14-split-v8.json` (`wx`, mode 600);
   - prints counts, the `reverifyBy` count and earliest date, and the SHA-256, never an id;
   - has an amendment note that names neither the id nor the source set.
2. Run a dry run, then the real run. The two hashes must match.
3. `eval/qa/tuning-rows.mjs`: `TUNING_ROW_COUNT` 89. Nothing else asserts the count.
4. Move the v7 pins to v8 and its SHA-256:
   - `.agents/TODO.md:45-53` (held-out status: v8, counts, `reverifyBy` count);
   - `items/1.4/dated/2.1-LEAD.md`, `2.2a-LEAD.md`, `2.2b-LEAD.md`, `2.2c-LEAD.md`;
   - `PRESTAGE.md:10,96`.

   Leave the 3.5 and 4.1 records alone.
5. Run `sibling-check.mjs` on v8 with stdout redirected to `tmp/5.1/`, and read its last line only.
   On v7 it gave 2.1: 0, 2.2a: 0, 2.2c: 1. If any value changes, record it and tell the lead.
6. `items/5.1/FOLLOWUP.md`: the provenance, the orchestrator's answer, and the v8 path, counts and
   SHA-256.

### C2. QA case surface edit

1. Read the moved case in full. It is tuning now.
2. Stop and report to the lead if either holds:
   - any field other than `surface` names the operation, in any spelling;
   - the golden depends on the operation being callable, for example a "call it, see it fail, fall
     back" scenario.

   Either one makes this a `golden-truth` change, not this edit.
3. Otherwise remove `"scout.matchPartners"` from `surface` only, and run `npm run eval:qa:compile`.
4. Register (item 3.2 E6.4 procedure):
   - `npm run eval:qa:register`;
   - for each reopened entry, `npm run eval:qa:register -- --review <file>` with the previous
     verdict, `clearReopened: true`, and a `reSwept` reason: "surface-only edit: removed a
     non-exposed operation; no judge-facing field moved";
   - `npm run eval:qa:register -- --check`.

The operation is still exposed at this commit, so QA lint passes.

### C3. Scout finding, filed first

1. Write `improvements/stellar-light-scout/sls-123-<slug>.md` per `improvements-pipeline`:
   - status `verified`;
   - the dated, reproducible observations in the Decision table, with the exact POST command and
     body;
   - link #1908 as related;
   - no production counts, and no "production reads" wording.
2. The first paragraph says that the 503 `unavailable` contract is correct and the hosted
   deployment is the defect: the published operation carries routing hints, and no observed call
   has worked for three weeks.
3. The recommendation:
   - restore the hosted AI path, and check both documented causes of `unavailable` (no model is
     configured, or the provider refuses the request or account);
   - optionally, report the AI path's state in `GET /api/status`, so a client can skip the
     operation.

   Do not ask to remove the operation from the OpenAPI.
4. Commit and push the item branch (`git push -u origin np/5.1-remove-matchpartners`), so the
   snapshot link resolves.
5. Run `npm run improvements:file -- --file … --dry-run`. Read it as the maintainer, and fix it
   before posting, not after.
6. Run the real filing to Stellar-Light/stellarlight: an issue only, under decision 4. Read the
   issue back with `gh`.
7. Commit the script's rewrite of the finding and the index. Run
   `npm run improvements:lint -- --live`.

### C4. Remove the operation and re-baseline

1. **Exclusion.** Add `["POST /api/partners/match", "matchPartners"],` to
   `EXCLUDED_SCOUT_OPERATIONS` in `src/policy/scout-exposure.ts`. Its comment gives the dated
   history sentence, the `sls-123` issue URL, and "re-expose when the issue's POST returns 200 with
   `matches`".
2. **Ride-alongs from `b4a74b8f` that still apply.**
   - the `scripts/exposure.mjs` comment;
   - the `scripts/build-catalog.mjs` example token, which becomes `scout.getPartners`;
   - drop the `matchPartners` scrub from `scripts/description-notes.mjs`.
3. **Rebuild in CI order** (`.github/workflows/ci.yml:121-133`):
   - `node scripts/build-catalog.mjs`;
   - `npm run family-text:build`;
   - `npm run spec:build`;
   - routing compile;
   - QA compile;
   - `build-op-classes`.

   Use the exact commands from `scripts/README.md` and `package.json`. Both ADR-0003 guards must
   pass. Then assert that the other three `evidence.inputs` hashes in `eval/gates.json` are
   unchanged.
4. **`eval/discovery/cases.json`.** Drop `scout.matchPartners` from its one `acceptableOps` list.
5. **Retarget tests.**
   - `test/catalog.test.ts`: Scout 29, the `matchPartners` count 0, 61 / 285, and the x-routing id
     lists. Also correct ":387 of 37 upstream" to the inventory's 42.
   - `test/super-spec.test.ts`: 29; `18 + 29 + 12 + 2`.
   - `test/search.test.ts`: `matchPartners` absent and `getPartners` reachable. At `:631`, Scout
     hits go from 2 to 1; `scout.getLeaderboard` stays.
   - `test/live-cases.test.mjs`: 66 to 65.
   - `test/plain-operation-harness.test.mjs` and `eval/qa/plain-operation-harness.mjs`: Scout 29
     and 61.
   - `test/adapters.test.ts:447`: build the entry by hand and keep the assertion. Keep the
     adapter's 503 `unavailable` branch, since re-exposure is the end state.
6. **Docs.** `eval/qa/README.md:96` becomes 61 operations: 18 Lumenloop, 29 Scout, 12 Docs and 2
   stellar.org. Leave `plugins/openai/MCP-FINDINGS.md`, which is a dated record.
7. **First gate run.** Run `npm run eval:routing -- --gate` with output redirected to a log, and
   read only the `GATE` lines. It must fail with exactly two lines: the manifest fingerprint, and
   holdout captures 11 above 10. Any other line is a stop.
8. **Per-case comparison, with no holdout or confirmation-only rows displayed.**
   - Write the base manifest (`git show origin/main:catalog/manifest.json`) to `tmp/5.1/`.
   - Run the runner on base (`--manifest`) and on the new manifest, each with `--dump-ranked`, and
     stdout to a log.
   - From each log, read only the `results -> ` line to get the results-file path.
   - A script in `tmp/5.1/` reads the two results files. From the `cases`, `extendedCases`,
     `skillsCases` and `protocolHistoryCases` arrays, it compares grades, top-five ids and scores.
     It reads `holdoutLane` aggregate keys only. It never reads `holdoutCases`.
   - Rows with `confirmationOnly` are counted per lane (graded, top-five list, score-only) and
     never printed. Ids are printed only for unlisted rows.
   - Expected: zero graded change on legacy, extended, skills and protocol-history; a few legacy
     and extended top-five and score-only moves; holdout 12/27/30/30, captures 11, passed 24.
9. **`eval/gates.json`, in this same commit.**
   - the manifest `sha256`;
   - holdout `forbiddenCaptures` 11 and `passed` 24;
   - `holdout.maxForbiddenCaptures` 11;
   - `baselinedAt` set to the `ranAt` of the new run, and `localTrace` to its file name;
   - a new dated lead in `evidence.notes`. It covers:
     - the reason, with the owner quote;
     - the history sentence;
     - exclusions 12 to 13;
     - holdout read as counts only;
     - zero graded change on the other four lanes;
     - the movements, as counts for confirmation-only rows and ids for the rest;
     - "a change that re-exposes `scout.matchPartners` restores the ceiling to 10";
     - the independent review, filled in after it runs;
   - one clause in `holdoutNote`: ceiling 11 for this removal only, 10 on re-exposure.
10. **`.agents/TODO.md`.**
    - **"Triage the runtime and client gaps", first bullet.** Removed on 2026-11-17 (this PR). The
      re-exposure trigger is `sls-123` (issue URL) verified live: one POST of the recorded command
      returns 200 with `matches`. That POST is model-backed on the upstream's account, so one call
      per verification is enough. Re-exposure:
      - deletes the exclusion line;
      - reverses the edits listed in this item's EXEC.md;
      - re-runs the comparison;
      - restores the ceiling to 10, but only if the comparison shows 10 captures; otherwise it is
        reported.
    - **Pointers.** Update the two at TODO ~88 and ~804.
    - **New line.** A narrower `src/skills/scrub.ts` unit, so the `stellar-scout` partner-filter
      step survives an operation exclusion.

### C5. SERVICE ERRORS wording

In `src/mcp/tools.ts:485`, "inspect or retry the failures" becomes "follow each failure's hint".
At `:488`, "inspect or retry errors" becomes "follow each error's hint".

### C6. Records

Commit `items/5.1/EXEC.md`, the review files and `briefs/`. The lead adds the round-ledger row,
with the v8 SHA-256.

## Gates (bare; output to a log wherever it can show holdout or QA rows)

- `npm run typecheck`, `npm test`, `npm run build`.
- `npm run eval:routing -- --gate`: exit status, and the `GATE` lines only.
- `npm run eval:selftest`.
- `npm run eval:qa:lint -- --stale --enforce-floors`: log only. On failure, read only the lines
  naming the operation.
- `npm run eval:qa:register -- --check`.
- `npm run improvements:lint`.
- `npm run secrets:scan -- --tree`.
- Generated-file sync: rerun every generator; `git status` shows only the intended files.
- No `test:smoke`: `src/executor` and `src/demo` are not touched. CI runs it anyway.

## Stop rules

- **Holdout.** It differs from captures 11 and passed 24, or another holdout aggregate moves.
- **Graded change.** Any graded total or graded row moves on legacy, extended, skills or
  protocol-history.
- **First gate run.** It prints a line other than the two expected ones.
- **QA case.** Any field other than `surface` names the operation, or the golden depends on it
  being callable.
- **Amendment.** Its checks fail: the v7 hash, the counts, or not exactly one non-tuning id.
- **Never:**
  - open `holdoutCases` rows, a held-out or reserve QA case, or a split file's sets except through
    the script;
  - print a confirmation-only routing row;
  - edit a holdout case.
- **Spend.** No model-calling eval, no paid call, no local server.

## Reviews

1. Fable plan review: [REVIEW.md](REVIEW.md), reconciled below.
2. After execution, a Codex frontier review (`gpt-6-astra`, high) of the diff. It:
   - re-runs `npm run eval:routing -- --gate` and the base-manifest run, under the same no-holdout
     and no-confirmation-only display rules;
   - checks the finding body.

   The executor reconciles every finding.

## Risks

- **Lexical shift.** It may differ from 3.2's because `main` moved. The stop rules catch it.
- **Lint output.** It can print other cases' ids and golden text (the 3.5 incident). Logs only, and
  only filtered lines are read.
- **Timing.** The 2.1 timer reads the split path from `origin/main` on 2026-11-23 18:00 UTC. PR 5.1
  must merge first, or the timer reads v7. v7 would stay valid but would not include the moved
  case.
- **Upstream decline.** The maintainer may decline the finding as working-as-designed. The finding
  then becomes `declined-upstream` with the reference and a `disposition`, and the removal stands
  on the owner's reason.
- **Skill side effect.** The `stellar-scout` partner-filter step leaves the served skill (Facts).

## Needs from the orchestrator

- Copy `~/backups/gca-2026-11-14-split-v8.json` to the Mac and verify its SHA-256 (in REPORT.md).
- Weigh the served-skill side effect before merging.
- Note that `items/3.2/EXEC.md:79-85` on `main` shows two confirmation-only routing rows with their
  rank changes. That is a recorded exposure under decision 2(a), not caused by this item.
- C5 wording: a generic Scout error carries no hint (`src/adapters/scout.ts:187-194`), so "follow
  each failure's hint" gives no instruction there. The note fixes the wording; the lead keeps it.
- Merge, then deploy. Production checks:
  - a live `search` for a partner question lists no `matchPartners`;
  - the landing page returns 200;
  - `/mcp` returns 401.

## Review reconciliation

| # | Finding | Decision |
|---|---|---|
| 1 | `test/adapters.test.ts:447` missing | Adopted (C4.5) |
| 2 | Confirmation-only rows displayed | Adopted: counts only (C4.8, C4.9); the two ids are removed from this plan; 3.2 EXEC flagged to the orchestrator |
| 3 | QA edit may not be mechanical | Answered: no other field names the operation (count script), and the seen question does not depend on it. C2 reads the case in full after C1 and stops if the golden depends on it. The reviewer's record case is not current (booleans), so there is no second case |
| 4 | "every call" is wrong | Adopted: one dated history sentence everywhere |
| 5 | Recommendation | Adopted: restore, name both causes, optional `/api/status` signal; no OpenAPI removal |
| 6 | Filing order and push | Adopted: the finding is filed first (C3), with a push before filing |
| 7 | Served-skill side effect | Adopted: recorded; TODO line; flagged to the orchestrator; no scrub change |
| 8 | `baselinedAt`, input hashes, 13 exclusions | Adopted |
| 9 | Lint pre-check | Adopted: run by the lead (Facts); the executor re-checks after C2 |
| 10 | Register procedure | Adopted (C2.4) |
| 11 | C1 details | Adopted: pin list, sibling-check last line only, id kept out of prose |
| 12 | Stale facts | Adopted: CI rebuild order, README target 61 with stellar.org, `:387` fix, results-file path, the `main` changes |
| 13 | Gate additions | Adopted: two-line first gate; never edit a holdout case |
| 14 | Generic Scout error has no hint | Kept the note's wording; flagged to the orchestrator |
| 15 | TODO re-check | Adopted (C4.10) |
