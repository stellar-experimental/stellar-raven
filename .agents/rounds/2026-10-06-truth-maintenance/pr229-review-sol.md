# Independent review of PR #229

Date: 2026-10-06.
Verdict: **approve-with-changes**.

The adapter preserves the distinction between data, errors, and soft-empty results.
I found two low-severity changes for documentation and test coverage.
I found no blocking adapter defect.
The full unit suite remains unverified because this sandbox prevents process inspection.

## Review scope

Worktree: `/Users/kalepail/Desktop/srcm-impr-followup`.
Branch: `improvements/2026-10-06-followup`.
Command: `git diff origin/main...HEAD`.
Base: `c06dadbda3503d63e6bc50acf1533a601f3d7b9c`.
Head: `c87b3ff7418fa1ca665c5afbd3a8992143a03617`.

The review covers commits `4a667840` and `c87b3ff7`.
I did not edit tracked files, commit, push, or post to GitHub.

## Findings

### 1. Low / P3: Update the documented Scout error contract

Evidence: `src/adapters/scout.ts:203` and `ARCHITECTURE.md:173` through `ARCHITECTURE.md:179`.

The adapter now rejects `meta.partial === true` without a failed-read warning.
The architecture description still identifies only the warning signal.
It also says `meta.error` remains soft-empty unless a failed-read warning exists.
That statement conflicts with the new partial-page branch.
For example, `{meta:{partial:true,error:"no_query"}}` produces an error without warnings.

Update the architecture description to include `partial === true`, `failedReads`, and the fallback message.
State that either failure signal takes priority over `meta.error`.
This change meets the repository requirement that documentation describes current behavior.

### 2. Low / P3: Add negative tests for the new signal

Evidence: `test/adapters.test.ts:208`, `test/adapters.test.ts:238`, and `test/adapters.test.ts:255`.

The new tests cover partial pages with empty rows, populated rows, and missing `failedReads`.
They also cover a complete page with `partial:false`.
They do not cover non-boolean `partial`, malformed `failedReads`, or partial-only priority over `meta.error`.
They do not cover the combination of a failed-read warning and `partial:false`.

Add a small table for these cases.
Assert that non-boolean values alone preserve successful data.
Assert that malformed read details cannot change a partial page into successful data.
Assert that either failure signal overrides `meta.error`.

These cases passed the separate review checks.
The finding concerns missing regression coverage, not an observed classification defect.

## Adapter and consumer checks

