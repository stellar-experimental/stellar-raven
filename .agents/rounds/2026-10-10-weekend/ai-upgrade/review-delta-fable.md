# Delta review S2: the fix round on the `ai` upgrade branch

Reviewer: Claude Fable 5.1, independent of the author (Claude Opus 5.5, lane S).
Worktree: `/Users/kalepail/Desktop/raven-w1010-s`, branch `w1010/s`, head `48c96997`.
Diff reviewed: `git show 48c96997` (5 files, 146 insertions, 29 deletions).
No paid call ran. No server started. No upstream post. The worktree is clean after the review.
I created nothing under `/private/tmp/stellar-raven-paired-launch`.

## Gates and free checks I ran

| Command | Exit | Result |
| --- | --- | --- |
| `npm run test:smoke` | 0 | 8 files, 120 tests passed |
| `npm run typecheck` | 0 | clean |
| `node scripts/run-playground-semantic-eval.mjs --print-generation` | 0 | prints one generation hash, no network |
| `node scripts/run-playground-semantic-eval.mjs --dry-run --ids q-soroban-storage-types --no-judge` | 0 | "no HTTP request, playground model call, or judge call" |
| `node scripts/run-playground-semantic-eval.mjs --dry-run --ids <six ids>` | 0 | six cases selected, no call made |
| `node -e "$SDK"` in this worktree | 0 | prints `7.0.137 4.0.91` |
| `git show d15a4ce5:package-lock.json` | 0 | BASE locks `ai` 7.0.79 and `@ai-sdk/openai` 4.0.47 |
| `git status --porcelain` after all checks | 0 | empty |

`npm run eval:playground` is exactly `node scripts/run-playground-semantic-eval.mjs` (`package.json:46`).
The switch to a direct `node` call changes only `PATH`. It changes no flag and no behavior.

### `demo-steps.mjs` on synthetic logs

| Log | Flags | Exit | Output |
| --- | --- | --- | --- |
| clean turn, sums equal | none | 0 | `problems: []`, `usageMismatches: []` |
| `totalTokens` sum 40, turn 41 | none | 0 | mismatch listed under `usageMismatches` |
| same | `--strict-usage` after the path | 1 | mismatch listed |
| same | `--strict-usage` before the path | 1 | the path still parses |
| clean | `--final-step 7` before the path | 0 | the path still parses |
| 2 tool calls on step 7 | none | 1 | `problems` names the final-step tool calls |
| no `demo-chat` event | none | 1 | `problems` names the unfinished turn |
| no path | `--final-step 7` | 2 | usage text |

### `judge-pin.mjs` with a scratch pin directory

I linked `$S/bin/claude` to `/Users/kalepail/.local/share/claude/versions/2.1.296`. The helper ran `claude --version` only.

| Case | Exit | Message |
| --- | --- | --- |
| record, `DISABLE_AUTOUPDATER=1`, pin first on `PATH` | 0 | JSON identity, version `2.1.296 (Claude Code)` |
| matching SHA-256 | 0 | identity |
| wrong SHA-256 | 1 | `expected SHA-256 …, resolved … with …; refusing paid calls` |
| `DISABLE_AUTOUPDATER` unset | 1 | `DISABLE_AUTOUPDATER is not 1` |
| pin last on `PATH` | 1 | `claude resolves to /Users/kalepail/.local/bin/claude, not …` |
| extra file in the pin directory | 1 | `must hold only claude, found claude, extra` |
| relative pin directory on `PATH` | 1 | resolves to `bin/claude`, not the absolute link (fails closed) |

The recorded `sha256` equals `shasum -a 256` of the versioned file. `readFileSync` follows the link, so the hash covers the real executable bytes.
`executableIdentity` returns the `PATH` entry as `resolvedPath` (`eval/lib/executable-identity.mjs:15-34`), so the link comparison in `judge-pin.mjs:29` is correct.
The runner spawns the judge with that same `resolvedPath` (`scripts/run-playground-semantic-eval.mjs:744`, `:857`), so the pin covers the paid judge calls.

### Mutations against the strengthened smoke test

