/**
 * Focused tests for the four eval-harness preconditions that a description
 * A/B depends on. Each one exists because the 2026-08-26 connectors item-8
 * round hit its absence (`.agents/rounds/2026-08-26-connectors-contract.md`):
 *
 *  P1  search results were discarded, so hit differences between arms were
 *      unreviewable — and the search query was sliced to 600 chars.
 *  P2  the answering agent read this repository's AGENTS.md in both arms.
 *  P4  a lane that loses rows still prints a clean percentage.
 *  P5  an arm was pinned by a fingerprint computed inside the runner, with no
 *      standalone way to check the bound server BEFORE spending.
 *
 * No test here spawns an agent or spends a token. The seams are pure.
 */
import { createHash } from "node:crypto";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { AGENT_RESULT_SCHEMA, parseAgentResult } from "../eval/qa/agent-result.mjs";
import {
  MAX_PROJECTED_HITS,
  MAX_PROJECTED_NEXT_STEPS_CHARS,
  SEARCH_PROJECTION_SCHEMA,
  makeSearchResultProjector,
  projectSearchResult
} from "../eval/qa/search-projection.mjs";
import { buildAgentSpawn, collectionAggregates } from "../eval/qa/run-qa.mjs";
import { buildDiscoverySpawnOptions } from "../eval/discovery/run-agent-discovery.mjs";
import {
  assertNeutralAgentCwd,
  assertRunPlan,
  formatCompletenessNotice,
  runCompleteness
} from "../eval/lib/harness-guards.mjs";
import {
  MCP_PROTOCOL_VERSION,
  MCP_SURFACE_SCHEMA,
  assertExpectedSurface,
  checkExpectedSurface,
  formatSurfaceReport,
  parseMcpHttpPayload,
  surfaceMetrics
} from "../eval/lib/mcp-surface.mjs";
import { fetchLiveSurface, normalizeServerUrl } from "../eval/report-live-surface.mjs";

const REPO_ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const NEUTRAL_CWD = path.join(os.tmpdir(), "qa-agent-cwd-fixture");
const sha256 = (s) => createHash("sha256").update(s).digest("hex");

const SEARCH_TOOL = "mcp__raven__search";
const LONG_QUERY = `soroban ${"escrow ".repeat(200)}prior art`;

function searchBody({ hitCount = 3, nextSteps = "n".repeat(2500), truncated = true } = {}) {
  return JSON.stringify({
    hits: Array.from({ length: hitCount }, (_, index) => ({
      id: `scout.searchRepos${index}`,
      service: index % 2 === 0 ? "scout" : "stellarDocs",
      kind: "operation",
      tier: index === 0 ? "gated" : "backfill",
      score: 10 - index,
      description: "d".repeat(400),
      describeCall: 'codemode.describe("scout.searchRepos")',
      signature: "s".repeat(800)
    })),
    total: 42,
    truncated,
    recovery: [{ from: "scout.searchRepos", id: "scout.explainRepo", service: "scout" }],
    widerCandidates: [{ id: "lumenloop.search_content_semantic", service: "lumenloop" }],
    nextSteps
  });
}

/** One stream-json transcript: a search call, then an execute call. */
function stream({ query = LONG_QUERY, searchResult = searchBody() } = {}) {
  const lines = [
    {
      type: "assistant",
      message: {
        usage: { input_tokens: 10, output_tokens: 5 },
        content: [
          { type: "tool_use", id: "t1", name: SEARCH_TOOL, input: { query, limit: 10 } },
          { type: "tool_use", id: "t2", name: "mcp__raven__execute", input: { code: "await scout.searchRepos({})" } }
        ]
      }
    },
    {
      type: "user",
      message: {
        content: [
          { type: "tool_result", tool_use_id: "t1", content: [{ type: "text", text: searchResult }] },
          { type: "tool_result", tool_use_id: "t2", content: [{ type: "text", text: '{"ok":true,"data":{"repos":[]}}' }] }
        ]
      }
    },
    { type: "result", subtype: "success", is_error: false, result: "answer", total_cost_usd: 0.1, num_turns: 2 }
  ];
  return lines.map((line) => JSON.stringify(line)).join("\n") + "\n";
}

