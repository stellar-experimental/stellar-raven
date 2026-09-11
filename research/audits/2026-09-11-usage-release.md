# Usage release verification

The implementation merged through PR #153 as `75ee0315176d96cd9ad240a2ed0aa099f8fd26ac`.
All PR checks passed, including the full test and smoke lanes, generated artifacts, routing checks, and secret scanning.
The local suite passed 2,057 tests. The report suite passed 11 tests.

Migration `0002_collection_health.sql` applied before the collector deployment.
Wrangler then reported no pending migrations.
Cloudflare MCP confirmed each deployed Worker version serves 100% of traffic:

| Worker | Version | Deployment time UTC |
|---|---|---|
| stellar-raven-usage | 83e85b9d-6d54-4370-9fdf-d44422f0f13b | 2026-09-11 16:07:25 |
| stellar-raven-usage-report | 0c23f267-14b7-4942-a6a1-208e0748ab5a | 2026-09-11 16:07:30 |
| stellar-raven-codemode | f981db0e-3164-46df-9ec7-c36f9be3229b | 2026-09-11 16:07:38 |

The producer deployed from clean main. Its postdeploy tail attachment and cleanup schedule checks passed.
Two free acceptance calls returned HTTP 200: one search and one constant execute, at 16:07:54 and 16:07:55 UTC.
D1 recorded both with `outcome=ok`. These calls count as API-key activity, not unique accounts.

The publication sync passed separate fixture checks for bootstrap deletion, idempotence, and committed independent-change rejection.
The private Site published source `bda3238f43b5fe73e1aba26af855d61ba11480eb`, derived from the reviewed Raven merge.
Sites version 3 deployed successfully at 16:09:15 UTC:
`appgdep_6aa427a4f1b481918f384286ca286652`.
The owner-only audience stayed unchanged.

The manual [Usage archive health run](https://github.com/stellar-experimental/stellar-raven/actions/runs/34620338032) passed.
Its log confirmed a recent canary and no reported collection gaps in the last 24 hours.
The latest scheduled canary arrived at 16:07:15 UTC, just before the collector replacement.
The next hourly canary remains an operational monitoring check; the daily retention cleanup first runs September 12 at 03:17 UTC.

The launch report preserves the original dated snapshot and adds the independent audit evidence.
Gateway metadata remains under its existing 100,000-row DELETE_OLDEST policy; this release did not purge it.
