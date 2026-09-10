import { env, SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

const ORIGIN = "https://raven.stellar.org";
const INSECURE_REDIRECT = "http://client.example/callback";

function registrationRequest(redirectUri: string): Request {
  return new Request(`${ORIGIN}/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      client_name: "Reserved-domain smoke client",
      redirect_uris: [redirectUri],
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      token_endpoint_auth_method: "none"
    })
  });
}

function authorizationUrl(clientId: string, responseType = "code"): string {
  return `${ORIGIN}/authorize?${new URLSearchParams({
    response_type: responseType,
    client_id: clientId,
    redirect_uri: INSECURE_REDIRECT,
    scope: "mcp",
    state: "smoke-state",
    code_challenge: "a".repeat(43),
    code_challenge_method: "S256"
  })}`;
}

async function seedLegacyHttpClient(clientId: string): Promise<void> {
  await env.OAUTH_KV.put(
    `client:${clientId}`,
    JSON.stringify({
      clientId,
      clientName: "Legacy reserved-domain client",
      redirectUris: [INSECURE_REDIRECT],
      grantTypes: ["authorization_code", "refresh_token"],
      responseTypes: ["code"],
      registrationDate: Math.floor(Date.now() / 1000),
      tokenEndpointAuthMethod: "none",
      authMethodExplicit: true
    })
  );
}

describe("assembled OAuth redirect transport policy", () => {
  it("rejects non-loopback HTTP at dynamic registration", async () => {
    const response = await SELF.fetch(registrationRequest(INSECURE_REDIRECT));

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: "invalid_client_metadata" });
  });

  it.each([
    ["HTTPS", "https://client.example/callback"],
    ["loopback HTTP", "http://127.0.0.1:8912/callback"],
    ["native-app scheme", "org.example.app:/oauth/callback"]
  ])("allows %s at dynamic registration", async (_label, redirectUri) => {
    const response = await SELF.fetch(registrationRequest(redirectUri));

    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject({ redirect_uris: [redirectUri] });
  });

  it.each(["GET", "POST"])(
    "refuses legacy non-loopback HTTP on the %s authorization leg",
    async (method) => {
      const clientId = `legacy-http-${method.toLowerCase()}`;
      await seedLegacyHttpClient(clientId);
      const response = await SELF.fetch(authorizationUrl(clientId), { method });

      expect(response.status).toBe(400);
      expect(response.headers.get("location")).toBeNull();
      expect(response.headers.get("set-cookie")).toBeNull();
    }
  );

  it.each(["GET", "POST"])(
    "does not trust an unsafe provider error redirect on the %s authorization leg",
    async (method) => {
      const clientId = `legacy-error-${method.toLowerCase()}`;
      await seedLegacyHttpClient(clientId);
      const response = await SELF.fetch(authorizationUrl(clientId, "token"), { method });

      expect(response.status).toBe(400);
      expect(response.headers.get("location")).toBeNull();
      expect(response.headers.get("set-cookie")).toBeNull();
    }
  );
});
