# Guard retry review (Codex gpt-6-astra, high)

Reviewer: Codex frontier `gpt-6-astra` at high effort. The author and the orchestrator are Claude Opus 5.5,
so the reviewer differs from both. First pass: `111cad3d`. Delta pass: `386e2c86`.

## First pass

Independent review of `111cad3dfaaab314d23698b03e95391f07f06795` against `0dc353b9`.

I reviewed `git diff 0dc353b9...HEAD`, the surrounding code, the tests, and the stopped launch records.
I made no paid call and started no server. I changed only this report.

**Findings, by severity**

1. **P1 — The new waits do not check cancellation before further spending.**

   Evidence: `eval/qa/remote-identity-guard.mjs:358`, `eval/qa/remote-identity-guard.mjs:536`, and `eval/qa/run-qa.mjs:1867`.
   The runner checks cancellation before `beforeCall` starts.
   The guard then completes every retry without another cancellation check.
   After a successful capture, the wrapper starts the answering call directly.
   A cancellation during the wait therefore permits another paid call.

   I reproduced this with injected capture and sleep functions, without a paid call.
   The sleep set a cancellation flag after the first probe failure.
   The next capture succeeded, and the answering callback still ran once.
   The authorization callback would have rejected the same flag.

   The original synchronous probe already had this problem. This change extends the uninterrupted capture budget from 145 seconds to 790 seconds.
   The new 60-second and 120-second sleeps also exceed the supervisor's 30-second drain.
   The supervisor can terminate an arm before that arm writes its completed rows and retry record.
   See `eval/qa/paired-collection-supervisor.mjs:883` and `eval/qa/paired-collection-supervisor.mjs:908`.

   Check cancellation during retry waits, before further probes, and immediately before the answering call.
   Add a cancellation-during-retry test that proves no later answering call starts.
   Test the drain path with completed rows and a waiting probe.
   The `$80` budget remains effective, but it does not satisfy the cancellation rule.

2. **P2 — The v2 validator accepts incomplete and chronologically impossible retry records.**

   Evidence: `eval/qa/paired-verdict.mjs:306` and `test/qa-paired-verdict.test.mjs:707`.
   The validator rejects only `capture-error` as a failure kind.
   It accepts a missing kind or `identity-changed`.
   It never validates `failedAt`, `reason`, or `probeRetryLines`.
   Its capture lookup proves existence, but does not prove that the success followed the failure.

   I mutated the existing test fixtures in memory.
   All these mutations still produced `PASS`: missing diagnostic fields, an unknown kind, an invalid date, and a negative retry count.
   A failure dated `2099-01-01T00:00:00.000Z` also passed against a success dated `2026-10-11T02:01:10.000Z`.
   `calibrationFromPairedArtifacts` accepted the missing-kind, unknown-kind, and future-failure records too.
   `--recalibrate` calls that function at `eval/qa/validate-paired-verdict.mjs:332`.

   Validate every required field, restrict failure kinds, and check the failure order against the matching capture.
   Add these mutations to the rejection tests.
   The run sheet currently promises this ordering check at `.agents/rounds/2026-10-01-backlog-closeout/paired-run-sheet.md:143`.

3. **P2 — The stderr filter does not guarantee that retained text contains no credentials or environment values.**

   Evidence: `eval/qa/remote-identity-guard.mjs:46` and `eval/qa/remote-identity-guard.mjs:116`.
   The filter allows arbitrary printable text, then rejects several patterns.
   It accepts short tokens, URL path credentials, and environment values without an equals sign.
   These synthetic inputs survived unchanged after the prefix:

   ```text
   https://example.invalid/token/demo-token-123
   PATH /synthetic/private/bin
   ```

   A matching stderr line reaches `diagnostics.reason` and `failedCaptureAttempts[].reason`.
   The current pinned probe constructs its expected failures from fixed labels.
   I found no current production path that supplies a private credential to those labels.
   However, the filter itself does not provide the claimed output guarantee.
   The existing tests cover blacklist examples, not a strict message allowlist.

   Accept only known probe message forms with bounded numeric fields.
   Return `null` for other text. Add URL, short-token, and environment-value rejection cases.
   Keep stdout excluded, as the implementation already does.

