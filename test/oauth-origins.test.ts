/**
 * Real workers-oauth-provider 1.x built from oauthProviderOptions(), one
 * provider per served origin, over a KV fake that keeps key metadata and
 * lists (test/helpers/memory-kv.ts). Plain Node, `cloudflare:workers` stubbed.
 *
 * Covers the per-origin provider design (DESIGN.md D1), the callback
 * allowlist at registration and at authorization (D2), and the token-endpoint
 * rules this upgrade turns on (D5). src/server.ts cannot load in plain Node;
 * test/smoke/host-routing.test.ts runs the assembled dispatch in workerd.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { OAuthProvider, getOAuthApi } from "@cloudflare/workers-oauth-provider";
import { mcpResource, oauthProviderOptions } from "../src/auth/gate";
import { memoryKv } from "./helpers/memory-kv";
import type { MemoryKv } from "./helpers/memory-kv";

// Deliberately independent of hosts.ts: dropping an origin must fail these tests.
const PRODUCTION = ["https://raven.stellar.org", "https://raven.stellar.buzz", "https://agents.stellar.buzz"];
const LOOPBACK = "http://localhost:8787";
const ORIGINS = [...PRODUCTION, LOOPBACK];
const CANONICAL = PRODUCTION[0]!;
const VERIFIER = "v".repeat(43);
const HTTPS_CALLBACK = "https://client.example/callback";
const CLAUDE_CALLBACK = "claude://oauth/callback";
const CURSOR_CALLBACK = "cursor://anysphere.cursor-mcp/oauth/callback";
const WARP_CALLBACK = "warp://mcp/oauth2callback";

const mcpFetch = vi.fn(async () => new Response("mcp-ok"));

function providerOptions(origin: string) {
  return oauthProviderOptions({ fetch: mcpFetch }, mcpResource(origin));
}

function providerFor(origin: string): OAuthProvider<Env> {
  return new OAuthProvider(providerOptions(origin));
}

type TestEnv = Env & { OAUTH_KV: MemoryKv };

function testEnv(): TestEnv {
  return {
    OAUTH_KV: memoryKv(),
    WORKOS_CLIENT_ID: "client_test_123",
    WORKOS_API_KEY: "sk_test_dummy",
    MCP_SERVER_SECRET: "unit-test-pepper"
  } as unknown as TestEnv;
}

function ctx(): ExecutionContext {
  return { waitUntil() {}, passThroughOnException() {}, props: {} } as unknown as ExecutionContext;
}

/** Each dispatch gets a fresh copy with the helpers cleared, as src/server.ts does. */
function call(provider: OAuthProvider<Env>, request: Request, env: Env): Promise<Response> {
  return provider.fetch(request, { ...env, OAUTH_PROVIDER: undefined } as unknown as Env, ctx());
}

async function s256(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

async function register(
  provider: OAuthProvider<Env>,
  env: Env,
  origin: string,
  redirectUris: string[],
  extra: Record<string, unknown> = {}
): Promise<Response> {
  return call(
    provider,
    new Request(`${origin}/register`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        client_name: "Contract client",
        redirect_uris: redirectUris,
        grant_types: ["authorization_code", "refresh_token"],
        response_types: ["code"],
        token_endpoint_auth_method: "none",
        ...extra
      })
    }),
    env
  );
}

async function registered(
  provider: OAuthProvider<Env>,
  env: Env,
  origin: string,
  redirectUris: string[]
): Promise<string> {
  const response = await register(provider, env, origin, redirectUris);
  expect(response.status).toBe(201);
  return ((await response.json()) as { client_id: string }).client_id;
}

async function authorizeUrl(
  origin: string,
  clientId: string,
  redirectUri: string,
  extra: Record<string, string | undefined> = {}
): Promise<string> {
  const params: Record<string, string> = {
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "mcp",
    state: "contract-state",
    code_challenge: await s256(VERIFIER),
    code_challenge_method: "S256"
  };
  for (const [key, value] of Object.entries(extra)) {
    if (value === undefined) delete params[key];
    else params[key] = value;
  }
  return `${origin}/authorize?${new URLSearchParams(params)}`;
}

