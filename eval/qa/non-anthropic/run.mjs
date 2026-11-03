#!/usr/bin/env node
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";

// Install before application imports so the pin set covers the actual loaded graph.
const files = new Set([fileURLToPath(import.meta.url)]);
const hooks = registerHooks({ load(url, context, nextLoad) {
  if (url.startsWith("file:")) files.add(fileURLToPath(url));
  return nextLoad(url, context);
} });

try {
  const { main } = await import("./runner.mjs");
  await main(process.argv.slice(2), files);
} catch {
  // Authentication and provider exceptions must never leak through CLI diagnostics.
  process.stderr.write("Direct Grok method stopped. Inspect its artifact if collection started.\n");
  process.exitCode = 1;
} finally { hooks.deregister(); }
