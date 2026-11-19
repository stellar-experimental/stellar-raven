# Item 8.9 lane `tests`: independent review

Reviewer: Antigravity (Claude Opus 5.5, high effort), started as the completion-gate reviewer.
Scope: `git diff origin/main...HEAD` on `np/8.9-tests` (`0182e288`, merge-base `6f0bf84b`), 41 files.
Read: `AGENTS.md`, `orch/8.9-LANES.md` § `tests`, `INVENTORY.md`, the full diff, every named guard at
its cited location (on `origin/main` for pre-change line numbers, on HEAD for the post-change text),
and the production code each removed test reached (`buildScout`, `assertRunQaCliSyntax`/`main`,
`buildTranscriptEvidencePack`, `stopWrangler`, `build-super-spec.mjs`, `validate-paired-verdict.mjs`).

## Verdict

**REQUEST CHANGES.** One High finding, H1: the lane deleted four opt-in measurement instruments for a
reason that is not true. They are env-gated (`describe.skipIf`), not "unconditionally `describe.skip`",
and one of them was a no-regression gate in this round. Fix H1 and correct the INVENTORY
citations listed under Medium. The rest of the change is sound:

- Every speedup holds up.
- The `stopWrangler` fix is correct.
- No security, exposure, secrets, case-text or billing guard was weakened.
- The suite is green and stable under load. Results:
  - `npm test`: 172 files (171 passed, 1 skipped). 4,143 tests: 4,139 passed, 3 expected fail,
    1 skipped. 17.5 s.
  - The 17 changed or concurrent files passed 5 of 5 back-to-back runs (704 tests each).
  - The timing-sensitive files (`playground-transport`, `qa-postflight-keepalive`,
    `demo-gauntlet-cli`) passed 3 of 3 runs while a full `vitest run` loaded the CPU.
  - The working tree stayed clean afterwards and the runs left no fixture directories in `/tmp`.

## Guard verification (every INVENTORY row)

Legend: ✅ the guard exists and covers the removed behavior · ⚠️ covered, but the citation or
description is wrong, or the coverage is slightly weaker · ❌ no equivalent guard; owner decision needed.

