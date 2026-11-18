# Execution: item 7.3 PR 2 (`agents` 0.33.0 with the MCP packages)

Executor: Claude Sonnet 5.5, 2026-11-18. Worktree `/home/tyler/code/raven-wt/np-7.3`, branch
`np/7.3-deps-agents-mcp`, from `origin/main` `0683d266`. Steps 1 to 10 of [PLAN.md](PLAN.md) done; step 11
(independent review) is the lead's. No stop condition fired. Nothing pushed, no PR, no merge, no deploy,
no model call, no paid call.

Node `v26.13.0`, npm `11.20.0` (the repo's `engines` says Node 24, so `EBADENGINE` printed, as
expected).

## Result in one paragraph

The import switch and the version bump are both behavior-neutral on the wire. `mcp:surface --json` is
byte-identical before and after. Old clients (SDK v1 1.32.1 and client 2.3.1) see the same handshake,
`tools/list`, `search` and `execute` results, status codes, content types and headers on the upgraded
dev server as on the baseline dev server. The only difference in the whole capture is the per-run
artifact id and `expiresAt` inside `execute` text, which differ on every run. All gates pass. Step 8's
rule says the change is not model-facing, so there is no spot check.

## What I did, by step

1. **Baseline** on `origin/main`: `dist/server.js` 9,219,833 bytes, SHA-256
   `365baa2a7ae3c6b9f40253a570104cc016613467b3edb94aa9c54dcfb5142e2a`. `mcp:surface` surface
   `815333b7…bd07`, instructions `67a6bd0b…6c00`, as expected. 29 `agents` modules bundled. Baseline
   handshake captured (below). The baseline `npm run build` ran through `| tail`; the output file and the
   `--dry-run: exiting now` line show it succeeded.
2. **Import switch on 0.28.1.** `src/server.ts:11`, and the two `vi.mock` paths in
   `test/server.test.ts:107` and `test/search-page-size.test.ts:30`. Nothing else needed. `typecheck`,
   `npm test` (173 files passed, 5 skipped; 4042 tests passed, 3 expected fail, 8 skipped) and
   `test:smoke` (9 files, 149 tests) pass. Commit `2aa1ef83`.
   - Bundle: 6,994,009 bytes, SHA-256 `66a78dd1b6f072c0d8eca4d04e508da50efe3d1e1715be1872751d0fc73ceb44`
     (9.22 MB to 6.99 MB, 2.2 MB smaller).
   - Positive list: the only `agents` module marker is `handler-stateless-*.js`. There is no
     `mcp/server/index.js` marker because that file is a two-line re-export
     (`export { createStatelessMcpHandler as createMcpHandler, getMcpAuthContext }`), so rolldown hoists
     it. Not a deviation in substance. Zero matches for `node_modules/@modelcontextprotocol/sdk/`,
     `…/client/`, `node_modules/ajv/` and `node_modules/@opentelemetry`. `@modelcontextprotocol` markers:
     `core` 1, `server` 7. So `_shims` resolved to `workerd`, not Node.
3. **Install**, the one command from the plan. No `ERESOLVE`. `git diff package.json` is exactly the four
   lines (`agents` 0.33.0, `server` 2.4.0, `client` 2.4.0, `sdk` 1.32.2), with `client` and `sdk` still in
   `devDependencies`. The command's output went through `| tail`; I read its exit from `PIPESTATUS`
   (0).
