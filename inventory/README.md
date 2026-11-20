# inventory/ — service inventory snapshots

Generated snapshots of the four upstream services for catalog assembly and drift detection.

`scripts/build-catalog.mjs` reads `lumenloop.json`, `stellar-light.json`, and `stellar-docs-titles.json` alongside authored `specs/stellar-docs.json`, `specs/stellar-org.json`, the skills manifest, pinned skill files (via the hash-verified cache), and the runnable-skill registry ([scripts guide](../scripts/README.md)). `stellar-docs.json` and `stellar-org.json` are drift evidence only.

## Refresh

```bash
node scripts/refresh-inventory.mjs
```

Requires Node 24 (`.nvmrc`), no dependencies, and `LUMENLOOP_API_KEY` + `MINTLIFY_ASSISTANT_API_KEY` in `.env` or the environment.

- **Idempotent & deterministic:** rewrites a file only when content (ignoring `fetchedAt`) changes, sorting keys and tool/skill arrays so diffs reflect real contract changes.
- **Secret guard:** refuses to write any output containing a `.env` value.

### Daily refresh in CI

`refresh.yml` runs the same refresh daily and reconciles one `drift`-labeled issue per `<class>:<source>` key via `scripts/sync-drift-issues.mjs` (opening, updating only when a key's report changes, and closing on clear). Missing `LUMENLOOP_API_KEY` or `MINTLIFY_ASSISTANT_API_KEY` secrets fail in `stellar-experimental/stellar-raven` and skip with a notice on forks.

On a fork, set two repository variables:

- `RAVEN_SERVICE_URL`: deployed Raven base URL for `/health/skills` (without it, refresh skips on a fork).
- `REFRESH_ISSUE_ASSIGNEE`: drift-issue assignee ([operations guide](../docs/operations.md#scheduled-workflows) owns the default).

## Files

| File | Contents | Drift signal |
| --- | --- | --- |
| `lumenloop.json` | Guest + partner tool names, skill names, `/v1/me` tier/lane/tool counts (no limits), and keyless `GET /v1/openapi.json` (details below). | `changelogCursor`, `openapiVersion` |
| `stellar-light.json` | Keyless `GET /api/openapi.json` plus `GET /api/status` with volatile fields (`generatedAt`, `usage`) stripped. | `changelogLatest`, `openapiVersion` |
| `stellar-docs.json` | Mintlify backend identity, search/page probe shapes, and keyless `llms.txt` page-index fingerprint. | `source`, `contract`, `pageIndex` |
| `stellar-docs-titles.json` | Deduplicated titles and paths from `llms.txt` and nested `/_llms/*.txt`, used by the catalog builder for routing keywords. | Title/path additions, removals, rewords |
| `stellar-org.json` | Origin, search path, keyless site-search row keys, and page probe status/content-type/`<main>` check. | `source`, `contract` |

### `lumenloop.json` details

- **Tools:** `GET /v1/tools` hides partner tools even with a partner key, so refresh joins it with `LUMENLOOP_PARTNER_TOOLS` in `scripts/refresh-inventory.mjs` and checks the count against `/v1/me` `tools.available`. Guest tools carry full schemas and invoke metadata; partner tools are name-only stubs (`partner_stub: true`, never partner detail). `openapi` omits partner tools, so `tools` is the source of truth.
- **Skills:** public skills carry metadata and paths (never contents); partner skills are name/set/tier stubs only. No count guard applies (`/v1/me` exposes none).

## Generated — never hand-edited

Rebuild files here with `scripts/refresh-inventory.mjs` ([`AGENTS.md`](../AGENTS.md#commands-and-verification)). Edit Stellar Docs / stellar.org operation definitions in `specs/stellar-docs.json` or `specs/stellar-org.json`, and edit `LUMENLOOP_PARTNER_TOOLS` in `scripts/refresh-inventory.mjs` then re-refresh.