Command: `curl -sS https://stellarlight.xyz/api/openapi.json -o tmp/pr229-scout-openapi.json`.
The command returned exit code 0.
The live specification reports version `1.9.71`.
Its [Meta schema](https://stellarlight.xyz/api/openapi.json) defines `partial` as a boolean.
It defines `failedReads` as an array of objects with required string fields `read` and `cause`.
The schema identifies six operations that always include these fields.
Those operations are `searchProjects`, `searchRepos`, `getBuilders`, `searchResearch`, `listSkills`, and `getHackathons`.
The schema distinguishes backend-read warnings from ignored-parameter warnings.

Command: `node tmp/pr229-edge-check.mjs`.
The command returned exit code 0 and passed 31 checks.
Results: `tmp/pr229-edge-check-results.json`.

The checks confirmed these behaviors:

- A missing `partial` field preserves successful data for `scout.getPeople`.
- String, number, object, array, null, and false values do not trigger the partial branch.
- Non-boolean values still permit the existing `meta.error` soft-empty branch.
- `partial:true` overrides `meta.error`, including without warnings.
- Malformed `failedReads` values produce the fallback message without throwing.
- Mixed arrays contribute only valid string pairs to the generated message.
- Error details preserve the original arrays, including malformed array elements.
- Non-array warning and read details are omitted.
- A failed-read warning triggers an error even with `partial:false`.
- A warning supplies the message when both signals exist.
- `failedReads` alone does not introduce another failure signal.

Consumer evidence: `src/executor/providers.ts:444`, `src/executor/providers.ts:455`, and `src/executor/providers.ts:376`.
The provider redacts the complete envelope before returning it.
The separate provider check confirmed redaction in both the generated message and `details.failedReads`.
It recorded an error outcome without successful service data.
The envelope warning consumes `message` as a string and requires no warning-prefix match.

Consumer evidence: `src/executor/run.ts:154` and `src/mcp/tools.ts:564`.
The executor counts the error kind separately from soft-empty outcomes.
The MCP error guidance uses the operation counts.
It does not require `details.warnings` or parse the generated message.
Existing assembled-worker tests also cover Scout warning failures with empty and populated rows.
No consumer requires the previous details shape.

## Evidence and status checks

I read six PR references with `gh pr view`.
Each command returned exit code 0.
Saved responses use `tmp/pr229-gh-<owner>-<repo>-<number>.json`.

| Reference | Independent result |
| --- | --- |
| [soroswap/docs#48](https://github.com/soroswap/docs/pull/48) | Open at `08bccc152a4b7f3e7f8df40b467205ea8cb3f503`; no checks or reviews. |
| [trustlesswork-skill#17](https://github.com/Trustless-Work/trustlesswork-skill/pull/17) | Open; `REVIEW_REQUIRED`; no maintainer reply. |
| [trustlesswork-skill#18](https://github.com/Trustless-Work/trustlesswork-skill/pull/18) | Open; `REVIEW_REQUIRED`; no maintainer reply. |
| [stellar-protocol#2021](https://github.com/stellar/stellar-protocol/pull/2021) | Open at `53557ae2`; four successful checks; the recorded approval and squash auto-merge remain present. |
| [stellar-docs#2367](https://github.com/stellar/stellar-docs/pull/2367) | Closed unmerged on 2026-09-09; ElliotFriend names #2837 as its replacement. |
| [stellar-docs#2837](https://github.com/stellar/stellar-docs/pull/2837) | Open at `108ba24e0884f46e0c543996e4e94be754709840`; nine successful checks; `REVIEW_REQUIRED`. |

The PR-file reads confirmed the Soroswap label removal and the Trustless Work changes.
PR #18 adds a universal `x-api-key` requirement without resolving beta bearer authentication.
PR #17 fixes the two grouped links and introduces the recorded additional error groups.

The issue-comment reads confirmed the three claims by `SrvFernandes`.
They also confirmed the [stale notice for #2010](https://github.com/stellar/stellar-protocol/issues/2010#issuecomment-5958579026).
[Scout issue #1751](https://github.com/Stellar-Light/stellarlight/issues/1751) has no comments.

The PR #2021 REST response reports `mergeable_state: blocked`.
The GraphQL response confirms one unresolved, outdated review thread.
The `protect-master` ruleset requires review-thread resolution.
The comparison with `master` shows that the PR contains the current base.
These checks support the recorded author action.
Evidence: `tmp/pr229-gh-extra-0.json`, `tmp/pr229-gh-extra-2.json`, `tmp/pr229-protect-master.json`, and `tmp/pr229-protocol-compare.json`.

The live probes confirmed the continued documentation defects:

- The Guestbook prerequisites return HTTP 200 with 30 case-insensitive LaunchTube matches and two archived repository links.
- The smart-wallet page returns HTTP 200 with two archived repository links and no Smart Account Kit match.
- Five Passkey Kit matches require counting both `Passkey Kit` and `passkey-kit`.
- Both Soroswap pages return HTTP 200 with the recorded stale labels.
- The protocol READMEs still lack the proposed SLP index.
- CAP-0075 still contradicts its degree list at lines 78, 124, and 157.

Evidence: `tmp/pr229-live-results.json` and `tmp/pr229-live-0.txt` through `tmp/pr229-live-8.txt`.
Commands use `curl -sS -L --max-time 30` against the recorded URLs.
All nine probes returned exit code 0 and HTTP 200.

Eight additional Trustless Work probes reproduced the recorded HTTP results.
The two ungrouped links returned 404; their grouped replacements returned 200.
The four additional sampled links returned 404.
Evidence: `tmp/pr229-trustless-http-results.json`.

A live Scout Payments search returned `partial:false`, `failedReads:[]`, and total `303`.
A live people request omitted `partial` and returned one row successfully.
These probes support the distinction between operations with and without the new fields.

No finding status changes in the reviewed diff.
The index changes only recurrence counts.
The Scout record explicitly retains its status pending an independent burst replay.
I did not repeat that load-sensitive burst or independently verify its historical response hash.
The retained status does not depend on accepting that replay as proof of a fix.

## Verification commands

| Command | Exit code | Result |
| --- | --- | --- |
| `npm run typecheck` | 0 | Passed. |
| `npm test` | 1 | Startup failed because the shared `node_modules/.vite-temp` path is outside the writable sandbox. |
| `npm run test:smoke` | 1 | The same configuration-cache write failed before tests started. |
| `npm run improvements:lint` | 0 | Passed for 66 findings, including the generated index check. |
| `npm test -- --configLoader native --cache=false` | 1 | 135 files passed; one file failed; 2390 tests passed; 29 failed; three expected failures. |
| `npm run test:smoke -- --configLoader native --cache=false` | 0 | Seven files and 104 tests passed. |
| `npm test -- --configLoader native --cache=false test/adapters.test.ts test/executor-providers.test.ts test/mcp-instructions.test.ts` | 0 | Three files and 185 tests passed. |
| `node tmp/pr229-edge-check.mjs` | 0 | All 31 review checks passed. |
| `git diff --check origin/main...HEAD` | 0 | Passed. |

The native loader avoids the blocked configuration-cache write.
The full-suite failures occur in `test/qa-paired-launch.test.mjs`.
The output contains `spawnSync ps EPERM`, cleanup failures, and fixture startup timeouts.
That file and its process-control code do not change in this PR.
I cannot certify the full unit suite from this environment.
Rerun the normal suite in an environment that permits its process-control checks.

Logs: `tmp/pr229-test.log`, `tmp/pr229-test-native.log`, `tmp/pr229-smoke-native.log`, and `tmp/pr229-focused-tests.log`.
The final `git status --short` showed no tracked changes.
