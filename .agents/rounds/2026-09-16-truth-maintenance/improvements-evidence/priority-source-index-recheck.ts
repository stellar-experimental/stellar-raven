import { readFileSync } from "node:fs";
import manifest from "../../../../catalog/manifest.json";
import { callStellarDocs } from "../../../../src/adapters/stellar-docs.ts";

const repoRoot = process.cwd();
const envText = readFileSync(`${repoRoot}/.dev.vars`, "utf8");
const env: Record<string, string> = {};
for (const line of envText.split(/\r?\n/)) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (match) env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
}

const entry = manifest.entries.find(
  (candidate: { id: string }) => candidate.id === "stellarDocs.get_doc_page_sections",
);
if (!entry) throw new Error("missing stellarDocs.get_doc_page_sections");

const checks = [
  {
    id: "sd-040",
    path: "/docs/build/guides/conversions/address-conversions",
    markers: [
      "Address::from_xdr(&env, &bytes).unwrap()",
      "ConversionError",
      "the conversion panics",
      "Result<Address, ConversionError>",
    ],
  },
  {
    id: "sd-041",
    path: "/docs/build/guides/transactions/pooled-accounts-muxed-accounts-memos",
    markers: [
      "We used memos in the past",
      "Transaction memos were traditionally used",
      "many services still rely on them",
      "This guide covers both approaches",
    ],
  },
  {
    id: "sd-044-operation",
    path: "/docs/tools/quickstart/advanced-usage/operation-modes",
    markers: [
      "Manual close mode",
      "--enable-core-manual-close",
      "MANUAL_CLOSE",
      "manualclose",
      "existing persistent volume",
    ],
  },
  {
    id: "sd-044-example",
    path: "/docs/tools/quickstart/advanced-usage/run-command-examples",
    markers: ["--local --enable-core-manual-close"],
  },
  {
    id: "sd-044-network",
    path: "/docs/tools/quickstart/network-modes",
    markers: ["--enable-core-manual-close", "Operation Modes"],
  },
  {
    id: "sd-045",
    path: "/docs/build/guides/dapps/frontend-guide",
    markers: [
      "secure connection (HTTPS)",
      "W3C Secure Contexts",
      "http://localhost",
      "http://127.0.0.1",
      "To enable HTTPS on localhost anyway",
    ],
  },
  {
    id: "sd-051",
    path: "/docs/networks/software-versions",
    markers: [
      "Protocol 20: Soroban Phase 0 (Mainnet, February 20, 2024)",
      "Mainnet activated Protocol 20 on February 20, 2024 at 1700 UTC",
      "Stellar Core v20.2.0 on February 5, 2024",
      "Protocol 20: Soroban Phase 1 (February 27, 2024)",
      "Protocol 20: Soroban Phase 2 (March 19, 2024)",
      "Mainnet Edition",
    ],
  },
];

function decodeHtml(value: string): string {
  return value
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
}

function counts(text: string, markers: string[]) {
  return Object.fromEntries(markers.map((marker) => [marker, text.split(marker).length - 1]));
}

const generatedAt = new Date().toISOString();
const results = [];
for (const check of checks) {
  const url = `https://developers.stellar.org${check.path}`;
  const response = await fetch(url, { redirect: "follow" });
  const sourceText = decodeHtml(await response.text());
  const indexed = await callStellarDocs(
    entry as never,
    { path: check.path, includeContent: true },
    {
      ALGOLIA_APPLICATION_ID_DOCS: env.ALGOLIA_APPLICATION_ID_DOCS,
      ALGOLIA_API_KEY_DOCS: env.ALGOLIA_API_KEY_DOCS,
    } as never,
  );
  let indexResult: Record<string, unknown>;
  if (!indexed.ok) {
    indexResult = { ok: false, error: indexed.error };
  } else {
    const data = indexed.data as {
      sections: Array<{ anchor?: string; content?: string }>;
      nbSections: number;
      complete: boolean;
      truncated: boolean;
      truncationReason?: string;
    };
    const indexText = data.sections.map((section) => section.content ?? "").join("\n");
    indexResult = {
      ok: true,
      nbSections: data.nbSections,
      complete: data.complete,
      truncated: data.truncated,
      truncationReason: data.truncationReason ?? null,
      markerCounts: counts(indexText, check.markers),
      matchingAnchors: data.sections
        .filter((section) =>
          check.markers.some((marker) => (section.content ?? "").includes(marker)),
        )
        .map((section) => section.anchor ?? ""),
    };
  }
  results.push({
    id: check.id,
    path: check.path,
    source: { httpStatus: response.status, markerCounts: counts(sourceText, check.markers) },
    index: indexResult,
  });
}

console.log(JSON.stringify({ generatedAt, results }, null, 2));
