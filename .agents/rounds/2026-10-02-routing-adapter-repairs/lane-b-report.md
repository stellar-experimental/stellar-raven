# Lane B report — 2026-10-02-routing-adapter-repairs

Worktree: /Users/kalepail/Desktop/stellar-raven-codemode-worktrees/lane-b
Branch: fix/scout-failed-read-not-data

## 1. Change

The adapter now returns an error for the reported Scout failure warning.
All required verification commands passed.
The public repository does not contain the backend implementation.
Thus, the complete upstream warning-emitter audit remains unavailable.

| File | Change |
| --- | --- |
| src/adapters/scout.ts:22 | Adds the failed-read row to the mapping table. |
| src/adapters/scout.ts:170 | Checks warning strings before the existing meta.error branch. |
| test/adapters.test.ts:178 | Adds 12 cases for failed reads, advisory warnings, and existing miss behavior. |
| test/smoke/executor.test.ts:439 | Adds two executor cases for failed reads with zero or one row. |
| ARCHITECTURE.md:173 | Documents the mapping, retry advice, and unchanged advisory behavior. |

The matcher is /^backend read failed(?:\s|:|$)/.
It checks each string in meta.warnings.
It returns the first matching warning as error.message.
It preserves the HTTP status as 200.
It returns ok: false and kind: "error".
The hint advises one retry, then an inconclusive result.
The adapter does not make an automatic retry.

The failure check does not depend on an operation ID, query, category, or row count.
Other warnings remain in the unchanged successful payload.
The existing meta.error branch still returns soft-empty.
A failed-read warning takes priority when both signals occur.

The tree contains four changed tracked files.
All changes remain unstaged.
The supplied untracked round directory remains unchanged.
No commit, push, deployment, paid evaluation, or Algolia write occurred.
The required build script generated its outputs.
It produced no changes to tracked generated files.

## 2. Rationale

General rule: A service-reported backend read failure makes the result inconclusive, regardless of HTTP success or surviving rows.

HTTP 200 describes the response transport.
It does not prove that the backend read succeeded.
A soft-empty result would confuse a failed read with a genuine miss.
A zero-row check would miss partial failures with surviving rows.
Matching every warning would incorrectly reject advisory responses.
Matching timeout text alone would reject unrelated fallback advice.
The anchored prefix matches the signal reported in the incident.

The supplied incident already identified the cause.
I used the diagnosing-bugs skill to verify that cause with a deterministic adapter test.
The test failed before the fix and passed after it.
I omitted burst reproduction because the brief forbids it.
I omitted speculative cause searches after the adapter test reproduced the exact mapping failure.

### Upstream evidence and warning inventory

