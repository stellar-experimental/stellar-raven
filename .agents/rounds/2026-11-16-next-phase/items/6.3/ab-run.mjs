#!/usr/bin/env node
/**
 * Round item 6.3: the answer-level A/B harness for one client on one arm (PLAN.md, steps 2 and 3, and
 * "Re-test: second measurement"). A copy of the 6.2 harness with the changes the plan lists: the arms,
 * a per-attempt cost cap, full-URL reference matching, the RWA call flags and, for the re-test, samples,
 * key lists, an attempt cap, a dry run and a full `execute` capture per run.
 *
 *   node ab-run.mjs --arm excluded|included --model <claude model id> --port <port> --out <file.jsonl>
 *                   [--keys C1,C2,...] [--samples <1..3>] [--max-attempts <n>]
 *                   [--from <sample>:<key>] [--capture-dir <dir>] [--dry-run]
 *   node ab-run.mjs --selftest
 *
 * Defaults (all ten questions, one sample, no attempt cap) reproduce result 1's run. The re-test passes
 * `--keys C1,C2,C3,D3,N1,N2,N3 --samples 3 --max-attempts 22` (EXCLUDED) or `45 - EXCLUDED's attempts`.
 *
 * Reuses `runAgent` and `isRetryableAgentFailure` from eval/qa/run-qa.mjs (importing runs nothing),
 * so the prompt, isolation flags, 24-turn cap and transcript parser are the QA runner's. It reads
 * only `questions.json` beside it. One JSON line per `(key, sample)` is appended to --out.
 *
 *   - run identity is `(key, sample)`; a duplicate is refused. The plan is round-major: sample 1 over the
 *     keys in order, then sample 2, then 3. An unanswered `(key, sample)` stays missing; nothing re-pairs.
 *   - answered: `failure` is null and the answer is non-empty.
 *   - one retry per run, only when `isRetryableAgentFailure` is true.
 *   - two consecutive unanswered runs of a class other than `agent` stop the harness (exit 3); the
 *     executor fixes the cause and resumes once with --from on the same arm and server revision.
 *   - cost: per arm USD 10, an attempt with a null `costUsd` counts at USD 4; the cap is checked before
 *     every attempt, a retry included, and the harness stops (exit 4) when the next attempt could pass
 *     it (spent + 4 > 10). A retry the cap refuses is not made; the run is recorded as it ended.
 *   - attempts: `--max-attempts` is checked the same way, before every attempt, counting the attempts
 *     of the records a resume already holds.
 *   - a fresh `mkdtempSync` agent directory for every attempt.
 *   - captures: for every run on both arms, with no branch on the arm, `<capture-dir>/exec-<arm>-<key>-<sample>.json`
 *     holds every `execute` entry of the final attempt as
 *     `{ index, code, result, isError, resultChars, namesRwa, footerCalls }` (`result` is the text the
 *     model saw; `index` is the entry's position in the transcript).
 *   - `rwaCalled`: the `execute` code of a call matches /\bscout\.getRwaAssets\s*\(/;
 *     `rwaRan`: a host footer lists `scout.getRwaAssets=ok`; `rwaMentioned`: the operation id or registry
 *     path appears in any tool input or in the answer.
 * The resolved model is not recorded (`runAgent` does not return `modelUsage`); the requested
 * model id and `claude --version` are.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync, appendFileSync } from "node:fs";
import os from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { isRetryableAgentFailure, runAgent } from "../../../../../eval/qa/run-qa.mjs";

const MAX_BUDGET_USD = 4;
const ARM_CAP_USD = 10;
const MAX_SAMPLES = 3;
const URL_RE = /https?:\/\/[^\s"'\\)\]>,}]+/g;
const RWA_CALL_RE = /\bscout\.getRwaAssets\s*\(/;
const RWA_MENTION_RE = /getRwaAssets|api\/rwa/i;
const FOOTER_CALL_RE = /([A-Za-z_][\w.]*)=(ok|error|soft-empty)\//g;
const OP_RE = /\b(?:stellarDocs|scout|lumenloop)\.[A-Za-z_][A-Za-z0-9_]*/g;

