# Probe load review (Codex gpt-6-astra, high)

Reviewer: Codex frontier `gpt-6-astra` at high effort. The author and the orchestrator are Claude Opus 5.5,
so the reviewer differs from both. First pass: `8a662d80`. Delta pass: `63aed8fe`.

## First pass

# RQ review

Reviewed head `8a662d8001948a6d1440d1d3179cbabc1fa7a8f2` against base `826be10f`.
The diff contains three commits and 14 changed files.
I reviewed the implementation, tests, dated plan, run sheet, and archived attempts.
I made no paid call or live upstream request.
I started no server and changed only this report.

## Findings by severity

### P2 — The reuse age uses an adjustable clock

Evidence: `eval/qa/remote-identity-guard.mjs:367`, `:447`, `:460`, and `:587`.

The guard measures elapsed time with `Date.now()` and a saved wall-clock timestamp.
It rejects a negative difference, but this does not reject every backward clock change.
Suppose 120 seconds pass after the capture, and the clock moves backward by 90 seconds.
The calculated age becomes 30 seconds, so the guard reuses a capture that is 120 seconds old.

I reproduced this case with the injected clock.
The next before-check recorded `reusedFromSequence: 2`, and the probe count stayed at two.
The existing backward-clock test covers only a negative age.
See `test/qa-remote-identity-guard.test.mjs:702`.

Use a monotonic clock for the reuse limit.
Keep wall-clock timestamps for reporting.
Use one elapsed-time reading for the decision and its record.
Add a test where a backward correction leaves a positive age below 60 seconds.

### P2 — The v3 validator accepts guard checks for the wrong calls

Evidence: `eval/qa/paired-verdict.mjs:231`, `:241`, `:293`, and `:395`.

The validator checks each call identifier and attempt separately.
It never requires each after-check to match its preceding before-check.
It also does not connect the checked calls to the result rows.
The producer requires matching call contexts at `eval/qa/remote-identity-guard.mjs:562`.

I changed the first after-check to `id: "never-called"` and `attempt: 99`.
The comparison still returned `PASS`.
I then assigned every call check to `id: "not-in-results"` and `attempt: 700`.
That comparison also returned `PASS` for 100 unrelated result rows.
Both malformed records also passed recalibration with denominator 100.

The temporal checks have further gaps.
A recovered failure can precede the previous completed check.
A postflight can precede the first check by years.
Both mutations passed comparison and recalibration.
The failure validator checks the matching success as an upper bound, but provides no preceding-check lower bound.

Require matching before/after contexts and row coverage in execution order.
Validate attempt progression against the retained attempt evidence.
Define consistent timestamp rules, including the behavior after clock corrections.
Bind failed captures to the interval for their successful fresh check.
Some omissions existed before this change, but v3 still fails the requested complete-record validation.

### P2 — The plan understates the changed observation rule

Evidence: `.agents/rounds/2026-10-01-backlog-closeout/paired-run-sheet.md:248` and `:250`.
The dated plan still requires before/after captures at `.agents/rounds/2026-09-03-truth-maintenance/revised-impact-measurement-fable.md:83`.
It also retains the 14-response capacity contract at `:302` and `:305`.

The run sheet says reuse can only delay detection by one call.
That statement requires the changed identity to persist until the next successful capture.
A temporary change can disappear before that capture and remain undetected.

I reproduced the following sequence with the base guard and the new guard:

1. Call A finishes with identity A.
2. The upstream identity changes to B before call B starts.
3. The upstream identity returns to A before call B's after-capture.
4. Postflight also returns A.

The base guard stopped before call B.
The new guard allowed call B and reported matching vectors and a successful postflight.
This changes the observation guarantee, despite preserving the comparison functions.

Add a marked amendment to the dated plan and its stop-rule explanation.
State the temporary-change risk and qualify the one-call detection bound.
Also mark the 12-response v3 capacity contract as the current contract.
Preserve the older measurements as dated evidence.
The new authorization must describe this observation rule before the owner signs it.

### P3 — Attempt 2's request-failure statement exceeds the retained evidence

Evidence: `.agents/rounds/2026-10-01-backlog-closeout/paired-run-sheet.md:207`.
Archive evidence: `2026-10-11-paired-attempt-2-prelaunch/stable.stderr.log:1` through `:5`.

