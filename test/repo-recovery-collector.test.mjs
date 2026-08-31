import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  checkStellarDocsReadiness,
  collectRepositoryRecovery,
  implementationIdentity,
  parseMaxPaidCalls,
  parsePort
} from "../eval/repo-recovery/collect.mjs";
import { loadSuite } from "../eval/repo-recovery/lint.mjs";

const REVISION = "a".repeat(40);
const SHA256 = "b".repeat(64);
const SURFACE_SHA256 = "c".repeat(64);
const workdirs = [];

afterEach(() => {
  for (const directory of workdirs.splice(0)) rmSync(directory, { recursive: true, force: true });
});

function suiteWith(count) {
  return {
    contract: "repository-tooling-recovery-v2",
    cases: Array.from({ length: count }, (_, index) => ({
      id: `collector-case-${index + 1}`,
      class: "positive",
      question: `Question ${index + 1}`
    }))
  };
}

function answerRun({ failure = null, costUsd = 0.1, answer = "Stored answer", inputSha256 = "d".repeat(64) } = {}) {
  return {
    answer,
    transcript: [{
      tool: "mcp__raven__execute",
      input: '{"code":"async () => stellarDocs.search_docs({ query: \\"test\\" })"}',
      result: "stored tool result"
    }],
    failure,
    costUsd,
    inputSha256,
    answerSha256: "e".repeat(64),
    turns: 1,
    usage: { input_tokens: 10, output_tokens: 5 },
    mcpServers: { raven: { status: "connected" } },
    promptChars: 100,
    stderr: "",
    artifacts: []
  };
}

function outputPath() {
  const directory = mkdtempSync(path.join(os.tmpdir(), "repo-recovery-collector-test-"));
  workdirs.push(directory);
  return path.join(directory, "collection.json");
}

function identityRecord() {
  return {
    live: {
      metrics: { surfaceSha256: SURFACE_SHA256 },
      serverInfo: { sourceRevision: REVISION }
    },
    surfacePin: { matches: true },
    sourceRevisionPin: { matches: true },
    processIdentity: {
      port: 8788,
      pid: 123,
      command: "node",
      cwd: "/server",
      revision: REVISION,
      dirty: false
    },
    processGuard: { matches: true }
  };
}

function sourceIdentity() {
  return {
    runnerDirty: false,
    runnerRevision: REVISION,
    serverRevision: REVISION,
    qaImplementationSha256: SHA256
  };
}

function collectorOptions({
  suite,
  runs,
  output,
  maxBudgetUsd = 30,
  maxPaidCalls = 40,
  environment = {},
  probeIdentityImpl,
  docsReadinessImpl,
  runAgentImpl
} = {}) {
  let runIndex = 0;
  return {
    suite,
    port: 8788,
    model: "claude-sonnet-5",
    maxBudgetUsd,
    maxPaidCalls,
    expectedSurfaceSha256: SURFACE_SHA256,
    expectedAgentBinarySha256: SHA256,
    serverRevision: REVISION,
    collectorAuthor: "codex-gpt-5.6-sol-high",
    orchestrator: "codex-gpt-5.6-sol-high",
    outputPath: output,
    runAgentImpl: runAgentImpl ?? (() => runs[runIndex++]),
    executableIdentityImpl: () => ({
      command: "claude",
      resolvedPath: "/fake/claude",
      realPath: "/fake/claude",
      sha256: SHA256,
      version: "test"
    }),
    probeIdentityImpl: probeIdentityImpl ?? (async () => identityRecord()),
    docsReadinessImpl: docsReadinessImpl ?? (async () => ({
      schema: "repository-recovery-docs-readiness-v1",
      ready: true,
      requiredOperations: [],
      response: null,
      failures: []
    })),
    suiteLintImpl: () => [],
    pinnedRevisionImpl: () => REVISION,
    gitWorktreeIdentityImpl: () => ({ cwd: "/runner", revision: REVISION, dirty: false }),
    sourceIdentityImpl: () => sourceIdentity(),
    sourceIdentityGuardImpl: () => ({ matches: true }),
    agentEnvironmentIdentityImpl: () => ({ schema: "test-environment" }),
    environment
  };
}

function stored(output) {
  return JSON.parse(readFileSync(output, "utf8"));
}