const VALUE_FLAGS = ["arm", "model", "port", "out", "from", "keys", "samples", "max-attempts", "capture-dir"];
const BOOL_FLAGS = ["dry-run", "selftest"];

export function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (!a.startsWith("--")) throw new Error(`unexpected argument ${a}`);
    const key = a.slice(2);
    if (BOOL_FLAGS.includes(key)) {
      out[key] = true;
      continue;
    }
    if (!VALUE_FLAGS.includes(key)) throw new Error(`unknown flag ${a}`);
    out[key] = argv[(i += 1)];
    if (out[key] === undefined) throw new Error(`${a} needs a value`);
  }
  if (out.selftest) return out;
  if (!["excluded", "included"].includes(out.arm)) throw new Error("--arm must be excluded or included");
  if (!out["dry-run"] && (!out.model || !out.port || !out.out)) throw new Error("--model, --port and --out are required");
  if (out.port !== undefined && !/^\d+$/.test(out.port)) throw new Error("--port must be a number");
  if (out["max-attempts"] !== undefined && !/^[1-9]\d*$/.test(out["max-attempts"])) throw new Error("--max-attempts must be a positive integer");
  return out;
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
/** A reference URL appears in text as a whole URL on any host (not a prefix of a longer one). */
export function referenceUrlsIn(text, urls) {
  return urls.filter((u) => new RegExp(`${escapeRe(u.replace(/\/$/, ""))}(?:\\.md)?/?(?![\\w/-])`).test(text));
}