const parse = (stdout) =>
  parseAgentResult(
    { stdout, stderr: "", status: 0, signal: null },
    {
      keepWholeResult: (tool) => tool.endsWith("execute"),
      keepWholeInput: (tool) => tool.endsWith("execute") || tool === SEARCH_TOOL,
      projectResult: makeSearchResultProjector([SEARCH_TOOL])
    }
  );

describe("P1 — search evidence is retained bounded, not discarded", () => {
  it("keeps the whole search input: the query IS the routing behaviour under test", () => {
    const [search] = parse(stream()).transcript;
    expect(search.tool).toBe(SEARCH_TOOL);
    expect(search.input.length).toBeGreaterThan(600);
    expect(JSON.parse(search.input).query).toBe(LONG_QUERY);
  });

  it("projects the ranking facts and drops the prose body", () => {
    const [search] = parse(stream()).transcript;
    expect(search.result).toBeUndefined();
    expect(search.resultProjection).toMatchObject({
      schema: SEARCH_PROJECTION_SCHEMA,
      parsed: true,
      hitCount: 3,
      total: 42,
      truncated: true,
      widerCandidateIds: ["lumenloop.search_content_semantic"],
      recoveryIds: ["scout.explainRepo"]
    });
    expect(search.resultProjection.hits[0]).toEqual({
      rank: 1,
      id: "scout.searchRepos0",
      service: "scout",
      kind: "operation",
      tier: "gated",
      score: 10
    });
    // Descriptions and signatures never enter the artifact.
    const serialized = JSON.stringify(search.resultProjection);
    expect(serialized).not.toContain("dddd");
    expect(serialized).not.toContain("ssss");
  });

  it("keeps bounded nextSteps text plus its full size and identity", () => {
    const nextSteps = "guidance ".repeat(300);
    const [search] = parse(stream({ searchResult: searchBody({ nextSteps }) })).transcript;
    expect(search.resultProjection.nextStepsChars).toBe(nextSteps.length);
    expect(search.resultProjection.nextStepsSha256).toBe(sha256(nextSteps));
    expect(search.resultProjection.nextStepsExcerpt).toBe(nextSteps);
    expect(search.resultProjection.nextStepsTruncated).toBe(false);

    const longNextSteps = "x".repeat(MAX_PROJECTED_NEXT_STEPS_CHARS + 50);
    const bounded = projectSearchResult(searchBody({ nextSteps: longNextSteps }));
    expect(bounded.nextStepsExcerpt).toHaveLength(MAX_PROJECTED_NEXT_STEPS_CHARS);
    expect(bounded.nextStepsTruncated).toBe(true);
  });

  it("leaves execute results whole so the existing analyzers still parse them", () => {
    const [, execute] = parse(stream()).transcript;
    expect(execute.result).toBe('{"ok":true,"data":{"repos":[]}}');
    expect(execute.resultProjection).toBeUndefined();
  });

  it("keeps the historical behaviour for tools with neither hook", () => {
    const bare = parseAgentResult({ stdout: stream(), stderr: "", status: 0, signal: null });
    const [search] = bare.transcript;
    // Default keepWholeResult is execute-only and there is no projector.
    expect(search.input.length).toBe(600);
    expect(search.result).toBeUndefined();
    expect(search.resultProjection).toBeUndefined();
  });

  it("bounds a large page and keeps the real page length visible", () => {
    const projection = projectSearchResult(searchBody({ hitCount: 50 }));
    expect(projection.hitCount).toBe(50);
    expect(projection.hitsProjected).toBe(MAX_PROJECTED_HITS);
    expect(projection.hits).toHaveLength(MAX_PROJECTED_HITS);
  });

  it("records an unparseable body as unparsed, never as a partial guess", () => {
    const projection = projectSearchResult("not json at all");
    expect(projection).toEqual({
      schema: SEARCH_PROJECTION_SCHEMA,
      parsed: false,
      resultChars: "not json at all".length
    });
  });

  it("unwraps a client that returns the whole MCP envelope", () => {
    const inner = searchBody({ hitCount: 1 });
    const enveloped = JSON.stringify({ result: { content: [{ type: "text", text: inner }] } });
    expect(projectSearchResult(enveloped).parsed).toBe(true);
    const structured = JSON.stringify({ result: { structuredContent: JSON.parse(inner) } });
    expect(projectSearchResult(structured).hits[0].id).toBe("scout.searchRepos0");
  });

  it("projects only the exact tool names the run exposes", () => {
    const projector = makeSearchResultProjector([SEARCH_TOOL]);
    expect(projector("mcp__raven__execute", searchBody())).toBeNull();
    expect(projector(SEARCH_TOOL, searchBody())).not.toBeNull();
    expect(makeSearchResultProjector([])(SEARCH_TOOL, searchBody())).toBeNull();
  });

  it("stamps a new results schema so v1 artifacts cannot be joined to v2 ones", () => {
    // v1 rows carry a sliced query and no hits: not comparable for routing.
    expect(AGENT_RESULT_SCHEMA).toBe("qa-agent-result-v2");
  });
});

