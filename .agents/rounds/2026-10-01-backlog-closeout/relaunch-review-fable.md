# Review L: independent adversarial review of the paired-run launch re-preparation

Date: 2026-10-10. Reviewer: Claude Fable 5.1 at high effort. Mode: read and run only.
Worktree: `/Users/kalepail/Desktop/raven-w1010-l`, branch `w1010/l` at `5cbbf8b4`.
Diff reviewed: `d15a4ce5..w1010/l` (commits `0a60ca49` and `5cbbf8b4`).
Author report: `/private/tmp/claude-501/w1010/l-report.md`. I re-derived every claim I cite.

This review made no paid call, started no server, and ran no live probe.
It did not run `paired-launch.mjs`. `/private/tmp/stellar-raven-paired-launch` does not exist.
It committed nothing. The worktree is clean after the review (`git status --porcelain` is empty).

## Summary

The repair is correct and complete. The assembler now reads the flip tuple from the runner's judge exports.
An offline dry run of the real `main()` froze a valid plan at `v2.11`.
The same dry run with the old assembler produced a plan that the supervisor rejects at the tuple.
That rejection would have stopped the real launch at the first `executeFrozen` call, after the owner signed.
The new tests exercise the real parsers and the real validator, and they catch the original bug.
I found no code defect. I found three documentation defects in the run sheet, all low.
The `ps` monitor risk is pre-existing and acceptable on a quiet machine.

## Method

1. I compared `git show d15a4ce5:<assembler>` with the new file by hand and with `git diff -w`.
2. I built four detached worktrees in a scratch shared clone: two runners at `5cbbf8b4`, the candidate server at `5cbbf8b4`, and the baseline server at `90d0ba75`.
3. I created a real Claude pin with `createClaudePin` (version `2.1.296`), simulated capacity, surfaces, stable vector, `.dev.vars`, and the real stability register.
4. I ran both assemblers exactly as `paired-launch.mjs:153` does: `node <ROUND>/assemble-paired-plan.mjs` with `cwd = PAIRED_CR` and the managed environment (process guard in `NODE_OPTIONS`).
5. I ran `--print-plan-sha256`, then `validateAuthorizedPairedCollectionPlan` and `validatePairedCollectionPlan` with real git inspection, then the executor's pin and guard checks.
6. I deep-compared the two frozen plans after path and environment normalization.
7. I ran the new tests, a mutation check, the full `npm test`, and the static judge preflight.
8. I audited drift since `bcfa617f` over the transitive import closure of every launch entry point (35 files), not over the author's list.

## Check 1: the assembler refactor keeps the exact launch behavior

Verdict: **yes**.

- The plan fields, key order, and command arrays are identical. The deep diff of the old and new frozen plans shows two differences: `flipRejudge.judgeTuple.rubric` (`v2.10` to `v2.11`) and `capacity.artifactSha256`. The second is my fixture; each dry run wrote its own `capacity.json` with a new `completedAt`.
- Command lengths: collection 47, judge 16, flip 18, P6 12. Both plans match.
- `--model` keeps the literal `claude-sonnet-5` (`assemble-paired-plan.mjs:9`, `:57`). `--judge-model` now carries `judge.model` (`:57`, `:73`, `:81`). `JUDGE_MODEL` is `claude-sonnet-5` (`eval/qa/judge.mjs:58`), so the arrays are unchanged.
- The exclusive writes remain `wx` with mode `0600` (`assemble-paired-plan.mjs:171-172`). The dry run confirmed mode `600` and an `EEXIST` failure on a second run.
- The output line is unchanged: `plan frozen: 200 selected; 501 active`.
- The failure modes are the same assertions in the same order, with one harmless change. The old file computed the instrument hashes before the surface check; the new file computes them inside `buildPairedPlan` after it (`:160-166`). Only the first error shown can differ when two inputs are both bad.
- The main guard (`:176-178`) matches the pattern in `paired-launch.mjs:281`. It ran `main()` under a relative `argv[1]` from the runner directory, under the process guard, in the dry run. Under vitest the guard is false, so the test imports do not launch.
- `cli-identity.json` keeps the same keys, binary hash, and variable names.

