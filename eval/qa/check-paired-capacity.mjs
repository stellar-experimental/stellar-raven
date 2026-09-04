#!/usr/bin/env node
import { writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { probeRemoteIdentities } from "./probe-remote-identities.mjs";
import { remoteIdentityVectorSha256 } from "./remote-identity-guard.mjs";

const SERVICES = ["scout", "lumenloop", "stellarDocs"];

export function classifyService(url) {
  const hostname = new URL(url).hostname;
  if (hostname === "stellarlight.xyz") return "scout";
  if (hostname === "api.lumenloop.com") return "lumenloop";
  if (hostname.endsWith("-dsn.algolia.net")) return "stellarDocs";
  throw new Error(`unrecognized public capacity-check host: ${hostname}`);
}

function percentile(sorted, quantile) {
  if (sorted.length === 0) return null;
  return sorted[Math.ceil(sorted.length * quantile) - 1];
}

export function summarizeLatency(values) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((left, right) => left - right);
  return {
    count: sorted.length,
    minMs: sorted[0],
    p50Ms: percentile(sorted, 0.5),
    p95Ms: percentile(sorted, 0.95),
    maxMs: sorted.at(-1),
    meanMs: Math.round(sorted.reduce((sum, value) => sum + value, 0) / sorted.length)
  };
}

export function summarizeTelemetry(records, retries) {
  const services = Object.fromEntries(SERVICES.map((service) => [service, {
    requests: 0,
    responses: 0,
    successfulResponses: 0,
    httpErrors: 0,
    transportErrors: 0,
    retryEvents: 0,
    retryAfterObserved: 0,
    latency: null
  }]));
  for (const record of records) {
    const summary = services[record.service];
    summary.requests += 1;
    if (record.kind === "response") {
      summary.responses += 1;
      if (record.status >= 200 && record.status < 300) summary.successfulResponses += 1;
      else summary.httpErrors += 1;
      if (record.retryAfterPresent) summary.retryAfterObserved += 1;
    } else {
      summary.transportErrors += 1;
    }
  }
  for (const retry of retries) {
    services[retry.service].retryEvents += 1;
  }
  for (const service of SERVICES) {
    services[service].latency = summarizeLatency(
      records
        .filter((record) => record.service === service && record.kind === "response")
        .map((record) => record.latencyMs)
    );
  }
  return services;
}

function createInstrumentedFetch(agent, records, state) {
  return async (url, init) => {
    const service = classifyService(url);
    const startedAt = new Date().toISOString();
    const started = performance.now();
    state.active += 1;
    state.maximumActive = Math.max(state.maximumActive, state.active);
    try {
      const response = await fetch(url, init);
      records.push({
        agent,
        service,
        kind: "response",
        status: response.status,
        retryAfterPresent: response.headers.has("retry-after"),
        startedAt,
        completedAt: new Date().toISOString(),
        latencyMs: Math.round(performance.now() - started)
      });
      return response;
    } catch (error) {
      records.push({
        agent,
        service,
        kind: "transport-error",
        errorName: error?.name ?? "Error",
        startedAt,
        completedAt: new Date().toISOString(),
        latencyMs: Math.round(performance.now() - started)
      });
      throw error;
    } finally {
      state.active -= 1;
    }
  };
}

