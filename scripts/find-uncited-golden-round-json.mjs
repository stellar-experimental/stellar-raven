#!/usr/bin/env node
/**
 * Token-only citation scanner for the two golden-round folders.
 *
 * Lists every JSON file under the two golden round folders
 * (`.agents/rounds/2026-11-02-golden-audit` and `.agents/rounds/2026-11-14-golden-coverage-audit`)
 * and checks whether the case folders, QA companion artifacts, or `improvements/` cite each file
 * (either directly by round-relative file path or via a round-anchored ancestor directory path).
 *
 * Hard boundary:
 * - Never opens or reads any candidate JSON file under the golden round folders.
 * - Searches only with `rg --hidden -g !.git --with-filename --count-matches` against explicit
 *   target paths (no `-u`, no `--no-ignore`, no positive globs).
 * - Prints only golden-round JSON file paths, ancestor directory tokens, scope names, and numeric
 *   counts — never file content and never individual case paths.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";
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

const USAGE =
  "Usage: node scripts/find-uncited-golden-round-json.mjs [--repo <dir>] [--uncited|--cited|--json] [--check]";

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
 * Regex matching a round-anchored directory citation (e.g. `2026-11-14-golden-coverage-audit/gap/`
 * followed by a closing quote, punctuation, whitespace, wildcard, or end-of-line), while rejecting
 * specific file paths inside that directory (`2026-11-14-golden-coverage-audit/gap/gap-1.json`).
 */
export function directoryCitationPattern(roundAnchoredDir) {
  const normalized = toPosix(roundAnchoredDir).replace(/\/+$/, "");
  return `(^|[^A-Za-z0-9._-])${escapeRegExp(normalized)}/($|[^A-Za-z0-9._-]|\\.($|[^A-Za-z0-9_-]))`;
}

/**
 * Return every round-anchored ancestor directory for a candidate entry, from the round root down
 * to the file's parent directory (e.g. `["2026-11-14-golden-coverage-audit", "2026-11-14-golden-coverage-audit/gap"]`).
 */
