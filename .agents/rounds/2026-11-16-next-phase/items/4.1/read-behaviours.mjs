#!/usr/bin/env node
/**
 * Item 4.1 step 6: read the four behaviours of one client from the tap log and the client's own
 * logs. No model call, no network.
 *
 * Usage: node read-behaviours.mjs --client codex|grok|opencode --dir <tmp/4.1/client>
 *                                 [--smoke] [--rows rows.json] [--cases eval/qa/cases.json]
 *                                 [--summary <summary-client.json>]
 *
 * Output: <dir>/behaviours.json (row level, may name paths and counts) and, with --summary, a
 * counts-only summary that holds row ids and counts and no question, golden or lost-candidate text.
 * The golden is read only by the B3 section, only for the rows in rows.json.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { findFiles, readJsonl } from "./client-parse.mjs";
import { answerCandidates, norm as candNorm, occurrences } from "./candidates.mjs";
import { selectById } from "../../../../../eval/qa/tuning-rows.mjs";

const { values: opt } = parseArgs({
  options: {
    client: { type: "string" }, dir: { type: "string" }, smoke: { type: "boolean", default: false },
    rows: { type: "string" }, cases: { type: "string", default: "eval/qa/cases.json" }, summary: { type: "string" }
  }
});
const CLIENT = opt.client;
const DIR = path.resolve(opt.dir);

// ---- text normalization (plan step 6, B1): JSON escapes decoded, whitespace collapsed ---------
const ESC = { '"': '"', "\\": "\\", "/": "/", b: "\b", f: "\f", n: "\n", r: "\r", t: "\t" };
const unescapeJson = (s) => s.replace(/\\(u[0-9a-fA-F]{4}|["\\/bfnrt])/g, (_, e) => (e[0] === "u" ? String.fromCharCode(parseInt(e.slice(1), 16)) : ESC[e]));
export const norm = (s) => unescapeJson(String(s)).replace(/\s+/g, " ").trim();

/** Every string value nested in a JSON value. */
function strings(v, out = []) {
  if (typeof v === "string") out.push(v);
  else if (Array.isArray(v)) for (const x of v) strings(x, out);
  else if (v && typeof v === "object") for (const x of Object.values(v)) strings(x, out);
  return out;
}

// ---- the tap -----------------------------------------------------------------------------------
const tapAll = readJsonl(path.join(DIR, "tap.jsonl"));
function tapWindow(result) {
  const t0 = Date.parse(result.startedAt) - 500;
  const t1 = Date.parse(result.endedAt) + 3000;
  return tapAll.filter((e) => Date.parse(e.t) >= t0 && Date.parse(e.t) <= t1);
}
const rpcResult = (e) => (e.messages ?? []).find((m) => m.result || m.error);

function surfaceProbes(window) {
  // Grok speaks the 2026-07-28 protocol: `server/discover` replaces `initialize`.
  const init = window.find((e) => (e.rpcMethod === "initialize" || e.rpcMethod === "server/discover") && rpcResult(e)?.result);
  const list = window.find((e) => e.rpcMethod === "tools/list" && rpcResult(e)?.result);
  const tools = rpcResult(list ?? {})?.result?.tools ?? [];
  const tail = (s) => (s ? norm(s).slice(-60) : null);
  const head = (s) => (s ? norm(s).slice(0, 60) : null);
  const byName = Object.fromEntries(tools.map((t) => [t.name, t.description ?? ""]));
  return {
    search: { head: head(byName.search), tail: tail(byName.search) },
    execute: { head: head(byName.execute), tail: tail(byName.execute) },
    instructions: { tail: tail(rpcResult(init ?? {})?.result?.instructions) },
    toolNames: tools.map((t) => t.name)
  };
}

