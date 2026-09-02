import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { chmodSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  buildDiscoveryAgentArgs,
  collectBudgetedAgentRun,
  formatRunFailure,
  parseOptionalIdsFlag,
  parsePaidRunPreconditions,
  withPaidRunPreconditions
} from "../eval/discovery/run-agent-discovery.mjs";
import { agentEnvironmentIdentity } from "../eval/lib/executable-identity.mjs";
import {
  BudgetAuthorizationExceededError,
  BudgetExhaustedError,
  MissingReportedCostError,
  createSpendLedger,
  spendLedgerRecord
} from "../eval/qa/spend-budget.mjs";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RUNNER_PATH = path.join(REPO_ROOT, "eval", "discovery", "run-agent-discovery.mjs");
const sha256 = (value) => createHash("sha256").update(value).digest("hex");

function createCliFixture() {
  const root = mkdtempSync(path.join(os.tmpdir(), "discovery-paid-run-"));
  const claudePath = path.join(root, "claude");
  const callLogPath = path.join(root, "paid-calls.log");
  writeFileSync(
    claudePath,
    [
      "#!/bin/sh",
      "printf '%s\\n' paid >> \"$DISCOVERY_FAKE_CALL_LOG\"",
      "printf '%s\\n' '{\"type\":\"result\",\"total_cost_usd\":0.01}'",
      ""
    ].join("\n")
  );
  chmodSync(claudePath, 0o755);
  writeFileSync(callLogPath, "");
  const environment = {
    PATH: `${root}:/usr/bin:/bin`,
    HOME: path.join(root, "home"),
    SHELL: "/bin/sh",
    TMPDIR: root,
    DISCOVERY_FAKE_CALL_LOG: callLogPath
  };
  const binarySha256 = sha256(readFileSync(claudePath));
  const environmentSha256 = agentEnvironmentIdentity(environment).sha256;
  const paidCalls = () => readFileSync(callLogPath, "utf8").split("\n").filter(Boolean);
  const run = (args) =>
    spawnSync(process.execPath, [RUNNER_PATH, ...args], {
      cwd: REPO_ROOT,
      env: environment,
      encoding: "utf8"
    });
  return { root, binarySha256, environmentSha256, paidCalls, run };
}

function requiredArgs(fixture, {
  binary = ["--expect-agent-binary-sha256", fixture.binarySha256],
  environment = ["--expect-agent-environment-sha256", fixture.environmentSha256],
  budget = ["--max-budget-usd", "1"],
  revision = ["--server-revision", "a".repeat(40)],
  surface = ["--expect-sha256", "b".repeat(64)]
} = {}) {
  return [...binary, ...environment, ...budget, ...revision, ...surface];
}

