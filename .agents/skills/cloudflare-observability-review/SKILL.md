---
name: cloudflare-observability-review
description: Investigate live Cloudflare Workers observability for stellar-raven-codemode. Use when reviewing production MCP request logs, playground/demo telemetry, traces, Ray IDs, request headers, telemetry query results, eval observability, agent-run forensics, or whether Cloudflare metadata is enough without app-level correlation IDs.
---

# Cloudflare observability review

Answer "what happened in production?" from Workers Logs, platform invocation events, and OTel
spans. State the question first, then run the narrowest query that can answer it: one Ray ID or a
short window before a wide sweep. Stop when the question is answered. In a round, record the query
inputs, Ray IDs, and verdict in the round ledger or `.agents/TODO.md`.

Cloudflare-native request identity is enough for one invocation. Use the app's privacy-safe
`subjectHash` and `clientHash` only to attribute across requests. Do not add a model-forwarded
correlation ID unless production evidence shows this fails for common investigations.

## Safety

- Never print secrets from `.env`, `.dev.vars`, Wrangler, Cloudflare, or MCP responses.
- Use the Cloudflare API MCP for historical evidence. `wrangler tail` is a convenience stream; a
  miss there is not evidence that logs are absent.
- Platform fields that carry IPs, geo, TLS, or client fingerprints may be queried inside a bounded
  investigation to join or separate requests. Report them only when directly relevant, never copy
  them into app logs, and never infer identity from them outside an abuse review with its own
  privacy decision.

## What joins

One invocation:

- The response `cf-ray` header joins to Workers Logs. Strip the colo suffix:
  `a15a1ed37fa5b049-ATL` becomes `a15a1ed37fa5b049`.
- App JSON logs have `$metadata.type = "cf-worker"`; platform invocation logs have
  `"cf-worker-event"`; OTel spans have `"span"` and join by `cloudflare.ray_id`.

A controlled eval or research run: a narrow time window plus a unique non-secret marker in
`clientInfo.name` or the user-agent, grouped by path, method, status, and Ray ID.

Third-party traffic across requests:

- Group by `subjectHash` or `clientHash` from the `mcp_request` summary. Child events join through
  `$metadata.requestId` and do not repeat the hashes.
- `subjectHash` is the 16-hex `hashPrefix(subject)` that playground and artifact events use.
  `clientHash` is a 16-hex HMAC of the OAuth client ID.
- `clientHash = null` means a grant issued before client attribution, not an anonymous user. Never
  fill the gap from user-agent or network fields.
- Rotating `MCP_SERVER_SECRET` splits hashes between old and new grants, and rotates demo cookies.
- A wrong named API key falls through to OAuth and appears as `accessMode = "oauth-rejected"`; a
  valid key is `"api-key"`. Never derive identity from rejected credentials.
- `OPTIONS /mcp` preflights emit no `mcp_request` event.
- Rare same-user concurrent tasks can stay ambiguous. Accept that unless evidence shows it matters.

## Live probe

Generate a known request when you need one. Use a named API key from a mode-`0600` file (an
operator creates it with `npm run mcp-key -- create <name> --out <file>`). Do not echo it and do
not load `.env` into the shell:

```sh
RAVEN_KEY_FILE=<path to the credential file>
MARK="raven-live-telemetry-$(date +%s)"
BODY=$(node -e 'const m=process.argv[1]; console.log(JSON.stringify({
  jsonrpc:"2.0", id:0, method:"initialize",
  params:{protocolVersion:"2025-06-18", capabilities:{},
  clientInfo:{name:m, version:"0.0.0"}}
}))' "$MARK")
curl -i -sS https://raven.stellar.org/mcp \
  -H "Authorization: Bearer $(cat "$RAVEN_KEY_FILE")" \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  --data "$BODY" |
  awk 'BEGIN{IGNORECASE=1} /^HTTP\//{print} /^cf-ray:/{print} /^content-type:/{print} /^mcp-session-id:/{print}'
```

Wait 30 to 90 seconds for ingestion before you query.

