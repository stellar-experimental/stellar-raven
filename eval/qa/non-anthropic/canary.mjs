#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { createRequire, registerHooks } from "node:module";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const CANARY_SCHEMA = "direct-grok-binding-transport-canary-v1";
export const CANARY_DEADLINE = "2026-11-03T10:00:00Z";
const CANARY_MODEL = "xai/grok-4.7";
const CONFIG = {
  name: "raven-provider-canary",
  compatibility_date: "2026-06-11",
  account_id: "ba55b7ae9acfb3ed152103e3497c0752",
  ai: { binding: "AI", remote: true }
};
const CONFIG_BYTES = JSON.stringify(CONFIG, null, 2) + "\n";
const here = fileURLToPath(import.meta.url);
const repo = path.resolve(path.dirname(here), "../../..");
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const hashJson = (value) => hash(JSON.stringify(value));

export function parseCanaryArgs(args) {
  if (args.length === 1 && args[0] === "--help") return { help: true };
  const allowed = new Set(["--prepare-pins", "--pins", "--expect-pins-sha256", "--out", "--max-budget-usd"]);
  const values = {};
  for (let i = 0; i < args.length; i += 2) {
    const flag = args[i];
    if (!allowed.has(flag) || Object.hasOwn(values, flag)) throw new Error("unknown or duplicate canary flag");
    if (!args[i + 1] || args[i + 1].startsWith("--")) throw new Error("missing canary flag value");
    values[flag] = args[i + 1];
  }
  if (values["--prepare-pins"]) {
    if (Object.keys(values).length !== 1) throw new Error("prepare-pins accepts no other flags");
  } else if (Object.keys(values).length !== 4 || !values["--pins"] || !values["--out"] ||
      values["--max-budget-usd"] !== "1" || !/^[a-f0-9]{64}$/.test(values["--expect-pins-sha256"] ?? "")) {
    throw new Error("canary requires --pins, --expect-pins-sha256, --out, and --max-budget-usd 1");
  }
  return values;
}

export function assertCanaryDeadline(now = Date.now()) {
  if (now >= Date.parse(CANARY_DEADLINE)) throw new Error("canary deadline reached");
}

export function assertPins(expected, actual) {
  if (hashJson(expected) !== hashJson(actual)) throw new Error("canary identity changed");
}

function atomicWrite(file, value) {
  const temporary = `${file}.tmp`;
  writeFileSync(temporary, JSON.stringify(value, null, 2) + "\n", { mode: 0o600, flag: "wx" });
  renameSync(temporary, file);
}

/** Hooks record actual loaded modules, including CommonJS dependencies. No credential file is read here. */
function trackModules() {
  const files = new Set([here]);
  const hooks = registerHooks({
    load(url, context, nextLoad) {
      if (url.startsWith("file:")) files.add(fileURLToPath(url));
      return nextLoad(url, context);
    }
  });
  return { files, hooks };
}

function pins(files, workerdPath) {
  const sourcePaths = [...new Set([
    ...files, realpathSync(process.execPath), workerdPath,
    path.join(repo, "package.json"), path.join(repo, "package-lock.json"),
    path.join(repo, "node_modules/wrangler/package.json")
  ])].sort();
  return {
    schema: CANARY_SCHEMA,
    nodeVersion: process.version,
    nodeExecutable: realpathSync(process.execPath),
    nodeArgs: process.execArgv,
    wranglerVersion: JSON.parse(readFileSync(path.join(repo, "node_modules/wrangler/package.json"), "utf8")).version,
    model: CANARY_MODEL, reasoningEffort: "high", maxOutputTokens: 256,
    maxProviderCalls: 1, maxBudgetUsd: 1, tools: [], fallback: [],
    inferenceRetries: 0, gatewayId: "stellar-raven-demo", deadline: CANARY_DEADLINE,
    configSha256: hash(CONFIG_BYTES),
    promptSha256: hash("Reply with exactly READY."),
    files: sourcePaths.map((file) => ({ path: realpathSync(file), sha256: hash(readFileSync(file)) }))
  };
}

