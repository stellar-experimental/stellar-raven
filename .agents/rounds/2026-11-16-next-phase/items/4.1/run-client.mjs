#!/usr/bin/env node
/**
 * Item 4.1 step 3: drive one client over the 24 rows, one attempt per row.
 *
 * Usage:
 *   node run-client.mjs --client codex|grok|opencode --rows rows.json --mcp-url <tap url>
 *                       --out <dir> [--cap-usd 8] [--cases eval/qa/cases.json] [--smoke]
 *                       [--work-root <dir>] [--opencode-auth <auth.json>] [--rows-limit N]
 *
 * The client's only MCP server is `raven` at the tap URL. Each row gets a fresh empty work
 * directory outside every git repository, a fresh private client home and an empty HOME; login
 * files are symlinked, never copied or read. The child environment is an allowlist. A row is
 * attempted once: a row directory that already holds result.json is never re-run.
 *
 * `--smoke` runs the one trivial prompt of plan step 4 instead of the rows.
 */
import { createHash } from "node:crypto";
import { spawn, spawnSync } from "node:child_process";
import {
  closeSync, existsSync, lstatSync, mkdirSync, openSync, readFileSync, rmSync, symlinkSync, writeFileSync
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { selectById } from "../../../../../eval/qa/tuning-rows.mjs";
import { costOf, parseClientOutput } from "./client-parse.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const { values: opt } = parseArgs({
  options: {
    client: { type: "string" },
    rows: { type: "string" },
    "mcp-url": { type: "string" },
    out: { type: "string" },
    "cap-usd": { type: "string", default: "8" },
    cases: { type: "string", default: "eval/qa/cases.json" },
    smoke: { type: "boolean", default: false },
    "work-root": { type: "string", default: path.join(os.homedir(), ".cache", "raven-4.1", "work") },
    "opencode-auth": { type: "string", default: path.join(process.env.XDG_DATA_HOME ?? path.join(os.homedir(), ".local", "share"), "opencode", "auth.json") },
    "rows-limit": { type: "string" }
  }
});
for (const k of ["client", "rows", "mcp-url", "out"]) if (!opt[k]) throw new Error(`missing --${k}`);
const CLIENT = opt.client;
if (!["codex", "grok", "opencode"].includes(CLIENT)) throw new Error(`unknown client ${CLIENT}`);
const CAP = Number(opt["cap-usd"]);
const OUT = path.resolve(opt.out);
const TIMEOUT_MS = 12 * 60 * 1000;
const KILL_GRACE_MS = 15 * 1000;
const prices = JSON.parse(readFileSync(path.join(HERE, "prices.json"), "utf8")).models;

const MODEL = { codex: "gpt-6.1-terra", grok: "grok-4.7", opencode: "claude-sonnet-5-5" }[CLIENT];
const EFFORT = { codex: "low", grok: "high", opencode: "provider default" }[CLIENT];

/** The agentPrompt of eval/qa/run-qa.mjs (search-execute surface), adapted as plan step 3 says. */
const PROMPT_HEAD = `You answer questions about the Stellar ecosystem using ONLY the \`raven\` MCP server's tools:

- the \`raven\` MCP server's \`search\` tool — discover what the catalog can do (service operations, skills)
- the \`raven\` MCP server's \`execute\` tool — run JavaScript that calls the discovered operations and returns data

Workflow: call search first with a short intent phrase, read the hits, then write execute scripts that gather real evidence (compose several operations; follow up with detail calls). Search again with different terms if the first pass misses.

Rules:
- Ground every specific claim (names, numbers, SEP/CAP ids, commands, URLs) in tool results. Never invent them.
- State an as-of date for each changeable roster, status, or value. Keep exact symbols, types, and formulas from tool results.
- If the tools cannot support an answer — the question is out of scope, the thing does not exist, or the request itself is something you should not do — say that plainly and briefly instead of guessing or playing along.
- Do not use web search, web fetch, or any MCP server other than \`raven\`.
- Your FINAL message must be the answer itself: concise, fact-dense, with source URLs from tool results where available. No preamble, no meta-commentary about tools.

QUESTION:
`;
const SMOKE_PROMPT = "Use the raven `search` tool once with the query `soroban events`, then reply with the ids of the first two hits.";
const sha256 = (s) => createHash("sha256").update(s).digest("hex");

