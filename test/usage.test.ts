import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { URL } from "node:url";
import { describe, expect, it, vi } from "vitest";
import collector, { collectUsage, INSERT_RESPONSE, projectUsage, retentionCutoff } from "../src/usage/collector.ts";
import { termsPage } from "../src/site.ts";
import { USAGE_RETENTION_MONTHS } from "../src/auth/retention.ts";
// @ts-expect-error Plain-JavaScript operator script.
import { reportSql } from "../scripts/usage-report.mjs";
// @ts-expect-error Shared plain-JavaScript report queries.
import { receiptsSql, healthSql } from "../usage/report-site/cloudflare/queries.js";

const timestamp = Date.parse("2026-09-11T14:00:00Z");
const subjectHash = "0123456789abcdef";

function trace(events: Record<string, unknown>[], overrides: Partial<TraceItem> = {}): TraceItem {
  return {
    event: null, eventTimestamp: timestamp, scriptName: "stellar-raven-codemode",
    logs: events.map((event, index) => ({ timestamp: timestamp + index, level: "log", message: [JSON.stringify(event)] })),
    exceptions: [], diagnosticsChannelEvents: [], outcome: "ok", executionModel: "stateless",
    truncated: false, cpuTime: 1, wallTime: 1, ...overrides
  };
}

const auth = { evt: "mcp_request", requestId: "12345678-1234-1234-1234-123456789abc", accessMode: "oauth", subjectHash };

describe("usage projection", () => {
  it("counts top-level responses, including errors, but excludes internal searches and protocol activity", () => {
    const result = projectUsage(trace([
      auth, { evt: "search", source: "tool" }, { evt: "search", source: "codemode" },
      { evt: "execute", ok: false }, { evt: "execute_unavailable" }, { evt: "op" }
    ]));
    expect(result?.responses.map(r => r.tool)).toEqual(["search", "execute", "execute"]);
    expect(result?.responses.every(r => r.subjectHash === subjectHash)).toBe(true);
    expect(projectUsage(trace([auth]))?.responses).toEqual([]);
  });

  it("retains no payload, identity, URL, header, or exception content", () => {
    const result = projectUsage(trace([
      { ...auth, email: "private@example.com", authorization: "secret" },
      { evt: "search", source: "tool", query: "private question", answer: "private answer" }
    ], { exceptions: [{ name: "Error", message: "private exception", timestamp }] }));
    const saved = JSON.stringify(result);
    expect(saved).not.toMatch(/private|secret|email|authorization/);
    expect(result?.responses[0]?.subjectHash).toBe(subjectHash);
  });

  it("does not treat API keys or absent auth as people", () => {
    for (const mode of ["api-key", "dev-bypass", "oauth-rejected"]) {
      const result = projectUsage(trace([{ ...auth, accessMode: mode }, { evt: "execute" }]));
      expect(result?.responses[0]?.subjectHash).toBeNull();
    }
    const result = projectUsage(trace([{ ...auth, subjectHash: "not-a-hash" }, { evt: "execute" }]));
    expect(result?.responses[0]?.subjectHash).toBeNull();
  });

  it("counts playground refusals and joins the playground WorkOS hash", () => {
    const request = {
      method: "POST", url: "https://raven.stellar.org/playground/chat?private=secret",
      headers: { "cf-ray": "1234567890abcdef-ATL", authorization: "secret" },
      getUnredacted() { return this; }
    };
    const result = projectUsage(trace([
      { evt: "demo-chat-start", auth: "cookie", subjectHash },
      { evt: "demo-search-refused" }, { evt: "demo-execute", ok: false }
    ], { event: { request } }));
    expect(result?.responses.map(r => [r.surface, r.tool, r.subjectHash])).toEqual([
      ["playground", "search", subjectHash], ["playground", "execute", subjectHash]
    ]);
    expect(JSON.stringify(result)).not.toMatch(/private|secret|authorization/);
  });

  it("flags truncation and missing identifiers instead of inventing identities", () => {
    expect(projectUsage(trace([{ evt: "execute" }], { truncated: true }))).toMatchObject({
      truncated: true, missingRequestId: 1, responses: []
    });
    expect(projectUsage(trace([], { scriptName: "another-worker" }))).toBeNull();
  });

  it("uses each response timestamp across a month boundary", () => {
    const end = Date.parse("2026-09-30T23:59:59.999Z");
    const result = projectUsage(trace([auth, { evt: "execute" }], {
      eventTimestamp: end,
      logs: [{ timestamp: end, level: "log", message: [JSON.stringify(auth)] },
        { timestamp: end + 2, level: "log", message: [JSON.stringify({ evt: "execute" })] }]
    }));
    expect(result?.responses[0]?.timestamp).toBe(end + 2);
  });
});

