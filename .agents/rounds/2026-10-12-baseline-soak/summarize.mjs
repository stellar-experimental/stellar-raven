#!/usr/bin/env node
// Summarizes a soak run directory as Markdown: per-interval process RSS, CPU use, open files, and
// request outcomes, plus totals. Prints to stdout.
//
// node summarize.mjs <run-dir> [--every 10]
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const run = process.argv[2];
const everyAt = process.argv.indexOf("--every");
const every = everyAt === -1 ? 10 : Number(process.argv[everyAt + 1]);
const lines = (name) => existsSync(path.join(run, name))
  ? readFileSync(path.join(run, name), "utf8").trim().split("\n").filter(Boolean).map((line) => JSON.parse(line)) : [];
const samples = lines("samples.jsonl");
const requests = lines("requests.jsonl");
const start = Date.parse(JSON.parse(readFileSync(path.join(run, "token-window.json"), "utf8")).startedAt);
const minutes = (t) => (Date.parse(t) - start) / 60_000;
const mb = (kb) => (kb / 1024).toFixed(0);

// Role names follow the observed tree: wrangler bin -> cli.js -> {esbuild, proxy workerd on the
// public port, remote-proxy workerd, user workerd (--inspect)}.
function role(processRow, tree) {
  if (processRow.comm === "node") return processRow.pid === Math.min(...tree.filter((p) => p.comm === "node").map((p) => p.pid)) ? "wrangler-bin" : "wrangler-cli";
  if (processRow.comm === "esbuild") return processRow.rssKb > 100_000 ? "esbuild-main" : "esbuild-2";
  const workerds = tree.filter((p) => p.comm === "workerd").sort((a, b) => a.pid - b.pid);
  return ["workerd-proxy", "workerd-remote", "workerd-user"][workerds.indexOf(processRow)] ?? `workerd-${processRow.pid}`;
}

const roles = ["wrangler-cli", "workerd-proxy", "workerd-remote", "workerd-user", "esbuild-main"];
const header = ["min", ...roles.map((r) => `${r} RSS MB`), "user CPU s/min", "cli CPU s/min",
  ...roles.map((r) => `${r} fds`), "requests (cum)", "non-ok (cum)"];
const out = [`| ${header.join(" | ")} |`, `|${header.map(() => "---").join("|")}|`];
let previous = null;
for (const sample of samples) {
  const m = minutes(sample.t);
  const byRole = Object.fromEntries(sample.processes.map((p) => [role(p, sample.processes), p]));
  const cum = requests.filter((r) => Date.parse(r.t) <= Date.parse(sample.t));
  const nonOk = cum.filter((r) => !["ok", "accepted"].includes(r.outcome)).length;
  const isLast = sample === samples.at(-1) || !sample.rootAlive;
  if (previous && Math.round(m) % every !== 0 && !isLast) continue;
  const rate = (name) => {
    if (!previous || !byRole[name] || !previous.byRole[name]) return "";
    return ((byRole[name].cpuSec - previous.byRole[name].cpuSec) / ((Date.parse(sample.t) - previous.t) / 60_000)).toFixed(2);
  };
  out.push(`| ${m.toFixed(0)} | ${roles.map((r) => byRole[r] ? mb(byRole[r].rssKb) : "-").join(" | ")} | ${rate("workerd-user")} | ${rate("wrangler-cli")} | ${roles.map((r) => byRole[r]?.openFiles ?? "-").join(" | ")} | ${cum.length} | ${nonOk} |`);
  previous = { t: Date.parse(sample.t), byRole };
}

const outcomes = {};
for (const r of requests) outcomes[r.outcome] = (outcomes[r.outcome] ?? 0) + 1;
const tools = {};
for (const r of requests.filter((x) => x.kind === "tools/call")) tools[`${r.tool}:${r.outcome}`] = (tools[`${r.tool}:${r.outcome}`] ?? 0) + 1;
console.log(out.join("\n"));
console.log(`\nSamples: ${samples.length}. First ${samples[0]?.t}. Last ${samples.at(-1)?.t} (root alive: ${samples.at(-1)?.rootAlive}).`);
console.log(`Requests: ${requests.length}. Outcomes: ${JSON.stringify(outcomes)}. Tool calls: ${JSON.stringify(tools)}.`);
console.log(`Replay loops reached: ${Math.max(0, ...requests.map((r) => r.loop))}. Last request: ${requests.at(-1)?.t}.`);
