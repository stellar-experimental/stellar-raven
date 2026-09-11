import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { URL } from "node:url";
import { describe, expect, it, vi } from "vitest";
import { collectUsage, INSERT_RESPONSE, projectUsage, retentionCutoff } from "../src/usage/collector.ts";
import { termsPage } from "../src/site.ts";
import { USAGE_RETENTION_MONTHS } from "../src/auth/retention.ts";
// @ts-expect-error Plain-JavaScript operator script.
import { reportSql } from "../scripts/usage-report.mjs";

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
  it("deduplicates retries and counts distinct users across tools and surfaces", () => {
    const db = new DatabaseSync(":memory:");
    db.exec(readFileSync(new URL("../usage/migrations/0001_usage.sql", import.meta.url), "utf8"));
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