| INVENTORY row | Result | Evidence |
| --- | --- | --- |
| §1 `replay-detail-hint.test.ts` | ❌ | `describe.skipIf(!SPLIT \|\| !RESULTS)`, not unconditional. An offline replay of stored tuning executes through `evidenceRecoveryHint`. None of the named unit tests replays stored transcripts. See H1. |
| §1 `replay-exact-rows.test.ts` | ❌ | `describe.skipIf(!SPLIT \|\| !RESULTS \|\| !LIVE)`. Item 3.5 used it this round as its exact-row no-regression gate (`items/3.5/PLAN.md:155`, `items/3.5/EXEC.md:78-87`, `REPORT.md:26`). See H1. |
| §1 `replay-guard.test.ts` | ❌ | `describe.skipIf`. A replay of the corroboration guard over stored runs. The unit guards check block text, not stored-run byte equality. See H1. |
| §1 `search-page-size.test.ts` | ❌ | `describe.skipIf(!OUT)`. The page-size measurement instrument behind `STEP-2-IMPL.md:202`. `server.test.ts`/`search.test.ts` do not measure bytes per limit. See H1. |
| §2 `blind-packets.test.mjs` excluded via `research/**` | ✅ | It is the only test file under `research/` (`git ls-files research`). No `src/`, `scripts/`, `eval/` or `test/` file imports the audit folder. The exclusion is at `vitest.config.ts:21`; INVENTORY cites `:6-11`. |
| §2 `playground-finals-decision.test.mjs` | ✅ | Its only import is `research/.../decision.mjs`, which has no live importer. |
| §2 `playground-final-orchestrator.test.mjs` | ⚠️ | The migration is complete and slightly stronger. The 11 original `partialRecoverySource` rejections are kept, plus `other-client-error`, which carries over the error-text-independence assertion, and a new accept test. `diagnosticAnswerProblem` gets explicit expected values for all 10 synthetic rows. `verifySourceCases({ selectedIds })` covers the full match, the omitted mismatch, a reorder and a non-prefix (`re-judge.test.ts:925-962`). However, the named guard `test/playground-artifact-contract.test.mjs` does not exist. The real file is `test/playground-eval-contract.test.ts`. See L3. |
| §3 `check-pin-review-cli.test.mjs` merged | ✅ | All unique assertions are kept in `check-pin-review.test.ts:99-104,178-222`: the stdout text, the owner/repo/path moves, `[MISSING FROM LEDGER]`, the stderr token, `[recorded]` and the blob retarget. `baseManifest()` now carries owner/repo/path, and the `beforeAll` base commit includes them. |
| §3 `stellar-org-guard.test.ts` merged | ✅ | `corroboration-guard.test.ts:137-142` matches the deleted assertion. Its `sectionOf` is the same `candidateEvidenceSection` call. `stellarDocs.search_docs` is covered at `:121-129`. |
| §3 `routing-evidence.test.ts` split | ⚠️ | `tokensOverlap`, "phase/has", repeated evidence and the three extraction tests moved verbatim. The dropped L56-74 is "requires one coherent phrase for routing-only admission", not "repeated evidence tokens and useWhen cap" as INVENTORY says. `scoring.test.ts` "rescues…" and "does not rescue…incoherent" cover it, except the partial-coverage positive case. See L2. |
| §4 `exact-evidence.test.ts:44-46` | ⚠️ | Not meaningless. `SENTENCE` is pinned to production by `:24-35`, so this test constrained the production text transitively. It was the only no-status-claim check. See L4. |
| §4 `evidence-checkpoint.test.ts:132-135` | ⚠️ | Same pattern as the row above: the only "no case vocabulary, under 400 chars" check on the frozen detail sentence. See L4. |
| §4 `evidence-checkpoint.test.ts:10-19` | ✅ | `corroboration-guard.test.ts:38-43` checks the full literal `BLOCK_BEFORE_GUARD` (`:23-24`), `undefined`, `0` and `suppressed`. |
| §4 `evidence-pack-per-operation.test.mjs:625-636` | ⚠️ | Misdescribed. The removed test pinned the freshness tags of the six `largeTranscriptCorrectControls`, not `beansSourceBasisFixture`. The named guard `:638-679` tests indexer and prose omissions and does not run `buildTranscriptEvidencePack` on beans. The real residual guard: the bounded-control test fails if a control drifts to `stable` (empty pack against `requiredPackTerms`). A live→scheduled tag drift is no longer pinned. See M2. |
| §4 `evidence-pack-per-operation.test.mjs:865-877` | ⚠️ | Not an exact duplicate, but covered. `:544-562` catches the 54-versus-540 bug through `transcriptSupportedTerms: 0`. The removed test caught it through `transcriptSupportedTerms: 1` plus `status`. |
| §4 `evidence-pack-per-operation.test.mjs:945-951` | ✅ | `claim-support` "keeps stable rows without a pack" now goes through `explainTranscriptEvidencePack` only, but `buildTranscriptEvidencePack` is `return explainTranscriptEvidencePack(input).text` (`eval/qa/evidence-pack.mjs:2829-2831`). The new parity test pins that wrapper. |
| §4 `qa-verdict-consistency.test.mjs:868-881` | ✅ | `:798-811` now asserts `score: "correct"` too. |
| §4 `qa-verdict-consistency.test.mjs:901-927` | ✅ | The `[2]` case in the `:883-899` loop (score/error/violation/`[]`) and `:517-540` (direct out-of-range `[3]`) cover it. Only the `score: "wrong"` combination is lost, which does not matter. |
| §4 `search.test.ts:477-479` | ✅ | The module `beforeAll` (`:42-44`) runs `loadManifest` on the real manifest; a throw there fails the whole file. |
| §4 `search.test.ts:798-807` | ✅ | Merged into `:787-794`, which still asserts that operations with `routingExclusions` exist and checks every operation ID at `limit: 1`. |
| §4 `search.test.ts:809-831` trim (7 to 3) | ✅ | Same path and target; judgment call accepted. |
| §4 `search.test.ts:1687-1741` trim | ✅ | All runnable and retired-runner queries kept. Broad, section and backfill pages kept. |
| §4 `drift-141-routing.test.ts:81-85` | ✅ | The `:24-61` row has the same query and a single-element alternative list, so the assertion is identical. |
| §4 `drift-141-routing.test.ts:88` | ✅ | `search.test.ts:605-618`: the same query at `limit: 5`, plus quota assertions. |
| §4 `drift-141-routing.test.ts:256-259` | ✅ | The all-operations exact-ID loop (`search.test.ts:787-794`). |
| §4 `drift-141-routing.test.ts:261-272` | ✅ | `search.test.ts:1011-1028` asserts that the backfill equals `[get_categories]` (stronger than `toContainEqual`), `total: 7` and `truncated`. |
| §4 `stellar-org-adapter.test.ts:566-571` | ✅ | The redirect table at `:377-390` (row `:384`) asserts `calls` length 1 and status 307. |
| §4 `stellar-org-adapter.test.ts:573-582` | ✅ | `/API`, `/API/search` and `/Api/search` are in the `:293-318` table, which asserts that `normalizeSitePath` returns `null`, an error, and **zero** requests. |
| §4 `stellar-org-adapter.test.ts:595-611` | ✅ | The 1.9 MB table (`:591-607`) runs `comment`, `tag body` and `title`-in-head through `callStellarOrg`, the same `mainHtml`/`htmlToText` path. The post-main `<title` case is kept (`:584-589`). |
| §4 `check-skills-drift-cli.test.mjs:130-141` | ✅ | `stellar-community.test.mjs:88-96` covers all three shapes plus a fourth. One CLI spawn keeps the wiring. |
| §4 `qa-harness-preconditions.test.mjs:857-888` | ✅ | `main()` calls `assertRunQaCliSyntax(args)` as its first statement (`eval/qa/run-qa.mjs:1773-1774`), so every flag shares one path before any paid call. The in-process table covers all 13 flags, and 2 CLI spawns prove the wiring with `paidCalls() == []`. |
| §4 `identifier-token.test.ts:60-95` | ⚠️ | The differential still hits every drop class. The bare sentence-final `.` tail is gone, and no unit test pins `SEP-24.` at end of text. INVENTORY also names the counters `lowercase/numeric/short`; the code uses `titleCase/longDigits/afterNumber`. See L1. |
| §4 `qa-paired-verdict.test.mjs:1293-1307` | ⚠️ | The rationale is wrong. See M1. |

