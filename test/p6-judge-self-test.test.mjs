import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  P6_SELF_TEST_CALL_SCHEMA,
  P6_SELF_TEST_CALLS,
  P6_SELF_TEST_PER_CALL_BUDGET,
  P6_SELF_TEST_SUMMARY_SCHEMA,
  assertStableP6SelfTestIdentity,
  attestP6SelfTestIdentity,
  p6SelfTestWrapperSha256,
  runP6JudgeSelfTest
} from "../eval/qa/run-p6-judge-self-test.mjs";
import {
  runJudgeSelfTestCandidate,
  runPinnedJudgeSelfTestCandidate
} from "../eval/qa/judge.mjs";

const identity = {
  runner: { cwd: "/tmp/runner", revision: "a".repeat(40), dirty: false },
  binary: {
    resolvedPath: "/opt/claude",
    realPath: "/opt/claude-real",
    sha256: "b".repeat(64),
    version: "1.2.3"
  },
  environment: { sha256: "c".repeat(64) }
};
const pins = {
  runnerRevision: identity.runner.revision,
  claudePath: identity.binary.resolvedPath,
  claudeBinarySha256: identity.binary.sha256,
  claudeEnvironmentSha256: identity.environment.sha256
};

function callRecord(index, overrides = {}) {
  return {
    schema: P6_SELF_TEST_CALL_SCHEMA,
    index,
    callNumber: index + 1,
    label: `candidate-${index}`,
    expected: "correct",
    actual: "correct",
    costUsd: Number((0.1 + index / 100).toFixed(2)),
    maxBudgetUsd: 0.5,
    gradeMatches: true,
    costReported: true,
    costWithinCap: true,
    ok: true,
    runnerRevision: identity.runner.revision,
    runnerDirty: false,
    claudePath: identity.binary.resolvedPath,
    claudeRealPath: identity.binary.realPath,
    claudeBinarySha256: identity.binary.sha256,
    claudeEnvironmentSha256: identity.environment.sha256,
    ...overrides
  };
}

function successfulSpawner(spawns, recordOverrides = () => ({})) {
  return (command, args, options) => {
    spawns.push({ command, args, options });
    const indexFlag = args.indexOf("--self-test-candidate");
    if (indexFlag < 0) return { status: 0, stdout: "static ok", stderr: "" };
    const index = Number(args[indexFlag + 1]);
    return {
      status: 0,
      stdout: JSON.stringify(callRecord(index, recordOverrides(index))),
      stderr: ""
    };
  };
}

