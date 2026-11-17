#!/usr/bin/env node
/**
 * Round item 6.2: the answer-level A/B harness for one client on one arm (PLAN.md, step 2).
 *
 *   node ab-run.mjs --arm hold|fresh --model <claude model id> --port <port> --out <file.jsonl>
 *                   [--from <question key>]
 *
 * Reuses `runAgent` and `isRetryableAgentFailure` from eval/qa/run-qa.mjs (importing runs nothing),
 * so the prompt, isolation flags, 24-turn cap and transcript parser are the QA runner's. It reads
 * only `questions.json` beside it. One JSON line per question is appended to --out.
 *
 *   - answered: `failure` is null and the answer is non-empty.
 *   - one retry per run, only when `isRetryableAgentFailure` is true.
 *   - two consecutive unanswered runs of a class other than `agent` stop the harness (exit 3); the
 *     executor fixes the cause and resumes once with --from on the same arm and server revision.
 *   - cost: per client per arm USD 25, a run with a null `costUsd` counts at USD 4; the harness
 *     stops (exit 4) when the next run could pass the cap (spent + 4 > 25).
 * The resolved model is not recorded (`runAgent` does not return `modelUsage`); the requested
 * model id and `claude --version` are.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, writeFileSync, appendFileSync } from "node:fs";
import os from "node:os";
import { join } from "node:path";
import { isRetryableAgentFailure, runAgent } from "../../../../../eval/qa/run-qa.mjs";

const MAX_BUDGET_USD = 4;
const ARM_CAP_USD = 25;
const URL_RE = /https?:\/\/[^\s"'\\)\]>,}]+/g;
const OP_RE = /\b(?:stellarDocs|scout|lumenloop)\.[A-Za-z_][A-Za-z0-9_]*/g;

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (!a.startsWith("--")) throw new Error(`unexpected argument ${a}`);
    const key = a.slice(2);
    if (!["arm", "model", "port", "out", "from"].includes(key)) throw new Error(`unknown flag ${a}`);
    out[key] = argv[(i += 1)];
    if (out[key] === undefined) throw new Error(`${a} needs a value`);
  }
  if (!["hold", "fresh"].includes(out.arm)) throw new Error("--arm must be hold or fresh");
  if (!out.model || !out.port || !out.out) throw new Error("--model, --port and --out are required");
  if (!/^\d+$/.test(out.port)) throw new Error("--port must be a number");
  return out;
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
/** A reference path appears in text as a whole path (not a prefix of a longer one). */
export function referencePathsIn(text, paths) {
  return paths.filter((p) => new RegExp(`${escapeRe(p)}(?:\\.md)?/?(?![\\w/-])`).test(text));
}

