#!/usr/bin/env node
/**
 * Test fixture only: a coverage.json stand-in built from audit/ and verify/ so apply.mjs can be
 * dry-run before the coverage lane reports. Leaves are dealt mechanically (category -> domains,
 * then any leaf with room); they are not a coverage decision.
 *
 *   node fixture-coverage.mjs <out.json>
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROUND_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ROOT = path.resolve(ROUND_DIR, "../../..");
const out = process.argv[2];
if (!out) throw new Error("usage: fixture-coverage.mjs <out.json>");

const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));
const records = (kind, key) => readdirSync(path.join(ROUND_DIR, kind)).filter((f) => f.endsWith(".json"))
  .flatMap((f) => readJson(path.join(ROUND_DIR, kind, f))[key]);
const audit = new Map(records("audit", "records").map((r) => [r.id, r]));
const verify = new Map(records("verify", "decisions").map((d) => [d.id, d]));
const categoryOf = new Map();
const walk = (dir) => readdirSync(dir, { withFileTypes: true }).forEach((e) => {
  const full = path.join(dir, e.name);
  if (e.isDirectory()) walk(full);
  else if (e.name.endsWith(".json")) categoryOf.set(readJson(full).id, path.basename(dir));
});
walk(path.join(ROOT, "eval/qa/corpus/battery"));
walk(path.join(ROOT, "eval/qa/corpus/proposed"));

const DOMAINS = {
  "protocol-core": ["protocol", "network"], soroban: ["soroban"], "tooling-infra": ["tooling", "data", "ai"],
  "assets-anchors-seps": ["assets", "standards"], "defi-ecosystem": ["defi", "ecosystem"],
  "scf-grants-builders": ["funding"], "compliance-rwa-payments": ["standards", "security", "assets"],
  "history-org-tokenomics": ["ecosystem", "network"], "retail-consumer": ["wallets"], "edge-behavior": ["behavior"]
};
const taxonomy = readJson(path.join(ROUND_DIR, "map/taxonomy.json"));
const leaves = taxonomy.domains.flatMap((d) => d.leaves.map((l) => ({ id: l.id, domain: d.id, weight: l.weight, target: l.cases, primary: [] })));

const verdictOf = (id) => verify.get(id)?.finalVerdict ?? audit.get(id).verdict;
const cases = [];
for (const [id, a] of [...audit].sort(([x], [y]) => x.localeCompare(y))) {
  let finalVerdict = verdictOf(id);
  let survivor = null;
  let note = null;
  if (finalVerdict === "merge") {
    const options = [a.mergeInto, a.survivor, ...(a.duplicates ?? []).map((d) => d.survivor)].filter((s) => s && s !== id && audit.has(s));
    survivor = options.find((s) => ["keep", "tighten"].includes(verdictOf(s))) ?? null;
    if (!survivor) { finalVerdict = "retire"; note = "Fixture: merge survivor chain resolved to retirement."; }
  }
  cases.push({ id, finalVerdict, survivor, leaf: null, secondaryLeaf: null, verified: verify.has(id), note });
}
// Deal headline battery survivors to leaves with room (target + 1), preferring their category's domains.
for (const kase of cases.filter((c) => ["keep", "tighten"].includes(c.finalVerdict) && categoryOf.has(c.id))) {
  const preferred = DOMAINS[categoryOf.get(kase.id)] ?? [];
  const room = (leaf) => leaf.primary.length < leaf.target + 1;
  const pick = (pool) => pool.filter(room).sort((x, y) => x.primary.length / x.target - y.primary.length / y.target)[0];
  const leaf = pick(leaves.filter((l) => preferred.includes(l.domain))) ?? pick(leaves);
  leaf.primary.push(kase.id);
  kase.leaf = leaf.id;
}
writeFileSync(out, `${JSON.stringify({
  $comment: "FIXTURE ONLY — not a coverage decision.",
  cases,
  leaves: leaves.map((l) => ({ id: l.id, weight: l.weight, target: l.target, primary: l.primary, cut: [], slots: [] })),
  mergeFixes: [],
  toolLane: [],
  extraCuts: [],
  proposedLeaves: [],
  unverified: cases.filter((c) => !c.verified).map((c) => c.id)
}, null, 2)}\n`);
console.log(`wrote ${out}: ${cases.length} cases`);
