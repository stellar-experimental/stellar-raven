/**
 * Offline smoke of src/server.ts — the assembled router.
 * Its building blocks (gate.ts bypass logic, provider options, site pages)
 * are unit-tested in plain Node; what plain Node cannot exercise is this
 * file's dispatch wiring: bypass-before-provider ordering, the hostname
 * second factor at the URL level, the discovery-alias rewrite into the
 * provider, and defaultHandler routing. SELF drives the real `main` worker
 * from wrangler.jsonc, so a route-assembly regression fails here instead of
 * shipping green.
 *
 * Auth values are test-only fakes stored in the local OAUTH_KV binding.
 * Requests to /mcp go through the FULL stack — McpServer construction,
 * tool registration, streamable HTTP — so the named-key case doubles as
 * an initialize smoke (server info + instructions present).
 */
import { env, SELF } from "cloudflare:test";
import { canaryPins } from "../../src/skills/canary.ts";
import { getCatalog } from "../../src/catalog/load.ts";
import { beforeAll, describe, expect, it } from "vitest";
import { EXPECTED_TOOL_METADATA } from "../helpers/mcp-tool-metadata";

const PUBLIC = "https://raven.stellar.org";
const LOCAL = "http://localhost";
const TOKENS = {
  admin: "a".repeat(43),
  devrel: "d".repeat(43)
};

beforeAll(async () => {
  for (const [name, token] of Object.entries(TOKENS)) {
    const digest = new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token))
    );
    await env.OAUTH_KV.put(
      `raven:api-key:v1:${name}`,
      [...digest].map((byte) => byte.toString(16).padStart(2, "0")).join("")
    );
  }
});

function rpcBody(method: string, params: Record<string, unknown>, id: number): string {
  return JSON.stringify({
    jsonrpc: "2.0",
    id,
    method,
    params
  });
}

function initializeBody(): string {
  return rpcBody(
    "initialize",
    {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: { name: "smoke-test", version: "0.0.0" }
    },
    0
  );
}

async function postRpc(
  url: string,
  body: string,
  headers: Record<string, string> = {}
): Promise<Response> {
  return SELF.fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      ...headers
    },
    body
  });
}

async function postInitialize(url: string, headers: Record<string, string> = {}): Promise<Response> {
  return postRpc(url, initializeBody(), headers);
}

/** Streamable HTTP responses arrive as SSE — take the last `data:` payload. */
async function lastEventJson(res: Response): Promise<{
  result?: {
    serverInfo?: { name?: string };
    instructions?: string;
    tools?: { name: string }[];
    content?: Array<{ type?: string; text?: string }>;
    isError?: boolean;
    structuredContent?: { hits?: unknown[] };
  };
}> {
  const text = await res.text();
  const data = text
    .split("\n")
    .filter((l) => l.startsWith("data:"))
    .map((l) => l.slice(5).trim());
  return JSON.parse(data[data.length - 1] ?? text) as ReturnType<typeof JSON.parse>;
}

