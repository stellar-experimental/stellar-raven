/**
 * WorkOS AuthKit defaultHandler for OAuthProvider (ARCHITECTURE.md).
 * WorkOS authenticates the human; its token is dropped immediately after code exchange,
 * leaving only the colon-free peppered `subject` hash (required by OAuthProvider token format).
 * Confused-deputy defenses: explicit POST consent, double-submit CSRF cookie, and browser-bound
 * WorkOS state. Pure module (no `cloudflare:workers` import).
 */
import { AuthorizationError } from "@cloudflare/workers-oauth-provider";
import type { AuthRequest, OAuthHelpers } from "@cloudflare/workers-oauth-provider";
import {
  CONSENT_HEADERS,
  DOCS_HEADERS,
  LANDING_HEADERS,
  ROBOTS_HEADERS,
  SITEMAP_HEADERS,
  TERMS_HEADERS,
  consentPage,
  docsPage,
  landingPage,
  robotsTxt,
  sitemapXml,
  termsPage
} from "../site";
import { OG_PNG_BASE64 } from "../og";
import { logEvent } from "../observability.ts";
import { hasAllowedRedirectTransport, redirectSchemeToken } from "./redirects";
import { skillHealthResponse } from "../skills/canary.ts";
import { mintDemoCookie, parseDemoParkedState } from "../demo/auth";

// env.OAUTH_PROVIDER is injected by OAuthProvider before it invokes the
// default handler; wrangler types can't see it, so declare it here.
declare global {
  interface Env {
    OAUTH_PROVIDER: OAuthHelpers;
  }
}

const WORKOS_AUTHORIZE_URL = "https://api.workos.com/user_management/authorize";
const WORKOS_AUTHENTICATE_URL = "https://api.workos.com/user_management/authenticate";

/**
 * Parked /authorize state and binding-cookie TTL. Kept shorter than consent because
 * `/callback` deletes `login:${state}` before checking the binding cookie, so a leaked
 * state allows login-DoS for this window.
 */
export const LOGIN_STATE_TTL_SECONDS = 10 * 60;

/**
 * Consent-form CSRF cookie TTL. Longer than login state to give humans time to read
 * linked legal docs; carries no server-side state and POST re-validates the request.
 */
export const CONSENT_CSRF_TTL_SECONDS = 30 * 60;

const CONSENT_CSRF_COOKIE = "__Host-MCP_CONSENT_CSRF";
const STATE_BINDING_COOKIE = "__Host-MCP_STATE";
const COOKIE_ATTRS = "HttpOnly; Secure; Path=/; SameSite=Lax";

/** Validated KV union under `login:${state}`; callback rejects unknown shapes. */
type ParkedLogin =
  | { type: "mcp"; oauthReq: AuthRequest; binding: string }
  | { type: "demo"; binding: string; returnTo: string };

type WorkOSAuthenticateResponse = {
  user?: { id?: string };
};

