# Super spec design — specs/super-spec.json (todos 800 + 801)

> **Status:** design doc for the super spec. The code-shaped `search` tool it was written around
> was **retired by ADR-0001** (`research/decisions/0001-search-tool-shape.md`, accepted
> 2026-07-02); the spec now feeds `execute`'s `codemode.spec()`, not a top-level search sandbox.
> The deny-list model it was designed under was **retired by ADR-0003**
> (`research/decisions/0003-build-time-exposure-filtering.md`, 2026-07-04): exposure is filtered
> at BUILD time, so the spec contains only callable operations — there are no `x-policy`/`x-cost`
> fields and no denied paths. Sections below have been updated to the ADR-0003 reality; read the
> code-shaped-`search` references as the historical context in which the spec was designed.

One unified, OpenAPI-3.1-style document covering every operation this MCP server can execute
across four services — **lumenloop**, **scout** (Stellar Light), **stellarDocs** (Algolia-backed
docs search), and a synthetic **skills** core service. It is the document `execute` exposes to
sandboxed LLM code as `codemode.spec()` (mirroring `@cloudflare/codemode`'s `openApiMcpServer`).
It was originally injected by a code-shaped top-level `search` tool as well; ADR-0001 retired that
front door, so `execute`'s `codemode.spec()` is now the sole consumer.

Built by `scripts/build-super-spec.mjs` (`npm run spec:build`); asserted by
`test/super-spec.test.ts` (determinism, counts, catalog consistency, size budget).

## 1. Dialect choice

**Standard OpenAPI 3.1 shapes, namespaced paths, callable operationIds.**

- `openapi: "3.1.0"` with the usual `info` / `tags` / `paths` / `components` skeleton. The LLM
  greps this document with generic spec-walking code (upstream's own worked examples iterate
  `spec.paths` → methods → `op.tags`/`op.summary`), so we bias hard toward the shapes that code
  already expects: `summary`, `description`, `operationId`, `tags`, `parameters`, `requestBody`,
  `responses`, `$ref` into `#/components/...`.
- **Paths are keyed `/{service}/{operation}`** — `/lumenloop/search_directory`,
  `/scout/searchProjects`, `/stellarDocs/search_anchor_sep_docs`, `/skills/read_skill`. Both
  options from the brief are used: the namespaced path AND an `x-service` vendor extension on
  every operation (belt and braces; grouping code can use either).
- **`operationId` is the exact catalog id** (`lumenloop.search_directory`), which is byte-for-byte
  the sandbox call in `execute` (`await lumenloop.search_directory(args)`). Search→execute needs
  zero translation; every op additionally carries the literal call line as `x-execute`.
- Known (accepted) deviations from strict OpenAPI validity, all in service of grep-ability:
  - scout path templates lose their `{slug}` segments when re-keyed to the callable name; the
    original `in: "path"` parameters are kept as-is and the real HTTP shape rides along in
    `x-upstream {method, path}`. Sandbox calls take ONE args object, so `in` is descriptive only.
  - GET operations describe their args via `parameters` (scout, faithful to upstream), POST
    operations via a single `requestBody` JSON schema (lumenloop tools, stellarDocs, skills) —
    matching how each source natively declares them.

Oversized success-response schemas use one general compaction rule. The rule uses the same
`COMPACT_OUTPUT_THRESHOLD` as search signatures. A compact schema keeps exact top-level field
names and required names. Its description and `x-codemode-describe` value name the exact
`codemode.describe("<id>")` call. Inputs and non-oversized response schemas stay unchanged.

### Vendor extensions (per operation)

| Extension | Content |
|---|---|
| `x-service` | `lumenloop \| scout \| stellarDocs \| skills` |
| `x-execute` | exact sandbox call line; present on **every** path (everything emitted is callable — ADR-0003; the former `x-policy`/`x-cost` extensions died with the deny-list) |
| `x-upstream` | real HTTP `{method, path}` behind the callable (lumenloop/scout) |
| `x-algolia` | stellarDocs only: the exact Algolia query mapping the adapter applies |
| `x-skill-index` | only on `GET /skills/list_skills`: the full skill index (see §3) |
| `x-runnable-index` | only on `POST /skills/run_skill`: runnable skill ids and their input/output schemas |

Spec-level: `x-services` (per-service metadata — lumenloop base/authEnv, scout origin, the full
stellarDocs `backend` block **and measured corpus taxonomy**, skills mirror provenance) and
`x-generated` (builder, generatedAt, catalog entry count).

## 2. Per-service mapping

- **lumenloop (18 exposed ops).** The exposed subset of the 21 inventory tools (the paid
  research lane — `request_research` trigger plus its `research_result`/`list_my_research` read
  half — is excluded at build time and never emitted) comes from the inventory *tools union* —
  NOT the embedded OpenAPI `/tools/*` paths — because that union carries `when_to_use` /
  `returns`, which are appended to each description exactly as the catalog builder does.
  `input_schema` → `requestBody`, `output_schema` → `responses.200`. The 15 non-tool endpoints in
  Lumenloop's embedded OpenAPI (account/billing: `/me*`, `/billing/topup`; discovery:
  `/changelog`, `/tools`, `/skills*`) are **not in the spec at all** (ADR-0003 dropped the
  "included for honesty but always denied" model — the spec describes only what code can call).
