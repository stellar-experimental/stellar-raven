import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "acorn";
import { transformSync } from "esbuild";
import { writeFileAtomic } from "./shared.mjs";

export const COMMUNITY_SOURCE = "stellar/stellar-dev-skill main";
export const COMMUNITY_URL = "https://raw.githubusercontent.com/stellar/stellar-dev-skill/main/site/src/data/skills.ts";

const memberName = (node) => node?.type === "MemberExpression" && !node.computed && !node.optional
  ? node.property.name : null;

// Ordering is irrelevant to the URL-sorted snapshot. Only accept a comparator
// that reads literal identity fields; arbitrary callbacks could change them.
function isIdentitySort(callback) {
  if (callback?.type !== "ArrowFunctionExpression" || callback.async || callback.params.length !== 2 ||
      callback.params.some((param) => param.type !== "Identifier")) return false;
  const [left, right] = callback.params;
  const call = callback.body;
  if (call.type !== "CallExpression" || call.optional || memberName(call.callee) !== "localeCompare" ||
      call.arguments.length < 1 || call.arguments.length > 3) return false;
  const receiver = call.callee.object;
  const other = call.arguments[0];
  const field = memberName(receiver);
  if (!["title", "copyValue"].includes(field) || memberName(other) !== field ||
      receiver.object.type !== "Identifier" || receiver.object.name !== left.name ||
      other.object.type !== "Identifier" || other.object.name !== right.name) return false;
  const [, locale, options] = call.arguments;
  if (locale && (locale.type !== "Literal" || typeof locale.value !== "string")) return false;
  return !options || (options.type === "ObjectExpression" && options.properties.every((property) =>
    property.type === "Property" && !property.computed && !property.method && property.kind === "init" &&
    property.value.type === "Literal" && ["string", "boolean", "number"].includes(typeof property.value.value)));
}

/** Strip TypeScript syntax, then read literal identities without executing code or parsing descriptions. */
export function communityEntries(text) {
  let program;
  try {
    const { code } = transformSync(text, { loader: "ts", target: "esnext", logLevel: "silent" });
    program = parse(code, { ecmaVersion: "latest", sourceType: "module" });
  } catch {
    throw new Error("stellar community: invalid source syntax");
  }
  const constants = program.body.flatMap((statement) => {
    const exported = statement.type === "ExportNamedDeclaration";
    const declaration = exported ? statement.declaration : statement;
    return declaration?.type === "VariableDeclaration" && declaration.kind === "const"
      ? declaration.declarations.map((entry) => ({ entry, exported })) : [];
  });
  const declarations = constants.filter(({ entry, exported }) => exported && entry.id.name === "ECOSYSTEM_CARDS");
  if (declarations.length !== 1) {
    throw new Error("stellar community: expected one exported ECOSYSTEM_CARDS declaration");
  }
  const declaration = declarations[0].entry;
  let array = declaration.init;
  const allowedReferences = new Set([declaration.id]);
  const protectedNames = new Set(["ECOSYSTEM_CARDS"]);
  if (array?.type !== "ArrayExpression") {
    // The site exports a sorted copy of a local const array. Follow only that
    // single literal source, not aliases, imports, merges, or arbitrary code.
    const copy = array?.callee?.object;
    const spread = copy?.elements?.[0];
    if (array?.type !== "CallExpression" || array.optional || memberName(array.callee) !== "sort" ||
        array.arguments.length !== 1 || !isIdentitySort(array.arguments[0]) ||
        copy?.type !== "ArrayExpression" || copy.elements.length !== 1 ||
        spread?.type !== "SpreadElement" || spread.argument.type !== "Identifier") {
      throw new Error("stellar community: expected a literal array or a sorted copy of a local literal array");
    }
    const sources = constants.filter(({ entry }) => entry.id.name === spread.argument.name);
    if (sources.length !== 1 || sources[0].entry.init?.type !== "ArrayExpression" ||
        sources[0].entry.start >= declaration.start) {
      throw new Error("stellar community: expected a preceding local const literal array");
    }
    const source = sources[0].entry;
    array = source.init;
    protectedNames.add(source.id.name);
    allowedReferences.add(source.id);
    allowedReferences.add(spread.argument);
  }
  // Reject aliases and mutations rather than interpreting the rest of the module.
  // The walk runs on esbuild output, which already renames nested bindings that shadow these names.
  const pending = [program];
  while (pending.length) {
    const node = pending.pop();
    if (allowedReferences.has(node)) continue;
    if (node.type === "Identifier" && protectedNames.has(node.name)) {
      throw new Error(`stellar community: ${node.name} reference outside its declaration`);
    }
    for (const value of Object.values(node)) {
      const children = Array.isArray(value) ? value : [value];
      for (const child of children) {
        if (child && typeof child.type === "string") pending.push(child);
      }
    }
  }
  const entries = [];
  const urls = new Set();
  for (const card of array.elements) {
    if (card?.type !== "ObjectExpression") throw new Error("stellar community: unsupported listing entry");
    const fields = new Map();
    for (const property of card.properties) {
      if (property.type !== "Property" || property.computed || property.kind !== "init" || property.method) {
        throw new Error("stellar community: unsupported listing property");
      }
      const name = property.key.type === "Identifier" ? property.key.name : property.key.value;
      if (name !== "title" && name !== "copyValue") continue;
      if (fields.has(name) || property.value.type !== "Literal" || typeof property.value.value !== "string") {
        throw new Error("stellar community: expected literal title and copyValue");
      }
      fields.set(name, property.value.value);
    }
    const title = fields.get("title");
    const url = fields.get("copyValue");
    if (!title?.trim() || !url) throw new Error("stellar community: missing title or copyValue");
    let parsed;
    try { parsed = new URL(url); } catch { throw new Error("stellar community: invalid listing URL"); }
    if (parsed.protocol !== "https:" || !parsed.hostname || parsed.username || parsed.password) {
      throw new Error("stellar community: invalid listing URL");
    }
    if (urls.has(url)) throw new Error(`stellar community: duplicate listing URL ${url}`);
    urls.add(url);
    entries.push({ title, url });
  }
  if (!entries.length) throw new Error("stellar community: empty listing");
  return entries.sort((a, b) => a.url < b.url ? -1 : a.url > b.url ? 1 : 0);
}

