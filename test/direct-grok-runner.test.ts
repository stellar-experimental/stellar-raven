import { EventEmitter } from "node:events";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Response as MiniflareResponse } from "miniflare";
// @ts-expect-error The standalone diagnostic uses Node JavaScript modules.
import { runMethod } from "../eval/qa/non-anthropic/method.mjs";
// @ts-expect-error The standalone diagnostic uses Node JavaScript modules.
import { parseCompletion, judgeInput } from "../eval/qa/non-anthropic/core.mjs";
// @ts-expect-error The standalone diagnostic uses Node JavaScript modules.
import { providerCall, resolveReportedCost } from "../eval/qa/non-anthropic/provider.mjs";
// @ts-expect-error The standalone diagnostic uses Node JavaScript modules.
import { normalizeProxyResponse } from "../eval/qa/non-anthropic/proxy-response.mjs";
// @ts-expect-error The standalone diagnostic uses Node JavaScript modules.
import { ANSWER_POLICY, FINAL_ANSWER_REMINDER, PLAN_SCHEMA, RUN_SCHEMA, environmentIdentity, filePins, checkFilePins, parseRunnerArgs, selftestInputs, validateRunnerPlan, loadSelection, jsonSha } from "../eval/qa/non-anthropic/runner-support.mjs";
// @ts-expect-error The standalone diagnostic uses Node JavaScript modules.
import { BindingClient } from "../eval/qa/non-anthropic/binding-client.mjs";

const tools = ["search", "execute"].map((name) => ({ name, description: name,
  inputSchema: { type: "object", properties: name === "execute" ? { code: { type: "string" } } : { query: { type: "string" } } } }));
const cases = ["a", "b"].map((id) => ({ id, question: `Question ${id}?`, tags: { freshness: "stable" },
  golden: { answer: `Golden ${id}`, keyFacts: [`Fact ${id}`], avoid: [] } }));
const plan = { method: "baseline", answerPolicy: ANSWER_POLICY, gatewayId: "stellar-raven-demo", deadline: "2026-11-03T10:00:00Z",
  maxBudgetUsd: 1, maxProviderCalls: 34, maxAnswerSteps: 16, maxOutputTokens: 8192 };
const correct = JSON.stringify({ rationale: "The answer agrees.", coreAnswer: "correct", missingFacts: [], wrongClaims: [], avoidMatches: [], score: "correct" });

function completed(content: string, calls?: unknown[]) {
  return parseCompletion({ model: "grok-4.7", choices: [{
    message: { role: "assistant", content, ...(calls ? { tool_calls: calls } : {}) }, finish_reason: calls ? "tool_calls" : "stop"
  }], usage: { prompt_tokens: 10, completion_tokens: 2 } });
}

type Request = { requestId: string; options: { judge: boolean; toolChoice?: string; tools?: unknown; messages: { role: string; content: string }[] }; onEvidence: (value: unknown) => void };
type ProviderReply = { requestId: string; rawCalls: number; result: { parsed: unknown; costUsd: number | null; error: string | null; logId: string | null;
  receipt: { calls: number; reportedCalls: number; costUsd: number | null; reportedCostUsd?: number; error: string | null } } };
type Snapshot = { rows: unknown[]; providerAttempts: { costUsd: number | null; result: unknown; requestMessages: unknown[]; reportedCosts: unknown[];
  unacceptedEvidence?: { answer: string; usage?: { cost_in_usd_ticks?: number } | null } | null }[];
  summary: unknown; unattemptedIds: string[]; aggregatesSuppressed: boolean; totalReportedCostUsd: number;
  rawProviderCalls: number; budget: { missingCosts: number }; selftestPassed?: boolean; selectedIds: string[] };

function fixture(sequence: ReturnType<typeof completed>[], overrides: Record<string, unknown> = {}) {
  const snapshots: Snapshot[] = [];
  const requests: Request[] = [];
  const provider = vi.fn(async (request: Request): Promise<ProviderReply> => {
    requests.push(structuredClone({ ...request, onEvidence: undefined }) as unknown as Request);
    const logId = `log-${request.requestId}`;
    request.onEvidence({ type: "raw-started" });
    request.onEvidence({ type: "response-boundary", brand: "node-response" });
    request.onEvidence({ type: "response", status: 200, logId });
    request.onEvidence({ type: "reported-cost", logId, costUsd: 0.02 });
    const result = { parsed: sequence.shift(), error: null, logId, status: 200, model: "grok-4.7", stream: false,
      receipt: { calls: 1, reportedCalls: 1, costUsd: 0.02, reportedCostUsd: 0.02, error: null } };
    return { requestId: request.requestId, rawCalls: 1, result: { ...result, ...resolveReportedCost(result) } };
  });
  const callTool = vi.fn(async () => ({ content: [{ type: "text", text: '{"ok":true,"data":{"fact":"A"}}' }] }));
  const remote = { beforeCall: vi.fn(), afterCall: vi.fn() };
  const args = { plan, cases, tools, instructions: "Canonical server instructions only.", provider,
    guard: vi.fn(async () => {}), callTool, remote, finalize: vi.fn(async () => {}),
    write: (value: Snapshot) => snapshots.push(structuredClone(value)), ...overrides };
  return { args, provider, requests, snapshots, callTool, remote };
}

/** Exercise the unchanged provider's HTTP and receipt handling without inference. */
async function httpFailure(request: Request, status = 504, costUsd: number | null = 0, logId = `log-${request.requestId}`, body: string | null = null) {
  const run = vi.fn(async () => {
    request.onEvidence({ type: "raw-started" });
    const response = new Response(body, { status, headers: { "cf-aig-log-id": logId } });
    request.onEvidence({ type: "response-boundary", brand: "node-response" });
    request.onEvidence({ type: "response", status: response.status, logId });
    return response;
  });
  const ai = { run, gateway: () => ({ getLog: async () => {
    if (costUsd !== null) request.onEvidence({ type: "reported-cost", logId, costUsd });
    return { cost: costUsd ?? undefined };
  } }) };
  const result = await providerCall(ai, { gatewayId: plan.gatewayId, maxBudgetUsd: 1, maxOutputTokens: 8192, ...request.options });
  return { requestId: request.requestId, rawCalls: run.mock.calls.length, result };
}

type WorkerMessage = { type: string; requestId?: string; [key: string]: unknown };

/** Run the real worker handler and provider with mocked platform and IPC boundaries. */
async function workerFixture(getLog: (logId: string) => Promise<{ cost?: number }>, body?: string | ((call: number) => string)) {
  vi.resetModules();
  const messages: WorkerMessage[] = [];
  const queued: WorkerMessage[] = [];
  let handle: ((message: WorkerMessage) => Promise<void>) | undefined;
  class Child extends EventEmitter {
    exitCode: number | null = null;
    signalCode: string | null = null;
    send(message: WorkerMessage, callback: (error?: Error) => void) { queued.push(message); callback(); }
    kill = vi.fn((signal: string) => { this.signalCode = signal; this.emit("exit"); });
  }
  const child = new Child();
  const actualProcess = process;
  const workerProcess = Object.assign(Object.create(actualProcess), {
    connected: true,
    send(message: WorkerMessage) { messages.push(message); child.emit("message", message); },
    on(event: string, listener: (message: WorkerMessage) => Promise<void>) { if (event === "message") handle = listener; },
    once: vi.fn()
  });
  vi.stubGlobal("process", workerProcess);
  vi.doMock("node:module", () => ({
    createRequire: () => () => ({ default: actualProcess.execPath }),
    registerHooks: () => ({ deregister: vi.fn() })
  }));
  vi.doMock("node:fs", async (original) => ({ ...await original<typeof import("node:fs")>(),
    mkdtempSync: () => "/unused-mocked-worker", writeFileSync: vi.fn(), rmSync: vi.fn()
  }));
  vi.doMock("../eval/qa/non-anthropic/runner-support.mjs", async (original) => ({
    ...await original<Record<string, unknown>>(), environmentIdentity: () => ({}), filePins: () => []
  }));
  const run = vi.fn(async () => new Response((typeof body === "function" ? body(run.mock.calls.length) : body) ?? JSON.stringify({ model: "grok-4.7",
    choices: [{ message: { role: "assistant", content: "READY" }, finish_reason: "stop" }] }),
  { headers: { "cf-aig-log-id": `worker-log-${run.mock.calls.length}` } }));
  vi.doMock("wrangler", () => ({ getPlatformProxy: async () => ({
    env: { AI: { run, gateway: () => ({ getLog }) } }, dispose: vi.fn()
  }) }));
  // @ts-expect-error The standalone worker uses Node JavaScript modules.
  await import("../eval/qa/non-anthropic/binding-worker.mjs");
  const client = new BindingClient({ spawn: () => child });
  async function dispatch() {
    const message = queued.shift();
    if (!message || !handle) throw new Error("missing-mocked-worker-request");
    await handle(message);
  }
  const ready = client.initialize("mock-account");
  await dispatch();
  const identity = await ready;
  const call = (requestId: string, onEvidence: (value: unknown) => void = () => {}, options = {}) => client.call({
    plan: { ...plan, requestTimeoutMs: 10_000, hostBackstopMs: 20_000, settlementGraceMs: 10_000 },
    expectedIdentity: identity, requestId, onEvidence,
    options: { gatewayId: plan.gatewayId, maxBudgetUsd: 1, messages: [], maxOutputTokens: 256, judge: true, ...options }
  });
  return { client, child, messages, run, call, dispatch };
}

