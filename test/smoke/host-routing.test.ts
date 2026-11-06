import { createExecutionContext, env, SELF, waitOnExecutionContext } from "cloudflare:test";
import { OAuthProvider, getOAuthApi } from "@cloudflare/workers-oauth-provider";
import { afterEach, describe, expect, it, vi } from "vitest";
import worker from "../../src/server";
import { oauthProviderOptions } from "../../src/auth/gate";

const CANONICAL = "https://raven.stellar.org";
// Deliberately independent of hosts.ts: dropping an alias must fail these tests.
const ALIASES = ["https://raven.stellar.buzz", "https://agents.stellar.buzz"];
const REDIRECT_URI = "https://client.example/callback";
const VERIFIER = "v".repeat(43);
type Tokens = { access_token: string; refresh_token: string; resource?: string };

// Exercise the assembled worker with explicit test-only secrets, independent of
// .dev.vars. SELF below also verifies the configured entry point's dispatch.
function testEnv(): Env {
  return {
    ...env,
    MCP_SERVER_SECRET: "host-routing-test-secret",
    WORKOS_CLIENT_ID: "client_host_routing_test",
    WORKOS_API_KEY: "host-routing-test-key"
  } as Env; // The provider injects OAUTH_PROVIDER before invoking its handlers.
}

async function dispatch(request: Request, bindings: Env): Promise<Response> {
  const ctx = createExecutionContext();
  const response = await worker.fetch(request as Request<unknown, IncomingRequestCfProperties>, bindings, ctx);
  await waitOnExecutionContext(ctx);
  return response;
}

function tokenRequest(origin: string, params: Record<string, string>): Request {
  return new Request(`${origin}/token`, {
    method: "POST",
    body: new URLSearchParams(params),
    redirect: "manual"
  });
}

async function authorizationRequest(origin: string, clientId: string, includeResource = true): Promise<Request> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(VERIFIER));
  const challenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
  return new Request(`${origin}/authorize?${new URLSearchParams({
    response_type: "code", client_id: clientId, redirect_uri: REDIRECT_URI,
    scope: "mcp", state: "host-routing-client-state",
    ...(includeResource ? { resource: `${origin}/mcp` } : {}),
    code_challenge: challenge, code_challenge_method: "S256"
  })}`, { redirect: "manual" });
}

async function initialize(origin: string, accessToken: string, bindings: Env): Promise<void> {
  const response = await dispatch(new Request(`${origin}/mcp`, {
    method: "POST", redirect: "manual",
    headers: {
      authorization: `Bearer ${accessToken}`, origin,
      "content-type": "application/json", accept: "application/json, text/event-stream"
    },
    body: JSON.stringify({
      jsonrpc: "2.0", id: 1, method: "initialize",
      params: {
        protocolVersion: "2025-06-18", capabilities: {},
        clientInfo: { name: "host-routing-test", version: "1" }
      }
    })
  }), bindings);
  expect(response.status).toBe(200);
  expect(response.headers.get("location")).toBeNull();
  expect(await response.text()).toContain('"name":"stellar-raven-codemode"');
}

function callbackCode(response: Response, origin: string): string {
  expect(response.status).toBe(302);
  const location = new URL(response.headers.get("location")!);
  expect(location.origin + location.pathname).toBe(REDIRECT_URI);
  expect(location.searchParams.get("iss")).toBe(origin);
  expect(location.searchParams.get("state")).toBe("host-routing-client-state");
  expect(location.searchParams.get("code")).toBeTruthy();
  return location.searchParams.get("code")!;
}

afterEach(() => vi.unstubAllGlobals());

