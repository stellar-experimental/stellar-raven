/**
 * Shared selection for committed scans over the tuning set.
 *
 * The split file is read for `sets.tuning` only. Rows of a results or cases file are selected by
 * id before any other field of any row is read, and each selection asserts its count, so a row
 * outside `sets.tuning` is never inspected.
 */
/** The number of tuning rows in the current split. A dated split amendment changes it here only. */
export const TUNING_ROW_COUNT = 81;

/** The tuning ids of a split. Asserts `TUNING_ROW_COUNT` unique ids. */
export function tuningIdsOf(split) {
  const ids = split?.sets?.tuning;
  if (!Array.isArray(ids) || ids.length !== TUNING_ROW_COUNT) {
    throw new Error(`sets.tuning must list ${TUNING_ROW_COUNT} ids, got ${ids?.length}`);
  }
  if (new Set(ids).size !== TUNING_ROW_COUNT) throw new Error("sets.tuning has duplicate ids");
  return ids;
}

/**
 * The entries of `list` whose id is in `ids`, selected by id alone. `expected` is the count the
 * caller asserts: `ids.length` for a baseline or the case corpus, 50 for a stored panel run.
 */
export function selectById(list, ids, expected, label) {
  const wanted = new Set(ids);
  const selected = (list ?? []).filter((entry) => wanted.has(entry.id));
  if (selected.length !== expected) {
    throw new Error(`${label} holds ${selected.length} tuning rows, expected ${expected}`);
  }
  return selected;
}
