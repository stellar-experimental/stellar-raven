import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** Select Markdown files for one GitHub source using update.sh's source modes. */
export function selectGitHubSkillFiles(treeResponse, { sourcePath, picks = [] }) {
  const tree = Array.isArray(treeResponse?.tree) ? treeResponse.tree : [];
  const selected = new Set(picks.filter(Boolean));

  if (sourcePath === "") {
    if (selected.size !== 1) {
      throw new Error("a repo-root single-skill source requires exactly one skill name");
    }
    const [skill] = selected;
    return tree
      .filter((entry) => entry.type === "blob" && entry.path.endsWith(".md"))
      .map((entry) => ({
        skill,
        relpath: entry.path,
        size: entry.size,
        sha: entry.sha,
        src: entry.path
      }))
      .sort((a, b) => a.relpath.localeCompare(b.relpath));
  }

  const prefix = sourcePath === "." ? "" : `${sourcePath}/`;
  return tree
    .filter((entry) => entry.type === "blob" && entry.path.startsWith(prefix) && entry.path.endsWith(".md"))
    .map((entry) => ({ entry, rel: entry.path.slice(prefix.length) }))
    .filter(({ rel }) => rel.includes("/"))
    .map(({ entry, rel }) => {
      const slash = rel.indexOf("/");
      return {
        skill: rel.slice(0, slash),
        relpath: rel.slice(slash + 1),
        size: entry.size,
        sha: entry.sha,
        src: entry.path
      };
    })
    .filter((file) => selected.size === 0 || selected.has(file.skill))
    .sort((a, b) => `${a.skill}/${a.relpath}`.localeCompare(`${b.skill}/${b.relpath}`));
}

function cliOptions(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index];
    const value = argv[index + 1];
    if (value === undefined) throw new Error(`${flag} requires a value`);
    if (flag === "--source-path") options.sourcePath = value;
    else if (flag === "--picks-json") options.picks = JSON.parse(value);
    else throw new Error(`unknown argument ${flag}`);
  }
  if (typeof options.sourcePath !== "string") throw new Error("--source-path is required");
  if (!Array.isArray(options.picks)) throw new Error("--picks-json must be an array");
  return options;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const tree = JSON.parse(readFileSync(0, "utf8"));
    process.stdout.write(JSON.stringify(selectGitHubSkillFiles(tree, cliOptions(process.argv.slice(2)))));
  } catch (error) {
    console.error(`error: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}
