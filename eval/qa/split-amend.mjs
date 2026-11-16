/**
 * The pure core of a dated split amendment: move the one held-out case a stored results file
 * identifies by `caseInputSha256` to the tuning set (eval/qa/README.md, "Held-out split").
 *
 * The function reads `caseInputSha256` of every row and `id` of the single matching row, and no
 * other field of any row. It never returns or throws an id, a question, or a row field: a failed
 * check throws an `AmendError` whose message is one fixed line.
 */
const HEX64 = /^[a-f0-9]{64}$/;

/** The split before and after the amendment of 2026-11-16 (decision 2(b)). */
export const COUNTS_BEFORE = { tuning: 79, heldOut: 119, reserve: 49 };
export const COUNTS_AFTER = { tuning: 80, heldOut: 118, reserve: 49 };

export const AMENDMENT_NOTE =
  "2026-11-16: decision 2(b): one held-out case whose answer the orchestrator saw in the loop 2 read " +
  "moved to tuning; identified by caseInputSha256 in heldout-2026-11-15/exposed-row.sha256; " +
  "strata describe the draw, not the amended sets";

/** The fixed failure lines. A check is named by its key; no line ever carries data. */
export const CHECK_LINES = {
  target: "check failed: the exposed-row hash is not 64 lowercase hex characters",
  rows: "check failed: the results file has no rows array",
  noMatch: "check failed: no results row matches the exposed-row hash",
  manyMatches: "check failed: more than one results row matches the exposed-row hash",
  matchId: "check failed: the matching row has no string id",
  splitShape: "check failed: the split does not hold tuning, heldOut and reserve id arrays and an amended string",
  countsBefore: "check failed: the split is not 79 tuning, 119 heldOut, 49 reserve",
  partition: "check failed: the split sets are not 247 distinct ids across three disjoint sets",
  notHeldOut: "check failed: the matching id is not in heldOut exactly once, or is also in another set",
  countsAfter: "check failed: the amended split is not 80 tuning, 118 heldOut, 49 reserve",
  samePartition: "check failed: the amended split does not partition the same ids",
  notACase: "check failed: the moved id is not a case in eval/qa/cases.json",
};

export class AmendError extends Error {
  constructor(check) {
    super(CHECK_LINES[check]);
    this.name = "AmendError";
    this.check = check;
  }
}

const SET_KEYS = ["tuning", "heldOut", "reserve"];

function requireCheck(condition, check) {
  if (!condition) throw new AmendError(check);
}

function countsOf(sets) {
  return { tuning: sets.tuning.length, heldOut: sets.heldOut.length, reserve: sets.reserve.length };
}

const sameCounts = (a, b) => SET_KEYS.every((key) => a[key] === b[key]);

function allIds(sets) {
  return SET_KEYS.flatMap((key) => sets[key]);
}

/**
 * @param {object} input
 * @param {object} input.split      the v2 split object
 * @param {Array}  input.rows       `results.rows`
 * @param {string} input.targetSha256  the exposed row's `caseInputSha256`
 * @param {Iterable<string>} input.caseIds  the ids in eval/qa/cases.json
 * @returns {{ v3: object, counts: { tuning: number, heldOut: number, reserve: number } }}
 */
export function amendSplit({ split, rows, targetSha256, caseIds }) {
  const target = typeof targetSha256 === "string" ? targetSha256.trim() : "";
  requireCheck(HEX64.test(target), "target");
  requireCheck(Array.isArray(rows), "rows");

  let matchRow;
  let matches = 0;
  for (const row of rows) {
    if (row.caseInputSha256 === target) {
      matchRow = row;
      matches += 1;
    }
  }
  requireCheck(matches !== 0, "noMatch");
  requireCheck(matches === 1, "manyMatches");
  const movedId = matchRow.id;
  requireCheck(typeof movedId === "string" && movedId.length > 0, "matchId");

  const sets = split?.sets;
  requireCheck(
    sets && SET_KEYS.every((key) => Array.isArray(sets[key])) && typeof split.amended === "string",
    "splitShape",
  );
  requireCheck(sameCounts(countsOf(sets), COUNTS_BEFORE), "countsBefore");
  const before = allIds(sets);
  requireCheck(
    new Set(before).size === before.length && before.length === COUNTS_BEFORE.tuning + COUNTS_BEFORE.heldOut + COUNTS_BEFORE.reserve,
    "partition",
  );
  requireCheck(
    sets.heldOut.filter((id) => id === movedId).length === 1 &&
      !sets.tuning.includes(movedId) &&
      !sets.reserve.includes(movedId),
    "notHeldOut",
  );

  const v3 = {
    ...split,
    sets: {
      ...sets,
      tuning: [...sets.tuning, movedId],
      heldOut: sets.heldOut.filter((id) => id !== movedId),
    },
    amended: split.amended.length > 0 ? `${split.amended}; ${AMENDMENT_NOTE}` : AMENDMENT_NOTE,
  };

  const counts = countsOf(v3.sets);
  requireCheck(sameCounts(counts, COUNTS_AFTER), "countsAfter");
  const after = allIds(v3.sets);
  const beforeIds = new Set(before);
  requireCheck(
    new Set(after).size === after.length && after.length === before.length && after.every((id) => beforeIds.has(id)),
    "samePartition",
  );
  requireCheck(new Set(caseIds).has(movedId), "notACase");

  return { v3, counts };
}
