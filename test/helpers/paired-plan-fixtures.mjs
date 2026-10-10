/**
 * Simulated free-phase and P6 records for paired collection plan tests.
 *
 * The supervisor validator reads a capacity artifact and a P6 summary from
 * disk. Both the hand-written supervisor plan and the assembled launch plan
 * need records that satisfy those contracts, so they are built here once.
 * The values are simulated; no capacity probe or paid call produced them.
 */
import { PAIRED_CAPACITY_CONTRACT, PAIRED_CAPACITY_SCHEMA } from "../../eval/qa/check-paired-capacity.mjs";
import { P6_SELF_TEST_CALL_SCHEMA, P6_SELF_TEST_SUMMARY_SCHEMA } from "../../eval/qa/run-p6-judge-self-test.mjs";

function capacityService(responses) {
  return {
    requests: responses,
    responses,
    successfulResponses: responses,
    httpErrors: 0,
    transportErrors: 0,
    retryEvents: 0,
    retryAfterObserved: 0,
    latency: { count: responses, minMs: 1, p50Ms: 2, p95Ms: 3, maxMs: 3, meanMs: 2 }
  };
}

/** An accepted capacity artifact that completed at `completedAt`. */
export function acceptedCapacityArtifact(completedAt) {
  return {
    schema: PAIRED_CAPACITY_SCHEMA,
    contract: PAIRED_CAPACITY_CONTRACT,
    startedAt: completedAt,
    completedAt,
    durationMs: 10,
    method: {
      schedule: PAIRED_CAPACITY_CONTRACT.schedule.kind,
      agentsReleasedTogether: 2,
      capturesPerAgent: 1,
      publicRequestPattern: "one committed seven-response remote-identity capture per agent",
      expectedRequestsPerSuccessfulAgent: 7,
      paidModelCalls: 0,
      localServerUsed: false
    },
    observed: {
      maximumActiveFetches: 2,
      requests: 14,
      responses: 14,
      successfulResponses: 14,
      httpErrors: 0,
      transportErrors: 0,
      retries: 0,
      retryAfterObserved: 0,
      responsesByService: { scout: 2, lumenloop: 6, stellarDocs: 6 },
      services: {
        scout: capacityService(2),
        lumenloop: capacityService(6),
        stellarDocs: capacityService(6)
      },
      captureLatency: { count: 2, minMs: 5, p50Ms: 5, p95Ms: 6, maxMs: 6, meanMs: 6 },
      vectorsMatch: true,
      captureWindowsOverlap: true
    },
    agents: [
      {
        agent: "agent-a",
        status: "success",
        captureStartedMonotonicMs: 1,
        captureCompletedMonotonicMs: 10,
        vectorSha256: "f".repeat(64)
      },
      {
        agent: "agent-b",
        status: "success",
        captureStartedMonotonicMs: 2,
        captureCompletedMonotonicMs: 11,
        vectorSha256: "f".repeat(64)
      }
    ],
    accepted: true,
    rejectionReasons: []
  };
}

/** A complete seven-call P6 summary that matches the frozen wrapper pins. */
export function passingP6Summary({ wrapperSha256, runnerRevision, claudePath, claudeBinarySha256, claudeEnvironmentSha256 }) {
  const pins = { runnerRevision, claudePath, claudeBinarySha256, claudeEnvironmentSha256 };
  const callRecords = Array.from({ length: 7 }, (_, index) => ({
    schema: P6_SELF_TEST_CALL_SCHEMA,
    index,
    callNumber: index + 1,
    maxBudgetUsd: 0.5,
    costWithinCap: true,
    costReported: true,
    costUsd: 0.1,
    ok: true,
    gradeMatches: true,
    runnerDirty: false,
    ...pins
  }));
  return {
    schema: P6_SELF_TEST_SUMMARY_SCHEMA,
    implementationSha256: wrapperSha256,
    calls: 7,
    perCallBudgetUsd: 0.5,
    maxAuthorizedCostUsd: 3.5,
    ...pins,
    reportedCosts: callRecords.map((record) => record.costUsd),
    missingCosts: [],
    totalCostUsd: 0.7,
    callRecords
  };
}
