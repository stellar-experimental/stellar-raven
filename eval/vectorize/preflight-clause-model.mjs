#!/usr/bin/env node
import { createHash } from "node:crypto";
import { createReadStream, statSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const MODEL_ID = "onnx-community/Qwen3-Embedding-0.6B-ONNX";
const PROBE = "clause-fit preflight probe";
const PINS = [
  ["config.json", "66a10929782f3c9a3cd5dec90e2a95c60e05736134a63cd54479eeae80bed175"],
  ["tokenizer_config.json", "977648852447cb6587327ff3205b0a84cf2fc9f05621d6c8e88a497caafab2e1"], // gitleaks:allow — public file SHA-256
  ["tokenizer.json", "def76fb086971c7867b829c23a26261e38d9d74e02139253b38aeb9df8b4b50a"], // gitleaks:allow — public file SHA-256
  ["onnx/model_quantized.onnx", "87cd124e0ef1fd1f223ebc283efccbaeac386d0b08344701c46975d0657b591f"],
];

function existingDirectory(directory) {
  try {
    return statSync(directory).isDirectory();
  } catch {
    return false;
  }
}

async function fileSha256(file) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(file)) hash.update(chunk);
  return hash.digest("hex");
}

async function main() {
  const modelDir = process.env.RAVEN_VECTORIZE_MODEL_DIR;
  if (!modelDir || !existingDirectory(modelDir)) {
    throw new Error(`RAVEN_VECTORIZE_MODEL_DIR must name an existing directory: ${modelDir || "<unset>"}`);
  }

  for (const [relativePath, expectedHash] of PINS) {
    const file = path.join(modelDir, MODEL_ID, relativePath);
    let actualHash;
    try {
      actualHash = await fileSha256(file);
    } catch {
      throw new Error(`local vector model asset failed: ${file}; expected SHA-256 ${expectedHash}`);
    }
    if (actualHash !== expectedHash) {
      throw new Error(`local vector model asset hash mismatch: ${file}; expected SHA-256 ${expectedHash}; got ${actualHash}`);
    }
  }

  const { encodeFloat32Vectors, loadClauseArtifact } = await import("./clause-retrieval.mjs");
  loadClauseArtifact({ requireCatalogMatch: true });
  const { embedQueries } = await import("./embedder.mjs");
  const vectors = await embedQueries([PROBE]);
  if (vectors.length !== 1) throw new Error(`expected one probe vector, got ${vectors.length}`);
  const encoded = encodeFloat32Vectors(vectors);
  const probeVectorSha256 = createHash("sha256").update(Buffer.from(encoded, "base64")).digest("hex");
  const require = createRequire(import.meta.url);
  const onnxruntimeNode = require("onnxruntime-node/package.json").version;
  console.log("clause model preflight: PASS");
  console.log(`probeVectorSha256=${probeVectorSha256}`);
  console.log(`node=${process.version}`);
  console.log(`onnxruntimeNode=${onnxruntimeNode}`);
  console.log(`platform=${process.platform}`);
}

main().catch((error) => {
  console.error(`preflight-clause-model failed: ${error.message}`);
  process.exit(1);
});