## Findings

### Critical

None.

### High

**H1. Four env-gated measurement instruments were deleted on a false premise, with no equivalent
guard and no owner decision.**
- Files: deleted `test/replay-exact-rows.test.ts`, `test/replay-guard.test.ts`,
  `test/replay-detail-hint.test.ts`, `test/search-page-size.test.ts`; the claim is at
  `INVENTORY.md:17-24`.
- **The premise is false.** INVENTORY:17 says all four "use `describe.skip` / `it.skip`
  unconditionally" and were one-off tools from finished tuning loops. In fact, each is
  `describe.skipIf(<env unset>)`. Each is an opt-in, model-free replay or measurement, run as
  `RAVEN_REPLAY_*=… npx vitest run <file>`.
- **The tools are still in use.**
  - `replay-exact-rows` was item 3.5's exact-row no-regression gate for its `identifierTokens`
    change, in this round (`items/3.5/EXEC.md:78-87`: "98-call exact-row replay is byte-identical").
  - Item D2 (#455) and items 3.2/7.3 (#462, #482) kept these files current within the last few
    weeks.
- **The named guards do not cover them.** The "remaining guards" (`exact-evidence`,
  `identifier-token`, `corroboration-guard`, `server.test.ts`, …) are unit tests over synthetic
  inputs. None replays stored tuning transcripts or live Scout research, and none measures page
  bytes per limit. AGENTS.md "Cut what adds no visibility": *"Name a guard nobody else covers and
  let the owner decide."*
- **There is no runtime win.** These files skip under `npm test`; the only cost is collection
  (about 0.1-0.3 s each).
- **Fix.** Restore the four files, or move them to an opt-in location outside the `npm test`
  include (for example `scripts/replay/` with a short README) and keep their env gates. Then correct
  INVENTORY §1 to say "env-gated opt-in instruments". If the owner still wants them gone, record
  that decision and drop them in a separate commit.

### Medium

**M1. The rationale for cutting `qa-paired-verdict` from 5,000 to 1,000 iterations misstates the
margin.**
- Location: `test/qa-paired-verdict.test.mjs:1323`; `INVENTORY.md:78`.
- **What INVENTORY claims.** "All 6 gates pass with wide margin (`twoLook.PASS` 0.813 vs
  0.8098…)". Those two numbers are the 1,000-iteration and 5,000-iteration results for the same
  statistic, not a value against its threshold.