4. **P2 — The amendment presents an inferred cause and unverified recovery duration as established facts.**

   Evidence: `.agents/rounds/2026-10-01-backlog-closeout/paired-run-sheet.md:119`, `:124`, `:127`, and `:128`.
   The stopped artifacts contain no probe stderr or HTTP status.
   The later trial establishes that concurrent probes can receive Algolia 429 responses.
   It does not establish the exact cause of the earlier failure.
   The trial log contains no timestamps, so it cannot establish an 80–90-second duration.
   Round 100 ends with two failures. The supplied log shows no later recovery from that episode.
   Thus, “Each 429 period” recovered after 80–90 seconds is unsupported.

   I verified 1849 operation records and five Stellar Docs error records in the two server logs.
   Those error records contain no HTTP status. Their count does not prove that answering avoided rate limits.
   I also cannot establish the stopped server's key identity from these retained records.

   Describe Algolia 429 as the reproduced failure and the likely earlier cause.
   Limit the recovery claim to evidence with timestamps, or mark its duration as an unverified operator observation.
   Remove the claim that answering was not rate-limited unless supporting response evidence exists.

**Answers to the review questions**

1. **Retry scope.** Only `RemoteIdentityProbeError` triggers another capture.
   A generic capture error stops immediately.
   Valid vector comparisons run outside the retry catch.
   A pre-arm mismatch, identity change, or missing baseline therefore does not retry.
   See `eval/qa/remote-identity-guard.mjs:330`, `:405`, `:439`, and `:463`.
   File-pin errors also retry, as the lane brief requests.
   Each real retry checks the executable and its hash again at `:206`.
   A temporarily wrong pin can recover before the next attempt, but the guard records the failed attempt.
   The malformed-record acceptance in finding 2 affects later validation, not the running guard's vector comparisons.

2. **Comparisons after recovery.** Yes.
   Every successful capture leaves the same retry loop and enters the original comparison path.
   The first capture checks the pre-arm hash.
   Later before-call captures check the baseline; after-call captures check their corresponding before-call vector.
   Postflight checks the baseline.
   A recovered capture cannot bypass these comparisons.

3. **Diagnostic safety.** The universal sanitization claim fails; see finding 3.
   The implementation never copies stdout into the diagnostic record.
   It discards stderr lines without the required prefix.
   The actual probe receives only `PATH` by default at `eval/qa/remote-identity-guard.mjs:204`.
   Its expected errors use fixed labels, not upstream response bodies or credential headers.
   The retry notice at `eval/qa/run-qa.mjs:1724` prints phase, case ID, kind, attempt counts, and delay.
   It prints neither the retained reason nor stdout nor environment values.
   I found no secret source in that production notice.

4. **Blocking, cancellation, and budget.** The sleep blocks the child event loop, so IPC cancellation waits.
   The independent supervisor still runs its timers and can send termination signals.
   No per-row heartbeat or readiness timer expires during an ordinary retry.
   The four-hour deadline remains active.
   A peer failure starts the 30-second drain, then termination with a five-second grace.
   Thus, cancellation can cause another answering call or termination without a saved artifact; see finding 1.
   The 790-second budget does not mean a cancelled arm can remain alive for 790 seconds.
   The supervisor's termination schedule still applies.
   The one-second IPC drain applies after child exit.
   Budget authorization still passes the remaining allowance to `--max-budget-usd`.
   See `eval/qa/spend-budget.mjs:109` and `eval/qa/run-qa.mjs:804`.
   Retries make no model call, and they do not increase the authorized allowance.