const GROK_BUNDLED_SKILLS = [
  "build-with-ai", "code-review", "create-skill", "create-workflow", "design", "docx", "execute-plan", "game-assets",
  "imagine", "implement", "learn", "long-running-background-tasks", "pdf", "pptx", "pr-babysit", "resume-claude",
  "resume-codex", "resume-cursor", "review", "skill-design-principles", "statusline", "threejs-frame-conventions"
];

function assertOutsideRepo(dir) {
  const r = spawnSync("git", ["-C", dir, "rev-parse", "--git-dir"], { encoding: "utf8" });
  if (r.status === 0) throw new Error(`${dir} is inside a git repository`);
}

function link(target, linkPath) {
  if (!existsSync(target)) throw new Error(`login file missing: ${target}`);
  symlinkSync(target, linkPath);
}

/** Builds the child spawn for one row. Login files are linked, never read. */
function buildSpawn(prompt, rowDir, work) {
  const emptyHome = path.join(rowDir, "home");
  mkdirSync(emptyHome, { recursive: true });
  const env = { PATH: process.env.PATH ?? "", LANG: process.env.LANG ?? "C.UTF-8", TERM: "dumb", HOME: emptyHome };
  const logins = [];
  const real = os.homedir();
  if (CLIENT === "codex") {
    const home = path.join(rowDir, "codexhome");
    mkdirSync(home);
    for (const f of ["auth.json", "installation_id"]) {
      link(path.join(real, ".codex", f), path.join(home, f));
      logins.push(path.join(home, f));
    }
    env.CODEX_HOME = home;
    const args = [
      "exec", "--json", "--ignore-user-config", "--strict-config", "--skip-git-repo-check",
      "-C", work, "-s", "read-only", "-m", MODEL,
      "-c", `model_reasoning_effort="${EFFORT}"`, "-c", 'web_search="disabled"',
      "--disable", "apps", "--disable", "plugins", "--disable", "multi_agent",
      "--disable", "goals", "--disable", "image_generation", "--disable", "skill_search",
      "-c", "skills.bundled.enabled=false",
      "-c", `mcp_servers.raven.url=${JSON.stringify(opt["mcp-url"])}`,
      "-c", 'mcp_servers.raven.default_tools_approval_mode="approve"',
      prompt
    ];
    return { cmd: "codex", args, env, logins, clientHome: home };
  }
  if (CLIENT === "grok") {
    const home = path.join(rowDir, "grokhome");
    mkdirSync(home);
    for (const f of ["auth.json", "agent_id"]) {
      link(path.join(real, ".grok", f), path.join(home, f));
      logins.push(path.join(home, f));
    }
    // The bundled skills and the bundled workflow are Grok's own prompt additions; the smoke found
    // them in the model's context, so they are switched off here (plan step 4: no skill listed).
    writeFileSync(
      path.join(home, "config.toml"),
      `[mcp_servers.raven]\nurl = ${JSON.stringify(opt["mcp-url"])}\n\n[skills]\ndisabled = ${JSON.stringify(GROK_BUNDLED_SKILLS)}\n\n[workflows]\nenabled = false\n`
    );
    env.GROK_HOME = home;
    const args = [
      "-p", prompt, "--model", MODEL, "--reasoning-effort", EFFORT, "--output-format", "streaming-json",
      "--no-subagents", "--no-plan", "--disable-web-search", "--tools", "read_file,grep,list_dir",
      "--permission-mode", "bypassPermissions", "--allow", "mcp__raven*", "--allow", "use_tool", "--allow", "search_tool"
    ];
    return { cmd: "grok", args, env, logins, clientHome: home };
  }
  // opencode
  const xdg = (n) => path.join(rowDir, `xdg-${n}`);
  for (const n of ["config", "data", "state", "cache"]) mkdirSync(xdg(n), { recursive: true });
  mkdirSync(path.join(xdg("config"), "opencode"), { recursive: true });
  mkdirSync(path.join(xdg("data"), "opencode"), { recursive: true });
  link(opt["opencode-auth"], path.join(xdg("data"), "opencode", "auth.json"));
  logins.push(path.join(xdg("data"), "opencode", "auth.json"));
  writeFileSync(
    path.join(xdg("config"), "opencode", "opencode.json"),
    JSON.stringify({
      enabled_providers: ["anthropic"],
      small_model: `anthropic/${MODEL}`,
      mcp: { raven: { type: "remote", url: opt["mcp-url"], enabled: true } },
      permission: { websearch: "deny", webfetch: "deny" }
    })
  );
  Object.assign(env, {
    XDG_CONFIG_HOME: xdg("config"), XDG_DATA_HOME: xdg("data"), XDG_STATE_HOME: xdg("state"), XDG_CACHE_HOME: xdg("cache"),
    OPENCODE_DISABLE_CLAUDE_CODE: "1", OPENCODE_DISABLE_PROJECT_CONFIG: "1"
  });
  const args = ["run", "--standalone", "--auto", "--format", "json", "-m", `anthropic/${MODEL}`, prompt];
  return { cmd: "opencode", args, env, logins, clientHome: xdg("data") };
}

