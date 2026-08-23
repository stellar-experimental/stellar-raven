<p align="center">
  <img src="./assets/repo/Gemini_Generated_Image_v5uajdv5uajdv5ua.png" alt="stellar-raven — thermal neural interface" width="100%">
</p>

# Stellar Raven

Remote MCP server on Cloudflare Workers exposing two tools, `search` and `execute`, over a
unified catalog of Stellar ecosystem services and skills. Agents use `search` to discover
capabilities, then call `execute` with JavaScript that runs in a Dynamic Worker isolate with no
network access; service calls go through host-side adapters. The server instructions also include
a generated source-family micro-map so agents can plan which catalog family should ground a
question before searching.

Design: [PLAN.md](./PLAN.md). Code-verified mechanics and operating limits:
[ARCHITECTURE.md](./ARCHITECTURE.md).

Deployed as the Cloudflare worker `stellar-raven-codemode` at https://raven.stellar.org — the
worker/service name deliberately keeps the `codemode` suffix even though the repo is `stellar-raven`.

## Quickstart

```
Server URL:   https://raven.stellar.org         (canonical since 2026-08-04; service live since 2026-07-02)
MCP endpoint: POST https://raven.stellar.org/mcp    (streamable HTTP)
Legacy aliases: https://raven.stellar.buzz and https://agents.stellar.buzz still serve the same
                worker (`/mcp` included) — kept for existing clients.
Health:       GET  /health          # service heartbeat
              GET  /health/skills   # last skill-retrieval canary verdict (503 = failing/never ran)
```

Local dev: use Node 24, run `npm ci`, populate `.dev.vars`, then `npm run dev` and point a client at
`http://localhost:8787/mcp`. Note: `wrangler dev` does NOT hot-reload `.dev.vars` edits —
restart it after changing them.

## Connect

Add `https://raven.stellar.org/mcp` in an MCP client that supports streamable HTTP and OAuth
(Claude, Cursor, or any compatible client). The Worker is its own OAuth authorization server and
hands sign-in to WorkOS AuthKit; clients should discover and complete that flow automatically.
Access tokens last 1 hour, and compatible clients refresh them automatically within a fixed
90-day authorization window before browser authorization is required again.

Operators can manage non-expiring, full-access named credentials in production `OAUTH_KV`:

```sh
npm run mcp-key -- create admin
npm run mcp-key -- rotate admin --out /tmp/stellar-raven-admin.credential
npm run mcp-key -- revoke admin
```

