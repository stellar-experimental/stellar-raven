import fs from "node:fs";
import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
import { loadManifest, searchCatalog } from "../src/catalog/search.ts";

const read = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const baseCommit = "76c7f02be5fba31c4377f067f37412bb6e5b9d4b";
const base = JSON.parse(execFileSync("git", ["show", `${baseCommit}:catalog/manifest.json`], { maxBuffer: 1e8 }));
assert.deepEqual(base, read("tmp/lane-a-baseline-manifest.json"));
const before = read("tmp/lane-a-before-manifest.json");
const after = read("catalog/manifest.json");
const questions = [
  "How do x402, MPP, AP2, and ACP compare for agent payments, and which are Stellar-specific vs general?",
  "Stellar skills for signing messages",
  "Stellar skills for security auditing",
  "Stellar authority skills",
  "Are there any model context protocol skills for Stellar?",
  "What Stellar AI skills can I install?",
  "List Stellar skills",
  "Search Stellar research across CAP and SEP sources",
  "What community skills are listed on skills.stellar.org?",
  "what oracle should I use for prices on Stellar",
  "What oracle options do I have on Stellar besides Reflector?",
  "Sign messages"
];
// Adapted from the supplied reviewer-causality.mjs. Remove new title words
// independently to attribute the four reported failures without a code edit.
const variants = { base, before, after, "review-before": read("tmp/lane-a-review-before-manifest.json") };
for (const word of ["agents", "skills", "x402", "messages", "security"]) {
  const variant = structuredClone(before);
  for (const entry of variant.entries) {
    if (entry.service !== "stellarDocs") continue;
    const old = base.entries.find((e) => e.id === entry.id);
    if (!old.keywords?.includes(word) && entry.keywords) {
      entry.keywords = entry.keywords.filter((token) => token !== word);
    }
  }
  variants[`without-new-${word}`] = variant;
}
const catalogs = Object.fromEntries(Object.entries(variants).map(([k, v]) => [k, loadManifest(v)]));
const probes = questions.map((query) => ({
  query,
  variants: Object.fromEntries(Object.entries(catalogs).map(([name, catalog]) => [
    name, searchCatalog(catalog, { query, limit: 5 }).map(({ id, score, tier }) => ({ id, score, tier }))
  ]))
}));
fs.writeFileSync("tmp/lane-a-probes.json", JSON.stringify(probes, null, 2) + "\n");
const files = fs.readdirSync("eval/results").filter((f) => /^routing-.*\.json$/.test(f)).sort();
const baselineFile = files[0];
const baseline = read(`eval/results/${baselineFile}`);
const summaries = files.slice(1).map((file) => {
  const current = read(`eval/results/${file}`);
  const lanes = Object.fromEntries(["cases", "extendedCases", "skillsCases", "holdoutCases", "protocolHistoryCases"].map((lane) => {
    const oldRows = new Map(baseline[lane].map((row) => [row.id, row]));
    const flips = [], changedRanks = [];
    for (const row of current[lane]) {
      const old = oldRows.get(row.id);
      if (!old) throw new Error(`Missing baseline ${row.id}`);
      for (const key of Object.keys(old).filter((key) => typeof old[key] === "boolean")) {
        if (row[key] !== old[key]) flips.push({ id: row.id, metric: key, before: old[key], after: row[key] });
      }
      const oldHits = old.topHits.map((hit) => hit.id), newHits = row.topHits.map((hit) => hit.id);
      if (JSON.stringify(oldHits) !== JSON.stringify(newHits)) changedRanks.push({ id: row.id, before: oldHits, after: newHits });
    }
    if (oldRows.size !== current[lane].length) throw new Error(`Changed denominator ${lane}`);
    return [lane, { n: oldRows.size, flips, changedRanks }];
  }));
  return { file, manifest: current.manifest, gate: current.gate, overall: current.overall,
    extendedLane: current.extendedLane, skillsLane: current.skillsLane, holdoutLane: current.holdoutLane, lanes };
});
const output = { baseCommit, baselineFile, summaries };
fs.writeFileSync("tmp/lane-a-comparison.json", JSON.stringify(output, null, 2) + "\n");
const latest = summaries.at(-1);
for (const [lane, result] of Object.entries(latest.lanes)) console.log(lane, JSON.stringify({ n: result.n, flips: result.flips, rankChanges: result.changedRanks.length }));
console.log("Latest trace:", latest.file);
console.log("Probe evidence: tmp/lane-a-probes.json");
console.log("Case comparison: tmp/lane-a-comparison.json");
const regressions = Object.values(latest.lanes).flatMap((lane) => lane.flips)
  .filter((flip) => flip.metric === "forbiddenCapture" ? flip.after : !flip.after);
if (regressions.length) {
  console.error("Graded regressions:", regressions);
  process.exitCode = 1;
}
