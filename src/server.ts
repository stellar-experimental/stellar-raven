/**
 * Stateless Worker entry; ARCHITECTURE.md defines routes and authorization.
 * Each /mcp request creates a fresh server through createMcpHandler.
 * No Durable Object or server-side MCP session stores request state.
 *
 * Named API-key and loopback-dev checks run before the OAuth provider.
 * The provider owns tokens and clients; WorkOS authenticates the person.
 * Only host code receives credentials and authorized grant properties.
 */
import OAuthProvider from "@cloudflare/workers-oauth-provider";
import { createMcpHandler } from "agents/mcp/server";
import { McpServer } from "@modelcontextprotocol/server";
import { registerTools, SERVER_INSTRUCTIONS } from "./mcp/tools";
import type { ExecuteRunner } from "./executor/run";
import { modelBoundaryMaxTokensFromEnv } from "./policy/truncate";
import {
  allowDevUnauthenticated,
  isAuthServerMetadataAlias,
  mcpResource,
  oauthProviderOptions,
  rewritePath
} from "./auth/gate";
import { authenticateApiKey } from "./auth/api-keys";
import { demoLoginRedirect } from "./auth/workos";
import { verifyDemoCookie } from "./demo/auth";
import { DEMO_LOCKED_PAGE_HEADERS, DEMO_PAGE_HEADERS, demoPage } from "./demo/page";
import { logEvent } from "./observability";
import { getCatalog } from "./catalog/load";
import { runAndStoreSkillCanary } from "./skills/canary";
import {
  LOOPBACK_HOSTNAMES,
  PRODUCTION_HOSTNAMES,
  PRODUCTION_ORIGINS,
  canonicalHostRedirect,
  selectOAuthOrigin
} from "./hosts";
import {
  authSubjectFromProps,
  buildMcpRequestObservability,
  normalizeRayId
} from "./observability-request";

declare const __RAVEN_SOURCE_REVISION__: string | undefined;
const SOURCE_REVISION =
  typeof __RAVEN_SOURCE_REVISION__ === "string" && /^[a-f0-9]{40}$/.test(__RAVEN_SOURCE_REVISION__)
    ? __RAVEN_SOURCE_REVISION__
    : null;
const SERVER_INFO = {
  name: "stellar-raven-codemode",
  version: "0.1.0",
  ...(SOURCE_REVISION ? { sourceRevision: SOURCE_REVISION } : {})
};
const DEV_LOCAL_ARTIFACT_OWNER = "dev-local";
// Production hostnames mirror wrangler.jsonc routes (src/hosts.ts); loopback entries preserve local dev.
const MCP_ALLOWED_ORIGIN_HOSTNAMES = [...PRODUCTION_HOSTNAMES, ...LOOPBACK_HOSTNAMES];

export type McpAccessContext =
  | { mode: "oauth" }
  | { mode: "api-key"; apiKeyName: string }
  | { mode: "dev-bypass" };

// One runner per isolate (providers + catalog + spec are env-stable); each
// `execute` call still gets its own fresh Dynamic Worker via LOADER.load().
let cachedRunner: ExecuteRunner | undefined;
let cachedRunnerMaxTokens: number | undefined;
let executeRunnerModule: Promise<typeof import("./executor/run")> | undefined;
async function getRunner(env: Env): Promise<ExecuteRunner> {
  const modelBoundaryMaxTokens = modelBoundaryMaxTokensFromEnv(env as unknown as Record<string, unknown>);
  if (!cachedRunner || cachedRunnerMaxTokens !== modelBoundaryMaxTokens) {
    const { createExecuteRunner } = await (executeRunnerModule ??= import("./executor/run"));
    cachedRunner = createExecuteRunner(env, { modelBoundaryMaxTokens });
    cachedRunnerMaxTokens = modelBoundaryMaxTokens;
  }
  return cachedRunner;
}

export function resolveArtifactOwner(
  oauthSubject: string | undefined,
  accessContext: McpAccessContext
): string | undefined {
  if (accessContext.mode === "oauth") return oauthSubject;
  if (accessContext.mode === "dev-bypass") return DEV_LOCAL_ARTIFACT_OWNER;
  return undefined;
}

