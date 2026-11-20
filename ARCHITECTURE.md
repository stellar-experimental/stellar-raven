# Architecture — how `search` and `execute` work

Raven exposes two MCP tools over a generated Stellar catalog: `search` ranks entries on the host; `execute` runs model-written JavaScript in a networkless Dynamic Worker. Host adapters own traffic, credentials, argument validation, and response normalization.

See [PLAN.md](PLAN.md) for scope, [README.md](README.md) for connection and [local setup](README.md#run-locally), and [docs/operations.md](docs/operations.md) for deploys and retention. Source modules and the generated manifest are authoritative.

| Concern | Source |
| --- | --- |
| Worker routes and MCP request context | [src/server.ts](src/server.ts) |
| MCP tools and model instructions | [src/mcp/tools.ts](src/mcp/tools.ts) |
| Catalog validation, search, and recovery | [src/catalog/](src/catalog/README.md) |
| Sandbox execution and host providers | [src/executor/run.ts](src/executor/run.ts), [providers.ts](src/executor/providers.ts) |
| Service calls and envelopes | [src/adapters/](src/adapters/index.ts) |
| Skill reads and first-party runners | [src/skills/](src/skills/README.md) |
| Stellar Docs mappings, scoping, and credentials | [docs/stellar-docs.md](docs/stellar-docs.md) |
| Operational usage collection | [usage/README.md](usage/README.md) |
| Service snapshots | `inventory/`, `scripts/refresh-inventory.mjs` |
| Skill pins | `ecosystem-skills/MANIFEST.json`, `ecosystem-skills/update.sh` |
| Worker bindings and compatibility flags | `wrangler.jsonc` |

## 1. Requests, authorization, and `search`

### Request routes and authorization

`src/server.ts` handles every Worker request. `raven.stellar.org` is canonical; `raven.stellar.buzz` and `agents.stellar.buzz` are alias hosts ([src/hosts.ts](src/hosts.ts)). Alias browser pages `308` to the canonical host; `/mcp`, `/.well-known/`, and exact `/register`, `/authorize`, `/callback`, and `/token` routes stay on each alias so issuer, resource, consent cookies, and WorkOS callbacks stay same-origin.

Each production origin has a module-scoped OAuth provider whose single resource is `<origin>/mcp`, binding its tokens and grants (an unbound grant binds on first refresh; an unbound access token stays valid on all three origins until it expires, ≤1 hour; see the [OAuth per-origin design record](.agents/rounds/2026-11-16-next-phase/items/7.3/pr4-oauth/DESIGN.md)). `selectOAuthOrigin` ([src/hosts.ts](src/hosts.ts)) inspects `request.url` origin only—never `Host` or forwarding headers—after alias redirects and API-key/dev MCP bypasses. Any unsupported origin (e.g. a production hostname over `http:` or non-default port) gets `404` before the Playground, any provider, or WorkOS runs. Loopback dev (`http:` on `localhost`, `127.0.0.1`, `[::1]`, any port) builds a provider per request. Every dispatch passes a copied `env` with `OAUTH_PROVIDER` cleared so shared `env` is never mutated. Only `/.well-known/oauth-protected-resource/mcp` is served; the bare-origin path returns `404`.

`/mcp` checks authorization in order:

1. `authenticateApiKey`: `Authorization: Bearer <name>:<token>` compared by digest against `OAUTH_KV`; invalid or unavailable records fall through to OAuth.
2. `allowDevUnauthenticated`: requires `DEV_ALLOW_UNAUTHENTICATED === "true"` and a loopback host.
3. `@cloudflare/workers-oauth-provider`: validates OAuth tokens and supplies grant properties.

Raven is the OAuth authorization server (opaque tokens in `OAUTH_KV`, DCR, S256-PKCE, CIMD). WorkOS AuthKit authenticates users via `/authorize` and `/callback` ([src/auth/workos.ts](src/auth/workos.ts)). Encrypted grant properties store only the peppered subject and OAuth client ID; WorkOS access tokens are discarded after exchange. Metadata aliases map supported discovery paths to the provider's metadata endpoint.

Callback URIs are narrowed by an allowlist in [src/auth/redirects.ts](src/auth/redirects.ts): `https:`, loopback `http:`, and native schemes `claude:`, `cursor:`, `warp:` (`allowPrivateUseRedirectUris` is enabled so those three work while blocking arbitrary OS handlers like `smb:` or `ms-settings:`):

- **Registration** rejects malformed or remote `http:` URIs and any client with zero allowlisted URIs (other listed URIs are tolerated alongside an allowlisted one).
- **Authorization** enforces the allowlist on both `/authorize` legs, error redirects, and the parked request in `/callback` (after state and browser-binding checks, before WorkOS exchange), covering CIMD and older registrations.
- **Refusal** returns a local `400` with no `Location` and no WorkOS hop, logging `auth_reject` with `redirect_refused:<scheme>` (bounded scheme token, never the URI). Native-app scheme ownership stays unverified under open registration; the script-free consent page labels the client name unverified, displays the full validated return URI, requires CSRF + Terms consent, and ties login to the browser via bound WorkOS state. Cancel validates CSRF, clears the consent cookie, creates no grant, and returns `303 access_denied` preserving state and issuer. The provider's `onError` hook logs `oauth_error` with status, code, and internal `category`/`reason` (never description).

### Public site and Playground

The OAuth default handler serves `/`, `/docs`, `/terms`, `/robots.txt`, `/sitemap.xml`, `/og.png` ([src/site.ts](src/site.ts)), plus `/health` and `/health/skills`. Generated fonts and `/og.png` are bundled; static brand/listing images in `public/` are served as Wrangler static assets with `public/_headers` before the Worker runs.

`src/server.ts` intercepts `/playground` before the OAuth handler. Unauthenticated visitors see a static example and WorkOS login; signed-in users call `/playground/chat` via a signed session cookie using the same `search`/`execute` runner ([src/demo/tools.ts](src/demo/tools.ts)) under section 7 limits. The browser sends page-memory history each turn; the server clamps to history caps and keeps tool trace frames out of replay. `prepareStep` reserves the final step for tool-free synthesis, host-observed outcomes drive bounded recovery, and later searches cannot erase grounded execute evidence.

### MCP tool handling

Each authorized `/mcp` request creates a stateless `McpServer` served via `createMcpHandler` (streamable HTTP, no Durable Objects or server-side sessions). Browser `Origin` headers are checked against configured and loopback hosts; requests without `Origin` remain valid.

[src/mcp/tools.ts](src/mcp/tools.ts) owns tool schemas, descriptions, and `SERVER_INSTRUCTIONS`:

- **Client-cut caps** ([mcp-tool-metadata.ts](test/helpers/mcp-tool-metadata.ts)): whole instructions and each tool description stay ≤2,033 chars (smallest measured client cut); instructions open with a ≤200-char sentence, descriptions with a ≤117-char sentence.
- **Generated text**: `SEARCH_OPENING` and `FAMILY_LINE` (no operation chains) are emitted from the manifest by [build-family-text.mjs](scripts/build-family-text.mjs); builds fail if `SEARCH_OPENING` exceeds 117 chars. `BASE_SERVER_INSTRUCTIONS` is the entire served instructions string.
- **Scripting rules and links**: `execute` states three up-front rules (call operation IDs inside the script, not as top-level tools; only globals are `lumenloop`, `scout`, `stellarDocs`, `stellarOrg`, `codemode`, and standard JS; artifact reads use the same envelope). Other mechanical mistakes are taught by host errors ([script-hints.ts](src/executor/script-hints.ts)). Upstream docs URLs for Lumenloop, Scout, and Stellar Docs ride last on `search` only.

Both MCP and sandbox search share `prepareCatalogSearch` ([search-resolution.ts](src/catalog/search-resolution.ts)). The MCP `search` tool returns matching text and `structuredContent` (no advertised `outputSchema`):

```text
{ hits, total, truncated, recovery, widerCandidates,
  confidence, recoveryMetadata, nextSteps }
```

Public cards render each hit with a ≤220-char description, input-only signature, and (for operations) payload field names (`outputKeys`, `outputItemKeys`); `codemode.describe(id)` returns full prose and types. Operations whose key caveat would be clipped carry a one-line `cardCaveat` ([card-caveats.mjs](scripts/catalog-data/card-caveats.mjs)) appended inside the 220-char budget (never scored). Sandbox `codemode.search` keeps full entries. Successful `nextSteps` stay ≤400 chars (a build-playbook page without wider-candidate advice adds one prior-art sentence); error `nextSteps` echo invalid `service`/`recoverFrom` values without a cap. Unknown services yield zero MCP hits naming valid services (sandbox returns an error envelope); no spelling aliases exist. `getCatalog()` validates the manifest once per isolate.

## 2. The scoring pipeline

[src/catalog/README.md](src/catalog/README.md) defines the full rules; [ADR-0009](research/decisions/0009-discovery-stays-lexical.md) records why discovery stays lexical. Stages:

1. Vendored lexical scorer + token-coverage gate; [scoring.ts](src/catalog/scoring.ts) adds stopword rescue, query aliases, weighted keywords, and kind weighting.
2. Routing metadata adds operation vocabulary and rejects contradictory intent. Whole skills enter search only with independent admission evidence; sections carry `searchable: false` (exact-ID navigation only).
3. `searchCatalogPage` selects a service-diverse page of gated candidates; ungated backfill can fill short pages or make bounded replacements.
4. Membership fixes before ordering; every hit carries `tier: "gated" | "backfill"`. Hit order is authoritative, not raw score.

`total` and `truncated` reflect catalog navigation, not upstream completeness. `widerCandidates` and `recovery` are advisory and separate from hits ([ADR-0007](research/decisions/0007-structural-recovery-guidance.md)). `detail` edges (e.g., Docs search → `stellarDocs.get_doc_page`) are skipped in search advice and emitted instead by the evidence checkpoint when a Docs search returns rows without a page read in the same `execute` (not counted against Playground's one recovery-advice cycle). Oversized output types in catalog/sandbox entries collapse to a `codemode.describe` stub; the manifest keeps full schemas.

## 3. An `execute` call, end to end

`execute` takes non-empty `{ code }`. `src/server.ts` and the Playground inject the Worker-only runner so plain-Node modules can import tool registration without `cloudflare:workers`. [createExecuteRunner](src/executor/run.ts) runs normalized async code via `@cloudflare/codemode`'s `DynamicWorkerExecutor` in a fresh `LOADER` isolate with `globalOutbound: null` and a wall-clock timeout (`cpuMs` and `subRequests` are not exposed by the executor interface).

[buildSandbox](src/executor/providers.ts) binds one function per manifest operation under its service namespace (function name = terminal ID segment; unknown names fail via proxy). Excluded operations do not exist. Every service call follows:

```text
manifest entry → argument guard (splitting documented comma arrays first) → adapter → normalization → secret redaction
```

Model code supplies arguments; the manifest owns endpoint, credential mapping, and schema. Providers keep per-execute ledgers; module caches reuse catalog views and resolved specs. Each run wraps in a `codemode.execute` span and emits an `op` event per call with identity, outcome, timing, `attempts` (counting Docs `/index` retries, site probes, and stellar.org redirects), and `finalStatus` (HTTP status, `timeout`, `network`, or `none`). Failures return `isError: true` and bounded text; MCP `execute` emits text `content` only (no `structuredContent` or `outputSchema`).

### Result, log, and error boundaries

The host redacts the result, escapes reserved footer markers, and cuts at `4 * maxTokens` chars (`truncateForModel`). A bounded footer (≤1,600 chars, separate budget) appends after truncation, any ok service call, or any error call (soft-empty alone does not trigger one):

- `--- SOURCE BASIS ---` marks truncated results; `--- SOURCE METADATA ---` marks untruncated footers.
- Clean ok-only runs (untruncated, no errors, no captured source metadata) use a compact footer: marker, `calls:`, `observedAt:`, and `guidance:`.
- Full footers include shape/loss facts, call outcomes (`[caveat: no-rows]`, `[caveat: unverified-match]`, `exact: <key>`), latest `observedAt:`, source metadata, sanitized URLs, and artifact state (unavailable artifacts get narrower-rerun advice). Totals retain caveat counts even when per-call entries are dropped for budget.
- Failed calls carry ≤64-char fixed-label reasons (declared parameter names only; no upstream text or argument values).

Logs and thrown errors use separate token budgets and never write artifacts. `shapeLogs` redacts each console line before clipping it, then the MCP boundary applies the log token cap; structural log loss emits `execute_logs_shaped` without payload previews.

### Artifact/source-basis lane

Only truncated results write artifacts via [src/artifacts/store.ts](src/artifacts/store.ts). The R2 body is the redacted result string under `art/<ownerHash>/<id>`; custom metadata holds MIME type, sizing, digest, expiry, `requestId`/`rayId` (audit references), catalog time, and a bounded op ledger.

`src/server.ts` derives the owner from OAuth `ctx.props` (`authSubjectFromProps` → `resolveArtifactOwner`), or `dev-local` on loopback dev; API-key and Playground calls are ownerless. Full untruncated footers report `absent (not-truncated)`. `codemode.artifact.info(id)` and `codemode.artifact.read(id)` use service envelopes, enforce ownership and expiry, and still pass final script output through the result boundary.

## 4. The envelope contract

Service operations, skill reads, and skill runners return:

```text
{ ok: true, data }
{ ok: false, error: { service, kind, message, status?, code?, hint? } }
```

`kind` is `"error" | "soft-empty"` ([src/adapters/types.ts](src/adapters/types.ts)). Neither `soft-empty` nor an empty `ok: true` payload proves open-world absence.

The dispatcher ([src/executor/providers.ts](src/executor/providers.ts)) enriches ok service calls to `{ ok: true, data, asOf, asOfBasis, caveat?, exactRows? }` (never added to errors, skill reads/runs, or artifact reads):

- **`asOf` / `asOfBasis`**: first parseable date at allowlisted `dataAsOf` then `asOf` (payload root before `meta`; never `generatedAt`), else host arrival time with `asOfBasis: "observed"`.
- **`caveat`**: `"no-rows"` when `hasServiceData` finds no rows or scalar detail (still valid data at closed-world scope); `"unverified-match"` when rows come from a `semantic`, `research`, or `av` lane or `matchMode`/`match_mode` is `"semantic"`/`"corrected"`. Shares no words with `soft-empty` and never judges relevance. Run-level `candidateEvidence` counts `"unverified-match"` calls.
- **`exactRows`**: optional `[{ index, key }]` on `semantic`/`research`/`av` hits when three host checks agree (ignoring upstream `exactKeys` and not checking URL host): `q`/`query` contains an all-upper or all-lower identifier `<letters>[- ]?<1–6 digits>` not joined by `-`/`.` to adjacent digits ([identifier-token.ts](src/policy/identifier-token.ts)); row `source` matches `<letters>` case-insensitively; and the last URL path segment (sans extension) matches `<letters>-<number>` ignoring leading zeros. Leaves `caveat` and `data` unchanged; [exact-evidence.ts](src/policy/exact-evidence.ts) appends one generated exception sentence per exact row to the candidate-evidence block.
- **Corroboration guard**: generated into [corroboration.ts](src/policy/corroboration.ts) from `CORROBORATING_FAMILIES` (`stellarDocs`, `skills` in `scripts/catalog-data/source-families.mjs`). States that audit, incident, governance, and standards-authorship claims are fact only when an exempt family or returned primary record states them; otherwise attribute by source and date. Ends the candidate-evidence block (before exact-row exceptions), or stands alone whenever a run returned rows from a non-corroborating family (`uncorroboratedEvidence`) and neither the candidate block nor `PRIOR-ART` rendered ([`candidateEvidenceSection`](src/policy/evidence-checkpoint.ts), shared by MCP and Playground).

**Scout partial reads**: HTTP 200 with boolean `meta.partial === true` or a `meta.warnings` entry starting with case-sensitive `backend read failed` (followed by whitespace, `:`, or end of string) maps to `ok: false`, `kind: "error"`, `status: 200`, even when rows are present. Message uses the first matching warning, else `meta.failedReads`, else a generic partial notice; arrays survive in `error.details.warnings`/`failedReads` with one-retry guidance. Takes priority over `meta.error` (otherwise `soft-empty`); other warnings remain in `data`.

The prelude installs non-enumerable accessors to catch wrong-level reads (provider RPC cannot serialize a `Proxy`):

| Access | Successful envelope | Failed envelope |
| --- | --- | --- |
| Payload key on envelope (e.g. `r.projects`) | Throws naming `r.data.projects` | No payload-key trap |
| `r.data` | Returns data | Returns `undefined` and emits one warning |
| Assignment to guarded property | Writes through as plain property | Warns where applicable, then writes through |
| `r.error` | `undefined` | Returns error |

Enumerable keys, spreads, JSON, and returned envelopes stay ordinary. Skill reads share this guard.

## 5. Discovery inside the sandbox

[providers.ts](src/executor/providers.ts) exposes `codemode` (flat host functions wrapped as nested helpers in the prelude):

| Helper | Contract |
| --- | --- |
| `codemode.spec()` | Unified spec with cached resolved refs |
| `codemode.search(queryOrOpts)` | Ranked hits, counts, tiers, confidence, recovery advice; invalid filters/IDs return errors |
| `codemode.catalog({ kind?, service?, compact? })` | Manifest entries without transport/provenance (`compact: true` omits schemas) |
| `codemode.describe(id)` | Exact-ID full schemas, signatures, sections, and usage notes |
| `codemode.skill.read(name, { sections? })` | Pinned playbook or sections under `data` with exact source URLs |
| `codemode.skill.run(name, input)` | Registered first-party runner returning a service envelope |
| `codemode.artifact.info(id)` / `codemode.artifact.read(id)` | Owner-bound metadata or data returning service envelopes |

The super spec uses `/{service}/{operation}` paths, manifest-derived skill/runner indexes, and detail-helper stubs for oversized output schemas so scripts can inspect it without dumping it to the model ([ADR-0001](research/decisions/0001-search-tool-shape.md)).

## 6. Skill splitting — pins → sections → reads

See [src/skills/README.md](src/skills/README.md) for read/integrity/runner contracts and [ecosystem-skills/README.md](ecosystem-skills/README.md) for pin updates. `ecosystem-skills/MANIFEST.json` pins upstream commits and digests; Raven forwards bodies rather than mirroring or bundling them, and transport caches are never the source of record. Sections stay out of default search and resolve by exact ID.

### Availability posture

Skill reads depend on upstream files at their pinned commits—an accepted, observable risk monitored via `skill_read` error events, the daily cache-bypassing pin check (`check-mirrors.mjs --fetch`), and the hourly Worker canary published at `GET /health/skills`. Diagnose failures rather than mirroring content.

### Runners

Skill runners execute reviewed first-party code on the host outside the sandbox. `RUNNERS` defines exact runnable IDs, schemas, and declared ops; a runner receives only its declared op functions and validated input.

## 7. Operating limits and caps

Code constants are authoritative; update this matrix when they change. Retention, deletion, and release rules live in [docs/operations.md](docs/operations.md). AI Gateway account caps are separate dashboard config.

### Shared by the Playground and MCP

| Area | Limit or behavior | Source |
| --- | --- | --- |
| Execute sandbox | Fresh isolate, `globalOutbound: null`, 60s timeout | [run.ts](src/executor/run.ts) |
| Service arguments | Validated against manifest schema before dispatch | [guard.ts](src/policy/guard.ts), [validate.ts](src/policy/validate.ts) |
| Result body cut | Default 6,000 tokens (4 chars/token); separate footer budget | [truncate.ts](src/policy/truncate.ts), [source-basis.ts](src/policy/source-basis.ts) |
| Budget override | `EXECUTE_MODEL_BOUNDARY_MAX_TOKENS`: 1,000–32,000 (invalid → default) | [truncate.ts](src/policy/truncate.ts) |
| Logs | First 100 lines; redact before clipping each to 2,000 chars, then combined token cap | [shape-logs.ts](src/executor/shape-logs.ts) |
| Error text | Same token cap as result bodies | [tools.ts](src/mcp/tools.ts) |
| Operation call | 24s wall-clock per call (`OPERATION_BUDGET_MS`), shared across all attempts, retries, redirects, and probes (three sequential hung calls still exceed 60s `execute`; one uses 24s of a 30s runner) | [types.ts](src/adapters/types.ts) |
| Skill file load | 20s per file; 8s fetch attempts, 1 retry | [source.ts](src/skills/source.ts), [store.ts](src/skills/store.ts) |
| Skill runner | 30s host deadline (in-flight ops continue detached) | [run.ts](src/skills/run.ts) |

### Playground-only `/playground/chat`

Method, origin, auth, body size, and message shape are validated before consuming hourly allowance; a valid turn consumes allowance even if execution later fails. Signed cookies hold the peppered WorkOS subject (`dev-loopback` on loopback dev).

| Area | Limit or behavior | Source |
| --- | --- | --- |
| Hourly allowance | 30 chats/subject/UTC hour (best-effort KV; concurrent requests may slightly exceed) | [budget.ts](src/demo/budget.ts) |
| Rate response | `429`, `Retry-After: 3600` | [chat.ts](src/demo/chat.ts) |
| Request body | 384 KiB before JSON parse | [chat.ts](src/demo/chat.ts) |
| Replay history | Newest 20 messages, ≤24,000 chars when possible (always keeps final message) | [budget.ts](src/demo/budget.ts) |
| User message | 8,000 chars (composer blocks; server returns `400 message_too_long`) | [budget.ts](src/demo/budget.ts), [page.ts](src/demo/page.ts) |
| Whole turn | 120s abort signal | [chat.ts](src/demo/chat.ts) |
| Model steps | 7 (final step has no active tools) | [steps.ts](src/demo/steps.ts) |
| Model output | 4,096 output tokens | [budget.ts](src/demo/budget.ts) |
| Search calls / page | 3/turn; default 5 hits, max 6 | [budget.ts](src/demo/budget.ts), [tools.ts](src/demo/tools.ts) |
| Hit text | 220-char description; 400-char signature preserving callable line | [tools.ts](src/demo/tools.ts) |
| Execute calls / code | 3/turn; 8,000 chars; rejects `Promise.all({ ... })` before running | [budget.ts](src/demo/budget.ts), [tools.ts](src/demo/tools.ts) |
| Recovery | ≤1 hint-driven cycle/turn (structural failure recovery stays active) | [steps.ts](src/demo/steps.ts) |
| Artifacts | None (ownerless) | [tools.ts](src/demo/tools.ts) |

### MCP-only `/mcp`

| Area | Limit or behavior | Source |
| --- | --- | --- |
| Search page | Default 7 (`SEARCH_DEFAULT_LIMIT`), max 50 ([catalog defaults](src/catalog/README.md#search-interfaces)) | [tools.ts](src/mcp/tools.ts), [search.ts](src/catalog/search.ts) |
| Execute code / tool calls | Non-empty string; no application length or per-session call cap | [tools.ts](src/mcp/tools.ts), [server.ts](src/server.ts) |
| Refresh grant | Fixed window; rotation does not extend it ([retention](docs/operations.md#data-retention)) | [gate.ts](src/auth/gate.ts) |
| Identity revalidation | WorkOS runs at browser auth; later WorkOS changes do not synchronously revoke grants | [workos.ts](src/auth/workos.ts) |
| Artifact owners / limits | OAuth subjects and loopback `dev-local`; ≤2 MiB body; ≤8,192 B metadata (first 12 calls, 180-char op names); per execute: 8 `info`, 4 `read` | [server.ts](src/server.ts), [store.ts](src/artifacts/store.ts), [providers.ts](src/executor/providers.ts) |

### Usage collection

The separate `stellar-raven-usage` Tail Worker writes tool-response metadata to private D1 (no D1 binding on the producer or sandbox), excluding queries, answers, code, headers, protocol traffic, and raw account IDs, with API-key rows separated from user counts. See [usage/README.md](usage/README.md) and [docs/operations.md](docs/operations.md#data-retention).

## 8. Build & refresh chain — keeping the catalog honest

Generated files come from scripts, never hand edits. The manifest defines the exposed surface ([ADR-0003](research/decisions/0003-build-time-exposure-filtering.md)).

| Inputs | Builder | Output |
| --- | --- | --- |
| Service snapshots, authored docs/stellar.org specs, title snapshot, skill pins/files, runner registry | `scripts/build-catalog.mjs` | `catalog/manifest.json` |
| Manifest, authored family line, corroborating families | `scripts/build-family-text.mjs` | `src/mcp/family-text.ts` (`FAMILY_LINE`, `SEARCH_OPENING`), `src/policy/corroboration.ts` |
| Manifest, service mappings, runner registry | `scripts/build-super-spec.mjs` | `specs/super-spec.json` |

`build-catalog.mjs` fetches pinned skill files (via a gitignored cache), verifies both digests, scopes `inventory/stellar-docs-titles.json` by each docs op's `mintlify.include`, and produces deterministic output (sorted keys, input-derived timestamps). Docs ops come from `specs/stellar-docs.json` ([docs/stellar-docs.md](docs/stellar-docs.md)); stellar.org ops come from `specs/stellar-org.json` ([stellar-org.ts](src/adapters/stellar-org.ts) pins origin, guards paths, follows same-origin redirects only, caps size; measurements in [research/services/stellar-org-site.md](research/services/stellar-org-site.md)).

`src/policy/scout-exposure.ts` owns Scout exclusions; `scripts/exposure.mjs` owns all other exclusion lists. Builders fail on stale exclusions, unresolved retirements, orphaned notes, missing pinned files or build-authority IDs, non-exposed refs in model-facing text, runnable-schema mismatches, or stale generated outputs. Pin updates require body-diff review ([ecosystem-skills/README.md](ecosystem-skills/README.md)).

[ci.yml](.github/workflows/ci.yml) runs typecheck, bundle builds, unit tests, offline smoke tests (pinned skills served locally), eval contracts, routing gates, and artifact byte-sync (rebuilding catalog, family text and corroboration guard, super spec, globes, skill index, and eval artifacts). [refresh.yml](.github/workflows/refresh.yml) checks live inventories (by op-ID set, not version string), docs titles/anchors, skill pins/availability, and the Worker canary daily ([docs/operations.md](docs/operations.md#scheduled-workflows)).

## 9. Observability

[src/observability.ts](src/observability.ts) enforces no-payload logging across events and spans (no queries, code, payloads, answers, secrets, or provider-error messages; [ADR-0004](research/decisions/0004-correlation-id-continuity.md) removed `correlationId`—Ray IDs join logs and spans):

- `mcp_request`: access mode, status, timing, request ID, normalized Ray ID; OAuth uses `subjectHash` and secret-keyed `clientHash` (null if unattributed); API-key logs validated key name and null OAuth fields; rejected bearers omit identity. Network/geo/TLS never become identity.
- Search events: query size, limits, counts, tiers, recovery IDs, response size, timing.
- Execute events: outcomes, sizing, truncation, artifact use, bounded `sourceBasis` (`calls.first` carries telemetry-only `attempts` and `finalStatus`), per-service `sources` (calls, attempts, outcomes, status buckets `2xx`, `3xx`, `4xx`, `429`, `5xx`, `timeout`, `network`, `none`; exact statuses stay on `op`), and `errorName` (`null` on success, else `SyntaxError`, `TypeError`, `ReferenceError`, `timeout`, or `other`, also set as `sandbox.errorName` on `codemode.execute`; classified from `@cloudflare/codemode`'s `err.message` via [script-hints.ts](src/executor/script-hints.ts), so model-thrown matching text can misclassify).
- Op, runner, and `skill_read` events: IDs, outcomes, timing (`skill_read` distinguishes `memo`, `cache`, `upstream`).

Procedures live in [cloudflare-observability-review](.agents/skills/cloudflare-observability-review/SKILL.md).

## 10. Evals

[eval/EVALS.md](eval/EVALS.md) owns instruments, reporting rules, and denominators; [eval/gates.json](eval/gates.json) defines routing thresholds. Routing gates catalog discovery; the QA battery tests search, execution, and grounding together; discovery, plan, Playground, and live-data instruments give separate diagnostics without sharing a combined denominator.
