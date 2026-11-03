import { createRequire, registerHooks } from "node:module";
import { mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const loaded = new Set([fileURLToPath(import.meta.url)]);
const hooks = registerHooks({ load(url, context, nextLoad) {
  if (url.startsWith("file:")) loaded.add(fileURLToPath(url));
  return nextLoad(url, context);
} });
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
let platform;
let temporary;
let active = false;
let initialized = false;
let configSha256;
let support;
let invokeProvider;
let workerdPath;
let normalizeProxyResponse;
let responseBrand;

function emit(value) { if (process.connected) process.send(value); }

function identity() {
  return {
    nodeVersion: process.version, nodeExecutable: realpathSync(process.execPath),
    environment: support.environmentIdentity(), configSha256,
    files: support.filePins([...loaded, workerdPath, realpathSync(process.execPath)])
  };
}

async function close() {
  try { if (platform) await platform.dispose(); } finally {
    hooks.deregister();
    if (temporary) rmSync(temporary, { recursive: true, force: true });
  }
}

process.on("message", async (message) => {
  if (active) { emit({ type: "fatal", code: "concurrent-provider-request" }); return; }
  active = true;
  try {
    if (message.type === "init") {
      if (initialized) throw new Error("already-initialized");
      support = await import("./runner-support.mjs");
      ({ providerCall: invokeProvider } = await import("./provider.mjs"));
      ({ normalizeProxyResponse, responseBrand } = await import("./proxy-response.mjs"));
      const { getPlatformProxy } = await import("wrangler");
      workerdPath = realpathSync(createRequire(import.meta.url)("workerd").default);
      const config = { name: "raven-direct-grok-eval", compatibility_date: "2026-06-11", account_id: message.accountId, ai: { binding: "AI", remote: true } };
      const bytes = JSON.stringify(config, null, 2) + "\n";
      configSha256 = hash(bytes);
      temporary = mkdtempSync(path.join(os.tmpdir(), "raven-direct-grok-"));
      const configPath = path.join(temporary, "wrangler.json");
      writeFileSync(configPath, bytes, { mode: 0o600 });
      platform = await getPlatformProxy({ configPath, envFiles: [], persist: false, remoteBindings: true });
      if (JSON.stringify(Object.keys(platform.env)) !== '["AI"]') throw new Error("unexpected-binding");
      loaded.add(path.join(support.REPO, "package-lock.json"));
      loaded.add(path.join(support.REPO, "node_modules/wrangler/package.json"));
      initialized = true;
      emit({ type: "ready", identity: identity() });
    } else if (message.type === "call") {
      if (!initialized) throw new Error("not-initialized");
      support.assertIdentity(message.expectedIdentity, identity(), "provider-worker");
      support.assertDeadline(message.deadline);
      let rawCalls = 0;
      let brand = null;
      let evidenceOpen = true;
      const evidence = (event) => {
        if (evidenceOpen) emit({ ...event, requestId: message.requestId });
      };
      const check = () => {
        support.assertDeadline(message.deadline);
        support.assertIdentity(message.expectedIdentity.environment, support.environmentIdentity(), "worker-environment");
      };
      const ai = {
        async run(model, body, options) {
          check();
          if (model !== support.MODEL || rawCalls !== 0) throw new Error("unexpected-raw-provider-call");
          rawCalls++;
          evidence({ type: "raw-started" });
          const remaining = support.assertDeadline(message.deadline);
          const rawResponse = await platform.env.AI.run(model, body, {
            ...options,
            extraHeaders: { ...options.extraHeaders, "cf-aig-request-timeout": String(Math.min(message.requestTimeoutMs, remaining)) }
          });
          brand = responseBrand(rawResponse);
          evidence({ type: "response-boundary", brand });
          const response = normalizeProxyResponse(rawResponse);
          evidence({ type: "response", status: response.status, logId: response.headers.get("cf-aig-log-id") });
          return response;
        },
        gateway(id) {
          if (id !== message.options.gatewayId) throw new Error("unexpected-gateway");
          const gateway = platform.env.AI.gateway(id);
          return {
            async getLog(logId) {
              // Settlement reads do not start inference and can finish after the deadline.
              const log = await gateway.getLog(logId);
              if (typeof log.cost === "number" && Number.isFinite(log.cost) && log.cost >= 0) evidence({ type: "reported-cost", logId, costUsd: log.cost });
              return log;
            }
          };
        }
      };
      let result;
      try {
        result = await invokeProvider(ai, { ...message.options, beforeDispatch: check,
          onCompletion: (completion) => evidence({ type: "response-boundary", brand, completion }) });
      } finally {
        // A raced getLog read can outlive settlement. Close its producer before any terminal message.
        evidenceOpen = false;
      }
      emit({ type: "result", requestId: message.requestId, result, rawCalls, identity: identity() });
    } else if (message.type === "identity") {
      emit({ type: "identity", identity: identity() });
    } else if (message.type === "close") {
      await close();
      process.exit(0);
    } else throw new Error("unknown-worker-message");
  } catch {
    emit({ type: "fatal", code: "provider-worker-failed", requestId: message.requestId ?? null });
  } finally { active = false; }
});

process.on("disconnect", () => { close().finally(() => process.exit(0)); });
process.once("SIGTERM", () => { close().finally(() => process.exit(0)); });