export const WorkOSAuthHandler = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const provider = env.OAUTH_PROVIDER;

    // Public web resources answer both GET and HEAD: a general-purpose server
    // MUST support HEAD (RFC 9110 §9.3.2). Each route returns the identical
    // response for both — workerd drops the body for HEAD and derives an
    // accurate Content-Length itself (a manually-set one is ignored, so don't).
    const isRead = request.method === "GET" || request.method === "HEAD";

    if (isRead && url.pathname === "/") {
      return new Response(landingPage(), { headers: LANDING_HEADERS });
    }

    if (isRead && url.pathname === "/terms") {
      return new Response(termsPage(), { headers: TERMS_HEADERS });
    }

    if (isRead && url.pathname === "/docs") {
      return new Response(docsPage(), { headers: DOCS_HEADERS });
    }

    if (isRead && url.pathname === "/og.png") {
      return ogImageResponse();
    }

    if (isRead && url.pathname === "/robots.txt") {
      return new Response(robotsTxt(), { headers: ROBOTS_HEADERS });
    }

    if (isRead && url.pathname === "/sitemap.xml") {
      return new Response(sitemapXml(), { headers: SITEMAP_HEADERS });
    }

    if (isRead && url.pathname === "/health") {
      return Response.json({ status: "ok", service: "stellar-raven-codemode" });
    }

    // Reports the stored skill-availability verdict; never probes upstream, so
    // a request cannot drive traffic at GitHub and this needs no auth. 503 when
    // failing OR never recorded — see src/skills/canary.ts.
    if (isRead && url.pathname === "/health/skills") {
      return skillHealthResponse(env.OAUTH_KV);
    }

    if (url.pathname === "/authorize" && request.method === "GET") {
      const resolved = await resolveAuthRequest(provider, request);
      if (!resolved.ok) return resolved.response;
      const oauthReq = resolved.request;
      const client = await provider.lookupClient(oauthReq.clientId);
      // Double-submit CSRF: random token goes into both a cookie and a
      // hidden form field; POST requires them to match.
      const csrfToken = crypto.randomUUID();
      const body = consentPage({
        clientName: client?.clientName?.trim() || oauthReq.clientId || "Unknown MCP client",
        scopes: oauthReq.scope,
        csrfToken,
        formAction: `/authorize${url.search}`,
        redirectDestination: oauthReq.redirectUri
      });
      return new Response(body, {
        headers: {
          ...CONSENT_HEADERS,
          "set-cookie": setCookie(CONSENT_CSRF_COOKIE, csrfToken, CONSENT_CSRF_TTL_SECONDS)
        }
      });
    }

    if (url.pathname === "/authorize" && request.method === "POST") {
      // Re-parsed (and re-validated) before the form is read or any state is
      // parked, so an error redirect here still carries no consent decision.
      const resolved = await resolveAuthRequest(provider, request);
      if (!resolved.ok) return resolved.response;
      const oauthReq = resolved.request;

      const form = await request.formData();
      const fromForm = form.get("csrf_token");
      const fromCookie = readCookie(request, CONSENT_CSRF_COOKIE);
      if (typeof fromForm !== "string" || !fromCookie || fromForm !== fromCookie) {
        return retryConsent("CSRF token mismatch", url);
      }

      const decisions = form.getAll("decision");
      if (decisions.length === 1 && decisions[0] === "deny") {
        return authorizationErrorResponse(
          new AuthorizationError("access_denied", {
            description: "The user denied the authorization request.",
            redirectUri: oauthReq.redirectUri,
            state: oauthReq.state || undefined,
            issuer: oauthReq.issuer
          }),
          { "set-cookie": clearCookie(CONSENT_CSRF_COOKIE) }
        );
      }
      // An unknown or duplicate decision must not fall through as approval.
      if (decisions.length !== 0) {
        return retryConsent("Invalid consent decision", url);
      }

      // Native form validation helps the browser user. The server still owns
      // the enforcement boundary: no acknowledgement means no grant.
      if (!form.get("tos_agree")) {
        return retryConsent("Terms acknowledgement required", url);
      }

      // Park the parsed request for /callback; the binding secret ties the
      // WorkOS round trip to this browser.
      const state = crypto.randomUUID();
      const binding = crypto.randomUUID();
      await env.OAUTH_KV.put(
        `login:${state}`,
        JSON.stringify({ type: "mcp", oauthReq, binding } satisfies ParkedLogin),
        { expirationTtl: LOGIN_STATE_TTL_SECONDS }
      );

      const headers = new Headers({ location: workosAuthorizeUrl(env, url.origin, state) });
      headers.append("set-cookie", setCookie(STATE_BINDING_COOKIE, binding, LOGIN_STATE_TTL_SECONDS));
      headers.append("set-cookie", clearCookie(CONSENT_CSRF_COOKIE));
      return new Response(null, { status: 302, headers });
    }

    if (url.pathname === "/callback" && request.method === "GET") {
      return completeCallback(request, env, provider, url);
    }

    return Response.json(
      { error: "not found", hint: "MCP endpoint is POST /mcp (OAuth or named API key required)" },
      { status: 404 }
    );
  }
} satisfies ExportedHandler<Env>;

