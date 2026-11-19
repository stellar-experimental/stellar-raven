# Report — Item 8.12 Lane `macfix`

## PR

- **URL:** https://github.com/stellar-experimental/stellar-raven/pull/518
- **Branch:** `np/8.12-macfix` (base `origin/main` at `aa33c99e`)

## What Changed

Fixed the macOS `/bin/sh` portability bug in `createEnvironmentPinCliFixture()` in `test/qa-harness-preconditions.test.mjs` (fixture only; no harness code changed, no new test added):

- **Why the old form broke on macOS:**
  In `createEnvironmentPinCliFixture()`, the fake `claude` shell script emitted its JSON judge envelope via:
  ```sh
  printf '{"result":"{\"score\":\"correct\",...}","total_cost_usd":0.01,"modelUsage":{"%s":{}}}\n' "$model"
  ```
  POSIX.1 `printf` defines XBD Chapter 5 escape sequences (`\\`, `\a`, `\b`, `\f`, `\n`, `\r`, `\t`, `\v`) plus octal `\ddd` in the format operand and leaves `\` followed by any other character unspecified.
  - On Linux (Debian/Ubuntu CI and `agentpc`), `/bin/sh` is `dash` (`busybox sh` behaves the same), whose builtin `printf` does not treat `\"` as an escape sequence and emits `\"` verbatim, producing valid nested JSON.
  - On macOS, `/bin/sh` is Apple Bash 3.2 in POSIX mode (reproduced portably on Linux with `bash --posix` and GNU `/usr/bin/printf`), whose `printf` interprets `\"` in the format operand as a C-style double-quote escape and strips the backslashes. Stdout became malformed JSON (`{"result":"{"score":"correct",...}","total_cost_usd":0.01,...}`).
  - `eval/qa/judge.mjs:668-679` catches the `JSON.parse` failure, sets `envelope = null`, leaves `costUsd` undefined, and `eval/qa/spend-budget.mjs:132` throws `MissingReportedCostError` in all 6 tests that reach the fake judge (the 5 `preserves the spaced ... form` tests and `accepts a matching pin and stamps the judge environment identity`).

- **Why the new form cannot break across POSIX shells:**
  Node serializes the verdict and outer JSON prefix directly with `JSON.stringify` into `judge-response-prefix.txt` inside the fixture's temp directory (`root`), exposed via `QA_FAKE_RESPONSE_PREFIX` (ignored by `agentEnvironmentIdentity`, forwarded by `buildJudgeEnv`, and cleaned up with `fixture.root`). The fake `claude` script streams those raw bytes with `cat "$QA_FAKE_RESPONSE_PREFIX"` — bypassing shell and `printf` escape interpretation completely — and appends only `printf '%s":{}}}\n' "$model"`, whose format operand contains only POSIX-required `%s` and `\n`.
  Verified across `dash`, `busybox sh`, `bash --posix`, and `bash`: all four produce byte-identical, valid single-line JSON (`cost=0.01`, `score=correct`, `model=claude-sonnet-5-5`).

## Worker Bytes & Model-Facing Impact

- **Worker bytes changed:** No (`git diff origin/main -- src/ package.json package-lock.json wrangler.jsonc` is empty).
- **Model-facing:** No (test fixture and round records only).

## Gates

All standard gates were run bare after the final edit:

| Gate | Exit Code | Notes |
|---|---:|---|
| `npm run typecheck` | `0` | Clean |
| `npm test` | `0` | 173 passed, 5 skipped (178 files); 4156 passed, 3 expected fail, 5 skipped (4164 tests); all 133 tests in `test/qa-harness-preconditions.test.mjs` passed |
| `npm run build` | `0` | Dry-run bundle succeeded |
| `npm run secrets:scan -- --tree` | `0` | Clean |

## Codex Sol Review & Challenge

- **Review:** `.agents/rounds/2026-11-16-next-phase/items/8.12/macfix/SOL-REVIEW.md`
- **Challenge:** `.agents/rounds/2026-11-16-next-phase/items/8.12/macfix/CHALLENGE.md`
- **Counts by class:** 0 valid, 0 invalid, 0 valid-but-not-worth-fixing (0 total findings — Sol found no defects and independently confirmed the POSIX/Apple Bash root cause, four-shell behavior, and environment-pin invariance).

## TODO Item Closed

None — this fixes a Mac-only test fixture failure on `main` (`aa33c99e`) rather than a `.agents/TODO.md` entry.

## Model Calls Made

| CLI | Model ID | Effort | Purpose |
|---|---|---|---|
| `codex exec` (read-only, subscription) | `gpt-6.2-sol` | `high` | Independent review of `git diff origin/main...HEAD` (`SOL-REVIEW.md`) |

## Open Questions

None. Ready for the orchestrator to verify `npx vitest run test/qa-harness-preconditions.test.mjs` on macOS before merging.