/** The consent POST: needs the CSRF cookie and field the GET minted. */
async function consentPost(
  provider: OAuthProvider<Env>,
  env: Env,
  url: string
): Promise<Response> {
  const consent = await call(provider, new Request(url), env);
  expect(consent.status).toBe(200);
  const csrf = (await consent.text()).match(/name="csrf_token" value="([^"]+)"/)?.[1];
  expect(csrf).toBeTruthy();
  return call(
    provider,
    new Request(url, {
      method: "POST",
      redirect: "manual",
      headers: { cookie: `__Host-MCP_CONSENT_CSRF=${csrf}` },
      body: new URLSearchParams({ csrf_token: csrf!, tos_agree: "yes" })
    }),
    env
  );
}

/** Mint a code through the provider's own helpers, as the WorkOS callback does. */
async function mintTokens(
  provider: OAuthProvider<Env>,
  env: Env,
  origin: string,
  clientId: string,
  redirectUri: string,
  options: { resource?: string; userId?: string; tokenResource?: string } = {}
): Promise<{ access_token: string; refresh_token: string; resource?: string }> {
  const helpers = getOAuthApi(providerOptions(origin), env);
  const parsed = await helpers.parseAuthRequest(
    new Request(await authorizeUrl(origin, clientId, redirectUri, { resource: options.resource }))
  );
  const { redirectTo } = await helpers.completeAuthorization({
    request: parsed,
    userId: options.userId ?? "contract-user",
    scope: ["mcp"],
    metadata: {},
    props: { subject: options.userId ?? "contract-user", clientId, scopes: ["mcp"] }
  });
  const response = await call(
    provider,
    new Request(`${origin}/token`, {
      method: "POST",
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: clientId,
        code: new URL(redirectTo).searchParams.get("code")!,
        code_verifier: VERIFIER,
        redirect_uri: redirectUri,
        ...(options.tokenResource ? { resource: options.tokenResource } : {})
      })
    }),
    env
  );
  expect(response.status).toBe(200);
  return response.json();
}

afterEach(() => {
  vi.unstubAllGlobals();
  mcpFetch.mockClear();
});

// ---------------------------------------------------------------------------
// D1: one provider per origin

describe.each(ORIGINS)("provider for %s", (origin) => {
  const provider = providerFor(origin);

  it("serves its own issuer, endpoints and one protected resource", async () => {
    const env = testEnv();
    const server = await call(provider, new Request(`${origin}/.well-known/oauth-authorization-server`), env);
    expect(server.status).toBe(200);
    expect(await server.json()).toMatchObject({
      issuer: origin,
      authorization_endpoint: `${origin}/authorize`,
      token_endpoint: `${origin}/token`,
      registration_endpoint: `${origin}/register`,
      scopes_supported: ["mcp"],
      code_challenge_methods_supported: ["S256"]
    });
    const resource = await call(provider, new Request(`${origin}/.well-known/oauth-protected-resource/mcp`), env);
    expect(resource.status).toBe(200);
    expect(await resource.json()).toMatchObject({
      resource: `${origin}/mcp`,
      authorization_servers: [origin],
      scopes_supported: ["mcp"],
      resource_name: "stellar-raven-codemode MCP"
    });
  });

  it("no longer serves the bare-origin protected-resource document", async () => {
    const response = await call(provider, new Request(`${origin}/.well-known/oauth-protected-resource`), testEnv());
    expect(response.status).toBe(404);
  });

  it.each(["/mcp", "/mcp/", "/mcp/nested"])("challenges an unauthenticated %s with its own metadata and scope", async (path) => {
    const response = await call(provider, new Request(`${origin}${path}`, { method: "POST" }), testEnv());
    expect(response.status).toBe(401);
    const challenge = response.headers.get("www-authenticate") ?? "";
    expect(challenge).toContain(`resource_metadata="${origin}/.well-known/oauth-protected-resource/mcp"`);
    expect(challenge).toContain('scope="mcp"');
    expect(mcpFetch).not.toHaveBeenCalled();
  });

  it("refuses a bare-origin resource indicator with a redirected invalid_target", async () => {
    const env = testEnv();
    const clientId = await registered(provider, env, origin, [HTTPS_CALLBACK]);
    const response = await call(
      provider,
      new Request(await authorizeUrl(origin, clientId, HTTPS_CALLBACK, { resource: origin }), { redirect: "manual" }),
      env
    );
    expect(response.status).toBe(303);
    const location = new URL(response.headers.get("location")!);
    expect(location.origin + location.pathname).toBe(HTTPS_CALLBACK);
    expect(location.searchParams.get("error")).toBe("invalid_target");
  });

  it.each([
    ["an explicit resource", true],
    ["an omitted resource", false]
  ])("binds a grant to its own /mcp resource with %s", async (_label, explicit) => {
    const env = testEnv();
    const clientId = await registered(provider, env, origin, [HTTPS_CALLBACK]);
    const tokens = await mintTokens(provider, env, origin, clientId, HTTPS_CALLBACK, {
      resource: explicit ? `${origin}/mcp` : undefined,
      tokenResource: explicit ? `${origin}/mcp` : undefined
    });
    // 1.x always reports the resource, even when the client sent none.
    expect(tokens.resource).toBe(`${origin}/mcp`);
    const [userId, grantId] = tokens.refresh_token.split(":");
    const grant = JSON.parse(env.OAUTH_KV.store.get(`grant:${userId}:${grantId}`)!);
    expect(grant.resource).toBe(`${origin}/mcp`);
    const api = await call(
      provider,
      new Request(`${origin}/mcp`, { method: "POST", headers: { authorization: `Bearer ${tokens.access_token}` } }),
      env
    );
    expect(api.status).toBe(200);
  });
});