5. **Consumers and record validation.** Both consumers require v2 and reject v1, but both accept the bad records in finding 2.
   Repository searches found direct production record reads only in `run-qa.mjs` and `paired-verdict.mjs`.
   The former produces the record and checks its failure state.
   `--recalibrate` reaches `comparisonProblems` through `calibrationFromPairedArtifacts` at `eval/qa/paired-verdict.mjs:900`.
   The supervisor, capacity check, control module, assembly scripts, and launch scripts do not read this guard record.
   I found no omitted direct consumer.
   `git ls-files eval/qa/results` returned no files.
   The stopped external v1 artifacts remain evidence of failure; the new comparison gate rejects them.

6. **Timing.** The constant arithmetic is correct.
   The probe budget is `2 × (3 × 20 + 2 × 5) + 5 = 145` seconds.
   Four attempts plus the three delays give `4 × 145 + 30 + 60 + 120 = 790` seconds.
   The added budget over one attempt is 645 seconds.
   These are configured execution budgets, with ordinary process and filesystem overhead outside the arithmetic.

   The baseline's first capture was `2026-10-11T00:11:55.752Z`.
   Its last successful capture was `2026-10-11T02:01:09.150Z`.
   Its failure was `2026-10-11T02:01:11.027Z`.
   First-to-last success took 109.2233 minutes for 145 rows.
   Linear projection gives 150.6528 minutes for 200 rows and 89.3472 minutes of remaining time.
   Including the failed capture still gives approximately 89 minutes.
   The candidate capture interval gives 89.5433 minutes of remaining time under the same projection.
   The estimate is valid arithmetic, not a completion guarantee.
   Agent retries, slower remaining cases, repeated outages, and final postflight can consume that time.
   With fast failures, attempts start near 0, 30, 90, and 210 seconds.
   Thus, the recovery window is about 3.5 minutes plus probe durations, not a guaranteed four minutes.

7. **Tests.** I ran this command directly, without a pipe:

   ```sh
   npm test -- test/qa-remote-identity-guard.test.mjs test/qa-paired-verdict.test.mjs
   ```

   Both files passed: 121 tests, zero failures.
   The tests cover retry success, exhaustion, comparisons, postflight, delay values, and selected record mutations.
   They do not prove cancellation behavior, complete v2 validation, or the universal sanitization claim.
   My additional checks used in-memory fixtures and injected callbacks. They made no external requests.
   I did not rerun the author's full build and maintenance gates.

8. **Run-sheet accuracy.** The row counts, capture counts, hashes, failure phase, spend, and collection times match the artifacts.
   Both arms independently recorded the before-row failure for `q-sep53-message-signing`.
   Both retained 145 rows and 290 matching captures, with suppressed aggregates.
   Spend totals `$0.2831632 + $35.9631006 + $36.5161806 = $72.7624444`.
   The collection marker precedes the runner start: `00:11:52.491Z` versus `00:11:54.988Z`.
   The run-sheet start describes the runners, which is reasonable.
   The receipt is empty, and no later method start marker exists.
   The serial log contains 100 successes.
   The concurrent log contains 148 successes and 52 failures in rounds 44–68 and 100.
   The cause and recovery claims need finding 4's corrections.
   The asserted validator chronology also needs finding 2's correction.

9. **Dated-plan amendment.** The four-attempt amendment matches the intended retry policy for `RemoteIdentityProbeError`.
   It does not authorize retries after vector mismatches.
   The launcher copies the complete `## Stop rules` section at `.agents/rounds/2026-10-01-backlog-closeout/paired-launch.mjs:159`.
   I executed that extraction in memory and confirmed that it includes the amendment.
   Generic programming errors can still stop immediately, which is appropriate.

10. **Archive and relaunch.** A fresh attempt under a new plan and signed authorization is permitted.
    The rules at `.agents/rounds/2026-10-01-backlog-closeout/paired-run-sheet.md:484` preserve old markers and explicitly require new authorization after interruption.
    Moving the entire old directory preserves those markers; it does not reset the old attempt.
    The non-recursive `mkdirSync` at `paired-launch.mjs:73` requires an unused launch path.
    Cleanup reports `complete: true`, and the current worktree list contains no `paired-*` worktree.
    The removal logs exist, and the old plan and salted identity file are absent.
    Complete cleanup before the move, because removal operates through the fixed launch path.
    Preserve the complete archive and identify it in the new attempt's record.
    No rule requires permanent abandonment after this collection failure.
    The statistical two-look limit remains separate; these incomplete rows support no statistical look or claim.

