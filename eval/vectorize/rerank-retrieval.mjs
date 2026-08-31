import { readFileSync } from "node:fs";
import { scoreEntryWeighted, scoreEntryWeightedUngated } from "../../src/catalog/scoring.ts";
import {
  CLAUSE_ARTIFACT_PATH,
  CLAUSE_ARTIFACT_SHA256,
  CLAUSE_SET_SHA256,
  sha256,
} from "./rerank-config.mjs";
import { loadClauseArtifact } from "./clause-retrieval.mjs";

export function loadRerankClauseArtifact() {
  if (sha256(readFileSync(CLAUSE_ARTIFACT_PATH)) !== CLAUSE_ARTIFACT_SHA256) {
    throw new Error("clause artifact file SHA-256 drift");
  }
  const loaded = loadClauseArtifact({ requireCatalogMatch: true });
  if (loaded.artifact.clauseSetSha256 !== CLAUSE_SET_SHA256) throw new Error("clause-set SHA-256 drift");
  for (let index = 0; index < loaded.clauses.length; index += 1) {
    const clause = loaded.clauses[index];
    const identity = loaded.artifact.clauses[index];
    if (Object.hasOwn(identity, "text")) throw new Error(`clause artifact unexpectedly stores text at index ${index}`);
    if (sha256(clause.text) !== identity.textSha256) throw new Error(`reconstructed clause text hash drift at index ${index}`);
  }
  return { artifact: loaded.artifact, clauses: loaded.clauses };
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

export function buildCandidateUnion(searchCatalog, catalog, query) {
  const page = searchCatalog(catalog, { query, limit: 5 });
  const pageIds = new Set(page.map((hit) => hit.id));
  const remainder = [];
  for (const entry of catalog.entries) {
    if (entry.searchable === false || pageIds.has(entry.id)) continue;
    const projection = scoringProjection(entry);
    const ungatedScore = scoreEntryWeightedUngated(projection, query);
    if (ungatedScore === null) continue;
    const gatedScore = scoreEntryWeighted(projection, query);
    remainder.push({
      id: entry.id,
      service: entry.service,
      kind: entry.kind,
      description: entry.description,
      score: ungatedScore,
      tier: gatedScore === null ? "backfill" : "gated",
      ungatedScore,
    });
  }
  remainder.sort((left, right) => right.ungatedScore - left.ungatedScore || left.id.localeCompare(right.id));
  return [...page, ...remainder];
}

export function pairIndexForBase(base, clauses) {
  const entryIds = new Set(base.map((entry) => entry.id));
  return clauses.flatMap((clause, index) => entryIds.has(clause.entryId) ? [index] : []);
}

export function clauseFit(positiveScores, negativeScores = []) {
  if (!positiveScores.length) return Number.NEGATIVE_INFINITY;
  const pos = Math.max(...positiveScores);
  const neg = negativeScores.length ? Math.max(...negativeScores) : 0;
  return pos - Math.max(0, neg - pos);
}

export function entryFitsFromPairScores(clauses, pairIndex, scores) {
  if (pairIndex.length !== scores.length) throw new Error(`pair-index/score count mismatch: ${pairIndex.length} != ${scores.length}`);
  const buckets = new Map();
  for (let offset = 0; offset < pairIndex.length; offset += 1) {
    const clauseIndex = pairIndex[offset];
    const clause = clauses[clauseIndex];
    if (!clause) throw new Error(`pair index ${clauseIndex} is outside the clause set`);
    let bucket = buckets.get(clause.entryId);
    if (!bucket) {
      bucket = { positive: [], negative: [] };
      buckets.set(clause.entryId, bucket);
    }
    bucket[clause.role].push(scores[offset]);
  }
  return new Map([...buckets].map(([entryId, bucket]) => [entryId, clauseFit(bucket.positive, bucket.negative)]));
}

export function applyRerankHysteresis(base, fits, margin) {
  if (margin === Infinity) return base.slice();
  const ordered = base.slice();
  for (let index = 1; index < ordered.length; index += 1) {
    const candidate = ordered[index];
    const candidateFit = fits.get(candidate.id) ?? Number.NEGATIVE_INFINITY;
    let target = index;
    while (target > 0) {
      const previousFit = fits.get(ordered[target - 1].id) ?? Number.NEGATIVE_INFINITY;
      if (!(candidateFit >= previousFit + margin && candidateFit !== previousFit)) break;
      target -= 1;
    }
    if (target !== index) {
      ordered.splice(index, 1);
      ordered.splice(target, 0, candidate);
    }
  }
  return ordered;
}

export function rerankFromPairScores(base, clauses, pairIndex, scores, margin) {
  const fits = entryFitsFromPairScores(clauses, pairIndex, scores);
  return applyRerankHysteresis(base, fits, margin).slice(0, 5);
}
