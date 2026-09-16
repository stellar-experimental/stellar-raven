import { readFileSync } from "node:fs";
import manifest from "../../../../catalog/manifest.json";
import { callStellarDocs } from "../../../../src/adapters/stellar-docs.ts";

const repoRoot = process.cwd();
const env: Record<string, string> = {};
for (const line of readFileSync(`${repoRoot}/.dev.vars`, "utf8").split(/\r?\n/)) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (match) env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
}
const entry = manifest.entries.find(
  (candidate: { id: string }) => candidate.id === "stellarDocs.search_docs",
);
if (!entry) throw new Error("missing stellarDocs.search_docs");

const query = "enable-core-manual-close quickstart manual close ledger";
const result = await callStellarDocs(
  entry as never,
  { query, includeContent: true, hitsPerPage: 20 },
  {
    ALGOLIA_APPLICATION_ID_DOCS: env.ALGOLIA_APPLICATION_ID_DOCS,
    ALGOLIA_API_KEY_DOCS: env.ALGOLIA_API_KEY_DOCS,
  } as never,
);
if (!result.ok) {
  console.log(JSON.stringify({ generatedAt: new Date().toISOString(), query, ok: false, error: result.error }, null, 2));
  process.exit(0);
}

const data = result.data as { nbHits: number; hits: Array<Record<string, unknown>> };
const relevant = data.hits
  .filter((hit) => {
    const text = `${hit.url ?? ""}\n${hit.breadcrumb ?? ""}\n${hit.content ?? ""}\n${hit.snippet ?? ""}`;
    return text.includes("enable-core-manual-close") || text.includes("manualclose");
  })
  .map((hit) => ({
    url: hit.url,
    breadcrumb: hit.breadcrumb,
    hasFlag: String(hit.content ?? hit.snippet ?? "").includes("--enable-core-manual-close"),
    hasManualclose: String(hit.content ?? hit.snippet ?? "").includes("manualclose"),
  }));

const url = "https://developers.stellar.org/docs/tools/quickstart/advanced-usage/run-command-examples";
const response = await fetch(url);
const text = (await response.text())
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/&amp;/g, "&")
  .replace(/&quot;/g, '"')
  .replace(/&#39;|&apos;/g, "'")
  .replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">")
  .replace(/\s+/g, " ")
  .trim();

console.log(JSON.stringify({
  generatedAt: new Date().toISOString(),
  query,
  ok: true,
  nbHits: data.nbHits,
  relevant,
  sourceStatus: response.status,
  sourceHasFlag: text.includes("--enable-core-manual-close"),
  sourceHasPort: text.includes('127.0.0.1:11626:11626'),
}, null, 2));