// ---- what the model received, per client --------------------------------------------------------
function receivedText(rowDir, clientHome) {
  const parts = [];
  if (CLIENT === "codex") {
    const rollout = findFiles(path.join(clientHome, "sessions"), (p) => /rollout-.*\.jsonl$/.test(p))[0];
    for (const o of readJsonl(rollout ?? "")) if (o.type === "response_item") strings(o.payload, parts);
  } else if (CLIENT === "grok") {
    const hist = findFiles(path.join(clientHome, "sessions"), (p) => p.endsWith("chat_history.jsonl"))[0];
    for (const o of readJsonl(hist ?? "")) if (["system", "user", "tool_result"].includes(o.type)) strings(o.content, parts);
  } else {
    for (const s of dbStrings(clientHome)) parts.push(s);
  }
  return norm(parts.join("\n"));
}

/** OpenCode: every text cell of opencode.db, JSON cells flattened. Unknown schema, so generic. */
function dbStrings(clientHome) {
  const db = findFiles(clientHome, (p) => p.endsWith("opencode.db"))[0];
  if (!db) return [];
  const out = [];
  const { DatabaseSync } = require_sqlite();
  const h = new DatabaseSync(db, { readOnly: true });
  for (const { name } of h.prepare("select name from sqlite_master where type='table'").all()) {
    for (const row of h.prepare(`select * from "${name}"`).all()) {
      for (const v of Object.values(row)) {
        if (typeof v !== "string") continue;
        try { strings(JSON.parse(v), out); } catch { out.push(v); }
      }
    }
  }
  h.close();
  return out;
}
let sqliteMod;
function require_sqlite() {
  if (!sqliteMod) sqliteMod = process.getBuiltinModule("node:sqlite");
  return sqliteMod;
}

function b1(received, probes) {
  const has = (s) => (s ? received.includes(s) : false);
  const fullSearch = has(probes.search.tail);
  const fullExecute = has(probes.execute.tail);
  const headSearch = has(probes.search.head);
  const headExecute = has(probes.execute.head);
  let cls = "none";
  if (fullSearch && fullExecute) cls = "full";
  else if (fullSearch || fullExecute || headSearch || headExecute) cls = "partial";
  return { class: cls, searchTail: fullSearch, executeTail: fullExecute, searchHead: headSearch, executeHead: headExecute, instructionsTail: has(probes.instructions.tail) };
}

// ---- B2 and B4 from the tap --------------------------------------------------------------------
function b2(window) {
  const calls = window.filter((e) => e.rpcMethod === "tools/call" && e.tool === "search");
  const limits = calls.map((e) => e.arguments?.limit).filter((v) => v !== undefined);
  return { searchCalls: calls.length, callsWithLimit: limits.length, limitValues: limits };
}

function b4tap(window) {
  const calls = window.filter((e) => e.rpcMethod === "tools/call");
  const httpErrors = window.filter((e) => e.status >= 400 || e.tapError).map((e) => ({ method: e.rpcMethod ?? e.httpMethod, path: e.path, status: e.status }));
  const rpcErrors = window.filter((e) => (e.messages ?? []).some((m) => m.error)).map((e) => e.rpcMethod);
  const isError = calls.filter((e) => (e.messages ?? []).some((m) => m.result?.isError === true)).length;
  const execFailed = calls.filter((e) => (e.messages ?? []).some((m) => strings(m.result).some((s) => s.includes("Execution failed")))).length;
  const status = (m) => window.find((e) => e.rpcMethod === m)?.status ?? null;
  return {
    handshakeMethod: window.find((e) => e.rpcMethod === "initialize" || e.rpcMethod === "server/discover")?.rpcMethod ?? null,
    initializeStatus: status("initialize") ?? status("server/discover"), toolsListStatus: status("tools/list"),
    toolsCalls: calls.length, executeCalls: calls.filter((e) => e.tool === "execute").length,
    httpErrors, rpcErrors, isErrorResults: isError, executionFailedResults: execFailed
  };
}


// ---- the client's tool calls and outputs, per client ---------------------------------------------
/**
 * One normalized list per row: calls `{ name, input }` the model made, outputs `{ text }` the client
 * log shows it received, and the client-side error evidence.
 */
