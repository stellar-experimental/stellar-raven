/**
 * WorkOS AuthKit handler — the OAuthProvider `defaultHandler`
 * (research/auth-workos.md).
 *
 * This server IS its own OAuth 2.1 authorization server:
 * @cloudflare/workers-oauth-provider implements /token, /register, PKCE, and
 * opaque-token storage in OAUTH_KV. WorkOS is only the upstream IdP that
 * authenticates the human — MCP clients never talk to WorkOS. No WorkOS SDK:
 * the whole hop is a redirect to /user_management/authorize plus one POST to
 * /user_management/authenticate.
 *
 * Identity hygiene (prior art ADR-0016 lesson): the WorkOS access token is
 * dropped right after the code exchange — never stored, never in props. The
 * only human identity that moves forward is `subject`, a peppered hash of
 * the WorkOS user id (colon-free hex; the provider's opaque tokens use `:`
 * as a separator, so the userId must not contain one). The OAuth client id
 * also rides in encrypted props for privacy-safe per-client observability.
 *
 * Confused-deputy defences (we are an OAuth proxy — server to the MCP
 * client, client to WorkOS):
 *  1. Consent page — GET /authorize NAMES the requesting client and its
 *     scopes; only the explicit POST approval parks state and redirects to
 *     WorkOS, so cached WorkOS consent can't be ridden silently.
 *  2. Double-submit CSRF cookie on the consent form itself.
 *  3. Browser-binding cookie for the WorkOS round trip — /callback requires
 *     the cookie to match the value parked in KV alongside the state.
 *
 * `redirect_uri` is always `${origin}/callback` (origin-derived, no env
 * switch) so one code path serves local wrangler dev and production.
 *
 * Pure module: no cloudflare:workers import (type-only provider imports) —
 * unit-testable under plain Node (test/auth.test.ts).
 */
import { AuthorizationError } from "@cloudflare/workers-oauth-provider";
import type { AuthRequest, OAuthHelpers } from "@cloudflare/workers-oauth-provider";
import {
  CONSENT_HEADERS,
  LANDING_HEADERS,
  ROBOTS_HEADERS,
  SITEMAP_HEADERS,
  TERMS_HEADERS,
  consentPage,
  landingPage,
  robotsTxt,
  sitemapXml,
  termsPage
} from "../site";
import { OG_PNG_BASE64 } from "../og";
import { logEvent } from "../observability.ts";
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
 * Parked /authorize requests expire from OAUTH_KV after 10 minutes, and the
 * browser-binding cookie rides the same clock. Deliberately NOT raised
 * alongside the consent window below: a parked state carries a login-DoS
 * surface the consent cookie does not. `login:${state}` is read and deleted
 * non-atomically over eventually-consistent KV, and /callback consumes the
 * entry BEFORE it validates the binding cookie — so anyone holding a leaked
 * state value can burn the victim's parked login with `?code=junk&state=...`.
 * They cannot complete a grant (the binding cookie stops that), but they can
 * destroy one, and a longer TTL only widens that window. WorkOS's own code
 * lifetime starts when a code is ISSUED, so it does not cap this leg.
 */
export const LOGIN_STATE_TTL_SECONDS = 10 * 60;

/**
 * The consent page is a HUMAN dwell window, not an automated round trip: the
 * page asks the user to read two legal documents that it opens in new tabs.
 * The double-submit token has no server-side state tied to it and cannot
 * approve a stale registration — POST re-parses the query and the provider
 * re-validates client and redirect_uri on both the POST and at
 * completeAuthorization — so a longer window costs only a longer-lived
 * approval capability on a shared profile. Separate clock, separate reason.
 */
export const CONSENT_CSRF_TTL_SECONDS = 30 * 60;

/** Consent-form double-submit CSRF cookie (GET sets, POST validates + clears). */
const CONSENT_CSRF_COOKIE = "__Host-MCP_CONSENT_CSRF";
/** Browser-binding cookie for the WorkOS round trip (POST sets, /callback validates + clears). */
const STATE_BINDING_COOKIE = "__Host-MCP_STATE";
const COOKIE_ATTRS = "HttpOnly; Secure; Path=/; SameSite=Lax";

/**
 * Shape parked in KV under `login:${state}` — a validated discriminated
 * union. The callback must never treat unknown JSON as an MCP flow. Both
 * branches carry the browser-binding
 * cookie secret; the demo branch redirects only to fixed same-origin paths
 * (enforced by parseDemoParkedState in src/demo/auth.ts).
 */
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
        formAction: `/authorize${url.search}`
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

      // Explicit Terms/Privacy acknowledgement: the consent form's checkbox
      // (name="tos_agree") only submits when ticked. The CSS gate on the
      // button is UX and mouse-only — `pointer-events: none` does not stop a
      // keyboard submit — so this is the enforcement boundary: no ack, no grant.
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
    // Browser session, not an OAuth grant: signed cookie + a same-origin
    // interstitial instead of a 302. The whole navigation chain here was
    // initiated cross-site (WorkOS → /callback), and browsers withhold
    // SameSite=Strict cookies on every request in a cross-site-initiated
    // redirect chain — a direct 302 to /playground would land on the locked page.
    // The meta-refresh below starts a FRESH navigation initiated by this
    // same-origin document, so the Strict cookie is sent. returnTo is
    // allowlisted to fixed paths at parse time (parseDemoParkedState), so
    // it is safe to interpolate. No completeAuthorization.
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

