#!/usr/bin/env node
/**
 * Token-only citation scanner for the two golden-round folders.
 *
 * Lists every tracked/present JSON file under the two golden round folders
 * (`.agents/rounds/2026-11-02-golden-audit` and `.agents/rounds/2026-11-14-golden-coverage-audit`)
 * and checks whether the case folders, QA companion artifacts, or `improvements/` cite each file.
 *
 * Hard boundary:
 * - Never opens or reads any candidate JSON file under the golden round folders.
 * - Searches only with `rg --with-filename --count-matches` against explicit target paths (no `-u`,
 *   no `--no-ignore`, no globs).
 * - Prints only golden-round JSON file paths, scope names, and numeric counts — never file content
 *   and never individual case paths.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export const DEFAULT_ROUND_DIRS = [
  ".agents/rounds/2026-11-02-golden-audit",
  ".agents/rounds/2026-11-14-golden-coverage-audit",
];

export const DEFAULT_SEARCH_SCOPES = [
  "eval/qa/corpus",
  "eval/corpus",
  "eval/qa/consistency-register.json",
  "eval/qa/source-sentinels.json",
  "eval/qa/lifecycle-registry.json",
  "eval/qa/reviewed",
  "eval/qa/cases.json",
  "eval/qa/sample.json",
  "eval/qa/tool-cases.json",
  "improvements",
];

function toPosix(filePath) {
  return filePath.replaceAll("\\", "/");
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Regex matching a round-relative path token (e.g. `map/taxonomy.json`, `audit/audit-assets.json`,
 * `rejudge-set.json`) on path/token boundaries. Matches both full repo-relative paths
 * (`.agents/rounds/<round>/<rel>`) and relative references (`<rel>`), including sentence-ending
 * periods (e.g. `soroban-04.json.`), while rejecting partial-name substrings (e.g. `gap/gap-1.json`
 * will not match `gap/gap-1.slots.json`, `other-gap/gap-1.json`, or `gap/gap-1.json.bak`).
 *
 * Matching by `roundRelative` is intentionally conservative: if two rounds ever shared the same
 * round-relative path, both stay marked cited so an ambiguous relative reference cannot be dropped.
 */
export function citationPattern(roundRelative) {
  return `(^|[^A-Za-z0-9._-])${escapeRegExp(roundRelative)}($|[^A-Za-z0-9._-]|\\.($|[^A-Za-z0-9_-]))`;
}

/**
 * Walk the golden round directories and list `.json` files without opening them.
 * Skips symlinks. Returns sorted entries: `{ path, roundDir, roundRelative }`.
 */
export function listRoundJsonFiles(repoDir = REPO_ROOT, roundDirs = DEFAULT_ROUND_DIRS) {
  const candidates = [];
  for (const roundDir of roundDirs) {
    const normalizedRound = toPosix(roundDir).replace(/\/+$/, "");
    const absRound = resolve(repoDir, normalizedRound);
    if (!existsSync(absRound)) continue;

    const stack = [absRound];
    while (stack.length > 0) {
      const current = stack.pop();
      const entries = readdirSync(current, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isSymbolicLink()) continue;
        const absEntry = join(current, entry.name);
        if (entry.isDirectory()) {
          stack.push(absEntry);
        } else if (entry.isFile() && entry.name.endsWith(".json")) {
          const repoRel = toPosix(relative(repoDir, absEntry));
          const roundRelative = toPosix(relative(absRound, absEntry));
          candidates.push({ path: repoRel, roundDir: normalizedRound, roundRelative });
        }
      }
    }
  }
  candidates.sort((a, b) => a.path.localeCompare(b.path));
  return candidates;
}

