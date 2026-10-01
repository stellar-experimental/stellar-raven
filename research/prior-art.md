# Prior art: stellar-raven-next / stellar-raven → codemode server

> **Retired sources — historical map only.** The sibling repos `../stellar-raven`,
> `../stellar-raven-next`, and `../raven-golden-qa` are retired. Everything of value was already
> vendored into `eval/corpus/` (provenance + checksums in `eval/corpus/PROVENANCE.md`); this
> doc's "Reuse shortlist" below is fully consumed. Keep this as the historical map of what those
> repos contained — do not add new dependencies on the sibling paths.

Mined 2026-07-01 from:

- `/Users/kalepail/Desktop/stellar-raven-next` — **primary** (forward-only rebuild, current)
- `/Users/kalepail/Desktop/stellar-raven` — older sibling (carries 25 detailed ADRs and the original
  81 KB `src/capability-index.ts` that the rebuild dropped)
- Briefly: `/Users/kalepail/Desktop/stellar-raven--legacy`, `/Users/kalepail/Desktop/raven-golden-qa`

Target: a single "codemode" MCP server exposing **search + execute** over a unified API layer
covering Lumenloop, Stellar Light/Scout, and Stellar Docs MCP, plus a selectively-exposed skills
directory.

Headline: Raven-next already contains almost every ingredient — a typed tool manifest for all three
services, a pure HTTP/MCP call planner+executor per service, a measured 45-surface machine-readable
capability manifest with a smoke check, a manifest-validated 25-skill mirror with sectioned
SKILL.md files, a DO-backed McpAgent surface, and a 538-question golden battery. What it does *not*
have is codemode itself: no search/execute tool pair, no sandbox. The vendored Cloudflare docs at
`agents-docs/docs/codemode/` describe exactly the `codemode.search`/`codemode.describe` + connector
pattern the new project wants.

---

## 1. Service adapters (`src/agents/*`)

### What exists

In stellar-raven-next the four "adapters" are 8-line Durable Object shells; all real logic is a
shared base class + one 1,712-line engine + a declarative manifest:

| File | Lines | Role |
|---|---|---|
| `/Users/kalepail/Desktop/stellar-raven-next/src/agents/lumenloop/agent.ts` | 8 | `LumenLoopAgent` → `runFirstWaveServiceJob(input, "lumenloop")` |
| `/Users/kalepail/Desktop/stellar-raven-next/src/agents/stellar-light/agent.ts` | 8 | `StellarLightAgent` → `"stellar_light"` |
| `/Users/kalepail/Desktop/stellar-raven-next/src/agents/docs-mcp/agent.ts` | 8 | `DocsMcpAgent` → `"docs_mcp"` |
| `/Users/kalepail/Desktop/stellar-raven-next/src/agents/super-agent/agent.ts` | 8 | `SuperAgent` → `"super_agent"` (routes to the other three natives) |
| `/Users/kalepail/Desktop/stellar-raven-next/src/agents/service-lane/agent.ts` | 93 | `RavenServiceLaneAgent` base (Agents SDK `Agent` + `@cloudflare/shell` Workspace + fibers) |
| `/Users/kalepail/Desktop/stellar-raven-next/src/agents/service-lane/tool-loop.ts` | 1712 | **The actual client engine**: call planners, HTTP/MCP execution, normalization, artifacts |
| `/Users/kalepail/Desktop/stellar-raven-next/src/agents/service-lane/planner.ts` | 460 | manifest-enforced deterministic planning + gate validation |
| `/Users/kalepail/Desktop/stellar-raven-next/src/agents/service-lane/model-planner.ts` | 551 | optional LLM planner (Workers AI binding + AI Gateway, advisory only) |
| `/Users/kalepail/Desktop/stellar-raven-next/src/services/manifests.ts` | 466 | `SERVICE_MANIFESTS: Record<FirstWaveService, ServiceManifest>` — every tool as a `ServiceToolCard` (arg schemas, `defaultAction: seed/expand/selective/deny`, budget caps) |
| `/Users/kalepail/Desktop/stellar-raven-next/src/services/surface-map.ts` | 53 | tool name → telemetry surface id |