I cloned the requested public repository at commit 3b587aa9f23d21fc572f6e93cb6d11031dbc24e6.
It contains README.md, SKILL.md, LICENSE, and two reference files.
It contains no backend source or warning-emitter implementation.
The [upstream README, line 122](https://github.com/Stellar-Light/stellar-scout/blob/3b587aa9f23d21fc572f6e93cb6d11031dbc24e6/README.md#L122) describes the pending source migration.
It directs readers to the live API, specification, and changelog.

I downloaded the [live OpenAPI specification](https://stellarlight.xyz/api/openapi.json).
Its version is 1.9.61.
The local snapshot is tmp/lane-b-evidence/openapi-live.pretty.json.
The public schema defines warnings as strings.
It supplies no structured warning code for the reported backend failure.
This does not prove that the unavailable implementation has no other failure signals.

| Warning family or behavior | Available evidence | Mapping in this change |
| --- | --- | --- |
| Warning starts with backend read failed and reports a timeout | Supplied brief-lane-b.md:9-12; .agents/TODO.md:28-32 | Error; status 200; first matching warning as message |
| Unknown parameter ignored; results are not filtered | inventory/stellar-light.json:980-986; live snapshot:10586-10592; captured advisory response | Successful data; warning remains visible |
| Research falls back to keyword search and states the reason | Live snapshot:7, specification description | Successful data unless the reported failure prefix also occurs |
| Several-source research omits an unreadable source and records its status | Live snapshot:7906 and :8043 | Existing mapping; no new string family assumed |
| Builder code-language pass reaches a read ceiling | inventory/stellar-light.json:4416-4417; live snapshot:3827-3832 | Existing mapping; truncation is not this failure prefix |
| Builder code-language lookup fails; returned results use prose only | Same builder warning schema | Exact emitted warning text is unavailable |
| DeepWiki answer-dating disclaimer | inventory/stellar-light.json:10378-10379; live snapshot:2858 | Successful data; no failure-prefix match |
| Unknown parameters on changelog and RFP reads | Live snapshot:2296 and :5363 | Successful data; no failure-prefix match |

The table lists all warning categories described by the downloaded public schema.
It does not claim to enumerate all warning strings emitted by the unavailable backend.
The shared Meta.warnings description only describes ignored parameters.
The incident and operation-specific schemas show that warnings have additional meanings.

No backend-failure warning occurred during the two permitted searchProjects checks.
The exact timeout suffix in the regression tests is synthetic.
The lowercase failure prefix comes from the supplied incident.
The bare-prefix and space-delimited variants are synthetic matcher-boundary tests.
The failure-with-rows case is also synthetic.
I could not verify whether upstream emits that combination.
The adapter conservatively rejects it because the metadata reports a failed read.

## 3. Measurements

### Before and after adapter outcomes

The initial regression command ran 78 tests.
It failed exactly three new cases.
The advisory, genuine-empty, and meta.error controls passed before the fix.

| Case | Before | After | Change |
| --- | --- | --- | --- |
| Failure warning; zero rows | ok: true | ok: false; error; status 200 | Failed read no longer appears as data |
| Failure warning; one row | ok: true | ok: false; error; status 200 | Partial response no longer appears as usable data |
| Failure warning plus meta.error | soft-empty | error | Failure takes priority over a miss |
| Unread-parameter warning plus rows | ok: true; warning visible | Same | No change |
| Genuine empty search | ok: true; zero rows | Same | No change |
| meta.error: no_query plus advisory | soft-empty; code and advisory retained | Same | No change |

Six additional matcher cases passed after the fix.
They check bare and space-delimited failure prefixes.
They also check fallback advice, an embedded prefix, a near-prefix, and non-string warning entries.
I did not separately measure these six cases before the fix.

### Executor outcomes

| Injected response | After: operationSummary | After: evidenceSummary |
| --- | --- | --- |
| Failure warning; zero rows | total: 1; ok: 0; error: 1; softEmpty: 0 | service-inconclusive |
| Failure warning; one row | total: 1; ok: 0; error: 1; softEmpty: 0 | service-inconclusive |

Both assembled-worker tests passed.
The outer execute call completes successfully.
The service result inside it carries the error envelope.
These tests confirm that the host does not count surviving rows as successful service evidence.

### Live controls

I made two sequential, unauthenticated searchProjects requests.
I used limit=1 and did not burst the service.

| Request | HTTP | Returned rows | Total | Warning |
| --- | --- | --- | --- | --- |
| q=wallet&limit=1 | 200 | 1 | 190 | None |
| q=wallet&limit=1&unreadProbe=1 | 200 | 1 | 190 | Unknown parameter(s) ignored: unreadProbe |

Both responses contain meta, projects, and codeReferences.
Both report matchMode: strict.
The advisory response explicitly states that results do not use unreadProbe as a filter.

Evidence files:

- tmp/lane-b-evidence/search-projects-normal.json
- tmp/lane-b-evidence/search-projects-normal.headers
- tmp/lane-b-evidence/search-projects-advisory.json
- tmp/lane-b-evidence/search-projects-advisory.headers
- tmp/lane-b-evidence/openapi-live.json
- tmp/lane-b-evidence/openapi-live.pretty.json
- tmp/lane-b-evidence/stellar-scout/

These are normal-response controls, not a live before/after failure experiment.
The regression measurements use injected HTTP responses.
Probe ranks and ranking scores do not apply to this adapter change.
No catalog, ranking, exposure, inventory, or evaluation contract changed.
No paid per-case answer comparison occurred.

### Verification totals

| Command | Before fix | Final |
| --- | --- | --- |
| npm test -- test/adapters.test.ts | 75 passed; 3 failed; exit 1 | 84 passed; exit 0 |
| npm run typecheck | Not measured before fix | Exit 0 |
| npm test | Not measured before fix | 135 files; 2,377 passed; 3 expected failures; exit 0 |
| npm run test:smoke | Not measured before fix | 7 files; 104 passed; exit 0 |
| npm run build | Not measured before fix | Dry-run build passed; exit 0 |
| npm run secrets:scan -- --tree | Not measured before fix | No leaks; exit 0 |

## 4. Gates

All required commands ran without a pipe.
I ran no standalone wrangler command.
The required npm run build script invokes its existing Wrangler dry-run command.

| Command or invocation | Exit code | Result |
| --- | --- | --- |
| npm test -- test/adapters.test.ts — before fix | 1 | Expected regression failure; three failures |
| npm test -- test/adapters.test.ts — after mapping fix | 0 | 78 passed |
| npm test -- test/adapters.test.ts — after boundary tests | 0 | 84 passed |
| npm run typecheck — first check | 0 | Passed |
| npm run typecheck — final code check | 0 | Passed |
| npm test | 0 | 2,377 passed; three expected failures |
| npm run test:smoke | 0 | 104 passed |
| npm run build | 0 | Passed; no deployment |
| npm run secrets:scan -- --tree | 0 | Passed; no leaks |
| npm run secrets:scan -- --tree — final scan | 0 | Passed; no leaks |
| git diff --check — all three checks | 0 | Passed |
| git diff --cached --stat | 0 | No staged changes |

For the build, I set WRANGLER_LOG_PATH=$PWD/tmp/lane-b-evidence/wrangler-build.log.
The build log stays inside the worktree.
The smoke command passed despite a denied default log write under /Users/kalepail/.wrangler/logs.
The sandbox denied that write with EPERM.
The smoke output also reports dependency source-map and missing tail-consumer warnings.
No test failed because of these warnings.
The saved test outputs are tmp/lane-b-evidence/unit-tests.log and tmp/lane-b-evidence/smoke-tests.log.

Read-only source and service commands:

| Command | Exit code |
| --- | --- |
| git clone --depth 1 https://github.com/Stellar-Light/stellar-scout.git tmp/lane-b-evidence/stellar-scout | 0 |
| git -C tmp/lane-b-evidence/stellar-scout rev-parse HEAD | 0 |
| curl --fail --silent --show-error --max-time 30 --dump-header tmp/lane-b-evidence/search-projects-normal.headers --output tmp/lane-b-evidence/search-projects-normal.json 'https://stellarlight.xyz/api/projects/search?q=wallet&limit=1' | 0 |
| curl --fail --silent --show-error --max-time 30 --output tmp/lane-b-evidence/openapi-live.json 'https://stellarlight.xyz/api/openapi.json' | 0 |
| curl --fail --silent --show-error --max-time 30 --dump-header tmp/lane-b-evidence/search-projects-advisory.headers --output tmp/lane-b-evidence/search-projects-advisory.json 'https://stellarlight.xyz/api/projects/search?q=wallet&limit=1&unreadProbe=1' | 0 |

The other inspection commands used cat, sed, rg, nl, git status, and git diff.
Those inspection batches returned exit 0 except one obsolete filename-glob lookup.
That batch returned exit 1 because eval/qa/corpus/golden-qa*.json does not exist.
I then read the current corpus paths from eval/qa/README.md.
The Node inspection scripts returned exit 0.
They inspected response metadata and formatted the specification snapshot inside tmp/.
The web read opened the requested GitHub repository successfully.
File edits used apply_patch successfully.

## 5. Risks and open questions

The upstream backend source is unavailable at the specified public repository.
I cannot verify every warning emitter, exact delimiter, capitalization, or partial-failure path.
The matcher deliberately uses the observed lowercase prefix.
Other backend-failure warning families remain outside this bounded change.

A structured upstream failure code would provide a stronger contract.
The lead should request source access or an explicit warning contract before claiming complete failure coverage.
This work does not add an upstream issue or contact the service owner.

The adapter discards surviving rows when this failure warning occurs.
This prevents uncertain data from becoming evidence of an unused category.
The warning text remains available as the error message.
The adapter returns only the first matching failure warning.
It does not preserve an entire failed response as successful data.

The code preserves the broader existing meta.error soft-empty behavior.
The tests cover no_query and the failure-warning precedence.
This work does not redefine other meta.error values.

Independent review and the authorized paid measurement remain with the lead.

### Measurement recommendation before release

Use the canonical live QA lane, live-data-canonical-v3.
Select matched cases by their exact IDs.
Keep this diagnostic separate from the headline battery.

| Case | Purpose |
| --- | --- |
| q-live-ecosystem-crowded-underbuilt | Checks category counts and prevents unsupported market-absence claims |
| q-live-fluxity-status-provenance | Checks project lookup and lifecycle evidence |
| q-live-beans-cross-service-reconcile | Checks project lookup and cross-service uncertainty |
| q-live-builders-artifact-continuation | Checks that ordinary reads and completeness behavior remain usable |

The lead should also replay the saved original Stellar Docs adapter-measurement case.
Its exact case ID is not supplied in this brief.
Keep its original question, judge contract, and request trace.
Do not reconstruct it from the reported outcome.

A normal live run may never produce this rare warning.
Therefore, use a separate deterministic diagnostic that injects the failure into the original service-response position.
Use one response with zero rows and one response with surviving rows.
Use an unread-parameter response as the success control.
Keep these injected cases separate from the frozen live-corpus totals.
Do not edit goldens or use a 65-request burst to force the warning.

Measure whether the agent retries once.
Measure whether a repeated failure produces an inconclusive answer.
Measure whether the agent avoids absent, unused, or zero-category claims from the failed read.
Compare matched case verdicts and tool traces before and after the change.
Also check that successful warning-bearing responses keep their rows and warning text.

The canonical live QA recommendation follows eval/EVALS.md and eval/qa/README.md.
The lead must use the run-evals workflow for any paid collection.
This report does not authorize that collection.

## 6. Notes for the independent reviewer

Review the four changed tracked files.
The lead owns the independent review and release steps.

Check these points:

1. The prefix matches the supplied incident without matching embedded advisory text.
2. The failure check runs before meta.error.
3. A failure warning rejects rows as well as empty payloads.
4. Unread-parameter warnings stay visible in successful data.
5. Genuine empty results and meta.error retain their earlier behavior.
6. The executor ledger records the result as service-inconclusive.
7. The hint advises one retry without implementing an automatic retry.
8. The upstream-source limitation remains explicit in release claims.

The regression initially failed on the exact user-reported mapping.
The final adapter and executor tests pass.
The source-emitter enumeration still requires upstream implementation access.
