import { spawnSync } from "node:child_process";
import { afterEach, describe, expect, it, vi } from "vitest";
// @ts-expect-error The standalone Node diagnostic uses JavaScript modules.
import { parseCanaryArgs, assertCanaryDeadline, assertPins } from "../eval/qa/non-anthropic/canary.mjs";
// @ts-expect-error The standalone Node diagnostic uses JavaScript modules.
import { providerCall } from "../eval/qa/non-anthropic/provider.mjs";
// @ts-expect-error The standalone Node diagnostic uses JavaScript modules.
import { parseCompletion, validateToolCall, nativeCostTicks, diagnosticCompleteness, judgeInput, parseVerdict } from "../eval/qa/non-anthropic/core.mjs";
// @ts-expect-error The canonical judge uses Node JavaScript modules.
import { judgeCase } from "../eval/qa/judge.mjs";

vi.mock("node:child_process", async (original) => ({
  ...await original<typeof import("node:child_process")>(),
  spawnSync: vi.fn(() => { throw new Error("unexpected-judge-process"); })
}));

const completion = (content = "READY") => ({
  model: "grok-4.7", id: "completion-one",
  choices: [{ message: { role: "assistant", content }, finish_reason: "stop" }],
  usage: { prompt_tokens: 10, completion_tokens: 1, cost_in_usd_ticks: 10_000_000 }
});

function binding(response: Response) {
  const getLog = vi.fn(async () => ({ cost: 0.001 }));
  const run = vi.fn(async () => response);
  return { ai: { run, gateway: () => ({ getLog }) }, run, getLog };
}

const request = {
  gatewayId: "stellar-raven-demo", maxBudgetUsd: 1,
  messages: [{ role: "user", content: "Reply with exactly READY." }], maxOutputTokens: 256, judge: true
};

