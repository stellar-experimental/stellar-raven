/**
 * Redirect-URI TLS posture (OAuth 2.1) — shared leaf check.
 *
 * Leaf module: no imports, so both src/auth/gate.ts (the DCR registration
 * callback) and src/auth/workos.ts (resolveAuthRequest on both /authorize
 * legs) can enforce it without the cycle that a gate ↔ workos import would
 * create — the same reason src/auth/timing.ts exists as a leaf.
 *
 * OAuth 2.1 requires TLS for redirect URIs except loopback (RFC 8252 §7.3)
 * and native-app custom schemes. The upstream library's registration-time
 * check still accepts plain http:// to any host, so both call sites enforce
 * this on top — at registration (reject the client) and at authorization
 * (refuse the request without redirecting to the insecure target).
 */

/**
 * True for a plain-http redirect URI to a non-loopback host. Loopback
 * (127/8, ::1, localhost), custom schemes, and https all pass — so local
 * dev, RFC 8252 native apps (e.g. Claude Code), and ChatGPT-style https
 * clients keep working. Malformed input returns false (other validators
 * own that rejection).
 */
export function isInsecureRedirectUri(redirectUri: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(redirectUri);
  } catch {
    return false;
  }
  if (parsed.protocol !== "http:") return false;
  const host = parsed.hostname.toLowerCase();
  if (host === "localhost" || host === "::1" || host === "[::1]") return false;
  if (/^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host)) return false;
  return true;
}
