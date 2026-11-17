import { readFileSync } from "node:fs";
import { relative } from "node:path";

/**
 * Read a JSON file for a runner. A parse error from `JSON.parse` can quote the file, and the
 * runners read case files, so the failure names the file only and keeps no cause.
 */
export function readJson(path, repo = process.cwd()) {
  const text = readFileSync(path, "utf8");
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`${relative(repo, path) || path} is not valid JSON`);
  }
}
