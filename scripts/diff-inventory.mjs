#!/usr/bin/env node
/**
 * Compare inventory files or Git snapshots without network calls or writes.
 * Usage: node scripts/diff-inventory.mjs <surface|text|deep> <before> <after>
 * Sources are file paths or Git <ref>:<path> expressions, relative to the repo.
 * Exit 0 means equal, 1 means drift, and 2 means an input or command error.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(import.meta.dirname, "..");
const METHODS = new Set(["get", "post", "put", "patch", "delete", "options", "head"]);
const MODES = new Set(["surface", "text", "deep"]);

// Preserve every JSON key and array order while ignoring object-key order.
function sortDeep(value) {
  if (Array.isArray(value)) return value.map(sortDeep);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortDeep(value[key])]));
  }
  return value;
}

const stable = (value) => JSON.stringify(sortDeep(value));
const norm = (value) => String(value ?? "").replace(/\s+/g, " ").trim();

function operationLines(doc, mode) {
  const lines = [];
  for (const [path, ops] of Object.entries(doc.openapi?.paths ?? {})) {
    for (const [method, op] of Object.entries(ops ?? {})) {
      if (!METHODS.has(method)) continue;
      const key = `${method.toUpperCase()} ${path}`;
      lines.push(mode === "surface" ? key
        : `${key} :: ${norm(op.operationId)} :: ${norm(op.summary)} :: ${norm(op.description)} :: ${stable(op["x-routing"] ?? null)}`);
    }
  }
  return lines.sort();
}

export function compareInventory(before, after, mode) {
  if (!MODES.has(mode)) throw new Error(`Unknown comparison mode: ${mode}`);
  if (mode === "deep") {
    const pathsEqual = stable(before.openapi?.paths) === stable(after.openapi?.paths);
    const componentsEqual = stable(before.openapi?.components) === stable(after.openapi?.components);
    return {
      changed: !pathsEqual || !componentsEqual,
      lines: [`paths identical: ${pathsEqual}`, `components identical: ${componentsEqual}`]
    };
  }

  const oldLines = operationLines(before, mode);
  const newLines = operationLines(after, mode);
  const oldSet = new Set(oldLines);
  const newSet = new Set(newLines);
  const lines = [
    ...oldLines.filter((line) => !newSet.has(line)).map((line) => `- ${line}`),
    ...newLines.filter((line) => !oldSet.has(line)).map((line) => `+ ${line}`)
  ];
  return { changed: lines.length > 0, lines };
}

function loadInventory(source) {
  const content = source.includes(":")
    ? execFileSync("git", ["show", source], {
      cwd: ROOT,
      encoding: "utf8",
      maxBuffer: 1e9,
      stdio: ["ignore", "pipe", "pipe"]
    })
    : readFileSync(resolve(ROOT, source), "utf8");
  const doc = JSON.parse(content);
  if (!doc || typeof doc !== "object" || Array.isArray(doc)) {
    throw new Error(`Invalid inventory object: ${source}`);
  }
  return doc;
}

function main(args) {
  if (args.length !== 3 || !MODES.has(args[0])) {
    console.error("Usage: node scripts/diff-inventory.mjs <surface|text|deep> <before> <after>");
    process.exitCode = 2;
    return;
  }
  try {
    const [mode, before, after] = args;
    const result = compareInventory(loadInventory(before), loadInventory(after), mode);
    if (result.lines.length > 0) console.log(result.lines.join("\n"));
    process.exitCode = result.changed ? 1 : 0;
  } catch (error) {
    console.error(`diff-inventory: ${error.message}`);
    process.exitCode = 2;
  }
}

if (resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) main(process.argv.slice(2));