The log proves three failed settings attempts.
It proves two failed title-page attempts, followed by the terminal settings error.
It does not prove that the title request completed its third failed attempt.
The probe can exit after one concurrent request rejects.
Replace “Each request failed its 3 attempts” with the narrower observed statement.
This correction does not change the recorded stop or spend.

## Answers to the review questions

### 1. Probe equivalence and completeness

For identical complete responses, the successful vector bytes remain equal.
I compared the base and new probe with synthetic 100-hit pages.
Counts 1, 99, 100, 101, 650, 731, 999, and 1,000 produced identical vector bytes.
Both probes rejected 1,001 hits as truncated.
These checks used injected responses and made no network requests.

The new probe checks ten results at `eval/qa/probe-remote-identities.mjs:321`.
It validates page numbers, shared counts, hit arrays, and empty unused pages at `:329`.
It passes only used pages to the unchanged normalizer at `:340`.
The normalizer requires `nbHits === hits.length` at `:228`.
Thus, a 100-hit cap supports complete sets through ten pages.
An uncapped `nbPages` value above ten also fails.

The new probe is stricter about unused pages.
A malformed unused page now causes failure, although the old probe never requested it.
Thus, success behavior is not identical for every possible upstream response.
The added checks fail safely.
For one page, both implementations make two Algolia HTTP requests.
For multiple pages, the old implementation makes three and the new implementation makes two.

A changed page count or hit count causes rejection.
Neither implementation proves an atomic snapshot when content changes without changing those counts.
This existing limitation also prevents a universal equivalence claim for changing upstream states.
I found no removed response-consistency check.

### 2. Guard reuse, retries, cancellation, and detection delay

The first before-check and postflight capture fresh.
Only a successful after-check supplies the reusable vector.
The next before-check consumes that reference before proceeding.
Postflight clears it at `eval/qa/remote-identity-guard.mjs:604`.
An unfinished call blocks another before-check at `:537`.
These rules prevent reuse across intervening guarded calls.

A retry of the same answering row can reuse the previous attempt's successful after-capture.
That retry is an adjacent answering call, which matches the requested rule.
A failed fresh capture cannot fall back to a reused vector.
Cancellation and permanent failure close the guard.
Cancellation checks occur before reuse and immediately before the answering call.

Finding 1 shows that the 60-second bound fails under some clock corrections.
Finding 3 shows that reuse can hide a temporary identity change completely.
For a persistent change, the next successful after-capture detects the change.
At most one additional answering call starts in that guard before detection or capture exhaustion.
Both arms have separate guards, so both can start such a call.
The bound counts calls, not elapsed seconds.
It does not promise successful detection when probes remain unavailable.

### 3. Guard validation and consumers

The validator correctly rejects v2, reuse chains, nonadjacent references, after-check reuse, and postflight reuse.
It validates exact check fields, sequence numbers, vector hashes, canonical timestamp syntax, and both capture counts.
It also requires a fresh success for a recovered capture failure.
Finding 2 identifies the remaining accepted malformed records.

Recalibration uses the same validation path.
See `eval/qa/paired-verdict.mjs:990` and `eval/qa/validate-paired-verdict.mjs:332`.
My mutation checks exercised both exported paths with the committed comparison fixtures.

Repository searches found direct production guard-record handling in `run-qa.mjs` and `paired-verdict.mjs`.
The runner writes the new record and checks failure and cancellation separately.
I found no omitted production reader of `captures[]`.
The archived v1 records remain evidence only and cannot support a new v3 comparison.

### 4. Capacity contract

The runtime contract correctly counts 12 HTTP responses.
Each capture makes one Scout request, three Lumenloop requests, and two Stellar Docs requests.
Two concurrent captures therefore produce service counts 2, 6, and 4.
The new capacity test runs the committed probe with injected upstream responses.

The capacity producer and rejection function use the same exported v3 contract.
Plan assembly imports that contract and recomputes instrument and artifact hashes.
The supervisor checks the contract, artifact schema, hashes, thresholds, and freshness.
The launcher rechecks capacity before P6.
See `check-paired-capacity.mjs:9`, `paired-collection-supervisor.mjs:264`, `assemble-paired-plan.mjs:134`, and `paired-launch.mjs:181`.
These references are under `eval/qa/` or `.agents/rounds/2026-10-01-backlog-closeout/`.