function parseInput(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/** One compact, arm-neutral summary of a transcript entry. */
export function summarizeCall(entry, referencePaths) {
  const input = parseInput(entry.input);
  const tool = String(entry.tool).replace(/^mcp__raven__/, "");
  const resultText = [entry.result, entry.resultProjection ? JSON.stringify(entry.resultProjection) : ""]
    .filter((x) => typeof x === "string" && x.length > 0)
    .join("\n");
  const call = { tool };
  if (tool === "search") call.query = typeof input.query === "string" ? input.query : null;
  if (tool === "execute") call.ops = [...new Set(String(input.code ?? "").match(OP_RE) ?? [])];
  call.isError = Boolean(entry.isError);
  call.resultUrls = [...new Set(resultText.match(URL_RE) ?? [])].map((u) => u.replace(/[.;:]+$/, ""));
  call.referencePathsInResult = referencePathsIn(resultText, referencePaths);
  return call;
}

function costOf(run) {
  return typeof run.costUsd === "number" ? run.costUsd : null;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  delete process.env.QA_AGENT_PROMPT_APPEND;
  const { questions } = JSON.parse(readFileSync(new URL("questions.json", import.meta.url), "utf8"));
  const keys = questions.map((q) => q.key);

  let spent = 0;
  let startIndex = 0;
  if (args.from) {
    startIndex = keys.indexOf(args.from);
    if (startIndex < 0) throw new Error(`unknown question key ${args.from}`);
    if (!existsSync(args.out)) throw new Error("--from needs an existing --out file");
    const done = readFileSync(args.out, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
    for (const r of done) {
      if (keys.indexOf(r.key) >= startIndex) throw new Error(`--out already holds ${r.key}`);
      spent += r.runCostUsd ?? 0;
    }
  } else if (existsSync(args.out)) {
    throw new Error("--out exists; pass --from to resume, never overwrite");
  } else {
    writeFileSync(args.out, "");
  }

  const claudeVersion = (spawnSync("claude", ["--version"], { encoding: "utf8" }).stdout ?? "").trim();
  const agentCwd = mkdtempSync(join(os.tmpdir(), "ab62-agent-cwd-"));
  const tmpDir = mkdtempSync(join(os.tmpdir(), "ab62-mcp-"));
  const mcpConfigPath = join(tmpDir, "mcp.json");
  writeFileSync(
    mcpConfigPath,
    JSON.stringify({ mcpServers: { raven: { type: "http", url: `http://localhost:${args.port}/mcp` } } }),
  );

  let consecutive = 0;
  for (const q of questions.slice(startIndex)) {
    if (spent + MAX_BUDGET_USD > ARM_CAP_USD) {
      console.log(`stop: cost cap (spent ${spent.toFixed(2)} + ${MAX_BUDGET_USD} > ${ARM_CAP_USD}) before ${q.key}`);
      writeFileSync(`${args.out}.stop.json`, JSON.stringify({ reason: "cost-cap", before: q.key, spent }));
      process.exit(4);
    }
    const startedAt = new Date().toISOString();
    const attempts = [];
    let run;
    for (let n = 0; n < 2; n += 1) {
      run = runAgent(q.question, {
        surface: "search-execute",
        searchTool: "search",
        allowedTools: ["mcp__raven__search", "mcp__raven__execute"],
        mcpConfigPath,
        model: args.model,
        agentCwd,
        maxBudgetUsd: MAX_BUDGET_USD,
      });
      attempts.push({ failureClass: run.failure?.class ?? null, turns: run.turns, costUsd: costOf(run) });
      if (!isRetryableAgentFailure(run.failure)) break;
    }
    const endedAt = new Date().toISOString();
    const runCostUsd = attempts.reduce((sum, a) => sum + (a.costUsd ?? MAX_BUDGET_USD), 0);
    spent += runCostUsd;
    const answered = !run.failure && typeof run.answer === "string" && run.answer.trim().length > 0;
    const failureClass = answered ? null : (run.failure?.class ?? "empty-answer");
    const calls = run.transcript.map((e) => summarizeCall(e, q.referencePaths));
    const record = {
      key: q.key,
      model: args.model,
      claudeVersion,
      arm: args.arm,
      answered,
      answer: run.answer,
      failureClass,
      failureReason: run.failure ? String(run.failure.reason ?? "").slice(0, 300) : null,
      turns: run.turns,
      costUsd: costOf(run),
      runCostUsd,
      attempts,
      usage: run.usage?.final ?? null,
      startedAt,
      endedAt,
      calls,
      resultUrls: [...new Set(calls.flatMap((c) => c.resultUrls))],
    };
    appendFileSync(args.out, `${JSON.stringify(record)}\n`);
    console.log(`${q.key} ${answered ? "answered" : `unanswered (${failureClass})`} turns ${run.turns} cost ${runCostUsd.toFixed(2)}`);

    consecutive = !answered && failureClass !== "agent" ? consecutive + 1 : 0;
    if (consecutive >= 2) {
      console.log(`stop: two consecutive unanswered runs of a class other than agent, after ${q.key}`);
      writeFileSync(`${args.out}.stop.json`, JSON.stringify({ reason: "consecutive-unanswered", after: q.key, spent }));
      process.exit(3);
    }
  }
  console.log(`done: spent ${spent.toFixed(2)}`);
}

const isMain = process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href;
if (isMain) {
  main().catch((error) => {
    console.error(`ab-run failed: ${error.message}`);
    process.exit(1);
  });
}
