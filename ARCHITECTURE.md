# Architecture — how `search` and `execute` actually work

The end-to-end mechanics of the two tools, verified against the code as of 2026-07-03
(`codemode.skill.run` surface added and code-verified 2026-07-06). Read
[`PLAN.md`](./PLAN.md) first for *why* the design is shaped this way; this doc is the *how*,
with file paths for every claim. Nothing here is aspirational — if the code moves, this doc
is wrong until refreshed.

Two tools, one Worker: `search` is a host-side ranked query over a generated catalog;
`execute` runs LLM-authored JavaScript in a network-less Dynamic Worker isolate whose only
I/O is host-RPC stubs that hold the secrets and enforce the policy.

## 1. A `search` call, end to end

Every request enters `src/server.ts` (`export default { fetch }` — the only Worker entry).
For `/mcp` paths the auth gate runs in this order:

1. **Named API key** — `authenticateApiKey` in `src/auth/api-keys.ts` accepts only
   `Authorization: Bearer <name>:<token>`, validates lowercase names and 43-character
   base64url tokens, then reads the SHA-256 token digest from
   `raven:api-key:v1:<name>` in `OAUTH_KV` and compares it timing-safely. Unknown,
   malformed, mismatched, or unavailable KV records fall through to OAuth.
2. **Local-dev bypass** — `allowDevUnauthenticated`: requires `DEV_ALLOW_UNAUTHENTICATED`
   to be the exact string `"true"` **and** the request hostname to be loopback
   (`localhost` / `127.0.0.1` / `::1`). The hostname gate is a hard second factor: a var
   mistakenly deployed to production is inert, because no production host — `raven.stellar.org`
   or any retired hostname still routed to it — is a local host. The var itself
   is only ever set in
   `.dev.vars`.
3. **OAuth** — everything else goes through `@cloudflare/workers-oauth-provider`
   (options built by `oauthProviderOptions` in `src/auth/gate.ts`): the Worker is its own
   OAuth 2.1 authorization server (opaque tokens in `OAUTH_KV`, S256-PKCE only, CIMD
   enabled), with WorkOS AuthKit as the upstream IdP behind `/authorize` → `/callback`
   (`src/auth/workos.ts`). `src/server.ts` also aliases the path-suffixed RFC 8414 and OIDC
   discovery paths onto the lib's exact-path metadata endpoint.

**Non-`/mcp` requests are the public site.** Everything the OAuth provider doesn't claim falls
through to its `defaultHandler` (`src/auth/workos.ts`), which — besides `/authorize` /
`/callback` / the consent page — serves the public site from `src/site.ts`: the landing page,
`/docs`, `/terms`, `robots.txt`, `sitemap.xml`, JSON-LD, and `/og.png`. The OG image and the
site/OG fonts are **generated code** (`src/og.ts`, `src/fonts.ts`, rebuilt via `npm run site:og` /
`npm run site:fonts`), embedded in the Worker bundle. Repository presentation images live under
`assets/repo/`; there is no Wrangler static-assets directory.

`/playground` is the browser playground surface, intercepted before the OAuth provider's default
handler in `src/server.ts`. The page (`src/demo/page.ts`) is cookie-gated through WorkOS:
unauthenticated users see a static example trace and `/playground/login`; authenticated users get
a same-origin SSE chat UI backed by `/playground/chat`. The chat handler (`src/demo/chat.ts`) runs the
same host-side catalog search and execute runner through AI SDK tools (`src/demo/tools.ts`),
with demo-only caps from `DEMO_CAPS` for step count, search/execute call counts, execute code
length, replay history, output tokens, and hourly KV throttle; AI Gateway spend/rate posture is
configured separately through the demo gateway binding/config.
The bundled browser client keeps replayed history in page memory, not Worker storage: each new turn
posts its current `user`/`assistant` message list back to `/playground/chat`, then the server clamps that
list to the newest 20 messages and drops oldest messages until it is within the 24k total-content
budget when possible, always keeping the final new message. In the bundled client, tool trace frames
(`search`/`execute` inputs, outputs, logs, and cards) are display-only and are not replayed on later
turns except to the extent the assistant's final text summarized them.
The playground receives the same production `SERVER_INSTRUCTIONS` source-family micro-map and
in-script discovery helpers (`codemode.search/describe/catalog/spec`) as `/mcp`; its public-demo
boundary is enforced by the outer step, tool-call, output, code-size, timeout, auth, and rate caps.
A narrow AI SDK `prepareStep` policy reserves the final step for tool-free synthesis and asks for
recovery only after structural navigation/failure/truncation signals or a host-observed execute
ledger containing no successful operation with structurally positive service data. It also carries
forward a conditional evidence checkpoint when the latest successful execute used only narrow,
operation-scoped lookups. The checkpoint names exact catalog recovery candidates but preserves the
closed-world stopping rule; a later search cannot erase already-grounded execute evidence.


Each authorized request gets a **fresh, stateless `McpServer`** (MCP SDK 2.0,
`@modelcontextprotocol/server`) served over streamable HTTP by `createMcpHandler` (from
`agents/mcp`) — no Durable Objects, no session state. The handler serves both wire eras:
the 2026-07-28 revision (`server/discover` negotiation, pinned end-to-end by
`test/smoke/mcp-modern-client.test.ts`) and the 2025 `initialize` lifecycle via its built-in
stateless legacy fallback. Custom domains skip the SDK's Host allowlist (Cloudflare routing
is the Host authority). Browser Origins are explicitly allowlisted for the production hostnames
(`raven.stellar.org` plus the retired hostnames still routed to it) and the localhost class; foreign
Origins are rejected. Requests without an Origin header — ordinary
non-browser MCP clients — still pass Origin validation. Tool
registration and all model-facing prose live in `src/mcp/tools.ts`; the initialize-time
`SERVER_INSTRUCTIONS` (workflow + envelope contract + generated source-family micro-map)
ride along because clients surface them in the system prompt, where they outlive per-tool
descriptions. Claude Code truncates tool descriptions and injected server instructions at 2KB.
The server-instructions boundary measures 2,048 characters in production (todo 971), so
`BASE_SERVER_INSTRUCTIONS` — everything before the
micro-map — must stay a complete, self-sufficient contract within a 2,000-character budget
(guarded by `test/mcp-instructions.test.ts`); the micro-map after it is bonus for
full-injection clients only. The dated [execute output contract review](research/execute-output-contract-2026-08-20.md)
records the client evidence. The micro-map is generated from
`scripts/catalog-data/workflow-archetypes.mjs` by `scripts/build-micro-map.mjs`; it orients
agents to the Lumenloop, Scout, Stellar Docs, and skills families without adding
per-operation cards or changing the catalog shape.

Every handled `/mcp` invocation emits one `mcp_request` summary after its response status is
known. Its `accessMode` avoids Cloudflare's automatic redaction of fields named `auth`. OAuth
summaries carry a 16-hex `subjectHash` compatible with playground/artifact joins and,
for grants issued after client attribution was added, a versioned secret-keyed `clientHash` derived
from the OAuth client id stored in encrypted grant props. Older grants report a null client hash;
named-key summaries carry `accessMode: "api-key"` plus the validated `apiKeyName`; API-key/dev
bypasses have null OAuth identity fields, and rejected bearer requests omit identity fields. The
summary also records a colo-stripped Ray ID and app request UUID. Child search/execute/op events and
OTel spans join through Cloudflare request/Ray metadata instead of repeating high-cardinality user
fields. Network/geo/TLS fields are never promoted into an app user fingerprint
(`src/observability-request.ts`, `.agents/skills/cloudflare-observability-review/`).

Both primary search adapters use `prepareCatalogSearch(catalog, service)` from
`src/catalog/search-resolution.ts`. The MCP adapter supplies `getCatalog()` and the sandbox adapter
supplies its injected catalog. The neutral interface has three stages. The service stage calls
`catalogServices` once and returns either an `unknown-service` issue or the recovery-ID stage. The
recovery-ID stage builds one exposed-operation ID set and returns either an
`unknown-recovery-ids` issue with the rejected exact IDs or the final resolution stage. The final
resolution stage calls `searchCatalogPage` once and calls `recoveryCandidates` only when the caller
supplied recovery IDs. It returns neutral page and recovery facts. The interface goes no deeper
because prose, schemas, envelopes, limits, and telemetry do not belong in this module.