function loginsIntact(logins) {
  for (const l of logins) {
    try {
      if (!lstatSync(l).isSymbolicLink()) return false;
    } catch {
      return false;
    }
  }
  return true;
}

async function runChild({ cmd, args, env }, work, rowDir) {
  const so = openSync(path.join(rowDir, "stdout.jsonl"), "w");
  const se = openSync(path.join(rowDir, "stderr.txt"), "w");
  const startedAt = Date.now();
  const child = spawn(cmd, args, { cwd: work, env, stdio: ["ignore", so, se], detached: true });
  closeSync(so);
  closeSync(se);
  let killed = null;
  const term = setTimeout(() => {
    killed = "SIGTERM";
    try { process.kill(-child.pid, "SIGTERM"); } catch {}
  }, TIMEOUT_MS);
  const hard = setTimeout(() => {
    killed = "SIGKILL";
    try { process.kill(-child.pid, "SIGKILL"); } catch {}
  }, TIMEOUT_MS + KILL_GRACE_MS);
  const [exit, signal] = await new Promise((resolve) => {
    child.on("error", () => resolve([null, "spawn-error"]));
    child.on("close", (code, sig) => resolve([code, sig]));
  });
  clearTimeout(term);
  clearTimeout(hard);
  return { exit, signal, killed, startedAt, endedAt: Date.now() };
}

