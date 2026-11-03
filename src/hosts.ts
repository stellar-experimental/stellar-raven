/**
 * Alias hosts and the redirect to the canonical host.
 *
 * raven.stellar.buzz and agents.stellar.buzz are Worker custom domains that
 * predate raven.stellar.org. Their browser pages redirect to the canonical
 * host. The MCP and OAuth surface stays on the alias: each host is its own
 * OAuth issuer and protected resource, and MCP clients reject a protected
 * resource whose origin differs from the configured server URL. A client set
 * up with an alias URL must keep working on that alias.
 */
import { HOST } from "./site";

export const ALIAS_HOSTNAMES: ReadonlySet<string> = new Set([
  "raven.stellar.buzz",
  "agents.stellar.buzz"
]);

/** Exact paths served on an alias because an OAuth flow started there. */
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
  const target = new URL(`${url.pathname}${url.search}`, `https://${HOST}`);
  return new Response(null, { status: 308, headers: { location: target.href } });
}