describe.each(ALIASES)("legacy host %s", (origin) => {
  it("redirects browser pages safely and preserves method and query", async () => {
    for (const path of ["/", "/docs", "/terms?x=1", "/playground", "/health", "//evil.example/mcp?x=1"]) {
      const response = await SELF.fetch(`${origin}${path}`, { redirect: "manual" });
      expect(response.status).toBe(308);
      expect(response.headers.get("location")).toBe(`${CANONICAL}${path}`);
    }
    const post = await SELF.fetch(`${origin}/playground/chat`, { method: "POST", redirect: "manual" });
    expect(post.status).toBe(308);
    expect(post.headers.get("location")).toBe(`${CANONICAL}/playground/chat`);
  });

  it("challenges unauthenticated MCP on its original resource origin", async () => {
    for (const path of ["/mcp", "/mcp/", "/mcp/nested"]) {
      const response = await SELF.fetch(`${origin}${path}`, { method: "POST", redirect: "manual" });
      expect(response.status).toBe(401);
      expect(response.headers.get("location")).toBeNull();
      expect(response.headers.get("www-authenticate")).toContain(`${origin}/.well-known/oauth-protected-resource`);
    }
  });

  it("serves discovery aliases without changing issuer or endpoint origins", async () => {
    for (const path of [
      "/.well-known/oauth-authorization-server", "/.well-known/oauth-authorization-server/mcp",
      "/.well-known/openid-configuration", "/.well-known/openid-configuration/mcp"
    ]) {
      const response = await SELF.fetch(`${origin}${path}`, { redirect: "manual" });
      expect(response.status).toBe(200);
      expect(await response.json()).toMatchObject({
        issuer: origin, authorization_endpoint: `${origin}/authorize`,
        token_endpoint: `${origin}/token`, registration_endpoint: `${origin}/register`
      });
    }
    for (const suffix of ["", "/mcp"]) {
      const response = await SELF.fetch(`${origin}/.well-known/oauth-protected-resource${suffix}`, { redirect: "manual" });
      expect(response.status).toBe(200);
      expect(await response.json()).toMatchObject({ resource: `${origin}${suffix}`, authorization_servers: [origin] });
    }
  });

  it("accepts named API keys on the alias MCP endpoint", async () => {
    const token = "h".repeat(43);
    const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token)));
    await env.OAUTH_KV.put("raven:api-key:v1:host-test", [...digest].map((byte) => byte.toString(16).padStart(2, "0")).join(""));
    await initialize(origin, `host-test:${token}`, testEnv());
  });

  it.each([true, false])("accepts existing bearer and refresh grants without re-registration (explicit resource: %s)", async (includeResource) => {
    const bindings = testEnv();
    // Mint through the unchanged provider directly, as before host redirects
    // existed. No call to the restored router creates this client or grant.
    const options = oauthProviderOptions({ fetch: () => new Response("unused") });
    const provider = new OAuthProvider(options);
    const helpers = getOAuthApi(options, bindings);
    const client = await helpers.createClient({
      clientName: "Existing alias client", redirectUris: [REDIRECT_URI],
      grantTypes: ["authorization_code", "refresh_token"], responseTypes: ["code"],
      tokenEndpointAuthMethod: "none"
    });
    const parsed = await helpers.parseAuthRequest(await authorizationRequest(origin, client.clientId, includeResource));
    const { redirectTo } = await helpers.completeAuthorization({
      request: parsed, userId: "legacy-host-subject", scope: ["mcp"], metadata: {},
      props: { subject: "legacy-host-subject", clientId: client.clientId, scopes: ["mcp"] }
    });
    const ctx = createExecutionContext();
    const issued = await provider.fetch(tokenRequest(origin, {
      grant_type: "authorization_code", client_id: client.clientId,
      code: new URL(redirectTo).searchParams.get("code")!, code_verifier: VERIFIER,
      redirect_uri: REDIRECT_URI, ...(includeResource ? { resource: `${origin}/mcp` } : {})
    }), bindings, ctx);
    await waitOnExecutionContext(ctx);
    expect(issued.status).toBe(200);
    const tokens = await issued.json() as Tokens;
    const [subject, grantId] = tokens.refresh_token.split(":");
    const grantKey = `grant:${subject}:${grantId}`;
    const originalGrant = await bindings.OAUTH_KV.get<{ expiresAt: number }>(grantKey, "json");
    expect(originalGrant?.expiresAt).toBeGreaterThan(Date.now() / 1000);
    // Model a grant issued a day ago so extending it during refresh fails even
    // when all requests execute in the same second.
    const existingGrant = { ...originalGrant, expiresAt: originalGrant!.expiresAt - 86400 };
    await bindings.OAUTH_KV.put(grantKey, JSON.stringify(existingGrant));
    await initialize(origin, tokens.access_token, bindings);

    const refreshed = await dispatch(tokenRequest(origin, {
      grant_type: "refresh_token", client_id: client.clientId,
      refresh_token: tokens.refresh_token, ...(includeResource ? { resource: `${origin}/mcp` } : {})
    }), bindings);
    expect(refreshed.status).toBe(200);
    const rotated = await refreshed.json() as Tokens;
    expect(rotated.resource).toBe(includeResource ? `${origin}/mcp` : undefined);
    expect(rotated.refresh_token).toBeTruthy();
    expect(rotated.refresh_token).not.toBe(tokens.refresh_token);
    await initialize(origin, rotated.access_token, bindings);
    const updatedGrant = await bindings.OAUTH_KV.get<{ expiresAt: number }>(grantKey, "json");
    expect(updatedGrant?.expiresAt).toBe(existingGrant.expiresAt);
  });
});