4. **Read the code that moved.** Table below.
5. **Gates**, final tree, run bare: see "Gates".
6. **Handshake**: see "Handshake wire capture".
7. **Picomatch (#473).** Unchanged. `npm ls picomatch` shows one `picomatch@4.0.7`, reached through
   `vitest`, `tinyglobby`, `fdir` (tests) and `agents` through `vite` and `@rolldown/plugin-babel` (build
   tooling). That is the package list the TODO item already names. The new bundle has no picomatch
   code. `.agents/TODO.md` picomatch item left untouched.
8. **Model-facing rule.** Both `mcp:surface` hashes are unchanged, and the old-client diff shows
   `initialize`, `server/discover`, `tools/list` and the tool results unchanged. Not model-facing. No spot
   check.
9. **Records**: this file; the demo item in `.agents/TODO.md` (below).
10. **Commits**: `2aa1ef83` (step 2: import switch), then the branch tip (the version bump, the TODO edit and
    this plan folder). `git log` on `np/7.3-deps-agents-mcp` shows both.

## Behavior table (step 4)

Sources read: `agents` 0.28.1 against 0.33.0 (`dist/mcp/server/index.js`, which is a two-line re-export,
and the chunk it imports, `handler-stateless-Bly_nSH3.js` against `handler-stateless-B5hU3dxK.js`), and
`gh api repos/modelcontextprotocol/typescript-sdk/compare/v2.3.1...v2.4.0` for the SDK, restricted to
`packages/server`, `packages/core*` and `packages/client` sources.

| Change | Raven reach | Covered by |
|---|---|---|
| `agents` stateless handler: new `getResourceAuthInfo(ctx)`, used when the verified-context symbol is absent; reads `ctx.auth` (oauth-provider 1.x shape) and passes `authInfo` to tools. This is the only diff in the chunk. | None. `@cloudflare/workers-oauth-provider` 0.10.4 assigns only `ctx.props` (`dist` lines 2704, 2738), never `ctx.auth`, so the function returns `undefined` and the handler falls back to `ctx.props` as before. `rg authInfo src` finds no reader. PR 4 takes this up. | `test/auth.test.ts`, `test/smoke/auth-redirects.test.ts`, `test/smoke/mcp-modern-client.test.ts` |
| `route`, `allowedOriginHostnames`, Origin and Host checks, CORS, OPTIONS, legacy compatibility handler, JSON/SSE choice, error mapping in the `agents` chunk | Byte-identical in the chunk diff. | `test/smoke/server.test.ts` (allowed Origins, foreign Origin 403, no Origin), plus the wire capture |
| SDK `createMcpHandler`: `Allow: POST` on its own 405s (`createMcpHandler.ts`) | Not reached. The SDK classifies every non-POST as legacy and `agents` answers it with its own handler. Observed: raw `GET /mcp` is 405, `-32000 Method not allowed.`, `Allow` null on baseline and upgraded. | wire capture (`rawGet`) |
| SDK `createMcpHandler`: `x-mcp-header` scan now also checks a tool invalid only for a `number` declaration (`scan.declarations !== undefined`) | None. Raven's two tools declare no `x-mcp-header`; declarations are empty. | `mcp:surface` hash; `tools/list` wire diff |
| SDK `Server.connect`: binds the modern revision from a `PerRequestHTTPServerTransport` classification (#3057, `perRequestTransport.ts`, `server.ts`) | Not reached. `createMcpHandler` sets the negotiated version before it connects, so the `!_servedModernEra()` guard is false; the legacy leg's transport has no per-request classification. Observed: `server/discover` 200 with `supportedVersions ["2026-07-28"]`, `initialize` negotiates `2025-11-25`, both unchanged. | `test/smoke/mcp-modern-client.test.ts`; wire capture, both eras |
| `core-internal` `mcpParamHeaders.ts`: `number` is no longer a permitted `x-mcp-header` type | None (no `x-mcp-header`). | `mcp:surface` hash |
| `core-internal` `standardSchema.ts`: a root `$ref` to an object `$defs` entry is no longer wrapped for `outputSchema` | None. Raven advertises no `outputSchema` (`outputSchemaChars` 0); `tools/list` has no `outputSchema` on the wire. | `mcp:surface` hash; `tools/list` wire diff |
| `mcp.ts` resource `title` update; `serverEventBus.ts` forwarded notification params | None. Raven registers no resources and no subscriptions. | none needed |
| `fast-uri` rejects invalid `$id`/`$ref` schemes in the validator | None. The Worker bundle has no `ajv`; Node `mcp:surface` validates unchanged. | `mcp:surface` |
| New Skills extension (`ext/skills`), client `auth.ts`/`client.ts` changes | Not imported by Raven's server. Client changes only affect the test clients, and the new-client run below covers them. | new-client wire run |

## Lockfile (step 3)

Matches the plan's expected delta exactly (compared programmatically with the pre-install lockfile).

| Kind | Entries |
|---|---|
| Added (1) | `node_modules/@opentelemetry/api` 1.10.0 |
| Version (5) | `agents` 0.28.1 to 0.33.0; `@modelcontextprotocol/server`, `/client`, `/core` 2.3.1 to 2.4.0; `@modelcontextprotocol/sdk` 1.32.1 to 1.32.2 |
| Flag only (82) | prod to `devOptional`, all 82 with the same single change (`devOptional: true`). Includes `node_modules/esbuild` 0.28.1; `wrangler/node_modules/esbuild` 0.28.2 stays `dev`. |
| Removed | none. 385 to 386 lockfile keys including the root `""` entry, which is the plan's 384 to 385 packages |

`npm ls workerd`: one `workerd@1.20261023.1`, deduped under `miniflare` and `wrangler`.

## Gates (step 5, final tree, bare)

| Gate | Result |
|---|---|
| `npm run typecheck` | pass |
| `npm test` | pass: 173 files passed, 5 skipped; 4042 tests passed, 3 expected fail, 8 skipped. Same counts as step 2. |
| `npm run build` | pass. `dist/server.js` 6,997,380 bytes, SHA-256 `01822c7b7277fc85874b506a4b3f2ed430484ada40d89b7671cea24b39b476f0` |
| `npm run test:smoke` | pass: 9 files, 149 tests (run twice; the second run bare after the first went through a filter pipe) |
| `npm run secrets:scan -- --tree` | clean |
| `npm ls workerd` | one `workerd` |
| `npm audit`, paired | same day, `origin/main` lockfile (in a scratch dir) against the new lockfile, both `--package-lock-only`: 8 high / 0 other on both sides, identical vulnerable-package set, no advisory only on the new side. (Exit 1 on both, from the same 8 findings.) |
| `npm run -s mcp:surface -- --json` | identical, whole JSON byte for byte (`cmp`). Surface `815333b74671dec3a7919333a9960392fd9a39d12efbcaa148b447995de2bd07`, instructions `67a6bd0b57da385b412a5dc47dc3de3b8ae65f4b39e3a862cb53deec659c6c00`, `outputSchemaChars` 0 |

Bundle sizes: baseline 9,219,833 → step 2 6,994,009 → final 6,997,380 (the version bump adds 3,371
bytes). `agents` modules bundled: 29 → 1 → 1.
Final positive list: `agents/dist/handler-stateless-B5hU3dxK.js` only; `@modelcontextprotocol`
`core` 2, `server` 8; zero `sdk`, `client`, `ajv`, `@opentelemetry`, `picomatch`.

## Handshake wire capture (step 6)

Method. `npm run dev` (not `dev:eval`) as an `hc` child, one at a time, `lsof` pre-check before each
start (nothing listening each time), loopback dev access (no key). Killed and removed after each run.
Clients pinned outside the worktree install: `tmp/handshake/old` (client 2.3.1, SDK 1.32.1) and
`tmp/handshake/new` (client 2.4.0, SDK 1.32.2). The script (`tmp/handshake/capture.mjs`, git-ignored,
not committed) buffers every fetch exchange and saves HTTP method, `mcp-method`, `mcp-protocol-version`,
status, `content-type`, `Allow` and the parsed body. Per set it runs two generations: the SDK v1 `Client`
(2025 lifecycle) and the v2 `Client` pinned to `2026-07-28` (asserting the `server/discover` probe is
below 300; it was 200 in every run). On each: handshake, `tools/list`, `search` ("stellar asset
contract"), keyless `execute` (`return await codemode.search("stellar docs")`), and then a raw
`GET /mcp`.

Runs:

| Run | Server | Client set |
|---|---|---|
| A | baseline (`origin/main`, a temporary detached worktree, `npm ci`, then removed) | old |
| B | upgraded (this branch) | old |
| C | upgraded | new |

**A against B (the diff the stop rule reads): no difference.** Whole capture equal after masking only
the artifact id and `expiresAt` inside the `execute` text. Per exchange, both eras:

```
legacy-sdk-v1 (2025-11-25), identical in A, B and C
  POST  initialize        200 text/event-stream   (protocolVersion 2025-11-25, serverInfo stellar-raven-codemode 0.1.0, tools.listChanged)
  POST  (initialized)     202
  GET   standalone SSE    405 application/json    {"jsonrpc":"2.0","error":{"code":-32000,"message":"Method not allowed."},"id":null}
  POST  tools/list        200 text/event-stream
  POST  tools/call search 200 text/event-stream
  POST  tools/call execute 200 text/event-stream
v2 pinned 2026-07-28, identical in A, B and C
  POST  server/discover   200 application/json   (supportedVersions ["2026-07-28"], capabilities tools.listChanged, instructions)
  POST  tools/list        200 application/json
  POST  tools/call search 200 application/json
  POST  tools/call execute 200 application/json
raw GET /mcp: 405 application/json, -32000 "Method not allowed.", Allow absent, in A, B and C
```

Checked individually, unmasked, A against B in both eras: `initialize` / `server/discover` body,
`tools/list` and `search` results are string-equal. `serverInfo` is `{"name":"stellar-raven-codemode",
"version":"0.1.0"}` with no `sourceRevision`, as `npm run dev` should give.

**B against C (new clients on the upgraded server): no difference**, same masks. New clients work in both
eras.

The only raw (unmasked) differences between runs are the two `execute` texts' `artifact: id=<uuid>`
and `expiresAt=<timestamp>`; their `sha256` and `bytes` are equal. No timing field differed in any result.

No `Allow` header appeared (not the SDK's `Allow: POST`), so there is no unexplained change.

**Live suites** (`node test/live/run-live-execute.mjs` and `run-live-spec-search.mjs`, against the dev
server, free upstream reads with the local credentials, no model). They fail on both servers, with the
same cases failing, so the upgrade did not cause it: execute `initialize carries instructions (envelope
contract present: false)` is printed, the lines marked FAIL are cases 6 and 8 (`unparseable case-6 result`;
`FAIL: isError` with `Cannot read properties of undefined (reading 'slice')`), and the suite reports
3 checks failed; spec-search case 4
(`oversized result (whole spec) truncated host-side with the footer`) fails, 1 case failed. I ran each
suite on the baseline server and on the upgraded one and diffed the `===`/`PASS`/`FAIL` lines
(timings masked): identical. I did not investigate the cause; it looks like the suites lag the current
code. Flagging for the lead as a pre-existing finding, not for this PR.

## Why there is no Playground run

Nothing under `src/demo` imports `agents`. The only `agents` import in `src` is `src/server.ts:11`
(`rg` over `src` and `test`: that line and the two `vi.mock` paths), and `test:smoke` runs the demo
tests (`test/smoke/demo-*.test.ts`) in the assembled Worker. A Playground run is a model call and the
plan does not authorize one.

## `.agents/TODO.md` (step 9)

Only the "Move the demo off the deprecated `workers-ai-provider`" item changed:
- the version precondition is met (`agents` is 0.33.0);
- `cs-010` still blocks, re-run on 0.33.0 on 2026-11-09 and still reproducing;
- the "The `agents` upgrade moves the MCP server runtime, so it needs …" sentence now reads "The migration
  moves the demo model path, so it needs `npm run test:smoke`, the single-`workerd` check, and a
  Playground run of every demo model."

The picomatch item is unchanged (step 7).

## Deviations and notes

1. **Capture script bugs, fixed before any result was used.** My first two versions of the spy lost the
   response bodies (`<unreadable>`), then misread a JSON body as SSE because its text contained
   `data:`. I fixed the spy to buffer bodies and to parse SSE only on an `event-stream` content type,
   re-ran the old and new sets on the upgraded server, and re-ran the baseline. The baseline run I first
   took used the broken spy, so it was recaptured on a baseline server. All results above come from the
   fixed script.
2. **Baseline server.** The baseline needed the old packages, which this worktree no longer had after
   step 3. I created a temporary detached worktree at `tmp/baseline-wt` from `origin/main`, ran `npm ci`,
   copied `.dev.vars` into it (mode 600, never printed), ran `npm run dev` there as my `hc` child, then
   removed the server terminal and the worktree (`git worktree remove --force` and `prune`).
   `git worktree list` is back to three entries. The first baseline run, before step 2, was in this
   worktree.
3. **Pipes.** Three commands were run through a pipe despite the "bare" rule: the baseline `npm run
   build` (`| tail`), the step 3 `npm install` (`| tail`, exit read from `PIPESTATUS`), and one `test:smoke`
   run on the final tree (`| rg | tail`). The smoke lane and the others were then repeated or
   verified bare as noted above; no gate result rests on a piped exit status.
4. **`dist/` was rebuilt** several times; it is git-ignored. `tmp/` (capture script and outputs,
   pinned client installs, lock copies, audit copies) is git-ignored and not committed.
5. `wrangler dev` printed "Establishing remote connection" for the `AI` binding. No model call was made;
   the live suites and the capture only reach catalog search, free Lumenloop/Scout/Docs reads and
   `execute`.
6. The plan's step 2 positive list names `mcp/server/index.js`; it has no marker of its own (see step 2).
7. The smoke lane prints the `[vpw:warn]` tail-consumer warnings and the vitest pool rename warning.
   Both printed in the step 2 run, on the old packages, so they are not new; they belong to PR 3.

## Open for the lead

- Step 11, the independent security read (Codex `gpt-6-astra`, high). The transport diff to read is the
  `getResourceAuthInfo` addition in `agents` and the five `packages/server/src/server/*` files in the SDK
  compare, summarized in the behavior table.
- The pre-existing live-suite failures above (baseline too).
- Before the deploy: the AGENTS.md ledger pre-check. After: `live-host-check.mjs`, a connector search,
  and rollback to `35c3b860` if either fails (plan, "Needs from the orchestrator").
