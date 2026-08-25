# Observability R2 Retention Plan

Status: research note only. Do not build this until a real investigation needs history beyond the
current Workers Logs window.

Verified: 2026-07-07 against the current repo and current Cloudflare docs.

## Current state

The production worker already emits useful structured observability. `src/observability.ts` is a
thin helper: `logEvent(evt, fields)` writes one flat JSON object to `console.log`. The file's
discipline is explicit: flat, small fields, and never a secret value, a query, execute code, a
result, an answer, or a provider error message; adapter results are expected to be redacted
before logging. It also documents the split between logs for facts and trace spans for timing
attribution (`src/observability.ts:1-36`).

Call sites currently emit:

- `mcp_request` with auth mode and request method/status for admin, local dev bypass, and OAuth MCP
  traffic (`src/server.ts:132-164`).
- `search` from the top-level tool with query, filters, hit counts, top hit ids, response chars,
  truncation, and duration (`src/mcp/tools.ts:252-293`).
- `execute_unavailable` and `execute`, including ok/error state, duration, code length/code preview,
  result sizing/truncation fields, log/error truncation, and error preview
  (`src/mcp/tools.ts:297-348` and following fields in the same object).
- `op` for each host-side service operation outcome and duration (`src/executor/providers.ts:249-263`).
- `skill_run` and `skill_run_schema_mismatch` for runnable skill outcomes, call counts, soft-empty
  counts, and schema issues (`src/skills/run.ts:229-239`, `src/skills/run.ts:363-368`).

`wrangler.jsonc` enables Workers Logs and traces in production:

- `observability.enabled: true` (`wrangler.jsonc:80-81`).
- `observability.traces.enabled: true` with the repo comment that traces are still open beta,
  host-side fetches and handler spans are auto-instrumented, Worker Loader isolates are not, and
  the execute boundary is covered by a custom `tracing.enterSpan` span (`wrangler.jsonc:82-86`).
- `upload_source_maps: true`, so production errors should be readable in Workers Logs
  (`wrangler.jsonc:84-86`).

The Worker Loader caveat is code-verified. `src/executor/run.ts` wraps DynamicWorkerExecutor runs in
custom spans named `codemode.execute` and `codemode.spec_search`, with attributes such as
`code.chars`, `sandbox.ok`, `sandbox.logLines`, `sandbox.skillRead`, and `sandbox.skillRun`
(`src/executor/run.ts:132-144`). Cloudflare's current spans-and-attributes docs say Workers tracing
provides automatic instrumentation "out of the box" and list supported span categories such as
Runtime API, handlers, D1, Browser Run, KV, R2, Durable Objects, Images, Email, Queues, and rate
limiting; Dynamic Worker Loader is not in that supported list. See:

- https://developers.cloudflare.com/workers/observability/traces/spans-and-attributes/ (last updated
  Jun 10, 2026; checked 2026-07-07). The supported category list appears in the page nav and the
  page says automatic tracing requires no code changes.
- https://developers.cloudflare.com/workers/observability/traces/custom-spans/ (checked
  2026-07-07). `tracing.enterSpan()` wraps code in a named span, auto-ends when the callback
  settles, supports `span.setAttribute`, and exposes `span.isTraced`.

Workers Logs retention remains days-scale, not archival. Current Cloudflare Workers Logs docs
checked 2026-07-07 say:

- Maximum log retention period: 7 days.
- Free plan: 200,000 log events/day, 3-day retention.
- Paid plan: 20M included log events/month, then $0.60/million, 7-day retention.
- Maximum log size: 256 KB; max logs/account/day: 5B.

Source: https://developers.cloudflare.com/workers/observability/logs/workers-logs/ (last updated
Jun 9, 2026; checked 2026-07-07).

Traces are still documented as beta. Current Cloudflare docs checked 2026-07-07 say the known
limitations page covers Workers tracing while it is "currently in open beta", and note limitations
that matter here: non-I/O spans may report `0 ms`, external trace IDs are not propagated to
non-Cloudflare services yet, and span/attribute names may change during beta. The traces pricing
section still says billing starts March 1, 2026, each span is one observability event, and traces
share Workers Logs quota/pricing, but that page currently lists Paid as 10M included events/month
while the Workers Logs page now lists 20M included log events/month. Treat that as Cloudflare doc
drift/inconsistency and confirm in the dashboard/API before using exact included-event math in a
budget decision.

