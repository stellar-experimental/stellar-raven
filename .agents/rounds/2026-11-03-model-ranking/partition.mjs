// Deterministic, stratified dev/confirm partition for the 2026-11-03 model-ranking round.
// Usage: node partition.mjs <repo-root> <out-file>
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
const [repo, out] = process.argv.slice(2);
const SEED = "raven-model-ranking-2026-11-03-A1";
const h = (s) => createHash("sha256").update(s).digest("hex");
const routing = JSON.parse(readFileSync(join(repo, "eval/routing-cases.json"), "utf8"));
const skills = JSON.parse(readFileSync(join(repo, "eval/skills-cases.json"), "utf8"));
const lanes = { legacy: routing.cases, skills: skills.cases };
const result = { schema: 1, seed: SEED,
  method: "Per lane, group rows by expected_service. In each group, sort by sha256(seed + U+0000 + row id) ascending. Assign positions 0,2,4,... to dev and 1,3,5,... to confirm.",
  inputs: {
    "eval/routing-cases.json": h(readFileSync(join(repo, "eval/routing-cases.json"))),
    "eval/skills-cases.json": h(readFileSync(join(repo, "eval/skills-cases.json"))) },
  lanes: {} };
for (const [lane, rows] of Object.entries(lanes)) {
  const groups = new Map();
  for (const r of rows) { if (!groups.has(r.expected_service)) groups.set(r.expected_service, []); groups.get(r.expected_service).push(r.id); }
  const dev = [], confirm = [], strata = {};
  for (const svc of [...groups.keys()].sort()) {
    const ids = groups.get(svc).map((id) => [h(SEED + "\u0000" + id), id]).sort((a, b) => (a[0] < b[0] ? -1 : 1)).map((x) => x[1]);
    ids.forEach((id, i) => (i % 2 === 0 ? dev : confirm).push(id));
    strata[svc] = { n: ids.length, dev: Math.ceil(ids.length / 2), confirm: Math.floor(ids.length / 2) };
  }
  result.lanes[lane] = { n: rows.length, strata, dev: dev.sort(), confirm: confirm.sort() };
}
writeFileSync(out, JSON.stringify(result, null, 2) + "\n");
for (const [l, v] of Object.entries(result.lanes)) console.log(l, v.n, "dev", v.dev.length, "confirm", v.confirm.length, JSON.stringify(v.strata));
