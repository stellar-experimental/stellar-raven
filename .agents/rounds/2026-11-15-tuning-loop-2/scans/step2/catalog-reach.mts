// Free routing check for the stellarOrg source: catalog `search` over the off-golden 40-question set.
// usage (repo root, Node 26): node .agents/rounds/2026-11-15-tuning-loop-2/scans/step2/catalog-reach.mts <out.json> [manifest.json]
// For each question, in its natural form and its keyword form, the catalog page at limits 5 and 7 and
// whether it holds a stellarOrg operation. Counts only; no golden case, no model, no network.
import { readFileSync, writeFileSync } from "node:fs";
import { loadManifest, searchCatalogPage } from "../../../../../src/catalog/search.ts";
const catalog = loadManifest(JSON.parse(readFileSync(process.argv[3] ?? "catalog/manifest.json", "utf8")));
const set = JSON.parse(readFileSync("research/services/stellar-org-queries.json", "utf8"));
const rows: Array<Record<string, unknown>> = [];
for (const q of set.queries) {
  for (const [form, text] of [["question", q.question], ["keyword", q.keyword]] as const) {
    const row: Record<string, unknown> = { id: q.id, group: q.group, form };
    for (const limit of [5, 7]) {
      const page = searchCatalogPage(catalog, { query: text, limit });
      const ids = page.hits.map((h) => h.id);
      row[`org@${limit}`] = ids.some((id) => id.startsWith("stellarOrg."));
      row[`rank@${limit}`] = ids.findIndex((id) => id.startsWith("stellarOrg.")) + 1 || null;
      row[`hits@${limit}`] = ids.length;
    }
    rows.push(row);
  }
}
writeFileSync(process.argv[2], JSON.stringify(rows, null, 1));
for (const form of ["question", "keyword"]) {
  const r = rows.filter((x) => x.form === form);
  const n = (k: string) => r.filter((x) => x[k]).length;
  console.log(`${form.padEnd(8)} stellarOrg in the page: limit 5 ${n("org@5")}/${r.length}, limit 7 ${n("org@7")}/${r.length}`);
}