Sources:

- https://developers.cloudflare.com/workers/observability/traces/ (last updated Jun 16, 2026;
  checked 2026-07-07).
- https://developers.cloudflare.com/workers/observability/traces/known-limitations/ (last updated
  Jun 16, 2026; checked 2026-07-07).

The `cloudflare-observability-review` skill currently assumes Cloudflare-native joins, not
app-issued correlation ids:

- For a single HTTP invocation, it joins response `cf-ray` (without the colo suffix), Workers app
  JSON logs (`$metadata.type = "cf-worker"`), Workers platform invocation logs
  (`$metadata.type = "cf-worker-event"`), and OTel spans (`$metadata.type = "span"`) by
  `cloudflare.ray_id` (`.agents/skills/cloudflare-observability-review/SKILL.md:33-42`).
- For controlled eval/research runs, it uses narrow time windows plus unique non-secret markers in
  `clientInfo.name` or user agent where the harness allows it, then groups by service, host, path,
  method, status, user-agent, and Ray IDs (`.agents/skills/cloudflare-observability-review/SKILL.md:43-49`).
- It queries recent Workers telemetry with filters on `$metadata.service =
  "stellar-raven-codemode"` and `$metadata.requestId = <ray-without-colo>`, and traces with
  `cloudflare.script_name = "stellar-raven-codemode"` plus `cloudflare.ray_id =
  <ray-without-colo>` (`.agents/skills/cloudflare-observability-review/SKILL.md:79-103`).
- It deliberately avoids copying IPs/fingerprints into app logs because platform events already
  carry IP-bearing request headers and detailed geo/TLS metadata
  (`.agents/skills/cloudflare-observability-review/SKILL.md:22-31`,
  `.agents/skills/cloudflare-observability-review/SKILL.md:121-125`).

Eval runs already have their own evidence path. `eval/EVALS.md` says results are local-only evidence
under `eval/**/results/`, gitignored, with READMEs carrying the committed record and exact result
stamp. It explicitly allows pruning old local result files while keeping any stamp still referenced
by `eval/gates.json` or a committed README record (`eval/EVALS.md:62-65`). QA lanes write
`eval/qa/results/<stamp>-variant<X>.json` with `meta`, `summary`, `rows`, answers, transcripts,
agents, verdicts, and durations (`eval/qa/README.md:191-193`). `eval/README.md` also records that
QA results live in `eval/qa/results/` and routing runs in `eval/results/`, both gitignored/local-only
(`eval/README.md:673-678`).

Residual from todo 808 comment 2203: `eval/gates.json` still points at a machine-local routing
baseline file. The current `baselineResults` value is
`routing-2026-07-04T15-58-31-434Z.json` (`eval/gates.json:1-8`). The earlier full audit called this
accepted-by-design but noted that re-baselining on another machine loses the evidence file unless
that cited result is also preserved somewhere (`research/audits/2026-07-03-full-audit.md:171-179`).
If we build an R2 observability sink, it should also park gate-baseline evidence objects.

## Proposed R2 extension

Add a Cloudflare Logpush job that exports the Workers trace events dataset to R2, filtered to this
worker. Cloudflare's current Workers Logpush docs checked 2026-07-07 say Workers Trace Events
Logpush includes request/response metadata, unstructured `console.log()` messages, and uncaught
exceptions; it is available on Workers Paid; the example sends the `workers_trace_events` dataset
to an R2 destination with fields including `Event`, `EventTimestampMs`, `Outcome`, `Exceptions`,
`Logs`, and `ScriptName`; Logpush supports filters and sampling; and Workers can opt into Logpush
with `logpush: true` in Wrangler. Source:
https://developers.cloudflare.com/workers/observability/logs/logpush/ (last updated Apr 23, 2026;
checked 2026-07-07).

Recommended shape:

- Bucket: create a separate private bucket, e.g. `stellar-raven-observability`, instead of reusing
  `stellar-raven-artifacts`.
- Prefixes:
  - `workers-trace-events/dt=YYYY-MM-DD/` for Logpush objects.
  - `eval-gates/baselines/` for copied `eval/results/routing-*.json` files referenced by
    `eval/gates.json`.
  - `eval-qa/results/` only if we later decide QA result history needs cross-machine retention; it
    is not necessary for the initial trigger because READMEs already carry result stamps.