describe("reviewed p6 judge self-test wrapper", () => {
  it("runs exactly seven calls with one path and exact identity pins", () => {
    const spawns = [];
    const summary = runP6JudgeSelfTest({
      pins,
      spawnSyncImpl: successfulSpawner(spawns),
      judgePath: "/tmp/judge.mjs",
      attestIdentity: () => structuredClone(identity),
      log() {}
    });

    expect(summary.calls).toBe(7);
    expect(spawns).toHaveLength(8);
    expect(spawns[0].args).toEqual(["/tmp/judge.mjs", "--self-test-static"]);
    for (const [index, spawn] of spawns.slice(1).entries()) {
      expect(spawn.args).toEqual([
        "/tmp/judge.mjs",
        "--self-test-candidate",
        String(index),
        "--max-budget-usd",
        "0.50",
        "--runner-revision",
        identity.runner.revision,
        "--claude-path",
        identity.binary.resolvedPath,
        "--expect-claude-binary-sha256",
        identity.binary.sha256,
        "--expect-claude-environment-sha256",
        identity.environment.sha256
      ]);
    }
    expect(P6_SELF_TEST_CALLS).toBe(7);
    expect(P6_SELF_TEST_PER_CALL_BUDGET).toBe("0.50");
  });

  it("emits one strict JSON summary with seven records and exact total cost", () => {
    const output = [];
    const summary = runP6JudgeSelfTest({
      pins,
      spawnSyncImpl: successfulSpawner([]),
      attestIdentity: () => structuredClone(identity),
      log: (line) => output.push(line)
    });
    const parsed = JSON.parse(output[0]);

    expect(output).toHaveLength(1);
    expect(parsed).toEqual(summary);
    expect(summary.schema).toBe(P6_SELF_TEST_SUMMARY_SCHEMA);
    expect(summary.callRecords).toHaveLength(7);
    expect(summary.reportedCosts).toEqual([0.1, 0.11, 0.12, 0.13, 0.14, 0.15, 0.16]);
    expect(summary.missingCosts).toEqual([]);
    expect(summary.totalCostUsd).toBe(0.91);
    expect(summary.maxAuthorizedCostUsd).toBe(3.5);
  });

  it("stops before the next paid call after one failed record", () => {
    const spawns = [];
    const spawnSyncImpl = successfulSpawner(spawns, (index) =>
      index === 2 ? { actual: "wrong", gradeMatches: false, ok: false } : {}
    );
    expect(() => runP6JudgeSelfTest({
      pins,
      spawnSyncImpl,
      attestIdentity: () => structuredClone(identity),
      log() {}
    })).toThrow(/candidate 2 failed/);
    expect(spawns).toHaveLength(4);
  });

  it("stops before every paid call when the static preflight fails", () => {
    const spawns = [];
    const spawnSyncImpl = (_command, args) => {
      spawns.push(args);
      return { status: 1, stdout: "", stderr: "static failed" };
    };
    expect(() => runP6JudgeSelfTest({
      pins,
      spawnSyncImpl,
      attestIdentity: () => structuredClone(identity),
      log() {}
    })).toThrow(/static failed/);
    expect(spawns).toEqual([[expect.any(String), "--self-test-static"]]);
  });

  it.each([
    ["non-JSON output", () => ({ stdout: "not-json" }), /strict JSON/],
    ["an extra field", (index) => ({ stdout: JSON.stringify(callRecord(index, { extra: true })) }), /record shape/],
    ["a missing cost", (index) => ({
      stdout: JSON.stringify(callRecord(index, { costUsd: null, costReported: false, costWithinCap: false }))
    }), /missing, negative, or over-cap/],
    ["a negative cost", (index) => ({ stdout: JSON.stringify(callRecord(index, { costUsd: -0.01 })) }), /missing, negative, or over-cap/],
    ["an over-cap cost", (index) => ({ stdout: JSON.stringify(callRecord(index, { costUsd: 0.51 })) }), /missing, negative, or over-cap/],
    ["a duplicate index", (index) => ({ stdout: JSON.stringify(callRecord(index + 1)) }), /mismatched call identity/],
    ["a changed binary hash", (index) => ({
      stdout: JSON.stringify(callRecord(index, { claudeBinarySha256: "d".repeat(64) }))
    }), /drifted runner or Claude identity/]
  ])("rejects %s", (_name, mutation, expected) => {
    const spawnSyncImpl = (_command, args) => {
      const indexFlag = args.indexOf("--self-test-candidate");
      if (indexFlag < 0) return { status: 0, stdout: "static ok", stderr: "" };
      const index = Number(args[indexFlag + 1]);
      return { status: 0, stderr: "", ...mutation(index) };
    };
    expect(() => runP6JudgeSelfTest({
      pins,
      spawnSyncImpl,
      attestIdentity: () => structuredClone(identity),
      log() {}
    })).toThrow(expected);
  });

  it("detects runner, binary, and environment identity drift", () => {
    for (const mutate of [
      (value) => { value.runner.revision = "d".repeat(40); },
      (value) => { value.binary.sha256 = "d".repeat(64); },
      (value) => { value.environment.sha256 = "d".repeat(64); }
    ]) {
      let attestations = 0;
      expect(() => runP6JudgeSelfTest({
        pins,
        spawnSyncImpl: successfulSpawner([]),
        attestIdentity: () => {
          const value = structuredClone(identity);
          if (attestations++ === 1) mutate(value);
          return value;
        },
        log() {}
      })).toThrow(/changed during|identity changed/);
    }
  });

  it("requires the pinned clean runner, binary hash, and environment hash", () => {
    const dependencies = {
      gitIdentity: () => structuredClone(identity.runner),
      executableIdentityImpl: () => structuredClone(identity.binary),
      environmentIdentityImpl: () => structuredClone(identity.environment)
    };
    expect(attestP6SelfTestIdentity(pins, dependencies)).toMatchObject(identity);
    expect(() => attestP6SelfTestIdentity(
      { ...pins, runnerRevision: "d".repeat(40) },
      dependencies
    )).toThrow(/runner revision mismatch/);
    expect(() => attestP6SelfTestIdentity(pins, {
      ...dependencies,
      gitIdentity: () => ({ ...identity.runner, dirty: true })
    })).toThrow(/clean runner worktree/);
    expect(() => attestP6SelfTestIdentity(
      { ...pins, claudeBinarySha256: "d".repeat(64) },
      dependencies
    )).toThrow(/expected SHA-256/);
    expect(() => attestP6SelfTestIdentity(
      { ...pins, claudeEnvironmentSha256: "d".repeat(64) },
      dependencies
    )).toThrow(/expected SHA-256/);
  });

  it("exposes the stable SHA-256 of its own file", () => {
    const filePath = fileURLToPath(new URL("../eval/qa/run-p6-judge-self-test.mjs", import.meta.url));
    const expected = createHash("sha256").update(readFileSync(filePath)).digest("hex");
    expect(p6SelfTestWrapperSha256()).toBe(expected);
    expect(p6SelfTestWrapperSha256()).toMatch(/^[a-f0-9]{64}$/);
  });

  it("passes the fixed cap into the judge and rejects negative or missing costs", async () => {
    let receivedOptions;
    const passed = await runJudgeSelfTestCandidate(0, {
      judge: async (_input, options) => {
        receivedOptions = options;
        return { score: "correct", costUsd: 0.12 };
      },
      maxBudgetUsd: 0.5,
      log() {}
    });
    expect(receivedOptions).toEqual({ maxBudgetUsd: 0.5 });
    expect(passed).toMatchObject({ ok: true, costReported: true, costWithinCap: true });

    for (const costUsd of [undefined, -0.01, 0.51]) {
      const rejected = await runJudgeSelfTestCandidate(0, {
        judge: async () => ({ score: "correct", ...(costUsd === undefined ? {} : { costUsd }) }),
        maxBudgetUsd: 0.5,
        log() {}
      });
      expect(rejected.ok).toBe(false);
    }
  });

  it("pins one Claude path inside each candidate call record", async () => {
    let receivedOptions;
    const record = await runPinnedJudgeSelfTestCandidate(0, pins, {
      judge: async (_input, options) => {
        receivedOptions = options;
        return { score: "correct", costUsd: 0.2 };
      },
      attestIdentity: () => structuredClone(identity)
    });
    expect(receivedOptions).toEqual({ maxBudgetUsd: 0.5, command: "/opt/claude" });
    expect(record).toEqual(callRecord(0, { label: record.label, costUsd: 0.2 }));
  });

  it("rejects a dirty runner before identity comparison", () => {
    const dirty = structuredClone(identity);
    dirty.runner.dirty = true;
    expect(() => assertStableP6SelfTestIdentity(identity, dirty)).toThrow(/runner worktree/);
  });
});
