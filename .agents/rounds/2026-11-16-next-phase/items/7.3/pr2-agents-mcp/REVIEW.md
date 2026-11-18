# Review: item 7.3 PR 2 plan (`agents` 0.33.0 with the MCP packages)

Reviewer: Claude Fable 5.2 (tier: Claude Fable), high effort, read-only. 2026-11-18.
Reviewed: `PLAN.md` in this folder against the worktree at `0683d266` plus the target packages.

How I checked. Nothing in the worktree changed except this file. I unpacked `agents@0.33.0`,
`@modelcontextprotocol/server|core|client@2.4.0` and `@modelcontextprotocol/sdk@1.32.1|1.32.2` with
`npm pack` in my scratchpad, read the `agents` CHANGELOG 0.29.0 to 0.33.0 and the SDK 2.4.0 and
1.32.2 release notes, and read the SDK source diff with
`gh api repos/modelcontextprotocol/typescript-sdk/compare/v2.3.1...v2.4.0`. For finding 1 I ran
`npm install --package-lock-only --ignore-scripts --no-audit` on a scratch copy of `package.json`
and `package-lock.json` (Node 26.13.0, npm 11.20.0); no `node_modules` was written anywhere. I ran
`npm run -s mcp:surface -- --json` once on the untouched tree. No dev server, no model call.

## Findings

### 1. Blocking: step 3's install commands fail with `ERESOLVE`

`npm install -E agents@0.33.0 @modelcontextprotocol/server@2.4.0` stops with:

```
npm error ERESOLVE unable to resolve dependency tree
npm error Found: @modelcontextprotocol/client@2.3.1 ... dev @modelcontextprotocol/client@"2.3.1" from the root project
npm error Could not resolve dependency: peer @modelcontextprotocol/client@"2.4.0" from agents@0.33.0
```

`@modelcontextprotocol/client` is still a required peer of `agents` 0.33.0 (only `sdk` and `server`
became optional), and the root pins it exactly. The reverse order should fail the same way, because
`agents` 0.28.1 pins client 2.3.1 as a required peer (not run). As written the step trips the
plan's own stop rule.

Fix: one command, which I ran on the scratch copy. It resolves with no `ERESOLVE`, and npm keeps
`client` and `sdk` in `devDependencies`:

```
npm install -E agents@0.33.0 @modelcontextprotocol/server@2.4.0 @modelcontextprotocol/client@2.4.0 @modelcontextprotocol/sdk@1.32.2
```

Check `git diff package.json` shows exactly those four lines. The `EBADENGINE` warning (Node 26 on
this box, `engines` says 24) is expected and is not a peer warning.

Expected lockfile delta from that dry run, to compare against in step 3 (stop on anything else):

| Kind | Entries |
|---|---|
| Added (1) | `@opentelemetry/api` 1.10.0, from `agents` 0.33.0 |
| Version (5) | `agents`, `@modelcontextprotocol/server`, `/client`, `/core`, `/sdk` |
| Flag only (82) | prod to `devOptional`: the SDK v1 tree (`express`, `hono`, `ajv`, `cors`, …) because `agents` now marks `sdk` an optional peer, and `esbuild` because `agents` 0.33.0 dropped its `esbuild` dependency |
| Removed | none. 384 to 385 packages, one `workerd` |

Two corrections to the plan's "Packages" paragraph: `@modelcontextprotocol/core` is not new (2.3.1
is installed today), and the 82 flag flips are the bulk of the lockfile diff. `@opentelemetry/api`
also satisfies `vitest`'s optional peer (`^1.9.0`), so it is not only "bundled if imported"; the
test lanes now resolve it. `@rolldown/plugin-babel` stays a dependency of `agents` 0.33.0, so the
picomatch chain in step 7 is unchanged.

### 2. Blocking: step 6 cannot start `npm run dev:eval` on either tree

`scripts/run-eval-server.mjs:18-21` throws "eval server worktree is dirty" when
`git status --porcelain --untracked-files=all` prints anything. The baseline tree is dirty now
(`README.md` modified, this folder untracked), and the upgraded run in step 6 comes before the
commits in step 10.

Fix: use `npm run dev` for both runs. AGENTS.md names it the manual-testing server, and this is a
handshake, not an eval lane. It also removes a diff: without the `--define`, `SERVER_INFO` has no
`sourceRevision` (`src/server.ts:41-45`), so the `initialize` result should be byte-identical on
both sides. The alternative is to commit before each run and accept a `sourceRevision` difference.

Add the "no second Wrangler" pre-check before each start:
`lsof -nP -iTCP -sTCP:LISTEN -a -c workerd`. Nothing was listening when I checked.

