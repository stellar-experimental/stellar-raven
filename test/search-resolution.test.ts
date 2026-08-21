import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { Client } from "@modelcontextprotocol/client";
import { McpServer, InMemoryTransport } from "@modelcontextprotocol/server";
import { getCatalog } from "../src/catalog/load.ts";
import {
  prepareCatalogSearch
} from "../src/catalog/search-resolution.ts";
import {
  recoveryCandidates,
  searchCatalogPage,
  type RecoveryCandidate,
  type SearchHit,
  type WiderCandidate
} from "../src/catalog/search.ts";
import { buildSandbox } from "../src/executor/providers.ts";
import { registerTools } from "../src/mcp/tools.ts";
import { staticSkillSource } from "./helpers/skill-source.ts";

type SearchFacts = {
  hits: SearchHit[];
  total: number;
  truncated: boolean;
  recovery: RecoveryCandidate[];
  widerCandidates: WiderCandidate[];
};

type McpSearchResult = {
  isError?: boolean;
  content?: Array<{ type: string; text?: string }>;
  structuredContent?: unknown;
};

const catalog = getCatalog();
const env = {
  LUMENLOOP_API_KEY: "test-key-not-real-1234",
  ALGOLIA_APPLICATION_ID_DOCS: "TESTAPPID",
  ALGOLIA_API_KEY_DOCS: "test"
};

let client: Client;
let server: McpServer;
let sandboxSearch: (arg?: unknown) => Promise<unknown>;
let logSpy: ReturnType<typeof vi.spyOn>;

beforeAll(async () => {
  logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  server = new McpServer({ name: "search-resolution-test", version: "0.0.0" });
  registerTools(server);
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  client = new Client({ name: "search-resolution-client", version: "0.0.0" });
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

  const codemode = buildSandbox(catalog, staticSkillSource({}), env)
    .find((provider) => provider.name === "codemode");
  if (!codemode?.fns.search) throw new Error("codemode.search is unavailable in the test sandbox");
  sandboxSearch = codemode.fns.search;
});

afterAll(async () => {
  await Promise.all([client.close(), server.close()]);
  logSpy.mockRestore();
});

async function mcpCall(arguments_: Record<string, unknown>): Promise<McpSearchResult> {
  return client.callTool({ name: "search", arguments: arguments_ }) as Promise<McpSearchResult>;
}

async function mcpFacts(arguments_: Record<string, unknown>): Promise<SearchFacts> {
  const result = await mcpCall(arguments_);
  expect(result.isError).toBeFalsy();
  const facts = result.structuredContent as SearchFacts & { nextSteps: string };
  expect(result.content?.[0]?.text).toBe(JSON.stringify(facts));
  return {
    hits: facts.hits,
    total: facts.total,
    truncated: facts.truncated,
    recovery: facts.recovery,
    widerCandidates: facts.widerCandidates
  };
}

async function sandboxFacts(arguments_: Record<string, unknown>): Promise<SearchFacts> {
  const result = await sandboxSearch(arguments_) as SearchFacts & { ok: boolean };
  expect(result.ok).toBe(true);
  return {
    hits: result.hits,
    total: result.total,
    truncated: result.truncated,
    recovery: result.recovery,
    widerCandidates: result.widerCandidates
  };
}