- **scout (30 exposed of 37 upstream ops** — the write/side-effecting endpoints and the
  feedback-schema dead end are excluded at build time**).** The embedded upstream OpenAPI is
  carried near-verbatim before general response compaction. Summary, description, tags, parameters,
  and request bodies remain unchanged. PathItem-level parameters are merged into each operation.
  Components are copied under namespaced names
  (`#/components/schemas/scout.Project`) with all `$ref`s rewritten accordingly. Every retained
  `$ref` stays resolvable inside the merged document. The sandbox's `__resolveRefs` inlines them
  on `codemode.spec()`. Oversized response schemas use the compact form from §1. Components that
  only supported compacted responses become unreachable and are pruned.
- **stellarDocs (12 ops, all allowed).** From the authored `specs/stellar-docs.json`: `params` →
  `requestBody`, `returns` → `responses.200.description`, the per-op `algolia` mapping preserved
  as `x-algolia`, and the shared backend block + measured taxonomy under
  `x-services.stellarDocs`. The taxonomy (~5 KB) earns its bytes: it is the greppable category
  tree of the docs corpus.
- **skills (4 ops)** — see §3.

## 3. Skills representation — judicious, not one path per section

The catalog has 19 mirrored public skills (**18 exposed** after the onboarding-skill retirement) +
204 skill-sections. Emitting a path per skill (or per section) would bloat `paths` with entries
that are not operations (nothing is *called* per skill) and drown the 50 real operations in
200+ pseudo-paths. Instead the skills service is **4 operations + embedded indexes**, designed
around "deliver skill context when and as relevant" plus the vetted runnable skill surface:

- `GET /skills/list_skills` — carries **`x-skill-index`**: the 18 exposed skills as
  `{ id, source, description, sections }`, where `description` is the skill's own frontmatter
  description (its "when to use" text) and `sections` is the **heading list only** (every `##`
  heading of SKILL.md plus `file:<relpath>` keys for extra reference files; bodies are NOT in the
  spec). 204 section keys total — asserted 1:1 against the catalog's exposed skill-section ids
  (the index is built from the same build-time-filtered manifest), so every listed section is
  guaranteed readable. Its `x-execute` shows the trick: the list is satisfied
  from the spec itself, `(await codemode.spec()).paths["/skills/list_skills"].get["x-skill-index"]`
  — works identically in the search sandbox and in execute.
- `POST /skills/read_skill` — `name` is an **enum of the 18 exposed skill ids** (no guessing), plus
  optional `sections` (headings, slugs, or `file:` keys) for partial retrieval.
  `x-execute: await codemode.skill.read(name, { sections })` — the real, existing affordance.
- `POST /skills/search_skills` — ranked lexical search over whole skills;
  `x-execute: await codemode.search({ query, kind: "skill", service: "skills" })`. Section keys
  stay in `availableSections` and are readable through `skill.read`, but do not enter ranking.
- `POST /skills/run_skill` — executes a runnable skill host-side through
  `codemode.skill.run(name, input)`. Current shipped state has one runnable id
  (`skills.lumenloop.stellar-ecosystem-digest`); the original two-runner design
  was narrowed when the project-dossier runner was retired on measured evidence.
  It carries **`x-runnable-index`** with exact runnable ids and their input/output
  schemas, so callers do not infer runnable status from prose.