export async function main(args = process.argv.slice(2)) {
  const flags = parseCanaryArgs(args);
  if (flags.help) {
    process.stdout.write("Free pins: node eval/qa/non-anthropic/canary.mjs --prepare-pins <file>\nPaid canary: node eval/qa/non-anthropic/canary.mjs --pins <file> --expect-pins-sha256 <sha256> --out <file> --max-budget-usd 1\n");
    return;
  }
  const preparing = Boolean(flags["--prepare-pins"]);
  const output = path.resolve(flags[preparing ? "--prepare-pins" : "--out"]);
  if (existsSync(output) || existsSync(`${output}.tmp`)) throw new Error("output already exists");
  mkdirSync(path.dirname(output), { recursive: true });
  let expected;
  if (!preparing) {
    assertCanaryDeadline();
    const bytes = readFileSync(flags["--pins"]);
    if (hash(bytes) !== flags["--expect-pins-sha256"]) throw new Error("pins file hash mismatch");
    expected = JSON.parse(bytes);
  }
  const tracking = trackModules();
  let platform;
  const temporary = mkdtempSync(path.join(os.tmpdir(), "raven-ai-canary-"));
  const configPath = path.join(temporary, "wrangler.json");
  writeFileSync(configPath, CONFIG_BYTES, { mode: 0o600 });
  const artifact = {
    schema: CANARY_SCHEMA, diagnostic: true,
    measurement: "provider transport only; no golden QA, MCP server, or remote-service identity claim",
    historicalQaComparable: false, canonicalFiveTrack: false,
    status: "not-started", selectedProviderCalls: 1, attemptedProviderCalls: 0,
    aggregateSuppressed: true, summary: null, costUsd: null, failure: null
  };
  try {
    const { providerCall } = await import("./provider.mjs");
    const budget = await import("../spend-budget.mjs");
    const { getPlatformProxy } = await import("wrangler");
    const require = createRequire(import.meta.url);
    const workerdPath = realpathSync(require("workerd").default);
    // A fresh config directory contains no .dev.vars or repository configuration.
    platform = await getPlatformProxy({ configPath, envFiles: [], remoteBindings: true, persist: false });
    if (JSON.stringify(Object.keys(platform.env)) !== '["AI"]') throw new Error("unexpected proxy binding");
    const before = pins(tracking.files, workerdPath);
    if (preparing) {
      atomicWrite(output, before);
      process.stdout.write(`Prepared free transport pins: ${output}\nSHA-256: ${hash(readFileSync(output))}\nNo inference request occurred.\n`);
      return;
    }
    assertPins(expected, before);
    if (hash(readFileSync(configPath)) !== before.configSha256) throw new Error("proxy config changed");
    artifact.pins = before;
    artifact.startedAt = new Date().toISOString();
    const ledger = budget.createSpendLedger(1);
    artifact.budget = budget.spendLedgerRecord(ledger);
    atomicWrite(output, artifact);
    assertCanaryDeadline();
    const authorization = budget.authorizeSpend(ledger, { method: "transport-canary", id: "provider-ready", attempt: 1 });
    artifact.status = "started";
    artifact.attemptedProviderCalls = 1;
    atomicWrite(output, artifact);
    let result;
    try {
      result = await providerCall(platform.env.AI, {
        gatewayId: "stellar-raven-demo", maxBudgetUsd: authorization.maxBudgetUsd,
        messages: [{ role: "user", content: "Reply with exactly READY." }],
        maxOutputTokens: 256, judge: true, beforeDispatch: assertCanaryDeadline
      });
      artifact.result = result;
      artifact.costUsd = result.costUsd;
      budget.recordSpend(ledger, authorization, result.costUsd);
      if (result.error) throw new Error(result.error);
      if (result.parsed.answer.trim() !== "READY") throw new Error("canary response mismatch");
      assertPins(before, pins(tracking.files, workerdPath));
      if (hash(readFileSync(configPath)) !== before.configSha256) throw new Error("proxy config changed");
      artifact.status = "complete";
    } catch {
      if (ledger.calls.length === 0) {
        try { budget.recordSpend(ledger, authorization, null); } catch { /* Preserve the unknown-cost call. */ }
      }
      artifact.status = "invalid";
      // Raw provider exceptions can contain credentials or request headers.
      artifact.failure = result?.error ?? "canary-validation-failed";
      process.exitCode = 1;
    } finally {
      artifact.budget = budget.spendLedgerRecord(ledger);
      artifact.finishedAt = new Date().toISOString();
      atomicWrite(output, artifact);
    }
    process.stdout.write(`Canary ${artifact.status}: ${output}\n`);
  } finally {
    if (platform) await platform.dispose();
    tracking.hooks.deregister();
    rmSync(temporary, { recursive: true, force: true });
  }
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  main().catch(() => { process.stderr.write("Canary stopped before completion; inspect the saved artifact if present.\n"); process.exitCode = 1; });
}
