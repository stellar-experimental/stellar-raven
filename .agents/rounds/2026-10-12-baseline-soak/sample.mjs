#!/usr/bin/env node
// Samples the Wrangler dev process tree once a minute: RSS, CPU, open files per process, plus the
// replay's request outcome counts. Stops when the root process is gone or the deadline passes.
//
// node sample.mjs --root <pid> --out <dir> --minutes 200 [--interval 60]
import { execFileSync } from "node:child_process";
import { appendFileSync, existsSync, readFileSync } from "node:fs";
import path from "node:path";

function parseArgs(argv) {
  const options = { root: null, out: null, minutes: 200, interval: 60 };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--root") options.root = Number(argv[++i]);
    else if (arg === "--out") options.out = argv[++i];
    else if (arg === "--minutes") options.minutes = Number(argv[++i]);
    else if (arg === "--interval") options.interval = Number(argv[++i]);
  }
  if (!options.root || !options.out) throw new Error("usage: --root <pid> --out <dir>");
  return options;
}

// "[[dd-]hh:]mm:ss.cc" CPU time to seconds.
export function cpuSeconds(value) {
  const [days, rest] = value.includes("-") ? value.split("-") : ["0", value];
  const parts = rest.split(":").map(Number);
  while (parts.length < 3) parts.unshift(0);
  return Number(days) * 86400 + parts[0] * 3600 + parts[1] * 60 + parts[2];
}

export function processTable() {
  const output = execFileSync("ps", ["-axo", "pid=,ppid=,rss=,vsz=,%cpu=,time=,etime=,comm="], { encoding: "utf8" });
  return output.trim().split("\n").map((line) => {
    const [pid, ppid, rss, vsz, cpu, time, etime, ...comm] = line.trim().split(/\s+/);
    return { pid: +pid, ppid: +ppid, rssKb: +rss, vszKb: +vsz, cpuPct: +cpu, cpuSec: cpuSeconds(time),
      etime, comm: path.basename(comm.join(" ")) };
  });
}

export function descendants(table, root) {
  const found = table.filter((row) => row.pid === root);
  for (let i = 0; i < found.length; i++) found.push(...table.filter((row) => row.ppid === found[i].pid));
  return found;
}

function openFiles(pid) {
  try {
    return execFileSync("lsof", ["-n", "-P", "-p", String(pid)], { encoding: "utf8", timeout: 20_000 })
      .trim().split("\n").length - 1;
  } catch { return null; }
}

function sample(options) {
  const tree = descendants(processTable(), options.root);
  const statusPath = path.join(options.out, "replay-status.json");
  const replay = existsSync(statusPath) ? JSON.parse(readFileSync(statusPath, "utf8")) : null;
  const record = { t: new Date().toISOString(), rootAlive: tree.length > 0,
    processes: tree.map((row) => ({ ...row, openFiles: openFiles(row.pid) })),
    replay: replay && { loop: replay.loop, caseIndex: replay.caseIndex, counts: replay.counts } };
  appendFileSync(path.join(options.out, "samples.jsonl"), `${JSON.stringify(record)}\n`);
  return record.rootAlive;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const options = parseArgs(process.argv.slice(2));
  const deadline = Date.now() + options.minutes * 60_000;
  const tick = () => {
    const alive = sample(options);
    if (!alive || Date.now() >= deadline) { clearInterval(timer); }
  };
  const timer = setInterval(tick, options.interval * 1000);
  tick();
}
