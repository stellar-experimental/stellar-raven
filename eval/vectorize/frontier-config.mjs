import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SERVICE_FAMILY_PURPOSES, WORKFLOW_ARCHETYPES } from "../../scripts/catalog-data/workflow-archetypes.mjs";

const DIR = path.dirname(fileURLToPath(import.meta.url));
export const REPO = path.resolve(DIR, "../..");
export const ARTIFACT_PATH = path.join(DIR, "artifacts", "qwen3-embedding-0.6b-q8-c25a394.json");

export const MODEL = Object.freeze({
  provider: "huggingface-local-onnx",
  id: "onnx-community/Qwen3-Embedding-0.6B-ONNX",
  revision: "c25a394dd583836952667c12f008335071b3f43d",
  baseModel: "Qwen/Qwen3-Embedding-0.6B",
  baseRevisionObserved: "97b0c614be4d77ee51c0cef4e5f07c00f9eb65b3",
  runtime: "@huggingface/transformers@4.2.0",
  dtype: "q8",
  pooling: "last_token",
  normalize: true,
  dimensions: 1024,
  metric: "cosine"
});

export const QUERY_TASK =
  "Given a Stellar ecosystem search query, retrieve the exposed operation routing card that can ground it";
export const POLICY = Object.freeze({ id: "semantic-rerank-lexical-top20-v1", candidateCount: 20 });

export function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

export function queryText(query) {
  return `Instruct: ${QUERY_TASK}\nQuery: ${query}`;
}

export function buildCatalogCards(manifest = JSON.parse(readFileSync(path.join(REPO, "catalog", "manifest.json"), "utf8"))) {
  const familyPurpose = new Map(
    SERVICE_FAMILY_PURPOSES.map((purpose) => [
      purpose.family,
      `${purpose.label}. ${purpose.line} ${purpose.authority}`
    ])
  );
  const workflowsByOperation = new Map();
  for (const workflow of WORKFLOW_ARCHETYPES) {
    for (const step of workflow.steps) {
      const list = workflowsByOperation.get(step) ?? [];
      list.push(`${workflow.title}: ${workflow.questionShape}`);
      workflowsByOperation.set(step, list);
    }
  }
  return manifest.entries
    // Only entries the lexical stage can surface are worth embedding: the
    // policy reranks searchCatalog's top-N, which never includes
    // searchable:false entries (skill sections since the 2026-07-13 A/B), so
    // their vectors are unreachable by construction.
    .filter((entry) => entry.searchable !== false)
    .map((entry) => ({
      id: entry.id,
      service: entry.service,
      kind: entry.kind,
      text: [
        `Catalog entry: ${entry.id}. Kind: ${entry.kind}.`,
        `Source family: ${familyPurpose.get(entry.service) ?? entry.service}.`,
        entry.description,
        ...(workflowsByOperation.get(entry.id) ?? []).map((workflow) => `Workflow: ${workflow}`)
      ].join("\n\n")
    }))
    .sort((left, right) => left.id.localeCompare(right.id));
}

export function cardSetHash(cards) {
  return sha256(JSON.stringify(cards.map(({ id, service, kind, text }) => ({ id, service, kind, text }))));
}
