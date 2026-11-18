/**
 * Alias hosts and the redirect to the canonical host.
 *
 * raven.stellar.buzz and agents.stellar.buzz are Worker custom domains that
 * predate raven.stellar.org. Browser pages redirect to the canonical host.
 * MCP and its entire OAuth flow stay on the requested origin so existing
 * clients retain their issuer, protected resource, cookies, and refresh grants.
 */
import { HOST } from "./site";

export const ALIAS_HOSTNAMES: ReadonlySet<string> = new Set([
  "raven.stellar.buzz",
  "agents.stellar.buzz"
]);

/** Hostnames Raven serves in production, canonical first; `wrangler.jsonc` routes the same three. */
export const PRODUCTION_HOSTNAMES: readonly string[] = [HOST, ...ALIAS_HOSTNAMES];

/** The three production origins, each a complete OAuth issuer and MCP resource host. */
export const PRODUCTION_ORIGINS: readonly string[] = PRODUCTION_HOSTNAMES.map((host) => `https://${host}`);

/** Loopback hostnames wrangler dev binds to (`URL.hostname` forms). */
export const LOOPBACK_HOSTNAMES: readonly string[] = ["localhost", "127.0.0.1", "[::1]"];

/**
 * The origin whose OAuth provider serves this request, or null when none does.
 * Production is an exact match on one of the three https origins. Local dev is
 * `http:` on a loopback hostname with any port. It reads `url.origin` of the
 * request URL only, never a Host or forwarding header, so a production hostname
 * with another scheme or port does not match.
 */
export function selectOAuthOrigin(url: URL): string | null {
  if (PRODUCTION_ORIGINS.includes(url.origin)) return url.origin;
  if (url.protocol === "http:" && LOOPBACK_HOSTNAMES.includes(url.hostname)) return url.origin;
  return null;
}

/** Exact OAuth routes plus the MCP and discovery namespaces stay on aliases. */
const ALIAS_SERVED_PATHS = new Set(["/authorize", "/callback", "/token", "/register"]);

function isAliasServedPath(pathname: string): boolean {
  return (
    pathname === "/mcp" ||
    pathname.startsWith("/mcp/") ||
    pathname.startsWith("/.well-known/") ||
    ALIAS_SERVED_PATHS.has(pathname)
  );
}

/**
 * A 308 to the same path and query on the canonical host, or null when the
 * request must be served where it arrived. 308 keeps the method and body.
 */
export function canonicalHostRedirect(url: URL): Response | null {
  if (!ALIAS_HOSTNAMES.has(url.hostname.toLowerCase())) return null;
  if (isAliasServedPath(url.pathname)) return null;
  const target = new URL(`https://${HOST}`);
  target.pathname = url.pathname;
  target.search = url.search;
  return new Response(null, { status: 308, headers: { location: target.href } });
}
