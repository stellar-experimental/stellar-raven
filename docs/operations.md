# Operating Raven

For the operator of a Raven deployment. [The usage guide](../usage/README.md) covers the usage
archive, and [the architecture](../ARCHITECTURE.md) covers the design.

## Deploy

The Worker is `stellar-raven-codemode`; its routes and bindings are in
[`wrangler.jsonc`](../wrangler.jsonc). The production host is `https://raven.stellar.org`.

Run `npm run deploy`, never `wrangler deploy` directly. The package script adds two checks:

- `predeploy` (`scripts/deploy-preflight.mjs`) refuses a dirty working tree and a `HEAD` that is
  not `origin/main`. `DEPLOY_ALLOW_UNCLEAN=1` skips the whole preflight and deploys the working
  tree as it is. Use it only for a deliberate off-main deploy.
- `postdeploy` (`scripts/check-usage-deployment.mjs`) checks that the usage tail consumer is
  attached and that the collector's daily cleanup schedule exists. It skips with a notice when no
  Cloudflare credential is available.

Wrangler must use the Cloudflare account that owns the Worker. It stores credentials per
directory in `~/.wrangler`, so bind the profile once per clone:

```sh
wrangler auth list                 # profiles and their bound directories
wrangler auth activate <name> .    # bind one profile to this checkout
```

A wrong-account or expired credential shows `Authentication error [code: 10000]`, then
`Max auth failures reached [code: 9109]`. Neither names the account, so check the active profile
first.

Before a release, run the checks in [`CONTRIBUTING.md`](../CONTRIBUTING.md). After a deploy:

1. Record the Version ID that `npm run deploy` prints.
2. Wait about one minute. A new route can return 404 while it propagates.
3. Check that the landing page returns `200`, `GET /health` returns `200`, and an unauthenticated
   `POST /mcp` returns `401` with a `WWW-Authenticate: Bearer` header that names
   `resource_metadata`.
4. Check that `GET /health/skills` returns `200` after the next hourly canary run.

A catalog deploy uses the same checks through the `live-drift-resolution` skill.

## Named API keys

A named API key is a non-expiring, full-access credential. Raven stores only its SHA-256 digest
in the production `OAUTH_KV` namespace (`src/auth/api-keys.ts`).

```sh
npm run mcp-key -- create admin
npm run mcp-key -- rotate admin --out /tmp/stellar-raven-admin.credential
npm run mcp-key -- revoke admin
```

- Names match `[a-z][a-z0-9-]{0,31}`.
- `create` and `rotate` print the credential once, after the remote write. `--out` writes it to
  a new file with mode `0600` instead.
