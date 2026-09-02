# Agent queue deployment — 2026-09-02

Status: complete

## Scope and authorization

The owner authorized commit, push, merge, and production deployment on 2026-09-02.
This round deploys the runtime changes merged through PR #117.
It also records the deployed Worker Version and updates the current handoff.

The dependency repair merged through PR #119 as
`0c71b99c02425307be5ef5c5c4ff1ef05935663d`.
The deployment used that exact clean `origin/main` commit.
The preflight proved that `HEAD` equaled `origin/main`.
`DEPLOY_ALLOW_UNCLEAN` was not used.

## Rollback target and pre-deployment read

The rollback Worker Version is `5ea8c1fe-e052-494d-b36b-ee8f5486a662`.
Wrangler reported it at 100 percent from the 2026-09-01 deployment.

At `2026-09-02T22:06:14Z`, `GET /playground` returned `200`.
The response carried Ray ID `a34fd219edac3495` and the known `ZB8MB5SK...` CSP fingerprint.
`GET /health/skills` returned `200`, `ok: true`, and `checked: 41`.
Its `checkedAt` value was `2026-09-02T21:07:42.822Z`.

## Pre-deployment security repair

The exact lockfile install exposed three production dependency advisories.
The bundled `fast-uri@3.1.5` carried high-severity host-confusion and SSRF advisories.
This was a deployment hold because fixed non-breaking versions were available.

`npm audit fix` updates only transitive lockfile entries.
The security-relevant updates are `fast-uri` 3.1.5 to 3.1.7, `qs` 6.15.3 to 6.16.0,
and `browserslist` 4.28.4 to 4.28.8.
Five related browser-data packages also receive compatible transitive updates.
`npm audit --omit=dev` now reports zero vulnerabilities.

The remaining full-audit findings belong to the development-only
`@huggingface/transformers` toolchain and have no available fix.
They are not an authorization to change the direct development dependency in this round.
The assembled Worker contains no `adm-zip`, `sharp`, or `onnxruntime-node` module.

## Gate results

- `npm run typecheck` passed after the documented placeholder `.dev.vars` and `npm run typegen`.
- `npm test` passed 100 files and 1,699 tests.
- `npm run test:smoke` passed four files and 82 tests.
- `npm run build` passed with Wrangler 4.124.0.
- The dry-run upload was 7,053.07 KiB and 1,410.85 KiB compressed.
- `npm audit --omit=dev` reported zero vulnerabilities.
- `npm run secrets:scan -- --tree` and `git diff --check` passed.
- PR #119 passed CI, CodeQL, secrets scanning, and test checks.
- Exact-main CI run `33689321189` and CodeQL run `33689320523` passed.

## Required gates

- Production dependency audit reports zero vulnerabilities. Complete.
- Baseline typecheck, unit tests, smoke tests, and build pass. Complete.
- Secrets scanning and diff checks pass. Complete.
- Pull-request checks pass and every legitimate review comment is reconciled. Complete.
- The deployed tree is clean and exactly equals `origin/main`. Complete.
- Production verification covers every endpoint and MCP probe required by `.agents/NEXT.md`.
  Complete.

## Deployment outcome

Wrangler completed the production deployment at `2026-09-02T22:16:20.411844Z`.
Production runs Worker Version `f62b64fa-1fb7-4c25-970d-7f98c83ab302` at 100 percent.
The deployed source is `0c71b99c02425307be5ef5c5c4ff1ef05935663d`.
The rollback Worker Version remains `5ea8c1fe-e052-494d-b36b-ee8f5486a662`.

After propagation, `/playground`, `/health/skills`, `/`, `/docs`, `/terms`, both public aliases,
and `/.well-known/oauth-protected-resource` returned `200`.
The playground response carried Ray ID `a34fe91ac815bffa-ATL` and the unchanged CSP fingerprint.
The health response carried Ray ID `a34fe92058a8aefb-ATL`, `ok: true`, and `checked: 41`.
Its `checkedAt` value was `2026-09-02T22:07:40.732Z`.
The timestamp marks the end of the last canary run stored by the cron trigger.
It is not the later `/health/skills` request time.
An unauthenticated MCP initialize returned `401` with Ray ID `a34fe98f187fed80-ATL` and the
expected OAuth challenge.

The authenticated production MCP connector initialized and completed a free `search` call.
The search returned `skills.lumenloop.stellar-ecosystem-digest` as its first hit.
One free digest run covered Blend from 2026-06-04 through 2026-09-02.
It returned 10 articles and seven A/V items without a constituent-call error.
All seven A/V items carried `date: null`, as required by the deployed contract.

No review comment remains unresolved. Production verification passed without rollback.
