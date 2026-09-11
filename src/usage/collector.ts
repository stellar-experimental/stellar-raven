/**
 * Tail consumer for usage metadata. Never persist a whole TraceItem: its
 * request headers, URLs, logs and exceptions can contain private content.
 */
import { USAGE_RETENTION_MONTHS } from "../auth/retention.ts";

export type UsageEnv = { USAGE: D1Database };
type Fields = Record<string, unknown>;
type Log = { timestamp: number; fields: Fields; index: number };
const OUTCOMES = new Set([
  "ok", "canceled", "exception", "unknown", "killSwitch", "daemonDown", "exceededCpu",
  "exceededMemory", "loadShed", "responseStreamDisconnected", "scriptNotFound",
  "internalError", "exceededWallTime", "aborted"
]);

export type UsageResponse = {
  id: string;
  timestamp: number;
  surface: "mcp" | "playground";
  tool: "search" | "execute";
  accessMode: "oauth" | "api-key" | "dev-bypass" | "unknown";
  subjectHash: string | null;
};

function fields(value: unknown): Fields | null {
  if (typeof value === "string") {
    try { value = JSON.parse(value); } catch { return null; }
  }
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Fields : null;
}

function hash(value: unknown): string | null {
  return typeof value === "string" && /^[a-f0-9]{16}$/.test(value) ? value : null;
}

function requestId(value: unknown): string | null {
  return typeof value === "string" && /^[a-f0-9-]{16,64}$/i.test(value) ? value : null;
}

export function projectUsage(trace: TraceItem) {
  if (trace.scriptName !== "stellar-raven-codemode") return null;
  if (!Number.isSafeInteger(trace.eventTimestamp) || trace.eventTimestamp === null) return null;
  const logs: Log[] = [];
  trace.logs.forEach((log, index) => {
    // logEvent passes one JSON string to console.log.
    const args: unknown = log.message;
    const item = fields(Array.isArray(args) && args.length === 1 ? args[0] : args);
    if (item && Number.isSafeInteger(log.timestamp)) logs.push({ timestamp: log.timestamp, fields: item, index });
  });
  const mcp = logs.find(log => log.fields.evt === "mcp_request")?.fields;
  const demo = logs.find(log => log.fields.evt === "demo-chat-start")?.fields;
  const canary = logs.some(log => log.fields.evt === "skill_canary");
  const fetch = trace.event && "request" in trace.event ? trace.event : null;
  const ray = requestId(fetch?.request.headers["cf-ray"]?.split("-")[0]);
  const identity = requestId(mcp?.requestId) ?? ray;
  const id = canary && !fetch
    ? `canary:${trace.eventTimestamp}`
    : identity ? `request:${identity}` : null;
  const responses: UsageResponse[] = [];
  let missingRequestId = 0;
  for (const log of logs) {
    const evt = log.fields.evt;
    let surface: UsageResponse["surface"];
    let tool: UsageResponse["tool"];
    if (evt === "search" && log.fields.source === "tool") { surface = "mcp"; tool = "search"; }
    else if (evt === "execute" || evt === "execute_unavailable") { surface = "mcp"; tool = "execute"; }
    else if (evt === "demo-search" || evt === "demo-search-refused") { surface = "playground"; tool = "search"; }
    else if (evt === "demo-execute" || evt === "demo-execute-refused") { surface = "playground"; tool = "execute"; }
    else continue;
    if (!id) { missingRequestId++; continue; }
    const accessMode = surface === "mcp"
      ? mcp?.accessMode === "oauth" || mcp?.accessMode === "api-key" || mcp?.accessMode === "dev-bypass"
        ? mcp.accessMode : "unknown"
      : demo?.auth === "cookie" ? "oauth" : demo?.auth === "dev-bypass" ? "dev-bypass" : "unknown";
    responses.push({
      id: `${id}:${log.index}`, timestamp: log.timestamp, surface, tool, accessMode,
      subjectHash: accessMode === "oauth" ? hash(surface === "mcp" ? mcp?.subjectHash : demo?.subjectHash) : null
    });
  }
  const outcome = OUTCOMES.has(trace.outcome) ? trace.outcome : "unknown";
  return { id, timestamp: trace.eventTimestamp, truncated: trace.truncated, canary, responses, missingRequestId, outcome };
}

