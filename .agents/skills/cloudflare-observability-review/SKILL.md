---
name: cloudflare-observability-review
description: Investigate live Cloudflare Workers observability for stellar-raven-codemode. Use when reviewing production MCP request logs, playground/demo telemetry, traces, Ray IDs, request headers, telemetry query results, eval observability, agent-run forensics, or whether Cloudflare metadata is enough without app-level correlation IDs.
---

# Cloudflare Observability Review

Use this runbook to answer "what happened in production?" for
`stellar-raven-codemode` using Cloudflare Workers Logs, platform invocation
events, and OTel spans.

When the investigation is part of an eval round, agent-run forensic review, or other
multi-agent maintenance pass, record the query inputs, Ray IDs, and verdict in the relevant
Solo scratchpad/todo so the evidence survives outside the current context window.

## Principle

Prefer Cloudflare-native request identity for one invocation. Use the app's
privacy-safe OAuth subject/client hashes only for cross-request attribution.

Observability works without a model-facing `correlationId` contract. Same-user
concurrent MCP tasks are rare, and for debugging/evals we join requests by Ray ID,
time window, user-agent/client marker, host/path/method/status, and auth mode. If an
investigation needs stronger cross-request grouping, add privacy-safe auth
subject/client fields to app logs rather than asking models to forward ids.

## Safety Rules

- Never print secrets from `.env`, `.dev.vars`, Wrangler, Cloudflare, or MCP
  responses.
- Use Cloudflare API MCP for historical evidence. `wrangler tail` is only a
  convenience stream; a miss there is not evidence that logs are absent.
- Do not copy raw IPs, IP hashes, or IP-derived fingerprints into app logs.
  Cloudflare platform events already expose IP-bearing request headers.
- It is OK to query and use Cloudflare-native private/platform fields
  (IP-bearing headers, geo, TLS/client fingerprint fields, user-agent) inside a
  bounded investigation when they are needed to join or separate requests.
  Report them only when directly relevant; otherwise report Ray IDs, time
  windows, paths, statuses, and app event fields.
- Do not infer identity from IP/geo/TLS fields unless explicitly doing an abuse
  review with a separate privacy decision.

## What Joins Reliably

For one HTTP invocation:

- Response `cf-ray` header -> Workers Logs. Strip the colo suffix:
  `a15a1ed37fa5b049-ATL` -> `a15a1ed37fa5b049`.
- Workers app JSON logs: `$metadata.type = "cf-worker"`.
- Workers platform invocation logs: `$metadata.type = "cf-worker-event"`.
- OTel spans: `$metadata.type = "span"`, joined by `cloudflare.ray_id`.

Across a controlled eval/research run:

- Use a narrow time window.
- Use unique non-secret markers in `clientInfo.name` or user-agent when the
  harness allows it.
- Group by service, host, path, method, status, user-agent, and Ray IDs.

Across arbitrary third-party MCP traffic:

- Join one invocation through the Ray ID and Cloudflare request metadata.
- For successful OAuth requests, group across invocations by `subjectHash`
  and/or `clientHash` from the authoritative `mcp_request` summary. Child
  events join through `$metadata.requestId`; they do not repeat the hashes.
- Old grants issued before client attribution have `clientHash = null`. Never
  fill that gap from user-agent or network fields.
- Accept that rare same-user concurrency may be ambiguous.

Identity caveats:

- `subjectHash` is the same 16-hex `hashPrefix(subject)` used by playground
  and artifact events.
- `clientHash` is a 16-hex, versioned, domain-separated HMAC of the OAuth
  client id. The raw client id lives only in encrypted grant props.
- Rotating `MCP_SERVER_SECRET` creates a temporary split: old grants retain
  old props while new grants derive new user/client hashes. Demo cookies
  rotate too.
- A wrong admin bearer token intentionally falls through to the provider and
  appears as `accessMode = "oauth-rejected"`; do not derive identity from
  rejected credentials.
