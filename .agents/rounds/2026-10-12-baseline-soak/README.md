# 2026-10-12 baseline soak: the attempt 3 server stop

Lane K of the 2026-10-12 round. This record answers `.agents/TODO.md` owner decision A, "Next step
(free)": soak the paired baseline server and find why it stopped in attempt 3. No model call ran.
The replay called the real upstream services with the server's own keys.

## Result

- **Cause found and reproduced.** A request that reaches the local Wrangler dev server about 5 s
  after the previous response can fail with `Network connection lost.` Wrangler 4.120.1 treats
  that failure as fatal. It prints an empty `✘ [ERROR]` and exits with code 1. This is the
  attempt 3 stop. A targeted check reproduced it with the same stack, the same empty error, and
  the same bug notice.
- **Uptime, the cf token, and the remote AI binding are not the cause.** The baseline server ran
  3 h 15 min under replayed attempt 3 and attempt 1 traffic: 2,268 requests, 0 network errors,
  0 stops. The token expired at 1 h 00 min. The remote preview refreshes at 50 min and 100 min
  passed. The same stop then came 4 min into the targeted check.
- **Wrangler 4.149.0 does not remove the risk.** It survives the `Network connection lost.`
  failure (one request fails, the server continues). But the same timing can also crash the
  Workers runtime. After that crash, both 4.120.1 and 4.149.0 restart the runtime on a random
  port, and the public port refuses every connection.

## Mechanism

