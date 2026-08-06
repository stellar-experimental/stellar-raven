/**
 * Unit tests for the WorkOS-backed OAuth wiring (research/auth-workos.md):
 *
 *  - the named API-key and local-dev bypasses;
 *  - REAL workers-oauth-provider behavior built from oauthProviderOptions()
 *    around a stub /mcp handler (401 + WWW-Authenticate, discovery docs,
 *    the path-suffixed RFC 8414 alias) — `cloudflare:workers` is aliased to
 *    test/stubs/cloudflare-workers.ts via vitest.config.ts;
 *  - the WorkOSAuthHandler defaultHandler routes (landing, health, consent
 *    page + CSRF, WorkOS redirect, callback state binding + code exchange).
 *
 * src/server.ts itself cannot load under plain Node (it imports
 * src/executor/run → cloudflare:workers via @cloudflare/codemode), so its
 * thin fetch router is exercised through these same building blocks.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { OAuthProvider } from "@cloudflare/workers-oauth-provider";
import type { AuthRequest, OAuthHelpers } from "@cloudflare/workers-oauth-provider";
import {
  ACCESS_TOKEN_TTL_SECONDS,
  CLIENT_REGISTRATION_TTL_SECONDS,
  REFRESH_TOKEN_TTL_SECONDS,
  allowDevUnauthenticated,
  isAuthServerMetadataAlias,
  oauthProviderOptions,
  rewritePath,
  timingSafeEqualBytes
} from "../src/auth/gate";
import {
  API_KEY_NAME_PATTERN,
  API_KEY_PREFIX,
  API_KEY_TOKEN_PATTERN,
  apiKeyKvKey,
  authenticateApiKey,
  parseApiKeyCredential
} from "../src/auth/api-keys";
import {
  CONSENT_CSRF_TTL_SECONDS,
  LOGIN_STATE_TTL_SECONDS,
  WorkOSAuthHandler,
  demoLoginRedirect,
  deriveSubject,
  workosAuthenticateBody
} from "../src/auth/workos";
import { DEMO_COOKIE_NAME, verifyDemoCookie } from "../src/demo/auth";

// ---------------------------------------------------------------------------
// Stubs

function memoryKv(): KVNamespace & { store: Map<string, string> } {
  const store = new Map<string, string>();
  return {
    store,
    async get(key: string) {
      return store.get(key) ?? null;
    },
    async put(key: string, value: string) {
      store.set(key, value);
    },
    async delete(key: string) {
      store.delete(key);
    },
    async list() {
      return { keys: [], list_complete: true, cacheStatus: null };
    }
  } as unknown as KVNamespace & { store: Map<string, string> };
}

function testEnv(overrides: Record<string, unknown> = {}): Env {
  return {
    OAUTH_KV: memoryKv(),
    WORKOS_CLIENT_ID: "client_test_123",
    WORKOS_API_KEY: "sk_test_dummy",
    MCP_SERVER_SECRET: "unit-test-pepper",
    ...overrides
  } as unknown as Env;
}

function ctx(): ExecutionContext {
  return {
    waitUntil() {},
    passThroughOnException() {},
    props: {}
  } as unknown as ExecutionContext;
}

const AUTH_REQ: AuthRequest = {
  responseType: "code",
  clientId: "client-abc",
  redirectUri: "https://client.example/cb",
  scope: ["mcp"],
  state: "client-state",
  codeChallenge: "challenge",
  codeChallengeMethod: "S256"
};

/** Stub provider-helpers for driving WorkOSAuthHandler directly. */
function stubHelpers(overrides: Partial<OAuthHelpers> = {}): OAuthHelpers {
  return {
    parseAuthRequest: vi.fn(async () => AUTH_REQ),
    lookupClient: vi.fn(async () => ({
      clientId: "client-abc",
      clientName: "Test MCP Client",
      redirectUris: ["https://client.example/cb"],
      tokenEndpointAuthMethod: "none"
    })),
    completeAuthorization: vi.fn(async () => ({
      redirectTo: "https://client.example/cb?code=xyz&state=client-state"
    })),
    ...overrides
  } as unknown as OAuthHelpers;
}

