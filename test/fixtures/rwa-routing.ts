import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { extractKeywords } from "../../src/catalog/extract-keywords.ts";
import { extractRoutingExclusions, extractRoutingPhrases } from "../../src/catalog/extract-routing-phrases.ts";

// Use the complete published routing fields, independent of the test queries.
// This fixture does not change the manifest or the builder's exposure policy.
const inventory = JSON.parse(readFileSync(fileURLToPath(new URL("../../inventory/stellar-light.json", import.meta.url).href), "utf8"));
const operation = inventory.openapi.paths["/api/rwa"].get;
const routing = operation["x-routing"];
const source = { ...routing, purpose: [routing.purpose] };
const description = `${operation.summary}. ${operation.description}`;
const id = "scout.getRwaAssets";
const routingKeywords = extractKeywords([
  ...source.purpose, ...source.useWhen, ...source.exampleQuestions, ...source.keywords
].join("\n"), { exclude: [id, "scout", "operation", description], cap: 256 });

export const rwaEntry = {
  id,
  service: "scout",
  kind: "operation",
  description,
  inputSchema: {
    type: "object",
    properties: Object.fromEntries(operation.parameters.map((parameter: { name: string; schema: unknown; description: string }) => [
      parameter.name, { ...parameter.schema as object, description: parameter.description }
    ]))
  },
  outputSchema: operation.responses["200"].content["application/json"].schema,
  routingKeywords,
  routingPhrases: extractRoutingPhrases(source),
  routingExclusions: extractRoutingExclusions(source.notFor),
  transport: { type: "http", method: "GET", path: "/api/rwa", base: "https://stellarlight.xyz" },
  provenance: { source: "inventory/stellar-light.json", fetchedAt: inventory.fetchedAt }
};