## Query

1. Discover fields when needed: Cloudflare API MCP `/workers/observability/telemetry/keys`.
2. Events for one request:

   ```json
   [
     { "key": "$metadata.service", "operation": "eq", "type": "string", "value": "stellar-raven-codemode" },
     { "key": "$metadata.requestId", "operation": "eq", "type": "string", "value": "<ray-without-colo>" }
   ]
   ```
3. Spans for one request:

   ```json
   [
     { "key": "cloudflare.script_name", "operation": "eq", "type": "string", "value": "stellar-raven-codemode" },
     { "key": "cloudflare.ray_id", "operation": "eq", "type": "string", "value": "<ray-without-colo>" }
   ]
   ```
4. Broader reviews: group counts by `$metadata.type`, `$workers.event.request.path`,
   `$workers.event.response.status`, `$workers.event.request.headers.user-agent`, or
   `cloudflare.ray_id`.
5. Cross-request OAuth review: filter `evt = "mcp_request"`, group by `subjectHash` or
   `clientHash`, then join child events and spans by `$metadata.requestId`.

## Measurement traps

Each of these fails silently: the query succeeds and the number looks plausible.

- **Filter `$metadata.type` before you count requests.** App log rows inherit their invocation's
  status, so an unfiltered group counts log volume and can more than double the request total.
- **Filter by `evt`, not `source.evt`**, unless the keys endpoint shows the `source.*` variant.
  The keyspace flattens app JSON fields.
- **A new field value is not filterable at once.** The filter index can lag the first emission by
  about 20 minutes. When a filter returns zero for something you have reason to expect, query by
  service only and filter client-side, or join by `$metadata.requestId`.
- **A wide `view: "events"` query returns a small, unrepresentative slice**, not every match under
  `limit`. Slice any window wider than about 6 hours and sum. Never conclude "this never happens"
  from one multi-day query.
- **ABR sampling is not uniform across window sizes.** `abr_level` is 1 for windows up to about 12
  hours and 10 above. Use equal, narrow windows for a ratio and report the level.
- **`truncated` on `search` and `demo-search` is catalog pagination** (`total > hits.length`), not
  byte truncation. Byte truncation is `demo-execute.resultTruncated` and the
  `--- SOURCE BASIS ---` block.
- **`recoveryAdviceDelivered` is a host delivery latch**, not model compliance.
- **`evidenceState` on a `demo-step` is per step.** The final answering step makes no tool calls,
  so `"none"` there is structural.
- **`sourceBasis`** exists when a result is truncated or an operation provides allowed source
  metadata. `canonicalUrlCount` comes from the full result before truncation, so a zero count
  cannot show that truncation removed a URL.
- **Check the shape before you match stored results.** `rows[].transcript` is an array of objects,
  and `verdict` is an object whose label is `verdict.score`. String or identity comparisons on
  either return a wrong answer without an error.
- **AI Gateway can replay completions.** The demo gateway has `cache_ttl: 300`, and a replay is
  invisible from the Worker. `demoModelSettings` sends `cf-aig-skip-cache: true`, so demo repeats
  are independent; any other measured surface that talks to a gateway needs that header. Compare
  repeat latency and output length before you trust a p50.

## Skill reads

Skill bodies are fetched from their pinned upstream at read time (`ARCHITECTURE.md` §6).

- **`evt = "skill_read"`**: group `ms` by `from` (`memo`, `cache`, `upstream`) and never average
  across them. Expect tens of milliseconds for `upstream` and near zero for `memo`. For
  availability, filter `outcome = "error"` and group by `id` and `from`. `shape` (`whole`,
  `sections`, `files`, `mixed`) and `id` show what is read; this feeds the open question in
  `ideas/skill-discovery-without-bundling.md`. `retrievals` counts pinned files
  fetched. Events carry no body text and no caller identity.