- **The real margin.** The binding gate is `noChangeTwoLookPassPower: noChange.twoLook.PASS >= 0.80`
  (`eval/qa/validate-paired-verdict.mjs:275`). Measured: 0.813 at 1,000 iterations, about 1.0
  standard error above the gate (SE ≈ 0.0124). At 5,000 iterations it is 0.8098, about 1.8 SE above
  the gate (SE ≈ 0.0055).
- **Consequence.** The seed is fixed, so nothing flakes today. But any legitimate change to how the
  simulator consumes the random-number stream re-draws the outcome. At 1,000 iterations, a correct
  implementation would fail roughly 1 time in 5. At 5,000 iterations it is roughly 1 in 25. The
  smaller run also has less power against a real regression.
- **Fix.** Restore 5,000 (about 2.7 s of CPU), or choose about 3,000 and record the true
  distance to the gate. Either way, correct INVENTORY:78.

**M2. INVENTORY names the wrong test and the wrong guard for the
`evidence-pack-per-operation.test.mjs:625-636` removal.**
- Location: `INVENTORY.md:59`.
- **What was actually removed.** The removed test pinned the `tags.freshness` of the six
  `largeTranscriptCorrectControls`. It did not touch `beansSourceBasisFixture`.
- **The named guard is wrong.** The cited guard `:638-679` does not run `buildTranscriptEvidencePack`
  on beans.
- **What still guards it.** The real remaining guard is the bounded-control test
  (`:617-628` on HEAD, title at `:618`). It catches a drift to `stable`, which empties the pack and fails
  `requiredPackTerms`. A change between `live` and `scheduled` is no longer pinned.
- **Fix.** Correct the row. The removal itself is acceptable as fixture-constant pinning, provided
  the owner accepts the live/scheduled gap.

### Low

**L1. Shrinking the identifier-token corpus dropped the bare `.` tail.**
- Location: `test/identifier-token.test.ts:66-71`.
- **The gap.** `SEP-24.` at end of text (a sentence-final period) exercises the "dot not followed
  by a digit" side of `(?![-.]\d)`. No unit test above it covers this case, so a regression to
  `(?![-.])` would now pass.
- **Fix.** Add `"."` back to `tails`: 6 × 5 × 5 × 5 × 6 × 2 = 9,000 strings, still under 0.05 s.
  Also correct the counter names at INVENTORY:77.

**L2. The routing-evidence split description is wrong, and one boundary is weaker.**
- Location: `INVENTORY.md:48`.
- **Description.** The dropped L56-74 is the coherent-phrase admission test.
- **Weaker boundary.** Its positive case, a coherent two-token phrase covering 2 of 3 query tokens
  still admits the entry, is not pinned. The remaining positive case in `scoring.test.ts` uses a
  phrase covering every query token.
- **Fix.** Either fold that `not.toBeNull()` case into the "rescues…" test or record the gap.

**L3. Named guard files and line citations are inaccurate.**
- `INVENTORY.md:38` names `test/playground-artifact-contract.test.mjs`, which does not exist on
  either branch. The real guards are `test/playground-eval-contract.test.ts` and
  `test/diagnostic-rejudge-source.test.mjs`.
- `INVENTORY.md:36` cites `vitest.config.ts:6-11`; the exclude is at `:21`.
- Fix: correct both, and state once that all `file:line` citations use `origin/main` numbering.

**L4. The two "meaningless local-constant" removals were the only policy checks on frozen sentences.**
- Locations: `exact-evidence.test.ts` (old `:44-46`) and `evidence-checkpoint.test.ts`
  (old `:132-135`).
- **Why they mattered.** Each `SENTENCE` is tied to production output by an exact-equality test.
  The property tests (no status or date claim; under 400 characters and free of case vocabulary)
  therefore constrained the *next* edit of the production sentence.
- **Coverage elsewhere.** Neither property is checked anywhere else
  (`rg` over `test/` finds no equivalent pattern).
- **Fix.** Keep both (they cost under 1 ms), or list them as uncovered guards for the owner.

**L5. The postflight keep-alive idle timeout is tight.**
- Location: `test/qa-postflight-keepalive.test.mjs:23`.
- The server-side `socket.setTimeout(150)` now destroys a fresh connection if the client stalls
  for more than 150 ms between `connect` and its first write.
