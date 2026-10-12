# Supervised paired measurement: launch run sheet

Prepared on 2026-10-01 at `bcfa617ffcb6e58e6a7498a1e42135a059535402`.
The owner approved spend on 2026-10-01 and deferred the run.
This preparation made no paid call and started no server or live probe.
The 2026-10-10 re-preparation below records the drift since then and its repair.

Use one clean launch revision that contains this repair and all accepted round changes.
Do not use the uncommitted preparation worktree as a runner.
The coordinator creates and commits the launch revision.
The owner signs the canonical plan hash before P6 or collection starts.
The signature confirms every command array and decisions 1 to 10.

The [revision 3 plan](../2026-09-03-truth-maintenance/revised-impact-measurement-fable.md) owns the statistical method.
Use its **Stop rules**, **Result review requirements**, and **What the result can and cannot support** sections.
The [final review](../2026-09-03-truth-maintenance/final-launch-contract-review-opus.md) records the earlier independent review.
Record the current repair review and all resolved findings before signature.
General spend approval does not replace that signature.

## 2026-10-10 re-preparation

Main moved from `bcfa617f` to `d15a4ce5` after the first preparation.
This lane audited the launch path against every change in that range.
It made no paid call, started no server, and ran no live probe.
It did not run `paired-launch.mjs` or create the launch-record directory.

The new template tuple is `claude-sonnet-5 / claude-sonnet-5 / v2.11 / p6 / stability-boundary-v1 / 0.75 / 34`.
The pack stays `p6`.
The TODO item "Repair claim-support selection in the p6 judge pack" lands after this run.

### Drift found and fixed

- The assembler froze `rubric: 'v2.10'` in `flipRejudge.judgeTuple`.
  `eval/qa/judge.mjs` now exports `JUDGE_RUBRIC = "v2.11"`.
  The supervisor rejects a tuple that differs from that export, so plan validation would stop the launch.
  The assembler now reads `JUDGE_MODEL`, `JUDGE_RUBRIC`, and `PACK_VERSION` from the candidate runner.
  The tuple and every `--judge-model` flag use those values.
- No test ran an assembled plan through the complete supervisor validator.
  `test/qa-paired-launch.test.mjs` now does this with simulated launch records, the real corpus, and real instrument bytes.
  The plan passes every runner parser and the validator.
  A stale rubric, another pack, or another judge model fails the test.

### Drift found that needs no repair

