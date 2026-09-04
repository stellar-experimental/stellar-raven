#!/usr/bin/env node
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { writeResult } from "../discovery/lib.mjs";
import {
  CLAUSE_ARTIFACT_PATH,
  CLAUSE_POLICY,
  EXPECTED_UNMATCHED_SCOUT_OPS,
  EXCLUSIONS,
  EXPERIMENT,
  MODEL,
  QUERY_TASK,
  clauseSetHash,
  loadClauseSource,
  sha256,
} from "./clause-config.mjs";
import { embedDocuments } from "./embedder.mjs";
import { encodeFloat32Vectors } from "./clause-retrieval.mjs";
import { loadBankedRerankClauseArtifact } from "./rerank-retrieval.mjs";

export function assertClauseBuildSourceEpoch(
  source,
  { artifactPath = CLAUSE_ARTIFACT_PATH } = {},
) {
  const banked = loadBankedRerankClauseArtifact({ artifactPath });
  if (JSON.stringify(source.inputs) !== JSON.stringify(banked.artifact.inputs)) {
    throw new Error("surface-expired: clause artifact input drift");
  }
  if (JSON.stringify(source.unmatchedScoutOps) !== JSON.stringify(EXPECTED_UNMATCHED_SCOUT_OPS)) {
    throw new Error("surface-expired: clause artifact unmatched Scout operation drift");
  }
  if (clauseSetHash(source.clauses) !== banked.artifact.clauseSetSha256) {
    throw new Error("surface-expired: clause artifact clause-set drift");
  }
  return banked.artifact;
}

export async function buildClauseArtifact({
  source = loadClauseSource(),
  artifactPath = CLAUSE_ARTIFACT_PATH,
  embed = embedDocuments,
  write = writeResult,
} = {}) {
  assertClauseBuildSourceEpoch(source, { artifactPath });
  console.log(`embedding ${source.clauses.length} routing clauses with ${MODEL.id}@${MODEL.revision.slice(0, 12)} ${MODEL.dtype}`);
  const vectors = await embed(source.clauses.map((clause) => clause.text));
  const encoded = encodeFloat32Vectors(vectors);
  const artifact = {
    schemaVersion: 1,
    experiment: EXPERIMENT,
    model: MODEL,
    runtime: { package: "@huggingface/transformers", version: "4.2.0" },
    queryTask: QUERY_TASK,
    queryTaskNote: "The pinned card-level wording is reused unchanged for clause scoring.",
    policy: CLAUSE_POLICY,
    inputs: source.inputs,
    exclusions: EXCLUSIONS,
    unmatchedScoutOps: source.unmatchedScoutOps,
    clauses: source.clauses.map(({ text, ...metadata }) => metadata),
    clauseSetSha256: clauseSetHash(source.clauses),
    encoding: { type: "float32-base64", byteOrder: "little-endian", dimensions: MODEL.dimensions },
    vectors: encoded,
    vectorsSha256: sha256(Buffer.from(encoded, "base64")),
  };
  mkdirSync(path.dirname(artifactPath), { recursive: true });
  write(artifactPath, artifact);
  console.log(`artifact -> ${artifactPath} (${Math.round(encoded.length / 1024)} KiB base64)`);
  return artifact;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  buildClauseArtifact().catch((error) => {
    console.error(`build-clause-artifact failed: ${error.message}`);
    process.exit(1);
  });
}