function parseInput(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/** `op=outcome` pairs from the host footer's `calls:` line(s) of an `execute` result. */
export function footerCallsOf(resultText) {
  const calls = [];
  for (const line of String(resultText ?? "").split("\n")) {
    if (!line.startsWith("calls: ")) continue;
    for (const m of line.matchAll(FOOTER_CALL_RE)) calls.push(`${m[1]}=${m[2]}`);
  }
  return calls;
}

/** One compact, arm-neutral summary of a transcript entry. */
export function summarizeCall(entry, referenceUrls) {
  const input = parseInput(entry.input);
  const tool = String(entry.tool).replace(/^mcp__raven__/, "");
  const resultText = [entry.result, entry.resultProjection ? JSON.stringify(entry.resultProjection) : ""]
    .filter((x) => typeof x === "string" && x.length > 0)
    .join("\n");
  const call = { tool };
  if (tool === "search") call.query = typeof input.query === "string" ? input.query : null;
  if (tool === "execute") {
    call.ops = [...new Set(String(input.code ?? "").match(OP_RE) ?? [])];
    call.rwaCalled = RWA_CALL_RE.test(String(input.code ?? ""));
  }
  call.rwaInInput = RWA_MENTION_RE.test(String(input.code ?? "")) || RWA_MENTION_RE.test(String(input.query ?? ""));
  call.rwaInResult = RWA_MENTION_RE.test(resultText);
  call.isError = Boolean(entry.isError);
  call.resultUrls = [...new Set(resultText.match(URL_RE) ?? [])].map((u) => u.replace(/[.;:]+$/, ""));
  call.referenceUrlsInResult = referenceUrlsIn(resultText, referenceUrls);
  return call;
}

/** Every `execute` entry of a transcript, with what the model saw. No branch on the arm. */
export function captureExecutes(transcript) {
  const out = [];
  transcript.forEach((entry, index) => {
    if (String(entry.tool).replace(/^mcp__raven__/, "") !== "execute") return;
    const code = String(parseInput(entry.input).code ?? "");
    const result = typeof entry.result === "string" ? entry.result : "";
    out.push({
      index,
      code,
      result,
      isError: Boolean(entry.isError),
      resultChars: typeof entry.resultChars === "number" ? entry.resultChars : result.length,
      namesRwa: RWA_MENTION_RE.test(code) || RWA_MENTION_RE.test(result),
      footerCalls: footerCallsOf(result),
    });
  });
  return out;
}

const costOf = (run) => (typeof run.costUsd === "number" ? run.costUsd : null);

// --- the plan ------------------------------------------------------------------------------------

/** Round-major plan: sample 1 over the keys in order, then sample 2, ... Refuses bad keys and samples. */
export function planRuns({ questionKeys, keys, samples }) {
  const list = keys ?? questionKeys;
  const seen = new Set();
  for (const k of list) {
    if (!questionKeys.includes(k)) throw new Error(`unknown question key ${k}`);
    if (seen.has(k)) throw new Error(`duplicate question key ${k}`);
    seen.add(k);
  }
  const n = samples === undefined ? 1 : Number(samples);
  if (!Number.isInteger(n) || n < 1 || n > MAX_SAMPLES) throw new Error(`--samples must be an integer from 1 to ${MAX_SAMPLES}`);
  const plan = [];
  for (let sample = 1; sample <= n; sample += 1) for (const key of list) plan.push({ sample, key });
  return plan;
}

const planIndex = (plan, sample, key) => plan.findIndex((p) => p.sample === sample && p.key === key);

/** `--from <sample>:<key>` (a bare key means sample 1) to a plan index; the records before it must be complete. */
export function resumeIndex(plan, from, doneRecords) {
  const m = /^(?:(\d+):)?([A-Za-z0-9_-]+)$/.exec(from ?? "");
  if (!m) throw new Error("--from must be <sample>:<key>");
  const start = planIndex(plan, m[1] === undefined ? 1 : Number(m[1]), m[2]);
  if (start < 0) throw new Error(`--from ${from} is not in the plan`);
  const have = new Set();
  for (const r of doneRecords) {
    const idx = planIndex(plan, r.sample ?? 1, r.key);
    if (idx < 0) throw new Error(`--out holds ${r.key} sample ${r.sample ?? 1}, which is not in the plan`);
    if (idx >= start) throw new Error(`--out already holds ${r.key} sample ${r.sample ?? 1}`);
    if (have.has(idx)) throw new Error(`--out holds ${r.key} sample ${r.sample ?? 1} twice`);
    have.add(idx);
  }
  for (let i = 0; i < start; i += 1) if (!have.has(i)) throw new Error(`--out lacks ${plan[i].key} sample ${plan[i].sample}, which precedes --from`);
  return start;
}

// --- the run loop (the agent call is injected so the selftest can drive it) ----------------------

/** Appends records and writes captures; returns { status } with 0 done, 3 consecutive-unanswered, 4 cap. */
export function executeRuns({ args, questions, plan, startIndex, spent: spent0 = 0, attempts: attempts0 = 0, agent, claudeVersion, captureDir, mcpConfigPath, log = console.log }) {
  const qByKey = Object.fromEntries(questions.map((q) => [q.key, q]));
  const maxAttempts = args["max-attempts"] === undefined ? Infinity : Number(args["max-attempts"]);
  let spent = spent0;
  let attemptsUsed = attempts0;
  let consecutive = 0;
  const stop = (body, status) => {
    writeFileSync(`${args.out}.stop.json`, JSON.stringify({ ...body, spent, attempts: attemptsUsed }));
    return { status };
  };
  for (const { sample, key } of plan.slice(startIndex)) {
    const q = qByKey[key];
    const startedAt = new Date().toISOString();
    const attempts = [];
    let run;
    let attemptCost = 0;
    let capRefusedRetry = null;
    for (let n = 0; n < 2; n += 1) {
      // Both caps are checked before every attempt, a retry included (6.2 Codex review, low finding).
      const reason =
        attemptsUsed >= maxAttempts ? "attempt-cap" : spent + attemptCost + MAX_BUDGET_USD > ARM_CAP_USD ? "cost-cap" : null;
      if (reason) {
        if (n === 0) {
          log(`stop: ${reason} (spent ${spent.toFixed(2)}, attempts ${attemptsUsed}) before ${key} sample ${sample}`);
          return stop({ reason, before: `${sample}:${key}` }, 4);
        }
        capRefusedRetry = reason;
        break;
      }
      const agentCwd = mkdtempSync(join(os.tmpdir(), "ab63-agent-cwd-"));
      try {
        run = agent(q.question, {
          surface: "search-execute",
          searchTool: "search",
          allowedTools: ["mcp__raven__search", "mcp__raven__execute"],
          mcpConfigPath,
          model: args.model,
          agentCwd,
          maxBudgetUsd: MAX_BUDGET_USD,
        });
      } finally {
        rmSync(agentCwd, { recursive: true, force: true });
      }
      attemptsUsed += 1;
      attempts.push({ failureClass: run.failure?.class ?? null, turns: run.turns, costUsd: costOf(run) });
      attemptCost += costOf(run) ?? MAX_BUDGET_USD;
      if (!isRetryableAgentFailure(run.failure)) break;
    }
    const endedAt = new Date().toISOString();
    const runCostUsd = attempts.reduce((sum, a) => sum + (a.costUsd ?? MAX_BUDGET_USD), 0);
    spent += runCostUsd;
    const answered = !run.failure && typeof run.answer === "string" && run.answer.trim().length > 0;
    const failureClass = answered ? null : (run.failure?.class ?? "empty-answer");
    const calls = run.transcript.map((e) => summarizeCall(e, q.referenceUrls));
    const captured = captureExecutes(run.transcript);
    const captureFile = `exec-${args.arm}-${key}-${sample}.json`;
    writeFileSync(join(captureDir, captureFile), `${JSON.stringify(captured, null, 2)}\n`);
    const record = {
      key,
      sample,
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
      rwaCalled: calls.some((c) => c.rwaCalled === true),
      rwaRan: captured.some((c) => c.footerCalls.includes("scout.getRwaAssets=ok")),
      rwaMentioned: calls.some((c) => c.rwaInInput) || RWA_MENTION_RE.test(String(run.answer ?? "")),
      captureFile,
      capRefusedRetry: capRefusedRetry !== null,
    };
    appendFileSync(args.out, `${JSON.stringify(record)}\n`);
    log(`${key} sample ${sample} ${answered ? "answered" : `unanswered (${failureClass})`} turns ${run.turns} cost ${runCostUsd.toFixed(2)}`);

    if (capRefusedRetry) {
      log(`stop: ${capRefusedRetry} refused the retry of ${key} sample ${sample}`);
      return stop({ reason: capRefusedRetry, after: `${sample}:${key}` }, 4);
    }
    consecutive = !answered && failureClass !== "agent" ? consecutive + 1 : 0;
    if (consecutive >= 2) {
      log(`stop: two consecutive unanswered runs of a class other than agent, after ${key} sample ${sample}`);
      return stop({ reason: "consecutive-unanswered", after: `${sample}:${key}` }, 3);
    }
  }
  log(`done: spent ${spent.toFixed(2)}, attempts ${attemptsUsed}`);
  return { status: 0 };
}

const readRecords = (path) => readFileSync(path, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));