### 3. Blocking: the handshake compares old client on old server with new client on new server

The scratch script imports the clients from the worktree's `node_modules`, which step 3 upgrades.
So the baseline transcript is client 2.3.1 and SDK 1.32.1 against the old server, and the upgraded
transcript is client 2.4.0 and SDK 1.32.2 against the new server. The production case, clients that
did not upgrade talking to the new server, is never run, and any transcript difference could come
from either side (client 2.4.0 changes `client.ts` by 79 lines).

Fix: give the script its own pinned clients outside the worktree install, for example
`tmp/handshake/old/` (`@modelcontextprotocol/client@2.3.1`, `@modelcontextprotocol/sdk@1.32.1`) and
`tmp/handshake/new/` (2.4.0, 1.32.2), each with its own `package.json`. `tmp/` is ignored
(`.gitignore:45`). Run the old set against both servers; that pair is the diff the stop rule reads.
Run the new set against the upgraded server only.

Also pin the v2 client to the modern era, as `test/smoke/mcp-modern-client.test.ts:40-43` does
(`versionNegotiation: { mode: { pin: "2026-07-28" } }`), and assert the `server/discover` probe
answers below 300. A v2 client does not send `initialize` on the modern era, and an unpinned one
can fall back to the 2025 lifecycle without an error, which would make both "generations" test the
same leg of the handler. `research/audits/2026-11-06-remaining-sweep/live-host-check.mjs` already
runs both generations this way and is a good base for the script.

### 4. Non-blocking: two upstream facts in the plan do not reach Raven's path

- **`Allow: POST` on 405.** The SDK classifies every non-POST request as legacy
  (`classifyInboundRequest`, reason `http-method`). The `agents` wrapper sends legacy requests to
  its own `createLegacyCompatibilityRequestHandler`, whose 405 carries no `Allow`, in 0.28.1 and
  0.33.0 alike. So the expectation for step 6's raw check is: `GET /mcp` answers 405 with
  `-32000 Method not allowed.` and no `Allow` header on both servers. A new `Allow` header would
  be an unexplained change, not the SDK fix arriving.
- **#3057 (revision binding at `connect`).** `createMcpHandler` calls
  `setNegotiatedProtocolVersion` before it connects the per-request transport, so the new branch's
  `!_servedModernEra()` guard is false there. The legacy leg uses
  `WebStandardStreamableHTTPServerTransport`, for which `perRequestClassificationOf` returns
  `undefined`. Protocol negotiation on Raven's path is unchanged. The Risks section can say "read,
  not reached" instead of "could break some clients".

Fix: correct the two bullets under "Upstream facts" and the first risk, and put the expected 405
shape in step 6.

### 5. Non-blocking: capture the wire, not the client return values

Step 4 lists status codes, JSON or SSE responses, and protocol negotiation, but client-library
return values hide all three. Fix: pass a `fetch` wrapper to both transports (the smoke test's
`spyFetch`, `test/smoke/mcp-modern-client.test.ts:30-36`, is the pattern) and save per exchange the
method, the `mcp-method` and `mcp-protocol-version` request headers, the status, the response
`content-type` and the body. Diff those.

The two Origin checks in step 6 duplicate `test/smoke/server.test.ts:244-264`, which runs three
allowed Origins, a foreign Origin (403) and no Origin in the assembled Worker. Drop them or keep
them; the smoke test guards the behavior either way. Keep the `GET /mcp` check: no gate covers it,
and SDK v1 clients rely on that 405 when they try to open the standalone SSE stream.

### 6. Non-blocking: the import switch removes much more than SDK v1 and the client

The switch is behavior-neutral for the handler: `agents/mcp`'s `createMcpHandler`
(`node_modules/agents/dist/mcp/index.js:1264-1265`) hands a function straight to
`createStatelessMcpHandler`, and `agents/mcp/server` re-exports that same function from the same
chunk. But today's `dist/server.js` (9.2 MB) holds 29 `agents` modules, including the Agent and
Durable Object runtime (`src-CQxJFv4l.js`), email, scheduler and observability, plus `ajv` (126
path markers) through SDK v1. All of that leaves, with its module-level startup code.
`wrangler.jsonc` binds no Durable Object, so I see nothing Raven needs from it; the smoke lane is
the proof.

Fix: make step 2's bundle check a positive list rather than two absences:

- `rg -o '^// node_modules/agents/dist/[^ ]+' dist/server.js | sort -u` shows only
  `mcp/server/index.js` and `handler-stateless-*.js`;