/**
 * Strict parse of the parked login-state union. Unknown/malformed shapes →
 * null (callback answers 400); a raw pre-union value (no `type`) is malformed
 * too — forward-only, no compat parsing. The demo branch delegates to
 * parseDemoParkedState so the returnTo allowlist lives in one place.
 */
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

/**
 * Minimal same-origin hop for the /callback demo branch (see comment at the
 * call site). Deliberately unstyled — the CSP above is `default-src 'none'`;
 * meta-refresh and the fallback link are navigations, not resource loads.
 */
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

/**
 * GET /playground/login (routed in src/server.ts) — parks the demo branch of the
 * login union under the SAME `login:${state}` key scheme and TTL as the MCP
 * flow, sets the same browser-binding cookie, and redirects to WorkOS
 * AuthKit with the shared `${origin}/callback` redirect_uri.
 */
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
 * Both /authorize legs resolve the request through here, so this owns two
 * things: enforcing our PKCE posture, and turning a failure into the RIGHT
 * kind of refusal.
 *
 * The provider (>=0.10.1) already gets the hard part right. `parseAuthRequest`
 * throws a bare `AuthorizationError` for a missing/unknown `client_id` or an
 * unregistered `redirect_uri` — the cases where redirecting would BE the
 * vulnerability — and only after validating the redirect URI does it attach
 * `redirectUri`/`state`/`issuer` to subsequent errors. A populated
 * `redirectUri` is the documented signal that redirecting is safe
 * ("Present only after client and redirect validation").
 *
 * Our own rule is stricter than upstream on purpose: 0.10.1 requires PKCE of
 * PUBLIC clients, and rejects a method without a challenge, but still lets a
 * CONFIDENTIAL client skip PKCE entirely. MCP (2025-11-25) requires S256 of
 * clients, so we require it of all of them. Raising it as an
 * `AuthorizationError` built from the ALREADY-VALIDATED `parsed` fields — never
 * from raw query values — gets it the same spec-correct delivery.
 */
async function resolveAuthRequest(
  provider: OAuthHelpers,
  request: Request
): Promise<ResolvedAuthRequest> {
  try {
    const parsed = await provider.parseAuthRequest(request);
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
 * 303, never 302: a 302 only *permits* the user agent to rewrite the method, so
 * on the POST leg it can replay the consent form body — csrf_token included —
 * to the client's redirect URI. 303 names a retrieval request (RFC 9110
 * §15.4.4). 307 would be strictly wrong for the same reason.
 *
 * `iss` goes on error responses too: the provider advertises RFC 9207 support,
 * and §2 requires the parameter on error responses for servers that do, so
 * omitting it makes conforming clients reject the response.
 *
 * The log records `error.code`, not `error.description` — descriptions
 * interpolate request-supplied values upstream, and a log field is the wrong
 * place for attacker-chosen text. The description still goes to the client,
 * percent-encoded by URLSearchParams, which is what it is for.
 */
function authorizationErrorResponse(error: unknown): Response {
  if (!(error instanceof AuthorizationError) || !error.redirectUri) {
    return text("Invalid authorization request", 400, {}, unredirectableReason(error));
  }
  const target = new URL(error.redirectUri);
  target.searchParams.set("error", error.code);
  if (error.description) target.searchParams.set("error_description", error.description);
  if (error.state) target.searchParams.set("state", error.state);
  if (error.issuer) target.searchParams.set("iss", error.issuer);
  logEvent("auth_reject", { status: 303, reason: error.code });
  return new Response(null, {
    status: 303,
    headers: { location: target.toString(), "cache-control": "no-store" }
  });
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
 * Recoverable consent failure: log the real reason, then send the browser back
 * to its own form action so the GET handler above mints a fresh token and
 * cookie and re-renders the consent page.
 *
 * 303 (not 302) so the redirect is unambiguously a GET. `url.search` is safe to
 * echo: parseAuthRequest already validated it on this request, and nothing has
 * been granted or parked yet. The GET replaces the prior CSRF cookie.
 *
 * Known ceiling: a browser that refuses the cookie loops consent→consent rather
 * than dead-ending. It could never have completed the flow either way, and a
 * live page beats a 400.
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
