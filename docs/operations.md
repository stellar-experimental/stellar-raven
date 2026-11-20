# Operating Raven

Operator reference for a Raven deployment. See [usage/README.md](../usage/README.md) for the usage
archive and [ARCHITECTURE.md](../ARCHITECTURE.md) for system design.

## Deploy

The Worker is `stellar-raven-codemode` ([`wrangler.jsonc`](../wrangler.jsonc)); production host is
`https://raven.stellar.org`.

Always run `npm run deploy`, never `wrangler deploy` directly:

- `predeploy` (`scripts/deploy-preflight.mjs`) refuses a dirty tree or `HEAD != origin/main`. Set
  `DEPLOY_ALLOW_UNCLEAN=1` only for a deliberate off-main deploy.
- `postdeploy` (`scripts/check-usage-deployment.mjs`) verifies the usage tail consumer and daily
  cleanup schedule (skips with a notice if no Cloudflare credential is available).

Bind the Cloudflare account profile once per clone (Wrangler stores bindings globally, not in the
repo):

```sh
wrangler auth list
wrangler auth activate <name> .
```

A wrong-account or expired token prints `Authentication error [code: 10000]` then
`Max auth failures reached [code: 9109]` without naming the account—check the active profile first.

Run the [`CONTRIBUTING.md`](../CONTRIBUTING.md) checks before releasing. After deploy:

1. Record the printed Version ID.
2. Wait ~1 minute for new routes to propagate.
3. Verify `/` returns `200`, `GET /health` returns `200`, and unauthenticated `POST /mcp` returns
   `401` with `WWW-Authenticate: Bearer` naming `resource_metadata`.
4. Verify `GET /health/skills` returns `200` after the next hourly canary run.

Catalog deploys follow the same checks via `.agents/skills/live-drift-resolution/SKILL.md`.

## Named API keys

Non-expiring, full-access bearer credentials. Raven stores only SHA-256 digests in production
`OAUTH_KV` (`src/auth/api-keys.ts`).

```sh
npm run mcp-key -- create admin
npm run mcp-key -- rotate admin --out /tmp/stellar-raven-admin.credential
npm run mcp-key -- revoke admin
```

- Names match `[a-z][a-z0-9-]{0,31}`.
- `create` and `rotate` print the credential once after writing to KV (`--out` writes a new `0600`
  file instead). Clients send `Authorization: Bearer <name>:<token>`.
