# Per-user MCP Observability and Future Personalization

Status: privacy-safe request attribution implemented and production-verified 2026-07-13. Product
analytics and personalization remain deliberately deferred.

Recorded: 2026-07-11 for Solo todo
`solo://proj/49/todo/track-users-better-v--889`.

## Question and decision

We want to answer two related but different questions:

1. Can production `/mcp` requests be attributed to a stable pseudonymous user and MCP client for
   debugging, telemetry, traces, support, and aggregate product analysis?
2. Can that identity eventually support user-controlled memory that tunes answers to an individual?

The implemented local change adds privacy-safe user/client attribution to request logs while
preserving Cloudflare-native invocation joins. Production verification remains deploy-gated. Do
not fingerprint users from IP, geo, TLS, or browser characteristics, and do not make operational
telemetry the future personalization database.

The target separation is:

- **Observability:** what happened to this invocation?
- **Analytics:** how does this pseudonymous user or client use Raven in aggregate?
- **Personalization:** what has this user intentionally taught Raven, and may it affect future
  answers?

These may share an internal user identity, but they need separate schemas, retention, access, and
user controls.

## Current implementation

### Authentication and user identity

The public `/mcp` path is OAuth-authenticated through `@cloudflare/workers-oauth-provider`, with
WorkOS as the upstream identity provider. Admin-token and loopback-only development bypasses are
separate auth modes.

After WorkOS authentication, Raven:

1. reads the WorkOS user id;
2. derives `SHA-256(workosUserId + ":" + MCP_SERVER_SECRET)`;
3. drops the WorkOS token and raw WorkOS user id;
4. supplies the derived, colon-free subject as both the OAuth provider `userId` and
   `props.subject`.

The authenticated MCP handler reads `ctx.props.subject` before entering `createMcpHandler`. The
subject remains the owner key for truncated-result artifacts, and its existing 16-hex hash is now
attached to the authoritative `mcp_request` summary. Child `search`, `execute`, `op`, and
`skill_run` events join through Cloudflare request metadata instead of repeating it.

The subject is pseudonymous and stable while `MCP_SERVER_SECRET` is stable, but it is not a durable
personalization identity across secret rotation. Before user memory depends on it, Raven needs a
stable internal-user mapping or a versioned migration design. Observability does not need to solve
that storage problem now, but it must not accidentally declare the current derived subject to be an
immutable lifetime user id.

### Client identity

OAuth authorization knows the OAuth `clientId`, and the consent surface looks up a human-readable
client name. New completed authorizations store `{ subject, scopes, clientId }` in encrypted token
props. Request logging derives a secret-keyed, versioned 16-hex client hash; grants issued before
this change honestly report a null client hash.

User identity and client identity are separate dimensions. Both are useful for investigations and
aggregate product analysis; neither should be inferred from user-agent or network fingerprints
when OAuth already provides stronger attribution.

### Request, log, and trace identity

Cloudflare supplies a Ray ID for each HTTP invocation. Within the current retention window it joins:

- app JSON logs (`$metadata.type = "cf-worker"`);
- platform invocation events (`$metadata.type = "cf-worker-event"`);
- OTel spans (`$metadata.type = "span"`, joined through `cloudflare.ray_id`).

The MCP handler also creates a random UUID and reads the `cf-ray` request header. Those values are
passed into the execute context and can be stored with truncated-result artifacts, but the UUID is
not a consistent field on all application events. Cloudflare invocation metadata remains the
canonical request-level join.

`/mcp` is stateless: Raven constructs a fresh `McpServer` for each request and keeps no MCP
conversation or durable session. Stateless transport does not prevent future personalization; an
authenticated request can load a compact server-side profile by internal user id when that product
exists.

### Request content currently observed

Current structured events include:

- `mcp_request`: access mode, privacy-safe user/client hashes, request/Ray ids, method, and status;
- top-level `search`: exact-query hash and length, filters, hit counts, top
  ids, response size, truncation, and duration;
