approve with changes

1. **should-fix — Preserve the other warning strings in the error details.**

   Evidence: `src/adapters/scout.ts:175-188` selects one warning and discards the remaining warnings.
   `test/adapters.test.ts:186-200` explicitly expects that information loss.
   The new error removes an existing advisory and any additional failure warning.

   I ran `node tmp/review-lane-b-evidence/probe.mjs`; it returned exit code 0.
   The `two-failures-and-advisory` case supplied three warning strings.
   The first string was the ignored-parameter warning from the fresh live response.
   The other strings reported two backend failures.
   The result retained only `backend read failed: operation timed out`.
   It contained no `details` field.
   See `tmp/review-lane-b-evidence/probe-results.json` for the complete input and output.

   This combination is synthetic; the two live controls did not contain a backend failure.
   However, the mapping deterministically removes useful request and failure information when warnings coexist.
   The ignored-parameter warning tells the caller that its requested filter did not apply.
   A second failure warning can identify another failed read.
   The retry instruction alone does not preserve either fact.

   Expected fix: keep `ok: false`, `kind: "error"`, `status: 200`, and the first failure message.
   Preserve the warning strings under `error.details.warnings`.
   The existing `AdapterError.details` field supports this change (`src/adapters/types.ts:48`).
   Keep surviving rows outside successful data.
   Add an assertion for both the advisory and the second failure warning.

2. **nit — State the warning shape and matcher boundary exactly in the documentation.**

   Evidence: `ARCHITECTURE.md:173` calls `meta.warnings` a string and describes a simple prefix match.
   The schema defines an array of strings.
   The implementation requires whitespace, a colon, or the string end after the prefix (`src/adapters/scout.ts:178`).
   The adapter header also omits this boundary (`src/adapters/scout.ts:22`).

   Command: `node tmp/review-lane-b-evidence/probe.mjs`; exit code 0.
   `backend read failed.` and `Backend read failed: timeout` remained successful data.
   The near-prefix control also remained successful data.
   These synthetic cases demonstrate the implementation boundary.
   They do not establish that Scout emits these spellings.

   Expected fix: describe an element of the `meta.warnings` array.
   State the exact case-sensitive matcher or its full boundary rule.
   Preserve the current matcher until upstream evidence supports a broader rule.

Review evidence

The reviewed base was `76c7f02be5fba31c4377f067f37412bb6e5b9d4b` (`origin/main`).
The diff contained exactly four tracked files.
It contained 163 added lines and one removed line.
The four files matched the author's report and the allowed scope.
No tracked generated artifact changed.
The supplied untracked round directory remained present.

All review writes stayed under `tmp/`.
I used `tmp/review-lane-b-scratch` for builds and source-removal experiments.
Its tracked content matched the submitted change before the gates.
It used the existing dependency installation and copied type declarations.
I did not copy or inspect `.env` or `.dev.vars`.
The final hash comparison found no changed tracked file in the original worktree.
No commit, paid evaluation, deployment, or service burst occurred.

The required measurements reproduced:

| Measurement | Independent result |
| --- | --- |
| Initial 78 adapter cases against the base adapter | 75 passed; 3 failed; exit 1 |
| Initial 78 adapter cases against the changed adapter | 78 passed; exit 0 |
| Final 84 adapter cases against the base adapter | 79 passed; 5 failed; exit 1 |
| Final 84 adapter cases against the changed adapter | 84 passed; exit 0 |
| Full unit suite | 135 files; 2,377 passed; 3 expected failures; exit 0 |
| Full smoke suite | 7 files; 104 passed; exit 0 |
| Type check | Exit 0 |
| Build | Exit 0; dry run only |
| Secret scan | Exit 0; no findings |
| Normal live control | HTTP 200; 1 returned row; total 190; strict; no warning |
| Advisory live control | HTTP 200; 1 returned row; total 190; strict; ignored-parameter warning |
| Current OpenAPI version | 1.9.61 |

I reconstructed the initial 78-case stage by removing only the six later boundary cases in the scratch copy.
The three original failures reproduced exactly.
The two additional failures in the final suite tested the bare and space-delimited failure prefixes.
This confirms that the tests detect the adapter change.
I restored the scratch source and tests after the experiment.

The smoke tests confirmed both zero-row and surviving-row behavior (`test/smoke/executor.test.ts:439`).
Both recorded `total: 1`, `ok: 0`, `error: 1`, and `softEmpty: 0`.
Both recorded `service-inconclusive`.
The outer execute call completed successfully, as the report states.

