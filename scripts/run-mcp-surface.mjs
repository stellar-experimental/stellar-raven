#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const directory = await mkdtemp(join(tmpdir(), "stellar-raven-mcp-surface-"));
try {
  const outfile = join(directory, "report.mjs");
  await build({
    entryPoints: [fileURLToPath(new URL("./report-mcp-surface.mjs", import.meta.url))],
    bundle: true,
    platform: "node",
    format: "esm",
    logLevel: "silent",
    outfile
  });
  const result = spawnSync(process.execPath, [outfile, ...process.argv.slice(2)], {
    stdio: "inherit"
  });
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
} finally {
  await rm(directory, { recursive: true, force: true });
}
