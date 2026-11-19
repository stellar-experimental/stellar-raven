# Item 8.10 report: audit of item 8.9, corrections, and the 8.9 close-out

Lead and auditor: Claude Fable (`claude-fable-5-2`), agentpc `t20j`, 2026-11-19.
Pull request: <https://github.com/stellar-experimental/stellar-raven/pull/507> (branch
`np/8.10-audit-8.9`, from `origin/main` at `50418fa3`). Not merged; the orchestrator merges.

## After the first report (2026-11-19)

The orchestrator answered the two open points and both are in the pull request:

- The five dated lead briefs under `items/1.4/dated/` launch Codex with
  `--dangerously-bypass-hook-trust` (commit `cf24029d`: one flag in each, nothing else).
- `partialRecoverySource` and `isHarnessTransportFailure` are deleted from
  `eval/qa/diagnostic-rejudge-source.mjs` with their 13 tests, and the TODO item is dropped (commit
  `f48e8813`). Disposition: plainly dead. Their only caller,
  `research/audits/2026-11-06-playground-final-resolution/orchestrate.mjs`, passes `--confirm-paid`
  to `scripts/run-playground-semantic-eval.mjs`, which has rejected that flag since #498
  (`test/playground-budget.test.ts:33`), so it already could not run. The record under `research/`
  is unchanged, and the code is in git history at `10a1ead5`. `diagnosticRejudgeSource` and
  `diagnosticAnswerProblem` are untouched. `qaImplementationSha256` changes, as with any
  `eval/qa/*.mjs` edit.
- Owner decision 5 (ripgrep) is confirmed as the ninth closed item.

The sections below are the first report, updated only where these two changes alter a fact.

## Verdicts (for the owner)

All eight lanes did what they claimed. None needs rework, and no guard was weakened. Three
corrections are documentation. The fourth is a timeout on two tests: the test speedup left one test
at 90% of its time limit, and it failed once in CI.

| Lane | PR | Verdict | Correct | Complete | Fit | What I changed |
|---|---|---|---|---|---|---|
| register | #499 | good | yes | yes, now that `gca-eval` is removed | right-sized | nothing |
| live | #500 | good | yes; both suites pass on `main` | yes | right-sized | nothing |
| flake | #501 | good | yes | yes; no timed sample left in that test | right-sized | nothing |
| flush | #502 | good with fixes | yes; no cited file was removed | yes | slightly over-built (four output modes, eleven tests), left | one line in `scripts/README.md` |
| cards | #503 | good | yes; gate reproduces at 114 of 182 | yes | right-sized | nothing |
| scrub | #504 | good | yes; served text is exactly the two restored passages | yes | right-sized after round 2 | nothing; two follow-ups in the TODO |
| hooks | #505 | good with fixes | yes; one decision function for four CLIs | yes, with the Codex flag | right-sized | the Codex wording in `eval/qa/README.md`; the flag on two launch lines |
| tests | #506 | good with fixes | yes for every removal (each named guard exists); the parallel runs left one test flaky | yes | kept slightly more than needed (tests for a function with no live caller), left | a 30 s timeout on two tests; the dead function and its tests deleted afterwards |

The evidence for each cell, with file and line, is in [AUDIT.md](AUDIT.md).

## What the audit found

1. **The Codex hook claim in `eval/qa/README.md` was wrong (fixed).** The lane wrote that Codex loads
   the hook only in a folder its config trusts, so worktree lanes stay unguarded. One probe on
   agentpc, in this item's worktree, which that config does not list, shows the hook fires when
   Codex is launched with `--dangerously-bypass-hook-trust`: `grep -r` was denied with the guard
   message and the control ran ([CODEX-PROBE.md](CODEX-PROBE.md)). This agrees with the
   orchestrator's probe on the Mac.
2. **Two live Codex launch lines lacked the flag (fixed):** the roster and `briefs/ITEM-LEAD.md`.
3. **No document named the flush script (fixed):** `scripts/README.md` now says what it does and
   what to do when its test fails.
4. **The tests lane left one test at the edge of its timeout (fixed).** CI run 44604472775 on this
   branch failed once on `test/qa-paired-verdict.test.mjs` ("Test timed out in 5000ms", 5,098 ms)
   and passed on the next push. The test does fixed CPU work under the 5,000 ms default. In the full
   suite it took 3.0 to 3.2 s before #506 and takes 4.5 to 4.7 s after it, because #506 runs many
   subprocess tests concurrently. It and the next-slowest default-timeout test now set 30,000 ms.
   Without this fix `main` fails CI now and then.
5. **The scrub rule can change a sentence's meaning at a future re-pin (TODO).** It drops a
   qualifier that follows the excluded alternative. Nothing is wrong in the served text today. A
   re-pin review reads the upstream diff, not the served sentence, so the new TODO item proposes a
   pinned count of narrowed sentences.