describe("tokens and grants stay on their own origin", () => {
  it("rejects a bound access token and refresh token on another origin, and keeps the grant usable at home", async () => {
    const env = testEnv();
    const home = providerFor(PRODUCTION[0]!);
    const clientId = await registered(home, env, PRODUCTION[0]!, [HTTPS_CALLBACK]);
    const tokens = await mintTokens(home, env, PRODUCTION[0]!, clientId, HTTPS_CALLBACK);
    for (const other of [PRODUCTION[1]!, PRODUCTION[2]!, LOOPBACK]) {
      const away = providerFor(other);
      const access = await call(
        away,
        new Request(`${other}/mcp`, { method: "POST", headers: { authorization: `Bearer ${tokens.access_token}` } }),
        env
      );
      expect(access.status, other).toBe(401);
      const refresh = await call(
        away,
        new Request(`${other}/token`, {
          method: "POST",
          body: new URLSearchParams({ grant_type: "refresh_token", client_id: clientId, refresh_token: tokens.refresh_token })
        }),
        env
      );
      expect(refresh.status, other).toBe(400);
      expect(await refresh.json()).toMatchObject({ error: "invalid_grant" });
    }
    const back = await call(
      home,
      new Request(`${PRODUCTION[0]}/token`, {
        method: "POST",
        body: new URLSearchParams({ grant_type: "refresh_token", client_id: clientId, refresh_token: tokens.refresh_token })
      }),
      env
    );
    expect(back.status).toBe(200);
  });

  it("logs the provider's internal reason, never its description, through onError", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const provider = providerFor(CANONICAL);
    const response = await call(
      provider,
      new Request(`${CANONICAL}/mcp`, { method: "POST", headers: { authorization: "Bearer not-a-real-token" } }),
      testEnv()
    );
    expect(response.status).toBe(401);
    const events = log.mock.calls.map(([line]) => JSON.parse(String(line)));
    const logged = events.find((event) => event.evt === "oauth_error");
    expect(logged).toMatchObject({ evt: "oauth_error", status: 401 });
    expect(typeof logged.category).toBe("string");
    expect(typeof logged.reason).toBe("string");
    expect(Object.keys(logged).sort()).toEqual(["category", "code", "evt", "reason", "status"]);
    log.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// D2: callback allowlist at registration and authorization

describe("registration callback rule", () => {
  const provider = providerFor(CANONICAL);

  it.each([
    ["https only", [HTTPS_CALLBACK]],
    ["loopback only", ["http://127.0.0.1:8912/callback"]],
    ["https + loopback + cursor (Cursor's set)", [HTTPS_CALLBACK, "http://localhost:8912/callback", CURSOR_CALLBACK]],
    ["claude only", [CLAUDE_CALLBACK]],
    ["cursor only", [CURSOR_CALLBACK]],
    ["warp only", [WARP_CALLBACK]],
    ["https + an unlisted scheme", [HTTPS_CALLBACK, "smb://host/share"]]
  ])("registers %s", async (_label, uris) => {
    const response = await register(provider, testEnv(), CANONICAL, uris);
    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject({ redirect_uris: uris });
  });

  it.each([
    ["smb only", ["smb://host/share"]],
    ["ms-settings only", ["ms-settings:network"]],
    ["ftp only", ["ftp://client.example/cb"]],
    ["ws only", ["ws://localhost:8912/cb"]],
    ["a reverse-domain scheme only", ["org.example.app:/oauth/cb"]],
    ["remote http only", ["http://client.example/cb"]],
    ["https + remote http", [HTTPS_CALLBACK, "http://client.example/cb"]]
  ])("refuses %s as invalid_client_metadata and stores nothing", async (_label, uris) => {
    const env = testEnv();
    const response = await register(provider, env, CANONICAL, uris);
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: "invalid_client_metadata" });
    expect([...env.OAUTH_KV.store.keys()].some((key) => key.startsWith("client:"))).toBe(false);
  });
});

describe("callback allowlist at authorization (real provider and handler)", () => {
  const provider = providerFor(CANONICAL);

  it.each([
    ["claude", CLAUDE_CALLBACK],
    ["cursor", CURSOR_CALLBACK],
    ["warp", WARP_CALLBACK],
    ["loopback http", "http://127.0.0.1:8912/callback"]
  ])("%s: consent renders and the POST parks state and hops to WorkOS", async (_label, callback) => {
    const env = testEnv();
    const clientId = await registered(provider, env, CANONICAL, [callback]);
    const url = await authorizeUrl(CANONICAL, clientId, callback);
    const approval = await consentPost(provider, env, url);
    expect(approval.status).toBe(302);
    expect(new URL(approval.headers.get("location")!).origin).toBe("https://api.workos.com");
    expect([...env.OAUTH_KV.store.keys()].some((key) => key.startsWith("login:"))).toBe(true);
  });

  describe.each([
    ["smb", "smb://host/share"],
    ["ms-settings", "ms-settings:network"],
    ["ftp", "ftp://client.example/cb"],
    ["ws", "ws://localhost:8912/cb"],
    ["a period scheme", "org.example.app:/oauth/cb"]
  ])("a mixed registration (https + %s)", (_label, refused) => {
    async function mixed(env: Env): Promise<string> {
      return registered(provider, env, CANONICAL, [HTTPS_CALLBACK, refused]);
    }

    it("still authorizes with its https callback", async () => {
      const env = testEnv();
      const clientId = await mixed(env);
      const response = await call(provider, new Request(await authorizeUrl(CANONICAL, clientId, HTTPS_CALLBACK)), env);
      expect(response.status).toBe(200);
    });

    it.each(["GET", "POST"])("refuses the unlisted callback on the %s leg: local 400, no Location, no state", async (method) => {
      const env = testEnv();
      const clientId = await mixed(env);
      const response = await call(
        provider,
        new Request(await authorizeUrl(CANONICAL, clientId, refused), {
          method,
          redirect: "manual",
          ...(method === "POST" ? { body: new URLSearchParams({ csrf_token: "x", tos_agree: "yes" }) } : {})
        }),
        env
      );
      expect(response.status).toBe(400);
      expect(response.headers.get("location")).toBeNull();
      expect(response.headers.get("set-cookie")).toBeNull();
      expect([...env.OAUTH_KV.store.keys()].some((key) => key.startsWith("login:"))).toBe(false);
    });

    it("refuses a PKCE-less GET locally instead of the 303 error redirect", async () => {
      const env = testEnv();
      const clientId = await mixed(env);
      const response = await call(
        provider,
        new Request(
          await authorizeUrl(CANONICAL, clientId, refused, { code_challenge: undefined, code_challenge_method: undefined }),
          { redirect: "manual" }
        ),
        env
      );
      expect(response.status).toBe(400);
      expect(response.headers.get("location")).toBeNull();
    });

    it("refuses the provider-error redirect locally", async () => {
      const env = testEnv();
      const clientId = await mixed(env);
      const response = await call(
        provider,
        new Request(await authorizeUrl(CANONICAL, clientId, refused, { response_type: "token" }), { redirect: "manual" }),
        env
      );
      expect(response.status).toBe(400);
      expect(response.headers.get("location")).toBeNull();
    });
  });

  it.each([
    ["smb", "smb://host/share"],
    ["ms-settings", "ms-settings:network"],
    ["remote http", "http://client.example/callback"]
  ])("a seeded legacy registration listing %s is refused on both legs and on the error path", async (_label, legacy) => {
    const env = testEnv();
    env.OAUTH_KV.store.set(
      "client:legacy-contract",
      JSON.stringify({
        clientId: "legacy-contract",
        clientName: "Legacy client",
        redirectUris: [legacy],
        grantTypes: ["authorization_code", "refresh_token"],
        responseTypes: ["code"],
        registrationDate: Math.floor(Date.now() / 1000),
        tokenEndpointAuthMethod: "none",
        authMethodExplicit: true
      })
    );
    // The provider itself may already refuse a remote-http URI; either way the
    // response is a local 400 with no Location and no cookie.
    for (const request of [
      new Request(await authorizeUrl(CANONICAL, "legacy-contract", legacy), { redirect: "manual" }),
      new Request(await authorizeUrl(CANONICAL, "legacy-contract", legacy), {
        method: "POST",
        redirect: "manual",
        body: new URLSearchParams({ csrf_token: "x", tos_agree: "yes" })
      }),
      new Request(await authorizeUrl(CANONICAL, "legacy-contract", legacy, { response_type: "token" }), {
        redirect: "manual"
      })
    ]) {
      const response = await call(provider, request, env);
      expect(response.status).toBe(400);
      expect(response.headers.get("location")).toBeNull();
      expect(response.headers.get("set-cookie")).toBeNull();
    }
  });

  it("a CIMD client listing an unlisted scheme is refused on both legs, and its https callback still works", async () => {
    vi.stubGlobal("Cloudflare", { compatibilityFlags: { global_fetch_strictly_public: true } });
    const clientId = "https://client.example/oauth/client.json";
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          client_id: clientId,
          client_name: "CIMD client",
          redirect_uris: [HTTPS_CALLBACK, "smb://host/share"],
          token_endpoint_auth_method: "none",
          grant_types: ["authorization_code", "refresh_token"],
          response_types: ["code"]
        })
      )
    );
    const env = testEnv();
    const ok = await call(provider, new Request(await authorizeUrl(CANONICAL, clientId, HTTPS_CALLBACK)), env);
    expect(ok.status).toBe(200);
    for (const method of ["GET", "POST"]) {
      const response = await call(
        provider,
        new Request(await authorizeUrl(CANONICAL, clientId, "smb://host/share"), {
          method,
          redirect: "manual",
          ...(method === "POST" ? { body: new URLSearchParams({ csrf_token: "x", tos_agree: "yes" }) } : {})
        }),
        env
      );
      expect(response.status, method).toBe(400);
      expect(response.headers.get("location"), method).toBeNull();
    }
  });
});

