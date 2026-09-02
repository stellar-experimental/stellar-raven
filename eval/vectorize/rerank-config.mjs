import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DIR = path.dirname(fileURLToPath(import.meta.url));

export const REPO = path.resolve(DIR, "../..");
export const CLAUSE_ARTIFACT_PATH = path.join(
  DIR,
  "artifacts/qwen3-embedding-0.6b-q8-c25a394-clauses.json",
);
export const RESULTS_DIR = path.join(DIR, "results");
export const EXPERIMENT = "cross-encoder-fit-v1";
export const BATCH_SIZE = 16;
export const GRID_MARGINS = Object.freeze([0.05, 0.10, 0.20]);
export const REGISTERED_MARGINS = Object.freeze([Infinity, 0, ...GRID_MARGINS]);

export const CLAUSE_ARTIFACT_SHA256 = "d9de70079a1b94507854949b93b99f90b4f03370021c9a2e313a59f8b759002b"; // gitleaks:allow — public artifact SHA-256
export const CLAUSE_SET_SHA256 = "bed608469e73e719beb51912f483c4f8daf9fc2d843334387d0851475b581ff2"; // gitleaks:allow — public clause-set SHA-256

export const RERANK_MODEL = Object.freeze({
  provider: "huggingface-local-onnx",
  id: "Xenova/bge-reranker-base",
  revision: "280bcc27a84e0b898c251e06fddb25171bd9b101", // gitleaks:allow — public model revision
  baseModel: "BAAI/bge-reranker-base",
  baseRevisionObserved: "2cfc18c9415c912f9d8155881c133215df768a70", // gitleaks:allow — public model revision
  architecture: "XLMRobertaForSequenceClassification",
  runtime: "@huggingface/transformers@4.2.0",
  dtype: "q8",
  loaderApi: "AutoTokenizer plus AutoModelForSequenceClassification, called directly; no pipeline()",
  pairEncoding: "tokenizer text_pair call with padding: true, truncation: true, max_length: 512",
  scoreTransform: "one sigmoid over the raw logit logits[i][0]; the pipeline softmax path is forbidden",
  metric: "one relevance score per (query, clause) pair; higher is more relevant",
});

export const RERANK_POLICY = Object.freeze({
  id: EXPERIMENT,
  margins: REGISTERED_MARGINS,
  baseOrder: "P5+ungated-remainder",
  remainderOrder: "ungated-score-desc,id-asc",
  swap: ">=m and not-equal",
  batchSize: BATCH_SIZE,
});

export const MODEL_FILES = Object.freeze([
  Object.freeze({
    path: "config.json",
    size: 782,
    identity: Object.freeze({ type: "git-blob-sha1", value: "ef36f7221740ddc57b6cfae14977840d1fc0fc95" }), // gitleaks:allow — public git blob SHA-1
  }),
  Object.freeze({
    path: "tokenizer_config.json",
    size: 443,
    identity: Object.freeze({ type: "git-blob-sha1", value: "059214673d9d6d2ee319411e2ffec8c024b816d5" }), // gitleaks:allow — public git blob SHA-1
  }),
  Object.freeze({
    path: "special_tokens_map.json",
    size: 279,
    identity: Object.freeze({ type: "git-blob-sha1", value: "68171d1ff68b731a33d119708476692c094a466b" }), // gitleaks:allow — public git blob SHA-1
  }),
  Object.freeze({
    path: "tokenizer.json",
    size: 17_098_079,
    identity: Object.freeze({ type: "sha256", value: "48564c5c7d3fa64d85d95e65414a542385f88b0f128fd8d4163fd7a57f2be05c" }), // gitleaks:allow — public LFS SHA-256
  }),
  Object.freeze({
    path: "onnx/model_quantized.onnx",
    size: 279_301_077,
    identity: Object.freeze({ type: "sha256", value: "dd98f3e67837d23210a6b7550c08cced4f61845b940ac45be3565840a10f3244" }), // gitleaks:allow — public LFS SHA-256
  }),
]);

export function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

export function modelFilePath(modelDir, relativePath) {
  return path.join(modelDir, RERANK_MODEL.id, relativePath);
}

export function tokenizePairs(tokenizer, queries, clauses) {
  if (!Array.isArray(queries) || !Array.isArray(clauses)) throw new TypeError("queries and clauses must be arrays");
  if (queries.length !== clauses.length) throw new Error(`query/clause pair count mismatch: ${queries.length} != ${clauses.length}`);
  return tokenizer(queries, {
    text_pair: clauses,
    padding: true,
    truncation: true,
    max_length: 512,
  });
}
