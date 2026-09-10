/**
 * Apply the redirect transport rule that supplements the provider's URI checks.
 * HTTPS, native-app schemes, and HTTP loopback redirects are allowed.
 */
export function hasAllowedRedirectTransport(redirectUri: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(redirectUri);
  } catch {
    return false;
  }
  if (parsed.protocol !== "http:") return true;
  const host = parsed.hostname.toLowerCase();
  if (host === "localhost" || host === "::1" || host === "[::1]") return true;
  return /^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host);
}
