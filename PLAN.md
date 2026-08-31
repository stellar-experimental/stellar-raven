# Plan — stellar-raven-codemode

A single remote MCP server on Cloudflare Workers exposing **two tools — `search` and `execute`** —
over a unified API layer that covers three third-party services plus a selectively-exposed skills
directory. The LLM calling this MCP discovers capabilities via `search`, then authors JavaScript
that `execute` runs inside a **Dynamic Worker isolate** with no network access; all real traffic
goes through host-side, secret-holding, policy-enforcing adapters.

Grounding research (initially live-verified across 2026-07-01…07-03; service specs refreshed daily
by CI — each snapshot's own `fetchedAt` is the authority on how current it is, so no hand-maintained
date is repeated here to go stale):

- [`research/services/lumenloop.md`](./research/services/lumenloop.md) (current spec: [`inventory/lumenloop.json`](./inventory/lumenloop.json))
- [`research/services/stellar-light.md`](./research/services/stellar-light.md) (current spec: [`inventory/stellar-light.json`](./inventory/stellar-light.json))
- [`research/services/stellar-docs-algolia.md`](./research/services/stellar-docs-algolia.md) (primary; [`stellar-docs-mcp.md`](./research/services/stellar-docs-mcp.md) is the fallback path)
- [`research/codemode.md`](./research/codemode.md) — Cloudflare codemode / Dynamic Workers implementation reference
- [`research/prior-art.md`](./research/prior-art.md) — map of prior art in `stellar-raven-next` / `stellar-raven` (references for lessons, not templates)

## 0. Headline findings that shape the design

1. **Cloudflare already ships our exact tool shape.** `@cloudflare/codemode`'s
   `openApiMcpServer()` registers MCP tools named `search` and `execute`; its
   `DynamicWorkerExecutor` natively supports multiple namespaced service globals in one sandbox
   (`lumenloop.*`, `scout.*`, …). Dynamic Workers are **open beta, Workers Paid, no signup**.
   We generalize the shipped single-spec server into a multi-service catalog — the scoring
   (`searchConnectors`) and TS-rendering (`describeTarget`) functions are already written and
   importable.
2. **All three services are highly machine-readable**, each with a drift-detection affordance:
   - **Lumenloop** — 21 tools (18 free + 3 partner research; only `request_research` costs money),
     uniform `POST /v1/tools/{name}`, per-tool JSON Schemas, OpenAPI 3.1, keyless
     `/v1/changelog?since=`. Quirk: `/v1/tools` and `/v1/skills` hide partner items even with a
     partner key — inventory must union `/v1/me` + per-item detail fetches. Also serves 14 skills
     as zips via `/v1/skills`.
   - **Stellar Light / Scout** — 36 paths / 37 upstream ops (2026-08-28 Scout 1.9.1), fully keyless, self-describing via
     `/api/openapi.json`, `/api/status` (live counts + endpoint enumeration), `/api/changelog`.
     scout-mcp is a pure 1:1 wrapper → we integrate over HTTP directly.
   - **Stellar Docs** — integrate via **direct Algolia REST** (decided 2026-07-01), not the MCP.
     App `VNSJF5AWIZ`, index `crawler_Stellar Docs - Docusaurus` (crawler active; one replica
     `docs_replica_agent` used by the MCP). A **dedicated search key is in hand**
     (`.env`: `ALGOLIA_APPLICATION_ID_DOCS` / `ALGOLIA_API_KEY_DOCS`; scope and rotation posture
     tracked in the ops queue).
     Spec: `research/services/stellar-docs-algolia.md`. The Docs MCP endpoint stays documented in
     `research/services/stellar-docs-mcp.md` as fallback only; it's the same index behind
     JSON-RPC/SSE with analytics params bolted on.
3. **Prior art in `stellar-raven-next` / `stellar-raven` — learn, don't clone.** Those repos are
   references, not templates: they carry complexity from a different architecture (multi-agent
   research pipeline) that this two-tool service doesn't need. We design our own types, formats,
   and adapters from this project's actual needs and the live research. What we do take:
   **content/data** (the pinned `ecosystem-skills/` skill set, the labeled golden corpus for
   evals) and **lessons** (see item 4). `research/prior-art.md` is the map of what exists there —
   consult it to avoid known pitfalls, not to source code.
