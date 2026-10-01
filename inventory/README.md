# inventory/ — service inventory snapshots

Machine-generated snapshots of the three third-party services used for catalog assembly and
drift detection. `scripts/build-catalog.mjs` directly consumes the
Lumenloop and Stellar Light snapshots plus the Stellar Docs title snapshot; the Algolia settings
snapshot is drift evidence only. The builder's other semantic inputs are the authored
`specs/stellar-docs.json`, the skills manifest and the upstream Markdown files it pins, and the
runnable-skill registry. Catalog assembly also reads pinned skill bodies through the hash-verified cache.
A cache miss fetches the pinned upstream file. See [the scripts guide](../scripts/README.md).

## Refresh

```bash
node scripts/refresh-inventory.mjs
```

Node 24 (`.nvmrc`), zero dependencies; reads `LUMENLOOP_API_KEY` plus the per-property Algolia pairs
`ALGOLIA_{APPLICATION_ID,API_KEY}_{DOCS,SITE}` from `.env` at the repo root. The script is idempotent (a file is only
rewritten when its content — ignoring `fetchedAt` — changed, so back-to-back runs produce
zero diff) and deterministic (keys sorted recursively, tool/skill arrays sorted by name),
so any diff is a real upstream contract change. It refuses to write any output containing
a `.env` value (Algolia hostnames are written with an `{ALGOLIA_APPLICATION_ID_DOCS}` / `{ALGOLIA_APPLICATION_ID_SITE}` placeholder).

### Daily refresh in CI

The daily `refresh.yml` workflow runs the same refresh. It opens or updates a drift issue when a snapshot
changes. It skips with a notice when any of these repository secrets is absent:
`LUMENLOOP_API_KEY`, `ALGOLIA_APPLICATION_ID_DOCS`, `ALGOLIA_API_KEY_DOCS`,
`ALGOLIA_APPLICATION_ID_SITE`, and `ALGOLIA_API_KEY_SITE`.

On a fork, also set two repository variables:

- `RAVEN_SERVICE_URL`: the base URL of your deployed Raven. The workflow reads its
  `/health/skills`. Without it, the refresh skips on a fork.
- `REFRESH_ISSUE_ASSIGNEE`: the maintainer who gets drift issues. Without it, the repository owner
  gets them.

## Files

| File | Contents | Drift signal captured |
| --- | --- | --- |
| `lumenloop.json` | Lumenloop tool names, skill names, `/v1/me` tier data, and the public OpenAPI spec. See the details below. | `changelogCursor` = latest `GET /v1/changelog` entry (date/title/breaking); `openapiVersion` |
| `stellar-light.json` | The full keyless `GET /api/openapi.json` spec under `openapi`, plus a `GET /api/status` snapshot with volatile fields (`generatedAt`, `usage`) stripped. The snapshot owns its operation count. | `changelogLatest` = latest `GET /api/changelog` entry; `openapiVersion` |
| `stellar-docs.json` | Live settings for Algolia index `crawler_Stellar Docs - Docusaurus` (the facet/ranking/distinct contract). Stellar Docs operation definitions are authored separately in `specs/stellar-docs.json`. | diff of `settings` (facets, distinct, replicas, searchable attrs) |
| `stellar-docs-titles.json` | Deduplicated `type:lvl1` page titles and paths from the live Algolia index. The catalog builder scopes these titles by each Docs operation's URL prefixes and distills them into routing keywords. | page-title/path additions, removals, and rewords |

### `lumenloop.json` details

- **Tools.** All 21 tool names: 18 guest and 3 partner. The refresh unions keyless `GET /v1/tools`
  with the authored `LUMENLOOP_PARTNER_TOOLS` name list, because the list endpoint hides partner
  tools even with a partner key. It checks the union count against `GET /v1/me` `tools.available`.
- **Guest tools** carry full detail: description, `when_to_use`/`returns`, input and output JSON
  Schemas, and the invoke block.
- **Partner tools** are name-only stubs (`partner_stub: true`). Partner-tier detail is never
  committed.
- **Skills.** All 14 skill names. The public set has metadata and file paths, never contents. The
  partner set has name, set, and tier stubs only. `/v1/me` exposes no skills count, so no count
  guard applies.
- **`/v1/me`.** Tier, lane, and tool counts. Limits are not stored.
- **`openapi`.** The full keyless `GET /v1/openapi.json` spec (33 operations: the 18 guest
  tool-invoke paths plus account and discovery endpoints). Partner tools never appear in the spec,
  so the `tools` union is the source of truth.

## Generated — never hand-edited

Every file here is rebuilt by `scripts/refresh-inventory.mjs`; do not edit them directly
([`AGENTS.md` “Commands and verification”](../AGENTS.md#commands-and-verification)). Stellar Docs
operation definitions are not inventory content: edit the authored `specs/stellar-docs.json`
instead. The `LUMENLOOP_PARTNER_TOOLS` name list is authored in
`scripts/refresh-inventory.mjs`; edit it there and re-run the refresh. A count mismatch against
`/v1/me` fails the run loudly.
