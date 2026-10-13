#!/usr/bin/env node
// Counts the 2026-10-12 call patterns in saved QA or Playground result files.
// Usage: node count-patterns.mjs [--manifest catalog/manifest.json] [--rows] <result.json>...
// Reads files only; makes no model or service call. Per file, it reports:
//   - stellarDocs.* call expressions and how many omit a required top-level input
//     (from the manifest), plus the opaque ones it cannot decide (spread or a
//     non-literal argument);
//   - `[invalid-args: …]` entries in execute results (the host's own record);
//   - search results whose clipped card carries the required-input marker;
//   - execute calls, execute errors, skill.read scripts, and section-read scripts;
//   - section-guard messages in execute results.
// Misread classes still need a direct read of each section-read script; this
// helper lists the candidates (--rows) but does not classify them.
import { readFileSync } from "node:fs";

const GUARD_MESSAGES = [
  "codemode.skill.read: a section is an object, not a string",
  "codemode.skill.read: r.data.sections is not keyed by section"
];
const CLIP_MARKER = /\[middle clipped for the demo\] required input: ([^\n]+)/g;
const INVALID_ARGS = /\[invalid-args: ([^\]]+)\]/g;

const args = process.argv.slice(2);
const manifestIndex = args.indexOf("--manifest");
const manifestPath = manifestIndex >= 0 ? args[manifestIndex + 1] : "catalog/manifest.json";
const showRows = args.includes("--rows");
const files = args.filter((arg, index) => !arg.startsWith("--") && args[index - 1] !== "--manifest");
if (files.length === 0 || !manifestPath) {
  console.error("usage: node count-patterns.mjs [--manifest catalog/manifest.json] [--rows] <result.json>...");
  process.exit(2);
}

const required = new Map();
for (const entry of JSON.parse(readFileSync(manifestPath, "utf8")).entries) {
  if (entry.service === "stellarDocs" && entry.kind === "operation") {
    required.set(entry.id.slice("stellarDocs.".length), entry.inputSchema?.required ?? []);
  }
}

// Returns the text between the parenthesis at `open` and its match, skipping
// string literals, template literals, and comments.
function argumentText(code, open) {
  let depth = 0;
  for (let i = open; i < code.length; i++) {
    const ch = code[i];
    if (ch === '"' || ch === "'" || ch === "`") {
      for (i++; i < code.length && code[i] !== ch; i++) if (code[i] === "\\") i++;
    } else if (ch === "/" && code[i + 1] === "/") {
      while (i < code.length && code[i] !== "\n") i++;
    } else if (ch === "/" && code[i + 1] === "*") {
      i = code.indexOf("*/", i + 2);
      if (i < 0) return null;
      i++;
    } else if (ch === "(") depth++;
    else if (ch === ")" && --depth === 0) return code.slice(open + 1, i);
  }
  return null;
}

const stripStrings = (text) =>
  text.replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`/g, '""');

function docsCalls(code) {
  const calls = [];
  for (const match of code.matchAll(/\bstellarDocs\.(\w+)\s*\(/g)) {
    const op = match[1];
    const text = argumentText(code, match.index + match[0].length - 1);
    const needed = required.get(op) ?? [];
    const bare = text === null ? null : stripStrings(text).trim();
    let state = "present";
    if (needed.length === 0) state = "none-required";
    else if (bare === null || !bare.startsWith("{") || bare.includes("...")) state = "opaque";
    else {
      const missing = needed.filter((key) => !new RegExp(`(^|[{,\\s])["']?${key}["']?\\s*[:,}]`).test(bare));
      if (missing.length > 0) state = `missing: ${missing.join(", ")}`;
    }
    calls.push({ op, state, args: text === null ? null : text.trim().slice(0, 120) });
  }
  return calls;
}

function sectionRead(code) {
  for (const match of code.matchAll(/codemode\.skill\.read\s*\(/g)) {
    const text = argumentText(code, match.index + match[0].length - 1);
    if (text !== null && /\bsections\b/.test(stripStrings(text))) return true;
  }
  return false;
}

function codeOf(entry) {
  try {
    return JSON.parse(entry.input).code ?? "";
  } catch {
    return typeof entry.input === "string" ? entry.input : "";
  }
}

for (const file of files) {
  const result = JSON.parse(readFileSync(file, "utf8"));
  const total = {
    rows: result.rows.length, docsCalls: 0, docsMissing: 0, docsOpaque: 0, invalidArgs: 0,
    markedSearchResults: 0, executeCalls: 0, executeErrors: 0, skillReadScripts: 0,
    sectionReadScripts: 0, guardMessages: 0
  };
  const rows = [];
  for (const row of result.rows) {
    const out = { id: row.id, docsMissing: [], invalidArgs: [], markers: [], sectionReadScripts: [], guardMessages: 0 };
    (row.transcript ?? []).forEach((entry, index) => {
      const resultText = typeof entry.result === "string" ? entry.result : JSON.stringify(entry.result ?? "");
      if (/search$/.test(entry.tool)) {
        const markers = [...resultText.matchAll(CLIP_MARKER)].map((m) => m[1].trim());
        if (markers.length > 0) {
          total.markedSearchResults++;
          out.markers.push(...markers);
        }
        return;
      }
      if (!/execute$/.test(entry.tool)) return;
      total.executeCalls++;
      if (entry.isError) total.executeErrors++;
      const code = codeOf(entry);
      for (const call of docsCalls(code)) {
        if (call.state === "none-required") continue;
        total.docsCalls++;
        if (call.state === "opaque") total.docsOpaque++;
        if (call.state.startsWith("missing")) {
          total.docsMissing++;
          out.docsMissing.push({ index, op: call.op, state: call.state, args: call.args });
        }
      }
      for (const m of resultText.matchAll(INVALID_ARGS)) {
        total.invalidArgs++;
        out.invalidArgs.push({ index, fields: m[1] });
      }
      if (/codemode\.skill\.read\s*\(/.test(code)) total.skillReadScripts++;
      if (sectionRead(code)) {
        total.sectionReadScripts++;
        out.sectionReadScripts.push(index);
      }
      const guards = GUARD_MESSAGES.reduce((n, message) => n + resultText.split(message).length - 1, 0);
      total.guardMessages += guards;
      out.guardMessages += guards;
    });
    if (out.docsMissing.length || out.invalidArgs.length || out.markers.length || out.sectionReadScripts.length || out.guardMessages) {
      rows.push(out);
    }
  }
  console.log(JSON.stringify({ file, total, ...(showRows ? { rows } : {}) }, null, showRows ? 2 : 0));
}
