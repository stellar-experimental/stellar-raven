# Architecture — how `search` and `execute` work

Raven exposes two MCP tools over a generated Stellar service catalog. `search` ranks catalog entries on the host. `execute` runs model-written JavaScript in a networkless Dynamic Worker. Host adapters own service traffic, credentials, argument validation, and response normalization.

Read [PLAN.md](PLAN.md) for scope and [README.md](README.md) for connection details. Use [Run locally](README.md#run-locally) for development setup. Use [the operator guide](docs/operations.md) for release and retention procedures. The source modules and generated manifest define the implemented behavior.

| Concern | Source |
| --- | --- |
| Worker routes and MCP request context | [src/server.ts](src/server.ts) |
| MCP tools and model instructions | [src/mcp/tools.ts](src/mcp/tools.ts) |
| Catalog validation, search, and recovery | [src/catalog/](src/catalog/README.md) |
| Sandbox execution and host providers | [src/executor/run.ts](src/executor/run.ts), [providers.ts](src/executor/providers.ts) |
| Service calls and envelopes | [src/adapters/](src/adapters/index.ts) |
| Skill reads and first-party runners | [src/skills/](src/skills/README.md) |
| Stellar Docs mappings and write guardrails | [docs/stellar-docs.md](docs/stellar-docs.md) |
| Operational usage collection | [usage/README.md](usage/README.md) |

## 1. A `search` call, end to end

### Request routes and authorization

`src/server.ts` handles the Worker request.
For `/mcp`, it checks authorization in this order:

1. `authenticateApiKey` accepts a named bearer credential, `Authorization: Bearer <name>:<token>`.
   It validates the name and token format, then compares the token digest with its `OAUTH_KV` record.
   Invalid or unavailable records fall through to OAuth.
2. `allowDevUnauthenticated` requires `DEV_ALLOW_UNAUTHENTICATED` to equal `"true"` and the hostname to be loopback.
   The hostname check prevents this variable from authorizing a public hostname.
3. `@cloudflare/workers-oauth-provider` validates the OAuth request and supplies the authorized grant properties.

Raven acts as the OAuth authorization server. The provider owns opaque tokens in `OAUTH_KV`, client registration, S256-PKCE, and Client ID Metadata Documents. WorkOS AuthKit authenticates the person through `/authorize` and `/callback`. Raven keeps the peppered subject and OAuth client ID in encrypted grant properties. It discards the WorkOS access token after the code exchange.

The provider validates client identities, redirect matches, URI schemes, and native loopback ports. Raven additionally rejects non-loopback HTTP redirects during registration and authorization. An insecure redirect produces a local `400` response without `Location`. Raven supports HTTPS, loopback HTTP, and native schemes accepted by the provider. Metadata aliases map supported discovery paths to the provider's metadata endpoint.

The script-free consent page labels the client name as unverified. It shows the complete validated return address as plain text. Approval requires the form's CSRF token and Terms acknowledgement before WorkOS login starts. Cancel requires CSRF validation and returns `303 access_denied` to the validated address. Cancel preserves the OAuth state and issuer, clears the consent cookie, and creates no grant or login state. [src/auth/workos.ts](src/auth/workos.ts) owns this flow.

### Public site and Playground

The OAuth default handler serves public site routes through [src/site.ts](src/site.ts). These include `/`, `/docs`, `/terms`, `robots.txt`, `sitemap.xml`, and `/og.png`. Generated fonts and images form part of the Worker bundle. The project does not use a Wrangler static-assets directory.

`src/server.ts` handles `/playground` before the OAuth default handler. Unauthenticated visitors see a static example and a WorkOS login link. Authenticated visitors use `/playground/chat` through a signed session cookie. The chat handler uses the same catalog search and execute runner through [src/demo/tools.ts](src/demo/tools.ts). Its outer wrapper enforces the Playground limits in section 7.

The browser keeps history in page memory and sends it with each turn. The server keeps the newest messages within the history caps. Displayed tool trace frames do not enter replay history. `prepareStep` reserves the final model step for synthesis without tools. Host-observed operation outcomes control bounded recovery guidance. A later search cannot erase grounded execute evidence.

### MCP tool handling

Each authorized request creates a fresh, stateless `McpServer`. `createMcpHandler` serves streamable HTTP and supports both discovery and initialization lifecycles. Raven uses no Durable Object or server-side MCP session storage. Cloudflare routing handles allowed hostnames. The handler checks browser Origins against the configured hostnames and loopback hosts. Requests without an Origin header remain valid for ordinary MCP clients.

[src/mcp/tools.ts](src/mcp/tools.ts) owns tool schemas, descriptions, and `SERVER_INSTRUCTIONS`. `BASE_SERVER_INSTRUCTIONS` must provide the complete workflow within its tested 2,000-character budget. The generated source-family map follows that base contract. It identifies service families without adding operation cards to the catalog.

The MCP and sandbox search adapters share `prepareCatalogSearch` from [search-resolution.ts](src/catalog/search-resolution.ts). It validates the service filter, validates recovery IDs, then resolves the page and requested recovery candidates. Each adapter retains its own input checks, response shape, prose, and telemetry.
The MCP response supplies matching text and `structuredContent`:

```text
{ hits, total, truncated, recovery, widerCandidates,
  confidence, recoveryMetadata, nextSteps }
```

An unknown service produces zero MCP hits and names the valid services in `nextSteps`. The sandbox adapter returns an error envelope for the same invalid filter. Neither adapter treats a spelling variant as a service alias. `getCatalog()` validates the bundled manifest once per isolate and throws on invalid catalog data.

## 2. The scoring pipeline

[The catalog reference](src/catalog/README.md) defines the scoring, admission, selection, ordering, count, and recovery rules.
This section gives only the stages.

1. The vendored scorer supplies lexical matching and a token-coverage gate.
   [scoring.ts](src/catalog/scoring.ts) adds stopword rescue, query aliases, weighted keywords, and kind weighting.
2. Routing metadata adds operation vocabulary and rejects contradictory intent.
   A whole skill enters search only with independent admission evidence.
   Section entries carry `searchable: false` and remain available through exact-ID navigation.
3. `searchCatalogPage` selects a page of gated candidates with service diversity.
   Ungated candidates can fill a short page or make a bounded replacement in a full page.
4. The selector fixes membership, then orders the hits.
   Every hit carries `tier: "gated" | "backfill"`.
   Returned hit order defines the ranking; scores alone do not describe every ordering rule.

`total` and `truncated` describe catalog navigation, not completeness of upstream evidence.
`widerCandidates` and `recovery` supply advice that stays separate from the ranked hits.
[ADR-0007](research/decisions/0007-structural-recovery-guidance.md) records the structural, advisory, bounded recovery decision.
An oversized rendered output type becomes a compact stub that names the exact `codemode.describe` call.
The manifest and detail helpers retain the complete schemas.

## 3. An `execute` call, end to end

The MCP tool accepts `{ code }` with a non-empty string.
`src/server.ts` injects the Worker-only runner into tool registration.
The Playground constructs the same runner from its Worker tool wrapper.
Plain Node modules can import the tool registration without loading `cloudflare:workers`.

[createExecuteRunner](src/executor/run.ts) uses `DynamicWorkerExecutor` from `@cloudflare/codemode`.
The executor normalizes code into its async function form.
Each execute call loads a fresh Dynamic Worker through `LOADER`.
`globalOutbound: null` blocks network access from model-written code.
The executor enforces its wall-clock timeout.
Its interface does not expose Worker `cpuMs` or `subRequests` limits.

[buildSandbox](src/executor/providers.ts) creates one function per manifest operation in its service namespace.
The operation's terminal ID segment defines the function name.
An unknown function name fails through the provider proxy.
Every service call follows this host-side path:

```text
manifest entry → argument guard → adapter → response normalization → secret redaction
```

The model supplies arguments, but the manifest supplies the endpoint, credential mapping, and schema.
Service payloads can contain source URLs; request credentials remain host-side.
Build-excluded operations have no entry or callable function.
Providers keep per-execute ledgers and flags.
Module-level caches reuse catalog views and resolved spec objects.

The runner wraps sandbox execution in a `codemode.execute` trace span.
Each adapter call emits an `op` event with identity, outcome, and timing.
A failed execution returns `isError: true` and bounded error text.
The MCP execute response uses text `content`, without `structuredContent` or an `outputSchema`.
This provides one model-facing copy of the bounded output.

### Result, log, and error boundaries

The host redacts the final result before applying `truncateForModel`.
The configured token budget determines a character cut at four characters per token.
Reserved source-manifest markers receive escaping even when the result fits.
A source-basis footer appears after truncation or when the host ledger contains source metadata.
The footer has its own bounded character budget after the result cut.
It includes shape and loss facts, operation outcomes, source metadata, sanitized URLs, and artifact availability.

Unavailable artifacts receive narrower rerun advice instead of a callable artifact-read instruction.

Logs and thrown errors have separate output budgets.
`shapeLogs` redacts each console line before clipping it.
The MCP boundary then applies the log token cap to the combined block.
Logs and thrown errors never receive stored result artifacts.
`execute_logs_shaped` reports structural log loss without payload previews.

### Artifact/source-basis lane

Only truncated results can receive artifacts.
The host writes the full redacted result through [src/artifacts/store.ts](src/artifacts/store.ts).
The R2 object body is the redacted result string.
Its key contains an owner hash and a random artifact ID.
Custom metadata stores MIME type, sizing, digest, expiry, request/Ray IDs, catalog time, and a bounded operation ledger.

`src/server.ts` reads OAuth grant properties from `ctx.props`.
`authSubjectFromProps` supplies the subject to `resolveArtifactOwner`.
The runner receives the owner in each execute call context.
API-key and Playground requests have no artifact owner.
The loopback-dev branch uses `dev-local` after the hostname and environment checks pass.
An untruncated source-basis footer reports an absent artifact with reason `not-truncated`.

`codemode.artifact.info(id)` returns metadata through the host provider.
`codemode.artifact.read(id)` returns stored data inside the sandbox for further projection.
Both use service-call envelopes and enforce ownership and expiry.
Invalid IDs, missing objects, expired objects, wrong owners, and ownerless calls return errors.
Artifact metadata intentionally includes `requestId` and `rayId` for compact audit references.
The final result boundary still applies when a script returns artifact data.

## 4. The envelope contract

Service operations and skill runners return this contract:

```text
{ ok: true, data }
{ ok: false, error: { service, kind, message, status?, code?, hint? } }
```

[src/adapters/types.ts](src/adapters/types.ts) defines `kind` as `"error" | "soft-empty"`.
A soft-empty result means the service returned no usable evidence.
An empty successful payload remains successful data with no positive rows.
Neither form proves an open-world absence.
The host ledger classifies empty success as inconclusive without changing the public envelope.

Scout can return HTTP 200 for a page that lost a backend read.
It states the loss in `meta.partial: true` and lists the reads in `meta.failedReads`.
It can also add a failed-read element to the `meta.warnings` string array.
The case-sensitive warning matcher requires the prefix `backend read failed`, followed by whitespace, a colon, or end of string.
Either signal maps the response to `ok: false`, `kind: "error"`, and `status: 200`, even with rows.
The message is the first failed-read warning.
Without that warning, the message names each `failedReads` entry, or says that Scout marked the page partial.
The adapter preserves the arrays under `error.details.warnings` and `error.details.failedReads`.
It advises one retry, then an inconclusive result.
Other warnings remain in successful data, including unread-parameter warnings.
A non-boolean `partial` is not a failure signal.
Either failure signal takes priority over Scout's `meta.error`, which otherwise stays soft-empty.

The provider prelude installs non-enumerable accessors to catch wrong-level reads.

| Access | Successful envelope | Failed envelope |
| --- | --- | --- |
| Payload key on the envelope, such as `r.projects` | Throws and names `r.data.projects`. | No payload-key trap. |
| `r.data` | Returns data. | Returns `undefined` and emits one warning. |
| Assignment to a guarded property | Writes through as a plain property. | Warns where applicable, then writes through. |
| `r.error` | Returns ordinary `undefined`. | Returns the error. |

Enumerable keys, spreads, JSON, and returned envelopes keep their ordinary shapes.
The guard uses accessors because provider RPC cannot serialize a Proxy envelope.
Discovery helpers use their documented shapes; skill reads keep content at the top level.

## 5. Discovery inside the sandbox

[providers.ts](src/executor/providers.ts) supplies the `codemode` namespace.
The flat provider functions support nested helper spelling through the prelude.

| Helper | Contract |
| --- | --- |
| `codemode.spec()` | Returns the unified spec with resolved references. The host caches resolution per spec object. |
| `codemode.search(queryOrOpts)` | Returns hits, counts, tiers, confidence, and bounded recovery advice. Invalid filters or IDs return errors. |
| `codemode.catalog({ kind?, service?, compact? })` | Returns manifest entries without host transport or provenance. `compact: true` omits schemas. |
| `codemode.describe(id)` | Resolves an exact ID and returns full schemas, signatures, section navigation, and usage instructions. |
| `codemode.skill.read(name, { sections? })` | Returns pinned playbook content or selected sections at the top level. |
| `codemode.skill.run(name, input)` | Calls a registered first-party runner and returns a service-call envelope. |
| `codemode.artifact.info(id)` / `codemode.artifact.read(id)` | Return owner-bound metadata or data through service-call envelopes. |

The super spec uses `/{service}/{operation}` paths and exact sandbox operation IDs.
It includes skill read and run operations with manifest-derived indexes.
Oversized success-response schemas retain top-level fields and exact detail-helper pointers.
Inputs and smaller response schemas remain complete.
A script can inspect the spec without returning the whole document to the model.
[ADR-0001](research/decisions/0001-search-tool-shape.md) records the two-tool discovery decision.

## 6. Skill splitting — pins → sections → reads

[The skill reference](src/skills/README.md) defines the read, integrity, deadline, runner, and availability-check mechanisms.
[ecosystem-skills/README.md](ecosystem-skills/README.md) defines the pin set and its update procedure.

`ecosystem-skills/MANIFEST.json` pins upstream commits and file digests.
Raven forwards skill bodies; it does not keep a durable owned mirror or bundle bodies into the Worker.
Transport caches do not become the source of record.
The generated catalog defines the exposed skills and section addresses.
Sections remain readable by exact ID but do not enter default search.

### Availability posture

A skill read depends on the upstream file at its pinned commit.
Raven accepts this availability risk because the risk is observable.
`skill_read` error events show failed reads from real traffic.
The daily mirror check and the hourly Worker canary test retrieval without their caches.
`GET /health/skills` publishes the canary verdict.
A failed check requires diagnosis; it does not prove that upstream deleted a file.
Never mirror the content to correct an availability failure.

### Runners

Skill runners execute reviewed first-party code on the host, outside the sandbox.
`RUNNERS` defines the exact runnable IDs, schemas, and declared operations.
A runner receives only its declared operation functions and its input.

## 7. Operating limits and caps

The code constants define these limits.
Refresh this matrix when those constants change.
[Run locally](README.md#run-locally) defines development setup.
[The operator guide](docs/operations.md) owns the retention table, account-data deletion, and release procedures.
AI Gateway account limits require separate live verification; this table describes application limits.

### Shared by demo and MCP

| Area | Limit or behavior | Source |
| --- | --- | --- |
| Execute sandbox | Fresh isolate, `globalOutbound: null`, 60s timeout. | [run.ts](src/executor/run.ts) |
| Service arguments | Validate against the manifest schema before dispatch. | [guard.ts](src/policy/guard.ts), [validate.ts](src/policy/validate.ts) |
| Result body cut | Default 6,000 tokens, four characters per token. Footer budget is separate. | [truncate.ts](src/policy/truncate.ts), [source-basis.ts](src/policy/source-basis.ts) |
| Budget override | `EXECUTE_MODEL_BOUNDARY_MAX_TOKENS`: 1,000–32,000 tokens. Invalid values use the default. | [truncate.ts](src/policy/truncate.ts) |
| Logs | First 100 lines; redact before clipping each line to 2,000 characters. Apply the combined token cap afterward. | [shape-logs.ts](src/executor/shape-logs.ts) |
| Error text | Same configured token cap as result bodies. | [tools.ts](src/mcp/tools.ts) |
| Skill file load | 20s per file, with 8s fetch attempts and one retry. | [source.ts](src/skills/source.ts), [store.ts](src/skills/store.ts) |
| Skill runner | 30s host deadline. In-flight operations can continue after timeout. | [run.ts](src/skills/run.ts) |

### Playground-only `/playground/chat`

The server validates method, origin, authorization, request size, and message shape before consuming the hourly allowance.
A valid turn consumes that allowance even when later model or tool execution fails.
The signed cookie contains the peppered WorkOS subject; loopback dev uses `dev-loopback`.

| Area | Limit or behavior | Source |
| --- | --- | --- |
| Hourly allowance | 30 chats per subject per fixed UTC hour; best-effort KV updates. | [budget.ts](src/demo/budget.ts) |
| Rate response | `429`, `Retry-After: 3600`. Concurrent requests can exceed the best-effort allowance. | [chat.ts](src/demo/chat.ts) |
| Request body | 384 KiB limit before JSON parsing. | [chat.ts](src/demo/chat.ts) |
| Replay history | Newest 20 messages, at most 24,000 content characters when possible. Keep the final message. | [budget.ts](src/demo/budget.ts) |
| User message | 8,000 characters. The composer blocks excess text; the server returns `400 message_too_long`. | [budget.ts](src/demo/budget.ts), [page.ts](src/demo/page.ts) |
| Whole turn | 120s abort signal for model streaming and tool calls. | [chat.ts](src/demo/chat.ts) |
| Model steps | 7; the final step has no active tools. | [steps.ts](src/demo/steps.ts) |
| Model output | 4,096 output tokens. | [budget.ts](src/demo/budget.ts) |
| Search calls | 3 per turn. | [budget.ts](src/demo/budget.ts) |
| Search page | Default 5 hits; maximum 6. | [tools.ts](src/demo/tools.ts) |
| Hit text | Description: 220 characters. Signature: 400 characters, preserving the callable line. | [tools.ts](src/demo/tools.ts) |
| Execute calls | 3 per turn. | [budget.ts](src/demo/budget.ts) |
| Execute code | 8,000 characters. Reject known-invalid `Promise.all({ ... })` before execution. | [tools.ts](src/demo/tools.ts) |
| Recovery | At most one hint-driven cycle per turn. Independent structural failure recovery remains active. | [steps.ts](src/demo/steps.ts) |
| Artifacts | No artifact owner or readable result artifacts. | [tools.ts](src/demo/tools.ts) |

### MCP-only `/mcp`

| Area | Limit or behavior | Source |
| --- | --- | --- |
| Search page | Default 10 hits; maximum 50. | [search.ts](src/catalog/search.ts) |
| Execute code | Non-empty string; no application length ceiling. | [tools.ts](src/mcp/tools.ts) |
| Tool calls | No application per-session count cap. | [server.ts](src/server.ts) |
| Refresh grant | Fixed authorization window; token rotation does not extend it. See the [retention table](docs/operations.md). | [gate.ts](src/auth/gate.ts) |
| Identity revalidation | WorkOS authenticates during browser authorization; later WorkOS changes do not synchronously revoke a Raven grant. | [workos.ts](src/auth/workos.ts) |
| Artifact availability | OAuth subjects and loopback `dev-local`; no API-key or Playground owner. | [server.ts](src/server.ts) |
| Artifact body | Maximum 2 MiB. Larger results receive advice without an artifact write. | [store.ts](src/artifacts/store.ts) |
| Artifact metadata | Maximum 8,192 bytes; ledger includes first 12 calls and totals; operation names have 180-character caps. | [store.ts](src/artifacts/store.ts) |
| Artifact helper calls | Per execute: 8 info calls and 4 reads. | [providers.ts](src/executor/providers.ts) |

### Usage collection

The separate `stellar-raven-usage` Tail Worker extracts tool-response metadata after each producer invocation.
It writes records to a private D1 database.
[The operator retention table](docs/operations.md) defines the record lifetime.
The producer and model sandbox receive no D1 binding.
The collector excludes queries, answers, code, headers, protocol traffic, and raw account identifiers.
API-key records remain separate from user counts.

[usage/README.md](usage/README.md) defines reporting and coverage limits.
[The operator guide](docs/operations.md) defines account-data deletion procedures.

## 8. Build & refresh chain — keeping the catalog honest

Generated artifacts come from scripts, never from manual edits.
The manifest defines the exposed surface under [ADR-0003](research/decisions/0003-build-time-exposure-filtering.md).

| Inputs | Builder | Output |
| --- | --- | --- |
| Service snapshots, authored docs spec, title snapshot, skill pins and files, runner registry | `scripts/build-catalog.mjs` | `catalog/manifest.json` |
| Manifest and workflow archetypes | `scripts/build-micro-map.mjs` | `src/mcp/micro-map.ts` |
| Manifest, service mappings, runner registry | `scripts/build-super-spec.mjs` | `specs/super-spec.json` |

The catalog builder fetches exposed pinned skill files and verifies both digests.
Its gitignored file cache supports repeated builds.
`inventory/stellar-docs.json` supplies settings drift evidence, not catalog entries.
`inventory/stellar-docs-titles.json` supplies routing vocabulary and contributes its timestamp to catalog generation time.
Sorted entries, stable keys, and input-derived timestamps make catalog generation deterministic.

`src/policy/scout-exposure.ts` owns excluded Scout operations.
`scripts/exposure.mjs` owns the other exposure lists and re-exports Scout exclusions.
Builders reject stale exclusions, unresolved retirement names, orphaned notes, missing skill mirrors, and missing build-authority IDs.
They also reject references to non-exposed operations in authored model-facing text.
Runnable schemas and declared operation sets must match the emitted manifest.
Catalog, spec, and instruction-map checks reject stale generated outputs.

The skill update process displays changed bodies and requires selection-specific review evidence.
A new file requires full review.
Changing a file selection inside the same commit still requires review.
[ecosystem-skills/README.md](ecosystem-skills/README.md) owns the operator sequence.

[ci.yml](.github/workflows/ci.yml) defines the exact gate order.
Its gates cover types, bundle builds, unit tests, assembled-worker smoke tests, eval contracts, routing, and artifact synchronization.
The smoke lane blocks external traffic and serves pinned skill files from a local map.
The artifact gate rebuilds catalog, spec, instructions, images, skill index, and eval artifacts, then rejects differences.
Build-time pinned-file retrieval can require network access.

[refresh.yml](.github/workflows/refresh.yml) checks live inventories, skill pins, mirror availability, and the Worker canary.
It reports drift through an issue and fails the workflow.
Operation-ID sets define surface drift; a version string alone does not.
The search-only Algolia rule canary compares rules-on and rules-off results with analytics disabled.
Assertion drift and check errors remain different failure classes.
Local runs without credentials are inconclusive; CI requires credentials.

## 9. Observability

[src/observability.ts](src/observability.ts) owns operational events and the no-payload logging rule.
`mcp_request` records access mode, status, timing, request ID, and a normalized Ray ID.
OAuth summaries use `subjectHash` and secret-keyed `clientHash`; grants without client attribution report a null client hash.
API-key summaries use the validated key name and null OAuth identity fields.
Rejected bearer requests omit identity fields.
Network, geography, and TLS values do not become application identity fields.

Search events record query size, limits, counts, tiers, recovery IDs, response size, and timing.
Execute events record outcomes, sizing, truncation, artifact use, and bounded source-basis facts.
Operation and runner events record IDs, outcomes, and timing.
Skill-read events distinguish memo, colo cache, and upstream retrieval.
Events and spans exclude query text, execute code, payloads, answers, secrets, and provider-error messages.
The [observability skill](.agents/skills/cloudflare-observability-review/SKILL.md) owns investigation procedures.

## 10. Evals

[eval/EVALS.md](eval/EVALS.md) defines the instruments, reporting rules, and denominator contracts.
Routing evaluates catalog discovery through its committed gates.
The QA battery evaluates search, execution, and answer grounding together.
Discovery, plan, Playground, and live-data instruments provide separate diagnostic evidence.
Their results do not share one combined denominator.
[eval/gates.json](eval/gates.json) defines routing thresholds.
