#!/usr/bin/env node
/**
 * Agent-allowed discovery arm: a real headless answering agent may issue one
 * to three `search` calls, then selects a primary operation. The runner grades
 * both what the searches visibly surfaced and the agent's final family choice.
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  assertNeutralAgentCwd,
  assertRunPlan,
  formatCompletenessNotice,
  runCompleteness
} from "../lib/harness-guards.mjs";
import {
  capSearchEvidence,
  compactHit,
  expectedFamiliesOf,
  gradeVisibleSearches,
  loadDiscoveryCases,
  normalizeUrl,
  parseMcpResponse,
  preflightSearch,
  resultStamp,
  summarizeDiscovery,
  writeResult
} from "./lib.mjs";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(DIR, "../..");
const DEFAULT_CASES = path.join(DIR, "cases.json");
const DEFAULT_URL = "http://localhost:8787";
const DEFAULT_MODEL = "claude-sonnet-5";
const DEFAULT_EFFORT = "medium";
const MAX_SEARCHES = 3;
const MAX_TURNS = 6;
const TIMEOUT_MS = 5 * 60_000;

const OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    primaryToolId: { type: "string" },
    primaryService: {
      type: "string",
      enum: ["lumenloop", "scout", "stellarDocs", "skills", "none"]
    },
    alternateToolIds: { type: "array", items: { type: "string" }, maxItems: 3 },
    reasoning: { type: "string" }
  },
  required: ["primaryToolId", "primaryService", "alternateToolIds", "reasoning"],
  additionalProperties: false
};

const argValue = (flag) => {
  const index = process.argv.indexOf(flag);
  return index === -1 ? undefined : process.argv[index + 1];
};

function prompt(question) {
  return `You are evaluating discovery for a Stellar-ecosystem MCP catalog. The only tool you may use is mcp__raven__search.

User question: ${JSON.stringify(question)}

Make between 1 and ${MAX_SEARCHES} search calls total. You may vary phrasing to test source-family and capability hypotheses. Read the returned hits, then select the ONE exact tool id you would invoke first to answer the user. Prefer an operation when one is usable. Include up to three exact backup ids that appeared in the hits. Do not answer the user question. Return only the requested structured object.`;
}

function parseToolResultText(block) {
  return Array.isArray(block.content)
    ? block.content.map((item) => item.text ?? "").join("")
    : String(block.content ?? "");
}

function parseSearchResultText(text) {
  const message = parseMcpResponse(text);
  const payload = (Array.isArray(message.hits) ? message : null) ?? message.result?.structuredContent ?? (() => {
    const raw = (message.result?.content ?? []).find((item) => item.type === "text")?.text;
    return raw ? JSON.parse(raw) : null;
  })();
  if (!payload || !Array.isArray(payload.hits)) throw new Error("agent search result has no hits array");
  return payload.hits.slice(0, 8).map((hit, index) => compactHit(hit, index + 1));
}

/**
 * Spawn options for one discovery agent. Exported so the neutral working
 * directory (precondition P2) is assertable without a paid agent call.
 */
export function buildDiscoverySpawnOptions({ input, cwd }) {
  assertNeutralAgentCwd(cwd, { repoRoot: REPO, label: "discovery answering agent" });
  return {
    input,
    encoding: "utf8",
    timeout: TIMEOUT_MS,
    maxBuffer: 32 * 1024 * 1024,
    // The agent under test must not read this repository's AGENTS.md and
    // CLAUDE.md — they describe the measurement grading it.
    cwd
  };
}

