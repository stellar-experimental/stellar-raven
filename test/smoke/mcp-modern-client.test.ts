/**
 * Modern-wire smoke: a real MCP 2026 client
 * (@modelcontextprotocol/client 2.0) connects to the assembled worker over
 * streamable HTTP through the named-API-key bypass. Under the pre-2.0 stack
 * the client's `server/discover` negotiation probe was answered 400 and the
 * client silently fell back to the 2025 lifecycle. This test pins the probe
 * response to 2xx. A regression to legacy-only serving must fail this test.
 */
import { env, SELF } from "cloudflare:test";
import { beforeAll, describe, expect, it } from "vitest";
import { Client } from "@modelcontextprotocol/client";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { EXPECTED_TOOL_METADATA } from "../helpers/mcp-tool-metadata";

const PUBLIC = "https://raven.stellar.org";
const TOKEN = "m".repeat(43);

beforeAll(async () => {
  const digest = new Uint8Array(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(TOKEN))
  );
  await env.OAUTH_KV.put(
    "raven:api-key:v1:modern-smoke",
    [...digest].map((byte) => byte.toString(16).padStart(2, "0")).join("")
  );
});

describe("modern (2026-07-28) client end-to-end", () => {
  it("negotiates the modern era and serves both tools + instructions", async () => {
    const exchanges: { mcpMethod: string | null; status: number }[] = [];
    const spyFetch: typeof fetch = async (input, init) => {
      const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined));
      const response = await SELF.fetch(input instanceof Request ? input : String(input), init);
      exchanges.push({ mcpMethod: headers.get("mcp-method"), status: response.status });
      return response;
    };

    // pin (not 'auto'): connect() must negotiate exactly 2026-07-28 via
    // server/discover and fails loudly instead of falling back to legacy.
    const client = new Client(
      { name: "modern-smoke", version: "0.0.0" },
      { versionNegotiation: { mode: { pin: "2026-07-28" } } }
    );
    const transport = new StreamableHTTPClientTransport(new URL(`${PUBLIC}/mcp`), {
      fetch: spyFetch,
      requestInit: { headers: { Authorization: `Bearer modern-smoke:${TOKEN}` } }
    });
    await client.connect(transport);
    try {
      // The negotiation probe is the modern era's entry ticket: 400 here means
      // the server fell back to legacy-only serving.
      const probe = exchanges.find((e) => e.mcpMethod === "server/discover");
      expect(probe).toBeDefined();
      expect(probe!.status).toBeLessThan(300);

      expect(client.getServerVersion()?.name).toBe("stellar-raven-codemode");
      expect(client.getInstructions()).toContain("Unified Stellar-ecosystem gateway");

      const tools = await client.listTools();
      expect(tools.tools.map((t) => t.name).sort()).toEqual(["execute", "search"]);
      expect(tools.tools.find((tool) => tool.name === "search")).toMatchObject(
        EXPECTED_TOOL_METADATA.search
      );
      const execute = tools.tools.find((tool) => tool.name === "execute");
      expect(execute).toMatchObject(EXPECTED_TOOL_METADATA.execute);
      expect(execute).not.toHaveProperty("outputSchema");

      const result = await client.callTool({
        name: "search",
        arguments: { query: "soroban contract storage", limit: 3 }
      });
      const structured = result.structuredContent as { hits: { id: string }[]; nextSteps: string };
      expect(structured.hits.length).toBeGreaterThan(0);
      expect(structured.nextSteps.length).toBeGreaterThan(0);

      const executeResult = await client.callTool({
        name: "execute",
        arguments: { code: "async (codemode) => 1 + 1" }
      });
      expect(executeResult.isError).toBeFalsy();
      expect(executeResult.content).toHaveLength(1);
      expect(executeResult.content[0]).toMatchObject({ type: "text", text: "2" });
      expect(executeResult).not.toHaveProperty("structuredContent");
    } finally {
      await client.close();
    }
  });
});
