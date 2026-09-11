#!/usr/bin/env node
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const prefix = "usage/report-site/";
const git = (cwd, ...args) => execFileSync("git", args, { cwd, encoding: "utf8" }).trim();

try {
  if (process.argv.length !== 3) throw new Error("Usage: node scripts/sync-usage-site.mjs <Sites checkout>");
  const target = realpathSync(process.argv[2]);
  if (git(root, "status", "--porcelain")) throw new Error("The Raven checkout must be clean");
  const commit = git(root, "rev-parse", "HEAD");
  if (git(root, "branch", "--show-current") !== "main" || commit !== git(root, "rev-parse", "origin/main")) {
    throw new Error("Sync only the reviewed main branch after fetching origin");
  }
  if (realpathSync(git(target, "rev-parse", "--show-toplevel")) !== target) {
    throw new Error("The target must be a separate Sites repository root");
  }
  if (git(target, "status", "--porcelain")) throw new Error("The Sites checkout must be clean");
  const manifest = JSON.parse(readFileSync(resolve(root, prefix, ".openai/hosting.json"), "utf8"));
  const existing = JSON.parse(readFileSync(resolve(target, ".openai/hosting.json"), "utf8"));
  if (existing.project_id !== manifest.project_id) throw new Error("The target belongs to a different Site");
  const files = git(root, "ls-files", "-z", "--", prefix).split("\0").filter(Boolean).map(path => path.slice(prefix.length));
  const digest = path => createHash("sha256").update(readFileSync(path)).digest("hex");
  let previous = [];
  let previousRecord;
  try { previousRecord = JSON.parse(readFileSync(resolve(target, ".raven-source.json"), "utf8")); previous = previousRecord.files; }
  catch (error) {
    if (error.code !== "ENOENT") throw error;
    previous = git(target, "ls-files", "-z").split("\0").filter(Boolean);
  }
  for (const file of [...files, ...previous]) {
    if (!file || file.startsWith("/") || file.split("/").some(part => part === ".." || part === ".git")) {
      throw new Error("Invalid report source path");
    }
  }
  if (previousRecord) {
    for (const file of previous) {
      if (digest(resolve(target, file)) !== previousRecord.hashes?.[file]) {
        throw new Error(`The Sites copy has an independent change: ${file}`);
      }
    }
  } else if (git(target, "rev-parse", "HEAD") !== "3523623f2ff966134dd32e90f96ff8bf633db4a6") {
    throw new Error("The initial Sites copy differs from the reviewed bootstrap commit");
  }
  for (const file of previous) if (!files.includes(file)) rmSync(resolve(target, file));
  for (const file of files) {
    const destination = resolve(target, file);
    mkdirSync(dirname(destination), { recursive: true });
    copyFileSync(resolve(root, prefix, file), destination);
  }
  writeFileSync(resolve(target, ".raven-source.json"), JSON.stringify({ repository: "stellar-experimental/stellar-raven", commit, files, hashes: Object.fromEntries(files.map(file => [file, digest(resolve(target, file))])) }, null, 2) + "\n");
  console.log(`Synced ${files.length} report files from Raven ${commit}. Review, build, and publish the Sites copy.`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
