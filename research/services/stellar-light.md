# Stellar Light / Stellar Scout — service spec

> Verified live 2026-07-02 (UTC; re-fetched ~13:59Z after the 07-02 partner-pipeline release). OpenAPI `info.version: 1.2.1`, status `apiVersion: 1.2.1` (the `X-API-Version` response header stays `1`), scout-mcp npm `1.1.5`.
> **Current committed inventory (2026-08-28): upstream OpenAPI `1.9.1`, 36 paths / 37 operations.** `inventory/stellar-light.json` carries the current spec verbatim; the detailed probe log below remains the 2026-07-02/03 measurement record, not a current collection-size snapshot.
> Earlier refresh notes: 2026-07-03 brought upstream 1.3.2 (`repoMeta`, `lastActivityAt`, inline repo `lastCommitAt`); later 1.6.1 fixes include live SCF round metadata and scoped `searchProjects` description copy; 1.7.0 typed the partner response, added `ramps` filtering, and surfaced richer code verification fields; 1.7.11 added project-search semantic fallback, nullable DefiLlama `tvlUSD`/`tvlAsOf` fields, and `source=cap` research filtering. Version 1.7.15 added builder match/code provenance, population-scope digests, typed synthetic RFP rows/count semantics, Stellar-evidence repo ranking, project `type`/`status` filters, anchor-profile state, and `dimension=tvl`. Version 1.7.26 added strict builder parameter rejection, exact leaderboard `type` filtering, `security-program` and `sdf-org` research sources, leadership-role extraction, and per-record `observedAt`. Version 1.8.28 adds enumerable audit reports, hackathon-build prior-art search, the SDF people index, and stablecoin market data. Version 1.8.30 makes `meta.total` nullable with a companion `meta.totalBasis` naming why a total is unknowable (e.g. `unbounded-similarity-ranking` on `searchResearch`), enumerates the aggregated repo set as `repos[]` beside `repoCount`, and renames the SDF skill slug `soroban` → `smart-contracts`. Attach live `generatedAt`/version fields from the current inventory when citing answers.
> Version 1.8.57 adds the read-only `/api/changes` reconciliation feed, new hackathon query filters, `dimension=toolchain`, and richer project, repo, partner, and provenance fields.
> Version 1.8.67 adds read-only contract registry, repository trust, idea vetting, and SCF pitch operations. It also adds audit relation metadata and new hackathon code filters.
> Version 1.8.70 adds the read-only hackathon brief composite and builder `onStellar` code evidence. It also marks partner onboarding as side-effecting.
> Version 1.8.87 adds read-only historical project-name resolution. It also defines nullable capability fields and their unknown-value semantics.
> Version 1.8.109 fully types historical project-name resolution, adds a read-only quality self-report and claim-verification operation, and adds Oracle project routing. Version 1.8.110 expands the quality-report response schema without changing its routing text. Version 1.9.1 adds consumer-finding, finding-flow, guard-freshness, gap-actionability, and population-scoped repo-quality fields to that response. Its routing text and the operation surface stay unchanged. Raven exposes the resolver. It withholds the quality report because its broad routing copy captures unrelated queries; see `sls-078`. It withholds claim verification because the live `issued` claim type is absent from the response enum; see `sls-077`.
> Current OpenAPI lives in [`inventory/stellar-light.json`](../../inventory/stellar-light.json) (refreshed daily by the CI drift job; 36 paths / 37 operations). `info.version` is now intended to bump on observable contract changes, but drift checks still diff path/method, operation text, `x-routing`, and schemas rather than trusting the version string alone.
> Cross-checked against prior art: `stellar-raven-next/research/capability/stellar-light-scout.md` (measured 2026-06-21→07-01) — live behavior today matches that doc.

## Overview

**Stellar Light** (stellarlight.xyz) is a Stellar ecosystem directory site (projects explorer, blog, market stats) built on Next.js + Payload CMS, hosted on Vercel. **Stellar Scout** is its agent-native product: a public API over curated Stellar-ecosystem data — projects, graded GitHub repos, builders, partners, SCF-funded RFPs, hackathons, skills metadata, ecosystem analytics, and a vector research corpus. Collection sizes drift; read `/api/status` or the committed `inventory/stellar-light.json` instead of freezing counts from this document.

