# Item 7.3, PR 2: `agents` 0.33.0 with the MCP packages

Branch `np/7.3-deps-agents-mcp` in `/home/tyler/code/raven-wt/np-7.3`, from `origin/main` `0683d266`
(PR 1, #480, merged and deployed as version `35c3b860`). The orchestrator approved this PR's
combined scope on 2026-11-18. Revised after the Fable plan review ([REVIEW.md](REVIEW.md)); the
reconciliation table is at the end.

## Decision

Move the MCP server runtime to `agents` 0.33.0 and the MCP SDK 2.4.0 packages, and import
`createMcpHandler` from upstream's stateless entry, `agents/mcp/server`. The alternative is to stay
on `agents` 0.28.1 and SDK 2.3.1. The upgrade sticks if:
- the gates, the OAuth tests and a live local MCP handshake pass;
- `mcp:surface` is unchanged, or any change is explained and passes the step 8 rule.

Expected cost: USD 0 if the surface hashes hold. One to two hours of executor time.

## Packages

All four are exact pins, because `agents@0.33.0` pins its MCP peers exactly.

| Package | Kind | From | To |
|---|---|---|---|
| `agents` | dep, exact | 0.28.1 | 0.33.0 |
| `@modelcontextprotocol/server` | dep, exact | 2.3.1 | 2.4.0 |
| `@modelcontextprotocol/client` | dev, exact | 2.3.1 | 2.4.0 |
| `@modelcontextprotocol/sdk` | dev, exact | 1.32.1 | 1.32.2 |

Expected lockfile delta (from the reviewer's `--package-lock-only` dry run):

| Kind | Entries |
|---|---|
| Added (1) | `@opentelemetry/api` 1.10.0, from `agents` 0.33.0. It also satisfies `vitest`'s optional peer. |
| Version (5) | `agents`, `@modelcontextprotocol/server`, `/client`, `/core`, `/sdk` |
| Flag only (82) | prod to `devOptional`: the SDK v1 tree (`express`, `hono`, `ajv`, `cors`, …), because `agents` now marks `sdk` an optional peer; and `esbuild`, because `agents` 0.33.0 dropped its `esbuild` dependency |
| Removed | none. 384 to 385 packages, one `workerd` |

`@rolldown/plugin-babel` stays a dependency of `agents`, so the picomatch chain (#473) should not
change.

## Upstream facts that shape the plan

Sources: the `agents` CHANGELOG 0.29.0 to 0.33.0, and the MCP TypeScript SDK v2.4.0 release.

- **0.31.0:** `@modelcontextprotocol/sdk` and `/server` became optional peers. `agents/mcp` still
  imports SDK v1 (`McpAgent`, `WorkerTransport`, the legacy handler), the client, and SDK v2.
  `agents/mcp/server` exports `createMcpHandler` (the stateless handler) and `getMcpAuthContext`,
  and needs only `@modelcontextprotocol/server`.
- **Already true in 0.28.1:** `agents/mcp`'s `createMcpHandler` passes a factory straight to the
  same `createStatelessMcpHandler`, and its JSDoc says "New Stateless servers should use
  `createMcpHandler` from `agents/mcp/server`". Raven passes a factory (`src/server.ts:121`), so the
  import switch should change no behavior. It should drop SDK v1 and the MCP client from the Worker
  bundle; step 2 measures this.
- **0.31.0:** `createMcpHandler` passes oauth-provider 1.x's verified `ctx.auth` to tools as
  `context.http.authInfo`. Raven runs oauth-provider 0.10.4, which sets no `ctx.auth`, so nothing
  changes here. PR 4 (oauth-provider 1.x) takes this up.
- **0.32.0:** the package is marked side-effect free. Bundlers drop unused modules.
- **0.29.0 to 0.33.0:** the rest is Pi harness, `browserTool`, `createAI`, skills loading and
  x402. None of it is imported by Raven.
- **SDK 2.4.0:**
  - `createMcpHandler` sends `Allow: POST` on every 405. Read, not reached: the SDK classifies
    every non-POST request as legacy, and `agents` answers legacy requests with its own
    compatibility handler. Its 405 carries no `Allow` in 0.28.1 and 0.33.0 alike.
  - A `Server` on a per-request transport at a modern revision binds that revision instead of
    answering `-32022` (#3057). Read, not reached: `createMcpHandler` sets the negotiated version
    before it connects, and the legacy leg's transport has no per-request classification.
    Protocol negotiation on Raven's path does not change.
  - `x-mcp-header` on a `number` parameter is rejected. Raven uses none.
  - Root-`$ref` object `outputSchema` is no longer wrapped. Raven advertises no `outputSchema`
    (`mcp:surface` `outputSchemaChars` 0).
  - The Ajv validator uses fast-uri 3.1.8, which rejects `$id`/`$ref` values with invalid schemes.
  - New: the Skills extension (SEP-2640) under `ext/skills`.
- **`cs-010`** (`createAI` drops Anthropic provider options) was re-run on `agents` 0.33.0 on
  2026-11-09 and still reproduces. The TODO item "Move the demo off the deprecated
  `workers-ai-provider`" stays blocked. No re-run here.

## Steps

1. **Baseline, on the untouched branch** (`origin/main`). Record:
   - `node -v` and `npm -v`;
   - the SHA-256 and size of `dist/server.js` after `npm run build`;
   - the `mcp:surface` hashes. Expected: surface `815333b7…bd07`, instructions `67a6bd0b…6c00`.

   Then run the step 6 handshake with the old client set against a baseline `npm run dev` server,
   and save its wire capture.
2. **Import switch first, on 0.28.1.** In `src/server.ts`, change
   `import { createMcpHandler } from "agents/mcp"` to `from "agents/mcp/server"`. In
   `test/server.test.ts` and `test/search-page-size.test.ts`, mock `"agents/mcp/server"` instead
   of `"agents/mcp"`. Then:
   - rebuild and record the bundle size and SHA-256;
   - check the bundle against a positive list:
     - `rg -o '^// node_modules/agents/dist/[^ ]+' dist/server.js | sort -u` shows only
       `mcp/server/index.js` and `handler-stateless-*.js`. Today 29 `agents` modules are bundled,
       including the Agent and Durable Object runtime. `wrangler.jsonc` binds no Durable Object, and
       the smoke lane proves nothing needed them;
     - there are zero matches for `node_modules/@modelcontextprotocol/sdk/`,
       `node_modules/@modelcontextprotocol/client/` and `node_modules/ajv/`, and, after step 3, for
       `node_modules/@opentelemetry`. If `ajv` stays, the server package's `_shims` export resolved
       to Node instead of `workerd`: stop;
   - run `npm run typecheck`, `npm test` and `npm run test:smoke`.

   This isolates the import change from the version change. If any test needs more than the mock
   path change, stop and report.
3. **Install** with one command, because `agents` 0.33.0 requires client 2.4.0 as a peer:
   `npm install -E agents@0.33.0 @modelcontextprotocol/server@2.4.0 @modelcontextprotocol/client@2.4.0 @modelcontextprotocol/sdk@1.32.2`

   - `git diff package.json` must show exactly these four lines. `client` and `sdk` stay in
     `devDependencies`.
   - There must be no `ERESOLVE`. `EBADENGINE` (Node 26) is expected.
   - Compare the lockfile diff with the expected delta above, and stop on anything else.
4. **Read the code that moved.** Diff the installed sources, 0.28.1 against 0.33.0, for
   `agents/dist/mcp/server/*` and the stateless handler chunk it imports. Do the same for
   `@modelcontextprotocol/server`'s handler and transport, 2.3.1 against 2.4.0. Note every behavior
   change Raven touches:
   - the `route` and `allowedOriginHostnames` options;
   - Origin checks;
   - GET, DELETE and OPTIONS handling, and status codes;
   - protocol-version negotiation;
   - JSON or SSE responses;
   - error mapping;
   - auth-context propagation.

   Record them in EXEC.md as a table: change, Raven reach, test that covers it. For the SDK, cite
   `gh api repos/modelcontextprotocol/typescript-sdk/compare/v2.3.1...v2.4.0`; a diff of the
   built `dist` is noisy.
5. **Gates, bare, on the final tree:**
   - `npm run typecheck`, `npm test`, `npm run build`, `npm run test:smoke` and
     `npm run secrets:scan -- --tree`. The OAuth flow tests (`test/auth*.test.ts`,
     `test/smoke/auth-redirects.test.ts`) and the modern client smoke
     (`test/smoke/mcp-modern-client.test.ts`) are part of these.
   - `npm ls workerd` shows one `workerd`.
   - `npm audit`: a paired comparison with `origin/main`'s lockfile, run on the same day.
   - `npm run -s mcp:surface -- --json`: both hashes.
   - The new bundle SHA-256 and size, against the step 1 and step 2 sizes.
6. **Live MCP handshake against local dev, free, no model.**
   - **Server.** Use `npm run dev`, the manual-testing server. `dev:eval` refuses a dirty tree, and
     without the `--define` both servers carry the same `SERVER_INFO`. Before each start, run
     `lsof -nP -iTCP -sTCP:LISTEN -a -c workerd`, and start only if nothing listens. Start it as an
     `hc` child in this worktree. It needs the copied `.dev.vars`; do not print it. Read the bound
     URL from its terminal. Use the loopback dev access that `allowDevUnauthenticated` allows; if it
     needs a key, use `npm run mcp-key` and never print the key. Kill the server when done.
   - **Clients.** Pin them outside the worktree install, under `tmp/handshake/`, which is ignored.
     Each set has its own `package.json`:
     - `old/`: `@modelcontextprotocol/client@2.3.1` and `@modelcontextprotocol/sdk@1.32.1`;
     - `new/`: `@modelcontextprotocol/client@2.4.0` and `@modelcontextprotocol/sdk@1.32.2`.

     `research/audits/2026-11-06-remaining-sweep/live-host-check.mjs` is a base for the script.
   - **Calls, for each set.**
     - **Two generations.** Pin the v2 client to the modern era
       (`versionNegotiation: { mode: { pin: "2026-07-28" } }`), and assert that the `server/discover`
       probe answers below 300. The SDK v1 `Client` uses the 2025 lifecycle.
     - **On each:** the handshake, `tools/list`, one `search` call (`"stellar asset contract"`) and
       one keyless `execute` call (`return await codemode.search("stellar docs")`).
     - **Raw `GET /mcp`.** Expect 405 with `-32000 Method not allowed.` and no `Allow` header on both
       servers. A new `Allow` header is an unexplained change. The Origin checks are already in
       `test/smoke/server.test.ts:244-264`; do not repeat them.
   - **Capture the wire, not the return values.** Pass a `fetch` wrapper to each transport (the
     smoke test's `spyFetch` pattern). For each exchange, save the method, the `mcp-method` and
     `mcp-protocol-version` request headers, the status, the response `content-type` and the body.
   - **Runs:**
     - the old set against the baseline server (step 1);
     - the old set against the upgraded server. **This pair is the diff the stop rule reads.**
     - the new set against the upgraded server, to show that new clients work.
   - **Diff.** Each must match exactly:
     - the `initialize` and `server/discover` results: instructions, capabilities and `serverInfo`;
     - `tools/list`;
     - the `search` results;
     - the `execute` results, apart from timing fields.

     Record every difference with its upstream reason.
   - **Live suites.** Then run `node test/live/run-live-execute.mjs --base-url <url>` and
     `node test/live/run-live-spec-search.mjs --base-url <url>` against the upgraded server. If one
     needs a paid call or a missing key, skip it and say why in EXEC.md.

7. **Picomatch (#473).** Record whether `agents` 0.33.0 changes the picomatch path. If the chain is
   the same, update the "Reach on …" line of the TODO picomatch item only when the package list
   changed.
8. **Model-facing rule (pre-registered).** `mcp:surface` runs in Node over `InMemoryTransport`, so
   the step 6 old-client diff carries the rule for the Worker and both eras.
   - If both `mcp:surface` hashes are unchanged and the step 6 old-client diff shows `initialize`
     or `server/discover`, `tools/list` and the tool results unchanged, the change is not
     model-facing. There is no spot check.
   - If anything model-facing changes, stop. The lead then writes a spot-check rule (at most 10
     Sonnet 5.5 answers, tuning rows only, blind judge) into this plan and has it reviewed before
     any answer.
9. **Records.**
   - Write `EXEC.md` with the steps, the behavior table, the lockfile list, the bundle sizes, the
     handshake diff and the gates.
   - In `.agents/TODO.md` "Move the demo off the deprecated `workers-ai-provider`":
     - note that `agents` is now 0.33.0, so the version precondition is met;
     - note that `cs-010` still blocks: it was re-run on 0.33.0 on 2026-11-09;
     - rewrite the sentence "The `agents` upgrade moves the MCP server runtime, so it needs …" to say
       what the demo migration itself still needs: `test:smoke`, the single-`workerd` check and a
       Playground run of every demo model.

     Keep the rest. In EXEC.md, say why PR 2 has no Playground run: nothing under `src/demo`
     imports `agents` (the only `src` import is `src/server.ts:11`), and the smoke lane runs the
     demo tests.
   - Do not touch `.agents/TODO.md` beyond that and step 7.
10. **Commit** on `np/7.3-deps-agents-mcp` with the normal hooks. Make one commit for step 2 and one
    for the rest:
    - `Import createMcpHandler from agents/mcp/server (round item 7.3)`
    - `agents 0.33.0 with MCP server/client 2.4.0 and SDK 1.32.2 (round item 7.3)`
11. **Independent diff review** (the lead runs it after the executor): Codex `gpt-6-astra`, high
    effort, as a security read of the MCP transport path. The lead reconciles its findings in EXEC.md.

## Stop rule

Stop and report to the lead, changing nothing further, if any of these happens:
- a gate fails, and the fix is more than a mock path or a one-line type adjustment;
- npm prints an `ERESOLVE` peer override;
- `tools/list`, a tool result or an `mcp:surface` hash changes;
- the handshake on either client fails;
- the Origin check or a status code changes without an upstream reason we accept;
- `npm audit` gains a finding against the paired baseline.

If the import switch (step 2) works but the version bump fails, the lead decides whether to ship
step 2 alone.

## Risks

- **This is the MCP transport for every client.** The plan review read the transport changes:
  #3057 and the `Allow` change are not reached, and the Origin, Host, CORS and OPTIONS code is
  byte-identical. The step 6 wire diff with unchanged old clients is the free proof. Real Claude,
  ChatGPT and Cursor connections run only in production, after the deploy.
- **The import switch drops 27 `agents` modules** and their module-level startup code: the Agent
  and Durable Object runtime, email, scheduler and observability, plus SDK v1 and `ajv`. Raven binds
  no Durable Object. The smoke lane runs the assembled Worker, and step 6 runs the dev Worker.
- **New dependency.** `@opentelemetry/api` enters the tree. It is bundled only if imported.

## Proposals, not in this PR

1. **Publish Raven's pinned ecosystem skills through the MCP Skills extension** (SEP-2640, SDK 2.4).
   - It would give clients native skill listing and reading beside `search` and `execute`.
   - `SkillsExtension.attach` is experimental. A new client-visible surface falls under ADR-0003:
     the manifest is the exposed surface.
   - It needs an owner decision, a design study and a measured A/B. Not started here.

## Needs from the orchestrator

- **Before the deploy:** the AGENTS.md pre-check. Read the ledger of any active eval round that
  holds deploys.
- **Merge, then deploy.** Worker bytes change.
- **After the deploy:**
  - run `research/audits/2026-11-06-remaining-sweep/live-host-check.mjs`. It is free, uses no
    model, and covers both wire eras on all three hosts;
  - check a connector search.
- **Rollback:** to version `35c3b860` if either check fails, or if a real client reports a
  connection failure.

## Review reconciliation

| Finding | Disposition |
|---|---|
| 1 Install commands fail with `ERESOLVE` | Adopted: one combined command; expected lockfile delta listed |
| 2 `dev:eval` refuses a dirty tree | Adopted: `npm run dev`, with the `lsof` pre-check |
| 3 Old client on the old server against new client on the new server | Adopted: pinned old and new client sets; the old set runs on both servers; modern era pinned |
| 4 `Allow` and #3057 not reached | Adopted: Upstream facts, Risks and the expected 405 shape |
| 5 Capture the wire; Origin checks are duplicates | Adopted: wire capture; Origin checks dropped, `GET /mcp` kept |
| 6 The import switch drops much more | Adopted: positive-list bundle check, `ajv` stop |
| 7 The TODO names a Playground run | Adopted: the sentence is rewritten for the demo migration; EXEC.md states why there is no run here |
| 8 Tighten step 8; pre-deploy and rollback | Adopted: exact `initialize` match; Needs section |
| 9 `test/live/` | Adopted: both live suites in step 6 |