export const INSERT_RESPONSE = `INSERT OR IGNORE INTO usage_responses
  (id, timestamp_ms, surface, tool, access_mode, subject_hash)
  VALUES (?, ?, ?, ?, ?, ?)`;

const INSERT_RECEIPT = `INSERT OR IGNORE INTO usage_receipts
  (id, timestamp_ms, responses, truncated, canary, outcome, missing_response_ids, failed_statements)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

async function writeBatch(env: UsageEnv, batch: D1PreparedStatement[]): Promise<boolean> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const result = await env.USAGE.batch(batch);
      if (result.some(row => !row.success)) throw new Error("Usage batch failed");
      return true;
    } catch {
      if (attempt < 2) await new Promise(resolve => setTimeout(resolve, 200 * (attempt + 1)));
    }
  }
  return false;
}

export async function collectUsage(traces: TraceItem[], env: UsageEnv): Promise<void> {
  const statements: D1PreparedStatement[] = [];
  let missingRequestIds = 0;
  for (const trace of traces) {
    const usage = projectUsage(trace);
    if (!usage) continue;
    if (usage.missingRequestId) {
      missingRequestIds += usage.missingRequestId;
    }
    for (const response of usage.responses) {
      statements.push(env.USAGE.prepare(INSERT_RESPONSE).bind(
        response.id, response.timestamp, response.surface, response.tool, response.accessMode, response.subjectHash
      ));
    }
    if (usage.responses.length > 0 || usage.truncated || usage.canary || usage.missingRequestId || usage.outcome !== "ok") {
      // Unidentified receipts describe collection gaps, never counted tool responses.
      statements.push(env.USAGE.prepare(INSERT_RECEIPT).bind(
        usage.id ?? `unidentified:${crypto.randomUUID()}`, usage.timestamp, usage.responses.length,
        Number(usage.truncated), Number(usage.canary), usage.outcome, usage.missingRequestId, 0
      ));
    }
  }
  let failedStatements = 0;
  // Bound each transaction; continue later chunks if one exhausts its retries.
  for (let offset = 0; offset < statements.length; offset += 50) {
    const batch = statements.slice(offset, offset + 50);
    if (!(await writeBatch(env, batch))) failedStatements += batch.length;
  }
  if (missingRequestIds) {
    console.error(JSON.stringify({ evt: "usage_missing_request_id", count: missingRequestIds }));
  }
  if (failedStatements) {
    console.error(JSON.stringify({ evt: "usage_write_failure", failedStatements, missingRequestIds }));
    // This receipt survives a transient/partial outage. A total D1 outage is detected by stale canaries.
    await writeBatch(env, [env.USAGE.prepare(INSERT_RECEIPT).bind(
      `write-failure:${crypto.randomUUID()}`, Date.now(), 0, 0, 0, "collection_write_failure", 0, failedStatements
    )]);
    throw new Error("Usage database write failed after three attempts");
  }
}

/** Retain thirteen UTC calendar months, including the current month. */
export function retentionCutoff(now: number): number {
  const date = new Date(now);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - USAGE_RETENTION_MONTHS + 1, 1);
}

export default {
  tail(traces, env, ctx) { ctx.waitUntil(collectUsage(traces, env)); },
  async scheduled(controller, env) {
    const cutoff = retentionCutoff(controller.scheduledTime);
    await env.USAGE.batch([
      env.USAGE.prepare("DELETE FROM usage_responses WHERE timestamp_ms < ?").bind(cutoff),
      env.USAGE.prepare("DELETE FROM usage_receipts WHERE timestamp_ms < ?").bind(cutoff),
      env.USAGE.prepare("DELETE FROM usage_report_snapshots WHERE expires_at_ms <= ?").bind(controller.scheduledTime)
    ]);
  }
} satisfies ExportedHandler<UsageEnv>;
