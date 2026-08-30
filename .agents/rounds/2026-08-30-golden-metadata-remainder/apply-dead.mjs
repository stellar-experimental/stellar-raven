// Apply verified dead-provenance repairs. Usage: node apply-dead.mjs <lane> [--dry]
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
const [lane, dry] = process.argv.slice(2);
const P = path.dirname(new URL(import.meta.url).pathname);
const ROOT = process.cwd();
const list = readFileSync(`${P}/lane-${lane}.txt`, "utf8").trim().split("\n");
const TODO = ".agents/TODO.md — Replace expired temporary evidence in golden truth metadata";
const FABLE = "Independent Fable copy-review report (temporary path, unrecoverable); its claims were re-verified live on 2026-08-30 — see the Live re-check lines.";
const OV = existsSync(`${P}/overrides.json`) ? JSON.parse(readFileSync(`${P}/overrides.json`, "utf8")) : {};
const out = { applied: [], skipped: [] };
for (const rel of list) {
  const file = path.join(ROOT, rel);
  const c = JSON.parse(readFileSync(file, "utf8"));
  const mf = `${P}/matrices/${lane}/${c.id}.json`;
  if (!existsSync(mf)) { out.skipped.push([c.id, "no matrix"]); continue; }
  const m = JSON.parse(readFileSync(mf, "utf8"));
  const n = c.golden.keyFacts.length;
  const ov = OV[c.id] || {};
  const okVerdict = x => ["confirmed", "confirmed-as-of"].includes(x.verdict) || (ov.acceptDisputed && x.verdict === "disputed");
  const ok = (m.result === "DONE" || (ov.acceptDisputed && m.result === "CONFLICT")) && m.claims.length === n && m.claims.every(okVerdict) && m.evidenceLines.length === n && m.evidenceLines.every(l => l.startsWith("Live re-check 2026-08-30:") && l.length <= 240 && !/corpus|reviewer|golden|catalog/i.test(l)) && /^Sibling sweep 2026-08-30:/.test(m.siblingSweep);
  if (!ok) { out.skipped.push([c.id, `matrix not clean: result=${m.result} claims=${m.claims.map(x=>x.verdict).join(",")} lines=${m.evidenceLines.length}/${n}`]); continue; }
  const v = c.truth.verified;
  let replaced = 0;
  v.evidence = v.evidence.map(line => {
    if (line.includes("conversions-copy-review.md")) { replaced++; return FABLE; }
    let r = line.replace(/\/tmp\/raven-qadeep\/gt2\/review-b([45])-part([123])\.md/g, (_, b, p) => `program-log.md § Session 2 › Batch ${b} › Part ${p} review (gt2-grok-rev)`).replace("/tmp/raven-qadeep/review-judge.md", "research/qa-deep-dive-2026-08-25/review-judge.md");
    if (r !== line) replaced++;
    return r;
  });
  v.evidence.push(...m.evidenceLines, ...(ov.extraLines || []), m.siblingSweep);
  v.date = "2026-08-30";
  v.by = `golden-truth metadata remainder (2026-08-30, dead-provenance lane ${lane}, worker gmr-sol-${lane}; orchestrator applied)`;
  if (!v.rootCause.includes(TODO)) v.rootCause.push(TODO);
  if (!dry) writeFileSync(file, JSON.stringify(c, null, 2) + "\n");
  out.applied.push([c.id, replaced]);
}
console.log(JSON.stringify(out, null, 1));
