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
 * No test here reaches a provider or spends a token. The CLI process tests
 * use a local fake Claude executable.
 */
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { chmodSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { AGENT_RESULT_SCHEMA, parseAgentResult } from "../eval/qa/agent-result.mjs";
import { buildJudgeArgs } from "../eval/qa/judge.mjs";
import {
  MAX_PROJECTED_HITS,
  MAX_PROJECTED_NEXT_STEPS_CHARS,
  SEARCH_PROJECTION_SCHEMA,
  makeSearchResultProjector,
  projectSearchResult
} from "../eval/qa/search-projection.mjs";
import {
  assertRunQaCliSyntax,
  buildAgentSpawn,
  collectionAggregates,
  parseOptionalIdsFlag,
  parseRuntimeAdapterFlags,
  probeLiveSurface
} from "../eval/qa/run-qa.mjs";
import {
  buildDiscoveryAgentArgs,
  buildDiscoverySpawnOptions,
  gradeAgentRow
} from "../eval/discovery/run-agent-discovery.mjs";
import {
  REQUIRED_MCP_SERVER_NAME,
  answeringAgentIsolationArgs,
  answeringAgentIsolationRecord,
  assertFailClosedCliSyntax,
  assertNeutralAgentCwd,
  assertRunPlan,
  formatCompletenessNotice,
  runCompleteness
} from "../eval/lib/harness-guards.mjs";
import {
  MCP_PROTOCOL_VERSION,
  MCP_SURFACE_SCHEMA,
  assertExpectedSourceRevision,
  assertExpectedSurface,
  checkExpectedSourceRevision,
  checkExpectedSurface,
  formatSurfaceReport,
  parseMcpHttpPayload,
  surfaceMetrics
} from "../eval/lib/mcp-surface.mjs";
import {
  agentEnvironmentIdentity,
  assertExpectedAgentEnvironment,
  assertExpectedExecutable,
  executableIdentity,
  resolveExecutable
} from "../eval/lib/executable-identity.mjs";
import {
  assertStableGitWorktreeIdentity,
  assertStableBoundServerIdentity,
  boundServerIdentity,
  gitWorktreeIdentity
} from "../eval/lib/bound-server-identity.mjs";
import { fetchLiveSurface, normalizeServerUrl } from "../eval/report-live-surface.mjs";
import { PACK_VERSION } from "../eval/qa/evidence-pack.mjs";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RUN_QA_PATH = path.join(REPO_ROOT, "eval", "qa", "run-qa.mjs");
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

  it("stamps v4 so artifacts cannot claim impossible safe-mode MCP isolation", () => {
    expect(AGENT_RESULT_SCHEMA).toBe("qa-agent-result-v4");
  });
});