describe("P2 — answering agents run in a neutral working directory", () => {
  it("refuses the repository root and any directory inside it", () => {
    expect(() => assertNeutralAgentCwd(REPO_ROOT, { repoRoot: REPO_ROOT })).toThrow(/inside the repository/);
    expect(() => assertNeutralAgentCwd(path.join(REPO_ROOT, "eval"), { repoRoot: REPO_ROOT })).toThrow(
      /AGENTS\.md/
    );
  });

  it("refuses a missing working directory rather than inheriting the runner's", () => {
    expect(() => assertNeutralAgentCwd(undefined, { repoRoot: REPO_ROOT })).toThrow(/neutral working directory/);
    expect(() => assertNeutralAgentCwd("", { repoRoot: REPO_ROOT })).toThrow(/neutral working directory/);
  });

  it("accepts a temporary directory outside the repository", () => {
    expect(assertNeutralAgentCwd(NEUTRAL_CWD, { repoRoot: REPO_ROOT })).toBe(path.resolve(NEUTRAL_CWD));
  });

  it("does not treat a sibling worktree with a shared prefix as inside", () => {
    const sibling = `${REPO_ROOT}-other`;
    expect(assertNeutralAgentCwd(sibling, { repoRoot: REPO_ROOT })).toBe(path.resolve(sibling));
  });

  it("run-qa spawns the answering agent with that cwd", () => {
    const spawn = buildAgentSpawn({
      prompt: "q",
      allowedTools: [SEARCH_TOOL, "mcp__raven__execute"],
      mcpConfigPath: "/tmp/mcp.json",
      model: "claude-sonnet-5",
      cwd: NEUTRAL_CWD
    });
    expect(spawn.command).toBe("claude");
    expect(spawn.options.cwd).toBe(NEUTRAL_CWD);
    expect(spawn.args).toContain("--strict-mcp-config");
    expect(() =>
      buildAgentSpawn({
        prompt: "q",
        allowedTools: [SEARCH_TOOL],
        mcpConfigPath: "/tmp/mcp.json",
        model: "claude-sonnet-5",
        cwd: REPO_ROOT
      })
    ).toThrow(/inside the repository/);
  });

  it("the discovery lane spawns its agent with that cwd too", () => {
    const options = buildDiscoverySpawnOptions({ input: "q", cwd: NEUTRAL_CWD });
    expect(options.cwd).toBe(NEUTRAL_CWD);
    expect(() => buildDiscoverySpawnOptions({ input: "q", cwd: path.join(REPO_ROOT, "eval") })).toThrow(
      /inside the repository/
    );
  });
});