describe("non-Anthropic binding transport canary", () => {
  afterEach(() => vi.useRealTimers());

  it("reports native cost separately when Gateway settlement remains missing", async () => {
    vi.useFakeTimers();
    const body = { ...completion(), usage: { cost_in_usd_ticks: 474160000 } };
    const f = binding(new Response(JSON.stringify(body), { headers: { "cf-aig-log-id": "native-only" } }));
    f.getLog.mockImplementation(async () => new Promise(() => {}));
    const pending = providerCall(f.ai, request);
    await vi.advanceTimersByTimeAsync(6001);
    expect(await pending).toMatchObject({ error: null, accountingError: null, costUsd: 0.047416,
      costSource: "native-reported", gatewayCostComplete: false, nativeReportedCost: { ticks: 474160000, usd: 0.047416 },
      receipt: { costUsd: null, reportedCostUsd: 0, calls: 1, reportedCalls: 0, error: "missing-answer-cost" } });
    expect(f.run).toHaveBeenCalledTimes(1);
  });

  it.each([474160000, 10000001])("rejects conflicting complete reports at %i ticks without rounding", async (ticks) => {
    const body = { ...completion(), usage: { cost_in_usd_ticks: ticks } };
    const f = binding(new Response(JSON.stringify(body), { headers: { "cf-aig-log-id": "conflict" } }));
    expect(await providerCall(f.ai, request)).toMatchObject({ accountingError: "provider-cost-conflict", costUsd: null,
      costSource: null, nativeReportedCost: { usd: ticks / 1e10 }, gatewayCostComplete: true,
      receipt: { costUsd: 0.001, reportedCalls: 1 } });
  });

  it.each(["cost_is_partial", "usage_is_incomplete"])("requires %s to be absent or exactly false", (flag) => {
    for (const value of [true, null, 0, 1, "false", undefined, {}, []]) {
      expect(() => nativeCostTicks({ cost_in_usd_ticks: 0, [flag]: value })).toThrow();
    }
    expect(nativeCostTicks({ cost_in_usd_ticks: 0, [flag]: false })).toEqual({ ticks: 0, usd: 0 });
    expect(() => nativeCostTicks({ [flag]: true })).toThrow();
  });
  it("rejects ambiguous commands and requires the exact $1 cap", () => {
    const args = ["--pins", "pins.json", "--expect-pins-sha256", "a".repeat(64), "--out", "result.json", "--max-budget-usd", "1"];
    expect(parseCanaryArgs(args)["--max-budget-usd"]).toBe("1");
    expect(() => parseCanaryArgs([...args, "--max-budget-usd", "1"])).toThrow(/duplicate/);
    expect(() => parseCanaryArgs(["--max-budget-usd=1"])).toThrow();
    expect(() => parseCanaryArgs(args.slice(0, -2))).toThrow();
    expect(() => parseCanaryArgs([...args.slice(0, -1), "2"])).toThrow();
  });

  it("stops changed identities and the hard deadline", () => {
    expect(() => assertPins({ binary: "a" }, { binary: "b" })).toThrow(/identity/);
    expect(() => assertCanaryDeadline(Date.parse("2026-11-03T10:00:00Z"))).toThrow(/deadline/);
  });

  it("makes one tool-free call and settles the existing Gateway receipt", async () => {
    const f = binding(new Response(JSON.stringify(completion()), { headers: { "cf-aig-log-id": "cost-one" } }));
    const result = await providerCall(f.ai, request);
    expect(result).toMatchObject({ error: null, costUsd: 0.001, parsed: { answer: "READY" }, nativeReportedCost: { ticks: 10_000_000, usd: 0.001 } });
    expect(f.run).toHaveBeenCalledTimes(1);
    expect(f.getLog).toHaveBeenCalledWith("cost-one");
    const [model, body, options] = f.run.mock.calls[0] as unknown as [string, Record<string, unknown>, { gateway: unknown }];
    expect(model).toBe("xai/grok-4.7");
    expect(body).toMatchObject({ reasoning_effort: "high", max_tokens: 256, stream: false });
    expect(body).not.toHaveProperty("tools");
    expect(body).not.toHaveProperty("tool_choice");
    expect(options.gateway).toMatchObject({ retries: { maxAttempts: 1 } });
  });

  it("retains known cost when completion parsing fails", async () => {
    const f = binding(new Response("{broken", { headers: { "cf-aig-log-id": "malformed" } }));
    expect(await providerCall(f.ai, request)).toMatchObject({ error: "malformed-provider-json", costUsd: 0.001, parsed: null });
    expect(f.run).toHaveBeenCalledTimes(1);
  });

  it("rejects a wrong Response brand without assigning zero cost", async () => {
    const f = { run: vi.fn(async () => ({ json: async () => completion() })), gateway: () => ({ getLog: vi.fn() }) };
    expect(await providerCall(f, request)).toMatchObject({ error: "provider-response-invalid", costUsd: null,
      accountingError: "provider-gateway-receipt-invalid" });
    expect(f.run).toHaveBeenCalledTimes(1);
  });

  it("uses 10^10 ticks per USD and rejects missing-value substitutes", () => {
    expect(nativeCostTicks({ cost_in_usd_ticks: 10_000_000_000 })).toEqual({ ticks: 10_000_000_000, usd: 1 });
    expect(nativeCostTicks({})).toBeNull();
    for (const value of [-1, 1.5, "1000", Infinity, NaN, null, Number.MAX_SAFE_INTEGER + 1]) expect(() => nativeCostTicks({ cost_in_usd_ticks: value })).toThrow();
    expect(() => nativeCostTicks({ cost_in_usd_ticks: 0, cost_is_partial: true })).toThrow();
  });

  it("rejects partial completions, model substitutions, and judge tools", () => {
    const body = completion();
    expect(() => parseCompletion({ ...body, model: "another-model" })).toThrow();
    expect(() => parseCompletion({ ...body, choices: [{ ...body.choices[0], finish_reason: "length" }] })).toThrow();
    const call = { id: "tool-one", type: "function", function: { name: "search", arguments: '{"query":"Stellar"}' } };
    expect(() => validateToolCall(call, { judge: true })).toThrow(/judge/);
    for (const name of ["use_tool", "raven__execute", "read_file", "other__search"]) {
      expect(() => validateToolCall({ ...call, function: { ...call.function, name } })).toThrow(/target/);
    }
    for (const input of [{ file: "/private/golden.json" }, { tool_input_file: "/private/golden.json" }, { tool_name: "other__search" }]) {
      expect(() => validateToolCall({ ...call, function: { ...call.function, arguments: JSON.stringify(input) } })).toThrow(/indirection/);
    }
  });

  it("preserves the selected denominator and canonical consistency errors", () => {
    const incomplete = diagnosticCompleteness(["a", "b"], [{ id: "a", verdict: { score: "correct" } }]);
    expect(incomplete).toMatchObject({ aggregatesSuppressed: true, summary: null, completeness: { expectedCases: 2, missingIds: ["b"] } });
    const input = { question: "Q?", golden: { answer: "A", keyFacts: ["A"], avoid: [] }, tags: { freshness: "stable" }, candidateAnswer: "A", transcript: [] };
    const evidence = judgeInput(input);
    const verdict = parseVerdict(JSON.stringify({ rationale: "A", score: "partial", coreAnswer: "correct", missingFacts: [], wrongClaims: [], avoidMatches: [] }), input, evidence);
    expect(verdict).toMatchObject({ score: "error", failureClass: "consistency", consistencyViolations: ["partial-without-issue"] });
  });
});

