#!/usr/bin/env node
// Counts the 2026-10-12 call patterns in saved QA or Playground result files.
// Usage:
//   node count-patterns.mjs [--manifest catalog/manifest.json] [--rows] <result.json>...
//   node count-patterns.mjs --self-check
// Run it with the working directory at a repository checkout: acorn and the
// default manifest resolve from there, so a pinned copy of this file can live
// outside that checkout. Reads files only; makes no model or service call.
//
// Each execute script is parsed whole with acorn (a program, or one expression
// that consumes the input). Per file, it reports:
//   - stellarDocs.* calls and how many omit a required top-level input (from the
//     manifest). A call whose argument the parser cannot resolve (a spread, a
//     computed key, a non-literal argument, an unknown operation) is `unknown`;
//     so is a `stellarDocs` reference that is not a direct call;
//   - `[invalid-args: …]` entries in execute results (the host's own record);
//   - search results whose clipped card carries the required-input marker;
//   - execute calls and errors, skill.read scripts, section-read scripts, and
//     scripts with an unknown skill read: options the parser cannot resolve, or
//     a `codemode`, `codemode.skill`, or `codemode.skill.read` reference that is
//     not a direct call (an alias, a destructure, a computed step). A resolved
//     read in the same script does not clear an unknown one;
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
const SKILL_READ_TEXT = /\bskill\b[\s\S]*\bread\b/;
const PARSE_OPTIONS = {
  ecmaVersion: "latest", sourceType: "module", allowAwaitOutsideFunction: true, allowReturnOutsideFunction: true
};

// True when `rest` holds only semicolons, comments, and white space.
function onlyTrailer(rest) {
  try {
    return parse(rest, PARSE_OPTIONS).body.every((node) => node.type === "EmptyStatement");
  } catch {
    return false;
  }
}

// Parses the whole script: first as a program, then as one expression (an
// anonymous function is not a valid statement). The expression must consume
// the input; only semicolons and comments may follow it.
function parseScript(code) {
  try {
    return parse(code, PARSE_OPTIONS);
  } catch {
    try {
      const node = parseExpressionAt(code, 0, PARSE_OPTIONS);
      return onlyTrailer(code.slice(node.end)) ? node : null;
    } catch {
      return null;
    }
  }
}

function walk(node, visit, parent = null) {
  if (!node || typeof node.type !== "string") return;
  visit(node, parent);
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) for (const item of value) walk(item, visit, node);
    else if (value && typeof value === "object" && typeof value.type === "string") walk(value, visit, node);
  }
}

// `a.b["c"]` → ["a", "b", "c"]; null when any step is not a literal name.
function memberPath(node) {
  if (node.type === "ChainExpression") return memberPath(node.expression);
  if (node.type === "Identifier") return [node.name];
  if (node.type !== "MemberExpression") return null;
  const head = memberPath(node.object);
  if (!head) return null;
  const name = literalProperty(node);
  return name === null ? null : [...head, name];
}

function literalProperty(member) {
  if (!member.computed && member.property.type === "Identifier") return member.property.name;
  if (member.computed && member.property.type === "Literal" && typeof member.property.value === "string") {
    return member.property.value;
  }
  return null;
}

