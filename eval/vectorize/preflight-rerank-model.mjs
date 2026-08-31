#!/usr/bin/env node
import { createHash } from "node:crypto";
import { createReadStream, statSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  CLAUSE_ARTIFACT_SHA256,
  MODEL_FILES,
  RERANK_MODEL,
  modelFilePath,
} from "./rerank-config.mjs";

export const PROBE_QUERY = "cross-encoder preflight probe query";
export const PROBE_DOCUMENT = "cross-encoder preflight probe document";

// The fetch records the three null values. A bounded pin review must pass before preflight runs.
export const PHASE_TWO_SHA256 = Object.freeze({
  "config.json": "b6575b9d5be20d6747417c8e20c5a0db1636356e0b6d422d7244c628423c4d4c", // gitleaks:allow — public model file SHA-256
  "tokenizer_config.json": "a1d6bc8734a6f635dc158508bef000f8e2e5a759c7d92f984b2c86e5ff53425b", // gitleaks:allow — public model file SHA-256
  "special_tokens_map.json": "d5469a60db23249c7f8945013d78df30b44b6bf686c6bb4740f4223f77b1b535", // gitleaks:allow — public model file SHA-256
  "tokenizer.json": "48564c5c7d3fa64d85d95e65414a542385f88b0f128fd8d4163fd7a57f2be05c", // gitleaks:allow — public LFS SHA-256
  "onnx/model_quantized.onnx": "dd98f3e67837d23210a6b7550c08cced4f61845b940ac45be3565840a10f3244", // gitleaks:allow — public LFS SHA-256
});

export function assertPhaseTwoPinsComplete(pins = PHASE_TWO_SHA256) {
  const missing = MODEL_FILES.map((pin) => pin.path).filter((relativePath) => !/^[0-9a-f]{64}$/.test(pins[relativePath] ?? ""));
  if (missing.length) {
    throw new Error(`phase-two byte SHA-256 pins are not frozen: ${missing.join(", ")}`);
  }
}

async function fileSha256(file) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(file)) hash.update(chunk);
  return hash.digest("hex");
}

export async function verifySnapshotHashes(modelDir, pins = PHASE_TWO_SHA256) {
  assertPhaseTwoPinsComplete(pins);
  let directory;
  try {
    directory = statSync(modelDir).isDirectory();
  } catch {
    directory = false;
  }
  if (!modelDir || !directory) {
    throw new Error(`RAVEN_RERANK_MODEL_DIR must name an existing directory: ${modelDir || "<unset>"}`);
  }
  for (const pin of MODEL_FILES) {
    const file = modelFilePath(modelDir, pin.path);
    let actualHash;
    try {
      actualHash = await fileSha256(file);
    } catch {
      throw new Error(`local rerank model asset failed: ${file}; expected SHA-256 ${pins[pin.path]}`);
    }
    if (actualHash !== pins[pin.path]) {
      throw new Error(`local rerank model asset hash mismatch: ${file}; expected SHA-256 ${pins[pin.path]}; got ${actualHash}`);
    }
  }
}

export function encodeProbeScore(score) {
  const bytes = Buffer.alloc(Float32Array.BYTES_PER_ELEMENT);
  bytes.writeFloatLE(score, 0);
  return bytes;
}

async function main() {
  const modelDir = process.env.RAVEN_RERANK_MODEL_DIR;
  await verifySnapshotHashes(modelDir);

  const { readFileSync } = await import("node:fs");
  const { CLAUSE_ARTIFACT_PATH } = await import("./rerank-config.mjs");
  if (createHash("sha256").update(readFileSync(CLAUSE_ARTIFACT_PATH)).digest("hex") !== CLAUSE_ARTIFACT_SHA256) {
    throw new Error("clause artifact file SHA-256 drift");
  }
  const { loadClauseArtifact } = await import("./clause-retrieval.mjs");
  loadClauseArtifact({ requireCatalogMatch: true });

  const { scoreOnePair } = await import("./rerank-scorer.mjs");
  const score = await scoreOnePair(PROBE_QUERY, PROBE_DOCUMENT);
  const probeScoreSha256 = createHash("sha256").update(encodeProbeScore(score)).digest("hex");
  const require = createRequire(import.meta.url);
  const onnxruntimeNode = require("onnxruntime-node/package.json").version;
  console.log("rerank model preflight: PASS");
  console.log(`model=${RERANK_MODEL.id}@${RERANK_MODEL.revision}`);
  console.log(`probeScoreSha256=${probeScoreSha256}`);
  console.log(`node=${process.version}`);
  console.log(`onnxruntimeNode=${onnxruntimeNode}`);
  console.log(`platform=${process.platform}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(`preflight-rerank-model failed: ${error.message}`);
    process.exit(1);
  });
}