Names match `[a-z][a-z0-9-]{0,31}`. Create and rotate emit the credential once after the
remote write; `--out` writes it with mode `0600`. Send it as
`Authorization: Bearer <name>:<token>`. Cloudflare KV changes can take 60 seconds or longer to
propagate globally, so this is for infrequently changed internal keys, not immediate emergency
revocation. See [Cloudflare KV consistency](https://developers.cloudflare.com/kv/concepts/how-kv-works).

Operational auth details live in [ARCHITECTURE.md](./ARCHITECTURE.md) and
[`research/auth-workos.md`](./research/auth-workos.md). Vulnerability reporting and researcher
scope live in [SECURITY.md](./SECURITY.md).

## Development

```
# use Node 24, matching CI
npm ci
# create .dev.vars with the variable names from .github/workflows/ci.yml
npm run typegen     # regenerate env.d.ts after wrangler.jsonc/.dev.vars changes
npm run typecheck   # tsc
npm test            # vitest (offline; auth suite in test/auth.test.ts)
npm run test:smoke  # assembled Worker and Dynamic Worker boundary
npm run build       # dry-run the Worker bundle
```

For local MCP testing, populate `.dev.vars`, run `npm run dev`, and point a client at
`http://localhost:8787/mcp`. Restart `wrangler dev` after editing `.dev.vars`.

`npm run deploy` needs Wrangler authenticated against the Cloudflare account that owns the
worker, which is not the same account every contributor is logged into by default. Wrangler
resolves credentials per directory, so bind the right profile once per clone:

```
wrangler auth list                 # profiles and their bound directories
wrangler auth activate <name> .    # bind one to this repo
```

A stale or wrong-account credential surfaces as `Authentication error [code: 10000]`, then
`Max auth failures reached [code: 9109]` once retries trip the limiter — not as a permissions
message naming the account, so check the active profile before assuming the token expired.
The binding lives in `~/.wrangler`, never in the repo.

## Observability

Structured JSON events (`src/observability.ts`) land in Workers Logs; traces are enabled with a
custom `codemode.execute` span around each sandbox run (the Worker Loader isolate is not
auto-instrumented). Both are queryable in the dash (Workers & Pages → Observability) or via the
telemetry query API. Survey of the whole surface — pricing, query API, OTel export, GraphQL
metrics: `research/observability-cloudflare.md`.

For cap/rate-limit reviews, start with [ARCHITECTURE.md §7](./ARCHITECTURE.md#7-operating-limits-and-caps):
it lists the shared execute sandbox limits, demo-only chat limits, MCP-only artifact/auth limits,
and the log event names to query.

Raven's structured logs contain operational metadata only: counts, status, timing, exposed operation
IDs, and pseudonymous subject/client joins. They exclude queries, execute code, tool results, answers,
provider error messages, and content-derived hashes. Existing Cloudflare platform logs age out on
Cloudflare's fixed retention schedule (at most seven days). Playground model requests also set
Cloudflare AI Gateway's per-request logging override to off.

### Account-data deletion runbook

There is no deployed Raven admin endpoint or self-service deletion UI. Handle a verified request in
the production consoles as follows:

1. In WorkOS, find the user by the contact email and record the WorkOS user ID. With the production
   `MCP_SERVER_SECRET`, compute `subject = SHA-256(workosUserId + ":" + MCP_SERVER_SECRET)`, exactly as
   [`deriveSubject`](./src/auth/workos.ts) does. Never paste the ID, subject, or secret into logs/tickets.
2. In Cloudflare's production `OAUTH_KV` namespace, list and delete every exact key under both
   `grant:<subject>:` and `token:<subject>:`. This revokes Raven OAuth grants and tokens. Also list and
   delete `demo-throttle:<subject>:` keys. Use the KV dashboard or Wrangler's documented remote
   list/delete commands; verify each prefix is empty afterward. The signed demo cookie cannot be
   individually revoked and remains valid until its two-hour expiry.
3. Compute `ownerHash = SHA-256(subject).slice(0, 16)`. In the production R2 bucket
   `stellar-raven-artifacts`, delete every object under `art/<ownerHash>/` and verify the prefix is empty.
4. If the request includes deleting the identity account, delete the user in the WorkOS production
   environment after the Raven cleanup. Otherwise leave the WorkOS account in place.

The unscoped `login:<state>` records expire within ten minutes. Demo throttle records expire within two
hours and R2 artifacts within seven days even without manual deletion. Already-ingested Workers Logs and
Cloudflare platform request metadata cannot be selectively removed with this repository's tools; they
expire on Cloudflare's fixed retention schedule, no later than seven days. See the official
[WorkOS user API](https://workos.com/docs/reference/authkit/user),
[Cloudflare KV commands](https://developers.cloudflare.com/kv/reference/kv-commands/), and
[R2 object deletion](https://developers.cloudflare.com/r2/objects/delete-objects/).

## License

[Apache-2.0](./LICENSE) © 2026 Tyler van der Hoeven — **except** vendored third-party code in
`src/catalog/vendor/`, which retains its upstream license. Ecosystem skill bodies are not
vendored here at all: this repo commits only their pinned addresses (upstream commit + git blob
hash) and fetches each file from its own upstream, verified, at build and read time. See
[`THIRD-PARTY-NOTICES.md`](./THIRD-PARTY-NOTICES.md).