// An identifier that names a variable, not a property name or an object key.
function isReference(node, parent) {
  if (!parent) return true;
  if (parent.type === "MemberExpression" && parent.property === node && !parent.computed) return false;
  if ((parent.type === "Property" || parent.type === "PropertyDefinition" || parent.type === "MethodDefinition") &&
    parent.key === node && !parent.computed && !parent.shorthand) return false;
  return !["LabeledStatement", "BreakStatement", "ContinueStatement"].includes(parent.type);
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

// Follows each `codemode` reference through literal member steps (dot or
// bracket). A step chain that reaches `codemode.skill.read` as a call callee
// is a resolved read. A chain that stops at `codemode` or `codemode.skill`,
// or reaches `codemode.skill.read` other than as a callee (an alias, a
// destructure, a computed step), is an unknown skill-read reference.
function skillReferences(ast, parents) {
  const reads = [];
  let unknown = 0;
  walk(ast, (node, parent) => {
    if (node.type !== "Identifier" || node.name !== "codemode" || !isReference(node, parent)) return;
    const segments = ["codemode"];
    let cur = node;
    for (;;) {
      let up = parents.get(cur);
      if (up?.type === "ChainExpression") {
        cur = up;
        up = parents.get(cur);
      }
      if (up?.type !== "MemberExpression" || up.object !== cur || literalProperty(up) === null) break;
      segments.push(literalProperty(up));
      cur = up;
      if (segments.length === 3) break;
    }
    if (segments[1] !== undefined && segments[1] !== "skill") return;
    if (segments[2] !== undefined && segments[2] !== "read") return;
    if (segments.length === 3) {
      let callee = cur;
      let up = parents.get(callee);
      if (up?.type === "ChainExpression") {
        callee = up;
        up = parents.get(callee);
      }
      if (up?.type === "CallExpression" && up.callee === callee) {
        reads.push(skillReadState(up.arguments[1]));
        return;
      }
    }
    unknown++;
  });
  return { reads, unknown };
}

export function analyzeScript(code, required) {
  const out = { parsed: true, docs: [], skillReads: [], unknownSkillRefs: 0, unresolvedDocsRefs: 0 };
  const ast = parseScript(code);
  if (!ast) {
    out.parsed = false;
    if (SKILL_READ_TEXT.test(code)) out.unknownSkillRefs = 1;
    return out;
  }
  const parents = new Map();
  walk(ast, (node, parent) => parents.set(node, parent));
  const resolvedDocsRoots = new Set();
  walk(ast, (node) => {
    if (node.type !== "CallExpression") return;
    const callee = memberPath(node.callee);
    if (callee?.length === 2 && callee[0] === "stellarDocs") {
      resolvedDocsRoots.add(rootIdentifier(node.callee));
      out.docs.push({ op: callee[1], text: code.slice(node.start, node.end).slice(0, 160), ...docsState(callee[1], node.arguments[0], required) });
    }
  });
  walk(ast, (node, parent) => {
    if (node.type === "Identifier" && node.name === "stellarDocs" && isReference(node, parent) &&
      !resolvedDocsRoots.has(node)) out.unresolvedDocsRefs++;
  });
  const skill = skillReferences(ast, parents);
  out.skillReads = skill.reads;
  out.unknownSkillRefs = skill.unknown;
  return out;
}

function rootIdentifier(node) {
  if (node.type === "ChainExpression") return rootIdentifier(node.expression);
  if (node.type === "MemberExpression") return rootIdentifier(node.object);
  return node.type === "Identifier" ? node : null;
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
      if (script.skillReads.length > 0 || script.unknownSkillRefs > 0) total.skillReadScripts++;
      if (script.skillReads.includes("sections")) {
        total.sectionReadScripts++;
        out.sectionReadScripts.push(index);
      }
      // Counted on its own: a resolved read in the same script does not clear an unknown one.
      if (script.skillReads.includes("unknown") || script.unknownSkillRefs > 0) {
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
  // Review RP fixtures.
  { code: 'async () => stellarDocs.search_docs({"query":"trustline"})', docs: ["present"], skill: [] },
  { code: 'async () => stellarDocs.search_docs({filter:{query:"trustline"}})', docs: ["missing"], skill: [] },
  { code: 'async () => codemode.skill.read("skills.stellar-dev.assets", {"sections":["trustlines"]})', docs: [], skill: ["sections"] },
  // Review RP2 fixtures: the whole script parses; aliases and bracket steps stay visible.
  { code: 'await stellarDocs.search_docs({query:"x"}); await stellarDocs.search_docs({});', docs: ["present", "missing"], skill: [] },
  { code: 'await stellarDocs.search_docs({query:"x"}); await stellarDocs.search_docs({}); await codemode.skill.read("skills.x", {sections:["a"]});', docs: ["present", "missing"], skill: ["sections"] },
  { code: 'async () => { const read = codemode.skill["read"]; return read("skills.x", {sections:["a"]}); }', docs: [], skill: [], unknown: 1 },
  { code: 'async () => { await codemode.skill.read("skills.x"); const read = codemode.skill.read; return read("skills.x", {sections:["a"]}); }', docs: [], skill: ["whole"], unknown: 1 },
  // Edge cases the counts depend on.
  { code: "async () => { const query = 'x'; return stellarDocs.search_docs({ query }); }", docs: ["present"], skill: [] },
  { code: 'async () => stellarDocs.search_docs({ query: "a ... b", hitsPerPage: 3 })', docs: ["present"], skill: [] },
  { code: "async () => stellarDocs.search_docs({ hitsPerPage: 3 })", docs: ["missing"], skill: [] },
  { code: "async () => stellarDocs.search_docs({ ...base, hitsPerPage: 3 })", docs: ["unknown"], skill: [] },
  { code: "async () => stellarDocs.search_docs(args)", docs: ["unknown"], skill: [] },
  { code: 'async () => stellarDocs["search_docs"]({ query: "x" })', docs: ["present"], skill: [] },
  { code: 'async () => { const s = "stellarDocs.search_docs({})"; return s; }', docs: [], skill: [] },
  { code: 'async function () { return stellarDocs.search_docs({ query: "x" }); }', docs: ["present"], skill: [] },
  { code: 'async () => stellarDocs.search_docs({ query: "x" }); // done\n;', docs: ["present"], skill: [] },
  { code: "async () => 1\nstellarDocs.search_docs({})", docs: ["missing"], skill: [] },
  { code: 'async () => codemode.skill.read("skills.x")', docs: [], skill: ["whole"] },
  { code: 'async () => codemode.skill.read?.("skills.x", { sections: ["a"] })', docs: [], skill: ["sections"] },
  { code: 'async () => codemode.skill.read("skills.x", opts)', docs: [], skill: ["unknown"] },
  { code: 'async () => { const { read } = codemode.skill; return read("skills.x", { sections: ["a"] }); }', docs: [], skill: [], unknown: 1 },
  { code: 'async () => codemode.skill.run("skills.x", {})', docs: [], skill: [] },
  { code: "async () => { stellarDocs.search_docs({ query: 'x' ", parsed: false, docs: [], skill: [] }
];

function selfCheck() {
  const required = new Map([["search_docs", ["query"]]]);
  let failures = 0;
  for (const fixture of FIXTURES) {
    const got = analyzeScript(fixture.code, required);
    const ok = got.parsed === (fixture.parsed ?? true) &&
      JSON.stringify(got.docs.map((d) => d.state)) === JSON.stringify(fixture.docs) &&
      JSON.stringify(got.skillReads) === JSON.stringify(fixture.skill) &&
      got.unknownSkillRefs === (fixture.unknown ?? 0);
    if (!ok) {
      failures++;
      console.error(`self-check FAILED: ${fixture.code}\n  got parsed=${got.parsed} docs=${JSON.stringify(got.docs.map((d) => d.state))} skill=${JSON.stringify(got.skillReads)} unknown=${got.unknownSkillRefs}`);
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