- `execute`: code length, result/error sizes, truncation state, and duration — never the code
  itself;
- `op`: operation id, outcome, and duration;
- runnable-skill and artifact read/write events with bounded operational fields.

Cloudflare platform events separately contain path, method, status, user-agent, network, geo, TLS,
and IP-bearing request metadata. Those private platform fields may help a bounded abuse
investigation, but should not be copied, hashed, or promoted into application identity fields.

Raven does not generally receive the original natural-language prompt that a user gave their MCP
client. It receives MCP protocol requests and tool arguments chosen by that client. A top-level
`search` query or `execute` program may reflect the user's intent, but it is not the original
conversation and should not be represented as one.

The browser playground is a useful precedent, not a shared storage contract. Its chat-start
telemetry emits a hashed subject, exact latest-message hash, lengths, and a short sanitized preview;
full transcripts are intentionally not logged.

## Privacy and product boundaries

### Do

- Use a stable pseudonymous auth-derived user key for cross-request attribution.
- Record a privacy-safe OAuth client key and, if trustworthy, a bounded client-family label.
- Keep Ray ID as the canonical single-invocation join.
- Use short hashes of exact bounded inputs only for repeat/dedup analysis.
- Document retention and access for any user-linked dataset.
- Treat explicit feedback and user-authored preferences as higher-quality signals than behavioral
  inference.

### Do not

- Log bearer tokens, raw WorkOS ids, cookies, or OAuth secrets.
- Create an IP/geo/TLS/user-agent fingerprint or treat those fields as proof of identity.
- Treat a prompt hash as a user fingerprint.
- Claim that MCP tool arguments are the user's original prompt.
- Store complete conversations in observability logs for possible future use.
- Build a hidden personality profile from debugging telemetry.
- Put high-cardinality user identifiers on every span when the span can be joined to the request log
  by Ray ID.

## Event contract implemented for `/mcp`

Add the following fields to one authoritative `mcp_request` event for every request:

| Field | Shape | Purpose |
|---|---|---|
| `accessMode` | `oauth`, `admin`, or `dev-bypass` | separates trust and identity modes without Cloudflare's `auth`-field redaction |
| `subjectHash` | fixed-length lowercase hex or `null` | joins OAuth requests by pseudonymous user |
| `clientHash` | fixed-length lowercase hex or `null` | joins OAuth requests by registered/CIMD client |
| `method` | HTTP method | request filtering |
| `status` | HTTP status | outcome filtering |
| `rayId` | Ray id without colo suffix, if explicitly logged | operator convenience; Cloudflare metadata remains canonical |

Hash inputs must be normalized, domain-separated, and documented. `subjectHash` must reuse the
existing `hashPrefix(subject)` derivation so `/mcp`, artifact, and playground events remain
joinable. Use a versioned, server-secret-keyed derivation for `clientHash` because client ids are
often public or guessable. Do not reuse a bearer token or hash the presented token.

Only the request-summary event needs the user/client join keys initially. All `search`, `execute`,
`op`, skill, and artifact events emitted in the same invocation can be joined through Cloudflare's
request metadata. This avoids repeating high-cardinality identifiers and inflating logs. Add the
keys to child events only if an exported dataset is proven to lose the invocation join.

For rejected OAuth requests, log `accessMode: "oauth-rejected"` with status and no identity fields.
Never derive identity from the rejected bearer token.

## Immediate next plan: observability, telemetry, and traces

This plan improves current production investigations without building retention archives or user
personalization.

### Phase 0 — freeze the contract with a live baseline

1. Record the installed dependency facts: authenticated handlers receive only decrypted grant
   `ctx.props`; the OAuth client id is not exposed there unless Raven persists it at grant time.
2. Query recent organic app logs, platform events, and spans for OAuth-success, rejected, and admin
   traffic. Use the existing marked admin probe only if the window is too sparse.
