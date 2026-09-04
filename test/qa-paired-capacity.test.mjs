import { afterEach, describe, expect, it, vi } from "vitest";
import { REMOTE_IDENTITY_VECTOR_SCHEMA } from "../eval/qa/remote-identity-guard.mjs";
import {
  PAIRED_CAPACITY_CONTRACT,
  PAIRED_CAPACITY_SCHEMA,
  capacityRejectionReasons,
  classifyService,
  runPairedCapacityCheck,
  summarizeLatency,
  summarizeTelemetry
} from "../eval/qa/check-paired-capacity.mjs";

function vector() {
  return {
    schema: REMOTE_IDENTITY_VECTOR_SCHEMA,
    services: {
      scout: {
        openapiVersion: "1.9.30",
        canonicalOpenapiSha256: "1".repeat(64)
      },
      lumenloop: {
        advertisedContractIdentity: "openapi-1.0.0",
        canonicalInventorySha256: "2".repeat(64)
      },
      stellarDocs: {
        indexSettingsSha256: "3".repeat(64),
        canonicalTitleSetSha256: "4".repeat(64)
      }
    }
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("paired capacity check", () => {
  it("classifies only the three public service hosts", () => {
    expect(classifyService("https://stellarlight.xyz/api/openapi.json")).toBe("scout");
    expect(classifyService("https://api.lumenloop.com/v1/tools")).toBe("lumenloop");
    expect(classifyService("https://VNSJF5AWIZ-dsn.algolia.net/1/indexes/x")).toBe("stellarDocs");
    expect(() => classifyService("https://example.com/data")).toThrow(
      "unrecognized public capacity-check host"
    );
  });

  it("summarizes response latency and service failures", () => {
    expect(summarizeLatency([5, 10, 15, 20])).toEqual({
      count: 4,
      minMs: 5,
      p50Ms: 10,
      p95Ms: 20,
      maxMs: 20,
      meanMs: 13
    });
    expect(summarizeLatency([])).toBeNull();

    const summary = summarizeTelemetry([
      {
        service: "scout",
        kind: "response",
        status: 200,
        retryAfterPresent: false,
        latencyMs: 7
      },
      {
        service: "lumenloop",
        kind: "response",
        status: 429,
        retryAfterPresent: true,
        latencyMs: 9
      },
      { service: "stellarDocs", kind: "transport-error", latencyMs: 11 }
    ], [{ service: "lumenloop" }]);

    expect(summary.scout.successfulResponses).toBe(1);
    expect(summary.lumenloop.httpErrors).toBe(1);
    expect(summary.lumenloop.retryEvents).toBe(1);
    expect(summary.lumenloop.retryAfterObserved).toBe(1);
    expect(summary.stellarDocs.transportErrors).toBe(1);
  });

  it("releases two captures together and records matching vectors", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 200 })));
    const probe = async ({ fetchImpl }) => {
      await Promise.all([
        fetchImpl("https://stellarlight.xyz/api/openapi.json"),
        fetchImpl("https://api.lumenloop.com/v1/openapi.json"),
        fetchImpl("https://api.lumenloop.com/v1/tools"),
        fetchImpl("https://api.lumenloop.com/v1/skills"),
        fetchImpl("https://VNSJF5AWIZ-dsn.algolia.net/1/indexes/x/settings"),
        fetchImpl("https://VNSJF5AWIZ-dsn.algolia.net/1/indexes/x/queries"),
        fetchImpl("https://VNSJF5AWIZ-dsn.algolia.net/1/indexes/x/queries")
      ]);
      return vector();
    };

    const report = await runPairedCapacityCheck({ probe });

    expect(report.schema).toBe(PAIRED_CAPACITY_SCHEMA);
    expect(report.contract).toEqual(PAIRED_CAPACITY_CONTRACT);
    expect(report.accepted).toBe(true);
    expect(report.rejectionReasons).toEqual([]);
    expect(report.method.paidModelCalls).toBe(0);
    expect(report.observed.requests).toBe(14);
    expect(report.observed.responses).toBe(14);
    expect(report.observed.responsesByService).toEqual({ scout: 2, lumenloop: 6, stellarDocs: 6 });
    expect(report.observed.transportErrors).toBe(0);
    expect(report.observed.maximumActiveFetches).toBeGreaterThan(1);
    expect(report.observed.vectorsMatch).toBe(true);
    expect(report.agents.map((agent) => agent.status)).toEqual(["success", "success"]);
  });

  it.each([
    ["request count", (report) => { report.observed.requests = 13; }, /requests must equal 14/],
    ["response count", (report) => { report.observed.responses = 13; }, /responses must equal 14/],
    ["successful response count", (report) => { report.observed.successfulResponses = 13; }, /successfulResponses must equal 14/],
    ["service response count", (report) => { report.observed.responsesByService.scout = 1; }, /service response counts mismatch/],
    ["agent result count", (report) => { report.agents.pop(); }, /agent result count mismatch/],
    ["HTTP errors", (report) => { report.observed.httpErrors = 1; }, /httpErrors must equal 0/],
    ["transport errors", (report) => { report.observed.transportErrors = 1; }, /transportErrors must equal 0/],
    ["retries", (report) => { report.observed.retries = 1; }, /retries must equal 0/],
    ["Retry-After", (report) => { report.observed.retryAfterObserved = 1; }, /retryAfterObserved must equal 0/],
    ["vector mismatch", (report) => { report.observed.vectorsMatch = false; }, /capture vectors differ/],
    ["no request concurrency", (report) => { report.observed.maximumActiveFetches = 1; }, /real request concurrency/],
    ["no capture overlap", (report) => { report.observed.captureWindowsOverlap = false; }, /capture windows did not overlap/],
    ["slow duration", (report) => { report.durationMs = 120_001; }, /duration exceeds/],
    ["slow capture", (report) => { report.observed.captureLatency.maxMs = 120_001; }, /capture latency exceeds/]
  ])("rejects a capacity report with %s", async (_label, mutate, expected) => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 200 })));
    const probe = async ({ fetchImpl }) => {
      await Promise.all([
        fetchImpl("https://stellarlight.xyz/api/openapi.json"),
        ...Array.from({ length: 3 }, () => fetchImpl("https://api.lumenloop.com/v1/tools")),
        ...Array.from({ length: 3 }, () => fetchImpl("https://VNSJF5AWIZ-dsn.algolia.net/1/indexes/x"))
      ]);
      return vector();
    };
    const report = await runPairedCapacityCheck({ probe });
    mutate(report);
    expect(capacityRejectionReasons(report)).toEqual(expect.arrayContaining([expect.stringMatching(expected)]));
  });
});
