import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** Select Markdown files for one GitHub source using update.sh's source modes. */
export function selectGitHubSkillFiles(treeResponse, { sourcePath, picks = [] }) {
  // A partial or malformed tree would pin a partial skill set that looks complete.
  if (!Array.isArray(treeResponse?.tree)) throw new Error("GitHub tree response has no tree array");
  if (treeResponse.truncated) throw new Error("GitHub returned a truncated tree; refusing a partial selection");
  const tree = treeResponse.tree;
  const selected = new Set(picks.filter(Boolean));

  if (sourcePath === "") {
    if (selected.size !== 1) {
      throw new Error("a repo-root single-skill source requires exactly one skill name");
    }
    const [skill] = selected;
    const files = tree
      .filter((entry) => entry.type === "blob" && entry.path.endsWith(".md"))
      .map((entry) => ({
        skill,
        relpath: entry.path,
        size: entry.size,
        sha: entry.sha,
        src: entry.path
      }))
      .sort((a, b) => a.relpath.localeCompare(b.relpath));
    if (!files.some((file) => file.relpath === "SKILL.md")) {
      throw new Error(`repo-root skill "${skill}" has no SKILL.md`);
    }
    return files;
  }

  const prefix = sourcePath === "." ? "" : `${sourcePath}/`;
  const files = tree
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
  if (files.length === 0) throw new Error(`no skill files selected under "${sourcePath}"`);
  for (const pick of selected) {
    if (!files.some((file) => file.skill === pick && file.relpath === "SKILL.md")) {
      throw new Error(`picked skill "${pick}" has no SKILL.md under "${sourcePath}"`);
    }
  }
  // Without picks every child directory becomes a skill, so each must be one.
  for (const skill of new Set(files.map((file) => file.skill))) {
    if (!files.some((file) => file.skill === skill && file.relpath === "SKILL.md")) {
      throw new Error(`selected directory "${skill}" under "${sourcePath}" has no SKILL.md`);
    }
  }
  return files;
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