6. **`partialRecoverySource` had no live caller (deleted on the orchestrator's instruction).** The
   tests lane had kept its tests.

## Fixes and close-out in the pull request

- Fixes F1 to F3 (`eval/qa/README.md`, `.agents/model-roster.md`, `briefs/ITEM-LEAD.md`,
  `scripts/README.md`) and F4 (`{ timeout: 30_000 }` on one test in
  `test/qa-paired-verdict.test.mjs` and one in `test/find-uncited-golden-round-json.test.mjs`).
- `.agents/TODO.md`: the eight closed items deleted; owner decision 5 deleted (see below);
  Priorities point 4 and the case-file move item reworded; one item added ("Align the skill scrub
  with the emitted-text guard"). The frozen anchors are byte-identical.
- Ledger: the 8.9 row (lanes, PRs, deploy `d860f844`, the `cards` accepted evidence, the `gca-eval`
  removal and backups, the Antigravity lane lesson) and the 8.10 row.
- Hook wording: `AGENTS.md` (one bullet), `golden-truth` (one sentence), `.agents/README.md` (one
  row).
- `usage/README.md`: `/home/tyler/raven-data/qa` listed among the owner's private directories.
- DECISIONS.md: both owner quotes of 2026-11-19, verbatim.

Executor: Claude Sonnet (`claude-sonnet-5-5`, `t20n`, then `t20p` for F4 and `t20q` for the two
additions), [EXEC.md](EXEC.md). I read every diff whole. I made two small edits myself: a paragraph re-wrap in `eval/qa/README.md` and a link in the 8.9
ledger row. Its three stated deviations are sound.

## Gates (run bare by the lead on the final tree)

| Gate | Exit | Result |
|---|---|---|
| `npm run typecheck` | 0 | clean |
| `npm test` | 0 | 173 files passed, 5 skipped; 4152 passed, 3 expected fail, 5 skipped (13 fewer: the deleted tests) |
| `npm run build` | 0 | dry run, 6920.96 KiB |
| `npm run secrets:scan -- --tree` | 0 | clean |
| `npm run eval:selftest` | 0 | all checks passed |
| `npm run eval:qa:register -- --check` | 0 | up to date |
| `npm run build:usage`, `npm run test:usage-report`, `npm run build:usage-report` | 0 | 13 passed |

Not run: `npm run eval:qa:lint` (7-COMMON.md forbids it in this item; the change to `eval/` is two
README passages, and CI runs the lint). `eval:routing -- --gate` was run once during the audit on
`main` (GATE PASS); no routing code changes in the pull request. No `src/` change, so Worker bytes
do not change. CI on the branch: the first run failed on the timeout above; the runs after it are
in the pull request.

Model calls: one Codex probe (`gpt-6.2-sol`, low effort) and three Sonnet executor runs, all on
subscriptions. USD 0 API.

## Deploy

Not needed. `git diff origin/main -- src package.json package-lock.json wrangler.jsonc` is empty.

## For the orchestrator

1. **Merge window.** The pull request changes `AGENTS.md`, `golden-truth` and the five dated lead
   briefs, which the dated runs read at launch. Merge before 2026-11-23 18:00 UTC, or hold until
   run 2.1 and its follow-ups have merged.
2. **The dated briefs' Codex launch line** now carries the flag, on your instruction. The evidence
   for it is my probe: the same `systemd-run` launch shape on agentpc with Codex 0.169.0. The
   remaining risk is a Codex update that drops the flag; the launch would then fail and the brief
   falls back a tier.
3. **Owner decision 5** (install ripgrep on agentpc) is deleted as done, which you confirmed.
   `ripgrep 15.1.0` is at `/usr/bin/rg`, installed by `apt` on 2026-11-19 18:28.
4. **Nothing to do on the Mac** beyond the merge.

## Not fixed, and why

- **A home for the env-gated replay tests** (`test/replay-*.test.ts`, `test/search-page-size.test.ts`):
  no TODO item. Each file states its opt-in command, each skips in `npm test`, and
  `test/README.md` lists the group. Moving them buys nothing.
- **The flush script's extra output modes and tests:** left. 34 cited files remain and the invariant
  test is what shows a dropped citation.
- **The scrub's meaning-change residual:** not fixed here. The orchestrator's round-2 note fixed the
  rule's shape, served text is correct today, and the guard I propose is a new test, so it is a TODO
  item.
- **Taste:** the card-binding helpers that only a test calls, the `execFile` wrapper repeated in
  eight test files, the hard-coded 24,000 in one live check.

## Open questions for the owner

None. The one question in the first report, whether to delete `partialRecoverySource`, was answered
by the orchestrator: deleted.
