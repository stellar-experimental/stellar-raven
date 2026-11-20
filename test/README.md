# Tests

Run commands from the repository root. Use the Node version in [`.nvmrc`](../.nvmrc).
See [README.md](../README.md#run-locally) for installation and generated type setup.

| Command | Scope | Runtime and service access |
| --- | --- | --- |
| `npm test` | `test/*.test.ts` and `test/*.test.mjs` | Node; service calls use local substitutes. |
| `npm run test:smoke` | `test/smoke/*.test.ts` | workerd; tests use the assembled Worker and local service substitutes. |
| `npm run typecheck` | Repository TypeScript | Static checks; no service calls. |
| `npm run eval:selftest` | Evaluation harness | Local harness checks; no model calls. |
| `npm run test:usage-report` | Usage report site | Separate site tests and checks. |

The root [configuration](../vitest.config.ts) excludes smoke tests, report-site tests, `research/`, and copied worktrees. Run `npm run test:smoke` when you change `src/executor` or `src/demo`; [smoke/vitest.config.ts](smoke/vitest.config.ts) runs under `@cloudflare/vitest-plugin` with test auth values and an outbound wall serving only pinned skill files locally.

Tests need no service credentials. Catalog, spec, provider, and smoke tests read pinned skill files from `ecosystem-skills/.cache/` (a cold cache downloads from GitHub). Freshness and improvement write tests run in temporary paths with substituted `gh`/`git` commands so tracked files stay untouched.

The table names groups, not every file; unlisted tests belong to the nearest group.

| Test group | Main coverage |
| --- | --- |
| `catalog*`, `search*`, `scoring*`, `routing*`, `drift-*`, `extract-*`, `family-text*`, `super-spec*`, `argument-aliases*`, `identifier-token*`, `title-keywords*`, `description-notes*`, `replay-*` | Catalog validation, ranking, exact identities, admission rules, replayed searches, and generated specifications |
| [adapters.test.ts](adapters.test.ts), [lumenloop-shape.test.ts](lumenloop-shape.test.ts) | Service contracts, response shapes, and error handling |
| `executor*`, `spec-sandbox*`, `artifacts*`, `shape-logs*`, `source-basis*`, `evidence-checkpoint*`, `exact-evidence*`, `script-hints*` | Execution limits, spec access, artifact storage, and evidence boundaries |
| `auth*`, `policy*`, `retention*`, `consent-page*`, `html*` | Authentication, request controls, retention, escaping, and secret removal |
| `oauth-origins*`, `hosts*` | Per-origin OAuth providers, the native-callback allowlist, and host routing |
| `server*`, `mcp-*`, `observability*`, `site-lazy-counts*` | MCP contracts, operator keys, request events, and page initialization |
| `demo*` | Page contracts and extracted page functions |
| `skill*`, `pinned-source-shape*` | Pinned content, section reads, source integrity, exposure, and runner contracts |
| `model-family*` | The launch-line model resolver, with hand-written catalog fixtures (no host cache is read) |
| `model-call-billing*` | The subscriptions-first guard: no code file, skill document or workflow outside the listed exceptions names a provider endpoint, AI Gateway token, Workers AI call, Playground chat route or AI SDK import (`eval/EVALS.md`, "Model-call billing") |
| `qa-*`, `re-judge*`, `gate-evidence*`, `diagnostic-rejudge-source*` | Evaluation evidence, grading, lifecycle, budgets, identity checks, and saved-answer grading |
| `corroboration-*`, `claim-read-packets*` | Corroboration rubric, guard, build, and scan; claim-read packets |
| `case-search-*`, `case-text-scan*`, `heldout-read*`, `source-sentinels*`, `split-amend*`, `tuning-*`, `step2-roles-scan*`, `find-uncited-golden-round-json*` | Case-text guards: the agent search hook, `.ignore` layout, held-out reads, split amendments, tuning scans, and uncited golden round JSON |
| `playground-*`, `quarantine-reader-rejection*` | Playground evaluation artifacts and quarantine controls |
| `improvements*` | Finding lifecycle, issue body construction, and write recovery |
| `eval*`, `evidence-pack*`, `golden*`, `plan-grade*`, `temporal-scorer*`, `protocol-history-report*`, `run-routing-manifest-evidence*`, `runner-error-text*` | Evaluation data, evidence extraction, scoring, and compilation |
| `agentic-capture*`, `analyze-composition*`, `compare-architecture-ab*` | Transcript capture, operation composition, and comparison measurements |
| `discovery-paid-run-guards*`, `exact-old-runtime-adapter*`, `p6-judge-self-test*`, `partner-docs-eval*`, `plain-operation-harness*` | Evaluation command controls and local substitutes for model and service calls |
| `check-*`, `build-index*`, `diff-pins*`, `diff-inventory*`, `refresh-inventory*`, `refresh-anchor-workflow*`, `scripts-shared*`, `summarize-*`, `sync-drift-issues*`, `classify-canary*`, `code-scanning-regressions*` | Maintenance commands, pin review, atomic writes, health classification, and drift/issue sync |
| `deploy-preflight*`, `scan-secrets*`, `private-usage-guard*`, `emitted-text-guard*` | Deployment, secret-scanning, private-data, and exposure guards |
| `stellar-org-*`, `stellar-docs-anchor*`, `stellar-community*`, `per-source-status*` | Adapter guards, anchors, the community snapshot, and per-source status |
| `usage*` | Usage collection, health checks, and report runtime behavior |
| [usage/report-site/test](../usage/report-site/test/) | Separate report-site authentication, aggregation, and output tests |
| [live-cases.test.mjs](live-cases.test.mjs) | Offline checks of the manual live scripts |
| `smoke/` | Worker routes and Dynamic Worker execution |

Demo tests do not execute the full page in a browser. Fixtures live in [`fixtures/`](fixtures/), helpers in [`helpers/`](helpers/), and substitutes in [`stubs/`](stubs/). The RWA admission fixture adds one operation only in its tests; the production exclusion check uses the committed manifest. Three mixed-intent controls in `drift-141-routing.test.ts` use `it.fails` for open admission defects—an unexpected pass requires review and removal of `.fails`.

## Manual live checks

Run against an existing local server (never started or stopped by these scripts) using its service credentials and bound `<port>`:

```sh
node test/live/run-live-execute.mjs --base-url http://localhost:<port>
node test/live/run-live-spec-search.mjs --base-url http://localhost:<port>
```

Execute checks cover service calls, skill reads, discovery, and envelope guards; spec checks cover callable operations, skill indexes, truncation, and Docs calls. [`live-cases.test.mjs`](live-cases.test.mjs) checks their identities offline and does not prove live service availability.
