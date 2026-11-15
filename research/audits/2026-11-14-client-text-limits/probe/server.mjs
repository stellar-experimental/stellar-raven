#!/usr/bin/env node
// Throwaway MCP stdio server for measuring how much server text a client delivers to its model.
// Newline-delimited JSON-RPC 2.0. No dependencies, no secrets, no network.
import { createInterface } from "node:readline";
import { writeFileSync } from "node:fs";

const env = process.env;
const SRV = env.PROBE_SRV ?? "1"; // server copy id, part of every token
const SEED = Number(env.PROBE_SEED ?? "1");
const INSTR_CHARS = Number(env.PROBE_INSTR_CHARS ?? "20000");
const RESULT_CHARS = Number(env.PROBE_RESULT_CHARS ?? "20000");
const SCHEMA_CHARS = Number(env.PROBE_SCHEMA_CHARS ?? "20000");
const DESC_A = Number(env.PROBE_DESC_A ?? "20000");
const DESC_B = Number(env.PROBE_DESC_B ?? "3000");
const DESC_C = Number(env.PROBE_DESC_C ?? "500");
const MANIFEST = env.PROBE_MANIFEST ?? null;
const SEG = 128;
const FLAT = env.PROBE_FLAT === "1"; // no newline characters in any text

// mulberry32 PRNG so a run is reproducible from its seed but unguessable without it
let st = (SEED * 2654435761) >>> 0;
const rnd = () => {
  st = (st + 0x6d2b79f5) >>> 0;
  let t = st;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const C = "bdfgklmnprstvz", V = "aeiou";
const used = new Set();
const word = () => {
  for (;;) {
    let w = "";
    for (let i = 0; i < 3; i++) w += C[Math.floor(rnd() * C.length)] + V[Math.floor(rnd() * V.length)];
    if (!used.has(w)) { used.add(w); return w; }
  }
};
const FILL = "- the quick brown fox jumps over the lazy dog and keeps on running through the field of pale grass until dusk falls - ";

const manifest = { srv: SRV, seed: SEED, seg: SEG, surfaces: {} };
function build(name, prefix, length) {
  const tokens = [];
  let text = "";
  for (let k = 0; text.length < length; k++) {
    const tok = `${prefix}${SRV}-${String(k).padStart(3, "0")}-${word()}`;
    tokens.push(tok);
    let seg = tok + " " + FILL.repeat(3);
    seg = seg.slice(0, SEG - 1) + (FLAT ? " " : "\n");
    text += seg;
  }
  text = text.slice(0, length);
  manifest.surfaces[name] = { prefix, length, tokens, text };
  return text;
}
const instructions = build("instructions", "IN", INSTR_CHARS);
const descA = build("desc_a", "TA", DESC_A);
const descB = build("desc_b", "TB", DESC_B);
const descC = build("desc_c", "TC", DESC_C);
const schemaText = build("schema", "SC", SCHEMA_CHARS);
const resultText = build("result", "RS", RESULT_CHARS);
if (MANIFEST) writeFileSync(MANIFEST, JSON.stringify(manifest));

const tools = [
  { name: "desc_a", description: descA, inputSchema: { type: "object", properties: {} } },
  { name: "desc_b", description: descB, inputSchema: { type: "object", properties: {} } },
  { name: "desc_c", description: descC, inputSchema: { type: "object", properties: {} } },
  {
    name: "schema_probe",
    description: "Probe tool. Its only argument carries a long property description. Do not call it.",
    inputSchema: { type: "object", properties: { note: { type: "string", description: schemaText } } },
  },
  {
    name: "result_probe",
    description: "Probe tool. Takes no arguments and returns a long sentinel text. Call it once when asked.",
    inputSchema: { type: "object", properties: {} },
  },
];

const send = (o) => process.stdout.write(JSON.stringify(o) + "\n");
const rl = createInterface({ input: process.stdin });
rl.on("line", (line) => {
  if (!line.trim()) return;
  let m;
  try { m = JSON.parse(line); } catch { return; }
  const { id, method, params } = m;
  if (id === undefined) return; // notification
  if (method === "initialize") {
    send({ jsonrpc: "2.0", id, result: {
      protocolVersion: params?.protocolVersion ?? "2025-06-18",
      capabilities: { tools: { listChanged: false } },
      serverInfo: { name: "probe", version: "1.0.0" },
      instructions,
    } });
  } else if (method === "tools/list") {
    send({ jsonrpc: "2.0", id, result: { tools } });
  } else if (method === "tools/call") {
    const n = params?.name;
    const text = n === "result_probe" ? resultText : "ok";
    send({ jsonrpc: "2.0", id, result: { content: [{ type: "text", text }], isError: false } });
  } else if (method === "ping") {
    send({ jsonrpc: "2.0", id, result: {} });
  } else if (method === "resources/list") {
    send({ jsonrpc: "2.0", id, result: { resources: [] } });
  } else if (method === "prompts/list") {
    send({ jsonrpc: "2.0", id, result: { prompts: [] } });
  } else {
    send({ jsonrpc: "2.0", id, error: { code: -32601, message: "Method not found" } });
  }
});
rl.on("close", () => process.exit(0));
