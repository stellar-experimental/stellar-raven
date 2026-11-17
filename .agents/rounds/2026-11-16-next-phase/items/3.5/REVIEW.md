# Item 3.5 plan review

Reviewer: Claude Fable 5.2 (tier: Claude Fable, plan review), high effort, on agentpc in
`/home/tyler/code/raven-wt/np-3.5` at `d306a3ca`. Read-only. I did not run `npm run eval:routing`,
start a server, or open `eval/results/`, `eval/holdout-cases.json`, a split file or a stored run
(I listed two of those paths with `ls` to check they exist). Scratch: `tmp/3.5-review/re.mjs`.

## Facts checked

Correct as stated: the base commit (`HEAD` = `origin/main` = `d306a3ca`); the test's `toMatch` /
`not.toMatch` on `stdout + stderr`; `eval/self-test.mjs:60`; the re-baseline procedure (`run-evals`
section 6, no npm command); `identifierTokens` has one importer (`src/executor/providers.ts:82`),
and it reads only the query, never a row; the `micro-map` reference list (every file and line
number matches `git grep`); `src/catalog/README.md:22` against `src/mcp/tools.ts:55`; the
instructions pin (`npm run mcp:surface -- --json` gives `67a6bd0b…6c00` at base); the full surface
pin string (14 round records hold the same 64 hex); the ranked dump excludes holdout
(`eval/run-routing.mjs:475`); the holdout ceiling is 10 with 10 accepted (`eval/gates.json`).

Wrong or imprecise:

- "legacy, extended, skills and holdout per-case tables". Legacy, extended and skills print
  per-service aggregates (`tableRows`, `eval/lib/grade.mjs:150`). The per-case tables are holdout
  (`run-routing.mjs:541-549`) and protocol-history (`:557-565`). Finding 1 depends on this.
- "the two `Source Micro-Map` absence guards": there are three assertions in two files
  (`test/demo-prompt.test.ts:17-18`, `test/mcp-instructions.test.ts:115`) and a fourth guard,
  `not.toContain("MICRO_MAP")`, at `test/micro-map.test.mjs:44`.
- `10.SEP.2024` is listed as a new `[]` case. It already reads `[]` today (`.` is not a joiner).
- `gateEvidenceFailures` is lines 84-138. Only `evidence.notes` in `eval/gates.json` (line 53)
  holds `micro-map`; the top-level `note` does not.
- The surface gate assumes `npm run dev:eval` starts in this worktree. It does not yet (finding 9).

Not verified: the live surface pin at base (no server allowed here), and "about 2 minutes" for the
spawn test (`run-evals` section 3 says the routing gate takes seconds).

## Findings

### Step 1

1. **Blocking. The new test hands the raw output to an assertion, and its pattern cannot be
   checked.** The plan says "No assertion receives the raw output" and then "asserts that the raw
   output holds case rows (`/\bq-[a-z0-9-]+/`)". `expect(raw).toMatch(...)` prints `raw` when it
   fails, which is deviation D7 again. It can fail: the only per-case ids in the output are holdout
   ids, whose shape nobody in this item may read, and protocol-history ids, which start `ph-`
   (`eval/protocol-history-cases.json`).
   Fix: `gate()` returns derived values only, for example
   `{ status, failures, rawHasPerCaseTable }`, where the boolean tests fixed runner text
   (`/holdout lane — \d+ FROZEN/` and the `┌` of `console.table`). Assert
   `rawHasPerCaseTable === true` and that no line of `failures` holds `│` or `┌`. Never return the
   string from `gate()`.

2. **Should-fix. The test asserts a re-baseline pointer on a path the plan gives none.** The test
   forces the variant-manifest mismatch; step 1 says that message "gets no re-baseline pointer". The
   committed-input mismatch (the D7 path) cannot be forced by a spawn: `GATES` and the input paths
   are constants (`run-routing.mjs:69-82`), and the script has no import guard.
   Fix: move `gateEvidenceFailures` to `eval/lib/gate-evidence.mjs` as a pure function
   (`gateConfig`, `repo`, `manifestPath`) and unit-test both messages with a temp directory and a
   wrong hash, no spawn. `eval/self-test.mjs` imports the same pointer constant. The spawn test
   then proves only "no per-case row", on the variant path.

