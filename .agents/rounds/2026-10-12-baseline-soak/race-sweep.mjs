#!/usr/bin/env node
// Targeted check for the keep-alive race between the proxy workerd and the user workerd: sends one
// cheap MCP request (tools/list) after each idle gap in a sweep around the 5 s idle timeout.
// Records each gap and outcome; exits 2 after --max-failures failed requests in a row.
//
// node race-sweep.mjs --port 8797 --out <dir> [--from 4900] [--to 5100] [--step 2] [--rounds 1]
//   [--max-failures 1]   stop after this many failed requests in a row
import { appendFileSync } from "node:fs";
import path from "node:path";
import { classify } from "./replay.mjs";

const args = process.argv.slice(2);
const option = (name, fallback) => (args.includes(name) ? args[args.indexOf(name) + 1] : fallback);
const port = Number(option("--port", 8797));
const out = option("--out");
const from = Number(option("--from", 4900));
const to = Number(option("--to", 5100));
const step = Number(option("--step", 2));
const rounds = Number(option("--rounds", 1));
const maxFailures = Number(option("--max-failures", 1));
const url = `http://localhost:${port}/mcp`;
const logPath = path.join(out, "race-sweep.jsonl");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let id = 1;

async function send(body, gapMs) {
  const started = Date.now();
  const record = { t: new Date(started).toISOString(), gapMs };
  try {
    const response = await fetch(url, { method: "POST", body: JSON.stringify(body), signal: AbortSignal.timeout(60_000),
      headers: { "content-type": "application/json", accept: "application/json, text/event-stream",
        "mcp-protocol-version": "2025-06-18" } });
    const text = await response.text();
    const data = text.split(/\r?\n/).filter((l) => l.startsWith("data:")).map((l) => l.slice(5).trim()).at(-1);
    let message = null;
    try { message = JSON.parse(data ?? text); } catch {}
    Object.assign(record, { status: response.status, ms: Date.now() - started, outcome: classify(response.status, message) });
    if (record.outcome !== "ok") record.excerpt = text.slice(0, 400);
  } catch (error) {
    Object.assign(record, { status: null, ms: Date.now() - started, outcome: "network-error",
      error: `${error.name}: ${error.cause?.code ?? error.message}` });
  }
  appendFileSync(logPath, `${JSON.stringify(record)}\n`);
  return record;
}

const list = () => ({ jsonrpc: "2.0", id: id++, method: "tools/list" });
await send(list(), null);
let failures = 0;
let failed = 0;
for (let round = 0; round < rounds; round++) {
  for (let gap = from; gap <= to; gap += step) {
    await sleep(gap);
    const record = await send(list(), gap);
    if (record.outcome === "ok") { failures = 0; continue; }
    console.log(JSON.stringify(record));
    failed++;
    if (++failures >= maxFailures) process.exit(2);
  }
}
console.log(failed ? `${failed} failed requests; the server answered again afterwards` : "no failure in sweep");