export function ancestorRoundDirs(candidate) {
  const roundName = basename(candidate.roundDir);
  const dirs = [roundName];
  const parts = candidate.roundRelative.split("/").slice(0, -1);
  let prefix = roundName;
  for (const part of parts) {
    prefix = `${prefix}/${part}`;
    dirs.push(prefix);
  }
  return dirs;
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
 * Run token-only `rg --hidden -g !.git --with-filename --count-matches` for one pattern across
 * explicit scopes. Returns `{ totalFiles, totalMatches, byScope }`, never storing or returning
 * file content or individual case paths.
 */
function countCitationsWithRg(repoDir, pattern, scopes) {
  const scopesBySpecificity = [...scopes].sort((a, b) => b.length - a.length);
  const result = spawnSync(
    "rg",
    [
      "--hidden",
      "-g",
      "!.git",
      "--with-filename",
      "--count-matches",
      "--color",
      "never",
      "-e",
      pattern,
      "--",
      ...scopes,
    ],
    {
      cwd: repoDir,
      encoding: "utf8",
      env: { ...process.env, RIPGREP_CONFIG_PATH: "" },
      maxBuffer: 16 * 1024 * 1024,
    },
  );

  if (result.error) {
    throw new Error(`failed to run rg: ${result.error.code ?? result.error.message}`);
  }
  if (result.status !== 0 && result.status !== 1) {
    // Raw rg stderr is intentionally omitted because it can contain case-bearing file paths.
    const stderrLines = result.stderr ? result.stderr.trim().split("\n").filter(Boolean).length : 0;
    const detail = stderrLines > 0 ? ` (${stderrLines} stderr line(s) suppressed)` : "";
    throw new Error(`rg exited with status ${result.status}${detail}`);
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
 * Fails closed if any search scope or round directory is missing so a path move cannot silently
 * mark cited files as uncited.
 */
export function scanGoldenRoundJson({
  repoDir = REPO_ROOT,
  roundDirs = DEFAULT_ROUND_DIRS,
  searchScopes = DEFAULT_SEARCH_SCOPES,
} = {}) {
  const normalizedRounds = roundDirs.map((dir) => toPosix(dir).replace(/\/+$/, ""));
  if (normalizedRounds.length === 0) {
    throw new Error("no golden round directories were configured");
  }
  const missingRounds = normalizedRounds.filter((dir) => !existsSync(resolve(repoDir, dir)));
  if (missingRounds.length > 0) {
    throw new Error(`missing golden round directories: ${missingRounds.join(", ")}`);
  }

  const normalizedScopes = searchScopes.map((scope) => toPosix(scope).replace(/\/+$/, ""));
  if (normalizedScopes.length === 0) {
    throw new Error("no search scopes were configured");
  }
  const missingScopes = normalizedScopes.filter((scope) => !existsSync(resolve(repoDir, scope)));
  if (missingScopes.length > 0) {
    throw new Error(`missing search scopes: ${missingScopes.join(", ")}`);
  }

  const candidates = listRoundJsonFiles(repoDir, normalizedRounds);

  // Scan each distinct round-anchored ancestor directory once so a directory-level provenance
  // citation (e.g. `2026-11-14-golden-coverage-audit/gap/`) protects every JSON file inside it.
  const uniqueAncestorDirs = new Set();
  for (const candidate of candidates) {
    for (const dir of ancestorRoundDirs(candidate)) {
      uniqueAncestorDirs.add(dir);
    }
  }
  const dirCountsMap = new Map();
  for (const dir of [...uniqueAncestorDirs].sort()) {
    const counts = countCitationsWithRg(repoDir, directoryCitationPattern(dir), normalizedScopes);
    if (counts.totalFiles > 0) {
      dirCountsMap.set(dir, counts);
    }
  }

  const cited = [];
  const uncited = [];

  for (const candidate of candidates) {
    const pattern = citationPattern(candidate.roundRelative);
    const counts = countCitationsWithRg(repoDir, pattern, normalizedScopes);
    const dirCitations = [];
    for (const dir of ancestorRoundDirs(candidate)) {
      const dirCounts = dirCountsMap.get(dir);
      if (dirCounts) {
        dirCitations.push({
          dir: `${dir}/`,
          totalFiles: dirCounts.totalFiles,
          totalMatches: dirCounts.totalMatches,
          byScope: dirCounts.byScope,
        });
      }
    }

    const entry = {
      path: candidate.path,
      roundRelative: candidate.roundRelative,
      totalFiles: counts.totalFiles,
      totalMatches: counts.totalMatches,
      byScope: counts.byScope,
      dirCitations,
    };

    if (counts.totalFiles > 0 || dirCitations.length > 0) {
      cited.push(entry);
    } else {
      uncited.push(entry);
    }
  }

  return {
    rounds: normalizedRounds,
    scopes: normalizedScopes,
    summary: {
      total: candidates.length,
      cited: cited.length,
      citedDirect: cited.filter((entry) => entry.totalFiles > 0).length,
      citedDirectoryOnly: cited.filter((entry) => entry.totalFiles === 0 && entry.dirCitations.length > 0).length,
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

function formatCitationDetails(item) {
  const parts = [];
  if (item.totalFiles > 0) {
    parts.push(`${item.totalFiles} files, ${item.totalMatches} matches: ${formatScopeCounts(item.byScope)}`);
  }
  for (const dirCitation of item.dirCitations) {
    parts.push(
      `dir:${dirCitation.dir} (${dirCitation.totalFiles} files, ${dirCitation.totalMatches} matches: ${formatScopeCounts(dirCitation.byScope)})`,
    );
  }
  return parts.join("; ");
}

export function parseArgs(argv) {
  const options = {
    repoDir: REPO_ROOT,
    mode: "summary",
    check: false,
    help: false,
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
    if (arg === "--help" || arg === "-h") {
      options.help = true;
      return options;
    }
    if (arg === "--repo") {
      const next = argv[++i];
      if (!next || next.startsWith("-")) {
        throw new Error("--repo requires a directory path");
      }
      options.repoDir = resolve(next);
    } else if (arg === "--uncited") {
      setMode("uncited");
    } else if (arg === "--cited") {
      setMode("cited");
    } else if (arg === "--json") {
      setMode("json");
    } else if (arg === "--check") {
      options.check = true;
    } else {
      throw new Error(`unknown argument: ${arg}`);
    }
  }
  return options;
}

function main(argv) {
  const options = parseArgs(argv);
  if (options.help) {
    console.log(USAGE);
    return;
  }

  const report = scanGoldenRoundJson({ repoDir: options.repoDir });

  if (options.mode === "json") {
    console.log(JSON.stringify(report, null, 2));
  } else if (options.mode === "uncited") {
    for (const item of report.uncited) console.log(item.path);
  } else if (options.mode === "cited") {
    for (const item of report.cited) {
      console.log(`${item.path}\t${formatCitationDetails(item)}`);
    }
  } else {
    const { total, cited, citedDirect, citedDirectoryOnly, uncited } = report.summary;
    console.log(
      `Golden-round JSON files: ${total} total, ${cited} cited (${citedDirect} direct, ${citedDirectoryOnly} directory-only), ${uncited} uncited`,
    );
    console.log(`Scopes searched: ${report.scopes.join(", ")}`);
    if (report.cited.length > 0) {
      console.log("\nCited (keep):");
      for (const item of report.cited) {
        console.log(`  ${item.path}  (${formatCitationDetails(item)})`);
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
