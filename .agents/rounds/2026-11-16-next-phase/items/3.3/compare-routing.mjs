// Round item 3.3: compare two eval/results/routing-*.json files per row.
// usage: node .agents/rounds/2026-11-16-next-phase/items/3.3/compare-routing.mjs [--lists] <base.json> <variant.json>
// The two files must come from the same manifest, grading rule and compiled cases; the script refuses
// a mismatched pair. Per lane and metric it prints hit-to-miss and miss-to-hit counts, and the number
// of rows whose ordered top-five ids changed. Row ids are printed only for legacy, extended, skills and
// protocol-history rows that are not confirmation-only. Holdout rows and every confirmation-only row
// are counts only: this script never prints their ids or text. With --lists it also prints the before
// and after top five of each changed row it may name (the per-case review reads these).
// Two result lines: rule 1 (legacy, skills, holdout: no hit-to-miss row, no new holdout capture) and
// rule 2 (extended: no strict total falls). Exit status 1 when either breaches.
import { readFileSync } from "node:fs";
const showLists = process.argv.includes("--lists");
const [basePath, variantPath] = process.argv.slice(2).filter((a) => a !== "--lists");
if (!basePath || !variantPath) throw new Error("usage: compare-routing.mjs [--lists] <base.json> <variant.json>");
const base = JSON.parse(readFileSync(basePath, "utf8"));
const variant = JSON.parse(readFileSync(variantPath, "utf8"));
for (const [label, get] of [
  ["manifest sha256", (r) => r.manifest?.sha256],
  ["gradingRule", (r) => r.gradingRule],
  ["casesFile", (r) => JSON.stringify(r.casesFile)],
]) {
  if (get(base) === undefined || get(base) !== get(variant)) throw new Error(`${label} differs or is missing: not a comparable pair`);
}
console.log(`base ranAt ${base.ranAt} gate.pass ${base.gate?.pass}; variant ranAt ${variant.ranAt} gate.pass ${variant.gate?.pass}`);
if (basePath === variantPath) console.log("note: base and variant are the same file");
const lanes = [
  ["legacy", "cases", "rule1"],
  ["extended", "extendedCases", "rule2"],
  ["skills", "skillsCases", "rule1"],
  ["holdout", "holdoutCases", "rule1"],
  ["protocol-history", "protocolHistoryCases", null],
];
const metrics = ["top1", "top3", "top5", "cardHit5", "pass"];
let rule1 = false, rule2 = false;
for (const [lane, key, rule] of lanes) {
  const a = base[key] ?? [], b = variant[key] ?? [];
  if (a.length !== b.length) throw new Error(`${lane}: row count ${a.length} vs ${b.length}`);
  const byId = new Map(b.map((r) => [r.id, r]));
  const sealed = lane === "holdout";
  let listChanged = 0;
  const lines = [], listLines = [];
  for (const metric of metrics) {
    let down = 0, up = 0; const downIds = [], upIds = [];
    for (const r of a) {
      const v = byId.get(r.id);
      if (!v) throw new Error(`${lane}: a row is missing from the variant`);
      if (typeof r[metric] !== "boolean" || typeof v[metric] !== "boolean") continue;
      const hidden = sealed || r.confirmationOnly;
      if (r[metric] && !v[metric]) { down++; if (!hidden) downIds.push(r.id); }
      if (!r[metric] && v[metric]) { up++; if (!hidden) upIds.push(r.id); }
    }
    if (rule === "rule1" && down > 0) rule1 = true;
    if (rule === "rule2" && metric !== "pass" && up - down < 0) rule2 = true;
    if (down + up === 0) continue;
    const named = (n, list) => `${n}${list.length ? ` [${list.join(", ")}]` : ""}${n > list.length ? ` (${n - list.length} counted only)` : ""}`;
    lines.push(`  ${metric}: hit-to-miss ${named(down, downIds)}; miss-to-hit ${named(up, upIds)}; net ${up - down >= 0 ? "+" : ""}${up - down}`);
  }
  for (const r of a) {
    const v = byId.get(r.id);
    const ids = (x) => JSON.stringify((x.topHits ?? []).map((h) => h.id));
    if (ids(r) !== ids(v)) {
      listChanged++;
      if (showLists && !sealed && !r.confirmationOnly) {
        const fmt = (x) => (x.topHits ?? []).map((h, i) => `${i + 1}:${h.id}(${h.score})`).join(" ");
        listLines.push(`  ${r.id}\n    before ${fmt(r)}\n    after  ${fmt(v)}`);
      }
    }
  }
  if (sealed) {
    let added = 0, cleared = 0;
    for (const r of a) {
      const v = byId.get(r.id);
      if (!r.forbiddenCapture && v.forbiddenCapture) added++;
      if (r.forbiddenCapture && !v.forbiddenCapture) cleared++;
    }
    if (added > 0) rule1 = true;
    lines.push(`  forbidden captures: ${a.filter((r) => r.forbiddenCapture).length} -> ${b.filter((r) => r.forbiddenCapture).length}; rows newly captured ${added}, rows cleared ${cleared}`);
  }
  const hiddenCount = sealed ? a.length : a.filter((r) => r.confirmationOnly).length;
  console.log(`${lane} (${a.length} rows, ${hiddenCount} counted only): ordered top-five changed on ${listChanged}`);
  for (const l of lines) console.log(l);
  for (const l of listLines) console.log(l);
}
const ph = (r) => r.protocolHistoryLane ?? {};
console.log(`protocol-history lane: top1 ${ph(base).top1} -> ${ph(variant).top1}, top3 ${ph(base).top3} -> ${ph(variant).top3}, top5 ${ph(base).top5} -> ${ph(variant).top5}, control top-five captures ${ph(base).controlTop5Captures} -> ${ph(variant).controlTop5Captures}`);
const ext = (r) => r.extendedLane?.strict ?? {};
console.log(`extended strict totals: ${["top1", "top3", "top5", "cardHit5"].map((m) => `${m} ${ext(base)[m]} -> ${ext(variant)[m]}`).join(", ")}`);
console.log(rule1 ? "RULE 1: breach (a legacy, skills or holdout row went hit-to-miss, or a holdout row was newly captured)" : "RULE 1: pass");
console.log(rule2 ? "RULE 2: breach (an extended strict total fell)" : "RULE 2: pass");
process.exitCode = rule1 || rule2 ? 1 : 0;
