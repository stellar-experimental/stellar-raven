/**
 * The callback transports Raven admits for an OAuth redirect URI, applied at
 * authorization on top of the provider's own checks (see "Request routes and
 * authorization" in ARCHITECTURE.md).
 *
 * Allowed: `https:`; `http:` on a loopback host; and the native-app schemes
 * named below, matched by exact scheme. Everything else is refused, so a
 * registered client cannot make Raven hand a code, or an error redirect, to an
 * arbitrary OS protocol handler (`smb:`, `ms-settings:`, ...). A new native
 * client is added by name, after its scheme shows up in `auth_reject` logs.
 *
 * This restricts callback transports. It does not authenticate the app that
 * owns a scheme: native-app ownership stays unverified. The consent page
 * records the user's approval of a client it labels unverified, and the
 * browser-bound WorkOS state ties the login round trip to that browser.
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