describe("P4 — row counts are asserted before any aggregate", () => {
  const rows = (ids, { judged = true } = {}) =>
    ids.map((id) => ({ id, verdict: judged ? { score: "correct" } : null, agent: { failure: null } }));

  it("counts a complete judged lane as reportable", () => {
    const completeness = runCompleteness({ expectedIds: ["a", "b"], rows: rows(["a", "b"]), judging: true });
    expect(completeness).toMatchObject({
      expectedRows: 2,
      collectedRows: 2,
      judgedRows: 2,
      complete: true,
      aggregatesAllowed: true,
      reasons: []
    });
  });

  it("refuses an aggregate when a row is missing", () => {
    const completeness = runCompleteness({ expectedIds: ["a", "b"], rows: rows(["a"]), judging: true });
    expect(completeness.aggregatesAllowed).toBe(false);
    expect(completeness.missingIds).toEqual(["b"]);
    expect(formatCompletenessNotice(completeness, { label: "run-qa" })).toContain("AGGREGATES SUPPRESSED");
  });

  it("refuses an aggregate when a collected row carries no verdict", () => {
    const mixed = [...rows(["a"]), ...rows(["b"], { judged: false })];
    const completeness = runCompleteness({ expectedIds: ["a", "b"], rows: mixed, judging: true });
    expect(completeness.collectedRows).toBe(2);
    expect(completeness.judgedRows).toBe(1);
    expect(completeness.aggregatesAllowed).toBe(false);
    expect(completeness.reasons.join(" ")).toContain("carry no verdict");
  });

  it("allows a collect-only lane with no verdicts at all", () => {
    const completeness = runCompleteness({
      expectedIds: ["a", "b"],
      rows: rows(["a", "b"], { judged: false }),
      judging: false
    });
    expect(completeness.aggregatesAllowed).toBe(true);
  });

  it("accounts for replicates", () => {
    const twice = [...rows(["a", "b"]), ...rows(["a", "b"])];
    expect(runCompleteness({ expectedIds: ["a", "b"], rows: twice, repeat: 2 }).aggregatesAllowed).toBe(true);
    expect(runCompleteness({ expectedIds: ["a", "b"], rows: rows(["a", "b"]), repeat: 2 })).toMatchObject({
      aggregatesAllowed: false,
      missingIds: ["a", "b"]
    });
  });

  it("reports agent failures and error verdicts as denominator facts", () => {
    const failed = [
      { id: "a", verdict: { score: "correct" }, agent: { failure: null } },
      { id: "b", verdict: { score: "error" }, agent: { failure: { class: "transport" } } }
    ];
    const completeness = runCompleteness({ expectedIds: ["a", "b"], rows: failed, judging: true });
    expect(completeness).toMatchObject({ agentFailureRows: 1, errorVerdictRows: 1, aggregatesAllowed: true });
  });

  it("withholds summary and metrics from an incomplete collection, keeping the rows", () => {
    const cases = [{ id: "a" }, { id: "b" }];
    const incomplete = collectionAggregates(rows(["a"]), cases, { judging: true });
    expect(incomplete.summary).toBeNull();
    expect(incomplete.metrics).toBeNull();
    expect(incomplete.completeness.aggregatesAllowed).toBe(false);

    const complete = collectionAggregates(rows(["a", "b"]), cases, { judging: true });
    expect(complete.summary).not.toBeNull();
    expect(complete.metrics).not.toBeNull();
  });

  it("blocks a duplicated or empty selection before any agent is spawned", () => {
    expect(() => assertRunPlan(["a", "b", "a"], { label: "run-qa" })).toThrow(/duplicate case ids/);
    expect(() => assertRunPlan([], { label: "run-qa" })).toThrow(/no cases selected/);
    expect(assertRunPlan(["a", "b"])).toEqual({ caseCount: 2 });
  });
});

