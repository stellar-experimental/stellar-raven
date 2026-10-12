#!/usr/bin/env node
// Sends selected recorded raven calls from one case, in a fresh MCP session, and prints each
// outcome. Used to test whether one recorded request stops the server.
//
// node trigger.mjs --port 8797 --case <id> --calls 3,4 --out <dir> <results.json>
import { appendFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { classify, loadCases } from "./replay.mjs";

const args = process.argv.slice(2);
const option = (name) => args[args.indexOf(name) + 1];
const port = Number(option("--port"));
const caseId = option("--case");
const indexes = option("--calls").split(",").map(Number);
const out = option("--out");
const files = args.filter((arg, i) => !arg.startsWith("--") && !args[i - 1]?.startsWith("--"));
mkdirSync(out, { recursive: true });

const replayCase = loadCases(files).find((c) => c.id === caseId);
if (!replayCase) throw new Error(`case ${caseId} not found`);
const url = `http://localhost:${port}/mcp`;
let sessionId = null;
let id = 1;

async function send(body, label) {
  const started = Date.now();
  const headers = { "content-type": "application/json", accept: "application/json, text/event-stream",
    "mcp-protocol-version": "2025-06-18" };
  if (sessionId) headers["mcp-session-id"] = sessionId;
  const record = { t: new Date(started).toISOString(), case: caseId, label };
  try {
    const response = await fetch(url, { method: "POST", headers, body: JSON.stringify(body),
      signal: AbortSignal.timeout(180_000) });
    sessionId = response.headers.get("mcp-session-id") ?? sessionId;
    const text = await response.text();
    const data = text.split(/\r?\n/).filter((l) => l.startsWith("data:")).map((l) => l.slice(5).trim()).at(-1);
    let message = null;
    try { message = JSON.parse(data ?? text); } catch {}
    Object.assign(record, { status: response.status, ms: Date.now() - started, bytes: text.length,
      outcome: classify(response.status, message),
      excerpt: JSON.stringify(message?.result?.content?.[0]?.text ?? message?.error ?? "").slice(0, 300) });
  } catch (error) {
    Object.assign(record, { status: null, ms: Date.now() - started, outcome: "network-error",
      error: `${error.name}: ${error.cause?.code ?? error.message}` });
  }
  console.log(JSON.stringify(record));
  appendFileSync(path.join(out, "trigger.jsonl"), `${JSON.stringify(record)}\n`);
}

await send({ jsonrpc: "2.0", id: id++, method: "initialize", params: { protocolVersion: "2025-06-18",
  capabilities: {}, clientInfo: { name: "baseline-soak-trigger", version: "1" } } }, "initialize");
await send({ jsonrpc: "2.0", method: "notifications/initialized" }, "initialized");
for (const index of indexes) {
  const call = replayCase.calls[index];
  await send({ jsonrpc: "2.0", id: id++, method: "tools/call",
    params: { name: call.tool, arguments: call.args } }, `call ${index} ${call.tool}`);
}
