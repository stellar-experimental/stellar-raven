# Item 5.1 plan review

Reviewer: Claude Fable tier, Claude Fable 5.2 (`claude-fable-5-2`), effort as launched by the lead.
Fable is the tier the round assigns to plan reviews (DECISIONS.md, "Opus plan, Fable review").
Reviewed `PLAN.md` and `QUESTION.md` on `9b1a483b`, 2026-11-17. Read-only: this file is the only
file written.

## What was and was not checked

- Checked against the tree: every file the brief lists, `git show b4a74b8f`, the diff from
  `b4a74b8f~1` to `HEAD` on the paths the item touches, the CI workflow, `package.json`, and
  `eval/routing-qa-overlap.json`.
- Not run: any routing run, the QA lint, a server, a model call, or a live request. The lead's
  2026-11-17 14:04:50Z POST is taken as stated.
- Not opened: `eval/results/`, `eval/holdout-cases.json`, `eval/qa/cases.json`, anything under
  `eval/qa/corpus/`, any split file, `tmp/5.1/`.

**Incidental exposure by this reviewer.** While checking the 503 history I read two tracked
records that name one QA battery case and say what its golden keys on:
`.agents/rounds/2026-11-06-remaining-sweep/sls097-author.md:80`, and the "Golden consumers"
evidence line of `improvements/stellar-light-scout/sls-097-…md` at commit `a73e0b25`. I did not
open the case. I ran one existence test on the path the first record gives (no content read): that
path is absent today, and the battery was rebuilt on 2026-11-14, so I do not know whether the case
survives, what set it is in, or whether it is the plan's case. Finding 3 uses this. The id is not
repeated here.

## Findings

### Blocking

1. **C3 cannot pass `npm test`: the retarget list misses `test/adapters.test.ts:447`.**
   - Evidence: the test calls `entry("scout.matchPartners")`, and `entry` reads the real manifest
     and throws `missing catalog entry` (`test/adapters.test.ts:19-27`). `b4a74b8f` did not change
     the file (`git show b4a74b8f:test/adapters.test.ts` still has the line), so using it as the
     checklist carries the gap over. The item 3.2 plan had the step (its E4).
   - Fix: add it to C3 step 5. Build the entry by hand in the test and keep the assertion. Keep the
     adapter's 503 `unavailable` branch (`src/adapters/scout.ts:179-186`): re-exposure is the
     intended end state. Say in EXEC.md that no exposed operation reaches that branch meanwhile.
     In the inventory, only `matchPartners`, `partnerAssistant` and `partnerOnboard` document
     `unavailable`. No `src/adapters` edit is needed.

2. **C3 steps 8 and 9 would print per-row output for confirmation-only rows.**
   - Evidence: `eval/README.md:73-78` says no lane reads a listed row's per-row output, and
     `:29` says a dump difference on a listed row is "counted, never displayed". This is owner
     decision 2(a). `eval/routing-qa-overlap.json` lists 108 of 338 legacy rows and 43 of 122
     extended rows. Both rows that `PLAN.md:107` names are in `sets.legacy` (checked with a
     one-line `node` read of that file). The plan's script compares grades, top-five ids and
     scores on every row, and step 9 puts "per-case movements by id" into `eval/gates.json`.
   - Fix:
     - The script splits rows on the `confirmationOnly` flag that the results file already
       carries. For listed rows it reports counts per lane only (graded changes, top-five list
       changes, score-only changes). It prints ids only for unlisted rows.
     - The `gates.json` note says, for example, "2 legacy top-five list changes, both on
       confirmation-only rows (count only)".
     - Remove the two ids from `PLAN.md:107` before C6 commits it, and keep them out of EXEC.md,
       REPORT.md and the pull request.
     - Tell the orchestrator that `items/3.2/EXEC.md:79-85`, already on `main`, displays those two
       rows with their rank changes. That is where this reviewer read them.