The MCP tool keeps its Zod schemas, exact response text and shape, and telemetry. The sandbox
adapter keeps its raw-input checks, error envelopes, exact messages, limit normalization, and
telemetry. Its external order remains query, kind, service, `recoverFrom` shape, unknown recovery
IDs, reason, then page and recovery resolution. An unknown reason therefore returns before
`searchCatalogPage` or `recoveryCandidates` runs. `getCatalog()` (`src/catalog/load.ts`) imports the
generated `catalog/manifest.json` as a bundled JSON module and validates it once per isolate via
`loadManifest` — a malformed manifest throws loudly at first use, never softens. The
response is `{ hits, total, truncated, recovery, widerCandidates, confidence, recoveryMetadata,
nextSteps }` (as both `text` and
`structuredContent`): `total` counts every distinct catalog entry the consulted scorer
tiers matched (post-filter, pre-paging), `truncated` = `total > hits.length` (retry with a
higher `limit`, the other candidate family, or varied vocabulary), and
`nextSteps` is a server-authored hint that restates the compose-in-one-script workflow and
the envelope rule on every call. `prepareCatalogSearch` validates the `service` filter against
the catalog's real service set (`catalogServices`). An unknown value ("stellardocs",
"stellar-docs") becomes a structured issue instead of a silently-empty page. The MCP adapter maps
that issue to zero hits and a `nextSteps` value that names the valid services. The sandbox adapter
maps the same issue to an error envelope that lists the valid services. The frozen
`searchCatalog` contract keeps filters silent. Each adapter maps structured service and recovery-ID
issues to its existing output. A `search` telemetry event (`src/observability.ts` → Workers Logs)
records `source`, `queryChars`, `requestedLimit`, `effectiveLimit`, `omittedCount`, `gatedHits`,
`backfillHits`, `hits`, `total`, `truncated`, `top`, `recovery`, `recoveryTop`, `widerCandidates`,
`widerCandidateTop`, `responseChars`, and `ms`. `responseChars` is the measurement that set
`COMPACT_OUTPUT_THRESHOLD`, §2. It stays on to verify that the compaction holds.

## 2. The scoring pipeline

Three layers, strictly separated:

**Vendored lexical scorer** — `src/catalog/vendor/search-scoring.ts`, adapted from
the unexported `searchConnectors` of the vendored `@cloudflare/codemode` snapshot (vendored
because it is not exported and the package's main entry imports `cloudflare:workers`; the
snapshot version is recorded per file in `src/catalog/vendor/*` and in `THIRD-PARTY-NOTICES.md`,
and is deliberately independent of the installed package version in `package.json`). Field weights: id 12,
name (last id segment) 10, service 8, description 5, kind 2. Per field: exact match ×14,
prefix ×9, phrase ×6, plus per-token hits (×4 exact token, ×2 prefix-overlap, ×1
substring). A **coverage gate** returns `null` (no hit) unless matched tokens cover 100% of
the query for ≤2-token queries, 60% otherwise — or an exact phrase matched. Bonuses: +25
full coverage, +8 first-token match, +20 exact id/name match. The math is upstream's,
untouched.

**Structural wrappers** — `src/catalog/scoring.ts`, ours, deliberately query-independent
(no per-question special cases):

1. *Stopword gate-rescue* — an entry that fails the coverage gate on the full query is
   rescored with closed-class English stopwords removed. Entries that already passed keep
   their exact vendor score (filtering stopwords for all scoring was tried and regressed).
2. *Kind weighting* — `skill-section` entries are scaled ×0.75 so near-duplicate
   fragments don't blanket-outrank the operations on shared topical vocabulary. (Since the
   2026-07-13 skills-form A/B all 173 section entries also carry `searchable: false` and
   never enter search at all — the weight only matters for experiment arms that re-enable
   them; see `eval/README.md` "Skills-form A/B".)
3. *Service diversity* — the returned set is selected with a per-service quota
   (`max(2, ceil(0.4 × limit))`, score order preserved, top hit never displaced,
   overflow backfills empty slots).
4. *Keyword blend* — skill-section entries carry build-time `keywords` distilled from the
   section body (`src/catalog/extract-keywords.ts`); the entry is scored twice (as-is and
   with keywords appended to the description) and the keyword-attributable delta blends in
   at 0.4 damping. The routing eval is the guard on this trade; changing the blend requires
   re-running it (`eval/EVALS.md`).
5. *Ungated backfill* (`scoreEntryWeightedUngated`) — the vendor coverage gate
   (`search-scoring.ts`, `<60%` token coverage and no exact phrase → `null`) is structurally
   unreachable for long multi-clause questions: at 20+ query tokens no single entry covers
   60% of the vocabulary, so the whole catalog gates to zero (the stopword rescue doesn't
   help — the surplus tokens are content words). `scoreEntryWeightedUngated` runs the same
   pipeline (keyword blend → stopword rescue → kind weight) over a **gate-free replica of the
   vendor math** — kept beside the vendor file, byte-for-byte except the coverage gate is
   dropped (the coverage *bonus* stays), the same way lever 4 double-scores rather than editing
   the vendor. `searchCatalog` uses it only to **backfill a short page** (below). Membership is
   gated-first, then the fixed page is interleaved on the shared score scale: a backfill hit may
   move above adjacent gated hits only when it dominates by at least 1.6×. A page the gated tier
   fills remains byte-identical to the pre-lever-5 behavior.

**Set shaping** — `src/catalog/search.ts`. `loadManifest` enforces structural invariants at
load: globally unique entry ids, and unique operation terminal names per service (those
segments become sandbox function names in `src/executor/providers.ts`, so a collision would
silently shadow one operation with another). `searchCatalog` needs no exposure filter —
everything in the manifest is exposed by construction (ADR-0003,
`research/decisions/0003-build-time-exposure-filtering.md`: exclusions, including the old
`lumenloop.skill.*` twin namespace and the retired onboarding skills, are never emitted by
`scripts/build-catalog.mjs`). The page-shaping pipeline lives in `searchCatalogPage`
(returns `{ hits, total, truncated }`; `searchCatalog` is its thin `.hits` wrapper — the
frozen eval/vitest contract). It sorts score-desc then id-asc, and shapes the page in one
way:

- *Tiered gate-rescue backfill* — tier 1 is the pipeline above (levers 1–4). Only when it leaves
  the page short (fewer than `limit` gate-passing candidates exist — measured on long
  extended-lane questions that gate to zero) does tier 2 re-run the same pipeline under the
  ungated scorer (lever 5) and add its novel hits to complete membership. A full page is
  byte-identical to the pre-tiering behavior; a mixed page is then stably interleaved: a tier-2
  hit is promoted above adjacent tier-1 hits only while its score is at least
  `TIER_INTERLEAVE_MARGIN` (1.6×) times theirs, otherwise gated hits rank first. The drift guard
  in `test/scoring.test.ts` proves the ungated scorer equals the gated scorer wherever the gate
  passes, so `score` is one common scale across the seam. Every hit carries
  `tier: "gated" | "backfill"`, and hit order is the ranking to trust. Behavior changes only for
  long multi-clause queries that previously returned a short (or empty) page.
- `total` counts the distinct candidates the consulted tiers accepted (post kind/service
  filter, pre diversity/paging): tier-1 candidates alone when tier 1 filled the page, plus the
  novel ungated candidates when the backfill ran; `truncated` = `total > hits.length`.

**Evidence-poor recovery** is query-independent and deliberately outside the scorer
([ADR-0007](research/decisions/0007-structural-recovery-guidance.md)). Selected operation entries
carry a manifest-validated `retrievalProfile` whose exact-ID `recoverWith` edges name bounded wider,
cross-family, cited-research, or different-medium contingencies for `empty | weak | adjacent |
ambiguous | partial` outcomes. When an operation-search page has zero hits or only backfill hits,
public `search`, in-sandbox `codemode.search`, and Playground search return `confidence` and
`recoveryMetadata` with the ranked page. `confidence.topScoreGap` is an absolute difference and
includes both compared tiers because tier ordering can differ from score ordering.
`recoveryMetadata.serviceFilterExcludedSkills` identifies matching skills excluded only by a
non-skills service filter. These surfaces also return up to three advisory `widerCandidates`
separately from ranked hits. Page-resident broad operations lead on all-backfill
pages, then deterministic manifest anchors fill one slot per remaining broad lane; zero-hit pages
use anchors only. Service filters constrain the advice and skill-only searches suppress it. Public
`search`, in-sandbox `codemode.search`, and Playground search also accept caller-reported exact
prior operation ids in `recoverFrom` plus an optional `reason` and return `recovery` separately
from both `hits` and `widerCandidates`; omitted or empty `recoverFrom` always returns no recovery,
and a reason without IDs never escalates. All three projections validate exposed operation ids by
exact match before deriving candidates; the Playground applies its demo-only call budget first and
clips only candidate prose/signatures, preserving identity, relation, lane, reason, and output-shape
metadata. Normal hit membership, score, and order are therefore unchanged.

