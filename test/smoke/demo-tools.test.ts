import { env } from "cloudflare:test";
import { afterEach, describe, expect, it, vi } from "vitest";
import { buildDemoTools } from "../../src/demo/tools";
import { createDemoToolBudget, type DemoToolBudget } from "../../src/demo/budget";
import { prepareDemoStep } from "../../src/demo/steps";
import type { DemoFrame } from "../../src/demo/frames";
import type { ExecuteRunner } from "../../src/executor/run";

type ToolWithExecute = {
  execute: (args: Record<string, unknown>) => Promise<unknown>;
};

afterEach(() => {
  vi.restoreAllMocks();
});

function makeTools(budget?: DemoToolBudget, runExecute?: ExecuteRunner) {
  const frames: DemoFrame[] = [];
  const built = buildDemoTools({
    env: env as unknown as Env,
    emit: (frame) => frames.push(frame),
    budget,
    runExecute
  });
  return {
    frames,
    budgetReport: built.budgetReport,
    search: built.tools.search as ToolWithExecute,
    execute: built.tools.execute as ToolWithExecute
  };
}

describe("demo tools at the worker boundary", () => {
  it("projects exact-ID recovery with the full compacted shape and MCP-compatible telemetry", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    try {
      const { search } = makeTools();
      const baseline = (await search.execute({
        query: "builder directory",
        limit: 5
      })) as { hits: Array<{ id: string }> };
      const result = (await search.execute({
        query: "builder directory",
        limit: 5,
        recoverFrom: ["scout.getBuilders"],
        reason: "empty"
      })) as {
        hits: Array<{ id: string }>;
        total: number;
        truncated: boolean;
        recovery: Array<{
          from: string;
          id: string;
          service: string;
          relation: string;
          reasons: string[];
          lane: string;
          description: string;
          signature?: string;
          outputKeys?: string[];
          outputItemKeys?: Record<string, string[]>;
        }>;
        widerCandidates: unknown[];
        nextSteps: string;
      };

      expect(result.hits).toEqual(baseline.hits);
      expect(Object.keys(result).sort()).toEqual([
        "hits",
        "nextSteps",
        "recovery",
        "total",
        "truncated",
        "widerCandidates"
      ]);
      expect(result.recovery.map((candidate) => candidate.id)).toEqual([
        "lumenloop.search_content_semantic",
        "scout.searchResearch"
      ]);
      expect(result.recovery.every((candidate) => candidate.from === "scout.getBuilders")).toBe(
        true
      );

      const semantic = result.recovery[0]!;
      expect(Object.keys(semantic).sort()).toEqual([
        "description",
        "from",
        "id",
        "lane",
        "outputItemKeys",
        "outputKeys",
        "reasons",
        "relation",
        "service",
        "signature"
      ]);
      expect(semantic).toMatchObject({
        from: "scout.getBuilders",
        id: "lumenloop.search_content_semantic",
        service: "lumenloop",
        relation: "broader-semantic",
        reasons: ["empty", "weak", "adjacent", "ambiguous"],
        lane: "directory",
        outputKeys: ["counts", "items", "meta"]
      });
      expect(semantic.outputItemKeys?.items).toEqual([
        "collection",
        "date",
        "dateField",
        "snippet",
        "source",
        "sourceField",
        "title",
        "url"
      ]);
      expect(semantic.description.length).toBeLessThanOrEqual(244);
      expect(semantic.signature?.length).toBeLessThanOrEqual(400);
      expect(semantic.signature?.split("\n").at(-1)).toContain(
        "lumenloop.search_content_semantic"
      );

      const event = logSpy.mock.calls
        .map(([line]) => {
          try {
            return JSON.parse(String(line)) as Record<string, unknown>;
          } catch {
            return null;
          }
        })
        .find((entry) => entry?.evt === "demo-search" && entry.recovery === 2);
      expect(event).toMatchObject({
        recovery: 2,
        recoveryTop: ["lumenloop.search_content_semantic", "scout.searchResearch"]
      });
      expect(event).not.toHaveProperty("query");
    } finally {
      logSpy.mockRestore();
    }
  });

  it("keeps a bare recovery reason inert", async () => {
    const { search } = makeTools();
    const baseline = (await search.execute({ query: "builder directory", limit: 5 })) as {
      hits: Array<{ id: string }>;
      recovery: unknown[];
    };
    const reasonOnly = (await search.execute({
      query: "builder directory",
      limit: 5,
      reason: "empty"
    })) as { hits: Array<{ id: string }>; recovery: unknown[] };

    expect(baseline.recovery).toEqual([]);
    expect(reasonOnly.hits).toEqual(baseline.hits);
    expect(reasonOnly.recovery).toEqual([]);
  });

  it("rejects unknown recoverFrom ids by exact match after spending demo search budget", async () => {
    const { search, budgetReport } = makeTools();
    const result = (await search.execute({
      query: "builder directory",
      recoverFrom: ["scout.getBuilder"]
    })) as {
      hits: unknown[];
      recovery: unknown[];
      widerCandidates: unknown[];
      nextSteps: string;
    };

    expect(result.hits).toEqual([]);
    expect(result.recovery).toEqual([]);
    expect(result.widerCandidates).toEqual([]);
    expect(result.nextSteps).toContain("scout.getBuilder");
    expect(result.nextSteps).toContain("exact-match");
    expect(budgetReport()).toMatchObject({ searchCalls: 1, searchRefusals: 0 });
  });

  it("reports an unknown service before an unknown recovery id", async () => {
    const { search, budgetReport } = makeTools();
    const result = (await search.execute({
      query: "builder directory",
      service: "not-a-service",
      recoverFrom: ["scout.getBuilder"]
    })) as { hits: unknown[]; recovery: unknown[]; nextSteps: string };

    expect(result.hits).toEqual([]);
    expect(result.recovery).toEqual([]);
    expect(result.nextSteps).toContain('Unknown service "not-a-service"');
    expect(result.nextSteps).not.toContain("Unknown recoverFrom");
    expect(budgetReport()).toMatchObject({ searchCalls: 1, unknownServiceSearches: 1 });
  });

  it("projects clipped structural wider candidates without losing ids or output shape", async () => {
    const { search } = makeTools();
    const result = (await search.execute({
      query: "Who is Tyler van der Hoeven?"
    })) as {
      hits: Array<{ id: string }>;
      widerCandidates: Array<{
        id: string;
        description: string;
        signature?: string;
        outputKeys?: string[];
        outputItemKeys?: Record<string, string[]>;
      }>;
      nextSteps: string;
    };
    expect(result.widerCandidates.map((candidate) => candidate.id)).toEqual([
      "scout.searchResearch",
      "lumenloop.search_content_semantic",
      "stellarDocs.search_docs"
    ]);
    const semantic = result.widerCandidates.find(
      (candidate) => candidate.id === "lumenloop.search_content_semantic"
    );
    expect(semantic?.description.length).toBeLessThanOrEqual(244);
    expect(semantic?.signature).toContain(
      "lumenloop.search_content_semantic"
    );
    expect(semantic?.outputKeys).toEqual(["counts", "items", "meta"]);
    expect(semantic?.outputItemKeys?.items).toContain("dateField");
    expect(result.nextSteps).toContain("widerCandidates");
    expect(result.hits.length).toBeGreaterThan(0);
    expect(result.nextSteps).toContain("prefer the leading hit");
  });

  it("leads zero-hit wider-candidate pages with bounded broad recovery", async () => {
    const { search } = makeTools();
    const result = (await search.execute({
      query: "zzzzqqqq zzqqzzqq",
      kind: "operation"
    })) as {
      hits: unknown[];
      widerCandidates: unknown[];
      nextSteps: string;
    };

    expect(result.hits).toEqual([]);
    expect(result.widerCandidates.length).toBeGreaterThan(0);
    expect(result.nextSteps).toContain(
      "No gated operation matched either; run one bounded broad pass over the advisory widerCandidates before retrying, and still do not conclude absence."
    );
    expect(result.nextSteps).not.toContain("prefer the leading hit");
  });

  it("records truncated-search turn count and the shared bounded event fields", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    try {
      const { search, budgetReport } = makeTools();
      const result = (await search.execute({ query: "stellar", limit: 1 })) as {
        truncated: boolean;
      };
      expect(result.truncated).toBe(true);
      expect(budgetReport().searchTruncatedCalls).toBe(1);
      const event = logSpy.mock.calls
        .map((call) => {
          try {
            return JSON.parse(String(call[0])) as Record<string, unknown>;
          } catch {
            return null;
          }
        })
        .find((candidate) => candidate?.evt === "demo-search");
      expect(event).toMatchObject({
        queryChars: 7,
        requestedLimit: 1,
        effectiveLimit: 1,
        truncated: true,
        hits: 1
      });
      expect(event).not.toHaveProperty("query");
      expect(event).not.toHaveProperty("queryPreview");
      expect(event).not.toHaveProperty("queryHash");
    } finally {
      logSpy.mockRestore();
    }
  });

  it("removes the raw query from demo search-refusal telemetry too", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    try {
      const { search } = makeTools();
      await search.execute({ query: "first" });
      await search.execute({ query: "second" });
      await search.execute({ query: "third" });
      const refusedQuery = "refused sensitive query ".repeat(20);
      const refused = (await search.execute({
        query: refusedQuery,
        limit: 6,
        service: "not-a-service",
        recoverFrom: ["scout.getBuilder"]
      })) as { recovery: unknown[]; nextSteps: string };
      expect(refused.recovery).toEqual([]);
      expect(refused.nextSteps).toContain("Search call limit reached");
      expect(refused.nextSteps).not.toContain("Unknown service");
      expect(refused.nextSteps).not.toContain("Unknown recoverFrom");
      const event = logSpy.mock.calls
        .map((call) => {
          try {
            return JSON.parse(String(call[0])) as Record<string, unknown>;
          } catch {
            return null;
          }
        })
        .find((candidate) => candidate?.evt === "demo-search-refused");

      expect(event).toMatchObject({
        reason: "call-limit",
        queryChars: refusedQuery.length,
        requestedLimit: 6,
        effectiveLimit: null,
        omittedCount: 0,
        gatedHits: 0,
        backfillHits: 0
      });
      expect(event).not.toHaveProperty("query");
      expect(event).not.toHaveProperty("queryPreview");
      expect(event).not.toHaveProperty("queryHash");
      expect(JSON.stringify(event)).not.toContain(refusedQuery);
    } finally {
      logSpy.mockRestore();
    }
  });

  it("spends search budget on invalid service filters but allows bounded recovery searches", async () => {
    const { search, budgetReport } = makeTools();

    const invalid = (await search.execute({
      query: "search directory",
      service: "not-a-service"
    })) as { hits: unknown[]; nextSteps: string };
    expect(invalid.hits).toEqual([]);
    expect(invalid.nextSteps).toContain("Unknown service");
    expect(budgetReport()).toMatchObject({ searchCalls: 1, unknownServiceSearches: 1 });

    const recovery = (await search.execute({ query: "search directory" })) as { hits: unknown[]; nextSteps: string };
    expect(recovery.nextSteps).toContain("1 remain");
    expect(recovery.nextSteps).toContain("Navigation only");
    expect(recovery.nextSteps).toContain("not factual evidence");
    expect(recovery.nextSteps).toContain("`codemode.search`");
    expect(recovery.nextSteps).toContain("`soft-empty` is inconclusive");
    expect(recovery.nextSteps).toContain("Scores share one scale");
    expect(recovery.nextSteps).toContain(">=1.6x");
    expect(recovery.nextSteps).toContain("hit order is authoritative");
    expect(recovery.nextSteps).not.toMatch(/only within the same .*tier/i);
    expect(budgetReport()).toMatchObject({ searchCalls: 2, unknownServiceSearches: 1 });

    const finalAllowed = (await search.execute({ query: "search directory" })) as { hits: unknown[]; nextSteps: string };
    expect(finalAllowed.nextSteps).toContain("No search calls remain");
    expect(budgetReport()).toMatchObject({ searchCalls: 3, searchRefusals: 0 });

    const refused = (await search.execute({ query: "search directory" })) as { hits: unknown[]; nextSteps: string };
    expect(refused.hits).toEqual([]);
    expect(refused.nextSteps).toContain("Search call limit reached");
    expect(budgetReport()).toMatchObject({ searchCalls: 3, searchRefusals: 1, unknownServiceSearches: 1 });
  });

  it("shares the turn budget across buildDemoTools calls", async () => {
    const budget = createDemoToolBudget();
    const first = makeTools(budget);
    const second = makeTools(budget);

    await first.search.execute({ query: "search directory" });

    expect(first.budgetReport().searchCalls).toBe(1);

    const allowed = (await second.search.execute({ query: "search directory" })) as { hits: unknown[]; nextSteps: string };
    expect(allowed.nextSteps).toContain("1 remain");
    expect(second.budgetReport()).toMatchObject({ searchCalls: 2 });

    const finalAllowed = (await second.search.execute({ query: "search directory" })) as { hits: unknown[]; nextSteps: string };
    expect(finalAllowed.nextSteps).toContain("No search calls remain");
    expect(second.budgetReport()).toMatchObject({ searchCalls: 3 });

    const refused = (await second.search.execute({ query: "search directory" })) as { hits: unknown[]; nextSteps: string };
    expect(refused.hits).toEqual([]);
    expect(refused.nextSteps).toContain("Search call limit reached");
    expect(second.budgetReport()).toMatchObject({ searchCalls: 3, searchRefusals: 1 });
  });

  it("shares aggregate summaries and replaces the latest summary across fallback tools", async () => {
    const budget = createDemoToolBudget();
    const first = makeTools(budget, async () => ({
      ok: true,
      result: "first",
      truncated: false,
      logs: [],
      operationSummary: { total: 2, ok: 1, error: 0, softEmpty: 1 },
      evidenceSummary: {
        kind: "service-data",
        skillRead: false,
        buildAuthoritySkillIds: [],
        buildAuthorityRoles: [],
        skillRuns: 0,
        artifactReads: 0
      }
    }));
    const second = makeTools(budget, async () => ({
      ok: true,
      result: "second",
      truncated: false,
      logs: [],
      operationSummary: { total: 1, ok: 0, error: 1, softEmpty: 0 },
      evidenceSummary: {
        kind: "service-inconclusive",
        skillRead: false,
        buildAuthoritySkillIds: [],
        buildAuthorityRoles: [],
        skillRuns: 0,
        artifactReads: 0
      }
    }));

    await first.execute.execute({ code: "async () => 'first'" });
    expect(first.budgetReport()).toMatchObject({
      operations: { total: 2, ok: 1, error: 0, softEmpty: 1 },
      latestOperations: { total: 2, ok: 1, error: 0, softEmpty: 1 }
    });

    await second.execute.execute({ code: "async () => 'second'" });
    expect(second.budgetReport()).toMatchObject({
      executeCalls: 2,
      operations: { total: 3, ok: 1, error: 1, softEmpty: 1 },
      latestOperations: { total: 1, ok: 0, error: 1, softEmpty: 0 }
    });
    expect(budget.operations).not.toBe(budget.latestOperations);
    expect(prepareDemoStep({ steps: [], stepNumber: 2, budget })?.system).toContain(
      "returned only errors"
    );
  });

  it("clips long signatures without amputating the final callable line", async () => {
    const { search } = makeTools();
    const result = (await search.execute({
      query: "stellar ecosystem digest",
      kind: "skill",
      limit: 6
    })) as { hits: Array<{ id: string; signature?: string }> };
    const digest = result.hits.find((hit) => hit.id === "skills.lumenloop.stellar-ecosystem-digest");
    expect(digest?.signature).toBeTruthy();
    const signature = digest!.signature!;
    expect(signature).toContain("… [middle clipped for the demo]");
    expect(signature).toContain('codemode.skill.run("skills.lumenloop.stellar-ecosystem-digest"');
    expect(signature.split("\n").at(-1)).toContain('codemode.skill.run("skills.lumenloop.stellar-ecosystem-digest"');
  });

  it("keeps canonical operation payload keys visible when demo signatures are clipped", async () => {
    const { search } = makeTools();
    const result = (await search.execute({
      query: "lumenloop.search_content_semantic",
      kind: "operation",
      limit: 5
    })) as {
      hits: Array<{
        id: string;
        signature?: string;
        outputKeys?: string[];
        outputItemKeys?: Record<string, string[]>;
      }>;
    };
    const semantic = result.hits.find((hit) => hit.id === "lumenloop.search_content_semantic");
    expect(semantic?.signature).toContain("[middle clipped for the demo]");
    expect(semantic?.outputKeys).toEqual(["counts", "items", "meta"]);
    expect(semantic?.outputItemKeys?.items).toContain("dateField");
  });

  it("enables the main MCP's in-execute codemode discovery path", async () => {
    const { execute, budgetReport } = makeTools();
    const result = (await execute.execute({
      code: `async () => {
        const [search, described, catalog, spec] = await Promise.all([
          codemode.search("search directory"),
          codemode.describe("scout.searchProjects"),
          codemode.catalog(),
          codemode.spec()
        ]);
        return {
          searchOk: search.ok,
          described: described.id,
          catalogEntries: catalog.entries.length,
          specTitle: spec.info.title
        };
      }`
    })) as string;

    expect(result).toContain('"searchOk":true');
    expect(result).toContain('"described":"scout.searchProjects"');
    expect(result).toContain('"catalogEntries":');
    expect(result).toContain('"specTitle":');
    expect(result).toContain("--- host evidence summary ---");
    expect(result).toContain("evidence: none");
    expect(budgetReport()).toMatchObject({
      executeCalls: 1,
      executeFailures: 0,
      latestExecuteEvidence: "none"
    });

    const retry = (await execute.execute({
      code: `async () => {
        return "retry";
      }`
    })) as string;
    expect(retry).toContain("retry");
    expect(budgetReport()).toMatchObject({ executeCalls: 2, executeFailures: 0 });

    const third = (await execute.execute({
      code: `async () => {
        return "third";
      }`
    })) as string;
    expect(third).toContain("third");
    expect(budgetReport()).toMatchObject({ executeCalls: 3, executeFailures: 0 });

    const refused = (await execute.execute({ code: `async () => "fourth"` })) as { ok: false; error: string };
    expect(refused.error).toContain("execute call limit reached");
    expect(budgetReport()).toMatchObject({ executeCalls: 3, executeFailures: 0, executeRefusals: 1 });
  });

  it("returns zero summaries when the demo runner throws", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    try {
      const { execute, budgetReport } = makeTools(undefined, async () => {
        throw new Error("demo-runner-boom");
      });
      const result = (await execute.execute({ code: "async () => 1" })) as string;

      expect(result).toContain("Execution failed: demo-runner-boom");
      expect(result).toContain("evidence: none");
      expect(result).toContain("service operations: total=0 ok=0 error=0 soft-empty=0");
      expect(result).toContain("artifact reads: 0");
      expect(budgetReport()).toMatchObject({
        executeCalls: 1,
        executeFailures: 1,
        operations: { total: 0, ok: 0, error: 0, softEmpty: 0 },
        latestOperations: { total: 0, ok: 0, error: 0, softEmpty: 0 },
        latestExecuteEvidence: "none"
      });

      const event = logSpy.mock.calls
        .map(([line]) => {
          try {
            return JSON.parse(String(line)) as Record<string, unknown>;
          } catch {
            return null;
          }
        })
        .find((entry) => entry?.evt === "demo-execute");
      expect(event).toMatchObject({
        ok: false,
        artifactReadCount: 0,
        operationSummary: { total: 0, ok: 0, error: 0, softEmpty: 0 },
        evidenceSummary: {
          kind: "none",
          skillRead: false,
          skillRuns: 0,
          artifactReads: 0
        },
        evidenceOutcome: "execute-error"
      });
    } finally {
      logSpy.mockRestore();
    }
  });

  it("refuses object-shaped Promise.all before spending an execute run", async () => {
    const { execute, budgetReport } = makeTools();
    const result = (await execute.execute({
      code: `async () => {
        const calls = await Promise.all({
          projects: scout.searchProjects({ query: "rwa", limit: 2 })
        });
        return calls;
      }`
    })) as { ok: false; error: string };

    expect(result.ok).toBe(false);
    expect(result.error).toContain("Promise.all({ ... })");
    expect(result.error).toContain("requires an array/iterable");
    expect(budgetReport()).toMatchObject({ executeCalls: 0, executeFailures: 0, executeRefusals: 1 });
  });

  it("allows exact-id codemode.describe in demo execute", async () => {
    const { execute, budgetReport } = makeTools();
    const result = (await execute.execute({
      code: `async () => {
        const d = await codemode.describe("scout.searchProjects");
        return { ok: d.ok, id: d.id, hasOutputSchema: !!d.outputSchema, usage: d.usage };
      }`
    })) as string;

    expect(result).toContain("scout.searchProjects");
    expect(result).toContain("hasOutputSchema");
    expect(result).toContain("call it exactly as the signature");
    expect(budgetReport()).toMatchObject({ executeCalls: 1 });
  });

  it("shares candidate guidance with MCP but suppresses it for build-stage prior art", async () => {
    vi.stubGlobal("fetch", async (input: RequestInfo | URL) => {
      const url = new URL(typeof input === "string" || input instanceof URL ? input : input.url);
      if (!url.pathname.endsWith("/api/projects/search")) {
        return Response.json({ error: `unexpected ${url.pathname}` }, { status: 500 });
      }
      return Response.json({
        projects: [{ name: "Example", slug: "example" }],
        meta: { counts: { returned: 1, total: 1 } }
      });
    });

    const budget = createDemoToolBudget();
    const { execute, budgetReport } = makeTools(budget);
    const ordinary = (await execute.execute({
      code: `async () => {
        const projects = await scout.searchProjects({ query: "example", limit: 1 });
        return { ok: projects.ok };
      }`
    })) as string;
    expect(ordinary).toContain("--- CANDIDATE EVIDENCE ---");
    expect(ordinary).toContain("These rows are candidates, not identity or absence proof");
    expect(ordinary).toContain("--- EVIDENCE CHECKPOINT ---");
    expect(budget.recoveryAdviceDelivered).toBe(true);

    const failed = (await execute.execute({
      code: `async () => {
        const documents = await lumenloop.list_documents({ limit: 1 });
        return { documentsOk: documents.ok };
      }`
    })) as string;
    expect(failed).toContain("evidence: service-inconclusive");
    expect(budget.latestRecoveryHint).toBeNull();
    const recoveryStep = prepareDemoStep({ steps: [], stepNumber: 2, budget });
    expect(recoveryStep?.system).toContain("returned only errors");
    expect(recoveryStep?.system).not.toContain("successful narrow, operation-scoped lookup");

    const build = (await execute.execute({
      code: `async () => {
        const [skill, projects] = await Promise.all([
          codemode.skill.read("skills.stellar-dev.smart-contracts", {}),
          scout.searchProjects({ query: "example", limit: 1 })
        ]);
        return { skillOk: skill.ok, projectsOk: projects.ok };
      }`
    })) as string;
    expect(build).not.toContain("--- CANDIDATE EVIDENCE ---");
    expect(build).not.toContain("--- EVIDENCE CHECKPOINT ---");
    expect(budgetReport()).toMatchObject({
      recoveryHintedExecutes: 2,
      recoveryAdviceDelivered: true,
      recoveryAdviceSuppressed: 1
    });
  });

  it("adds a demo-only advisory when execute output is truncated", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const { execute, budgetReport } = makeTools();
    const result = (await execute.execute({
      code: `async () => {
        const failed = await Promise.all(
          Array.from({ length: 10 }, () => lumenloop.search_directory({ limit: 2 }))
        );
        return { failed, padding: "x".repeat(25000) };
      }`
    })) as string;

    expect(result).toContain("--- SOURCE BASIS ---");
    expect(result).not.toContain("--- TRUNCATED ---");
    expect(result).toContain("--- demo advisory ---");
    expect(result).toContain("--- host evidence summary ---");
    expect(result).toContain("evidence: service-inconclusive");
    expect(result).toContain("service operations: total=10 ok=0 error=10 soft-empty=0");
    expect(result).toContain("Answer only from the visible returned fields");
    expect(budgetReport()).toMatchObject({
      executeCalls: 1,
      executeResultTruncated: 1,
      operations: { total: 10, ok: 0, error: 10, softEmpty: 0 },
      latestOperations: { total: 10, ok: 0, error: 10, softEmpty: 0 },
      latestExecuteEvidence: "service-inconclusive"
    });

    const event = logSpy.mock.calls
      .map(([line]) => {
        try {
          return JSON.parse(String(line)) as Record<string, unknown>;
        } catch {
          return null;
        }
      })
      .find((entry) => entry?.evt === "demo-execute");
    expect(event).toMatchObject({
      evt: "demo-execute",
      ok: true,
      evidenceOutcome: "error",
      operationSummary: { total: 10, ok: 0, error: 10, softEmpty: 0 },
      evidenceSummary: {
        kind: "service-inconclusive",
        skillRead: false,
        artifactReads: 0
      },
      sourceBasis: {
        shape: "object",
        calls: {
          total: 10,
          omitted: 2,
          totals: { ok: 0, error: 10, "soft-empty": 0 }
        },
        canonicalUrlCount: 0,
        artifactState: "absent"
      }
    });
    expect(
      (event?.sourceBasis as { calls?: { first?: unknown[] } } | undefined)?.calls?.first
    ).toHaveLength(8);
    expect(event).not.toHaveProperty("code");
    expect(event).not.toHaveProperty("resultPreview");
    expect(event).not.toHaveProperty("error");
    expect(event).toHaveProperty("recoveryAdviceDelivered");
    expect(event).not.toHaveProperty("recoveryAdviceConsumed");
  });
});