function runAgent(c, { mcpConfigPath, model, effort, agentCwd }) {
  const response = spawnSync(
    "claude",
    [
      "-p",
      "--model",
      model,
      "--effort",
      effort,
      "--output-format",
      "stream-json",
      "--verbose",
      "--json-schema",
      JSON.stringify(OUTPUT_SCHEMA),
      "--mcp-config",
      mcpConfigPath,
      "--strict-mcp-config",
      "--allowedTools",
      "mcp__raven__search",
      "--max-turns",
      String(MAX_TURNS),
      "--dangerously-skip-permissions",
      "--no-session-persistence"
    ],
    buildDiscoverySpawnOptions({ input: prompt(c.question), cwd: agentCwd })
  );
  if (response.error) {
    return {
      searches: [],
      observedSearchCount: 0,
      searchContractValid: false,
      output: null,
      error: `agent spawn failed: ${response.error.message}`
    };
  }

  const pending = new Map();
  const searches = [];
  let output = null;
  let costUsd = null;
  let turns = null;
  let resultError = null;
  for (const line of String(response.stdout).split("\n")) {
    if (!line.trim().startsWith("{")) continue;
    let message;
    try {
      message = JSON.parse(line);
    } catch {
      continue;
    }
    if (message.type === "assistant" && Array.isArray(message.message?.content)) {
      for (const block of message.message.content) {
        if (block.type !== "tool_use" || !block.name.endsWith("search")) continue;
        pending.set(block.id, { query: String(block.input?.query ?? ""), limit: block.input?.limit ?? null });
      }
    } else if (message.type === "user" && Array.isArray(message.message?.content)) {
      for (const block of message.message.content) {
        if (block.type !== "tool_result") continue;
        const call = pending.get(block.tool_use_id);
        if (!call) continue;
        try {
          searches.push({ ...call, hits: parseSearchResultText(parseToolResultText(block)) });
        } catch (error) {
          searches.push({ ...call, hits: [], error: error.message });
        }
      }
    } else if (message.type === "result") {
      output = message.structured_output ?? null;
      if (!output && typeof message.result === "string") {
        try {
          output = JSON.parse(message.result);
        } catch {
          // The schema path should produce structured_output. Keep the raw
          // absence as an error instead of guessing from prose.
        }
      }
      costUsd = message.total_cost_usd ?? null;
      turns = message.num_turns ?? null;
      if (message.is_error) resultError = message.subtype ?? "agent result is_error";
    }
  }
  const capped = capSearchEvidence(searches, MAX_SEARCHES);
  if (!capped.searchContractValid) {
    resultError = `search-call contract breached: expected 1-${MAX_SEARCHES}, observed ${capped.observedSearchCount}`;
  }
  if (!output && !resultError) {
    resultError = `missing structured output (exit ${response.status}): ${String(response.stderr).slice(0, 400)}`;
  }
  return { ...capped, output, costUsd, turns, error: resultError };
}

function gradeAgentRow(c, run) {
  const visible = gradeVisibleSearches(c, run.searches);
  const expected = new Set(expectedFamiliesOf(c));
  const validOutput = run.searchContractValid ? run.output : null;
  const primaryHit = validOutput ? expected.has(validOutput.primaryService) : false;
  const alternateIds = validOutput?.alternateToolIds ?? [];
  const anyHit =
    primaryHit ||
    alternateIds.some((id) => expected.has(String(id).split(".")[0]));
  return { ...visible, primaryHit, anyHit };
}

