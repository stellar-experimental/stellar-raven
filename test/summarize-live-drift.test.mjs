import { describe, expect, it } from "vitest";
import { classifyDocsBackend, classifyOpenapiOperations, diffDocsTitles, summarizeDocsAnchors } from "../scripts/summarize-live-drift.mjs";

const spec = (operation) => ({ paths: { "/api/example": { get: operation } } });

describe("live drift OpenAPI classification", () => {
  it("classifies an x-routing-only change as routing text, not schema", () => {
    const oldSpec = spec({
      operationId: "getExample",
      summary: "Example",
      description: "Read an example",
      "x-routing": { useFor: ["old term"] }
    });
    const nextSpec = spec({
      operationId: "getExample",
      summary: "Example",
      description: "Read an example",
      "x-routing": { useFor: ["new term"] }
    });
    const result = classifyOpenapiOperations(oldSpec, nextSpec, "scout");
    expect(result.textChanged).toEqual(["scout.getExample (GET /api/example)"]);
    expect(result.schemaChanged).toEqual([]);
  });

  it("keeps schema-only changes in the schema bucket", () => {
    const oldSpec = spec({ operationId: "getExample", responses: { 200: { description: "ok" } } });
    const nextSpec = spec({ operationId: "getExample", responses: { 200: { description: "changed" } } });
    const result = classifyOpenapiOperations(oldSpec, nextSpec, "scout");
    expect(result.textChanged).toEqual([]);
    expect(result.schemaChanged).toEqual(["scout.getExample (GET /api/example)"]);
  });

  it("classifies an operationId rename as both surface and routing drift", () => {
    const oldSpec = spec({ operationId: "getExample" });
    const nextSpec = spec({ operationId: "readExample" });
    const result = classifyOpenapiOperations(oldSpec, nextSpec, "scout");
    expect(result.renamed).toEqual([
      "GET /api/example: scout.getExample -> scout.readExample"
    ]);
    expect(result.textChanged).toEqual(["scout.readExample (GET /api/example)"]);
  });
});

const docsInventory = (overrides = {}) => ({
  source: { backend: "mintlify", subdomain: "stellardevelopmentfoundation", authEnv: "MINTLIFY_ASSISTANT_API_KEY" },
  contract: { pageProbe: { resultShape: { content: "string", path: "string" } } },
  pageIndex: { pageCount: 2, indexFiles: [{ path: "/llms.txt", pageCount: 2, sha256: "a" }] },
  ...overrides
});

describe("live drift Stellar Docs classification", () => {
  it("reports changed pages, removed pages, and ambiguous anchor headings", () => {
    const oldIndex = { pages: { "/docs/a": { A: ["a"] }, "/docs/removed": {}, "/docs/held": {} } };
    const nextIndex = { pages: { "/docs/a": { A: ["a", "a-1"] }, "/docs/added": {}, "/docs/held": {} } };
    expect(summarizeDocsAnchors(oldIndex, nextIndex)).toEqual([
      "- src/adapters/stellar-docs-anchors.json: section anchor index changed.",
      "  - changed pages: 2",
      "  - removed pages: 1",
      "  - ambiguous headings: 1"
    ]);
  });

  it("reports only page-index churn when identity and contract hold", () => {
    const next = docsInventory({
      pageIndex: { pageCount: 3, indexFiles: [{ path: "/llms.txt", pageCount: 3, sha256: "b" }] }
    });
    const lines = classifyDocsBackend(docsInventory(), next);
    expect(lines.join("\n")).toContain("llms.txt page index changed (2 -> 3 pages)");
    expect(lines.join("\n")).toContain("/llms.txt: 2 -> 3 pages, content changed");
    expect(lines.join("\n")).not.toContain("backend identity changed");
    expect(lines.join("\n")).not.toContain("response shape changed");
  });

  it("flags a backend identity change and a contract shape change", () => {
    const next = docsInventory({
      source: { backend: "mintlify", subdomain: "other", authEnv: "MINTLIFY_ASSISTANT_API_KEY" },
      contract: { pageProbe: { resultShape: { markdown: "string", path: "string" } } }
    });
    const text = classifyDocsBackend(docsInventory(), next).join("\n");
    expect(text).toContain("backend identity changed");
    expect(text).toContain("response shape changed");
    expect(text).not.toContain("page index changed");
  });

  it("diffs titles as path/title pairs", () => {
    const oldInv = { titles: [{ path: "/docs/a", title: "A" }, { path: "/docs/b", title: "B" }] };
    const nextInv = { titles: [{ path: "/docs/a", title: "A" }, { path: "/docs/b", title: "B2" }] };
    expect(diffDocsTitles(oldInv, nextInv)).toEqual({ added: ["/docs/b B2"], removed: ["/docs/b B"] });
  });
});