- Logpush filter: keep only `ScriptName == "stellar-raven-codemode"` (or the exact field/operator
  Cloudflare's Logpush filter API exposes for this dataset). Use the dashboard-created filter first
  if the API field spelling is ambiguous, then codify the job once verified.
- Fields: include at least `EventTimestampMs`, `ScriptName`, `Outcome`, `Event`, `Logs`,
  `Exceptions`, and Ray/request metadata if available in the dataset output. Do not export more
  platform fields than the review skill needs, especially IP-bearing headers, unless an abuse-review
  use case explicitly requires them.
- Lifecycle: default expire after 90 days. If the real use case is only "eval/debug across a couple
  of release cycles", start at 30 days. Add a separate longer rule only for
  `eval-gates/baselines/` if gate-baseline reproducibility becomes the trigger. Cloudflare R2 object
  lifecycle docs checked 2026-07-07 support rules to delete objects after an age/date and transition
  objects to Infrequent Access after 30 days; deletion usually occurs within 24 hours of the
  expiration value. Source: https://developers.cloudflare.com/r2/buckets/object-lifecycles/ (last
  updated Apr 21, 2026; checked 2026-07-07).

Why a separate bucket: observability archives have different risk and lifecycle than ordinary
artifacts. They can contain request metadata, user-agent/client markers, model-authored code/query
previews, and platform metadata. A separate bucket makes it harder to accidentally publish or share
logs while giving the retention policy and access review a single purpose. If this round's
`stellar-raven-artifacts` bucket is already being added, reusing it with a locked
`observability/` prefix is an acceptable temporary shortcut only if the bucket is private,
non-public, has prefix-specific lifecycle rules, and the R2 access credentials used by Logpush cannot
be reused broadly by CI or humans for unrelated artifacts. The clean recommendation is still a
separate bucket.

## Query flow over archived objects

The existing skill/flow should stay unchanged for data still inside the Workers Logs/Traces window.
`cloudflare-observability-review` should continue to use the Cloudflare Observability telemetry API
first because that gives indexed search, field discovery, grouping, and live trace joins.

For older history, add an archive fallback script or runbook section:

1. Determine the time window and identifiers exactly as today: Ray ID, unique eval marker,
   user-agent/client marker, host/path/status, and auth mode.
2. List R2 objects under date partitions covering that window.
3. Stream/download only those objects.
4. Use `jq` or a small Node script to parse JSON lines or JSON arrays, depending on Logpush output
   options, and filter for:
   - `ScriptName == "stellar-raven-codemode"`;
   - Ray/request id where present;
   - `Logs[].message` JSON where `evt` matches `mcp_request`, `search`, `execute`, `op`, or
     `skill_run`;
   - eval marker in `clientInfo.name`, user agent, or logged query/code preview;
   - path/method/status from platform event fields.
5. Reconstruct the same report shape as the skill already uses: query inputs, joined evidence, gaps,
   privacy notes, and recommendation.

The important constraint: this should be a storage/query fallback, not a new observability contract.
Do not add model-forwarded correlation ids just to make R2 easier to query. The current joins are Ray
ID, time window, marker, path/method/status, user-agent, and auth mode. If real evidence shows
multi-request attribution by authenticated user/client is needed, add privacy-safe auth subject/client
fields to app logs as the existing skill already recommends.

## Cost sketch

At current traffic, R2 storage should round to near-zero and likely stay inside R2's free tier if we
retain 30-90 days. Cloudflare R2 pricing docs checked 2026-07-07 list:

- Standard storage: $0.015/GB-month.
- Free Standard tier: 10 GB-month/month, 1M Class A operations/month, 10M Class B operations/month.
- Class A operations: $4.50/million; Class B operations: $0.36/million.
- Egress from R2 is free.

Source: https://developers.cloudflare.com/r2/pricing/ (last updated May 28, 2026; checked
2026-07-07).

Use Standard storage first. Infrequent Access is not attractive for tiny/debug-heavy observability
objects because it has a 30-day minimum storage duration, higher operation prices, and retrieval
fees. If volume ever grows, revisit sampling before storage class changes: Workers Logs and traces
already support independent head sampling, and traces are the higher event multiplier.

