#!/usr/bin/env node
// Logs every change in the established TCP connections from one process to one local port, every
// 2 s. Used to see how often the proxy workerd's pooled connection to the user workerd is replaced.
//
// node conn-watch.mjs --pid <proxy workerd pid> --port <user workerd entry port> --out <dir>
import { execFileSync } from "node:child_process";
import { appendFileSync } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const option = (name) => args[args.indexOf(name) + 1];
const pid = option("--pid");
const port = option("--port");
const logPath = path.join(option("--out"), "conn-watch.jsonl");
let known = new Set();

function check() {
  let output = "";
  try {
    output = execFileSync("lsof", ["-nP", "-a", "-p", pid, "-iTCP", "-sTCP:ESTABLISHED"], { encoding: "utf8", timeout: 5000 });
  } catch (error) {
    if (error.status === 1 && !error.stdout) {
      try { process.kill(Number(pid), 0); } catch { process.exit(0); }
    }
    output = error.stdout ?? "";
  }
  const now = new Set(output.split("\n").map((line) => line.trim().split(/\s+/)[8])
    .filter((name) => name?.endsWith(`->127.0.0.1:${port}`)));
  const at = new Date().toISOString();
  for (const name of now) if (!known.has(name)) appendFileSync(logPath, `${JSON.stringify({ at, event: "open", name })}\n`);
  for (const name of known) if (!now.has(name)) appendFileSync(logPath, `${JSON.stringify({ at, event: "closed", name })}\n`);
  known = now;
}
check();
setInterval(check, 2000);