describe.each([CANONICAL, ...ALIASES])("complete OAuth flow at %s", (origin) => {
  it("keeps registration, consent, WorkOS callback, and token exchange on the configured origin", async () => {
    const bindings = testEnv();
    const upstream = vi.fn(async (input: RequestInfo | URL) => {
      expect(String(input)).toBe("https://api.workos.com/user_management/authenticate");
      return Response.json({ user: { id: "user_host_routing_test" } });
    });
    vi.stubGlobal("fetch", upstream);
    const registration = await dispatch(new Request(`${origin}/register`, {
      method: "POST", redirect: "manual", headers: { "content-type": "application/json" },
      body: JSON.stringify({
        client_name: "Alias flow client", redirect_uris: [REDIRECT_URI],
        grant_types: ["authorization_code", "refresh_token"], response_types: ["code"],
        token_endpoint_auth_method: "none"
      })
    }), bindings);
    expect(registration.status).toBe(201);
    const { client_id: clientId } = await registration.json() as { client_id: string };
    const authorize = await authorizationRequest(origin, clientId);
    const consent = await dispatch(authorize, bindings);
    expect(consent.status).toBe(200);
    const page = await consent.text();
    expect(page).toContain('action="/authorize?');
    const csrf = page.match(/name="csrf_token" value="([^"]+)"/)?.[1];
    expect(csrf).toBeTruthy();
    const consentCookie = consent.headers.get("set-cookie")!;
    expect(consentCookie).toContain(`__Host-MCP_CONSENT_CSRF=${csrf}`);
    expect(consentCookie).not.toMatch(/Domain=/i);
    const approval = await dispatch(new Request(authorize.url, {
      method: "POST", redirect: "manual", headers: { cookie: consentCookie.split(";", 1)[0]! },
      body: new URLSearchParams({ csrf_token: csrf!, tos_agree: "yes" })
    }), bindings);
    expect(approval.status).toBe(302);
    const workos = new URL(approval.headers.get("location")!);
    expect(workos.origin).toBe("https://api.workos.com");
    expect(workos.searchParams.get("redirect_uri")).toBe(`${origin}/callback`);
    const binding = approval.headers.get("set-cookie")?.match(/__Host-MCP_STATE=([^;]+)/)?.[1];
    expect(binding).toBeTruthy();
    expect(approval.headers.get("set-cookie")).not.toMatch(/Domain=/i);
    const callback = await dispatch(new Request(`${origin}/callback?${new URLSearchParams({
      code: "test-workos-code", state: workos.searchParams.get("state")!
    })}`, { redirect: "manual", headers: { cookie: `__Host-MCP_STATE=${binding}` } }), bindings);
    const code = callbackCode(callback, origin);
    expect(upstream).toHaveBeenCalledTimes(1);
    const exchanged = await dispatch(tokenRequest(origin, {
      grant_type: "authorization_code", client_id: clientId, code, code_verifier: VERIFIER,
      redirect_uri: REDIRECT_URI, resource: `${origin}/mcp`
    }), bindings);
    expect(exchanged.status).toBe(200);
    const tokens = await exchanged.json() as Tokens;
    expect(tokens.resource).toBe(`${origin}/mcp`);
    expect(tokens.refresh_token).toBeTruthy();
    await initialize(origin, tokens.access_token, bindings);
  });
});