## Check 2: the tuple agrees across supervisor, P6 wrapper, re-judge, and run-qa at HEAD

Verdict: **yes**. Tuple: `claude-sonnet-5 / v2.11 / p6 / panel 1`.

| Instrument | Model | Rubric | Pack | Panel | Evidence |
| --- | --- | --- | --- | --- | --- |
| Assembler | `JUDGE_MODEL` from the runner | `JUDGE_RUBRIC` | `PACK_VERSION` | literal 1 | `assemble-paired-plan.mjs:114`, `:139-140`, `:169` |
| Supervisor | `--judge-model` of the collection command | imported `JUDGE_RUBRIC` | imported `PACK_VERSION` | 1 when `--judge-panel` is absent | `eval/qa/paired-collection-supervisor.mjs:28-29`, `:406-414`, `:710-722` |
| re-judge | `--judge-model` flag, default `JUDGE_MODEL` | `JUDGE_RUBRIC` | `PACK_VERSION` | default 1 | `eval/qa/re-judge.mjs:132-134`, `:558-566` |
| run-qa | `--judge-model` flag, default `JUDGE_MODEL` | writes `meta.judgeRubric = JUDGE_RUBRIC` | writes `meta.packVersion = PACK_VERSION` | no flag | `eval/qa/run-qa.mjs:1677`, `:1704`, `:2109`, `:2121` |
| P6 wrapper | judge self-test, no tuple flags | judge.mjs | judge.mjs | n/a | `eval/qa/run-p6-judge-self-test.mjs:24`, `:196-199` |

`JUDGE_MODEL` is `claude-sonnet-5` (`judge.mjs:58`). `JUDGE_RUBRIC` is `v2.11` (`judge.mjs:122`). `PACK_VERSION` is `p6` (`eval/qa/evidence-pack.mjs:3`).
`JUDGE_SELF_TEST_CANDIDATE_COUNT` is 7 (`judge.mjs:928`), which matches `P6_SELF_TEST_CALLS`.
The flip re-judge compares the stored artifact's tuple with its current tuple (`re-judge.mjs:558-566`). Both arms are judged by the same `run-qa.mjs`, so they agree.

## Check 3: independent drift audit since `bcfa617f`

I computed the transitive import closure of 17 launch entry points: 35 files.
Sixteen closure files changed in `bcfa617f..d15a4ce5`. I read each diff.

| File | Commits | Launch effect |
| --- | --- | --- |
| `eval/qa/run-qa.mjs` | #243 | Adds attempt timestamps and `originalFailureClass`. No CLI change. |
| `eval/qa/agent-result.mjs` | #243 | Adds `assistantTurn` to transcript rows. Data only. |
| `eval/qa/remote-identity-guard.mjs` | #243 | Adds `failedAt` and `capturedAt`. Data only. |
| `eval/qa/judge.mjs` | #238, #250, #252 | Rubric `v2.11`, judge child env, 1,200 s backstop, new fixtures. No CLI change. |
| `eval/qa/re-judge.mjs` | #256 | Adds `flipPanelConfidence` output. No CLI change. |
| `eval/qa/paired-verdict.mjs` | #256 | Adds `flipPanelConfidence` and a report suffix. `--json`, exit codes, and `method` unchanged. |
| `eval/qa/panel-confidence.mjs` | #256 | New helper. Reporting only. |
| `eval/qa/evidence-pack.mjs` | #249 | Comment text only. |
| `eval/qa/run-p6-judge-self-test.mjs` | #253 | Refuses a missing output folder (`:296-301`). `launchPaired` creates `PAIRED_RUN` first (`paired-launch.mjs:73`). |
| `eval/qa/paired-collection-supervisor.mjs` | #206 | Part of the 2026-10-01 preparation. Hash equals the preparation column. |
| `eval/playground/artifact-contract.mjs` | #209 | **Not in the author's list.** See below. |
| Five round scripts | #206, #207 | The 2026-10-01 preparation itself. |

