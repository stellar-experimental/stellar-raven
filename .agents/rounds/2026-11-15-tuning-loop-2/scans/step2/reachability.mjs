#!/usr/bin/env node
// Read-only reachability record for the 12 source rows of tuning loop 2 (PLAN section 2; A8).
// For each row: does `stellarOrg.search_site`, asked the case question, return a page the golden
// cites, and does `stellarOrg.get_page` return text for each cited page. Calls go through the
// adapter (`callStellarOrg`) against stellar.org: free, keyless, GET only, no model, no secret.
//
// Hygiene: the 12 ids come from the committed roles scan (`scans/step2/roles.json`) and must all sit
// in the committed panel (`scans/panel-ids.txt`); the case file is filtered by those ids before any
// other field is read, and the count is asserted. Only `question` and `truth.sources[].ref` are
// read. No golden answer, key fact, verdict or transcript is opened.
//
// usage (repo root, Node 26): node .agents/rounds/2026-11-15-tuning-loop-2/scans/step2/reachability.mjs <out.json>
import { readFileSync, writeFileSync } from "node:fs";
import { callStellarOrg } from "../../../../../src/adapters/stellar-org.ts";

const ROUND = ".agents/rounds/2026-11-15-tuning-loop-2/scans";
const roles = JSON.parse(readFileSync(`${ROUND}/step2/roles.json`, "utf8"));
const panel = new Set(readFileSync(`${ROUND}/panel-ids.txt`, "utf8").trim().split(","));
const ids = roles.sourceRows;
if (ids.length !== 12 || new Set(ids).size !== 12) throw new Error("expected 12 unique source rows");
if (panel.size !== 58 || !ids.every((id) => panel.has(id))) throw new Error("a source row is outside the 58-row panel");

const raw = JSON.parse(readFileSync("eval/qa/cases.json", "utf8"));
const wanted = new Set(ids);
const selected = (Array.isArray(raw) ? raw : raw.cases).filter((c) => wanted.has(c.id));
if (selected.length !== 12) throw new Error(`selected ${selected.length} cases, expected 12`);
const byId = new Map(selected.map((c) => [c.id, { question: c.question, refs: (c.truth?.sources ?? []).map((s) => s?.ref) }]));

const EXCLUDED = /^\/(blog|press|events)(\/|$)/;
const stellarOrgPath = (ref) => {
  try {
    const url = new URL(String(ref));
    return url.hostname === "stellar.org" || url.hostname === "www.stellar.org" ? url.pathname.replace(/\/$/, "") || "/" : null;
  } catch {
    return null;
  }
};
const SEARCH = { id: "stellarOrg.search_site", transport: { endpoint: "search" } };
const PAGE = { id: "stellarOrg.get_page", transport: { endpoint: "page" } };
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const summarize = (r) => (r.ok ? { ok: true, caveat: r.caveat ?? null } : { ok: false, kind: r.error.kind, message: r.error.message.slice(0, 160) });

const rows = [];
for (const id of ids) {
  const { question, refs } = byId.get(id);
  const cited = [...new Set(refs.map(stellarOrgPath).filter((p) => p !== null))];
  const served = cited.filter((p) => !EXCLUDED.test(p));
  let search = await callStellarOrg(SEARCH, { query: question, limit: 10 });
  let retried = false;
  if (!search.ok && search.error.kind === "soft-empty") {
    await pause(1500);
    search = await callStellarOrg(SEARCH, { query: question, limit: 10 });
    retried = true;
  }
  const hits = search.ok ? search.data.hits : [];
  const rank = (path) => {
    const i = hits.findIndex((h) => typeof h.path === "string" && h.path.replace(/\/$/, "") === path);
    return i < 0 ? null : i + 1;
  };
  const ranks = Object.fromEntries(served.map((p) => [p, rank(p)]));
  await pause(600);
  const pages = {};
  for (const path of served) {
    const page = await callStellarOrg(PAGE, { path });
    pages[path] = page.ok
      ? { ok: true, chars: page.data.content.length, truncated: Boolean(page.data.truncated), title: String(page.data.title ?? "").slice(0, 80) }
      : summarize(page);
    await pause(600);
  }
  rows.push({
    id,
    cited,
    served,
    search: { ...summarize(search), retried, hits: hits.length, kinds: hits.map((h) => h.kind) },
    ranks,
    pages,
    searchReaches: served.some((p) => ranks[p] !== null),
    pageReadable: served.some((p) => pages[p].ok && pages[p].chars > 0)
  });
  await pause(600);
}
writeFileSync(process.argv[2], JSON.stringify(rows, null, 1));

const at = (n) => rows.filter((r) => Object.values(r.ranks).some((k) => k !== null && k <= n)).length;
console.log(`rows ${rows.length}; served golden pages ${rows.reduce((n, r) => n + r.served.length, 0)}`);
console.log(`search_site returns a cited page: top 5 ${at(5)}, top 7 ${at(7)}, top 10 ${at(10)} of ${rows.length}`);
console.log(`get_page returns text for a cited page: ${rows.filter((r) => r.pageReadable).length} of ${rows.length}`);
console.log(`both: ${rows.filter((r) => r.searchReaches && r.pageReadable).length}; page only: ${rows.filter((r) => !r.searchReaches && r.pageReadable).length}; neither: ${rows.filter((r) => !r.pageReadable).length}`);
for (const r of rows) {
  console.log(
    `${r.id.padEnd(44)} search ${r.search.ok ? `${r.search.hits} hits` : `${r.search.kind}${r.search.retried ? " (retried)" : ""}`}`.padEnd(70),
    "| rank", JSON.stringify(r.ranks), "| page", JSON.stringify(Object.fromEntries(Object.entries(r.pages).map(([p, v]) => [p, v.ok ? v.chars : v.kind])))
  );
}