Honesty rule: skills ops never pretend to be `skills.*` sandbox globals (none exist); each op's
`x-execute` names the actual `codemode.*` call. Lumenloop's 14 API-served skills stay out of this
index (metadata-only upstream; since ADR-0003 they are simply never emitted — the
`lumenloop.skill.*` twin namespace and the store read-alias are both gone). Public mirrored bodies
live under canonical `skills.*` ids; partner-set skills remain name-only inventory stubs and are
not mirrored.

## 4. Size — measured, not guessed

From `npm run spec:build` (current — 2026-09-03, committed Scout 1.9.1 after the rejected
1.9.23 routing candidate; sizes drift with each daily refresh, so treat exact bytes as as-of
values, not invariants):

| Measure | Value |
|---|---|
| Paths / operations | 64 paths / 64 operations, all callable (18 lumenloop, 30 scout, 12 stellarDocs, 4 skills) |
| Pretty (checked-in) | 287,782 bytes; drift-checked by `test/super-spec.test.ts` |
| Compact — the serialized in-sandbox form | 174,786 bytes; must stay below the test-enforced 300 KiB limit |
| Largest single op | `skills.list_skills` (~20 KB — the embedded index) |

Decision: **the full operation surface ships, with oversized response schemas compacted.** The
hard compact limit remains below 300 KiB. The shared 2,000-character rendered-output rule selects
schemas for compaction. The builder does not use operation names or service-specific size rules.
Full output schemas remain in `catalog/manifest.json` and `codemode.describe("<id>")`.

These tokens never enter the model's context unless sandbox code returns them. The per-call cost
is isolate CPU and memory. The serialized spec string is cached per isolate
(`getSerializedSpec()` in `src/executor/run.ts`). It is escaped and stringified once per isolate.

Determinism: keys sorted recursively, `generatedAt` inherited from catalog/manifest.json (itself
derived from input snapshot timestamps, never wall clock). Two consecutive builds are
byte-identical, and the checked-in artifact must match a fresh build (both test-asserted).

## 5. Deltas from the upstream pattern (@cloudflare/codemode 0.4.2 mcp.ts)

Mirrored **exactly** (in the code-shaped search sandbox — retired from the top-level `search`
slot by ADR-0001 and kept for eval comparison via `src/executor/spec-sandbox.ts`; the live
top-level `search` is the ranked query tool and embeds none of these templates):

- `search` is LLM-written JS with input `{ code }`, executed in a Dynamic Worker against
  `codemode.spec()`; NO providers in the search sandbox (read-only over spec data, no secrets).
- The generated sandbox source (`createSpecSandboxCode` in src/executor/spec-sandbox.ts): spec
  JSON inlined with `</` escaped, `__resolveRefs` with ref cache + `structuredClone` +
  `$circular` markers + external refs passed through, lazy `__resolvedSpec`, in-sandbox
  `__truncateResponse`, `normalizeCode` applied to the LLM code (vendored 1:1 incl. acorn).
- Truncation constants and semantics: 4 chars/token, 6,000-token cap, `--- TRUNCATED ---` footer
  with real pre-truncation size, `sandboxResponseText` pass-through of already-truncated strings
  (≤ 24,512 chars) host-side.
- Tool description templates: SEARCH types-block + async-arrow contract + worked examples;
  execute exposes `codemode.spec()` alongside its call surface (REQUEST_TYPES spirit); errors
  returned as `Error: <message>` isError results; search drops sandbox logs (upstream does too).

Deliberate deltas (each with rationale):

1. **Multi-service super spec, not one upstream OpenAPI doc.** Four services merged under
   namespaced paths + components; vendor extensions (§1) carry what a single-API spec never
   needed (cross-sandbox call lines, the skills index, and the runnable-skill index).
2. **No `codemode.request()` — per-operation fns instead.** Upstream's execute funnels every call
   through a generic `request({method, path, ...})`. Our execute already exposes exact-named fns
   (`lumenloop.search_directory(args)`…) behind guard/validation/redaction — the model never owns
   URLs (ADR pitfall). `x-execute` on each op replaces the method+path recipe.