async function completeCallback(
  request: Request,
  env: Env,
  provider: OAuthHelpers,
  url: URL
): Promise<Response> {
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state) return text("Missing code/state", 400);

  const stored = await env.OAUTH_KV.get(`login:${state}`);
  if (!stored) {
    return text("Invalid or expired state", 400, { "set-cookie": clearCookie(STATE_BINDING_COOKIE) });
  }
  // Single-use: delete the parked state before validation and the code
  // exchange, in every branch — even a malformed value is consumed.
  await env.OAUTH_KV.delete(`login:${state}`);
  const parked = parseParkedLogin(stored);
  if (!parked) {
    return text("Invalid login state", 400, { "set-cookie": clearCookie(STATE_BINDING_COOKIE) });
  }
  const presented = readCookie(request, STATE_BINDING_COOKIE);
  if (!presented || presented !== parked.binding) {
    return text("State binding mismatch", 400, { "set-cookie": clearCookie(STATE_BINDING_COOKIE) });
  }
  // A request parked before a callback-policy change must not complete with a
  // URI the policy now refuses. Checked after the state and binding checks, so
  // state is already consumed and the cookie is cleared, and before the WorkOS
  // code exchange, so a refusal makes no upstream call.
  if (parked.type === "mcp" && !hasAllowedRedirectTransport(parked.oauthReq.redirectUri)) {
    return refusedRedirectResponse(parked.oauthReq.redirectUri, {
      "set-cookie": clearCookie(STATE_BINDING_COOKIE)
    });
  }

  const workosResponse = await fetch(WORKOS_AUTHENTICATE_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(workosAuthenticateBody(env, code))
  });
  if (!workosResponse.ok) {
    // Status only — never log the body (may echo request fields).
    console.warn(`WorkOS authenticate failed: HTTP ${workosResponse.status}`);
    return text("WorkOS authentication failed", 502, { "set-cookie": clearCookie(STATE_BINDING_COOKIE) });
  }
  const auth = (await workosResponse.json()) as WorkOSAuthenticateResponse;
  const workosUserId = auth.user?.id;
  if (!workosUserId) {
    console.warn("WorkOS authenticate response missing user id");
    return text("WorkOS authentication failed", 502, { "set-cookie": clearCookie(STATE_BINDING_COOKIE) });
  }

  // WorkOS token dropped here; only the peppered subject hash moves forward.
  const subject = await deriveSubject(workosUserId, env.MCP_SERVER_SECRET);

  if (parked.type === "demo") {
    // Use a same-origin meta-refresh interstitial instead of a 302: browsers withhold
    // SameSite=Strict cookies across a cross-site-initiated redirect chain (WorkOS -> /callback).
    // `returnTo` is allowlisted in parseDemoParkedState.
    const headers = new Headers({
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "referrer-policy": "no-referrer",
      "content-security-policy": "default-src 'none'; base-uri 'none'"
    });
    headers.append("set-cookie", await mintDemoCookie(env.MCP_SERVER_SECRET, subject));
    headers.append("set-cookie", clearCookie(STATE_BINDING_COOKIE));
    return new Response(demoSignedInInterstitial(parked.returnTo), { headers });
  }

  const scopes = parked.oauthReq.scope ?? [];
  const { redirectTo } = await provider.completeAuthorization({
    request: parked.oauthReq,
    userId: subject,
    scope: scopes,
    metadata: { via: "workos-authkit" },
    props: { subject, scopes, clientId: parked.oauthReq.clientId }
  });

  return new Response(null, {
    status: 302,
    headers: { location: redirectTo, "set-cookie": clearCookie(STATE_BINDING_COOKIE) }
  });
}

/** Strict parse of `login:${state}`; delegates demo returnTo allowlisting to parseDemoParkedState. */
function parseParkedLogin(raw: string): ParkedLogin | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof parsed !== "object" || parsed === null) return null;
  const { type, binding } = parsed as { type?: unknown; binding?: unknown };
  if (typeof binding !== "string" || binding.length === 0) return null;
  if (type === "mcp") {
    const { oauthReq } = parsed as { oauthReq?: unknown };
    if (typeof oauthReq !== "object" || oauthReq === null) return null;
    return { type: "mcp", oauthReq: oauthReq as AuthRequest, binding };
  }
  if (type === "demo") {
    const demo = parseDemoParkedState(raw);
    if (!demo) return null;
    return { type: "demo", binding, returnTo: demo.returnTo };
  }
  return null;
}

