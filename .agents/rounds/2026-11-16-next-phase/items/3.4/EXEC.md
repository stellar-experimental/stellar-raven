# Item 3.4 execution record

Executor: Claude Sonnet 5.5 (agentpc, worktree `/home/tyler/code/raven-wt/np-3.4`, branch
`np/3.4-execute-boundary-read`, base `41300519`). Lead: Claude Opus 5.5 (`t1sp`). Result:
[RESULT.md](RESULT.md). Plan that binds: [PLAN.md](PLAN.md). USD 0; no model call, no network, no
local server, no subagent.

## Outcome

**R(16,000) = 32 of 44 exposed rows: many. The boundary stays 6,000 and M2's boundary question
closes. Step 11 did not run and nothing in `src/`, `wrangler.jsonc`, tests or `ARCHITECTURE.md`
changed.** The Codex review is not needed (no boundary change; the orchestrator note: a
record-only result needs no review beyond the plan review). R(18,000) = 30 of 38; the Grok clip
read finds a cited fact lost on 23 of 38 exposed rows. The recount is 0 in all three classes on
both runs.

## What I did, by step

1. **Selector.** `select-tuning.mjs` committed. It read the 15 run files, selected by id with
   `selectById` against a constant table of expected counts (all 15 matched), wrote tuning rows
   only to `tmp/sel/` (git-ignored), and printed each file's SHA-256 (in RESULT.md). A second
   run is byte-identical. Nothing printed an id of a non-tuning row. Nothing was written in, or
   run by git in, `gca-eval`. I did not open any other file there.
2. **Read script.** `read-boundary.mjs` committed. It reproduces the review's size figures
   exactly (939 results, 7 failed with the longest 683 characters, 66 truncated, 146/141/44 over
   16,000, 119/116/38 over 18,000, 9.85% and 396 tokens per unit at 16,000, 6.58% and 265 at
   18,000), and the review's Grok fit table (0 of 146 over the clip at 16,000; 79 to 100 of 119 at
   18,000).
3. to 5. **Matching, kept corpus, candidates.** Implemented as the plan words them. Candidate
   counts: 854 past 16,000 (706 tail-side, 226 answer-side, 14 chained), 522 past 18,000, 366
   under the Grok clip.
6. **Confirmation.** I read candidates in context and classed them (`classes.json`, 291 entries).
7. **Control.** Not run; see Deviations.
8. **Grok clip.** Done as written; the table and R are in RESULT.md.
9. **Stop rule.** Applied after the counts, unchanged: R(16,000) = 32 ≥ 3, so keep 6,000 and close
   M2 ("many"). The floor (30 exposed rows) holds (44).
10. **Recount.** 0 `data.sections` misreads (of 26 and 19), 0 `.data` omissions, 0 failed calls
    with an omitted reason (of 4 and 8 scripts with a failed call). Surface stamps: the baseline
    `2026-11-14T20-13-51` is on `66301389`; the shipped `2026-11-15T07-33-40` is on `bd9719fb`
    (surface `42ec6102…`). Both taken from the committed ledgers; the selector keeps no run
    `meta`.
12. **Records.** RESULT.md and the TODO edit. The round ledger row is yours.

## Gates (each bare, in the worktree)

| Gate | Result |
|---|---|
| `npm run typecheck` | exit 0, after the stub below |
| `npm test` | exit 0: 167 files passed, 5 skipped; 3718 tests passed, 3 expected fail, 5 skipped |
| `npm run build` | exit 0 (dry run; `EXECUTE_MODEL_BOUNDARY_MAX_TOKENS` `"6000"`) |
| `npm run secrets:scan -- --tree` | exit 0, clean. It scans tracked files, so the commit hook is the scan of the new files. |
| `npm run test:smoke` | not run: nothing under `src/executor` or `src/demo` changed |

A fresh worktree had no `.dev.vars` or `env.d.ts`, so the first `typecheck` failed on `OAUTH_KV`.
I created the stub `.dev.vars` (names only, value `x`, the CI step's content) and ran
`npm run typegen`, as `AGENTS.md` says. Both files and `tmp/` are git-ignored and stay in the
worktree. `npm run build` ran `prebuild` and left no tracked change.

## Deviations and judgement calls

1. **Reading stops at the unit.** The plan says to read every past-the-cut candidate. With 854
   candidates (620 of them ordinary words that occur in the answer and in a tail), I read each
   (run, row) until I found one `cited` or `chained` candidate, then moved on; a unit with none
   has every candidate classified. R and the unit counts are unaffected by what I did not read,
   because they count units and rows with at least one. The classified candidates are 117, 90 and
   84; the rest are unread. RESULT.md says so. The cost of the shortcut: no per-candidate class
   count for the unread ones.
2. **Control (step 7) not run.** It exists to refuse a script zero. R is 32, and a hand read
   could only raise it, so it cannot change the stop rule's outcome. Say if you want it anyway;
   it is a 12-unit read of run `2026-11-15T07-33-40`.
3. **Two extra aids in `read-boundary.mjs`, flags only.** `in-script` (the model's own scripts
   contain the candidate) and `in-earlier-script` (a chained literal an earlier script held).
   They changed no rule or threshold; I used them to class one echoed query and one literal as
   `incidental`.
4. **An extra committed file, `classes.json`.** `read-boundary.mjs --classes` needs it to
   reproduce R. Classes read at 16,000 carry to 18,000 and the Grok clip when the same candidate
   is past that cut in the same unit; the rest of those two cuts I read separately.
5. **Class `search-card` did not occur** (search results are not stored, so none could be
   confirmed). Static text for the kept corpus is the source slice of `src/mcp/tools.ts`; the
   generated `SEARCH_OPENING` and `FAMILY_LINE` are inside it unexpanded.
6. **Borderline classes.** A few ordinary-word candidates I classed `cited` because the answer
   repeats a sentence or phrase the tail holds (`services`, `showcases`, `currently`,
   `incubation`, `third-party`). Where the tie was weaker I classed `incidental`
   (`contribution`, `announced`, `non-custodial`). Under the Grok clip I classed host-guidance
   wording (`stellar docs`, `statement`, `anything`) `incidental`: it changes behavior, not a
   cited source fact. None of these sets R(16,000): 30 of the 32 positive rows hold a code, date,
   number or version fact, and the other two (`q-hot-sdf-xlm-holdings-sales`,
   `q-eco-defi-market-map`) rest on a source link and a venue name. R(16,000) is at least 30
   without them, and the rule needs 3.
7. **M2 in the TODO is reduced, not deleted.** The plan allows either; the boundary question is
   closed, but the Grok-clip bounding candidate and the "done when" for the clip are still open
   and item 4.1 reads them, so I kept a short residue and put the recount there. Delete it if you
   would rather track the clip only under round item 4.1.
8. **The item 3.4 folder was untracked at the start** (PLAN.md, REVIEW.md and the briefs are
   yours). I committed the whole folder so RESULT.md's links resolve. Drop the briefs from the
   commit if you prefer.

## For the lead

- Production check: none, nothing deploys.
- Round ledger row: item 3.4 closes with "keep 6,000; R(16,000) = 32 of 44 rows; recount 0, 0,
  0". The 4,500 candidate is dropped on the Grok fit table.
- Item 4.1 can use the Grok clip numbers in RESULT.md (119 of 939 stored results over 20,000
  bytes; the clip loses a cited fact on 23 of 38 exposed rows).
