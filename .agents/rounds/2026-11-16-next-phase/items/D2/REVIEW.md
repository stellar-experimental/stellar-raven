# Review of the D2 plan (held-out integrity without a re-draw)

Reviewer: Claude Fable 5.2, high effort, agentpc. Independent of the lead (Claude Opus 5.5) and of
the orchestrator. Reviewed `items/D2/PLAN.md` against `np/d2-heldout-integrity` at `ba1a448d`.
Spend: USD 0. No model call. I edited nothing but this file.

## Verdict

The plan carries out decision 2 (a) and (b) and its membership reasoning is sound. One blocker
(finding 1) and nine "should" findings need a plan change before the executor starts. None of them
changes the approach.

## What I checked and confirm

- **Overlap counts.** I recomputed them from public files with the plan's rule (NFKC, lowercase,
  `[\p{L}\p{N}]+` token sets, Jaccard ≥ 0.8, all 247 questions), printing counts only: legacy 108
  of 338, extended 43 of 122, skills 0 of 23, holdout 0 of 49, discovery 15 of 43,
  protocol-history v1 1 of 12, v2 1 of 12, blind v1 and v2 0 of 20. They match PLAN.md:24-28.
- **Sealed files** (`ls` and `sha256sum` only). `gca-2026-11-14-split-v2.json` is `697c550a…ed12`;
  `heldout-2026-11-15/results.json` is `1902171b…f9d3`, the hash the loop 2 ledger records
  (`.agents/rounds/2026-11-15-tuning-loop-2.md:445-446`); `exposed-row.sha256` is 65 bytes (one
  hash and a newline). No `split-v3` file exists yet.
- **`caseInputSha256` is a stored row field** (`eval/qa/run-qa.mjs:1986`), so step 5 can find the
  row without reading any other field.
- **The list reveals no membership.** It is a function of committed files only, and it holds no QA
  id. Publishing 108 beside the old 73 gives no per-case information.
- **The stored baseline holds all 247 rows** (`.agents/rounds/2026-11-14-baseline-tuning.md:141`),
  so `ids.length` selects 80 from it under v3. The 50-row panel runs stay 50, as the plan says.
- **Tag-only in the result JSON is the right design.** Item 3.3's pass rule counts hit-to-miss
  rows, so the per-row grades of listed rows must stay in the artifact to be counted. Do not
  redact them there.
- **Scope.** Part (b) stays at one row, v2 is untouched, and no re-draw happens. Extending the
  list to the discovery and protocol-history sets is within (a): the same contamination applies.

## Findings

1. **Blocker. The runner prints a listed row's per-row output on every run, including the plan's
   own gate run.**
   - Evidence: `eval/run-routing.mjs:546-554` prints a per-row table (id, target rank, top hit)
     for all 12 protocol-history v1 rows, and one of them is listed. Step 3 only adds a JSON tag.
     The executor's `npm run eval:routing -- --gate` would then show that row, against the rule
     step 4 writes in the same pull request.
   - The same gap exists outside `run-routing.mjs`, which is the only file step 3 names:
     `eval/run-protocol-history.mjs:79-86` prints the v2 table (1 listed row), and
     `eval/discovery/run-discovery.mjs:73-76` prints a per-case hit line (15 listed rows).
     `eval/discovery/run-replay.mjs` writes per-row rows too.
   - Fix: add one small helper (for example `eval/lib/confirmation-only.mjs`) that loads the list
     and answers `isConfirmationOnly(set, id)`. Use it in `run-routing.mjs`,
     `run-protocol-history.mjs`, `run-discovery.mjs` and `run-replay.mjs` to tag the result rows,
     and to print `confirmation-only` in place of the rank, top hit or hit/miss on each console
     line for a listed row. Aggregates stay computed from all rows.

