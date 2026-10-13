#!/usr/bin/env node
// Counts the 2026-10-12 call patterns in saved QA or Playground result files.
// Usage:
//   node count-patterns.mjs [--manifest catalog/manifest.json] [--rows] <result.json>...
//   node count-patterns.mjs --self-check
// Run it with the working directory at a repository checkout: acorn and the
// default manifest resolve from there, so a pinned copy of this file can live
// outside that checkout. Reads files only; makes no model or service call.
//
// Each execute script is parsed with acorn. Per file, it reports:
//   - stellarDocs.* calls and how many omit a required top-level input (from the
//     manifest). A call whose argument the parser cannot resolve (a spread, a
//     computed key, a non-literal argument, an unknown operation) is `unknown`;
//     so is a `stellarDocs` reference that is not a direct call;
//   - `[invalid-args: …]` entries in execute results (the host's own record);
//   - search results whose clipped card carries the required-input marker;
//   - execute calls and errors, skill.read scripts, section-read scripts, and
//     scripts whose skill.read options the parser cannot resolve;
//   - scripts that do not parse (every count in them is unknown);
//   - section-guard messages in execute results.
// Readers inspect every unknown and unparsed script before they assign exposure
// or compute a rate. Misread classes still need a direct read of each script.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const { parse, parseExpressionAt } = createRequire(path.join(process.cwd(), "package.json"))("acorn");

const GUARD_MESSAGES = [
  "codemode.skill.read: a section is an object, not a string",
  "codemode.skill.read: r.data.sections is not keyed by section"
];
const CLIP_MARKER = /\[middle clipped for the demo\] required input: ([^\n]+)/g;
const INVALID_ARGS = /\[invalid-args: ([^\]]+)\]/g;
const SKILL_READ_TEXT = /\bskill\s*\.\s*read\b|\bread\s*[,}][^;]*=\s*codemode\s*\.\s*skill\b/;

function parseScript(code) {
  const options = { ecmaVersion: "latest", allowAwaitOutsideFunction: true, allowReturnOutsideFunction: true };
  try {
    return parseExpressionAt(code.trimStart(), 0, options);
  } catch {
    try {
      return parse(code, { ...options, sourceType: "module" });
    } catch {
      return null;
    }
  }
}

function walk(node, visit) {
  if (!node || typeof node.type !== "string") return;
  visit(node);
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) for (const item of value) walk(item, visit);
    else if (value && typeof value === "object" && typeof value.type === "string") walk(value, visit);
  }
}

// `a.b["c"]` → ["a", "b", "c"]; null when any step is not a literal name.
function memberPath(node) {
  if (node.type === "ChainExpression") return memberPath(node.expression);
  if (node.type === "Identifier") return [node.name];
  if (node.type !== "MemberExpression") return null;
  const head = memberPath(node.object);
  if (!head) return null;
  if (!node.computed && node.property.type === "Identifier") return [...head, node.property.name];
  if (node.computed && node.property.type === "Literal" && typeof node.property.value === "string") {
    return [...head, node.property.value];
  }
  return null;
}

function rootIdentifier(node) {
  if (node.type === "ChainExpression") return rootIdentifier(node.expression);
  if (node.type === "MemberExpression") return rootIdentifier(node.object);
  return node.type === "Identifier" ? node : null;
}

// Top-level literal keys of an object expression, and whether any key is unresolved.
function objectKeys(node) {
  const keys = new Set();
  let unresolved = false;
  for (const prop of node.properties) {
    if (prop.type !== "Property") {
      unresolved = true;
      continue;
    }
    if (!prop.computed && prop.key.type === "Identifier") keys.add(prop.key.name);
    else if (prop.key.type === "Literal") keys.add(String(prop.key.value));
    else unresolved = true;
  }
  return { keys, unresolved };
}

function docsState(op, arg, required) {
  const needed = required.get(op);
  if (!needed) return { state: "unknown", reason: "unknown operation" };
  if (needed.length === 0) return { state: "none-required" };
  if (!arg) return { state: "missing", missing: needed };
  if (arg.type !== "ObjectExpression") return { state: "unknown", reason: "non-literal argument" };
  const { keys, unresolved } = objectKeys(arg);
  const missing = needed.filter((key) => !keys.has(key));
  if (missing.length === 0) return { state: "present" };
  if (unresolved) return { state: "unknown", reason: "spread or computed key" };
  return { state: "missing", missing };
}