describe("defaultHandler routes", () => {
  it("GET /health returns the service heartbeat", async () => {
    const res = await SELF.fetch(`${PUBLIC}/health`);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "ok", service: "stellar-raven-codemode" });
  });

  it("the cron handler writes a verdict the endpoint then serves", async () => {
    // The wiring nobody else covers: cron trigger -> scheduled handler ->
    // canary -> KV -> endpoint. The unit tests exercise each half against
    // fakes; this proves the assembled Worker actually connects them, with the
    // real KV binding. Without it, a `scheduled` export that was never wired
    // (or wired to the wrong binding) would look perfectly healthy until an
    // outage arrived and the detector had never run.
    const worker = (await import("../../src/server.ts")).default;
    await worker.scheduled!(
      { scheduledTime: Date.now(), cron: "7 * * * *", noRetry() {} } as ScheduledController,
      env as never,
      // The handler awaits its own work and never touches ctx, so a stub is
      // enough — and passing one proves it does not secretly depend on it.
      { waitUntil() {}, passThroughOnException() {} } as unknown as ExecutionContext
    );
    // This lane's outbound wall serves the REAL pinned bodies locally, so the
    // sweep does genuine fetches and genuine sha256 + git-blob verification —
    // an honest green, not an offline shrug.
    const res = await SELF.fetch(`${PUBLIC}/health/skills`);
    const body = (await res.json()) as { ok: boolean; checked: number; checkedAt: string };
    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    // Every pinned file, not a sample — a canary that quietly checked zero
    // would also report ok:true.
    expect(body.checked).toBe(canaryPins(getCatalog()).length);
    expect(body.checked).toBeGreaterThan(0);
    expect(Number.isFinite(Date.parse(body.checkedAt))).toBe(true);
    // Public by design (it reports, never probes) — so it must not sit behind
    // the MCP auth wall, and must not have fallen through to the 404 handler.
    // Short edge cache bounds the KV reads an unauthenticated route can drive.
    expect(res.headers.get("cache-control")).toBe("public, max-age=60");
  });

  it("GET / serves the landing page", async () => {
    const res = await SELF.fetch(`${PUBLIC}/`);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/html");
  });

  it("unknown paths fall through to 404", async () => {
    const res = await SELF.fetch(`${PUBLIC}/definitely-not-a-route`);
    expect(res.status).toBe(404);
  });
});