- OAuth-provider `OPTIONS /mcp` preflights emit no `mcp_request` app event.

## Live Probe

Generate a known request when needed. Load the production admin token without
echoing it:

```sh
set -a; . ./.env; set +a
MARK="raven-live-telemetry-$(date +%s)"
BODY=$(node -e 'const m=process.argv[1]; console.log(JSON.stringify({
  jsonrpc:"2.0", id:0, method:"initialize",
  params:{protocolVersion:"2025-06-18", capabilities:{},
  clientInfo:{name:m, version:"0.0.0"}}
}))' "$MARK")
curl -i -sS https://raven.stellar.org/mcp \
  -H "Authorization: Bearer $MCP_ADMIN_TOKEN_PRODUCTION" \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  --data "$BODY" |
  awk 'BEGIN{IGNORECASE=1} /^HTTP\//{print} /^cf-ray:/{print} /^content-type:/{print} /^mcp-session-id:/{print}'
```

Wait 30-90 seconds for ingestion before querying.

## Query Workflow

1. Discover fields if needed with Cloudflare API MCP
   `/workers/observability/telemetry/keys`.
2. Query recent events with filters:

```json
[
  { "key": "$metadata.service", "operation": "eq", "type": "string", "value": "stellar-raven-codemode" },
  { "key": "$metadata.requestId", "operation": "eq", "type": "string", "value": "<ray-without-colo>" }
]
```

3. If looking for traces, query OTel/span events by:

```json
[
  { "key": "cloudflare.script_name", "operation": "eq", "type": "string", "value": "stellar-raven-codemode" },
  { "key": "cloudflare.ray_id", "operation": "eq", "type": "string", "value": "<ray-without-colo>" }
]
```

4. For broader reviews, group counts by `$metadata.type`,
   `$workers.event.request.path`, `$workers.event.response.status`,
   `$workers.event.request.headers.user-agent`, or `cloudflare.ray_id`.
5. For cross-request OAuth review, filter app events to
   `evt = "mcp_request"`, then group by `subjectHash` or `clientHash`. Use
   each matching event's `$metadata.requestId`/`rayId` to join child tool/op
   events and spans. A null client hash means a pre-attribution grant, not an
   anonymous user.

## Skill Retrieval (`skill_read`)

Skill bodies are fetched from their pinned upstream at read time, not bundled
(`ARCHITECTURE.md` §6). `evt = "skill_read"` is the only view of that path.

- **Latency profile:** group `ms` by `from` (`memo` | `cache` | `upstream`).
  Always split by `from` — a memo hit and an upstream fetch differ by orders of
  magnitude, so a mean over both is meaningless.
- **Availability:** `evt = "skill_read"` with `outcome = "error"`, grouped by
  canonical `id` and `from`.
  This is the accepted-risk dependency on raw.githubusercontent.com made
  observable; a rising `could not fetch` rate is the early signal from REAL
  traffic.
- **Availability, synthetic:** `evt = "skill_canary"` — the hourly cron
  (`src/skills/canary.ts`) that fetches every pinned file with the caches
  bypassed. This is the only detector for a Cloudflare-side egress failure, and
  the only one that works with zero user traffic. Query it when `skill_read`
  is silent: silence there means "nobody asked", never "everything is fine".
  Two joint readings worth knowing:
  - `skill_canary ok=false` while `check-mirrors --fetch` is green in CI →
    the content is fine and *our access to it* is broken. Cloudflare/network,
    not upstream.
  - No `skill_canary` events at all → the cron is not firing. The detector is
    down, which reads identically to healthy unless you check. `refresh.yml`
    treats a verdict older than 3h as a failure for exactly this reason.
- **Does anyone read sections?** group by `shape` (`whole` | `sections` |
  `files` | `mixed`). Feeds the open question in
  `ideas/skill-discovery-without-bundling.md` — if `whole` dominates, 204
  section catalog entries are dead weight.
