/**
 * Lookup for the committed confirmation-only routing rows (eval/routing-qa-overlap.json).
 *
 * A routing or discovery row whose question matches a QA headline question is confirmation-only:
 * a runner tags its result row and prints aggregate counts in place of its per-row outcome. The
 * lookup is keyed by set name, so two sets that share row ids stay separate. It fails closed: a
 * missing list, an unknown set, or a listed id that its set no longer holds throws, which is what a
 * stale list looks like after `npm run eval:compile`.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const OVERLAP_LIST_PATH = join(dirname(fileURLToPath(import.meta.url)), "..", "routing-qa-overlap.json");
export const CONFIRMATION_ONLY_LABEL = "confirmation-only";
export const REGENERATE_COMMAND = "npm run eval:routing:overlap";

let cached;

function loadList() {
  if (cached) return cached;
  if (!existsSync(OVERLAP_LIST_PATH)) {
    throw new Error(`missing eval/routing-qa-overlap.json — run: ${REGENERATE_COMMAND}`);
  }
  const list = JSON.parse(readFileSync(OVERLAP_LIST_PATH, "utf8"));
  if (!list || typeof list.sets !== "object" || list.sets === null) {
    throw new Error(`eval/routing-qa-overlap.json has no sets — run: ${REGENERATE_COMMAND}`);
  }
  cached = list;
  return list;
}

/**
 * The predicate for one set. `ids` are the row ids the runner is about to grade, so a listed id the
 * set no longer holds throws instead of leaving a row silently untagged.
 */
export function confirmationOnlyFor(setName, ids) {
  const entry = loadList().sets[setName];
  if (!entry || !Array.isArray(entry.ids)) {
    throw new Error(`eval/routing-qa-overlap.json has no set "${setName}" — run: ${REGENERATE_COMMAND}`);
  }
  const present = new Set(ids);
  for (const id of entry.ids) {
    if (!present.has(id)) {
      throw new Error(`eval/routing-qa-overlap.json lists "${id}" which set "${setName}" does not hold — run: ${REGENERATE_COMMAND}`);
    }
  }
  const listed = new Set(entry.ids);
  return (id) => listed.has(id);
}

/** Tag listed rows `confirmationOnly: true`. The grading fields stay in the artifact to be counted. */
export function tagRows(rows, isListed) {
  for (const row of rows) if (isListed(row.id)) row.confirmationOnly = true;
  return rows;
}

/** The console cell for a per-row value: the value, or the label for a listed row. */
export function consoleValue(row, value) {
  return row.confirmationOnly ? CONFIRMATION_ONLY_LABEL : value;
}
