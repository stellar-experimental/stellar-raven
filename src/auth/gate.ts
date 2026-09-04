/**
 * Auth gate — OAuthProvider wiring plus the local-dev bypass
 * (research/auth-workos.md).
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
import { isInsecureRedirectUri } from "./redirects";
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

/**
 * Options for `new OAuthProvider(...)` — exported (rather than the instance)
 * so plain-Node tests can build a provider around a stub /mcp handler and
 * assert the real emitted behavior (401 + WWW-Authenticate, discovery docs).
 */
export function oauthProviderOptions(
  mcpHandler: ExportedHandler<Env> & { fetch: NonNullable<ExportedHandler<Env>["fetch"]> }
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
    // OAuth 2.1 posture: S256 PKCE only.
    allowPlainPKCE: false,
    // CIMD (URL-based client_ids — no dynamic-registration round trip). Also
    // needs the `global_fetch_strictly_public` compat flag (wrangler.jsonc);
    // the provider gates on BOTH before advertising/serving it.
    clientIdMetadataDocumentEnabled: true,
    /**
     * OAuth 2.1 hardening the library does not do itself: reject
     * plain-http redirect URIs to non-loopback hosts at registration time.
     * Loopback http (RFC 8252), custom schemes (native apps), and https pass.
     * The /authorize legs enforce the same rule on the validated request
     * (resolveAuthRequest in workos.ts), which also covers CIMD clients.
     * Rejections follow RFC 7591 §3.2.2 (invalid_client_metadata, 400).
     */
    clientRegistrationCallback: ({ clientMetadata }) => {
      const uris = (clientMetadata as { redirect_uris?: unknown }).redirect_uris;
      if (Array.isArray(uris) && uris.some((u) => typeof u === "string" && isInsecureRedirectUri(u))) {
        return {
          code: "invalid_client_metadata",
          description: "redirect_uris must use https for non-loopback hosts."
        };
      }
    },
    // RFC 9728 protected-resource metadata — how Claude/Cursor connectors
    // discover that /mcp is OAuth-protected and where to authorize.
    resourceMetadata: {
      scopes_supported: [MCP_SCOPE],
      resource_name: "stellar-raven-codemode MCP"
    }
  };
}

/** Loopback hostnames wrangler dev binds to (URL.hostname forms). */
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

// Re-export from the leaf module (src/auth/redirects.ts) — existing
// importers (tests) keep this path; workos.ts imports the leaf directly to
// avoid a module cycle through gate.ts.
export { isInsecureRedirectUri } from "./redirects";

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
 * workers-oauth-provider 0.10.2 serves RFC 8414 metadata only at the EXACT
 * path `/.well-known/oauth-authorization-server` (verified in its dist —
 * re-checked on the 0.10.1 → 0.10.2 upgrade; still the only well-known path it
 * answers besides `/.well-known/oauth-protected-resource`).
 * Two families of client requests are aliased onto that path:
 *  1. the RFC 8414 §3.1 path-suffixed form (`.../oauth-authorization-server/mcp`)
 *     — our issuer has no path component, so only non-conforming clients that
 *     wrongly append the resource path send this;
 *  2. OIDC discovery `/.well-known/openid-configuration` (exact + suffixed) —
 *     RFC 8414 §5 lets an OAuth-only AS publish its metadata there too, and
 *     the MCP spec (2025-11-25) requires clients to support both mechanisms;
 *     some clients probe only this one (spec-compliance review in
 *     research/auth-workos.md).
 * (The RFC 9728 `/.well-known/oauth-protected-resource/mcp` form IS handled
 * natively by the lib — no alias needed there.)
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
