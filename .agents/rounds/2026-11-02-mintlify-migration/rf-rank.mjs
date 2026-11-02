// Mintlify ranking of <ResponseField> text vs prose on the same pages (sd-059 evidence).
// Run from the repo root (reads MINTLIFY_ASSISTANT_API_KEY from .env; prints no key):
//   node .agents/rounds/2026-11-02-mintlify-migration/rf-rank.mjs <files.txt> <out.json>
import { readFileSync, writeFileSync } from "node:fs";
const env = Object.fromEntries(readFileSync(".env","utf8").split("\n").map(l=>l.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)).filter(Boolean).map(m=>[m[1],m[2].replace(/^["']|["']$/g,"")]));
const post = async (kind, body) => { const r = await fetch(`https://api.mintlify.com/discovery/v1/${kind}/stellardevelopmentfoundation`, { method: "POST", headers: { Authorization: `Bearer ${env.MINTLIFY_ASSISTANT_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify(body) }); return r.ok ? r.json() : null; };
const files = readFileSync(process.argv[2], "utf8").trim().split("\n").filter((f) => /\.mdx?$/.test(f));
const rows = [];
for (const file of files) {
  const path = file.replace(/\.mdx?$/, "");
  const page = await post("page", { path });
  if (!page?.content) { rows.push({ path, skip: "no-page" }); continue; }
  const c = page.content;
  // Sentence inside a ResponseField body vs a prose sentence outside any tag.
  const rf = [...c.matchAll(/<ResponseField[^>]*>\s*([^<\n][^<]{40,})/g)].map((m) => m[1].trim().split("\n")[0]).filter((s) => s.length > 40);
  const outside = c.replace(/<ResponseField[\s\S]*?<\/ResponseField>/g, "").replace(/```[\s\S]*?```/g, "");
  const prose = outside.split("\n").map((l) => l.trim()).filter((l) => l.length > 50 && /^[A-Z]/.test(l) && !/[<|>]/.test(l) && !l.startsWith("These are result codes"));
  const rank = async (q) => { const r = await post("search", { query: q.slice(0, 160), pageSize: 50 }); return r ? r.findIndex((x) => x.path.replace(/\/index$/, "") === path.replace(/\/index$/, "")) : -2; };
  const rfQ = rf[Math.floor(rf.length / 2)], prQ = prose[Math.floor(prose.length / 2)];
  rows.push({ path, rfRank: rfQ ? await rank(rfQ) : null, proseRank: prQ ? await rank(prQ) : null, rfQ: rfQ?.slice(0, 80), prQ: prQ?.slice(0, 80) });
}
writeFileSync(process.argv[3], JSON.stringify(rows, null, 1));
const s = (k) => { const xs = rows.filter((r) => typeof r[k] === "number"); return { n: xs.length, top1: xs.filter((r) => r[k] === 0).length, top5: xs.filter((r) => r[k] >= 0 && r[k] < 5).length, miss50: xs.filter((r) => r[k] < 0).length }; };
console.log(JSON.stringify({ files: files.length, responseFieldSentence: s("rfRank"), proseSentence: s("proseRank") }));