11. **Residual risk.** The retry limits safely stop collection after sustained unavailability, but they cannot guarantee completion.
    Longer outages remain plausible; the supplied evidence does not quantify their probability.
    The stable probe and capacity check correctly retain their stricter behavior.
    Capacity requires zero retries and zero HTTP errors at `eval/qa/check-paired-capacity.mjs:19`.
    Stable capture requires three equal vectors, five minutes apart, at `eval/qa/probe-remote-identities.mjs:363`.
    The launcher runs both checks before P6 or collection, at `paired-launch.mjs:145`.
    Their failures therefore stop the launch before paid work.
    Stop the trial traffic before launch and let the shared service recover.
    Then obtain fresh capacity and stable-vector results under the actual launch conditions.
    Passing those checks does not prove that an 802-capture collection will avoid later throttling.
    I do not approve relaunch until the code findings and amendment errors are resolved.
    After resolution, the existing new-plan, signature, weekend, and capacity requirements still apply.

CODE-DELTA: CHANGES: Fix cancellation checks, validate complete retry records, and restrict diagnostic messages.
PLAN-DELTA: BLOCKED: Resolve the code findings and correct the unsupported cause and recovery claims before authorization.


## Delta pass

Independent delta review of `386e2c8649da02b5845564eb2e375269793c8cf0` against `111cad3d`.

All four findings from `tmp/rp-review.md` are resolved for this change.
I found no new defect that blocks approval.
I reviewed the complete seven-file delta and the surrounding cancellation, collection, and validation paths.
I made no paid call, started no server, and changed only this report.

**Finding reconciliation**

1. **P1 — Cancellation before further spending: fixed.**

   `eval/qa/remote-identity-guard.mjs:426` divides each retry delay into slices of at most 1,000 ms.
   The guard checks cancellation after every slice and before every probe at `:438`.
   It checks cancellation again after the before-call comparison at `:531`.
   The answering call follows that check without another wait.
   `eval/qa/run-qa.mjs:1734` connects these checks to `pairedControl.assertActive()`.
   That function reads the cancellation marker synchronously, so blocked IPC does not prevent detection.

   Cancellation closes the guard, records its context, and requires new authorization.
   `postflight()` skips another remote probe after cancellation at `eval/qa/remote-identity-guard.mjs:563`.
   The runner adds a comparability failure at `eval/qa/run-qa.mjs:1603`.
   The paired validator rejects any recorded cancellation at `eval/qa/paired-verdict.mjs:366`.
   Thus, `matches: true` cannot make a cancelled artifact comparable.
   That field still describes the observed vectors; the separate cancellation field describes the stop.

   The added tests cover before-call waits, cancellation during a successful capture, after-call waits, and cancellation between calls.
   The after-call test retains the completed answer and the failed probe attempt.
   I also ran a check with the actual synchronous wait and the production child-control function.
   A worker thread set shared cancellation state while the main thread slept.
   I injected that state through the child-control function's cancellation-marker reader.
   The guard stopped after 1002 ms, retained the earlier completed call, and started no later answering call or probe.
   This check used no model process, server, or filesystem marker.

   An already-running synchronous probe remains uninterruptible through this callback.
   Its 145-second timeout can exceed the supervisor's 30-second drain.
   This existing limit is now explicit in the run sheet at `:182`.
   The new retry waits no longer add that problem.

