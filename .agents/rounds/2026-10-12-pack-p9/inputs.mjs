// Shared offline loaders for the p9 replay and reading commands. They make no model call.
// Each judge input is rebuilt from the saved source result and the cases its artifact recorded.
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { basename, join } from "node:path";

export const RESULTS_DIR = "/Users/kalepail/Desktop/stellar-raven-codemode/eval/qa/results";
export const REVISIONS = { p6: "d15a4ce5", p7: "7e00ede2", p8: "36e77d40" };
// A worktree-mode artifact read the cases of its arm worktree, which sat at this commit.
const ARM_COMMIT = { "raven-p6-arm": "d15a4ce5", "raven-p7-arm": "7e00ede2", "raven-p8-arm": "36e77d40" };

export const sha256 = (value) => createHash("sha256").update(value).digest("hex");
export const git = (args) => execFileSync("git", args, { encoding: "utf8", maxBuffer: 1 << 29 });

/** The evidence-pack module of an earlier revision, checked against its pack version. */
export async function loadPackModule(revision, version) {
  const source = git(["show", `${revision}:eval/qa/evidence-pack.mjs`]);
  const module = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
  if (module.PACK_VERSION !== version) throw new Error(`${revision} does not define ${version}`);
  return module;
}

const casesCache = new Map();
export function casesAt(commit) {
  if (!casesCache.has(commit)) {
    const parsed = JSON.parse(git(["show", `${commit}:eval/qa/cases.json`]));
    casesCache.set(commit, new Map(parsed.cases.map((kase) => [kase.id, kase])));
  }
  return casesCache.get(commit);
}

export const fileCache = new Map();
export function readJsonWithHash(path) {
  if (!fileCache.has(path)) {
    const bytes = readFileSync(path);
    fileCache.set(path, { sha256: sha256(bytes), data: JSON.parse(bytes) });
  }
  return fileCache.get(path);
}

/**
 * A stored re-judge artifact. A manifest path names its arm worktree; the artifact now lives in
 * <results>/2026-10-10-pack-rejudge/<arm>/. A path outside those worktrees is read as written.
 */
export function storedArtifact(entry, resultsDir = RESULTS_DIR) {
  const arm = entry.path.match(/\/(raven-p[678]-arm)\//)?.[1];
  const path = arm ? join(resultsDir, "2026-10-10-pack-rejudge", arm, basename(entry.path)) : entry.path;
  const { sha256: actual, data } = readJsonWithHash(path);
  if (actual !== entry.sha256) throw new Error(`${path}: SHA-256 differs from its manifest`);
  return { arm: arm ?? entry.arm, commit: arm ? ARM_COMMIT[arm] : entry.commit, path, data };
}

/** The judge input of one artifact row, from its saved source result and its recorded cases. */
export function rowInput(artifact, id) {
  const meta = artifact.data.meta;
  const source = readJsonWithHash(meta.sourceResultsPath);
  if (source.sha256 !== meta.sourceResultsSha256) throw new Error(`${meta.sourceResultsPath}: SHA-256 differs`);
  const commit = meta.casesMode === "revision" ? meta.historicalCases.resolvedCommit : artifact.commit;
  if (!commit) throw new Error(`${artifact.path}: no cases commit for worktree mode`);
  const cases = casesAt(commit);
  const selected = source.data.rows.map((row) => cases.get(row.id));
  if (sha256(JSON.stringify(selected)) !== meta.casesSha256) throw new Error(`${artifact.path}: cases at ${commit} differ`);
  const row = source.data.rows.find((candidate) => candidate.id === id);
  return { ...cases.get(id), candidateAnswer: row.answer, transcript: row.transcript };
}
