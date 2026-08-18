/**
 * Playground session cookie and parked-state validation.
 *
 * The /playground/chat endpoint uses a short-lived signed cookie minted by
 * the /callback demo branch after the WorkOS exchange — no OAuth token ever
 * reaches the browser. Cookie value is `<base64url payload>.<base64url mac>`
 * where payload is JSON `{ sub, iat, exp }` and the MAC is HMAC-SHA256 keyed
 * by MCP_SERVER_SECRET. `__Host-` prefix + SameSite=Strict: deliberately
 * stricter than the Lax MCP-flow cookies in src/auth/workos.ts.
 *
 * Pure module: WebCrypto only, no cloudflare:workers import — unit-testable
 * under plain Node (test/demo-auth.test.ts).
 */
import { timingSafeEqualBytes } from "../auth/timing.ts";

export const DEMO_COOKIE_NAME = "__Host-RAVEN_DEMO";
/** Demo sessions live 2 hours; re-login is one redirect, so keep it short. */
export const DEMO_COOKIE_TTL_SECONDS = 2 * 60 * 60;
// __Host- prefix requires Secure + Path=/ + no Domain (RFC 6265bis).
const DEMO_COOKIE_ATTRS = "Path=/; Secure; HttpOnly; SameSite=Strict";

type DemoCookiePayload = { sub: string; iat: number; exp: number };

/** Mint the full Set-Cookie header value for a fresh demo session. */
export async function mintDemoCookie(secret: string, subject: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload: DemoCookiePayload = { sub: subject, iat: now, exp: now + DEMO_COOKIE_TTL_SECONDS };
  const encoded = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const mac = base64UrlEncode(await hmacSha256(secret, encoded));
  return `${DEMO_COOKIE_NAME}=${encoded}.${mac}; ${DEMO_COOKIE_ATTRS}; Max-Age=${DEMO_COOKIE_TTL_SECONDS}`;
}

/**
 * Verify the demo cookie from a Cookie header: returns the subject, or null
 * for missing/malformed/tampered/expired. Never throws on bad input.
 */
export async function verifyDemoCookie(secret: string, cookieHeader: string | null): Promise<string | null> {
  const value = readCookieValue(cookieHeader, DEMO_COOKIE_NAME);
  if (!value) return null;
  const dot = value.indexOf(".");
  if (dot <= 0 || dot !== value.lastIndexOf(".")) return null;
  const encoded = value.slice(0, dot);
  const presentedMac = base64UrlDecode(value.slice(dot + 1));
  if (!presentedMac) return null;
  // MAC-then-decode: both sides are fixed-length HMAC outputs, so the shared
  // digest comparator is constant-time here.
  const expectedMac = await hmacSha256(secret, encoded);
  if (!timingSafeEqualBytes(expectedMac, presentedMac)) return null;

  const payloadBytes = base64UrlDecode(encoded);
  if (!payloadBytes) return null;
  let payload: unknown;
  try {
    payload = JSON.parse(new TextDecoder().decode(payloadBytes));
  } catch {
    return null;
  }
  if (typeof payload !== "object" || payload === null) return null;
  const { sub, iat, exp } = payload as Partial<DemoCookiePayload>;
  if (typeof sub !== "string" || sub.length === 0) return null;
  if (!Number.isFinite(iat) || !Number.isFinite(exp)) return null;
  if ((exp as number) <= Math.floor(Date.now() / 1000)) return null;
  return sub;
}

/**
 * Validate a parked-KV value as the demo branch of the login-state union.
 * The callback rejects unknown JSON, and demo redirects use fixed same-origin paths.
 */
export function parseDemoParkedState(raw: string): { type: "demo"; returnTo: string } | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof parsed !== "object" || parsed === null) return null;
  const { type, returnTo } = parsed as { type?: unknown; returnTo?: unknown };
  if (type !== "demo") return null;
  if (returnTo !== "/playground" && returnTo !== "/playground/") return null;
  return { type: "demo", returnTo };
}

async function hmacSha256(secret: string, message: string): Promise<Uint8Array> {
  // Mirrors deriveSubject's fail-loud posture: an empty key would mint
  // trivially forgeable cookies.
  if (!secret) throw new Error("MCP_SERVER_SECRET is unset — cannot sign demo cookies");
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message)));
}

function readCookieValue(cookieHeader: string | null, name: string): string | null {
  for (const part of (cookieHeader ?? "").split(";")) {
    const trimmed = part.trim();
    if (trimmed.startsWith(`${name}=`)) return trimmed.slice(name.length + 1);
  }
  return null;
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

/**
 * Strict decode: null on any non-base64url input (atob throws on garbage) and
 * on non-canonical encodings — the final char of a base64 group carries unused
 * low bits that decoders silently drop, so without the re-encode check two
 * distinct strings can decode to the same bytes (e.g. a "tampered" trailing
 * `A`→`B` flip still verifying).
 */
function base64UrlDecode(input: string): Uint8Array | null {
  if (!/^[A-Za-z0-9_-]+$/.test(input)) return null;
  const padded = input.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(input.length / 4) * 4, "=");
  try {
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    if (base64UrlEncode(bytes) !== input) return null;
    return bytes;
  } catch {
    return null;
  }
}
