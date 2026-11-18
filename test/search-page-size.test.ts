/**
 * Free measurement of the public `search` page at two limits. It is skipped unless
 * RAVEN_PAGE_SIZE_OUT is set, so `npm test` never writes a report:
 *
 *   RAVEN_PAGE_SIZE_OUT=<report.json> \
 *   [RAVEN_PAGE_SIZE_SPLIT=<split.json> RAVEN_PAGE_SIZE_RESULTS=<label>=<results.json>,...] \
 *     npx vitest run test/search-page-size.test.ts
 *
 * Part 1 asks every legacy and extended routing question through an in-memory MCP client at limits 5
 * and 7 and reports the size of the tool result text in bytes (Grok clips a result at 20,000 bytes;
 * Claude Code warns at 10,000 tokens, about 40,000 bytes). Only aggregates are written.
 *
 * Part 2, when a split and results are given, takes each stored `search` call that passed no
 * `limit` (the calls the default governs), asks the same query at 5 and 7, and prices the extra
 * bytes against the question's input tokens: bytes / 4 tokens, reread once by every later model
 * call of that question. Rows are selected by `sets.tuning` id before any other field is read.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { McpServer } from "@modelcontextprotocol/server";
import { Client } from "@modelcontextprotocol/client";
import { InMemoryTransport } from "@modelcontextprotocol/server";
import { registerTools } from "../src/mcp/tools";
import { selectById, tuningIdsOf } from "../eval/qa/tuning-rows.mjs";

vi.mock("cloudflare:workers", () => ({
  tracing: { async trace<T>(_name: string, fn: () => T | Promise<T>): Promise<T> { return await fn(); } },
  WorkerEntrypoint: class WorkerEntrypoint {}
}));
vi.mock("agents/mcp/server", () => ({ createMcpHandler: vi.fn(() => () => new Response(null, { status: 404 })), getMcpAuthContext: vi.fn(() => undefined) }));
vi.mock("@cloudflare/codemode", () => ({ DynamicWorkerExecutor: class DynamicWorkerExecutor {} }));
vi.mock("../src/executor/run", () => ({ createExecuteRunner: vi.fn() }));

const OUT = process.env.RAVEN_PAGE_SIZE_OUT;
const SPLIT = process.env.RAVEN_PAGE_SIZE_SPLIT;
const RESULTS = process.env.RAVEN_PAGE_SIZE_RESULTS;

type Page = { bytes: number; hits: number };
const quantile = (sorted: number[], q: number) => sorted[Math.min(sorted.length - 1, Math.ceil(q * sorted.length) - 1)]!;
const share = (v: number[]) => ({ meanPercent: +(100 * (v.reduce((a, b) => a + b, 0) / (v.length || 1))).toFixed(3), maxPercent: +(100 * Math.max(0, ...v)).toFixed(3) });
const summary = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return { n: values.length, mean: Math.round(mean), p50: quantile(sorted, 0.5), p90: quantile(sorted, 0.9), max: sorted.at(-1) };
};

async function connected(): Promise<Client> {
  const server = new McpServer({ name: "page-size", version: "0.0.0" });
  registerTools(server, {});
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "page-size-client", version: "0.0.0" });
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  return client;
}

describe.skipIf(!OUT)("search page size at limits 5 and 7", () => {
  it("measures the routing questions and, when given, the stored default-limit searches", async () => {
    const client = await connected();
    const page = async (args: Record<string, unknown>): Promise<Page> => {
      const result = await client.callTool({ name: "search", arguments: args });
      const text = (result.content as Array<{ text: string }>)[0]!.text;
      return { bytes: Buffer.byteLength(text, "utf8"), hits: (JSON.parse(text) as { hits: unknown[] }).hits.length };
    };

    const routing = JSON.parse(readFileSync("eval/routing-cases.json", "utf8")) as { cases: Array<{ question: string }>; extendedCases: Array<{ question: string }> };
    const questions = [...routing.cases, ...routing.extendedCases].map((c) => c.question);
    const report: Record<string, unknown> = { questions: questions.length, limits: {} as Record<string, unknown> };
    for (const limit of [5, 7]) {
      const pages: Page[] = [];
      for (const query of questions) pages.push(await page({ query, limit }));
      const sizes = pages.map((p) => p.bytes);
      (report.limits as Record<string, unknown>)[limit] = {
        bytes: summary(sizes),
        overGrokClip20000: sizes.filter((b) => b > 20_000).length,
        overClaudeWarning40000: sizes.filter((b) => b > 40_000).length,
        fullPages: pages.filter((p) => p.hits === limit).length
      };
    }
    const at = report.limits as Record<string, { bytes: { mean: number } }>;
    report.meanDeltaBytes = at[7]!.bytes.mean - at[5]!.bytes.mean;

    if (SPLIT && RESULTS) {
      const ids = tuningIdsOf(JSON.parse(readFileSync(SPLIT, "utf8")));
      const runs: Record<string, unknown> = {};
      for (const entry of RESULTS.split(",")) {
        const [label, path] = entry.split("=") as [string, string];
        const stored = JSON.parse(readFileSync(path, "utf8")) as { rows: Array<{ id: string } & Record<string, any>> };
        const rows = selectById(stored.rows, ids, stored.rows.length, label) as Array<Record<string, any>>;
        let searches = 0;
        let defaultSearches = 0;
        const rowShares: number[] = [];
        const defaultRowShares: number[] = [];
        const deltas: number[] = [];
        let rowsWithDefault = 0;
        for (const row of rows) {
          const turns: number = row.agent?.turns ?? 0;
          const inputTokens = (row.agent?.usage?.perTurn ?? []).reduce(
            (sum: number, t: any) => sum + (t.inputTokens ?? 0) + (t.cacheCreationInputTokens ?? 0) + (t.cacheReadInputTokens ?? 0),
            0
          );
          let extraTokens = 0;
          let rowDefaults = 0;
          for (const call of row.transcript ?? []) {
            if (!/(^|__)search$/.test(String(call.tool ?? ""))) continue;
            searches += 1;
            let args: Record<string, unknown>;
            try { args = JSON.parse(String(call.input)); } catch { continue; }
            if (typeof args.query !== "string" || args.limit !== undefined) continue;
            defaultSearches += 1;
            rowDefaults += 1;
            const five = await page({ ...args, limit: 5 });
            const seven = await page({ ...args, limit: 7 });
            const delta = seven.bytes - five.bytes;
            deltas.push(delta);
            extraTokens += (delta / 4) * Math.max(0, turns - (call.assistantTurn ?? turns));
          }
          if (rowDefaults) rowsWithDefault += 1;
          if (inputTokens > 0) {
            rowShares.push(extraTokens / inputTokens);
            if (rowDefaults) defaultRowShares.push(extraTokens / inputTokens);
          }
        }
        runs[label] = {
          rows: rows.length,
          searchCalls: searches,
          defaultLimitSearches: defaultSearches,
          rowsWithADefaultLimitSearch: rowsWithDefault,
          extraBytesPerDefaultPage: deltas.length ? summary(deltas) : null,
          extraInputShareAllRows: share(rowShares),
          extraInputShareRowsWithADefaultSearch: share(defaultRowShares)
        };
      }
      report.storedRuns = runs;
    }
    writeFileSync(OUT!, JSON.stringify(report, null, 2) + "\n");
    expect(report.questions).toBe(460);
  }, 600_000);
});
