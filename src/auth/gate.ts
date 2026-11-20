/**
 * OAuthProvider options and loopback dev-bypass guard (ARCHITECTURE.md).
 * Pure module (no `cloudflare:workers` import); `new OAuthProvider` lives in src/server.ts.
 */
import type { OAuthProviderOptions } from "@cloudflare/workers-oauth-provider";
import { WorkOSAuthHandler } from "./workos";
import { LOOPBACK_HOSTNAMES } from "../hosts";
import { logEvent } from "../observability";
import { hasAllowedRedirectTransport, isRegistrableRedirect } from "./redirects";
// Token lifetimes derive from the retention leaf that privacy disclosures
// quote, so a published duration can never drift from the enforced one.
import { RETENTION } from "./retention";

// Re-export from the leaf module (src/auth/timing.ts) — existing importers
// (tests) keep this path; demo code imports the leaf directly to avoid a
// module cycle through workos.ts.
export { timingSafeEqualBytes } from "./timing";

/** Short-lived bearer token; compatible MCP clients refresh it automatically. */
export const ACCESS_TOKEN_TTL_SECONDS = RETENTION.accessTokenSeconds;
/**
 * Fixed authorization-grant lifetime. Refresh-token rotation does not extend
 * this window, so clients reauthorize through WorkOS after 90 days.
 */
export const REFRESH_TOKEN_TTL_SECONDS = RETENTION.refreshGrantSeconds;
/** DCR metadata lifetime, independent of user grants and token lifetimes. */
export const CLIENT_REGISTRATION_TTL_SECONDS = RETENTION.clientRegistrationSeconds;

/** The single scope this server understands. */
export const MCP_SCOPE = "mcp";

/** The MCP protected resource for one served origin; also the audience its tokens carry. */
export function mcpResource(origin: string): string {
  return `${origin}/mcp`;
}

/**
 * Options for `new OAuthProvider(...)`, built per served origin in src/server.ts
 * so tokens bind to that origin's `<origin>/mcp` resource (ARCHITECTURE.md).
 */
export function oauthProviderOptions(
  mcpHandler: ExportedHandler<Env> & { fetch: NonNullable<ExportedHandler<Env>["fetch"]> },
  resource: string
): OAuthProviderOptions<Env> {
  return {
    apiHandlers: { "/mcp": mcpHandler },
    defaultHandler: WorkOSAuthHandler,
    authorizeEndpoint: "/authorize",
    tokenEndpoint: "/token",
    clientRegistrationEndpoint: "/register",
    accessTokenTTL: ACCESS_TOKEN_TTL_SECONDS,
    refreshTokenTTL: REFRESH_TOKEN_TTL_SECONDS,
    clientRegistrationTTL: CLIENT_REGISTRATION_TTL_SECONDS,
    scopesSupported: [MCP_SCOPE],
    // CIMD (URL-based client_ids — no dynamic-registration round trip). Also
    // needs the `global_fetch_strictly_public` compat flag (wrangler.jsonc);
    // the provider gates on BOTH before advertising/serving it.
    clientIdMetadataDocumentEnabled: true,
    // Enable RFC 8252 native callbacks for Claude, Cursor, and Warp; src/auth/redirects.ts
    // narrows what `/authorize` admits to https, loopback http, and those three schemes.
    allowPrivateUseRedirectUris: true,
    // Refuse a registration that lists a remote-http or malformed callback, or
    // that lists no callback Raven would use at authorization.
    clientRegistrationCallback: ({ clientMetadata }) => {
      const uris = (clientMetadata as { redirect_uris?: unknown }).redirect_uris;
      if (!Array.isArray(uris)) return;
      if (!uris.every(isRegistrableRedirect)) {
        return {
          code: "invalid_client_metadata",
          description: "redirect_uris must use https for non-loopback hosts."
        };
      }
      if (!uris.some((uri) => hasAllowedRedirectTransport(uri as string))) {
        return {
          code: "invalid_client_metadata",
          description: "redirect_uris must include an https, loopback http, claude:, cursor: or warp: URI."
        };
      }
    },
    // The provider's own error reasons are stable slugs (internal.category and
    // internal.reason). Log only those and the status: never `description` or
    // `detail`, which can carry request-supplied text. Return nothing so the
    // provider's response stands.
    onError: ({ code, status, internal }) => {
      logEvent("oauth_error", { status, code, category: internal.category, reason: internal.reason });
    },
    // RFC 9728 protected-resource metadata — how Claude/Cursor connectors
    // discover that /mcp is OAuth-protected and where to authorize. The scope
    // is advertised (metadata and the 401 challenge), not enforced here.
    resourceMetadata: {
      resource,
      resource_name: "stellar-raven-codemode MCP"
    },
    requiredScopes: [MCP_SCOPE]
  };
}

/** Loopback hostnames wrangler dev binds to, in both `URL.hostname` and bare IPv6 forms. */
const LOCAL_HOSTS = new Set([...LOOPBACK_HOSTNAMES, "::1"]);

/**
 * Local-dev bypass: the var must be the exact string "true" (only ever set via
 * `.dev.vars`) AND the request must be to a loopback hostname. The hostname
 * gate is a hard second factor — a var mistakenly deployed to production does
 * nothing, because raven.stellar.org and its aliases are not local hosts.
 */
export function allowDevUnauthenticated(
  env: Partial<Pick<Env, "DEV_ALLOW_UNAUTHENTICATED">>,
  hostname: string
): boolean {
  if (env.DEV_ALLOW_UNAUTHENTICATED !== "true") return false;
  return LOCAL_HOSTS.has(hostname.toLowerCase());
}

/**
 * Alias supported authorization metadata requests to the provider's exact
 * /.well-known/oauth-authorization-server path. The issuer has no path.
 * Accept path-suffixed RFC 8414 requests and OIDC discovery aliases.
 * The provider handles protected-resource metadata separately.
 * See ARCHITECTURE.md for the request and authorization flow.
 */
export function isAuthServerMetadataAlias(url: URL): boolean {
  return (
    url.pathname.startsWith("/.well-known/oauth-authorization-server/") ||
    url.pathname === "/.well-known/openid-configuration" ||
    url.pathname.startsWith("/.well-known/openid-configuration/")
  );
}

export function rewritePath(request: Request, pathname: string): Request {
  const url = new URL(request.url);
  url.pathname = pathname;
  return new Request(url.toString(), request);
}
