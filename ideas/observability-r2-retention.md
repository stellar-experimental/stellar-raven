# Observability R2 Retention Plan

Status: held research note. Do not build until a trigger below fires and the required privacy and
security design review completes (Owner decision 5 in [`.agents/TODO.md`](../.agents/TODO.md)
authorizes starting the design study, not a direct build).

[`ARCHITECTURE.md`](../ARCHITECTURE.md) owns current logging and exclusions;
[`docs/operations.md#data-retention`](../docs/operations.md#data-retention) owns retention periods;
[`usage/README.md`](../usage/README.md) owns aggregate usage retention (not this raw-log archive).
Cloudflare Logpush facts were checked 2026-07-07; re-verify before building.

## Proposal

Workers Logs retain events for at most 7 days. Export the Workers trace events dataset to R2 via a
Cloudflare Logpush job (requires Workers Paid; supports filters and sampling;
<https://developers.cloudflare.com/workers/observability/logs/logpush/>):

- **Bucket:** separate private bucket (e.g., `stellar-raven-observability`); never reuse
  `stellar-raven-artifacts`.
- **Prefix:** `workers-trace-events/dt=YYYY-MM-DD/`.
- **Filter:** `ScriptName == "stellar-raven-codemode"`.
- **Fields:** only what `cloudflare-observability-review` needs; omit IP-bearing headers unless an
  abuse-review requirement explicitly calls for them.
- **Lifecycle:** delete after 30 days to stay within `/terms` ("Operational and quality logs": 30
  days max; anything longer requires counsel review). Avoid R2 Infrequent Access for small debug
  objects.
- **Cost:** near zero in R2 free tier at current volume ($0.015/GB-month standard, free egress;
  <https://developers.cloudflare.com/r2/pricing/>). Sample traces before changing storage class if
  volume grows.

## Query fallback

Keep `cloudflare-observability-review` on Cloudflare's telemetry API inside the 7-day window. For
older dates, add a runbook/script that:

1. Fixes the window and identifiers (Ray ID, eval/client markers, host, path, status, auth mode).
2. Streams only matching date-partition objects from R2.
3. Filters on `ScriptName`, request ID, and `Logs[].message` events (`mcp_request`, `search`,
   `execute`, `op`, `skill_run`).
4. Outputs the skill's standard report shape.

Do not add model-forwarded correlation IDs to ease R2 queries
([ADR-0004](../research/decisions/0004-correlation-id-continuity.md)). Use privacy-safe auth subject
or client fields in app logs if multi-request attribution is needed.

## Triggers

Open the design study (and build only after security/privacy review) if one of these holds:

- Owner decision 5 starts the 30-day observability design study ("Keep 30 days of observability
  data, including queries and responses").
- An eval, incident, abuse review, or agent-run investigation needs evidence older than 7 days.
- A recurring report needs raw per-request evidence beyond aggregate Worker metrics.
- Cloudflare shortens Workers Logs retention or makes API/dashboard reads unreliable.
- A compliance or privacy decision asks for a bounded retention archive with a documented lifecycle
  in place of ad hoc local files.

## Staged build

1. **Prototype (~1 day):** create bucket + 30-day lifecycle rule, configure Logpush (enable
   `logpush: true` if needed), run one production probe, verify app JSON logs and platform fields.
2. **Query fallback (~1 day):** add runbook/script plus one scrubbed-object fixture test if parsing.

Never put secrets in logs, object keys, ledgers, or git.