function main() {
  const args = parseArgs(process.argv.slice(2));
  delete process.env.QA_AGENT_PROMPT_APPEND;
  const { questions } = JSON.parse(readFileSync(new URL("questions.json", import.meta.url), "utf8"));
  const keys = args.keys === undefined ? undefined : args.keys.split(",").map((k) => k.trim());
  const plan = planRuns({ questionKeys: questions.map((q) => q.key), keys, samples: args.samples });
  const captureDir = args["capture-dir"] ?? (args.out ? dirname(args.out) : "tmp/6.3/rt");

  if (args["dry-run"]) {
    console.log(`plan: ${plan.length} runs, arm ${args.arm}, capture dir ${captureDir}`);
    plan.forEach((p, i) => console.log(`${i + 1} ${p.sample}:${p.key} exec-${args.arm}-${p.key}-${p.sample}.json`));
    if (args.from) {
      const have = args.out && existsSync(args.out) ? readRecords(args.out) : [];
      console.log(`resume at plan position ${resumeIndex(plan, args.from, have) + 1}`);
    }
    return 0;
  }

  let spent = 0;
  let attempts = 0;
  let startIndex = 0;
  if (args.from) {
    if (!existsSync(args.out)) throw new Error("--from needs an existing --out file");
    const done = readRecords(args.out);
    startIndex = resumeIndex(plan, args.from, done);
    for (const r of done) {
      spent += r.runCostUsd ?? 0;
      attempts += r.attempts?.length ?? 1;
    }
  } else if (existsSync(args.out)) {
    throw new Error("--out exists; pass --from to resume, never overwrite");
  } else {
    mkdirSync(captureDir, { recursive: true });
    writeFileSync(args.out, "");
  }
  mkdirSync(captureDir, { recursive: true });

  const claudeVersion = (spawnSync("claude", ["--version"], { encoding: "utf8" }).stdout ?? "").trim();
  const tmpDir = mkdtempSync(join(os.tmpdir(), "ab63-mcp-"));
  const mcpConfigPath = join(tmpDir, "mcp.json");
  writeFileSync(mcpConfigPath, JSON.stringify({ mcpServers: { raven: { type: "http", url: `http://localhost:${args.port}/mcp` } } }));
  return executeRuns({ args, questions, plan, startIndex, spent, attempts, agent: runAgent, claudeVersion, captureDir, mcpConfigPath }).status;
}