Wrangler dev runs two `workerd` instances. The proxy instance owns the public port. Its
`ProxyWorker` forwards each request to the user runtime over a pooled HTTP keep-alive
connection. KJ HTTP closes an idle client connection after `idleTimeout = 5 * kj::SECONDS`. The
server side closes after `pipelineTimeout = 5 * kj::SECONDS`
([`kj/compat/http.h`](https://github.com/capnproto/capnproto/blob/v2/c%2B%2B/src/kj/compat/http.h)).
A request that reuses the connection at the 5 s boundary races the close.

The race has two observed outcomes:

1. **`ProxyWorker` fetch failure.** The proxy instance answers HTTP 500 with
   `Error: Network connection lost. at async Object.fetch (…/miniflare/…/entry.worker.js:4719:22)`.
   `ProxyWorker` posts `{ type: "error", error: { name, message, stack } }` to the
   `ProxyController`. In 4.120.1, `castErrorCause` turns that plain object into `new Error()`
   with an empty message. `DevEnv.handleErrorEvent` emits it as `error`. The `dev` handler waits
   on `events.once(devEnv, "teardown")`, which rejects on `error`. The top-level handler prints
   `cause.message` (empty) and the bug notice, and the process exits with code 1.
   In 4.149.0, `castErrorCause` keeps the message, and `handleErrorEvent` logs
   `Error inside ProxyWorker (the affected request failed; the dev server continues)`.
2. **Runtime crash.** A runtime `workerd` exits about 1 s to 2 s after the race, with no runtime
   output and no macOS crash report. Wrangler prints `The Workers runtime crashed unexpectedly and
   is being restarted (crash #1)`. The new runtime processes bind random entry ports. Nothing
   listens on the public port after the restart, so every later request gets `ECONNREFUSED`.
   The debug log stops at `RUNTIME WEBSOCKET CLOSED 1006` and does not record the crash.

Attempt 3 matches outcome 1. Its case `q-sep-41-token-interface` received HTTP 200 for turn 4 at
`07:02:39.559Z`. Turn 5 got the miniflare `Network connection lost.` text above. Turns 6 to 11
got `connect ECONNREFUSED 127.0.0.1:8791`. The turn 5 request alone does not stop a server: it
fails argument validation in 6 ms (`evidence/run1/trigger.jsonl`).

## Runs

All runs used a detached worktree of `90d0ba75`, `npm ci`, the main checkout's `.dev.vars`, port
8797, and [`start-server.sh`](start-server.sh). One server ran at a time.

| run | Wrangler / workerd | load | outcome |
|---|---|---|---|
| 1 soak | 4.120.1 / 1.20260804.1 | replay, 12:39:57Z–15:51:52Z | 2,268 requests, 0 network errors, no stop in 3 h 15 min |
| 1 check | same server | sweep 4,900–5,100 ms gaps, 2 ms step | gap 48 (4,994 ms) got HTTP 500 `Network connection lost.`; empty `[ERROR]`; exit code 1 at 15:56:04Z, uptime 3 h 19 min 38 s |
| 2 | 4.149.0 / 1.20261006.1 | same sweep | runtime crash at 16:00:52Z; gap 4,990 ms got `ECONNREFUSED`; port 8797 stayed closed until stopped |
| 3 | 4.149.0 / 1.20261006.1 | same sweep, repeat | runtime crash at 16:07:01Z; five later requests got `ECONNREFUSED` |
| 4a control | 4.120.1 / 1.20260804.1 | 120 requests, fixed 3,000 ms gap | 0 failures |
| 4b control | same server | sweep from 4,980 ms, 1 ms step | runtime crash after the 4,981 ms request; `ECONNREFUSED` from 4,982 ms on |

Run 4 separates the trigger from time and request count. A fixed 3,000 ms gap never failed. A
gap near 4.98 s to 5.00 s failed within 15 s.

The 1 s process watcher (`evidence/*/watch.jsonl`) saw all seven run 1 processes leave at the same
check. In runs 2 to 4, one or two runtime `workerd` processes left, and Wrangler started two new
ones.

## Rate in natural traffic

The local Wrangler debug logs hold 28,261 MCP requests on Wrangler 4.133.0 to 4.149.0. They
record outcome 1 eight times, on 4.133.0 and 4.145.0, and the server continued each time. That
is about one event per 3,500 requests. A baseline arm sends about 1,090 requests, so one arm on
4.120.1 has about a 27% chance to stop. No log shows outcome 2 in natural traffic, but the debug
log cannot record it. The soak replay did not hit either outcome in 2,268 requests, which is
consistent with this rate.

## Resource trend (run 1)

Full per-minute table: [evidence/run1-per-minute.md](evidence/run1-per-minute.md). Every 15 min:

| min | Wrangler CLI RSS MB | proxy workerd RSS MB | user workerd RSS MB | user workerd CPU s/min | user workerd open files | requests |
|---|---|---|---|---|---|---|
| 0 | 340 | 48 | - | - | - | 0 |
| 30 | 195 | 79 | 157 | 0.15 | 55 | 291 |
| 60 | 162 | 101 | 167 | 0.14 | 54 | 675 |
| 90 | 164 | 139 | 200 | 0.12 | 54 | 1,021 |
| 120 | 168 | 164 | 215 | 0.11 | 52 | 1,370 |
| 150 | 168 | 199 | 231 | 0.17 | 53 | 1,736 |
| 180 | 167 | 220 | 244 | 0.22 | 57 | 2,066 |
| 195 | 167 | 234 | 276 | 0.21 | 54 | 2,263 |

The proxy `workerd` grew about 1 MB per minute, and the user `workerd` grew about 0.7 MB per
minute. Open files and CPU stayed flat. Nothing approached a limit. The pooled proxy-to-runtime
connection was replaced 1,227 times, almost once per request burst. Tool-call latency was p50
33 ms, p95 1,381 ms, and maximum 21,260 ms. The 24 `tool-error` results are recorded calls that
also failed in the original runs (16 of 666 in attempt 3).

## The token and remote AI hypothesis

The cf OAuth token lives 1 h. The remote proxy session for `env.AI` refreshes its preview token
every 50 min (`PREVIEW_TOKEN_REFRESH_INTERVAL`). That session runs its own `DevEnv`. After
startup, its only `error` listener logs at debug level, and its internal logger drops debug
output. A failed refresh therefore cannot stop the server. The soak passed the token expiry
(13:36:24Z) and the refreshes at about 13:26Z, 14:16Z, and 15:06Z with no stop. A failed refresh
can still break `env.AI` without a message. Only `src/demo/chat.ts` uses it, and QA does not.
This lane did not call it, because that is a model call.

## Recommendation for the next paired attempt

Each option below needs the owner's decision. Each changes the launch, so the plan must be
assembled and signed again. No measurement contract file changed in this lane.

1. **Upgrade the baseline server to the candidate's Wrangler 4.149.0 (recommended).** The launch
   installs `wrangler@4.149.0` in the baseline server worktree after `npm ci`. The source,
   `wrangler.jsonc`, and bound surface stay the same: run 2 matched the pin
   `6cf5d1cdd3cd16c6b8bdb09a45917755cffaf0781f321734d7c9f7649a71d238`. The treatment changes:
   the baseline arm runs on workerd 1.20261006.1, miniflare 5.20261006.1-alpha, and esbuild 0.28.2
   instead of 1.20260804.1, 5.20260804.0-alpha, and 0.28.1. The local dev runtime then leaves the
   measured difference, which production does not run anyway. Outcome 1 then fails one tool call
   in either arm instead of stopping the baseline. Outcome 2 stays possible in both arms.
2. **Patch Wrangler 4.120.1 with the 4.149.0 `ProxyWorker` branch.** The runtime stays exactly
   the same, and outcome 1 becomes one failed request. The patch is a hand edit of
   `node_modules`, so the launch must apply it from a pinned file and record its hash. Outcome 2
   stays possible. Use this only if the owner wants the baseline runtime unchanged.
3. **Restart the server after a stop.** Not recommended. A restart changes the listener process,
   so the existing listener and adapter identity checks fail and the run becomes non-comparable.
   The case in flight also loses its remaining calls.
4. **Launch again with no change.** Not recommended. At about one event per 3,500 requests, the
   baseline arm stops in about one launch of four, at about $73 for each attempt.

With any option, keep this supervisor rule: stop the method when a server stops answering on its
port. Do not restart it. Both Wrangler versions can lose the public port after a runtime crash.

## Upstream follow-up (not done here)

Two Wrangler defects are worth a report to `cloudflare/workers-sdk` when the owner allows an
upstream post: the 5 s keep-alive race between the proxy and runtime `workerd` instances, and
the runtime restart that does not bind the configured port again. This lane made no upstream
post.

## Launch differences from `paired-launch.mjs`

- Port 8797 instead of 8791. No adapter on 8789: the replay sent requests to the server directly.
  The adapter only adds a source revision to `initialize` responses and proxies the rest.
- The brief named `npm run dev:eval -- --port 8797`. Revision `90d0ba75` has no `dev:eval`
  script. `start-server.sh` runs `node node_modules/wrangler/bin/wrangler.js dev --host localhost
  --port 8797` like the launcher, with stdin closed, one output file, and the paired process
  guard in `NODE_OPTIONS`.
- Each replay case opened a fresh MCP session (`initialize`, `notifications/initialized`,
  `tools/list`) and then sent its recorded calls, spread over the recorded agent window. The
  Claude CLI client is not identical: its headers and exact timing differ.
- The first replay pass on run 1 sent 32 requests, then paused for the turn 5 check
  (`evidence/run1/trigger.jsonl`), then started again at case 0 at 12:39:57Z.
- Another session started a global Wrangler on port 8787 at 15:51:16Z. It overlapped the end of
  run 1 and runs 2 to 4. It used different processes and ports.

## Files

- [`replay.mjs`](replay.mjs): reads results files and replays the recorded `search` and
  `execute` calls in order, looped until a deadline.
- [`sample.mjs`](sample.mjs): per-minute RSS, CPU time, and open files for the server process
  tree, plus replay outcome counts.
- [`watch.mjs`](watch.mjs): 1 s process liveness for the server tree.
- [`conn-watch.mjs`](conn-watch.mjs): pooled proxy-to-runtime connection changes every 2 s.
- [`trigger.mjs`](trigger.mjs): sends selected recorded calls from one case.
- [`race-sweep.mjs`](race-sweep.mjs): the targeted idle-gap check.
- [`summarize.mjs`](summarize.mjs): builds the per-minute table.
- [`start-server.sh`](start-server.sh): the server launch.
- `evidence/`: sweep and watcher records, log tails, the run 1 `ProxyController` debug entry,
  and the run 2 surface report. Raw logs stayed in `/private/tmp/claude-501/w1012/k-soak/`
  (temporary).
