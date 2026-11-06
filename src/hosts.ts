/**
 * Alias hosts and the redirect to the canonical host.
 *
 * raven.stellar.buzz and agents.stellar.buzz are Worker custom domains that
 * predate raven.stellar.org. Every path redirects to the canonical host.
 * MCP clients configured with an alias must reconnect at the canonical URL;
 * their existing authorization belongs to the old issuer.
 */
import { HOST } from "./site";

export const ALIAS_HOSTNAMES: ReadonlySet<string> = new Set([
  "raven.stellar.buzz",
  "agents.stellar.buzz"
]);

/**
 * A 308 to the same path and query on the canonical host, or null when the
 * request must be served where it arrived. 308 keeps the method and body.
 */
export function canonicalHostRedirect(url: URL): Response | null {
  if (!ALIAS_HOSTNAMES.has(url.hostname.toLowerCase())) return null;
  const target = new URL(`https://${HOST}`);
  target.pathname = url.pathname;
  target.search = url.search;
  return new Response(null, { status: 308, headers: { location: target.href } });
}