3. **The QA edit may not be mechanical. The plan does not say why the golden survives the removal.**
   - Evidence: the two tracked records above describe a battery case whose golden is about this
     operation failing and the fallback to the directory. If that case still exists it is almost
     certainly the plan's case, because the lead's search found exactly one. For such a case a
     `surface`-only edit leaves a golden whose scenario (call the operation, see it fail, fall
     back) can no longer happen. The lint cannot see that: it checks only three spellings
     (finding 9).
   - Fix: this needs the lead's answer before C2, and the lead can give it now, having seen the
     question and the first golden sentence.
     - If the question or golden depends on the operation being callable, C2 is a `golden-truth`
       change (redefine or retire, with provenance and the register review), not a `surface`
       edit. After C1 the case is in tuning, so it may be opened for that.
     - If it does not, say so in one sentence in the plan's Facts section.
     - Separately, a script that prints three booleans settles my exposure: the id at
       `sls097-author.md:80` is a current case; it equals the exposure-note id; it is in v7
       tuning. If it is current, outside tuning, and not the exposure-note id, that is a second
       case for the amendment. Ask the orchestrator.

### Should-fix

4. **The plan's headline fact is wrong: the endpoint did not answer 503 on every call since 2026-10-26.**
   - Evidence: the resolved finding `sls-097` records HTTP 502 on 2026-11-02, several times and
     hours apart, ending with two direct POSTs at 22:39Z that returned JSON with no `unavailable`
     field (`git show a73e0b25:improvements/stellar-light-scout/sls-097-partner-match-undocumented-502.md`).
     The 2026-10-26 message was "AI not configured" (`.agents/TODO.md:773`). The production
     reads say "nearly every call" (`items/3.1/EXEC.md:44`, `.agents/TODO.md:804`), not "every
     call" as C5 has it.
   - Fix: use one accurate sentence everywhere (plan, `gates.json` note, code comment, TODO,
     finding): no observed call has succeeded since 2026-10-26; the failure was "AI not
     configured" then, HTTP 502 on 2026-11-02, and 503 `unavailable: true` on 2026-11-17 (01:29Z
     through Raven in item 1.3, 14:04Z direct). In the upstream body give only the dated,
     reproducible observations and link #1908 as related. Leave out "production reads": it is
     an internal term and a statement about production.