Scout ships in three equivalent forms, all backed by the same API:
1. **HTTP API** — `https://stellarlight.xyz/api/*` (this doc's subject)
2. **SKILL.md** — `npx skills add Stellar-Light/stellar-scout` (repo: github.com/Stellar-Light/stellar-scout; the skill is prompt guidance + curl recipes against the API)
3. **MCP server** — `npx @stellar-light/scout-mcp` (repo: github.com/Stellar-Light/scout-mcp; 18 stdio tools, thin 1:1 wrappers over the API)

## Base URL and auth

- Base URL: `https://stellarlight.xyz` (single production server in OpenAPI; no versioned path prefix — versioning via `X-API-Version: 1` response header)
- **Auth: NONE.** Fully keyless, read-only, public. OpenAPI has no `security` / `securitySchemes`. CORS is wide open (`access-control-allow-origin: *`, methods `GET, POST, OPTIONS`).
- Write/compute surfaces (all still keyless): `POST /api/feedback` (OpenAPI success = 201, plus 400/429) and, since 2026-07-02, the partner pipeline — `POST /api/partners/submit-listing` (a real write: creates a draft partner account or a claim request) plus three AI-compute POSTs (`/api/partners/match`, `/assistant`, `/onboard`; `assistant` logs surfaced partners as leads, so it is not purely read-only either). Everything else is read-only GET.
- Caching: `Cache-Control: public`, edge-cached on Vercel (~5 min for ecosystem data, ~24 h for the SDF skill proxy per the api-reference page). Observed latency 2026-07-02: 0.16–0.5 s warm, 1.1–1.9 s on `x-vercel-cache: MISS`.
- Rate limits: none observed (no `X-RateLimit-*` / `Retry-After` headers). Maintainer has said limits would arrive via those headers, pre-announced. `POST /api/feedback` documents a 429.

## Self-description surfaces (use these in a refresh script)

| Surface | What it gives |
| --- | --- |
| `GET /api/openapi.json` | OpenAPI 3.1, full param schemas + enums (36 paths; every operation carries an `operationId` matching the `@stellar-light/api-client` method names, e.g. `getStatus`, `searchProjects`, `matchPartners`) |
| `GET /api/status` | Live collection sizes, per-source freshness, endpoint enumeration, usage stats |
| `GET /api/quality` | Measured self-report: known limitations, gap matrix, miss funnel, guard state, row/repo quality, and trend |
| `GET /api/changelog?since=YYYY-MM-DD` | Contract-change feed (API + MCP + skill changes), latest-first |
| `GET /api/skills` / `GET /api/skills/{name}` | Skills catalog + full SKILL.md markdown (`skill.content`) |
| `GET /api/feedback` | The POST feedback body schema (discovery) |

## Endpoint inventory (all under `https://stellarlight.xyz`)

Keyless throughout; GET except where marked POST. `*` = required param. Pagination: `limit`+`offset` where listed; page until `offset + meta.counts.returned >= total`. Limits vary per endpoint (projects/search default 20 / cap 100; hackathons default 100 / cap 300; research default 8 / cap 25).

| Endpoint | Purpose | Params (enums) | Rows key |
| --- | --- | --- | --- |
| `GET /api/status` | Health + collection sizes + endpoint enumeration + usage | — | `sources[]`, `endpoints[]` |
| `GET /api/quality` | Service quality self-report with measured limitations, gaps, guards, finding health, and trends. Raven withholds this operation because its broad routing copy captures unrelated queries; see `sls-078`. | — | `{knownLimitations[], gapMatrix, missFunnel, guards[], findings, consumerFindings, flow, rowQuality, repoQuality, trend[], meta}` |
| `GET /api/changelog` | API/MCP/skill contract-change feed | `since` (YYYY-MM-DD), `limit` (1–100) | `entries[]` |
| `GET /api/changes` | Changed project, repo, and partner rows for cache reconciliation | `since*` (ISO date or timestamp), `surfaces` (comma-separated projects\|repos\|partners; omit for all three), `limit` (1–500 per surface) | `{changes[], meta{}}` |
| `GET /api/projects/search` | Prior-art / competitor search over curated project directory | `q` (aliases query/keyword/search), `category` (Infrastructure\|Tooling\|User-Facing App\|Asset\|Protocol/Contract\|Anchor\|Partner Integration), exact-membership `type`, lifecycle `status`, `scfAwarded` (bool), `limit`, `offset` — **requires q or a filter**; bare call → 0 rows + `meta.error:"no_query"` + advisory. A no-keyword-hit query may fall back to `matchMode:"semantic"`; treat those `via:"semantic"` rows as similarity guesses. Project rows may carry nullable DefiLlama `tvlUSD`/`tvlAsOf` (`null` = not tracked, not zero); anchor profiles carry `profileState`, and empty capability arrays on `not-profiled` rows mean unknown rather than absent. | `projects[]` |
| `GET /api/projects/resolve` | Resolve a historical name, slug, or project URL to the current directory identity and status evidence. Raven exposes the fully typed read-only operation. | `q*`; `found:false` means untracked, not nonexistent; `evidence.unsourced:true` means the status lacks a citable source | `{found, subject, current, superseded, matchedOn, evidence, note, meta}` |
| `GET /api/repos/search` | Graded Stellar repo/code index (~2,301; ranked by `repoScore` 0–100) | `q`, `language` (substring), `minScore` (0–100), `limit`, `offset` — browsable bare (top 200) | `repos[]` |
| `GET /api/repos/explain` | Deep code answer: canonical-repo routing × DeepWiki grounding | `q*`, `repo` (owner/name pin) | `{answer, answered, repo, routedVia, alternateRepos[], sources{}, codeVerified?, codeConfidence?, scannedRef?}` |
| `GET /api/hackathons` | Hackathon feed (curated Payload + DoraHacks) | `q`, `status` (upcoming\|active\|completed), `organizer`, `source` (curated\|dorahacks), `limit` | `hackathons[]` |
| `GET /api/hackathons/builds` | Prototype prior-art search across hackathon submissions | `q`, `winnersOnly` (1\|true), `track`, `capability` (contract-invoke\|fee-bump\|horizon\|mpp\|passkey\|sep10-auth\|sep24-ramp\|signing\|soroban-rpc\|tx-building\|wallet-kit\|wallet-provider\|x402), `limit`; absence is a whitespace signal, not proof an idea was never tried | `builds[]` |
| `GET /api/hackathon-brief` | One-call build brief with idea vetting, prototype prior art, starter repositories, live contracts, funding, and evidence-derived cautions. Raven exposes this read-only broad composite. | `q*` (3–200 characters) | `report{vet, builds[], startFrom[], liveContracts, funding, whatNotToClaim[]}` |
| `GET /api/hackathons/{slug}` | One event: winners (placement-sorted, numeric `placementRank`), submissions, tracks | `slug*` | `{hackathon, winners[], submissions[], tracks[]}` |
| `GET /api/hackathons/compare` | Side-by-side 2–5 events with computed deltas | `slugs*` (comma-sep, 2–5; also accepts POST `{slugs:[...]}`) | `hackathons[]` + `deltas{}` |
| `GET /api/builders` | Builder directory (Stellar Passport; live count in status) | `q`, `location`, `skill` (all map to the same filter lane), `limit`, `offset` — browsable bare; strict term matching (verbose NL phrases → 0 rows). Matched rows expose `match{matchedFields,matchedProjects,matchedTerms,basis}` and `codeEvidence[]`; `meta.matchBasis` warns that profile-text matches are candidate discovery, not verified experience. | `builders[]` |
| `GET /api/people` | SDF leadership, board, and advisor index; distinct from GitHub-contributor builders | `q`, `section`, pagination controls | `people[]` |
| `GET /api/partners` | Partner directory (anchors, ramps, audit firms, infra, tooling, wallets) | `type` (anchor\|on-off-ramp\|infrastructure\|tooling\|protocol\|wallet\|audit-firm\|legal\|agency\|other), `sector`, `region`, `ramps` (`on-ramp`, `off-ramp`, or comma-separated both), `accepting` (=1), `all` (=1), `q`, `limit`, `offset` | typed `partners[]` (`Partner`) + `meta` |
| `GET /api/partners/{slug}` | One partner profile w/ `verified{}` signal object | `slug*` | `{partner…}` |
| `POST /api/partners/match` (new 2026-07-02) | AI-rank published partners against a plain-language need (grounded — only real partners, one-line reason each) | JSON body `{need*}` → 200/429/**503** `unavailable:true` when AI isn't configured (fall back to `GET /api/partners` filters) | ranked partners |
| `POST /api/partners/assistant` (new 2026-07-02) | Conversational partner concierge (backend of /partners/chat); routes intent: builder-need → `matches[]` (deterministic, never hallucinated; surfaced partners logged as leads), company-self-description → interview + `canList:true` | JSON body `{messages*:[{role: user\|assistant, content}]}` → 200/429/503 | `{reply, matches?, intent, canList}` |
| `POST /api/partners/onboard` (new 2026-07-02) | Get-listed helpers: `mode:'chat'` interview reply; `mode:'extract'` structures the transcript into partner-profile `fields` (null where unstated). OpenAPI marks this operation side-effecting as of 1.8.70, so Raven excludes it. | JSON body `{mode*: chat\|extract, messages*}` → 200/429/503 | reply or `fields{}` |
| `POST /api/partners/submit-listing` (new 2026-07-02) | **Write**: submit a company for listing → DRAFT partner account (team-reviewed) or CLAIM REQUEST if already listed; `contactEmail` becomes the account login | JSON body `{orgName* (2–120), contactEmail*, fields?}` → 200/400/429 | `{ok:true, mode:'draft'\|'claim'}` |
| `GET /api/rfps` | SCF-funded sponsor RFP briefs plus live-round context | `status` (open\|closed), `quarter` (e.g. q2-2026), `q`, `category` (ai\|consumer-dapps\|defi\|developer-tooling\|gaming\|infrastructure\|nfts\|payments\|scf\|web3-social), `limit`, `offset`. Filter `rowType === "rfp"` when counting briefs: the array may also contain a typed synthetic `scf-round` row; `meta.countBasis` and `counts.syntheticRounds` explain the distinction. | `rfps[]` + top-level `funding` string |
| `GET /api/research` | Vector (voyage-3) search over the research corpus, keyword fallback per-query | `q*`, `source` (sdf-blog\|scf-handbook\|sep\|cap\|dev-docs\|paper\|scf-proposal\|lumenloop\|lumenloop-research\|audit\|incident\|security-program\|sdf-org\|ec-developer-report), `limit` (max 25) | `results[]` (the only endpoint using `results`) |
| `GET /api/audits` | Enumerable Stellar security-audit report registry; full report text remains in research | `project`, `auditor`, `q`, `since`, `limit`, `offset`; absence is not proof a project is unaudited | `audits[]` |
| `GET /api/verify` | Verify audited, live, maintained, or issued claims against Scout's indexed corpus. Raven withholds this operation because OpenAPI 1.9.1 omits `issued` from the live response's `claim.type` enum; see `sls-077`. | `claim`, or `type` + `subject`; `auditor`, `since`; issued claims reuse `auditor` for the issuer | `{claim, verdict, statement, confidence, evidence[], resolution, subject, meta}` |
| `GET /api/skills` | AI-skill/tool catalog for Stellar builders (42) | `source` (sdf\|stellarlight\|lumenloop\|external\|community), `kind` (skill-md\|mcp-server\|sdk\|cli\|agent-kit\|tool), `q` | `skills[]` |
| `GET /api/skills/{name}` | One skill incl. full markdown at `skill.content` | `name*` (slug) | `{meta, skill{…, content}}` |
| `GET /api/clusters` | Topic clusters w/ crowdedness 1–10, SCF totals | `dimension` (category\|types, strict → 400), `minSize`; target one cluster via `key`/`category`/`type`. `meta.population` declares the included/available population and truncation state. | `clusters[]` |
| `GET /api/analyze` | Ecosystem analytics rollups | `dimension` (all\|hackathons\|categories\|funding\|tvl\|toolchain, strict). `meta.population` scopes project aggregates; funding includes a stable `projectSetHash`. | `{<dimension>{…}}` (no row array) |
| `GET /api/stablecoins` | Stellar stablecoins ranked by USD market cap | `sort` (marketcap\|supply\|holders\|volume), `peg`, `limit`; raw supply is not comparable across pegs | `stablecoins[]` |
| `GET /api/leaderboard` | Dev-activity leaderboard + EC ecosystem snapshot | `sort` (activity\|stars\|issues), `range` (7d\|30d\|90d\|1y\|all), `category` (validated), repeatable/comma-separated exact `type` (EITHER membership), `format` (json\|csv), `limit`; `meta.metricDefinitions` states what activity, issue, and repository metrics count. | `{ecosystem{}, projects[]}` |
| `GET /api/feedback` | Returns the POST schema | — | `{schema{…}}` |
| `POST /api/feedback` | Submit feedback (only write) | JSON body `{kind: bug\|missing-data\|wrong-answer\|suggestion\|other, message (10–4000 chars), context{query?, endpoint?, skillVersion?, agentName?}}` → 201/400/429 | — |

### Response envelope conventions (measured)

- Every collection endpoint nests rows under a **named key matching the resource** (`projects[]`, `repos[]`, `builders[]`, `partners[]`, `rfps[]`, `hackathons[]`, `skills[]`, `clusters[]`) — **not** a generic `results[]`. Only `/api/research` uses `results[]`.
- Every response carries `meta{source, generatedAt, filters, counts{returned,total,…}}` (shape varies slightly per endpoint). Quantitative project aggregates may also expose `meta.population{id,statusScope,totalAvailable,included,truncated,generatedAt}`; identical IDs are comparable populations and different IDs must not be merged unlabeled. `projects/search` adds `meta.matchMode` (strict → loose-1 → loose-2 → loose-3 → majority → corrected → semantic → all) + `matchModeLabel`; `corrected` means only a known spelling correction matched, and `semantic` means no keyword tier matched. Verify identity before relying on either result. `all` means a non-`q` filter defines membership; with `type`, an optional `q` changes ranking only. `research` adds `meta.mode` (vector|keyword, deterministic per query), `model`, `scoreModel`.
- Single-item endpoints nest under `{hackathon|skill|partner}` — e.g. skill markdown is `skill.content`, not top-level.
- Confidence: `research` rows carry `confidence{score,label,relevance,freshness,authority,ageDays}` (0.65·relevance + 0.15·freshness + 0.20·authority); repos carry `repoScore`/`repoScoreLabel` + `judgeScore`/`builderReputation`.

### Error envelope (verified live 2026-07-02)

Errors are self-describing JSON, `{error, hint?, valid<Thing>?}`:

- Bad enum → **400** with the valid list. Live: `GET /api/research?source=bogus&q=x` → 400 `{"error":"unknown source: 'bogus'","hint":"see validSources for the full list","validSources":[…11…]}` (0.16 s). Same pattern for `analyze`/`clusters` `validDimensions`, `leaderboard` `validSorts`/`validFormats`, `projects/search` + `rfps` `validCategories`.
- Missing required arg → 400 `{error:"missing required q parameter…", validSources}` (research); `projects/search` instead returns 200 with `meta.error:"no_query"`, 0 rows, and an `advisory{summary, suggestions[]}`.
- Unknown detail slug → **404**. Live: `GET /api/skills/nope-xyz` → 404 `{"error":"unknown skill: nope-xyz","hint":"Try /api/skills to list all available slugs."}`. Same for `partners/{slug}`, `hackathons/{slug}`.
- Unknown/removed query params are endpoint-specific. As of 1.8.28,
  `builders?scfTier=` is rejected with **400**; some older search parameters such
  as `projects/search?hackathon=` are still silently ignored.
- AI partner endpoints (`match`/`assistant`/`onboard`) → **503** `{unavailable:true}` when the service has no AI configured — treat as "fall back to `GET /api/partners` filters", not as a retryable outage.

## Live verification log (2026-07-02T01:52Z)

| Call | Result | Latency |
| --- | --- | --- |
| `GET /api/status` | 200; `apiVersion:1.2.1`, sources projects 920 / repos 2301 / builders 112 / sdfSkills 7 / hackathons 0 (curated), usage.total 10,828, **23 endpoints enumerated** (incl. the 4 new partner-pipeline POSTs). Headers: `x-api-version: 1`, `cache-control: public`, `server: Vercel`, `x-powered-by: Next.js, Payload`, no rate-limit headers. (Re-checked 13:59Z; earlier 01:52Z probe saw 19 endpoints / 918 projects — the partner pipeline landed in between.) | 1.77 s (edge MISS) |
| `GET /api/research?q=passkey+smart+wallet&limit=2` | 200; `meta.mode:"vector"`, `model:"voyage-3"`, rows in `results[]` with `confidence{score:0.72,label:"medium",…}` | 1.08 s |
| `GET /api/projects/search?q=passkey+wallet&limit=2` | 200; `matchMode:"strict"`, top = Stellar Passport (`scfTotalAwardedUSD:150000`), rows in `projects[]` (20 fields/row) | 0.49 s |
| `GET /api/skills?kind=mcp-server` | 200; returned 2 (`stellar-scout-mcp`, `lumenloop-mcp`), `bySource:{sdf:7,stellarlight:2,lumenloop:9,external:12,community:0}` | 0.25 s |
| `GET /api/research?source=bogus&q=x` (deliberate 4xx) | **400** `{error,hint,validSources[11]}` | 0.16 s |
| `GET /api/skills/nope-xyz` (deliberate 404) | **404** `{error,hint}` | 1.88 s |

## Skills catalog shape (`GET /api/skills`)

```json
{
  "meta": {
    "source": "https://stellarlight.xyz/skills",
    "generatedAt": "…",
    "filters": {"source": null, "kind": null},
    "counts": {"returned": 30, "bySource": {"sdf":7,"stellarlight":2,"lumenloop":9,"external":12,"community":0}},
    "validSources": ["sdf","stellarlight","lumenloop","external","community"],
    "validKinds": ["skill-md","mcp-server","sdk","cli","agent-kit","tool"]
  },
  "skills": [{
    "slug","name","tagline","description","source","kind",
    "install","installAlt":[{"label","command"}],
    "repository","homepage","docs","compatibility":[…],
    "targetUser":["dev","founder","agent"],"tags":[…],"featured":true
  }]
}
```

`GET /api/skills/{name}` → `{meta, skill{…same fields…, content}}` where `content` is the full SKILL.md markdown (~26.6 kB for stellar-scout). The human page `https://stellarlight.xyz/skills` renders this same catalog; `https://stellarlight.xyz/skills/stellar-scout.md` serves the raw markdown directly.

## The stellar-scout SKILL.md (repo: Stellar-Light/stellar-scout)

Repo contents: `SKILL.md` (v1.1.0, MIT) + `README.md` + `references/`. It is pure prompt guidance over the HTTP API: user-type routing (hackathon entrant / SCF applicant / independent builder → lead endpoints), trigger phrases, two modes (Conversational; 8-step "Deep Dive" idea-vetting workflow with gap classification), and named workflows (Draft SCF Pitch, Find Audit Firm via `partners?type=audit-firm`, Compare RFPs). It explicitly chains into SDF's official skills (skills.stellar.org) via `/api/skills` for the "how to build" layer.

## scout-mcp (repo: Stellar-Light/scout-mcp, npm `@stellar-light/scout-mcp` v1.1.5)

- Node ≥20, stdio transport, `@modelcontextprotocol/sdk` + zod. Run: `npx @stellar-light/scout-mcp`. Env: `SCOUT_API_BASE` (default `https://stellarlight.xyz`), `SCOUT_USER_AGENT`.
- **18 tools, each a thin 1:1 wrapper over an API endpoint** (URL construction + JSON parse only; no local state, no auth). Errors returned as `isError: true` text `HTTP <status> from <url>: <body slice>`.

| MCP tool | API endpoint | Notes |
| --- | --- | --- |
| `search_research` | `GET /api/research` | param named `query` (not `q`); **source enum omits `incident`** (10 vs API's 11 — drift) |
| `search_projects` | `GET /api/projects/search` | |
| `search_repos` | `GET /api/repos/search` | |
| `explain_repo` | `GET /api/repos/explain` | |
| `get_hackathons` | `GET /api/hackathons` | |
| `get_hackathon` | `GET /api/hackathons/{slug}` | |
| `compare_hackathons` | `POST /api/hackathons/compare` | uses the POST body form |
| `get_builders` | `GET /api/builders` | |
| `get_partners` | `GET /api/partners` | |
| `get_rfps` | `GET /api/rfps` | |
| `list_skills` / `get_skill` | `GET /api/skills` / `/api/skills/{name}` | |
| `get_clusters` / `analyze_ecosystem` / `get_leaderboard` | `/api/clusters` / `/api/analyze` / `/api/leaderboard` | |
| `get_status` / `get_changelog` | `/api/status` / `/api/changelog` | |
| `submit_feedback` | `POST /api/feedback` | the only write tool |

Relationship: **website API = source of truth; SKILL.md and scout-mcp are alternate front-ends to the identical backend.** A codemode wrapper should target the HTTP API directly and skip the MCP server entirely (nothing exists only in the MCP layer; the MCP layer's value is its tool descriptions, which can be harvested from `src/index.ts`).

## Known drift / gotchas

- Marketing copy can lag the API: the committed OpenAPI has 36 paths, and live DoraHacks detail slugs return populated rosters (e.g. `stellar-agents-x402-stripe-mpp`: 5 winners, 262 submissions). Trust `/api/openapi.json` + `/api/status` + live probes over static page copy.
- `analyze?dimension=categories` `totalProjects` is active-only and differs from `/api/status` projects (full collection) **by design** — the response carries an explicit `scope` string.
- Population-aware responses now carry a scope digest; compare quantitative values only when `meta.population.id` matches, and treat `truncated:true` as a sample rather than a census.
- Project `anchorProfile` capability arrays are evidence-filled. If `profileState:"not-profiled"`, empty arrays mean unknown rather than a verified absence of support.
- `research.meta.mode` is per-query (vector-first, keyword fallback), deterministic per query string — never promise a mode.
- `builders`/`rfps` `q` is strict term matching: send terms ("Rust"), not phrases ("Rust builders on Stellar" → 0 rows).
- Removed params are endpoint-specific: `builders?scfTier=` now returns 400,
  while `projects/search?hackathon=` is silently ignored. Probe before assuming
  either behavior for another retired parameter.
- Counts drift constantly (usage grew ~1,250 calls in ~1 day) — re-read `/api/status`; never hardcode collection sizes.
- `leaderboard?format=csv` returns `text/csv`, not JSON — special-case it or pin `format=json`.

## Notes for the unified codemode wrapper

- **Auth:** none needed anywhere. Ship it keyless; guard the POST surfaces — `POST /api/feedback` and `POST /api/partners/submit-listing` are writes (human-in-the-loop / deny-by-default for autonomous execution — matches the raven prior-art governance), and `POST /api/partners/assistant` logs surfaced partners as sales leads, so keep it out of the autonomous surface too. `POST /api/partners/match` / `onboard` are stateless AI compute but 503 without AI configured.
- **Search tool mapping:** the free-text evidence surfaces are `research` (concepts/specs/audits), `projects/search` (products/teams), `repos/search` (code), `builders`, `rfps`, `partners`. Enum/analytics surfaces (`clusters`, `analyze`, `leaderboard`, `hackathons`, `skills`) route by fixed params, not free text.
- **Execute-tool ergonomics:** all endpoints are plain GET + query string → trivially expressible as `fetch(base + path + qs)`. Rich 400s with `valid*` arrays make retry-with-corrected-enum a safe automatic behavior. 404 on detail slugs means "discover the slug from the list endpoint first".
- **Drift detection:** poll `GET /api/changelog?since=<last-check>` and diff the `GET /api/openapi.json` path/method/operationId set plus schema/description fields. `info.version` is useful context (currently 1.9.1 in the committed inventory) but is not sufficient by itself. The changelog covers API + MCP + skill surfaces in one feed.
- **Refresh script — exact commands to re-inventory:**

```bash
BASE=https://stellarlight.xyz
# 1. Contract: full OpenAPI (paths, params, enums)
curl -s $BASE/api/openapi.json | python3 -c 'import json,sys;json.dump(json.load(sys.stdin),sys.stdout,indent=2)' > inventory/stellar-light.json  # (CI's refresh-inventory.mjs writes this)
# 2. Live health + collection sizes + endpoint enumeration
curl -s $BASE/api/status
# 3. Contract-change feed since last refresh
curl -s "$BASE/api/changelog?since=2026-07-02"
# 4. Skills catalog (machine JSON) + one full skill body
curl -s "$BASE/api/skills"
curl -s "$BASE/api/skills/stellar-scout"        # full markdown at .skill.content
# 5. Feedback write schema (discovery only — do not POST autonomously)
curl -s $BASE/api/feedback
# 6. Smoke probes (happy path + error envelope)
curl -s "$BASE/api/research?q=soroban+authorization&limit=2"
curl -s "$BASE/api/projects/search?q=passkey+wallet&limit=2"
curl -s -o /dev/null -w '%{http_code}\n' "$BASE/api/research?source=bogus&q=x"   # expect 400
curl -s -o /dev/null -w '%{http_code}\n' "$BASE/api/skills/nope-xyz"             # expect 404
# 7. MCP tool descriptions (harvest, don't run)
gh api repos/Stellar-Light/scout-mcp/contents/src/index.ts --jq .content | base64 -d
```