/** Unstyled on purpose: CSP is `default-src 'none'`; meta-refresh and link are navigations. */
function demoSignedInInterstitial(returnTo: string): string {
  return (
    "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\">" +
    `<meta http-equiv="refresh" content="0;url=${returnTo}">` +
    "<title>Signed in</title></head><body>" +
    `<p>Signed in — <a href="${returnTo}">continue to the playground</a>.</p>` +
    "</body></html>"
  );
}

/** The WorkOS AuthKit hop — one URL shape for both the MCP and demo flows. */
function workosAuthorizeUrl(
  env: Pick<Env, "WORKOS_CLIENT_ID">,
  origin: string,
  state: string
): string {
  const authorize = new URL(WORKOS_AUTHORIZE_URL);
  authorize.searchParams.set("response_type", "code");
  authorize.searchParams.set("client_id", env.WORKOS_CLIENT_ID);
  authorize.searchParams.set("redirect_uri", `${origin}/callback`);
  authorize.searchParams.set("provider", "authkit");
  authorize.searchParams.set("state", state);
  return authorize.toString();
}

/** GET /playground/login: parks a demo login state and redirects to WorkOS AuthKit. */
export async function demoLoginRedirect(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const state = crypto.randomUUID();
  const binding = crypto.randomUUID();
  await env.OAUTH_KV.put(
    `login:${state}`,
    JSON.stringify({ type: "demo", binding, returnTo: "/playground" } satisfies ParkedLogin),
    { expirationTtl: LOGIN_STATE_TTL_SECONDS }
  );
  const headers = new Headers({
    location: workosAuthorizeUrl(env, url.origin, state),
    "cache-control": "no-store"
  });
  headers.append("set-cookie", setCookie(STATE_BINDING_COOKIE, binding, LOGIN_STATE_TTL_SECONDS));
  return new Response(null, { status: 302, headers });
}

/**
 * Body for POST /user_management/authenticate — pure so tests can assert the
 * exact WorkOS contract without a network. client_secret is the WorkOS API
 * key (that's WorkOS's naming, not ours).
 */
export function workosAuthenticateBody(
  env: Pick<Env, "WORKOS_CLIENT_ID" | "WORKOS_API_KEY">,
  code: string
): Record<string, string> {
  return {
    client_id: env.WORKOS_CLIENT_ID,
    client_secret: env.WORKOS_API_KEY,
    grant_type: "authorization_code",
    code
  };
}

/** Stable pseudonymous user id: hex(SHA-256(`${workosUserId}:${serverSecret}`)). */
export function deriveSubject(workosUserId: string, serverSecret: string): Promise<string> {
  // A missing secret would pepper every subject with the literal "undefined"
  // (silent pepper loss → trivially reversible pseudonyms). Fail loudly instead.
  if (!serverSecret) {
    throw new Error("MCP_SERVER_SECRET is unset — cannot derive a peppered subject");
  }
  return sha256Hex(`${workosUserId}:${serverSecret}`);
}

async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Either a validated request, or the response to send instead. */
type ResolvedAuthRequest =
  | { ok: true; request: AuthRequest }
  | { ok: false; response: Response };

/**
 * Validate `/authorize` and enforce S256 PKCE for all clients (including confidential
 * ones, which the provider otherwise allows without PKCE). Throwing with already-validated
 * `parsed` fields preserves safe redirect error delivery; unvalidated client/redirect errors
 * stay local 400s.
 */
async function resolveAuthRequest(
  provider: OAuthHelpers,
  request: Request
): Promise<ResolvedAuthRequest> {
  try {
    const parsed = await provider.parseAuthRequest(request);
    if (!hasAllowedRedirectTransport(parsed.redirectUri)) {
      return { ok: false, response: refusedRedirectResponse(parsed.redirectUri) };
    }
    if (!parsed.codeChallenge || parsed.codeChallengeMethod !== "S256") {
      throw new AuthorizationError("invalid_request", {
        description: "PKCE is required: send code_challenge with code_challenge_method=S256.",
        redirectUri: parsed.redirectUri,
        state: parsed.state || undefined,
        issuer: parsed.issuer
      });
    }
    return { ok: true, request: parsed };
  } catch (error) {
    return { ok: false, response: authorizationErrorResponse(error) };
  }
}

