import { describe, expect, it } from "vitest";
import {
  MAX_PAID_CALLS,
  RECOVERY_COST_PLAN,
  SUCCESSFUL_PATH_PAID_CALLS
} from "../eval/repo-recovery/artifact.mjs";
import { assertRecoveryBudget } from "../eval/repo-recovery/collect.mjs";

describe("repository-recovery paid-plan arithmetic", () => {
  it("pins the reviewed cohort and conservative hard cap", () => {
    expect(RECOVERY_COST_PLAN).toMatchObject({
      cohort: "2026-08-27 connector collect-only, 8 cases per run",
      cohortClaudeVersion: "2.1.247",
      cohortWrapperSha256: "a8b9ec4b7c77b2538a5e299e8d900c3793f69d7101c0661cfd1146b76406c297",
      plannedClaudeVersion: "2.1.251",
      runMeansUsd: [0.280770775, 0.2965796],
      pooledCallMinUsd: 0.0661584,
      pooledCallMedianUsd: 0.2353369,
      pooledCallMaxUsd: 0.5837418,
      pooledCallMeanUsd: 0.2886751875,
      hardCapUsd: 30
    });
    expect(SUCCESSFUL_PATH_PAID_CALLS).toBe(20);
    expect(MAX_PAID_CALLS).toBe(40);
    expect(SUCCESSFUL_PATH_PAID_CALLS * RECOVERY_COST_PLAN.pooledCallMaxUsd).toBeCloseTo(11.674836, 12);
    expect(MAX_PAID_CALLS * RECOVERY_COST_PLAN.pooledCallMaxUsd).toBeCloseTo(23.349672, 12);
    expect(RECOVERY_COST_PLAN.hardCapUsd - RECOVERY_COST_PLAN.maximumPathAtObservedMaxUsd)
      .toBeCloseTo(6.650328, 12);
    expect(RECOVERY_COST_PLAN.headroomUsd / RECOVERY_COST_PLAN.maximumPathAtObservedMaxUsd * 100)
      .toBeCloseTo(28.4815, 4);
    expect(assertRecoveryBudget(30)).toBe(30);
    expect(() => assertRecoveryBudget(15)).toThrow(/must equal.*\$30\.00/);
  });
});
