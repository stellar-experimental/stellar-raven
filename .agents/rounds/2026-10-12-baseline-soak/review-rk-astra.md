# RK independent review

Reviewed commit: `d71898020b85334a2f2576ae55930dc51633a1ae`.
Base: `63396840`.
The review used local files and cached package sources.
No server, model call, upstream call, or Wrangler process ran.
Only this review file changed.

Path abbreviations below:

- `R`: `.agents/rounds/2026-10-12-baseline-soak/`
- `S`: `/private/tmp/claude-501/w1012/k-soak/`
- `A`: `/Users/kalepail/Desktop/stellar-raven-codemode/eval/qa/results/2026-10-11-paired-attempt-3/`
- `W`: `/Users/kalepail/Desktop/stellar-raven-codemode/node_modules/wrangler/wrangler-dist/cli.js`

## Findings by severity

### P2: Separate the reproduced failure from the inferred connection mechanism

Evidence: `R/README.md:9`, `R/README.md:30`, `R/README.md:43`, and `.agents/TODO.md:674`.

The record states that the exact attempt 3 cause and both outcomes share the same connection race.
The evidence strongly supports the fatal `ProxyWorker` error path.
It supports the idle-limit race as a leading explanation, but does not establish the complete mechanism.

The attempt 3 debug log ends after a successful response at `07:02:39.559Z` (`A/baseline-wrangler-debug.log:54252`).
It contains no final `ProxyController` error or failed-request timestamp.
The transcript records the matching network error and later refused connections (`A/baseline-results/2026-10-11T07-03-19-variantA.json:139009`).
Thus, the record cannot directly establish a 5 s interval for that original failure.

Run 1 directly establishes the empty-error path (`R/evidence/run1/debug-proxycontroller-error.log:2`).
Runs 2 and 3 show runtime replacements and connection refusals, but no `ProxyWorker` error.
Their last successful requests precede the replacements (`R/evidence/run2-wrangler-4.149.0/race-sweep.jsonl:46`, `R/evidence/run3-wrangler-4.149.0-repeat/race-sweep.jsonl:48`).
The watcher records process changes, not exit signals or the reason for the runtime crash.
The record also supplies no socket-listener capture that establishes the claimed random-port reassignment.

Keep the observed exit and lost-port results.
Describe the connection race as strongly supported, and keep the runtime crash cause open.
Replace the absolute token and uptime exclusions with the narrower result: these factors are unnecessary for reproduction.
Apply these qualifications to the TODO text too.
Elapsed refresh deadlines establish continued server availability; they do not establish successful remote-token refreshes.

### P2: State the assumptions behind the 27% estimate

Evidence: `R/README.md:77` and `R/README.md:135`.

The arithmetic is correct, but the text presents a conditional estimate as a measured baseline failure probability.
The calculation assumes independent requests and a constant event probability across versions, clients, request types, and idle intervals.
Those assumptions matter because this failure depends on request timing.
The source events came from Wrangler 4.133.0 and 4.145.0, not 4.120.1.
The calculation also excludes runtime crashes and uses only eight observed events.

Label 27% as an illustrative estimate under those assumptions.
State that the actual next-run stop probability remains unknown.
Retain a dated log inventory and counting rule so another reviewer can reproduce the denominator.
Apply the same qualification to the “one launch of four” recommendation.

### P3: Correct the default interval in the summary script

Evidence: `R/summarize.mjs:10` and `R/summarize.mjs:39`.

Without `--every`, `indexOf()` returns `-1`, so the expression reads `process.argv[0]`.
The Node executable path becomes `NaN`, and the interval filter removes every intermediate sample.
The documented default command printed only the first and last rows during this review.
Check whether the option exists before reading its value, and otherwise use `10`.
The committed table remains correct because `--every 1` reproduces it exactly.

## Answers to the five questions

### 1. Failure cause and remaining explanations

The run 1 evidence establishes the fatal Wrangler 4.120.1 handling path.
The 4,994 ms sweep request returned HTTP 500 (`R/evidence/run1/race-sweep.jsonl:49`).
The debug entry records a plain cause object with `Network connection lost.` and an empty outer Error.
The process then exited with code 1 (`R/evidence/run1/wrangler-exit.json:1`).

I independently read Wrangler 4.120.1 from the local npm package cache, without extraction or execution.
Its `package/wrangler-dist/cli.js:179267` wraps a non-Error cause in `new Error()` without a message.
Its main `handleErrorEvent` emits the event at line 433474.
Its dev handler waits on `events.once(..., "teardown")` at line 438876.
These sources support the stated fatal handling mechanism.
The cached archive has this integrity value:

`sha512-rQJ38rY02XiVITbSBWHC7oap3M2evcXgsC4CdlIX4WQENUZMMnue9j2vXO4aIi39KR+jDH+UHK8JNqp1+UjkRQ==`