4. **The ADR pitfalls carry over:** never let the model own endpoint args/auth (validate against
   the manifest); soft-empty ≠ error ≠ evidence (per-service normalizers); exact-match slug/id
   guards; machine-checkable exclusion lists; paid calls need dedup + budget caps.

## 1. Architecture

```
MCP client (LLM)
  │  streamable HTTP /mcp   (createMcpHandler, stateless; bearer auth in front)
  ▼
Host Worker  (Workers Paid · wrangler: worker_loaders LOADER · nodejs_compat)
  ├─ tool "search"  { query, kind?, service?, limit?, recoverFrom?, reason? }
  │     [no isolate — host-side; recovery is exact-ID advisory metadata, separate from ranking]
  │     ranked search over searchable catalog entries (ConnectorDescription[]):
  │     ordinary service operations + every whole skill; recovery-only operations stay exact-ID
  │     top-k hits returned WITH rendered TS signatures (describeTarget)
  ├─ tool "execute" { code, recoveryReceipt? }                 [one Dynamic Worker per call]
  │     DynamicWorkerExecutor · globalOutbound: null · 60s wall-clock timeout
  │     sandbox globals:
  │       lumenloop.*   scout.*   stellarDocs.*        ← host RPC stubs (secrets stay host-side)
  │       codemode.spec()                              ← the unified super spec as data
  │                                                      (specs/super-spec.json, $refs inlined) —
  │                                                      upstream openApiMcpServer parity
  │       codemode.search / codemode.describe          ← mid-script ranked discovery
  │       codemode.catalog()                           ← full manifest as flat data (arbitrary code-grep)
  │       codemode.skill.read(name, {sections})        ← partial skill retrieval
  │       codemode.skill.run(name, input)              ← runnable-skill dispatch (host-side runners
  │                                                      over the same op closures — §3)
  └─ host-side layers:
        adapters/   per-service clients, designed fresh per the live service research
        policy/     arg validation vs manifest · redaction (exposure filtered at build, ADR-0003)
        catalog/    bundled manifest → validated in-memory catalog, cached per isolate
        skills/     skill store over pinned upstream files, section-indexed at build time
```

**Search shape — settled 2026-07-02 (`research/decisions/0001-search-tool-shape.md`, accepted).**
Exactly two tools ship: top-level `search` is a **host-side ranked query** `{ query, kind?,
service?, limit?, recoverFrom?, reason? }` (the round-2 implementation, over upstream's own
vendored `searchConnectors` scorer); structurally poor operation pages add bounded manifest-derived
`widerCandidates`, while explicit prior-attempt recovery remains exact-ID advisory metadata. Both
are returned separately from ranked hits and never change ranking
([ADR-0007](research/decisions/0007-structural-recovery-guidance.md)). `execute` is
`{ code, recoveryReceipt? }`. The optional receipt permits one later recovery-only operation.
The code-shaped discovery variant that upstream's
`openApiMcpServer` puts at the front door was **retired into `execute`'s sandbox**: a golden Q→A
A/B (60 paired cases, `eval/qa/`) found the host-side ranked search directionally more accurate
and — decisively — more reliable, while the in-sandbox code search burned the caller's turn
budget grepping the ~45k-token super spec (all 9 of its failures were `error_max_turns`). So the
unified **super spec** (lumenloop + scout + stellarDocs + a skills core service,
`specs/super-spec.json`) stays a first-class artifact but is exposed *inside* `execute` as
`codemode.spec()`, alongside `codemode.search` and `codemode.catalog()` — discovery-in-code
survives at zero marginal turn cost; only the mandatory isolate-per-search front door goes.
Routing remains *shortlisting* — one script hedges across several candidate tools with follow-up
detail calls; committing to a single route is never required.

**Stateless request handling.** Each request gets a fresh `McpServer` through
`createMcpHandler`. The host stores bounded recovery receipts and result artifacts in R2.
Adopt `McpAgent` plus `createCodemodeRuntime` only for durable approvals, abort-and-replay,
or an audit log.

## 2. The unified catalog (the thing `search` searches)

