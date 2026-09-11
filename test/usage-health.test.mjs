import { describe, it, expect } from "vitest";
import { healthFailures } from "../scripts/check-usage-health.mjs";
import { deploymentFailures } from "../scripts/check-usage-deployment.mjs";

describe("usage monitoring", () => {
  const now = Date.parse("2026-09-11T16:00:00Z");
  const report = { generatedAt: new Date(now).toISOString(), health: {
    last_canary_ms: now - 3600000, missing_response_ids: 0, failed_statements: 0,
    truncated_invocations: 0, failed_invocations: 0
  } };
  it("fails on absent or stale canaries and persisted collection gaps", () => {
    expect(healthFailures(report, now)).toEqual([]);
    expect(healthFailures({ ...report, health: { ...report.health, last_canary_ms: now - 4 * 3600000 } }, now)).not.toEqual([]);
    expect(healthFailures({ ...report, health: { ...report.health, missing_response_ids: 1 } }, now)).not.toEqual([]);
    expect(healthFailures({}, now)).not.toEqual([]);
  });
  it("checks the required consumer without rejecting another legitimate consumer", () => {
    const schedules = { schedules: [{ cron: "17 3 * * *" }] };
    expect(deploymentFailures({ tail_consumers: [{ service: "stellar-raven-usage" }, { service: "another-consumer" }] }, schedules)).toEqual([]);
    expect(deploymentFailures({ tail_consumers: [] }, schedules)).not.toEqual([]);
  });
});