The executable consumers agree.
The dated plan still specifies v2 and 14 responses, as finding 3 explains.
Therefore, every plan document does not yet agree.

### 5. PR #265 behavior and timeout

The bounded capture retry remains four attempts with waits of 30, 60, and 120 seconds.
Vector mismatch checks remain outside that retry loop.
The guard checks cancellation during one-second wait slices and before further answering work.
The production callback still reads the collection cancellation state at `eval/qa/run-qa.mjs:1734`.

The stderr allowlist accepts the new title-page label and rejects the retired labels.
It still restricts diagnostic messages to fixed labels, fixed text, and bounded numeric fields.
The touched tests passed, including the retained retry and cancellation cases.

All six requests now start in one concurrent phase.
The network budget is `3 × 20,000 + 2 × 5,000 = 70,000 ms`.
The process timeout adds 5,000 ms, giving 75,000 ms.
Four process attempts plus the waits give `4 × 75,000 + 210,000 = 510,000 ms`.
These are configured bounds with ordinary scheduling overhead outside the arithmetic.

A running synchronous probe still delays callback-based cancellation until it returns.
The supervisor can terminate it sooner under the existing drain rules.
The change reduces that existing exposure from 145 seconds to 75 seconds.
It does not guarantee artifact persistence during forced termination.

### 6. Bare test results

I ran this command directly, without a pipe:

```sh
npm test -- test/qa-attempt-metadata.test.mjs test/qa-paired-capacity.test.mjs test/qa-paired-collection-supervisor.test.mjs test/qa-paired-verdict.test.mjs test/qa-remote-identity-guard.test.mjs test/qa-remote-identity-probe.test.mjs
```

Result: six test files passed, 348 tests passed, zero failures, exit 0.
`git diff --check 826be10f...HEAD` also passed.
I additionally ran the in-memory comparison and mutation checks described above.
I did not rerun the author's complete build and maintenance gates.

### 7. Budget math and measured reuse rate

I recomputed the intervals from both attempt 1 result artifacts.
Each arm contains 145 rows and 290 successful captures.
Each arm therefore contains 144 between-row intervals.

| Arm | Intervals | At most 60 seconds | Longest interval |
| --- | ---: | ---: | ---: |
| Baseline | 144 | 144 | 37,394 ms |
| Candidate | 144 | 142 | 78,218 ms |
| Total | 288 | 286 | 78,218 ms |

The other long candidate interval is 60,347 ms.
The measured eligibility rate is `286 / 288 = 99.3056%`.
These timestamps mark completed captures, so they approximate the future reuse decision time.
They include the old before-probe duration and can therefore overestimate the new interval.

At the stated pace, both arms complete `2 × 145 × 60 / 109.2 = 159.3407` rows per hour.
The projected fresh captures per row are `1 + 2 / 288 = 1.006944`.

| Quantity | Recomputed value |
| --- | ---: |
| Previous steady load | 956.044 HTTP calls/hour |
| New expected steady load | 320.894 HTTP calls/hour |
| No-reuse steady load | 637.363 HTTP calls/hour |
| Capacity plus three stable captures | 10 HTTP calls |
| First before-checks plus postflights | 8 HTTP calls |
| Conservative expected first hour | 334.894 HTTP calls |
| Expected first-hour margin | 665.106 HTTP calls |
| Full 400-row projection | 823.528 HTTP calls |

The reported rounded budget is correct under its assumptions.
The no-reuse first-hour estimate adds the first before-checks twice.
That makes its approximately 651-call estimate conservative by four calls.
The 151-minute duration describes projected collection, excluding the stable probe's ten-minute waiting period and other launch work.

The calculation assumes one quota unit per HTTP request, including a ten-query request.
The run sheet states that assumption and admits that the live comparison did not measure it.
If each search query consumes a unit, the expected steady load becomes approximately 1,765 units per hour.
The stated margin would then disappear.
I did not independently verify quota accounting or the reported key limits through a live request.

The projection also assumes unchanged row pace, comparable reuse eligibility, and no additional shared-key traffic.
It excludes request retries, capture retries, and extra answering attempts.
It is a planning estimate, not an enforced hourly ceiling.

### 8. Attempt 2 amendment

