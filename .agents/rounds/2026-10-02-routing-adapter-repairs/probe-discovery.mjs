import fs from "node:fs";
import { execSync } from "node:child_process";
const { loadManifest, searchCatalog } = await import(process.cwd() + "/src/catalog/search.ts");
const base = JSON.parse(execSync("git show origin/main:catalog/manifest.json", { maxBuffer: 1e8 }).toString());
const cand = JSON.parse(fs.readFileSync("catalog/manifest.json", "utf8"));
const cats = { base: loadManifest(base), candidate: loadManifest(cand) };
const queries = [
  "How do x402, MPP, AP2, and ACP compare for agent payments, and which are Stellar-specific vs general?",
  "Stellar skills for signing messages", "Stellar skills for security auditing", "Stellar authority skills",
  "Are there any model context protocol skills for Stellar?", "What Stellar AI skills can I install?", "List Stellar skills",
  "Search Stellar research across CAP and SEP sources", "What community skills are listed on skills.stellar.org?"
];
for (const q of queries) {
  console.log("\n## " + q);
  for (const [name, c] of Object.entries(cats)) {
    const hits = searchCatalog(c, { query: q, limit: 5 });
    console.log("  " + name.padEnd(9), hits.map((h) => `${h.id.replace(/^(stellarDocs|lumenloop|scout|skills)\./, "")}:${h.score}:${h.tier[0]}`).join(" | "));
  }
}