3. **execute's `codemode.spec()` crosses the provider RPC, not the sandbox source.** Upstream
   injects the spec into the execute wrapper too; ours would shadow the `codemode` provider
   global (search/catalog/describe/skill.read live there). `resolveSpecRefs`
   (src/executor/spec-sandbox.ts) is the host-side twin of `__resolveRefs` — same algorithm,
   test-asserted equal output — resolved lazily once per runner.
4. **Two tools ship — the code-shaped search retired (ADR-0001).** The A/B settled 2026-07-02 in
   favor of the host-side ranked query as the top-level `search`; the code-shaped variant moved
   into `execute`'s sandbox. Inside execute, `codemode.spec()`, `codemode.search`, and
   `codemode.catalog()` all remain. The catalog view and the spec answer different grains: flat
   scored entries with full schemas versus an OpenAPI operation map with compact oversized outputs.
5. **~~Denied ops visible with `x-policy.allow=false`~~ — retired by ADR-0003.** The original
   delta made denied ops see-but-not-call; build-time exposure filtering removed the policy
   concept entirely, so this delta no longer exists (the spec now matches upstream in having no
   policy fields — everything emitted is callable).
6. **Skills as a first-class service** (§3) — no upstream analog.
7. **Envelope guard prelude** (src/executor/providers.ts `envelopeGuardPrelude`; upstream returns
   dispatch results raw). Observed LLM failure mode in production (2026-07-02, Claude Desktop):
   payload fields read one level too shallow (`r.projects` for `r.data.projects`) yield
   `undefined`, which a defensive `|| []` turns into a fake empty result. A prelude wraps every
   service fn and plants NON-ENUMERABLE accessor pairs on each envelope, with a split contract:
   on an `ok:true` result a payload-key read (`r.projects`) THROWS naming the correct path
   (`r.data.projects`); on an `ok:false` result `r.data` returns `undefined` and console.logs ONE
   deduped `[envelope]` warning naming the real service error; and in both cases a SET writes
   through (decorating the returned envelope stays legal, and a frozen envelope throws loudly at
   the write). Object.keys/JSON/structured-clone and the Workers-RPC return path all read
   enumerable-only, so they stay untouched — only direct wrong-level access trips a trap. Same fix
   surfaced in the other three teaching channels: rendered signatures spell out the full envelope union
   (src/catalog/search.ts `renderSignature`), `search`'s nextSteps restates the `.data` rule every
   call, and MCP initialize `instructions` (SERVER_INSTRUCTIONS in src/mcp/tools.ts) carry the
   workflow + envelope contract into the client's system prompt.

## 6. Test coverage

- `test/super-spec.test.ts` — determinism (double build byte-identical + artifact freshness),
  per-service counts (exposed ops only, ADR-0003), path/operationId invariants, x-execute on
  every op, spec = manifest consistency both directions, skills index ↔ catalog section 1:1
  (all 204 exposed), read_skill enum = 18 exposed ids, run_skill enum/index = runnable manifest
  entries, stellarDocs x-algolia, scout $ref resolvability, response-schema compaction, unchanged
  small schemas, exact top-level fields and pointers, and the <300 KiB compact budget.
- `test/executor-providers.test.ts` — `codemode.describe` preserves the full schema when the super
  spec carries a compact response schema.
- `test/spec-sandbox.test.ts` — generated-source shape, `</` escaping, fence normalization, and
  the wrapper EVALUATED under Node: $ref inlining, `$circular`, external-ref pass-through, lazy
  spec caching, in-sandbox truncation format, host-side helpers, host/sandbox resolver parity,
  plus a run against the real super spec.
- `test/server.test.ts` — asserts exactly two tools registered (`["execute", "search"]`);
  `search` is the host-side ranked query `{ query, kind?, service?, limit? }` (required `query`);
  `execute` is `{ code }`; runner-injection and error-as-data behavior for the execute sandbox.
- `test/live/run-live-spec-search.mjs` — wrangler dev + real Dynamic Workers: service listing
  (and proof the search sandbox has no service globals), SEP-24 discovery across services, skills
  index grep, live in-sandbox truncation, and an execute run using `codemode.spec()` mid-script
  followed by a real `stellarDocs.search_anchor_sep_docs` call. All 5 cases pass.
