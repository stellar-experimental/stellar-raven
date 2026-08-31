#!/usr/bin/env node
import { mkdirSync } from "node:fs";
import path from "node:path";
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

async function main() {
  const source = loadClauseSource();
  if (JSON.stringify(source.unmatchedScoutOps) !== JSON.stringify(EXPECTED_UNMATCHED_SCOUT_OPS)) {
    throw new Error(`unexpected unmatched Scout operations: ${source.unmatchedScoutOps.join(", ")}`);
  }
  console.log(`embedding ${source.clauses.length} routing clauses with ${MODEL.id}@${MODEL.revision.slice(0, 12)} ${MODEL.dtype}`);
  const vectors = await embedDocuments(source.clauses.map((clause) => clause.text));
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
  mkdirSync(path.dirname(CLAUSE_ARTIFACT_PATH), { recursive: true });
  writeResult(CLAUSE_ARTIFACT_PATH, artifact);
  console.log(`artifact -> ${CLAUSE_ARTIFACT_PATH} (${Math.round(encoded.length / 1024)} KiB base64)`);
}

main().catch((error) => {
  console.error(`build-clause-artifact failed: ${error.message}`);
  process.exit(1);
});