### Downstream endpoints per service (all in `tool-loop.ts`)

- **LumenLoop** (`planLumenLoopCall`, lines 885–962): `POST https://api.lumenloop.com/v1/tools/${tool}`,
  JSON body = args. 18 read tools (`search_content_semantic`, `find_content_by_entity`,
  `search_directory`, `get_project`, `search_documents`, `get_document`, `find_similar_scf_submissions`,
  vocab/utility tools, …). Auth: `Authorization: Bearer ${LUMENLOOP_API_KEY}` (throws if absent,
  lines 1195–1199). `request_research`/`research_result` are paid and gated in a separate lane
  (`src/agents/lumenloop-research/`, policy in `src/agents/research-lane/policy.ts`).
- **Stellar Light / Scout** (`planStellarLightCall`, lines 968–1064): `GET https://stellarlight.xyz/api/...`,
  args → query string. Paths: `/api/status`, `/api/changelog`, `/api/research`, `/api/projects/search`,
  `/api/repos/search`, `/api/repos/explain`, `/api/builders`, `/api/partners[/{slug}]`, `/api/rfps`,
  `/api/hackathons[/{slug}|/compare]`, `/api/skills[/{slug}]`, `/api/clusters`, `/api/analyze`,
  `/api/leaderboard`. **No auth.**
- **Stellar Docs MCP** (`planDocsMcpCall` + `executeDocsMcp`, lines 1066–1085, 1238–1259): MCP
  streamable-HTTP to `https://VNSJF5AWIZ.algolia.net/mcp/1/yXtzs-p7TOyu9BQddSwV9g/mcp`
  (constant `DOCS_MCP_ENDPOINT`, line 97). Sequence: `initialize` (protocol `2025-06-18`) →
  `notifications/initialized` → `tools/call`. Only tool allowed:
  `algolia_search_index_docs_replica_agent` (`algolia_search_for_facet_values` measured broken →
  deny). **No auth header sent** — see pitfalls.

### Types worth knowing

`ServiceAgentReport`, `PlannedCall { service; tool; transport; method: "GET"|"POST"|"MCP"; url; args }`,
`ToolCallResult`/`ToolCallSourceRow`, `NormalizedResponse` (discriminated `evidence | soft-empty | error`),
`LoopContext` (slug/ref accumulator driving expand tools) — all in `tool-loop.ts`;
`ServiceManifest`/`ServiceToolCard`/`ServiceBudgetEnvelope` in `services/manifests.ts`.

### Retry / error handling

No retry loop; resilience = per-call `AbortSignal` deadline (`runWithDeadline`, `harness/deadline`),
idempotency-key replay through `ExternalCallLedger` (succeeded calls replayed, not re-issued),
4xx parsed as soft error / 5xx thrown (`parseResponseJson`, line 1358), failures folded into
`ArtifactOmission` (never thrown out of the loop), duplicate suppression via idempotency-key set.

### Reusable vs rebuild

- **Lift verbatim (pure, depend only on `fetch` + key string):** `planLumenLoopCall`,
  `planStellarLightCall`, `planDocsMcpCall`, `executeHttpCall`, `executeDocsMcp`, `callMcpTool`,
  `postMcp`, `parseSse`, `parseJsonRpc`, `parseResponseJson`, `normalizeLumenLoop`/`normalizeScout`,
  `citableRecords`, `redact`, and all of `services/manifests.ts` + `surface-map.ts`. Together this
  IS the unified client library the codemode server needs.
- **Rebuild / leave behind:** `RavenServiceLaneAgent`, the tool-loop orchestration, fibers,
  Workspace bundles, ledger/governor coupling — all entangled with the multi-agent research
  pipeline the codemode server doesn't need.
- **Older repo delta worth recovering:** old `McpHttpClient`
  (`/Users/kalepail/Desktop/stellar-raven/src/gather/executor.ts` ~1209–1290) handled
  `mcp-session-id` and sent Bearer auth on MCP calls; next's `postMcp` dropped both. Also, the old
  `capability-index.ts` cards carried `endpoint` URL + `access.apiKeyEnv` **in the manifest**;
  next inlined URLs in code. For codemode, put URL + auth-env back in the manifest so
  search/execute can be fully data-driven.