describe("direct Grok host-loop runner", () => {
  beforeEach(() => { vi.useFakeTimers({ now: new Date("2026-11-02T23:00:00Z") }); });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    for (const module of ["node:module", "node:fs", "wrangler", "../eval/qa/non-anthropic/runner-support.mjs"]) vi.doUnmock(module);
  });

  it("accepts native-only cost after guards while preserving incomplete Gateway observations", async () => {
    vi.useFakeTimers({ now: new Date("2026-11-02T23:00:00Z") });
    const f = await workerFixture(async (id) => id === "worker-log-1" ? new Promise(() => {}) : { cost: 0.02 },
      (call) => JSON.stringify({ model: "grok-4.7", choices: [{ message: { role: "assistant", content: call === 1 ? "A" : correct }, finish_reason: "stop" }],
        usage: call === 1 ? { cost_in_usd_ticks: 474160000 } : {} }));
    const method = fixture([], { cases: [cases[0]], provider: async (request: Request) => {
      const pending = f.call(request.requestId, request.onEvidence, request.options);
      await f.dispatch(); return pending;
    } });
    const pending = runMethod(method.args);
    await vi.advanceTimersByTimeAsync(1);
    expect(method.snapshots.some((snapshot) => snapshot.providerAttempts[0]?.unacceptedEvidence?.answer === "A" &&
      snapshot.providerAttempts[0]?.unacceptedEvidence?.usage?.cost_in_usd_ticks === 474160000 && !snapshot.providerAttempts[0]?.result)).toBe(true);
    await vi.advanceTimersByTimeAsync(6001);
    const result = await pending;
    expect(result).toMatchObject({ schema: RUN_SCHEMA, status: "complete",
      totalCompleteCostUsd: 0.067416, completeCostAccounting: true, completeGatewayCostAccounting: false,
      gatewayReportedCalls: 1, gatewayReportedCostUsd: 0.02, budget: { missingCosts: 0 } });
    expect(result.providerAttempts[0]).toMatchObject({ costUsd: 0.047416, costSource: "native-reported", completionAccepted: true,
      result: { receipt: { costUsd: null, reportedCalls: 0, error: "missing-answer-cost" } } });
    expect(result.rows[0]).toMatchObject({ answer: "A", verdict: { score: "correct" } });
    expect(f.run).toHaveBeenCalledTimes(2);
    f.client.fail("test-finished");
  });

  it.each(["missing-cost", "guard-failure"])("preserves unaccepted final text through %s", async (failure) => {
    vi.useFakeTimers({ now: new Date("2026-11-02T23:00:00Z") });
    const f = await workerFixture(async () => new Promise(() => {}), JSON.stringify({ model: "grok-4.7",
      choices: [{ message: { role: "assistant", content: "UNACCEPTED ANSWER" }, finish_reason: "stop" }],
      usage: failure === "guard-failure" ? { cost_in_usd_ticks: 474160000 } : {} }));
    let guards = 0;
    const method = fixture([], { guard: async () => { if (++guards === 2 && failure === "guard-failure") throw new Error("source-identity-changed"); },
      provider: async (request: Request) => { const pending = f.call(request.requestId, request.onEvidence, request.options); await f.dispatch(); return pending; } });
    const pending = runMethod(method.args);
    await vi.advanceTimersByTimeAsync(6001);
    const result = await pending;
    expect(result.rows[0]).toMatchObject({ answer: "", verdict: null, failure: failure === "missing-cost" ? "provider-cost-missing" : "source-identity-changed" });
    expect(result.providerAttempts[0]).toMatchObject({ unacceptedEvidence: { answer: "UNACCEPTED ANSWER" }, completionAccepted: false,
      costUsd: null, costSource: null });
    expect(result).toMatchObject({ totalCompleteCostUsd: null, completeGatewayCostAccounting: false, unattemptedIds: ["b"] });
    expect(guards).toBe(2);
    expect(f.run).toHaveBeenCalledTimes(1);
    f.client.fail("test-finished");
  });

  it.each(["conflict", "partial", "budget", "remote-guard"])("retains native final evidence through %s rejection", async (problem) => {
    vi.useFakeTimers({ now: new Date("2026-11-02T23:00:00Z") });
    const body = JSON.stringify({ model: "grok-4.7", choices: [{ message: { role: "assistant", content: "UNACCEPTED" }, finish_reason: "stop" }],
      usage: { cost_in_usd_ticks: 474160000, ...(problem === "partial" ? { cost_is_partial: true } : {}) } });
    const f = fixture([], { plan: { ...plan, ...(problem === "budget" ? { maxBudgetUsd: 0.01 } : {}) } });
    if (problem === "remote-guard") f.remote.afterCall.mockImplementation(() => { throw new Error("remote-identity-changed"); });
    f.provider.mockImplementationOnce((request: Request) => httpFailure(request, 200, problem === "conflict" || problem === "partial" ? 0.001 : null, "native-failure", body));
    const pending = runMethod(f.args);
    await vi.advanceTimersByTimeAsync(1001);
    const result = await pending;
    const failures: Record<string, string> = { conflict: "provider-cost-conflict", partial: "provider-native-cost-invalid",
      budget: "provider-budget-exceeded", "remote-guard": "remote-identity-changed" };
    expect(result.rows[0]).toMatchObject({ answer: "", verdict: null, failure: failures[problem] });
    expect(result.providerAttempts[0]).toMatchObject({ unacceptedEvidence: { answer: "UNACCEPTED" }, completionAccepted: false });
    expect(result).toMatchObject({ aggregatesSuppressed: true, summary: null, unattemptedIds: ["b"] });
    if (problem === "conflict") expect(result).toMatchObject({ totalCompleteCostUsd: null,
      gatewayReportedCostUsd: 0.001, completeGatewayCostAccounting: true });
    if (problem === "partial") expect(result.totalReportedCostUsd).toBe(0.001);
    if (problem === "budget") expect(result.totalReportedCostUsd).toBe(0.047416);
    expect(f.provider).toHaveBeenCalledTimes(1);
  });

  it.each(["raw-start", "raw-count", "brand", "request-id", "missing-id", "mismatched-id", "status", "model", "stream"])(
    "rejects native accounting with invalid %s evidence", async (problem) => {
      vi.useFakeTimers({ now: new Date("2026-11-02T23:00:00Z") });
      const body = JSON.stringify({ model: "grok-4.7", choices: [{ message: { role: "assistant", content: "OBSERVED" }, finish_reason: "stop" }],
        usage: { cost_in_usd_ticks: 474160000 } });
      const f = fixture([]);
      f.provider.mockImplementationOnce(async (request: Request) => {
        const reply = await httpFailure({ ...request, onEvidence(event) {
          if (problem !== "raw-start" || (event as { type: string }).type !== "raw-started") request.onEvidence(event);
        } }, 200, null, "native-boundary", body);
        if (problem === "raw-count") reply.rawCalls = 2;
        if (problem === "brand") request.onEvidence({ type: "response-boundary", brand: "unrecognized" });
        if (problem === "request-id") reply.requestId = "other-request";
        if (problem === "missing-id") reply.result.logId = null;
        if (problem === "mismatched-id") reply.result.logId = "other-log";
        if (problem === "status") reply.result.status = 201;
        if (problem === "model") reply.result.model = "other-model";
        if (problem === "stream") reply.result.stream = true;
        return reply;
      });
      const pending = runMethod(f.args);
      await vi.advanceTimersByTimeAsync(1001);
      const result = await pending;
      expect(result.providerAttempts[0]).toMatchObject({ costUsd: null, costSource: null, completionAccepted: false,
        unacceptedEvidence: { answer: "OBSERVED" } });
      expect(result).toMatchObject({ totalCompleteCostUsd: null, nativeReportedCalls: 0, completeGatewayCostAccounting: false });
      expect(result.rows[0].answer).toBe("");
      expect(f.provider).toHaveBeenCalledTimes(1);
    }
  );

  it("rejects a reused native log without changing earlier grades or charging it twice", async () => {
    vi.useFakeTimers({ now: new Date("2026-11-02T23:00:00Z") });
    const f = fixture([completed("A"), completed(correct)]);
    const normal = f.provider.getMockImplementation()!;
    const body = JSON.stringify({ model: "grok-4.7", choices: [{ message: { role: "assistant", content: "REUSED" }, finish_reason: "stop" }],
      usage: { cost_in_usd_ticks: 474160000 } });
    f.provider.mockImplementationOnce(normal).mockImplementationOnce(normal)
      .mockImplementationOnce((request: Request) => httpFailure(request, 200, null, "log-1", body));
    const pending = runMethod(f.args);
    await vi.advanceTimersByTimeAsync(1001);
    const result = await pending;
    expect(result.rows[0].verdict.score).toBe("correct");
    expect(result.rows[1]).toMatchObject({ answer: "", verdict: null, failure: "missing-or-reused-provider-log-id" });
    expect(result).toMatchObject({ totalReportedCostUsd: 0.04, totalCompleteCostUsd: null, nativeReportedCalls: 0 });
    expect(f.provider).toHaveBeenCalledTimes(3);
  });

  it("accepts an explicit native zero without inventing a Gateway zero", async () => {
    vi.useFakeTimers({ now: new Date("2026-11-02T23:00:00Z") });
    const f = fixture([], { cases: [{ id: "provider-ready", question: "Reply with exactly READY." }], tools: [],
      plan: { ...plan, method: "transport-canary", maxProviderCalls: 1 } });
    const body = JSON.stringify({ model: "grok-4.7", choices: [{ message: { role: "assistant", content: "READY" }, finish_reason: "stop" }],
      usage: { cost_in_usd_ticks: 0 } });
    f.provider.mockImplementationOnce((request: Request) => httpFailure(request, 200, null, "native-zero", body));
    const pending = runMethod(f.args);
    await vi.advanceTimersByTimeAsync(1001);
    const result = await pending;
    expect(result).toMatchObject({ status: "complete", totalCompleteCostUsd: 0, nativeReportedCalls: 1,
      gatewayReportedCalls: 0, completeGatewayCostAccounting: false, budget: { missingCosts: 0 } });
    expect(result.providerAttempts[0].result.receipt.costUsd).toBeNull();
    expect(f.provider).toHaveBeenCalledTimes(1);
  });

  it("counts agreeing native and Gateway reports once and labels the ledger source", async () => {
    const f = fixture([], { cases: [{ id: "provider-ready", question: "Reply with exactly READY." }], tools: [],
      plan: { ...plan, method: "transport-canary", maxProviderCalls: 1 } });
    const body = JSON.stringify({ model: "grok-4.7", choices: [{ message: { role: "assistant", content: "READY" }, finish_reason: "stop" }],
      usage: { cost_in_usd_ticks: 474160000 } });
    f.provider.mockImplementationOnce((request: Request) => httpFailure(request, 200, 0.047416, "agreeing", body));
    const result = await runMethod(f.args);
    expect(result).toMatchObject({ status: "complete", totalReportedCostUsd: 0.047416, gatewayReportedCostUsd: 0.047416,
      nativeReportedCalls: 1, gatewayReportedCalls: 1, completeCostAccounting: true, completeGatewayCostAccounting: true });
    expect(result.budget.calls).toMatchObject([{ costUsd: 0.047416, costSource: "native-reported" }]);
    expect(f.provider).toHaveBeenCalledTimes(1);
  });

  it("rejects a conflicting Gateway observation from a timed-out read before request closure", async () => {
    vi.useFakeTimers({ now: new Date("2026-11-02T23:00:00Z") });
    let resolveLate!: (log: { cost: number }) => void;
    const late = new Promise<{ cost: number }>((resolve) => { resolveLate = resolve; });
    const getLog = vi.fn().mockImplementationOnce(() => late).mockResolvedValue({});
    const f = await workerFixture(getLog, JSON.stringify({ model: "grok-4.7",
      choices: [{ message: { role: "assistant", content: "OBSERVED" }, finish_reason: "stop" }], usage: { cost_in_usd_ticks: 474160000 } }));
    const method = fixture([], { provider: async (request: Request) => {
      const pending = f.call(request.requestId, request.onEvidence, request.options); await f.dispatch(); return pending;
    } });
    const pending = runMethod(method.args);
    await vi.advanceTimersByTimeAsync(1050);
    resolveLate({ cost: 0.04 });
    await vi.advanceTimersByTimeAsync(1000);
    const result = await pending;
    expect(result.rows[0]).toMatchObject({ answer: "", failure: "provider-cost-conflict" });
    expect(result.providerAttempts[0]).toMatchObject({ costUsd: null, costSource: null,
      reportedCosts: [{ logId: "worker-log-1", costUsd: 0.04 }], unacceptedEvidence: { answer: "OBSERVED" } });
    expect(result.totalCompleteCostUsd).toBeNull();
    expect(f.run).toHaveBeenCalledTimes(1);
    f.client.fail("test-finished");
  });

  it("closes cost evidence before a result and an intervening identity request", async () => {
    vi.useFakeTimers({ now: new Date("2026-11-02T23:00:00Z") });
    let resolveLate!: (log: { cost: number }) => void;
    const late = new Promise<{ cost: number }>((resolve) => { resolveLate = resolve; });
    const getLog = vi.fn().mockImplementationOnce(() => late).mockResolvedValue({ cost: 0.02 });
    const f = await workerFixture(getLog);
    const evidence = vi.fn();
    const first = f.call("one", evidence);
    const firstDispatch = f.dispatch();
    await vi.advanceTimersByTimeAsync(1101);
    await firstDispatch;
    expect(await first).toMatchObject({ requestId: "one", rawCalls: 1, result: { costUsd: 0.02, error: null } });
    expect(getLog).toHaveBeenCalledTimes(2);

    // The parent sends its next guard before the child receives that IPC message.
    const guard = f.client.identity().then(() => "identity-ok", (error: Error) => error.message);
    resolveLate({ cost: 0.02 });
    await vi.advanceTimersByTimeAsync(0);
    await f.dispatch();
    expect(await guard).toBe("identity-ok");
    const second = f.call("two");
    await f.dispatch();
    expect(await second).toMatchObject({ requestId: "two", result: { costUsd: 0.02, error: null } });
    const resultIndex = f.messages.findIndex((message) => message.type === "result");
    expect(f.messages.slice(resultIndex + 1).filter((message) => message.requestId === "one")).toEqual([]);
    expect(evidence.mock.calls.filter(([event]) => event.type === "reported-cost")).toHaveLength(1);
    expect(f.run).toHaveBeenCalledTimes(2);
    f.client.fail("test-finished");
  });

  it("retains a timed-out cost observation while its request remains open", async () => {
    vi.useFakeTimers({ now: new Date("2026-11-02T23:00:00Z") });
    let resolveLate!: (log: { cost: number }) => void;
    const late = new Promise<{ cost: number }>((resolve) => { resolveLate = resolve; });
    const getLog = vi.fn().mockImplementationOnce(() => late).mockResolvedValue({ cost: 0.03 });
    const f = await workerFixture(getLog);
    const evidence = vi.fn();
    const pending = f.call("open", evidence);
    const dispatch = f.dispatch();
    await vi.advanceTimersByTimeAsync(1050);
    resolveLate({ cost: 0.03 });
    await vi.advanceTimersByTimeAsync(0);
    expect(evidence.mock.calls.filter(([event]) => event.type === "reported-cost")).toEqual([
      [{ type: "reported-cost", requestId: "open", logId: "worker-log-1", costUsd: 0.03 }]
    ]);
    expect(f.messages.some((message) => message.type === "result")).toBe(false);
    await vi.advanceTimersByTimeAsync(51);
    await dispatch;
    // Two reads observe the same log. The unchanged receipt counts that inference once.
    expect(await pending).toMatchObject({ result: { costUsd: 0.03, receipt: { calls: 1, reportedCalls: 1 } } });
    expect(evidence.mock.calls.filter(([event]) => event.type === "reported-cost")).toHaveLength(2);
    expect(f.run).toHaveBeenCalledTimes(1);
    f.client.fail("test-finished");
  });

  it("keeps all timed-out costs unknown after closure and protects the next request", async () => {
    vi.useFakeTimers({ now: new Date("2026-11-02T23:00:00Z") });
    const resolveLate: ((log: { cost: number }) => void)[] = [];
    const getLog = vi.fn(() => new Promise<{ cost: number }>((resolve) => { resolveLate.push(resolve); }));
    const f = await workerFixture(getLog);
    const pending = f.call("unknown");
    const dispatch = f.dispatch();
    await vi.advanceTimersByTimeAsync(6001);
    await dispatch;
    const first = await pending;
    expect(first).toMatchObject({ rawCalls: 1, result: {
      costUsd: null, error: null, accountingError: "provider-cost-missing", receipt: {
        costUsd: null, reportedCostUsd: 0, calls: 1, reportedCalls: 0, error: "missing-answer-cost"
      }
    } });
    expect(getLog).toHaveBeenCalledTimes(5);
    const guard = f.client.identity().then(() => "identity-ok", (error: Error) => error.message);
    for (const resolve of resolveLate) resolve({ cost: 0.04 });
    await vi.advanceTimersByTimeAsync(0);
    await f.dispatch();
    expect(await guard).toBe("identity-ok");
    expect(f.messages.filter((message) => message.type === "reported-cost")).toEqual([]);
    expect(first.result.costUsd).toBeNull();
    expect(f.run).toHaveBeenCalledTimes(1);
    f.client.fail("test-finished");
  });

  it("persists the worker's reported cost when provider JSON parsing fails", async () => {
    vi.useFakeTimers({ now: new Date("2026-11-02T23:00:00Z") });
    const f = await workerFixture(async () => ({ cost: 0.007 }), "{private-malformed-provider-body");
    const method = fixture([], { provider: async (request: Request) => {
      const pending = f.call(request.requestId, request.onEvidence);
      await f.dispatch();
      return pending;
    } });
    const artifact = await runMethod(method.args);
    expect(artifact).toMatchObject({ status: "invalid-or-incomplete", totalReportedCostUsd: 0.007,
      totalCompleteCostUsd: 0.007, budget: { missingCosts: 0 } });
    expect(artifact.providerAttempts[0]).toMatchObject({ rawStarted: true, costUsd: 0.007,
      reportedCosts: [{ logId: "worker-log-1", costUsd: 0.007 }], failure: "invalid-provider-outcome",
      result: { parsed: null, error: "malformed-provider-json", receipt: { reportedCalls: 1, costUsd: 0.007 } } });
    expect(JSON.stringify(artifact)).not.toContain("private-malformed-provider-body");
    expect(f.run).toHaveBeenCalledTimes(1);
    f.client.fail("test-finished");
  });

  it.each(["raw-started", "response", "response-boundary", "reported-cost"])(
    "still rejects arbitrary mismatched %s evidence", async (type) => {
      vi.useFakeTimers({ now: new Date("2026-11-02T23:00:00Z") });
      const f = await workerFixture(async () => ({ cost: 0.02 }));
      const pending = f.call("current");
      const rejected = expect(pending).rejects.toThrow("worker-request-identity-mismatch");
      f.child.emit("message", { type, requestId: "unrelated", logId: "other-log", costUsd: 0.02 });
      await rejected;
      expect(f.child.kill).toHaveBeenCalledWith("SIGTERM");
      expect(f.run).not.toHaveBeenCalled();
    }
  );

  it("runs two cases with real host dispatch, tool-free judges, and immutable attempt inputs", async () => {
    const search = { id: "tool-a", type: "function", function: { name: "search", arguments: '{"query":"Stellar"}' } };
    const f = fixture([completed("", [search]), completed("A"), completed(correct), completed("B"), completed(correct)]);
    const result = await runMethod(f.args);
    expect(result).toMatchObject({ status: "complete", rawProviderCalls: 5, summary: { selected: 2, correct: 2 }, aggregatesSuppressed: false });
    expect(f.callTool).toHaveBeenCalledExactlyOnceWith("search", { query: "Stellar" });
    expect(f.remote.beforeCall).toHaveBeenCalledTimes(2);
    expect(f.remote.afterCall).toHaveBeenCalledTimes(2);
    expect(f.requests[0]?.options.messages).toEqual([
      { role: "system", content: "Canonical server instructions only." }, { role: "user", content: "Question a?" }
    ]);
    expect(JSON.stringify(f.requests[0]?.options)).not.toContain("Golden");
    expect(f.requests.filter((r) => r.options.judge).every((r) => r.options.tools === undefined)).toBe(true);
    expect(result.providerAttempts[0].requestMessages).toHaveLength(2);
    expect(result.rows[0].transcript[0]).toMatchObject({ tool: "search", result: '{"ok":true,"data":{"fact":"A"}}' });
    expect(f.snapshots.some((s) => s.providerAttempts[0]?.result !== null && s.totalReportedCostUsd === 0)).toBe(true);
  });

  it("isolates a judge 504 with reported zero cost and preserves the 100-case quality denominator", async () => {
    const selected = Array.from({ length: 100 }, (_, index) => ({ ...cases[index % 2], id: `case-${index}` }));
    const f = fixture([completed("Retained answer"), ...Array.from({ length: 99 }, () => [completed("B"), completed(correct)]).flat()], {
      cases: selected, plan: { ...plan, maxProviderCalls: 1700, maxBudgetUsd: 30 }, write: () => {}
    });
    f.provider.mockImplementationOnce(f.provider.getMockImplementation()!).mockImplementationOnce((request: Request) => httpFailure(request));
    const result = await runMethod(f.args);
    expect(result.rows).toHaveLength(100);
    expect(result.rows[0]).toMatchObject({ answer: "Retained answer", verdict: null,
      failure: "provider-http-failure", failureRole: "judge", failureStatus: 504, providerAttemptNumbers: [1, 2] });
    expect(result.rows[1]).toMatchObject({ answer: "B", failure: null, verdict: { score: "correct" } });
    expect(result.providerAttempts[1]).toMatchObject({ role: "judge", costUsd: 0, result: { status: 504,
      error: "provider-response-invalid", receipt: { calls: 1, reportedCalls: 1, costUsd: 0, reportedCostUsd: 0 } } });
    expect(result).toMatchObject({ schema: RUN_SCHEMA, status: "invalid-or-incomplete",
      attemptedAllSelectedCases: true, gradedAllSelectedCases: false, aggregatesSuppressed: true, summary: null,
      failedIds: ["case-0"], incompleteIds: ["case-0"], unattemptedIds: [], totalReportedCostUsd: 3.98,
      totalCompleteCostUsd: 3.98, completeCostAccounting: true, completeness: { expectedCases: 100, judgedRows: 99 } });
    expect(f.provider).toHaveBeenCalledTimes(200);
    expect(f.provider.mock.calls.map(([request]) => request.requestId)).toEqual(Array.from({ length: 200 }, (_, index) => String(index + 1)));
    expect(result.retries).toBe(0);
  });

  it.each([500, 502, 503, 504])("retains an answer HTTP %i failure and continues without retry", async (status) => {
    const f = fixture([completed("B"), completed(correct)]);
    f.provider.mockImplementationOnce((request: Request) => httpFailure(request, status, 0.003));
    const result = await runMethod(f.args);
    expect(result.rows[0]).toMatchObject({ answer: "", verdict: null,
      failure: "provider-http-failure", failureRole: "answer", failureStatus: status, providerAttemptNumbers: [1] });
    expect(result.rows[1]).toMatchObject({ answer: "B", verdict: { score: "correct" } });
    expect(result).toMatchObject({ totalReportedCostUsd: 0.043, completeCostAccounting: true,
      summary: null, aggregatesSuppressed: true, failedIds: ["a"], unattemptedIds: [] });
    expect(f.provider).toHaveBeenCalledTimes(3);
    expect(f.remote.afterCall).toHaveBeenCalledTimes(2);
  });

  it("stops on a 504 with missing cost instead of isolating the case", async () => {
    vi.useFakeTimers({ now: new Date("2026-11-02T23:00:00Z") });
    const f = fixture([]);
    f.provider.mockImplementationOnce((request: Request) => httpFailure(request, 504, null));
    const pending = runMethod(f.args);
    await vi.advanceTimersByTimeAsync(1001);
    const result = await pending;
    expect(result).toMatchObject({ unattemptedIds: ["b"], completeCostAccounting: false, totalCompleteCostUsd: null,
      budget: { missingCosts: 1 }, consecutiveProviderHttpFailures: { answer: 0, judge: 0 } });
    expect(result.providerAttempts[0]).toMatchObject({ costUsd: null, result: { status: 504, accountingError: "provider-cost-missing" } });
    expect(f.provider).toHaveBeenCalledTimes(1);
  });

  it.each(["source-identity-changed", "provider-worker-identity-changed"])("stops when the after-504 guard reports %s", async (failure) => {
    let checks = 0;
    const f = fixture([], { guard: async () => { if (++checks === 2) throw new Error(failure); } });
    f.provider.mockImplementationOnce((request: Request) => httpFailure(request));
    const result = await runMethod(f.args);
    expect(result).toMatchObject({ invalidReasons: [failure], unattemptedIds: ["b"], totalReportedCostUsd: 0,
      completeCostAccounting: true, consecutiveProviderHttpFailures: { answer: 0, judge: 0 } });
    expect(result.rows[0]).toMatchObject({ failure, failureRole: "answer", failureStatus: 504 });
    expect(checks).toBe(2);
    expect(f.provider).toHaveBeenCalledTimes(1);
  });

  it("stops on a reused HTTP log ID while retaining both receipts", async () => {
    const f = fixture([completed("A")]);
    f.provider.mockImplementationOnce(f.provider.getMockImplementation()!)
      .mockImplementationOnce((request: Request) => httpFailure(request, 504, 0, "log-1"));
    const result = await runMethod(f.args);
    expect(result).toMatchObject({ invalidReasons: ["missing-or-reused-provider-log-id"], unattemptedIds: ["b"],
      totalReportedCostUsd: 0.02, completeCostAccounting: true });
    expect(result.rows[0]).toMatchObject({ answer: "A", verdict: null, failureRole: "judge", failureStatus: 504 });
    expect(result.budget.calls.map((call: { costUsd: number }) => call.costUsd)).toEqual([0.02, 0]);
    expect(f.provider).toHaveBeenCalledTimes(2);
  });

  it.each(["mismatched ID", "missing ID", "status mismatch", "unrecognized response", "receipt mismatch", "multiple raw calls"])(
    "stops on a 504 with %s", async (problem) => {
      const f = fixture([]);
      f.provider.mockImplementationOnce(async (request: Request) => {
        const reply = await httpFailure(request);
        if (problem === "mismatched ID") reply.result.logId = "other-log";
        if (problem === "missing ID") reply.result.logId = null;
        if (problem === "status mismatch") reply.result.status = 503;
        if (problem === "unrecognized response") request.onEvidence({ type: "response-boundary", brand: "unrecognized" });
        if (problem === "receipt mismatch") reply.result.receipt.costUsd = 0.001;
        if (problem === "multiple raw calls") reply.rawCalls = 2;
        return reply;
      });
      const result = await runMethod(f.args);
      expect(result.unattemptedIds).toEqual(["b"]);
      expect(result.consecutiveProviderHttpFailures).toEqual({ answer: 0, judge: 0 });
      expect(result.rows[0].failure).not.toBe("provider-http-failure");
      expect(f.provider).toHaveBeenCalledTimes(1);
    }
  );

  it("opens the answer circuit after three consecutive qualifying HTTP failures", async () => {
    const selected = ["a", "b", "c", "d"].map((id) => ({ ...cases[0], id }));
    const f = fixture([], { cases: selected });
    f.provider.mockImplementation((request: Request) => httpFailure(request));
    const result = await runMethod(f.args);
    expect(result).toMatchObject({ invalidReasons: ["provider-http-circuit-breaker"], consecutiveProviderHttpFailures: { answer: 3, judge: 0 },
      failedIds: ["a", "b", "c"], unattemptedIds: ["d"], attemptedAllSelectedCases: false,
      gradedAllSelectedCases: false, summary: null, totalCompleteCostUsd: 0, completeCostAccounting: true });
    expect(result.rows.map((row: { failureStatus: number }) => row.failureStatus)).toEqual([504, 504, 504]);
    expect(f.provider).toHaveBeenCalledTimes(3);
  });

  it("resets answer failures before the next judge failure", async () => {
    const selected = ["a", "b", "c"].map((id) => ({ ...cases[0], id }));
    const f = fixture([completed("Retained C")], { cases: selected });
    const normal = f.provider.getMockImplementation()!;
    f.provider.mockImplementationOnce((request: Request) => httpFailure(request))
      .mockImplementationOnce((request: Request) => httpFailure(request))
      .mockImplementationOnce(normal).mockImplementationOnce((request: Request) => httpFailure(request));
    const result = await runMethod(f.args);
    expect(result).toMatchObject({ invalidReasons: [], consecutiveProviderHttpFailures: { answer: 0, judge: 1 },
      attemptedAllSelectedCases: true, gradedAllSelectedCases: false, summary: null, aggregatesSuppressed: true });
    expect(result.rows[2]).toMatchObject({ answer: "Retained C", verdict: null, failureRole: "judge", failureStatus: 504 });
    expect(f.provider).toHaveBeenCalledTimes(4);
  });

  it("stops after three failed judges despite successful answers between them", async () => {
    const selected = ["a", "b", "c", "d"].map((id) => ({ ...cases[0], id }));
    const f = fixture([completed("A"), completed("B"), completed("C"), completed("D"), completed(correct)], { cases: selected });
    const normal = f.provider.getMockImplementation()!;
    for (let index = 0; index < 3; index++) {
      f.provider.mockImplementationOnce(normal).mockImplementationOnce((request: Request) => httpFailure(request));
    }
    const result = await runMethod(f.args);
    expect(result.rows).toHaveLength(3);
    expect(result).toMatchObject({ invalidReasons: ["provider-http-circuit-breaker"],
      consecutiveProviderHttpFailures: { answer: 0, judge: 3 }, unattemptedIds: ["d"],
      failedIds: ["a", "b", "c"], totalCompleteCostUsd: 0.06, completeCostAccounting: true,
      summary: null, aggregatesSuppressed: true });
    expect(result.rows.map((row: { answer: string; failureRole: string; verdict: null }) => [row.answer, row.failureRole, row.verdict]))
      .toEqual([["A", "judge", null], ["B", "judge", null], ["C", "judge", null]]);
    expect(f.provider).toHaveBeenCalledTimes(6);
  });

  it("resets judge failures only after a successful judge completion", async () => {
    const selected = ["a", "b", "c", "d", "e"].map((id) => ({ ...cases[0], id }));
    const f = fixture([completed("A"), completed("B"), completed("C"), completed(correct), completed("D"), completed("E")], { cases: selected });
    const normal = f.provider.getMockImplementation()!;
    for (const fails of [true, true, false, true, true]) {
      f.provider.mockImplementationOnce(normal).mockImplementationOnce(fails ? (request: Request) => httpFailure(request) : normal);
    }
    const result = await runMethod(f.args);
    expect(result).toMatchObject({ invalidReasons: [], consecutiveProviderHttpFailures: { answer: 0, judge: 2 },
      attemptedAllSelectedCases: true, gradedAllSelectedCases: false, unattemptedIds: [], totalCompleteCostUsd: 0.12,
      failedIds: ["a", "b", "d", "e"], summary: null, aggregatesSuppressed: true });
    expect(result.rows[2]).toMatchObject({ answer: "C", failure: null, verdict: { score: "correct" } });
    expect(f.provider).toHaveBeenCalledTimes(10);
  });

  it.each([400, 401, 403, 408, 429, 501, 505])("stops the method on HTTP %i", async (status) => {
    const f = fixture([]);
    f.provider.mockImplementationOnce((request: Request) => httpFailure(request, status));
    const result = await runMethod(f.args);
    expect(result).toMatchObject({ invalidReasons: ["invalid-provider-outcome"], unattemptedIds: ["b"],
      consecutiveProviderHttpFailures: { answer: 0, judge: 0 }, completeCostAccounting: true });
    expect(result.rows[0]).toMatchObject({ failureRole: "answer", failureStatus: status });
    expect(f.provider).toHaveBeenCalledTimes(1);
  });

  it.each(["malformed JSON", "wrong model"])("stops on a 200 response with %s", async (problem) => {
    const f = fixture([]);
    f.provider.mockImplementationOnce((request: Request) => httpFailure(request, 200, 0, "invalid-completion",
      problem === "malformed JSON" ? "{broken" : JSON.stringify({ model: "other-model", choices: [] })));
    const result = await runMethod(f.args);
    expect(result).toMatchObject({ invalidReasons: ["invalid-provider-outcome"], unattemptedIds: ["b"], totalCompleteCostUsd: 0 });
    expect(f.provider).toHaveBeenCalledTimes(1);
  });

  it("stops on malformed judge verdict text and retains the answer and cost", async () => {
    const f = fixture([completed("A"), completed("not a verdict"), completed("B")]);
    const result = await runMethod(f.args);
    expect(result).toMatchObject({ unattemptedIds: ["b"], totalCompleteCostUsd: 0.04, summary: null });
    expect(result.rows[0]).toMatchObject({ answer: "A", verdict: null });
    expect(f.provider).toHaveBeenCalledTimes(2);
  });

  it("stops on a host timeout without inferring a zero cost", async () => {
    const f = fixture([]);
    f.provider.mockImplementationOnce(async () => { throw new Error("provider-host-timeout"); });
    const result = await runMethod(f.args);
    expect(result).toMatchObject({ invalidReasons: ["provider-host-timeout"], unattemptedIds: ["b"],
      budget: { missingCosts: 1 }, totalCompleteCostUsd: null, consecutiveProviderHttpFailures: { answer: 0, judge: 0 } });
    expect(f.provider).toHaveBeenCalledTimes(1);
  });

  it("does not claim raw attempt coverage when a single issued request has an unknown start", async () => {
    const f = fixture([], { cases: [cases[0]] });
    f.provider.mockImplementationOnce(async () => { throw new Error("provider-host-timeout"); });
    const result = await runMethod(f.args);
    expect(result.rows).toHaveLength(1);
    expect(result).toMatchObject({ rawProviderCalls: 0, unattemptedIds: [], attemptedAllSelectedCases: false,
      gradedAllSelectedCases: false, totalCompleteCostUsd: null, budget: { missingCosts: 1 } });
    expect(result.providerAttempts).toHaveLength(1);
  });

  it("requires raw coverage for each ID when a guard stops a newly created row", async () => {
    let checks = 0;
    const f = fixture([completed("A"), completed(correct)], {
      guard: async () => { if (++checks === 5) throw new Error("source-identity-changed"); }
    });
    const result = await runMethod(f.args);
    expect(result.rows).toHaveLength(2);
    expect(result).toMatchObject({ rawProviderCalls: 2, unattemptedIds: ["b"], attemptedAllSelectedCases: false,
      gradedAllSelectedCases: false, totalCompleteCostUsd: 0.04 });
    expect(result.providerAttempts.map((attempt: { id: string }) => attempt.id)).toEqual(["a", "a"]);
  });

  it("keeps literal grade coverage separate from final run validity", async () => {
    const f = fixture([completed("A"), completed(correct), completed("B"), completed(correct)], {
      finalize: async () => { throw new Error("final-identity-failed"); }
    });
    const result = await runMethod(f.args);
    expect(result).toMatchObject({ status: "invalid-or-incomplete", attemptedAllSelectedCases: true,
      gradedAllSelectedCases: true, invalidReasons: ["final-identity-failed"], aggregatesSuppressed: true, summary: null });
  });

  it("stops when the deadline expires during the after-504 guard", async () => {
    vi.useFakeTimers({ now: new Date("2026-11-02T23:00:00Z") });
    let checks = 0;
    const f = fixture([], { guard: async () => { if (++checks === 2) vi.setSystemTime(new Date(plan.deadline)); } });
    f.provider.mockImplementationOnce((request: Request) => httpFailure(request));
    const result = await runMethod(f.args);
    expect(result).toMatchObject({ invalidReasons: ["method-deadline"], unattemptedIds: ["b"], totalCompleteCostUsd: 0 });
    expect(f.provider).toHaveBeenCalledTimes(1);
  });

  it.each(["budget", "call"])("stops at the %s ceiling after a qualifying HTTP failure", async (ceiling) => {
    const f = fixture([], { plan: { ...plan, ...(ceiling === "budget" ? { maxBudgetUsd: 0.01 } : { maxProviderCalls: 1 }) } });
    f.provider.mockImplementationOnce((request: Request) => httpFailure(request, 504, ceiling === "budget" ? 0.01 : 0));
    const result = await runMethod(f.args);
    expect(result.invalidReasons).toEqual([ceiling === "budget" ? "provider-budget-exhausted" : "provider-call-limit"]);
    expect(result.unattemptedIds).toEqual(["b"]);
    expect(result.completeCostAccounting).toBe(true);
    expect(f.provider).toHaveBeenCalledTimes(1);
  });

  it.each(["selftest", "transport-canary"])("keeps %s fail-fast on a complete-cost HTTP 504", async (method) => {
    const selected = method === "selftest" ? (await selftestInputs()).map((input: object, index: number) => ({ ...input, id: `judge-selftest-${index}` }))
      : [{ id: "provider-ready", question: "Reply with exactly READY." }];
    const f = fixture([], { cases: selected, tools: method === "selftest" ? tools : [],
      plan: { ...plan, method, maxBudgetUsd: 3.5, maxAnswerSteps: 0 } });
    f.provider.mockImplementationOnce((request: Request) => httpFailure(request));
    const result = await runMethod(f.args);
    expect(result).toMatchObject({ invalidReasons: ["invalid-provider-outcome"], consecutiveProviderHttpFailures: { answer: 0, judge: 0 },
      totalCompleteCostUsd: 0, summary: null, aggregatesSuppressed: true });
    if (method === "selftest") expect(result.selftestPassed).toBe(false);
    expect(f.provider).toHaveBeenCalledTimes(1);
    expect(result.rows).toHaveLength(1);
  });

  it("persists cost before a changed source pin stops the method", async () => {
    let checks = 0;
    const f = fixture([completed("A")], { guard: async () => { if (++checks === 2) throw new Error("source-identity-changed"); } });
    const result = await runMethod(f.args);
    expect(result).toMatchObject({ status: "invalid-or-incomplete", totalReportedCostUsd: 0.02,
      unattemptedIds: ["b"], aggregatesSuppressed: true, summary: null });
    expect(result.providerAttempts[0]).toMatchObject({ costUsd: 0.02, failure: "source-identity-changed" });
    expect(f.provider).toHaveBeenCalledTimes(1);
    expect(f.snapshots.some((s) => s.totalReportedCostUsd === 0.02 && s.providerAttempts[0]?.result)).toBe(true);
  });

  it("retains partial cost observations without converting missing complete cost to zero", async () => {
    const f = fixture([]);
    f.provider.mockImplementationOnce(async (request: Request) => {
      request.onEvidence({ type: "raw-started" });
      request.onEvidence({ type: "reported-cost", logId: "partial", costUsd: 0.01 });
      return { requestId: request.requestId, rawCalls: 1, result: { parsed: null, costUsd: null, error: null, logId: null,
        receipt: { calls: 1, reportedCalls: 0, costUsd: null, reportedCostUsd: 0, error: "missing-answer-cost" } } };
    });
    const result = await runMethod(f.args);
    expect(result.budget.missingCosts).toBe(1);
    expect(result.totalCompleteCostUsd).toBeNull();
    expect(result.providerAttempts[0]).toMatchObject({ costUsd: null, reportedCosts: [{ logId: "partial", costUsd: 0.01 }] });
    expect(result.summary).toBeNull();
    expect(f.provider).toHaveBeenCalledTimes(1);
  });

  it("keeps excess reported spend and prevents the next provider request", async () => {
    const f = fixture([completed("A")], { plan: { ...plan, maxBudgetUsd: 0.01 } });
    const result = await runMethod(f.args);
    expect(result.totalReportedCostUsd).toBe(0.02);
    expect(result.aggregatesSuppressed).toBe(true);
    expect(f.provider).toHaveBeenCalledTimes(1);
  });

  function toolSequence(count: number) {
    return Array.from({ length: count }, (_, index) => completed("", [{ id: `lookup-${index}`, type: "function",
      function: { name: "search", arguments: '{"query":"Stellar"}' } }]));
  }

  it("uses request 16 for synthesis without another answer or tool request", async () => {
    const f = fixture([...toolSequence(15), completed("The retrieved fact is A."), completed(correct)], { cases: [cases[0]] });
    const result = await runMethod(f.args);
    expect(f.provider).toHaveBeenCalledTimes(17);
    expect(f.callTool).toHaveBeenCalledTimes(15);
    expect(f.requests.slice(0, 15).every((request) => request.options.toolChoice === "auto")).toBe(true);
    const finalRequest = f.requests[15]!;
    expect(finalRequest.options.toolChoice).toBe("none");
    expect(finalRequest.options.messages.at(-1)).toEqual({ role: "system", content: FINAL_ANSWER_REMINDER });
    expect(finalRequest.options.messages.some((message) => message.role === "tool" && message.content.includes('"fact":"A"'))).toBe(true);
    expect(result.providerAttempts[15]).toMatchObject({ requestToolChoice: "none", requestMessages: finalRequest.options.messages });
    expect(result.answerPolicy).toMatchObject({ id: ANSWER_POLICY, maxAnswerRequests: 16, finalToolChoice: "none",
      reminder: FINAL_ANSWER_REMINDER, reminderSha256: jsonSha(FINAL_ANSWER_REMINDER) });
    expect(result.rows[0]).toMatchObject({ answer: "The retrieved fact is A.", failure: null, verdict: { score: "correct" } });
    expect(f.requests[16]?.options.judge).toBe(true);
    expect(f.requests[16]?.options.messages.map((message) => message.content).join("\n")).not.toContain(FINAL_ANSWER_REMINDER);
  });

  it("preserves early completion without adding a synthesis request", async () => {
    const f = fixture([completed("Early answer"), completed(correct)], { cases: [cases[0]] });
    const result = await runMethod(f.args);
    expect(result.rows[0].answer).toBe("Early answer");
    expect(f.provider).toHaveBeenCalledTimes(2);
    expect(f.requests[0]?.options.toolChoice).toBe("auto");
    expect(f.requests[0]?.options.messages).toEqual([
      { role: "system", content: f.args.instructions }, { role: "user", content: cases[0]!.question }
    ]);
    expect(f.callTool).not.toHaveBeenCalled();
  });

  it("never executes tools returned against the terminal request policy", async () => {
    const f = fixture(toolSequence(16), { cases: [cases[0]] });
    const result = await runMethod(f.args);
    expect(f.provider).toHaveBeenCalledTimes(16);
    expect(f.callTool).toHaveBeenCalledTimes(15);
    expect(result.rows[0]).toMatchObject({ answer: "", failure: "answer-final-tool-violation",
      verdict: { score: "error", failureClass: "answer-final-tool-violation" } });
    expect(result.providerAttempts[15]).toMatchObject({ requestToolChoice: "none", completionAccepted: false,
      result: { parsed: { message: { tool_calls: [{ id: "lookup-15" }] } } } });
    expect(result).toMatchObject({ status: "invalid-or-incomplete", failedIds: ["a"], summary: null, aggregatesSuppressed: true });
  });

  it.each(["empty", "refused"])("keeps a %s terminal completion as a failed output", async (kind) => {
    const f = fixture(toolSequence(15), { cases: [cases[0]] });
    const normal = f.provider.getMockImplementation()!;
    for (let index = 0; index < 15; index++) f.provider.mockImplementationOnce(normal);
    const message = { role: "assistant", content: kind === "empty" ? "" : null,
      ...(kind === "refused" ? { refusal: "Cannot provide an answer." } : {}) };
    f.provider.mockImplementationOnce((request: Request) => httpFailure(request, 200, 0.02, `log-${request.requestId}`,
      JSON.stringify({ model: "grok-4.7", choices: [{ message, finish_reason: "stop" }] })));
    const result = await runMethod(f.args);
    expect(f.provider).toHaveBeenCalledTimes(16);
    expect(f.callTool).toHaveBeenCalledTimes(15);
    expect(result.rows[0]).toMatchObject({ answer: "", verdict: null, failure: "invalid-provider-outcome" });
    expect(result.providerAttempts[15]).toMatchObject({ requestToolChoice: "none", completionAccepted: false,
      result: { rejectedCompletion: { message, finish_reason: "stop" } } });
    expect(result).toMatchObject({ status: "invalid-or-incomplete", summary: null, aggregatesSuppressed: true });
  });

  it.each(["missing-cost", "identity"])("keeps final synthesis fail-closed after %s failure", async (kind) => {
    const f = fixture([...toolSequence(15), completed("UNACCEPTED FINAL")], { cases: [cases[0]] });
    if (kind === "identity") {
      f.args.guard = vi.fn(async () => { if (f.provider.mock.calls.length === 16) throw new Error("source-identity-changed"); });
    } else {
      const normal = f.provider.getMockImplementation()!;
      for (let index = 0; index < 15; index++) f.provider.mockImplementationOnce(normal);
      f.provider.mockImplementationOnce(async (request: Request) => {
        const reply = await normal(request);
        reply.result.receipt = { calls: 1, reportedCalls: 0, costUsd: null, reportedCostUsd: 0, error: "missing-answer-cost" };
        return reply;
      });
    }
    const result = await runMethod(f.args);
    expect(f.provider).toHaveBeenCalledTimes(16);
    expect(f.callTool).toHaveBeenCalledTimes(15);
    expect(result.rows[0]).toMatchObject({ answer: "", verdict: null });
    expect(result.providerAttempts[15]).toMatchObject({ completionAccepted: false,
      failure: kind === "identity" ? "source-identity-changed" : "provider-cost-missing",
      unacceptedEvidence: { answer: "UNACCEPTED FINAL" } });
    expect(result).toMatchObject({ status: "invalid-or-incomplete", summary: null, aggregatesSuppressed: true });
    expect(result.completeCostAccounting).toBe(kind === "identity");
  });

  it("passes the none policy to the native provider payload in one request", async () => {
    const run = vi.fn(async (_model: string, _input: Record<string, unknown>) => new Response(JSON.stringify({ model: "grok-4.7",
      choices: [{ message: { role: "assistant", content: "Final answer" }, finish_reason: "stop" }] }),
    { headers: { "cf-aig-log-id": "final-policy-log" } }));
    const ai = { run, gateway: () => ({ getLog: async () => ({ cost: 0.02 }) }) };
    const result = await providerCall(ai, { gatewayId: plan.gatewayId, maxBudgetUsd: 1, messages: [], tools: [],
      maxOutputTokens: 8192, toolChoice: "none" });
    expect(run).toHaveBeenCalledTimes(1);
    expect(run.mock.calls[0]?.[1]).toMatchObject({ tool_choice: "none", tools: [], stream: false, reasoning_effort: "high" });
    expect(result).toMatchObject({ error: null, parsed: { answer: "Final answer" }, rejectedCompletion: null });
  });

  it("rejects an unacknowledged answer policy before any provider call", async () => {
    const f = fixture([], { plan: { ...plan, answerPolicy: undefined } });
    await expect(runMethod(f.args)).rejects.toThrow("answer-policy-mismatch");
    expect(f.provider).not.toHaveBeenCalled();
    expect(f.callTool).not.toHaveBeenCalled();
  });

  it("preserves a final-request tool violation as a selected row", async () => {
    const search = { id: "limited", type: "function", function: { name: "search", arguments: '{"query":"Stellar"}' } };
    const f = fixture([completed("", [search]), completed("B"), completed(correct)], { plan: { ...plan, maxAnswerSteps: 1 } });
    const result = await runMethod(f.args);
    expect(result.rows.map((row: { id: string }) => row.id)).toEqual(["a", "b"]);
    expect(result.rows[0]).toMatchObject({ failure: "answer-final-tool-violation" });
    expect(result.unattemptedIds).toEqual([]);
    expect(result.aggregatesSuppressed).toBe(true);
  });

  it("runs the seven original selftest callbacks without invoking Claude", async () => {
    const inputs = await selftestInputs();
    const f = fixture(Array.from({ length: 7 }, () => completed(correct)), {
      plan: { ...plan, method: "selftest", maxProviderCalls: 7, maxAnswerSteps: 0, maxBudgetUsd: 3.5 },
      cases: inputs.map((input: unknown, index: number) => ({ ...(input as object), id: `judge-selftest-${index}` }))
    });
    const result = await runMethod(f.args);
    expect(result.providerAttempts).toHaveLength(7);
    expect(result.rows.map((row: { selftest: { index: number } }) => row.selftest.index)).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(f.requests.every((request) => request.options.judge && request.options.tools === undefined)).toBe(true);
    expect(f.callTool).not.toHaveBeenCalled();
    expect(result.summary).toBeNull();
  });

  it("runs a separate one-call transport canary without golden inputs, MCP, or a prior selftest", async () => {
    const selected = [{ id: "provider-ready", question: "Reply with exactly READY." }];
    const f = fixture([completed("READY")], { plan: { ...plan, method: "transport-canary", maxProviderCalls: 1, maxAnswerSteps: 0, maxOutputTokens: 256 },
      cases: selected, tools: [], instructions: "" });
    const result = await runMethod(f.args);
    expect(result).toMatchObject({ status: "complete", rawProviderCalls: 1, summary: null, aggregatesSuppressed: true, incompleteIds: [] });
    expect(result.selectedCaseInputs).toEqual(selected);
    expect(f.requests[0]?.options.messages).toEqual([{ role: "user", content: "Reply with exactly READY." }]);
    expect(f.requests[0]?.options.judge).toBe(true);
    expect(f.requests[0]?.options.tools).toBeUndefined();
    expect(f.callTool).not.toHaveBeenCalled();
    expect(f.remote.beforeCall).not.toHaveBeenCalled();
  });

  it("validates fixed transport limits without accepting QA identity claims", async () => {
    const selected = [{ id: "provider-ready", question: "Reply with exactly READY." }];
    const candidate = { ...plan, schema: PLAN_SCHEMA, method: "transport-canary",
      model: "xai/grok-4.7", effort: "high", accountId: "ba55b7ae9acfb3ed152103e3497c0752",
      maxProviderCalls: 1, maxAnswerSteps: 0, maxOutputTokens: 256, requestTimeoutMs: 1000, hostBackstopMs: 2000, settlementGraceMs: 1000,
      selection: { ids: ["provider-ready"], idsSha256: jsonSha(["provider-ready"]), contentSha256: jsonSha(selected), lifecycleSha256: jsonSha(null) } };
    expect(validateRunnerPlan(candidate, { mode: "prepare-pins", preparing: true })).toBe(candidate);
    expect(() => validateRunnerPlan({ ...candidate, schema: "direct-grok-host-loop-plan-v1" }, { preparing: true })).toThrow("invalid-plan-contract");
    expect(() => validateRunnerPlan({ ...candidate, answerPolicy: undefined }, { preparing: true })).toThrow("answer-policy-mismatch");
    expect(await loadSelection(candidate)).toEqual({ cases: selected, lifecycle: null });
    expect(() => validateRunnerPlan({ ...candidate, maxProviderCalls: 2 }, { preparing: true })).toThrow(/limit/);
    expect(() => validateRunnerPlan({ ...candidate, server: {} }, { preparing: true })).toThrow(/not-qa/);
  });

  it("excludes hc terminal scope while pinning provider, auth, and Node variables without values", () => {
    const env = { HOME: "/example", HTTP_PROXY: "opaque-test-value", HC_TERMINAL_ID: "one", HC_SCOPE: "scope-one",
      CLOUDFLARE_API_BASE_URL: "https://example.invalid", CLOUDFLARE_API_TOKEN: "test-one", NODE_OPTIONS: "" };
    const original = environmentIdentity(env);
    expect(JSON.stringify(original)).not.toContain("opaque-test-value");
    expect(environmentIdentity({ ...env, HC_TERMINAL_ID: "two" })).toEqual(original);
    expect(environmentIdentity({ ...env, HC_SCOPE: "scope-two" })).toEqual(original);
    expect(environmentIdentity({ ...env, HC_SCOPE: "scope-two", HC_TERMINAL_ID: "two" })).toEqual(original);
    expect(environmentIdentity({ ...env, HTTP_PROXY: "changed" }).sha256).not.toBe(original.sha256);
    expect(environmentIdentity({ ...env, CLOUDFLARE_API_BASE_URL: "https://changed.invalid" }).sha256).not.toBe(original.sha256);
    expect(environmentIdentity({ ...env, CLOUDFLARE_API_TOKEN: "test-two" }).sha256).not.toBe(original.sha256);
    expect(environmentIdentity({ ...env, NODE_OPTIONS: "--some-option" }).sha256).not.toBe(original.sha256);
  });

  it("rejects changed source files and ambiguous method flags", () => {
    const directory = mkdtempSync(path.join(os.tmpdir(), "direct-grok-test-"));
    try {
      const file = path.join(directory, "source.mjs");
      writeFileSync(file, "one");
      const pins = filePins([file]);
      writeFileSync(file, "two");
      expect(() => checkFilePins(pins)).toThrow(/source/);
    } finally { rmSync(directory, { recursive: true, force: true }); }
    expect(() => parseRunnerArgs(["--mode=baseline"])).toThrow();
    expect(() => parseRunnerArgs(["--mode", "baseline", "--mode", "baseline"])).toThrow();
  });

  it("normalizes only genuine Miniflare responses and settles their actual cost", async () => {
    const raw = new MiniflareResponse(JSON.stringify({ model: "grok-4.7",
      choices: [{ message: { role: "assistant", content: "READY" }, finish_reason: "stop" }] }),
    { status: 200, headers: { "cf-aig-log-id": "real-brand-log" } });
    expect(raw instanceof Response).toBe(false);
    const ai = { run: vi.fn(async () => normalizeProxyResponse(raw)), gateway: () => ({ getLog: async () => ({ cost: 0.004 }) }) };
    const result = await providerCall(ai, { gatewayId: "stellar-raven-demo", maxBudgetUsd: 1,
      messages: [{ role: "user", content: "READY" }], maxOutputTokens: 256, judge: true });
    expect(result).toMatchObject({ error: null, logId: "real-brand-log", costUsd: 0.004, parsed: { answer: "READY" } });
    expect(() => normalizeProxyResponse({ headers: new Headers(), json() {} })).toThrow(/brand/);
  });

  it("passes plain execute transcript results into the unchanged canonical p9 pack", () => {
    const input = { question: "What is ProjectAlpha's status?", tags: { freshness: "live" },
      golden: { answer: "ProjectAlpha is active.", keyFacts: ["ProjectAlpha is active."], avoid: [] },
      candidateAnswer: "ProjectAlpha is active.",
      transcript: [{ tool: "execute", input: '{"code":"return result"}',
        result: '{"ok":true,"data":{"name":"ProjectAlpha","status":"active","url":"https://example.org"}}' }] };
    expect(judgeInput(input).transcriptEvidence).toContain("ProjectAlpha");
    expect(judgeInput(input).transcriptEvidence).toContain("active");
    const searchOnly = { ...input, transcript: input.transcript.map((entry) => ({ ...entry, tool: "search" })) };
    expect(judgeInput(searchOnly).transcriptEvidence).toBe("");
    expect(judgeInput(input).prompt).toContain("COMPACT TOOL TRANSCRIPT SOURCE-BASIS EVIDENCE");
    expect(judgeInput(searchOnly).prompt).not.toContain("COMPACT TOOL TRANSCRIPT SOURCE-BASIS EVIDENCE");
  });

  it("terminates a hung provider at the host backstop without retrying", async () => {
    vi.useFakeTimers();
    class Child extends EventEmitter {
      exitCode: number | null = null;
      signalCode: string | null = null;
      send = vi.fn((_message: unknown, callback: (error?: Error) => void) => callback());
      kill = vi.fn((signal: string) => { this.signalCode = signal; this.emit("exit"); });
    }
    const child = new Child();
    const spawn = vi.fn(() => child);
    const client = new BindingClient({ spawn });
    const pending = client.call({ plan: { ...plan, requestTimeoutMs: 5, hostBackstopMs: 10, settlementGraceMs: 5 },
      options: {}, expectedIdentity: {}, requestId: "one", onEvidence: () => {} });
    const rejected = expect(pending).rejects.toThrow("provider-host-timeout");
    await vi.advanceTimersByTimeAsync(11);
    await rejected;
    expect(child.send).toHaveBeenCalledTimes(1);
    expect(child.kill).toHaveBeenCalledWith("SIGTERM");
    await client.close();
  });
});