The smoke run reported a denied default Wrangler log write and dependency source-map warnings.
It also reported the missing local tail consumer.
These messages did not cause test failures.

I rebuilt the instruction map through `npm run build` in the scratch copy.
The generated-artifact comparison returned exit 0 with no diff.
The change does not alter catalog inputs, catalog output, inventory, exposure, or evaluation files.
A separate catalog rebuild was therefore unnecessary.
The secret scanner checked all tracked scratch files and passed its Gitleaks check.
The scratch copy contained no local secret files, so the scanner did not perform local-value comparisons.

Warning and downstream checks

- The matcher rejects embedded advisory text and the tested near-prefix.
  It does not depend on a query, operation ID, category, or row count.
  I found no compatibility branch or second envelope format.
- The uppercase, leading-space, and period variants remained successful data.
  The synthetic `backend read failed: false` string returned an error.
  These tests expose the matcher limits; they do not prove an upstream defect.
- Discarding surviving rows from successful data is reasonable for this observed failure signal.
  The response does not establish which rows remain trustworthy or whether the requested set is complete.
  Returning `ok: true` would let failed reads count as usable service evidence.
  The requested error mapping avoids that error.
- `AdapterError.status` represents the upstream HTTP status (`src/adapters/types.ts:42`).
  It does not determine success.
  `errResult` accepts the value unchanged (`src/adapters/types.ts:59`).
- The provider records `result.ok` and `result.error.kind` (`src/executor/providers.ts:446-457`).
  The ledger counts those outcomes (`src/executor/run.ts:154-169`).
  The evidence summary derives its class from the ledger (`src/executor/run.ts:390-405`).
  These paths do not reinterpret HTTP 200 as success.
- The demo uses operation counts and evidence classes (`src/demo/tools.ts:105-125`, `src/demo/steps.ts:128-135`).
  The usage collector counts tool events and the Worker invocation outcome (`src/usage/collector.ts:63-82`).
  It does not use the adapter HTTP status.
  I found no downstream status-based success branch affected by this change.
- The existing `meta.error` mapping remains soft-empty unless the new failure warning also exists.
  The advisory-only and genuine-empty controls preserve their existing results.

Upstream evidence limit