3. Verify whether all app events retain the same Cloudflare `$metadata.requestId`.
4. Record current field names and gaps. Do not print tokens, raw IPs, or raw OAuth subjects. Defer a
   full marked OAuth probe until after implementation, when it can verify the new contract.

Exit: one evidence-backed field map for a successful OAuth request, a rejected request, and either
admin or dev-bypass traffic.

### Phase 1 — add privacy-safe request attribution

1. Define a typed request-observability context with `accessMode`, `subjectHash`, `clientHash`, and
   normalized Ray ID. Defer `clientFamily`: dynamically registered names are client-asserted and
   spoofable; a future label must be restricted to verified, allowlisted CIMD client-id URLs.
2. Construct it once inside the MCP handler from validated `ctx.props`, not
   `getMcpAuthContext()` (whose async-local context begins inside `createMcpHandler`). Pass bypass
   auth mode explicitly from the outer gate.
3. Persist the raw OAuth client id in encrypted props for new grants, then derive a versioned,
   domain-separated `clientHash` at request time. Already-issued 90-day grants lack the field and
   must emit `clientHash: null`, never a guess from user-agent.
4. Emit exactly one authoritative successful `mcp_request` summary from the handler after the
   response status is known. Delete the existing admin/dev/OAuth-success outer events. The outer
   provider path emits only `accessMode: "oauth-rejected"` for status 401; OPTIONS 204 emits nothing.
5. Reuse a single helper for normalization, hash versioning, and Ray-id colo stripping.
6. Add tests for OAuth, admin, dev-bypass, rejected token, OPTIONS silence, exactly-one emission,
   old-grant props, Ray normalization, hash stability/join consistency, domain separation, absent
   identity keys on rejected events, and secret non-disclosure.

Exit: operators can group successful production `/mcp` requests by pseudonymous user and OAuth
client without network fingerprinting.

### Phase 2 — make trace joins explicit and useful

1. Verify that request logs and automatic handler/custom spans join by stripped Ray ID in the
   Cloudflare telemetry API.
2. Keep user/client hashes off custom spans initially. Add only low-cardinality attributes such as
   `auth.mode` or a trustworthy allowlisted `client.family` if they materially improve trace
   grouping.
3. Review `codemode.execute` attributes against the questions operators actually ask: sandbox
   success, code size, log lines, skill usage, artifact reads, and operation summary. Add the
   already-computed bounded operation totals/outcome counts, not payloads.
4. Confirm that host-side adapter fetch spans appear below the handler and alongside the custom
   Dynamic Worker boundary. Document any beta limitations or zero-duration spans.

Exit: a Ray ID moves cleanly from `mcp_request` to tool events, `codemode.execute`, and upstream
fetch spans, with timing attribution and no user content on spans.

### Phase 3 — production verification and operator query recipes

1. Run baseline validation: `npm run typecheck`, `npm test`, and `npm run build`.
2. Run `npm run secrets:scan -- --tree` before committing.
3. Deploy only when authorized, then repeat the marked production probe.
4. Verify queries for:
   - all requests by `subjectHash` in a narrow window;
   - requests by `clientHash`;
   - one failed request joined through Ray ID to tool logs and spans;
   - rejected OAuth traffic with no user/client attribution.
5. Update `.agents/skills/cloudflare-observability-review/SKILL.md` with the verified field names
   and query examples. Document that secret rotation can temporarily split one human/client across
   old- and new-grant hashes, and that a wrong admin token is intentionally indistinguishable from
   other rejected bearer tokens. Record the probe window and Ray IDs in the relevant Solo todo or
   scratchpad, without sensitive fields.

Exit: code, live evidence, and the operator runbook agree.

### Phase 4 — measure before expanding collection

Observe the new contract for at least one normal investigation cycle. Then decide from evidence:

- whether child events need repeated identity fields;
- whether `clientFamily` is reliable enough to retain;
- whether the bounded search preview, hash, and length remain necessary and proportionate;
- whether the existing 7-day Workers Logs window is insufficient enough to trigger the separate R2
  retention plan;
