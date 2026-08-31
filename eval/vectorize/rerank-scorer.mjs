import { statSync } from "node:fs";
import path from "node:path";
import { BATCH_SIZE, MODEL_FILES, RERANK_MODEL, modelFilePath, tokenizePairs } from "./rerank-config.mjs";

let rerankerPromise;

function isFile(file) {
  try {
    return statSync(file).isFile();
  } catch {
    return false;
  }
}

export function assertLocalModelAssets(modelDir) {
  if (!modelDir) throw new Error("RAVEN_RERANK_MODEL_DIR is required");
  let directory;
  try {
    directory = statSync(modelDir).isDirectory();
  } catch {
    directory = false;
  }
  if (!directory) throw new Error(`RAVEN_RERANK_MODEL_DIR must name an existing directory: ${modelDir}`);
  const files = MODEL_FILES.map((pin) => modelFilePath(modelDir, pin.path));
  for (const file of files) {
    if (!isFile(file)) throw new Error(`missing local rerank model asset: ${file}`);
  }
  return files;
}

export async function initializeReranker(transformers, modelDir = process.env.RAVEN_RERANK_MODEL_DIR) {
  assertLocalModelAssets(modelDir);
  const { AutoModelForSequenceClassification, AutoTokenizer, env } = transformers;
  if (!AutoTokenizer?.from_pretrained || !AutoModelForSequenceClassification?.from_pretrained || !env) {
    throw new Error("@huggingface/transformers rerank APIs are unavailable");
  }

  env.allowRemoteModels = false;
  env.allowLocalModels = true;
  env.localModelPath = modelDir;
  env.useFSCache = false;

  const tokenizer = await AutoTokenizer.from_pretrained(RERANK_MODEL.id);
  const model = await AutoModelForSequenceClassification.from_pretrained(RERANK_MODEL.id, {
    dtype: RERANK_MODEL.dtype,
  });
  return { tokenizer, model };
}

export async function loadReranker() {
  rerankerPromise ??= import("@huggingface/transformers").then((transformers) => initializeReranker(transformers));
  return rerankerPromise;
}

export function sigmoid(rawLogit) {
  const value = Number(rawLogit);
  if (!Number.isFinite(value)) throw new Error(`rerank logit must be finite, got ${rawLogit}`);
  return 1 / (1 + Math.exp(-value));
}

export function scoreRawLogits(logits, expectedCount) {
  const scores = [];
  for (let index = 0; index < expectedCount; index += 1) {
    const scalar = logits?.[index]?.[0];
    if (scalar === undefined) throw new Error(`rerank logits missing row ${index}`);
    const rawLogit = typeof scalar?.item === "function" ? scalar.item() : scalar;
    scores.push(sigmoid(rawLogit));
  }
  if (logits?.dims?.[0] !== undefined && logits.dims[0] !== expectedCount) {
    throw new Error(`rerank logit row count ${logits.dims[0]} != ${expectedCount}`);
  }
  if (Array.isArray(logits) && logits.length !== expectedCount) {
    throw new Error(`rerank logit row count ${logits.length} != ${expectedCount}`);
  }
  return scores;
}

export async function scorePairBatch(reranker, queries, clauses) {
  const inputs = tokenizePairs(reranker.tokenizer, queries, clauses);
  const { logits } = await reranker.model(inputs);
  return scoreRawLogits(logits, queries.length);
}

export function assertScoresVaryAcrossDistinctPairs(queries, clauses, scores) {
  const distinctPairs = new Set(queries.map((query, index) => JSON.stringify([query, clauses[index]])));
  if (distinctPairs.size < 2 || scores.length < 2) return;
  if (scores.every((score) => Object.is(score, scores[0]))) {
    throw new Error("rerank scorer returned one constant score across distinct pairs");
  }
}

export async function scorePairsWithReranker(
  reranker,
  queries,
  clauses,
  { batchSize = BATCH_SIZE, onProgress = null } = {},
) {
  if (!Number.isInteger(batchSize) || batchSize <= 0) throw new Error(`invalid rerank batch size: ${batchSize}`);
  if (queries.length !== clauses.length) throw new Error(`query/clause pair count mismatch: ${queries.length} != ${clauses.length}`);
  const scores = [];
  for (let offset = 0; offset < queries.length; offset += batchSize) {
    const end = Math.min(offset + batchSize, queries.length);
    scores.push(...await scorePairBatch(reranker, queries.slice(offset, end), clauses.slice(offset, end)));
    onProgress?.({ completed: end, total: queries.length });
  }
  assertScoresVaryAcrossDistinctPairs(queries, clauses, scores);
  return scores;
}

export async function scorePairs(queries, clauses, options = {}) {
  return scorePairsWithReranker(await loadReranker(), queries, clauses, options);
}

export async function scoreOnePair(query, clause) {
  const [score] = await scorePairs([query], [clause]);
  return score;
}

export const __lazyStateForTest = Object.freeze({
  get initialized() {
    return rerankerPromise !== undefined;
  },
});