function skillReadState(options) {
  if (!options) return "whole";
  if (options.type !== "ObjectExpression") return "unknown";
  const { keys, unresolved } = objectKeys(options);
  if (keys.has("sections")) return "sections";
  return unresolved ? "unknown" : "whole";
}

export function analyzeScript(code, required) {
  const out = { parsed: true, docs: [], skillReads: [], unresolvedDocsRefs: 0 };
  const ast = parseScript(code);
  if (!ast) {
    out.parsed = false;
    return out;
  }
  const resolvedDocsRoots = new Set();
  walk(ast, (node) => {
    if (node.type !== "CallExpression") return;
    const callee = memberPath(node.callee);
    if (!callee) return;
    if (callee.length === 2 && callee[0] === "stellarDocs") {
      resolvedDocsRoots.add(rootIdentifier(node.callee));
      out.docs.push({ op: callee[1], text: code.slice(node.start, node.end).slice(0, 160), ...docsState(callee[1], node.arguments[0], required) });
    } else if (callee.join(".") === "codemode.skill.read") {
      out.skillReads.push(skillReadState(node.arguments[1]));
    }
  });
  walk(ast, (node) => {
    if (node.type === "Identifier" && node.name === "stellarDocs" && !resolvedDocsRoots.has(node)) out.unresolvedDocsRefs++;
  });
  if (out.skillReads.length === 0 && SKILL_READ_TEXT.test(code)) out.skillReads.push("unknown");
  return out;
}

function codeOf(entry) {
  try {
    return JSON.parse(entry.input).code ?? "";
  } catch {
    return typeof entry.input === "string" ? entry.input : "";
  }
}

function countFile(file, required) {
  const result = JSON.parse(readFileSync(file, "utf8"));
  const total = {
    rows: result.rows.length, docsCalls: 0, docsMissing: 0, docsUnknown: 0, unresolvedDocsRefs: 0,
    invalidArgs: 0, markedSearchResults: 0, executeCalls: 0, executeErrors: 0, unparsedScripts: 0,
    skillReadScripts: 0, sectionReadScripts: 0, unknownSkillReadScripts: 0, guardMessages: 0
  };
  const rows = [];
  for (const row of result.rows) {
    const out = {
      id: row.id, docsMissing: [], docsUnknown: [], invalidArgs: [], markers: [], unparsedScripts: [],
      sectionReadScripts: [], unknownSkillReadScripts: [], guardMessages: 0
    };
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
      const script = analyzeScript(codeOf(entry), required);
      if (!script.parsed) {
        total.unparsedScripts++;
        out.unparsedScripts.push(index);
      }
      for (const call of script.docs) {
        if (call.state === "none-required") continue;
        total.docsCalls++;
        if (call.state === "missing") {
          total.docsMissing++;
          out.docsMissing.push({ index, op: call.op, missing: call.missing, call: call.text });
        } else if (call.state === "unknown") {
          total.docsUnknown++;
          out.docsUnknown.push({ index, op: call.op, reason: call.reason, call: call.text });
        }
      }
      if (script.unresolvedDocsRefs > 0) {
        total.unresolvedDocsRefs += script.unresolvedDocsRefs;
        out.docsUnknown.push({ index, reason: `${script.unresolvedDocsRefs} unresolved stellarDocs reference(s)` });
      }
      for (const m of resultText.matchAll(INVALID_ARGS)) {
        total.invalidArgs++;
        out.invalidArgs.push({ index, fields: m[1] });
      }
      if (script.skillReads.length > 0) total.skillReadScripts++;
      if (script.skillReads.includes("sections")) {
        total.sectionReadScripts++;
        out.sectionReadScripts.push(index);
      } else if (script.skillReads.includes("unknown")) {
        total.unknownSkillReadScripts++;
        out.unknownSkillReadScripts.push(index);
      }
      const guards = GUARD_MESSAGES.reduce((n, message) => n + resultText.split(message).length - 1, 0);
      total.guardMessages += guards;
      out.guardMessages += guards;
    });
    const listed = [out.docsMissing, out.docsUnknown, out.invalidArgs, out.markers, out.unparsedScripts,
      out.sectionReadScripts, out.unknownSkillReadScripts];
    if (listed.some((list) => list.length > 0) || out.guardMessages) rows.push(out);
  }
  return { file, total, rows };
}

