# Observability R2 Retention Plan

Status: research note only. Do not build this until a real investigation needs history beyond the
current Workers Logs window.

[The architecture](../ARCHITECTURE.md) owns current logging and what events exclude. [The
operations guide](../docs/operations.md#data-retention) owns the retention periods, and [the
usage guide](../usage/README.md) owns aggregate retention. The implemented usage archive is not
the raw-log archive proposed here. Provider facts below were checked on 2026-07-07; check them
again before a build.

## Proposal

Workers Logs keep events for at most seven days. Add a Cloudflare Logpush job that exports the
Workers trace events dataset to R2, filtered to this Worker. Cloudflare's Logpush docs list
request and response metadata, `console.log()` messages and uncaught exceptions in that dataset
(fields include `Event`, `EventTimestampMs`, `Outcome`, `Exceptions`, `Logs` and `ScriptName`),
and say Logpush needs Workers Paid and supports filters and sampling
(<https://developers.cloudflare.com/workers/observability/logs/logpush/>).

- **Bucket.** A separate private bucket, for example `stellar-raven-observability`. Archives
  carry request metadata, client markers and platform metadata, so they need their own lifecycle
  and access review. Do not reuse `stellar-raven-artifacts`.
- **Prefix.** `workers-trace-events/dt=YYYY-MM-DD/`.
- **Filter.** Keep only `ScriptName == "stellar-raven-codemode"`. Create the filter in the
  dashboard first if the API field spelling is unclear, then codify it.
- **Fields.** The ones the review skill needs. Do not export IP-bearing headers unless an
  abuse-review use case requires them.
- **Lifecycle.** Delete after 90 days; start at 30 if the use is only debugging across a couple of
  release cycles. R2 lifecycle rules also support Infrequent Access after 30 days, which does not
  suit small debug objects.
- **Cost.** At current traffic, R2 storage rounds to near zero inside the free tier. Standard
  storage is $0.015 per GB-month and egress is free
  (<https://developers.cloudflare.com/r2/pricing/>). If volume grows, sample before changing
  storage class; traces multiply event counts more than logs do.

## Query fallback

Keep `cloudflare-observability-review` on the Cloudflare telemetry API for data inside the Workers
Logs window. For older history, add an archive runbook section or script:

1. Fix the time window and identifiers as the skill does today: Ray ID, eval marker, client
   marker, host, path, status and auth mode.
2. List the R2 objects under the date partitions that cover the window, and stream only those.
3. Filter with `jq` or a small Node script on `ScriptName`, the request id and `Logs[].message`
   events (`mcp_request`, `search`, `execute`, `op`, `skill_run`).
4. Rebuild the skill's report shape: query inputs, joined evidence, gaps, privacy notes and a
   recommendation.

This is a storage and query fallback, not a new observability contract. Do not add
model-forwarded correlation ids to make R2 easier to query
([ADR-0004](../research/decisions/0004-correlation-id-continuity.md)). If multi-request
attribution by user or client proves necessary, add privacy-safe auth subject or client fields to
app logs, as the skill already recommends.

## Triggers

Build the R2 sink only if one of these becomes true:

- An eval, production incident, abuse review, or agent-run forensic question needs request, log or
  trace evidence older than seven days.
- A recurring weekly or monthly observability report needs raw per-request evidence rather than
  aggregate Worker metrics.
- Cloudflare reduces Workers Logs retention or makes dashboard and API retrieval unreliable for
  the current review flow.
- A compliance or privacy decision asks for a bounded retention archive with a documented
  lifecycle, in place of ad hoc local files.

## Staged build

1. **Prototype (about a day).** Create the bucket and lifecycle rule, create the Logpush job, enable
   `logpush: true` for the Worker if the setup needs it, run one production probe, and check that
   the object holds the app JSON log, the platform invocation record and the fields the skill uses.
2. **Query fallback (about a day).** Add the runbook section or script above, with a fixture test
   on one scrubbed object if a parser is added.

Eval result files stay local evidence; their READMEs carry the committed record. Secrets stay
host-side, and no secret goes into logs, object names, ledgers or the repository.