describe("prepareCatalogSearch staged resolution", () => {
  it("matches the established page and recovery helpers for a valid request", () => {
    const request = {
      query: "builder directory",
      kind: "operation" as const,
      service: "scout",
      limit: 5,
      recoverFrom: ["scout.getBuilders"],
      reason: "empty" as const
    };
    const prepared = prepareCatalogSearch(catalog, request.service);
    if (!prepared.ok) throw new Error("valid service was rejected");
    const recoveryStage = prepared.checkRecoveryIds(request.recoverFrom);
    if (!recoveryStage.ok) throw new Error("valid recovery ids were rejected");
    const resolution = recoveryStage.resolve(request);

    expect(resolution).toEqual({
      page: searchCatalogPage(catalog, request),
      recovery: recoveryCandidates(catalog, request.recoverFrom, request.reason)
    });
  });

  it("keeps exact service validation before exact recovery-id validation", () => {
    expect(prepareCatalogSearch(catalog, "stellardocs")).toEqual({
      ok: false,
      issue: {
        code: "unknown-service",
        service: "stellardocs",
        validServices: ["lumenloop", "scout", "skills", "stellarDocs"]
      }
    });
  });

  it("rejects unknown, skill, and section recovery ids without fuzzy resolution", () => {
    const skill = catalog.entries.find((entry) => entry.kind === "skill");
    const section = catalog.entries.find((entry) => entry.kind === "skill-section");
    if (!skill || !section) throw new Error("catalog needs skill fixtures");
    const prepared = prepareCatalogSearch(catalog, undefined);
    if (!prepared.ok) throw new Error("unfiltered search was rejected");

    expect(prepared.checkRecoveryIds(["scout.getBuilder", skill.id, section.id])).toEqual({
      ok: false,
      issue: {
        code: "unknown-recovery-ids",
        ids: ["scout.getBuilder", skill.id, section.id]
      }
    });
  });

  it("keeps a reason without recovery ids inert", () => {
    const prepared = prepareCatalogSearch(catalog, undefined);
    if (!prepared.ok) throw new Error("unfiltered search was rejected");
    const recoveryStage = prepared.checkRecoveryIds();
    if (!recoveryStage.ok) throw new Error("empty recovery ids were rejected");
    const baseline = recoveryStage.resolve({ query: "builder directory", limit: 5 });
    const reasonOnly = recoveryStage.resolve({
      query: "builder directory",
      limit: 5,
      reason: "empty"
    });
    expect(reasonOnly).toEqual(baseline);
    expect(reasonOnly.recovery).toEqual([]);
  });
});

