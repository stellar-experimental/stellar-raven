#!/usr/bin/env node
// Checks every second which processes of the Wrangler dev tree are alive and logs each change, so a
// stop shows which process went first (wrangler node, the proxy workerd, or the user workerd).
//
// node watch.mjs --root <pid> --out <dir>
import { appendFileSync } from "node:fs";
import path from "node:path";
import { descendants, processTable } from "./sample.mjs";

const args = process.argv.slice(2);
const root = Number(args[args.indexOf("--root") + 1]);
const out = args[args.indexOf("--out") + 1];
const logPath = path.join(out, "watch.jsonl");
let known = new Map();

function check() {
  const tree = descendants(processTable(), root);
  const now = new Map(tree.map((row) => [row.pid, row.comm]));
  const at = new Date().toISOString();
  for (const [pid, comm] of now) if (!known.has(pid)) appendFileSync(logPath, `${JSON.stringify({ at, event: "seen", pid, comm })}\n`);
  for (const [pid, comm] of known) if (!now.has(pid)) appendFileSync(logPath, `${JSON.stringify({ at, event: "gone", pid, comm })}\n`);
  known = now;
  if (now.size === 0) process.exit(0);
}
check();
setInterval(check, 1000);
