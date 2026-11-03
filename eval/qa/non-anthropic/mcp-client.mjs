import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { surfaceMetrics, assertExpectedSourceRevision, assertExpectedSurface, parseMcpHttpPayload } from "../../lib/mcp-surface.mjs";
import { validateTools } from "./core.mjs";

export async function connectMcp(plan) {
  const endpoint = `http://localhost:${plan.server.port}/mcp`;
  const client = new Client({ name: "direct-grok-host-loop-diagnostic", version: "1" }, { capabilities: {} });
  let initialized = null;
  let listed = null;
  const transport = new StreamableHTTPClientTransport(new URL(endpoint), {
    requestInit: { redirect: "error" },
    fetch: async (input, init = {}) => {
      const url = new URL(typeof input === "string" || input instanceof URL ? input : input.url);
      if (url.href !== endpoint) throw new Error("noncanonical-mcp-target");
      const response = await fetch(input, { ...init, redirect: "error", signal: init.signal
        ? AbortSignal.any([init.signal, AbortSignal.timeout(65_000)]) : AbortSignal.timeout(65_000) });
      const request = typeof init.body === "string" ? JSON.parse(init.body) : null;
      if (response.ok && ["initialize", "tools/list"].includes(request?.method)) {
        const raw = parseMcpHttpPayload(await response.clone().text());
        if (!raw?.result) throw new Error("missing-raw-mcp-metadata");
        if (request.method === "initialize") initialized = raw.result;
        else listed = raw.result;
      }
      return response;
    }
  });
  try {
    await client.connect(transport);
    async function surface() {
      await client.listTools();
      const list = listed;
      if (!list || list.nextCursor) throw new Error("missing-or-paginated-wire-tools");
      validateTools(list.tools);
      const instructions = client.getInstructions();
      if (typeof instructions !== "string" || !instructions) throw new Error("missing-server-instructions");
      // The SDK's Implementation schema strips custom sourceRevision metadata.
      // Keep the original wire value; never stamp a revision into the response.
      const serverInfo = initialized?.serverInfo;
      if (initialized?.instructions !== instructions) throw new Error("mcp-instructions-projection-changed");
      const metrics = surfaceMetrics(list.tools, instructions);
      assertExpectedSourceRevision(serverInfo, plan.server.revision);
      assertExpectedSurface(metrics, plan.server.surfaceSha256);
      return { tools: list.tools, instructions, serverInfo, metrics };
    }
    const initial = await surface();
    return {
      ...initial, surface,
      callTool(name, input) {
        if (!["search", "execute"].includes(name)) throw new Error("forbidden-mcp-target");
        return client.callTool({ name, arguments: input }, { timeout: 65_000 });
      },
      close: () => client.close()
    };
  } catch (error) { await client.close(); throw error; }
}