const FIXTURES = [
  // The three review RP fixtures, then edge cases the counts depend on.
  { code: 'async () => stellarDocs.search_docs({"query":"trustline"})', docs: ["present"], skill: [] },
  { code: 'async () => stellarDocs.search_docs({filter:{query:"trustline"}})', docs: ["missing"], skill: [] },
  { code: 'async () => codemode.skill.read("skills.stellar-dev.assets", {"sections":["trustlines"]})', docs: [], skill: ["sections"] },
  { code: "async () => { const query = 'x'; return stellarDocs.search_docs({ query }); }", docs: ["present"], skill: [] },
  { code: 'async () => stellarDocs.search_docs({ query: "a ... b", hitsPerPage: 3 })', docs: ["present"], skill: [] },
  { code: "async () => stellarDocs.search_docs({ hitsPerPage: 3 })", docs: ["missing"], skill: [] },
  { code: "async () => stellarDocs.search_docs({ ...base, hitsPerPage: 3 })", docs: ["unknown"], skill: [] },
  { code: "async () => stellarDocs.search_docs(args)", docs: ["unknown"], skill: [] },
  { code: 'async () => stellarDocs["search_docs"]({ query: "x" })', docs: ["present"], skill: [] },
  { code: 'async () => { const s = "stellarDocs.search_docs({})"; return s; }', docs: [], skill: [] },
  { code: 'async () => codemode.skill.read("skills.x")', docs: [], skill: ["whole"] },
  { code: 'async () => codemode.skill.read("skills.x", opts)', docs: [], skill: ["unknown"] },
  { code: 'async () => { const { read } = codemode.skill; return read("skills.x", { sections: ["a"] }); }', docs: [], skill: ["unknown"] },
  { code: "async () => { stellarDocs.search_docs({ query: 'x' ", parsed: false, docs: [], skill: [] }
];

function selfCheck() {
  const required = new Map([["search_docs", ["query"]]]);
  let failures = 0;
  for (const fixture of FIXTURES) {
    const got = analyzeScript(fixture.code, required);
    const ok = got.parsed === (fixture.parsed ?? true) &&
      JSON.stringify(got.docs.map((d) => d.state)) === JSON.stringify(fixture.docs) &&
      JSON.stringify(got.skillReads) === JSON.stringify(fixture.skill);
    if (!ok) {
      failures++;
      console.error(`self-check FAILED: ${fixture.code}\n  got parsed=${got.parsed} docs=${JSON.stringify(got.docs.map((d) => d.state))} skill=${JSON.stringify(got.skillReads)}`);
    }
  }
  console.error(`self-check: ${FIXTURES.length - failures} of ${FIXTURES.length} fixtures pass`);
  return failures === 0;
}

const args = process.argv.slice(2);
if (args.includes("--self-check")) process.exit(selfCheck() ? 0 : 1);
const manifestIndex = args.indexOf("--manifest");
const manifestPath = manifestIndex >= 0 ? args[manifestIndex + 1] : "catalog/manifest.json";
const showRows = args.includes("--rows");
const files = args.filter((arg, index) => !arg.startsWith("--") && args[index - 1] !== "--manifest");
if (files.length === 0 || !manifestPath) {
  console.error("usage: node count-patterns.mjs [--manifest catalog/manifest.json] [--rows] <result.json>... | --self-check");
  process.exit(2);
}
if (!selfCheck()) process.exit(1);
const required = new Map();
for (const entry of JSON.parse(readFileSync(manifestPath, "utf8")).entries) {
  if (entry.service === "stellarDocs" && entry.kind === "operation") {
    required.set(entry.id.slice("stellarDocs.".length), entry.inputSchema?.required ?? []);
  }
}
for (const file of files) {
  const { total, rows } = countFile(file, required);
  console.log(JSON.stringify({ file, total, ...(showRows ? { rows } : {}) }, null, showRows ? 2 : 0));
}
