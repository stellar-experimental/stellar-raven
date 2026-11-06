import { existsSync } from "node:fs";
import { chmod, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { afterEach, describe, expect, it } from "vitest";
// @ts-ignore The executable deliberately exposes pure CLI helpers for this test seam.
import * as gauntlet from "../scripts/run-demo-model-gauntlet.mjs";

const { buildLaunchPlan, formatLaunchPlan, parseGauntletArgs, validateGauntletInvocation } = gauntlet;

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

async function scratchOutDir() {
  const parent = await mkdtemp(path.join(os.tmpdir(), "demo-gauntlet-cli-"));
  temporaryDirectories.push(parent);
  return path.join(parent, "artifacts");
}

function runCli(args: string[]) {
  return spawnSync(process.execPath, ["scripts/run-demo-model-gauntlet.mjs", ...args], {
    cwd: process.cwd(),
    encoding: "utf8"
  });
}

describe("demo model gauntlet CLI safety", () => {
  it("lets literal help win before strict parsing and leaves its requested output absent", async () => {
    const outDir = await scratchOutDir();
    const result = runCli(["--help", "--not-a-real-flag", "--out-dir", outDir]);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Usage: node scripts/run-demo-model-gauntlet.mjs");
    expect(existsSync(outDir)).toBe(false);
  });

  it("prints the validated plan but makes no output before --confirm-paid", async () => {
    const outDir = await scratchOutDir();
    const result = runCli(["--models", "openai/test", "--prompts", "rpc-simulate", "--out-dir", outDir]);

    expect(result.status).toBe(1);
    expect(result.stdout).toContain("planned Playground chat turns: 1 (not guaranteed provider calls)");
    expect(result.stderr).toContain("--confirm-paid");
    expect(existsSync(outDir)).toBe(false);
  });

  it("rejects an invalid invocation before creating its requested output", async () => {
    const outDir = await scratchOutDir();
    const result = runCli(["--models", "openai/test", "--prompts", "not-a-prompt", "--out-dir", outDir]);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Invalid prompt ids: not-a-prompt.");
    expect(existsSync(outDir)).toBe(false);
  });

  it("strictly rejects unknown flags and flags missing a value", () => {
    expect(() => parseGauntletArgs(["--frobnicate"])).toThrow("Unknown argument: --frobnicate");
    expect(() => parseGauntletArgs(["--models", "--prompts", "rpc-simulate"])).toThrow("--models requires a value.");
  });

  it("does not default explicit empty model or prompt selections", () => {
    expect(() => validateGauntletInvocation(parseGauntletArgs(["--models", ""]))).toThrow("Model selection must be nonempty.");
    expect(() => validateGauntletInvocation(parseGauntletArgs(["--prompts", ""]))).toThrow("Prompt selection must be nonempty.");
  });

  it("rejects duplicate prompt ids before the paid launch plan", () => {
    expect(() => validateGauntletInvocation(parseGauntletArgs(["--prompts", "rpc-simulate,rpc-simulate"]))).toThrow(
      "Duplicate prompt ids: rpc-simulate."
    );
  });

  it("reports exact invalid prompt ids and rejects invalid numeric and effort values", () => {
    expect(() => validateGauntletInvocation(parseGauntletArgs(["--prompts", "rpc-simulate,not-real,also-not-real"]))).toThrow(
      "Invalid prompt ids: not-real, also-not-real."
    );
    for (const args of [
      ["--repeats", "0"],
      ["--timeout-ms", "abc"],
      ["--port-base", "65535"],
      ["--reasoning-effort", "bogus"]
    ]) {
      expect(() => validateGauntletInvocation(parseGauntletArgs(args))).toThrow();
    }
    expect(() => validateGauntletInvocation(parseGauntletArgs(["--openai-api-mode", "unsupported"]))).toThrow(
      "--openai-api-mode must be chat or responses."
    );
  });

  it("accepts one positive --max-budget-usd and reports it in the launch plan", () => {
    const invocation = validateGauntletInvocation(
      parseGauntletArgs(["--models", "model-a", "--prompts", "rpc-simulate", "--max-budget-usd", "2.5"])
    );
    expect(invocation.maxBudgetUsd).toBe(2.5);
    expect(formatLaunchPlan(buildLaunchPlan(invocation))).toContain("budget: USD 2.5 through loopback accounting");

    const unbudgeted = validateGauntletInvocation(parseGauntletArgs(["--models", "model-a", "--prompts", "rpc-simulate"]));
    expect(unbudgeted.maxBudgetUsd).toBeNull();
    expect(formatLaunchPlan(buildLaunchPlan(unbudgeted))).toContain("budget: none (no cost accounting; read the Gateway logs)");

    for (const value of ["0", "abc", "1e3", "$2"]) {
      expect(() => validateGauntletInvocation(parseGauntletArgs(["--max-budget-usd", value]))).toThrow(
        "--max-budget-usd must be a positive dollar amount."
      );
    }
    expect(() => parseGauntletArgs(["--max-budget-usd", "1", "--max-budget-usd", "2"])).toThrow(
      "--max-budget-usd may be given once."
    );
  });

  it("closes further authorization after an unknown cost while preserving the reported floor", () => {
    const budget = gauntlet.createGauntletBudget(1);
    expect(budget.remainingUsd()).toBe(1);
    budget.record({ costUsd: 0.25, models: ["openai/x"] });
    budget.record({ costUsd: null, error: "missing-answer-cost" });
    budget.record(null);
    expect(budget.remainingUsd()).toBe(0);
    expect(budget.snapshot()).toEqual({ authorizedUsd: 1, reportedUsd: 0.25, reportedTurns: 1, unknownCostTurns: 2 });
    budget.record({ costUsd: 0.8 });
    expect(budget.remainingUsd()).toBe(0);

    const settled = gauntlet.createGauntletBudget(1);
    settled.record({ costUsd: 1.01 });
    expect(settled.remainingUsd()).toBeLessThan(0);

    const unbudgeted = gauntlet.createGauntletBudget(null);
    unbudgeted.record({ costUsd: 5 });
    expect(unbudgeted.remainingUsd()).toBeNull();
    expect(unbudgeted.snapshot().reportedUsd).toBe(0);
  });

  it.each([
    { name: "missing cost", cost: null, repeats: 2, error: "unknown turn cost" },
    { name: "accounting error", cost: { costUsd: 0.1, error: "unsettled-call", calls: 1, reportedCalls: 1 }, repeats: 2, error: "unknown turn cost" },
    { name: "unsettled call count", cost: { costUsd: 0.1, calls: 2, reportedCalls: 1 }, repeats: 2, error: "unknown turn cost" },
    { name: "last-turn overspend", cost: { costUsd: 1.01, calls: 1, reportedCalls: 1 }, repeats: 1, error: "exceeds the authorized budget" },
    { name: "budget exhaustion", cost: { costUsd: 1, calls: 1, reportedCalls: 1 }, repeats: 2, error: "budget stopped the matrix" }
  ])("saves an incomplete matrix after $name without another turn", async ({ cost, repeats, error }) => {
    const directory = await mkdtemp(path.join(os.tmpdir(), "gauntlet-offline-server-"));
    temporaryDirectories.push(directory);
    let port: number;
    do {
      const reservation = createServer();
      await new Promise<void>((resolve) => reservation.listen(0, "127.0.0.1", resolve));
      const address = reservation.address();
      if (!address || typeof address === "string") throw new Error("No test port");
      port = address.port;
      await new Promise<void>((resolve) => reservation.close(() => resolve()));
    } while (port > 64000);
    const countFile = path.join(directory, "turns");
    const fakeNpx = path.join(directory, "npx");
    await writeFile(fakeNpx, `#!/usr/bin/env node
const http = require('node:http');
const fs = require('node:fs');
let turns = 0;
http.createServer((req, res) => {
  if (req.method !== 'POST') { res.end('ready'); return; }
  fs.writeFileSync(${JSON.stringify(countFile)}, String(++turns));
  res.writeHead(200, {'content-type': 'text/event-stream'});
  for (const frame of ${JSON.stringify([{ type: "ready" }, { type: "token", text: "Offline fixture" }, { type: "done", reason: "stop" }, ...(cost ? [{ type: "eval-cost", ...cost }] : [])])}) {
    res.write('data: ' + JSON.stringify(frame) + '\\n\\n');
  }
  res.end();
}).listen(Number(process.argv[process.argv.indexOf('--port') + 1]));
`);
    await chmod(fakeNpx, 0o755);
    const outDir = path.join(directory, "results");
    const result = spawnSync(process.execPath, ["scripts/run-demo-model-gauntlet.mjs",
      "--models", "openai/offline-fixture", "--prompts", "rpc-simulate", "--repeats", String(repeats),
      "--max-budget-usd", "1", "--confirm-paid", "--port-base", String(port),
      "--run-id", "missing-cost", "--out-dir", outDir
    ], {
      cwd: process.cwd(), encoding: "utf8", timeout: 20_000,
      env: { ...process.env, PATH: `${directory}${path.delimiter}${process.env.PATH}`, MCP_SERVER_SECRET: "offline-test-placeholder" }
    });
    expect(result.status, result.stderr).toBe(1);
    expect(result.stderr).toContain(error);
    expect(await readFile(countFile, "utf8")).toBe("1");
    const artifact = JSON.parse(await readFile(path.join(outDir, "missing-cost.json"), "utf8"));
    expect(artifact.completion).toEqual({ plannedTurns: repeats, completedTurns: 1, status: "incomplete" });
    expect(artifact.results).toHaveLength(1);
    expect(artifact.budget.unknownCostTurns).toBe(error === "unknown turn cost" ? 1 : 0);
  }, 25_000);

  it("computes launch-plan turns across the full selected matrix", () => {
    const invocation = validateGauntletInvocation(
      parseGauntletArgs([
        "--models", "model-a,model-b",
        "--reasoning-efforts", "default,high",
        "--prompts", "rpc-simulate,soroswap-builder",
        "--repeats", "3",
        "--port-base", "9000",
        "--timeout-ms", "5000",
        "--out-dir", "/tmp/gauntlet-plan"
      ])
    );
    const plan = buildLaunchPlan(invocation);

    expect(plan.totalPaidTurns).toBe(24);
    expect(plan.portLast).toBe(9003);
    expect(formatLaunchPlan(plan)).toContain("planned Playground chat turns: 24 (not guaranteed provider calls)");
  });
});
