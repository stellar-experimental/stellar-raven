# inventory/ — service inventory snapshots

This directory holds generated snapshots of the three upstream services. Catalog assembly and
drift detection use them.

`scripts/build-catalog.mjs` reads the Lumenloop and Stellar Light snapshots and the Stellar Docs
title snapshot. The Algolia settings snapshot is drift evidence only. The builder also reads the
authored `specs/stellar-docs.json`, the skills manifest, the pinned skill files, and the
runnable-skill registry. It reads pinned skill files through the hash-verified cache, and a cache
miss fetches the pinned upstream file. See [the scripts guide](../scripts/README.md).

## Refresh

```bash
node scripts/refresh-inventory.mjs
```

The script needs Node 24 (`.nvmrc`) and no dependencies. It reads `LUMENLOOP_API_KEY` and the
Algolia pairs `ALGOLIA_{APPLICATION_ID,API_KEY}_{DOCS,SITE}` from `.env` at the repository root.

- **Idempotent.** The script rewrites a file only when its content changes. It ignores
  `fetchedAt` in that comparison, so two runs in a row produce no diff.
- **Deterministic.** It sorts keys recursively and sorts tool and skill arrays by name. A diff is
  therefore a real upstream contract change.
- **No secrets in output.** It refuses to write an output that contains a `.env` value. Algolia
  hostnames use the placeholders `{ALGOLIA_APPLICATION_ID_DOCS}` and `{ALGOLIA_APPLICATION_ID_SITE}`.

### Daily refresh in CI

The daily `refresh.yml` workflow runs the same refresh. It opens or updates a drift issue when a snapshot
changes. It requires these repository secrets: `LUMENLOOP_API_KEY`, `ALGOLIA_APPLICATION_ID_DOCS`,
`ALGOLIA_API_KEY_DOCS`, `ALGOLIA_APPLICATION_ID_SITE`, and `ALGOLIA_API_KEY_SITE`.
Missing required secrets fail the workflow in stellar-experimental/stellar-raven. Other repositories
skip with a notice.

On a fork, also set two repository variables:

- `RAVEN_SERVICE_URL`: the base URL of your deployed Raven. The workflow reads its
  `/health/skills`. Without it, the refresh skips on a fork.
- `REFRESH_ISSUE_ASSIGNEE`: the maintainer who gets the drift issues and the `dependency-audit`
  issue. Without it, the repository owner gets them.
  [The operations guide](../docs/operations.md#scheduled-workflows) lists the workflows.

## Files

| File | Contents | Drift signal captured |
| --- | --- | --- |
| `lumenloop.json` | Lumenloop tool names, skill names, `/v1/me` tier data, and the public OpenAPI spec. See the details below. | `changelogCursor` = latest `GET /v1/changelog` entry (date/title/breaking); `openapiVersion` |
| `stellar-light.json` | The full keyless `GET /api/openapi.json` spec under `openapi`, plus a `GET /api/status` snapshot with volatile fields (`generatedAt`, `usage`) stripped. The snapshot owns its operation count. | `changelogLatest` = latest `GET /api/changelog` entry; `openapiVersion` |
| `stellar-docs.json` | Live settings for Algolia index `crawler_Stellar Docs - Docusaurus` (the facet/ranking/distinct contract). Stellar Docs operation definitions are authored separately in `specs/stellar-docs.json`. | diff of `settings` (facets, distinct, replicas, searchable attrs) |
| `stellar-docs-titles.json` | Deduplicated `type:lvl1` page titles and paths from the live Algolia index. The catalog builder scopes these titles by each Docs operation's URL prefixes and distills them into routing keywords. | page-title/path additions, removals, and rewords |

### `lumenloop.json` details

- **Tools.** All 21 tool names: 18 guest and 3 partner. The list endpoint hides partner tools
  even with a partner key. The refresh therefore joins keyless `GET /v1/tools` with the authored
  `LUMENLOOP_PARTNER_TOOLS` name list. It checks the joined count against `GET /v1/me`
  `tools.available`.
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

`scripts/refresh-inventory.mjs` rebuilds every file here. Do not edit them directly
([`AGENTS.md` “Commands and verification”](../AGENTS.md#commands-and-verification)).

- Stellar Docs operation definitions are not inventory content. Edit the authored
  `specs/stellar-docs.json` instead.
- `scripts/refresh-inventory.mjs` holds the authored `LUMENLOOP_PARTNER_TOOLS` name list. Edit
  it there and run the refresh again. A count mismatch against `/v1/me` fails the run.
