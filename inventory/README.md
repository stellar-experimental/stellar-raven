# inventory/ — service inventory snapshots

Machine-generated snapshots of the three third-party services used for catalog assembly and
drift detection (see `PLAN.md` §§2, 5). `scripts/build-catalog.mjs` directly consumes the
Lumenloop and Stellar Light snapshots plus the Stellar Docs title snapshot; the Algolia settings
snapshot is drift evidence only. The builder's other semantic inputs are the authored
`specs/stellar-docs.json`, the skills manifest and its enumerated mirror Markdown files, and the
runnable-skill registry. Catalog assembly also reads pinned skill bodies through the hash-verified cache.
A cache miss fetches the pinned upstream file. See [the scripts guide](../scripts/README.md).

## Refresh

```bash
node scripts/refresh-inventory.mjs
```

Plain Node 20+, zero dependencies; reads `LUMENLOOP_API_KEY` plus the per-property Algolia pairs
`ALGOLIA_{APPLICATION_ID,API_KEY}_{DOCS,SITE}` from `.env` at the repo root. The script is idempotent (a file is only
rewritten when its content — ignoring `fetchedAt` — changed, so back-to-back runs produce
zero diff) and deterministic (keys sorted recursively, tool/skill arrays sorted by name),
so any diff is a real upstream contract change. It refuses to write any output containing
a `.env` value (Algolia hostnames are written with an `{ALGOLIA_APPLICATION_ID_DOCS}` / `{ALGOLIA_APPLICATION_ID_SITE}` placeholder).

## Files

| File | Contents | Drift signal captured |
| --- | --- | --- |
| `lumenloop.json` | All 21 tool names (18 guest + 3 partner), built by **unioning** keyless `GET /v1/tools` with the authored `LUMENLOOP_PARTNER_TOOLS` name list — the list endpoint hides partner tools even with a partner key, and the union count is validated against `GET /v1/me tools.available`. Guest tools carry full per-tool detail (description, `when_to_use`/`returns`, input/output JSON Schemas, invoke block); **partner tools are name-only stubs** (`partner_stub: true` — partner-tier detail is never committed; go-public cleanup 2026-07-06). Plus all 14 skill names (public set: metadata + file paths, never contents; **partner set: name/set/tier stubs only**; no `/v1/me` count guard since `/v1/me` exposes no skills count), `/v1/me` tier/lane/tool-counts (limits deliberately not persisted), and the full keyless `GET /v1/openapi.json` spec embedded under `openapi` (33 ops: the 18 guest tool-invoke paths + account/discovery endpoints; partner tools never appear in the spec — the `tools` union is the truth). | `changelogCursor` = latest `GET /v1/changelog` entry (date/title/breaking); `openapiVersion` |
| `stellar-light.json` | The full keyless `GET /api/openapi.json` spec under `openapi`, plus a `GET /api/status` snapshot with volatile fields (`generatedAt`, `usage`) stripped. The snapshot owns its operation count. | `changelogLatest` = latest `GET /api/changelog` entry; `openapiVersion` |
| `stellar-docs.json` | Live settings for Algolia index `crawler_Stellar Docs - Docusaurus` (the facet/ranking/distinct contract). Stellar Docs operation definitions are authored separately in `specs/stellar-docs.json`. | diff of `settings` (facets, distinct, replicas, searchable attrs) |
| `stellar-docs-titles.json` | Deduplicated `type:lvl1` page titles and paths from the live Algolia index. The catalog builder scopes these titles by each Docs operation's URL prefixes and distills them into routing keywords. | page-title/path additions, removals, and rewords |

## Generated — never hand-edited

Every file here is rebuilt by `scripts/refresh-inventory.mjs`; do not edit them directly
([`AGENTS.md` “Commands and verification”](../AGENTS.md#commands-and-verification)). Stellar Docs
operation definitions are not inventory content: edit the authored `specs/stellar-docs.json`
instead. The `LUMENLOOP_PARTNER_TOOLS` name list is authored in
`scripts/refresh-inventory.mjs`; edit it there and re-run the refresh. A count mismatch against
`/v1/me` fails the run loudly.