// --- offline self-check (no agent call) ----------------------------------------------------------

export function selftest() {
  const throws = (label, fn, re) => {
    try {
      fn();
    } catch (error) {
      if (!re || re.test(error.message)) return;
      throw new Error(`${label}: wrong error ${error.message}`);
    }
    throw new Error(`${label}: did not throw`);
  };
  const eq = (label, got, want) => {
    if (JSON.stringify(got) !== JSON.stringify(want)) throw new Error(`${label}: ${JSON.stringify(got)} != ${JSON.stringify(want)}`);
  };
  const { questions } = JSON.parse(readFileSync(new URL("questions.json", import.meta.url), "utf8"));
  const qk = questions.map((q) => q.key);
  const retestKeys = ["C1", "C2", "C3", "D3", "N1", "N2", "N3"];

  // Defaults reproduce result 1's order; the re-test plan is round-major, 21 runs.
  eq("default plan", planRuns({ questionKeys: qk }).map((p) => `${p.sample}:${p.key}`), qk.map((k) => `1:${k}`));
  const plan = planRuns({ questionKeys: qk, keys: retestKeys, samples: 3 });
  eq("retest plan size", plan.length, 21);
  eq("round-major order", plan.slice(5, 9).map((p) => `${p.sample}:${p.key}`), ["1:N2", "1:N3", "2:C1", "2:C2"]);
  eq("last run", plan[20], { sample: 3, key: "N3" });

  // Refusals: unknown key, bad sample counts, duplicate key.
  throws("unknown key", () => planRuns({ questionKeys: qk, keys: ["C1", "Z9"], samples: 1 }), /unknown question key/);
  for (const bad of [0, 4, -1, 1.5, "x"]) throws(`samples ${bad}`, () => planRuns({ questionKeys: qk, keys: ["C1"], samples: bad }), /--samples/);
  throws("duplicate key", () => planRuns({ questionKeys: qk, keys: ["C1", "C1"], samples: 1 }), /duplicate question key/);
  throws("bad flag", () => parseArgs(["--arm", "included", "--model", "m", "--port", "1", "--out", "o", "--max-attempts", "0"]), /max-attempts/);
  throws("bad arm", () => parseArgs(["--arm", "both", "--dry-run"]), /--arm/);

  // Resume: a bare key means sample 1; records before the position must be complete; none at or after it.
  const rec = (i) => ({ key: plan[i].key, sample: plan[i].sample });
  eq("resume 2:C1", resumeIndex(plan, "2:C1", plan.slice(0, 7).map((_, i) => rec(i))), 7);
  eq("resume bare key", resumeIndex(plan, "C3", [rec(0), rec(1)]), 2);
  throws("resume gap", () => resumeIndex(plan, "2:C1", [rec(0)]), /lacks/);
  throws("resume overlap", () => resumeIndex(plan, "1:C2", [rec(0), rec(1)]), /already holds/);
  throws("resume duplicate", () => resumeIndex(plan, "1:C2", [rec(0), rec(0)]), /twice/);
  throws("resume unknown", () => resumeIndex(plan, "3:ZZ", []), /not in the plan/);
  throws("resume off plan", () => resumeIndex(plan, "1:C2", [{ key: "D1", sample: 1 }]), /not in the plan/);

  // The footer parser and the capture shape, with no branch on the arm.
  const footer = "answer\n--- SOURCE METADATA ---\ncalls: scout.getRwaAssets=ok/427ms; stellarDocs.search_docs=ok/90ms (totals ok=2 error=0 soft-empty=0)\nguidance: x";
  eq("footer calls", footerCallsOf(footer), ["scout.getRwaAssets=ok", "stellarDocs.search_docs=ok"]);
  eq("footer ignores prose", footerCallsOf("see calls: a=ok/1ms"), []);
  const transcript = (rwa) => [
    { tool: "mcp__raven__search", input: JSON.stringify({ query: "rwa" }), result: "x" },
    { tool: "mcp__raven__execute", input: JSON.stringify({ code: rwa ? "await scout.getRwaAssets({limit:3})" : "await stellarDocs.search_docs({})" }), result: rwa ? footer : "ok\ncalls: stellarDocs.search_docs=ok/9ms (totals ok=1)", resultChars: 99, isError: false },
  ];
  const cap = captureExecutes(transcript(true));
  eq("capture count", cap.length, 1);
  eq("capture keys", Object.keys(cap[0]), ["index", "code", "result", "isError", "resultChars", "namesRwa", "footerCalls"]);
  eq("capture index", cap[0].index, 1);
  eq("capture names rwa", [cap[0].namesRwa, captureExecutes(transcript(false))[0].namesRwa], [true, false]);

  // The run loop on a fake agent: one capture file per run, flags, caps and the stop paths.
  const dir = mkdtempSync(join(os.tmpdir(), "ab63-selftest-"));
  try {
    const mk = (name, extra = {}) => {
      const sub = join(dir, name);
      mkdirSync(sub);
      return { sub, args: { arm: "included", model: "m", out: join(sub, "a.jsonl"), ...extra } };
    };
    const okRun = (rwa, cost = 0.1) => ({ answer: "an answer", failure: null, turns: 3, costUsd: cost, usage: { final: {} }, transcript: transcript(rwa) });
    const quiet = () => {};

    const A = mk("full");
    writeFileSync(A.args.out, "");
    let calls = 0;
    const resA = executeRuns({ args: A.args, questions, plan, startIndex: 0, agent: () => okRun(calls++ % 2 === 0), claudeVersion: "v", captureDir: A.sub, mcpConfigPath: "m", log: quiet });
    eq("full status", resA.status, 0);
    const recsA = readRecords(A.args.out);
    eq("full records", recsA.length, 21);
    eq("record identity", recsA.map((r) => `${r.sample}:${r.key}`), plan.map((p) => `${p.sample}:${p.key}`));
    eq("capture per run", plan.every((p) => existsSync(join(A.sub, `exec-included-${p.key}-${p.sample}.json`))), true);
    eq("flags", [recsA[0].rwaCalled, recsA[0].rwaRan, recsA[1].rwaCalled, recsA[1].rwaRan], [true, true, false, false]);

    // Attempt cap: checked before every attempt; a refused retry ends the run as recorded.
    const B = mk("attempt-cap", { "max-attempts": "5" });
    writeFileSync(B.args.out, "");
    const resB = executeRuns({ args: B.args, questions, plan, startIndex: 0, agent: () => okRun(false), claudeVersion: "v", captureDir: B.sub, mcpConfigPath: "m", log: quiet });
    eq("attempt cap status", resB.status, 4);
    eq("attempt cap records", readRecords(B.args.out).length, 5);
    eq("attempt cap stop file", JSON.parse(readFileSync(`${B.args.out}.stop.json`, "utf8")).reason, "attempt-cap");
    const C = mk("retry-cap", { "max-attempts": "2" });
    writeFileSync(C.args.out, "");
    const transport = () => ({ answer: "", failure: { class: "transport", retryable: true, reason: "x" }, turns: 0, costUsd: 0.01, usage: null, transcript: [] });
    const resC = executeRuns({ args: C.args, questions, plan, startIndex: 0, agent: transport, claudeVersion: "v", captureDir: C.sub, mcpConfigPath: "m", log: quiet });
    eq("retry runs", [resC.status, readRecords(C.args.out).length, readRecords(C.args.out)[0].attempts.length], [4, 1, 2]);
    const resC2 = executeRuns({ args: { ...C.args, "max-attempts": "1", out: join(C.sub, "b.jsonl") }, questions, plan, startIndex: 0, agent: transport, claudeVersion: "v", captureDir: C.sub, mcpConfigPath: "m", log: quiet });
    eq("retry refused by cap", resC2.status, 4);
    eq("retry refused record", readRecords(join(C.sub, "b.jsonl"))[0].capRefusedRetry, true);

    // A resume counts the attempts already used and the money already spent.
    const D = mk("resume", { "max-attempts": "7" });
    writeFileSync(D.args.out, "");
    executeRuns({ args: { ...D.args, "max-attempts": "4" }, questions, plan, startIndex: 0, agent: () => okRun(false), claudeVersion: "v", captureDir: D.sub, mcpConfigPath: "m", log: quiet });
    const done = readRecords(D.args.out);
    const start = resumeIndex(plan, "1:N1", done);
    eq("resume start", start, 4);
    const resD = executeRuns({ args: D.args, questions, plan, startIndex: start, spent: 0.4, attempts: 4, agent: () => okRun(false), claudeVersion: "v", captureDir: D.sub, mcpConfigPath: "m", log: quiet });
    eq("resume cap", [resD.status, readRecords(D.args.out).length], [4, 7]);

    // Cost cap before every attempt: spent 7 + the 4 reserved passes 10.
    const E = mk("cost-cap");
    writeFileSync(E.args.out, "");
    const resE = executeRuns({ args: E.args, questions, plan, startIndex: 0, spent: 6.5, agent: () => okRun(false), claudeVersion: "v", captureDir: E.sub, mcpConfigPath: "m", log: quiet });
    eq("cost cap", [resE.status, readRecords(E.args.out).length], [4, 0]);

    // Two consecutive non-agent failures stop the harness; an unanswered run stays a missing record.
    const F = mk("consecutive");
    writeFileSync(F.args.out, "");
    const bad = () => ({ answer: "", failure: { class: "protocol", retryable: false, reason: "x" }, turns: 1, costUsd: 0.01, usage: null, transcript: [] });
    const resF = executeRuns({ args: F.args, questions, plan, startIndex: 0, agent: bad, claudeVersion: "v", captureDir: F.sub, mcpConfigPath: "m", log: quiet });
    eq("consecutive stop", [resF.status, readRecords(F.args.out).map((r) => r.answered)], [3, [false, false]]);

    // Every attempt gets a fresh directory, removed afterwards.
    const G = mk("cwd");
    writeFileSync(G.args.out, "");
    const dirs = [];
    executeRuns({ args: { ...G.args, "max-attempts": "3" }, questions, plan, startIndex: 0, agent: (_q, o) => { dirs.push(o.agentCwd); return okRun(false); }, claudeVersion: "v", captureDir: G.sub, mcpConfigPath: "m", log: quiet });
    eq("fresh cwd per attempt", [new Set(dirs).size, dirs.some((d) => existsSync(d))], [3, false]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }

  // Dry run prints the plan without an agent call (checked through a child process by the executor's gate run).
  console.log("selftest ok: plan, refusals, resume, captures, caps, stops");
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  try {
    if (process.argv.includes("--selftest")) selftest();
    else process.exitCode = main();
  } catch (error) {
    console.error(`ab-run failed: ${error.message}`);
    process.exit(1);
  }
}
