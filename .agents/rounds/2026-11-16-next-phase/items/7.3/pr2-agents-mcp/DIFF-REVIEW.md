# Independent security review: item 7.3, PR 2

Verdict: **PASS**. No blocker, major, or minor finding in the reviewed change.

Reviewed `origin/main...HEAD`, base `0683d266`, tip
`8b1973e6dcc0e03e333d3822dcadb44a8888bbac`, on 2026-11-18.
Reviewer: independent Codex frontier lane (brief assigns `gpt-6-astra`, high),
distinct from the Sonnet author and Opus orchestrator. No further agents used.

## Numbered findings and dispositions

1. **Note — trusted context remains a host boundary.**
   Files: `src/server.ts:97-125`,
   `node_modules/agents/dist/handler-stateless-B5hU3dxK.js:32-88`,
   `node_modules/@cloudflare/workers-oauth-provider/dist/oauth-provider.js:2658-2748`.
   The new `getResourceAuthInfo` trusts a correctly shaped `ctx.auth`; its shape
   checks are not token verification. Likewise, `Symbol.for` is not an unforgeable
   credential for code already executing in the host isolate. This is safe on
   Raven's current path: the Worker runtime supplies `ctx`, Raven passes that
   object directly, and neither request headers nor JSON parameters are copied
   into it. The provider validates the bearer token and decrypts grant props
   before assigning `ctx.props`. Its installed 0.10.4 implementation assigns
   neither `ctx.auth` nor the verified-context symbol. Raven invokes the callable
   handler, not its `.fetch(request, requestOptions)` overload, so a client cannot
   supply the latter's explicit `authInfo` either. The execute sandbox has no
   reference to this execution context and remains a separate Dynamic Worker.
   **Fix:** none for this PR. Preserve this trust boundary when reviewing the
   separately planned provider 1.x upgrade; do not treat shape validation as
   authentication.

2. **Note — pre-existing live-suite failures remain outside this PASS.**
   File: `.agents/rounds/2026-11-16-next-phase/items/7.3/pr2-agents-mcp/EXEC.md`,
   “Live suites.” The author reports three execute checks and one spec-search
   case failing on both baseline and upgraded servers. This review did not
   rerun those suites or establish their cause. The transport/source comparison
   and saved handshake captures support accepting this dependency change, but
   do not establish that those live suites are healthy.
   **Fix:** the lead should record the disposition of these failures in its
   existing work ledger and keep them explicit in the completion report. No
   transport change or new model evaluation is justified by this review.

## Security conclusions

- **Import equivalence:** unpacked `agents@0.28.1` with `npm pack` under `tmp/`.
  Its `dist/mcp/index.js:1264-1265` immediately forwards a function factory to
  `createStatelessMcpHandler`. Its `mcp/server/index.js` re-exports that exact
  function. Raven supplies `() => server`, so it never used the SDK v1 overload.
  Removing the unrelated Agent/Durable Object modules does not remove a handler
  check or auth-context setup. The stateless chunk itself owns its AsyncLocalStorage.
- **Handler delta:** the full old/new stateless chunk diff adds only
  `isHttpUrl`, `getResourceAuthInfo`, and the fallback call when the symbol is
  absent, apart from the source-map filename. Route matching, Origin and Host
  checks, CORS/OPTIONS, legacy dispatch, response wrapping, teardown, and error
  mapping are unchanged. An invalid present verified-context symbol still fails
  closed; it does not fall through to `ctx.auth`.
- **Artifact ownership:** unchanged. `src/server.ts` reads `ctx.props`, extracts
  its subject, and captures it in the registered execute-context closure before
  invoking the transport. `resolveArtifactOwner` returns the subject for OAuth,
  `dev-local` for loopback development, and no owner for API-key access.
  `src/mcp/tools.ts` obtains execution context from that closure, not SDK
  `context.http.authInfo`, client metadata, or tool arguments. No new ownership
  source or cross-request identity sharing was introduced.
- **SDK reach:** independently fetched and inspected the
  [v2.3.1...v2.4.0 source comparison](https://github.com/modelcontextprotocol/typescript-sdk/compare/v2.3.1...v2.4.0),
  including all non-skills server/core runtime changes and package entry changes.
  The execution table covers the changes relevant to this path. Non-POST traffic
  is classified legacy, so agents' own 405 remains authoritative (OPTIONS is
  handled earlier). Modern serving sets the negotiated revision before connect;
  the new transport-derived revision binding does not change it. Legacy serving
  uses a different transport. Raven declares no `x-mcp-header`, output schema,
  resource, subscription bus, or Skills extension. The extension remains on a
  separate entry point. No additional reachable behavior change was found.
- **Dependency/bundle scope:** compared both lockfiles programmatically: one
  added package (`@opentelemetry/api`), five version changes, 82 entries whose
  sole change is `devOptional: true`, and no removals. These flags do not remove
  runtime code Raven needs. The bundle positively includes the workerd schema
  shim and Cloudflare validator; it does not depend on removed Ajv initialization.

## Independent checks

All commands below completed successfully; no development server, model call,
paid call, install into the worktree, commit, or push was performed.

| Check | Result |
|---|---|
| `npm run build` (bare, hc child `t1xp`) | Exit 0; 6,997,380 bytes; SHA-256 `01822c7b7277fc85874b506a4b3f2ed430484ada40d89b7671cea24b39b476f0`, exactly EXEC.md |
| `npm run -s mcp:surface -- --json` | Surface `815333b74671dec3a7919333a9960392fd9a39d12efbcaa148b447995de2bd07`; instructions `67a6bd0b57da385b412a5dc47dc3de3b8ae65f4b39e3a862cb53deec659c6c00`; two tools, zero output-schema characters |
| `npm ls workerd` | One version, `1.20261023.1`, deduplicated |
| Rebuilt bundle positive list | Only agents marker: `handler-stateless-B5hU3dxK.js`; MCP core 2 markers, server 8, including `shimsWorkerd.mjs` |
| Rebuilt bundle exclusions | Zero SDK v1, MCP client, Ajv, OpenTelemetry, or picomatch paths |
| Saved handshake captures | A/B differences only artifact id and expiry in execute text; B/C also differs in the capture's client-set label. Both eras' remaining captured fields match. Modern discovery 200; raw GET 405 without Allow in all three |
| Worktree | No tracked diff introduced by this review or build; original untracked brief preserved |

The handshake check inspected the author's capture script and compared the
three existing JSON artifacts; it was not a fresh network replay. Full tests,
smoke, audit pairing, and secrets-scan results remain the author's recorded
evidence, not independently rerun here. No persistent test was added: the
source read and requested checks resolve this bounded review without extending
the test surface.
