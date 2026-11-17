import { describe, expect, it } from "vitest";
import { reportProtocolHistorySets } from "../eval/lib/protocol-history-report.mjs";

const sets = [
  {
    contract: "synthetic-protocol-history-v2",
    required: 1,
    requiredTop5: 1,
    forbidden: 1,
    forbiddenTop5Captures: 0,
    neutral: 0,
    neutralTop5Captures: 0,
    pass: true,
    cases: [
      { id: "required-history", role: "required", targetRank: 2, topHits: [{ id: "scout.other" }] },
      { id: "forbidden-current", role: "forbidden", targetRank: null, topHits: [{ id: "scout.current" }], confirmationOnly: true },
    ],
  },
];

function report(options) {
  const lines = [];
  const tables = [];
  reportProtocolHistorySets(sets, { ...options, log: (line) => lines.push(line), table: (rows) => tables.push(rows) });
  return { lines, tables };
}

describe("protocol-history console report", () => {
  it("prints the set aggregate and no per-case row by default", () => {
    const { lines, tables } = report({});
    expect(lines).toEqual([
      "synthetic-protocol-history-v2: required 1/1 top-five; forbidden captures 0/1; neutral captures 0/0; PASS",
    ]);
    expect(tables).toEqual([]);
  });

  it("adds the per-case table under showRows, with confirmation-only rows labeled", () => {
    const { tables } = report({ showRows: true });
    expect(tables).toHaveLength(1);
    expect(tables[0].map((row) => row.id)).toEqual(["required-history", "forbidden-current"]);
    expect(tables[0][1]).toMatchObject({ targetRank: "confirmation-only", top: "confirmation-only" });
  });
});
