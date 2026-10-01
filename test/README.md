# Tests

Run commands from the repository root. Use the Node version in [`.nvmrc`](../.nvmrc).
See [CONTRIBUTING.md](../CONTRIBUTING.md) for installation and generated type setup.

| Command | Scope | Runtime and service access |
| --- | --- | --- |
| `npm test` | `test/*.test.ts` and `test/*.test.mjs` | Node; service calls use local substitutes. |
| `npm run test:smoke` | `test/smoke/*.test.ts` | workerd; tests use the assembled Worker and local service substitutes. |
| `npm run typecheck` | Repository TypeScript | Static checks; no service calls. |
| `npm run eval:selftest` | Evaluation harness | Local harness checks; no model calls. |
| `npm run test:usage-report` | Usage report site | Separate site tests and checks. |

The root [configuration](../vitest.config.ts) excludes smoke tests, report-site tests, and copied agent worktrees.
Run smoke tests when you change `src/executor` or `src/demo`.
The [smoke configuration](smoke/vitest.config.ts) blocks unexpected outbound Worker requests.
It supplies test authentication values.

Catalog, spec, provider, and smoke setup use pinned skill files from `ecosystem-skills/.cache/`.
A cold cache can require GitHub downloads.
With a complete cache, these checks use local files.
Tests do not require real service credentials.

The catalog freshness test writes to a temporary output path.
The spec freshness test runs its builder in a temporary repository.
Improvement write tests copy scripts into temporary repositories and substitute the `gh` and `git` commands.
These tests check failure recovery without changing tracked generated files.

| Test group | Main coverage |
| --- | --- |
| `catalog*`, `search*`, `routing*`, `drift-*` | Catalog validation, ranking, exact identities, and admission rules |
| `adapters*`, `scout*`, `stellar-docs*`, `lumenloop*` | Service contracts, response shapes, and error handling |
| `executor*`, `spec-sandbox*`, `artifacts*` | Execution limits, spec access, and artifact storage |
| `auth*`, `gate*`, `policy*`, `redact*` | Authentication, request controls, and secret removal |
| `demo*` | Page contracts and extracted page functions |
| `improvements*` | Finding lifecycle, issue body construction, and write recovery |
| `eval*`, `evidence*`, `golden*` | Evaluation data, scoring helpers, and compilation |
| `smoke/` | Worker routes and Dynamic Worker execution |

The demo tests do not execute the complete page in a browser.
Fixtures live in [`fixtures/`](fixtures/), shared test helpers in [`helpers/`](helpers/), and module substitutes in [`stubs/`](stubs/).
The RWA admission fixture adds one operation only within its tests.
The production exclusion assertion always uses the committed manifest.
Three mixed-intent controls use `it.fails` because the documented admission defects remain.
An unexpected pass requires review and removal of the expected-failure marker.

## Manual live checks

These scripts use real services through an existing local server.
They require the server's service credentials.
They never start or stop the server.
Read its bound URL and replace `<port>` below.

```sh
node test/live/run-live-execute.mjs --base-url http://localhost:<port>
node test/live/run-live-spec-search.mjs --base-url http://localhost:<port>
```

The execute checks cover service calls, skill reads, discovery, and envelope guards.
The spec checks cover callable operations, skill indexes, truncation, and Docs calls.
[`live-cases.test.mjs`](live-cases.test.mjs) checks their identities and executes spec cases against local inputs.
These offline checks do not prove live service availability.