One checked-in, machine-generated manifest (`catalog/manifest.json`) with a typed entry per
exposed surface. A `discoveryMode: "recovery-only"` entry needs a host receipt before dispatch
(ADR-0009). Fields are chosen for what search/execute consume, nothing vestigial:

```jsonc
{
  "id": "lumenloop.search_directory",
  "service": "lumenloop",
  "kind": "operation",            // manifest: operation | skill | skill-section
  "description": "...",           // + when_to_use, returns
  "inputSchema": { ... },         // JSON Schema (rendered to TS on demand)
  "transport": { "type": "http", "method": "POST", "path": "/v1/tools/search_directory" },
  "provenance": { "source": "https://api.lumenloop.com/v1/tools", "fetchedAt": "..." }
  // further fields only when a concrete consumer exists — no speculative schema
}
```

The manifest retains exact-readable `skill-section` entries, while ranked `search` accepts only
`operation | skill`; section keys are discovered on whole-skill hits through `availableSections`.

Actual catalog counts are authoritative in `catalog/manifest.json`, not repeated here because
daily upstream and skill drift can change them. The catalog contains exposed service operations,
`skills.*` mirror entries, and skill `##`/file sections. **The manifest IS the exposed surface** —
excluded surfaces (the paid research lane incl. its read half, account mutations, scout writes
and their schema/assistant feeders, retired onboarding skills, the `lumenloop.skill.*` twin
namespace) are filtered at build time and never emitted; there is no `policy`/`cost`/`auth` field
and no generic runtime deny layer. A manifest `discoveryMode` can require a host capability
before adapter dispatch. A build guard rejects emitted text that references a non-exposed
surface. See
[`research/decisions/0003-build-time-exposure-filtering.md`](./research/decisions/0003-build-time-exposure-filtering.md)
(ADR-0003, 2026-07-04: 299→274 entries, 25→0 denied, superseding ADR-0002's deny-list model;
2026-07-04 follow-up: 274→271, dead-end read-halves and description leaks removed, exclusion
data consolidated in `scripts/exposure.mjs`; later skill mirror drift moved the section count to
204 without changing operation exposure).
Entries additionally carry an `outputSchema` wherever the source declares one.

Build pipeline: `scripts/build-catalog.mjs` has five snapshot/metadata roots:
`inventory/lumenloop.json`, `inventory/stellar-light.json`, the authored
`specs/stellar-docs.json`, `inventory/stellar-docs-titles.json` (page-title vocabulary), and
`ecosystem-skills/MANIFEST.json`. The skills manifest enumerates additional semantic inputs the
builder fetches from their pinned upstream commit (hash-verified, cached under the gitignored
`ecosystem-skills/.cache/`): each exposed `SKILL.md` and every additional listed Markdown file
supplies that skill's description and section headings. The imported runner
registry in `src/skills/runners/index.ts` supplies runnable flags and input/output schemas. The
builder emits only `catalog/manifest.json`; the Worker bundles that manifest and scores its
entries at request time, with no other search artifact. Catalog assembly is deterministic and
offline-testable except for the pinned skill files it fetches (hash-verified); inventory refresh
and skill re-pinning are the other network steps.

## 3. Skills directory — selective + partial exposure

Source: `ecosystem-skills/MANIFEST.json`, a pin set for 20 public skills across 4 upstreams:
lumenloop ×8, openzeppelin ×3, stellar-dev ×8, stellar-light ×1. **Bodies are referenced, not
vendored** — the repo commits a commit SHA per source and a git blob hash per file; the builders
and the Worker fetch each file from upstream at that commit and verify it against that hash
(`scripts/lib/skill-mirror.mjs`, `src/skills/source.ts`). Pins are re-cut by
`ecosystem-skills/update.sh` and validated by `scripts/check-mirrors.mjs` (`--fetch` proves they
still resolve). Lumenloop's partner skill set is not pinned; it is represented only as name-only
inventory stubs so credentialed content cannot re-enter the public repo.