- which aggregate metrics actually inform routing, quality, or support decisions.

Do not expand retention or content collection merely because user attribution now exists.

## Deferred adoption analytics

Issue [`kalepail/stellar-raven#23`](https://github.com/kalepail/stellar-raven/issues/23) asked for
durable traction reporting, including growth and per-user or per-organization usage. That is not a
new observability mechanism: current request summaries already provide privacy-safe user/client
joins inside the Workers Logs window, and
[`observability-r2-retention.md`](./observability-r2-retention.md) covers raw history when an actual
investigation needs more than seven days. Product analytics is a separate, still-deferred use case.

If someone owns a recurring adoption decision or report, Workers Analytics Engine is the smallest
plausible next step: it supports high-cardinality per-user/per-customer data and SQL queries, with
three-month retention. Write content-minimal events or daily aggregates, not copied observability
logs. Start with counts that answer a named decision:

- active pseudonymous users and OAuth clients by day or week;
- successful MCP requests, searches, executes, and upstream operations;
- first-seen versus returning pseudonymous users only if the retention window is sufficient;
- operation and service ids, latency, and outcomes rather than raw queries or code.

Do not publish “top queries” from raw query previews or reversible short-query hashes. Do not infer
organizations from user, client, network, geo, TLS, or user-agent data; Raven has no trustworthy org
dimension today. `subjectHash` and `clientHash` remain pseudonymous personal data, not anonymous
statistics, so any user-level dataset needs a named purpose, restricted access, retention and
deletion rules, and an explicit decision about whether users must be informed or given controls.

For year-over-year traction, export only coarse daily aggregates without user identifiers instead
of retaining raw per-request history indefinitely. Do not build the dataset until a named owner will
review it on a recurring cadence or a concrete product/funding decision needs it.

Cloudflare references checked 2026-07-15:

- https://developers.cloudflare.com/analytics/analytics-engine/
- https://developers.cloudflare.com/analytics/analytics-engine/limits/
- https://developers.cloudflare.com/workers/observability/metrics-and-analytics/

## Deferred personalization design

Future per-user tuning should be a visible product capability backed by a dedicated store, not a
query over observability logs. A candidate memory record is small, structured, and provenance-bearing:

```json
{
  "kind": "preference",
  "value": "Prefer TypeScript examples",
  "source": "explicit_user_statement",
  "createdAt": "...",
  "lastConfirmedAt": "...",
  "confidence": 1,
  "status": "active"
}
```

Potential categories:

- explicit response preferences;
- stable self-described context;
- project/workspace context;
- explicit positive/negative feedback;
- inferred tendencies only with lower confidence and shorter retention;
- sensitive data excluded by default.

Required product controls before this ships:

- clear disclosure or opt-in;
- inspect: “what do you remember about me?”;
- add, correct, delete, and disable controls;
- workspace/project separation for one person;
- retention and deletion policy;
- provenance and last-confirmed timestamps;
- a durable internal identity that survives auth-secret rotation safely.

When personalization is built, load only a compact relevant profile into the request context. Do
not replay raw historical prompts or full transcripts by default. Measure whether personalization
improves answers, and retain a non-personalized path for comparison and user choice.

## Explicit non-goals for the immediate change

- No durable user profile or “soul.”
- No prompt-history database.
- No IP/device/network fingerprint.
- No model-forwarded correlation id.
- No new R2 observability archive until the existing trigger conditions are met.
- No claim that auth identity, client identity, session identity, and request identity are the same
  thing.

## Recommended todo framing

> Establish durable-enough pseudonymous user and OAuth-client attribution for `/mcp` telemetry,
> preserving Cloudflare Ray ID as the invocation join and avoiding network fingerprinting. Verify
> the contract in production and update the observability runbook. Keep future user-controlled
> personalization as a separate store and product surface with provenance, retention, and deletion
> controls.
