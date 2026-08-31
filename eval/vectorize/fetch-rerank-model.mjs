#!/usr/bin/env node
import { createHash } from "node:crypto";
import { createReadStream, createWriteStream, mkdirSync, renameSync, rmSync, statSync } from "node:fs";
import { mkdtemp } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";
import { MODEL_FILES, RERANK_MODEL } from "./rerank-config.mjs";

export const SNAPSHOT_PARENT = path.join(
  homedir(),
  ".cache/stellar-raven/bge-reranker-base-q8-280bcc2",
);
export const MODEL_BASE_URL = `https://huggingface.co/${RERANK_MODEL.id}/resolve/${RERANK_MODEL.revision}`;

export function modelFileUrl(relativePath) {
  return `${MODEL_BASE_URL}/${relativePath.split("/").map(encodeURIComponent).join("/")}`;
}

async function hashFile(file, algorithm, prefix = null) {
  const hash = createHash(algorithm);
  if (prefix !== null) hash.update(prefix);
  for await (const chunk of createReadStream(file)) hash.update(chunk);
  return hash.digest("hex");
}

export async function byteSha256(file) {
  return hashFile(file, "sha256");
}

export async function gitBlobSha1(file, size = statSync(file).size) {
  return hashFile(file, "sha1", `blob ${size}\0`);
}

export async function verifyDownloadedFile(file, pin) {
  const actualSize = statSync(file).size;
  if (actualSize !== pin.size) throw new Error(`${pin.path} size ${actualSize} != ${pin.size}`);
  const actualIdentity = pin.identity.type === "git-blob-sha1"
    ? await gitBlobSha1(file, actualSize)
    : await byteSha256(file);
  if (actualIdentity !== pin.identity.value) {
    throw new Error(`${pin.path} ${pin.identity.type} ${actualIdentity} != ${pin.identity.value}`);
  }
  return byteSha256(file);
}

async function downloadFile(url, destination) {
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok || !response.body) throw new Error(`${url} returned HTTP ${response.status}`);
  mkdirSync(path.dirname(destination), { recursive: true });
  await pipeline(Readable.fromWeb(response.body), createWriteStream(destination, { flags: "wx" }));
}

export async function fetchSnapshot({ fetchFile = downloadFile, snapshotParent = SNAPSHOT_PARENT } = {}) {
  const cacheRoot = path.dirname(snapshotParent);
  mkdirSync(cacheRoot, { recursive: true });
  try {
    statSync(snapshotParent);
    throw new Error(`snapshot already exists: ${snapshotParent}`);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }

  const temporaryParent = await mkdtemp(path.join(cacheRoot, ".bge-reranker-base-q8-280bcc2-"));
  const byteHashes = {};
  try {
    for (const pin of MODEL_FILES) {
      const temporaryFile = path.join(temporaryParent, RERANK_MODEL.id, pin.path);
      await fetchFile(modelFileUrl(pin.path), temporaryFile);
      byteHashes[pin.path] = await verifyDownloadedFile(temporaryFile, pin);
    }
    renameSync(temporaryParent, snapshotParent);
    return byteHashes;
  } catch (error) {
    rmSync(temporaryParent, { recursive: true, force: true });
    throw error;
  }
}

async function main() {
  const byteHashes = await fetchSnapshot();
  console.log(`snapshot=${SNAPSHOT_PARENT}`);
  for (const pin of MODEL_FILES) console.log(`${pin.path} sha256=${byteHashes[pin.path]}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(`fetch-rerank-model failed: ${error.message}`);
    process.exit(1);
  });
}