describe("direct verdict parser alignment", () => {
  const input = { question: "Q?", golden: { answer: "A", keyFacts: ["A"], avoid: ["Do not claim B."] },
    tags: { freshness: "stable" }, candidateAnswer: "A", transcript: [] };
  const evidence = judgeInput(input);
  const valid = { rationale: "The answer agrees.", score: "correct", coreAnswer: "correct",
    missingFacts: [], wrongClaims: [], avoidMatches: [] };

  async function canonical(text: string) {
    const stdout = Buffer.from(JSON.stringify({ result: text }));
    const stderr = Buffer.alloc(0);
    vi.mocked(spawnSync).mockReturnValueOnce({ pid: 0, status: 0, signal: null, stdout, stderr,
      output: [null, stdout, stderr] });
    return judgeCase(input);
  }

  it("accepts a fenced valid verdict exactly like the canonical judge", async () => {
    const text = `\`\`\`json\n${JSON.stringify(valid)}\n\`\`\``;
    expect(parseVerdict(text, input, evidence)).toEqual(await canonical(text));
  });

  it.each([undefined, null, 42, false, {}])("normalizes rationale %j exactly like the canonical judge", async (rationale) => {
    const text = JSON.stringify({ ...valid, rationale });
    const verdict = parseVerdict(text, input, evidence);
    expect(verdict).toEqual(await canonical(text));
    expect(verdict).toMatchObject({ score: "correct", rationale: "" });
  });

  it.each(["invalid", "error", null, 0, undefined])("still rejects invalid score %j", async (score) => {
    const text = JSON.stringify({ ...valid, score });
    expect(() => parseVerdict(text, input, evidence)).toThrow("invalid judge verdict");
    expect(await canonical(text)).toMatchObject({ score: "error", coreAnswer: null, failureClass: "parse" });
  });

  it.each<{ label: string; raw: Record<string, unknown>; violations: string[] }>([
    { label: "non-array missingFacts", raw: { missingFacts: "missing" }, violations: ["invalid-missing-facts"] },
    { label: "non-string missingFacts", raw: { missingFacts: [null] }, violations: ["invalid-missing-facts"] },
    { label: "absent missingFacts", raw: { missingFacts: undefined }, violations: ["invalid-missing-facts"] },
    { label: "non-array wrongClaims", raw: { wrongClaims: {} }, violations: ["invalid-wrong-claims"] },
    { label: "non-string wrongClaims", raw: { wrongClaims: [false] }, violations: ["invalid-wrong-claims"] },
    { label: "absent wrongClaims", raw: { wrongClaims: undefined }, violations: ["invalid-wrong-claims"] },
    { label: "non-array avoidMatches", raw: { avoidMatches: "1" }, violations: ["invalid-avoid-match"] },
    { label: "zero avoid index", raw: { avoidMatches: [0] }, violations: ["invalid-avoid-match"] },
    { label: "duplicate avoid index", raw: { avoidMatches: [1, 1] }, violations: ["invalid-avoid-match"] },
    { label: "out-of-range avoid index", raw: { avoidMatches: [2] }, violations: ["invalid-avoid-match"] },
    { label: "all malformed arrays", raw: { missingFacts: [7], wrongClaims: "wrong", avoidMatches: null },
      violations: ["invalid-missing-facts", "invalid-wrong-claims", "invalid-avoid-match"] }
  ])("checks raw $label before normalizing the emitted arrays", async ({ raw, violations }) => {
    const text = JSON.stringify({ ...valid, ...raw });
    const verdict = parseVerdict(text, input, evidence);
    expect(verdict).toEqual(await canonical(text));
    expect(verdict).toMatchObject({ score: "error", coreAnswer: null, judgeScore: "correct", failureClass: "consistency",
      missingFacts: [], wrongClaims: [], avoidMatches: [], consistencyViolations: violations });
  });

  it("emits only canonical verdict fields and keeps valid issue arrays", async () => {
    const text = JSON.stringify({ ...valid, score: "partial", missingFacts: ["One detail."], extra: "discard" });
    const verdict = parseVerdict(text, input, evidence);
    expect(verdict).toEqual(await canonical(text));
    expect(verdict).toMatchObject({ score: "partial", missingFacts: ["One detail."] });
    expect(verdict).not.toHaveProperty("extra");
  });
});