`eval/playground/artifact-contract.mjs:320-326` adds a budget clause to `assertNotPlaygroundQuarantine`.
`re-judge.mjs:713` and `:896` run that check on both flip inputs.
The clause fires only on a top-level `budget` key or on `meta.capContext.evaluator.maxBudgetUsd`.
`run-qa.mjs` writes `budget` inside `meta` (`:1375`, `:2204`) and never writes `capContext`.
So the clause does not fire on paired artifacts. `test/re-judge.test.ts` covers `flips-vs` and passes. No action.

Unchanged since `bcfa617f`: `paired-collection-control.mjs`, `exact-old-runtime-adapter.mjs`, `probe-remote-identities.mjs`, `check-paired-capacity.mjs`, `lib.mjs`, `judge-stability.mjs`, `validate-paired-verdict.mjs`, `eval/report-live-surface.mjs`, `eval/lib/executable-identity.mjs`, `eval/lib/bound-server-identity.mjs`, `scripts/run-eval-server.mjs`, `src/server.ts`, and the stability register.

Other launch inputs:

- `package.json` changed only dependency versions and overrides (#241, #248). `eval:qa:paired:plan-sha256` and `prepare` are unchanged.
- `wrangler.jsonc` adds `assets.directory = ./public` (#237). `public/` has 12 tracked files. The baseline server at `90d0ba75` keeps its own config.
- The Claude binary is a Mach-O executable, so `NODE_OPTIONS` does not load the guard into it. `claude --version` under the managed environment passed in the dry run.
- The judge child receives `API_TIMEOUT_MS` and `CLAUDE_CODE_MAX_RETRIES` (`judge.mjs:734-740`). The identity hashes read the parent environment, so no pin changes.
- Weekday check: `2026-10-10` is a Saturday and `2026-10-11` is a Sunday.

Instrument hashes at HEAD equal every value in the new preview table. I recomputed all 13.
Corpus: 501 active, 200 selected. `idsSha256 54118e34…` and `activeCorpusIdsSha256 7da0fb70…` are unchanged. `contentSha256 72eb6a3c…` and `casesFileSha256 2093621e…` changed. Fifteen selected cases changed content since `bcfa617f`; I listed them and the count matches.
Composition: stellarDocs 95, scout 57, lumenloop 25, skills 14, none 9; stable 87, scheduled 59, live 54; 12 trap cases. The sheet's values remain current.

## Check 4: the new tests

Verdict: **they exercise the real validator and parsers, and they catch the original bug**.

- `test/qa-paired-launch.test.mjs:592-602` calls the real `assertRunQaCliSyntax`, the real re-judge `parseArgs`, the real `parseP6SelfTestCli`, `assertP6OutputAvailable`, `validatePairedCollectionPlan`, and `validateAuthorizedPairedCollectionPlan`. Only `inspectWorktree` is stubbed. The validator reads real instrument bytes copied into two simulated runners, a real `.dev.vars` identity, a real capacity artifact shape, and a real P6 summary shape.
- Mutation check: I restored `rubric:'v2.10'` at `assemble-paired-plan.mjs:114`, ran the assembly tests, and the main test failed at the tuple assertion (`:595`). I then restored the file.
- `test/qa-paired-launch.test.mjs:620-627` proves the validator rejects a plan assembled from a stale constant.
- Gap (info): no unit test runs `main()` or the dynamic `load()` wiring at `:131-170`. My dry run covered it. A post-run test could spawn the assembler as a main script.

Test results, all run bare on the final tree:

| Command | Result |
| --- | --- |
| `npx vitest run test/qa-paired-launch.test.mjs test/qa-paired-collection-supervisor.test.mjs` | 147 passed |
| `npx vitest run test/qa-paired-launch.test.mjs -t "paired plan assembly"` with the `v2.10` mutation | 1 failed, 4 passed (expected) |
| `npm test` | exit 0; 141 files; 2678 passed, 3 expected fail; 30.9 s |
| `node eval/qa/judge.mjs --self-test-static` | exit 0; `judge self-test static GREEN` |

No timeout occurred in `test/qa-paired-launch.test.mjs`.

## Check 5: the run sheet edits

Dated history is intact. The diff touches lines 3-6 (one pointer line), 20-90 (new section), 92-94 (launch window), and 483 (the fill-in template tuple). The 2026-10-01 tables at lines 544 onward are unchanged. The template tuple at line 483 is a fill-in form, not history, and `v2.11` is correct there.
The launch window line is correct. The STE scan found no sentence over 20 words in the new section.

Findings:

- **F1, low, accuracy.** `paired-run-sheet.md:71` marks the supervisor as "no (equals the preparation column)" under the header "Changed since `bcfa617f`". `paired-run-sheet.md:59` says the supervisor "did not change". The supervisor did change since `bcfa617f`, in #206 (`caecb039…` to `eadaa8f9…`), as the sheet's own table at line 568 shows. Fix: say "unchanged since the 2026-10-01 preparation".
- **F2, low, unsourced claim.** `paired-run-sheet.md:28` says "the pack repair lands after this run". I found no pack repair in `.agents/TODO.md`, the round ledgers, or `improvements/INDEX.md`. Fix: remove the clause or link its source.
- **F3, low, STE.** Lines 28, 45, and 64 join two ideas with a semicolon. Split them.
- `.agents/TODO.md:642` is accurate.

## Check 6: what can stop a paid phase midway on a normal machine

**F4, medium, pre-existing, acceptable with conditions.** The monitor at `paired-launch-runtime.mjs:109-113` runs `ps` every 100 ms with a 1,000 ms timeout (`:51-56`, `:58-61`). One timeout sets a sticky `monitorError`. After collection, `paired-launch.mjs:189` calls `stopServers()`, `finishCleanup` sees the error (`:253-257`) and throws, and judging (`paired-launch.mjs:190-193`) never starts. The collection artifacts stay in the runner worktrees, but `launchPaired` cannot resume (`mkdirSync` at `:73` and the `wx` markers refuse a second run). A manual continuation must reproduce the exact frozen environment hash, which the executor checks (`execute-frozen.mjs:52`). Exposure: about 144,000 samples over four hours.

Measurements on this machine during the review, with a load average of 29 on 16 cores and 1,290 processes:

| Call | p50 | p95 | p99 | max |
| --- | --- | --- | --- | --- |
| `ps -axo pid=,ppid=,pgid=,stat=,lstart=` (300 samples) | 41 ms | 100 ms | 122 ms | 154 ms |
| `lsof -nP -iTCP:8788 -sTCP:LISTEN -Fp` (20 samples, load 10) | 111 ms | 124 ms | n/a | 136 ms |

The 1,000 ms timeout leaves more than six times headroom under a load the launch should never see.
The `ETIMEDOUT` seen in tests came from dozens of parallel vitest workers calling `ps` at once.
`lsof` runs four times in cleanup under the same 1,000 ms cap (`:70-82`) and is also within margin.
Conditions: run on a quiet machine with no Herdr fan-out and no test suite, as `.agents/TODO.md:632-634` already says.
Do not change the reviewed cleanup contract the night before the run. Harden the monitor after the run with a bounded tolerance and a tested manual continuation path.

Other midway risks I checked: the ten-second cleanup deadline (`:268-281`) covers Wrangler's shutdown with `SIGKILL` at five seconds. The P6 wrapper refuses a missing folder before spend. The guard's `ps -p` at child start (`paired-process-guard.cjs:12-14`, `:29`) has the same 1,000 ms cap and the same quiet-machine condition. All are pre-existing.

## Author report: claims I could not confirm or that differ

- "All 96 tests still pass" for the supervisor file: I observed 147 across the two focused files, which is consistent.
- The author did not list `eval/playground/artifact-contract.mjs` (#209) as drift. It is harmless; see Check 3.
- Every other claim in the author's audit table matched my evidence.

## Open items for the orchestrator

1. Apply F1, F2, and F3 to the run sheet before the launch revision is cut. They change no code and no hash.
2. The launch revision must contain `0a60ca49`. The assembler runs from the candidate runner at `PAIRED_REV` (`paired-launch.mjs:153`), not from the operator checkout.
3. Keep the machine quiet from step 9 through step 14.

LAUNCH-OK-WITH-FIXES: run-sheet wording only, F1 (supervisor drift row and bullet), F2 (unsourced "pack repair" clause), F3 (three semicolon sentences); no code change required