The host does not inspect arbitrary payload semantics, automatically execute a recovery, or claim
that a candidate is relevant. It only distinguishes positive rows or detail fields from empty
collections and metadata. Model-facing instructions and adapter hints then enforce the
answer-level rule: a closed-world directory/index miss can be reported only at that source's scope,
while an open-world identity/history/topic miss gets one broad pass; semantic candidates need exact
identity (or canonical slug), source, and date before attribution. A successful profiled
narrow operation may produce a `narrow-only` checkpoint, while a successful profiled broad
operation may produce a graph-derived `conditional-alternatives` checkpoint naming
only uncalled exposed operations. Its standalone copy says the host observed operation classes, not
row relevance, and recommends one bounded alternative pass only if the question remains unresolved.
Runs with no structurally positive successful operation use the independent empty-success,
no-host-evidence, or all-error/soft-empty recovery paths instead. The service envelope remains
unchanged. Playground exposes at most one hint-driven recovery cycle per turn; the latch
is consumed when its first standalone checkpoint is emitted, and a later execute supersedes any pending
next-step restatement so independent structural failure recovery remains truthful. Separately, the operation ledger counts calls to a small exact-ID set of
semantic, research, A/V, and fallback-directory surfaces and appends a candidate-evidence reminder
even when their envelopes are healthy; this is operation-class advice only and never inspects rows
or declares their relevance. The same formatter is used by `/mcp` and `/playground`. At the adapter boundary,
`lumenloop.search_content_semantic` is forward-normalized from upstream collection arrays to one
`{ items, counts, meta }` contract: every item carries its source `collection`, and items are stably
sorted by the upstream numeric similarity score. Cross-collection rows also expose conservative
canonical aliases for title, URL, snippet, source, and date while retaining all original fields;
`dateField` and `sourceField` identify the exact upstream fields selected so callers do not promote
a generic timestamp or source label into a stronger provenance claim. Its manifest and super-spec
schemas are generated from the same authored contract. Ranked operation hits and recovery
candidates carry schema-derived `outputKeys` and one-level `outputItemKeys` outside the rendered
signature, so the playground's signature clipping cannot hide the documented projection shape.
This prevents a model-authored projection from silently erasing a stronger row or guessing legacy
payload fields, without inspecting query semantics or claiming an identity match. When a
successful run used only `emptyScope: "operation"` lookups and no semantic, research, A/V, corpus,
or other candidate-evidence operation, the same ledger derives a conditional evidence checkpoint
from those operations' existing `recoverWith` edges. `/mcp` appends that checkpoint to the execute
result; `/playground` also carries it into the next-step system note. The model still inspects the
returned projection and may stop immediately for exact evidence or a named-source closed-world
question; the host does not reclassify payloads or auto-execute the suggested operation.

**Build-route prior-art preflight** is a separate, proactive composition rule, not an evidence-poor
recovery edge or a scorer override. A request that is still designing a new contract, app,
integration, protocol, or infrastructure component gets one bounded Scout repos/projects pass in
the same execute script, alongside the relevant skill and official Docs example. The pass exists to
surface requirements, pitfalls, and build-vs-integrate options before architecture is committed.
Known-step implementation, deployment, and debugging stay on skills plus official Docs. Repository
rank, stars, funding, and directory presence are discovery metadata only; prior art never supplies
API, security, license, audit, maintenance, or production authority. The model-facing contract lives
in the search/execute descriptions and generated workflow archetypes. The host also counts successful
calls to the exact Scout repo/project operation set. When the same execute read an exact whole-skill
manifest entry declaring a build-authority role (`contract`, `dapp`, `sdk-integration`, `protocol`,
or `infrastructure`)—the narrow host-visible signal for this design-stage composition—it appends a
compact answer-time reminder: no more than three candidates, with URLs, applicability,
provenance/freshness, limitations, and explicit unknowns for unsupported reuse claims. Other skill
reads are inert for this cue. An ordinary project-list or
landscape query receives no build-stage cap. This reminder classifies operation composition, not
payload relevance; the host neither auto-runs research nor blocks implementation.

**Hit anatomy**: `{ id, service, kind, score, tier, description }`, plus a rendered **TypeScript
signature** for operations *and runnable skills* (`renderSignature` — input/output
type declarations from the entry's JSON Schemas via the vendored type generator, and a
callable line that spells out the *full result envelope union*, because a bare
`Promise<Output>` teaches exactly the wrong-level access the envelope exists to prevent;
for a runnable skill the callable line is the exact `codemode.skill.run("<id>", …)` form —
§5), plus **`availableSections`** for skill hits (`sectionKeysOf` — the same key set
`readSkill` advertises; runnable-skill hits carry both). Non-runnable skills and sections
render no signature — their affordance is `skill.read`, not a call. Search hits render
signatures in **compact mode**: the input type and callable line are always full, but an
output type block over `COMPACT_OUTPUT_THRESHOLD` (2,000 chars — originally measured to trim
only the three Scout monsters, `searchProjects`/`searchRepos`/`explainRepo`, whose output
types ran to ~12.7KB and made a limit-10 page ~26KB with the bloat usually attached to an
off-target hit; upstream schema growth through Scout 1.8.28/1.8.30 has since carried 15 Scout
operations over the same unchanged threshold, with the exact set pinned in `test/search.test.ts`)
is replaced by a stub declaration keeping the type name and the output schema's
top-level field names (so payload field selection like `r.data.projects` still works from
the hit alone), pointing at `codemode.describe(id)` for the full shape. The compaction
wraps *around* the vendored renderer — the vendor file is untouched — and applies to
search hits only; `codemode.describe` always renders the full signature (§5).

## 3. An `execute` call, end to end

The tool takes `{ code }`. The runner is **injected** into `registerTools` by
`src/server.ts` (`createExecuteRunner(env)`, one per isolate) because
`src/executor/run.ts` imports `@cloudflare/codemode` → `cloudflare:workers`, which
plain-Node vitest cannot load; without a runner the tool degrades to an error-as-data
explanation, never a throw.

Per call (`src/executor/run.ts`):

1. **Normalize** — `DynamicWorkerExecutor.execute` applies upstream `normalizeCode`
   internally (strips markdown fences, unwraps `export default`, wraps bare statements into
   the `async () => {}` shape; our vendored copy in `src/catalog/vendor/normalize.ts` is
   used by the spec-sandbox source generator).
2. **Fresh isolate** — one Dynamic Worker per call via `env.LOADER.load()`, with
   `globalOutbound: null` pinned explicitly (any `fetch()`/`connect()` in model code
   throws) and a 60s wall-clock timeout. Known limitation: codemode's executor doesn't expose
   Worker `limits` (`cpuMs`/`subRequests`) — still true on the installed 0.5.1 — so we rely on
   its timeout + plan defaults. Stated without a version pin so it cannot go stale silently;
   `src/executor/run.ts` carries the same wording.
3. **Sandbox globals** (`src/executor/providers.ts`, `buildSandbox`): one namespace global
   per service with one async fn per cataloged operation, named by the id's terminal
   segment (`lumenloop.search_directory(args)`, `scout.getStatus()`,
   `stellarDocs.search_docs(args)`) — currently 18 + 29 + 12 fns — plus the `codemode`
   discovery global (§5). Wrong names fail loudly through codemode's per-namespace Proxy
   ("Tool not found"); there is no fuzzy resolution. Providers are rebuilt per run so the
   skill-read advice flag is run-scoped; the expensive derivations (catalog view, resolved
   spec) are WeakMap-cached module-level.
