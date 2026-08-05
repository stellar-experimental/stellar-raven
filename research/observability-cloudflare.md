# Cloudflare Workers observability — survey (2026-07-02)

Live-verified against developers.cloudflare.com (docs pages + changelog) and the Cloudflare
OpenAPI spec on 2026-07-02. Covers the four surfaces relevant to this worker: **Workers Logs**,
**Workers Traces**, **metrics/analytics (GraphQL)**, and the **Observability REST/query API**.
What this project has enabled is at the bottom.

## 1. Workers Logs (GA since 2025-04)

- Enabled via `observability.enabled: true` (what we've had all along). Optional finer knobs:
  `observability.logs.invocation_logs` (default true) and `observability.logs.head_sampling_rate`
  (default 1 = 100%).
- Invocation logs carry CPU time + wall time per invocation (since 2025-04).
- `upload_source_maps: true` gives readable stacks (we have this; commit e564c71 added the
  structured per-event telemetry that lands here).
- Limits: 7-day max retention, 5 billion logs/account/day, 256 KB max log size.
- Pricing (Workers Paid): 10M events/month included, then $0.60/million. **This quota is shared
  with trace spans** — see §2.

## 2. Workers Traces (open beta since 2025-11; billed since 2026-03-01)

- Enable: `observability.traces.enabled: true`, optional `observability.traces.head_sampling_rate`
  (default 1). Sampling is head-based (OTel sense): unsampled requests incur zero tracing
  overhead. Logs and traces take **independent** sampling rates.
- Today `observability.enabled: true` does NOT imply traces. Cloudflare plans to fold traces into
  that flag later behind a compatibility date bump — watch for it, since our compat date pin
  would then start controlling tracing behavior.
- **Auto-instrumented, no code changes**: outbound `fetch` (URL, method, headers, status,
  timing), handler lifecycle (fetch/scheduled/queue/etc. with trigger metadata, Ray ID, CPU/wall
  time on the root span), and bindings — KV, R2, D1, Durable Objects, Queues, Images, Email,
  rate limiting, Browser Run.
- **NOT auto-instrumented: Worker Loader / dynamic worker calls** (and service bindings are
  likewise absent from the spans-and-attributes list). For this project that means the
  `execute` sandbox isolate is a black box in the waterfall: the host-side adapter fetches it
  triggers DO appear (they're host `fetch` calls), but the isolate boundary itself — load, eval,
  run duration — does not, unless we wrap it in a custom span.
- **Custom spans** (shipped 2026-06-16): `import { tracing } from "cloudflare:workers"` (or
  `ctx.tracing`), then `tracing.enterSpan(name, async (span) => { ... })`. Nesting follows JS
  async context automatically; span auto-ends when the callback settles. `span.setAttribute(k, v)`
  and `span.isTraced` exist. Current gaps: no manual span lifetime, no bulk `setAttributes`, no
  `spanContext()` (can't extract trace/span IDs), no `setOutcome`.
- Known limitations (beta): non-I/O spans can report **0 ms** (Spectre-mitigation timer
  freezing — CPU-bound work in the sandbox will look instant); **no W3C trace-context
  propagation** to external services, so Worker traces won't join traces in Lumenloop/Scout's
  own observability even after OTel export; span attributes still being expanded.
- Pricing: each span = one observability event, sharing the Workers Logs quota/pricing
  (Paid: 10M events/month included, +$0.60/million; 7-day retention. Free plan: 200k/day,
  3-day retention). Was free during beta; **billing started 2026-03-01**.

## 3. OTel export (logs + traces + metrics) to third parties

- Workers tracing follows OTel standards; any OTLP-compatible endpoint works (Honeycomb,
  Grafana Cloud, Axiom, Sentry documented). Zero code — configured as an **observability
  destination** in the dash (Workers & Pages → Observability → Destinations) or via API.
- API: `POST /accounts/{account_id}/workers/observability/destinations` with
  `configuration: { type: "logpush", logpushDataset: "opentelemetry-traces" | "opentelemetry-logs"
  | "opentelemetry-metrics", url, headers }` (+ `skipPreflightCheck`). Batched delivery, unlike
  Tail Workers which fire per-invocation. Docs position Tail Workers as the "advanced/custom"
  path now; OTel destinations are the default answer for external sinks.

## 4. Query surface (dashboard + REST)

- **Dashboard query language** (since 2026-02): free-text + field queries in the observability
  search bar over logs *and* traces — `status = 500`, `$workers.wallTimeMs > 100`, `contains()`,
  `startsWith()`, `regex()`, `exists()`, AND/OR/NOT. Syncs bidirectionally with the Query
  Builder sidebar.
- **REST API** (`/accounts/{account_id}/workers/observability/...`):
  - `telemetry/query` (POST) — the workhorse: filters (incl. nested groups, RE2 regex),
    full-text `needle`, `calculations` (count, uniq, avg, sum, min, max, median, p01…p999,
    stddev, variance), `groupBys`, `havings`, `orderBy`, `limit` ≤ 2000, timeframe + granularity,
    views (events/calculations), `dry` mode.
  - `telemetry/keys` / `telemetry/values` (POST) — discover queryable fields and their values
    (e.g. `$metadata.service`, `$metadata.error`, our structured telemetry keys).
  - `telemetry/live-tail` + `live-tail/heartbeat` — programmatic live tail.
  - `queries` CRUD — saved queries; `shared/query` — shareable result links.
  - `usage` (GET, `from`/`to` in ms) — **event counts by dataset and service, bucketed by day,
    up to 90 days** — the thing to check for billing exposure once trace volume is real.
- Practical note: our structured per-event telemetry (e564c71) is queryable field-by-field
  through all of this — `keys`/`values` will list whatever fields the events emit.

## 5. Metrics & analytics (aggregate, pre-existing, free)

- Dashboard per-worker metrics: requests (success/error), subrequests, wall time, CPU time,
  duration (GB-s), memory percentiles (P50–P999), invocation statuses. Retention up to
  3 months (max 1-week increments). Zone-level Workers analytics: last 30 days.
- Invocation statuses ≠ HTTP status: success / clientDisconnected / scriptThrewException (1101)
  / exceededResources (1102/1027) / internalError.
- GraphQL Analytics API: dataset `workersInvocationsAdaptive` — `sum { requests, errors,
  subrequests }`, `quantiles { cpuTimeP50, cpuTimeP99 }`, `dimensions { datetime, scriptName,
  status }`; filter by `scriptName` + `datetime_geq/leq`; ≤1 month per query, data back
  3 months, limit 100/request. (Workflows have their own `workflowsAdaptiveGroups` — n/a here.)
- Metrics are aggregates and effectively free/always-on; logs/traces are per-event and billed.
  Use metrics for "is the worker healthy," logs/traces for "what happened in this request."

## What this project runs (decision, 2026-07-02)

```jsonc
"observability": {
  "enabled": true,          // Workers Logs, 100% sampling
  "traces": { "enabled": true }  // 100% sampling; revisit if usage API shows volume
}
```

- Traces earn their keep here because one `execute` call fans out through multiple host-side
  adapter fetches (Lumenloop, Stellar Light, Algolia, WorkOS) — the waterfall attributes latency
  per upstream without code changes.
- **Done (2026-07-02)**: the DynamicWorkerExecutor runs are wrapped in custom spans
  (`codemode.execute` / `codemode.spec_search` in `src/executor/run.ts`) with flat attributes
  (`code.chars`, `sandbox.ok`, `sandbox.logLines`, `sandbox.skillRead`,
  `sandbox.skillRun`, `sandbox.artifactReadCount`, `sandbox.artifactReadBytes`) — never payloads, same
  discipline as `logEvent`. The span wraps `executor.execute()` tightly so its duration = isolate
  wall time; host-side redaction/truncation stays outside (its timing is in the `execute` log
  event). Expect 0 ms readings for pure-CPU eval segments (timer freezing); the adapter I/O
  inside still measures correctly. `enterSpan` is a safe no-op when tracing is off/unsampled and
  ends the span on throw/reject, so local dev and error paths are unaffected.
- **Extended locally (2026-07-11)**: `codemode.execute` also carries bounded
  `sandbox.operationTotal`, `sandbox.operationOk`, `sandbox.operationError`,
  and `sandbox.operationSoftEmpty` counts. No user/client identifiers or
  payloads are added to spans.
- **Content policy (2026-08-05)**: Raven app logs retain operational counts,
  status, timings, exposed operation ids, and pseudonymous subject/client joins.
  Query/code/result/answer text, provider error messages, result-derived URLs,
  and content-derived hashes are not emitted. Older app events and Cloudflare's
  own request metadata remain until Workers Logs' fixed retention expires (no
  later than seven days); Raven has no selective deletion control for them.
- Not doing now: OTel export (no external sink in use), log/trace sampling <1 (traffic too low
  to matter), Logpush/Tail Workers (superseded by OTel destinations for our needs).

## Live query notes (2026-07-04)

Follow-up verification used the Cloudflare API MCP against the live account and a production
named credential without printing it.

An authenticated MCP `initialize` probe:

- `POST https://raven.stellar.buzz/mcp`
- response `200`
- response header `cf-ray: a15a1ed37fa5b049-ATL`
- indexed Cloudflare Ray/request id: `a15a1ed37fa5b049` (the dashboard/API value
  omits the `-ATL` colo suffix)

The Workers Observability API found the request after normal ingestion delay.
Querying events by:

```json
{
  "view": "events",
  "parameters": {
    "filters": [
      { "key": "$metadata.service", "operation": "eq", "type": "string", "value": "stellar-raven-codemode" },
      { "key": "$metadata.requestId", "operation": "eq", "type": "string", "value": "a15a1ed37fa5b049" }
    ]
  }
}
```

returned both:

- the app JSON log: `{ "evt": "mcp_request", "auth": "*****", "method": "POST" }`
  as `$metadata.type = "cf-worker"`;
- the platform invocation log: `POST https://raven.stellar.buzz/mcp` with
  status `200`, path `/mcp`, method `POST`, user-agent, `cf-ray`, colo, country,
  ASN, and other request metadata as `$metadata.type = "cf-worker-event"`.

The earlier unauthenticated `401` probes that did not appear in `wrangler tail`
were also present through the API. So the accurate conclusion is: Workers
Observability ingestion is working; `wrangler tail` was inconclusive for that
sample and should not be treated as the source of truth.

Traces are present too, but the id mapping is easy to get wrong:

- Workers Logs use the Cloudflare Ray ID as `$metadata.requestId` and
  `$workers.requestId`.
- OTel trace spans use their own `traceId`, `spanId`, and `faas.invocation_id`.
- The reliable log-to-trace bridge is `cloudflare.ray_id` on OTel spans, which
  matches the Ray ID visible in logs and response headers.

Useful indexed fields observed for `stellar-raven-codemode`:

- `$metadata.service`, `$metadata.requestId`, `$metadata.type`,
  `$metadata.trigger`, `$metadata.message`
- `$workers.event.rayId`, `$workers.requestId`,
  `$workers.event.request.headers.cf-ray`
- `$workers.event.request.headers.user-agent`
- `$workers.event.request.headers.mcp-protocol-version`
- `$workers.event.request.path`, `$workers.event.request.method`,
  `$workers.event.response.status`
- OTel span fields: `cloudflare.script_name`, `cloudflare.ray_id`,
  `cloudflare.colo`, `cloudflare.asn`, `http.response.status_code`,
  `url.full`, `user_agent.original`, `traceId`, `spanId`

Privacy note: platform invocation logs already index IP-bearing fields such as
`$workers.event.request.headers.cf-connecting-ip` and `x-real-ip`, plus detailed
geo/TLS metadata. Do not copy IPs or IP-derived fingerprints into app JSON logs.
For this project, app logs add semantic fields Cloudflare cannot infer on one
authoritative `mcp_request` summary: privacy-safe `subjectHash` and
`clientHash` for authenticated cross-request grouping. Child events still
join through Cloudflare request/Ray metadata and do not repeat those
identifiers. Old grants can have a null client hash, and neither IP nor other
network-derived fingerprints are used to fill the gap.

The 2026-07-11 pre-change production baseline also showed that Cloudflare
redacts the app field named `auth` to `*****`. The new request summary uses
`accessMode` so OAuth/API-key/dev/rejected classes remain queryable.

That baseline queried the six-hour window ending at Unix ms `1783818170600`
with `$metadata.service = "stellar-raven-codemode"` and
`evt = "mcp_request"`. It returned 50 app events: successful and rejected
requests had Cloudflare `$metadata.requestId` values, while none had
`subjectHash`, `clientHash`, or an app `rayId`. Ray
`a19c19fccd55dec9` joined one of those request logs to a root OTel span through
`cloudflare.ray_id`; an initialize-only request correctly had no custom
`codemode.execute` child span.