- KV propagation takes 60s+ ([How KV works](https://developers.cloudflare.com/kv/concepts/how-kv-works/)),
  so revocation is not instantaneous.

## Health checks

| Route | Meaning |
|---|---|
| `GET /health` | Worker heartbeat |
| `GET /health/skills` | Last hourly skill-retrieval canary verdict (`src/skills/canary.ts`); returns `503` if failed or never run |

## Scheduled workflows

No workflow opens PRs and Dependabot PRs are disabled; findings go to GitHub issues.

| Workflow | Schedule | Issue / behavior |
|---|---|---|
| `refresh.yml` | Daily | One `drift` issue per `<class>:<source>` drift kind (service snapshots, skill pins, directories, pin availability, Worker canary, stale QA gospel), updated only on report change and closed when cleared. Script faults open a `refresh-failure` issue. Secrets/vars in [`inventory/README.md`](../inventory/README.md). |
| `dependency-audit.yml` | Daily, and `main` edits to `package*.json` | One `dependency-audit` issue for `npm audit` findings, updated on change and closed when clean. No secret required. |
| `golden-sentinels.yml` | Daily, and `main` edits to `eval/qa/source-sentinels.*` | One `golden-sentinels` issue for primary-source drift on golden cases (queues re-verification; never evidence itself). No secret required. |
| `usage-health.yml` | Hourly | Fails on a usage collection gap; opens no issue ([`usage/README.md`](../usage/README.md)). |

`REFRESH_ISSUE_ASSIGNEE` sets the assignee for `drift`, `refresh-failure`, `dependency-audit`, and
`golden-sentinels` issues (defaults to `kalepail` on `stellar-experimental/stellar-raven`, and
`github.repository_owner` on forks).

## Observability

`src/observability.ts` writes structured JSON events to Workers Logs; traces are enabled, with a
custom `codemode.execute` span because Cloudflare does not trace Worker Loader isolates. Query in
the Cloudflare dashboard (Workers & Pages → Observability) or via the telemetry API
(`.agents/skills/cloudflare-observability-review/SKILL.md`).

Logs carry operational metadata only (counts, status, timing, exposed op IDs, pseudonymous hashes)—no
queries, code, results, answers, provider error text, or content hashes. See
[limits](../ARCHITECTURE.md#7-operating-limits-and-caps) and
[event fields](../ARCHITECTURE.md#9-observability). Playground calls disable AI Gateway payload
logging per request (`src/demo/model-config.ts`); AI Gateway keeps request metadata under its own
row-count policy.

## Data retention

`src/auth/retention.ts` owns Raven's retention durations; `test/retention.test.ts` guards call sites.

| Data | Store | Retention |
|---|---|---|
| OAuth access token | `OAUTH_KV` | 1 hour |
| OAuth refresh grant | `OAUTH_KV` | 90 days, fixed from sign-in |
| Registered OAuth client | `OAUTH_KV` | 365 days; renews for 365 days on token requests in its second half |
| Client assertion replay marker (`client-assertion-jti:<hash>`) | `OAUTH_KV` | Assertion lifetime + 60s (CIMD clients using `private_key_jwt` only) |
| Parked login state (`login:<state>`) | `OAUTH_KV` | 10 minutes |
| Playground session cookie | browser | 2 hours |
| Playground throttle (`demo-throttle:<subject>:<hour>`) | `OAUTH_KV` | 2 hours |
| Oversized execute artifact (`art/<ownerHash>/<id>`) | R2 `stellar-raven-artifacts` | 7 days (store check + bucket lifecycle) |
| Usage response row | D1 `stellar-raven-usage` | 13 UTC calendar months (including current month) |
| Workers Logs, traces, request metadata | Cloudflare | Cloudflare schedule, max 7 days |
| AI Gateway request metadata | Cloudflare AI Gateway | Gateway row-count policy |

Named API keys do not expire. User-facing privacy disclosures live at `/terms` (`src/site.ts`).

## Account-data deletion

Raven has no admin or self-service deletion endpoint. Process verified requests in production
consoles:

1. Find the WorkOS user ID by email. With production `MCP_SERVER_SECRET`, compute
   `subject = SHA-256(workosUserId + ":" + MCP_SERVER_SECRET)` (matching
   [`deriveSubject`](../src/auth/workos.ts)). Never log or ticket the ID, subject, or secret.
2. In production `OAUTH_KV`, delete all keys under `grant:<subject>:`, `token:<subject>:`, and
   `demo-throttle:<subject>:` and confirm each prefix is empty. (Signed Playground cookies expire
   within 2 hours and cannot be revoked.)
3. Compute `ownerHash = SHA-256(subject).slice(0, 16)`. In R2 `stellar-raven-artifacts`, delete all
   objects under `art/<ownerHash>/` and confirm the prefix is empty.
4. In D1 `stellar-raven-usage`, delete `usage_responses` rows where `subject_hash = ownerHash` using
   a bound query and confirm zero rows remain. Repeat after any D1 Time Travel restore.
5. Delete the WorkOS production user only if the request includes the identity account.

All other records expire on schedule above; repo tools cannot delete individual Cloudflare log
entries or request metadata.

References: [WorkOS user API](https://workos.com/docs/reference/authkit/user),
[KV commands](https://developers.cloudflare.com/kv/reference/kv-commands/),
[R2 object deletion](https://developers.cloudflare.com/r2/objects/delete-objects/).