## 2. Capability index

### What exists

- Spec: `/Users/kalepail/Desktop/stellar-raven-next/research/capability-index.md` (9.5 KB) —
  "measured, not written": probe → AI-judge → distill; one scored artifact consumed by router,
  executor, evals, governance.
- Per-service measured dossiers in `/Users/kalepail/Desktop/stellar-raven-next/research/capability/`:
  `lumenloop.md` (64 KB), `stellar-light-scout.md` (47 KB), `stellar-docs-mcp.md` (22 KB),
  `parallel.md` (33 KB), `perplexity.md` (28 KB). Each is per-tool cards with `output_shape`
  (full JSON shape), `cost_tier`, qualitative `latency`, `good_at`/`bad_at`, `example_queries`,
  governance fields, plus dated raw probe transcripts and runtime-readiness verdicts. Re-measured
  2026-06-29 → 07-01.
- **Machine-readable manifest — yes:**
  `/Users/kalepail/Desktop/stellar-raven-next/research/capability/full-surface-manifest.json`
  (17.7 KB). 45 surfaces (routable 34 / utility 6 / async 3 / denied 2; lumenloop 22,
  stellar_light 19, stellar_docs 1, parallel 2, perplexity 1). Per surface:
  `surfaceId`, `service`, `endpoint` (full URL), `class`, `cardId`,
  `callPattern` (direct-query / resolve-then-call / enum-param / expand-from-artifact /
  collection-browse / collection-keyword / utility-vocab / utility-status / async-research),
  `family`, `routableVia`, `runtimeReady`, `reason`.
- Second machine-readable source: per-tool **arg schemas** in
  `src/services/manifests.ts` (`argSchema.required/optional` with type/enum/min/max/default,
  `knownErrorTriggers`).
- `npm run smoke:surfaces` → `/Users/kalepail/Desktop/stellar-raven-next/src/smoke/surfaces.check.ts`
  (11.5 KB). Offline, no network: validates manifest invariants (exact counts, unique ids, enum
  membership, denied-surfaces-uncarded, reasons present), cross-checks `SERVICE_MANIFESTS` and
  research-lane policies so every runtime tool maps to a measured runtime-ready surface, and
  asserts `capability-index.md` matches. Exits non-zero on drift.

### Reusable vs rebuild — and the gap

The manifest JSON schema + smoke-check pattern is exactly the "auto-refreshable inventory of
downstream tools" the codemode server needs; adopt both nearly verbatim. Two gaps:

1. **Stale generator.** `generatedFrom: "src/capability-index.ts"` points at a file that now exists
   only at `/Users/kalepail/Desktop/stellar-raven-next/src-legacy/capability-index.ts` (and live in
   the older repo at `/Users/kalepail/Desktop/stellar-raven/src/capability-index.ts`, 81 KB). There
   is **no current regeneration script** — refresh is manual. The new project should build the
   auto-refresh loop (live probe → regenerate manifest → smoke check) that the docs describe but
   the code no longer implements.
2. Latency/cost are qualitative tiers, not measured numbers. Fine to start; consider recording
   measured latency during the probe pass.

## 3. Skills directory

### ecosystem-skills/ (stellar-raven-next) — 25 skills, 5 sources

Root: `/Users/kalepail/Desktop/stellar-raven-next/ecosystem-skills/skills/`. Full inventory
(bytes are SKILL.md size; extras in `reference/` or `references/`):

**Source `lumenloop`** (GitHub `lumenloop/lumenloop-skills`, pinned d92c56bd):