- **`evt = "skill_canary"`**: the hourly cron (`src/skills/canary.ts`) fetches every pinned file
  with caches bypassed. It is the only detector that works with no user traffic. Silence in
  `skill_read` means nobody asked, not that reads work.
  - `ok=false` while `check-mirrors --fetch` is green in CI: the content is fine and our access
    from Cloudflare is broken.
  - No canary events: the cron is not firing. That reads the same as healthy unless you check;
    `refresh.yml` fails on a verdict older than 3 hours for this reason.

## Playground failures

Do not start from a screenshot timestamp; the capture can postdate the failing turn. Search a wide
recent window (about 10 hours, or the stated window) in slices:

- `evt = "demo-execute"` grouped by `ok` and `evidenceOutcome`.
- `evt = "demo-chat"` with `executeFailures > 0`, grouped by `finishReason` and request ID. A chat
  can finish with an answer after failed executes.
- Spans for `codemode.execute`, grouped by `$metadata.message` and `sandbox.ok`, to separate
  model-code failures from sandbox failures.

Then join each failing request by `$metadata.requestId`: `demo-search` (limits, hit and omitted
counts, top IDs), `demo-execute` (`ok`, `evidenceOutcome`, `codeChars`, truncation, `ms`), `op`
(operation IDs, outcomes, timings), `demo-chat` (`searchCalls`, `executeCalls`, `executeFailures`,
`finishReason`, `budgetExhausted`, `finalNeededButMissing`), and `demo-chat-start` (`model`,
`openAiApiMode`, `reasoningEffort`, message counts and sizes, `subjectHash`).

Question, code, result, answer, and provider-error text is not logged. Use text the user supplies,
and mark inference from counts and IDs as best-effort.

- `object is not iterable` with `Promise.all({ ... })` is model-authored JavaScript, not a service
  outage.
- `Execution timed out` after successful `op` lines usually means a slow or broad script hit the
  60-second sandbox cap. Check `codeChars`, list limits, and operation timings first.

## Field map

- **MCP request summary**: `accessMode`, `subjectHash`, `clientHash`, `requestId`, `rayId`,
  `method`, `status`. Rejected events omit the identity keys. Cloudflare redacts the older `auth`
  field, so group by `accessMode`.
- **Auth-flow rejections**: `evt = "auth_reject"` with `status` and `reason`; `src/auth/workos.ts`
  owns the emitters and reason strings. These events omit identity fields. Failures inside `@cloudflare/workers-oauth-provider`
  (`/token`, `/register`) show only status and path.
- **App logs**: `evt`, `queryChars`, `requestedLimit`, `effectiveLimit`, `omittedCount`,
  `gatedHits`, `backfillHits`, `hits`, `total`, `truncated`, `top`, `ok`, `evidenceOutcome`,
  `codeChars`, `latestUserChars`, `historyChars`, `historyMessages`, `userMessages`, `model`,
  `openAiApiMode`, `reasoningEffort`. `omittedCount` is `total - hits` for the consulted tiers and,
  like `total`, a floor. A null `effectiveLimit` means validation or a refusal stopped the search.
- **Metadata**: `$metadata.service`, `.requestId`, `.type`, `.trigger`, `.message`.
- **Platform**: `$workers.event.rayId`, `$workers.requestId`, `$workers.event.request.path`,
  `.method`, `.headers.user-agent`, `.headers.mcp-protocol-version`, `.headers.cf-ray`,
  `$workers.event.response.status`.
- **OTel**: `cloudflare.script_name`, `cloudflare.ray_id`, `cloudflare.colo`, `cloudflare.asn`,
  `http.response.status_code`, `url.full`, `user_agent.original`, `traceId`, `spanId`.
- **Privacy-sensitive, already in platform logs**: `cf-connecting-ip`, `x-real-ip`, precise geo,
  TLS, and client-fingerprint metadata.

## Report

End with the query inputs (timeframe, filters, Ray IDs, views), the joined evidence, the gaps
(ingestion delay, missing attribution), any privacy-sensitive fields observed, and one
recommendation: Cloudflare-only is enough, add auth subject or client fields, or change service
code or docs.
