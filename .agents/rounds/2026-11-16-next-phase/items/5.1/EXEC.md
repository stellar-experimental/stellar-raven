# Item 5.1 execution record

Executor: Claude Sonnet 5.5, agentpc, 2026-11-17. Worktree `/home/tyler/code/raven-wt/np-5.1`, branch
`np/5.1-remove-matchpartners` from `origin/main` `9b1a483b`. Lead: `t1tm`. The plan is
[PLAN.md](PLAN.md). No model-calling eval, no paid call, no local server, no subagent.

**Status: done. No stop rule fired.** The independent Codex review is outstanding.

## Steps and commits

| Step | Commit | What |
|---|---|---|
| C1 | `c08efa39` | Split v8, `amend-split-v8.mjs`, `TUNING_ROW_COUNT` 89, v7 pins moved, FOLLOWUP.md |
| C2 | `05e49ccd` | The moved QA case: `scout.matchPartners` out of `surface`; compile; register closed |
| C3 | `51de4f06`, `b4717ab6`, `446484c0`, `10aefef5` | Finding sls-123: written, tightened twice after the dry run, then the script's rewrite and index after filing |
| C4 | `d543cc02` | Exclusion, rebuild, retargeted tests, `eval/gates.json` re-baseline, TODO |
| C5 | `d29fa88c` | SERVICE ERRORS wording |
| C6 | last commit | This file and the item folder |

### C1: split v8

- The script verified the v7 SHA-256 and the counts 88/112/47, found exactly one non-tuning id in the
  exposure note, and moved it with `moveToTuning`. Dry run and real run printed the same hash.
- **v8 path:** `~/backups/gca-2026-11-14-split-v8.json` (mode 600).
- **Counts:** 89 tuning, 112 held-out, 46 reserve. Cases outside tuning with a `reverifyBy`: 65;
  earliest 2027-01-14.
- **SHA-256:** `1f0c1268d47103e652c545cd7642f808d893aa7779192b50d189c42510027720`.
- `TUNING_ROW_COUNT` is 89. The v7 pins moved to v8 in `.agents/TODO.md` (held-out status and a v8
  bullet), the four `items/1.4/dated/*-LEAD.md` files that name a split, and `PRESTAGE.md` (lines 10
  and 96). The 3.5 and 4.1 records are unchanged.
