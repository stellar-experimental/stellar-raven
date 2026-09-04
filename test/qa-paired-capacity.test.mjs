import { afterEach, describe, expect, it, vi } from "vitest";
import { REMOTE_IDENTITY_VECTOR_SCHEMA } from "../eval/qa/remote-identity-guard.mjs";
import {
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
        fetchImpl("https://api.lumenloop.com/v1/tools"),
        fetchImpl("https://VNSJF5AWIZ-dsn.algolia.net/1/indexes/x")
      ]);
      return vector();
    };

    const report = await runPairedCapacityCheck({ probe });

    expect(report.schema).toBe("qa-paired-capacity-check-v1");
    expect(report.method.paidModelCalls).toBe(0);
    expect(report.observed.requests).toBe(6);
    expect(report.observed.responses).toBe(6);
    expect(report.observed.transportErrors).toBe(0);
    expect(report.observed.maximumActiveFetches).toBeGreaterThan(1);
    expect(report.observed.vectorsMatch).toBe(true);
    expect(report.agents.map((agent) => agent.status)).toEqual(["success", "success"]);
  });
});
