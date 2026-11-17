// Counts only: never prints case text. Usage: node casetext-scan.mjs <repo> [K]
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
const repo = process.argv[2]; const K = Number(process.argv[3] ?? 8);
const words = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().split(" ").filter(Boolean);
const strings = (v, out = []) => { if (typeof v === "string") out.push(v); else if (v && typeof v === "object") for (const x of Object.values(v)) strings(x, out); return out; };
const sh = new Map();
const walk = (d) => readdirSync(d).flatMap((n) => { const p = join(d, n); return statSync(p).isDirectory() ? walk(p) : [p]; });
let ncases = 0;
for (const f of walk(join(repo, "eval/qa/corpus/battery")).filter((p) => p.endsWith(".json"))) {
  const c = JSON.parse(readFileSync(f, "utf8")); ncases++;
  const texts = (process.env.FIELDS === "golden" ? [c.golden, c.truth?.notes] : [c.question, c.golden, c.truth?.notes]).flatMap((v) => strings(v));
  for (const t of texts) { const w = words(t); for (let i = 0; i + K <= w.length; i++) { const k = w.slice(i, i + K).join(" "); if (!sh.has(k)) sh.set(k, new Set()); sh.get(k).add(c.id); } }
}
const caseShingles = new Map([...sh].filter(([, s]) => s.size <= 2));
const EX = [/^eval\/qa\/corpus\//, /^eval\/corpus\//, /^eval\/qa\/(cases|sample|tool-cases)\.json$/];
const files = execFileSync("git", ["-C", repo, "ls-files"], { encoding: "utf8", maxBuffer: 1 << 28 }).split("\n").filter(Boolean).filter((p) => !EX.some((r) => r.test(p)));
const rows = [];
for (const p of files) {
  let t; try { t = readFileSync(join(repo, p), "utf8"); } catch { continue; }
  if (t.includes("\u0000")) continue;
  const w = words(t); const hitCases = new Set(); let hits = 0; const seen = new Set();
  for (let i = 0; i + K <= w.length; i++) { const k = w.slice(i, i + K).join(" "); const s = caseShingles.get(k); if (s && !seen.has(k)) { seen.add(k); hits++; for (const id of s) hitCases.add(id); } }
  if (hits) rows.push({ p, cases: hitCases.size, shingles: hits });
}
rows.sort((a, b) => b.cases - a.cases);
const byTop = new Map(); for (const r of rows) { const top = r.p.split("/").slice(0, r.p.startsWith(".agents/rounds") || r.p.startsWith("research/") || r.p.startsWith("eval/") ? 3 : 1).join("/"); const v = byTop.get(top) ?? { files: 0, cases: new Set() }; v.files++; byTop.set(top, v); }
console.log(`battery cases=${ncases} K=${K} tracked files scanned=${files.length} files with case shingles=${rows.length}`);
console.log(`files with >=5 cases: ${rows.filter((r) => r.cases >= 5).length}; >=1 case with >=3 shingles: ${rows.filter((r) => r.shingles >= 3).length}`);
for (const r of rows.slice(0, Number(process.env.TOP ?? 60))) console.log(`${r.cases}\t${r.shingles}\t${r.p}`);
console.log("--- by area (files)"); for (const [k, v] of [...byTop].sort((a, b) => b[1].files - a[1].files).slice(0, 40)) console.log(`${v.files}\t${k}`);
