import { readFileSync } from "node:fs";
import { scoreEntryWeighted, scoreEntryWeightedUngated } from "../../src/catalog/scoring.ts";
import {
  CLAUSE_ARTIFACT_PATH,
  CLAUSE_POLICY,
  EXPECTED_UNMATCHED_SCOUT_OPS,
  EXCLUSIONS,
  MODEL,
  QUERY_TASK,
  applyClauseHysteresis,
  clauseFit,
  clauseSetHash,
  loadClauseSource,
  sha256,
} from "./clause-config.mjs";

export function decodeFloat32Vectors(base64, count, dimensions = MODEL.dimensions) {
  const bytes = Buffer.from(base64, "base64");
  const expected = count * dimensions * Float32Array.BYTES_PER_ELEMENT;
  if (bytes.byteLength !== expected) throw new Error(`clause vector byte length ${bytes.byteLength} != ${expected}`);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return Array.from({ length: count }, (_, vectorIndex) => {
    const vector = new Float32Array(dimensions);
    const base = vectorIndex * dimensions * Float32Array.BYTES_PER_ELEMENT;
    for (let dimension = 0; dimension < dimensions; dimension += 1) {
      vector[dimension] = view.getFloat32(base + dimension * 4, true);
    }
    return vector;
  });
}

export function encodeFloat32Vectors(vectors, dimensions = MODEL.dimensions) {
  const bytes = Buffer.alloc(vectors.length * dimensions * 4);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = 0;
  for (const vector of vectors) {
    if (vector.length !== dimensions) throw new Error(`expected ${dimensions} dimensions, got ${vector.length}`);
    for (const value of vector) {
      view.setFloat32(offset, value, true);
      offset += 4;
    }
  }
  return bytes.toString("base64");
}

export function loadClauseArtifact({ requireCatalogMatch = true, artifactPath = CLAUSE_ARTIFACT_PATH } = {}) {
  const artifact = JSON.parse(readFileSync(artifactPath, "utf8"));
  if (artifact.schemaVersion !== 1 || artifact.experiment !== CLAUSE_POLICY.id) throw new Error("clause artifact schema drift");
  if (JSON.stringify(artifact.model) !== JSON.stringify(MODEL)) throw new Error("clause artifact model drift");
  if (artifact.queryTask !== QUERY_TASK) throw new Error("clause artifact query-task drift");
  if (JSON.stringify(artifact.policy) !== JSON.stringify(CLAUSE_POLICY)) throw new Error("clause artifact policy drift");
  if (JSON.stringify(artifact.exclusions) !== JSON.stringify(EXCLUSIONS)) throw new Error("clause artifact exclusion drift");
  if (JSON.stringify(artifact.unmatchedScoutOps) !== JSON.stringify(EXPECTED_UNMATCHED_SCOUT_OPS)) {
    throw new Error("clause artifact unmatched Scout operation drift");
  }
  const payload = Buffer.from(artifact.vectors, "base64");
  if (artifact.vectorsSha256 !== sha256(payload)) throw new Error("clause artifact payload hash mismatch");
  const vectors = decodeFloat32Vectors(artifact.vectors, artifact.clauses.length, artifact.encoding.dimensions);
  if (!requireCatalogMatch) return { artifact, clauses: artifact.clauses, vectors };

  const live = loadClauseSource();
  if (JSON.stringify(artifact.inputs) !== JSON.stringify(live.inputs)) throw new Error("clause artifact input drift");
  if (artifact.clauseSetSha256 !== clauseSetHash(live.clauses)) throw new Error("clause artifact clause-set drift");
  if (live.clauses.length !== artifact.clauses.length) throw new Error("clause artifact clause count drift");
  for (let index = 0; index < live.clauses.length; index += 1) {
    const { text, ...expected } = live.clauses[index];
    if (JSON.stringify(expected) !== JSON.stringify(artifact.clauses[index])) {
      throw new Error(`clause artifact clause drift at ${expected.entryId}:${expected.source}:${expected.index}`);
    }
  }
  return { artifact, clauses: live.clauses, vectors };
}

export function scoringProjection(entry) {
  return {
    id: entry.id,
    name: entry.id,
    service: entry.service,
    kind: entry.kind,
    description: entry.description,
    keywords: entry.keywords,
    routingKeywords: entry.routingKeywords,
  };
}

export function buildCandidateUnion(searchCatalog, catalog, question) {
  const page = searchCatalog(catalog, { query: question, limit: 5 });
  const pageIds = new Set(page.map((hit) => hit.id));
  const remainder = [];
  for (const entry of catalog.entries) {
    if (entry.searchable === false || pageIds.has(entry.id)) continue;
    const scored = scoringProjection(entry);
    const ungated = scoreEntryWeightedUngated(scored, question);
    if (ungated === null) continue;
    const gated = scoreEntryWeighted(scored, question);
    remainder.push({
      id: entry.id,
      service: entry.service,
      kind: entry.kind,
      description: entry.description,
      score: ungated,
      tier: gated === null ? "backfill" : "gated",
      ungatedScore: ungated,
    });
  }
  remainder.sort((left, right) => right.ungatedScore - left.ungatedScore || left.id.localeCompare(right.id));
  return [...page, ...remainder];
}

export function dot(left, right) {
  let total = 0;
  for (let index = 0; index < left.length; index += 1) total += left[index] * right[index];
  return total;
}

export function entryFits(queryVector, clauses, vectors) {
  const scores = new Map();
  for (let index = 0; index < clauses.length; index += 1) {
    const clause = clauses[index];
    let bucket = scores.get(clause.entryId);
    if (!bucket) {
      bucket = { positive: [], negative: [] };
      scores.set(clause.entryId, bucket);
    }
    bucket[clause.role].push(dot(queryVector, vectors[index]));
  }
  return new Map([...scores].map(([entryId, value]) => [entryId, clauseFit(value.positive, value.negative)]));
}

export function rerankClauseFit(searchCatalog, catalog, question, queryVector, artifactData, margin) {
  const base = buildCandidateUnion(searchCatalog, catalog, question);
  const fits = entryFits(queryVector, artifactData.clauses, artifactData.vectors);
  return applyClauseHysteresis(base, fits, margin).slice(0, 5);
}