The archive exists at the stated path in the main checkout.
Its accepted v2 capacity result completed at `2026-10-11T02:45:44.948Z`.
Its stable-probe stderr records HTTP 429 errors.
It contains no assembled plan, signature, P6 marker, collection marker, or result directory.
The launcher runs stable capture before assembly and paid phases at `paired-launch.mjs:148`.
These records support the prelaunch stop and `$0` paid spend.
The process journal reports `cleanup.complete: true`, with no unresolved processes, listeners, or errors.

Finding 4 corrects the unsupported statement about both requests exhausting three attempts.
The stderr file has no timestamps.
It cannot independently prove the approximate 02:55Z failure time or the preceding 30-minute idle interval.

### 9. Attempt 3 and launch preconditions

No reviewed rule forbids a new attempt solely because these two attempts stopped.
Neither archive records a completed statistical comparison.
The two-look limit governs statistical looks, not these incomplete launch attempts.
It does not authorize a third statistical look.

Preserve both archives and all existing phase markers.
Use an unused launch directory, a new assembled plan, and a new owner signature.
The four named conditions are necessary, but they are not the complete launch contract.
The launch also requires reconciled review findings, clean pinned worktrees, matching identities, valid surfaces, and all owner decisions.
It must pass P6 within its budget and retain the required summary.
Capacity must remain valid through supervisor launch.
Existing spend caps, cancellation rules, cleanup rules, and the four-hour deadline still apply.

The idle hour ends at the capacity check and must include every process sharing this key and IP address.
The reported `03:57:41Z` comparison permits no earlier start than `04:57:41Z`, assuming no later key use.
The stable probe requires three equal vectors with five-minute intervals.
The launch must start on a weekend UTC day.

Resolve findings 1 and 2 before approving the code.
Amend the observation and capacity contracts, and correct the attempt 2 statement before requesting the new signature.

CODE-DELTA: CHANGES: Use monotonic reuse timing and validate call contexts, row coverage, and capture chronology.
PLAN-DELTA: BLOCKED: Reconcile the code findings and amend the reuse guarantee, capacity contract, and attempt 2 evidence.


## Delta pass

# RQ2 delta review

Reviewed `8a662d80..63aed8fe`, including commits `019e8c59` and `63aed8fe`.
The current head is `63aed8fee3bf641eb30a56585ac97b8c31e75ad1`.
I reviewed all eight changed files and the relevant producer, consumer, and authorization paths.
I made no live upstream call or paid model call.
I started no server and changed only this report.

## Findings

All four RQ findings are fixed.
I found no new defect that blocks approval in this delta.

## Finding reconciliation

### 1. Adjustable reuse clock — fixed

`eval/qa/remote-identity-guard.mjs:372` supplies `performance.now()` as the default monotonic clock.
The guard records an origin and whole elapsed milliseconds at `:395`.
It calculates reuse age from elapsed times at `:469`.
The decision and reuse record share the same clock reading at `:473`.
Wall-clock corrections no longer extend the reuse interval.

I repeated the original failure case with separate injected clocks.
The monotonic clock advanced 120 seconds, while the wall clock advanced only 30 seconds.
The second call captured fresh.
The guard made four probes and recorded `reusedFromSequence: null` and `elapsedMs: 120000`.

The tests retain the 60,000 ms acceptance boundary and reject 60,001 ms.
They also cover a backward injected monotonic reading and the original backward wall-clock correction.
The existing cancellation checks remain before reuse and before the answering call.

### 2. Wrong call contexts and incomplete chronology — fixed

`eval/qa/paired-verdict.mjs:237` derives the answering sequence from each row's retained `attempts.agent[]`.
It requires nonempty attempt lists numbered consecutively from one.
The validator requires exact call-count agreement at `:467`.
It binds both checks to each call's identifier and attempt at `:274`.
It also requires exactly two checks per call and one final postflight.

The check sequence uses nondecreasing integer `elapsedMs` values at `:285`.
Reuse age now uses those values at `:294`.
Failed attempts must fall between their preceding check and matching fresh success at `:337`.
The first check uses zero as its lower bound.
This also binds postflight failures to the interval after the last answering check.

Wall-clock timestamps retain canonical ISO validation.
Each timestamp must agree with the first check's elapsed-time reference within 300,000 ms at `:255`.
Thus, a 90-second correction can pass, while the original years-earlier postflight cannot pass.
Larger corrections cause comparison rejection; they cannot extend the runtime reuse age.