function matchScope(filePath, scopesBySpecificity) {
  const normalized = toPosix(filePath).replace(/^\.\//, "");
  for (const scope of scopesBySpecificity) {
    if (normalized === scope || normalized.startsWith(`${scope}/`)) return scope;
  }
  return null;
}

/**
 * Run token-only `rg --with-filename --count-matches` for one pattern across explicit scopes.
 * Returns `{ totalFiles, totalMatches, byScope }`, never storing or returning content or case paths.
 */
function countCitationsWithRg(repoDir, pattern, scopes) {
  const scopesBySpecificity = [...scopes].sort((a, b) => b.length - a.length);
  const result = spawnSync(
    "rg",
    ["--with-filename", "--count-matches", "--color", "never", "-e", pattern, "--", ...scopes],
    {
      cwd: repoDir,
      encoding: "utf8",
      env: { ...process.env, RIPGREP_CONFIG_PATH: "" },
      maxBuffer: 16 * 1024 * 1024,
    },
  );

  if (result.error) {
    throw new Error(`failed to run rg: ${result.error.message}`);
  }
  if (result.status !== 0 && result.status !== 1) {
    throw new Error(`rg exited with status ${result.status}`);
  }

  const byScope = {};
  let totalFiles = 0;
  let totalMatches = 0;

  if (result.status === 0 && result.stdout) {
    for (const rawLine of result.stdout.split("\n")) {
      const line = rawLine.trim();
      if (!line) continue;
      const sepIndex = line.lastIndexOf(":");
      if (sepIndex <= 0) continue;
      const matchedPath = line.slice(0, sepIndex);
      const count = Number.parseInt(line.slice(sepIndex + 1), 10);
      if (!Number.isFinite(count) || count <= 0) continue;

      const scope = matchScope(matchedPath, scopesBySpecificity) ?? "other";
      byScope[scope] ??= { files: 0, matches: 0 };
      byScope[scope].files += 1;
      byScope[scope].matches += count;
      totalFiles += 1;
      totalMatches += count;
    }
  }

  return { totalFiles, totalMatches, byScope };
}

/**
 * Classify every JSON file under `roundDirs` as cited or uncited across `searchScopes`.
 */
export function scanGoldenRoundJson({
  repoDir = REPO_ROOT,
  roundDirs = DEFAULT_ROUND_DIRS,
  searchScopes = DEFAULT_SEARCH_SCOPES,
} = {}) {
  const normalizedScopes = searchScopes.map((scope) => toPosix(scope).replace(/\/+$/, ""));
  const existingScopes = normalizedScopes.filter((scope) => existsSync(resolve(repoDir, scope)));
  if (existingScopes.length === 0) {
    throw new Error("no search scopes exist in the target repository");
  }

  const candidates = listRoundJsonFiles(repoDir, roundDirs);
  const cited = [];
  const uncited = [];

  for (const candidate of candidates) {
    const pattern = citationPattern(candidate.roundRelative);
    const counts = countCitationsWithRg(repoDir, pattern, existingScopes);
    const entry = {
      path: candidate.path,
      roundRelative: candidate.roundRelative,
      totalFiles: counts.totalFiles,
      totalMatches: counts.totalMatches,
      byScope: counts.byScope,
    };
    if (counts.totalFiles > 0) {
      cited.push(entry);
    } else {
      uncited.push(entry);
    }
  }

  return {
    rounds: roundDirs.map((dir) => toPosix(dir).replace(/\/+$/, "")),
    scopes: existingScopes,
    summary: {
      total: candidates.length,
      cited: cited.length,
      uncited: uncited.length,
    },
    cited,
    uncited,
  };
}

function formatScopeCounts(byScope) {
  return Object.entries(byScope)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([scope, counts]) => `${scope}=${counts.files}f/${counts.matches}m`)
    .join(", ");
}

function parseArgs(argv) {
  const options = {
    repoDir: REPO_ROOT,
    mode: "summary",
    check: false,
  };
  let explicitMode = false;
  const setMode = (nextMode) => {
    if (explicitMode && options.mode !== nextMode) {
      throw new Error(`conflicting output flags: --${options.mode} and --${nextMode}`);
    }
    options.mode = nextMode;
    explicitMode = true;
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--repo") {
      const next = argv[++i];
      if (!next) throw new Error("--repo requires a directory path");
      options.repoDir = resolve(next);
    } else if (arg === "--uncited") {
      setMode("uncited");
    } else if (arg === "--cited") {
      setMode("cited");
    } else if (arg === "--json") {
      setMode("json");
    } else if (arg === "--check") {
      options.check = true;
    } else if (arg === "--help" || arg === "-h") {
      options.mode = "help";
    } else {
      throw new Error(`unknown argument: ${arg}`);
    }
  }
  return options;
}

function main(argv) {
  const options = parseArgs(argv);
  if (options.mode === "help") {
    console.log(
      "Usage: node scripts/find-uncited-golden-round-json.mjs [--repo <dir>] [--uncited|--cited|--json] [--check]",
    );
    return;
  }

  const report = scanGoldenRoundJson({ repoDir: options.repoDir });

  if (options.mode === "json") {
    console.log(JSON.stringify(report, null, 2));
  } else if (options.mode === "uncited") {
    for (const item of report.uncited) console.log(item.path);
  } else if (options.mode === "cited") {
    for (const item of report.cited) {
      console.log(`${item.path}\t${item.totalFiles} files\t${item.totalMatches} matches\t${formatScopeCounts(item.byScope)}`);
    }
  } else {
    const { total, cited, uncited } = report.summary;
    console.log(`Golden-round JSON files: ${total} total, ${cited} cited, ${uncited} uncited`);
    console.log(`Scopes searched: ${report.scopes.join(", ")}`);
    if (report.cited.length > 0) {
      console.log("\nCited (keep):");
      for (const item of report.cited) {
        console.log(`  ${item.path}  (${item.totalFiles} files, ${item.totalMatches} matches: ${formatScopeCounts(item.byScope)})`);
      }
    }
    if (report.uncited.length > 0) {
      console.log("\nUncited (flush candidates):");
      for (const item of report.uncited) {
        console.log(`  ${item.path}`);
      }
    }
  }

  if (options.check && report.summary.uncited > 0) {
    process.exitCode = 1;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    console.error(`find-uncited-golden-round-json failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}
