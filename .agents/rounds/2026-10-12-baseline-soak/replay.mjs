#!/usr/bin/env node
// Replays recorded raven `search`/`execute` tool calls from QA results files as MCP JSON-RPC
// requests over streamable HTTP. One case at a time, in recorded order, looped until the deadline.
// Each case opens a fresh MCP session (initialize, initialized, tools/list), like one answering agent.
// No model call: only the recorded tool arguments are sent.
//
// node replay.mjs --port 8797 --out <dir> --minutes 195 [--scale 1] <results.json>...
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const TOOL_PREFIX = "mcp__raven__";
const REQUEST_TIMEOUT_MS = 180_000;
const PROTOCOL_VERSION = "2025-06-18";

export function parseArgs(argv) {
  const options = { port: 8797, out: null, minutes: 195, scale: 1, files: [] };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--port") options.port = Number(argv[++i]);
    else if (arg === "--out") options.out = argv[++i];
    else if (arg === "--minutes") options.minutes = Number(argv[++i]);
    else if (arg === "--scale") options.scale = Number(argv[++i]);
    else options.files.push(arg);
  }
  if (!options.out || options.files.length === 0) throw new Error("usage: --out <dir> <results.json>...");
  return options;
}

// One replay case per recorded agent attempt, with its recorded wall-clock window.
export function loadCases(files) {
  const cases = [];
  for (const file of files) {
    const results = JSON.parse(readFileSync(file, "utf8"));
    const attempts = [];
    for (const row of results.rows ?? []) {
      for (const attempt of row.attempts?.agent ?? []) attempts.push({ id: row.id, attempt });
    }
    attempts.sort((a, b) => Date.parse(a.attempt.startedAt) - Date.parse(b.attempt.startedAt));
    for (const { id, attempt } of attempts) {
      const calls = (attempt.transcript ?? [])
        .filter((step) => step.tool?.startsWith(TOOL_PREFIX))
        .map((step) => ({ tool: step.tool.slice(TOOL_PREFIX.length), args: JSON.parse(step.input) }));
      cases.push({
        source: path.basename(file), id,
        startedAt: Date.parse(attempt.startedAt), endedAt: Date.parse(attempt.endedAt), calls
      });
    }
  }
  return cases;
}

function parseBody(text, contentType) {
  if (!text) return null;
  if (contentType?.includes("text/event-stream")) {
    const messages = text.split(/\r?\n/).filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trim()).filter(Boolean).map((line) => JSON.parse(line));
    return messages.at(-1) ?? null;
  }
  return JSON.parse(text);
}

export function classify(httpStatus, message) {
  if (httpStatus === 202) return "accepted";
  if (httpStatus < 200 || httpStatus >= 300) return "http-error";
  if (message?.error) return "rpc-error";
  if (message?.result?.isError) return "tool-error";
  return "ok";
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const options = parseArgs(process.argv.slice(2));
  mkdirSync(options.out, { recursive: true });
  const cases = loadCases(options.files);
  const requestsPath = path.join(options.out, "requests.jsonl");
  const statusPath = path.join(options.out, "replay-status.json");
  const url = `http://localhost:${options.port}/mcp`;
  const deadline = Date.now() + options.minutes * 60_000;
  const counts = {};
  const status = { startedAt: new Date().toISOString(), cases: cases.length,
    calls: cases.reduce((n, c) => n + c.calls.length, 0), loop: 0, caseIndex: 0, counts, last: null };
  const writeStatus = () => writeFileSync(statusPath, `${JSON.stringify(status, null, 2)}\n`);
  writeStatus();
  const statusTimer = setInterval(writeStatus, 10_000);
  let nextId = 1;

  async function send(sessionId, body, meta) {
    const started = Date.now();
    const headers = { "content-type": "application/json", accept: "application/json, text/event-stream",
      "mcp-protocol-version": PROTOCOL_VERSION };
    if (sessionId) headers["mcp-session-id"] = sessionId;
    const record = { t: new Date(started).toISOString(), loop: status.loop, case: status.caseIndex, ...meta };
    try {
      const response = await fetch(url, { method: "POST", headers, body: JSON.stringify(body),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
      const text = await response.text();
      let message = null;
      try { message = parseBody(text, response.headers.get("content-type")); } catch { record.parse = "failed"; }
      Object.assign(record, { status: response.status, ms: Date.now() - started, bytes: text.length,
        outcome: record.parse ? "parse-error" : classify(response.status, message) });
      return { record, sessionId: response.headers.get("mcp-session-id") ?? sessionId };
    } catch (error) {
      Object.assign(record, { status: null, ms: Date.now() - started, outcome: "network-error",
        error: `${error.name}: ${error.cause?.code ?? error.message}` });
      return { record, sessionId };
    } finally {
      counts[record.outcome] = (counts[record.outcome] ?? 0) + 1;
      status.last = record;
      appendFileSync(requestsPath, `${JSON.stringify(record)}\n`);
    }
  }

  let previousEnd = null;
  outer: while (Date.now() < deadline) {
    status.loop++;
    for (let index = 0; index < cases.length; index++) {
      const replayCase = cases[index];
      status.caseIndex = index;
      if (previousEnd !== null) {
        const gap = Math.max(0, replayCase.startedAt - previousEnd) * options.scale;
        await sleep(Math.min(gap, 60_000));
      }
      if (Date.now() >= deadline) break outer;
      const caseStart = Date.now();
      const meta = { id: replayCase.id };
      let { sessionId } = await send(null, { jsonrpc: "2.0", id: nextId++, method: "initialize",
        params: { protocolVersion: PROTOCOL_VERSION, capabilities: {},
          clientInfo: { name: "baseline-soak-replay", version: "1" } } }, { ...meta, kind: "initialize" });
      await send(sessionId, { jsonrpc: "2.0", method: "notifications/initialized" }, { ...meta, kind: "initialized" });
      await send(sessionId, { jsonrpc: "2.0", id: nextId++, method: "tools/list" }, { ...meta, kind: "tools/list" });
      // Spread the calls over the recorded agent window; never overlap two requests.
      const step = ((replayCase.endedAt - replayCase.startedAt) / (replayCase.calls.length + 1)) * options.scale;
      for (let i = 0; i < replayCase.calls.length; i++) {
        const due = caseStart + step * (i + 1);
        if (due > Date.now()) await sleep(due - Date.now());
        const call = replayCase.calls[i];
        await send(sessionId, { jsonrpc: "2.0", id: nextId++, method: "tools/call",
          params: { name: call.tool, arguments: call.args } }, { ...meta, kind: "tools/call", tool: call.tool });
      }
      previousEnd = replayCase.endedAt;
    }
    previousEnd = null;
  }
  clearInterval(statusTimer);
  status.finishedAt = new Date().toISOString();
  writeStatus();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => { console.error(error); process.exitCode = 1; });
}
