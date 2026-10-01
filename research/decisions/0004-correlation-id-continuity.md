# ADR-0004: Drop Model-Facing Correlation Ids

Date: 2026-07-03
Updated: 2026-07-04

## Status

Accepted.

Implementation status: identity grouping uses `subjectHash` and secret-keyed `clientHash`.
Operational events exclude raw query, code, result, answer, and provider-error content.
The [current architecture](../../ARCHITECTURE.md) defines this contract.
The dated follow-up proposals below do not authorize raw identity or payload logging.

## Decision

Remove `correlationId` from the MCP tool contract:

- no `correlationId` input on `search`;
- no `correlationId` in `search` structured output or text output;
- no `correlationId` input on `execute`;
- no initialize-time or per-result instruction asking models to forward ids;
- no execute result trailer, output schema, `codemode.context()`, or
  `codemode.search` id echo.

Use Cloudflare Workers Observability as the primary traceability mechanism.
Join app JSON logs, platform invocation logs, and OTel spans by Cloudflare Ray
ID. For controlled eval/research runs, add a unique non-secret marker in
`clientInfo.name`, user-agent, or the eval harness and use a tight time window.
For authenticated multi-request grouping, prefer privacy-safe auth subject/client
attribution in app logs if evidence shows it is needed.

Do not rely on model/client cooperation for trace continuity.

## Context

`search` used to mint and return a `correlationId`, and descriptions instructed
the model to pass that id to follow-up `search` or `execute` calls. That was
best-effort only: MCP does not provide a required conversation-scoped state
field, and clients/models may omit optional arguments.

Adversarial review initially recommended making the id more measurable with
`correlationSource`/`idSupplied`, minting execute fallback ids, and exposing the
id in more text surfaces. A deeper Cloudflare observability review changed the
cost/benefit:

- Workers Logs already correlate all app `console.log` JSON and platform
  invocation events for one request by Ray ID.
- Workers Traces are present; OTel spans join back to logs with
  `cloudflare.ray_id`.
- Response `cf-ray` values are user-visible and can be queried after stripping
  the colo suffix, e.g. `a15a1ed37fa5b049-ATL` ->
  `a15a1ed37fa5b049`.
- Platform logs already include request path, method, status, host, user-agent,
  MCP protocol version when present, colo/country/ASN, and request headers.
- Same-user concurrent MCP tasks are expected to be rare for this service, so
  the incremental value of a model-forwarded task id is low.

Asking models to preserve ids creates prompt and schema clutter while still not
guaranteeing continuity. The cleaner design is to remove that contract and make
observability reviews Cloudflare-first.

## What We Can Reliably Join

Request-level debugging:

- response `cf-ray` header to Workers log events;
- `$metadata.requestId` / `$workers.requestId` on Workers Logs;
- app JSON logs (`$metadata.type = "cf-worker"`);
- platform invocation events (`$metadata.type = "cf-worker-event"`);
- OTel spans (`$metadata.type = "span"`) via `cloudflare.ray_id`.

Controlled eval and research runs:

- tight timeframe;
- service `stellar-raven-codemode`;
- host/path/method/status;
- unique client marker or user-agent when the harness controls it;
- Ray IDs and trace spans.

Best-effort authenticated grouping:

- OAuth/WorkOS subject and OAuth client id if/when app logs include them;
- admin/dev bypass sentinel auth modes;
- user-agent and time proximity as supporting context.

## What We Cannot Reliably Join From Headers Alone

- An arbitrary third-party user's full logical MCP session.
- Two concurrent tasks from the same authenticated user/client.
- A retry/multiplex pattern that a client hides behind identical headers.
- Identity from IP/geo/TLS metadata without privacy risk and false confidence.

This is acceptable given expected usage. If production evidence shows concurrent
same-user ambiguity is common and costly, revisit with auth subject/client
logging first, not a model-forwarded id.

## Recommended Changes

Implemented in this decision:

1. Remove `correlationId` from `search` and `execute` input schemas.
2. Remove `correlationId` from search output.
3. Remove correlation forwarding instructions from tool descriptions,
   initialize instructions, and `nextSteps`.
4. Remove correlation id propagation into execute runner, sandbox providers,
   logs, and custom trace span attributes.
5. Update tests to assert the smaller API.
6. Add a project-local Cloudflare observability skill:
   `.claude/skills/cloudflare-observability-review/SKILL.md`.

Still worth considering separately:

- Add `subject` and OAuth `clientId` to `mcp_request` logs for authenticated
  user/client grouping.
- Add generic secret/PII-shaped scrubbing before logging raw search query or
  execute code previews.
- Add eval harness markers in `clientInfo.name` or user-agent for controlled
  observability reviews.

## Non-Goals

- Do not introduce raw IP logging or IP-derived fingerprints.
- Do not issue `Mcp-Session-Id` under the current stateless transport.
- Do not add stateful server-side session memory in this ADR.
- Do not add a new app-level task id unless production evidence shows the
  Cloudflare/auth approach is insufficient for common investigations.

## Live Evidence

An unauthenticated probe to both deployed `/mcp` routes returned `401` and a
client-visible `cf-ray` response header. A concurrent `wrangler tail --format
json` session did not show events, but the Workers Observability API later found
the same events by service, path, and Ray/request id. Treat `wrangler tail` as
convenience, not the source of truth.

An authenticated production-admin `initialize` probe returned `200` with:

```text
cf-ray: a15a1ed37fa5b049-ATL
```

Querying `$metadata.requestId = "a15a1ed37fa5b049"` returned both:

- app JSON event: `mcp_request`;
- platform invocation event: `POST https://raven.stellar.buzz/mcp`, status
  `200`.

Querying the OTel dataset found the matching span by `cloudflare.ray_id`.

## Privacy Note

Cloudflare platform invocation logs already contain IP-bearing fields such as
`cf-connecting-ip` and `x-real-ip`, plus detailed geo/TLS metadata. Do not copy
those into app JSON logs. App logs should add only semantic fields Cloudflare
cannot infer, such as auth subject/client attribution if needed.