describe("P5 — the live surface fingerprint is one definition", () => {
  const tools = [
    { name: "search", description: "ranked search", inputSchema: { type: "object" }, outputSchema: { type: "object" } },
    { name: "execute", description: "sandboxed js", inputSchema: { type: "object" } }
  ];
  const instructions = "gateway instructions";

  it("keeps surfaceSha256 on its frozen input so older fingerprints still compare", () => {
    const metrics = surfaceMetrics(tools, instructions);
    expect(metrics.surfaceSha256).toBe(sha256(`${instructions}\n${JSON.stringify({ tools })}`));
    expect(metrics.schema).toBe(MCP_SURFACE_SCHEMA);
  });

  it("requires a matching live surface pin before collection", () => {
    const metrics = surfaceMetrics(tools, instructions);
    expect(assertExpectedSurface(metrics, metrics.surfaceSha256).matches).toBe(true);
    expect(() => assertExpectedSurface(metrics, null)).toThrow(/--expect-sha256 is required/);
    expect(() => assertExpectedSurface(metrics, "f".repeat(64))).toThrow(/refusing collection/);
  });

  it("counts the surface the way the arm pins record it", () => {
    const metrics = surfaceMetrics(tools, instructions);
    expect(metrics.toolCount).toBe(2);
    expect(metrics.descriptionsChars).toBe("ranked search".length + "sandboxed js".length);
    expect(metrics.instructionsChars).toBe(instructions.length);
    expect(metrics.instructionsSha256).toBe(sha256(instructions));
    expect(metrics.advertisedWireChars).toBe(metrics.serializedToolsChars + metrics.instructionsChars);
    expect(metrics.perTool.map((tool) => tool.name)).toEqual(["search", "execute"]);
    expect(metrics.perTool[0].descriptionChars).toBe("ranked search".length);
  });

  it("treats absent instructions as empty without changing the hash rule", () => {
    expect(surfaceMetrics(tools, undefined).surfaceSha256).toBe(sha256(`\n${JSON.stringify({ tools })}`));
  });

  it("says report-only in the printed report", () => {
    const report = formatSurfaceReport(surfaceMetrics(tools, instructions), { label: "arm A" });
    expect(report).toContain("arm A");
    expect(report).toContain("Report only — no size threshold is a gate");
  });

  it("checks an arm pin without throwing on its own", () => {
    const metrics = surfaceMetrics(tools, instructions);
    expect(checkExpectedSurface(metrics, metrics.surfaceSha256.toUpperCase())).toMatchObject({
      checked: true,
      matches: true
    });
    expect(checkExpectedSurface(metrics, "deadbeef")).toMatchObject({ checked: true, matches: false });
    expect(checkExpectedSurface(metrics, undefined)).toMatchObject({ checked: false, matches: null });
  });

  it("parses both plain JSON and SSE framing from a Streamable HTTP server", () => {
    expect(parseMcpHttpPayload('{"jsonrpc":"2.0","id":1,"result":{}}').id).toBe(1);
    expect(parseMcpHttpPayload('event: message\ndata: {"jsonrpc":"2.0","id":2,"result":{}}\n\n').id).toBe(2);
  });

  it("fingerprints a bound server over the wire with the same numbers", async () => {
    const responses = [
      { result: { protocolVersion: MCP_PROTOCOL_VERSION, serverInfo: { name: "raven" }, instructions } },
      { result: { tools } }
    ];
    const seen = [];
    const fetchImpl = async (url, init) => {
      seen.push(JSON.parse(init.body).method);
      return { ok: true, text: async () => JSON.stringify({ jsonrpc: "2.0", ...responses.shift() }) };
    };
    const surface = await fetchLiveSurface("http://localhost:8788/mcp", { fetchImpl });
    expect(seen).toEqual(["initialize", "tools/list"]);
    expect(surface.toolNames).toEqual(["search", "execute"]);
    expect(surface.metrics.surfaceSha256).toBe(surfaceMetrics(tools, instructions).surfaceSha256);
  });

  it("refuses a server that advertises no tools instead of fingerprinting nothing", async () => {
    const fetchImpl = async () => ({
      ok: true,
      text: async () => JSON.stringify({ jsonrpc: "2.0", result: { tools: [] } })
    });
    await expect(fetchLiveSurface("http://localhost:8788/mcp", { fetchImpl })).rejects.toThrow(
      /advertised no tools/
    );
  });

  it("normalizes a bare origin to the MCP path", () => {
    expect(normalizeServerUrl("http://localhost:8788")).toBe("http://localhost:8788/mcp");
    expect(normalizeServerUrl("http://localhost:8788/mcp")).toBe("http://localhost:8788/mcp");
  });
});
