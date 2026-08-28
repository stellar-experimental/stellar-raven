import { describe, expect, it, vi } from "vitest";
import {
  EXPECTED_OPERATION_COUNTS,
  assertLoopbackMcpUrl,
  executeCodeForOperation,
  forwardOperation,
  loadPlainOperationSurface,
  operationIdFromPlainTool,
  parseMcpHttpResponse,
  plainToolName
} from "../eval/qa/plain-operation-harness.mjs";

describe("plain operation eval harness", () => {
  it("derives exactly the exposed 60-operation manifest surface", () => {
    const surface = loadPlainOperationSurface();
    expect(surface.tools).toHaveLength(60);
    expect(surface.metrics.serviceCounts).toEqual(EXPECTED_OPERATION_COUNTS);
    expect(surface.metrics.toolCount).toBe(60);
    expect(surface.metrics.serializedToolsChars).toBeGreaterThan(surface.metrics.descriptionsChars);
    expect(surface.metrics.metricMeaning).toMatch(/not consumed model context/);
    expect(surface.metrics.surfaceSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(new Set(surface.tools.map((tool) => tool.name)).size).toBe(60);
    for (const tool of surface.tools) {
      const id = operationIdFromPlainTool(tool.name);
      expect(plainToolName(id)).toBe(tool.name);
      expect(surface.byName.get(tool.name)?.id).toBe(id);
    }
  });

  it("generates a fixed operation call with JSON-only model arguments", () => {
    const entry = { id: "scout.searchProjects" };
    const code = executeCodeForOperation(entry, { query: "x\"); throw new Error('no') //" });
    expect(code).toBe(
      'async () => scout.searchProjects(JSON.parse("{\\"query\\":\\"x\\\\\\\"); throw new Error(\'no\') //\\"}"))'
    );
  });

  it("rejects double-underscore operation names instead of relying on parsing convention", () => {
    expect(() => plainToolName("scout.bad__name")).toThrow(/double underscores/);
    expect(operationIdFromPlainTool("scout_bad__name")).toBeNull();
  });

  it("preserves __proto__ as an own argument key", () => {
    const args = JSON.parse('{"__proto__":{"polluted":true},"query":"safe"}');
    const code = executeCodeForOperation({ id: "scout.searchProjects" }, args);
    expect(code).toContain('JSON.parse("{\\"__proto__\\"');
    expect(code).not.toContain('searchProjects({"__proto__"');
  });

  it("accepts only a loopback MCP upstream", () => {
    expect(assertLoopbackMcpUrl("http://localhost:8787/mcp")).toBe("http://localhost:8787/mcp");
    expect(assertLoopbackMcpUrl("http://127.0.0.1:8787/mcp")).toBe("http://127.0.0.1:8787/mcp");
    expect(() => assertLoopbackMcpUrl("https://raven.stellar.org/mcp")).toThrow(/loopback/);
    expect(() => assertLoopbackMcpUrl("http://localhost:8787/not-mcp")).toThrow(/loopback/);
  });

  it("parses JSON and SSE MCP responses", () => {
    expect(parseMcpHttpResponse('{"jsonrpc":"2.0","id":1,"result":{"ok":true}}').result.ok).toBe(true);
    expect(
      parseMcpHttpResponse('event: message\ndata: {"jsonrpc":"2.0","id":1,"result":{"ok":true}}\n\n').result.ok
    ).toBe(true);
  });

  it("forwards one plain tool through the shipped execute surface", async () => {
    const fetchImpl = vi.fn(async (_url, init) => {
      const request = JSON.parse(init.body);
      expect(request.params.name).toBe("execute");
      expect(request.params.arguments.code).toBe(
        'async () => stellarDocs.search_docs(JSON.parse("{\\"query\\":\\"fees\\"}"))'
      );
      return new Response(
        'event: message\ndata: {"jsonrpc":"2.0","id":7,"result":{"content":[{"type":"text","text":"{\\"ok\\":true}"}]}}\n\n',
        { status: 200 }
      );
    });
    const result = await forwardOperation({
      upstreamUrl: "http://localhost:8787/mcp",
      entry: { id: "stellarDocs.search_docs" },
      args: { query: "fees" },
      requestId: 7,
      fetchImpl
    });
    expect(result.content[0].text).toBe('{"ok":true}');
    expect(fetchImpl).toHaveBeenCalledOnce();
  });
});
