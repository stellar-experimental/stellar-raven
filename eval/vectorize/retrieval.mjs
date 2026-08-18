import { readFileSync } from "node:fs";
import { ARTIFACT_PATH, MODEL, POLICY, buildCatalogCards, cardSetHash, sha256 } from "./frontier-config.mjs";
import { embedQueries } from "./embedder.mjs";

let decodedArtifact;
let catalogVerifiedArtifact;

function decodeVectors(base64, count) {
  const bytes = Buffer.from(base64, "base64");
  const expected = count * MODEL.dimensions * Float32Array.BYTES_PER_ELEMENT;
  if (bytes.byteLength !== expected) throw new Error(`vector artifact byte length ${bytes.byteLength} != ${expected}`);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return Array.from({ length: count }, (_, vectorIndex) => {
    const vector = new Float32Array(MODEL.dimensions);
    const base = vectorIndex * MODEL.dimensions * Float32Array.BYTES_PER_ELEMENT;
    for (let dimension = 0; dimension < MODEL.dimensions; dimension += 1) {
      vector[dimension] = view.getFloat32(base + dimension * Float32Array.BYTES_PER_ELEMENT, true);
    }
    return vector;
  });
}

/**
 * `requireCatalogMatch` (default true) compares the pinned vectors against the
 * LIVE catalog and refuses on any drift — correct for anyone RUNNING the
 * experiment, since stale vectors would silently produce meaningless rankings.
 * It is deliberately NOT required for integrity checks: this is a banked
 * no-ship measurement, and holding live model-facing catalog prose hostage to a
 * re-embed of it (which its own README documents as hazardous) once caused a
 * knowingly-false word to ship to every MCP client rather than pay that cost.
 * Tests assert the artifact's SELF-consistency; the experiment asserts both.
 */
export function loadFrontierArtifact({ requireCatalogMatch = true } = {}) {
  if (!decodedArtifact) {
    const artifact = JSON.parse(readFileSync(ARTIFACT_PATH, "utf8"));
    if (JSON.stringify(artifact.model) !== JSON.stringify(MODEL)) throw new Error("vector artifact model config drift");
    if (JSON.stringify(artifact.policy) !== JSON.stringify(POLICY)) throw new Error("vector artifact policy drift");
    if (artifact.vectorsSha256 !== sha256(Buffer.from(artifact.vectors, "base64"))) {
      throw new Error("vector artifact payload hash mismatch");
    }
    decodedArtifact = {
      artifact,
      cards: artifact.cards,
      vectors: decodeVectors(artifact.vectors, artifact.cards.length)
    };
  }
  if (!requireCatalogMatch) return decodedArtifact;
  if (catalogVerifiedArtifact) return catalogVerifiedArtifact;

  const { artifact, vectors } = decodedArtifact;
  const cards = buildCatalogCards();
  if (artifact.cardSetSha256 !== cardSetHash(cards)) {
    throw new Error("vector artifact card-set drift; rebuild it (npm run eval:vectorize:build)");
  }
  if (cards.length !== artifact.cards.length) throw new Error("vector artifact card count drift");
  for (let index = 0; index < cards.length; index += 1) {
    const card = cards[index];
    const pinned = artifact.cards[index];
    if (card.id !== pinned.id || card.service !== pinned.service || sha256(card.text) !== pinned.textSha256) {
      throw new Error(`vector artifact card drift at ${card.id}`);
    }
  }
  catalogVerifiedArtifact = { artifact, cards, vectors };
  return catalogVerifiedArtifact;
}

export function dot(left, right) {
  let score = 0;
  for (let index = 0; index < left.length; index += 1) score += left[index] * right[index];
  return score;
}

export async function semanticScores(query) {
  const { cards, vectors } = loadFrontierArtifact();
  const [queryVector] = await embedQueries([query]);
  return new Map(cards.map((card, index) => [card.id, dot(queryVector, vectors[index])]));
}

export async function rerankSearchPage(searchCatalog, catalog, options) {
  const limit = Math.max(1, Math.min(50, options.limit ?? 10));
  const candidateLimit = Math.max(limit, POLICY.candidateCount);
  const lexical = searchCatalog(catalog, { ...options, limit: candidateLimit });
  const scores = await semanticScores(options.query);
  const candidates = lexical.slice(0, POLICY.candidateCount).map((hit, lexicalIndex) => ({
    ...hit,
    lexicalRank: lexicalIndex + 1,
    semanticScore: scores.get(hit.id) ?? Number.NEGATIVE_INFINITY
  }));
  candidates.sort(
    (left, right) =>
      right.semanticScore - left.semanticScore ||
      left.lexicalRank - right.lexicalRank ||
      left.id.localeCompare(right.id)
  );
  return candidates.slice(0, limit);
}
