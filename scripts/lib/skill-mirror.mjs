/**
 * skill-mirror.mjs — build-time access to the pinned ecosystem skills.
 *
 * Skill bodies are NOT vendored in this repo (see ecosystem-skills/README.md).
 * The committed source of truth is ecosystem-skills/MANIFEST.json: per source a
 * repo + commit SHA, per file a path + git blob hash. This module turns that
 * into (a) the immutable raw URL every catalog entry carries as its transport
 * and (b) the file's text, fetched once into a gitignored working cache and
 * verified against the pinned blob hash.
 *
 * Every builder that needs skill text (build-catalog.mjs, build-super-spec.mjs,
 * ecosystem-skills/build-index.mjs) goes through here, so they all read exactly
 * the bytes the Worker serves at runtime (src/skills/source.ts performs the
 * same verification against the same hashes).
 *
 * The cache is a build convenience, never an input: delete it and the next
 * build refetches. A hash mismatch fails the build loudly rather than baking
 * unreviewed upstream bytes into a generated artifact.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

/** Gitignored working cache — content-addressed by the pinned blob hash, so
 *  entries for old pins are simply never read again. */
const CACHE_DIR = join(ROOT, "ecosystem-skills", ".cache");

const RAW_BASE = "https://raw.githubusercontent.com";

/**
 * Upstream path of one mirrored file, reconstructing the layout
 * ecosystem-skills/update.sh pinned: sources with a `path` hold one directory
 * per skill under it; a source with `path: "."` holds its skill directories at
 * the repo root; a source with an empty `path` is a single skill at the repo
 * root, whose file paths are already repo-relative.
 */
export function upstreamPath(source, skillName, filePath) {
  if (source.path === ".") return `${skillName}/${filePath}`;
  return source.path ? `${source.path}/${skillName}/${filePath}` : filePath;
}

/** Immutable raw URL for one mirrored file — the catalog transport `url`. */
export function skillFileUrl(source, skillName, filePath) {
  return `${RAW_BASE}/${source.owner}/${source.repo}/${source.commit}/${upstreamPath(source, skillName, filePath)}`;
}

/** SHA-256 over raw bytes — the SECURITY digest the runtime verifies. git's
 *  SHA-1 has practical chosen-prefix collisions, so it stays provenance-only. */
export function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

/** git blob hash of a buffer — the id MANIFEST.json records per file. */
export function gitBlobSha(buffer) {
  return createHash("sha1")
    .update(`blob ${buffer.length}\0`)
    .update(buffer)
    .digest("hex");
}

async function fetchWithRetry(url, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const res = await fetch(url, { headers: { accept: "text/plain" } });
      if (res.ok) return Buffer.from(await res.arrayBuffer());
      lastError = new Error(`HTTP ${res.status}`);
      if (res.status < 500) break; // an immutable URL that 404s will keep 404ing
    } catch (e) {
      lastError = e;
    }
  }
  throw new Error(`could not fetch ${url}: ${lastError?.message ?? lastError}`);
}

/**
 * Text of one pinned file: cache hit if its bytes still hash to the pin,
 * otherwise fetched and verified. Returns raw text — callers apply the
 * exposure scrub themselves (the same one src/skills/source.ts applies at
 * read time), because some callers need the pre-scrub bytes for hashing.
 */
export async function readSkillFile(source, skillName, file, options) {
  return (await readSkillFileWithDigest(source, skillName, file, options)).text;
}

/**
 * Text plus the SHA-256 the catalog pins for runtime verification.
 *
 * `{ noCache: true }` skips the working cache and goes to upstream. That is the
 * difference between "these bytes are the pinned bytes" (any cache hit proves
 * that) and "this pin still RESOLVES upstream" — only a real request proves the
 * second, and an availability check that a warm cache can satisfy is not one.
 */
export async function readSkillFileWithDigest(source, skillName, file, { noCache = false } = {}) {
  const cachePath = join(CACHE_DIR, file.sha);
  if (!noCache && existsSync(cachePath)) {
    const cached = readFileSync(cachePath);
    if (gitBlobSha(cached) === file.sha) {
      return { text: cached.toString("utf8"), sha256: sha256(cached) };
    }
  }
  const url = skillFileUrl(source, skillName, file.path);
  const bytes = await fetchWithRetry(url);
  const actual = gitBlobSha(bytes);
  if (actual !== file.sha) {
    throw new Error(
      `integrity check failed for ${url}: expected git blob ${file.sha}, got ${actual}. ` +
        `ecosystem-skills/MANIFEST.json disagrees with upstream — re-pin with ecosystem-skills/update.sh ` +
        `and review the skill diff (skills are prompt input).`
    );
  }
  mkdirSync(CACHE_DIR, { recursive: true });
  writeFileSync(cachePath, bytes);
  return { text: bytes.toString("utf8"), sha256: sha256(bytes) };
}

/**
 * Every pinned file of every non-excluded skill, fetched (or cache-read) once
 * and returned as `"<source id>/<skill>/<file path>" -> { text, sha256 }`.
 * Builders take this map and stay synchronous below it.
 *
 * `skip` receives a skill name and returns true to leave it out entirely —
 * retired skills contribute zero bytes to any build (ADR-0003).
 */
export async function loadSkillTexts(manifest, { skip = () => false } = {}) {
  const jobs = [];
  for (const source of manifest.sources) {
    for (const skill of source.skills) {
      if (skip(skill.name)) continue;
      for (const file of skill.files ?? []) {
        if (!file.path.endsWith(".md")) continue;
        jobs.push(
          readSkillFileWithDigest(source, skill.name, file).then((loaded) => [
            `${source.id}/${skill.name}/${file.path}`,
            loaded
          ])
        );
      }
    }
  }
  return new Map(await Promise.all(jobs));
}