describe("agent-discovery paid-run flag guards", () => {
  it.each([
    ["binary absent", { binary: [] }, /requires --expect-agent-binary-sha256/],
    ["binary duplicate", { binary: ["--expect-agent-binary-sha256", "a".repeat(64), "--expect-agent-binary-sha256", "b".repeat(64)] }, /accepts --expect-agent-binary-sha256 exactly once/],
    ["binary value missing", { binary: ["--expect-agent-binary-sha256"] }, /expect-agent-binary-sha256 requires a value/],
    ["binary empty", { binary: ["--expect-agent-binary-sha256", ""] }, /expect-agent-binary-sha256 requires a value/],
    ["binary equals", { binary: [`--expect-agent-binary-sha256=${"a".repeat(64)}`] }, /expect-agent-binary-sha256=<value> is not supported/],
    ["environment absent", { environment: [] }, /requires --expect-agent-environment-sha256/],
    ["environment duplicate", { environment: ["--expect-agent-environment-sha256", "a".repeat(64), "--expect-agent-environment-sha256", "b".repeat(64)] }, /accepts --expect-agent-environment-sha256 exactly once/],
    ["environment value missing", { environment: ["--expect-agent-environment-sha256"] }, /expect-agent-environment-sha256 requires a value/],
    ["environment empty", { environment: ["--expect-agent-environment-sha256", ""] }, /expect-agent-environment-sha256 requires a value/],
    ["environment equals", { environment: [`--expect-agent-environment-sha256=${"a".repeat(64)}`] }, /expect-agent-environment-sha256=<value> is not supported/],
    ["budget absent", { budget: [] }, /requires --max-budget-usd/],
    ["budget duplicate", { budget: ["--max-budget-usd", "1", "--max-budget-usd", "2"] }, /accepts --max-budget-usd exactly once/],
    ["budget value missing", { budget: ["--max-budget-usd"] }, /max-budget-usd requires a value/],
    ["budget equals", { budget: ["--max-budget-usd=1"] }, /max-budget-usd=<value> is not supported/],
    ["revision absent", { revision: [] }, /requires --server-revision/],
    ["revision duplicate", { revision: ["--server-revision", "a".repeat(40), "--server-revision", "b".repeat(40)] }, /accepts --server-revision exactly once/],
    ["revision value missing", { revision: ["--server-revision"] }, /server-revision requires a value/],
    ["revision empty", { revision: ["--server-revision", ""] }, /server-revision requires a value/],
    ["revision equals", { revision: [`--server-revision=${"a".repeat(40)}`] }, /server-revision=<value> is not supported/],
    ["surface absent", { surface: [] }, /requires --expect-sha256/],
    ["surface duplicate", { surface: ["--expect-sha256", "a".repeat(64), "--expect-sha256", "b".repeat(64)] }, /accepts --expect-sha256 exactly once/],
    ["surface value missing", { surface: ["--expect-sha256"] }, /expect-sha256 requires a value/],
    ["surface empty", { surface: ["--expect-sha256", ""] }, /expect-sha256 requires a value/],
    ["surface equals", { surface: [`--expect-sha256=${"b".repeat(64)}`] }, /expect-sha256=<value> is not supported/]
  ])("rejects %s before a paid call", (_name, override, message) => {
    const fixture = createCliFixture();
    try {
      const args = requiredArgs(fixture, override);
      const continuations = [];
      expect(() => withPaidRunPreconditions(args, (paidRun) => continuations.push(paidRun))).toThrow(message);
      expect(continuations).toEqual([]);
      const result = fixture.run(args);
      expect(result.status).not.toBe(0);
      expect(result.stderr).toMatch(message);
      expect(fixture.paidCalls()).toEqual([]);
    } finally {
      rmSync(fixture.root, { recursive: true, force: true });
    }
  });

  it.each([
    ["equals form", ["--ids=discovery-001"], /--ids=<value> is not supported/],
    ["duplicate", ["--ids", "discovery-001", "--ids", "discovery-002"], /accepts --ids at most once/]
  ])("rejects the %s --ids selector before a paid call", (_name, idsArgs, message) => {
    const fixture = createCliFixture();
    try {
      const args = [...requiredArgs(fixture), ...idsArgs];
      const continuations = [];
      expect(() => withPaidRunPreconditions(args, (paidRun) => continuations.push(paidRun)))
        .toThrow(message);
      expect(continuations).toEqual([]);

      const result = fixture.run(args);
      expect(result.status).not.toBe(0);
      expect(result.stderr).toMatch(message);
      expect(fixture.paidCalls()).toEqual([]);
    } finally {
      rmSync(fixture.root, { recursive: true, force: true });
    }
  });

  it("preserves a spaced --ids selector", () => {
    expect(parseOptionalIdsFlag(["--ids", "discovery-001,discovery-002"]))
      .toBe("discovery-001,discovery-002");
  });

  it("passes each remaining authorization to the agent command", () => {
    const args = buildDiscoveryAgentArgs({
      mcpConfigPath: "/tmp/mcp.json",
      model: "fixture",
      effort: "medium",
      maxBudgetUsd: 0.75
    });
    const index = args.indexOf("--max-budget-usd");
    expect(args.slice(index, index + 2)).toEqual(["--max-budget-usd", "0.75"]);
  });

  it("rejects a missing agent-call cap before it can form a CLI argument", () => {
    expect(() => buildDiscoveryAgentArgs({
      mcpConfigPath: "/tmp/mcp.json",
      model: "fixture",
      effort: "medium"
    })).toThrow(/finite non-negative number/);
  });

  it("uses one ledger across rows and stops before the next paid call", () => {
    const ledger = createSpendLedger(0.2);
    const authorized = [];
    const first = collectBudgetedAgentRun({
      caseId: "first",
      runIndex: 1,
      spendLedger: ledger,
      invokeAgent: (maxBudgetUsd) => {
        authorized.push(maxBudgetUsd);
        return { costUsd: 0.2 };
      }
    });

    expect(first.costUsd).toBe(0.2);
    expect(() => collectBudgetedAgentRun({
      caseId: "second",
      runIndex: 1,
      spendLedger: ledger,
      invokeAgent: (maxBudgetUsd) => {
        authorized.push(maxBudgetUsd);
        return { costUsd: 0 };
      }
    })).toThrow(BudgetExhaustedError);
    expect(authorized).toEqual([0.2]);
    expect(spendLedgerRecord(ledger)).toMatchObject({
      authorizedUsd: 0.2,
      reportedSpendUsd: 0.2,
      remainingUsd: 0,
      calls: [{ method: "agent-discovery", id: "first", attempt: 1, authorizedUsd: 0.2, costUsd: 0.2 }],
      stoppedBefore: { method: "agent-discovery", id: "second", attempt: 1, remainingUsd: 0 }
    });
  });

  it.each([
    ["missing", null, MissingReportedCostError],
    ["invalid", "0.1", MissingReportedCostError],
    ["excessive", 0.2, BudgetAuthorizationExceededError]
  ])("records a %s cost before it fails the budget", (_name, costUsd, ErrorClass) => {
    const ledger = createSpendLedger(0.1);
    const invoked = [];
    expect(() => collectBudgetedAgentRun({
      caseId: "cost-case",
      runIndex: 1,
      spendLedger: ledger,
      invokeAgent: (maxBudgetUsd) => {
        invoked.push(maxBudgetUsd);
        return { costUsd };
      }
    })).toThrow(ErrorClass);
    expect(invoked).toEqual([0.1]);
    expect(spendLedgerRecord(ledger).calls).toHaveLength(1);
  });

  it("records an invocation exception as an unreported paid call", () => {
    const ledger = createSpendLedger(0.1);
    let failure;
    try {
      collectBudgetedAgentRun({
        caseId: "parse-case",
        runIndex: 1,
        spendLedger: ledger,
        invokeAgent: () => {
          throw new Error("stream parse failed");
        }
      });
    } catch (error) {
      failure = error;
    }
    expect(failure).toBeInstanceOf(MissingReportedCostError);
    expect(failure.cause).toMatchObject({ message: "stream parse failed" });
    expect(formatRunFailure(failure)).toContain("cause: stream parse failed");
    expect(spendLedgerRecord(ledger)).toMatchObject({
      expectedCalls: 1,
      reportedCalls: 0,
      missingCosts: 1,
      calls: [{ method: "agent-discovery", id: "parse-case", attempt: 1, authorizedUsd: 0.1, costUsd: null }]
    });
  });

  it("parses and forwards valid paid-run preconditions exactly once", () => {
    const args = [
      "--expect-agent-binary-sha256", "a".repeat(64),
      "--expect-agent-environment-sha256", "b".repeat(64),
      "--max-budget-usd", "1.25",
      "--server-revision", "c".repeat(40),
      "--expect-sha256", "d".repeat(64),
      "--ids", "discovery-001,discovery-002"
    ];
    const expected = {
      agentBinarySha256: "a".repeat(64),
      agentEnvironmentSha256: "b".repeat(64),
      maxBudgetUsd: 1.25,
      serverRevision: "c".repeat(40),
      surfaceSha256: "d".repeat(64),
      ids: "discovery-001,discovery-002"
    };
    expect(parsePaidRunPreconditions(args)).toEqual(expected);

    const continuations = [];
    const result = withPaidRunPreconditions(args, (paidRun) => {
      continuations.push(paidRun);
      return "continued";
    });
    expect(result).toBe("continued");
    expect(continuations).toEqual([expected]);
  });
});
