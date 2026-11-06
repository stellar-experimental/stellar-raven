import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createGatewayJudge, gatewayJudgeConfig, gatewayJudgeIdentity, gatewayJudgeRequest, responsesJudgeOutput } from "../eval/qa/gateway-judge.mjs";
import { prepareGatewayRejudge, readGatewayJudgePlan, runGatewayRejudge } from "../eval/qa/gateway-rejudge.mjs";
import { buildJudgePrompt, buildTranscriptEvidence, judgeSelfTestFixture, JUDGE_MODEL } from "../eval/qa/judge.mjs";
import { FAKE_JUDGE_INPUT } from "./helpers/fake-judge-cli.mjs";

const sha = (value) => createHash("sha256").update(value).digest("hex");
const config = { accountId: "a".repeat(32), gatewayId: "default", model: "gpt-6.1-sol", gatewayLogModel: "openai/gpt-6.1-sol", effort: "high", maxOutputTokens: 4096, maxPromptBytes: 100000, timeoutMs: 1000, callReserveUsd: 0.25 };
const identity = { sha256: "b".repeat(64) };
const verdict = { score: "correct", coreAnswer: "correct", missingFacts: [], wrongClaims: [], avoidMatches: [], rationale: "Correct." };
const json = (value, extra = {}) => new Response(JSON.stringify(value), { status: 200, headers: { "content-type": "application/json" }, ...extra });
const body = () => ({ object: "response", status: "completed", error: null, incomplete_details: null, model: config.model, reasoning: { effort: config.effort }, service_tier: "default", tools: [], tool_choice: "none", output: [{ type: "reasoning", summary: [] }, { type: "message", role: "assistant", status: "completed", content: [{ type: "output_text", text: JSON.stringify(verdict) }] }], usage: { input_tokens: 100, output_tokens: 50, total_tokens: 150, input_tokens_details: { cached_tokens: 10 }, output_tokens_details: { reasoning_tokens: 20 } } });
const log = () => ({ success: true, result: { id: "log-1", model: config.gatewayLogModel, provider: "openai", cost: 0.02, cached: false, custom_cost: false, collect_log_payload: false, status_code: 200,
  metadata: JSON.stringify({ role: "judge-b", runId: "offline", promptSha256: sha(buildJudgePrompt({ ...FAKE_JUDGE_INPUT, transcriptEvidence: buildTranscriptEvidence(FAKE_JUDGE_INPUT) })) }) } });
function harness({ response = body(), logBody = log(), maxCalls = 2, maxBudgetUsd = 1, maxJudgeErrorRate = 0, checkpoint = async () => {}, fetchOverride, identityImpl = () => identity } = {}) {
  const requests = [];
  const snapshots = [];
  const session = createGatewayJudge({ config, identity, token: "host-only-test-token", authorization: { runId: "offline", identitySha256: identity.sha256, maxCalls, maxBudgetUsd, maxJudgeErrorRate }, checkpoint: async (snapshot) => { snapshots.push(snapshot); await checkpoint(snapshot); } }, {
    identityImpl, sleep: async () => {}, fetchImpl: async (url, options) => {
      requests.push({ url, options });
      if (fetchOverride) return fetchOverride(url, options);
      return options.method === "POST" ? json(response, { headers: { "content-type": "application/json", "cf-aig-log-id": "log-1" } }) : json(logBody);
    }
  });
  return { session, requests, snapshots };
}