3. **Should-fix. The pointer sends the reader to the command that prints the rows.**
   `npm run eval:routing -- --gate` prints the holdout per-case table on every run, pass or fail.
   That is also CI's step (`.github/workflows/ci.yml:110`), so a lane that reads a failed CI log
   meets the same rows. This answers brief check 2: no other test in `npm test` touches holdout
   (`git grep holdout -- test` is empty); the runner itself is the other path.
   Fix, in scope: the pointer says "run `npm run eval:routing -- --gate > <file>` and read totals
   with `jq`". Beyond scope, so ask the orchestrator or record it in the TODO: under `--gate`, print
   the holdout aggregate only and leave the rows in the results file (they are already there).

4. **Nit.** (a) A `run-routing failed:` line can carry a holdout id and card
   (`run-routing.mjs:322`); the projection passes it. Record it as a known residual. (b) A crash
   with no verdict gives an empty projection and a bare `expected 1 to be 0`; add one fallback
   line, "runner exited N without a gate verdict". (c) Put the new assertions on the existing
   variant spawn; a third runner run buys nothing. (d) Rewrite `gate()` before the first run of the
   file, so a half-edited test cannot print the output.

### Step 2

5. **Should-fix. `ARCHITECTURE.md:215` states the token rule and is not in the plan.** It says "not
   followed by a dash or dot and another digit". Add the preceding half with `2024-SEP-10` as the
   example. The module comment alone leaves the architecture text stale.

6. **Should-fix. Some all-capitals dates still read; pin them and say so.** I ran both regexes
   (`node tmp/3.5-review/re.mjs`). The rule is correct for the TODO's two dates and is a shape
   rule. It also closes `10-SEP-24`, which today reads `sep-24` and can mark the real SEP-24: add
   that case to both test files. Still read after the change:

   | Input | Reads | Effect |
   |---|---|---|
   | `SEP 10, 2024` | `sep-10` | can mark `sep-0010` exact |
   | `10 SEP 2024`, `in SEP 2024` | `sep-2024` | no such document |
   | `2024/SEP-10` | `sep-10` | can mark `sep-0010` exact |

   No shape separates `10 SEP 2024` from `CAP 46 SEP 45`, so leave them. Pin them as "known and
   accepted" (as the test did for `10-SEP-2024`), name them in the module comment, and have the
   commit say the gap is closed for dates joined by `-` or `.` only.

7. **Nit. Real identifiers the rule drops.** `CAP-46-SEP-45` reads `cap-46` only;
   `protocol-23-cap-67`, `ERC-20-SEP-41`, `1.SEP-10` (no space) and `step 3-SEP-10` lose the second
   token. The cost is a missed exact mark, never a false one, so the rule is safe. Pin
   `CAP-46-SEP-45` as `["cap-46"]` so the asymmetry is recorded. Replace `10.SEP.2024` with
   `10.SEP-2024`, which does exercise the dot branch.

8. **Nit. The differential test is sound; keep it independent.** Over 129,600 strings (the test's
   corpus times twelve prefixes), the new regex equals the loop 1 matcher minus the matches whose
   preceding text ends in a digit and `-` or `.`: 0 mismatches, 13,500 dropped. Compute the third
   class from `match.index` and `text.slice(0, index)`, not with the new lookbehind, or the test
   checks the rule against itself. Assert that each excluded class drops at least one token.