describe("MCP and sandbox search-resolution parity", () => {
  it("keeps valid search facts identical", async () => {
    const args = { query: "builder directory", kind: "operation", service: "scout", limit: 5 };
    expect(await sandboxFacts(args)).toEqual(await mcpFacts(args));
  });

  it("keeps truncation and pagination facts identical", async () => {
    for (const limit of [5, 10]) {
      const args = { query: "stellar soroban contract", limit };
      const mcp = await mcpFacts(args);
      const sandbox = await sandboxFacts(args);
      expect(sandbox).toEqual(mcp);
      expect(mcp.hits).toHaveLength(limit);
      expect(mcp.total).toBeGreaterThan(mcp.hits.length);
      expect(mcp.truncated).toBe(true);
    }
  });

  it("keeps adapter-specific unknown-service responses exact", async () => {
    const args = { query: "docs search", service: "stellardocs" };
    const mcp = await mcpCall(args);
    expect(mcp.isError).toBe(true);
    const structured = mcp.structuredContent as SearchFacts & { nextSteps: string };
    expect(structured).toEqual({
      hits: [],
      total: 0,
      truncated: false,
      recovery: [],
      widerCandidates: [],
      nextSteps: 'Unknown service "stellardocs" — service filter values are exact-match. Valid services: lumenloop, scout, skills, stellarDocs. Retry with one of those exact values, or drop the `service` filter.'
    });
    expect(mcp.content?.[0]?.text).toBe(JSON.stringify(structured));

    expect(await sandboxSearch(args)).toEqual({
      ok: false,
      error: {
        service: "codemode",
        kind: "error",
        message: 'codemode.search: unknown service "stellardocs" — valid services (exact-match): lumenloop, scout, skills, stellarDocs'
      }
    });
  });

  it("keeps adapter-specific invalid recoverFrom handling", async () => {
    for (const recoverFrom of ["scout.getBuilders", [""], Array.from({ length: 11 }, () => "scout.getBuilders")]) {
      const args = { query: "builder directory", recoverFrom };
      expect((await mcpCall(args)).isError).toBe(true);
      expect(await sandboxSearch(args)).toEqual({
        ok: false,
        error: {
          service: "codemode",
          kind: "error",
          message: "codemode.search: recoverFrom must be an array of at most 10 non-empty exact operation ids"
        }
      });
    }
  });

  it("keeps adapter-specific unknown recoverFrom responses exact", async () => {
    const args = { query: "builder directory", recoverFrom: ["scout.getBuilder"] };
    const mcp = await mcpCall(args);
    expect(mcp.isError).toBe(true);
    const structured = mcp.structuredContent as SearchFacts & { nextSteps: string };
    expect(structured).toEqual({
      hits: [],
      total: 0,
      truncated: false,
      recovery: [],
      widerCandidates: [],
      nextSteps: 'Unknown recoverFrom operation id(s): "scout.getBuilder". Recovery ids are exact-match; discover valid operations with search first.'
    });
    expect(mcp.content?.[0]?.text).toBe(JSON.stringify(structured));

    expect(await sandboxSearch(args)).toEqual({
      ok: false,
      error: {
        service: "codemode",
        kind: "error",
        message: 'codemode.search: unknown recoverFrom operation id(s) "scout.getBuilder" — ids are exact-match'
      }
    });
  });

  it("keeps adapter-specific unknown-reason handling", async () => {
    const args = { query: "builder directory", reason: "uncertain" };
    expect((await mcpCall(args)).isError).toBe(true);
    expect(await sandboxSearch(args)).toEqual({
      ok: false,
      error: {
        service: "codemode",
        kind: "error",
        message: "codemode.search: unknown recovery reason \"uncertain\" — valid reasons: empty, weak, adjacent, ambiguous, partial"
      }
    });
  });

  it("keeps the sandbox recovery-ID error when MCP rejects the same collision at its schema", async () => {
    const args = {
      query: "builder directory",
      recoverFrom: ["scout.getBuilder"],
      reason: "uncertain"
    };
    expect((await mcpCall(args)).isError).toBe(true);
    expect(await sandboxSearch(args)).toEqual({
      ok: false,
      error: {
        service: "codemode",
        kind: "error",
        message: 'codemode.search: unknown recoverFrom operation id(s) "scout.getBuilder" — ids are exact-match'
      }
    });
  });

  it("keeps a reason without recoverFrom inert in both adapters", async () => {
    const baselineArgs = { query: "builder directory", limit: 5 };
    const reasonArgs = { ...baselineArgs, reason: "empty" };
    expect(await mcpFacts(reasonArgs)).toEqual(await mcpFacts(baselineArgs));
    expect(await sandboxFacts(reasonArgs)).toEqual(await sandboxFacts(baselineArgs));
    expect(await sandboxFacts(reasonArgs)).toEqual(await mcpFacts(reasonArgs));
  });

  it("keeps explicit recovery and ranking facts identical", async () => {
    const args = {
      query: "builder directory",
      limit: 5,
      recoverFrom: ["scout.getBuilders"],
      reason: "empty"
    };
    const mcp = await mcpFacts(args);
    expect(await sandboxFacts(args)).toEqual(mcp);
    expect(mcp.recovery.map((candidate) => candidate.id)).toEqual([
      "lumenloop.search_content_semantic",
      "scout.searchResearch"
    ]);
  });

  it("keeps wider candidates identical", async () => {
    const args = {
      query: "Tomer Weller",
      kind: "operation",
      service: "lumenloop",
      limit: 5
    };
    const mcp = await mcpFacts(args);
    expect(await sandboxFacts(args)).toEqual(mcp);
    expect(mcp.hits.every((hit) => hit.tier === "backfill")).toBe(true);
    expect(mcp.widerCandidates.map((candidate) => candidate.id)).toEqual([
      "lumenloop.find_av_passages",
      "lumenloop.search_content_semantic"
    ]);
  });

  it("keeps null and non-number limit behavior in each adapter", async () => {
    const baseline = await sandboxFacts({ query: "builder directory" });
    for (const limit of [null, "5"]) {
      const args = { query: "builder directory", limit };
      expect((await mcpCall(args)).isError).toBe(true);
      expect(await sandboxFacts(args)).toEqual(baseline);
    }
  });
});