- **Which skills are actually used?** group by `id`; a long never-read tail is
  evidence for shrinking the read surface.
- `retrievals` counts distinct pinned files a call fetched (a `##` section read
  costs 1; N companion files cost N+1). Fields carry no body text and no caller
  identity — the id is a public catalog id.
- First reading (2026-07-30): upstream 61-80 ms, memo 0 ms.

**A NEW field VALUE is not filterable immediately.** Filtering
`evt = "skill_read"` returned zero for ~20 minutes after the first one was ever
emitted, while the events were demonstrably present — joining by
`$metadata.requestId` showed `skill_read` sitting right next to the `execute`
line it belonged to. The filter index lags first appearance. This is a sharper
version of the Field Map warning below: when a filter returns zero for something
you have good reason to believe exists, do not conclude it is missing. Query
broadly (service filter only) and filter client-side, or join by
`$metadata.requestId` from an event you CAN find. Costs one query instead of an
afternoon of debugging a working emitter.

## Demo Playground Failures

For `/playground/chat` screenshots or user-visible tool cards, do not start only
from the screenshot timestamp. The screenshot may be captured after the failing
turn, or from a local browser that is replaying retained UI state. First search
a wide recent window (usually 10 hours, or the user's stated window) for app
events:

- `evt = "demo-execute"` grouped by `ok` and `evidenceOutcome`.
- `evt = "demo-chat"` with `executeFailures > 0`, grouped by
  `executeFailures`, `finishReason`, and Ray/request ID.
- Span view for `codemode.execute`, grouped by `$metadata.message` and
  `sandbox.ok`, to separate model-code failures from sandbox/runtime failures.

Then join each failing request by `$metadata.requestId`:

- `demo-search`: query size, requested/effective limits, hit/total/omitted counts,
  gated/backfill counts, truncation, and top ids.
- `demo-execute`: `ok`, `evidenceOutcome`, `codeChars`, truncation/count fields, `ms`.
- `op`: operation ids/outcomes/timings inside the execute attempt.
- `demo-chat`: `searchCalls`, `executeCalls`, `executeFailures`,
  `finishReason`, `budgetExhausted`, and `finalNeededButMissing`.
- `cf-worker-event`: path/method/status/user-agent and, when needed, the
  Cloudflare private/platform fields used to disambiguate same-user traffic.

`demo-chat-start` records only message counts/sizes and subject correlation:

- `evt = "demo-chat-start"` grouped by `$metadata.requestId`, `model`,
  `openAiApiMode`, `reasoningEffort`, `auth`, `historyMessages`, and
  `userMessages`.
- `latestUserChars`, `historyChars`: sizing clues for truncation/body issues.
- `subjectHash`: privacy-safe per-demo-session join key; do not infer real
  identity from it.

Question, code, result, answer, and provider-error content is intentionally not
logged. When wording matters, use user-supplied screenshots/text and mark any
inference from counts, operation ids, timestamps, and Ray IDs as best-effort.

Common diagnosis patterns:

- `object is not iterable (cannot read property Symbol(Symbol.iterator))` with
  code containing `Promise.all({ ... })` is model-authored JavaScript, not an
  upstream service outage. The retry should rewrite to
  `Promise.all([callA, callB])`.
- `Execution timed out` after successful `op` lines usually means the model
  wrote a slow/broad script or hit the sandbox's 60s wall-clock cap. Check
  `codeChars`, broad list limits, and operation timings before blaming a
  service.
- `demo-chat` can still finish with an answer after failed executes; inspect
  `executeFailures`, not only `finishReason`.

## Field Map

Cloudflare's query/filter keyspace flattens app JSON log fields. If a returned
event object displays app data under `source.evt`, filter and group by `evt` unless
the keys endpoint shows the `source.*` variant
for that dataset. A query using `source.evt = "demo-search"` can miss events
that `evt = "demo-search"` finds.

High-value fields:

- MCP request summary: `accessMode`, `subjectHash`, `clientHash`, `requestId`,
  `rayId`, `method`, `status`. Successful requests include identity keys
  (null outside attributed OAuth); rejected events omit them entirely.
- The older `auth` app field is redacted to `*****` by Cloudflare and is not
  useful for grouping; the `/mcp` summary deliberately uses `accessMode`.
- Browser auth-flow rejections: `evt = "auth_reject"` with `status` and
  `reason`. Emitted from the single `text()` helper in `src/auth/workos.ts`,
  so it covers every `/authorize` and `/callback` refusal. `reason` is the
  constant response body — group by it, because the platform event alone is
  the same `POST /authorize -> 400` line for a `CSRF token mismatch`, a
  `Terms acknowledgement required`, and an `Invalid authorization request`.
  `/callback` splits the same way into `Invalid or expired state`,
  `Invalid login state`, and `State binding mismatch`. No identity fields: a
  rejected flow has no attributed subject, and the rejected credential must
  never be hashed. Token-exchange failures inside
  `@cloudflare/workers-oauth-provider` (`/token`, `/register`) stay opaque —
  status and path only.
- App JSON logs: `evt`, `queryChars`,
  `requestedLimit`, `effectiveLimit`, `omittedCount`, `gatedHits`, `backfillHits`,
  `hits`, `total`, `truncated`, `top`,
  `ok`, `evidenceOutcome`, `codeChars`, result/log truncation fields,
  `latestUserChars`, `historyChars`,
  `historyMessages`, `userMessages`, `subjectHash`, `auth`, `model`,
  `openAiApiMode`, `reasoningEffort`

- `$metadata.service`, `$metadata.requestId`, `$metadata.type`,
  `$metadata.trigger`, `$metadata.message`
- `$workers.event.rayId`, `$workers.requestId`,
  `$workers.event.request.headers.cf-ray`
- `$workers.event.request.headers.user-agent`
- `$workers.event.request.headers.mcp-protocol-version`
- `$workers.event.request.path`, `$workers.event.request.method`,
  `$workers.event.response.status`
- OTel: `cloudflare.script_name`, `cloudflare.ray_id`, `cloudflare.colo`,
  `cloudflare.asn`, `http.response.status_code`, `url.full`,
  `user_agent.original`, `traceId`, `spanId`

`omittedCount` is `total - hits` for the scorer
tiers consulted by that page; like `total`, it is a floor rather than an
exhaustive missed-result count. A null `effectiveLimit` means validation or a
refusal prevented the search page from running.

Privacy-sensitive fields already present in platform logs:

- `$workers.event.request.headers.cf-connecting-ip`
- `$workers.event.request.headers.x-real-ip`
- precise geo, TLS, and client-fingerprint-like metadata

## Measurement Traps

Each of these produced a confidently wrong conclusion in a real investigation
(2026-07-27 production health review). They are silent: the query succeeds, the
number looks plausible, and nothing signals the error.

- **Do not sum request counts without filtering `$metadata.type`.** App JSON log
  rows (`cf-worker`) inherit their invocation's status, so grouping every row by
  `$workers.event.response.status` counts logging volume, not requests. A 7-day
  total of ~36k collapsed to ~15k once filtered to `cf-worker-event`. Filter to
  the invocation type before quoting any request total or rate.
- **`search`/`demo-search` `truncated` is catalog pagination, not byte
  truncation.** It means `total > hits.length` — more catalog entries matched
  than the page returned (`src/catalog/search.ts`). It says nothing about the
  model-boundary byte cut. A "94% truncated" figure read this way is a category
  error and cannot justify any payload-size conclusion. Execute-result byte
  truncation is `demo-execute.resultTruncated` / the `--- SOURCE BASIS ---`
  block.
- **`recoveryAdviceDelivered` is a host delivery latch, not model compliance.**
  It is set when the checkpoint becomes visible in the tool result, not when the
  model acts on it. Never infer model behavior from it. (Renamed from
  `recoveryAdviceConsumed` for exactly this reason.)
- **`evidenceState` on a `demo-step` is per-step.** The final answering step
  makes no tool calls, so `evidenceState: "none"` there is structural and does
  NOT mean the turn lacked evidence — earlier steps hold it.
- **`sourceBasis` (and its `canonicalUrlCount`) exists only on truncated
  execute results.** It is computed from the full pre-truncation value, so a
  zero count can never demonstrate that truncation dropped something.
- **A single wide-window `view: "events"` query returns a tiny, unrepresentative
  slice — it is NOT "all the matching events under `limit`."** Measured
  2026-08-06 on the same filter (`cf-worker-event`, `path = /authorize`,
  `limit: 500`): one flat 7-day query returned **4** events; the identical
  filter run over twenty-eight consecutive 6-hour windows returned **416**. Not
  a 10x ABR ratio — roughly 100x, and the 4 survivors looked like a plausible
  complete set, which is what makes this lethal. A returned count far below
  `limit` is therefore NOT evidence that few events matched. Slice any window
  wider than ~6h and sum, and never conclude "this never happens" from a flat
  multi-day query. This trap produced a confidently wrong "zero POST /authorize
  in the retention window" — the real number was 173, of which 31 were the
  failure being investigated.
- **ABR sampling is not an iid sample of the filtered set.** `abr_level` is 1
  for windows of about 12h or less and 10 for wider ones; concatenating windows
  at different levels biases any ratio computed across them. Query in equal,
  narrow windows when a ratio matters, and report the level observed.
- **Check the shape before matching.** `rows[].transcript` is an array of
  objects; `transcript.includes("...")` is element equality and always returns
  false. `verdict` is an object whose label is `verdict.score`, so comparing
  verdicts directly compares object identity and reports 100% change. Both
  mistakes fail silently and look like findings.
- **The AI Gateway replays completions, so repeats are not samples.** The demo
  gateway carries `cache_ttl: 300`; within that window an identical request
  returns the recorded completion. It is invisible from inside the Worker — same
  frames, same telemetry, no marker — and gateway logs will not settle it either,
  because the demo sets `collectLog: false`. The tell is arithmetic: a repeat
  that returns byte-identical answer text at a latency no inference could
  produce. Measured 2026-08-06 before the fix: a 3-step agentic turn replayed
  4567 identical chars in 1041 ms, a one-step turn in 129 ms. `demoModelSettings`
  now sends `cf-aig-skip-cache: true` on every demo request, so repeats are
  independent again — but any run predating that, and any NEW measured surface
  that talks to a gateway, needs the header or the same trap returns. Compare
  repeat latency AND output length before trusting a p50.

## Decision Heuristic

- Request-level debugging: Ray ID is enough.
- Controlled eval/research review: Ray ID plus time window and unique marker is
  enough.
- Ordinary user support: Ray ID plus auth mode, user-agent, host/path/status,
  and nearby events is usually enough.
- Multi-request attribution by authenticated user/client: use the existing
  request-summary `subjectHash`/`clientHash`; do not infer missing attribution
  from platform fingerprint fields.
- Exact separation of rare same-user concurrent tasks: accept ambiguity unless
  there is evidence it matters enough to add a new app-level mechanism.

Do not reintroduce a model-forwarded correlation id unless production evidence
shows Cloudflare/auth observability fails for common investigations.

## Report Shape

End with:

- Query inputs: timeframe, filters, Ray IDs, datasets/views.
- Joined evidence: app JSON logs, platform events, spans.
- Gaps: ingestion delay, missing auth subject/client, no session header, etc.
- Privacy notes: IP-bearing or fingerprint-like fields observed.
- Recommendation: Cloudflare-only, add auth subject/client fields, or change
  service code/docs.