export async function runPairedCapacityCheck({ probe = probeRemoteIdentities } = {}) {
  const records = [];
  const retries = [];
  const state = { active: 0, maximumActive: 0 };
  let release;
  const barrier = new Promise((resolve) => { release = resolve; });
  const startedAt = new Date().toISOString();
  const started = performance.now();
  const agents = ["agent-a", "agent-b"].map(async (agent) => {
    await barrier;
    const captureStarted = performance.now();
    const vector = await probe({
      fetchImpl: createInstrumentedFetch(agent, records, state),
      onRetry: ({ label, ...retry }) => retries.push({
        agent,
        service: label.startsWith("Scout") ? "scout" : label.startsWith("Lumenloop") ? "lumenloop" : "stellarDocs",
        ...retry
      })
    });
    return {
      agent,
      status: "success",
      captureLatencyMs: Math.round(performance.now() - captureStarted),
      vectorSha256: remoteIdentityVectorSha256(vector)
    };
  });
  release();
  const settled = await Promise.allSettled(agents);
  const agentResults = settled.map((result, index) => result.status === "fulfilled"
    ? result.value
    : { agent: index === 0 ? "agent-a" : "agent-b", status: "error", error: String(result.reason?.message ?? result.reason) });
  const successfulVectors = agentResults
    .filter((result) => result.status === "success")
    .map((result) => result.vectorSha256);
  return {
    schema: "qa-paired-capacity-check-v1",
    startedAt,
    completedAt: new Date().toISOString(),
    durationMs: Math.round(performance.now() - started),
    method: {
      agentsReleasedTogether: 2,
      capturesPerAgent: 1,
      publicRequestPattern: "one committed remote-identity capture per agent",
      expectedRequestsPerSuccessfulAgent: 7,
      paidModelCalls: 0,
      localServerUsed: false
    },
    observed: {
      maximumActiveFetches: state.maximumActive,
      requests: records.length,
      responses: records.filter((record) => record.kind === "response").length,
      transportErrors: records.filter((record) => record.kind === "transport-error").length,
      retries: retries.length,
      services: summarizeTelemetry(records, retries),
      captureLatency: summarizeLatency(agentResults
        .filter((result) => result.status === "success")
        .map((result) => result.captureLatencyMs)),
      vectorsMatch: successfulVectors.length === 2 && successfulVectors[0] === successfulVectors[1]
    },
    agents: agentResults
  };
}

function assert(condition, message) {
  if (!condition) throw new Error(`self-test failed: ${message}`);
}

export function selfTest() {
  assert(classifyService("https://stellarlight.xyz/api/openapi.json") === "scout", "Scout classification");
  assert(classifyService("https://api.lumenloop.com/v1/tools") === "lumenloop", "Lumenloop classification");
  assert(classifyService("https://VNSJF5AWIZ-dsn.algolia.net/1/indexes/x") === "stellarDocs", "Docs classification");
  assert(JSON.stringify(summarizeLatency([5, 10, 15, 20])) === JSON.stringify({
    count: 4, minMs: 5, p50Ms: 10, p95Ms: 20, maxMs: 20, meanMs: 13
  }), "latency summary");
  const summary = summarizeTelemetry([
    { service: "scout", kind: "response", status: 200, retryAfterPresent: false, latencyMs: 7 },
    { service: "lumenloop", kind: "response", status: 429, retryAfterPresent: true, latencyMs: 9 },
    { service: "stellarDocs", kind: "transport-error", latencyMs: 11 }
  ], [{ service: "lumenloop" }]);
  assert(summary.scout.successfulResponses === 1, "success count");
  assert(summary.lumenloop.httpErrors === 1 && summary.lumenloop.retryEvents === 1, "HTTP retry count");
  assert(summary.stellarDocs.transportErrors === 1, "transport count");
  return "check-paired-capacity self-test: PASS";
}

function parseArgs(args) {
  if (args.length === 1 && args[0] === "--self-test") return { selfTest: true };
  if (args.length === 0) return {};
  if (args.length === 2 && args[0] === "--out") return { out: args[1] };
  throw new Error("usage: check-paired-capacity.mjs [--out <path>|--self-test]");
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.selfTest) {
    console.log(selfTest());
    return;
  }
  const report = await runPairedCapacityCheck();
  const output = `${JSON.stringify(report, null, 2)}\n`;
  if (options.out) await writeFile(options.out, output, "utf8");
  process.stdout.write(output);
  if (report.agents.some((agent) => agent.status !== "success")) process.exitCode = 1;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch((error) => {
    console.error(`paired-capacity-check: ${String(error.message ?? error)}`);
    process.exitCode = 1;
  });
}