describe("P2 — answering agents run in a neutral working directory", () => {
  it("uses one required MCP server name across paid lanes", () => {
    expect(REQUIRED_MCP_SERVER_NAME).toBe("raven");
  });

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
    expect(spawn.args).not.toContain("--safe-mode");
    expect(spawn.args).toContain("--disable-slash-commands");
    const settingSources = spawn.args.indexOf("--setting-sources");
    expect(spawn.args.slice(settingSources, settingSources + 2)).toEqual(["--setting-sources", ""]);
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

  it("uses the same settings-free isolation in the discovery lane", () => {
    const args = buildDiscoveryAgentArgs({
      mcpConfigPath: "/tmp/mcp.json",
      model: "claude-sonnet-5",
      effort: "medium",
      maxBudgetUsd: 1,
      environment: {}
    });
    expect(args).not.toContain("--safe-mode");
    expect(args).toContain("--strict-mcp-config");
    expect(args).toContain("--disable-slash-commands");
    const settingSources = args.indexOf("--setting-sources");
    expect(args.slice(settingSources, settingSources + 2)).toEqual(["--setting-sources", ""]);
    expect(answeringAgentIsolationRecord()).toEqual({
      settingSources: [],
      slashCommandsDisabled: true,
      strictMcpConfig: true,
      safeMode: false
    });
  });

  it("refuses inherited Claude safe mode before an answering spawn", () => {
    for (const value of ["1", "true", "yes", "on"]) {
      expect(() => answeringAgentIsolationArgs({ CLAUDE_CODE_SAFE_MODE: value })).toThrow(
        /disables explicit MCP servers/
      );
    }

    for (const value of ["0", "false", "no", "off"]) {
      expect(answeringAgentIsolationArgs({ CLAUDE_CODE_SAFE_MODE: value })).toEqual([
        "--setting-sources",
        "",
        "--disable-slash-commands"
      ]);
    }
  });

  it("keeps the MCP-free judge in safe mode", () => {
    const args = buildJudgeArgs({ model: "claude-sonnet-5" });
    expect(args).toContain("--safe-mode");
    expect(args).not.toContain("--mcp-config");
  });

  it("does not grade discovery evidence after the required MCP server failed", () => {
    const grade = gradeAgentRow(
      { expected_service: "scout" },
      {
        error: "required MCP server raven was failed in system init",
        searches: [{ hits: [{ service: "scout", id: "scout.searchRepos" }] }],
        searchContractValid: true,
        output: { primaryService: "scout", alternateToolIds: [] }
      }
    );
    expect(grade).toEqual({
      familyHitAt3: null,
      usableOpAt5: null,
      primaryHit: null,
      anyHit: null
    });
  });
});