4. **Per-call host RPC** — every service fn runs: manifest entry (closure-captured, never
   model-supplied) → `guard` (`src/policy/guard.ts`: `validateArgs` against the entry's
   `inputSchema`, `src/policy/validate.ts` — the only runtime check; exposure is filtered at
   build time, ADR-0003) → adapter
   dispatch (`src/adapters/index.ts` → `lumenloop.ts` / `scout.ts` / `stellar-docs.ts`;
   secrets read from env host-side, model code never sees a URL, header, or key) →
   per-service normalization into the envelope (soft-empty ≠ error ≠ data; e.g. Scout 404s
   normalize to `soft-empty`, JSON and non-JSON alike) → `redactSecrets`
   (`src/policy/redact.ts` — every secret the Worker holds is scrubbed from serialized
   results). Build-excluded surfaces have no sandbox fn at all — an unknown name fails
   loudly via the per-namespace Proxy. Each dispatch emits an `op`
   telemetry event (`id`, outcome, ms); fan-out via `Promise.all` is safe (no shared
   mutable state per call).
5. **Tracing** — the sandbox run is wrapped in a custom `codemode.execute` span because
   Worker Loader isolates are not auto-instrumented
   (`research/observability-cloudflare.md`).
6. **Output hygiene, three budgeted channels** — everything model-facing is capped at
   ~6k tokens by default (4 chars/token, `src/policy/truncate.ts`), with a bounded
   host-side override via `EXECUTE_MODEL_BOUNDARY_MAX_TOKENS` (1,000-32,000 tokens).
   The `execute` MCP result keeps these channels in text `content` and intentionally omits
   `outputSchema` and `structuredContent`. Anthropic's connector documents text results. Claude
   Code 2.1.238, including its Agent SDK runtime, replaces text blocks when structured content
   exists. The ChatGPT Apps SDK exposes both fields, so a full structured copy would duplicate
   every capped result. The dated [execute output contract review](research/execute-output-contract-2026-08-20.md)
   records the version-specific evidence. The bounded host-side `search` response keeps its
   matching text and structured forms.
   Each channel is model-authored and would otherwise smuggle payloads past the others:
   - *result*: redacted again, then `truncateForModel` computes the fixed cut. If the
     result fits, the returned bytes are byte-identical to the pre-lane behavior. If it
     truncates, the old generic footer is replaced with a compact source-basis block from
     `src/policy/source-basis.ts`: shape/loss detail, the manifest-operation call ledger,
     sanitized data-derived URLs, and an artifact availability line. The cut itself stays
     `maxTokens * 4`; the source-basis block is appended after the cut and has its own hard
     character budget. Source-basis guidance names `codemode.artifact.read(id)` only when
     the artifact is available; skipped/absent artifacts get narrower re-run advice. The
     `skillSectionAdvice` flag adds a return-sections/aggregates-not-whole-skill-bodies
     clause only — advice flags never widen the budget or move the cut.
   - *logs*: `shapeLogs` (`src/executor/shape-logs.ts`) applies structural caps first —
     100 lines × 2,000 chars — **redacting each line before clipping** (clip-first would
     let a secret straddling the boundary leak its prefix), then the joined block gets its
     own ~6k budget at the tool boundary (`truncateLogsForModel` in `src/mcp/tools.ts`;
     structural caps alone still admit ~50k tokens).
   - *error text*: `throw new Error(payload)` is the third channel — same budget.
7. **Errors as data** — a failed run returns `isError: true` with `Execution failed: …`
   plus the console block; nothing throws across the tool boundary. The `execute`
   telemetry event records content-free status, timing, sizing, and truncation fields,
   artifact read counts/bytes, and structured source-basis detail when present. The
   telemetry copy caps `sourceBasis.calls` to totals plus the first 12 calls so call-heavy
   runs cannot turn the log event into a payload dump; `execute_logs_shaped` fires only
   when structural shaping actually lost something.

### Artifact/source-basis lane

Artifacts exist only for oversized **result** payloads. Logs and thrown error text keep their
own model-boundary caps and are never persisted.