export async function fetchCommunityEntries() {
  const response = await fetch(COMMUNITY_URL, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`stellar community: HTTP ${response.status}`);
  return communityEntries(await response.text());
}

export function compareCommunity(localEntries, liveEntries) {
  const before = new Map(localEntries.map((entry) => [entry.url, entry.title]));
  const after = new Map(liveEntries.map((entry) => [entry.url, entry.title]));
  const added = [...after.keys()].filter((url) => !before.has(url));
  const removed = [...before.keys()].filter((url) => !after.has(url));
  const changed = [...after.keys()].filter((url) => before.has(url) && before.get(url) !== after.get(url));
  const notes = [];
  if (added.length) notes.push(`added: ${added.join(", ")}`);
  if (removed.length) notes.push(`removed: ${removed.join(", ")}`);
  if (changed.length) notes.push(`renamed: ${changed.join(", ")}`);
  return notes.join("; ");
}

const escapeCell = (value) => value.replace(/\\/g, "\\\\").replace(/\|/g, "\\|").replace(/[\r\n]/g, " ").replace(/\[/g, "\\[").replace(/\]/g, "\\]");

export function communityIndex(snapshot) {
  return [
    `## Community directory (${COMMUNITY_SOURCE} source snapshot)`,
    "",
    `The snapshot lists ${snapshot.entries.length} Community skills from [${COMMUNITY_SOURCE}](${snapshot.source}).`,
    `The snapshot date is ${snapshot.fetched_at}.`,
    "Source changes can precede deployment or never deploy.",
    "These links support discovery. Each skill needs a separate pin and exposure review before Raven can serve it.",
    "",
    "| Community skill | Upstream link |",
    "| --- | --- |",
    ...snapshot.entries.map((entry) => `| ${escapeCell(entry.title)} | [Source](${entry.url}) |`),
    ""
  ];
}

// Snapshot only this public directory. Never fetch or pin the listed bodies.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const entries = await fetchCommunityEntries();
  writeFileAtomic(process.argv[2], JSON.stringify({ source: COMMUNITY_URL, fetched_at: new Date().toISOString(), entries }, null, 2) + "\n");
}