- **Build-time sectioning:** each `SKILL.md` is split on `##` headings (multi-file skills keep
  their file structure); every skill and every section becomes a catalog entry. A skill entry
  carries its frontmatter description (what routing scores); a section entry carries its heading
  and its pinned address. Body prose, excerpts, and body-derived keywords are NOT committed; the
  upstream-authored one-line descriptions and `##` headings are (routing needs them) — see
  `THIRD-PARTY-NOTICES.md`. Since the 2026-07-13 skills-form A/B, section entries carry `searchable: false`:
  `search` returns whole-skill hits (each carrying `availableSections` keys) and sections are
  read exact-id via `skill.read` — the measured arm-B outcome (`eval/README.md`
  "Skills-form A/B").
- **Selective exposure is build-time data (ADR-0003):** the exclusion lists in
  `scripts/exposure.mjs` control which skills exist in the catalog at all; excluded skills
  are never emitted, so they cannot appear in search or resolve in the sandbox.
- **Retrieval:** `codemode.skill.read(name, { sections?: string[] })` returns only the requested
  portions (exact-match-guarded names — no fuzzy resolution, per ADR-0019's wrong-entity lesson).
- **Executable skills (BUILT 2026-07-06, todo 806):** one composite playbook is additionally
  *runnable* — `skills.lumenloop.stellar-ecosystem-digest` carries `runnable: true` + real
  input/output schemas (the dossier runner was retired on measured evidence, todo 849)
  on their existing `kind: "skill"` entries (one skill, one id, two affordances: read + run) and
  dispatch via `codemode.skill.run(id, input)` to repo-authored TypeScript runners executed
  **host-side** over the same per-op closures the sandbox namespaces use. The original sketch
  ("parameterized snippets over the service globals") did not survive contact with the corpus —
  no mirrored skill body is a program, so v1 runners are build-time repo modules, not
  model-promoted snippets. Design + ship decision record: `research/skill-run-design.md`;
  mechanics in `ARCHITECTURE.md` §5.

## 4. Policy & security

- **Secrets host-side only.** `LUMENLOOP_API_KEY` via Worker secret; the sandbox sees only
  namespaced function stubs. `globalOutbound: null` — `fetch()` in generated code throws.
- **Exposure is filtered at build time (ADR-0003,
  `research/decisions/0003-build-time-exposure-filtering.md`):** the manifest contains only what
  the sandbox may call or read — excluded surfaces (`lumenloop.request_research` (metered paid),
  `scout.submitFeedback`/`submitPartnerListing` (writes), `scout.getFeedbackSchema` (dead-end read),
  `scout.partnerAssistant` (logs surfaced partners as leads), `scout.partnerOnboard`
  (upstream-marked side-effecting), lumenloop account/billing mutations, the 7
  retired onboarding skills, the 14 `lumenloop.skill.*` twins) are never emitted, by `search`,
  `codemode.catalog()`, `codemode.spec()`, or anything else. Consumers never see what they
  cannot use. Shared exposure modules own the exact-match data. Scout operations live in
  `src/policy/scout-exposure.ts`; `scripts/exposure.mjs` re-exports them and owns the other
  exclusions. Builders and emitters consume these modules with fail-loud drift guards.
- **Paid-call gate:** `lumenloop.request_research` is not emitted at all today; enabling it is a
  deliberate feature — remove the build exclusion AND ship the budget-gate + dedup runtime in
  the same change (prefer `answer` mode (~$0.02), dedup via `list_my_research` first, per-day
  budget cap; partner quota is $50/mo). Mirrors old ADR-0018.
- **Arg validation against the manifest** before any host call — model code never owns URLs,
  headers, or auth.
- **Result hygiene:** per-service normalizers (soft-empty vs error vs data), redaction pass,
  ~6k-token truncation with actionable footer (`truncateResult` from codemode), errors returned
  as data — never thrown across the tool boundary.
- **Server auth (shipped 2026-07-02, research/auth-workos.md):** WorkOS-backed OAuth for
  everything at `/mcp` — the Worker is its own OAuth 2.1 authorization server via
  `@cloudflare/workers-oauth-provider` (opaque tokens in `OAUTH_KV`; WorkOS AuthKit is only the
  upstream IdP behind `/authorize` → `/callback`, its tokens dropped after the code exchange).
  Two bypasses only: named, non-expiring API keys whose SHA-256 token digests live under an
  isolated `OAUTH_KV` prefix, and `DEV_ALLOW_UNAUTHENTICATED=true` from `.dev.vars` (never
  deployed). Connection guide:
  README.md “Connect”.

## 5. Inventory refresh — keeping the catalog honest

`scripts/refresh-inventory.mjs` (runnable locally, in CI, or as a cron Worker):

| Service | Probe | Drift signal | Resolution |
|---|---|---|---|
| Lumenloop | `/v1/tools` ∪ `/v1/me` tool list ∪ per-tool detail (partner tools are hidden from `/v1/tools`, so the union is what makes them observable) + the full `/v1/openapi.json`. `/v1/skills` needs **no** union — it already lists partner skills as `available:false`, and `/v1/me` carries no skill count | any non-`fetchedAt` diff in `inventory/lumenloop.json`, classified by `summarize-live-drift.mjs` into tool-surface, tool routing-text, and **OpenAPI** surface/text/schema classes | `live-drift-resolution` |
| Stellar Light | `/api/openapi.json` (diff), `/api/status` endpoint enumeration | same classifier over `inventory/stellar-light.json`; op path·method **set**, not `operationCount` — a rename holds the count constant | `live-drift-resolution` |
| Stellar Docs (Algolia) | `GET /1/indexes/{index}/settings` + one `type:lvl1` page-title query (fails closed if `nbHits` exceeds one page) | settings diff and title-set diff; separately, `check-algolia-rule-canary.mjs` runs a read-only rules-on/off behavioral delta on the load-bearing rule | `live-drift-resolution` |
| Skills (pin set) | `check-skills-drift.mjs` — each source's upstream HEAD vs its pinned commit, plus a re-projection of the live stellarlight directory | pinned commit moved, or the directory snapshot would change | re-pin with `ecosystem-skills/update.sh`, **read the body diff**, record the `sel:` digest in `PIN-REVIEW.md` |
| Skills (availability, upstream) | `check-mirrors.mjs --fetch` — fetches every pinned file from upstream, cache bypassed, before any builder | a pin that no longer resolves *from a GitHub runner*. Bodies are served, not stored, so this is a **live user-facing `skill.read` outage**, not a stale snapshot | `ARCHITECTURE.md` §6 "availability posture" — never by mirroring the content |
| Skills (availability, Worker-side) | the Worker's **own** hourly cron (`src/skills/canary.ts`) fetching every pinned file with memo + colo cache bypassed, verdict in KV, read via `GET /health/skills` | the deployed Worker cannot reach upstream — or the verdict is **stale**, meaning the cron stopped and the detector is itself down | same; check Worker logs `evt: "skill_canary"` and Cloudflare/GitHub status |

The skills rows are three different questions, not one: `check-skills-drift` asks *has upstream
moved past our pin* (snapshot stale); `check-mirrors --fetch` asks *does the pin still resolve*
(content gone); the canary asks *can the deployed Worker actually reach it* (our access gone). The
last one cannot be answered from CI at all — GitHub Actions egress is not Worker egress — which is
why it runs inside the Worker. Green `check-mirrors` + red canary is the diagnostic pair: the
content is fine and our access is not. All three report as their own class in `refresh.yml`.

Output: regenerated inventory JSONs under `inventory/` + a diff report; `build-catalog`
then rebuilds the manifest; `test/adapters.test.ts` plus CI's generated-artifacts-sync gate
validate manifest ↔ adapter wiring offline. The exact curl incantations live in each service
research doc.

## 6. Repo layout (target)

```
src/server.ts            # Worker entry: createMcpHandler → search/execute
src/auth/                # WorkOS OAuth 2.1 provider + named-key / local-dev bypasses
src/site.ts              # public site: landing, OAuth consent, robots.txt, sitemap.xml, JSON-LD, /og.png
src/fonts.ts src/og.ts   # generated (npm run site:fonts / site:og) — embedded fonts + OG image
src/mcp/                 # tool registration, descriptions (copy codemode's rules-block prompting)
src/catalog/             # manifest types, builder, search (vendored searchConnectors/describeTarget)
src/adapters/            # lumenloop.ts · scout.ts · stellar-docs.ts (own design, per live research)
src/policy/              # arg validation, redaction, truncation, recovery receipts
src/skills/              # skill store, section index, read resolution
src/executor/            # DynamicWorkerExecutor wiring, providers, super-spec sandbox, truncation
src/observability.ts     # structured JSON events → Workers Logs; custom execute span
scripts/                 # refresh-inventory.mjs · build-catalog.mjs · build-super-spec.mjs · smoke checks
specs/                   # super-spec.json (+ authored stellar-docs.json) — feeds codemode.spec()
inventory/               # regenerated service inventory JSONs (drift source for build-catalog)
ecosystem-skills/        # skill PINS (MANIFEST.json) — bodies live upstream, never vendored
catalog/manifest.json    # generated — the unified index
assets/repo/             # GitHub-only assets (README hero banner) — NOT served by the Worker
research/                # this research + ADRs (research/decisions/) as decisions accrue
test/                    # vitest offline suites (adapters, server, super-spec, auth, …)
eval/                    # routing eval + qa/ (execute Q→A battery) + agentic/ + plan/
```

Pins: `@cloudflare/codemode` exact `0.5.1` (vendor `search.ts`/`describe.ts`/`normalize.ts`/
`json-schema-types.ts` if churn bites), production `@modelcontextprotocol/server` exact `2.0.0`,
dev-only `@modelcontextprotocol/client` exact `2.0.0` and `@modelcontextprotocol/sdk` exact `1.30.0`,
and `agents` exact `0.20.1`,
`zod ^4.4.3`, wrangler `^4.107.0`, compat ≥ 2026-06-11 + `nodejs_compat`, `worker_loaders`
binding `LOADER`.

MCP reopen gate (re-verified 2026-07-29/30): the non-prerelease 2026-07-28 specification shipped,
the versioning page designates 2026-07-28 as current, and `agents` pins the stable
`@modelcontextprotocol` 2.0.0 packages. All three conditions fired.

## 7. Phased build

> Status (end of Round 4): **all 8 phases are shipped and live** in production, including
> the evidence-poor recovery and build-stage prior-art additions deployed on 2026-07-13.
> The production route is **https://raven.stellar.org** (canonical since 2026-08-04); the two
> stellar.buzz hostnames stay routed in `wrangler.jsonc` for existing clients and remain inside the
> Terms' definition of the Service (Solo todos 788–825; evidence: `eval/README.md`,
> `eval/agentic/README.md`, `eval/plan/README.md`, `research/decisions/0001-search-tool-shape.md`,
> `research/decisions/0002-skills-retirement-twin-dedup.md`,
> `research/decisions/0003-build-time-exposure-filtering.md`, `research/auth-workos.md`,
> README.md “Connect”). CI + daily drift refresh run in
> github.com/stellar-experimental/stellar-raven (renamed from stellar-raven-codemode 2026-07-02;
> moved from kalepail/stellar-raven 2026-07-31). WorkOS
> OAuth verified end-to-end incl. human
> AuthKit sign-in (Tyler, 2026-07-02); CIMD enabled.
> - **Public site + SEO surface shipped 2026-07-02/03** (`src/site.ts`): landing page, OAuth
>   consent page, `robots.txt`, `sitemap.xml`, JSON-LD, and `/og.png` — routed via the OAuth
>   provider's `defaultHandler` (`src/auth/workos.ts`). The OG image and site fonts are generated
>   code (`src/og.ts`, `src/fonts.ts` via `npm run site:og` / `npm run site:fonts`), not served
>   from static asset files.
> - **Discovery orientation shipped 2026-07-09** (`src/mcp/micro-map.ts`): the two-tool surface
>   remains unchanged, while generated source-family/workflow guidance teaches multi-query
>   planning. `eval/discovery/` measures the narrow one-search route-discovery layer. Searchable
>   service/workflow catalog cards were built and cleanly reverted after real-query interception
>   measured below the run-to-run noise floor. The successor Vectorize frontier spike was then
>   measured no-ship on 2026-07-10 (todo 902): the pinned isolated harness and discovery
>   measurement extensions remain under `eval/`, while no production binding/index/scorer was
>   left behind (`eval/vectorize/README.md`).
>
> Follow-ups and former deferrals (open items now live in [`.agents/TODO.md`](./.agents/TODO.md);
> the todo numbers below are historical references to the retired Solo tracker):
> - `codemode.skill.run` (executable skills) — **BUILT 2026-07-06, ship-approved** (todo 806;
>   the 2026-07-03 do-not-build decision's reopen triggers fired). Two v1 runners (project
>   dossier, ecosystem digest) passed the design's §10 A/B gate — retrieval-neutral by
>   ranked-id proof, verdict improvement on the targeted battery, digest-runner adoption
>   demonstrated. The dossier follow-up (todo 849) then measured three surfacing levers
>   (all net-negative or no-effect) and retired that runner; the digest remains the sole
>   runnable. Decision record:
>   `research/skill-run-design.md` (§10 outcome, §14.1 as-built deviations); eval record:
>   `eval/README.md` todo-806 section; surface summary in §3 above.
> - Plan-eval progression weighting — revisit ONLY if a run shows detail-starved wrong answers
>   (`eval/plan/README.md` “Results — 2026-07-02”, conclusion).