I repeated the four malformed-record checks from RQ:

| Mutation | Comparison | Recalibration |
| --- | --- | --- |
| After-check names `never-called`, attempt 99 | Rejected | Rejected |
| All call checks name `not-in-results`, attempt 700 | Rejected | Rejected |
| Recovered failure predates the preceding check | Rejected | Rejected |
| Postflight timestamp falls years before the first check | Rejected | Rejected |

Each comparison returned `INDETERMINATE` with a `remote-identity-guard` reason.
Each recalibration raised the corresponding guard-validation error.
The unchanged control returned `PASS`, and recalibration accepted its 100 rows.

I also checked a record from the actual guard producer with a retried answering row.
Comparison returned `PASS`, and recalibration accepted all 100 rows.
This verifies agreement between the producer and validator for ordinary answering retries.

The production runner saves completed attempts in execution order at `eval/qa/run-qa.mjs:1890`.
Stored judging preserves those attempts at `:1210`.
The stricter context check therefore matches the production record shape.

These checks establish record consistency.
They do not independently authenticate upstream observations or compare answering timestamps with guard intervals.
That stated limit does not reopen the four RQ reproduction cases.

### 3. Observation rule and capacity amendment — fixed

The dated plan now includes the capture-reuse amendment in its stop rules.
See `.agents/rounds/2026-09-03-truth-maintenance/revised-impact-measurement-fable.md:510`.
It specifies the monotonic limit, fresh first check, and fresh postflight.
It qualifies detection by requiring the changed identity to persist until a successful capture.
It limits the additional answering work per arm's guard.
It explicitly states that temporary changes between fresh captures can escape observation.

The capacity amendment at `:318` identifies v3 as the current contract.
It requires six requests per capture and 12 responses across both captures.
The service counts are Scout 2, Lumenloop 6, and Stellar Docs 4.
It preserves the other thresholds and labels the v2 text and artifact as dated evidence.
The authorization template now names the fixed v3 contract at `:637`.

I reproduced the launcher's authorization-text extraction in memory.
The extracted template names v3.
The extracted stop rules include the monotonic reuse rule and temporary-change limitation.
The launcher uses these sections at `.agents/rounds/2026-10-01-backlog-closeout/paired-launch.mjs:159`.
Thus, the generated authorization includes the corrected observation rule.

The run sheet and QA README now describe the same rule.
The run sheet also corrects the no-reuse first-hour estimate to approximately 647 calls.
The corresponding margin is approximately 353 calls.

### 4. Attempt 2 request-failure statement — fixed

The corrected statement appears at `.agents/rounds/2026-10-01-backlog-closeout/paired-run-sheet.md:204`.
It distinguishes the timestamp-free log from its modification time.
It attributes the preceding idle interval to the orchestrator.
It reports three settings failures and two title-page failures, followed by the terminal settings error.

I checked the archived stderr again.
Its five lines support that statement.
Its modification time is `2026-10-11T02:55:47.516Z`, which supports the approximate 02:55Z description.
The correction preserves the supported prelaunch stop, archive location, and `$0` paid spend.

## Delta checks

I ran all three touched test files directly, without a pipe:

```sh
npm test -- test/qa-attempt-metadata.test.mjs test/qa-paired-verdict.test.mjs test/qa-remote-identity-guard.test.mjs
```

Result: three files passed, 222 tests passed, zero failures, exit 0.
`git diff --check 8a662d80..63aed8fe` also passed.
The independent clock, record-mutation, producer-record, and authorization-extraction checks passed.
I did not rerun the author's complete build and maintenance gates.

The delta preserves the probe requests, process timeout, capture retries, stderr allowlist, and cancellation checks.
It adds no upstream traffic.
The capacity implementation remains unchanged from the earlier reviewed v3 contract.

## Launch limits

This approval completes the requested delta review.
It does not replace the new assembled plan or the owner's signature.
The idle hour, fresh capacity check, stable vector, weekend UTC start, and other launch gates still apply.
Preserve both stopped-attempt archives and their phase records.

Quota accounting remains an explicitly unmeasured assumption.
The projected margin assumes one quota unit per HTTP request, including a multi-query request.
Retries and other shared-key traffic can consume additional quota.
No live check in this review changed that evidence limit.

CODE-DELTA: APPROVE
PLAN-DELTA: LAUNCH-OK