describe("P3 — the paid executable is resolved and pinned", () => {
  it("records the resolved path, bytes, and version", () => {
    const identity = executableIdentity(process.execPath);
    expect(identity.resolvedPath).toBe(path.resolve(process.execPath));
    expect(identity.sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(identity.version).toMatch(/^v?\d+/);
    expect(assertExpectedExecutable(identity, identity.sha256).matches).toBe(true);
  });

  it("fails closed for a missing executable or a wrong expected hash", () => {
    expect(() => resolveExecutable("definitely-not-a-real-raven-eval-command", { PATH: "" })).toThrow(
      /not found on PATH/
    );
    const identity = executableIdentity(process.execPath);
    expect(() => assertExpectedExecutable(identity, "0".repeat(64))).toThrow(/refusing paid calls/);
    expect(() => assertExpectedExecutable(identity, undefined)).toThrow(/expect-agent-binary-sha256/);
  });

  it("hashes relevant inherited environment values without recording them", () => {
    const first = agentEnvironmentIdentity({
      PATH: "/tmp/bin",
      ANTHROPIC_API_KEY: "secret-a",
      UNRELATED: "ignored"
    });
    const second = agentEnvironmentIdentity({
      PATH: "/tmp/bin",
      ANTHROPIC_API_KEY: "secret-b",
      UNRELATED: "changed"
    });
    expect(first.variableNames).toEqual(["ANTHROPIC_API_KEY", "PATH"]);
    expect(JSON.stringify(first)).not.toContain("secret-a");
    expect(first.sha256).not.toBe(second.sha256);
  });

  it("creates a secret-safe environment pin stamp", () => {
    const identity = agentEnvironmentIdentity({
      PATH: "/tmp/bin",
      ANTHROPIC_API_KEY: "secret-a"
    });
    const pinned = assertExpectedAgentEnvironment(identity, identity.sha256);

    expect(pinned).toEqual({
      ...identity,
      expectedSha256: identity.sha256,
      matches: true
    });
    expect(JSON.stringify(pinned)).not.toContain("secret-a");
  });
});

function writeEnvironmentPinFixture(root, name) {
  const lifecycle = { state: "active", reviewState: "none" };
  const kase = {
    id: `q-environment-pin-${name}`,
    question: "What command builds a Stellar smart contract?",
    golden: {
      answer: "Use `stellar contract build`.",
      keyFacts: ["Uses `stellar contract build`."],
      avoid: [],
      sources: [],
      notes: ""
    },
    tags: { category: "soroban", service: "stellarDocs", freshness: "stable" },
    truth: { lifecycle }
  };
  const casesPath = path.join(root, `${name}-cases.json`);
  const resultsPath = path.join(root, `${name}-results.json`);
  const lifecycleSnapshot = [{ id: kase.id, lifecycle }];
  const row = {
    id: kase.id,
    question: kase.question,
    tags: kase.tags,
    truth: { status: "verified", lifecycle },
    answer: "Use `stellar contract build`.",
    transcript: [],
    agent: {
      model: "fixture-agent",
      turns: 1,
      costUsd: 0.01,
      usage: { final: null, perTurn: [], perTurnAvailable: false },
      promptChars: 64,
      stderr: null,
      failure: null
    },
    verdict: null,
    evidencePack: { packVersion: PACK_VERSION, chars: 0, sha256: null },
    durationMs: 1
  };
  writeFileSync(casesPath, JSON.stringify({ cases: [kase] }, null, 2));
  writeFileSync(
    resultsPath,
    JSON.stringify(
      {
        meta: {
          variant: "A",
          surface: "search-execute",
          searchTool: "search",
          model: "fixture-agent",
          judgeModel: null,
          judgeRubric: null,
          packVersion: PACK_VERSION,
          resultsSchema: AGENT_RESULT_SCHEMA,
          casesPath,
          caseCount: 1,
          inputSnapshot: {
            casesSha256: sha256(JSON.stringify([kase])),
            caseIdsSha256: sha256(JSON.stringify([kase.id])),
            lifecycle: lifecycleSnapshot,
            lifecycleSha256: sha256(JSON.stringify(lifecycleSnapshot))
          },
          comparable: true,
          completeness: {
            expectedRows: 1,
            collectedRows: 1,
            judgedRows: 0,
            complete: true,
            aggregatesAllowed: true,
            reasons: []
          },
          totalAgentCostUsd: 0.01,
          totalJudgeCostUsd: 0,
          totalCostUsd: 0.01
        },
        summary: null,
        rows: [row]
      },
      null,
      2
    ) + "\n"
  );
  return resultsPath;
}

function createEnvironmentPinCliFixture() {
  const root = mkdtempSync(path.join(os.tmpdir(), "qa-environment-pin-"));
  const claudePath = path.join(root, "claude");
  const callLogPath = path.join(root, "paid-calls.log");
  const claudeSource = `#!/bin/sh
if [ "$1" = "--version" ]; then
  printf '%s\\n' 'fixture-claude 1.0.0'
  exit 0
fi
cat >/dev/null
printf '%s\\n' paid >> "$QA_FAKE_CALL_LOG"
printf '%s\\n' '{"result":"{\\"score\\":\\"correct\\",\\"coreAnswer\\":\\"correct\\",\\"missingFacts\\":[],\\"wrongClaims\\":[],\\"avoidMatches\\":[],\\"rationale\\":\\"fixture\\"}","total_cost_usd":0.01}'
`;
  writeFileSync(claudePath, claudeSource);
  chmodSync(claudePath, 0o755);
  const environment = {
    PATH: `${root}:/usr/bin:/bin`,
    HOME: path.join(root, "home"),
    SHELL: "/bin/sh",
    TMPDIR: root,
    QA_FAKE_CALL_LOG: callLogPath
  };
  const binarySha256 = sha256(readFileSync(claudePath));
  const environmentSha256 = agentEnvironmentIdentity(environment).sha256;
  const run = (resultsPath, extraArgs = []) =>
    spawnSync(
      process.execPath,
      [
        RUN_QA_PATH,
        "--judge-stored",
        resultsPath,
        "--max-budget-usd",
        "1",
        "--expect-agent-binary-sha256",
        binarySha256,
        ...extraArgs
      ],
      { cwd: REPO_ROOT, env: environment, encoding: "utf8" }
    );
  const runCollection = (extraArgs = []) =>
    spawnSync(
      process.execPath,
      [
        RUN_QA_PATH,
        "--max-budget-usd",
        "1",
        "--expect-agent-binary-sha256",
        binarySha256,
        ...extraArgs
      ],
      { cwd: REPO_ROOT, env: environment, encoding: "utf8" }
    );
  const paidCalls = () =>
    readFileSync(callLogPath, "utf8").split("\n").filter(Boolean);
  writeFileSync(callLogPath, "");
  return { root, run, runCollection, paidCalls, environmentSha256 };
}

describe("run-qa optional IDs selector guards", () => {
  it.each([
    ["equals form", ["--ids=q-example"], /--ids=<value> is not supported/],
    ["duplicate", ["--ids", "q-example", "--ids", "q-second"], /accepts --ids at most once/]
  ])("rejects the %s in the direct parser", (_name, idsArgs, message) => {
    expect(() => parseOptionalIdsFlag(idsArgs)).toThrow(message);
  });

  it.each([
    ["equals form", ["--ids=q-example"], /--ids=<value> is not supported/],
    ["duplicate", ["--ids", "q-example", "--ids", "q-second"], /accepts --ids at most once/]
  ])("rejects the %s --ids selector before a paid call", (_name, idsArgs, message) => {
    const fixture = createEnvironmentPinCliFixture();
    try {
      const result = fixture.runCollection(idsArgs);

      expect(result.status).not.toBe(0);
      expect(result.stderr).toMatch(message);
      expect(fixture.paidCalls()).toEqual([]);
    } finally {
      rmSync(fixture.root, { recursive: true, force: true });
    }
  });

  it("preserves a spaced --ids selector", () => {
    expect(parseOptionalIdsFlag(["--ids", "q-example,q-second"]))
      .toBe("q-example,q-second");
  });

  it("rejects --ids with --judge-stored before a paid call", () => {
    const fixture = createEnvironmentPinCliFixture();
    try {
      const resultsPath = writeEnvironmentPinFixture(fixture.root, "ids-with-judge-stored");
      const result = fixture.run(resultsPath, [
        "--expect-agent-environment-sha256",
        fixture.environmentSha256,
        "--ids",
        "q-example"
      ]);

      expect(result.status).not.toBe(0);
      expect(result.stderr).toMatch(/--judge-stored and --ids are contradictory/);
      expect(fixture.paidCalls()).toEqual([]);
      expect(JSON.parse(readFileSync(resultsPath, "utf8")).rows[0].verdict).toBeNull();
    } finally {
      rmSync(fixture.root, { recursive: true, force: true });
    }
  });
});

describe("fail-closed CLI syntax helper", () => {
  const syntax = {
    valueFlags: ["--cases", "--cases-ref", "--model", "--sample"],
    booleanFlags: ["--dry-run"],
    label: "fixture"
  };

  it("accepts multiple declared spaced flags and a bare boolean flag", () => {
    expect(() => assertFailClosedCliSyntax([
      "--sample", "30",
      "--model", "fixture-model",
      "--dry-run"
    ], syntax)).not.toThrow();
  });

  it.each([
    ["an empty equals form", ["--sample="], /--sample=<value> is not supported/],
    ["an equals form after another flag", ["--model", "fixture-model", "--sample=30"], /--sample=<value> is not supported/],
    ["an unknown flag", ["--unknown"], /fixture: unknown flag --unknown/],
    ["a stray argument", ["stray"], /fixture: unexpected positional argument "stray"/]
  ])("rejects %s", (_name, args, message) => {
    expect(() => assertFailClosedCliSyntax(args, syntax)).toThrow(message);
  });

  it("matches --cases-ref only when that exact flag is declared", () => {
    expect(() => assertFailClosedCliSyntax(["--cases-ref", "HEAD"], syntax)).not.toThrow();
    expect(() => assertFailClosedCliSyntax(["--cases-ref=HEAD"], syntax))
      .toThrow(/--cases-ref=<value> is not supported; use --cases-ref <value>/);
  });
});

describe("run-qa residual optional flag guards", () => {
  it.each([
    ["--sample=1", /--sample=<value> is not supported/],
    ["--model=fixture-agent", /--model=<value> is not supported/],
    ["--judge-model=fixture-judge", /--judge-model=<value> is not supported/],
    ["--cases=fixture-cases.json", /--cases=<value> is not supported/],
    ["--variant=B", /--variant=<value> is not supported/],
    ["--max-panel-cases=10", /--max-panel-cases=<value> is not supported/],
    ["--no-judge=true", /--no-judge=<value> is not supported; use --no-judge/],
    ["--judge-panel=3", /--judge-panel=<value> is not supported/],
    ["--stability-register=fixture.json", /--stability-register=<value> is not supported/],
    ["--surface=per-operation", /--surface=<value> is not supported/],
    ["--search-tool=fixture-search", /--search-tool=<value> is not supported/],
    ["--port=8790", /--port=<value> is not supported/],
    ["--judge-stored=fixture.json", /--judge-stored=<value> is not supported/]
  ])("rejects %s before a fake judge call", (optionalArg, message) => {
    const fixture = createEnvironmentPinCliFixture();
    try {
      const resultsPath = writeEnvironmentPinFixture(fixture.root, "optional-equals");
      const result = fixture.run(resultsPath, [
        "--expect-agent-environment-sha256",
        fixture.environmentSha256,
        optionalArg
      ]);

      expect(result.status).not.toBe(0);
      expect(result.stderr).toMatch(message);
      expect(fixture.paidCalls()).toEqual([]);
      expect(JSON.parse(readFileSync(resultsPath, "utf8")).rows[0].verdict).toBeNull();
    } finally {
      rmSync(fixture.root, { recursive: true, force: true });
    }
  });

  it.each([
    ["an unknown flag", "--unknown", /run-qa: unknown flag --unknown/],
    ["a stray argument", "stray", /run-qa: unexpected positional argument "stray"/]
  ])("rejects %s before a fake judge call", (_name, arg, message) => {
    const fixture = createEnvironmentPinCliFixture();
    try {
      const resultsPath = writeEnvironmentPinFixture(fixture.root, "fail-closed");
      const result = fixture.run(resultsPath, [
        "--expect-agent-environment-sha256",
        fixture.environmentSha256,
        arg
      ]);

      expect(result.status).not.toBe(0);
      expect(result.stderr).toMatch(message);
      expect(fixture.paidCalls()).toEqual([]);
      expect(JSON.parse(readFileSync(resultsPath, "utf8")).rows[0].verdict).toBeNull();
    } finally {
      rmSync(fixture.root, { recursive: true, force: true });
    }
  });

  it("preserves every declared spaced value and bare boolean form", () => {
    expect(() => assertRunQaCliSyntax([
      "--cases", "fixture-cases.json",
      "--expect-agent-binary-sha256", "binary",
      "--expect-agent-environment-sha256", "environment",
      "--expect-sha256", "surface",
      "--ids", "q-example",
      "--judge-model", "fixture-judge",
      "--judge-panel", "2",
      "--judge-stored", "fixture-results.json",
      "--max-budget-usd", "1",
      "--max-panel-cases", "10",
      "--model", "fixture-agent",
      "--no-judge",
      "--port", "8788",
      "--sample", "30",
      "--search-tool", "search",
      "--server-revision", "revision",
      "--stability-register", "fixture-stability.json",
      "--surface", "search-execute",
      "--variant", "A"
    ])).not.toThrow();
  });

  it.each([
    ["--sample", "1"],
    ["--model", "fixture-agent"],
    ["--judge-model", "fixture-judge"],
    ["--cases", "fixture-cases.json"],
    ["--variant", "B"]
  ])("preserves the spaced %s form", (flag, value) => {
    const fixture = createEnvironmentPinCliFixture();
    try {
      const resultsPath = writeEnvironmentPinFixture(fixture.root, "optional-spaced");
      const result = fixture.run(resultsPath, [
        "--expect-agent-environment-sha256",
        fixture.environmentSha256,
        flag,
        value
      ]);

      expect(result.status, result.stderr).toBe(0);
      expect(
        fixture.paidCalls(),
        "one stored row must produce exactly one judge call"
      ).toEqual(["paid"]);
    } finally {
      rmSync(fixture.root, { recursive: true, force: true });
    }
  });
});

describe("P3 — run-qa CLI pins the inherited agent environment", () => {
  it.each([
    ["duplicate", ["--expect-agent-binary-sha256", "0".repeat(64)], /accepts --expect-agent-binary-sha256 exactly once/],
    ["equals form", [`--expect-agent-binary-sha256=${"0".repeat(64)}`], /=<value> is not supported/]
  ])("fails before a paid call when the binary pin uses the %s form", (name, binaryArgs, message) => {
    const fixture = createEnvironmentPinCliFixture();
    try {
      const resultsPath = writeEnvironmentPinFixture(fixture.root, `binary-${name}`);
      const result = fixture.run(resultsPath, [
        ...binaryArgs,
        "--expect-agent-environment-sha256",
        fixture.environmentSha256
      ]);

      expect(result.status).not.toBe(0);
      expect(result.stderr).toMatch(message);
      expect(fixture.paidCalls()).toEqual([]);
    } finally {
      rmSync(fixture.root, { recursive: true, force: true });
    }
  });

  it.each([
    ["server revision duplicate", ["--server-revision", "0".repeat(40)], /accepts --server-revision exactly once/],
    ["server revision equals form", [`--server-revision=${"0".repeat(40)}`], /server-revision=<value> is not supported/],
    ["surface duplicate", ["--expect-sha256", "0".repeat(64)], /accepts --expect-sha256 exactly once/],
    ["surface equals form", [`--expect-sha256=${"0".repeat(64)}`], /expect-sha256=<value> is not supported/]
  ])("fails before a paid call when the collection pin uses the %s", (name, pinArgs, message) => {
    const fixture = createEnvironmentPinCliFixture();
    try {
      const result = fixture.runCollection([
        "--expect-agent-environment-sha256",
        fixture.environmentSha256,
        "--server-revision",
        "0".repeat(40),
        "--expect-sha256",
        "0".repeat(64),
        ...pinArgs
      ]);

      expect(result.status).not.toBe(0);
      expect(result.stderr).toMatch(message);
      expect(fixture.paidCalls()).toEqual([]);
    } finally {
      rmSync(fixture.root, { recursive: true, force: true });
    }
  });

  it("accepts a matching pin and stamps the judge environment identity", () => {
    const fixture = createEnvironmentPinCliFixture();
    try {
      const matchingPath = writeEnvironmentPinFixture(fixture.root, "matching");
      const matching = fixture.run(matchingPath, [
        "--expect-agent-environment-sha256",
        fixture.environmentSha256
      ]);

      expect(matching.status, matching.stderr).toBe(0);
      expect(
        fixture.paidCalls(),
        "one judge call per stored row; a second means a judge retry"
      ).toEqual(["paid"]);
      const stored = JSON.parse(readFileSync(matchingPath, "utf8"));
      expect(stored.rows[0].verdict, "judge attempt must not be a retryable CLI error")
        .toMatchObject({ score: "correct" });
      expect(stored.rows[0].verdict.failureClass ?? null).toBeNull();
      expect(stored.meta.judgeEnvironment).toMatchObject({
        sha256: fixture.environmentSha256,
        expectedSha256: fixture.environmentSha256,
        matches: true
      });
    } finally {
      rmSync(fixture.root, { recursive: true, force: true });
    }
  });

  it.each([
    ["absent", [], /requires --expect-agent-environment-sha256/],
    ["mismatch", ["--expect-agent-environment-sha256", "0".repeat(64)], /refusing paid calls/],
    ["malformed", ["--expect-agent-environment-sha256", "not-a-sha256"], /64-character lowercase SHA-256/],
    ["uppercase", ["--expect-agent-environment-sha256", "A".repeat(64)], /64-character lowercase SHA-256/],
    ["missing", ["--expect-agent-environment-sha256"], /requires a value/],
    [
      "duplicate",
      [
        "--expect-agent-environment-sha256",
        "0".repeat(64),
        "--expect-agent-environment-sha256",
        "0".repeat(64)
      ],
      /accepts --expect-agent-environment-sha256 exactly once/
    ],
    [
      "equals form",
      [`--expect-agent-environment-sha256=${"0".repeat(64)}`],
      /=<value> is not supported/
    ]
  ])("fails before a paid call when the pin is %s", (name, extraArgs, message) => {
    const fixture = createEnvironmentPinCliFixture();
    try {
      const resultsPath = writeEnvironmentPinFixture(fixture.root, name);
      const result = fixture.run(resultsPath, extraArgs);

      expect(result.status).not.toBe(0);
      expect(result.stderr).toMatch(message);
      expect(fixture.paidCalls()).toEqual([]);
      expect(JSON.parse(readFileSync(resultsPath, "utf8")).rows[0].verdict).toBeNull();
    } finally {
      rmSync(fixture.root, { recursive: true, force: true });
    }
  });

  it("rejects a collection-mode mismatch before an answering-agent spawn", () => {
    const fixture = createEnvironmentPinCliFixture();
    try {
      const result = fixture.runCollection([
        "--expect-agent-environment-sha256",
        "0".repeat(64)
      ]);

      expect(result.status).not.toBe(0);
      expect(result.stderr).toMatch(/Claude environment.*refusing paid calls/);
      expect(fixture.paidCalls()).toEqual([]);
    } finally {
      rmSync(fixture.root, { recursive: true, force: true });
    }
  });
});

describe("P3 — the bound server revision is verified from its listener", () => {
  const revision = "a".repeat(40);
  const spawnSyncImpl = (command, args) => {
    if (command === "lsof" && args.includes("-iTCP:8788")) {
      return { status: 0, stdout: "p123\ncworkerd\n", stderr: "" };
    }
    if (command === "lsof" && args.includes("cwd")) {
      return { status: 0, stdout: "p123\nfcwd\nn/tmp/raven-arm\n", stderr: "" };
    }
    if (command === "git" && args.includes("rev-parse")) {
      return { status: 0, stdout: `${revision}\n`, stderr: "" };
    }
    if (command === "git" && args.includes("status")) {
      return { status: 0, stdout: "", stderr: "" };
    }
    return { status: 1, stdout: "", stderr: "unexpected command" };
  };

  it("binds one listener pid to a clean worktree revision", () => {
    expect(boundServerIdentity(8788, revision, { spawnSyncImpl })).toEqual({
      verification: "listener-process-cwd",
      port: 8788,
      pid: 123,
      command: "workerd",
      cwd: "/tmp/raven-arm",
      revision,
      dirty: false
    });
  });

  it("refuses a revision mismatch", () => {
    expect(() => boundServerIdentity(8788, "b".repeat(40), { spawnSyncImpl })).toThrow(
      /listener cwd .* is a{40}/
    );
  });

  it("requires the same listener before and after paid calls", () => {
    const before = boundServerIdentity(8788, revision, { spawnSyncImpl });
    expect(assertStableBoundServerIdentity(before, { ...before }).matches).toBe(true);
    expect(() => assertStableBoundServerIdentity(before, { ...before, pid: 124 })).toThrow(
      /changed during paid calls \(pid\)/
    );
  });

  it("requires the runner worktree to stay clean at one revision", () => {
    const before = gitWorktreeIdentity("/tmp/raven-arm", { spawnSyncImpl });
    expect(assertStableGitWorktreeIdentity(before, { ...before }).matches).toBe(true);
    expect(() => assertStableGitWorktreeIdentity(before, { ...before, dirty: true })).toThrow(
      /worktree changed during paid calls/
    );
  });
});

describe("P3b — exact-old-runtime adapter flags fail closed", () => {
  const runnerRevision = "a".repeat(40);
  const serverRevision = "b".repeat(40);
  const implementationSha256 = "c".repeat(64);
  const complete = [
    "--adapter-mode", "add-missing",
    "--adapter-revision", runnerRevision,
    "--expect-adapter-sha256", implementationSha256,
    "--upstream-port", "8790"
  ];

  it("pins the adapter mode, bytes, runner revision, and private port", () => {
    expect(parseRuntimeAdapterFlags(complete, {
      publicPort: 8788,
      runnerRevision,
      serverRevision,
      localImplementationSha256: implementationSha256
    })).toEqual({
      schema: "exact-old-runtime-adapter-v1",
      mode: "add-missing",
      adapterRevision: runnerRevision,
      implementationSha256,
      publicPort: 8788,
      upstreamPort: 8790,
      sourceRevision: serverRevision
    });
  });

  it("rejects partial adapter configuration and byte mismatches", () => {
    expect(() => parseRuntimeAdapterFlags(complete.slice(0, 2), {
      publicPort: 8788,
      runnerRevision,
      serverRevision,
      localImplementationSha256: implementationSha256
    })).toThrow(/requires --adapter-mode/);
    expect(() => parseRuntimeAdapterFlags(complete, {
      publicPort: 8788,
      runnerRevision,
      serverRevision,
      localImplementationSha256: "d".repeat(64)
    })).toThrow(/does not match/);
  });

  it("requires the adapter from the clean runner revision", () => {
    expect(() => parseRuntimeAdapterFlags(complete, {
      publicPort: 8788,
      runnerRevision: "d".repeat(40),
      serverRevision,
      localImplementationSha256: implementationSha256
    })).toThrow(/clean runner revision/);
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

  it("requires the bound Worker to report the expected source revision", () => {
    const revision = "a".repeat(40);
    const serverInfo = { name: "raven", sourceRevision: revision };
    expect(checkExpectedSourceRevision(serverInfo, revision.toUpperCase())).toMatchObject({
      checked: true,
      matches: true
    });
    expect(assertExpectedSourceRevision(serverInfo, revision).matches).toBe(true);
    expect(() => assertExpectedSourceRevision({ name: "raven" }, revision)).toThrow(
      /live Worker reports none/
    );
  });

  it("parses both plain JSON and SSE framing from a Streamable HTTP server", () => {
    expect(parseMcpHttpPayload('{"jsonrpc":"2.0","id":1,"result":{}}').id).toBe(1);
    expect(parseMcpHttpPayload('event: message\ndata: {"jsonrpc":"2.0","id":2,"result":{}}\n\n').id).toBe(2);
    expect(
      parseMcpHttpPayload(': keepalive\n\nevent: message\ndata:{"jsonrpc":"2.0",\ndata:"id":3,"result":{}}\n\n').id
    ).toBe(3);
  });

  it("fingerprints a bound server over the wire with the same numbers", async () => {
    const revision = "a".repeat(40);
    const responses = [
      {
        result: {
          protocolVersion: MCP_PROTOCOL_VERSION,
          serverInfo: { name: "raven", sourceRevision: revision },
          instructions
        }
      },
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
    expect(surface.serverInfo.sourceRevision).toBe(revision);
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

  it("requires the plain surface for a per-operation QA probe", async () => {
    await expect(
      probeLiveSurface(8788, {
        surface: "per-operation",
        searchTool: "search",
        plainSurface: null
      })
    ).rejects.toThrow(/requires plainSurface/);
  });

  it("normalizes a bare origin to the MCP path", () => {
    expect(normalizeServerUrl("http://localhost:8788")).toBe("http://localhost:8788/mcp");
    expect(normalizeServerUrl("http://localhost:8788/mcp")).toBe("http://localhost:8788/mcp");
  });
});