- It passed 3 of 3 runs under full-suite load. On a slow shared CI runner a stall that long is
  possible.
- **Fix.** Consider 300 ms idle with a 700 ms wait. The added runtime is negligible because the two
  cases now run concurrently.

**L6. The INVENTORY is incomplete.**
- **Missing after-numbers.** The lane brief (step 5) asks for after-numbers: files, tests, and
  median-of-3 wall time. They appear only in the commit message. My single run measured 172 files,
  4,143 tests and 17.5 s.
- **Unlisted merges.** The `catalog-guards` merge of three "drops excluded notFor target" cases into
  one test is not listed. Coverage is equivalent: `buildScout` does not mutate its input (verified by
  deep-freezing it) and is idempotent.
- **Fix.** Add the after-numbers and the unlisted merge.

**L7. The migrated `partialRecoverySource` rejections assert a bare `.toThrow()`.**
- Location: `test/diagnostic-rejudge-source.test.mjs:274-291`.
- This matches the original. But the fixture is now hand-built, so an unrelated `TypeError` would
  also pass.
- **Fix.** Asserting the expected message per kind would make each rejection prove its own branch.

### Note

- **N1. `stopWrangler` is correct** (`scripts/run-demo-model-gauntlet.mjs:292-309`). SIGTERM, then
  a 5 s race, then SIGKILL plus a wait for `exit`, all preserved. `clearTimeout` in `finally`
  removes the 5 s event-loop hang that `sleep(5_000)` caused.
  - `unref()` is safe: the child is neither detached nor unref'd, and its piped stdio keeps the loop
    alive until it exits.
  - No test exercises the SIGKILL path. A child that ignores SIGTERM would cover it if wanted.
- **N2. Concurrency review: no races found.**
  - Temp directories are per test, through `mkdtemp` or a per-call log sequence.
  - Shared lists moved from `afterEach` to `afterAll` where tests became concurrent (`re-judge`,
    `improvements-writes`).
  - `demo-gauntlet` reserves ports in a `Set` inside the file; its remaining `afterEach` only
    touches directories that the concurrent tests no longer use.
  - No changed file mutates `process.env` or calls `chdir`.
  - `super-spec`'s symlinked `src/` and `catalog/` are read-only for the builder, which writes only
    `specs/super-spec.json` (`build-super-spec.mjs:67,912-914`), and `src/` reads no files.
- **N3. `explainOnce` caching** (`evidence-pack-claim-support.test.mjs:29-44`). The cache is keyed
  by transcript *reference*. No test mutates a transcript today, but a future in-place mutation
  would return a stale pack.
- **N4. The successor-filing refusals now run in parallel with the accept path**
  (`improvements-file-issue.test.ts:178-200`). This is safe only because the `gh` stub is stateless
  and the filer writes nothing before calling `gh`. Worth a comment.
- **N5. `test/README.md:33` dropped the `routing*` group, but `test/routing-qa-overlap.test.mjs`
  still exists.** Harmless under the "nearest group" rule.
- **N6. For the lead, not this lane:**
  - `.agents/TODO.md:1254` (the blind-packets item) can be closed.
  - With `orchestrate.mjs` out of the suite, `partialRecoverySource` has no live caller outside
    tests. It is a dead-code candidate for another lane.
- **N7. Protected boundaries: none touched.**
  - No `src/`, `package.json`, `package-lock.json`, `wrangler.jsonc`,
    `test/model-call-billing.test.mjs`, eval case, or other-lane file (`qa-judge-evidence`,
    `test/live/**`, `grade.mjs` tests, `scrub`, `agent-hooks`, `heldout-read`) is in the diff.
  - No security-boundary, ADR-0003 exposure, secrets, case-text or billing test lost coverage.
  - Every `(field, reference)` rejection in `catalog-guards` is kept. The paid-call guards in
    `discovery-paid-run-guards`, `qa-harness-preconditions` and `re-judge` keep every assertion.
- **N8. Reviewer process disclosure.** In one command I passed a shell glob, `eval/qa/*.mjs`, to
  `rg -l`. The brief forbids globs over `eval/`. It printed only matching code-file paths; no case
  text was opened or printed, and no corpus, split or golden path was read.