| Mutation | Result |
| --- | --- |
| add `store: false` to `demoOpenAiProviderOptions` | the loop test fails on the top-level key set (`store` and `include` appear) |
| remove "Final-step policy: tools are disabled now." from `src/demo/steps.ts` | the loop test fails on the final system text |

Both files were restored with `git checkout --`. A third mutation (omit `strict`) did not apply, so I have no result for it. It is not needed: the first test pins `strict === false`, and the provider sends `false` for an omitted value, so the test cannot tell them apart (review S, A1).

## Finding by finding

| Finding | Fixed | Evidence |
| --- | --- | --- |
| A3-1 (medium) | Yes | `test/smoke/demo-openai-tool-request.test.ts:184-216` pins the exact top-level key set of both bodies, every input item in order, the first system text equal to `DEMO_SYSTEM_PROMPT`, the final system text with the final-step sentence, and the exact user item. The two mutations above fail the test. |
| A3-2 (low) | Yes | The header at `:23-27` states that the loop test rebuilds the `streamText` call and names `test/smoke/server.test.ts`, which exists. |
| A2-1 (low) | Yes | `.agents/TODO.md:342-344` and the plan's exclusion list record the Grok `strict: false` change as unverified, with the gauntlet check before the next control-model lane. No paid call. |
| B-1 (medium) | Yes | Checkpoint 6, step 0 pin setup (`DISABLE_AUTOUPDATER=1`, `$B/bin` first on `PATH`, one `claude` link), `node "$PIN" "$B/bin" "$JUDGE_SHA256"` before each of the five judged commands (steps 7, 10 twice, 11, 12), and every paid command runs as `node scripts/…`. `$B` is absolute. The helper fails closed in every case I tried. |
| B-2 (medium) | Yes | Checkpoint 7 and the `$SDK` receipt in step 3 and before each server start. The expected BASE values match the BASE lockfile. The expected CANDIDATE values match this worktree. See note N-1. |
| B-3 (low) | Yes | `usageMismatches` is a separate list. Exit 1 stays for a final-step tool call and an unfinished turn. `--strict-usage` restores exit 1 for the receipt probes only. The receipt-probe rule and the method-completeness rule in the plan match the helper. |
| B-4 (low) | Yes | "Order and server slots" now forbids manual, browser, and `--preflight` turns during collection and names the mapping risk. |

## New defects introduced by the fix

None found in code. Two notes for the operator, neither blocks launch:

- **N-1 (low).** Steps 5, 8, and 11 run `node -e "$SDK"` "in the assigned pane" of the server. That pane is a different shell, so `$SDK` is unset there, and `node -e ""` prints nothing with exit 0. An empty line is "a different value" and blocks the start under checkpoint 7, so the gate still holds, but the step can confuse. Run the receipt from the collection shell instead: `(cd "$BASE_WT" && node -e "$SDK")`. The step-3 receipt already runs in the collection shell from each worktree.
- **N-2 (info).** `ln -s` in step 0 fails when `$B/bin/claude` already exists from an earlier attempt. The next line, `node "$PIN"`, then checks whatever link is present, so a stale link is caught only by the recorded SHA. Remove `$B/bin/claude` before a re-run.

## Caps

Seven `--confirm-paid` commands, each with exactly one `--max-budget-usd`: 2 × $1 and 5 × $5, sum $27, equal to the round ceiling. The "Budget and caps" section and the cap files are unchanged by the fix commit. The ceiling can be passed by at most one provider call, as the plan states.

## End-to-end read of the command block

Step 0 defines every variable before its first use, exports `DISABLE_AUTOUPDATER=1` and the `PATH` pin before the first `node "$PIN"` call, and records `JUDGE_SHA256`. Each judged command has a pin re-check immediately before it. Each server start has an SDK receipt before it (see N-1 for the pane detail). The free steps still use `npm run`, which is fine: they make no paid call and do not read the pin. `$HELPER` and `$PIN` point into the CANDIDATE worktree, so the BASE worktree at `d15a4ce5` does not need the new helpers, and the runner script is unchanged between the arms.

DELTA: LAUNCH-OK