The write path lives at the final result boundary in `src/executor/run.ts`: redact the
sandbox result with `redactSecrets`, run the model-boundary truncation decision, and only
when that decision truncates, serialize/write the full redacted result string to R2 through
`src/artifacts/store.ts`. The R2 object body is a small JSON envelope
`{ encoding, mime, body }`, where `body` is the exact UTF-8 result string the boundary used
before slicing. The key is `art/<ownerHash>/<id>` (`id = crypto.randomUUID()`, owner hash =
short SHA-256 prefix); the raw OAuth subject is never in the key. Custom metadata carries
`createdAt`, `expiresAt`, byte size, SHA-256, MIME, request/ray id, cap/original sizing,
a budgeted operation ledger summary (first 12 calls plus totals, with a final guard under
R2's 8,192-byte custom metadata limit), and the catalog `generatedAt`, so eval review can
inspect provenance without reading the payload.

Production ownership is OAuth-only in v1. `src/server.ts` derives `artifactOwner` per tool
call from `getMcpAuthContext()?.props.subject`, the peppered WorkOS subject set by the OAuth
provider. The cached execute runner never captures that owner; it receives an
`ExecuteCallContext` per call. API-key bypasses and `/playground` pass no owner: truncated
results still get a source-basis block, but the artifact line is a generic
unavailable/absent state and no R2 write is made. The loopback-only dev bypass is the one
exception for local eval fidelity: it receives the fixed owner `dev-local` only from the
branch where `allowDevUnauthenticated(env, loopbackHostname)` actually fired; the env var
alone never assigns that owner on production hostnames.

The read path is inside the sandbox, not a public URL. `src/executor/providers.ts` exposes
flat host functions `codemode.artifact_info` / `codemode.artifact_read`; the prelude wraps
them as `codemode.artifact.info(id)` and `codemode.artifact.read(id)` because nested objects
do not cross codemode's provider proxy. Both return the normal envelope shape. `info` returns
metadata only, including `requestId` and `rayId` deliberately: that correlation affordance lets
sandbox code return compact audit pointers without exposing payload bytes. `read` parses the
stored value back into the sandbox (`r.data`) so code can filter/project the full payload
without spending model context; the only exit remains the same final result cap above. Missing,
expired, wrong-owner, invalid-id, and ownerless reads are all
`{ ok:false, error:{ kind:"error", ... } }` from the sandbox's perspective. Store-level 7-day
logical expiry is enforced on every `info`/`read`; the bucket lifecycle also expires objects
after 7 days so physical retention matches the app contract.

Abuse controls are per execute call: `codemode.artifact.info` is capped at 8 metadata probes
and `codemode.artifact.read` is capped at 4 reads. The provider records read count/bytes for
the `execute` event. `artifact_write` and `artifact_read` log events include kind
(`info`/`read`), bytes, latency, hit/miss/skip reason, and only the owner hash prefix —
never payload previews or raw subjects. The R2 binding also sets
`preview_bucket_name = "stellar-raven-artifacts-dev"` so `wrangler dev --remote` cannot bind
the local/dev owner path to the production artifact bucket.

## 4. The envelope contract

Every service call resolves — never throws — to `{ ok: true, data }` or
`{ ok: false, error: { service, kind, message, status?, code?, hint? } }`, with `kind`
two-way: `"error"` (call failed / bad args) or `"soft-empty"` (the service answered with
nothing — *not* evidence of absence) (`src/adapters/types.ts`). There is no `"denied"`:
exposure is filtered at build time (ADR-0003), so nothing callable can be policy-refused.
An `ok: true` envelope whose payload arrays are empty is data-shaped empty, not a `soft-empty`
error. The host ledger classifies that success as inconclusive without changing the public envelope.
Positive rows and meaningful detail fields remain service data. Both empty-success and soft-empty
outcomes are inconclusive for a wider real-world claim unless the question names that corpus or
directory as its closed scope.

The observed LLM failure mode is reading payload fields one level too shallow
(`r.projects` instead of `r.data.projects`), which yields `undefined` and — after a
defensive `|| []` — masquerades as a legitimate empty result. A sandbox-side **guard
prelude** (`envelopeGuardPrelude` in `src/executor/providers.ts`) wraps every service fn
and plants non-enumerable accessor pairs on each envelope:

| Access | ok: true | ok: false |
|---|---|---|
| GET payload key on the envelope (`r.projects`) | **throws**, naming `r.data.projects` | — |
| GET `r.data` | plain data | `undefined` + ONE deduped `[envelope]` console warning naming the real error (kind/message/hint) |
| SET (either) | **writes through** (self-replaces with a plain property — decorating the envelope is legal) | warns once, then writes through |
| `r.error` on ok:true | stays plain `undefined` (the `if (r.error)` pattern keeps working) | — |

Non-enumerable accessors, deliberately **not** a Proxy (Proxies `DataCloneError` under
Workers RPC serialization): `Object.keys` / spread / JSON / structured clone / returning
the raw envelope all read enumerable-only and stay untouched; only direct wrong-level
access trips a trap. The SET is not try/caught — a frozen envelope must throw loudly at
the write. The guard applies to service namespaces only; `codemode.*` discovery fns return
their own shapes by design. The same contract is taught in four channels: rendered
signatures, `search`'s `nextSteps`, the `execute` description, and `SERVER_INSTRUCTIONS`.

## 5. Discovery inside the sandbox

The `codemode` provider (`buildCodemodeProvider`, `src/executor/providers.ts`) is
`execute`'s in-sandbox discovery surface — follow-up discovery at zero extra turn cost:

- **`codemode.spec()`** — the unified super spec (`specs/super-spec.json`: OpenAPI-3.1-style,
  paths keyed `/{service}/{operation}`, operationId = the exact sandbox call, `x-execute` /
  `x-skill-index` vendor extensions; exactly the manifest's operations — every path callable
  (ADR-0003); design record and per-service
  mapping in [`research/services/stellar-docs-spec-design.md`](./research/services/stellar-docs-spec-design.md)
  for stellarDocs and [`research/super-spec-design.md`](./research/super-spec-design.md) for the
  whole document), with `$refs` resolved inline
  (`resolveSpecRefs` in `src/executor/spec-sandbox.ts` — the host-side twin of upstream's
  in-sandbox `__resolveRefs`, cached per spec object). Post-ADR-0001
  (`research/decisions/0001-search-tool-shape.md`) this is the super spec's role: the
  code-shaped `search` front door that injected ~183KB of serialized spec into each search
  sandbox lost the golden Q→A A/B and was retired; the document (~45k tokens) is now served
  as data over the provider RPC, greppable in-sandbox, and **never enters the agent's
  context** unless a script deliberately returns slices of it. The unregistered
  `createSpecSearchRunner` (`src/executor/run.ts`) keeps the source-injection variant
  buildable for future A/Bs.
- **`codemode.search(queryOrOpts)`** — the same host-side `searchCatalogPage`, mid-script:
  resolves to `{ ok: true, hits, total, truncated, widerCandidates, recovery, confidence,
  recoveryMetadata }` (tier-marked
  hits, pagination facts, structural wider advice, and explicit prior-attempt recovery, §1/§2),
  with the same kind/service/recoverFrom validation at the sandbox boundary — an unknown filter
  or recovery operation id returns `{ ok: false, error }` naming the valid scope (explicit `null`
  = no filter, like `limit`).
- **`codemode.catalog({ kind?, service?, compact? })`** — the manifest as flat data for arbitrary
  code-grep, optionally sliced by exact kind/service filters. The default/full projection includes
  schemas; `compact: true` omits `inputSchema`/`outputSchema` while retaining identity,
  descriptions, and runnable markers. Host-only detail (transport, provenance) is stripped.
  Everything in it is callable/readable —
  the manifest is pre-filtered at build time (ADR-0003), so there is no policy layer to show.
- **`codemode.describe(id)`** — the canonical detail-on-demand step (exact-match id only;
  mirrors upstream codemode's search → describe → call). A describe result carries all the
  DETAIL a search hit has and more (ranking facts — `score`, `tier` — stay on hits, since
  they describe a hit's place in one response, not the entry): operations carry the **full** rendered signature
  (complete output type, even where the search hit stubbed it — §2) plus the raw
  `inputSchema`/`outputSchema` as plain data (the same projection `codemode.catalog()`
  serves); skills carry `availableSections` (same `sectionKeysOf` derivation as search
  hits); skill sections carry the parent `skillId` and `section` key. Every kind includes
  a `usage` line naming the exact next call (the callable-line/envelope reminder for
  operations, the precise `codemode.skill.read(...)` invocation for skills and sections).
- **`codemode.skill.read(name, { sections? })`** — §6. Wired via a one-line prelude
  (`SKILL_PRELUDE`) because nested objects can't cross codemode's flat Proxy dispatch.
- **`codemode.skill.run(name, input)`** — runnable-skill dispatch (shipped 2026-07-06,
  todo 806; decision record [`research/skill-run-design.md`](./research/skill-run-design.md)).
  The current manifest has exactly one skill entry carrying `runnable: true` plus real
  input/output schemas on its existing `kind: "skill"` entry (one id, two affordances —
  read the playbook, run its data-gathering core): `skills.lumenloop.stellar-ecosystem-digest`.
  The project-dossier runner shipped alongside it and was retired on measured evidence
  the same week: unreachable by its audience's entity-shaped queries, zero adoption
  across every battery run; Solo todo 849, the design doc §10 postscript is the decision
  record. The prelude wraps the flat `skill_run`
  dispatch fn (same mechanism as `skill.read`); all semantics live host-side in `runSkill`
  (`src/skills/run.ts`): exact-match id resolution (a miss or non-runnable id returns an
  error naming the full runnable set plus a nearest-id *suggestion*, never a resolution),
  input validated through the same `guard`/`validateArgs` path operations use, then the
  runner from the `RUNNERS` registry (`src/skills/runners/index.ts` — the
  allowlist-as-data) executes. `assertRunnersWired` throws at provider build
  (`buildSandbox`) on any registry↔manifest drift: id sets both ways, canonical-JSON schema
  equality per id, declared ops ⊆ emitted operation ids.
  - *Policy identity by construction*: the runner's ops facade is built by the **same
    `buildOpsFns`** (`src/executor/providers.ts`) that builds the sandbox service
    namespaces — `buildSandbox` builds the closures once and threads them to both — so
    every constituent call runs the identical guard → adapter → normalize → redact path
    and emits its own `op` event. A build-excluded op has no entry, hence no closure,
    hence nothing a runner can call (ADR-0003, structurally).
  - *Declared-ops sub-facade, host-owned audit trail*: `runSkill` hands the runner a
    sub-facade containing **only its declared `ops`**, each wrapped to append
    `{ op, ok, errorKind?, ms }` to a host-owned ledger. `data.calls`, the error path's
    `error.details`, and the `skill_run` event counts all come from that ledger, never
    from runner output (a runner-set `calls` key is overwritten unconditionally) — a
    buggy runner can project a section wrongly, but it cannot make a failed call
    disappear from the report or corroborate its own lie.
  - *Envelope + partial failure*: run is a **call** and returns the standard service-call
    envelope (`{ ok: true, data } | { ok: false, error }`), routed through
    `__guardEnvelope` so `.data`-misuse traps behave identically to operation calls — no
    `skill.read`-style top-level shape, no third shape to teach. Constituent failures
    never fail the run by themselves: an errored call's output section is `null`, a
    soft-emptied call's section is present with `softEmpty: true` (the three-way
    data ≠ soft-empty ≠ error distinction, in aggregate form); only the runner's declared
    **anchor** failing makes the run `ok: false`, with the ledger attached as
    `error.details`.
  - *Deadline*: `Promise.race` against a **30 s host deadline** (`RUNNER_DEADLINE_MS`,
    `src/skills/run.ts`) returns a timeout error envelope on expiry — NOT cancellation:
    in-flight facade calls continue detached (free read-only ops, each still logging its
    own `op` event); the executor's 60 s wall clock stays the hard stop. After the `calls`
    attach, the output is validated against the runner's `outputSchema` as a warn-only
    belt — a mismatch logs `outputSchemaOk: false` without failing the run.
  - *Trust framing, stated honestly*: runners are first-party, reviewed, repo-committed
    TypeScript at the **adapter trust tier** (`src/adapters/*`), executed **host-side —
    NOT sandbox-confined**. `globalOutbound: null` confines the isolate only; the rule
    "runners use only the facade" is enforced by first-party review backed by two drift
    *belts* (an import/token lint over runner sources and a behavioral CI test that runs
    every runner with `globalThis.fetch` stubbed to throw) — belts, not a sandbox, and
    this doc doesn't claim one. Manifest-only ops and no-env **are** structural: the
    facade is built from emitted entries only, and runners receive exactly
    `(input, ops)` — no env parameter exists to leak.

## 6. Skill splitting — pins → sections → reads

**The pin set.** `ecosystem-skills/MANIFEST.json` pins 20 public skills from 4 upstreams: per
source a full commit SHA, per file a path, size, and git blob hash. Bodies are **not vendored**
in this repo and **not bundled into the Worker**: the pin is the artifact. The settled rule
(owner, 2026-07-30) is **serve, do not store** — Raven forwards this content and must never become
its source of record, so a durable owned mirror (R2, a committed copy, a bundled copy) is out of
scope by decision. Caches on the forwarding path are transport, not a store. It also deletes
~390 KB of Worker bundle. `ecosystem-skills/update.sh` re-pins (stores nothing) and fails closed at
every step, `scripts/check-mirrors.mjs` validates the pin set offline (`--fetch` additionally
proves every pin still resolves upstream, cache bypassed, run first by `refresh.yml`), and
`scripts/check-skills-drift.mjs` checks the pins against upstream HEAD in the same refresh
(detection only — pins are never auto-advanced, because skills are prompt input and an upstream
edit must be read by a human before it reaches the model). The former credentialed Lumenloop API
skill source is intentionally absent; partner skills remain visible only as name-only inventory
stubs.

**Retrieval.** Every skill/section entry carries
`transport: { type: "file", url, sha, sha256 }` — the `raw.githubusercontent.com` URL at the
pinned commit, the git blob hash, and a SHA-256 over the raw bytes. **SHA-256 is the security
check; the blob hash is provenance** (SHA-1 has practical chosen-prefix collisions, so it ties
bytes to the git object a reviewer saw rather than resisting an adversary). Both must match.
The shape is constrained at catalog load (`transportSchema.superRefine`): https, exactly
`raw.githubusercontent.com`, a 40-hex commit in the path, 40-hex `sha`, 64-hex `sha256` — a
mis-built catalog cannot point host-side fetches anywhere else.

`src/skills/source.ts` resolves a pin: in-isolate memo keyed by **(url, sha256)** → colo Cache API
→ upstream fetch. Cached bytes are re-verified on every hit (the cache is a transport, not a trust
boundary) and cache reads *and writes* are best-effort, so a cache outage can never fail a read it
could not have served. `scrubNonExposedRefs` (`src/skills/scrub.ts`, shared with the builders)
runs on every served body. It removes retired skill references and complete Markdown blocks for
excluded Scout paths. Companion files for a multi-section read are fetched **concurrently**,
and the whole read is bounded by `SKILL_READ_DEADLINE_MS` (20s) — deliberately under the
executor's 60s wall clock, so a slow upstream fails as a `skills` error envelope instead of
killing the run. Transport, integrity, provenance, deadline, and scrub failures are all ordinary
`{ ok: false, error }` envelopes. Because the fetch is host-side, the sandbox itself still has no
network (`globalOutbound: null`). The build side uses the same pins and the same verification
through `scripts/lib/skill-mirror.mjs`, caching into the gitignored `ecosystem-skills/.cache/`.

**Measured cost of forwarding (2026-07-30, `skill_read` telemetry).** First production reading:
upstream fetches 61-80 ms, memo hits 0 ms. Always split latency by `from` — a mean over both is
meaningless. The `skill_read` event (`src/observability.ts` `logSkillRead`) is the only view of
this path; query guidance is in `.agents/skills/cloudflare-observability-review/SKILL.md`.

**The availability posture — an accepted risk, not an unsolved one.** Forwarding instead of
storing means `skill.read` depends on `raw.githubusercontent.com` at request time. What that
exposure is NOT: ordinary upstream churn. A commit-pinned URL keeps serving after upstream renames,
edits, or deletes the file on its default branch (verified against a superseded stellar-scout pin).
What it IS: repo deletion, rename, or privatization; a history rewrite followed by GC; a GitHub
outage; shared-egress rate limiting. Mitigations on the forwarding path: the colo cache and
in-isolate memo keep warm reads off the network, one retry absorbs a transient blip, an 8s
per-fetch timeout and a 20s whole-read deadline keep a slow upstream from killing `execute`, and
failure surfaces as an ordinary `skills` error envelope.

Detection, stated exactly, because the two halves are not equally covered:

- **Upstream-side loss** (repo deleted/renamed/privatized, history rewritten and GC'd) is detected
  within a day. `check-mirrors --fetch` runs first in `refresh.yml`, before any builder, fetching
  every pin from upstream with the working cache **bypassed**, and reports an unresolvable pin as
  its own drift class labelled a live `skill.read` outage. The cache bypass is load-bearing: a
  cached read proves only that the bytes we already hold match the pin, so a warm
  `ecosystem-skills/.cache/` would make the check pass while upstream was gone.
- **Cloudflare-side failure** (egress from the colo, shared-IP rate limiting, a deployed-runtime
  regression) is detected within the hour by the Worker checking **itself**. GitHub Actions egress
  is not Worker egress, so no external check can see this class; the only vantage point that can is
  the Worker's own. A cron trigger (`wrangler.jsonc` `triggers.crons`, hourly) runs
  `runSkillCanary` (`src/skills/canary.ts`), which fetches every distinct pinned file **with the
  memo and colo cache deliberately bypassed** and writes a verdict to KV. `GET /health/skills`
  reports that stored verdict — projected to a fixed shape, never the raw record, so the
  unauthenticated endpoint publishes no URLs or digests and cannot be used to drive traffic at
  upstream. The daily refresh reads it and classifies four states, and keeping them apart is the
  whole discipline: `clean` (fresh + ok), `failing` (fresh + not ok — the ONLY state that may claim
  an outage), `stale` (too old to describe now, whatever its boolean: proves the detector stopped,
  not that retrieval broke), and `error` (no usable verdict at all — including the first deploy
  before any cron has fired). Collapsing the last three into `failing` cries wolf; collapsing them
  into `clean` lies.

  What the canary does NOT prove: Cron Triggers run wherever Cloudflare has spare capacity, not
  across the colos serving user requests, so each run samples one execution location. It catches
  global and shared-infrastructure failures — the realistic case — but real-traffic
  `skill_read outcome:error` remains the only signal covering user-selected colos.

The cache bypass is the load-bearing part, for the same reason it was at the build layer: pinned
URLs are cached `immutable` for a year, so a canary on the normal read path would answer from a
warm colo entry and report healthy indefinitely after egress died. `check-mirrors --fetch` shipped
with exactly that bug (0 network requests against a warm cache).

**Reading the two together is the diagnosis.** `check-mirrors --fetch` green + canary red means the
content is fine and *our access to it* is not — a Cloudflare or network problem, not an upstream
one. Red + red means upstream actually lost the file. Neither check subsumes the other, which is
why both run.

The residual **upstream** risk is deliberately **accepted**: the only remaining fix is to hold a
durable copy of the content, and the serve-do-not-store rule above forbids exactly that. Do not
"solve" this with an R2 mirror.

**The re-pin review gate.** Bodies are prompt input, and pinning by hash means a re-pin commit
shows hash changes only — the text never reaches `git diff` the way it did when bodies were
vendored. Two mechanisms replace that: `ecosystem-skills/update.sh` prints a real old-pin →
new-pin body diff (`scripts/diff-pins.mjs`) at the moment of re-pinning, and
`scripts/check-pin-review.mjs` fails CI unless `ecosystem-skills/PIN-REVIEW.md` records an
attestation naming the new selection.

Two things that guard makes explicit, because the obvious shape of each is wrong:

- **A brand-new file is reviewed in full, not summarized.** An upstream addition — or the incoming
  half of a rename — is the case with the most unreviewed prompt input in it, so `diff-pins` prints
  its whole body rather than a `### NEW <path>` header.
- **The gate keys on the whole selection, not the commit.** A source's commit is one of several
  fields that decide which bytes get served; skill names, file paths, and per-file blob shas do
  too. `check-pin-review` digests all of them into a `sel:` token, so retargeting an entry to a
  different file inside the same pinned tree cannot ride in under a commit that never moved.

**Build-time sectioning.** `scripts/build-catalog.mjs` emits, per skill: one `kind:
"skill"` entry (id `skills.<source>.<name>`, description from frontmatter or first
paragraph); one `kind: "skill-section"` entry per `##` heading (id `<skillId>#<slug>`,
duplicate slugs deduped `-2`, `-3`…; description = the heading, and nothing more); and one
section-kind entry per extra `.md` file (id `<skillId>#file:<relpath>`, description = its
title). A section entry is an ADDRESS, not a copy: no body excerpt, and no body-derived
`keywords` (they only exist under experiment arm A, which is the only arm that puts sections
back in search — see `emitSectionKeywords`). Every section entry carries
`searchable: false` since the 2026-07-13 skills-form A/B: sections stay exposed for
exact-id `skill.read` and `availableSections` navigation but never enter search — the
measured A/B showed the 204 section cards crowded operations while whole-skill entries
carried every discovery need (`eval/README.md` "Skills-form A/B"; Solo scratchpad 608). Retired onboarding skills are never
emitted — no skill entry, no sections, and never even fetched (ADR-0003; the retirement record is
`RETIRED_ONBOARDING_SKILLS` in `scripts/exposure.mjs` plus the ADR). Lumenloop-API-served
skill metadata (14 skills as zips) is likewise never emitted: public skills duplicate
canonical `skills.*` mirror entries, and partner skills are deliberately non-mirrored.
Current exposed skill and section counts are authoritative in `catalog/manifest.json`; there is
no `lumenloop.skill.*` namespace and no read alias — unknown ids fail exact-match with a
nearest-id suggestion.

**The read path** (`readSkill`, `src/skills/store.ts`) resolves through the **catalog**,
not the filesystem: `name` must be an exact catalog id (a `#slug` suffix reads that one
section), the entry must be `kind: "skill"`, and content comes from the entry's pinned
`transport` via `src/skills/source.ts`. The body is re-sectioned at read time with the same
slugify as the builder — the builder-invariant test (`test/skills.test.ts`, via the exported
`sectionSlugsOf`) asserts the two sectionings agree for every pinned skill. Both read shapes are fail-closed on
drift:

- **Whole reads** return the full body — content is never withheld for *size* (the ~6k cap
  applies to what a script returns, never to data flowing into the sandbox).
- **Section reads** accept slugs, exact heading text, or `file:` keys; an unknown section
  fails the whole read and lists what exists (never a silent partial answer); and a `##`
  section present in the body but **absent from the catalog** (sectioning drift) is
  refused — default-deny, not default-allow. Each returned section carries the exact pinned
  `url` for its content. The top-level `url` remains the main `SKILL.md` address.
- `availableSections` (returned on every ok read, and on search hits) advertises only
  cataloged keys.
- Reads large enough that returning them whole would hit the model boundary carry an
  advisory `notice` (from ~5,000 estimated tokens) telling the model to request sections —
  advice only, the content is still fully present for in-sandbox grep/aggregate.

Skills also appear in the super spec as a synthetic core service (read via the same
`codemode.skill.read`; section keys under `x-skill-index`), so spec-grepping code discovers
them too.

## 7. Operating limits and caps

This section is the operator-facing limit matrix. Code remains the source of truth; refresh this
section whenever one of the referenced constants changes. Cloudflare-side deployment settings
(for example AI Gateway rate/spend rules) are intentionally not repeated here because they can
change outside the repo; verify them live in Cloudflare when reviewing spend posture.

### Shared by demo and MCP

These limits apply to the shared execute path unless a lane-specific wrapper refuses earlier.

| Area | Limit / behavior | Code |
| --- | --- | --- |
| Execute sandbox | Fresh Dynamic Worker isolate per `execute`; `globalOutbound: null`, so model code cannot `fetch()`/connect; 60s wall-clock timeout. | `src/executor/run.ts` |
| Service operation args | Every operation call is validated against the generated manifest entry's JSON schema before adapter dispatch. Build-excluded surfaces have no callable function. | `src/policy/guard.ts`, `src/policy/validate.ts`, `src/executor/providers.ts` |
| Result boundary | Default ~6,000 tokens at 4 chars/token. `EXECUTE_MODEL_BOUNDARY_MAX_TOKENS` may override only within 1,000-32,000 tokens. | `src/policy/truncate.ts` |
| Logs | First 100 console lines, each redacted then clipped to 2,000 chars, then the same model-boundary token cap. | `src/executor/shape-logs.ts`, `src/policy/truncate.ts` |
| Error text | Same model-boundary cap as results/logs. | `src/policy/truncate.ts`, `src/mcp/tools.ts` |
| Runnable skill runner | `codemode.skill.run(...)` executes first-party host-side runner code, not model JS, behind a 30s host deadline. Timeout returns an error envelope; the outer sandbox's 60s wall clock remains the hard stop. | `src/skills/run.ts` |
| Login parked state | WorkOS login state parked in KV expires after 10 minutes for both MCP OAuth and demo login flows. | `src/auth/workos.ts` |

Observability to query: `execute`, `op`, `skill_run`, `execute_logs_shaped`, and the
`codemode.execute` span. A timeout generally appears as `execute`/`demo-execute` error
status with `ms` around 60,000.

### Playground-only `/playground/chat`

The demo subject is the peppered WorkOS user id stored in the signed `__Host-RAVEN_DEMO` cookie;
loopback dev uses the fixed subject `dev-loopback`. A "chat" is one valid `POST /playground/chat` turn
after method, same-origin, auth, body-size, and body-shape validation. The throttle is consumed
before model/tool execution, so later model or tool failure still counts.

| Area | Limit / behavior | Code |
| --- | --- | --- |
| Demo session cookie | 2 hours. The browser never receives a WorkOS/OAuth token. | `src/demo/auth.ts` |
| Chat rate limit | 30 chats per subject per fixed UTC hour bucket, best-effort KV read/write with 2h TTL. It is not atomic, so concurrent requests can overrun slightly. | `src/demo/budget.ts` |
| Rate-limit response | `429` with `Retry-After: 3600`. | `src/demo/chat.ts` |
| Request body | 384 KiB max before JSON parse. Malformed/oversized requests do not burn throttle. | `src/demo/chat.ts` |
| Replayed history | Newest 20 messages, then oldest messages dropped until total content is at most 24,000 chars when possible. | `src/demo/budget.ts` |
| User-role message | 8,000 chars max per user-role message. The composer blocks overlong submissions. The server rejects a bypassed overlong message with `400 message_too_long` before the throttle or model call. | `src/demo/budget.ts`, `src/demo/chat.ts`, `src/demo/page.ts` |
| Whole turn | 120s abort signal covering model stream plus tool calls. | `src/demo/chat.ts` |
| Model steps | 7 total; the seventh/final step has no active tools and is reserved for synthesis. | `src/demo/budget.ts`, `src/demo/chat.ts`, `src/demo/steps.ts` |
| Model output | 4,096 output tokens. | `src/demo/budget.ts`, `src/demo/chat.ts` |
| Search calls | 3 per turn. Search hits are navigation metadata, not answer evidence. | `src/demo/budget.ts`, `src/demo/tools.ts`, `src/demo/prompt.ts` |
| Demo search page | Default 5 hits, caller `limit` clamped to 6. | `src/demo/budget.ts`, `src/demo/tools.ts` |
| Demo search hit text | Description clipped to 220 chars; signature clipped to 400 chars while preserving the callable line. | `src/demo/tools.ts` |
| Execute calls | 3 per turn. The host aggregates operation outcomes and a structural positive-data flag without retaining payload data, so the loop can recover from empty successes and failed calls. | `src/demo/budget.ts`, `src/demo/tools.ts`, `src/executor/run.ts` |
| Recovery guidance | Structurally poor operation searches expose up to three `widerCandidates`; explicit caller-reported exact operation ids in `recoverFrom` expose separate bounded `recovery` candidates after ranking; execute exposes at most one hint-driven recovery cycle per turn. Independent structural failure recovery remains active. | `src/catalog/search.ts`, `src/demo/tools.ts`, `src/demo/steps.ts` |
| Execute code length | 8,000 chars. | `src/demo/budget.ts`, `src/demo/tools.ts` |
| Execute preflight | Known-bad `Promise.all({ ... })` fanout is refused before sandbox execution. | `src/demo/tools.ts` |
| In-script discovery | Same as `/mcp`: `codemode.search`, `codemode.describe`, `codemode.catalog`, and `codemode.spec`, plus skill helpers. | `src/demo/tools.ts`, `src/demo/prompt.ts` |
| Artifacts | Demo execute uses the shared runner without an artifact owner, so truncated demo results do not get readable R2 artifacts. | `src/demo/tools.ts`, `src/server.ts` |

Observability to query: `demo-chat`, `demo-step`, `demo-search`, `demo-execute`,
`demo-search-refused`, `demo-execute-refused`, and `demo-chat-rejected`. `demo-step`,
`demo-execute`, and the final `demo-chat` event carry compact operation-outcome totals and no
query, code, result, answer, or provider-error content. The final `demo-chat`
event also carries `searchTruncatedCalls`; it deliberately does not claim that a later execute was
caused by or recovered a particular truncated search.

### MCP-only `/mcp`

The non-demo MCP lane deliberately leaves clients mostly unconstrained at the application layer:
auth gates, schemas, the shared sandbox, and artifact caps are the main limits.

| Area | Limit / behavior | Code |
| --- | --- | --- |
| Top-level `search` | Default 10, max 50. | `src/mcp/tools.ts`, `src/catalog/search.ts` |
| `execute.code` length | No app-level max; schema requires only a non-empty string. | `src/mcp/tools.ts` |
| Execute/search call count | No app-level per-session count cap. | `src/mcp/tools.ts`, `src/server.ts` |
| OAuth access token TTL | 1 hour; compatible MCP clients refresh automatically while the grant remains valid. | `src/auth/gate.ts` |
| OAuth refresh/grant TTL | 90 days fixed from authorization; refresh-token rotation does not extend the window. | `src/auth/gate.ts` |
| Dynamic client registration TTL | 365 days; client metadata is independent of user grants and token lifetimes. | `src/auth/gate.ts` |
| WorkOS identity revalidation | WorkOS participates during browser authorization only. WorkOS session changes do not synchronously revoke an existing Raven grant, so the fixed 90-day grant bounds that propagation gap. | `src/auth/workos.ts`, `src/auth/gate.ts` |
| Artifact availability | Truncated result artifacts are available for OAuth subjects and loopback local dev (`dev-local`), not API-key bypasses and not demo. | `src/server.ts`, `src/artifacts/store.ts` |
| Artifact logical retention | 7 days; bucket lifecycle also expires objects after 7 days. | `src/artifacts/store.ts` |
| Artifact stored body | Max 2 MiB. Larger truncated results still return source-basis advice, but no artifact is written. | `src/artifacts/store.ts` |
| Artifact custom metadata | Max 8,192 bytes. | `src/artifacts/store.ts` |
| Artifact op ledger metadata | First 12 calls plus totals; op names clipped to 180 chars. | `src/artifacts/store.ts` |
| Artifact reads inside execute | 8 `codemode.artifact.info(...)` calls and 4 `codemode.artifact.read(...)` calls per execute when an artifact owner exists. | `src/executor/providers.ts` |
| In-script discovery | `codemode.spec`, `codemode.search`, `codemode.catalog`, `codemode.describe`, `codemode.skill.read`, `codemode.skill.run`, and artifact helpers are enabled. | `src/executor/providers.ts`, `src/mcp/tools.ts` |

Observability to query: `mcp_request`, `search`, `execute`, `artifact_write`, `artifact_read`,
`op`, `skill_run`, and `codemode.execute` spans.

## 8. Build & refresh chain — keeping the catalog honest

Generated artifacts are rebuilt by scripts, never hand-edited
([`AGENTS.md` “Commands and verification”](./AGENTS.md#commands-and-verification)). The chain:

```
scripts/refresh-inventory.mjs   (live inventory network step)
   → inventory/lumenloop.json  inventory/stellar-light.json  inventory/stellar-docs.json
     inventory/stellar-docs-titles.json
specs/stellar-docs.json         (authored spec-as-data, not fetched)
ecosystem-skills/MANIFEST.json  (skill PINS, written by ecosystem-skills/update.sh)
scripts/build-catalog.mjs       → catalog/manifest.json        (deterministic; fetches pinned
                                                                skill files, hash-verified)
scripts/build-micro-map.mjs     → src/mcp/micro-map.ts          (offline, deterministic)
scripts/build-super-spec.mjs    → specs/super-spec.json        (npm run spec:build)
```

`scripts/build-catalog.mjs` has five snapshot/metadata roots: `inventory/lumenloop.json`,
`inventory/stellar-light.json`, `specs/stellar-docs.json`,
`inventory/stellar-docs-titles.json`, and `ecosystem-skills/MANIFEST.json`. The manifest-enumerated
Markdown files are semantic inputs too, and they are the chain's one non-committed input: the
builder fetches each exposed `SKILL.md` and listed additional Markdown file from its pinned
upstream commit (hash-verified, cached under the gitignored `ecosystem-skills/.cache/`) to derive
each skill's description and section headings (§6). The imported registry in `src/skills/runners/index.ts` supplies emitted runnable flags and
input/output schemas. The refreshed `inventory/stellar-docs.json` is the live Algolia
settings/drift snapshot; it is not a catalog builder input. The title snapshot contributes
per-operation routing vocabulary and its `fetchedAt` participates in the catalog's deterministic
`generatedAt`.

Determinism is a hard property: sorted keys, sorted entries, `generatedAt` derived from the
newest *input* snapshot (never wall clock) — consecutive runs are byte-identical, and
`test/catalog.test.ts` additionally asserts the *checked-in* manifest matches a fresh
rebuild (staleness check), and `test/micro-map.test.mjs` does the same for the generated
orientation layer. The refresh script is idempotent and asserts no key material
(including the Algolia app id) appears in any output. Shared exposure modules own build-time
filter data. `src/policy/scout-exposure.ts` owns excluded Scout operations.
`scripts/exposure.mjs` re-exports them and owns excluded Lumenloop operations, the account-op
regex, the metered flag, retired onboarding skills, and the never-emitted Lumenloop skill
metadata. `scripts/build-catalog.mjs` and the other emitters consume these modules. The super
spec emits exactly the manifest's
operations (a completeness assert catches a cataloged op the spec builders miss). Loud-
failure guards keep refreshes from silently changing exposure: `assertRetirementNamesResolve`
(a re-pin renaming/removing a retired skill would otherwise un-retire it),
`assertBuildAuthorityIdsResolve` (a re-pin renaming a build-authority skill would otherwise
silently drop its role),
`assertLumenloopExclusionsResolve` / `assertScoutExclusionsResolve` (a stale exclusion means
an excluded surface may have moved upstream), `assertLumenloopSkillsMirrored` (a NEW
upstream-served skill must be pinned or excluded, never silently invisible), and the
orphaned-note checks in both builders for stranded `description-notes.mjs` entries. Integrity is
its own guard class: every fetched skill file must match its pinned git blob hash, at build time
and at read time. See `ecosystem-skills/README.md` "After a re-pin: rebuild the generated
surfaces" for the operator chain.

CI (`.github/workflows/ci.yml`, Node 24 — build-catalog relies on native TS
type-stripping): types → tsc → vitest → workerd smoke lane (`npm run test:smoke`,
`test/smoke/` via vitest-pool-workers: the assembled router through `SELF` and the real
Dynamic Worker executor boundary through the LOADER binding; offline enforced by a
miniflare `outboundService` wall that also serves the pinned skill files from a local map, so
`skill.read` and its integrity check run for real inside workerd; auth values are test-only
fakes) → eval self-test →
routing gate
(`eval/run-routing.mjs --gate` against `eval/gates.json`) → the **artifact-sync gate**,
which rebuilds catalog, super spec, micro-map, globes, mirror check, both eval compiles, and
the plan op-classes, then fails on any diff. (The catalog/spec rebuilds fetch the pinned skill
files — the one network dependency in that gate; a hash mismatch fails the build.) The daily drift job
(`.github/workflows/refresh.yml`, 06:17 UTC) re-fetches the live surfaces, rebuilds, and on
any diff opens/updates an issue and fails the run — op-id sets are the drift signal, not
`info.version` (Scout has shipped ops without bumping it). The refresh also runs the
search-only `algolia:rule-canary`: two shared CLI-install cases are queried with rules on and
off, always with analytics disabled, and named assertions require rank 1 plus a material rules
delta. Assertion drift is reported in the drift issue and fails the job; check errors fail as a
separate class. Local no-credential runs are safely inconclusive, while CI requires credentials.

## 9. Evals

Everything measurable about the two tools is instrumented in `eval/` — routing accuracy
(offline, gated in CI), the end-to-end golden Q→A battery, the agentic and plan lanes. The
map of instruments, the gate rules, and the re-baselining discipline live in
[`eval/EVALS.md`](./eval/EVALS.md); the mechanically-enforced gate baselines live in
[`eval/gates.json`](./eval/gates.json) (the source of truth for current numbers — they are
re-baselined by explicit decision, so this doc deliberately doesn't repeat them).
