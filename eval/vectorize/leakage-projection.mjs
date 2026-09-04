import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const SHA256 = /^[a-f0-9]{64}$/;

export const FROZEN_LEAKAGE_PROJECTION_PATH = path.join(
  DIR,
  "frozen/protocol-history-leakage-source-v1.json",
);
export const FROZEN_LEAKAGE_PROJECTION_SHA256 = "61f1bf7c20ae6491bcc9a5cecb6d7ddb772e44e511624b7e1028063d310ab259"; // gitleaks:allow — public projection SHA-256

export function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

export function normalizeLeakageText(value) {
  return String(value)
    .normalize("NFKC")
    .toLocaleLowerCase("en-US")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

export function containsNormalizedExactText(sourceText, candidateText) {
  const source = normalizeLeakageText(sourceText);
  const candidate = normalizeLeakageText(candidateText);
  if (!candidate) return false;
  return ` ${source} `.includes(` ${candidate} `);
}

export function loadFrozenLeakageProjection({
  projectionPath = FROZEN_LEAKAGE_PROJECTION_PATH,
  expectedSha256 = FROZEN_LEAKAGE_PROJECTION_SHA256,
} = {}) {
  const bytes = readFileSync(projectionPath);
  if (sha256(bytes) !== expectedSha256) throw new Error("frozen leakage projection SHA-256 drift");

  const projection = JSON.parse(bytes);
  if (projection.schemaVersion !== 1) throw new Error("frozen leakage projection schema drift");
  if (projection.projection !== "protocol-history-leakage-source-v1") {
    throw new Error("frozen leakage projection identity drift");
  }
  if (projection.targetOperation !== "scout.searchResearch") {
    throw new Error("frozen leakage projection target drift");
  }
  if (!Array.isArray(projection.clauses) || projection.clauses.length !== 27) {
    throw new Error("frozen leakage projection clause-count drift");
  }
  for (const [index, clause] of projection.clauses.entries()) {
    if (!clause || typeof clause.text !== "string" || !clause.text.trim()) {
      throw new Error(`frozen leakage projection text drift at index ${index}`);
    }
    if (!SHA256.test(clause.renderedTextSha256)) {
      throw new Error(`frozen leakage projection clause hash drift at index ${index}`);
    }
  }
  return projection;
}