describe("repository-recovery collector stop contract", () => {
  it("changes the implementation identity when cli-args.mjs changes", () => {
    const cliArgsPath = path.resolve("eval/repo-recovery/cli-args.mjs");
    const original = readFileSync(cliArgsPath, "utf8");
    const before = implementationIdentity();
    try {
      writeFileSync(cliArgsPath, `${original}\n`);
      const after = implementationIdentity();
      expect(before.files).toContain("cli-args.mjs");
      expect(after.sha256).not.toBe(before.sha256);
    } finally {
      writeFileSync(cliArgsPath, original);
    }
  });

  it("checks every distinct positive Stellar Docs initial operation through Raven without credentials", async () => {
    const suite = {
      cases: [
        {
          id: "collector-case-sdk",
          class: "positive",
          question: "SDK readiness query",
          initialEvidence: { id: "stellarDocs.search_sdk_cli_tools_docs" }
        },
        {
          id: "collector-case-contract",
          class: "positive",
          question: "Contract readiness query",
          initialEvidence: { id: "stellarDocs.search_soroban_contract_docs" }
        },
        {
          id: "collector-case-horizon",
          class: "positive",
          question: "Horizon readiness query",
          initialEvidence: { id: "stellarDocs.search_rpc_horizon_data_docs" }
        }
      ]
    };
    const ids = suite.cases.map((entry) => entry.initialEvidence.id);
    let request;
    const readiness = await checkStellarDocsReadiness({
      suite,
      port: 8788,
      fetchImpl: async (_url, init) => {
        request = init;
        return {
          ok: true,
          text: async () => JSON.stringify({
            jsonrpc: "2.0",
            id: 3,
            result: {
              isError: false,
              content: [{ type: "text", text: JSON.stringify({
                unavailable: [],
                operations: ids.map((id) => ({ id, ok: true }))
              }) }]
            }
          })
        };
      }
    });
    const call = JSON.parse(request.body);
    expect(call.params).toMatchObject({ name: "execute" });
    for (const id of ids) {
      expect(call.params.arguments.code).toContain(`stellarDocs.${id.slice("stellarDocs.".length)}(`);
    }
    expect(request.headers).not.toHaveProperty("authorization");
    expect(readiness).toMatchObject({ ready: true, requiredOperations: [{ id: ids[0] }, { id: ids[1] }, { id: ids[2] }] });
    expect(readiness.operations).toEqual(ids.map((id) => ({ id, ok: true, errorKind: null })));
  });

  it("rejects an unavailable required Stellar Docs operation", async () => {
    const suite = {
      cases: [{
        id: "collector-case-sdk",
        class: "positive",
        question: "SDK readiness query",
        initialEvidence: { id: "stellarDocs.search_sdk_cli_tools_docs" }
      }]
    };
    const readiness = await checkStellarDocsReadiness({
      suite,
      port: 8788,
      fetchImpl: async () => ({
        ok: true,
        text: async () => JSON.stringify({
          jsonrpc: "2.0",
          id: 3,
          result: {
            isError: false,
            content: [{ type: "text", text: JSON.stringify({
              unavailable: ["stellarDocs.search_sdk_cli_tools_docs"],
              operations: []
            }) }]
          }
        })
      })
    });
    expect(readiness).toMatchObject({
      ready: false,
      failures: [{ id: "stellarDocs.search_sdk_cli_tools_docs", reason: "unavailable-operation" }]
    });
  });

  it("rejects a Stellar Docs error kind and records its redacted classification", async () => {
    const id = "stellarDocs.search_sdk_cli_tools_docs";
    const readiness = await checkStellarDocsReadiness({
      suite: {
        cases: [{
          id: "collector-case-sdk",
          class: "positive",
          question: "SDK readiness query",
          initialEvidence: { id }
        }]
      },
      port: 8788,
      fetchImpl: async () => ({
        ok: true,
        text: async () => JSON.stringify({
          jsonrpc: "2.0",
          id: 3,
          result: {
            isError: false,
            content: [{ type: "text", text: JSON.stringify({
              unavailable: [],
              operations: [{ id, ok: false, errorKind: "error", errorStatus: 503 }]
            }) }]
          }
        })
      })
    });
    expect(readiness).toMatchObject({
      ready: false,
      operations: [{ id, ok: false, errorKind: "error", errorStatus: 503 }],
      failures: [{ id, reason: "service-error", errorKind: "error", errorStatus: 503 }]
    });
    expect(JSON.stringify(readiness)).not.toContain("message");
  });

  it("treats a Stellar Docs soft-empty kind as ready", async () => {
    const id = "stellarDocs.search_sdk_cli_tools_docs";
    const readiness = await checkStellarDocsReadiness({
      suite: {
        cases: [{
          id: "collector-case-sdk",
          class: "positive",
          question: "SDK readiness query",
          initialEvidence: { id }
        }]
      },
      port: 8788,
      fetchImpl: async () => ({
        ok: true,
        text: async () => JSON.stringify({
          jsonrpc: "2.0",
          id: 3,
          result: {
            isError: false,
            content: [{ type: "text", text: JSON.stringify({
              unavailable: [],
              operations: [{ id, ok: false, errorKind: "soft-empty", errorStatus: 200 }]
            }) }]
          }
        })
      })
    });
    expect(readiness).toMatchObject({
      ready: true,
      operations: [{ id, ok: false, errorKind: "soft-empty", errorStatus: 200 }],
      failures: []
    });
  });

  it("uses the exact three-operation plan and serializable field reads from the frozen suite", async () => {
    const suite = loadSuite();
    const required = [
      ["stellarDocs.search_sdk_cli_tools_docs", "Which duration values do the Go SDK horizonclient trade-resolution variables contain?"],
      ["stellarDocs.search_soroban_contract_docs", "Which value does soroban-env-host assign to DEFAULT_HOST_DEPTH_LIMIT?"],
      ["stellarDocs.search_rpc_horizon_data_docs", "Which Horizon ingestion constant pins the highest supported protocol version, and what is its value?"]
    ];
    let code = "";
    const readiness = await checkStellarDocsReadiness({
      suite,
      port: 8788,
      fetchImpl: async (_url, init) => {
        code = JSON.parse(init.body).params.arguments.code;
        return {
          ok: true,
          text: async () => JSON.stringify({
            jsonrpc: "2.0",
            id: 3,
            result: {
              isError: false,
              content: [{ type: "text", text: JSON.stringify({
                unavailable: [],
                operations: required.map(([id]) => ({ id, ok: true, errorKind: null }))
              }) }]
            }
          })
        };
      }
    });
    expect(readiness.ready).toBe(true);
    expect(readiness.requiredOperations.map((entry) => entry.id)).toEqual(required.map(([id]) => id));
    for (const [id, query] of required) {
      const args = JSON.stringify({ query, hitsPerPage: 1, includeContent: false });
      expect(code).toContain(`stellarDocs.${id.slice("stellarDocs.".length)}(${args})`);
    }
    expect(code).toContain(".ok === true");
    expect(code).toContain("errorKind:");
    expect(code).toMatch(/error\d+\?\.kind/);
    expect(code).toContain("errorStatus:");
    expect(code).toMatch(/error\d+\?\.status/);
  });

  it("records a non-serializable readiness envelope as a tool error", async () => {
    const id = "stellarDocs.search_sdk_cli_tools_docs";
    const readiness = await checkStellarDocsReadiness({
      suite: {
        cases: [{
          id: "collector-case-sdk",
          class: "positive",
          question: "SDK readiness query",
          initialEvidence: { id }
        }]
      },
      port: 8788,
      fetchImpl: async () => {
        const result = {
          isError: true,
          content: [{
            type: "text",
            text: "Execution failed: Could not serialize object of type \"Object\". This type does not support serialization."
          }]
        };
        return { ok: true, text: async () => JSON.stringify({ jsonrpc: "2.0", id: 3, result }) };
      }
    });
    expect(readiness).toMatchObject({
      ready: false,
      failures: [{ id: null, reason: "tool-error" }]
    });
  });

  it("uses one byte-identical retry only for a transport failure", async () => {
    const output = outputPath();
    const artifact = await collectRepositoryRecovery(collectorOptions({
      suite: suiteWith(1),
      runs: [
        answerRun({ failure: { class: "transport", retryable: true, reason: "connection reset" }, answer: "" }),
        answerRun()
      ],
      output
    }));
    expect(artifact.meta.comparable).toBe(true);
    expect(artifact.meta.paidCalls.attempted).toBe(2);
    expect(artifact.rows[0].retryCount).toBe(1);
    expect(artifact.rows[0].attempts.answer).toHaveLength(2);
  });

  it("preserves both attempts and stops when a retry changes the prompt", async () => {
    const output = outputPath();
    await expect(collectRepositoryRecovery(collectorOptions({
      suite: suiteWith(1),
      runs: [
        answerRun({ failure: { class: "transport", retryable: true, reason: "connection reset" }, answer: "" }),
        answerRun({ inputSha256: "f".repeat(64) })
      ],
      output
    }))).rejects.toThrow(/retry changed the answering prompt/);
    const artifact = stored(output);
    expect(artifact.rows[0].attempts.answer).toHaveLength(2);
    expect(artifact.rows[0].collectionStop.message).toMatch(/retry changed/);
  });

  it("does not retry a terminal answering failure", async () => {
    const output = outputPath();
    const artifact = await collectRepositoryRecovery(collectorOptions({
      suite: suiteWith(1),
      runs: [answerRun({ failure: { class: "agent", retryable: false, reason: "terminal" }, answer: "" })],
      output
    }));
    expect(artifact.meta.paidCalls.attempted).toBe(1);
    expect(artifact.rows[0].retryCount).toBe(0);
    expect(artifact.rows[0].agent.failure.class).toBe("agent");
  });

  it("preserves the paid transcript when Raven disconnects", async () => {
    const output = outputPath();
    await expect(collectRepositoryRecovery(collectorOptions({
      suite: suiteWith(2),
      runs: [answerRun({
        failure: {
          class: "protocol",
          retryable: false,
          reason: "required MCP server raven disconnected"
        },
        answer: ""
      })],
      output
    }))).rejects.toMatchObject({ code: "raven-disconnected" });
    const artifact = stored(output);
    expect(artifact.meta.comparable).toBe(false);
    expect(artifact.rows[0].attempts.answer).toHaveLength(1);
    expect(artifact.rows[0].transcript[0].result).toBe("stored tool result");
    expect(artifact.rows[0].collectionStop.code).toBe("raven-disconnected");
  });

  it("preserves a paid attempt with a missing reported cost", async () => {
    const output = outputPath();
    await expect(collectRepositoryRecovery(collectorOptions({
      suite: suiteWith(1),
      runs: [answerRun({ costUsd: null })],
      output
    }))).rejects.toMatchObject({ code: "missing-reported-cost" });
    const artifact = stored(output);
    expect(artifact.rows[0].attempts.answer).toHaveLength(1);
    expect(artifact.meta.budget.missingCosts).toBe(1);

    const exceededOutput = outputPath();
    await expect(collectRepositoryRecovery(collectorOptions({
      suite: suiteWith(1),
      runs: [answerRun({ costUsd: 30.1 })],
      output: exceededOutput
    }))).rejects.toMatchObject({ code: "budget-cost" });
    expect(stored(exceededOutput).rows[0].attempts.answer).toHaveLength(1);
  });

  it("stops before a second call at the call or budget cap", async () => {
    const callOutput = outputPath();
    await expect(collectRepositoryRecovery(collectorOptions({
      suite: suiteWith(2),
      runs: [answerRun()],
      output: callOutput,
      maxPaidCalls: 1
    }))).rejects.toMatchObject({ code: "call-cap" });
    expect(stored(callOutput).meta.paidCalls).toMatchObject({ attempted: 1, remaining: 0 });

    const budgetOutput = outputPath();
    await expect(collectRepositoryRecovery(collectorOptions({
      suite: suiteWith(2),
      runs: [answerRun({ costUsd: 30 })],
      output: budgetOutput
    }))).rejects.toMatchObject({ code: "budget-exhausted" });
    expect(stored(budgetOutput).meta.budget).toMatchObject({ expectedCalls: 1, remainingUsd: 0 });
  });

  it("stops a transport retry before its second paid call when either cap is exhausted", async () => {
    const retryFailure = answerRun({
      failure: { class: "transport", retryable: true, reason: "connection reset" },
      answer: ""
    });
    const callOutput = outputPath();
    await expect(collectRepositoryRecovery(collectorOptions({
      suite: suiteWith(1),
      runs: [retryFailure],
      output: callOutput,
      maxPaidCalls: 1
    }))).rejects.toMatchObject({ code: "call-cap" });
    expect(stored(callOutput).rows[0].attempts.answer).toHaveLength(1);

    const budgetOutput = outputPath();
    const budgetRetryFailure = answerRun({
      failure: { class: "transport", retryable: true, reason: "connection reset" },
      answer: "",
      costUsd: 30
    });
    await expect(collectRepositoryRecovery(collectorOptions({
      suite: suiteWith(1),
      runs: [budgetRetryFailure],
      output: budgetOutput
    }))).rejects.toMatchObject({ code: "budget-exhausted" });
    expect(stored(budgetOutput).rows[0].attempts.answer).toHaveLength(1);
  });

  it("records a failing identity observation and preserves the paid row", async () => {
    const output = outputPath();
    let probes = 0;
    const probeIdentityImpl = async () => {
      probes += 1;
      if (probes === 2) {
        const error = new Error("surface identity changed");
        error.identityObservation = {
          live: { metrics: { surfaceSha256: "f".repeat(64) }, serverInfo: { sourceRevision: REVISION } },
          processIdentity: identityRecord().processIdentity
        };
        throw error;
      }
      return identityRecord();
    };
    await expect(collectRepositoryRecovery(collectorOptions({
      suite: suiteWith(1),
      runs: [answerRun()],
      output,
      probeIdentityImpl
    }))).rejects.toThrow(/surface identity changed/);
    const artifact = stored(output);
    expect(artifact.rows[0].attempts.answer).toHaveLength(1);
    expect(artifact.meta.identityFailure.surface.surfaceSha256).toBe("f".repeat(64));
  });

  it("stops before the first paid call when a required Stellar Docs operation is not ready", async () => {
    const output = outputPath();
    let paidCalls = 0;
    await expect(collectRepositoryRecovery(collectorOptions({
      suite: {
        contract: "repository-tooling-recovery-v2",
        cases: [{
          id: "collector-case-1",
          class: "positive",
          question: "Which test query verifies the Docs operation?",
          initialEvidence: { id: "stellarDocs.search_sdk_cli_tools_docs" }
        }]
      },
      runs: [],
      output,
      docsReadinessImpl: async () => ({
        schema: "repository-recovery-docs-readiness-v1",
        ready: false,
        requiredOperations: [{
          id: "stellarDocs.search_sdk_cli_tools_docs",
          args: { query: "Which test query verifies the Docs operation?", hitsPerPage: 1, includeContent: false },
          response: { isError: false, content: [{ type: "text", text: '{"ok":false,"error":{"kind":"error"}}' }] }
        }],
        failures: [{ id: "stellarDocs.search_sdk_cli_tools_docs", reason: "service-error" }]
      }),
      runAgentImpl: () => {
        paidCalls += 1;
        return answerRun();
      }
    }))).rejects.toThrow(/Stellar Docs readiness failed/);
    expect(paidCalls).toBe(0);
    expect(stored(output).meta.docsReadiness).toMatchObject({
      ready: false,
      failures: [{ id: "stellarDocs.search_sdk_cli_tools_docs", reason: "service-error" }]
    });
    expect(stored(output).meta.paidCalls.attempted).toBe(0);
  });

  it("rejects unsafe prompt and isolation settings before a paid call", async () => {
    const promptOutput = outputPath();
    await expect(collectRepositoryRecovery(collectorOptions({
      suite: suiteWith(1),
      runs: [],
      output: promptOutput,
      environment: { QA_AGENT_PROMPT_APPEND: "change the method" }
    }))).rejects.toThrow(/forbids QA_AGENT_PROMPT_APPEND/);
    expect(existsSync(promptOutput)).toBe(false);

    const safeModeOutput = outputPath();
    await expect(collectRepositoryRecovery(collectorOptions({
      suite: suiteWith(1),
      runs: [],
      output: safeModeOutput,
      environment: { CLAUDE_CODE_SAFE_MODE: "true" }
    }))).rejects.toThrow(/SAFE_MODE/);
    expect(existsSync(safeModeOutput)).toBe(false);
  });

  it("refuses an existing raw output before a paid call", async () => {
    const output = outputPath();
    writeFileSync(output, "existing\n");
    await expect(collectRepositoryRecovery(collectorOptions({
      suite: suiteWith(1),
      runs: [],
      output
    }))).rejects.toThrow(/refusing to overwrite/);
    expect(readFileSync(output, "utf8")).toBe("existing\n");
  });

  it("rejects an unreviewed budget before creating a collection artifact", async () => {
    const output = outputPath();
    await expect(collectRepositoryRecovery(collectorOptions({
      suite: suiteWith(1),
      runs: [],
      output,
      maxBudgetUsd: 0.1
    }))).rejects.toThrow(/must equal.*\$30\.00/);
    expect(existsSync(output)).toBe(false);
  });

  it("rejects invalid port and paid-call values", () => {
    expect(() => parsePort("NaN")).toThrow(/decimal digits/);
    expect(() => parsePort("65536")).toThrow(/1 through 65535/);
    expect(parsePort("8788")).toBe(8788);
    expect(() => parseMaxPaidCalls("1.5")).toThrow(/decimal digits/);
  });
});