describe("/mcp auth dispatch", () => {
  it("anonymous requests on the public hostname get 401 + WWW-Authenticate", async () => {
    const res = await postInitialize(`${PUBLIC}/mcp`);
    expect(res.status).toBe(401);
    expect(res.headers.get("www-authenticate")).toBeTruthy();
  });

  it("a wrong named key is NOT a bypass — falls through to the provider's 401", async () => {
    const res = await postInitialize(`${PUBLIC}/mcp`, {
      Authorization: `Bearer admin:${"x".repeat(43)}`
    });
    expect(res.status).toBe(401);
  });

  it("admin and devrel keys reach the real MCP server", async () => {
    for (const [name, token] of Object.entries(TOKENS)) {
      const res = await postInitialize(`${PUBLIC}/mcp`, {
        Authorization: `Bearer ${name}:${token}`
      });
      expect(res.status).toBe(200);
      const init = await lastEventJson(res);
      expect(init.result?.serverInfo?.name).toBe("stellar-raven-codemode");
      expect(init.result?.instructions).toContain("r.data.projects");
    }
  });

  it("serves the full 2025 legacy tool sequence through the named-key bypass", async () => {
    const headers = { Authorization: `Bearer admin:${TOKENS.admin}` };

    const initialized = await postInitialize(`${PUBLIC}/mcp`, headers);
    expect(initialized.status).toBe(200);
    expect((await lastEventJson(initialized)).result?.serverInfo?.name).toBe(
      "stellar-raven-codemode"
    );

    const listed = await postRpc(`${PUBLIC}/mcp`, rpcBody("tools/list", {}, 1), headers);
    expect(listed.status).toBe(200);
    const listedTools = (await lastEventJson(listed)).result?.tools ?? [];
    expect(listedTools.map((tool) => tool.name).sort()).toEqual(["execute", "search"]);
    expect(listedTools.find((tool) => tool.name === "search")).toMatchObject(
      EXPECTED_TOOL_METADATA.search
    );
    const execute = listedTools.find((tool) => tool.name === "execute");
    expect(execute).toMatchObject(EXPECTED_TOOL_METADATA.execute);
    expect(execute).not.toHaveProperty("outputSchema");

    const called = await postRpc(
      `${PUBLIC}/mcp`,
      rpcBody(
        "tools/call",
        { name: "search", arguments: { query: "soroban contract storage", limit: 3 } },
        2
      ),
      headers
    );
    expect(called.status).toBe(200);
    expect((await lastEventJson(called)).result?.structuredContent?.hits?.length).toBeGreaterThan(0);

    const executed = await postRpc(
      `${PUBLIC}/mcp`,
      rpcBody(
        "tools/call",
        { name: "execute", arguments: { code: "async (codemode) => 1 + 1" } },
        3
      ),
      headers
    );
    expect(executed.status).toBe(200);
    const executeResult = (await lastEventJson(executed)).result;
    expect(executeResult?.isError).toBeFalsy();
    expect(executeResult?.content).toHaveLength(1);
    expect(executeResult?.content?.[0]).toMatchObject({ type: "text", text: "2" });
    expect(executeResult).not.toHaveProperty("structuredContent");
  });

  it("allows configured public Origins, rejects foreign Origins, and permits no Origin", async () => {
    const authorization = `Bearer admin:${TOKENS.admin}`;
    // Every production origin, not just the canonical one: the stellar.buzz hosts
    // are documented as working aliases, so dropping one from the allowlist must
    // fail here rather than pass silently.
    for (const origin of [PUBLIC, "https://raven.stellar.buzz", "https://agents.stellar.buzz"]) {
      expect(
        (await postInitialize(`${PUBLIC}/mcp`, { Authorization: authorization, Origin: origin }))
          .status,
        `Origin ${origin} must be allowed`
      ).toBe(200);
    }
    expect(
      (
        await postInitialize(`${PUBLIC}/mcp`, {
          Authorization: authorization,
          Origin: "https://evil.example"
        })
      ).status
    ).toBe(403);
    expect((await postInitialize(`${PUBLIC}/mcp`, { Authorization: authorization })).status).toBe(
      200
    );
  });

  it("rejects the old unprefixed bearer and custom header", async () => {
    expect((await postInitialize(`${PUBLIC}/mcp`, {
      Authorization: `Bearer ${TOKENS.admin}`
    })).status).toBe(401);
    expect((await postInitialize(`${PUBLIC}/mcp`, {
      "X-MCP-Admin-Token": TOKENS.admin
    })).status).toBe(401);
  });

  it("dev bypass honors DEV_ALLOW_UNAUTHENTICATED on localhost…", async () => {
    // SELF.fetch sends no Host header; the SDK's localhost DNS-rebinding
    // check (2.0 stateless handler) rejects host-less requests, so set the
    // header a real HTTP client always sends.
    const res = await postInitialize(`${LOCAL}/mcp`, { Host: "localhost" });
    expect(res.status).toBe(200);
    const init = await lastEventJson(res);
    expect(init.result?.serverInfo?.name).toBe("stellar-raven-codemode");
  });

  it("…but the same var is inert on the public hostname (second factor)", async () => {
    // Same env, same path, only the hostname differs — must NOT bypass.
    const res = await postInitialize(`${PUBLIC}/mcp`);
    expect(res.status).toBe(401);
  });
});

