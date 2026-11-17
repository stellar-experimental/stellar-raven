# Item 3.3 execution

Executor: Claude Sonnet 5.5, 2026-11-17, worktree `np-3.3`, branch `np/3.3-ranker-mechanisms`. Numbers
and verdicts are in [MEASURE.md](MEASURE.md). Result: neither mechanism passes, so nothing ships. The
item branch carries the records, the two patches and the TODO edit. Nothing was pushed.

## What I did, per step

1. **Base commit** `8d42de37`: this folder's plan, review, question, probe queries, instruments and
   briefs. Base measurement: `npm run eval:routing -- --gate` exit 0, results
   `routing-2026-11-17T10-00-37-746Z.json`; `measure.mts` reproduced the plan's base cells exactly
   (probe 0, 1, 3 and SDF 2, 2, 4; off-golden 8, 8, 10 and 14, 16, 18; FAM 55, 58, 63; both effect
   targets "not met"). The FAM file's SHA-256 started `0246ad022163`.
2. **Prefix floor** on `np/3.3-prefix-floor` (commit `0c2e43b9`): the two lines from the plan, in
   `src/catalog/vendor/search-scoring.ts` and `src/catalog/scoring.ts`. `npm test`, the routing gate
   and the measurement ran once. Rules 1, 2, 5 and 6 failed, so I added no tests or docs and saved the
   diff as `prefix-floor.patch`.
3. **Slot keeping** on `np/3.3-slot-keeping` (commit `013592d1`): the block from the plan in
   `searchCatalogPage`, no other change. Same sequence. Rules 1 and 4 failed, so no tests or
   docs; the diff is `slot-keeping.patch`.
4. **Decision:** none passes, so the item branch carries only the records and the patches. No
   combination run.
5. **Re-baseline:** nothing shipped, so `eval/gates.json` and the round ledger are untouched.
6. **Records:** `MEASURE.md`, this file, the `.agents/TODO.md` stellar.org item (each mechanism's
   result, both dropped, the round plan's metric named as cause 1, the 2026-10-02 floor-3 failure next
   to the prefix result). The prefix floor did not ship, so the short-token TODO item and `cs-001` are
   unchanged and `improvements:lint` was not needed.

## Failing existing tests (names only, no output)

Prefix floor, 24 failing and 3695 passing (base: 0 failing). Classified under rule 6: 20 losses, 3 re-pins and the gate-run test.

- Losses, asserting the membership, rank or tier of a named card:
  - `test/drift-141-routing.test.ts`: all seven (`applies the vocabulary rule to another directory
    field`, `keeps account-merge documentation above hackathonBrief`, `keeps a negated source modifier
    from rejecting stablecoin discovery`, `keeps controlled vocabulary visible: ecosystem project
    category filter`, `keeps mixed implementation intent out of RWA discovery`, `keeps the eight
    attributed rows clean`, `keeps the full-page total tied to the gated pool after a targeted
    admission`);
  - `test/search.test.ts`: `routes "soroban defi projects" to project-search operations`,
    `interleaves a backfill hit when the cross-tier margin is met`, `permits one evidence-backed
    full-page replacement without expanding total`, `keeps the SEP-6 page truthful after admission and
    replacement`, `reports an absolute gap with tier context when gated order leads a higher score`,
    `uses canonical Lumenloop lanes for the production-shaped Tomer Weller query`, `stays silent for
    multi-token gated and mixed pages and skill-only pages, and honors service filters`;
  - `test/skill-search-admission.test.ts`: `keeps exact short capabilities and named skill
    abbreviations`;
  - `test/search-resolution.test.ts`: `keeps wider candidates identical`;
  - `test/server.test.ts`: `keeps hit-aware guidance on all-backfill pages with wider candidates`,
    `keeps nextSteps inside its bound on every kind of successful page`, `search logs the shared
    privacy-bounded page telemetry shape` (`test/executor-providers.test.ts`) and `logs
    privacy-bounded search page facts and honest invalid-filter semantics` (`test/server.test.ts`).
    The last two fail on `truncated` flipping and on the rank order of `widerCandidateTop`, the same
    order change as `keeps wider candidates identical` (follow-up 1, finding 3).
- Re-pins, pinned numbers or rendered text:
  - `test/scoring.test.ts`: `preserves the SAC entry's stronger ungated score` (the plan names the
    812 pin);
  - `test/demo-page.test.ts`: `sample hits/scores/total match the live engine on the current catalog`;
  - `test/server.test.ts`: `keeps the search-to-execute trace example in sync with the current scorer`;
- The gate run: `test/run-routing-manifest-evidence.test.mjs` `passes --gate when the selected manifest
  is the committed manifest` fails because `eval:routing --gate` exits 1 (rule 1 again), not as a
  separate loss.

Slot keeping, 4 failing and 3714 passing:

- Three re-pins, so rule 6 passes: `keeps pages without targeted replacements entirely in tier 1` and
  `permits one evidence-backed full-page replacement without expanding total` (both named by the
  plan), and `returns SearchHit-shaped hits, ranked by score desc then id asc`, which asserts the
  score order the in-place swap breaks (the invariant the mechanism removes; follow-up 1, finding 4).
- The gate run, as above.

## Deviations and notes

- **Stub `.dev.vars` came late.** The worktree had no `.dev.vars` or `env.d.ts`, so the first
  `npm run typecheck` on the slot-keeping branch failed on missing `Env` members. I wrote the CI stub
  (`.github/workflows/ci.yml` names only, value `x`), ran `npm run typegen` (both files are untracked
  and ignored) and then ran `typecheck` and `npm test` on the base and on both measurement branches.
  The routing gates and the measurements ran before the stub existed; they do not read `Env`. The
  second test runs gave the same failing sets as the first (24 and 4). I did not re-run any gate or
  measurement.
- **No implementation fix** was needed before reading the numbers, and no variant was run.
- **Typecheck.** Exit 0 on the base and on both measurement branches once typegen had run.
- **Gates on the item branch.** It carries no source change, so `npm run test:smoke` was not run
  (`src/executor` and `src/demo` are untouched). The routing gate on the item branch is the base run
  above. Other gates are listed below.
- **`briefs/CASE-REVIEW-BRIEF.md`** appeared untracked after the base commit (the lead's file). I left
  it out of my commits.
- **Reading discipline.** I read holdout output only through `compare-routing.mjs` counts and the
  `GATE` section. I opened no `eval/results/*.json`, holdout case row, QA corpus file, `eval/qa/cases.json`
  row or split file, and no FAM confirmation file. `measure.mts` alone read the FAM development file.

## Gates on the item branch

On the item branch with the records, patches and TODO edit (no source change), each run bare:
`npm run typecheck` exit 0; `npm test` exit 0 (3718 passed, 3 expected fail, 5 skipped);
`npm run build` exit 0; `npm run secrets:scan -- --tree` exit 0 (clean). `eval:routing --gate`
is the base run above (exit 0); `test:smoke`, `eval:selftest` and `improvements:lint` were not needed.

## For the lead

- Both mechanisms fail the fixed pass rule on the first measurement; no deploy and no production
  checks follow, so `REPORT.md` needs none.
- Out of scope, raised as the plan said: moving the FAM development rows into `eval/discovery/`
  stays owed under the TODO item (it changes the routing set and needs its own gate run); the
  `src/catalog/README.md` line that says the public `search` default is 5 (the code says 7) goes to
  item 3.5.
- The prefix floor does lift FAM development reach and the `org` spot pages, at the cost of legacy
  and extended rows. The stop rule forbids a variant, so it is only recorded.
