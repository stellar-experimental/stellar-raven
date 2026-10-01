import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** The source definitions shared by update.sh and the drift checker. */
export function readSourceDefinitions(path) {
  const definitions = JSON.parse(readFileSync(path, "utf8"));
  if (!Array.isArray(definitions) || definitions.length === 0) throw new Error("skill sources must be a nonempty array");
  const ids = new Set();
  for (const source of definitions) {
    for (const field of ["id", "owner", "repo", "ref"]) {
      const pattern = field === "ref" ? /^[\w./-]+$/ : /^[\w.-]+$/;
      if (typeof source[field] !== "string" || !pattern.test(source[field])) {
        throw new Error(`invalid skill source ${field}`);
      }
    }
    if (ids.has(source.id)) throw new Error(`duplicate skill source "${source.id}"`);
    ids.add(source.id);
    if (typeof source.path !== "string" || (source.path && !/^[\w./-]+$/.test(source.path))) {
      throw new Error(`invalid skill source path for "${source.id}"`);
    }
    if (!Array.isArray(source.picks) || source.picks.some((pick) => typeof pick !== "string" || !/^[\w.-]+$/.test(pick))) {
      throw new Error(`invalid skill picks for "${source.id}"`);
    }
    if (!(source.mode === "root" && source.path === "" && source.picks.length === 1) &&
        !(source.mode === "all" && source.path !== "" && source.picks.length === 0) &&
        !(source.mode === "pick" && source.path !== "" && source.picks.length > 0)) {
      throw new Error(`inconsistent skill selection mode for "${source.id}"`);
    }
  }
  return definitions;
}

export function sourceDefinition(source, definitions) {
  const definition = definitions.find((entry) => entry.id === source.id);
  if (!definition) throw new Error(`no source definition for "${source.id}"`);
  for (const field of ["owner", "repo", "path", "ref"]) {
    if (definition[field] !== source[field]) throw new Error(`source definition ${field} differs from pin for "${source.id}"`);
  }
  return definition;
}

// JSON lines keep the shell loop simple without executing source definitions.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  for (const source of readSourceDefinitions(process.argv[2])) console.log(JSON.stringify(source));
}