9. **Should-fix. The replay gate's `cmp` can drop step 2 on upstream noise.** The report holds
   live fields (`rows`, `top3`, `ok`, `errorKind`); a 429 that outlasts three waits or an index
   change between runs makes a non-date row differ, and the stop rule then reverts a correct
   change. Loop 2 did get byte-identical files (`STEP-3-IMPL.md:376`), so `cmp` is a fine first
   check. On a difference, decide by what step 2 can move:
   - compare `exactRows`, `exactUrls` and `ledgerExact` per `row` and `query`;
   - run the old and new `identifierTokens` over the base report's `query` strings. Equal tokens
     mean equal exact rows for the same data, with no network.

   Also: run the base replay just before the step 2 edit, not at step 0 (step 1 touches no `src/`
   file, and the plan's own "back to back" needs it); and `replay-{base,head}.json` does not
   brace-expand in an assignment, so write two commands. Both input files exist. The gate is
   otherwise runnable as written from the worktree root; about three minutes a run.

10. **Nit. Routing cannot move, and the orchestrator's note says it can.** Confirmed: neither
    `src/catalog/` nor `eval/run-routing.mjs` imports the token module. Keep the routing gate and
    the Fable read (the note binds), but say this in REPORT.md so the orchestrator knows the
    per-case routing read will be an empty diff. Treat any total or dump difference as a stop, with
    no hit-to-miss analysis: nothing in the PR can cause one.

### Step 3

11. **Should-fix. `surface-text` names more than the files emit.** In this repo "surface" is the
    whole served MCP surface: `surfaceSha256`, `npm run mcp:surface`, `report-live-surface`.
    `src/mcp/surface-text.ts` would hold two fragments of one description, while the instructions
    and both descriptions stay authored in `src/mcp/tools.ts`. The generator's other output, the
    guard sentence, is not surface text at all: it rides in `execute` results
    (`src/policy/evidence-checkpoint.ts:83`). And `npm run surface-text:build` would sit beside
    `npm run mcp:surface`.
    Proposed: `family-text`. Every output is derived from `scripts/catalog-data/source-families.mjs`:
    the family line, the opening that lists the families, the guard that names the corroborating
    families, and their ids. So `scripts/build-family-text.mjs`, `src/mcp/family-text.ts`,
    `test/family-text.test.mjs`, `npm run family-text:build`, `buildFamilyText`,
    `FAMILY_TEXT_PATH`. No tracked file uses the stem. This is a taste call and the lead's to make;
    a second rename later would cost more than choosing now.

12. **Should-fix. The surface gate is not runnable as written.**
    - `npm run dev:eval` refuses a dirty tree, untracked files included
      (`scripts/run-eval-server.mjs:18-21`). `items/3.5/` is untracked, and EXEC.md is written
      during the run. Commit the round files first and write EXEC.md after the server stops.
    - The worktree has no `.dev.vars` and no `env.d.ts`. `npm run typecheck` fails until both
      exist (`AGENTS.md`, "Fresh clone"), and the live check needs
      `DEV_ALLOW_UNAUTHENTICATED=true`. Add a setup line to step 0.
    - Launch as `run-evals` section 5 says (`hc run --bg --name … npm run dev:eval -- --port <port>`,
      then `hc wait … --output Ready`), with a named free port. `AGENTS.md` forbids a second
      Wrangler process; if another lane's server is up on agentpc, say why this one is needed (it
      must serve this worktree) or ask.
    - Cheaper first check, no server: `npm run mcp:surface -- --json` at base and head. Base gives
      `surfaceSha256` `815333b7…bd07` and instructions `67a6bd0b…6c00` today. The in-process value
      differs from the live pin by design; `STEP-2-IMPL.md:389` used the same pair. If both match,
      one live run at head against `42ec6102…f17f` satisfies the TODO's wording.

13. **Should-fix. The surface pin does not cover the guard sentence.** `surfaceSha256` hashes the
    instructions and `tools/list`. `CORROBORATION_GUARD` and `CORROBORATING_FAMILY_IDS` reach the
    model in results, so the pin cannot see them move. Add to "Done when":
    `git diff -M d306a3ca HEAD -- src/mcp src/policy/corroboration.ts` changes one line in each
    generated file, the header. Quote it in EXEC.md beside the two hashes.

14. **Nit. The grep check will not come back as the plan describes.** List the expected residue:
    `research/`, `.agents/rounds/`, `plugins/openai/VERIFICATION.md:257`, `eval/gates.json:53`,
    `test/demo-prompt.test.ts:17-18`, `test/mcp-instructions.test.ts:115`, and the `MICRO_MAP`
    guard in the renamed test. Anything else is a miss. Add `git ls-files | grep -i micro` for
    paths; `git grep` reads contents only. `eval/gates.json` is a live file with a dated note; say
    in EXEC.md that it stays for that reason. The reference list itself is complete: CI path list,
    refresh workflow, generated headers, the `.d.mts`, the skill and the docs are all in it.

### Gates and stop rules

15. **Nit.** They match the orchestrator note: totals against `main`, holdout as counts with
    `forbiddenCaptures` ≤ 10, a drop with a TODO record and no re-baseline, deploy only on a byte
    change, no model call. Three small gaps:
    - Step 0 says "the results JSON it names" and "do not read the log". Take the path with
      `tail -n 1` of the log, and record the exit status.
    - Build the base bundle at step 0, before any commit. If step 2 is dropped, the rename may
      still change bundle bytes through module path comments (not verified); say in REPORT.md that
      such a change carries no behaviour.
    - "Delete the 3.5 TODO items … in their own commits" reads two ways. Delete each item in the
      commit that lands its step, so a dropped step 2 keeps its item with the reason.

## Verdict

Revise before execution: finding 1 blocks, and findings 2, 3, 5, 6, 9, 11, 12 and 13 should be
folded into the plan; the four changes and their order are right.