2. **P2 — Incomplete or impossible retry records: fixed.**

   `eval/qa/paired-verdict.mjs:216` now validates the exact nine fields and their values.
   It restricts failure kinds, validates diagnostic text, checks non-negative counts, and requires canonical timestamps.
   It checks failure ordering, consecutive capture attempts, and a matching successful capture.
   A failure cannot have a later timestamp than its matching success.
   Missing timestamps on a matching success also cause rejection.

   I repeated eight mutations with otherwise valid comparison fixtures.
   Both comparison and recalibration rejected missing kinds, unknown kinds, missing reasons, and missing counts.
   Both also rejected future failures, invalid dates, negative counts, and an environment value in the reason.
   Each comparison reported `remote-identity-guard`.
   Each `calibrationFromPairedArtifacts` call threw that validation error.
   This function remains the validation path for `--recalibrate`.
   The tests also preserve acceptance of a valid recovered capture.

3. **P2 — Unsafe stderr filtering: fixed.**

   `eval/qa/remote-identity-guard.mjs:126` defines fixed request labels, fixed shape labels, and exact diagnostic messages.
   The regular expressions permit only those labels and bounded numeric fields.
   `isAllowlistedProbeReason` applies this contract at `:191`.
   `probeStderrDiagnostics` retains only the last matching-prefix line when that line passes the contract.
   It counts only recognized retry messages.

   My original synthetic URL and environment-value examples now return `reason: null`.
   A standalone short token also returns `null`.
   The tests add unknown-label, excess-status-digit, and unexpected-error cases.
   I reconstructed the stderr messages from all 52 failed concurrent trials.
   All 52 retained their expected HTTP 429 reason under the new filter.
   Stdout remains excluded, and the runner's retry notice still excludes diagnostic text.
   The pinned probe file did not change.

4. **P2 — Unsupported cause and recovery claims: fixed.**

   `.agents/rounds/2026-10-01-backlog-closeout/paired-run-sheet.md:119` now separates the stopped run from the later reproduction.
   It identifies Algolia 429 as a reproduced failure and the likely earlier cause, without claiming proof.
   At `:127`, it states that the trial log lacks timestamps.
   It labels the 80–90-second duration as an unverified operator observation.
   It also states that the log shows no recovery after round 100.

   At `:132`, it attributes the different-key statement to the orchestrator.
   It states that retained records cannot establish the stopped server's key identity.
   At `:135`, it removes the inference that five error records prove answering avoided rate limits.
   The corrected counts, spend, and capture times remain consistent with the earlier review.
   The amendment now describes the recovery window as about 3.5 minutes plus probe durations.
   It identifies the 151-minute projection as an estimate.
   It also requires stopping trial traffic and identifying the archive in the new attempt's record.

**Delta checks and limits**

I checked the cancellation record's producer and both direct production consumers.
The runner suppresses aggregates after cancellation, and the paired validator rejects the record.
No other direct guard-record consumer appeared in the repository search.
The original vector checks remain outside the retry catch.
The change preserves the retry limits, probe hash, budget allowance, and authorization requirements.

The focused tests prove the guard behavior and record validation, not complete artifact persistence under supervisor termination.
I did not run a full live-supervisor drain test.
The runner still performs local attestation and surface postflight before writing its artifact.
See `eval/qa/run-qa.mjs:2025` and `eval/qa/run-qa.mjs:2048`.
Thus, the one-second cancellation response does not guarantee complete artifact persistence within 30 seconds.
That broader limitation predates this delta and does not reopen the repaired retry-wait defect.

I ran the touched tests directly, without a pipe:

```sh
npm test -- test/qa-remote-identity-guard.test.mjs test/qa-paired-verdict.test.mjs
```

Both files passed: 153 tests, zero failures.
`git diff --check 111cad3d..386e2c86` also passed.
The additional mutation, sanitization, and real-wait checks passed.
I did not rerun the author's full build and maintenance gates.

The archive-by-move procedure remains consistent with the existing plan.
This approval completes the delta review; it does not replace the new plan or signed authorization.
Fresh capacity and stable-vector checks, the weekend condition, and all existing launch gates still apply.

CODE-DELTA: APPROVE
PLAN-DELTA: LAUNCH-OK
