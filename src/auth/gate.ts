/**
 * Auth gate — OAuthProvider wiring plus the local-dev bypass
 * (ARCHITECTURE.md).
 *
 * Everything at /mcp is WorkOS-backed OAuth EXCEPT:
 *  1. Named API keys — `Authorization: Bearer <name>:<token>`, validated
 *     against SHA-256 digests stored under an isolated OAUTH_KV prefix.
 *  2. Local dev — `DEV_ALLOW_UNAUTHENTICATED=true` AND the request hostname is
 *     local (localhost / 127.0.0.1 / ::1). wrangler dev serves on localhost so
 *     local dev keeps working; the local-host gate is a second factor so a
 *     mistakenly-deployed var does NOTHING on the public custom domains
 *     (raven.stellar.org and its stellar.buzz aliases). Still set ONLY in
 *     `.dev.vars`.
 *
 * Pure module: no cloudflare:workers import (the OAuthProvider class itself
 * imports it, so `new OAuthProvider(...)` lives in src/server.ts; tests
 * construct one from these same options with `cloudflare:workers` aliased —
 * see vitest.config.ts). Unit-tested in test/auth.test.ts.
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
 * Options for `new OAuthProvider(...)` — exported (rather than the instance)
 * so plain-Node tests can build a provider around a stub /mcp handler and
 * assert the real emitted behavior (401 + WWW-Authenticate, discovery docs).
 *
 * `resource` is the one canonical resource this provider binds tokens to. Raven
 * serves three origins, so src/server.ts builds one provider per origin, each
 * with its own `<origin>/mcp` (DESIGN.md D1 of the oauth-provider 1.x round).
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
    // Native-app callbacks (RFC 8252 private-use schemes). This deviates from
    // upstream's advice to leave it off for MCP servers: Claude Code (`claude:`),
    // Cursor (`cursor:`) and Warp (`warp:`) callbacks were measured in
    // production grants on 2026-11-18, and without the flag the provider
    // refuses every such authorization. Raven narrows what it admits to an
    // allowlist of https, loopback http and those three schemes
    // (src/auth/redirects.ts), checked at authorization in workos.ts.
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
