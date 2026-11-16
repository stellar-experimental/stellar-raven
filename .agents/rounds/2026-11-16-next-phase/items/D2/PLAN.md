# Item D2: held-out integrity without a re-draw (decision 2)

Lead: Claude Opus 5.5, agentpc `t1r2`. Worktree `/home/tyler/code/raven-wt/np-D2`, branch
`np/d2-heldout-integrity` from `origin/main` `ba1a448d`. Spend: USD 0. No model-calling eval, no
held-out or reserve case content is opened by any agent.

## Decision this changes

1. Routing work may read per-row routing output again, except for rows whose question matches a
   QA headline question. Those rows become confirmation-only: aggregate counts only. This lifts
   the loop 2 interim rule ("no per-row output of legacy and extended rows") and unblocks round
   item 3.3's per-case review.
2. The one held-out case whose answer was exposed in the loop 2 read becomes a tuning case. The
   split goes from 79/119/49 to 80/118/49 under a new SHA-256.

## Facts re-checked on `ba1a448d` and agentpc

- Current split: `~/backups/gca-2026-11-14-split-v2.json`, SHA-256 `697c550a…ed12`; schema
  `qa-split-v1`; fields `schema, date, salt, rule, source, strata, sets{tuning 79, heldOut 119,
  reserve 49}, amended` (a string). Read by structure only, ids masked.
- Exposed row: `~/backups/heldout-2026-11-15/exposed-row.sha256` (one `caseInputSha256`, as
  `eval/qa/paired-verdict.mjs` `caseInputSha256()` defines it). The sealed loop 2 results are
  `~/backups/heldout-2026-11-15/results.json`, SHA-256 `1902171b…f9d3` (`results.sha256` beside it).
- Overlap at token Jaccard ≥ 0.8 against all 247 `eval/qa/cases.json` questions (lowercase, NFKC,
  `[\p{L}\p{N}]+` token sets), a dry run from public files: legacy 108 of 338, extended 43 of 122,
  skills 0 of 23, routing holdout 0 of 49, discovery 15 of 43, protocol-history v1 1 of 12, v2 1
  of 12, blind v1 and v2 0 of 20 each. The old figures (73 and 26) were against the 168 held-out
  and reserve questions only; against all 247 they must be larger, and are.
- `eval/qa/tuning-rows.mjs` hard-codes `TUNING_ROW_COUNT = 79`; callers and tests hard-code 79 for
  a baseline file (`scan-step2-roles.mjs:148`, `test/replay-guard.test.ts:37`,
  `claim-read-packets.mjs` default, tests in `test/tuning-panel-scan.test.mjs`,
  `test/tuning-exposure-scan.test.mjs`, `test/replay-detail-hint.test.ts:41`). Stored 50-row panel
  runs stay 50: they were drawn from the tuning set, so they never held the exposed row.

## Steps

**Part (a): the overlap list (repo).**

1. New `eval/routing-qa-overlap.mjs`. Reads `eval/qa/cases.json` (`question` only) and every
   committed routing and discovery question set: `routing-cases.json` (`cases` = legacy,
   `extendedCases` = extended), `skills-cases.json`, `holdout-cases.json`,
   `discovery/cases.json`, and every question array in the four `protocol-history*.json` files.
   Writes `eval/routing-qa-overlap.json` with `writeFileAtomic`: `$comment`, the rule (tokenizer,
   threshold 0.8, "against all headline questions"), per-set counts, and per-set sorted lists of
   routing row ids. It records no QA id and no score. `--check` recomputes and exits 1 when the
   lists differ (not on input hashes, so an unrelated QA edit does not fail it).
   `npm run eval:routing:overlap` runs it.
2. `test/routing-qa-overlap.test.mjs`: runs the check in `npm test`; plus unit cases for the
   tokenizer and the threshold edge (0.8 included).
3. `eval/run-routing.mjs`: load the list and set `confirmationOnly: true` on each per-case result
   row whose id is listed, in every lane, and in the `--dump-ranked` output map's sibling (a
   top-level `confirmationOnly` id list in the dump). Aggregates are unchanged.
4. Docs: `eval/README.md` gets a "Confirmation-only rows" subsection (what the list is, the rule
   that no lane tunes on or reads per-row output of a listed row, and the regenerate command);
   `scripts/README.md` gets the generator row; `eval/EVALS.md` one line if it lists routing inputs.

**Part (b): the split amendment (agentpc, outside the repo, then the record).**

5. Committed record script `items/D2/amend-split.mjs` (run once by the executor). It:
   - asserts `sha256(v2) = 697c550a…ed12` and `sha256(results.json)` equals `results.sha256`;
   - reads the target hash from `exposed-row.sha256`;
   - scans `results.rows` reading only `caseInputSha256`, then `id` of the single match; asserts
     exactly one match;
   - asserts that id is in `sets.heldOut` exactly once and in no other set;
   - writes `~/backups/gca-2026-11-14-split-v3.json` (mode 600, refuses to overwrite): the v2
     object with the id removed from `heldOut` and appended to `tuning`, and `amended` extended
     with "; 2026-11-16: decision 2(b): one held-out case whose answer the orchestrator saw in the
     loop 2 read moved to tuning; identified by caseInputSha256 in
     heldout-2026-11-15/exposed-row.sha256";
   - prints only the three counts and the v3 SHA-256. It never prints an id, a question or any
     field of a row. v2 stays untouched.
6. `eval/qa/README.md`, "Held-out split": add the general rule — a held-out or reserve case whose
   content an agent or the orchestrator saw moves to tuning by a dated amendment (in the split's
   `amended` field and the round ledger), with no re-draw; record the new SHA-256.