describe("usage persistence and reporting", () => {
  it("persists valid invocations when another trace lacks an identifier", async () => {
    const statement = { bind: vi.fn().mockReturnThis() };
    const batch = vi.fn().mockResolvedValue([]);
    const env = { USAGE: { prepare: () => statement, batch } } as unknown as { USAGE: D1Database };
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      await expect(collectUsage([
        trace([auth, { evt: "execute" }]),
        trace([{ evt: "execute" }]),
        trace([{ ...auth, requestId: "87654321-4321-4321-4321-cba987654321" }, { evt: "search", source: "tool" }])
      ], env)).resolves.toBeUndefined();
      expect(batch).toHaveBeenCalledOnce();
      expect(batch.mock.calls[0]?.[0]).toHaveLength(5);
      expect(log).toHaveBeenCalledWith(JSON.stringify({ evt: "usage_missing_request_id", count: 1 }));
    } finally { log.mockRestore(); }
  });

  it("continues later chunks after a failed transaction and records the gap", async () => {
    vi.useFakeTimers();
    const binds: unknown[][] = [];
    const batch = vi.fn().mockRejectedValueOnce(new Error("failed"))
      .mockRejectedValueOnce(new Error("failed")).mockRejectedValueOnce(new Error("failed"))
      .mockResolvedValue([]);
    const env = { USAGE: { prepare: () => ({ bind: (...args: unknown[]) => { binds.push(args); return {}; } }), batch } } as unknown as { USAGE: D1Database };
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      const traces = Array.from({ length: 26 }, (_, i) => trace([
        { ...auth, requestId: i.toString(16).padStart(32, "0") }, { evt: "execute" }
      ]));
      const result = expect(collectUsage(traces, env)).rejects.toThrow("three attempts");
      await vi.runAllTimersAsync();
      await result;
      expect(batch.mock.calls.map(call => call[0].length)).toEqual([50, 50, 50, 2, 1]);
      expect(binds.at(-1)?.slice(2)).toEqual([0, 0, 0, "collection_write_failure", 0, 50]);
    } finally { vi.useRealTimers(); log.mockRestore(); }
  });

  it("records an interrupted invocation without claiming a response", async () => {
    const bind = vi.fn().mockReturnValue({});
    const batch = vi.fn().mockResolvedValue([]);
    await collectUsage([trace([auth], { outcome: "exceededCpu" })], {
      USAGE: { prepare: () => ({ bind }), batch }
    } as unknown as { USAGE: D1Database });
    expect(bind.mock.calls[0]?.slice(2)).toEqual([0, 0, 0, "exceededCpu", 0, 0]);
  });

  it("deduplicates retries and counts distinct users across tools and surfaces", () => {
    const db = new DatabaseSync(":memory:");
    db.exec(readFileSync(new URL("../usage/migrations/0001_usage.sql", import.meta.url), "utf8"));
    db.exec(readFileSync(new URL("../usage/migrations/0002_collection_health.sql", import.meta.url), "utf8"));
    const insert = db.prepare(INSERT_RESPONSE);
    for (let i = 0; i < 2; i++) {
      insert.run("mcp-search", timestamp, "mcp", "search", "oauth", subjectHash);
      insert.run("mcp-execute", timestamp, "mcp", "execute", "oauth", subjectHash);
      insert.run("demo-search", timestamp, "playground", "search", "oauth", subjectHash);
      insert.run("api-execute", timestamp, "mcp", "execute", "api-key", null);
      insert.run("unknown", timestamp, "mcp", "execute", "unknown", null);
    }
    const sql = reportSql("2026-09", "2026-10");
    const rows = db.prepare(sql.split(";")[0]).all();
    expect(rows.find(row => row.surface === "all")).toMatchObject({
      search_responses: 2, execute_responses: 3, total_responses: 5, unique_accounts: 1,
      api_key_responses: 1, unattributed_responses: 1
    });
    expect(() => reportSql("2026-09';DROP TABLE usage_responses", "2026-10")).toThrow();
    db.prepare("INSERT INTO usage_receipts (id,timestamp_ms,responses,truncated,canary,outcome,missing_response_ids,failed_statements) VALUES (?,?,?,?,?,?,?,?)")
      .run("receipt", timestamp, 5, 0, 1, "exceededCpu", 1, 50);
    expect(db.prepare(receiptsSql).get(timestamp - 1, timestamp + 1)).toMatchObject({
      interrupted_invocations: 1, missing_response_ids: 1, failed_statements: 50, canary_hours: 1
    });
    expect(db.prepare(healthSql).get(timestamp - 1, timestamp + 1)).toMatchObject({
      last_canary_ms: timestamp, failed_invocations: 1, failed_statements: 50
    });
    db.close();
  });

  it("deletes expired snapshots while retaining current usage and snapshots", async () => {
    const db = new DatabaseSync(":memory:");
    for (const migration of ["0001_usage.sql", "0002_collection_health.sql", "0003_private_report_snapshots.sql"]) {
      db.exec(readFileSync(new URL(`../usage/migrations/${migration}`, import.meta.url), "utf8"));
    }
    db.prepare("INSERT INTO usage_report_snapshots VALUES (?, ?, ?)").run("expired", "{}", timestamp - 1);
    db.prepare("INSERT INTO usage_report_snapshots VALUES (?, ?, ?)").run("current", "{}", timestamp + 1);
    db.prepare(INSERT_RESPONSE).run("current-response", timestamp, "mcp", "search", "api-key", null);
    const database = {
      prepare(sql: string) { return { bind(...values: number[]) { return () => db.prepare(sql).run(...values); } }; },
      async batch(statements: (() => unknown)[]) { return statements.map(statement => statement()); }
    } as unknown as D1Database;
    await collector.scheduled({ scheduledTime: timestamp } as ScheduledController, { USAGE: database });
    expect(db.prepare("SELECT id FROM usage_report_snapshots").all().map(row => row.id)).toEqual(["current"]);
    expect(db.prepare("SELECT COUNT(*) AS count FROM usage_responses").get()?.count).toBe(1);
    db.close();
  });

  it("retains thirteen monthly periods across a year boundary", () => {
    expect(new Date(retentionCutoff(timestamp)).toISOString()).toBe("2025-09-01T00:00:00.000Z");
    expect(new Date(retentionCutoff(Date.parse("2027-01-31T12:00:00Z"))).toISOString())
      .toBe("2026-01-01T00:00:00.000Z");
    expect(termsPage()).toContain(`tool-response records for ${USAGE_RETENTION_MONTHS} UTC calendar months`);
  });

  it("retries transient database failures without swallowing permanent failure", async () => {
    vi.useFakeTimers();
    const statement = { bind: vi.fn().mockReturnThis() };
    const batch = vi.fn().mockRejectedValueOnce(new Error("temporary")).mockResolvedValue([]);
    const env = { USAGE: { prepare: () => statement, batch } } as unknown as { USAGE: D1Database };
    const pending = collectUsage([trace([auth, { evt: "execute" }])], env);
    await vi.runAllTimersAsync();
    await pending;
    expect(batch).toHaveBeenCalledTimes(2);
    batch.mockRejectedValue(new Error("permanent"));
    const failed = expect(collectUsage([trace([auth, { evt: "execute" }])], env)).rejects.toThrow("three attempts");
    await vi.runAllTimersAsync();
    await failed;
    vi.useRealTimers();
  });
});