5. **C5: the finding is legitimate, but the recommendation is not the smallest correct one.**
   - Legitimacy: the contract is right and the hosted deployment is the defect. The published
     operation carries routing hints, and no observed call has worked for three weeks. Say that
     in the first paragraph, so the maintainer does not read it as a contract complaint.
   - Evidence for the recommendation: the documented 503 `unavailable` covers two causes, "no
     model is configured, or the provider refuses our request or account (any 4xx but 429)"
     (`inventory/stellar-light.json`, the operation's 503 response). The body does not say which,
     so the owner may not know the provider is refusing. `GET /api/status` carries no AI state
     (same inventory).
   - Fix (my recommendation): ask first for the hosted AI path to be restored, naming both
     documented causes to check. Offer one optional signal: report the AI path's state in
     `GET /api/status`, so a client can skip the operation. Drop "remove it from the published
     OpenAPI": that document is the contract for every deployment, and the 503 clause is correct
     there.
   - The plan's handling of a decline is right: `declined-upstream` needs the decline reference
     and a `disposition`.

6. **C5 filing sequence: push before the real filing, and file before C3 if you can.**
   - Evidence: the script takes the snapshot commit from local `git log -1` and checks only that
     the blob matches (`scripts/improvements-file-issue.mjs:307-317`). It does not check the
     remote, so an unpushed commit gives a dead link. Items 1.1 and 1.3 used: commit, the lead
     pushes, dry run, post, with no edit to the finding between the dry run and the real run
     (`items/1.3/PLAN.md:175`, `items/1.1/PLAN.md:246`).
   - Fix: C5 step 2 becomes commit, ask the lead to push, dry run, read it as the maintainer,
     post, read the issue back. The script then rewrites the finding and the index, which is a
     second commit. The separate `npm run improvements:index` is redundant; the script runs it.
   - Simpler order (my recommendation): write and file the finding first. It depends only on the
     live POST. Then the C3 code comment and the TODO carry the issue URL from their first
     commit, and `src/policy/scout-exposure.ts` is edited once, not twice.

7. **The plan drops the served-skill side effect that item 3.2 recorded.**
   - Evidence: `src/skills/scrub.ts:29,85,181` scrubs every served skill body from the same
     exclusion list. `items/3.2/REVIEW.md` finding 10 ran it: the `stellar-scout` skill loses
     `SKILL.md` workflow step 4 whole (the partner-directory filters, the stablecoin peg guidance,
     and the "none listed at our source" rule), one sentence of the `getPartner` paragraph, and
     the match section of the API reference. The manifest does not move for this.
   - Why it matters here: `scout.getPartners` becomes the only partner path, and the step that
     explains its filters is the step removed. Neither the note nor EVAL-FABLE item B weighed it.
   - Fix: record the three removals in the plan and in REPORT.md so the orchestrator sees them
     before the merge. Add the TODO line for a narrower scrub unit. Do not narrow the scrub in
     this item. `test/skill-scrub.test.ts:189-201` already proves under `npm test` that no
     reference survives, so no extra run is needed.

8. **`baselinedAt` should move, and the note needs two small corrections.**
   - Evidence: every earlier re-baseline that moved an accepted total also moved `baselinedAt`
     to the accepted run (`5d7a4f88`, `76a80287`). Item 0.2 kept it because only the fingerprint
     moved. Here two accepted totals and one threshold move.
   - Fix: set `baselinedAt` to the `ranAt` of the run named in `localTrace`. Also assert that the
     other three `evidence.inputs` hashes are unchanged after `eval:compile` (`b4a74b8f` left
     `eval/routing-cases.json` untouched). The exclusion count the note may cite is 13, up from
     12. The rest of the edit set is right: manifest hash, `forbiddenCaptures` 11, `passed` 24,
     `maxForbiddenCaptures` 11, the `holdoutNote` clause, a new dated lead in `evidence.notes`.

9. **A lint failure at C3 can expose another case, and the plan's pre-check is too narrow.**
   - Evidence: `lintSurface` runs the emitted-text guard over every case's question, answer, key
     facts, avoid list and notes (`eval/qa/lint-corpus.mjs:288-303`, `caseText` at `:110-118`).
     After the exclusion the guard rejects the bare name in either spelling and the raw path
     (`scripts/emitted-text-guard.mjs:39-43,79-93`). The lead searched for the dotted id only
     (`QUESTION.md:7`). The error line carries the case id.
   - Fix: before C3, a script prints two counts from `eval/qa/cases.json` and nothing else: cases
     whose text matches `matchPartners`, `match_partners` or `/api/partners/match` (any case),
     and cases whose `surface` lists the id. Expect 1 for `surface`. A text match outside the
     moved case is a stop, with no id read. Also check that the moved case's `surface` stays
     non-empty (`lint-corpus.mjs:290-292`).

10. **C2 leaves the register step open.**
    - Evidence: the register hashes whole case-file bytes (`eval/qa/register-helper.mjs:31-39`),
      so a `surface` edit reopens every entry that holds the case.
    - Fix: name the procedure from item 3.2's plan (E6.4): `npm run eval:qa:register`, then
      `-- --review <file>` with the previous verdict, `clearReopened: true`, and a `reSwept`
      reason saying no judge-facing field moved (`register-helper.mjs:114-146`). Then `-- --check`.

### Nit

11. **C1 is sound; four details.**
    - The design matches `amend-split-v7.mjs` and `moveToTuning`: v7 hash, counts 88/112/47 as
      `countsBefore`, exactly one non-tuning id, `wx` write with mode 600, fixed failure lines.
    - Nothing but `TUNING_ROW_COUNT` asserts the tuning count (`eval/qa/tuning-rows.mjs:9`; the
      scans and five tests import it). No test reads a split file, so C1 passes its gates.
    - The v7 pins to move are `.agents/TODO.md:45-53`, the four briefs (`2.1-LEAD.md:46`,
      `2.2a-LEAD.md:39`, `2.2b-LEAD.md:32`, `2.2c-LEAD.md:38`) and `PRESTAGE.md:10,96`. Leave
      the 3.5 and 4.1 records. The round-ledger row must carry the v8 SHA-256
      (`eval/qa/README.md:233-234`).
    - `sibling-check.mjs` prints openable ids on stdout; only its last line is safe to commit
      (`sibling-check.mjs:13-17`). Redirect it and read the last line.
    - "The id stays out of every tracked file" cannot hold after C2: the commit's path, the
      `cases.json` diff and the register name the case. That is acceptable because v8 comes
      first. Reword it to "out of all prose", and keep the set out of the amendment note.

12. **Smaller wrong or stale facts.**
    - "`origin/main` has changed only family-text naming" is incomplete. Since `b4a74b8f~1`,
      `eval/run-routing.mjs` moved its evidence check to `eval/lib/gate-evidence.mjs`, and
      `src/policy/identifier-token.ts` changed its token pattern. The 3.2 numbers may not
      reproduce exactly; the stop rule covers that.
    - `catalog:build` is not an npm script. Use `node scripts/build-catalog.mjs`. CI's order is
      catalog, `family-text:build`, `spec:build`, `compile-routing`, `compile-qa`,
      `build-op-classes` (`.github/workflows/ci.yml:121-133`).
    - `eval/qa/README.md:96` is already stale (60 operations, no stellar.org). The target is 61:
      18 Lumenloop, 29 Scout, 12 Docs, 2 stellar.org. `plugins/openai/MCP-FINDINGS.md:46` is a
      dated record; leave it.
    - `test/catalog.test.ts:387` says "of 37 upstream" operations; the inventory has 42. Fix it
      in the same edit.
    - C3 step 8 mixes two files. `--dump-ranked` holds ids only. Grades and scores are in
      `eval/results/routing-<stamp>.json`; take its path from the `results -> ` line of the
      hidden log, and read no other line. The script can read every non-holdout lane from that
      file's `cases`, `extendedCases`, `skillsCases` and `protocolHistoryCases` keys and the
      `holdoutLane` aggregate without touching `holdoutCases` (`eval/run-routing.mjs:440-449`).

13. **Gates and stop rules match the note; three additions.**
    - Add the note's fourth stop rule, "never edit a holdout case".
    - Add 3.2's check: the first `--gate` run after the rebuild fails with exactly two lines
      (fingerprint, captures 11 above 10). Any other line is a stop.
    - No gate is missing for the areas touched. `test:smoke` is not owed, and CI runs it
      (`ci.yml:91`).
    - Commit order: C1 passes; C2 passes while the operation is exposed (the lint has no
      per-operation floor; `lintCoverage` works by taxonomy leaf); C3 fails until finding 1 is
      fixed; C4 passes.

14. **C4: the strings and line numbers are right, and nothing pins them.**
    - `src/mcp/tools.ts:485` and `:488`; `git grep 'inspect or retry'` finds only those two lines
      and two dated records.
    - One thing for the orchestrator, since the note fixes the wording: a generic Scout error
      carries no hint (`src/adapters/scout.ts:187-194`), so "follow each failure's hint" then
      gives no instruction.

15. **TODO rewrite: name the re-check.**
    - The skill wants a future check written so a stranger can run it. Give the finding id, the
      issue URL and the exact POST with the expected 200 and `matches`. Point re-exposure at this
      item's EXEC.md for the reverse edit list.
    - Say the ceiling returns to 10 only if the comparison then shows 10 captures; otherwise
      report.
    - That POST is a model-backed call on the upstream's account once the path is on (the
      2026-11-06 lane treated it as excluded under a no-paid-call rule). One call per
      verification is enough.

## Verdict

Revise before execution: fix findings 1 and 2, get the lead's answer on finding 3, and adopt 4 to 10; the item's design and scope are otherwise sound.
