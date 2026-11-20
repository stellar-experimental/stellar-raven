/**
 * OAuth callback transport allowlist enforced at `/authorize` (ARCHITECTURE.md).
 * Admits `https:`, loopback `http:`, and named native schemes below so a client
 * cannot redirect codes or errors to arbitrary OS protocol handlers. Native-app
 * scheme ownership stays unverified; consent and browser-bound state cover the user.
 */
export const NATIVE_REDIRECT_SCHEMES: ReadonlySet<string> = new Set(["claude:", "cursor:", "warp:"]);

function parseRedirect(redirectUri: string): URL | null {
  try {
    return new URL(redirectUri);
  } catch {
    return null;
  }
}

function isLoopbackHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (host === "localhost" || host === "::1" || host === "[::1]") return true;
  return /^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host);
}

export function hasAllowedRedirectTransport(redirectUri: string): boolean {
  const parsed = parseRedirect(redirectUri);
  if (!parsed) return false;
  if (parsed.protocol === "https:") return true;
  if (parsed.protocol === "http:") return isLoopbackHost(parsed.hostname);
  return NATIVE_REDIRECT_SCHEMES.has(parsed.protocol);
}

/**
 * Registration refuses a redirect URI that is malformed or plain http to a
 * non-loopback host. Other schemes are tolerated at registration, because a
 * client may list a native callback beside a compliant one (Cursor does);
 * authorization applies the allowlist to the URI actually used.
 */
export function isRegistrableRedirect(redirectUri: unknown): boolean {
  if (typeof redirectUri !== "string") return false;
  const parsed = parseRedirect(redirectUri);
  if (!parsed) return false;
  return parsed.protocol !== "http:" || isLoopbackHost(parsed.hostname);
}

/**
 * A bounded token naming a refused redirect scheme, safe to log: the parsed
 * scheme without its colon when it is short and plain, otherwise `other`. The
 * URI itself is never logged. A logged scheme is a lead for review, not proof
 * of real client demand.
 */
export function redirectSchemeToken(redirectUri: string): string {
  const parsed = parseRedirect(redirectUri);
  if (!parsed) return "other";
  const scheme = parsed.protocol.slice(0, -1);
  return /^[a-z][a-z0-9+.-]{0,31}$/.test(scheme) ? scheme : "other";
}
