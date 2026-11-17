/**
 * The pure core of a dated split amendment (eval/qa/README.md, "Held-out split").
 *
 * `moveToTuning` moves one named id from an allowed non-tuning set to the tuning set. `amendSplit`
 * is the D2 wrapper: it finds the one held-out case a stored results file identifies by
 * `caseInputSha256` and moves it. `amendSplit` reads `caseInputSha256` of every row and `id` of the
 * single matching row, and no other field of any row. Neither function returns or throws an id, a
 * question, or a row field: a failed check throws an `AmendError` whose message is one fixed line.
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
  // The general move (`moveToTuning`) names its own counts and source sets, so it has its own lines.
  moveCountsBefore: "check failed: the split sets do not hold the expected counts before the move",
  moveNotAllowed: "check failed: the moved id is not in exactly one allowed source set, or is also in another set",
  moveCountsAfter: "check failed: the amended split does not hold the expected counts after the move",
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
 * Move `movedId` from one of the `allowedFrom` sets to the tuning set.
 *
 * Check order: shape, `countsBefore`, a disjoint partition of all ids, then the id appears exactly
 * once and only in a set listed in `allowedFrom`. After the move: the counts (tuning +1, the source
 * set -1), the same partition, and membership in `caseIds`.
 *
 * @param {object} input
 * @param {object} input.split         the split object
 * @param {string} input.movedId       the id to move
 * @param {Array<"heldOut"|"reserve">} input.allowedFrom  the sets the id may leave
 * @param {{ tuning: number, heldOut: number, reserve: number }} input.countsBefore
 * @param {Iterable<string>} input.caseIds  the ids in eval/qa/cases.json
 * @param {string} input.note          appended to the split's `amended` string
 * @returns {{ split: object, counts: { tuning: number, heldOut: number, reserve: number } }}
 */
export function moveToTuning({ split, movedId, allowedFrom, countsBefore, caseIds, note }) {
  const sets = split?.sets;
  requireCheck(
    sets && SET_KEYS.every((key) => Array.isArray(sets[key])) && typeof split.amended === "string",
    "splitShape",
  );
  requireCheck(sameCounts(countsOf(sets), countsBefore), "moveCountsBefore");
  const before = allIds(sets);
  requireCheck(
    new Set(before).size === before.length && before.length === SET_KEYS.reduce((sum, key) => sum + countsBefore[key], 0),
    "partition",
  );
  const holders = SET_KEYS.filter((key) => sets[key].includes(movedId));
  requireCheck(
    holders.length === 1 &&
      allowedFrom.includes(holders[0]) &&
      holders[0] !== "tuning" &&
      sets[holders[0]].filter((id) => id === movedId).length === 1,
    "moveNotAllowed",
  );
  const source = holders[0];

  const next = {
    ...split,
    sets: {
      ...sets,
      tuning: [...sets.tuning, movedId],
      [source]: sets[source].filter((id) => id !== movedId),
    },
    amended: split.amended.length > 0 ? `${split.amended}; ${note}` : note,
  };

  const counts = countsOf(next.sets);
  requireCheck(
    sameCounts(counts, { ...countsBefore, tuning: countsBefore.tuning + 1, [source]: countsBefore[source] - 1 }),
    "moveCountsAfter",
  );
  const after = allIds(next.sets);
  const beforeIds = new Set(before);
  requireCheck(
    new Set(after).size === after.length && after.length === before.length && after.every((id) => beforeIds.has(id)),
    "samePartition",
  );
  requireCheck(new Set(caseIds).has(movedId), "notACase");

  return { split: next, counts };
}

/** The `moveToTuning` checks whose D2 spelling differs from the general one. */
const D2_CHECKS = { moveCountsBefore: "countsBefore", moveNotAllowed: "notHeldOut", moveCountsAfter: "countsAfter" };

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

  try {
    const { split: v3, counts } = moveToTuning({
      split,
      movedId,
      allowedFrom: ["heldOut"],
      countsBefore: COUNTS_BEFORE,
      caseIds,
      note: AMENDMENT_NOTE,
    });
    requireCheck(sameCounts(counts, COUNTS_AFTER), "countsAfter");
    return { v3, counts };
  } catch (error) {
    if (error instanceof AmendError && D2_CHECKS[error.check]) throw new AmendError(D2_CHECKS[error.check]);
    throw error;
  }
}