The original attempt shows the same external failure signature (`A/baseline-wrangler.log:3972`).
The 3,000 ms control and nearby failing sweeps strongly support an idle-interval trigger.
They do not identify which connection closed first or why another runtime crashed.
No packet trace, crash reason, or exit signal establishes that final cause.
I did not fetch the linked KJ source under the review's no-upstream-call restriction.
The mutable `v2` link also does not identify the exact KJ revision in either workerd build.

### 2. Counts, duration, resources, and probability

The 2,268-request replay count is correct.
The outcomes are 1,946 `ok`, 298 `accepted`, and 24 `tool-error`; no request has a network error.
The tool calls comprise 692 successful searches, 658 successful executions, and 24 execution errors.
The count excludes the separate 32-request first pass, the trigger check, and the later sweep.

The launch record starts at `12:36:25.976Z`.
The last main replay request started at `15:51:52.240Z`, about 3 h 15 min later.
The main replay itself started at `12:39:57.873Z`, so its recorded span is about 3 h 12 min.
The 3 h 15 min claim is sound as server uptime, with that load-window distinction.

The per-minute table matches a fresh summary of `S/run1/samples.jsonl` and `S/run1/requests.jsonl` exactly.
The reported RSS entries and flat CPU/file trends match those samples.
The stated latency values match quantiles using `floor((n - 1) * p)` over 1,374 tool calls.
The connection watcher records 1,227 opens and 1,226 closes.
These are sampled connection observations, not proof that every open replaced the previous connection.

I reproduced the historical denominator from the local Wrangler logs:

| Wrangler | Recorded MCP events |
| --- | ---: |
| 4.133.0 | 21,668 |
| 4.145.0 | 3,513 |
| 4.149.0, excluding the two targeted sweeps | 3,080 |
| Total | 28,261 |

The excluded sweeps contribute 48 events each.
Five historical logs contain eight matching error reports, with one report counted per failed request.
The logs date from September 18–19 and October 8.
The formula gives `1 - (1 - 8/28261)^1090 = 0.2655226360`, which rounds to 27%.
Under the same assumptions, zero events across 2,268 requests has probability about 53%.
The soak result is therefore consistent with that illustrative rate.
The record currently omits the important assumptions described in finding 2.

### 3. Wrangler 4.149.0 behavior

The installed source explicitly logs `ProxyWorker` errors without emitting the fatal event (`W:369832`).
It also preserves serialized error messages (`W:184221`).
I confirmed that the installed source matches the cached 4.149.0 package source.

Runs 2 and 3 do not test that specific nonfatal branch: neither contains a `ProxyWorker` error.
They support the separate runtime-crash and unavailable-port claim.
Run 2 records one refused request (`R/evidence/run2-wrangler-4.149.0/race-sweep.jsonl:47`).
Run 3 records five refused requests across about 20 s (`R/evidence/run3-wrangler-4.149.0-repeat/race-sweep.jsonl:49`).
Both log the runtime restart warning and retain the Wrangler process until later cleanup.
The stronger “random port” and “until stopped” details need retained socket checks or narrower wording.

### 4. Paired A/B recommendation and missing options

Using Wrangler 4.149.0 in both arms is a reasonable conditional recommendation.
It removes the known asymmetric fatal-error handling.
The record correctly discloses the changed workerd, miniflare, and esbuild versions.
The comparison then measures the source changes under a shared dev runtime.
It no longer measures the complete historical dependency difference.

The recorded surface pins match (`R/evidence/run2-wrangler-4.149.0/surface.json:14`).
This confirms the advertised MCP surface, not identical execution behavior under the changed runtime.
The actual paired launch still needs both surface checks, listener checks, and a newly signed plan.
Stop-on-lost-port is sound because both versions showed persistent connection failures after a runtime restart.

The record omits two useful experiments that do not change model-visible tools:

- Test a launcher or proxy connection policy that avoids reuse near the idle limit.
- Test one bounded transport retry for eligible read-only calls after the server remains available.

A client-only keep-alive change may affect the wrong connection.
The suspected connection lies between the proxy and user runtime.
A retry cannot recover the old fatal exit or the lost public port.
Also, a failed response does not prove that an `execute` request never ran.
Any retry policy needs duplicate-execution controls, symmetric settings, and recorded extra calls and latency.
These options need controlled validation before inclusion in a paid run.

### 5. Secrets, scope, and TODO accuracy

All 33 changed files lie under `.agents/`.
The branch contains only the stated commit after the stated base.
I found no committed secret value, token value, or partner-tier detail.
The token-window files contain timestamps only; the binding log uses hidden values.
An exact comparison against available live secret values found no match in the changed files.
`npm run secrets:scan -- --tree` passed, including gitleaks.

All seven JavaScript files passed `node --check`.
The launch script passed `zsh -n`.
The review did not rerun runtime tests or builds because it changed no runtime code and prohibited servers.

The TODO correctly retains the owner decision and plan-signing requirement.
Its exact-cause and same-race claims need the qualifications in finding 1.
No measurement contract file changed.

RECORD: CHANGES: Qualify the causal claims and probability estimate; correct the summary script's default interval.