async function main() {
  const startedAt = new Date().toISOString();
  const url = normalizeUrl(argValue("--url") ?? DEFAULT_URL);
  const casesPath = path.resolve(argValue("--cases") ?? DEFAULT_CASES);
  const model = argValue("--model") ?? DEFAULT_MODEL;
  const effort = argValue("--effort") ?? DEFAULT_EFFORT;
  const repeat = Number(argValue("--repeat") ?? 1);
  const runLabel = argValue("--run-label") ?? "agent";
  const ids = argValue("--ids")?.split(",").map((id) => id.trim()).filter(Boolean);
  if (!Number.isInteger(repeat) || repeat < 1) throw new Error("--repeat must be a positive integer");

  const { meta, cases: loaded } = loadDiscoveryCases(casesPath);
  let cases = loaded;
  if (ids) {
    const wanted = new Set(ids);
    cases = loaded.filter((c) => wanted.has(c.id));
    const missing = ids.filter((id) => !cases.some((c) => c.id === id));
    if (missing.length) throw new Error(`--ids not found: ${missing.join(", ")}`);
  }
  assertRunPlan(cases.map((c) => c.id), { label: "run-agent-discovery" });
  await preflightSearch(url, "agent-discovery-eval");

  const tempDir = mkdtempSync(path.join(os.tmpdir(), "agent-discovery-"));
  // Precondition P2: an empty directory outside the repository, so the agent
  // under test cannot read AGENTS.md/CLAUDE.md as project instructions.
  const agentCwd = mkdtempSync(path.join(os.tmpdir(), "agent-discovery-cwd-"));
  assertNeutralAgentCwd(agentCwd, { repoRoot: REPO, label: "discovery answering agent" });
  const mcpConfigPath = path.join(tempDir, "mcp.json");
  writeFileSync(mcpConfigPath, JSON.stringify({ mcpServers: { raven: { type: "http", url } } }));
  const rows = [];
  try {
    for (let runIndex = 1; runIndex <= repeat; runIndex += 1) {
      for (const [index, c] of cases.entries()) {
        process.stdout.write(`[run ${runIndex}/${repeat} ${index + 1}/${cases.length}] ${c.id} ... `);
        const run = runAgent(c, { mcpConfigPath, model, effort, agentCwd });
        const grade = gradeAgentRow(c, run);
        rows.push({
          run: runIndex,
          id: c.id,
          question: c.question,
          ...(c.seed ? { seed: c.seed } : {}),
          ...(c.expectedFamilies ? { expectedFamilies: c.expectedFamilies, acceptableOps: c.acceptableOps } : {}),
          ...(c.expected_service ? { expected_service: c.expected_service } : {}),
          ...grade,
          searches: run.searches,
          selection: run.output,
          agent: {
            model,
            effort,
            turns: run.turns,
            costUsd: run.costUsd,
            observedSearchCount: run.observedSearchCount,
            searchContractValid: run.searchContractValid,
            error: run.error ?? null
          }
        });
        console.log(
          `searches=${run.observedSearchCount} visible-family=${grade.familyHitAt3 ? "hit" : "miss"} primary=${grade.primaryHit ? "hit" : "miss"}${run.error ? ` error=${run.error}` : ""}`
        );
      }
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
    rmSync(agentCwd, { recursive: true, force: true });
  }

  // Precondition P4: a lane that lost rows is incomplete, not smaller. Rows
  // are always written; only the per-run aggregates are withheld.
  const completeness = runCompleteness({ expectedIds: cases.map((c) => c.id), rows, repeat });
  const summariesByRun = {};
  if (completeness.aggregatesAllowed) {
    for (let runIndex = 1; runIndex <= repeat; runIndex += 1) {
      const runRows = rows.filter((row) => row.run === runIndex);
      const runCompleted = runCompleteness({ expectedIds: cases.map((c) => c.id), rows: runRows });
      summariesByRun[runIndex] = runCompleted.aggregatesAllowed
        ? summarizeDiscovery(runRows)
        : null;
    }
  }
  const stamp = resultStamp(`${runLabel}-agent`);
  const outPath = path.join(DIR, "results", `${stamp}.json`);
  writeResult(outPath, {
    meta: {
      instrument: "agent-discovery",
      schemaVersion: meta?.schemaVersion ?? null,
      casesPath: path.relative(REPO, casesPath),
      caseCount: cases.length,
      repeat,
      url,
      model,
      effort,
      maxSearches: MAX_SEARCHES,
      runLabel,
      startedAt,
      finishedAt: new Date().toISOString(),
      completeness,
      aggregatesSuppressed: !completeness.aggregatesAllowed,
      agentCwdNeutral: true,
      totalAgentCostUsd: rows.reduce((sum, row) => sum + (row.agent.costUsd ?? 0), 0)
    },
    summariesByRun,
    rows
  });
  console.log(`results -> ${outPath}`);
  if (!completeness.aggregatesAllowed) {
    console.log(formatCompletenessNotice(completeness, { label: "agent-discovery" }));
  }
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  main().catch((error) => {
    console.error(`run-agent-discovery failed: ${error.message}`);
    process.exit(1);
  });
}
