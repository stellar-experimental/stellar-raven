import { describe, expect, it } from "vitest";
import {
  AMENDMENT_NOTE,
  AmendError,
  CHECK_LINES,
  COUNTS_AFTER,
  COUNTS_BEFORE,
  amendSplit,
} from "../eval/qa/split-amend.mjs";

const pad = (i) => String(i).padStart(3, "0");
const ids = (prefix, n) => Array.from({ length: n }, (_, i) => `${prefix}-${pad(i)}`);
const tuning = ids("syn-t", COUNTS_BEFORE.tuning);
const heldOut = ids("syn-h", COUNTS_BEFORE.heldOut);
const reserve = ids("syn-r", COUNTS_BEFORE.reserve);
const caseIds = [...tuning, ...heldOut, ...reserve];
const TARGET = "a".repeat(64);
const movedId = heldOut[7];

const makeSplit = (overrides = {}) => ({
  schema: "qa-split-v1",
  strata: 41,
  amended: "earlier note",
  sets: { tuning: [...tuning], heldOut: [...heldOut], reserve: [...reserve] },
  ...overrides,
});

/** A row whose every field but the two the function may read throws when read. */
function poisonedRow(id, caseInputSha256, { idReadable }) {
  const row = {};
  for (const field of ["question", "golden", "tags", "verdict", "answer", "transcript", "score"]) {
    Object.defineProperty(row, field, {
      enumerable: true,
      get() {
        throw new Error(`poisoned field ${field} was read`);
      },
    });
  }
  Object.defineProperty(row, "caseInputSha256", { enumerable: true, value: caseInputSha256 });
  Object.defineProperty(row, "id", {
    enumerable: true,
    get() {
      if (!idReadable) throw new Error("poisoned id of a non-matching row was read");
      return id;
    },
  });
  return row;
}

const makeRows = (matchHash = TARGET) =>
  caseIds.map((id, i) =>
    id === movedId
      ? poisonedRow(id, matchHash, { idReadable: true })
      : poisonedRow(id, i.toString(16).padStart(64, "0"), { idReadable: false }),
  );

const run = (overrides = {}) =>
  amendSplit({ split: makeSplit(), rows: makeRows(), targetSha256: `${TARGET}\n`, caseIds, ...overrides });

const failure = (fn) => {
  try {
    fn();
  } catch (error) {
    return error;
  }
  throw new Error("expected a failure");
};

describe("amendSplit", () => {
  it("moves the one matching held-out id to tuning and reads no other row field", () => {
    const { v3, counts } = run();
    expect(counts).toEqual(COUNTS_AFTER);
    expect(v3.sets.tuning).toEqual([...tuning, movedId]);
    expect(v3.sets.heldOut).toEqual(heldOut.filter((id) => id !== movedId));
    expect(v3.sets.reserve).toEqual(reserve);
    expect(v3.amended).toBe(`earlier note; ${AMENDMENT_NOTE}`);
    expect(v3.strata).toBe(41);
    expect(v3.schema).toBe("qa-split-v1");
  });

  it("leaves the v2 object untouched and returns no id outside the split", () => {
    const split = makeSplit();
    const frozen = JSON.stringify(split);
    const result = amendSplit({ split, rows: makeRows(), targetSha256: TARGET, caseIds });
    expect(JSON.stringify(split)).toBe(frozen);
    expect(Object.keys(result).sort()).toEqual(["counts", "v3"]);
    expect(JSON.stringify(result.counts)).not.toContain(movedId);
  });

  it("starts an empty amended string without a leading separator", () => {
    expect(run({ split: makeSplit({ amended: "" }) }).v3.amended).toBe(AMENDMENT_NOTE);
  });

  it.each([
    ["target", { targetSha256: "ABC" }],
    ["target", { targetSha256: undefined }],
    ["rows", { rows: null }],
    ["noMatch", { targetSha256: "b".repeat(64) }],
    ["countsBefore", { split: makeSplit({ sets: { tuning, heldOut: heldOut.slice(1), reserve } }) }],
    ["splitShape", { split: makeSplit({ amended: undefined }) }],
    ["partition", { split: makeSplit({ sets: { tuning: [...tuning.slice(1), heldOut[0]], heldOut, reserve } }) }],
    ["notHeldOut", { split: makeSplit({ sets: { tuning: [...tuning.slice(1), movedId], heldOut: heldOut.filter((id) => id !== movedId).concat("syn-h-extra"), reserve } }) }],
    ["notACase", { caseIds: caseIds.filter((id) => id !== movedId) }],
  ])("fails the %s check with its one fixed line", (check, overrides) => {
    const error = failure(() => run(overrides));
    expect(error).toBeInstanceOf(AmendError);
    expect(error.check).toBe(check);
    expect(error.message).toBe(CHECK_LINES[check]);
    expect(error.message).not.toContain(movedId);
  });

  it("fails when two rows match", () => {
    const rows = [...makeRows(), poisonedRow("syn-dup", TARGET, { idReadable: true })];
    expect(failure(() => run({ rows })).check).toBe("manyMatches");
  });

  it("fails when the matching row has no string id", () => {
    const rows = [{ caseInputSha256: TARGET, id: 7 }];
    expect(failure(() => run({ rows })).check).toBe("matchId");
  });

  it("fails when the match is in reserve or tuning, not held-out", () => {
    const reserveMatch = makeSplit({
      sets: { tuning, heldOut: heldOut.filter((id) => id !== movedId).concat("syn-h-extra"), reserve: [...reserve.slice(1), movedId] },
    });
    expect(failure(() => run({ split: reserveMatch })).check).toBe("notHeldOut");
  });
});
