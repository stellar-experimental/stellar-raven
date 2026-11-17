import { describe, expect, it } from "vitest";
import {
  AMENDMENT_NOTE,
  AmendError,
  CHECK_LINES,
  COUNTS_AFTER,
  COUNTS_BEFORE,
  amendSplit,
  moveToTuning,
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

describe("moveToTuning", () => {
  const countsBefore = { tuning: 80, heldOut: 118, reserve: 49 };
  const moveTuning = ids("syn-t", countsBefore.tuning);
  const moveHeld = ids("syn-h", countsBefore.heldOut);
  const moveReserve = ids("syn-r", countsBefore.reserve);
  const moveCaseIds = [...moveTuning, ...moveHeld, ...moveReserve];
  const note = "a fixed test note";
  const base = () => ({
    schema: "qa-split-v1",
    amended: "earlier note",
    sets: { tuning: [...moveTuning], heldOut: [...moveHeld], reserve: [...moveReserve] },
  });
  const move = (overrides = {}) =>
    moveToTuning({
      split: base(),
      movedId: moveHeld[3],
      allowedFrom: ["heldOut", "reserve"],
      countsBefore,
      caseIds: moveCaseIds,
      note,
      ...overrides,
    });

  it("moves a held-out id to tuning and appends the note", () => {
    const { split, counts } = move();
    expect(counts).toEqual({ tuning: 81, heldOut: 117, reserve: 49 });
    expect(split.sets.tuning).toEqual([...moveTuning, moveHeld[3]]);
    expect(split.sets.heldOut).toEqual(moveHeld.filter((id) => id !== moveHeld[3]));
    expect(split.sets.reserve).toEqual(moveReserve);
    expect(split.amended).toBe(`earlier note; ${note}`);
  });

  it("moves a reserve id to tuning", () => {
    const { split, counts } = move({ movedId: moveReserve[9] });
    expect(counts).toEqual({ tuning: 81, heldOut: 118, reserve: 48 });
    expect(split.sets.tuning.at(-1)).toBe(moveReserve[9]);
    expect(split.sets.reserve).toEqual(moveReserve.filter((id) => id !== moveReserve[9]));
    expect(split.sets.heldOut).toEqual(moveHeld);
  });

  it("leaves the input split untouched", () => {
    const input = base();
    const frozen = JSON.stringify(input);
    move({ split: input });
    expect(JSON.stringify(input)).toBe(frozen);
  });

  it.each([
    ["an id already in tuning", { movedId: moveTuning[0] }],
    ["an id that is absent", { movedId: "syn-absent" }],
    ["a source set that is not allowed", { allowedFrom: ["heldOut"], movedId: moveReserve[0] }],
  ])("fails moveNotAllowed for %s", (_label, overrides) => {
    const error = failure(() => move(overrides));
    expect(error).toBeInstanceOf(AmendError);
    expect(error.check).toBe("moveNotAllowed");
    expect(error.message).toBe(CHECK_LINES.moveNotAllowed);
    expect(error.message).not.toContain(String(overrides.movedId));
  });

  it("fails the partition check, before the id check, when the id is in two sets", () => {
    const split = base();
    split.sets.reserve = [...moveReserve.slice(1), moveHeld[3]];
    expect(failure(() => move({ split })).check).toBe("partition");
  });

  it("fails moveNotAllowed for an empty allowed list", () => {
    expect(failure(() => move({ allowedFrom: [] })).check).toBe("moveNotAllowed");
  });

  it("fails notACase for an id that is not a case", () => {
    const error = failure(() => move({ caseIds: moveCaseIds.filter((id) => id !== moveHeld[3]) }));
    expect(error.check).toBe("notACase");
    expect(error.message).toBe(CHECK_LINES.notACase);
  });

  it.each([
    ["splitShape", { split: { sets: { tuning: [], heldOut: [] }, amended: "" } }],
    ["moveCountsBefore", { countsBefore: { tuning: 79, heldOut: 119, reserve: 49 } }],
    ["partition", { split: { ...base(), sets: { tuning: [...moveTuning.slice(1), moveHeld[0]], heldOut: moveHeld, reserve: moveReserve } } }],
  ])("fails the %s check before it looks for the id", (check, overrides) => {
    const error = failure(() => move({ movedId: "syn-absent", ...overrides }));
    expect(error.check).toBe(check);
    expect(error.message).toBe(CHECK_LINES[check]);
  });

  it("keeps the new check lines free of the D2 counts", () => {
    for (const key of ["moveCountsBefore", "moveNotAllowed", "moveCountsAfter"]) {
      expect(CHECK_LINES[key]).not.toMatch(/\d/);
    }
  });
});
