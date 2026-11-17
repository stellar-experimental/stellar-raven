import { consoleValue } from "./confirmation-only.mjs";

/**
 * Console report for scored protocol-history sets: one aggregate line per set, and the per-case
 * table only when `showRows` is set. `log` and `table` default to the console.
 */
export function reportProtocolHistorySets(sets, { showRows = false, log = console.log, table = console.table } = {}) {
  for (const set of sets) {
    log(
      `${set.contract}: required ${set.requiredTop5}/${set.required} top-five; ` +
        `forbidden captures ${set.forbiddenTop5Captures}/${set.forbidden}; ` +
        `neutral captures ${set.neutralTop5Captures}/${set.neutral}; ` +
        `${set.pass ? "PASS" : "FAIL"}`,
    );
    if (showRows) {
      table(
        set.cases.map((testCase) => ({
          id: testCase.id,
          role: testCase.role,
          targetRank: consoleValue(testCase, testCase.targetRank ?? "miss"),
          top: consoleValue(testCase, testCase.topHits[0]?.id ?? "none"),
        })),
      );
    }
  }
}