- Clients send `Authorization: Bearer <name>:<token>`.
- A KV change can take 60 seconds or more to reach every location
  ([How KV works](https://developers.cloudflare.com/kv/concepts/how-kv-works/)). Revocation is
  not an immediate emergency control.

## Health checks

| Route | Meaning |
|---|---|
| `GET /health` | The Worker answers. |
| `GET /health/skills` | The last verdict of the hourly skill-retrieval canary (`src/skills/canary.ts`, on the cron trigger in `wrangler.jsonc`). It returns 503 when the canary failed or never ran. |

## Scheduled workflows

No workflow opens a pull request, and the repository uses no Dependabot pull requests. Automated
findings go to GitHub issues.

| Workflow | Schedule | Report |
|---|---|---|
| `refresh.yml` | Daily | One open issue labeled `drift` for upstream drift in the service snapshots, skill pins, and canaries; it also reads `/health/skills`. A script fault goes to an issue labeled `refresh-failure`. [`inventory/README.md`](../inventory/README.md) lists its secrets and variables. |
| `dependency-audit.yml` | Daily, and on each change to `package.json` or `package-lock.json` on `main` | One open issue labeled `dependency-audit` for `npm audit` findings. The workflow replaces the body when findings change and closes the issue when the audit is clean. It needs no secret. |
| `usage-health.yml` | Hourly | The run fails on a usage collection gap and opens no issue ([`usage/README.md`](../usage/README.md)). |

The repository variable `REFRESH_ISSUE_ASSIGNEE` names the maintainer who gets the drift,
refresh-failure, and dependency issues. Without it, the repository owner gets them.

## Observability

`src/observability.ts` writes structured JSON events to Workers Logs. Traces are on. Each sandbox
run has a custom `codemode.execute` span, because Cloudflare does not instrument the Worker
Loader isolate. Query both in the Cloudflare dashboard (Workers & Pages, then Observability) or
through the telemetry query API. The `cloudflare-observability-review` skill gives the procedure.

The logs hold operational metadata only: counts, status, timing, exposed operation IDs, and
pseudonymous subject and client joins. They hold no queries, execute code, tool results, answers,
provider error messages, or content-derived hashes. The architecture lists the
[limits and caps](../ARCHITECTURE.md#7-operating-limits-and-caps) and the
[event fields](../ARCHITECTURE.md#9-observability).

Playground model requests turn off AI Gateway payload collection per request
(`src/demo/model-config.ts`). AI Gateway still keeps request metadata under its own row-count
policy.

## Data retention

`src/auth/retention.ts` holds every retention duration that Raven sets, and
`test/retention.test.ts` checks the call sites against it.

| Data | Store | Retention |
|---|---|---|
| OAuth access token | `OAUTH_KV` | 1 hour |
| OAuth refresh grant | `OAUTH_KV` | 90 days, fixed from sign-in |
| Registered OAuth client | `OAUTH_KV` | 365 days |
| Parked login state (`login:<state>`) | `OAUTH_KV` | 10 minutes |
| Playground session cookie | browser | 2 hours |
| Playground throttle (`demo-throttle:<subject>:<hour>`) | `OAUTH_KV` | 2 hours |
| Oversized execute artifact (`art/<ownerHash>/<id>`) | R2 `stellar-raven-artifacts` | 7 days (store check and bucket lifecycle) |
| Usage response row | D1 `stellar-raven-usage` | 13 UTC calendar months, including the current month |
| Workers Logs, traces, request metadata | Cloudflare | Cloudflare's schedule, at most 7 days |
| AI Gateway request metadata | Cloudflare AI Gateway | The gateway's row-count policy |

Named API keys do not expire. The user-facing privacy statement is the `/terms` page
(`src/site.ts`).

## Account-data deletion

Raven has no admin endpoint and no self-service deletion page. Handle a verified request in the
production consoles:

1. In WorkOS, find the user by the contact email and record the WorkOS user ID. With the
   production `MCP_SERVER_SECRET`, compute
   `subject = SHA-256(workosUserId + ":" + MCP_SERVER_SECRET)`, the same value as
   [`deriveSubject`](../src/auth/workos.ts). Never put the ID, the subject, or the secret in
   logs or tickets.
2. In the production `OAUTH_KV` namespace, list and delete every key under `grant:<subject>:`,
   `token:<subject>:`, and `demo-throttle:<subject>:` (KV dashboard, or Wrangler's remote list
   and delete commands). Check that each prefix is empty. This revokes Raven OAuth grants and
   tokens. The signed Playground cookie cannot be revoked; it expires after 2 hours.
3. Compute `ownerHash = SHA-256(subject).slice(0, 16)`. In the R2 bucket
   `stellar-raven-artifacts`, delete every object under `art/<ownerHash>/`. Check that the prefix
   is empty.
4. In the D1 database `stellar-raven-usage`, delete the `usage_responses` rows whose
   `subject_hash` equals `ownerHash`, with a bound query through the Cloudflare API or the
   console. Check that no matching row remains. D1 Time Travel keeps recovery copies for its
   recovery window, so repeat the deletion after any restore.
5. If the request includes the identity account, delete the user in the WorkOS production
   environment after steps 1 to 4. Otherwise keep the WorkOS account.

Records that this procedure does not remove expire on their own (see the table above). The
repository tools cannot remove individual Workers Logs entries or Cloudflare request metadata.

References: [WorkOS user API](https://workos.com/docs/reference/authkit/user),
[KV commands](https://developers.cloudflare.com/kv/reference/kv-commands/),
[R2 object deletion](https://developers.cloudflare.com/r2/objects/delete-objects/).