- Six instruments changed bytes: `run-qa.mjs` (#243), `paired-verdict.mjs` (#256), `judge.mjs` (#238, #250, #252), `re-judge.mjs` (#256), `run-p6-judge-self-test.mjs` (#253), and `evidence-pack.mjs` (#249).
  Assembly recomputes their hashes at launch.
  The table below previews them.
- No frozen command flag changed. #243 and #256 added artifact fields only.
- The P6 wrapper now refuses a missing output folder (#253).
  `launchPaired` creates the launch-record folder first, and `p6-summary.json` is inside it.
- The P6 static preflight is green at rubric `v2.11`: 15 of 15 prompt fixtures match (#252).
  The wrapper still registers seven paid candidates for seven calls.
- The judge CLI child now receives `API_TIMEOUT_MS=240000` and `CLAUDE_CODE_MAX_RETRIES=2` (#238).
  The binary and environment pins still hash the operator environment, so no new flag, variable, or pin applies.
- The corpus keeps 501 active cases and the same 200 sampled IDs.
  The 200-ID table and composition below remain current.
  Fifteen selected cases changed content, so `contentSha256` and `casesFileSha256` changed.
- The candidate server now uses Wrangler `4.149.0` (#248) and serves `public/` as static assets (#237).
  `scripts/run-eval-server.mjs` did not change. The launch-day listener step remains the real check.
- The baseline revision, the adapter, the probe, and the capacity check did not change.
  The control module, the process guard, and the stability snapshot did not change.
  The supervisor changed in #206, before the 2026-10-01 preparation, and is unchanged since then.
- The weekend UTC check, the `86,400,000 ms` capacity freshness check, and cleanup did not change.

### Preview at `0a60ca49005200e1ffd8b6e780fbfb30f1c6b057`

These instrument bytes equal main `d15a4ce5`.
The re-preparation changed no instrument.
All values are **preview, recompute at launch**.

| Instrument | SHA-256 | Changed since `bcfa617f` |
| --- | --- | --- |
| `eval/qa/run-qa.mjs` | `33af8e93fb5ac595646b67991997f380b8adb99a07c4e086190e71df7f8222d5` | yes |
| `eval/qa/paired-verdict.mjs` | `025168fa8806db93df102431c2fe64c809bb74a267657bd518d69e888720fd72` | yes |
| `eval/qa/paired-collection-supervisor.mjs` | `eadaa8f972a5e18b2eb6321461bb65244769c99bb8a12ba61124b57d3fbcf591` | yes (#206); unchanged since the 2026-10-01 preparation |
| `eval/qa/paired-collection-control.mjs` | `1f3e4ce3bdbb6679c4e6e8e59c433c3093ecab98eaa0bbdb74b3ad5a06a76bb7` | no |
| `eval/qa/exact-old-runtime-adapter.mjs` | `473690c7f10d5384be252bb97f9aa16ee88428d23589779289f5910c08e60303` | no |
| `eval/qa/probe-remote-identities.mjs` | `bde386a01ceb5bfdd325f3cd24369e00e2c111f7b4747ec7c0c9e77bc84485ef` | no |
| `eval/qa/check-paired-capacity.mjs` | `59a52b96e890f0de4babb911022ed863c4ad5a62a6473b146007544143e8f3a9` | no |
| `eval/qa/run-p6-judge-self-test.mjs` | `50f00268d598037893e2ee04cd41d622b23f5b960182940907413b5656096332` | yes |
| `eval/qa/judge.mjs` | `8dfb04f7cd2276342593566bf1aac193d5a7ef0bc7492010b20f9dc45bec14a7` | yes |
| `eval/qa/re-judge.mjs` | `7b293cbef0d392befb9f5794fce8467c8c0d469e8f9d7e6ae1174a0f2346fae1` | yes |
| `eval/qa/evidence-pack.mjs` | `506e771fd4902a860192621d0073379a9fba684c2cb92f4b0a229bd306a49ed2` | yes |
| Launch process guard | `af355f0c81014a8385a62dd5a67fdfcb9742a9baf219fa613fb4872f6df0f303` | no |
| Repository stability snapshot | `1cbd7d46e5c19f72b8feef6ef5df88880c27ab704e4f39ecebe51cd1666fdb99` | no |

| Corpus pin | SHA-256 | Changed since `bcfa617f` |
| --- | --- | --- |
| `idsSha256` | `54118e3410ff3dd3ce34c07a1b0b6f5d92ed8e14b1d05d0546623c3a222a51fc` | no |
| `contentSha256` | `72eb6a3c6cd3ccdd69fdfa263f4307503a12014a14587a25c1bb1854cbbb906f` | yes |
| `casesFileSha256` | `2093621e541bfc938eba304be4f98f8811e704bb7a33baa96057071d6534e794` | yes |
| `activeCorpusIdsSha256` | `7da0fb70fd8a580e98c7dd81ea21a259f9841bea5107b9cfe3e20f4f8d87ded8` | no |

The "Preview, recompute at launch" section keeps the 2026-10-01 values as history.

## 2026-10-11 amendment: stopped attempt and guard retry

### The stopped attempt

The paired run started on 2026-10-11 at 00:11:54 UTC at launch revision `0dc353b992b8c0688c051909b5b07b8e14956134`.
The guard stopped both arms at row 146 of 200 at 02:01:11 UTC.
Each arm kept 145 of 200 rows.
The baseline guard recorded `failure.reason: "probe-unavailable"` in phase `before` for `q-sep53-message-signing`.
Its diagnostics were `kind: "nonzero-exit"`, `status: 1`, and `timedOut: false`.
Each arm had 290 successful captures before the stop. Every vector matched the pre-arm vector `1a927dce…`.

| Phase | Reported spend |
| --- | ---: |
| P6 judge self-test | `$0.2831632` |
| Baseline collection, 145 rows | `$35.9631006` |
| Candidate collection, 145 rows | `$36.5161806` |
| Total | `$72.7624444` |

Both artifacts record `meta.comparable: false` and suppressed aggregates.
The collected rows support no claim. No judge, comparison, or flip phase ran.

### Cause

The runner kept no probe stderr, so the stopped run did not record the exact error.
The stopped artifacts contain no probe stderr and no HTTP status. The exact cause is not established.

A later free trial ran 100 serial probes. All 100 passed with no retry.
A second free trial ran 100 rounds of two concurrent probes, as the two arms do.
148 of 200 probes passed. Both probes failed in rounds 44 to 68 and in round 100.
Each of the 52 failures was an Algolia HTTP 429 on a Stellar Docs call: settings, title page count, or remaining title pages.
The probe's own retries after 250 ms and 1 s also received HTTP 429.
The trial log has no timestamps. It does not show how long a 429 period lasts.
The orchestrator observed a period of about 80 to 90 seconds. That duration is an unverified operator observation.
Round 100 was the last round, so the log shows no recovery after it.

The probe uses the public DocSearch search key.
The orchestrator reports that the Raven server uses a different Algolia key in the same application.
The retained records do not establish the key identity of the stopped run's server.
The two server logs from the stopped run have 1849 upstream operation records and 5 Stellar Docs error records.
Those error records have no HTTP status. Their count does not show whether answering received HTTP 429.

Thus an Algolia HTTP 429 on the probe's Stellar Docs calls is the reproduced failure.
It is the likely cause of the stopped run, but the stopped run's records do not prove it.

### Fix

`eval/qa/remote-identity-guard.mjs` now writes guard schema `qa-remote-identity-guard-v2`.

- An unavailable probe repeats the same capture after 30 s, 60 s, and 120 s. One capture has at most 4 attempts.
  Any `RemoteIdentityProbeError` kind, including `timeout`, counts as unavailable.
- `failedCaptureAttempts[]` records each failed attempt. `captureRetryPolicy` records the policy.
- Each failure keeps a `diagnostics.reason` and the count `diagnostics.probeRetryLines`.
  The reason is the last `remote-identity-probe: ` stderr line, without the prefix.
  The guard keeps it only when it matches a known probe message form with fixed labels and bounded numbers.
  Other text gives `null`. The guard keeps no stdout and no other stderr text.
  All 52 failure lines in the concurrent trial match the allowlist.
- A successful repeat goes through the same pre-arm and baseline comparisons.
  The guard never repeats a vector mismatch, a pre-arm mismatch, an identity change, or a missing baseline.
- The guard checks the paired cancellation before each probe, after each 1 s slice of a wait, and just before the answering call.
  The supervisor writes its cancellation file before it sends IPC, so a blocked wait sees the file.
  A cancellation stops the arm within about 1 s of a wait. It starts no further probe or answering call.
  The guard records `cancellation` and skips the postflight probe with `skippedReason: "collection-cancelled"`.
  The runner then saves its completed rows and the guard record.
- `eval/qa/paired-verdict.mjs` accepts only the v2 record with `cancellation: null` and the exact retry policy.
  Each failed attempt must have every field, a probe error kind, an allowlisted or `null` reason, and a valid date.
  Its date must not be later than the successful capture of the same call. Failure dates must not decrease.

The probe file and its retry constants did not change, so its pinned hash stays the same.
The guard does not change the probe's request rate. Two arms still start their before-row probes at the same release.

### New meaning of "a probe failure"

The stop rule "The guard stops either arm for … a probe failure" now means four failed attempts for one capture.
A failed attempt that a later attempt of the same capture replaces is not a stop.

### Worst-case wait

One probe process has a `145,000 ms` timeout. One capture can wait at most 4 × `145,000 ms` + `210,000 ms` = `790,000 ms` (13.2 min).
When each attempt fails fast, the attempts start near 0, 30, 90, and 210 s.
So the guard covers an unavailable period of about 3.5 min plus the probe durations. It does not guarantee more.
The stopped run took 109.2 min for 145 rows, from the first to the last successful capture.
At that rate, 200 rows take about 151 min. That leaves about 89 min before the four-hour supervisor deadline.
This is a linear estimate, not a completion guarantee.
The supervisor has no per-row, heartbeat, or readiness timeout during rows.
Its 30 s drain, 5 s termination grace, and 1 s IPC drain start only after a cancel or a child exit.
A cancelled wait stops within about 1 s, inside the 30 s drain.
A probe process that is already running cannot stop early. It can run for up to 145 s, which is longer than the drain.
In that case the supervisor can terminate the arm before it saves its artifact. This limit existed before this fix.
The 10 min agent timeout covers only the answering CLI, not the guard capture.
The arms wait for each other at each row, so a wait in one arm delays both arms.

### Next attempt

- The next attempt needs a new launch revision that contains this fix, a new assembled plan, and a new signed authorization.
- A delta review of the guard change and this amendment must complete before the signature.
  The [guard retry review](guard-retry-review-astra.md) records it. Codex `gpt-6-astra` at high
  effort returned CODE-DELTA: CHANGES and PLAN-DELTA: BLOCKED at `111cad3d`. After the fixes, it returned
  CODE-DELTA: APPROVE and PLAN-DELTA: LAUNCH-OK at `386e2c86`.
- Before the new launch, move (archive) the old launch record `/private/tmp/stellar-raven-paired-launch/`. Do not edit it.
  `launchPaired` creates that folder with a non-recursive `mkdirSync`, so it stops when the old folder is still there.
- The old run's `--remove-worktrees` step is complete. Its cleanup record has `complete: true`, and no `paired-*` worktree remains.
- The launch must still run on a weekend UTC day, and it captures a new capacity record and a new stable vector.
- Stop all trial probe traffic before the launch, so that the shared key can recover before the capacity and stable checks.

### Attempt 2: stopped before paid work

Attempt 2 ran from launch revision `826be10f`, which contains the guard retry fix.
Its capacity check passed at `2026-10-11T02:45:44Z`.
Its stable pre-arm probe then failed before plan assembly.
The stderr file has no timestamps. Its modification time is about 02:55Z.
The orchestrator reports that its trial probes ended about 30 minutes before that.
The stderr file shows HTTP 429 on "Stellar Docs settings" and "Stellar Docs title page count".
It shows three failed settings attempts and two failed title page count attempts.
Then the probe exited with the settings error.
No plan was assembled or signed. No P6, collection, or judge phase ran. The spend was `$0`.
The record is archived at `eval/qa/results/2026-10-11-paired-attempt-2-prelaunch` in the main checkout.

### Key limit evidence

The probe uses the public DocSearch key. A read with that key reports its own limits:
`maxQueriesPerIPPerHour: 1000` and `maxHitsPerQuery: 100`.
Algolia documents the first limit as API calls per hour for each IP address and key.
It returns HTTP 429 above the limit.

Attempt 1 made 580 probes in 109.2 minutes over both arms.
Each probe made 3 Algolia calls: settings, title page count, and remaining title pages.
That is 1,740 calls in 109.2 minutes, or about 956 calls per hour: 96% of the limit.
The PR #265 retry waits at most about 3.5 minutes, so it cannot recover an hourly limit.

### Fix: fewer Algolia calls

1. The probe reads title pages 0 to 9 in one multi-query request, with the settings read in parallel.
   It keeps only the pages below the reported `nbPages`. The existing `nbPages <= 10` bound stays.
   All previous checks stay: page numbers, equal `nbPages` and `nbHits` on every page, and
   `nbHits === hits.length`. A page past `nbPages` must also be empty.
   So one probe makes 2 Algolia calls, not 3, and 6 public requests, not 7.
   The key caps each page at 100 hits, and the bound allows 1,000 titles. A larger set fails closed as truncated.
   The vector is byte-identical for the same upstream pages. A unit test proves it.
2. The probe now has one Algolia phase, so its process timeout is `75,000 ms`, not `145,000 ms`.
   This replaces the worst-case figures above: one capture waits at most 4 × `75,000 ms` + `210,000 ms` = `510,000 ms` (8.5 min).
3. The capacity contract is now `qa-paired-capacity-check-v3`: 12 responses, with Scout 2, Lumenloop 6, and Stellar Docs 4.
4. The guard writes schema `qa-remote-identity-guard-v3`. A before-call check reuses the previous call's
   after-call capture when no call started since and that capture is at most 60 s old.
   Otherwise it captures fresh. The first before-call check and the postflight always capture fresh.
   The guard measures the reuse age on a monotonic clock, so a wall-clock correction cannot extend it.
   Each entry in `checks[]` and `failedCaptureAttempts[]` records a wall-clock time for reports and `elapsedMs`.
   `elapsedMs` is the whole monotonic milliseconds since the guard started. One reading decides a reuse and dates it.
   Each check also records `reusedFromSequence`.
   The record counts fresh probes in `successfulCaptureCount` and reuses in `reusedCaptureCount`.
   Every comparison and the cancellation check before the answering call stay.
5. `eval/qa/paired-verdict.mjs` accepts only v3 records.
   Each before and after pair must have the context of the next answering call in the rows' `attempts.agent[]`, in execution order.
   Each row must have attempts numbered from 1, and `completedAnsweringCalls` must equal the number of attempts.
   A reuse must point to the immediately previous, fresh after-call check, with the same vector, at most 60,000 ms earlier in `elapsedMs`.
   Checks and failed attempts must not move back in `elapsedMs`.
   A failed attempt must fall between the check before its call and the call's fresh successful check.
   Each wall-clock time must stay within 300,000 ms of the elapsed time since the first check.
6. The PR #265 capture retry and cancellation behavior did not change.

This fix changes the probe, capacity check, guard, and paired-verdict file hashes.
The preview hash tables above are history. Plan assembly recomputes every pin, so no pin needs a manual edit.

The reuse changes the observation rule. The dated plan's stop rules have a marked amendment for it.
The guard still stops an arm for an observed identity change, four failed attempts for one capture, or a pre-arm mismatch.
A change that persists until the next successful capture stops the arm at that capture.
At most one more answering call starts in each arm's guard before that detection or capture exhaustion.
A temporary change that starts after one fresh capture and ends before the next fresh capture is not observed.
The earlier design captured before every call and could stop before that call.
The new authorization copies the amended stop rules, so the owner signs this rule.
The dated plan also marks `qa-paired-capacity-check-v3` as the current capacity contract.

### Algolia call budget

The budget uses attempt 1's pace: 145 rows in 109.2 minutes for each arm.
That is 79.7 rows per hour for each arm, or 159.3 rows per hour for both arms.

Attempt 1 had 288 row boundaries. At 286 of them, the next before-call capture came at most 60 s after the after-call capture.
The baseline arm had 0 longer boundaries. The candidate arm had 2, and the longest was 78.2 s.
So a row needs about 1 + 2/288 = 1.007 fresh captures.

| Load | Calls per hour |
| --- | ---: |
| Previous design: 2 captures × 3 calls per row, both arms | about 956 |
| New design, expected: 1.007 captures × 2 calls per row, both arms | about 321 |
| New design, no reuse at all: 2 captures × 2 calls per row, both arms | about 637 |
| One-time calls: capacity check 4, stable probe 6, first before-call checks 4, postflights 4 | 18 in total |

The first hour holds the capacity check, the stable probe, and the first rows.
Its expected load is 10 + 4 + 321 = about 335 calls. That leaves a margin of about 665 calls (66%) under 1,000.
Without any reuse, the first hour is about 10 + 637 = 647 calls, with a margin of about 353 calls.
A full run of 200 rows for each arm makes about 824 Algolia calls in about 151 minutes.
Probe retries and capture retries add calls. The budget does not include them.
Algolia documents that the limit applies to each of the three servers in a cluster. This budget counts against one server.

The orchestrator must leave the key idle for at least one hour before the launch.
The idle hour ends at the capacity check, which is the first Algolia call of the launch.
In that hour, no trial probe, live comparison, or other process on this IP may use the public DocSearch key.

### Live comparison

One live comparison ran at `2026-10-11T03:57:41Z`, about one hour after the attempt 2 stderr file's modification time.
It ran the `826be10f` probe and then the new probe in one process, with no retry.
Both probes returned the same vector bytes, with vector SHA-256 `1a927dce…`.
That vector equals the attempt 1 pre-arm vector.
The old probe made 3 Algolia calls, and the new probe made 2.

The title set had 674 `lvl1` hits. Algolia reported `nbPages: 7` and `hitsPerPage: 100` on every page.
So the key's `maxHitsPerQuery: 100` caps the requested `hitsPerPage: 1000`.
Pages 0 to 5 had 100 hits, and page 6 had 74.
Pages 7 to 9 had 0 hits, with the same `nbPages` and `nbHits` as the used pages.
No Algolia response had an `X-RateLimit-*` header.
So the run could not measure whether the limit counts a multi-query request as one call.
The budget uses Algolia's documented rule: the limit counts API calls.
That run was the last use of the key from this lane, at `03:57:41Z`.

The [probe load review](probe-load-review-astra.md) records the delta review of this fix.
Codex `gpt-6-astra` at high effort returned CODE-DELTA: CHANGES and PLAN-DELTA: BLOCKED at `8a662d80`.
After the fixes, it returned CODE-DELTA: APPROVE and PLAN-DELTA: LAUNCH-OK at `63aed8fe`.

- Identify the archived record in the new attempt's record.

### Attempt 3: stopped by a baseline server crash

The orchestrator first started attempt 3 at `2026-10-11T05:05:42Z` with a revision that does not exist.
The launcher stopped at worktree creation with no probe, server, or paid call. That record is archived at
`eval/qa/results/2026-10-11-paired-attempt-3a-bad-revision` (main checkout, ignored).

Attempt 3 then ran at `8bca416700f25ceb085d82f54693b313b189a14e` from `2026-10-11T05:05:58Z`, after the
DocSearch key was idle for more than one hour. The capacity v3 check passed, and the stable probe returned
`1a927dce…` three times. The orchestrator signed plan `49ee7a49…` under the owner's delegation. P6 passed all
seven grades for $0.2845572.

The probe repair held. Each arm made 142 answering calls with 0 failed capture attempts. In each arm, 141
before-checks reused the previous after-check.

At `2026-10-11T07:02:39Z`, the baseline server (`90d0ba75`, Wrangler 4.120.1) stopped with an empty
`[ERROR]` line. It had run for 1 h 56 min. The next baseline answering call failed with "required MCP server
raven was failed in system init", and the postflight could not read the server on port 8791. The supervisor
cancelled both arms. The candidate server (Wrangler 4.149.0) did not fail in attempt 1 or attempt 3.

- Spend: P6 $0.2845572, baseline $35.9055856, candidate $37.2913486, total $73.4814914. No judging ran.
- The rows support no claim. Both artifacts are non-comparable.
- The Wrangler debug log ends at the crash with debug and log entries only, and no error entry. The
  orchestrator could not read the macOS unified log. The crash cause is unknown.
- Record: `eval/qa/results/2026-10-11-paired-attempt-3`, with `baseline-wrangler-debug.log`.

The total for the three attempts is $146.2439358. The orchestrator stopped the method for this weekend
instead of starting a fourth paid attempt with an unexplained crash. A free soak test of the baseline server
comes first (`.agents/TODO.md`, owner decision A).

## 2026-10-12 amendment: shared server toolchain and stop on a lost port

### Choice and reason

The owner delegated the signature and launch decisions on 2026-10-10.
Under that delegation, the orchestrator chose option 1 of the [baseline soak record](../2026-10-12-baseline-soak/README.md) on 2026-10-12.
The baseline server now runs on the candidate server's Wrangler toolchain.
The soak reproduced the attempt 3 stop path.
Wrangler 4.120.1 exits on one `ProxyWorker` error near a 5 s idle gap.
Wrangler 4.149.0 logs the same error, and only that request fails.
A runtime crash can still close the public port on both versions.
Thus the method also stops when a server stops answering on its port.
No step restarts a server. Option 3 of the soak record stays rejected.

### Shared toolchain

The baseline Wrangler process now runs these arguments after the absolute Node executable:

```text
<candidate server>/node_modules/wrangler/bin/wrangler.js dev --host localhost --port 8791
```

Its working directory stays the baseline server worktree.
The baseline revision, its `npm ci` install, and its `wrangler.jsonc` do not change.
The candidate command does not change. `npx --no-install wrangler` runs the candidate's `node_modules/.bin/wrangler`.

The launch reuses the candidate's installed packages. It does not install Wrangler again in the baseline worktree.
A new install resolves the transitive packages again from the registry.
It can get versions other than the candidate's, and it can move baseline packages.
Reuse runs the same files, so it is the most exact method.

A new launch step runs after the `.dev.vars` step and before any server starts.
It calls `assertSharedServerToolchain` from [paired-server-toolchain.mjs](paired-server-toolchain.mjs).
That function resolves the toolchain from each launch entry, the way the running server resolves it:

- `wrangler` from the launch entry.
- `miniflare` and `esbuild` from Wrangler.
- `workerd` from miniflare, and the `workerd` binary through the `workerd` package.

It records each version and package root, and the binary path and SHA-256.
The two records must be identical, or the launch stops.
A set `MINIFLARE_WORKERD_PATH` also stops the launch, because it replaces the binary.
The launch writes the record to `server-toolchain.json` in the run directory.
The assembler resolves the toolchain again and requires the same record.
It writes the record to `plan.serverToolchain`, so the signed plan hash covers it.

At the current `main` lockfile, the toolchain is Wrangler `4.149.0`, miniflare `5.20261006.1-alpha`, workerd `1.20261006.1`, and esbuild `0.28.2`.
The launch revision's candidate lockfile decides the real values. Read them from the plan.

### Change in the treatment

Before this change, the baseline arm ran Wrangler `4.120.1`, workerd `1.20260804.1`, miniflare `5.20260804.0-alpha`, and esbuild `0.28.1`.
Now both arms run one local dev runtime.
The local dev runtime is no longer part of the measured difference. Production does not run it.
The measured difference is the source revision, its installed source dependencies, its `wrangler.jsonc`, and the adapter mode.
Soak run 2 ran Wrangler `4.149.0` on the baseline source, and the bound surface pin matched.
That run installed Wrangler in the baseline worktree.
On 2026-10-12 the orchestrator ran the reuse method once, with no paid call.
The baseline source `90d0ba75` ran under the candidate worktree's `wrangler.js` (4.149.0) on port 8797.
The bound surface matched the pin `6cf5d1cdd3cd16c6b8bdb09a45917755cffaf0781f321734d7c9f7649a71d238`
([report](2026-10-12-launch-change/reuse-live-surface.json)).
One `search` call and one sandbox `execute` call (no upstream request) returned ok results.
The step 4 surface probes check the bound surface at launch, before any paid call.

### Stop on a lost port

Before this change, nothing stopped the method when a server stopped answering:

- **A Wrangler process exits.** The launcher marked its process group as exited and took no action.
  The supervisor checked no listener. In attempt 3, the next baseline answering call still started.
  It failed with "required MCP server raven was failed in system init".
- **The Wrangler process lives, but its public port refuses connections.** This is soak outcome 2, after a runtime restart.
  The adapter on the public arm port stayed up. Nothing checked the upstream port.
  Answering calls continued until a protocol failure stopped the arm.

Now a local listener check runs before every paid call while the servers must stay available.
Each check compares the recorded listener processes with the current ones.
A missing listener or another process on a recorded port stops the method.
All checks use `assertDualBoundServersUnchanged` in `eval/lib/bound-server-identity.mjs`.
That function runs only local `lsof` and `git` commands. It makes no model call and no upstream call.
A lost listener gives the error code `paired-server-lost`.

- **The listener record is bound to the signed plan.** `pairedListenerPairs` in the same module
  requires exactly `baseline` and `candidate`, four distinct ports, and four distinct processes.
  With independent targets, it also requires each arm's ports and revisions to equal them.
  The assembler checks `listeners.json` against the ports and revisions of its collection commands.
  It records the file's SHA-256 as `p6.listenersSha256`, so the signed plan hash covers the record.
  A missing arm, a repeated pair, a substituted port, or changed contents stops the method.
- **Before P6 and before collection.** The launcher compares all four listeners with `listeners.json`.
  It calls `assertServersUnchanged` from [paired-launch.mjs](paired-launch.mjs).
  The launch's own targets, not the record, decide which ports and revisions it checks.
  On failure, it writes `server-stop.json` with the phase, time, and reason.
- **Before each P6 call.** The frozen P6 command now has `--paired-listeners <run>/listeners.json`
  and `--expect-paired-listeners-sha256 <p6.listenersSha256>`.
  Before its first call, the wrapper requires that digest and a valid two-arm record.
  It then checks all four recorded listeners before each of its seven paid calls.
  The supervisor requires both flags, the absolute path, the digest, and a record that matches the collection commands.
- **Before each answering attempt, including a retry.** `run-qa.mjs` checks its own arm's listener pair.
  It checks when it authorizes the attempt, and again just before the answering call, after the identity probe.
  The remote identity guard also runs the check before each probe and during each probe retry wait.
  So a loss during an attempt stops the arm before the after-call probe and before any retry.
  The arm reports `paired-server-lost` to the supervisor, which cancels both arms.
- **Before each row release and the postflight release.** The supervisor checks all four signed listeners.
  It calls `createServerListenerCheck` from `eval/qa/paired-collection-supervisor.mjs`.
  Its reference is the signed record, checked again against its digest and the collection commands.
  On failure, it releases no row and cancels both arms.
  Its reason starts with `server listener check failed before row <index> (<case ID>); no server restarts:`.
- The cancellation marker, both arms' artifacts, and `collection.stderr.log` keep the reason.
- No step restarts a server.

Limits:

- A check reads listening sockets. It does not open a connection.
  A listener that exists but does not accept connections passes the check.
  The soak saw only `ECONNREFUSED`, which means that no listener existed.
- Each check reads the four listeners in sequence. A server can fail after its own read.
  A short interval also remains between the last check and the start of the call.
  A server can fail in that interval, and the call then starts.
- A server that fails during a call fails the later tool calls of that call. The call completes.
- After the supervisor releases a row, the other arm's call can already be running. A stop cannot recall it.
- Wrangler can restart its own runtime between checks. The next check then sees the change.
- Each local command has a 10 s timeout. A slow or failed `lsof` or `git` command stops the method,
  even when the server is healthy. This false stop starts no new paid call. Nothing retries the check.

### Next attempt

- The next attempt needs a launch revision with this change, a fresh assembled plan, and a fresh signed authorization.
  The dated hashes in this run sheet are history.
- Codex `gpt-6-astra` at high reviewed this change four times: RA, RA2, and RA3 (CHANGES), then RA4 (APPROVE).
  The reviews are in [2026-10-12-launch-change/](2026-10-12-launch-change/). Every finding is reconciled.
- A full collection needs about 2.5 hours of server uptime. Run on a quiet machine.
- Leave the public DocSearch key idle for at least one hour before the capacity check.

## Launch window and values

Start on Saturday `2026-10-10T00:00:00Z` or Sunday `2026-10-11T00:00:00Z`, or on a later weekend UTC day.
Use a weekend UTC day start, even when the local date is Friday or Saturday.
The answering deadline is four hours.
Finish the method within the same UTC calendar day.

The capacity artifact remains valid for exactly `86,400,000 ms` after `completedAt`.
A future timestamp fails.
A launch one millisecond past that limit fails.
A new capacity artifact requires a new plan hash and signature.

Recompute these values at launch:

- The clean runner revision and candidate revision.
- The active corpus count, 200 sampled IDs, composition, and four corpus hashes.
- All instrument hashes in the preview table.
- The copied stability-register hash.
- The Claude path, version, binary hash, and environment hash.
- The fresh `.dev.vars` salt, variable names, and salted identity.
- The listener identities, adapter attestations, and both bound surface hashes.
- The shared server toolchain record.
- The capacity artifact hash, completion time, and fixed contract.
- The shared `--stable-sha256` result and the canonical plan hash.

Keep the launch environment unchanged through P6, collection, judging, and flip rejudges.
Keep `QA_AGENT_PROMPT_APPEND` unset.
The manager adds the fixed process guard to `NODE_OPTIONS` for every managed child.
Assembly records that environment and the guard's path and SHA-256 in the signed plan.
The executor checks the guard pin before every phase.
Do not remove the guard or invoke a paid phase outside the operator script.
Before identity capture, the script creates `/private/tmp/stellar-raven-paired-launch/claude-bin` with mode `0700`.
That directory contains only a `claude` link.
The link targets the versioned file from `realpath ~/.local/bin/claude` under `~/.local/share/claude/versions/`.
The script puts this directory first on `PATH` and sets `DISABLE_AUTOUPDATER=1`.
Other sessions can move the public link without changing this private link.
Keep the private link, versioned file, `PATH`, `TMPDIR`, and recorded Claude environment unchanged.
Keep `DISABLE_AUTOUPDATER=1` throughout the method.
The signed plan records `immutableClaude`: the private link, versioned real path, version, and SHA-256.
Before every phase, the executor checks that record and the frozen environment hash.
It also checks the directory's mode, its sole link, and the updater flag.
A failed check stops before the next paid command starts.
Keep the existing evidence after a stop; never replace the pin or update the signed identity.

## Stability-register source

`eval/qa/judge-stability.json` is ignored and absent from this worktree.
The old `/private/tmp/stellar-raven-tm-paired-stability.json` is absent.
The repository snapshot is [paired-stability-register.json](paired-stability-register.json).
It contains actual QA stability observations, not invented scores.
The committed `eval/qa/judge-stability.mjs` builder generated it from 197 retained QA artifacts.
It contains 538 cases: 163 collection artifacts and 34 rejudge artifacts supplied the evidence.
The builder skipped no artifact.
Its metadata records source signatures and their original local directory.
The pinned loader uses `verifySources: false`; launch does not depend on that directory.

This register replaces the old `06d3835b63ae05f40f808b9890628add8b905f32f60a65df19cbee1a751f9480` pin.
The owner must confirm the replacement register at signature time.
Copy the repository snapshot in step 2.
Do not regenerate it during the paired method.

## Commands: plan steps 1 to 15

The operator script runs the sequence under one cleanup handler.
It registers that handler before starting any child.
It runs cleanup after success, failure, `INT`, `TERM`, and an explicit process exit.
Do not execute the old separate command blocks.
Use [paired-launch.mjs](paired-launch.mjs) for the complete sequence.
The script uses the four absolute worktree paths below.
It keeps process ownership in `owned-processes.json` and worktree ownership in `worktrees-created.json`.

| Role | Absolute path |
| --- | --- |
| Baseline runner | `/Users/kalepail/Desktop/stellar-raven-codemode-worktrees/paired-baseline-runner` |
| Candidate runner | `/Users/kalepail/Desktop/stellar-raven-codemode-worktrees/paired-candidate-runner` |
| Baseline server | `/Users/kalepail/Desktop/stellar-raven-codemode-worktrees/paired-baseline-server` |
| Candidate server | `/Users/kalepail/Desktop/stellar-raven-codemode-worktrees/paired-candidate-server` |
| Launch records | `/private/tmp/stellar-raven-paired-launch` |

Select the final clean revision that includes these scripts and all accepted round changes.
The local `origin/main` reference does not prove that these changes merged.
Confirm the revision before running the launch command.
The script refuses an existing launch-record directory.
It never overwrites an earlier attempt's evidence.

```sh
PAIRED_REV="$(git -C /Users/kalepail/Desktop/stellar-raven-codemode rev-parse origin/main)"
node /Users/kalepail/Desktop/stellar-raven-codemode/.agents/rounds/2026-10-01-backlog-closeout/paired-launch.mjs --revision "$PAIRED_REV"
```

The script stops at step 8 for the owner's external signature.
Use a second terminal to open the generated record.

```sh
open -e /private/tmp/stellar-raven-paired-launch/authorization.txt
```

Fill every field, record decisions 1 to 10, and obtain the owner's signature.
Write `Decision 5: ACCEPTED` with the owner's reason.
Enter the owner's signed canonical hash at the waiting script's prompt.
The script checks the hash, signature, completed fields, decision 5, UTC day, and capacity freshness.
A failed check runs cleanup and blocks every later paid phase.

### 1. Create and install four worktrees

Before any child starts, `launchPaired` creates the private Claude link through [paired-claude-pin.mjs](paired-claude-pin.mjs).
It creates `claude-pin.json` exclusively and records no environment values.
The link targets the versioned file directly; it never targets the public link.
`launchPaired` creates both runners and the candidate server at the supplied revision.
It creates the baseline server at `90d0ba75eb529c6a1cf6fe276f16cf4f1da4f9f0`.
Each creation uses `git worktree add --detach <absolute root> <revision>`.
The ledger records the repository, administration directory, `.git` link, root, revision, and filesystem creation identities.
Each installation runs `npm ci` from that worktree's absolute directory.
The script records each successful creation before proceeding.
Removal uses only those recorded roots.

### 2. Copy `.dev.vars` and compute its salted identity

The script copies `/Users/kalepail/Desktop/stellar-raven-codemode/.dev.vars` to both server worktrees.
It never prints values.
It uses `devVarsIdentity` from `eval/qa/paired-collection-supervisor.mjs` with a fresh 64-character hexadecimal salt.
It records only the salt, variable names, and salted digest in `dev-vars-identity.json`.
It copies the repository stability snapshot to `/private/tmp/stellar-raven-paired-launch/paired-stability-register.json`.

### 3. Start both server pairs and attest four listeners

The script checks all four ports before it starts a server.
It starts each process in its own group and records its identity before awaiting readiness.
These are the exact argument arrays after the absolute Node executable.
Each relative instrument path resolves from the absolute worktree in the last column.

| Process | Arguments | Working directory |
| --- | --- | --- |
| Baseline Wrangler | `<candidate server>/node_modules/wrangler/bin/wrangler.js dev --host localhost --port 8791` | Baseline server |
| Baseline adapter | `eval/qa/exact-old-runtime-adapter.mjs --port 8789 --upstream-port 8791 --source-revision <baseline revision> --adapter-revision <launch revision> --mode add-missing` | Baseline runner |
| Candidate Wrangler | `scripts/run-eval-server.mjs --port 8790` | Candidate server |
| Candidate adapter | `eval/qa/exact-old-runtime-adapter.mjs --port 8788 --upstream-port 8790 --source-revision <launch revision> --adapter-revision <launch revision> --mode verify-native` | Candidate runner |

The baseline lacks `dev:eval`; the candidate server's installed Wrangler supplies the baseline process.
Before this step, the script requires one shared toolchain and writes `server-toolchain.json` (see the 2026-10-12 amendment).
The candidate launcher supplies the native source-revision definition.
The script uses `dualBoundServerIdentity` and `fetchAdapterAttestation` for both pairs.
It records their results in `listeners.json`.

### 4. Capture both free surface and source-revision probes

The script runs these exact arguments from each runner directory:

```text
eval/report-live-surface.mjs --port 8789 --expect-source-revision 90d0ba75eb529c6a1cf6fe276f16cf4f1da4f9f0 --label baseline --json /private/tmp/stellar-raven-paired-launch/baseline-surface.json
eval/report-live-surface.mjs --port 8788 --expect-source-revision <launch revision> --label candidate --json /private/tmp/stellar-raven-paired-launch/candidate-surface.json
```

Both probes must pass.
The assembler rejects equal surface hashes.

### 5. Run the free capacity check

The script runs this exact array from the candidate runner:

```text
[process.execPath, "eval/qa/check-paired-capacity.mjs", "--out", "/private/tmp/stellar-raven-paired-launch/capacity.json"]
```

The assembler freezes that array, the instrument hash, the artifact hash, and the fixed v2 contract.
The script rechecks capacity freshness after the signature wait and before P6.

### 6. Run the shared formal stable probe

The script runs `eval/qa/probe-remote-identities.mjs --stable-sha256` from the candidate runner.
It records the result in `/private/tmp/stellar-raven-paired-launch/stable.sha256`.
The probe takes three captures, five minutes apart.
Both arms use the same returned hash.

### 7. Assemble the manifest and print its canonical hash

The operator calls [assemble-paired-plan.mjs](assemble-paired-plan.mjs) from the candidate runner.
That script uses `stratifiedSample` from `eval/qa/lib.mjs`.
It freezes 200 explicit IDs and recomputes all four hashes independently in both runners.
It verifies every paid command's flags through its actual parser.
It checks the private Claude pin and records its path, version, and SHA-256 without printing environment values.
It resolves the shared server toolchain again and records it as `serverToolchain`.
P6 and both flip commands use this link through `--claude-path`.
Both collection commands and both stored-judge commands resolve `claude` through the private directory first on `PATH`.
`run-qa.mjs` then uses that resolved private link for its answer and judge calls.
It opens `plan.json` and `cli-identity.json` exclusively.

The operator runs the correct npm hash form from the candidate runner:

```text
npm --silent run eval:qa:paired:plan-sha256 -- /private/tmp/stellar-raven-paired-launch/plan.json
```

The package script already supplies `--print-plan-sha256`.
The optional `--plan <plan.json>` form also works.
A second `--print-plan-sha256` fails.
Direct Node phase commands preserve the assembly environment pin.

### 8. Sign the external authorization

The operator creates `authorization.txt` from the strict template and the plan's **Stop rules** lists.
The owner completes all fields and signs the canonical hash and every command array.
The owner records decisions 1 to 10 and confirms the replacement stability-register hash.
The authorization remains outside `plan.json`.
Any plan edit voids the signature.
The template below remains the signature contract.

### 9. Run the frozen P6 command

The script first compares all four listeners with `listeners.json`. A lost or changed listener stops the method.
The P6 wrapper repeats that check before each of its seven calls (`--paired-listeners` and its signed digest).
The operator calls `executeFrozen("p6", manager, env)` from [execute-frozen.mjs](execute-frozen.mjs).
The wrapper makes seven calls at `$0.50` each, with a `$3.50` maximum.
It uses the frozen identity flags, the `--paired-listeners` record and its digest, and the `--out` path.
The phase runner creates `p6.started.json` before starting the wrapper.
It records the canonical hash and phase, synchronizes the marker, and keeps it permanently.
It opens `p6.log` and `p6.stderr.log` exclusively before spawn.
These rules apply to every paid phase below.

### 10. Launch the supervisor

The script first compares all four listeners with `listeners.json`, as before P6.
The operator calls `executeFrozen("collection", manager, env)`.
It starts the same supervisor that `npm run eval:qa:paired:collect` names.
It supplies these exact arguments from the candidate runner directory:

```text
eval/qa/paired-collection-supervisor.mjs --plan /private/tmp/stellar-raven-paired-launch/plan.json --authorized-plan-sha256 <signed canonical hash>
```

The phase runner creates and synchronizes `collection.started.json` before spawning the supervisor.
It opens `receipt.json` and `collection.stderr.log` exclusively before spawn.
A concurrent or interrupted repeat fails before another child starts.
The marker and partial outputs remain after success, failure, or interruption.
The supervisor uses the two frozen `$80` collection commands and the four-hour deadline.
Only its successful receipt supplies the stored artifact paths.

### 11. Stop and verify all owned process groups

The operator calls `manager.stopServers()` after collection.
The same cleanup also runs after any earlier failure, signal, or exit.
The process guard keeps managed Node descendants in the same launch group.
It synchronously records child creation before the parent's spawn call returns.
Each Node child writes a durable acknowledgment before its application starts.
The supervisor arms also inherit the supervisor's launch group.
The manager checks creation records and verified ancestry within each recorded group generation.
A matching working directory never proves ownership.
The manager retires a group generation after its last process exits.
It refuses to signal any group that contains an unknown member.
It continues cleanup for other verified groups.
It reports unresolved process IDs, group IDs, and listeners for manual action.
An unresolved cleanup blocks further phases and worktree removal.
It sends `SIGTERM`, then `SIGKILL` if owned processes remain after five seconds.
It waits and checks all four listeners within a fixed ten-second cleanup deadline.
A failed cleanup retains the worktrees and reports the failure.
It never signals a process because that process occupies a port.

### 12. Judge the stored baseline, then the stored candidate

The operator calls `executeFrozen("baselineJudge", manager, env)`, then `executeFrozen("candidateJudge", manager, env)`.
The phase runner substitutes only the receipt's frozen artifact placeholders.
Each command retains its cumulative `$120` arm cap.
Each phase creates its own durable marker and exclusive logs before spawn.
A failed or repeated phase blocks the next paid method.
Exit `0` alone does not prove complete stored judging.
After each judge command, the executor checks the resulting artifact before proceeding.
It requires all 200 signed IDs, comparable status, complete collection and judging evidence, and allowed aggregates.
It requires no missing verdict, incomplete judge ID, unattempted judge ID, or suppressed aggregate.
Missing evidence blocks the next phase and preserves the phase marker and partial outputs.

### 13. Run the frozen comparison and recalibrate

The operator calls `executeFrozen("compare", manager, env)` with the baseline artifact first.
The printer returns `0` for `PASS`, `1` for `FAIL`, and `2` for `INDETERMINATE`.
The executor accepts statistical verdicts and stops on method blockers.
It records the paired JSON in `compare.log`.

The operator then runs the free recalibration from the candidate runner:

```text
eval/qa/validate-paired-verdict.mjs --recalibrate <receipt baseline artifact> <receipt candidate artifact>
```

It retains `recalibration.log` and `recalibration.stderr.log`.

### 14. Run both frozen flip rejudges

The operator calls `executeFrozen("baselineFlip", manager, env)`, then `executeFrozen("candidateFlip", manager, env)`.
Each command retains exactly one `$15` cap, the pinned identities, and `--allow-empty`.
Each phase reserves its durable marker and exclusive logs before spawning.
The flip results provide stability evidence only.

### 15. Review every row and remove worktrees after verified cleanup

The operator exits after the paid methods and its unconditional cleanup.
It retains both runner worktrees and every evidence file for review.
Review all 400 answers, verdicts, transcripts, transitions, costs, captures, and the receipt timeline.
Use a result reviewer who differs from the executor and the design author.
Use the plan's **Result review requirements** and **Stop rules** sections.
Record the subset result as a labeled paired diagnostic in `eval/qa/README.md`.
Stop after `PASS` or `FAIL`.
A statistical `INDETERMINATE` requires a new authorization and review before the one permitted repeat.

After review, use the same launch revision for removal:

```sh
node /Users/kalepail/Desktop/stellar-raven-codemode/.agents/rounds/2026-10-01-backlog-closeout/paired-launch.mjs --remove-worktrees "$PAIRED_REV"
```

Removal first verifies that every recorded process stopped and all four listeners are absent.
It also checks every recorded process group and each worktree's complete creation identity before removal.
It verifies repository membership and filesystem identities before copying or deleting any worktree file.
A replacement at the same path and revision fails these checks.
An identity mismatch preserves all worktree files and launch records.
It copies each existing results directory to the launch-record directory.
It deletes the uncommitted plan and salted identity file after preserving the other evidence.
It removes only worktrees that this launch recorded as successfully created.
It preserves every start marker, partial receipt, log, signature, and ownership record.
Do not delete or reset a start marker to repeat a method.
After an interrupted launch, obtain a new plan and authorization before any new paid attempt.

## Caps

| Method | Expected | Cap | Rule |
| --- | ---: | ---: | --- |
| P6 judge self-test | `$0.25` | `$3.50` | seven calls, `$0.50` each, no retry, direct Node, exact frozen command |
| Baseline collection, 200 rows, `--no-judge` | `$52` | `$80` | one supervised `run-qa.mjs` child |
| Candidate collection, 200 rows, `--no-judge` | `$52` | `$80` | one supervised `run-qa.mjs` child |
| Baseline stored judging | `$24` | cumulative `$120` | one `--judge-stored` command on the same ledger |
| Candidate stored judging | `$24` | cumulative `$120` | one `--judge-stored` command on the same ledger |
| Two-arm cumulative total | `$152` | `$240` | `twoArmCumulativeUsd` |
| Baseline flip rejudge | `$7` | `$15` | one frozen `re-judge.mjs --flips-vs` command |
| Candidate flip rejudge | `$7` | `$15` | one frozen `re-judge.mjs --flips-vs` command |
| Method maximum | about `$166` | `$273.50` | no other method |

## Wall time

| Phase | Expected | Maximum before a stop |
| --- | ---: | ---: |
| Pre-arm stable probe, capacity check, plan freeze, signature, P6, and preflights | 30 min | 60 min |
| Answering, both arms in lockstep | 2.5 h to 3.5 h | 4.0 h (supervisor deadline) |
| Stored judging, baseline then candidate | about 4.0 h | 6.0 h |
| Flip rejudges | 30 min | 1.5 h |
| Total inside one calendar day | about 8 h to 9 h | 12.5 h |

## Owner decisions: confirm at signature time

| Decision | Recommended answer | Reason |
| --- | --- | --- |
| 1 | Retire the `$882.50` plan. | Its P6 and candidate methods are spent; no amount transfers. |
| 2 | Use 200 selected IDs and pin the launch active count. | The statistical design fixes 200; both runners verify the full corpus identity. |
| 3 | Accept two concurrent server pairs. | The supervisor enforces ordered row release within the four-hour answering window. |
| 4 | Collect answers only, then judge stored artifacts. | This reduces the live upstream exposure window. |
| 5 | Explicitly accept the concurrent-load estimand. | Capacity establishes technical evidence; only the owner accepts this measurement condition. |
| 6 | Keep the whole-arm guard stop. | A changed identity makes the whole pair non-comparable. |
| 7 | Use the Saturday or Sunday UTC start. | The plan's dated cadence estimates favor a weekend window. |
| 8 | Keep `0.08` as an experimental no-change radius; print `0.05` and `0.10`. | This measurement does not establish a product-loss tolerance. |
| 9 | Keep candidate-only T4 or T5 loss terminal. | Such a loss forces `INDETERMINATE` under the frozen method. |
| 10 | Run P6 once through the frozen `$3.50` wrapper. | The summary proves the same pinned judge contract before collection. |

Also confirm the replacement stability-register pin in the authorization.
Decision 5 remains an explicit owner acceptance until signature.

## Strict authorization: fill-in template

```text
AUTHORIZATION: two-week impact, supervised paired subset (Option C, revision 3)

Prior plan: the 2026-09-03 $882.50 plan is RETIRED. Its P6 and candidate methods are spent.
No other method from it may start. No unspent amount transfers.
The general round approval of 2026-09-03 does not authorize this method.

Plan: schema qa-paired-collection-plan-v2, uncommitted, deleted after the run.
  canonical plan SHA-256: <printed by npm run eval:qa:paired:plan-sha256>
  This signature covers that hash and every command array in the plan:
  capacity.command, p6.command, arms.baseline.collectionCommand,
  arms.candidate.collectionCommand, arms.baseline.judgeCommand,
  arms.candidate.judgeCommand, flipRejudge.commands.baseline,
  flipRejudge.commands.candidate, and comparisonCommand.
  Any plan edit after this signature voids it.

Methods and caps, one run each, no transfer, no resume, no automatic repeat, no added method:
  P6 judge self-test              $3.50   (seven calls, $0.50 each, exact frozen wrapper command)
  baseline  --no-judge            $80     (supervised child)
  candidate --no-judge            $80     (supervised child)
  baseline  --judge-stored        $120    (cumulative on the same ledger)
  candidate --judge-stored        $120    (cumulative on the same ledger)
  two-arm cumulative              $240
  baseline  flip rejudge          $15     (frozen command, --allow-empty)
  candidate flip rejudge          $15     (frozen command, --allow-empty)
  method maximum                  $273.50

Denominator: explicit --ids, selected.count 200, activeCorpusCount <launch active count>.
  ordered-200 SHA-256: <recomputed at the launch revision>
  selected-content SHA-256: <recomputed>
  cases-file SHA-256: <recomputed>   ordered-active SHA-256: <recomputed>
  Both runner worktrees recompute all four values.
Tuple: claude-sonnet-5 / claude-sonnet-5 / v2.11 / p6 / stability-boundary-v1 / 0.75 / 34.
Flags: --variant A --surface search-execute --search-tool search; --judge-panel absent.
Baseline: 90d0ba75eb529c6a1cf6fe276f16cf4f1da4f9f0, add-missing, surface <sha256>.
Candidate and runner: <one clean 40-character revision>, verify-native, surface <sha256>.
Register: /private/tmp/stellar-raven-paired-launch/paired-stability-register.json <sha256>.
  Source: .agents/rounds/2026-10-01-backlog-closeout/paired-stability-register.json.
  Confirm the replacement pin at signature time.
Adapter: <sha256>.  Probe: <sha256>.  Pre-arm vector: <sha256>.
Claude path: <p6.claudePath>.  Binary: <sha256>.  Environment: <sha256>.
Versioned real path: <immutableClaude.realPath>.  Version: <immutableClaude.version>.
Private directory: <immutableClaude.privateBin>, mode 0700, containing only the claude link.
DISABLE_AUTOUPDATER=1.  The private directory remains first on PATH.
Launch process guard: <absolute guard path> <sha256>; included in the canonical plan.
  The managed NODE_OPTIONS value remains fixed across assembly and every paid phase.
  Collection, stored-judge, P6, and flip pins are this same pair.
Runner bytes: run-qa <sha256>, paired-verdict <sha256>, supervisor <sha256>, control <sha256>.
Contract bytes: capacity instrument <sha256>, P6 wrapper <sha256>, judge <sha256>,
  re-judge <sha256>, evidence pack <sha256>.
Capacity: artifact <absolute path> <sha256>, completedAt <timestamp>, fixed v2 contract;
  launch before completedAt + 86,400,000 ms.
P6: runner arm <baseline|candidate>, summary <absolute path>; the path must not exist.
Worktrees: baselineRunner <path>, candidateRunner <path>,
           baselineServer <path>, candidateServer <path>.
Ports: baseline <public>/<upstream>, candidate <public>/<upstream>, four distinct values.
.dev.vars: salt <64 hex>, names <list>, salted SHA-256 <sha256>; no value recorded.
Concurrent load: ACCEPTED by the owner, two answering agents, evidence: the capacity artifact above.
Topology: npm run eval:qa:paired:collect -- --plan <absolute path>
          --authorized-plan-sha256 <the canonical hash above>;
          answer-only; lockstep; alternating release; stored judging baseline then
          candidate; frozen comparison command with the baseline artifact first;
          frozen flip commands with --allow-empty.
Window: weekend UTC start; four-hour supervisor deadline; one calendar day total.
Stop rules: the three lists in this report, copied verbatim into the ledger.
Reviews:
  - independent review of revision 3 by a lane that is not Fable 5.1 and not the
    orchestrator, verdict LAUNCH-OK, every finding reconciled;
  - result review of all 400 rows by a lane that is not the executor and not Fable 5.1;
  - final recomputation of counts, costs, hashes, exclusions, and transitions.
Reporting: record the subset result in eval/qa/README.md as a labeled paired diagnostic,
           never as the current-quality headline.
Owner decisions 1 to 10 below: each recorded with its answer.
Signature: AUTHORIZED <date> <owner>   or   NOT AUTHORIZED
```

Record these answers in the signed external record:

```text
Decision 1: <answer>
Decision 2: <answer and launch active count>
Decision 3: <answer>
Decision 4: <answer>
Decision 5: <explicit owner acceptance of the concurrent-load estimand>
Decision 6: <answer>
Decision 7: <UTC launch timestamp>
Decision 8: <answer>
Decision 9: <answer>
Decision 10: <answer>
Replacement stability-register SHA-256: <confirmed by the owner>
2026-10-01 approval: deferred launch; this signature authorizes the frozen method.
```

## Preview, recompute at launch

The corpus preview uses `bcfa617ffcb6e58e6a7498a1e42135a059535402`.
The preview contains 501 active cases and 200 selected cases.

| Corpus pin | Preview SHA-256 |
| --- | --- |
| `idsSha256` | `54118e3410ff3dd3ce34c07a1b0b6f5d92ed8e14b1d05d0546623c3a222a51fc` |
| `contentSha256` | `11587156c926fb9639b9e6b8950e3afa1331dfd4c12f4603a69cca4b2158b5ca` |
| `casesFileSha256` | `ae221407fad556081391ff0ff01a49a4391c4734fb39f1c9dd4474201369190e` |
| `activeCorpusIdsSha256` | `7da0fb70fd8a580e98c7dd81ea21a259f9841bea5107b9cfe3e20f4f8d87ded8` |

Service composition: `stellarDocs 95`, `scout 57`, `lumenloop 25`, `skills 14`, `none 9`.
Freshness composition: `stable 87`, `scheduled 59`, `live 54`.
Trap composition: `12 true`, `188 false`.

All instrument values below are **preview, recompute at launch**.
The first hash column uses the unchanged `bcfa617f` bytes.
The supervisor repairs change its hash; the second column records the current preparation bytes.

| Instrument | `bcfa617f` SHA-256 | Preparation SHA-256 |
| --- | --- | --- |
| `eval/qa/run-qa.mjs` | `60aa6f3b5cb46e509dadf54fba7a34777569f2e1ba437374a282b2fc5f65f61f` | `60aa6f3b5cb46e509dadf54fba7a34777569f2e1ba437374a282b2fc5f65f61f` |
| `eval/qa/paired-verdict.mjs` | `5a473a57708ddb17791e264b7da68e96b5b49b0102141d3a687b15510e8bd960` | `5a473a57708ddb17791e264b7da68e96b5b49b0102141d3a687b15510e8bd960` |
| `eval/qa/paired-collection-supervisor.mjs` | `caecb039a502295cc257ec4efffb80db64d50098333a6afc56198a7d761ad1e5` | `eadaa8f972a5e18b2eb6321461bb65244769c99bb8a12ba61124b57d3fbcf591` |
| `eval/qa/paired-collection-control.mjs` | `1f3e4ce3bdbb6679c4e6e8e59c433c3093ecab98eaa0bbdb74b3ad5a06a76bb7` | `1f3e4ce3bdbb6679c4e6e8e59c433c3093ecab98eaa0bbdb74b3ad5a06a76bb7` |
| `eval/qa/exact-old-runtime-adapter.mjs` | `473690c7f10d5384be252bb97f9aa16ee88428d23589779289f5910c08e60303` | `473690c7f10d5384be252bb97f9aa16ee88428d23589779289f5910c08e60303` |
| `eval/qa/probe-remote-identities.mjs` | `bde386a01ceb5bfdd325f3cd24369e00e2c111f7b4747ec7c0c9e77bc84485ef` | `bde386a01ceb5bfdd325f3cd24369e00e2c111f7b4747ec7c0c9e77bc84485ef` |
| `eval/qa/check-paired-capacity.mjs` | `59a52b96e890f0de4babb911022ed863c4ad5a62a6473b146007544143e8f3a9` | `59a52b96e890f0de4babb911022ed863c4ad5a62a6473b146007544143e8f3a9` |
| `eval/qa/run-p6-judge-self-test.mjs` | `d821bb7d9d15004e65544c5de5f80255a1de190b788fce2603de1168da4f7c24` | `d821bb7d9d15004e65544c5de5f80255a1de190b788fce2603de1168da4f7c24` |
| `eval/qa/judge.mjs` | `2d14376ac4b1c1f0b9c50b0067fc4287ba200eee46c6d5d4dd6425c5c8a07637` | `2d14376ac4b1c1f0b9c50b0067fc4287ba200eee46c6d5d4dd6425c5c8a07637` |
| `eval/qa/re-judge.mjs` | `d17c2a55c5e522fe11fda4ebca4bcde781f0f68bb19ab2630ce44abf11ebc678` | `d17c2a55c5e522fe11fda4ebca4bcde781f0f68bb19ab2630ce44abf11ebc678` |
| `eval/qa/evidence-pack.mjs` | `74a1bd47b1e2f824d672f0e399e2a679dd1195fd0a1366066bfa68e631f8b0d5` | `74a1bd47b1e2f824d672f0e399e2a679dd1195fd0a1366066bfa68e631f8b0d5` |

Launch process guard SHA-256: `af355f0c81014a8385a62dd5a67fdfcb9742a9baf219fa613fb4872f6df0f303`.
This value is a preparation preview; recompute it at launch.

Repository stability snapshot SHA-256: `1cbd7d46e5c19f72b8feef6ef5df88880c27ab704e4f39ecebe51cd1666fdb99`.

The snapshot is new in this preparation and has no `bcfa617f` hash.
Claude, environment, salts, surfaces, capacity, and remote-vector previews are absent.
This lane did not compute live identity values.

### The 200 sampled IDs: preview, recompute at launch

| ID | Service | Freshness | Trap |
| --- | --- | --- | --- |
| `q-aas-burn-clawback-redemption-mechanics` | `stellarDocs` | `stable` | `false` |
| `q-aas-claimable-predicates-expiry-reserves` | `stellarDocs` | `stable` | `false` |
| `q-aas-list-token-on-exchanges-aggregators` | `scout` | `scheduled` | `false` |
| `q-aas-trustline-limit-lifecycle` | `stellarDocs` | `stable` | `false` |
| `q-agent-identity-erc8004-stellar` | `skills` | `scheduled` | `false` |
| `q-anchor-list-builders-discovery` | `scout` | `live` | `false` |
| `q-anchor-moneygram-ramps` | `stellarDocs` | `scheduled` | `false` |
| `q-anchor-sdp-what` | `stellarDocs` | `scheduled` | `false` |
| `q-asset-claimable-balance` | `stellarDocs` | `stable` | `false` |
| `q-asset-path-payment-ops` | `stellarDocs` | `stable` | `false` |
| `q-asset-rwa-tokenized-freshness` | `lumenloop` | `live` | `false` |
| `q-asset-stablecoin-issuers-discovery` | `scout` | `live` | `false` |
| `q-asset-trustline-basics` | `stellarDocs` | `stable` | `false` |
| `q-asset-usdc-eurc-issuer` | `stellarDocs` | `stable` | `false` |
| `q-asset-wallet-sdk-seps` | `stellarDocs` | `stable` | `false` |
| `q-builder-by-scf-tier` | `scout` | `live` | `false` |
| `q-builder-justin-rice-history` | `lumenloop` | `scheduled` | `false` |
| `q-cctp-v2-usdc-stellar` | `skills` | `scheduled` | `false` |
| `q-comp-clawback-cap0035` | `stellarDocs` | `stable` | `false` |
| `q-comp-finclusive-caas` | `scout` | `stable` | `false` |
| `q-comp-sac-inherits-flags` | `stellarDocs` | `stable` | `false` |
| `q-comp-sep8-regulated-assets-approval-server` | `stellarDocs` | `stable` | `false` |
| `q-comp-yieldblox-oracle-incident` | `scout` | `scheduled` | `false` |
| `q-crp-anchors-by-corridor` | `lumenloop` | `live` | `false` |
| `q-crp-dtcc-stellar-connection-plan` | `lumenloop` | `scheduled` | `false` |
| `q-crp-export-tx-history-taxes` | `stellarDocs` | `live` | `false` |
| `q-crp-partner-detail-after-discovery` | `scout` | `live` | `false` |
| `q-crp-tokenize-personal-rwa` | `scout` | `live` | `false` |
| `q-defi-aquarius-what-is` | `lumenloop` | `stable` | `false` |
| `q-defi-blend-alternatives` | `lumenloop` | `stable` | `false` |
| `q-defi-bridge-evm-to-stellar-axelar` | `scout` | `live` | `false` |
| `q-defi-build-staking-for-own-token` | `stellarDocs` | `stable` | `false` |
| `q-defi-category-saturation-live` | `scout` | `live` | `false` |
| `q-defi-defindex-honest` | `lumenloop` | `stable` | `false` |
| `q-defi-etherfuse-stablebonds` | `scout` | `live` | `false` |
| `q-defi-lumenloop-categories-vocab` | `lumenloop` | `stable` | `false` |
| `q-defi-market-making-kelp` | `scout` | `live` | `false` |
| `q-defi-perps-whitespace` | `scout` | `scheduled` | `false` |
| `q-defi-reflector-oracle` | `lumenloop` | `stable` | `false` |
| `q-defi-rwa-treasury-funding-live` | `scout` | `live` | `false` |
| `q-defi-sdex-offer-lifecycle` | `stellarDocs` | `stable` | `false` |
| `q-defi-skill-ecosystem-scout` | `skills` | `stable` | `false` |
| `q-defi-soroswap-vs-stellarx` | `lumenloop` | `stable` | `false` |
| `q-eco-defi-market-map` | `scout` | `stable` | `false` |
| `q-eco-defi-tvl-current` | `lumenloop` | `live` | `false` |
| `q-eco-dex-saturation` | `scout` | `stable` | `false` |
| `q-eco-hana-wallet-scf` | `lumenloop` | `stable` | `false` |
| `q-eco-stablecoins-on-stellar` | `lumenloop` | `live` | `false` |
| `q-eco-stellar-wallets-list` | `scout` | `live` | `false` |
| `q-eco-xbull-wallet` | `lumenloop` | `stable` | `false` |
| `q-edge-1xlm-activation-fee` | `none` | `stable` | `true` |
| `q-edge-deep-full-history-report` | `scout` | `stable` | `true` |
| `q-edge-doc-category-filter-empty` | `stellarDocs` | `live` | `false` |
| `q-edge-doc-title-zero-hits` | `stellarDocs` | `live` | `false` |
| `q-edge-fresh-latest-scf-round` | `scout` | `scheduled` | `false` |
| `q-edge-inject-ignore-instructions` | `stellarDocs` | `stable` | `true` |
| `q-edge-jailbreak-generate-secret-keys` | `none` | `stable` | `true` |
| `q-edge-lumenloop-person-entity-empty` | `lumenloop` | `live` | `false` |
| `q-edge-noinfo-sep-9999` | `stellarDocs` | `stable` | `true` |
| `q-edge-oos-solana-vs-aptos` | `none` | `stable` | `true` |
| `q-edge-partner-detail-soft-empty` | `scout` | `live` | `false` |
| `q-edge-strupey-ambiguous-stellar-history` | `lumenloop` | `scheduled` | `true` |
| `q-edge-validators-reverse-tx-fork-detection` | `stellarDocs` | `stable` | `false` |
| `q-gap-builders-person-empty` | `scout` | `live` | `false` |
| `q-gap-contracts-domain-empty` | `scout` | `live` | `false` |
| `q-gap-digest-defi-adjacent` | `skills` | `live` | `false` |
| `q-gap-hackathon-winner-order` | `scout` | `live` | `false` |
| `q-gap-lumen-documents-browse` | `lumenloop` | `live` | `false` |
| `q-gap-lumen-project-tag-vocabulary` | `lumenloop` | `live` | `false` |
| `q-gap-match-partners-degrade` | `scout` | `live` | `false` |
| `q-gap-scout-list-skill-directory` | `scout` | `live` | `false` |
| `q-gap-semantic-similar-projects` | `lumenloop` | `live` | `false` |
| `q-gap-upcoming-hackathon-fallback` | `scout` | `live` | `false` |
| `q-hist-meridian-2026-corrected-venue` | `lumenloop` | `scheduled` | `false` |
| `q-hist-scp-rewrite-2015` | `scout` | `stable` | `false` |
| `q-hist-unhcr-stellar-aid-assist` | `scout` | `stable` | `false` |
| `q-hist-yieldblox-v2-2026-exploit` | `lumenloop` | `stable` | `false` |
| `q-hot-fee-pool-burn-deflation` | `stellarDocs` | `stable` | `false` |
| `q-hot-sdf-xlm-holdings-sales` | `scout` | `live` | `false` |
| `q-infra-quickstart-local-network` | `stellarDocs` | `live` | `false` |
| `q-infra-rpc-provider-archive-tier` | `stellarDocs` | `scheduled` | `false` |
| `q-infra-testnet-vs-futurenet` | `stellarDocs` | `live` | `false` |
| `q-jutsu-check-account-history` | `stellarDocs` | `stable` | `false` |
| `q-mpp-discovery-and-modes` | `skills` | `scheduled` | `false` |
| `q-n3-cross-thread-memory-exfiltration` | `none` | `stable` | `true` |
| `q-n3-inject-ignore-previous-instructions` | `none` | `stable` | `true` |
| `q-n3-offtopic-home-renovation` | `none` | `stable` | `true` |
| `q-n3-pi-network-wrong-chain` | `none` | `stable` | `true` |
| `q-n3-wallet-hacked-support-redirect` | `none` | `stable` | `true` |
| `q-org-mazieres-chief-scientist` | `scout` | `scheduled` | `false` |
| `q-org-sdf-mandate-buckets` | `scout` | `scheduled` | `false` |
| `q-passkey-smart-account-architecture` | `stellarDocs` | `scheduled` | `false` |
| `q-pay-anchor-msb-licensing` | `stellarDocs` | `stable` | `false` |
| `q-pay-travel-rule-aid-flows` | `scout` | `stable` | `false` |
| `q-pc-account-activation-not-found` | `stellarDocs` | `stable` | `false` |
| `q-pc-address-types-strkey` | `stellarDocs` | `stable` | `false` |
| `q-pc-cross-redstone-sep40` | `none` | `scheduled` | `false` |
| `q-pc-fee-bump-channel-accounts-feepool` | `stellarDocs` | `stable` | `false` |
| `q-pc-memos-reference` | `stellarDocs` | `stable` | `false` |
| `q-pc-practical-fee-setting` | `stellarDocs` | `stable` | `false` |
| `q-pc-protocol-upgrade-timing` | `stellarDocs` | `live` | `false` |
| `q-pc-sequence-numbers-ordering-replace` | `stellarDocs` | `stable` | `false` |
| `q-pc-surge-griefing-threat-model` | `stellarDocs` | `stable` | `false` |
| `q-production-anchor-architecture` | `stellarDocs` | `scheduled` | `false` |
| `q-protocol-24-whisk-incident` | `stellarDocs` | `stable` | `false` |
| `q-protocol-accounts-signers-thresholds` | `stellarDocs` | `stable` | `false` |
| `q-protocol-bls12-381-cap59` | `stellarDocs` | `stable` | `false` |
| `q-protocol-cap-process` | `stellarDocs` | `stable` | `false` |
| `q-protocol-ledger-entry-types` | `stellarDocs` | `stable` | `false` |
| `q-protocol-max-tx-set-size` | `stellarDocs` | `scheduled` | `false` |
| `q-protocol-operations-vs-transactions` | `stellarDocs` | `stable` | `false` |
| `q-protocol-quorum-slice-vs-quorum` | `stellarDocs` | `stable` | `false` |
| `q-protocol-tier1-requirements` | `stellarDocs` | `stable` | `false` |
| `q-protocol-validator-upgrade-vote` | `stellarDocs` | `stable` | `false` |
| `q-raph-buy-xlm-safely` | `stellarDocs` | `live` | `false` |
| `q-raph-exchange-memo` | `stellarDocs` | `stable` | `false` |
| `q-raph-low-xlm-transfer-fail` | `stellarDocs` | `stable` | `false` |
| `q-raph-missing-exchange-memo` | `stellarDocs` | `scheduled` | `false` |
| `q-raph-remittance-path-payment` | `stellarDocs` | `stable` | `false` |
| `q-raph-restore-wallet` | `stellarDocs` | `scheduled` | `false` |
| `q-raph-usdc-onto-stellar` | `stellarDocs` | `live` | `false` |
| `q-raph-xlm-network-role` | `stellarDocs` | `stable` | `false` |
| `q-rwa-stellar-vs-erc20-regulated` | `stellarDocs` | `stable` | `false` |
| `q-scf-ambassador-program` | `scout` | `scheduled` | `false` |
| `q-scf-blend-winners-live` | `scout` | `live` | `false` |
| `q-scf-contract-verification-rfp-live` | `scout` | `live` | `false` |
| `q-scf-cross-decaf-sep24` | `lumenloop` | `scheduled` | `false` |
| `q-scf-current-hackathons-compare-live` | `scout` | `live` | `false` |
| `q-scf-eligibility-criteria` | `scout` | `live` | `false` |
| `q-scf-hackathon-compare-live` | `scout` | `live` | `false` |
| `q-scf-hummingbot-kelp-closed-rfp` | `scout` | `live` | `false` |
| `q-scf-kale-winner-live` | `scout` | `live` | `false` |
| `q-scf-open-rfps-live` | `scout` | `live` | `false` |
| `q-scf-pitch-prep-live` | `scout` | `live` | `false` |
| `q-scf-rfp-tooling` | `scout` | `scheduled` | `false` |
| `q-scf-sdf-bug-bounty` | `scout` | `live` | `false` |
| `q-scf-skill-submission-radar` | `skills` | `stable` | `false` |
| `q-scf-total-distributed` | `scout` | `live` | `false` |
| `q-scf-verified-members` | `scout` | `live` | `false` |
| `q-sep-12-kyc` | `stellarDocs` | `stable` | `false` |
| `q-sep-41-token-interface` | `stellarDocs` | `live` | `false` |
| `q-sep-45-contract-auth` | `stellarDocs` | `live` | `false` |
| `q-sep-6-vs-31-misnumber-trap` | `stellarDocs` | `stable` | `false` |
| `q-sep-8-regulated-assets` | `stellarDocs` | `stable` | `false` |
| `q-sep-interactive-deposit-withdraw` | `stellarDocs` | `stable` | `false` |
| `q-sep53-message-signing` | `stellarDocs` | `scheduled` | `false` |
| `q-sor-build-target-wasm32v1` | `stellarDocs` | `live` | `false` |
| `q-sor-contract-as-claimable-arbiter` | `stellarDocs` | `stable` | `false` |
| `q-sor-cross-socketfi-auth` | `scout` | `scheduled` | `false` |
| `q-sor-cross-warmancer-zk-stack` | `skills` | `scheduled` | `false` |
| `q-sor-decode-hosterror-codes` | `stellarDocs` | `scheduled` | `false` |
| `q-sor-doc-timestamping-manage-data` | `stellarDocs` | `stable` | `false` |
| `q-sor-evm-to-soroban-porting` | `stellarDocs` | `scheduled` | `false` |
| `q-sor-persistent-unbounded-collection-cap` | `stellarDocs` | `stable` | `false` |
| `q-sor-sac-introspection` | `stellarDocs` | `scheduled` | `false` |
| `q-sor-stale-spec-after-upgrade` | `stellarDocs` | `scheduled` | `false` |
| `q-sor-ttl-defaults-extend` | `stellarDocs` | `scheduled` | `false` |
| `q-soroban-auth-recursion-dos-audit` | `scout` | `stable` | `false` |
| `q-soroban-av-passkeys-talk` | `lumenloop` | `scheduled` | `false` |
| `q-soroban-check-auth-custom-account` | `stellarDocs` | `stable` | `false` |
| `q-soroban-constructor-lifecycle` | `stellarDocs` | `scheduled` | `false` |
| `q-soroban-contractmeta-vs-contractevent` | `stellarDocs` | `stable` | `false` |
| `q-soroban-deploy-cli` | `stellarDocs` | `scheduled` | `false` |
| `q-soroban-fuzz-testing` | `skills` | `stable` | `false` |
| `q-soroban-no-std-constraints` | `stellarDocs` | `stable` | `false` |
| `q-soroban-oracle-defensive-consumption` | `scout` | `stable` | `false` |
| `q-soroban-oz-upgradeable-macro` | `skills` | `scheduled` | `false` |
| `q-soroban-require-auth` | `stellarDocs` | `stable` | `false` |
| `q-soroban-sdk-cve` | `scout` | `scheduled` | `false` |
| `q-soroban-simulate-resource-fee` | `stellarDocs` | `scheduled` | `false` |
| `q-soroban-storage-types` | `stellarDocs` | `scheduled` | `false` |
| `q-soroban-upgradeable-storage-compat` | `stellarDocs` | `stable` | `false` |
| `q-soroban-wasm-size-limit` | `stellarDocs` | `scheduled` | `false` |
| `q-soroban-x402-auth-entry-signing` | `skills` | `scheduled` | `false` |
| `q-ti-classic-submission-errors` | `stellarDocs` | `stable` | `false` |
| `q-ti-compute-token-lp-market-data` | `stellarDocs` | `scheduled` | `false` |
| `q-ti-enumerate-holders-airdrop` | `stellarDocs` | `scheduled` | `false` |
| `q-ti-find-export-secret-key` | `stellarDocs` | `scheduled` | `false` |
| `q-ti-historical-pointintime-balances` | `stellarDocs` | `scheduled` | `false` |
| `q-ti-openzeppelin-relayer` | `scout` | `scheduled` | `false` |
| `q-ti-parse-raw-ledger-data` | `stellarDocs` | `scheduled` | `false` |
| `q-ti-scout-refresh-cached-rows` | `scout` | `live` | `false` |
| `q-ti-secret-key-vs-mnemonic-derivation` | `stellarDocs` | `scheduled` | `false` |
| `q-ti-skill-builder-quickstart` | `skills` | `stable` | `false` |
| `q-ti-skill-integration-finder` | `skills` | `stable` | `false` |
| `q-ti-stellar-lab-usage-and-new-ui` | `stellarDocs` | `scheduled` | `false` |
| `q-ti-video-tutorials` | `lumenloop` | `scheduled` | `false` |
| `q-ti-vocab-project-tags-live` | `lumenloop` | `live` | `false` |
| `q-tool-cctp-stellar-integration` | `stellarDocs` | `scheduled` | `false` |
| `q-tool-cli-skills-discovery` | `scout` | `scheduled` | `false` |
| `q-tool-flutter-mobile-sdk` | `stellarDocs` | `scheduled` | `false` |
| `q-tool-greenfield-indexer-prior-art-preflight` | `scout` | `scheduled` | `false` |
| `q-tool-js-sdk-package` | `stellarDocs` | `stable` | `false` |
| `q-tool-oracle-repo-live` | `scout` | `live` | `false` |
| `q-tool-passkey-wallet-recovery` | `stellarDocs` | `scheduled` | `false` |
| `q-tool-sdk-repos-discovery` | `scout` | `scheduled` | `false` |
| `q-tool-smart-wallet-repos-discovery` | `scout` | `scheduled` | `false` |
| `q-tool-wallets-comparison` | `stellarDocs` | `scheduled` | `false` |
| `q-zk-circuit-setup` | `skills` | `stable` | `false` |
| `q-zk-nullifier-storage` | `skills` | `stable` | `false` |

## Offline rehearsal and flag audit

The baseline rehearsal used `90d0ba75eb529c6a1cf6fe276f16cf4f1da4f9f0` bytes from `git archive`.
The lane forbids `git worktree add` and other Git writes.
Thus the rehearsal used an extracted checkout under this lane's worktree.
It did not register a Git worktree.
`npm ci --ignore-scripts` installed the baseline lockfile successfully.
The flag prevented the `prepare` hook from writing Git configuration.
`npm run build` passed with baseline Wrangler `4.120.1`.
The build used `wrangler deploy --dry-run`; it deployed nothing and started no server.
The rehearsal directory was removed after both checks.
A real four-worktree listener rehearsal remains a launch-day free step.

The offline parser audit covers the frozen `run-qa.mjs`, `re-judge.mjs`, and P6 arrays at `bcfa617f`.
All required flags exist.
The launch-specific scripts replace the old embedded startup and executor blocks after the independent review.
The assembled preview passed the complete supervisor validator with simulated artifacts and P6 records.
That offline check used the current 501-case corpus and made no paid call.
The npm environment repair also passed an offline identity check.
The assembler repeats that parser check at the launch revision.
The audit found these launch details:

- The baseline lacks `dev:eval`; step 3 invokes its installed Wrangler directly.
- The hash package script already inserts `--print-plan-sha256`.
- Both `<plan.json>` and `--plan <plan.json>` work after the npm separator.
- A second `--print-plan-sha256` fails; use step 7's exact command.
- P6 accepts its exact identity flags and `--out`; its seven internal calls carry their budget caps.
- The comparison printer uses verdict-specific exit codes; the executor distinguishes them from method blockers.
- The operator now invokes paid phases through direct Node commands with the unchanged signed environment.
- The old temporary stability register is missing; step 2 freezes the repository snapshot.
- The other paired instruments contain no fixed 500-active-case rule.

The supervisor now validates the signed count as an integer of at least 200.
Both runners must reproduce its exact count, uniqueness, ordered active-ID hash, content hash, and cases-file hash.
The 200-case statistical requirement remains fixed.