// Stateless: fresh McpServer per request (ARCHITECTURE.md). Used
// both as the provider's /mcp apiHandler (token already validated there)
// and directly for the two bypasses.
export const mcpHandler = {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
    accessContext: McpAccessContext = { mode: "oauth" }
  ): Promise<Response> {
    // instructions surfaces in the client's system prompt at initialize time
    // (per-session, unlike tool descriptions which models skim once) — the
    // workflow + result-envelope contract lives there too.
    const server = new McpServer(SERVER_INFO, { instructions: SERVER_INSTRUCTIONS });
    const requestId = crypto.randomUUID();
    const authProps = (ctx as ExecutionContext & { props?: unknown }).props;
    const requestTelemetry = await buildMcpRequestObservability({
      accessMode: accessContext.mode,
      ...(accessContext.mode === "api-key" ? { apiKeyName: accessContext.apiKeyName } : {}),
      props: authProps,
      rayId: request.headers.get("cf-ray"),
      serverSecret: env.MCP_SERVER_SECRET
    });
    const oauthSubject = authSubjectFromProps(authProps);
    const runner = await getRunner(env);
    registerTools(server, {
      runExecute: (code, callContext) => runner(code, callContext),
      executeContext: () => ({
        artifactOwner: resolveArtifactOwner(oauthSubject, accessContext),
        requestId,
        rayId: requestTelemetry.rayId ?? undefined
      }),
      modelBoundaryMaxTokens: modelBoundaryMaxTokensFromEnv(env as unknown as Record<string, unknown>)
    });
    try {
      const response = await createMcpHandler(() => server, {
        route: "/mcp",
        allowedOriginHostnames: MCP_ALLOWED_ORIGIN_HOSTNAMES
      })(request, env, ctx);
      logEvent("mcp_request", {
        ...requestTelemetry,
        requestId,
        method: request.method,
        status: response.status
      });
      return response;
    } catch (error) {
      logEvent("mcp_request", {
        ...requestTelemetry,
        requestId,
        method: request.method,
        status: 500
      });
      throw error;
    }
  }
};

function createOAuthProvider(origin: string): OAuthProvider<Env> {
  return new OAuthProvider(oauthProviderOptions(mcpHandler, mcpResource(origin)));
}

// One provider per served origin, each binding tokens to its own `<origin>/mcp`
// (see "Request routes and authorization" in ARCHITECTURE.md). Built at module scope because the
// library validates its options in the constructor: a bad option fails at
// import, not as a 500 on the first request.
const productionProviders = new Map<string, OAuthProvider<Env>>(
  PRODUCTION_ORIGINS.map((origin) => [origin, createOAuthProvider(origin)])
);

// Production origins use the cached provider. A loopback origin gets a fresh one
// per request: any port is valid, so the origin space is too large to cache,
// and building one costs nothing that matters in local dev.
function oauthProviderFor(origin: string): OAuthProvider<Env> {
  return productionProviders.get(origin) ?? createOAuthProvider(origin);
}

// The library does `if (!env.OAUTH_PROVIDER) env.OAUTH_PROVIDER = createOAuthHelpers(env)`
// and the helpers close over the provider that made them. The Worker `env` is
// shared by every request in an isolate, so on a shared object the first origin
// served would pin its helpers and every later /authorize on another origin
// would validate against the wrong resource. Each dispatch passes a copy with
// the field cleared; never mutate or clear it on the shared object.
function providerEnv(env: Env): Env {
  return { ...env, OAUTH_PROVIDER: undefined } as unknown as Env;
}

function isMcpPath(url: URL): boolean {
  return url.pathname === "/mcp" || url.pathname.startsWith("/mcp/");
}

// Exact paths prevent `/playgrounds` and similar names from entering the
// playground handler. Other paths fall through to the provider's 404.
function isPlaygroundPath(url: URL): boolean {
  return (
    url.pathname === "/playground" ||
    url.pathname === "/playground/" ||
    url.pathname === "/playground/login" ||
    url.pathname === "/playground/chat"
  );
}

/**
 * /playground routes — a browser surface gated by the signed demo cookie (plus
 * the same loopback dev bypass /mcp honors), never by the OAuth provider.
 * Matched paths with an unsupported method get 405 here; only unmatched paths
 * fall through to the provider.
 */