function clientRecord(rowDir, clientHome, result) {
  const rec = { calls: [], outputs: [], errors: [], webCalls: 0, otherMcpCalls: [], subagentCalls: 0, refusals: 0 };
  if (CLIENT === "grok") {
    const hist = findFiles(path.join(clientHome, "sessions"), (p) => p.endsWith("chat_history.jsonl"))[0];
    for (const o of readJsonl(hist ?? "")) {
      if (o.type === "assistant") {
        for (const tc of o.tool_calls ?? []) {
          let input = {};
          try { input = JSON.parse(tc.arguments); } catch {}
          rec.calls.push({ id: tc.id, name: tc.name, input });
          if (tc.name === "use_tool" && !String(input.tool_name ?? "").startsWith("raven__")) rec.otherMcpCalls.push(String(input.tool_name));
          if (/web|fetch|browse/i.test(tc.name)) rec.webCalls++;
          if (/subagent|task/i.test(tc.name)) rec.subagentCalls++;
        }
      } else if (o.type === "tool_result") {
        const text = typeof o.content === "string" ? o.content : strings(o.content).join("\n");
        rec.outputs.push({ id: o.tool_call_id, text });
        if (/permission|denied|not allowed|refus/i.test(text.slice(0, 200))) rec.refusals++;
      }
    }
    for (const e of readJsonl(path.join(rowDir, "stdout.jsonl"))) {
      if (e.type === "error") rec.errors.push(String(e.message ?? e.data ?? "error").slice(0, 160));
      if (e.type === "tool_call_update" && e.status === "failed") rec.errors.push("tool_call failed");
    }
  } else if (CLIENT === "codex") {
    const rollout = findFiles(path.join(clientHome, "sessions"), (p) => /rollout-.*\.jsonl$/.test(p))[0];
    for (const o of readJsonl(rollout ?? "")) {
      const p = o.payload;
      if (o.type !== "response_item") continue;
      if (p.type === "custom_tool_call" || p.type === "function_call") {
        const input = typeof p.input === "string" ? p.input : String(p.arguments ?? "");
        rec.calls.push({ id: p.call_id, name: p.name, input: { code: input } });
        for (const m of input.matchAll(/tools\.([A-Za-z0-9_]+)/g)) {
          if (!m[1].startsWith("mcp__raven__") && m[1] !== "exec_command") rec.otherMcpCalls.push(m[1]);
        }
        if (/spawn_agent|followup_task|send_message/.test(p.name + input)) rec.subagentCalls++;
      } else if (p.type === "custom_tool_call_output" || p.type === "function_call_output") {
        const out = p.output;
        rec.outputs.push({ id: p.call_id, text: Array.isArray(out) ? out.map((x) => x.text ?? "").join("\n") : String(out) });
      } else if (p.type === "web_search_call") rec.webCalls++;
    }
    for (const e of readJsonl(path.join(rowDir, "stdout.jsonl"))) {
      if (e.type === "error" || (e.type === "item.completed" && e.item?.type === "error")) rec.errors.push(String(e.message ?? e.item?.message ?? "error").slice(0, 160));
      if (e.type === "item.completed" && e.item?.type === "mcp_tool_call" && e.item.error) rec.errors.push(`mcp error: ${JSON.stringify(e.item.error).slice(0, 120)}`);
    }
  } else {
    // OpenCode: `part` rows with a tool state. Best effort until a Mac row shows the exact schema.
    const db = findFiles(clientHome, (p) => p.endsWith("opencode.db"))[0];
    if (db) {
      const { DatabaseSync } = require_sqlite();
      const h = new DatabaseSync(db, { readOnly: true });
      let parts = [];
      try { parts = h.prepare("select data from part").all(); } catch {}
      for (const { data } of parts) {
        let d; try { d = JSON.parse(data); } catch { continue; }
        if (d.type === "tool") {
          rec.calls.push({ id: d.callID, name: d.tool, input: d.state?.input ?? {} });
          if (typeof d.state?.output === "string") rec.outputs.push({ id: d.callID, text: d.state.output });
          if (d.state?.status === "error") rec.errors.push(`tool error: ${String(d.state.error ?? "").slice(0, 120)}`);
          if (/web(search|fetch)/i.test(d.tool)) rec.webCalls++;
          if (!/^raven_/.test(d.tool) && !/^(read|glob|grep|list|bash|write|edit)$/.test(d.tool)) rec.otherMcpCalls.push(d.tool);
        }
      }
      h.close();
    }
  }
  return rec;
}

