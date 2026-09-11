# Merge acceptance — codex/usage-audit staged tree (read 2026-09-11 ~16:10 UTC)

Reviewer: Claude Fable 5.1 (`claude-fable-5-1`), high effort. Read-only; staged index inspected with `git show :path` and `git diff --cached`. No edits.

## Verdict

**Accept for merge. No remaining code blockers.** Release gates below stay open until deployment and live acceptance.

## Gates I re-ran on the staged tree

| Gate | Result |
|---|---|
| `npm test` | 113 files, 2,057 tests pass |
| focused `vitest run test/usage.test.ts test/usage-health.test.mjs test/usage-site-runtime.test.mjs` | 15 tests pass |
| `npm run test:usage-report` | 11 tests pass, `check` passes |
| `npm run typecheck` | pass |
| `npm run build:usage`, `npm run build:usage-report` (dry runs) | pass |
| `npm run secrets:scan -- --tree` | clean, gitleaks clean |
| Remote D1 `migrations list` (earlier this session) | `0002_collection_health.sql` pending, as planned for pre-deploy |

## Claims checked against staged content

- **Collector.** Staged `src/usage/collector.ts` matches the version I reviewed: per-trace isolation, chunk retry with continuation, `outcome` receipts, `unidentified:` and `write-failure:` diagnostics, final throw after a failed write so the tail invocation surfaces in metrics. Tests cover the three failure shapes.
- **Shared SQL.** `queries.js` is the single source; the CLI imports it and substitutes validated integers. `usage/report-site/README.md` now says so and no longer cites the old commit. Correct.
- **README claims.** Cancellation volume (about 2,000 receipts per day), diagnostic duplication on redelivery, `npm run deploy` versus direct Wrangler, token source for the deployment check, and unchanged gateway metadata retention are all stated and match the code and my live observations.
- **Terms page.** Only "and collection status" was added to the usage-statistics sentence. Counsel-approved scope untouched. Matches the README definition.
- **Evidence panel.** `launch-data.json.independentAudit` values equal my sanitized JSON: 1,232 search, 1,388 execute, 61 historical accounts, archive 6 and 7, union 62, 33 repeat-day accounts, 263 grant accounts over 417 grants, 2,406 clients, gateway 2,649 / 2,704 / 362. The panel's limits paragraph states the window and instrument differ from the original snapshot and that counts must not be added. Original `toolWindows` unchanged (1231 / 1376 / 61; 143 / 53; 6 / 11; 6 / 7 / 3).
- **Evidence JSON.** `usage/report-site/evidence/independent-audit.json` is byte-identical to my scratch file. The only 16-hex-or-longer strings are the two commit hashes. Sanitized.
- **Review copies.** Both `research/audits/2026-09-11-usage-fable-*.md` files are byte-identical to my scratch files.
- **`env.example` rename.** Justified: `scripts/scan-secrets.mjs` blocks any tracked `.env*` path. `usage/report-site/.gitignore` still ignores `.env`. The Sites README should tell operators to copy `env.example` to `.env`; a one-line follow-up, not a blocker.
- **Sync script.** Bootstrap now treats the target's tracked files as the previous set, so obsolete publication files (for example the old `.env.example`) are removed on first sync; the hash guard applies from the second sync onward and the bootstrap commit check still pins `3523623`. Sound.
- **Workflows.** `usage-health.yml` uses the same `actions/checkout@v7` and `setup-node@v7` majors as the existing workflows. `USAGE_REPORT_TOKEN` is reported configured; the first `workflow_dispatch` run is a release gate.

## Non-blocking notes carried forward

1. `README` for the site should mention `cp env.example .env` for local development.
2. Receipt statements and response statements still share 50-statement chunks; a schema mismatch would discard responses with receipts. Safe once migration `0002` precedes the collector deploy, which the ledger orders correctly. Worth a TODO to split chunks.
3. `failed_invocations` in health can fire on producer-side exceptions, including a failing skill-canary cron. Documented as informational; consider a `trigger` column later.
4. Gateway metadata retention remains a recorded policy decision, not a code item.

## Release gates (unchanged from the fix review)

1. Apply migration `0002` remotely; `migrations list --remote` shows nothing pending.
2. Deploy collector; confirm a receipt with non-null `outcome` after the deploy timestamp and the next hourly canary receipt within 70 minutes.
3. Deploy report Worker; unauthenticated `/report` → 401; JSON contains `health.last_canary_ms`.
4. Sync from clean `main == origin/main`, publish Sites; browser shows counts on `/`, `/launch` renders with the audit panel; report Worker log shows a 200 from `Raven-Usage-Report/1.0`.
5. Manual run of "Usage archive health" green.
6. D1 rows since 14:34:59 UTC equal the log count of tool events for the same window.