## What stays the same

- Existing production app logging and trace span code stays unchanged.
- `cloudflare-observability-review` keeps using the Cloudflare API MCP/telemetry API for recent
  history, Ray IDs, `$metadata.service`, `$metadata.requestId`, and `cloudflare.ray_id`.
- Live evals against observability endpoints keep their current markers, time-window discipline, and
  report shape.
- Eval result files remain local-only evidence by default; READMEs remain the committed durable
  record.
- Secrets remain host-side; no secret values go into logs, R2 object names, Solo comments, or repo
  files.
- `wrangler tail` remains a convenience stream only, not evidence of absence.

## Trigger conditions

Do not build this now. Todo 808's discipline still holds: no demonstrated need for session history
beyond the Workers Logs retention window has appeared. The current system has already debugged
same-day deploys within the Workers Logs window, and evals persist their own local result files plus
README records.

Build the R2 sink only if at least one of these becomes true:

- An eval, production incident, abuse review, or agent-run forensic question needs request/log/trace
  evidence older than 7 days.
- Re-baselining becomes meaningfully multi-machine and `eval/gates.json` baseline evidence needs to
  be recoverable without relying on one developer's local `eval/results/` directory.
- A recurring weekly/monthly observability report needs raw per-request evidence rather than
  aggregate Worker metrics.
- Cloudflare reduces Workers Logs retention or makes dashboard/API retrieval unreliable for the
  current review flow.
- A compliance/privacy decision explicitly asks for a bounded retention archive with a documented
  lifecycle rather than ad hoc local files.

## Staged implementation

Stage 0, no build:

- Keep this file as the escalation plan.
- Update todo 808 only with doc drift and trigger status.

Stage 1, one-day prototype when triggered:

- Create private R2 bucket `stellar-raven-observability`.
- Add a 30-day or 90-day lifecycle rule, plus a separate longer prefix rule only if preserving
  gate-baseline evidence is part of the trigger.
- Create a Workers Trace Events Logpush job to R2, filtered to `stellar-raven-codemode`.
- Enable `logpush: true` for the Worker if required by the chosen Logpush setup.
- Run one production probe and verify the object contains the expected app JSON log,
  platform invocation record, and fields needed by the skill.

Stage 2, query fallback:

- Add a small local script or documented command sequence that lists date-partitioned R2 objects,
  streams them through `jq`/Node, and reproduces the skill's query/report shape.
- Add a short section to `.agents/skills/cloudflare-observability-review/SKILL.md` for "archive
  fallback after Workers Logs retention" without changing its recent-history workflow.
- Add a tiny fixture test using one scrubbed Logpush object sample, if a parser script is added.

Stage 3, gate-baseline evidence:

- When `eval/gates.json` changes, copy the referenced `eval/results/routing-*.json` to
  `r2://stellar-raven-observability/eval-gates/baselines/<stamp>.json`.
- Record the R2 object key in the re-baseline note or adjacent README entry, not in model-facing
  output.
- Keep local-only eval result policy unchanged for ordinary, non-baseline runs.

Effort estimate:

- Plan-only: done in this file.
- Minimal Logpush/R2 sink: 0.5-1 day, mostly Cloudflare dashboard/API setup and verification.
- Archive query fallback script plus skill update: 0.5-1 day.
- Gate-baseline upload convention: 0.25-0.5 day if manual, 1 day if wired into eval tooling with
  checks.

## Doc drift found on 2026-07-07

- `research/observability-cloudflare.md` says Workers Paid includes 10M observability events/month.
  Current Workers Logs docs now say Workers Paid includes 20M log events/month, then $0.60/million.
- Current Traces docs still say spans share Workers Logs quota/pricing but list Paid as 10M included
  events/month. That conflicts with the Workers Logs page. Treat exact included-event counts as
  unsettled until verified from Cloudflare billing/dashboard or account API.
- The trace beta/limitation points in the July 2 research doc still match current docs: open beta,
  possible `0 ms` for non-I/O spans, no external trace-context propagation yet, and span/attribute
  names may change.
- The Worker Loader not-auto-instrumented caveat remains a repo-verified implementation assumption:
  Cloudflare's supported auto-instrumented span list still omits Dynamic Worker Loader, and this
  repo still wraps the DynamicWorkerExecutor boundary with custom spans.