2. **Should. Do not add a `confirmationOnly` key to the ranked dump.**
   - Evidence: the dump is a flat `{ caseId: [hitId…] }` map (`eval/run-routing.mjs:463-470`), and
     `eval/README.md:27-29` documents it as a diff instrument. A top-level `confirmationOnly` key
     sits in the case-id namespace, inflates the printed case count, and appears in every diff.
   - Fix: leave the dump's shape unchanged. The committed list is the lookup. State in the README
     that a dump difference on a listed row is counted, never displayed.

3. **Should. Look rows up by set and id, and fail closed.**
   - Evidence: protocol-history v1 and v2 share all 12 ids, and the two blind files share all 20
     (same questions today). A single global id set works only by that accident. The other
     supplements load behind `existsSync` (`eval/run-routing.mjs:300`, `309`, `359`); copying that
     pattern would leave rows silently untagged when the list is missing.
   - Fix: key the lookup by set name. Throw when the list file is missing, and throw when a listed
     id is absent from its set (a stale list after `npm run eval:compile`).

4. **Should. `eval/agentic/sample.json` is a committed routing question set the plan does not
   name.**
   - Evidence: 12 of its 30 questions match at ≥ 0.8. All 30 ids and questions are legacy routing
     rows, so those 12 are already on the legacy list by id. PLAN.md:39-42 claims "every committed
     routing and discovery question set". `eval/partner-docs/cases.json` (0 of 12) and
     `eval/discovery/mined-lumenloop-queries.json` (0 of 91) have no match.
   - Fix: either add the agentic sample as its own set in the generator, or state in the
     `$comment` and in `eval/agentic/README.md` that its rows are legacy rows and the legacy list
     governs them. Add one sentence to `eval/discovery/README.md` as well. In the routing README,
     say that a new routing or discovery question set is added to the generator.

5. **Should. The 79→80 list in step 7 is incomplete; `npm test` fails as planned.**
   - Missing from PLAN.md:29-33 and step 7:
     - `eval/qa/scan-tuning-exposure.mjs:27` has its own private `TUNING_ROW_COUNT = 79`. The plan
       lists its test but not the script.
     - `test/corroboration-scan.test.mjs:70` builds a 79-id split and calls `scanCorroboration`,
       which calls `tuningIdsOf`; it throws under 80.
     - `eval/qa/scan-tuning-panel.mjs:104` renders the literal "(asserted 79)".
     - Comments: `eval/qa/scan-tuning-panel.mjs:12`, `eval/qa/scan-corroboration.mjs:23`,
       `eval/qa/claim-read-packets.mjs:17-18`, `eval/qa/scan-step2-roles.mjs:146`,
       `test/replay-guard.test.ts:34`.
   - Fix: export one constant from `tuning-rows.mjs`; import it in `scan-tuning-exposure.mjs` and
     delete the private copy. Baseline call sites use `ids.length`. Tests import the constant and
     build fixtures from it, so the next amendment is a one-line change. Reword the comments to
     "the tuning rows" with no number.

6. **Should. Prove the new list contains every row of the old measurement.**
   - Evidence: PLAN.md:27-28 argues from counts ("must be larger, and are"). A larger count does
     not prove containment if the old measurement (`research/audits/2026-11-14-family-decider.md:150-151`,
     "exact or token Jaccard ≥ 0.8") used a different tokenizer. A row in the old 99 but not in
     the new 151 would become readable per row while it duplicates a held-out or reserve question.
   - Fix: add to "Needs from the orchestrator": compare the held id list against the committed
     list and report one number, the count of old ids missing from the new list. It must be 0.
     If it is not 0, do not add the rows by hand (that would reveal membership); change the public
     rule so that it captures them, and regenerate.