- zero matches for `node_modules/@modelcontextprotocol/sdk/`,
  `node_modules/@modelcontextprotocol/client/`, `node_modules/ajv/` and, after step 3,
  `node_modules/@opentelemetry`.

If `ajv` stays, the server package's `_shims` export resolved to Node instead of `workerd`; stop.

### 7. Non-blocking: the TODO item names a gate the plan skips

`.agents/TODO.md`, "Move the demo off the deprecated `workers-ai-provider`", says: "The `agents`
upgrade moves the MCP server runtime, so it needs `npm run test:smoke`, the single-`workerd` check,
and a Playground run of every demo model." The plan runs the first two and not the third, and
step 9 leaves the sentence in place, where it becomes false once this PR lands.

Fix: in step 9, rewrite that sentence to describe what the demo migration still needs. In EXEC.md,
state why PR 2 has no Playground run: nothing under `src/demo` imports `agents` (the only import
in `src` is `src/server.ts:11`), and the smoke lane runs the demo tests. If the lead reads the
sentence as binding on this PR, the Playground run is a model call and needs its own
authorization.

### 8. Non-blocking: tighten the step 8 rule and the deploy hand-off

The rule is sound once findings 2, 3 and 5 are in. `mcp:surface` runs in Node over
`InMemoryTransport` (`scripts/report-mcp-surface.mjs:13-17`), one era and the Node validator, so
the step 6 diff is what carries the rule for the Worker and for both eras.

- With `npm run dev`, require the `initialize` and `server/discover` results (instructions,
  capabilities, `serverInfo`) to match exactly. Raven's `SERVER_INFO` holds no SDK version, so
  there is no expected difference to allow for.
- Add the AGENTS.md pre-deploy check to "Needs from the orchestrator": read the ledger of any
  active eval round that holds deploys.
- For the post-deploy check, the two-generation script in
  `research/audits/2026-11-06-remaining-sweep/live-host-check.mjs` covers both wire eras on all
  three hosts, free and with no model. Name the rollback target (`35c3b860`) and its trigger there
  too, since real client connections are only seen in production.

### 9. Non-blocking: `test/live/` is not in the plan

AGENTS.md asks for a live check through `test/live/` on substantial work. `test/README.md` gives
`node test/live/run-live-execute.mjs --base-url http://localhost:<port>` and
`run-live-spec-search.mjs`. Fix: run both against the upgraded dev server in step 6, or say in
EXEC.md why not. I did not check which upstream keys they need.

## Confirmed, no change needed

- **`agents` handler, 0.28.1 to 0.33.0.** The stateless handler chunk differs by one thing:
  `getResourceAuthInfo(ctx)` reads `ctx.auth` when the verified-context symbol is absent. The
  oauth-provider 0.10.4 build assigns only `ctx.props` (two sites), and `ExecutionContext` has no
  `auth` member, so the plan's "nothing changes here" holds. Route, Host and Origin checks, CORS,
  OPTIONS and the legacy handler are byte-identical. `src/mcp/tools.ts` reads no `authInfo`.
- **SDK server, 2.3.1 to 2.4.0.** Five files change under `packages/server/src/server/`, and two
  with runtime effect under `core-internal/src` (`mcpParamHeaders.ts`, `standardSchema.ts`); the
  rest is the new Skills extension. Origin and Host validation and the streamable HTTP transport are
  untouched. Schema emission changes only for `outputSchema`; Raven registers two tools, no
  `outputSchema`, no `x-mcp-header`, no resources. Step 4 can cite the compare command above; a
  diff of the built `dist` is noisy because the chunk layout changed.
- **0.33.0's handler chunk** imports only `node:async_hooks` and `@modelcontextprotocol/server`,
  so the side-effect-free marking has nothing left to drop on the `agents/mcp/server` path.
- **`@modelcontextprotocol/sdk` must stay a devDependency:** `eval/qa/plain-operation-harness.mjs`
  imports the v1 server, and `test/plain-operation-harness.test.mjs` covers it in `npm test`. No
  extra eval gate is needed for the 1.32.2 bump.
- **Baseline hashes** match the plan: surface `815333b7…bd07`, instructions `67a6bd0b…6c00`.
- **No live document** names the old versions or `agents/mcp`; only `src/server.ts:11` and the two
  test mocks change.
- **Step 11's reviewer** (`gpt-6-astra`, Codex frontier, high) matches the roster's tier for a
  security review and differs from author and orchestrator.

## Verdict

Not ready to execute as written: fix findings 1 to 3 (install command, dev server launcher, pinned
clients in the handshake) first; the upstream read itself supports the upgrade, with no transport
change reaching Raven's path.