7. `eval/qa/tuning-rows.mjs`: `TUNING_ROW_COUNT = 80`; replace each hard-coded baseline 79 with
   the constant (or `ids.length`); update the comments and the tests listed above.
8. `.agents/TODO.md`: held-out status → v3 path, SHA-256, 80/118/49, "moved to tuning on
   2026-11-16 (decision 2(b))"; delete "Settle the routing-row overlap…" (its done-when is met),
   and point 3.3's wait (wherever else it is cited) at the list. Loop 2 ledger: one dated line
   under the deviation saying the row moved, with the v3 SHA-256.
9. Round ledger row for D2.

## Gates

`npm run typecheck`, `npm test`, `npm run build`, `npm run eval:routing -- --gate`,
`npm run eval:selftest`, `npm run eval:qa:lint -- --stale --enforce-floors`,
`npm run eval:qa:register -- --check`, `npm run eval:routing:overlap -- --check`,
`npm run secrets:scan -- --tree`. All bare. Routing aggregates must be identical to `main`
(compare the gate printout before and after).

## Stop rule

Stop and report if: the v2 or results hash differs; the hash scan finds 0 or more than 1 row; the
id is not in `heldOut`; the routing aggregates change; a gate fails for a reason outside this diff.

## Risks

- Revealing membership. The list is computed against all 247 questions and holds no QA ids; the
  amendment output is counts and a hash. The moved id becomes a tuning id, which tuning lanes may
  read; that is decision 2(b).
- A future split read with v2 under the new code throws (79 ≠ 80). Intended: v3 is the split.
- The check in `npm test` fails when a golden question edit or a routing recompile changes a
  match; the fix is one command, named in the failure message.

## Needs from the orchestrator or owner

- The orchestrator: if the Mac holds a copy of the v2 split (or a held-out ids list derived from
  it), replace it with v3 from agentpc; a future held-out read uses v3's 118 held-out ids.
- No owner question.

## Reconciliation of the Fable review (REVIEW.md)

All findings adopted except where noted. These amend the steps above; where they differ, this
section wins.

1. **Adopted.** New `eval/lib/confirmation-only.mjs` loads the list and answers
   `isConfirmationOnly(set, id)`. `run-routing.mjs`, `run-protocol-history.mjs`,
   `discovery/run-discovery.mjs` and `discovery/run-replay.mjs` tag listed result rows
   `confirmationOnly: true` and print `confirmation-only` in place of the rank, top hit or hit/miss
   on each console line for a listed row. Aggregates still use every row.
2. **Adopted.** The `--dump-ranked` shape is unchanged; the README says a dump difference on a
   listed row is counted, never displayed. Step 3's dump change is dropped.
3. **Adopted.** Lookup keyed by set name. The helper throws when the list file is missing or when a
   listed id is absent from its set (stale list).
4. **Adopted.** `eval/agentic/sample.json` becomes its own set in the generator (12 of 30 today).
   One sentence each in `eval/agentic/README.md` and `eval/discovery/README.md`; the routing
   README says a new routing or discovery question set is added to the generator.
5. **Adopted.** One exported `TUNING_ROW_COUNT` (80) in `tuning-rows.mjs`; `scan-tuning-exposure.mjs`
   imports it and drops its private copy; baseline call sites use `ids.length`; tests build
   fixtures from the constant (including `test/corroboration-scan.test.mjs`); comments and the
   "(asserted 79)" text say "the tuning rows" with no number.
6. **Done by the lead, no orchestrator step needed.** The old match list is on agentpc
   (`~/backups/fd-2026-11-14/routing-matches.json`). A script that printed one number per set:
   0 of 73 old legacy ids and 0 of 26 old extended ids are missing from the new list.
7. **Adopted.** `amend-split.mjs` holds a pure function tested in `npm test` on synthetic data with
   poisoned getters (test file under `test/`, importing from the item folder is wrong, so the pure
   function lives in `eval/qa/split-amend.mjs` and the item script is a thin runner); a top-level
   catch prints one fixed line naming the failed check, never `error.message`; target validated
   `/^[a-f0-9]{64}$/`; results hash compared to the ledger constant and `results.sha256`;
   post-conditions: the sets partition the same 247 ids, counts 80/118/49, moved id present in
   `eval/qa/cases.json` by id; `--dry-run` first, then the lead reads the script before the one
   real run. Nobody opens, prints, `head`s or `jq`s any file under `~/backups`.
8. **Not needed.** `strata` is a number (41), the stratum count of the draw; no per-set counts.
   The `amended` text notes the strata describe the draw.
9. **Adopted.** Aggregate identity is proved by `cmp` of `--dump-ranked` from `main` and the
   branch, plus identical holdout gate counts.
10. **Adopted.** TODO held-out status: a done statement with the date; the stored held-out reads
    and their thresholds are on 119 rows and a future read pairs on v3's 118. Loop 2 ledger: one
    dated line at the ruling (lines 48-52) that the committed list replaces it, and one under the
    deviation that the row moved, with the v3 SHA-256.
11. **Adopted.** README wording: "moves to tuning by a dated amendment that writes a new split
    file and leaves the old one in place; a re-draw is a separate owner decision."
12. **Adopted.** No timestamp in the list; `--check` compares the whole serialized output; integer
    threshold `5 * intersection >= 4 * union`; the failure message names the set, the two counts
    and the regenerate command, never a question.
13. **Adopted.** The separate `--check` gate is dropped; the test in `npm test` is the gate. The
    `npm run eval:routing:overlap` script stays for regeneration.
14. No change (decision 2 fixes 0.8).
