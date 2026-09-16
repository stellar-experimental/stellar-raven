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
  (candidate: { id: string }) => candidate.id === "stellarDocs.get_doc_page_sections",
);
if (!entry) throw new Error("missing stellarDocs.get_doc_page_sections");

const targets = [
  ["sd-040", "/docs/build/guides/conversions/address-conversions", ["xdr-conversions-in-smart-contracts"]],
  ["sd-041", "/docs/build/guides/transactions/pooled-accounts-muxed-accounts-memos", [""]],
  ["sd-044", "/docs/tools/quickstart/advanced-usage/operation-modes", ["manual-close-mode"]],
  ["sd-044", "/docs/tools/quickstart/network-modes", ["local"]],
  ["sd-045", "/docs/build/guides/dapps/frontend-guide", ["setup-https-on-localhost"]],
  [
    "sd-051",
    "/docs/networks/software-versions",
    [
      "protocol-20-soroban-phase-0-mainnet-february-20-2024",
      "protocol-20-soroban-phase-1-february-27-2024",
      "protocol-20-soroban-phase-2-march-19-2024",
    ],
  ],
] as const;

const results = [];
for (const [id, path, anchors] of targets) {
  const result = await callStellarDocs(
    entry as never,
    { path, includeContent: true },
    {
      ALGOLIA_APPLICATION_ID_DOCS: env.ALGOLIA_APPLICATION_ID_DOCS,
      ALGOLIA_API_KEY_DOCS: env.ALGOLIA_API_KEY_DOCS,
    } as never,
  );
  if (!result.ok) {
    results.push({ id, path, ok: false, error: result.error });
    continue;
  }
  const data = result.data as {
    complete: boolean;
    nbSections: number;
    sections: Array<{ anchor: string; breadcrumb: string; content?: string }>;
  };
  results.push({
    id,
    path,
    ok: true,
    complete: data.complete,
    nbSections: data.nbSections,
    sections: data.sections
      .filter((section) => anchors.includes(section.anchor as never))
      .map((section) => ({
        anchor: section.anchor,
        breadcrumb: section.breadcrumb,
        content: (section.content ?? "").slice(0, 3500),
      })),
  });
}

console.log(JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2));
