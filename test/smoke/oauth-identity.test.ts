/**
 * Pins that execute context comes from grant props (`ctx.props`), never from
 * `ctx.auth`/`authInfo` or the raw bearer token. Only the sandbox runner is stubbed.
 */
import { env, SELF } from "cloudflare:test";
import { getOAuthApi } from "@cloudflare/workers-oauth-provider";
import { describe, expect, it, vi } from "vitest";
import { mcpResource, oauthProviderOptions } from "../../src/auth/gate";

const captured = vi.hoisted(() => ({ contexts: [] as unknown[] }));

vi.mock("../../src/executor/run", () => ({
  createExecuteRunner: () => async (_code: string, context?: unknown) => {
    captured.contexts.push(context);
    return {
      ok: false as const,
      error: "captured",
      errorName: "other" as const,
      logs: [],
      operationSummary: { total: 0, ok: 0, error: 0, softEmpty: 0 },
      sourceSummary: {},
      evidenceSummary: {
        kind: "none",
        skillRead: false,
        buildAuthoritySkillIds: [],
        buildAuthorityRoles: [],
        skillRuns: 0,
        artifactReads: 0
      }
    };
  }
}));

const ORIGIN = "https://raven.stellar.org";
const REDIRECT_URI = "https://client.example/callback";
const VERIFIER = "v".repeat(43);

async function challenge(): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(VERIFIER));
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

/** An access token whose auth identity (`userId`) and grant props can differ. */
async function accessToken(userId: string, props: unknown): Promise<string> {
  const options = oauthProviderOptions({ fetch: () => new Response("unused") }, mcpResource(ORIGIN));
  const bindings = { ...env, OAUTH_PROVIDER: undefined } as unknown as Env;
  const helpers = getOAuthApi(options, bindings);
  const client = await helpers.createClient({
    clientName: "Identity pin client", redirectUris: [REDIRECT_URI],
    grantTypes: ["authorization_code", "refresh_token"], responseTypes: ["code"],
    tokenEndpointAuthMethod: "none"
  });
  const parsed = await helpers.parseAuthRequest(new Request(`${ORIGIN}/authorize?${new URLSearchParams({
    response_type: "code", client_id: client.clientId, redirect_uri: REDIRECT_URI, scope: "mcp",
    resource: mcpResource(ORIGIN), code_challenge: await challenge(), code_challenge_method: "S256"
  })}`));
  const { redirectTo } = await helpers.completeAuthorization({
    request: parsed, userId, scope: ["mcp"], metadata: {}, props
  });
  const exchanged = await SELF.fetch(`${ORIGIN}/token`, {
    method: "POST",
    body: new URLSearchParams({
      grant_type: "authorization_code", client_id: client.clientId,
      code: new URL(redirectTo).searchParams.get("code")!, code_verifier: VERIFIER,
      redirect_uri: REDIRECT_URI, resource: mcpResource(ORIGIN)
    })
  });
  expect(exchanged.status).toBe(200);
  return ((await exchanged.json()) as { access_token: string }).access_token;
}

async function executeAs(token: string): Promise<Record<string, unknown>> {
  captured.contexts.length = 0;
  const response = await SELF.fetch(`${ORIGIN}/mcp`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`, origin: ORIGIN,
      "content-type": "application/json", accept: "application/json, text/event-stream"
    },
    body: JSON.stringify({
      jsonrpc: "2.0", id: 1, method: "tools/call",
      params: { name: "execute", arguments: { code: "async () => 1" } }
    })
  });
  expect(response.status).toBe(200);
  await response.text();
  expect(captured.contexts).toHaveLength(1);
  return captured.contexts[0] as Record<string, unknown>;
}

describe("OAuth identity comes from grant props, not ctx.auth", () => {
  it("uses the props subject when the auth identity differs, and carries no token or auth field", async () => {
    const token = await accessToken("auth-identity-A", { subject: "props-subject-B", clientId: "client-x", scopes: ["mcp"] });
    const context = await executeAs(token);
    expect(context.artifactOwner).toBe("props-subject-B");
    expect(Object.keys(context).sort()).toEqual(["artifactOwner", "rayId", "requestId"]);
    const serialized = JSON.stringify(context);
    expect(serialized).not.toContain(token);
    expect(serialized).not.toContain("auth-identity-A");
  });

  it.each([
    ["props with no subject", { clientId: "client-x", scopes: ["mcp"] }],
    ["an empty subject", { subject: "", clientId: "client-x" }],
    ["a non-string subject", { subject: 42, clientId: "client-x" }],
    ["a subject-like field under another name", { userId: "auth-identity-C", sub: "auth-identity-C" }]
  ])("stays ownerless for %s, whatever the auth identity", async (_label, props) => {
    const token = await accessToken("auth-identity-C", props);
    const context = await executeAs(token);
    expect(context.artifactOwner).toBeUndefined();
    expect(JSON.stringify(context)).not.toContain("auth-identity-C");
    expect(JSON.stringify(context)).not.toContain(token);
  });
});