1. **Scaffold** — wrangler + pinned deps + CLAUDE.md + hygiene checks. *(shipped)*
2. **Catalog + `search`** — manifest types, builder over the service snapshots, authored Docs
   spec, Docs page-title snapshot, and skills manifest; host-side search with TS signatures plus
   manifest-validated evidence-poor guidance kept separate from ranking: bounded broad-lane
   `widerCandidates` for zero-hit/all-backfill operation pages, plus exact-ID recovery returned only
   after non-empty explicit `recoverFrom` ids (a reason alone never escalates).
   Fully offline-testable. *(shipped)*
3. **Adapters + `execute`** — per-service clients in `src/adapters/`, `DynamicWorkerExecutor`
   with namespaced providers, and `codemode.search/describe` sandbox globals. *(shipped)*
4. **Skills store** — sectioned retrieval (`skill.read`), build-time exposure policy, and
   `skill.run` for the runnable skill set (v1 shipped one after the dossier runner was
   retired on measured evidence — design doc §10 postscript). *(shipped)*
5. **Policy + observability** — build-time exposure filtering, paid lane excluded, redaction,
   truncation, structured logs, and execute spans. *(shipped)*
6. **Inventory refresh** — refresh script + drift CI + adapted surface smoke check. *(shipped)*
7. **Evals** — routing, discovery, QA, plan, agentic, and live-data lanes with committed gate
   baselines and own-repo formats. The mechanism/unit holdouts cover contract, dapp, SDK, protocol,
   and infrastructure authority roles; behavioral QA currently pairs contract and infrastructure
   design-stage cases with a known-step no-detour control. *(shipped, including the 2026-07-13
   controls; see `eval/EVALS.md`)*
