# Dependency audit — 2026-09-17

This record describes the toolchain update on branch `fix/toolchain-audit`, based on `c6968e7412399f099c0df51b51eacd7bf4c48f12`.
Before the commit, it still needs the checks that run Wrangler.

## Inputs

| File | SHA-256 | Source |
|---|---|---|
| `npm-audit-before.json` | `9fb1d3940d9fdaba6af293dd228ff5bf299e2c253e93cbbe8df66b431a3f0c71` | `npm audit --json` at `c6968e74` |
| `npm-audit-after.json` | `22a6f7882fb3f46323af60482299c2cdbaa239b9170ad9132fbbc52acbb39cd5` | `npm audit --json` after `npm ci` of this change |

Before: 8 findings (7 high, 1 moderate). After: 7 findings (7 high).

## Changes

- `hono` 4.13.1 → 4.13.8. This is a lockfile update inside the `@modelcontextprotocol/sdk` range `^4.11.4`.
  The Hono package appears only in the SDK's Node adapter and in its examples.
- `wrangler` 4.124.0 → 4.133.0. The nested `miniflare` is 5.20260916.0-alpha, the nested `workerd` is 1.20260916.1,
  and the nested `sharp` is 0.35.4.
- The `@cloudflare/workers-types` floor rises from `^5.20260825.1` to `^5.20260916.1`. Wrangler 4.133.0 declares
  that peer requirement. The lockfile resolves 5.20260917.1.
- `@huggingface/transformers` stays at 4.2.0. The Vectorize runtime migration must happen first.
- `eval/vectorize/build-clause-artifact.mjs` now takes the artifact `runtime.version` from `MODEL.runtime`.
  It no longer repeats the version as a separate literal.

The change does not use a forced audit fix, an override, or a downgrade of the pool.

## Remaining findings

| Package | Nodes | Severity | Source pin |
|---|---|---|---|
| `@cloudflare/vitest-pool-workers` | 0.22.0 | high | pool 0.22.0 |
| `wrangler` | `@cloudflare/vitest-pool-workers/node_modules/wrangler` 4.124.0 | high | pool 0.22.0 |
| `miniflare` | root 5.20260815.0-alpha | high | pool 0.22.0 |
| `sharp` | `miniflare/node_modules/sharp` 0.35.2; root 0.34.5 | high | pool 0.22.0; transformers 4.2.0 |
| `@huggingface/transformers` | 4.2.0 | high | direct pin |
| `onnxruntime-node` | 1.24.3 | high | transformers 4.2.0 |
| `adm-zip` | 0.5.18 | high | transformers 4.2.0 |

Disposition: accepted development-tool risk. The pool serves `test:smoke`, and Transformers serves the eval Vectorize
tools. Neither package ships in the Worker bundle.

npm offers `@cloudflare/vitest-pool-workers@0.8.30` for the pool chain. That version is a semver-major downgrade and
breaks the vitest 4 smoke config, so this change rejects it.

npm offers `@huggingface/transformers@4.3.0` for the Transformers chain. That version waits for the runtime migration
recorded in `.agents/TODO.md`.

Two local runtimes coexist:

- `wrangler dev` and `npm run build` use `workerd` 1.20260916.1.
- The smoke pool and `@cloudflare/unenv-preset` use root `workerd` 1.20260815.1.

## Validation

Tool versions: Node v24.13.0, npm 11.11.0, Wrangler 4.133.0, gitleaks 8.30.1.

| Check | Result |
|---|---|
| `npm ci` into a dedicated `node_modules` | exit 0; 320 packages |
| `npx vitest run test/eval-discovery-vectorize.test.mjs test/eval-vectorize-{clause,rerank,support}-fit.test.mjs` | 4 files, 77 tests passed |
| `npx vitest run` | 120 files; 2,160 passed, 4 skipped (after the PR #170 rebase) |
| `npm run typegen` with the CI placeholder `.dev.vars` names | exit 0 |
| `npx tsc --noEmit` on the regenerated `env.d.ts` | exit 0 |
| `npm run build` | exit 0; total upload 7,147.33 KiB (gzip 1,414.83 KiB; after the PR #170 rebase) |
| Hono in the bundle | absent: 0 of 1,120 `dist/server.js.map` sources; no `@hono/` or `hono` module specifier in `dist/server.js` |
| `npm run test:smoke` (pool 0.22.0, nested wrangler 4.124.0) | 5 files, 94 tests passed |
| `wrangler dev --host localhost --port 8793` | ready in 4 s; `GET /` 200; unauthenticated `POST /mcp` 401; `GET /health/skills` 503 (no recorded verdict in fresh local KV); process stopped and port released |
| `npm run secrets:scan -- --tree` | clean, including gitleaks |
| `gitleaks dir` over this directory with `.gitleaks.toml` | no leaks |

The regenerated `env.d.ts` differs from the earlier copy only in `.dev.vars` names and member order. The CI name list
has no `MCP_ADMIN_TOKEN`; that name came from the primary checkout's local `.dev.vars`. Typecheck passes without it.

## Independent release review

Fable high reviewed the final scope and validation logs. The review passed.
The coordinator repeated type checking with a recorded exit code of zero.
The change was rebased onto PR #170 without a conflict. Runtime source and catalog remain identical to `848edec4`.