describe("/playground routes", () => {
  it("GET /playground serves the locked playground page with the demo header set", async () => {
    const res = await SELF.fetch(`${PUBLIC}/playground`);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/html");
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(res.headers.get("x-robots-tag")).toBe("noindex");
    expect(res.headers.get("content-security-policy")).toContain("connect-src 'self'");
    // No demo cookie on the public hostname → locked state.
    expect(await res.text()).toContain("/playground/login");
  });

  it("GET /playground/ (trailing slash) is the same page; HEAD works too", async () => {
    const slash = await SELF.fetch(`${PUBLIC}/playground/`);
    expect(slash.status).toBe(200);
    const head = await SELF.fetch(`${PUBLIC}/playground`, { method: "HEAD" });
    expect(head.status).toBe(200);
    expect(head.headers.get("content-type")).toContain("text/html");
    expect(await head.text()).toBe("");
  });


  it("GET /playground on localhost takes the dev bypass → authenticated chat UI", async () => {
    const res = await SELF.fetch(`${LOCAL}/playground`);
    expect(res.status).toBe(200);
    expect(await res.text()).toContain("composer-form");
  });

  it("wrong methods on matched playground paths → 405 with Allow", async () => {
    const page = await SELF.fetch(`${PUBLIC}/playground`, { method: "DELETE" });
    expect(page.status).toBe(405);
    expect(page.headers.get("allow")).toBe("GET, HEAD");
    const options = await SELF.fetch(`${PUBLIC}/playground`, { method: "OPTIONS" });
    expect(options.status).toBe(405);
    expect(options.headers.get("allow")).toBe("GET, HEAD");
    const login = await SELF.fetch(`${PUBLIC}/playground/login`, { method: "POST" });
    expect(login.status).toBe(405);
    const chat = await SELF.fetch(`${PUBLIC}/playground/chat`);
    expect(chat.status).toBe(405);
    expect(chat.headers.get("allow")).toBe("POST");
  });

  it("non-exact /playground* paths fall through to the provider 404 (/playgrounds)", async () => {
    expect((await SELF.fetch(`${PUBLIC}/playgrounds`)).status).toBe(404);
    expect((await SELF.fetch(`${PUBLIC}/playground/other`)).status).toBe(404);
  });

  it("GET /playground/login parks state and 302s to WorkOS with the binding cookie", async () => {
    const res = await SELF.fetch(`${PUBLIC}/playground/login`, { redirect: "manual" });
    expect(res.status).toBe(302);
    const location = new URL(res.headers.get("location") ?? "");
    expect(location.origin).toBe("https://api.workos.com");
    expect(location.searchParams.get("state")).toBeTruthy();
    expect(res.headers.get("set-cookie")).toContain("__Host-MCP_STATE=");
  });

  it("POST /playground/chat: cross-origin → 403 before anything else", async () => {
    // Wrong Origin, and absent Origin, both fail the same-origin requirement.
    const wrong = await SELF.fetch(`${PUBLIC}/playground/chat`, {
      method: "POST",
      headers: { origin: "https://evil.example", "content-type": "application/json" },
      body: "{}"
    });
    expect(wrong.status).toBe(403);
    const absent = await SELF.fetch(`${PUBLIC}/playground/chat`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{}"
    });
    expect(absent.status).toBe(403);
    const crossSite = await SELF.fetch(`${PUBLIC}/playground/chat`, {
      method: "POST",
      headers: {
        origin: PUBLIC,
        "sec-fetch-site": "cross-site",
        "content-type": "application/json"
      },
      body: "{}"
    });
    expect(crossSite.status).toBe(403);
  });

  it("POST /playground/chat: same-origin but no session cookie → 401", async () => {
    const res = await SELF.fetch(`${PUBLIC}/playground/chat`, {
      method: "POST",
      headers: { origin: PUBLIC, "content-type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content: "hi" }] })
    });
    expect(res.status).toBe(401);
  });

  it("POST /playground/chat: dev bypass on localhost reaches body validation (400 pre-model)", async () => {
    // Malformed body fails AFTER auth but BEFORE the throttle (no slot
    // burned) and BEFORE any AI binding call — proves the gauntlet order
    // without spending a model turn.
    const res = await SELF.fetch(`${LOCAL}/playground/chat`, {
      method: "POST",
      headers: { origin: LOCAL, "content-type": "application/json" },
      body: JSON.stringify({ messages: [] })
    });
    expect(res.status).toBe(400);
  });
});

describe("discovery alias rewrite", () => {
  it("OIDC discovery path serves the RFC 8414 metadata", async () => {
    const res = await SELF.fetch(`${PUBLIC}/.well-known/openid-configuration`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { issuer?: string; authorization_endpoint?: string };
    expect(body.issuer).toBeTruthy();
    expect(body.authorization_endpoint).toContain("/authorize");
  });

  it("path-suffixed RFC 8414 form aliases onto the exact-path endpoint", async () => {
    const res = await SELF.fetch(`${PUBLIC}/.well-known/oauth-authorization-server/mcp`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { issuer?: string };
    expect(body.issuer).toBeTruthy();
  });
});
