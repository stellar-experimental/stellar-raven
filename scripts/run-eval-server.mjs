#!/usr/bin/env node
import { spawnSync } from "node:child_process";

function run(command, args) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    timeout: 10_000,
    maxBuffer: 4 * 1024 * 1024
  });
  if (result.error || result.status !== 0) {
    throw new Error(
      `${command} ${args.join(" ")} failed: ${String(result.stderr || result.error?.message || result.status).trim()}`
    );
  }
  return String(result.stdout).trim();
}

const status = run("git", ["status", "--porcelain=v1", "--untracked-files=all"]);
if (status) {
  throw new Error("eval server worktree is dirty; commit or remove every change before launch");
}
const revision = run("git", ["rev-parse", "HEAD"]);
if (!/^[a-f0-9]{40}$/.test(revision)) {
  throw new Error(`eval server revision is invalid: ${revision}`);
}

console.log(`eval server revision ${revision}`);
const child = spawnSync(
  process.platform === "win32" ? "npx.cmd" : "npx",
  [
    "--no-install",
    "wrangler",
    "dev",
    "--host",
    "localhost",
    "--define",
    `__RAVEN_SOURCE_REVISION__:${JSON.stringify(revision)}`,
    ...process.argv.slice(2)
  ],
  { stdio: "inherit" }
);
if (child.error) throw child.error;
process.exitCode = child.status ?? 1;