7. **Should. Harden `amend-split.mjs`; the loop 2 deviation was a counts-only script that printed
   a field.**
   - Evidence: `.agents/rounds/2026-11-15-tuning-loop-2.md:460-465`. Node's `JSON.parse` error
     text can quote the input, and an uncaught error prints its message.
   - Fix, all cheap:
     - Put the logic in a pure function (`split`, `rows`, target hash → `v3` and counts) and test
       it in `npm test` on synthetic data, with a poisoned getter on every other row field, as
       `test/tuning-panel-scan.test.mjs:36-45` does.
     - Catch every error at the top level and print one fixed line that names the failed check.
       Never print `error.message`, a row, or an object.
     - Validate the target against `/^[a-f0-9]{64}$/` after trimming. Compare the results hash to
       the ledger's constant as well as to `results.sha256`.
     - Assert the post-conditions: the three sets still partition the same 247 ids, counts are
       80/118/49, and the moved id exists in `eval/qa/cases.json` (by id only). Without the last
       one, `scanPanel` throws on a retired case (`eval/qa/scan-tuning-panel.mjs:41`).
     - Add `--dry-run`: every assertion, the counts, no write. The lead reads the script before
       the one real run.
     - In the executor brief: on any failed assertion, stop and report the fixed line. Do not
       open, print, `head` or `jq` any file under `~/backups`.

8. **Should, conditional. The `strata` field of the split.**
   - Evidence: PLAN.md:19-20 lists `strata` among v2's fields, and step 5 copies v2 with only
     `sets` and `amended` changed. I did not open the file. If `strata` records per-set counts, v3
     would contradict itself.
   - Fix: the lead states what `strata` holds. If it has per-set counts, the script either updates
     the one stratum (from the case's public `truth.leaf` prefix and `tags.freshness`) or the
     `amended` text says the strata describe the draw, not the amended sets.

9. **Should. Compare aggregates mechanically, not by reading a printout.**
   - Evidence: PLAN.md:88-89 says "compare the gate printout before and after". That printout
     holds per-row tables (finding 1).
   - Fix: run `--dump-ranked` on `main` and on the branch and `cmp` the two files. An identical
     dump proves rank and membership identity for the legacy, extended, skills and
     protocol-history lanes; the holdout lane is covered by its gate counts.

10. **Should. The TODO and ledger edits in step 8 need three more touches.**
    - `.agents/TODO.md:48-50` says the exposed row "moves to tuning under decision 2(b)"; make it
      a done statement with the date.
    - The held-out status should say that the stored held-out reads and their thresholds are on
      119 rows, and that a future read pairs on v3's 118.
    - The loop 2 ledger's ruling (`.agents/rounds/2026-11-15-tuning-loop-2.md:48-52`) says "Their
      ids are not recorded anywhere". Add one dated line there that the committed list replaces
      the ruling, beside the line the plan already adds under the deviation.

11. **Nit. Wording of the general rule in `eval/qa/README.md` (step 6).**
    - Decision 2 chose no re-draw for this one case. "With no re-draw" as a standing rule binds
      future rounds beyond what the owner answered.
    - Fix: write "moves to tuning by a dated amendment that writes a new split file and leaves the
      old one in place; a re-draw is a separate owner decision". Keep the 2026-11-16 event out of
      the README; it belongs in the ledger.

12. **Nit. Generator details.**
    - Write no timestamp into `eval/routing-qa-overlap.json`, so `--check` can compare the whole
      serialized output and catch a hand edit to the rule or counts.
    - Test the threshold with integers (`5 * intersection >= 4 * union`), not a float compare.
    - The check's failure message names the set, the two counts and the regenerate command. It
      never prints a QA question or which question a row matched.

13. **Nit. Gates.** `npm run eval:routing:overlap -- --check` repeats the test that step 2 puts in
    `npm test`. Keep one. The rest of the gate list is right for the paths touched;
    `npm run test:smoke` is not needed.

14. **Nit, no change asked. Rows just under the threshold.** At Jaccard 0.7 to 0.8 there are 2
    legacy, 4 extended, 1 discovery and 1 agentic rows. Decision 2 fixes 0.8, so they stay
    unlisted. The count is small enough that the threshold is not on a cliff.

## Not verified

- I did not open the split or the sealed results, so the field names in PLAN.md:19-20 (`heldOut`,
  `amended`, `strata`) rest on the lead's structure-only read.
- I ran no gate; the plan changes no code yet.