describe("Gateway blind judge", () => {
  it("sends one no-tools POST with exact shared prompt and settles real usage/cost", async () => {
    const h = harness();
    const result = await h.session.judge(FAKE_JUDGE_INPUT, { id: "case" });
    expect(result).toMatchObject({ score: "correct", costUsd: 0.02, costBasis: "gateway-reported-usd", usage: { inputTokens: 100, outputTokens: 50, reasoningTokens: 20 } });
    expect(h.requests.map((r) => r.options.method)).toEqual(["POST", "GET"]);
    expect(h.snapshots[0]).toMatchObject({ callsStarted: 1, calls: [{ status: "reserved", costUsd: null }] });
    const request = JSON.parse(h.requests[0].options.body);
    expect(request).toMatchObject({ tools: [], tool_choice: "none", stream: false, store: false, max_output_tokens: 4096, reasoning: { effort: "high" } });
    expect(h.requests[0].options.headers).toMatchObject({ "cf-aig-skip-cache": "true", "cf-aig-collect-log-payload": "false", "cf-aig-max-attempts": "1" });
    expect(h.requests.every((r) => r.options.redirect === "error")).toBe(true);
    const prompt = buildJudgePrompt({ ...FAKE_JUDGE_INPUT, transcriptEvidence: buildTranscriptEvidence(FAKE_JUDGE_INPUT) });
    expect(request.input).toEqual([{ role: "user", content: prompt }]);
    expect(result.promptSha256).toBe(sha(prompt));
    expect(JSON.stringify(h.session.snapshot())).not.toContain("host-only-test-token");
    expect(JUDGE_MODEL).toBe("claude-sonnet-5");
  });

  it.each([
    ["incomplete", (b) => { b.status = "incomplete"; }],
    ["error after answer", (b) => { b.error = { message: "host-only-test-token" }; }],
    ["wrong model", (b) => { b.model = "gpt-other"; }],
    ["wrong effort", (b) => { b.reasoning.effort = "low"; }],
    ["tool call", (b) => { b.output.push({ type: "function_call", name: "read_secret" }); }],
    ["web search", (b) => { b.output.push({ type: "web_search_call" }); }],
    ["refusal", (b) => { b.output[1].content = [{ type: "refusal", refusal: "No" }]; }],
    ["reasoning only", (b) => { b.output.pop(); }],
    ["pending item", (b) => { b.output[1].status = "in_progress"; }],
    ["duplicate final", (b) => { b.output.push(b.output[1]); }],
    ["missing usage", (b) => { delete b.usage; }],
    ["invalid usage", (b) => { b.usage.input_tokens = -1; }],
    ["output exceeds limit", (b) => { b.usage.output_tokens = 4097; b.usage.total_tokens = 4197; }],
    ["not JSON", (b) => { b.output[1].content[0].text = "earlier text " + JSON.stringify(verdict); }],
    ["inconsistent verdict", (b) => { b.output[1].content[0].text = JSON.stringify({ ...verdict, coreAnswer: "incorrect" }); }]
  ])("rejects %s, preserves cost, and closes further authorization", async (_, mutate) => {
    const response = body(); mutate(response);
    const h = harness({ response });
    const result = await h.session.judge(FAKE_JUDGE_INPUT);
    expect(result.score).toBe("error"); expect(result.costUsd).toBe(0.02);
    expect(JSON.stringify(result)).not.toContain("host-only-test-token");
    await expect(h.session.judge(FAKE_JUDGE_INPUT)).rejects.toThrow(/stopped/);
    expect(h.requests.filter((r) => r.options.method === "POST")).toHaveLength(1);
  });

  it.each(["cached", "custom_cost", "collect_log_payload", "model", "provider", "id", "status_code", "metadata"])("rejects log %s mismatch", async (field) => {
    const logBody = log();
    logBody.result[field] = typeof logBody.result[field] === "boolean" ? true : "different";
    const h = harness({ logBody });
    expect((await h.session.judge(FAKE_JUDGE_INPUT)).score).toBe("error");
    await expect(h.session.judge(FAKE_JUDGE_INPUT)).rejects.toThrow(/stopped/);
  });

  it("does not turn unavailable dollars into zero or retry inference", async () => {
    const logBody = log(); delete logBody.result.cost;
    const h = harness({ logBody });
    expect(await h.session.judge(FAKE_JUDGE_INPUT)).toMatchObject({ score: "error", costUsd: null, failureClass: "missing-gateway-cost" });
    expect(h.requests.filter((r) => r.options.method === "POST")).toHaveLength(1);
    expect(h.requests.filter((r) => r.options.method === "GET")).toHaveLength(5);
    expect(h.session.snapshot()).toMatchObject({ totalCostUsd: null, missingCosts: 1, remainingUsd: 0 });
  });

  it("rejects duplicate log IDs and cannot release another call", async () => {
    const h = harness({ maxCalls: 3 });
    expect((await h.session.judge(FAKE_JUDGE_INPUT)).score).toBe("correct");
    expect(await h.session.judge(FAKE_JUDGE_INPUT)).toMatchObject({ score: "error", costUsd: null });
    await expect(h.session.judge(FAKE_JUDGE_INPUT)).rejects.toThrow(/stopped/);
  });

  it("counts failures, rejects final-call overspend and enforces the next-call reserve", async () => {
    const logBody = log(); logBody.result.cost = 0.3;
    const h = harness({ logBody, maxBudgetUsd: 0.25 });
    expect(await h.session.judge(FAKE_JUDGE_INPUT)).toMatchObject({ score: "error", costUsd: 0.3, failureClass: "judge-cost-exceeds-authorization" });
    const capped = harness({ maxCalls: 1 });
    await capped.session.judge(FAKE_JUDGE_INPUT);
    await expect(capped.session.judge(FAKE_JUDGE_INPUT)).rejects.toThrow(/exhausted/);
    const reserve = harness({ maxBudgetUsd: 0.25 });
    await reserve.session.judge(FAKE_JUDGE_INPUT);
    await expect(reserve.session.judge(FAKE_JUDGE_INPUT)).rejects.toThrow(/exhausted/);
  });

  it("checkpoint failure before POST prevents inference; transport errors disclose no credentials", async () => {
    const h = harness({ checkpoint: async () => { throw new Error("host-only-test-token"); } });
    await expect(h.session.judge(FAKE_JUDGE_INPUT)).rejects.toThrow(/checkpoint failed/);
    expect(h.requests).toHaveLength(0);
    const broken = harness({ fetchOverride: async () => { throw new Error("host-only-test-token"); } });
    const result = await broken.session.judge(FAKE_JUDGE_INPUT);
    expect(result.costUsd).toBeNull(); expect(JSON.stringify(result)).not.toContain("host-only-test-token");
    expect(broken.requests).toHaveLength(1);
  });

  it("rejects unsupported streams even with a verdict, but settles their cost", async () => {
    const h = harness({ fetchOverride: async (_, options) => options.method === "GET" ? json(log()) : new Response("data: " + JSON.stringify(body()), { headers: { "content-type": "text/event-stream", "cf-aig-log-id": "log-1" } }) });
    expect(await h.session.judge(FAKE_JUDGE_INPUT)).toMatchObject({ score: "error", costUsd: 0.02 });
  });

  it("continues settled row failures only within the declared error-rate ceiling", async () => {
    let postCount = 0;
    const h = harness({ maxCalls: 3, maxJudgeErrorRate: 0.34, fetchOverride: async (_, options) => {
      if (options.method === "POST") {
        postCount++; const response = body(); response.status = "incomplete";
        return json(response, { headers: { "content-type": "application/json", "cf-aig-log-id": `log-${postCount}` } });
      }
      const value = log(); value.result.id = `log-${postCount}`; return json(value);
    } });
    expect((await h.session.judge(FAKE_JUDGE_INPUT)).score).toBe("error");
    expect(h.session.snapshot()).toMatchObject({ stopped: null, judgeErrorCount: 1, maxJudgeErrors: 1 });
    expect((await h.session.judge(FAKE_JUDGE_INPUT)).score).toBe("error");
    expect(h.session.snapshot().stopped).toBe("judge-error-rate-exceeded");
    await expect(h.session.judge(FAKE_JUDGE_INPUT)).rejects.toThrow(/stopped/);
    expect(postCount).toBe(2);
  });

  it("method failures halt even with a permissive row-error ceiling", async () => {
    const response = body(); response.output.push({ type: "function_call" });
    const h = harness({ response, maxJudgeErrorRate: 1 });
    await h.session.judge(FAKE_JUDGE_INPUT);
    await expect(h.session.judge(FAKE_JUDGE_INPUT)).rejects.toThrow(/stopped/);
  });

  it("missing log IDs and oversized bodies cannot produce a grade", async () => {
    const missing = harness({ fetchOverride: async () => json(body()) });
    expect(await missing.session.judge(FAKE_JUDGE_INPUT)).toMatchObject({ score: "error", costUsd: null });
    expect(missing.requests).toHaveLength(1);
    const large = harness({ fetchOverride: async (_, options) => options.method === "GET" ? json(log()) : new Response(" ".repeat(2 * 1024 * 1024 + 1), { headers: { "content-type": "application/json", "cf-aig-log-id": "log-1" } }) });
    expect(await large.session.judge(FAKE_JUDGE_INPUT)).toMatchObject({ score: "error", costUsd: 0.02 });
  });

  it("pins model, effort, gateway, environment, implementation and native Node", () => {
    // Vitest itself injects a loader into workers. Exercise the real production
    // guard in an uninstrumented Node child instead of bypassing that guard.
    const cleanIdentity = (value, env = {}) => {
      const child = spawnSync(process.execPath, ["--input-type=module", "-e",
        'import {gatewayJudgeIdentity} from "./eval/qa/gateway-judge.mjs"; const {config,env}=JSON.parse(process.argv[1]); try { console.log(JSON.stringify(gatewayJudgeIdentity(config,{env}))); } catch(error) { console.log(JSON.stringify({error:error.message})); }',
        JSON.stringify({ config: value, env })], { encoding: "utf8" });
      expect(child.status).toBe(0);
      const result = JSON.parse(child.stdout);
      if (result.error) throw new Error(result.error);
      return result;
    };
    const base = cleanIdentity(config);
    for (const change of [{ model: "gpt-6.1-terra", gatewayLogModel: "openai/gpt-6.1-terra" }, { effort: "low" }, { gatewayId: "other" }, { maxOutputTokens: 8192 }]) expect(cleanIdentity({ ...config, ...change }).sha256).not.toBe(base.sha256);
    expect(cleanIdentity(config, { HOME: "/different" }).sha256).not.toBe(base.sha256);
    expect(base.node.sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(base.requestTemplate).toMatchObject({ tools: [], tool_choice: "none" });
    expect(() => cleanIdentity(config, { NODE_OPTIONS: "--require malicious" })).toThrow(/NODE_OPTIONS/);
    expect(() => cleanIdentity(config, { HTTPS_PROXY: "https://proxy.test" })).toThrow(/HTTPS_PROXY/);
    expect(() => gatewayJudgeConfig({ ...config, accountId: "../escape" })).toThrow();
    expect(() => gatewayJudgeRequest("x".repeat(100001), config)).toThrow(/byte limit/);
  });
});

const dirs = [];
afterEach(() => { for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true }); });
describe("Gateway calibration runner", () => {
  function plan() {
    const directory = mkdtempSync(join(tmpdir(), "gateway-judge-test-")); dirs.push(directory);
    return { schema: "gateway-judge-plan-v1", mode: "calibration", allowNonIdentical: true, runId: "fixture-calibration", out: join(directory, "result.json"), config, identitySha256: identity.sha256, auth: { kind: "env", variable: "CF_AIG_TOKEN" }, maxCalls: 7, maxBudgetUsd: 2, maxJudgeErrorRate: 0 };
  }
  it("reuses all seven exact Claude inputs/prompts and refuses replay", async () => {
    const p = plan(); const prepared = prepareGatewayRejudge(p, { identityImpl: () => identity });
    expect(prepared.entries).toHaveLength(7);
    prepared.entries.forEach((entry, index) => {
      expect(entry.input).toEqual(judgeSelfTestFixture(index).input);
      expect(prepared.prompts[index].promptSha256).toBe(sha(buildJudgePrompt({ ...entry.input, transcriptEvidence: buildTranscriptEvidence(entry.input) })));
    });
    let count = 0;
    const fake = () => ({ judge: async (_, { id }) => { count++; const e = prepared.entries.find((entry) => entry.id === id).expectation; return { score: e.expect ?? "wrong", costUsd: 0.01 }; }, snapshot: () => ({ callsStarted: count, totalCostUsd: count * 0.01 }), assertIdentity() {} });
    const result = await runGatewayRejudge(p, prepared, { token: "unused", createJudge: fake });
    expect(result.meta.status).toBe("complete"); expect(count).toBe(7);
    expect(result.rows.every((row) => row.calibrationPass)).toBe(true);
    expect(JSON.parse(readFileSync(p.out))).toMatchObject({ nonPromotable: true, summary: null });
    await expect(runGatewayRejudge(p, prepared, { token: "unused", createJudge: fake })).rejects.toThrow();
    expect(count).toBe(7);
  });
  it("stops calibration after a mismatch and retains unattempted IDs", async () => {
    const p = plan(); const prepared = prepareGatewayRejudge(p, { identityImpl: () => identity });
    const result = await runGatewayRejudge(p, prepared, { token: "unused", createJudge: () => ({ judge: async () => ({ score: "wrong", costUsd: 0.01 }), snapshot: () => ({ callsStarted: 1 }), assertIdentity() {} }) });
    expect(result.meta.status).toBe("incomplete"); expect(result.rows).toHaveLength(1); expect(result.meta.unattemptedIds).toHaveLength(6);
  });
  it("requires exact call and identity authorization", () => {
    const p = plan();
    expect(() => prepareGatewayRejudge({ ...p, maxCalls: 8 }, { identityImpl: () => identity })).toThrow(/maxCalls/);
    expect(() => prepareGatewayRejudge({ ...p, identitySha256: "c".repeat(64) }, { identityImpl: () => identity })).toThrow(/identity/);
    expect(() => prepareGatewayRejudge({ ...p, auth: { kind: "subscription" } }, { identityImpl: () => identity })).toThrow(/standard Cloudflare/);
  });
  it("rejects a reformatted plan at authorization, before any credentials or inference", () => {
    const p = plan();
    const file = join(dirs.at(-1), "plan.json");
    const bytes = JSON.stringify(p, null, 2) + "\n";
    writeFileSync(file, bytes);
    expect(readGatewayJudgePlan(file, sha(bytes)).planSha256).toBe(sha(bytes));
    writeFileSync(file, JSON.stringify(p));
    expect(() => readGatewayJudgePlan(file, sha(bytes))).toThrow("authorized plan SHA-256 mismatch");
  });
});