8. **Deploy + auth** — WorkOS-backed OAuth at `/mcp` with named-key + local-dev bypasses;
   deployed on the canonical host and its aliases. *(shipped)*

Phases 2–3 are independently parallelizable after 1; 4–6 after 3.

## 8. Open decisions (defaults chosen, flag to reverse)

| Decision | Default | Alternative |
|---|---|---|
| Docs search path | **Decided: direct Algolia REST** — dedicated key in hand (`.env` → Worker secrets `ALGOLIA_APPLICATION_ID_DOCS`/`ALGOLIA_API_KEY_DOCS`; the stellar.org site lane uses the `_SITE` pair); MCP as documented fallback | MCP-only (slower, protocol overhead) |
| `request_research` (paid) | off at launch | on with budget gate from day one |
| Server auth | **Decided: WorkOS OAuth** (`workers-oauth-provider` + AuthKit; named-key/dev bypasses — §4, README.md) | plain bearer secret (retired placeholder) |
| Skills scope | **19 of 20 mirrored public skills exposed**; retired onboarding surfaces never emitted, and one composite skill is runnable via `codemode.skill.run` | re-expose an onboarding skill only after a transport-agnostic rewrite and a fresh ADR |
| Statefulness | Stateless MCP requests with bounded R2 artifacts and recovery receipts | `McpAgent` + CodemodeRuntime DO for durable approvals or audit |