/**
 * Uses 303 (never 302/307) so POST failures cannot replay the consent form body (including
 * `csrf_token`) to the client redirect URI. Includes `iss` per RFC 9207 §2. Logs `error.code`
 * only, never `error.description` (which can interpolate request values).
 */
function authorizationErrorResponse(
  error: unknown,
  headers: Record<string, string> = {}
): Response {
  if (!(error instanceof AuthorizationError) || !error.redirectUri) {
    return text("Invalid authorization request", 400, headers, unredirectableReason(error));
  }
  if (!hasAllowedRedirectTransport(error.redirectUri)) {
    return refusedRedirectResponse(error.redirectUri, headers);
  }
  const target = new URL(error.redirectUri);
  target.searchParams.set("error", error.code);
  if (error.description) target.searchParams.set("error_description", error.description);
  if (error.state) target.searchParams.set("state", error.state);
  if (error.issuer) target.searchParams.set("iss", error.issuer);
  logEvent("auth_reject", { status: 303, reason: error.code });
  return new Response(null, {
    status: 303,
    headers: { location: target.toString(), "cache-control": "no-store", ...headers }
  });
}

/**
 * A callback the transport allowlist refuses (src/auth/redirects.ts): a local
 * 400 with no Location, so nothing is redirected to it and no WorkOS hop
 * starts. The log carries a bounded scheme token, never the URI, so a new
 * native client's scheme shows up in `auth_reject`.
 */
function refusedRedirectResponse(redirectUri: string, headers: Record<string, string> = {}): Response {
  return text("Invalid authorization request", 400, headers, `redirect_refused:${redirectSchemeToken(redirectUri)}`);
}

/**
 * Unredirectable failures share one client response. Log a developer-authored
 * code or class name to distinguish them without recording attacker text.
 */
function unredirectableReason(error: unknown): string {
  if (error instanceof AuthorizationError) return `unredirectable:${error.code}`;
  if (error instanceof Error) return `unredirectable:${error.name}`;
  return "unredirectable:unknown";
}

function readCookie(request: Request, name: string): string | null {
  for (const part of (request.headers.get("cookie") ?? "").split(";")) {
    const trimmed = part.trim();
    if (trimmed.startsWith(`${name}=`)) return trimmed.slice(name.length + 1);
  }
  return null;
}

function setCookie(name: string, value: string, ttlSeconds: number): string {
  return `${name}=${value}; ${COOKIE_ATTRS}; Max-Age=${ttlSeconds}`;
}

function clearCookie(name: string): string {
  return `${name}=; ${COOKIE_ATTRS}; Max-Age=0`;
}

/**
 * Recoverable consent failure: 303 back to GET `/authorize` to re-render with a fresh
 * CSRF token. `url.search` is safe to echo because `parseAuthRequest` already validated it.
 */
function retryConsent(reason: string, url: URL): Response {
  logEvent("auth_reject", { status: 303, reason });
  return new Response(null, {
    status: 303,
    headers: { location: `/authorize${url.search}`, "cache-control": "no-store" }
  });
}

/**
 * Log each rejection at the response boundary. `body` and `reason` contain
 * developer-authored constants, never request or provider text.
 */
function text(
  body: string,
  status: number,
  headers: Record<string, string> = {},
  reason: string = body
): Response {
  logEvent("auth_reject", { status, reason });
  return new Response(body, {
    status,
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store", ...headers }
  });
}

// Decoded once per isolate (the ~200KB base64 is a module constant): undefined
// = not yet decoded, null = no image bundled, else the PNG bytes.
let ogPngBytes: Uint8Array | null | undefined;

/** Serve the social-preview image (base64 PNG in ../og). 404 until generated. */
function ogImageResponse(): Response {
  if (ogPngBytes === undefined) {
    ogPngBytes = OG_PNG_BASE64
      ? Uint8Array.from(atob(OG_PNG_BASE64), (c) => c.charCodeAt(0))
      : null;
  }
  if (!ogPngBytes) return text("not found", 404);
  return new Response(ogPngBytes, {
    headers: { "content-type": "image/png", "cache-control": "public, max-age=86400" }
  });
}