| Skill | Size | Structure | Description (truncated) |
|---|---|---|---|
| lumenloop-mcp-connect | 10,145 b / 211 ln | + reference/tool-catalog.md (5,896) | Connect any MCP client to LumenLoop's free read-only Stellar ecosystem MCP |
| scf-submission-radar | 8,516 / 201 | + reference/positioning-brief-template.md | Position an SCF idea against prior submissions using LumenLoop SCF data |
| stellar-builder-quickstart | 10,833 / 228 | + reference/build-plan-template.md | From product idea to build path; check prior art via LumenLoop |
| stellar-content-auditor | 6,538 / 125 | + reference/audit-report-template.md | Audit/enrich a draft against LumenLoop ecosystem data |
| stellar-ecosystem-digest | 10,869 / 253 | + reference/digest-template.md | Dated, cited digest of recent Stellar ecosystem activity |
| stellar-ecosystem-scout | 10,702 / 220 | + reference/landscape-template.md | Map a sector into a landscape of projects/categories/regions |
| stellar-integration-finder | 10,436 / 197 | single file | Find the right existing Stellar project/tool to integrate |
| stellar-project-dossier | 10,719 / 250 | + reference/dossier-template.md | Due-diligence profile of a single Stellar project |

**Source `lumenloop-api`** (partner archive from `api.lumenloop.com/v1/skills`, needed
`LUMENLOOP_API_KEY`): six partner-set onboarding skills (`lumenloop-api-billing`, `-connect`,
`-integrate`, `-keys`, `-query`, `-research`) teaching direct REST access to the partner tier.
Their per-skill sizes/summaries are deliberately not reproduced here: the family was retired
from catalog exposure 2026-07-03 and its mirror source removed 2026-07-06 (partner-tier content
is never committed to this public repo — see CLAUDE.md rules).

**Source `openzeppelin-stellar`** (GitHub `OpenZeppelin/openzeppelin-skills`, pinned d72005b5) —
all single-file: develop-secure-contracts (13,227 / 194), setup-stellar-contracts (3,616 / 112),
upgrade-stellar-contracts (8,385 / 145).

**Source `stellar-dev`** (GitHub `stellar/stellar-dev-skill`, pinned 54e469ab):

| Skill | Size | Structure |
|---|---|---|
| agentic-payments | 27,516 / 626 | single (x402 half + MPP half) |
| assets | 12,579 / 452 | single |
| dapp | 20,041 / 684 | single (has `## Quick Navigation` chunk index) |
| data | 14,633 / 546 | single |
| **smart-contracts** | 6,578 / 193 | **multi-file router**: + development.md (11,325/286), security.md (7,140/164), testing.md (8,735/246) |
| standards | 45,068 / 864 | single — largest; ~40 independent `##` reference chunks |
| zk-proofs | 12,364 / 234 | single |

**Source `stellar-light`** (GitHub `Stellar-Light/stellar-scout`, pinned b95a7435):
stellar-scout (26,864 / 285) — **multi-file**: + README.md (5,841), references/api-reference.md
(23,040/244), references/examples.md (13,201/152).

### Sectioning (for partial retrieval)