The upstream-emitter audit remains incomplete, as the author states.
I independently opened the public repository and inspected the saved checkout.
Its commit was `3b587aa9f23d21fc572f6e93cb6d11031dbc24e6`.
Its five tracked files contain documentation and a license, without backend source.
The [upstream README](https://github.com/Stellar-Light/stellar-scout/blob/3b587aa9f23d21fc572f6e93cb6d11031dbc24e6/README.md#L122) states that the application source migration remains pending.

I downloaded the [current specification](https://stellarlight.xyz/api/openapi.json) independently.
Its shared warning schema supplies strings, without a structured backend-failure code.
The operation descriptions also document advisory warnings and partial research results.
They do not establish the exact text of every backend-failure warning.
The matching prefix therefore rests on the supplied incident, rather than a complete emitter inventory.
Do not describe this repair as complete coverage of every Scout backend failure.
No report number failed to reproduce.

Commands and exit codes

All gate commands ran without pipes.
The gate working directory was `/Users/kalepail/Desktop/stellar-raven-codemode-worktrees/lane-b/tmp/review-lane-b-scratch`.
Other listed commands ran from the original worktree unless their arguments specify another directory.

| Exact command | Exit code | Context |
| --- | --- | --- |
| `git clone --shared . tmp/review-lane-b-scratch` | 0 | Create the isolated review copy |
| `git rev-parse origin/main` | 0 | Verify the fixed base |
| `git diff origin/main` | 0 | Read the complete submitted diff |
| `git status --short` | 0 | Initial and final scope checks |
| `git diff --check` | 0 | Check whitespace |
| `git diff --cached --stat` | 0 | Confirm no staged change |
| `git diff --numstat origin/main` | 0 | Confirm changed-file line counts |
| `npm run typecheck` | 0 | Submitted change |
| `npm test` | 0 | Submitted change |
| `npm run test:smoke` | 0 | Submitted change |
| `npm run build` | 0 | Submitted change; regenerate the instruction map |
| `npm test -- test/adapters.test.ts` | 1 | Base adapter; final 84 tests |
| `npm test -- test/adapters.test.ts` | 1 | Base adapter; reconstructed initial 78 tests |
| `cp src/adapters/scout.ts tmp/review-lane-b-scratch/src/adapters/scout.ts` | 0 | Restore the changed adapter |
| `npm test -- test/adapters.test.ts` | 0 | Changed adapter; initial 78 tests |
| `cp test/adapters.test.ts tmp/review-lane-b-scratch/test/adapters.test.ts` | 0 | Restore the final tests |
| `npm test -- test/adapters.test.ts` | 0 | Changed adapter; final 84 tests |
| `git -C tmp/review-lane-b-scratch diff --exit-code -- src/mcp/micro-map.ts catalog/manifest.json specs/super-spec.json` | 0 | No generated-file difference |
| `git -C tmp/review-lane-b-scratch diff --stat` | 0 | Scratch diff matches the submitted scope |
| `npm run secrets:scan -- --tree` | 0 | Final submitted source in the scratch copy |
| `node tmp/review-lane-b-evidence/probe.mjs` | 0 | Ten independent warning probes |
| `git -C tmp/lane-b-evidence/stellar-scout rev-parse HEAD` | 0 | Verify the saved upstream commit |
| `git -C tmp/lane-b-evidence/stellar-scout ls-tree -r --name-only HEAD` | 0 | Verify upstream file inventory |
| `curl --fail --silent --show-error --max-time 30 --dump-header tmp/review-lane-b-evidence/normal.headers --output tmp/review-lane-b-evidence/normal.json 'https://stellarlight.xyz/api/projects/search?q=wallet&limit=1'` | 0 | First live control |
| `curl --fail --silent --show-error --max-time 30 --dump-header tmp/review-lane-b-evidence/advisory.headers --output tmp/review-lane-b-evidence/advisory.json 'https://stellarlight.xyz/api/projects/search?q=wallet&limit=1&unreadProbe=1'` | 0 | Second live control |
| `curl --fail --silent --show-error --max-time 30 --output tmp/review-lane-b-evidence/openapi.json 'https://stellarlight.xyz/api/openapi.json'` | 0 | Independent schema download |

Read-only inspection also used `cat`, `nl`, `sed`, and `rg` for the files cited above.
Three inspection batches encountered nonexistent usage paths or an unmatched shell glob.
Their exit codes were 1, 2, and 1.
The corrected inspection read `src/usage/collector.ts` through `usage/wrangler.jsonc`.
Searches for probe files and nested instruction files returned no matches.
No author probe script existed to rerun; the independent script is retained beside this report.
The setup, scratch reconstruction, response inspection, and final hash-check Python commands each returned exit 0.
The final hash check printed `Tracked files changed during review: []`.

The scratch copy was removed after verification, so it cannot add tests to later worktree runs.
The cleanup and repeated hash-check Python command returned exit 0.
The original tracked files remained unchanged.

## Verification

Final verdict: **approve**.

Verified on 2026-10-02 at HEAD `eef8cc9d6bcfbadd15e8f2bfd9714bbeec0c0d49`.
I read the author's `## 7. Review fixes` section and inspected `git diff origin/main`.
Both review findings are resolved.

1. The adapter preserves the complete warning array under `error.details.warnings` (`src/adapters/scout.ts:177-191`).
   The first matching failure warning remains the error message.
   The response retains `ok: false`, `kind: "error"`, and `status: 200`.
   The tests assert preservation of the advisory and both failure warnings (`test/adapters.test.ts:178-206`).
   Both zero-row and surviving-row cases passed.
2. The documentation describes the `meta.warnings` string array and the exact case-sensitive matcher boundary.
   Both `ARCHITECTURE.md:173-176` and the adapter header (`src/adapters/scout.ts:22-25`) state the corrected behavior.
   The required suffix is whitespace, a colon, or the string end.
   This matches `/^backend read failed(?:\s|:|$)/` at `src/adapters/scout.ts:181`.

I ran both required commands bare in the original lane B worktree.

| Command | Exit code | Result |
| --- | --- | --- |
| `npm test -- test/adapters.test.ts` | 0 | One test file passed; all 84 tests passed. |
| `npm run typecheck` | 0 | Passed. |

No review finding remains open.
The earlier upstream-source limitation remains unchanged.
This verification approves the bounded repair, without claiming coverage of every possible Scout failure warning.
I did not modify source files or create a commit.
