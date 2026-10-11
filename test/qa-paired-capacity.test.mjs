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

// Serves the public sources that the committed probe reads.
function upstreamResponse(url, init) {
  if (url.endsWith("/api/openapi.json")) return { info: { version: "1.9.30" }, paths: {} };
  if (url.endsWith("/v1/openapi.json")) return { info: { version: "1.0.0" }, paths: {} };
  if (url.endsWith("/v1/tools")) {
    return {
      success: true,
      data: { count: 1, hint: "public", scope: "guest", tools: [{ name: "a" }], workflows: [] }
    };
  }
  if (url.endsWith("/v1/skills")) {
    return {
      success: true,
      data: { count: 1, archives: {}, note: "public skills", versions: {}, skills: [{ name: "skill-a" }] }
    };
  }
  if (url.endsWith("/settings")) return { searchableAttributes: ["title"] };
  const hits = Array.from({ length: 150 }, (_, index) => ({
    hierarchy: { lvl1: `Title ${index}` },
    url_without_anchor: `https://developers.stellar.org/docs/page-${index}`
  }));
  return {
    results: JSON.parse(init.body).requests.map((request) => {
      const page = Number(new URLSearchParams(request.params).get("page"));
      return { page, nbPages: 2, nbHits: hits.length, hits: hits.slice(page * 100, page * 100 + 100) };
    })
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

  it("releases two committed probe captures together and records matching vectors", async () => {
    vi.stubGlobal("fetch", vi.fn(async (url, init = {}) => Response.json(upstreamResponse(url, init))));

    const report = await runPairedCapacityCheck();

    expect(report.schema).toBe(PAIRED_CAPACITY_SCHEMA);
    expect(report.contract).toEqual(PAIRED_CAPACITY_CONTRACT);
    expect(report.accepted).toBe(true);
    expect(report.rejectionReasons).toEqual([]);
    expect(report.method.paidModelCalls).toBe(0);
    expect(report.observed.requests).toBe(12);
    expect(report.observed.responses).toBe(12);
    expect(report.observed.responsesByService).toEqual({ scout: 2, lumenloop: 6, stellarDocs: 4 });
    expect(report.observed.transportErrors).toBe(0);
    expect(report.observed.maximumActiveFetches).toBeGreaterThan(1);
    expect(report.observed.vectorsMatch).toBe(true);
    expect(report.agents.map((agent) => agent.status)).toEqual(["success", "success"]);
  });

  it.each([
    ["request count", (report) => { report.observed.requests = 11; }, /requests must equal 12/],
    ["response count", (report) => { report.observed.responses = 11; }, /responses must equal 12/],
    ["successful response count", (report) => { report.observed.successfulResponses = 11; }, /successfulResponses must equal 12/],
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
        ...Array.from({ length: 2 }, () => fetchImpl("https://VNSJF5AWIZ-dsn.algolia.net/1/indexes/x"))
      ]);
      return vector();
    };
    const report = await runPairedCapacityCheck({ probe });
    mutate(report);
    expect(capacityRejectionReasons(report)).toEqual(expect.arrayContaining([expect.stringMatching(expected)]));
  });
});