- **Sibling-check last line, v8:** `2.1: 0`, `2.2a: 0`, `2.2c: 1` ("pending-state matches among the
  cases this lane may not open"). These equal the v7 values.

### C2: QA case

- **Read result: golden independent of the operation.** Read in full after C1. Only `surface` named
  the operation, in any spelling, and the golden rests on `scout.getPartners` and dated directory
  counts. It does not call, or depend on, the operation.
- Removed the id from `surface` only; `eval:qa:compile` rewrote `cases.json`, `sample.json` and
  `lifecycle-registry.json`.
- `eval:qa:register` reopened one cluster (member content changed). Closed with `--review`: verdict
  `consistent` (the previous verdict), `lastChecked` 2026-11-17, `clearReopened: true`, `reSwept`
  reason "surface-only edit: removed a non-exposed operation; no judge-facing field moved".
  `--check` reports up to date.
- `eval:qa:lint -- --stale --enforce-floors` passed at this commit (log only; 0 lines name the
  operation).

### C3: upstream issue

- **URL:** https://github.com/Stellar-Light/stellarlight/issues/1976 (open, read back with `gh`).
- Finding `improvements/stellar-light-scout/sls-123-partner-match-ai-path-unavailable-for-three-weeks.md`,
  status `verified`, then `reported-upstream` after the script ran. My own live re-run at
  2026-11-17T14:21:11Z (direct, OpenAPI 1.9.150): 503 `unavailable: true`, no `Retry-After`.
- Dry-run edits before filing (maintainer read): removed the duplicated recorded evidence from
  frontmatter, dropped "free for the caller", added "we observed" to the every-call sentence, folded
  the two OpenAPI causes into the Evidence section, and removed internal dedupe wording. The
  recommendation restores the AI path, names both documented causes, offers the optional
  `/api/status` signal, and does not ask to remove the operation from the OpenAPI.
- Pushed the item branch before filing so the snapshot link resolves. `improvements:lint -- --live`
  passes (92 findings).

### C4: removal and re-baseline

- Exclusion line, with the dated history and the issue URL, in `src/policy/scout-exposure.ts`.
  Ride-alongs applied from `b4a74b8f` by `git apply --3way` of its non-generated files, then the
  comments reworded to the plan's history sentence: `scripts/exposure.mjs`,
  `scripts/build-catalog.mjs` example token, `scripts/description-notes.mjs` scrub removed.
- Rebuilt in CI order. Manifest 285 entries, 61 operations, Scout 29; both ADR-0003 guards passed
  (build and `npm test`). `family-text`, `routing-cases.json` and the QA files did not change after
  the C2 compile. `specs/super-spec.json` and `eval/plan/op-classes.json` changed.
- Retargets: `test/catalog.test.ts` (Scout 29, count 0, 61 / 285, x-routing list, ":387 of 37"
  corrected to 42), `test/super-spec.test.ts`, `test/search.test.ts` (absent and reachable; Scout
  hits at the leaderboard test 2 to 1), `test/live-cases.test.mjs` (66 to 65),
  `test/plain-operation-harness.test.mjs` and `eval/qa/plain-operation-harness.mjs` (61 / Scout 29),
  `test/adapters.test.ts` (the entry is built by hand from `scout.getPartners` with the POST
  transport; the 503 assertion is kept; the adapter branch is kept), `eval/discovery/cases.json`,
  `eval/qa/README.md:96`.
- **First gate run (`npm run eval:routing -- --gate`, before the `gates.json` edit), its two GATE
  lines:**
  1. `catalog/manifest.json SHA-256 4e7094be6c3a does not match the committed 8bbfb864eb37 in eval/gates.json`
  2. `holdout forbidden captures=11 above ceiling 10`
- The other three `evidence.inputs` hashes (`routing-cases.json`, `skills-cases.json`,
  `holdout-cases.json`) are unchanged.

#### Per-case comparison (base manifest from `origin/main` against the new manifest)

Two runs with `--dump-ranked`; a script read only the non-holdout arrays and the `holdoutLane`
aggregates. Confirmation-only rows are counts.

| Lane | Rows | Graded changed | Top-five list changed | Score-only changed |
|---|---|---|---|---|
| Legacy | 338 (108 confirmation-only) | 0 | 2, both confirmation-only | 9: 7 listed rows, 2 confirmation-only; largest change 15 |
| Extended | 122 (43 confirmation-only) | 0 | 0 | 4: 3 listed rows, 1 confirmation-only; largest change 8 |
| Skills | 23 | 0 | 0 | 0 |
| Protocol history | 12 (1 confirmation-only) | 0 | 0 | 0 |

- Listed score-only rows, legacy: `q-comp-sep12-kyc-anchors`, `q-eco-most-active-defi-projects`,
  `q-infra-galexie-what-is`, `q-infra-horizon-deprecated`, `q-scf-hackathon-detail-results`,
  `q-tool-flutter-mobile-sdk`, `q-tool-smart-wallet-repos-discovery`. Extended:
  `q-aas-trusted-asset-list-whitelist`, `q-crp-anchors-by-corridor`,
  `q-ti-historical-events-beyond-retention`.
- `overall` and the extended, skills and protocol-history lane aggregates are equal.
- **Holdout aggregates, base then new:** n 49, top1 12, top3 27, top5 30, cardN 49, cardHit5 30
  (all equal); `forbiddenCaptures` 10 to 11; `passed` 25 to 24. This matches 3.2's step E7.
- New run: `eval/results/routing-2026-11-17T14-25-58-328Z.json` (`ranAt` 2026-11-17T14:25:58.328Z).

`eval/gates.json`: manifest `sha256` `4e7094be6c3a…0635bb`, holdout `forbiddenCaptures` 11, `passed`
24, `holdout.maxForbiddenCaptures` 11, `baselinedAt` the new `ranAt`, `localTrace` the new file,
a dated lead in `evidence.notes` (owner quote, history sentence, exclusions 12 to 13, counts-only
holdout, zero graded change, the movements, the re-exposure line, review outstanding), and one
`holdoutNote` clause. `.agents/TODO.md`: first bullet rewritten with the trigger and the four-step
re-exposure; the two pointers updated; a new bullet for a narrower `src/skills/scrub.ts` unit.

### C5

`src/mcp/tools.ts`: "inspect or retry the failures" became "follow each failure's hint", and
"inspect or retry errors" became "follow each error's hint". Nothing else pinned them.

## Gates (all bare, run after C5)

| Command | Result |
|---|---|
| `npm run typecheck` | exit 0 (after `npm run typegen`; the placeholder `.dev.vars` was present) |
| `npm test` | 168 files passed, 5 skipped; 3,733 tests passed, 3 expected fail, 5 skipped |
| `npm run build` | exit 0 |
| `npm run eval:routing -- --gate` | exit 0; one line, `GATE PASS` |
| `npm run eval:selftest` | exit 0, "all checks passed" |
| `npm run eval:qa:lint -- --stale --enforce-floors` | exit 0 (log only) |
| `npm run eval:qa:register -- --check` | up to date |
| `npm run improvements:lint` | ok (92 findings); `-- --live` also ok |
| `npm run secrets:scan -- --tree` | clean |
| Generated-file sync | reran every CI generator; `git status` shows no change to a tracked file |

`test:smoke` was not run: `src/executor` and `src/demo` are untouched.

## Reverse edit list for a future re-exposure

After `sls-123` is verified live (one POST returns 200 with `matches`):

1. `src/policy/scout-exposure.ts`: delete the `["POST /api/partners/match", "matchPartners"],` line
   and its comment.
2. `scripts/exposure.mjs`: restore the "POST /api/partners/match stays exposed" comment.
3. `scripts/description-notes.mjs`: restore the `matchPartners` scrub entry in
   `SCOUT_DESCRIPTION_SCRUBS` (the "interactive human chat" clause). The `scripts/build-catalog.mjs`
   example token may stay.
4. Rebuild in CI order: `build-catalog`, `family-text:build`, `spec:build`, routing compile, QA
   compile, `build-op-classes`. This restores `catalog/manifest.json`, `specs/super-spec.json` and
   `eval/plan/op-classes.json`.
5. `eval/discovery/cases.json`: add `scout.matchPartners` back to the one `acceptableOps` list (the
   `q-crp-regional-offramp-mobilemoney` case, between `scout.getPartners` and `scout.searchProjects`).
6. Tests: `test/catalog.test.ts` (Scout 30, count 1, 62 / 286, x-routing list, the comment),
   `test/super-spec.test.ts` (30; `18 + 30 + 12 + 2`), `test/search.test.ts` (reachable; the
   leaderboard test's Scout hits 1 to 2), `test/live-cases.test.mjs` (65 to 66),
   `test/plain-operation-harness.test.mjs` and `eval/qa/plain-operation-harness.mjs` (62 / Scout 30),
   `test/adapters.test.ts` (the entry may come from the catalog again), `eval/qa/README.md:96`
   (62 / 30).
7. The moved QA case: re-adding the id to its `surface` is optional. Then compile and register as in C2.
8. `eval/gates.json`: re-run the per-case comparison on both manifests. If it shows 10 captures,
   set the manifest `sha256`, holdout `forbiddenCaptures` 10, `passed` 25, `maxForbiddenCaptures` 10,
   `baselinedAt`, `localTrace`, add a dated note and drop the `holdoutNote` clause. Otherwise report
   the count.
9. `.agents/TODO.md`: rewrite the first bullet of "Triage the runtime and client gaps" and the two
   pointers.
10. The split v8 and the moved case do not revert.

## Deviations and things to know

1. **I printed one confirmation-only routing row.** While checking the shape of a results row, I ran
   `jq` on `.cases[0]` of the first gate run's results file. That row was a confirmation-only legacy
   row, and it showed its top-five list and scores under the new manifest. It is the legacy row of
   the case now in tuning (v8). The comparison script did all later reads and printed counts only
   for confirmation-only rows. I did not stop: no holdout row or `holdoutCases` entry was involved,
   and the row belongs to a case that is now tuning. The plan said "never print" and I did.
2. **The moved case's id appeared in my tool output twice, not in prose:** once as a file name in a
   `grep -rl` of `eval/qa`, then in the C2 full read the plan allows. It is in no commit message,
   note, finding or this file.
3. **The v8 counts imply the source set.** The plan requires the script to print the counts and the
   TODO to record them. The reserve count falls from 47 to 46 and the held-out count stays 112, so
   a reader can infer which set the case left. The TODO says "never record which set a case is in";
   the counts are the only record.
4. **C3 has four commits, not two.** I tightened the finding twice after reading the dry run (the
   duplicated evidence and an internal dedupe sentence), each with a push, before the real filing.
   The snapshot link in the issue pins `446484c0`.
5. **FOLLOWUP.md names the orchestrator's answer as option (a) from the plan and the note.** There
   is no separate answer file to link.
6. **Comment wording differs from `b4a74b8f`.** Its "nearly every call" became the plan's history
   sentence. The comments name `sls-123` and stellarlight#1976.
7. **`npm run typegen` was needed** before `typecheck`: a fresh worktree has no `Env` secret members.
8. **The C2 compile also rewrote `sample.json` and `lifecycle-registry.json`** (one line each), as
   expected from a changed case file.
9. **Independent review.** The `evidence.notes` lead says the Codex review was outstanding when
   written. The lead fills it in after the review.