const CLIP = {
  grok: /\n*\[MCP output truncated: showing first ([\d.]+) KB of ([\d.]+) KB\. Full output written to: (\S+?\.txt)\./,
  opencode: /full output saved to:?\s*(\S+)/i,
  codex: /(\d+) tokens truncated/
};

// ---- B3 ----------------------------------------------------------------------------------------
const bytesOf = (s) => Buffer.from(s, "utf8");

function tapResultTexts(window) {
  return window
    .filter((e) => e.rpcMethod === "tools/call")
    .map((e) => ({ tool: e.tool, text: (rpcResult(e)?.result?.content ?? []).map((c) => c.text ?? "").join("") , at: e.t }));
}

function goldenCandidates(golden) {
  const out = new Map(); // normalized candidate -> { source: "keyFact"|"answer" }
  const add = (text, source) => {
    for (const [k] of answerCandidates(String(text ?? ""))) if (!out.has(k) || source === "keyFact") out.set(k, { source });
  };
  add(golden.answer, "answer");
  for (const k of Object.values(golden.keyFacts ?? {})) add(k, "keyFact");
  return out;
}

function b3(rec, window, answer, golden, clientHome) {
  const re = CLIP[CLIENT];
  const taps = tapResultTexts(window);
  const events = [];
  for (const o of rec.outputs) {
    const m = re.exec(o.text);
    if (!m) continue;
    const delivered = o.text.slice(0, m.index);
    const dBytes = bytesOf(delivered);
    // pairing by prefix in UTF-8 bytes; no assumed clip size
    const paired = taps.filter((t) => bytesOf(t.text).subarray(0, dBytes.length).equals(dBytes) && dBytes.length > 0);
    const ev = { paired: paired.length >= 1, ambiguous: paired.length > 1, deliveredBytes: dBytes.length, field: "content[0].text", spillPath: m[3] ?? m[1] ?? null };
    if (ev.paired) {
      const full = bytesOf(paired[0].text);
      ev.fullBytes = full.length;
      ev.lostRegion = full.subarray(dBytes.length).toString("utf8");
    }
    events.push({ ...ev, outputId: o.id });
  }
  const spillReads = [];
  for (const c of rec.calls) {
    const p = String(c.input?.path ?? c.input?.file_path ?? c.input?.filePath ?? "");
    if (p && events.some((e) => e.spillPath && p.includes(path.basename(e.spillPath)))) spillReads.push(p);
  }
  const deliveredAll = candNorm(rec.outputs.map((o) => o.text).join("\n"));
  const normAnswer = candNorm(answer ?? "");
  const cands = golden ? goldenCandidates(golden) : new Map();
  for (const ev of events) {
    ev.lostCandidates = [];
    ev.recoveredCandidates = [];
    ev.candidatesInLostRegion = 0;
    if (!ev.paired) continue;
    const lost = candNorm(ev.lostRegion);
    for (const [cand, meta] of cands) {
      if (occurrences(lost, cand).length === 0) continue;
      ev.candidatesInLostRegion++;
      const inDelivered = occurrences(deliveredAll.replace(candNorm(ev.lostRegion), ""), cand).length > 0;
      const inAnswer = occurrences(normAnswer, cand).length > 0;
      if (!inDelivered && !inAnswer) ev.lostCandidates.push({ cand, source: meta.source });
      if (inDelivered) ev.coveredElsewhere = (ev.coveredElsewhere ?? 0) + 1;
      else if (inAnswer && spillReads.length > 0) ev.recoveredCandidates.push({ cand, source: meta.source });
      else if (inAnswer) ev.statedUndelivered = (ev.statedUndelivered ?? 0) + 1;
    }
  }
  return { events, spillReads, spillReadCount: spillReads.length, goldenCandidateCount: cands.size };
}

// ---- local reads -------------------------------------------------------------------------------
function localReads(rec, rowDir, work) {
  const reads = [];
  for (const c of rec.calls) {
    if (CLIENT === "codex") {
      if (c.name === "exec" && /tools\.exec_command/.test(c.input.code)) reads.push(c.input.code.slice(0, 240));
    } else {
      const p = c.input?.path ?? c.input?.file_path ?? c.input?.filePath ?? c.input?.pattern ?? c.input?.command;
      if (p && !/^(search_tool|use_tool)$/.test(c.name) && !/^raven_/.test(c.name)) reads.push(`${c.name}: ${String(p).slice(0, 200)}`);
    }
  }
  const spillOk = (r) => r.includes(rowDir) || r.includes(work) || /\/mcp\/call-/.test(r) || /tool-output|spill/i.test(r);
  const other = reads.filter((r) => !spillOk(r));
  const contaminated = other.some((r) => /cases\.json|\/home\/tyler\/code|\.agents|golden|eval\/|AGENTS\.md|CLAUDE\.md/.test(r));
  return { reads, otherReads: other.length, contaminated };
}

export { tapWindow, surfaceProbes, receivedText, b1, b2, b4tap, strings, tapAll, rpcResult };

// ---- driver ------------------------------------------------------------------------------------
if (import.meta.url === `file://${process.argv[1]}`) {
  const rowsFile = opt.rows ? JSON.parse(readFileSync(opt.rows, "utf8")) : null;
  const labels = opt.smoke ? ["smoke"] : rowsFile.ids;
  let goldenOf = new Map();
  if (!opt.smoke) {
    const cases = JSON.parse(readFileSync(opt.cases, "utf8")).cases;
    goldenOf = new Map(selectById(cases, rowsFile.ids, rowsFile.ids.length, "cases").map((c) => [c.id, c.golden]));
  }
  const base = path.join(DIR, opt.smoke ? "smoke" : "rows");
  const out = {};
  for (const label of labels) {
    const rowDir = path.join(base, opt.smoke ? "smoke" : label);
    if (!existsSync(path.join(rowDir, "result.json"))) continue;
    const result = JSON.parse(readFileSync(path.join(rowDir, "result.json"), "utf8"));
    const clientHome = path.join(rowDir, { codex: "codexhome", grok: "grokhome", opencode: "xdg-data" }[CLIENT]);
    const work = path.join(process.env.HOME ?? "", ".cache", "raven-4.1", "work", CLIENT, opt.smoke ? "smoke" : label);
    const window = tapWindow(result);
    const probes = surfaceProbes(window);
    const rec = clientRecord(rowDir, clientHome, result);
    const answer = readFileSync(path.join(rowDir, "answer.txt"), "utf8");
    const tapB4 = b4tap(window);
    const reads = localReads(rec, rowDir, work);
    const row = {
      b1: b1(receivedText(rowDir, clientHome), probes),
      b2: b2(window),
      b3: opt.smoke ? null : b3(rec, window, answer, goldenOf.get(label), clientHome),
      b4: {
        ...tapB4, clientErrors: rec.errors.length, refusedApprovals: rec.refusals, webCalls: rec.webCalls,
        nonRavenCalls: rec.otherMcpCalls.length, subagentCalls: rec.subagentCalls, noFinalAnswer: !result.hasAnswer,
        killed: result.killed, exit: result.exit, wallMs: result.wallMs
      },
      localReads: reads
    };
    out[label] = row;
  }
  writeFileSync(path.join(DIR, opt.smoke ? "behaviours-smoke.json" : "behaviours.json"), `${JSON.stringify(out, null, 2)}\n`);
  if (opt.summary) writeFileSync(opt.summary, `${JSON.stringify(summarize(out, rowsFile), null, 2)}\n`);
  if (opt.smoke) console.log(JSON.stringify(out, null, 2));
  else console.log(JSON.stringify(summarize(out, rowsFile).totals, null, 2));
}

/** Counts-only summary: tuning ids and numbers, no question, golden or candidate text. */
function summarize(out, rowsFile) {
  const labels = Object.keys(out);
  const t = { rowsRun: labels.length, b1: { full: 0, partial: 0, none: 0, instructionsReached: 0 }, b2: { searchCalls: 0, callsWithLimit: 0, rowsWithLimit: 0, limitValues: {} },
    b3: { coveredElsewhere: 0, statedWithoutDelivery: 0, candidatesInLostRegion: 0, clipEvents: 0, rowsWithClip: 0, paired: 0, notCheckable: 0, rowsFlaggedLost: 0, lostCandidatesNeeded: 0, lostCandidatesIncidental: 0, rowsNeededLost: 0, recoveredEvents: 0, spillReads: 0 },
    b4: { rowsWithHttpError: 0, rpcErrors: 0, isErrorResults: 0, executionFailedResults: 0, clientErrors: 0, refusedApprovals: 0, webCalls: 0, nonRavenCalls: 0, subagentCalls: 0, noFinalAnswer: 0, killed: 0, nonZeroExit: 0 },
    contaminatedRows: 0 };
  const rows = {};
  for (const id of labels) {
    const r = out[id];
    const contaminated = r.localReads.contaminated;
    t.b1[r.b1.class]++; if (r.b1.instructionsTail) t.b1.instructionsReached++;
    t.b2.searchCalls += r.b2.searchCalls; t.b2.callsWithLimit += r.b2.callsWithLimit; if (r.b2.callsWithLimit) t.b2.rowsWithLimit++;
    for (const v of r.b2.limitValues) t.b2.limitValues[v] = (t.b2.limitValues[v] ?? 0) + 1;
    let needed = 0, incidental = 0, recovered = 0, clips = 0, paired = 0;
    if (r.b3) t.b3.goldenCandidates = (t.b3.goldenCandidates ?? 0) + r.b3.goldenCandidateCount;
    if (r.b3) {
      for (const e of r.b3.events) {
        clips++; if (e.paired) paired++;
        t.b3.candidatesInLostRegion += e.candidatesInLostRegion ?? 0;
        t.b3.statedWithoutDelivery += e.statedUndelivered ?? 0;
        t.b3.coveredElsewhere += e.coveredElsewhere ?? 0;
        for (const c of e.lostCandidates) (c.source === "keyFact" ? needed++ : incidental++);
        if (e.recoveredCandidates.length) recovered++;
      }
      if (!contaminated) {
        t.b3.clipEvents += clips; t.b3.paired += paired; t.b3.notCheckable += clips - paired;
        if (clips) t.b3.rowsWithClip++;
        t.b3.lostCandidatesNeeded += needed; t.b3.lostCandidatesIncidental += incidental; t.b3.recoveredEvents += recovered; t.b3.spillReads += r.b3.spillReadCount;
        if (needed + incidental > 0) t.b3.rowsFlaggedLost++;
        if (needed > 0) t.b3.rowsNeededLost++;
      }
    }
    if (contaminated) t.contaminatedRows++;
    const b4 = r.b4;
    if (b4.httpErrors.length) t.b4.rowsWithHttpError++;
    t.b4.rpcErrors += b4.rpcErrors.length; t.b4.isErrorResults += b4.isErrorResults; t.b4.executionFailedResults += b4.executionFailedResults;
    t.b4.clientErrors += b4.clientErrors; t.b4.refusedApprovals += b4.refusedApprovals; t.b4.webCalls += b4.webCalls; t.b4.nonRavenCalls += b4.nonRavenCalls;
    t.b4.subagentCalls += b4.subagentCalls; if (b4.noFinalAnswer) t.b4.noFinalAnswer++; if (b4.killed) t.b4.killed++; if (b4.exit !== 0) t.b4.nonZeroExit++;
    rows[id] = { goldenCandidates: r.b3?.goldenCandidateCount ?? null, b1: r.b1.class, instructions: r.b1.instructionsTail, searchCalls: r.b2.searchCalls, withLimit: r.b2.callsWithLimit, executeCalls: b4.executeCalls,
      clipEvents: clips, paired, lostNeeded: needed, lostIncidental: incidental, recovered, contaminated,
      errors: b4.httpErrors.length + b4.rpcErrors.length + b4.isErrorResults + b4.executionFailedResults + b4.clientErrors, noFinalAnswer: b4.noFinalAnswer, wallS: Math.round(b4.wallMs / 1000) };
  }
  return { client: CLIENT, splitSha256: rowsFile?.splitSha256 ?? null, totals: t, rows };
}
