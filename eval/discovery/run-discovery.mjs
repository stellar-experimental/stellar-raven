#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { compactHit, normalizeUrl, parseSearchPayload, postMcp } from "./lib.mjs";

const DISCOVERY_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(DISCOVERY_DIR, "../..");
const DEFAULT_CASES = path.join(DISCOVERY_DIR, "cases.json");
const DEFAULT_URL = "http://localhost:8788";
const FAMILIES = new Set(["lumenloop", "scout", "stellarDocs", "skills"]);

const argValue = (flag) => {
  const i = process.argv.indexOf(flag);
  return i === -1 ? undefined : process.argv[i + 1];
};

async function preflight(url) {
  await postMcp(url, { jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "discovery-eval", version: "0" } } });
  const list = await postMcp(url, { jsonrpc: "2.0", id: 2, method: "tools/list", params: {} });
  const names = (list.result?.tools ?? []).map((t) => t.name);
  if (!names.includes("search")) throw new Error(`live server exposes [${names.join(", ")}], but discovery eval requires search`);
}

function loadCases(casesPath) {
  const data = JSON.parse(readFileSync(casesPath, "utf8"));
  const cases = Array.isArray(data) ? data : data.cases;
  if (!Array.isArray(cases)) throw new Error(`${casesPath} must contain an array or { cases: [] }`);
  const seen = new Set();
  for (const c of cases) {
    for (const field of ["id", "question", "expectedFamilies", "acceptableOps", "seed", "groundTruth", "notes"]) if (c[field] === undefined) throw new Error(`case ${c.id ?? "<unknown>"} missing ${field}`);
    if (seen.has(c.id)) throw new Error(`duplicate case id ${c.id}`);
    seen.add(c.id);
    if (!Array.isArray(c.expectedFamilies) || !c.expectedFamilies.length) throw new Error(`case ${c.id} expectedFamilies must be a non-empty array`);
    for (const family of c.expectedFamilies) if (!FAMILIES.has(family)) throw new Error(`case ${c.id} has invalid expected family ${family}`);
    if (!Array.isArray(c.acceptableOps) || !c.acceptableOps.length) throw new Error(`case ${c.id} acceptableOps must be a non-empty array`);
    if (!c.seed?.pool || !c.seed?.ref) throw new Error(`case ${c.id} seed must include pool and ref`);
    if (!["authored", "provisional"].includes(c.groundTruth)) throw new Error(`case ${c.id} groundTruth must be authored or provisional`);
    if (c.groundTruth === "provisional" && !c.groundTruthNote) throw new Error(`case ${c.id} provisional ground truth needs groundTruthNote`);
  }
  return { meta: Array.isArray(data) ? null : { schemaVersion: data.schemaVersion, authoredAt: data.authoredAt }, cases };
}

function validateManifestIds(cases) {
  const manifest = JSON.parse(readFileSync(path.join(REPO, "catalog", "manifest.json"), "utf8"));
  const ids = new Set((manifest.entries ?? []).map((e) => e.id));
  const missing = [];
  for (const c of cases) for (const id of c.acceptableOps) if (!ids.has(id)) missing.push(`${c.id}: ${id}`);
  if (missing.length) throw new Error(`acceptableOps not present in catalog/manifest.json:\n${missing.join("\n")}`);
  return { generatedAt: manifest.generatedAt, version: manifest.version, entryCount: ids.size };
}

async function runCase(url, c, index) {
  const msg = await postMcp(url, { jsonrpc: "2.0", id: 1000 + index, method: "tools/call", params: { name: "search", arguments: { query: c.question, limit: 8 } } });
  const hits = (parseSearchPayload(msg).hits ?? []).slice(0, 8).map((h, i) => compactHit(h, i + 1));
  const expectedFamily = new Set(c.expectedFamilies);
  const acceptableOps = new Set(c.acceptableOps);
  return { id: c.id, question: c.question, seed: c.seed, groundTruth: c.groundTruth, ...(c.groundTruthNote ? { groundTruthNote: c.groundTruthNote } : {}), expectedFamilies: c.expectedFamilies, acceptableOps: c.acceptableOps, familyHitAt3: hits.slice(0, 3).some((h) => expectedFamily.has(h.service)), usableOpAt5: hits.slice(0, 5).some((h) => acceptableOps.has(h.id)), topHits: hits, notes: c.notes };
}

function summarize(rows) {
  const bucket = (items) => {
    const n = items.length;
    const familyHitAt3 = items.filter((r) => r.familyHitAt3).length;
    const usableOpAt5 = items.filter((r) => r.usableOpAt5).length;
    return { n, familyHitAt3, familyHitAt3Pct: n ? Number(((100 * familyHitAt3) / n).toFixed(1)) : 0, usableOpAt5, usableOpAt5Pct: n ? Number(((100 * usableOpAt5) / n).toFixed(1)) : 0 };
  };
  const byPool = {};
  for (const pool of [...new Set(rows.map((r) => r.seed.pool))].sort()) byPool[pool] = bucket(rows.filter((r) => r.seed.pool === pool));
  return { overall: bucket(rows), byPool };
}

function formatLine(name, s) {
  return `${name}: n=${s.n} familyHit@3 ${s.familyHitAt3}/${s.n} (${s.familyHitAt3Pct}%) usableOp@5 ${s.usableOpAt5}/${s.n} (${s.usableOpAt5Pct}%)`;
}

async function main() {
  const startedAt = new Date().toISOString();
  const url = normalizeUrl(argValue("--url") ?? DEFAULT_URL);
  const casesPath = path.resolve(argValue("--cases") ?? DEFAULT_CASES);
  const { meta, cases } = loadCases(casesPath);
  const manifest = validateManifestIds(cases);
  await preflight(url);
  const rows = [];
  for (const [i, c] of cases.entries()) {
    process.stdout.write(`[${i + 1}/${cases.length}] ${c.id} ... `);
    const row = await runCase(url, c, i);
    rows.push(row);
    console.log(`family@3=${row.familyHitAt3 ? "hit" : "miss"} usable@5=${row.usableOpAt5 ? "hit" : "miss"}`);
  }
  const summary = summarize(rows);
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const resultsDir = path.join(DISCOVERY_DIR, "results");
  mkdirSync(resultsDir, { recursive: true });
  const outPath = path.join(resultsDir, `${stamp}.json`);
  writeFileSync(outPath, JSON.stringify({ meta: { instrument: "discovery", schemaVersion: meta?.schemaVersion ?? null, casesPath: path.relative(REPO, casesPath), caseCount: rows.length, url, startedAt, finishedAt: new Date().toISOString(), manifest, grading: { familyHitAt3: "any hit.service in expectedFamilies among ranks 1-3", usableOpAt5: "any hit.id in acceptableOps among ranks 1-5", rawHitsRecorded: 8, queryPolicy: "one search call using the case question verbatim" } }, summary, cases: rows }, null, 2) + "\n");
  console.log("");
  console.log(formatLine("overall", summary.overall));
  for (const [pool, s] of Object.entries(summary.byPool)) console.log(formatLine(pool, s));
  console.log(`results -> ${outPath}`);
}

main().catch((err) => {
  console.error(`run-discovery failed: ${err.message}`);
  process.exit(1);
});
