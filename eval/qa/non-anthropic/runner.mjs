import { readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import { boundServerIdentity, assertStableBoundServerIdentity } from "../../lib/bound-server-identity.mjs";
import { captureRemoteIdentity, createRemoteIdentityGuard, remoteIdentityProbeIdentity, remoteIdentityVectorSha256 } from "../remote-identity-guard.mjs";
import { BindingClient } from "./binding-client.mjs";
import { connectMcp } from "./mcp-client.mjs";
import { runMethod } from "./method.mjs";
import { REPO, PLAN_SCHEMA, RUN_SCHEMA, parseRunnerArgs, readPinnedJson, validateRunnerPlan, loadSelection,
  atomicWrite, requireNewOutput, environmentIdentity, filePins, checkFilePins, assertIdentity, assertDeadline, jsonSha } from "./runner-support.mjs";

function planSettings(plan) {
  const { sourcePins, ...settings } = plan;
  return settings;
}

function parentIdentity(files) {
  return {
    nodeVersion: process.version, nodeExecutable: realpathSync(process.execPath), nodeArgs: process.execArgv,
    cwd: process.cwd(), environment: environmentIdentity(),
    files: filePins([...files, process.execPath, path.join(REPO, "package-lock.json"), path.join(REPO, "package.json")])
  };
}

function verifyRemote(probe, expectedSha256) {
  const vector = captureRemoteIdentity(probe);
  if (remoteIdentityVectorSha256(vector) !== expectedSha256) throw new Error("remote-vector-changed");
  return { capturedAt: new Date().toISOString(), vector, vectorSha256: expectedSha256 };
}

export async function main(args, loadedFiles) {
  const flags = parseRunnerArgs(args);
  if (flags.help) {
    process.stdout.write("Free: --mode prepare-pins|validate-plan --plan FILE --expect-plan-sha256 HEX --out FILE\nPaid: --mode transport-canary|selftest|baseline --plan FILE --expect-plan-sha256 HEX --out FILE --max-budget-usd USD\n");
    return;
  }
  if (process.execArgv.length || process.env.NODE_OPTIONS) throw new Error("node-preloads-not-permitted");
  const mode = flags["--mode"];
  const planPath = path.resolve(flags["--plan"]);
  const planHash = flags["--expect-plan-sha256"];
  const plan = readPinnedJson(planPath, planHash);
  validateRunnerPlan(plan, { mode, budgetUsd: flags.budgetUsd, preparing: mode === "prepare-pins" });
  const output = path.resolve(flags["--out"]);
  requireNewOutput(output);
  const selection = await loadSelection(plan);
  const transportCanary = plan.method === "transport-canary";
  const probe = transportCanary ? null : remoteIdentityProbeIdentity(plan.remote.probePath, plan.remote.probeSha256, { repoRoot: REPO });
  const listener = transportCanary ? null : boundServerIdentity(plan.server.port, plan.server.revision);
  const binding = new BindingClient();
  let mcp;
  try {
    const workerIdentity = await binding.initialize(plan.accountId);
    if (!transportCanary) mcp = await connectMcp(plan);
    const freeRemoteCheck = transportCanary ? null : verifyRemote(probe, plan.remote.vectorSha256);
    const currentPins = {
      schema: "direct-grok-loaded-sources-v1", planSettingsSha256: jsonSha(planSettings(plan)),
      parent: parentIdentity(loadedFiles), worker: workerIdentity
    };
    if (mode === "prepare-pins") {
      atomicWrite(output, currentPins);
      process.stdout.write(`Free source pins saved: ${output}\nNo inference occurred.\n`);
      return;
    }
    const expectedPins = readPinnedJson(plan.sourcePins.path, plan.sourcePins.sha256);
    assertIdentity(expectedPins, currentPins, "prepared-source");

    async function guard() {
      assertIdentity(plan, readPinnedJson(planPath, planHash), "plan");
      await loadSelection(plan);
      checkFilePins(expectedPins.parent.files);
      checkFilePins(expectedPins.worker.files);
      assertIdentity(expectedPins.parent, parentIdentity(loadedFiles), "parent");
      if (!transportCanary) {
        remoteIdentityProbeIdentity(plan.remote.probePath, plan.remote.probeSha256, { repoRoot: REPO });
        assertStableBoundServerIdentity(listener, boundServerIdentity(plan.server.port, plan.server.revision));
        await mcp.surface();
      }
      assertIdentity(expectedPins.worker, await binding.identity(), "provider-worker");
    }

    await guard();
    if (mode === "validate-plan") {
      atomicWrite(output, { schema: "direct-grok-plan-validation-v1", planSchema: PLAN_SCHEMA,
        planSha256: planHash, sourcePinsSha256: plan.sourcePins.sha256, freeRemoteCheck,
        listener, validatedAt: new Date().toISOString(), inferenceCalls: 0 });
      process.stdout.write(`Plan validated without inference: ${output}\n`);
      return;
    }

    const evidence = { planSha256: planHash, sourcePins: expectedPins, listener, freeRemoteCheck,
      remoteIdentityGuard: null, final: null };
    const remote = transportCanary ? null : createRemoteIdentityGuard({ probeIdentity: probe, expectedVectorSha256: plan.remote.vectorSha256,
      checkCancelled: () => assertDeadline(plan.deadline) });
    const result = await runMethod({
      plan, cases: selection.cases, tools: mcp?.tools ?? [], instructions: mcp?.instructions ?? "", evidence,
      guard, remote,
      provider: (request) => binding.call({ ...request, plan, expectedIdentity: expectedPins.worker }),
      callTool: (name, input) => mcp.callTool(name, input),
      write: (artifact) => atomicWrite(output, artifact),
      finalize: async () => {
        const failures = [];
        try { await guard(); } catch { failures.push("final-local-identity-failed"); }
        try {
          if (plan.method === "baseline") { remote.postflight(); evidence.remoteIdentityGuard = remote.record(); }
          else if (!transportCanary) evidence.finalRemoteCheck = verifyRemote(probe, plan.remote.vectorSha256);
        } catch {
          evidence.remoteIdentityGuard = remote?.record() ?? null;
          failures.push("final-remote-identity-failed");
        }
        evidence.final = { checkedAt: new Date().toISOString(), failures };
        if (failures.length) throw new Error("final-identity-failed");
      }
    });
    if (result.status !== "complete" || plan.method === "selftest" && result.selftestPassed !== true) process.exitCode = 1;
    process.stdout.write(`Diagnostic ${result.status}: ${output}\n`);
  } finally {
    try { if (mcp) await mcp.close(); } finally { await binding.close(); }
  }
}