House style: every SKILL.md opens `## When to use this skill` → `## Related skills`, then
skill-specific `##` sections; lumenloop family ends `## Gotchas` / `## Pointers`. Large skills are
already excerpt-boundary-friendly: `standards` is ~40 self-contained `##` reference chunks;
`agentic-payments` bisects into an x402 half and an MPP half, each `##` a coherent excerpt;
`dapp` ships its own `## Quick Navigation` index of chunks. Two skills model the "serve portions
on demand" idea structurally: `smart-contracts` (thin SKILL.md router → development/testing/security
files) and `stellar-scout` (SKILL.md → references/*). **Recommendation:** partial retrieval by
top-level `##` heading for single-file skills, and by companion file for multi-file skills.

### Manifests, validation, sync

- `/Users/kalepail/Desktop/stellar-raven-next/ecosystem-skills/MANIFEST.json` (15.5 KB) —
  authoritative: per-source pinned commit + `synced_at`, per-file `{path, size, sha}`,
  `skill_count: 25`, `status: complete|partial`.
- `groups.json` (4 themes: ecosystem-research, lumenloop-api, soroban-contracts, stellar-appdev),
  `catalog.json` (snapshot of stellarlight.xyz/api/skills ~30-entry external directory),
  `INDEX.md` auto-generated by `ecosystem-skills/build-index.mjs`.
- Sync: `/Users/kalepail/Desktop/stellar-raven-next/ecosystem-skills/update.sh` (14.5 KB) —
  `gh`/`curl` raw downloads at pinned commits, rewrites MANIFEST.json; failed closed if the
  `lumenloop-api` partner key was missing. (THIS repo's fork of the script dropped the
  credentialed source entirely 2026-07-06 and is keyless.)
- Validation: `npm run check:mirrors` → `/Users/kalepail/Desktop/stellar-raven-next/scripts/check-mirrors.mjs`
  — requires `status === "complete"`, every manifest file on disk, `skill_count` matches, no skill
  in two groups, no ungrouped skill, catalog.json present (plus the analogous checks for
  `agents-docs/`).
- **Runtime note:** the deployed Raven worker never loads `ecosystem-skills/` (zero refs in
  `src/`); it's dev-time reference / capability-index input (see
  `/Users/kalepail/Desktop/stellar-raven-next/research/ecosystem-skills.md`). Exposing skills at
  runtime is greenfield for the codemode server — but the MANIFEST/update.sh/check-mirrors trio is
  the sourcing pipeline to reuse as-is.

### .agents/skills/ (dev-harness skills, 4, single-file)

`cloudflare-agents` (4,878 b — reads the agents-docs mirror), `ecosystem-skills` (6,168 b — meta
skill for the mirror), `eval-improvement` (5,635 b), `raven-golden-evals` (7,291 b). Same set in
the older repo. Prior-prior art: `/Users/kalepail/Desktop/stellar-raven--legacy/service-skills.manifest.json`
is an earlier machine-readable skill source map (21 skills, per-skill upstream URLs) — same idea,
superseded by ecosystem-skills/MANIFEST.json.

## 4. MCP surface (`src/mcp/`)

- `/Users/kalepail/Desktop/stellar-raven-next/src/mcp/raven-mcp.ts` (185 ln):
  `class RavenMcp extends McpAgent<RavenEnv, ..., RavenProps>` (`agents@^0.17.3` `agents/mcp`)
  holding `new McpServer({ name: "stellar-raven", ... })` from `@modelcontextprotocol/sdk@^1.29.0`;
  three `this.server.registerTool(name, { description, inputSchema: ZodObject.shape }, handler)`
  calls for `raven_start` / `raven_poll` / `raven_result`. Handlers route to the per-query
  `RavenRun` DO via `getAgentByName(this.env.RAVEN_RUN, queryId)`; results wrapped as
  `{ content: [{ type: "text", text: JSON.stringify(...) }] }` plus prose guidance (poll cadence
  ladder in `nextPollGuidance`).
- Transport: `RavenMcp.serve("/mcp")` in `/Users/kalepail/Desktop/stellar-raven-next/src/server.ts`
  — Agents SDK streamable-HTTP (SSE-capable). Wrapped in `@cloudflare/workers-oauth-provider`
  (WorkOS AuthKit) with a `RAVEN_ADMIN_TOKEN` bypass. DO-backed: wrangler.jsonc binds
  `RavenMcp → MCP_OBJECT` and `RavenRun → RAVEN_RUN` (`new_sqlite_classes` migrations).
- Schemas: `/Users/kalepail/Desktop/stellar-raven-next/src/schema/mcp.ts` — zod `StartInput`
  (query + optional idempotent `queryId` `^[A-Za-z0-9._:-]+$`), `PollInput`, `ResultInput`
  (`detail: "compact"|"extended"`, raw rejected).
- `npm run test:mcp-surface` → `src/mcp/surface.check.ts`: asserts exact tool names/order,
  `raven_retry` absent, and zod accept/reject cases. Schema-level only — the older repo's real
  transport test (`/Users/kalepail/Desktop/stellar-raven/src/gather/mcp-transport.check.ts`,
  224 ln) was dropped; worth reviving for the new server.

**For the new 2-tool server:** copy the `McpAgent`+`McpServer`+`registerTool`+`json()` skeleton,
the zod-`.shape` schema pattern, the `serve("/mcp")` mount, the wrangler DO-binding/migration
pattern, and `surface.check.ts` as the surface-test template. Register `search` and `execute`
instead of start/poll/result. For `execute` calling downstream MCP (Algolia docs), lift
`callMcpTool`/`postMcp`/`parseSse` from `tool-loop.ts`.

## 5. Eval / golden harness

> **2026-07-02 — corpus vendored ahead of raven-repo retirement.** The golden corpora described
> below are now snapshotted in-repo under `eval/corpus/` (see `eval/corpus/PROVENANCE.md` for
> commits, checksums, overlap facts, and what was deliberately excluded). Both eval compile
> scripts read the vendored copies; the sibling checkouts are no longer needed.

- Corpus: `/Users/kalepail/Desktop/stellar-raven-next/research/golden/` — 9 topical category dirs
  + `_meta/` + `_dossiers/` + `_candidates/`; compiled to `compiled/golden.json` (**538 cases**,
  1.56 MB; older repo: 395). Source frontmatter per question is richly labeled: `expected_service`,
  `expected_cards`/`acceptable_cards`/`forbidden_cards`, `should_fire`, `must_have[{claim,weight}]`,
  `must_avoid`, `must_cite`, `pass_threshold`, `freshness_sensitive`, axes, sources.
- Harness: `/Users/kalepail/Desktop/stellar-raven-next/eval/` — `cli.ts` (73 KB) drives live MCP
  start/poll/result against local or prod, captures dated artifacts under `eval/runs/`, runs
  deterministic routing-contract + source-fidelity checks and symptom classification; **semantic
  verdicts come from Solo-orchestrated reviewer agents** writing `analyses/<reviewer>.json`
  sidecars (verdict/score/stage/reasoning), folded in by `apply-reviews`. Explicit rule: no hidden
  judge model in the harness. Plus `eval/ab/` (A/B), `eval/poster-cli.ts` (5-question live smoke),
  `eval/oauth-token.mjs`.
- **Fit for the new unified search:** yes, with one caveat. Canonical answers/guidance are
  service-agnostic, and `expected_service`/`expected_cards` in the source frontmatter can grade
  whether unified search surfaces the right backend. But **the compile step drops those labels** —
  `compiled/golden.json` keeps only id/question/category/canonicalAnswer/answerGuidance/sources/
  freshnessSensitive. To test search routing, re-compile keeping `expected_service`/`expected_cards`.
- Raw corpus prior art: `/Users/kalepail/Desktop/raven-golden-qa/big.json` — 395 questions with the
  full labeled schema (incl. `expected_service`, rubric, difficulty) in one JSON file; plus
  `jutsu_stellar_questions_export/` (raw user-question export: questions.jsonl/csv/md, threads).
  Note: `acceptable_cards` is non-empty on 383/395 and crosses services on 361 — corpus-authored
  accept-either tolerance our routing compile currently drops (Solo todo 817).

## 6. Key ADRs

Primary, `/Users/kalepail/Desktop/stellar-raven-next/research/decisions/` (8):
0001 forward-only rebuild (public surface = start/poll/result, retry removed);
0002 Raven-owned harness on Agents SDK, not Project Think;
0003 planner via Workers AI binding — **model output advisory, manifest-validated; model-owned
endpoint args explicitly rejected**;
0004 real service Agents + Workspace artifact contract + live-eval gate;
0005 forward-only model config (`xai/grok-4.3` only, stale ids fail fast);
0006 research lanes are typed TypeScript policy (`src/agents/research-lane/policy.ts`), not prompts;
0007 bounded autonomous loops with code-owned invariants (manifest legality, idempotency, stop
conditions, **no per-question overfitting**);
0008 evidence-bearing vs operational fields separated in public results; raw stays admin-only.

Older repo, `/Users/kalepail/Desktop/stellar-raven/research/decisions/` (25) — rationale that
survives nowhere else and matters most for codemode:

- **ADR-0013 (capability index):** measured-not-written; governance as policy fields, not a banned
  boolean; per-card transport; the 2026-06-22 deep-dive that caught real bugs. Carry over.
- **ADR-0019 (full-surface callability):** declarative `callPattern` executor; per-card
  `resultShape{evidencePaths, softEmptyPaths, errorPaths}`; two-tier selection (intent families vs
  physical calls); **safe slug resolution** — accept a resolved slug only on exact/near-exact
  match; top-hit extraction is a proven wrong-entity bug (`search_directory("soroswap")` → rank-1
  "Orion"). This is the blueprint for a data-driven unified `execute`. Carry over strongly.
- **ADR-0014 (skills split):** capability knowledge → index (data); execution know-how →
  per-tool micro-skills (eval-attributable), not persona prompts. Directly relevant to selectively
  exposing skill portions; the primary dropped micro-skills — codemode can revive the idea.
- **ADR-0018 (LumenLoop paid research):** cost gating discipline — prefer the cheapest output
  mode, dedup via `list_my_research` before re-commissioning, budget guard, redact everything.
- **ADR-0010 (retrieval-first routing):** rejected O(N) per-tool assessor fan-out. Primary
  reversed to always-fan-out-4-lanes; a codemode server with model-authored code flips this again —
  discovery moves into the sandbox (`search`), so neither router applies verbatim.

Pitfalls the ADRs warn about, distilled: never let the model own endpoint args/auth (validate
against the manifest); soft-empty ≠ error ≠ evidence (per-service normalizers required); slug/id
resolution must be exact-match-guarded; deny-listed tools must stay machine-checkable; paid calls
need dedup + budget caps; don't overfit gates to individual golden questions; DO in-memory state
can vanish (checkpoint if stateful).

## 7. NEXT.md / SYSTEM-MAP.md / codemode mentions

- `/Users/kalepail/Desktop/stellar-raven-next/research/NEXT.md` — Phase 17 runtime-quality work
  (semantic-gate hardening, typed selective capabilities, moving canonical source lists into
  `research/capability/`). **No codemode direction contemplated.**
- `/Users/kalepail/Desktop/stellar-raven-next/research/SYSTEM-MAP.md` — the multi-agent
  gather/synthesize/escalate pipeline behind raven_start/poll/result. No codemode.
- `grep -ri codemode` across both repos: hits only in `agents-docs/docs/codemode/` (+
  `agents-docs/docs/agents/codemode.md`), AGENTS.md pointers to that mirror, and package-lock.
  These are the **vendored Cloudflare `@cloudflare/codemode` docs** (index, runtime, connectors,
  approvals, snippets, vite-plugin): `createCodemodeRuntime({ ctx, executor, connectors })`, the
  model-facing `codemode.search`/`codemode.describe` discovery pair, `McpConnector`, sandboxed
  `DynamicWorkerExecutor` with no network, approval/rollback log. So codemode was **not** a
  planned Raven direction, but the exact implementation guide for it is already mirrored in-repo at
  `/Users/kalepail/Desktop/stellar-raven-next/agents-docs/docs/codemode/`.

## 8. Sibling repos (quick check)

- `/Users/kalepail/Desktop/raven-golden-qa` — raw golden-QA corpora (now vendored in
  `eval/corpus/raven-golden-qa/`): `big.json` (395 fully-labeled route-card questions — the old
  stellar-raven's compiled battery; 392/395 are a subset of raven-next's 538) and a **disjoint
  semantic battery** (og/boxy/kaan/raph/flue.json, 266 cases / 161 unique questions — NOT
  reviewer variants of big.json). The semantic files carry `expect.semantic` rubrics
  (passIf/failIf/inconclusiveIf/canonicalFacts/discriminator) and `skillsAny` labels using our
  ecosystem-skill names; `boxy.json` is a 21-question live-data discrimination set
  (`liveSource: true`). Their question *content* was already reconciled into the 538 upstream
  (see [`eval/corpus/raven-next/research/golden/_meta/_prior-art/`](https://github.com/stellar-experimental/stellar-raven/blob/6dd9439461a286f5ca5f87722fb60f238c610d3d/eval/corpus/raven-next/research/golden/_meta/_prior-art/)); the rubric machinery, skill
  labels, and 8 still-deferred candidates remain unconsumed (Solo todo 818). Plus
  `jutsu_stellar_questions_export/` (real user questions; already mined upstream into +144
  goldens). The raw deduped pool was **removed** from this repo for privacy (it contained
  real user ids plus user-pasted secret keys/emails) — it is not vendored here; re-export
  from the source system if mining is ever repeated.
- `/Users/kalepail/Desktop/stellar-raven--legacy` — the pre-rebuild product: Think-based chat +
  MCP (`ask_stellar_raven`), WorkOS auth, and `service-skills.manifest.json` (21-skill
  machine-readable source map with per-skill upstream URLs — ancestor of ecosystem-skills
  MANIFEST). Reference only.

---

## Reuse shortlist

| Artifact | Path (stellar-raven-next unless noted) | Reuse |
|---|---|---|
| Service tool manifests (`SERVICE_MANIFESTS`) | `src/services/manifests.ts` | **Adapt** (add endpoint URL + apiKeyEnv per card, per old ADR-0019 design) |
| Surface-id map | `src/services/surface-map.ts` | Verbatim |
| Call planners (`planLumenLoopCall`/`planStellarLightCall`/`planDocsMcpCall`) | `src/agents/service-lane/tool-loop.ts` (lines ~885–1085) | Verbatim (extract to client lib) |
| HTTP/MCP executors (`executeHttpCall`, `executeDocsMcp`, `callMcpTool`, `postMcp`, `parseSse`) | `src/agents/service-lane/tool-loop.ts` (~1090–1423) | Verbatim; **add back** session-id + Bearer from old `McpHttpClient` (`stellar-raven/src/gather/executor.ts`) |
| Response normalizers (`normalizeLumenLoop`, `normalizeScout`, `redact`) | `src/agents/service-lane/tool-loop.ts` (~1261+) | Verbatim |
| Full-surface manifest (45 surfaces, JSON) | `research/capability/full-surface-manifest.json` | Adapt (fix stale `generatedFrom`; build auto-refresh probe) |
| Surface smoke check | `src/smoke/surfaces.check.ts` | Adapt |
| Measured capability dossiers | `research/capability/*.md` | Reference only (source truth for good_at/bad_at, deny reasons) |
| Skills mirror + manifest + groups | `ecosystem-skills/` (`MANIFEST.json`, `groups.json`, `catalog.json`, `skills/`) | Verbatim (25 skills, pinned SHAs) |
| Skills sync + validation | `ecosystem-skills/update.sh`, `scripts/check-mirrors.mjs`, `ecosystem-skills/build-index.mjs` | Adapt |
| McpAgent server skeleton | `src/mcp/raven-mcp.ts`, `src/server.ts`, `src/schema/mcp.ts`, `wrangler.jsonc` DO bindings | Adapt (swap 3 tools → search/execute; simplify auth) |
| MCP surface test template | `src/mcp/surface.check.ts` | Adapt |
| Old declarative capability index (endpoint+auth+callPattern per card) | `stellar-raven/src/capability-index.ts` (81 KB; also `stellar-raven-next/src-legacy/`) | Reference only (schema ideas) |
| Golden corpus (538 compiled; labeled sources) | `research/golden/` + `eval/cli.ts` + `raven-golden-qa/big.json` | Adapt (recompile keeping `expected_service`/`expected_cards` for search-routing grading) |
| Cloudflare codemode docs mirror | `agents-docs/docs/codemode/` (index, runtime, connectors, approvals, snippets, vite-plugin) | Reference only (implementation guide: `createCodemodeRuntime`, `McpConnector`, search/describe) |
| ADR-0019 / ADR-0013 / ADR-0014 (old repo) | `stellar-raven/research/decisions/0019-*.md`, `0013-*.md`, `0014-*.md` | Reference only (carry the rationale forward) |
| Research-lane typed policy (paid-call gating) | `src/agents/research-lane/policy.ts` + ADR-0006 | Adapt if paid LumenLoop research is exposed via execute |
