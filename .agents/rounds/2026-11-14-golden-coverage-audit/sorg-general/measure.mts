// usage (repo root, Node 26 or later): node .agents/rounds/2026-11-14-golden-coverage-audit/sorg-general/measure.mts research/services/stellar-org-queries.json <snapshot.json> <out.json> [--fetch]
// Ranks each answer in the raw site-search rows and in the adapter hits (limit 10) for both query forms.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { callStellarOrg } from "../../../../src/adapters/stellar-org.ts";
const [qf, snapf, outf] = process.argv.slice(2);
const set = JSON.parse(readFileSync(qf, "utf8"));
let snap: Record<string, any> = existsSync(snapf) ? JSON.parse(readFileSync(snapf, "utf8")) : {};
if (process.argv.includes("--fetch")) {
  snap = {};
  for (const q of set.queries) for (const text of [q.question, q.keyword]) {
    const r = await fetch(`https://stellar.org/api/search?${new URLSearchParams({ q: text, locale: "en" })}`, { headers: { "User-Agent": "RavenMCP/1.0" } });
    snap[text] = await r.json();
  }
  writeFileSync(snapf, JSON.stringify(snap, null, 1));
}
type Item = { kind: string; title: string; link: string };
function matches(a: any, it: Item): boolean {
  if (a.kind !== it.kind) return false;
  if (a.kind === "page") { try { return new URL(it.link, "https://stellar.org").pathname.replace(/\/$/, "") === a.path; } catch { return false; } }
  if (a.kind === "tutorial") return it.link.includes(`tutorial=${a.slug}`);
  if (a.kind === "partner") return new RegExp(`[?&]partner=${a.slug}(&|$)`).test(it.link);
  if (a.kind === "audit") return (a.titlePrefix ? it.title.startsWith(a.titlePrefix) : true) && (a.titleContains ? it.title.includes(a.titleContains) : true) && (a.urlContains ? it.link.includes(a.urlContains) : true);
  return false;
}
const rank = (q: any, items: Item[]) => { const i = items.findIndex((it) => q.answers.some((a: any) => matches(a, it))); return i < 0 ? null : i + 1; };
const entry = { id: "x", transport: { endpoint: "search" } } as any;
const out: any[] = [];
for (const q of set.queries) {
  for (const [form, text] of [["question", q.question], ["keyword", q.keyword]] as const) {
    const body = snap[text];
    const raw: Item[] = body.results.map((r: any) => ({ kind: r.kind, title: r.title, link: r.url }));
    const fake = async () => new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } });
    const res: any = await callStellarOrg(entry, { query: text, limit: 10 }, fake as any);
    const hits: Item[] = res.ok ? res.data.hits.map((h: any) => ({ kind: h.kind, title: h.title, link: h.path ?? h.url ?? h.reportUrl ?? "" })) : [];
    const owned = raw.filter((r) => /^\/(blog|press|events)(\/|$)/i.test(r.link));
    out.push({ id: q.id, group: q.group, form, text, raw: rank(q, raw), adapter: rank(q, hits), rawKinds: raw.map((r) => r.kind), ownedRows: owned.map((r) => r.link), answerKind: q.answers[0].kind });
  }
}
writeFileSync(outf, JSON.stringify(out, null, 1));
const groups = ["audit", "appdev", "programs", "all"];
const pct = (n: number, d: number) => `${n}/${d}`;
for (const form of ["question", "keyword"]) for (const g of groups) {
  const rows = out.filter((r) => r.form === form && (g === "all" || r.group === g));
  const c = (k: "raw" | "adapter", n: number) => rows.filter((r) => r[k] !== null && r[k] <= n).length;
  console.log(`${form.padEnd(8)} ${g.padEnd(8)} raw@5 ${pct(c("raw",5),rows.length)} raw@10 ${pct(c("raw",10),rows.length)} | adapter@5 ${pct(c("adapter",5),rows.length)} adapter@10 ${pct(c("adapter",10),rows.length)}`);
}