// ---------------------------------------------------------------------------
// D5: token-endpoint rules this upgrade enables

describe("token endpoint", () => {
  const provider = providerFor(CANONICAL);

  it("refuses a code exchange whose redirect_uri differs from the authorization request's", async () => {
    const env = testEnv();
    const other = "https://client.example/other";
    const clientId = await registered(provider, env, CANONICAL, [HTTPS_CALLBACK, other]);
    const helpers = getOAuthApi(providerOptions(CANONICAL), env);
    const parsed = await helpers.parseAuthRequest(new Request(await authorizeUrl(CANONICAL, clientId, HTTPS_CALLBACK)));
    const { redirectTo } = await helpers.completeAuthorization({
      request: parsed,
      userId: "contract-user",
      scope: ["mcp"],
      metadata: {},
      props: { subject: "contract-user", clientId, scopes: ["mcp"] }
    });
    const code = new URL(redirectTo).searchParams.get("code")!;
    const exchange = (redirectUri: string) =>
      call(
        provider,
        new Request(`${CANONICAL}/token`, {
          method: "POST",
          body: new URLSearchParams({
            grant_type: "authorization_code",
            client_id: clientId,
            code,
            code_verifier: VERIFIER,
            redirect_uri: redirectUri
          })
        }),
        env
      );
    const wrong = await exchange(other);
    expect(wrong.status).toBe(400);
    expect(await wrong.json()).toMatchObject({ error: "invalid_grant" });
  });

  it("enforces a registered grant type: a client without authorization_code cannot exchange a code", async () => {
    const env = testEnv();
    env.OAUTH_KV.store.set(
      "client:narrow-contract",
      JSON.stringify({
        clientId: "narrow-contract",
        clientName: "Narrow client",
        redirectUris: [HTTPS_CALLBACK],
        grantTypes: ["client_credentials"],
        responseTypes: ["code"],
        registrationDate: Math.floor(Date.now() / 1000),
        tokenEndpointAuthMethod: "none",
        authMethodExplicit: true
      })
    );
    const response = await call(
      provider,
      new Request(`${CANONICAL}/token`, {
        method: "POST",
        body: new URLSearchParams({
          grant_type: "authorization_code",
          client_id: "narrow-contract",
          code: "u:g:s",
          code_verifier: VERIFIER,
          redirect_uri: HTTPS_CALLBACK
        })
      }),
      env
    );
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: "unauthorized_client" });
  });

  it("allows refresh for a client registered with authorization_code alone (refresh is implied)", async () => {
    const env = testEnv();
    const response = await register(provider, env, CANONICAL, [HTTPS_CALLBACK], { grant_types: ["authorization_code"] });
    expect(response.status).toBe(201);
    const { client_id: clientId } = (await response.json()) as { client_id: string };
    const tokens = await mintTokens(provider, env, CANONICAL, clientId, HTTPS_CALLBACK);
    const refreshed = await call(
      provider,
      new Request(`${CANONICAL}/token`, {
        method: "POST",
        body: new URLSearchParams({ grant_type: "refresh_token", client_id: clientId, refresh_token: tokens.refresh_token })
      }),
      env
    );
    expect(refreshed.status).toBe(200);
  });

  it("renews a registration in use for another registration lifetime, and leaves an unstamped record alone", async () => {
    const env = testEnv();
    const clientId = await registered(provider, env, CANONICAL, [HTTPS_CALLBACK]);
    const key = `client:${clientId}`;
    const now = Math.floor(Date.now() / 1000);
    // A registration written under 1.x carries its expiry. Past half its
    // lifetime, the next token request rewrites it for another full lifetime.
    const record = JSON.parse(env.OAUTH_KV.store.get(key)!);
    expect(record.registrationExpiresAt).toBeGreaterThan(now);
    env.OAUTH_KV.store.set(key, JSON.stringify({ ...record, registrationExpiresAt: now + 100 * 24 * 60 * 60 }));
    env.OAUTH_KV.expirationTtl.set(key, 100 * 24 * 60 * 60);
    await mintTokens(provider, env, CANONICAL, clientId, HTTPS_CALLBACK);
    expect(env.OAUTH_KV.expirationTtl.get(key)).toBe(365 * 24 * 60 * 60);

    // A record written before the stamp existed (every registration made under
    // 0.10.x) cannot be told from a permanent one, so it keeps its schedule.
    const { registrationExpiresAt: _stamp, ...unstamped } = JSON.parse(env.OAUTH_KV.store.get(key)!);
    env.OAUTH_KV.store.set(key, JSON.stringify(unstamped));
    env.OAUTH_KV.expirationTtl.set(key, 100 * 24 * 60 * 60);
    await mintTokens(provider, env, CANONICAL, clientId, HTTPS_CALLBACK);
    expect(env.OAUTH_KV.expirationTtl.get(key)).toBe(100 * 24 * 60 * 60);
  });
});
