// Round item 3.3 instrument: stellarOrg displacement, the two effect targets, off-golden reach and
// FAM development reach.
// usage (repo root, Node 26): node .agents/rounds/2026-11-16-next-phase/items/3.3/measure.mts <out.json> [fam.development.discovery.json]
// In-process, no model, no network. Displacement compares the same ranker on the catalog with and
// without the stellarOrg entries. The FAM file exists only on agentpc (~/backups/fd-2026-11-14/split/);
// its rows are counted, never printed.
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { loadManifest, searchCatalogPage } from "../../../../../src/catalog/search.ts";
const here = ".agents/rounds/2026-11-16-next-phase/items/3.3";
const FAM_SHA256 = "0246ad022163f1d67247671b8ed640d7bb61f1aec6cad65a937ffa33b56cf89c";
const raw = JSON.parse(readFileSync("catalog/manifest.json", "utf8"));
const full = loadManifest(raw);
const bare = loadManifest({ ...raw, entries: raw.entries.filter((e: { id: string }) => !e.id.startsWith("stellarOrg.")) });
const page = (cat: ReturnType<typeof loadManifest>, q: string, limit: number) => searchCatalogPage(cat, { query: q, limit }).hits;
const ids = (cat: ReturnType<typeof loadManifest>, q: string, limit: number) => page(cat, q, limit).map((h) => h.id);
const gatedCount = (q: string) => page(full, q, 50).filter((h) => h.tier === "gated").length;
const isOrg = (id: string) => id.startsWith("stellarOrg.");
const out: Record<string, unknown> = {};

// 1. Probe: displacement at limits 5, 7, 10, with each stellarOrg card's tier and score.
const probe = JSON.parse(readFileSync(`${here}/probe-queries.json`, "utf8")).queries as Array<{ query: string; sdf: boolean }>;
const probeRows = [];
for (const limit of [5, 7, 10]) {
  for (const { query, sdf } of probe) {
    const a = ids(bare, query, limit), hits = page(full, query, limit), b = hits.map((h) => h.id);
    const org = hits.map((h, i) => ({ h, rank: i + 1 })).filter(({ h }) => isOrg(h.id))
      .map(({ h, rank }) => `${h.id}@${rank} ${h.tier} ${h.score}`);
    const lost = org.length ? a.filter((x) => !b.includes(x)) : [];
    probeRows.push({ limit, query, sdf, org, lost, gatedCandidates: org.length ? gatedCount(query) : undefined });
  }
}
out.probe = probeRows;
console.log("probe (non-SDF of 25 / SDF of 5): stellarOrg on page; displaces a card");
for (const limit of [5, 7, 10]) {
  const r = probeRows.filter((x) => x.limit === limit);
  const c = (sdf: boolean, k: "org" | "lost") => r.filter((x) => x.sdf === sdf && x[k].length > 0).length;
  console.log(`  limit ${String(limit).padStart(2)}: non-SDF on ${c(false, "org")}, displaces ${c(false, "lost")}; SDF on ${c(true, "org")}`);
}
for (const x of probeRows.filter((x) => x.limit === 10 && !x.sdf && x.org.length)) {
  console.log(`  non-SDF @10 "${x.query}": ${x.org.join(", ")}; gated candidates ${x.gatedCandidates}; lost ${x.lost.join(", ")}`);
}

// 2. Effect targets, fixed before any run (orchestrator answer to QUESTION.md).
const orgPages = [["which organizations run validators", 5], ["Tier 1 organization validators quorum requirements", 8]] as const;
const prefixFloorTarget = orgPages.every(([q, limit]) => !ids(full, q, limit).some(isOrg));
const reentrancy = ids(full, "soroban reentrancy security", 8);
const slotKeepingTarget = reentrancy.includes("stellarDocs.search_soroban_contract_docs");
out.targets = { prefixFloor: prefixFloorTarget, slotKeeping: slotKeepingTarget };
console.log(`effect target, prefix floor (no stellarOrg card on either org page): ${prefixFloorTarget ? "met" : "not met"}`);
console.log(`effect target, slot keeping (search_soroban_contract_docs on the reentrancy page @8): ${slotKeepingTarget ? "met" : "not met"}`);
for (const [q, limit] of [...orgPages, ["soroban reentrancy security", 8] as const]) {
  console.log(`  spot "${q}" @${limit}: ${page(full, q, limit).map((h, i) => `${i + 1}:${h.id}(${h.tier} ${h.score})`).join(" ")}`);
}

// 3. Off-golden 40: a stellarOrg operation on the page at limits 5, 7, 10.
const set = JSON.parse(readFileSync("research/services/stellar-org-queries.json", "utf8"));
const og: Record<string, number> = {};
for (const q of set.queries) for (const [form, text] of [["question", q.question], ["keyword", q.keyword]]) for (const limit of [5, 7, 10]) {
  const k = `${form}@${limit}`; og[k] = (og[k] ?? 0) + (ids(full, text, limit).some(isOrg) ? 1 : 0);
}
out.offGolden = og;
console.log(`off-golden 40 reach: ${Object.entries(og).map(([k, v]) => `${k} ${v}`).join(", ")}`);

// 4. FAM development: operation reach (a card in acceptableOps) at limits 5, 7, 10, and stellarOrg on unlabelled rows.
const famPath = process.argv[3];
if (famPath) {
  const famBytes = readFileSync(famPath);
  const sha = createHash("sha256").update(famBytes).digest("hex");
  if (sha !== FAM_SHA256) throw new Error(`FAM development file SHA-256 ${sha} is not ${FAM_SHA256}`);
  const fam = JSON.parse(famBytes.toString("utf8")).cases as Array<{ id: string; question: string; acceptableOps?: string[] }>;
  const labelled = fam.filter((c) => (c.acceptableOps ?? []).length > 0);
  const famRows = [];
  for (const limit of [5, 7, 10]) for (const c of labelled) {
    const b = ids(full, c.question, limit);
    famRows.push({ limit, id: c.id, reach: b.some((x) => c.acceptableOps!.includes(x)), orgUnlabelled: b.some(isOrg) && !c.acceptableOps!.some(isOrg) });
  }
  out.fam = famRows;
  for (const limit of [5, 7, 10]) {
    const r = famRows.filter((x) => x.limit === limit);
    console.log(`FAM development (${r.length} labelled) limit ${String(limit).padStart(2)}: reach ${r.filter((x) => x.reach).length}, stellarOrg on unlabelled ${r.filter((x) => x.orgUnlabelled).length}`);
  }
}
writeFileSync(process.argv[2], JSON.stringify(out, null, 1));
