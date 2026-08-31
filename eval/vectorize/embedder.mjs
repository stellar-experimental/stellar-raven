import { MODEL, queryText } from "./frontier-config.mjs";

let extractorPromise;

async function extractor() {
  extractorPromise ??= import("@huggingface/transformers").then(async ({ env, pipeline }) => {
    const modelDir = process.env.RAVEN_VECTORIZE_MODEL_DIR;
    if (modelDir) {
      const [{ statSync }, path] = await Promise.all([import("node:fs"), import("node:path")]);
      const requiredPaths = [
        modelDir,
        path.join(modelDir, MODEL.id, "config.json"),
        path.join(modelDir, MODEL.id, "tokenizer_config.json"),
        path.join(modelDir, MODEL.id, "tokenizer.json"),
        path.join(modelDir, MODEL.id, "onnx/model_quantized.onnx"),
      ];
      for (const [index, requiredPath] of requiredPaths.entries()) {
        let present = false;
        try {
          const stat = statSync(requiredPath);
          present = index === 0 ? stat.isDirectory() : stat.isFile();
        } catch {
          present = false;
        }
        if (!present) throw new Error(`missing local vector model asset: ${requiredPath}`);
      }
      env.allowRemoteModels = false;
      env.allowLocalModels = true;
      env.localModelPath = modelDir;
      env.useFSCache = false;
    }
    return pipeline("feature-extraction", MODEL.id, {
      revision: MODEL.revision,
      dtype: MODEL.dtype
    });
  });
  return extractorPromise;
}

export async function embedDocuments(texts, { batchSize = 8 } = {}) {
  const model = await extractor();
  const vectors = [];
  for (let offset = 0; offset < texts.length; offset += batchSize) {
    const output = await model(texts.slice(offset, offset + batchSize), {
      pooling: MODEL.pooling,
      normalize: MODEL.normalize
    });
    vectors.push(...output.tolist());
  }
  return vectors;
}

export async function embedQueries(queries) {
  return embedDocuments(queries.map(queryText));
}
