#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  buildReviewPacket,
  buildReviewedArtifact
} from "./artifact.mjs";
import { argValue, requiredArg } from "./cli-args.mjs";
import { DEFAULT_SUITE_PATH, lintSuite, loadManifest, loadSuite } from "./lint.mjs";

export function prepareReviewPacket(suite, collection) {
  return buildReviewPacket(suite, collection);
}

function main(args) {
  const collectionPath = path.resolve(requiredArg(args, "--collection"));
  const suite = loadSuite(path.resolve(argValue(args, "--suite") ?? DEFAULT_SUITE_PATH));
  const lintErrors = lintSuite(suite, loadManifest());
  if (lintErrors.length) throw new Error(`suite lint failed: ${lintErrors.join("; ")}`);
  const collection = JSON.parse(readFileSync(collectionPath, "utf8"));
  const packetPath = argValue(args, "--prepare");
  const annotationsPath = argValue(args, "--annotations");
  if (Boolean(packetPath) === Boolean(annotationsPath)) {
    throw new Error("choose exactly one of --prepare <packet.json> or --annotations <annotations.json>");
  }
  if (packetPath) {
    const packet = prepareReviewPacket(suite, collection);
    const output = path.resolve(packetPath);
    if (existsSync(output)) throw new Error(`refusing to overwrite existing review packet: ${output}`);
    writeFileSync(output, JSON.stringify(packet, null, 2) + "\n");
    console.log(`wrote ${output}`);
    return;
  }
  const outputPath = path.resolve(requiredArg(args, "--output"));
  if (outputPath === collectionPath) throw new Error("reviewed output must not overwrite the raw collection");
  if (existsSync(outputPath)) throw new Error(`refusing to overwrite existing reviewed artifact: ${outputPath}`);
  const annotations = JSON.parse(readFileSync(path.resolve(annotationsPath), "utf8"));
  const reviewed = buildReviewedArtifact(suite, collection, annotations);
  writeFileSync(outputPath, JSON.stringify(reviewed, null, 2) + "\n");
  console.log(`wrote ${outputPath}`);
}

const isMain = process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;
if (isMain) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    console.error(`repository-recovery review failed: ${error.message}`);
    process.exitCode = 1;
  }
}