function cookieValue(response: Response, name: string): string | undefined {
  // getSetCookie exists at runtime (Node 20+/Workers); workers-types' Headers wins
  // in tsconfig and predates it.
  const setCookies = (response.headers as unknown as { getSetCookie(): string[] }).getSetCookie();
  for (const header of setCookies) {
    if (header.startsWith(`${name}=`)) return header.slice(name.length + 1).split(";")[0];
  }
  return undefined;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

// ---------------------------------------------------------------------------
// Bypass 1: named API keys (KV digest + timing-safe compare)

describe("named API keys", () => {
  const token = "a".repeat(43);
  const request = (credential = `admin:${token}`) =>
    new Request("https://mcp.test/mcp", {
      headers: { authorization: `Bearer ${credential}` }
    });

  async function digest(value: string): Promise<string> {
    const bytes = new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))
    );
    return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  it("validates names, tokens, credentials, and the isolated KV prefix", () => {
    expect(API_KEY_PREFIX).toBe("raven:api-key:v1:");
    expect(apiKeyKvKey("devrel")).toBe("raven:api-key:v1:devrel");
    for (const name of ["a", "admin", "devrel-2", `a${"0".repeat(31)}`]) {
      expect(API_KEY_NAME_PATTERN.test(name), name).toBe(true);
    }
    for (const name of ["", "Admin", "2admin", "admin_", `a${"0".repeat(32)}`]) {
      expect(API_KEY_NAME_PATTERN.test(name), name).toBe(false);
    }
    expect(API_KEY_TOKEN_PATTERN.test(token)).toBe(true);
    expect(API_KEY_TOKEN_PATTERN.test("a".repeat(42))).toBe(false);
    expect(parseApiKeyCredential(request())).toEqual({ name: "admin", token });
    expect(parseApiKeyCredential(new Request("https://mcp.test/mcp", {
      headers: { authorization: `bearer devrel:${token}` }
    }))).toEqual({ name: "devrel", token });
  });

  it("rejects malformed, unprefixed, and custom-header credentials before KV", async () => {
    let reads = 0;
    const env = testEnv({
      OAUTH_KV: {
        async get() {
          reads++;
          return null;
        }
      }
    });
    for (const candidate of [
      new Request("https://mcp.test/mcp"),
      request(token),
      request(`Admin:${token}`),
      request(`admin:${token}:extra`),
      new Request("https://mcp.test/mcp", { headers: { authorization: `Basic admin:${token}` } }),
      new Request("https://mcp.test/mcp", { headers: { "x-mcp-admin-token": token } })
    ]) {
      expect(await authenticateApiKey(candidate, env)).toBeUndefined();
    }
    expect(reads).toBe(0);
  });

  it("matches a stored digest with exactly one KV read", async () => {
    let reads = 0;
    const env = testEnv({
      OAUTH_KV: {
        async get(key: string) {
          reads++;
          expect(key).toBe(apiKeyKvKey("admin"));
          return digest(token);
        }
      }
    });
    expect(await authenticateApiKey(request(), env)).toBe("admin");
    expect(reads).toBe(1);
  });

  it("rejects missing, malformed, mismatched, and failed KV reads", async () => {
    for (const get of [
      async () => null,
      async () => "not-a-digest",
      async () => digest("b".repeat(43)),
      async () => {
        throw new Error("KV unavailable");
      }
    ]) {
      expect(await authenticateApiKey(request(), testEnv({ OAUTH_KV: { get } }))).toBeUndefined();
    }
  });

  it("timing-safe comparator: equal, unequal, and length-mismatched digests", () => {
    const a = new Uint8Array([1, 2, 3, 4]);
    expect(timingSafeEqualBytes(a, new Uint8Array([1, 2, 3, 4]))).toBe(true);
    expect(timingSafeEqualBytes(a, new Uint8Array([1, 2, 3, 5]))).toBe(false);
    expect(timingSafeEqualBytes(a, new Uint8Array([1, 2, 3]))).toBe(false);
  });

  it("uses the runtime's crypto.subtle.timingSafeEqual when available (Workers path)", () => {
    const native = vi.fn((x: ArrayBufferView, y: ArrayBufferView) => true);
    const realSubtle = crypto.subtle;
    // Node's crypto.subtle lacks timingSafeEqual; graft it on to prove the
    // Workers branch is taken and delegated to.
    vi.stubGlobal("crypto", {
      ...crypto,
      subtle: new Proxy(realSubtle, {
        get(target, prop, receiver) {
          if (prop === "timingSafeEqual") return native;
          const value = Reflect.get(target, prop, target);
          return typeof value === "function" ? value.bind(target) : value;
        }
      })
    });
    expect(timingSafeEqualBytes(new Uint8Array([9]), new Uint8Array([1]))).toBe(true);
    expect(native).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// Bypass 2: local dev var

describe("allowDevUnauthenticated", () => {
  it('is true only for the exact string "true" AND a loopback hostname', () => {
    for (const host of ["localhost", "127.0.0.1", "::1", "[::1]", "LOCALHOST"]) {
      expect(allowDevUnauthenticated({ DEV_ALLOW_UNAUTHENTICATED: "true" }, host)).toBe(true);
    }
    // Wrong var value → false even on localhost.
    expect(allowDevUnauthenticated({ DEV_ALLOW_UNAUTHENTICATED: "TRUE" }, "localhost")).toBe(false);
    expect(allowDevUnauthenticated({ DEV_ALLOW_UNAUTHENTICATED: "1" }, "localhost")).toBe(false);
    expect(allowDevUnauthenticated({ DEV_ALLOW_UNAUTHENTICATED: "" }, "localhost")).toBe(false);
    expect(allowDevUnauthenticated({}, "localhost")).toBe(false);
  });

  it("is refused on a production-looking hostname even with the var set (deployed var is inert)", () => {
    for (const host of ["raven.stellar.org", "agents.stellar.buzz", "raven.stellar.buzz", "evil.example.com", "127.0.0.1.evil.com"]) {
      expect(allowDevUnauthenticated({ DEV_ALLOW_UNAUTHENTICATED: "true" }, host)).toBe(false);
    }
  });
});

// ---------------------------------------------------------------------------
// Real provider behavior (constructed from our exact wiring options)

describe("OAuthProvider wiring (real @cloudflare/workers-oauth-provider)", () => {
  const mcpFetch = vi.fn(async () => new Response("mcp-ok"));
  const options = oauthProviderOptions({ fetch: mcpFetch });
  const provider = new OAuthProvider(options);

  it("pins OAuth lifetimes (access 1h, refresh grant 90d, client registration 365d)", () => {
    expect(ACCESS_TOKEN_TTL_SECONDS).toBe(60 * 60);
    expect(REFRESH_TOKEN_TTL_SECONDS).toBe(90 * 24 * 60 * 60);
    expect(CLIENT_REGISTRATION_TTL_SECONDS).toBe(365 * 24 * 60 * 60);
    expect(options.accessTokenTTL).toBe(ACCESS_TOKEN_TTL_SECONDS);
    expect(options.refreshTokenTTL).toBe(REFRESH_TOKEN_TTL_SECONDS);
    expect(options.clientRegistrationTTL).toBe(CLIENT_REGISTRATION_TTL_SECONDS);
    expect(REFRESH_TOKEN_TTL_SECONDS).toBeGreaterThan(ACCESS_TOKEN_TTL_SECONDS);
  });

  it("unauthenticated POST /mcp → 401 with WWW-Authenticate resource_metadata pointer", async () => {
    mcpFetch.mockClear();
    const response = await provider.fetch(
      new Request("https://mcp.test/mcp", { method: "POST" }),
      testEnv(),
      ctx()
    );
    expect(response.status).toBe(401);
    const wwwAuthenticate = response.headers.get("www-authenticate") ?? "";
    expect(wwwAuthenticate).toContain("Bearer");
    expect(wwwAuthenticate).toContain('error="invalid_token"');
    expect(wwwAuthenticate).toContain(
      'resource_metadata="https://mcp.test/.well-known/oauth-protected-resource/mcp"'
    );
    const body = (await response.json()) as { error: string };
    expect(body.error).toBe("invalid_token");
    // The MCP handler must never run without a valid token.
    expect(mcpFetch).not.toHaveBeenCalled();
  });

  it("garbage bearer token on /mcp → 401, handler untouched", async () => {
    mcpFetch.mockClear();
    const response = await provider.fetch(
      new Request("https://mcp.test/mcp", {
        method: "POST",
        headers: { authorization: "Bearer not-a-real-token" }
      }),
      testEnv(),
      ctx()
    );
    expect(response.status).toBe(401);
    expect(mcpFetch).not.toHaveBeenCalled();
  });

  it("serves RFC 8414 authorization-server metadata with our endpoints and S256-only PKCE", async () => {
    const response = await provider.fetch(
      new Request("https://mcp.test/.well-known/oauth-authorization-server"),
      testEnv(),
      ctx()
    );
    expect(response.status).toBe(200);
    const metadata = (await response.json()) as Record<string, unknown>;
    expect(metadata.authorization_endpoint).toBe("https://mcp.test/authorize");
    expect(metadata.token_endpoint).toBe("https://mcp.test/token");
    expect(metadata.registration_endpoint).toBe("https://mcp.test/register");
    expect(metadata.scopes_supported).toEqual(["mcp"]);
    expect(metadata.code_challenge_methods_supported).toEqual(["S256"]);
  });

  it("serves RFC 9728 protected-resource metadata for /mcp", async () => {
    const response = await provider.fetch(
      new Request("https://mcp.test/.well-known/oauth-protected-resource/mcp"),
      testEnv(),
      ctx()
    );
    expect(response.status).toBe(200);
    const metadata = (await response.json()) as Record<string, unknown>;
    expect(metadata.resource).toBe("https://mcp.test/mcp");
    expect(metadata.scopes_supported).toEqual(["mcp"]);
    expect(metadata.resource_name).toBe("stellar-raven-codemode MCP");
  });

  it("path-suffixed RFC 8414 form works via the alias rewrite (server.ts quirk)", async () => {
    const suffixed = new Request("https://mcp.test/.well-known/oauth-authorization-server/mcp");
    // 0.8.1 only matches the exact path — the suffixed form 404s without the alias…
    expect(isAuthServerMetadataAlias(new URL(suffixed.url))).toBe(true);
    // …and the rewrite lands on the real metadata endpoint.
    const response = await provider.fetch(
      rewritePath(suffixed, "/.well-known/oauth-authorization-server"),
      testEnv(),
      ctx()
    );
    expect(response.status).toBe(200);
    const metadata = (await response.json()) as Record<string, unknown>;
    expect(metadata.issuer).toBe("https://mcp.test");
    expect(isAuthServerMetadataAlias(new URL("https://mcp.test/.well-known/oauth-authorization-server"))).toBe(false);
    expect(isAuthServerMetadataAlias(new URL("https://mcp.test/mcp"))).toBe(false);
  });

  it("OIDC discovery paths alias onto the RFC 8414 metadata (exact + path-suffixed)", async () => {
    // RFC 8414 §5: an OAuth-only AS may publish its metadata at the OIDC
    // discovery path; some MCP clients probe only this one.
    const exact = new Request("https://mcp.test/.well-known/openid-configuration");
    const suffixed = new Request("https://mcp.test/.well-known/openid-configuration/mcp");
    expect(isAuthServerMetadataAlias(new URL(exact.url))).toBe(true);
    expect(isAuthServerMetadataAlias(new URL(suffixed.url))).toBe(true);
    // Must not swallow unrelated well-known paths.
    expect(isAuthServerMetadataAlias(new URL("https://mcp.test/.well-known/oauth-protected-resource/mcp"))).toBe(false);
    expect(isAuthServerMetadataAlias(new URL("https://mcp.test/.well-known/openid-configuration-extra"))).toBe(false);

    const response = await provider.fetch(
      rewritePath(exact, "/.well-known/oauth-authorization-server"),
      testEnv(),
      ctx()
    );
    expect(response.status).toBe(200);
    const metadata = (await response.json()) as Record<string, unknown>;
    expect(metadata.issuer).toBe("https://mcp.test");
    expect(metadata.token_endpoint).toBe("https://mcp.test/token");
  });

  it("routes / and /health through to the defaultHandler", async () => {
    const landing = await provider.fetch(new Request("https://mcp.test/"), testEnv(), ctx());
    expect(landing.status).toBe(200);
    expect(await landing.text()).toContain("/mcp");

    const health = await provider.fetch(new Request("https://mcp.test/health"), testEnv(), ctx());
    expect(health.status).toBe(200);
    expect(await health.json()).toEqual({ status: "ok", service: "stellar-raven-codemode" });

    const missing = await provider.fetch(new Request("https://mcp.test/nope"), testEnv(), ctx());
    expect(missing.status).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// WorkOSAuthHandler routes (driven directly with stubbed provider helpers)

describe("WorkOSAuthHandler", () => {
  it("GET /terms serves the Raven terms, linked from the consent page", async () => {
    const env = testEnv({ OAUTH_PROVIDER: stubHelpers() });
    const terms = await WorkOSAuthHandler.fetch(new Request("https://mcp.test/terms"), env);
    expect(terms.status).toBe(200);
    const page = await terms.text();
    expect(page).toContain("Stellar Raven Terms of Service");
    expect(page).toContain(`<link rel="canonical" href="https://raven.stellar.org/terms"/>`);
    expect(page).toContain("Raven's structured content logging and AI Gateway request logging are disabled");
    expect(page).toContain("currently no longer than seven days");
    expect(page).not.toContain("may include the queries submitted and the responses returned");
    // Script-free legal surface: CSP must not allow inline script.
    expect(terms.headers.get("content-security-policy")).not.toContain("script-src");
    expect(page).not.toContain("<script");

    const consent = await WorkOSAuthHandler.fetch(
      new Request("https://mcp.test/authorize?client_id=client-abc"),
      env
    );
    expect(await consent.text()).toContain(`href="/terms"`);
  });

  it("GET /authorize renders a consent page naming the client and scopes, with a CSRF cookie", async () => {
    const env = testEnv({ OAUTH_PROVIDER: stubHelpers() });
    const response = await WorkOSAuthHandler.fetch(
      new Request("https://mcp.test/authorize?client_id=client-abc"),
      env
    );
    expect(response.status).toBe(200);
    const csrf = cookieValue(response, "__Host-MCP_CONSENT_CSRF");
    expect(csrf).toBeTruthy();
    const page = await response.text();
    expect(page).toContain("Test MCP Client");
    // Scope is named on the consent page (rendered as a styled scope chip).
    expect(page).toContain(`<code class="scope-code">mcp</code>`);
    expect(page).toContain(`action="/authorize?client_id=client-abc"`);
    expect(page).not.toMatch(/<br\s*\/?\s*>/i);
    expect(response.headers.get("content-security-policy")).not.toContain("form-action");
    // Double-submit: the hidden form field carries the same token as the cookie.
    expect(page).toContain(`name="csrf_token" value="${csrf}"`);
    // Explicit Terms/Privacy acknowledgement checkbox gates the grant.
    expect(page).toContain(`type="checkbox" name="tos_agree"`);
  });

  // `allowPlainPKCE: false` only rejects the plain METHOD. The provider leaves an
  // absent code_challenge undefined and, at redemption, derives
  // `isPkceEnabled = !!grantData.codeChallenge` — so a request claiming S256 with
  // no challenge yields a grant whose code is redeemable with no verifier at all.
  // Both /authorize legs must refuse it before a consent page is ever rendered.
  it.each([
    ["no code_challenge at all", { responseType: "code", clientId: "client-abc", redirectUri: "https://client.example/cb", scope: ["mcp"], state: "s", codeChallengeMethod: "S256" }],
    ["a plain challenge", { ...AUTH_REQ, codeChallengeMethod: "plain" }],
    ["no method", { ...AUTH_REQ, codeChallengeMethod: undefined }]
  ])("GET /authorize refuses an authorization request with %s", async (_label, parsed) => {
    const env = testEnv({
      OAUTH_PROVIDER: stubHelpers({
        parseAuthRequest: vi.fn(async () => parsed as AuthRequest)
      })
    });
    const response = await WorkOSAuthHandler.fetch(
      new Request("https://mcp.test/authorize?client_id=client-abc"),
      env
    );
    expect(response.status).toBe(400);
    expect(await response.text()).toBe("Invalid authorization request");
    // Never mint a consent cookie for a request that could not be safely granted.
    expect(cookieValue(response, "__Host-MCP_CONSENT_CSRF")).toBeUndefined();
  });

  it("POST /authorize refuses a PKCE-less authorization request before parking state", async () => {
    const env = testEnv({
      OAUTH_PROVIDER: stubHelpers({
        parseAuthRequest: vi.fn(async () => ({ ...AUTH_REQ, codeChallenge: undefined }) as AuthRequest)
      })
    });
    const form = new URLSearchParams({ csrf_token: "token-1", tos_agree: "on" });
    const response = await WorkOSAuthHandler.fetch(
      new Request("https://mcp.test/authorize?client_id=client-abc", {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          cookie: "__Host-MCP_CONSENT_CSRF=token-1"
        },
        body: form
      }),
      env
    );
    expect(response.status).toBe(400);
    const kv = env.OAUTH_KV as unknown as { store: Map<string, string> };
    expect(kv.store.size).toBe(0);
  });

  it("POST /authorize rejects a missing/mismatched CSRF token, and logs a distinguishing reason", async () => {
    const env = testEnv({ OAUTH_PROVIDER: stubHelpers() });
    const form = new URLSearchParams({ csrf_token: "attacker-guess" });
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const response = await WorkOSAuthHandler.fetch(
      new Request("https://mcp.test/authorize?client_id=client-abc", {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          cookie: "__Host-MCP_CONSENT_CSRF=real-token"
        },
        body: form
      }),
      env
    );
    // Recoverable, not a dead end: back to the form action so the GET handler
    // issues a fresh token + cookie. The old bare 400 ALSO cleared the cookie,
    // so every retry reported a CSRF mismatch no matter what failed first.
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("/authorize?client_id=client-abc");
    expect(cookieValue(response, "__Host-MCP_CONSENT_CSRF")).toBeUndefined();
    // The reason still has to reach the logs — the redirect is indistinguishable
    // from the terms-acknowledgement one in platform events.
    const events = log.mock.calls.map(([line]) => JSON.parse(String(line)));
    expect(events).toContainEqual({
      evt: "auth_reject",
      status: 303,
      reason: "CSRF token mismatch"
    });
    log.mockRestore();
  });

  it("POST /authorize rejects a missing Terms/Privacy acknowledgement", async () => {
    const env = testEnv({ OAUTH_PROVIDER: stubHelpers() });
    // Valid CSRF, but the tos_agree checkbox was never ticked (field absent).
    const form = new URLSearchParams({ csrf_token: "token-1" });
    const response = await WorkOSAuthHandler.fetch(
      new Request("https://mcp.test/authorize?client_id=client-abc", {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          cookie: "__Host-MCP_CONSENT_CSRF=token-1"
        },
        body: form
      }),
      env
    );
    // Same recovery path as the CSRF branch — the CSS gate on the button is
    // mouse-only, so a keyboard submit lands here and must stay retryable.
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("/authorize?client_id=client-abc");
    // No state parked when the acknowledgement is missing.
    const kv = env.OAUTH_KV as unknown as { store: Map<string, string> };
    expect(kv.store.size).toBe(0);
  });

  it("POST /authorize with a valid CSRF parks state in KV and 302s to WorkOS AuthKit", async () => {
    const env = testEnv({ OAUTH_PROVIDER: stubHelpers() });
    const form = new URLSearchParams({ csrf_token: "token-1", tos_agree: "on" });
    const response = await WorkOSAuthHandler.fetch(
      new Request("https://mcp.test/authorize?client_id=client-abc", {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          cookie: "__Host-MCP_CONSENT_CSRF=token-1"
        },
        body: form
      }),
      env
    );
    expect(response.status).toBe(302);
    const location = new URL(response.headers.get("location") ?? "");
    expect(location.origin).toBe("https://api.workos.com");
    expect(location.pathname).toBe("/user_management/authorize");
    expect(location.searchParams.get("provider")).toBe("authkit");
    expect(location.searchParams.get("client_id")).toBe("client_test_123");
    // redirect_uri is origin-derived — no env switch.
    expect(location.searchParams.get("redirect_uri")).toBe("https://mcp.test/callback");

    const state = location.searchParams.get("state") ?? "";
    const kv = env.OAUTH_KV as unknown as { store: Map<string, string> };
    const parked = JSON.parse(kv.store.get(`login:${state}`) ?? "{}") as {
      type: string;
      oauthReq: AuthRequest;
      binding: string;
    };
    // Discriminated union: the MCP flow parks its branch tag explicitly.
    expect(parked.type).toBe("mcp");
    expect(parked.oauthReq.clientId).toBe("client-abc");
    // The browser-binding cookie matches what was parked.
    expect(cookieValue(response, "__Host-MCP_STATE")).toBe(parked.binding);
    // The two clocks are deliberately different, and the parked-state one is the
    // one that must stay short: /callback consumes `login:${state}` BEFORE it
    // checks the binding cookie, so a leaked state is a login-DoS whose window
    // this value sets. Consent dwell has no such surface.
    expect(LOGIN_STATE_TTL_SECONDS).toBe(600);
    expect(CONSENT_CSRF_TTL_SECONDS).toBe(1800);
    expect(cookieValue(response, "__Host-MCP_STATE")).toBeTruthy();
    const bindingCookie = (response.headers as unknown as { getSetCookie(): string[] })
      .getSetCookie()
      .find((c) => c.startsWith("__Host-MCP_STATE="));
    expect(bindingCookie).toContain(`Max-Age=${LOGIN_STATE_TTL_SECONDS}`);
  });

  it("GET /callback rejects unknown state and binding-cookie mismatches (single-use)", async () => {
    const env = testEnv({ OAUTH_PROVIDER: stubHelpers() });
    const unknown = await WorkOSAuthHandler.fetch(
      new Request("https://mcp.test/callback?code=abc&state=missing"),
      env
    );
    expect(unknown.status).toBe(400);

    const kv = env.OAUTH_KV as unknown as { store: Map<string, string> };
    kv.store.set("login:st1", JSON.stringify({ type: "mcp", oauthReq: AUTH_REQ, binding: "bind-1" }));
    const mismatch = await WorkOSAuthHandler.fetch(
      new Request("https://mcp.test/callback?code=abc&state=st1", {
        headers: { cookie: "__Host-MCP_STATE=wrong" }
      }),
      env
    );
    expect(mismatch.status).toBe(400);
    // Consumed on first presentation, even a failed one.
    expect(kv.store.has("login:st1")).toBe(false);
  });

  it("GET /callback exchanges the code with WorkOS and completes the authorization", async () => {
    const helpers = stubHelpers();
    const env = testEnv({ OAUTH_PROVIDER: helpers });
    const kv = env.OAUTH_KV as unknown as { store: Map<string, string> };
    kv.store.set("login:st2", JSON.stringify({ type: "mcp", oauthReq: AUTH_REQ, binding: "bind-2" }));

    const workosFetch = vi.fn(async () =>
      Response.json({ user: { id: "user_wos_1" }, access_token: "never-stored" })
    );
    vi.stubGlobal("fetch", workosFetch);

    const response = await WorkOSAuthHandler.fetch(
      new Request("https://mcp.test/callback?code=code-123&state=st2", {
        headers: { cookie: "__Host-MCP_STATE=bind-2" }
      }),
      env
    );
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("https://client.example/cb?code=xyz&state=client-state");

    // The code exchange hits the documented WorkOS endpoint with the pure body.
    expect(workosFetch).toHaveBeenCalledTimes(1);
    const [exchangeUrl, exchangeInit] = workosFetch.mock.calls[0] as unknown as [string, RequestInit];
    expect(exchangeUrl).toBe("https://api.workos.com/user_management/authenticate");
    expect(JSON.parse(String(exchangeInit.body))).toEqual(workosAuthenticateBody(env, "code-123"));

    // completeAuthorization gets the peppered subject — never the WorkOS id/token.
    const expectedSubject = await deriveSubject("user_wos_1", "unit-test-pepper");
    expect(helpers.completeAuthorization).toHaveBeenCalledWith(
      expect.objectContaining({
        request: expect.objectContaining({ clientId: "client-abc" }),
        userId: expectedSubject,
        scope: ["mcp"],
        props: { subject: expectedSubject, scopes: ["mcp"], clientId: "client-abc" }
      })
    );
    expect(kv.store.has("login:st2")).toBe(false);
  });

  it("GET /callback surfaces a WorkOS failure as 502 without completing", async () => {
    const helpers = stubHelpers();
    const env = testEnv({ OAUTH_PROVIDER: helpers });
    const kv = env.OAUTH_KV as unknown as { store: Map<string, string> };
    kv.store.set("login:st3", JSON.stringify({ type: "mcp", oauthReq: AUTH_REQ, binding: "bind-3" }));
    vi.stubGlobal("fetch", vi.fn(async () => new Response("nope", { status: 401 })));

    const response = await WorkOSAuthHandler.fetch(
      new Request("https://mcp.test/callback?code=bad&state=st3", {
        headers: { cookie: "__Host-MCP_STATE=bind-3" }
      }),
      env
    );
    expect(response.status).toBe(502);
    expect(helpers.completeAuthorization).not.toHaveBeenCalled();
  });

  it("workosAuthenticateBody builds the exact WorkOS contract", () => {
    const body = workosAuthenticateBody(
      { WORKOS_CLIENT_ID: "client_x", WORKOS_API_KEY: "sk_y" } as Env,
      "the-code"
    );
    expect(body).toEqual({
      client_id: "client_x",
      client_secret: "sk_y",
      grant_type: "authorization_code",
      code: "the-code"
    });
  });

  it("subject derivation is hex(SHA-256(`${userId}:${secret}`)) — colon-free, stable", async () => {
    const subject = await deriveSubject("user_1", "pepper");
    expect(subject).toMatch(/^[0-9a-f]{64}$/);
    expect(await deriveSubject("user_1", "pepper")).toBe(subject);
    expect(await deriveSubject("user_1", "other-pepper")).not.toBe(subject);
  });
});

// ---------------------------------------------------------------------------
// Parked-login union + /callback demo branch (demo-playground review finding 2)

describe("login-state union on /callback", () => {
  function callbackRequest(state: string, binding: string): Request {
    return new Request(`https://mcp.test/callback?code=code-123&state=${state}`, {
      headers: { cookie: `__Host-MCP_STATE=${binding}` }
    });
  }

  async function driveCallback(parkedRaw: string | null): Promise<{
    response: Response;
    helpers: OAuthHelpers;
    kv: { store: Map<string, string> };
    workosFetch: ReturnType<typeof vi.fn>;
  }> {
    const helpers = stubHelpers();
    const env = testEnv({ OAUTH_PROVIDER: helpers });
    const kv = env.OAUTH_KV as unknown as { store: Map<string, string> };
    if (parkedRaw !== null) kv.store.set("login:stX", parkedRaw);
    const workosFetch = vi.fn(async () =>
      Response.json({ user: { id: "user_wos_1" }, access_token: "never-stored" })
    );
    vi.stubGlobal("fetch", workosFetch);
    const response = await WorkOSAuthHandler.fetch(callbackRequest("stX", "bind-x"), env);
    return { response, helpers, kv, workosFetch };
  }

  it("rejects malformed (non-JSON) parked state with 400, consumed, no exchange", async () => {
    const { response, helpers, kv, workosFetch } = await driveCallback("not json at all");
    expect(response.status).toBe(400);
    expect(kv.store.has("login:stX")).toBe(false);
    expect(workosFetch).not.toHaveBeenCalled();
    expect(helpers.completeAuthorization).not.toHaveBeenCalled();
  });

  it("rejects an unknown branch type with 400, consumed, no exchange", async () => {
    const { response, kv, workosFetch } = await driveCallback(
      JSON.stringify({ type: "weird", binding: "bind-x", oauthReq: AUTH_REQ })
    );
    expect(response.status).toBe(400);
    expect(kv.store.has("login:stX")).toBe(false);
    expect(workosFetch).not.toHaveBeenCalled();
  });

  it("rejects legacy pre-union state (no type tag) — forward-only, no compat parsing", async () => {
    const { response, workosFetch } = await driveCallback(
      JSON.stringify({ oauthReq: AUTH_REQ, binding: "bind-x" })
    );
    expect(response.status).toBe(400);
    expect(workosFetch).not.toHaveBeenCalled();
  });

  it("rejects a demo state with a tampered returnTo (open-redirect shape) before any exchange", async () => {
    const { response, workosFetch } = await driveCallback(
      JSON.stringify({ type: "demo", binding: "bind-x", returnTo: "https://evil.example/demo" })
    );
    expect(response.status).toBe(400);
    expect(workosFetch).not.toHaveBeenCalled();
  });

  it("demo branch: exchanges the code, mints the signed cookie, serves the same-origin interstitial — no OAuth grant", async () => {
    const { response, helpers, kv, workosFetch } = await driveCallback(
      JSON.stringify({ type: "demo", binding: "bind-x", returnTo: "/playground" })
    );
    // NOT a 302: the navigation chain is cross-site-initiated (WorkOS →
    // /callback), so browsers would withhold the SameSite=Strict cookie on a
    // redirect straight to /playground. The interstitial's meta-refresh starts
    // a fresh same-origin navigation instead.
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/html");
    const body = await response.text();
    expect(body).toContain('content="0;url=/playground"');
    expect(body).toContain('href="/playground"');
    expect(workosFetch).toHaveBeenCalledTimes(1);
    // A browser session, not an authorization: the provider is never involved.
    expect(helpers.completeAuthorization).not.toHaveBeenCalled();
    expect(kv.store.has("login:stX")).toBe(false);

    // The Set-Cookie is a verifiable demo session for the peppered subject.
    const setCookies = (response.headers as unknown as { getSetCookie(): string[] }).getSetCookie();
    const demoCookie = setCookies.find((h) => h.startsWith(`${DEMO_COOKIE_NAME}=`));
    expect(demoCookie).toBeTruthy();
    expect(demoCookie).toContain("SameSite=Strict");
    const cookieHeader = `${DEMO_COOKIE_NAME}=${demoCookie?.slice(DEMO_COOKIE_NAME.length + 1).split(";")[0]}`;
    const subject = await verifyDemoCookie("unit-test-pepper", cookieHeader);
    expect(subject).toBe(await deriveSubject("user_wos_1", "unit-test-pepper"));
    // The binding cookie is cleared alongside.
    expect(setCookies.some((h) => h.startsWith("__Host-MCP_STATE=;"))).toBe(true);
  });

  it("demo branch still enforces the browser-binding cookie (single-use consumption)", async () => {
    const helpers = stubHelpers();
    const env = testEnv({ OAUTH_PROVIDER: helpers });
    const kv = env.OAUTH_KV as unknown as { store: Map<string, string> };
    kv.store.set("login:stY", JSON.stringify({ type: "demo", binding: "bind-y", returnTo: "/playground" }));
    const workosFetch = vi.fn(async () => Response.json({ user: { id: "user_wos_1" } }));
    vi.stubGlobal("fetch", workosFetch);
    const response = await WorkOSAuthHandler.fetch(callbackRequest("stY", "wrong-binding"), env);
    expect(response.status).toBe(400);
    expect(kv.store.has("login:stY")).toBe(false);
    expect(workosFetch).not.toHaveBeenCalled();
  });
});

describe("demoLoginRedirect", () => {
  it("parks { type: 'demo', returnTo: '/playground' } under login:<state> and 302s to WorkOS AuthKit", async () => {
    const env = testEnv();
    const response = await demoLoginRedirect(new Request("https://mcp.test/playground/login"), env);
    expect(response.status).toBe(302);

    const location = new URL(response.headers.get("location") ?? "");
    expect(location.origin).toBe("https://api.workos.com");
    expect(location.pathname).toBe("/user_management/authorize");
    expect(location.searchParams.get("provider")).toBe("authkit");
    expect(location.searchParams.get("client_id")).toBe("client_test_123");
    // Same origin-derived redirect_uri as the MCP flow — one registered URI.
    expect(location.searchParams.get("redirect_uri")).toBe("https://mcp.test/callback");

    const state = location.searchParams.get("state") ?? "";
    const kv = env.OAUTH_KV as unknown as { store: Map<string, string> };
    const parked = JSON.parse(kv.store.get(`login:${state}`) ?? "{}") as {
      type: string;
      binding: string;
      returnTo: string;
    };
    expect(parked.type).toBe("demo");
    expect(parked.returnTo).toBe("/playground");
    // The browser-binding cookie matches what was parked, like the MCP flow.
    expect(cookieValue(response, "__Host-MCP_STATE")).toBe(parked.binding);
  });
});