async function oneRun(label, question, ledger, { smoke }) {
  const rowDir = path.join(OUT, smoke ? "smoke" : "rows", label);
  if (existsSync(path.join(rowDir, "result.json"))) throw new Error(`${label} already ran; never re-run a row`);
  mkdirSync(rowDir, { recursive: true });
  const work = path.join(opt["work-root"], CLIENT, smoke ? "smoke" : label);
  rmSync(work, { recursive: true, force: true });
  mkdirSync(work, { recursive: true });
  assertOutsideRepo(work);
  const prompt = smoke ? SMOKE_PROMPT : PROMPT_HEAD + question;
  const sp = buildSpawn(prompt, rowDir, work);
  const run = await runChild(sp, work, rowDir);
  const intact = loginsIntact(sp.logins);
  const parsed = parseClientOutput(CLIENT, { rowDir, clientHome: sp.clientHome });
  const cost = costOf(CLIENT, parsed.usage, prices[MODEL]);
  const result = {
    label, client: CLIENT, model: MODEL, effort: EFFORT, smoke,
    startedAt: new Date(run.startedAt).toISOString(), endedAt: new Date(run.endedAt).toISOString(),
    wallMs: run.endedAt - run.startedAt, exit: run.exit, signal: run.signal, killed: run.killed,
    usage: parsed.usage, identityOk: parsed.identityOk, costUsd: cost, hasAnswer: Boolean(parsed.answer),
    loginsIntact: intact
  };
  writeFileSync(path.join(rowDir, "answer.txt"), parsed.answer ?? "");
  writeFileSync(path.join(rowDir, "result.json"), `${JSON.stringify(result, null, 2)}\n`);
  return { result, parsed };
}

function costForLedger(result, ledger) {
  if (result.killed || result.costUsd == null) return Math.max(ledger.largest, result.costUsd ?? 0, 0.4);
  return result.costUsd;
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const ledgerPath = path.join(OUT, "ledger.json");
  const ledger = existsSync(ledgerPath)
    ? JSON.parse(readFileSync(ledgerPath, "utf8"))
    : { client: CLIENT, model: MODEL, effort: EFFORT, capUsd: CAP, spent: 0, largest: 0, rows: [], stopped: null, smoke: null, promptHeadSha256: sha256(PROMPT_HEAD) };
  const save = () => writeFileSync(ledgerPath, `${JSON.stringify(ledger, null, 2)}\n`);
  if (opt.smoke) {
    const { result } = await oneRun("smoke", "", ledger, { smoke: true });
    ledger.smoke = result;
    const c = costForLedger(result, ledger);
    ledger.spent += c;
    ledger.largest = Math.max(ledger.largest, c);
    save();
    console.log(JSON.stringify(result, null, 2));
    return;
  }
  const rows = JSON.parse(readFileSync(opt.rows, "utf8"));
  const cases = JSON.parse(readFileSync(opt.cases, "utf8")).cases;
  const selected = selectById(cases, rows.ids, rows.ids.length, "cases");
  const byId = new Map(selected.map((c) => [c.id, c.question]));
  const limit = opt["rows-limit"] ? Number(opt["rows-limit"]) : rows.ids.length;
  for (const id of rows.ids.slice(0, limit)) {
    if (ledger.rows.some((r) => r.id === id)) continue;
    const reserve = 1.5 * (ledger.largest || 0.4);
    if (ledger.spent + reserve > CAP) {
      ledger.stopped = `cap stop before ${id}: spent ${ledger.spent.toFixed(4)} + 1.5 x largest ${(ledger.largest || 0.4).toFixed(4)} would pass ${CAP}`;
      save();
      console.log(ledger.stopped);
      return;
    }
    const { result } = await oneRun(id, byId.get(id), ledger, { smoke: false });
    const c = costForLedger(result, ledger);
    ledger.spent += c;
    ledger.largest = Math.max(ledger.largest, c);
    ledger.rows.push({ id, costUsd: c, estimated: Boolean(result.killed || result.costUsd == null), wallMs: result.wallMs, exit: result.exit, killed: result.killed });
    save();
    console.log(`${ledger.rows.length}/${rows.ids.length} ${id} cost=${c.toFixed(4)} spent=${ledger.spent.toFixed(4)} wall=${Math.round(result.wallMs / 1000)}s exit=${result.exit}`);
    if (!result.loginsIntact) {
      ledger.stopped = `login symlink replaced after ${id}; client stopped`;
      save();
      console.log(ledger.stopped);
      return;
    }
  }
  console.log(`done: ${ledger.rows.length} rows, spent ${ledger.spent.toFixed(4)}`);
}

main().catch((e) => {
  console.error(e.stack ?? String(e));
  process.exit(1);
});