async function handlePlaygroundRoute(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  url: URL
): Promise<Response> {
  const isRead = request.method === "GET" || request.method === "HEAD";

  if (url.pathname === "/playground" || url.pathname === "/playground/") {
    if (!isRead) return methodNotAllowed("GET, HEAD");
    // No cookie present → verify returns null without needing the secret.
    const subject = await verifyDemoCookie(env.MCP_SERVER_SECRET, request.headers.get("cookie"));
    const authenticated = subject !== null || allowDevUnauthenticated(env, url.hostname);
    return new Response(demoPage({ authenticated }), {
      headers: authenticated ? DEMO_PAGE_HEADERS : DEMO_LOCKED_PAGE_HEADERS
    });
  }

  if (url.pathname === "/playground/login") {
    // GET only (not HEAD): the redirect parks single-use state in KV — probe
    // requests must not mint state.
    if (request.method !== "GET") return methodNotAllowed("GET");
    return demoLoginRedirect(request, env);
  }

  // /playground/chat — handleDemoChat owns the full gauntlet (method, origin,
  // auth, throttle, body) and answers 405 for non-POST itself.
  const { handleDemoChat } = await import("./demo/chat");
  return handleDemoChat(request, env, ctx);
}

function methodNotAllowed(allow: string): Response {
  return Response.json(
    { error: "method_not_allowed", hint: `Allowed: ${allow}` },
    { status: 405, headers: { allow, "cache-control": "no-store" } }
  );
}

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const url = new URL(request.url);

    // Alias browser pages redirect; MCP and OAuth retain their origin (hosts.ts).
    const aliasRedirect = canonicalHostRedirect(url);
    if (aliasRedirect) return aliasRedirect;

    // Bypasses skip the provider entirely and hit the MCP handler directly.
    if (isMcpPath(url)) {
      const apiKeyName = await authenticateApiKey(request, env);
      if (apiKeyName) {
        return mcpHandler.fetch(request, env, ctx, { mode: "api-key", apiKeyName });
      }
      if (allowDevUnauthenticated(env, url.hostname)) {
        return mcpHandler.fetch(request, env, ctx, { mode: "dev-bypass" });
      }
    }

    // Only the three production origins and loopback have an OAuth provider.
    // Anything else gets 404 before any provider or browser-login work, so no
    // request origin is ever advertised as an issuer (src/hosts.ts).
    const oauthOrigin = selectOAuthOrigin(url);
    if (oauthOrigin === null) {
      return Response.json({ error: "not found" }, { status: 404, headers: { "cache-control": "no-store" } });
    }

    // /playground — cookie-gated browser surface, intercepted BEFORE the
    // provider (it knows nothing about these routes).
    if (isPlaygroundPath(url)) {
      return handlePlaygroundRoute(request, env, ctx, url);
    }

    // Discovery aliases (path-suffixed RFC 8414 + OIDC-discovery paths) →
    // the lib's exact-path RFC 8414 endpoint (see gate.ts).
    const oauthProvider = oauthProviderFor(oauthOrigin);
    if (isAuthServerMetadataAlias(url)) {
      return oauthProvider.fetch(
        rewritePath(request, "/.well-known/oauth-authorization-server"),
        providerEnv(env),
        ctx
      );
    }

    // Everything else — /mcp (token-checked), /token, /register, the
    // .well-known docs, and the defaultHandler (/, /health, /authorize,
    // /callback, 404) — belongs to the provider.
    const response = await oauthProvider.fetch(request, providerEnv(env), ctx);
    if (isMcpPath(url) && response.status === 401) {
      // A failed API-key check also lands here by design; never hash or
      // otherwise derive identity from a rejected bearer token.
      logEvent("mcp_request", {
        accessMode: "oauth-rejected",
        method: request.method,
        status: response.status,
        rayId: normalizeRayId(request.headers.get("cf-ray"))
      });
    }
    return response;
  },

  /**
   * Skill-availability canary (`triggers.crons` in wrangler.jsonc). Runs inside the
   * Worker to detect Cloudflare-side egress failures that CI runners cannot see, and
   * stores only a verdict for `/health/skills` and `refresh.yml`.
   */
  async scheduled(_controller, env, _ctx): Promise<void> {
    await runAndStoreSkillCanary(getCatalog(), env.OAUTH_KV);
  }
} satisfies ExportedHandler<Env>;
